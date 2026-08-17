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

/** My Relays is the first 12 of the mock pool — what RelaysScreen showed before. */
const SEEDED = mockRelays.slice(0, 12);

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

  return useMemo(
    () => ({ relays, addRelay, filteredOut, isShown, toggleRelay }),
    [relays, addRelay, filteredOut, isShown, toggleRelay],
  );
}
