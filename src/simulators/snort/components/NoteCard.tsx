import React, { useCallback, useMemo, useState } from 'react';
import type { MockNote, MockUser } from '../../../data/mock';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { CodeBlock } from './CodeBlock';
import { MediaEmbed } from './MediaEmbed';
import { clientTag, formatShort, noteTime, shortNpub, TEXT_TRUNCATE_LENGTH } from '../snortUtils';

/**
 * A Snort note.
 *
 * Structure and every colour decision come from `docs/refs/snort/screen-map.md`
 * §4, built from the owner's 2026-07-14 recording read together with
 * `v0l/snort@3cc8317`. The parts a reproducer habitually gets wrong:
 *
 *  - It is a FLAT DIVIDED LIST. No card, no radius, no shadow — separation is a
 *    single bottom border. The only rounded box on the surface is a quote embed.
 *  - The body is NOT indented under the avatar; it starts at the card's left
 *    padding and runs full width.
 *  - Action order is reply → repost → heart → zap → zapper avatars. There is no
 *    share and no bookmark button; those live in the `…` menu.
 *  - The default icon colour is the INHERITED body colour, not a muted gray.
 *  - Only the heart and the zap ever change colour. Reply and repost reference
 *    `text-nostr-purple` / `text-nostr-blue`, which are undefined in the real
 *    client, so they genuinely have no hover and no active state. Reproduced.
 *  - The reaction is a HEART (#ef4444), not an emoji.
 *  - The zap value is a SUM OF SATS, not a number of zaps.
 */

export interface NoteCardProps {
  note: MockNote;
  author?: MockUser;
  users: MockUser[];
  /** Thread root: upstream suppresses the row hover tint via `isRoot`. */
  isRoot?: boolean;
  /** The focused note in a thread gets a 2px violet outline (not a border). */
  highlight?: boolean;
  showFooter?: boolean;
  /** Renders the "{name} reposted" label bar above the note. */
  repostedByName?: string;
  onOpenThread?: (note: MockNote) => void;
  onViewProfile?: (user: MockUser) => void;
  onReply?: (note: MockNote) => void;
  /** Marks this note's action row as the guided-tour target. */
  tourTarget?: boolean;
  className?: string;
}

export function NoteCard({
  note,
  author,
  users,
  isRoot = false,
  highlight = false,
  showFooter = true,
  repostedByName,
  onOpenThread,
  onViewProfile,
  onReply,
  tourTarget = false,
  className = '',
}: NoteCardProps) {
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [zapped, setZapped] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const via = useMemo(() => clientTag(note.id, note.tags), [note.id, note.tags]);
  const time = useMemo(() => noteTime(note.created_at), [note.created_at]);

  // Top zappers: upstream shows the top 3 at 24px, overlapping by -ml-2.
  const zappers = useMemo(
    () => users.filter((u) => u.pubkey !== note.pubkey).slice(0, 3),
    [users, note.pubkey],
  );

  const displayName = author?.displayName || shortNpub(note.pubkey);
  const isLong = note.content.length > TEXT_TRUNCATE_LENGTH;
  const body = isLong && !expanded ? `${note.content.slice(0, TEXT_TRUNCATE_LENGTH)}…` : note.content;

  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const openThread = useCallback(() => onOpenThread?.(note), [onOpenThread, note]);

  const likeCount = note.likes + (liked ? 1 : 0);
  const repostCount = note.reposts + (reposted ? 1 : 0);
  const zapTotal = note.zapAmount + (zapped ? 50 : 0);

  return (
    <div className={`snort-note ${className}`}>
      {repostedByName && (
        <div
          className="flex items-center gap-1 px-3 py-2 text-base font-semibold"
          style={{ borderBottom: '1px solid var(--snort-border)' }}
        >
          {/* 18px `repeat` + "{name} reposted" — deliberately NOT coloured; the
              `svg.repeat { color: var(--repost) }` rule never matches here. */}
          <Icon name="repeat" size={18} />
          <span>{repostedByName} reposted</span>
        </div>
      )}

      <div
        className={`snort-note-inner ${isRoot ? 'is-root' : ''} ${highlight ? 'is-highlight' : ''}`}
        onClick={openThread}
      >
        {/* ---- Header ---- */}
        <div className="flex justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            <span
              className="cursor-pointer"
              onClick={(e) => {
                stop(e);
                if (author) onViewProfile?.(author);
              }}
            >
              <Avatar
                seed={author?.username || note.pubkey}
                className="h-12 w-12"
                distance={author?.isVerified ? 1 : null}
              />
            </span>

            <div className="min-w-0">
              <div className="truncate font-medium">
                <span
                  className="cursor-pointer hover:underline"
                  onClick={(e) => {
                    stop(e);
                    if (author) onViewProfile?.(author);
                  }}
                >
                  {displayName}
                </span>
                {author?.nip05 && <Nip05 nip05={author.nip05} verified={author.isVerified !== false} />}
              </div>
              {/* The "via {client}" line — a signature Snort detail. */}
              <div className="text-xs" style={{ color: 'var(--snort-text-secondary)' }}>
                via {via}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <time className="text-sm font-medium" style={{ color: '#737373' }}>
              {time}
            </time>
            <span
              className="cursor-pointer px-1 py-0.5"
              style={{ color: '#737373' }}
              onClick={stop}
              aria-label="More"
            >
              <Icon name="dots" size={15} />
            </span>
          </div>
        </div>

        {/* ---- Body: full width, NOT indented under the avatar ---- */}
        <div className="min-h-0">
          <NoteText content={body} />
          {isLong && (
            <span
              className="snort-link"
              onClick={(e) => {
                stop(e);
                setExpanded((v) => !v);
              }}
            >
              {expanded ? 'Show less' : 'Show more'}
            </span>
          )}

          {note.images && note.images.length > 0 && (
            <div className="mt-3">
              <MediaEmbed noteId={note.id} count={note.images.length} />
            </div>
          )}

          {showFooter && (
            <div
              className="snort-note-actions mt-4"
              data-tour={tourTarget ? 'snort-interactions' : undefined}
              onClick={stop}
            >
              {/* reply — no active colour in the real client */}
              <button type="button" className="snort-action" aria-label="Reply" onClick={() => onReply?.(note)}>
                <Icon name="reply" size={18} />
                {note.replies > 0 && <span>{formatShort(note.replies)}</span>}
              </button>

              {/* repost — likewise no active colour */}
              <button
                type="button"
                className="snort-action"
                aria-label="Repost"
                onClick={() => setReposted((v) => !v)}
              >
                <Icon name="repeat" size={18} />
                {repostCount > 0 && <span>{formatShort(repostCount)}</span>}
              </button>

              {/* like — outline heart → filled heart + #ef4444 */}
              <button
                type="button"
                className={`snort-action heart ${liked ? 'active' : ''}`}
                aria-label="Like"
                onClick={() => setLiked((v) => !v)}
              >
                <Icon name={liked ? 'heart-solid' : 'heart'} size={18} />
                {likeCount > 0 && <span>{formatShort(likeCount)}</span>}
              </button>

              {/* zap — the value is a SAT TOTAL */}
              <button
                type="button"
                className={`snort-action zap ${zapped ? 'active' : ''}`}
                aria-label="Zap"
                onClick={() => setZapped((v) => !v)}
              >
                <Icon name={zapped ? 'zapFast' : 'zap'} size={18} />
                {zapTotal > 0 && <span>{formatShort(zapTotal)}</span>}
              </button>

              {/* Top-3 zapper avatars, 24px, overlapping. */}
              {zapTotal > 0 && zappers.length > 0 && (
                <div className="flex flex-none items-center">
                  {zappers.map((z, i) => (
                    <Avatar key={z.pubkey} seed={z.username} className={`h-6 w-6 ${i > 0 ? '-ml-2' : ''}`} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * nip05 (`Components/User/Nip05.tsx`): neutral-400, `opacity-50` while
 * unverified, and the DOMAIN gets the signature gradient when it is the
 * first-party one. There is no green check — only a red `x` on failure.
 */
function Nip05({ nip05, verified }: { nip05: string; verified: boolean }) {
  const [name, domain] = nip05.includes('@') ? nip05.split('@') : ['', nip05];
  const firstParty = domain === 'snort.social';
  return (
    <span
      className={`ml-1 inline-flex items-center text-xs font-normal ${verified ? '' : 'opacity-50'}`}
      style={{ color: '#a3a3a3' }}
    >
      {name && name !== '_' && <span>{name}@</span>}
      <span className={firstParty && verified ? 'snort-gradient-text' : undefined}>{domain}</span>
      {!verified && (
        <span className="ml-0.5" style={{ color: 'var(--snort-error)' }}>
          <Icon name="x" size={13} strokeWidth={2.5} />
        </span>
      )}
    </span>
  );
}

/**
 * Note body. Hashtags, mentions and URLs are `text-highlight` violet with NO
 * pill background; a fenced block renders as plain monospace, because Snort has
 * no syntax highlighter (§4.3).
 */
export function NoteText({ content }: { content: string }) {
  const blocks = useMemo(() => content.split(/```/), [content]);

  return (
    <div className="whitespace-pre-wrap" style={{ overflowWrap: 'break-word' }}>
      {blocks.map((block, i) =>
        i % 2 === 1 ? (
          <CodeBlock key={i} code={block.replace(/^\n/, '')} />
        ) : (
          <React.Fragment key={i}>{linkify(block)}</React.Fragment>
        ),
      )}
    </div>
  );
}

/** Splits on hashtags, @mentions and URLs, colouring each `--snort-highlight`. */
function linkify(text: string): React.ReactNode[] {
  return text.split(/(\s)/).map((part, i) => {
    if (/^#[\w-]+$/.test(part) || /^@[\w.-]+$/.test(part) || /^https?:\/\/\S+$/.test(part)) {
      return (
        <span key={i} className="snort-link">
          {part}
        </span>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export default NoteCard;
