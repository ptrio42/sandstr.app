import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, Plus, Search,
  Waypoints, RefreshCw, UserPlus, CloudUpload, Zap, Heart, ThumbsUp, Mail, LayoutGrid,
  MonitorPlay, Music, Sparkles, Medal, CreditCard, Shield, Languages, Grid3x3, Lock, Phone,
  Droplet, Settings as SettingsIcon, Home, Bell, Pencil, CircleUserRound, Calendar, Search as SearchIcon,
  ShieldCheck, Activity, KeyRound, SquareX, History, Trash2, QrCode, CircleX, Eye, EyeOff, X,
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { DEMO_KEY_PLACEHOLDER, SECRET_INPUT_PROPS } from '../../shared/utils/keySafety';
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
  { label: 'Media Servers', Icon: CloudUpload, section: 'media-servers', tour: 'amethyst-settings-media-servers' },
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
  { label: 'Privacy Options', Icon: Droplet, section: 'privacy', tour: 'amethyst-settings-privacy' },
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
  { label: 'Backup Keys', Icon: KeyRound, section: 'backup-keys', tour: 'amethyst-settings-backup-keys' },
  { label: 'Request to Vanish', Icon: SquareX, section: 'vanish' },
  { label: 'Vanish History', Icon: History, section: 'vanish-history' },
  // No `section`: upstream this row opens a confirmation dialog in place rather
  // than pushing a screen, so it is handled by the root card itself.
  { label: 'Reset Marmot State', Icon: Trash2, tour: 'amethyst-settings-reset-marmot' },
];

const DETAIL_TITLES: Record<string, string> = {
  preferences: 'UI Preferences',
  security: 'Security Filters',
  relays: 'Relays',
  'backup-keys': 'Backup Keys',
  'media-servers': 'Media Servers',
  privacy: 'Privacy Options',
  vanish: 'Request to Vanish',
  'vanish-history': 'Vanish History',
};

/**
 * The chooser dialog every "label + current value + chevron" row opens upstream.
 * One shared component: the rows differ only in their option list, which is why
 * ten of them could sit dead behind one missing handler (gaps ame-39/ame-40).
 */
function ChooserDialog({
  title, options, value, onPick, onClose, note,
}: {
  title: string;
  options: string[];
  value: string;
  onPick: (v: string) => void;
  onClose: () => void;
  note?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center px-6"
      role="dialog"
      aria-label={title}
      data-tour="amethyst-settings-chooser"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-full rounded-3xl py-4 max-h-[80%] overflow-y-auto"
        style={{ background: 'var(--md-surface-container-high)' }}
      >
        <p className="px-5 pb-2 text-lg font-bold text-[var(--md-on-surface)]">{title}</p>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => { onPick(o); onClose(); }}
            className="w-full flex items-center gap-3 px-5 py-3 text-left"
          >
            <span
              className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center"
              style={{ border: `2px solid ${o === value ? 'var(--md-primary)' : 'var(--md-outline)'}` }}
            >
              {o === value && (
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--md-primary)' }} />
              )}
            </span>
            <span className="text-[16px] text-[var(--md-on-surface)]">{o}</span>
          </button>
        ))}
        {note && (
          <p className="px-5 pt-2 text-xs leading-relaxed" style={{ color: 'var(--amethyst-placeholder)' }}>
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

export function SettingsScreen({ onBack, initialSection = null }: SettingsScreenProps) {
  const raw = initialSection || 'root';
  const openDirect = raw === 'security-hidden' || raw === 'security-spammers' ? 'security' : raw;
  const [section, setSection] = useState<string>(
    DETAIL_TITLES[openDirect] ? openDirect : 'root',
  );
  const securityTab = raw === 'security-hidden' ? 'hidden' : raw === 'security-spammers' ? 'spammers' : 'blocked';

  const [query, setQuery] = useState('');
  const [resetMarmot, setResetMarmot] = useState(false);
  const [marmotDone, setMarmotDone] = useState(false);

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
          // "Settings" heading on this screen at all, and being searchable is
          // the whole point of the rebuilt root (gaps ame-98).
          <div
            className="flex-1 flex items-center gap-3 rounded-full px-4 py-2.5 mr-2"
            style={{ background: 'var(--md-surface-container-high)' }}
            data-tour="amethyst-settings-search"
          >
            <Search className="w-5 h-5 shrink-0 text-[var(--md-on-surface-variant)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search settings"
              aria-label="Search settings"
              className="flex-1 min-w-0 bg-transparent text-[15px] text-[var(--md-on-surface)] focus:outline-none placeholder:text-[var(--md-on-surface-variant)]"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="shrink-0">
                <X className="w-4 h-4 text-[var(--md-on-surface-variant)]" />
              </button>
            )}
          </div>
        ) : (
          <h1 className="flex-1 font-semibold text-[var(--md-on-surface)] px-1">{DETAIL_TITLES[section]}</h1>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {section === 'root' ? (
          <SettingsRoot onOpen={setSection} query={query} onResetMarmot={() => setResetMarmot(true)} />
        ) : section === 'relays' ? (
          <RelaysView />
        ) : section === 'security' ? (
          <SecurityView initialTab={securityTab} />
        ) : section === 'backup-keys' ? (
          <BackupKeysView />
        ) : section === 'media-servers' ? (
          <MediaServersView />
        ) : section === 'privacy' ? (
          <PrivacyOptionsView />
        ) : section === 'vanish' ? (
          <VanishRequestView />
        ) : section === 'vanish-history' ? (
          <VanishHistoryView />
        ) : (
          <PreferencesView />
        )}
      </div>

      {/* `reset_marmot_confirm_*` — the one Danger Zone row the screen map says
          asks for confirmation, and the only destructive control in the sim. */}
      {resetMarmot && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center px-6" role="dialog" aria-label="Reset Marmot State?">
          <div className="absolute inset-0 bg-black/60" onClick={() => setResetMarmot(false)} />
          <div className="relative w-full rounded-3xl p-5" style={{ background: 'var(--md-surface-container-high)' }}>
            <p className="text-lg font-bold text-[var(--md-on-surface)]">Reset Marmot State?</p>
            <p className="text-sm mt-2 leading-relaxed text-[var(--md-on-surface-variant)]">
              This will permanently delete every Marmot group chat, message history, and MLS key on
              this device for the current account. Peers will not be notified and may still see you in
              groups until their next commit. This cannot be undone. A new KeyPackage will be
              published the next time the app syncs.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setResetMarmot(false)}
                className="px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap text-[var(--md-on-surface)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { setResetMarmot(false); setMarmotDone(true); }}
                className="px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap"
                style={{ background: 'var(--md-error)', color: 'var(--md-on-error, #fff)' }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {marmotDone && (
        <button
          type="button"
          onClick={() => setMarmotDone(false)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[130]"
        >
          <div className="md-snackbar">
            <span>Marmot state reset.</span>
          </div>
        </button>
      )}
    </div>
  );
}

/* ---------- Settings root ---------- */

function SettingsRoot({
  onOpen, query, onResetMarmot,
}: { onOpen: (s: string) => void; query: string; onResetMarmot: () => void }) {
  const q = query.trim().toLowerCase();
  const filter = (rows: Row[]) => (q ? rows.filter((r) => r.label.toLowerCase().includes(q)) : rows);
  const account = filter(ACCOUNT_ROWS);
  const app = filter(APP_ROWS);
  const danger = filter(DANGER_ROWS);
  const total = account.length + app.length + danger.length;

  return (
    <div className="px-3 pb-8 pt-2">
      {total === 0 && (
        <p className="text-center py-16 text-[var(--md-on-surface-variant)]">No settings match "{query}"</p>
      )}
      {account.length > 0 && <SettingsCard title="Account Settings" rows={account} onOpen={onOpen} />}
      {app.length > 0 && <SettingsCard title="App Settings" rows={app} onOpen={onOpen} />}
      {danger.length > 0 && (
        <SettingsCard title="Danger Zone" rows={danger} onOpen={onOpen} onResetMarmot={onResetMarmot} danger />
      )}
    </div>
  );
}

function SettingsCard({
  title, rows, onOpen, onResetMarmot, danger,
}: { title: string; rows: Row[]; onOpen: (s: string) => void; onResetMarmot?: () => void; danger?: boolean }) {
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
            onClick={() => {
              if (r.section) onOpen(r.section);
              else if (r.label === 'Reset Marmot State') onResetMarmot?.();
            }}
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

/**
 * Option sets are upstream enums, not invented: `ConnectivityType`
 * (`connectivity_type_always` / `_unmetered_wifi_only` / `_never`),
 * `FeatureSetType` (`ui_feature_set_type_complete` / `_simplified` /
 * `_performance`), the gallery pair (`gallery_type_classic` / `_modern`) and the
 * theme triple (`system` / `light` / `dark`).
 *
 * Two rows carry a note instead of a full list, because the real list is built
 * from the device: Language enumerates the ~50 locales the app is translated
 * into (`res/values-*`), and Push Notification enumerates the UnifiedPush
 * distributors you have installed — on a phone with none, "None" is the only
 * entry, which is what the reference screen shows.
 */
const CONNECTIVITY = ['Always', 'Unmetered WiFi', 'Never'];

const PREFS: { title: string; desc: string; value: string; options: string[]; note?: string }[] = [
  {
    title: 'Language',
    desc: "For the App's interface",
    value: 'English',
    options: ['English', 'Español', 'Português (Brasil)', 'Deutsch', 'Français', '日本語', 'Polski', 'Русский'],
    note: 'Amethyst ships around fifty locales; this is a slice of them.',
  },
  { title: 'Theme', desc: 'Dark, Light or System theme', value: 'System', options: ['System', 'Light', 'Dark'],
    note: 'In this reproduction the light/dark switch belongs to the page around the phone, not to the app inside it.' },
  { title: 'Image Preview', desc: 'Automatically load images and GIFs', value: 'Always', options: CONNECTIVITY },
  { title: 'Video Playback', desc: 'Automatically plays videos and GIFs', value: 'Always', options: CONNECTIVITY },
  { title: 'URL Preview', desc: 'Show URL previews', value: 'Always', options: CONNECTIVITY },
  { title: 'Profile Picture', desc: 'Show Profile pictures', value: 'Always', options: CONNECTIVITY },
  { title: 'Immersive Scrolling', desc: 'Hide Nav Bars when scrolling', value: 'Always', options: CONNECTIVITY },
  { title: 'UI Mode', desc: 'Choose the post style', value: 'Simplified', options: ['Complete', 'Simplified', 'Performance'] },
  { title: 'Profile Gallery Style', desc: 'Choose the gallery style', value: 'Classic', options: ['Classic', 'Modern'] },
  {
    title: 'Push Notification',
    desc: 'From installed UnifiedPush apps',
    value: 'None',
    options: ['None'],
    note: 'The rest of this list is whichever UnifiedPush distributors are installed on the phone.',
  },
];

function PreferencesView() {
  const [values, setValues] = useState<Record<string, string>>(
    () => Object.fromEntries(PREFS.map((p) => [p.title, p.value])),
  );
  const [open, setOpen] = useState<string | null>(null);
  const active = PREFS.find((p) => p.title === open);

  return (
    <div className="py-1" data-tour="amethyst-settings-preferences">
      {PREFS.map((p) => (
        <button
          key={p.title}
          type="button"
          onClick={() => setOpen(p.title)}
          data-tour={`amethyst-pref-${p.title.toLowerCase().replace(/\s+/g, '-')}`}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--md-surface-variant)]/40 transition-colors text-left"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--md-on-surface)]">{p.title}</p>
            <p className="text-sm text-[var(--md-on-surface-variant)]">{p.desc}</p>
          </div>
          <span className="text-sm text-[var(--md-on-surface-variant)] shrink-0">{values[p.title]}</span>
          <ChevronRight className="w-4 h-4 text-[var(--md-on-surface-variant)] shrink-0" />
        </button>
      ))}

      {active && (
        <ChooserDialog
          title={active.title}
          options={active.options}
          value={values[active.title]}
          note={active.note}
          onPick={(v) => setValues((cur) => ({ ...cur, [active.title]: v }))}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

/* ---------- Backup Keys (Danger Zone) ---------- */

/**
 * `AccountBackupScreen.kt`, structure for structure: the markdown safety-tips
 * block, a filled "Copy my secret key" button beside a QR icon button, then the
 * ncryptsec explainer, a password field, and the outlined "Encrypt and copy my
 * secret key" button paired with its own QR button. Both encrypted controls take
 * `enabled = password.isNotBlank()`, which is why the reference screen shows the
 * whole encryption block greyed out. Strings are `account_backup_tips2_md`,
 * `account_backup_tips3_md`, `copy_my_secret_key`, `ncryptsec_password` and
 * `encrypt_and_copy_my_secret_key`, verbatim.
 *
 * THE ONE DELIBERATE DEVIATION, and the reason this screen took so long to
 * ship: there is no key here. This simulator holds no keypair, and a faithful
 * clone of the "back up your nsec" screen that hands out a realistic-looking
 * secret key — or writes one into a visitor's clipboard — teaches exactly the
 * habit `shared/utils/keySafety.ts` exists to prevent. So both copy paths reveal
 * `DEMO_KEY_PLACEHOLDER` inline and say plainly that nothing was copied.
 */
const BACKUP_TIPS = [
  'Your account is secured by a secret key. The key is a long sequence of characters starting with **nsec1**. Anyone who has access to this secret key can post and change your identity.',
  '- Do **not** put your secret key in any website or software you do not trust.',
  '- Amethyst developers will **never** ask for your secret key.',
  '- **Do** keep a secure backup of your secret key for account recovery. We recommend using a password manager.',
];

/** Renders the `**bold**` runs of the upstream markdown strings, nothing else. */
function Md({ text, className = '' }: { text: string; className?: string }) {
  return (
    <p className={`text-[15px] leading-relaxed text-[var(--md-on-surface)] ${className}`}>
      {text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
        chunk.startsWith('**') ? (
          <strong key={i} className="font-bold">{chunk.slice(2, -2)}</strong>
        ) : (
          <React.Fragment key={i}>{chunk}</React.Fragment>
        ),
      )}
    </p>
  );
}

function BackupKeysView() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Which copy path the visitor tapped — only ever used to reveal the demo
  // placeholder and the "nothing was copied" line.
  const [revealed, setRevealed] = useState<'plain' | 'encrypted' | null>(null);
  const canEncrypt = password.trim().length > 0;

  return (
    <div className="px-5 py-3 pb-10 flex flex-col items-center" data-tour="amethyst-backup-keys">
      <div className="w-full space-y-3">
        <h2 className="text-xl font-bold text-[var(--md-on-surface)]">Key Backup and Safety Tips</h2>
        {BACKUP_TIPS.map((line) => (
          <Md key={line} text={line} />
        ))}
      </div>

      {/* Copy row: filled primary button + QR icon button, side by side */}
      <div className="flex items-center gap-1 mt-5">
        <button
          type="button"
          onClick={() => setRevealed('plain')}
          data-tour="amethyst-backup-copy"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
          style={{ background: 'var(--md-primary)', color: 'var(--md-on-primary)' }}
        >
          <KeyRound className="w-4 h-4" /> Copy my secret key
        </button>
        <button
          type="button"
          onClick={() => setRevealed('plain')}
          aria-label="Show private key QR code"
          className="w-11 h-11 flex items-center justify-center"
          style={{ color: 'var(--md-primary)' }}
        >
          <QrCode className="w-6 h-6" />
        </button>
      </div>

      <div className="w-full mt-7 space-y-3">
        <Md text="For additional security, you can encrypt your key with a password. This key starts with **ncryptsec1** and cannot be used without your password." />
        <Md text="If you lose your password, you will not be able to recover your key." />
      </div>

      {/* ncryptsec password field */}
      <div className="w-full mt-5 flex items-center gap-1 rounded border border-[var(--md-outline)] px-3 h-14">
        <input
          {...SECRET_INPUT_PROPS}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setRevealed(null);
          }}
          placeholder="password to open the key"
          aria-label="password to open the key"
          className="flex-1 min-w-0 bg-transparent text-[16px] text-[var(--md-on-surface)] focus:outline-none placeholder:text-[var(--amethyst-placeholder)]"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="w-10 h-10 shrink-0 flex items-center justify-center text-[var(--md-on-surface)]"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Encrypted copy row — disabled until the password field has content,
          which is the greyed-out state the reference screen is filmed in. */}
      <div className="flex items-center gap-1 mt-3">
        <button
          type="button"
          disabled={!canEncrypt}
          onClick={() => setRevealed('encrypted')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
          style={{
            border: '1px solid var(--md-outline)',
            color: canEncrypt ? 'var(--md-primary)' : 'var(--amethyst-placeholder)',
            opacity: canEncrypt ? 1 : 0.38,
          }}
        >
          <KeyRound className="w-4 h-4" /> Encrypt and copy my secret key
        </button>
        <button
          type="button"
          disabled={!canEncrypt}
          onClick={() => setRevealed('encrypted')}
          aria-label="Show encrypted private key QR code"
          className="w-11 h-11 flex items-center justify-center"
          style={{ color: canEncrypt ? 'var(--md-primary)' : 'var(--amethyst-placeholder)', opacity: canEncrypt ? 1 : 0.38 }}
        >
          <QrCode className="w-6 h-6" />
        </button>
      </div>

      {revealed && (
        <div
          className="w-full mt-5 rounded-xl px-4 py-3"
          style={{ background: 'var(--md-surface-container-high)' }}
        >
          <p className="text-xs font-mono break-all text-[var(--md-on-surface)]">
            {revealed === 'encrypted'
              ? DEMO_KEY_PLACEHOLDER.replace('nsec1…', 'ncryptsec1…')
              : DEMO_KEY_PLACEHOLDER}
          </p>
          <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--amethyst-placeholder)' }}>
            Simulation: this demo account has no key, so nothing was copied to your clipboard. In the
            real app this row is where your nsec would be — copying asks for your fingerprint first.
          </p>
        </div>
      )}
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
  // `content_warning_*` options — the third control in this header is a chooser,
  // not a switch, which is why it used to render as a dead `<span>` between two
  // working toggles (gaps ame-40).
  const [sensitive, setSensitive] = useState('Warn');
  const [sensitiveOpen, setSensitiveOpen] = useState(false);
  const [blocked, setBlocked] = useState(BLOCKED);
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
      <div className="px-4 pt-3 space-y-4" data-tour="amethyst-security-toggles">
        <PrefRow title="Warn on reports" desc="Shows a warning message when posts have 5 or more reports from your follows">
          <Toggle on={warnReports} onToggle={() => setWarnReports((v) => !v)} />
        </PrefRow>
        <PrefRow title="Filter spam" desc="Hides posts from strangers that were exactly the same for 5 or more times">
          <Toggle on={filterSpam} onToggle={() => setFilterSpam((v) => !v)} />
        </PrefRow>
        <PrefRow title="Show sensitive content" desc="Shows a warning message when the author of the post marked it as sensitive">
          <button
            type="button"
            onClick={() => setSensitiveOpen(true)}
            data-tour="amethyst-security-sensitive"
            className="px-4 py-1.5 rounded-lg bg-[var(--md-surface-variant)] text-sm text-[var(--md-on-surface)]"
          >
            {sensitive}
          </button>
        </PrefRow>
      </div>

      {sensitiveOpen && (
        <ChooserDialog
          title="Show sensitive content"
          options={['Hide', 'Show', 'Warn']}
          value={sensitive}
          onPick={setSensitive}
          onClose={() => setSensitiveOpen(false)}
        />
      )}

      {/* sub-tabs */}
      <div className="md-tabs mt-4 sticky top-0 bg-[var(--md-background)] z-10" data-tour="amethyst-security-tabs">
        {(['blocked', 'spammers', 'hidden'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`md-tab whitespace-nowrap ${tab === t ? 'active' : ''}`}>
            {t === 'blocked' ? 'Blocked Users' : t === 'spammers' ? 'Spammers' : 'Hidden Words'}
            {tab === t && <motion.div layoutId="sec-tab-indicator" className="md-tab-indicator" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />}
          </button>
        ))}
      </div>

      {tab === 'blocked' ? (
        <div className="py-1" data-tour="amethyst-blocked-list">
          {blocked.length === 0 ? (
            <div className="text-center py-12 text-[var(--md-on-surface-variant)]">No blocked users</div>
          ) : blocked.map((u) => (
            <div key={u.name} className="flex items-center gap-3 px-4 py-2.5">
              <Avatar seed={u.name} className="w-10 h-10" />
              <span className="flex-1 min-w-0 truncate text-[var(--md-on-surface)]">{u.name}</span>
              <button
                type="button"
                onClick={() => setBlocked((cur) => cur.filter((b) => b.name !== u.name))}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-[var(--md-primary)] text-[var(--md-on-primary)]"
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      ) : tab === 'spammers' ? (
        // Upstream this list fills itself from the "Filter spam" toggle above and
        // resets on app restart (`security_spamming_users_empty`), so with the
        // toggle off it can never fill at all — worth saying, because toggling it
        // was the one thing on this screen that demonstrably changed nothing
        // (gaps ame-104).
        <div className="text-center px-8 py-12 text-[var(--md-on-surface-variant)]">
          {filterSpam ? (
            'No accounts have been flagged as spam in this session.'
          ) : (
            <>
              Spam filtering is off, so nothing gets flagged.
              <br />
              Turn "Filter spam" back on above to start collecting this list.
            </>
          )}
        </div>
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

/* ---------- Media Servers (Blossom) ---------- */

/**
 * `media_servers_*` + `blossom_*`. The FAQ's `media-uploader` answer describes
 * this screen row by row — upload priority with #1 as Primary, the recommended
 * list, the paste-your-own field — and used to spotlight a row that did nothing
 * (gaps ame-33).
 */
const RECOMMENDED_BLOSSOM = ['blossom.primal.net', 'cdn.satellite.earth', 'nostr.download'];

function MediaServersView() {
  const [servers, setServers] = useState<string[]>(['blossom.primal.net', 'cdn.satellite.earth']);
  const [mirror, setMirror] = useState(true);
  const [optimize, setOptimize] = useState(false);
  const [draft, setDraft] = useState('');

  const add = (host: string) => {
    const clean = host.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (!clean || servers.includes(clean)) return;
    setServers((s) => [...s, clean]);
    setDraft('');
  };

  return (
    <div className="px-4 py-4 pb-8 space-y-6" data-tour="amethyst-media-servers">
      <div>
        <h3 className="font-semibold" style={{ color: 'var(--md-primary)' }}>Upload behaviour</h3>
        <div className="mt-3 space-y-4">
          <PrefRow title="Mirror uploads" desc="After uploading, copy the file to your other Blossom servers so it stays available if one goes offline.">
            <Toggle on={mirror} onToggle={() => setMirror((v) => !v)} />
          </PrefRow>
          <PrefRow title="Optimize media on the server" desc="Upload through the server's /media endpoint so it can strip metadata and compress the file. The stored file may differ from the original.">
            <Toggle on={optimize} onToggle={() => setOptimize((v) => !v)} />
          </PrefRow>
        </div>
      </div>

      <div>
        <h3 className="font-semibold" style={{ color: 'var(--md-primary)' }}>Upload priority</h3>
        <p className="text-sm text-[var(--md-on-surface-variant)] mt-1 mb-3">
          Drag to reorder. Uploads try each server from the top down.
        </p>
        {servers.length === 0 ? (
          <p className="text-sm text-[var(--md-on-surface-variant)] py-6">
            You have no Blossom servers set. You can use Amethyst's list, or add one below ↓
          </p>
        ) : (
          <div className="space-y-2">
            {servers.map((host, i) => (
              <div
                key={host}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
                style={{ background: 'var(--md-surface-container-low)' }}
              >
                <span className="text-sm shrink-0 w-6 text-[var(--md-on-surface-variant)]">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[var(--md-on-surface)]">{host}</p>
                  {i === 0 && (
                    <p className="text-xs" style={{ color: 'var(--md-primary)' }}>Primary</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setServers((s) => s.filter((h) => h !== host))}
                  aria-label={`Remove ${host}`}
                  className="w-8 h-8 shrink-0 flex items-center justify-center text-[var(--md-on-surface-variant)]"
                >
                  <CircleX className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold" style={{ color: 'var(--md-primary)' }}>Add a server</h3>
        <p className="text-sm text-[var(--md-on-surface-variant)] mt-2 mb-2">Recommended</p>
        <div className="flex flex-wrap gap-2">
          {RECOMMENDED_BLOSSOM.filter((h) => !servers.includes(h)).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => add(h)}
              className="px-3 py-1.5 rounded-full text-sm"
              style={{ border: '1px solid var(--md-outline)', color: 'var(--md-on-surface)' }}
            >
              + {h}
            </button>
          ))}
        </div>

        <div className="mt-4 relative">
          <span className="absolute -top-2 left-3 px-1 text-[11px] z-10 bg-[var(--md-background)] text-[var(--md-on-surface-variant)]">
            Or paste a server address
          </span>
          <div className="flex items-center gap-2 rounded border border-[var(--md-outline)] pl-3 pr-1.5 h-14">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') add(draft); }}
              placeholder="blossom.example"
              aria-label="Or paste a server address"
              autoCapitalize="off"
              spellCheck={false}
              className="flex-1 min-w-0 bg-transparent text-[16px] text-[var(--md-on-surface)] focus:outline-none placeholder:text-[var(--amethyst-placeholder)]"
            />
            <button
              type="button"
              onClick={() => add(draft)}
              className="shrink-0 px-5 py-2 rounded-full text-sm font-medium text-white"
              style={{ background: draft.trim() ? 'var(--md-primary)' : 'var(--amethyst-placeholder)' }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Privacy Options (Tor) ---------- */

/** `tor_*`, verbatim: a preset row followed by one switch per traffic class. */
const TOR_ROWS = [
  { title: 'Onion Url/Relays', desc: 'Use Tor for any .onion url', on: true },
  { title: 'DM Relays', desc: 'Force Tor to send and receive DMs', on: false },
  { title: 'Untrusted Relays', desc: 'Force Tor on outbox/inbox relays', on: false },
  { title: 'Trusted Relays', desc: 'Force Tor on all relays in your lists', on: false },
  { title: 'Profile Pictures', desc: 'Force Tor when loading profile pictures', on: false },
  { title: 'URL Previews', desc: 'Force Tor when loading url previews', on: false },
  { title: 'Images', desc: 'Force Tor when loading images', on: false },
  { title: 'Videos', desc: 'Force Tor when loading videos', on: false },
  { title: 'Money Operations', desc: 'Force Tor on zaps, lightning and cashu transfers', on: false },
  { title: 'Nostr Address Verification', desc: 'Force Tor when verifying NIP-05 addresses', on: false },
];

function PrivacyOptionsView() {
  const [preset, setPreset] = useState('Default');
  const [presetOpen, setPresetOpen] = useState(false);
  const [flags, setFlags] = useState<Record<string, boolean>>(
    () => Object.fromEntries(TOR_ROWS.map((r) => [r.title, r.on])),
  );

  const applyPreset = (p: string) => {
    setPreset(p);
    // The presets exist precisely to flip the switches below in one go — a
    // preset row that left them alone would be the dead control again.
    if (p === 'Full Privacy') setFlags(Object.fromEntries(TOR_ROWS.map((r) => [r.title, true])));
    if (p === 'No Tor') setFlags(Object.fromEntries(TOR_ROWS.map((r) => [r.title, false])));
    if (p === 'Default') setFlags(Object.fromEntries(TOR_ROWS.map((r) => [r.title, r.on])));
  };

  return (
    <div className="px-4 py-4 pb-8" data-tour="amethyst-privacy-options">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--md-on-surface)]">Tor/Privacy Presets</p>
          <p className="text-sm text-[var(--md-on-surface-variant)]">Quickly modify all settings below</p>
        </div>
        <button
          type="button"
          onClick={() => setPresetOpen(true)}
          className="shrink-0 px-4 py-1.5 rounded-lg bg-[var(--md-surface-variant)] text-sm text-[var(--md-on-surface)]"
        >
          {preset}
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {TOR_ROWS.map((r) => (
          <PrefRow key={r.title} title={r.title} desc={r.desc}>
            <Toggle
              on={flags[r.title]}
              onToggle={() => {
                setFlags((f) => ({ ...f, [r.title]: !f[r.title] }));
                setPreset('Custom');
              }}
            />
          </PrefRow>
        ))}
      </div>

      <p className="text-xs mt-6 leading-relaxed" style={{ color: 'var(--amethyst-placeholder)' }}>
        Simulation: nothing here reaches a network, so these switches change what the screen says and
        nothing else. In the real app they route that traffic class through Tor.
      </p>

      {presetOpen && (
        <ChooserDialog
          title="Tor/Privacy Presets"
          options={['Default', 'Full Privacy', 'No Tor', 'Custom']}
          value={preset}
          onPick={applyPreset}
          onClose={() => setPresetOpen(false)}
        />
      )}
    </div>
  );
}

/* ---------- Danger Zone: Request to Vanish + Vanish History ---------- */

/** `vanish_*`, verbatim — including the ALL RELAYS warning, which is the point. */
function VanishRequestView() {
  const [target, setTarget] = useState('ALL RELAYS');
  const [targetOpen, setTargetOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <div className="px-4 py-4 pb-8" data-tour="amethyst-vanish">
      <p className="text-sm leading-relaxed text-[var(--md-on-surface-variant)]">
        Request relays to permanently delete all your data up to the selected date. This action is
        based on NIP-62 and is legally binding in some jurisdictions.
      </p>

      <div className="mt-5 flex items-start justify-between gap-4">
        <p className="flex-1 font-medium text-[var(--md-on-surface)]">Target Relays</p>
        <button
          type="button"
          onClick={() => setTargetOpen(true)}
          className="shrink-0 px-4 py-1.5 rounded-lg bg-[var(--md-surface-variant)] text-sm text-[var(--md-on-surface)]"
        >
          {target}
        </button>
      </div>

      {target === 'ALL RELAYS' && (
        <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--md-error)' }}>
          This will request ALL relays to delete everything associated with your key up to the
          selected date. This event will be broadcast as widely as possible. This action cannot be
          undone.
        </p>
      )}

      <p className="font-medium mt-5 text-[var(--md-on-surface)]">Delete data up to</p>
      <p className="text-sm text-[var(--md-on-surface-variant)]">
        All your events created before this date will be requested for deletion from the selected relay.
      </p>
      <p className="mt-2 px-4 py-2.5 rounded-lg inline-block bg-[var(--md-surface-variant)] text-[var(--md-on-surface)]">
        Today
      </p>

      <div className="mt-5 relative">
        <span className="absolute -top-2 left-3 px-1 text-[11px] z-10 bg-[var(--md-background)] text-[var(--md-on-surface-variant)]">
          Reason (optional)
        </span>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason or legal notice for the relay operator"
          aria-label="Reason (optional)"
          className="w-full rounded border border-[var(--md-outline)] px-3 h-14 bg-transparent text-[16px] text-[var(--md-on-surface)] focus:outline-none placeholder:text-[var(--amethyst-placeholder)]"
        />
      </div>

      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="mt-5 w-full px-5 py-3 rounded-full text-sm font-medium"
        style={{ background: 'var(--md-error)', color: 'var(--md-on-error, #fff)' }}
      >
        Send Vanish Request
      </button>

      {sent && (
        <p className="text-sm mt-4 leading-relaxed" style={{ color: 'var(--amethyst-placeholder)' }}>
          Simulation: nothing was broadcast. In the real app this publishes a NIP-62 event and the
          request appears under Vanish History.
        </p>
      )}

      {targetOpen && (
        <ChooserDialog
          title="Target Relays"
          options={['ALL RELAYS', 'nostr.wine', 'nostr.mom', 'nos.lol', 'relay.damus.io']}
          value={target}
          onPick={setTarget}
          onClose={() => setTargetOpen(false)}
        />
      )}

      {confirming && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center px-6" role="dialog" aria-label="Confirm Vanish Request">
          <div className="absolute inset-0 bg-black/60" onClick={() => setConfirming(false)} />
          <div className="relative w-full rounded-3xl p-5" style={{ background: 'var(--md-surface-container-high)' }}>
            <p className="text-lg font-bold text-[var(--md-on-surface)]">Confirm Vanish Request</p>
            <p className="text-sm mt-2 leading-relaxed text-[var(--md-on-surface-variant)]">
              {target === 'ALL RELAYS'
                ? 'You are about to request EVERY relay to permanently delete all your data created before the selected date. This will be broadcast everywhere and cannot be undone.'
                : `You are about to request ${target} to permanently delete all your data created before the selected date. This cannot be undone.`}
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap text-[var(--md-on-surface)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { setConfirming(false); setSent(true); }}
                className="px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap"
                style={{ background: 'var(--md-error)', color: 'var(--md-on-error, #fff)' }}
              >
                Send Vanish Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** `vanish_events_*` — an account that never sent one has only the empty state. */
function VanishHistoryView() {
  return (
    <div className="px-4 py-4" data-tour="amethyst-vanish-history">
      <p className="text-sm leading-relaxed text-[var(--md-on-surface-variant)]">
        These are your past Request to Vanish events found on connected relays. Relays tagged in
        these events should not hold any of your data from before the event date.
      </p>
      <div className="flex flex-col items-center text-center px-6 pt-20">
        <p className="text-xl font-bold text-[var(--md-on-surface)]">No vanish requests found</p>
        <p className="text-[15px] mt-2 text-[var(--md-on-surface-variant)]">
          You haven't sent any Request to Vanish events yet.
        </p>
      </div>
    </div>
  );
}

/* ---------- Relays ---------- */

type Relay = { name: string; size: string; hue: number };

const OUTBOX: Relay[] = [
  { name: 'nostr.wine', size: '196 MB', hue: 300 },
  { name: 'nostr.mom', size: '163 MB', hue: 140 },
  { name: 'nos.lol', size: '2 MB', hue: 40 },
  { name: 'relay.damus.io', size: '1 MB', hue: 260 },
  { name: 'garden.zap.cooking', size: '0', hue: 90 },
];
const INBOX: Relay[] = [
  { name: 'nostr.wine', size: '196 MB', hue: 300 },
  { name: 'nostr.mom', size: '163 MB', hue: 140 },
];

/**
 * `RelayUrlNormalizer.normalizeOrNull` in one line of what a simulator can
 * honestly do: upstream refuses the input when it does not normalise to a relay
 * url, so an empty or scheme-only entry must not create a row.
 */
function normalizeRelay(input: string): string | null {
  const host = input
    .trim()
    .toLowerCase()
    .replace(/^(wss?|https?):\/\//, '')
    .replace(/\/+$/, '');
  return /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/.test(host) ? host : null;
}

function hueFor(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

function RelaysView() {
  // Local per-group lists: upstream keeps home (outbox) and notification
  // (inbox) relays in separate flows on Nip65RelayListViewModel, each with its
  // own add/delete pair, so a relay added to one group does not appear in the other.
  const [outbox, setOutbox] = useState<Relay[]>(OUTBOX);
  const [inbox, setInbox] = useState<Relay[]>(INBOX);

  const add = (setter: React.Dispatch<React.SetStateAction<Relay[]>>) => (host: string) =>
    setter((rs) => (rs.some((r) => r.name === host) ? rs : [...rs, { name: host, size: '0', hue: hueFor(host) }]));
  const remove = (setter: React.Dispatch<React.SetStateAction<Relay[]>>) => (host: string) =>
    setter((rs) => rs.filter((r) => r.name !== host));

  return (
    <div className="pb-6">
      <RelaySection
        title="Public Outbox/Home Relays"
        desc="This relay type stores all your posts here and others read your content. Insert between 1–3 relays, paid relays or public relays."
        relays={outbox}
        onAdd={add(setOutbox)}
        onRemove={remove(setOutbox)}
        // Anchored per section: a caption about the outbox group has to ring the
        // group, not the whole scrolling settings screen (which the overlay
        // refuses to spotlight at all).
        tour="amethyst-relays-outbox"
        addTour="amethyst-relay-add"
      />
      <RelaySection
        title="Public Inbox Relays"
        desc="This relay type receives all your tags. They can be public so the relay operator can limit the good and for the bad."
        relays={inbox}
        onAdd={add(setInbox)}
        onRemove={remove(setInbox)}
        tour="amethyst-relays-inbox"
      />
    </div>
  );
}

function RelaySection({
  title, desc, relays, onAdd, onRemove, tour, addTour,
}: {
  title: string;
  desc: string;
  relays: Relay[];
  onAdd: (host: string) => void;
  onRemove: (host: string) => void;
  tour?: string;
  addTour?: string;
}) {
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
            {/* RelayNameAndRemoveButton's trailing 30dp Cancel IconButton,
                contentDescription `remove` — present on every row upstream. */}
            <button
              type="button"
              onClick={() => onRemove(r.name)}
              aria-label={`Remove ${r.name}`}
              className="w-8 h-8 shrink-0 flex items-center justify-center text-[var(--md-on-surface-variant)]"
            >
              <CircleX className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      <RelayUrlEditField onAdd={onAdd} tour={addTour} />
    </div>
  );
}

/**
 * `RelayUrlEditField` — an OutlinedTextField LABELLED "Add a Relay" with the
 * placeholder "server.com" and a filled trailing "Add" button, not the plain
 * text link we shipped until now. Upstream renders one per group (see
 * `renderNip65HomeItems` / `renderNip65NotifItems`), so both get one here.
 * The button's container is `primary` while the field has content and
 * `placeholderText` while it is empty.
 */
function RelayUrlEditField({ onAdd, tour }: { onAdd: (host: string) => void; tour?: string }) {
  const [url, setUrl] = useState('');
  const submit = () => {
    const host = normalizeRelay(url);
    if (!host) return;
    onAdd(host);
    setUrl('');
  };
  const filled = url.trim().length > 0;

  return (
    <div data-tour={tour} className="mt-4 relative">
      <span className="absolute -top-2 left-3 px-1 text-[11px] z-10 bg-[var(--md-background)] text-[var(--md-on-surface-variant)]">
        Add a Relay
      </span>
      <div className="flex items-center gap-2 rounded border border-[var(--md-outline)] pl-3 pr-1.5 h-14">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="server.com"
          aria-label="Add a Relay"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="flex-1 min-w-0 bg-transparent text-[16px] text-[var(--md-on-surface)] focus:outline-none placeholder:text-[var(--amethyst-placeholder)]"
        />
        <button
          type="button"
          onClick={submit}
          className="shrink-0 px-5 py-2 rounded-full text-sm font-medium text-white"
          style={{ background: filled ? 'var(--md-primary)' : 'var(--amethyst-placeholder)' }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
