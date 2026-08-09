import React, { useState } from 'react';
import type { MockUser } from '../../../data/mock';
import { getRandomUsers, generateAvatarGradient } from '../../../data/mock';
import { AmethystLogo } from '../components/AmethystLogo';
import {
  looksLikeRealSecretKey,
  REAL_KEY_REFUSED,
  DEMO_KEY_PLACEHOLDER,
  SECRET_INPUT_PROPS,
} from '../../shared/utils/keySafety';

/**
 * Amethyst logged-off flow — LoginPage ↔ SignUpPage.
 *
 * Reference: docs/refs/amethyst/screen-map.md §Login / Sign up
 * (shots/login.png + shots/signup.png, 2026-08-05) read together with
 * `ui/screen/loggedOff/login/LoginScreen.kt` and `.../signup/SignUpScreen.kt`.
 *
 * Both pages are the same centred Column (20dp padding, scrollable): 150dp logo
 * → 40dp → the single field → 10dp → "Adjust Tor Settings" → 10dp → the filled
 * 50dp/35dp-radius pill → 40dp → the cross-link question → 20dp → the outlined
 * pill. The field is an M3 OutlinedTextField at its default 280dp min-width, NOT
 * full-bleed — that inset is the most recognisable thing about the screen.
 * (280 of a 411dp screen is 68% of the FULL width, hence 76% inside the 20dp
 * padding.)
 *
 * Deliberate deviations, both documented in the screen map:
 *   • the key placeholder is DEMO_KEY_PLACEHOLDER, not the real
 *     "nsec.. or npub..", and a pasted real key is refused — see keySafety.ts;
 *   • no terms checkbox: the reference render has none (not a first login).
 */

// `ic_qrcode` (drawable-mdpi, 30×30) transcribed module-for-module. Tinted with
// colorScheme.primary in the real client, hence currentColor here.
const QR_PATH =
  'M2 2h12v2h-12zM16 2h12v2h-12zM2 4h2v10h-2zM13 4h1v10h-1zM16 4h1v10h-1zM26 4h2v10h-2zM6 6h4v4h-4zM20 6h4v4h-4zM12 12h1v2h-1zM17 12h1v2h-1zM4 13h8v1h-8zM18 13h8v1h-8zM2 16h12v1h-12zM16 16h4v4h-4zM24 16h4v4h-4zM2 17h2v11h-2zM12 17h2v1h-2zM13 18h1v10h-1zM6 20h4v4h-4zM20 20h4v3h-4zM20 23h3v1h-3zM16 24h4v4h-4zM24 24h4v4h-4zM4 26h9v2h-9z';

const QrIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 30 30" className={className} fill="currentColor" aria-hidden="true">
    <path d={QR_PATH} />
  </svg>
);

// Material Symbols `Visibility` / `VisibilityOff`, the OutlinedTextField trailing icon.
const EyeIcon = ({ off = false, className = '' }: { off?: boolean; className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />
    {off && <path d="M4 4l16 16" strokeLinecap="round" />}
  </svg>
);

interface LoginScreenProps {
  onLogin: (user: MockUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keyWarning, setKeyWarning] = useState(false);
  const [displayName, setDisplayName] = useState('');

  // Refuse real secret keys: drop from state, don't hold. See keySafety.ts.
  const onKeyChange = (value: string) => {
    if (looksLikeRealSecretKey(value)) {
      setKey('');
      setKeyWarning(true);
      return;
    }
    setKeyWarning(false);
    setKey(value);
  };

  const handleLogin = () => onLogin(getRandomUsers(1)[0]);

  const handleSignUp = () => {
    const name = displayName.trim() || 'Ostrich McAwesome';
    const pubkey = `npub1demo${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    onLogin({
      pubkey,
      displayName: name,
      username: name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'ostrich',
      avatar: generateAvatarGradient(pubkey), // local, offline — no DiceBear
      bio: 'Just joined Nostr!',
      followersCount: 0,
      followingCount: 0,
      createdAt: Math.floor(Date.now() / 1000),
      lastActive: Math.floor(Date.now() / 1000),
    });
  };

  const field =
    'w-[76%] h-14 rounded bg-transparent border border-[var(--md-outline)] text-[16px] text-[var(--md-on-surface)] placeholder:text-[var(--md-on-surface-variant)] focus:outline-none focus:border-[var(--md-primary)]';

  // Button geometry is shared: 50dp tall, 35dp radius, label inset 40dp.
  const pill = 'h-[50px] rounded-[35px] px-10 text-[14px] font-medium tracking-[0.1px] shrink-0';
  const filled = `${pill} bg-[var(--md-primary)] text-[var(--md-on-primary)]`;
  // [REC vs REPO] M3 would tint an OutlinedButton's label with `primary`; the
  // real render keeps it on-surface white with a neutral outline.
  const outlined = `${pill} border border-[var(--md-outline)] text-[var(--md-on-surface)]`;

  return (
    <div className="h-full w-full bg-[var(--md-background)] overflow-y-auto" data-tour="amethyst-login">
      <div className="min-h-full flex flex-col items-center justify-center px-5 py-6">
        <AmethystLogo className="w-[36%] max-w-[150px] shrink-0" />

        {mode === 'login' ? (
          <>
            <div className="h-10 shrink-0" />

            {/* Anchor for FAQ mini-tours that talk about the key field itself.
                The MAIN tour's login step deliberately does NOT use it — see the
                note in src/data/tours/amethyst-tour.ts. */}
            <div data-tour="amethyst-login-key" className={`${field} flex items-center gap-1 px-3`}>
              <button
                type="button"
                aria-label="Login with QR Code"
                className="w-11 h-11 -ml-1.5 flex items-center justify-center text-[var(--md-primary)] shrink-0"
              >
                <QrIcon className="w-6 h-6" />
              </button>
              <input
                {...SECRET_INPUT_PROPS}
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => onKeyChange(e.target.value)}
                placeholder={DEMO_KEY_PLACEHOLDER}
                className="flex-1 min-w-0 bg-transparent text-[16px] text-[var(--md-on-surface)] placeholder:text-[var(--md-on-surface-variant)] focus:outline-none"
              />
              <button
                type="button"
                aria-label={showKey ? 'Hide password' : 'Show password'}
                onClick={() => setShowKey((v) => !v)}
                className="w-11 h-11 -mr-1.5 flex items-center justify-center text-[var(--md-on-surface)] shrink-0"
              >
                <EyeIcon off={showKey} className="w-6 h-6" />
              </button>
            </div>

            {keyWarning && (
              <p className="w-[76%] mt-2 text-[12px] leading-snug text-[var(--md-error)]">{REAL_KEY_REFUSED}</p>
            )}

            <TorSettingsRow />

            <button type="button" onClick={handleLogin} className={filled}>
              Login
            </button>

            <div className="h-10 shrink-0" />

            <p className="text-[16px] text-[var(--md-on-background)]">Don't have a Nostr account?</p>

            <div className="h-5 shrink-0" />

            <button type="button" onClick={() => setMode('signup')} className={outlined}>
              Sign Up
            </button>
          </>
        ) : (
          <>
            <div className="h-10 shrink-0" />

            <h1 className="text-[22px] text-[var(--md-on-background)]">Welcome Ostrich!</h1>

            <div className="h-5 shrink-0" />

            <p className="text-[16px] font-medium text-[var(--md-on-background)]">How should we call you?</p>

            <div className="h-5 shrink-0" />

            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ostrich McAwesome"
              autoComplete="off"
              spellCheck={false}
              className={`${field} px-4`}
            />

            <TorSettingsRow />

            <button type="button" onClick={handleSignUp} className={filled}>
              Create Account
            </button>

            <div className="h-10 shrink-0" />

            <p className="text-[16px] text-[var(--md-on-background)]">Already have a Nostr account?</p>

            <div className="h-5 shrink-0" />

            <button type="button" onClick={() => setMode('login')} className={outlined}>
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// `TorSettingsSetup` — the whole row is one clickable Text; only the second
// half ("Tor Settings", strings connect_via_tor2) carries the primary tint.
const TorSettingsRow = () => (
  <>
    <div className="h-2.5 shrink-0" />
    <p className="text-[16px] text-[var(--md-on-background)]">
      Adjust <span className="text-[var(--md-primary)]">Tor Settings</span>
    </p>
    <div className="h-2.5 shrink-0" />
  </>
);

export default LoginScreen;
