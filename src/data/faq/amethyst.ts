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
  'Troubleshooting',
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
    'multi-account': 'multi-account',
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
      // "Zap" is opaque to anyone new; they type what they are trying to do.
      // NOT aliased: "my zap failed" and friends — that is trouble-zap-failed's
      // own question, and a broken zap is a different problem from not knowing
      // where the button is.
      searchAliases: [
        'tip someone',
        'send sats',
        'send money',
        'send bitcoin',
        'give sats',
        'pay someone',
        'donate',
      ],
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
      // "Nobody sees my notes" is the symptom that sends people to the relay
      // screen, and none of those words appear in this entry. Deliberately NOT
      // aliased: "my notes are not showing up", which is trouble-not-delivered's
      // own title — that entry should keep winning its own question.
      searchAliases: [
        'nobody sees my notes',
        'no one sees my posts',
        'nobody can see my posts',
        'change relays',
        'relay list',
        'which relays am i on',
        'add a server',
      ],
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
          // The outbox group, not the screen root: `amethyst-settings` is the
          // full-height screen, which the overlay refuses to spotlight (centred
          // fallback, no ring), so this step used to point at nothing. Framing
          // one group also lets the caption stop generalising over both.
          target: '[data-tour="amethyst-relays-outbox"]',
          title: 'Your relays',
          // Descriptive — the sim's "Add a Relay" button is display-only
          // (gaps ame-42).
          content:
            'Public Outbox/Home Relays: the ones your posts are written to, each with its stored size, and "Add a Relay" under the list. Public Inbox Relays follow below.',
          position: 'bottom',
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
      // Nobody arrives knowing the word "nsec": the question that brings people
      // here is a lost or replaced phone, and the reflex of looking for a
      // password reset that does not exist on Nostr.
      searchAliases: [
        'lost my phone',
        'new phone',
        'phone stolen',
        'is my nsec safe',
        'reset password',
        'forgot password',
        'recover my account',
        'account gone',
        'seed phrase',
        'backup',
        'export my key',
      ],
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
      question: 'How do I mute a person, a word, a thread or a hashtag?',
      answer: [
        'To block a person: long-press their note, tap "Block", then confirm with the red "Block" button in the "Block & Hide User" dialog — or open their profile, tap the ⋮ menu and pick "Block & Hide User".',
        'To mute a word or phrase: tap your profile picture to open the account drawer, tap "Security Filters", open "Hidden Words" and type it into "Hide new word or sentence".',
        'To mute a thread: long-press any note in it and tap "Mute thread" — the same menu then offers "Unmute thread", and Security Filters lists them under "Muted threads".',
        'To mute a hashtag: tap the #tag to open its feed, then tap ⋮ beside Follow in the top bar and pick "Mute hashtag" — that menu is also the only way to unmute it.',
        'To manage the lists: account drawer → "Security Filters" → the "Blocked Users", "Spammers" and "Hidden Words" tabs, each row with an "Unblock" button.',
      ],
      note: 'Amethyst says "Block" only about people; words, threads and hashtags are "muted" — and nothing can be muted for a limited time, every entry stays until you remove it. Blocking hides that account inside your app and adds it to your mute list encrypted, so their notes stay visible to everyone else; "Spammers" fills itself from the "Filter spam" toggle above the tabs and resets when the app restarts. Newer versions replace the tabs with a list of screens — Blocked Users, Spammers, Hidden Words and "Muted threads" — reached from Settings, and add "Mute hashtag", the one kind that never gets a list. Relays are blocked separately, in the "Blocked Relays" section of the relay editor.',
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
    {
      // ui/navigation/drawer/DrawerContent.kt: ListContent → IconRow(title =
      // R.string.drawer_accounts, icon = GroupAdd) at the bottom of the drawer,
      // opening AccountSwitchBottomSheet.kt (DisplayAllAccounts / ActiveMarker /
      // LogoutButton per row). "Add New Account" opens AddAccountDialog.kt,
      // which hosts LoginOrSignupScreen(isFirstLogin = false) — hence sign-up
      // and the NIP-55 external-signer button are available inside it too.
      // AccountCacheState keeps MutableStateFlow<Map<HexKey, Account>>, and
      // AccountPreferenceStores mints one DataStore per account.
      //
      // TEXT-ONLY: our drawer (components/Drawer.tsx:20-32) ships 11 rows and
      // no "Accounts" row, so there is nothing to spotlight. The v1.12.6
      // recording behind our screen-map did not capture the row either — treat
      // as a version gap, not a fidelity bug.
      id: 'multi-account',
      category: 'Account & keys',
      question: 'How do I add a second account or switch between accounts?',
      answer: [
        'Tap your avatar to open the drawer and scroll to the bottom — the last row is "Accounts".',
        'A "Select Account" sheet slides up listing every account you have added, each with its picture, name and shortened npub. The one you are on is marked "Active account".',
        'Tap any row to switch to it. Nothing is logged out — the others stay in the list.',
        'To add one, tap "Add New Account" and paste an nsec into the key field. The same dialog also takes an npub (a read-only account), an ncryptsec (a password field appears), a "Sign Up" button for a brand-new identity, and the Amber button if you have a signer app installed.',
        'Watch the "Log off on device lock" checkbox. Amethyst ticks it for you when the key arrives by QR scan or by opening a nostr link, and an account added that way is deliberately never written to the phone — it disappears from the list when the app restarts. Untick it if you want the account to stay.',
        'To remove just one, tap the logout icon on that account\'s own row.',
      ],
      note: 'Each account keeps its own relays, mutes, bookmarks and feeds in its own store, and Notification Settings has an "Accounts active in the background" section with one switch per account. The account list itself does not sync between devices — your keys live only where you typed them.',
      howNostrWorks:
        'A second account is not a sub-account. On Nostr an account IS a keypair, so adding one means the app now holds a second private key and signs with whichever you picked — nothing is transferred and no server is told. Each key has its own profile, its own follow list, its own relay list and its own DMs, which are encrypted to that key and unreadable by the other. Because a key is just a string, the same identity can be added on any number of clients at once; conversely your list of accounts exists nowhere but the device you typed them into.',
    },

    // ------------------------------------------------------- Troubleshooting --
    // "Why doesn't this work" answers. TEXT-ONLY on purpose: the simulator
    // cannot stage a failure, so a demo here could only contradict itself.
    // Grounded in vitorpamplona/amethyst main (2026-08-07). Where the recon
    // could confirm a string ID but not its English value, the copy paraphrases
    // rather than quotes — see the per-entry comments.
    {
      // settings/ResourceUsageScreen.kt: heap / image cache / image disk /
      // native heap meters + cached note & user counts + relay connection hours
      // and reconnect counts. Read-only: CachePruner runs inside the app and
      // there is NO user-facing clear/prune/safe-mode control.
      // AppSettingsScreen.kt binds each media row to ConnectivityType
      // (ALWAYS / WIFI_ONLY / NEVER).
      id: 'trouble-startup',
      category: 'Troubleshooting',
      question: 'Amethyst crashes or hangs when I open it — what can I do?',
      answer: [
        'There is a real diagnostics screen: Settings → Resource Usage. It shows live heap use (colour-coded), the image cache and image disk cache, how many notes and users are held in memory, plus relay connection hours and reconnect counts.',
        'It is monitoring only — Amethyst has no in-app clear-cache, prune, reset or safe-mode button. Pruning happens automatically.',
        'What you can actually turn down: four media settings each take Always / Unmetered WiFi / Never — Image Preview, Video Playback, URL Preview and Profile Picture. Setting them to Never removes most of the work a heavy launch is doing (Autoplay Videos is a separate on/off switch).',
        'The other lever is your relay list: fewer relays means fewer simultaneous connections and a smaller flood of events at startup.',
        'If the always-on background service is what wedges it, its master toggle and the per-account background switches are in Notification Settings.',
        'Before any reinstall or clearing of app storage: drawer → "Backup Keys" → "Copy my secret key". Amethyst holds your keys in local encrypted storage, so wiping app storage removes every account from the device.',
      ],
      howNostrWorks:
        'A Nostr client is not fetching one page from one server. On launch it opens a socket to every relay in your lists at once and pulls a firehose of events, then holds a live graph of notes and users in memory. The bigger your follows and relay list, the more lands in that graph — which is why a heavy account can hang where a fresh one starts instantly. Nothing about your identity is in that cache: your profile, follows and notes are events on relays under your public key, so a reinstall loses nothing permanent as long as you still hold the nsec. The nsec is the one thing that exists only on your device.',
    },
    {
      // note/NoteQuickActionMenu.kt: LongPressToQuickAction → R.string.broadcast
      // → accountViewModel.broadcast(note). relays/AllRelayListScreen.kt groups
      // relays by purpose (home/outbox, notifications/inbox, private in/out,
      // broadcast, proxy, indexer, search, local, trusted, favourite, blocked,
      // connected) — the recon confirmed the section IDs but NOT their English
      // labels, so this copy describes the grouping without quoting it.
      id: 'trouble-not-delivered',
      category: 'Troubleshooting',
      question: 'My notes are not showing up for other people (or I cannot see theirs)',
      answer: [
        'Long-press the note and choose "Broadcast" — that republishes the exact same signed note to your relays.',
        'Open the drawer and check the counter on the "Relays" row. It shows connected out of total; a number well below the total means you are writing to fewer relays than you think.',
        'Open the relay settings screen. It is not one flat list — relays are grouped by job, each group with its own explainer: the ones your notes are written to, the ones other people reach you on, private in and out, broadcast, search, and a group listing what you are connected to right now.',
        'Open a relay\'s own details. Relays advertise Auth Required, Payment Required, Restricted Writes and a minimum proof-of-work — any of these accepts your connection and then refuses your notes. An auth-required relay only works if Settings → Relay Authentication is set to authenticate it; on "Never authenticate" Amethyst ignores the challenge and the relay keeps nothing.',
        'Use "Add a Relay" to publish somewhere else as well; a malformed address is rejected with a message about needing a host name or a bracketed IP.',
        'On long-form posts and lists Amethyst may add "Source relays may be stale" — that flags relays whose monitor reports are over two weeks old, not a delivery failure of your own notes.',
        'If nothing you write leaves at all, check you are not on a watch-only account — see "I cannot post at all".',
      ],
      howNostrWorks:
        'There is no send button that reaches everyone. Publishing means pushing the signed note to each relay you are configured to write to, and a reader only sees it if their client reads from a relay that accepted and kept it. NIP-65 formalises this: you advertise a small set of write relays so followers know where to fetch you, and read relays so people can reach you. If your write relays are down, rate-limiting you, paid-only, or simply not the ones your audience reads, the note is perfectly valid and nobody fetches it. Relays can also silently drop events — accepting a message is not a promise to store it. That is why rebroadcasting is safe and normal: the note id and signature are unchanged, you are just handing the same event to more relays.',
    },
    {
      // strings.xml, verbatim: user_does_not_have_a_lightning_address_setup…,
      // no_zap_amount_setup_long_press_to_change, send_payment_no_methods,
      // send_payment_requesting_invoice / _nostr / _paying_via /
      // _sent_to_wallet, invoice_expired, podcast_value_keysend_requires_nwc,
      // login_with_a_private_key_to_be_able_to_send_zaps.
      // settings/NIP47SetupScreen.kt = the NWC wallet setup.
      id: 'trouble-zap-failed',
      category: 'Troubleshooting',
      question: 'My zap failed — what went wrong?',
      answer: [
        'Amethyst names the stage that broke, so read the message. "User does not have a lightning address set up to receive sats" means the recipient has none — nothing on your side can fix that.',
        '"No Zap Amount Setup. Long Press to change" means your own presets are empty: long-press the ⚡ on any note to open the zap-amount screen and add some.',
        'On a watch-only account you get "You are using a public key and public keys are read-only. Login with a Private key to be able to send zaps" — the zap request itself has to be signed.',
        'Watch which progress message it stalls on. "Requesting invoice…" hanging is the recipient\'s Lightning server; a stall after "Paying via…" is your wallet. Without a connected wallet Amethyst just hands the invoice over — "Invoice handed to your wallet app to complete the payment." — and the rest is that app\'s problem.',
        'Attach a wallet properly: drawer → "Wallet" → "Add NWC Connection" → "Connect a Lightning wallet (NWC)". Some recipients require it outright ("Connect a Nostr Wallet Connect wallet to send to keysend (node) recipients.").',
        'Check which method you are actually on. The Send Payment sheet has a "Receive on" row — Lightning, CLINK Offer, On-chain or Cashu — following what the recipient announced. Cashu fails with "Not enough balance in a mint this recipient accepts", on-chain with a minimum-sats message, and both CLINK and a plain bitcoin address pay directly with NO zap receipt, so the money moves and the ⚡ count never changes.',
        'An invoice left too long is simply marked "Expired" — start again.',
      ],
      howNostrWorks:
        'A zap is not a Nostr message that carries money — it chains three separate systems and each fails differently. First your client reads a lightning address out of the recipient\'s profile event; if that field is empty or the profile you fetched is stale, there is nothing to pay. Second it asks that address\'s server for an invoice, which can fail because the server is down or your amount is outside its limits. Third your wallet pays the invoice — no balance, no route, expired — and that leg happens entirely outside Nostr. Only afterwards does the recipient\'s server publish a zap receipt to relays, and that receipt is what everyone sees as the ⚡ count. So a zap can be paid and still look failed: the money moved, the receipt never reached a relay you read.',
    },
    {
      // strings.xml: nine per-action refusals all opening "You are using a
      // public key and public keys are read-only. Login with a Private key to
      // be able to …" (reply / boost / like / zap / follow / unfollow / upload /
      // sign events / hide word). AccountSwitchBottomSheet.kt renders no
      // read-only badge, so the first signal really is the refusal.
      id: 'trouble-read-only',
      category: 'Troubleshooting',
      question: 'I cannot post, like or follow anything',
      answer: [
        'You are signed in with an npub. Amethyst tells you the moment you try — every write action refuses with the same opening: "You are using a public key and public keys are read-only. Login with a Private key to be able to…" (reply, boost, like, zap, follow, upload, and more).',
        'Two ways to land here without meaning to. Typing a NIP-05 address (name@domain) instead of a key logs you in read-only — Amethyst looks the name up and keeps only the public key it finds. And if you signed in through Amber, the same actions fail with "Signer not found — was the Signer app uninstalled?" instead: that account CAN write, its signer just is not answering, so reinstall the signer rather than pasting an nsec.',
        'It does not warn you up front either: rows in the "Select Account" sheet look identical whether an account can sign or not, and there is no read-only badge anywhere in the app.',
        'Fix it without losing the read-only account: drawer → "Accounts" → "Add New Account" → paste your nsec → Login. Then pick that account in the sheet. The npub one stays in the list.',
        'If your key lives in Amber or another signer app, use the external-signer button in that same dialog instead of pasting anything — the key never enters Amethyst.',
        'A soft second signal: read-only accounts are missing from the per-account background switches in Notification Settings, which are only offered for accounts that can write.',
      ],
      howNostrWorks:
        'An npub is only the public half of the keypair. Everything that changes anything on Nostr — a note, a reply, a like, a repost, a follow, even a zap request — is an event that must carry a signature made with the private half, and relays reject anything unsigned. So a client holding only an npub genuinely cannot write; this is arithmetic, not the app being cautious. Reading needs no key at all, which is why a watch-only session shows a completely normal timeline. The way out is to give the app something that can sign: the nsec itself, or a delegate that holds it — an Android signer app like Amber, or a remote signer — which signs on request and hands back the signed event without ever revealing the key.',
    },
    {
      // AppSettingsScreen.kt media section: automatically_load_images_gifs,
      // automatically_play_videos, autoplay_videos,
      // automatically_show_url_preview, automatically_show_profile_picture —
      // each bound to ConnectivityType (ALWAYS / WIFI_ONLY / NEVER). Sensitive
      // content defaults to Warn (screen-map §Settings suite). Tor: strings.xml
      // tor_relay = "Forces Tor when connecting". Blossom (nipB7Blossom)
      // governs YOUR uploads, not other people's images.
      id: 'trouble-images',
      category: 'Troubleshooting',
      question: 'Images and videos are not loading',
      answer: [
        'Settings → Media & Data has four three-state controls — Image Preview, Video Playback, URL Preview and Profile Picture — each set to Always, Unmetered WiFi or Never, plus a separate on/off "Autoplay Videos" switch. Images blank on mobile data but fine on Wi-Fi means one of the three-state rows is on Unmetered WiFi.',
        'Security Filters shows sensitive content as "Warn" by default, which hides flagged media behind a warning rather than failing to load it.',
        'If you have Tor on — or a relay marked "Forces Tor when connecting" — media hosts that block Tor exits will fail while your notes keep arriving normally.',
        'Settings → Resource Usage counts image traffic and image cache separately from relay traffic, so you can see whether images are being fetched at all.',
        'Amethyst has no image-proxy or mirror setting: it loads media from whatever URL is in the note. Its media-server (Blossom) settings decide where YOUR uploads go, not where other people\'s images come from.',
      ],
      howNostrWorks:
        'An image is not part of the note. A note is a small text event on relays; a picture in it is just a URL to an ordinary web host that has nothing to do with Nostr and owes you nothing. So the note can arrive perfectly while the image fails — the host deleted the file, went down, geo-blocks or Tor-blocks you, or rate-limits. None of that shows up as a relay problem, because it is not one. It also means images and notes rot on different clocks: a relay may keep your event for years — though nothing guarantees it, relays advertise their own retention limits — while the image host expires the file on its own schedule. Uploading is the mirror image — your client pushes the file to a media server and puts the returned URL in the note, which is why upload settings and relay settings are two different screens.',
    },
    {
      // settings/NotificationSettingsScreen.kt: sections delivery / display /
      // categories; master service toggle; per-account "keep active in
      // background"; battery-optimization banner; per-channel state (on /
      // silent / off) opening the system settings. PULL_NOTIFICATION.md: the
      // always-on service is opt-in and OFF by default, and holds sockets to
      // your inbox + DM relays.
      id: 'trouble-notifications',
      category: 'Troubleshooting',
      question: 'My notifications stopped arriving',
      answer: [
        'Open Notification Settings — it is organised into delivery, display and categories.',
        'If you have a UnifiedPush app installed (ntfy or similar), Delivery starts with a "Push provider" row — a separate delivery path that can read "None", which disables push entirely. Check it first.',
        'Below it, Delivery holds the master switch for the always-on notification service and, crucially for multi-account, a section "Accounts active in the background" with one switch per account. If you added or switched accounts, the new one may simply never have been switched on.',
        'Take the battery-optimisation banner seriously and use its fix button. Without that exemption Android cuts the app\'s network during maintenance windows and notifications stop until you open the app.',
        'Categories lists each Android notification channel with its live state — on, silent or off — and tapping one opens the system settings for it. A channel Android quietly set to silent is the most common invisible cause.',
        'If notifications work but the wrong things are missing, the cause is on the relay screen instead: mentions of you have to land on the relays you listen on.',
      ],
      howNostrWorks:
        'Nostr has no notification server, and nobody holds a list of your devices. A notification is just an event someone published that tags your public key — a reply, a mention, a reaction, a zap receipt — and you find out only if something is subscribed to a relay that received it. NIP-65 is the agreed answer to "where do I send things so this person sees them": you advertise inbox relays and well-behaved clients write mentions there. DMs are separate again, with their own relay list and content encrypted to your key. That leaves two failures that look identical from outside: the phone stopped listening (battery optimisation, force-stopped app, service off), or nothing was ever delivered to a relay you listen on.',
      note: 'The always-on service is opt-in and off by default — if you never enabled it, notifications only arrive while the app is open.',
    },
    {
      // AccountSwitchBottomSheet.kt shows the shortened npub per row and marks
      // the ActiveMarker, so "which key am I on" is answerable in the app.
      // strings.xml stale_relay_hint_label = "Source relays may be stale".
      // No dedicated republish-profile action was found — the copy therefore
      // says "edit and save" rather than naming a button.
      id: 'trouble-empty-profile',
      category: 'Troubleshooting',
      question: 'My profile is empty and my follows are gone',
      answer: [
        'Check which key you are on first. Drawer → "Accounts" shows every account with its shortened npub and marks the current one "Active account". An empty account is nearly always a different key than you think.',
        'The drawer header shows your picture, name and Following/Followers counts, so "0 following" is visible without opening anything.',
        'If it is the right key, the problem is relay-side: your profile and follow list have to exist on relays you are actually reading from. (Amethyst\'s "Source relays may be stale" warning will not help here — it only appears on addressable events such as long-form posts and lists, and it reports that the delivering relays have not been monitored recently, not that your data is missing.)',
        'Use "Add a Relay" to add relays likely to still hold your old data, then let the client refetch. Follows reappearing after a re-sync is normal, not luck.',
        'Before experimenting, secure the key itself: drawer → "Backup Keys" → "Copy my secret key" (or the encrypted version with a password). There is no account recovery without it.',
        'There is no one-tap "republish my profile and follows" button. "Broadcast" in a note\'s long-press menu rebroadcasts that note only; for the profile, edit and save it so a fresh event goes out.',
      ],
      howNostrWorks:
        'Your profile and follow list are not account records on a server — they are two ordinary events published under your public key, and they are "replaceable": each relay keeps only the newest one it has seen and discards the older. Three consequences explain almost every empty-profile report. A different key is a different, genuinely empty person — nothing links two keypairs, so one wrong character looks exactly like data loss. Connect to relays that never received your profile and follow list and the client honestly has nothing to show, while the data sits intact on relays you are not talking to. And because only the newest survives, a client that publishes a shorter follow list can overwrite a longer one on the relays that accept it — the fuller list still exists on the relays that missed the update, which is why follows sometimes come back.',
    },
  ],
};

export default amethystFaq;
