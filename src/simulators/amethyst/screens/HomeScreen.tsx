import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MaterialCard, PostData } from '../components/MaterialCard';
import { AppTopBar } from '../components/AppTopBar';
import { FeedSelector } from '../components/FeedSelector';
import { getRecentNotes } from '../../../data/mock';
import { toPostData } from '../notesToPosts';
import '../amethyst.theme.css';

interface HomeScreenProps {
  /** A note the visitor just published, prepended to the feed (gaps ame-15). */
  newPost?: PostData | null;
  onOpenCompose: () => void;
  onOpenDrawer?: () => void;
  onOpenThread?: (post: PostData) => void;
  /** Opens the Search screen — the app bar's magnifier (upstream `Route.Search`). */
  onOpenSearch?: () => void;
  /** A `#tag` tapped in a note body opens that hashtag's feed (gaps ame-82). */
  onOpenHashtag?: (tag: string) => void;
  /**
   * Which sub-tab to open on. The tabs really split the feed, but the state was
   * screen-local, so no tour or FAQ step could land on "Conversations"
   * (gaps ame-07).
   */
  initialTab?: 'new_threads' | 'conversations';
  /** Tap an author's avatar or name in the feed → that author's profile. */
  onOpenProfile?: (post: PostData) => void;
  /** Reply opens the composer with THIS note quoted (gaps ame-77). */
  onReplyTo?: (post: PostData) => void;
  /** Reported so the guided tour's "like a post" step can complete. */
  onLikePost?: () => void;
}

/**
 * The feed, built once from mock notes. Exported because `AmethystSimulator`
 * needs the same first note to answer `navigate: 'thread'` — duplicating the
 * mapping there would let the two drift (gaps ame-20). The per-note mapping
 * itself lives in `notesToPosts`, which the Search results list shares.
 * `following: true` is true by construction here: this IS the All Follows feed.
 */
export function buildFeedPosts(): PostData[] {
  return getRecentNotes(20).map((note) => toPostData(note, { following: true }));
}

export function HomeScreen({ newPost, onOpenCompose, onOpenDrawer, onOpenThread, onOpenSearch, onOpenHashtag, onOpenProfile, onReplyTo, onLikePost, initialTab = 'new_threads' }: HomeScreenProps) {
  // Real Amethyst home has TWO switchers: the feed selector in the app bar
  // ("All Follows ▾") and the content sub-tabs below it.
  const [activeTab, setActiveTab] = useState<'new_threads' | 'conversations'>(initialTab);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  // `DisappearingScaffold`: the top bar collapses once you are scrolling DOWN
  // and away from the top, and comes back on the first upward scroll. The bar
  // used to be a plain sticky element with no scroll source at all
  // (gaps ame-64, ame-66).
  const [barHidden, setBarHidden] = useState(false);
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop;
    const previous = lastScrollY.current;
    lastScrollY.current = y;
    if (y <= 8) setBarHidden(false);
    // A few pixels of slack so a jittery wheel does not flap the bar.
    else if (y - previous > 6) setBarHidden(true);
    else if (previous - y > 6) setBarHidden(false);
  }, []);

  const [posts, setPosts] = useState(buildFeedPosts);
  // Publishing used to only toast: `setPosts` was never called and the screen
  // took no prop for a fresh note, so a post the visitor just wrote vanished.
  React.useEffect(() => {
    if (newPost) setPosts((cur) => (cur[0]?.id === newPost.id ? cur : [newPost, ...cur]));
  }, [newPost]);
  // Which feed the app-bar selector is on. Picking one really re-slices the
  // list — before, the dialog set a label and left the same notes on screen
  // (gaps ame-74). Mute List is the honest empty case.
  const [feed, setFeed] = useState('All Follows');
  const visiblePosts = useMemo(() => {
    let list = posts;
    if (feed === 'Mute List') list = [];
    else if (feed === 'Global') list = [...posts].reverse();
    else if (feed === 'Default Follow List') list = posts.filter((_, i) => i % 2 === 0);
    // The sub-tabs are a real split upstream: "New Threads" is root notes,
    // "Conversations" is the ones with replies under them. The indicator used to
    // move over an identical list (gaps ame-07).
    if (activeTab === 'conversations') return list.filter((p) => p.stats.replies > 0);
    return list;
  }, [feed, posts, activeTab]);

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (feedRef.current && feedRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || !feedRef.current) return;
    
    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY.current;
    
    if (diff > 0 && feedRef.current.scrollTop === 0) {
      // Resist the pull after 80px
      const resistedDistance = Math.min(diff * 0.5, 120);
      setPullDistance(resistedDistance);
    }
  }, [isPulling]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    if (pullDistance >= 80) {
      // Trigger refresh
      setRefreshing(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setRefreshing(false);
    }
    
    // Spring back
    setPullDistance(0);
    setIsPulling(false);
  }, [isPulling, pullDistance]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleLike = useCallback((id: string) => {
    console.log('Liked post:', id);
    onLikePost?.();
  }, [onLikePost]);

  const handleRepost = useCallback((id: string) => {
    console.log('Reposted:', id);
  }, []);

  const handleZap = useCallback((id: string) => {
    console.log('Zapped:', id);
  }, []);

  const handleReply = useCallback((id: string) => {
    const post = posts.find((p) => p.id === id);
    if (post && onReplyTo) onReplyTo(post);
    else onOpenCompose();
  }, [onOpenCompose, onReplyTo, posts]);

  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]" data-tour="amethyst-feed">
      {/* Shared Amethyst app bar; center = feed selector "All Follows ▾" */}
      <AppTopBar
        onOpenDrawer={onOpenDrawer}
        onOpenSearch={onOpenSearch}
        hidden={barHidden}
        center={<FeedSelector defaultFeed="All Follows" onChange={setFeed} />}
      />

      {/* Content sub-tabs (distinct from the feed selector above) */}
      <div className="md-tabs sticky top-16 z-10 bg-[var(--md-surface)]" data-tour="amethyst-home-tabs">
        <button
          onClick={() => setActiveTab('new_threads')}
          className={`md-tab ${activeTab === 'new_threads' ? 'active' : ''}`}
        >
          New Threads
          {activeTab === 'new_threads' && (
            <motion.div
              layoutId="tab-indicator"
              className="md-tab-indicator"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('conversations')}
          className={`md-tab ${activeTab === 'conversations' ? 'active' : ''}`}
        >
          Conversations
          {activeTab === 'conversations' && (
            <motion.div
              layoutId="tab-indicator"
              className="md-tab-indicator"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      </div>

      {/* Pull to Refresh Indicator */}
      <motion.div
        className="pull-indicator"
        animate={{
          height: pullDistance,
          opacity: pullDistance > 0 ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="pull-spinner"
          animate={{ rotate: (pullDistance / 80) * 360 }}
          style={{
            borderTopColor: pullDistance >= 80 ? 'var(--md-primary)' : 'transparent',
          }}
        />
      </motion.div>

      {/* Feed */}
      {/* Feed is flat and edge-to-edge (no gutters/gaps) like the real app;
          notes draw their own divider between each other. */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* No live-activities strip here on purpose. Upstream renders
            `DisplayLiveBubbles` as a horizontal LazyRow of round bubbles and only
            `if (feed.list.isNotEmpty())` — its own comment calls an empty live
            feed "the common case" (home/HomeScreen.kt). Across 285 sampled
            frames of the v1.13.1-fdroid reference recording the row never
            appears, so the feed opens straight into notes. What we shipped until
            now — a permanent full-width bar with a title, subtitle, LIVE badge
            and rocket/zap counts — matched neither the bubble shape nor the
            gating; it came from the same old promo screenshot that gave us the
            wrong app-bar right slot. */}
        <AnimatePresence mode="popLayout">
          {visiblePosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                delay: index * 0.03,
                type: 'spring',
                stiffness: 300,
                damping: 25
              }}
            >
              <MaterialCard
                post={post}
                onLike={handleLike}
                onRepost={handleRepost}
                onZap={handleZap}
                onReply={handleReply}
                onOpenThread={() => onOpenThread?.(post)}
                onOpenProfile={onOpenProfile}
                onOpenHashtag={onOpenHashtag}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Loading Indicator */}
        {refreshing && (
          <div className="flex justify-center py-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-6 h-6 border-2 border-[var(--md-primary)] border-t-transparent rounded-full"
            />
          </div>
        )}
        
        {/* End of Feed */}
        <div className="text-center py-6 text-[var(--md-on-surface-variant)] text-sm">
          {visiblePosts.length === 0 ? 'Feed is empty.' : "You've reached the end"}
        </div>
      </div>
    </div>
  );
}
