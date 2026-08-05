import React from 'react';
import type { MockNote, MockUser } from '../../../data/mock';
import { PostCard } from '../components/PostCard';
import { NavBar } from '../components/Chrome';
import { followingFeed, userByPubkey } from '../nosturData';

/**
 * Post detail. Same PostCard plus the DetailFooterFragment stats row
 * ("N reactions · N reposts · N mentions · N zaps", `.gray`, 14 pt).
 * Nav bar is `< {origin}` in accent with the bold title "Post".
 */
export function ThreadScreen({
  note,
  author,
  origin,
  onBack,
  lowData,
  following,
  bookmarks,
  reactions,
  reposts,
  zaps,
  onOpenProfile,
  onReply,
  onRepost,
  onReact,
  onZap,
  onBookmark,
  onFollow,
}: {
  note: MockNote;
  author: MockUser;
  origin: string;
  onBack: () => void;
  lowData: boolean;
  following: Set<string>;
  bookmarks: Set<string>;
  reactions: Set<string>;
  reposts: Set<string>;
  zaps: Set<string>;
  onOpenProfile: (u: MockUser) => void;
  onReply: (id: string) => void;
  onRepost: (id: string) => void;
  onReact: (id: string) => void;
  onZap: (id: string) => void;
  onBookmark: (id: string) => void;
  onFollow: (pubkey: string) => void;
}) {
  // Deterministic stand-in replies drawn from the same fictional roster.
  const replies = followingFeed
    .filter(({ note: n }) => n.id !== note.id)
    .slice(0, Math.min(3, note.replies));

  const card = (n: MockNote, a: MockUser, isDetail: boolean) => (
    <PostCard
      key={n.id}
      note={n}
      author={a}
      isDetail={isDetail}
      lowData={lowData}
      following={following.has(a.pubkey)}
      bookmarked={bookmarks.has(n.id)}
      reacted={reactions.has(n.id)}
      reposted={reposts.has(n.id)}
      zapped={zaps.has(n.id)}
      onOpenProfile={onOpenProfile}
      onReply={() => onReply(n.id)}
      onRepost={() => onRepost(n.id)}
      onReact={() => onReact(n.id)}
      onZap={() => onZap(n.id)}
      onBookmark={() => onBookmark(n.id)}
      onFollow={() => onFollow(a.pubkey)}
    />
  );

  return (
    <>
      <NavBar back={{ label: origin, onClick: onBack }} title="Post" />
      <div className="nostur-scroll" data-tour="nostur-thread">
        {card(note, author, true)}
        {replies.map(({ note: n }) => card(n, userByPubkey(n.pubkey), false))}
      </div>
    </>
  );
}

export default ThreadScreen;
