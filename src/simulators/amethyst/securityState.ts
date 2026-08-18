import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { mockUsers } from '../../data/mock';
import type { MockUser } from '../../data/mock';

/**
 * Everything Security Filters owns, hoisted out of the screen.
 *
 * It has to live above both Settings and the note card: v1.13.1 fills these
 * lists from OUTSIDE the settings tree — the note overflow menu's "Block" and
 * "Mute thread" are what put rows in them — and the Security Filters root shows
 * a live count badge per list. A screen-local `useState` could model neither.
 *
 * Scoped to `src/simulators/amethyst/`, like the toast bridge next to it.
 */

export type WarningType = 'Warn' | 'Show' | 'Hide';

/** `WarningType.entries` order, which is also the segmented row's order. */
export const WARNING_TYPES: WarningType[] = ['Warn', 'Show', 'Hide'];

export interface MutedThread {
  id: string;
  /** The thread's first line, which is what upstream's row shows. */
  title: string;
}

export interface SecurityState {
  // — Filtering preferences —
  sensitive: WarningType;
  setSensitive: (v: WarningType) => void;
  filterSpam: boolean;
  setFilterSpam: (v: boolean) => void;
  hideViolations: boolean;
  setHideViolations: (v: boolean) => void;
  warnReports: boolean;
  setWarnReports: (v: boolean) => void;
  reportThreshold: number;
  setReportThreshold: (v: number) => void;
  maxHashtags: number;
  setMaxHashtags: (v: number) => void;

  // — Blocked content —
  blocked: MockUser[];
  spammers: MockUser[];
  hiddenWords: string[];
  mutedThreads: MutedThread[];

  blockUser: (user: MockUser) => void;
  unblockUsers: (pubkeys: string[]) => void;
  unmarkSpammers: (pubkeys: string[]) => void;
  addWord: (word: string) => void;
  showWords: (words: string[]) => void;
  muteThread: (thread: MutedThread) => void;
  unmuteThread: (id: string) => void;
}

/** Six accounts start blocked, so the list is not empty on first open. */
const INITIAL_BLOCKED = mockUsers.slice(-6);

export function useSecurityState(): SecurityState {
  const [sensitive, setSensitive] = useState<WarningType>('Warn');
  const [filterSpam, setFilterSpamRaw] = useState(true);
  const [hideViolations, setHideViolations] = useState(false);
  const [warnReports, setWarnReports] = useState(true);
  const [reportThreshold, setReportThresholdRaw] = useState(5);
  const [maxHashtags, setMaxHashtagsRaw] = useState(8);

  const [blocked, setBlocked] = useState<MockUser[]>(INITIAL_BLOCKED);
  // Spammers start empty on purpose: upstream this set is transient, filled by
  // the spam filter during a session and dropped on restart.
  const [spammers, setSpammers] = useState<MockUser[]>([]);
  const [hiddenWords, setHiddenWords] = useState<string[]>([]);
  const [mutedThreads, setMutedThreads] = useState<MutedThread[]>([]);

  /**
   * Turning the spam filter OFF wipes the transient spammer set upstream
   * (`Account.updateFilterSpam` -> `hiddenUsers.resetTransientUsers()`), and
   * nothing restores it when the switch goes back on. That is the one visible
   * consequence this switch has, so it is modelled rather than described.
   */
  const setFilterSpam = useCallback((v: boolean) => {
    setFilterSpamRaw(v);
    if (!v) setSpammers([]);
  }, []);

  const setReportThreshold = useCallback((v: number) => {
    setReportThresholdRaw(Math.min(999, Math.max(1, v)));
  }, []);

  const setMaxHashtags = useCallback((v: number) => {
    setMaxHashtagsRaw(Math.min(99, Math.max(0, v)));
  }, []);

  const blockUser = useCallback((user: MockUser) => {
    setBlocked((cur) => (cur.some((u) => u.pubkey === user.pubkey) ? cur : [user, ...cur]));
  }, []);

  const unblockUsers = useCallback((pubkeys: string[]) => {
    setBlocked((cur) => cur.filter((u) => !pubkeys.includes(u.pubkey)));
  }, []);

  const unmarkSpammers = useCallback((pubkeys: string[]) => {
    setSpammers((cur) => cur.filter((u) => !pubkeys.includes(u.pubkey)));
  }, []);

  const addWord = useCallback((word: string) => {
    const w = word.trim();
    if (!w) return;
    setHiddenWords((cur) => (cur.includes(w) ? cur : [w, ...cur]));
  }, []);

  const showWords = useCallback((words: string[]) => {
    setHiddenWords((cur) => cur.filter((w) => !words.includes(w)));
  }, []);

  const muteThread = useCallback((thread: MutedThread) => {
    setMutedThreads((cur) => (cur.some((t) => t.id === thread.id) ? cur : [thread, ...cur]));
  }, []);

  const unmuteThread = useCallback((id: string) => {
    setMutedThreads((cur) => cur.filter((t) => t.id !== id));
  }, []);

  return useMemo(
    () => ({
      sensitive, setSensitive,
      filterSpam, setFilterSpam,
      hideViolations, setHideViolations,
      warnReports, setWarnReports,
      reportThreshold, setReportThreshold,
      maxHashtags, setMaxHashtags,
      blocked, spammers, hiddenWords, mutedThreads,
      blockUser, unblockUsers, unmarkSpammers, addWord, showWords, muteThread, unmuteThread,
    }),
    [
      sensitive, filterSpam, hideViolations, warnReports, reportThreshold, maxHashtags,
      blocked, spammers, hiddenWords, mutedThreads,
      setFilterSpam, setReportThreshold, setMaxHashtags,
      blockUser, unblockUsers, unmarkSpammers, addWord, showWords, muteThread, unmuteThread,
    ],
  );
}

export const AmethystSecurityContext = createContext<SecurityState | null>(null);

/** Never throws: a card rendered outside the provider gets inert no-ops. */
export function useSecurity(): Pick<SecurityState, 'blockUser' | 'muteThread'> {
  const ctx = useContext(AmethystSecurityContext);
  return ctx ?? { blockUser: () => {}, muteThread: () => {} };
}
