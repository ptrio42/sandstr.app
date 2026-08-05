/**
 * Simulator Configurations
 * Pre-defined configurations for all Nostr client simulators
 */

import { SimulatorClient, SimulatorFeature, SimulatorView } from './types';
import type { SimulatorConfig } from './types';

/**
 * Damus - iOS Nostr client
 * Clean, minimalist design with purple accent
 */
export const damusConfig: SimulatorConfig = {
  id: SimulatorClient.DAMUS,
  name: 'Damus',
  description: 'The Nostr client for iOS. Clean, fast, and private.',
  platform: 'ios',
  primaryColor: '#CC43C5', // DamusPurple (real brand accent)
  secondaryColor: '#F869B6', // PinkGradient stop 2
  icon: '/icons/damus.webp',
  supportedFeatures: [
    SimulatorFeature.DM,
    SimulatorFeature.ZAPS,
    SimulatorFeature.THREADS,
    SimulatorFeature.SEARCH,
    SimulatorFeature.RELAYS,
    SimulatorFeature.BADGES,
    SimulatorFeature.NIP05,
    SimulatorFeature.MUTE_LIST,
    SimulatorFeature.PINNED_NOTES,
  ],
  defaultView: SimulatorView.FEED,
};

/**
 * Amethyst - Android Nostr client
 * Material Design with deep purple theme
 */
export const amethystConfig: SimulatorConfig = {
  id: SimulatorClient.AMETHYST,
  name: 'Amethyst',
  description: 'Android Nostr client with rich features and modern design.',
  platform: 'android',
  primaryColor: '#6B21A8', // Deep purple - Amethyst brand color
  secondaryColor: '#A855F7', // Light purple
  icon: '/icons/amethyst.png',
  supportedFeatures: [
    SimulatorFeature.DM,
    SimulatorFeature.ZAPS,
    SimulatorFeature.THREADS,
    SimulatorFeature.SEARCH,
    SimulatorFeature.RELAYS,
    SimulatorFeature.BADGES,
    SimulatorFeature.NIP05,
    SimulatorFeature.LONG_FORM,
    SimulatorFeature.LIVE_STREAMING,
    SimulatorFeature.MUTE_LIST,
    SimulatorFeature.PINNED_NOTES,
  ],
  defaultView: SimulatorView.FEED,
};

/**
 * Primal - Web & Mobile Nostr client
 * Blue-accented (Midnight/Ice), NOT orange (see docs/FIDELITY.md / ground truth)
 */
export const primalConfig: SimulatorConfig = {
  id: SimulatorClient.PRIMAL,
  name: 'Primal',
  description: 'Fast, modern Nostr client with excellent UX.',
  platform: 'web',
  primaryColor: '#2394EF', // Primal brand blue (--accent, Midnight/Ice)
  secondaryColor: '#14B9FF', // signature gradient cyan (#14B9FF→#690DFF)
  icon: '/icons/primal.webp',
  supportedFeatures: [
    SimulatorFeature.DM,
    SimulatorFeature.ZAPS,
    SimulatorFeature.THREADS,
    SimulatorFeature.SEARCH,
    SimulatorFeature.RELAYS,
    SimulatorFeature.BADGES,
    SimulatorFeature.NIP05,
    SimulatorFeature.LONG_FORM,
    SimulatorFeature.MARKETPLACE,
    SimulatorFeature.MUTE_LIST,
    SimulatorFeature.PINNED_NOTES,
  ],
  defaultView: SimulatorView.FEED,
};

/**
 * Snort - Web Nostr client
 *
 * Brand swatch = the stops of `--snort-gradient`, the one gradient the client
 * actually names after itself (`packages/app/src/index.css`; see
 * docs/refs/snort/screen-map.md §1). The previous `#7C3AED`/`#8B5CF6` was
 * invented and matched nothing upstream.
 *
 * Note the two real accents COEXIST and are deliberately not merged here: the
 * violet `--highlight` (#ac88ff dark / #7139f1 light) carries links and unread
 * state, while `--primary` #ff3f15 is the orange-red CTA. The gradient below is
 * the brand mark; the working tokens live in `snort.theme.css`.
 */
export const snortConfig: SimulatorConfig = {
  id: SimulatorClient.SNORT,
  name: 'Snort',
  description: 'Simple, fast web Nostr client.',
  platform: 'web',
  primaryColor: '#a178ff', // --snort-gradient stop 1 (violet)
  secondaryColor: '#ff6baf', // --snort-gradient stop 2 (pink)
  icon: '/icons/snort.webp',
  supportedFeatures: [
    SimulatorFeature.DM,
    SimulatorFeature.ZAPS,
    SimulatorFeature.THREADS,
    SimulatorFeature.SEARCH,
    SimulatorFeature.RELAYS,
    SimulatorFeature.NIP05,
    SimulatorFeature.MUTE_LIST,
  ],
  defaultView: SimulatorView.FEED,
};

/**
 * YakiHonne - Mobile-first Nostr client
 * Long-form-first client with purple/violet accents
 */
export const yakihonneConfig: SimulatorConfig = {
  id: SimulatorClient.YAKIHONNE,
  name: 'YakiHonne',
  description: 'Article-centric mobile Nostr client with wallet, curations & smart widgets.',
  platform: 'ios',
  primaryColor: '#EE7700', // Orange — real YakiHonne default accent (kMainColor). Purple is only the logo/app-icon.
  secondaryColor: '#86318C',
  icon: '/icons/yakihonne.svg',
  supportedFeatures: [
    SimulatorFeature.DM,
    SimulatorFeature.ZAPS,
    SimulatorFeature.THREADS,
    SimulatorFeature.SEARCH,
    SimulatorFeature.RELAYS,
    SimulatorFeature.BADGES,
    SimulatorFeature.NIP05,
    SimulatorFeature.LONG_FORM,
    SimulatorFeature.MUTE_LIST,
    SimulatorFeature.PINNED_NOTES,
  ],
  defaultView: SimulatorView.FEED,
};

/**
 * Coracle - Web Nostr client
 * Simple, accessible, beginner-friendly web interface
 */
export const coracleConfig: SimulatorConfig = {
  id: SimulatorClient.CORACLE,
  name: 'Coracle',
  description: 'Simple, accessible web Nostr client perfect for beginners.',
  platform: 'web',
  primaryColor: '#6366F1', // Indigo
  secondaryColor: '#818CF8',
  icon: '/icons/coracle.webp',
  supportedFeatures: [
    SimulatorFeature.DM,
    SimulatorFeature.ZAPS,
    SimulatorFeature.THREADS,
    SimulatorFeature.SEARCH,
    SimulatorFeature.RELAYS,
    SimulatorFeature.BADGES,
    SimulatorFeature.NIP05,
    SimulatorFeature.MUTE_LIST,
    SimulatorFeature.PINNED_NOTES,
  ],
  defaultView: SimulatorView.FEED,
};

/**
 * Gossip - Desktop Nostr client
 * Developer-focused with advanced relay management
 */
export const gossipConfig: SimulatorConfig = {
  id: SimulatorClient.GOSSIP,
  name: 'Gossip',
  description: 'Powerful desktop client with advanced relay features.',
  platform: 'desktop',
  primaryColor: '#22C55E', // Green
  secondaryColor: '#4ADE80',
  icon: '/icons/gossip.png',
  supportedFeatures: [
    SimulatorFeature.DM,
    SimulatorFeature.ZAPS,
    SimulatorFeature.THREADS,
    SimulatorFeature.SEARCH,
    SimulatorFeature.RELAYS,
    SimulatorFeature.NIP05,
    SimulatorFeature.MUTE_LIST,
  ],
  defaultView: SimulatorView.FEED,
};

/**
 * Keychat - Android Super App
 * Bitcoin wallet + Secure chat + Mini apps
 */
export const keychatConfig: SimulatorConfig = {
  id: SimulatorClient.KEYCHAT,
  name: 'Keychat',
  description: 'Super app for Bitcoiners with sovereign identity, ecash wallet, and secure chat.',
  platform: 'android',
  primaryColor: '#2D7FF9', // Bright blue
  secondaryColor: '#1E40AF', // Dark blue
  icon: '/icons/keychat.svg',
  supportedFeatures: [
    SimulatorFeature.DM,
    SimulatorFeature.ZAPS,
    SimulatorFeature.SEARCH,
    SimulatorFeature.BADGES,
    SimulatorFeature.NIP05,
    SimulatorFeature.MUTE_LIST,
  ],
  defaultView: SimulatorView.MESSAGES,
};

/**
 * Wisp - Android Nostr client
 * "a wee interface to scroll posts" — outbox-model client by Barry Deen.
 * Colors from docs/refs/wisp/screen-map.md: accent #FF9800 (Theme.kt "custom"
 * default), secondary = the brand-glyph radial stop #E97941 (ic_wisp_logo.xml).
 */
export const wispConfig: SimulatorConfig = {
  id: SimulatorClient.WISP,
  name: 'Wisp',
  description: 'Minimal, fast Android client with the outbox relay model, embedded Spark wallet, and an undo countdown on every post.',
  platform: 'android',
  primaryColor: '#FF9800', // real accent (Theme.kt / InterfacePreferences.kt default)
  secondaryColor: '#E97941', // logo radial-gradient stop
  icon: '/icons/wisp.svg',
  supportedFeatures: [
    SimulatorFeature.DM,
    SimulatorFeature.ZAPS,
    SimulatorFeature.THREADS,
    SimulatorFeature.SEARCH,
    SimulatorFeature.RELAYS,
    SimulatorFeature.NIP05,
    SimulatorFeature.LIVE_STREAMING,
    SimulatorFeature.MUTE_LIST,
  ],
  defaultView: SimulatorView.FEED,
};

/**
 * All simulator configs collection
 */
export const allSimulatorConfigs: Record<SimulatorClient, SimulatorConfig> = {
  [SimulatorClient.DAMUS]: damusConfig,
  [SimulatorClient.AMETHYST]: amethystConfig,
  [SimulatorClient.PRIMAL]: primalConfig,
  [SimulatorClient.SNORT]: snortConfig,
  [SimulatorClient.YAKIHONNE]: yakihonneConfig,
  [SimulatorClient.CORACLE]: coracleConfig,
  [SimulatorClient.GOSSIP]: gossipConfig,
  [SimulatorClient.KEYCHAT]: keychatConfig,
  [SimulatorClient.WISP]: wispConfig,
};

/**
 * Get config by client ID
 */
export function getSimulatorConfig(client: SimulatorClient): SimulatorConfig {
  return allSimulatorConfigs[client];
}

/**
 * Get all configs as array
 */
export function getAllSimulatorConfigs(): SimulatorConfig[] {
  return Object.values(allSimulatorConfigs);
}

/**
 * Get configs by platform
 */
export function getConfigsByPlatform(platform: SimulatorConfig['platform']): SimulatorConfig[] {
  return Object.values(allSimulatorConfigs).filter(config => config.platform === platform);
}

/**
 * Get config by name (case insensitive)
 */
export function getConfigByName(name: string): SimulatorConfig | undefined {
  const lowerName = name.toLowerCase();
  return Object.values(allSimulatorConfigs).find(
    config => config.name.toLowerCase() === lowerName
  );
}

export default allSimulatorConfigs;
