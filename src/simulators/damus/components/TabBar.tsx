import React from 'react';
import { HomeIcon, MailIcon, SearchIcon, BellIcon, PlusIcon } from './icons';

export type DamusTab = 'home' | 'dms' | 'search' | 'notifications';

interface TabBarProps {
  activeTab: DamusTab;
  onNavigate: (t: DamusTab) => void;
  onCompose: () => void;
  notificationDot?: boolean;
}

// Damus bottom bar: exactly 4 icon tabs (Home · DMs · Search/Universe · Notifications),
// no labels; compose is a separate floating action button, not a center tab.
export const TabBar: React.FC<TabBarProps> = ({ activeTab, onNavigate, onCompose, notificationDot = true }) => {
  const tabs: { id: DamusTab; Icon: typeof HomeIcon; tour?: string }[] = [
    { id: 'home', Icon: HomeIcon },
    { id: 'dms', Icon: MailIcon },
    { id: 'search', Icon: SearchIcon },
    { id: 'notifications', Icon: BellIcon },
  ];

  return (
    <>
      <button className="damus-fab" aria-label="Compose note" data-tour="damus-compose" onClick={onCompose}>
        <PlusIcon className="w-7 h-7" />
      </button>

      <nav className="damus-tabbar">
        {tabs.map(({ id, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              className={`damus-tab ${active ? 'active' : ''}`}
              aria-label={id}
              onClick={() => onNavigate(id)}
            >
              <Icon filled={active} />
              {id === 'notifications' && notificationDot && (
                <span className="absolute top-0 right-1.5 w-2 h-2 rounded-full bg-[var(--damus-purple)]" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default TabBar;
