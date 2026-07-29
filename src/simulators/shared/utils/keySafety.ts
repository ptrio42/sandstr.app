/**
 * Key-safety tripwire for the simulated sign-in screens.
 *
 * WHY THIS EXISTS. Every reproduction here is a pixel-faithful clone of a real
 * client. Several of them had a `type="password"` field labelled "Paste your
 * nsec private key" whose handler accepted any string and "logged you in" —
 * one of them under the reassurance "Your keys never leave this device. You are
 * in control." A faithful clone of a real app that asks for your secret key and
 * promises it is safe is structurally a phishing page, regardless of the
 * SIMULATION banner above it, and publishing that would have taught visitors
 * exactly the habit that gets Nostr users drained.
 *
 * So the sims still SHOW the import affordance — it is part of the real
 * interface and removing it would cost fidelity — but they never ask for a real
 * key, and if someone pastes one anyway we refuse it, drop it, and say why.
 *
 * NO CRYPTO, NO NETWORK, NO DEPENDENCY: this is a prefix-and-charset shape
 * check, not a bech32 decode. It cannot and must not validate a key — the point
 * is to reject, never to accept.
 */

/** Bech32 charset (NIP-19). Excludes 1, b, i and o by design. */
const BECH32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

/**
 * True when the input looks like it could be a REAL secret key, so we must
 * refuse it. Deliberately loose: a false positive costs a visitor nothing (the
 * demo accepts anything anyway), a false negative could mean a real nsec
 * sitting in component state.
 */
export function looksLikeRealSecretKey(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (v.startsWith('nsec1')) {
    // Real nsec is 63 chars. Anything with a substantial bech32-shaped body
    // is treated as real — we do not verify the checksum, we just get out of
    // the way of it.
    const body = v.slice(5);
    return body.length >= 20 && [...body].every((c) => BECH32.includes(c));
  }
  // A raw 64-char hex secret key is the other importable form.
  return /^[0-9a-f]{64}$/.test(v);
}

/** The one sentence shown when the tripwire fires. Plain, not scolding. */
export const REAL_KEY_REFUSED =
  'That looks like a real private key — discarded, not used. Never paste a real nsec into a site you are only trying out. This is a simulation; tap Sign in to continue with a demo account.';

/**
 * Placeholder copy for the simulated key field. Never says "paste your nsec":
 * the demo takes anything, so asking for the real thing buys no fidelity and
 * costs a habit.
 */
export const DEMO_KEY_PLACEHOLDER = 'nsec1… (demo only — never paste a real key)';

/** Props every simulated key input should spread, so none of them leaks. */
export const SECRET_INPUT_PROPS = {
  type: 'password' as const,
  autoComplete: 'off' as const,
  spellCheck: false,
  autoCorrect: 'off',
  autoCapitalize: 'off',
  'data-1p-ignore': true,
  'data-lpignore': 'true',
} as const;
