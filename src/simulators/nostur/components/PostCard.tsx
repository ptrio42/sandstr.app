import React, { useState } from 'react';
import { ChevronDown, Link2, MoreHorizontal, Repeat2 } from 'lucide-react';
import type { MockNote, MockUser } from '../../../data/mock';
import { Avatar } from './Avatar';
import { ActionBar } from './ActionBar';
import { FollowLink } from './Chrome';
import { ago, canZap, mediaFor, reposterFor, userByPubkey } from '../nosturData';
import { MENTION_SPLIT_RE, MENTION_TOKEN_RE, resolveMention } from '../../../data/mock';

const CLAMP_CHARS = 320;

/** ContentRenderer passes accentColor: theme.accent — links/mentions/hashtags
 *  are accent with NO underline. Rendered as spans; the sim has no navigation
 *  targets for them and a bare <a href> inside a card would swallow the tap. */
// `nostr:` references (NIP-21) resolve to a name before the rest of the
// tokenising runs — see src/data/mock/mentions.ts.
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(MENTION_SPLIT_RE).map((chunk, ci) => {
        if (MENTION_TOKEN_RE.test(chunk)) {
          const mention = resolveMention(chunk);
          return (
            <span key={`m${ci}`} className="nostur-mention">
              {mention.kind === 'profile' ? `@${mention.label}` : mention.label}
            </span>
          );
        }
        return chunk.split(/(\s+)/).map((p, i) => {
        if (/^[#@][\wÀ-ɏ-]+$/.test(p)) {
          return (
            <span key={i} className={p[0] === '#' ? 'nostur-hashtag' : 'nostur-mention'}>
              {p}
            </span>
          );
        }
        if (/^https?:\/\//.test(p)) {
          return (
            <span key={i} className="nostur-mention">
              {p}
            </span>
          );
        }
        return <React.Fragment key={i}>{p}</React.Fragment>;
        });
      })}
    </>
  );
}

export interface PostCardProps {
  note: MockNote;
  author: MockUser;
  /** Post detail adds the "N reactions · N reposts · …" stats row. */
  isDetail?: boolean;
  /** Low Data Mode replaces media with the "Loading paused" block. */
  lowData?: boolean;
  following: boolean;
  bookmarked: boolean;
  reacted: boolean;
  reposted: boolean;
  zapped: boolean;
  onOpen?: () => void;
  onOpenProfile: (u: MockUser) => void;
  onReply: () => void;
  onRepost: () => void;
  onReact: () => void;
  onZap: () => void;
  onBookmark: () => void;
  onFollow: () => void;
}

/**
 * Flat, full-bleed, on `listBackground` (pure black) — no card surface, no
 * inset, no radius. Structure verified frame-by-frame; see screen-map §7.
 */
export function PostCard(props: PostCardProps) {
  const {
    note,
    author,
    isDetail,
    lowData,
    following,
    bookmarked,
    reacted,
    reposted,
    zapped,
    onOpen,
    onOpenProfile,
  } = props;

  const [expanded, setExpanded] = useState(false);
  const reposter = reposterFor(note);
  const images = mediaFor(note);
  const clamped = !isDetail && !expanded && note.content.length > CLAMP_CHARS;
  const body = clamped ? `${note.content.slice(0, CLAMP_CHARS).trimEnd()}…` : note.content;
  const link = note.links?.[0];

  return (
    <article className="nostur-post" data-tour="nostur-post">
      {/* 1. repost header — the icon carries the meaning, there is no verb */}
      {reposter && (
        <div className="mb-1.5 flex items-center gap-2 pl-[62px]">
          <Repeat2 className="h-[15px] w-[15px]" style={{ color: 'var(--nostur-secondary)' }} />
          <Avatar seed={reposter.pubkey} size={22} />
          <span className="truncate text-[14px] font-bold" style={{ color: 'var(--nostur-secondary)' }}>
            {reposter.displayName}
          </span>
        </div>
      )}

      {/* 2. author row — name on one line, "Nh · Follow" on the next */}
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => onOpenProfile(author)} aria-label={author.displayName}>
          <Avatar seed={author.pubkey} size={50} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => onOpenProfile(author)}
              className="min-w-0 flex-1 truncate text-left text-[19px] font-bold leading-tight"
            >
              {author.displayName}
            </button>
            <MoreHorizontal className="h-5 w-5 shrink-0" style={{ color: 'var(--nostur-accent)' }} />
          </div>
          <div className="mt-0.5 flex items-center gap-2.5">
            <span className="text-[15px]" style={{ color: 'var(--nostur-secondary)' }}>
              {ago(note.created_at)}
            </span>
            <FollowLink following={following} onClick={props.onFollow} />
          </div>
        </div>
      </div>

      {/* 3. content */}
      <div
        className="mt-2 whitespace-pre-wrap text-[17px] leading-[1.35]"
        onClick={onOpen}
        role={onOpen ? 'button' : undefined}
        tabIndex={onOpen ? 0 : undefined}
        onKeyDown={(e) => {
          if (onOpen && (e.key === 'Enter' || e.key === ' ')) onOpen();
        }}
      >
        <RichText text={body} />
      </div>

      {/* 4. ShowMoreChevronButton — accent chip, white chevron.compact.down */}
      {clamped && (
        <div className="flex justify-end">
          <button
            type="button"
            className="nostur-showmore"
            aria-label="Show more"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
            }}
          >
            <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* 5. media — fullWidthImages defaults true: edge to edge, no radius */}
      {images.length > 0 &&
        (lowData ? (
          <div
            className="nostur-post-media px-5 py-7 text-center"
            style={{ background: 'var(--nostur-bg)' }}
            // Anchor so a mini-tour can spotlight an ACTUAL paused block:
            // whether a given note carries media is randomised, so pointing at
            // "the first post" would often frame a text-only card.
            data-tour="nostur-lowdata-block"
          >
            <p className="text-[14px]">Loading paused (Low data mode)</p>
            <p className="mt-1 truncate text-[13px] italic" style={{ color: 'var(--nostur-secondary)' }}>
              https://blossom.example/{note.id.slice(0, 14)}.jpg
            </p>
            <button type="button" className="mt-1 text-[14px]" style={{ color: 'var(--nostur-accent)' }}>
              Load anyway
            </button>
          </div>
        ) : (
          <img src={images[0]} alt="" className="nostur-post-media" />
        ))}

      {/* 6. link preview */}
      {/* An unfurled card when we have one (a pasted note only — mock notes carry
          no `linkPreview`, since unfurling needs the network). Otherwise the
          existing placeholder row, which is what a client shows before the
          preview resolves. */}
      {note.linkPreview && !images.length && (
        <a
          href={note.linkPreview.url}
          target="_blank"
          rel="noreferrer noopener"
          onClick={(e) => e.stopPropagation()}
          className="mt-2 block overflow-hidden rounded-xl no-underline"
          style={{ background: 'var(--nostur-bg)' }}
        >
          {note.linkPreview.image && (
            <img src={note.linkPreview.image} alt="" loading="lazy" className="nostur-post-media" />
          )}
          <div className="px-4 py-3">
            <div className="text-[15px] font-semibold">{note.linkPreview.title || note.linkPreview.siteName}</div>
            {note.linkPreview.description && (
              <div className="mt-0.5 line-clamp-2 text-[14px]" style={{ color: 'var(--nostur-secondary)' }}>
                {note.linkPreview.description}
              </div>
            )}
            <div className="mt-1 text-[13px]" style={{ color: 'var(--nostur-secondary)' }}>
              {note.linkPreview.siteName}
            </div>
          </div>
        </a>
      )}

      {link && !note.linkPreview && !images.length && (
        <div
          className="mt-2 flex items-center gap-3 rounded-xl px-4 py-5"
          style={{ background: 'var(--nostur-bg)' }}
        >
          <Link2 className="h-6 w-6 shrink-0" style={{ color: 'var(--nostur-secondary)' }} />
          <span className="truncate text-[15px]" style={{ color: 'var(--nostur-secondary)' }}>
            {link}
          </span>
        </div>
      )}

      {/* 7. detail-only stats row — DetailFooterFragment, .gray, 14pt */}
      {isDetail && (
        <div
          className="mt-3 flex flex-wrap gap-x-4 text-[14px]"
          style={{ color: 'var(--nostur-gray)' }}
        >
          <span>{note.likes} reactions</span>
          <span>{note.reposts} reposts</span>
          <span>{note.mentions?.length ?? 0} mentions</span>
          <span>{note.zaps} zaps</span>
        </div>
      )}

      <ActionBar
        state={{ replied: false, reposted, reacted, zapped, bookmarked }}
        counts={{
          replies: note.replies,
          reposts: note.reposts + (reposted ? 1 : 0),
          reactions: note.likes + (reacted ? 1 : 0),
          zapSats: note.zapAmount + (zapped ? 21 : 0),
        }}
        canZap={canZap(author)}
        onReply={props.onReply}
        onRepost={props.onRepost}
        onReact={props.onReact}
        onZap={props.onZap}
        onBookmark={props.onBookmark}
      />
    </article>
  );
}

/** Notification/search rows reuse the author line without the full card. */
export function CompactRow({
  pubkey,
  children,
  onOpenProfile,
}: {
  pubkey: string;
  children: React.ReactNode;
  onOpenProfile?: (u: MockUser) => void;
}) {
  const user = userByPubkey(pubkey);
  return (
    <div
      className="flex items-start gap-3 px-5 py-3"
      style={{ borderBottom: '1px solid var(--nostur-separator)' }}
    >
      <button type="button" onClick={() => onOpenProfile?.(user)} aria-label={user.displayName}>
        <Avatar seed={user.pubkey} size={40} />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default PostCard;
