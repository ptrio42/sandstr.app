import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Plus, Play, Zap, BadgeCheck } from 'lucide-react';
import { AppTopBar } from '../components/AppTopBar';
import { Avatar } from '../components/Avatar';
import '../amethyst.theme.css';

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

// Real Amethyst Messages ("Known" tab), modelled on the v1.12.6 screenshot:
// public chats + DMs, name + @handle, a play affordance, and "• time".
const conversations: Convo[] = [
  { id: 'nostr', name: 'Nostr', tag: 'Public Chat', group: true, time: '1h', preview: '⚡JOLT⚡: Genuinely curious if anyone …' },
  { id: 'amethyst', name: 'Amethyst Users', tag: 'Public Chat', group: true, logo: true, time: '1h', preview: '⚡JOLT⚡: Genuinely curious if anyone …' },
  { id: 'karrot', name: 'Karrot', handle: '@karrot', verified: true, time: '3h', preview: 'They usually go after hosts, but in amethyst…' },
  { id: 'neo', name: 'Neonwarden', handle: '@wallet.example', zap: true, time: '13h', preview: "It's gone now." },
  { id: 'btcmil', name: 'Btcmilhao', handle: '@Lodki', time: '15h', preview: 'Então tem algo errado na configuração do …' },
  { id: 'violet', name: 'Violet Volt', verified: true, time: '15h', preview: '#Amethyst v0.62.8: More Performance…' },
  { id: 'dbth', name: "Don't Believe the Hype 🦊", handle: '@dontb…', time: '21h', preview: 'Because it might happen that the melt take…' },
  { id: 'jolt', name: '⚡JOLT⚡', handle: '@HalfChargedKing', time: '2d', preview: 'Can you please report this for impersonatio…' },
  { id: 'mvl', name: 'Marta Vellin', handle: '@mvellin', time: '3d', preview: "Let me know when it's a good time for…" },
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

export function MessagesScreen({ onOpenDrawer }: MessagesScreenProps) {
  const [tab, setTab] = useState<'known' | 'requests'>('known');

  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]">
      <AppTopBar
        onOpenDrawer={onOpenDrawer}
        center={<img src="/icons/amethyst.png" alt="Amethyst" className="w-8 h-8 object-contain" />}
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
        <p className="text-sm text-[var(--md-on-surface-variant)] truncate mt-0.5">{c.preview}</p>
      </div>
    </motion.div>
  );
}
