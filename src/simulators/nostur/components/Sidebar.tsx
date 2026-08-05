import React from 'react';
import {
  Bookmark,
  Copy,
  LayoutList,
  LogOut,
  Medal,
  MoreHorizontal,
  Settings,
  Signature,
  User,
  UserMinus,
} from 'lucide-react';
import type { MockUser } from '../../../data/mock';
import { Avatar } from './Avatar';
import type { DrawerDestination } from '../types';

/**
 * Screens/Layout/Sidebar.swift. `NOSTUR_SIDEBAR_WIDTH = 310` pt — ~75 % of a
 * 414 pt screen, which is what the recording measures.
 *
 * Rows are accent icon AND accent label (Nostur tints far more chrome than its
 * peers). There is deliberately NO "Messages" row: the repo gates it behind
 * `#available(iOS 26.0, *)` and the recording's device is pre-26 — screen-map §16.
 */
const ROWS: { id: DrawerDestination; label: string; Icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', Icon: User },
  { id: 'feeds', label: 'Lists & Feeds', Icon: LayoutList },
  { id: 'bookmarks', label: 'Bookmarks', Icon: Bookmark },
  { id: 'badges', label: 'Badges', Icon: Medal },
  { id: 'settings', label: 'Settings', Icon: Settings },
  { id: 'blocklist', label: 'Block list', Icon: UserMinus },
  { id: 'signer', label: 'Signer', Icon: Signature },
];

export function Sidebar({
  user,
  followingCount,
  onNavigate,
  onLogout,
}: {
  user: MockUser;
  followingCount: number;
  onNavigate: (d: DrawerDestination) => void;
  onLogout: () => void;
}) {
  const npub = `${user.pubkey.slice(0, 11)}…`;

  return (
    <aside className="nostur-sidebar" data-tour="nostur-sidebar">
      {/* Banner: ProfileBanner's fallback is LinearGradient([listBackground, accent]) */}
      <div className="relative h-[120px] shrink-0 nostur-banner-fallback">
        <div className="absolute -bottom-9 left-4">
          <div className="rounded-full" style={{ padding: 3, background: 'var(--nostur-list-bg)' }}>
            <Avatar seed={user.pubkey} size={78} />
          </div>
        </div>
        <div className="absolute -bottom-6 right-3 flex items-center gap-2.5">
          <Avatar seed={`switcher:${user.pubkey}`} size={34} />
          <MoreHorizontal
            className="h-[25px] w-[25px] rounded-full"
            style={{ color: 'var(--nostur-accent)' }}
          />
        </div>
      </div>

      <div className="nostur-scroll px-4 pt-12">
        <p className="text-[22px] font-bold leading-tight">{user.displayName}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[17px]">
          <span className="truncate">{npub}</span>
          <Copy className="h-4 w-4 shrink-0" style={{ color: 'var(--nostur-accent)' }} />
        </p>
        <p className="mt-0.5 text-[13px]">
          <strong>{followingCount}</strong>&nbsp;&nbsp;Following
        </p>

        <div className="mt-4">
          {ROWS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className="nostur-sidebar-row"
              onClick={() => onNavigate(id)}
              data-tour={`nostur-drawer-${id}`}
            >
              <span className="nostur-sidebar-row-icon">
                <Icon className="h-[19px] w-[19px]" />
              </span>
              <span>{label}</span>
            </button>
          ))}
          <button type="button" className="nostur-sidebar-row" onClick={onLogout}>
            <span className="nostur-sidebar-row-icon">
              <LogOut className="h-[19px] w-[19px]" />
            </span>
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Footer prints the exact build; "Source code" links the repo. */}
      <div className="shrink-0 px-4 pb-4 pt-2 text-[13px]">
        <p style={{ color: 'var(--nostur-secondary)' }}>Nostur 1.30.2 (Build: 527)</p>
        <a
          href="https://github.com/nostur-com/nostur-ios-public"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: 'var(--nostur-accent)' }}
        >
          Source code
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;
