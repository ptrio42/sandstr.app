/**
 * Wisp Simulator with Tour Integration — tour drives the simulator state.
 * Preserves the repo-wide tourCommand / onCommandHandled contract exactly.
 */

import React, { useState, useRef, useCallback } from 'react';
import { TourWrapper } from '../../components/tour';
import { wispTourConfig } from '../../data/tours';
import { WispSimulator } from './WispSimulator';
import type { SimulatorCommand } from './types';

export function WispSimulatorWithTour() {
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
      setTimeout(() => {
        setCurrentCommand(commands[0]);
      }, 50);
    }
  }, []);

  const handleStepChange = useCallback(
    (stepIndex: number) => {
      if (lastStepRef.current === stepIndex) return;
      lastStepRef.current = stepIndex;

      // Max 2 commands per step — the queue drops the third (see tour gotchas).
      const stepCommands: Record<number, SimulatorCommand[]> = {
        0: [], // Welcome
        1: [], // Login — splash is the default unauthenticated view
        2: [{ type: 'login' }, { type: 'navigate', payload: 'home' }], // Feed
        3: [{ type: 'login' }, { type: 'navigate', payload: 'home' }], // Feed selector
        4: [{ type: 'login' }, { type: 'navigate', payload: 'home' }], // Compose FAB stays mounted
        5: [{ type: 'login' }, { type: 'compose' }], // Publish — composer open so the button exists
        6: [{ type: 'login' }, { type: 'viewProfile' }], // Profile
        7: [{ type: 'login' }, { type: 'navigate', payload: 'wallet' }], // Wallet
        8: [{ type: 'login' }, { type: 'openSettings' }], // Settings (Interface)
        9: [], // Complete
      };

      const commands = stepCommands[stepIndex] || [];
      if (commands.length > 0) {
        queueCommands(commands);
      }
    },
    [queueCommands],
  );

  return (
    <TourWrapper
      tourConfig={wispTourConfig}
      autoStart={false}
      onStepChange={handleStepChange}
    >
      <WispSimulator tourCommand={currentCommand} onCommandHandled={handleCommandHandled} />
    </TourWrapper>
  );
}

export default WispSimulatorWithTour;
