import { FileText, StickyNote } from 'lucide-react';
import type { BorisArticle } from '../borisData';

/**
 * The Home carousel card (ui/home/HomeScreen.kt:866-930).
 * 140dp wide, a 140×140 cover clipped to 12dp on `surfaceVariant`, then the
 * title (bodyMedium sans, semibold, max 2 lines) and the host (bodySmall,
 * onSurfaceVariant, 1 line). Coverless articles get a 28dp glyph tinted with
 * the SECTION's colour, not a neutral grey — `Article` for a web page,
 * `StickyNote2` for a nostr note (HomeScreen.kt:897-905).
 *
 * Nothing is drawn ON the cover. An earlier version painted the article's
 * teaser line over it in highlight yellow — scaffolding from when every cover
 * was a flat generated gradient and the card needed something to say. Real
 * cover art arrived, and the overlay was both illegible on pale covers and
 * absent from the real app, where the title lives BELOW the picture.
 */

export function CardReadingProgress({ percent }: { percent: number }) {
  // Renders nothing until the article has actually been opened (percent <= 0),
  // which is why most cards on a fresh Home have no strip at all.
  if (percent <= 0) return null;
  const clamped = Math.min(100, Math.max(1, percent));
  // ReadingProgress.kt:78-82 — three states, and "started" is only 1..10%.
  const color =
    clamped >= 95
      ? '#22C55E'
      : clamped <= 10
        ? 'var(--boris-on-bg)'
        : 'var(--boris-primary)';
  return (
    <div
      className="h-[2px] w-full overflow-hidden rounded-full"
      style={{ background: 'color-mix(in srgb, var(--boris-outline) 30%, transparent)' }}
    >
      <div className="h-full" style={{ width: `${clamped}%`, background: color }} />
    </div>
  );
}

export function ArticleCard({
  article,
  tint,
  progress = 0,
  onOpen,
  tourId,
}: {
  article: BorisArticle;
  /** the section's colour — also the coverless glyph's tint */
  tint: string;
  progress?: number;
  onOpen: () => void;
  tourId?: string;
}) {
  const isNote = article.domain === 'nostr';
  return (
    <button
      type="button"
      onClick={onOpen}
      data-tour={tourId}
      className="flex w-[140px] shrink-0 flex-col gap-2 text-left"
    >
      <div
        className="relative flex h-[140px] w-[140px] items-center justify-center overflow-hidden rounded-xl"
        style={{ background: 'var(--boris-surface-variant)' }}
      >
        {article.cover ? (
          <img src={article.cover} alt="" className="h-full w-full object-cover" />
        ) : isNote ? (
          <StickyNote size={28} style={{ color: tint }} />
        ) : (
          <FileText size={28} style={{ color: tint }} />
        )}
      </div>
      <span
        className="line-clamp-2 text-[14px] font-semibold leading-[18px]"
        style={{ color: 'var(--boris-on-bg)' }}
      >
        {article.title}
      </span>
      <span
        className="truncate text-[12px] leading-none"
        style={{ color: 'var(--boris-on-surface-variant)' }}
      >
        {article.domain}
      </span>
      <CardReadingProgress percent={progress} />
    </button>
  );
}
