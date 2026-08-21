import { useState } from 'react';
import {
  AlignJustify,
  AlignLeft,
  ArrowLeft,
  BookOpen,
  Bookmark,
  Bug,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Code2,
  Computer,
  Eye,
  Globe,
  Grid3x3,
  Palette,
  ArrowUpDown,
  Heart,
  Highlighter,
  Home,
  Image,
  Info,
  Library,
  Lightbulb,
  Lock,
  Moon,
  Pencil,
  Plane,
  Play,
  Plus,
  RadioTower,
  Rss,
  Sun,
  Underline,
  Upload,
  User,
  Users,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import { IconButton } from '../components/TopBar';
import {
  borisLocalRelays,
  borisReadRelays,
  borisWriteRelays,
  type BorisRelayRow,
} from '../borisData';
import type { BorisSettingsScreen } from '../types';

/**
 * Settings (ui/settings/SettingsScreen.kt and every file beside it).
 *
 * It is ONE screen with two states, not two destinations: `openCategory == null`
 * shows the root list, anything else shows that sub-screen, and Back inside a
 * sub-screen returns to the list rather than popping the app's nav stack
 * (SettingsScreen.kt:143-207).
 *
 * The root list is three cards, 16dp apart, each `RoundedCornerShape(24.dp)`
 * filled with `surfaceVariant` at **40% alpha** — measured off the reference
 * recording as #1E1E20 over #18181B, which is what sent us to
 * SettingsScreen.kt:225 to confirm the alpha rather than inventing a shade.
 * There are no group headers; the card break IS the grouping.
 *
 * Each row: a 40dp circle filled with the group tint at 16% alpha holding a
 * 22dp icon at full tint, then a semibold titleMedium over a bodySmall
 * subtitle. No chevron — the title column is unweighted, so there is no
 * trailing slot at all (SettingsScreen.kt:247-281).
 *
 * Group tints are three greys nobody would guess: #8D6E63 for the "look"
 * family, #5B7C99 for the "places" family, #78909C for About
 * (SettingsTints.kt:7-9).
 */

const TINT_LOOK = '#8D6E63';
const TINT_PLACES = '#5B7C99';
const TINT_ABOUT = '#78909C';

interface Row {
  id: BorisSettingsScreen;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tint: string;
}

const GROUPS: Row[][] = [
  [
    { id: 'appearance', title: 'Appearance', subtitle: 'Theme, dark and light colors', icon: <Palette size={22} />, tint: TINT_LOOK },
    { id: 'reading', title: 'Reading', subtitle: 'Font, size, alignment, weblinks', icon: <BookOpen size={22} />, tint: TINT_LOOK },
    { id: 'tts', title: 'Text-to-Speech', subtitle: 'Speed, voice, preview, follow-along', icon: <Volume2 size={22} />, tint: TINT_LOOK },
    { id: 'media', title: 'Media', subtitle: 'Full-width images', icon: <Image size={22} />, tint: TINT_LOOK },
    { id: 'highlights', title: 'Highlights', subtitle: 'Style, colors, visibility', icon: <Highlighter size={22} />, tint: TINT_LOOK },
    { id: 'zap-splits', title: 'Zap Splits', subtitle: 'Shares for you, authors, and Boris', icon: <Zap size={22} />, tint: TINT_LOOK },
  ],
  [
    { id: 'home', title: 'Home', subtitle: 'Sections, archived articles', icon: <Home size={22} />, tint: TINT_PLACES },
    { id: 'library', title: 'Library', subtitle: 'Default view', icon: <Library size={22} />, tint: TINT_PLACES },
    { id: 'feeds', title: 'Feeds', subtitle: 'Default view, scope, RSS feeds', icon: <Rss size={22} />, tint: TINT_PLACES },
    { id: 'scroll', title: 'Scroll Behaviour', subtitle: 'Top bar, volume button scrolling', icon: <ArrowUpDown size={22} />, tint: TINT_PLACES },
    { id: 'relays', title: 'Relays', subtitle: 'Connection status of your nostr relays', icon: <RadioTower size={22} />, tint: TINT_PLACES },
    { id: 'airplane', title: 'Airplane mode', subtitle: 'Downloads, storage, local relays', icon: <Plane size={22} />, tint: TINT_PLACES },
  ],
  [{ id: 'about', title: 'About', subtitle: 'Boris, tutorial, support, links', icon: <Info size={22} />, tint: TINT_ABOUT }],
];

const TITLES: Record<BorisSettingsScreen, string> = {
  root: 'Settings',
  appearance: 'Appearance',
  reading: 'Reading',
  tts: 'Text-to-Speech',
  media: 'Media',
  highlights: 'Highlights',
  'zap-splits': 'Zap Splits',
  home: 'Home',
  library: 'Library',
  feeds: 'Feeds',
  scroll: 'Scroll Behaviour',
  relays: 'Relays',
  airplane: 'Airplane mode',
  about: 'About',
};

// --- shared primitives (ui/settings/SettingsControls.kt) --------------------

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="flex-1 text-[15px]" style={{ color: 'var(--boris-on-bg)' }}>
        {label}
      </span>
      {children}
    </div>
  );
}

/** `SettingCheckbox` is a Material 3 Switch despite the name (SettingsControls.kt:59). */
function SettingSwitch({
  label,
  value,
  onChange,
  tourId,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  tourId?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      data-tour={tourId}
      className="flex w-full items-center justify-between gap-3 py-2 text-left"
    >
      <span className="flex-1 text-[15px]" style={{ color: 'var(--boris-on-bg)' }}>
        {label}
      </span>
      <span
        className="relative h-8 w-[52px] shrink-0 rounded-full transition-colors"
        style={{
          background: value ? 'var(--boris-primary)' : 'var(--boris-surface-variant)',
          border: `2px solid ${value ? 'var(--boris-primary)' : 'var(--boris-outline)'}`,
        }}
      >
        <span
          className="absolute top-1/2 block rounded-full transition-all"
          style={{
            height: value ? 24 : 16,
            width: value ? 24 : 16,
            left: value ? 24 : 6,
            transform: 'translateY(-50%)',
            background: value ? 'var(--boris-on-primary)' : 'var(--boris-outline)',
          }}
        />
      </span>
    </button>
  );
}

/** 40dp square, 8dp corners; selected fills with `primary` (SettingsControls.kt:89). */
function IconToggle({
  icon,
  selected,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-lg"
      style={{
        background: selected ? 'var(--boris-primary)' : 'transparent',
        border: `1px solid ${selected ? 'transparent' : 'var(--boris-outline)'}`,
        color: selected ? 'var(--boris-on-primary)' : 'var(--boris-on-surface-variant)',
      }}
    >
      {icon}
    </button>
  );
}

/** 40dp swatch; 2dp primary border when selected, plus a contrast-aware tick. */
function ColorChip({
  color,
  selected,
  label,
  outlined,
  onClick,
}: {
  color: string;
  selected: boolean;
  label: string;
  outlined?: boolean;
  onClick: () => void;
}) {
  // SettingsControls.kt:136-138 — the tick is #18181B on a light swatch,
  // #F4F4F5 otherwise, switched on luminance > 0.55.
  const light = ['#FFFFFF', '#F4F1EA', '#FFFFF0', '#FDE047'].includes(color.toUpperCase());
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-lg"
      style={{
        background: color,
        border: selected
          ? '2px solid var(--boris-primary)'
          : outlined
            ? '1px solid var(--boris-outline)'
            : '1px solid color-mix(in srgb, var(--boris-outline) 40%, transparent)',
      }}
    >
      {selected && <Check size={18} color={light ? '#18181B' : '#F4F4F5'} />}
    </button>
  );
}

/** Row of 22dp circles (SettingsControls.kt:161). */
function ColorSwatches({
  colors,
  value,
  onChange,
}: {
  colors: string[];
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={c}
          title={c}
          onClick={() => onChange(c)}
          className="h-[22px] w-[22px] rounded-full"
          style={{
            background: c,
            border:
              c.toLowerCase() === value.toLowerCase()
                ? '2px solid var(--boris-on-bg)'
                : '1px solid color-mix(in srgb, var(--boris-outline) 50%, transparent)',
          }}
        />
      ))}
    </div>
  );
}

const HIGHLIGHT_SWATCHES = ['#fde047', '#f97316', '#ec4899', '#22c55e', '#3b82f6', '#9333ea'];
const LINK_SWATCHES_DARK = ['#38bdf8', '#22d3ee', '#60a5fa', '#818cf8', '#3b82f6', '#9333ea'];
const FONT_SIZES = [16, 18, 21, 24, 28, 32];

/**
 * `ReadingPreview` — ONE component, rendered on Appearance, Reading and
 * Highlights (SettingsScreen.kt:302/306/312). The copy is fixed
 * (ReadingPreview.kt:174-188) and the marked span in each paragraph is always
 * the SECOND sentence, in mine / friends / nostrverse order.
 *
 * The mark is drawn at 45% alpha with a 3dp radius, inflated 5dp horizontally
 * and 3dp vertically (HighlightMarks.kt:173-203) — the same routine the reader
 * uses, which is why a mark here bleeds slightly past the glyphs.
 */
function ReadingPreview({
  fontSize,
  justify,
  showHighlights,
  mine,
  friends,
  nostrverse,
  underline,
}: {
  fontSize: number;
  justify: boolean;
  showHighlights: boolean;
  mine: string;
  friends: string;
  nostrverse: string;
  underline: boolean;
}) {
  const markStyle = (c: string): React.CSSProperties =>
    underline
      ? { boxShadow: `inset 0 -2px 0 0 ${c}E0`, borderRadius: 0 }
      : { background: `color-mix(in srgb, ${c} 45%, transparent)`, borderRadius: '3px', padding: '3px 5px' };

  const body: React.CSSProperties = {
    fontSize: `${Math.round(fontSize * 0.85)}px`,
    lineHeight: `${Math.round(fontSize * 0.85 * (36 / 21))}px`,
    textAlign: justify ? 'justify' : 'left',
    color: 'var(--boris-on-bg)',
  };

  return (
    <div
      className="rounded-lg p-4"
      style={{ border: '1px solid var(--boris-outline)' }}
      data-tour="boris-settings-preview"
    >
      <p
        className="text-[11px] font-medium uppercase"
        style={{ color: 'var(--boris-on-surface-variant)', letterSpacing: '0.05em' }}
      >
        Preview
      </p>
      <h3
        className="boris-display mt-3"
        style={{ fontSize: `${Math.round(fontSize * 1.28)}px`, lineHeight: 1.25, color: 'var(--boris-on-bg)' }}
      >
        The Quick Brown Fox
      </h3>
      <p className="boris-prose mt-3" style={body}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.{' '}
        {showHighlights ? (
          <span style={markStyle(mine)}>
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </span>
        ) : (
          'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        )}{' '}
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat.
      </p>
      <p className="boris-prose mt-3" style={body}>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur.{' '}
        {showHighlights ? (
          <span style={markStyle(friends)}>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim
            id est laborum.
          </span>
        ) : (
          'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        )}{' '}
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
      </p>
      <p className="boris-prose mt-3" style={body}>
        Totam rem aperiam, eaque ipsa quae ab illo{' '}
        <span style={{ color: 'var(--boris-link)' }}>inventore veritatis</span> et quasi architecto beatae
        vitae dicta sunt explicabo.{' '}
        {showHighlights ? (
          <span style={markStyle(nostrverse)}>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
            consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          </span>
        ) : (
          'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.'
        )}{' '}
        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
      </p>
    </div>
  );
}

// --- the screen ------------------------------------------------------------

export interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  darkVariant: 'black' | 'midnight' | 'charcoal';
  lightVariant: 'paper-white' | 'sepia' | 'ivory';
  fontSize: number;
  justify: boolean;
  linkColor: string;
  openLinksInBoris: boolean;
  fullWidthImages: boolean;
  showHighlights: boolean;
  highlightStyle: 'marker' | 'underline';
  mine: string;
  friends: string;
  nostrverse: string;
  visibility: { nostrverse: boolean; friends: boolean; mine: boolean };
  zapSplitsEnabled: boolean;
  hideArchived: boolean;
  ttsSpeed: string;
  ttsFollowAlong: boolean;
  hideTopBarOnScroll: boolean;
  volumeScroll: boolean;
  syncPosition: boolean;
  autoScroll: boolean;
  autoArchive: boolean;
  archiveCloses: boolean;
  scrollAmount: string;
}

export const DEFAULT_SETTINGS: SettingsState = {
  // Every value below is the shipped default from data/UserSettings.kt.
  theme: 'system',
  darkVariant: 'midnight',
  lightVariant: 'sepia',
  fontSize: 21,
  justify: true,
  linkColor: '#38bdf8',
  openLinksInBoris: true,
  fullWidthImages: true,
  showHighlights: true,
  highlightStyle: 'marker',
  mine: '#fde047',
  friends: '#f97316',
  nostrverse: '#9333ea',
  visibility: { nostrverse: true, friends: true, mine: true },
  zapSplitsEnabled: true,
  hideArchived: false,
  ttsSpeed: '2.1x',
  ttsFollowAlong: true,
  hideTopBarOnScroll: true,
  volumeScroll: true,
  syncPosition: true,
  autoScroll: true,
  autoArchive: false,
  archiveCloses: true,
  scrollAmount: '90%',
};

export function SettingsScreen({
  screen,
  settings,
  onSettings,
  onScreenChange,
  onBack,
  onOpenAbout,
  onOpenSupport,
}: {
  screen: BorisSettingsScreen;
  settings: SettingsState;
  onSettings: (patch: Partial<SettingsState>) => void;
  onScreenChange: (s: BorisSettingsScreen) => void;
  onBack: () => void;
  onOpenAbout: () => void;
  onOpenSupport: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col" style={{ background: 'var(--boris-bg)' }}>
      <div className="flex h-16 shrink-0 items-center pl-1">
        <IconButton
          label="Back"
          onClick={() => (screen === 'root' ? onBack() : onScreenChange('root'))}
          tourId="boris-settings-back"
        >
          <ArrowLeft size={24} />
        </IconButton>
        <span className="text-[16px] font-medium" style={{ color: 'var(--boris-on-bg)' }}>
          {TITLES[screen]}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        {screen === 'root' ? (
          <Root onOpen={onScreenChange} />
        ) : (
          <SubScreen
            screen={screen}
            settings={settings}
            onSettings={onSettings}
            onOpenAbout={onOpenAbout}
            onOpenSupport={onOpenSupport}
          />
        )}
      </div>
    </div>
  );
}

function VersionFooter() {
  // SettingsVersionFooter.kt:32-69 — three separate nodes, the "·" is its own,
  // and only the commit is monospace. Both halves link to GitHub in the real app.
  return (
    <div className="flex items-center gap-2 pl-4 pt-1 text-[11px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
      <span>Version 1.4.49</span>
      <span>·</span>
      <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>8456da4</span>
    </div>
  );
}

function Root({ onOpen }: { onOpen: (s: BorisSettingsScreen) => void }) {
  return (
    <div className="space-y-4 pt-1" data-tour="boris-settings-root">
      {GROUPS.map((group, gi) => (
        <div
          key={gi}
          className="overflow-hidden rounded-[24px]"
          style={{ background: 'color-mix(in srgb, var(--boris-surface-variant) 40%, transparent)' }}
        >
          {group.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => onOpen(row.id)}
              data-tour={`boris-settings-${row.id}`}
              className="flex w-full items-center gap-4 px-4 py-3.5 text-left"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: `color-mix(in srgb, ${row.tint} 16%, transparent)`, color: row.tint }}
              >
                {row.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-[16px] font-semibold" style={{ color: 'var(--boris-on-bg)' }}>
                  {row.title}
                </span>
                <span className="block text-[13px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
                  {row.subtitle}
                </span>
              </span>
            </button>
          ))}
        </div>
      ))}
      <VersionFooter />
    </div>
  );
}

function SubScreen({
  screen,
  settings,
  onSettings,
  onOpenAbout,
  onOpenSupport,
}: {
  screen: BorisSettingsScreen;
  settings: SettingsState;
  onSettings: (patch: Partial<SettingsState>) => void;
  onOpenAbout: () => void;
  onOpenSupport: () => void;
}) {
  const preview = (
    <ReadingPreview
      fontSize={settings.fontSize}
      justify={settings.justify}
      showHighlights={settings.showHighlights}
      mine={settings.mine}
      friends={settings.friends}
      nostrverse={settings.nostrverse}
      underline={settings.highlightStyle === 'underline'}
    />
  );

  switch (screen) {
    case 'appearance':
      return (
        <div className="space-y-6 pt-1">
          <div className="space-y-1">
            <SettingRow label="Theme">
              <div className="flex gap-2">
                <IconToggle icon={<Sun size={18} />} label="Light theme" selected={settings.theme === 'light'} onClick={() => onSettings({ theme: 'light' })} />
                <IconToggle icon={<Moon size={18} />} label="Dark theme" selected={settings.theme === 'dark'} onClick={() => onSettings({ theme: 'dark' })} />
                <IconToggle icon={<Computer size={18} />} label="Use system preference" selected={settings.theme === 'system'} onClick={() => onSettings({ theme: 'system' })} />
              </div>
            </SettingRow>
            {/* Both rows show at once on the default "system" theme
                (ThemeSection.kt:38-39) — that is the shipped state, not a bug. */}
            {settings.theme !== 'light' && (
              <SettingRow label="Dark Theme">
                <div className="flex gap-2">
                  <ColorChip color="#000000" label="Black" selected={settings.darkVariant === 'black'} onClick={() => onSettings({ darkVariant: 'black' })} />
                  <ColorChip color="#18181B" label="Midnight" selected={settings.darkVariant === 'midnight'} onClick={() => onSettings({ darkVariant: 'midnight' })} />
                  <ColorChip color="#1C1C1E" label="Charcoal" selected={settings.darkVariant === 'charcoal'} onClick={() => onSettings({ darkVariant: 'charcoal' })} />
                </div>
              </SettingRow>
            )}
            {settings.theme !== 'dark' && (
              <SettingRow label="Light Theme">
                <div className="flex gap-2">
                  <ColorChip color="#FFFFFF" label="Paper White" outlined selected={settings.lightVariant === 'paper-white'} onClick={() => onSettings({ lightVariant: 'paper-white' })} />
                  <ColorChip color="#F4F1EA" label="Sepia" selected={settings.lightVariant === 'sepia'} onClick={() => onSettings({ lightVariant: 'sepia' })} />
                  <ColorChip color="#FFFFF0" label="Ivory" selected={settings.lightVariant === 'ivory'} onClick={() => onSettings({ lightVariant: 'ivory' })} />
                </div>
              </SettingRow>
            )}
          </div>
          {preview}
        </div>
      );

    case 'reading':
      return (
        <div className="space-y-6 pt-1">
          <div className="space-y-1">
            <SettingRow label="Reading Font">
              <span
                className="flex h-11 w-[62%] items-center justify-between rounded-lg px-3 text-[13px]"
                style={{ border: '1px solid var(--boris-outline)', color: 'var(--boris-on-bg)', fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                Source Serif 4
                <ChevronDown size={18} style={{ color: 'var(--boris-on-surface-variant)' }} />
              </span>
            </SettingRow>
            <SettingRow label="Font Size">
              <div className="flex gap-1">
                {FONT_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-label={`${s}`}
                    onClick={() => onSettings({ fontSize: s })}
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{
                      background: settings.fontSize === s ? 'var(--boris-primary)' : 'transparent',
                      border: `1px solid ${settings.fontSize === s ? 'transparent' : 'var(--boris-outline)'}`,
                      color: settings.fontSize === s ? 'var(--boris-on-primary)' : 'var(--boris-on-surface-variant)',
                      fontSize: `${Math.max(10, s - 8)}px`,
                    }}
                  >
                    A
                  </button>
                ))}
              </div>
            </SettingRow>
            <SettingRow label="Paragraph Alignment">
              <div className="flex gap-2">
                <IconToggle icon={<AlignLeft size={18} />} label="Left aligned" selected={!settings.justify} onClick={() => onSettings({ justify: false })} />
                <IconToggle icon={<AlignJustify size={18} />} label="Justified" selected={settings.justify} onClick={() => onSettings({ justify: true })} />
              </div>
            </SettingRow>
            <SettingRow label="Link Color">
              <ColorSwatches colors={LINK_SWATCHES_DARK} value={settings.linkColor} onChange={(c) => onSettings({ linkColor: c })} />
            </SettingRow>
            <SettingSwitch
              label="Open weblinks in Boris"
              value={settings.openLinksInBoris}
              onChange={(v) => onSettings({ openLinksInBoris: v })}
            />
          </div>
          {preview}
        </div>
      );

    case 'tts':
      return (
        <div className="space-y-1 pt-1">
          <SettingRow label="Default Playback Speed">
            <span
              className="flex h-10 items-center gap-1 rounded-lg px-4 text-[14px] font-medium"
              style={{ border: '1px solid var(--boris-outline)', color: 'var(--boris-on-bg)' }}
            >
              <Play size={18} style={{ color: 'var(--boris-on-surface-variant)' }} />
              {settings.ttsSpeed}
            </span>
          </SettingRow>
          <SettingRow label="Speaker language">
            <span
              className="flex h-11 w-[62%] items-center justify-between rounded-lg px-3 text-[13px]"
              style={{ border: '1px solid var(--boris-outline)', color: 'var(--boris-on-bg)' }}
            >
              Content (auto-detect)
              <ChevronDown size={18} style={{ color: 'var(--boris-on-surface-variant)' }} />
            </span>
          </SettingRow>
          <div
            className="flex items-start gap-2 rounded-lg p-3"
            style={{ background: 'var(--boris-surface-variant)', border: '1px solid var(--boris-outline)' }}
          >
            <p className="flex-1 text-[15px] leading-6" style={{ color: 'var(--boris-on-bg)' }}>
              Boris aims to be a calm reader app with clean typography, beautiful design, and a focus on
              readability. Boris does not and will never have ads, trackers, paywalls, subscriptions, or any
              other distractions.
            </p>
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center"
              style={{ color: 'var(--boris-on-bg)' }}
            >
              <Play size={22} />
            </span>
          </div>
          <SettingSwitch
            label="Follow along while listening"
            value={settings.ttsFollowAlong}
            onChange={(v) => onSettings({ ttsFollowAlong: v })}
          />
        </div>
      );

    case 'media':
      return (
        <div className="pt-1">
          <SettingSwitch
            label="Full-width images in articles"
            value={settings.fullWidthImages}
            onChange={(v) => onSettings({ fullWidthImages: v })}
          />
        </div>
      );

    case 'highlights':
      return (
        <div className="space-y-6 pt-1">
          <div className="space-y-1">
            <SettingSwitch
              label="Show highlights"
              value={settings.showHighlights}
              onChange={(v) => onSettings({ showHighlights: v })}
              tourId="boris-settings-show-highlights"
            />
            <SettingRow label="Highlight Style">
              <div className="flex gap-2">
                <IconToggle icon={<Highlighter size={18} />} label="Text marker style" selected={settings.highlightStyle === 'marker'} onClick={() => onSettings({ highlightStyle: 'marker' })} />
                <IconToggle icon={<Underline size={18} />} label="Underline style" selected={settings.highlightStyle === 'underline'} onClick={() => onSettings({ highlightStyle: 'underline' })} />
              </div>
            </SettingRow>
            <SettingRow label="My Highlights">
              <ColorSwatches colors={HIGHLIGHT_SWATCHES} value={settings.mine} onChange={(c) => onSettings({ mine: c })} />
            </SettingRow>
            <SettingRow label="Friends Highlights">
              <ColorSwatches colors={HIGHLIGHT_SWATCHES} value={settings.friends} onChange={(c) => onSettings({ friends: c })} />
            </SettingRow>
            <SettingRow label="Nostrverse Highlights">
              <ColorSwatches colors={HIGHLIGHT_SWATCHES} value={settings.nostrverse} onChange={(c) => onSettings({ nostrverse: c })} />
            </SettingRow>
            <SettingRow label="Default Highlight Visibility">
              {/* Order is nostrverse → friends → mine, each tinted with THAT
                  layer's chosen colour at alpha 1 / 0.4 (HighlightsSection.kt:83-125). */}
              <div className="flex gap-2">
                {(
                  [
                    ['nostrverse', settings.nostrverse, 'Nostrverse highlights'],
                    ['friends', settings.friends, 'Friends highlights'],
                    ['mine', settings.mine, 'My highlights'],
                  ] as const
                ).map(([k, color, label]) => (
                  <button
                    key={k}
                    type="button"
                    aria-label={label}
                    title={label}
                    onClick={() =>
                      onSettings({ visibility: { ...settings.visibility, [k]: !settings.visibility[k] } })
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ border: '1px solid var(--boris-outline)' }}
                  >
                    <Highlighter size={20} style={{ color, opacity: settings.visibility[k] ? 1 : 0.4 }} />
                  </button>
                ))}
              </div>
            </SettingRow>
          </div>
          {preview}
        </div>
      );

    case 'zap-splits':
      return <ZapSplits enabled={settings.zapSplitsEnabled} onToggle={(v) => onSettings({ zapSplitsEnabled: v })} />;

    case 'home':
      return (
        <div className="space-y-1 pt-1">
          <SettingSwitch
            label="Hide archived articles"
            value={settings.hideArchived}
            onChange={(v) => onSettings({ hideArchived: v })}
          />
          <h3 className="pb-1 pt-4 text-[14px] font-medium" style={{ color: 'var(--boris-on-bg)' }}>
            Sections
          </h3>
          <p className="text-[13px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
            Order of sections on the Home screen. Empty sections are hidden.
          </p>
          {[
            'Continue reading',
            'Recently highlighted by you',
            'Recently highlighted by friends',
            'Recently highlighted by others',
            'Most highlighted this week',
            'Short reads',
            'Long reads',
            'Random unreads',
          ].map((label, i, all) => (
            <div key={label} className="flex items-center py-0.5">
              <span className="flex-1 text-[15px]" style={{ color: 'var(--boris-on-bg)' }}>
                {label}
              </span>
              <span
                className="flex h-10 w-10 items-center justify-center"
                style={{ color: 'var(--boris-on-bg)', opacity: i === 0 ? 0.38 : 1 }}
              >
                <ChevronUp size={22} />
              </span>
              <span
                className="flex h-10 w-10 items-center justify-center"
                style={{ color: 'var(--boris-on-bg)', opacity: i === all.length - 1 ? 0.38 : 1 }}
              >
                <ChevronDown size={22} />
              </span>
            </div>
          ))}
        </div>
      );

    case 'library':
      return (
        <div className="space-y-2 pt-1">
          <h3 className="text-[16px] font-medium" style={{ color: 'var(--boris-on-bg)' }}>
            Default view
          </h3>
          <ChipRow
            items={[
              ['All', <Grid3x3 key="a" size={18} />],
              ['Private', <Lock key="b" size={18} />],
              ['Public', <Users key="c" size={18} />],
              ['Web', <Globe key="d" size={18} />],
              ['Lookmarks', <Eye key="e" size={18} />],
              ['Archive', <Library key="f" size={18} />],
            ]}
            selected="All"
          />
          <p className="text-[13px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
            Opens this tab when you go to Your Library.
          </p>
        </div>
      );

    case 'feeds':
      return (
        <div className="space-y-4 pt-1">
          <div className="space-y-2">
            <h3 className="text-[16px] font-medium" style={{ color: 'var(--boris-on-bg)' }}>
              Default view
            </h3>
            <ChipRow
              items={[
                ['All', <Grid3x3 key="a" size={18} />],
                ['Highlights', <Highlighter key="b" size={18} />],
                ['Writings', <Pencil key="c" size={18} />],
                ['RSS', <Rss key="d" size={18} />],
              ]}
              selected="Highlights"
            />
            <p className="text-[13px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
              Opens this tab when you go to Feeds.
            </p>
          </div>
          <SettingRow label="Default Feeds Scope">
            {/* Shipped default is Friends ON, the other two OFF
                (UserSettings.kt:19-24) — not "all three on". */}
            <div className="flex gap-1">
              <span className="flex h-12 w-12 items-center justify-center">
                <Users size={24} style={{ color: 'var(--boris-on-surface-variant)', opacity: 0.35 }} />
              </span>
              <span className="flex h-12 w-12 items-center justify-center">
                <Users size={24} style={{ color: settings.friends }} />
              </span>
              <span className="flex h-12 w-12 items-center justify-center">
                <User size={24} style={{ color: 'var(--boris-on-surface-variant)', opacity: 0.35 }} />
              </span>
            </div>
          </SettingRow>
          <div className="space-y-3">
            <h4 className="text-[12px] font-medium uppercase" style={{ color: 'var(--boris-on-surface-variant)' }}>
              RSS feeds
            </h4>
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 flex-1 items-center rounded-lg px-3 text-[15px]"
                style={{ border: '1px solid var(--boris-outline)', color: 'var(--boris-on-surface-variant)' }}
              >
                Feed URL
              </span>
              <span className="flex h-10 w-10 items-center justify-center" style={{ color: 'var(--boris-on-bg)' }}>
                <Plus size={22} />
              </span>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 text-[14px] font-medium"
              style={{ color: 'var(--boris-primary)' }}
            >
              <Upload size={18} />
              Import OPML
            </button>
            <p className="text-[13px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
              Items show up in the RSS tab of your feed. Articles open in Boris and can be highlighted like
              any web page.
            </p>
          </div>
        </div>
      );

    case 'scroll':
      return (
        <div className="space-y-1 pt-1">
          <SettingSwitch label="Hide top bar on scroll" value={settings.hideTopBarOnScroll} onChange={(v) => onSettings({ hideTopBarOnScroll: v })} />
          <SettingSwitch label="Use volume buttons to scroll" value={settings.volumeScroll} onChange={(v) => onSettings({ volumeScroll: v })} />
          <SettingSwitch label="Sync reading position across devices" value={settings.syncPosition} onChange={(v) => onSettings({ syncPosition: v })} />
          <SettingSwitch label="Auto-scroll to saved reading position" value={settings.autoScroll} onChange={(v) => onSettings({ autoScroll: v })} />
          <SettingSwitch label="Automatically move to archive at 100%" value={settings.autoArchive} onChange={(v) => onSettings({ autoArchive: v })} />
          <SettingSwitch label="Archive button closes reader" value={settings.archiveCloses} onChange={(v) => onSettings({ archiveCloses: v })} />
          {settings.volumeScroll && (
            <SettingRow label="Scroll amount">
              <div className="flex gap-1">
                {['25%', '50%', '75%', '90%', '100%'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onSettings({ scrollAmount: p })}
                    className="flex h-8 min-w-9 items-center justify-center rounded-lg px-1.5 text-[11px] font-medium"
                    style={{
                      background: settings.scrollAmount === p ? 'var(--boris-primary)' : 'transparent',
                      border: `1px solid ${settings.scrollAmount === p ? 'transparent' : 'var(--boris-outline)'}`,
                      color: settings.scrollAmount === p ? 'var(--boris-on-primary)' : 'var(--boris-on-surface-variant)',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </SettingRow>
          )}
        </div>
      );

    case 'relays':
      return <Relays />;

    case 'airplane':
      return <Airplane />;

    case 'about':
      return <AboutSettings onOpenAbout={onOpenAbout} onOpenSupport={onOpenSupport} />;

    default:
      return null;
  }
}

function ChipRow({ items, selected }: { items: [string, React.ReactNode][]; selected: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(([label, icon]) => (
        <span
          key={label}
          className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[14px] font-medium"
          style={{
            background: label === selected ? 'var(--boris-secondary-container)' : 'transparent',
            border: label === selected ? '1px solid transparent' : '1px solid var(--boris-outline)',
            color: label === selected ? 'var(--boris-on-secondary-container)' : 'var(--boris-on-bg)',
          }}
        >
          {icon}
          {label}
        </span>
      ))}
    </div>
  );
}

/**
 * Zap Splits (ui/settings/ZapSplitsSection.kt). Three continuous sliders and
 * four presets; Boris' own share maxes out at 10, not 100, which is why the
 * "Boris 🧡" preset (80) pins the thumb while the label still says 80.0.
 * That is upstream behaviour and it is reproduced, not smoothed over.
 * The heart in the preset label is U+1F9E1 ORANGE HEART, verified by hexdump
 * in the recon pass — not ♥.
 */
function ZapSplits({ enabled, onToggle }: { enabled: boolean; onToggle: (v: boolean) => void }) {
  const [weights, setWeights] = useState({ you: 50, author: 50, boris: 2.1 });
  const total = weights.you + weights.author + weights.boris;
  const pct = (w: number) => (total > 0 ? ((w / total) * 100).toFixed(1) : '0.0');
  const presets: [string, { you: number; author: number; boris: number }][] = [
    ['Default', { you: 50, author: 50, boris: 2.1 }],
    ['Generous', { you: 5, author: 75, boris: 10 }],
    ['Selfless', { you: 1, author: 80, boris: 19 }],
    ['Boris 🧡', { you: 10, author: 10, boris: 80 }],
  ];
  const isSelected = (p: { you: number; author: number; boris: number }) =>
    p.you === weights.you && p.author === weights.author && p.boris === weights.boris;

  const slider = (label: string, value: number, max: number, key: 'you' | 'author' | 'boris') => (
    <div key={key} className="space-y-1 pt-2">
      <div className="flex items-center justify-between text-[15px]">
        <span style={{ color: 'var(--boris-on-bg)' }}>
          {label}: {key === 'boris' ? value.toFixed(1) : Math.round(value)}
        </span>
        <span style={{ color: 'var(--boris-on-surface-variant)' }}>({pct(value)}%)</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={key === 'boris' ? 0.1 : 1}
        value={Math.min(value, max)}
        onChange={(e) => setWeights((w) => ({ ...w, [key]: Number(e.target.value) }))}
        className="w-full accent-[var(--boris-primary)]"
      />
    </div>
  );

  return (
    <div className="space-y-4 pt-1">
      <SettingSwitch label="Add zap splits to highlights" value={enabled} onChange={onToggle} />
      {enabled && (
        <>
          <div className="space-y-2">
            <p className="text-[15px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
              Presets
            </p>
            <div className="flex flex-wrap gap-2">
              {presets.map(([label, p]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setWeights(p)}
                  className="flex h-9 items-center rounded-lg px-3 text-[12px] font-medium"
                  style={{
                    background: isSelected(p) ? 'var(--boris-primary)' : 'transparent',
                    border: `1px solid ${isSelected(p) ? 'transparent' : 'var(--boris-outline)'}`,
                    color: isSelected(p) ? 'var(--boris-on-primary)' : 'var(--boris-on-surface-variant)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {slider('Your Share', weights.you, 100, 'you')}
          {slider("Author's Share", weights.author, 100, 'author')}
          {slider("Boris' Share", weights.boris, 10, 'boris')}
          <p className="pt-1 text-[13px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
            Weights determine zap splits when highlighting. If the content has multiple authors, their share
            is divided proportionally. For web content the author is unknown, so their share is skipped.
          </p>
        </>
      )}
    </div>
  );
}

function RelayRow({ row }: { row: BorisRelayRow }) {
  const connected = row.state === 'connected';
  const local = row.url.startsWith('localhost');
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-3 py-3"
      style={{
        background: 'color-mix(in srgb, var(--boris-surface-variant) 40%, transparent)',
        opacity: connected ? 1 : 0.7,
      }}
    >
      <span style={{ color: connected ? '#22C55E' : '#EF4444' }}>
        {local ? <Plane size={18} /> : connected ? <Check size={18} /> : <X size={18} />}
      </span>
      <span
        className="min-w-0 flex-1 truncate text-[15px]"
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: 'var(--boris-on-bg)' }}
      >
        {row.url}
      </span>
      {!connected && row.latency && (
        <span className="text-[11px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
          🕘 {row.latency}
        </span>
      )}
    </div>
  );
}

/**
 * Relays (ui/settings/RelaysSection.kt). Read-only — the section takes no
 * settings and there is no add/remove UI. Sections render Read, Write, Local in
 * that order, and an empty group renders nothing at all, not a placeholder.
 * The URL is monospace with the scheme stripped and 127.0.0.1 rewritten to
 * localhost, which is why Citrine shows as `localhost:4869`.
 */
function Relays() {
  return (
    <div className="space-y-4 pt-1">
      <p className="text-[15px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
        Relays Boris reads from and publishes to. Status is checked while this screen is open.
      </p>
      {[
        ['Read', borisReadRelays],
        ['Write', borisWriteRelays],
        ['Local', borisLocalRelays],
      ].map(([heading, rows]) => (
        <div key={heading as string} className="space-y-2">
          <h4 className="pb-0.5 pl-1 text-[14px] font-semibold" style={{ color: 'var(--boris-on-surface-variant)' }}>
            {heading as string}
          </h4>
          {(rows as BorisRelayRow[]).map((r) => (
            <RelayRow key={`${heading}:${r.url}`} row={r} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Airplane() {
  const shelves: [string, React.ReactNode][] = [
    ['Bookmarks', <Bookmark key="a" size={22} />],
    ['Web Bookmarks', <Globe key="b" size={22} />],
    ['Lookmarks', <Eye key="c" size={22} />],
    ['Archive', <Library key="d" size={22} />],
    ['Highlights', <Highlighter key="e" size={22} />],
  ];
  return (
    <div className="space-y-5 pt-1">
      <p className="text-[15px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
        Boris is offline-first by design. You can read, create highlights, and browse your library without
        being connected to the internet. Boris will store changes locally and sync later.
      </p>
      <p className="text-[15px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
        Citrine is not running (ws://127.0.0.1:4869)
      </p>
      <SettingSwitch label="Use local relays as cache" value onChange={() => undefined} />
      <p className="text-[13px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
        Boris works best with a local relay.{' '}
        <span style={{ color: 'var(--boris-primary)', textDecoration: 'underline' }}>Citrine</span> is a
        great option for Android. Events created while offline are rebroadcast to your other relays when you
        are back online.
      </p>

      <div className="space-y-5">
        <p className="text-[15px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
          Boris downloads article text so your library stays readable offline. Articles you open are always
          cached, regardless of these settings.
        </p>
        <h4 className="text-[12px] font-medium uppercase" style={{ color: 'var(--boris-on-surface-variant)' }}>
          Available offline
        </h4>
        {/* The shelf list ONLY. Anchoring the whole offline block instead made
            the tour's target nearly the size of the screen, and a spotlight that
            covers everything marks nothing. */}
        <div className="space-y-5" data-tour="boris-offline-shelves">
        {shelves.map(([label, icon]) => (
          <div key={label} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-3">
                <span style={{ color: 'var(--boris-on-bg)' }}>{icon}</span>
                <span className="text-[16px] font-semibold" style={{ color: 'var(--boris-on-bg)' }}>
                  {label}
                </span>
              </span>
              <SettingSwitchInline />
            </div>
            <div className="space-y-1.5">
              <div className="h-1 w-full rounded-full" style={{ background: 'var(--boris-outline)' }} />
              <p className="text-[13px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
                0 of 0 downloaded
              </p>
            </div>
          </div>
        ))}
        </div>
        <div className="space-y-2">
          <h4 className="text-[16px] font-semibold" style={{ color: 'var(--boris-on-bg)' }}>
            Storage limit
          </h4>
          <p className="text-[13px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
            Using 8.6 MB
          </p>
          <div className="flex flex-wrap gap-2">
            {['210 MB', '512 MB', '1 GB', '2 GB', '5 GB'].map((l) => (
              <span
                key={l}
                className="flex h-9 items-center rounded-lg px-3 text-[12px] font-medium"
                style={{
                  background: l === '1 GB' ? 'var(--boris-primary)' : 'transparent',
                  border: `1px solid ${l === '1 GB' ? 'transparent' : 'var(--boris-outline)'}`,
                  color: l === '1 GB' ? 'var(--boris-on-primary)' : 'var(--boris-on-surface-variant)',
                }}
              >
                {l}
              </span>
            ))}
          </div>
          <p className="text-[13px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
            Applies to the article and image caches. Takes effect on the next launch.
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingSwitchInline() {
  return (
    <span
      className="relative h-8 w-[52px] shrink-0 rounded-full"
      style={{ background: 'var(--boris-primary)', border: '2px solid var(--boris-primary)' }}
    >
      <span
        className="absolute left-6 top-1/2 block h-6 w-6 -translate-y-1/2 rounded-full"
        style={{ background: 'var(--boris-on-primary)' }}
      />
    </span>
  );
}

function AboutSettings({ onOpenAbout, onOpenSupport }: { onOpenAbout: () => void; onOpenSupport: () => void }) {
  const rows: {
    label: string;
    subtitle: string;
    icon: React.ReactNode;
    tint: string;
    trailing: 'chevron' | 'external';
    onClick?: () => void;
  }[] = [
    { label: 'Tutorial', subtitle: 'Walk through what Boris can do', icon: <BookOpen size={22} />, tint: TINT_ABOUT, trailing: 'chevron', onClick: onOpenAbout },
    { label: 'Vision', subtitle: 'Purple Text, Orange Highlights', icon: <Highlighter size={22} />, tint: '#9333EA', trailing: 'chevron' },
    { label: 'Support Boris', subtitle: 'Thank the people who zap Boris', icon: <Heart size={22} />, tint: '#F97316', trailing: 'chevron', onClick: onOpenSupport },
    { label: 'Report a bug', subtitle: 'Open a GitHub issue', icon: <Bug size={22} />, tint: TINT_ABOUT, trailing: 'external' },
    { label: 'Suggest a feature', subtitle: 'Open a GitHub issue', icon: <Lightbulb size={22} />, tint: TINT_ABOUT, trailing: 'external' },
  ];
  const links: { label: string; subtitle: string; icon: React.ReactNode }[] = [
    { label: 'Website', subtitle: 'readwithboris.com', icon: <Globe size={22} /> },
    { label: 'Web app', subtitle: 'read.withboris.com', icon: <Globe size={22} /> },
    { label: 'Source code', subtitle: 'dergigi/boris-android', icon: <Code2 size={22} /> },
    { label: 'Author', subtitle: 'Gigi · dergigi.com', icon: <User size={22} /> },
    { label: 'Author on Nostr', subtitle: 'npub1dergggklka9…', icon: <Zap size={22} /> },
  ];

  const Row = ({
    label,
    subtitle,
    icon,
    tint,
    trailing,
    onClick,
  }: {
    label: string;
    subtitle: string;
    icon: React.ReactNode;
    tint: string;
    trailing: 'chevron' | 'external';
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3.5 py-3 text-left">
      <span className="shrink-0" style={{ color: tint }}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px]" style={{ color: 'var(--boris-on-bg)' }}>
          {label}
        </span>
        <span className="block text-[13px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
          {subtitle}
        </span>
      </span>
      <span style={{ color: 'var(--boris-on-surface-variant)' }}>
        {trailing === 'chevron' ? <ChevronRight size={20} /> : <Upload size={20} />}
      </span>
    </button>
  );

  return (
    <div className="pt-1">
      <p className="pb-2 text-[15px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
        Boris is a nostr-native reader for highlighting and calm long-form reading. Free and open source.
      </p>
      {rows.map((r) => (
        <Row key={r.label} {...r} />
      ))}
      <h4 className="pb-1 pt-5 text-[14px] font-medium" style={{ color: 'var(--boris-on-bg)' }}>
        Links
      </h4>
      {links.map((l) => (
        <Row key={l.label} {...l} tint={TINT_ABOUT} trailing="external" />
      ))}
      <div className="pt-4">
        <VersionFooter />
      </div>
    </div>
  );
}
