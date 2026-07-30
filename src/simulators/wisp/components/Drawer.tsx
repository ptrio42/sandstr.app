import React, { useState } from 'react';
import {
  Ban,
  Bug,
  ChevronDown,
  ChevronRight,
  Cloud,
  CreditCard,
  Heart,
  Home,
  KeyRound,
  List,
  LogOut,
  Mail,
  Moon,
  Palette,
  Pencil,
  QrCode,
  Search,
  Settings,
  Share2,
  Shield,
  Smile,
  Sun,
  User,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DrawerDestination, DrawerProps } from '../types';
import { truncNpub } from '../wispData';
import { WispAvatar } from './Avatar';
import { WispLogo } from './WispLogo';

/**
 * Left modal drawer (screen-map §15) — opened by the feed avatar. Rendered in
 * its final state (no slide animation; the preview freezes entry keyframes).
 */

interface NavRow {
  label: string;
  Icon: LucideIcon;
  dest: DrawerDestination;
}

const NAV_ROWS: NavRow[] = [
  { label: 'My Profile', Icon: User, dest: 'profile' },
  { label: 'Feeds', Icon: Home, dest: 'feeds' },
  { label: 'Search', Icon: Search, dest: 'search' },
  { label: 'Messages', Icon: Mail, dest: 'messages' }, // Email envelope, NOT chat bubbles
  { label: 'Wallet', Icon: CreditCard, dest: 'wallet' },
  { label: 'Lists', Icon: List, dest: 'lists' },
  { label: 'Drafts & Scheduled', Icon: Pencil, dest: 'drafts' },
];

interface SettingsRow {
  label: string;
  Icon: LucideIcon;
  /** Built settings screens navigate; unbuilt targets just close the drawer. */
  dest?: DrawerDestination;
}

const SETTINGS_ROWS: SettingsRow[] = [
  { label: 'Interface', Icon: Palette, dest: 'interface' },
  { label: 'Relays', Icon: Settings, dest: 'relays' },
  { label: 'Media Servers', Icon: Cloud },
  { label: 'Keys', Icon: KeyRound, dest: 'keys' },
  { label: 'Safety', Icon: Ban },
  { label: 'Proof of Work', Icon: Shield },
  { label: 'Social Graph', Icon: Share2, dest: 'social-graph' },
  { label: 'Custom Emojis', Icon: Smile },
  { label: 'Relay Health', Icon: Heart },
  { label: 'Console', Icon: Bug },
];

const SECONDARY = 'var(--wisp-on-surface-variant)';

export function Drawer({ open, user, theme, onToggleTheme, onClose, onNavigate }: DrawerProps) {
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  if (!open) return null;

  const ThemeIcon = theme === 'dark' ? Moon : Sun;

  return (
    <div className="absolute inset-0 z-50">
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Panel — final state, no slide-in */}
      <div className="absolute bottom-0 left-0 top-0 flex w-[85%] max-w-[360px] flex-col bg-[var(--wisp-surface)]">
        {/* 1. Header */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            <WispAvatar seed={user.username} className="w-16 h-16" />
            <button
              type="button"
              aria-label="Switch account"
              className="rounded-2xl bg-[var(--wisp-surface-variant)] px-2.5 py-1.5"
            >
              <Users size={16} style={{ color: SECONDARY }} />
            </button>
            <div className="flex-1" />
            <button type="button" aria-label="Toggle theme" onClick={onToggleTheme}>
              <ThemeIcon size={24} style={{ color: SECONDARY }} />
            </button>
            <button type="button" aria-label="Scan QR code">
              <QrCode size={24} style={{ color: SECONDARY }} />
            </button>
          </div>
          <div className="mt-3 text-[16px] font-semibold">{user.displayName}</div>
          <div className="mt-0.5 text-[12px] text-[var(--wisp-on-surface-variant)]">
            {truncNpub(user.pubkey)}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <Pencil size={14} className="opacity-50" style={{ color: SECONDARY }} />
            <span className="text-[12px] italic text-[var(--wisp-on-surface-variant)] opacity-50">
              Set status...
            </span>
          </div>
        </div>

        {/* 2. Nav list */}
        <div className="min-h-0 flex-1 overflow-y-auto py-1">
          {NAV_ROWS.map(({ label, Icon, dest }) => (
            <button
              key={dest}
              type="button"
              className="flex h-12 w-full items-center gap-4 px-3 text-left"
              onClick={() => onNavigate(dest)}
            >
              <Icon size={24} style={{ color: SECONDARY }} />
              <span className="text-[15px]">{label}</span>
            </button>
          ))}

          {/* Settings — inline-expanding subtree */}
          <button
            type="button"
            data-tour="wisp-settings"
            className="flex h-12 w-full items-center gap-4 px-3 text-left"
            onClick={() => setSettingsExpanded((v) => !v)}
          >
            <Settings size={24} style={{ color: SECONDARY }} />
            <span className="flex-1 text-[15px]">Settings</span>
            {settingsExpanded ? (
              <ChevronDown size={20} style={{ color: SECONDARY }} />
            ) : (
              <ChevronRight size={20} style={{ color: SECONDARY }} />
            )}
          </button>
          {settingsExpanded &&
            SETTINGS_ROWS.map(({ label, Icon, dest }) => (
              <button
                key={label}
                type="button"
                className="flex h-12 w-full items-center gap-4 pl-9 pr-3 text-left"
                onClick={() => (dest ? onNavigate(dest) : onClose())}
              >
                <Icon size={24} style={{ color: SECONDARY }} />
                <span className="text-[15px]">{label}</span>
              </button>
            ))}
        </div>

        {/* 3. Logout */}
        <div className="h-4" />
        <button
          type="button"
          className="flex h-12 w-full items-center gap-4 px-3 text-left"
          style={{ color: 'var(--wisp-error)' }}
          onClick={() => onNavigate('logout')}
        >
          <LogOut size={24} />
          <span className="text-[15px]">Logout</span>
        </button>

        {/* 4. Footer */}
        <div className="flex items-center justify-center gap-1.5 pb-4 opacity-30">
          <WispLogo size={16} tint="var(--wisp-on-surface-variant)" />
          <span className="text-[11px] text-[var(--wisp-on-surface-variant)]">wisp v1.2.1</span>
        </div>
      </div>
    </div>
  );
}
