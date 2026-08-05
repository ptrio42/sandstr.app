import React, { useState } from 'react';
import { Bell, Copy, MoreHorizontal } from 'lucide-react';
import type { MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { PostCard } from '../components/PostCard';
import { FollowPill, NavBar, TabButton } from '../components/Chrome';
import { compact, followingFeed, relayRows, userByPubkey } from '../nosturData';

const TABS = ['Posts', 'Replies', 'Media', 'Reactions', 'Zaps', 'Relays'];

/**
 * Profiles/ProfileView.swift + Profiles/ProfileBanner.swift.
 *
 * Banner fallback is `LinearGradient([listBackground, accent])` — a teal-to-black
 * ramp (ProfileBanner.swift:93). Follower count renders as the literal ∞ until
 * it is known. The Follow control is FollowButtonInner, which is deliberately
 * monochrome rather than accent (NosturStyles.swift).
 */
export function ProfileScreen({
  user,
  isSelf,
  origin,
  onBack,
  lowData,
  following,
  bookmarks,
  reactions,
  reposts,
  zaps,
  onOpenThread,
  onOpenProfile,
  onReply,
  onRepost,
  onReact,
  onZap,
  onBookmark,
  onFollow,
}: {
  user: MockUser;
  isSelf: boolean;
  origin: string;
  onBack: () => void;
  lowData: boolean;
  following: Set<string>;
  bookmarks: Set<string>;
  reactions: Set<string>;
  reposts: Set<string>;
  zaps: Set<string>;
  onOpenThread: (id: string) => void;
  onOpenProfile: (u: MockUser) => void;
  onReply: (id: string) => void;
  onRepost: (id: string) => void;
  onReact: (id: string) => void;
  onZap: (id: string) => void;
  onBookmark: (id: string) => void;
  onFollow: (pubkey: string) => void;
}) {
  const [tab, setTab] = useState('Posts');
  const notes = followingFeed.filter((_, i) => i % 3 === 0).slice(0, 6);

  return (
    <>
      <NavBar
        back={{ label: origin, onClick: onBack }}
        center={
          <>
            <Avatar seed={user.pubkey} size={22} className="shrink-0" />
            <span className="truncate text-[16px] font-bold">{user.displayName}</span>
          </>
        }
        trailing={
          isSelf ? (
            <span
              className="rounded-full px-2.5 py-1 text-[12px] font-bold"
              style={{ background: 'var(--nostur-fill)', color: 'var(--nostur-primary)' }}
            >
              Edit profile
            </span>
          ) : (
            <MoreHorizontal className="h-5 w-5" style={{ color: 'var(--nostur-accent)' }} />
          )
        }
      />

      <div className="nostur-scroll" data-tour="nostur-profile">
        <div className="relative h-[110px] nostur-banner-fallback">
          <div className="absolute -bottom-8 left-4">
            <div className="rounded-full" style={{ padding: 3, background: 'var(--nostur-list-bg)' }}>
              <Avatar seed={user.pubkey} size={74} />
            </div>
          </div>
          <div className="absolute -bottom-7 right-4 flex items-center gap-3">
            <Bell className="h-6 w-6" style={{ color: 'var(--nostur-accent)' }} />
            {!isSelf && <FollowPill following={following.has(user.pubkey)} onClick={() => onFollow(user.pubkey)} />}
          </div>
        </div>

        <div className="px-4 pt-11">
          <h2 className="text-[24px] font-bold leading-tight">{user.displayName}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-[15px]">
            <span className="truncate">{user.pubkey.slice(0, 11)}…</span>
            <Copy className="h-4 w-4 shrink-0" style={{ color: 'var(--nostur-accent)' }} />
          </p>
          <p className="mt-0.5 text-[13px]" style={{ color: 'var(--nostur-secondary)' }}>
            Last seen: 1m ago
          </p>
          <p className="mt-2 text-[15px]">{user.bio}</p>
          {/* The follower count renders as a literal ∞ until it is known. */}
          <p className="mt-2 text-[15px]">
            <strong>{compact(user.followingCount)}</strong>{' '}
            <span style={{ color: 'var(--nostur-secondary)' }}>Following</span>
            <span className="ml-4 text-[19px] font-bold align-middle">∞</span>{' '}
            <span style={{ color: 'var(--nostur-secondary)' }}>Followers</span>
          </p>
          {!isSelf && (
            <p className="mt-1 text-[13px]" style={{ color: 'var(--nostur-secondary)' }}>
              Followed by 0 others you follow
            </p>
          )}
        </div>

        {/* ScrollableTabRow upstream — six tabs fit a 414 pt device, so at this
            width the row scrolls rather than squeezing the labels. */}
        <div
          className="nostur-scroll-x mt-3 flex overflow-x-auto"
          role="tablist"
          aria-label="Profile sections"
        >
          {TABS.map((t) => (
            <div key={t} className="shrink-0" style={{ minWidth: 66 }}>
              <TabButton label={t} selected={tab === t} onClick={() => setTab(t)} />
            </div>
          ))}
        </div>
        <div style={{ borderBottom: '1px solid var(--nostur-separator)' }} />

        {tab === 'Relays' ? (
          <ul>
            {relayRows.slice(0, 5).map((r) => (
              <li
                key={r.url}
                className="px-5 py-3 text-[15px]"
                style={{ borderBottom: '1px solid var(--nostur-separator)' }}
              >
                {r.url}
              </li>
            ))}
          </ul>
        ) : (
          notes.map(({ note }) => {
            const author = tab === 'Posts' ? user : userByPubkey(note.pubkey);
            return (
              <PostCard
                key={note.id}
                note={note}
                author={author}
                lowData={lowData}
                following={following.has(author.pubkey)}
                bookmarked={bookmarks.has(note.id)}
                reacted={reactions.has(note.id)}
                reposted={reposts.has(note.id)}
                zapped={zaps.has(note.id)}
                onOpen={() => onOpenThread(note.id)}
                onOpenProfile={onOpenProfile}
                onReply={() => onReply(note.id)}
                onRepost={() => onRepost(note.id)}
                onReact={() => onReact(note.id)}
                onZap={() => onZap(note.id)}
                onBookmark={() => onBookmark(note.id)}
                onFollow={() => onFollow(author.pubkey)}
              />
            );
          })
        )}
      </div>
    </>
  );
}

export default ProfileScreen;
