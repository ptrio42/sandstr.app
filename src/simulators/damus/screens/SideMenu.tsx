import React from 'react';
import type { MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import {
  SmilePlusIcon, QrIcon, CopyIcon, PersonIcon, WalletIcon, OstrichIcon, MuteIcon,
  RelayIcon, BookmarkIcon, StoreIcon, GearIcon, LogoutIcon,
} from '../components/icons';

export type MenuDest = 'profile' | 'wallet' | 'purple' | 'muted' | 'relays' | 'bookmarks' | 'merch' | 'settings' | 'logout';

interface Props {
  currentUser: MockUser | null;
  onClose: () => void;
  onNav: (d: MenuDest) => void;
}

// Damus left drawer opened from the profile avatar. Renders at final position (no slide)
// because the preview environment freezes enter-animations.
export const SideMenu: React.FC<Props> = ({ currentUser, onClose, onNav }) => {
  const name = currentUser?.displayName || 'sandy';
  const handle = currentUser?.username || 'sandy';
  const npub = 'npub1' + handle.padEnd(6, 'x').slice(0, 6) + '…' + (currentUser?.pubkey || '').slice(-6);

  const items: { d: MenuDest; label: string; Icon: typeof PersonIcon; special?: boolean; dim?: boolean }[] = [
    { d: 'profile', label: 'Profile', Icon: PersonIcon },
    { d: 'wallet', label: 'Wallet', Icon: WalletIcon },
    { d: 'purple', label: 'Purple', Icon: OstrichIcon, special: true },
    { d: 'muted', label: 'Muted', Icon: MuteIcon },
    { d: 'relays', label: 'Relays', Icon: RelayIcon },
    { d: 'bookmarks', label: 'Bookmarks', Icon: BookmarkIcon },
    { d: 'merch', label: 'Merch', Icon: StoreIcon, dim: true },
    { d: 'settings', label: 'Settings', Icon: GearIcon },
    { d: 'logout', label: 'Logout', Icon: LogoutIcon },
  ];

  return (
    <div className="absolute inset-0 z-[60] flex">
      <div className="w-[80%] max-w-[300px] h-full bg-[var(--damus-bg)] px-5 pt-4 overflow-y-auto">
        {/* header */}
        <div className="flex items-start justify-between">
          <Avatar seed={handle} className="w-16 h-16" />
          <div className="flex gap-2 mt-1">
            <button className="w-9 h-9 rounded-full bg-[var(--damus-bg-tertiary)] flex items-center justify-center text-[var(--damus-text)]"><SmilePlusIcon className="w-5 h-5" /></button>
            <button className="w-9 h-9 rounded-full bg-[var(--damus-bg-tertiary)] flex items-center justify-center text-[var(--damus-text)]"><QrIcon className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="mt-3">
          <div className="font-bold text-[22px] text-[var(--damus-text)]">{name}</div>
          <div className="text-[15px] text-[var(--damus-text-secondary)]">@{handle}</div>
        </div>
        <button className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--damus-bg-secondary)] text-[13px] text-[var(--damus-text-secondary)]">
          {npub} <CopyIcon className="w-4 h-4" />
        </button>

        {/* menu */}
        <nav className="mt-5 space-y-0.5">
          {items.map(({ d, label, Icon, special, dim }) => (
            <button
              key={d}
              onClick={() => onNav(d)}
              className={`w-full flex items-center gap-4 py-3 ${dim ? 'opacity-45' : ''}`}
            >
              <Icon className={`w-6 h-6 ${special ? 'text-[var(--damus-deep-purple)]' : 'text-[var(--damus-text)]'}`} />
              <span className={`text-[19px] font-semibold ${special ? 'text-[var(--damus-deep-purple)]' : 'text-[var(--damus-text)]'}`}>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* dimmed rest closes the drawer */}
      <button className="flex-1 h-full bg-black/50" aria-label="Close menu" onClick={onClose} />
    </div>
  );
};

export default SideMenu;
