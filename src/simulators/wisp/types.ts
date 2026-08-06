/**
 * Shared contracts between the Wisp shell (WispSimulator.tsx) and its screens.
 * Screens are built against these interfaces — keep them stable.
 */

import type { MockNote, MockUser } from '../../data/mock';

export type WispTab = 'home' | 'wallet' | 'search' | 'messages' | 'notifications';

export type WispSettingsScreen = 'interface' | 'relays' | 'keys' | 'social-graph';

/** Tour command contract (CLAUDE.md: non-negotiable interface shape). */
export interface SimulatorCommand {
  type:
    | 'login'
    | 'navigate'
    | 'compose'
    | 'post'
    | 'viewProfile'
    | 'openSettings'
    | 'openDrawer'
    | 'openThread'
    | 'zap'
    | 'back';
  payload?: any;
}

export interface WispSimulatorProps {
  className?: string;
  tourCommand?: SimulatorCommand | null;
  onCommandHandled?: () => void;
}

/** Common navigation callbacks handed down to screens. */
export interface WispNavHandlers {
  onOpenThread: (note: MockNote) => void;
  onOpenProfile: (user: MockUser) => void;
  onZap: (note: MockNote | null, author: MockUser) => void;
  onReply: (note: MockNote) => void;
}

export interface LoginScreenProps {
  onLogin: (user: MockUser) => void;
}

export interface FeedScreenProps extends WispNavHandlers {
  currentUser: MockUser;
  onOpenDrawer: () => void;
  onCompose: () => void;
  registerAction?: (a: string) => void;
}

export interface ThreadScreenProps extends WispNavHandlers {
  note: MockNote;
  author: MockUser;
  onBack: () => void;
  registerAction?: (a: string) => void;
}

export interface ProfileScreenProps extends WispNavHandlers {
  user: MockUser;
  isOwn: boolean;
  onBack: () => void;
  registerAction?: (a: string) => void;
}

export interface NotificationsScreenProps extends WispNavHandlers {
  currentUser: MockUser;
}

export interface MessagesScreenProps {
  currentUser: MockUser;
  onOpenProfile: (user: MockUser) => void;
  /** Report when a conversation is open (the real app hides the bottom bar there). */
  onImmersiveChange: (immersive: boolean) => void;
}

export interface WalletScreenProps {
  currentUser: MockUser;
}

export interface SearchScreenProps extends WispNavHandlers {}

export interface ComposeScreenProps {
  currentUser: MockUser;
  replyTo?: { note: MockNote; author: MockUser } | null;
  onClose: () => void;
  onPublish: (content: string) => void;
}

export interface ZapDialogProps {
  author: MockUser;
  note?: MockNote | null;
  onClose: () => void;
  onZap: (amountSats: number) => void;
}

export type DrawerDestination =
  | 'profile'
  | 'feeds'
  | 'search'
  | 'messages'
  | 'wallet'
  | 'lists'
  | 'drafts'
  | WispSettingsScreen
  | 'logout';

export interface DrawerProps {
  open: boolean;
  user: MockUser;
  theme: 'light' | 'dark';
  onToggleTheme?: () => void;
  onClose: () => void;
  onNavigate: (dest: DrawerDestination) => void;
}

export interface SettingsScreenBaseProps {
  onBack: () => void;
}
