/**
 * The Coracle note card.
 *
 * Anatomy is `Note.svelte` + `NoteHeader.svelte` + `NoteActions.svelte`; the
 * spec with citations is `docs/refs/coracle/screen-map.md` §7.
 *
 * The details that decide whether this reads as Coracle:
 *  - Action ORDER is reply → zap → like → repost. Not the Twitter order, and
 *    zap comes SECOND, before the like.
 *  - Those icons are STROKED outlines (upstream's own 17x16 partial), while
 *    repost alone is a filled Font Awesome glyph. The mixed weight is real, and
 *    it is what makes the row look hand-drawn rather than stamped.
 *  - Active is the accent for all of them. There is no red heart in Coracle.
 *  - The zap count is a SUM OF SATS, not a number of zaps.
 *  - The NIP-05 handle is accent-coloured, the npub beside it sits at 50%
 *    opacity, and hashtags are underlined but NOT tinted.
 *  - The dial after the display name is a web-of-trust score, not a checkmark.
 *  - Cards alternate surface by nesting depth, and chips on them flip to the
 *    opposite surface so they stay visible.
 */
import React, { useState } from 'react';
import type { MockNote, MockUser } from '../../../data/mock';
import { Avatar, WotScore } from './Avatar';
import { Icon } from './Icon';
import {
  formatSats,
  formatTimestamp,
  quantify,
  seededCount,
  shortNpub,
  wotScore,
} from '../coracleUtils';

export interface NoteCardProps {
  note: MockNote;
  author: MockUser | undefined;
  /** Alternating surface depth — even is tinted, odd is neutral (AltColor). */
  alt?: boolean;
  liked: boolean;
  reposted: boolean;
  zapped: number;
  following: boolean;
  onLike: () => void;
  onRepost: () => void;
  onZap: () => void;
  onReply: () => void;
  onOpen: () => void;
  onViewProfile: () => void;
  children?: React.ReactNode;
}

/**
 * Note text, segmented the way the real client segments it.
 *
 * Coracle parses kind-1 content with `@welshman/content`, whose `parsers` array
 * is tried IN ORDER at each position (`parser.js:186-198`). The three segment
 * types this reproduction supports are matched with upstream's own regexes,
 * verbatim from `@welshman/content@0.9.0-pre4`:
 *
 *   parseTopic      /^#[^\s!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]+/   (skips /^#\d+$/)
 *   parseCodeBlock  /^```([^]*?)```/
 *   parseCodeInline /^`(.*?)`/
 *
 * Order matters and is preserved: topic is tried before code, and the block
 * fence before the inline backtick. Everything else (links, mentions, invoices,
 * emoji) falls through to plain text — deliberately, because inventing richer
 * rendering than the client has would be inventing fidelity.
 *
 * Two details worth not "fixing":
 *  - The topic charset EXCLUDES `_`, so `#stacking_sats` is the topic
 *    `#stacking` followed by the literal text `_sats`. That is upstream's
 *    behaviour, not a bug in this port.
 *  - `parseCodeBlock` captures everything between the fences INCLUDING the
 *    language tag, and `NoteContentCode` only calls `.trim()` on it. So real
 *    Coracle renders ```` ```rust ```` with `rust` as the first line of the
 *    code block. Reproduced.
 */
type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'topic'; value: string }
  | { kind: 'code'; value: string };

const TOPIC_RE = /^#[^\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+/;
const CODE_BLOCK_RE = /^```([^]*?)```/;
const CODE_INLINE_RE = /^`(.*?)`/;

export function parseNoteContent(input: string): Segment[] {
  const segments: Segment[] = [];
  let text = '';
  let i = 0;

  const flush = () => {
    if (text) {
      segments.push({ kind: 'text', value: text });
      text = '';
    }
  };

  while (i < input.length) {
    const rest = input.slice(i);

    const topic = TOPIC_RE.exec(rest);
    if (topic && !/^#\d+$/.test(topic[0])) {
      flush();
      segments.push({ kind: 'topic', value: topic[0].slice(1) });
      i += topic[0].length;
      continue;
    }

    const block = CODE_BLOCK_RE.exec(rest);
    if (block) {
      flush();
      segments.push({ kind: 'code', value: block[1] });
      i += block[0].length;
      continue;
    }

    const inline = CODE_INLINE_RE.exec(rest);
    if (inline) {
      flush();
      segments.push({ kind: 'code', value: inline[1] });
      i += inline[0].length;
      continue;
    }

    text += input[i];
    i += 1;
  }

  flush();
  return segments;
}

function NoteText({ content }: { content: string }) {
  const segments = parseNoteContent(content);
  return (
    <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {segments.map((segment, i) => {
        if (segment.kind === 'topic') {
          // `NoteContentTopic.svelte` — an underlined Button printing `#{value}`.
          return (
            <span key={i} style={{ textDecoration: 'underline' }}>
              #{segment.value}
            </span>
          );
        }
        if (segment.kind === 'code') {
          // `NoteContentCode.svelte` is ONE span for both forms; a value
          // containing a newline additionally gets `block whitespace-pre
          // overflow-auto`, which is what turns it into a scrollable block.
          const isBlock = segment.value.includes('\n');
          return (
            <span key={i} className={`co-code ${isBlock ? 'is-block' : ''}`}>
              {segment.value.trim()}
            </span>
          );
        }
        return <React.Fragment key={i}>{segment.value}</React.Fragment>;
      })}
    </p>
  );
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  author,
  alt = false,
  liked,
  reposted,
  zapped,
  following,
  onLike,
  onRepost,
  onZap,
  onReply,
  onOpen,
  onViewProfile,
  children,
}) => {
  const [beat, setBeat] = useState(false);

  // Engagement comes from the mock record itself; only the two things the mock
  // layer has no field for (seen-on-relay count, proof of work) are derived
  // from the note id, so they stay stable across renders and reloads.
  const replyCount = note.replies;
  const likeBase = note.likes;
  const repostBase = note.reposts;
  const zapBase = note.zapAmount;
  const relayCount = 1 + seededCount(note.id, 61, 5);
  const pow = seededCount(note.id, 71, 40);

  const likes = likeBase + (liked ? 1 : 0);
  const reposts = repostBase + (reposted ? 1 : 0);
  const sats = zapBase + zapped;

  const handleLike = () => {
    if (!liked) {
      setBeat(true);
      window.setTimeout(() => setBeat(false), 400);
    }
    onLike();
  };

  return (
    <article className={`co-card co-card-interactive co-fly ${alt ? 'co-card-alt' : ''}`}>
      {/* The card body is the click target for the detail modal; the action row
          below is not — upstream expresses the same intent by skipping the
          handler for <i> and <a> descendants. */}
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen();
          }
        }}
        style={{ cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span
            role="button"
            tabIndex={0}
            aria-label={`View ${author?.displayName ?? 'profile'}`}
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                onViewProfile();
              }
            }}
            style={{ cursor: 'pointer', alignSelf: 'flex-start' }}
          >
            <Avatar seed={author?.pubkey ?? note.pubkey} size={40} />
          </span>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '1rem',
                    }}
                  >
                    {author?.displayName ?? 'unknown'}
                  </span>
                  <WotScore score={wotScore(author?.pubkey ?? note.pubkey)} accent={following} />
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', fontSize: '0.75rem' }}>
                  {author?.nip05 && <span style={{ color: 'var(--co-accent)' }}>{author.nip05}</span>}
                  {author?.nip05 && <span style={{ opacity: 0.5 }}>-</span>}
                  <span style={{ opacity: 0.5 }}>{shortNpub(author?.pubkey ?? note.pubkey)}</span>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', paddingTop: '0.15rem' }}>
                {formatTimestamp(note.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '0.5rem', paddingLeft: '3.5rem' }}>
          <NoteText content={note.content} />
          {note.images && note.images.length > 0 && (
            <div
              style={{
                marginTop: '0.5rem',
                display: 'grid',
                gap: '0.5rem',
                gridTemplateColumns: note.images.length > 1 ? '1fr 1fr' : '1fr',
              }}
            >
              {note.images.slice(0, 4).map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: '100%',
                    maxHeight: '20rem',
                    objectFit: 'cover',
                    borderRadius: '0.25rem',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action row — `flex w-full justify-between`, left group `gap-8`. */}
      <div
        // gaps cor-23: the most-pointed-at surface in any FAQ had no anchor.
        data-tour="coracle-actions"
        style={{
          display: 'flex',
          width: '100%',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem',
          paddingTop: '1rem',
          paddingLeft: '3.5rem',
        }}
      >
        {/* Upstream is `gap-8` against a 672px column. The host card leaves
            ~560px here, so the gap is scaled with it — same reasoning as the
            column widths (screen-map §18.1) — and the row is allowed to wrap as
            a fallback rather than pushing the meta chips off the card. */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.875rem' }}>
          <button type="button" className="co-action" aria-label="Reply" onClick={onReply}>
            <Icon name="message" size={17} />
            {replyCount > 0 && <span>{replyCount}</span>}
          </button>

          <button
            type="button"
            className={`co-action ${zapped > 0 ? 'is-on' : ''}`}
            aria-label="Zap"
            onClick={onZap}
          >
            <Icon name="bolt" size={17} />
            {sats > 0 && <span>{formatSats(sats)}</span>}
          </button>

          <button
            type="button"
            className={`co-action ${liked ? 'is-on' : ''}`}
            aria-label="Like"
            onClick={handleLike}
          >
            <Icon name="heart" size={17} className={beat ? 'co-beat' : undefined} />
            {likes > 0 && <span>{likes}</span>}
          </button>

          <button
            type="button"
            className={`co-action ${reposted ? 'is-on' : ''}`}
            aria-label="Repost"
            onClick={onRepost}
          >
            {/* The one filled icon in the row — `fa fa-rotate`. */}
            <Icon name="rotate" size={15} />
            {reposts > 0 && <span>{reposts}</span>}
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginLeft: 'auto',
            transform: 'scale(0.9)',
            transformOrigin: 'right center',
          }}
        >
          {pow > 15 && (
            <span className="co-meta-chip" title={`This event cost ${pow} bits of work`}>
              <Icon name="hammer" size={11} style={{ color: 'var(--co-accent)' }} />
              {pow}
            </span>
          )}
          <button type="button" className="co-meta-chip co-staatliches" onClick={onOpen}>
            <span style={{ color: 'var(--co-accent)' }}>{relayCount}</span>{' '}
            {relayCount === 1 ? 'relay' : 'relays'}
          </button>
          <button
            type="button"
            className="co-overflow-btn"
            aria-label="Note options"
            onClick={onOpen}
          >
            <Icon name="ellipsis-v" size={12} />
          </button>
        </div>
      </div>

      {children}
    </article>
  );
};

/**
 * The reply expander (`FeedItem.svelte:178-185`). Only 3 replies show; the rest
 * hide behind this left-fading gradient bar.
 */
export const MoreReplies: React.FC<{ count: number; onClick: () => void }> = ({
  count,
  onClick,
}) => (
  <button type="button" className="co-more-replies" onClick={onClick}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <Icon name="up-down" size={12} />
      Show {quantify(count, 'more reply', 'more replies')}
    </span>
  </button>
);
