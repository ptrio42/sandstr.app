import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { MockUser } from '../../data/mock';
import { useParentTheme } from '../shared/hooks/useParentTheme';
import { TourContext } from '../../components/tour';
import { BottomBar } from './components/BottomBar';
import { Sidebar } from './components/Sidebar';
import { ZapSheet } from './components/ZapSheet';
import { Switch } from './components/Chrome';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { FeedScreen } from './screens/FeedScreen';
import { ThreadScreen } from './screens/ThreadScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { SearchScreen } from './screens/SearchScreen';
import { BookmarksScreen } from './screens/BookmarksScreen';
import { ComposeScreen } from './screens/ComposeScreen';
import {
  AppearanceSettings,
  BadgesScreen,
  FeedsScreen,
  RelaySettings,
  SettingsRoot,
  SpamSettings,
  StubScreen,
  ZapSettings,
} from './screens/SettingsScreens';
import {
  DEMO_USER,
  bookmarkedIds,
  exploreFeed,
  followingFeed,
  userByPubkey,
} from './nosturData';
import type {
  DrawerDestination,
  NosturFeed,
  NosturSettingsScreen,
  NosturTab,
  SimulatorCommand,
  NosturSimulatorProps,
} from './types';
import './nostur.theme.css';

export type { SimulatorCommand, NosturSimulatorProps } from './types';

/** Overlay routes stacked over the tab content, most recent wins. */
type Overlay =
  | { kind: 'thread'; noteId: string; origin: string }
  | { kind: 'profile'; user: MockUser; origin: string }
  | { kind: 'settings'; screen: NosturSettingsScreen }
  | { kind: 'stub'; title: string };

const allNotes = [...followingFeed, ...exploreFeed];

export function NosturSimulator({
  className = '',
  tourCommand,
  onCommandHandled,
}: NosturSimulatorProps) {
  const parentTheme = useParentTheme();
  const tourContext = useContext(TourContext);
  const registerAction = useCallback(
    (actionType: string) => {
      tourContext?.registerAction?.(actionType);
    },
    [tourContext],
  );

  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<NosturTab>('home');
  const [feed, setFeed] = useState<NosturFeed>('Following');
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [compose, setCompose] = useState<{ open: boolean; replyToId: string | null }>({
    open: false,
    replyToId: null,
  });
  const [zapTarget, setZapTarget] = useState<MockUser | null>(null);
  const [feedSettings, setFeedSettings] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [rememberFeed, setRememberFeed] = useState(true);

  // Low Data Mode is OFF by default (SettingsStore.swift:226). The recording ran
  // with it ON, which is where the "Loading paused" blocks come from — the
  // tortoise toggle reproduces both states.
  const [lowData, setLowData] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(bookmarkedIds));
  const [reactions, setReactions] = useState<Set<string>>(new Set());
  const [reposts, setReposts] = useState<Set<string>>(new Set());
  const [zaps, setZaps] = useState<Set<string>>(new Set());

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const toggleIn = (set: (fn: (s: Set<string>) => Set<string>) => void) => (id: string) =>
    set((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onFollow = toggleIn(setFollowing);
  const onBookmark = toggleIn(setBookmarks);
  const onReact = toggleIn(setReactions);
  const onRepost = toggleIn(setReposts);

  const closeOverlays = useCallback(() => {
    setOverlays([]);
    setDrawer(false);
    setCompose({ open: false, replyToId: null });
    setZapTarget(null);
    setFeedSettings(false);
  }, []);

  const push = useCallback((o: Overlay) => setOverlays((s) => [...s, o]), []);
  const pop = useCallback(() => setOverlays((s) => s.slice(0, -1)), []);

  const openThread = useCallback(
    (noteId: string) => {
      registerAction('open-thread');
      push({ kind: 'thread', noteId, origin: feed });
    },
    [feed, push, registerAction],
  );

  const openProfile = useCallback(
    (user: MockUser) => {
      registerAction('view-profile');
      push({ kind: 'profile', user, origin: feed });
    },
    [feed, push, registerAction],
  );

  const openZap = useCallback(
    (noteId: string) => {
      const entry = allNotes.find(({ note }) => note.id === noteId);
      if (!entry) return;
      registerAction('zap');
      setZapTarget(entry.author);
    },
    [registerAction],
  );

  const toggleLowData = useCallback(() => {
    setLowData((v) => {
      showToast(`Low Data mode: ${v ? 'disabled' : 'enabled'}`);
      return !v;
    });
  }, [showToast]);

  const onDrawerNavigate = useCallback(
    (d: DrawerDestination) => {
      setDrawer(false);
      switch (d) {
        case 'profile':
          push({ kind: 'profile', user: DEMO_USER, origin: 'Following' });
          break;
        case 'feeds':
          push({ kind: 'settings', screen: 'feeds' });
          break;
        case 'bookmarks':
          setTab('bookmarks');
          break;
        case 'badges':
          push({ kind: 'settings', screen: 'badges' });
          break;
        case 'settings':
          push({ kind: 'settings', screen: 'root' });
          break;
        case 'blocklist':
          push({ kind: 'stub', title: 'Block list' });
          break;
        case 'signer':
          push({ kind: 'stub', title: 'Signer' });
          break;
      }
    },
    [push],
  );

  /**
   * The tour command contract (CLAUDE.md: non-negotiable). Every branch must
   * end in onCommandHandled() or the wrapper's queue stalls on that step.
   */
  useEffect(() => {
    if (!tourCommand) return;
    switch (tourCommand.type) {
      case 'login':
        setAuthenticated(true);
        break;
      case 'navigate':
        setAuthenticated(true);
        closeOverlays();
        setTab((tourCommand.payload as NosturTab) || 'home');
        break;
      case 'openFeed':
        setAuthenticated(true);
        closeOverlays();
        setTab('home');
        setFeed((tourCommand.payload as NosturFeed) || 'Following');
        break;
      case 'openThread': {
        const first = followingFeed[0];
        if (first) {
          closeOverlays();
          setOverlays([{ kind: 'thread', noteId: first.note.id, origin: 'Following' }]);
        }
        break;
      }
      case 'viewProfile':
        closeOverlays();
        setOverlays([{ kind: 'profile', user: DEMO_USER, origin: 'Following' }]);
        break;
      case 'compose':
        setCompose({ open: true, replyToId: null });
        break;
      case 'zap': {
        const first = followingFeed.find(({ author }) => author.lightningAddress);
        if (first) setZapTarget(first.author);
        break;
      }
      case 'openDrawer':
        closeOverlays();
        setDrawer(true);
        break;
      case 'openSettings':
        closeOverlays();
        setOverlays([{ kind: 'settings', screen: 'root' }]);
        break;
    }
    onCommandHandled?.();
  }, [tourCommand, onCommandHandled, closeOverlays]);

  const rootClass = `nostur-simulator ${className}`.trim();
  const dataTheme = parentTheme === 'light' ? 'light' : 'dark';

  if (!authenticated) {
    return (
      <div className={rootClass} data-theme={dataTheme}>
        <div className="nostur-layout">
          <WelcomeScreen onLogin={() => setAuthenticated(true)} />
        </div>
      </div>
    );
  }

  const top = overlays[overlays.length - 1];
  const replyTarget = compose.replyToId
    ? allNotes.find(({ note }) => note.id === compose.replyToId) ?? null
    : null;

  const postProps = {
    lowData,
    following,
    bookmarks,
    reactions,
    reposts,
    zaps,
    onOpenThread: openThread,
    onOpenProfile: openProfile,
    onReply: (id: string) => setCompose({ open: true, replyToId: id }),
    onRepost,
    onReact,
    onZap: openZap,
    onBookmark,
    onFollow,
  };

  let content: React.ReactNode;
  if (top?.kind === 'thread') {
    const entry = allNotes.find(({ note }) => note.id === top.noteId);
    content = entry ? (
      <ThreadScreen note={entry.note} author={entry.author} origin={top.origin} onBack={pop} {...postProps} />
    ) : null;
  } else if (top?.kind === 'profile') {
    content = (
      <ProfileScreen
        user={top.user}
        isSelf={top.user.pubkey === DEMO_USER.pubkey}
        origin={top.origin}
        onBack={pop}
        {...postProps}
      />
    );
  } else if (top?.kind === 'stub') {
    content = <StubScreen title={top.title} onBack={pop} />;
  } else if (top?.kind === 'settings') {
    const open = (screen: NosturSettingsScreen) => push({ kind: 'settings', screen });
    switch (top.screen) {
      case 'appearance':
        content = <AppearanceSettings onBack={pop} />;
        break;
      case 'zaps':
        content = <ZapSettings onBack={pop} />;
        break;
      case 'relays':
        content = <RelaySettings onBack={pop} />;
        break;
      case 'spam':
        content = <SpamSettings onBack={pop} />;
        break;
      case 'feeds':
        content = <FeedsScreen onBack={pop} />;
        break;
      case 'badges':
        content = <BadgesScreen onBack={pop} />;
        break;
      default:
        content = (
          <SettingsRoot
            lowData={lowData}
            onToggleLowData={toggleLowData}
            onOpen={open}
            onBack={pop}
          />
        );
    }
  } else if (tab === 'home') {
    content = (
      <FeedScreen
        account={DEMO_USER}
        feed={feed}
        onFeed={setFeed}
        onOpenSidebar={() => setDrawer(true)}
        lowData={lowData}
        onToggleLowData={toggleLowData}
        onOpenFeedSettings={() => setFeedSettings(true)}
        {...postProps}
      />
    );
  } else if (tab === 'bookmarks') {
    content = <BookmarksScreen {...postProps} />;
  } else if (tab === 'search') {
    content = (
      <SearchScreen
        account={DEMO_USER}
        following={following}
        onFollow={onFollow}
        onOpenProfile={openProfile}
      />
    );
  } else if (tab === 'notifications') {
    content = <NotificationsScreen onOpenProfile={openProfile} />;
  } else {
    content = <MessagesScreen onOpenProfile={openProfile} />;
  }

  // Where the FAB actually appears, checked against the frames: the Home feed
  // and a pushed profile have it; post detail, Notifications, Search, Messages
  // and Bookmarks do not.
  const showFab = tab === 'home' && (!top || top.kind === 'profile');

  return (
    <div className={rootClass} data-theme={dataTheme}>
      <div className="nostur-layout">
        {content}
        <BottomBar
          active={tab}
          onSelect={(t) => {
            setOverlays([]);
            setTab(t);
          }}
          badges={{ notifications: 8, messages: 1 }}
        />
      </div>

      {showFab && (
        <button
          type="button"
          className="nostur-fab"
          aria-label="New post"
          data-tour="nostur-fab"
          onClick={() => setCompose({ open: true, replyToId: null })}
        >
          <Plus className="h-7 w-7" strokeWidth={2.6} />
        </button>
      )}

      {toast && <div className="nostur-toast">{toast}</div>}

      {drawer && (
        <>
          <button
            type="button"
            className="nostur-scrim"
            aria-label="Close menu"
            onClick={() => setDrawer(false)}
          />
          <Sidebar
            user={DEMO_USER}
            followingCount={following.size + 2}
            onNavigate={onDrawerNavigate}
            onLogout={() => {
              closeOverlays();
              setAuthenticated(false);
            }}
          />
        </>
      )}

      {compose.open && (
        <ComposeScreen
          account={DEMO_USER}
          replyTo={replyTarget}
          onClose={() => setCompose({ open: false, replyToId: null })}
          onPost={() => {
            setCompose({ open: false, replyToId: null });
            registerAction('post');
            showToast('Posted');
          }}
        />
      )}

      {zapTarget && (
        <ZapSheet
          target={zapTarget}
          onClose={() => setZapTarget(null)}
          onSend={(sats) => {
            const entry = allNotes.find(({ author }) => author.pubkey === zapTarget.pubkey);
            if (entry) setZaps((s) => new Set(s).add(entry.note.id));
            setZapTarget(null);
            showToast(`Zapped ${sats.toLocaleString('en-US')} sats`);
          }}
        />
      )}

      {/* The gear in the Home toolbar — "Following Feed settings" (recording). */}
      {feedSettings && (
        <>
          <button
            type="button"
            className="nostur-scrim"
            aria-label="Close feed settings"
            onClick={() => setFeedSettings(false)}
          />
          <div
            className="absolute inset-x-0 top-0 z-[70] px-4 pb-4 pt-3"
            style={{ background: 'var(--nostur-list-bg)' }}
          >
            <p className="text-[17px] font-bold">Following Feed settings</p>
            <p className="nostur-section-title mt-3 px-0">Feed settings</p>
            <div className="nostur-group mx-0 mt-0">
              <div className="nostur-row">
                <span className="flex-1">Show replies</span>
                <Switch checked={showReplies} onChange={setShowReplies} label="Show replies" />
              </div>
              <div className="nostur-row">
                <span className="flex-1">
                  Remember feed
                  <span className="block text-[12px]" style={{ color: 'var(--nostur-secondary)' }}>
                    Restore feed from where you left off when you reopen the app
                  </span>
                </span>
                <Switch checked={rememberFeed} onChange={setRememberFeed} label="Remember feed" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { userByPubkey };
export default NosturSimulator;
