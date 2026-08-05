import React, { useState } from 'react';
import {
  Database,
  Image as ImageIcon,
  Key,
  Medal,
  Palette,
  Plus,
  Radio,
  ShieldAlert,
  Trash2,
  Zap,
} from 'lucide-react';
import {
  NavBar,
  ScreenTitle,
  Segmented,
  SettingRow,
  Switch,
} from '../components/Chrome';
import { defaultFeeds, relayRows } from '../nosturData';
import type { NosturSettingsScreen } from '../types';

/**
 * Screens/Settings/. Grouped iOS Form rows. All copy below is transcribed from
 * the recording (screen-map §15); defaults are cross-checked against
 * Screens/Settings/SettingsStore.swift `registerDefaultValues`.
 */

function useToggles(initial: Record<string, boolean>) {
  const [state, setState] = useState(initial);
  return [state, (k: string) => setState((s) => ({ ...s, [k]: !s[k] }))] as const;
}

export function SettingsRoot({
  lowData,
  onToggleLowData,
  onOpen,
  onBack,
}: {
  lowData: boolean;
  onToggleLowData: () => void;
  onOpen: (s: NosturSettingsScreen) => void;
  onBack: () => void;
}) {
  return (
    <>
      <NavBar back={{ label: 'Following', onClick: onBack }} title="Settings" />
      <div className="nostur-scroll pb-6" data-tour="nostur-settings">
        <div className="nostur-group">
          <SettingRow icon={<Palette className="h-5 w-5" />} title="Appearance" chevron onClick={() => onOpen('appearance')} />
        </div>
        <div className="nostur-group">
          <SettingRow icon={<ImageIcon className="h-5 w-5" />} title="Posting & Media Uploading" chevron />
          <SettingRow icon={<Zap className="h-5 w-5" />} title="Zaps" chevron onClick={() => onOpen('zaps')} />
        </div>
        <div className="nostur-group">
          <SettingRow icon={<Radio className="h-5 w-5" />} title="Relay Connections" chevron onClick={() => onOpen('relays')} />
          <SettingRow icon={<ShieldAlert className="h-5 w-5" />} title="Spam Filtering" chevron onClick={() => onOpen('spam')} />
        </div>

        <p className="nostur-section-title">Data usage</p>
        <div className="nostur-group">
          <SettingRow
            title="Low Data Mode"
            caption="Will not download media and previews"
            trailing={<Switch checked={lowData} onChange={onToggleLowData} label="Low Data Mode" />}
          />
        </div>
        <div className="nostur-group">
          <SettingRow icon={<Database className="h-5 w-5" />} title="Database & Cache" chevron />
        </div>

        <p className="nostur-section-title">Account</p>
        <div className="nostur-group">
          <SettingRow icon={<Key className="h-5 w-5" />} title="Private key" chevron />
          <SettingRow icon={<Trash2 className="h-5 w-5" />} title="Delete account" danger />
        </div>
      </div>
    </>
  );
}

export function AppearanceSettings({ onBack }: { onBack: () => void }) {
  const [t, toggle] = useToggles({
    fiat: true,
    counts: true,
    autoscroll: false,
    seen: true,
    loading: false,
    badges: false,
    caption: true,
    relays: false,
  });
  const rows: [string, string, string][] = [
    ['fiat', 'Show zaps fiat value', 'Show local fiat value next to sats on post'],
    ['counts', 'Fetch counts on timeline', 'Fetches reply/repost/reaction counts as posts appear'],
    ['autoscroll', 'Auto scroll to new posts', 'When at top, auto scroll if there are new posts'],
    ['seen', 'Hide posts you have already seen (beta)', 'Keeps track across all feeds you already saw'],
    ['loading', 'Loading indicator', 'Shows when items are being processed'],
    ['badges', "We Don't Need No Stinkin' Badges", 'Hides badges from profile and feeds'],
    ['caption', 'Include Nostur caption when sharing posts', 'Adds "Shared from Nostur" when sharing screenshots'],
    ['relays', 'Show extra relays used on post preview', 'Displays additional relays this post will be sent to'],
  ];

  return (
    <>
      <NavBar back={{ label: 'Settings', onClick: onBack }} title="Appearance" />
      <div className="nostur-scroll pb-6">
        <div className="nostur-group">
          <SettingRow title="Reaction buttons" trailing={<span className="text-[18px]">💬 🔄 ♡ ⚡ 🔖</span>} />
        </div>
        <div className="nostur-group">
          {rows.map(([k, title, caption]) => (
            <SettingRow
              key={k}
              title={title}
              caption={caption}
              trailing={<Switch checked={t[k]} onChange={() => toggle(k)} label={title} />}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export function ZapSettings({ onBack }: { onBack: () => void }) {
  const [t, toggle] = useToggles({ fiat: true });
  return (
    <>
      <NavBar back={{ label: 'Settings', onClick: onBack }} title="Zaps" />
      <div className="nostur-scroll pb-6">
        <p className="nostur-section-title">Zapping</p>
        <div className="nostur-group">
          <SettingRow title="Lightning wallet" chevron />
          {/* SettingsStore.swift:203 — defaultZapAmount: 21 */}
          <SettingRow
            title="Default zap amount:"
            trailing={<span style={{ color: 'var(--nostur-secondary)' }}>21</span>}
            chevron
          />
        </div>
        <p className="nostur-section-title">Appearance</p>
        <div className="nostur-group">
          <SettingRow
            title="Show fiat value"
            caption="Show local fiat value next to sats on post"
            trailing={<Switch checked={t.fiat} onChange={() => toggle('fiat')} label="Show fiat value" />}
          />
          <SettingRow title="Fiat currency" chevron />
        </div>
      </div>
    </>
  );
}

export function RelaySettings({ onBack }: { onBack: () => void }) {
  const [t, toggle] = useToggles({ autopilot: false, hints: true, vpn: true });
  const [list, setList] = useState(false);

  if (list) {
    return (
      <>
        <NavBar back={{ label: 'Back', onClick: () => setList(false) }} title="Relays" />
        <div className="nostur-scroll pb-6">
          <p className="px-5 py-3 text-[14px]" style={{ color: 'var(--nostur-secondary)' }}>
            These relays are used for all your accounts, and are not announced unless configured on
            the account specific tabs.
          </p>
          {relayRows.map((r) => (
            <div
              key={r.url}
              className="flex items-center gap-3 px-5 py-3"
              style={{ borderBottom: '1px solid var(--nostur-separator)' }}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: 'var(--nostur-green)' }}
              />
              <span className="min-w-0 flex-1 truncate text-[15px]">{r.url}</span>
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: r.read ? 'var(--nostur-green)' : 'var(--nostur-fill)' }}
                aria-label="read"
              />
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: r.write ? 'var(--nostur-green)' : 'var(--nostur-fill)' }}
                aria-label="write"
              />
            </div>
          ))}
          <button
            type="button"
            className="px-5 py-3 text-[15px]"
            style={{ color: 'var(--nostur-accent)' }}
          >
            Add new relay...
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar back={{ label: 'Settings', onClick: onBack }} title="Settings" />
      <div className="nostur-scroll pb-6" data-tour="nostur-relays">
        <p className="nostur-section-title">Relays</p>
        <div className="nostur-group">
          <SettingRow
            title="Configure your relays..."
            caption="Relays Nostur uses to find or publish content"
            chevron
            onClick={() => setList(true)}
          />
          <SettingRow
            title="Announce your relays..."
            caption="Relays others will use to find your content"
            chevron
            onClick={() => setList(true)}
          />
          <SettingRow
            title="Autopilot"
            caption="Automatically connect to additional relays from people you follow to reduce missing content that can't be found on your own relay set"
            trailing={<Switch checked={t.autopilot} onChange={() => toggle('autopilot')} label="Autopilot" />}
          />
          <SettingRow
            title="Follow relay hints"
            caption="Connect to relays included in nostr links, when content can't be found"
            trailing={<Switch checked={t.hints} onChange={() => toggle('hints')} label="Follow relay hints" />}
          />
          <SettingRow
            title="VPN detection"
            caption="Only connect to additional relays when a VPN is active"
            trailing={<Switch checked={t.vpn} onChange={() => toggle('vpn')} label="VPN detection" />}
          />
          <SettingRow
            title=""
            caption="VPN not detected"
            icon={
              <span
                className="block h-2.5 w-2.5 rounded-full"
                style={{ background: 'var(--nostur-red)' }}
              />
            }
          />
          <SettingRow title="Relay connection stats" chevron />
        </div>
      </div>
    </>
  );
}

export function SpamSettings({ onBack }: { onBack: () => void }) {
  const [dunbar, setDunbar] = useState('1000');
  const [verify, setVerify] = useState(true);
  return (
    <>
      <NavBar back={{ label: 'Settings', onClick: onBack }} title="Settings" />
      <div className="nostur-scroll pb-6">
        <p className="nostur-section-title">Spam filtering</p>
        <div className="nostur-group">
          <SettingRow
            title="Web of Trust filter"
            caption="Filter by your follows (strict), or also your follows follows (normal)"
            trailing={<span style={{ color: 'var(--nostur-secondary)' }}>Normal</span>}
            chevron
          />
          <SettingRow
            title="Main account"
            caption="Log in with other accounts, but keep filtering using the main Web of Trust account"
            chevron
          />
          <div className="nostur-row" style={{ display: 'block' }}>
            <p className="text-[16px]">Nostr Dunbar Number</p>
            <div className="mt-2">
              <Segmented
                options={['250', '500', '1000', '2000', 'All']}
                value={dunbar}
                onChange={setDunbar}
                label="Nostr Dunbar Number"
              />
            </div>
            <p className="mt-2 text-[12px]" style={{ color: 'var(--nostur-secondary)' }}>
              Follow lists with a size higher than this threshold will be considered low quality and
              not included in your Web of Trust
            </p>
            <p className="mt-2 flex items-center text-[12px]" style={{ color: 'var(--nostur-secondary)' }}>
              Last updated: Never
              <span className="ml-auto" style={{ color: 'var(--nostur-accent)' }}>
                Update
              </span>
            </p>
            <p className="mt-1 text-[12px]" style={{ color: 'var(--nostur-secondary)' }}>
              Currently allowed by the filter: 0 contacts
            </p>
          </div>
          <SettingRow
            title="Media downloading"
            caption="When to auto-download media posted by others"
            trailing={<span style={{ color: 'var(--nostur-secondary)' }}>Web of Trust only</span>}
            chevron
          />
        </div>
        <p className="nostur-section-title">Message verification</p>
        <div className="nostur-group">
          <SettingRow
            title="Verify message signatures"
            caption="Turn off to save battery life and trust the relays for the authenticity of messages"
            trailing={<Switch checked={verify} onChange={setVerify} label="Verify message signatures" />}
          />
        </div>
      </div>
    </>
  );
}

export function FeedsScreen({ onBack }: { onBack: () => void }) {
  const [on, setOn] = useState<Record<string, boolean>>(
    Object.fromEntries(defaultFeeds.map((f) => [f.name, f.on])),
  );
  return (
    <>
      <NavBar
        back={{ label: 'Following', onClick: onBack }}
        title="Feeds"
        trailing={
          <>
            <span className="text-[17px]" style={{ color: 'var(--nostur-accent)' }}>
              Edit
            </span>
            <Plus className="h-5 w-5" style={{ color: 'var(--nostur-accent)' }} />
          </>
        }
      />
      <div className="nostur-scroll pb-6" data-tour="nostur-feeds">
        <p className="nostur-section-title">Default feeds</p>
        <div className="nostur-group">
          {defaultFeeds.map((f) => (
            <SettingRow
              key={f.name}
              title={f.name}
              caption={f.caption}
              trailing={
                <Switch
                  checked={on[f.name]}
                  onChange={() => setOn((s) => ({ ...s, [f.name]: !s[f.name] }))}
                  label={f.name}
                />
              }
            />
          ))}
        </div>
      </div>
    </>
  );
}

export function BadgesScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState('Issued');
  return (
    <>
      <NavBar
        back={{ label: 'Following', onClick: onBack }}
        title="Badges"
        trailing={
          <span className="text-[15px]" style={{ color: 'var(--nostur-accent)' }}>
            Create new badge
          </span>
        }
      />
      <div className="nostur-tabrow" role="tablist" aria-label="Badges">
        {['Issued', 'Received'].map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className="nostur-tabbtn"
          >
            <span className="nostur-tabbtn-label">{t}</span>
            <span className="nostur-tabbtn-rule" />
          </button>
        ))}
      </div>
      <div className="nostur-scroll">
        <p className="flex flex-col items-center gap-2 px-6 py-10 text-center text-[15px]" style={{ color: 'var(--nostur-secondary)' }}>
          <Medal className="h-8 w-8" />
          No badges {tab === 'Issued' ? 'issued' : 'received'} yet
        </p>
      </div>
    </>
  );
}

/** Placeholder destinations the sidebar links but which the recording never opens. */
export function StubScreen({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <>
      <NavBar back={{ label: 'Following', onClick: onBack }} title={title} />
      <div className="nostur-scroll">
        <ScreenTitle>&nbsp;</ScreenTitle>
        <p className="px-6 py-8 text-center text-[15px]" style={{ color: 'var(--nostur-secondary)' }}>
          Nothing here yet
        </p>
      </div>
    </>
  );
}
