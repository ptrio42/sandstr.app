import { Focus, Pause, Play, Rewind, FastForward, X } from 'lucide-react';

/**
 * The text-to-speech mini player (ui/shell/TtsMiniPlayer.kt:132-224).
 *
 * 56dp tall over a 1dp `outline` divider, on `background` at 95% alpha, with
 * 16dp of leading padding and 8dp of trailing. Strictly left to right: the
 * article title (weight 1, tap = open the article) · the speed chip · the
 * follow-along toggle · previous paragraph · play/pause · next paragraph · an
 * 8dp spacer that exists only to separate the close button · close.
 *
 * The speed chip is outline-only, no fill, 8dp corners, and its label drops the
 * decimal on whole numbers — "2x", not "2.0x" (TtsMiniPlayer.kt:285-286).
 *
 * Mounting differs by route in the real app: above the bottom bar on the five
 * tabs, as a bottom overlay on Settings/About/Support/Profile, and inside the
 * reader stacked over the reading-progress bar. It is never shown in the in-app
 * browser (BorisApp.kt:455).
 */
export function TtsMiniPlayer({
  title,
  playing,
  speed,
  followAlong,
  onToggle,
  onClose,
  onOpenArticle,
  onSkip,
}: {
  title: string;
  playing: boolean;
  speed: string;
  followAlong: boolean;
  onToggle: () => void;
  onClose: () => void;
  onOpenArticle: () => void;
  onSkip: (delta: number) => void;
}) {
  return (
    <div
      className="shrink-0"
      style={{ background: 'color-mix(in srgb, var(--boris-bg) 95%, transparent)' }}
      data-tour="boris-tts-player"
    >
      <div style={{ height: 1, background: 'var(--boris-outline)' }} />
      <div className="flex h-14 items-center gap-1 pl-4 pr-2">
        <button
          type="button"
          aria-label="Open article"
          onClick={onOpenArticle}
          className="min-w-0 flex-1 truncate text-left text-[14px] font-medium"
          style={{ color: 'var(--boris-on-bg)' }}
        >
          {title}
        </button>
        <span
          className="rounded-lg px-2 py-1.5 text-[14px] font-medium"
          style={{ border: '1px solid var(--boris-outline)', color: 'var(--boris-on-bg)' }}
        >
          {speed}
        </span>
        <button
          type="button"
          aria-label={followAlong ? 'Turn follow-along off' : 'Turn follow-along on'}
          className="flex h-12 w-12 items-center justify-center"
          style={{ color: followAlong ? 'var(--boris-primary)' : 'var(--boris-on-surface-variant)' }}
        >
          <Focus size={24} />
        </button>
        <button
          type="button"
          aria-label="Previous paragraph"
          onClick={() => onSkip(-1)}
          className="flex h-12 w-12 items-center justify-center"
          style={{ color: 'var(--boris-on-bg)' }}
        >
          <Rewind size={24} />
        </button>
        <button
          type="button"
          aria-label={playing ? 'Pause playback' : 'Resume playback'}
          onClick={onToggle}
          className="flex h-12 w-12 items-center justify-center"
          style={{ color: 'var(--boris-on-bg)' }}
        >
          {playing ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          type="button"
          aria-label="Next paragraph"
          onClick={() => onSkip(1)}
          className="flex h-12 w-12 items-center justify-center"
          style={{ color: 'var(--boris-on-bg)' }}
        >
          <FastForward size={24} />
        </button>
        <span style={{ width: 8 }} />
        <button
          type="button"
          aria-label="Dismiss TTS player"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center"
          style={{ color: 'var(--boris-on-surface-variant)' }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
