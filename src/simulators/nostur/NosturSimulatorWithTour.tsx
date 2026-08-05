/**
 * Nostur Simulator with Tour Integration — the tour drives the simulator state.
 * Preserves the repo-wide tourCommand / onCommandHandled contract exactly.
 */

import React, { useState, useRef, useCallback } from 'react';
import { TourWrapper } from '../../components/tour';
import { nosturTourConfig } from '../../data/tours';
import { NosturSimulator } from './NosturSimulator';
import type { SimulatorCommand } from './types';

export function NosturSimulatorWithTour() {
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

      // ONE command per step. The shared queue only reliably carries the first
      // (see the tour gotchas), so every command in NosturSimulator signs in on
      // its own rather than needing a paired { type: 'login' } ahead of it.
      const stepCommands: Record<number, SimulatorCommand[]> = {
        0: [], // Welcome
        1: [], // Sign in — the welcome sheet is the default unauthenticated view
        2: [{ type: 'openFeed', payload: 'Following' }], // Three feeds
        3: [{ type: 'openFeed', payload: 'Following' }], // The turtle
        4: [{ type: 'openFeed', payload: 'Following' }], // Action row
        5: [{ type: 'zap' }], // Send sats
        6: [{ type: 'openDrawer' }], // Side menu
        7: [{ type: 'openSettings' }], // Settings
        8: [], // Complete
      };

      const commands = stepCommands[stepIndex] || [];
      if (commands.length > 0) {
        queueCommands(commands);
      }
    },
    [queueCommands],
  );

  return (
    <TourWrapper tourConfig={nosturTourConfig} autoStart={false} onStepChange={handleStepChange}>
      <NosturSimulator tourCommand={currentCommand} onCommandHandled={handleCommandHandled} />
    </TourWrapper>
  );
}

export default NosturSimulatorWithTour;
