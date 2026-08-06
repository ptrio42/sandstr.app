/**
 * Wisp FAQ — grounded in docs/refs/wisp/screen-map.md, with upstream
 * barrydeen/wisp (v1.2.1, MIT © Barry Deen) cited where the recording never
 * opened a screen. docs/gaps/wisp.md is the showMe gate.
 *
 * Wisp is the small, readable Android client: one accent (#FF9800), an undo
 * countdown on publish, and a drawer that holds everything.
 */

import type { SimulatorCommand } from '../../simulators/wisp/types';
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

// Commands are self-sufficient (each signs in on its own), so every step
// carries exactly ONE — the queue can never drop a second.
const feed = cmd({ type: 'navigate', payload: 'home' });

const actionStep = (target: string, title: string, content: string): Step => ({
  target,
  title,
  content,
  position: 'top',
  commands: feed,
});

export const wispFaq: ClientFaq = {
  clientId: 'wisp',
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
      // §16 Splash + Nostr sheet. Upstream AuthViewModel.logIn() enumerates
      // the accepted inputs; there is no NIP-55 signer at this version.
      id: 'sign-in',
      category: 'Getting started',
      question: 'How do I sign in?',
      answer: [
        'Wisp opens on a splash with two buttons; tap "Continue with Nostr".',
        'A sheet slides up: "Enter your existing key, or create a new account. Your key never leaves the device."',
        'Paste into the "nsec or npub…" field — masked, with an eye to reveal and a QR icon to scan — then tap "Log In".',
        'No key yet? "Create new account" walks you through a photo, display name and bio, then finding people and topics to follow.',
      ],
      note: 'Wisp holds the key itself — at this version there is no external-signer button, whatever the project README suggests. An npub gets you watch-only mode: you can read and follow, but not post.',
      showMe: [
        {
          target: '[data-tour="wisp-login"]',
          title: 'The splash',
          content:
            'Two ways in. "Continue with Nostr" is the one that takes a key — it opens the sheet with the "nsec or npub…" field.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'back' }),
        },
      ],
    },
    {
      // §5 Feed top bar — the feed selector is a dropdown, For You default
      id: 'feed-selector',
      category: 'Getting started',
      question: 'How do I switch feeds?',
      answer: [
        'The pill in the middle of the feed\'s top bar is the feed selector — tap it and a dropdown opens.',
        'It starts on "For You".',
      ],
      note: 'The pills beside it are status, not controls: one shows how many people are online, the other how many relays you are connected to.',
      showMe: [
        {
          target: '[data-tour="wisp-selector"]',
          title: 'The feed selector',
          content: 'A dropdown in the top bar, not a tab row — "For You" is where it starts.',
          position: 'bottom',
          commands: feed,
        },
      ],
    },
    {
      // §15 Drawer — the hub for everything
      id: 'drawer',
      category: 'Getting started',
      question: 'Where is everything? The bottom bar only has a few tabs.',
      answer: [
        'Tap your avatar in the top-left of the feed — that opens the drawer.',
        'Wallet, Settings, your profile and the logout row all live there, not in the bottom bar.',
        '"Settings" expands in place into Interface, Relays, Media Servers, Keys, Safety and Social Graph.',
      ],
      showMe: [
        {
          target: '[data-tour="wisp-drawer"]',
          title: 'Your avatar opens the drawer',
          content: 'Top-left of the feed. Wisp keeps its bottom bar tiny and puts the rest behind here.',
          position: 'bottom',
          commands: feed,
        },
        {
          target: '[data-tour="wisp-settings"]',
          title: 'Settings expands in place',
          content:
            'Tapping "Settings" unfolds its sub-screens inside the drawer rather than pushing a new page.',
          position: 'right',
          commands: cmd({ type: 'openDrawer' }),
        },
      ],
    },

    // ------------------------------------------------------------ Posting --
    {
      // §11 Compose; upstream ComposeScreen.kt (countdown) + Interface
      // settings ("Undo countdown", 5/10/15/20/30s, default 10s).
      id: 'post-note',
      category: 'Posting',
      question: 'How do I post a note — and what is the countdown after I publish?',
      answer: [
        'Tap the orange pencil at the bottom-right of the feed; it dims while you scroll but never leaves.',
        'Write under "What\'s on your mind?" and press "Publish".',
        'The note does not go out yet: the bar becomes a red X and a draining pill counting "Post now (10)" down.',
        'Leave it and the note publishes, tap the pill to send it immediately, or tap the X to bin it.',
      ],
      note: 'That countdown is Wisp\'s undo. It is a switch — Settings → Interface → Posting → "Undo countdown" — with 5, 10, 15, 20 or 30 seconds (10 by default), plus "Include replies", which is off so replies send straight away.',
      showMe: [
        {
          target: '[data-tour="wisp-compose"]',
          title: 'The compose button',
          content:
            'The orange pencil, bottom-right — one of only two orange things on the feed.',
          position: 'left',
          commands: feed,
        },
        {
          target: '[data-tour="wisp-post"]',
          title: 'Publish',
          content:
            'This bar stays dimmed until you have typed something; pressing Publish replaces it with the red X and the draining "Post now" pill.',
          position: 'top',
          commands: cmd({ type: 'compose' }),
        },
      ],
    },
    {
      // §7 Post card action row
      id: 'reply',
      category: 'Posting',
      question: 'How do I reply to a note?',
      answer: [
        'Tap the speech bubble — first in the row under the note.',
        'Or open the note and use the "Reply…" bar pinned to the bottom of the thread.',
      ],
      showMe: [
        actionStep(
          '[data-tour="wisp-actions"]',
          'The action row',
          'Five slots in this order: reply, react, repost, zap, add-to-list.',
        ),
        {
          target: '[data-tour="wisp-reply"]',
          title: 'The thread reply bar',
          content: 'Open a note and this pill sits at the bottom of the conversation, always in reach.',
          position: 'top',
          commands: cmd({ type: 'openThread' }),
        },
      ],
    },

    // --------------------------------------------------- Reactions & zaps --
    {
      // §7 action row — the emoji REPLACES the heart and never tints it
      id: 'react',
      category: 'Reactions & zaps',
      question: 'How do I react to a note?',
      answer: [
        'Tap the second icon in the row under the note to send Wisp\'s default reaction.',
        'Press and hold it to pick a different emoji instead.',
      ],
      note: 'Wisp does something no other client here does: the emoji you pick REPLACES the icon rather than colouring it. So a reacted note shows your emoji sitting where the heart was, in the same neutral shade — the row never lights up.',
      showMe: [
        actionStep(
          '[data-tour="wisp-actions"]',
          'React',
          'The second slot. Whatever emoji you send takes the icon\'s place — it is never tinted.',
        ),
      ],
    },
    {
      // §7 action row (zap, ₿ default) + §13 zap sheet
      id: 'zap',
      category: 'Reactions & zaps',
      question: 'How do I zap (tip sats to) a note?',
      answer: [
        'Tap the lightning bolt — fourth in the row under the note.',
        'The zap sheet opens with preset amounts: 21, 100, 500, 1000 and 5000 sats.',
        'Or tap "Custom", type an amount, and use its "+" to keep that amount as a preset of your own.',
      ],
      note: 'The number beside the bolt is the total sats a note has earned. Wisp shows a ₿ by default rather than a fiat value — you can switch that in Interface settings.',
      showMe: [
        {
          target: '[data-tour="wisp-zap"]',
          title: 'The zap sheet',
          content: 'Presets across the top, a Custom pill for anything else, and the send button naming the amount.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'zap' }),
        },
      ],
    },

    // ----------------------------------------------------- Finding things --
    {
      id: 'search',
      category: 'Finding things',
      question: 'How do I search?',
      answer: [
        'Open the search tab in the bottom bar.',
        'Type a name, a word or a hashtag — results appear as you type.',
      ],
      showMe: [
        {
          target: '[data-tour="wisp-search"]',
          title: 'Search',
          content: 'The search tab starts empty; results only appear once you have typed something.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'search' }),
        },
      ],
    },
    {
      // §9 Profile — the follow circle
      id: 'follow',
      category: 'Finding things',
      question: 'How do I follow someone?',
      answer: [
        'Open their profile by tapping their avatar or name on any note.',
        'Tap the round follow button beside their stats.',
      ],
      note: 'Wisp prints "∞" where a follower count is unknown rather than guessing a number — that is not a bug.',
      showMe: [
        {
          target: '[data-tour="wisp-follow"]',
          title: 'The follow circle',
          content: 'A round button, not a pill — and it only exists on other people\'s profiles.',
          position: 'bottom',
          commands: cmd({ type: 'viewProfile', payload: 'other' }),
        },
      ],
    },
    {
      id: 'notifications',
      category: 'Finding things',
      question: 'Where are my notifications?',
      answer: [
        'Open the bell tab in the bottom bar.',
        'The filter control at the top narrows the list by kind.',
      ],
      showMe: [
        {
          target: '[data-tour="wisp-notifications"]',
          title: 'Notifications',
          content: 'Everything that happened, with a filter above it — the bell in the bar carries Wisp\'s flower badge when something is new.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'notifications' }),
        },
      ],
    },
    {
      id: 'dms',
      category: 'Finding things',
      question: 'Where are my direct messages?',
      answer: ['Open the messages tab in the bottom bar to see your conversations.'],
      showMe: [
        {
          target: '[data-tour="wisp-messages"]',
          title: 'Messages',
          content: 'Your conversation list. Wisp keeps DMs in the bottom bar rather than behind the drawer.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'messages' }),
        },
      ],
    },

    // ------------------------------------------------------------- Relays --
    {
      // Upstream: drawer → Settings → "Relays"; tabs General | DM | Search |
      // Blocked; read/write/auth chips on General only.
      id: 'manage-relays',
      category: 'Relays',
      question: 'How do I add or remove relays?',
      answer: [
        'Open the drawer with your avatar, tap "Settings", then "Relays".',
        'Four tabs across the top: General, DM, Search and Blocked.',
        'To add: type into the "wss://" field and tap "+". To remove: the red bin on the row.',
        'Press the broadcast button above the list to publish that list — "Broadcast Relay List (NIP-65)" on the General tab.',
      ],
      note: 'Only the General tab shows the three lowercase chips — read, write and auth — one per relay. Nothing you change is published until you broadcast.',
      showMe: [
        {
          target: '[data-tour="wisp-set-relays"]',
          title: 'Relays',
          content:
            'The read / write / auth chips sit on each row here. Their washed-out purple fill is a real upstream quirk, reproduced on purpose.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'openSettings', payload: 'relays' }),
        },
      ],
    },

    // ------------------------------------------------------ Account & keys --
    {
      // Upstream KeysScreen.kt — "Reveal Private Key" behind a device
      // credential prompt when the phone has a lock set.
      id: 'backup-keys',
      category: 'Account & keys',
      question: 'Where do I find and back up my keys?',
      answer: [
        'Open the drawer with your avatar, tap "Settings", then "Keys".',
        '"Public Key" comes first — that is your npub, safe to share, with QR and copy buttons.',
        'Under "Private Key", tap "Reveal Private Key" and copy the nsec somewhere safe.',
        'The red line at the bottom is the point of the screen: never share your private key with anyone.',
      ],
      note: 'If your phone has a lock set, revealing the key asks for it first. Wisp\'s wallet is derived from this same key, so losing the nsec loses the wallet with it.',
      showMe: [
        {
          target: '[data-tour="wisp-set-keys"]',
          title: 'Keys',
          content:
            'Public key on top, private key behind a reveal below it — this screen is where a backup starts.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'openSettings', payload: 'keys' }),
        },
      ],
    },
    {
      // Upstream SafetyScreen.kt — exactly three tabs.
      id: 'mute',
      category: 'Account & keys',
      question: 'How do I mute a person, a word or a thread?',
      answer: [
        'A person: tap "⋮" on any of their notes and choose "Block" — or open their profile and use the mute button beside their stats.',
        'A word: open the drawer → Settings → "Safety" → the "Muted Words" tab, type into "Add a word or phrase" and tap "+".',
        'A thread: tap "⋮" on a note in the feed or in notifications and choose "Mute Thread". That option is gone once you are inside the thread.',
        'To review: the same Safety screen has "Muted Users" with an ✕ per row to unblock.',
      ],
      note: 'Wisp cannot mute hashtags, and there is no list of muted threads — muting one is a decision you cannot undo from the interface. Its wording is also inconsistent on purpose to match upstream: the note menu says "Block", the profile button says "Mute", and the settings tab says "Muted Users".',
    },
    {
      // Upstream WispDrawerContent.kt — Logout row + confirmation dialog.
      id: 'logout',
      category: 'Account & keys',
      question: 'How do I log out?',
      answer: [
        'Open the drawer with your avatar and scroll to the bottom.',
        '"Logout" is the last row, in red.',
        'Confirm in the dialog — it reminds you to back up your private key first.',
      ],
      note: 'With several accounts signed in, this drops only the active one and hands you back to the next. Without the nsec, that identity cannot be recovered.',
      showMe: [
        {
          target: '[data-tour="wisp-drawer"]',
          title: 'The drawer holds the exit',
          content: 'Open it from your avatar; "Logout" is the last row, under Settings and above the version line.',
          position: 'bottom',
          commands: feed,
        },
      ],
    },

    // ----------------------------------------------------------- Advanced --
    {
      // Upstream: drawer → "Wallet" → "Connect a wallet" (Spark / NWC).
      id: 'connect-wallet',
      category: 'Advanced',
      question: 'How do I connect a Lightning wallet?',
      answer: [
        'Open the drawer with your avatar and tap "Wallet" — it is also the second tab in the bottom bar.',
        'With nothing connected you get "Connect a wallet": "Send and receive Lightning payments, and zap anyone on Nostr."',
        '"Spark wallet" is the recommended, self-custody one built in — it derives from your Nostr key, so it comes back on any device you sign in on.',
        'Or pick "Nostr Wallet Connect" and paste a connection string from Alby, Zeus, Rizful, Minibits and the like.',
      ],
      note: 'There is no "default zap amount" setting: the amounts you see are the zap sheet\'s presets, and you add your own from the Custom pill there.',
      showMe: [
        {
          target: '[data-tour="wisp-wallet"]',
          title: 'Wallet',
          content: 'A whole screen for it — Wisp is one of the few clients with the wallet built in rather than linked out.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'wallet' }),
        },
      ],
    },
    {
      // Upstream: drawer → Settings → "Media Servers" — Blossom only.
      id: 'media-servers',
      category: 'Advanced',
      question: 'Where do my photos get uploaded?',
      answer: [
        'Open the drawer with your avatar, tap "Settings", then "Media Servers".',
        'Add one by typing its URL into the field and tapping "+".',
        'Drag the handle to reorder — the helper text says "Drag to reorder priority" and the top entry is tagged "Primary".',
        'The red bin removes a server.',
      ],
      note: 'Wisp uploads to Blossom servers only — there is no NIP-96 option and no picker of named services, so the list you keep here IS the setting.',
    },
    {
      // Upstream: exists=false — no cache-clearing control anywhere at v1.2.1.
      id: 'clear-cache',
      category: 'Advanced',
      question: 'How do I clear the cache?',
      answer: [
        'Wisp has no clear-cache button — there is no such control anywhere in the app.',
        'To free up space, use Android itself: long-press the Wisp icon → App info → "Storage & cache" → "Clear cache".',
      ],
      note: 'Do not mistake the developer Console\'s bin icon or "Clear logs" for a cache control — those clear logs, nothing else.',
    },
    {
      // §15 drawer status line; upstream "Update Status" dialog (NIP-38).
      id: 'status',
      category: 'Advanced',
      question: 'What is the "Set status..." line in the drawer?',
      answer: [
        'It sets a short status on your profile — the Nostr equivalent of a away-message.',
        'Open the drawer and tap the grey italic "Set status..." under your name to get the "Update Status" dialog.',
        'Statuses you set show up beside your name for other people using clients that read them.',
      ],
    },
  ],
};

export default wispFaq;
