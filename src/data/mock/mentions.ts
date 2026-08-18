import type { MockUser } from './types';
import { mockUsers } from './users';

/**
 * `nostr:` references inside note text (NIP-21).
 *
 * Every client here renders these as something other than the raw token: the
 * name of the person for a profile reference, an embedded card or a short
 * reference for an event. Coracle's screen-map §7.3.1 lists them explicitly in
 * `@welshman/content`'s parser array (`address · profile · … · event`), and
 * Amethyst's own gaps entry (ame-82) is about exactly this — a mention that
 * renders as `@<hex-ish token>` is a reproduction bug, not a faithful detail.
 *
 * What this canNOT do is resolve a REAL npub to a real name: that needs a relay,
 * and this site has no network. So the rule is the one a real client follows
 * when it has no metadata cached — show a shortened, recognisable reference.
 * A visitor pasting their own note sees the same shape they would see in a
 * client that has not met that person yet.
 */

export type MentionKind = 'profile' | 'event' | 'address';

export interface Mention {
  kind: MentionKind;
  /** The full `nostr:…` token as it appeared. */
  token: string;
  /** What a client would put on screen, WITHOUT its own `@` prefix. */
  label: string;
  /** Set only when the reference happens to be one of the mock identities. */
  user?: MockUser;
}

/**
 * Bech32 (BIP-173) excludes `1`, `b`, `i` and `o` from its charset, so the body
 * after the `1` separator is matched with that alphabet rather than `\w+` — a
 * looser pattern swallows trailing words when a mention ends a sentence.
 */
const BECH32_BODY = '[023456789acdefghjklmnpqrstuvwxyz]+';
const PREFIXES = 'npub1|nprofile1|note1|nevent1|naddr1';

/** Global + capturing, for `String.split()` in the renderers. */
export const MENTION_SPLIT_RE = new RegExp(`(nostr:(?:${PREFIXES})${BECH32_BODY})`, 'gi');

/** Non-global twin, for testing a single token. */
export const MENTION_TOKEN_RE = new RegExp(`^nostr:(?:${PREFIXES})${BECH32_BODY}$`, 'i');

function kindOf(id: string): MentionKind {
  if (id.startsWith('npub1') || id.startsWith('nprofile1')) return 'profile';
  if (id.startsWith('naddr1')) return 'address';
  return 'event';
}

/** `npub1abcdef…uvwxyz` — the shape a client shows for an unknown reference. */
function shorten(id: string): string {
  return id.length > 20 ? `${id.slice(0, 10)}…${id.slice(-6)}` : id;
}

export function resolveMention(token: string): Mention {
  const id = token.replace(/^nostr:/i, '');
  const kind = kindOf(id);
  // Mock notes carry mock npubs, so a mention inside the sample feed still
  // resolves to a real name on the roster.
  const user = kind === 'profile' ? mockUsers.find((u) => u.pubkey === id) : undefined;
  return { kind, token, label: user ? user.displayName : shorten(id), user };
}

/** True when this token is a profile mention, i.e. renders with an `@`. */
export function isProfileMention(token: string): boolean {
  return MENTION_TOKEN_RE.test(token) && kindOf(token.replace(/^nostr:/i, '')) === 'profile';
}
