import { Copy, Earth, Edit3, Globe, Highlighter, LogOut, MoreVertical, Settings, Share2 } from 'lucide-react';
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
 * Signed in it becomes your own profile: a bordered header card holding a 48dp
 * picture and your name, the four content chips (Highlights · Writings · Public
 * · Web), an in-profile Search field, then your highlight cards.
 *
 * The top bar carries the support heart on the left and BOTH a settings gear
 * and an overflow `⋮` on the right — confirmed on the 2026-08-22 recording
 * (t=0-7, t=92-95). The `⋮` matters out of proportion to its size: it is the
 * only place in the whole app where you can sign out. The items behind it are
 * still source-only (AccountScreen.kt:133-144); the recording never opens it.
 */

const TABS: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
  { id: 'highlights', label: 'Highlights', icon: <Highlighter size={18} /> },
  { id: 'writings', label: 'Writings', icon: <Edit3 size={18} /> },
  // `Public` is the globe-with-a-landmass glyph, not a pair of people — same
  // correction as the Library scope row (2026-08-22 recording, t=159).
  { id: 'public', label: 'Public', icon: <Earth size={18} /> },
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
  onLogout: () => void;
  /** Controlled for the same reason the reader's save menu is — see there. */
  menuOpen: boolean;
  onMenuChange: (open: boolean) => void;
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
  onLogout,
  menuOpen,
  onMenuChange,
}: YouScreenProps) {
  const mine = borisHighlights.filter((h) => h.audience === 'mine');

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <TopBar
        tourId="boris-you-topbar"
        navigation={
          <SupportHeart supporters={HIGHLIGHTERS} onOpenSupport={onOpenSupport} onOpenProfile={onOpenProfile} />
        }
        actions={
          <>
            <IconButton label="Settings" onClick={onOpenSettings} tourId="boris-you-settings">
              <Settings size={24} />
            </IconButton>
            {loggedIn && (
              <IconButton label="More" onClick={() => onMenuChange(!menuOpen)} tourId="boris-you-more">
                <MoreVertical size={24} />
              </IconButton>
            )}
          </>
        }
      />

      {/* Rendered from the screen root, not from inside the bar: TopBar is
          `overflow-hidden` (it truncates long titles), so a dropdown mounted in
          it is clipped to a 64px strip and its spotlight rings nothing. */}
      {loggedIn && menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 z-40 cursor-default"
            onClick={() => onMenuChange(false)}
          />
          <div
            className="absolute right-1 top-14 z-50 max-w-[calc(100%-0.5rem)] overflow-hidden rounded-lg py-1"
            style={{
              background: 'var(--boris-surface-variant)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
            }}
            data-tour="boris-you-menu"
          >
            {[
              { id: 'copy', label: 'Copy Link', icon: <Copy size={18} /> },
              { id: 'share', label: 'Share', icon: <Share2 size={18} /> },
              { id: 'njump', label: 'Open in njump', icon: <Globe size={18} /> },
              { id: 'logout', label: 'Sign out', icon: <LogOut size={18} /> },
            ].map((row) => (
              <button
                key={row.id}
                type="button"
                className="flex w-full items-center gap-2.5 whitespace-nowrap px-3 py-2.5 text-left text-[13px]"
                style={{ color: 'var(--boris-on-bg)' }}
                onClick={() => {
                  onMenuChange(false);
                  if (row.id === 'logout') onLogout();
                }}
              >
                <span
                  className="flex h-[18px] w-[18px] shrink-0 items-center justify-center"
                  style={{ color: 'var(--boris-on-surface-variant)' }}
                >
                  {row.icon}
                </span>
                {row.label}
              </button>
            ))}
          </div>
        </>
      )}

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
          {/* Bordered header card, 48dp picture, about clipped to two lines
              (ProfileScreen.kt) — measured on the recording at t=159: a 1dp
              `outline` rounded card, not the bare row this used to be. */}
          <div
            className="mb-3 flex items-center gap-4 rounded-2xl px-4 py-4"
            style={{ border: '1px solid var(--boris-outline)' }}
            data-tour="boris-you-header"
          >
            <BorisAvatar seed={currentUser.pubkey} className="h-12 w-12 shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-[17px] font-semibold" style={{ color: 'var(--boris-on-bg)' }}>
                {currentUser.displayName}
              </div>
              <div
                className="overflow-hidden text-[13px]"
                style={{
                  color: 'var(--boris-on-surface-variant)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
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
