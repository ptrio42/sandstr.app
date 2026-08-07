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
  'Troubleshooting',
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
    'multi-account': 'multi-account',
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
      question: 'How do I mute a person or a thread — and can I mute words?',
      answer: [
        'Open the "⋯" at the end of a note\'s action row: "Mute thread" silences that conversation, "Mute" just below it hides its author — both are red and both ask you to confirm.',
        'Use a profile\'s "⋯" for the same "Mute" row; there is no thread option there, and neither appears at all in a read-only session.',
        'Review or undo both in Settings → "Content moderation" → "Mute list" → "Edit", which opens tabs "People" and "Notes" with an "Unmute" on every card.',
        'Do not go looking for muted words or muted hashtags — YakiHonne\'s mute list holds only people and threads, and no mute can be given a time limit.',
        'To hide a word instead, tap the filter icon in the top bar, use "Add filter" and fill "Excluded words": matching notes disappear from that one feed, and the icon gains an orange dot.',
      ],
      note: 'YakiHonne says "mute", never "block" — the word "blocked" survives only in the Mute list\'s own description. Muting needs a signing key: a read-only session has no "Content moderation" row at all and reaches the "Mute list" under "Crashlytics & cache" instead. That same note "⋯" is also the only route to Bookmark, Share, "Share as image" and "Copy note ID".',
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
    {
      // YakiHonne/mobile-app main (what our screen-map reproduces — the spec is
      // titled "YakiHonne Mobile"; registry's repo link points at web-app for
      // attribution, but the WEB client has no switcher at all).
      // lib/views/main_view/widgets/drawer_view.dart :: DrawerItem
      // context.t.manageAccounts → accounts_manager.dart :: AccountManager
      // (DraggableScrollableSheet), rows tagged by AppSigner —
      // nSec/red · nPub/yellow "Read only" · Amber/orange · Bunker/green;
      // onLoginTap(index) switches, _handleSlidableDisconnect removes one,
      // onAllLogout() clears every account.
      //
      // TEXT-ONLY: our drawer (components/Drawer.tsx) ships 5 rows and no
      // "Manage accounts", so there is nothing to spotlight.
      id: 'multi-account',
      category: 'Account & keys',
      question: 'How do I add a second account or switch between accounts?',
      answer: [
        'Tap your avatar in the top-left to open the drawer, then tap "Manage accounts".',
        'The sheet lists every account you are signed in with — avatar, name, NIP-05 and a small coloured type tag. A filled radio dot marks the one you are using.',
        'Tap any other row to switch. Nothing is re-entered: the stored signer is reused and the app reloads as that identity.',
        'Each account carries its own wallet, so switching swaps the Lightning and Cashu wallets along with the identity — a fresh account opens on an empty wallet and its zaps fail until you link one there too.',
        '"Add account" opens the normal Log in screen, so a new account can be any sign-in type — a key ("npub, nsec or hex"), a remote signer via bunker QR or URL, or Amber on Android.',
        'To remove one, swipe its row sideways and tap the red log-out button; if that account has wallets connected, YakiHonne offers to export them first. Removing the account you are CURRENTLY using does not sign you out — the app immediately switches you to the first account left in the list, so check the avatar before you post again. "Logout all accounts" clears everything.',
        'When writing a note you can also switch author without leaving the composer, once more than one account is signed in: a small chevron appears below the avatar at the left of the text field — tap it to unfold your other accounts and tap one to post as them. (The avatar itself just opens a profile preview.)',
      ],
      note: 'The type tag prints the signer type verbatim and tells you what each account can do: "nPub" (yellow) is a public key with no signer and cannot post; "nSec" (red) means the key itself sits on this device; "Amber" (orange) and "Bunker" (green) post normally without YakiHonne ever holding the nsec. Rows show the name and NIP-05 but not the npub, so two accounts with the same display name are hard to tell apart.',
      howNostrWorks:
        'An account on Nostr IS a keypair, so adding one just means the client stores another key — or another connection to a signer that holds one — and switching means it starts signing and querying as a different public key. Everything that makes an account feel like an account (your name and picture, your follow list, your relay list, bookmarks, mutes) is a set of events on relays under that one key, which is why each account arrives with its own feed, follows and DMs and why nothing carries across. A read-only account is a public key with no signer attached: readable, never writable.',
    },

    // ------------------------------------------------------- Troubleshooting --
    // "Why doesn't this work" answers. TEXT-ONLY on purpose: the simulator
    // cannot stage a failure, so a demo here could only contradict itself.
    // Grounded in YakiHonne/mobile-app main + the screen-map (2026-08-07).
    {
      // settings_view/widgets/property_analytics_cache.dart: "Crashlytics &
      // cache" → App cache split into "Cached data" / "Cached media" with a
      // "Clear app cache" action, "Automatic cache purge" (auto-clear at 2GB)
      // and the Crashlytics toggle. main_view_appbar.dart mounts _offlineColumn
      // ("Waiting for network...") when state.isConnected is false.
      id: 'trouble-startup',
      category: 'Troubleshooting',
      question: 'YakiHonne crashes or hangs when I open it — what can I do?',
      answer: [
        'Settings → "Crashlytics & cache" is the screen for this. It breaks the app cache into "Cached data" and "Cached media" with sizes in MB — tick either and press "Clear app cache". It asks you to confirm, and afterwards advises restarting the app so the change takes effect properly.',
        'The same screen has "Automatic cache purge", which clears the cache by itself once it reaches 2GB, and the app will warn you on its own when the cache is growing.',
        'Leave the "Crashlytics" toggle on if you want the crash to reach the developers automatically — it is anonymous crash reporting. If you can describe what you were doing, the version footer at the bottom of Settings also has email and GitHub buttons.',
        'If it hangs rather than crashes, look at the top of the home screen: with no working connection the app bar grows a "Waiting for network..." row with a pulsing line. Generic failures show "Something went wrong !" with a "Try again".',
        'There is no safe mode, no in-app log viewer, and no way to start the app with relays disabled.',
      ],
      howNostrWorks:
        'A Nostr client\'s startup is two jobs, and neither is a server you can restart: open connections to every relay in your list, and replay a local cache of events into the feed. A relay that accepts the connection but never answers leaves the client waiting rather than failing, which reads as a hang; a large or corrupted local cache makes the app churn before it draws anything. Clearing that cache costs nothing you cannot re-fetch — your profile, follows and notes are events living on relays and come back on the next launch. Your private key is the exception: it is stored only on your device, never on a relay.',
      note: 'Not verified upstream: whether clearing the cache also clears your signed-in accounts or wallet connections. Back up your keys before you clear it.',
    },
    {
      // widgets/relay_progress_bar.dart: per-relay check vs forbidden icon,
      // "Successful relays" + details/dismiss. widgets/republish_view.dart:
      // "Republish" with per-relay checkboxes, "Protected event" refusal.
      // widgets/unsent_events_view.dart: "Pending events" (+ desc: they go
      // automatically when connectivity returns — no manual resend).
      // settings_view/widgets/relays_update.dart: Content / Private messages /
      // Search sections, per-relay Read only / Write only / Read/Write, and the
      // verbatim green / grey / red dot legend.
      id: 'trouble-not-delivered',
      category: 'Troubleshooting',
      question: 'My notes are not showing up for other people (or I cannot see theirs)',
      answer: [
        'Watch the publish itself. YakiHonne shows a relay-progress banner counting successful relays against the total; tap "details" to expand it and every relay shows a check if it accepted the note or a forbidden icon if it refused or could not be reached.',
        'To push an already-published note out again, use its "⋯" menu → "Republish". You get your relays as a checkbox list and pick exactly where to re-broadcast. Notes marked as protected are refused — only their author can republish those.',
        'The "Pending events" screen lists what never went out at all: things created while offline or on a bad connection. They send themselves when the connection returns — there is no manual resend button.',
        'Settings → "Relay settings" splits your relays into Content, Private messages and Search, and each relay is Read only, Write only or Read/Write. A relay left on "Read only" will never receive your notes. The dot legend is spelled out on the screen: green is connected, grey pending, red offline.',
        'Check the composer too: the "Publish only to" relay indicator pins a note to one specific relay. If that is on, that relay is the only place your note went.',
        'If it is THEIR notes you cannot see, turn on Settings → "Content moderation" → "Gossip model" ("automatically finds your followees\' posts across different relays"). It ships OFF, and while it is off YakiHonne only ever looks on the relays in your own list — anyone publishing elsewhere is invisible however healthy your relays look.',
      ],
      howNostrWorks:
        'A note exists only on the relays that accepted it, and a reader only sees it if their client queries one of those same relays. There is no delivery, no retry, no central spool. NIP-65 is the convention that fixes this: you publish a relay list saying where to find your notes and where to reach you, and other clients read it to know where to look. So a note nobody sees usually means one of four things — it went only to relays your readers do not read; your write relays are down, paid, or required authentication and rejected it; your relay list is missing or stale so nobody knows where to look; or the publish never happened and is sitting in the pending queue. A green check from a relay means that relay stored it — an acknowledgement, not proof anyone will fetch it.',
    },
    {
      // i18n/en.json error strings, verbatim: noWalletLinkedToYouProfile,
      // noWalletConnectedToYourProfile, toBeAbleSendSats, selectDefaultWallet,
      // noWalletCanBeFound, ensureLnSet, noLnInNwc, errorPayingInvoice,
      // errorSendingSats, errorZappingUsers. screen-map §Wallet + zap: the zap
      // sheet's "Min sats"/"Max sats" chips, "Zap splits", "Invoice" (QR) and
      // "Send"; wallet home row 1 reads "No Wallet Linked" when empty.
      id: 'trouble-zap-failed',
      category: 'Troubleshooting',
      question: 'My zap failed — what went wrong?',
      answer: [
        'Check the money half first, on the Wallet tab (third in the bottom bar). With no wallet connected at all you land on the empty-wallet screen; with a wallet connected but no lightning address on your profile you get a card telling you to link one from the menu above; when everything is set you see the balance and a "Copy LN" pill. Which wallet is selected is shown and changed in Settings → "Wallets".',
        'Fix a missing or broken connection at Settings → "Wallets" — create a Yaki wallet, connect one over Nostr Wallet Connect, use Alby, or paste an NWC string. The same screen also has "Always use external wallet zaps", which hands payment to an installed wallet app instead.',
        'Read the error literally, because YakiHonne names which half broke. Messages about no wallet linked or no default wallet selected are your side. Messages about your lightning address not being set, or not being retrievable from your NWC secret, are the address side. "Error occured while paying using invoice" or "…while zapping users" is the payment itself.',
        'If in-app payment keeps failing, use the zap sheet\'s "Invoice" button. It produces a Lightning invoice and QR you can pay from any wallet outside YakiHonne — that is the reliable bypass.',
        'Watch the "Min sats" and "Max sats" chips on the zap sheet: an amount outside the recipient\'s bounds is rejected by their provider, not by YakiHonne. And "Zap splits" divides one zap between several people, so it can partly succeed.',
      ],
      howNostrWorks:
        'A zap is not a Nostr message with money inside it — it is a Lightning payment with a Nostr receipt wrapped around it, and there are four places it can die. Your client reads the recipient\'s lightning address from their profile event; if they never set one there is nothing to pay, and the zap button is dead through no fault of yours. Your client then asks that server for an invoice and attaches a signed zap request — the server can refuse for an amount below its minimum or above its maximum, or because it is down. Your wallet pays the invoice and can fail on balance, routing, or a wallet connection whose budget has run out. And finally the recipient\'s provider — not you — publishes the zap receipt to relays, so if it does not publish, or publishes where you do not read, the sats really moved and no zap ever appears under the note.',
    },
    {
      // widgets/no_content_widgets.dart: HorizontalViewModeWidget /
      // VerticalViewModeWidget — "You're using view mode" / "Sign in with your
      // private key and join the community." + a Login button.
      // accounts_manager.dart tags an AppSigner.nPub row yellow "Read only".
      // en.json: usingExternalSign / amberNotInstalled / attemptConnectAmber.
      id: 'trouble-read-only',
      category: 'Troubleshooting',
      question: 'I cannot post — the app says I am in view mode',
      answer: [
        'You signed in with an npub. YakiHonne marks it in two places: that account carries a yellow "nPub" type tag in "Manage accounts", and wherever a signing action would be you get a block headed "You\'re using view mode" — "Sign in with your private key and join the community." — with a Login button.',
        'If you tapped "Continue as a guest" instead, you get the "View as" banner on the feed and a cut-down drawer with an orange Login button. Same cause, different entry point.',
        'Fix it without losing the read-only entry: drawer → "Manage accounts" → "Add account", then either paste your key, pick the "Remote signer" card and connect a bunker, or use Amber on Android. Switch to that account from the same sheet, and swipe the npub row away afterwards if you want.',
        'One trade-off worth knowing before you pick a signer: with a bunker the Messages tab is closed — it reads "Messages are disabled" with no new-message button, because YakiHonne will not push every encrypted message through a remote signer. With Amber it shows "Messages Not Loaded" until you tap to load them. Only a key held in the app gives you DMs without a detour.',
        'A different failure that looks the same: if your key lives in an external signer, YakiHonne shows "Using an external signer" and signing breaks with messages like "Amber app is not installed" or a rejected connection attempt. That is a signer problem — reinstall or re-approve rather than re-entering keys.',
      ],
      howNostrWorks:
        'Every note, like, repost, zap request and follow-list change is an event that must carry a signature made with your private key. An npub is only the public half — enough to identify you, fetch your profile and follow your timeline, but mathematically incapable of producing a signature, which is why a view-mode session reads everything and writes nothing. That is a property of the protocol, not a limitation the client chose. The signing key does not have to be inside the app, though: a remote signer, or Amber on Android, holds the key and signs on request, so you can post without ever pasting your nsec into YakiHonne. The identity on relays is identical either way — same key, same profile, same follows; only the ability to sign changes.',
    },
    {
      // widgets/common_thumbnail.dart: ExtendedImage.network with
      // LoadingMediaPlaceHolder / NoMediaPlaceHolder and a
      // mediaServersCubit.fetchBlossomBlob() fallback by hash.
      // settings_view/widgets/media_uploader_settings.dart is the UPLOAD side.
      // property_customization.dart confirms there is no data-saver / autoplay /
      // load-images control anywhere in Customization.
      // NOT claimed: that images route through YakiHonne's imgproxy — the
      // constant exists in constants.dart but common_thumbnail.dart never uses it.
      id: 'trouble-images',
      category: 'Troubleshooting',
      question: 'Images are not loading',
      answer: [
        'YakiHonne does not simply give up on a broken image: it shows a loading placeholder, falls back to a "no media" placeholder, and before that tries to re-fetch the same file from your Blossom servers by its hash. An image that fails in other clients can still appear here if any of your mirrors holds it.',
        'Settings → "Content moderation" → "Media uploader" is where those mirrors are configured — main server, mirror-all, your list, and Blossom content management. It decides where YOUR uploads go and which mirrors the fallback can use; it does not change how other people\'s images load.',
        'For a poisoned cache: Settings → "Crashlytics & cache" → tick "Cached media" → "Clear app cache", then restart as the screen advises.',
        'Two feed switches decide whether media is drawn at all: Settings → "Customization" → "Feed customization" → "Edit" holds "Hide non-followed media" ("Automatically hide images & videos from non-followed users until you tap to reveal."), which is ON by default and is the usual reason strangers\' pictures never appear, plus "Enable video auto play". Beyond those there is no data-saver or media-proxy control.',
      ],
      howNostrWorks:
        'The picture is not inside the note. A note is a short text event whose content happens to contain a URL — sometimes with a tag hinting at the file\'s size, hash and mirrors — pointing at a completely separate third-party host. Relays store the note, never the file, which is why a broken image is almost never a relay problem: the host is down, the file was deleted, the link is hotlink- or geo-blocked, while the note itself is perfectly intact and other people may see the picture fine. Blossom is the useful exception: files there are addressed by their hash rather than their location, so the identical file can be pulled from any mirror that happens to hold it — which is exactly the second attempt YakiHonne makes before giving up.',
    },
    {
      // screen-map §Settings + Relays + Notification toggles:
      // notifications_customization.dart — eight switches in this order.
      // en.json: notifDisabled = "Notifications are disabled!" /
      // notifDisabledMessage. Push is a separate layer (FCM / APNS) from the
      // relay subscription that fills the in-app list.
      id: 'trouble-notifications',
      category: 'Troubleshooting',
      question: 'My notifications stopped arriving',
      answer: [
        'Settings → "Notifications" holds eight switches. Seven of them silence a whole category when they are OFF — push notifications, following, mentions / replies, reactions, reposts, zaps, private messages. "Max mentions" runs the other way: it is ON by default, and it is the ON state that hides things.',
        'When a type is switched off the app tells you directly — "Notifications are disabled for this type, you can enable it in the notifications settings."',
        '"Max mentions" is the sneaky one: it silently hides notifications from any note mentioning more than ten people, which looks exactly like mentions going missing.',
        'The in-app list is filled from relays, so check those too. If the app bar shows "Waiting for network..." or Settings → "Relay settings" shows red dots, nothing arrives however the switches are set.',
        'There is no per-type log, no test notification and no re-register-push button.',
      ],
      howNostrWorks:
        'Nostr notifications are not pushed to you by a server that owes you delivery. They are other people\'s events that happen to reference your public key — a reply or mention tags you, a reaction and a repost are their own event kinds, a zap is a receipt published by the payer\'s Lightning provider, a DM is encrypted to you. Your client finds them by holding an open subscription on your read relays filtered to your key. Under NIP-65, other people\'s clients send things meant for you to the inbox relays in your published relay list — so if that list is stale, points at relays that have gone away, or was never published, strangers\' replies are written somewhere you never query and your notifications simply stop while everything else works. Mobile push adds a second, separate layer that can fail on its own: the in-app list can be full while the phone stays silent.',
    },
    {
      // i18n/en.json: keys / myPublicKey / mySecretKey / copyNpub / showSecret.
      // accounts_manager.dart: radio marks the active row, type tag shows
      // "Read only". relays_update.dart: quickConnectRelay + the dot legend.
      // republish_view.dart takes a generic Event — verified for notes via the
      // ⋯ menu; the entry point for profile/contact events is NOT verified, so
      // the copy does not promise one.
      id: 'trouble-empty-profile',
      category: 'Troubleshooting',
      question: 'My profile is empty and my follows are gone',
      answer: [
        'Check which key you are on first. Drawer → "Manage accounts" lists every account with its type tag and puts a filled radio on the active one — if the empty profile is a "Read only" row, you pasted an npub.',
        'Then compare the key itself: Settings → "Keys" shows "My public key" with a copy button (and "Show secret key!" behind a warning). An empty account is almost always a different key, and nothing has been lost.',
        'If the key is right, the problem is relays: Settings → "Relay settings" — make sure the relays that hold your history are listed and showing green, and use "Quick connect to relay" to add one immediately. On anyone\'s profile the "⋯" menu also has "User\'s relays" so you can see where they actually publish.',
        'Force a refetch rather than trusting a stale local copy: Settings → "Crashlytics & cache" → tick "Cached data" → "Clear app cache".',
        'Your own numbers are on your profile as Followings and Followers — tapping them opens the connections sheet, the quickest way to see whether the list came back empty or merely short.',
        'YakiHonne has no in-app backup or restore of your follow list, and no warning before an empty one is published.',
      ],
      howNostrWorks:
        'There is no account record anywhere — your name and picture are one event and your follow list another, both signed by your key and stored on relays. That gives three distinct ways to look empty. You are signed in with a different key: a second nsec, or an npub you pasted, is a genuinely different identity with its own empty profile, and nothing was lost. Or your client is connected to relays that never had your events, in which case they still exist elsewhere and adding the right relay brings everything back. Or — the dangerous one — profile and follow list are replaceable events, and relays keep only the newest by timestamp, so a client that publishes an empty or partial follow list overwrites the good one on every relay it reached. Recovery then means finding a relay that still holds the good version and republishing it, not restoring an account.',
    },
  ],
};

export default yakihonneFaq;
