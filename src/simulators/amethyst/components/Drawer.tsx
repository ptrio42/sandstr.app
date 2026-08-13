import React, { useState } from 'react';
import {
  User, List, Bookmark, Globe, FileText, Clock, Hash, HardDrive, Smile, Wallet, KeyRound,
  Home, Mail, SquarePlay, Radio, Bell,
  BookOpen, Image, PlayCircle, Video, Headphones, Podcast, Music, ListMusic, BarChart3,
  Store, Footprints, Code2, RadioTower, Mic, Users, MessagesSquare, Server, Hash as HashIcon,
  MapPin, Calendar, CalendarRange, LayoutGrid, AppWindow, Grid3x3, Layers, Medal,
  SatelliteDish, Waypoints, Settings as SettingsIcon, UserPlus, Trash2, QrCode, ChevronUp, ChevronDown,
} from 'lucide-react';
import { Avatar } from './Avatar';
import '../amethyst.theme.css';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSettings: () => void;
}

type Action = 'profile' | 'bookmarks' | 'relays' | 'settings' | 'wallet' | 'home' | 'messages'
  | 'video' | 'search' | 'discover' | 'notifications' | 'close';

type Item = { label: string; Icon: React.ComponentType<{ className?: string }>; action: Action; value?: string; accent?: boolean };

/**
 * Amethyst's account drawer @ v1.13.1. Section membership and order are upstream's
 * `DrawerYouItems` / `DrawerNavigateItems` / `DrawerFeedsItems` verbatim
 * (navigation/bottombars/NavBarItem.kt), assembled by DrawerContent.kt as:
 *   header → You → Navigate → Feeds → Create → System → (spacer) → Accounts → version footer
 * Every label is the resolved `labelRes` string from res/values/strings.xml.
 *
 * This is a much longer drawer than v1.12.6's flat 11-row account menu, and that
 * length is the point: in v1.13.1 the drawer IS the app's capability map — 28
 * feed types alone. Truncating it to the rows we can navigate would misrepresent
 * the client, so the full list ships and docs/gaps/amethyst.md carries which
 * rows are inert here.
 *
 * `Create` holds only "HLS Upload" in a release build — the Chess row next to it
 * upstream is wrapped in `if (isDebug)`.
 */
const YOU: Item[] = [
  { label: 'Profile', Icon: User, action: 'profile', accent: true },
  { label: 'My Lists', Icon: List, action: 'close' },
  { label: 'Bookmarks', Icon: Bookmark, action: 'bookmarks' },
  { label: 'Web Bookmarks', Icon: Globe, action: 'close' },
  { label: 'Drafts', Icon: FileText, action: 'close' },
  { label: 'Scheduled posts', Icon: Clock, action: 'close' },
  { label: 'Hashtag Sets', Icon: Hash, action: 'close' },
  { label: 'My Blossom Files', Icon: HardDrive, action: 'close' },
  { label: 'My Emoji Packs', Icon: Smile, action: 'close' },
  { label: 'Wallet', Icon: Wallet, action: 'wallet' },
  { label: 'Remote Signer', Icon: KeyRound, action: 'close' },
];

const NAVIGATE: Item[] = [
  { label: 'Home', Icon: Home, action: 'home' },
  { label: 'Messages', Icon: Mail, action: 'messages' },
  { label: 'Shorts', Icon: SquarePlay, action: 'video' },
  { label: 'Browser', Icon: Globe, action: 'search' },
  { label: 'Discover', Icon: Radio, action: 'discover' },
  { label: 'Notifications', Icon: Bell, action: 'notifications' },
];

const FEEDS: Item[] = [
  { label: 'Reads', Icon: BookOpen, action: 'close' },
  { label: 'Pictures', Icon: Image, action: 'close' },
  { label: 'Shorts', Icon: PlayCircle, action: 'close' },
  { label: 'Videos', Icon: Video, action: 'close' },
  { label: 'Episodes', Icon: Headphones, action: 'close' },
  { label: 'Podcasts', Icon: Podcast, action: 'close' },
  { label: 'Music', Icon: Music, action: 'close' },
  { label: 'Playlists', Icon: ListMusic, action: 'close' },
  { label: 'Polls', Icon: BarChart3, action: 'close' },
  { label: 'Marketplace', Icon: Store, action: 'close' },
  { label: 'Workouts', Icon: Footprints, action: 'close' },
  { label: 'Git Repositories', Icon: Code2, action: 'close' },
  { label: 'Live Streams', Icon: RadioTower, action: 'close' },
  { label: 'Nests', Icon: Mic, action: 'close' },
  { label: 'Communities', Icon: Users, action: 'close' },
  { label: 'Public Chats', Icon: MessagesSquare, action: 'close' },
  { label: 'Relay Groups', Icon: Server, action: 'close' },
  { label: 'Concord Channels', Icon: HashIcon, action: 'close' },
  { label: 'Location Channels', Icon: MapPin, action: 'close' },
  { label: 'Calendars', Icon: Calendar, action: 'close' },
  { label: 'Calendar lists', Icon: CalendarRange, action: 'close' },
  { label: 'App Store', Icon: LayoutGrid, action: 'close' },
  { label: 'Web apps', Icon: AppWindow, action: 'close' },
  { label: 'nApplets', Icon: Grid3x3, action: 'close' },
  { label: 'nSites', Icon: Layers, action: 'close' },
  { label: 'Follow Packs', Icon: Users, action: 'close' },
  { label: 'Badges', Icon: Medal, action: 'close' },
  { label: 'Emojis', Icon: Smile, action: 'close' },
];

const CREATE: Item[] = [{ label: 'HLS Upload', Icon: SatelliteDish, action: 'close' }];

const SYSTEM: Item[] = [
  { label: 'Relays', Icon: Waypoints, action: 'relays', value: '355/1810' },
  { label: 'Settings', Icon: SettingsIcon, action: 'settings' },
];

export function Drawer({ isOpen, onClose, onTabChange, onOpenSettings }: DrawerProps) {
  const handle = (action: Action) => {
    if (action === 'settings') onOpenSettings();
    else if (action !== 'close') onTabChange(action);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <>
      {/* Above the bottom nav (z-index 100), as in the real app: at z-55/56 the
          nav painted over the drawer and swallowed the taps on its last items. */}
      <div className="absolute inset-0 bg-black/50 z-[110]" onClick={onClose} />
      <div
        className="absolute left-0 top-0 bottom-0 w-[87%] max-w-[320px] bg-[var(--md-surface)] z-[120] overflow-y-auto shadow-2xl flex flex-col"
        data-tour="amethyst-drawer"
      >
        {/* Account header */}
        <div className="h-28 bg-gradient-to-br from-[#3a1d6e] via-[#7b2ff7] to-[#c026d3]" />
        <div className="px-4 -mt-8 pb-3 border-b border-[var(--md-outline-variant)]">
          <Avatar seed="sandy" className="w-16 h-16 border-2 border-[var(--md-surface)]" />
          <p className="font-bold text-lg text-[var(--md-on-surface)] mt-2">sandy</p>

          {/* Update your status (strings.xml status_update) */}
          <div className="mt-2 relative rounded-xl border border-[var(--md-outline)] px-3 py-2.5 flex items-center gap-2">
            <span className="absolute -top-2 left-2 px-1 text-[11px] bg-[var(--md-surface)] text-[var(--md-on-surface-variant)]">Update your status</span>
            <span className="flex-1 min-w-0 truncate text-sm text-[var(--md-on-surface)]">Building nostr stuff… 🧑‍💻</span>
            <Trash2 className="w-4 h-4 text-[var(--md-on-surface-variant)] shrink-0" />
          </div>

          <p className="mt-3 text-[15px]">
            <span className="font-bold text-[var(--md-on-surface)]">2374</span>{' '}
            <span className="text-[var(--md-on-surface-variant)]">Following</span>
            <span className="text-[var(--md-on-surface-variant)] mx-2">·</span>
            <span className="font-bold text-[var(--md-on-surface)]">--</span>{' '}
            <span className="text-[var(--md-on-surface-variant)]">Followers</span>
          </p>
        </div>

        <Section title="You" items={YOU} onPick={handle} />
        <Section title="Navigate" items={NAVIGATE} onPick={handle} />
        <Section title="Feeds" items={FEEDS} onPick={handle} />
        <Section title="Create" items={CREATE} onPick={handle} />
        <Section title="System" items={SYSTEM} onPick={handle} />

        {/* Pushed to the bottom by a weight spacer upstream */}
        <div className="mt-auto">
          <Row item={{ label: 'Accounts', Icon: UserPlus, action: 'close' }} onPick={handle} />
          <div className="flex items-center justify-between px-5 py-3 text-sm text-[var(--md-on-surface-variant)]">
            <span>v1.13.1-FDROID</span>
            <QrCode className="w-5 h-5" />
          </div>
        </div>
      </div>
    </>
  );
}

/** Collapsible titled group — upstream's CollapsibleSection/CatalogSection. */
function Section({ title, items, onPick }: { title: string; items: Item[]; onPick: (a: Action) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 pt-4 pb-1 text-left"
      >
        <span className="text-sm text-[var(--md-on-surface-variant)]">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[var(--md-on-surface-variant)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--md-on-surface-variant)]" />
        )}
      </button>
      {open && items.map((m) => <Row key={`${title}-${m.label}`} item={m} onPick={onPick} />)}
    </div>
  );
}

function Row({ item, onPick }: { item: Item; onPick: (a: Action) => void }) {
  return (
    <button
      onClick={() => onPick(item.action)}
      className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-[var(--md-surface-variant)]/50 transition-colors"
      data-tour={`amethyst-drawer-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <item.Icon className={`w-6 h-6 shrink-0 ${item.accent ? 'text-[var(--md-primary)]' : 'text-[var(--md-on-surface)]'}`} />
      <span className="flex-1 text-[var(--md-on-surface)]">{item.label}</span>
      {/* The relay counter is the only coloured text in the drawer */}
      {item.value && <span className="text-sm" style={{ color: '#C08A50' }}>{item.value}</span>}
    </button>
  );
}
