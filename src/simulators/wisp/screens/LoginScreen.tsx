import React, { useEffect, useRef, useState } from 'react';
import { Camera, Eye, EyeOff, QrCode } from 'lucide-react';
import { WispAvatar } from '../components/Avatar';
import { WispLogo } from '../components/WispLogo';
import { DEMO_USER } from '../wispData';
import type { LoginScreenProps } from '../types';
import {
  looksLikeRealSecretKey,
  REAL_KEY_REFUSED,
  DEMO_KEY_PLACEHOLDER,
  SECRET_INPUT_PROPS,
} from '../../shared/utils/keySafety';

/**
 * Wisp login / onboarding — screen-map.md §16.
 * Splash (avatar wall + scrim + logo + auth buttons) → "Continue with Nostr"
 * bottom sheet (key import, guarded by keySafety) → create-account step.
 */

/** Deterministic avatar-wall seeds (44px grid behind the splash scrim). */
const WALL_SEEDS = Array.from({ length: 96 }, (_, i) => `wall-${i}`);

/** Standard four-color Google "G" (splash button leading icon, 20px). */
function GoogleG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="Google">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

/** Blocky pixel-art ostrich — #A223E9 body, #FD962C beak (screen-map §1 literals). */
function OstrichIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Nostr"
    >
      <g fill="#A223E9">
        <rect x="9" y="1" width="4" height="3" />
        <rect x="9" y="4" width="2" height="4" />
        <rect x="3" y="7" width="9" height="4" />
        <rect x="2" y="6" width="2" height="3" />
        <rect x="5" y="11" width="1" height="3" />
        <rect x="9" y="11" width="1" height="3" />
        <rect x="4" y="14" width="2" height="1" />
        <rect x="8" y="14" width="2" height="1" />
      </g>
      <rect x="13" y="2" width="2" height="1" fill="#FD962C" />
      <rect x="10" y="2" width="1" height="1" fill="var(--wisp-bg)" />
    </svg>
  );
}

type LoginView = 'splash' | 'nostr' | 'create';

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [view, setView] = useState<LoginView>('splash');
  const [googleNote, setGoogleNote] = useState(false);

  // Nostr sheet state
  const [keyValue, setKeyValue] = useState('');
  const [keyRefused, setKeyRefused] = useState(false);
  const [masked, setMasked] = useState(true);

  // Create step state
  const [displayName, setDisplayName] = useState('');
  const [about, setAbout] = useState('');
  const [testing, setTesting] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const handleKeyChange = (value: string) => {
    if (looksLikeRealSecretKey(value)) {
      // Real-looking secret key: drop it immediately, never keep it in state.
      setKeyValue('');
      setKeyRefused(true);
      return;
    }
    setKeyRefused(false);
    setKeyValue(value);
  };

  const handleLogIn = () => {
    if (looksLikeRealSecretKey(keyValue)) {
      setKeyValue('');
      setKeyRefused(true);
      return;
    }
    onLogin(DEMO_USER);
  };

  const handleCreateContinue = () => {
    if (!displayName.trim() || testing) return;
    setTesting(true);
    // Full onboarding (suggestions/topics/first-post) is out of scope for the sim —
    // after the relay probe we log straight into the demo identity.
    timerRef.current = window.setTimeout(() => onLogin({ ...DEMO_USER }), 600);
  };

  const closeSheet = () => {
    if (testing) return;
    setView('splash');
  };

  const sheetOpen = view !== 'splash';

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {/* Avatar wall filling the top ~65% */}
      <div className="absolute inset-x-0 top-0 h-[65%] overflow-hidden">
        <div
          className="grid justify-center gap-1 pt-1"
          style={{ gridTemplateColumns: 'repeat(8, 44px)' }}
        >
          {WALL_SEEDS.map((seed) => (
            <WispAvatar key={seed} seed={seed} className="h-11 w-11" />
          ))}
        </div>
      </div>

      {/* Vertical scrim: transparent → background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, transparent 25%, var(--wisp-bg) 72%)' }}
      />

      {/* Foreground column */}
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col px-8 pb-8">
          <div className="mt-auto flex flex-col items-center">
            <WispLogo size={96} className="wisp-logo-float" />
            <div className="mt-2 text-[56px] font-medium lowercase leading-none text-white">
              wisp
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-3xl bg-[var(--wisp-surface-variant)] px-4 py-2 text-sm">
              <span className="h-2 w-2 rounded-full" style={{ background: '#4CAF50' }} />
              <span>383 people online now</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3" data-tour="wisp-login">
            <button
              type="button"
              onClick={() => setGoogleNote(true)}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full text-[15px] font-medium"
              style={{
                background: 'var(--wisp-google-bg)',
                color: 'var(--wisp-google-fg)',
                border: '1px solid var(--wisp-google-border)',
              }}
            >
              <GoogleG size={20} />
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => setView('nostr')}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full text-[15px] font-medium"
              style={{
                background: 'var(--wisp-nostr-bg)',
                color: 'var(--wisp-nostr-fg)',
                border: '1px solid var(--wisp-nostr-border)',
              }}
            >
              <OstrichIcon size={22} />
              Continue with Nostr
            </button>
            {googleNote && (
              <div className="mx-auto rounded-full bg-[var(--wisp-surface-variant)] px-4 py-1.5 text-[12px] text-[var(--wisp-on-surface-variant)]">
                Not available in this demo — use Nostr
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nostr / create bottom sheet — rendered at final state, no entry animation */}
      {sheetOpen && (
        <>
          <div
            role="button"
            tabIndex={0}
            aria-label="Close"
            className="absolute inset-0 z-20 cursor-pointer"
            style={{ background: 'rgba(0, 0, 0, 0.55)' }}
            onClick={closeSheet}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') closeSheet();
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 z-30 max-h-[85%] overflow-y-auto rounded-t-2xl p-6"
            style={{ background: 'var(--wisp-surface)' }}
          >
            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-[var(--wisp-on-surface-variant)] opacity-40" />

            {view === 'nostr' && (
              <div className="flex flex-col">
                <div className="mx-auto">
                  <OstrichIcon size={48} />
                </div>
                <h2 className="mt-3 text-center text-[20px] font-semibold">Continue with Nostr</h2>
                <p className="mt-2 text-center text-[14px] text-[var(--wisp-on-surface-variant)]">
                  Enter your existing key, or create a new account. Your key never leaves the
                  device.
                </p>

                <div className="relative mt-6" data-tour="wisp-keys">
                  <span className="absolute -top-2 left-2.5 z-10 bg-[var(--wisp-surface)] px-1 text-[11px] text-[var(--wisp-on-surface-variant)]">
                    nsec or npub…
                  </span>
                  <div className="flex items-center gap-2 rounded-lg border border-[var(--wisp-outline)] bg-transparent px-3 py-3">
                    <input
                      {...SECRET_INPUT_PROPS}
                      type={masked ? 'password' : 'text'}
                      value={keyValue}
                      onChange={(e) => handleKeyChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleLogIn();
                      }}
                      placeholder={DEMO_KEY_PLACEHOLDER}
                      className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[var(--wisp-on-surface-variant)]"
                    />
                    <button
                      type="button"
                      onClick={() => setMasked((m) => !m)}
                      aria-label={masked ? 'Show key' : 'Hide key'}
                      className="shrink-0 text-[var(--wisp-on-surface-variant)]"
                    >
                      {masked ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      type="button"
                      aria-label="Scan QR code"
                      className="shrink-0 text-[var(--wisp-on-surface-variant)]"
                    >
                      <QrCode size={18} />
                    </button>
                  </div>
                </div>
                {keyRefused && (
                  <p className="mt-2 text-[12px]" style={{ color: 'var(--wisp-error)' }}>
                    {REAL_KEY_REFUSED}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleLogIn}
                  className="mt-5 h-12 w-full rounded-full text-[15px] font-semibold"
                  style={{ background: 'var(--wisp-accent)', color: 'var(--wisp-on-accent)' }}
                >
                  Log In
                </button>

                <div className="wisp-divider my-4" />

                <button
                  type="button"
                  onClick={() => setView('create')}
                  className="h-12 w-full rounded-full border border-[var(--wisp-outline)] text-[15px] font-medium text-[var(--wisp-accent)]"
                >
                  Create new account
                </button>
              </div>
            )}

            {view === 'create' && (
              <div className="flex flex-col">
                <div className="mx-auto flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full bg-[var(--wisp-surface-variant)]">
                  <Camera size={36} className="text-[var(--wisp-on-surface-variant)]" />
                  <span className="text-[11px] text-[var(--wisp-on-surface-variant)]">
                    Add photo
                  </span>
                </div>

                <div className="relative mt-6">
                  <span className="absolute -top-2 left-2.5 z-10 bg-[var(--wisp-surface)] px-1 text-[11px] text-[var(--wisp-on-surface-variant)]">
                    Display name
                  </span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-lg border border-[var(--wisp-outline)] bg-transparent px-3 py-3 text-[15px] outline-none placeholder:text-[var(--wisp-on-surface-variant)]"
                  />
                </div>

                <div className="relative mt-4">
                  <span className="absolute -top-2 left-2.5 z-10 bg-[var(--wisp-surface)] px-1 text-[11px] text-[var(--wisp-on-surface-variant)]">
                    About
                  </span>
                  <textarea
                    rows={3}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="w-full resize-none rounded-lg border border-[var(--wisp-outline)] bg-transparent px-3 py-3 text-[15px] outline-none placeholder:text-[var(--wisp-on-surface-variant)]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCreateContinue}
                  disabled={!displayName.trim() || testing}
                  className="mt-5 h-12 w-full rounded-full text-[15px] font-semibold disabled:opacity-40"
                  style={{ background: 'var(--wisp-accent)', color: 'var(--wisp-on-accent)' }}
                >
                  Continue
                </button>
                {testing && (
                  <p className="mt-3 text-center text-[12px] text-[var(--wisp-on-surface-variant)]">
                    Testing relays…
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
