import type { MockNote, MockUser } from '../../data/mock';

/** Bottom tab bar — MainTabs15 (the shape the recording shows). */
export type NosturTab = 'home' | 'bookmarks' | 'search' | 'notifications' | 'messages';

/** Home sub-tabs. The recording shows exactly these three; see screen-map §6. */
export type NosturFeed = 'Following' | 'Discover' | 'Explore';

/** Notification sub-tabs (NotificationsScreen.swift). */
export type NosturNotifTab =
  | 'Mentions'
  | 'New Posts'
  | 'Reactions'
  | 'Reposts'
  | 'Zaps'
  | 'Followers';

export type NosturSettingsScreen =
  | 'root'
  | 'appearance'
  | 'zaps'
  | 'relays'
  | 'spam'
  | 'feeds'
  | 'badges';

export type DrawerDestination =
  | 'profile'
  | 'feeds'
  | 'bookmarks'
  | 'badges'
  | 'settings'
  | 'blocklist'
  | 'signer';

/**
 * The tour command contract. Repo-wide and non-negotiable (CLAUDE.md): the
 * wrapper feeds `tourCommand` in and the simulator calls `onCommandHandled`.
 */
export interface SimulatorCommand {
  type:
    | 'login'
    | 'logout'
    | 'navigate'
    | 'openFeed'
    | 'openThread'
    | 'viewProfile'
    | 'compose'
    | 'zap'
    | 'openDrawer'
    | 'openSettings'
    | 'lowData';
  payload?: string;
}

export interface NosturSimulatorProps {
  className?: string;
  tourCommand?: SimulatorCommand | null;
  onCommandHandled?: () => void;
}

export interface AuthoredNote {
  note: MockNote;
  author: MockUser;
}
