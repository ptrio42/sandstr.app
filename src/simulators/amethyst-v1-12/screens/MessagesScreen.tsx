import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Plus, Play, Zap, BadgeCheck } from 'lucide-react';
import { AppTopBar } from '../components/AppTopBar';
import { Avatar } from '../components/Avatar';
import '../amethyst-v1-12.theme.css';

interface MessagesScreenProps {
  onOpenDrawer?: () => void;
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
};

// Amethyst Messages ("Known" tab), modelled on the v1.12.6 reference screenshot:
// public chats + DMs, name + @handle, a play affordance, and "• time".
// Layout is the reference; every name, handle and preview below is invented.
const conversations: Convo[] = [
  { id: 'nostr', name: 'Nostr', tag: 'Public Chat', group: true, time: '1h', preview: '⚡Volt⚡: Genuinely curious if anyone …' },
  { id: 'amethyst', name: 'Amethyst Users', tag: 'Public Chat', group: true, logo: true, time: '1h', preview: '⚡Volt⚡: Genuinely curious if anyone …' },
  { id: 'karrot', name: 'Maple Dev', handle: '@mapledev', verified: true, time: '3h', preview: 'They usually go after hosts, but in amethyst…' },
  { id: 'neo', name: 'Neonwarden', handle: '@wallet.example', zap: true, time: '13h', preview: "It's gone now." },
  { id: 'btcmil', name: 'Satoshi Norte', handle: '@satnorte', time: '15h', preview: 'Beleza, então o relay novo já está funcion…' },
  { id: 'violet', name: 'Violet Volt', verified: true, time: '15h', preview: '#Amethyst v0.62.8: More Performance…' },
  { id: 'dbth', name: 'Question Everything 🦊', handle: '@questev…', time: '21h', preview: 'Because it might happen that the melt take…' },
  { id: 'jolt', name: '⚡Volt⚡', handle: '@voltrunner', time: '2d', preview: 'Can you take a look at the relay list when…' },
  { id: 'mvl', name: 'Mia Macro', handle: '@macromia', time: '3d', preview: "Let me know when it's a good time for…" },
];

// "New Requests" = messages from contacts you don't follow → shown as short npub
// ids with a date, not display names.
const requests: Convo[] = [
  { id: 'r1', name: 'npub1q7x…8m4n6p0v', time: 'Mar 12', preview: 'Hi! Built a small onboarding guide, mind a…' },
  { id: 'r2', name: 'npub1k4d…2r9s5tuz', time: 'Feb 19', preview: 'Referenced event not found' },
  { id: 'r3', name: 'npub1v2h…7wq3ljae', time: 'Feb 16', preview: 'Test' },
  { id: 'r4', name: 'npub1m9t…4xg8ncy6', time: 'Feb 08', preview: 'Referenced event not found' },
  { id: 'r5', name: 'npub1zc6…5gkqpdrf', time: 'Jan 26', preview: 'Referenced event not found' },
  { id: 'r6', name: 'npub1t8j…9naeqx2s', time: 'Jan 10', preview: 'Referenced event not found' },
];

// Deterministic gradient avatar (CSP-safe; robohash unification is a separate task).
function seedStyle(seed: string): React.CSSProperties {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return { background: `linear-gradient(135deg, hsl(${h} 55% 55%), hsl(${(h + 40) % 360} 60% 42%))` };
}

export function MessagesScreen({ onOpenDrawer }: MessagesScreenProps) {
  const [tab, setTab] = useState<'known' | 'requests'>('known');

  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]" data-tour="amethyst-messages">
      <AppTopBar
        onOpenDrawer={onOpenDrawer}
        center={<img src="/icons/amethyst-v1-12.png" alt="Amethyst" className="w-8 h-8 object-contain" />}
      />

      {/* Tabs: Known / New Requests + overflow */}
      <div className="md-tabs sticky top-16 z-10 bg-[var(--md-surface)] flex items-center">
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
        <button aria-label="More options" className="px-3 text-[var(--md-on-surface-variant)]">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {(tab === 'known' ? conversations : requests).map((c, i) => (
          <ConversationRow key={c.id} c={c} i={i} />
        ))}
      </div>

      {/* New-message FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        aria-label="New message"
        className="absolute bottom-24 right-4 z-20 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--md-primary)', color: 'var(--md-on-primary)', boxShadow: 'var(--md-shadow-3)' }}
      >
        <Plus className="w-7 h-7" />
      </motion.button>
    </div>
  );
}

function ConversationRow({ c, i }: { c: Convo; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 px-4 py-3 border-b border-[var(--md-outline-variant)] hover:bg-[var(--md-surface-variant)]/40 transition-colors cursor-pointer"
    >
      {c.logo ? (
        <img src="/icons/amethyst-v1-12.png" alt="" className="w-12 h-12 rounded-2xl object-contain bg-[var(--md-surface-variant)] p-1.5 shrink-0" />
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
        <p className="text-sm text-[var(--md-on-surface-variant)] truncate mt-0.5">{c.preview}</p>
      </div>
    </motion.div>
  );
}
