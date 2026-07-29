import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MaterialCard, PostData } from '../components/MaterialCard';
import { AppTopBar } from '../components/AppTopBar';
import { FeedSelector } from '../components/FeedSelector';
import { getRecentNotes, getUserByPubkey } from '../../../data/mock';
import type { MockNote } from '../../../data/mock';
import '../amethyst.theme.css';

interface HomeScreenProps {
  onOpenCompose: () => void;
  onOpenDrawer?: () => void;
  onOpenThread?: (post: PostData) => void;
  /** Reported so the guided tour's "like a post" step can complete. */
  onLikePost?: () => void;
}

export function HomeScreen({ onOpenCompose, onOpenDrawer, onOpenThread, onLikePost }: HomeScreenProps) {
  // Real Amethyst home has TWO switchers: the feed selector in the app bar
  // ("All Follows ▾") and the content sub-tabs below it.
  const [activeTab, setActiveTab] = useState<'new_threads' | 'conversations'>('new_threads');
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const [posts, setPosts] = useState(() => {
    // Convert mock notes to post format
    return getRecentNotes(20).map(note => {
      const author = getUserByPubkey(note.pubkey);
      return {
        id: note.id,
        author: {
          name: author?.displayName || 'Unknown',
          handle: author?.nip05 || author?.username || 'unknown',
          avatar: author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${note.pubkey}`,
          nip05: author?.nip05,
          isVerified: author?.isVerified,
        },
        content: note.content,
        timestamp: formatTimestamp(note.created_at),
        stats: {
          replies: note.replies,
          reposts: note.reposts,
          zaps: note.zaps,
          likes: note.likes,
        },
        images: note.images,
        hashtags: note.hashtags,
        community: note.community,
        isLive: note.isLive,
      };
    });
  });

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
    onOpenCompose();
  }, [onOpenCompose]);

  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]" data-tour="amethyst-feed">
      {/* Shared Amethyst app bar; center = feed selector "All Follows ▾" */}
      <AppTopBar onOpenDrawer={onOpenDrawer} center={<FeedSelector defaultFeed="All Follows" />} />

      {/* Content sub-tabs (distinct from the feed selector above) */}
      <div className="md-tabs sticky top-16 z-10 bg-[var(--md-surface)]">
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* LIVE now — real Amethyst shows a live-activities strip as the first feed item (NIP-53), NOT a stories carousel */}
        <button
          className="w-full flex items-center gap-3 px-4 py-3 text-left"
          style={{ borderBottom: '1px solid var(--amethyst-feed-divider)' }}
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[var(--md-on-surface)] truncate">Exploring random ideas …</p>
            <p className="text-sm text-[var(--md-on-surface-variant)] truncate">Just exploring some random ideas, nothing specific</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="live-badge text-xs font-bold px-2 py-0.5 rounded text-white">LIVE</span>
            <span className="text-sm text-[var(--md-on-surface-variant)]">🚀 17</span>
            <span className="text-sm font-medium" style={{ color: 'var(--bitcoin-orange)' }}>⚡ 122.5k</span>
          </div>
        </button>
        <AnimatePresence mode="popLayout">
          {posts.map((post, index) => (
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
          You've reached the end
        </div>
      </div>
    </div>
  );
}

// Helper function to format timestamps
function formatTimestamp(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(timestamp * 1000).toLocaleDateString();
}
