/**
 * Settings — spec §17. Five routes, each a 60px display heading over a
 * one-line subtitle, then fields, then a sticky Save.
 *
 * Note what is NOT here: a theme picker. Coracle's theme toggle lives only in
 * the sidebar's Settings submenu, never on a settings page.
 */
import React, { useState } from 'react';
import type { MockUser } from '../../../data/mock';
import { Icon } from '../components/Icon';
import { commaFormat, fullNpub } from '../coracleUtils';

export type SettingsPage = 'app' | 'content' | 'data' | 'keys' | 'wallet';

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div
      style={{
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <h1 className="co-staatliches" style={{ fontSize: '3.75rem', margin: '1rem 0', lineHeight: 1 }}>
        {title}
      </h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

function Field({
  label,
  info,
  right,
  children,
}: {
  label: string;
  info: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <strong>{label}</strong>
        {right}
      </div>
      {children}
      <p style={{ fontSize: '0.8125rem', color: 'var(--co-neutral-400)' }}>{info}</p>
    </div>
  );
}

function InlineField({
  label,
  info,
  on,
  onToggle,
}: {
  label: string;
  info: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <strong>{label}</strong>
        <button
          type="button"
          className={`co-toggle ${on ? 'is-on' : ''}`}
          role="switch"
          aria-checked={on}
          aria-label={label}
          onClick={onToggle}
        >
          <span />
        </button>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--co-neutral-400)' }}>{info}</p>
    </div>
  );
}

const NOTE_ACTIONS = ['zaps', 'replies', 'reactions', 'reposts', 'recommended_apps'] as const;

export const SettingsScreen: React.FC<{
  page: SettingsPage;
  currentUser: MockUser | null;
  onSave: () => void;
  onCopy: (what: string) => void;
}> = ({ page, currentUser, onSave, onCopy }) => {
  const [zap, setZap] = useState(21);
  const [split, setSplit] = useState(0);
  const [delay, setDelay] = useState(0);
  const [pow, setPow] = useState(0);
  const [relayLimit, setRelayLimit] = useState(3);
  const [toggles, setToggles] = useState({
    auth: true,
    analytics: true,
    fingerprint: false,
    media: true,
    sensitive: true,
  });
  const [wot, setWot] = useState(0);
  const [minPow, setMinPow] = useState(0);
  const [actions, setActions] = useState<string[]>([...NOTE_ACTIONS]);
  const [showKey, setShowKey] = useState(false);

  const flip = (k: keyof typeof toggles) => setToggles((t) => ({ ...t, [k]: !t[k] }));

  if (page === 'app') {
    return (
      <>
        <Heading title="App Settings" subtitle="Make Coracle work the way you want it to." />
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column', gap: '2rem' }}>
          <Field
            label="Default zap amount"
            info="The default amount of sats to use when sending a lightning tip."
          >
            <input
              className="co-input"
              style={{ height: '2.25rem' }}
              value={zap}
              onChange={(e) => setZap(Number(e.target.value) || 0)}
              aria-label="Default zap amount"
            />
          </Field>
          <Field
            label="Platform zap split"
            right={<span>{Math.round(split * 100)}%</span>}
            info="How much you'd like to tip the developer of Coracle whenever you send a zap."
          >
            <input
              type="range"
              className="co-range"
              min={0}
              max={0.5}
              step={0.01}
              value={split}
              onChange={(e) => setSplit(Number(e.target.value))}
              aria-label="Platform zap split"
            />
          </Field>
          <Field
            label="Send Delay"
            right={<span>{delay / 1000} seconds</span>}
            info="A delay period allowing you to cancel a reply or note creation, in seconds."
          >
            <input
              type="range"
              className="co-range"
              min={0}
              max={15000}
              step={1000}
              value={delay}
              onChange={(e) => setDelay(Number(e.target.value))}
              aria-label="Send delay"
            />
          </Field>
          <Field
            label="Proof Of Work"
            right={<span>difficulty {pow}</span>}
            info="Add a proof-of-work stamp to your notes to increase your reach."
          >
            <input
              type="range"
              className="co-range"
              min={0}
              max={32}
              value={pow}
              onChange={(e) => setPow(Number(e.target.value))}
              aria-label="Proof of work"
            />
          </Field>
          <Field
            label="Max relays per request"
            right={<span>{relayLimit} relays</span>}
            info="This controls how many relays to max out at when loading feeds and event context. More is faster, but will require more bandwidth and processing power."
          >
            <input
              type="range"
              className="co-range"
              min={1}
              max={10}
              value={relayLimit}
              onChange={(e) => setRelayLimit(Number(e.target.value))}
              aria-label="Max relays per request"
            />
          </Field>
          <InlineField
            label="Authenticate with relays"
            info="Allows Coracle to authenticate with relays that have access controls automatically."
            on={toggles.auth}
            onToggle={() => flip('auth')}
          />
          <InlineField
            label="Report errors and analytics"
            info="Keep this enabled if you would like developers to be able to know what features are used, and to diagnose and fix bugs."
            on={toggles.analytics}
            onToggle={() => flip('analytics')}
          />
          <InlineField
            label="Enable client fingerprinting"
            info={`If this is turned on, public notes you create will have a "client" tag added. This helps with troubleshooting, and allows other people to find out about Coracle.`}
            on={toggles.fingerprint}
            onToggle={() => flip('fingerprint')}
          />
          <button type="button" className="co-btn" style={{ width: '100%' }} onClick={onSave}>
            Save
          </button>
        </div>
      </>
    );
  }

  if (page === 'content') {
    return (
      <>
        <Heading title="Content Settings" subtitle="Control who and what you see on Coracle." />
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column', gap: '2rem' }}>
          <Field
            label="Note actions"
            info="Controls which icons appear at the bottom of any given note. Disabling these can reduce how much data Coracle uses."
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {NOTE_ACTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`co-chip ${actions.includes(a) ? 'co-chip-accent' : ''}`}
                  onClick={() =>
                    setActions((prev) =>
                      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
                    )
                  }
                >
                  {a}
                </button>
              ))}
            </div>
          </Field>
          <InlineField
            label="Show images and link previews"
            info="If enabled, Coracle will automatically show images and previews for embedded links."
            on={toggles.media}
            onToggle={() => flip('media')}
          />
          <InlineField
            label="Hide sensitive content"
            info="If enabled, content flagged by the author as potentially sensitive will be hidden."
            on={toggles.sensitive}
            onToggle={() => flip('sensitive')}
          />
          <Field
            label="Minimum WoT score"
            right={<span>{wot}</span>}
            info="Select a minimum web-of-trust score. Notes from accounts with a lower score will be automatically hidden."
          >
            <input
              type="range"
              className="co-range"
              min={-10}
              max={10}
              value={wot}
              onChange={(e) => setWot(Number(e.target.value))}
              aria-label="Minimum WoT score"
            />
          </Field>
          <Field
            label="Minimum Proof of Work"
            right={<span>difficulty {minPow}</span>}
            info="Select a minimum proof-of-work difficulty for notes from people outside your network. If a note fails to meet both your minimum web of trust score and minimum proof-of-work difficulty, it will be hidden."
          >
            <input
              type="range"
              className="co-range"
              min={0}
              max={32}
              value={minPow}
              onChange={(e) => setMinPow(Number(e.target.value))}
              aria-label="Minimum proof of work"
            />
          </Field>
          <p>Mutes</p>
          <Field
            label="Publicly muted accounts"
            info="Notes from these people will be hidden by default. This information may be used to identify impersonators and spammers."
          >
            <input className="co-input" style={{ height: '2.25rem' }} aria-label="Publicly muted accounts" />
          </Field>
          <Field
            label="Privately muted words"
            info="Notes containing these words will be hidden by default. This information will be encrypted."
          >
            <input className="co-input" style={{ height: '2.25rem' }} aria-label="Privately muted words" />
          </Field>
          <button type="button" className="co-btn" style={{ width: '100%' }} onClick={onSave}>
            Save
          </button>
        </div>
      </>
    );
  }

  if (page === 'data') {
    return (
      <>
        <Heading title="App Database" subtitle="View, import, and export your local database." />
        <div
          style={{
            display: 'grid',
            gap: '2rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          }}
        >
          <div className="co-card">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                padding: '1.5rem 0',
                textAlign: 'center',
              }}
            >
              <h3 style={{ fontSize: '1.25rem' }}>Export Database</h3>
              <p>Click below to download a backup of all {commaFormat(2481)} events in your database.</p>
              <button type="button" className="co-btn co-btn-accent" onClick={() => onCopy('Backup')}>
                Create Backup
              </button>
            </div>
          </div>
          <div className="co-card co-card-alt">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                padding: '1.5rem 0',
                textAlign: 'center',
              }}
            >
              <h3 style={{ fontSize: '1.25rem' }}>Import Database</h3>
              <p>Upload a nostr export file to pull events into your database.</p>
              <button type="button" className="co-btn co-btn-accent" onClick={() => onCopy('Upload')}>
                Upload Backup
              </button>
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr>
              <th />
              <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left' }}>Created</th>
              <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left' }}>Author</th>
              <th style={{ padding: '0.25rem 0 0.25rem 0.5rem', textAlign: 'left' }}>Kind</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['5.08.2026, 12:14', 'test', 1],
              ['5.08.2026, 12:12', 'test', 1],
              ['5.08.2026, 11:59', 'karnage', 7],
              ['5.08.2026, 11:53', 'PABLOF7z', 6],
              ['5.08.2026, 11:41', 'test', 10002],
            ].map(([created, author, kind], i) => (
              <tr key={i}>
                <td style={{ padding: '0.25rem 0.5rem' }}>
                  <Icon name="link" size={12} style={{ color: 'var(--co-accent)' }} />
                </td>
                <td style={{ padding: '0.25rem 0.5rem' }}>{created}</td>
                <td style={{ padding: '0.25rem 0.5rem' }}>{author}</td>
                <td style={{ padding: '0.25rem 0.5rem' }}>{kind}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  if (page === 'keys') {
    return (
      <>
        <Heading title="Your Keys" />
        <p>
          Your account is identified across the network using a public key. This allows you to fully
          own your account, and move to another app if needed.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Field label="Public Key" info="Your public key is safe to share with anyone.">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                wordBreak: 'break-all',
              }}
            >
              <Icon name="key" size={13} style={{ color: 'var(--co-accent)', flexShrink: 0 }} />
              <span style={{ minWidth: 0 }}>{fullNpub(currentUser?.pubkey ?? 'npub1demo')}</span>
              <button
                type="button"
                aria-label="Copy public key"
                onClick={() => onCopy('Public key')}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                <Icon name="copy" size={13} />
              </button>
            </div>
          </Field>

          {/*
           * The real page shows the secret key for a locally-stored login. This
           * reproduction never holds one — the demo account has no key — so it
           * says so plainly rather than rendering a plausible-looking nsec that
           * a visitor might learn to treat as normal. The disclosure control
           * stays, because it is part of the interface; what it reveals is the
           * truth about the simulation.
           */}
          <Field
            label="Private Key"
            info="Your private key is your password. Never share it with anyone, and never paste a real one into a site you are only trying out."
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="lock" size={13} style={{ color: 'var(--co-accent)', flexShrink: 0 }} />
              <span style={{ minWidth: 0, opacity: showKey ? 1 : 0.6 }}>
                {showKey
                  ? 'This is a simulation — no key exists to reveal.'
                  : '••••••••••••••••••••••••••••••••••••'}
              </span>
              <button
                type="button"
                className={`co-toggle ${showKey ? 'is-on' : ''}`}
                role="switch"
                aria-checked={showKey}
                aria-label="Reveal private key"
                onClick={() => setShowKey((v) => !v)}
                style={{ marginLeft: 'auto' }}
              >
                <span />
              </button>
            </div>
          </Field>
        </div>
      </>
    );
  }

  return (
    <>
      <Heading title="Your Wallet" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="wallet" size={18} />
          <h2 className="co-staatliches" style={{ fontSize: '1.5rem' }}>
            Your wallet
          </h2>
        </div>
        <button type="button" className="co-btn co-btn-accent" onClick={() => onCopy('Wallet')}>
          Connect Wallet
        </button>
      </div>
      <p style={{ padding: '3rem 0', textAlign: 'center' }}>No wallet connected.</p>
    </>
  );
};
