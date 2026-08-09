/**
 * Damus Simulator with Tour Integration
 * Tour drives the simulator state
 */

import React, { useState, useRef, useCallback } from 'react';
import { TourWrapper } from '../../components/tour';
import type { TourStep } from '../../components/tour';
import { FaqMiniTourLauncher, isFaqStepId } from '../../components/faq/FaqMiniTourLauncher';
import { damusTourConfig } from '../../data/tours/damus-tour';
import { damusFaq } from '../../data/faq/damus';
import { DamusSimulator as DamusSimulatorBase } from './DamusSimulator';
import type { DamusSimulatorCommand } from './DamusSimulator';

export function DamusSimulatorWithTour() {
  const [commandQueue, setCommandQueue] = useState<DamusSimulatorCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState<DamusSimulatorCommand | null>(null);
  const lastStepRef = useRef<number>(-1);
  const isProcessingRef = useRef(false);
  // Step-id → commands for the ACTIVE FAQ mini-tour, set at launch. A ref, not
  // state: handleStepChange reads it synchronously right after launch.
  const faqCommandsRef = useRef<Record<string, unknown[]>>({});
  // Timers armed by the queue. A step change replaces the queue, but an
  // already-armed timer still holds the OLD queue in its closure — left alive
  // it would dispatch a dropped step's second command after the new step's
  // command (e.g. re-opening the drawer over the relays screen it just left).
  const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearPendingTimers = useCallback(() => {
    pendingTimersRef.current.forEach(clearTimeout);
    pendingTimersRef.current = [];
  }, []);

  // Process commands from queue one by one
  const processNextCommand = useCallback(() => {
    if (isProcessingRef.current || commandQueue.length === 0) return;

    isProcessingRef.current = true;
    const nextCmd = commandQueue[0];
    setCurrentCommand(nextCmd);
  }, [commandQueue]);

  // Handle command completion
  const handleCommandHandled = useCallback(() => {
    setCommandQueue(prev => prev.slice(1));
    setCurrentCommand(null);
    isProcessingRef.current = false;

    // Process next command after a short delay
    const t = setTimeout(() => {
      if (commandQueue.length > 1) {
        const nextCmd = commandQueue[1];
        setCurrentCommand(nextCmd);
        setCommandQueue(prev => prev.slice(1));
      }
    }, 100);
    pendingTimersRef.current.push(t);
  }, [commandQueue]);

  // Queue commands for a step
  const queueCommands = useCallback((commands: DamusSimulatorCommand[]) => {
    console.log('[DamusSimulator] Queueing commands:', commands);
    clearPendingTimers();
    setCommandQueue(commands);
    // Start processing first command
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

  // Handle tour step changes to navigate simulator
  const handleStepChange = useCallback((stepIndex: number, step: TourStep) => {
    // Prevent duplicate processing of same step
    if (lastStepRef.current === stepIndex) {
      console.log('[DamusSimulator] Ignoring duplicate step:', stepIndex);
      return;
    }
    lastStepRef.current = stepIndex;

    console.log('[DamusSimulator] Tour step changed to:', stepIndex);

    // FAQ mini-tour steps carry their own commands (set at launch); the
    // index map below belongs to the main damus-tour only.
    if (isFaqStepId(step.id)) {
      const commands = (faqCommandsRef.current[step.id] ?? []) as DamusSimulatorCommand[];
      if (commands.length > 0) {
        queueCommands(commands);
      }
      return;
    }

    // Define commands for each step
    const stepCommands: Record<number, DamusSimulatorCommand[]> = {
      // Step 0: Welcome - no action needed
      0: [],
      // Login — force the signed-out screen. `[]` assumed the visitor arrives
      // logged out, but they can sign in before starting the tour, and Prev
      // from step 3 also lands here signed in — either way the login anchor
      // is unmounted and the step used to render as an empty dark screen.
      // Amethyst and Keychat already did this; the idiom just was not copied.
      1: [{ type: 'logout' }],
      // Step 2: Home feed - login + navigate to home
      2: [{ type: 'login' }, { type: 'navigate', payload: 'home' }],
      // Step 3: Compose button - login + navigate to home (compose shown in home)
      3: [{ type: 'login' }, { type: 'navigate', payload: 'home' }],
      // Step 4: Post - login + open the composer (a modal) so the post button (target) is mounted.
      // 2 commands avoids the queue's unreliable 3-command handoff.
      4: [{ type: 'login' }, { type: 'compose' }],
      // Step 5: Profile - login + view profile
      5: [{ type: 'login' }, { type: 'viewProfile' }],
      // Step 6: Follow — SOMEONE ELSE's profile (gaps dam-39). `viewProfile`
      // opens your own, where ProfileScreen renders the handler-less "Edit"
      // button instead of the Follow pill, so a step called "Following Users"
      // spotlighted a dead control. `viewUser` mounts another user's profile,
      // which is the branch that actually has the pill.
      6: [{ type: 'login' }, { type: 'viewUser' }],
      // Step 7: Interactions - login + navigate to home
      7: [{ type: 'login' }, { type: 'navigate', payload: 'home' }],
      // Step 8: Settings - login + navigate to settings
      8: [{ type: 'login' }, { type: 'navigate', payload: 'settings' }],
      // Step 9: Complete - no action
      9: [],
    };

    const commands = stepCommands[stepIndex] || [];
    if (commands.length > 0) {
      queueCommands(commands);
    }
  }, [queueCommands]);

  return (
    <TourWrapper
      tourConfig={damusTourConfig}
      autoStart={false}
      onStepChange={handleStepChange}
      onTourComplete={() => {
        console.log('Damus tour completed!');
      }}
      onTourSkip={() => {
        console.log('Damus tour skipped');
      }}
    >
      <DamusSimulatorBase
        tourCommand={currentCommand}
        onCommandHandled={handleCommandHandled}
      />
      <FaqMiniTourLauncher faq={damusFaq} onLaunch={handleFaqLaunch} />
    </TourWrapper>
  );
}

export default DamusSimulatorWithTour;
