import { useMemo, useState } from 'react';
import type { MockNote, MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { Icon, type IconName } from '../components/Icon';
import { formatShort, noteTime, seededUnit, shortNpub } from '../snortUtils';

/**
 * Snort — Notifications (`/notifications`).
 *
 * Rebuilt from `docs/refs/snort/screen-map.md` §9, which is the authority for
 * every decision below. The four things a reproducer habitually gets wrong:
 *
 *  1. The filters are NOT a tab row. They are four INDEPENDENT icon toggles
 *     (a bitmask upstream: reactions 1 · reposts 2 · mentions 4 · zaps 8), all
 *     enabled on mount, right-aligned in a `flex justify-between items-center
 *     mx-1` bar whose left child is an empty div (§9.1). Turning one off just
 *     removes that kind from the list — there is no "active tab".
 *  2. Each toggle is `button-icon-sm` — an 8px-radius square with a faint
 *     white 10% fill when on, NOT a pill (`.snort-btn-sm.active`).
 *  3. The row is a fixed 64px icon gutter + body, separated by `border-b`
 *     only — no card, no radius, no background (§9.2).
 *  4. The deliberate asymmetry (§9.3): the mention FILTER is `at-sign` tinted
 *     violet, but the mention GROUP icon is `reverse-left` and is NOT tinted —
 *     upstream colours group icons by passing the icon name as the className,
 *     and `svg.reverse-left` has no CSS rule, so it inherits the body colour.
 *     The mention group also has NO bold action line; its AvatarGroup sets
 *     `showUsername`, so the name sits beside the avatar instead (§9.4).
 *
 * Groups are derived deterministically from the notes/users props — no
 * Math.random, no Date.now for content — so the screen renders identically on
 * every mount and in the frozen-animation preview environment.
 */

type NotificationKind = 'reaction' | 'zap' | 'repost' | 'mention';

export interface NotificationsScreenProps {
  currentUser: MockUser | null;
  notes: MockNote[];
  users: MockUser[];
}

/**
 * §9.3 — icon + colour per group kind. `mention` deliberately has no colour:
 * it inherits the body colour, black in light mode and white in dark.
 * The verb is the action-line stem (§9.4); the mention group has none.
 */
const KIND_META: Record<NotificationKind, { icon: IconName; color?: string; verb: string }> = {
  reaction: { icon: 'heart-solid', color: 'var(--snort-heart)', verb: 'liked' },
  zap: { icon: 'zap-solid', color: 'var(--snort-zap)', verb: 'zapped' },
  repost: { icon: 'repeat', color: 'var(--snort-repost)', verb: 'reposted' },
  mention: { icon: 'reverse-left', verb: '' },
};

/** §9.1 — the toggle row, in upstream's render order (NOT the bitmask order). */
const FILTERS: { kind: NotificationKind; icon: IconName; color: string; label: string }[] = [
  { kind: 'reaction', icon: 'heart-solid', color: 'var(--snort-heart)', label: 'Reactions' },
  { kind: 'zap', icon: 'zap-solid', color: 'var(--snort-zap)', label: 'Zaps' },
  { kind: 'repost', icon: 'repeat', color: 'var(--snort-repost)', label: 'Reposts' },
  { kind: 'mention', icon: 'at-sign', color: 'var(--snort-mention)', label: 'Mentions' },
];

/**
 * Upstream buckets events by `${timeKey}:${contextLink}:${kind}` with timeKey
 * floored to a 6-hour interval (§9.2). We mirror the key shape; because each
 * target note here yields exactly one kind, the buckets come out 1:1 with the
 * notes, which is what the real grouping produces on a quiet feed anyway.
 */
const SIX_HOURS = 6 * 60 * 60;

/**
 * Kind per position. A reaction-heavy mix, like a real notification feed, and
 * fixed rather than seeded so all four toggles always have something to hide.
 */
const KIND_CYCLE: NotificationKind[] = [
  'reaction',
  'zap',
  'mention',
  'reaction',
  'repost',
  'zap',
  'reaction',
  'mention',
  'repost',
  'reaction',
  'zap',
  'reaction',
  'repost',
  'mention',
];

/** Up to 12 avatars are rendered; the count lives in the action line (§9.2). */
const AVATAR_LIMIT = 12;

/** `<Text truncate={160} … className="text-neutral-400" />` (§9.5). */
const CONTEXT_TRUNCATE = 160;

interface Participant {
  key: string;
  name: string;
  seed: string;
}

interface NotificationGroup {
  id: string;
  kind: NotificationKind;
  participants: Participant[];
  /** Summed sats for a zap group — the gutter number, not a zap count. */
  sats: number;
  context: string;
  time: string;
}

function truncate(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > CONTEXT_TRUNCATE ? `${flat.slice(0, CONTEXT_TRUNCATE)}…` : flat;
}

/**
 * §9.4 — `n = pubkeys.length - 1`:
 *   "{name} liked" · "{name} & {n} others liked", likewise reposted / zapped.
 * TextNote (mention) returns the empty string and the row renders no line.
 */
function actionLine(kind: NotificationKind, participants: Participant[]): string {
  const { verb } = KIND_META[kind];
  if (!verb || participants.length === 0) return '';
  const others = participants.length - 1;
  const first = participants[0].name;
  return others === 0 ? `${first} ${verb}` : `${first} & ${others} others ${verb}`;
}

export function NotificationsScreen({ currentUser, notes, users }: NotificationsScreenProps) {
  // All four start ON (§9.1: "All 255", every bit set).
  const [enabled, setEnabled] = useState<Record<NotificationKind, boolean>>({
    reaction: true,
    zap: true,
    repost: true,
    mention: true,
  });

  const groups = useMemo<NotificationGroup[]>(() => {
    const pool = users.filter((u) => u.pubkey !== currentUser?.pubkey);
    if (pool.length === 0 || notes.length === 0) return [];

    // Feed sorted desc, sliced to the page limit (§9.2).
    const targets = [...notes].sort((a, b) => b.created_at - a.created_at).slice(0, KIND_CYCLE.length);

    return targets.map((note, index) => {
      const kind = KIND_CYCLE[index % KIND_CYCLE.length];

      // A mention is one person mentioning you; the others aggregate.
      const max = Math.min(pool.length, AVATAR_LIMIT + 2);
      const count = kind === 'mention' ? 1 : 1 + Math.floor(seededUnit(`${note.id}:count`) * max);

      // Rotate the pool rather than sampling, so participants are unique.
      const start = Math.floor(seededUnit(`${note.id}:start`) * pool.length) % pool.length;
      const picked = Array.from({ length: count }, (_, k) => pool[(start + k) % pool.length]);

      const participants: Participant[] = picked.map((u) => {
        // §9.4 — "Anonymous zappers render as the literal 'Anon'."
        const anon = kind === 'zap' && seededUnit(`${note.id}:anon:${u.pubkey}`) < 0.12;
        return {
          key: u.pubkey,
          name: anon ? 'Anon' : u.displayName || shortNpub(u.pubkey),
          seed: anon ? `anon:${note.id}:${u.pubkey}` : u.username,
        };
      });

      const sats =
        kind === 'zap'
          ? picked.reduce(
              (sum, u) => sum + 21 + Math.round(seededUnit(`${note.id}:sats:${u.pubkey}`) * 2100),
              0,
            )
          : 0;

      const bucket = Math.floor(note.created_at / SIX_HOURS) * SIX_HOURS;

      return {
        id: `${bucket}:${note.id}:${kind}`,
        kind,
        participants,
        sats,
        context: truncate(note.content),
        // Computed once here, exactly as upstream's NoteTime computes once in
        // useState and never re-ticks while mounted.
        time: noteTime(note.created_at),
      };
    });
  }, [notes, users, currentUser]);

  const visible = groups.filter((g) => enabled[g.kind]);

  return (
    <div className="flex flex-col pb-8">
      {/* ---- §9.1 Four independent icon toggles, right-aligned ---- */}
      <div className="px-2 pt-2">
        <div className="flex justify-between items-center mx-1">
          <div />
          <div className="flex items-center gap-2">
            {FILTERS.map((f) => {
              const on = enabled[f.kind];
              return (
                <button
                  key={f.kind}
                  type="button"
                  className={`snort-btn-sm ${on ? 'active' : ''}`}
                  style={on ? { color: f.color } : undefined}
                  aria-pressed={on}
                  aria-label={f.label}
                  title={f.label}
                  onClick={() => setEnabled((prev) => ({ ...prev, [f.kind]: !prev[f.kind] }))}
                >
                  <Icon name={f.icon} size={20} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---- §9.2 Grouped rows: 64px icon gutter + body, border-b only ---- */}
      <div className="px-3">
        {visible.map((g) => {
          const meta = KIND_META[g.kind];
          const line = actionLine(g.kind, g.participants);
          const shown = g.participants.slice(0, AVATAR_LIMIT);
          // TextNote groups set showUsername on the AvatarGroup instead of
          // rendering a bold action line (§9.4).
          const showUsername = g.kind === 'mention';

          return (
            <div
              key={g.id}
              className="flex gap-2 py-4 pr-4 w-full overflow-hidden"
              style={{ borderBottom: '1px solid var(--snort-border)' }}
            >
              <div className="w-[64px] min-w-[64px] flex flex-col items-center gap-2">
                <span style={meta.color ? { color: meta.color } : undefined}>
                  <Icon name={meta.icon} size={24} />
                </span>
                {g.kind === 'zap' && g.sats > 0 && (
                  <div className="text-sm font-medium">{formatShort(g.sats)}</div>
                )}
              </div>

              <div className="flex flex-col gap-2 overflow-hidden break-all w-full">
                <div className="flex flex-row justify-between items-center">
                  <div className="flex items-center min-w-0">
                    {shown.map((p, i) => (
                      <Avatar
                        key={p.key}
                        seed={p.seed}
                        className={`h-10 w-10 ${i > 0 ? '-ml-2' : ''}`}
                      />
                    ))}
                    {showUsername && shown.length > 0 && (
                      <span className="ml-2 truncate font-medium">{shown[0].name}</span>
                    )}
                  </div>
                  <div className="shrink-0 pl-2 text-sm text-neutral-500">{g.time}</div>
                </div>

                {line !== '' && <div className="font-bold">{line}</div>}

                {g.context !== '' && (
                  <div className="text-sm" style={{ color: 'var(--snort-text-secondary)' }}>
                    {g.context}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div className="py-10 text-center text-sm" style={{ color: 'var(--snort-text-secondary)' }}>
            No notifications
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsScreen;
