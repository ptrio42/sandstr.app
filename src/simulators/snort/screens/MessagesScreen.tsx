import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { seededUnit } from '../snortUtils';

/**
 * Snort — Messages / DMs. Route `/messages/:id?`.
 *
 * Every structural decision below traces to `docs/refs/snort/screen-map.md`
 * §10 (read together with §1 for tokens and §3 for the pill system). The parts
 * a reproducer habitually gets wrong:
 *
 *  - It is TWO COLUMNS inside the centre column at >=768px (`const TwoCol = 768`,
 *    `MessagesPage.tsx:20`): a `w-1/3` conversation list plus the conversation
 *    pane. Not a full-width list that swaps to a full-width thread.
 *  - The list header is `flex items-center justify-between` — "Mark all read"
 *    on the left, the new-chat `+` on the right. That, and nothing else, is what
 *    the owner's recording actually captured (the account had no conversations),
 *    so the header is the one REC-verified part of this screen.
 *  - "Note to Self" always sorts first and is NOT an avatar row: a 48x48
 *    `book-closed` box, a bold label and a `badge` glyph.
 *  - Participants at follow-distance <= 2 are listed flat; everyone else goes
 *    into a CollapsedSection titled "Other Chats" that STARTS CLOSED.
 *  - Only your OWN bubbles carry the violet -> pink `--dm-gradient`; theirs are
 *    flat `layer-1`. The two accents never blend — the orange `--primary` has no
 *    business on this screen at all, not even on Send.
 *  - The send control is a plain circular icon pill with `arrow-right`, not a
 *    coloured CTA.
 *
 * Two documented upstream quirks are reproduced verbatim rather than "fixed":
 * the selected row has NO visual state (`active` is applied but has no CSS), and
 * the `has-unread` dot on "Other Chats" is likewise styleless, so it renders as
 * nothing. Both are flagged with a ⚠ in §10.
 */

export interface MessagesScreenProps {
  currentUser: MockUser | null;
  users: MockUser[];
}

/** Self-chat key. Upstream keys this conversation by your own pubkey. */
const SELF_KEY = '__self__';

/** `followDistance <= 2` is listed flat; the rest fall into "Other Chats". */
const CLOSE_COUNT = 7;
const DISTANT_COUNT = 5;

interface ChatMessage {
  id: string;
  mine: boolean;
  text: string;
  /** `NoteTime`-shaped label. Held as data so nothing depends on Date.now(). */
  time: string;
}

type Line = Omit<ChatMessage, 'id'>;

/**
 * Invented conversations. Mock content only — no real handles, no real people,
 * and no clock: the timestamps are literal `NoteTime`-style labels so the screen
 * renders identically on every mount.
 */
const SCRIPTS: Line[][] = [
  [
    { mine: false, text: 'did you get the relay list I sent over? the paid one has been rock solid all week', time: '4h' },
    { mine: true, text: 'added it last night. my feed loads noticeably faster now', time: '4h' },
    { mine: false, text: 'told you. the free ones start dropping events the moment they get busy', time: '3h' },
    { mine: true, text: "I'm keeping two free + one paid for now. seems like a reasonable spread", time: '3h' },
    { mine: false, text: "that's the setup I'd recommend. ping me if your writes ever start failing", time: '1h' },
    { mine: true, text: 'will do — thanks for digging into it', time: '1h' },
  ],
  [
    { mine: false, text: 'your note about key backups got reposted all over my feed this morning', time: '7h' },
    { mine: true, text: "surprised me too. I almost didn't post it", time: '6h' },
    { mine: false, text: 'the part about never pasting a private key into a website is the bit people needed spelled out', time: '6h' },
    { mine: true, text: "that one's non-negotiable. a signer extension or nothing", time: '5h' },
    { mine: false, text: "mind if I translate it? I'd credit you and link back to the original note", time: '2h' },
    { mine: true, text: 'go for it', time: '2h' },
  ],
  [
    { mine: false, text: 'zapped your last note — the thread on how clients render the same event differently was great', time: '9h' },
    { mine: true, text: 'thank you! it took three drafts before it made any sense', time: '8h' },
    { mine: false, text: 'worth it. are you writing the follow-up?', time: '8h' },
    { mine: true, text: "drafting it now. mostly about why two clients can show you completely different feeds from the same relays", time: '5h' },
    { mine: false, text: 'send me a preview when it is ready and I will read it properly', time: '4h' },
    { mine: true, text: 'will do', time: '4h' },
  ],
];

/** Note to Self: a scratchpad, so every line is yours. */
const SELF_SCRIPT: Line[] = [
  { mine: true, text: 'relay to try later: wss://relay.example', time: 'Jul 12' },
  { mine: true, text: 'draft idea — a short post on why a follow list is portable and a follower count is not', time: 'Jul 12' },
  { mine: true, text: 'back up the recovery phrase somewhere that is not this device', time: '2h' },
];

/** Row timestamps, picked deterministically. Same shape `NoteTime` emits. */
const ROW_TIMES = ['now', '12m', '48m', '4h', '9h', '21h', 'Jul 12', 'Jul 9'];

function pick<T>(list: T[], seed: string): T {
  return list[Math.floor(seededUnit(seed) * list.length)];
}

/** 0–3 unread, deterministic per conversation. */
function baseUnread(key: string): number {
  const n = Math.floor(seededUnit(`snort-dm-unread:${key}`) * 8);
  return n > 4 ? n - 4 : 0;
}

function cleanNip05(nip05: string): string {
  return nip05.startsWith('_@') ? nip05.slice(2) : nip05;
}

export function MessagesScreen({ currentUser, users }: MessagesScreenProps) {
  const participants = useMemo(
    () => users.filter((u) => u.pubkey !== currentUser?.pubkey),
    [users, currentUser],
  );

  /** The trust split (§10): flat list first, then the collapsed "Other Chats". */
  const closeChats = useMemo(() => participants.slice(0, CLOSE_COUNT), [participants]);
  const distantChats = useMemo(
    () => participants.slice(CLOSE_COUNT, CLOSE_COUNT + DISTANT_COUNT),
    [participants],
  );

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [readKeys, setReadKeys] = useState<string[]>([]);
  const [sent, setSent] = useState<Record<string, ChatMessage[]>>({});
  const [draft, setDraft] = useState('');
  const [otherOpen, setOtherOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatQuery, setNewChatQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);

  const activeKey = selectedKey ?? closeChats[0]?.pubkey ?? SELF_KEY;
  const activeUser = participants.find((u) => u.pubkey === activeKey);

  /** Opening a conversation reads it, so the open row never shows a badge. */
  const unreadFor = useCallback(
    (key: string) => (key === activeKey || readKeys.includes(key) ? 0 : baseUnread(key)),
    [activeKey, readKeys],
  );

  const anyUnread = useMemo(
    () => [SELF_KEY, ...participants.map((u) => u.pubkey)].some((k) => unreadFor(k) > 0),
    [participants, unreadFor],
  );

  const markAllRead = useCallback(() => {
    setReadKeys([SELF_KEY, ...participants.map((u) => u.pubkey)]);
  }, [participants]);

  const openChat = useCallback((key: string) => {
    setSelectedKey(key);
    setReadKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setDraft('');
  }, []);

  const messages = useMemo<ChatMessage[]>(() => {
    const script = activeKey === SELF_KEY ? SELF_SCRIPT : pick(SCRIPTS, `snort-dm-script:${activeKey}`);
    const scripted = script.map((line, i) => ({ id: `${activeKey}-${i}`, ...line }));
    return scripted.concat(sent[activeKey] ?? []);
  }, [activeKey, sent]);

  /** Upstream pins the scroller to the bottom on open and after each send. */
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeKey, messages.length]);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    setSent((prev) => {
      const existing = prev[activeKey] ?? [];
      return {
        ...prev,
        [activeKey]: [
          ...existing,
          { id: `${activeKey}-sent-${existing.length}`, mine: true, text, time: 'now' },
        ],
      };
    });
    setDraft('');
  }, [activeKey, draft]);

  const closeNewChat = useCallback(() => {
    setNewChatOpen(false);
    setNewChatQuery('');
    setPicked([]);
  }, []);

  const newChatCandidates = useMemo(() => {
    const q = newChatQuery.trim().toLowerCase();
    if (!q) return participants.slice(0, 12);
    return participants
      .filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          (u.nip05 ?? '').toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [participants, newChatQuery]);

  const headerName = activeKey === SELF_KEY ? 'Note to Self' : activeUser?.displayName ?? 'Chat';

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden" data-tour="snort-messages">
      {/* ---- Conversation list. `overflow-y-auto p-2 w-full md:w-1/3
           flex-shrink-0 flex flex-col gap-2` upstream. The 1px edge is the same
           `rt-border` §10 puts on the desktop pane, moved to the seam so the two
           columns read as two columns. ---- */}
      <div
        className="flex w-1/3 min-w-[220px] flex-shrink-0 flex-col gap-2 overflow-y-auto p-2"
        style={{ borderRight: '1px solid var(--snort-border)' }}
      >
        <div className="flex items-center justify-between">
          {/* Written as a text button upstream, not a pill: `text-sm
              font-semibold`, disabled once nothing is unread. */}
          <button
            type="button"
            className="snort-btn-sm text-sm font-semibold"
            disabled={!anyUnread}
            style={{ opacity: anyUnread ? 1 : 0.3, cursor: anyUnread ? 'pointer' : 'not-allowed' }}
            onClick={markAllRead}
          >
            Mark all read
          </button>
          <button
            type="button"
            className="snort-btn icon new-chat"
            aria-label="New chat"
            onClick={() => setNewChatOpen(true)}
          >
            <Icon name="plus" size={16} />
          </button>
        </div>

        {/* Self-chat always sorts first. */}
        <div
          role="button"
          tabIndex={0}
          className={`flex cursor-pointer items-center justify-between px-3 py-2${
            activeKey === SELF_KEY ? ' active' : ''
          }`}
          onClick={() => openChat(SELF_KEY)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openChat(SELF_KEY);
            }
          }}
        >
          <div className="flex min-w-0 grow items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--snort-layer-1)' }}
            >
              <Icon name="book-closed" size={24} />
            </div>
            <span className="flex min-w-0 items-center gap-1">
              <span className="truncate font-bold">Note to Self</span>
              <Icon name="badge" size={16} className="shrink-0" />
            </span>
          </div>
        </div>

        {closeChats.map((user) => (
          <ChatRow
            key={user.pubkey}
            user={user}
            active={activeKey === user.pubkey}
            time={pick(ROW_TIMES, `snort-dm-time:${user.pubkey}`)}
            unread={unreadFor(user.pubkey)}
            onSelect={() => openChat(user.pubkey)}
          />
        ))}

        {distantChats.length > 0 && (
          <>
            {/* CollapsedSection — starts closed (§10). The `has-unread` dot
                upstream renders here is styleless, i.e. invisible, so there is
                nothing to draw. */}
            <div
              role="button"
              tabIndex={0}
              className="flex cursor-pointer items-center gap-4 px-3 py-2 text-xl"
              onClick={() => setOtherOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOtherOpen((v) => !v);
                }
              }}
            >
              <span>Other Chats</span>
              <Icon
                name="chevronDown"
                size={20}
                className={otherOpen ? 'rotate-180 transition-transform' : 'transition-transform'}
              />
            </div>
            {otherOpen &&
              distantChats.map((user) => (
                <ChatRow
                  key={user.pubkey}
                  user={user}
                  active={activeKey === user.pubkey}
                  time={pick(ROW_TIMES, `snort-dm-time:${user.pubkey}`)}
                  unread={unreadFor(user.pubkey)}
                  onSelect={() => openChat(user.pubkey)}
                />
              ))}
          </>
        )}
      </div>

      {/* ---- Conversation pane: `flex flex-1 flex-col` + `min-h-0 min-w-0`,
           participant header `p-3`, scroller `p-2.5 flex-grow`, composer
           `flex items-center gap-2.5 p-2.5 shrink-0`. ---- */}
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--snort-bg)' }}
      >
        <div
          className="flex shrink-0 items-center gap-3 p-3"
          style={{ borderBottom: '1px solid var(--snort-border)' }}
        >
          {activeKey === SELF_KEY ? (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--snort-layer-1)' }}
            >
              <Icon name="book-closed" size={20} />
            </div>
          ) : (
            <Avatar seed={activeUser?.username ?? 'anon'} className="h-10 w-10" />
          )}
          <div className="min-w-0">
            <div className="truncate font-semibold">{headerName}</div>
            {activeKey !== SELF_KEY && activeUser?.nip05 && (
              <div className="truncate text-xs" style={{ color: '#a3a3a3' }}>
                {cleanNip05(activeUser.nip05)}
              </div>
            )}
          </div>
        </div>

        <div ref={scrollRef} className="flex min-w-0 flex-grow flex-col overflow-y-auto p-2.5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`mt-4 min-w-[100px] max-w-[90%] whitespace-pre-wrap${m.mine ? ' self-end' : ''}`}
            >
              <div className={m.mine ? 'snort-dm-mine' : 'snort-dm-theirs'}>{m.text}</div>
              <div className={`mt-1 text-sm text-gray-400${m.mine ? ' text-end' : ''}`}>{m.time}</div>
            </div>
          ))}
        </div>

        {/* Composer. Upstream's Textarea carries NO placeholder; Enter sends,
            Shift+Enter inserts a newline. The send control is the plain circular
            icon pill — the orange CTA never appears on this screen. */}
        <div className="flex shrink-0 items-center gap-2.5 p-2.5">
          <div className="grow">
            <textarea
              className="snort-textarea"
              rows={1}
              aria-label="Message"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
          </div>
          <button type="button" className="snort-btn icon" aria-label="Send message" onClick={send}>
            <Icon name="arrow-right" size={20} />
          </button>
        </div>
      </div>

      {/* ---- New chat modal. Rendered at its final state — no enter animation,
           because the preview environment freezes springs and keyframes at
           frame 0. Strings are upstream's (§10). ---- */}
      {newChatOpen && (
        <div className="snort-modal-scrim" onClick={closeNewChat}>
          <div className="snort-modal-body" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="snort-h2">New Chat</h2>
              <button
                type="button"
                className="snort-btn"
                disabled={picked.length === 0}
                onClick={() => {
                  if (picked.length > 0) openChat(picked[0]);
                  closeNewChat();
                }}
              >
                Start chat
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="snort-h3">Search users</h3>
              <input
                className="snort-input"
                placeholder="npub/nprofile/nostr address"
                value={newChatQuery}
                onChange={(e) => setNewChatQuery(e.target.value)}
              />
              {picked.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {picked.map((pk) => {
                    const u = participants.find((p) => p.pubkey === pk);
                    return <Avatar key={pk} seed={u?.username ?? pk} className="h-10 w-10" />;
                  })}
                </div>
              )}
            </div>

            <p className="font-semibold">People you follow</p>
            <div className="flex max-h-[40vh] flex-col gap-0.5 overflow-y-auto">
              {newChatCandidates.map((u) => {
                const isPicked = picked.includes(u.pubkey);
                const toggle = () =>
                  setPicked((prev) =>
                    prev.includes(u.pubkey) ? prev.filter((p) => p !== u.pubkey) : [...prev, u.pubkey],
                  );
                return (
                  <div
                    key={u.pubkey}
                    role="button"
                    tabIndex={0}
                    className="flex cursor-pointer items-center justify-between px-3 py-2"
                    onClick={toggle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggle();
                      }
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar seed={u.username} className="h-10 w-10" />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{u.displayName}</div>
                        {u.nip05 && (
                          <div className="truncate text-xs" style={{ color: '#a3a3a3' }}>
                            {cleanNip05(u.nip05)}
                          </div>
                        )}
                      </div>
                    </div>
                    {isPicked && (
                      <span style={{ color: 'var(--snort-success)' }}>
                        <Icon name="check" size={18} strokeWidth={2.5} />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * One conversation row: `flex items-center px-3 py-2 cursor-pointer
 * justify-between`, avatar + name + nip05 left, `<small>` time then the unread
 * badge right. ⚠ `active` is applied exactly as upstream applies it and, exactly
 * as upstream, has no styling — the selected row genuinely has no visual state.
 */
function ChatRow({
  user,
  active,
  time,
  unread,
  onSelect,
}: {
  user: MockUser;
  active: boolean;
  time: string;
  unread: number;
  onSelect: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`flex cursor-pointer items-center justify-between px-3 py-2${active ? ' active' : ''}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="flex min-w-0 grow items-center gap-3">
        <Avatar seed={user.username} className="h-10 w-10" />
        <div className="min-w-0">
          <div className="truncate font-medium">{user.displayName}</div>
          {user.nip05 && (
            <div className="truncate text-xs" style={{ color: '#a3a3a3' }}>
              {cleanNip05(user.nip05)}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center">
        <small className="text-sm font-medium" style={{ color: '#737373' }}>
          {time}
        </small>
        {unread > 0 && (
          <span
            className="mx-1 my-0.5 inline-block select-none rounded-[10px] px-2 py-0.5 text-sm"
            style={{ backgroundColor: 'var(--snort-highlight)', color: '#fff' }}
          >
            {unread}
          </span>
        )}
      </div>
    </div>
  );
}

export default MessagesScreen;
