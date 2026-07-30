import React, { useMemo, useState } from 'react';
import {
  AtSign,
  Bitcoin,
  Heart,
  Mail,
  MessageSquare,
  MessagesSquare,
  Repeat2,
  Send,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Vote,
} from 'lucide-react';
import { mockNotes, mockUsers } from '../../../data/mock';
import type { MockNote, MockUser } from '../../../data/mock';
import type { NotificationsScreenProps } from '../types';
import { QUICK_EMOJIS, formatShort, hashSeed } from '../wispData';
import { WispAvatar } from '../components/Avatar';
import { PostCard } from '../components/PostCard';

/**
 * Wisp Notifications (screen-map §9): "Notifications  |  24h" top bar with
 * filter + sound-toggle actions, a 24h summary bar (surfaceVariant, six
 * tap-to-isolate stats) as the first list item, then FLAT "zen" rows —
 * 28dp type-icon slot → 32dp avatar → "{name} {action}" → timestamp. Tap
 * expands the referenced note inline (quoted PostCard; replies add an
 * inline "Reply…" composer pill). Filter bottom sheet with 7 switches +
 * "Chat rooms" + Enable/Disable all.
 */

type NotifType = 'zap' | 'reaction' | 'repost' | 'reply' | 'mention' | 'dm';

interface NotifRow {
  id: string;
  type: NotifType;
  actor: MockUser;
  note: MockNote;
  sats?: number;
  emoji?: string;
  time: string;
}

const TYPE_CYCLE: NotifType[] = ['zap', 'reaction', 'repost', 'reply', 'mention', 'dm'];

const ACTION_TEXT: Record<NotifType, string> = {
  zap: 'zapped',
  reaction: 'reacted',
  repost: 'reposted',
  reply: 'replied',
  mention: 'mentioned you',
  dm: 'messaged you',
};

type FilterKey =
  | 'replies'
  | 'reactions'
  | 'zaps'
  | 'reposts'
  | 'mentions'
  | 'votes'
  | 'dms'
  | 'chatRooms';

const FILTER_OF: Record<NotifType, FilterKey> = {
  reply: 'replies',
  reaction: 'reactions',
  zap: 'zaps',
  repost: 'reposts',
  mention: 'mentions',
  dm: 'dms',
};

const ALL_ON: Record<FilterKey, boolean> = {
  replies: true,
  reactions: true,
  zaps: true,
  reposts: true,
  mentions: true,
  votes: true,
  dms: true,
  chatRooms: true,
};

const ALL_OFF: Record<FilterKey, boolean> = {
  replies: false,
  reactions: false,
  zaps: false,
  reposts: false,
  mentions: false,
  votes: false,
  dms: false,
  chatRooms: false,
};

interface SummaryStat {
  key: NotifType;
  Icon: typeof MessageSquare;
  label: string;
}

const SUMMARY_STATS: SummaryStat[] = [
  { key: 'reply', Icon: MessageSquare, label: '7' },
  { key: 'reaction', Icon: Heart, label: '21' },
  { key: 'zap', Icon: Bitcoin, label: formatShort(3200) },
  { key: 'repost', Icon: Repeat2, label: '4' },
  { key: 'mention', Icon: AtSign, label: '2' },
  { key: 'dm', Icon: Mail, label: '1' },
];

interface SwitchRowDef {
  key: FilterKey;
  label: string;
  Icon: typeof MessageSquare;
}

const SWITCH_ROWS: SwitchRowDef[] = [
  { key: 'replies', label: 'Replies', Icon: MessageSquare },
  { key: 'reactions', label: 'Reactions', Icon: Heart },
  { key: 'zaps', label: 'Zaps', Icon: Bitcoin },
  { key: 'reposts', label: 'Reposts', Icon: Repeat2 },
  { key: 'mentions', label: 'Mentions', Icon: AtSign },
  { key: 'votes', label: 'Votes', Icon: Vote },
  { key: 'dms', label: 'DMs', Icon: Mail },
];

/** 40×22 M3-style switch: accent track + white thumb (on) / variant + gray (off). */
function ToggleSwitch({ on }: { on: boolean }) {
  return (
    <div
      className="relative h-[22px] w-10 shrink-0 rounded-full"
      style={{ background: on ? 'var(--wisp-accent)' : 'var(--wisp-surface-variant)' }}
    >
      <div
        className={`absolute top-[3px] h-4 w-4 rounded-full ${on ? 'right-[3px]' : 'left-[3px]'}`}
        style={{ background: on ? '#FFFFFF' : 'var(--wisp-on-surface-variant)' }}
      />
    </div>
  );
}

function TypeIconSlot({ row }: { row: NotifRow }) {
  switch (row.type) {
    case 'zap':
      return (
        <div className="flex flex-col items-center leading-none">
          <Bitcoin size={24} strokeWidth={1.8} style={{ color: 'var(--wisp-accent)' }} />
          <span className="text-[10px] leading-tight" style={{ color: 'var(--wisp-accent)' }}>
            {formatShort(row.sats ?? 0)}
          </span>
        </div>
      );
    case 'reaction':
      return <span className="text-[22px] leading-none">{row.emoji}</span>;
    case 'repost':
      return <Repeat2 size={28} strokeWidth={1.8} style={{ color: 'var(--wisp-repost)' }} />;
    case 'reply':
      return <MessageSquare size={28} strokeWidth={1.8} style={{ color: 'var(--wisp-accent)' }} />;
    case 'mention':
      return <AtSign size={28} strokeWidth={1.8} style={{ color: 'var(--wisp-accent)' }} />;
    case 'dm':
      return <Mail size={28} strokeWidth={1.8} style={{ color: 'var(--wisp-accent)' }} />;
  }
}

export function NotificationsScreen({
  currentUser,
  onOpenThread,
  onOpenProfile,
  onZap,
  onReply,
}: NotificationsScreenProps) {
  const [soundOn, setSoundOn] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isolated, setIsolated] = useState<NotifType | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>(ALL_ON);

  const rows = useMemo<NotifRow[]>(() => {
    const out: NotifRow[] = [];
    for (let i = 0; i < 12; i++) {
      const type = TYPE_CYCLE[i % TYPE_CYCLE.length];
      const h = hashSeed(`wisp-notif-${i}`);
      let actor = mockUsers[h % mockUsers.length];
      if (actor.pubkey === currentUser.pubkey) {
        actor = mockUsers[(h + 1) % mockUsers.length];
      }
      const note = mockNotes[hashSeed(`wisp-notif-note-${i}`) % mockNotes.length];
      const minutes = 2 + (h % 7) + i * i * 9;
      const time = minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h`;
      out.push({
        id: `notif-${i}`,
        type,
        actor,
        note,
        sats: type === 'zap' ? 21 + (h % 4979) : undefined,
        emoji:
          type === 'reaction'
            ? QUICK_EMOJIS[Math.floor(i / TYPE_CYCLE.length) % QUICK_EMOJIS.length]
            : undefined,
        time,
      });
    }
    return out;
  }, [currentUser.pubkey]);

  const visibleRows = rows.filter(
    (r) => filters[FILTER_OF[r.type]] && (isolated === null || isolated === r.type),
  );

  const filtersActive = SWITCH_ROWS.some((s) => !filters[s.key]) || !filters.chatRooms;

  /** Zap/reaction/repost target your note; replies/mentions/DMs show the actor's note. */
  const quotedAuthor = (r: NotifRow): MockUser =>
    r.type === 'reply' || r.type === 'mention' || r.type === 'dm' ? r.actor : currentUser;

  const toggleFilter = (key: FilterKey) =>
    setFilters((f) => ({ ...f, [key]: !f[key] }));

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {/* Top bar */}
      <div className="flex h-12 shrink-0 items-center px-4">
        <div className="flex min-w-0 flex-1 items-baseline">
          <span className="truncate text-base font-semibold">Notifications</span>
          <span className="shrink-0 whitespace-pre text-sm font-medium text-[var(--wisp-on-surface-variant)] opacity-50">
            {'  |  24h'}
          </span>
        </div>
        <button
          type="button"
          aria-label="Notification filters"
          className="p-1.5"
          style={{
            color: filtersActive ? 'var(--wisp-accent)' : 'var(--wisp-on-surface-variant)',
          }}
          onClick={() => setSheetOpen(true)}
        >
          <SlidersHorizontal size={22} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          aria-label="Notification sounds"
          className="p-1.5 text-[var(--wisp-on-surface-variant)]"
          onClick={() => setSoundOn((s) => !s)}
        >
          {soundOn ? (
            <Volume2 size={22} strokeWidth={1.8} />
          ) : (
            <VolumeX size={22} strokeWidth={1.8} />
          )}
        </button>
      </div>

      {/* List (summary bar is the first list item) */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <div className="flex justify-evenly bg-[var(--wisp-surface-variant)] px-4 py-3">
          {SUMMARY_STATS.map(({ key, Icon, label }) => {
            const active = isolated === key;
            return (
              <button
                key={key}
                type="button"
                aria-label={`Show only ${ACTION_TEXT[key]} notifications`}
                className="flex items-center gap-1 rounded-lg px-1.5 py-1"
                style={{
                  color: active ? 'var(--wisp-accent)' : 'var(--wisp-on-surface-variant)',
                  background: active ? 'rgba(255,152,0,0.12)' : 'transparent',
                }}
                onClick={() => setIsolated((cur) => (cur === key ? null : key))}
              >
                <Icon size={22} strokeWidth={1.8} />
                <span className="text-base">{label}</span>
              </button>
            );
          })}
        </div>

        {visibleRows.length === 0 && (
          <div className="flex flex-col items-center py-16 text-sm text-[var(--wisp-on-surface-variant)]">
            No notifications yet
          </div>
        )}

        {visibleRows.map((r) => (
          <div key={r.id}>
            <div
              role="button"
              tabIndex={0}
              className="flex cursor-pointer items-center gap-2 px-4 py-2.5"
              onClick={() => setExpandedId((cur) => (cur === r.id ? null : r.id))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setExpandedId((cur) => (cur === r.id ? null : r.id));
                }
              }}
            >
              <div className="flex w-7 shrink-0 items-center justify-center">
                <TypeIconSlot row={r} />
              </div>
              <button
                type="button"
                aria-label={`Open ${r.actor.displayName}'s profile`}
                className="shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenProfile(r.actor);
                }}
              >
                <WispAvatar seed={r.actor.username} className="w-8 h-8" />
              </button>
              <div className="flex min-w-0 flex-1 items-baseline gap-1">
                <span className="truncate text-base font-semibold">{r.actor.displayName}</span>
                <span className="shrink-0 text-sm text-[var(--wisp-on-surface-variant)]">
                  {ACTION_TEXT[r.type]}
                </span>
              </div>
              <span className="shrink-0 text-xs font-medium text-[var(--wisp-on-surface-variant)]">
                {r.time}
              </span>
            </div>

            {expandedId === r.id && (
              <div className="px-4 pb-2 pl-10">
                <div
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer"
                  onClick={() => onOpenThread(r.note)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onOpenThread(r.note);
                  }}
                >
                  <PostCard note={r.note} author={quotedAuthor(r)} quoted />
                </div>
                {r.type === 'reply' && (
                  <div className="mt-2 flex items-center gap-2 rounded-[20px] bg-[var(--wisp-surface-variant)] px-3.5 py-2.5">
                    <span className="text-sm text-[var(--wisp-on-surface-variant)]">Reply…</span>
                    <span className="flex-1" />
                    <button
                      type="button"
                      aria-label="Send reply"
                      className="flex h-7 w-7 items-center justify-center rounded-full"
                      style={{ background: 'var(--wisp-accent)' }}
                      onClick={() => onReply(r.note)}
                    >
                      <Send size={14} color="#FFFFFF" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filter bottom sheet (final state — no entry animation) */}
      {sheetOpen && (
        <>
          <div
            className="absolute inset-0 z-30"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            role="button"
            tabIndex={-1}
            aria-label="Close filters"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 z-40 rounded-t-2xl bg-[var(--wisp-surface)] p-5">
            <div className="mb-2 text-base font-semibold">Notification Filters</div>
            {SWITCH_ROWS.map(({ key, label, Icon }) => (
              <React.Fragment key={key}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 py-2.5 text-left"
                  onClick={() => toggleFilter(key)}
                >
                  <Icon
                    size={22}
                    strokeWidth={1.8}
                    className="shrink-0 text-[var(--wisp-on-surface-variant)]"
                  />
                  <span className="flex-1 text-[15px]">{label}</span>
                  <ToggleSwitch on={filters[key]} />
                </button>
                <div className="wisp-divider" />
              </React.Fragment>
            ))}
            <button
              type="button"
              className="flex w-full items-center gap-3 py-2.5 text-left"
              onClick={() => toggleFilter('chatRooms')}
            >
              <MessagesSquare
                size={22}
                strokeWidth={1.8}
                className="shrink-0 text-[var(--wisp-on-surface-variant)]"
              />
              <span className="flex-1 text-[15px]">Chat rooms</span>
              <ToggleSwitch on={filters.chatRooms} />
            </button>
            <div className="wisp-divider" />
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                className="py-1 text-sm font-medium"
                style={{ color: 'var(--wisp-accent)' }}
                onClick={() => setFilters(ALL_ON)}
              >
                Enable all
              </button>
              <button
                type="button"
                className="py-1 text-sm font-medium"
                style={{ color: 'var(--wisp-accent)' }}
                onClick={() => setFilters(ALL_OFF)}
              >
                Disable all
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
