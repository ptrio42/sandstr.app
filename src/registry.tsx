import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { allSimulatorConfigs } from './simulators/shared/configs';
import type { SimulatorConfig } from './simulators/shared/types';

export type Frame = 'ios' | 'android' | null;

/**
 * The readiness axis. It exists so the gallery never presents an early sketch
 * as a finished reproduction — honesty about state is part of the trademark
 * mitigation AND the grant story ("4 faithful reproductions plus 5 in
 * progress" beats "10 clients, half rough").
 * - 'ready'   — reference-verified against the real client (screen-map + shots)
 * - 'preview' — clickable, but fidelity not yet verified; labelled as such
 * - 'planned' — not clickable yet ("coming soon"); no entry uses it today
 */
export type ClientStatus = 'ready' | 'preview' | 'planned';
/** 'reproduction' = a real team's client; 'original' = ours (Nostr Kitten). */
export type ClientKind = 'reproduction' | 'original';

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
  status: ClientStatus;
  kind: ClientKind;
  /** one honest sentence shown on preview cards — what "early preview" means here */
  statusNote?: string;
  /** DERIVED: a reference-verified reproduction (status ready + kind reproduction). */
  lead: boolean;
  /** the real client's shipping default theme; unset = follow the OS preference */
  defaultTheme?: 'dark' | 'light';
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
// `theme` = the REAL client's shipping default (Damus/Amethyst OLED dark, Primal
// Midnight — per docs/refs/*/screen-map.md). On a light-mode OS these opened
// light, so half of first visits saw the three strongest reproductions in a
// theme the real app never defaults to. Applied only until the visitor touches
// the host theme toggle; entries without `theme` follow the OS preference.
// `status` — 'ready' requires reference verification (docs/refs/<id>/screen-map.md
// + a fidelity pass). Snort stays 'preview' until it has one: it currently uses
// none of the real client's tokens and has no committed reference material.
const MOUNTS: Record<
  string,
  {
    frame: Frame;
    tour: boolean;
    status: ClientStatus;
    statusNote?: string;
    className?: string;
    theme?: 'dark' | 'light';
    load: Loader;
  }
> = {
  damus: {
    frame: 'ios',
    tour: true,
    status: 'ready',
    theme: 'dark',
    load: () => import('./simulators/damus/DamusSimulatorWithTour'),
  },
  amethyst: {
    frame: 'android',
    tour: true,
    status: 'ready',
    theme: 'dark',
    load: () => import('./simulators/amethyst/AmethystSimulatorWithTour'),
  },
  keychat: {
    frame: 'android',
    tour: true,
    status: 'preview',
    statusNote: 'Brand and layout not yet verified against the real client.',
    load: () => import('./simulators/keychat/KeychatSimulatorWithTour'),
  },
  olas: {
    frame: 'ios',
    tour: true,
    status: 'preview',
    statusNote: 'An early sketch — not yet a faithful reproduction.',
    load: () => import('./simulators/olas/OlasSimulatorWithTour'),
  },
  yakihonne: {
    frame: 'ios',
    tour: true,
    status: 'ready',
    theme: 'light',
    load: () => import('./simulators/yakihonne/YakiHonneSimulatorWithTour'),
  },
  snort: {
    frame: null,
    tour: true,
    status: 'preview',
    statusNote: 'Layout and brand marks not yet verified against the real client.',
    load: () => import('./simulators/snort/SnortSimulatorWithTour'),
  },
  primal: {
    frame: null,
    tour: true,
    status: 'ready',
    theme: 'dark',
    load: () => import('./simulators/primal/PrimalWebSimulatorWithTour'),
  },
  coracle: {
    frame: null,
    tour: false,
    status: 'preview',
    statusNote: 'An early sketch — not yet a faithful reproduction.',
    load: () => import('./simulators/coracle').then((m) => ({ default: m.CoracleSimulator })),
  },
  gossip: {
    frame: null,
    tour: false,
    status: 'preview',
    statusNote: 'The real Gossip is a native desktop app; this is a rough web sketch.',
    load: () => import('./simulators/gossip').then((m) => ({ default: m.GossipSimulator })),
  },
};

// Nostr Kitten is OUR original client — not a reproduction of anyone's work,
// and deliberately NOT the front door (CLAUDE.md forbids leading with it).
const kittenLoad: Loader = () =>
  import('./simulators/nostr-kitten/NostrKittenSimulator').then((m) => ({ default: m.NostrKittenSimulator }));

const nostrKitten: ClientEntry = {
  id: 'nostr-kitten',
  name: 'Nostr Kitten',
  description:
    'A deliberately silly original client in 90s-GeoCities style — not a real one. Built to show the shell works with anything.',
  platform: 'web',
  primaryColor: '#FF00CC',
  emoji: '🐱',
  features: ['Guestbook', 'MIDI', 'Webring'],
  frame: null,
  hasTour: false,
  status: 'ready',
  kind: 'original',
  lead: false,
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
    status: mount.status,
    kind: 'reproduction' as const,
    statusNote: mount.statusNote,
    lead: mount.status === 'ready',
    defaultTheme: mount.theme,
    className: mount.className,
    Component: lazy(mount.load),
    preload: once(mount.load),
  } satisfies ClientEntry;
});

// Ready reproductions first, then previews, originals last — the same order
// the gallery sections tell the story in.
const rank = (c: ClientEntry) => (c.kind === 'original' ? 2 : c.status === 'ready' ? 0 : 1);
export const clients: ClientEntry[] = [...branded, nostrKitten].sort((a, b) => rank(a) - rank(b));

export function getClient(id: string | undefined): ClientEntry | undefined {
  return clients.find((c) => c.id === id);
}
