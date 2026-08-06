import React, { useEffect, useRef, useState } from 'react';
import { Bell, BellOff, ChevronLeft, Cloud, Plus, Send, UserPlus } from 'lucide-react';
import { mockUsers } from '../../../data/mock';
import type { MockUser } from '../../../data/mock';
import type { MessagesScreenProps } from '../types';
import { WispAvatar } from '../components/Avatar';

/**
 * Messages ("Chat") — screen-map §10. Two M3 tabs (Direct Messages | Chat
 * Rooms), flat DM rows with hairline dividers, per-tab FAB, and a full DM
 * conversation view (own bubbles = accent@35%, theirs = surfaceVariant@62%)
 * that hides the bottom bar via onImmersiveChange.
 */

type ChatTab = 'dms' | 'rooms';

interface ChatMessage {
  id: string;
  mine: boolean;
  text: string;
  time: string;
}

const DM_PREVIEWS = ['gm!', 'did you see the relay stats?', 'Test'];
const DM_DATES = ['Jul 30', 'Jul 29', 'Jul 27'];

const ROOMS = [
  { name: 'wisp beta chat', preview: 'welcome to the beta!', date: 'Jul 30' },
  { name: 'gm lounge', preview: 'gm gm', date: 'Jul 29' },
];

const ROOM_MENU_ITEMS = [
  'Discover chat rooms',
  'Join existing chat room',
  'Create new chat room',
];

function seedMessages(preview: string): ChatMessage[] {
  return [
    { id: 'seed-1', mine: false, text: 'hey hey', time: '13:58' },
    { id: 'seed-2', mine: true, text: 'loving the orange accent over here', time: '14:00' },
    { id: 'seed-3', mine: false, text: preview, time: '14:02' },
  ];
}

function nowHm(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function MessagesScreen({
  currentUser,
  onOpenProfile,
  onImmersiveChange,
}: MessagesScreenProps) {
  const [tab, setTab] = useState<ChatTab>('dms');
  const [peer, setPeer] = useState<MockUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [roomMenuOpen, setRoomMenuOpen] = useState(false);
  const [mutedRooms, setMutedRooms] = useState<Record<string, boolean>>({});

  // Guarantee the bottom bar comes back if the tab unmounts mid-conversation.
  const immersiveRef = useRef(onImmersiveChange);
  immersiveRef.current = onImmersiveChange;
  useEffect(() => () => immersiveRef.current(false), []);

  const conversations = mockUsers
    .filter((u) => u.pubkey !== currentUser.pubkey)
    .slice(0, 3)
    .map((user, i) => ({ user, preview: DM_PREVIEWS[i], date: DM_DATES[i] }));

  const openConversation = (user: MockUser, preview: string) => {
    setMessages(seedMessages(preview));
    setDraft('');
    setPeer(user);
    onImmersiveChange(true);
  };

  const closeConversation = () => {
    setPeer(null);
    onImmersiveChange(false);
  };

  const sendDraft = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { id: `own-${m.length}`, mine: true, text, time: nowHm() }]);
    setDraft('');
  };

  // ---------------------------------------------------------------- CONVERSATION
  if (peer) {
    return (
      <div data-tour="wisp-messages" className="flex h-full min-h-0 flex-col">
        {/* Top bar */}
        <div className="flex h-12 shrink-0 items-center gap-2 px-2">
          <button
            type="button"
            aria-label="Back"
            className="p-1 text-[var(--wisp-on-surface-variant)]"
            onClick={closeConversation}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            className="flex min-w-0 items-center gap-2"
            onClick={() => onOpenProfile(peer)}
          >
            <WispAvatar seed={peer.username} className="w-10 h-10" />
            <span className="truncate text-base font-semibold">{peer.displayName}</span>
          </button>
          <div className="ml-auto pr-2">
            <button
              type="button"
              aria-label="Message relays"
              className="relative p-1 text-[var(--wisp-on-surface-variant)]"
            >
              <Cloud size={22} strokeWidth={1.8} />
              <span
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white"
                style={{ background: 'var(--wisp-accent)' }}
              >
                3
              </span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex min-h-0 flex-1 flex-col justify-end gap-1 overflow-y-auto px-3">
          <div className="flex items-center gap-3 py-1">
            <div className="wisp-divider flex-1" />
            <span className="text-xs text-[var(--wisp-on-surface-variant)]">Today</span>
            <div className="wisp-divider flex-1" />
          </div>
          {messages.map((m) =>
            m.mine ? (
              <div
                key={m.id}
                className="max-w-[75%] self-end rounded-2xl rounded-br-[4px] px-3.5 py-2"
                style={{ background: 'rgba(255,152,0,0.35)' }}
              >
                <p className="whitespace-pre-wrap text-[15px]">{m.text}</p>
                <div className="text-right text-[11px] text-[var(--wisp-on-surface-variant)]">
                  {m.time}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex max-w-[75%] items-end gap-2 self-start">
                <WispAvatar seed={peer.username} className="w-9 h-9" />
                <div
                  className="rounded-2xl rounded-bl-[4px] px-3.5 py-2"
                  style={{ background: 'rgba(44,44,46,0.62)' }}
                >
                  <div className="text-xs font-semibold" style={{ color: 'var(--wisp-accent)' }}>
                    {peer.displayName}
                  </div>
                  <p className="whitespace-pre-wrap text-[15px]">{m.text}</p>
                  <div className="text-right text-[10px] text-[var(--wisp-on-surface-variant)]">
                    {m.time}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>

        {/* Input bar */}
        <div className="m-3 flex shrink-0 items-end gap-2.5 rounded-xl bg-[var(--wisp-surface)] p-2">
          <button
            type="button"
            aria-label="Attach"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--wisp-on-surface-variant)]"
            style={{ background: 'rgba(224,224,224,0.08)' }}
          >
            <Plus size={18} />
          </button>
          <textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message…"
            aria-label="Message"
            className="flex-1 resize-none bg-transparent text-[15px] outline-none placeholder:text-[var(--wisp-on-bg)] placeholder:opacity-[0.45]"
          />
          <button
            type="button"
            aria-label="Send"
            disabled={!draft.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center"
            style={
              draft.trim()
                ? { color: 'var(--wisp-accent)' }
                : { color: 'var(--wisp-on-surface-variant)', opacity: 0.38 }
            }
            onClick={sendDraft}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------------ LIST
  const visibleRooms = ROOMS;

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {/* Title bar */}
      <div className="flex h-12 shrink-0 items-center px-4">
        <h1 className="text-[20px] font-bold">Chat</h1>
      </div>

      {/* Tab row */}
      <div className="flex shrink-0">
        {(
          [
            { id: 'dms', label: 'Direct Messages' },
            { id: 'rooms', label: 'Chat Rooms' },
          ] as { id: ChatTab; label: string }[]
        ).map(({ id, label }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              className="flex h-12 flex-1 items-center justify-center border-b-2 text-sm font-medium"
              style={{
                color: active ? 'var(--wisp-accent)' : 'var(--wisp-on-surface-variant)',
                borderColor: active ? 'var(--wisp-accent)' : 'transparent',
              }}
              onClick={() => {
                setTab(id);
                setRoomMenuOpen(false);
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="wisp-divider" />

      {/* Lists */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'dms' &&
          (conversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 px-6 text-center">
              <p className="text-base font-semibold">No messages yet</p>
              <p className="text-xs text-[var(--wisp-on-surface-variant)]">
                Send a message from someone&apos;s profile
              </p>
            </div>
          ) : (
            conversations.map(({ user, preview, date }, i) => (
              <React.Fragment key={user.pubkey}>
                <div
                  role="button"
                  tabIndex={0}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3"
                  onClick={() => openConversation(user, preview)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') openConversation(user, preview);
                  }}
                >
                  <WispAvatar seed={user.username} className="w-10 h-10" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-semibold">{user.displayName}</div>
                    <div className="truncate text-xs text-[var(--wisp-on-surface-variant)]">
                      {preview}
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] text-[var(--wisp-on-surface-variant)]">
                    {date}
                  </span>
                </div>
                {i < conversations.length - 1 && <div className="wisp-divider" />}
              </React.Fragment>
            ))
          ))}

        {tab === 'rooms' &&
          (visibleRooms.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 px-6 text-center">
              <p className="text-base font-semibold">No chat rooms yet</p>
              <p className="text-xs text-[var(--wisp-on-surface-variant)]">
                Tap + to join or create a chat room
              </p>
            </div>
          ) : (
            visibleRooms.map((room, i) => {
              const muted = Boolean(mutedRooms[room.name]);
              return (
                <React.Fragment key={room.name}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <button
                      type="button"
                      aria-label={muted ? 'Unmute room' : 'Mute room'}
                      className="flex h-9 w-9 shrink-0 items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMutedRooms((m) => ({ ...m, [room.name]: !m[room.name] }));
                      }}
                    >
                      {muted ? (
                        <BellOff
                          size={20}
                          style={{ color: 'var(--wisp-on-surface-variant)', opacity: 0.4 }}
                        />
                      ) : (
                        <Bell size={20} style={{ color: 'var(--wisp-accent)' }} />
                      )}
                    </button>
                    <div className="relative shrink-0">
                      <WispAvatar seed={room.name} className="w-10 h-10" />
                      <span
                        className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full"
                        style={{ background: 'var(--wisp-accent)' }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-semibold">{room.name}</div>
                      <div className="truncate text-xs text-[var(--wisp-on-surface-variant)]">
                        {room.preview}
                      </div>
                    </div>
                    <span className="shrink-0 text-[11px] text-[var(--wisp-on-surface-variant)]">
                      {room.date}
                    </span>
                  </div>
                  {i < visibleRooms.length - 1 && <div className="wisp-divider" />}
                </React.Fragment>
              );
            })
          ))}
      </div>

      {/* FAB */}
      <button
        type="button"
        aria-label={tab === 'dms' ? 'New group message' : 'Add chat room'}
        className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
        style={{ background: 'var(--wisp-accent)' }}
        onClick={() => {
          if (tab === 'rooms') setRoomMenuOpen((o) => !o);
        }}
      >
        {tab === 'dms' ? <UserPlus size={24} /> : <Plus size={24} />}
      </button>

      {/* Rooms FAB menu — rendered in its final state */}
      {roomMenuOpen && tab === 'rooms' && (
        <div
          className="absolute bottom-20 right-4 z-30 min-w-[210px] rounded-lg py-1 shadow-xl"
          style={{ background: 'var(--wisp-surface)' }}
        >
          {ROOM_MENU_ITEMS.map((label) => (
            <button
              key={label}
              type="button"
              className="block w-full px-4 py-2.5 text-left text-sm"
              onClick={() => setRoomMenuOpen(false)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
