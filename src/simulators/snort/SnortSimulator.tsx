import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import './snort.theme.css';
import { TourContext } from '../../components/tour';
import { useParentTheme } from '../shared/hooks/useParentTheme';
import { useScreenSync } from '../shared/screenSync';
import { publishComposedNote } from '../shared/composeBridge';
import type { MockNote, MockThread, MockUser } from '../../data/mock';
import { Avatar } from './components/Avatar';
import { Icon, type IconName } from './components/Icon';
import { RightColumn } from './components/RightColumn';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ComposeScreen } from './screens/ComposeScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { LoginScreen } from './screens/LoginScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RelaysScreen } from './screens/RelaysScreen';
import { SearchScreen } from './screens/SearchScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ThreadScreen } from './screens/ThreadScreen';
import { TimelineScreen } from './screens/TimelineScreen';
import { formatShort } from './snortUtils';

/**
 * Snort — the app shell.
 *
 * Rebuilt token-first from `docs/refs/snort/screen-map.md` (recording
 * 2026-07-14 + `v0l/snort@3cc8317`). The previous shell invented its
 * navigation; the real one is §5 / §5.1 / §5.3 / §6.1:
 *
 *  - Three columns capped at 1280px: left rail, centre, right column.
 *  - Nav is Home · Discover · Notifications · Messages · Settings. Active state
 *    is an outline→solid icon swap plus `font-bold` — NO pill, tint or bar.
 *  - Labels, then the right column, then the rail itself drop away as the
 *    container narrows, and a 56px bottom tab bar takes over at the low end.
 *    The exact thresholds are scaled to the host card — see the block above
 *    `showRail` for why upstream's viewport numbers cannot be used verbatim.
 *  - The desktop feed header contains nothing but a CENTERED DROPDOWN feed
 *    picker. Snort has no underline tabs anywhere.
 *  - Deck is deliberately absent: it is triple-gated dead code upstream
 *    (`features.deck: false`, subscription-walled, and `SnortDeckLayout` is
 *    imported nowhere, so `/deck` is not even a route).
 *
 * Width gates are measured on the CONTAINER, not the viewport. Real Snort gates
 * in JS too (`useWindowSize`), and viewport `@media` queries are exactly what
 * made the 640–768px band delete this sim's navigation (the 2026-07-28 review, B10) —
 * the sim lives inside a card narrower than the window.
 */

export type SnortScreen =
  | 'login'
  | 'timeline'
  | 'thread'
  | 'profile'
  | 'relays'
  | 'settings'
  | 'discover'
  | 'notifications'
  | 'messages'
  | 'search';

export interface SimulatorCommand {
  type: 'login' | 'logout' | 'navigate' | 'compose' | 'post' | 'viewProfile' | 'openThread';
  payload?: any;
}

interface SnortSimulatorProps {
  tourCommand?: SimulatorCommand | null;
  onCommandHandled?: () => void;
}

/** Feed picker entries — `Components/Feed/RootTabItems.tsx`, verbatim labels.
 *  Note the inconsistent casing: it is real, reproduce it. */
const FEED_TABS: { label: string; icon: IconName }[] = [
  { label: 'For you', icon: 'user-v2' },
  { label: 'Following', icon: 'user-v2' },
  { label: 'Trending Notes', icon: 'fire' },
  { label: 'Conversations', icon: 'message-chat-circle' },
  { label: 'Followed by friends', icon: 'user-v2' },
  { label: 'Trending Hashtags', icon: 'hash' },
  { label: 'Media', icon: 'camera-plus' },
  { label: 'Follow Sets', icon: 'thumbs-up' },
];

/** `MENU_ITEMS` (NavSidebar.tsx:18-53). Deck is filtered out upstream. */
const NAV: { screen: SnortScreen; label: string; icon: string; loggedIn: boolean }[] = [
  { screen: 'timeline', label: 'Home', icon: 'home', loggedIn: false },
  { screen: 'discover', label: 'Discover', icon: 'search', loggedIn: false },
  { screen: 'notifications', label: 'Notifications', icon: 'bell', loggedIn: true },
  { screen: 'messages', label: 'Messages', icon: 'mail', loggedIn: true },
  { screen: 'settings', label: 'Settings', icon: 'settings', loggedIn: true },
];

const ROOT_SCREENS: SnortScreen[] = ['timeline'];

export const SnortSimulator: React.FC<SnortSimulatorProps> = ({ tourCommand, onCommandHandled }) => {
  const parentTheme = useParentTheme();
  const tourContext = useContext(TourContext);
  const registerAction = useCallback(
    (actionType: string) => tourContext?.registerAction?.(actionType),
    [tourContext],
  );

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(1280);

  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [screen, setScreen] = useState<SnortScreen>('login');
  const [selectedProfile, setSelectedProfile] = useState<MockUser | null>(null);
  const [selectedThread, setSelectedThread] = useState<MockThread | null>(null);
  const [selectedNote, setSelectedNote] = useState<MockNote | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<MockNote | null>(null);
  const [feedTab, setFeedTab] = useState('Following'); // `defaultRootTab` in config/default.json
  const [pickerOpen, setPickerOpen] = useState(false);
  /** Seeded by the right column's SearchBox — the only desktop route to search. */
  const [searchQuery, setSearchQuery] = useState('');

  const [mock, setMock] = useState<{ users: MockUser[]; notes: MockNote[]; threads: MockThread[] }>({
    users: [],
    notes: [],
    threads: [],
  });

  const isAuthed = currentUser !== null;

  // Keep your place across a client switch (shared/screenSync.ts). Bookmarks are a
  // profile tab here rather than a screen, so they fall back to the feed.
  useScreenSync<SnortScreen>({
    map: {
      feed: 'timeline',
      search: 'search',
      notifications: 'notifications',
      messages: 'messages',
      profile: 'profile',
      settings: 'settings',
      relays: 'relays',
    },
    current: isAuthed && screen !== 'login' ? screen : null,
    // The mock users arrive in an effect; restoring before then would set a
    // screen with nobody signed in, i.e. the sign-in wall with extra steps.
    ready: mock.users.length > 0,
    onRestore: (target) => {
      const user = mock.users[0];
      if (user) handleLogin(user);
      setScreen(target);
    },
  });

  /**
   * ---- Container width gates (see the header comment) ----
   *
   * A CALLBACK ref, not `useEffect` + `useRef`, and that matters: the logged-out
   * and logged-in branches each render their own root element, so logging in
   * unmounts one node and mounts another. A one-shot effect keyed on `[]` would
   * go on observing the DETACHED node, the width would freeze at its
   * login-screen value, and every breakpoint below would silently stop
   * responding. Re-observing on each attach is what keeps them live.
   */
  const observerRef = useRef<ResizeObserver | null>(null);

  const measure = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const w = el.getBoundingClientRect().width;
    setWidth((prev) => (Math.abs(prev - w) > 0.5 ? w : prev));
  }, []);

  const attachRoot = useCallback(
    (el: HTMLDivElement | null) => {
      rootRef.current = el;
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!el) return;
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        observerRef.current = ro;
      }
      measure();
    },
    [measure],
  );

  /**
   * A window-resize fallback alongside the observer. ResizeObserver callbacks
   * are only delivered as part of a rendering step, so in an inert or throttled
   * tab the element can change size without the callback ever arriving and the
   * breakpoints silently latch at their last value. Measuring on `resize` too
   * costs nothing and keeps the layout honest wherever the sim is embedded.
   */
  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      observerRef.current?.disconnect();
    };
  }, [measure]);

  /**
   * Breakpoints, calibrated to the CARD rather than to a browser window.
   *
   * Upstream's numbers are 768 (rail appears) / 1024 (right column) / 1280
   * (rail labels), measured against the viewport. Sandstr mounts a frameless
   * client inside a `max-w-5xl` card, so the sim is handed **exactly 1022px at
   * every viewport** — two pixels under upstream's right-column threshold, which
   * would make the entire right column dead code and would never show labels.
   *
   * The card IS this reproduction's screen, so the thresholds are scaled to it:
   * at the card's real width Snort renders the full desktop state the recording
   * shows (labelled rail + feed + right column), and it still degrades in the
   * same ORDER upstream degrades — labels first, then the right column, then the
   * rail itself. Primal, the other frameless "ready" client, sets the same
   * precedent by rendering all three columns inside this card unconditionally.
   */
  const showRail = width > 768;
  const railWide = width >= 900;
  const showRight = width >= 900;
  /** Upstream's <=768px layout: no rail, a 56px bottom tab bar instead (§5.5).
   *  This is what fills the 640-768px band the host still mounts (B10). */
  const showBottomBar = width <= 768;

  useEffect(() => {
    let alive = true;
    import('../../data/mock').then((m) => {
      if (!alive) return;
      setMock({ users: m.mockUsers ?? [], notes: m.mockNotes ?? [], threads: m.mockThreads ?? [] });
    });
    return () => {
      alive = false;
    };
  }, []);

  const usersByPubkey = useMemo(() => {
    const map = new Map<string, MockUser>();
    for (const u of mock.users) map.set(u.pubkey, u);
    return map;
  }, [mock.users]);

  // ---- Actions ----
  const handleLogin = useCallback(
    (user: MockUser) => {
      setCurrentUser(user);
      setScreen('timeline');
      registerAction('login');
      registerAction('navigate_home');
    },
    [registerAction],
  );

  const navigateTo = useCallback(
    (next: SnortScreen) => {
      setScreen(next);
      setComposeOpen(false);
      if (next === 'timeline') registerAction('navigate_home');
      if (next === 'settings') registerAction('navigate_settings');
    },
    [registerAction],
  );

  const viewProfile = useCallback(
    (user: MockUser) => {
      setSelectedProfile(user);
      setScreen('profile');
      registerAction('view_profile');
    },
    [registerAction],
  );

  const viewThread = useCallback(
    (note: MockNote) => {
      const thread =
        mock.threads.find((t) => t.rootNoteId === note.id || t.notes.some((n) => n.id === note.id)) ?? null;
      setSelectedThread(thread);
      setSelectedNote(note);
      setScreen('thread');
    },
    [mock.threads],
  );

  const runSearch = useCallback((term: string) => {
    setSearchQuery(term);
    setScreen('search');
    setComposeOpen(false);
  }, []);

  const openCompose = useCallback(
    (note?: MockNote) => {
      setReplyTo(note ?? null);
      setComposeOpen(true);
      registerAction('compose');
    },
    [registerAction],
  );

  const handlePost = useCallback((text: string) => {
    registerAction('post');
    // The host turns a note written here into the previewed note.
    publishComposedNote(text);
    setComposeOpen(false);
    setReplyTo(null);
  }, [registerAction]);

  useKeyboardShortcuts({ onNewPost: () => openCompose(), onGoHome: () => navigateTo('timeline') });

  // ---- Tour commands (interface is load-bearing — do not change the shape) ----
  useEffect(() => {
    if (!tourCommand) return;

    // Every command is SELF-SUFFICIENT: it signs in on its own, so a step never
    // has to pair {login} with the real command and risk the queue dropping the
    // second one. `logout` is the sole exception.
    // The user this pass is signed in AS. `currentUser` is still the previous
    // render's value inside this same effect, so anything downstream that needs
    // "me" must use this, not currentUser.
    const demoUser = currentUser ?? mock.users[0] ?? null;
    if (tourCommand.type !== 'logout' && !isAuthed) {
      handleLogin(
        mock.users[0] ?? {
          pubkey: 'npub1snortdemo',
          displayName: 'Snort User',
          username: 'snortuser',
          avatar: '',
          bio: 'Exploring Nostr with Snort',
          nip05: 'demo@snort.example',
          // Fixed constants, never Date.now(): the tour must replay
          // identically on every pass. Mirrors LoginScreen's DEMO_USER.
          createdAt: 1_700_000_000,
          lastActive: 1_700_000_000,
        },
      );
    }
    switch (tourCommand.type) {
      case 'login':
        break;

      case 'logout':
        // gaps sno-01/sno-63 — the signed-out shell (and the snort-login
        // anchor) had no command; navigate:'login' only swapped the screen.
        setCurrentUser(null);
        setComposeOpen(false);
        setSelectedThread(null);
        setSelectedNote(null);
        setScreen('login');
        break;

      case 'openThread': {
        // gaps sno-37 — navigate:'thread' set the screen but no note, so the
        // thread rendered "This note could not be loaded."
        // Take the root of a real THREAD, not mock.notes[0]: the two mock
        // modules mint their ids independently, so a feed note never resolves
        // to a thread and the screen would show one note with no replies.
        const thread = mock.threads[0];
        const root = thread?.notes.find((n) => n.id === thread.rootNoteId) ?? thread?.notes[0];
        if (thread && root) {
          setSelectedThread(thread);
          setSelectedNote(root);
          setScreen('thread');
        }
        setComposeOpen(false);
        break;
      }

      case 'navigate': {
        const next = tourCommand.payload as SnortScreen;
        setScreen(next);
        setComposeOpen(false);
        // A thread opened earlier would otherwise still be the selected note
        // when the visitor navigates back to it.
        if (next !== 'thread') { setSelectedThread(null); setSelectedNote(null); }
        break;
      }

      case 'compose':
        setReplyTo(null);
        setComposeOpen(true);
        break;

      case 'post':
        setComposeOpen(true);
        break;

      case 'viewProfile': {
        const other = mock.users.find((u) => u.pubkey !== demoUser?.pubkey);
        setSelectedProfile(tourCommand.payload === 'other' ? other ?? demoUser : demoUser);
        setScreen('profile');
        setComposeOpen(false);
        break;
      }
    }

    onCommandHandled?.();
  }, [tourCommand, isAuthed, currentUser, mock.users, mock.threads, handleLogin, onCommandHandled]);

  // ---- Render ----
  if (!isAuthed || screen === 'login') {
    return (
      <div ref={attachRoot} className={`snort-simulator ${parentTheme}${width >= 768 ? ' is-md' : ''}`} data-theme={parentTheme}>
        <div className="snort-layout">
          {showRail && (
            <Rail
              wide={railWide}
              screen={screen}
              isAuthed={false}
              currentUser={null}
              onNavigate={navigateTo}
              onCompose={() => openCompose()}
              onViewProfile={viewProfile}
            />
          )}
          <main className="snort-main">
            <LoginScreen onLogin={handleLogin} users={mock.users} />
          </main>
          {showRight && (
            <RightColumn
              currentUser={null}
              notes={mock.notes}
              users={mock.users}
              onViewProfile={viewProfile}
              onSearch={runSearch}
            />
          )}
        </div>
      </div>
    );
  }

  const isRootTab = ROOT_SCREENS.includes(screen);

  const screenTitle: Record<string, string> = {
    thread: selectedNote
      ? `Short Text Note by ${usersByPubkey.get(selectedNote.pubkey)?.displayName ?? 'user'}`
      : 'Thread',
    profile: selectedProfile?.displayName ?? 'Profile',
    settings: 'Settings',
    relays: 'Relays',
    discover: 'Discover',
    notifications: 'Notifications',
    messages: 'Messages',
    search: 'Search',
  };

  const body = (() => {
    switch (screen) {
      case 'timeline':
        return (
          <TimelineScreen
            currentUser={currentUser}
            notes={mock.notes}
            users={mock.users}
            feedTab={feedTab}
            onViewProfile={viewProfile}
            onViewThread={viewThread}
            onReply={openCompose}
          />
        );
      case 'thread':
        return (
          <ThreadScreen
            thread={selectedThread}
            rootNote={selectedNote}
            users={mock.users}
            onViewProfile={viewProfile}
            onReply={openCompose}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            user={selectedProfile ?? currentUser}
            currentUser={currentUser}
            notes={mock.notes}
            users={mock.users}
            onViewProfile={viewProfile}
            onViewThread={viewThread}
            onMessage={() => navigateTo('messages')}
          />
        );
      case 'notifications':
        return <NotificationsScreen currentUser={currentUser} notes={mock.notes} users={mock.users} />;
      case 'messages':
        return <MessagesScreen currentUser={currentUser} users={mock.users} />;
      case 'discover':
        return <DiscoverScreen users={mock.users} onViewProfile={viewProfile} />;
      case 'search':
        return (
          <SearchScreen
            notes={mock.notes}
            users={mock.users}
            onViewProfile={viewProfile}
            onViewThread={viewThread}
            initialQuery={searchQuery}
          />
        );
      case 'relays':
        return <RelaysScreen onBack={() => navigateTo('settings')} />;
      case 'settings':
        return <SettingsScreen currentUser={currentUser} onOpenRelays={() => navigateTo('relays')} />;
      default:
        return null;
    }
  })();

  return (
    <div ref={attachRoot} className={`snort-simulator ${parentTheme}${width >= 768 ? ' is-md' : ''}`} data-theme={parentTheme}>
      <div className="snort-layout">
        {showRail && (
          <Rail
            wide={railWide}
            screen={screen}
            isAuthed
            currentUser={currentUser}
            onNavigate={navigateTo}
            onCompose={() => openCompose()}
            onViewProfile={viewProfile}
          />
        )}

        <main className="snort-main">
          {/* Sticky header. On a root tab it holds ONLY the centered feed
              picker — upstream's logo slot and bell are both `md:invisible`. */}
          <header className="snort-header px-2 py-1">
            {isRootTab ? (
              <>
                <span className="w-8" aria-hidden />
                <div className="root-type flex flex-grow items-center justify-center">
                  <FeedPicker
                    value={feedTab}
                    open={pickerOpen}
                    onToggle={() => setPickerOpen((v) => !v)}
                    onSelect={(label) => {
                      setFeedTab(label);
                      setPickerOpen(false);
                    }}
                  />
                </div>
                <span className="w-8" aria-hidden />
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="snort-btn-sm"
                  aria-label="Back"
                  onClick={() => navigateTo('timeline')}
                >
                  <Icon name="arrowBack" size={24} />
                </button>
                <div className="flex-1 truncate p-2 text-center md:text-lg">{screenTitle[screen]}</div>
                <span className="w-6" aria-hidden />
              </>
            )}
          </header>

          {body}
        </main>

        {showRight && (
          <RightColumn
            currentUser={currentUser}
            notes={mock.notes}
            users={mock.users}
            onViewProfile={viewProfile}
            onSearch={runSearch}
          />
        )}
      </div>

      {showBottomBar && (
        <BottomBar
          screen={screen}
          currentUser={currentUser}
          onNavigate={navigateTo}
          onCompose={() => openCompose()}
          onViewProfile={viewProfile}
        />
      )}

      {composeOpen && (
        <ComposeScreen
          currentUser={currentUser}
          replyTo={replyTo}
          replyAuthor={replyTo ? usersByPubkey.get(replyTo.pubkey) : undefined}
          onClose={() => {
            setComposeOpen(false);
            setReplyTo(null);
          }}
          onPost={handlePost}
        />
      )}
    </div>
  );
};

/**
 * The <=768px bottom tab bar (`Pages/Layout/Footer.tsx`, §5.5).
 *
 * Five equal, ICON-ONLY cells with no labels, 56px tall. Note the deliberate
 * asymmetries with the desktop rail, which are real: the magnifier here goes to
 * SEARCH (the rail's goes to Discover), there is no Notifications item (upstream
 * puts the bell in the mobile header instead), and no Settings.
 *
 * This is what replaces the navigation in the 640-768px band that the host
 * still mounts — the band that previously lost its nav entirely (B10).
 */
function BottomBar({
  screen,
  currentUser,
  onNavigate,
  onCompose,
  onViewProfile,
}: {
  screen: SnortScreen;
  currentUser: MockUser | null;
  onNavigate: (s: SnortScreen) => void;
  onCompose: () => void;
  onViewProfile: (u: MockUser) => void;
}) {
  const cell = (active: boolean, icon: IconName, label: string, onClick: () => void) => (
    <button
      key={label}
      type="button"
      className={`flex flex-1 cursor-pointer items-center justify-center p-4 ${active ? 'active' : ''}`}
      style={{ background: 'transparent', border: 'none', color: 'inherit' }}
      aria-label={label}
      onClick={onClick}
    >
      <Icon name={icon} size={24} />
    </button>
  );

  return (
    <footer className="snort-bottom-bar">
      {cell(screen === 'timeline', screen === 'timeline' ? 'home-solid' : 'home-outline', 'Home', () =>
        onNavigate('timeline'),
      )}
      {cell(
        screen === 'messages',
        screen === 'messages' ? 'mail-solid' : 'mail-outline',
        'Messages',
        () => onNavigate('messages'),
      )}
      <button
        type="button"
        className="snort-btn primary mx-2 h-9 w-9 !px-0"
        // Same anchor as the rail's New Note: exactly one of the two is ever
        // mounted (rail above 768px container width, this bar below), so a
        // mini-tour keeps a target at every width instead of losing one in the
        // band where the rail is gone but the FAQ panel is still open.
        data-tour="snort-compose"
        aria-label="New Note"
        onClick={onCompose}
      >
        <Icon name="plus" size={16} />
      </button>
      {cell(screen === 'search', screen === 'search' ? 'search-solid' : 'search-outline', 'Search', () =>
        onNavigate('search'),
      )}
      <button
        type="button"
        className="flex flex-1 cursor-pointer items-center justify-center p-2"
        style={{ background: 'transparent', border: 'none', color: 'inherit' }}
        aria-label="Profile"
        onClick={() => currentUser && onViewProfile(currentUser)}
      >
        <Avatar seed={currentUser?.username ?? 'anon'} className="h-8 w-8" />
      </button>
    </footer>
  );
}

/**
 * The left rail. Active item = solid icon + bold label, with no background —
 * upstream's `hover:bg-secondary` resolves to nothing, so hover has no fill
 * either. Labels appear only in the wide (>=1280px) state.
 */
// Exported for /compare's navigation strip, which mounts the real rail rather
// than a lookalike. Nothing else about it changed.
export function Rail({
  wide,
  screen,
  isAuthed,
  currentUser,
  onNavigate,
  onCompose,
  onViewProfile,
}: {
  wide: boolean;
  screen: SnortScreen;
  isAuthed: boolean;
  currentUser: MockUser | null;
  onNavigate: (s: SnortScreen) => void;
  onCompose: () => void;
  onViewProfile: (u: MockUser) => void;
}) {
  const items = NAV.filter((i) => !i.loggedIn || isAuthed);

  return (
    <aside className={`snort-rail ${wide ? 'is-wide' : 'is-narrow'}`}>
      {/* Wordmark. `navLogo` is null for Snort, so there is NO logo image: the
          word "Snort" at >=1280px, otherwise an (unfilled) "S" monogram tile. */}
      <div className="mb-2 flex items-center px-1">
        {wide ? (
          <h1 className="text-3xl font-bold">Snort</h1>
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-xl font-bold">S</span>
        )}
      </div>

      {/* Wallet balance — wide only (`max-xl:hidden` upstream). */}
      {isAuthed && wide && (
        <div className="mb-2 w-full cursor-pointer py-2 pl-3">
          <div className="flex items-center gap-2">
            <Icon name="sats" size={28} />
            <span className="text-lg font-semibold">{formatShort(0)}</span>
            <span className="ml-auto pr-2" style={{ color: 'var(--snort-text-secondary)' }}>
              <Icon name="dots" size={16} />
            </span>
          </div>
          <div className="text-sm" style={{ color: 'var(--snort-text-secondary)' }}>
            ~0,00 $
          </div>
        </div>
      )}

      <nav className="flex w-full flex-col gap-1">
        {items.map((item) => {
          const active = screen === item.screen || (item.screen === 'timeline' && screen === 'thread');
          return (
            <button
              key={item.screen}
              type="button"
              className={`snort-nav-item ${active ? 'active' : ''}`}
              // gaps sno-44 — the rail was the only navigation and had no
              // anchor at all, so no mini-tour could point at a nav item.
              data-tour={`snort-nav-${item.screen}`}
              onClick={() => onNavigate(item.screen)}
            >
              <Icon name={`${item.icon}-${active ? 'solid' : 'outline'}` as IconName} size={24} />
              {wide && <span className="ml-3">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-2 w-full">
        {isAuthed ? (
          <button
            type="button"
            className={`snort-btn primary snort-compose ${wide ? '' : 'h-9 w-9 !px-0'}`}
            data-tour="snort-compose"
            onClick={onCompose}
          >
            <Icon name="plus" size={16} />
            {wide && <span>New Note</span>}
          </button>
        ) : (
          <button type="button" className={`snort-btn primary ${wide ? '' : 'h-9 w-9 !px-0'}`}>
            <Icon name="sign-in" size={24} />
            {wide && <span>Sign up</span>}
          </button>
        )}
      </div>

      {isAuthed && currentUser && (
        <button
          type="button"
          className="mt-auto flex w-full items-center gap-2 rounded-full p-2 text-left"
          style={{ background: 'transparent', border: 'none', color: 'inherit' }}
          onClick={() => onViewProfile(currentUser)}
        >
          <Avatar seed={currentUser.username} className="h-10 w-10" />
          {wide && (
            <>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{currentUser.displayName}</span>
              <Icon name="chevronDown" size={16} />
            </>
          )}
        </button>
      )}
    </aside>
  );
}

/**
 * The feed picker: a centered dropdown, NOT a tab row. Active state is conveyed
 * only by which label the trigger shows (§6.1).
 *
 * [REC vs REPO] the recording's trigger is a bordered white pill with a shadow;
 * current master strips it (`bg-transparent border-none shadow-none`). We follow
 * the recording, so this reads as the Snort the owner captured.
 */
function FeedPicker({
  value,
  open,
  onToggle,
  onSelect,
}: {
  value: string;
  open: boolean;
  onToggle: () => void;
  onSelect: (label: string) => void;
}) {
  const current = FEED_TABS.find((t) => t.label === value) ?? FEED_TABS[1];

  return (
    <div className="relative">
      <button type="button" className="snort-btn" onClick={onToggle}>
        <Icon name={current.icon} size={20} />
        <span className="text-base">{current.label}</span>
        <Icon name="chevronDown" size={20} />
      </button>

      {open && (
        <div
          className="absolute left-1/2 z-50 mt-1 min-w-48 -translate-x-1/2 overflow-hidden rounded-lg"
          style={{ backgroundColor: 'var(--snort-layer-2)', border: '1px solid var(--snort-border)' }}
        >
          {FEED_TABS.map((t) => (
            <button
              key={t.label}
              type="button"
              className="flex w-full items-center gap-3 px-6 py-2 text-left text-base font-semibold"
              style={{ background: 'transparent', border: 'none', color: 'inherit' }}
              onClick={() => onSelect(t.label)}
            >
              <Icon name={t.icon} size={20} />
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SnortSimulator;
