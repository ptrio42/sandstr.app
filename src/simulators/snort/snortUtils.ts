import { getSampleImages } from '../../data/mock/utils';

/**
 * Small helpers that mirror real Snort's formatting exactly.
 * Citations are to `docs/refs/snort/screen-map.md`.
 */

/**
 * `Utils/Number.ts:6-16` — note the threshold: anything under 2000 renders as a
 * RAW INTEGER (so `1543`, not `1.5K`), and only then does it switch to K/M/G
 * with at most 2 fraction digits.
 */
export function formatShort(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0';
  if (n < 2000) return String(Math.round(n));
  const fmt = (v: number) => new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(v);
  if (n < 1e6) return `${fmt(n / 1e3)}K`;
  if (n < 1e9) return `${fmt(n / 1e6)}M`;
  return `${fmt(n / 1e9)}G`;
}

/**
 * `NoteTime.tsx:15-60`: <60s "now" · <1h "{n}m" · <24h "{n}h" · same calendar
 * year "Jul 14" · older "Jul 14, 2024".
 *
 * Upstream computes this once via useState and never re-ticks while mounted;
 * we're equally static, which matches.
 */
export function noteTime(createdAtSeconds: number, now: number = Date.now()): string {
  const deltaMs = now - createdAtSeconds * 1000;
  const secs = Math.max(0, Math.floor(deltaMs / 1000));
  if (secs < 60) return 'now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;

  const d = new Date(createdAtSeconds * 1000);
  const sameYear = d.getFullYear() === new Date(now).getFullYear();
  // Locale is pinned to 'en' on purpose. Upstream passes `undefined` (the
  // browser locale) because the real client is localized into 40 languages;
  // this simulation is English-only, so following the visitor's locale produced
  // dates like "29 lip" sitting inside an otherwise English UI.
  return d.toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/**
 * The "via {client}" sub-header line (`Note/ClientTag.tsx`) — one of Snort's
 * most distinctive and cheapest fidelity signals. Upstream reads the event's
 * `client` tag and, when there is none, FINGERPRINTS the event and shows its
 * guess. We do the same in spirit: prefer a real tag, otherwise derive a stable
 * guess from the note id.
 */
const CLIENTS = ['Snort', 'Damus', 'Amethyst', 'Primal', 'Coracle', 'YakiHonne', 'Gossip', 'Nostur'];

export function clientTag(noteId: string, tags?: string[][]): string {
  const tagged = tags?.find((t) => t[0] === 'client')?.[1];
  if (tagged) return tagged;
  let h = 0;
  for (let i = 0; i < noteId.length; i++) h = (h * 31 + noteId.charCodeAt(i)) >>> 0;
  return CLIENTS[h % CLIENTS.length];
}

/**
 * `getSampleImages` walks a module-level counter, so calling it during render
 * returns a DIFFERENT image every time and the feed flickers on each re-render.
 * Memoise per note id so a given note keeps its picture.
 */
const imageCache = new Map<string, string[]>();

export function noteImages(noteId: string, count: number): string[] {
  const key = `${noteId}:${count}`;
  let cached = imageCache.get(key);
  if (!cached) {
    cached = getSampleImages(count);
    imageCache.set(key, cached);
  }
  return cached;
}

/**
 * Body truncation. `TEXT_TRUNCATE_LENGTH = 400` in the timeline, with a
 * `text-highlight` "Show more" / "Show less" toggle (§4.3).
 */
export const TEXT_TRUNCATE_LENGTH = 400;

/** Deterministic pseudo-random in [0,1) from a string — replaces Math.random(). */
export function seededUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/** npub-style short id, the way Snort truncates a missing display name to 12 chars. */
export function shortNpub(pubkey: string): string {
  const base = pubkey.startsWith('npub') ? pubkey : `npub1${pubkey}`;
  return base.slice(0, 12);
}

/**
 * NIP-13 proof-of-work difficulty for a note, or `null` when the note carries no
 * `nonce` tag — which is the ordinary case (§4.4, column 4).
 *
 * Upstream reads the difficulty off the event: the icon renders only when
 * `findTag(ev, "nonce")` exists and `CONFIG.showPowIcon` is on, and the number
 * shown is the count of leading zero BITS in the event id. Neither input exists
 * here: mock notes have no nonce tags, and `mockNotes` builds every `id` from
 * `generateHex()` at import time, so ids are re-randomised on every reload and
 * anything derived from them would flicker between sessions.
 *
 * So the seed is the note CONTENT, which is a fixed template string. Same note,
 * same badge, every reload. The ~28% hit rate and the 16-25 bit band are chosen
 * to look like a real feed, where a minority of notes are mined and the ones
 * that are cluster around 20.
 */
export function powDifficulty(seed: string): number | null {
  if (seededUnit(`pow:${seed}`) > 0.28) return null;
  return 16 + Math.floor(seededUnit(`pow-bits:${seed}`) * 10);
}

/**
 * Index of the note this one quote-embeds, or `null` for the majority that quote
 * nothing (§4.3).
 *
 * Real Snort finds a `nostr:nevent1…` reference in the content and renders the
 * referenced event inline. Mock content has no such references, so — as with
 * `powDifficulty` — the choice is seeded from the content string and stable.
 */
export function quotedNoteIndex(seed: string, total: number): number | null {
  if (total < 2) return null;
  if (seededUnit(`quote:${seed}`) > 0.18) return null;
  return Math.floor(seededUnit(`quote-idx:${seed}`) * total);
}

/**
 * The `#nevent1…` text link a quote degrades to past depth 1 (§4.3). Snort
 * bech32-encodes the event; the shape, not the encoding, is what shows.
 */
export function neventRef(noteId: string): string {
  return `#nevent1${noteId.replace(/[^a-z0-9]/gi, '').slice(0, 12).toLowerCase()}`;
}
