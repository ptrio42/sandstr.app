/**
 * YakiHonne FAQ — grounded in docs/refs/yakihonne/screen-map.md (section refs
 * in comments). YakiHonne is the long-form client: articles, curations and
 * smart widgets get first-class questions here, not footnotes.
 *
 * showMe gating follows docs/gaps/yakihonne.md — the largest ledger in the
 * repo (89 gaps, 30 of them dead controls), so several demos deliberately
 * stop at "here is the screen" and let the caption describe the real app.
 */

import type { SimulatorCommand } from '../../simulators/yakihonne/YakiHonneSimulator';
import type { ClientFaq, FaqShowMeStep } from './types';

/** Typed authoring helper — keeps command payloads honest against the sim. */
const cmd = (...cs: SimulatorCommand[]): SimulatorCommand[] => cs;

const CATEGORIES = [
  'Getting started',
  'Posting',
  'Reactions & zaps',
  'Long-form',
  'Finding things',
  'Relays',
  'Account & keys',
  'Advanced',
];

type Step = FaqShowMeStep;

// Commands are self-sufficient (each signs in on its own), so every step
// carries exactly ONE — the queue can never drop a second.
const feed = cmd({ type: 'navigate', payload: 'feed' });

/** The action row repeats on every card; the spotlight lands on the first. */
const actionStep = (target: string, title: string, content: string): Step => ({
  target,
  title,
  content,
  position: 'top',
  commands: feed,
});

export const yakihonneFaq: ClientFaq = {
  clientId: 'yakihonne',
  categories: CATEGORIES,
  coverage: {
    'sign-in': 'sign-in',
    'backup-keys': 'backup-keys',
    logout: 'logout',
    post: 'post-note',
    reply: 'reply',
    reactions: 'react',
    zap: 'zap',
    'connect-wallet': 'connect-wallet',
    'media-uploader': 'add-media',
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
      // §Login — landing + SignInScreen (Keys / Remote signer cards)
      id: 'sign-in',
      category: 'Getting started',
      question: 'How do I sign in?',
      answer: [
        'YakiHonne opens on "Enjoy the experience of owning your own data!" with three ways in: "Log in", "Create account" and "Continue as a guest".',
        'Tap "Log in". The two methods — Keys and Remote signer — are cards pinned to the bottom of the screen; the selected one gets an orange border.',
        'With Keys, paste into the single field (it takes npub, nsec or hex) and continue.',
        'With Remote signer, hand the QR or the nostrconnect:// link to your bunker app, or paste a bunker:// address instead.',
      ],
      note: 'Signing in with an npub gives a read-only session — you need your nsec, or a signer, to post. "Continue as a guest" lets you read without any key at all.',
      showMe: [
        {
          target: '[data-tour="yakihonne-keys"]',
          title: 'The landing screen',
          content:
            'Log in, create an account, or just look around as a guest — YakiHonne is one of the few clients that offers all three up front.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'logout' }),
        },
      ],
    },
    {
      // §Home app bar — FeedSelector (6 community sources + relays + packs)
      id: 'feed-sources',
      category: 'Getting started',
      question: 'How do I switch which feed I am reading?',
      answer: [
        'The middle of the top bar is not a title — it is the feed selector. Tap it.',
        'A sheet lists six sources: Recent (the default), Recent With Replies, Trending, Global, Paid and Widgets.',
        'Below those, the same sheet lists your own relays and your packs, so you can read a single relay as a feed.',
      ],
      note: 'The filter icon in the top-right narrows whatever feed you are in, and wears a small orange dot while a filter is active.',
      showMe: [
        {
          target: '[data-tour="yakihonne-feedsel"]',
          title: 'The feed selector',
          content:
            'The centre of the top bar is a control, not a heading — it opens the list of sources.',
          position: 'bottom',
          commands: feed,
        },
      ],
    },

    // ------------------------------------------------------------ Posting --
    {
      // §Compose — FAB + ComposeSheet
      id: 'post-note',
      category: 'Posting',
      question: 'How do I post a note?',
      answer: [
        'Tap the round orange "+" at the bottom-right — a floating button, not a tab.',
        'The Compose sheet slides up. Type into "Write something".',
        'Tap the paper-plane on the orange circle at the top-right of the sheet to publish.',
      ],
      note: 'The toolbar along the bottom of the sheet is, left to right: image, GIF, @ mention, tools (smart widgets) and a scheduler.',
      showMe: [
        {
          target: '[data-tour="yakihonne-compose"]',
          title: 'The compose button',
          content: 'The orange "+" floats over the feed — YakiHonne keeps five icon-only tabs below it.',
          position: 'left',
          commands: feed,
        },
        {
          target: '[data-tour="yakihonne-post"]',
          title: 'Publish',
          content: 'The paper-plane in the orange circle publishes the note; the grey X beside it discards.',
          position: 'bottom',
          commands: cmd({ type: 'compose' }),
        },
      ],
    },
    {
      // §Note action bar (react · reply · repost · quote · zap)
      id: 'reply',
      category: 'Posting',
      question: 'How do I reply to a note?',
      answer: [
        'Look at the row under the note: react, reply, repost, quote, zap.',
        'Tap the speech bubble — second from the left, right after the heart.',
        'The Compose sheet opens with "Replying to {name}" in orange above the field.',
      ],
      note: 'Reply, repost and quote are three different things and all three sit on that same row: a quote wraps the note inside your own, a repost forwards it untouched.',
      showMe: [
        actionStep(
          '[data-tour="yakihonne-interactions"]',
          'The action row',
          'Five actions in this order: react, reply, repost, quote, zap. Bookmark and Share hide in the "⋯" at the end.',
        ),
      ],
    },

    // --------------------------------------------------- Reactions & zaps --
    {
      // §Note action bar — heart is the default reaction, orange when active
      id: 'react',
      category: 'Reactions & zaps',
      question: 'How do I like a note — and can I react with another emoji?',
      answer: [
        'Tap the heart — the FIRST icon in the row under the note.',
        'The heart fills and, with its count, turns orange — YakiHonne colours every active action the same orange.',
        'With one-tap reactions turned off, that tap opens a picker instead: your recent emoji first, then the full set.',
        'Press and hold the heart to see who has reacted.',
      ],
      note: 'Whichever emoji you send replaces the heart on that note for you.',
      showMe: [
        actionStep(
          '.yakihonne-action.is-like',
          'The heart',
          'First in the row, and orange once active — the same orange every interacted action uses.',
        ),
      ],
    },
    {
      // §Note action bar (zap) + zap sheet presets
      id: 'zap',
      category: 'Reactions & zaps',
      question: 'How do I zap (tip sats to) a note?',
      answer: [
        'Tap the lightning bolt — the last of the five actions under a note.',
        'With one-tap zap on, that sends your default amount straight away: 21 sats out of the box.',
        'Otherwise a sheet opens: type an amount or pick a preset (20, 100, 500, 1000, 5000, 10000, 50000, 100000), add a message, then "Send".',
        '"Invoice" instead generates a Lightning invoice and QR that someone else can pay.',
      ],
      note: 'The number beside the bolt is the TOTAL sats a note has earned, not how many people zapped it. Press and hold to see everyone who did.',
      showMe: [
        actionStep(
          '[data-tour="yakihonne-zaps"]',
          'The zap button',
          'Fifth in the row — the number next to it is a running total of sats, not a count of zappers.',
        ),
      ],
    },

    // ---------------------------------------------------------- Long-form --
    {
      // §Discover / Articles — YakiHonne's signature surface
      id: 'articles',
      category: 'Long-form',
      question: 'Where are the long-form articles?',
      answer: [
        'Open the side menu with your avatar and tap "Articles" — long-form is what YakiHonne is built around.',
        'The Discover screen sorts everything into four tabs: All, Articles, Videos and Curations.',
        'An article card carries the author on top with an orange "N min read" beside the time, the title and summary on the left and a rounded thumbnail on the right.',
        'Tap a card to open the reader.',
      ],
      note: 'Long-form is its own screen, not a feed source — the home feed selector\'s six sources are all note feeds.',
      // No showMe: this reproduction has no Discover screen (gaps yak-28), and
      // its side menu has no "Articles" row to point at.
    },
    {
      // §Article reader
      id: 'article-reader',
      category: 'Long-form',
      question: 'What can I do while reading an article?',
      answer: [
        'The "Posted by" row at the top holds the author in orange, a Follow button and a bordered zap button.',
        '"Posted from" names the app the article was written in, then come the summary, the orange hashtag chips and the cover image.',
        'The bar pinned to the bottom is the action row: reactions, replies, quotes, zaps and "⋯" — with no repost.',
        'The pill floating at the bottom centre swaps between "See translation" and "See original".',
      ],
      note: 'Bookmark, Share and "Share as image" live inside that bottom "⋯", not in the header — the same rule as on notes.',
      showMe: [
        {
          target: '[data-tour="yakihonne-article"]',
          title: 'The article reader',
          content:
            'The reading view: the "Posted by" row with Follow and a bordered zap button, the title, "Posted from", the cover image, and the action bar pinned to the bottom.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'openArticle' }),
        },
      ],
    },
    {
      // §Discover (Curations tab) + §Profile (Others → Curations)
      id: 'curations',
      category: 'Long-form',
      question: 'What is a curation?',
      answer: [
        'A curation is a collection somebody assembled — a set of articles or videos published under one cover and title.',
        'Find them on Discover, under the "Curations" tab next to All, Articles and Videos.',
        'A curation card says what is inside on its own line: "12 articles", "5 videos".',
        'Your own curations live on your profile, under "Others" → "Curations".',
      ],
    },
    {
      // §Feed sources (Widgets) + §Compose toolbar (tools)
      id: 'smart-widgets',
      category: 'Long-form',
      question: 'What are smart widgets?',
      answer: [
        'Smart widgets are small interactive cards published as Nostr events — YakiHonne renders them inline in the feed instead of as plain links.',
        'To read a feed of nothing else, tap the feed selector and pick "Widgets", the last of the six sources.',
        'To put one in a note, open the composer and tap the tools icon in the toolbar (fourth, between "@" and the scheduler).',
        'Your own widgets are listed on your profile under "Others" → "Smart widgets".',
      ],
      // No showMe: this reproduction renders the ordinary note feed for every
      // source, so a "Widgets" demo would frame a timeline with no widgets.
    },

    // ----------------------------------------------------- Finding things --
    {
      // §Search overlay (People / Notes / Articles / Media tabs)
      id: 'search',
      category: 'Finding things',
      question: 'How do I search for people or content?',
      answer: [
        'Tap the magnifier in the top-right of the Home screen — one of exactly two icons up there, next to the filter.',
        'Type into the "Search" pill; results refresh on every keystroke.',
        'Switch between the People, Notes, Articles and Media tabs pinned under the field.',
      ],
      note: 'There is no verification tick in the results: a NIP-05 address that checks out is printed in red under the name.',
      showMe: [
        {
          target: '[data-tour="yakihonne-search"]',
          title: 'Search',
          content:
            'Results split into People, Notes, Articles and Media — each person comes back with their NIP-05 address under the name.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'openSearch' }),
        },
      ],
    },
    {
      // §Profile action row
      id: 'follow',
      category: 'Finding things',
      question: 'How do I follow someone?',
      answer: [
        'Open their profile — tap their avatar or name on any note, or find them in Search.',
        'Under the bio and the "{n} Followings {n} Followers" line, tap "Follow" — the button with the orange fill.',
        'Once you follow, the same button flips to "Unfollow" and loses the orange.',
        'Inside an article, the same button sits in the "Posted by" row at the top of the reader.',
      ],
      note: 'Article cards in the feed carry no Follow button at all — a small check glyph beside the author\'s name is how YakiHonne marks someone you already follow.',
      showMe: [
        {
          target: '[data-tour="yakihonne-profile-screen"]',
          title: 'A profile',
          content:
            'Filled orange until you follow, then it flips to Unfollow. On your own profile that same slot reads "Edit profile".',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'viewProfile', payload: 'other' }),
        },
      ],
    },
    {
      // §Bottom nav (tab 4) + §DMs
      id: 'dms',
      category: 'Finding things',
      question: 'Where are my direct messages?',
      answer: [
        'Tap the fourth icon in the bottom bar — the message icon.',
        'A small red dot on that tab means unread messages; long-press it to mark everything as read.',
        'To start a conversation, open the person\'s profile and tap the bordered message button next to Follow.',
      ],
      showMe: [
        {
          target: '[data-tour="yakihonne-dms"]',
          title: 'Messages',
          content: 'Your conversation list — YakiHonne gives DMs a tab of their own in the bottom bar.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'dms' }),
        },
      ],
    },
    {
      // §Notifications + §Settings → Notifications (8 switches)
      id: 'notifications',
      category: 'Finding things',
      question: 'Where are my notifications, and how do I choose which ones I get?',
      answer: [
        'Tap the bell — the fifth and last icon in the bottom bar. Its red dot clears as soon as you open the tab.',
        'To choose what reaches you, open Settings and tap "Notifications".',
        'Eight switches, in order: Push notifications, Max mentions, Following, Mentions / Replies, Reactions, Reposts, Zaps and Private messages — each explains itself underneath.',
      ],
      note: '"Max mentions" is the spam guard: it hides notifications from notes that mention more than ten people.',
      showMe: [
        {
          target: '[data-tour="yakihonne-notifications"]',
          title: 'Notifications',
          content: 'Everything that happened, in one list — replies, reactions, reposts, zaps and mentions together.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'notifications' }),
        },
      ],
    },

    // ------------------------------------------------------------- Relays --
    {
      // §Settings → Relay settings; §Relay orbits
      id: 'manage-relays',
      category: 'Relays',
      question: 'How do I see, add or remove relays?',
      answer: [
        'Open the side menu with your avatar and tap "Settings", then "Relay settings" — the row prints how many are connected, e.g. "Relay settings 10 / 10".',
        'To find new ones, open the side menu and tap "Relay orbits" — "Browse and explore relay feeds".',
        'Relay orbits has four tabs (Following, Network, Collections, Global) and a "Search relay" field.',
        'Each relay card shows an Online or Offline pill, "Followed by {N}" with avatars, its latency in ms, and a "Browse relay" link that reads that relay as a feed.',
      ],
      note: 'Relays are the servers that store and forward your notes. Latency is colour-coded, so a glance tells you which of yours are slow.',
      showMe: [
        {
          target: '[data-tour="yakihonne-relays"]',
          title: 'Relay orbits',
          content:
            'YakiHonne\'s relay browser. It opens on Following — switch to Network, Collections or Global, or use "Search relay", to see relay cards with their status and latency.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'relays' }),
        },
      ],
    },

    // ------------------------------------------------------ Account & keys --
    {
      // §Settings → Keys
      id: 'backup-keys',
      category: 'Account & keys',
      question: 'Where do I find and back up my private key?',
      answer: [
        'Tap your avatar in the top-left to open the side menu, then tap "Settings".',
        'Tap "Keys", then "My secret key".',
        'Tap "show", confirm with "Show secret key!", and use the copy icon — a password manager is a good place to keep it.',
        '"Export keys" on the same screen writes it out as a keys.txt file instead.',
      ],
      note: 'Your secret key IS your account — anyone who has it can post as you, and nobody can restore it if you lose it. The Keys screen only exists for accounts that can sign: a read-only npub session has none.',
      showMe: [
        {
          target: '[data-tour="yakihonne-settings"]',
          title: 'Settings',
          content:
            '"Keys" is the first row here, right under your profile block — that is where the real app shows your secret key.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'settings' }),
        },
      ],
    },
    {
      // §Note "⋯" menu + §Profile "⋯" + §Settings → Content moderation
      id: 'mute',
      category: 'Account & keys',
      question: 'How do I mute someone or silence a thread?',
      answer: [
        'Tap the "⋯" at the far end of the action row under any of their notes.',
        'Choose "mute" — printed in red — and confirm in the "Mute user" dialog. "Mute thread" silences just that conversation.',
        'A profile\'s "⋯" (top-right of the banner) holds the same, alongside copy npub, copy hex and user relays.',
        'To see or undo it: Settings → "Content moderation" → "Mute list", which has separate "People" and "notes" tabs.',
      ],
      note: 'YakiHonne says "mute", not "block" — the only place the word "blocked" appears is the description on the mute list itself. That same note "⋯" is also the only route to Bookmark, Share, "Share as image" and "Copy note id".',
    },
    {
      // Upstream (YakiHonne/mobile-app main, checked 2026-08-06): there is no
      // "Log out" row in the drawer — logout lives in the account sheet.
      id: 'logout',
      category: 'Account & keys',
      question: 'How do I log out or switch accounts?',
      answer: [
        'Tap your avatar in the top-left to open the side menu.',
        'Tap "Manage accounts" — logging out is not a row in the menu itself.',
        'In that sheet, each account has its own logout icon; "Logout all accounts" signs out of every one at once.',
      ],
      note: 'Back up your secret key before you log out — without it that account cannot be restored. The single-account control is an icon with no label, so look for it on your account\'s row.',
    },

    // ----------------------------------------------------------- Advanced --
    {
      // §Wallet tab + §Settings → Wallets
      id: 'connect-wallet',
      category: 'Advanced',
      question: 'How do I connect a Lightning wallet?',
      answer: [
        'Open the Wallet tab — the middle icon of the five in the bottom bar. YakiHonne gives the wallet a tab of its own.',
        'With nothing linked the top row reads "No Wallet Linked": choose "Create Yaki Wallet" for YakiHonne\'s own NWC wallet, or connect an existing one.',
        'Or go through Settings → "Wallets" → "Manage wallets" → "add", which is also where the "Default zap amount" field lives.',
        'To pay from a wallet app on your phone instead, pick it from the external list — the chosen one gets an orange border, and "Always use external" makes it handle every zap.',
      ],
      note: 'That centre tab holds TWO wallets: a Lightning one and a separate Cashu (ecash) one, and the tab shows whichever is active. Once something is linked it displays the balance and your zap history.',
      showMe: [
        {
          target: '[data-tour="yakihonne-wallet"]',
          title: 'The Wallet tab',
          content:
            'A whole tab for the wallet — balance on top, then your zap history. Linking happens from the row above it.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'wallet' }),
        },
      ],
    },
    {
      // §Compose toolbar (image → media sheet)
      id: 'add-media',
      category: 'Advanced',
      question: 'How do I add a photo or video to a note?',
      answer: [
        'To attach one: open the composer with the orange "+", tap the picture icon (first in the toolbar), and pick an image or video — the camera lives in that same sheet.',
        'To change WHERE it uploads: open Settings → "Content moderation" → "Media uploader".',
        '"Active service" chooses between "Regular servers" and "BLOSSOM servers".',
        'Under Regular servers, the "Media uploader" dropdown offers nostr.build (the default), nostr media, nostr check and void cat.',
      ],
      note: 'The upload setting genuinely lives under "Content moderation", not under anything media-shaped — worth knowing before you go hunting. The Blossom server list starts empty, so pick that only if you have a server to add.',
    },
    {
      // §Settings → Crashlytics & cache
      id: 'clear-cache',
      category: 'Advanced',
      question: 'How do I clear the cache?',
      answer: [
        'Tap your avatar in the top-left to open the side menu, then tap "Settings".',
        'Scroll to "Crashlytics & cache" — the last row before "Yaki chest".',
        'In the "App cache" box, tick "Cached data", "Cached media" or both.',
        'Tap "Clear app cache" and confirm — the button stays greyed out until you have ticked something.',
      ],
      note: 'YakiHonne nags you about this on its own: once the cache grows past its limit a warning bar appears at the bottom of the screen.',
    },
    {
      // §Settings → Yaki chest (points programme)
      id: 'yaki-chest',
      category: 'Advanced',
      question: 'What is Yaki chest?',
      answer: [
        'Yaki chest is YakiHonne\'s points programme — the treasure-chest icon whose front coin carries the Bitcoin ₿.',
        'Open Settings and scroll to the very last row, "Yaki chest". It shows a "Connect" button until you join, then an orange "Connected" pill.',
        'Inside, the screen tracks your XP and your tier: Bronze, Silver, Gold, Platinum.',
        'Rewards come in two lists — "One-time rewards" and "Repeated rewards" — each with a "Claim" button and a countdown to the next claim.',
      ],
    },
  ],
};

export default yakihonneFaq;
