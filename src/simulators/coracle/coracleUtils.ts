/**
 * Formatting helpers, matched to what the real client prints.
 * Citations are to `coracle-social/coracle@efea13f`.
 */
import type { MockUser } from '../../data/mock';

/**
 * `formatSats` — src/util/misc.ts:116-121. Under 1000 prints plain, then K, MM,
 * BTC. The recording shows `1,1K` because the comma is the Polish decimal
 * separator; the sim renders `1.1K`, which is what an en-US visitor sees.
 */
export function formatSats(sats: number): string {
  if (sats < 1_000) return String(sats);
  if (sats < 1_000_000) return `${(sats / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  if (sats < 100_000_000) return `${(sats / 1_000_000).toFixed(1).replace(/\.0$/, '')}MM`;
  return `${(sats / 100_000_000).toFixed(2)} BTC`;
}

/** Thousands separators, as `commaFormat` (src/util/misc.ts:136-147). */
export function commaFormat(n: number): string {
  return n.toLocaleString('en-US');
}

/**
 * `quantify(n, singular, plural?)` — "1 time" / "12 times", used verbatim by
 * the relay cards and the reply expander.
 */
export function quantify(n: number, singular: string, plural?: string): string {
  const word = n === 1 ? singular : plural ?? `${singular}s`;
  return `${commaFormat(n)} ${word}`;
}

/**
 * `formatTimestamp` renders through the browser locale. The recording is a
 * Polish-locale capture, so it reads `5.08.2026, 11:59`; that shape is
 * reproduced here rather than the en-US one, and the choice is flagged in
 * screen-map §18.7.
 *
 * Takes an absolute unix timestamp, which is what `MockNote.created_at` holds.
 */
export function formatTimestamp(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getDate()}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

/** `displayRelayUrl` strips the scheme (src/util/nostr.ts). */
export function displayRelayUrl(url: string): string {
  return url.replace(/^wss:\/\//, '').replace(/^ws:\/\//, '').replace(/\/$/, '');
}

/** Truncated npub, as PersonName renders it: `npub1abc…wxyz`. */
export function shortNpub(pubkey: string): string {
  const npub = pubkey.startsWith('npub') ? pubkey : `npub1${pubkey.slice(0, 20)}`;
  return `${npub.slice(0, 9)}…${npub.slice(-5)}`;
}

/** The full-length npub shown on the profile header. */
export function fullNpub(pubkey: string): string {
  if (pubkey.startsWith('npub')) return pubkey;
  return `npub1${pubkey.slice(0, 58)}`;
}

/**
 * A deterministic 0..1 web-of-trust score. Real Coracle computes this from the
 * follow graph; the sim has a fixed fictional graph, so it is derived from the
 * pubkey to stay stable across renders and reloads.
 */
export function wotScore(pubkey: string): number {
  let h = 0;
  for (let i = 0; i < pubkey.length; i++) h = pubkey.charCodeAt(i) + ((h << 5) - h);
  return (Math.abs(h) % 80) / 100 + 0.15;
}

/** Deterministic per-note engagement, so counts never shuffle between renders. */
export function seededCount(id: string, salt: number, max: number): number {
  let h = salt;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % max;
}

export function displayName(user: MockUser | undefined | null): string {
  return user?.displayName ?? 'unknown';
}
