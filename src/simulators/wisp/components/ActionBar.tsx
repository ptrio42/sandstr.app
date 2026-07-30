import React, { useState } from 'react';
import { MessageSquare, Heart, Repeat2, Bitcoin, Bookmark } from 'lucide-react';
import type { MockNote, MockUser } from '../../../data/mock';
import { QUICK_EMOJIS, formatShort } from '../wispData';

/**
 * The note action row (ActionBar.kt). Order: reply → react → repost → zap →
 * add-to-list. Left-packed with fixed gaps (NOT space-between); counts sit
 * right of their icon and are hidden at 0; icons 22dp gray #9998A0.
 * Fidelity notes carried from the source:
 *  - The heart NEVER re-tints — when you react it is REPLACED by your emoji.
 *  - Repost tap opens a "Repost / Quote" popup, it does not repost directly.
 *  - Default zap icon is ₿ (CurrencyBitcoin) — the bolt is an opt-in setting.
 *    Zap count is the SAT TOTAL (formatShort), not a count.
 */
export interface ActionBarProps {
  note: MockNote;
  onReply?: () => void;
  onZap?: () => void;
  onQuote?: () => void;
  registerAction?: (a: string) => void;
}

export function ActionBar({ note, onReply, onZap, onQuote, registerAction }: ActionBarProps) {
  const [reaction, setReaction] = useState<string | null>(null);
  const [reposted, setReposted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [repostMenuOpen, setRepostMenuOpen] = useState(false);

  const likeCount = note.likes + (reaction ? 1 : 0);
  const repostCount = note.reposts + (reposted ? 1 : 0);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="relative flex h-12 flex-1 items-center" data-tour="wisp-actions" onClick={stop}>
      {/* Reply */}
      <button
        type="button"
        aria-label="Reply"
        className="flex h-12 items-center gap-0 px-1 text-[var(--wisp-on-surface-variant)]"
        onClick={() => {
          registerAction?.('reply');
          onReply?.();
        }}
      >
        <MessageSquare size={22} strokeWidth={1.8} />
        {note.replies > 0 && <span className="ml-1 text-[11px]">{note.replies}</span>}
      </button>
      <span className="w-2" />

      {/* React — heart replaced by the chosen emoji */}
      <button
        type="button"
        aria-label="React"
        className="flex h-12 items-center px-1 text-[var(--wisp-on-surface-variant)]"
        onClick={() => {
          setPickerOpen((o) => !o);
          setRepostMenuOpen(false);
        }}
      >
        {reaction ? (
          <span className="text-[20px] leading-none">{reaction}</span>
        ) : (
          <Heart size={22} strokeWidth={1.8} />
        )}
        {likeCount > 0 && (
          <span
            className="ml-1 text-[11px]"
            style={reaction ? { color: 'var(--wisp-zap)' } : undefined}
          >
            {likeCount}
          </span>
        )}
      </button>
      <span className="w-2" />

      {/* Repost — opens Repost/Quote popup */}
      <button
        type="button"
        aria-label="Repost"
        className="flex h-12 items-center px-1"
        style={{ color: reposted ? 'var(--wisp-repost)' : 'var(--wisp-on-surface-variant)' }}
        onClick={() => {
          setRepostMenuOpen((o) => !o);
          setPickerOpen(false);
        }}
      >
        <Repeat2 size={22} strokeWidth={1.8} />
        {repostCount > 0 && <span className="ml-1 text-[11px]">{repostCount}</span>}
      </button>
      <span className="w-2" />

      {/* Zap — ₿ by default; sat TOTAL as the count */}
      <button
        type="button"
        aria-label="Zaps"
        className="flex h-12 items-center px-1"
        style={{ color: 'var(--wisp-on-surface-variant)' }}
        onClick={() => {
          registerAction?.('zap');
          onZap?.();
        }}
      >
        <Bitcoin size={22} strokeWidth={1.8} />
        {note.zapAmount > 0 && <span className="ml-1 text-[11px]">{formatShort(note.zapAmount)}</span>}
      </button>
      <span className="w-2" />

      {/* Add to List */}
      <button
        type="button"
        aria-label="Add to List"
        className="flex h-12 items-center px-1"
        style={{ color: bookmarked ? 'var(--wisp-zap)' : 'var(--wisp-on-surface-variant)' }}
        onClick={() => setBookmarked((b) => !b)}
      >
        <Bookmark size={22} strokeWidth={1.8} fill={bookmarked ? 'currentColor' : 'none'} />
      </button>

      {/* Emoji quick-reaction popup (EmojiPicker.kt: surfaceVariant, radius 24) */}
      {pickerOpen && (
        <div
          className="absolute bottom-11 left-0 z-30 max-w-[300px] rounded-3xl p-2 shadow-lg"
          style={{ background: 'var(--wisp-surface-variant)' }}
        >
          <div className="flex flex-wrap">
            {QUICK_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                className="rounded-xl p-1.5 text-[22px] leading-none"
                onClick={() => {
                  setReaction((r) => (r === e ? null : e));
                  setPickerOpen(false);
                  registerAction?.('react');
                }}
              >
                {e}
              </button>
            ))}
            <button
              type="button"
              aria-label="More emojis"
              className="p-1.5 text-[20px] leading-none"
              style={{ color: 'var(--wisp-accent)' }}
              onClick={() => setPickerOpen(false)}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Repost / Quote popup (RepostPopup: surfaceVariant, radius 16) */}
      {repostMenuOpen && (
        <div
          className="absolute bottom-11 left-16 z-30 flex rounded-2xl px-1 py-0.5 shadow-lg"
          style={{ background: 'var(--wisp-surface-variant)' }}
        >
          <button
            type="button"
            className="px-3 py-2 text-sm font-medium"
            style={{ color: 'var(--wisp-accent)' }}
            onClick={() => {
              setReposted(true);
              setRepostMenuOpen(false);
              registerAction?.('repost');
            }}
          >
            Repost
          </button>
          <button
            type="button"
            className="px-3 py-2 text-sm font-medium"
            style={{ color: 'var(--wisp-accent)' }}
            onClick={() => {
              setRepostMenuOpen(false);
              onQuote?.();
            }}
          >
            Quote
          </button>
        </div>
      )}
    </div>
  );
}
