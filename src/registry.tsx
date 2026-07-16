import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { allSimulatorConfigs } from './simulators/shared/configs';
import type { SimulatorConfig } from './simulators/shared/types';

export type Frame = 'ios' | 'android' | null;

type Loader = () => Promise<{ default: ComponentType<any> }>;

export interface ClientEntry {
  id: string;
  name: string;
  description: string;
  platform: SimulatorConfig['platform'];
  primaryColor: string;
  secondaryColor?: string;
  icon?: string; // path under /public
  emoji?: string; // fallback when no icon file
  features: string[];
  frame: Frame;
  hasTour: boolean;
  /** highlighted as a lead/flagship in the audit (Snort, Amethyst, Nostr Kitten, YakiHonne) */
  lead?: boolean;
  className?: string;
  Component: LazyExoticComponent<ComponentType<any>>;
  /**
   * Warms the lazy chunk ahead of navigation (idempotent). Shares the exact
   * loader reference `Component` was built from, so `preload()` and the later
   * lazy render resolve the identical Vite chunk — the in-place switch lands
   * without the Suspense fallback flashing.
   */
  preload: () => Promise<unknown>;
}

/** Fire a loader at most once; later calls return the same in-flight/settled promise. */
function once(fn: Loader): () => Promise<unknown> {
  let p: Promise<unknown> | undefined;
  return () => (p ??= fn());
}

// How each simulator is mounted, mirroring the original Astro pages exactly:
// mobile clients (ios/android) render inside MobilePhoneFrame; web/desktop render direct.
// *WithTour wrappers are default exports; bare simulators are named exports.
const MOUNTS: Record<string, { frame: Frame; tour: boolean; className?: string; load: Loader }> = {
  damus: { frame: 'ios', tour: true, load: () => import('./simulators/damus/DamusSimulatorWithTour') },
  amethyst: { frame: 'android', tour: true, load: () => import('./simulators/amethyst/AmethystSimulatorWithTour') },
  keychat: { frame: 'android', tour: true, load: () => import('./simulators/keychat/KeychatSimulatorWithTour') },
  olas: { frame: 'ios', tour: true, load: () => import('./simulators/olas/OlasSimulatorWithTour') },
  yakihonne: { frame: 'ios', tour: true, load: () => import('./simulators/yakihonne/YakiHonneSimulatorWithTour') },
  snort: { frame: null, tour: true, load: () => import('./simulators/snort/SnortSimulatorWithTour') },
  primal: { frame: null, tour: true, load: () => import('./simulators/primal/PrimalWebSimulatorWithTour') },
  coracle: {
    frame: null,
    tour: false,
    load: () => import('./simulators/coracle').then((m) => ({ default: m.CoracleSimulator })),
  },
  gossip: {
    frame: null,
    tour: false,
    load: () => import('./simulators/gossip').then((m) => ({ default: m.GossipSimulator })),
  },
};

// The audit's lead simulators, ordered strongest-first.
const LEADS = new Set(['snort', 'amethyst', 'nostr-kitten', 'yakihonne']);

// Nostr Kitten is an ORIGINAL, trademark-safe client (not in the shared configs).
const kittenLoad: Loader = () =>
  import('./simulators/nostr-kitten/NostrKittenSimulator').then((m) => ({ default: m.NostrKittenSimulator }));

const nostrKitten: ClientEntry = {
  id: 'nostr-kitten',
  name: 'Nostr Kitten',
  description: 'An original, 90s-GeoCities-style Nostr client. Pure vibes, zero trademark.',
  platform: 'web',
  primaryColor: '#FF00CC',
  emoji: '🐱',
  features: ['Guestbook', 'MIDI', 'Webring'],
  frame: null,
  hasTour: false,
  lead: true,
  className: 'h-full',
  Component: lazy(kittenLoad),
  preload: once(kittenLoad),
};

const branded: ClientEntry[] = Object.values(allSimulatorConfigs).map((cfg) => {
  const mount = MOUNTS[cfg.id];
  return {
    id: cfg.id,
    name: cfg.name,
    description: cfg.description,
    platform: cfg.platform,
    primaryColor: cfg.primaryColor,
    secondaryColor: cfg.secondaryColor,
    icon: cfg.icon,
    features: (cfg.supportedFeatures ?? []).map((f) => String(f).replace(/_/g, ' ')),
    frame: mount.frame,
    hasTour: mount.tour,
    lead: LEADS.has(cfg.id),
    className: mount.className,
    Component: lazy(mount.load),
    preload: once(mount.load),
  } satisfies ClientEntry;
});

// Leads first (audit order), then the rest.
export const clients: ClientEntry[] = [nostrKitten, ...branded].sort((a, b) => {
  if (!!a.lead === !!b.lead) return 0;
  return a.lead ? -1 : 1;
});

export function getClient(id: string | undefined): ClientEntry | undefined {
  return clients.find((c) => c.id === id);
}
