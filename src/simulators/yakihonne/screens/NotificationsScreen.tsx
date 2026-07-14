import React from 'react';
import { Avatar } from '../components/Avatar';
import { ChevronDownIcon, GearIcon } from '../components/icons';
import { yakiActivity, type ActivityKind } from '../data';

const verb: Record<ActivityKind, string> = {
  smart_widget: 'published a smart widget',
  video: 'published a video',
  curation: 'published a curation',
  article: 'published an article',
};

function TypeBadge({ kind }: { kind: ActivityKind }) {
  const base = 'absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center ring-2 ring-[var(--yh-bg)]';
  if (kind === 'smart_widget')
    return (
      <span className={`${base} bg-[var(--yh-green)]`}>
        <svg viewBox="0 0 24 24" className="w-[11px] h-[11px]" fill="#fff"><circle cx="7" cy="7" r="3" /><circle cx="17" cy="7" r="3" /><circle cx="7" cy="17" r="3" /><circle cx="17" cy="17" r="3" /></svg>
      </span>
    );
  if (kind === 'video')
    return (
      <span className={`${base} bg-[#ff3b30]`}>
        <svg viewBox="0 0 24 24" className="w-[10px] h-[10px]" fill="#fff"><path d="M8 5l11 7-11 7z" /></svg>
      </span>
    );
  if (kind === 'curation')
    return (
      <span className={`${base} bg-[#9aa0a6]`}>
        <svg viewBox="0 0 24 24" className="w-[11px] h-[11px]" fill="none" stroke="#fff" strokeWidth="2.4"><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.6 3.1 3 7 3s7-1.4 7-3V6" /></svg>
      </span>
    );
  return (
    <span className={`${base} bg-[#1d9bf0]`}>
      <svg viewBox="0 0 24 24" className="w-[10px] h-[10px]" fill="none" stroke="#fff" strokeWidth="2.4"><path d="M7 4h7l4 4v12H7z" /><path d="M10 12h5M10 16h5" /></svg>
    </span>
  );
}

interface Props {
  currentUserSeed: string;
  onOpenDrawer: () => void;
  onOpenNotifSettings: () => void;
}

export const NotificationsScreen: React.FC<Props> = ({ currentUserSeed, onOpenDrawer, onOpenNotifSettings }) => (
  <div className="min-h-full">
    <header className="sticky top-0 z-30 bg-[color-mix(in_srgb,var(--yh-bg)_88%,transparent)] backdrop-blur-xl">
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2.5">
        <button onClick={onOpenDrawer} aria-label="Menu">
          <Avatar seed={currentUserSeed} className="w-9 h-9" rounded="rounded-full" />
        </button>
        <span className="yakihonne-feedsel">All <ChevronDownIcon className="w-5 h-5 text-[var(--yh-text-2)]" /></span>
        <button className="yakihonne-appbar-chip" aria-label="Notification settings" onClick={onOpenNotifSettings}>
          <GearIcon className="w-6 h-6" />
        </button>
      </div>
    </header>

    <div>
      {yakiActivity.map((a) => (
        <div key={a.id} className="flex items-center gap-3.5 px-4 py-3.5 border-b border-[var(--yh-divider)]">
          <div className="relative shrink-0">
            <Avatar seed={a.seed} className="w-12 h-12" />
            <TypeBadge kind={a.kind} />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] text-[var(--yh-text-2)]">{a.timeAgo}</div>
            <div className="text-[16px] font-bold leading-tight">
              {a.name} <span className="font-bold">{verb[a.kind]}</span>
            </div>
            {a.subtitle && <div className="text-[14px] text-[var(--yh-text-2)] mt-0.5">{a.subtitle}</div>}
          </div>
        </div>
      ))}
      <div className="h-28" />
    </div>
  </div>
);

export default NotificationsScreen;
