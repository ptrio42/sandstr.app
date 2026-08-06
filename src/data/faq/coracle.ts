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
];

export const coracleFaq: ClientFaq = {
  clientId: 'coracle',
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
  ],
};

export default coracleFaq;
