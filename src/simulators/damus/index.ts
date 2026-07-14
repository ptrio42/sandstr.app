/**
 * Damus Simulator — iOS Nostr client reproduction
 *
 * Reference-verified reproduction (recording in docs/refs/damus/shots + damus-io/damus
 * source; see docs/refs/damus/screen-map.md). UI-only, mock data, no real Nostr protocol.
 */

// Main Simulator
export { DamusSimulator } from './DamusSimulator';
export type { DamusScreen, DamusSimulatorCommand } from './DamusSimulator';

// Components
export { Avatar } from './components/Avatar';
export { TabBar } from './components/TabBar';
export { NoteCard } from './components/NoteCard';
export { DamusLogo } from './components/DamusLogo';

// Theme
import './damus.theme.css';
import '../../components/tour/tour.css';
