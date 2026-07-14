import React, { useState } from 'react';
import { Avatar } from './Avatar';
import {
  HeartIcon, CommentIcon, RepostIcon, QuoteIcon, ZapIcon, TranslateIcon,
  EllipsisVIcon, EllipsisHIcon, ExternalLinkIcon, VerifiedRosette,
} from './icons';
import type { YakiNoteData } from '../data';

export type { YakiNoteData };

function abbrev(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${n}`;
}

// hashtags (blue pill + external-link), urls (blue), @mentions (orange)
function renderContent(text: string): React.ReactNode {
  const parts = text.split(/(\s+)/);
  return parts.map((tok, i) => {
    if (/^#[\p{L}\p{N}_]+$/u.test(tok)) {
      return (
        <span key={i} className="yakihonne-hashtag">
          {tok}<ExternalLinkIcon className="w-3 h-3" />
        </span>
      );
    }
    if (/^https?:\/\/\S+/.test(tok)) return <span key={i} className="text-[var(--yh-link)]">{tok}</span>;
    if (/^@[\w.]+$/.test(tok)) return <span key={i} className="text-[var(--yh-orange)]">{tok}</span>;
    return <React.Fragment key={i}>{tok}</React.Fragment>;
  });
}

interface Props {
  note: YakiNoteData;
  onOpenThread?: () => void;
  onViewProfile?: () => void;
  onReply?: () => void;
  onZap?: (sats: number) => void;
}

export const NoteCard: React.FC<Props> = ({ note, onOpenThread, onViewProfile, onReply, onZap }) => {
  const [liked, setLiked] = useState(!!note.defaultLiked);
  const [reposted, setReposted] = useState(false);
  const [zapped, setZapped] = useState(false);
  const [reactions, setReactions] = useState(note.reactions);
  const [reposts, setReposts] = useState(note.reposts);
  const [zaps, setZaps] = useState(note.zaps);

  const stop = (fn?: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn?.(); };

  const toggleLike = () => { setLiked((v) => !v); setReactions((c) => (liked ? c - 1 : c + 1)); };
  const toggleRepost = () => { setReposted((v) => !v); setReposts((c) => (reposted ? c - 1 : c + 1)); };
  const doZap = () => { if (zapped) return; setZapped(true); setZaps((c) => c + 21); onZap?.(21); };

  return (
    <article
      onClick={onOpenThread}
      className="px-4 pt-3.5 pb-2.5 border-b border-[var(--yh-divider)] cursor-pointer"
    >
      <div className="flex gap-3 items-start">
        <button onClick={stop(onViewProfile)} className="shrink-0 mt-0.5 self-start">
          <Avatar seed={note.seed} className="w-11 h-11" zap={note.zap} />
        </button>

        <div className="flex-1 min-w-0">
          {/* name row */}
          <div className="flex items-center gap-1.5">
            <button onClick={stop(onViewProfile)} className="font-bold truncate max-w-[60%] text-[var(--yh-text)] text-[16px]">
              {note.name}
            </button>
            {note.nip05 && <VerifiedRosette className="w-[17px] h-[17px] shrink-0" />}
            <span className="text-[var(--yh-text-2)] text-[14px]">·</span>
            <span className="text-[var(--yh-text-2)] text-[14px] truncate">{note.timeAgo}</span>
          </div>

          {/* body */}
          <div className="text-[var(--yh-text)] text-[16px] leading-[1.4] whitespace-pre-wrap break-words mt-1">
            {renderContent(note.content)}
          </div>

          {/* media */}
          {note.images && note.images.length > 0 && (
            <div className="mt-2.5 rounded-2xl overflow-hidden border border-[var(--yh-divider)]">
              <img src={note.images[0]} alt="" className="w-full max-h-80 object-cover" />
            </div>
          )}

          {/* embedded / quoted event */}
          {note.quoted && (
            <div className="mt-2.5 rounded-2xl border border-[var(--yh-border)] bg-[var(--yh-surface)] px-3.5 py-3">
              {note.quoted === 'loading' ? (
                <div className="flex items-center gap-2 text-[var(--yh-text-2)] text-[14px]">
                  Event loading… <span className="yakihonne-spinner w-4 h-4" />
                </div>
              ) : (
                <div>
                  <div className="text-[13px] font-semibold text-[var(--yh-text-2)]">{note.quoted.name}</div>
                  <div className="text-[15px] text-[var(--yh-text)] mt-0.5">{note.quoted.content}</div>
                </div>
              )}
            </div>
          )}

          {/* zap / reaction summary chip row */}
          {note.zapChip && (
            <div className="flex items-center gap-2 mt-3">
              <span className="yakihonne-summary-chip">
                <ZapIcon filled className="w-[15px] h-[15px]" />
                <span>{abbrev(note.zapChip.sats)}</span>
                {note.zapChip.from && <span className="text-[var(--yh-text-2)] font-medium">Zapped from {note.zapChip.from}!</span>}
                <EllipsisHIcon className="w-4 h-4 text-[var(--yh-text-2)]" />
              </span>
              {note.zapChip.reactors?.slice(0, 3).map((r, i) => (
                <Avatar key={i} seed={r} className="w-6 h-6" rounded="rounded-full" />
              ))}
            </div>
          )}

          {/* action bar — react · reply · repost · quote · zap  +  translate · more */}
          <div className="flex items-center mt-2.5 pr-0.5" data-tour="yakihonne-interactions">
            <button onClick={stop(toggleLike)} className={`yakihonne-action is-like ${liked ? 'active' : ''} w-[19%]`}>
              {liked && note.reactionEmoji
                ? <span className="text-[16px] leading-none">{note.reactionEmoji}</span>
                : <HeartIcon filled={liked} className="w-[21px] h-[21px]" />}
              <span>{reactions}</span>
            </button>
            <button onClick={stop(onReply)} className="yakihonne-action w-[19%]">
              <CommentIcon className="w-[21px] h-[21px]" /><span>{note.replies}</span>
            </button>
            <button onClick={stop(toggleRepost)} className={`yakihonne-action ${reposted ? 'active is-zap' : ''} w-[19%]`}>
              <RepostIcon className="w-[21px] h-[21px]" /><span>{reposts}</span>
            </button>
            <button onClick={stop()} className="yakihonne-action w-[19%]">
              <QuoteIcon className="w-[19px] h-[19px]" /><span>{note.quotes}</span>
            </button>
            <button onClick={stop(doZap)} data-tour="yakihonne-zaps" className={`yakihonne-action is-zap ${zapped ? 'active' : ''} w-[19%]`}>
              <ZapIcon filled={zapped} className="w-[21px] h-[21px]" /><span>{abbrev(zaps)}</span>
            </button>
            <div className="ml-auto flex items-center gap-2 text-[var(--yh-text-2)]">
              <button onClick={stop()} aria-label="Translate"><TranslateIcon className="w-[21px] h-[21px]" /></button>
              <button onClick={stop()} aria-label="More"><EllipsisVIcon className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default NoteCard;
