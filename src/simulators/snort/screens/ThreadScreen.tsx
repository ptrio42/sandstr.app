import { useMemo } from 'react';
import type { MockNote, MockThread, MockUser } from '../../../data/mock';
import { NoteCard } from '../components/NoteCard';

/**
 * Snort — the thread surface (`/e/:id`, §5.7).
 *
 * All of the geometry here is `docs/refs/snort/screen-map.md` §4.8, which is
 * short but unusually specific, and the previous version of this file got every
 * part of it wrong (it invented a `ThreadTree`, an off-brand palette, an inline
 * reply composer and a DiceBear hotlink for the avatar):
 *
 *  - The reply connector is **an absolutely positioned SIBLING of the note, not
 *    a wrapper** (`Note.tsx:59-76`). Upstream:
 *      `<div className={classNames(tl.inset, "absolute border-l z-1", {...})} />`
 *  - `Subthread.tsx:34-62` passes `inset: "left-9"` — **36px, the avatar's
 *    centre** (12px of `px-3` + half of the 48px avatar, §4.2) — so the line
 *    runs *through* the avatar column and is occluded by each avatar rather than
 *    sitting beside it. That is the detail that makes it read as Snort and not
 *    as Twitter.
 *  - The same call indents the note's **text + footer** with `inset="ml-14"`
 *    (56px). That inset is not decoration: it is what keeps a full-height
 *    connector from being drawn straight through the body copy, because the
 *    body is otherwise full-width and starts at the card's left padding (§4.3).
 *  - Segment rules: depth 0 gets a `bottomLine` **only when it has replies**;
 *    deeper levels always get a `topLine`; a segment with no line below it is a
 *    16px stub (`h-4`). Line colour is the global border colour, never an
 *    accent — the violet is spent on the focused note's outline instead.
 *
 * The note surface itself is `NoteCard` (§4). The root is given `isRoot` (which
 * suppresses the row hover tint) and `highlight` (the 2px violet **outline**,
 * not a border, §4.1).
 *
 * Not reproduced here, deliberately: the `re:` ReplyTag line. §4.8 places it
 * inside the note's sub-header, next to "via {client}", which is `NoteCard`'s
 * territory — faking it above the avatar row would put a real Snort detail in a
 * place real Snort never puts it.
 */

export interface ThreadScreenProps {
  thread: MockThread | null;
  rootNote: MockNote | null;
  users: MockUser[];
  onViewProfile: (u: MockUser) => void;
  onReply: (n: MockNote) => void;
}

/**
 * `inset="ml-14"` applied to the note's text+footer block without reaching into
 * `NoteCard`. `.snort-note-inner` has exactly two children — the header row and
 * the body/footer block — so `> div:last-child` is upstream's `NoteContent`
 * wrapper. Scoped per note so a thread note indents and a feed note does not.
 */
const CONTENT_INSET = '[&_.snort-note-inner>div:last-child]:ml-14';

/** The four states of `Note.tsx`'s connector div. */
type Line =
  /** No replies below and none above: the note renders exactly like a feed note. */
  | 'none'
  /** Depth 0 with replies: `top-2 bottom-0` — starts at the avatar's top edge. */
  | 'root'
  /** A reply with more below it: `top-0 bottom-0`. */
  | 'full'
  /** The last reply: `top-0 h-4`, the 16px stub that closes the chain. */
  | 'stub';

const LINE_CLASS: Record<Exclude<Line, 'none'>, string> = {
  root: 'top-2 bottom-0',
  full: 'top-0 bottom-0',
  stub: 'top-0 h-4',
};

export function ThreadScreen({ thread, rootNote, users, onViewProfile, onReply }: ThreadScreenProps) {
  const usersByPubkey = useMemo(() => {
    const map = new Map<string, MockUser>();
    for (const u of users) map.set(u.pubkey, u);
    return map;
  }, [users]);

  /**
   * The shell hands us the clicked note as `rootNote`; a thread opened without
   * one still knows its own root via `rootNoteId`.
   */
  const root = useMemo(() => {
    if (rootNote) return rootNote;
    if (!thread) return null;
    return thread.notes.find((n) => n.id === thread.rootNoteId) ?? thread.notes[0] ?? null;
  }, [rootNote, thread]);

  /**
   * Replies, oldest first. The mock builder already sorts by timestamp and puts
   * the root first, but a thread reached from one of its own replies would
   * otherwise render that note twice.
   */
  const replies = useMemo(() => {
    if (!thread || !root) return [];
    return thread.notes.filter((n) => n.id !== root.id).sort((a, b) => a.created_at - b.created_at);
  }, [thread, root]);

  // Nothing to show — the note was not carried through the navigation.
  if (!root) {
    return (
      <div className="snort-muted px-3 py-10 text-center">This note could not be loaded.</div>
    );
  }

  const lastIndex = replies.length - 1;

  return (
    <div className="snort-thread">
      {/* Root: no hover tint (`isRoot`), 2px violet outline (`highlight`), and a
          bottom connector only when something hangs off it. */}
      <ThreadNote
        note={root}
        author={usersByPubkey.get(root.pubkey)}
        users={users}
        isRoot
        highlight
        line={replies.length > 0 ? 'root' : 'none'}
        onViewProfile={onViewProfile}
        onReply={onReply}
      />

      {replies.map((reply, i) => (
        <ThreadNote
          key={reply.id}
          note={reply}
          author={usersByPubkey.get(reply.pubkey)}
          users={users}
          line={i === lastIndex ? 'stub' : 'full'}
          onViewProfile={onViewProfile}
          onReply={onReply}
        />
      ))}
    </div>
  );
}

/**
 * One row of the thread: the connector, then the note.
 *
 * DOM order is load-bearing. The connector is an earlier sibling with no
 * z-index, so it paints above the row's background but below every positioned
 * descendant of the note that follows it — which is exactly the avatar. That
 * reproduces upstream's `z-1`-on-both-of-them result (the line disappears
 * behind each avatar) without hard-coding a stacking value that would also have
 * to beat the hover tint.
 */
function ThreadNote({
  note,
  author,
  users,
  isRoot = false,
  highlight = false,
  line,
  onViewProfile,
  onReply,
}: {
  note: MockNote;
  author?: MockUser;
  users: MockUser[];
  isRoot?: boolean;
  highlight?: boolean;
  line: Line;
  onViewProfile: (u: MockUser) => void;
  onReply: (n: MockNote) => void;
}) {
  const hasLine = line !== 'none';

  return (
    <div className="relative">
      {hasLine && (
        <div
          aria-hidden
          className={`absolute left-9 ${LINE_CLASS[line]}`}
          style={{ borderLeft: '1px solid var(--snort-border)' }}
        />
      )}

      <NoteCard
        note={note}
        author={author}
        users={users}
        isRoot={isRoot}
        highlight={highlight}
        onViewProfile={onViewProfile}
        onReply={onReply}
        className={hasLine ? CONTENT_INSET : ''}
      />
    </div>
  );
}

export default ThreadScreen;
