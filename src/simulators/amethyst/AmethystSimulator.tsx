import React, { useState, useCallback, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from './components/BottomNav';
import { FloatingActionButton } from './components/FloatingActionButton';
import { Drawer } from './components/Drawer';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen, buildFeedPosts } from './screens/HomeScreen';
import { BrowserScreen } from './screens/BrowserScreen';
import { WalletScreen } from './screens/WalletScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import type { ProfileTab } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ComposeScreen } from './screens/ComposeScreen';
import { VideoScreen } from './screens/VideoScreen';
import { ThreadScreen } from './screens/ThreadScreen';
import { DrawerDetailScreen, DRAWER_DETAIL_IDS } from './screens/DrawerDetailScreen';
import type { DrawerDetailId } from './screens/DrawerDetailScreen';
import type { PostData } from './components/MaterialCard';
import { useParentTheme } from '../shared/hooks/useParentTheme';
import './amethyst.theme.css';
import type { MockUser } from '../../data/mock';
import { generateAvatarGradient, getUserByPubkey } from '../../data/mock';
import { TourContext } from '../../components/tour';
import { AmethystToastContext } from './toast';

// Types.
// `search` is a legacy id kept on purpose: it is the tour/FAQ payload for the
// globe destination, which in v1.13.1 stopped being Discover and became the
// Browser. Renaming it would break every stored `navigate:'search'` command for
// no visible gain; the screen it mounts is what changed.
export type TabId =
  | 'home'
  | 'search'
  | 'video'
  | 'wallet'
  | 'discover'
  | 'notifications'
  | 'messages'
  | 'profile';

export interface SimulatorCommand {
  type: 'login' | 'navigate' | 'compose' | 'post' | 'viewProfile' | 'back' | 'openSettings' | 'openDrawer';
  payload?: any;
}

export interface AmethystSimulatorProps {
  className?: string;
  tourCommand?: SimulatorCommand | null;
  onCommandHandled?: () => void;
}

// Valid bottom-nav / drawer-reachable main tabs
const TABS: TabId[] = ['home', 'search', 'video', 'wallet', 'discover', 'notifications', 'messages', 'profile'];

export function AmethystSimulator({ className = '', tourCommand, onCommandHandled }: AmethystSimulatorProps) {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<string | null>('root');
  // Bumped every time something asks Settings to open. `SettingsScreen` seeds
  // its own `section` once with useState, and the user can walk deeper inside
  // it, so neither the prop nor the section alone is enough to force the screen
  // back where a command wants it — keying on this token remounts it every
  // time, which is what a pushed screen does upstream (gaps ame-96).
  const [settingsOpenToken, setSettingsOpenToken] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [threadPost, setThreadPost] = useState<PostData | null>(null);
  // Whose profile the Profile tab is showing. `null` = the signed-in demo
  // account, which is where the drawer's Profile row and `viewProfile` land;
  // a MockUser = an author tapped in the feed (gaps ame-57).
  const [profileUser, setProfileUser] = useState<MockUser | null>(null);
  const [profileTab, setProfileTab] = useState<ProfileTab>('Notes');
  // The drawer's "You" / "Create" / "Accounts" destinations, pushed over the
  // tab content the way Settings is (gaps ame-31/32/112/113/126…133).
  const [drawerDetail, setDrawerDetail] = useState<DrawerDetailId | null>(null);
  // The note a reply is aimed at, so the composer can quote it (gaps ame-77).
  const [replyTo, setReplyTo] = useState<PostData | null>(null);
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');
  /**
   * Bottom-bar unread dots. Visiting a tab clears its dot, so the dot means
   * something instead of being permanent decoration (gaps ame-70). Wallet and
   * Browser are absent on purpose — upstream never dots them.
   */
  const [seenTabs, setSeenTabs] = useState<Record<string, boolean>>({});
  // Home is where the visitor starts, so it never opens with a dot even though
  // upstream can dot it.
  const unreadDots = {
    messages: !seenTabs.messages,
    notifications: !seenTabs.notifications,
  };
  const parentTheme = useParentTheme();
  const tourContext = useContext(TourContext);
  const registerAction = (actionType: string) => {
    if (tourContext?.registerAction) {
      tourContext.registerAction(actionType);
    }
  };
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    isVisible: boolean;
    type: 'success' | 'error' | 'info';
  }>({ message: '', isVisible: false, type: 'info' });

  /** The one way Settings gets opened, so every caller bumps the token. */
  const openSettingsAt = useCallback((section: string) => {
    setSettingsSection(section);
    setSettingsOpenToken((n) => n + 1);
    setIsSettingsOpen(true);
  }, []);

  // Show toast notification
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, isVisible: true, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 2500);
  }, []);

  // Handle tab change
  const handleTabChange = useCallback((tab: string) => {
    if (tab === 'settings') {
      openSettingsAt('root');
      registerAction('navigate_settings');
    } else {
      setActiveTab(tab as TabId);
      setSeenTabs((s) => ({ ...s, [tab]: true }));
      if (tab === 'home') registerAction('navigate_home');
      if (tab === 'profile') registerAction('view_profile');
    }
  }, [registerAction, openSettingsAt]);

  // Handle drawer navigation. "Relays" is a section inside Settings rather than
  // a standalone screen; the drawer's own pushed destinations go through
  // `onOpenDetail` and Bookmarks through `onOpenProfileTab`, so they never
  // arrive here.
  const handleDrawerNavigate = useCallback((id: string) => {
    if (TABS.includes(id as TabId)) {
      setActiveTab(id as TabId);
      if (id === 'home') registerAction('navigate_home');
      // The drawer's Profile row always means YOUR profile, so it clears any
      // author left over from a feed tap.
      if (id === 'profile') {
        setProfileUser(null);
        registerAction('view_profile');
      }
    } else if (id === 'relays') {
      // "Relays" is still its own drawer row under System in v1.13.1 (with the
      // live connected/total counter); Security Filters is not — it moved into
      // Settings › Account Settings this release.
      openSettingsAt('relays');
      registerAction('navigate_settings');
    } else {
      setActiveTab('home');
    }
    setIsDrawerOpen(false);
  }, [registerAction, openSettingsAt]);

  /**
   * A published note. It used to only toast — `HomeScreen` took no prop for a
   * fresh note and never called `setPosts`, so the note the visitor had just
   * written was nowhere (gaps ame-15).
   */
  const [newPost, setNewPost] = useState<PostData | null>(null);
  const handleNewPost = useCallback((content: string) => {
    const body = content.trim();
    if (body) {
      setNewPost({
        id: `own-${Date.now()}`,
        author: {
          name: 'sandy',
          handle: 'sandy.example',
          avatar: '',
          nip05: 'sandy.example',
          isVerified: true,
          following: true,
        },
        content: body,
        timestamp: 'now',
        stats: { replies: 0, reposts: 0, zaps: 0, likes: 0 },
      });
      setActiveTab('home');
    }
    registerAction('post');
    showToast('Post published successfully! 🎉', 'success');
  }, [showToast, registerAction]);

  // Handle login
  const handleLogin = useCallback((user: MockUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    registerAction('login');
    registerAction('navigate_home');
    showToast(`Welcome, ${user.displayName}!`, 'success');
  }, [showToast, registerAction]);

  // Get theme classes based on parent site theme
  const getThemeClass = () => {
    return parentTheme === 'dark' ? 'dark' : '';
  };
  
  // Get background/text colors based on theme
  const getThemeColors = () => {
    return parentTheme === 'dark' 
      ? 'bg-[var(--md-background)] text-[var(--md-on-background)]' 
      : 'bg-[var(--md-background)] text-[var(--md-on-background)]';
  };

  // Handle tour commands
  useEffect(() => {
    if (!tourCommand) return;
    
    console.log('[AmethystSimulator] Processing command:', tourCommand);
    
    switch (tourCommand.type) {
      case 'login':
        if (!isAuthenticated) {
          // Create mock user
          const mockUser: MockUser = {
            pubkey: 'npub1amethyst123',
            displayName: 'Amethyst User',
            username: 'amethystuser',
            avatar: generateAvatarGradient('amethyst'), // local, offline — no DiceBear
            bio: 'Exploring Nostr with Amethyst',
            followersCount: 42,
            followingCount: 10,
            createdAt: Date.now() / 1000,
            lastActive: Date.now() / 1000,
          };
          handleLogin(mockUser);
        }
        break;
        
      case 'navigate': {
        // `drawer:<id>` reaches the drawer's own pushed screens. Additive: the
        // eight TabId payloads keep their exact meaning, and an unknown id is
        // ignored rather than landing the visitor on a blank overlay.
        const raw = tourCommand.payload;
        // `thread` opens the note detail on the newest feed note. Until now the
        // overlay was reachable only by physically tapping a card, so no tour or
        // FAQ step could land on it (gaps ame-20).
        if (raw === 'thread') {
          const first = buildFeedPosts()[0];
          if (first) {
            setIsComposeOpen(false);
            setIsSettingsOpen(false);
            setIsDrawerOpen(false);
            setDrawerDetail(null);
            setActiveTab('home');
            setThreadPost(first);
          }
          break;
        }
        if (typeof raw === 'string' && raw.startsWith('drawer:')) {
          const id = raw.slice(7) as DrawerDetailId;
          if (DRAWER_DETAIL_IDS.includes(id)) {
            setIsComposeOpen(false);
            setIsSettingsOpen(false);
            setIsDrawerOpen(false);
            setThreadPost(null);
            setDrawerDetail(id);
          }
          break;
        }
        const tab = raw as TabId;
        if (TABS.includes(tab)) {
          setActiveTab(tab);
          setDrawerDetail(null);
          if (tab === 'profile') { setProfileUser(null); setProfileTab('Notes'); }
          setIsComposeOpen(false); // don't let an open composer linger over later steps
          // Navigation also dismisses the one-way overlays (settings/drawer/
          // thread) — otherwise every step after openSettings spotlights
          // elements buried under the z-[55] overlay (gaps ame-56).
          setIsSettingsOpen(false);
          setIsDrawerOpen(false);
          setThreadPost(null);
        }
        break;
      }

      case 'compose':
        if (isAuthenticated) {
          setIsSettingsOpen(false);
          setIsDrawerOpen(false);
          setThreadPost(null);
          setDrawerDetail(null);
          setReplyTo(null);
          setIsComposeOpen(true);
        }
        break;
        
      case 'post':
        if (isAuthenticated) {
          setIsComposeOpen(true);
          // Simulate post after a short delay
          setTimeout(() => {
            handleNewPost('Tour test post!');
            setIsComposeOpen(false);
          }, 500);
        }
        break;
        
      case 'viewProfile':
        if (isAuthenticated) {
          // Optional payload: a mock pubkey opens THAT author's profile. No
          // payload keeps the historical meaning — your own profile — so every
          // stored tour/FAQ command keeps working.
          const who = typeof tourCommand.payload === 'string' ? getUserByPubkey(tourCommand.payload) : undefined;
          setProfileUser(who ?? null);
          setProfileTab('Notes');
          setActiveTab('profile');
          setDrawerDetail(null);
          setIsComposeOpen(false);
          setIsSettingsOpen(false);
          setIsDrawerOpen(false);
          // ThreadScreen is an absolute z-[60] overlay above the tab content —
          // without this, a user-opened thread stays painted over the profile.
          setThreadPost(null);
        }
        break;

      case 'openSettings': {
        if (isAuthenticated) {
          // Optional payload picks the section (gaps ame-43) — without it the
          // Relays/Security sections were reachable only by a drawer tap.
          const section = tourCommand.payload;
          // `security-hidden` is Security Filters with the Hidden Words tab
          // preselected — the mute demo needs to land on the word field, and
          // the tab is local state inside the screen.
          if (
            section === 'relays' ||
            section === 'security' ||
            section === 'security-hidden' ||
            section === 'security-spammers' ||
            section === 'preferences' ||
            section === 'backup-keys' ||
            section === 'media-servers' ||
            section === 'privacy' ||
            section === 'vanish' ||
            section === 'vanish-history'
          ) {
            openSettingsAt(section);
          } else {
            // No payload = the v1.13.1 root list, which is what the drawer's
            // Settings row opens. Reset explicitly: without this the screen
            // reopened on whatever detail a previous command had selected.
            openSettingsAt('root');
          }
          setIsComposeOpen(false);
          setIsDrawerOpen(false);
          setDrawerDetail(null);
        }
        break;
      }

      case 'openDrawer':
        // The account drawer holds the whole keys/relays/media-servers branch
        // — without a command it was reachable only by tapping the app-bar
        // avatar (gaps ame-30).
        if (isAuthenticated) {
          setIsComposeOpen(false);
          setIsSettingsOpen(false);
          setThreadPost(null);
          setDrawerDetail(null);
          setIsDrawerOpen(true);
        }
        break;
        
      case 'back':
        // Optional payload 'signup' lands on the Welcome Ostrich! page. Without
        // it `back` keeps its historical meaning — log out onto Login — so every
        // stored command is unaffected (gaps ame-04).
        setLoginMode(tourCommand.payload === 'signup' ? 'signup' : 'login');
        setIsAuthenticated(false);
        setCurrentUser(null);
        setDrawerDetail(null);
        break;
    }
    
    // Mark command as handled
    onCommandHandled?.();
  }, [tourCommand, isAuthenticated, handleLogin, handleNewPost, onCommandHandled, openSettingsAt]);

  // Render active screen
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            key="home"
            newPost={newPost}
            onOpenCompose={() => { setReplyTo(null); setIsComposeOpen(true); }}
            onReplyTo={(post) => { setReplyTo(post); setIsComposeOpen(true); }}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onOpenThread={(post) => setThreadPost(post)}
            onOpenProfile={(post) => {
              setProfileUser(post.pubkey ? getUserByPubkey(post.pubkey) ?? null : null);
              setThreadPost(null);
              setActiveTab('profile');
              registerAction('view_profile');
            }}
            onLikePost={() => registerAction('like')}
          />
        );
      // The globe destination: Browser in v1.13.1 (was Discover in v1.12.6).
      case 'search':
        return <BrowserScreen key="browser" />;
      case 'wallet':
        return <WalletScreen key="wallet" />;
      // Both dropped out of the bottom bar this release; still reachable from
      // the drawer's "Navigate" section, so they keep their screens.
      case 'discover':
        return <DiscoverScreen key="discover" onOpenDrawer={() => setIsDrawerOpen(true)} />;
      case 'video':
        return <VideoScreen key="video" onOpenDrawer={() => setIsDrawerOpen(true)} />;
      case 'notifications':
        return <NotificationsScreen key="notifications" onOpenDrawer={() => setIsDrawerOpen(true)} />;
      case 'messages':
        return <MessagesScreen key="messages" onOpenDrawer={() => setIsDrawerOpen(true)} />;
      case 'profile':
        return (
          <ProfileScreen
            // Keyed by subject so switching authors resets the tab row and the
            // follow pill instead of carrying the previous profile's state over.
            key={`profile-${profileUser?.pubkey ?? 'self'}-${profileTab}`}
            user={profileUser}
            initialTab={profileTab}
            onBack={() => {
              setProfileUser(null);
              setProfileTab('Notes');
              setActiveTab('home');
            }}
            onFollowToggle={() => registerAction('follow')}
            onMessage={() => { setProfileUser(null); setActiveTab('messages'); }}
            onReplyTo={(post) => { setReplyTo(post as PostData); setIsComposeOpen(true); }}
          />
        );
      default:
        return null;
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <AmethystToastContext.Provider value={showToast}>
        <div
          className={`amethyst-simulator ${getThemeClass()} ${className}`}
          data-theme={parentTheme}
        >
          <LoginScreen onLogin={handleLogin} initialMode={loginMode} />
        </div>
      </AmethystToastContext.Provider>
    );
  }

  return (
    <AmethystToastContext.Provider value={showToast}>
    <div 
      className={`amethyst-simulator ${getThemeClass()} ${className}`}
      data-theme={parentTheme}
    >
      {/* Drawer Navigation */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onTabChange={handleDrawerNavigate}
        onOpenDetail={(detail) => {
          setDrawerDetail(detail);
          setIsDrawerOpen(false);
        }}
        onOpenProfileTab={(tab) => {
          setProfileUser(null);
          setProfileTab(tab);
          setDrawerDetail(null);
          setActiveTab('profile');
          registerAction('view_profile');
        }}
        onOpenSettings={() => {
          // The drawer's System › Settings row lands on the searchable root
          // list, not on a detail screen.
          openSettingsAt('root');
          setIsDrawerOpen(false);
          // Same destination as the drawer's relays/security entries, so it has
          // to report the same tour action — without this the settings step sat
          // waiting while Settings was already open in front of the user.
          registerAction('navigate_settings');
        }}
      />

      {/* Main Content Area.
          NOTE: no screen-level enter/exit animation here. AnimatePresence mode="wait"
          deadlocked with the shared layoutId indicators (froze tab navigation), and a
          keyed motion.div's opacity spring got stuck partway (interfered with the inner
          layout animations). A plain keyed div remounts each screen reliably; the inner
          per-element animations (cards/rows) still replay on the key change. */}
      <div className="amethyst-simulator-content pb-20">
        <div key={activeTab} className="h-full">
          {renderScreen()}
        </div>
      </div>

      {/* FAB - Only show on Home tab */}
      <AnimatePresence>
        {activeTab === 'home' && !isComposeOpen && !drawerDetail && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-24 right-4 z-20"
          >
            <FloatingActionButton
              onClick={() => {
                registerAction('compose');
                setIsComposeOpen(true);
              }}
              variant="primary"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation - hidden on Profile (full-screen), while composing, and in the thread view */}
      {activeTab !== 'profile' && !isComposeOpen && !threadPost && !isSettingsOpen && !drawerDetail && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          unread={unreadDots}
        />
      )}

      {/* Compose Modal */}
      <ComposeScreen
        isOpen={isComposeOpen}
        onClose={() => { setIsComposeOpen(false); setReplyTo(null); }}
        onPost={handleNewPost}
        replyTo={replyTo ? { author: replyTo.author.name, content: replyTo.content } : null}
      />

      {/* Drawer destinations — same overlay band as Settings (both are pushed
          screens over the tab content, not tabs of their own). */}
      {drawerDetail && (
        <div className="absolute inset-0 z-[55] bg-[var(--md-background)]">
          <DrawerDetailScreen
            key={drawerDetail}
            detail={drawerDetail}
            onBack={() => setDrawerDetail(null)}
            onLogout={() => {
              setDrawerDetail(null);
              setIsAuthenticated(false);
              setCurrentUser(null);
            }}
          />
        </div>
      )}

      {/* Note / thread detail overlay */}
      {threadPost && (
        <ThreadScreen
          post={threadPost}
          onBack={() => setThreadPost(null)}
          onOpenProfile={(post) => {
            setProfileUser(post.pubkey ? getUserByPubkey(post.pubkey) ?? null : null);
            setThreadPost(null);
            setActiveTab('profile');
            registerAction('view_profile');
          }}
        />
      )}

      {/* Settings — full-screen within the phone (plain div: a framer opacity spring
          gets stuck at ~0.95 here and lets the feed bleed through on OLED black). */}
      {isSettingsOpen && (
        <div className="absolute inset-0 z-[55] bg-[var(--md-background)]">
          <SettingsScreen
            key={`${settingsSection ?? 'root'}-${settingsOpenToken}`}
            onBack={() => setIsSettingsOpen(false)}
            initialSection={settingsSection}
          />
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="md-snackbar">
              <span>{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </AmethystToastContext.Provider>
  );
}

export default AmethystSimulator;
