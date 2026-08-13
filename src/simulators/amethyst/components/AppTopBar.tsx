import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Avatar } from './Avatar';
import '../amethyst.theme.css';

interface AppTopBarProps {
  onOpenDrawer?: () => void;
  /** Center content: the feed selector on Home, the Amethyst logo on Messages, etc. */
  center: React.ReactNode;
}

// Amethyst's persistent top app bar. Verified against the v1.13.1-fdroid
// recording AND upstream `UserDrawerSearchTopBar.kt`, which agree: account
// avatar on the left (opens the drawer), a context-dependent center, and a
// SEARCH magnifier on the right, tinted with the muted `placeholderText` grey.
// The "16/16 + relay graph" we shipped through v1.12.6 came from an old promo
// screenshot that already disagreed with that release's own source — the frozen
// amethyst-v1-12 archive keeps it; the live version does not.
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

      {/* RIGHT: search (upstream navigates to Route.Search) */}
      <button
        type="button"
        aria-label="Search"
        data-tour="amethyst-topbar-search"
        className="md-app-bar-icon-btn"
      >
        <Search className="w-[22px] h-[22px] text-[var(--md-on-surface-variant)]" />
      </button>
    </div>
  );
}
