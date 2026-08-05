import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import type { MockUser } from '../../../data/mock';
import { PostCard } from '../components/PostCard';
import { EmptyState, TabButton } from '../components/Chrome';
import { followingFeed } from '../nosturData';

/**
 * Screens/MainTabs/Bookmarks/. Two tabs — "Bookmarks" (with a count chip) and
 * "Private Notes" — plus a "Search in bookmarks…" field.
 */
export function BookmarksScreen({
  bookmarks,
  lowData,
  following,
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
  bookmarks: Set<string>;
  lowData: boolean;
  following: Set<string>;
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
  const [tab, setTab] = useState<'Bookmarks' | 'Private Notes'>('Bookmarks');
  const saved = followingFeed.filter(({ note }) => bookmarks.has(note.id));

  return (
    <>
      <div className="nostur-tabrow" role="tablist" aria-label="Bookmarks">
        <TabButton
          label="Bookmarks"
          secondary={String(saved.length)}
          selected={tab === 'Bookmarks'}
          onClick={() => setTab('Bookmarks')}
        />
        <TabButton
          label="Private Notes"
          selected={tab === 'Private Notes'}
          onClick={() => setTab('Private Notes')}
        />
      </div>

      <div className="flex shrink-0 items-center gap-2 px-5 py-2">
        <SearchIcon className="h-4 w-4 shrink-0" style={{ color: 'var(--nostur-secondary)' }} />
        <input
          placeholder="Search in bookmarks..."
          aria-label="Search in bookmarks"
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none"
          style={{ color: 'var(--nostur-primary)' }}
        />
      </div>

      <div className="nostur-scroll" data-tour="nostur-bookmarks">
        {tab === 'Private Notes' ? (
          <EmptyState>No private notes yet</EmptyState>
        ) : saved.length === 0 ? (
          <EmptyState>No bookmarks yet</EmptyState>
        ) : (
          saved.map(({ note, author }) => (
            <PostCard
              key={note.id}
              note={note}
              author={author}
              lowData={lowData}
              following={following.has(author.pubkey)}
              bookmarked
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
          ))
        )}
      </div>
    </>
  );
}

export default BookmarksScreen;
