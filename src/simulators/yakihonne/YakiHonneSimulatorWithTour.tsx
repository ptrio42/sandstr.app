/**
 * YakiHonne Simulator with Tour Integration
 * Tour drives the simulator state
 */

import React, { useState, useRef, useCallback } from 'react';
import { TourWrapper } from '../../components/tour';
import type { TourStep } from '../../components/tour';
import { FaqMiniTourLauncher, isFaqStepId } from '../../components/faq/FaqMiniTourLauncher';
import { yakihonneTourConfig } from '../../data/tours';
import { yakihonneFaq } from '../../data/faq/yakihonne';
import { YakiHonneSimulator as YakiHonneSimulatorBase } from './YakiHonneSimulator';
import type { SimulatorCommand } from './YakiHonneSimulator';

export type { SimulatorCommand };

export function YakiHonneSimulatorWithTour() {
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
    console.log('[YakiHonneSimulator] Queueing commands:', commands);
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
      console.log('[YakiHonneSimulator] Ignoring duplicate step:', stepIndex);
      return;
    }
    lastStepRef.current = stepIndex;

    console.log('[YakiHonneSimulator] Tour step changed to:', stepIndex);

    // FAQ mini-tour steps carry their own commands (set at launch); the
    // index map below belongs to the main yakihonne-tour only.
    if (isFaqStepId(step.id)) {
      const commands = (faqCommandsRef.current[step.id] ?? []) as SimulatorCommand[];
      if (commands.length > 0) {
        queueCommands(commands);
      }
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
      2: [{ type: 'login' }, { type: 'navigate', payload: 'feed' }], // Home feed
      3: [{ type: 'login' }, { type: 'navigate', payload: 'feed' }], // Compose — keep FAB (its own target) mounted
      4: [{ type: 'login' }, { type: 'compose' }], // Post — open composer (overlay) so the Send button (target) is present; 2 cmds avoids the queue's 3-command race
      5: [{ type: 'login' }, { type: 'viewProfile' }], // Profile
      // Follow — SOMEONE ELSE's profile. Without the payload this opened your
      // own, where the button reads "Edit profile" and the Follow pill the step
      // is about does not exist (gaps yak-93; the handler already supports it,
      // YakiHonneSimulator.tsx:217-223).
      6: [{ type: 'login' }, { type: 'viewProfile', payload: 'other' }],
      7: [{ type: 'login' }, { type: 'navigate', payload: 'feed' }], // Interactions
      8: [{ type: 'login' }, { type: 'navigate', payload: 'settings' }], // Settings
      9: [], // Complete
    };
    
    const commands = stepCommands[stepIndex] || [];
    if (commands.length > 0) {
      queueCommands(commands);
    }
  }, [queueCommands]);

  return (
    <TourWrapper 
      tourConfig={yakihonneTourConfig}
      autoStart={false}
      onStepChange={handleStepChange}
      onTourComplete={() => {
        console.log('YakiHonne tour completed!');
      }}
      onTourSkip={() => {
        console.log('YakiHonne tour skipped');
      }}
    >
      <YakiHonneSimulatorBase 
        tourCommand={currentCommand}
        onCommandHandled={handleCommandHandled}
      />
      <FaqMiniTourLauncher faq={yakihonneFaq} onLaunch={handleFaqLaunch} />
    </TourWrapper>
  );
}

export default YakiHonneSimulatorWithTour;
