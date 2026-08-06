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
      question: 'How do I block someone (or mute a thread)?',
      answer: [
        'Open the "•••" menu on any of their posts and choose "Block {name}" — you can block permanently or for a set time, from one hour up to a month.',
        'The same menu has "Mute conversation", which silences just that thread.',
        'To manage everything, open the side menu with your avatar and tap "Block list": tabs for Blocked, Muted conversations and Muted words.',
        'Swipe a row in Blocked to unblock; the Muted words tab has a "+" for adding keywords.',
      ],
      note: 'Nostur\'s wording differs from other clients: people are BLOCKED, while "mute" applies only to a conversation or a word.',
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
  ],
};

export default nosturFaq;
