/**
 * FAQ data model — curated "how do I…" answers per client, each optionally
 * replayable inside the simulator as a short spotlight tour ("Show me").
 *
 * Content contract (same as tours): answers describe the REAL client's UI and
 * are grounded in docs/refs/<client>/screen-map.md — never invented.
 */

import type { TooltipPosition } from '../../components/tour';

/** One spotlight stop of a "Show me" mini-tour. */
export interface FaqShowMeStep {
  /** CSS selector inside the simulator (data-tour attrs preferred). */
  target: string;
  title: string;
  content: string;
  position?: TooltipPosition;
  spotlightPadding?: number;
  /**
   * Simulator commands that put the sim in the state where `target` is
   * mounted. Opaque here — each client's *SimulatorWithTour wrapper casts to
   * its own command type and dispatches through the existing tourCommand
   * queue (which reliably handles at most 2 commands per step).
   */
  commands?: unknown[];
}

export interface FaqEntry {
  /** kebab-case, unique within the client. */
  id: string;
  category: string;
  /** User phrasing, e.g. "How do I add a relay?" */
  question: string;
  /** Numbered, imperative steps describing the real app's UI. */
  answer: string[];
  /** Optional one-line tip or caveat rendered after the steps. */
  note?: string;
  /** Present only when the simulator can demonstrate the answer. */
  showMe?: FaqShowMeStep[];
}

export interface ClientFaq {
  clientId: string;
  /** Display order of category chips. */
  categories: string[];
  entries: FaqEntry[];
}
