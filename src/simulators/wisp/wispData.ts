/**
 * Wisp simulator data layer — adapters over src/data/mock plus the formatting
 * helpers the real client uses (AmountFormatter.kt, PostCard.kt timestamps).
 * All identities are fictional (see src/data/mock/users.ts header); all media
 * is local data:-URI SVG via getSampleImages — zero external requests.
 */

import { mockUsers, mockNotes, getSampleImages } from '../../data/mock';
import type { MockNote, MockUser } from '../../data/mock';

/** Feed display caps at ~25 notes (repo-wide simulator convention). */
export const FEED_CAP = 25;

const usersByPubkey = new Map(mockUsers.map((u) => [u.pubkey, u]));

export function userByPubkey(pubkey: string): MockUser {
  return usersByPubkey.get(pubkey) ?? mockUsers[0];
}

/** The demo account you "log in" as. Fictional, from the shared mock DB. */
export const DEMO_USER: MockUser = mockUsers[1];

/** Deterministic FNV-1a — shared seed hash for statuses/PoW chips/positions. */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const wispFeedNotes: MockNote[] = mockNotes.slice(0, FEED_CAP);

/**
 * getSampleImages walks a module-level counter, so calling it during render
 * would hand a note new images every re-render. Cache per note id.
 */
const mediaCache = new Map<string, string[]>();
export function wispMediaFor(note: MockNote): string[] {
  if (!note.images || note.images.length === 0) return [];
  let cached = mediaCache.get(note.id);
  if (!cached) {
    // The mock layer already stores local data: URIs; keep them, but pin them.
    cached = note.images.every((u) => u.startsWith('data:'))
      ? note.images
      : getSampleImages(note.images.length);
    mediaCache.set(note.id, cached);
  }
  return cached;
}

/** NIP-38 user statuses — fictional, deterministically assigned to ~1/3 of authors. */
const STATUSES = [
  'What say you?',
  'touching grass',
  'gm, probably',
  'shipping',
  'in the relay mines',
  'coffee #3',
];
export function statusFor(user: MockUser): string | null {
  const h = hashSeed(user.pubkey);
  return h % 3 === 0 ? STATUSES[h % STATUSES.length] : null;
}

/** PoW chip appears on notes mined ≥16 bits — deterministically ~1 in 5. */
export function powBitsFor(note: MockNote): number | null {
  const h = hashSeed(note.id);
  return h % 5 === 0 ? 16 + (h % 13) : null;
}

/**
 * Timestamps exactly per PostCard.kt:1297-1333 — "Ns"/"Nm"/"Nh"/"Nd" under a
 * week, then "MMM d, HH:mm" (same year) / "MMM d, yyyy".
 */
export function timeAgo(createdAt: number): string {
  const now = Math.floor(Date.now() / 1000);
  const d = Math.max(0, now - createdAt);
  if (d < 60) return `${d}s`;
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  if (d < 7 * 86400) return `${Math.floor(d / 86400)}d`;
  const date = new Date(createdAt * 1000);
  const mmmd = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (date.getFullYear() === new Date().getFullYear()) {
    const hm = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    return `${mmmd}, ${hm}`;
  }
  return `${mmmd}, ${date.getFullYear()}`;
}

/** AmountFormatter.formatShort — "1.2k" / "3.4M", else the raw integer. */
export function formatShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

/** Grouped "%,d" formatting (wallet balance, zap hero amount). */
export function formatGrouped(n: number): string {
  return n.toLocaleString('en-US');
}

/** Fallback name when no profile — npub first 12 + "..." + last 4 (PostCard.kt). */
export function truncNpub(npub: string): string {
  return npub.length > 20 ? `${npub.slice(0, 12)}...${npub.slice(-4)}` : npub;
}

/** Default quick-reaction emoji row (EmojiPicker.kt:31 — verbatim, 17 entries). */
export const QUICK_EMOJIS = [
  '🧡',
  '👍',
  '👎',
  '🤙',
  '🚀',
  '🤗',
  '😂',
  '😢',
  '👨‍💻',
  '👀',
  '✅',
  '🤡',
  '🐸',
  '💀',
  '⚡',
  '🙏',
  '🍆',
];

/** Zap preset amounts in sats (ZapPreferences.kt:19-25). */
export const ZAP_PRESETS = [21, 100, 500, 1000, 5000];

/** General-tab relay list seen in the recording (all real public relays). */
export const GENERAL_RELAYS = [
  'wss://nostr.mom',
  'wss://relay.mostr.pub',
  'wss://relay.snort.social',
  'wss://relay.ditto.pub',
  'wss://relay.mostro.network',
  'wss://nostr.bitcoiner.social',
  'wss://offchain.pub',
];

/** Strip wss:// and trailing slash — how Wisp shows relay hosts. */
export function relayHost(url: string): string {
  return url.replace(/^wss?:\/\//, '').replace(/\/$/, '');
}
