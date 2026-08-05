import React, { useMemo, useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import type { MockUser } from '../../../data/mock';
import { mockUsers } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { EmptyState, FollowLink, ScreenTitle } from '../components/Chrome';

/**
 * Screens/MainTabs/Search/Search.swift — `navigationTitle("Search")` with the
 * account avatar in the leading slot and a SearchBox whose prompt is literally
 * "Search...". Results are profile rows: avatar, bold name, teal Follow, bio.
 * A hashtag query gets its own header row with a Follow pill above the results.
 */
export function SearchScreen({
  account,
  following,
  onFollow,
  onOpenProfile,
}: {
  account: MockUser;
  following: Set<string>;
  onFollow: (pubkey: string) => void;
  onOpenProfile: (u: MockUser) => void;
}) {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) return [];
    if (query.startsWith('#')) return mockUsers.slice(0, 5);
    return mockUsers
      .filter(
        (u) =>
          u.displayName.toLowerCase().includes(query) || u.username.toLowerCase().includes(query),
      )
      .slice(0, 12);
  }, [query]);

  return (
    <>
      <div className="flex shrink-0 items-center gap-3 px-4 py-2">
        <Avatar seed={account.pubkey} size={30} />
        <div className="flex flex-1 justify-center">
          <ScreenTitle>Search</ScreenTitle>
        </div>
        <span className="w-[30px]" />
      </div>

      <div className="flex shrink-0 items-center gap-2 px-4 pb-2">
        <SearchIcon className="h-4 w-4 shrink-0" style={{ color: 'var(--nostur-secondary)' }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search..."
          aria-label="Search"
          className="min-w-0 flex-1 bg-transparent text-[16px] outline-none"
          style={{ color: 'var(--nostur-primary)' }}
        />
        {q && (
          <button type="button" aria-label="Clear" onClick={() => setQ('')}>
            <X className="h-4 w-4" style={{ color: 'var(--nostur-secondary)' }} />
          </button>
        )}
      </div>

      <div className="nostur-scroll" data-tour="nostur-search">
        {query.startsWith('#') && (
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{ borderBottom: '1px solid var(--nostur-separator)' }}
          >
            <span className="min-w-0 flex-1 truncate text-[19px] font-bold">{q.trim()}</span>
            <span
              className="rounded-md px-2.5 py-1 text-[13px] font-semibold"
              style={{ background: 'var(--nostur-accent)', color: 'var(--nostur-on-accent)' }}
            >
              Follow
            </span>
          </div>
        )}

        {!query && <EmptyState>Search for people and posts</EmptyState>}
        {query && results.length === 0 && <EmptyState>No results found</EmptyState>}

        {results.map((u) => (
          <div
            key={u.pubkey}
            className="flex items-start gap-3 px-5 py-3"
            style={{ borderBottom: '1px solid var(--nostur-separator)' }}
          >
            <button type="button" onClick={() => onOpenProfile(u)} aria-label={u.displayName}>
              <Avatar seed={u.pubkey} size={40} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <button
                  type="button"
                  onClick={() => onOpenProfile(u)}
                  className="min-w-0 truncate text-left text-[16px] font-bold"
                >
                  {u.displayName}
                </button>
                <FollowLink
                  following={following.has(u.pubkey)}
                  onClick={() => onFollow(u.pubkey)}
                />
              </div>
              <p className="mt-0.5 line-clamp-2 text-[14px]" style={{ color: 'var(--nostur-secondary)' }}>
                {u.bio}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default SearchScreen;
