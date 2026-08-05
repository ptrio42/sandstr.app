/**
 * "Welcome!" — the login modal (`Login.svelte`), spec §9.1.
 *
 * WORTH READING BEFORE EDITING. Coracle's login screen has **no secret-key
 * field**: no nsec paste, no "generate a key here", no email. Every method is a
 * delegation — a browser extension, a NIP-55 app, or a remote signer — and
 * `loginWithNip01` is called from exactly one place in the whole client
 * (`src/main.js:39`, the nstart return leg), never from UI.
 *
 * That makes this the most key-safe sign-in of any client reproduced in this
 * repo, and reproducing it faithfully means shipping no key input at all. So
 * this file deliberately does NOT import `keySafety.ts`: there is nothing here
 * to guard, and adding a field just to guard it would be inventing a phishing
 * surface the real client does not have.
 */
import React from 'react';
import { Icon } from '../components/Icon';

interface LoginScreenProps {
  onLogin: () => void;
  onSignUp: () => void;
  onRemoteSigner: () => void;
  onExternal: (what: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onSignUp,
  onRemoteSigner,
  onExternal,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      margin: '0 auto',
      width: '100%',
      maxWidth: '28rem',
      gap: '1.5rem',
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <h1 className="co-staatliches" style={{ fontSize: '3.75rem', margin: '1rem 0', lineHeight: 1 }}>
        Welcome!
      </h1>
      <p>
        Coracle is built using the{' '}
        <button type="button" className="co-link" onClick={() => onExternal('nostr.com')}>
          nostr protocol
        </button>
        , which allows you to own your social identity.
      </p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Row 1 of §9.1 — present when a NIP-07 extension is detected, which is
          the state the recording captured. Here it is the demo sign-in. */}
      <button type="button" className="co-btn co-btn-tall co-btn-accent" onClick={onLogin}>
        <Icon name="plus" size={15} /> Use Browser Extension
      </button>
      <button type="button" className="co-btn co-btn-tall" onClick={onRemoteSigner}>
        <Icon name="lock" size={15} /> Use Remote Signer
      </button>
      <button
        type="button"
        className="co-btn co-btn-tall co-btn-low"
        onClick={() => onExternal('nostrapps.com')}
      >
        <Icon name="earth" size={15} /> Browse Signer Apps
      </button>
    </div>

    <span style={{ textAlign: 'center' }}>
      Need an account?{' '}
      <button type="button" className="co-link" onClick={onSignUp}>
        Register instead
      </button>
    </span>
  </div>
);

/**
 * `LoginBunker.svelte` — "Login with Signer", spec §9.2. A QR code plus a
 * `bunker://` input. The input takes a CONNECTION string, not a secret key, so
 * it is a plain text field.
 */
export const RemoteSignerScreen: React.FC<{ onBack: () => void; onContinue: () => void }> = ({
  onBack,
  onContinue,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      margin: '0 auto',
      width: '100%',
      maxWidth: '28rem',
      gap: '1rem',
      textAlign: 'center',
    }}
  >
    <h1 className="co-staatliches" style={{ fontSize: '3rem', margin: '1rem 0', lineHeight: 1 }}>
      Login with Signer
    </h1>
    <p>
      To log in using a remote signer, scan the QR code below or enter a connection link.{' '}
      <span className="co-link">What&apos;s a signer?</span>
    </p>

    {/* A deterministic decorative QR-like block. Rendering a scannable code for
        a connection that does not exist would be worse than not rendering one. */}
    <div
      style={{
        margin: '0 auto',
        borderRadius: '0.75rem',
        background: '#fff',
        padding: '0.75rem',
        width: 'fit-content',
      }}
      aria-label="Simulated connection QR code"
      role="img"
    >
      <svg width="168" height="168" viewBox="0 0 21 21" shapeRendering="crispEdges">
        <rect width="21" height="21" fill="#fff" />
        {Array.from({ length: 21 }).map((_, y) =>
          Array.from({ length: 21 }).map((__, x) => {
            const corner = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
            const ring =
              corner &&
              (x % 7 === 0 || x % 7 === 6 || y % 7 === 0 || y % 7 === 6 || (x % 7 >= 2 && x % 7 <= 4 && y % 7 >= 2 && y % 7 <= 4));
            const on = corner ? ring : (x * 7 + y * 13 + ((x * y) % 5)) % 3 === 0;
            return on ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#000" /> : null;
          }),
        )}
      </svg>
    </div>

    <div style={{ position: 'relative' }}>
      <input
        className="co-input"
        style={{ paddingLeft: '2.25rem' }}
        placeholder="bunker://..."
        aria-label="Connection link"
        autoComplete="off"
        spellCheck={false}
      />
      <span
        style={{
          position: 'absolute',
          left: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--co-neutral-500)',
          pointerEvents: 'none',
        }}
      >
        <Icon name="lock" size={12} />
      </span>
    </div>

    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button type="button" className="co-btn" onClick={onBack}>
        <Icon name="arrow-left" size={14} /> Back
      </button>
      <button
        type="button"
        className="co-btn co-btn-accent"
        style={{ flexGrow: 1 }}
        onClick={onContinue}
      >
        Continue
      </button>
    </div>
  </div>
);
