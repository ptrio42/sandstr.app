/**
 * Damus FAQ — grounded in docs/refs/damus/screen-map.md (section refs in
 * comments). Answers describe the REAL iOS app; showMe steps replay them in
 * the simulator through the Damus tour-command bridge.
 */

import type { DamusSimulatorCommand } from '../../simulators/damus/DamusSimulator';
import type { ClientFaq, FaqShowMeStep } from './types';

/** Typed authoring helper — keeps command payloads honest against the sim. */
const cmd = (...cs: DamusSimulatorCommand[]): DamusSimulatorCommand[] => cs;

const CATEGORIES = [
  'Getting started',
  'Posting',
  'Reactions & zaps',
  'Finding things',
  'Relays',
  'Account & keys',
];

type Step = FaqShowMeStep;

const goHome = cmd({ type: 'login' }, { type: 'navigate', payload: 'home' });
const openDrawer = cmd({ type: 'login' }, { type: 'navigate', payload: 'drawer' });

const actionRowStep = (target: string, title: string, content: string): Step => ({
  target,
  title,
  content,
  position: 'top',
  commands: goHome,
});

export const damusFaq: ClientFaq = {
  clientId: 'damus',
  categories: CATEGORIES,
  entries: [
    // ---------------------------------------------------- Getting started --
    {
      // §11 Login / onboarding (SetupView + LoginView)
      id: 'sign-in',
      category: 'Getting started',
      question: 'How do I sign in with my Nostr key?',
      answer: [
        'Open Damus — the welcome screen shows Create Account and Sign In.',
        'Tap "Sign In".',
        'Enter your key in the "nsec1…" field — there are Paste and QR-scan buttons beside it. Damus accepts nsec, npub, hex, or a NIP-05 address.',
        'Tap "Login".',
      ],
      note: 'Signing in with an npub gives a read-only session — you need your nsec to post.',
      showMe: [
        {
          target: '[data-tour="damus-login"]',
          title: 'The welcome screen',
          content:
            'This is where Damus starts. In the real app, Sign In leads to a secure key field with Paste and QR-scan helpers.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'logout' }),
        },
      ],
    },
    {
      // §5 Side menu, row 3 (bespoke Purple styling)
      id: 'purple',
      category: 'Getting started',
      question: 'What is Damus Purple and where do I find it?',
      answer: [
        'Tap your profile picture in the top-left to open the side menu.',
        'Look for "Purple" — the only colored row, with the ostrich logo.',
        'Tap it to see Damus\'s paid supporter subscription.',
      ],
      showMe: [
        {
          target: '[data-tour="damus-menu-purple"]',
          title: 'Damus Purple',
          content: 'The one colored row in the side menu — Damus\'s supporter subscription lives here.',
          position: 'right',
          commands: openDrawer,
        },
      ],
    },

    // ------------------------------------------------------------ Posting --
    {
      // §2 Bottom nav (compose FAB), §9 Compose
      id: 'post-note',
      category: 'Posting',
      question: 'How do I post a note?',
      answer: [
        'Tap the round gradient "+" button floating at the bottom-right, above the tab bar.',
        'Type your note in the compose sheet.',
        'Tap the pink "Post" button.',
      ],
      showMe: [
        {
          target: '[data-tour="damus-compose"]',
          title: 'The compose button',
          content:
            'This floating purple-to-blue "+" opens the compose sheet — Damus has no center compose tab.',
          position: 'left',
          commands: goHome,
        },
        {
          target: '[data-tour="damus-post"]',
          title: 'Post it',
          content: 'Type your note, then tap Post — it fills with Damus\'s pink gradient once there is text.',
          position: 'bottom',
          commands: cmd({ type: 'compose' }),
        },
      ],
    },
    {
      // §3 Note action bar, §9 Compose
      id: 'reply',
      category: 'Posting',
      question: 'How do I reply to a note?',
      answer: [
        'Find the action row under the note — five gray icons.',
        'Tap the first icon, the speech bubble.',
        'Write your reply and tap "Post".',
      ],
      showMe: [
        actionRowStep(
          '[data-tour="damus-interactions"]',
          'The action row',
          'Every note has this five-icon row: reply, repost, shaka, zap, share.',
        ),
        {
          target: '.damus-action.is-reply',
          title: 'Reply',
          content: 'Reply is always first — the icon and its count turn purple when active.',
          position: 'top',
        },
      ],
    },

    // --------------------------------------------------- Reactions & zaps --
    {
      // §3 Note action bar (default_emoji_reaction, reaction palette)
      id: 'shaka',
      category: 'Reactions & zaps',
      question: 'Why is the like button a 🤙 shaka instead of a heart?',
      answer: [
        'Damus has no heart — the shaka IS the like. Tap the 🤙 icon, third in the action row.',
        'When liked, the shaka fills with Damus\'s purple-to-blue gradient.',
        'You can pick a different default reaction emoji in Settings; non-shaka reactions show as that emoji.',
      ],
      showMe: [
        actionRowStep(
          '.damus-action.is-like',
          'The shaka',
          'Damus\'s like is a shaka 🤙, not a heart — tap it and it fills with the purple-to-blue gradient.',
        ),
      ],
    },
    {
      // §3 Note action bar
      id: 'repost',
      category: 'Reactions & zaps',
      question: 'How do I repost a note?',
      answer: [
        'Tap the repost icon — second in the action row under the note.',
        'The icon and its count turn green once you have reposted.',
      ],
      showMe: [
        actionRowStep(
          '.damus-action.is-repost',
          'Repost',
          'Repost is the second action — it turns Damus green when active.',
        ),
      ],
    },
    {
      // §3 Note action bar (zap conditional), §7 Notifications (Zaps tab)
      id: 'zap',
      category: 'Reactions & zaps',
      question: 'How do I zap (tip sats to) a note?',
      answer: [
        'Tap the lightning-bolt icon — fourth in the action row.',
        'The zap button only appears when the author can receive Lightning payments.',
        'After zapping, the icon turns orange — zaps are always orange in Damus.',
        'Zaps you receive show under the bell tab, in Notifications → Zaps.',
      ],
      showMe: [
        actionRowStep(
          '.damus-action.is-zap',
          'Zap',
          'Zap sends Bitcoin sats over Lightning — the icon turns orange after you zap.',
        ),
      ],
    },

    // ----------------------------------------------------- Finding things --
    {
      // §4 Home header, §5 Side menu
      id: 'side-menu',
      category: 'Finding things',
      question: 'How do I open the side menu (Wallet, Relays, Settings…)?',
      answer: [
        'On the Home feed, tap your profile picture in the top-left corner — it opens the side menu, not your profile.',
        'The drawer lists Profile, Wallet, Purple, Muted, Relays, Bookmarks, Merch, Settings and Logout.',
        'Tap the header itself (your avatar and name) to open your own profile.',
      ],
      showMe: [
        {
          target: '[aria-label="Open menu"]',
          title: 'Your avatar opens the menu',
          content: 'Top-left avatar opens the side menu — not your profile.',
          position: 'bottom',
          commands: goHome,
        },
        {
          target: '[data-tour="damus-menu"]',
          title: 'The side menu',
          content: 'Almost everything lives here: Profile, Wallet, Purple, Muted, Relays, Bookmarks, Settings, Logout.',
          position: 'right',
          commands: cmd({ type: 'navigate', payload: 'drawer' }),
        },
      ],
    },
    {
      // §6 Universe / Search
      id: 'search',
      category: 'Finding things',
      question: 'How do I search for people or topics?',
      answer: [
        'Tap the magnifier tab (third in the bottom bar) — it opens the "Universe 🛸" screen.',
        'Type in the Search field pinned at the top.',
        'As you type, pills appear for the #hashtag and the word search, with matching profiles below.',
      ],
      showMe: [
        {
          target: '.damus-tab[aria-label="search"]',
          title: 'The Universe tab',
          content: 'The magnifier opens Universe 🛸 — Damus\'s search and discovery screen.',
          position: 'top',
          commands: goHome,
        },
        {
          target: '.damus-search',
          title: 'Search here',
          content: 'Damus offers a hashtag pill, a plain word search, and matching profiles as you type.',
          position: 'bottom',
          commands: cmd({ type: 'navigate', payload: 'search' }),
        },
      ],
    },
    {
      // §6 Universe / Search (FollowUserView follow pill)
      id: 'follow',
      category: 'Finding things',
      question: 'How do I follow or unfollow someone?',
      answer: [
        'Find the person via search, or tap their avatar on any note to open their profile.',
        'Tap the "Follow" pill — a monochrome capsule to the right of their name.',
        'The label flips to "Unfollow" once you follow; "Follow Back" appears if they already follow you.',
      ],
      showMe: [
        {
          target: '[data-tour="damus-follow"]',
          title: 'Follow',
          // §1 GrayGradient = the unfollowed Follow fill; §6: outline once
          // following (scene_038 shows an outlined Unfollow).
          content:
            'Follow buttons in Damus are monochrome — a filled pill invites you to Follow; once you follow, it becomes an outlined Unfollow.',
          position: 'bottom',
          commands: cmd({ type: 'login' }, { type: 'viewUser' }),
        },
      ],
    },
    {
      // §7 Notifications
      id: 'notifications',
      category: 'Finding things',
      question: 'How do I view and filter my notifications?',
      answer: [
        'Tap the bell tab (fourth in the bottom bar).',
        'Switch between the All, Zaps and Mentions tabs at the top.',
        'The gear icon opens notification settings; the icon beside it limits notifications to your trusted network.',
      ],
      showMe: [
        {
          target: '.damus-tab[aria-label="notifications"]',
          title: 'The bell tab',
          content: 'A small purple dot appears here when you have unread notifications.',
          position: 'top',
          commands: goHome,
        },
        {
          target: '[data-tour="damus-notifications"]',
          title: 'Filter notifications',
          content: 'Filter with All / Zaps / Mentions at the top; the gear opens notification settings.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'notifications' }),
        },
      ],
    },
    {
      // §2 Bottom nav (tab 2)
      id: 'dms',
      category: 'Finding things',
      question: 'Where are my direct messages (DMs)?',
      answer: [
        'Tap the second tab in the bottom bar — the messages icon.',
        'Your DM conversation list opens; a dot on the tab marks unread messages.',
      ],
      showMe: [
        {
          target: '.damus-tab[aria-label="dms"]',
          title: 'The DMs tab',
          content: 'The second tab opens your encrypted DM conversation list.',
          position: 'top',
          commands: goHome,
        },
        {
          target: '[data-tour="damus-dms"]',
          title: 'Your conversations',
          content: 'DMs on Nostr are encrypted notes — only you and the recipient can read them.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'dms' }),
        },
      ],
    },

    // -------------------------------------------------------------- Relays --
    {
      // §5 Side menu (row 7), §8 Relays screen
      id: 'manage-relays',
      category: 'Relays',
      question: 'How do I add or remove relays?',
      answer: [
        'Tap your profile picture to open the side menu, then choose "Relays".',
        'To add: tap the "Add relay" button next to the "My Relays" title and enter the relay address.',
        'To remove: tap "Edit" in the top bar — minus buttons appear beside each relay.',
        'Each relay shows a status pill: Online, Connecting or Error.',
      ],
      note: 'Relays are the servers that store and forward your notes — most people run 5–10.',
      showMe: [
        {
          target: '[data-tour="damus-menu-relays"]',
          title: 'Relays live in the side menu',
          // §4/§6: the relay-count indicator (SignalView) links to RelayConfig.
          content:
            'Open the drawer with your avatar, then tap Relays — the relay count in the top bar opens it too.',
          position: 'right',
          commands: openDrawer,
        },
        {
          target: '[data-tour="damus-relays"]',
          title: 'My Relays',
          content: 'Add with the button beside the title; remove via Edit. Status pills show Online, Connecting or Error.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'relays' }),
        },
        {
          target: '.damus-segment',
          title: 'Recommended relays',
          content: 'Flip between your own relays and Damus\'s recommended list here.',
          position: 'top',
        },
      ],
    },

    // ------------------------------------------------------ Account & keys --
    {
      // §5 Side menu (TopProfile: npub pill, QR button)
      id: 'copy-npub',
      category: 'Account & keys',
      question: 'How do I copy or share my public key (npub)?',
      answer: [
        'Tap your profile picture to open the side menu.',
        'Under your name, tap the npub pill — it copies your npub and flips to "Copied" for a moment.',
        'Tap the QR button in the drawer header to show a scannable QR code instead.',
      ],
      showMe: [
        {
          target: '[data-tour="damus-npub"]',
          title: 'Your npub',
          content: 'Tap the pill to copy your public key; the QR button above shows it as a scannable code.',
          position: 'bottom',
          commands: openDrawer,
        },
      ],
    },
    {
      // §5 Side menu (row 8 → Settings). The reference recording never enters
      // Settings, so this entry claims only the path (side menu → Settings →
      // Keys) and not the screen's internal grouping. Verify against real
      // Damus (ConfigView) before making the wording more specific.
      id: 'backup-keys',
      category: 'Account & keys',
      question: 'Where do I find and back up my private key (nsec)?',
      answer: [
        'Tap your profile picture to open the side menu, then choose "Settings".',
        'Tap "Keys".',
        'Copy your nsec and store it somewhere safe — a password manager is a good place.',
      ],
      note: 'Your nsec IS your account. Anyone who has it controls your identity; if you lose it, no one can recover it.',
      showMe: [
        {
          target: '[data-tour="damus-menu-settings"]',
          title: 'Open Settings',
          content: 'Settings is near the bottom of the side menu.',
          position: 'right',
          commands: openDrawer,
        },
        {
          target: '[data-tour="damus-settings"]',
          title: 'Keys',
          content: 'The Keys row in Settings is where you view and back up your nsec.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'settings' }),
        },
      ],
    },
    {
      // §5 Side menu (row 6, Muted → MuteList)
      id: 'muted',
      category: 'Account & keys',
      question: "Where do I see the accounts I've muted?",
      answer: [
        'Tap your profile picture to open the side menu.',
        'Choose "Muted" to open your mute list.',
      ],
      showMe: [
        {
          target: '[data-tour="damus-menu-muted"]',
          title: 'Muted',
          content: 'Your mute list lives here in the side menu.',
          position: 'right',
          commands: openDrawer,
        },
      ],
    },
    {
      // §5 Side menu (row 11, Logout confirm behavior)
      id: 'logout',
      category: 'Account & keys',
      question: 'How do I log out of Damus?',
      answer: [
        'Tap your profile picture to open the side menu.',
        'Tap "Logout" — the last row.',
        'If you are signed in with your private key, confirm in the alert.',
      ],
      note: 'Make sure your nsec is backed up first — logging out without it locks you out for good.',
      showMe: [
        {
          target: '[data-tour="damus-menu-logout"]',
          title: 'Logout',
          content: 'The last row of the side menu. Back up your nsec before you tap it.',
          position: 'right',
          commands: openDrawer,
        },
      ],
    },
  ],
};

export default damusFaq;
