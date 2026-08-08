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

  const { spotlightRect, coversViewport, scrollToElement } = useTourElement(
    targetSelector,
    position,
    padding
  );

  // Auto-scroll to element on step change. Keyed on target AVAILABILITY, not
  // just the step: command-driven steps mount their target ~150-200ms after
  // the step becomes active (login → open drawer → row exists), so a one-shot
  // scroll fired into a not-yet-mounted element and below-the-fold targets
  // (e.g. a drawer row) stayed out of view. The boolean dep re-fires the
  // scroll exactly once when the rect first resolves, and stays inert while
  // the rect merely updates during user scrolling.
  const targetFound = spotlightRect !== null;
  useEffect(() => {
    if (state.isActive && currentStepData && targetFound) {
      const timer = setTimeout(() => {
        scrollToElement();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [state.isActive, currentStepData, scrollToElement, targetFound]);

  // Keyboard navigation
  useEffect(() => {
    if (!state.isActive) return;

    // Don't allow keyboard navigation if waiting for action
    const isWaitingForAction = state.waitingForAction && currentStepData?.trigger === 'action';

    const handleKeyDown = (e: KeyboardEvent) => {
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
        className={[
          'tour-backdrop',
          currentStepData?.allowClickThrough ? 'tour-backdrop--click-through' : '',
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
