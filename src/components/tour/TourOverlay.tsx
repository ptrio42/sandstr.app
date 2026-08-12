/**
 * Tour Overlay Component
 * Provides the dark backdrop with spotlight effect
 * Uses portal to render outside simulator containers
 */

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTour } from './TourProvider';
import { TourTooltip } from './TourTooltip';
import { useTourElement } from './useTourElement';

/**
 * Keys the tour claims. Escape is handled separately: it must work even while
 * the user is typing, because it is the way out of the tour.
 */
const NAV_KEYS = ['ArrowRight', 'ArrowLeft', 'Enter'];

/**
 * Any host dialog the visitor opened on purpose — the FAQ panel, the ⌘K
 * palette, the About sheet, the mobile client switcher. Each stamps
 * `data-sandstr-modal` on its dialog element; they portal into <body>, so a
 * DOM probe is the only thing that works from inside the tour engine (which
 * deliberately knows nothing about the host).
 *
 * Such a dialog sits ABOVE the tour in the stacking order (`--z-host-modal` vs
 * `--z-tour-*` in src/index.css), so it is the surface being driven and the
 * tour must not read the keyboard at all while one is up. Escape is the case
 * that bit: both listeners are on `window`, so dismissing the FAQ also ended
 * the tour underneath it. Enter is the same bug one key over — it would expand
 * an FAQ answer AND advance the step.
 */
const HOST_MODAL_SELECTOR = '[data-sandstr-modal]';

/** Is the user typing into the simulator right now? */
function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || typeof el.closest !== 'function') return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable ||
    !!el.closest('[contenteditable="true"]')
  );
}

export function TourOverlay() {
  const { state, currentStepData, endTour, goToNextStep, goToPreviousStep } = useTour();

  const targetSelector = currentStepData?.target ?? '';
  const position = currentStepData?.position ?? 'bottom';
  const padding = currentStepData?.spotlightPadding ?? 8;

  const { spotlightRect, coversViewport, scrollToElement, targetEpoch } = useTourElement(
    targetSelector,
    position,
    padding
  );

  // Auto-scroll to element on step change. Keyed on target IDENTITY, not just
  // the step: command-driven steps mount their target ~150-200ms after the step
  // becomes active (login → open drawer → row exists), so a one-shot scroll
  // fired into a not-yet-mounted element and below-the-fold targets (e.g. a
  // drawer row) stayed out of view.
  //
  // `targetEpoch` rather than "is the rect non-null": when a step's own command
  // CREATES its target, the previous step's rect is still standing, so the
  // rect never goes null → non-null and an availability dep never re-fires.
  // Measured case — Nostur's Low Data demo: toggling the mode mints six
  // "Loading paused" blocks, the first one ~1200px down a 775px viewport, and
  // the spotlight ended up a 4px sliver at the bottom edge because nothing
  // scrolled. The epoch changes the moment a different node resolves, which is
  // exactly when a scroll is owed.
  useEffect(() => {
    if (state.isActive && currentStepData && spotlightRect !== null) {
      // Three attempts, not one. `scrollToElement` no-ops when the target is
      // already fully visible, so the extra passes are free — and they are the
      // difference between working and not on a screen whose content is still
      // laying out: Coracle's Content Settings mounts its scroll container
      // before it has anything to scroll, so a single 100ms attempt scrolled
      // nothing and the ring stayed a 4px sliver at the bottom edge.
      const timers = [100, 500, 1200].map((d) => setTimeout(() => scrollToElement(), d));
      return () => timers.forEach(clearTimeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- spotlightRect is
    // read, not depended on: it updates on every user scroll and would re-fire
    // the scroll continuously. targetEpoch is the intended trigger.
  }, [state.isActive, currentStepData, scrollToElement, targetEpoch]);

  // Keyboard navigation
  useEffect(() => {
    if (!state.isActive) return;

    // Don't allow keyboard navigation if waiting for action
    const isWaitingForAction = state.waitingForAction && currentStepData?.trigger === 'action';

    const handleKeyDown = (e: KeyboardEvent) => {
      // A host dialog is on top: it owns the keyboard, all of it. See
      // HOST_MODAL_SELECTOR above.
      if (document.querySelector(HOST_MODAL_SELECTOR)) return;
      // Never take keys away from a field the user is typing in. Without this,
      // ArrowLeft/ArrowRight jumped the tour instead of moving the caret and
      // Enter skipped a step instead of inserting a newline — on the very steps
      // ("Write something interesting and hit post!") that ask you to type.
      if (NAV_KEYS.includes(e.key) && isEditableTarget(e.target)) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          // Don't advance with keyboard when waiting for action
          if (isWaitingForAction) {
            e.preventDefault();
            return;
          }
          e.preventDefault();
          goToNextStep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPreviousStep();
          break;
        case 'Escape':
          e.preventDefault();
          endTour(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isActive, state.waitingForAction, currentStepData?.trigger, goToNextStep, goToPreviousStep, endTour]);

  // Prevent body scroll when tour is active
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (state.isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [state.isActive]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    // Only close if clicking the overlay background itself
    if (e.target === e.currentTarget) {
      // Don't close on background click, require explicit action
    }
  }, []);

  if (!state.isActive || !currentStepData) {
    return null;
  }

  // Calculate clip path for spotlight effect. Clamped to the viewport: an
  // unclamped hole for a tall feed produced a 5000px+ polygon whose edges fell
  // off-screen, leaving a stripe of the page undimmed.
  const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;

  const hole = spotlightRect
    ? {
        left: Math.max(0, spotlightRect.left - spotlightRect.padding),
        top: Math.max(0, spotlightRect.top - spotlightRect.padding),
        right: Math.min(vw, spotlightRect.left + spotlightRect.width + spotlightRect.padding),
        bottom: Math.min(vh, spotlightRect.top + spotlightRect.height + spotlightRect.padding),
      }
    : null;

  const clipPath = hole
    ? `polygon(
        0% 0%,
        0% 100%,
        ${hole.left}px 100%,
        ${hole.left}px ${hole.top}px,
        ${hole.right}px ${hole.top}px,
        ${hole.right}px ${hole.bottom}px,
        ${hole.left}px ${hole.bottom}px,
        ${hole.left}px 100%,
        100% 100%,
        100% 0%
      )`
    : undefined;

  // Two cases end up without a spotlight, and they should not look like a
  // blackout: the target is the whole client (an intro/summary step), or it has
  // not resolved yet. Dim gently instead of dropping a 75%-black sheet with no
  // hole in it — that read as "the page broke".
  const softBackdrop = !spotlightRect;

  const overlay = (
    <div
      className="tour-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Guided Tour"
    >
      {/* Dark backdrop with spotlight */}
      <div
        // No `--click-through` class: it set `pointer-events: none` on an
        // element that already inherits exactly that from `.tour-overlay`, so it
        // implied a per-step choice the engine never made. See the note on
        // TourStep.allowClickThrough in types.ts.
        className={[
          'tour-backdrop',
          softBackdrop ? 'tour-backdrop--soft' : '',
          coversViewport ? 'tour-backdrop--whole-app' : '',
        ].filter(Boolean).join(' ')}
        style={{
          clipPath: clipPath,
        }}
      />

      {/* Spotlight border */}
      {spotlightRect && hole && (
        <div
          className="tour-spotlight"
          style={{
            position: 'absolute',
            top: hole.top,
            left: hole.left,
            width: Math.max(0, hole.right - hole.left),
            height: Math.max(0, hole.bottom - hole.top),
          }}
        />
      )}

      {/* Tooltip — carries the step copy, the progress and the Prev/Next/Skip
          controls. They used to be separate fixed-position elements pinned to
          the middle and the corners of the VIEWPORT, which is exactly where the
          phone stands: the controls bar covered ~half of every client's bottom
          tab bar and ate taps meant for it. */}
      <TourTooltip />
    </div>
  );

  // Use portal to render outside simulator containers
  if (typeof document !== 'undefined') {
    return createPortal(overlay, document.body);
  }

  return null;
}
