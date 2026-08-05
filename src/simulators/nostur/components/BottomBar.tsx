import React from 'react';
import { Bell, Bookmark, House, Mail, Search } from 'lucide-react';
import type { NosturTab } from '../types';

/**
 * MainTabs15 (Screens/MainTabs/MainTabs.swift) — the five-tab bar the recording
 * shows: house · bookmark · magnifyingglass · bell.fill · envelope.fill.
 *
 * [REC vs REPO] the repo's iOS-26 path (MainTabs26) drops Messages and adds a
 * "New Post" tab in its place, moving Messages into the sidebar. The recording
 * runs the pre-26 shape — envelope tab present, plus a separate floating compose
 * button — so that is what ships. See docs/refs/nostur/screen-map.md §16.
 *
 * Icon-only, no labels. Selected = accent, unselected = the iOS system gray.
 */
const TABS: { id: NosturTab; label: string; Icon: typeof House; alwaysFilled?: boolean }[] = [
  { id: 'home', label: 'Home', Icon: House },
  { id: 'bookmarks', label: 'Bookmarks', Icon: Bookmark, alwaysFilled: true },
  { id: 'search', label: 'Search', Icon: Search },
  // The repo asks for the .fill variants of these two specifically.
  { id: 'notifications', label: 'Notifications', Icon: Bell, alwaysFilled: true },
  { id: 'messages', label: 'Messages', Icon: Mail },
];

export function BottomBar({
  active,
  onSelect,
  badges,
}: {
  active: NosturTab;
  onSelect: (t: NosturTab) => void;
  badges?: Partial<Record<NosturTab, number>>;
}) {
  return (
    <nav className="nostur-tabbar" aria-label="Main">
      {TABS.map(({ id, label, Icon, alwaysFilled }) => {
        const selected = active === id;
        const badge = badges?.[id];
        const filled = alwaysFilled || (selected && id === 'home');
        return (
          <button
            key={id}
            type="button"
            aria-selected={selected}
            aria-label={label}
            role="tab"
            onClick={() => onSelect(id)}
            className="nostur-tabbar-item"
            data-tour={`nostur-tab-${id}`}
          >
            <Icon
              className="h-[23px] w-[23px]"
              strokeWidth={1.9}
              fill={filled ? 'currentColor' : 'none'}
            />
            {badge ? <span className="nostur-tabbar-badge">{badge}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}

export default BottomBar;
