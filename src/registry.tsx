import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { allSimulatorConfigs } from './simulators/shared/configs';
import type { SimulatorConfig } from './simulators/shared/types';

export type Frame = 'ios' | 'android' | null;

/**
 * The readiness axis. It exists so the gallery never presents an early sketch
 * as a finished reproduction: presenting a sketch as a faithful copy would
 * misrepresent someone else's app.
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
   * is a copy, a reproduction that hands you off is a signpost. `homepage` is
   * null when the project genuinely has no site
   * (Gossip) — link the repo instead, never invent a domain.
   */
  homepage: string | null;
  repo: string;
  /** upstream SPDX id — feeds THIRD-PARTY.md attribution */
  upstreamLicense: string;
  /** how a human actually installs it, one clause */
  installNote: string;
  /**
   * Where the REAL client runs — which is not `platform`. `platform` says which
   * build this shelf reproduces (YakiHonne from its iOS app, Primal from its
   * web app); this says where a reader could actually go and use the thing.
   * Filtering /compare on `platform` quietly hid clients that do run on the
   * asked-for device.
   *
   * Every entry is read off `installNote` above, which is itself verified —
   * so the two must be edited together, and neither is a guess. Desktop-only
   * clients (Gossip) get an empty list rather than a fourth axis nobody filters
   * on; their `installNote` still says where they run.
   */
  availableOn: ('ios' | 'android' | 'web')[];
  /**
   * Which upstream build this reproduction was verified against — a human
   * label, not a git ref: 'v1.12.6', 'v1.2.1', or 'as of Jul 2026' when the
   * screen-map pins only a commit/date. Shown in the About surfaces and as
   * the version menu's label. Source of truth: docs/refs/<id>/screen-map.md.
   * Absent = never reference-verified (previews).
   */
  reproduces?: string;
  /**
   * Set ONLY on frozen snapshots in the `archived` list below: the id of the
   * living entry this is an older version of. Its presence IS the "archived"
   * flag — ClientView renders the older-version strip, the switcher rail
   * highlights the living sibling, and versionsOf() joins the family on it
   * (never on id prefixes — ids may themselves contain hyphens).
   * Freeze procedure: docs/VERSIONS.md.
   */
  archivedOf?: string;
  /** Archived snapshots only: the date the snapshot was frozen (YYYY-MM-DD). */
  capturedOn?: string;
  /**
   * DERIVED for listed entries (status ready + kind reproduction); hand-set
   * false on unlisted and archived entries — an archived snapshot is ready and
   * a reproduction, but it must never earn the rail's starred section or the
   * palette star.
   */
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
// + a fidelity pass); an entry without one stays 'preview'.
// `homepage`/`repo`/`upstreamLicense`/`installNote` were verified against each
// project's OWN site and repository on 2026-07-29 — not from memory and not from
// aggregators. A dead or wrong outbound link strands the visitor on their way
// to the real client, so re-verify before changing one.
// Recorded caveats:
//  - snort: the GitHub repo's `homepage` field now says phoenix.social, but
//    snort.social and phoenix.social serve byte-identical builds and the PWA
//    manifest is still "snort.social - Nostr interface", with no rename
//    announcement found. snort.social is the brand-correct link today; re-check
//    against upstream before switching. (git.v0l.io is a MIRROR — GitHub is canonical.)
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
    /** see ClientEntry.availableOn — read off installNote, never guessed */
    availableOn: ('ios' | 'android' | 'web')[];
    /** see ClientEntry.reproduces — version tag when the screen-map pins one, month of verification otherwise */
    reproduces?: string;
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
    availableOn: ['ios', 'android'],
    // screen-map pins damus-io/damus@master verified 2026-07-14 — no tag, so a date label
    reproduces: 'as of Jul 2026',
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
    availableOn: ['android'],
    // docs/refs/amethyst/screen-map.md — owner's v1.13.1-fdroid recording (the
    // drawer footer reads "v1.13.1-FDROID") + vitorpamplona/amethyst @ tag
    // v1.13.1. The v1.12.6 reproduction is frozen as amethyst-v1-12 below.
    reproduces: 'v1.13.1',
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
    availableOn: ['ios', 'android'],
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
    availableOn: ['web', 'ios', 'android'],
    // screen-map: YakiHonne/mobile-app@main, 11-surface pass 2026-07-14 — no tag pinned
    reproduces: 'as of Jul 2026',
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
    availableOn: ['web', 'android'],
    // screen-map: v0l/snort@3cc8317 (2026-07-29) + owner's 2026-07-14 recording — no tag
    reproduces: 'as of Jul 2026',
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
    availableOn: ['web', 'ios', 'android'],
    // screen-map: PrimalHQ/primal-web-app@main, recon 2026-07-14 — weakest pin of the set
    reproduces: 'as of Jul 2026',
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
    // (MIT; Play id com.wisp.app).
    homepage: 'https://wisp.mobile',
    repo: 'https://github.com/barrydeen/wisp',
    upstreamLicense: 'MIT',
    installNote: 'Google Play, or Zapstore (zapstore.yaml ships in the repo)',
    availableOn: ['android'],
    // screen-map: barrydeen/wisp@11ac08f = release v1.2.1 (2026-07-23)
    reproduces: 'v1.2.1',
    load: () => import('./simulators/wisp/WispSimulatorWithTour'),
  },
  nostur: {
    frame: 'ios',
    tour: true,
    // Reference-verified 2026-08-05: the owner's recording +
    // nostur-com/nostur-ios-public@11bcebb recon → docs/refs/nostur/screen-map.md,
    // then a live side-by-side pass per surface.
    status: 'ready',
    // Nostur has no theme preference of its own — Themes.preferredColorScheme is
    // nil for every theme except dark_garnet, so appearance follows iOS. The
    // recording is a dark-mode device, which is the state we open in.
    theme: 'dark',
    // Verified 2026-08-05 against nostur.com + the repo itself (GPL-3.0; the
    // LICENSE is stock GPLv3 with no per-project copyright line, so authorship
    // is evidenced by the Swift source-file headers and by
    // the commit history, not by a copyright notice. App Store id 1672780508.)
    homepage: 'https://nostur.com',
    repo: 'https://github.com/nostur-com/nostur-ios-public',
    upstreamLicense: 'GPL-3.0',
    installNote: 'iOS App Store; macOS also as a direct .dmg from nostur.com',
    availableOn: ['ios'],
    // screen-map:26 — app version 1.30.2 (Build 527) read off the reference recording
    reproduces: 'v1.30.2',
    load: () => import('./simulators/nostur/NosturSimulatorWithTour'),
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
    availableOn: ['web'],
    // screen-map: coracle-social/coracle@efea13f (2026-08-04) + 2026-08-05 recording — no tag
    reproduces: 'as of Aug 2026',
    // Wrapped since 2026-08-06 (gaps cor-01): the wrapper carries no guided
    // tour — Coracle has no entry in src/data/tours/ — it exists so the FAQ
    // panel's "Show me" can drive the simulator. `tour` stays false.
    load: () => import('./simulators/coracle/CoracleSimulatorWithTour'),
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
    availableOn: [],
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
  repo: 'https://github.com/ptrio42/sandstr.app',
  upstreamLicense: 'MIT',
  installNote: 'Not a real client — it only exists here',
    availableOn: ['web'],
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
    availableOn: mount.availableOn,
    reproduces: mount.reproduces,
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

/**
 * Frozen older versions of listed clients — the third registry list, empty
 * until the first client version bump. Entries are HAND-BUILT like nostrKitten
 * above — never via SimulatorClient/allSimulatorConfigs/MOUNTS (the enum forces
 * a config, and a config without a MOUNTS key crashes the join at module load).
 * Each points its loader at a frozen sibling directory
 * (src/simulators/<id>-v<major>-<minor>/), keeps `name` as the bare brand
 * (Disclaimer/Handoff interpolate it), and carries archivedOf + reproduces +
 * capturedOn. Routable at /c/<id>, invisible in the gallery, the ⌘K palette
 * and the rail. A verbatim directory copy is NOT enough — the theme CSS is
 * global and the tour id drives events and storage. The full freeze procedure
 * lives in docs/VERSIONS.md; follow it, don't improvise. (Executed end-to-end
 * and verified in-browser on 2026-08-13 as a dry run, then reverted — the
 * first real freeze landed the same day: the Amethyst v1.12.6 snapshot below,
 * frozen when the simulator was rebuilt against v1.13.1.)
 */
const amethystV112Load: Loader = () => import('./simulators/amethyst-v1-12/AmethystSimulatorWithTour');

const archived: ClientEntry[] = [
  {
    id: 'amethyst-v1-12',
    // Bare brand, not "Amethyst v1.12.6" — Disclaimer ("not affiliated with X")
    // and Handoff ("Get the real X") interpolate this; `reproduces` carries the version.
    name: 'Amethyst',
    description: 'Android Nostr client with rich features and modern design.',
    platform: 'android',
    availableOn: ['android'],
    primaryColor: '#6B21A8',
    secondaryColor: '#A855F7',
    icon: '/icons/amethyst-v1-12.png',
    features: [
      'dm',
      'zaps',
      'threads',
      'search',
      'relays',
      'badges',
      'nip05',
      'long form',
      'live streaming',
      'mute list',
      'pinned notes',
    ],
    frame: 'android',
    hasTour: true,
    status: 'ready',
    kind: 'reproduction',
    homepage: 'https://amethyst.social',
    repo: 'https://github.com/vitorpamplona/amethyst',
    upstreamLicense: 'MIT',
    installNote: 'Google Play, Zapstore, Obtainium, or a release APK',
    reproduces: 'v1.12.6',
    archivedOf: 'amethyst',
    capturedOn: '2026-08-13',
    lead: false,
    // Pinned to the living entry's value at freeze time — a mismatch would flip
    // the whole page's theme when switching versions.
    defaultTheme: 'dark',
    Component: lazy(amethystV112Load),
    preload: once(amethystV112Load),
  },
];

/**
 * Every id `/c/<id>` resolves to — listed first, then the egg, then the frozen
 * snapshots. It is the routing surface, NOT the shelf: keep reading `clients`
 * anywhere the product SHOWS something, or the gallery grows a Nostr Kitten.
 *
 * Two consumers today: `getClient()` below, and the build's share-card pass
 * (`shareRoutes()` in src/entry-server.tsx), which emits one HTML file per id.
 * Both must see the same three lists, which is why they are joined once here
 * rather than re-listed at each call site.
 */
export const routable: ClientEntry[] = [...clients, ...unlisted, ...archived];

/** Routing resolves unlisted and archived clients too — that is what keeps the egg (and old links) findable. */
export function getClient(id: string | undefined): ClientEntry | undefined {
  return routable.find((c) => c.id === id);
}

/**
 * The version family a client id belongs to, joined on `archivedOf` — never on
 * id prefixes, which would break at the first client whose own name contains a
 * hyphen. `current` is the living entry (an archived id resolves to its living
 * sibling), `older` the frozen snapshots, newest first. ClientView shows the
 * version menu only when `older` is non-empty, so until the first freeze every
 * client keeps today's chrome untouched.
 */
export function versionsOf(id: string | undefined): {
  current: ClientEntry | undefined;
  older: ClientEntry[];
} {
  const entry = getClient(id);
  const livingId = entry?.archivedOf ?? entry?.id;
  const current = entry?.archivedOf ? getClient(entry.archivedOf) : entry;
  const older = archived
    .filter((a) => a.archivedOf === livingId)
    .sort((a, b) => (b.capturedOn ?? '').localeCompare(a.capturedOn ?? ''));
  return { current, older };
}

if (import.meta.env.DEV) {
  // These mistakes all fail silent in production (the version menu just never
  // appears, rows render identically, sorting quietly lies) — this loop is the
  // only guard, so keep it loud.
  for (const a of archived) {
    if (!a.archivedOf || !clients.some((c) => c.id === a.archivedOf)) {
      console.warn(
        `[registry] archived entry "${a.id}" has archivedOf="${a.archivedOf}" matching no listed client — its version menu and rail highlight are broken`,
      );
    }
    if (!a.reproduces) {
      console.warn(
        `[registry] archived entry "${a.id}" has no \`reproduces\` — the version menu rows and the switcher's sr-only announcement become indistinguishable from the living client`,
      );
    }
    if (!a.capturedOn) {
      console.warn(
        `[registry] archived entry "${a.id}" has no \`capturedOn\` — it sorts last in versionsOf() regardless of age`,
      );
    }
  }
}
