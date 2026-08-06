import React, { useState, useCallback, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from './components/BottomNav';
import { FloatingActionButton } from './components/FloatingActionButton';
import { Drawer } from './components/Drawer';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SearchScreen } from './screens/SearchScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ComposeScreen } from './screens/ComposeScreen';
import { VideoScreen } from './screens/VideoScreen';
import { ThreadScreen } from './screens/ThreadScreen';
import type { PostData } from './components/MaterialCard';
import { useParentTheme } from '../shared/hooks/useParentTheme';
import './amethyst.theme.css';
import type { MockUser } from '../../data/mock';
import { generateAvatarGradient } from '../../data/mock';
import { TourContext } from '../../components/tour';

// Types
export type TabId = 'home' | 'search' | 'video' | 'notifications' | 'messages' | 'profile';

export interface SimulatorCommand {
  type: 'login' | 'navigate' | 'compose' | 'post' | 'viewProfile' | 'back' | 'openSettings' | 'openDrawer';
  payload?: any;
}

export interface AmethystSimulatorProps {
  className?: string;
  tourCommand?: SimulatorCommand | null;
  onCommandHandled?: () => void;
}

// Valid bottom-nav / main tabs
const TABS: TabId[] = ['home', 'search', 'video', 'notifications', 'messages', 'profile'];

export function AmethystSimulator({ className = '', tourCommand, onCommandHandled }: AmethystSimulatorProps) {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<string | null>('preferences');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [threadPost, setThreadPost] = useState<PostData | null>(null);
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
      setIsSettingsOpen(true);
      registerAction('navigate_settings');
    } else {
      setActiveTab(tab as TabId);
      if (tab === 'home') registerAction('navigate_home');
      if (tab === 'profile') registerAction('view_profile');
    }
  }, [registerAction]);

  // Handle drawer navigation. Some drawer items (relays/security) are sections
  // inside Settings rather than standalone screens, and bookmarks lives on the
  // profile — route those so every drawer item lands on a real destination.
  const handleDrawerNavigate = useCallback((id: string) => {
    if (TABS.includes(id as TabId)) {
      setActiveTab(id as TabId);
      if (id === 'home') registerAction('navigate_home');
      if (id === 'profile') registerAction('view_profile');
    } else if (id === 'relays') {
      setSettingsSection('relays');
      setIsSettingsOpen(true);
      registerAction('navigate_settings');
    } else if (id === 'security') {
      setSettingsSection('security');
      setIsSettingsOpen(true);
      registerAction('navigate_settings');
    } else if (id === 'bookmarks') {
      setActiveTab('profile');
      registerAction('view_profile');
    } else {
      setActiveTab('home');
    }
    setIsDrawerOpen(false);
  }, [registerAction]);

  // Handle new post
  const handleNewPost = useCallback((content: string) => {
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
        
      case 'navigate':
        const tab = tourCommand.payload as TabId;
        if (['home', 'search', 'video', 'notifications', 'messages', 'profile'].includes(tab)) {
          setActiveTab(tab);
          setIsComposeOpen(false); // don't let an open composer linger over later steps
          // Navigation also dismisses the one-way overlays (settings/drawer/
          // thread) — otherwise every step after openSettings spotlights
          // elements buried under the z-[55] overlay (gaps ame-56).
          setIsSettingsOpen(false);
          setIsDrawerOpen(false);
          setThreadPost(null);
        }
        break;

      case 'compose':
        if (isAuthenticated) {
          setIsSettingsOpen(false);
          setIsDrawerOpen(false);
          setThreadPost(null);
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
          setActiveTab('profile');
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
          if (section === 'relays' || section === 'security' || section === 'preferences') {
            setSettingsSection(section);
          }
          setIsSettingsOpen(true);
          setIsComposeOpen(false);
          setIsDrawerOpen(false);
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
          setIsDrawerOpen(true);
        }
        break;
        
      case 'back':
        setIsAuthenticated(false);
        setCurrentUser(null);
        break;
    }
    
    // Mark command as handled
    onCommandHandled?.();
  }, [tourCommand, isAuthenticated, handleLogin, handleNewPost, onCommandHandled]);

  // Render active screen
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            key="home"
            onOpenCompose={() => setIsComposeOpen(true)}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onOpenThread={(post) => setThreadPost(post)}
            onLikePost={() => registerAction('like')}
          />
        );
      case 'search':
        return <SearchScreen key="search" onOpenDrawer={() => setIsDrawerOpen(true)} />;
      case 'video':
        return <VideoScreen key="video" onOpenDrawer={() => setIsDrawerOpen(true)} />;
      case 'notifications':
        return <NotificationsScreen key="notifications" onOpenDrawer={() => setIsDrawerOpen(true)} />;
      case 'messages':
        return <MessagesScreen key="messages" onOpenDrawer={() => setIsDrawerOpen(true)} />;
      case 'profile':
        return (
          <ProfileScreen
            key="profile"
            onBack={() => setActiveTab('home')}
            onFollowToggle={() => registerAction('follow')}
          />
        );
      default:
        return null;
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div 
        className={`amethyst-simulator ${getThemeClass()} ${className}`}
        data-theme={parentTheme}
      >
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  return (
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
        onOpenSettings={() => {
          setSettingsSection('preferences');
          setIsSettingsOpen(true);
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
        {activeTab === 'home' && !isComposeOpen && (
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
      {activeTab !== 'profile' && !isComposeOpen && !threadPost && !isSettingsOpen && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}

      {/* Compose Modal */}
      <ComposeScreen
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onPost={handleNewPost}
      />

      {/* Note / thread detail overlay */}
      {threadPost && (
        <ThreadScreen post={threadPost} onBack={() => setThreadPost(null)} />
      )}

      {/* Settings — full-screen within the phone (plain div: a framer opacity spring
          gets stuck at ~0.95 here and lets the feed bleed through on OLED black). */}
      {isSettingsOpen && (
        <div className="absolute inset-0 z-[55] bg-[var(--md-background)]">
          <SettingsScreen
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
  );
}

export default AmethystSimulator;
