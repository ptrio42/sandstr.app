import React from 'react';
import { Home, CreditCard, Search, MessagesSquare, Bell } from 'lucide-react';

export type WispTab = 'home' | 'wallet' | 'messages' | 'search' | 'notifications';

/**
 * Bottom navigation (BottomBar.kt): 56dp bar on the BACKGROUND color (not
 * surface) under a hairline divider; 5 icon-only tabs — Home · Wallet(card) ·
 * Search · Messages(two bubbles) · Notifications(bell). Selected = accent
 * tint only, NO Material indicator pill ("matches iOS"). Unread badge = 8dp
 * iOS-red dot, top-end (Home/Messages/Notifications only).
 */
interface BottomBarProps {
  activeTab: WispTab;
  onTabChange: (tab: WispTab) => void;
  unread?: Partial<Record<'home' | 'messages' | 'notifications', boolean>>;
}

const TABS: { id: WispTab; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'wallet', label: 'Wallet', Icon: CreditCard },
  { id: 'search', label: 'Search', Icon: Search },
  { id: 'messages', label: 'Messages', Icon: MessagesSquare },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
];

export function BottomBar({ activeTab, onTabChange, unread = {} }: BottomBarProps) {
  return (
    <nav className="shrink-0" style={{ background: 'var(--wisp-bg)' }} data-tour="wisp-tabs">
      <div className="wisp-divider" style={{ background: 'var(--wisp-outline-variant)', opacity: 0.5 }} />
      <div className="flex h-14 items-center justify-around">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          const dot = id in unread && unread[id as keyof typeof unread];
          return (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className="relative flex h-full w-14 items-center justify-center"
              onClick={() => onTabChange(id)}
            >
              <Icon
                size={24}
                strokeWidth={active ? 2.4 : 1.8}
                style={{ color: active ? 'var(--wisp-accent)' : 'var(--wisp-on-surface-variant)' }}
                fill={active && id !== 'search' ? 'var(--wisp-accent)' : 'none'}
              />
              {dot && (
                <span
                  className="absolute right-3.5 top-3.5 h-2 w-2 rounded-full"
                  style={{ background: 'var(--wisp-error)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
