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
import { useScreenSync } from '../../shared/screenSync';
import { publishComposedNote } from '../../shared/composeBridge';
import { PlaceholderScreen } from './screens/PlaceholderScreen';
import type { PNote } from './data';
import './primal-web.theme.css';

export type TabId =
  | 'home' | 'reads' | 'explore' | 'messages' | 'bookmarks'
  | 'notifications' | 'downloads' | 'premium' | 'settings' | 'profile';

export interface SimulatorCommand {
  type: 'login' | 'logout' | 'navigate' | 'compose' | 'post' | 'viewProfile' | 'exploreTab';
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
  // Commanded Explore sub-tab (gaps pri-27); null = leave ExploreScreen's own
  // local state alone. The nonce makes a REPEAT of the same command a fresh
  // object — without it, relaunching a demo while already on Explore bails on
  // same-value setState and the forcedTab effect never re-fires.
  const [exploreTab, setExploreTab] = useState<{ tab: string; n: number } | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  // Keep your place across a client switch (shared/screenSync.ts). Reads, downloads and
  // premium are Primal's own and stay out of the shared vocabulary.
  useScreenSync<TabId>({
    map: {
      feed: 'home',
      search: 'explore',
      messages: 'messages',
      bookmarks: 'bookmarks',
      notifications: 'notifications',
      settings: 'settings',
      profile: 'profile',
    },
    current: authenticated ? activeTab : null,
    onRestore: (screen) => {
      setAuthenticated(true);
      setActiveTab(screen);
    },
  });
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
    // A commanded Explore sub-tab must not outlive the mini-tour that forced
    // it — without this, a later USER click on Explore remounts the screen
    // with the stale forcedTab and lands on People instead of Feeds.
    setExploreTab(null);
  }, []);

  const openCompose = useCallback(() => {
    setThread(null);
    setActiveTab('home');
    setComposeOpen(true);
  }, []);

  const handlePost = useCallback((_text: string) => {
    setComposeOpen(false);
    setPosted(true);
    publishComposedNote(_text);
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
        // Plain navigate lands on Explore's DEFAULT tab — only the exploreTab
        // command below opts into a forced sub-tab.
        if (RIGHT_VARIANT[tab] !== undefined) { setThread(null); setExploreTab(null); setActiveTab(tab); }
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
      case 'logout':
        // gaps pri-04 — the login screen (and its primal-keys anchor) was
        // unreachable for the rest of the session after the first login.
        setAuthenticated(false);
        setThread(null);
        setActiveTab('home');
        break;
      case 'exploreTab':
        // gaps pri-27 — Explore's sub-tabs (People with the Follow pill, Zaps,
        // Topics…) were reachable only by a user click.
        if (authenticated) {
          const t = tourCommand.payload;
          if (['Feeds', 'People', 'Zaps', 'Media', 'Topics'].includes(t)) {
            setThread(null);
            setExploreTab((prev) => ({ tab: t, n: (prev?.n ?? 0) + 1 }));
            setActiveTab('explore');
          }
        }
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
      case 'explore': return <ExploreScreen forcedTab={exploreTab} />; {/* {tab,n} — see exploreTab state */}
      case 'messages': return <MessagesScreen />;
      case 'bookmarks': return <BookmarksScreen onOpenThread={openThread} />;
      case 'notifications': return <NotificationsScreen />;
      case 'downloads': return <PlaceholderScreen kind="downloads" />;
      case 'premium': return <PlaceholderScreen kind="premium" />;
      case 'settings': return <SettingsScreen onLogout={() => { setAuthenticated(false); setThread(null); setActiveTab('home'); }} />;
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
