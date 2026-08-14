import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AppTopBar } from '../components/AppTopBar';
import { FeedSelector } from '../components/FeedSelector';
import '../amethyst.theme.css';

/**
 * Discover — upstream `Route.Discover` (`screen/loggedIn/discover/DiscoverScreen.kt`).
 * It lost its bottom-bar slot in v1.13.1 (the globe there is the Browser now)
 * and lives on in the drawer's "Navigate" section.
 *
 * [REC vs REPO] the reference recording never opens Discover, so the chrome
 * below is read off the v1.13.1 source, not off a frame:
 *
 * - Top bar is `DiscoveryTopBar` = the SAME `UserDrawerSearchTopBar` Home uses,
 *   with the feed-filter spinner in the centre (bound to
 *   `defaultDiscoveryFollowList`, same `select_list_to_filter` dialog) and the
 *   magnifier on the right. The old placeholder centred the Amethyst wordmark,
 *   which the source does not do on this screen.
 * - The LEADING slot is a back arrow, not the account avatar: Discover is only
 *   reachable from the drawer in v1.13.1, the drawer pushes (`nav.nav`) instead
 *   of marking a tab root the way `navBottomBar` does, so `nav.canPop()` is true
 *   here — which also means `AppBottomBar` returns early and the bottom bar is
 *   NOT drawn on this screen.
 * - Under it, a `SecondaryScrollableTabRow` (edgePadding 8dp) with seven tabs
 *   in this order — strings verbatim: discover_follows "Follow Packs",
 *   discover_reads "Reads", discover_content_v2 "Feed Algorithms",
 *   discover_live_v2 "Live Streams", discover_community_v2 "Communities",
 *   discover_marketplace "Marketplace", discover_chat "Chats". Marketplace is
 *   the one tab that renders as a 2-column grid.
 *
 * The BODY is deliberately not invented. Every tab's items are
 * `ChannelCardCompose`, which paints a different card per event kind (follow
 * set, long-form article, NIP-89 handler, live activity, community, classified,
 * public chat) — seven card layouts we have no reference frame for and no mock
 * events to fill: this simulator's mock data is kind-1 notes only. What the
 * real client shows for a feed with nothing in range is `FeedEmpty`, so that is
 * what each tab shows here, string for string ("Feed is empty." + an outlined
 * "Refresh"). Refresh re-runs the load exactly as upstream's
 * `feedContentState::invalidateData` does — and lands back on empty, because
 * there is nothing to load.
 */

const TABS = [
  'Follow Packs',
  'Reads',
  'Feed Algorithms',
  'Live Streams',
  'Communities',
  'Marketplace',
  'Chats',
] as const;

interface DiscoverScreenProps {
  onBack?: () => void;
  onOpenSearch?: () => void;
}

export function DiscoverScreen({ onBack, onOpenSearch }: DiscoverScreenProps) {
  const [tab, setTab] = useState<string>(TABS[0]);
  const [refreshing, setRefreshing] = useState(false);
  // The FAB exists on exactly two tabs upstream: Reads gets
  // `NewLongFormMarkdownButton` and Marketplace `NewProductButton`; the other
  // five have none (gaps ame-148). Both open a composer this reproduction does
  // not have, so the button says which one rather than opening the wrong screen.
  const [composer, setComposer] = useState<string | null>(null);
  const fab = tab === 'Reads' ? 'New Article' : tab === 'Marketplace' ? 'New Product' : null;

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]" data-tour="amethyst-discover">
      <AppTopBar
        onBack={onBack}
        onOpenSearch={onOpenSearch}
        center={<FeedSelector defaultFeed="All Follows" />}
      />

      {/* SecondaryScrollableTabRow: flat text tabs that scroll horizontally,
          full-width 3px primary underline on the selected one, 8dp edge inset.
          Scoped Tailwind rather than the shared `.md-tabs` rule, whose `flex: 1`
          tabs cannot scroll — and which the frozen v1-12 archive also uses. */}
      <div
        className="shrink-0 flex overflow-x-auto px-2 bg-[var(--md-background)]"
        style={{ borderBottom: '1px solid var(--md-outline-variant)' }}
        role="tablist"
        aria-label="Discover feeds"
        data-tour="amethyst-discover-tabs"
      >
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t)}
              className="relative shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap"
              style={{ color: active ? 'var(--md-primary)' : 'var(--md-on-surface-variant)' }}
            >
              {t}
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 right-0 bottom-0 h-[3px] rounded-t-full"
                  style={{ background: 'var(--md-primary)' }}
                />
              )}
            </button>
          );
        })}
      </div>

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

      {fab && (
        <button
          type="button"
          onClick={() => setComposer(fab)}
          aria-label={fab}
          data-tour="amethyst-discover-fab"
          className="absolute bottom-6 right-4 z-20 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: 'var(--md-primary)', color: 'var(--md-on-primary)' }}
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {composer && (
        <div className="absolute inset-0 z-[70] flex items-end" onClick={() => setComposer(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-label={composer}
            className="relative w-full rounded-t-3xl px-5 py-5"
            style={{ background: 'var(--md-surface-container-high)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-medium text-[var(--md-on-surface)]">{composer}</p>
            <p className="text-sm mt-2 leading-relaxed text-[var(--md-on-surface-variant)]">
              {composer === 'New Article'
                ? 'The real client opens its long-form markdown editor here — title, summary, cover image and a markdown body published as a kind-30023 article.'
                : 'The real client opens its classified-listing editor here — title, price, condition, location and images published as a kind-30402 listing.'}{' '}
              This reproduction ships the one text composer the FAB on Home opens, so that editor
              stops at this note.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
