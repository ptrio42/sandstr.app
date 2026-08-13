import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, Plus, Search,
  Waypoints, RefreshCw, UserPlus, CloudUpload, Zap, Heart, ThumbsUp, Mail, LayoutGrid,
  MonitorPlay, Music, Sparkles, Medal, CreditCard, Shield, Languages, Grid3x3, Lock, Phone,
  Droplet, Settings as SettingsIcon, Home, Bell, Pencil, CircleUserRound, Calendar, Search as SearchIcon,
  ShieldCheck, Activity, KeyRound, SquareX, History, Trash2,
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import '../amethyst.theme.css';

interface SettingsScreenProps {
  onBack?: () => void;
  initialSection?: string | null;
}

/**
 * Settings @ v1.13.1 — rebuilt from the reference recording plus
 * res/values/strings.xml. The release replaced v1.12.6's three separate
 * drawer destinations (Application Preferences / Security Filters / Relays)
 * with ONE searchable root screen: a "Search settings" pill in the top bar and
 * two grouped cards — `account_settings` = "Account Settings" and
 * `app_settings` = "App Settings" — followed by a colour-coded
 * `danger_zone` = "Danger Zone" card.
 *
 * Every row carries a rounded-square icon tile (the visual signature of this
 * screen); Danger Zone rows swap the purple tile for a dark-red one and tint
 * their label with the error colour.
 *
 * `initialSection` keeps its old vocabulary so the guided tour and FAQ mini-tours
 * do not have to change their payloads: 'relays' | 'security' | 'security-hidden'
 * | 'preferences' open the matching detail screen directly, anything else (the
 * drawer's own Settings row) opens the root list.
 */

type Row = { label: string; Icon: React.ComponentType<{ className?: string }>; section?: string; tour?: string };

const ACCOUNT_ROWS: Row[] = [
  { label: 'Relays', Icon: Waypoints, section: 'relays', tour: 'amethyst-settings-relays' },
  { label: 'Relay Sync', Icon: RefreshCw },
  { label: 'Import Follows', Icon: UserPlus },
  { label: 'Media Servers', Icon: CloudUpload, tour: 'amethyst-settings-media-servers' },
  { label: 'Nest servers', Icon: CloudUpload },
  { label: 'Zaps', Icon: Zap },
  { label: 'Reactions', Icon: Heart },
  { label: 'Reaction Row', Icon: ThumbsUp },
  { label: 'Messages', Icon: Mail },
  { label: 'Bottom Navigation Bar', Icon: LayoutGrid },
  { label: 'Video Player Buttons', Icon: MonitorPlay },
  { label: 'Audio Visualizer', Icon: Music },
  { label: 'Favorite Feed Algorithms', Icon: Sparkles },
  { label: 'Profile badges', Icon: Medal },
  { label: 'Payment Targets', Icon: CreditCard },
  { label: 'BOLT12 Offers', Icon: CreditCard },
  { label: 'Security Filters', Icon: Shield, section: 'security', tour: 'amethyst-settings-security-filters' },
  { label: 'Translations', Icon: Languages },
  { label: 'Connected Apps', Icon: Grid3x3 },
  { label: 'Relay Authentication', Icon: Lock },
  { label: 'Call Settings', Icon: Phone },
];

const APP_ROWS: Row[] = [
  { label: 'Privacy Options', Icon: Droplet },
  { label: 'UI Preferences', Icon: SettingsIcon, section: 'preferences', tour: 'amethyst-settings-ui-preferences' },
  { label: 'Home', Icon: Home },
  { label: 'Notifications', Icon: Bell },
  { label: 'Compose Settings', Icon: Pencil },
  { label: 'Profile UI', Icon: CircleUserRound },
  { label: 'Calendar reminders', Icon: Calendar },
  { label: 'Bitcoin Explorer (OTS)', Icon: SearchIcon },
  { label: 'Namecoin Settings', Icon: ShieldCheck },
  { label: 'App resource usage', Icon: Activity },
];

const DANGER_ROWS: Row[] = [
  { label: 'Backup Keys', Icon: KeyRound, tour: 'amethyst-settings-backup-keys' },
  { label: 'Request to Vanish', Icon: SquareX },
  { label: 'Vanish History', Icon: History },
  { label: 'Reset Marmot State', Icon: Trash2 },
];

const DETAIL_TITLES: Record<string, string> = {
  preferences: 'UI Preferences',
  security: 'Security Filters',
  relays: 'Relays',
};

export function SettingsScreen({ onBack, initialSection = null }: SettingsScreenProps) {
  const raw = initialSection || 'root';
  const openDirect = raw === 'privacy' || raw === 'security-hidden' ? 'security' : raw;
  const [section, setSection] = useState<string>(
    DETAIL_TITLES[openDirect] ? openDirect : 'root',
  );
  const securityTab = raw === 'security-hidden' ? 'hidden' : 'blocked';

  // Backing out of a detail returns to the root list, the way a pushed screen
  // does upstream; backing out of the root closes Settings entirely.
  const back = () => (section === 'root' ? onBack?.() : setSection('root'));

  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]" data-tour="amethyst-settings">
      <div className="md-app-bar md-app-bar-enhanced">
        <button onClick={back} aria-label="Back" className="md-app-bar-icon-btn">
          <ArrowLeft className="w-6 h-6 text-[var(--md-on-surface)]" />
        </button>
        {section === 'root' ? (
          // The search field REPLACES the title in v1.13.1 — there is no
          // "Settings" heading on this screen at all.
          <div
            className="flex-1 flex items-center gap-3 rounded-full px-4 py-2.5 mr-2"
            style={{ background: 'var(--md-surface-container-high)' }}
          >
            <Search className="w-5 h-5 shrink-0 text-[var(--md-on-surface-variant)]" />
            <span className="text-[15px] whitespace-nowrap text-[var(--md-on-surface-variant)]">Search settings</span>
          </div>
        ) : (
          <h1 className="flex-1 font-semibold text-[var(--md-on-surface)] px-1">{DETAIL_TITLES[section]}</h1>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {section === 'root' ? (
          <SettingsRoot onOpen={setSection} />
        ) : section === 'relays' ? (
          <RelaysView />
        ) : section === 'security' ? (
          <SecurityView initialTab={securityTab} />
        ) : (
          <PreferencesView />
        )}
      </div>
    </div>
  );
}

/* ---------- Settings root ---------- */

function SettingsRoot({ onOpen }: { onOpen: (s: string) => void }) {
  return (
    <div className="px-3 pb-8 pt-2">
      <SettingsCard title="Account Settings" rows={ACCOUNT_ROWS} onOpen={onOpen} />
      <SettingsCard title="App Settings" rows={APP_ROWS} onOpen={onOpen} />
      <SettingsCard title="Danger Zone" rows={DANGER_ROWS} onOpen={onOpen} danger />
    </div>
  );
}

function SettingsCard({
  title, rows, onOpen, danger,
}: { title: string; rows: Row[]; onOpen: (s: string) => void; danger?: boolean }) {
  return (
    <div className="mt-4">
      <p
        className="px-3 pb-2 text-sm font-medium"
        style={{ color: danger ? 'var(--md-error)' : 'var(--md-primary)' }}
      >
        {title}
      </p>
      <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--md-surface-container-low)' }}>
        {rows.map((r, i) => (
          <button
            key={r.label}
            type="button"
            onClick={() => r.section && onOpen(r.section)}
            data-tour={r.tour}
            className="relative w-full flex items-center gap-4 px-3 py-3 text-left"
          >
            <span
              className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center"
              style={{
                background: danger ? 'var(--md-error-container)' : 'var(--md-primary-container)',
                color: danger ? 'var(--md-on-error-container)' : 'var(--md-on-primary-container)',
              }}
            >
              <r.Icon className="w-5 h-5" />
            </span>
            <span
              className="flex-1 min-w-0 text-[17px]"
              style={{ color: danger ? 'var(--md-error)' : 'var(--md-on-surface)' }}
            >
              {r.label}
            </span>
            <ChevronRight className="w-5 h-5 shrink-0 text-[var(--md-on-surface-variant)]" />
            {/* Hairline starts after the icon column, as upstream draws it */}
            {i < rows.length - 1 && (
              <span className="absolute left-[68px] right-0 bottom-0 h-px bg-[var(--md-outline-variant)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- UI Preferences (v1.12.6's "Application Preferences") ---------- */

const PREFS = [
  { title: 'Language', desc: "For the App's interface", value: 'English' },
  { title: 'Theme', desc: 'Dark, Light or System theme', value: 'System' },
  { title: 'Image Preview', desc: 'Automatically load images and GIFs', value: 'Always' },
  { title: 'Video Playback', desc: 'Automatically plays videos and GIFs', value: 'Always' },
  { title: 'URL Preview', desc: 'Show URL previews', value: 'Always' },
  { title: 'Profile Picture', desc: 'Show Profile pictures', value: 'Always' },
  { title: 'Immersive Scrolling', desc: 'Hide Nav Bars when scrolling', value: 'Always' },
  { title: 'UI Mode', desc: 'Choose the post style', value: 'Simplified' },
  { title: 'Profile Gallery Style', desc: 'Choose the gallery style', value: 'Classic' },
  { title: 'Push Notification', desc: 'From installed UnifiedPush apps', value: 'None' },
];

function PreferencesView() {
  return (
    <div className="py-1">
      {PREFS.map((p) => (
        <button key={p.title} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--md-surface-variant)]/40 transition-colors text-left">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--md-on-surface)]">{p.title}</p>
            <p className="text-sm text-[var(--md-on-surface-variant)]">{p.desc}</p>
          </div>
          <span className="text-sm text-[var(--md-on-surface-variant)] shrink-0">{p.value}</span>
          <ChevronRight className="w-4 h-4 text-[var(--md-on-surface-variant)] shrink-0" />
        </button>
      ))}
    </div>
  );
}

/* ---------- Security Filters ---------- */

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} aria-pressed={on} className={`md-switch ${on ? 'checked' : ''}`}>
      <div className="md-switch-thumb" />
    </button>
  );
}

const BLOCKED = [
  { name: 'npub1v7u…eqmz37jj' },
  { name: 'npub1j2p…cs6kxw0d' },
  { name: 'npub1al9…hswjuds8' },
  { name: 'npub1lck…8qgyhdfm' },
  { name: 'npub144k…ssuua6c9' },
  { name: 'npub1ylt…4qnwlakz' },
];

function SecurityView({ initialTab = 'blocked' }: { initialTab?: 'blocked' | 'spammers' | 'hidden' }) {
  const [warnReports, setWarnReports] = useState(true);
  const [filterSpam, setFilterSpam] = useState(true);
  const [tab, setTab] = useState<'blocked' | 'spammers' | 'hidden'>(initialTab);
  // Hidden Words is the one tab the reference recordings never opened, so its
  // contents come from upstream `HiddenWordsScreen.kt` — see the [REC vs REPO]
  // note in docs/refs/amethyst/screen-map.md.
  const [hiddenWords, setHiddenWords] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const addWord = () => {
    const word = draft.trim();
    if (!word) return;
    setHiddenWords((ws) => (ws.includes(word) ? ws : [word, ...ws]));
    setDraft('');
  };

  return (
    // Full height, so the add-word field can sit at the BOTTOM of the screen the
    // way upstream's `bottomBar` does, instead of floating under the last row.
    <div className="flex flex-col min-h-full">
      <div className="px-4 pt-3 space-y-4">
        <PrefRow title="Warn on reports" desc="Shows a warning message when posts have 5 or more reports from your follows">
          <Toggle on={warnReports} onToggle={() => setWarnReports((v) => !v)} />
        </PrefRow>
        <PrefRow title="Filter spam" desc="Hides posts from strangers that were exactly the same for 5 or more times">
          <Toggle on={filterSpam} onToggle={() => setFilterSpam((v) => !v)} />
        </PrefRow>
        <PrefRow title="Show sensitive content" desc="Shows a warning message when the author of the post marked it as sensitive">
          <span className="px-4 py-1.5 rounded-lg bg-[var(--md-surface-variant)] text-sm text-[var(--md-on-surface)]">Warn</span>
        </PrefRow>
      </div>

      {/* sub-tabs */}
      <div className="md-tabs mt-4 sticky top-0 bg-[var(--md-background)] z-10">
        {(['blocked', 'spammers', 'hidden'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`md-tab whitespace-nowrap ${tab === t ? 'active' : ''}`}>
            {t === 'blocked' ? 'Blocked Users' : t === 'spammers' ? 'Spammers' : 'Hidden Words'}
            {tab === t && <motion.div layoutId="sec-tab-indicator" className="md-tab-indicator" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />}
          </button>
        ))}
      </div>

      {tab === 'blocked' ? (
        <div className="py-1">
          {BLOCKED.map((u) => (
            <div key={u.name} className="flex items-center gap-3 px-4 py-2.5">
              <Avatar seed={u.name} className="w-10 h-10" />
              <span className="flex-1 min-w-0 truncate text-[var(--md-on-surface)]">{u.name}</span>
              <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-[var(--md-primary)] text-[var(--md-on-primary)]">Unblock</button>
            </div>
          ))}
        </div>
      ) : tab === 'spammers' ? (
        <div className="text-center py-12 text-[var(--md-on-surface-variant)]">No blocked spammers</div>
      ) : (
        <div className="flex flex-1 flex-col">
          {hiddenWords.length === 0 ? (
            // strings.xml security_hidden_words_empty, verbatim.
            <div className="flex-1 px-8 text-center py-12 text-[var(--md-on-surface-variant)]">
              No hidden words. Add a word below to hide posts containing it.
            </div>
          ) : (
            <div className="flex-1" data-tour="amethyst-hidden-list">
              {hiddenWords.map((w) => (
                // MutedWordRow: the word in bold, centred, divider under each.
                <div key={w}>
                  <div className="px-4 py-3.5 text-center font-bold text-[var(--md-on-surface)]">{w}</div>
                  <div className="h-px bg-[var(--md-outline)] opacity-40" />
                </div>
              ))}
            </div>
          )}

          {/* AddMuteWordTextField — docked at the bottom of the screen upstream,
              on a tonally elevated surface. Label and placeholder are the same
              string there, so the field reads the same empty or focused. */}
          <div
            data-tour="amethyst-hidden-words"
            className="sticky bottom-0 mt-2 bg-[var(--md-surface-variant)] px-3 py-3"
          >
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addWord();
                }}
                placeholder="Hide new word or sentence"
                aria-label="Hide new word or sentence"
                className="md-input flex-1"
              />
              <button
                type="button"
                onClick={addWord}
                aria-label="Add"
                // Upstream's AddButton takes `isActive = hasChanged`: dim until
                // the field has something in it.
                className="shrink-0 rounded-full p-2 transition-opacity"
                style={{
                  background: 'var(--md-primary)',
                  color: 'var(--md-on-primary)',
                  opacity: draft.trim() ? 1 : 0.38,
                }}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PrefRow({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--md-on-surface)]">{title}</p>
        <p className="text-sm text-[var(--md-on-surface-variant)]">{desc}</p>
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </div>
  );
}

/* ---------- Relays ---------- */

const OUTBOX = [
  { name: 'nostr.wine', size: '196 MB', hue: 300 },
  { name: 'nostr.mom', size: '163 MB', hue: 140 },
  { name: 'nos.lol', size: '2 MB', hue: 40 },
  { name: 'relay.damus.io', size: '1 MB', hue: 260 },
  { name: 'garden.zap.cooking', size: '0', hue: 90 },
];
const INBOX = [
  { name: 'nostr.wine', size: '196 MB', hue: 300 },
  { name: 'nostr.mom', size: '163 MB', hue: 140 },
];

function RelaysView() {
  return (
    <div className="pb-6">
      <RelaySection
        title="Public Outbox/Home Relays"
        desc="This relay type stores all your posts here and others read your content. Insert between 1–3 relays, paid relays or public relays."
        relays={OUTBOX}
        showAdd
        // Anchored per section: a caption about the outbox group has to ring the
        // group, not the whole scrolling settings screen (which the overlay
        // refuses to spotlight at all).
        tour="amethyst-relays-outbox"
      />
      <RelaySection
        title="Public Inbox Relays"
        desc="This relay type receives all your tags. They can be public so the relay operator can limit the good and for the bad."
        relays={INBOX}
      />
    </div>
  );
}

function RelaySection({ title, desc, relays, showAdd, tour }: { title: string; desc: string; relays: typeof OUTBOX; showAdd?: boolean; tour?: string }) {
  return (
    <div data-tour={tour} className="px-4 pt-4">
      <h3 className="font-semibold" style={{ color: 'var(--md-primary)' }}>{title}</h3>
      <p className="text-sm text-[var(--md-on-surface-variant)] mt-1 mb-3">{desc}</p>
      <div className="space-y-2">
        {relays.map((r) => (
          <div key={r.name} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full shrink-0" style={{ background: `linear-gradient(135deg, hsl(${r.hue} 55% 55%), hsl(${(r.hue + 40) % 360} 60% 42%))` }} />
            <span className="flex-1 min-w-0 truncate text-[var(--md-on-surface)]">{r.name}</span>
            <span className="text-sm text-[var(--md-on-surface-variant)] shrink-0">{r.size}</span>
          </div>
        ))}
      </div>
      {showAdd && (
        <button className="mt-3 flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--md-primary)' }}>
          <Plus className="w-4 h-4" /> Add a Relay
        </button>
      )}
    </div>
  );
}
