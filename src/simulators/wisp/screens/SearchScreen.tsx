import React, { useState } from 'react';
import {
  CircleUserRound,
  MessagesSquare,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { mockUsers, mockNotes } from '../../../data/mock';
import type { MockUser } from '../../../data/mock';
import type { SearchScreenProps } from '../types';
import { userByPubkey } from '../wispData';
import { WispAvatar } from '../components/Avatar';
import { PostCard } from '../components/PostCard';

/**
 * Search (screen-map §13). The one screen whose top block sits on SURFACE
 * (#1C1C1E), not background: segmented Profiles|Notes pill, filled pill
 * search field, Tune-style advanced panel ("Search relay" dropdown, default
 * search.nostrarchives.com; Notes tab adds an "Author" filter). Results:
 * profile rows with FollowButton / full PostCards.
 */

type SearchTab = 'profiles' | 'notes';

const RELAY_OPTIONS = ['search.nostrarchives.com', 'All relays', 'Add new'];

export function SearchScreen({ onOpenThread, onOpenProfile, onZap, onReply }: SearchScreenProps) {
  const [tab, setTab] = useState<SearchTab>('profiles');
  const [query, setQuery] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [relayMenuOpen, setRelayMenuOpen] = useState(false);
  const [searchRelay, setSearchRelay] = useState('search.nostrarchives.com');
  const [authorQuery, setAuthorQuery] = useState('');
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  const q = query.trim().toLowerCase();

  const profileResults = q
    ? mockUsers.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q),
      )
    : [];
  const noteResults = q
    ? mockNotes.filter((n) => n.content.toLowerCase().includes(q)).slice(0, 10)
    : [];

  const toggleFollow = (user: MockUser) => {
    setFollowed((f) => ({ ...f, [user.pubkey]: !f[user.pubkey] }));
  };

  const segTab = (id: SearchTab, label: string, Icon: typeof CircleUserRound) => {
    const selected = tab === id;
    return (
      <button
        type="button"
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-sm ${
          selected ? 'bg-[var(--wisp-accent)] font-semibold text-white' : 'text-[var(--wisp-on-bg)]'
        }`}
        onClick={() => setTab(id)}
      >
        <Icon size={18} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div data-tour="wisp-search" className="flex h-full min-h-0 flex-col">
      {/* Top block — the one top bar on SURFACE, not background */}
      <div className="shrink-0 space-y-2 px-4 py-2" style={{ background: 'var(--wisp-surface)' }}>
        {/* Segmented Profiles | Notes pill */}
        <div className="flex rounded-full bg-[var(--wisp-surface-variant)] p-1">
          {segTab('profiles', 'Profiles', CircleUserRound)}
          {segTab('notes', 'Notes', MessagesSquare)}
        </div>

        {/* Search row */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-[var(--wisp-surface-variant)] px-4 py-2.5">
            <Search size={20} className="shrink-0 text-[var(--wisp-on-surface-variant)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--wisp-on-bg)] outline-none placeholder:text-[var(--wisp-on-surface-variant)]"
            />
            {query !== '' && (
              <button
                type="button"
                aria-label="Clear search"
                className="shrink-0 text-[var(--wisp-on-surface-variant)]"
                onClick={() => setQuery('')}
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label="Advanced search"
            className="shrink-0 p-1"
            style={{
              color: advancedOpen ? 'var(--wisp-accent)' : 'var(--wisp-on-surface-variant)',
            }}
            onClick={() => {
              setAdvancedOpen((o) => !o);
              setRelayMenuOpen(false);
            }}
          >
            <SlidersHorizontal size={24} />
          </button>
        </div>

        {/* Advanced panel */}
        {advancedOpen && (
          <div className="space-y-2 pb-1">
            <div className="relative">
              <div
                role="button"
                tabIndex={0}
                className="cursor-pointer rounded-lg border border-[var(--wisp-outline)] px-3 py-2"
                onClick={() => setRelayMenuOpen((o) => !o)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setRelayMenuOpen((o) => !o);
                }}
              >
                <div className="text-[11px] text-[var(--wisp-on-surface-variant)]">
                  Search relay
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[15px]">{searchRelay}</span>
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-[var(--wisp-on-surface-variant)]"
                  />
                </div>
              </div>
              {relayMenuOpen && (
                <div
                  className="absolute left-0 right-0 top-full z-30 mt-1 rounded-lg border border-[var(--wisp-outline)] py-1 shadow-xl"
                  style={{ background: 'var(--wisp-surface)' }}
                >
                  {RELAY_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className="block w-full px-3 py-2 text-left text-[15px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (opt !== 'Add new') setSearchRelay(opt);
                        setRelayMenuOpen(false);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {tab === 'notes' && (
              <div className="rounded-lg border border-[var(--wisp-outline)] px-3 py-2">
                <div className="text-[11px] text-[var(--wisp-on-surface-variant)]">Author</div>
                <input
                  type="text"
                  value={authorQuery}
                  onChange={(e) => setAuthorQuery(e.target.value)}
                  placeholder="Search for author"
                  className="w-full bg-transparent text-[15px] text-[var(--wisp-on-bg)] outline-none placeholder:text-[var(--wisp-on-surface-variant)]"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {q === '' ? (
          <div className="px-6 pt-24 text-center text-[15px] text-[var(--wisp-on-surface-variant)]">
            Search for users and notes on relays
          </div>
        ) : tab === 'profiles' ? (
          profileResults.length === 0 ? (
            <div className="px-6 pt-24 text-center text-[15px] text-[var(--wisp-on-surface-variant)]">
              No results found
            </div>
          ) : (
            profileResults.map((user) => {
              const isFollowing = Boolean(followed[user.pubkey]);
              return (
                <div
                  key={user.pubkey}
                  role="button"
                  tabIndex={0}
                  className="flex cursor-pointer items-center gap-3 px-4 py-2"
                  onClick={() => onOpenProfile(user)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onOpenProfile(user);
                  }}
                >
                  <WispAvatar seed={user.username} className="w-12 h-12" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px]">{user.displayName}</div>
                    {user.nip05 && (
                      <div className="truncate text-xs text-[var(--wisp-on-surface-variant)]">
                        {user.nip05}
                      </div>
                    )}
                  </div>
                  {isFollowing ? (
                    <button
                      type="button"
                      className="shrink-0 rounded-full border border-[var(--wisp-outline)] px-4 py-1.5 text-sm"
                      style={{ color: 'var(--wisp-accent)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFollow(user);
                      }}
                    >
                      Following
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="shrink-0 rounded-full px-4 py-1.5 text-sm text-white"
                      style={{ background: 'var(--wisp-accent)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFollow(user);
                      }}
                    >
                      Follow
                    </button>
                  )}
                </div>
              );
            })
          )
        ) : noteResults.length === 0 ? (
          <div className="px-6 pt-24 text-center text-[15px] text-[var(--wisp-on-surface-variant)]">
            No results found
          </div>
        ) : (
          noteResults.map((note) => (
            <PostCard
              key={note.id}
              note={note}
              author={userByPubkey(note.pubkey)}
              onOpenThread={onOpenThread}
              onOpenProfile={onOpenProfile}
              onReply={onReply}
              onZap={onZap}
            />
          ))
        )}
      </div>
    </div>
  );
}
