/**
 * Coracle FAQ — grounded in docs/refs/coracle/screen-map.md, with upstream
 * coracle-social/coracle cited where the recording never opened a screen.
 * docs/gaps/coracle.md is the showMe gate.
 *
 * Coracle's shape worth repeating: the login has NO key field (delegation
 * only), almost everything opens as a modal, and the text-only sidebar item
 * you are on physically GROWS.
 */

import type { SimulatorCommand } from '../../simulators/coracle/CoracleSimulator';
import type { ClientFaq } from './types';

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

export const coracleFaq: ClientFaq = {
  clientId: 'coracle',
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
    'media-uploader': 'media-uploader',
    'clear-cache': 'clear-cache',
    'manage-relays': 'manage-relays',
    mute: 'mute',
    dms: 'dms',
    search: 'search',
    notifications: 'notifications',
    follow: 'follow',
  },
  entries: [
    {
      // screen-map §9.1, §9.2, §9.3 (Login.svelte / LoginBunker.svelte / state.ts:110-113)
      id: 'sign-in',
      category: 'Getting started',
      question: 'How do I sign in?',
      answer: [
        'Click "Log In" — the accent button on the right of the top bar, or the one at the bottom of the sidebar.',
        'The screen is headed "Welcome!" and lists the ways in, in order: "Use Browser Extension", "Use Remote Signer", "Browse Signer Apps".',
        '"Use Browser Extension" only appears when Coracle detects a NIP-07 extension — that is the fastest route on the web.',
        '"Use Remote Signer" opens "Login with Signer": scan the QR code or paste a bunker:// connection link, then press "Continue".',
        'After you log in Coracle holds you on a small panel — "We\'re searching for your profile on the network." — until it finds your profile and relays.',
      ],
      note: 'There is nowhere to paste a secret key. Every method delegates signing to something else (an extension, a signer app, a bunker), which makes this the most key-safe sign-in of any client on this shelf — the missing nsec field is the design, not an omission.',
      showMe: [
        {
          target: '[data-tour="coracle-login"]',
          title: 'How do I sign in?',
          content: '"Welcome!" — three ways in, and not one of them is a key field: a browser extension, a remote signer, or a list of signer apps.',
          commands: cmd({ type: 'showLogin' }),
        },
      ],
    },
    {
      // screen-map §9.1 ("There is NO secret-key field", loginWithNip01 called only from main.js:39), §9.4 step 2, §7.6 NsecWarning
      id: 'no-nsec-field',
      category: 'Account & keys',
      question: 'Where do I paste my private key (nsec)?',
      answer: [
        'Nowhere — Coracle has no key field anywhere in the app.',
        'The login screen offers only delegated signing: a browser extension, a signer app, or a remote signer over a bunker:// link.',
        'Signup does not mint a key either: step 2 of 4 sends you to a separate app, nstart, "which will guide you through the process of creating and securely storing your account keys".',
        'So the only thing that ever holds your secret is the extension, app or signer you chose — not the tab Coracle is running in.',
      ],
      note: 'If a page that looks like Coracle asks you for an nsec, it is not Coracle. The one place the app mentions private keys is a tripwire: type anything matching nsec1… into the composer and it stops you with "It looks like you might be sharing a private key."',
    },
    {
      // screen-map §9.4 (Onboarding.svelte, 4 steps) + the [REC vs REPO] box: the Polish screens in the recording are nstart, not Coracle
      id: 'signup',
      category: 'Getting started',
      question: 'I don\'t have an account yet — how do I create one?',
      answer: [
        'On the "Welcome!" screen press "Register instead" under the three buttons.',
        'Step 1/4, "New to Nostr?", offers two video tiles — "Nostr in 30 seconds" and "Coracle deep dive" — then "Let\'s go!".',
        'Step 2/4, "Create your Profile", hands you off: Coracle redirects you to an app called nstart, which creates and stores your keys for you.',
        'Step 3/4, "Find your people", is a grid of topic lists; picking them follows people, and the row underneath counts "Following {n} people • {n} relays".',
        'Step 4/4, "You\'re all set!", pre-fills a note reading "Hello world! #introductions" — press "Say Hello", or "Skip and see your feed".',
      ],
      note: 'Coracle generates no keys itself. The handoff even passes its own accent colour to nstart so the two apps look continuous — but nstart is a separate project, and the screens you see there are not Coracle\'s.',
    },
    {
      // screen-map §5.2 (MenuDesktop.svelte:88-123, MenuDesktopItem.svelte:12-32)
      id: 'sidebar',
      category: 'Getting started',
      question: 'Where is everything? The sidebar is just words.',
      answer: [
        'That is the whole navigation: six text-only items — Feeds, Relays, Notifications, Messages, Groups, Lists — with no icons on any of them.',
        'The item you are on physically grows a size and takes a thin accent underline; the others stay smaller in a muted warm grey.',
        'Everything except Feeds is disabled until you log in.',
        'Settings, your profile, your keys, the wallet and Log Out are not in that list — they live in the two menus at the bottom of the sidebar: "Settings" and your account row.',
      ],
      note: 'A 6px accent block — a square, not a bead — appears beside "Notifications" when something is waiting.',
      showMe: [
        {
          target: '[data-tour="coracle-nav-relays"]',
          title: 'Where is everything? The sidebar is just',
          content: 'The selected item grows: "Relays" is now a size larger, burnt orange, with a hairline accent underline. No pill, no tint, no icon.',
          commands: cmd({ type: 'navigate', payload: 'relays' }),
        },
      ],
    },
    {
      // screen-map §5.7 (Routes.svelte:71-81, Modal.svelte:114/139-142/154-156)
      id: 'modals',
      category: 'Getting started',
      question: 'Why does everything open on top of the page instead of navigating?',
      answer: [
        'Because in Coracle almost everything IS a modal: a note, a profile, login, signup, the composer, Groups, Lists, an invite, a QR code.',
        'The dimmed layer behind a modal starts at the right edge of the sidebar, so the sidebar stays lit and clickable — you can navigate straight out of whatever is open.',
        'Close it with the round accent X in the top-right, or by clicking the dimmed area.',
        'Open one modal from another and a "close all" chip appears so you are never more than one click from the page.',
      ],
      showMe: [
        {
          target: '.co-modal-close',
          title: 'Why does everything open on top of the p',
          content: 'Every modal closes with this one control: a round, accent-filled X in the top-right. It is one of Coracle\'s loudest tells.',
          commands: cmd({ type: 'openThread' }),
        },
      ],
    },
    {
      // screen-map §5.3 (Nav.svelte:51-105), §8 (NoteCreate.svelte), §5.6 (no compose FAB)
      id: 'post-note',
      category: 'Posting',
      question: 'How do I post a note?',
      answer: [
        'Press "Post +" — the accent button on the right of the top bar. There is no floating compose button anywhere in Coracle.',
        'The composer opens as a modal headed "Create a Note", with the prompt "What do you want to say?".',
        'Type in the white editor box, then press the accent "Send".',
        'The row under the editor counts your characters and words and offers "+ Add poll options", "Show Preview" and a cog that opens "Note settings".',
      ],
      note: '"Note settings" is where content warnings, scheduling, proof of work, an expiry, posting anonymously and a one-off relay choice live.',
      showMe: [
        {
          target: '[data-tour="coracle-compose"]',
          title: 'How do I post a note?',
          content: '"Post +" — accent, top-right, and that verbatim label with the space before the plus. Composing starts here and nowhere else.',
          commands: cmd({ type: 'navigate', payload: 'feeds' }),
        },
        {
          target: '[aria-label="Note content"]',
          title: 'How do I post a note?',
          content: 'The editor is white with black text while you write — the brightest box on an otherwise dark page.',
          commands: cmd({ type: 'compose' }),
        },
      ],
    },
    {
      // screen-map §7.2 (NoteActions.svelte:267-382), §7.6 (NoteReply.svelte:167-215)
      id: 'reply',
      category: 'Posting',
      question: 'How do I reply to a note?',
      answer: [
        'The row under every note runs reply → zap → like → repost. Reply is the first one — a stroked speech bubble.',
        'The editor opens inline underneath the note; the page does not change and no modal appears.',
        'Write, then press the round send button with the paper plane on the right of the box.',
        'The small toolbar under the editor holds a paperclip for attachments and a cog for the same note settings a new post gets.',
      ],
      note: 'People you mention arrive as removable chips above the editor. If your text contains anything matching nsec1…, Coracle stops you with "It looks like you might be sharing a private key." and makes you choose Abort or Proceed.',
      showMe: [
        {
          target: '.co-action[aria-label="Reply"]',
          title: 'How do I reply to a note?',
          content: 'First of the four: the stroked speech bubble. Coracle draws its action icons as outlines, which is why the row reads lighter than other clients\'.',
          commands: cmd({ type: 'navigate', payload: 'feeds' }),
        },
      ],
    },
    {
      // screen-map §7.2 (order, colours, `fa-beat`), §3 (the seven stroked partial icons)
      id: 'react',
      category: 'Reactions & zaps',
      question: 'How do I like a note?',
      answer: [
        'Click the heart — third in the row, after reply and zap.',
        'It fills with the accent and beats once; the number beside it counts people, not reactions.',
        'That is the whole reaction UI. Coracle sends a plain "+" and has no emoji picker on the card.',
      ],
      note: 'Nothing in Coracle turns red. Likes, zaps and reposts all use the same burnt orange when they are on, and the repost arrow is the only filled icon in the row.',
      showMe: [
        {
          target: '.co-action[aria-label="Like"]',
          title: 'How do I like a note?',
          content: 'The heart is third, and it is an outline until you use it — then it goes burnt orange, the same accent every active action uses.',
          commands: cmd({ type: 'navigate', payload: 'feeds' }),
        },
      ],
    },
    {
      // screen-map §7.2 (order, formatSats, 21-sat default), §17 App Settings fields
      id: 'zap',
      category: 'Reactions & zaps',
      question: 'How do I zap sats to a note?',
      answer: [
        'Click the bolt. It is SECOND in the row, between reply and like — not last, where most clients put it.',
        'A click sends your default amount, which ships at 21 sats.',
        'Change that default in Settings → App Settings → "Default zap amount".',
        'The figure beside the bolt is a total of sats, not a count of zaps — "1.1K" means 1,100 sats have been sent to that note.',
      ],
      note: '"Platform zap split" on the same settings page decides how much of each zap goes to Coracle\'s developer; it ships at 0. On a profile there is no separate zap button — the lightning-address row IS the zap control.',
      showMe: [
        {
          target: '.co-action[aria-label="Zap"]',
          title: 'How do I zap sats to a note?',
          content: 'Second in the row, right after reply — a stroked, slanted bolt. In Coracle the zap comes before the like.',
          commands: cmd({ type: 'navigate', payload: 'feeds' }),
        },
        {
          target: '[aria-label="Default zap amount"]',
          title: 'How do I zap sats to a note?',
          content: '"Default zap amount" — the first field of App Settings, 21 sats out of the box.',
          commands: cmd({ type: 'openSettings', payload: 'app' }),
        },
      ],
    },
    {
      // screen-map §5.2 (settings submenu: fa-wallet "Wallet") and §17 (route /settings/wallet, heading "Your Wallet")
      id: 'connect-wallet',
      category: 'Advanced',
      question: 'How do I connect a wallet so I can zap?',
      answer: [
        'Click "Settings" at the bottom of the sidebar and choose "Wallet" — the third row of the menu that slides up.',
        'The page is headed "Your Wallet".',
      ],
      note: 'Zapping someone does not necessarily need a wallet connected inside Coracle: on a profile, the lightning-address row is itself the zap button, and your default amount is set in App Settings.',
    },
    {
      // screen-map §8 (the white upload square, "Uploading media..."), §7.6 (paperclip), §7.3 (MediaGrid + dismiss X), §17 (Blossom Provider URLs)
      id: 'media-uploader',
      category: 'Advanced',
      question: 'How do I attach an image to a note?',
      answer: [
        'In the composer, the white square button beside the accent "Send" is the uploader — its icon is an upload arrow.',
        'In a reply, the same thing is the paperclip in the toolbar under the editor.',
        'While it works, the composer\'s button reads "Uploading media...".',
        'Where your files go is set in Settings → App Settings → "Blossom Provider URLs".',
        'Images already in a note render in a grid, and each one carries a small white circular X to drop it before you post.',
      ],
      note: '"Imgproxy URL" on the same settings page is a different thing: that is the proxy Coracle loads other people\'s images through, not where yours are uploaded.',
    },
    {
      // screen-map §17 (/settings/data — App Database: two cards + Created·Author·Kind table)
      id: 'clear-cache',
      category: 'Advanced',
      question: 'Coracle feels slow or stale — where is its local data?',
      answer: [
        'Click "Settings" at the bottom of the sidebar and choose "Database".',
        'The page is headed "App Database", subtitled "View, import, and export your local database".',
        'It holds two cards — "Export Database" with a "Create Backup" button, and "Import Database" with "Upload Backup" — over a table of everything stored, with Created, Author and Kind columns.',
        'The export card counts what it would write: "a backup of all {n} events in your database".',
      ],
      note: 'Two knobs that change how much Coracle pulls in the first place live one page over, in App Settings: "Max relays per request" (default 3) and "Report errors and analytics".',
    },
    {
      // screen-map §10 (RelayList.svelte, RelayCard.svelte:63-136, RelayCardActions.svelte:23-49, RelayStatus.svelte:22-33)
      id: 'manage-relays',
      category: 'Relays',
      question: 'How do I add or remove a relay?',
      answer: [
        'Open "Relays", the second item in the sidebar — the same page as Settings → Relays.',
        '"Your relays" is the top section, with an accent "Add Relay" button whose icon is a compass, not a plus.',
        '"Other relays" underneath lists relays used by people in your network, behind "Search" and "Reviews" tabs, with a field reading "Search relays or add a custom url" — a full wss:// URL goes in there.',
        'Every card carries INFO and EXPLORE, then either an accent JOIN or a dark LEAVE.',
        'LEAVE disappears once you are down to a single relay: Coracle will not let you drop your last one.',
      ],
      note: 'Each card also shows how many NIPs the relay supports and how many times you have connected, plus a status dot: grey not connected, green connected, orange logging in or unstable, red failed.',
      showMe: [
        {
          target: '[data-tour="coracle-nav-relays"]',
          title: 'How do I add or remove a relay?',
          content: '"Relays" is the second sidebar item, and the page behind it is where both your own relays and your network\'s live.',
          commands: cmd({ type: 'navigate', payload: 'relays' }),
        },
        {
          target: '[aria-label="Search relays"]',
          title: 'How do I add or remove a relay?',
          content: 'Under "Other relays", behind the Search tab: the field whose placeholder reads "Search relays or add a custom url".',
          commands: cmd({ type: 'navigate', payload: 'relays' }),
        },
      ],
    },
    {
      // screen-map §10 (read/write/messaging chips, off-state is opacity-50 only), §13 (the NIP-17 messaging-relay notice)
      id: 'relay-policies',
      category: 'Relays',
      question: 'What do Read, Write and Messaging mean on a relay card?',
      answer: [
        'They are the three jobs you can give a relay, and they only show on relays you have joined: Read (an open book), Write (a feather), Messaging (an inbox).',
        'Messaging is the one that matters for DMs — Coracle needs somewhere marked Messaging to know where to deliver them, and says so when it does not have one.',
        'A job that is OFF is shown by nothing but half opacity. There is no colour change and no fill, so it is easy to miss.',
      ],
      showMe: [
        {
          target: '.co-chip',
          title: 'What do Read, Write and Messaging mean o',
          content: '"Read" is the first of three policy chips on a relay you have joined. Off is expressed by fading the chip to half — no colour, no fill.',
          commands: cmd({ type: 'navigate', payload: 'relays' }),
        },
      ],
    },
    {
      // screen-map §17 Content Settings ("a bare Mutes divider · four public/private mute selectors for accounts, words and topics"), §7.1 (the collapsed "You
      id: 'mute',
      category: 'Account & keys',
      question: 'How do I mute someone — or a word, or a hashtag?',
      // "Block" is the word people bring from other networks; Coracle only
      // offers muting, and saying so IS the answer.
      searchAliases: [
        'block someone',
        'hide someone',
        'hide posts',
        'stop seeing this',
        'too much noise',
        'annoying person',
      ],
      answer: [
        'Everything you mute is filed in one place: sidebar → "Settings" → "Content Settings", under a bare divider reading "Mutes".',
        'PEOPLE: there are public and private muted-account lists. A public mute is visible to others, which is what makes it useful against impersonators and spammers; a private one is encrypted.',
        'WORDS: the same public/private pair for words — notes containing them are hidden.',
        'HASHTAGS: Coracle calls them topics, and they get the same treatment on the same page. Four selectors in total cover accounts, words and topics.',
        'THREADS: there is no per-conversation mute. Coracle mutes people, words and topics, and that is the whole list.',
        'A muted note is not removed from the feed: it collapses to a line reading "You have hidden this note." with an underlined "Show".',
      ],
      note: 'Two blunter filters sit just above the mute lists on the same page: "Minimum WoT score" hides anyone below a web-of-trust threshold, and "Hide sensitive content" hides what authors flagged themselves.',
      showMe: [
        {
          target: '[aria-label="Publicly muted accounts"]',
          title: 'How do I mute someone — or a word, or a ',
          content: 'Near the bottom of Content Settings, under a bare "Mutes" line: "Publicly muted accounts" is the people list, and the word list sits directly under it.',
          commands: cmd({ type: 'openSettings', payload: 'content' }),
        },
      ],
    },
    {
      // screen-map §13 (/channels, ChannelCreate.svelte, verbatim empty state)
      id: 'dms',
      category: 'Finding things',
      question: 'Where are my direct messages?',
      answer: [
        '"Messages" is the fourth item in the sidebar. It opens "Your conversations".',
        'Two tabs, Conversations and Requests, each with a count pill that shows even at zero; the bell beside them is "Mark all as read".',
        'The accent "+ Create" button opens "Start a conversation" — pick who you want to talk to, and the message box waits with "Say hello...".',
        'If Coracle does not know where to deliver, it says so: "In order to deliver messages, Coracle needs to know where to send them. Please visit your settings page and set up your messaging relays." — that is the Messaging chip on a relay card.',
      ],
      showMe: [
        {
          target: '.co-column',
          title: 'Where are my direct messages?',
          content: '"Your conversations", with Conversations and Requests side by side and a count pill on each. Empty here — this reproduction ships no mock DMs, and the real client shows the same line.',
          commands: cmd({ type: 'navigate', payload: 'messages' }),
        },
      ],
    },
    {
      // screen-map §5.3 (top-bar search + dropdown), §6.1 (the feed's own search input), §10 (relay search)
      id: 'search',
      category: 'Finding things',
      question: 'How do I search?',
      answer: [
        'The only global search is in the top bar: a dark field with a "Search" button beside it.',
        'Start typing and a dropdown opens under it with matching rows, and a "Loading more options..." footer while more arrive.',
        'There is no search page and no magnifier in the sidebar — the sidebar has no icons at all.',
        'The feed has its own separate box in the controls row above the notes; that one narrows the feed you are looking at.',
        'Relays have a third one: "Search relays or add a custom url" on the Relays page.',
      ],
      showMe: [
        {
          target: '[aria-label="Search"]',
          title: 'How do I search?',
          content: 'The global search: a dark field joined to a "Search" button, right-aligned in the top bar next to "Post +".',
          commands: cmd({ type: 'navigate', payload: 'feeds' }),
        },
        {
          target: '[aria-label="Search this feed"]',
          title: 'How do I search?',
          content: 'A second, separate box lives in the feed\'s controls row — this is the one that narrows the notes in front of you.',
          commands: cmd({ type: 'navigate', payload: 'feeds' }),
        },
      ],
    },
    {
      // screen-map §6.2 (FeedControls.svelte:99-102, FeedSelector.svelte:79-141)
      id: 'your-feeds',
      category: 'Finding things',
      question: 'What is the "Your Feeds" panel on the right?',
      answer: [
        'It is Coracle\'s feed selector, and it is the client\'s signature: instead of tabs, you compose the feed you want.',
        'The first section, "From People you Follow", holds seven chips — Notes & Replies, Polls, Articles, Media, Reposts, Reactions, Everything. The active one fills with the accent.',
        '"Relay Feeds" underneath gives you a feed per relay, "Your Lists" your saved lists, and "Custom Feeds" anything you built or favourited; each section ends in an "Edit …" chip.',
        'The panel exists on the Feeds route only, and on a narrow window it folds from a right-hand rail into a card above the notes.',
        '"Customize" in the controls row opens the feed builder itself.',
      ],
      showMe: [
        {
          target: '[data-tour="coracle-feed-selector"]',
          title: 'What is the "Your Feeds" panel on the ri',
          content: '"Your Feeds": seven preset chips from the people you follow, then Relay Feeds, Your Lists and Custom Feeds — each of those three ending in an Edit chip.',
          commands: cmd({ type: 'navigate', payload: 'feeds' }),
        },
      ],
    },
    {
      // screen-map §12 (/notifications, verbatim tabs and empty state), §5.2 pt 4 (the 6px accent unread block)
      id: 'notifications',
      category: 'Finding things',
      question: 'Where are my notifications?',
      answer: [
        '"Notifications" is the third item in the sidebar; a small accent block appears beside the label when something is waiting.',
        'The screen has two tabs — "Mentions & Replies" and "Reactions" — and opens on the first.',
        'The unread count rides the tab you are NOT on, as a grey pill.',
        'Rows group under date separators and read "mentioned you", "replied to your note", "replied to a note mentioning you" or "responded to your poll".',
      ],
      note: 'There is nothing to configure — Coracle has no notification settings page. When there is nothing to show, both tabs read "No notifications found - check back later!".',
      showMe: [
        {
          target: '.co-column',
          title: 'Where are my notifications?',
          content: 'Two tabs, and the count pill sits on the tab you are not on. Empty here — this reproduction ships no mock notifications, and that is the real client\'s own empty line.',
          commands: cmd({ type: 'navigate', payload: 'notifications' }),
        },
      ],
    },
    {
      // screen-map §11 (PersonDetail.svelte — no banner, no stats row, tab badges)
      id: 'follow',
      category: 'Finding things',
      question: 'How do I follow someone?',
      answer: [
        'Open the person — clicking their avatar or name on a note opens their profile as a modal.',
        'The button under the 128px avatar is the follow control: it reads "Follow", and "Unfollow" once you do.',
        'There is no follower/following stats row on a Coracle profile; those numbers live as badges on the "Following" and "Followers" tabs.',
        'The ring beside someone\'s name is their web-of-trust score, and it is stroked in the accent for people you already follow.',
      ],
      note: 'A profile has no banner image either — Coracle never asks for one. What it does have is the lightning-address row, which doubles as the zap button.',
      showMe: [
        {
          target: '[data-tour="coracle-follow"]',
          title: 'How do I follow someone?',
          content: 'One button under the avatar does it: it reads "Follow", and "Unfollow" when you already follow them.',
          commands: cmd({ type: 'viewProfile', payload: 'other' }),
        },
      ],
    },
    {
      // screen-map §7.1 (WotScore.svelte:33-43, "There is no verified checkmark anywhere"), §17 (Minimum WoT score)
      id: 'wot-dial',
      category: 'Finding things',
      question: 'What is the little circle after every name?',
      answer: [
        'A web-of-trust score, drawn as a 16px ring that fills clockwise.',
        'It is stroked in the accent for people you follow (and for yourself), and plain grey for everyone else.',
        'Hover it and a card opens with their about text, NIP-05, lightning address and npub.',
        'It is not a verified badge — Coracle ships no checkmark anywhere. You can also set a "Minimum WoT score" in Content Settings to hide low-scoring accounts outright.',
      ],
      showMe: [
        {
          target: 'svg[aria-label^="Web of trust score"]',
          title: 'What is the little circle after every na',
          content: 'The ring right after the display name. Accent for people you follow, grey for everyone else — and never a checkmark.',
          commands: cmd({ type: 'navigate', payload: 'feeds' }),
        },
      ],
    },
    {
      // screen-map §14 (GroupList.svelte is 15 lines and all of them are the deprecation notice)
      id: 'groups',
      category: 'Getting started',
      question: 'What happened to Groups?',
      answer: [
        'They are being retired. The whole Groups route is now one notice: "Groups are going away!".',
        'It names two places to go instead — groups.coracle.social, the old host, and flotilla.social, the relay-based groups client the same team is building.',
        'The buttons are "Continue to Groups" in white and the accent "Try Flotilla".',
        'The item stays in the sidebar so you can read the notice; there is nothing else on the route.',
      ],
      showMe: [
        {
          target: '[data-tour="coracle-nav-groups"]',
          title: 'What happened to Groups?',
          content: '"Groups" is still the fifth item in the sidebar — clicking it opens the notice, which is now the entire route.',
          commands: cmd({ type: 'navigate', payload: 'feeds' }),
        },
      ],
    },
    {
      // screen-map §5.2 (account submenu: fa-key "Keys"), §17 (/settings/keys — "Your Keys"), §9.1 and §9.4 for the fact that Coracle mints no keys
      id: 'backup-keys',
      category: 'Account & keys',
      question: 'How do I back up my keys?',
      answer: [
        'Click your avatar and @name at the bottom of the sidebar, then "Keys" in the menu that slides up.',
        'The page is headed "Your Keys" and holds your public key with a copy button.',
        'If you signed in with an extension or a remote signer, Coracle never held your secret key — the thing to back up is whatever holds it, not this page.',
        'If you made the account through Coracle\'s signup, the keys were created and stored by nstart, the app step 2/4 hands you to.',
      ],
      note: 'Coracle itself never generates a key: there is no "create a key" button anywhere in the app, and no field to paste one into.',
      showMe: [
        {
          target: '[aria-label="Copy public key"]',
          title: 'How do I back up my keys?',
          content: '"Your Keys" — your public key with a copy button beside it.',
          commands: cmd({ type: 'openSettings', payload: 'keys' }),
        },
      ],
    },
    {
      // screen-map §5.2 pt 5-7 and the account submenu list (MenuDesktopSecondary.svelte:14-24)
      id: 'logout',
      category: 'Account & keys',
      question: 'How do I log out?',
      answer: [
        'Click your avatar and @name at the very bottom of the sidebar.',
        'A menu slides up over the footer with five rows: Profile, Keys, Create Invite, Switch Account, Log Out.',
        'Choose "Log Out".',
      ],
      note: 'The "Settings" row just above it opens a different menu — Toggle Theme, Database, Wallet, App Settings, Content Settings.',
      showMe: [
        {
          target: '.co-account-row',
          title: 'How do I log out?',
          content: 'Your avatar and @handle at the bottom of the sidebar. Click it and the account menu — Profile, Keys, Create Invite, Switch Account, Log Out — slides up over the footer.',
          commands: cmd({ type: 'navigate', payload: 'feeds' }),
        },
      ],
    },
    {
      // app/MenuDesktop.svelte: subMenu "account" → MenuItem `fa-right-left
      // Switch Account` → subMenu "accounts", which lists Object.values($sessions)
      // filtered to s.pubkey !== $pubkey, each calling pubkey.set(s.pubkey),
      // plus `fa-plus Add Account` → router.at("login").open().
      // MenuMobile.svelte uses the PLURAL "Switch Accounts" in the account
      // sheet footer beside Logout. shared/PersonActions.svelte pushes
      // "Login as" (loginWithPubkey) on someone else's profile — the only way
      // to get a watch-only session, since Login.svelte has no key field.
      // views/Logout.svelte calls clearStorage() + localStorage.clear(), and
      // the sessions map lives in localStorage — so logout drops EVERY account.
      // dropSession exists upstream in @welshman/app and is imported nowhere.
      id: 'multi-account',
      category: 'Account & keys',
      question: 'How do I add a second account or switch between accounts?',
      answer: [
        'Click your avatar and @name at the bottom of the sidebar, then choose "Switch Account".',
        'You get one row per other account you are logged in with — avatar and name. Click one to switch instantly: no confirmation, no re-sync screen.',
        'Instant because it is ONLY a switch: Coracle does not re-run the login-time fetch, so the account you land in shows whatever it already had cached and does not start listening for new notifications. Reload the page after switching if the feed or notifications look empty.',
        '"Add Account" at the bottom of that list reopens Coracle\'s normal "Welcome!" login modal, and each login ADDS a session rather than replacing the one you have.',
        'That modal offers a browser extension, a remote signer (bunker link or QR), or a signer app on the native builds — the login screen itself has no key field. The one exception is registering: "Register instead" hands off to nstart, and if you come back with a key rather than a bunker link, Coracle stores that key in this browser.',
        'On a narrow window it is the same thing in a different place: the hamburger at bottom-right → your avatar → "Switch Accounts" in the sheet footer, next to Logout.',
        'To add a watch-only identity there is exactly one route, and it is not the login screen: open someone else\'s profile, click the ⋮ in its top-right and choose "Login as". That npub joins the same switcher list.',
      ],
      note: 'There is no per-account logout. "Log Out" clears the local database and every stored session at once, so it signs you out of ALL your accounts, not just the one you are using. Your account list lives in this browser only and syncs nowhere.',
      howNostrWorks:
        'On Nostr an account IS a keypair, so switching accounts is literally switching which key the client signs and queries as — nothing about it happens on a server, and there is no account list anywhere but your own device. Your profile, follow list, mute list and relay list are events published under one public key, so a second account has a genuinely separate social graph, separate relays and separate settings; it is not a view of the first. Posting needs the private half, which is why a signer-backed account can write while an npub-only one can only read.',
      showMe: [
        {
          target: '.co-account-row',
          title: 'Switch Account lives here',
          content:
            'Click your avatar and @handle at the bottom of the sidebar: the account menu that slides up is where "Switch Account" lives, between "Create Invite" and "Log Out".',
          commands: cmd({ type: 'navigate', payload: 'feeds' }),
        },
      ],
    },

    // ------------------------------------------------------- Troubleshooting --
    // "Why doesn't this work" answers. TEXT-ONLY on purpose: the simulator
    // cannot stage a failure, so a demo here could only contradict itself.
    // Grounded in coracle-social/coracle master + the screen-map (2026-08-07).
    {
      // engine/storage.ts clearStorage() deletes the IndexedDB; views/
      // Logout.svelte is the ONLY caller and also does localStorage.clear().
      // engine/state.ts: initStorage("coracle", 9, …) with an events adapter
      // capped at 10_000. views/UserData.svelte = "App Database" with
      // Create Backup / Upload Backup. views/ChatEnable.svelte explains why
      // DMs are off by default.
      id: 'trouble-startup',
      category: 'Troubleshooting',
      question: 'Coracle is slow, stuck or misbehaving — how do I reset it?',
      answer: [
        'Back up first: sidebar → Settings → "Database". It shows every event you hold with Created / Author / Kind columns and gives you "Create Backup".',
        'The reset is Log Out, and there is no gentler one: it prints "Clearing your local database...", deletes the local database outright, clears browser storage and reloads. Coracle ships no separate clear-cache button, no safe mode and no crash-report screen.',
        'Restore afterwards from Settings → Database → "Upload Backup".',
        'If the slowdown started when you enabled DMs, that is a cost the app warns you about up front: notes and direct messages are off by default because loading them means downloading and decrypting a lot of data.',
        'The "Report errors and analytics" toggle in App Settings is not a crash reporter — it only gates a page-view ping.',
      ],
      howNostrWorks:
        'Coracle is a browser app with no account server, so everything it keeps locally is a cache — a local database of events plus a little browser storage for your session and settings. Nothing irreplaceable lives there as long as a signer holds your key: your profile, follows, relay list and notes are all events on relays, re-fetchable by anyone who knows your public key. That is why "wipe the local database and log back in" is a safe and usually sufficient repair on Nostr in a way it would not be on a conventional app — the client is a viewer over relay data, not the system of record.',
      note: 'One exception: if you signed up through nstart, your private key is stored in this browser and logging out destroys it. Copy it from your avatar → "Keys" first. Extension and remote-signer accounts keep the key elsewhere and are safe.',
    },
    {
      // app/MenuDesktop.svelte: the publish HUD (hourglass / cloud-arrow-up /
      // triangle-exclamation) is a Link to the /publishes modal.
      // views/Publishes.svelte tabs = events / connections / notices.
      // shared/PublishCard.svelte: "The following relays rejected your note:"
      // + a per-relay Retry that republishes to that relay alone.
      // shared/NoteActions.svelte: "Broadcast" (fa-rss) → publishThunk to
      // Router.FromUser() with maximal fallbacks, toast "Note has been
      // re-published!". shared/RelayCard.svelte Write chip tooltip is literal.
      id: 'trouble-not-delivered',
      category: 'Troubleshooting',
      question: 'My notes are not showing up for other people (or I cannot see theirs)',
      answer: [
        'Coracle shows you the answer permanently: the three counters at the bottom of the sidebar are pending, succeeded and failed publishes. The failed one turns accent-orange the moment it is non-zero.',
        'Click that strip — it is a link — for the "Published Events" modal, with Events, Connections and Notices tabs.',
        'The Events tab gives you one card per note with succeeded / pending / failed / timed out counts, and "Show Details" expands into which relays accepted your note, which rejected it, and which never answered — each of the last two with its own "Retry" button that republishes to that relay alone.',
        'The Notices tab is where a relay telling you "auth-required" or "restricted" actually shows up: raw protocol replies, searchable, colour-coded by verb.',
        'The Connections tab lists every relay socket with a live state — connected, logging in, failed to log in, failed to connect, waiting to reconnect, unstable.',
        'Before blaming relays, check what you asked for in the composer\'s "Note settings". A SCHEDULED post is not published at all — Coracle hands it to an outside scheduling service and publishes that request instead, so the counters go green for something that is not your note. "Post anonymously" signs with a throwaway key, so the note is real but not yours. An expiry lets relays delete it later. And a relay picked there replaces your write relays for that one note.',
        'To re-send an older note, use its ⋮ → "Broadcast", which republishes to your write relays with maximal fallbacks and confirms with "Note has been re-published!".',
        'To fix the cause: open "Relays" in the sidebar and look at each relay card\'s "Write" chip. Its tooltip is literal — dimmed means notes you publish will not be sent there. A dimmed Write chip on every relay is the usual cause: Coracle then falls back to a single default relay, so your notes technically publish but land somewhere almost nobody reads.',
      ],
      howNostrWorks:
        'A note is not sent to people — it is handed to relays, and it exists only on the relays that actually accepted it. A reader sees it only if their client happens to query a relay holding a copy, and that pairing of your write relays with their read relays is what published relay lists are for. Two ordinary situations therefore look like censorship and are not: a relay silently refusing your event because it wants authentication, payment, or is rate-limiting you; and a reader whose relay set simply does not overlap yours. Publishing to more relays widens the overlap; it does not guarantee it.',
    },
    {
      // app/util/zaps.ts: zap() checks session.wallet and opens the wallet
      // connect route instead of the zap modal when there is none.
      // views/Zap.svelte warning strings, verbatim: "Failed to zap: no zapper
      // found" / "Failed to zap: {error}" / "Failed to zap {name}: {message}";
      // amount defaults to the "default_zap" setting (21) with a log slider
      // 21..1_000_000; the kind-9735 receipt request is wrapped in an 8s
      // AbortSignal.timeout. screen-map §11: the lightning-address row IS the
      // zap button — there is no separate zap control on a profile.
      id: 'trouble-zap-failed',
      category: 'Troubleshooting',
      question: 'My zap failed, or clicking zap opens a wallet screen',
      answer: [
        'If clicking zap lands you on a wallet screen, that is the answer: with no wallet connected Coracle never opens the zap dialog at all.',
        'Connect one at Settings → Wallet — a WebLN browser extension, or a Nostr Wallet Connect URL you paste or scan. Failures are named: "Wallet failed to connect", or "Your extension does not support lightning payments".',
        'You can also skip the wallet entirely: the connect screen you were bounced to carries a "Pay manually" button, which opens the zap dialog anyway and then shows you the raw Lightning invoice to pay in whatever wallet you actually use.',
        'A wallet belongs to one account, not to the app. If zap only started sending you to the wallet screen right after you switched accounts, that is why — connect one for this account too.',
        'Read the failure toast, because it names which of the three stages broke. "Failed to zap: no zapper found" means the recipient has no usable lightning address. "Failed to zap:" with a message from their server means it refused to issue an invoice. "Failed to zap {name}:" means your wallet could not pay the invoice it did get.',
        'On a profile, the lightning-address row IS the zap button — there is no separate zap control. A profile with no such row cannot be zapped by anyone.',
        'The zap dialog itself starts at your default zap amount from App Settings (21 sats) and has a slider up to a million.',
      ],
      howNostrWorks:
        'A zap is not a Nostr message carrying money — it is a Lightning payment with a Nostr receipt stapled to it, and it has three separate places to break. Your client asks the recipient\'s Lightning server for an invoice, attaching a signed zap request; that server can refuse, be down, or cap the amount. Your wallet pays the invoice, and a routing failure or empty balance stops it there — the stage the client has least visibility into. Finally the recipient\'s server publishes the zap receipt to relays, and only that receipt makes the zap visible to everyone else. So "the payment left my wallet but the counter did not move" is a normal, well-understood outcome: the sats arrived and the receipt did not.',
      note: 'Coracle waits about eight seconds for that receipt before it stops looking, so a slow receipt can leave a paid zap looking unrecorded.',
    },
    {
      // shared/PersonActions.svelte: "Login as" (loginWithPubkey) on someone
      // else's profile — the only pubkey-only path, since views/Login.svelte
      // has no key field at all (screen-map §9.1 confirms: no nsec paste).
      // Nav.svelte: `{#if $signer} Post + {:else if !$pubkey} Log In {/if}` —
      // a pubkey WITHOUT a signer matches neither branch.
      // MenuDesktop.svelte: Relays / Notifications / Messages / Groups / Lists
      // all carry disabled={!$signer}. NOTE: source-read, not runtime-verified.
      id: 'trouble-read-only',
      category: 'Troubleshooting',
      question: 'I cannot post and there is no Post button',
      answer: [
        'You are in a watch-only session, and Coracle ships no read-only badge, banner or message to tell you so.',
        'There is only one way to get here, and it is not the login screen: on someone else\'s profile, the ⋮ menu offers "Login as", which signs you in with their public key and nothing else. Coracle\'s own login screen has no key field at all — only extension, signer app and remote signer.',
        'What you see instead of a message: the top bar shows neither "Post +" nor "Log In". Post appears only when a signer exists, Log In only when there is no key at all, and a key without a signer falls between the two.',
        'The real tell is what is MISSING, not what is dimmed. Coracle marks Relays, Notifications, Messages, Groups and Lists as disabled but never actually dims them — they look and click exactly like normal, and the screens behind them are simply empty. Judge by the absent Post button.',
        'Menus thin out too — a note loses Quote, Tag, Mute and Report, and a person loses Follow, Mute, Add to list and Mention.',
        'The fix: avatar → "Switch Account" → "Add Account", then log in for that same key with your extension or a remote signer. Logging out works too, but it signs you out of every account.',
      ],
      howNostrWorks:
        'An npub is only the public half of your keypair. It is enough to look someone up — a client can fetch everything ever published under it — but posting means producing a signature with the private half, which lives in your head, in a browser extension, or behind a remote signer. If the client holds only the public key there is nothing to sign with, so every write is impossible: not just notes and replies but likes, reposts, follows, mutes, relay-list changes, settings, even the zap request. This is not a permission the app is withholding, and no relay can grant it.',
    },
    {
      // views/UserContent.svelte: "Show images and link previews" (show_media,
      // default true) and "Hide sensitive content" (hide_sensitive, default
      // true); "Minimum WoT score" range -10..10. shared/NoteCheckImages.svelte
      // skips the check for your own notes and people you follow, else scores
      // the URL and renders "This note contains sensitive content." + "Show
      // anyway". partials/Image.svelte falls back to the original URL after an
      // error or an 8s timeout, so a bad imgproxy is slow, not fatal.
      id: 'trouble-images',
      category: 'Troubleshooting',
      question: 'Images are not loading',
      answer: [
        'Start at Settings → "Content Settings". The first thing to check is "Show images and link previews" — it defaults on, and off means no images anywhere.',
        'On the same screen, "Hide sensitive content" is also on by default. With it on, media from people you do NOT follow is scored and, above the threshold, replaced by "This note contains sensitive content." with a "Show anyway" link. Your own notes and people you follow skip the check entirely — which is exactly why the same image shows for a friend and hides for a stranger.',
        'App Settings has an "Imgproxy URL" for resizing images on the fly. It ships empty, so by default images load straight from wherever the note points. If you set one and it is wrong, Coracle falls back to the original URL after an error or about eight seconds — a bad proxy makes images slow rather than permanently missing.',
        'If an image vanished together with its text, look at "Minimum WoT score" instead: it hides whole notes from low-scoring accounts, which is a far more likely culprit than anything image-specific.',
        'What Coracle does not have: a per-image retry, a media cache you can clear on its own (the only reset is the full log-out wipe), or any way to repair a dead image.',
      ],
      howNostrWorks:
        'An image is not part of the note. A note is plain text; an image is just a URL sitting inside it, pointing at an ordinary web host that has nothing to do with Nostr. Relays store and replicate the text and know nothing about the file. So when an image will not load the note is intact and undamaged — the host is down, the file was deleted, hotlinking is blocked, or your network is. No relay and no client can fix that, and rebroadcasting the note will not bring the picture back. It is also why the same note shows images in one client and not another: each client fetches that URL itself, sometimes through its own proxy, sometimes not at all.',
    },
    {
      // engine/requests.ts loadNotifications() pulls kinds tagged #p = you
      // from Router.ForUser() (your READ relays) over the last week.
      // shared/RelayCard.svelte Read chip tooltip: "Notes intended for you will
      // not be delivered to this relay." views/Notifications.svelte has exactly
      // two tabs and NO settings screen; there is no push service worker.
      id: 'trouble-notifications',
      category: 'Troubleshooting',
      question: 'My notifications stopped arriving',
      answer: [
        'First, know what Coracle does not have: there is no notification settings screen anywhere, and no push notifications of any kind. So this is never a permission or a device setting — it always means the events are not arriving.',
        'The lever that matters is your READ relays: open "Relays" — the second item in the sidebar, not inside Settings — and look at each relay card\'s "Read" chip. Its tooltip says it outright: dimmed means notes intended for you will not be delivered there. With no Read relays at all Coracle falls back to its own default relays, so you get whatever happens to be there rather than what people actually sent you.',
        'Check those relays are actually up: click the publish counters in the sidebar → "Connections", which lists each relay with a live state and counts. The "Notices" tab shows what the relays said back.',
        'Each relay card also carries a small status dot with the same wording on hover — green connected, orange reconnecting or unstable, red a connection or auth failure, grey not connected.',
        'If the relays are healthy but everything is thin, check Content Settings → "Minimum WoT score", and the "Minimum Proof of Work" slider under it. Notes from accounts below either threshold are hidden automatically, and that includes people mentioning you.',
        'Check your mute list on that same page. Muted accounts, words and topics are filtered out of notifications exactly as they are out of the feed — and a muted WORD is matched against the note text, the sender\'s display name AND their NIP-05, so one broad word can quietly delete a whole class of mentions.',
        'Direct messages are a separate mechanism and stay off until you accept the prompt to enable them — silence in Messages is not the same failure as silence in Notifications.',
      ],
      howNostrWorks:
        'Nothing pushes a notification to you on Nostr. A mention is simply somebody else\'s event carrying a tag with your public key, sitting on whichever relays their client chose to publish to. Your client finds it by asking relays for events tagged with you — Coracle does exactly that against your read relays for the last week. Published relay lists are the convention that makes this work: yours advertises which relays are your inbox, and a well-behaved client sends replies there. So notifications go quiet in three ordinary ways — you never published a relay list, so nobody knows where to reach you; your read relays are unreachable or have dropped old events; or the sender\'s client only wrote to relays you do not read. Nothing is broken in the sense of a bug, and adding the right relay usually brings the backlog in at once.',
    },
    {
      // views/LoginConnect.svelte: the non-dismissible "We're searching for
      // your profile on the network." panel; after 8s it becomes "We're having
      // a hard time finding your profile." with "Try again" / "Select relays
      // manually" → "Use a custom relay" ("If you know which relay your profile
      // is on, you can enter it below."), plus the skip warning. app/state.ts
      // calls boot() only from the login handlers and "Login as", so this
      // screen cannot be reopened later — later repair goes via Relays.
      id: 'trouble-empty-profile',
      category: 'Troubleshooting',
      question: 'My profile is empty and my follows are gone',
      answer: [
        'Coracle has a screen for exactly this and it runs automatically at login: a panel reading "We\'re searching for your profile on the network." It queries your profile, relay list and follow list from its default and indexer relays first.',
        'If eight seconds pass without finding all three it becomes "We\'re having a hard time finding your profile." and offers "Try again" and "Select relays manually". The second opens a field where you can name the relay your profile is actually on — this is the single most useful control for this symptom.',
        'That screen also lets you skip it, warning that your profile and relays may not synchronise properly. Having skipped it is a common reason an account looks empty afterwards.',
        'Repairing it later is manual, because that search only runs at login: open "Relays" in the sidebar → "Other relays" → add and join the relay your data is on, then reload.',
        'Check you are in the right account first: avatar → "Keys" shows the public key of the session you are actually in. An unexpected npub explains everything at once.',
        'Check whether the data ever arrived: Settings → Database lists every event in your local store by Created / Author / Kind — look for your own profile and follow-list events. If you have an earlier export, "Upload Backup" re-imports it.',
      ],
      howNostrWorks:
        'Your display name, picture, bio and follow list are not stored in the app or on any Coracle server. They are events you signed, sitting on relays, and a client shows them only if it can reach a relay that still has a copy. That makes two very different situations look identical: you are signed in with a different key, in which case the account really is empty because nothing was ever published under it; or you are signed in with the right key and the client simply has not found your events yet. The second is far more common and fully recoverable — point the client at a relay that holds them and everything reappears. It is also why the relay list matters so much: it is the map telling any client where the rest of you lives, and losing it makes a well-populated account look brand new.',
      note: 'There is no "restore my follows" button and no server-side backup — Coracle can only re-fetch from relays or re-import a file you made yourself.',
    },
  ],
};

export default coracleFaq;
