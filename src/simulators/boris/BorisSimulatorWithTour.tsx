/**
 * Boris Simulator with Tour Integration — the tour drives the simulator state.
 * Preserves the repo-wide tourCommand / onCommandHandled contract exactly.
 *
 * No `FaqMiniTourLauncher` here yet: it takes a `ClientFaq`, and Boris has no
 * bank in `src/data/faq/` (gap bor-01). Adding one later is an import and a
 * second child — the queue below already serves both callers, because a mini
 * tour and the main tour are the same engine.
 */

import { useState, useRef, useCallback } from 'react';
import { TourWrapper } from '../../components/tour';
import type { TourStep } from '../../components/tour';
import { borisTourConfig } from '../../data/tours';
import { BorisSimulator } from './BorisSimulator';
import type { SimulatorCommand } from './types';

export function BorisSimulatorWithTour() {
  const [commandQueue, setCommandQueue] = useState<SimulatorCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState<SimulatorCommand | null>(null);
  const lastStepRef = useRef<number>(-1);
  // Timers armed by the queue — a step change replaces the queue, but an
  // already-armed timer still holds the OLD one in its closure.
  const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearPendingTimers = useCallback(() => {
    pendingTimersRef.current.forEach(clearTimeout);
    pendingTimersRef.current = [];
  }, []);

  const handleCommandHandled = useCallback(() => {
    setCommandQueue((prev) => prev.slice(1));
    setCurrentCommand(null);

    const t = setTimeout(() => {
      if (commandQueue.length > 1) {
        setCurrentCommand(commandQueue[1]);
        setCommandQueue((prev) => prev.slice(1));
      }
    }, 100);
    pendingTimersRef.current.push(t);
  }, [commandQueue]);

  const queueCommands = useCallback(
    (commands: SimulatorCommand[]) => {
      clearPendingTimers();
      setCommandQueue(commands);
      if (commands.length > 0) {
        const t = setTimeout(() => setCurrentCommand(commands[0]), 50);
        pendingTimersRef.current.push(t);
      }
    },
    [clearPendingTimers],
  );

  const handleStepChange = useCallback(
    (stepIndex: number, _step: TourStep) => {
      if (lastStepRef.current === stepIndex) return;
      lastStepRef.current = stepIndex;

      // At most TWO commands per step — the queue drops the third, and it drops
      // it deterministically (docs/TOURS.md). Most steps send one, because every
      // command in Boris's union stands on its own: `highlight` opens the
      // article it marks, `openPane` and `playTts` open the reader first,
      // `openSettings` closes whatever else was up. The two pairs below are the
      // exceptions, and both are a SESSION plus a screen — the only thing a
      // single command cannot express.
      const stepCommands: Record<number, SimulatorCommand[]> = {
        // Welcome — reset to the state a first visitor actually arrives in.
        // `[]` would assume they have not signed in or wandered off, and Prev
        // from step 2 also lands here. `back` clears the session and every
        // overlay (BorisSimulator.tsx, case 'back').
        0: [{ type: 'back' }],
        1: [{ type: 'navigate', payload: 'home' }], // Home rows
        // The "Connect?" notice only exists while signed OUT, and by this point
        // the visitor may have arrived signed in — or walked back here with Prev
        // after step 5 signed them in. `back` restores the notice; without it
        // this step rings nothing.
        2: [{ type: 'back' }, { type: 'navigate', payload: 'home' }],
        3: [{ type: 'navigate', payload: 'home' }], // the card anchor lives on Home
        4: [{ type: 'openArticle', payload: 'infinite-scroll' }], // reader + meta chips
        // Sign in FIRST: the real toolbar only offers Highlight to a signed-in
        // reader (HighlightTextToolbar.kt:69), so marking a passage while signed
        // out would demonstrate something the app does not do. `highlight` then
        // opens its own article, so this pair is a session + an action, not two
        // navigations.
        5: [{ type: 'login' }, { type: 'highlight' }],
        6: [{ type: 'openPane', payload: 'highlights' }], // swarm highlights
        7: [{ type: 'playTts' }], // mini player + the teal follow-along mark
        8: [{ type: 'navigate', payload: 'feeds' }],
        9: [{ type: 'openSettings', payload: 'airplane' }], // the screen, not its row
        10: [], // outro — leave the visitor wherever they were
      };

      const commands = stepCommands[stepIndex] || [];
      if (commands.length > 0) queueCommands(commands);
    },
    [queueCommands],
  );

  return (
    <TourWrapper tourConfig={borisTourConfig} autoStart={false} onStepChange={handleStepChange}>
      <BorisSimulator tourCommand={currentCommand} onCommandHandled={handleCommandHandled} />
    </TourWrapper>
  );
}

export default BorisSimulatorWithTour;
