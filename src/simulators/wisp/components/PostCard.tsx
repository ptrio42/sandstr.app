import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  Repeat2,
  Reply,
  BadgeCheck,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Bitcoin,
} from 'lucide-react';
import type { MockNote, MockUser } from '../../../data/mock';
import { MENTION_SPLIT_RE, MENTION_TOKEN_RE, resolveMention } from '../../../data/mock';
import { WispAvatar } from './Avatar';
import { ActionBar } from './ActionBar';
import {
  timeAgo,
  statusFor,
  powBitsFor,
  wispMediaFor,
  formatShort,
  userByPubkey,
  truncNpub,
} from '../wispData';

/**
 * Wisp post card (PostCard.kt): a FLAT full-width column on the screen
 * background — no card surface, no rounding; separator = full-bleed hairline
 * divider. 40dp avatar with follow badge, icon-only NIP-05 check, NIP-38
 * status line, "Ns/Nm/Nh/Nd" timestamps, PoW chip, orange links, radius-12
 * media, action row + trailing engagement chevron.
 */
export interface PostCardProps {
  note: MockNote;
  author: MockUser;
  repostedBy?: MockUser | null;
  /** Compact nested variant used for quoted notes. */
  quoted?: boolean;
  showDivider?: boolean;
  onOpenThread?: (note: MockNote) => void;
  onOpenProfile?: (user: MockUser) => void;
  onReply?: (note: MockNote) => void;
  onZap?: (note: MockNote, author: MockUser) => void;
  registerAction?: (a: string) => void;
}

const OVERFLOW_ITEMS = [
  'Follow',
  'Block',
  'Mute Thread',
  'Add to List',
  'Share',
  'Copy Note ID',
  'Copy Note JSON',
  'Translate',
];

/** Render content with orange (accent) hashtags/mentions/links — no underline. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(MENTION_SPLIT_RE).flatMap((chunk, ci) => {
        if (MENTION_TOKEN_RE.test(chunk)) {
          const mention = resolveMention(chunk);
          return [
            <span key={`m${ci}`} style={{ color: 'var(--wisp-accent)' }}>
              {mention.kind === 'profile' ? `@${mention.label}` : mention.label}
            </span>,
          ];
        }
        return chunk.split(/(#[\p{L}\p{N}_]+|@[\p{L}\p{N}_]+|https?:\/\/\S+)/u).map((p, i) =>
        /^(#|@|https?:)/.test(p) ? (
          <span key={i} style={{ color: 'var(--wisp-accent)' }}>
            {p.replace(/^https?:\/\//, '')}
          </span>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
        );
      })}
    </>
  );
}

function MediaBlock({ note }: { note: MockNote }) {
  const media = wispMediaFor(note);
  const [index, setIndex] = useState(0);
  if (media.length === 0) return null;
  if (media.length === 1) {
    return (
      <img
        src={media[0]}
        alt=""
        className="mt-1.5 w-full rounded-xl object-cover"
        draggable={false}
      />
    );
  }
  // 2+ media → carousel of 4:5 crops with the "N / M" counter pill (no dots)
  return (
    <div className="relative mt-1.5">
      <div
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto pr-12"
        onScroll={(e) => {
          const el = e.currentTarget;
          const w = el.firstElementChild
            ? (el.firstElementChild as HTMLElement).offsetWidth + 8
            : 1;
          setIndex(Math.min(media.length - 1, Math.round(el.scrollLeft / w)));
        }}
      >
        {media.map((m, i) => (
          <img
            key={i}
            src={m}
            alt=""
            className="aspect-[4/5] w-[85%] shrink-0 snap-start rounded-xl object-cover"
            draggable={false}
          />
        ))}
      </div>
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg px-2 py-1 text-[11px] text-white"
        style={{ background: 'rgba(0,0,0,0.55)' }}
      >
        {index + 1} / {media.length}
      </div>
    </div>
  );
}

/** 500dp; dp maps to CSS px at the density this frame emulates. */
const CLAMP_PX = 500;
const FADE = 'linear-gradient(180deg, black calc(100% - 48px), transparent 100%)';

export function PostCard({
  note,
  author,
  repostedBy,
  quoted = false,
  showDivider = true,
  onOpenThread,
  onOpenProfile,
  onReply,
  onZap,
  registerAction,
}: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const status = statusFor(author);
  const pow = powBitsFor(note);

  /**
   * Upstream clamps by HEIGHT, not by character count (screen-map §Feed card 4:
   * "Text-only posts clamp at 500dp with bottom fade + centered Show more/Show
   * less in primary. Media never clamps."). A character threshold was the wrong
   * unit — the same 420 characters is two screens of one-word lines or four
   * lines of prose. dp maps to CSS px at this density, so the cut is measured
   * on the rendered paragraph instead.
   */
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [overflows, setOverflows] = useState(false);
  const hasMedia = !!note.images?.length;
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el || hasMedia) {
      setOverflows(false);
      return;
    }
    setOverflows(el.scrollHeight > CLAMP_PX + 1);
  }, [note.content, hasMedia]);
  const isLong = overflows;
  const isReply = Boolean(note.tags?.some((t) => t[0] === 'e')) && !note.isRepost;

  if (quoted) {
    return (
      <div
        className="mt-1.5 rounded-xl border p-3"
        style={{ borderColor: 'var(--wisp-outline-variant)', background: 'var(--wisp-surface)' }}
      >
        <div className="flex items-center gap-2">
          <WispAvatar seed={author.username} className="w-[34px] h-[34px]" />
          <span className="text-sm font-semibold">{author.displayName}</span>
          {author.isVerified && (
            <BadgeCheck size={14} style={{ color: 'var(--wisp-accent)' }} />
          )}
          <span className="ml-auto text-[11px] text-[var(--wisp-on-surface-variant)]">
            {timeAgo(note.created_at)}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-4 text-sm">
          <RichText text={note.content} />
        </p>
      </div>
    );
  }

  return (
    // Repeats per card; the feed step resolves the first, i.e. the top note.
    <article data-tour="wisp-post-card" className="relative">
      <div
        className="cursor-pointer px-4 py-2"
        onClick={() => onOpenThread?.(note)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onOpenThread?.(note);
        }}
      >
        {/* Repost header — horizontally centered */}
        {note.isRepost && repostedBy && (
          <div className="mb-1 flex items-center justify-center gap-1 text-[11px] text-[var(--wisp-on-surface-variant)]">
            <Repeat2 size={14} strokeWidth={1.8} />
            <WispAvatar seed={repostedBy.username} className="w-5 h-5" />
            <span className="max-w-[200px] truncate">
              {truncNpub(repostedBy.pubkey)} reposted
            </span>
            <span className="opacity-70">· {timeAgo(note.created_at)}</span>
          </div>
        )}
        {isReply && (
          <div className="mb-1 flex items-center gap-1.5 text-xs text-[var(--wisp-on-surface-variant)]">
            <Reply size={14} strokeWidth={1.8} />
            <span>Replying to {userByPubkey(note.mentions?.[0] ?? '').displayName}</span>
          </div>
        )}

        {/* Author row */}
        <div className="flex items-start gap-2.5">
          <div
            className="relative shrink-0 cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`Open ${author.displayName}'s profile`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile?.(author);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                onOpenProfile?.(author);
              }
            }}
          >
            <WispAvatar seed={author.username} className="w-10 h-10" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="truncate text-base font-semibold leading-tight">
                {author.displayName}
              </span>
              {author.isVerified && (
                <BadgeCheck size={14} className="shrink-0" style={{ color: 'var(--wisp-accent)' }} />
              )}
              <span className="ml-auto shrink-0 text-[11px] text-[var(--wisp-on-surface-variant)] opacity-70">
                {timeAgo(note.created_at)}
              </span>
              {pow && (
                <span
                  className="shrink-0 rounded px-1 py-0.5 text-[11px]"
                  style={{ color: 'var(--wisp-accent)', background: 'rgba(255,152,0,0.15)' }}
                >
                  PoW {pow}
                </span>
              )}
              <button
                type="button"
                aria-label="More options"
                className="shrink-0 p-0.5 text-[var(--wisp-on-surface-variant)] opacity-70"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((o) => !o);
                }}
              >
                <MoreVertical size={18} />
              </button>
            </div>
            {status && !isReply && (
              <div className="text-xs italic text-[var(--wisp-on-surface-variant)] opacity-60">
                {status}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-1.5">
          <p
            ref={bodyRef}
            className="whitespace-pre-wrap text-[15px] leading-[1.47]"
            style={
              isLong && !expanded
                ? {
                    maxHeight: CLAMP_PX,
                    overflow: 'hidden',
                    // The "bottom fade" the screen-map calls for.
                    maskImage: FADE,
                    WebkitMaskImage: FADE,
                  }
                : undefined
            }
          >
            <RichText text={note.content} />
          </p>
          {isLong && (
            <button
              type="button"
              className="mx-auto mt-1 block text-sm font-medium"
              style={{ color: 'var(--wisp-accent)' }}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((x) => !x);
              }}
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
          <MediaBlock note={note} />

          {/* Link preview card for a pasted note (mock notes never carry one —
              unfurling needs the network). Layout is OUR reading of this
              client's surface; the screen-map does not cover link cards. */}
          {note.linkPreview && (
            <a
              href={note.linkPreview.url}
              target="_blank"
              rel="noreferrer noopener"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 block overflow-hidden rounded-2xl no-underline"
              style={{ border: '1px solid var(--wisp-divider)' }}
            >
              {note.linkPreview.image && (
                <img src={note.linkPreview.image} alt="" loading="lazy" className="max-h-64 w-full object-cover" />
              )}
              <div className="px-3 py-2">
                <div className="text-[15px] font-medium leading-snug">
                  {note.linkPreview.title || note.linkPreview.url}
                </div>
                {note.linkPreview.description && (
                  <div className="mt-0.5 line-clamp-2 text-[13px] opacity-70">{note.linkPreview.description}</div>
                )}
                <div className="mt-1 text-[12px] opacity-60">{note.linkPreview.siteName}</div>
              </div>
            </a>
          )}
        </div>

        {/* Top-zapper banner */}
        {note.zapAmount > 500 && (
          <div
            className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-1"
            style={{ borderColor: 'rgba(255,152,0,0.3)' }}
          >
            <WispAvatar seed={`zapper-${note.id}`} className="w-[18px] h-[18px]" />
            <Bitcoin size={14} style={{ color: 'var(--wisp-zap)' }} />
            <span className="text-[11px]" style={{ color: 'var(--wisp-zap)' }}>
              {formatShort(Math.floor(note.zapAmount * 0.6))}
            </span>
          </div>
        )}

        {/* Action row + engagement chevron */}
        <div className="flex items-center">
          <ActionBar
            note={note}
            onReply={() => onReply?.(note)}
            onZap={() => onZap?.(note, author)}
            registerAction={registerAction}
          />
          <button
            type="button"
            aria-label="Engagement details"
            className="p-1 text-[var(--wisp-on-surface-variant)]"
            onClick={(e) => {
              e.stopPropagation();
              setDetailsOpen((o) => !o);
            }}
          >
            {detailsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Engagement drawer: zaps → reposts → reactions (ReactionDetailsSection order) */}
        {detailsOpen && (
          <div className="mb-1 space-y-2 text-xs text-[var(--wisp-on-surface-variant)]">
            {note.zapAmount > 0 && (
              <div className="flex items-center gap-2">
                <WispAvatar seed={`zapper-${note.id}`} className="w-[30px] h-[30px]" />
                <span className="font-semibold text-[var(--wisp-on-bg)]">
                  {userByPubkey(note.mentions?.[0] ?? '').displayName}
                </span>
                <Bitcoin size={14} style={{ color: 'var(--wisp-nip05)' }} />
                <span style={{ color: 'var(--wisp-nip05)' }}>
                  {note.zapAmount.toLocaleString('en-US')} sats
                </span>
              </div>
            )}
            <div
              className="border-t pt-2"
              style={{ borderColor: 'rgba(56,56,58,0.3)' }}
            >
              <div className="flex items-center gap-2">
                <Repeat2 size={20} style={{ color: 'var(--wisp-repost)' }} />
                <div className="flex -space-x-2">
                  {Array.from({ length: Math.min(3, Math.max(1, note.reposts)) }).map((_, i) => (
                    <WispAvatar key={i} seed={`rp-${note.id}-${i}`} className="w-9 h-9" />
                  ))}
                </div>
                {note.reposts > 3 && <span>+{note.reposts - 3}</span>}
              </div>
            </div>
            <div
              className="flex items-center gap-2 border-t pt-2"
              style={{ borderColor: 'rgba(56,56,58,0.3)' }}
            >
              <span className="text-base">🧡</span>
              <div className="flex -space-x-2">
                {Array.from({ length: Math.min(4, Math.max(1, note.likes)) }).map((_, i) => (
                  <WispAvatar key={i} seed={`rx-${note.id}-${i}`} className="w-9 h-9" />
                ))}
              </div>
              {note.likes > 4 && <span>+{note.likes - 4}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Overflow menu */}
      {menuOpen && (
        <div
          className="absolute right-3 top-9 z-30 min-w-[170px] rounded-lg py-1 shadow-xl"
          style={{ background: 'var(--wisp-surface)' }}
        >
          {OVERFLOW_ITEMS.map((label) => (
            <button
              key={label}
              type="button"
              className="block w-full px-4 py-2 text-left text-sm"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {showDivider && <div className="wisp-divider" />}
    </article>
  );
}
