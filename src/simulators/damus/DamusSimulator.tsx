import React, { useState, useContext, useEffect, useCallback } from 'react';
import './damus.theme.css';
import { mockUsers, mockNotes } from '../../data/mock';
import type { MockUser, MockNote } from '../../data/mock';
import { useParentTheme } from '../shared/hooks/useParentTheme';
import { TourContext } from '../../components/tour';

import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { DMScreen } from './screens/DMScreen';
import { SearchScreen } from './screens/SearchScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { ComposeScreen } from './screens/ComposeScreen';
import { ThreadScreen } from './screens/ThreadScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RelaysScreen } from './screens/RelaysScreen';
import { BookmarksScreen } from './screens/BookmarksScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SideMenu, type MenuDest } from './screens/SideMenu';
import { TabBar, type DamusTab } from './components/TabBar';

export type DamusScreen = 'login' | 'home' | 'profile' | 'compose' | 'settings';

export interface DamusSimulatorCommand {
  type: 'login' | 'navigate' | 'compose' | 'post' | 'viewProfile' | 'back';
  payload?: any;
}

export interface DamusSimulatorProps {
  className?: string;
  tourCommand?: DamusSimulatorCommand | null;
  onCommandHandled?: () => void;
}

type Overlay =
  | { type: 'compose'; replyTo?: MockNote | null }
  | { type: 'thread'; note: MockNote }
  | { type: 'profile'; user: MockUser }
  | { type: 'relays' }
  | { type: 'bookmarks' }
  | { type: 'settings' };

export const DamusSimulator: React.FC<DamusSimulatorProps> = ({ className = '', tourCommand, onCommandHandled }) => {
  const parentTheme = useParentTheme();
  const tourContext = useContext(TourContext);
  const registerAction = (a: string) => tourContext?.registerAction?.(a);

  const [authed, setAuthed] = useState(false);
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [tab, setTab] = useState<DamusTab>('home');
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const push = useCallback((o: Overlay) => setOverlays((s) => [...s, o]), []);
  const pop = useCallback(() => setOverlays((s) => s.slice(0, -1)), []);

  const goTab = useCallback((t: DamusTab) => { setOverlays([]); setDrawerOpen(false); setTab(t); }, []);
  const openThread = (note: MockNote) => push({ type: 'thread', note });
  const openProfile = (user: MockUser) => { registerAction('view_profile'); push({ type: 'profile', user }); };
  const openCompose = (replyTo?: MockNote | null) => { registerAction('compose'); push({ type: 'compose', replyTo }); };
  const openRelays = () => push({ type: 'relays' });

  const login = useCallback((user: MockUser) => {
    setCurrentUser(user); setAuthed(true); setTab('home'); setOverlays([]);
    registerAction('login'); registerAction('navigate_home');
  }, []);

  const logout = () => { setAuthed(false); setCurrentUser(null); setOverlays([]); setDrawerOpen(false); };

  // Transient "not in this demo" toast (same mechanic the Amethyst sim uses for
  // out-of-scope taps: message + auto-dismiss).
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const handleMenu = (d: MenuDest) => {
    setDrawerOpen(false);
    if (d === 'profile' && currentUser) openProfile(currentUser);
    else if (d === 'relays') openRelays();
    else if (d === 'bookmarks') push({ type: 'bookmarks' });
    else if (d === 'settings') { registerAction('navigate_settings'); push({ type: 'settings' }); }
    else if (d === 'logout') logout();
    else showToast('Not in this demo'); // wallet / purple / muted / merch
  };

  // Tour command bridge (interface preserved)
  useEffect(() => {
    if (!tourCommand) return;
    switch (tourCommand.type) {
      case 'login':
        if (!authed) login(mockUsers[0]);
        break;
      case 'navigate': {
        const s = tourCommand.payload as DamusScreen;
        if (s === 'home') goTab('home');
        else if (s === 'profile' && currentUser) { setOverlays([{ type: 'profile', user: currentUser }]); }
        else if (s === 'settings') { setOverlays([{ type: 'settings' }]); }
        break;
      }
      case 'compose':
        setOverlays((s) => [...s, { type: 'compose' }]);
        break;
      case 'post':
        setOverlays([]); setTab('home');
        break;
      case 'viewProfile':
        if (currentUser) setOverlays([{ type: 'profile', user: currentUser }]);
        break;
      case 'back':
        setOverlays([]); setDrawerOpen(false); setTab('home');
        break;
    }
    onCommandHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourCommand]);

  const renderTab = () => {
    const common = {
      currentUser, users: mockUsers,
      onOpenDrawer: () => setDrawerOpen(true),
      onViewProfile: openProfile,
    };
    switch (tab) {
      case 'home':
        return <HomeScreen {...common} notes={mockNotes} onOpenThread={openThread} onReply={openCompose} onOpenRelays={openRelays} />;
      case 'dms':
        return <DMScreen {...common} />;
      case 'search':
        return <SearchScreen {...common} />;
      case 'notifications':
        return <NotificationsScreen {...common} notes={mockNotes} onOpenThread={openThread} onReply={openCompose} />;
    }
  };

  const top = overlays[overlays.length - 1];
  // Thread / profile / bookmarks are STACK PUSHES in real Damus — the tab bar and FAB
  // stay mounted (recording: bookmarks + pushed views keep the bottom bar). Compose is
  // a sheet; relays/settings replace the bottom edge with their own chrome.
  const topKeepsTabBar = !top || top.type === 'thread' || top.type === 'profile' || top.type === 'bookmarks';
  const showTabBar = authed && topKeepsTabBar && !drawerOpen;

  return (
    <div className={`damus-simulator ${parentTheme === 'dark' ? 'dark' : ''} ${className}`} data-theme={parentTheme}>
      {!authed ? (
        <LoginScreen onLogin={login} />
      ) : (
        <>
          <div className="damus-content">{renderTab()}</div>

          {overlays.map((o, i) => (
            <React.Fragment key={i}>
              {i === overlays.length - 1 && renderOverlay(o)}
            </React.Fragment>
          ))}

          {drawerOpen && (
            <SideMenu currentUser={currentUser} onClose={() => setDrawerOpen(false)} onNav={handleMenu} />
          )}

          {showTabBar && (
            <TabBar activeTab={tab} onNavigate={goTab} onCompose={() => openCompose()} />
          )}

          {toast && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[70] pointer-events-none px-4 py-2 rounded-full bg-[var(--damus-bg-tertiary)] text-[var(--damus-text)] text-[14px] font-medium shadow-lg whitespace-nowrap">
              {toast}
            </div>
          )}
        </>
      )}
    </div>
  );

  function renderOverlay(o: Overlay) {
    const noteFeedProps = {
      notes: mockNotes, users: mockUsers,
      onOpenThread: openThread, onViewProfile: openProfile, onReply: openCompose,
    };
    switch (o.type) {
      case 'compose':
        return <ComposeScreen currentUser={currentUser} users={mockUsers} replyTo={o.replyTo} onPost={() => { registerAction('post'); pop(); }} onCancel={pop} />;
      case 'thread':
        return <ThreadScreen note={o.note} currentUser={currentUser} {...noteFeedProps} onBack={pop} />;
      case 'profile':
        return <ProfileScreen user={o.user} currentUser={currentUser} {...noteFeedProps} onBack={pop} />;
      case 'relays':
        return <RelaysScreen onBack={pop} />;
      case 'bookmarks':
        return <BookmarksScreen {...noteFeedProps} onBack={pop} />;
      case 'settings':
        return <SettingsScreen currentUser={currentUser} onBack={pop} onLogout={logout} onOpenRelays={openRelays} />;
    }
  }
};

export default DamusSimulator;
