import { useMemo, useState } from 'react';
import type { MockNote, MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { NoteCard } from '../components/NoteCard';
import { formatShort, noteImages, seededUnit } from '../snortUtils';

/**
 * Snort — the home feed.
 *
 * Rebuilt from `docs/refs/snort/screen-map.md` §6.2 / §6.3 / §6.4 with the note
 * surface itself living in `NoteCard` (§4). The three things the previous
 * version of this file got wrong, all of them called out in the spec:
 *
 *  - **There is no inline compose box** (§6.2). `TimelineFollows.tsx:87-116`
 *    renders only the latest-pill, the notes and `AutoLoadMore`;
 *    `NoteCreatorButton` is mounted in the sidebar and the mobile footer ONLY.
 *    [REC ✓ nothing between the header and the first note but the live strip.]
 *  - **There is no tab row here.** The feed picker is the header dropdown
 *    (§6.1) and Snort has no underline tabs anywhere; the tab is handed to us
 *    as the `feedTab` prop.
 *  - The order of the surface is live strip → "N new notes" pill → notes →
 *    "Load more".
 *
 * Everything is deterministic: image and viewer counts come from `noteImages`
 * (memoised local `data:` URIs) and `seededUnit`, never `Math.random()`.
 */

export interface TimelineScreenProps {
  currentUser: MockUser | null;
  notes: MockNote[];
  users: MockUser[];
  feedTab: string;
  onViewProfile: (u: MockUser) => void;
  onViewThread: (n: MockNote) => void;
  onReply: (n: MockNote) => void;
}

/** The feed caps displayed notes at ~25 across every Sandstr simulator. */
const FEED_CAP = 25;
/** `AutoLoadMore` chunk size — "Load more" reveals the next slice. */
const PAGE = 10;

/**
 * §6.3 — the live strip only exists on `/` and `/following`, i.e. the two tabs
 * whose picker labels are these.
 */
const LIVE_TABS = ['Following', 'For you'];

/**
 * Invented stream titles. Real streams would carry real people's names, so the
 * titles are generic and the HOSTS are resolved from mock users instead.
 */
const STREAMS = [
  '24/7 Chiptune Radio',
  'Building a relay, live',
  'Lo-fi beats to zap to',
  'Sats & Coffee: morning show',
  'Late night synthwave',
];

export function TimelineScreen({
  currentUser,
  notes,
  users,
  feedTab,
  onViewProfile,
  onViewThread,
  onReply,
}: TimelineScreenProps) {
  const [showNewNotes, setShowNewNotes] = useState(true);
  const [limit, setLimit] = useState(PAGE);

  const usersByPubkey = useMemo(() => {
    const map = new Map<string, MockUser>();
    for (const u of users) map.set(u.pubkey, u);
    return map;
  }, [users]);

  /**
   * Per-tab sources (§6.4, "Per-tab sources"): `media` restricts to media
   * kinds, `conversations` drops `postsOnly`, `followed-by-friends` widens the
   * follow distance to 2, `trending/notes` is a ranked feed. Reproduced as
   * deterministic filters over the mock set; the props array is never mutated.
   */
  const feedNotes = useMemo(() => {
    const all = [...notes];
    let selected: MockNote[];

    switch (feedTab) {
      case 'Media':
        selected = all.filter((n) => (n.images?.length ?? 0) > 0);
        break;
      case 'Trending Notes':
        selected = all.sort((a, b) => b.likes - a.likes);
        break;
      case 'Trending Hashtags':
        selected = all.filter((n) => (n.hashtags?.length ?? 0) > 0);
        break;
      case 'Conversations':
        selected = all.filter((n) => n.replies > 0);
        break;
      case 'Followed by friends':
        // followDistance={2} — a stable "friends of friends" slice.
        selected = all.filter((n) => seededUnit(`fof:${n.id}`) > 0.35);
        break;
      case 'Follow Sets':
        selected = all.filter((n) => seededUnit(`set:${n.id}`) > 0.5);
        break;
      case 'For you':
        // The DVM feed interleaves with the follows feed, so the order differs
        // from `Following` without the contents differing.
        selected = all.sort((a, b) => seededUnit(`dvm:${a.id}`) - seededUnit(`dvm:${b.id}`));
        break;
      default:
        // `Following` = TimelineFollows postsOnly, newest first.
        selected = all.sort((a, b) => b.created_at - a.created_at);
    }

    // A tab that filters down to nothing would render a blank column; the mock
    // set is small, so fall back to the unfiltered feed rather than a dead end.
    return (selected.length > 0 ? selected : all).slice(0, FEED_CAP);
  }, [notes, feedTab]);

  const visible = feedNotes.slice(0, limit);
  const hasMore = limit < feedNotes.length;

  /** Up to 3 overlapping 24px avatars in the pill — never your own (§6.4). */
  const newNoteAvatars = useMemo(
    () => users.filter((u) => u.pubkey !== currentUser?.pubkey).slice(0, 3),
    [users, currentUser],
  );
  const newNoteCount = 2 + Math.floor(seededUnit(`new:${feedTab}`) * 12);

  const showLive = LIVE_TABS.includes(feedTab);

  return (
    <div>
      {showLive && <LiveStreams users={users} />}

      {showNewNotes && notes.length > 0 && (
        <div className="flex justify-center py-2">
          {/* `bg-highlight` violet fill, white text, fully rounded. Inline click
              is `showLatest(false)` — the pill simply goes away. */}
          <button type="button" className="snort-new-notes" onClick={() => setShowNewNotes(false)}>
            {newNoteAvatars.length > 0 && (
              <span className="flex items-center">
                {newNoteAvatars.map((u, i) => (
                  <Avatar key={u.pubkey} seed={u.username} className={`h-6 w-6 ${i > 0 ? '-ml-2' : ''}`} />
                ))}
              </span>
            )}
            <span>{newNoteCount} new notes</span>
            <Icon name="arrowUp" size={20} />
          </button>
        </div>
      )}

      {/* The flat divided note list (§4.1). `.snort-feed` + the data attribute
          are both the guided tour's target selector. */}
      <div className="snort-feed" data-tour="snort-feed">
        {visible.map((note, i) => (
          <NoteCard
            key={note.id}
            note={note}
            author={usersByPubkey.get(note.pubkey)}
            users={users}
            onOpenThread={onViewThread}
            onViewProfile={onViewProfile}
            onReply={onReply}
            /* One target only, or the tour spotlights every action bar. */
            tourTarget={i === 0}
          />
        ))}
      </div>

      {/* `AutoLoadMore` — an infinite-scroll trigger wrapping a plain button.
          [REC ✓ white "Load more" pill.] */}
      {hasMore && (
        <div className="flex justify-center py-4">
          <button type="button" className="snort-btn" onClick={() => setLimit((n) => n + PAGE)}>
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * §6.3 — `Components/LiveStream/LiveStreams.tsx:20`:
 * `flex mx-2 gap-4 overflow-x-auto`, cards `h-[80px]`, `aspect-video` thumbnail,
 * an uppercase status badge, a 25px host avatar with `outline-2
 * outline-highlight`, and a viewer-count pill.
 *
 * [REC ✓ dark title bar over the thumbnail, red LIVE pill bottom-left,
 * violet-ringed avatar bottom-right, a dark "1 viewers" pill, and a visible
 * horizontal scrollbar — so the scrollbar is deliberately NOT hidden here.]
 *
 * The badge colour is `--snort-live #f83838` (via `.snort-live-badge`), which
 * the recording samples as distinct from the "New Note" orange in the same
 * frame. The viewer label is not pluralised upstream: it reads "1 viewers".
 */
function LiveStreams({ users }: { users: MockUser[] }) {
  return (
    <div className="mx-2 flex gap-4 overflow-x-auto py-2">
      {STREAMS.map((title, i) => {
        const host = users.length > 0 ? users[i % users.length] : undefined;
        const viewers = 1 + Math.floor(seededUnit(`viewers:${i}`) * 2600);
        return (
          <div
            key={title}
            className="relative h-[80px] shrink-0 cursor-pointer overflow-hidden rounded-lg"
            style={{ border: '1px solid var(--snort-border)' }}
          >
            {/* aspect-video at 80px tall = 142px wide. */}
            <img src={noteImages(`live:${i}`, 1)[0]} alt="" className="h-[80px] w-[142px] object-cover" />

            {/* Dark title bar across the top of the card. */}
            <div className="absolute inset-x-0 top-0 truncate bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {title}
            </div>

            {/* The viewer pill sits under the title bar; the badge and the host
                share the bottom row, which is all a 142px card fits. */}
            <span className="absolute right-1 top-6 rounded-full bg-black/60 px-1.5 text-[10px] leading-4 text-white">
              {formatShort(viewers)} viewers
            </span>

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-1 pb-1">
              <span className="snort-live-badge">LIVE</span>
              <Avatar seed={host?.username ?? `stream:${i}`} className="snort-live-avatar h-[25px] w-[25px]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TimelineScreen;
