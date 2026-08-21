import { Search, X } from 'lucide-react';
import { HighlightCard } from '../components/HighlightCard';
import { TopBar } from '../components/TopBar';
import { articleById, borisHighlights } from '../borisData';
import type { MockUser } from '../../../data/mock';
import type { BorisArticle } from '../borisData';

/**
 * Search (ui/search/SearchScreen.kt) — local, over what Boris already has:
 * highlights, articles, bookmarks and people (strings.xml:41-44). Placeholder
 * "Highlights, articles, bookmarks…", empty state "No matches." with the full
 * stop (strings.xml:38-39); results are highlight cards, same component as
 * Feeds.
 */
export function SearchScreen({
  query,
  onQueryChange,
  onOpenArticle,
  onOpenProfile,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  onOpenArticle: (a: BorisArticle) => void;
  onOpenProfile: (u: MockUser) => void;
}) {
  const q = query.trim().toLowerCase();
  const hits = q
    ? borisHighlights.filter((h) => {
        const article = articleById(h.articleId);
        return (
          `${h.pre}${h.mark}${h.post}${h.mark2 ?? ''}`.toLowerCase().includes(q) ||
          (article?.title ?? '').toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TopBar tourId="boris-search-topbar" title="Search" />

      <div className="px-4 pb-3">
        <div
          className="flex h-11 items-center gap-2 rounded-lg px-3"
          style={{ background: 'var(--boris-surface-variant)', border: '1px solid var(--boris-outline)' }}
          data-tour="boris-search-field"
        >
          <Search size={18} style={{ color: 'var(--boris-on-surface-variant)' }} />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Highlights, articles, bookmarks…"
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none"
            style={{ color: 'var(--boris-on-bg)' }}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onQueryChange('')}
              style={{ color: 'var(--boris-on-surface-variant)' }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        {q === '' ? null : hits.length === 0 ? (
          <p className="py-16 text-center text-[14px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
            No matches.
          </p>
        ) : (
          hits.map((h) => {
            const article = articleById(h.articleId);
            if (!article) return null;
            return (
              <HighlightCard
                key={h.id}
                highlight={h}
                host={article.domain === 'nostr' ? 'nostr' : article.domain}
                onOpen={() => onOpenArticle(article)}
                onOpenProfile={onOpenProfile}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
