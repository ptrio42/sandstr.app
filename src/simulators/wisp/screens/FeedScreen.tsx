import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutGrid,
  FileText,
  Image as ImageIcon,
  Vote,
  ChevronDown,
  ChevronUp,
  Check,
  Users,
  Network,
  Pencil,
} from 'lucide-react';
import type { FeedScreenProps } from '../types';
import {
  wispFeedNotes,
  userByPubkey,
  GENERAL_RELAYS,
  relayHost,
  hashSeed,
} from '../wispData';
import { WispAvatar } from '../components/Avatar';
import { PostCard } from '../components/PostCard';

/**
 * Wisp Home feed (screen-map §5). CenterAlignedTopAppBar with drawer avatar,
 * content-filter cycler, feed-selector pill (+dropdown +relay picker), online
 * & relay-count pills; LIVE row; PostCard list; new-notes pill; scroll-dimming
 * compose FAB.
 */

const FEED_ITEMS = [
  'For You',
  'Follows',
  'Extended',
  'Trending',
  'Relay',
  'List',
  'Hashtags',
] as const;
type FeedItem = (typeof FEED_ITEMS)[number];

const CONTENT_FILTERS = ['all', 'notes', 'gallery', 'polls'] as const;
type ContentFilter = (typeof CONTENT_FILTERS)[number];

const FILTER_LABEL: Record<ContentFilter, string> = {
  all: 'All',
  notes: 'Notes',
  gallery: 'Gallery',
  polls: 'Polls',
};

export function FeedScreen({
  currentUser,
  onOpenDrawer,
  onCompose,
  onOpenThread,
  onOpenProfile,
  onZap,
  onReply,
  registerAction,
}: FeedScreenProps) {
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');
  const [activeFeed, setActiveFeed] = useState<FeedItem>('For You');
  const [pillLabel, setPillLabel] = useState<string>('For You');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [relayPickerOpen, setRelayPickerOpen] = useState(false);
  const [showNewNotes, setShowNewNotes] = useState(true);
  const [scrolling, setScrolling] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const scrollTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (scrollTimer.current !== null) window.clearTimeout(scrollTimer.current);
    },
    [],
  );

  const cycleFilter = () => {
    setContentFilter((f) => CONTENT_FILTERS[(CONTENT_FILTERS.indexOf(f) + 1) % CONTENT_FILTERS.length]);
  };

  const selectFeed = (item: FeedItem) => {
    setDropdownOpen(false);
    if (item === 'Relay') {
      setRelayPickerOpen(true);
      return;
    }
    if (item === 'List' || item === 'Hashtags') return;
    setActiveFeed(item);
    setPillLabel(item);
  };

  const selectRelay = (url: string) => {
    setActiveFeed('Relay');
    setPillLabel(relayHost(url));
    setRelayPickerOpen(false);
  };

  const handleListScroll = () => {
    setShowNewNotes(false);
    setScrolling(true);
    if (scrollTimer.current !== null) window.clearTimeout(scrollTimer.current);
    scrollTimer.current = window.setTimeout(() => setScrolling(false), 400);
  };

  const FilterIcon =
    contentFilter === 'all'
      ? LayoutGrid
      : contentFilter === 'notes'
        ? FileText
        : contentFilter === 'gallery'
          ? ImageIcon
          : Vote;

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {/* Top bar */}
      <div className="flex h-12 shrink-0 items-center gap-1 bg-[var(--wisp-bg)] px-2">
        <button
          type="button"
          aria-label="Open drawer"
          data-tour="wisp-drawer"
          className="shrink-0 p-0.5"
          onClick={onOpenDrawer}
        >
          <WispAvatar seed={currentUser.username} className="w-8 h-8" />
        </button>
        <button
          type="button"
          aria-label={`Content filter: ${FILTER_LABEL[contentFilter]}`}
          className="grid h-9 w-9 shrink-0 place-items-center"
          style={{
            color:
              contentFilter === 'all'
                ? 'var(--wisp-on-surface-variant)'
                : 'var(--wisp-accent)',
          }}
          onClick={cycleFilter}
        >
          <FilterIcon size={22} strokeWidth={1.8} />
        </button>

        {/* Center: feed-selector pill */}
        <div className="relative mx-auto">
          <button
            type="button"
            data-tour="wisp-selector"
            className="flex items-center gap-1 rounded-[20px] bg-[var(--wisp-surface-variant)] px-3.5 py-1.5 text-sm font-medium"
            onClick={() => setDropdownOpen((o) => !o)}
          >
            <span className="max-w-[120px] truncate">{pillLabel}</span>
            <ChevronDown size={20} className="text-[var(--wisp-on-surface-variant)]" />
          </button>

          {/* Feed dropdown */}
          {dropdownOpen && (
            <div className="absolute left-1/2 top-full z-30 mt-1 min-w-[160px] -translate-x-1/2 rounded-lg bg-[var(--wisp-surface)] py-1 shadow-xl">
              {FEED_ITEMS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm"
                  onClick={() => selectFeed(item)}
                >
                  <span>{item}</span>
                  {item === activeFeed && (
                    <Check size={18} style={{ color: 'var(--wisp-accent)' }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: online + relay-count pills (compact so both fit the 340px frame) */}
        <div className="flex shrink-0 items-center gap-0.5 rounded-2xl bg-[var(--wisp-surface-variant)] px-1.5 py-1.5">
          <Users size={14} style={{ color: 'var(--wisp-repost)' }} />
          <span className="text-xs">3</span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 rounded-2xl bg-[var(--wisp-surface-variant)] px-1.5 py-1.5">
          <Network size={14} style={{ color: 'var(--wisp-repost)' }} />
          <span className="text-xs">73</span>
        </div>
      </div>

      {/* LIVE row */}
      <div className="flex shrink-0 items-center gap-2 overflow-x-auto px-3 py-2">
        <span
          className="shrink-0 rounded-md px-2 py-1 text-[11px] font-bold text-white"
          style={{ background: 'var(--wisp-live)' }}
        >
          LIVE
        </span>
        <div
          className="flex h-12 shrink-0 items-center gap-2.5 rounded-[28px] px-1 pr-3.5"
          style={{ background: 'rgba(255,152,0,0.12)' }}
        >
          <WispAvatar seed="live-scum-island" className="w-10 h-10" />
          <div className="flex min-w-0 flex-col">
            <span className="max-w-[160px] truncate text-sm">SCUM Island — ep. 12</span>
            <span className="text-[11px] text-[var(--wisp-on-surface-variant)]">2 chatting</span>
          </div>
        </div>
        <div
          className="flex h-12 shrink-0 items-center gap-2.5 rounded-[28px] px-1 pr-3.5"
          style={{ background: 'rgba(255,152,0,0.12)' }}
        >
          <WispAvatar seed="live-farcry4" className="w-10 h-10" />
          <span className="max-w-[160px] truncate text-sm">farcry4 — let&apos;s never give up</span>
        </div>
      </div>

      {/* Post list */}
      <div
        ref={listRef}
        data-tour="wisp-feed"
        className="min-h-0 flex-1 overflow-y-auto"
        onScroll={handleListScroll}
      >
        {wispFeedNotes.map((note) => (
          <PostCard
            key={note.id}
            note={note}
            author={userByPubkey(note.pubkey)}
            repostedBy={note.isRepost ? userByPubkey(note.repostedBy ?? '') : null}
            onOpenThread={onOpenThread}
            onOpenProfile={onOpenProfile}
            onReply={onReply}
            onZap={onZap}
            registerAction={registerAction}
          />
        ))}
        <div className="flex justify-center py-3">
          <button
            type="button"
            className="text-sm font-medium"
            style={{ color: 'var(--wisp-accent)' }}
            onClick={() => registerAction?.('load_more')}
          >
            Load more
          </button>
        </div>
      </div>

      {/* New-notes pill */}
      {showNewNotes && (
        <button
          type="button"
          className="absolute left-1/2 top-14 z-20 flex -translate-x-1/2 items-center gap-1 rounded-[20px] bg-[var(--wisp-accent)] px-4 py-1.5 text-sm text-white"
          onClick={() => {
            setShowNewNotes(false);
            listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <ChevronUp size={18} />
          <span>3 new notes</span>
        </button>
      )}

      {/* Compose FAB — dims to 30% while scrolling, never hides */}
      <button
        type="button"
        aria-label="New post"
        data-tour="wisp-compose"
        className={`absolute bottom-4 right-4 z-20 grid h-14 w-14 place-items-center rounded-full bg-[var(--wisp-accent)] shadow-lg transition-opacity ${
          scrolling ? 'opacity-30' : 'opacity-100'
        }`}
        onClick={onCompose}
      >
        <Pencil size={24} className="text-white" />
      </button>

      {/* Relay picker dialog */}
      {relayPickerOpen && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-black/50">
          <div className="w-[85%] rounded-2xl bg-[var(--wisp-surface)] p-4">
            <h2 className="text-base font-semibold">Select Relay</h2>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="relay.example.com"
                className="min-w-0 flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[var(--wisp-on-surface-variant)]"
                style={{ borderColor: 'var(--wisp-outline)' }}
              />
              <button
                type="button"
                className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ color: 'var(--wisp-accent)', background: 'rgba(255,152,0,0.12)' }}
                onClick={() => setRelayPickerOpen(false)}
              >
                + New Set
              </button>
            </div>
            <div className="mt-3 text-[11px] text-[var(--wisp-on-surface-variant)]">Relay Sets</div>
            <div className="mt-2 text-[11px] text-[var(--wisp-on-surface-variant)]">All relays</div>
            <div className="mt-1 max-h-56 overflow-y-auto">
              {GENERAL_RELAYS.map((url) => (
                <button
                  key={url}
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-1 py-2 text-left text-sm"
                  onClick={() => selectRelay(url)}
                >
                  <span className="truncate">{relayHost(url)}</span>
                  <span className="shrink-0 text-xs text-[var(--wisp-on-surface-variant)]">
                    covers {3 + (hashSeed(url) % 7)}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                className="px-2 py-1 text-sm font-medium"
                style={{ color: 'var(--wisp-accent)' }}
                onClick={() => setRelayPickerOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
