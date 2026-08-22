import { useCallback, useContext, useEffect, useState } from 'react';
import { useParentTheme } from '../shared/hooks/useParentTheme';
import { useScreenSync } from '../shared/screenSync';
import { TourContext } from '../../components/tour';
import type { MockUser } from '../../data/mock';
import { BottomBar } from './components/BottomBar';
import { TtsMiniPlayer } from './components/TtsMiniPlayer';
import { HomeScreen } from './screens/HomeScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { FeedsScreen } from './screens/FeedsScreen';
import { SearchScreen } from './screens/SearchScreen';
import { YouScreen } from './screens/YouScreen';
import { ReaderScreen } from './screens/ReaderScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AboutScreen } from './screens/AboutScreen';
import { SupportScreen } from './screens/SupportScreen';
import { DEFAULT_SETTINGS, SettingsScreen, type SettingsState } from './screens/SettingsScreens';
import { articleById, borisArticles, DEMO_USER, type BorisArticle } from './borisData';
import type {
  BorisSettingsScreen,
  BorisSimulatorProps,
  BorisTab,
  FeedScope,
  FeedTab,
  LibraryScope,
  ProfileTab,
  ReaderPane,
  SimulatorCommand,
} from './types';
import './boris.theme.css';

export type { SimulatorCommand, BorisSimulatorProps } from './types';
export type TabId = BorisTab;

const TABS: BorisTab[] = ['home', 'library', 'feeds', 'search', 'you'];

/**
 * Boris — a nostr-native reader (dergigi/boris-android v1.4.49).
 *
 * Shell shape from ui/BorisApp.kt: one app-level Scaffold owning the bottom
 * bar, five tab routes, and six off-tab routes (reader, settings, about,
 * support, profile, browser). **The bottom bar exists only on the five tabs**
 * (BorisApp.kt:216) — the reader, settings and the About carousel are
 * full-bleed, which is most of why the app feels calm.
 *
 * Boris is also the first client here where being signed out is a first-class
 * state rather than a wall: Home, Feeds, Search and the whole reader work with
 * no account, and only Library and You ask you to connect. The reproduction
 * opens signed out for exactly that reason.
 */
export function BorisSimulator({ className = '', tourCommand, onCommandHandled }: BorisSimulatorProps) {
  const parentTheme = useParentTheme();
  const tourContext = useContext(TourContext);
  const registerAction = useCallback(
    (actionType: string) => {
      tourContext?.registerAction?.(actionType);
    },
    [tourContext],
  );

  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<MockUser>(DEMO_USER);
  const [activeTab, setActiveTab] = useState<BorisTab>('home');

  // Home notices — both dismissible and both persisted upstream
  // (HomeOnboardingStore); here they simply live for the session.
  const [showFirstTime, setShowFirstTime] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(true);

  const [libraryScope, setLibraryScope] = useState<LibraryScope>('all');
  const [feedTab, setFeedTab] = useState<FeedTab>('all');
  const [feedScopes, setFeedScopes] = useState<FeedScope[]>(['nostrverse']);
  const [profileTab, setProfileTab] = useState<ProfileTab>('highlights');
  const [query, setQuery] = useState('');

  const [article, setArticle] = useState<BorisArticle | null>(null);
  const [pane, setPane] = useState<ReaderPane>(null);
  const [ownMarks, setOwnMarks] = useState<string[]>([]);
  /**
   * What the visitor has saved from the reader, and how. Upstream this is a
   * NIP-51 bookmark list the signer has to sign, which is why the recording
   * bounces to Amber between the tap and the filled bookmark icon; here the
   * choice lands straight in state. Keyed by article id.
   */
  const [savedArticles, setSavedArticles] = useState<Record<string, 'private' | 'public'>>({});
  // Both menus live here rather than inside their screens so a tour command can
  // park one open (see ReaderScreen's `saveMenuOpen` comment).
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const [tts, setTts] = useState<{ article: BorisArticle; playing: boolean; block: number } | null>(null);

  const [settingsScreen, setSettingsScreen] = useState<BorisSettingsScreen | null>(null);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<MockUser | null>(null);

  const patchSettings = useCallback((patch: Partial<SettingsState>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const closeOverlays = useCallback(() => {
    setSaveMenuOpen(false);
    setAccountMenuOpen(false);
    setArticle(null);
    setPane(null);
    setSettingsScreen(null);
    setAboutOpen(false);
    setSupportOpen(false);
    setProfileUser(null);
  }, []);

  const openArticle = useCallback(
    (a: BorisArticle) => {
      setArticle(a);
      setPane(null);
      setProgress((p) => ({ ...p, [a.id]: p[a.id] ?? 1 }));
      registerAction('open_article');
    },
    [registerAction],
  );

  const handleLogin = useCallback(() => {
    setLoggedIn(true);
    setCurrentUser(DEMO_USER);
    setShowLoginPrompt(false);
    setFeedScopes(['nostrverse', 'friends']);
    registerAction('login');
  }, [registerAction]);

  // Keep your place across a client switch (shared/screenSync.ts). Boris has no
  // notifications or messages; `bookmarks` maps to Library, which is the one
  // intent it genuinely owns better than anyone else here.
  useScreenSync<BorisTab>({
    map: { feed: 'feeds', search: 'search', profile: 'you', bookmarks: 'library' },
    current: article || settingsScreen || aboutOpen ? null : activeTab,
    onRestore: (screen) => {
      closeOverlays();
      setActiveTab(screen);
    },
  });

  // Tour command handling — the interface CLAUDE.md marks non-negotiable.
  useEffect(() => {
    if (!tourCommand) return;
    switch (tourCommand.type) {
      case 'login':
        handleLogin();
        break;
      case 'navigate': {
        const tab = tourCommand.payload as BorisTab;
        if (TABS.includes(tab)) {
          closeOverlays();
          setActiveTab(tab);
        }
        break;
      }
      case 'openArticle': {
        const a = articleById(String(tourCommand.payload ?? 'infinite-scroll')) ?? borisArticles[0];
        closeOverlays();
        openArticle(a);
        break;
      }
      case 'highlight': {
        // Self-sufficient: opens the article itself, so a step never has to
        // pair {openArticle} with {highlight} and risk the queue dropping one.
        const a = articleById('infinite-scroll') ?? borisArticles[0];
        closeOverlays();
        openArticle(a);
        // The LEAD paragraph, not the pull-quote further down: this command is
        // what the tour's highlight step fires, and a mark the visitor has to
        // scroll to prove nothing. The lead sits directly under the meta chips,
        // inside the same ring the step draws.
        const lead = a.body.find((b) => b.type === 'lead') ?? a.body.find((b) => b.type === 'p');
        if (lead && 'text' in lead) setOwnMarks((m) => (m.includes(lead.text) ? m : [...m, lead.text]));
        registerAction('highlight');
        break;
      }
      case 'saveToLibrary': {
        // Self-sufficient: signs in, opens an article the visitor has not saved
        // and parks the private/public menu open, so one command is the whole
        // step. `library` in the FAQ bank rings this.
        const a = articleById('commonplace-book') ?? borisArticles[0];
        setLoggedIn(true);
        closeOverlays();
        openArticle(a);
        setSavedArticles((m) => {
          const next = { ...m };
          delete next[a.id];
          return next;
        });
        setSaveMenuOpen(true);
        break;
      }
      case 'accountMenu': {
        // The only place in the app you can sign out (AccountScreen.kt:133-144).
        setLoggedIn(true);
        closeOverlays();
        setActiveTab('you');
        setAccountMenuOpen(true);
        break;
      }
      case 'openPane': {
        const a = article ?? articleById('infinite-scroll') ?? borisArticles[0];
        closeOverlays();
        openArticle(a);
        setPane((tourCommand.payload as ReaderPane) ?? 'highlights');
        break;
      }
      case 'playTts': {
        const a = article ?? articleById('ferry-line') ?? borisArticles[0];
        closeOverlays();
        openArticle(a);
        setTts({ article: a, playing: true, block: 1 });
        registerAction('listen');
        break;
      }
      case 'openSettings': {
        closeOverlays();
        setSettingsScreen((tourCommand.payload as BorisSettingsScreen) ?? 'root');
        registerAction('navigate_settings');
        break;
      }
      case 'openAbout':
        closeOverlays();
        setAboutOpen(true);
        break;
      case 'viewProfile': {
        closeOverlays();
        setProfileUser(DEMO_USER);
        registerAction('view_profile');
        break;
      }
      case 'back':
        setLoggedIn(false);
        setShowFirstTime(true);
        setShowLoginPrompt(true);
        setFeedScopes(['nostrverse']);
        closeOverlays();
        break;
    }
    onCommandHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourCommand]);

  // Follow-along: advance the spoken paragraph while TTS "plays".
  useEffect(() => {
    if (!tts?.playing) return;
    const id = window.setInterval(() => {
      setTts((t) => (t ? { ...t, block: (t.block + 1) % t.article.body.length } : t));
    }, 3200);
    return () => window.clearInterval(id);
  }, [tts?.playing, tts?.article.id]);

  const theme = parentTheme === 'dark' ? 'dark' : 'light';

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            loggedIn={loggedIn}
            showFirstTime={showFirstTime}
            showLoginPrompt={showLoginPrompt && !loggedIn}
            progress={progress}
            onDismissFirstTime={() => setShowFirstTime(false)}
            onDismissLoginPrompt={() => setShowLoginPrompt(false)}
            onOpenAbout={() => setAboutOpen(true)}
            onOpenLogin={handleLogin}
            onOpenSupport={() => setSupportOpen(true)}
            onOpenProfile={setProfileUser}
            onOpenHomeSettings={() => setSettingsScreen('home')}
            onOpenArticle={openArticle}
          />
        );
      case 'library':
        return (
          <LibraryScreen
            loggedIn={loggedIn}
            saved={savedArticles}
            scope={libraryScope}
            onScopeChange={setLibraryScope}
            onLogin={handleLogin}
            onOpenArticle={openArticle}
            onOpenInfo={() => setSettingsScreen('library')}
          />
        );
      case 'feeds':
        return (
          <FeedsScreen
            loggedIn={loggedIn}
            tab={feedTab}
            scopes={feedScopes}
            onTabChange={setFeedTab}
            onToggleScope={(s) =>
              setFeedScopes((cur) => {
                const next = cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s];
                // FeedScope.toggle refuses a state with nothing selected.
                return next.length === 0 ? cur : next;
              })
            }
            onOpenArticle={openArticle}
            onOpenProfile={setProfileUser}
            onOpenInfo={() => setSettingsScreen('feeds')}
            onOpenFeedSettings={() => setSettingsScreen('feeds')}
          />
        );
      case 'search':
        return (
          <SearchScreen
            query={query}
            onQueryChange={setQuery}
            onOpenArticle={openArticle}
            onOpenProfile={setProfileUser}
          />
        );
      case 'you':
        return (
          <YouScreen
            loggedIn={loggedIn}
            currentUser={currentUser}
            tab={profileTab}
            onTabChange={setProfileTab}
            onLogin={handleLogin}
            onOpenArticle={openArticle}
            onOpenProfile={setProfileUser}
            onOpenSupport={() => setSupportOpen(true)}
            onOpenSettings={() => setSettingsScreen('root')}
            menuOpen={accountMenuOpen}
            onMenuChange={setAccountMenuOpen}
            onLogout={() => {
              // The `⋮` on You is the only sign-out in the whole app
              // (AccountScreen.kt:133-144). Signing out drops everything the
              // session earned: your marks, your saves and your own highlight
              // layer on Home.
              setLoggedIn(false);
              setOwnMarks([]);
              setSavedArticles({});
              setProfileTab('highlights');
              setAccountMenuOpen(false);
            }}
          />
        );
    }
  };

  const offTab = Boolean(article || settingsScreen || aboutOpen || supportOpen || profileUser);

  const player = tts ? (
    <TtsMiniPlayer
      title={tts.article.title}
      playing={tts.playing}
      speed={settings.ttsSpeed}
      followAlong={settings.ttsFollowAlong}
      onToggle={() => setTts((t) => (t ? { ...t, playing: !t.playing } : t))}
      onClose={() => setTts(null)}
      onOpenArticle={() => openArticle(tts.article)}
      onSkip={(d) =>
        setTts((t) =>
          t ? { ...t, block: Math.max(0, Math.min(t.article.body.length - 1, t.block + d)) } : t,
        )
      }
    />
  ) : null;

  return (
    <div className={`boris-simulator ${className}`} data-theme={theme}>
      <div className="relative min-h-0 flex-1">
        {renderTab()}

        {/* Stacked routes — plain divs at their final state (the preview
            freezes framer animations, so nothing here animates in). */}
        {profileUser && (
          <div className="absolute inset-0 z-20">
            <ProfileScreen
              user={profileUser}
              onBack={() => setProfileUser(null)}
              onOpenArticle={(a) => {
                setProfileUser(null);
                openArticle(a);
              }}
              onOpenProfile={setProfileUser}
            />
          </div>
        )}
        {supportOpen && (
          <div className="absolute inset-0 z-30">
            <SupportScreen onBack={() => setSupportOpen(false)} />
          </div>
        )}
        {aboutOpen && (
          <div className="absolute inset-0 z-40">
            <AboutScreen onBack={() => setAboutOpen(false)} onStartReading={() => setAboutOpen(false)} />
          </div>
        )}
        {settingsScreen && (
          <div className="absolute inset-0 z-40">
            <SettingsScreen
              screen={settingsScreen}
              settings={settings}
              onSettings={patchSettings}
              onScreenChange={setSettingsScreen}
              onBack={() => setSettingsScreen(null)}
              onOpenAbout={() => {
                setSettingsScreen(null);
                setAboutOpen(true);
              }}
              onOpenSupport={() => {
                setSettingsScreen(null);
                setSupportOpen(true);
              }}
            />
          </div>
        )}
        {article && (
          <div className="absolute inset-0 z-50">
            <ReaderScreen
              article={article}
              loggedIn={loggedIn}
              progress={progress[article.id] ?? 0}
              pane={pane}
              ttsPlaying={Boolean(tts?.playing && tts.article.id === article.id)}
              ttsBlock={tts?.block ?? -1}
              ownMarks={ownMarks}
              highlightStyle={settings.highlightStyle}
              showHighlights={settings.showHighlights}
              visibility={settings.visibility}
              onToggleMarks={() => patchSettings({ showHighlights: !settings.showHighlights })}
              onBack={() => {
                setArticle(null);
                setPane(null);
              }}
              onPaneChange={setPane}
              onScroll={(p) => setProgress((cur) => ({ ...cur, [article.id]: Math.max(cur[article.id] ?? 0, p) }))}
              onToggleTts={() =>
                setTts((t) =>
                  t && t.article.id === article.id
                    ? { ...t, playing: !t.playing }
                    : { article, playing: true, block: 1 },
                )
              }
              onOpenProfile={setProfileUser}
              savedAs={savedArticles[article.id] ?? null}
              saveMenuOpen={saveMenuOpen}
              onSaveMenuChange={setSaveMenuOpen}
              onSave={(visibility) => {
                setSavedArticles((m) => ({ ...m, [article.id]: visibility }));
                registerAction('save');
              }}
              onAddHighlight={(quote) => {
                setOwnMarks((m) => (m.includes(quote) ? m : [...m, quote]));
                // `withOwnHighlightsVisible()` — upstream force-shows your own
                // layer the moment one of your highlights lands
                // (ReaderViewModel.kt:428-430). Without it a reader who had
                // turned `mine` off would tap Highlight and watch nothing
                // happen, which reads as a broken button rather than a setting.
                patchSettings({
                  showHighlights: true,
                  visibility: { ...settings.visibility, mine: true },
                });
                registerAction('highlight');
              }}
              ttsSlot={player}
            />
          </div>
        )}
      </div>

      {/* Three mounting sites in the real app, and they differ: above the bottom
          bar on the five tabs, a bottom overlay on Settings/About/Support/
          Profile, and INSIDE the reader's own bottom column above the progress
          strip (BorisApp.kt:217-227, :455-462; ReaderScreen.kt:1866-1870).
          The reader case is passed down as a slot, which is why it is excluded
          here rather than floated on top. */}
      {tts && !article && (
        <div className={offTab ? 'absolute inset-x-0 bottom-0 z-[60]' : ''}>{player}</div>
      )}

      {!offTab && (
        <BottomBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            closeOverlays();
            setActiveTab(tab);
          }}
        />
      )}
    </div>
  );
}

export default BorisSimulator;
