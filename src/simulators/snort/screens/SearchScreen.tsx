import { useMemo, useState } from 'react';
import type { MockNote, MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { NoteCard } from '../components/NoteCard';

/**
 * Snort — search (`/search/:keyword?`).
 *
 * Rebuilt from `docs/refs/snort/screen-map.md` §13 (`SearchPage.tsx:89-108`),
 * with §3 for the pill system and §8.4 for the tab idiom. Upstream is
 * deliberately, almost aggressively bare:
 *
 * ```jsx
 * <div className="px-3 py-2 flex flex-col gap-2">
 *   <input type="search" placeholder={"Search..."} … />
 *   <TabSelectors tabs={SearchTab} … />
 * </div>
 * {content}
 * ```
 *
 * The four things a reproducer habitually gets wrong here:
 *
 *  1. There is **no search icon, no wrapper and no submit button** on this
 *     screen. The magnifier belongs to the right column's SearchBox (§5.4),
 *     which is a different component; the search *page* input is bare. It is
 *     still a full pill, because `.btn, input, select { @apply rounded-full }`
 *     beats the 12px input radius (§3) — `.snort-input` carries that.
 *  2. Exactly **two** tabs, **Notes** (default) then **People**, with no
 *     icons — and they are Snort's rounded `TabSelectors` pills, never an
 *     underline. Snort has no underline tabs anywhere (§8.4).
 *  3. **An empty keyword renders nothing at all** below the tabs — no empty
 *     state, no placeholder, no suggestions. Reproduced verbatim.
 *  4. Results are the ordinary flat divided note list (`NoteCard`, §4), not a
 *     distinct "search result" card. People are `px-3 flex flex-col gap-4`
 *     `FollowListBase` rows rendered with `options:{about:true}`, i.e. the
 *     about/bio line is part of the row.
 *
 * Divergences from upstream, both forced and both narrow:
 *  - Upstream searches relays (`post_keyword`, `LIMIT_UNTIL`) and forwards
 *    `highlightText`, so matched terms get highlighted inside the note body.
 *    Sandstr has no relays and `NoteCard` takes no highlight prop, so we filter
 *    the mock set locally and leave the body untouched.
 *  - Upstream's People tab hits the external `NostrProfiles` API and shows a
 *    `PageSpinner` while it is in flight, merging API hits ahead of local fuzzy
 *    matches. Zero network here by design, so it is local matching only and
 *    there is no spinner state to fake.
 *
 * Filtering is a pure function of the props and the typed query — no
 * `Math.random`, no `Date.now` — so the screen renders identically on every
 * mount and in the frozen-animation preview environment.
 */

export interface SearchScreenProps {
  notes: MockNote[];
  users: MockUser[];
  onViewProfile: (u: MockUser) => void;
  onViewThread: (n: MockNote) => void;
}

type SearchTab = 'notes' | 'people';

/** §13 — the whole tab set. Notes first and default, People second, no icons. */
const TABS: { id: SearchTab; label: string }[] = [
  { id: 'notes', label: 'Notes' },
  { id: 'people', label: 'People' },
];

export function SearchScreen({ notes, users, onViewProfile, onViewThread }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<SearchTab>('notes');

  const term = query.trim().toLowerCase();

  const usersByPubkey = useMemo(() => {
    const m = new Map<string, MockUser>();
    for (const u of users) m.set(u.pubkey, u);
    return m;
  }, [users]);

  // `post_keyword` is a content search upstream, newest-first.
  const matchedNotes = useMemo(() => {
    if (!term) return [];
    return notes
      .filter((n) => n.content.toLowerCase().includes(term))
      .slice()
      .sort((a, b) => b.created_at - a.created_at);
  }, [notes, term]);

  // Local fuzzy match over the fields upstream's profile search covers.
  const matchedPeople = useMemo(() => {
    if (!term) return [];
    return users.filter(
      (u) =>
        u.displayName.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        (u.nip05 ?? '').toLowerCase().includes(term),
    );
  }, [users, term]);

  return (
    <div className="flex flex-col">
      {/* §13 — the entire header block, verbatim geometry. */}
      <div className="flex flex-col gap-2 px-3 py-2">
        <input
          type="search"
          className="snort-input"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search"
        />

        <div className="snort-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`snort-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* §13 — empty keyword renders nothing. Not an empty state: nothing. */}
      {term.length > 0 && tab === 'notes' && (
        <div>
          {matchedNotes.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              author={usersByPubkey.get(n.pubkey)}
              users={users}
              onOpenThread={onViewThread}
              onViewProfile={onViewProfile}
            />
          ))}
        </div>
      )}

      {term.length > 0 && tab === 'people' && (
        <div className="flex flex-col gap-4 px-3">
          {matchedPeople.map((u) => (
            <PersonRow key={u.pubkey} user={u} onViewProfile={onViewProfile} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * A `FollowListBase` row with `options:{about:true}` — 40px `ProfileImage`,
 * display name, nip05 beneath it, then the about text. The row is one single
 * interactive element (no nested buttons), which is also what upstream ends up
 * with once the follow control is absent.
 */
function PersonRow({ user, onViewProfile }: { user: MockUser; onViewProfile: (u: MockUser) => void }) {
  return (
    <button
      type="button"
      className="flex w-full min-w-0 items-start gap-3 text-left"
      onClick={() => onViewProfile(user)}
    >
      <Avatar
        seed={user.username}
        className="h-10 w-10"
        distance={user.isVerified ? 1 : null}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{user.displayName}</div>
        {user.nip05 && <Nip05 nip05={user.nip05} verified={user.isVerified !== false} />}
        {user.bio && (
          <div className="mt-0.5 truncate text-sm" style={{ color: 'var(--snort-text-secondary)' }}>
            {user.bio}
          </div>
        )}
      </div>
    </button>
  );
}

/**
 * nip05 (`Components/User/Nip05.tsx`, §4.2): neutral-400, halved opacity while
 * unverified, and the DOMAIN carries the signature gradient only when it is the
 * first-party one. There is no green check anywhere — verification is conveyed
 * by the absence of the failure marker.
 */
function Nip05({ nip05, verified }: { nip05: string; verified: boolean }) {
  const [name, domain] = nip05.includes('@') ? nip05.split('@') : ['', nip05];
  const firstParty = domain === 'snort.social';
  return (
    <div className={`truncate text-xs ${verified ? '' : 'opacity-50'}`} style={{ color: '#a3a3a3' }}>
      {name && name !== '_' && <span>{name}@</span>}
      <span className={firstParty && verified ? 'snort-gradient-text' : undefined}>{domain}</span>
    </div>
  );
}

export default SearchScreen;
