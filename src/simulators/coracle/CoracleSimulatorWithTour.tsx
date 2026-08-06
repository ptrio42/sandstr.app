/**
 * Coracle Simulator with Tour Integration.
 *
 * Coracle has no guided tour of its own (there is no entry in
 * src/data/tours/), so this wrapper exists purely to give the FAQ panel a
 * simulator it can drive: TourWrapper supplies the engine, and
 * FaqMiniTourLauncher replays an FAQ entry through it. The base config below
 * is an empty placeholder — `restartTour` replaces it wholesale on every
 * launch, and `autoStart={false}` means it never runs on its own. Registry
 * keeps `hasTour: false`, so no "Take a tour" button appears.
 */

import React, { useState, useRef, useCallback } from 'react';
import { TourWrapper } from '../../components/tour';
import type { TourConfig, TourStep } from '../../components/tour';
import { FaqMiniTourLauncher, isFaqStepId } from '../../components/faq/FaqMiniTourLauncher';
import { coracleFaq } from '../../data/faq/coracle';
import { CoracleSimulator } from './CoracleSimulator';
import type { SimulatorCommand } from './CoracleSimulator';

/** Never started; only ever replaced by a mini-tour's own config. */
const placeholderTour: TourConfig = {
  id: 'coracle-faq',
  name: 'Coracle FAQ',
  steps: [],
  storageKey: 'nostr-tour-coracle-faq',
};

export function CoracleSimulatorWithTour() {
  const [commandQueue, setCommandQueue] = useState<SimulatorCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState<SimulatorCommand | null>(null);
  const lastStepRef = useRef<number>(-1);
  // Step-id → commands for the ACTIVE mini-tour, set at launch. A ref, not
  // state: handleStepChange reads it synchronously right after launch.
  const faqCommandsRef = useRef<Record<string, unknown[]>>({});
  // Timers armed by the queue. A step change replaces the queue, but an
  // already-armed timer still holds the OLD queue in its closure.
  const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearPendingTimers = useCallback(() => {
    pendingTimersRef.current.forEach(clearTimeout);
    pendingTimersRef.current = [];
  }, []);

  const handleCommandHandled = useCallback(() => {
    setCommandQueue((prev) => prev.slice(1));
    setCurrentCommand(null);

    const t = setTimeout(() => {
      if (commandQueue.length > 1) {
        setCurrentCommand(commandQueue[1]);
        setCommandQueue((prev) => prev.slice(1));
      }
    }, 100);
    pendingTimersRef.current.push(t);
  }, [commandQueue]);

  const queueCommands = useCallback(
    (commands: SimulatorCommand[]) => {
      clearPendingTimers();
      setCommandQueue(commands);
      if (commands.length > 0) {
        const t = setTimeout(() => setCurrentCommand(commands[0]), 50);
        pendingTimersRef.current.push(t);
      }
    },
    [clearPendingTimers],
  );

  const handleFaqLaunch = useCallback((commandsByStepId: Record<string, unknown[]>) => {
    faqCommandsRef.current = commandsByStepId;
    lastStepRef.current = -1;
  }, []);

  const handleStepChange = useCallback(
    (stepIndex: number, step: TourStep) => {
      if (lastStepRef.current === stepIndex) return;
      lastStepRef.current = stepIndex;

      // Only FAQ mini-tours reach this wrapper — there is no main tour.
      if (!isFaqStepId(step.id)) return;
      const commands = (faqCommandsRef.current[step.id] ?? []) as SimulatorCommand[];
      if (commands.length > 0) queueCommands(commands);
    },
    [queueCommands],
  );

  return (
    <TourWrapper tourConfig={placeholderTour} autoStart={false} onStepChange={handleStepChange}>
      <CoracleSimulator tourCommand={currentCommand} onCommandHandled={handleCommandHandled} />
      <FaqMiniTourLauncher faq={coracleFaq} onLaunch={handleFaqLaunch} />
    </TourWrapper>
  );
}

export default CoracleSimulatorWithTour;
