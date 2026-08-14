/**
 * Coracle — the app shell.
 *
 * Rebuilt token-first from `docs/refs/coracle/screen-map.md` (owner's recording
 * 2026-08-05 + `coracle-social/coracle@efea13f`). The previous version was a
 * generic indigo sketch with an invented paper-plane logo and viewport units
 * that clipped inside the host card; almost none of it survives.
 *
 * The shell facts, all from §5:
 *  - LEFT SIDEBAR of six TEXT-ONLY items — Feeds · Relays · Notifications ·
 *    Messages · Groups · Lists. No icons on any of them. The active item is
 *    `text-3xl text-accent` against `text-2xl text-tinted-400`, so it
 *    physically GROWS, plus an accent underline that flies in.
 *  - The sidebar is warm (`tinted-700`) over a cold page (`neutral-800`), and
 *    the top bar is darker than both (`neutral-900`). Getting these three
 *    surfaces wrong is how the old sketch lost the client's character.
 *  - The top bar is right-aligned and holds only search + `Post +`. No logo,
 *    no tabs.
 *  - The sidebar owns its bottom: a three-counter publish HUD over a hairline,
 *    then the account row.
 *  - Almost every secondary surface is a MODAL over a 50% scrim, and the scrim
 *    is inset past the sidebar (`ml-72`) so the sidebar stays lit.
 *  - There is NO compose FAB. Compose is the top bar's `Post +`.
 *
 * Width gates are measured on the CONTAINER, not the viewport — the sim lives
 * in a card narrower than the window, and viewport media queries are what broke
 * the frameless clients before.
 */
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import './coracle.theme.css';
import { TourContext } from '../../components/tour';
import { useParentTheme } from '../shared/hooks/useParentTheme';
import type { MockNote, MockRelay, MockUser } from '../../data/mock';
import { Avatar } from './components/Avatar';
import { Icon } from './components/Icon';
import { FeedSelector } from './components/FeedSelector';
import { Sidebar } from './components/Sidebar';
import { FeedsScreen } from './screens/FeedsScreen';
import { LoginScreen, RemoteSignerScreen } from './screens/LoginScreen';
import { OnboardingScreen, type OnboardingStage } from './screens/OnboardingScreen';
import { RelaysScreen } from './screens/RelaysScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import {
  GroupsScreen,
  InviteScreen,
  ListsScreen,
  MessagesScreen,
  NotificationsScreen,
  StartConversationScreen,
} from './screens/SimpleScreens';
import { SettingsScreen, type SettingsPage } from './screens/SettingsScreens';
import { ComposeScreen, NoteDetailScreen } from './screens/ComposeScreen';

export type CoracleScreen =
  | 'feeds'
  | 'relays'
  | 'notifications'
  | 'messages'
  | 'groups'
  | 'lists'
  | 'profile'
  | 'settings'
  | 'invite';

/** Modals stack over whatever screen is beneath them, as upstream's do. */
export type CoracleModal =
  | { type: 'login' }
  | { type: 'bunker' }
  | { type: 'signup' }
  | { type: 'compose'; replyTo?: MockNote | null }
  | { type: 'note'; note: MockNote }
  | { type: 'profile'; user: MockUser }
  | { type: 'groups' }
  | { type: 'lists' }
  | { type: 'invite' }
  | { type: 'channel-create' };

export interface SimulatorCommand {
  type:
    | 'login'
    | 'logout'
    | 'navigate'
    | 'compose'
    | 'post'
    | 'viewProfile'
    | 'openThread'
    | 'zap'
    | 'openSettings'
    | 'showLogin';
  payload?: any;
}

interface CoracleSimulatorProps {
  tourCommand?: SimulatorCommand | null;
  onCommandHandled?: () => void;
  className?: string;
}

/** `MenuDesktop.svelte:88-123`, verbatim labels and order. */

export const CoracleSimulator: React.FC<CoracleSimulatorProps> = ({
  tourCommand,
  onCommandHandled,
}) => {
  const parentTheme = useParentTheme();
  const tourContext = useContext(TourContext);
  const registerAction = useCallback(
    (actionType: string) => tourContext?.registerAction?.(actionType),
    [tourContext],
  );

  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [screen, setScreen] = useState<CoracleScreen>('feeds');
  const [settingsPage, setSettingsPage] = useState<SettingsPage>('app');
  const [modals, setModals] = useState<CoracleModal[]>([]);
  const [submenu, setSubmenu] = useState<'settings' | 'account' | null>(null);
  const [profileUser, setProfileUser] = useState<MockUser | null>(null);
  const [signupStage, setSignupStage] = useState<OnboardingStage>('intro');

  const [activeFeed, setActiveFeed] = useState<string>('Notes & Replies');
  const [showReplies, setShowReplies] = useState(true);
  const [feedSearch, setFeedSearch] = useState('');
  const [topSearch, setTopSearch] = useState('');

  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [reposted, setReposted] = useState<Set<string>>(new Set());
  const [zapped, setZapped] = useState<Record<string, number>>({});
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [joinedRelays, setJoinedRelays] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const [mock, setMock] = useState<{ users: MockUser[]; notes: MockNote[]; relays: MockRelay[] }>({
    users: [],
    notes: [],
    relays: [],
  });

  const isAuthed = currentUser !== null;

  /**
   * Container width, measured with a CALLBACK ref rather than a one-shot
   * effect: the shell re-roots between states, and an effect keyed on `[]`
   * would keep observing a detached node and freeze every gate at its first
   * value. (Learned on Snort.)
   */
  const rootRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [width, setWidth] = useState(1022);

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

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      observerRef.current?.disconnect();
    };
  }, [measure]);

  /**
   * Upstream promotes the feed selector to a fixed right rail at `xl` (1280px
   * viewport) and folds it back into a card above the feed below that. The host
   * card is 1022px at a 1440px viewport and 918px at 1024px, so upstream's
   * threshold verbatim would make the rail dead code — it is scaled to the card
   * (screen-map §18.1).
   *
   * 1000 is chosen so the mapping matches upstream's OWN behaviour at the two
   * viewports we verify: a 1440px window (card 1022) shows the rail, exactly as
   * the 1434px recording does, and a 1024px window (card 918) folds it, exactly
   * as upstream folds below xl. It also keeps the feed column near its real
   * proportion instead of squeezing it to fit a third column that upstream
   * would not have shown at that size.
   */
  const showRail = width >= 1000;

  useEffect(() => {
    let alive = true;
    import('../../data/mock').then((m) => {
      if (!alive) return;
      setMock({
        users: m.mockUsers ?? [],
        notes: (m.mockNotes ?? []).slice(0, 25), // the feed cap this repo uses
        relays: m.mockRelays ?? [],
      });
      // Two joined relays, matching the recording's "2 relays" chips.
      setJoinedRelays(new Set((m.mockRelays ?? []).slice(0, 2).map((r: MockRelay) => r.url)));
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

  const feedNotes = useMemo(() => {
    if (showReplies) return mock.notes;
    // "Replies" off hides anything that tags another event as a reply.
    return mock.notes.filter((n) => !n.tags?.some((t) => t[0] === 'e'));
  }, [mock.notes, showReplies]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  // ---- Actions ----
  const closeModal = useCallback(() => setModals((m) => m.slice(0, -1)), []);
  const openModal = useCallback((m: CoracleModal) => setModals((prev) => [...prev, m]), []);

  const handleLogin = useCallback(() => {
    const user = mock.users[0];
    if (!user) return;
    setCurrentUser(user);
    setFollowing(new Set(mock.users.slice(0, 12).map((u) => u.pubkey)));
    setModals([]);
    setScreen('feeds');
    registerAction('login');
    registerAction('navigate_home');
  }, [mock.users, registerAction]);

  const navigateTo = useCallback(
    (next: CoracleScreen) => {
      setScreen(next);
      setSubmenu(null);
      setModals([]);
      if (next === 'feeds') registerAction('navigate_home');
      if (next === 'settings') registerAction('navigate_settings');
      if (next === 'relays') registerAction('navigate_relays');
    },
    [registerAction],
  );

  const viewProfile = useCallback(
    (user: MockUser) => {
      setProfileUser(user);
      openModal({ type: 'profile', user });
      registerAction('view_profile');
    },
    [openModal, registerAction],
  );

  const toggleIn = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  const onLike = useCallback((id: string) => {
    setLiked((prev) => toggleIn(prev, id));
  }, []);

  const onRepost = useCallback((id: string) => {
    setReposted((prev) => toggleIn(prev, id));
  }, []);

  const onZap = useCallback(
    (id: string) => {
      // The client's default zap amount is 21 sats (`state.ts:245`).
      setZapped((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 21 }));
      showToast('Zapped 21 sats.');
    },
    [showToast],
  );

  const onReply = useCallback(
    (note: MockNote) => {
      openModal({ type: 'compose', replyTo: note });
      registerAction('compose');
    },
    [openModal, registerAction],
  );

  const onCompose = useCallback(() => {
    if (!isAuthed) {
      openModal({ type: 'login' });
      return;
    }
    openModal({ type: 'compose', replyTo: null });
    registerAction('compose');
  }, [isAuthed, openModal, registerAction]);

  const onSend = useCallback(() => {
    closeModal();
    showToast('Your note has been published!');
    registerAction('post');
  }, [closeModal, registerAction, showToast]);

  const onExternal = useCallback(
    (what: string) => showToast(`${what} opens outside this simulation.`),
    [showToast],
  );

  // ---- Tour commands (interface is load-bearing — do not change the shape) --
  useEffect(() => {
    if (!tourCommand) return;

    // Every command is SELF-SUFFICIENT: it signs in on its own, so an FAQ step
    // carries exactly ONE command and the queue can never drop a second.
    // `logout` is the sole exception.
    // TRAP: handleLogin's state is not visible to this same effect pass, so
    // anything reasoning about "me" must use `me`, never the stale currentUser.
    const me = currentUser ?? mock.users[0] ?? null;
    if (tourCommand.type !== 'logout' && !isAuthed) handleLogin();

    switch (tourCommand.type) {
      case 'login':
        break;
      case 'showLogin':
        // Sign out AND open the login modal in one command — `logout` alone
        // lands on the logged-out feed, and nothing else pushes that modal.
        setCurrentUser(null);
        setProfileUser(null);
        setSubmenu(null);
        setScreen('feeds');
        setModals([{ type: 'login' }]);
        break;
      case 'logout':
        setCurrentUser(null);
        setModals([]);
        setSubmenu(null);
        setProfileUser(null);
        setScreen('feeds');
        break;
      case 'navigate': {
        const next = tourCommand.payload as CoracleScreen;
        setScreen(next);
        setModals([]);
        setSubmenu(null);
        break;
      }
      case 'compose':
      case 'post':
        setModals([{ type: 'compose', replyTo: null }]);
        setSubmenu(null);
        break;
      case 'openThread': {
        // Coracle opens a note in a MODAL, like almost everything else — with
        // the feed underneath rather than whatever screen was last shown.
        const note = mock.notes[0];
        if (note) {
          setSubmenu(null);
          setScreen('feeds');
          setModals([{ type: 'note', note }]);
        }
        break;
      }
      case 'zap': {
        // The action row lives on the feed card; land there and actually apply
        // a zap so the row shows a sat total rather than an empty slot.
        const note = mock.notes.find((n) => n.pubkey !== me?.pubkey) ?? mock.notes[0];
        setSubmenu(null);
        setModals([]);
        setScreen('feeds');
        if (note) setZapped((prev) => ({ ...prev, [note.id]: (prev[note.id] ?? 0) + 21 }));
        break;
      }
      case 'openSettings': {
        const pages: SettingsPage[] = ['app', 'content', 'data', 'keys', 'wallet'];
        const page = pages.includes(tourCommand.payload as SettingsPage)
          ? (tourCommand.payload as SettingsPage)
          : 'app';
        setSettingsPage(page);
        setScreen('settings');
        setModals([]);
        setSubmenu(null);
        break;
      }
      case 'viewProfile': {
        // Your OWN profile is a page in Coracle; someone else's opens as a
        // modal over the feed — the two routes are genuinely different and the
        // screen-map records the page route for self.
        const other = mock.users.find((u) => u.pubkey !== me?.pubkey);
        const target = tourCommand.payload === 'other' ? other ?? me : me;
        if (target) {
          setSubmenu(null);
          setProfileUser(target);
          if (tourCommand.payload === 'other') {
            setModals([{ type: 'profile', user: target }]);
          } else {
            setModals([]);
            setScreen('profile');
          }
        }
        break;
      }
    }

    onCommandHandled?.();
  }, [tourCommand, isAuthed, currentUser, mock.users, mock.notes, handleLogin, onCommandHandled]);

  // ---- Render ----
  const topModal = modals[modals.length - 1];

  const pageBody = (() => {
    switch (screen) {
      case 'feeds':
        return (
          <FeedsScreen
            notes={feedNotes}
            usersByPubkey={usersByPubkey}
            isAuthed={isAuthed}
            showReplies={showReplies}
            onToggleReplies={() => setShowReplies((v) => !v)}
            onCustomize={() => showToast('Feed customization is not part of this reproduction.')}
            activeFeed={activeFeed}
            onSelectFeed={setActiveFeed}
            onEdit={(what) => showToast(`Editing ${what} is not part of this reproduction.`)}
            railInline={!showRail}
            search={feedSearch}
            onSearch={setFeedSearch}
            onShowLogin={() => openModal({ type: 'login' })}
            liked={liked}
            reposted={reposted}
            zapped={zapped}
            following={following}
            onLike={onLike}
            onRepost={onRepost}
            onZap={onZap}
            onReply={onReply}
            onOpen={(note) => openModal({ type: 'note', note })}
            onViewProfile={viewProfile}
          />
        );
      case 'relays':
        return (
          <RelaysScreen
            relays={mock.relays}
            joined={joinedRelays}
            onJoin={(url) => {
              setJoinedRelays((prev) => new Set(prev).add(url));
              showToast('Relay joined.');
            }}
            onLeave={(url) => {
              setJoinedRelays((prev) => {
                const next = new Set(prev);
                next.delete(url);
                return next;
              });
              showToast('Relay left.');
            }}
            onExplore={(relay) => showToast(`${relay.url} — relay pages are outside this reproduction.`)}
          />
        );
      case 'notifications':
        return <NotificationsScreen />;
      case 'messages':
        return <MessagesScreen onCreate={() => openModal({ type: 'channel-create' })} />;
      case 'profile':
        return profileUser ? (
          <ProfileScreen
            user={profileUser}
            isSelf={profileUser.pubkey === currentUser?.pubkey}
            isFollowing={following.has(profileUser.pubkey)}
            notes={mock.notes}
            usersByPubkey={usersByPubkey}
            following={following}
            liked={liked}
            reposted={reposted}
            zapped={zapped}
            onFollow={() => setFollowing((prev) => toggleIn(prev, profileUser.pubkey))}
            onCopy={(what) => showToast(`${what} copied to clipboard!`)}
            onLike={onLike}
            onRepost={onRepost}
            onZap={onZap}
            onReply={onReply}
            onOpen={(note) => openModal({ type: 'note', note })}
            onViewProfile={viewProfile}
          />
        ) : null;
      case 'settings':
        return (
          <SettingsScreen
            page={settingsPage}
            currentUser={currentUser}
            onSave={() => showToast('Your settings have been saved!')}
            onCopy={(what) => showToast(`${what} copied to clipboard!`)}
          />
        );
      case 'invite':
        return <InviteScreen currentUser={currentUser} onSubmit={() => showToast('Invite link created.')} />;
      default:
        return null;
    }
  })();

  const modalBody = (() => {
    if (!topModal) return null;
    switch (topModal.type) {
      case 'login':
        return (
          <LoginScreen
            onLogin={handleLogin}
            onSignUp={() => {
              setSignupStage('intro');
              setModals([{ type: 'signup' }]);
            }}
            onRemoteSigner={() => openModal({ type: 'bunker' })}
            onExternal={onExternal}
          />
        );
      case 'bunker':
        return <RemoteSignerScreen onBack={closeModal} onContinue={handleLogin} />;
      case 'signup':
        return (
          <OnboardingScreen
            stage={signupStage}
            onStage={setSignupStage}
            onFinish={handleLogin}
            onExternal={onExternal}
          />
        );
      case 'compose':
        return (
          <ComposeScreen
            replyTo={topModal.replyTo}
            replyAuthor={topModal.replyTo ? usersByPubkey.get(topModal.replyTo.pubkey) : undefined}
            onSend={onSend}
          />
        );
      case 'note':
        return (
          <NoteDetailScreen
            note={topModal.note}
            author={usersByPubkey.get(topModal.note.pubkey)}
            users={mock.users}
            joined={joinedRelays}
            onViewProfile={viewProfile}
            onCopy={(what) => showToast(`${what} copied to clipboard!`)}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            user={topModal.user}
            isSelf={topModal.user.pubkey === currentUser?.pubkey}
            isFollowing={following.has(topModal.user.pubkey)}
            notes={mock.notes}
            usersByPubkey={usersByPubkey}
            following={following}
            liked={liked}
            reposted={reposted}
            zapped={zapped}
            onFollow={() => setFollowing((prev) => toggleIn(prev, topModal.user.pubkey))}
            onCopy={(what) => showToast(`${what} copied to clipboard!`)}
            onLike={onLike}
            onRepost={onRepost}
            onZap={onZap}
            onReply={onReply}
            onOpen={(note) => openModal({ type: 'note', note })}
            onViewProfile={viewProfile}
          />
        );
      case 'groups':
        return <GroupsScreen onExternal={onExternal} />;
      case 'lists':
        return <ListsScreen onCreate={() => showToast('List creation is not part of this reproduction.')} />;
      case 'invite':
        return <InviteScreen currentUser={currentUser} onSubmit={() => showToast('Invite link created.')} />;
      case 'channel-create':
        return <StartConversationScreen />;
      default:
        return null;
    }
  })();


  return (
    <div
      ref={attachRoot}
      className={`coracle-simulator ${parentTheme}`}
      data-theme={parentTheme}
    >
      <div className="co-layout">
        {/* ---------------- sidebar ---------------- */}
        <Sidebar
          screen={screen}
          modalOpen={!!topModal}
          isAuthed={isAuthed}
          currentUser={currentUser}
          submenu={submenu}
          onSubmenu={setSubmenu}
          onNavigate={navigateTo}
          onOpenModal={(type) => openModal({ type } as CoracleModal)}
          onOpenSettings={(page) => {
            setSettingsPage(page);
            navigateTo('settings');
          }}
          onViewOwnProfile={() => {
            if (currentUser) {
              setProfileUser(currentUser);
              navigateTo('profile');
            }
          }}
          onLogout={() => {
            setCurrentUser(null);
            setScreen('feeds');
            setFollowing(new Set());
          }}
          onToast={showToast}
        />

        {/* ---------------- page ---------------- */}
        <div className="co-page">
          <header className="co-topbar">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                className="co-input co-input-dark"
                style={{ width: '11rem', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                value={topSearch}
                onChange={(e) => setTopSearch(e.target.value)}
                aria-label="Search"
              />
              <button
                type="button"
                className="co-btn co-btn-low"
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                onClick={() =>
                  showToast(
                    topSearch.trim()
                      ? `No results found for "${topSearch.trim()}".`
                      : 'Type something to search.',
                  )
                }
              >
                Search
              </button>
            </div>
            <button
              type="button"
              className="co-btn co-btn-accent"
              data-tour="coracle-compose"
              onClick={isAuthed ? onCompose : () => openModal({ type: 'login' })}
            >
              {isAuthed ? 'Post +' : 'Log In'}
            </button>
          </header>

          <div className="co-scroll" style={{ flex: 1, minHeight: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="co-column">{pageBody}</div>
              {/* The rail exists on the FEED route only, as upstream's does. */}
              {showRail && screen === 'feeds' && (
                <div className="co-rail co-scroll">
                  <FeedSelector
                    active={activeFeed}
                    onSelect={setActiveFeed}
                    onEdit={(what) =>
                      showToast(`Editing ${what} is not part of this reproduction.`)
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- modals ---------------- */}
      {topModal && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 40 }}>
          {/* The scrim is inset past the sidebar so the sidebar stays lit and
              clickable — `ml-72` at >=1024px upstream (Modal.svelte:114). */}
          <button
            type="button"
            className="co-scrim"
            aria-label="Close"
            style={{ left: 'var(--co-sidebar-w)' }}
            onClick={closeModal}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              left: 'var(--co-sidebar-w)',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              pointerEvents: 'none',
            }}
            className="co-scroll"
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '0.75rem',
                pointerEvents: 'none',
              }}
            >
              <button
                type="button"
                className="co-modal-close"
                aria-label="Close"
                onClick={closeModal}
                style={{ pointerEvents: 'auto' }}
              >
                <Icon name="times" size={18} />
              </button>
            </div>
            {/* The panel is `h-full min-h-screen w-full bg-neutral-800`
                (Modal.svelte:154) — it spans the whole area right of the
                sidebar, and only the CONTENT inside it is capped at max-w-2xl
                (`:156`). Capping the panel itself left scrim showing down both
                sides, which the real client never does. */}
            <div
              style={{
                background: 'var(--co-neutral-800)',
                minHeight: 'calc(100% - 4rem)',
                pointerEvents: 'auto',
              }}
            >
              <div
                style={{
                  margin: '0 auto',
                  display: 'flex',
                  maxWidth: '42rem',
                  flexDirection: 'column',
                  gap: '1rem',
                  padding: '1rem 1rem 4rem',
                }}
              >
                {modalBody}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast — fixed top centre, `fly {y: -50}` (Toast.svelte:103). */}
      {toast && (
        <div
          style={{
            position: 'absolute',
            top: '0.5rem',
            left: 0,
            right: 0,
            zIndex: 60,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div className="co-toast co-fly" role="status">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoracleSimulator;
