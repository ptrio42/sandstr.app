import React, { useState } from 'react';
import type { MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { Nip05Check } from '../components/NoteCard';
import { SearchIcon, FilterIcon } from '../components/icons';

interface Props {
  currentUser: MockUser | null;
  users: MockUser[];
  onOpenDrawer: () => void;
  onViewProfile: (u: MockUser) => void;
}

const TRENDING = ['#nostr', '#bitcoin', '#zapathon', '#PenisButter', '#coffeechain', '#grownostr', '#photography', '#plebchain'];

// Damus "Universe" — search + discovery. Header shows "Universe 🛸" + relay count + filter.
export const SearchScreen: React.FC<Props> = ({ currentUser, users, onOpenDrawer, onViewProfile }) => {
  const [q, setQ] = useState('');
  const me = currentUser?.username || 'pitiunited';
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  const results = q
    ? users.filter((u) => (u.displayName + u.username).toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : users.slice(0, 8);

  return (
    <div className="min-h-full bg-[var(--damus-bg)]" data-tour="damus-search">
      <header className="sticky top-0 z-30 bg-[var(--damus-bg)]/85 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 pt-2 pb-2">
          <button onClick={onOpenDrawer}><Avatar seed={me} className="w-9 h-9" /></button>
          <div className="flex-1 text-center font-bold text-[17px] text-[var(--damus-text)]">Universe <span className="align-middle">🛸</span></div>
          <span className="text-[14px] text-[var(--damus-text-secondary)]">7/13</span>
          <FilterIcon className="w-6 h-6 text-[var(--damus-text)]" />
        </div>

        <div className="flex items-center gap-3 px-4 pb-3">
          <div className="relative flex-1">
            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--damus-text-secondary)]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="damus-search" />
          </div>
          {q && <button onClick={() => setQ('')} className="text-[var(--damus-purple)] text-[16px]">Cancel</button>}
        </div>
        <div className="h-px bg-[var(--damus-separator)]" />
      </header>

      {q ? (
        <>
          <div className="flex gap-2 px-4 py-3 flex-wrap">
            <span className="px-3 py-1.5 rounded-full bg-[var(--damus-bg-secondary)] text-[var(--damus-purple)] text-[15px]">#{q}</span>
            <span className="px-3 py-1.5 rounded-full bg-[var(--damus-bg-secondary)] text-[var(--damus-purple)] text-[15px]">{q}</span>
          </div>
        </>
      ) : (
        <div className="px-4 py-3">
          <div className="text-[13px] font-semibold text-[var(--damus-text-secondary)] uppercase tracking-wide mb-2">Trending hashtags</div>
          <div className="flex flex-wrap gap-2">
            {TRENDING.map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-full bg-[var(--damus-bg-secondary)] text-[var(--damus-purple)] text-[15px]">{t}</span>
            ))}
          </div>
          <div className="text-[13px] font-semibold text-[var(--damus-text-secondary)] uppercase tracking-wide mt-5 mb-1">Suggested</div>
        </div>
      )}

      <div>
        {results.map((u) => {
          const on = followed[u.username] ?? true;
          return (
            <div key={u.pubkey} className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--damus-separator)]">
              <button onClick={() => onViewProfile(u)}><Avatar seed={u.username} className="w-12 h-12" zap={!!u.lightningAddress} /></button>
              <button onClick={() => onViewProfile(u)} className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[var(--damus-text)] truncate">{u.displayName}</span>
                  {u.nip05 && <Nip05Check />}
                </div>
                <div className="text-[14px] text-[var(--damus-text-secondary)] truncate">@{u.username}</div>
              </button>
              <button
                onClick={() => setFollowed((f) => ({ ...f, [u.username]: !on }))}
                className={`damus-btn text-[14px] w-[104px] py-1.5 ${on ? 'damus-btn-outline' : 'bg-[var(--damus-text)] text-[var(--damus-bg)]'}`}
              >
                {on ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          );
        })}
        <div className="h-24" />
      </div>
    </div>
  );
};

export default SearchScreen;
