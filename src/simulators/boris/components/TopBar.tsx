import type { ReactNode } from 'react';

/**
 * Material 3 small `TopAppBar` as Boris configures it everywhere: 64dp tall,
 * `containerColor = background` AND `scrolledContainerColor = background`
 * (ui/home/HomeScreen.kt:222-226), so it never tints away from the page the way
 * a stock M3 bar does when content scrolls under it.
 */
export function TopBar({
  navigation,
  title,
  actions,
  tourId,
}: {
  navigation?: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
  tourId?: string;
}) {
  return (
    <div
      className="flex h-16 shrink-0 items-center gap-1 overflow-hidden pl-1 pr-1"
      style={{ background: 'var(--boris-bg)' }}
      data-tour={tourId}
    >
      {navigation}
      {/* A floor, not min-w-0. The stage sizes the device off available HEIGHT
          (ClientView -> aspect-[9/19.5]), so a short window hands Boris a screen
          narrower than any real Android phone — measured 269 px at a 720 px
          viewport. With min-w-0 the five fixed 48 px actions on Feeds took all
          of it and the title rendered as "F…". The floor makes the title
          inflexible instead, and the shortfall comes out of the IconButtons
          below, which is why they are shrinkable down to 36 px. Above a ~316 px
          screen nothing shrinks and the bar is byte-for-byte what it was. */}
      {/* Screen titles are SERIF (`titleLarge`, Source Serif SemiBold), not the
          sans `titleMedium` an M3 bar would use. Measured on the 2026-08-22
          recording: "Your Library", "Feeds", "Search" and "Settings" all render
          with serifs; the reader's article title is the one sans title in the
          app, which is why ReaderScreen draws its own bar. */}
      <div
        className="boris-display min-w-[3.5rem] flex-1 truncate text-[19px] font-semibold"
        style={{ color: 'var(--boris-on-bg)' }}
      >
        {title}
      </div>
      {actions}
    </div>
  );
}

/** 48dp touch target, 24dp glyph — M3 `IconButton`. */
export function IconButton({
  label,
  onClick,
  children,
  tourId,
  tint = 'var(--boris-on-bg)',
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  tourId?: string;
  tint?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      data-tour={tourId}
      className="flex h-12 w-12 min-w-[2.25rem] shrink items-center justify-center rounded-full"
      style={{ color: tint }}
    >
      {children}
    </button>
  );
}
