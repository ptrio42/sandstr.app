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
import { snortTourConfig } from '../../data/tours';
import { SnortSimulator as SnortSimulatorBase } from './SnortSimulator';

export interface SimulatorCommand {
  type: 'login' | 'navigate' | 'compose' | 'post' | 'viewProfile';
  payload?: any;
}

export function SnortSimulatorWithTour() {
  const [commandQueue, setCommandQueue] = useState<SimulatorCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState<SimulatorCommand | null>(null);
  const lastStepRef = useRef<number>(-1);
  const isProcessingRef = useRef(false);

  const handleCommandHandled = useCallback(() => {
    setCommandQueue((prev) => prev.slice(1));
    setCurrentCommand(null);
    isProcessingRef.current = false;

    setTimeout(() => {
      if (commandQueue.length > 1) {
        const nextCmd = commandQueue[1];
        setCurrentCommand(nextCmd);
        setCommandQueue((prev) => prev.slice(1));
      }
    }, 100);
  }, [commandQueue]);

  const queueCommands = useCallback((commands: SimulatorCommand[]) => {
    setCommandQueue(commands);
    if (commands.length > 0) {
      setTimeout(() => setCurrentCommand(commands[0]), 50);
    }
  }, []);

  const handleStepChange = useCallback(
    (stepIndex: number) => {
      if (lastStepRef.current === stepIndex) return;
      lastStepRef.current = stepIndex;

      const stepCommands: Record<number, SimulatorCommand[]> = {
        0: [], // Welcome
        1: [], // Login — manual, the login screen is already the initial state
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
    </TourWrapper>
  );
}

export default SnortSimulatorWithTour;
