/**
 * Amethyst FAQ — grounded in docs/refs/amethyst/screen-map.md (section refs in
 * comments) with docs/gaps/amethyst.md as the showMe gate. Answers describe
 * the REAL Android app; showMe steps replay them through the Amethyst
 * tour-command bridge (openDrawer / openSettings-section unlocked 2026-08-06,
 * gaps ame-30/ame-43/ame-56).
 */

import type { SimulatorCommand } from '../../simulators/amethyst/AmethystSimulator';
import type { ClientFaq, FaqShowMeStep } from './types';

/** Typed authoring helper — keeps command payloads honest against the sim. */
const cmd = (...cs: SimulatorCommand[]): SimulatorCommand[] => cs;

const CATEGORIES = [
  'Getting started',
  'Posting',
  'Reactions & zaps',
  'Finding things',
  'Relays',
  'Account & keys',
  'Advanced',
];

type Step = FaqShowMeStep;

const goHome = cmd({ type: 'login' }, { type: 'navigate', payload: 'home' });
const openDrawer = cmd({ type: 'login' }, { type: 'openDrawer' });

const actionRowStep = (target: string, title: string, content: string): Step => ({
  target,
  title,
  content,
  position: 'top',
  commands: goHome,
});

export const amethystFaq: ClientFaq = {
  clientId: 'amethyst',
  categories: CATEGORIES,
  coverage: {
    'sign-in': 'sign-in',
    'backup-keys': 'backup-keys',
    logout: 'logout',
    post: 'post-note',
    reply: 'reply',
    reactions: 'react-heart',
    zap: 'zap',
    'connect-wallet': 'connect-wallet',
    'media-uploader': 'media-servers',
    'clear-cache': 'clear-cache',
    'manage-relays': 'manage-relays',
    mute: 'mute',
    dms: 'dms',
    search: 'search',
    notifications: 'notifications',
    follow: 'follow',
  },
  entries: [
    // ---------------------------------------------------- Getting started --
    {
      // §Login / Sign up
      id: 'sign-in',
      category: 'Getting started',
      question: 'How do I sign in with my Nostr key?',
      answer: [
        'Open Amethyst — the ostrich logo sits above a single key field.',
        'Enter your key in the "nsec.. or npub.." field. The purple QR icon on the left scans a key; the eye on the right unmasks what you typed.',
        'If your key is an encrypted ncryptsec, a password field appears underneath.',
        'Tap the filled "Login" pill.',
      ],
      note: 'Logging in with an npub gives a read-only session — you need your nsec to post. A "Login with Amber" button appears only when the Amber signer app is installed on your phone.',
      showMe: [
        {
          target: '[data-tour="amethyst-login"]',
          title: 'The login screen',
          // Descriptive — the sim's QR icon is display-only (gaps ame-02).
          content:
            "Amethyst's whole login is one masked key field — purple QR scanner on the left, visibility eye on the right, Login pill below.",
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'back' }),
        },
      ],
    },
    {
      // §Account drawer; §Home — bottom nav (no Profile tab); §Home — app bar
      id: 'open-drawer',
      category: 'Getting started',
      question: "Where is my profile? There's no Profile tab.",
      answer: [
        'Tap your avatar in the top-left of the app bar — it works from any main screen.',
        'The account drawer opens: your banner, status line, following and follower counts, and the main menu.',
        'Tap "Profile" — the first menu row.',
      ],
      note: 'The drawer is Amethyst\'s control center — Relays, Bookmarks, Drafts, Media Servers, Security Filters, Backup Keys and all preferences live there, not in the bottom bar.',
      showMe: [
        {
          target: '[data-tour="amethyst-profile-avatar"]',
          title: 'Your avatar opens the drawer',
          content: 'There is no Profile tab and no hamburger — your app-bar avatar is the way in.',
          position: 'bottom',
          commands: goHome,
        },
        {
          target: '[data-tour="amethyst-drawer"]',
          title: 'The account drawer',
          content:
            'Profile sits at the top; below it live Relays, Media Servers, Security Filters, Backup Keys and every preference screen.',
          position: 'right',
          commands: cmd({ type: 'openDrawer' }),
        },
      ],
    },

    // ------------------------------------------------------------ Posting --
    {
      // §Compose / New Post; §Home — treść (FAB)
      id: 'post-note',
      category: 'Posting',
      question: 'How do I post a note?',
      answer: [
        'Tap the purple pen FAB in the bottom-right of the Home feed.',
        'A full-screen composer opens — type into "What\'s on your mind?".',
        'Tap "Post" in the top-right. It is grey while the note is empty and fills purple once there is content.',
      ],
      note: 'There is no character limit in Amethyst. Closing the composer with the X saves a draft — drafts live in the account drawer under "Drafts".',
      showMe: [
        {
          target: '[data-tour="amethyst-fab"]',
          title: 'The compose button',
          content: 'The purple pen FAB opens Amethyst\'s full-screen composer — a whole screen, not a bottom sheet.',
          position: 'left',
          commands: goHome,
        },
        {
          target: '[data-tour="amethyst-post"]',
          title: 'Post it',
          content: 'Post sits in the top bar next to the X — grey while empty, purple once you have typed.',
          position: 'bottom',
          commands: cmd({ type: 'compose' }),
        },
      ],
    },
    {
      // §Home — treść (footer); §Domknięte z wideo (Thread)
      id: 'reply',
      category: 'Posting',
      question: 'How do I reply to a note?',
      answer: [
        'Tap the speech bubble — first of the five actions under every note (reply, boost, heart, zap, stats).',
        'Or open the note and write in the "reply here.." box at the bottom of the thread.',
        'Tap "Post".',
      ],
      showMe: [
        actionRowStep(
          '[data-tour="amethyst-actions"]',
          'The action row',
          'Every note carries this five-slot footer: Reply, Boost, Like, Zap, and a stats indicator.',
        ),
        {
          target: '.action-btn-reply',
          title: 'Reply',
          content: 'Reply is always first — the speech bubble with its reply count.',
          position: 'top',
        },
      ],
    },

    // --------------------------------------------------- Reactions & zaps --
    {
      // §Home — treść (footer); §Notifications
      id: 'react-heart',
      category: 'Reactions & zaps',
      question: 'How do I like a note — and can I react with other emoji?',
      answer: [
        'Tap the heart — third action under the note.',
        'Long-press the same heart to pick a different emoji: the heart is only Amethyst\'s default reaction.',
      ],
      note: 'Reactions you receive show up in Notifications grouped by emoji — separate rows for ⚡, 🔁, ♥, 👍, 🔥, 🤙 and 👀.',
      showMe: [
        actionRowStep(
          '.action-btn-like',
          'The heart',
          // Descriptive — the sim has tap-to-heart but no long-press palette
          // (gaps ame-14).
          'Amethyst\'s default reaction is a heart; in the real app a long-press on this same button opens the emoji palette.',
        ),
      ],
    },
    {
      // §Home — treść (footer); §Profile (rząd akcji)
      id: 'zap',
      category: 'Reactions & zaps',
      question: 'How do I zap (tip sats to) a note?',
      answer: [
        'Tap the lightning bolt — fourth action under the note.',
        'The counter next to it totals the sats zapped (e.g. 7.0k) — zaps are always orange in Amethyst.',
        'You can also zap a person directly: the Zap button is second in the round-button row on their profile.',
      ],
      showMe: [
        actionRowStep(
          '.action-btn-zap',
          'Zap',
          'Zap sends Bitcoin sats over Lightning — the bolt and its sat total turn orange, the one non-purple accent in the row.',
        ),
      ],
    },

    // ----------------------------------------------------- Finding things --
    {
      // §Home — app bar; §Home — sub-taby
      id: 'switch-feeds',
      category: 'Finding things',
      question: 'How do I switch feeds — All Follows, Global, lists, hashtags?',
      answer: [
        'On Home, tap the feed label in the top-center of the app bar — "All Follows ⌄".',
        'A dialog opens with your feeds grouped: All Follows, Global, your lists, followed hashtags and communities.',
        'Pick one — the label updates to show the active feed.',
      ],
      note: 'The "New Threads / Conversations" tabs under the app bar only split new threads from replies — switching Following↔Global happens in this selector, not there.',
      // Text-only: the sim's selector is a flat cosmetic popup with no anchor
      // (gaps ame-05).
    },
    {
      // §Home — app bar (⚠️ version nuance); §Home — bottom nav
      id: 'search',
      category: 'Finding things',
      question: "How do I search — there's no Search tab?",
      answer: [
        'Amethyst has no Search tab: the five bottom icons are Home, Messages, Shorts, Discover and Notifications.',
        'Look in the top app bar instead — recent builds put the magnifier (Search) in the right-hand slot.',
        'The globe tab is Discover — content discovery, not search.',
      ],
      note: 'The right app-bar slot varies by version: our reference build shows the relay indicator there, while newer source ships the magnifier.',
    },
    {
      // §Messages
      id: 'dms',
      category: 'Finding things',
      question: 'Where are my direct messages (DMs)?',
      answer: [
        'Tap the envelope — second of the five icons in the bottom bar.',
        'Messages opens with two tabs: "Known" for people you already talk to and "New Requests" for strangers.',
        'Tap the purple "+" button in the corner to start a new message.',
      ],
      note: 'Public chats like "Nostr Public Chat" appear in the same list with square group icons.',
      showMe: [
        {
          target: '.md-bottom-nav-item[aria-label="Messages"]',
          title: 'The Messages tab',
          content: 'The envelope opens Messages — "Known" holds people you know, "New Requests" quarantines strangers.',
          position: 'top',
          commands: goHome,
        },
        {
          target: '[data-tour="amethyst-messages"]',
          title: 'Your conversations',
          content: 'Each row shows the avatar, name, a ⚡ if they can receive zaps, the last message and its time.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'messages' }),
        },
      ],
    },
    {
      // §Notifications; §Home — bottom nav
      id: 'notifications',
      category: 'Finding things',
      question: 'How do I read my notifications (and that chart at the top)?',
      answer: [
        'Tap the bell — last of the five bottom icons; a purple dot marks unread activity.',
        'The summary row at the top ("Today ⌄") totals your replies, boosts, hearts and zaps for the period.',
        'Below it, the weekly chart plots your week — event counts on the left axis, sats earned on the right.',
        'Reactions are grouped by type (⚡ 🔁 ♥ 👍 🔥 🤙 👀), each row with the avatars of the people who reacted.',
      ],
      showMe: [
        {
          target: '.md-bottom-nav-item[aria-label="Notifications"]',
          title: 'The bell tab',
          content: 'A purple dot appears here when you have unread activity.',
          position: 'top',
          commands: goHome,
        },
        {
          target: '[data-tour="amethyst-notifications"]',
          title: 'Amethyst\'s signature screen',
          content: 'Daily summary on top, the two-axis weekly chart below, then reactions grouped by emoji type.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'notifications' }),
        },
      ],
    },
    {
      // §Profile
      id: 'follow',
      category: 'Finding things',
      question: 'How do I follow or unfollow someone?',
      answer: [
        'Open their profile — tap their avatar or name on a note.',
        'Tap "Follow" in the round-button row level with the avatar (Message · Zap · Follow · Add to list).',
        'The label flips to "Unfollow" once you follow.',
      ],
      note: 'Amethyst\'s profile has no followers/following stats bar — the counts live in the headers of the Follows and Followers tabs further down.',
      showMe: [
        {
          target: '[data-tour="amethyst-follow"]',
          title: 'Follow',
          content: 'Follow is a filled tonal button in the profile\'s action row — its label flips to Unfollow once you follow.',
          position: 'bottom',
          commands: cmd({ type: 'login' }, { type: 'viewProfile' }),
        },
      ],
    },
    {
      // §Home — treść (rząd LIVE); §Live activity
      id: 'live-bar',
      category: 'Finding things',
      question: 'What is the "LIVE" bar at the top of my Home feed?',
      answer: [
        'That bar is a live-stream bubble: someone you follow is streaming right now — it shows the stream title with a LIVE badge and viewer/zap counts.',
        'Tap it to open the stream view with its live chat bubbles.',
        'Type in "reply here.." and tap Post to join the chat.',
      ],
      note: 'It is a single bubble that scrolls with the feed, not a stories carousel — Amethyst has no stories.',
      // Text-only: the sim's LIVE bubble is inert and the stream view does not
      // exist (gaps ame-08/ame-09).
    },

    // -------------------------------------------------------------- Relays --
    {
      // §Account drawer; §Settings suite (Relays); §Home — app bar
      id: 'manage-relays',
      category: 'Relays',
      question: 'How do I add or remove relays?',
      answer: [
        'Tap your profile picture in the top-left to open the account drawer.',
        'Tap "Relays".',
        'The screen groups your Public Outbox and Public Inbox relays, each row with its own stats.',
        'Tap "Add a Relay" to add one.',
      ],
      note: 'The grey counter in the top bar (e.g. "16/16") is your relay indicator — it lives on every main screen. Newer versions split the relay editor by purpose (outbox model): DM Inbox, Search, Local, Blocked and more, each with its own "Add a Relay" field.',
      showMe: [
        {
          target: '[data-tour="amethyst-drawer-relays"]',
          title: 'Relays live in the drawer',
          content: 'Open the drawer with your avatar — the Relays row shows your connected count.',
          position: 'right',
          commands: openDrawer,
        },
        {
          target: '[data-tour="amethyst-settings"]',
          title: 'Your relays',
          // Descriptive — the sim's "Add a Relay" button is display-only
          // (gaps ame-42).
          content:
            'Public Outbox and Public Inbox groups with per-relay stats — the Add a Relay button sits below each group\'s rows.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'openSettings', payload: 'relays' }),
        },
      ],
    },

    // ------------------------------------------------------ Account & keys --
    {
      // §Account drawer — location only; screen internals need upstream
      // grounding (recording never opens Backup Keys).
      id: 'backup-keys',
      category: 'Account & keys',
      question: 'Where do I back up my private key (nsec)?',
      answer: [
        'Tap your profile picture in the top-left to open the account drawer.',
        'Tap "Backup Keys".',
        'Copy your private key from there — a password manager is a good place. It can also show the key as a QR code.',
      ],
      note: 'Your nsec IS your account — if you lose it no one can recover it. Newer versions moved this into Settings → "Danger Zone" → Backup Keys: copying prompts for your fingerprint and can also produce a password-encrypted ncryptsec copy.',
      showMe: [
        {
          target: '[data-tour="amethyst-drawer-backup-keys"]',
          title: 'Backup Keys',
          // Descriptive — the sim's row is display-only (gaps ame-35).
          content: 'Your nsec lives here, in the account drawer — the single most important row in the app.',
          position: 'right',
          commands: openDrawer,
        },
      ],
    },
    {
      // §Settings suite (Security Filters); §Account drawer
      id: 'mute',
      category: 'Account & keys',
      question: 'How do I mute or block someone, and where do I manage the list?',
      answer: [
        'To block someone: long-press their note and choose "Block", then confirm with "Block & Hide User" — or open their profile, tap the top-bar menu and pick "Block & Hide User" there.',
        'To manage the list: tap your profile picture to open the account drawer, then tap "Security Filters".',
        'Switch between the Blocked, Spammers and Hidden tabs to see filtered accounts.',
        'Tap "Unblock" next to someone to let them back into your feeds.',
      ],
      note: 'Amethyst says "Block" where other clients say "Mute" — muting is for threads and words. Blocking hides content in your app and writes your public mute list; the other person\'s notes stay visible to everyone else.',
      showMe: [
        {
          target: '[data-tour="amethyst-drawer-security-filters"]',
          title: 'Security Filters',
          content: 'Everything you have blocked, muted or hidden is managed from this drawer row.',
          position: 'right',
          commands: openDrawer,
        },
        {
          target: '[data-tour="amethyst-settings"]',
          title: 'Your filters',
          content: 'Blocked, Spammers and Hidden tabs — with the spam filter toggles above them.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'openSettings', payload: 'security' }),
        },
      ],
    },

    {
      // Upstream (vitorpamplona/amethyst, main, checked 2026-08-06):
      // DrawerContent.kt "Accounts" row → AccountSwitchBottomSheet with a
      // per-account logout icon + confirmation dialog. The recording-era
      // drawer has no such row, so this entry is TEXT-ONLY.
      id: 'logout',
      category: 'Account & keys',
      question: 'How do I log out of Amethyst?',
      answer: [
        'Tap your profile picture to open the account drawer.',
        'Tap "Accounts" — the bottom row of the drawer.',
        'In the account sheet, tap the logout icon on your account\'s row and confirm.',
      ],
      note: 'The dialog warns you: logging out deletes all local data on this phone. Back up your nsec first — without it the account is gone for good.',
    },

    // ------------------------------------------------------------ Advanced --
    {
      // §Account drawer; §Compose (toolbar). Screen internals need upstream
      // grounding — see the coverage 'todo's resolved after upstream recon.
      id: 'media-servers',
      category: 'Advanced',
      question: 'How do I change where my photos and videos get uploaded (media servers)?',
      answer: [
        'For a single upload: attach the image or video in the composer — the upload dialog has a "File Server" dropdown to pick where this file goes.',
        'For your permanent list: tap your profile picture to open the account drawer, then tap "Media Servers".',
        'There you reorder upload priority (row #1 is "Primary"), pick from recommended servers, or paste your own server address.',
      ],
      note: 'Newer versions are Blossom-first: the add field says "Add a Blossom Server" and uploads try each server from the top down (with optional mirroring to all).',
      showMe: [
        {
          target: '[data-tour="amethyst-drawer-media-servers"]',
          title: 'Media Servers',
          // Descriptive — the sim's row is display-only (gaps ame-33).
          content: 'Your upload servers are picked here — media from the composer goes to the selected server.',
          position: 'right',
          commands: openDrawer,
        },
      ],
    },
    {
      // Upstream: DrawerSections.kt (Wallet in the "You" section),
      // WalletScreen.kt ("Add NWC Connection", wallet-type chooser, paste
      // nostr+walletconnect:// URI, per-wallet Set as Default/Rename).
      // The recording-era drawer has no Wallet row — TEXT-ONLY.
      id: 'connect-wallet',
      category: 'Advanced',
      question: 'How do I connect a Lightning wallet (for zaps)?',
      answer: [
        'Tap your profile picture to open the account drawer, then tap "Wallet".',
        'Tap "Add NWC Connection" and choose "Connect a Lightning wallet (NWC)".',
        'Either open an installed NWC-capable wallet app, scan its QR, or paste the nostr+walletconnect:// URI, then Save.',
        'You can attach several wallets — set one as the default for zaps.',
      ],
      note: 'Quick Zap amounts and zap privacy live separately, under Settings → Zaps.',
    },
    {
      // Upstream: exists=false — strings.xml (all 5126 lines) has no
      // clear-cache control; the honest answer is the OS-level one.
      id: 'clear-cache',
      category: 'Advanced',
      question: 'How do I clear the cache?',
      answer: [
        'Amethyst has no in-app clear-cache button.',
        'To free up space, use Android itself: long-press the Amethyst icon → App info → "Storage & cache" → "Clear cache".',
        'Logging out also wipes all local data — but only do that with your nsec safely backed up.',
      ],
    },
  ],
};

export default amethystFaq;
