import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import { Avatar } from './Avatar';
import '../amethyst.theme.css';

interface AppTopBarProps {
  onOpenDrawer?: () => void;
  /**
   * Pops this screen. Upstream `TopBarNavigationIcon` puts a back arrow in the
   * leading slot INSTEAD of the account avatar whenever `nav.canPop()` — i.e.
   * on every screen that was pushed rather than selected in the bottom bar.
   * Passing this swaps the slot the same way.
   */
  onBack?: () => void;
  /** Opens the Search screen (upstream: `nav.nav(Route.Search)` from this bar). */
  onOpenSearch?: () => void;
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
export function AppTopBar({ onOpenDrawer, onBack, onOpenSearch, center }: AppTopBarProps) {
  return (
    <div className="md-app-bar md-app-bar-enhanced">
      {/* LEFT: back arrow on a pushed screen, otherwise the account avatar that
          opens the drawer (`TopBarNavigationIcon` → ArrowBackIcon /
          LoggedInUserPictureDrawer). */}
      {onBack ? (
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          onClick={onBack}
          aria-label="Back"
          className="md-app-bar-icon-btn"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--md-on-surface)]" />
        </motion.button>
      ) : (
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
      )}

      {/* CENTER: varies per screen */}
      <div className="flex-1 flex items-center justify-center relative">{center}</div>

      {/* RIGHT: search — `IconButton(onClick = { nav.nav(Route.Search) })` */}
      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Search"
        data-tour="amethyst-topbar-search"
        className="md-app-bar-icon-btn"
      >
        {/* tint = placeholderText (onSurface @42%), per UserDrawerSearchTopBar.kt */}
        <Search className="w-[22px] h-[22px] text-[var(--amethyst-placeholder)]" />
      </button>
    </div>
  );
}
