import React, { useState } from 'react';
import { AppTopBar } from '../components/AppTopBar';
import { FeedSelector } from '../components/FeedSelector';
import '../amethyst.theme.css';

/**
 * Shorts — upstream `Route.Shorts` (`screen/loggedIn/shorts/ShortsScreen.kt`).
 * Dropped out of the bottom bar in v1.13.1; still a destination in the drawer's
 * "Navigate" section.
 *
 * [REC vs REPO] the reference recording never opens Shorts, so this is read off
 * the v1.13.1 source, not off a frame. Two corrections to what we shipped:
 *
 * - The top bar is `ShortsTopBar` = the SAME `UserDrawerSearchTopBar` Home uses,
 *   with the feed-filter spinner in the centre (bound to
 *   `defaultShortsFollowList`). The old placeholder put the Amethyst app icon
 *   there; the source puts the feed filter. The leading slot is a back arrow
 *   and the bottom bar is absent, for the same reason as on Discover: the
 *   drawer pushes this screen, so `nav.canPop()` is true.
 * - It is NOT a full-screen vertical video pager. `ShortsFeedLoaded` is a plain
 *   `LazyColumn` of `VideoCardCompose` cards — author header, full-width media,
 *   reaction row with `showReactionDetail = true`, then title + caption —
 *   separated by a hairline divider and an 8dp spacer.
 *
 * The card list is deliberately not invented: `ShortsFeedLoaded` renders an
 * item only `if (item.event is VideoEvent)`, and this simulator's mock data is
 * kind-1 text notes only — there is not a single video event to draw, and
 * fabricating video posts would put made-up media on screen. What the real
 * client shows when nothing matches is `FeedEmpty`, so that is what this shows,
 * string for string ("Feed is empty." + an outlined "Refresh").
 */

interface VideoScreenProps {
  onBack?: () => void;
  onOpenSearch?: () => void;
}

export function VideoScreen({ onBack, onOpenSearch }: VideoScreenProps) {
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]" data-tour="amethyst-shorts">
      <AppTopBar
        onBack={onBack}
        onOpenSearch={onOpenSearch}
        center={<FeedSelector defaultFeed="All Follows" />}
      />

      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center gap-3 px-10">
        {refreshing ? (
          <div
            className="w-6 h-6 rounded-full animate-spin"
            style={{
              border: '2px solid var(--md-primary)',
              borderTopColor: 'transparent',
            }}
            aria-label="Loading"
          />
        ) : (
          <>
            <p className="text-[var(--md-on-surface)]">Feed is empty.</p>
            <button
              type="button"
              onClick={refresh}
              className="px-6 py-2 rounded-full text-sm font-medium"
              style={{
                border: '1px solid var(--md-outline)',
                color: 'var(--md-primary)',
              }}
            >
              Refresh
            </button>
          </>
        )}
      </div>
    </div>
  );
}
