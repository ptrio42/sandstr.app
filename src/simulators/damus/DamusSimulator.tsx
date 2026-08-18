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
import { AddRelaySheet } from './components/AddRelaySheet';
import { RelayFilterSheet } from './components/RelayFilterSheet';
import { useRelayState } from './relayState';
import { BookmarksScreen } from './screens/BookmarksScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SideMenu, type MenuDest } from './screens/SideMenu';
import { TabBar, type DamusTab } from './components/TabBar';
import { useScreenSync } from '../shared/screenSync';

export type DamusScreen =
  | 'login' | 'home' | 'profile' | 'compose' | 'settings'
  // navigate-payload additions for FAQ mini-tours:
  | 'relays' | 'dms' | 'search' | 'notifications' | 'drawer'
  // The two relay surfaces the "read one relay" walkthrough needs to land on.
  | 'addRelay' | 'relayFilter';

export interface DamusSimulatorCommand {
  type: 'login' | 'logout' | 'navigate' | 'compose' | 'post' | 'viewProfile' | 'viewUser' | 'back';
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
  | { type: 'addRelay' }
  | { type: 'relayFilter' }
  | { type: 'bookmarks' }
  | { type: 'settings' };

/** Overlays that sit OVER their parent instead of replacing it. */
const SHEET_OVERLAYS = new Set<Overlay['type']>(['addRelay', 'relayFilter']);

export const DamusSimulator: React.FC<DamusSimulatorProps> = ({ className = '', tourCommand, onCommandHandled }) => {
  const parentTheme = useParentTheme();
  const tourContext = useContext(TourContext);
  const registerAction = (a: string) => tourContext?.registerAction?.(a);

  const [authed, setAuthed] = useState(false);
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [tab, setTab] = useState<DamusTab>('home');
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Above both relay screens on purpose — see relayState.ts.
  const relayState = useRelayState();

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

  // Keep your place across a client switch (shared/screenSync.ts). Profile,
  // settings and relays are overlays here rather than tabs, so they are left out
  // of the map and fall back to the feed.
  useScreenSync<DamusTab>({
    map: { feed: 'home', messages: 'dms', search: 'search', notifications: 'notifications' },
    current: authed ? tab : null,
    onRestore: (screen) => {
      login(mockUsers[0]);
      setTab(screen);
    },
  });

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
      case 'logout':
        if (authed) logout();
        break;
      case 'navigate': {
        const s = tourCommand.payload as DamusScreen;
        // Every non-drawer destination closes the drawer: SideMenu sits at
        // z-[60], above every overlay, so a stale open drawer would cover the
        // screen a mini-tour step is spotlighting.
        if (s === 'home') goTab('home');
        else if (s === 'profile' && currentUser) { setDrawerOpen(false); setOverlays([{ type: 'profile', user: currentUser }]); }
        else if (s === 'settings') { setDrawerOpen(false); setOverlays([{ type: 'settings' }]); }
        else if (s === 'relays') { setDrawerOpen(false); setOverlays([{ type: 'relays' }]); }
        // Both relay sheets are stacked ON their parent, not swapped for it: the
        // ring is meant to sit on a sheet control while the screen behind stays
        // recognisable, and popping one has to reveal what opened it.
        else if (s === 'addRelay') { setDrawerOpen(false); setOverlays([{ type: 'relays' }, { type: 'addRelay' }]); }
        else if (s === 'relayFilter') { setDrawerOpen(false); setTab('search'); setOverlays([{ type: 'relayFilter' }]); }
        else if (s === 'dms') goTab('dms');
        else if (s === 'search') goTab('search');
        else if (s === 'notifications') goTab('notifications');
        else if (s === 'drawer') { setOverlays([]); setDrawerOpen(true); }
        break;
      }
      case 'compose':
        setDrawerOpen(false);
        setOverlays((s) => [...s, { type: 'compose' }]);
        break;
      case 'post':
        setOverlays([]); setTab('home');
        break;
      case 'viewProfile':
        if (currentUser) { setDrawerOpen(false); setOverlays([{ type: 'profile', user: currentUser }]); }
        break;
      case 'viewUser': {
        // SOMEONE ELSE's profile (login uses mockUsers[0]) — the FAQ follow
        // demo needs the Follow pill, which own-profile replaces with Edit.
        const other = mockUsers.find((u) => u.username !== currentUser?.username) ?? mockUsers[1];
        setDrawerOpen(false);
        setOverlays([{ type: 'profile', user: other }]);
        break;
      }
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
        return (
          <SearchScreen
            {...common}
            onOpenRelayFilter={() => push({ type: 'relayFilter' })}
            notes={mockNotes}
            feedNotes={relayState.visibleNotes('search', mockNotes)}
            onOpenThread={openThread}
            onReply={openCompose}
          />
        );
      case 'notifications':
        return <NotificationsScreen {...common} notes={mockNotes} onOpenThread={openThread} onReply={openCompose} />;
    }
  };

  const top = overlays[overlays.length - 1];
  // Thread / profile / bookmarks are STACK PUSHES in real Damus — the tab bar and FAB
  // stay mounted (recording: bookmarks + pushed views keep the bottom bar). Compose is
  // a sheet; relays/settings replace the bottom edge with their own chrome.
  // `relayFilter` keeps it: a SwiftUI sheet is a partial cover, so the Universe
  // tab bar stays mounted behind the scrim rather than vanishing under it.
  const topKeepsTabBar = !top || top.type === 'thread' || top.type === 'profile'
    || top.type === 'bookmarks' || top.type === 'relayFilter';
  const showTabBar = authed && topKeepsTabBar && !drawerOpen;

  return (
    <div className={`damus-simulator ${parentTheme === 'dark' ? 'dark' : ''} ${className}`} data-theme={parentTheme}>
      {!authed ? (
        <LoginScreen onLogin={login} />
      ) : (
        <>
          <div className="damus-content">{renderTab()}</div>

          {/*
            The top overlay renders, plus the one under it when the top is a
            SHEET. A sheet is a partial cover: "Add relay" over a blank screen
            would be a lie, and popping it has to reveal the Relays list that
            opened it. Full-screen pushes still render alone.
          */}
          {overlays.map((o, i) => {
            const isTop = i === overlays.length - 1;
            const topIsSheet = top ? SHEET_OVERLAYS.has(top.type) : false;
            const isUnderSheet = topIsSheet && i === overlays.length - 2;
            return (
              <React.Fragment key={i}>
                {(isTop || isUnderSheet) && renderOverlay(o)}
              </React.Fragment>
            );
          })}

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
        return (
          <RelaysScreen
            relays={relayState.relays}
            onBack={pop}
            onAddRelay={() => push({ type: 'addRelay' })}
          />
        );
      case 'addRelay':
        return (
          <AddRelaySheet
            onAdd={(url) => {
              const added = relayState.addRelay(url);
              if (added) showToast(`Added ${added.url}`);
              return !!added;
            }}
            onClose={pop}
          />
        );
      case 'relayFilter':
        return (
          <RelayFilterSheet
            relays={relayState.relays}
            isShown={(url) => relayState.isShown('search', url)}
            onToggle={(url) => relayState.toggleRelay('search', url)}
            onClose={pop}
          />
        );
      case 'bookmarks':
        return <BookmarksScreen {...noteFeedProps} onBack={pop} />;
      case 'settings':
        return <SettingsScreen currentUser={currentUser} onBack={pop} onLogout={logout} onOpenRelays={openRelays} />;
    }
  }
};

export default DamusSimulator;
