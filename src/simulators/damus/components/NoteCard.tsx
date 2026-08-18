import React, { useState } from 'react';
import type { MockNote, MockUser } from '../../../data/mock';
import { MENTION_SPLIT_RE, MENTION_TOKEN_RE, resolveMention } from '../../../data/mock';
import { Avatar } from './Avatar';
import {
  ReplyIcon, RepostIcon, ShakaIcon, ZapIcon, ShareIcon, EllipsisIcon, PersonCheckIcon, RepostIcon as RepIcon,
} from './icons';

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return `${Math.max(diff, 1)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Purple NIP-05 "verified person" badge that follows a display name.
export function Nip05Check({ className = 'w-[15px] h-[15px]' }: { className?: string }) {
  return <PersonCheckIcon className={`${className} text-[var(--damus-purple)] shrink-0`} />;
}

// Render note text with Damus-magenta links / #hashtags / @mentions.
// `nostr:` references (NIP-21) are resolved to a name before the rest of the
// tokenising runs — a raw `nostr:npub1…` on a card is a reproduction bug, not a
// faithful detail (see src/data/mock/mentions.ts).

export function renderContent(text: string): React.ReactNode {
  const parts = text.split(MENTION_SPLIT_RE);
  return parts.map((chunk, ci) => {
    if (MENTION_TOKEN_RE.test(chunk)) {
      const mention = resolveMention(chunk);
      return (
        <span key={`m${ci}`} className="text-[var(--damus-purple)]">
          {mention.kind === 'profile' ? `@${mention.label}` : mention.label}
        </span>
      );
    }
    return chunk.split(/(\s+)/).map((tok, i) => {
    if (/^https?:\/\/\S+/.test(tok)) return <span key={i} className="text-[var(--damus-purple)]">{tok}</span>;
    if (/^#[\wÀ-￿]+$/.test(tok)) return <span key={i} className="text-[var(--damus-purple)]">{tok}</span>;
    if (/^@[\w.]+$/.test(tok)) return <span key={i} className="text-[var(--damus-purple)]">{tok}</span>;
    return <React.Fragment key={i}>{tok}</React.Fragment>;
    });
  });
}

interface NoteCardProps {
  note: MockNote;
  author: MockUser;
  reposter?: MockUser | null;
  replyingTo?: string | null;
  onOpenThread?: () => void;
  onViewProfile?: () => void;
  onReply?: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note, author, reposter, replyingTo, onOpenThread, onViewProfile, onReply,
}) => {
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [zapped, setZapped] = useState(false);
  const [likes, setLikes] = useState(note.likes);
  const [reposts, setReposts] = useState(note.reposts);
  const [zaps, setZaps] = useState(note.zaps);
  const [expanded, setExpanded] = useState(false);

  const truncated = note.content.length > 360 && !expanded;
  const body = truncated ? note.content.slice(0, 360) : note.content;

  const stop = (fn?: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn?.(); };

  return (
    <article
      onClick={onOpenThread}
      // Repeats on every card; the tour's feed step resolves the first one, which
      // is the top-of-feed note — the same convention as `damus-interactions`.
      data-tour="damus-note"
      className="px-4 pt-3 pb-2 border-b border-[var(--damus-separator)] cursor-pointer"
    >
      {/* Repost header */}
      {reposter && (
        <div className="flex items-center gap-2 mb-1 pl-1 text-[13px] text-[var(--damus-text-secondary)]">
          <RepIcon className="w-4 h-4" />
          <span className="font-semibold text-[var(--damus-text-secondary)]">{reposter.displayName}</span>
          {reposter.nip05 && <Nip05Check className="w-3.5 h-3.5" />}
          <span>Reposted</span>
        </div>
      )}

      {/* Header: avatar + name row only — body and actions run full width below (real Damus layout) */}
      <div className="flex items-start gap-3">
        <button onClick={stop(onViewProfile)} className="shrink-0">
          <Avatar seed={author.username} className="w-11 h-11" zap={!!author.lightningAddress} />
        </button>

        <div className="flex-1 min-w-0">
          {/* name row */}
          <div className="flex items-center gap-1.5">
            <button onClick={stop(onViewProfile)} className="font-bold truncate max-w-[52%] text-[var(--damus-text)]">
              {author.displayName}
            </button>
            {author.nip05 && <Nip05Check />}
            <span className="text-[var(--damus-text-secondary)]">·</span>
            <span className="text-[var(--damus-text-secondary)] text-[15px]">{timeAgo(note.created_at)}</span>
            <span className="ml-auto text-[var(--damus-text-secondary)]"><EllipsisIcon className="w-5 h-5" /></span>
          </div>

          {replyingTo && (
            <div className="text-[14px] text-[var(--damus-text-secondary)]">
              Replying to <span className="text-[var(--damus-purple)]">{replyingTo}</span>
            </div>
          )}
        </div>
      </div>

      {/* body — full width from the card's left margin */}
      <div className="text-[var(--damus-text)] text-[17px] leading-[1.35] whitespace-pre-wrap break-words mt-2">
        {renderContent(body)}
        {truncated && (
          <button onClick={stop(() => setExpanded(true))} className="text-[var(--damus-purple)] ml-1">…Show more</button>
        )}
      </div>

      {/* media */}
      {note.images && note.images.length > 0 && (
        <div className={`mt-2.5 rounded-2xl overflow-hidden grid gap-0.5 ${note.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {note.images.slice(0, 4).map((img, i) => (
            <img key={i} src={img} alt="" className={`w-full object-cover ${note.images!.length === 1 ? 'max-h-80' : 'h-40'}`} />
          ))}
        </div>
      )}

      {/* Link preview card for a pasted note. Mock notes never carry one —
          unfurling needs the network (workers/index.ts). Layout is OUR reading
          of this client's surface, not something docs/refs states: the
          screen-map does not cover link cards. */}
      {note.linkPreview && (
        <a
          href={note.linkPreview.url}
          target="_blank"
          rel="noreferrer noopener"
          onClick={(e) => e.stopPropagation()}
          className="mt-2.5 block overflow-hidden rounded-2xl border border-[var(--damus-border)] no-underline"
        >
          {note.linkPreview.image && (
            <img src={note.linkPreview.image} alt="" loading="lazy" className="w-full max-h-56 object-cover" />
          )}
          <div className="px-3 py-2">
            <div className="text-[13px] text-[var(--damus-secondary)]">{note.linkPreview.siteName}</div>
            <div className="text-[15px] font-semibold leading-snug">
              {note.linkPreview.title || note.linkPreview.url}
            </div>
            {note.linkPreview.description && (
              <div className="mt-0.5 line-clamp-2 text-[14px] text-[var(--damus-secondary)]">
                {note.linkPreview.description}
              </div>
            )}
          </div>
        </a>
      )}

      {/* action row — full width */}
      <div className="flex items-center justify-between mt-2.5 pr-1" data-tour="damus-interactions">
        <button onClick={stop(onReply)} className="damus-action is-reply">
          <ReplyIcon /> {note.replies > 0 && <span>{note.replies}</span>}
        </button>
        <button onClick={stop(() => { setReposted(v => !v); setReposts(c => reposted ? c - 1 : c + 1); })} className={`damus-action is-repost ${reposted ? 'active' : ''}`}>
          <RepostIcon /> {reposts > 0 && <span>{reposts}</span>}
        </button>
        <button onClick={stop(() => { setLiked(v => !v); setLikes(c => liked ? c - 1 : c + 1); })} className={`damus-action is-like ${liked ? 'active' : ''}`}>
          <ShakaIcon filled={liked} /> {likes > 0 && <span>{likes}</span>}
        </button>
        <button onClick={stop(() => { setZapped(v => !v); setZaps(c => zapped ? c - 1 : c + 1); })} className={`damus-action is-zap ${zapped ? 'active' : ''}`}>
          <ZapIcon filled={zapped} /> {zaps > 0 && <span>{zaps >= 1000 ? `${(zaps / 1000).toFixed(1)}k` : zaps}</span>}
        </button>
        <button onClick={stop()} className="damus-action">
          <ShareIcon />
        </button>
      </div>
    </article>
  );
};

export default NoteCard;
