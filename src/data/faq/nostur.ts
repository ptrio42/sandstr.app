/**
 * Nostur FAQ — grounded in docs/refs/nostur/screen-map.md (section refs in
 * comments); Advanced entries additionally cite the upstream Swift source
 * (nostur-com/nostur-ios-public) where the recording never opened the screen.
 *
 * showMe gating follows docs/gaps/nostur.md: the sim has the best anchor
 * coverage in the repo (34 selectors) but 33 dead controls, so captions
 * describe the real app and mini-tours end on a highlighted surface.
 */

import type { SimulatorCommand } from '../../simulators/nostur/types';
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

// Nostur's commands are self-sufficient (each one signs in and closes any open
// overlay), so ONE command per step is the rule here — see the ledger's
// Reachability note.
const feed = cmd({ type: 'openFeed', payload: 'Following' });

/** The action row exists on every post; the spotlight lands on the first. */
const actionStep = (target: string, title: string, content: string): Step => ({
  target,
  title,
  content,
  position: 'top',
  commands: feed,
});

export const nosturFaq: ClientFaq = {
  clientId: 'nostur',
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
    'media-uploader': 'media-uploads',
    'clear-cache': 'clear-cache',
    'manage-relays': 'manage-relays',
    mute: 'block-list',
    dms: 'dms',
    search: 'search',
    notifications: 'notifications',
    follow: 'follow',
  },
  entries: [
    // ---------------------------------------------------- Getting started --
    {
      // §18/§19 Welcome
      id: 'sign-in',
      category: 'Getting started',
      question: 'How do I sign in or create an account?',
      answer: [
        'Nostur opens on "Welcome to Nostur" with three buttons.',
        '"Create new account" asks for a name and a short bio, then generates your keys.',
        '"Use existing account" gives you one field that takes anything — nsec, npub, a nostr address or a signer URL. The button changes to "Add (Remote Signer)" by itself when you paste a bunker link.',
        '"Try guest account" lets you look around before committing.',
      ],
      note: 'Signing in with an npub or a nostr address gives a read-only account — you need the nsec (or a remote signer) to post. Nostur runs on iPhone, iPad and Mac, and your accounts sync between them.',
      showMe: [
        {
          target: '[data-tour="nostur-create-account"]',
          title: 'The welcome screen',
          content:
            'Create a new account, bring an existing nsec, or look around first as a guest.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'logout' }),
        },
      ],
    },
    {
      // §6 Feed sub-tabs + TabButton
      id: 'feed-tabs',
      category: 'Getting started',
      question: 'What are the Following, Discover and Explore tabs?',
      answer: [
        'Following is your own timeline — posts from people you follow.',
        'Discover shows follow packs and lists curated by others, so you can find people to follow.',
        'Explore is the wider network beyond your follows.',
        'More feeds (Pictures, Zapped, Hot, Live Streams…) appear once you follow more than ten people — you can turn them on under Lists & Feeds.',
      ],
      note: 'Careful: in Nostur every tab label is painted in the accent colour, so the selected tab is marked ONLY by the thin underline beneath it — not by a brighter label.',
      showMe: [
        {
          target: '[data-tour="nostur-feedtabs"]',
          title: 'The feed tabs',
          content:
            'Following · Discover · Explore. The 1px underline is the only thing marking the selected tab — every label stays turquoise.',
          position: 'bottom',
          commands: feed,
        },
      ],
    },
    {
      // §17 Signature details + §7.5 Low Data Mode media blocks
      id: 'low-data',
      category: 'Getting started',
      question: 'What is the turtle icon in the top bar?',
      answer: [
        'That is Low Data Mode. Tap the turtle in the top bar to toggle it.',
        'When it is on, Nostur stops downloading images and previews — each one becomes a "Loading paused (Low data mode)" block with a "Load anyway" link.',
        'The turtle is dimmed when the mode is off and fully lit when it is on; a toast confirms every switch.',
        'The same switch lives in Settings under Data usage.',
      ],
      note: 'Handy on mobile data or a weak connection — the text of every post still loads.',
      showMe: [
        {
          target: '[data-tour="nostur-lowdata"]',
          title: 'The turtle',
          content: 'Low Data Mode lives right in the top bar — dimmed when off, lit when on.',
          position: 'bottom',
          commands: cmd({ type: 'lowData', payload: 'off' }),
        },
        {
          // Targets the paused block itself, not "the first post" — which
          // note carries media is randomised, so a post selector would often
          // frame a text-only card while the caption talks about media.
          target: '[data-tour="nostur-lowdata-block"]',
          title: 'Low Data Mode on',
          content:
            'Media is replaced by a "Loading paused" block with a "Load anyway" link — the text still loads.',
          position: 'top',
          commands: cmd({ type: 'lowData' }),
        },
        {
          // The walk-through deliberately ENDS by switching the mode back off:
          // left on, it would silently strip media from every later demo and
          // from the visitor's own browsing.
          target: '[data-tour="nostur-lowdata"]',
          title: 'And back off',
          content: 'Tap the turtle again and the media loads as usual.',
          position: 'bottom',
          commands: cmd({ type: 'lowData', payload: 'off' }),
        },
      ],
    },

    // ------------------------------------------------------------ Posting --
    {
      // §13 Compose ("New Post")
      id: 'post-note',
      category: 'Posting',
      question: 'How do I post a note?',
      answer: [
        'Tap the teal compose button floating above the tab bar on the Home feed — a rounded square, not a circle.',
        'Write in the "What\'s happening?" field. The toolbar above the keyboard adds photos, camera, video, GIFs or a voice message.',
        'Tap the paper plane in the top-right to publish.',
      ],
      showMe: [
        {
          target: '[data-tour="nostur-fab"]',
          title: 'The compose button',
          content:
            'A teal squircle floating over the feed — Nostur has no compose tab. It opens the full-screen "New Post" composer.',
          position: 'left',
          commands: feed,
        },
        {
          target: '[data-tour="nostur-send"]',
          title: 'Send it',
          content:
            'The paper plane publishes your note — it stays dimmed until you have typed something.',
          position: 'bottom',
          commands: cmd({ type: 'compose' }),
        },
      ],
    },
    {
      // §7 action bar (button 1), §13 reply mode
      id: 'reply',
      category: 'Posting',
      question: 'How do I reply to a post?',
      answer: [
        'Tap the speech bubble — the first icon in the row under the post.',
        'The composer opens with "Replying to @name" above the field.',
        'Tap the paper plane to send.',
      ],
      showMe: [
        actionStep(
          '[data-tour="nostur-actionbar"]',
          'The action row',
          'Reply · repost · heart · zap · bookmark, spread evenly across the full width. Counts are hidden when they are zero.',
        ),
        {
          target: '.nostur-action[data-role="reply"]',
          title: 'Reply',
          content: 'The speech bubble is always first, and turns turquoise once you have replied.',
          position: 'top',
        },
      ],
    },

    // --------------------------------------------------- Reactions & zaps --
    {
      // §7 action bar (button 3 — EmojiButton renders a heart)
      id: 'react-heart',
      category: 'Reactions & zaps',
      question: 'How do I like a post — and can I use another emoji?',
      // Upstream EmojiButton.swift: the picker opens on .onLongPressGesture,
      // NOT from a settings screen.
      answer: [
        'Tap the heart, third in the row under the post. It turns red.',
        'To react with something else, press and hold that same heart — an emoji picker opens.',
        'The emoji you pick replaces the heart in that post\'s row entirely.',
      ],
      showMe: [
        actionStep(
          '.nostur-action[data-role="react"]',
          'The heart',
          'Nostur\'s default reaction is a heart that fills red — in the real app a long press on it opens an emoji picker.',
        ),
      ],
    },
    {
      // §7 action bar (button 2)
      id: 'repost',
      category: 'Reactions & zaps',
      question: 'How do I repost?',
      answer: [
        'Tap the two-arrows icon, second in the row under the post. It turns green.',
        'Reposts appear in other people\'s feeds with your avatar and name above the original post.',
      ],
      showMe: [
        actionStep(
          '.nostur-action[data-role="repost"]',
          'Repost',
          'Second in the row — it turns green once reposted, and is dimmed on private posts.',
        ),
      ],
    },
    {
      // §7 action bar (button 4) + §14 Zap sheet
      id: 'zap',
      category: 'Reactions & zaps',
      question: 'How do I zap (tip sats to) a post?',
      answer: [
        'Tap the lightning bolt, fourth in the row under the post.',
        'The "Send sats" sheet opens with sixteen amount coins — 21 sats is preselected.',
        'Pick an amount (or type a custom one), optionally add a message, and send.',
        'The count next to the bolt is the running total of sats, followed by the word "sats".',
      ],
      note: 'The bolt is dimmed and unusable when the author has no Lightning address — there is nowhere to send the sats.',
      showMe: [
        actionStep(
          '.nostur-action[data-role="zap"]',
          'The zap button',
          'Its count is a sat total, not a number of zaps — and it is dimmed on authors with no Lightning address.',
        ),
        {
          target: '[data-tour="nostur-zapsheet"]',
          title: '"Send sats"',
          content:
            'A grid of orange amount coins with 21 sats preselected — the default is configurable in Settings → Zaps.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'zap' }),
        },
      ],
    },

    // ----------------------------------------------------- Finding things --
    {
      // §15 Sidebar
      id: 'side-menu',
      category: 'Finding things',
      question: 'How do I open the side menu?',
      answer: [
        'Tap your avatar in the top-left of the Home screen.',
        'The menu holds Profile, Lists & Feeds, Bookmarks, Badges, Settings, Block list, Signer and Log out.',
        'Your npub sits under your name with a copy button; the small avatar at the bottom-right of the banner switches accounts.',
      ],
      showMe: [
        {
          target: '[data-tour="nostur-account"]',
          title: 'Your avatar opens the menu',
          content: 'Top-left avatar — not your profile, the side menu.',
          position: 'bottom',
          commands: feed,
        },
        {
          target: '[data-tour="nostur-sidebar"]',
          title: 'The side menu',
          content:
            'Everything account-related lives here, down to the version line and a link to Nostur\'s source code.',
          position: 'right',
          commands: cmd({ type: 'openDrawer' }),
        },
      ],
    },
    {
      // §9 Profile
      id: 'follow',
      category: 'Finding things',
      question: 'How do I follow someone?',
      answer: [
        'On a post, in search results or in notifications, tap the turquoise "Follow" next to their name.',
        'On their profile the button sits under the banner — and there it is deliberately black-and-white, not turquoise: filled while you are not following, inverted once you are.',
      ],
      note: 'Nostur shows "∞" for follower counts it cannot compute — that is not a bug, just an unknown number.',
      showMe: [
        {
          target: '[data-tour="nostur-profile"]',
          title: 'A profile',
          content:
            'The Follow button sits under the banner. Your own profile shows an edit action there instead.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'viewProfile', payload: 'other' }),
        },
      ],
    },
    {
      // §12 Search
      id: 'search',
      category: 'Finding things',
      question: 'How do I search for people or topics?',
      answer: [
        'Tap the magnifier in the bottom tab bar.',
        'Type into the "Search..." field — results are profile rows with a Follow pill next to each.',
        'Searching a hashtag also gives you a header row for the tag itself, which you can follow.',
      ],
      showMe: [
        {
          target: '[data-tour="nostur-search"]',
          title: 'Search',
          content:
            'The search screen starts empty. Type a name, npub or hashtag and profiles come back with a Follow pill beside each — hashtags can be followed too.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'search' }),
        },
      ],
    },
    {
      // §10 Notifications
      id: 'notifications',
      category: 'Finding things',
      question: 'How do I read and filter my notifications?',
      answer: [
        'Tap the bell in the bottom tab bar.',
        'Six icon-only tabs filter the list: Mentions, New Posts, Reactions, Reposts, Zaps and Followers.',
        'Nostur opens on the first tab that has something unread, so you may not land on Mentions.',
        'The gear in the top-right holds notification settings.',
      ],
      showMe: [
        {
          target: '[data-tour="nostur-notifications"]',
          title: 'Notifications',
          content:
            'The list of what happened, filtered by the six icon-only tabs above it — each carries a red capsule counting its unread items.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'notifications' }),
        },
      ],
    },
    {
      // §11 Messages
      id: 'dms',
      category: 'Finding things',
      question: 'Where are my direct messages?',
      answer: [
        'Tap the envelope in the bottom tab bar.',
        'Conversations split into "Accepted" and "Requests" so strangers cannot fill your inbox.',
        'The pencil icon in the top-right starts a new private conversation.',
      ],
      note: 'The turquoise "Upgrade your DMs" pill switches you to the newer, more private message format (NIP-17). People who have not upgraded can still reach you the old way.',
      showMe: [
        {
          target: '[data-tour="nostur-messages"]',
          title: 'Messages',
          content:
            'Accepted and Requests tabs, plus the "Upgrade your DMs" pill for the more private NIP-17 format.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'messages' }),
        },
      ],
    },
    {
      // §15 Bookmarks
      id: 'bookmarks',
      category: 'Finding things',
      question: 'How do I bookmark a post and find it later?',
      answer: [
        'Tap the bookmark icon — the last one in the row under the post. It turns orange.',
        'Open the bookmark tab in the bottom bar to read them back.',
        'The segmented control there switches between "Bookmarks" and "Private Notes", and there is a "Search in bookmarks…" field.',
      ],
      showMe: [
        {
          target: '[data-tour="nostur-bookmarks"]',
          title: 'Your bookmarks',
          content:
            'Everything you bookmarked, with a private-notes tab beside it and a search field of its own.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'bookmarks' }),
        },
      ],
    },

    // ------------------------------------------------------------- Relays --
    {
      // §15 Settings → Relay Connections
      id: 'manage-relays',
      category: 'Relays',
      question: 'How do I add or remove relays?',
      answer: [
        'Open the side menu with your avatar, then tap Settings.',
        'Choose "Relay Connections".',
        'Tap "Configure your relays…" to see the list — each relay has read and write dots — and use "Add new relay…" at the bottom to add one.',
        '"Announce your relays…" is a separate list: those are the relays others use to find your content.',
      ],
      note: 'Autopilot (off by default) will connect to extra relays used by people you follow, so you miss fewer posts.',
      showMe: [
        {
          target: '[data-tour="nostur-relays"]',
          title: 'Relay Connections',
          content:
            'Your own relays, the ones you announce to others, plus Autopilot and relay connection stats.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'openSettings', payload: 'relays' }),
        },
      ],
    },
    {
      // §15 Lists & Feeds ("Feeds")
      id: 'extra-feeds',
      // Lists & Feeds, not relays — filed next to the feed-tabs question.
      category: 'Getting started',
      question: 'How do I turn on extra feeds (Pictures, Zapped, Live Streams…)?',
      answer: [
        'Open the side menu with your avatar and tap "Lists & Feeds".',
        'Toggle the default feeds you want: Pictures, Yaks (voice messages), Divines (short videos), Zapped, Hot, Follow Packs & Lists, Live Streams, Funny Feed and Gallery.',
        'Enabled feeds show up as extra tabs across the top of the Home screen.',
      ],
      showMe: [
        {
          target: '[data-tour="nostur-feeds"]',
          title: 'Lists & Feeds',
          content:
            'One toggle per feed, each with a one-line description of what it collects.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'openSettings', payload: 'feeds' }),
        },
      ],
    },

    // ------------------------------------------------------ Account & keys --
    {
      // §15 Settings → ACCOUNT → "Private key"
      id: 'backup-keys',
      category: 'Account & keys',
      question: 'Where do I find and back up my private key (nsec)?',
      answer: [
        'Open the side menu with your avatar, then tap Settings.',
        'Under Account, tap "Private key".',
        'Tap "Reveal private key" to see it, then "Copy private key" — store it somewhere safe, a password manager is a good place.',
      ],
      note: 'Nothing gates that reveal — no Face ID, no passcode — so do it somewhere private. Your nsec IS your account: anyone who has it controls your identity, and if you lose it nobody can restore it. The log-out sheet also offers to copy it, as a last reminder.',
      showMe: [
        {
          target: '[data-tour="nostur-settings"]',
          title: 'Settings → Account',
          content:
            'The Account group at the bottom holds "Private key" — and, in red, "Delete account".',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'openSettings' }),
        },
      ],
    },
    {
      // §15 Sidebar row "Block list"
      // Upstream: PostMenu.swift "Block <name>" + PostMenuBlockOptions (timed
      // blocks), Sidebar "Block list" → Blocked | Muted conversations | Muted
      // words. Vocabulary matters here — see the note.
      id: 'block-list',
      category: 'Account & keys',
      question: 'How do I block a person, or mute a thread or a word?',
      answer: [
        'Open the "•••" menu on any of their posts and tap "Block {name}" — the screen it opens offers "Block" or a timed one: "Block for 1 hour", "4 hours", "8 hours", "1 day", "1 week" or "1 month".',
        'A profile\'s "•••" (and the same menu in a DM) also has "Block {name}", but only permanently — no duration.',
        'To silence one thread instead of a person, use "Mute conversation" in that same post menu.',
        'Open the side menu with your avatar and tap "Block list" for all of it: tabs for Blocked, Muted conversations and Muted words. On "Muted words", tap "Add" to open "Add muted word", type into "Specific word or sentence", leave "Activate this filter" on and Save.',
        'Swipe any row in any of the three tabs to remove it — that unblocks a person, unmutes a thread or drops a word; tap a muted word instead to edit it or switch it Off without deleting it.',
      ],
      note: 'Nostur has no hashtag muting — people are BLOCKED, and "mute" only applies to a conversation or a word. A muted word matches anywhere in a post, so muting "nft" also hides "#nft": that is the workaround. Blocked rows say "blocked until {date}" while a timed block is running. All of this lives on your Apple devices and syncs over iCloud, not to Nostr relays, so it will not follow you into another client.',
      showMe: [
        {
          target: '[data-tour="nostur-drawer-blocklist"]',
          title: 'Block list',
          content: 'Everyone you have blocked lives here, in the side menu.',
          position: 'right',
          commands: cmd({ type: 'openDrawer' }),
        },
      ],
    },
    {
      // §15 Sidebar row "Log out"
      id: 'logout',
      category: 'Account & keys',
      question: 'How do I log out or switch accounts?',
      answer: [
        'Open the side menu with your avatar.',
        'Tap "Log out" at the bottom of the menu, then confirm in the "Confirm log out" sheet — it offers to copy your nsec to the clipboard first.',
        'To switch instead, tap the "•••" beside the avatar in the menu header to open "Accounts", where you can also add another account.',
      ],
      note: 'Back up your nsec before you log out — without it that account cannot be restored.',
      showMe: [
        {
          target: '[data-tour="nostur-drawer-logout"]',
          title: 'Log out',
          content: 'The last row of the side menu. Back up your nsec first.',
          position: 'right',
          commands: cmd({ type: 'openDrawer' }),
        },
      ],
    },

    // ----------------------------------------------------------- Advanced --
    {
      // §15 Settings → Zaps (ZAPPING: "Lightning wallet", "Default zap amount: 21")
      id: 'connect-wallet',
      category: 'Advanced',
      question: 'How do I connect a Lightning wallet (for zaps)?',
      answer: [
        'Open the side menu with your avatar, then tap Settings.',
        'Choose "Zaps".',
        'Under Zapping, open the "Lightning wallet" picker: choose "Alby (Nostr Wallet Connect)" and tap "Connect Alby wallet", or "Custom Nostr Wallet Connect…" and paste (or scan) your nostr+walletconnect URI.',
        '"Default zap amount" on the same screen sets what a normal zap sends — it ships as 21 sats.',
      ],
      note: 'Nostur has no wallet of its own. Left as the default, zaps hand off to whichever Lightning app your phone has registered; Nostr Wallet Connect is what keeps the payment inside Nostur.',
      showMe: [
        {
          // The 'zaps' payload replaces the settings root, so this must target
          // the Zaps screen's own anchor — nostur-settings would be unmounted.
          target: '[data-tour="nostur-zapsettings"]',
          title: 'Settings → Zaps',
          content:
            'The Zapping section holds the "Lightning wallet" picker and your default zap amount.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'openSettings', payload: 'zaps' }),
        },
      ],
    },
    {
      // §15 Settings root row "Posting & Media Uploading"
      // Upstream (nostur-com/nostur-ios-public, main, checked 2026-08-06):
      // Settings.swift "Posting & Media Uploading" → PostingAndUploadingSettings
      // "Media uploading" section → "Upload method" picker.
      id: 'media-uploads',
      category: 'Advanced',
      question: 'How do I change where my photos and videos get uploaded?',
      answer: [
        'Open the side menu with your avatar, then tap Settings.',
        'Choose "Posting & Media Uploading".',
        'Under Media uploading, open the "Upload method" picker: nostr.build (the default), nostrcheck.me, "Custom File Storage (NIP-96)" for your own server address, or "Use Blossom server(s)".',
      ],
      note: 'The setting is called "Upload method", not "media server". Picking Blossom lets you add several servers and publish that list to the network.',
    },
    {
      // §15 Settings root row "Database & Cache"
      // Upstream: DatabaseAndCacheSettings.swift — "Media cache" section with
      // one "Clear" button per category, plus "DM disk usage" and "Optimize now".
      id: 'clear-cache',
      category: 'Advanced',
      question: 'How do I clear the cache?',
      answer: [
        'Open the side menu with your avatar, then tap Settings.',
        'Under Data usage, open "Database & Cache".',
        'The Media cache section lists profile pictures, post content, profile banners and badges with their sizes — each has its own "Clear" button.',
        '"DM files and media" is cleared separately, and "Optimize now" compacts the database.',
      ],
      note: 'There is no single clear-everything button — you clear each cache category on its own. If the goal is using less data rather than freeing space, turn on Low Data Mode (the turtle) instead.',
    },
    {
      // §15 Settings → Spam Filtering
      id: 'spam-filter',
      category: 'Advanced',
      question: 'How do I filter out spam?',
      answer: [
        'Open the side menu with your avatar, then tap Settings.',
        'Choose "Spam Filtering".',
        'The "Web of Trust filter" sets how wide your circle is: Strict counts only the people you follow, Normal also counts the people they follow.',
        'In Normal mode a second control appears — the "Nostr Dunbar Number" (250 / 500 / 1000 / 2000 / All, default 1000). Follow lists longer than that are treated as low quality and left out of your web of trust.',
      ],
      note: 'The same screen can restrict media downloads to your web of trust, and verify message signatures.',
    },
    {
      // Accounts/AccountsSheet.swift: navigationTitle "Accounts", rows carry a
      // blue "Read only" badge (privateKey == nil), an indigo "remote signer"
      // badge (account.isNC) and a checkmark on the active one; swipeActions →
      // "Log out". Accounts/FastAccountSwitcher.swift: MAX_ACCOUNTS = 4
      // alternates, tap → accountsState.changeAccount(). Sidebar.swift mounts
      // both in a bottomTrailing overlay next to `ellipsis.circle`.
      // AddExistingAccountSheet.swift prompt: "nostr address / npub / nsec /
      // signer url"; pasting the nsec for an EXISTING read-only row attaches
      // the key in place (flagsSet.insert("full_account")) — no duplicate.
      // CloudAccount lives in the CloudKit-backed "Cloud" store
      // (iCloud.com.nostur.data) and the nsec in a synchronizable Keychain.
      id: 'multi-account',
      category: 'Account & keys',
      question: 'How do I add a second account or switch between accounts?',
      answer: [
        'Tap your avatar to open the side menu. At the bottom-right of the banner sit the fast switcher — small avatars of your other accounts — and a teal ⋯ circle.',
        'Tap any small avatar to switch instantly. The fast switcher shows up to four alternates.',
        'You do not have to switch the whole app to post from another account: the avatar to the left of the composer is a stack of your accounts — tap it once to fan them out, tap one to sign this post with it. Only accounts whose key is on the device appear there.',
        'Tap the ⋯ circle for the full "Accounts" sheet. Every account is a row with its picture and name; a blue "Read only" badge means no private key, an indigo "remote signer" badge means NIP-46, and a teal checkmark marks the active one.',
        '"Add existing account" takes anything in one field — an nsec, an npub or a nostr address (read-only), or a bunker:// URL, where the button becomes "Add (Remote Signer)". "Create new account" mints a fresh key instead.',
        'To remove one, swipe its row left and tap "Log out" — for an account whose key is on this device the "Confirm log out" sheet offers to copy its nsec first; read-only and remote-signer rows have no key to back up, so that sheet is just a confirmation.',
        'Log out is the one you want. The red "Delete account" in Settings is a different thing entirely: it wipes your public profile and following list ON THE NETWORK and deletes your nsec from the keychain, for whichever account you are signed in as.',
      ],
      note: 'Pasting the nsec for an account you added read-only upgrades that same row in place — do not log it out first. Your accounts, relays, feeds and bookmarks sync between iPhone, iPad and Mac over iCloud; app preferences like theme and default zap amount are global, not per account. One global setting decides what a second account SEES: Settings → Spam Filtering → "Main account" picks whose follow graph builds your web of trust and stays put when you switch — if a newly added account feels filtered down to nothing, point that picker at it.',
      howNostrWorks:
        'An account on Nostr IS a keypair — there is no server-side account, no password, no registration. "Adding an account" only means telling the app about another key, and "switching" means switching which key it signs with and whose follow list it reads. Everything you think of as the account — name and picture, follow list, DM relays — are ordinary signed events on relays under that one key, so any client holding the key rebuilds the same identity, and a different key is a genuinely different, empty one. A public key alone is enough to read everything, which is why watch-only accounts work; only the secret key can sign, which is why they cannot post.',
      showMe: [
        {
          target: '[data-tour="nostur-switcher"]',
          title: 'The fast account switcher',
          content:
            'The teal ⋯ opens the full "Accounts" sheet; the small avatar beside it is a fast switcher — one tap and you are signed in as that account.',
          position: 'bottom',
          commands: cmd({ type: 'openDrawer' }),
        },
      ],
    },

    // ------------------------------------------------------- Troubleshooting --
    // "Why doesn't this work" answers. TEXT-ONLY on purpose: the simulator
    // cannot stage a failure, so a demo here could only contradict itself.
    // Grounded in nostur-com/nostur-ios-public (2026-08-07). None of these
    // screens appear in the reference recording — they are source-verified, so
    // the copy quotes labels and behaviour, never rendered appearance.
    {
      // DatabaseProblemView.swift, verbatim: "Something went wrong" / "The
      // database could not be loaded." / "There are 2 solutions:" + "Error: 00".
      // AppView.swift swaps the whole app for it on ViewState.databaseError.
      // Settings/DatabaseAndCacheSettings.swift: "Database status" (+ "Last
      // optimize", "Optimize now") and per-cache "Clear" buttons.
      // NosturCloud xcdatamodel: NWCConnection sits in the device-only "Local"
      // configuration, so the wallet pairing does NOT come back with a reinstall.
      id: 'trouble-startup',
      category: 'Troubleshooting',
      question: 'Nostur crashes or hangs when I open it — what can I do?',
      answer: [
        'If the local database will not open, Nostur does not crash — it replaces the whole app with "Something went wrong" / "The database could not be loaded.", offers exactly two solutions (send a screenshot and wait for a fix, or reinstall and start fresh), and prints the raw error under "Error: 00". Screenshot that text: it is the only diagnostic the app gives you.',
        'There is no safe mode, no crash-log viewer and no reset-without-reinstalling button on iOS.',
        'For a slow rather than broken start: side menu → Settings → "Database & Cache". The "Database status" section counts your stored events and contacts and shows "Last optimize"; "Optimize now" runs the full maintenance pass.',
        'The same screen has a "Clear" button beside each media cache — profile pictures, post content, banners, badges — plus a DM files sub-screen with its own size limit.',
        'To cut work at launch, tap the tortoise in the Home toolbar (Low Data Mode), and in Settings → Appearance turn off "Enable animated profile pics" and "Fetch counts on timeline".',
        'Take two backups before you reinstall. Settings → "Database & Cache" → Data export writes every note Nostur holds for this account to a file, and Settings → Private key gets you the nsec — the reinstall only restores it through the iCloud Keychain, so with that switched off a reinstall ends the account for good.',
        'Otherwise a reinstall costs less than it sounds: accounts, relays, feeds, bookmarks, private notes and block list are in the iCloud-backed store. The cached notes, muted words and your Nostur Wallet Connect pairing are device-only and will be gone.',
      ],
      howNostrWorks:
        'Nothing about your identity is stored inside the app. Your key is a key; your profile, follow list and every note you wrote are signed events sitting on relays. A local database that has to be thrown away costs you only a cache — on the next launch the client re-subscribes with the same public key and re-fetches. There is no Nostr account server to restore from and no server-side session a reinstall could break. The flip side is that no relay can help with a client-side database fault: relays speak the wire protocol and hold no state about your device.',
    },
    {
      // PostDetailsMenuSheet.swift: "Sent to:" / "Received from:" + Republish.
      // RepublishPostSheet.swift: "Republish to relays", per-relay checkboxes,
      // red "auth required" badge → "Retry with authentication", "Using
      // account: {name}". RelaysView.swift rows: green/gray dot + magnifier /
      // arrow.down (read) / arrow.up (write) toggles. Kind10002ConfigurationWizard
      // spells out read/write/dm semantics verbatim.
      id: 'trouble-not-delivered',
      category: 'Troubleshooting',
      question: 'My notes are not showing up for other people (or I cannot see theirs)',
      answer: [
        'Start with the note itself: ••• → "Post details". At the bottom it lists the actual relays under "Sent to:" (your posts) or "Received from:" (other people\'s). A short or missing "Sent to:" means the note never left.',
        'Same sheet → "Republish" opens a checkbox list of every configured relay, plus a row to type a new address. Relays that refuse get a red "auth required" badge and the button becomes "Retry with authentication".',
        'Check the pipes: Settings → Relay Connections → "Configure your relays...". Each relay row has a leading dot (green = connected) and three toggles — search, read (down arrow) and write (up arrow). If no relay has the write arrow lit, nothing you post goes anywhere.',
        'Tell the network where to look: Settings → Relay Connections → "Announce your relays…" → "Reconfigure announced relays…" walks you through which relays others should use to find you, reach you, and DM you, then publishes it.',
        'Diagnose one relay: Settings → Relay Connections → "Relay connection stats" gives per-relay reconnects, messages and errors, the last ten error and notice messages, request latency, and which of the people you follow arrived from there.',
        'Widen the net with "Autopilot" (connect to extra relays from people you follow) and "Follow relay hints". If you have VPN detection on, those extra connections are only made while a VPN is active.',
      ],
      howNostrWorks:
        'A note only exists on the relays your client actually sent it to, and a reader only sees it if they read from a relay that has a copy — relays do not gossip to each other, so there is no network that propagates posts for you. NIP-65 bridges that gap: you publish a small event saying where to write to reach you and where you post. Nostur\'s own wizard states the semantics plainly — write means you post there so others read from there; read means you read there so others should post there. If you never published that list, other people\'s clients are guessing. And a relay can silently decline your note: many require authentication, some are paid or whitelist-only, some rate-limit. A rejected note is simply gone and nobody retries it for you, which is exactly why a manual republish button exists.',
    },
    {
      // NWCZapQueue.swift: error strings "Could not fetch invoice" and, after
      // 42s, "Time out (receiver wallet service down or not reachable?)" →
      // PersistentNotification.createFailedNWCZap ("[Zap] failed."), and
      // event.zapState = nil reverts the bolt. ZapButton.swift guards every
      // path on isFullAccount(). screen-map §7: the bolt is opacity 0.3 and
      // disabled when the author has no lightning address.
      id: 'trouble-zap-failed',
      category: 'Troubleshooting',
      question: 'My zap failed — what went wrong?',
      answer: [
        'Look at the button first. The bolt is drawn faded and disabled when that author has no lightning address in their profile — there is nothing to pay and no setting fixes it.',
        'A one-tap zap that fails shows no toast — it writes a notification you read on the Notifications tab → Zaps: "Zap failed" for that post or contact, with the reason. The two you will actually see are "Could not fetch invoice" (the recipient\'s Lightning server returned nothing) and, after 42 seconds of silence, "Time out (receiver wallet service down or not reachable?)". The yellow bolt reverts at the same time.',
        'A zap you sent from the amount sheet is louder: the sheet stays open with a bold red "There was a problem, could not send sats", and a failed invoice fetch also flashes a short "Could not fetch invoice from: …" banner.',
        'A third wording matters: "Zap MAY have failed" means your own wallet answered and refused — the line under it is your wallet\'s own words, which is where an empty balance or a spent wallet-connection budget shows up. Fix those at the wallet, not on the recipient\'s side.',
        'Wallet side: Settings → Zaps holds the Lightning wallet picker and the default zap amount (21). Nostur Wallet Connect is what pays inside the app; with a plain external wallet Nostur just hands the invoice over and a failure there never comes back to Nostur at all.',
        'If the bolt opens a sheet titled "Read-only mode" instead, you are signed in with an npub — see "I cannot post at all".',
        'Multi-device gotcha: your wallet pairing is stored on one device only. A zap that works on your iPhone can fail on your iPad even though both show the same account — connect the wallet again there.',
      ],
      howNostrWorks:
        'A zap is two things bolted together and either half can fail alone. First a real Lightning payment: your client reads the recipient\'s lightning address out of their profile event, asks that server for an invoice for your amount, and pays it. Then a receipt: the recipient\'s server — not your client — is supposed to publish a zap receipt to relays, and that receipt, not your payment, is what makes the counter go up for everyone. So the break can be at the profile (no address), at their server (down, or your amount is outside its limits), at your wallet (no balance, no route), or purely at the receipt stage — in which case the sats really did move and the post still reads zero.',
    },
    {
      // ReadOnlyAccountInformationSheet.swift, verbatim: "Read-only mode" /
      // "You are using a read-only account.\n\nSwitch to another account or add
      // the private key to fully use this account." — with AccountsSheet
      // embedded. NewPostButton/LoggedInAccount guard on isFullAccount().
      // AddExistingAccountSheet.addExistingAccount upgrades an existing row in
      // place rather than creating a second one.
      id: 'trouble-read-only',
      category: 'Troubleshooting',
      question: 'I cannot post, zap or follow anything',
      answer: [
        'You added the account with an npub (or a nostr address, which resolves to one), so Nostur has no key to sign with. Its row in the "Accounts" sheet carries a blue "Read only" badge.',
        'Or you tapped "Try guest account" on the welcome screen — a shared, keyless demo identity that can read and browse but never post. Fix B below does not apply to it: there is no nsec for that key, so use "Create new account" or add your own.',
        'Nothing fails silently: compose, zap, reply and report each open a sheet headed "Read-only mode" — "You are using a read-only account. Switch to another account or add the private key to fully use this account." The account list is embedded right in that sheet. Delete is simply absent: the post menu hides that row entirely for a read-only account.',
        'Fix A — switch: tap any account without the "Read only" badge, from that sheet or from side menu → ⋯ → Accounts.',
        'Fix B — upgrade it in place: Accounts → "Add existing account" → paste the nsec for that same key → "Add". Nostur finds the existing row, attaches the key and switches to it. Do NOT log the read-only one out first, and do not expect a duplicate.',
        'Fix C — keep the key off the phone: paste a bunker:// URL from a NIP-46 remote signer. The button becomes "Add (Remote Signer)" and the account posts normally with an indigo badge, while your nsec stays in the signer.',
        'Reading, feeds, search, bookmarks and private notes all work read-only. Posting, replying, reacting, reposting, zapping, following, reporting and deleting do not.',
      ],
      howNostrWorks:
        'An npub is only the public half of the keypair. Every action that changes anything on Nostr — a note, a reaction, a follow, a zap request, a profile edit — is an event that must carry a signature made with the secret half, and relays drop anything unsigned or mis-signed. So a client holding only an npub physically cannot produce a publishable event; this is not a permission the app is withholding. Reading needs no key at all, which is why watching someone else\'s feed from their npub works perfectly. A remote signer resolves this without moving the secret: the key stays in the signer, your client sends it an unsigned event over an encrypted channel and gets the signature back.',
    },
    {
      // SettingsStore.swift registers AutodownloadLevel.onlyWoT as the DEFAULT
      // for autoDownloadFrom → shouldAutodownload() gates media on the web of
      // trust. MediaView.swift states: .dontAutoLoad "Tap to load media",
      // .lowDataMode "Loading paused (Low data mode)" + "Load anyway",
      // .httpBlocked "non-https media blocked", .imageTooLarge "Image is larger
      // than 50 MB, not loaded.", .error "Failed to load image" + "Try again".
      id: 'trouble-images',
      category: 'Troubleshooting',
      question: 'Images are not loading',
      answer: [
        'Most likely this is deliberate. Nostur ships with media downloading limited to your web of trust, so pictures from strangers are never fetched — the post shows "Tap to load media" with the URL underneath. Change it at Settings → Spam Filtering → "Media downloading".',
        'Second most likely: Low Data Mode. The tortoise in the Home toolbar toggles it and every image becomes "Loading paused (Low data mode)" with a teal "Load anyway" link. The tortoise itself looks dimmed when the mode is OFF, which reads as broken but is normal.',
        'A blurred placeholder with a bold "NSFW" over it is a third thing again: the poster tagged that post as sensitive, and Nostur never auto-loads sensitive media whatever "Media downloading" says. Tap the picture to load it.',
        '"non-https media blocked" means the poster used a plain http:// URL and Nostur refuses it — nothing to fix on your side.',
        '"Failed to load image" with a "Try again" button means the fetch genuinely failed, which is the host, not Nostur. Very large images get their own "Load anyway".',
        'Suspect a poisoned cache: Settings → "Database & Cache" → Media cache → "Clear" beside profile pictures, post content, banners or badges.',
      ],
      howNostrWorks:
        'An image is not part of the note. A note is a signed text event; a picture is nothing but a URL inside that text pointing at a third-party host the poster happened to use. Relays never store, proxy or serve the file and have no idea whether it still exists, so the picture vanishes for everyone the moment that host goes down, deletes it or blocks you — and no relay setting, reconnect or client can bring it back, while the note itself stays perfectly intact. This is also why clients gate media on trust: fetching that URL tells whoever the poster chose your IP address and roughly when you read the post, which is exactly what a web-of-trust default protects you from.',
    },
    {
      // NotificationSettings.swift: Section("Show unread count badge") with
      // per-type toggles; Section("Home/Lock screen notifications") whose
      // footer reads, verbatim: "Home/Lock screen notifications are only active
      // for the currently logged in account and can be a bit delayed".
      // Toggling it off cancels BGTask "com.nostur.app-refresh".
      // NotificationsScreen.swift: permission banner + "Open Settings".
      id: 'trouble-notifications',
      category: 'Troubleshooting',
      question: 'My notifications stopped arriving',
      answer: [
        'Open the Notifications tab and tap the gear. The screen has two sections that fail for different reasons.',
        '"Show unread count badge" holds per-type toggles — new followers, reposts, reactions, zaps, posts. If only one kind went quiet, check this list first: these drive the red unread counts on the tabs.',
        '"Home/Lock screen notifications" is the background one, and its footer explains most complaints outright: notifications are only active for the account you are currently logged in as, and can be a bit delayed. If you switched accounts, notifications followed the switch.',
        'The spam filter is the quietest cause of all: Nostur hides notifications from anyone outside your web of trust — mentions, reactions, reposts and small zaps simply never reach the tabs or the unread counts. If someone insists they replied to you, widen it at Settings → Spam Filtering, and check that "Main account" points at the account you are signed in as.',
        'If iOS itself has permission off, a banner appears at the top of the Notifications tab saying so, with an "Open Settings" button.',
        'Turning the background toggle off cancels the iOS background-refresh task; turning it back on re-requests permission and re-schedules it. iOS decides when that task actually runs — that is the "can be a bit delayed" part.',
        'Entering the Notifications tab auto-selects the first tab with unread items, so a tab that looks empty may simply have been marked read.',
      ],
      howNostrWorks:
        'Nostr has no push server, and this is the most common misunderstanding about it. Nobody can push to your phone because no server knows your device — there is no account server at all. A client learns you were mentioned only by holding an open subscription to relays and asking for events that tag your public key: replies and mentions, reposts, reactions, zap receipts, follows. So notifications are really "the app was awake and connected long enough to notice". They stop when the app is backgrounded and the OS declines to wake it, when the relays you read from simply do not have the event (the person who mentioned you wrote it somewhere you never read — which is what inbox relays exist to prevent), or when you switched to a different key, in which case nothing is addressed to you.',
      note: 'Only one account gets home and lock-screen notifications at a time — the one you are signed in as.',
    },
    {
      // Accounts/FollowingGuardian.swift + Utils/View+withSheets.swift: the
      // confirmationDialog "It looks like N contacts were removed from your
      // following list, perhaps from another nostr app" with "Remove N
      // contacts" / "Restore N contacts" / "Ignore"; restoreFollowing() calls
      // account.publishNewContactList(). listenForAccountChanged() debounces 7s
      // then re-requests kind:0 + kind:3. NOTE the upstream TODO: the guard
      // covers the ACTIVE account only.
      id: 'trouble-empty-profile',
      category: 'Troubleshooting',
      question: 'My profile is empty and my follows are gone',
      answer: [
        'Nostur has a purpose-built guard for this. When a follow list arrives with fewer people than you had, it asks: "It looks like N contacts were removed from your following list, perhaps from another nostr app", and names them if there are fewer than ten. Choose "Restore N contacts" — it adds them back AND republishes your list. "Ignore" keeps them locally without republishing.',
        'The same guard works quietly in your favour: follows you added in another client are merged in automatically.',
        'Check your own taps too. Follow is a THREE-state button: tap once to follow, tap again and it becomes "🤫 Following" — a silent follow, which quietly takes that person out of the follow list Nostur publishes — and only the third tap unfollows. Silent follows live on your devices alone, so your public count really is smaller.',
        'It also re-fetches your profile and follow list about seven seconds after every account switch, so wait a moment before concluding anything is gone.',
        'If the profile is blank rather than shrunken, check which account you are on: the side menu prints your name, your npub and your following count, and the Accounts sheet marks the active row and badges read-only ones. An npub pasted by mistake looks exactly like an empty account.',
        'If your follows are fine locally but nobody else sees your profile, your profile never reached the right relays: ••• → "Post details" → "Republish" shows where a note actually went, and Settings → Relay Connections → "Announce your relays…" publishes where to find you.',
        'Reinstalling is safe here: accounts, relays, feeds, bookmarks and block list come back from iCloud, and the note cache simply refills from relays.',
      ],
      howNostrWorks:
        'Your profile and your follow list are ordinary signed, replaceable events. Replaceable means each relay keeps exactly one per kind per key — the newest — and discards the older. That single rule is the whole story: if any client you used publishes a follow list containing fewer people, it overwrites the fuller one on every relay it reached, and nothing on the network remembers the old one. That is why lost follows almost always trace back to another app, or to a client that published before it had finished loading your list — never to a relay deleting things. The other half is that everything hangs off ONE key, so opening the app with a different key shows a genuinely empty account. There is nothing to recover in that case; it is simply a different identity.',
      note: 'The follow-list guard watches the account you are signed in as. Upstream flags covering the others as still to do.',
    },
  ],
};

export default nosturFaq;
