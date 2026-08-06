/**
 * Primal Web Simulator with Tour Integration
 * Tour drives the simulator state
 */

import React, { useState, useRef, useCallback } from 'react';
import { TourWrapper } from '../../components/tour';
import type { TourStep } from '../../components/tour';
import { FaqMiniTourLauncher, isFaqStepId } from '../../components/faq/FaqMiniTourLauncher';
import { primalTourConfig } from '../../data/tours';
import { primalFaq } from '../../data/faq/primal';
// Import directly from the web simulator — NOT the './index' barrel. The barrel
// drags in the unrouted mobile stub whose theme CSS declares unscoped globals
// (.primal-nav-badge & co.) that override the web theme (orange stacked badges).
import { PrimalWebSimulator as PrimalWebSimulatorBase } from './web/WebSimulator';

export interface SimulatorCommand {
  type: 'login' | 'logout' | 'navigate' | 'compose' | 'post' | 'viewProfile' | 'exploreTab';
  payload?: any;
}

export function PrimalWebSimulatorWithTour() {
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
  // command (same fix as the Damus/Amethyst wrappers).
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
    console.log('[PrimalWebSimulator] Queueing commands:', commands);
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
      console.log('[PrimalWebSimulator] Ignoring duplicate step:', stepIndex);
      return;
    }
    lastStepRef.current = stepIndex;

    console.log('[PrimalWebSimulator] Tour step changed to:', stepIndex);

    // FAQ mini-tour steps carry their own commands (set at launch); the
    // index map below belongs to the main primal-tour only.
    if (isFaqStepId(step.id)) {
      const commands = (faqCommandsRef.current[step.id] ?? []) as SimulatorCommand[];
      if (commands.length > 0) {
        queueCommands(commands);
      }
      return;
    }

    const stepCommands: Record<number, SimulatorCommand[]> = {
      0: [], // Welcome
      1: [], // Login - manual
      2: [{ type: 'login' }, { type: 'navigate', payload: 'home' }], // Home feed
      // Compose/Post: 2 commands, no interposed navigate — the queue reliably
      // carries only two, and `compose` forces the home tab itself (the third
      // command in the old triples was routinely dropped; gaps queue note).
      3: [{ type: 'login' }, { type: 'compose' }], // Compose
      4: [{ type: 'login' }, { type: 'post' }], // Post
      5: [{ type: 'login' }, { type: 'viewProfile' }], // Profile
      // Follow — the primal-follow anchor lives in Explore → People, which the
      // default Feeds tab never mounts (gaps pri-27); exploreTab forces it.
      6: [{ type: 'login' }, { type: 'exploreTab', payload: 'People' }],
      7: [{ type: 'login' }, { type: 'navigate', payload: 'home' }], // Interactions
      8: [{ type: 'login' }, { type: 'navigate', payload: 'settings' }], // Settings — was wrongly navigating to home
      9: [], // Complete
    };

    const commands = stepCommands[stepIndex] || [];
    if (commands.length > 0) {
      queueCommands(commands);
    }
  }, [queueCommands]);

  return (
    <TourWrapper
      tourConfig={primalTourConfig}
      autoStart={false}
      onStepChange={handleStepChange}
      onTourComplete={() => {
        console.log('Primal tour completed!');
      }}
      onTourSkip={() => {
        console.log('Primal tour skipped');
      }}
    >
      <PrimalWebSimulatorBase
        tourCommand={currentCommand}
        onCommandHandled={handleCommandHandled}
      />
      <FaqMiniTourLauncher faq={primalFaq} onLaunch={handleFaqLaunch} />
    </TourWrapper>
  );
}

export default PrimalWebSimulatorWithTour;
