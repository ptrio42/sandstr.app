import React from 'react';
import {
  User, List, Bookmark, Mail, Waypoints, Server, Shield, Lock, Key, Settings, Languages, Trash2,
} from 'lucide-react';
import { Avatar } from './Avatar';
import '../amethyst-v1-12.theme.css';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSettings: () => void;
}

type Action = 'profile' | 'bookmarks' | 'relays' | 'security' | 'preferences' | 'close';

// Real Amethyst account drawer (verified vs shots/drawer.png): banner + avatar +
// username + "Update your status" + "N Following · -- Followers", then the account menu.
const MENU: { label: string; Icon: React.ComponentType<{ className?: string }>; action: Action; value?: string; accent?: boolean }[] = [
  { label: 'Profile', Icon: User, action: 'profile', accent: true },
  { label: 'My Lists', Icon: List, action: 'close' },
  { label: 'Bookmarks', Icon: Bookmark, action: 'bookmarks' },
  { label: 'Drafts', Icon: Mail, action: 'close' },
  { label: 'Relays', Icon: Waypoints, action: 'relays', value: '528/1806' },
  { label: 'Media Servers', Icon: Server, action: 'close' },
  { label: 'Security Filters', Icon: Shield, action: 'security' },
  { label: 'Privacy Options', Icon: Lock, action: 'close' },
  { label: 'Backup Keys', Icon: Key, action: 'close' },
  { label: 'App Preferences', Icon: Settings, action: 'preferences' },
  { label: 'User Preferences', Icon: Languages, action: 'close' },
];

export function Drawer({ isOpen, onClose, onTabChange, onOpenSettings }: DrawerProps) {
  const handle = (action: Action) => {
    if (action === 'preferences') onOpenSettings();
    else if (action !== 'close') onTabChange(action);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <>
      {/* Above the bottom nav (z-index 100), as in the real app: at z-55/56 the
          nav painted over the drawer and swallowed the taps on its last two
          items ("App Preferences", "User Preferences"). */}
      <div className="absolute inset-0 bg-black/50 z-[110]" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-[86%] max-w-[300px] bg-[var(--md-surface)] z-[120] overflow-y-auto shadow-2xl" data-tour="amethyst-drawer">
            {/* Account header */}
            <div className="h-28 bg-gradient-to-br from-[#3a1d6e] via-[#7b2ff7] to-[#c026d3]" />
            <div className="px-4 -mt-8 pb-3 border-b border-[var(--md-outline-variant)]">
              <Avatar seed="sandy" className="w-16 h-16 border-2 border-[var(--md-surface)]" />
              <p className="font-bold text-lg text-[var(--md-on-surface)] mt-2">sandy</p>

              {/* Update your status */}
              <div className="mt-2 relative rounded-xl border border-[var(--md-outline)] px-3 py-2.5 flex items-center gap-2">
                <span className="absolute -top-2 left-2 px-1 text-[11px] bg-[var(--md-surface)] text-[var(--md-on-surface-variant)]">Update your status</span>
                <span className="flex-1 min-w-0 truncate text-sm text-[var(--md-on-surface)]">Building nostr stuff… 🧑‍💻</span>
                <Trash2 className="w-4 h-4 text-[var(--md-on-surface-variant)] shrink-0" />
              </div>

              <p className="mt-3 text-[15px]">
                <span className="font-bold text-[var(--md-on-surface)]">2374</span>{' '}
                <span className="text-[var(--md-on-surface-variant)]">Following</span>
                <span className="text-[var(--md-on-surface-variant)] mx-2">·</span>
                <span className="font-bold text-[var(--md-on-surface)]">--</span>{' '}
                <span className="text-[var(--md-on-surface-variant)]">Followers</span>
              </p>
            </div>

            {/* Account menu */}
            <div className="py-1">
              {MENU.map((m) => (
                <button
                  key={m.label}
                  onClick={() => handle(m.action)}
                  className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-[var(--md-surface-variant)]/50 transition-colors"
                  data-tour={`amethyst-drawer-${m.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <m.Icon className={`w-6 h-6 shrink-0 ${m.accent ? 'text-[var(--md-primary)]' : 'text-[var(--md-on-surface)]'}`} />
                  <span className="flex-1 text-[var(--md-on-surface)]">{m.label}</span>
                  {m.value && <span className="text-sm text-[var(--md-on-surface-variant)]">{m.value}</span>}
                </button>
              ))}
            </div>
      </div>
    </>
  );
}
