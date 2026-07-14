import React from 'react';
import { HomeIcon, VideoIcon, WalletIcon, InboxIcon, BellIcon, PlusIcon } from './icons';

export type YakiTab = 'home' | 'media' | 'wallet' | 'dms' | 'notifications';

interface TabBarProps {
  active: YakiTab;
  onNavigate: (t: YakiTab) => void;
  onCompose: () => void;
}

// YakiHonne bottom bar: exactly 5 icon-only tabs (Home · Media · Wallet · DMs · Notifications).
// Active tab is NOT orange — it uses the filled icon variant + a tiny dot below (white/black).
// The compose FAB is a SEPARATE orange button, shown only on Home & Media.
export const TabBar: React.FC<TabBarProps> = ({ active, onNavigate, onCompose }) => {
  const tabs: { id: YakiTab; Icon: typeof HomeIcon; badge?: boolean }[] = [
    { id: 'home', Icon: HomeIcon },
    { id: 'media', Icon: VideoIcon },
    { id: 'wallet', Icon: WalletIcon },
    { id: 'dms', Icon: InboxIcon, badge: true },
    { id: 'notifications', Icon: BellIcon, badge: true },
  ];

  const showFab = active === 'home' || active === 'media';

  return (
    <>
      {showFab && (
        <button className="yakihonne-fab" aria-label="Compose" data-tour="yakihonne-compose" onClick={onCompose}>
          <PlusIcon className="w-7 h-7" />
        </button>
      )}

      <nav className="yakihonne-tabbar">
        {tabs.map(({ id, Icon, badge }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              className={`yakihonne-tab ${isActive ? 'active' : ''}`}
              aria-label={id}
              data-tour={id === 'home' ? 'yakihonne-feed' : undefined}
              onClick={() => onNavigate(id)}
            >
              <Icon className="w-[26px] h-[26px]" filled={isActive} />
              {badge && <span className="yh-badge" />}
              {isActive && <span className="yh-tab-dot" />}
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default TabBar;
