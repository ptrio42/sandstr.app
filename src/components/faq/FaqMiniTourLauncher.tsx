/**
 * Bridges the host's FAQ panel to the tour engine. Must render INSIDE a
 * TourWrapper (it needs the tour context), i.e. as a sibling of the base
 * simulator in a client's *SimulatorWithTour wrapper.
 *
 * The host dispatches SHOW_FAQ_EVENT (mirroring the `start-<id>-tour` idiom —
 * window events are the only channel across the host/sim boundary); this
 * component replays the matching FAQ entry as a short TourConfig and hands the
 * wrapper a step-id → commands map so its onStepChange can drive the sim.
 */

import { useEffect } from 'react';
import { useTour } from '../tour';
import type { TourConfig } from '../tour';
import type { ClientFaq } from '../../data/faq/types';

export const SHOW_FAQ_EVENT = 'sandstr-show-faq';

export interface ShowFaqDetail {
  clientId: string;
  entryId: string;
}

export function showFaqInSimulator(detail: ShowFaqDetail) {
  window.dispatchEvent(new CustomEvent<ShowFaqDetail>(SHOW_FAQ_EVENT, { detail }));
}

export const isFaqStepId = (stepId: string) => stepId.startsWith('faq:');

interface Props {
  faq: ClientFaq;
  /**
   * Called synchronously before the mini-tour starts. The wrapper must store
   * the map for its onStepChange AND reset its step-dedup ref — the same entry
   * relaunched twice reuses step ids, which the dedup would otherwise swallow.
   */
  onLaunch: (commandsByStepId: Record<string, unknown[]>) => void;
}

export function FaqMiniTourLauncher({ faq, onLaunch }: Props) {
  const { restartTour } = useTour();

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ShowFaqDetail>).detail;
      if (!detail || detail.clientId !== faq.clientId) return;
      const entry = faq.entries.find((en) => en.id === detail.entryId);
      if (!entry?.showMe?.length) return;

      const commandsByStepId: Record<string, unknown[]> = {};
      const steps = entry.showMe.map((s, i) => {
        const id = `faq:${faq.clientId}:${entry.id}:${i}`;
        if (s.commands?.length) commandsByStepId[id] = s.commands;
        return {
          id,
          target: s.target,
          title: s.title,
          content: s.content,
          position: s.position ?? ('bottom' as const),
          allowClickThrough: true,
          spotlightPadding: s.spotlightPadding ?? 12,
        };
      });

      // One shared id: mini-tours are throwaway replays, so they share a
      // single storage slot instead of littering localStorage per entry.
      // The config OBJECT is new on every launch — that identity change is
      // what lets TourWrapper reset its step dedup for repeat runs.
      const config: TourConfig = {
        id: `${faq.clientId}-faq`,
        name: entry.question,
        steps,
        storageKey: `nostr-tour-${faq.clientId}-faq`,
      };

      onLaunch(commandsByStepId);
      restartTour(config);
    };

    window.addEventListener(SHOW_FAQ_EVENT, handler);
    return () => window.removeEventListener(SHOW_FAQ_EVENT, handler);
  }, [faq, onLaunch, restartTour]);

  return null;
}

export default FaqMiniTourLauncher;
