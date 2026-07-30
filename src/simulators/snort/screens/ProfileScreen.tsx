import React, { useCallback, useMemo, useState } from 'react';
import { mockRelays } from '../../../data/mock';
import type { MockNote, MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { NoteCard, NoteText } from '../components/NoteCard';
import { formatShort, noteImages, seededUnit } from '../snortUtils';

/**
 * Snort — profile.
 *
 * Rebuilt from `docs/refs/snort/screen-map.md` §8 (`ProfilePage.tsx`,
 * `AvatarSection.tsx`, `ProfileDetails.tsx`, `FollowedBy.tsx`,
 * `TabSelectors.tsx`), read together with the owner's 2026-07-14 recording.
 * The things the previous version of this screen got wrong:
 *
 *  - **There is no stat row.** §8.3: no following/followers/notes/relays counts
 *    exist anywhere in the profile header — the strings live in
 *    `Components/messages.ts` but are referenced by no file under
 *    `Pages/Profile/`. Social proof (`FollowedBy`) is what sits where a Twitter
 *    clone would put counts. Counts are only reachable inside the tabs.
 *  - **The banner/avatar overlap is `-mb-6` on the banner and nothing else** —
 *    no ring, no border, no z-index juggling, and if there is no banner nothing
 *    renders at all (§8.1).
 *  - **Action order is QR → zap → envelope → mute → Follow**, with the mute
 *    button forced red (`!bg-error`) so it survives the light-mode specificity
 *    trap of §3.1 — in light mode it and `.primary` are the only coloured
 *    controls on the whole page.
 *  - **Tabs are rounded pills, never underlines** (§8.4). Active = `bg-layer-3`.
 *
 * Everything is deterministic: avatars are locally drawn, the banner is a
 * bundled `data:` URI via `noteImages`, and every "random" choice comes from
 * `seededUnit`, so a given profile always renders identically.
 */

export interface ProfileScreenProps {
  user: MockUser | null;
  currentUser: MockUser | null;
  notes: MockNote[];
  users: MockUser[];
  onViewProfile: (u: MockUser) => void;
  onViewThread: (n: MockNote) => void;
  onMessage: () => void;
}

type ProfileTab =
  | 'notes'
  | 'reactions'
  | 'followers'
  | 'follows'
  | 'zaps'
  | 'relays'
  | 'bookmarks'
  | 'muted';

interface TabDef {
  id: ProfileTab;
  label: string;
  icon: IconName;
  /** `svg.heart-solid` / `svg.zap-solid` are globally tinted in real Snort. */
  tint?: string;
}

/** §8.4 — `ProfilePage.tsx:164-176`, in this exact order, 16px leading icons. */
const TABS: TabDef[] = [
  { id: 'notes', label: 'Notes', icon: 'pencil' },
  { id: 'reactions', label: 'Reactions', icon: 'heart-solid', tint: 'var(--snort-heart)' },
  { id: 'followers', label: 'Followers', icon: 'user-v2' },
  // The label is "Follows", not "Following".
  { id: 'follows', label: 'Follows', icon: 'stars' },
  { id: 'zaps', label: 'Zaps', icon: 'zap-solid', tint: 'var(--snort-zap)' },
  { id: 'relays', label: 'Relays', icon: 'wifi' },
  { id: 'bookmarks', label: 'Bookmarks', icon: 'bookmark-solid' },
];

/** Own profile only, appended last. */
const MUTED_TAB: TabDef = { id: 'muted', label: 'Muted', icon: 'mute' };

/** `hostname + pathname`, the way `ProfileDetails` strips a website label. */
function websiteLabel(raw: string): string {
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    return `${url.hostname}${url.pathname}`;
  } catch {
    return raw;
  }
}

export function ProfileScreen({
  user,
  currentUser,
  notes,
  users,
  onViewProfile,
  onViewThread,
  onMessage,
}: ProfileScreenProps) {
  const [tab, setTab] = useState<ProfileTab>('notes');
  const [following, setFollowing] = useState(false);
  const [muted, setMuted] = useState(false);
  const [rowFollows, setRowFollows] = useState<Record<string, boolean>>({});
  const [unmuted, setUnmuted] = useState<Record<string, boolean>>({});

  const pubkey = user?.pubkey ?? '';
  const isMe = !!user && !!currentUser && user.pubkey === currentUser.pubkey;

  const usersByPubkey = useMemo(() => {
    const m = new Map<string, MockUser>();
    users.forEach((u) => m.set(u.pubkey, u));
    return m;
  }, [users]);

  /** Everyone but the profile owner — the pool for follows/zappers/mutes. */
  const others = useMemo(() => users.filter((u) => u.pubkey !== pubkey), [users, pubkey]);

  // The feed caps display at ~25 notes, as every other simulator here does.
  const authorNotes = useMemo(
    () => notes.filter((n) => n.pubkey === pubkey).slice(0, 25),
    [notes, pubkey],
  );

  const foreignNotes = useMemo(() => notes.filter((n) => n.pubkey !== pubkey), [notes, pubkey]);

  /**
   * §8.3 — `FollowedBy` replaces the stat row: up to three linked names plus
   * "and {count} others you follow", or "Not followed by anyone you follow".
   */
  const followedBy = useMemo(
    () => others.filter((o) => seededUnit(`followedby:${pubkey}:${o.pubkey}`) > 0.42),
    [others, pubkey],
  );
  const namedFollowers = followedBy.slice(0, 3);
  const otherFollowerCount = Math.max(0, followedBy.length - namedFollowers.length);

  /** The lowercase "follows you" chip — never on your own profile. */
  const followsYou = !isMe && seededUnit(`followsyou:${pubkey}`) > 0.35;

  /**
   * §8.1 — the banner is a real image or nothing at all. `noteImages` hands back
   * a bundled `data:` URI and memoises it per key, so this never flickers and
   * never touches the network.
   */
  const banner = useMemo(() => noteImages(`snort-banner:${pubkey}`, 1)[0], [pubkey]);

  const followerList = useMemo(
    () => others.filter((o) => seededUnit(`followers:${pubkey}:${o.pubkey}`) > 0.3),
    [others, pubkey],
  );
  const followsList = useMemo(
    () => others.filter((o) => seededUnit(`follows:${pubkey}:${o.pubkey}`) > 0.25),
    [others, pubkey],
  );

  const reactedNotes = useMemo(
    () => foreignNotes.filter((n) => seededUnit(`reacted:${pubkey}:${n.id}`) > 0.72).slice(0, 8),
    [foreignNotes, pubkey],
  );

  const bookmarkedNotes = useMemo(
    () => foreignNotes.filter((n) => seededUnit(`bookmark:${pubkey}:${n.id}`) > 0.8).slice(0, 4),
    [foreignNotes, pubkey],
  );

  const zapRows = useMemo(
    () =>
      others
        .filter((o) => seededUnit(`zapped:${pubkey}:${o.pubkey}`) > 0.35)
        .slice(0, 6)
        .map((o) => ({
          user: o,
          amount: 21 + Math.round(seededUnit(`zapamt:${pubkey}:${o.pubkey}`) * 4979),
        })),
    [others, pubkey],
  );
  const zapTotal = zapRows.reduce((sum, r) => sum + r.amount, 0);

  const mutedList = useMemo(
    () => others.filter((o) => seededUnit(`muted:${pubkey}:${o.pubkey}`) > 0.82).slice(0, 3),
    [others, pubkey],
  );

  const toggleRowFollow = useCallback((key: string) => {
    setRowFollows((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const followAll = useCallback((list: MockUser[]) => {
    setRowFollows((prev) => {
      const next = { ...prev };
      list.forEach((u) => {
        next[u.pubkey] = true;
      });
      return next;
    });
  }, []);

  if (!user) {
    return (
      <div className="snort-profile" data-tour="snort-profile">
        <div className="snort-muted px-4 py-10 text-center">No profile selected.</div>
      </div>
    );
  }

  const tabs = isMe ? [...TABS, MUTED_TAB] : TABS;

  /** A follow-list page: `px-3 py-2 flex flex-col gap-1`, "Follow All", paging. */
  const renderFollowList = (list: MockUser[]) => (
    <div className="flex flex-col gap-1 px-3 py-2">
      <div className="flex items-center justify-end pb-1">
        <button type="button" className="snort-btn transparent" onClick={() => followAll(list)}>
          Follow All
        </button>
      </div>

      {list.length === 0 ? (
        <div className="snort-muted py-6 text-center text-sm">Nothing here yet.</div>
      ) : (
        list.map((u) => (
          <div key={u.pubkey} className="flex items-center gap-3 py-1">
            <span className="cursor-pointer" onClick={() => onViewProfile(u)}>
              <Avatar seed={u.username} className="h-10 w-10" distance={u.isVerified ? 1 : null} />
            </span>
            <div className="min-w-0 flex-1">
              <div
                className="cursor-pointer truncate font-medium hover:underline"
                onClick={() => onViewProfile(u)}
              >
                {u.displayName}
              </div>
              {u.nip05 && <div className="truncate text-xs text-neutral-400">{u.nip05}</div>}
            </div>
            <button
              type="button"
              className="snort-btn secondary"
              onClick={() => toggleRowFollow(u.pubkey)}
            >
              {rowFollows[u.pubkey] ? 'Unfollow' : 'Follow'}
            </button>
          </div>
        ))
      )}

      {/* Upstream's pager string, verbatim in shape. */}
      <div className="snort-muted pt-2 text-center text-sm">
        Page 1 of 1 ({list.length} items)
      </div>
    </div>
  );

  const body = (() => {
    switch (tab) {
      case 'notes':
        return authorNotes.length === 0 ? (
          <div className="snort-muted px-3 py-10 text-center text-sm">No notes yet.</div>
        ) : (
          <div>
            {authorNotes.map((n) => (
              <NoteCard
                key={n.id}
                note={n}
                author={user}
                users={users}
                onOpenThread={onViewThread}
                onViewProfile={onViewProfile}
              />
            ))}
          </div>
        );

      case 'reactions':
        return reactedNotes.length === 0 ? (
          <div className="snort-muted px-3 py-10 text-center text-sm">No reactions yet.</div>
        ) : (
          <div className="flex flex-col">
            {reactedNotes.map((n) => {
              const author = usersByPubkey.get(n.pubkey);
              return (
                <button
                  key={n.id}
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2 text-left"
                  style={{ borderBottom: '1px solid var(--snort-border)' }}
                  onClick={() => onViewThread(n)}
                >
                  <span style={{ color: 'var(--snort-heart)' }} className="shrink-0">
                    <Icon name="heart-solid" size={16} />
                  </span>
                  <Avatar seed={author?.username ?? n.pubkey} className="h-6 w-6" />
                  <span className="shrink-0 text-sm font-medium">
                    {author?.displayName ?? 'unknown'}
                  </span>
                  <span className="snort-muted min-w-0 flex-1 truncate text-sm">{n.content}</span>
                </button>
              );
            })}
          </div>
        );

      case 'followers':
        return renderFollowList(followerList);

      case 'follows':
        return renderFollowList(followsList);

      case 'zaps':
        return (
          <div className="flex flex-col">
            <div className="px-3 py-2 text-2xl font-medium">
              Profile Zaps{' '}
              <span style={{ color: 'var(--snort-zap)' }}>{formatShort(zapTotal)}</span>
            </div>
            {zapRows.length === 0 ? (
              <div className="snort-muted px-3 py-6 text-center text-sm">No zaps yet.</div>
            ) : (
              <div className="flex flex-col gap-1 px-1 pb-2">
                {zapRows.map((row) => (
                  <div
                    key={row.user.pubkey}
                    className="flex items-center justify-between rounded-lg px-4 py-1"
                  >
                    <span
                      className="flex min-w-0 cursor-pointer items-center gap-2"
                      onClick={() => onViewProfile(row.user)}
                    >
                      <Avatar seed={row.user.username} className="h-6 w-6" />
                      <span className="truncate text-sm font-medium">
                        {row.user.displayName}
                      </span>
                    </span>
                    <span
                      className="flex shrink-0 items-center gap-1 text-sm font-medium"
                      style={{ color: 'var(--snort-zap)' }}
                    >
                      <Icon name="zap-solid" size={14} />
                      {formatShort(row.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'relays':
        return (
          <div className="flex flex-col gap-1 px-3 py-2">
            {mockRelays.slice(0, 6).map((relay) => (
              <div key={relay.id} className="snort-layer-1 flex items-center gap-2">
                {/* Upstream shows a `RelayFavicon` here; a favicon is a remote
                    request, so the relay glyph stands in for it. */}
                <span className="shrink-0">
                  <Icon name="relay" size={16} />
                </span>
                <code className="min-w-0 flex-1 truncate text-sm">{relay.url}</code>
                <span className="shrink-0 text-sm font-medium">R</span>
                <span className="shrink-0 text-sm font-medium">W</span>
              </div>
            ))}
          </div>
        );

      case 'bookmarks':
        return bookmarkedNotes.length === 0 ? (
          <div className="snort-muted px-3 py-10 text-center text-sm">No bookmarks yet.</div>
        ) : (
          <div>
            {bookmarkedNotes.map((n) => (
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
        );

      case 'muted':
        return (
          <div className="flex flex-col gap-1 px-3 py-2">
            {mutedList.length === 0 ? (
              <div className="snort-muted py-10 text-center text-sm">
                You haven&apos;t muted anyone.
              </div>
            ) : (
              mutedList.map((u) => (
                <div key={u.pubkey} className="flex items-center gap-3 py-1">
                  <Avatar seed={u.username} className="h-10 w-10" />
                  <div className="min-w-0 flex-1 truncate font-medium">{u.displayName}</div>
                  <button
                    type="button"
                    className="snort-btn secondary"
                    onClick={() => setUnmuted((p) => ({ ...p, [u.pubkey]: !p[u.pubkey] }))}
                  >
                    {unmuted[u.pubkey] ? 'Mute' : 'Unmute'}
                  </button>
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  })();

  return (
    <div className="snort-profile" data-tour="snort-profile">
      {/* §8.1 — banner requested at min(width, 940)px, capped at 200px tall, and
          overlapped by the avatar through this `-mb-6` and nothing else. */}
      <img src={banner} alt="" className="-mb-6 max-h-[200px] w-full object-cover" />

      <div className="px-4">
        {/* ---- AvatarSection (§8.2) ---- */}
        <div className="flex justify-between gap-2">
          <Avatar
            seed={user.username}
            className="h-[100px] w-[100px]"
            distance={isMe ? 0 : following ? 1 : null}
          />

          <div className="flex items-center gap-2">
            {/* 1. QR — always shown, on your own profile too. */}
            <button type="button" className="snort-btn icon" aria-label="Profile QR code">
              <Icon name="qr" size={16} />
            </button>

            {isMe ? (
              /* 2. Your own profile: a single "Edit" button, no zap/DM/mute/follow. */
              <button type="button" className="snort-btn secondary">
                Edit
              </button>
            ) : (
              <>
                {/* 3. zap — only when the profile advertises an lnurl. */}
                {user.lightningAddress && (
                  <button type="button" className="snort-btn icon" aria-label="Zap">
                    <Icon name="zap" size={16} />
                  </button>
                )}

                {/* envelope → the DM thread with this profile. */}
                <button
                  type="button"
                  className="snort-btn icon"
                  aria-label="Send a message"
                  onClick={onMessage}
                >
                  <Icon name="mail-outline" size={16} />
                </button>

                {/* mute — `!bg-error` (red) until muted, `bg-success` after. The
                    `!` is what lets it survive the light-mode trap of §3.1. */}
                <button
                  type="button"
                  className={`snort-btn icon ${muted ? 'force-success' : 'force-error'}`}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                  onClick={() => setMuted((v) => !v)}
                >
                  <Icon name="user-x" size={16} />
                </button>

                {/* 4. Follow last. */}
                <button
                  type="button"
                  className="snort-btn secondary snort-follow-btn"
                  data-tour="snort-follow"
                  onClick={() => setFollowing((v) => !v)}
                >
                  {following ? 'Unfollow' : 'Follow'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ---- ProfileDetails (§8.3): `flex flex-col gap-4`, NO stat row ---- */}
        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="snort-h2 flex items-center gap-2">
              <span className="min-w-0 truncate">{user.displayName}</span>
              {followsYou && (
                <span className="snort-layer-1 !px-1.5 !py-1 text-xs font-normal leading-none">
                  follows you
                </span>
              )}
            </h2>

            {/* nip05 on its own line. */}
            {user.nip05 && <div className="truncate text-sm text-neutral-400">{user.nip05}</div>}

            {/* Links block — 16px `zapCircle` for the LNURL, 16px `link-02` for
                the website, whose label is stripped to hostname + pathname. */}
            {user.lightningAddress && (
              <div className="flex items-center gap-2">
                <span className="shrink-0">
                  <Icon name="zapCircle" size={16} />
                </span>
                <span className="cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap hover:underline">
                  {user.lightningAddress}
                </span>
              </div>
            )}

            {user.website && (
              <div className="flex items-center gap-2">
                <span className="shrink-0">
                  <Icon name="link-02" size={16} />
                </span>
                {/* Deliberately not an <a href>: nothing in the simulator
                    navigates out, and the product claims zero external calls. */}
                <span className="snort-link truncate">{websiteLabel(user.website)}</span>
              </div>
            )}
          </div>

          {/* The `about` text — hashtags, mentions and URLs go violet. */}
          {user.bio && (
            <div className="text-[15px]">
              <NoteText content={user.bio} />
            </div>
          )}

          {/* Social proof stands where a stat row would be on any other client. */}
          {followedBy.length === 0 ? (
            <div className="snort-muted flex items-center gap-2 text-sm">
              Not followed by anyone you follow
            </div>
          ) : (
            <div className="snort-muted flex items-center gap-2 text-sm">
              <div className="flex items-center">
                {namedFollowers.map((f, i) => (
                  <Avatar
                    key={f.pubkey}
                    seed={f.username}
                    className={`h-6 w-6 ${i > 0 ? '-ml-2' : ''}`}
                  />
                ))}
              </div>
              <div className="min-w-0">
                Followed by{' '}
                {namedFollowers.map((f, i) => (
                  <React.Fragment key={f.pubkey}>
                    {i > 0 && ', '}
                    <span className="snort-link" onClick={() => onViewProfile(f)}>
                      {f.displayName}
                    </span>
                  </React.Fragment>
                ))}
                {otherFollowerCount > 0 && (
                  <> and {formatShort(otherFollowerCount)} others you follow</>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Tabs (§8.4): rounded pills, `px-3 py-2` gutter, never underlines ---- */}
      <div className="px-3 py-2">
        <div className="snort-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`snort-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span style={t.tint ? { color: t.tint } : undefined} className="flex shrink-0">
                <Icon name={t.icon} size={16} />
              </span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {body}
    </div>
  );
}

export default ProfileScreen;
