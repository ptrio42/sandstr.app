/**
 * Tour Tooltip Component
 * Displays tour step information with auto-positioning
 *
 * This card is the ONLY piece of tour chrome that moves with the step, so it
 * also carries the progress bar and the Prev/Next/Skip controls. Those used to
 * be `position: fixed` siblings anchored to the viewport — and the viewport
 * centre is exactly where the phone frame stands, so they sat on top of the
 * reproduction they were meant to explain.
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTour } from './TourProvider';
import { useTourElement } from './useTourElement';
import { TourProgress } from './TourProgress';
import { TourControls } from './TourControls';
import { X, MousePointer, ArrowRight } from 'lucide-react';

/** Touch devices have no arrow keys — don't promise them one. */
function useHasKeyboard(): boolean {
  const [hasKeyboard, setHasKeyboard] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(pointer: fine)');
    const on = () => setHasKeyboard(mql.matches);
    on();
    mql.addEventListener('change', on);
    return () => mql.removeEventListener('change', on);
  }, []);
  return hasKeyboard;
}

export function TourTooltip() {
  const { state, currentStepData, endTour } = useTour();
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const hasKeyboard = useHasKeyboard();

  const targetSelector = currentStepData?.target ?? '';
  const position = currentStepData?.position ?? 'bottom';
  const padding = currentStepData?.spotlightPadding ?? 8;

  const { tooltipRect } = useTourElement(targetSelector, position, padding, size);

  // Feed the card's real size back into the placement math. Step copy varies in
  // length, so the height is only knowable after render; the 150ms fade-in below
  // means the corrected position lands before the card is visible.
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    if (!size || Math.abs(size.height - height) > 1 || Math.abs(size.width - width) > 1) {
      setSize({ width, height });
    }
  });

  // Animation delay
  useEffect(() => {
    if (state.isActive && currentStepData) {
      setIsVisible(false);
      const timer = setTimeout(() => setIsVisible(true), 150);
      return () => clearTimeout(timer);
    }
  }, [state.isActive, currentStepData, state.currentStep]);

  if (!state.isActive || !currentStepData || !tooltipRect) {
    return null;
  }

  const stepNumber = state.currentStep + 1;
  const totalSteps = state.totalSteps;

  // Determine if this step is waiting for an action
  const isWaitingForAction = state.waitingForAction && currentStepData.trigger === 'action';

  return (
    <div
      ref={cardRef}
      className={[
        'tour-tooltip',
        `tour-tooltip--${position}`,
        isVisible ? 'tour-tooltip--visible' : '',
        // Squeezed into a short band (the card is capped so it can't grow back
        // over the control the step is about). Give the copy the room instead of
        // the decorations. Keyed off maxHeight, which does not depend on the
        // card's own size, so this can't feed back into the placement.
        tooltipRect.maxHeight < 320 ? 'tour-tooltip--compact' : '',
      ].filter(Boolean).join(' ')}
      style={{
        position: 'absolute',
        top: tooltipRect.top,
        left: tooltipRect.left,
        maxHeight: tooltipRect.maxHeight,
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Header */}
      <div className="tour-tooltip__header">
        <span className="tour-tooltip__badge">
          {stepNumber} / {totalSteps}
        </span>
        <button
          className="tour-tooltip__close"
          onClick={() => endTour(true)}
          aria-label="Skip tour"
          title="Skip tour (ESC)"
        >
          <X size={16} />
        </button>
      </div>

      <TourProgress />

      {/* Content */}
      <div className="tour-tooltip__content">
        <h3 className="tour-tooltip__title">{currentStepData.title}</h3>
        <p className="tour-tooltip__text">{currentStepData.content}</p>
      </div>

      {/* Action hint - shows different UI based on trigger type */}
      {isWaitingForAction ? (
        <div className="tour-tooltip__action tour-tooltip__action--waiting">
          <span className="tour-tooltip__action-icon"><MousePointer size={16} /></span>
          <span className="tour-tooltip__action-text">
            Do this in the app to continue
          </span>
        </div>
      ) : currentStepData.action ? (
        <div className="tour-tooltip__action">
          <span className="tour-tooltip__action-icon">👆</span>
          <span>{currentStepData.action}</span>
        </div>
      ) : (
        <div className="tour-tooltip__action tour-tooltip__action--next">
          <span className="tour-tooltip__action-icon"><ArrowRight size={16} /></span>
          <span className="tour-tooltip__action-text">
            {/* Name the button that is actually there. The last step's button
                says "Finish", and a touch device has no → key. */}
            {stepNumber === totalSteps
              ? (hasKeyboard ? 'Click Finish or press → to end the tour' : 'Tap Finish to end the tour')
              : (hasKeyboard ? 'Click Next or press → to continue' : 'Tap Next to continue')}
          </span>
        </div>
      )}

      <TourControls />
    </div>
  );
}
