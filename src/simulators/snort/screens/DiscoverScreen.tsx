import { useMemo, useState } from 'react';
import type { MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { Icon, type IconName } from '../components/Icon';
import { seededUnit, shortNpub } from '../snortUtils';

/**
 * Snort — Discover (`/discover`).
 *
 * Rebuilt from `docs/refs/snort/screen-map.md` §7, which describes the surface
 * the owner's recording captured, plus §8.4 for the tab idiom it shares with
 * the profile page. The things a reproducer gets wrong here:
 *
 *  1. **There is no underline tab row anywhere in Snort.** Discover is reached
 *     from the sidebar (NOT from the home feed dropdown) and uses the shared
 *     pill `TabSelectors` (§8.4): a horizontally scrollable, scrollbar-hidden
 *     row of fully-rounded pills, base `layer-1` + border, **active =
 *     `bg-layer-3`** (`neutral-700` dark / `neutral-400` light). That is
 *     `.snort-tabs` / `.snort-tab` / `.snort-tab.active` in the theme file.
 *     Each tab carries a 16px leading icon, exactly as the profile tabs do.
 *  2. **Below the pills: a description line, then a `rounded-full` "Search
 *     sets…" input** (§7) — inputs are pills in Snort (`.btn, input, select {
 *     @apply rounded-full }` overriding the 12px radius), so `.snort-input`,
 *     never a textarea radius.
 *  3. **Accent discipline** (§1): the Follow pill is `.secondary`, never the
 *     orange `--primary`, which is compose/CTA only. In LIGHT mode the
 *     `.light button` specificity trap (§3.1) deliberately renders it as a
 *     white bordered pill with slate-blue text — that is correct, not a bug.
 *  4. Follow-list rows follow `FollowListBase` geometry (§8.4): a `px-3 py-2
 *     flex flex-col gap-1` column of avatar + name + nip05 rows, no dividers
 *     and no card. nip05 gets the `Nip05` treatment from §4.2 — neutral text,
 *     `opacity-50` while unverified, the signature gradient on a verified
 *     first-party domain, a red `x` on failure, and **never a green check**.
 *
 * Everything is deterministic: per-tab ordering comes from `followersCount` and
 * `seededUnit`, never `Math.random()` or `Date.now()`, so the list renders
 * identically on every mount and in the frozen-animation preview environment.
 * Following a profile flips its avatar's `FollowDistanceIndicator` (§4.2) to
 * the green distance-1 check.
 */

export interface DiscoverScreenProps {
  users: MockUser[];
  onViewProfile: (u: MockUser) => void;
}

interface DiscoverTab {
  id: string;
  label: string;
  icon: IconName;
  /** The gray line under the pills (§7). */
  description: string;
}

/**
 * §7 — the pill order the recording shows, left to right. The row scrolls
 * horizontally rather than wrapping, so the trailing tabs stay reachable in a
 * narrow center column.
 */
const TABS: DiscoverTab[] = [
  {
    id: 'popular',
    label: 'Popular',
    icon: 'fire',
    description: 'Profiles a lot of people are following right now.',
  },
  {
    id: 'followed-by-friends',
    label: 'Followed By Friends',
    icon: 'user-v2',
    description: 'Profiles followed by the people you already follow.',
  },
  {
    id: 'follow-sets',
    label: 'Follow Sets',
    icon: 'stars',
    description: 'Curated lists of profiles published by other people.',
  },
  {
    id: 'suggested-follows',
    label: 'Suggested Follows',
    icon: 'lightbulb',
    description: 'Suggestions worked out from your follow graph.',
  },
  {
    id: 'global-trending',
    label: 'Global Trending',
    icon: 'bar-chart',
    description: 'Trending across every relay this client is connected to.',
  },
];

/** How many rows a tab shows. Long enough to scroll, short enough to scan. */
const ROWS = 12;

/**
 * Per-tab source. Each branch sorts a COPY, so the `users` prop is never
 * mutated, and every ordering is a pure function of stable profile fields —
 * switching tabs visibly reshuffles the list and switching back reproduces it.
 */
function selectUsers(tabId: string, users: MockUser[]): MockUser[] {
  const all = [...users];

  switch (tabId) {
    case 'followed-by-friends':
      // A stable "friends of friends" slice, then alphabetical.
      return all
        .filter((u) => seededUnit(`fof:${u.pubkey}`) > 0.35)
        .sort((a, b) => a.displayName.localeCompare(b.displayName))
        .slice(0, ROWS);

    case 'follow-sets':
      // Sets are published by smaller accounts, so this leans the other way.
      return all
        .filter((u) => seededUnit(`set:${u.pubkey}`) > 0.4)
        .sort((a, b) => a.followersCount - b.followersCount)
        .slice(0, ROWS);

    case 'suggested-follows':
      return all
        .sort((a, b) => seededUnit(`suggest:${a.pubkey}`) - seededUnit(`suggest:${b.pubkey}`))
        .slice(0, ROWS);

    case 'global-trending':
      // Reach weighted by a stable per-profile factor: the same population as
      // Popular, in a demonstrably different order.
      return all
        .sort(
          (a, b) =>
            b.followersCount * (0.25 + seededUnit(`trend:${b.pubkey}`)) -
            a.followersCount * (0.25 + seededUnit(`trend:${a.pubkey}`)),
        )
        .slice(0, ROWS);

    case 'popular':
    default:
      return all.sort((a, b) => b.followersCount - a.followersCount).slice(0, ROWS);
  }
}

export function DiscoverScreen({ users, onViewProfile }: DiscoverScreenProps) {
  const [tabId, setTabId] = useState<string>(TABS[0].id);
  const [query, setQuery] = useState('');
  const [followed, setFollowed] = useState<ReadonlySet<string>>(() => new Set<string>());

  const activeTab = TABS.find((t) => t.id === tabId) ?? TABS[0];

  const listed = useMemo(() => {
    const picked = selectUsers(tabId, users);
    const q = query.trim().toLowerCase();
    if (!q) return picked;
    return picked.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.nip05 ?? '').toLowerCase().includes(q),
    );
  }, [tabId, users, query]);

  const toggleFollow = (pubkey: string) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(pubkey)) next.delete(pubkey);
      else next.add(pubkey);
      return next;
    });
  };

  return (
    <div className="flex flex-col pb-8" data-tour="snort-discover">
      {/* ---- §8.4 the shared pill TabSelectors — gutter px-3 py-2 ---- */}
      <div className="px-3 py-2">
        <div className="snort-tabs" role="tablist" aria-label="Discover">
          {TABS.map((t) => {
            const active = t.id === activeTab.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`snort-tab ${active ? 'active' : ''}`}
                onClick={() => setTabId(t.id)}
              >
                <Icon name={t.icon} size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* §7 — the description line, then the pill search input. */}
        <p className="mt-1 text-sm" style={{ color: 'var(--snort-text-secondary)' }}>
          {activeTab.description}
        </p>

        <div className="mt-3">
          <input
            className="snort-input"
            type="text"
            value={query}
            aria-label="Search sets"
            placeholder="Search sets…"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ---- §8.4 FollowListBase geometry: px-3 py-2, flex-col gap-1 ---- */}
      <div className="flex flex-col gap-1 px-3 py-2">
        {listed.length === 0 ? (
          <div className="snort-muted py-10 text-center text-sm">
            Nothing matches &ldquo;{query.trim()}&rdquo;.
          </div>
        ) : (
          listed.map((u) => {
            const isFollowing = followed.has(u.pubkey);
            return (
              <div key={u.pubkey} className="flex items-center gap-3 py-1">
                {/* A span, not a button: it sits next to the Follow button and
                    must never nest one interactive element inside another. */}
                <span
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProfile(u);
                  }}
                >
                  <Avatar
                    seed={u.username || u.pubkey}
                    className="h-10 w-10"
                    distance={isFollowing ? 1 : null}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium hover:underline">
                      {u.displayName || shortNpub(u.pubkey)}
                    </span>
                    {u.nip05 ? (
                      <Nip05 nip05={u.nip05} verified={u.isVerified !== false} />
                    ) : (
                      <span className="block truncate text-xs text-neutral-400">
                        {shortNpub(u.pubkey)}
                      </span>
                    )}
                  </span>
                </span>

                {/* Never `.primary` — orange is compose/CTA only (§1). */}
                <button
                  type="button"
                  className="snort-btn secondary shrink-0"
                  aria-pressed={isFollowing}
                  onClick={() => toggleFollow(u.pubkey)}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * nip05 (§4.2, `Components/User/Nip05.tsx`): neutral text, `opacity-50` while
 * unverified, `_@domain` hides the `_@`, the DOMAIN gets the signature gradient
 * when it is the first-party one, and a red `x` is appended on failure. There
 * is no green check — only the failure badge exists.
 */
function Nip05({ nip05, verified }: { nip05: string; verified: boolean }) {
  const [name, domain] = nip05.includes('@') ? nip05.split('@') : ['', nip05];
  const firstParty = domain === 'snort.social';
  return (
    <span
      className={`flex items-center text-xs font-normal text-neutral-400 ${
        verified ? '' : 'opacity-50'
      }`}
    >
      <span className="truncate">
        {name && name !== '_' && `${name}@`}
        <span className={firstParty && verified ? 'snort-gradient-text' : undefined}>{domain}</span>
      </span>
      {!verified && (
        <span className="ml-0.5 shrink-0" style={{ color: 'var(--snort-error)' }}>
          <Icon name="x" size={13} strokeWidth={2.5} />
        </span>
      )}
    </span>
  );
}

export default DiscoverScreen;
