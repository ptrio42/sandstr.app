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
  'Advanced',
  'Troubleshooting',
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
  coverage: {
    'sign-in': 'sign-in',
    'backup-keys': 'backup-keys',
    logout: 'logout',
    'multi-account': 'multi-account',
    post: 'post-note',
    reply: 'reply',
    reactions: 'shaka',
    zap: 'zap',
    'connect-wallet': 'connect-wallet',
    'media-uploader': 'change-media-uploader',
    'clear-cache': 'clear-cache',
    'manage-relays': 'manage-relays',
    mute: 'muted',
    dms: 'dms',
    search: 'search',
    notifications: 'notifications',
    follow: 'follow',
  },
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
      // The question arrives as "where is the like button" — people look for the
      // heart they know from everywhere else and do not recognise the gesture
      // they are looking at, so they cannot name it in a search.
      searchAliases: [
        'where is the like button',
        'no heart',
        'why is there no like',
        'how do i like a post',
        'thumbs up',
        'what is the hand',
        'hand emoji',
      ],
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
      // §6/§6a Universe funnel + `.filter` sheet, §8 Add relay
      id: 'relay-feed',
      category: 'Relays',
      question: 'How do I read the notes from just one relay?',
      // "topical relays" is NOT what upstream calls this — the term appears
      // nowhere in damus-io/damus — but it is what people call it when they ask,
      // and an alias is the user's vocabulary, not a claim the answer makes.
      searchAliases: [
        'topical relays',
        'browse a relay',
        'see one relay',
        'relay feed',
        'notes from a specific relay',
        'filter my feed',
      ],
      answer: [
        'The relay has to be on your list first: profile picture → "Relays" → "Add relay", type the address and confirm.',
        'Go to the Universe tab (the magnifying glass).',
        'Tap the funnel in the top bar, right of the relay count.',
        'The sheet lists every relay you have. Leave ONE switch on and turn the rest off — the feed behind it now shows only that relay.',
        'Turn the switches back on to widen it again. An all-on sheet is the same as no filter.',
      ],
      note: 'The switch reads the way round you would hope and the opposite of the word "filter": ON means that relay is shown, OFF means its notes are hidden. There is no per-relay screen in Damus — nothing opens "this relay\'s timeline". Tapping a relay row on the Relays screen opens its details (description, software, supported NIPs), not its notes. The filter is remembered per feed, so the Universe one does not touch your Home timeline.',
      showMe: [
        {
          // The drawer step is not decoration: without it the demo opened on the
          // Relays screen with no explanation of how anybody gets there, and
          // "profile picture -> Relays" is the half of step 1 people are missing.
          target: '[data-tour="damus-menu-relays"]',
          title: 'Relays, in the side menu',
          content: 'Tap your profile picture to open the drawer. "Relays" is the seventh row.',
          position: 'right',
          commands: openDrawer,
        },
        {
          target: '[data-tour="damus-add-relay-button"]',
          title: 'Add the relay first',
          content: 'A relay only shows up in the filter once it is on your list. This is the button beside the "My Relays" title.',
          position: 'bottom',
          commands: cmd({ type: 'login' }, { type: 'navigate', payload: 'relays' }),
        },
        {
          // The field, not the sheet root — that root is screen-sized and the
          // overlay will not spotlight it.
          target: '[data-tour="damus-add-relay-field"]',
          title: 'wss://some.relay.com',
          content: 'Paste or type the address, then confirm with the pink button.',
          position: 'top',
          commands: cmd({ type: 'navigate', payload: 'addRelay' }),
        },
        {
          target: '[data-tour="damus-search-filter"]',
          title: 'The funnel, in Universe',
          content: 'This is the only way into a single-relay feed. It sits right of the relay count, and only on this tab.',
          position: 'bottom',
          commands: cmd({ type: 'navigate', payload: 'search' }),
        },
        {
          target: '[data-tour="damus-relay-toggle"]',
          title: 'One on, the rest off',
          content: 'Every relay you have, one switch each. On = shown. Leave one on and the feed behind this sheet is that relay alone.',
          position: 'top',
          commands: cmd({ type: 'navigate', payload: 'relayFilter' }),
        },
        {
          // The payoff the demo used to skip: the tour ended on the switch, the
          // clip ended on the feed, and the two told different stories. Ringing
          // the header, not the section — the section is screen-sized and the
          // overlay refuses it; the header carries the "N of M" counter, which
          // is the actual evidence the filter narrowed anything.
          target: '[data-tour="damus-universe-feed-header"]',
          title: 'The feed, narrowed',
          content: 'Back on Universe, "All recent notes" now counts only what your switched-on relays carry.',
          position: 'bottom',
          // `navigate search` clears the overlay stack, so this one command also
          // closes the filter sheet the previous step opened.
          commands: cmd({ type: 'navigate', payload: 'search' }),
        },
      ],
    },

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
      // Somebody with a fresh account and no followers does not search for
      // "npub" — they search for the thing they want to happen.
      searchAliases: [
        'how do people find me',
        'my username',
        'my handle',
        'share my account',
        'invite friends',
        'nobody follows me',
      ],
      answer: [
        'Tap your profile picture to open the side menu.',
        'Under your name, tap the npub pill — it copies your npub and flips to "Copied" for a moment.',
        'Tap the QR button in the drawer header to show a scannable QR code instead.',
      ],
      showMe: [
        {
          target: '[data-tour="damus-npub"]',
          title: 'Your npub',
          // Descriptive, not imperative — the sim's pill is display-only
          // (gaps/damus.md dam-13), so the caption must not invite a tap.
          content:
            'This pill holds your public key — in the real app, tapping it copies your npub and the QR button above shows it as a scannable code.',
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
      // Nobody arrives knowing the word "nsec": the question that brings people
      // here is a lost or replaced phone and the reflex of looking for a
      // password reset that does not exist on Nostr. "backup" (one word) is
      // listed because the entry's own title only ever says "back up".
      searchAliases: [
        'lost my phone',
        'new phone',
        'phone stolen',
        'reset password',
        'forgot password',
        'recover my account',
        'restore my account',
        'account gone',
        'locked out',
        'seed phrase',
        'backup',
        'export my key',
      ],
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
          // The row, not the screen: `damus-settings` is the full-height screen
          // root, which the overlay refuses to spotlight (it renders the centred
          // fallback with no ring), so this step used to end pointing at nothing.
          target: '[data-tour="damus-settings-keys"]',
          title: 'Keys',
          content: 'First row of the Account group — Keys is where you view and back up your nsec.',
          position: 'bottom',
          commands: cmd({ type: 'navigate', payload: 'settings' }),
        },
      ],
    },
    {
      // §5 Side menu (row 6, Muted → MuteList). Section list and the add-item
      // form verified upstream: MutelistView.swift (Hashtags / Words / Threads
      // / Users) and AddMuteItemView.swift ("npub, #hashtag, phrase" + Duration).
      id: 'muted',
      category: 'Account & keys',
      question: 'How do I mute a person, a word or a hashtag?',
      answer: [
        'Tap your profile picture to open the side menu, then choose "Muted".',
        'The screen has four sections — Users, Words, Hashtags and Threads — so you can silence a person, a phrase, a #tag or one conversation.',
        'Use "Add mute item" to add any of them: the field takes an npub, a #hashtag or a plain phrase.',
        'Pick a Duration in the same form if you only want it muted for a while rather than for good.',
      ],
      note: 'Muting a word hides every note containing it, so it is the tool for a topic you are tired of — muting the person is a different, blunter thing.',
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
      // Damus stores exactly ONE identity: Keys.swift keeps a single Keychain
      // item under the fixed account name "privkey" plus one UserDefaults
      // "pubkey" — there is no accounts collection to switch between, and
      // SideMenuView.swift has no Add/Switch row. Per-account settings survive
      // because UserSettingsStore namespaces every setting by pubkey
      // (pk_setting_key / globally_load_for(pubkey:)).
      id: 'multi-account',
      category: 'Account & keys',
      question: 'How do I add a second account or switch between accounts?',
      answer: [
        'Damus has no account switcher — it holds one key at a time, so switching means signing out and signing back in with the other key.',
        'Back up the key you are leaving FIRST: side menu → Settings → Keys → flip "Show" under "Secret Account Login Key", authenticate with Face ID, and copy the nsec.',
        'Side menu → "Logout" and confirm the alert ("Make sure your nsec account key is saved before you logout or you will lose access to this account").',
        'On "Welcome to Damus" tap "Sign In", paste the other account\'s nsec, and tap "Login".',
        'Your settings for that key come back on their own — zap amount, blur, notification toggles are all stored per public key and survive the logout.',
        'One thing does not come back: logging out disconnects your Lightning wallet, on BOTH keys. Reattach it in side menu → Wallet before you try to zap.',
      ],
      howNostrWorks:
        'On Nostr an account IS a keypair — nothing more. The npub is your public identity and the nsec is the only thing that can produce a signature, so "switching accounts" means switching which private key the app signs with; there is no server-side session to switch. Everything that makes an account feel like an account is a set of events published under that one key: your name and picture, your follow list, your relay list. Sign in with a different key and a client rebuilds a completely different account from that key\'s events — which is why a wrong key looks indistinguishable from a lost one.',
      note: 'Signing in with an npub is not a second account — it replaces your session with a read-only one. Damus also has no NIP-46 bunker, Amber or extension login, so the nsec has to go into the app itself. And do not reach for Settings → "Delete Account" to clear the key you are leaving: despite its all-caps warning it deletes nothing, it signs a replacement profile reading "nobody / account deleted" under that key and logs you out — your notes stay on relays and the key still works everywhere else.',
      showMe: [
        {
          target: '[data-tour="damus-menu"]',
          // Descriptive, not imperative: the point of the demo is what is NOT
          // in this menu. Do not enumerate rows — the sim ships a subset of the
          // real 11 (no Labs, no Live).
          content:
            'The side menu is the only place a switcher could live, and Damus has none — no "Add account", no picker in the header. Changing identity means Logout, then Sign In with the other key.',
          title: 'No switcher, by design',
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

    // ------------------------------------------------------------ Advanced --
    // Grounded in the damus-io/damus upstream source (master, checked
    // 2026-08-06) — the reference recording never visits these screens, so
    // these entries are TEXT-ONLY (no showMe) until the sim grows the
    // surfaces to demo them (Settings sub-screens, Wallet).
    {
      // AppearanceSettingsView.swift: "Image uploader" Picker;
      // MediaUploader.swift: nostrBuild (default) / nostrcheck ("nostrcheck.me").
      id: 'change-media-uploader',
      category: 'Advanced',
      question: 'How do I switch the media uploader (nostr.build → nostrcheck.me)?',
      answer: [
        'Tap your profile picture to open the side menu, then choose "Settings".',
        'Open "Appearance and filters".',
        'Use the "Image uploader" picker — Damus ships with nostr.build (the default) and nostrcheck.me.',
      ],
      note: 'The choice applies to future image and video uploads from the composer.',
    },
    {
      // ConfigView.swift: Storage row; StorageSettingsView.swift: usage chart
      // (NostrDB / Snapshot Database / Image Cache) + Clear Cache section.
      id: 'clear-cache',
      category: 'Advanced',
      question: 'How do I clear the cache?',
      answer: [
        'Tap your profile picture to open the side menu, then choose "Settings".',
        'Open "Storage" — it charts what Damus keeps on your device (NostrDB, snapshot database, image cache).',
        'Tap the clear-cache button and confirm.',
      ],
    },
    {
      // §5 Side menu row 2 (Wallet); ConnectWalletView.swift: "AUTOMATIC
      // SETUP / Create new wallet" (Coinos) + NWC attach ("Setup Wallet" →
      // "Connect"); NWCScannerView.swift: QR scan.
      id: 'connect-wallet',
      category: 'Advanced',
      question: 'How do I connect a Lightning wallet (for zaps)?',
      answer: [
        'Tap your profile picture to open the side menu, then choose "Wallet".',
        'Either tap "Create new wallet" (one-click Coinos setup), or attach an existing wallet that supports Nostr Wallet Connect: paste or scan its NWC connection string.',
        'Confirm on the "Setup Wallet" screen — from then on zaps are paid straight from Damus.',
      ],
      note: 'The one-click Coinos setup requires being signed in with your nsec. Coinos is a third-party service — the Damus team has no access to your wallet.',
    },

    // ------------------------------------------------------- Troubleshooting --
    // "Why doesn't this work" answers. TEXT-ONLY on purpose: the simulator
    // cannot stage a failure, so a demo here could only contradict itself.
    // Every claim is grounded in damus-io/damus master (2026-08-07); `answer`
    // is what to do IN DAMUS, `howNostrWorks` is the protocol half.
    {
      // Ndb.safemode() deletes data.mdb/lock.mdb and reopens fresh;
      // ContentView.connect() calls it automatically and logs out if it also
      // fails. CompactionView.swift owns the "Optimizing Database" screen.
      // StorageSettingsView.swift: "Compact Database" + "Clear Cache".
      id: 'trouble-startup',
      category: 'Troubleshooting',
      question: 'Damus crashes or hangs when I open it — what can I do?',
      answer: [
        'A launch stuck on "Optimizing Database" with a progress bar is not a hang — it is compaction, and the screen asks you to keep the app open. On a large database it says so explicitly and can take minutes.',
        'Damus already repairs itself: if it cannot open its local database it silently wipes and recreates it, and your feed refills from relays. You never see a button for this.',
        'To force the cleanup yourself: side menu → Settings → Storage → "Compact Database", confirm, then restart Damus when it says "Compaction scheduled."',
        'Lighter option on the same screen: "Clear Cache" — it frees space and images simply reload more slowly afterwards.',
        'For diagnostics, Settings → Developer → "Developer Mode" adds a "Relay Logs" section inside each relay\'s detail screen. That is the only log surface in the app.',
      ],
      howNostrWorks:
        'Nothing you can see in a Nostr client lives only on your phone. Notes are signed events and the relays keep the copies, so a client\'s local database is a cache — deleting it is a cheap first move, not a last resort, because it refills from relays. The only things a wipe genuinely costs you are the ones never published: notes still queued to send, and a follow or relay list that only ever existed locally. Your identity is untouched either way — it is the private key in the keychain, not database state.',
      note: 'If self-repair also fails, Damus logs you out and drops you at the welcome screen — which is exactly why the nsec backup matters. There is no user-facing crash log; Settings → First Aid prints support@damus.io.',
    },
    {
      // EventMenu.swift / ShareAction.swift: "Broadcast" (globe).
      // SignalView.swift renders only when signal < max_signal.
      // PostBox.flush_event retries per relay with 1.5x backoff until OK.
      // UserRelayListManager: NIP-65 kind 10002 under your pubkey.
      id: 'trouble-not-delivered',
      category: 'Troubleshooting',
      question: 'My notes are not showing up for other people (or I cannot see theirs)',
      answer: [
        'Damus has a real re-send: tap the "…" button in the note\'s top-right corner → "Broadcast" (globe). It also sits in the note\'s share sheet. That pushes the same signed note to every relay you are connected to.',
        'Check where you are connected: side menu → Relays. Each row carries a status pill — Online, Connecting or Error. A relay showing Error is receiving nothing you post.',
        'Watch the small signal meter at the top-right of Home. It appears ONLY when some relays are disconnected, and tapping it opens Relays. But no meter only means every socket is up — it says nothing about whether those relays accepted you.',
        'A relay can read "Online" and still refuse everything. Relays that require authentication challenge you on connect, and Damus reports the outcome in exactly one place: open that relay\'s detail screen and look for the Pending / Authenticated / Error badge. A read-only npub session can never pass the challenge, so those relays silently drop every post.',
        'Tap a single relay to open its detail screen — but read the button carefully. "Disconnect" does not just drop the socket, it REMOVES that relay from your published relay list, and "Connect" adds it back. Use it to drop a relay that is failing, not as a refresh.',
        'Publish somewhere else too: Relays → "Add relay" → wss://… . Damus adds every relay as read+write; there is no read/write choice in the UI.',
        'If your relay list itself has gone missing, Settings → First Aid offers "Repair relay list" (it warns you may lose relays you added by hand).',
      ],
      howNostrWorks:
        'A note only exists on the relays that actually accepted it, and a reader only sees it if they read from a relay that has it. Your client pushes to each relay independently and retries the slow ones in the background, so one relay refusing does not stop the others. Every relay does answer each publish with an accept-or-reject line saying why, but almost no client shows you those answers, so a refusal looks exactly like silence. Your relay set is itself a published event (a NIP-65 relay list under your key), and that is how other people\'s clients learn where to look for you. So a note can be perfectly published and still invisible: if your readers\' clients never fetched your relay list, or it points at relays they do not read, there is no relay in common. That is also why Broadcast helps — it widens the set of relays holding a copy.',
    },
    {
      // ContentView `.onReceive(handle_notify(.zapping))` has `case .failed:
      // break` — quick zaps fail silently. CustomizeZapView.receive_zap guards
      // on zap_ev.is_custom before setting model.error, and NoteZapButton binds
      // long-press to the custom sheet. EventActionBar: zap drawn only when
      // lnurl != nil.
      id: 'trouble-zap-failed',
      category: 'Troubleshooting',
      question: 'My zap failed or nothing happened when I tapped the lightning bolt',
      answer: [
        'A quick tap-zap that fails shows you nothing at all — Damus handles that case with an empty branch. If tapping seems to do nothing, LONG-PRESS the zap icon instead: the custom Zap sheet is the only place in the app that prints the reason.',
        'Reasons it will show: "Invalid lightning address", "Error fetching lightning invoice", "Zap attempt from connected wallet was canceled.", "Zap attempt from connected wallet failed."',
        'With a Nostr Wallet Connect wallet attached, wallet-side failures are translated for you — insufficient balance, rate limited, quota exceeded, not authorized, not implemented.',
        'Check the zap TYPE while that sheet is open. "None" means, in the app\'s own words, "No zaps will be sent, only a lightning payment" — the sats leave and no receipt is ever created, so the counter cannot move. If you once tapped "Make Default" on None or Anonymous, every zap since has been that type.',
        'No zap icon on a note at all is not a bug: Damus only draws it when that author has a lightning address. Nothing on your side can zap someone who has not set one up.',
        'Tune the flow at Settings → Zaps: default amount, default wallet, and "Show wallet selector" — turn that on if the wrong wallet keeps opening.',
      ],
      howNostrWorks:
        'A zap is three systems chained together and each fails differently. First the recipient must advertise a lightning address in their profile, which the client resolves to an LNURL endpoint — no address, no zap. Second, your client gets an invoice back and something pays it — hand it to a wallet app and that leg is pure Lightning, but a Nostr Wallet Connect wallet is reached by encrypted events over a relay. Either way that middle leg is where balance, cancellation and wallet-permission failures live. Third, the recipient\'s LNURL server — not your client — publishes the zap receipt that relays carry, and the count on a note is a count of those receipts. So a zap can be genuinely paid and still show as zero, because paying and appearing are two different events.',
    },
    {
      // LoginView: orange bold warning on a public key; ParsedKey.is_pub is
      // true for .nip05 too. PostingTimelineView gates the FAB on
      // keypair.privkey != nil; EventActionBar gates the reply button the same
      // way. KeySettingsView renders "Secret Account Login Key" only when a
      // privkey exists — the reliable in-session check.
      id: 'trouble-read-only',
      category: 'Troubleshooting',
      question: 'I cannot post at all — there is no compose button',
      answer: [
        'You are almost certainly in a read-only session. Damus warns about it in orange the moment you paste a public key on Sign In: "you will not be able to make notes or interact in any way".',
        'Once you are inside there is no badge saying so. The gradient compose button is absent and the reply bubble is missing from every note — but repost, the shaka and zap are still drawn, and tapping them does nothing at all: no error, no explanation.',
        'Check reliably: side menu → Settings → Keys. A signing session shows "Public Account ID" AND "Secret Account Login Key". A read-only session shows only the public one.',
        'Fix it: side menu → Logout (a key-less session logs out with no confirmation), then Sign In with your nsec instead of your npub.',
        'A NIP-05 address like name@domain resolves to a public key too, so it gives you the same read-only session.',
      ],
      howNostrWorks:
        'Posting on Nostr IS signing — there is no separate permission any client or relay could grant you. Every event carries a signature made with the private key, and relays check it before accepting, so an unsigned note is refused everywhere by construction. An npub is only the public half: enough to read everything published under that identity, which makes npub sign-in genuinely useful for looking around, but mathematically incapable of producing a signature. A read-only session is not a broken account or a downgraded plan — the app is holding a public key where it needs a private one.',
      note: 'There is no way to upgrade a read-only session in place, and no external signer to attach — Damus has no NIP-46 bunker, Amber or extension login.',
    },
    {
      // AppearanceSettingsView Section("Images"): EnableAnimationsToggle,
      // "Blur images", "Media previews", "Image uploader".
      // UserSettingsStore: blur_images + media_previews both default TRUE.
      // EventView.should_blur_images: never your own notes, never the
      // friendosphere. No imgproxy/media-proxy anywhere in the source.
      id: 'trouble-images',
      category: 'Troubleshooting',
      question: 'Images are blurred or will not load',
      answer: [
        'First tell blurred from missing — they have different causes. Damus blurs media by default, and only from people outside your circle: never your own notes, never someone you follow or someone they follow. A blurred thumbnail is the feature working.',
        'Turn it off at side menu → Settings → "Appearance and filters" → the Images section → "Blur images".',
        'If media is missing rather than blurred, check "Media previews" is on in that same section — with it off Damus replaces every image with a small tappable row showing how many attachments the note has, and only fetches them when you tap it.',
        'If images used to load and now look broken, Settings → Storage → "Clear Cache". The confirmation says it plainly: images will just take longer to load again.',
        'For images YOU post that others cannot see, the host is the variable: Settings → "Appearance and filters" → "Image uploader" switches between nostr.build and nostrcheck.me for future uploads.',
      ],
      howNostrWorks:
        'An image is not part of the note. The note is text that happens to contain an https:// URL, and your phone fetches that URL straight from whatever third-party host the poster used. Relays never store, mirror or proxy the file — they only carry the text. A note can also carry the image\'s dimensions and a blurhash, which is why a client can show a blurry colour placeholder instantly and why a blurred image is no proof the file loaded at all. So a broken image means the host is down, deleted it, or is unreachable from your network — and no relay change, key change or cache clear brings back a file that no longer exists. The note stays perfectly valid with a dead link inside it, which is why it still appears in your feed.',
      note: 'Damus has no media-proxy setting — it fetches media URLs directly, so there is no proxy to switch on when a host is unreachable.',
    },
    {
      // NotificationSettingsView: Picker "Notifications mode" (Local/Push),
      // Section("Notification Preferences") with per-kind toggles + follows-only
      // + hellthread filter, PreferencesSyncState footer, and a SEPARATE
      // Section("Notification Dots") that only drives the tab indicator.
      id: 'trouble-notifications',
      category: 'Troubleshooting',
      question: 'My notifications stopped arriving',
      answer: [
        'Open side menu → Settings → Notifications (the gear in the Notifications tab toolbar goes to the same screen).',
        '"Notifications mode" chooses Local or Push. Local means your own phone spots events while Damus is running; Push means the Damus server does. Switching to Push registers a device token, and a failed handshake shows an inline red error right there.',
        'The "Notification Preferences" section is where a whole category goes quiet: separate toggles for Zaps, Mentions, Reposts, Likes and DMs, plus "Show only from users you follow" and a filter that hides notes tagging many profiles.',
        'In Push mode those preferences sync to the server and the section footer reports it — "Successfully synced" with a green check, or a red sync error. A failed sync means the server is still acting on your old settings.',
        'Do not confuse the "Notification Dots" section — it only controls the unread dot on the bell tab and cannot restore missing notifications.',
        'Check the Notifications tab itself: its subtitle reads "All" or "Trusted Network", and the shield button toggles that filter, hiding notifications that did arrive.',
      ],
      howNostrWorks:
        'Nostr has no notification service. A notification is just an ordinary event on a relay that happens to tag your public key — a reply, a mention, a reaction, a repost, a zap receipt. Something must actively watch relays for those tags and turn them into alerts. Locally that watcher is your own phone, so it only notices what arrives while the app is running and connected; background time and killed apps are gaps. Push mode hands the watching to a server, which is a second system that needs your device token and a synced copy of your preferences and can drift out of step with the app. Under both sits the same hard limit: if the reply mentioning you was published only to a relay you do not read from, nothing is watching, and no notification can exist to deliver.',
      note: 'iOS\'s own per-app notification permission is separate and Damus has no screen for it — check it in the iOS Settings app.',
    },
    {
      // FirstAidSettingsView: detects a missing contact list / relay list on
      // appear and offers "Reset contact list" (verbatim ALL-CAPS warning) or
      // "Repair relay list". make_first_contact_event tags only the Damus
      // account + yourself — a reset does NOT restore follows.
      id: 'trouble-empty-profile',
      category: 'Troubleshooting',
      question: 'My profile is empty and my follows are gone',
      answer: [
        'Check the key first — this is by far the most common cause and nothing has been lost. Side menu → Settings → Keys → "Public Account ID". If that npub is not yours, you signed in with a different key: log out and sign back in with the right nsec.',
        'Then check you can reach relays at all. Side menu → Relays: an empty profile alongside rows showing Error is a connection problem, not missing data. Wait before doing anything destructive.',
        'Damus ships a repair screen for exactly this: Settings → First Aid. It only offers a fix for something it has actually detected as missing, and tells you plainly when it finds nothing wrong.',
        'If your contact list really is gone, First Aid offers a red "Reset contact list". Read its warning: resetting does NOT recover your follows — it publishes a brand-new list following only Damus and yourself. It is a fresh start, not a restore.',
        'A missing relay list gets its own "Repair relay list", which warns you may lose relays you added by hand.',
        'To fix a profile that looks blank to others, open your Profile → "Edit" → Save. That re-publishes your profile to your relays.',
      ],
      howNostrWorks:
        'Your profile and follow list are not account records on a server — they are events you signed and published under one key, and a client rebuilds "your account" by re-fetching the newest of each from relays every time it starts. That gives an empty account three ordinary explanations: you are holding a different key (a different npub is a different account, full stop, and it will look pristine); the relays you are connected to do not have your profile and follow list; or you have simply not connected yet. The dangerous part is that these are replaceable events — relays keep only the newest one per kind per author. Publishing a fresh, nearly-empty follow list does not sit beside your old one, it becomes the newest, and every other client will honour it. Waiting for relays costs nothing; resetting can cost your follow graph.',
    },
  ],
};

export default damusFaq;
