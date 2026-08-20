import React, { useState } from 'react';
import {
  User, List, Bookmark, Globe, FileText, Clock, Hash, HardDrive, Smile, Wallet, KeyRound,
  Home, Mail, SquarePlay, Radio, Bell,
  BookOpen, Image, PlayCircle, Video, Headphones, Podcast, Music, ListMusic, BarChart3,
  Store, Footprints, Code2, RadioTower, Mic, Users, MessagesSquare, Server, Hash as HashIcon,
  MapPin, Calendar, CalendarRange, LayoutGrid, AppWindow, Grid3x3, Layers, Medal,
  SatelliteDish, Waypoints, Settings as SettingsIcon, UserPlus, Trash2, QrCode, ChevronUp, ChevronDown,
  Send,
} from 'lucide-react';
import { Avatar } from './Avatar';
import type { DrawerDetailId } from '../screens/DrawerDetailScreen';
import type { ProfileTab } from '../screens/ProfileScreen';
import '../amethyst.theme.css';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSettings: () => void;
  /** Pushes one of the "You" / "Create" / "Accounts" destinations. */
  onOpenDetail: (detail: DrawerDetailId) => void;
  /** Profile, but landing on a named tab — the Bookmarks row needs this. */
  onOpenProfileTab: (tab: ProfileTab) => void;
}

type Action = 'profile' | 'bookmarks' | 'relays' | 'settings' | 'wallet' | 'home' | 'messages'
  | 'video' | 'search' | 'discover' | 'notifications' | 'close';

type Item = {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  action: Action;
  /** Set instead of `action` when the row pushes one of its own screens. */
  detail?: DrawerDetailId;
  value?: string;
  accent?: boolean;
  /** Overrides the anchor slug when two sections share a label (ame-122). */
  tourSlug?: string;
};

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
  { label: 'My Lists', Icon: List, action: 'close', detail: 'my-lists' },
  { label: 'Bookmarks', Icon: Bookmark, action: 'bookmarks' },
  { label: 'Web Bookmarks', Icon: Globe, action: 'close', detail: 'web-bookmarks' },
  { label: 'Drafts', Icon: FileText, action: 'close', detail: 'drafts' },
  { label: 'Scheduled posts', Icon: Clock, action: 'close', detail: 'scheduled-posts' },
  { label: 'Hashtag Sets', Icon: Hash, action: 'close', detail: 'hashtag-sets' },
  { label: 'My Blossom Files', Icon: HardDrive, action: 'close', detail: 'blossom-files' },
  { label: 'My Emoji Packs', Icon: Smile, action: 'close', detail: 'emoji-packs' },
  { label: 'Wallet', Icon: Wallet, action: 'wallet' },
  { label: 'Remote Signer', Icon: KeyRound, action: 'close', detail: 'remote-signer' },
];

const NAVIGATE: Item[] = [
  { label: 'Home', Icon: Home, action: 'home' },
  { label: 'Messages', Icon: Mail, action: 'messages' },
  { label: 'Shorts', Icon: SquarePlay, action: 'video' },
  { label: 'Browser', Icon: Globe, action: 'search' },
  { label: 'Discover', Icon: Radio, action: 'discover' },
  { label: 'Notifications', Icon: Bell, action: 'notifications' },
];

/**
 * The drawer's Feeds section: 28 rows that all fired `action: 'close'`, the
 * largest cluster of dead controls in the simulator — a header advertising 28
 * feed types where every tap just shut the drawer (gaps ame-114). Each now
 * pushes a screen. What that screen can honestly show is upstream's own
 * `FeedEmpty` plus one line naming this reproduction's data limit: the corpus
 * is kind-1 text notes, so there are no long-form articles, videos, polls,
 * calendars or badges to list. Same ruling as Discover and Shorts (ame-28/29).
 *
 * "Shorts" appears in Navigate as well, and the slug is computed from the
 * label, so this one row carries an explicit slug — otherwise a spotlight on
 * `amethyst-drawer-shorts` rings two elements (gaps ame-122).
 */
const FEEDS: Item[] = [
  { label: 'Reads', Icon: BookOpen, action: 'close', detail: 'feed:reads' },
  { label: 'Pictures', Icon: Image, action: 'close', detail: 'feed:pictures' },
  { label: 'Shorts', Icon: PlayCircle, action: 'close', detail: 'feed:shorts', tourSlug: 'feeds-shorts' },
  { label: 'Videos', Icon: Video, action: 'close', detail: 'feed:videos' },
  { label: 'Episodes', Icon: Headphones, action: 'close', detail: 'feed:episodes' },
  { label: 'Podcasts', Icon: Podcast, action: 'close', detail: 'feed:podcasts' },
  { label: 'Music', Icon: Music, action: 'close', detail: 'feed:music' },
  { label: 'Playlists', Icon: ListMusic, action: 'close', detail: 'feed:playlists' },
  { label: 'Polls', Icon: BarChart3, action: 'close', detail: 'feed:polls' },
  { label: 'Marketplace', Icon: Store, action: 'close', detail: 'feed:marketplace' },
  { label: 'Workouts', Icon: Footprints, action: 'close', detail: 'feed:workouts' },
  { label: 'Git Repositories', Icon: Code2, action: 'close', detail: 'feed:git-repositories' },
  { label: 'Live Streams', Icon: RadioTower, action: 'close', detail: 'feed:live-streams' },
  { label: 'Nests', Icon: Mic, action: 'close', detail: 'feed:nests' },
  { label: 'Communities', Icon: Users, action: 'close', detail: 'feed:communities' },
  { label: 'Public Chats', Icon: MessagesSquare, action: 'close', detail: 'feed:public-chats' },
  { label: 'Relay Groups', Icon: Server, action: 'close', detail: 'feed:relay-groups' },
  { label: 'Concord Channels', Icon: HashIcon, action: 'close', detail: 'feed:concord-channels' },
  { label: 'Location Channels', Icon: MapPin, action: 'close', detail: 'feed:location-channels' },
  { label: 'Calendars', Icon: Calendar, action: 'close', detail: 'feed:calendars' },
  { label: 'Calendar lists', Icon: CalendarRange, action: 'close', detail: 'feed:calendar-lists' },
  { label: 'App Store', Icon: LayoutGrid, action: 'close', detail: 'feed:app-store' },
  { label: 'Web apps', Icon: AppWindow, action: 'close', detail: 'feed:web-apps' },
  { label: 'nApplets', Icon: Grid3x3, action: 'close', detail: 'feed:napplets' },
  { label: 'nSites', Icon: Layers, action: 'close', detail: 'feed:nsites' },
  { label: 'Follow Packs', Icon: Users, action: 'close', detail: 'feed:follow-packs' },
  { label: 'Badges', Icon: Medal, action: 'close', detail: 'feed:badges' },
  { label: 'Emojis', Icon: Smile, action: 'close', detail: 'feed:emojis' },
];

const CREATE: Item[] = [{ label: 'HLS Upload', Icon: SatelliteDish, action: 'close', detail: 'hls-upload' }];

const SYSTEM: Item[] = [
  { label: 'Relays', Icon: Waypoints, action: 'relays', value: '355/1810' },
  { label: 'Settings', Icon: SettingsIcon, action: 'settings' },
];

export function Drawer({
  isOpen, onClose, onTabChange, onOpenSettings, onOpenDetail, onOpenProfileTab,
}: DrawerProps) {
  const handle = (item: Item) => {
    if (item.detail) onOpenDetail(item.detail);
    else if (item.action === 'settings') onOpenSettings();
    // "Bookmarks" is a tab on your own profile upstream, not its own screen —
    // landing on the profile's DEFAULT tab (Notes) put the visitor on somebody
    // else's posts with no explanation (gaps ame-37).
    else if (item.action === 'bookmarks') onOpenProfileTab('Bookmarks');
    else if (item.action !== 'close') onTabChange(item.action);
    onClose();
  };
  const [showQr, setShowQr] = useState(false);

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
        <div
          className="px-4 pb-3 border-b border-[var(--md-outline-variant)]"
          data-tour="amethyst-drawer-header"
        >
          <div className="-mx-4 h-28 bg-gradient-to-br from-[#3a1d6e] via-[#7b2ff7] to-[#c026d3]" />
          <button
            type="button"
            onClick={() => { onOpenProfileTab('Notes'); onClose(); }}
            aria-label="Open your profile"
            className="-mt-8 block text-left"
          >
            <Avatar seed="sandy" className="w-16 h-16 border-2 border-[var(--md-surface)]" />
            <p className="font-bold text-lg text-[var(--md-on-surface)] mt-2">sandy</p>
          </button>

          <StatusField />

          {/* `FollowingAndFollowerCounts` is one clickable row upstream. */}
          <button
            type="button"
            onClick={() => { onOpenProfileTab('Follows'); onClose(); }}
            data-tour="amethyst-drawer-counts"
            className="mt-3 text-[15px] text-left"
          >
            <span className="font-bold text-[var(--md-on-surface)]">1284</span>{' '}
            <span className="text-[var(--md-on-surface-variant)]">Following</span>
            <span className="text-[var(--md-on-surface-variant)] mx-2">·</span>
            <span className="font-bold text-[var(--md-on-surface)]">296</span>{' '}
            <span className="text-[var(--md-on-surface-variant)]">Followers</span>
          </button>
        </div>

        <Section title="You" items={YOU} onPick={handle} />
        <Section title="Navigate" items={NAVIGATE} onPick={handle} />
        <Section title="Feeds" items={FEEDS} onPick={handle} />
        <Section title="Create" items={CREATE} onPick={handle} />
        <Section title="System" items={SYSTEM} onPick={handle} />

        {/* Pushed to the bottom by a weight spacer upstream */}
        <div className="mt-auto">
          <Row item={{ label: 'Accounts', Icon: UserPlus, action: 'close', detail: 'accounts' }} onPick={handle} />
          <div
            className="flex items-center justify-between px-5 py-3 text-sm text-[var(--md-on-surface-variant)]"
            data-tour="amethyst-drawer-version"
          >
            <span>v1.13.1-FDROID</span>
            <button type="button" onClick={() => setShowQr((v) => !v)} aria-label="Show your profile QR code" className="p-1">
              <QrCode className="w-5 h-5" />
            </button>
          </div>
          {showQr && (
            <p className="px-5 pb-3 text-xs leading-relaxed" style={{ color: 'var(--amethyst-placeholder)' }}>
              Simulation: this demo account has no key, so there is no npub to encode here.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * `StatusUpdateBar` → `StatusEditBar`. Upstream draws a read-only bar shaped
 * like an unfocused OutlinedTextField (1dp outline, 4dp radius, 56dp min height,
 * floating label punched through the border); tapping it swaps in the real text
 * field, whose trailing slot is a Send button ONLY once the text has changed and
 * a Delete button otherwise. We shipped the bar without the edit half.
 */
function StatusField() {
  const [saved, setSaved] = useState('Tinkering with relays… 🧑‍💻');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(saved);
  const changed = draft !== saved;

  const commit = () => {
    setSaved(draft.trim());
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => { setDraft(saved); setEditing(true); }}
        data-tour="amethyst-drawer-status"
        className="mt-2 relative w-full rounded border border-[var(--md-outline)] px-4 py-3.5 min-h-[56px] flex items-center text-left"
      >
        <span className="absolute -top-2 left-3 px-1 text-[11px] bg-[var(--md-surface)] text-[var(--md-on-surface-variant)]">
          Update your status
        </span>
        <span
          className="flex-1 min-w-0 truncate"
          style={{ color: saved ? 'var(--md-on-surface)' : 'var(--amethyst-placeholder)' }}
        >
          {saved || 'Update your status'}
        </span>
      </button>
    );
  }

  return (
    <div data-tour="amethyst-drawer-status" className="mt-2 relative">
      <span className="absolute -top-2 left-3 px-1 text-[11px] z-10 bg-[var(--md-surface)] text-[var(--md-primary)]">
        Update your status
      </span>
      <div className="flex items-center gap-1 rounded border border-[var(--md-primary)] pl-4 pr-1.5 min-h-[56px]">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') setEditing(false);
          }}
          placeholder="Update your status"
          aria-label="Update your status"
          autoFocus
          className="flex-1 min-w-0 bg-transparent text-[16px] text-[var(--md-on-surface)] focus:outline-none placeholder:text-[var(--amethyst-placeholder)]"
        />
        {changed ? (
          <button
            type="button"
            onClick={commit}
            aria-label="Send"
            className="w-9 h-9 shrink-0 flex items-center justify-center"
            style={{ color: 'var(--md-primary)' }}
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { setSaved(''); setDraft(''); setEditing(false); }}
            aria-label="Delete status"
            className="w-9 h-9 shrink-0 flex items-center justify-center"
            style={{ color: 'var(--amethyst-placeholder)' }}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

/** Collapsible titled group — upstream's CollapsibleSection/CatalogSection. */
function Section({ title, items, onPick }: { title: string; items: Item[]; onPick: (item: Item) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        data-tour={`amethyst-drawer-section-${title.toLowerCase()}`}
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

function Row({ item, onPick }: { item: Item; onPick: (item: Item) => void }) {
  return (
    <button
      onClick={() => onPick(item)}
      className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-[var(--md-surface-variant)]/50 transition-colors"
      data-tour={`amethyst-drawer-${item.tourSlug ?? item.label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <item.Icon className={`w-6 h-6 shrink-0 ${item.accent ? 'text-[var(--md-primary)]' : 'text-[var(--md-on-surface)]'}`} />
      <span className="flex-1 text-[var(--md-on-surface)]">{item.label}</span>
      {/* The relay counter is the only coloured text in the drawer */}
      {item.value && <span className="text-sm" style={{ color: '#C08A50' }}>{item.value}</span>}
    </button>
  );
}
