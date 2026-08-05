import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * TabButton — ViewFragments/TabButton.swift.
 *
 * THE detail: the label is `theme.accent` whether the tab is selected or not.
 * Selection is signalled ONLY by the 1 px accent rule underneath. The usual
 * "gray inactive → white active" pattern would read as a different app.
 */
export function TabButton({
  label,
  icon,
  secondary,
  selected,
  unread,
  onClick,
  ...rest
}: {
  label?: string;
  icon?: React.ReactNode;
  secondary?: string;
  selected: boolean;
  unread?: number;
  onClick: () => void;
} & Record<string, unknown>) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className="nostur-tabbtn"
      {...rest}
    >
      <span className="nostur-tabbtn-label">
        {icon ?? <span className="truncate">{label}</span>}
        {secondary && <span className="nostur-tabbtn-secondary">{secondary}</span>}
        {unread ? (
          <span
            className="rounded-full px-1.5 text-[13px] font-normal text-white"
            style={{ background: 'var(--nostur-badge)' }}
          >
            {unread}
          </span>
        ) : null}
      </span>
      <span className="nostur-tabbtn-rule" />
    </button>
  );
}

/** iOS nav bar: teal back chevron + origin, bold centred title, trailing slot. */
export function NavBar({
  back,
  title,
  center,
  trailing,
}: {
  back?: { label: string; onClick: () => void };
  title?: string;
  center?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-1 px-3 py-2"
      style={{ background: 'var(--nostur-list-bg)', minHeight: 44 }}
    >
      <div className="flex min-w-0 flex-1 items-center">
        {back && (
          <button
            type="button"
            onClick={back.onClick}
            className="-ml-1 flex items-center text-[17px]"
            style={{ color: 'var(--nostur-accent)' }}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            <span className="truncate">{back.label}</span>
          </button>
        )}
      </div>
      <div className="flex min-w-0 shrink-0 items-center justify-center gap-1.5">
        {center}
        {title && <span className="truncate text-[17px] font-bold">{title}</span>}
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-3">{trailing}</div>
    </div>
  );
}

/** Large iOS navigation title (Settings, Notifications, Search, Feeds). */
export function ScreenTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="shrink-0 px-4 pb-1 pt-1 text-[17px] font-bold">{children}</h2>;
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="nostur-switch"
    >
      <span className="nostur-switch-thumb" />
    </button>
  );
}

export function SettingRow({
  icon,
  title,
  caption,
  trailing,
  chevron,
  danger,
  onClick,
}: {
  icon?: React.ReactNode;
  title: string;
  caption?: string;
  trailing?: React.ReactNode;
  chevron?: boolean;
  danger?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <>
      {icon && (
        <span className="shrink-0" style={{ color: danger ? 'var(--nostur-red)' : 'var(--nostur-accent)' }}>
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate" style={danger ? { color: 'var(--nostur-red)' } : undefined}>
          {title}
        </span>
        {caption && (
          <span className="block text-[12px] leading-tight" style={{ color: 'var(--nostur-secondary)' }}>
            {caption}
          </span>
        )}
      </span>
      {trailing}
      {chevron && <ChevronRight className="h-4 w-4 shrink-0" style={{ color: 'var(--nostur-tertiary)' }} />}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="nostur-row">
        {body}
      </button>
    );
  }
  return <div className="nostur-row">{body}</div>;
}

export function Segmented({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="nostur-segmented" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="tab"
          aria-selected={o === value}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/**
 * FollowButtonInner (Screens/Layout/NosturStyles.swift) — deliberately
 * MONOCHROME, not accent: 105x30 capsule, caption/heavy, 1 px gray stroke,
 * inverted fill when you already follow. Private-follow prefixes "🤫".
 */
export function FollowPill({
  following,
  onClick,
}: {
  following: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-following={following}
      className="nostur-followbtn"
    >
      {following ? 'Following' : 'Follow'}
    </button>
  );
}

/** The inline "Follow" link that sits next to a timestamp in the feed. */
export function FollowLink({ following, onClick }: { following: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[15px] font-bold"
      style={{ color: 'var(--nostur-accent)' }}
    >
      {following ? 'Unfollow' : 'Follow'}
    </button>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-6 py-8 text-center text-[15px]" style={{ color: 'var(--nostur-secondary)' }}>
      {children}
    </p>
  );
}
