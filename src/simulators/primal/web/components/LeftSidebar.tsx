import React from 'react';
import { Home, AlignLeft, Compass, Mail, Bookmark, Bell, Download, BadgeCheck, Settings, Clock } from 'lucide-react';
import { PrimalLogo } from './PrimalLogo';
import { Avatar } from './Avatar';
import { currentUser } from '../data';
import type { TabId } from '../WebSimulator';

interface NavDef { id: TabId; label: string; Icon: React.ComponentType<any>; fillable?: boolean; badge?: string; }

const NAV: NavDef[] = [
  { id: 'home', label: 'Home', Icon: Home, fillable: true },
  { id: 'reads', label: 'Reads', Icon: AlignLeft },
  { id: 'explore', label: 'Explore', Icon: Compass },
  // Mail is NOT fillable — filling the envelope rect renders a solid rectangle
  { id: 'messages', label: 'Messages', Icon: Mail, badge: '99+' },
  { id: 'bookmarks', label: 'Bookmarks', Icon: Bookmark, fillable: true },
  { id: 'notifications', label: 'Notifications', Icon: Bell, fillable: true, badge: '99+' },
  { id: 'downloads', label: 'Downloads', Icon: Download, badge: '2' },
  { id: 'premium', label: 'Premium', Icon: BadgeCheck, badge: '1' },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

interface LeftSidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onNewNote: () => void;
  onOpenProfile: () => void;
  showPending?: boolean;
}

export function LeftSidebar({ activeTab, onTabChange, onNewNote, onOpenProfile, showPending }: LeftSidebarProps) {
  return (
    <div className="primal-col-left">
      <div className="primal-col-left-inner">
        <button onClick={() => onTabChange('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <PrimalLogo />
        </button>

        <nav className="primal-nav">
          {NAV.map(({ id, label, Icon, fillable, badge }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                className={`primal-nav-item${active ? ' active' : ''}`}
                onClick={() => onTabChange(id)}
                // Family anchor (gaps pri-02) — `primal-nav-<tab>` for every row;
                // `primal-settings` kept as an alias for the main tour's target.
                data-tour={id === 'settings' ? 'primal-settings' : `primal-nav-${id}`}
              >
                <span className="primal-nav-icon">
                  <Icon size={26} strokeWidth={active ? 2.4 : 1.8} fill={active && fillable ? 'currentColor' : 'none'} />
                </span>
                <span className="primal-nav-label">
                  {label}
                  {badge && <span className="primal-nav-badge">{badge}</span>}
                </span>
              </button>
            );
          })}
        </nav>

        <button className="primal-newnote primal-post-btn" data-tour="primal-post" onClick={onNewNote}>
          New Note
        </button>

        <div style={{ marginTop: 'auto' }}>
          {showPending && (
            <div className="primal-pending">
              <Clock size={14} /> Publish pending (1)
            </div>
          )}
          <button
            className="primal-userchip primal-profile"
            data-tour="primal-profile"
            onClick={onOpenProfile}
            style={{ border: 'none', width: '100%', textAlign: 'left' }}
          >
            <Avatar seed={currentUser.name} className="w-9 h-9" />
            <div className="min-w-0">
              <div className="primal-uc-name truncate">{currentUser.name}</div>
              <div className="primal-uc-handle truncate">{currentUser.handle}</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeftSidebar;
