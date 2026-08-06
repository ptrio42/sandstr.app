import React from 'react';
import { Avatar } from '../components/Avatar';
import { ChevronDownIcon, EllipsisVIcon, SearchIcon, ComposeDmIcon } from '../components/icons';
import { yakiDMs } from '../data';

interface Props {
  currentUserSeed: string;
  onOpenDrawer: () => void;
}

export const MessagesScreen: React.FC<Props> = ({ currentUserSeed, onOpenDrawer }) => (
  <div className="min-h-full relative" data-tour="yakihonne-dms">
    <header className="sticky top-0 z-30 bg-[color-mix(in_srgb,var(--yh-bg)_88%,transparent)] backdrop-blur-xl">
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
        <button onClick={onOpenDrawer} aria-label="Menu">
          <Avatar seed={currentUserSeed} className="w-9 h-9" rounded="rounded-full" />
        </button>
        <span className="yakihonne-feedsel">Followings <ChevronDownIcon className="w-5 h-5 text-[var(--yh-text-2)]" /></span>
        <button className="yakihonne-appbar-chip" aria-label="More"><EllipsisVIcon className="w-5 h-5" /></button>
      </div>
      {/* search */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2.5 rounded-2xl bg-[var(--yh-surface-2)] px-4 py-3 text-[var(--yh-text-2)]">
          <SearchIcon className="w-5 h-5" />
          <span className="text-[15px]">Search by username</span>
        </div>
      </div>
    </header>

    <div>
      {yakiDMs.map((dm, i) => (
        <button key={i} className="w-full flex items-center gap-3 px-4 py-3 text-left">
          <Avatar seed={dm.seed} className="w-12 h-12" />
          <div className="flex-1 min-w-0">
            <div className="text-[16px] font-bold truncate">{dm.name}</div>
            <div className="text-[14px] text-[var(--yh-text-2)] truncate">
              {dm.fromYou && <span className="font-semibold text-[var(--yh-text)]">You: </span>}{dm.preview}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-[13px] text-[var(--yh-text-2)]">{dm.time}</span>
            {dm.unread && <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30]" />}
          </div>
        </button>
      ))}
      <div className="h-28" />
    </div>

    <button className="yakihonne-fab" aria-label="New message">
      <ComposeDmIcon className="w-7 h-7" />
    </button>
  </div>
);

export default MessagesScreen;
