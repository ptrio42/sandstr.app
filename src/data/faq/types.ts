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
  /**
   * The protocol half of a troubleshooting answer, rendered as its own block.
   * "Why doesn't this work" questions are only half a client question: the rest
   * is how Nostr itself behaves (relays hold the copies, an account IS a
   * keypair, a zap is a Lightning payment plus a receipt). Keeping it in a
   * separate field forces the split instead of blurring protocol facts into
   * steps the user is meant to follow in this app.
   */
  howNostrWorks?: string;
  /** Optional one-line tip or caveat rendered after the steps. */
  note?: string;
  /** Present only when the simulator can demonstrate the answer. */
  showMe?: FaqShowMeStep[];
}

/**
 * Canonical question bank — the topics EVERY client FAQ must account for.
 * Sourced from real user pain (owner-supplied: wallet connect, media
 * uploader, cache) plus the cross-cutting picture in docs/GAPS.md. The list
 * is deliberately client-agnostic: it names the problem, not the UI.
 */
export const CANONICAL_TOPICS = [
  'sign-in',
  'backup-keys',
  'logout',
  'multi-account',
  'post',
  'reply',
  'reactions',
  'zap',
  'connect-wallet',
  'media-uploader',
  'clear-cache',
  'manage-relays',
  'mute',
  'dms',
  'search',
  'notifications',
  'follow',
] as const;

export type CanonicalTopic = (typeof CANONICAL_TOPICS)[number];

/**
 * Per-topic answer of the coverage contract:
 * - an entry id from `entries` (getFaq dev-validates it resolves),
 * - 'n/a'  — the REAL client has no such feature (e.g. no DMs), or
 * - 'todo' — question still to be written; visible debt, not silence.
 */
export type TopicCoverage = string | 'n/a' | 'todo';

export interface ClientFaq {
  clientId: string;
  /** Display order of category chips. */
  categories: string[];
  entries: FaqEntry[];
  /**
   * Compiler-enforced: a client FAQ that ignores a canonical topic does not
   * typecheck. This is what guarantees the hard questions (wallet, uploader,
   * cache…) exist for every client instead of only where an author thought
   * of them.
   */
  coverage: Record<CanonicalTopic, TopicCoverage>;
}
