import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MoreVertical, Mail, List, Copy, QrCode,
  BadgeCheck, Link as LinkIcon, Zap, Play, Flag, ShieldCheck, Share2, VolumeX,
} from 'lucide-react';
import { useAmethystToast } from '../toast';
import { MaterialCard } from '../components/MaterialCard';
import { Avatar } from '../components/Avatar';
import { mockNotes, getNotesByAuthor, getUserByPubkey } from '../../../data/mock';
import type { MockUser } from '../../../data/mock';
import '../amethyst.theme.css';

interface ProfileScreenProps {
  onBack?: () => void;
  /** Reported so the guided tour's follow step can complete. */
  onFollowToggle?: () => void;
  /**
   * Whose profile this is. Absent = the signed-in demo account ("sandy"), which
   * is where the drawer's Profile row and the `viewProfile` command land; a
   * `MockUser` = an author tapped in the feed (gaps ame-57).
   */
  user?: MockUser | null;
  /**
   * Which tab to land on. The drawer's Bookmarks row is a tab on your own
   * profile upstream, not its own screen (gaps ame-37).
   */
  initialTab?: ProfileTab;
  /** The envelope in the action row opens the DM list (gaps ame-45). */
  onMessage?: () => void;
}

// Real Amethyst profile (ProfileScreen.kt, verified vs shots/profile.png):
// banner + floating ⋮ · overlapping avatar w/ account badge · action row
// (Message/Edit/Follow/List) · name + npub + copy/QR · badges · NIP-05/website/
// lightning links · bio · tabs Notes/Replies/Yours/Gallery. NO Twitter-style
// stat strip and NO "joined date" (Nostr has neither).

type ExternalIdentity = { network: string; handle: string };

type ProfileSubject = {
  name: string;
  username: string;
  identities: ExternalIdentity[];
  seed: string;
  npub: string;
  nprofile: string;
  lastSeen: string;
  nip05?: string;
  website?: string;
  lightning?: string;
  bio: string;
};

/** The signed-in demo account — the drawer's Profile row and `viewProfile`. */
const SELF: ProfileSubject = {
  name: 'sandy',
  username: 'sandy',
  identities: [
    { network: 'GitHub', handle: 'sandy' },
    { network: 'Mastodon', handle: '@sandy@example.social' },
  ],
  seed: 'sandy',
  npub: 'npub178u…vq05qrg4',
  nprofile: 'nprofile1qqs9p…9uvrafdc',
  lastSeen: 'Last seen 31 minutes ago',
  nip05: 'sandy.example',
  website: 'sandy.example',
  lightning: 'sandy@wallet.example',
  bio: 'All-round buidler.',
};

/** `npub1abc…xyz` — the elided form the profile header renders. */
function elide(key: string): string {
  return key.length > 20 ? `${key.slice(0, 9)}…${key.slice(-8)}` : key;
}

function lastSeen(unixSeconds: number): string {
  const diff = Math.max(0, Date.now() / 1000 - unixSeconds);
  if (diff < 3600) return `Last seen ${Math.max(1, Math.floor(diff / 60))} minutes ago`;
  if (diff < 86400) return `Last seen ${Math.floor(diff / 3600)} hours ago`;
  return `Last seen ${Math.floor(diff / 86400)} days ago`;
}

/**
 * A feed author rendered as a profile. `nprofile` is derived rather than stored:
 * NIP-19 wraps the same key with relay hints, so it shares the key's tail — this
 * is a display shape, not an encoding (no crypto anywhere in this project).
 */
function subjectFor(user: MockUser): ProfileSubject {
  return {
    name: user.displayName,
    username: user.username,
    // §Profile lists external identities between the website and the payment
    // chips. Mock users carry none, so these are derived from the handle and
    // resolve nowhere — .example domains, per src/data/mock/users.ts's rule.
    identities: [
      { network: 'GitHub', handle: user.username },
      { network: 'Mastodon', handle: `@${user.username}@example.social` },
    ],
    seed: user.username || user.pubkey,
    npub: elide(user.pubkey),
    nprofile: `nprofile1qqs${user.pubkey.slice(5, 9)}…${user.pubkey.slice(-8)}`,
    lastSeen: lastSeen(user.lastActive),
    nip05: user.nip05,
    website: user.website?.replace(/^https?:\/\//, ''),
    lightning: user.lightningAddress,
    bio: user.bio,
  };
}

// Profile tab row @ v1.13.1, upstream order (strings notes/replies/mutual/
// gallery/profile_tab_apps/…). "Yours" really is the label of the `mutual`
// string — it is not a placeholder we invented. Only the first four have
// content here; the rest render their empty state.
const TABS = [
  'Notes', 'Replies', 'Yours', 'Gallery', 'Apps & Sites',
  'Follows', 'Followers', 'Zaps', 'Bookmarks', 'Followed Tags', 'Reports', 'Relays',
] as const;

export type ProfileTab = (typeof TABS)[number];

const badgeHues = [275, 45, 30, 200, 320, 160, 260];

export function ProfileScreen({ onBack, onFollowToggle, user, initialTab = 'Notes', onMessage }: ProfileScreenProps) {
  const toast = useAmethystToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [lists, setLists] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(initialTab);
  // Own profile keeps the "Unfollow" state the guided tour was built against;
  // a stranger opened from the feed starts on "Follow", which is what the
  // reference recording shows on a profile you do not follow (see ame-44).
  const [isFollowing, setIsFollowing] = useState(!user);
  const profile = user ? subjectFor(user) : SELF;
  const tabCounts: Partial<Record<ProfileTab, number>> = {
    Follows: user?.followingCount ?? 2374,
    Followers: user?.followersCount ?? 318,
  };

  // Own profile borrows the newest notes (the demo account has none of its own);
  // a real author shows the notes actually attributed to their key.
  const sourceNotes = user ? getNotesByAuthor(user.pubkey).slice(0, 6) : mockNotes.slice(0, 6);
  const userPosts = sourceNotes.map((note) => {
    const author = getUserByPubkey(note.pubkey);
    return {
      id: note.id,
      pubkey: note.pubkey,
      author: { name: profile.name, handle: profile.nip05 || profile.name, avatar: author?.avatar || '', isVerified: true, nip05: profile.nip05 },
      content: note.content,
      timestamp: formatTimestamp(note.created_at),
      stats: { replies: note.replies, reposts: note.reposts, zaps: note.zaps, likes: note.likes },
      images: note.images,
    };
  });

  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]" data-tour="amethyst-profile">
      <div className="flex-1 overflow-y-auto">
        {/* Banner + floating actions */}
        <div className="relative h-36 w-full bg-gradient-to-br from-[#3a1d6e] via-[#7b2ff7] to-[#c026d3]">
          <div className="absolute inset-0 flex items-start justify-between p-3">
            <button onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="More"
              data-tour="amethyst-profile-overflow"
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Avatar row + action buttons */}
        <div className="px-4">
          <div className="flex justify-between items-end -mt-12">
            <div className="relative">
              <Avatar seed={profile.seed} className="w-24 h-24 border-4 border-[var(--md-background)]" />
              <span className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[var(--md-primary)] ring-2 ring-[var(--md-background)] flex items-center justify-center">
                <BadgeCheck className="w-3.5 h-3.5 text-[var(--md-on-primary)]" />
              </span>
            </div>

            {/* [REC vs REPO] upstream's row is Message · Payment · BOLT12 ·
                [Edit if me] · Follow/Unfollow · List, but Payment, BOLT12 and
                Edit are each conditional; on the stranger's profile the
                reference recording opens, exactly three buttons render. We show
                a stranger's profile, so we show those three. */}
            <div className="flex items-center gap-2 mb-1">
              <ActionIconButton label="Message" onClick={onMessage}><Mail className="w-5 h-5" /></ActionIconButton>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsFollowing((f) => !f);
                  onFollowToggle?.();
                }}
                data-tour="amethyst-follow"
                className="px-5 py-2 rounded-full text-sm font-medium bg-[var(--md-surface-variant)] text-[var(--md-on-surface)]"
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </motion.button>
              <ActionIconButton label="Add to list" onClick={() => setListOpen(true)}><List className="w-5 h-5" /></ActionIconButton>
            </div>
          </div>

          {/* Name + identity */}
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-[var(--md-on-surface)]">{profile.name}</h2>
              <Play className="w-4 h-4 text-[var(--md-on-surface-variant)]" />
            </div>
            {/* The grey @username line, between the display name and the npub —
                missing until now (gaps ame-48). */}
            <p className="text-[15px] text-[var(--md-on-surface-variant)]">@{profile.username}</p>
            {/* npub carries only a copy button; the QR sits on the nprofile
                row below it, not on the npub (ProfileHeader info block order). */}
            <div className="flex items-center gap-2 mt-0.5 text-[var(--md-on-surface-variant)]" data-tour="amethyst-profile-npub">
              <span className="text-sm">{profile.npub}</span>
              <button type="button" onClick={() => toast('Simulation: nothing was copied — this npub belongs to a mock account.')} aria-label="Copy npub">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[var(--md-on-surface-variant)]">
              <span className="text-sm">{profile.nprofile}</span>
              <button type="button" onClick={() => toast('Simulation: nothing was copied — this nprofile belongs to a mock account.')} aria-label="Copy nprofile">
                <Copy className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => toast('Simulation: there is no key here to put in a QR code.')} aria-label="Show nprofile QR code">
                <QrCode className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[var(--md-on-surface-variant)] mt-0.5">{profile.lastSeen}</p>
          </div>

          {/* Links */}
          <div className="mt-3 space-y-1.5 text-[15px]">
            {profile.nip05 && (
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate" style={{ color: 'var(--md-primary)' }}>{profile.nip05}</span>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[var(--md-on-surface-variant)] shrink-0" />
                <span className="truncate" style={{ color: 'var(--md-primary)' }}>{profile.website}</span>
              </div>
            )}
          </div>

          {/* Payment-rail chips. v1.13.1 renders each rail as its own outlined
              chip in the rail's brand colour rather than as a plain lightning
              line — the recording shows "⚡ Lightning <addr>" and "₿ On-chain"
              side by side, both bitcoin-orange. */}
          <div className="flex items-center gap-2 mt-3 flex-wrap" data-tour="amethyst-profile-payments">
            {profile.lightning && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                style={{ border: '1px solid var(--bitcoin-orange)' }}
              >
                <Zap className="w-4 h-4 shrink-0" style={{ color: 'var(--bitcoin-orange)' }} />
                <span className="font-medium" style={{ color: 'var(--bitcoin-orange)' }}>Lightning</span>
                <span className="text-[var(--md-on-surface-variant)] truncate max-w-[130px]">{profile.lightning}</span>
              </span>
            )}
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
              style={{ border: '1px solid var(--bitcoin-orange)' }}
            >
              <span className="font-bold" style={{ color: 'var(--bitcoin-orange)' }}>₿</span>
              <span className="font-medium" style={{ color: 'var(--bitcoin-orange)' }}>On-chain</span>
            </span>
          </div>

          {/* External identities — the block §Profile puts after the website and
              before the payment chips. Values are derived from the mock handle;
              none of them resolves anywhere (gaps ame-48). */}
          <div className="flex flex-wrap gap-2 mt-3 text-sm">
            {profile.identities.map((id) => (
              <span
                key={id.network}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: 'var(--md-surface-container-high)' }}
              >
                <span className="text-[var(--md-on-surface-variant)]">{id.network}</span>
                <span style={{ color: 'var(--md-primary)' }}>{id.handle}</span>
              </span>
            ))}
          </div>

          {/* Badges — §Profile puts them AFTER the payment chips and immediately
              before the bio; we drew them above NIP-05 (gaps ame-48). */}
          <div className="flex gap-2 mt-3">
            {badgeHues.map((h, i) => (
              <div key={i} className="w-9 h-9 rounded-full shrink-0" style={{ background: `linear-gradient(135deg, hsl(${h} 60% 55%), hsl(${(h + 40) % 360} 60% 40%))` }} />
            ))}
          </div>

          {/* Bio */}
          <p className="mt-3 mb-1 text-[var(--md-on-surface)]">{profile.bio}</p>
        </div>

        {/* Tabs */}
        {/* Upstream the follows/followers COUNTS live in these tab headers —
            there is no Twitter-style stat strip — so with the tabs empty the
            numbers had nowhere to appear at all (gaps ame-49). */}
        <div className="md-tabs sticky top-0 z-10 bg-[var(--md-background)] mt-2 overflow-x-auto" data-tour="amethyst-profile-tabs">
          {TABS.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`md-tab whitespace-nowrap ${activeTab === t ? 'active' : ''}`}>
              {t}{tabCounts[t] !== undefined ? ` ${tabCounts[t]}` : ''}
              {activeTab === t && (
                <motion.div layoutId="profile-tab-indicator" className="md-tab-indicator" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-2">
          {activeTab === 'Notes' && userPosts.length > 0 ? (
            <div className="space-y-2">
              {userPosts.map((post) => <MaterialCard key={post.id} post={post} />)}
            </div>
          ) : activeTab === 'Notes' ? (
            <div className="text-center py-12 text-[var(--md-on-surface-variant)]">No notes yet</div>
          ) : (
            <div className="text-center py-12 text-[var(--md-on-surface-variant)]">No {activeTab.toLowerCase()} yet</div>
          )}
        </div>
      </div>

      {/* Profile overflow. Upstream's ⋮ carries report / block / mute / copy —
          the two destructive rows tinted with the error colour (gaps ame-46). */}
      {menuOpen && (
        <div className="fixed inset-0 z-[140] flex items-end" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-label="More"
            data-tour="amethyst-profile-menu"
            className="relative w-full rounded-t-3xl pb-3"
            style={{ background: 'var(--md-surface-container-high)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { label: 'Share this profile', Icon: Share2 },
              { label: 'Copy User ID', Icon: Copy },
              { label: 'Mute', Icon: VolumeX, danger: true },
              { label: 'Block & Hide User', Icon: ShieldCheck, danger: true },
              { label: 'Report', Icon: Flag, danger: true },
            ].map((row) => (
              <button
                key={row.label}
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  toast(`Simulation: "${row.label}" changes nothing here — there is no account to act on.`);
                }}
                className="w-full flex items-center gap-4 px-5 py-3 text-left"
                style={{ color: row.danger ? 'var(--md-error)' : 'var(--md-on-surface)' }}
              >
                <row.Icon className="w-5 h-5 shrink-0 text-[var(--md-on-surface-variant)]" />
                {row.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add to list — `follow_set_man_dialog_title2` ("Your Lists and <name>"). */}
      {listOpen && (
        <div className="fixed inset-0 z-[140] flex items-end" onClick={() => setListOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-label="Add to list"
            data-tour="amethyst-profile-lists"
            className="relative w-full rounded-t-3xl px-5 pt-4 pb-5"
            style={{ background: 'var(--md-surface-container-high)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-[var(--md-on-surface)]">Your Lists and {profile.name}</p>
            <div className="mt-3 space-y-1">
              {['Close friends', 'Nostr devs', 'Read later'].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLists((cur) => (cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l]))}
                  className="w-full flex items-center justify-between gap-3 py-2.5 text-left"
                >
                  <span className="text-[var(--md-on-surface)]">{l}</span>
                  <span className="text-sm" style={{ color: lists.includes(l) ? 'var(--md-primary)' : 'var(--amethyst-placeholder)' }}>
                    {lists.includes(l) ? 'Public member' : 'Not a member'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionIconButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={label}
      className="w-10 h-10 rounded-full bg-[var(--md-surface-variant)] text-[var(--md-on-surface)] flex items-center justify-center"
    >
      {children}
    </motion.button>
  );
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}
