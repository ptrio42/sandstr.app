import { useEffect, useRef } from 'react';

/**
 * Keep your place when you switch clients.
 *
 * Switching from Amethyst's feed to Primal used to drop you on Primal's sign-in
 * wall — the visitor's actual question ("how does THIS screen look over there?")
 * needed them to click through onboarding again, every single time.
 *
 * The clients have no screen vocabulary in common: Damus has `tab`, Coracle has
 * `screen`, Amethyst has `activeTab`, and their values overlap only loosely. So
 * the shared thing is a small INTENT vocabulary, and each simulator maps it to
 * whatever it calls that screen. Anything a client cannot show simply falls back
 * to the feed, which every one of them has.
 *
 * Two deliberate properties:
 *
 *  - Reporting only happens while a simulator is showing a real screen, which
 *    means "an intent is stored" doubles as "the visitor already got past
 *    onboarding somewhere". That is what lets the next client skip its own
 *    sign-in wall without a second flag to keep in sync.
 *  - Restore runs ONCE per mount, from an effect, so a client that restores into
 *    a screen it also reports from cannot ping-pong with itself.
 *
 * Session-scoped on purpose (sessionStorage): a fresh tab is a fresh visit and
 * should open where the reproduction really opens.
 */

export type ScreenIntent =
  | 'feed'
  | 'notifications'
  | 'messages'
  | 'search'
  | 'profile'
  | 'settings'
  | 'relays'
  | 'bookmarks';

export const SCREEN_STORAGE_KEY = 'sandstr:screen';

/** Human labels for the host's "you are here" affordance. */
export const SCREEN_LABELS: Record<ScreenIntent, string> = {
  feed: 'Feed',
  notifications: 'Notifications',
  messages: 'Messages',
  search: 'Search',
  profile: 'Profile',
  settings: 'Settings',
  relays: 'Relays',
  bookmarks: 'Bookmarks',
};

const INTENTS = Object.keys(SCREEN_LABELS) as ScreenIntent[];

export function readScreenIntent(): ScreenIntent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SCREEN_STORAGE_KEY);
    return raw && (INTENTS as string[]).includes(raw) ? (raw as ScreenIntent) : null;
  } catch {
    return null;
  }
}

export function writeScreenIntent(intent: ScreenIntent | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (intent) window.sessionStorage.setItem(SCREEN_STORAGE_KEY, intent);
    else window.sessionStorage.removeItem(SCREEN_STORAGE_KEY);
  } catch {
    /* private mode: the feature degrades to "every client opens at its start" */
  }
  // The host's reset affordance only makes sense once there is something to
  // reset, and it lives outside React's tree from here.
  window.dispatchEvent(new CustomEvent('sandstr-screen', { detail: intent }));
}

export function clearScreenIntent(): void {
  writeScreenIntent(null);
}

/**
 * @param map     this client's name for each intent it can show. Omit an intent
 *                the client genuinely lacks — it will land on `feed` instead.
 * @param current the screen on display, or null while the client is showing
 *                onboarding (nothing is reported then).
 * @param onRestore called at most once per mount, with a screen from `map`.
 *                Implementations must also leave onboarding — being asked to
 *                restore means the visitor is already past it elsewhere.
 * @param ready   hold the restore until the client can actually act on it.
 *                Snort and Coracle import their mock data in an effect, so on
 *                the first render their user list is still empty and a restore
 *                would set the screen without ever signing in — leaving the
 *                visitor on the sign-in wall with the feature silently off.
 */
export function useScreenSync<T extends string>({
  map,
  current,
  onRestore,
  ready = true,
}: {
  map: Partial<Record<ScreenIntent, T>>;
  current: T | null;
  onRestore: (screen: T) => void;
  ready?: boolean;
}): void {
  const restored = useRef(false);
  // Read through refs so the restore effect can stay mount-only without lying
  // to the linter about what it uses.
  const mapRef = useRef(map);
  mapRef.current = map;
  const restoreRef = useRef(onRestore);
  restoreRef.current = onRestore;

  useEffect(() => {
    if (restored.current || !ready) return;
    restored.current = true;
    const want = readScreenIntent();
    if (!want) return;
    // The fallback IS the feature: clients differ in what they offer, and a
    // missing screen should never strand the visitor on a blank tab.
    const target = mapRef.current[want] ?? mapRef.current.feed;
    if (target) restoreRef.current(target);
  }, [ready]);

  useEffect(() => {
    if (current == null) return;
    const entry = (Object.entries(mapRef.current) as [ScreenIntent, T][]).find(
      ([, value]) => value === current,
    );
    // A screen outside the shared vocabulary (a client's own oddity) leaves the
    // last known intent alone rather than erasing it.
    if (entry) writeScreenIntent(entry[0]);
  }, [current]);
}
