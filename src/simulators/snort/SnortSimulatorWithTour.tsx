/**
 * Snort Simulator with Tour Integration
 *
 * The tour drives the simulator: each step maps to a short list of state
 * commands which the base component applies.
 *
 * The command-queue interface below (`tourCommand` / `onCommandHandled`, and
 * the `SimulatorCommand` shape) is load-bearing — the guided tour breaks if it
 * changes. Two constraints worth knowing before editing the step map:
 *   - a step may queue AT MOST 2 commands; a third races the queue and is
 *     silently dropped,
 *   - a step must not open an overlay that would cover its own spotlight target.
 */

import React, { useCallback, useRef, useState } from 'react';
import { TourWrapper } from '../../components/tour';
import type { TourStep } from '../../components/tour';
import { FaqMiniTourLauncher, isFaqStepId } from '../../components/faq/FaqMiniTourLauncher';
import { snortTourConfig } from '../../data/tours';
import { snortFaq } from '../../data/faq/snort';
import { SnortSimulator as SnortSimulatorBase } from './SnortSimulator';
import type { SimulatorCommand } from './SnortSimulator';

export type { SimulatorCommand };

export function SnortSimulatorWithTour() {
  const [commandQueue, setCommandQueue] = useState<SimulatorCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState<SimulatorCommand | null>(null);
  const lastStepRef = useRef<number>(-1);
  const isProcessingRef = useRef(false);
  // Step-id → commands for the ACTIVE FAQ mini-tour, set at launch. A ref, not
  // state: handleStepChange reads it synchronously right after launch.
  const faqCommandsRef = useRef<Record<string, unknown[]>>({});
  // Timers armed by the queue. A step change replaces the queue, but an
  // already-armed timer still holds the OLD queue in its closure — left alive
  // it would dispatch a dropped step's command after the new step's command.
  const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearPendingTimers = useCallback(() => {
    pendingTimersRef.current.forEach(clearTimeout);
    pendingTimersRef.current = [];
  }, []);

  const handleCommandHandled = useCallback(() => {
    setCommandQueue((prev) => prev.slice(1));
    setCurrentCommand(null);
    isProcessingRef.current = false;

    const t = setTimeout(() => {
      if (commandQueue.length > 1) {
        const nextCmd = commandQueue[1];
        setCurrentCommand(nextCmd);
        setCommandQueue((prev) => prev.slice(1));
      }
    }, 100);
    pendingTimersRef.current.push(t);
  }, [commandQueue]);

  const queueCommands = useCallback((commands: SimulatorCommand[]) => {
    clearPendingTimers();
    setCommandQueue(commands);
    if (commands.length > 0) {
      const t = setTimeout(() => setCurrentCommand(commands[0]), 50);
      pendingTimersRef.current.push(t);
    }
  }, [clearPendingTimers]);

  const handleFaqLaunch = useCallback((commandsByStepId: Record<string, unknown[]>) => {
    faqCommandsRef.current = commandsByStepId;
    // New mini-tour, fresh dedup — relaunching the same entry reuses indices.
    lastStepRef.current = -1;
  }, []);

  const handleStepChange = useCallback(
    (stepIndex: number, step: TourStep) => {
      if (lastStepRef.current === stepIndex) return;
      lastStepRef.current = stepIndex;

      // FAQ mini-tour steps carry their own commands (set at launch); the
      // index map below belongs to the main snort-tour only.
      if (isFaqStepId(step.id)) {
        const commands = (faqCommandsRef.current[step.id] ?? []) as SimulatorCommand[];
        if (commands.length > 0) queueCommands(commands);
        return;
      }

      const stepCommands: Record<number, SimulatorCommand[]> = {
        0: [], // Welcome
        // Login — force the signed-out screen. `[]` assumed the visitor arrives
        // logged out, but they can sign in before starting the tour, and Prev
        // from step 3 also lands here signed in — either way the login anchor
        // is unmounted and the step used to render as an empty dark screen.
        // Amethyst and Keychat already did this; the idiom just was not copied.
        1: [{ type: 'logout' }],
        2: [{ type: 'login' }, { type: 'navigate', payload: 'timeline' }], // Home feed
        // Compose: highlight the rail's "New Note" button. Do NOT open the
        // modal here — it would cover the very target being spotlighted.
        3: [{ type: 'login' }, { type: 'navigate', payload: 'timeline' }],
        // Post: open the composer so its Send button (the target) exists.
        // Two commands, because a third would race the queue.
        4: [{ type: 'login' }, { type: 'compose' }],
        5: [{ type: 'login' }, { type: 'viewProfile' }], // Profile (own)
        // Follow: view somebody else, since the Follow button only renders on
        // another user's profile.
        6: [{ type: 'login' }, { type: 'viewProfile', payload: 'other' }],
        7: [{ type: 'login' }, { type: 'navigate', payload: 'timeline' }], // Interactions
        8: [{ type: 'login' }, { type: 'navigate', payload: 'settings' }], // Settings
        9: [], // Complete
      };

      const commands = stepCommands[stepIndex] || [];
      if (commands.length > 0) queueCommands(commands);
    },
    [queueCommands],
  );

  return (
    <TourWrapper tourConfig={snortTourConfig} autoStart={false} onStepChange={handleStepChange}>
      <SnortSimulatorBase tourCommand={currentCommand} onCommandHandled={handleCommandHandled} />
      <FaqMiniTourLauncher faq={snortFaq} onLaunch={handleFaqLaunch} />
    </TourWrapper>
  );
}

export default SnortSimulatorWithTour;
