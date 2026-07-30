import type { MockUser } from '../../../data/mock';
import { Icon, type IconName } from '../components/Icon';

/**
 * Snort — Settings index (`/settings`).
 *
 * Rebuilt from `docs/refs/snort/screen-map.md` §14, which is the authority for
 * every decision below. Upstream is
 * `Pages/settings/Menu/SettingsMenuComponent.tsx:7-36` — a plain iOS-Settings-like
 * list, NOT a tabbed preferences panel:
 *
 *  - Group heading: `p-2 font-bold uppercase text-neutral-400 text-xs tracking-wide`
 *    (`.snort-settings-group-title`).
 *  - Row: `px-2.5 py-1.5 flex justify-between items-center border` with
 *    `rounded-t-xl` on the first, `rounded-b-xl` on the last and `border-t-0` on
 *    the rest, so each group reads as ONE collapsed-border stack
 *    (`.snort-settings-row`, which owns all four of those rules via
 *    `:first-child` / `:not(:first-child)` / `:last-child` — hence each group's
 *    rows live in their own wrapper with the heading OUTSIDE it).
 *  - Row content: a `p-1 rounded-lg` colored tile (`.snort-settings-tile`)
 *    holding an 18px white glyph, a `text-base font-semibold` label, and a 12px
 *    `arrowFront` chevron in `text-neutral-400` hard right.
 *
 * Two things a reproducer habitually gets wrong:
 *
 *  1. **The Relays tile is blank.** See RELAYS_TILE_BG below — it is a real
 *     upstream bug and §14 says to reproduce it, not fix it.
 *  2. **Four menu items do not exist.** `Accounts`, `Invite`, `Subscription` and
 *     `Zap Pool` are feature-gated off in Snort's own `config/default.json`
 *     (`subscriptions: false`, `communityLeaders: false`, …) and are absent from
 *     the recording. They are deliberately not listed here.
 *
 * The rows are static: only Relays is wired (to `onOpenRelays`), matching the
 * one sub-page this simulator actually ships. `currentUser` is accepted because
 * the shell passes it, but the real settings index renders no profile header —
 * it is nothing but these groups — so it is intentionally not drawn.
 */

export interface SettingsScreenProps {
  currentUser: MockUser | null;
  onOpenRelays: () => void;
}

/**
 * ⚠ §14 — the Relays row renders with NO colored tile.
 *
 * Upstream writes `bg-dark bg-opacity-20`: `bg-dark` is not a defined color in
 * their Tailwind config, and `bg-opacity-*` was removed in Tailwind v4, so BOTH
 * classes are no-ops and that one tile ends up transparent while every other row
 * in the list has a colour. Independently confirmed in the owner's recording of
 * the Settings index. Reproduce the gap; do not "fix" it.
 */
const RELAYS_TILE_BG: string | null = null;

interface SettingsItem {
  id: string;
  label: string;
  icon: IconName;
  /** Tailwind-500 hex of upstream's `iconBg` class; `null` = the Relays bug. */
  bg: string | null;
}

interface SettingsGroup {
  title: string;
  items: SettingsItem[];
}

/**
 * §14, in upstream's exact order. `bg` values are the Tailwind-500 hexes behind
 * each `iconBg` class name (the class names are authoritative — the hexes
 * sampled from the recording are P3-shifted but match in hue and ordering).
 */
const GROUPS: SettingsGroup[] = [
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'Profile', icon: 'profile', bg: '#22c55e' }, // bg-green-500
      { id: 'keys', label: 'Export Keys', icon: 'key', bg: '#f59e0b' }, // bg-amber-500
      { id: 'nostr-address', label: 'Nostr Address', icon: 'badge', bg: '#ec4899' }, // bg-pink-500
      { id: 'preferences', label: 'Preferences', icon: 'gear', bg: '#64748b' }, // bg-slate-500
      { id: 'wallet', label: 'Wallet', icon: 'wallet', bg: '#10b981' }, // bg-emerald-500
      { id: 'tools', label: 'Tools', icon: 'tool', bg: '#1e293b' }, // bg-slate-800
    ],
  },
  {
    title: 'Interaction',
    items: [
      { id: 'relays', label: 'Relays', icon: 'relay', bg: RELAYS_TILE_BG },
      { id: 'moderation', label: 'Moderation', icon: 'shield-tick', bg: '#eab308' }, // bg-yellow-500
      { id: 'notifications', label: 'Notifications', icon: 'bell-outline', bg: '#ef4444' }, // bg-red-500
      { id: 'cache', label: 'Cache', icon: 'hard-drive', bg: '#06b6d4' }, // bg-cyan-500
      { id: 'media', label: 'Media', icon: 'camera-plus', bg: '#84cc16' }, // bg-lime-500
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'donate', label: 'Donate', icon: 'heart', bg: '#a855f7' }, // bg-purple-500 → /about
    ],
  },
  {
    // One-item group: upstream's group title and its single row carry the same
    // message, so the heading reads LOG OUT above a "Log Out" row.
    title: 'Log Out',
    items: [{ id: 'logout', label: 'Log Out', icon: 'logout', bg: '#ef4444' }], // bg-red-500
  },
];

export function SettingsScreen({ currentUser, onOpenRelays }: SettingsScreenProps) {
  void currentUser;

  return (
    <div className="snort-settings flex flex-col gap-2 px-3 py-2" data-tour="snort-settings">
      {GROUPS.map((group) => (
        <section key={group.title}>
          <div className="snort-settings-group-title">{group.title}</div>

          {/* The rows are the only children here so .snort-settings-row's
              :first-child / :last-child rules build the collapsed stack. */}
          <div>
            {group.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="snort-settings-row"
                onClick={item.id === 'relays' ? onOpenRelays : undefined}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="snort-settings-tile"
                    style={item.bg ? { backgroundColor: item.bg } : undefined}
                  >
                    <Icon name={item.icon} size={18} />
                  </div>
                  <span className="flex-grow text-base font-semibold">{item.label}</span>
                </div>
                <Icon name="arrowFront" size={12} className="text-neutral-400" />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default SettingsScreen;
