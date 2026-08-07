/**
 * Nostr Client Simulators
 *
 * A collection of interactive client simulators for learning Nostr.
 * Each simulator recreates the UI and basic interactions of popular Nostr clients.
 *
 * Namespaced on purpose. Every client barrel exports the same handful of names
 * (`TabId`, `NoteCard`, `Avatar`, `LoginScreen`, `ComposeScreen`,
 * `SimulatorCommand`, …), so a flat `export * from './<client>'` made 12 of them
 * ambiguous — and ESM drops ambiguous star re-exports entirely, i.e. those names
 * were unreachable through this barrel at runtime, not just to the compiler.
 * `export * as <client>` keeps every symbol reachable with no name collisions.
 *
 * NOTE: nothing in `src/` imports this file — the registry (`src/registry.tsx`)
 * lazy-imports each simulator directly. It is also stale (Wisp, Nostur, Keychat
 * and Nostr Kitten have no entry). Kept as the public surface of the module; if
 * it stays unused, deleting it is fine.
 */

// Amethyst - Android Nostr Client with Material Design 3
export * as amethyst from './amethyst';

// Damus - iOS Nostr Client
export * as damus from './damus';

// YakiHonne - Cross-platform Nostr client with Bitcoin/Lightning integration
export * as yakihonne from './yakihonne';

// Snort - Web Nostr Client
export * as snort from './snort';

// Primal - Discovery-focused Nostr client with Web & Mobile variants
export * as primal from './primal';

// Desktop simulators
export * as coracle from './coracle';
export * as gossip from './gossip';

// Shared utilities and types
export * from './shared';
