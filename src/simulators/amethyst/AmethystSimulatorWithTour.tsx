/**
 * Amethyst Simulator with Tour Integration
 * Tour drives the simulator state
 */

import React, { useState, useRef, useCallback } from 'react';
import { TourWrapper } from '../../components/tour';
import type { TourStep } from '../../components/tour';
import { FaqMiniTourLauncher, isFaqStepId } from '../../components/faq/FaqMiniTourLauncher';
import { amethystTourConfig } from '../../data/tours';
import { amethystFaq } from '../../data/faq/amethyst';
import { AmethystSimulator as AmethystSimulatorBase } from './index';

export interface SimulatorCommand {
  type: 'login' | 'navigate' | 'compose' | 'post' | 'viewProfile' | 'back' | 'openSettings' | 'openDrawer';
  payload?: any;
}

export function AmethystSimulatorWithTour() {
  const [commandQueue, setCommandQueue] = useState<SimulatorCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState<SimulatorCommand | null>(null);
  const lastStepRef = useRef<number>(-1);
  const isProcessingRef = useRef(false);
  // Step-id → commands for the ACTIVE FAQ mini-tour, set at launch. A ref, not
  // state: handleStepChange reads it synchronously right after launch.
  const faqCommandsRef = useRef<Record<string, unknown[]>>({});
  // Timers armed by the queue. A step change replaces the queue, but an
  // already-armed timer still holds the OLD queue in its closure — left alive
  // it would dispatch a dropped step's second command after the new step's
  // command (same fix as the Damus wrapper).
  const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearPendingTimers = useCallback(() => {
    pendingTimersRef.current.forEach(clearTimeout);
    pendingTimersRef.current = [];
  }, []);

  const processNextCommand = useCallback(() => {
    if (isProcessingRef.current || commandQueue.length === 0) return;

    isProcessingRef.current = true;
    const nextCmd = commandQueue[0];
    setCurrentCommand(nextCmd);
  }, [commandQueue]);

  const handleCommandHandled = useCallback(() => {
    setCommandQueue(prev => prev.slice(1));
    setCurrentCommand(null);
    isProcessingRef.current = false;

    const t = setTimeout(() => {
      if (commandQueue.length > 1) {
        const nextCmd = commandQueue[1];
        setCurrentCommand(nextCmd);
        setCommandQueue(prev => prev.slice(1));
      }
    }, 100);
    pendingTimersRef.current.push(t);
  }, [commandQueue]);

  const queueCommands = useCallback((commands: SimulatorCommand[]) => {
    console.log('[AmethystSimulator] Queueing commands:', commands);
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

  const handleStepChange = useCallback((stepIndex: number, step: TourStep) => {
    if (lastStepRef.current === stepIndex) {
      console.log('[AmethystSimulator] Ignoring duplicate step:', stepIndex);
      return;
    }
    lastStepRef.current = stepIndex;

    console.log('[AmethystSimulator] Tour step changed to:', stepIndex);

    // FAQ mini-tour steps carry their own commands (set at launch); the
    // index map below belongs to the main amethyst-tour only.
    if (isFaqStepId(step.id)) {
      const commands = (faqCommandsRef.current[step.id] ?? []) as SimulatorCommand[];
      if (commands.length > 0) {
        queueCommands(commands);
      }
      return;
    }

    const stepCommands: Record<number, SimulatorCommand[]> = {
      0: [], // Welcome
      1: [{ type: 'back' }], // Login - ensure not authenticated
      2: [{ type: 'login' }, { type: 'navigate', payload: 'home' }], // Home feed
      3: [{ type: 'login' }, { type: 'navigate', payload: 'home' }], // Compose — keep FAB mounted (its own target)
      4: [{ type: 'login' }, { type: 'compose' }], // Post — open composer (modal) so the Send button (target) is present; 2 cmds avoids the queue's 3-command race
      // Profile — land on home so the top-bar avatar (the step's target) exists.
      // Must NOT run viewProfile: this step is gated on the user doing exactly
      // that, and doing it for them left the tour waiting on an action that had
      // already happened.
      5: [{ type: 'login' }, { type: 'navigate', payload: 'home' }],
      6: [{ type: 'login' }, { type: 'viewProfile' }], // Follow — needs a profile open (result of step 5)
      7: [{ type: 'login' }, { type: 'navigate', payload: 'home' }], // Interactions
      // Settings — same rule as step 5: opening Settings here would satisfy
      // nothing and deadlock the step. Home puts the avatar (drawer) in reach.
      8: [{ type: 'login' }, { type: 'navigate', payload: 'home' }],
      9: [], // Complete
    };

    const commands = stepCommands[stepIndex] || [];
    if (commands.length > 0) {
      queueCommands(commands);
    }
  }, [queueCommands]);

  return (
    <TourWrapper
      tourConfig={amethystTourConfig}
      autoStart={false}
      onStepChange={handleStepChange}
      onTourComplete={() => {
        console.log('Amethyst tour completed!');
      }}
      onTourSkip={() => {
        console.log('Amethyst tour skipped');
      }}
    >
      <AmethystSimulatorBase
        tourCommand={currentCommand}
        onCommandHandled={handleCommandHandled}
      />
      <FaqMiniTourLauncher faq={amethystFaq} onLaunch={handleFaqLaunch} />
    </TourWrapper>
  );
}

export default AmethystSimulatorWithTour;
