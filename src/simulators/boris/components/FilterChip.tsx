import type { ReactNode } from 'react';

/**
 * Material 3 `FilterChip` as ContentTabs.kt:128-152 configures it: 18dp leading
 * icon, labelLarge, and `selectedContainerColor = secondaryContainer` — so a
 * selected chip and the selected bottom-bar tab wear the same #4A4458, which is
 * what makes the chip rows read as one system.
 * Unselected is transparent with a 1dp `outline` border; M3 drops the border
 * once the chip is selected.
 *
 * The two colours inside an UNSELECTED chip differ, and they were both wrong
 * here until the 2026-08-22 recording was sampled: the leading icon is
 * `primary` (measured #6264ef on the Library and Feeds rows, i.e. Indigo500
 * #6366F1) while the label is `onSurfaceVariant` (measured #a1a0a9 = #A1A1AA).
 * Painting both `onBackground` made every chip row a shade louder than the real
 * app and lost the one indigo accent M3 puts there on purpose.
 */
export function FilterChip({
  selected,
  label,
  icon,
  disabled,
  onClick,
  tourId,
}: {
  selected: boolean;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  tourId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      data-tour={tourId}
      className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[14px] font-medium disabled:opacity-40"
      style={{
        background: selected ? 'var(--boris-secondary-container)' : 'transparent',
        border: selected ? '1px solid transparent' : '1px solid var(--boris-outline)',
        color: selected ? 'var(--boris-on-secondary-container)' : 'var(--boris-on-surface-variant)',
      }}
    >
      <span
        className="flex h-[18px] w-[18px] items-center justify-center"
        style={{ color: selected ? 'var(--boris-on-secondary-container)' : 'var(--boris-primary)' }}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}
