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
/**
 * 'reproduction' = a real team's client; 'original' = ours (Nostr Kitten).
 * No LISTED client is 'original' today — see `unlisted` at the bottom of this file.
 */
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
  /**
   * Where to send someone who wants the REAL client. This is the point of the
   * whole product, so it is not optional data: a reproduction with no way out
   * is a copy, a reproduction that hands you off is a signpost. Also the
   * cheapest trademark mitigation available, and the opening line of the
   * consent email. `homepage` is null when the project genuinely has no site
   * (Gossip) — link the repo instead, never invent a domain.
   */
  homepage: string | null;
  repo: string;
  /** upstream SPDX id — feeds THIRD-PARTY.md attribution */
  upstreamLicense: string;
  /** how a human actually installs it, one clause */
  installNote: string;
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
// `homepage`/`repo`/`upstreamLicense`/`installNote` were verified against each
// project's OWN site and repository on 2026-07-29 — not from memory and not from
// aggregators. A dead or wrong outbound link would embarrass us in front of
// exactly the people we need consent from, so re-verify before changing one.
// Recorded caveats:
//  - snort: the GitHub repo's `homepage` field now says phoenix.social, but
//    snort.social and phoenix.social serve byte-identical builds and the PWA
//    manifest is still "snort.social - Nostr interface", with no rename
//    announcement found. snort.social is the brand-correct link today; check
//    with Kieran before switching. (git.v0l.io is a MIRROR — GitHub is canonical.)
//  - gossip: genuinely has no website. homepage stays null; we link the repo.
//  - yakihonne: attribute YakiHonne/web-app; the *-web-app / *-mobile-app repos
//    are archived.
const MOUNTS: Record<
  string,
  {
    frame: Frame;
    tour: boolean;
    status: ClientStatus;
    statusNote?: string;
    className?: string;
    theme?: 'dark' | 'light';
    homepage: string | null;
    repo: string;
    upstreamLicense: string;
    installNote: string;
    load: Loader;
  }
> = {
  damus: {
    frame: 'ios',
    tour: true,
    status: 'ready',
    theme: 'dark',
    homepage: 'https://damus.io',
    repo: 'https://github.com/damus-io/damus',
    upstreamLicense: 'GPL-3.0',
    installNote: 'iOS App Store; Android as a direct APK from damus.io',
    load: () => import('./simulators/damus/DamusSimulatorWithTour'),
  },
  amethyst: {
    frame: 'android',
    tour: true,
    status: 'ready',
    theme: 'dark',
    homepage: 'https://amethyst.social',
    repo: 'https://github.com/vitorpamplona/amethyst',
    upstreamLicense: 'MIT',
    installNote: 'Google Play, Zapstore, Obtainium, or a release APK',
    load: () => import('./simulators/amethyst/AmethystSimulatorWithTour'),
  },
  keychat: {
    frame: 'android',
    tour: true,
    status: 'preview',
    statusNote: 'Brand and layout not yet verified against the real client.',
    homepage: 'https://keychat.io',
    repo: 'https://github.com/keychat-io/keychat-app',
    upstreamLicense: 'AGPL-3.0',
    installNote: 'iOS App Store, Google Play, or a release APK',
    load: () => import('./simulators/keychat/KeychatSimulatorWithTour'),
  },
  yakihonne: {
    frame: 'ios',
    tour: true,
    status: 'ready',
    theme: 'light',
    homepage: 'https://yakihonne.com',
    repo: 'https://github.com/YakiHonne/web-app',
    upstreamLicense: 'MIT',
    installNote: 'Web app, no install; also on the iOS App Store and Google Play',
    load: () => import('./simulators/yakihonne/YakiHonneSimulatorWithTour'),
  },
  snort: {
    frame: null,
    tour: true,
    // Promoted from 'preview' once the rebuild landed: tokens, navigation and
    // all 12 surfaces are now traceable to docs/refs/snort/screen-map.md
    // (owner's 2026-07-14 recording + v0l/snort@3cc8317). No `theme` field on
    // purpose — Snort ships `theme: "system"`, which is exactly what "unset"
    // means here.
    status: 'ready',
    homepage: 'https://snort.social',
    repo: 'https://github.com/v0l/snort',
    upstreamLicense: 'MIT',
    installNote: 'Web app, no install; Android wrapper on Google Play',
    load: () => import('./simulators/snort/SnortSimulatorWithTour'),
  },
  primal: {
    frame: null,
    tour: true,
    status: 'ready',
    theme: 'dark',
    homepage: 'https://primal.net',
    repo: 'https://github.com/PrimalHQ/primal-web-app',
    upstreamLicense: 'MIT',
    installNote: 'Web app, no install; native iOS and Android apps too',
    load: () => import('./simulators/primal/PrimalWebSimulatorWithTour'),
  },
  wisp: {
    frame: 'android',
    tour: true,
    // Reference-verified 2026-07-30: recording + barrydeen/wisp@11ac08f recon
    // → docs/refs/wisp/screen-map.md, then a live side-by-side pass per surface.
    status: 'ready',
    theme: 'dark', // real shipping default: theme "custom" dark (MainActivity.kt:47)
    // Verified 2026-07-30 against wisp.mobile + github.com/barrydeen/wisp
    // (MIT, © 2025 Barry Deen; Play id com.wisp.app; OpenSats-funded).
    homepage: 'https://wisp.mobile',
    repo: 'https://github.com/barrydeen/wisp',
    upstreamLicense: 'MIT',
    installNote: 'Google Play, or Zapstore (zapstore.yaml ships in the repo)',
    load: () => import('./simulators/wisp/WispSimulatorWithTour'),
  },
  coracle: {
    frame: null,
    tour: false,
    // Reference-verified 2026-08-05: owner's recording + coracle-social/coracle
    // @efea13f recon → docs/refs/coracle/screen-map.md, then a live
    // side-by-side pass per surface (§19).
    status: 'ready',
    // The real shipping default, not a guess: `synced({key: "ui/theme",
    // defaultValue: "dark"})` in src/partials/state.ts:36-40. Coracle has no
    // prefers-color-scheme detection at all, so an unset value here would have
    // opened half of all first visits in a theme the app never picks itself.
    theme: 'dark',
    homepage: 'https://coracle.social',
    repo: 'https://github.com/coracle-social/coracle',
    upstreamLicense: 'MIT',
    installNote: 'Web app, no install; installable as a PWA',
    load: () => import('./simulators/coracle').then((m) => ({ default: m.CoracleSimulator })),
  },
  gossip: {
    frame: null,
    tour: false,
    status: 'preview',
    statusNote: 'The real Gossip is a native desktop app; this is a rough web sketch.',
    homepage: null,
    repo: 'https://github.com/mikedilger/gossip',
    upstreamLicense: 'MIT',
    installNote: 'Native desktop binary for macOS, Linux or Windows from GitHub Releases',
    load: () => import('./simulators/gossip').then((m) => ({ default: m.GossipSimulator })),
  },
};

// Nostr Kitten is OUR original client — not a reproduction of anyone's work,
// and deliberately NOT the front door (CLAUDE.md forbids leading with it).
// UNLISTED since 2026-08-05: the shelf is "reproductions of real clients", and
// a GeoCities parody sitting among them muddled that sentence for every first
// visit. The entry and the simulator stay — /c/nostr-kitten still resolves, as
// the easter egg CLAUDE.md always said it was — it just no longer appears in the
// gallery, the ⌘K palette or the switcher rail. Relisting = move it back into
// `clients` (the gallery's "original" section is the only piece that was
// deleted, and it was six lines).
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
  // Ours, so the handoff points at this repo rather than someone else's project.
  homepage: null,
  repo: 'https://github.com/ptrio42/sandstr',
  upstreamLicense: 'MIT',
  installNote: 'Not a real client — it only exists here',
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
    homepage: mount.homepage,
    repo: mount.repo,
    upstreamLicense: mount.upstreamLicense,
    installNote: mount.installNote,
    lead: mount.status === 'ready',
    defaultTheme: mount.theme,
    className: mount.className,
    Component: lazy(mount.load),
    preload: once(mount.load),
  } satisfies ClientEntry;
});

// Ready reproductions first, then previews — the same order the gallery
// sections tell the story in.
const rank = (c: ClientEntry) => (c.status === 'ready' ? 0 : 1);

/**
 * Everything the product SHOWS. Gallery, ⌘K palette and the switcher rail all
 * read this array, so anything absent here is invisible without being deleted.
 */
export const clients: ClientEntry[] = [...branded].sort((a, b) => rank(a) - rank(b));

/** Reachable at /c/<id>, listed nowhere. See the Nostr Kitten note above. */
const unlisted: ClientEntry[] = [nostrKitten];

/** Routing resolves unlisted clients too — that is what keeps the egg findable. */
export function getClient(id: string | undefined): ClientEntry | undefined {
  return clients.find((c) => c.id === id) ?? unlisted.find((c) => c.id === id);
}
