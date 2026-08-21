import { Archive, Eye, FileText, Globe, Info, Lock, LayoutGrid, Users } from 'lucide-react';
import { AuthBar } from '../components/AuthBar';
import { FilterChip } from '../components/FilterChip';
import { IconButton, TopBar } from '../components/TopBar';
import { borisArticles, type BorisArticle } from '../borisData';
import type { LibraryScope } from '../types';

/**
 * Library (ui/library/LibraryScreen.kt).
 *
 * Signed out it is a centred pair of lines and the two sign-in buttons —
 * "Your bookmarks" / "Connect, and they show up here." (strings.xml:19-20).
 * Signed in it is the scope chip row: All · Private · Public · Web · Lookmarks
 * · Archive (strings.xml:7-12), each a real nostr concept rather than a folder:
 * Private is an encrypted list, Lookmarks are kind-7 👀 reactions and Archive
 * is the 📚 one (strings.xml:31-32).
 *
 * The top bar carries an Info button that explains those sources — the app is
 * unusually careful about not letting a chip imply a storage model it does not
 * have, and the reproduction keeps that.
 */

const SCOPES: { id: LibraryScope; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <LayoutGrid size={18} /> },
  { id: 'private', label: 'Private', icon: <Lock size={18} /> },
  { id: 'public', label: 'Public', icon: <Users size={18} /> },
  { id: 'web', label: 'Web', icon: <Globe size={18} /> },
  { id: 'lookmarks', label: 'Lookmarks', icon: <Eye size={18} /> },
  { id: 'archive', label: 'Archive', icon: <Archive size={18} /> },
];

export interface LibraryScreenProps {
  loggedIn: boolean;
  scope: LibraryScope;
  onScopeChange: (s: LibraryScope) => void;
  onLogin: () => void;
  onOpenArticle: (a: BorisArticle) => void;
  onOpenInfo: () => void;
}

export function LibraryScreen({
  loggedIn,
  scope,
  onScopeChange,
  onLogin,
  onOpenArticle,
  onOpenInfo,
}: LibraryScreenProps) {
  const saved: BorisArticle[] =
    scope === 'archive'
      ? borisArticles.filter((a) => a.id === 'read-a-river')
      : scope === 'web'
        ? borisArticles.filter((a) => a.domain !== 'nostr').slice(0, 4)
        : scope === 'private'
          ? borisArticles.slice(0, 2)
          : scope === 'lookmarks'
            ? borisArticles.filter((a) => a.readMinutes <= 9).slice(0, 3)
            : borisArticles.slice(0, 5);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TopBar
        tourId="boris-library-topbar"
        title="Your Library"
        actions={
          <IconButton label="Library sources" onClick={onOpenInfo} tourId="boris-library-info">
            <Info size={24} />
          </IconButton>
        }
      />

      {!loggedIn ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 pb-16">
          <h2 className="text-[22px] font-semibold" style={{ color: 'var(--boris-on-bg)' }}>
            Your bookmarks
          </h2>
          <p className="text-center text-[14px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
            Connect, and they show up here.
          </p>
          <AuthBar onLogin={onLogin} />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 px-4 pb-3" data-tour="boris-library-scopes">
            {SCOPES.map((s) => (
              <FilterChip
                key={s.id}
                selected={scope === s.id}
                label={s.label}
                icon={s.icon}
                onClick={() => onScopeChange(s.id)}
                tourId={`boris-library-scope-${s.id}`}
              />
            ))}
          </div>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 pb-4">
            {saved.length === 0 ? (
              <p className="px-1 py-8 text-center text-[14px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
                No bookmarks here yet.
              </p>
            ) : (
              saved.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onOpenArticle(a)}
                  className="flex w-full items-center gap-3 rounded-xl py-1 text-left"
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
                      {a.domain === 'nostr' ? a.byline : a.domain}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
