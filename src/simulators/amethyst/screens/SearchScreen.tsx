import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check, Search, SlidersHorizontal, X } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { MaterialCard, PostData } from '../components/MaterialCard';
import { mockNotes, mockRelays, mockUsers } from '../../../data/mock';
import type { MockUser } from '../../../data/mock';
import { toPostData } from '../notesToPosts';
import '../amethyst.theme.css';

/**
 * Search — upstream `Route.Search` (`screen/loggedIn/search/SearchScreen.kt`),
 * the destination of the app bar's magnifier.
 *
 * [REC vs REPO] the reference recording never opens this screen, so everything
 * here is read off the v1.13.1 source, not off a frame. What the source gives:
 *
 * - The top bar is NOT a Material TopAppBar: it is a plain Column on
 *   `surface` holding (1) a `TextField` with `RoundedCornerShape(25.dp)`, a
 *   20dp leading SearchIcon tinted `placeholderText`, the placeholder string
 *   `npub_hex_username` = "npub, username, text", a trailing clear button while
 *   a query is present, and transparent focus indicators; and (2) a filter row
 *   (`padding(horizontal = 10.dp, vertical = 4.dp)`, `spacedBy(8.dp)`) with a
 *   `SingleChoiceSegmentedButtonRow` of All / People / Notes taking the weight
 *   and a `Tune` icon button that opens the filters sheet. The Tune button
 *   carries an 8dp `primary` dot when any filter is off its default.
 * - Results are one `LazyColumn`: hashtag lines, then users, then relays, then
 *   channels, then notes, each block separated by hairline dividers. Nothing is
 *   rendered at all while the field is blank (`if (!isRefreshing) return`).
 * - Scope gating, verbatim from `SearchBarViewModel`: hashtags and notes are
 *   skipped for PEOPLE, users are skipped for NOTES, and relays/channels are
 *   ALL-only (relays additionally need a term longer than one character).
 * - The bottom bar hides itself here (`AppBottomBar` returns early on
 *   `nav.canPop()`), which is why the simulator hides it for this tab too.
 *
 * Two deliberate deviations, both recorded in docs/gaps/amethyst.md:
 * 1. The back arrow. Upstream's search header has none — you leave with the
 *    Android system back. The phone frame has no system back, so a screen
 *    without one would be a trap; the arrow uses the same `ArrowBackIcon` slot
 *    every other pushed Amethyst screen puts there.
 * 2. Source (Local/Relays) selects and lights the filter badge but cannot
 *    change results: this simulator makes no network requests, so "relays" and
 *    "local" are the same mock cache.
 */

type Scope = 'all' | 'people' | 'notes';
type Source = 'local' | 'relays';
type Sort = 'relevance' | 'newest' | 'popular';

const SCOPES: { id: Scope; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'people', label: 'People' },
  { id: 'notes', label: 'Notes' },
];

// SearchSortOrder.EVENT_OPTIONS, in order; EVENT_DEFAULT = NEWEST.
const SORTS: { id: Sort; label: string }[] = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'newest', label: 'Newest' },
  { id: 'popular', label: 'Popular' },
];

interface SearchScreenProps {
  onBack: () => void;
  onOpenThread?: (post: PostData) => void;
  /** A user result opens that profile (gaps ame-146). */
  onOpenProfile?: (user: MockUser) => void;
  /** A hashtag result opens that hashtag's feed (gaps ame-82). */
  onOpenHashtag?: (tag: string) => void;
}

/** `ShowFollowingOrUnfollowingButton` — the trailing slot of a user result. */
function FollowPill() {
  const [following, setFollowing] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setFollowing((v) => !v)}
      aria-pressed={following}
      className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium"
      style={
        following
          ? { border: '1px solid var(--md-outline)', color: 'var(--md-on-surface)' }
          : { background: 'var(--md-primary)', color: 'var(--md-on-primary)' }
      }
    >
      {following ? 'Unfollow' : 'Follow'}
    </button>
  );
}

export function SearchScreen({ onBack, onOpenThread, onOpenProfile, onOpenHashtag }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [source, setSource] = useState<Source>('relays');
  const [followsOnly, setFollowsOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // hasNonDefaultFilters(): DEFAULT_SOURCE is RELAYS, follows-only is off, and
  // the sort only counts outside the People scope.
  const hasNonDefaultFilters =
    source !== 'relays' || followsOnly || (scope !== 'people' && sort !== 'newest');

  const term = query.trim().toLowerCase();

  // "Follows" in a simulator with no social graph = the authors whose notes the
  // account's own feed is built from. That is the same set upstream filters by
  // (`follows.authorsPlusMe`), just derived from the mock feed instead of a
  // kind-3 list.
  const follows = useMemo(
    () => new Set(mockNotes.slice(0, 20).map((n) => n.pubkey)),
    [],
  );

  const hashtags = useMemo(() => {
    if (!term || scope === 'people') return [];
    const all = new Set<string>();
    for (const note of mockNotes) {
      for (const tag of note.hashtags || []) {
        if (tag.toLowerCase().includes(term)) all.add(tag.toLowerCase());
      }
    }
    return [...all].slice(0, 5);
  }, [term, scope]);

  const users = useMemo(() => {
    if (!term || scope === 'notes') return [];
    const hit = mockUsers.filter(
      (u) =>
        u.displayName.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        (u.nip05 || '').toLowerCase().includes(term),
    );
    return (followsOnly ? hit.filter((u) => follows.has(u.pubkey)) : hit).slice(0, 12);
  }, [term, scope, followsOnly, follows]);

  // Relays are ALL-only and need more than one character (`term.length > 1`).
  const relays = useMemo(() => {
    if (scope !== 'all' || term.length < 2) return [];
    return mockRelays.filter((r) => r.url.toLowerCase().includes(term)).slice(0, 8);
  }, [term, scope]);

  const notes = useMemo(() => {
    if (!term || scope === 'people') return [];
    const hit = mockNotes.filter((n) => n.content.toLowerCase().includes(term));
    const scoped = followsOnly ? hit.filter((n) => follows.has(n.pubkey)) : hit;
    const sorted = [...scoped];
    if (sort === 'popular') sorted.sort((a, b) => b.zapAmount - a.zapAmount || b.created_at - a.created_at);
    else sorted.sort((a, b) => b.created_at - a.created_at);
    // A search hit is not a follow by construction the way a Home note is, so
    // the avatar's "Following" shield is decided per author.
    return sorted.slice(0, 12).map((n) => toPostData(n, { following: follows.has(n.pubkey) }));
  }, [term, scope, followsOnly, sort, follows]);

  const Divider = () => (
    <div className="h-px" style={{ background: 'var(--amethyst-feed-divider)' }} />
  );

  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]" data-tour="amethyst-search">
      {/* Header: a plain Column on `surface`, not a TopAppBar. */}
      <div className="shrink-0 bg-[var(--md-surface)]">
        <div className="p-2.5 flex items-center gap-1">
          {/* Simulator-only: the phone frame has no Android system back. */}
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="md-app-bar-icon-btn shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--md-on-surface)]" />
          </button>

          <div
            className="flex-1 min-w-0 flex items-center gap-2 px-4 py-3 rounded-[25px]"
            style={{ background: 'var(--md-surface-container-highest)' }}
          >
            <Search className="w-5 h-5 shrink-0 text-[var(--amethyst-placeholder)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="npub, username, text"
              aria-label="Search"
              data-tour="amethyst-search-field"
              className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-[var(--md-on-surface)] placeholder:text-[var(--amethyst-placeholder)]"
            />
            {query.length > 0 && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear" className="shrink-0">
                <X className="w-5 h-5 text-[var(--md-on-surface-variant)]" />
              </button>
            )}
          </div>
        </div>

        {/* Filter row: scope segments + the Tune button with its badge. */}
        <div className="px-2.5 py-1 flex items-center gap-2">
          <div
            className="flex-1 flex rounded-full overflow-hidden"
            role="group"
            aria-label="Search scope"
            style={{ border: '1px solid var(--md-outline)' }}
          >
            {SCOPES.map((s) => {
              const selected = scope === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScope(s.id)}
                  aria-pressed={selected}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-sm"
                  style={{
                    background: selected ? 'var(--md-secondary-container)' : 'transparent',
                    color: selected ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface)',
                  }}
                >
                  {selected && <Check className="w-4 h-4" />}
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-label="Filters"
              data-tour="amethyst-search-filters"
              className="md-app-bar-icon-btn"
            >
              <SlidersHorizontal className="w-5 h-5 text-[var(--md-on-surface)]" />
            </button>
            {hasNonDefaultFilters && (
              <span
                aria-hidden
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: 'var(--md-primary)' }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Results. Blank until something is typed — upstream renders no result
          block at all while the field is empty. */}
      <div className="flex-1 overflow-y-auto">
        {/* `HashtagLine`: bold, centred, `Search hashtag: #%1$s`, and it really
            navigates to Route.Hashtag now that the feed exists. */}
        {hashtags.map((tag) => (
          <div key={`#${tag}`}>
            <button
              type="button"
              onClick={() => onOpenHashtag?.(tag)}
              className="w-full px-3 py-2.5 text-center font-bold text-[var(--md-on-surface)]"
            >
              Search hashtag: #{tag}
            </button>
            <Divider />
          </div>
        ))}

        {/* `UserCompose`: 55dp picture, name, one-line "about" in
            placeholderText, trailing Follow/Unfollow + list buttons. The row
            opens that profile, as it does upstream — ProfileScreen took a
            hardcoded subject when this screen was written and takes a `user`
            now (gaps ame-57). */}
        {users.map((u) => (
          <div key={u.pubkey}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => onOpenProfile?.(u)}
              onKeyDown={(e) => { if (e.key === 'Enter') onOpenProfile?.(u); }}
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer">
              <Avatar seed={u.nip05 || u.username} className="md-avatar shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="block font-semibold text-[var(--md-on-surface)] truncate">
                  {u.displayName}
                </span>
                <span className="block text-sm truncate" style={{ color: 'var(--amethyst-placeholder)' }}>
                  {u.bio}
                </span>
              </div>
              <FollowPill />
            </div>
            <Divider />
          </div>
        ))}

        {relays.map((r) => (
          <div key={r.id} className="px-3 py-2.5 flex items-center gap-3">
            <span
              className="w-9 h-9 shrink-0 rounded-full"
              style={{ background: 'linear-gradient(135deg, var(--md-primary), var(--md-secondary))' }}
              aria-hidden
            />
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] text-[var(--md-on-surface)] truncate">
                {r.url.replace(/^wss:\/\//, '')}
              </span>
              <span className="block text-xs truncate" style={{ color: 'var(--amethyst-placeholder)' }}>
                {r.description}
              </span>
            </span>
          </div>
        ))}

        {notes.map((post) => (
          <MaterialCard key={post.id} post={post} onOpenThread={() => onOpenThread?.(post)} />
        ))}
      </div>

      {/* Filters — upstream `ModalBottomSheet` with skipPartiallyExpanded. */}
      {filtersOpen && (
        <div className="absolute inset-0 z-[130] flex items-end" onClick={() => setFiltersOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-label="Filters"
            className="relative w-full rounded-t-3xl px-5 pt-4 pb-6 space-y-5 max-h-[80%] overflow-y-auto"
            style={{ background: 'var(--md-surface-container-high)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-medium text-[var(--md-on-surface)]">Filters</p>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--md-on-surface)]">Source</p>
              <div
                className="flex rounded-full overflow-hidden"
                role="group"
                aria-label="Source"
                style={{ border: '1px solid var(--md-outline)' }}
              >
                {(['local', 'relays'] as Source[]).map((s) => {
                  const selected = source === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSource(s)}
                      aria-pressed={selected}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-sm capitalize"
                      style={{
                        background: selected ? 'var(--md-secondary-container)' : 'transparent',
                        color: selected ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface)',
                      }}
                    >
                      {selected && <Check className="w-4 h-4" />}
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFollowsOnly((v) => !v)}
              aria-pressed={followsOnly}
              className="w-full flex items-center py-1 text-left"
            >
              <span className="flex-1 text-[var(--md-on-surface)]">Follows only</span>
              <span
                className="w-12 h-7 rounded-full p-0.5 flex items-center transition-colors"
                style={{
                  background: followsOnly ? 'var(--md-primary)' : 'transparent',
                  border: followsOnly ? 'none' : '2px solid var(--md-outline)',
                  justifyContent: followsOnly ? 'flex-end' : 'flex-start',
                }}
              >
                <span
                  className="rounded-full"
                  style={{
                    width: followsOnly ? 24 : 16,
                    height: followsOnly ? 24 : 16,
                    margin: followsOnly ? 0 : 4,
                    background: followsOnly ? 'var(--md-on-primary)' : 'var(--md-outline)',
                  }}
                />
              </span>
            </button>

            {/* The sort block is hidden in the People scope. */}
            {scope !== 'people' && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-[var(--md-on-surface)]">Sort by</p>
                {SORTS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSort(o.id)}
                    aria-pressed={sort === o.id}
                    className="w-full flex items-center gap-2 py-2 text-left"
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        border: `2px solid ${sort === o.id ? 'var(--md-primary)' : 'var(--md-outline)'}`,
                      }}
                    >
                      {sort === o.id && (
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: 'var(--md-primary)' }}
                        />
                      )}
                    </span>
                    <span className="text-[var(--md-on-surface)]">{o.label}</span>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setSource('relays');
                setFollowsOnly(false);
                setSort('newest');
              }}
              className="text-sm font-medium"
              style={{ color: 'var(--md-primary)' }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
