import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, Plus, Trash2, QrCode, Copy, Eye } from 'lucide-react';
import { mockUsers } from '../../../data/mock';
import type { SettingsScreenBaseProps } from '../types';
import { DEMO_USER, GENERAL_RELAYS, hashSeed } from '../wispData';
import { WispAvatar } from '../components/Avatar';
import { getPredefinedMockKey } from '../../shared/utils/mockKeys';

/**
 * Settings surfaces (screen-map §14 Relays + §15 Interface/Keys/Social Graph):
 * InterfaceScreen, RelaysScreen, KeysScreen, SocialGraphScreen. Each screen is
 * a standard back-arrow top bar over a scrolling body on the app background.
 */

/**
 * ONE stable keypair for the Keys screen, picked deterministically from the
 * shared mock-key table. The nsec is FAKE — mockKeys does no cryptography;
 * this is a visual simulation only.
 */
const MOCK_KEYPAIR = getPredefinedMockKey(0);

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 px-2">
      <button type="button" aria-label="Back" className="p-2" onClick={onBack}>
        <ArrowLeft size={24} />
      </button>
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
  );
}

/** M3-style switch: 44×24 track, 20px thumb. ON = accent track / white thumb. */
function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
      style={
        on
          ? { background: 'var(--wisp-accent)' }
          : {
              background: 'var(--wisp-surface-variant)',
              border: '1px solid var(--wisp-outline)',
            }
      }
    >
      <span
        className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full"
        style={{
          left: on ? 'calc(100% - 22px)' : '2px',
          background: on ? '#FFFFFF' : 'var(--wisp-on-surface-variant)',
        }}
      />
    </button>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-1 mt-5 text-base font-semibold">{children}</h3>;
}

function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description?: string;
  control?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="max-w-[75%]">
        <div className="text-[15px]">{label}</div>
        {description && (
          <div className="mt-0.5 text-xs text-[var(--wisp-on-surface-variant)]">{description}</div>
        )}
      </div>
      {control}
    </div>
  );
}

/** M3 segmented-button segment (the tonal secondary-container "leak" look). */
const SEGMENT_SELECTED: React.CSSProperties = {
  background: 'var(--wisp-secondary-container)',
  color: 'var(--wisp-on-secondary-container)',
  border: '1px solid transparent',
};
const SEGMENT_UNSELECTED: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--wisp-outline)',
};

// ---------------------------------------------------------------------------
// 1. Interface
// ---------------------------------------------------------------------------

export function InterfaceScreen({ onBack }: SettingsScreenBaseProps) {
  const [toggles, setToggles] = useState({
    largeText: false,
    hideNewNotes: false,
    autoLoad: true,
    autoplay: true,
    loopVideos: true,
    hideLive: false,
    undoCountdown: true,
  });
  const [layout, setLayout] = useState<'gallery' | 'stack'>('gallery');
  const [undoSeconds, setUndoSeconds] = useState('10s');

  const flip = (key: keyof typeof toggles) =>
    setToggles((t) => ({ ...t, [key]: !t[key] }));

  const chevron = (
    <ChevronDown size={20} className="shrink-0 text-[var(--wisp-on-surface-variant)]" />
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TopBar title="Interface" onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto px-4">
        <SectionHeader>Language</SectionHeader>
        <SettingRow label="System Default" control={chevron} />

        <SectionHeader>Text Size</SectionHeader>
        <SettingRow
          label="Large text"
          description="Increase text size across the app"
          control={<Switch on={toggles.largeText} onToggle={() => flip('largeText')} />}
        />

        <SectionHeader>Themes</SectionHeader>
        <div className="flex items-center justify-between gap-4 py-2.5">
          <span className="text-sm text-[var(--wisp-on-surface-variant)]">
            Choose a color scheme
          </span>
          {chevron}
        </div>

        <div className="flex items-center gap-3 py-2.5">
          <div className="h-8 w-8 shrink-0 rounded-full" style={{ background: 'var(--wisp-accent)' }} />
          <div className="min-w-0 flex-1">
            <div className="text-[15px]">Accent Color</div>
            <div className="text-xs text-[var(--wisp-on-surface-variant)]">Tap to customize</div>
          </div>
          {chevron}
        </div>

        <SectionHeader>New Notes Button</SectionHeader>
        <SettingRow
          label="Hide new notes button"
          description="Hide the floating button that appears when new notes arrive"
          control={<Switch on={toggles.hideNewNotes} onToggle={() => flip('hideNewNotes')} />}
        />

        <SectionHeader>Media</SectionHeader>
        <SettingRow
          label="Auto-load media"
          description="Automatically download images and videos in notes. When off, tap to load."
          control={<Switch on={toggles.autoLoad} onToggle={() => flip('autoLoad')} />}
        />
        <SettingRow
          label="Video autoplay"
          description="Automatically play videos when they scroll into view"
          control={<Switch on={toggles.autoplay} onToggle={() => flip('autoplay')} />}
        />
        <SettingRow
          label="Loop videos"
          description="Replays timeline and gallery videos from the beginning when they finish."
          control={<Switch on={toggles.loopVideos} onToggle={() => flip('loopVideos')} />}
        />
        <div className="py-2.5">
          <div className="text-[15px]">Multi-image layout</div>
          <div className="mt-0.5 text-xs text-[var(--wisp-on-surface-variant)]">
            Gallery: horizontal swipe through every photo and video. Stack: each item full-width
            below the next.
          </div>
          <div className="mt-2 flex">
            {(['gallery', 'stack'] as const).map((opt, i) => {
              const selected = layout === opt;
              const label = opt === 'gallery' ? 'Gallery' : 'Stack';
              return (
                <button
                  key={opt}
                  type="button"
                  className={`px-4 py-1.5 text-sm ${i === 0 ? 'rounded-l-full' : '-ml-px rounded-r-full'}`}
                  style={selected ? SEGMENT_SELECTED : SEGMENT_UNSELECTED}
                  onClick={() => setLayout(opt)}
                >
                  {selected ? `✓ ${label}` : label}
                </button>
              );
            })}
          </div>
        </div>
        <SettingRow
          label="Hide live streams"
          control={<Switch on={toggles.hideLive} onToggle={() => flip('hideLive')} />}
        />

        <SectionHeader>Posting</SectionHeader>
        <SettingRow
          label="Undo countdown"
          description="Holds new posts for a few seconds before publishing so you can cancel."
          control={<Switch on={toggles.undoCountdown} onToggle={() => flip('undoCountdown')} />}
        />
        <div className="flex pb-1 pt-1">
          {['5s', '10s', '15s', '20s', '30s'].map((opt, i, arr) => {
            const selected = undoSeconds === opt;
            return (
              <button
                key={opt}
                type="button"
                className={`flex-1 py-1.5 text-sm ${i === 0 ? 'rounded-l-full' : '-ml-px'} ${
                  i === arr.length - 1 ? 'rounded-r-full' : ''
                }`}
                style={selected ? SEGMENT_SELECTED : SEGMENT_UNSELECTED}
                onClick={() => setUndoSeconds(opt)}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div className="py-6 text-center text-xs text-[var(--wisp-on-surface-variant)]">
          Wisp v1.2.1
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Relays
// ---------------------------------------------------------------------------

const RELAY_TABS = ['General', 'DM', 'Search', 'Blocked'] as const;
type RelayTab = (typeof RELAY_TABS)[number];

const BROADCAST_LABELS: Record<RelayTab, string> = {
  General: 'Broadcast Relay List (NIP-65)',
  DM: 'Broadcast DM Relays',
  Search: 'Broadcast Search Relays',
  Blocked: 'Broadcast Blocked Relays',
};

const CHIP_KEYS = ['read', 'write', 'auth'] as const;
type ChipKey = (typeof CHIP_KEYS)[number];

export function RelaysScreen({ onBack }: SettingsScreenBaseProps) {
  const [tab, setTab] = useState<RelayTab>('General');
  const [input, setInput] = useState('');
  const [lists, setLists] = useState<Record<RelayTab, string[]>>({
    General: [...GENERAL_RELAYS],
    DM: ['wss://auth.nostr1.example'],
    Search: [],
    Blocked: [],
  });
  // FilterChip selection per relay url; everything defaults to selected.
  const [chips, setChips] = useState<Record<string, Record<ChipKey, boolean>>>({});

  const chipOn = (url: string, key: ChipKey) => chips[url]?.[key] ?? true;
  const toggleChip = (url: string, key: ChipKey) => {
    const current: Record<ChipKey, boolean> = {
      read: chipOn(url, 'read'),
      write: chipOn(url, 'write'),
      auth: chipOn(url, 'auth'),
    };
    setChips((prev) => ({ ...prev, [url]: { ...current, [key]: !current[key] } }));
  };

  const addRelay = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const url = /^wss?:\/\//.test(trimmed) ? trimmed : `wss://${trimmed}`;
    setLists((prev) =>
      prev[tab].includes(url) ? prev : { ...prev, [tab]: [...prev[tab], url] },
    );
    setInput('');
  };

  const removeRelay = (url: string) =>
    setLists((prev) => ({ ...prev, [tab]: prev[tab].filter((u) => u !== url) }));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TopBar title="Relays" onBack={onBack} />

      <div className="flex shrink-0">
        {RELAY_TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              type="button"
              className="relative flex-1 py-2.5 text-sm font-medium"
              style={{
                color: active ? 'var(--wisp-accent)' : 'var(--wisp-on-surface-variant)',
              }}
              onClick={() => setTab(t)}
            >
              {t}
              {active && (
                <span
                  className="absolute inset-x-4 bottom-0 h-0.5 rounded-full"
                  style={{ background: 'var(--wisp-accent)' }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="wisp-divider" />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex items-center gap-2 pt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addRelay();
            }}
            placeholder="wss://"
            aria-label="Relay url"
            className="h-11 min-w-0 flex-1 rounded border bg-transparent px-3 text-sm outline-none placeholder:text-[var(--wisp-on-surface-variant)]"
            style={{ borderColor: 'var(--wisp-outline)' }}
          />
          <button
            type="button"
            aria-label="Add relay"
            className="p-2"
            style={{ color: 'var(--wisp-accent)' }}
            onClick={addRelay}
          >
            <Plus size={24} />
          </button>
        </div>

        <button
          type="button"
          className="mt-3 h-12 w-full rounded-full text-[15px] font-medium"
          style={{ background: 'var(--wisp-accent)', color: 'var(--wisp-on-accent)' }}
        >
          {BROADCAST_LABELS[tab]}
        </button>

        <div className="mt-2">
          {lists[tab].map((url) => (
            <div key={url} className="flex items-start justify-between gap-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">{url}</div>
                {tab === 'General' && (
                  <div className="mt-1.5 flex gap-2">
                    {CHIP_KEYS.map((key) => {
                      const on = chipOn(url, key);
                      return (
                        <button
                          key={key}
                          type="button"
                          className="rounded-lg px-3 py-1.5 text-sm"
                          style={
                            on
                              ? {
                                  background: 'var(--wisp-secondary-container)',
                                  color: 'var(--wisp-on-secondary-container)',
                                }
                              : {
                                  border: '1px solid var(--wisp-outline)',
                                  color: 'var(--wisp-on-surface-variant)',
                                }
                          }
                          onClick={() => toggleChip(url, key)}
                        >
                          {key}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <button
                type="button"
                aria-label={`Remove ${url}`}
                className="p-2"
                style={{ color: 'var(--wisp-error)' }}
                onClick={() => removeRelay(url)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Keys
// ---------------------------------------------------------------------------

function KeyCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl border p-3"
      style={{ borderColor: 'var(--wisp-outline)' }}
    >
      <span className="min-w-0 flex-1 truncate text-xs">{value}</span>
      <button
        type="button"
        aria-label={`Show ${label} QR code`}
        style={{ color: 'var(--wisp-accent)' }}
      >
        <QrCode size={20} />
      </button>
      <button type="button" aria-label={`Copy ${label}`} style={{ color: 'var(--wisp-accent)' }}>
        <Copy size={20} />
      </button>
    </div>
  );
}

export function KeysScreen({ onBack }: SettingsScreenBaseProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TopBar title="Keys" onBack={onBack} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
        <h3 className="mt-4 text-sm font-medium text-[var(--wisp-on-surface-variant)]">
          Public Key
        </h3>
        <p className="mb-2 mt-0.5 text-xs text-[var(--wisp-on-surface-variant)]">
          Share this freely — it&apos;s your Nostr identifier.
        </p>
        <KeyCard value={MOCK_KEYPAIR.npub} label="public key" />

        <h3 className="mb-2 mt-6 text-sm font-medium text-[var(--wisp-on-surface-variant)]">
          Private Key
        </h3>
        {revealed ? (
          // The revealed nsec is a fake, non-cryptographic mock value.
          <KeyCard value={MOCK_KEYPAIR.nsec} label="private key" />
        ) : (
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium"
            style={{ background: 'var(--wisp-accent)', color: 'var(--wisp-on-accent)' }}
            onClick={() => setRevealed(true)}
          >
            <Eye size={18} />
            Reveal Private Key
          </button>
        )}

        <p className="mt-auto py-4 text-xs" style={{ color: 'var(--wisp-error)' }}>
          Never share your private key with anyone!
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Social Graph
// ---------------------------------------------------------------------------

type GraphPhase = 'notComputed' | 'computing' | 'done';

const GRAPH_STATS: [string, string][] = [
  ['Follows (1st degree)', '22'],
  ['2nd degree users', '7,549'],
  ['Qualified (threshold)', '75'],
  ['Relays covered', '7'],
];

/** ~20 deterministic node positions (percent coords) — hashSeed only. */
const NODE_POSITIONS = Array.from({ length: 20 }, (_, i) => ({
  x: 8 + (hashSeed(`node-${i}-x`) % 84),
  y: 8 + (hashSeed(`node-${i}-y`) % 80),
}));

/** ~40 deterministic edges between node positions. */
const GRAPH_EDGES = Array.from({ length: 40 }, (_, i) => {
  const a = hashSeed(`edge-${i}-a`) % NODE_POSITIONS.length;
  let b = hashSeed(`edge-${i}-b`) % NODE_POSITIONS.length;
  if (b === a) b = (b + 7) % NODE_POSITIONS.length;
  return [a, b] as const;
});

/** Spokes from the (centered) own node out into the web. */
const CENTER_SPOKES = [0, 3, 6, 9, 12, 15];

/** 12 of the positions render as avatar nodes; a third of them are larger. */
const AVATAR_NODES = Array.from({ length: 12 }, (_, i) => ({
  ...NODE_POSITIONS[i],
  seed: mockUsers[i % mockUsers.length].username,
  large: hashSeed(`node-size-${i}`) % 3 === 0,
}));

export function SocialGraphScreen({ onBack }: SettingsScreenBaseProps) {
  const [phase, setPhase] = useState<GraphPhase>('notComputed');

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TopBar title="Social Graph" onBack={onBack} />

      {phase === 'notComputed' && (
        <div className="flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto px-4 pt-24">
          <p className="text-center text-[15px] text-[var(--wisp-on-surface-variant)]">
            Social graph has not been computed yet
          </p>
          <button
            type="button"
            className="rounded-full px-5 py-2.5 text-[15px] font-medium"
            style={{ background: 'var(--wisp-accent)', color: 'var(--wisp-on-accent)' }}
            onClick={() => setPhase('computing')}
          >
            Compute Now
          </button>
        </div>
      )}

      {phase === 'computing' && (
        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          <div
            className="pt-8 text-center text-[15px] font-medium"
            style={{ color: 'var(--wisp-accent)' }}
          >
            Computation complete
          </div>
          <div className="mt-4">
            {GRAPH_STATS.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2.5">
                <span className="text-sm">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-6 h-11 w-full rounded-full border text-[15px] font-medium"
            style={{ borderColor: 'var(--wisp-outline)' }}
            onClick={() => setPhase('done')}
          >
            Done
          </button>
        </div>
      )}

      {phase === 'done' && (
        <>
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {GRAPH_EDGES.map(([a, b], i) => (
                <line
                  key={`e-${i}`}
                  x1={NODE_POSITIONS[a].x}
                  y1={NODE_POSITIONS[a].y}
                  x2={NODE_POSITIONS[b].x}
                  y2={NODE_POSITIONS[b].y}
                  stroke="rgba(153,152,160,0.25)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {CENTER_SPOKES.map((n) => (
                <line
                  key={`s-${n}`}
                  x1={50}
                  y1={50}
                  x2={NODE_POSITIONS[n].x}
                  y2={NODE_POSITIONS[n].y}
                  stroke="rgba(153,152,160,0.25)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {AVATAR_NODES.map((node, i) => (
              <div
                key={`n-${i}`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <WispAvatar seed={node.seed} className={node.large ? 'w-10 h-10' : 'w-8 h-8'} />
              </div>
            ))}

            {/* Own node — centered, 3px accent ring */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ boxShadow: '0 0 0 3px rgba(255,152,0,0.6)' }}
            >
              <WispAvatar seed={DEMO_USER.username} className="w-12 h-12" />
            </div>
          </div>

          <div className="shrink-0">
            <div className="wisp-divider" />
            <div className="p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-base font-semibold">Top Accounts</span>
                <span className="text-xs text-[var(--wisp-on-surface-variant)]">
                  75 qualified from 22 follows
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs font-medium text-[var(--wisp-on-surface-variant)]">
                  #1
                </span>
                <WispAvatar seed={mockUsers[0].username} className="w-10 h-10" />
                <div className="min-w-0">
                  <div className="truncate text-[15px]">{mockUsers[0].displayName}</div>
                  <div className="text-xs text-[var(--wisp-on-surface-variant)]">
                    followed by 15
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
