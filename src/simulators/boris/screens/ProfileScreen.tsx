import { useState } from 'react';
import { ArrowLeft, Edit3, Globe, Highlighter, MoreVertical, Search, Users } from 'lucide-react';
import { BorisAvatar } from '../components/Avatar';
import { FilterChip } from '../components/FilterChip';
import { HighlightCard } from '../components/HighlightCard';
import { IconButton } from '../components/TopBar';
import { articleById, borisHighlights, shortNpub } from '../borisData';
import type { ProfileTab } from '../types';
import type { MockUser } from '../../../data/mock';
import type { BorisArticle } from '../borisData';

/**
 * Somebody else's profile (ui/you/ProfileScreen.kt), reached from a highlight
 * card's author line, from the reader's author chip, or — the one nobody
 * guesses — from the cycling supporter avatar in the Home top bar.
 *
 * Header is a bordered card: 48dp picture, display name, then the about text
 * clipped to two lines. Below it the same ContentTabs the You tab uses, this
 * time with all four (Highlights · Writings · Public · Web,
 * ContentTabs.kt:97-120), and an in-profile "Search…" field
 * (strings.xml:408).
 */
export function ProfileScreen({
  user,
  onBack,
  onOpenArticle,
  onOpenProfile,
}: {
  user: MockUser;
  onBack: () => void;
  onOpenArticle: (a: BorisArticle) => void;
  onOpenProfile: (u: MockUser) => void;
}) {
  const [tab, setTab] = useState<ProfileTab>('highlights');
  const [query, setQuery] = useState('');

  const theirs = borisHighlights.filter((h) => h.pubkey === user.pubkey);
  const q = query.trim().toLowerCase();
  const shown = q
    ? theirs.filter((h) => `${h.pre}${h.mark}${h.post}`.toLowerCase().includes(q))
    : theirs;

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ background: 'var(--boris-bg)' }}>
      <div className="flex h-16 shrink-0 items-center pl-1 pr-1">
        <IconButton label="Back" onClick={onBack}>
          <ArrowLeft size={24} />
        </IconButton>
        <div className="min-w-0 flex-1 truncate text-[16px] font-medium" style={{ color: 'var(--boris-on-bg)' }}>
          {user.username}
        </div>
        <IconButton label="More">
          <MoreVertical size={24} />
        </IconButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div
          className="flex items-start gap-3 rounded-xl p-3"
          style={{ border: '1px solid var(--boris-outline)' }}
          data-tour="boris-profile-header"
        >
          <BorisAvatar seed={user.pubkey} className="h-12 w-12" />
          <div className="min-w-0">
            <div className="truncate text-[16px] font-semibold" style={{ color: 'var(--boris-on-bg)' }}>
              {user.displayName || shortNpub(user.pubkey)}
            </div>
            <p className="line-clamp-2 text-[13px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
              {user.bio}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 py-3">
          {(
            [
              { id: 'highlights', label: 'Highlights', icon: <Highlighter size={18} /> },
              { id: 'writings', label: 'Writings', icon: <Edit3 size={18} /> },
              { id: 'public', label: 'Public', icon: <Users size={18} /> },
              { id: 'web', label: 'Web', icon: <Globe size={18} /> },
            ] as { id: ProfileTab; label: string; icon: React.ReactNode }[]
          ).map((t) => (
            <FilterChip
              key={t.id}
              selected={tab === t.id}
              label={t.label}
              icon={t.icon}
              onClick={() => setTab(t.id)}
            />
          ))}
        </div>

        <div
          className="mb-3 flex h-10 items-center gap-2 rounded-lg px-3"
          style={{ background: 'var(--boris-surface-variant)', border: '1px solid var(--boris-outline)' }}
        >
          <Search size={16} style={{ color: 'var(--boris-on-surface-variant)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none"
            style={{ color: 'var(--boris-on-bg)' }}
          />
        </div>

        <div className="space-y-3">
          {tab === 'highlights' ? (
            shown.length === 0 ? (
              <p className="py-8 text-center text-[14px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
                No highlights yet.
              </p>
            ) : (
              shown.map((h) => {
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
            )
          ) : (
            <p className="py-8 text-center text-[14px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
              {tab === 'writings'
                ? 'No articles written yet.'
                : tab === 'public'
                  ? 'No public bookmarks yet.'
                  : 'No web bookmarks yet.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
