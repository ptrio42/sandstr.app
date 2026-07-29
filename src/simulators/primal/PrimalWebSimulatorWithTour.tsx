/**
 * Primal Web Simulator with Tour Integration
 * Tour drives the simulator state
 */

import React, { useState, useRef, useCallback } from 'react';
import { TourWrapper } from '../../components/tour';
import { primalTourConfig } from '../../data/tours';
// Import directly from the web simulator — NOT the './index' barrel. The barrel
// drags in the unrouted mobile stub whose theme CSS declares unscoped globals
// (.primal-nav-badge & co.) that override the web theme (orange stacked badges).
import { PrimalWebSimulator as PrimalWebSimulatorBase } from './web/WebSimulator';
import type { TabId } from './web/WebSimulator';

export interface SimulatorCommand {
  type: 'login' | 'navigate' | 'compose' | 'post' | 'viewProfile';
  payload?: any;
}

export function PrimalWebSimulatorWithTour() {
  const [commandQueue, setCommandQueue] = useState<SimulatorCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState<SimulatorCommand | null>(null);
  const lastStepRef = useRef<number>(-1);
  const isProcessingRef = useRef(false);

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
    
    setTimeout(() => {
      if (commandQueue.length > 1) {
        const nextCmd = commandQueue[1];
        setCurrentCommand(nextCmd);
        setCommandQueue(prev => prev.slice(1));
      }
    }, 100);
  }, [commandQueue]);

  const queueCommands = useCallback((commands: SimulatorCommand[]) => {
    console.log('[PrimalWebSimulator] Queueing commands:', commands);
    setCommandQueue(commands);
    if (commands.length > 0) {
      setTimeout(() => {
        setCurrentCommand(commands[0]);
      }, 50);
    }
  }, []);

  const handleStepChange = useCallback((stepIndex: number) => {
    if (lastStepRef.current === stepIndex) {
      console.log('[PrimalWebSimulator] Ignoring duplicate step:', stepIndex);
      return;
    }
    lastStepRef.current = stepIndex;
    
    console.log('[PrimalWebSimulator] Tour step changed to:', stepIndex);
    
    const stepCommands: Record<number, SimulatorCommand[]> = {
      0: [], // Welcome
      1: [], // Login - manual
      2: [{ type: 'login' }, { type: 'navigate', payload: 'home' }], // Home feed
      3: [{ type: 'login' }, { type: 'navigate', payload: 'home' }, { type: 'compose' }], // Compose
      4: [{ type: 'login' }, { type: 'navigate', payload: 'home' }, { type: 'post' }], // Post
      5: [{ type: 'login' }, { type: 'viewProfile' }], // Profile
      6: [{ type: 'login' }, { type: 'navigate', payload: 'explore' }], // Follow — Explore is the people-discovery surface the copy describes
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
    </TourWrapper>
  );
}

export default PrimalWebSimulatorWithTour;
