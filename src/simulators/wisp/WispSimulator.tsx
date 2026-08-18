import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useScreenSync } from '../shared/screenSync';
import type { MockNote, MockUser } from '../../data/mock';
import { useParentTheme } from '../shared/hooks/useParentTheme';
import { TourContext } from '../../components/tour';
import { BottomBar } from './components/BottomBar';
import { Drawer } from './components/Drawer';
import { ZapDialog } from './components/ZapDialog';
import { LoginScreen } from './screens/LoginScreen';
import { FeedScreen } from './screens/FeedScreen';
import { ThreadScreen } from './screens/ThreadScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { WalletScreen } from './screens/WalletScreen';
import { SearchScreen } from './screens/SearchScreen';
import { ComposeScreen } from './screens/ComposeScreen';
import {
  InterfaceScreen,
  RelaysScreen,
  KeysScreen,
  SocialGraphScreen,
} from './screens/SettingsScreens';
import { DEMO_USER, userByPubkey, wispFeedNotes } from './wispData';
import type {
  SimulatorCommand,
  WispSimulatorProps,
  WispTab,
  WispSettingsScreen,
  DrawerDestination,
} from './types';
import './wisp.theme.css';

export type { SimulatorCommand, WispSimulatorProps } from './types';
export type TabId = WispTab;

const TABS: WispTab[] = ['home', 'wallet', 'search', 'messages', 'notifications'];

export function WispSimulator({ className = '', tourCommand, onCommandHandled }: WispSimulatorProps) {
  const parentTheme = useParentTheme();
  const tourContext = useContext(TourContext);
  const registerAction = useCallback(
    (actionType: string) => {
      tourContext?.registerAction?.(actionType);
    },
    [tourContext],
  );

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [activeTab, setActiveTab] = useState<WispTab>('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [threadNote, setThreadNote] = useState<MockNote | null>(null);
  const [profileUser, setProfileUser] = useState<MockUser | null>(null);
  const [composeState, setComposeState] = useState<{
    open: boolean;
    replyTo: { note: MockNote; author: MockUser } | null;
  }>({ open: false, replyTo: null });
  const [zapTarget, setZapTarget] = useState<{ note: MockNote | null; author: MockUser } | null>(null);
  const [settingsScreen, setSettingsScreen] = useState<WispSettingsScreen | null>(null);
  const [dmImmersive, setDmImmersive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const closeOverlays = useCallback(() => {
    setThreadNote(null);
    setProfileUser(null);
    setComposeState({ open: false, replyTo: null });
    setZapTarget(null);
    setSettingsScreen(null);
    setDrawerOpen(false);
  }, []);

  const handleLogin = useCallback(
    (user: MockUser) => {
      setCurrentUser(user);
      setIsAuthenticated(true);
      registerAction('login');
      registerAction('navigate_home');
    },
    [registerAction],
  );


  // Keep your place across a client switch (shared/screenSync.ts). Wallet is Wisp's own
  // tab with no shared intent, so it is simply not in the map.
  useScreenSync<WispTab>({
    map: { feed: 'home', search: 'search', messages: 'messages', notifications: 'notifications' },
    current: isAuthenticated ? activeTab : null,
    onRestore: (screen) => {
      // BOTH pieces of state, via handleLogin: this screen is gated on
      // `!isAuthenticated || !currentUser`, and setting only the flag left the
      // login screen up with the restore silently doing nothing.
      handleLogin(DEMO_USER);
      setActiveTab(screen);
    },
  });

  const openThread = useCallback((note: MockNote) => setThreadNote(note), []);
  const openProfile = useCallback(
    (user: MockUser) => {
      setProfileUser(user);
      registerAction('view_profile');
    },
    [registerAction],
  );
  const openZap = useCallback((note: MockNote | null, author: MockUser) => {
    setZapTarget({ note, author });
  }, []);
  const openReply = useCallback((note: MockNote) => {
    setComposeState({ open: true, replyTo: { note, author: userByPubkey(note.pubkey) } });
  }, []);

  const handleDrawerNavigate = useCallback(
    (dest: DrawerDestination) => {
      setDrawerOpen(false);
      switch (dest) {
        case 'profile':
          if (currentUser) setProfileUser(currentUser);
          registerAction('view_profile');
          break;
        case 'feeds':
          setActiveTab('home');
          break;
        case 'search':
          setActiveTab('search');
          break;
        case 'messages':
          setActiveTab('messages');
          break;
        case 'wallet':
          setActiveTab('wallet');
          break;
        case 'interface':
        case 'relays':
        case 'keys':
        case 'social-graph':
          setSettingsScreen(dest);
          registerAction('navigate_settings');
          break;
        case 'logout':
          setIsAuthenticated(false);
          setCurrentUser(null);
          closeOverlays();
          break;
        default:
          showToast('Not in this demo');
      }
    },
    [closeOverlays, currentUser, registerAction, showToast],
  );

  // Tour command handling — the interface CLAUDE.md marks non-negotiable.
  useEffect(() => {
    if (!tourCommand) return;
    // Every command is SELF-SUFFICIENT: it signs in on its own, so a step never
    // pairs {login} with the real command and risks the queue dropping the
    // second. `back` (logout) is the sole exception.
    // NOTE the trap: handleLogin's state is NOT visible to this same effect
    // pass, so anything reasoning about "me" below must use `me`, never the
    // stale `currentUser`.
    const me = currentUser ?? DEMO_USER;
    if (tourCommand.type !== 'back' && !isAuthenticated) handleLogin(DEMO_USER);
    switch (tourCommand.type) {
      case 'login':
        break;
      case 'navigate': {
        const tab = tourCommand.payload as WispTab;
        if (TABS.includes(tab)) {
          closeOverlays();
          setActiveTab(tab);
          if (tab === 'home') registerAction('navigate_home');
        }
        break;
      }
      case 'compose':
        // closeOverlays(), not a hand-picked subset: the zap sheet and a
        // mounted profile survived the old version and painted over the
        // composer the next step was spotlighting.
        closeOverlays();
        setComposeState({ open: true, replyTo: null });
        registerAction('compose');
        break;
      case 'post':
        {
          setComposeState({ open: true, replyTo: null });
          window.setTimeout(() => {
            registerAction('post');
            setComposeState({ open: false, replyTo: null });
            showToast('Note published');
          }, 500);
        }
        break;
      case 'viewProfile': {
        // payload 'other' opens SOMEONE ELSE's profile — the follow circle
        // only exists there (gaps wis-74).
        closeOverlays();
        const other = wispFeedNotes.map((n) => userByPubkey(n.pubkey)).find((u) => u.pubkey !== me.pubkey);
        setProfileUser(tourCommand.payload === 'other' ? other ?? me : me);
        registerAction('view_profile');
        break;
      }
      case 'openDrawer':
        // gaps wis-71 — nothing could open the side menu, and the whole
        // settings branch hangs off it.
        closeOverlays();
        setDrawerOpen(true);
        break;
      case 'openThread': {
        // gaps wis-73 — the thread (and its sticky reply bar) was click-only.
        const note = wispFeedNotes[0];
        if (note) { closeOverlays(); setThreadNote(note); }
        break;
      }
      case 'zap': {
        // gaps wis-72 — the zap sheet was click-only.
        const note = wispFeedNotes[0];
        if (note) { closeOverlays(); setZapTarget({ note, author: userByPubkey(note.pubkey) }); }
        break;
      }
      case 'openSettings': {
        // gaps wis-75 — the payload was hardcoded to 'interface', so Relays,
        // Keys and Social Graph had no command at all.
        const screens: WispSettingsScreen[] = ['interface', 'relays', 'keys', 'social-graph'];
        const screen = screens.includes(tourCommand.payload as WispSettingsScreen)
          ? (tourCommand.payload as WispSettingsScreen)
          : 'interface';
        closeOverlays();
        setSettingsScreen(screen);
        registerAction('navigate_settings');
        break;
      }
      case 'back':
        setIsAuthenticated(false);
        setCurrentUser(null);
        closeOverlays();
        break;
    }
    onCommandHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourCommand]);

  const theme = parentTheme === 'dark' ? 'dark' : 'light';

  if (!isAuthenticated || !currentUser) {
    return (
      <div className={`wisp-simulator ${className}`} data-theme={theme}>
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <FeedScreen
            currentUser={currentUser}
            onOpenDrawer={() => setDrawerOpen(true)}
            onCompose={() => {
              setComposeState({ open: true, replyTo: null });
              registerAction('compose');
            }}
            onOpenThread={openThread}
            onOpenProfile={openProfile}
            onZap={openZap}
            onReply={openReply}
            registerAction={registerAction}
          />
        );
      case 'wallet':
        return <WalletScreen currentUser={currentUser} />;
      case 'search':
        return (
          <SearchScreen
            onOpenThread={openThread}
            onOpenProfile={openProfile}
            onZap={openZap}
            onReply={openReply}
          />
        );
      case 'messages':
        return (
          <MessagesScreen
            currentUser={currentUser}
            onOpenProfile={openProfile}
            onImmersiveChange={setDmImmersive}
          />
        );
      case 'notifications':
        return (
          <NotificationsScreen
            currentUser={currentUser}
            onOpenThread={openThread}
            onOpenProfile={openProfile}
            onZap={openZap}
            onReply={openReply}
          />
        );
      default:
        return null;
    }
  };

  const renderSettings = () => {
    switch (settingsScreen) {
      case 'interface':
        return <InterfaceScreen onBack={() => setSettingsScreen(null)} />;
      case 'relays':
        return <RelaysScreen onBack={() => setSettingsScreen(null)} />;
      case 'keys':
        return <KeysScreen onBack={() => setSettingsScreen(null)} />;
      case 'social-graph':
        return <SocialGraphScreen onBack={() => setSettingsScreen(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className={`wisp-simulator ${className}`} data-theme={theme}>
      <div className="relative min-h-0 flex-1">
        {renderTab()}

        {/* Stacked routes — plain divs at final state (preview freezes animations) */}
        {threadNote && (
          <div className="absolute inset-0 z-20" style={{ background: 'var(--wisp-bg)' }}>
            <ThreadScreen
              note={threadNote}
              author={userByPubkey(threadNote.pubkey)}
              onBack={() => setThreadNote(null)}
              onOpenThread={openThread}
              onOpenProfile={openProfile}
              onZap={openZap}
              onReply={openReply}
              registerAction={registerAction}
            />
          </div>
        )}
        {profileUser && (
          <div className="absolute inset-0 z-30" style={{ background: 'var(--wisp-bg)' }}>
            <ProfileScreen
              user={profileUser}
              isOwn={profileUser.pubkey === currentUser.pubkey}
              onBack={() => setProfileUser(null)}
              onOpenThread={openThread}
              onOpenProfile={openProfile}
              onZap={openZap}
              onReply={openReply}
              registerAction={registerAction}
            />
          </div>
        )}
        {settingsScreen && (
          <div className="absolute inset-0 z-40" style={{ background: 'var(--wisp-bg)' }}>
            {renderSettings()}
          </div>
        )}
        {composeState.open && (
          <div className="absolute inset-0 z-50" style={{ background: 'var(--wisp-bg)' }}>
            <ComposeScreen
              currentUser={currentUser}
              replyTo={composeState.replyTo}
              onClose={() => setComposeState({ open: false, replyTo: null })}
              onPublish={() => {
                setComposeState({ open: false, replyTo: null });
                registerAction('post');
                showToast('Note published');
              }}
            />
          </div>
        )}
      </div>

      {!dmImmersive && (
        <BottomBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            closeOverlays();
            setActiveTab(tab);
            if (tab === 'home') registerAction('navigate_home');
          }}
          unread={{ notifications: true }}
        />
      )}

      <Drawer
        open={drawerOpen}
        user={currentUser}
        theme={theme}
        onToggleTheme={() => document.documentElement.classList.toggle('dark')}
        onClose={() => setDrawerOpen(false)}
        onNavigate={handleDrawerNavigate}
      />

      {zapTarget && (
        <ZapDialog
          author={zapTarget.author}
          note={zapTarget.note}
          onClose={() => setZapTarget(null)}
          onZap={(amount) => {
            setZapTarget(null);
            registerAction('zap');
            showToast(`⚡ Zapped ${amount.toLocaleString('en-US')} sats`);
          }}
        />
      )}

      {toast && (
        <div className="pointer-events-none absolute bottom-20 left-1/2 z-[70] -translate-x-1/2">
          <div
            className="rounded-full px-4 py-2 text-sm shadow-lg"
            style={{ background: 'var(--wisp-surface-variant)', color: 'var(--wisp-on-bg)' }}
          >
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

export default WispSimulator;
