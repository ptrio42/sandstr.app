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

/**
 * Validate an untrusted string against the vocabulary. Lives here rather than
 * at the call site because this module owns the vocabulary: a second copy of
 * the list is a second thing to forget when an intent is added.
 *
 * Callers today: the stored value below (sessionStorage is user-writable) and
 * the `?screen=` deep link in ClientView. Both must treat an unknown value as
 * absent rather than as an error — a stale or mistyped link should open the
 * client where it really opens, not on a blank screen.
 */
export function parseScreenIntent(raw: string | null | undefined): ScreenIntent | null {
  return raw && (INTENTS as string[]).includes(raw) ? (raw as ScreenIntent) : null;
}

export function readScreenIntent(): ScreenIntent | null {
  if (typeof window === 'undefined') return null;
  try {
    return parseScreenIntent(window.sessionStorage.getItem(SCREEN_STORAGE_KEY));
  } catch {
    return null;
  }
}

/**
 * Store WITHOUT announcing — for callers that run during React's render pass.
 *
 * `?screen=` is resolved in a useState initialiser, because an effect runs
 * after the first render and loses the race against the simulator's lazy
 * chunk. But the announcing write below dispatches synchronously, and the
 * host listens to that event with a setState: React then reports "Cannot
 * update a component while rendering a different component". The listener is
 * not the point there anyway — the initialiser's own return value seeds the
 * host's state in the same breath.
 */
export function seedScreenIntent(intent: ScreenIntent): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SCREEN_STORAGE_KEY, intent);
  } catch {
    /* private mode: the feature degrades to "every client opens at its start" */
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
 * Which intents the CURRENTLY MOUNTED client can actually show.
 *
 * Published from `useScreenSync` rather than declared a second time in the
 * registry, and that is the whole point: the map below is already the single
 * statement of what a client can show, and a hand-copied list beside it would
 * drift the first time a simulator gains a tab. Empty while no simulator is
 * mounted — which includes a frameless client gated at phone widths, where a
 * "start screen" offer would be a promise nothing can keep.
 *
 * Consumer: the demo-link builder, so its screen picker can offer only the
 * screens this client really has. Amethyst is the reason it has to: it maps
 * five intents and NOT `relays` (relays live in its drawer, not as a tab), so
 * ?screen=relays there silently falls back to the feed — correct behaviour,
 * but a builder that offered the option would be writing a link that lies.
 */
let mountedIntents: ScreenIntent[] = [];

export const SCREEN_VOCAB_EVENT = 'sandstr-screen-vocab';

export function mountedScreenIntents(): ScreenIntent[] {
  return mountedIntents;
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

  // Publish this client's vocabulary for the host (see mountedScreenIntents).
  // Keyed on a STRING signature, not on `map`: the object literal is rebuilt on
  // every render, so an object dep would re-dispatch forever.
  const signature = INTENTS.filter((i) => mapRef.current[i] != null).join(',');
  useEffect(() => {
    const announce = (next: ScreenIntent[]) => {
      mountedIntents = next;
      window.dispatchEvent(new CustomEvent(SCREEN_VOCAB_EVENT, { detail: next }));
    };
    announce(signature ? (signature.split(',') as ScreenIntent[]) : []);
    return () => announce([]);
  }, [signature]);

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
