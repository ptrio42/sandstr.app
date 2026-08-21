import { Edit3, FileText, Highlighter, Info, LayoutGrid, MoreVertical, Rss, User, Users, Waypoints } from 'lucide-react';
import { FilterChip } from '../components/FilterChip';
import { HighlightCard } from '../components/HighlightCard';
import { IconButton, TopBar } from '../components/TopBar';
import { articleById, borisFeedItems, borisHighlights } from '../borisData';
import type { FeedScope, FeedTab } from '../types';
import type { MockUser } from '../../../data/mock';
import type { BorisArticle } from '../borisData';

/**
 * Feeds (ui/feed/FeedScreen.kt).
 *
 * Top bar: the title "Feeds", then THREE audience toggles and only then Info
 * and ⋮ (FeedScreen.kt:204-249). The toggles are not a radio group — they are
 * independent switches with a floor of one, so "Nostrverse + You" is a real
 * state (FeedScope.kt:24-31). Each is drawn in its own highlight colour at
 * alpha 1 when on, 0.4 when off and 0.28 when it needs a login it does not have
 * (FeedScreen.kt:679-692) — which is exactly how a signed-out Feeds tab looks:
 * a bright purple hub between two greyed-out neighbours.
 *
 * Chip row: All · Highlights · Writings · RSS (ContentTabs.kt:37).
 */

const SCOPES: { id: FeedScope; label: string; tint: string; icon: React.ReactNode; needsLogin: boolean }[] = [
  // Material `Hub` — a node with spokes, deliberately NOT the same glyph as
  // Friends. Upstream uses Hub / Group / Person (FeedScreen.kt:208,216,226),
  // and two identical people-icons would collapse two different audiences into
  // one control.
  { id: 'nostrverse', label: 'Nostrverse', tint: 'var(--boris-mark-others)', icon: <Waypoints size={24} />, needsLogin: false },
  { id: 'friends', label: 'Friends', tint: 'var(--boris-mark-friends)', icon: <Users size={24} />, needsLogin: true },
  { id: 'you', label: 'You', tint: 'var(--boris-mark-mine)', icon: <User size={24} />, needsLogin: true },
];

const TABS: { id: FeedTab; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <LayoutGrid size={18} /> },
  { id: 'highlights', label: 'Highlights', icon: <Highlighter size={18} /> },
  { id: 'writings', label: 'Writings', icon: <Edit3 size={18} /> },
  { id: 'rss', label: 'RSS', icon: <Rss size={18} /> },
];

export interface FeedsScreenProps {
  loggedIn: boolean;
  tab: FeedTab;
  scopes: FeedScope[];
  onTabChange: (t: FeedTab) => void;
  onToggleScope: (s: FeedScope) => void;
  onOpenArticle: (a: BorisArticle) => void;
  onOpenProfile: (u: MockUser) => void;
  onOpenInfo: () => void;
  onOpenFeedSettings: () => void;
}

export function FeedsScreen({
  loggedIn,
  tab,
  scopes,
  onTabChange,
  onToggleScope,
  onOpenArticle,
  onOpenProfile,
  onOpenInfo,
  onOpenFeedSettings,
}: FeedsScreenProps) {
  const audience = (a: string) => (a === 'mine' ? 'you' : a) as FeedScope;
  const highlights = borisHighlights.filter((h) => scopes.includes(audience(h.audience)));
  const writings = ['commonplace-book', 'everything-draft']
    .map(articleById)
    .filter(Boolean) as BorisArticle[];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TopBar
        tourId="boris-feeds-topbar"
        title="Feeds"
        actions={
          <>
            {/* One anchor around all three: a ring on a single 48dp icon reads
                as "this button", and the step is about the trio. The explicit
                floor is 3 x the IconButton floor: without it the wrapper counts
                as one rigid 144 px item, the two trailing actions absorb the
                whole shortfall alone and the last one gets clipped on a short
                window. See the comment in TopBar for why the shortfall exists. */}
            <span className="flex min-w-[6.75rem] shrink items-center" data-tour="boris-feeds-scopes">
            {SCOPES.map((s) => {
              const enabled = !s.needsLogin || loggedIn;
              const on = scopes.includes(s.id);
              const alpha = !enabled ? 0.28 : on ? 1 : 0.4;
              return (
                <IconButton
                  key={s.id}
                  label={enabled ? s.label : `Connect to see ${s.id === 'you' ? 'your' : 'friends'} content`}
                  onClick={() => enabled && onToggleScope(s.id)}
                  tourId={`boris-feeds-scope-${s.id}`}
                  tint={s.tint}
                >
                  <span style={{ opacity: alpha }}>{s.icon}</span>
                </IconButton>
              );
            })}
            </span>
            <IconButton label="Feed visibility" onClick={onOpenInfo} tourId="boris-feeds-info">
              <Info size={24} />
            </IconButton>
            <IconButton label="More" onClick={onOpenFeedSettings}>
              <MoreVertical size={24} />
            </IconButton>
          </>
        }
      />

      <div className="flex flex-wrap gap-2 px-4 pb-3" data-tour="boris-feeds-tabs">
        {TABS.map((t) => (
          <FilterChip
            key={t.id}
            selected={tab === t.id}
            label={t.label}
            icon={t.icon}
            onClick={() => onTabChange(t.id)}
            tourId={`boris-feeds-tab-${t.id}`}
          />
        ))}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        {(tab === 'all' || tab === 'highlights') &&
          highlights.map((h) => {
            const article = articleById(h.articleId);
            if (!article) return null;
            return (
              <HighlightCard
                key={h.id}
                highlight={h}
                host={article.domain === 'nostr' ? 'nostr' : article.domain}
                onOpen={() => onOpenArticle(article)}
                onOpenProfile={onOpenProfile}
                tourId={`boris-feed-card-${h.id}`}
              />
            );
          })}

        {(tab === 'all' || tab === 'rss') &&
          borisFeedItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex w-full items-center gap-3 rounded-xl py-1 text-left"
              onClick={() => onOpenArticle(articleById('slow-web') as BorisArticle)}
            >
              <span
                className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl"
                style={{ background: 'var(--boris-surface-variant)' }}
              >
                <FileText size={28} style={{ color: 'var(--boris-on-surface-variant)' }} />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="line-clamp-2 block text-[16px] font-semibold leading-5"
                  style={{ color: 'var(--boris-on-bg)' }}
                >
                  {item.title}
                </span>
                <span
                  className="mt-1 line-clamp-2 block text-[12px]"
                  style={{ color: 'var(--boris-on-surface-variant)' }}
                >
                  {item.excerpt}
                </span>
                <span
                  className="mt-1 flex items-center gap-2 text-[12px]"
                  style={{ color: 'var(--boris-on-surface-variant)' }}
                >
                  {item.source}
                  <span>{item.ago}</span>
                </span>
              </span>
            </button>
          ))}

        {tab === 'writings' &&
          writings.map((a) => (
            <button
              key={a.id}
              type="button"
              className="flex w-full items-center gap-3 rounded-xl py-1 text-left"
              onClick={() => onOpenArticle(a)}
            >
              <span
                className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl"
                style={{ background: 'var(--boris-surface-variant)' }}
              >
                {a.cover ? (
                  <img src={a.cover} alt="" className="h-full w-full object-cover" />
                ) : (
                  <FileText size={28} style={{ color: 'var(--boris-on-surface-variant)' }} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="line-clamp-2 block text-[16px] font-semibold leading-5"
                  style={{ color: 'var(--boris-on-bg)' }}
                >
                  {a.title}
                </span>
                <span
                  className="mt-1 line-clamp-2 block text-[12px]"
                  style={{ color: 'var(--boris-on-surface-variant)' }}
                >
                  {a.summary}
                </span>
                <span className="mt-1 block text-[12px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
                  {a.byline}
                </span>
              </span>
            </button>
          ))}

        {tab === 'highlights' && highlights.length === 0 && (
          <p className="px-1 py-8 text-center text-[14px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
            No highlights yet.
          </p>
        )}
      </div>
    </div>
  );
}
