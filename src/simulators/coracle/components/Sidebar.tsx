/**
 * Coracle's left sidebar.
 *
 * Lifted verbatim out of `CoracleSimulator` — same markup, same classes, same
 * order — so that /compare's navigation strip can mount the real thing instead
 * of a lookalike. Nothing about how it renders changed; what changed is that
 * the simulator's screen/auth/modal state now arrives as props rather than
 * being closed over. The submenu stays CONTROLLED rather than moving in here:
 * the simulator closes it from eight places (every navigation, and most tour
 * commands), so owning it locally would have needed an imperative escape hatch
 * to reproduce behaviour a prop already gives for free.
 *
 * The fidelity notes that lived beside this markup travel with it:
 *
 *  - The sidebar is warm (`tinted-700`) over a cold page (`neutral-800`), and
 *    it owns its bottom: the three-counter publish HUD sits over a hairline
 *    above the account row.
 *  - The wordmark is NOT upstream's artwork. The real one is an <img> of Jon
 *    Staab's mark, and we do not ship upstream artwork, so the word is set in the
 *    display face beside a neutral glyph — the same call made for Snort's
 *    nostrich.
 *  - The unread dot is anchored to the LABEL, not the full-width row: upstream's
 *    `-right-2.5` is relative to the text (`MenuDesktop:107`). Anchoring it to
 *    the button put it out in the page.
 *  - The submenu is `absolute` at `bottom: 4.5rem` (`MenuDesktopSecondary.svelte:14`)
 *    — it OVERLAYS the footer rather than pushing it. Letting it push clipped
 *    the account row out of the card.
 */
import type { MockUser } from '../../../data/mock';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import type { SettingsPage } from '../screens/SettingsScreens';
import type { CoracleModal, CoracleScreen } from '../CoracleSimulator';

/** The six destinations, in upstream's order. */
export const CORACLE_NAV: {
  screen: CoracleScreen;
  label: string;
  modal?: CoracleModal['type'];
}[] = [
  { screen: 'feeds', label: 'Feeds' },
  { screen: 'relays', label: 'Relays' },
  { screen: 'notifications', label: 'Notifications' },
  { screen: 'messages', label: 'Messages' },
  { screen: 'groups', label: 'Groups', modal: 'groups' },
  { screen: 'lists', label: 'Lists', modal: 'lists' },
];

export interface SidebarProps {
  screen: CoracleScreen;
  /** A modal is up — no nav item reads as active while one is. */
  modalOpen: boolean;
  isAuthed: boolean;
  currentUser: MockUser | null;
  /** Which footer submenu is open. Controlled — the simulator closes it on every navigation. */
  submenu: 'settings' | 'account' | null;
  onSubmenu: (next: 'settings' | 'account' | null) => void;
  onNavigate: (screen: CoracleScreen) => void;
  onOpenModal: (type: CoracleModal['type']) => void;
  onOpenSettings: (page: SettingsPage) => void;
  onViewOwnProfile: () => void;
  onLogout: () => void;
  onToast: (message: string) => void;
}

export function Sidebar({
  screen,
  modalOpen,
  isAuthed,
  currentUser,
  submenu,
  onSubmenu,
  onNavigate,
  onOpenModal,
  onOpenSettings,
  onViewOwnProfile,
  onLogout,
  onToast,
}: SidebarProps) {
  const navItem = (item: (typeof CORACLE_NAV)[number]) => {
    const active = screen === item.screen && !modalOpen;
    const disabled = !isAuthed && item.screen !== 'feeds';
    return (
      <button
        key={item.screen}
        type="button"
        className={`co-nav-item co-staatliches ${active ? 'is-active' : ''}`}
        style={disabled ? { opacity: 0.5, cursor: 'default' } : undefined}
        data-tour={`coracle-nav-${item.screen}`}
        onClick={() => {
          if (disabled) {
            onOpenModal('login');
            return;
          }
          if (item.modal) {
            onSubmenu(null);
            onOpenModal(item.modal);
          } else {
            onNavigate(item.screen);
          }
        }}
      >
        <span style={{ position: 'relative', display: 'inline-block' }}>
          {item.label}
          {item.screen === 'notifications' && isAuthed && <span className="co-nav-dot" />}
        </span>
        {active && <span className="co-nav-underline" />}
      </button>
    );
  };

  return (
    <aside className="co-sidebar">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '1rem 1.5rem',
        }}
      >
        <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
          <g fill="none" stroke="var(--co-accent)" strokeWidth="5" strokeLinecap="round">
            <path d="M38 14A17 17 0 1 0 40 30" />
            <path d="M31 20a9 9 0 1 0 1 9" />
          </g>
        </svg>
        <span className="co-staatliches" style={{ fontSize: '1.75rem', letterSpacing: '0.06em' }}>
          Coracle
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', paddingTop: '0.5rem' }}>
        {CORACLE_NAV.map(navItem)}
      </nav>

      <div style={{ marginTop: 'auto', position: 'relative' }}>
        {submenu && (
          <div
            style={{
              position: 'absolute',
              bottom: '4.5rem',
              left: 0,
              right: 0,
              zIndex: 10,
              overflow: 'hidden',
              borderTopLeftRadius: '0.75rem',
              borderTopRightRadius: '0.75rem',
              background: 'var(--co-neutral-800)',
            }}
          >
            {(submenu === 'settings'
              ? ([
                  ['palette', 'Toggle Theme'],
                  ['database', 'Database'],
                  ['wallet', 'Wallet'],
                  ['cog', 'App Settings'],
                  ['volume-xmark', 'Content Settings'],
                ] as const)
              : ([
                  ['user-circle', 'Profile'],
                  ['key', 'Keys'],
                  ['paper-plane', 'Create Invite'],
                  ['right-left', 'Switch Account'],
                  ['right-to-bracket', 'Log Out'],
                ] as const)
            ).map(([icon, label]) => (
              <button
                key={label}
                type="button"
                className="co-staatliches"
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem 0.75rem 0.75rem 2rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: '1.0625rem',
                }}
                onClick={() => {
                  onSubmenu(null);
                  if (label === 'Toggle Theme') {
                    onToast('Use the theme switch in the Sandstr header.');
                  } else if (label === 'Database') {
                    onOpenSettings('data');
                  } else if (label === 'Wallet') {
                    onOpenSettings('wallet');
                  } else if (label === 'App Settings') {
                    onOpenSettings('app');
                  } else if (label === 'Content Settings') {
                    onOpenSettings('content');
                  } else if (label === 'Keys') {
                    onOpenSettings('keys');
                  } else if (label === 'Profile') {
                    // Your own profile is the PAGE route (`/people/:entity`), not
                    // a modal — recording frame p_186 shows it with no scrim and
                    // no nav item active. Avatars in the feed do open the modal
                    // (p_087's siblings), which is why `viewProfile` is not
                    // reused here.
                    onViewOwnProfile();
                  } else if (label === 'Create Invite') {
                    onNavigate('invite');
                  } else if (label === 'Log Out') {
                    onLogout();
                  } else {
                    onToast('Multiple accounts are outside this reproduction.');
                  }
                }}
              >
                <Icon name={icon} size={15} />
                {label}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className="co-staatliches"
          style={{
            display: 'block',
            width: '100%',
            padding: '0.5rem 2rem',
            textAlign: 'left',
            background: 'transparent',
            border: 'none',
            color: 'var(--co-tinted-400)',
            cursor: 'pointer',
            fontSize: '1.0625rem',
          }}
          onClick={() => onSubmenu(submenu === 'settings' ? null : 'settings')}
        >
          Settings
        </button>
        <div
          className="co-staatliches"
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0 2rem 0.75rem',
            color: 'var(--co-tinted-500)',
            fontSize: '0.9375rem',
          }}
        >
          <span>About</span>
          <span>/</span>
          <span>Terms</span>
          <span>/</span>
          <span>Privacy</span>
        </div>

        {/* Publish HUD — hourglass / cloud-up / warning. The warning goes accent
            when non-zero, zeros are tinted-500. */}
        <button
          type="button"
          className="co-hud"
          onClick={() => onToast('The publish queue is outside this reproduction.')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--co-tinted-500)' }}>
            <Icon name="hourglass" size={14} /> 0
          </span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: isAuthed ? 'inherit' : 'var(--co-tinted-500)',
            }}
          >
            <Icon name="cloud-arrow-up" size={14} /> {isAuthed ? 7 : 0}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--co-tinted-500)' }}>
            <Icon name="triangle-exclamation" size={14} /> 0
          </span>
        </button>

        {isAuthed && currentUser ? (
          <button
            type="button"
            className="co-account-row"
            onClick={() => onSubmenu(submenu === 'account' ? null : 'account')}
          >
            <Avatar seed={currentUser.pubkey} size={40} />
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              @{currentUser.username}
            </span>
          </button>
        ) : (
          <div style={{ padding: '1rem 1.5rem' }}>
            <button
              type="button"
              className="co-btn co-btn-accent"
              style={{ width: '100%' }}
              onClick={() => onOpenModal('login')}
            >
              Log In
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
