import React from 'react';
import { motion } from 'framer-motion';
import { Waypoints } from 'lucide-react';
import { Avatar } from './Avatar';
import '../amethyst-v1-12.theme.css';

interface AppTopBarProps {
  onOpenDrawer?: () => void;
  /** Center content: the feed selector on Home, the Amethyst logo on Messages, etc. */
  center: React.ReactNode;
}

// Amethyst's persistent top app bar (verified across home/messages/notifications
// screenshots @ v1.12.6): account avatar on the left (opens the drawer), a
// context-dependent center, and a relay counter + relay-graph icon on the right.
export function AppTopBar({ onOpenDrawer, center }: AppTopBarProps) {
  return (
    <div className="md-app-bar md-app-bar-enhanced">
      {/* LEFT: account avatar opens the drawer (real app: LoggedInUserPictureDrawer) */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        onClick={onOpenDrawer}
        aria-label="Open account drawer"
        data-tour="amethyst-profile-avatar"
        className="md-app-bar-icon-btn"
      >
        <Avatar seed="sandy" className="w-9 h-9 ring-1 ring-[var(--md-outline-variant)]" />
      </motion.button>

      {/* CENTER: varies per screen */}
      <div className="flex-1 flex items-center justify-center relative">{center}</div>

      {/* RIGHT: relay counter + relay-graph icon */}
      <div className="flex items-center gap-1.5 pr-1">
        <span className="text-sm font-medium text-[var(--md-on-surface-variant)]">16/16</span>
        <Waypoints className="w-5 h-5 text-[var(--md-primary)]" />
      </div>
    </div>
  );
}
