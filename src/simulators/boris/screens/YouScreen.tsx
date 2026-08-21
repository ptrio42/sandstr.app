import { Edit3, Globe, Highlighter, Settings, Users } from 'lucide-react';
import { AuthBar } from '../components/AuthBar';
import { BorisAvatar } from '../components/Avatar';
import { FilterChip } from '../components/FilterChip';
import { HighlightCard } from '../components/HighlightCard';
import { IconButton, TopBar } from '../components/TopBar';
import { SupportHeart } from '../components/SupportHeart';
import { articleById, borisHighlights, HIGHLIGHTERS } from '../borisData';
import type { ProfileTab } from '../types';
import type { MockUser } from '../../../data/mock';
import type { BorisArticle } from '../borisData';

/**
 * You (ui/you/YouScreen.kt + ui/you/YouLoggedOut.kt).
 *
 * Signed out this is the app's one piece of showmanship, and it is worth
 * copying exactly: the heading "Your highlights", then the phrase "the passages
 * you care about" set in Source Serif at 22sp and painted with an actual
 * highlight — a rounded rect at 32% alpha in dark (42% in light), 6dp/2dp
 * padding, 2dp radius, drawn behind the text rather than as a background
 * (YouLoggedOut.kt:70-101). It demonstrates the product in one line.
 *
 * Signed in it becomes your own profile: the content chips (Highlights ·
 * Writings) over your highlight cards.
 */

const TABS: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
  { id: 'highlights', label: 'Highlights', icon: <Highlighter size={18} /> },
  { id: 'writings', label: 'Writings', icon: <Edit3 size={18} /> },
  { id: 'public', label: 'Public', icon: <Users size={18} /> },
  { id: 'web', label: 'Web', icon: <Globe size={18} /> },
];

export interface YouScreenProps {
  loggedIn: boolean;
  currentUser: MockUser;
  tab: ProfileTab;
  onTabChange: (t: ProfileTab) => void;
  onLogin: () => void;
  onOpenArticle: (a: BorisArticle) => void;
  onOpenProfile: (u: MockUser) => void;
  onOpenSupport: () => void;
  onOpenSettings: () => void;
}

export function YouScreen({
  loggedIn,
  currentUser,
  tab,
  onTabChange,
  onLogin,
  onOpenArticle,
  onOpenProfile,
  onOpenSupport,
  onOpenSettings,
}: YouScreenProps) {
  const mine = borisHighlights.filter((h) => h.audience === 'mine');

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TopBar
        tourId="boris-you-topbar"
        navigation={
          <SupportHeart supporters={HIGHLIGHTERS} onOpenSupport={onOpenSupport} onOpenProfile={onOpenProfile} />
        }
        actions={
          <IconButton label="Settings" onClick={onOpenSettings} tourId="boris-you-settings">
            <Settings size={24} />
          </IconButton>
        }
      />

      {!loggedIn ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 pb-16">
          <h2 className="text-[22px] font-semibold" style={{ color: 'var(--boris-on-bg)' }}>
            Your highlights
          </h2>
          <p
            className="boris-display px-1 text-[22px] font-normal leading-[30px]"
            style={{
              color: 'var(--boris-on-bg)',
              background: 'color-mix(in srgb, var(--boris-mark-mine) 32%, transparent)',
              borderRadius: '2px',
              padding: '2px 6px',
            }}
            data-tour="boris-you-sample"
          >
            the passages you care about
          </p>
          <p className="text-center text-[14px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
            Connect, and they show up here.
          </p>
          <AuthBar onLogin={onLogin} />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <div className="flex items-center gap-3 pb-4">
            <BorisAvatar seed={currentUser.pubkey} className="h-14 w-14" />
            <div className="min-w-0">
              <div className="truncate text-[17px] font-semibold" style={{ color: 'var(--boris-on-bg)' }}>
                {currentUser.displayName}
              </div>
              <div className="truncate text-[13px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
                {currentUser.bio}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pb-3">
            {TABS.map((t) => (
              <FilterChip
                key={t.id}
                selected={tab === t.id}
                label={t.label}
                icon={t.icon}
                onClick={() => onTabChange(t.id)}
              />
            ))}
          </div>

          <div className="space-y-3">
            {tab === 'highlights' && mine.length === 0 && (
              <p className="py-8 text-center text-[14px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
                No highlights yet.
              </p>
            )}
            {tab === 'highlights' &&
              mine.map((h) => {
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
              })}
            {tab === 'writings' && (
              <p className="py-8 text-center text-[14px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
                No articles written yet.
              </p>
            )}
            {tab === 'public' && (
              <p className="py-8 text-center text-[14px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
                No public bookmarks yet.
              </p>
            )}
            {tab === 'web' && (
              <p className="py-8 text-center text-[14px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
                No web bookmarks yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
