import React from 'react';
import { Bookmark, Heart, MessageSquare, Repeat2, Zap } from 'lucide-react';
import { compact } from '../nosturData';

export interface ActionState {
  replied: boolean;
  reposted: boolean;
  reacted: boolean;
  zapped: boolean;
  bookmarked: boolean;
}

export interface ActionCounts {
  replies: number;
  reposts: number;
  reactions: number;
  zapSats: number;
}

/**
 * Post/PostFooter/CustomizableFooter.swift.
 *
 * The button row is user-configurable; the SHIPPED DEFAULT is
 * `footerButtons: "💬🔄+⚡️🔖"` (Screens/Settings/SettingsStore.swift:228), and
 * the `+` slot is the EmojiButton — which draws a HEART
 * (EmojiButton.swift:32 `heart` / `heart.fill`), not an emoji picker glyph.
 *
 * Layout is `HStack(spacing: 0)` with a `Spacer()` between every button, i.e.
 * space-between across the full width. Counts sit to the right of the icon and
 * are hidden at 0. The whole row is tinted `theme.footerButtons` (= accent);
 * exactly one icon takes a system colour when its action is active:
 * reply → accent, repost → .green, react → .red, zap → .yellow,
 * bookmark → .orange (BookmarkButton.swift:438 `addBookmark(_ color: = .orange)`).
 *
 * The zap button is dimmed to 0.3 and disabled when the author has no lightning
 * address — visible on most rows in the recording.
 */
export function ActionBar({
  state,
  counts,
  canZap,
  onReply,
  onRepost,
  onReact,
  onZap,
  onBookmark,
}: {
  state: ActionState;
  counts: ActionCounts;
  canZap: boolean;
  onReply: () => void;
  onRepost: () => void;
  onReact: () => void;
  onZap: () => void;
  onBookmark: () => void;
}) {
  return (
    <div className="nostur-actionbar" data-tour="nostur-actionbar">
      <button
        type="button"
        className="nostur-action"
        data-role="reply"
        data-active={state.replied}
        aria-label="Reply"
        onClick={onReply}
      >
        <MessageSquare className="h-[18px] w-[18px]" fill={state.replied ? 'currentColor' : 'none'} />
        {counts.replies > 0 && <span>{compact(counts.replies)}</span>}
      </button>

      <button
        type="button"
        className="nostur-action"
        data-role="repost"
        data-active={state.reposted}
        aria-label="Repost"
        onClick={onRepost}
      >
        <Repeat2 className="h-[19px] w-[19px]" />
        {counts.reposts > 0 && <span>{compact(counts.reposts)}</span>}
      </button>

      <button
        type="button"
        className="nostur-action"
        data-role="react"
        data-active={state.reacted}
        aria-label="React"
        onClick={onReact}
      >
        <Heart className="h-[18px] w-[18px]" fill={state.reacted ? 'currentColor' : 'none'} />
        {counts.reactions > 0 && <span>{compact(counts.reactions)}</span>}
      </button>

      <button
        type="button"
        className="nostur-action"
        data-role="zap"
        data-active={state.zapped}
        aria-label="Zap"
        disabled={!canZap}
        onClick={onZap}
        data-tour="nostur-zap"
      >
        <Zap className="h-[18px] w-[18px]" fill={state.zapped ? 'currentColor' : 'none'} />
        {counts.zapSats > 0 && (
          <span>
            {compact(counts.zapSats)} <span>sats</span>
          </span>
        )}
      </button>

      <button
        type="button"
        className="nostur-action"
        data-role="bookmark"
        data-active={state.bookmarked}
        aria-label="Bookmark"
        onClick={onBookmark}
      >
        <Bookmark className="h-[18px] w-[18px]" fill={state.bookmarked ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}

export default ActionBar;
