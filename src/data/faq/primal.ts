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
  'Troubleshooting',
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
    'multi-account': 'multi-account',
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
      question: 'How do I mute a person, a word, a hashtag or a thread?',
      answer: [
        'To mute a person or a conversation, click the "…" beside a note\'s timestamp and choose "Mute User" or "Mute Thread" — both rows appear only on other people\'s notes.',
        'Confirm in the dialog that follows ("Add … to your mute list?" or "Mute this thread?") — nothing is muted until you accept it.',
        'Words and hashtags cannot be muted from a note: go to Settings → "Muted Content", open the "Words" or "Hashtags" tab, type into the "# Mute new word..." / "# Mute new hashtag..." box and press "mute".',
        'On that screen the "Users", "Words" and "Hashtags" tabs carry an "unmute" button on every row; the "Threads" tab only lists the muted notes, so unmute a thread from its own "…" menu with "Unmute Thread".',
        'To adopt someone else\'s mute list, open their profile "…" menu and choose "Follow user\'s mute list", then tune it under Settings → "Content Moderation".',
      ],
      note: 'Primal has no timed mutes — every mute lasts until you undo it. All four kinds go into a single Nostr mute list published on your account, so what you mute here is muted wherever else you sign in with the same key.',
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
    {
      // Upstream (PrimalHQ/primal-web-app, main): accountStore.ts holds ONE
      // identity — localStorage 'pubkey' + 'loginType' + a single 'primalSec';
      // LOGIN_TYPES are ways to hold that one key, not parallel accounts.
      // ProfileWidget.tsx (the sidebar user chip) is a plain <A> to your own
      // profile — no menu, no sheet. A tree-wide grep for switchAccount /
      // addAccount / "another account" returns nothing. Settings/Menu.tsx has
      // the single logout button in the menu footer.
      id: 'multi-account',
      category: 'Account & keys',
      question: 'How do I add a second account or switch between accounts?',
      answer: [
        'Primal web has no account switcher — it holds one key at a time, so switching means logging out and back in.',
        'The user chip at the bottom of the left sidebar is just a link to your own profile; there is no menu behind it.',
        'Left sidebar → Settings → scroll to the bottom → "Logout" (it sits beside the version line).',
        'You are now a guest: click "Get Started" in the sidebar, then "Advanced login options", and sign in with the other identity — browser extension, remote signer, nsec, or npub for a read-only session.',
        'One trap if you use a browser extension: changing the active account INSIDE the extension does nothing here. Primal remembers the public key it logged in with and never re-asks, so it keeps signing as the old identity until you log out and back in.',
        'To come back, repeat the whole cycle with the original key. Primal caches feeds and settings per public key, so the account you return to comes back the way you left it.',
      ],
      note: 'Extension, remote-signer, nsec and npub are four ways to hold ONE key, not four accounts. Settings sync across devices by key, but there is no synced list of accounts — because there is no list. Coming back is not equally easy for all four either: logging out erases Primal\'s remote-signer pairing, so that identity has to be paired again with a fresh bunker:// string or QR.',
      howNostrWorks:
        'On Nostr an account IS a keypair, so switching accounts means switching which private key signs — there is nothing server-side to log out of. Your profile, follow list and notes are events on relays stamped with one public key, so a second identity is simply a second key with its own events. Nothing in the protocol stops a client from holding several keys at once (many do) and nothing requires it either; Primal web just chose one at a time. Signing can also be delegated so the app never holds the key — a browser extension or a remote signer keeps it and signs on request — but that still binds the session to a single key.',
      showMe: [
        {
          target: '[data-tour="primal-logout"]',
          title: 'Logout is the switcher',
          content:
            'With no account switcher anywhere, this button is how you change identity — log out here, then sign in with the other key.',
          position: 'top',
          commands: cmd({ type: 'login' }, { type: 'navigate', payload: 'settings' }),
        },
      ],
    },

    // ------------------------------------------------------- Troubleshooting --
    // "Why doesn't this work" answers. TEXT-ONLY on purpose: the simulator
    // cannot stage a failure, so a demo here could only contradict itself.
    // Grounded in PrimalHQ/primal-web-app main (read at 415952e, 2026-08-07).
    // This is the WEB app — Primal's mobile apps differ (they ship a wallet).
    {
      // Settings/DevTools.tsx: "Reset Local Storage" (confirm: "Are you sure
      // you want to reset local storage?") clears only store_<pubkey>; Dev Mode
      // reveals the harder "Clear Local Storage". nostrAPI.ts:
      // handleSignerFailure → openSignerUnreachableDialog. UpdateAvailableDialog:
      // "A new version of Primal Web is ready" + "Update Now". There is no
      // ErrorBoundary anywhere in src/.
      id: 'trouble-startup',
      category: 'Troubleshooting',
      question: 'Primal will not load or hangs — what can I do?',
      answer: [
        'Reload the page first. Primal web ships no error screen and no safe mode, so a render crash simply leaves you with nothing to click.',
        'Then Settings → "Dev Tools" → "Reset Local Storage". That deletes only the cached feeds and settings for your own key and reloads — it is the right first move for a hang caused by bad cached state, and it does not log you out.',
        'Still stuck: tick "Enable Dev Mode" on that same screen to reveal a harder "Clear Local Storage" that wipes everything and reloads. That one DOES log you out, so have your key ready.',
        'If the shell loads but the FEED never fills, the caching service is the problem, not your cache — everything Primal displays comes over one connection to it, and a failure there shows no error, it just retries silently. Settings → Network → "Restore default caching service" is the fix, and it is the one thing Reset Local Storage cannot do: that address is stored outside your per-key data and survives the reset.',
        'If it hangs while signing rather than while loading, the key holder is the problem, not Primal. With a remote signer you get a "Remote signer unreachable" dialog with Retry and Log out; with a browser extension that never answers, the pending-publish page warns that the extension is not responding.',
        'If a banner offers "Update Now", take it — that swaps in a new build and cache-busts the reload.',
      ],
      howNostrWorks:
        'A Nostr client is just a local app opening connections to relays; no login server has to be up for it to start. What can genuinely stall startup is the signing layer, because Nostr deliberately lets the key live outside the app — in a browser extension, or in a remote signer reached over relays. The client has to wait for that separate process to answer, and if it never does, anything needing a signature hangs while reading works fine. The other startup cost is state: clients cache events locally so the feed is not empty on launch, and a corrupted local cache can wedge the app in a way that has nothing to do with relays or keys.',
    },
    {
      // EventQueue.tsx (/pending): "These actions failed to publish:" with
      // per-item checkbox, "Retrying in {n} seconds...", "Abort Selected" /
      // "Retry Selected", empty state "No events pending".
      // EventQueueWidget: EVENT_PUBLISH_DELAY = 12_000 before the chip shows.
      // Settings/Network.tsx: relay dots connected/disconnected/suspended, the
      // Primal-relay copy checkbox, and Enhanced Privacy (which is why every
      // dot reads suspended once it is on).
      id: 'trouble-not-delivered',
      category: 'Troubleshooting',
      question: 'My notes are not showing up for other people (or I cannot see theirs)',
      answer: [
        'Before you touch a relay, rule out Primal itself: Settings → Content Moderation runs a spam filter and an NSFW filter that are ON by default and hide matching accounts from every feed, thread and search result. That screen answers the question directly — paste an npub, yours or theirs, into its search box and it names the list, and the allow list below exempts it.',
        'Note the two halves of this question have different answers in Primal web. Your relay list governs where your notes are PUBLISHED. What you SEE arrives over a single connection to Primal\'s caching service, so adding relays will not make someone else\'s notes appear — for the reading half, look at the caching-service row in Settings → Network.',
        'Primal keeps a real failed-publish queue. When a send fails, a "Publish pending" chip appears in the left sidebar — click it for the pending page, which lists what did not go out, counts down to the next retry, and offers "Retry Selected" and "Abort Selected".',
        'That chip is deliberately delayed by about twelve seconds, so a note that looks stuck for a moment may still be in flight.',
        'Settings → Network → "My relays" shows each relay with a status dot: green connected, red disconnected, grey suspended. "Connect to relay" adds one by wss:// URL; "Reset relays" puts you back on Primal\'s recommended set.',
        'The single most effective fix for "nobody can see my notes" is on that screen: the checkbox that posts a copy of everything to the Primal relay. It guarantees at least one well-connected relay has your notes.',
        'Beware one diagnostic trap on the same screen: with "Use Enhanced Privacy" on, Primal publishes through its caching service instead of connecting to relays directly, so every relay dot shows as suspended rather than green. That is the setting, not a fault.',
        'There is no per-note rebroadcast in Primal web — "Retry Selected" only works on things still in the pending queue, not on a note that already published. Re-pushing old notes to a newly added relay is a Premium feature: Premium → Nostr Tools → Content Backup lists your events by kind with a Rebroadcast button on each.',
      ],
      howNostrWorks:
        'There is no central Nostr server. When you post, your client signs the note and pushes it to the specific relays you write to — nowhere else — and someone else sees it only if their client reads from a relay that has a copy. So "my note did not reach anyone" is almost always a relay-overlap problem rather than a delivery bug: you wrote where your readers do not read. NIP-65 exists to fix exactly this — you publish a relay list saying where to find you — but only if both sides honour it. Adding one large, widely-read relay to your write set is the blunt fix, because it maximises the chance a stranger\'s read set overlaps yours. And a relay accepting your note is not a promise to keep it: relays may reject, rate-limit or expire events, and some only accept from paying users.',
    },
    {
      // MissingNWCModal: "No Wallet Connected" → link to /settings/nwc
      // ("Connected Wallets"). NoteFooter.startZap gates on
      // accountStore.activeNWC.length === 0. translations.ts toast.zapUnavailable
      // = author has no lightning address. lib/zap.ts: NWC first, else WebLN.
      // Primal Wallet code exists but is commented out in the WEB app.
      id: 'trouble-zap-failed',
      category: 'Troubleshooting',
      question: 'My zap failed or asks me to connect a wallet',
      answer: [
        'Primal web ships no built-in wallet — that is the mobile app. Zapping with nothing connected gives you a "No Wallet Connected" dialog pointing at the Connected Wallets settings page.',
        'Settings → "Connected Wallets" → "Nostr Wallet Connect": paste the connection string from any wallet that speaks NWC.',
        'If the wallet is connected but the zap still fails, read the toast. "Author of this note cannot be zapped because they didn\'t setup their lightning address" is a problem with their profile — nothing on your side fixes it.',
        'Primal web will not even attempt a zap without NWC, so "my browser extension is locked" is never the explanation here — the WebLN fallback in the code is only reachable when paying for a paid author subscription, not from any zap button.',
        'Wrong amounts are a different screen: Settings → Zaps holds your default and your custom presets.',
        'One failure mode never reaches the screen at all: Primal counts the zap as sent the moment it hands the invoice to your wallet, without waiting for the wallet to answer. If the wallet then refuses — empty balance, or a spending budget on the connection string — the bolt still animates and the count still goes up. If a zap looks sent but never appears, check your wallet\'s own history rather than Primal.',
        'There is no zap log and no retry — unlike notes, zaps never enter the pending-publish queue.',
      ],
      howNostrWorks:
        'A zap is not one action but a chain of three, and it can break at any link. First your client reads the recipient\'s lightning address out of their profile event and fetches that endpoint; if the profile has none, or the endpoint does not advertise Nostr support, the zap is impossible before any money moves. Second your client builds a signed zap request and hands it to that endpoint, which returns a Lightning invoice. Third something actually pays it — your wallet over Nostr Wallet Connect, or a browser extension. Only after payment does the recipient\'s Lightning provider publish the zap receipt to relays, and that receipt is the only thing anyone else can see. So a zap can succeed as a payment and still look failed if the receipt never lands on a relay you read — and it can fail with your money untouched if the first step broke.',
    },
    {
      // LoginModal.tsx, npub tab, verbatim (typo included): "Be aware: Logging
      // in with your public key will allow you to browse Nostr in ready-only
      // mode." nostrAPI.enqueueNostr throws 'no_login' for loginType npub;
      // NoteFooter's doLike/doRepost/startZap gate on hasPublicKey(), which is
      // TRUE for an npub session — so nothing is disabled up front.
      id: 'trouble-read-only',
      category: 'Troubleshooting',
      question: 'I cannot post, like or repost anything',
      answer: [
        'Three different things produce this symptom. The first: you logged in with your npub. Primal tells you once, on the "Npub Login" tab — "Logging in with your public key will allow you to browse Nostr in ready-only mode" (the typo is in the shipped app) — and then never mentions it again.',
        'The second: a small "Enter PIN" box appears every time you act, because you encrypted your key with a password at login. Enter it and the action goes through; dismiss it and nothing happens at all. "I forgot my PIN" is not a reset — it warns that it will erase your key and logs you out completely.',
        'The third: you signed in with a browser extension that is locked, removed or disabled, which gives "Nostr extension is required to send events". Unlock it and retry — you do not need to log back in.',
        'There is no read-only badge, banner or disabled state anywhere afterwards, which is what makes this so confusing.',
        'Worse, the buttons are not greyed out AND Primal reports success anyway: the like counter goes up, and a repost even shows a "Reposted successfully" toast, because the app returns success the moment it hands the event off — before signing has failed. Nothing you did was ever signed or published.',
        'Confirm what you are: an npub session gives Primal no private key, so Settings does not even list an "Account" row — that entry only appears when you signed in with an nsec. Its absence is itself the tell.',
        'The fix is a full re-login: Settings → Logout → "Get Started" → "Advanced login options", then sign in with a browser extension, a remote signer, or your nsec.',
      ],
      howNostrWorks:
        'An npub is the public half of a keypair — an address. Every action that changes anything on Nostr (a note, a like, a repost, a follow, even a zap request) is an event that must carry a signature made with the matching PRIVATE key, and relays drop anything unsigned or wrongly signed. So logging in with an npub gives a client everything it needs to READ as you and nothing it needs to WRITE as you. It is not a permission level a client grants or withholds; it is arithmetic. The way to post without handing an app your private key is not npub login but delegated signing: a browser extension or a remote signer keeps the key and returns signatures on request, so the app writes as you while never seeing the secret.',
    },
    {
      // NoteImage.tsx onError falls back from the cached variant to the
      // original URL before giving up. lib/media.ts + MediaContext: media is
      // served resized through Primal's caching service. Settings/Blossom.tsx
      // (/settings/uploads) is the UPLOAD media-server list, not a view
      // setting. Avatars go through the imageCacheWorker service worker.
      id: 'trouble-images',
      category: 'Troubleshooting',
      question: 'Images are not loading',
      answer: [
        'There is nothing to toggle: Primal web has no "load images" setting, no data-saver mode and no viewing proxy option.',
        'Settings → "Media Uploads" looks like the right place and is not — that is the media-server list for files YOU upload. It has no effect on other people\'s images.',
        'What does matter is Settings → Network → the caching service row. Primal serves resized copies of media through that service, so if its dot is red instead of green, images and metadata both suffer. The same screen lets you connect to a different caching service or restore the default.',
        'Primal already retries for you invisibly: when the cached copy fails it checks the author\'s own Blossom media servers for the same file, and only then falls back to the original third-party URL. So a broken image means the cache, every mirror AND the original host all failed — usually because the file is simply gone.',
        'Avatars are cached separately by a service worker, so if avatars specifically look stale app-wide, a hard reload is the lever — "Reset Local Storage" does not touch them.',
      ],
      howNostrWorks:
        'An image is not part of a note. What gets signed and stored on relays is text, and inside that text sits an ordinary https:// URL. The picture lives on a completely separate third-party host that has no relationship to Nostr and made you no promises. If that host deletes the file, goes offline, rate-limits or blocks your region, the note stays perfectly intact and verifiable while the image fails forever — nothing can repair it, because no relay ever had a copy. Clients paper over this by proxying media through their own cache and resizer, which is why the same broken note can render fine in one client and blank in another.',
    },
    {
      // SettingsNotifications.tsx: "Show notifications for:" per-type
      // checkboxes + "Notification preferences:" filters (replies-to-replies,
      // >10 mentions, DMs from follows only, reactions from follows only).
      // index.tsx registers ONLY imageCacheWorker.js — there is no push worker.
      // Settings are published as a signed settings event, so they sync by key.
      id: 'trouble-notifications',
      category: 'Troubleshooting',
      question: 'My notifications stopped arriving',
      answer: [
        'Settings → Notifications is the first place to look. Under "Show notifications for:" there is a checkbox per type — new followers, zaps, reactions, reposts, replies, mentions, live streams. If one type went quiet, its box is the likely culprit.',
        'Below that, four filters quietly suppress things: including replies to replies, ignoring notes with more than ten mentions, and — the usual reason strangers disappear — only showing DMs and only showing reactions from people you follow.',
        'Settings → Muted Content and Settings → Content Moderation can also remove people from your notifications entirely. Check them before concluding anything is broken.',
        'Primal web has no browser or OS push notifications at all, so this can never be a push-permission problem here. Notifications exist only as the in-app page and its sidebar badge — closing the tab is supposed to stop them.',
        'Because Primal computes notifications on its caching service rather than by scanning relays in your browser, a dead caching service empties the list while the rest of the app looks fine. Check the caching-service dot in Settings → Network.',
        'These toggles are synced by key, not stored locally, so a change you made on your phone is already in effect here.',
      ],
      howNostrWorks:
        'Nostr has no notification system. Nothing pushes to you; no server knows you exist and decides to tell you something. A notification is entirely a client-side invention — the client, or an indexing service acting for it, queries relays for events that reference your public key and presents the results as if something arrived. Two things follow. Notifications are only as complete as the relays being queried, so activity published where nobody is reading is activity you will never hear about, however you configure the client. And because scanning that much of the network is expensive, most clients delegate the work to a caching service — when that service is unreachable the list goes empty even though every underlying event exists and is perfectly retrievable.',
    },
    {
      // accountStore.addFollow guards a near-empty contact list with the
      // "This action may result in an error" ConfirmModal. Recovery lives in
      // Premium → Nostr Tools → Contact List Backup (PremiumContactBackup.tsx:
      // Date / Follows / Recover list). ProfileFollowModal footer shows
      // "Last updated: … ago" for the contact list.
      id: 'trouble-empty-profile',
      category: 'Troubleshooting',
      question: 'My profile is empty and my follows are gone',
      answer: [
        'If Primal is about to publish a follow list that would leave you following almost nobody, it stops you with a dialog headed "This action may result in an error". Press Abort — continuing is what actually destroys the list.',
        'Check the key before anything else: click the user chip at the bottom of the left sidebar to open your own profile and read the npub there. If it is not yours, nothing is lost — you are simply in a different identity. (Settings → Account shows it too, but that row only appears if you signed in with an nsec.)',
        'On your profile, open the Following/Followers dialog: its footer shows when your contact list was last updated, which tells you whether a fresh, bad version has just replaced a good one.',
        'Primal does have a real recovery tool, but it is a Premium feature: Premium → Nostr Tools → Contact List Backup lists past versions of your follow list by date and follow count, with a Recover button on each.',
        'Without Premium there is no restore path inside Primal. Your older list is not gone from the network, but you would need another client or a relay still holding a copy.',
        'If the key is right and the profile still looks empty, try Settings → Network → "Reset relays" and watch the dots — a follow list sitting only on relays you no longer connect to reads exactly like an empty account.',
      ],
      howNostrWorks:
        'Everything that makes a Nostr identity feel like an account is a set of REPLACEABLE events published under one key: your profile is one kind of event, your follow list another. Replaceable means what it sounds like — relays keep only the newest per key and discard older versions. So a careless client that publishes a follow list containing two people does not edit your list; it replaces a list of eight hundred with a list of two, everywhere at once, and the old version is gone from any relay that honours the rule. That is why a follow list can vanish in a second and why the protocol has no undo — recovery depends entirely on someone having archived an older copy. The much more common cause is not loss at all: a different key looks like a brand-new account, because no profile or follow list was ever published under it. And the third is retrieval rather than existence — if your relay set changed, your data may be sitting safely on relays you are no longer asking.',
    },
  ],
};

export default primalFaq;
