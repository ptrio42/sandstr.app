import { useCallback, useMemo, useState } from 'react';
import { mockRelays } from '../../data/mock';
import type { MockRelay } from '../../data/mock';

/**
 * The relay list and the per-timeline relay filter, hoisted out of both screens.
 *
 * It cannot live inside either one: the Universe funnel's `.filter` sheet lists
 * the relays you have added on the Relays screen, so "add a relay, then pick it
 * in the filter" needs one list above both. Screen-local `useState` gave the
 * filter a frozen copy of `mockRelays` and a newly added relay never showed up
 * in it — which is the whole point of the walkthrough.
 *
 * Scoped to `src/simulators/damus/`, like the Amethyst `securityState` it copies.
 * See `docs/refs/damus/screen-map.md` §6a for what upstream actually does.
 */

/**
 * My Relays is FIVE relays, not twelve.
 *
 * Not a fidelity call — the length of somebody's relay list is their own, and
 * five is as true as thirteen. It is a legibility call: the `.filter` sheet lists
 * one row per relay, and at twelve rows "leave one on" is twelve taps and a
 * scrolling list nobody can read on a phone-sized card. At five the whole list
 * fits on screen at once and the state the sheet is in is legible in one look.
 */
const SEEDED = mockRelays.slice(0, 5);

/**
 * Which timeline a filter belongs to. Upstream keys `relay_filters` per timeline;
 * only the search timeline renders the funnel, so that is the only key in use.
 */
export type FilterTimeline = 'search';

export interface RelayState {
  /** My Relays, in pool order — the same order the `.filter` sheet lists. */
  relays: MockRelay[];
  /** Appends a relay and returns it, or null when the URL is empty or a duplicate. */
  addRelay: (url: string) => MockRelay | null;
  /**
   * Relay URLs filtered OUT of a timeline.
   *
   * Stored as the excluded set, not the included one, because that is what
   * upstream stores and because it keeps "no filter" as the empty set rather
   * than as "every relay, listed". Getting this backwards is the obvious bug
   * here: the TOGGLE reads inverted — on means shown, off means in this set.
   */
  filteredOut: (timeline: FilterTimeline) => string[];
  /** True when this relay's notes are SHOWN, i.e. the toggle is on. */
  isShown: (timeline: FilterTimeline, url: string) => boolean;
  toggleRelay: (timeline: FilterTimeline, url: string) => void;
  /**
   * Which relay carried a note, by note id.
   *
   * Mock notes have no relay field, so the sheet could set a filter that changed
   * nothing on screen — a demo of a switch with no consequence. Assigning each
   * note a relay from the CURRENT list, deterministically by id, is what makes
   * the Universe feed actually shrink when a switch goes off.
   */
  relayForNote: (noteId: string) => string;
  /** The notes a timeline should show, given its filter. */
  visibleNotes: <T extends { id: string }>(timeline: FilterTimeline, notes: T[]) => T[];
}

export function useRelayState(): RelayState {
  const [relays, setRelays] = useState<MockRelay[]>(SEEDED);
  const [filters, setFilters] = useState<Record<FilterTimeline, string[]>>({ search: [] });

  const addRelay = useCallback((raw: string): MockRelay | null => {
    const url = raw.trim();
    if (!url) return null;
    // Upstream's AddRelayView prepends the scheme when you omit it, so a person
    // typing "relay.example.com" gets a working row rather than a rejection.
    const full = /^wss?:\/\//i.test(url) ? url : `wss://${url}`;
    let added: MockRelay | null = null;
    setRelays((prev) => {
      if (prev.some((r) => r.url.toLowerCase() === full.toLowerCase())) return prev;
      const host = full.replace(/^wss?:\/\//i, '');
      added = {
        ...prev[0],
        id: `added-${full.toLowerCase()}`,
        url: full,
        name: host,
        description: '',
        owner: '',
        isPaid: false,
        isOnline: true,
      };
      return [...prev, added];
    });
    return added;
  }, []);

  const filteredOut = useCallback((timeline: FilterTimeline) => filters[timeline] ?? [], [filters]);

  const isShown = useCallback(
    (timeline: FilterTimeline, url: string) => !(filters[timeline] ?? []).includes(url),
    [filters],
  );

  const toggleRelay = useCallback((timeline: FilterTimeline, url: string) => {
    setFilters((prev) => {
      const set = prev[timeline] ?? [];
      return {
        ...prev,
        [timeline]: set.includes(url) ? set.filter((u) => u !== url) : [...set, url],
      };
    });
  }, []);

  // Stable hash over the note id, so a note keeps its relay across renders and
  // across a filter change. Anything random here would reshuffle the feed on
  // every toggle and the shrinking would read as noise rather than as a filter.
  const relayForNote = useCallback((noteId: string) => {
    let h = 0;
    for (let i = 0; i < noteId.length; i++) h = (h * 31 + noteId.charCodeAt(i)) | 0;
    return relays[Math.abs(h) % relays.length]?.url ?? relays[0]?.url ?? '';
  }, [relays]);

  const visibleNotes = useCallback(
    <T extends { id: string }>(timeline: FilterTimeline, notes: T[]) =>
      notes.filter((n) => isShown(timeline, relayForNote(n.id))),
    [isShown, relayForNote],
  );

  return useMemo(
    () => ({ relays, addRelay, filteredOut, isShown, toggleRelay, relayForNote, visibleNotes }),
    [relays, addRelay, filteredOut, isShown, toggleRelay, relayForNote, visibleNotes],
  );
}
