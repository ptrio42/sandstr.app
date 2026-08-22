import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Text selection for the reader, done by hand instead of by the browser
 * (upstream: `ui/reader/ReaderSelection.kt:205-261`).
 *
 * **Why not native selection.** It shipped that way and it is broken on a
 * phone. Long-pressing text hands the gesture to the BROWSER: its own handles,
 * its own callout bar (Copy · Share · Select all · Web search). That bar is
 * browser chrome, not page content, so it draws on top of Boris's toolbar and
 * cannot be styled or suppressed from CSS on either iOS or Android. Worse, the
 * visitor then adjusts the selection by dragging the browser's handles, which
 * fires no event on our element at all, so the toolbar never even re-reads. The
 * result on a real phone was the system menu instead of Boris's — which is to
 * say, instead of the one control this whole client exists to demonstrate.
 *
 * Doing it ourselves is also the more faithful answer. The real Boris shows
 * exactly ONE toolbar over a selection and it is its own `HighlightTextToolbar`;
 * a second, platform-supplied bar is an artefact of the web, not a feature of
 * the app.
 *
 * **The look is measured, not invented** (2026-08-22 recording, t=48.5, on the
 * `midnight` scheme over `#18171A`):
 *  - selection fill `#35366F` = `primary` `#6366F1` at **40%** — solving for
 *    alpha gives 0.387 / 0.392 / 0.395 on the three channels. Android tints the
 *    selection with `colorPrimary`, so both values below come off Boris's own
 *    token and stay correct in the light scheme for free.
 *  - handles `#6264EF` = the same `primary` at full alpha, a **30 px circle**
 *    on a 2.625-density device = 12 dp. Start handle rides above-left of the
 *    first line, end handle below-right of the last.
 */

export interface ReaderSelectionRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface ReaderSelectionState {
  text: string;
  /** Painted bands, in BODY coordinates. */
  rects: ReaderSelectionRect[];
  /** Where the toolbar should sit, in ROOT coordinates — see ReaderScreen. */
  toolbarTop: number;
  /** Toolbar centre, in ROOT coordinates. */
  toolbarCenter: number;
}

type Point = { node: Node; offset: number };

/** Long-press gate, upstream's `viewConfig.longPressTimeoutMillis`. */
const LONG_PRESS_MS = 500;
/** How far a finger may wander before a long-press is treated as a scroll. */
const SLOP_PX = 10;

/**
 * Pointer capture, defensively. `releasePointerCapture` throws when the pointer
 * was never captured, and both calls can arrive for an element that has since
 * unmounted (leave the reader mid-drag).
 */
function capture(el: Element | null, pointerId: number) {
  try {
    (el as HTMLElement | null)?.setPointerCapture?.(pointerId);
  } catch {
    /* the pointer is already gone; the drag simply ends */
  }
}
function release(el: Element | null, pointerId: number) {
  try {
    const node = el as HTMLElement | null;
    if (node?.hasPointerCapture?.(pointerId)) node.releasePointerCapture(pointerId);
  } catch {
    /* as above */
  }
}

function caretAt(x: number, y: number): Point | null {
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
  };
  if (typeof doc.caretRangeFromPoint === 'function') {
    const r = doc.caretRangeFromPoint(x, y);
    if (r) return { node: r.startContainer, offset: r.startOffset };
  }
  if (typeof doc.caretPositionFromPoint === 'function') {
    const p = doc.caretPositionFromPoint(x, y);
    if (p) return { node: p.offsetNode, offset: p.offset };
  }
  return null;
}

/**
 * Snap to word boundaries. Android extends by word first and the recording
 * shows word granularity throughout ("I go in, walk through" at t=46, the whole
 * of `"Soup kitchen," she says.` at t=70), and on a touch screen it is the
 * difference between a gesture that lands and one that fights you.
 */
function wordEdge(p: Point, side: 'start' | 'end'): Point {
  if (p.node.nodeType !== Node.TEXT_NODE) return p;
  const text = p.node.textContent ?? '';
  const word = (ch: string | undefined) => ch !== undefined && !/\s/.test(ch);
  let o = Math.max(0, Math.min(p.offset, text.length));
  if (side === 'start') {
    while (o > 0 && word(text[o - 1])) o -= 1;
  } else {
    while (o < text.length && word(text[o])) o += 1;
  }
  return { node: p.node, offset: o };
}

function orderedRange(a: Point, b: Point): Range | null {
  try {
    const probe = document.createRange();
    probe.setStart(a.node, a.offset);
    probe.setEnd(a.node, a.offset);
    const other = document.createRange();
    other.setStart(b.node, b.offset);
    other.setEnd(b.node, b.offset);
    const forward = probe.compareBoundaryPoints(Range.START_TO_START, other) <= 0;
    const from = forward ? a : b;
    const to = forward ? b : a;
    const r = document.createRange();
    r.setStart(...(([from.node, from.offset] as unknown) as [Node, number]));
    r.setEnd(...(([to.node, to.offset] as unknown) as [Node, number]));
    return r;
  } catch {
    return null;
  }
}

export function useReaderSelection(
  bodyRef: React.RefObject<HTMLDivElement | null>,
  rootRef: React.RefObject<HTMLDivElement | null>,
) {
  const [selection, setSelection] = useState<ReaderSelectionState | null>(null);
  const anchorRef = useRef<Point | null>(null);
  const rangeRef = useRef<Range | null>(null);
  /** 'idle' · 'armed' (finger down, long-press pending) · 'selecting' */
  const modeRef = useRef<'idle' | 'armed' | 'selecting'>('idle');
  const draggingHandleRef = useRef<'start' | 'end' | null>(null);
  const timerRef = useRef<number | null>(null);
  const downAtRef = useRef<{ x: number; y: number } | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  /** Recompute the painted geometry from the live range. */
  const measure = useCallback(() => {
    const range = rangeRef.current;
    const body = bodyRef.current;
    const root = rootRef.current;
    if (!range || !body || !root) {
      setSelection(null);
      return;
    }
    const text = range.toString().trim();
    if (!text) {
      setSelection(null);
      return;
    }
    const bodyBox = body.getBoundingClientRect();
    const rootBox = root.getBoundingClientRect();
    const rects = Array.from(range.getClientRects())
      .filter((r) => r.width > 0 && r.height > 0)
      .map((r) => ({
        top: r.top - bodyBox.top,
        left: r.left - bodyBox.left,
        width: r.width,
        height: r.height,
      }));
    if (rects.length === 0) {
      setSelection(null);
      return;
    }
    const box = range.getBoundingClientRect();
    setSelection({
      text,
      rects,
      toolbarTop: box.top - rootBox.top,
      toolbarCenter: box.left + box.width / 2 - rootBox.left,
    });
  }, [bodyRef, rootRef]);

  const clear = useCallback(() => {
    rangeRef.current = null;
    anchorRef.current = null;
    modeRef.current = 'idle';
    draggingHandleRef.current = null;
    clearTimer();
    setSelection(null);
  }, []);

  const beginAt = useCallback(
    (x: number, y: number) => {
      const p = caretAt(x, y);
      if (!p || !bodyRef.current?.contains(p.node)) return false;
      const start = wordEdge(p, 'start');
      const end = wordEdge(p, 'end');
      anchorRef.current = start;
      rangeRef.current = orderedRange(start, end);
      modeRef.current = 'selecting';
      measure();
      return true;
    },
    [bodyRef, measure],
  );

  const extendTo = useCallback(
    (x: number, y: number) => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const p = caretAt(x, y);
      if (!p || !bodyRef.current?.contains(p.node)) return;
      // Which end moves depends on which side of the anchor the finger is.
      const probe = orderedRange(anchor, p);
      if (!probe) return;
      const forwards = probe.startContainer === anchor.node && probe.startOffset === anchor.offset;
      const moving = wordEdge(p, forwards ? 'end' : 'start');
      const next = orderedRange(anchor, moving);
      if (next) {
        rangeRef.current = next;
        measure();
      }
    },
    [bodyRef, measure],
  );

  /** Re-measure while the article scrolls or the window resizes under a live selection. */
  useLayoutEffect(() => {
    if (!selection) return;
    const onChange = () => measure();
    window.addEventListener('resize', onChange);
    const scroller = bodyRef.current?.closest('[data-boris-scroll]') ?? null;
    scroller?.addEventListener('scroll', onChange, { passive: true });
    return () => {
      window.removeEventListener('resize', onChange);
      scroller?.removeEventListener('scroll', onChange);
    };
  }, [selection, measure, bodyRef]);

  useEffect(() => () => clearTimer(), []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const handle = (e.target as HTMLElement).dataset?.borisHandle as 'start' | 'end' | undefined;
      if (handle) {
        // Grabbing a handle re-anchors on the OTHER end and drags this one.
        const range = rangeRef.current;
        if (range) {
          anchorRef.current =
            handle === 'start'
              ? { node: range.endContainer, offset: range.endOffset }
              : { node: range.startContainer, offset: range.startOffset };
          draggingHandleRef.current = handle;
          modeRef.current = 'selecting';
          capture(e.currentTarget, e.pointerId);
          e.preventDefault();
        }
        return;
      }

      downAtRef.current = { x: e.clientX, y: e.clientY };
      if (e.pointerType === 'mouse') {
        if (e.button !== 0) return;
        // Mouse selects on drag, so arm and let the first move commit it — a
        // plain click must stay a click (it dismisses an open selection).
        modeRef.current = 'armed';
        return;
      }
      // Touch and pen go through the long-press gate, so a scroll stays a
      // scroll. Do NOT preventDefault here or the article stops scrolling.
      modeRef.current = 'armed';
      clearTimer();
      // Read everything off the event NOW. `currentTarget` is only set while
      // the event is propagating and is null by the time a timer fires — that
      // is a throw inside the long-press callback, and it does not stop the
      // selection from appearing, so it is invisible unless you read a fresh
      // console.
      const { clientX, clientY, pointerId } = e;
      const target = e.currentTarget;
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        if (modeRef.current !== 'armed') return;
        if (beginAt(clientX, clientY)) capture(target, pointerId);
      }, LONG_PRESS_MS);
    },
    [beginAt],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (modeRef.current === 'armed') {
        const at = downAtRef.current;
        if (!at) return;
        const moved = Math.hypot(e.clientX - at.x, e.clientY - at.y);
        if (e.pointerType === 'mouse') {
          if (moved > 3) {
            if (beginAt(at.x, at.y)) {
              capture(e.currentTarget, e.pointerId);
              extendTo(e.clientX, e.clientY);
            } else {
              modeRef.current = 'idle';
            }
          }
          return;
        }
        // A finger that wanders before the timer fires is scrolling, not selecting.
        if (moved > SLOP_PX) {
          clearTimer();
          modeRef.current = 'idle';
        }
        return;
      }
      if (modeRef.current !== 'selecting') return;
      e.preventDefault();
      extendTo(e.clientX, e.clientY);
    },
    [beginAt, extendTo],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      clearTimer();
      const wasSelecting = modeRef.current === 'selecting';
      draggingHandleRef.current = null;
      modeRef.current = wasSelecting ? 'idle' : 'idle';
      release(e.currentTarget, e.pointerId);
      if (!wasSelecting) {
        // A tap with a selection up dismisses it, which is what the platform does.
        if (rangeRef.current) clear();
      }
    },
    [clear],
  );

  const onPointerCancel = useCallback(() => {
    clearTimer();
    modeRef.current = 'idle';
    draggingHandleRef.current = null;
  }, []);

  return {
    selection,
    clear,
    /** Spread onto the reader's body wrapper. */
    bodyProps: {
      // `user-select`, `-webkit-touch-callout` and `position` come from the
      // stylesheet (.boris-reader-body in boris.theme.css) — Chrome drops
      // `-webkit-touch-callout` from an inline style object, so setting it here
      // would ship nothing to the one engine that reads it.
      className: 'boris-reader-body',
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      // Only while a selection is live: a permanent `touch-action: none` would
      // make the article unscrollable on a phone.
      style: { touchAction: selection ? 'none' : undefined } as React.CSSProperties,
    },
  };
}

/**
 * The painted selection: `primary` at 40% behind the glyphs, plus the two
 * round handles. Bands are `pointer-events: none` so a drag passes through to
 * the body; the handles are not, so they can be grabbed.
 */
export function ReaderSelectionOverlay({ selection }: { selection: ReaderSelectionState | null }) {
  if (!selection || selection.rects.length === 0) return null;
  const first = selection.rects[0];
  const last = selection.rects[selection.rects.length - 1];
  const HANDLE = 12; // dp, measured 30px at density 2.625

  return (
    <>
      {selection.rects.map((r, i) => (
        <div
          key={i}
          aria-hidden
          className="pointer-events-none absolute rounded-[2px]"
          style={{
            top: r.top,
            left: r.left,
            width: r.width,
            height: r.height,
            background: 'color-mix(in srgb, var(--boris-primary) 40%, transparent)',
          }}
        />
      ))}
      <span
        data-boris-handle="start"
        aria-hidden
        className="absolute rounded-full"
        style={{
          top: first.top - HANDLE / 2,
          left: first.left - HANDLE / 2,
          width: HANDLE,
          height: HANDLE,
          background: 'var(--boris-primary)',
          touchAction: 'none',
        }}
      />
      <span
        data-boris-handle="end"
        aria-hidden
        className="absolute rounded-full"
        style={{
          top: last.top + last.height - HANDLE / 2,
          left: last.left + last.width - HANDLE / 2,
          width: HANDLE,
          height: HANDLE,
          background: 'var(--boris-primary)',
          touchAction: 'none',
        }}
      />
    </>
  );
}
