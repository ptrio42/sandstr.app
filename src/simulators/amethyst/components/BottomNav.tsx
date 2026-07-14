import React from 'react';
import { motion } from 'framer-motion';
import { Home, Mail, SquarePlay, Globe, Bell } from 'lucide-react';
import '../amethyst.theme.css';

interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  dot?: boolean;
}

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Real Amethyst bottom nav (v1.12.6 screenshot): 5 icon-only destinations,
// no Profile tab (profile is reached via the app-bar avatar → drawer), no text labels.
// ids keep the simulator's existing screen mapping so the guided tour keeps working.
const navItems: BottomNavItem[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-6 h-6" /> },
  { id: 'messages', label: 'Messages', icon: <Mail className="w-6 h-6" /> },
  { id: 'video', label: 'Shorts', icon: <SquarePlay className="w-6 h-6" /> },
  { id: 'search', label: 'Discover', icon: <Globe className="w-6 h-6" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-6 h-6" />, dot: true },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
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
          {activeTab === item.id && (
            <motion.div
              layoutId="bottom-nav-indicator"
              className="md-bottom-nav-indicator"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{
                backgroundColor: activeTab === item.id ? 'var(--md-secondary-container)' : 'transparent',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute w-14 h-8 rounded-full"
              style={{ zIndex: -1 }}
            />
            <div className="relative">
              {item.icon}
              {item.dot && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--md-primary)] ring-2 ring-[var(--md-surface)]" />
              )}
            </div>
          </div>
        </motion.button>
      ))}
    </nav>
  );
}
