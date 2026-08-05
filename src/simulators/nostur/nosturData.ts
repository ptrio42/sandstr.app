/**
 * Nostur simulator data layer — adapters over src/data/mock.
 *
 * Every identity is fictional (see the header of src/data/mock/users.ts) and
 * every image is a local data: URI, so the sim makes zero external requests.
 * The real Nostur hotlinks profile pictures, banners and media; we do not.
 */

import { mockUsers, mockNotes, mockRelays, getSampleImages } from '../../data/mock';
import type { MockNote, MockUser } from '../../data/mock';
import type { AuthoredNote } from './types';

/** Feed display caps at ~25 notes (repo-wide simulator convention). */
export const FEED_CAP = 25;

const usersByPubkey = new Map(mockUsers.map((u) => [u.pubkey, u]));

export function userByPubkey(pubkey: string): MockUser {
  return usersByPubkey.get(pubkey) ?? mockUsers[0];
}

/** The demo account you "log in" as. Fictional, from the shared mock DB. */
export const DEMO_USER: MockUser = mockUsers[0];

/** Deterministic FNV-1a — one seed hash for avatars, counts and flags. */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Nostur draws a missing profile picture as a FLAT, SEEDED SOLID COLOUR — no
 * initials, no monogram, no remote image (Nostur/Utils/Color+random.swift,
 * `randomColor(seed:)`, srand48 over the pubkey's unicode-scalar sum). Reproduced
 * here with our own deterministic hash: the point is the look, not the PRNG.
 */
export function seededColor(seed: string): string {
  const h = hashSeed(seed);
  const r = h & 0xff;
  const g = (h >> 8) & 0xff;
  const b = (h >> 16) & 0xff;
  // Keep it out of the near-black corner so it reads as a deliberate colour on
  // an OLED feed, the way the real app's values do.
  const lift = (v: number) => 60 + Math.round((v / 255) * 195);
  return `rgb(${lift(r)}, ${lift(g)}, ${lift(b)})`;
}

/** Roughly a third of the mock roster has no picture — same as a real feed. */
export function hasPicture(user: MockUser): boolean {
  return hashSeed(user.pubkey) % 3 !== 0;
}

/** Ago format read off the recording: "20h", "11h", "594d", "601d". */
export function ago(createdAt: number): string {
  const secs = Math.max(1, Math.floor(Date.now() / 1000) - createdAt);
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  return `${Math.floor(secs / 86400)}d`;
}

/** AnimatedNumber uses .number.notation(.compactName) — "1.2K", "10K", "1M". */
export function compact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    return `${k < 10 ? k.toFixed(1).replace(/\.0$/, '') : Math.round(k)}K`;
  }
  const m = n / 1_000_000;
  return `${m < 10 ? m.toFixed(1).replace(/\.0$/, '') : Math.round(m)}M`;
}

/** Nostur shows a fiat estimate under each zap coin when showFiat is on. */
export function fiatForSats(sats: number): string {
  const usd = (sats / 100_000_000) * 118_000;
  if (usd >= 100) return `$${Math.round(usd)}`;
  if (usd >= 1) return `$${usd.toFixed(2)}`;
  return `$${usd.toFixed(3)}`;
}

/**
 * getSampleImages walks a module-level counter, so calling it during render
 * would hand a note new images on every re-render. Pin them per note id.
 */
const mediaCache = new Map<string, string[]>();
export function mediaFor(note: MockNote): string[] {
  if (!note.images || note.images.length === 0) return [];
  let cached = mediaCache.get(note.id);
  if (!cached) {
    cached = note.images.every((u) => u.startsWith('data:'))
      ? note.images
      : getSampleImages(note.images.length);
    mediaCache.set(note.id, cached);
  }
  return cached;
}

function authored(notes: MockNote[]): AuthoredNote[] {
  return notes.map((note) => ({ note, author: userByPubkey(note.pubkey) }));
}

/** "Following" — the account's own timeline. */
export const followingFeed: AuthoredNote[] = authored(mockNotes.slice(0, FEED_CAP));

/** "Explore" — a global feed; different slice so switching tabs visibly changes. */
export const exploreFeed: AuthoredNote[] = authored(
  mockNotes.slice(FEED_CAP, FEED_CAP * 2).length >= 8
    ? mockNotes.slice(FEED_CAP, FEED_CAP * 2)
    : [...mockNotes].reverse().slice(0, FEED_CAP),
);

/** Bookmarks — the notes whose bookmark glyph is filled orange in the feed. */
export const bookmarkedIds = new Set(
  followingFeed.filter(({ note }) => hashSeed(note.id) % 6 === 0).map(({ note }) => note.id),
);

/** Reposts — the "{name}" header row above a post. */
export function reposterFor(note: MockNote): MockUser | null {
  const h = hashSeed(`repost:${note.id}`);
  return h % 5 === 0 ? mockUsers[h % mockUsers.length] : null;
}

/** Only authors with a lightning address get an enabled zap button. */
export function canZap(user: MockUser): boolean {
  return Boolean(user.lightningAddress);
}

/** Discover = follow packs & lists, each curated "by" someone. */
export interface FollowPack {
  id: string;
  title: string;
  members: MockUser[];
  total: number;
  curator: MockUser;
}

export const followPacks: FollowPack[] = [
  { id: 'fp-1', title: 'Freedom Tech Signal', total: 122, at: 4, by: 6 },
  { id: 'fp-2', title: 'Protocol Builders 2026', total: 98, at: 11, by: 2 },
  { id: 'fp-3', title: 'Podcasters', total: 47, at: 17, by: 9 },
  { id: 'fp-4', title: 'Relay Operators', total: 31, at: 22, by: 13 },
].map((p) => ({
  id: p.id,
  title: p.title,
  total: p.total,
  members: mockUsers.slice(p.at, p.at + 9),
  curator: mockUsers[p.by],
}));

/** Relay Connections → the relay list screen. */
export const relayRows = mockRelays.slice(0, 7).map((r) => ({
  url: r.url,
  read: true,
  write: hashSeed(r.url) % 4 !== 0,
}));

/** Lists & Feeds → "DEFAULT FEEDS", verbatim titles and captions from the recording. */
export const defaultFeeds: { name: string; caption: string; on: boolean }[] = [
  { name: 'Pictures', caption: 'Pictures-only feed from people you follow', on: true },
  { name: 'Yaks', caption: 'Voice Messages feed from people you follow', on: true },
  { name: 'Divines', caption: 'Short videos feed from people you follow', on: true },
  { name: 'Zapped', caption: 'Posts from anyone who are most zapped by people you follow', on: true },
  { name: 'Hot', caption: 'Posts from anyone who are most liked or reposted by people you follow', on: true },
  { name: 'Follow Packs & Lists', caption: 'Lists created by people you follow', on: true },
  { name: 'Live Streams', caption: 'Live Streams from people you follow', on: true },
  { name: 'Funny Feed', caption: 'Posts from anyone reacted to by people you follow', on: true },
  { name: 'Gallery', caption: 'Media from posts from anyone which are most liked', on: true },
];

/** ZapCustomizer.swift: a 4x4 grid, 21 preselected (defaultZapAmount). */
export const ZAP_AMOUNTS = [
  3, 21, 100, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000,
];
export const DEFAULT_ZAP_AMOUNT = 21;
