/**
 * Nostur Simulator with Tour Integration — the tour drives the simulator state.
 * Preserves the repo-wide tourCommand / onCommandHandled contract exactly.
 */

import React, { useState, useRef, useCallback } from 'react';
import { TourWrapper } from '../../components/tour';
import type { TourStep } from '../../components/tour';
import { FaqMiniTourLauncher, isFaqStepId } from '../../components/faq/FaqMiniTourLauncher';
import { nosturTourConfig } from '../../data/tours';
import { nosturFaq } from '../../data/faq/nostur';
import { NosturSimulator } from './NosturSimulator';
import type { SimulatorCommand } from './types';

export function NosturSimulatorWithTour() {
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

      // FAQ mini-tour steps carry their own commands (set at launch); the
      // index map below belongs to the main nostur-tour only.
      if (isFaqStepId(step.id)) {
        const commands = (faqCommandsRef.current[step.id] ?? []) as SimulatorCommand[];
        if (commands.length > 0) {
          queueCommands(commands);
        }
        return;
      }

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
      <FaqMiniTourLauncher faq={nosturFaq} onLaunch={handleFaqLaunch} />
    </TourWrapper>
  );
}

export default NosturSimulatorWithTour;
