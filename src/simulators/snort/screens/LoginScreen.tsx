import { useState } from 'react';
import type { MockUser } from '../../../data/mock';
import { Icon } from '../components/Icon';

/**
 * Snort — Onboarding / Sign In (`/login`).
 *
 * Rebuilt from `docs/refs/snort/screen-map.md` §15 (+ §3 for the pill system,
 * §1 for the tokens and §16 for the brand mark), which is the authority for
 * every decision below. Upstream is `Pages/onboarding/index.tsx` (the shell)
 * and `Pages/onboarding/sign-in.tsx` (this screen).
 *
 * Shell (§15, verbatim from `Pages/onboarding/index.tsx`):
 *
 *   <div className="p-6">
 *     <div className="float-right flex gap-2 items-center">
 *       <Icon name="translate" /> <select className="capitalize">…</select>
 *     </div>
 *     <div className="w-[460px] max-w-full mx-auto my-auto mt-[15vh]
 *                     rounded-lg px-8 py-7 layer-1">
 *
 * So: a 460px `layer-1` card pushed down 15vh, with a translate icon and a
 * language `<select>` FLOATED top-right — not a header bar, an actual
 * `float-right`. `[REC ✓ gray card centered in the feed column, translate icon
 * + a select showing "العربية" top-right.]` Onboarding is *not* a standalone
 * shell: the left NavSidebar (and per §5 the right column's search box) keep
 * rendering, which is why this component draws only the centre column — the
 * SnortSimulator shell mounts the Rail and RightColumn around it.
 *
 * Card body is `flex flex-col gap-6`, with the heading + subtitle nested in a
 * `flex flex-col gap-4 items-center` block (§15, screen 1). Label strings are
 * verbatim from the intl catalogue in §15's table (`Ub+AGc`, `eF0Re7`,
 * `TaeBqw`, `aMaLBK`, `X6tipZ`, `25WwxF`, `39AHJm`).
 *
 * Three deliberate divergences, each explained at its call site below:
 *   1. the brand mark is a monogram placeholder, not Snort's raster ostrich;
 *   2. there is NO private-key field — the sim never solicits a real key;
 *   3. "Supported Extensions" is inert, mirroring upstream's dead empty href.
 *
 * Accent discipline (§1): the only colour on this screen is `--snort-warning`
 * `#ff8800` on the NIP-07 key badge. `--snort-highlight` violet carries the
 * "Supported Extensions" link. `--snort-primary` orange-red does NOT appear
 * here — it is compose/CTA only, and none of these buttons is `.primary`.
 * Everything else is a white pill, exactly as §3 prescribes for a bare
 * `<button>` (and, in light mode, as §3.1's specificity trap enforces anyway).
 */

export interface LoginScreenProps {
  onLogin: (u: MockUser) => void;
  users: MockUser[];
}

/**
 * Fallback identity for the case where the mock module has not resolved yet
 * (the shell loads `src/data/mock` lazily, so `users` is `[]` on first paint).
 * Mirrors the shape the shell itself falls back to in its `login` tour command.
 * Timestamps are FIXED constants, never `Date.now()` — this screen must render
 * identically on every pass. `avatar` is empty on purpose: no remote URLs.
 */
const DEMO_USER: MockUser = {
  pubkey: 'npub1snortdemo',
  displayName: 'Snort User',
  username: 'snortuser',
  avatar: '',
  bio: 'Exploring Nostr with Snort',
  nip05: 'demo@snort.social',
  followersCount: 256,
  followingCount: 128,
  createdAt: 1_700_000_000,
  lastActive: 1_700_000_000,
};

/**
 * Upstream renders every language code the app is translated into. A short,
 * static slice is enough to reproduce the control; the recording happens to
 * show "العربية" in this select, so the list keeps native names like the real
 * one (the `capitalize` class is upstream's, and is a no-op on non-Latin).
 */
const LANGUAGES: Array<{ code: string; label: string }> = [
  { code: 'en', label: 'english' },
  { code: 'es', label: 'español' },
  { code: 'de', label: 'deutsch' },
  { code: 'fr', label: 'français' },
  { code: 'pt', label: 'português' },
  { code: 'ja', label: '日本語' },
  { code: 'ar', label: 'العربية' },
];

export function LoginScreen({ onLogin, users }: LoginScreenProps) {
  const [language, setLanguage] = useState('en');

  /**
   * SECURITY — deliberate divergence from the real client.
   *
   * Real Snort's "Sign in with key" swaps in a text field whose placeholder is
   * "nsec, npub, nip-05, hex, mnemonic", and `useLoginHandler` will happily
   * accept a real nsec — it even AUTO-SUBMITS the moment a bech32 string is
   * pasted, and stores it unencrypted during onboarding (§15). Sandstr must
   * never teach that gesture nor give anyone a place to perform it, so this
   * simulator ships NO private-key input at all: no nsec field, no "nsec…"
   * placeholder, no key parsing. Every button here is the same door into the
   * demo — it hands back a mock identity and nothing else. This is the fix in
   * commit 2b885f2 ("stop soliciting private keys") applied to the rebuild.
   */
  const enterDemo = () => onLogin(users[0] ?? DEMO_USER);

  return (
    <div className="p-6">
      {/* Language picker — upstream is a literal `float-right`, not a header. */}
      <div className="float-right flex gap-2 items-center">
        <Icon name="translate" />
        <select
          className="snort-input capitalize !w-auto"
          aria-label="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* The 460px layer-1 card. `!px-8 !py-7` because `.snort-layer-1` carries
          its own padding at equal specificity (ProfileScreen uses the same
          escape hatch). */}
      <div
        data-tour="snort-login"
        className="snort-login snort-layer-1 w-[460px] max-w-full mx-auto my-auto rounded-lg !px-8 !py-7 flex flex-col gap-6"
        style={{ marginTop: '15vh' }}
      >
        {/*
          BRAND MARK — deliberate substitution.

          Upstream is `<img src={CONFIG.icon} width={48} height={48}
          className="rounded-lg mr-auto ml-auto" />` = `nostrich_512.png`, a
          raster painterly close-up of a violet→pink ostrich head (§16). It is a
          bitmap: it cannot be redrawn as paths, and §16's SHIP-AND-GRANT note is
          explicit that we must NOT ship it until Kieran (v0l) grants consent.
          So this is the same 48px rounded-lg footprint filled with the app
          monogram "S" — itself Snort's own fallback idiom (`LogoHeader.tsx`
          renders `CONFIG.appName[0]` in a rounded-lg tile when `navLogo` is
          null) — over `--snort-gradient`, the violet→pink ramp that the real
          artwork is the reason for. No raster, no remote request.
        */}
        <div
          className="w-12 h-12 rounded-lg mr-auto ml-auto flex items-center justify-center text-2xl font-bold text-white select-none"
          style={{ background: 'var(--snort-gradient)' }}
          aria-hidden="true"
        >
          S
        </div>

        {/* Heading block — `flex flex-col gap-4 items-center` (§15). */}
        <div className="flex flex-col gap-4 items-center">
          <h1 className="snort-h1 text-center">Sign In</h1>
          <p className="text-center">Use a nostr signer extension to sign in</p>
        </div>

        {/* NIP-07 CTA. A plain AsyncButton (→ white pill) wrapping a
            `rounded-full bg-warning p-3 text-white` badge holding the key
            glyph: an #ff8800 circle inside a white pill. [REC ✓] */}
        <button type="button" className="snort-btn" onClick={enterDemo}>
          <span
            className="rounded-full p-3 text-white flex items-center justify-center"
            style={{ backgroundColor: 'var(--snort-warning)' }}
          >
            <Icon name="key" />
          </span>
          <span className="font-bold">Sign in with Nostr Extension</span>
        </button>

        {/* Upstream: `<Link to="" className="highlight">` — an EMPTY href, so
            the link is dead, and `.highlight` is an undefined utility (the real
            one would be `text-highlight`). We keep it visually violet via
            `.snort-link` and keep it inert, which matches what it actually does
            and avoids nesting an interactive element in the button column. */}
        <span className="snort-link text-center">Supported Extensions</span>

        {/* Real Snort swaps this for the key form. Here it is just another door
            into the demo — see the `enterDemo` comment above. */}
        <button type="button" className="snort-btn" onClick={enterDemo}>
          Sign in with key
        </button>

        <p className="text-center">Don&apos;t have an account?</p>

        <button type="button" className="snort-btn secondary" onClick={enterDemo}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default LoginScreen;
