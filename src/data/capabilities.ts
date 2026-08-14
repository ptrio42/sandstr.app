/**
 * Capability matrix — "can I do X in client Y", one cell at a time.
 *
 * WHY THIS EXISTS. "Which client should I use" is the fourth-biggest topic on
 * #asknostr (13% of 1932 sampled notes, docs/OUTREACH.md) and the one question
 * the product could not answer: the gallery shows tiles, and the FAQ answers
 * "how" only after you have already picked a client. This is the data behind
 * /compare.
 *
 * WHERE THE CLAIMS COME FROM — and where they do NOT.
 *
 * Every cell cites a `source`: an entry id in that client's own FAQ bank
 * (`src/data/faq/<client>.ts`). Those answers are grounded, per the authoring
 * contract in `src/data/faq/README.md`, in `docs/refs/<client>/screen-map.md`
 * and in upstream source — they describe the REAL client. So does this file.
 *
 * It is NOT derived from our simulators. The simulator is a subset of the real
 * client (`docs/GAPS.md` counts the difference: 533 rows, 145 `missing`), so
 * "our sim has no button for it" is not evidence that the real client lacks
 * the feature. Reading a verdict off the simulator would ship false claims
 * about someone else's product.
 *
 * `unknown` IS A REAL VERDICT AND IT IS LOAD-BEARING. The FAQ README's rule —
 * "'this client does not have it' is a first-class answer, provided it was
 * verified, not inferred from silence" — applies here with more force, because
 * a matrix cell reads as a claim even when it is a shrug. Where the cited
 * answer neither shows the feature nor denies it, the cell is `unknown` and
 * says what was not checked. Those cells are the recon backlog, not filler.
 *
 * EVERY CLAIM IS DATED. A capability is a statement about someone else's
 * product at a point in time, and it decays the moment they ship. The version
 * a cell is true of is not stored here: it is `ClientEntry.reproduces` in
 * `src/registry.tsx` ('v1.12.6', 'as of Jul 2026'), which is sourced from the
 * screen-map. /compare prints it beside every client. Never state a capability
 * without it.
 *
 * SCOPE. The eight `ready` clients — the ones with a FAQ bank. Keychat and
 * Gossip are `preview`, have no screen-map and no FAQ, so there is nothing to
 * ground a claim in; they are absent by design, not by omission.
 */

import type { CanonicalTopic } from './faq/types';
import { getFaq } from './faq';

/**
 * - `yes`     — the client does this; `detail` says what it looks like there.
 * - `partial` — it does a materially smaller version of it.
 * - `no`      — the cited answer states the absence explicitly.
 * - `unknown` — the cited answer does not settle it. Not a soft `no`.
 */
export type Verdict = 'yes' | 'partial' | 'no' | 'unknown';

export interface CapabilityCell {
  verdict: Verdict;
  /**
   * One user-facing line. It must say WHAT it is in this client, never just
   * restate the verdict — the difference between "yes" and "long-press the
   * heart to pick any emoji" is the entire value of the table.
   */
  detail: string;
  /**
   * Entry id in this client's FAQ bank that carries the claim. Rendered as a
   * link to /c/<client>?faq=<id>, so every cell is one click from its source.
   * Dev-validated below — a renamed entry breaks loudly instead of silently
   * pointing at nothing.
   */
  source: string;
  /**
   * Where the claim comes from when the cited FAQ answer does not settle it —
   * a citation into `docs/refs/<client>/screen-map.md`, which is authoritative
   * for the real client.
   *
   * This field exists because the alternative was worse. Four cells started out
   * `unknown` purely because the FAQ entry they cite was written to answer a
   * neighbouring question; the screen-map settles all four. Quietly upgrading
   * the verdict while still citing only the FAQ would have turned `source` into
   * a lie — the reader clicks through and finds an answer that does not say
   * that. So the FAQ link stays (it is still the useful thing to read) and the
   * real grounding is printed beside it.
   */
  grounding?: string;
}

export interface CapabilityAxis {
  id: string;
  /** Row label in the matrix. */
  label: string;
  /** The newcomer's phrasing — used by the chooser, and as the row's tooltip. */
  question: string;
  /** Canonical FAQ topic this axis narrows. Provenance, not navigation. */
  topic: CanonicalTopic;
}

/**
 * The axes. Chosen for two properties: they DISCRIMINATE (an axis every client
 * answers the same way tells a chooser nothing), and they are grounded in FAQ
 * entries that enumerate kinds rather than describe one path. That is why the
 * mute family carries four rows: `mute` was written to enumerate people /
 * words / hashtags / threads per client, so it is the best-evidenced part of
 * the bank — see the worked example in src/data/faq/README.md.
 */
export const COMPARISON_AXES = [
  {
    id: 'signer',
    label: 'Sign in without handing over your key',
    question: 'Do you want to keep your private key out of the app?',
    topic: 'sign-in',
  },
  {
    id: 'read-only',
    label: 'Look around with just an npub',
    question: 'Do you want to read first and sign in properly later?',
    topic: 'sign-in',
  },
  {
    id: 'multi-account',
    label: 'Switch between several accounts',
    question: 'Do you need more than one account?',
    topic: 'multi-account',
  },
  {
    id: 'mute-words',
    label: 'Mute words and phrases',
    question: 'Do you want to mute topics, not just people?',
    topic: 'mute',
  },
  {
    id: 'mute-hashtags',
    label: 'Mute hashtags',
    question: 'Do you want to mute a whole hashtag?',
    topic: 'mute',
  },
  {
    id: 'mute-threads',
    label: 'Mute one conversation',
    question: 'Do you want to silence a single thread you are tired of?',
    topic: 'mute',
  },
  {
    id: 'emoji-reactions',
    label: 'React with any emoji',
    question: 'Do you want more than one reaction?',
    topic: 'reactions',
  },
  {
    id: 'builtin-wallet',
    label: 'Wallet built into the app',
    question: 'Do you want to zap without setting up a wallet elsewhere first?',
    topic: 'connect-wallet',
  },
  {
    id: 'clear-cache',
    label: 'Clear the cache from inside the app',
    question: 'Do you want to free up space without leaving the app?',
    topic: 'clear-cache',
  },
  {
    id: 'guest-mode',
    label: 'Browse with no key at all',
    question: 'Do you want to see it before committing to a key?',
    topic: 'sign-in',
  },
  {
    id: 'search-place',
    label: 'A place of its own to search',
    question: 'Do you search a lot?',
    topic: 'search',
  },
] as const satisfies readonly CapabilityAxis[];

export type AxisId = (typeof COMPARISON_AXES)[number]['id'];

/**
 * Compiler-enforced the same way `ClientFaq.coverage` is: a client that misses
 * an axis does not typecheck, and adding an axis deliberately breaks all eight
 * client blocks until each one is answered. That is the mechanism working.
 */
export type ClientCapabilities = Record<AxisId, CapabilityCell>;

export const capabilities: Record<string, ClientCapabilities> = {
  // ---------------------------------------------------------------- Damus --
  damus: {
    signer: {
      verdict: 'no',
      detail:
        'No extension, no bunker, no Amber — the nsec has to be typed into Damus itself.',
      source: 'multi-account',
    },
    'read-only': {
      verdict: 'yes',
      detail: 'An npub logs you in read-only; the nsec is only needed to post.',
      source: 'sign-in',
    },
    'multi-account': {
      verdict: 'no',
      detail:
        'One key at a time. Switching means backing up the nsec, logging out and logging back in.',
      source: 'multi-account',
    },
    'mute-words': {
      verdict: 'yes',
      detail: 'Side menu → Muted → Words, alongside users, hashtags and threads.',
      source: 'muted',
    },
    'mute-hashtags': {
      verdict: 'yes',
      detail: 'Its own section on the same Muted screen.',
      source: 'muted',
    },
    'mute-threads': {
      verdict: 'yes',
      detail:
        'Threads is the fourth section — and the only client here that can mute for a set duration.',
      source: 'muted',
    },
    'emoji-reactions': {
      verdict: 'partial',
      detail:
        'The like is a 🤙 shaka, and Settings changes your default emoji — but there is no per-note picker.',
      source: 'shaka',
    },
    'builtin-wallet': {
      verdict: 'yes',
      detail: '"Create new wallet" sets up a Coinos wallet in one tap, inside the app.',
      source: 'connect-wallet',
    },
    'clear-cache': {
      verdict: 'yes',
      detail: 'Settings → Storage charts what is on the device and clears it.',
      source: 'clear-cache',
    },
    'guest-mode': {
      verdict: 'no',
      detail: 'The welcome screen has exactly two doors — Create Account and Sign In. Nothing gets you past it.',
      source: 'sign-in',
    },
    'search-place': {
      verdict: 'yes',
      detail: 'The magnifier is the third tab; it opens the "Universe 🛸" screen.',
      source: 'search',
    },
  },

  // ------------------------------------------------------------- Amethyst --
  amethyst: {
    signer: {
      verdict: 'yes',
      detail: 'A "Login with Amber" button appears when the Amber signer app is installed.',
      source: 'sign-in',
    },
    'read-only': {
      verdict: 'yes',
      detail: 'The one key field takes an npub for a read-only session.',
      source: 'sign-in',
    },
    'multi-account': {
      verdict: 'yes',
      detail:
        'Drawer → Accounts. Every account keeps its own relays, mutes, bookmarks and feeds.',
      source: 'multi-account',
    },
    'mute-words': {
      verdict: 'yes',
      detail: 'Security Filters → "Hidden Words".',
      source: 'mute',
    },
    'mute-hashtags': {
      verdict: 'yes',
      detail: 'Open the tag feed → ⋮ → "Mute hashtag" — the only kind that gets no list.',
      source: 'mute',
    },
    'mute-threads': {
      verdict: 'yes',
      detail: 'Long-press a note → "Mute thread"; Security Filters lists them.',
      source: 'mute',
    },
    'emoji-reactions': {
      verdict: 'yes',
      detail: 'Long-press the heart to pick any emoji — the heart is only the default.',
      source: 'react-heart',
    },
    'builtin-wallet': {
      verdict: 'no',
      detail: 'No wallet of its own — the Wallet screen only adds NWC connections.',
      source: 'connect-wallet',
    },
    'clear-cache': {
      verdict: 'no',
      detail: 'No in-app button. You clear it from Android app info, or by logging out.',
      source: 'clear-cache',
    },
    'guest-mode': {
      verdict: 'no',
      detail: 'The first screen is a single key field. There is no way in without a key.',
      source: 'sign-in',
    },
    'search-place': {
      verdict: 'no',
      detail: 'No search tab at all — the five are Home, Messages, Shorts, Discover, Notifications. The magnifier lives in the top bar.',
      source: 'search',
    },
  },

  // --------------------------------------------------------------- Primal --
  primal: {
    signer: {
      verdict: 'yes',
      detail: 'Advanced login options offer a browser extension or a remote signer.',
      source: 'sign-in',
    },
    'read-only': {
      verdict: 'yes',
      detail: 'You can browse as a guest without any key at all, or sign in with an npub.',
      source: 'sign-in',
    },
    'multi-account': {
      verdict: 'no',
      detail:
        'No switcher — the user chip is just a profile link. Changing accounts inside your extension does nothing.',
      source: 'multi-account',
    },
    'mute-words': {
      verdict: 'yes',
      detail: 'Settings → Muted Content → Words.',
      source: 'mute',
    },
    'mute-hashtags': {
      verdict: 'yes',
      detail: 'Its own tab on the same screen.',
      source: 'mute',
    },
    'mute-threads': {
      verdict: 'yes',
      detail: '"Mute Thread" from a note\'s … menu; all four kinds publish to one Nostr mute list.',
      source: 'mute',
    },
    'emoji-reactions': {
      verdict: 'no',
      detail:
        'The footer is five buttons — reply, zap, like, repost, bookmark. Primal shows other people’s emoji reactions in notifications but sends only a like.',
      source: 'like',
      grounding:
        'docs/refs/primal/screen-map.md — NoteFooter is enumerated left to right (reply → zap → like → repost → bookmark), with no picker; the notification list renders a non-"+" reaction as its type icon.',
    },
    'builtin-wallet': {
      verdict: 'partial',
      detail:
        'The Primal Wallet exists but is activated in the mobile app; the web app then uses it over the same connection.',
      source: 'connect-wallet',
    },
    'clear-cache': {
      verdict: 'partial',
      detail:
        'Settings → Dev Tools → "Reset Local Storage". Anything beyond that is your browser\'s site data.',
      source: 'clear-cache',
    },
    'guest-mode': {
      verdict: 'yes',
      detail: 'The feed greets guests with "Welcome to nostr!" — you can read the whole thing before signing in.',
      source: 'sign-in',
    },
    'search-place': {
      verdict: 'yes',
      detail: 'A search pill rides the right-hand column on most pages, and Explore adds a full bar plus Advanced Search.',
      source: 'search',
    },
  },

  // ------------------------------------------------------------ YakiHonne --
  yakihonne: {
    signer: {
      verdict: 'yes',
      detail: 'Remote signer by QR, nostrconnect:// or bunker://; Amber on Android.',
      source: 'sign-in',
    },
    'read-only': {
      verdict: 'yes',
      detail: '"Continue as a guest" reads without a key; an npub gives a read-only session.',
      source: 'sign-in',
    },
    'multi-account': {
      verdict: 'yes',
      detail:
        'Drawer → Manage accounts. Each account carries its own Lightning and Cashu wallet.',
      source: 'multi-account',
    },
    'mute-words': {
      verdict: 'partial',
      detail:
        'The mute list holds only people and threads. Words are a per-feed filter ("Excluded words"), not a mute.',
      source: 'mute',
    },
    'mute-hashtags': {
      verdict: 'no',
      detail: 'Not in the mute list — it holds people and threads only.',
      source: 'mute',
    },
    'mute-threads': {
      verdict: 'yes',
      detail: '"Mute thread" in a note\'s ⋯ menu; review it under Content moderation.',
      source: 'mute',
    },
    'emoji-reactions': {
      verdict: 'yes',
      detail: 'Turn off one-tap reactions and the heart opens a picker; your emoji replaces it.',
      source: 'react',
    },
    'builtin-wallet': {
      verdict: 'yes',
      detail:
        '"Create Yaki Wallet" — and the wallet gets a whole tab, holding a Lightning and a Cashu wallet.',
      source: 'connect-wallet',
    },
    'clear-cache': {
      verdict: 'yes',
      detail:
        'Settings → "Crashlytics & cache" → tick cached data and/or media, then "Clear app cache".',
      source: 'clear-cache',
    },
    'guest-mode': {
      verdict: 'yes',
      detail: '"Continue as a guest ›" sits under the two buttons on the landing screen.',
      source: 'sign-in',
    },
    'search-place': {
      verdict: 'partial',
      detail: 'A magnifier in the top-right of Home — one of exactly two icons up there — not a tab of its own.',
      source: 'search',
    },
  },

  // ---------------------------------------------------------------- Snort --
  snort: {
    signer: {
      verdict: 'yes',
      detail: '"Sign in with Nostr Extension" — the key never touches the page.',
      source: 'sign-in',
    },
    'read-only': {
      verdict: 'yes',
      detail: 'An npub or a NIP-05 address gets you a read-only session.',
      source: 'sign-in',
    },
    'multi-account': {
      verdict: 'partial',
      detail:
        'Switching is one click in the sidebar, but there is no "Add account" button, and the per-account logout page is unlinked.',
      source: 'multi-account',
    },
    'mute-words': {
      verdict: 'partial',
      detail:
        'Settings → Moderation stores muted words — but at the version reproduced here, nothing filters on them yet.',
      source: 'mute',
    },
    'mute-hashtags': {
      verdict: 'no',
      detail: 'Snort mutes people and words only.',
      source: 'mute',
    },
    'mute-threads': {
      verdict: 'no',
      detail: 'No per-conversation mute.',
      source: 'mute',
    },
    'emoji-reactions': {
      verdict: 'no',
      detail: 'The reaction Snort sends is a plain "+", drawn as a heart. No picker on the note.',
      source: 'react-heart',
      grounding:
        'docs/refs/snort/screen-map.md — "Default reaction is `+`, drawn as a heart. No emoji picker on notes."',
    },
    'builtin-wallet': {
      verdict: 'partial',
      detail:
        'Snort has wallet pages of its own — a balance row, send and receive — but they front an outside provider: LNDHub, NWC or Alby.',
      source: 'connect-wallet',
      grounding:
        'docs/refs/snort/screen-map.md — routes /wallet and /wallet/{send,receive}; the WalletBalance row (≥1280px); settings `wallet` with `lndhub`, `nwc`, `alby`.',
    },
    'clear-cache': {
      verdict: 'yes',
      detail:
        'Settings → Cache lists Profiles, Relays, Follow Lists and Gift Wraps, each with its own Clear.',
      source: 'clear-cache',
    },
    'guest-mode': {
      verdict: 'no',
      detail: 'A Sign In card in the middle of the page, with Sign Up underneath. No guest route.',
      source: 'sign-in',
    },
    'search-place': {
      verdict: 'yes',
      detail: 'A box in the right-hand column, and Search in the left rail.',
      source: 'search',
    },
  },

  // ----------------------------------------------------------------- Wisp --
  wisp: {
    signer: {
      verdict: 'no',
      detail:
        'No external-signer button at this version, whatever the project README suggests — the key lives on the device.',
      source: 'sign-in',
    },
    'read-only': {
      verdict: 'yes',
      detail: 'An npub gives watch-only mode: read and follow, but not post.',
      source: 'sign-in',
    },
    'multi-account': {
      verdict: 'yes',
      detail:
        'The people icon in the drawer header opens the account list; rows reorder with chevrons.',
      source: 'multi-account',
    },
    'mute-words': {
      verdict: 'yes',
      detail: 'Settings → Safety → "Muted Words".',
      source: 'mute',
    },
    'mute-hashtags': {
      verdict: 'no',
      detail: 'Wisp cannot mute hashtags.',
      source: 'mute',
    },
    'mute-threads': {
      verdict: 'partial',
      detail:
        '"Mute Thread" exists in a note\'s ⋮ menu, but there is no list of muted threads — you cannot undo it from the interface.',
      source: 'mute',
    },
    'emoji-reactions': {
      verdict: 'yes',
      detail:
        'Seventeen emoji in a popup — and the one you pick REPLACES the icon instead of colouring it.',
      source: 'react',
    },
    'builtin-wallet': {
      verdict: 'yes',
      detail:
        'The Spark wallet is built in and self-custody: it derives from your Nostr key, so it returns on any device.',
      source: 'connect-wallet',
    },
    'clear-cache': {
      verdict: 'no',
      detail: 'No such control anywhere in the app — clear it from Android app info.',
      source: 'clear-cache',
    },
    'guest-mode': {
      verdict: 'no',
      detail: 'The splash offers Google and Nostr, and both roads end at a key.',
      source: 'sign-in',
    },
    'search-place': {
      verdict: 'yes',
      detail: 'Its own tab in the bottom bar, opening on Profiles with a Notes tab beside it.',
      source: 'search',
    },
  },

  // --------------------------------------------------------------- Nostur --
  nostur: {
    signer: {
      verdict: 'yes',
      detail: 'Paste a bunker:// URL and the button becomes "Add (Remote Signer)" by itself.',
      source: 'sign-in',
    },
    'read-only': {
      verdict: 'yes',
      detail: 'An npub or a nostr address gives a read-only account; "Try guest account" needs no key.',
      source: 'sign-in',
    },
    'multi-account': {
      verdict: 'yes',
      detail:
        'A fast switcher in the side menu, plus a per-post account picker in the composer. Syncs over iCloud.',
      source: 'multi-account',
    },
    'mute-words': {
      verdict: 'yes',
      detail:
        'Block list → "Muted words". A word matches anywhere, so muting "nft" also hides "#nft".',
      source: 'block-list',
    },
    'mute-hashtags': {
      verdict: 'no',
      detail: 'No hashtag muting — a muted word is the workaround.',
      source: 'block-list',
    },
    'mute-threads': {
      verdict: 'yes',
      detail: '"Mute conversation" in a post\'s ••• menu, with its own tab in the block list.',
      source: 'block-list',
    },
    'emoji-reactions': {
      verdict: 'yes',
      detail: 'Press and hold the heart for a picker; your emoji replaces it in that row.',
      source: 'react-heart',
    },
    'builtin-wallet': {
      verdict: 'no',
      detail:
        'Nostur has no wallet of its own — zaps hand off to a Lightning app, or stay inside over NWC.',
      source: 'connect-wallet',
    },
    'clear-cache': {
      verdict: 'yes',
      detail:
        'Settings → Database & Cache, one Clear per category, plus "Optimize now" to compact the database.',
      source: 'clear-cache',
    },
    'guest-mode': {
      verdict: 'yes',
      detail: '"Try guest account" is the third button on the welcome screen.',
      source: 'sign-in',
    },
    'search-place': {
      verdict: 'yes',
      detail: 'The magnifier is one of the five bottom tabs.',
      source: 'search',
    },
  },

  // -------------------------------------------------------------- Coracle --
  coracle: {
    signer: {
      verdict: 'yes',
      detail:
        'There is nowhere to paste a secret key at all — extension, remote signer or signer app only. The most key-safe sign-in here.',
      source: 'sign-in',
    },
    'read-only': {
      verdict: 'partial',
      detail:
        'Possible, but not from the login screen: open someone\'s profile → ⋮ → "Login as".',
      source: 'multi-account',
    },
    'multi-account': {
      verdict: 'yes',
      detail:
        'Sidebar → Switch Account, and each login adds a session. Caveat: "Log Out" signs out of ALL of them.',
      source: 'multi-account',
    },
    'mute-words': {
      verdict: 'yes',
      detail: 'Content Settings → Mutes, with separate public and private word lists.',
      source: 'mute',
    },
    'mute-hashtags': {
      verdict: 'yes',
      detail: 'Coracle calls them topics; same public/private pair on the same page.',
      source: 'mute',
    },
    'mute-threads': {
      verdict: 'no',
      detail: 'No per-conversation mute — people, words and topics is the whole list.',
      source: 'mute',
    },
    'emoji-reactions': {
      verdict: 'no',
      detail: 'Coracle sends a plain "+" and has no emoji picker on the card.',
      source: 'react',
    },
    'builtin-wallet': {
      verdict: 'unknown',
      detail:
        'There is a "Your Wallet" page and zapping a profile does not need it — but what that page actually offers is the one thing on this table nobody has checked.',
      source: 'connect-wallet',
      grounding:
        'Genuinely open: docs/refs/coracle/screen-map.md lists /settings/wallet → "Your Wallet" with no fields, while enumerating every other settings page in full. Resolving this needs a pass over coracle-social/coracle.',
    },
    'clear-cache': {
      verdict: 'no',
      detail:
        'The App Database page holds exactly two cards — Export and Import — over a table of what is stored. Nothing empties it.',
      source: 'clear-cache',
      grounding:
        'docs/refs/coracle/screen-map.md — /settings/data "App Database: View, import, and export your local database", enumerated as two cards plus the events table.',
    },
    'guest-mode': {
      verdict: 'yes',
      detail: 'Logged out you still get a fully populated feed — Log In is a button in the top bar, not a gate.',
      source: 'sign-in',
      grounding:
        'docs/refs/coracle/screen-map.md — "Logged out, Feeds.svelte:17-26 puts a py-16 text-center block above a fully populated feed."',
    },
    'search-place': {
      verdict: 'partial',
      detail: 'One field in the top bar. There is no search page, and the sidebar has no magnifier — it has no icons at all.',
      source: 'search',
    },
  },
};

/** Client ids the matrix covers, in the order the table renders them. */
export const COMPARED_CLIENTS = Object.keys(capabilities);

export function getCapabilities(clientId: string | undefined): ClientCapabilities | null {
  return (clientId && capabilities[clientId]) || null;
}

/**
 * Dev-only integrity check, mirroring the one in `src/data/faq/index.ts`: types
 * cannot see whether a `source` names an entry that exists. A renamed FAQ entry
 * would otherwise leave a cell citing nothing and linking to a panel that opens
 * on the bank instead of the answer — silent, and exactly the failure this file
 * is supposed to make impossible.
 */
if (import.meta.env.DEV) {
  for (const [clientId, axes] of Object.entries(capabilities)) {
    const faq = getFaq(clientId);
    if (!faq) {
      console.error(`[capabilities] ${clientId}: no FAQ bank — every cell's source is unverifiable`);
      continue;
    }
    for (const [axisId, cell] of Object.entries(axes)) {
      if (!faq.entries.some((e) => e.id === cell.source)) {
        console.error(
          `[capabilities] ${clientId}.${axisId}: source '${cell.source}' is not an entry in the ${clientId} FAQ`,
        );
      }
    }
  }
}
