import React, { useState, useCallback, useEffect } from 'react';
import { useParentTheme } from '../../shared/hooks/useParentTheme';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar, type RightVariant } from './components/RightSidebar';
import { HomeScreen } from './screens/HomeScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { BookmarksScreen } from './screens/BookmarksScreen';
import { ReadsScreen } from './screens/ReadsScreen';
import { ThreadScreen } from './screens/ThreadScreen';
import { LoginScreen } from './screens/LoginScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';
import type { PNote } from './data';
import './primal-web.theme.css';

export type TabId =
  | 'home' | 'reads' | 'explore' | 'messages' | 'bookmarks'
  | 'notifications' | 'downloads' | 'premium' | 'settings' | 'profile';

export interface SimulatorCommand {
  type: 'login' | 'navigate' | 'compose' | 'post' | 'viewProfile';
  payload?: any;
}

export interface PrimalWebSimulatorProps {
  className?: string;
  tourCommand?: SimulatorCommand | null;
  onCommandHandled?: () => void;
}

const RIGHT_VARIANT: Record<TabId, RightVariant | null> = {
  home: 'home',
  reads: 'home',
  explore: 'explore',
  messages: null,
  bookmarks: 'bookmarks',
  notifications: 'notifications',
  downloads: 'home',
  premium: 'home',
  settings: 'settings',
  profile: 'profile',
};

export function PrimalWebSimulator({ className = '', tourCommand, onCommandHandled }: PrimalWebSimulatorProps) {
  const parentTheme = useParentTheme();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [composeOpen, setComposeOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [thread, setThread] = useState<PNote | null>(null);
  const [posted, setPosted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const goTab = useCallback((tab: TabId) => {
    setThread(null);
    setActiveTab(tab);
    if (tab !== 'home') setComposeOpen(false);
  }, []);

  const openCompose = useCallback(() => {
    setThread(null);
    setActiveTab('home');
    setComposeOpen(true);
  }, []);

  const handlePost = useCallback((_text: string) => {
    setComposeOpen(false);
    setPosted(true);
    showToast('Your note has been published! ⚡');
  }, [showToast]);

  const openThread = useCallback((n: PNote) => setThread(n), []);

  // Tour command interface (preserved: tourCommand / onCommandHandled + switch)
  useEffect(() => {
    if (!tourCommand) return;
    switch (tourCommand.type) {
      case 'login':
        setAuthenticated(true);
        break;
      case 'navigate': {
        const tab = tourCommand.payload as TabId;
        if (RIGHT_VARIANT[tab] !== undefined) { setThread(null); setActiveTab(tab); }
        break;
      }
      case 'compose':
        if (authenticated) openCompose();
        break;
      case 'post':
        if (authenticated) {
          openCompose();
          setTimeout(() => handlePost('Tour note'), 400);
        }
        break;
      case 'viewProfile':
        if (authenticated) { setThread(null); setActiveTab('profile'); }
        break;
    }
    onCommandHandled?.();
  }, [tourCommand, authenticated, openCompose, handlePost, onCommandHandled]);

  if (!authenticated) {
    return <LoginScreen theme={parentTheme} onLogin={() => setAuthenticated(true)} />;
  }

  const renderCenter = () => {
    if (thread) return <ThreadScreen note={thread} onBack={() => setThread(null)} onOpenThread={openThread} />;
    switch (activeTab) {
      case 'home':
        return <HomeScreen composeOpen={composeOpen} onOpenCompose={() => setComposeOpen(true)} onCloseCompose={() => setComposeOpen(false)} onPost={handlePost} onOpenThread={openThread} />;
      case 'reads': return <ReadsScreen />;
      case 'explore': return <ExploreScreen />;
      case 'messages': return <MessagesScreen />;
      case 'bookmarks': return <BookmarksScreen onOpenThread={openThread} />;
      case 'notifications': return <NotificationsScreen />;
      case 'downloads': return <PlaceholderScreen kind="downloads" />;
      case 'premium': return <PlaceholderScreen kind="premium" />;
      case 'settings': return <SettingsScreen />;
      case 'profile': return <ProfileScreen onOpenThread={openThread} />;
      default: return null;
    }
  };

  const rightVariant = thread ? RIGHT_VARIANT[activeTab] : RIGHT_VARIANT[activeTab];
  const isMessages = activeTab === 'messages' && !thread;

  return (
    <div className={`primal-web ${parentTheme} ${className}`} data-theme={parentTheme}>
      <div
        className="primal-layout"
        style={isMessages || !rightVariant ? { gridTemplateColumns: '244px minmax(0, 1fr)' } : undefined}
      >
        <LeftSidebar
          activeTab={activeTab}
          onTabChange={goTab}
          onNewNote={openCompose}
          onOpenProfile={() => goTab('profile')}
          showPending={posted}
        />

        <div className="primal-col-center" style={isMessages ? { overflow: 'hidden' } : undefined}>
          {renderCenter()}
        </div>

        {!isMessages && rightVariant && <RightSidebar variant={rightVariant} />}
      </div>

      {toast && <div className="primal-toast">{toast}</div>}
    </div>
  );
}

export default PrimalWebSimulator;
