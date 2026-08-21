import { Quote, MoreHorizontal } from 'lucide-react';
import { BorisAvatar } from './Avatar';
import { userByPubkey, type BorisHighlight } from '../borisData';
import type { MockUser } from '../../../data/mock';

/**
 * The highlight card (ui/HighlightCard.kt:161-240) — the unit that fills Feeds,
 * Search, the You tab and a profile.
 *
 * Anatomy top to bottom: an 18dp quote glyph and the relative time on one row;
 * the quote itself; the source line "— host"; then the author and the ⋯ menu.
 * 8dp corners, a 1dp border in the highlight colour, 16dp padding, 12dp gaps.
 *
 * Two details a screenshot alone would get wrong:
 *  - The quote is Source Serif, 17sp/26sp, ITALIC (HighlightCard.kt:148-153) —
 *    the only italic body text anywhere in the app.
 *  - The mark inside a CARD is painted at 45% alpha with `onBackground` text
 *    (HighlightCard.kt:121-123), not at the full strength it has in the reader.
 *    Copying the reader's solid mark here makes every feed card shout.
 *
 * The border uses `ChromeColor.of(accent, background)`, which lightens the
 * accent until it clears 3:1 against the page. On the shipped dark theme all
 * three highlight colours already clear it, so the border IS the accent; the
 * lightening only kicks in on themes where it does not.
 */

const TINT: Record<BorisHighlight['audience'], string> = {
  mine: 'var(--boris-mark-mine)',
  friends: 'var(--boris-mark-friends)',
  nostrverse: 'var(--boris-mark-others)',
};

export function HighlightCard({
  highlight,
  host,
  onOpen,
  onOpenProfile,
  tourId,
}: {
  highlight: BorisHighlight;
  host: string;
  onOpen: () => void;
  onOpenProfile: (u: MockUser) => void;
  tourId?: string;
}) {
  const tint = TINT[highlight.audience];
  const author: MockUser = userByPubkey(highlight.pubkey);

  const mark = (text: string) => (
    <span
      style={{
        background: `color-mix(in srgb, ${tint} 45%, transparent)`,
        color: 'var(--boris-on-bg)',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
      }}
    >
      {text}
    </span>
  );

  return (
    <article
      className="rounded-lg p-4"
      style={{ border: `1px solid ${tint}` }}
      data-tour={tourId}
    >
      <div className="flex items-center justify-between">
        <Quote size={18} style={{ color: tint }} />
        <span className="text-[12px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
          {highlight.ago}
        </span>
      </div>

      <button type="button" onClick={onOpen} className="mt-3 block w-full text-left">
        <p
          className="boris-prose text-[17px] italic"
          style={{ lineHeight: '26px', textAlign: 'left', color: 'var(--boris-on-bg)' }}
        >
          {highlight.pre}
          {mark(highlight.mark)}
          {highlight.post}
          {highlight.mark2 && mark(highlight.mark2)}
          {highlight.post2}
        </p>
      </button>

      <p className="mt-3 text-[12px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
        — {host}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onOpenProfile(author)}
          className="flex min-w-0 items-center gap-1.5"
        >
          <BorisAvatar seed={author.pubkey} className="h-5 w-5" />
          <span className="truncate text-[12px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
            {author.displayName}
          </span>
        </button>
        <span
          className="flex h-8 w-8 items-center justify-center"
          style={{ color: 'var(--boris-on-surface-variant)' }}
        >
          <MoreHorizontal size={18} />
        </span>
      </div>
    </article>
  );
}
