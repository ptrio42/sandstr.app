import React, { useState } from 'react';
import {
  ArrowLeft, Plus, Trash2, Check, UserPlus, LogOut, Film, Copy, RefreshCw,
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import '../amethyst.theme.css';

/**
 * The pushed screens behind the account drawer's "You" / "Create" / "Accounts"
 * rows. Until now every one of these rows carried `action: 'close'`: the tap
 * shut the drawer and landed the visitor back on the feed with no explanation,
 * which reads worse than a no-op (gaps ame-31/32/112/113/126/127/128/130/131/133).
 *
 * WHY THESE ARE NOT "COMING SOON" PLACEHOLDERS. The reference recording never
 * opens any of them, so the layouts are not filmed — but upstream's
 * `res/values/strings.xml` carries each screen's title, explainer and empty
 * state verbatim, and an empty account has nothing else to draw. So each screen
 * here is its real title plus its real empty state, quoted; where upstream's
 * empty state tells the reader to press a button ("Tap the new button below to
 * make one"), that button exists and works, because shipping a screen whose own
 * copy points at a dead control just moves the gap one level down.
 *
 * The one place we deviate: nothing here reaches a network, so a Blossom file
 * list or a signer relay count has no honest value to show. Those screens stop
 * at the empty state their strings define.
 */

export type DrawerDetailId =
  | 'my-lists'
  | 'web-bookmarks'
  | 'drafts'
  | 'scheduled-posts'
  | 'hashtag-sets'
  | 'blossom-files'
  | 'emoji-packs'
  | 'remote-signer'
  | 'hls-upload'
  | 'accounts'
  /**
   * One per row of the drawer's Feeds section (gaps ame-114). Kept as a
   * template literal rather than 28 more union members: they all render the
   * same screen, and only the title changes.
   */
  | `feed:${string}`;

interface DrawerDetailScreenProps {
  detail: DrawerDetailId;
  onBack: () => void;
  /** Signing out — the drawer's Accounts sheet is the only place that offers it. */
  onLogout?: () => void;
}

const TITLES: Record<DrawerDetailId, string> = {
  'my-lists': 'Follow Lists',
  'web-bookmarks': 'Web Bookmarks',
  drafts: 'Drafts',
  'scheduled-posts': 'Scheduled posts',
  'hashtag-sets': 'Hashtag Sets',
  'blossom-files': 'My Blossom Files',
  'emoji-packs': 'My Emoji Packs',
  'remote-signer': 'Remote Signer',
  'hls-upload': 'HLS Upload',
  accounts: 'Select Account',
};

/**
 * Screens whose whole content on a fresh account is one centred empty state.
 * `title`/`body` are `strings.xml` verbatim; `feed_is_empty` ("Feed is empty.")
 * is the shared `FeedEmpty` composable every feed screen falls back to, which is
 * what Drafts and Web Bookmarks are.
 */
const EMPTY_ONLY: Partial<Record<DrawerDetailId, { title?: string; body: string }>> = {
  drafts: { body: 'Feed is empty.' },
  'web-bookmarks': { body: 'Feed is empty.' },
  'scheduled-posts': {
    title: 'No scheduled posts',
    body: 'Compose a note and tap the clock icon to schedule it for later.',
  },
  'blossom-files': { body: 'No stored files found on your Blossom servers.' },
  'emoji-packs': { body: "You haven't added any emoji packs to your list yet" },
};

export function DrawerDetailScreen({ detail, onBack, onLogout }: DrawerDetailScreenProps) {
  const empty = EMPTY_ONLY[detail];
  const feedSlug = detail.startsWith('feed:') ? detail.slice(5) : null;
  const title = feedSlug ? FEED_DETAIL_TITLES[feedSlug] ?? feedSlug : TITLES[detail];

  return (
    <div
      className="flex flex-col h-full bg-[var(--md-background)]"
      data-tour={`amethyst-detail-${detail}`}
    >
      <div className="md-app-bar md-app-bar-enhanced">
        <button onClick={onBack} aria-label="Back" className="md-app-bar-icon-btn">
          <ArrowLeft className="w-6 h-6 text-[var(--md-on-surface)]" />
        </button>
        <h1 className="flex-1 font-semibold text-[var(--md-on-surface)] px-1">{title}</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {feedSlug ? (
          /* Upstream's FeedEmpty, plus the one sentence that keeps 28 identical
             empty screens from teaching a visitor that Amethyst is empty. */
          <div className="flex flex-col items-center justify-center h-full px-10 text-center gap-3">
            <p className="text-[var(--md-on-surface)]">Feed is empty.</p>
            <p className="text-sm leading-relaxed text-[var(--md-on-surface-variant)]">
              The real client fills this from {title.toLowerCase()} events on your relays. This
              reproduction ships text notes only, so there are none to list here.
            </p>
          </div>
        ) : empty ? (
          <EmptyState title={empty.title} body={empty.body} />
        ) : detail === 'my-lists' ? (
          <SetMakerView
            explainer="These are follow lists designed for your own usage. You can follow users privately or publicly"
            emptyBody="Feed is empty."
            nameLabel="List name"
            namePlaceholder="Close friends"
            createLabel="Create list"
            newLabel="New"
            memberNoun="member"
          />
        ) : detail === 'hashtag-sets' ? (
          <SetMakerView
            explainer="Group the hashtags you follow so you can read them as one feed."
            emptyBody="You do not have any interest sets yet. Tap the new button below to make one."
            nameLabel="Set Name"
            namePlaceholder="My interests"
            createLabel="New Interest Set"
            newLabel="New Interest Set"
            memberNoun="hashtag"
          />
        ) : detail === 'remote-signer' ? (
          <RemoteSignerView />
        ) : detail === 'hls-upload' ? (
          <HlsUploadView />
        ) : (
          <AccountsView onLogout={onLogout} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ title, body }: { title?: string; body: string }) {
  return (
    <div className="flex flex-col items-center text-center px-10 pt-24">
      {title && <p className="text-xl font-bold text-[var(--md-on-surface)]">{title}</p>}
      <p className={`text-[15px] leading-relaxed text-[var(--md-on-surface-variant)] ${title ? 'mt-2' : ''}`}>
        {body}
      </p>
    </div>
  );
}

/* ---------- My Lists / Hashtag Sets ---------- */

/**
 * Both screens are the same shape upstream: an explainer, the sets you own, and
 * a create affordance whose label differs ("New" vs "New Interest Set"). The
 * empty state of the Hashtag Sets one instructs the reader to press it, so it
 * has to actually make something.
 */
function SetMakerView({
  explainer, emptyBody, nameLabel, namePlaceholder, createLabel, newLabel, memberNoun,
}: {
  explainer: string;
  emptyBody: string;
  nameLabel: string;
  namePlaceholder: string;
  createLabel: string;
  newLabel: string;
  memberNoun: string;
}) {
  const [sets, setSets] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const canCreate = name.trim().length > 0;

  const create = () => {
    if (!canCreate) return;
    setSets((s) => (s.includes(name.trim()) ? s : [...s, name.trim()]));
    setName('');
    setCreating(false);
  };

  return (
    <div className="px-4 py-4">
      <p className="text-sm text-[var(--md-on-surface-variant)]">{explainer}</p>

      {sets.length === 0 && !creating ? (
        <p className="text-center text-[15px] text-[var(--md-on-surface-variant)] py-16">{emptyBody}</p>
      ) : (
        <div className="mt-4 space-y-2">
          {sets.map((s) => (
            <div
              key={s}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: 'var(--md-surface-container-low)' }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-[var(--md-on-surface)]">{s}</p>
                {/* `follow_set_empty_label2` / `interest_set_hashtag_count` — a
                    freshly created set has no members yet. */}
                <p className="text-sm text-[var(--md-on-surface-variant)]">0 {memberNoun}(s) · Empty</p>
              </div>
              <button
                type="button"
                onClick={() => setSets((cur) => cur.filter((x) => x !== s))}
                aria-label={`Delete ${s}`}
                className="w-8 h-8 shrink-0 flex items-center justify-center text-[var(--md-on-surface-variant)]"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {creating ? (
        <div className="mt-4 relative">
          <span className="absolute -top-2 left-3 px-1 text-[11px] z-10 bg-[var(--md-background)] text-[var(--md-on-surface-variant)]">
            {nameLabel}
          </span>
          <div className="flex items-center gap-2 rounded border border-[var(--md-outline)] pl-3 pr-1.5 h-14">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') create();
              }}
              placeholder={namePlaceholder}
              aria-label={nameLabel}
              autoFocus
              className="flex-1 min-w-0 bg-transparent text-[16px] text-[var(--md-on-surface)] focus:outline-none placeholder:text-[var(--amethyst-placeholder)]"
            />
            <button
              type="button"
              onClick={create}
              className="shrink-0 px-4 py-2 rounded-full text-sm font-medium text-white"
              style={{ background: canCreate ? 'var(--md-primary)' : 'var(--amethyst-placeholder)' }}
            >
              {createLabel}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          data-tour="amethyst-detail-new"
          className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
          style={{ background: 'var(--md-primary)', color: 'var(--md-on-primary)' }}
        >
          <Plus className="w-4 h-4" /> {newLabel}
        </button>
      )}
    </div>
  );
}

/* ---------- Remote Signer (NIP-46) ---------- */

/**
 * `nip46_signer_*`, verbatim. This is the closest neighbour of the product's
 * most-asked question ("where is my key"), so it earns more than an empty state:
 * the explainer, the enable switch, the bunker address the visitor would paste
 * into another app, and the connected-apps empty state.
 *
 * The bunker address is a placeholder, for the same reason the Backup Keys
 * screen holds no nsec — see `shared/utils/keySafety.ts`.
 */
function RemoteSignerView() {
  const [enabled, setEnabled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState('bunker://demo…@relay.example (simulated — not a real signer)');

  return (
    <div className="px-4 py-4 space-y-5">
      <p className="text-sm text-[var(--md-on-surface-variant)] leading-relaxed">
        Let other apps sign with your key. Amethyst listens on your inbox relays and checks each app's
        permissions before signing — using the same trust levels as Connected Apps.
      </p>

      <div className="flex items-start justify-between gap-4">
        <p className="flex-1 font-medium text-[var(--md-on-surface)]">Act as a remote signer</p>
        <button
          onClick={() => setEnabled((v) => !v)}
          aria-pressed={enabled}
          aria-label="Act as a remote signer"
          className={`md-switch shrink-0 ${enabled ? 'checked' : ''}`}
        >
          <div className="md-switch-thumb" />
        </button>
      </div>

      {enabled && (
        <div className="space-y-3">
          <div>
            <p className="font-medium text-[var(--md-on-surface)]">Your bunker address</p>
            <p className="text-sm text-[var(--md-on-surface-variant)]">
              Paste this into another app to connect it to your key.
            </p>
          </div>
          <p
            className="text-xs font-mono break-all rounded-xl px-4 py-3 text-[var(--md-on-surface)]"
            style={{ background: 'var(--md-surface-container-high)' }}
          >
            {address}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCopied(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
              style={{ border: '1px solid var(--md-outline)', color: 'var(--md-primary)' }}
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
            <button
              type="button"
              onClick={() => {
                setAddress(`bunker://demo${Math.abs(address.length * 7919) % 97}…@relay.example (simulated — not a real signer)`);
                setCopied(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
              style={{ border: '1px solid var(--md-outline)', color: 'var(--md-primary)' }}
            >
              <RefreshCw className="w-4 h-4" /> New address
            </button>
          </div>
          {copied && (
            <p className="text-xs" style={{ color: 'var(--amethyst-placeholder)' }}>
              Simulation: nothing was copied — this demo account has no signer to hand out.
            </p>
          )}
          <p className="text-sm text-[var(--md-on-surface-variant)] leading-relaxed pt-2">
            No apps are connected to your signer yet.
            <br />
            <br />
            Scan or paste an app's code to connect it. Connected apps appear here, and idle ones are
            removed automatically after a week.
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------- HLS Upload (the drawer's whole "Create" section) ---------- */

function HlsUploadView() {
  const [picked, setPicked] = useState(false);

  return (
    <div className="px-4 py-4">
      <button
        type="button"
        onClick={() => setPicked(true)}
        className="w-full flex flex-col items-center justify-center gap-3 rounded-2xl py-14"
        style={{ border: '1px dashed var(--md-outline)', color: 'var(--md-on-surface)' }}
      >
        <Film className="w-8 h-8" style={{ color: 'var(--md-primary)' }} />
        <span className="text-[17px] font-medium">Pick a video</span>
      </button>
      <p className="text-sm text-[var(--md-on-surface-variant)] mt-3 leading-relaxed">
        Your video will be transcoded into multiple resolutions so viewers get smooth playback on any
        connection.
      </p>
      {picked && (
        <p className="text-xs mt-4 leading-relaxed" style={{ color: 'var(--amethyst-placeholder)' }}>
          Simulation: this reproduction has no access to your files and uploads nothing. In the real
          app the picker opens here, then a Title, Description and Codec form.
        </p>
      )}
    </div>
  );
}

/* ---------- Accounts (AccountSwitchBottomSheet) ---------- */

/**
 * `account_switch_*`. The FAQ's `logout` answer walks the reader to exactly this
 * screen — "tap the logout icon on your account's row and confirm" — so the row,
 * its icon and its confirmation all exist here, and the confirmation carries the
 * warning the real dialog carries.
 */
function AccountsView({ onLogout }: { onLogout?: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [adding, setAdding] = useState(false);

  return (
    <div className="px-4 py-4" data-tour="amethyst-accounts">
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: 'var(--md-surface-container-low)' }}
      >
        <Avatar seed="sandy" className="w-11 h-11" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--md-on-surface)]">sandy</p>
          <p className="text-sm truncate text-[var(--md-on-surface-variant)]">npub1q7x9…8m4n6p0v</p>
        </div>
        <Check className="w-5 h-5 shrink-0" style={{ color: 'var(--md-primary)' }} aria-label="Active account" />
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label="Log out of sandy"
          data-tour="amethyst-accounts-logout"
          className="w-9 h-9 shrink-0 flex items-center justify-center"
          style={{ color: 'var(--md-error)' }}
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setAdding((v) => !v)}
        className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
        style={{ background: 'var(--md-primary)', color: 'var(--md-on-primary)' }}
      >
        <UserPlus className="w-4 h-4" /> Add New Account
      </button>

      {adding && (
        <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--amethyst-placeholder)' }}>
          Simulation: adding a second account means importing a second key, and this reproduction
          never takes one. In the real app "Add New Account" opens the same login page you started on.
        </p>
      )}

      {confirming && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center px-6" role="dialog" aria-label="Log out">
          <div className="absolute inset-0 bg-black/60" onClick={() => setConfirming(false)} />
          <div
            className="relative w-full rounded-3xl p-5"
            style={{ background: 'var(--md-surface-container-high)' }}
          >
            <p className="text-lg font-bold text-[var(--md-on-surface)]">Log out</p>
            <p className="text-sm mt-2 leading-relaxed text-[var(--md-on-surface-variant)]">
              Logging out deletes all local data on this phone. Back up your secret key first —
              without it the account is gone for good.
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
                onClick={() => {
                  setConfirming(false);
                  onLogout?.();
                }}
                className="px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap"
                style={{ background: 'var(--md-error)', color: 'var(--md-on-error, #fff)' }}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Payload allow-list, so `navigate: 'drawer:<id>'` cannot land on nothing. */
/** Titles for the 28 Feeds rows, in the drawer's own order. */
export const FEED_DETAIL_TITLES: Record<string, string> = {
  reads: 'Reads', pictures: 'Pictures', shorts: 'Shorts', videos: 'Videos',
  episodes: 'Episodes', podcasts: 'Podcasts', music: 'Music', playlists: 'Playlists',
  polls: 'Polls', marketplace: 'Marketplace', workouts: 'Workouts',
  'git-repositories': 'Git Repositories', 'live-streams': 'Live Streams', nests: 'Nests',
  communities: 'Communities', 'public-chats': 'Public Chats', 'relay-groups': 'Relay Groups',
  'concord-channels': 'Concord Channels', 'location-channels': 'Location Channels',
  calendars: 'Calendars', 'calendar-lists': 'Calendar lists', 'app-store': 'App Store',
  'web-apps': 'Web apps', napplets: 'nApplets', nsites: 'nSites',
  'follow-packs': 'Follow Packs', badges: 'Badges', emojis: 'Emojis',
};

export const DRAWER_DETAIL_IDS: DrawerDetailId[] = [
  'my-lists', 'web-bookmarks', 'drafts', 'scheduled-posts', 'hashtag-sets',
  'blossom-files', 'emoji-packs', 'remote-signer', 'hls-upload', 'accounts',
  ...Object.keys(FEED_DETAIL_TITLES).map((k) => `feed:${k}` as DrawerDetailId),
];
