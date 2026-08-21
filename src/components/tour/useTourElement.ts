/**
 * Custom hook for managing tour element positioning
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TooltipRect, SpotlightRect } from './types';

/**
 * Split a selector LIST on its top-level commas, leaving commas that live
 * inside `[attr="a,b"]` or `:is(a, b)` alone.
 */
function splitSelectorList(selector: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;

  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (quote) {
      if (ch === quote && selector[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    else if (ch === ',' && depth === 0) {
      parts.push(selector.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(selector.slice(start));

  return parts.map((p) => p.trim()).filter(Boolean);
}

/**
 * Resolve a step's target, honouring the ORDER the step author wrote.
 *
 * `document.querySelector('a, b')` returns whichever match comes first in the
 * DOCUMENT, not the first selector that matches. Steps are written as
 * `'[data-tour="wisp-login"], .wisp-simulator'` meaning "the anchor, and the
 * whole app only as a fallback" — but the root is an ANCESTOR of the anchor, so
 * it always came first in document order and always won. Those steps
 * spotlighted the entire client instead of the control they were describing.
 */
function resolveTarget(selector: string): Element | null {
  const parts = splitSelectorList(selector);
  for (const part of parts) {
    try {
      const el = document.querySelector(part);
      if (el) return el;
    } catch {
      // A malformed alternative shouldn't kill the ones after it.
    }
  }
  return null;
}

/**
 * Mobile sims render inside a phone bezel with empty space either side. Knowing
 * where that bezel is lets the tooltip stay off the phone screen, so it never
 * covers the surface the step is talking about (or the field you must type in).
 */
function readFrameRect(element: Element): DOMRect | null {
  const frame = element.closest('.mobile-phone-frame-bezel');
  return frame ? frame.getBoundingClientRect() : null;
}

/**
 * Above this share of the viewport a "target" is not a control any more — it is
 * the whole client. Steps like `target: '.damus-simulator'` (25 of the 79 tour
 * steps) hit this. Cutting a spotlight hole that big removes the entire
 * backdrop, so nothing is dimmed, the ring is drawn off-screen, and the card has
 * nowhere to stand. Such steps are treated as intro/summary cards instead:
 * uniform dim, no ring, card centred on purpose.
 *
 * Necessary but NOT sufficient — see WHOLE_APP_CLIENT_SHARE.
 */
const WHOLE_APP_VIEWPORT_SHARE = 0.7;

/**
 * The same question asked of the CLIENT, and the one that actually separates
 * "the whole app" from "a big surface inside it". The viewport share cannot: on
 * a phone the client IS the viewport, so Wisp's zap sheet (375x573 filling 71%
 * of a 375x812 screen) read as the whole app and lost its ring, while the
 * identical mini-tour ringed correctly at 1280x900 — the card says "look here"
 * and nothing is marked.
 *
 * Measured 2026-08-21 at 375x812, as a share of the client: zap sheet 0.77,
 * Amethyst's account drawer 0.85 (the widest surface found that is still a
 * surface), and a step that really means the whole app 1.00 — checked on Wisp
 * and Amethyst, and 1.00 by construction for every framed client, because below
 * `sm` ClientView strips the bezel's padding and the simulator root fills it.
 *
 * Both tests must agree before a ring is suppressed, so this can only ADD rings,
 * never remove one: on a desktop the whole-client steps fail the viewport test
 * (0.22 of a 1280x900 window) and never reach this one.
 */
const WHOLE_APP_CLIENT_SHARE = 0.9;

/**
 * The client's own box: the phone bezel for framed clients, ClientView's
 * frameless stage for web ones. Both are host-declared handles that exist for
 * other consumers already (the tooltip's frame test below; the share-card
 * screenshot clip in scripts/og-client-cards.mjs).
 */
const CLIENT_BOX_SELECTOR = '.mobile-phone-frame-bezel, [data-sandstr-stage]';

/**
 * Does this rect account for nearly all of the client it lives in? Unknown box —
 * a target portalled out of the client, a host that stopped declaring one —
 * answers "yes" so the viewport test decides alone, which is what it did before
 * this pair existed.
 */
function coversClientBox(rect: DOMRect, element: Element | null): boolean {
  const box = element?.closest(CLIENT_BOX_SELECTOR)?.getBoundingClientRect();
  if (!box || box.width <= 0 || box.height <= 0) return true;
  return (rect.width * rect.height) / (box.width * box.height) >= WHOLE_APP_CLIENT_SHARE;
}

/**
 * When the "target" is the whole client its rect says nothing about what has to
 * stay reachable — and several of those steps are action-gated ("Login with a
 * test account to continue"), so parking a card in the middle of the app hides
 * the very control that unblocks the tour. Fall back to the bounding box of the
 * target's VISIBLE interactive descendants: that is what a step can plausibly
 * ask you to tap, and the card is placed clear of it.
 *
 * Returns null when there is nothing interactive, or when the controls are
 * spread so widely that no placement could clear them anyway.
 */
function interactiveBox(root: Element, vw: number, vh: number) {
  const nodes = root.querySelectorAll<HTMLElement>(
    'button, a[href], input, textarea, select, [role="button"], [role="link"], [role="tab"]'
  );

  let top = Infinity, left = Infinity, right = -Infinity, bottom = -Infinity;
  let found = 0;

  // Bounded: a feed can hold hundreds of buttons and this runs on every
  // recompute for whole-app steps.
  const limit = Math.min(nodes.length, 60);
  for (let i = 0; i < limit; i++) {
    const r = nodes[i].getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) continue;
    top = Math.min(top, r.top);
    left = Math.min(left, r.left);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
    found++;
  }

  if (!found) return null;
  // Still effectively the whole screen — no placement clears it, so let the
  // caller treat the step as a plain intro card.
  if ((right - left) * (bottom - top) >= vw * vh * 0.85) return null;

  return { top, left, right, bottom };
}

interface Geometry { top: number; left: number; width: number; height: number }

const geom = (r: DOMRect): Geometry => ({ top: r.top, left: r.left, width: r.width, height: r.height });

/** Sub-pixel jitter from scroll/zoom must not count as a change. */
function sameGeometry(a: Geometry | null, b: Geometry | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  );
}

interface UseTourElementResult {
  targetRect: DOMRect | null;
  spotlightRect: SpotlightRect | null;
  tooltipRect: TooltipRect | null;
  targetCenter: { x: number; y: number } | null;
  /** Target is really the whole client — render an intro card, not a spotlight. */
  coversViewport: boolean;
  scrollToElement: () => void;
  /**
   * Bumped whenever the RESOLVED element changes identity. A step whose command
   * creates its own target (toggle a mode, mount a screen) keeps the previous
   * step's rect until the new node appears, so "did a target show up" cannot be
   * read off the rect being non-null — see the scroll effect in TourOverlay.
   */
  targetEpoch: number;
}

export function useTourElement(
  targetSelector: string,
  position: string,
  padding: number = 8,
  // Real rendered size of the tooltip, measured by the tooltip itself. Step copy
  // varies a lot in length (the cards run 200-300px tall), so a hardcoded guess
  // makes the fit math wrong: the card ends up clipped by the viewport bottom or
  // yanked back on top of the element it is describing.
  measuredSize?: { width: number; height: number } | null
): UseTourElementResult {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  // Bounds of the phone bezel the target lives in, when there is one.
  const [frameRect, setFrameRect] = useState<DOMRect | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const observedElementRef = useRef<Element | null>(null);
  // Mirrors of the last committed geometry. getBoundingClientRect() hands back a
  // NEW object every call, so setting state unconditionally re-rendered on every
  // observed mutation — and the overlay's own writes are observed mutations.
  const lastRectRef = useRef<Geometry | null>(null);
  const lastFrameRef = useRef<Geometry | null>(null);
  // Browser timer handle — `NodeJS.Timeout` only resolves with @types/node, which
  // this (browser-only) project does not depend on.
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  // Identity of whatever is currently resolved, and a counter the overlay can
  // depend on. Rect equality is not enough: two different nodes can share a
  // geometry, and a stale rect from the previous step looks identical to "the
  // new target is already here".
  const resolvedElementRef = useRef<Element | null>(null);
  const [targetEpoch, setTargetEpoch] = useState(0);

  const calculateRects = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Guard against empty selectors
    if (!targetSelector || targetSelector.trim() === '') {
      setTargetRect(null);
      return;
    }

    const element = resolveTarget(targetSelector);
    if (!element) {
      resolvedElementRef.current = null;
      if (lastRectRef.current !== null) {
        lastRectRef.current = null;
        setTargetRect(null);
      }
      if (lastFrameRef.current !== null) {
        lastFrameRef.current = null;
        setFrameRect(null);
      }
      return;
    }

    if (resolvedElementRef.current !== element) {
      resolvedElementRef.current = element;
      setTargetEpoch((n) => n + 1);
    }

    const rect = element.getBoundingClientRect();
    const next = geom(rect);
    if (!sameGeometry(lastRectRef.current, next)) {
      lastRectRef.current = next;
      setTargetRect(rect);
    }

    const frame = readFrameRect(element);
    const nextFrame = frame ? geom(frame) : null;
    if (!sameGeometry(lastFrameRef.current, nextFrame)) {
      lastFrameRef.current = nextFrame;
      setFrameRect(frame);
    }

    // Keep the ResizeObserver pointed at whatever is currently resolved: a
    // command-driven step swaps the target mid-step (login screen → feed).
    if (resizeObserverRef.current && observedElementRef.current !== element) {
      if (observedElementRef.current) {
        resizeObserverRef.current.unobserve(observedElementRef.current);
      }
      resizeObserverRef.current.observe(element);
      observedElementRef.current = element;
    }
  }, [targetSelector]);

  /**
   * Coalesce every observer/scroll/resize callback into one measurement per
   * frame. Measuring straight inside a ResizeObserver callback made that
   * callback change layout, which the browser reports as
   * "ResizeObserver loop completed with undelivered notifications" — a real
   * console error, and a sign the tour was re-measuring several times a frame
   * while the simulators animate.
   */
  const scheduleRecalc = useCallback(() => {
    if (typeof window === 'undefined' || rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      calculateRects();
    });
  }, [calculateRects]);

  const calculateRectsWithRetry = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Guard against empty selectors
    if (!targetSelector || targetSelector.trim() === '') {
      setTargetRect(null);
      return;
    }

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    retryCountRef.current = 0;

    const attemptFind = () => {
      const element = resolveTarget(targetSelector);

      if (element) {
        // Element found - calculate rects and reset retry count
        calculateRects();
        retryCountRef.current = 0;
        return true;
      }

      // Element not found - retry with delay if we haven't exceeded max retries
      if (retryCountRef.current < 10) {
        retryCountRef.current++;
        const delay = Math.min(50 * retryCountRef.current, 500); // Progressive delay: 50ms, 100ms, 150ms... max 500ms
        retryTimeoutRef.current = setTimeout(attemptFind, delay);
      } else {
        // Target genuinely absent after all retries — clear the rect so the
        // overlay degrades to a centered tooltip over a SOFT dim (see
        // TourOverlay) instead of highlighting a stale/mismatched element.
        // The MutationObserver below stays armed, so a target that mounts even
        // later still gets picked up.
        setTargetRect(null);
        setFrameRect(null);
      }

      return false;
    };

    attemptFind();
  }, [targetSelector, calculateRects]);

  const scrollToElement = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Guard against empty selectors
    if (!targetSelector || targetSelector.trim() === '') return;

    const element = resolveTarget(targetSelector);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    // Nothing to scroll to when the target already fills (or exceeds) the
    // viewport: `block: 'center'` on a full-height feed yanked the client's
    // timeline ~2400px for no visual gain. Same when it is already fully
    // visible — scrolling then only makes the spotlight chase a moving target.
    const fullyVisible =
      rect.top >= 0 && rect.bottom <= window.innerHeight &&
      rect.left >= 0 && rect.right <= window.innerWidth;
    if (fullyVisible || rect.height >= window.innerHeight) return;

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      // NOT `inline: 'center'`: horizontal centring dragged Primal's three-column
      // layout sideways whenever a step pointed at the left nav.
      inline: 'nearest',
    });
  }, [targetSelector]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Guard against empty selectors
    if (!targetSelector || targetSelector.trim() === '') {
      setTargetRect(null);
      return;
    }

    // Clear the previous step's rect immediately so we never spotlight a stale
    // element while the new target is being resolved.
    setTargetRect(null);
    observedElementRef.current = null;
    lastRectRef.current = null;
    lastFrameRef.current = null;

    // Initial calculation with retry - allows React time to render new elements
    calculateRectsWithRetry();

    // Set up observers for ongoing updates
    observerRef.current = new MutationObserver((records) => {
      // The overlay is portaled into <body>, so its OWN writes (the card's
      // inline position, the progress fill width, the visible class) come back
      // through this observer. Reacting to them is a render loop — React #185,
      // a white screen. Only react to mutations in the page under the tour.
      for (const record of records) {
        const node = record.target;
        const el = node.nodeType === 1 ? (node as Element) : node.parentElement;
        if (el && el.closest('.tour-overlay')) continue;
        scheduleRecalc();
        return;
      }
    });

    resizeObserverRef.current = new ResizeObserver(() => {
      scheduleRecalc();
    });

    // Observe unconditionally. This used to be deferred 100ms AND gated on the
    // element already existing — so for command-driven steps, whose target
    // mounts 150-2000ms later, the observers were never attached at all and a
    // step that outran the retry ladder stayed blank until the user moved on.
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    // Window events
    const handleScroll = () => scheduleRecalc();
    const handleResize = () => scheduleRecalc();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      observerRef.current?.disconnect();
      resizeObserverRef.current?.disconnect();
      observedElementRef.current = null;
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [targetSelector, calculateRects, calculateRectsWithRetry, scheduleRecalc]);

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;

  // Both shares, and the client one only when the viewport one already passed:
  // it reads layout, and the common case is a small target that fails on the
  // cheap test first.
  const coversViewport = targetRect
    ? (targetRect.width * targetRect.height) / (vw * vh) >= WHOLE_APP_VIEWPORT_SHARE &&
      coversClientBox(targetRect, resolvedElementRef.current)
    : false;

  // The overlay is position:fixed, so the spotlight lives in VIEWPORT
  // coordinates. getBoundingClientRect() is already viewport-relative — adding
  // window.scroll* double-counts the scroll, which pushed the spotlight (and the
  // backdrop's clip-path hole) off the target and left an undimmed band on top.
  const spotlightRect: SpotlightRect | null =
    targetRect && !coversViewport
      ? {
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
          padding,
        }
      : null;

  const tooltipRect: TooltipRect | null = (() => {
    const margin = 16;
    const offset = 16;
    // Viewport-aware fallback so the very first paint (before the card reports
    // its size) doesn't overflow a phone-width screen.
    const tooltipWidth = measuredSize?.width || Math.min(320, vw - margin * 2);
    const tooltipHeight = measuredSize?.height || 220;

    const fullHeight = Math.max(180, vh - margin * 2);
    const centred = {
      top: Math.max(margin, Math.round(vh / 2 - tooltipHeight / 2)),
      left: Math.max(margin, Math.round(vw / 2 - tooltipWidth / 2)),
      width: tooltipWidth,
      height: tooltipHeight,
      maxHeight: fullHeight,
    };

    // No resolvable target: centre the card deliberately. Returning null used to
    // hide the tooltip entirely and strand the user on a blank dark screen.
    if (!targetRect) return centred;

    // Does the target leave room for a card beside it at all? Deliberately a
    // GEOMETRIC test with a constant, never "did a card of the current height
    // fit" — the latter depends on the height we are about to choose, and a
    // decision that depends on its own outcome makes the card flicker.
    const MIN_CARD_HEIGHT = 240;
    const roomAboveRaw = targetRect.top - padding - margin;
    const roomBelowRaw = vh - margin - (targetRect.bottom + padding);
    // True for the 25 steps aimed at a whole client, and for web clients whose
    // feed column fills the page: there is no free band, so the card has to work
    // INSIDE the client's own rect and aim to clear its controls instead.
    const targetDominates = Math.max(roomAboveRaw, roomBelowRaw) < MIN_CARD_HEIGHT;

    /**
     * Host chrome the card must not sit on — today the mandated SIMULATION
     * banner, which outranks the card in z-order, so an overlap rendered as two
     * texts printed over each other. Advisory for side placements: if no
     * placement can clear both these and the target, clearing the target wins.
     */
    const keepClear =
      typeof document !== 'undefined'
        ? Array.from(document.querySelectorAll('[data-tour-keep-clear]'))
            .map((el) => el.getBoundingClientRect())
            .filter((r) => r.width > 0 && r.height > 0)
            .map((r) => ({ top: r.top - 8, left: r.left - 8, right: r.right + 8, bottom: r.bottom + 8 }))
        : [];

    // Vertical band the card may occupy.
    //
    // Chrome pinned to the TOP of the viewport pushes the band down for EVERY
    // step, not just whole-client ones: the docking fallback ignores horizontal
    // placement, so a narrow target low on the screen would otherwise dock the
    // card at y=16 — straight under the banner. That is exactly what happened
    // the first time the Amethyst login anchor was narrowed.
    // "Near the top" is a quarter of the viewport, not a few pixels: the host's
    // banner sits BELOW its own top bar (measured at y=45 on a 812px phone), so
    // a tight threshold matched nothing and the card docked under it anyway.
    const chromeBottom = keepClear.reduce(
      (acc, b) => (b.top < vh * 0.25 ? Math.max(acc, b.bottom) : acc),
      0
    );
    const bandTop = Math.max(
      margin,
      chromeBottom,
      targetDominates ? targetRect.top + 8 : 0
    );
    const bandBottom = targetDominates ? Math.min(vh - margin, targetRect.bottom - 8) : vh - margin;

    const maxLeft = vw - tooltipWidth - margin;
    const maxTop = bandBottom - tooltipHeight;
    // Nothing fits anywhere on a viewport this small — centring is the least-bad
    // answer and every branch below would clamp to it regardless.
    if (maxLeft < margin && maxTop < margin) return centred;

    // The padded target: the card must clear the highlight, not just the element.
    // For whole-client targets the highlight is meaningless, so clear the
    // controls instead — otherwise an action-gated step covers the button it is
    // telling you to press.
    let t = {
      top: targetRect.top - padding,
      left: targetRect.left - padding,
      right: targetRect.right + padding,
      bottom: targetRect.bottom + padding,
    };

    if (targetDominates) {
      const el = resolveTarget(targetSelector);
      const box = el ? interactiveBox(el, vw, vh) : null;
      // Genuinely nothing to work around (welcome/outro screens): a centred
      // intro card is the honest presentation.
      if (!box) return centred;
      t = {
        top: box.top - padding,
        left: box.left - padding,
        right: box.right + padding,
        bottom: box.bottom + padding,
      };
    }

    // Free room on each side of the target, computed BEFORE any placement is
    // chosen and only from card-independent quantities (the target box and the
    // band). That independence is the whole point: a figure derived from the
    // card's own measured height changes the height, which changes which
    // placement wins, which changes the figure — the card flickers between two
    // sizes forever.
    const roomAbove = t.top - bandTop;
    const roomBelow = bandBottom - t.bottom;

    const clampLeft = (l: number) => Math.max(margin, Math.min(l, Math.max(margin, maxLeft)));
    const clampTop = (tp: number) => Math.max(bandTop, Math.min(tp, Math.max(bandTop, maxTop)));

    // Align on whatever we are actually avoiding (`t`), which is the interactive
    // box rather than the element rect on whole-client steps.
    const alignedLeft = clampLeft((t.left + t.right) / 2 - tooltipWidth / 2);
    const alignedTop = clampTop((t.top + t.bottom) / 2 - tooltipHeight / 2);

    const overlaps = (top: number, left: number, box: { top: number; left: number; right: number; bottom: number }) =>
      left < box.right && left + tooltipWidth > box.left &&
      top < box.bottom && top + tooltipHeight > box.top;

    /** Does this placement sit clear of the padded target? */
    const clears = (top: number, left: number) => !overlaps(top, left, t);

    const clearsChrome = (top: number, left: number) =>
      keepClear.every((box) => !overlaps(top, left, box));

    /**
     * The same card in the same column, slid vertically until it clears the
     * keep-clear chrome. Null when no height in that column can.
     *
     * The beside-the-frame branch below used to vary `left` and nothing else, so
     * on a desktop where NEITHER gutter is free of the banner at the aligned
     * height it fell through to "first side that fits" and parked the card under
     * it — and the banner outranks the card in z-order, so the overlap rendered
     * as the mandated SIMULATION text stamped across the step copy. The gutter
     * is 290px of empty column; the card just has to move up or down inside it.
     */
    const slideClearOfChrome = (left: number, preferredTop: number): number | null => {
      const lo = margin;
      const hi = Math.max(margin, vh - margin - Math.min(tooltipHeight, fullHeight));
      const clamp = (v: number) => Math.max(lo, Math.min(v, hi));
      const blocking = keepClear.filter((b) => left < b.right && left + tooltipWidth > b.left);
      if (blocking.length === 0) return clamp(preferredTop);
      // Just above / just below each blocker, tried nearest-to-preferred first so
      // the card moves as little as the chrome forces it to.
      const tops = blocking.flatMap((b) => [b.top - tooltipHeight - offset, b.bottom + offset]);
      return (
        [...new Set(tops.map(clamp))]
          .sort((a, b) => Math.abs(a - preferredTop) - Math.abs(b - preferredTop))
          .find((tp) => clearsChrome(tp, left)) ?? null
      );
    };

    const candidates: Record<string, { top: number; left: number } | null> = {
      top: t.top - offset - tooltipHeight >= bandTop
        ? { top: t.top - offset - tooltipHeight, left: alignedLeft }
        : null,
      bottom: t.bottom + offset + tooltipHeight <= bandBottom
        ? { top: t.bottom + offset, left: alignedLeft }
        : null,
      left: t.left - offset - tooltipWidth >= margin
        ? { top: alignedTop, left: t.left - offset - tooltipWidth }
        : null,
      right: t.right + offset + tooltipWidth <= vw - margin
        ? { top: alignedTop, left: t.right + offset }
        : null,
    };

    // Ask for what the step wanted first, then its opposite, then the rest.
    const opposite: Record<string, string> = {
      top: 'bottom', bottom: 'top', left: 'right', right: 'left',
    };
    const preferred = opposite[position] ? position : 'bottom';
    const order = [
      preferred,
      opposite[preferred],
      ...['bottom', 'top', 'right', 'left'].filter(
        (p) => p !== preferred && p !== opposite[preferred]
      ),
    ];

    // Inside a phone frame, getting out of the frame beats every in-frame
    // placement: it is the only way to leave the reproduction fully visible.
    if (frameRect) {
      const besideFrame = [frameRect.right + offset, frameRect.left - tooltipWidth - offset]
        .filter((l) => l >= margin && l <= maxLeft);
      const besideTop = Math.max(margin, Math.min(alignedTop, vh - margin - Math.min(tooltipHeight, fullHeight)));
      const beside = (top: number, left: number) => ({
        top: Math.round(top),
        left: Math.round(left),
        width: tooltipWidth,
        height: tooltipHeight,
        // Beside the device the card has the whole viewport height, so the
        // band-derived ceiling above does not apply — using it squeezed a
        // desktop card down to its title. Safe to differ: this branch is
        // chosen on WIDTH alone, so a taller card cannot flip the decision.
        maxHeight: fullHeight,
      });
      // Three passes, loosening one constraint at a time — the same shape as the
      // generic placement below. A gutter already clear of the host chrome wins
      // outright; failing that one that clears it after a vertical slide; and
      // only then any gutter at all, because being out of the frame still beats
      // covering the reproduction the step is pointing at.
      for (const left of besideFrame) {
        if (clearsChrome(besideTop, left)) return beside(besideTop, left);
      }
      for (const left of besideFrame) {
        const top = slideClearOfChrome(left, besideTop);
        if (top !== null) return beside(top, left);
      }
      if (besideFrame.length > 0) return beside(besideTop, besideFrame[0]);
    }

    /**
     * Vertical room each placement leaves the card. Card-INDEPENDENT (derived
     * from the target box and the band only), so using it to rank placements
     * cannot feed back into the card's height. A side placement gets the whole
     * band because it is chosen on width.
     */
    const bandFor: Record<string, number> = {
      top: t.top - bandTop,
      bottom: bandBottom - t.bottom,
      left: bandBottom - bandTop,
      right: bandBottom - bandTop,
    };
    // Below this a card is title-plus-buttons with the copy scrolled away.
    const LEGIBLE = 240;
    // And below THIS it is not a card at all. Measured on Wisp's feed step at
    // 430x775: a 180px band left the scrolling body 25px tall against 140px of
    // copy, so the step's text was not clipped — it was simply gone, with no
    // scrollbar to say so, and the action band sat across the title. A squeezed
    // placement is worse than the dock: docking costs some of the target, and
    // the target is still on screen, whereas the words are not.
    const UNUSABLE = 200;

    // Three passes, loosening one constraint at a time: clear the host chrome
    // AND leave room to read; then just clear the chrome; then just clear the
    // target. Without the first pass the author's `position` won even when it
    // squeezed the card to a sliver — Snort's timeline step sat in a 174px band
    // above a note while the whole right-hand column stood empty.
    for (const pass of [0, 1, 2]) {
      for (const name of order) {
        const c = candidates[name];
        if (!c || !clears(c.top, c.left)) continue;
        if (pass < 2 && !clearsChrome(c.top, c.left)) continue;
        if (pass === 0 && bandFor[name] < LEGIBLE) continue;
        if (bandFor[name] < UNUSABLE) continue;
        return {
          top: Math.round(c.top),
          left: Math.round(c.left),
          width: tooltipWidth,
          height: tooltipHeight,
          // The ceiling belongs to the placement that won, not to the roomiest
          // one: a side placement gets the whole band, so capping it with the
          // above/below figure shrank a desktop card for no reason.
          maxHeight: Math.max(UNUSABLE, Math.min(fullHeight, bandFor[name] - offset)),
        };
      }
    }

    // Nothing clears the target — it fills the screen with controls. Dock the
    // card to the viewport edge with more room so the target stays as visible as
    // it can. The old code fell through to `top = target centre`, i.e. it parked
    // the card squarely on the thing the step was pointing at: the single
    // biggest source of "the tour covers the simulator".
    //
    // The ceiling is the BAND, and deliberately not the free room above/below:
    // this branch has already given up on clearing the target, so the room it
    // could not fit in is the one figure that must not size it. Measured on
    // Wisp's zap mini-tour at 375x812 (2026-08-21): 20px of free room floored to
    // a 180px card whose scrolling body was 25px against 140px of copy — the
    // step's words absent, the action band printed across the title, i.e. the
    // exact defect UNUSABLE exists to prevent, reached by the one path that
    // never consults it. Band-derived, so still card-independent and still
    // unable to feed back into the placement.
    const dockBelow = roomBelow >= roomAbove;

    return {
      top: Math.round(dockBelow ? Math.max(bandTop, maxTop) : bandTop),
      left: clampLeft(alignedLeft),
      width: tooltipWidth,
      height: tooltipHeight,
      maxHeight: Math.max(UNUSABLE, Math.min(fullHeight, bandBottom - bandTop)),
    };
  })();

  // Calculate target center position for arrow positioning
  const targetCenter = targetRect && tooltipRect
    ? {
        x: targetRect.left + targetRect.width / 2 - tooltipRect.left,
        y: targetRect.top + targetRect.height / 2 - tooltipRect.top,
      }
    : null;

  return {
    targetRect,
    spotlightRect,
    tooltipRect,
    targetCenter,
    coversViewport,
    scrollToElement,
    targetEpoch,
  };
}
