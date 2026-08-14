import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, MoreHorizontal, Plus, Play, Zap, BadgeCheck, ArrowLeft, Send, Search, Users, Lock } from 'lucide-react';
import { AppTopBar } from '../components/AppTopBar';
import { Avatar } from '../components/Avatar';
import '../amethyst.theme.css';

interface MessagesScreenProps {
  onOpenDrawer?: () => void;
  onOpenSearch?: () => void;
  /** Which sub-tab to open on, so a command can land on New Requests (ame-92). */
  initialTab?: 'known' | 'requests';
}

type Convo = {
  id: string;
  name: string;
  handle?: string;
  tag?: string;        // e.g. "Public Chat"
  group?: boolean;     // rounded-square group icon
  logo?: boolean;      // use the Amethyst logo (Amethyst Users group)
  verified?: boolean;
  zap?: boolean;
  time: string;
  preview: string;
  /** Purple dot on the row; also what lights the envelope in the bottom bar. */
  unread?: boolean;
  /** The screen map quotes "You: …" for previews you sent yourself. */
  fromYou?: boolean;
};

// Real Amethyst Messages ("Known" tab), modelled on the v1.12.6 screenshot:
// public chats + DMs, name + @handle, a play affordance, and "• time".
const conversations: Convo[] = [
  { id: 'nostr', name: 'Nostr', tag: 'Public Chat', group: true, time: '1h', preview: '⚡JOLT⚡: Genuinely curious if anyone …' },
  { id: 'amethyst', name: 'Amethyst Users', tag: 'Public Chat', group: true, logo: true, time: '1h', preview: '⚡JOLT⚡: Genuinely curious if anyone …' },
  { id: 'karrot', name: 'Karrot', handle: '@karrot', verified: true, time: '3h', preview: 'They usually go after hosts, but in amethyst…', unread: true },
  { id: 'neo', name: 'Neonwarden', handle: '@wallet.example', zap: true, time: '13h', preview: "It's gone now.", fromYou: true },
  { id: 'btcmil', name: 'Btcmilhao', handle: '@Lodki', time: '15h', preview: 'Então tem algo errado na configuração do …' },
  { id: 'violet', name: 'Violet Volt', verified: true, time: '15h', preview: '#Amethyst v1.13.1: More Performance…', unread: true },
  { id: 'dbth', name: "Don't Believe the Hype 🦊", handle: '@dontb…', time: '21h', preview: 'Because it might happen that the melt take…' },
  { id: 'jolt', name: '⚡JOLT⚡', handle: '@HalfChargedKing', time: '2d', preview: 'Can you please report this for impersonatio…' },
  { id: 'mvl', name: 'Marta Vellin', handle: '@mvellin', time: '3d', preview: "Let me know when it's a good time for…", fromYou: true },
];

// "New Requests" = messages from contacts you don't follow → shown as short npub
// ids with a date (per the real inbox), not display names.
const requests: Convo[] = [
  { id: 'r1', name: 'npub18s5…gqttz5c3', time: 'Mar 12', preview: 'Cześć, zbudowałem serwis edukacyjny nostr…' },
  { id: 'r2', name: 'npub16g4…hquekv4h', time: 'Feb 19', preview: 'Referenced event not found' },
  { id: 'r3', name: 'npub10wn…csjekxa2', time: 'Feb 16', preview: 'Test' },
  { id: 'r4', name: 'npub1xz7…ps5xyzav', time: 'Feb 08', preview: 'Referenced event not found' },
  { id: 'r5', name: 'npub1wmh…jsj6a6yx', time: 'Jan 26', preview: 'Referenced event not found' },
  { id: 'r6', name: 'npub1rsl…zsat947q', time: 'Jan 10', preview: 'Referenced event not found' },
];

// Deterministic gradient avatar (CSP-safe; robohash unification is a separate task).
function seedStyle(seed: string): React.CSSProperties {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return { background: `linear-gradient(135deg, hsl(${h} 55% 55%), hsl(${(h + 40) % 360} 60% 42%))` };
}

export function MessagesScreen({ onOpenDrawer, onOpenSearch, initialTab = 'known' }: MessagesScreenProps) {
  const [tab, setTab] = useState<'known' | 'requests'>(initialTab);
  const [open, setOpen] = useState<Convo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [read, setRead] = useState<string[]>([]);

  // Opening a conversation clears its dot, which is what makes the dot mean
  // something rather than being decoration (gaps ame-91).
  const isUnread = (c: Convo) => !!c.unread && !read.includes(c.id);

  if (open) {
    return <ChatView convo={open} onBack={() => setOpen(null)} />;
  }

  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]" data-tour="amethyst-messages">
      <AppTopBar
        onOpenDrawer={onOpenDrawer}
        onOpenSearch={onOpenSearch}
        center={<img src="/icons/amethyst.png" alt="Amethyst" className="w-8 h-8 object-contain" />}
      />

      {/* Tabs: Known / New Requests + overflow */}
      <div className="md-tabs sticky top-16 z-10 bg-[var(--md-surface)] flex items-center" data-tour="amethyst-messages-tabs">
        <button onClick={() => setTab('known')} className={`md-tab ${tab === 'known' ? 'active' : ''}`}>
          Known
          {tab === 'known' && (
            <motion.div layoutId="msg-tab-indicator" className="md-tab-indicator" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
          )}
        </button>
        <button onClick={() => setTab('requests')} className={`md-tab ${tab === 'requests' ? 'active' : ''}`}>
          New Requests
          {tab === 'requests' && (
            <motion.div layoutId="msg-tab-indicator" className="md-tab-indicator" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
          )}
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="More options"
          data-tour="amethyst-messages-overflow"
          className="px-3 text-[var(--md-on-surface-variant)]"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {(tab === 'known' ? conversations : requests).map((c, i) => (
          <React.Fragment key={c.id}>
            <ConversationRow c={c} i={i} unread={isUnread(c)} onOpen={() => { setRead((r) => [...r, c.id]); setOpen(c); }} />
            {/* New in v1.13.1: the NIP-04 backfill card sits inline in the Known
                list, between conversations, reporting how far back the legacy
                (unencrypted-metadata) history has been loaded. */}
            {tab === 'known' && i === 0 && (
              <div className="mx-4 my-2 rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: 'var(--md-surface-container-low)' }} data-tour="amethyst-legacy-messages">
                <MoreHorizontal className="w-5 h-5 shrink-0 text-[var(--md-on-surface-variant)]" />
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--md-on-surface)]">Older legacy messages</p>
                  <p className="text-sm text-[var(--md-on-surface-variant)] truncate">NIP-04 · 7 relays · loaded since Aug 2026</p>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* New-message FAB. The FAQ's `dms` answer tells the reader in prose to
          "tap the purple + button to start a new message", so it has to do
          something (gaps ame-24). */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        onClick={() => setComposeOpen(true)}
        aria-label="New message"
        data-tour="amethyst-messages-fab"
        className="absolute bottom-24 right-4 z-20 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--md-primary)', color: 'var(--md-on-primary)', boxShadow: 'var(--md-shadow-3)' }}
      >
        <Plus className="w-7 h-7" />
      </motion.button>

      {/* Sub-tab overflow — `mark_all_*`, verbatim. */}
      {menuOpen && (
        <div className="fixed inset-0 z-[130] flex items-end" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-label="More options"
            className="relative w-full rounded-t-3xl pb-3"
            style={{ background: 'var(--md-surface-container-high)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {['Mark all New as read', 'Mark all as read'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setRead(conversations.map((c) => c.id));
                  setMenuOpen(false);
                }}
                className="w-full px-5 py-3.5 text-left text-[var(--md-on-surface)]"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* New conversation. `new_conversation_*` names the three kinds Amethyst
          offers; the recording never opens the sheet, so we render the chooser
          and say plainly that the reproduction stops there. */}
      {composeOpen && (
        <div className="fixed inset-0 z-[130] flex items-end" onClick={() => setComposeOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-label="New message"
            data-tour="amethyst-new-message"
            className="relative w-full rounded-t-3xl px-5 pt-4 pb-5"
            style={{ background: 'var(--md-surface-container-high)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-[var(--md-on-surface)]">New conversation</p>
            <div className="mt-3 space-y-1">
              {[
                { Icon: Lock, title: 'Private DM', body: 'One-to-one, metadata hidden (NIP-17).' },
                { Icon: Users, title: 'Marmot Group', body: 'Larger private groups that outgrow small-group DMs.' },
                { Icon: Search, title: 'Public Chat', body: 'An open room anyone can read and join.' },
              ].map((row) => (
                <div key={row.title} className="flex items-start gap-3 py-2">
                  <row.Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--md-primary)' }} />
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--md-on-surface)]">{row.title}</p>
                    <p className="text-sm text-[var(--md-on-surface-variant)]">{row.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--amethyst-placeholder)' }}>
              Simulation: picking one would open a people-picker, which this reproduction has no
              contacts service for.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The conversation itself. The screen map documents only the LIST — the
 * reference recording never opens a chat — so this stays deliberately thin:
 * the header the row already gives us, the last message as the row's preview,
 * and the docked field every chat client has. Anything more would be invention.
 */
function ChatView({ convo, onBack }: { convo: Convo; onBack: () => void }) {
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<string[]>([]);

  const send = () => {
    if (!draft.trim()) return;
    setSent((s) => [...s, draft.trim()]);
    setDraft('');
  };

  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]" data-tour="amethyst-chat">
      <div className="md-app-bar md-app-bar-enhanced">
        <button onClick={onBack} aria-label="Back" className="md-app-bar-icon-btn">
          <ArrowLeft className="w-6 h-6 text-[var(--md-on-surface)]" />
        </button>
        {convo.group ? (
          <div className="w-9 h-9 rounded-2xl shrink-0 flex items-center justify-center text-white font-semibold" style={seedStyle(convo.name)}>#</div>
        ) : (
          <Avatar seed={convo.name} className="w-9 h-9" />
        )}
        <h1 className="flex-1 font-semibold truncate text-[var(--md-on-surface)] px-2">{convo.name}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="max-w-[80%] rounded-2xl px-4 py-2.5" style={{ background: 'var(--md-surface-container-high)' }}>
          <p className="text-[var(--md-on-surface)]">{convo.preview}</p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--amethyst-placeholder)' }}>{convo.time}</p>
        </div>
        {sent.map((m, i) => (
          <div
            key={i}
            className="max-w-[80%] ml-auto rounded-2xl px-4 py-2.5"
            style={{ background: 'var(--md-primary-container)' }}
          >
            <p style={{ color: 'var(--md-on-primary-container)' }}>{m}</p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--md-on-primary-container)', opacity: 0.7 }}>now</p>
          </div>
        ))}
        <p className="text-xs text-center pt-4 leading-relaxed" style={{ color: 'var(--amethyst-placeholder)' }}>
          Simulation: nothing is encrypted and nothing is sent. The reference recording never opens a
          conversation, so only the shape of this screen is reproduced.
        </p>
      </div>

      <div className="flex items-center gap-2 p-2 border-t border-[var(--md-outline-variant)] safe-area-bottom bg-[var(--md-surface)]">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          placeholder="Message"
          aria-label="Message"
          className="flex-1 bg-[var(--md-surface-variant)] rounded-full px-4 py-2.5 text-[var(--md-on-surface)] outline-none placeholder:text-[var(--md-on-surface-variant)]"
        />
        <button
          type="button"
          onClick={send}
          aria-label="Send"
          className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center"
          style={{ background: 'var(--md-primary)', color: 'var(--md-on-primary)' }}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function ConversationRow({ c, i, unread, onOpen }: { c: Convo; i: number; unread?: boolean; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left flex items-center gap-3 px-4 py-3 border-b border-[var(--md-outline-variant)] hover:bg-[var(--md-surface-variant)]/40 transition-colors cursor-pointer"
    >
      {c.logo ? (
        <img src="/icons/amethyst.png" alt="" className="w-12 h-12 rounded-2xl object-contain bg-[var(--md-surface-variant)] p-1.5 shrink-0" />
      ) : c.group ? (
        <div className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center text-white font-semibold" style={seedStyle(c.name)}>#</div>
      ) : (
        <Avatar seed={c.name} className="w-12 h-12" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 min-w-0">
          <span className="font-semibold text-[var(--md-on-surface)] truncate">{c.name}</span>
          {c.verified && <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
          {c.zap && <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--bitcoin-orange)' }} />}
          {(c.handle || c.tag) && (
            <span className="text-[var(--md-on-surface-variant)] truncate">{c.handle || c.tag}</span>
          )}
          <div className="flex items-center gap-1 ml-auto shrink-0 text-[var(--md-on-surface-variant)]">
            <Play className="w-4 h-4" />
            <span className="text-sm whitespace-nowrap">• {c.time}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="flex-1 min-w-0 text-sm text-[var(--md-on-surface-variant)] truncate">
            {c.fromYou && <span className="text-[var(--md-on-surface)]">You: </span>}
            {c.preview}
          </p>
          {unread && (
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: 'var(--md-primary)' }}
              aria-label="Unread"
            />
          )}
        </div>
      </div>
    </motion.button>
  );
}
