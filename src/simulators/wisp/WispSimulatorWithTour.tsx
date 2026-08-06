/**
 * Wisp Simulator with Tour Integration — tour drives the simulator state.
 * Preserves the repo-wide tourCommand / onCommandHandled contract exactly.
 */

import React, { useState, useRef, useCallback } from 'react';
import { TourWrapper } from '../../components/tour';
import type { TourStep } from '../../components/tour';
import { FaqMiniTourLauncher, isFaqStepId } from '../../components/faq/FaqMiniTourLauncher';
import { wispFaq } from '../../data/faq/wisp';
import { wispTourConfig } from '../../data/tours';
import { WispSimulator } from './WispSimulator';
import type { SimulatorCommand } from './types';

export function WispSimulatorWithTour() {
  const [commandQueue, setCommandQueue] = useState<SimulatorCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState<SimulatorCommand | null>(null);
  const lastStepRef = useRef<number>(-1);
  // Step-id → commands for the ACTIVE FAQ mini-tour, set at launch.
  const faqCommandsRef = useRef<Record<string, unknown[]>>({});
  // Timers armed by the queue — a step change replaces the queue but an
  // already-armed timer still holds the OLD one in its closure.
  const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearPendingTimers = useCallback(() => {
    pendingTimersRef.current.forEach(clearTimeout);
    pendingTimersRef.current = [];
  }, []);
  const isProcessingRef = useRef(false);

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
      const t = setTimeout(() => {
        setCurrentCommand(commands[0]);
      }, 50);
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

      // FAQ mini-tour steps carry their own commands (set at launch); the map
      // below belongs to the main wisp-tour only.
      if (isFaqStepId(step.id)) {
        const commands = (faqCommandsRef.current[step.id] ?? []) as SimulatorCommand[];
        if (commands.length > 0) queueCommands(commands);
        return;
      }

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
      <FaqMiniTourLauncher faq={wispFaq} onLaunch={handleFaqLaunch} />
    </TourWrapper>
  );
}

export default WispSimulatorWithTour;
