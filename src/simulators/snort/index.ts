/**
 * Snort Simulator — a reference-verified reproduction of the Snort web client.
 *
 * Spec: `docs/refs/snort/screen-map.md` (the owner's 2026-07-14 recording read
 * together with `v0l/snort@3cc8317`).
 *
 * @module simulators/snort
 */

// Main simulator
export { SnortSimulator } from './SnortSimulator';
export type { SnortScreen, SimulatorCommand } from './SnortSimulator';

// Screens
export { TimelineScreen } from './screens/TimelineScreen';
export { ThreadScreen } from './screens/ThreadScreen';
export { ProfileScreen } from './screens/ProfileScreen';
export { NotificationsScreen } from './screens/NotificationsScreen';
export { MessagesScreen } from './screens/MessagesScreen';
export { DiscoverScreen } from './screens/DiscoverScreen';
export { SearchScreen } from './screens/SearchScreen';
export { RelaysScreen } from './screens/RelaysScreen';
export { SettingsScreen } from './screens/SettingsScreen';
export { ComposeScreen } from './screens/ComposeScreen';
export { LoginScreen } from './screens/LoginScreen';

// Components
export { NoteCard } from './components/NoteCard';
export { RightColumn } from './components/RightColumn';
export { Avatar } from './components/Avatar';
export { Icon } from './components/Icon';
export { CodeBlock } from './components/CodeBlock';
export { MediaEmbed } from './components/MediaEmbed';

// Hooks
export { useKeyboardShortcuts, useModalShortcuts } from './hooks/useKeyboardShortcuts';

// Theme
import './snort.theme.css';
import '../../components/tour/tour.css';
