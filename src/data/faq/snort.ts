/**
 * Snort FAQ — grounded in docs/refs/snort/screen-map.md (section refs in
 * comments), with upstream v0l/snort cited where the recording never opened a
 * screen. docs/gaps/snort.md is the showMe gate.
 *
 * Snort's shell fact worth repeating: there is no tab bar anywhere — the feed
 * picker is a DROPDOWN, and almost everything else hangs off the left rail.
 */

import type { SimulatorCommand } from '../../simulators/snort/SnortSimulator';
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
const timeline = cmd({ type: 'navigate', payload: 'timeline' });

const actionStep = (target: string, title: string, content: string): Step => ({
  target,
  title,
  content,
  position: 'top',
  commands: timeline,
});

export const snortFaq: ClientFaq = {
  clientId: 'snort',
  categories: CATEGORIES,
  coverage: {
    'sign-in': 'sign-in',
    'backup-keys': 'export-keys',
    logout: 'logout',
    post: 'post-note',
    reply: 'reply',
    reactions: 'react-heart',
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
      // §15 Onboarding / sign-in
      id: 'sign-in',
      category: 'Getting started',
      question: 'How do I sign in?',
      answer: [
        'Snort opens on a "Sign In" card in the middle of the page.',
        'The quickest way is "Sign in with Nostr Extension" — it hands the signing to a browser extension so your key never touches the page.',
        'Otherwise pick "Sign in with key": the field takes an nsec, npub, NIP-05 address, hex key or a mnemonic. Then press "Login".',
        'No account yet? "Don\'t have an account?" at the bottom leads to Sign Up.',
      ],
      note: 'An npub or NIP-05 gets you a read-only session — you need the nsec, an extension or a signer to post. Snort is a web app, so the extension route is the one that keeps your key out of the browser tab.',
      showMe: [
        {
          target: '[data-tour="snort-login"]',
          title: 'The sign-in card',
          content:
            'Snort keeps the left rail visible behind it — onboarding is a card in the feed column, not a separate page.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'logout' }),
        },
      ],
    },
    {
      // §6.1 The feed picker is a DROPDOWN, not a tab row
      id: 'feed-picker',
      category: 'Getting started',
      question: 'Where are the feed tabs?',
      answer: [
        'There are none — Snort has no tab bar anywhere.',
        'The label in the middle of the header IS the picker: click it and a dropdown opens.',
        'Choose from For you, Following, Trending Notes, Conversations, Followed by friends, Trending Hashtags and Media.',
      ],
      note: 'The only thing marking your current feed is which label the button shows, so the header doubles as a status line.',
      showMe: [
        {
          target: '[data-tour="snort-feed"]',
          title: 'The home feed',
          content:
            'The picker sits in the header above this list — a dropdown, never an underlined tab row.',
          position: 'center',
          spotlightPadding: 0,
          commands: timeline,
        },
      ],
    },

    // ------------------------------------------------------------ Posting --
    {
      // §5 App shell (rail "New Note"), §11 Compose
      id: 'post-note',
      category: 'Posting',
      question: 'How do I post a note?',
      answer: [
        'Click the orange "New Note" button in the left rail — it is one of only two coloured controls in the whole shell.',
        'Write your note in the box that opens.',
        'Press "Send" to publish.',
      ],
      showMe: [
        {
          target: '[data-tour="snort-compose"]',
          title: 'New Note',
          content:
            'The orange pill in the left rail. Snort has no floating compose button — composing starts here.',
          position: 'right',
          commands: timeline,
        },
        {
          target: '[data-tour="snort-post"]',
          title: 'Send',
          content: 'The button reads "Send" for a new note and "Reply" when you are answering one.',
          position: 'bottom',
          commands: cmd({ type: 'compose' }),
        },
      ],
    },
    {
      // §4 Note card + action bar
      id: 'reply',
      category: 'Posting',
      question: 'How do I reply to a note?',
      answer: [
        'Use the action row under the note: reply, repost, heart, zap.',
        'Click the speech bubble — the first one.',
        'The composer opens with the note you are answering, and its button now reads "Reply".',
      ],
      showMe: [
        actionStep(
          '[data-tour="snort-interactions"]',
          'The action row',
          'Four actions under every note — reply, repost, heart, zap — followed by the avatars of whoever zapped it.',
        ),
      ],
    },
    {
      // §4.8 Thread
      id: 'thread',
      category: 'Posting',
      question: 'How do I open a whole conversation?',
      answer: [
        'Click anywhere on a note — the row highlights as you hover it.',
        'The thread opens with the note you clicked outlined in violet, and its replies underneath.',
      ],
      showMe: [
        {
          target: '[data-tour="snort-thread"]',
          title: 'A thread',
          content:
            'The note you opened carries a 2px violet outline; replies hang below it on a connector line.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'openThread' }),
        },
      ],
    },

    // --------------------------------------------------- Reactions & zaps --
    {
      // §4 action bar — reaction is a HEART; only heart and zap change colour
      id: 'react-heart',
      category: 'Reactions & zaps',
      question: 'How do I like a note?',
      answer: [
        'Click the heart — third in the row under the note.',
        'It turns red once you have liked it.',
      ],
      note: 'Only the heart and the zap ever change colour in that row; reply and repost stay the same shade whether you have used them or not.',
      showMe: [
        actionStep(
          '[data-tour="snort-interactions"]',
          'The heart',
          'Snort\'s reaction is a plain heart that fills red — no shaka, no emoji picker in the row itself.',
        ),
      ],
    },
    {
      // §4 action bar (zap) + zapper avatars
      id: 'zap',
      category: 'Reactions & zaps',
      question: 'How do I zap (tip sats to) a note?',
      answer: [
        'Click the lightning bolt — the last of the four actions.',
        'Pick or type an amount and send it from your connected wallet.',
        'The avatars beside the row are the people who already zapped that note.',
      ],
      showMe: [
        actionStep(
          '[data-tour="snort-interactions"]',
          'Zap',
          'The bolt is last, and the little avatars after it are the note\'s zappers — Snort shows who paid, not just how much.',
        ),
      ],
    },

    // ----------------------------------------------------- Finding things --
    {
      // §13 Search
      id: 'search',
      category: 'Finding things',
      question: 'How do I search?',
      answer: [
        'Use the search box in the right-hand column, or open Search from the left rail.',
        'Type a name, a word or a hashtag and press Enter.',
      ],
      showMe: [
        {
          target: '[data-tour="snort-search"]',
          title: 'Search',
          content: 'Snort keeps search in its own screen, reachable from the rail as well as the right column.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'search' }),
        },
      ],
    },
    {
      // §7 Discover
      id: 'discover',
      category: 'Finding things',
      question: 'How do I find people to follow?',
      answer: [
        'Open "Discover" in the left rail.',
        'It suggests people and topics you are not following yet.',
        'You can also switch the feed picker to "Trending Notes" or "Followed by friends" to see beyond your own follows.',
      ],
      showMe: [
        {
          target: '[data-tour="snort-discover"]',
          title: 'Discover',
          content: 'The rail\'s discovery screen — people and topics outside your current follows.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'discover' }),
        },
      ],
    },
    {
      // §8 Profile — follow button
      id: 'follow',
      category: 'Finding things',
      question: 'How do I follow someone?',
      answer: [
        'Open their profile by clicking their name or avatar on any note.',
        'Click "Follow" in the row under their banner; it becomes "Unfollow" once you do.',
      ],
      showMe: [
        {
          target: '[data-tour="snort-follow"]',
          title: 'Follow',
          content: 'The Follow button only appears on other people\'s profiles — your own shows editing controls instead.',
          position: 'bottom',
          commands: cmd({ type: 'viewProfile', payload: 'other' }),
        },
      ],
    },
    {
      // §9 Notifications
      id: 'notifications',
      category: 'Finding things',
      question: 'Where are my notifications?',
      answer: [
        'Open "Notifications" from the left rail.',
        'Four icon toggles at the top filter the list by kind — you can have several on at once.',
      ],
      showMe: [
        {
          target: '[data-tour="snort-notifications"]',
          title: 'Notifications',
          content:
            'The filters are independent toggles, not a single-choice tab row — turn on as many kinds as you want.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'notifications' }),
        },
      ],
    },
    {
      // §10 Messages / DMs
      id: 'dms',
      category: 'Finding things',
      question: 'Where are my direct messages?',
      answer: [
        'Open "Messages" from the left rail.',
        'Conversations list on the left, the open conversation on the right.',
      ],
      showMe: [
        {
          target: '[data-tour="snort-messages"]',
          title: 'Messages',
          content: 'A two-pane layout: the conversation list beside the thread, not a separate screen per chat.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'messages' }),
        },
      ],
    },

    // ------------------------------------------------------------- Relays --
    {
      // §12 Relays (My Relays table, Add Relays textarea)
      id: 'manage-relays',
      category: 'Relays',
      question: 'How do I add or remove relays?',
      answer: [
        'Open Settings from the left rail, then "Relays" under Interaction.',
        '"My Relays" is a table: RELAY, STATUS, PERMISSIONS, UPTIME, and a bin icon that removes the row straight away.',
        'To add: paste addresses into the "Add Relays" box — one per line, e.g. wss://my-relay.com — and press "Add".',
        'Press "Save" under the table to publish your relay list to the network. Nothing above is published until you do.',
      ],
      note: 'Permissions are two clickable words, "Read" and "Write", not switches — a greyed word means that permission is off. Aim for 4-8 relays, as Snort\'s own advice on that page says.',
      showMe: [
        {
          target: '[data-tour="snort-relays"]',
          title: 'Relays',
          content:
            'Status is only ever "Connected" or "Offline"; the separate Uptime column rates latency Great, Good, Poor or Dead.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'relays' }),
        },
      ],
    },

    // ------------------------------------------------------ Account & keys --
    {
      // §14 Settings index — Account group: Export Keys
      id: 'export-keys',
      category: 'Account & keys',
      question: 'Where do I back up my private key?',
      answer: [
        'Open Settings from the left rail.',
        'Under Account, click "Export Keys" — the row with the amber key tile.',
        'Copy your key from there and store it somewhere safe; a password manager is a good place.',
      ],
      note: 'Your nsec IS your account: anyone who has it can post as you, and nobody can restore it if you lose it. Signing in through a browser extension instead means Snort never holds the key at all.',
      showMe: [
        {
          target: '[data-tour="snort-settings"]',
          title: 'Settings',
          content:
            'Rows in coloured tiles, grouped Account / Interaction / Support. "Export Keys" is the second under Account.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'settings' }),
        },
      ],
    },
    {
      // §4.5 note "…" menu (Mute), §8 profile mute button, upstream
      // Pages/settings/Moderation.tsx ("Muted Words", "eg. crypto", Add/Delete)
      // and Hooks/useModeration.tsx (muteWithWoT).
      id: 'mute',
      category: 'Account & keys',
      question: 'How do I mute a person or a word?',
      answer: [
        'To mute a person: open the "…" menu beside a note\'s timestamp and choose "Mute" — or use the red mute circle on their profile.',
        'To mute a word: open Settings → "Moderation", type it into the box under "Muted Words" (its own example is "crypto") and press "Add". "Delete" beside a word removes it.',
        'The same Moderation screen has "Show posts that have a content warning tag" if you would rather see flagged posts than have them hidden.',
      ],
      note: 'Snort mutes people and words only — there is no muting of hashtags or of a single thread, though a muted word matches inside a hashtag too. A muted note is not deleted from view: it collapses to "This note has been muted" with a Show button. Preferences also offer a web-of-trust filter that hides anyone more than two follow-hops away.',
      showMe: [
        {
          target: '[data-tour="snort-settings"]',
          title: 'Settings → Moderation',
          content:
            '"Moderation" sits under Interaction, with the yellow shield tile — muted words are managed there, not from a note.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'navigate', payload: 'settings' }),
        },
      ],
    },
    {
      // §14 Settings index — the Log Out group (title == item)
      id: 'logout',
      category: 'Account & keys',
      question: 'How do I log out?',
      answer: [
        'Open Settings from the left rail.',
        'Scroll to the bottom: "Log Out" is a group of its own, with a red tile.',
      ],
      note: 'Back up your key first — logging out of a web client leaves nothing behind to recover it from.',
    },

    // ----------------------------------------------------------- Advanced --
    {
      // §14 Settings index — Account group: Wallet
      id: 'connect-wallet',
      category: 'Advanced',
      question: 'How do I connect a Lightning wallet (for zaps)?',
      answer: [
        'Open Settings from the left rail.',
        'Under Account, click "Wallet" — the row with the emerald tile.',
        'Connect the wallet you want zaps paid from; after that the zap button pays without leaving Snort.',
      ],
    },
    {
      // §14 Settings index — Interaction group: Media
      id: 'media-uploads',
      category: 'Advanced',
      question: 'Where do my uploaded images go?',
      answer: [
        'Open Settings from the left rail.',
        'Under Interaction, click "Media" — the row with the lime tile — to see and change where uploads are sent.',
      ],
    },
    {
      // §14 Settings index — Interaction group: Cache
      id: 'clear-cache',
      category: 'Advanced',
      question: 'How do I clear the cache?',
      answer: [
        'Open Settings from the left rail.',
        'Under Interaction, click "Cache" — the row with the cyan tile.',
      ],
      note: 'Snort is a web app, so its cache lives in your browser: clearing site data for the page does the same job from the outside.',
    },
  ],
};

export default snortFaq;
