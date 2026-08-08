/**
 * Tour Controls Component
 * Next/Prev/Skip buttons for tour navigation
 *
 * Rendered INSIDE the tooltip card (see TourTooltip). As a free-floating
 * `position: fixed` bar centred on the viewport it landed on the phone frame:
 * measured at 375x812 it covered 49% of Nostur's tab bar and hit-testing the
 * tabs returned the tour bar, so taps meant for the client hit Prev/Skip.
 */

import React from 'react';
import { useTour } from './TourProvider';
import { ChevronLeft, ChevronRight, SkipForward, RotateCcw, MousePointer, Check } from 'lucide-react';

export function TourControls() {
  const { state, goToNextStep, goToPreviousStep, endTour, restartTour, currentStepData } = useTour();

  if (!state.isActive) {
    return null;
  }

  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === state.totalSteps - 1;

  // Determine if this step is waiting for an action
  const isWaitingForAction = state.waitingForAction && currentStepData?.trigger === 'action';

  return (
    <div className="tour-controls">
      {/* Left side - Navigation */}
      <div className="tour-controls__nav">
        <button
          className="tour-controls__btn tour-controls__btn--secondary"
          onClick={goToPreviousStep}
          disabled={isFirstStep}
          aria-label="Previous step"
          title="Previous (←)"
        >
          <ChevronLeft size={18} />
          <span className="tour-controls__btn-text">Prev</span>
        </button>

        {isWaitingForAction ? (
          <button
            className="tour-controls__btn tour-controls__btn--waiting"
            disabled
            aria-label="Waiting for action"
            title="Waiting for action..."
          >
            <MousePointer size={18} />
            <span className="tour-controls__btn-text">Waiting…</span>
          </button>
        ) : (
          <button
            className="tour-controls__btn tour-controls__btn--primary"
            onClick={goToNextStep}
            aria-label={isLastStep ? 'Finish tour' : 'Next step'}
            title={isLastStep ? 'Finish' : 'Next (→)'}
          >
            {/* The icon is NOT conditional. When it was, the last step rendered
                only a label — and the label is the first thing that gets tight
                on a phone, so "Finish" measured 16x36px of blank button. */}
            <span className="tour-controls__btn-text">
              {isLastStep ? 'Finish' : 'Next'}
            </span>
            {isLastStep ? <Check size={18} /> : <ChevronRight size={18} />}
          </button>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="tour-controls__actions">
        <button
          className="tour-controls__btn tour-controls__btn--ghost"
          onClick={() => endTour(true)}
          aria-label="Skip tour"
          title="Skip (ESC)"
        >
          <SkipForward size={16} />
          <span className="tour-controls__btn-text">Skip</span>
        </button>

        {state.hasCompleted || state.hasSkipped ? (
          <button
            className="tour-controls__btn tour-controls__btn--ghost"
            onClick={() => restartTour()}
            aria-label="Restart tour"
            title="Restart"
          >
            <RotateCcw size={16} />
            <span className="tour-controls__btn-text">Restart</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
