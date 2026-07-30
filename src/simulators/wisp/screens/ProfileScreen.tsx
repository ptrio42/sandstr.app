import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  QrCode,
  MoreVertical,
  Send,
  Bitcoin,
  UserPlus,
  UserMinus,
  VolumeX,
  BadgeCheck,
  ChevronDown,
} from 'lucide-react';
import { mockNotes, mockUsers } from '../../../data/mock';
import type { MockUser } from '../../../data/mock';
import type { ProfileScreenProps } from '../types';
import { hashSeed, formatShort } from '../wispData';
import { WispAvatar } from '../components/Avatar';
import { PostCard } from '../components/PostCard';

/**
 * Wisp profile (screen-map §8): banner + 72dp avatar overlapping 16dp (no
 * ring), 40dp circular DM/Zap/Follow/Mute actions, "∞ Followers" placeholder,
 * "Recent ▾" sort pill, followed-by strip, and the 9-tab ScrollableTabRow
 * with a right-edge fade.
 */

const OVERFLOW_ITEMS = ['Copy Profile JSON', 'Add to List', 'Block'];

const SORT_OPTIONS = ['Recent', 'Likes', 'Reposts', 'Zaps', 'Replies'];

const TABS = [
  'Notes',
  'Replies',
  'Conversation',
  'Gallery',
  'Media',
  'Following',
  'Followers',
  'Chat Rooms',
  'Relays',
] as const;

type ProfileTab = (typeof TABS)[number];

const EMPTY_STATES: Partial<Record<ProfileTab, string>> = {
  Replies: 'No replies yet',
  Conversation: 'No shared threads yet',
  Gallery: 'No gallery posts yet',
  Media: 'No media yet',
  'Chat Rooms': 'No chat rooms',
  Relays: 'No relay list published',
};

/** Labeled follow button used in Following/Followers rows (FollowButton.kt). */
function FollowRow({
  rowUser,
  onOpenProfile,
}: {
  rowUser: MockUser;
  onOpenProfile: (u: MockUser) => void;
}) {
  const [following, setFollowing] = useState(hashSeed(`follow-${rowUser.pubkey}`) % 2 === 0);
  return (
    <div
      role="button"
      tabIndex={0}
      className="flex cursor-pointer items-center gap-3 px-4 py-2.5"
      onClick={() => onOpenProfile(rowUser)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpenProfile(rowUser);
      }}
    >
      <WispAvatar seed={rowUser.username} className="w-12 h-12" />
      <span className="min-w-0 flex-1 truncate text-[15px]">{rowUser.displayName}</span>
      {following ? (
        <button
          type="button"
          className="shrink-0 rounded-full border border-[var(--wisp-outline)] px-4 py-1.5 text-sm font-medium"
          style={{ color: 'var(--wisp-accent)' }}
          onClick={(e) => {
            e.stopPropagation();
            setFollowing(false);
          }}
        >
          Following
        </button>
      ) : (
        <button
          type="button"
          className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium text-white"
          style={{ background: 'var(--wisp-accent)' }}
          onClick={(e) => {
            e.stopPropagation();
            setFollowing(true);
          }}
        >
          Follow
        </button>
      )}
    </div>
  );
}

export function ProfileScreen({
  user,
  isOwn,
  onBack,
  onOpenThread,
  onOpenProfile,
  onZap,
  onReply,
  registerAction,
}: ProfileScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState('Recent');
  const [activeTab, setActiveTab] = useState<ProfileTab>('Notes');
  const [followed, setFollowed] = useState(false);

  const h = hashSeed(user.pubkey);
  const hue = h % 360;
  const banner = `linear-gradient(135deg, hsl(${hue} 40% 30%), hsl(${(hue + 40) % 360} 45% 20%))`;

  const ownNotes = mockNotes.filter((n) => n.pubkey === user.pubkey);
  const notes = ownNotes.length > 0 ? ownNotes : mockNotes.slice(0, 3);

  const others = mockUsers.filter((u) => u.pubkey !== user.pubkey);
  const followingUsers = others.slice(0, 10);
  const followerUsers = [...others].reverse().slice(0, 10);

  const circle = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full';

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top bar */}
      <div className="relative flex h-12 shrink-0 items-center gap-1 px-1">
        <button type="button" aria-label="Back" className="p-2" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <span className="min-w-0 flex-1 truncate text-base font-semibold">{user.displayName}</span>
        <button
          type="button"
          aria-label="Search profile"
          className="p-2 text-[var(--wisp-on-surface-variant)]"
        >
          <Search size={24} />
        </button>
        <button
          type="button"
          aria-label="Show QR code"
          className="p-2 text-[var(--wisp-on-surface-variant)]"
        >
          <QrCode size={24} />
        </button>
        <button
          type="button"
          aria-label="More options"
          className="p-2 text-[var(--wisp-on-surface-variant)]"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <MoreVertical size={24} />
        </button>
        {menuOpen && (
          <div
            className="absolute right-2 top-11 z-30 min-w-[170px] rounded-lg py-1 shadow-xl"
            style={{ background: 'var(--wisp-surface)' }}
          >
            {OVERFLOW_ITEMS.map((label) => (
              <button
                key={label}
                type="button"
                className="block w-full px-4 py-2 text-left text-sm"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scroll region */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Banner — deterministic gradient stand-in for the real 150dp crop */}
        <div className="h-[150px] w-full" style={{ background: banner }} />

        {/* Header block */}
        <div className="px-4" data-tour="wisp-profile">
          <div className="flex items-end justify-between">
            {/* 72px avatar overlapping the banner by 16px, NO ring */}
            <WispAvatar seed={user.username} className="w-[72px] h-[72px] -mt-4" />
            <div className="flex items-end gap-2 pb-1">
              {isOwn ? (
                <button
                  type="button"
                  className="rounded-full bg-[var(--wisp-surface-variant)] px-3.5 py-1.5 text-xs font-medium text-[var(--wisp-on-surface-variant)]"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    aria-label="Message"
                    className={`${circle} bg-[var(--wisp-surface-variant)]`}
                  >
                    <Send size={18} style={{ color: 'var(--wisp-accent)' }} />
                  </button>
                  <button
                    type="button"
                    aria-label="Zap"
                    className={`${circle} bg-[var(--wisp-surface-variant)]`}
                    onClick={() => onZap(null, user)}
                  >
                    <Bitcoin size={18} style={{ color: 'var(--wisp-lightning)' }} />
                  </button>
                  <button
                    type="button"
                    aria-label={followed ? 'Unfollow' : 'Follow'}
                    data-tour="wisp-follow"
                    className={circle}
                    style={{
                      background: followed ? 'var(--wisp-surface-variant)' : 'var(--wisp-accent)',
                    }}
                    onClick={() => {
                      setFollowed((f) => !f);
                      registerAction?.('follow');
                    }}
                  >
                    {followed ? (
                      <UserMinus size={18} style={{ color: 'var(--wisp-on-surface-variant)' }} />
                    ) : (
                      <UserPlus size={18} className="text-white" />
                    )}
                  </button>
                  <button
                    type="button"
                    aria-label="Mute"
                    className={`${circle} bg-[var(--wisp-surface-variant)]`}
                  >
                    <VolumeX size={18} style={{ color: 'var(--wisp-on-surface-variant)' }} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name row */}
          <div className="mt-1.5 flex items-center gap-2">
            <span className="min-w-0 truncate text-xl font-bold">{user.displayName}</span>
            {!isOwn && h % 2 === 0 && (
              <span className="shrink-0 rounded bg-[var(--wisp-surface-variant)] px-1.5 py-0.5 text-[11px] text-[var(--wisp-on-surface-variant)]">
                Follows you
              </span>
            )}
          </div>
          {user.nip05 && (
            <div className="mt-0.5 flex items-center gap-1">
              <BadgeCheck size={14} style={{ color: 'var(--wisp-nip05)' }} />
              <span className="truncate text-xs" style={{ color: 'var(--wisp-accent)' }}>
                {user.nip05}
              </span>
            </div>
          )}
          {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
          {user.lightningAddress && (
            <div className="mt-1.5 flex items-center gap-1">
              <Bitcoin size={16} style={{ color: 'var(--wisp-lightning)' }} />
              <span className="truncate text-sm text-[var(--wisp-on-surface-variant)]">
                {user.lightningAddress}
              </span>
            </div>
          )}

          {/* Stats + sort pill */}
          <div className="mt-2.5 flex items-center gap-4">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold">{formatShort(user.followingCount)}</span>
              <span className="text-xs text-[var(--wisp-on-surface-variant)]">Following</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold">∞</span>
              <span className="text-xs text-[var(--wisp-on-surface-variant)]">Followers</span>
            </div>
            <div className="relative ml-auto">
              <button
                type="button"
                className="flex items-center gap-0.5 rounded-[20px] px-2.5 py-1 text-xs font-medium"
                style={{ background: 'rgba(255,152,0,0.12)', color: 'var(--wisp-accent)' }}
                onClick={() => setSortOpen((o) => !o)}
              >
                {sort}
                <ChevronDown size={16} />
              </button>
              {sortOpen && (
                <div
                  className="absolute right-0 top-full z-30 mt-1 min-w-[130px] rounded-lg py-1 shadow-xl"
                  style={{ background: 'var(--wisp-surface)' }}
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="block w-full px-4 py-2 text-left text-sm"
                      style={option === sort ? { color: 'var(--wisp-accent)' } : undefined}
                      onClick={() => {
                        setSort(option);
                        setSortOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Followed-by strip */}
          <div className="mt-2.5 flex items-center gap-2 pb-2.5">
            <div className="flex -space-x-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <WispAvatar key={i} seed={`fb-${user.pubkey}-${i}`} className="w-[22px] h-[22px]" />
              ))}
            </div>
            <span className="text-xs text-[var(--wisp-on-surface-variant)]">
              +12 others in your network
            </span>
          </div>
        </div>

        {/* Tabs — ScrollableTabRow with right-edge fade */}
        <div className="relative shrink-0 bg-[var(--wisp-bg)]">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className="relative flex h-7 shrink-0 items-center whitespace-nowrap px-2.5 text-xs font-medium"
                style={{
                  color: tab === activeTab ? 'var(--wisp-accent)' : 'var(--wisp-on-surface-variant)',
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab === activeTab && (
                  <span
                    className="absolute inset-x-1.5 bottom-0 h-0.5 rounded-t"
                    style={{ background: 'var(--wisp-accent)' }}
                  />
                )}
              </button>
            ))}
          </div>
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-12"
            style={{ background: 'linear-gradient(to right, transparent, var(--wisp-bg))' }}
          />
        </div>
        <div className="wisp-divider" />

        {/* Tab content */}
        {activeTab === 'Notes' && (
          <div>
            {notes.map((note) => (
              <PostCard
                key={note.id}
                note={note}
                author={user}
                onOpenThread={onOpenThread}
                onOpenProfile={onOpenProfile}
                onReply={onReply}
                onZap={(n, a) => onZap(n, a)}
                registerAction={registerAction}
              />
            ))}
          </div>
        )}
        {(activeTab === 'Following' || activeTab === 'Followers') && (
          <div>
            {(activeTab === 'Following' ? followingUsers : followerUsers).map((u) => (
              <FollowRow key={u.pubkey} rowUser={u} onOpenProfile={onOpenProfile} />
            ))}
          </div>
        )}
        {activeTab !== 'Notes' && activeTab !== 'Following' && activeTab !== 'Followers' && (
          <div className="flex h-[200px] items-center justify-center">
            <span className="text-[15px] text-[var(--wisp-on-surface-variant)]">
              {EMPTY_STATES[activeTab]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
