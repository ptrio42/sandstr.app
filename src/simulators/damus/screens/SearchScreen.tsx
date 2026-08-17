import React, { useState } from 'react';
import type { MockUser, MockNote } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { Nip05Check, NoteCard } from '../components/NoteCard';
import { SearchIcon, FilterIcon } from '../components/icons';

interface Props {
  currentUser: MockUser | null;
  users: MockUser[];
  onOpenDrawer: () => void;
  onViewProfile: (u: MockUser) => void;
  onOpenRelayFilter: () => void;
  /** The whole global pool, before the relay filter. */
  notes: MockNote[];
  /** Already narrowed by the Universe relay filter — see relayState. */
  feedNotes: MockNote[];
  onOpenThread?: (n: MockNote) => void;
  onReply?: (n: MockNote) => void;
}

const TRENDING = ['#nostr', '#bitcoin', '#zapathon', '#PenisButter', '#coffeechain', '#grownostr', '#photography', '#plebchain'];

// Damus "Universe" — search + discovery. Header shows "Universe 🛸" + relay count + filter.
export const SearchScreen: React.FC<Props> = ({ currentUser, users, onOpenDrawer, onViewProfile, onOpenRelayFilter, notes, feedNotes, onOpenThread, onReply }) => {
  const [q, setQ] = useState('');
  const me = currentUser?.username || 'sandy';
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  const results = q
    ? users.filter((u) => (u.displayName + u.username).toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : users.slice(0, 8);

  return (
    <div className="min-h-full bg-[var(--damus-bg)]" data-tour="damus-search">
      <header className="damus-topbar">
        <div className="flex items-center gap-3 px-4 pt-2 pb-2">
          <button onClick={onOpenDrawer}><Avatar seed={me} className="w-9 h-9" /></button>
          <div className="flex-1 text-center font-bold text-[17px] text-[var(--damus-text)]">Universe <span className="align-middle">🛸</span></div>
          <span className="text-[14px] text-[var(--damus-text-secondary)]">7/13</span>
          {/*
            A real button, not a bare glyph. This is the ONLY route to a
            single-relay feed in Damus — there is no per-relay timeline screen —
            and it sat here as an undecorated icon with no handler (gap dam-19).
            Screen-map §6a.
          */}
          <button
            type="button"
            onClick={onOpenRelayFilter}
            aria-label="Filter feed by relay"
            data-tour="damus-search-filter"
          >
            <FilterIcon className="w-6 h-6 text-[var(--damus-text)]" />
          </button>
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
        </div>
      )}

      {/*
        "All recent notes" — the global feed §6 puts on this screen and the one
        surface that makes the relay filter mean anything. Without it the funnel
        set a filter with no visible consequence: a switch you could flip and
        nothing on screen would move (gap dam-21).
      */}
      {!q && (
        <div data-tour="damus-universe-feed">
          <div className="flex items-baseline justify-between px-4 pt-4 pb-1">
            <div className="text-[13px] font-semibold text-[var(--damus-text-secondary)] uppercase tracking-wide">
              All recent notes
            </div>
            <span className="text-[12px] text-[var(--damus-text-tertiary)]">
              {feedNotes.length} of {notes.length}
            </span>
          </div>
          {feedNotes.slice(0, 12).map((n) => {
            const author = users.find((u) => u.pubkey === n.pubkey) ?? users[0];
            return (
              <NoteCard
                key={n.id}
                note={n}
                author={author}
                onOpenThread={() => onOpenThread?.(n)}
                onViewProfile={() => onViewProfile(author)}
                onReply={() => onReply?.(n)}
              />
            );
          })}
          {feedNotes.length === 0 && (
            <div className="px-4 py-10 text-center text-[15px] text-[var(--damus-text-secondary)]">
              Every relay is switched off in the filter.
            </div>
          )}
        </div>
      )}

      {!q && (
        <div className="px-4 pt-5 pb-1 text-[13px] font-semibold text-[var(--damus-text-secondary)] uppercase tracking-wide">
          Suggested
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
