import React, { useState, useContext, useEffect, useCallback } from 'react';
import './yakihonne.theme.css';
import { useParentTheme } from '../shared/hooks/useParentTheme';
import { TourContext } from '../../components/tour';

import { TabBar, type YakiTab } from './components/TabBar';
import { useScreenSync } from '../shared/screenSync';
import { Drawer, type DrawerDest } from './components/Drawer';
import { FeedSourceSheet, type FeedSource } from './components/FeedSelector';
import { ZapIcon } from './components/icons';

import { LoginScreen } from './screens/LoginScreen';
import { SignInScreen } from './screens/SignInScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MediaScreen } from './screens/MediaScreen';
import { WalletScreen } from './screens/WalletScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { SearchScreen } from './screens/SearchScreen';
import { ProfileScreen, type YakiProfile } from './screens/ProfileScreen';
import { ArticleReader } from './screens/ArticleReader';
import { ThreadScreen } from './screens/ThreadScreen';
import { ComposeSheet } from './screens/ComposeSheet';
import { SettingsScreen } from './screens/SettingsScreen';
import { NotificationSettingsScreen } from './screens/NotificationSettingsScreen';
import { RelaysScreen } from './screens/RelaysScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { homeNotes, yakiArticles, type YakiArticle, type YakiNoteData } from './data';

export type TabId = 'feed' | 'articles' | 'media' | 'profile' | 'wallet' | 'settings';

export interface SimulatorCommand {
  type:
    | 'login'
    | 'logout'
    | 'navigate'
    | 'compose'
    | 'post'
    | 'viewProfile'
    | 'openDrawer'
    | 'setSource'
    | 'openArticle'
    | 'openSearch';
  payload?: any;
}

export interface YakiHonneSimulatorProps {
  className?: string;
  tourCommand?: SimulatorCommand | null;
  onCommandHandled?: () => void;
}

const SELF: YakiProfile = {
  seed: 'sandy', name: 'sandy', nip05: true,
  nip05addr: '_@sandy.example', website: 'https://sandy.example',
  bio: 'All-round buidler.', followings: '2.37K', followers: '3.51K', isSelf: true,
};

function buildProfile(seed: string, name: string): YakiProfile {
  if (seed === SELF.seed) return SELF;
  return {
    seed, name, nip05: true,
    nip05addr: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@yakihonne.com`,
    bio: 'Nostrich exploring the decentralized web. ⚡',
    followings: '312', followers: '1.2K', followsYou: true,
  };
}

type Overlay =
  | { type: 'compose'; replyTo?: { name: string; seed: string; content: string; when: string } | null }
  | { type: 'thread'; note: YakiNoteData }
  | { type: 'article'; article: YakiArticle }
  | { type: 'profile'; profile: YakiProfile }
  | { type: 'search' }
  | { type: 'settings' }
  | { type: 'notifSettings' }
  | { type: 'relays' }
  | { type: 'dashboard' };

export function YakiHonneSimulator({ className = '', tourCommand, onCommandHandled }: YakiHonneSimulatorProps) {
  const parentTheme = useParentTheme();
  const tourContext = useContext(TourContext);
  const registerAction = (a: string) => tourContext?.registerAction?.(a);

  const [authed, setAuthed] = useState(false);
  // Logged-off routing: landing → "Log in" (keys/remote signer) or the 5-step
  // "Create account" wizard. "Continue as a guest" skips straight to the feed.
  const [authRoute, setAuthRoute] = useState<'welcome' | 'signin' | 'signup'>('welcome');
  const [tab, setTab] = useState<YakiTab>('home');

  // Keep your place across a client switch (shared/screenSync.ts).
  useScreenSync<YakiTab>({
    map: { feed: 'home', messages: 'dms', notifications: 'notifications' },
    current: authed ? tab : null,
    onRestore: (screen) => {
      setAuthed(true);
      setTab(screen);
    },
  });
  const [source, setSource] = useState<FeedSource>('recent');
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [balance, setBalance] = useState(537311);
  const [toast, setToast] = useState<string | null>(null);

  const push = useCallback((o: Overlay) => setOverlays((s) => [...s, o]), []);
  const pop = useCallback(() => setOverlays((s) => s.slice(0, -1)), []);

  const showToast = useCallback((m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  }, []);

  const goTab = useCallback((t: YakiTab) => { setOverlays([]); setDrawerOpen(false); setSourceSheetOpen(false); setTab(t); }, []);

  const login = useCallback(() => {
    setAuthed(true); setTab('home'); setOverlays([]);
    registerAction('login'); registerAction('navigate_home');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const viewProfile = (seed: string, name: string) => { registerAction('view_profile'); push({ type: 'profile', profile: buildProfile(seed, name) }); };
  const openArticle = (article: YakiArticle) => push({ type: 'article', article });
  const openThread = (id: string) => { const note = homeNotes.find((n) => n.id === id) || homeNotes[0]; push({ type: 'thread', note }); };
  const openCompose = () => { registerAction('compose'); push({ type: 'compose', replyTo: null }); };
  const openReply = () => push({ type: 'compose', replyTo: { name: 'Maria2000', seed: 'maria2000', content: homeNotes[0].content, when: 'On Jul 14 2026, 3:07PM' } });

  const doZap = (sats: number) => { setBalance((b) => Math.max(0, b - sats)); showToast(`Zapped ${sats} sats! ⚡`); };

  const onDrawerNav = (d: DrawerDest) => {
    setDrawerOpen(false);
    if (d === 'profile') push({ type: 'profile', profile: SELF });
    else if (d === 'dashboard') push({ type: 'dashboard' });
    else if (d === 'relays') push({ type: 'relays' });
    else if (d === 'settings') { registerAction('navigate_settings'); push({ type: 'settings' }); }
    else if (d === 'bookmarks') showToast('Bookmarks');
  };

  const onSettingsNav = (d: 'profile' | 'relays' | 'wallet' | 'notifications' | 'dashboard') => {
    if (d === 'profile') push({ type: 'profile', profile: SELF });
    else if (d === 'relays') push({ type: 'relays' });
    else if (d === 'wallet') { setOverlays([]); setTab('wallet'); }
    else if (d === 'notifications') push({ type: 'notifSettings' });
    else if (d === 'dashboard') push({ type: 'dashboard' });
  };

  // Tour command bridge (interface preserved)
  useEffect(() => {
    if (!tourCommand) return;
    // Every command is SELF-SUFFICIENT: it signs in on its own, so a step
    // never has to pair {login} with the real command and risk the queue
    // dropping the second one. `logout` is the sole exception.
    if (tourCommand.type !== 'logout' && !authed) login();
    switch (tourCommand.type) {
      case 'login':
        break;
      case 'logout':
        // gaps yak-01 — the landing (and its yakihonne-keys anchor) was gone
        // for the rest of the session after the first login.
        setOverlays([]);
        setDrawerOpen(false);
        setSourceSheetOpen(false);
        setTab('home');
        // Back to the LANDING, not to whichever auth screen the visitor last
        // used — authRoute sticks at 'signin' after a manual "Log in", and the
        // landing (with its yakihonne-keys anchor) would never mount again.
        setAuthRoute('welcome');
        setAuthed(false);
        break;
      case 'navigate': {
        const p = tourCommand.payload as string;
        // Every destination closes the drawer and the source sheet: both sit
        // above the tab content, so a stale one covers the spotlit surface.
        if (p === 'feed' || p === 'home') { goTab('home'); setSource('recent'); }
        else if (p === 'profile') { setDrawerOpen(false); setOverlays([{ type: 'profile', profile: SELF }]); }
        else if (p === 'settings') { setDrawerOpen(false); setOverlays([{ type: 'settings' }]); }
        else if (p === 'wallet') goTab('wallet');
        // gaps yak-17 — these three tabs had no payload at all.
        else if (p === 'media') goTab('media');
        else if (p === 'dms') goTab('dms');
        else if (p === 'notifications') goTab('notifications');
        // Drawer destinations, each otherwise three hops deep (yak-61/76/79).
        else if (p === 'relays') { setDrawerOpen(false); setOverlays([{ type: 'relays' }]); }
        else if (p === 'dashboard') { setDrawerOpen(false); setOverlays([{ type: 'dashboard' }]); }
        else if (p === 'notifSettings') { setDrawerOpen(false); setOverlays([{ type: 'notifSettings' }]); }
        break;
      }
      case 'openDrawer':
        // gaps yak-77 — the drawer was reachable only by tapping the app bar.
        setOverlays([]);
        setSourceSheetOpen(false);
        setTab('home');
        setDrawerOpen(true);
        break;
      case 'setSource':
        // gaps yak-94 — Articles/Trending are YakiHonne's signature surface
        // and no command could select them.
        goTab('home');
        setSource((tourCommand.payload as FeedSource) || 'recent');
        break;
      case 'openArticle': {
        // gaps yak-29 — the article reader needed Trending + a tap.
        const article = yakiArticles[0];
        if (article) {
          setDrawerOpen(false);
          setSourceSheetOpen(false);
          setTab('home');
          setOverlays([{ type: 'article', article }]);
        }
        break;
      }
      case 'openSearch':
        // gaps yak-66 — search was pushed only from the app bar.
        setDrawerOpen(false);
        setSourceSheetOpen(false);
        setOverlays([{ type: 'search' }]);
        break;
      case 'compose':
        setDrawerOpen(false);
        setSourceSheetOpen(false);
        setOverlays((s) => [...s, { type: 'compose', replyTo: null }]);
        break;
      case 'post':
        setOverlays([]); setTab('home'); showToast('Note published! 🎉');
        break;
      case 'viewProfile': {
        // payload 'other' opens SOMEONE ELSE's profile — the Follow button
        // only exists there; own profile shows "Edit profile" (gaps yak-93).
        const profile =
          tourCommand.payload === 'other'
            ? buildProfile(homeNotes[0].seed, homeNotes[0].name)
            : SELF;
        setDrawerOpen(false);
        setOverlays([{ type: 'profile', profile }]);
        break;
      }
    }
    onCommandHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourCommand]);

  const renderTab = () => {
    switch (tab) {
      case 'home':
        return (
          <HomeScreen
            currentUserSeed={SELF.seed} source={source} onOpenSourcePicker={() => setSourceSheetOpen(true)}
            onOpenDrawer={() => setDrawerOpen(true)} onOpenSearch={() => push({ type: 'search' })}
            onOpenThread={openThread} onOpenArticle={openArticle} onViewProfile={viewProfile}
            onReply={openReply} onZap={doZap}
          />
        );
      case 'media':
        return <MediaScreen currentUserSeed={SELF.seed} onOpenDrawer={() => setDrawerOpen(true)} onOpenSearch={() => push({ type: 'search' })} />;
      case 'wallet':
        return <WalletScreen currentUserSeed={SELF.seed} balance={balance} onOpenDrawer={() => setDrawerOpen(true)} />;
      case 'dms':
        return <MessagesScreen currentUserSeed={SELF.seed} onOpenDrawer={() => setDrawerOpen(true)} />;
      case 'notifications':
        return <NotificationsScreen currentUserSeed={SELF.seed} onOpenDrawer={() => setDrawerOpen(true)} onOpenNotifSettings={() => push({ type: 'notifSettings' })} />;
    }
  };

  const renderOverlay = (o: Overlay) => {
    switch (o.type) {
      case 'compose':
        return <ComposeSheet currentUserSeed={SELF.seed} replyTo={o.replyTo} onClose={pop} onPost={() => { registerAction('post'); pop(); showToast('Note published! 🎉'); }} />;
      case 'thread':
        return <ThreadScreen note={o.note} onBack={pop} onViewProfile={viewProfile} onReply={openReply} onZap={doZap} />;
      case 'article':
        return <ArticleReader article={o.article} onBack={pop} onViewProfile={viewProfile} />;
      case 'profile':
        return <ProfileScreen profile={o.profile} onBack={pop} onOpenThread={openThread} onReply={openReply} onZap={doZap} />;
      case 'search':
        return <SearchScreen onBack={pop} onViewProfile={viewProfile} />;
      case 'settings':
        return <SettingsScreen currentUserSeed={SELF.seed} onBack={pop} onNav={onSettingsNav} onToast={showToast} />;
      case 'notifSettings':
        return <NotificationSettingsScreen onBack={pop} />;
      case 'relays':
        return <RelaysScreen onBack={pop} />;
      case 'dashboard':
        return <DashboardScreen currentUserSeed={SELF.seed} onBack={pop} />;
    }
  };

  const showTabBar = authed && overlays.length === 0 && !drawerOpen;

  return (
    <div className={`yakihonne-simulator ${className}`} data-theme={parentTheme}>
      {!authed ? (
        <>
          {authRoute === 'welcome' && (
            <LoginScreen
              onSignIn={() => setAuthRoute('signin')}
              onSignUp={() => setAuthRoute('signup')}
              onGuest={login}
            />
          )}
          {authRoute === 'signin' && <SignInScreen onBack={() => setAuthRoute('welcome')} onLogin={login} />}
          {authRoute === 'signup' && <SignUpScreen onBack={() => setAuthRoute('welcome')} onDone={login} />}
        </>
      ) : (
        <>
          <div className="yakihonne-content">{renderTab()}</div>

          {overlays.map((o, i) => (
            <React.Fragment key={i}>{i === overlays.length - 1 && renderOverlay(o)}</React.Fragment>
          ))}

          {drawerOpen && <Drawer seed={SELF.seed} onClose={() => setDrawerOpen(false)} onNav={onDrawerNav} />}

          {/* feed-source picker — hoisted to the root (sibling of TabBar/Drawer, same
              pattern as ComposeSheet) so the bottom sheet spans the full phone frame */}
          {sourceSheetOpen && (
            <FeedSourceSheet value={source} onChange={setSource} onClose={() => setSourceSheetOpen(false)} />
          )}

          {showTabBar && (
            <TabBar
              active={tab}
              // Recording: FAB on Home notes feeds + Media + DMs — NOT on the Articles
              // (Trending) feed. [REC vs REPO — recording wins]
              fabVisible={(tab === 'home' && source !== 'trending') || tab === 'media' || tab === 'dms'}
              onNavigate={goTab}
              onCompose={() => openCompose()}
            />
          )}

          {toast && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-24 z-[80] flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--yh-surface-2)] text-[var(--yh-text)] text-[14px] font-medium shadow-lg">
              <ZapIcon filled className="w-4 h-4 text-[var(--yh-orange)]" />{toast}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default YakiHonneSimulator;
