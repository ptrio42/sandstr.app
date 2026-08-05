import React from 'react';
import { Settings, Turtle } from 'lucide-react';
import type { MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { NosturMark } from '../components/NosturMark';
import { PostCard } from '../components/PostCard';
import { TabButton } from '../components/Chrome';
import { exploreFeed, followPacks, followingFeed } from '../nosturData';
import type { NosturFeed } from '../types';

const FEEDS: NosturFeed[] = ['Following', 'Discover', 'Explore'];

interface FeedScreenProps {
  account: MockUser;
  feed: NosturFeed;
  onFeed: (f: NosturFeed) => void;
  onOpenSidebar: () => void;
  lowData: boolean;
  onToggleLowData: () => void;
  onOpenFeedSettings: () => void;
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
}

/**
 * Home — Screens/MainTabs/Home/{HomeTab,MainFeedsScreen}.swift.
 *
 * Toolbar: account avatar (opens the sidebar) · the app mark clipped to a circle
 * (scrolls to top) · a `tortoise` at accent.opacity(lowDataMode ? 1 : 0.3) ·
 * `gearshape` (feed settings). The half-dimmed turtle is a signature.
 *
 * The sub-tab row shows exactly three tabs. That is not a stripped build: the
 * other ten are gated behind `viewFollowingPublicKeys.count > 10` and the
 * recorded account follows two people. See screen-map §6.
 */
export function FeedScreen(props: FeedScreenProps) {
  const { account, feed, onFeed, lowData } = props;
  const notes = feed === 'Explore' ? exploreFeed : followingFeed;

  return (
    <>
      <div className="nostur-toolbar" data-tour="nostur-toolbar">
        <button
          type="button"
          onClick={props.onOpenSidebar}
          aria-label="Account menu"
          data-tour="nostur-account"
        >
          <Avatar seed={account.pubkey} size={30} />
        </button>
        <div className="flex flex-1 justify-center">
          <NosturMark size={30} />
        </div>
        <button
          type="button"
          onClick={props.onToggleLowData}
          aria-label="Low Data Mode"
          data-tour="nostur-lowdata"
          style={{ color: 'var(--nostur-accent)', opacity: lowData ? 1 : 0.3 }}
        >
          <Turtle className="h-[22px] w-[22px]" />
        </button>
        <button
          type="button"
          onClick={props.onOpenFeedSettings}
          aria-label="Feed settings"
          style={{ color: 'var(--nostur-accent)' }}
        >
          <Settings className="h-[22px] w-[22px]" />
        </button>
      </div>

      <div className="nostur-tabrow" role="tablist" aria-label="Feeds" data-tour="nostur-feedtabs">
        {FEEDS.map((f) => (
          <TabButton key={f} label={f} selected={feed === f} onClick={() => onFeed(f)} />
        ))}
      </div>

      <div className="nostur-scroll">
        {feed === 'Discover' ? (
          <DiscoverList />
        ) : (
          notes.map(({ note, author }) => (
            <PostCard
              key={note.id}
              note={note}
              author={author}
              lowData={lowData}
              following={props.following.has(author.pubkey)}
              bookmarked={props.bookmarks.has(note.id)}
              reacted={props.reactions.has(note.id)}
              reposted={props.reposts.has(note.id)}
              zapped={props.zaps.has(note.id)}
              onOpen={() => props.onOpenThread(note.id)}
              onOpenProfile={props.onOpenProfile}
              onReply={() => props.onReply(note.id)}
              onRepost={() => props.onRepost(note.id)}
              onReact={() => props.onReact(note.id)}
              onZap={() => props.onZap(note.id)}
              onBookmark={() => props.onBookmark(note.id)}
              onFollow={() => props.onFollow(author.pubkey)}
            />
          ))
        )}
      </div>
    </>
  );
}

/** Discover = DiscoverLists: follow packs with a teal "Show preview" chip. */
function DiscoverList() {
  return (
    <div>
      {followPacks.map((pack) => (
        <div
          key={pack.id}
          className="px-5 py-4"
          style={{ borderBottom: '1px solid var(--nostur-separator)' }}
        >
          <div className="flex items-center gap-3">
            <h3 className="min-w-0 flex-1 truncate text-[19px] font-bold">{pack.title}</h3>
            <span
              className="shrink-0 rounded-md px-2 py-1 text-[12px] font-semibold"
              style={{ background: 'var(--nostur-accent)', color: 'var(--nostur-on-accent)' }}
            >
              Show preview
            </span>
          </div>
          <div className="mt-2 flex">
            {pack.members.map((m) => (
              <div key={m.pubkey} className="-mr-2">
                <Avatar seed={m.pubkey} size={34} />
              </div>
            ))}
          </div>
          <p className="mt-2 text-[14px]" style={{ color: 'var(--nostur-secondary)' }}>
            {pack.members
              .slice(0, 3)
              .map((m) => m.displayName)
              .join(', ')}{' '}
            and {pack.total - 3} more
          </p>
          {/* div, not p: Avatar renders a div and a <div> inside a <p> is
              invalid HTML — React logs a hydration error for it. */}
          <div className="mt-1 flex items-center gap-1.5 text-[14px]">
            <span style={{ color: 'var(--nostur-secondary)' }}>by</span>
            <Avatar seed={pack.curator.pubkey} size={18} />
            <span className="font-semibold">{pack.curator.displayName}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FeedScreen;
