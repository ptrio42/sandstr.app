import React from 'react';
import { motion } from 'framer-motion';
import { Home, Mail, Wallet, Globe, Bell } from 'lucide-react';
import '../amethyst.theme.css';

interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  dot?: boolean;
}

// Real Amethyst bottom nav @ v1.13.1. The destination set is upstream's
// `DefaultBottomBarItems` (NavBarItem.kt) verbatim — HOME, MESSAGES, WALLET,
// BROWSER, NOTIFICATIONS — and the reference recording shows exactly that, so
// this is the shipped default and not a customised bar. Shorts and Discover
// moved out of the bar in this release; they live in the drawer's "Navigate"
// section (upstream `DrawerNavigateItems`).
// Icons follow the catalog: Home, Mail, AccountBalanceWallet, Language (globe),
// Notifications. Labels are `route_home`/`route_messages`/`wallet`/`browser`/
// `route_notifications` from strings.xml; the bar itself renders icons only
// (`alwaysShowLabel = false`), so they survive here as accessible names.
// ids keep the simulator's existing screen mapping so the guided tour keeps working.
const navItems: BottomNavItem[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-6 h-6" /> },
  { id: 'messages', label: 'Messages', icon: <Mail className="w-6 h-6" /> },
  { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-6 h-6" /> },
  { id: 'search', label: 'Browser', icon: <Globe className="w-6 h-6" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-6 h-6" />, dot: true },
];

export function BottomNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <nav className="md-bottom-nav safe-area-bottom" data-tour="amethyst-nav">
      {navItems.map((item) => (
        <motion.button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          aria-label={item.label}
          className={`md-bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {/* v1.13.1 uses the stock M3 NavigationBarItem indicator: a filled
              secondaryContainer pill behind the SELECTED icon only. (v1.12.6 had
              no pill — the tint alone carried selection.) Upstream keeps the icon
              tint explicit: `primary` when selected, `onSurface65` when not
              (AppBottomBar.kt:152). */}
          <div className="md-bottom-nav-indicator">
            <div className="relative">
              {item.icon}
              {item.dot && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--md-primary)] ring-2 ring-[var(--md-background)]" />
              )}
            </div>
          </div>
        </motion.button>
      ))}
    </nav>
  );
}
