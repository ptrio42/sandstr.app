/**
 * Primal FAQ — grounded in docs/refs/primal/screen-map.md (section refs in
 * comments) with docs/gaps/primal.md as the showMe gate. Settings internals
 * and the login flow (absent from the screen-map) are grounded in the
 * PrimalHQ/primal-web-app upstream source (main, checked 2026-08-06) — cited
 * per entry. showMe steps run through the Primal tour-command bridge
 * (logout / exploreTab unlocked 2026-08-06, gaps pri-04/pri-27).
 */

import type { SimulatorCommand } from '../../simulators/primal/web/WebSimulator';
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

const feedStep = (target: string, title: string, content: string): Step => ({
  target,
  title,
  content,
  position: 'top',
  commands: goHome,
});

export const primalFaq: ClientFaq = {
  clientId: 'primal',
  categories: CATEGORIES,
  coverage: {
    'sign-in': 'sign-in',
    'backup-keys': 'backup-keys',
    logout: 'logout',
    post: 'post-note',
    reply: 'reply',
    reactions: 'like',
    zap: 'zap',
    'connect-wallet': 'connect-wallet',
    'media-uploader': 'media-uploads',
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
      // Upstream: NavMenu.tsx "Get Started" → GetStartedModal "Login to
      // Primal.net" → Advanced login options (Browser Extension / Remote
      // Signer / Nsec Login / Npub Login). Screen-map covers only the guest
      // state (§Home Feed Header 1).
      id: 'sign-in',
      category: 'Getting started',
      question: 'How do I sign in to Primal?',
      answer: [
        'You can browse Primal without an account — the feed greets guests with "Welcome to nostr!".',
        'Click "Get Started" (top of the feed, or the bottom of the left sidebar).',
        'The "Login to Primal.net" dialog opens — under Advanced login options you can sign in with a Browser Extension, a Remote Signer, your nsec, or an npub (read-only).',
      ],
      note: 'Account creation is steered to the Primal mobile app in current versions.',
      showMe: [
        {
          target: '[data-tour="primal-keys"]',
          title: 'The key field',
          // The sim opens on a full login screen (the real app shows the feed
          // to guests — gaps pri-05); the caption describes the real options.
          content:
            'Signing in with an nsec is one of four options — the real app also offers browser-extension, remote-signer and read-only npub logins.',
          position: 'bottom',
          commands: cmd({ type: 'logout' }),
        },
      ],
    },

    // ------------------------------------------------------------ Posting --
    {
      // §Compose / Note Editor 1–6; §Left Sidebar (New Note)
      id: 'post-note',
      category: 'Posting',
      question: 'How do I post a note?',
      answer: [
        'Click the blue "New Note" pill in the left sidebar — or the "Say something on nostr..." pill at the top of the Home feed.',
        'The inline editor expands, framed by a thin blue border. Type your note.',
        'Watch it render live under the faint "NOTE PREVIEW" caption below the text area.',
        'Click "Post" — it stays disabled while the note is empty; "Cancel" closes the editor.',
      ],
      note: 'The three toolbar icons under the text attach media, start a poll, and open the emoji picker.',
      showMe: [
        {
          target: '[data-tour="primal-post"]',
          title: 'New Note',
          content:
            'The solid blue "New Note" pill — compose lives in the left sidebar, with a second way in via the pill at the top of the feed.',
          position: 'right',
          commands: goHome,
        },
        {
          target: '[data-tour="primal-compose"]',
          title: 'The inline editor',
          content:
            'Thin blue border, a toolbar for media / poll / emoji, and a Post button that wakes up once you type.',
          position: 'bottom',
          commands: cmd({ type: 'login' }, { type: 'compose' }),
        },
      ],
    },
    {
      // §Note Card + Action Bar (order; --active-reply grey)
      id: 'reply',
      category: 'Posting',
      question: 'How do I reply to a note?',
      answer: [
        'Find the action row under the note — five icons: reply, zap, like, repost, bookmark.',
        'Click the first icon, the speech bubble.',
        'Write your reply and click "Post".',
      ],
      note: 'An active reply turns grey, not blue — every action in Primal keeps its own state color.',
      showMe: [
        feedStep(
          '.primal-action.reply',
          'Reply',
          // Descriptive — the sim's reply click is inert (gaps pri-13).
          'Reply is always first in the row. In the real app it opens a reply composer under the note.',
        ),
      ],
    },

    // --------------------------------------------------- Reactions & zaps --
    {
      // §Note Card + Action Bar (like #f800c1/#CA079F, repost green)
      id: 'like',
      category: 'Reactions & zaps',
      question: 'How do I like a note — and why does the heart turn pink?',
      answer: [
        'Click the heart — the THIRD icon in the action row, right after the zap bolt.',
        'It fills magenta-pink when liked — the one color Primal kept from its old magenta theme.',
        'Repost is the fourth icon — it turns green once you have reposted.',
      ],
      note: 'Every action has its own active color: like magenta, repost green, zap amber, bookmark blue, reply grey.',
      showMe: [
        feedStep(
          '.primal-action.like',
          'The heart',
          'Third in the row, after the zap bolt — it fills magenta-pink when liked; repost next door turns green.',
        ),
      ],
    },
    {
      // §Note Card + Action Bar (zap SECOND, count = total sats, amber)
      id: 'zap',
      category: 'Reactions & zaps',
      question: 'How do I zap (tip sats to) a note?',
      answer: [
        'Click the lightning bolt — the SECOND icon in the action row, before the heart.',
        'After zapping, the bolt turns amber — and the number beside it is the total sats zapped, not how many people zapped.',
        'Big zaps show as pill rows above the action row: sender avatar, amount, and an optional comment.',
      ],
      note: 'Zapping needs a wallet — see "How do I connect a Lightning wallet for zaps?".',
      showMe: [
        feedStep(
          '[data-tour="primal-zaps"]',
          'Zap',
          'Zap is the SECOND action — before the heart. Amber when active, and the number is total sats, not a zap count.',
        ),
      ],
    },

    // ----------------------------------------------------- Finding things --
    {
      // §Home Feed Header (FeedSelect dropdown, "Notes Feed:")
      id: 'switch-feeds',
      category: 'Finding things',
      question: 'Where are the feed tabs? How do I switch my Home feed?',
      answer: [
        'On Home, click the feed name at the top — "Trending 24h ▾" by default. It is a dropdown, not a tab bar: Primal\'s Home has no tabs.',
        'The panel opens under a "Notes Feed:" caption listing your enabled feeds, with a check on the current one.',
        'Click "Edit Feeds" in the panel to enable, disable, or reorder feeds — it opens Settings → Home Feeds.',
      ],
      note: 'Reads has its own separate feed selector — the Home dropdown lists notes feeds only.',
      showMe: [
        feedStep(
          '.primal-feedselector',
          'The feed dropdown',
          'This dropdown — not tabs — picks your Home feed; it opens a "Notes Feed:" panel with a check on the active one.',
        ),
      ],
    },
    {
      // §Right Sidebar 1 (Search pill); upstream: Enter → /search/{query};
      // §Explore page (Advanced Search link)
      id: 'search',
      category: 'Finding things',
      question: 'How do I search for people or topics?',
      answer: [
        'Type in the "Search..." pill at the top of the right-hand column — it rides along on most pages.',
        'Suggestions appear as you type; Enter opens the full results page.',
        'For more, open Explore — it has a full-width search bar and an "Advanced Search" link beside its tab strip.',
      ],
      showMe: [
        feedStep(
          '.primal-col-right .primal-search',
          'The Search pill',
          'Search tops the right column on most pages — suggestions appear as you type; in the real app Enter opens the results page.',
        ),
      ],
    },
    {
      // §Messages 1-5
      id: 'dms',
      category: 'Finding things',
      question: 'Where are my direct messages?',
      answer: [
        'Click "Messages" in the left sidebar — its blue badge counts unread messages.',
        'Pick a tab above the conversation rail: "follows" or "other"; "Mark All Read" clears the counters.',
        'Conversation rows show the name, the time, and the person\'s verified address — not a message preview.',
        'Type in the composer at the bottom — Enter sends, Shift+Enter adds a newline.',
      ],
      showMe: [
        {
          target: '[data-tour="primal-nav-messages"]',
          title: 'Messages',
          content: 'The fourth nav item — its blue badge counts unread DMs.',
          position: 'right',
          commands: cmd({ type: 'login' }, { type: 'navigate', payload: 'home' }),
        },
        {
          target: '.primal-convo',
          title: 'Your conversations',
          // Descriptive — the sim's composer and Mark All Read are inert
          // (gaps pri-39/pri-40).
          content: 'Rows show name, time and the sender\'s verified address — unread is a blue numeric badge.',
          position: 'right',
          commands: cmd({ type: 'navigate', payload: 'messages' }),
        },
      ],
    },
    {
      // §Notifications 1-4, 7
      id: 'notifications',
      category: 'Finding things',
      question: 'How do I view and filter my notifications?',
      answer: [
        'Click "Notifications" in the left sidebar — the bell with a count bubble.',
        'Filter with the tabs: All, Zaps, Replies, Mentions, Reposts. There is no Reactions tab.',
        'Zap rows spell the amount out — "zapped your note for a total of N sats".',
        '"Summary" in the right column is a rollup of your new activity — a panel, not a view switch.',
      ],
      showMe: [
        {
          target: '[data-tour="primal-nav-notifications"]',
          title: 'The bell',
          content: 'Its bubble counts your unread notifications.',
          position: 'right',
          commands: cmd({ type: 'login' }, { type: 'navigate', payload: 'home' }),
        },
        {
          target: '.primal-notif',
          title: 'Notification rows',
          content: 'Zaps are spelled out with their sat totals; the All / Zaps / Replies / Mentions / Reposts tabs filter the list.',
          position: 'bottom',
          commands: cmd({ type: 'navigate', payload: 'notifications' }),
        },
      ],
    },
    {
      // §Profile action row; §Explore Tab 2 (People, Follow pill)
      id: 'follow',
      category: 'Finding things',
      question: 'How do I follow or unfollow someone?',
      answer: [
        'Open someone\'s profile and click the "Follow" pill in the action row under the banner — the label flips to "Unfollow" once you follow.',
        'Or browse Explore → "People": every card carries a Follow button riding the avatar, with follower counts underneath.',
      ],
      note: 'On your own profile the pill row swaps to a single "Edit Profile" button — you can\'t follow yourself.',
      showMe: [
        {
          target: '[data-tour="primal-follow"]',
          title: 'Follow',
          content: 'Explore → People — every card wears a Follow button on the avatar, follower count underneath.',
          position: 'bottom',
          commands: cmd({ type: 'login' }, { type: 'exploreTab', payload: 'People' }),
        },
      ],
    },
    {
      // §Reads (ReadsHeader, ArticlePreview); §Left Sidebar (My Articles)
      id: 'reads',
      category: 'Finding things',
      question: 'What is Reads — and how do I read or write long-form articles?',
      answer: [
        'Click "Reads" in the left sidebar — Primal\'s home for long-form articles.',
        'Each card shows the title, a two-line summary, topic tags, and a reading-time pill.',
        'Click a card to open the reader — the article with its own reply / repost / zap / like row at the end.',
        'To write your own: while on Reads, the sidebar\'s "New Note" button becomes "My Articles".',
      ],
      showMe: [
        {
          target: '[data-tour="primal-nav-reads"]',
          title: 'Reads',
          content: 'Primal\'s long-form shelf is the second nav item.',
          position: 'right',
          commands: cmd({ type: 'login' }, { type: 'navigate', payload: 'home' }),
        },
        {
          target: '.primal-note',
          title: 'An article card',
          // Descriptive — the reader view is missing in the sim (gaps pri-57).
          content: 'Title, two-line summary, tags and the outlined reading-time pill — in the real app the card opens the full reader.',
          position: 'bottom',
          commands: cmd({ type: 'navigate', payload: 'reads' }),
        },
      ],
    },
    {
      // §Explore page (5 tabs, DVM feed cards, Advanced Search, right column)
      id: 'explore-page',
      category: 'Finding things',
      question: 'What can I find on the Explore page?',
      answer: [
        'Click "Explore" in the left sidebar.',
        'Five tabs: "Feeds" — a marketplace of subscribable feeds, each marked FREE or PAID — then "People", "Zaps", "Media", and "Topics".',
        'The right column shows lifetime network stats, "Hot Topics" pills, and trending users.',
      ],
      showMe: [
        {
          target: '[data-tour="primal-nav-explore"]',
          title: 'Explore',
          content: 'Search, five discovery tabs, and network-wide stats live here.',
          position: 'right',
          commands: cmd({ type: 'login' }, { type: 'navigate', payload: 'home' }),
        },
        {
          target: '.primal-feedcard',
          title: 'The feed marketplace',
          content: 'Each card on the Feeds tab is a subscribable feed with a FREE or PAID pill.',
          position: 'bottom',
          commands: cmd({ type: 'navigate', payload: 'explore' }),
        },
      ],
    },
    {
      // §Note Card 5 (bookmark #0C7DD8); §Left Sidebar item 5
      id: 'bookmarks',
      category: 'Finding things',
      question: 'How do I bookmark a note and find it later?',
      answer: [
        'Click the bookmark icon — the last of the five actions under a note. It turns blue once saved.',
        'Open "Bookmarks" in the left sidebar to come back to what you saved.',
      ],
      showMe: [
        feedStep(
          '.primal-action.bookmark',
          'Bookmark',
          'Bookmark closes the action row — blue once saved; saved notes collect under Bookmarks in the left nav.',
        ),
      ],
    },

    // -------------------------------------------------------------- Relays --
    {
      // §Settings → Network (screen-map) + upstream Network.tsx (order:
      // Caching Service, My relays, Connect to relay, Enhanced Privacy)
      id: 'manage-relays',
      category: 'Relays',
      question: 'How do I add or remove relays?',
      answer: [
        'In the left sidebar, click Settings, then "Network".',
        'Under "My relays", every row has a status dot and a "Remove" button with a confirm dialog.',
        'Add a relay under "Connect to relay" — enter a wss:// address.',
        'Optional: tick "Use Enhanced Privacy" to proxy through Primal — relays stop seeing your IP address.',
      ],
      note: 'The right rail on every Settings page mirrors your relay list read-only — a status display, not a manager.',
      showMe: [
        {
          target: '[data-tour="primal-settings-screen"]',
          title: 'Settings → Network',
          // Descriptive — the Network sub-screen is missing in the sim
          // (gaps pri-53); the caption describes the real page.
          content: 'The Network row opens relay management: status dots, Remove buttons, and the "Connect to relay" field.',
          position: 'right',
          commands: cmd({ type: 'login' }, { type: 'navigate', payload: 'settings' }),
        },
        {
          target: '.primal-relay-item',
          title: 'The relay rail',
          content: 'Every Settings page keeps this read-only relay list — green dot connected, red disconnected.',
          position: 'left',
        },
      ],
    },

    // ------------------------------------------------------ Account & keys --
    {
      // Upstream: Settings → Account (/settings/account, nsec-gated, badge
      // "1") → "Your Private Key" → copy. Screen-map: §Settings menu item 1.
      id: 'backup-keys',
      category: 'Account & keys',
      question: 'Where do I find and back up my Nostr keys?',
      answer: [
        'In the left sidebar, click Settings.',
        'Click "Account" — the first row; it appears only when you signed in with an nsec, and carries a "1" reminder badge.',
        'Under "Your Private Key", copy your nsec and store it somewhere safe — a password manager is a good place.',
      ],
      note: 'Signed in via browser extension or remote signer? The Account row is hidden — your key never lives in Primal, which is the point of those logins.',
      // Text-only: the sim's settings menu lacks the Account row (gaps pri-50).
    },
    {
      // Upstream: note "…" menu → "Mute User"/"Mute Thread"; Settings →
      // Muted Content (Users | Words | Hashtags | Threads). Screen-map:
      // §Settings menu item 6.
      id: 'mute',
      category: 'Account & keys',
      question: 'How do I mute someone?',
      answer: [
        'Click the "…" beside a note\'s timestamp and choose "Mute User" (or "Mute Thread" to silence one conversation).',
        'Manage the list under Settings → "Muted Content" — with tabs for Users, Words, Hashtags and Threads.',
      ],
      // Text-only: the sim's "…" menu is inert (gaps pri-14) and the Muted
      // Content sub-screen does not exist (pri-51).
    },
    {
      // §Settings menu footer (Logout + Version); upstream Menu.tsx:94-107.
      id: 'logout',
      category: 'Account & keys',
      question: 'How do I log out of Primal?',
      answer: [
        'In the left sidebar, click Settings.',
        'Scroll to the bottom of the settings menu.',
        'Click "Logout" — it sits in the menu footer beside the app\'s version number, and only shows when you are signed in.',
      ],
      note: 'Back up your nsec before logging out — without it, there is no way back into your account.',
      showMe: [
        {
          target: '[data-tour="primal-logout"]',
          title: 'Logout',
          content: 'The Logout button lives in the settings-menu footer, next to the Version line.',
          position: 'top',
          commands: cmd({ type: 'login' }, { type: 'navigate', payload: 'settings' }),
        },
      ],
    },

    // ------------------------------------------------------------ Advanced --
    {
      // Upstream: NO integrated wallet screen in the WEB app (no /wallet
      // route); Settings → Connected Wallets → Nostr Wallet Connect →
      // "Enter Nostr Wallet Connect String". Screen-map: §Settings menu item.
      id: 'connect-wallet',
      category: 'Advanced',
      question: 'How do I connect a Lightning wallet for zaps?',
      answer: [
        'In the left sidebar, click Settings, then "Connected Wallets".',
        'Choose "Nostr Wallet Connect" and paste your wallet\'s connection string.',
      ],
      note: 'The built-in Primal Wallet is activated in the mobile app — the web app then uses it through the same connection. Default zap amounts live under Settings → Zaps.',
      // Text-only: the Connected Wallets sub-screen does not exist in the sim
      // (gaps pri-51).
    },
    {
      // Upstream: Settings → "Media Uploads" (/settings/uploads, internally
      // Blossom): switch media server + Media Mirrors. Screen-map: §Settings
      // menu item 5.
      id: 'media-uploads',
      category: 'Advanced',
      question: 'How do I change where my images and videos get uploaded?',
      answer: [
        'In the left sidebar, click Settings, then "Media Uploads".',
        'Switch your media server there, or add mirrors so uploads copy to more than one server.',
      ],
      note: 'Uploads from the composer\'s attach button go to the server chosen here (Blossom servers under the hood).',
      // Text-only: the sub-screen does not exist in the sim (gaps pri-51).
    },
    {
      // Upstream: Settings → "Dev Tools" (/settings/devtools) → "Reset Local
      // Storage" (with a technically-savvy-users warning).
      id: 'clear-cache',
      category: 'Advanced',
      question: 'How do I clear the cache?',
      answer: [
        'Primal web keeps app state in your browser: Settings → "Dev Tools" → "Reset Local Storage" clears it.',
        'For anything beyond that, clear the site data in your browser itself.',
      ],
      note: 'Don\'t confuse this with Settings → Network → "Caching Service" — that connects you to Primal\'s cache server (where content comes from); it does not clear anything on your machine.',
      // Text-only: the sub-screen does not exist in the sim (gaps pri-51).
    },
  ],
};

export default primalFaq;
