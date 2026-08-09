import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Plus } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import '../amethyst.theme.css';

interface SettingsScreenProps {
  onBack?: () => void;
  initialSection?: string | null;
}

const TITLES: Record<string, string> = {
  preferences: 'Application Preferences',
  security: 'Security Filters',
  relays: 'Relays',
};

// Three real Amethyst drawer destinations (verified vs the screen recording):
// Application Preferences · Security Filters · Relays.
export function SettingsScreen({ onBack, initialSection = 'preferences' }: SettingsScreenProps) {
  const section = (initialSection === 'privacy' ? 'security' : initialSection) || 'preferences';

  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]" data-tour="amethyst-settings">
      <div className="md-app-bar md-app-bar-enhanced">
        <button onClick={onBack} aria-label="Back" className="md-app-bar-icon-btn">
          <ArrowLeft className="w-6 h-6 text-[var(--md-on-surface)]" />
        </button>
        <h1 className="flex-1 font-semibold text-[var(--md-on-surface)] px-1">{TITLES[section] || 'Settings'}</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {section === 'relays' ? <RelaysView /> : section === 'security' ? <SecurityView /> : <PreferencesView />}
      </div>
    </div>
  );
}

/* ---------- Application Preferences ---------- */

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

function SecurityView() {
  const [warnReports, setWarnReports] = useState(true);
  const [filterSpam, setFilterSpam] = useState(true);
  const [tab, setTab] = useState<'blocked' | 'spammers' | 'hidden'>('blocked');

  return (
    <div>
      <div className="px-4 pt-3 space-y-4">
        <Row title="Warn on reports" desc="Shows a warning message when posts have 5 or more reports from your follows">
          <Toggle on={warnReports} onToggle={() => setWarnReports((v) => !v)} />
        </Row>
        <Row title="Filter spam" desc="Hides posts from strangers that were exactly the same for 5 or more times">
          <Toggle on={filterSpam} onToggle={() => setFilterSpam((v) => !v)} />
        </Row>
        <Row title="Show sensitive content" desc="Shows a warning message when the author of the post marked it as sensitive">
          <span className="px-4 py-1.5 rounded-lg bg-[var(--md-surface-variant)] text-sm text-[var(--md-on-surface)]">Warn</span>
        </Row>
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
      ) : (
        <div className="text-center py-12 text-[var(--md-on-surface-variant)]">
          {tab === 'spammers' ? 'No blocked spammers' : 'No hidden words'}
        </div>
      )}
    </div>
  );
}

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
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
