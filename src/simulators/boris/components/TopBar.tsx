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
      className="flex h-16 shrink-0 items-center gap-1 pl-1 pr-1"
      style={{ background: 'var(--boris-bg)' }}
      data-tour={tourId}
    >
      {navigation}
      <div className="min-w-0 flex-1 truncate text-[17px] font-medium" style={{ color: 'var(--boris-on-bg)' }}>
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
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
      style={{ color: tint }}
    >
      {children}
    </button>
  );
}
