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
  'Troubleshooting',
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
    'multi-account': 'multi-account',
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
        'Choose from For you, Following, Trending Notes, Conversations, Follow Sets, Followed by friends, Trending Hashtags and Media.',
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
          'Four actions under every note, always in this order: reply, repost, heart, zap.',
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
        'A single click on the lightning bolt sends a fast zap straight away — your default amount, 50 sats out of the box.',
        'Press and hold it instead to open the zap dialog, where you can pick a different amount and add a message.',
        'The bolt is the last of the four actions under a note.',
      ],
      note: 'Fast-zapping means a stray click spends sats — worth knowing before clicking around a feed.',
      showMe: [
        actionStep(
          '[data-tour="snort-interactions"]',
          'Zap',
          'The bolt is last in the row. One click fast-zaps; a long press opens the amount dialog.',
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
          content:
            'Search gets a screen of its own. Careful with the left rail: its magnifier is Discover, not Search — only the narrow-window bottom bar has a magnifier that opens this.',
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
        'It lists people to follow, grouped by pills: Popular, Followed By Friends, Follow Sets and Suggested Follows.',
        'You can also switch the feed picker to "Trending Notes" or "Followed by friends" to see beyond your own follows.',
      ],
      showMe: [
        {
          target: '[data-tour="snort-discover"]',
          title: 'Discover',
          content: 'The rail\'s discovery screen: pill-selected lists of people, plus a "Search sets…" box.',
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
      note: 'Snort mutes people and words only — no hashtags, no single threads. Worth knowing: at the version we reproduce, muted WORDS are stored but nothing filters on them yet; muting a person does work, and their notes collapse to "This note has been muted" with a Show button rather than vanishing. Preferences also carry a web-of-trust filter that hides anyone more than two follow-hops away.',
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
        'Each cache is listed separately — Profiles, Relays, Follow Lists and Gift Wraps — with its own item count and its own "Clear" button.',
        'Clear the ones you want; there is no single button that empties everything.',
      ],
      note: 'Snort is a web app, so all of this lives in your browser. Clearing the site data from browser settings wipes the lot at once, session included.',
    },
    {
      // Utils/Login/MultiAccountStore.ts holds N sessions in a Map and
      // switchAccount(id) flips the active one; Pages/Layout/ProfileMenu.tsx
      // renders a "Switch accounts" caption plus one row per other session.
      // But there is NO add-account affordance in the shipped UI: the
      // /settings/accounts page ("Logins", per-row Switch + Logout + an "Add
      // Account" link) is gated on getCurrentSubscription, and Snort's own
      // config/default.json sets features.subscriptions = false.
      // Pages/onboarding/index.tsx has no signed-in guard, which is why
      // re-opening /login works.
      //
      // TEXT-ONLY: the sim's rail DOES render a profile row at its foot, but
      // clicking it opens the profile — there is no dropdown, no "Switch
      // accounts" caption, no second session and no anchor on that row. A
      // showMe would have had to frame the profile screen while the caption
      // talked about a switcher.
      id: 'multi-account',
      category: 'Account & keys',
      question: 'How do I add a second account or switch between accounts?',
      answer: [
        'Switching is easy and built in: click the profile row at the very bottom of the left sidebar (avatar, name, chevron). The menu shows "Profile", then a "Switch accounts" caption, then one row per other account you are signed in with. Clicking a row switches instantly — no confirmation, no reload.',
        'Adding one is the awkward part: Snort ships no "Add account" button anywhere in the sidebar menu or in Settings. What works is opening the login page again — the sign-in screen has no "already signed in" guard, so signing in with a second key creates a new session, makes it active, and leaves the first one in the switcher.',
        'Removing one account without touching the others lives on the Settings → Accounts page ("Logins", with a Switch and a Logout button per session). Its row is hidden from the Settings menu unless you hold a Snort subscription, and Snort ships with subscriptions turned off — the page exists, the menu entry does not. Only the LINK is gated, though: type /settings/accounts in the address bar and the list opens.',
        'Settings → "Log Out" affects the account you are using now. It also clears Snort\'s browser storage, so export your key first.',
        'Signing in with an npub gives a watch-only session that sits alongside the others; extension, remote-signer and key logins all land in the same list.',
      ],
      note: 'Each session keeps its own relays, preferences, mutes, blocks, bookmarks and pinned notes. The list of accounts lives in one browser profile\'s storage and does not sync anywhere. Each switcher row is a small avatar with that account\'s display name beside it — no unread count, so a busy account and an idle one look identical.',
      howNostrWorks:
        'On Nostr an account IS a keypair — there is no server-side user record — so adding an account only ever means holding a second private key, or a second remote signer that holds one. Switching accounts is switching which key signs and which public key the client filters on. Your name, avatar, follow list, mutes and bookmarks are all events published to relays under that one key, so they follow the key to any client or device, while the key material itself lives only where you put it. That is also why a watch-only session can read everything and publish nothing: the public key identifies you, the private key authorises you.',
    },

    // ------------------------------------------------------- Troubleshooting --
    // "Why doesn't this work" answers. TEXT-ONLY on purpose: the simulator
    // cannot stage a failure, so a demo here could only contradict itself.
    // Grounded in v0l/snort main + the screen-map (2026-08-07).
    {
      // Pages/ErrorPage.tsx (router errorElement): "An error has occured!"
      // (upstream typo) + AsyncButton "Clear cache and reload", which calls
      // localStorage.clear() — and MultiAccountStore keeps its sessions under
      // the localStorage key "sessions", so that button logs you out of every
      // account. Components/ErrorBoundary.tsx has no recovery button at all.
      id: 'trouble-startup',
      category: 'Troubleshooting',
      question: 'Snort will not load, or shows an error page',
      answer: [
        'If the app fails to boot you get Snort\'s error page — "An error has occured!" (its own typo), the message and stack, and a single "Clear cache and reload" button.',
        'That button is more destructive than its label admits: it clears browser storage, and your logins live there. It signs you out of every account. Export your key first — Settings → Export Keys — if the app is still usable enough to get there.',
        'A crash inside a screen rather than at boot shows "Something went wrong." with the stack and no buttons at all. Reload by hand.',
        'For a targeted fix instead of the nuke: Settings → Cache lists Profiles, Relays, Follow Lists and Gift Wraps with a "Clear" each, plus a local-relay section with its own Clear, a "Dump" that downloads the local database, and a Debug link.',
        'There is no safe mode, but there is one hidden diagnostic: press "t" anywhere outside a text field and a "Query Statistics" overlay opens, listing the relay queries the app is running and how they went. Nothing else beyond the stack trace on the error screen.',
      ],
      howNostrWorks:
        'Nothing about a Nostr account lives in the client, so a corrupted local cache is never a corrupted account: your profile, follows and notes are events on relays addressed by your public key, and they come back the moment any client signs in with that key. The one thing NOT recoverable from the network is the private key itself. In a browser client an nsec login is stored in browser storage, so clearing storage without a written-down nsec destroys the account permanently — while a login through a browser extension or a remote signer survives a wipe, because the key was never in the page.',
    },
    {
      // Components/ReBroadcaster.tsx: "Broadcast Event" modal over
      // write-enabled relays, per-relay response text, Cancel / Send.
      // screen-map §12: My Relays table RELAY | STATUS | PERMISSIONS | UPTIME;
      // status is only Connected / Offline; "Read" and "Write" are clickable
      // words; "Save" is what publishes the NIP-65 list. uptime-label.tsx
      // renders "Dead" whenever monitor data is missing — a real trap.
      // system.ts: automaticOutboxModel: true.
      id: 'trouble-not-delivered',
      category: 'Troubleshooting',
      question: 'My notes are not showing up for other people (or I cannot see theirs)',
      answer: [
        'Open the note\'s "…" menu and pick "Broadcast Event". The modal lists your write relays with a checkbox each and prints each relay\'s response under its name — those per-relay responses are the real diagnostic. Every relay is already ticked when it opens; untick only the ones you want to skip, and never untick them all (that sends nowhere, silently).',
        'Check Settings → Relays. The table shows RELAY, STATUS, PERMISSIONS and UPTIME. Status has only two states, Connected or Offline. Permissions are two clickable words, Read and Write — a relay with Write off never receives anything you post.',
        'Toggling those words changes your session immediately but does NOT publish. You have to press "Save", which publishes your relay list so other clients know where to find you.',
        'Do not read the UPTIME column as connectivity. It is a separate verdict from relay-monitor data and shows "Dead" whenever none has loaded, so a perfectly healthy relay routinely reads Connected and Dead side by side.',
        'Snort\'s own advice on that page is to aim for 4–8 relays; use the "Add Relays" box (one wss:// per line) if you are publishing to too few.',
        'Settings → Tools → "Follows Relay Health" answers the other half: it reports how many of your follows publish a relay list at all, names those missing one, and ranks the write relays your follows actually use. Adding one of those is usually the fix.',
      ],
      howNostrWorks:
        'A note is not sent to a person, it is written to relays. Your client publishes to the relays you marked "write", and a reader only sees it if their client reads from a relay that accepted and kept it. Under the outbox model each person publishes a relay list saying "I write here, reach me here", and well-behaved clients fetch someone\'s notes from THAT person\'s write relays — Snort does this automatically, which cuts both ways: your own relay list must be published and correct or nobody knows where to look for you, and a follow with no relay list is a follow whose notes you may never fetch. Relays also reject silently — paid-only relays, write whitelists, spam filters and rate limits all accept your connection and drop the event, which is why the per-relay responses in the broadcast dialog tell you more than a green Connected dot.',
    },
    {
      // FooterZapButton.tsx: fastZap() only re-opens the modal when the error
      // message is "User rejected" — otherwise console.warn("Fast zap failed").
      // ZapModal.tsx renders setError(...) text; ZapModalInvoice.tsx is the
      // manual fallback (QR + copy + "Open Wallet"). shared/src/lnurl.ts owns
      // the "Only LNURLp is supported" / "No callback url" / "Failed to fetch
      // invoice" strings.
      id: 'trouble-zap-failed',
      category: 'Troubleshooting',
      question: 'My zap failed or nothing happened when I clicked it',
      answer: [
        'First check that there is a bolt to click at all. Snort only draws the zap control when it can find somewhere to send the money — a Lightning address on the author\'s profile, or zap splits on the note. If they never set one, their notes carry three actions instead of four.',
        'Where the error shows up depends on which zap you used. The one-tap "fast zap" that fires when a wallet is connected does not report failure in place — it re-opens the full zap window with the error printed inside it. The one exception is you rejecting the payment in your own wallet: that is swallowed, so a rejected zap looks like nothing happened at all.',
        'Going through the zap window yourself surfaces the same errors as text inside it.',
        'If the payment could not be made automatically the window falls back to an invoice view — a QR that is also a lightning: link, the invoice with a copy button, and "Open Wallet". Paying that by hand is the reliable workaround.',
        'Check the wallet at Settings → Wallet, which supports Nostr Wallet Connect, LNDHub and Alby. A disconnected or empty wallet is the most common cause of a zap that never leaves.',
        'A read-only session can still zap, but only anonymously: the zap window drops the "Public" option and starts you on "Anon", which signs the zap request with a throwaway key. What you cannot do is zap under your own name.',
        'Typical messages come from the Lightning side: only LNURL-pay is supported, no callback URL, failed to fetch the invoice, or the raw reason the recipient\'s server returned.',
      ],
      howNostrWorks:
        'A zap is three operations, and any of them can fail alone. First your client reads the recipient\'s Lightning address from their profile event and fetches that endpoint; if the profile has no address, or the endpoint is down or does not support Nostr zaps, the zap is impossible before any money moves. Second your client asks that endpoint for an invoice, passing a signed zap request — the amount has to sit inside the server\'s minimum and maximum, and it can refuse with a reason. Third your wallet pays the invoice over Lightning, which can fail for routing, balance or channel reasons entirely outside Nostr. Only after payment does the recipient\'s server publish a zap receipt to relays, so a paid zap whose receipt never lands on a relay you read looks exactly like a failed one. "The sats left my wallet but the note shows nothing" and "nothing happened at all" are different bugs with different fixes.',
    },
    {
      // MultiAccountStore.loginWithPubkey sets readonly for PublicKey
      // sessions. ProfileMenu's "Read Only" subheader carries max-xl:hidden —
      // invisible below 1280px. ReplyButton.tsx: `if (readonly) { return }`
      // AFTER the logged-out branch navigates to /login — so read-only is a
      // silent no-op while logged-out is a redirect.
      id: 'trouble-read-only',
      category: 'Troubleshooting',
      question: 'I cannot post or reply — nothing happens when I click',
      answer: [
        'You signed in with an npub, so Snort marked the session read-only the moment you logged in.',
        'There is a second way in, and it is not an npub: if your key is pin-encrypted, Snort asks for the pin every time you open it — and Cancel on that box does not postpone the question, it marks the session read-only for the rest of the visit. Reload and enter the pin. Do NOT log out to fix this one: logging out clears browser storage, and a pin-encrypted key that only lives there goes with it.',
        'The only indicator is a small red "Read Only" line under your name in the sidebar profile row — and it is hidden on any window narrower than about 1280px, so on a laptop or a phone there is literally nothing telling you why the app is inert.',
        'Most of the symptoms are things disappearing rather than erroring: the orange New Note button is replaced by an orange "Sign up" button — the one hint you get on a mid-size window — Messages drops out of the left nav, and Pin, Bookmark, Mute and Delete vanish from a note\'s "…" menu.',
        'The reply button is the nastiest case. It is still drawn and still clickable, and clicking it does nothing at all — no message, no redirect. (Logged out, that same button would send you to the login screen.)',
        'Settings → Notifications says it from the other side: its first prerequisite is write access, which a read-only account fails, so push can never be enabled.',
        'The fix is to replace the session, not repair it: log out and sign in with your extension, your nsec, or a remote signer. If you want to keep the npub session too, open the login page directly and add the signing one — the read-only session stays in "Switch accounts".',
      ],
      howNostrWorks:
        'An npub is only the public half of your keypair. It names you and lets any client fetch everything published under it, but every note, reaction, follow-list change and DM must carry a signature made with the private half — so a client holding only an npub is physically unable to produce one. This is not a Snort restriction or a setting that can be flipped. To write you must either give the client the private key or delegate signing to something that holds it: a browser extension, or a remote signer that gets the unsigned event and hands a signature back. Read-only login is genuinely useful for previewing an account or watching a feed without exposing a key — it is just not an account you can act from.',
    },
    {
      // Components/ProxyImg.tsx renders the verbatim "Failed to proxy image
      // from {host}, click here to load directly" and the click sets bypass.
      // shared/src/imgproxy.ts: `if (!settings) return url` — with no proxy
      // configured (Preferences default imgProxyConfig: undefined) the helper
      // is a no-op, so that message is misleading by default.
      // Pages/settings/media-settings.tsx is the UPLOAD server list.
      id: 'trouble-images',
      category: 'Troubleshooting',
      question: 'Images are not loading',
      answer: [
        'Outside notes — a link preview, a profile banner, the media grid — a failed image is replaced by red text: "Failed to proxy image from {host}, click here to load directly", and clicking it re-requests the raw URL for that one image. Inside a note you get no message at all: Snort silently walks the alternative URLs from the note\'s media metadata and, when those run out, leaves the image broken.',
        'That message is misleading on a default install, because Snort ships with no image proxy configured and the proxy helper simply returns the original URL. So in practice it means "this image host did not serve the file", and clicking through will usually fail again.',
        'If you did configure one, it is at Settings → Preferences → "Image proxy service": a toggle, and under it Server, Key and Salt. Turn the TOGGLE off to stop proxying — do not just empty the Server box, which leaves the proxy switched on with a broken address.',
        'Settings → Preferences → "Automatically load media" decides whether media is fetched at all — None, Follows only, or All. On the restricted settings an image is replaced by a click-to-load notice naming the host, not by a broken image, so that notice is the setting talking rather than a fault.',
        'Do not look under Settings → Media for this. That page is your UPLOAD servers and has no effect on displaying other people\'s images.',
        'Notes that carry media metadata get a fallback chain: when the primary URL fails, Snort tries the alternative URLs from that metadata before giving up.',
      ],
      howNostrWorks:
        'An image is not part of the note. A note is text, and an image is just an https:// URL sitting in that text — sometimes described by a metadata tag giving its type, dimensions, hash and mirrors. The bytes live on somebody\'s file host completely outside Nostr, with no relay involvement and no promise of permanence. So an image can break for reasons the protocol cannot help with: the host went away, the file was deleted, hotlinking is blocked, your network blocks it, or a proxy in between refused it. Because the URL is signed into the event, nobody can repair a dead link afterwards — the note keeps pointing at a corpse. The hash in a media tag is the one protocol-level lever: it lets a client verify or re-fetch the same file from a mirror.',
    },
    {
      // Feed/WorkerRelayView.ts::useNotificationsView — an open relay
      // subscription for TextNote / Reaction / Repost / ZapReceipt tagged p =
      // your pubkey. Pages/settings/Notifications.tsx is a five-item
      // prerequisite checklist. screen-map §5.3: HasNotificationsMarker
      // renders class `has-unread`, which NO css file defines — a real bug.
      id: 'trouble-notifications',
      category: 'Troubleshooting',
      question: 'My notifications stopped arriving',
      answer: [
        'Separate the two things, because they break differently. The Notifications TAB is a live relay subscription — Snort asks your relays for replies, reactions, reposts and zap receipts tagged with your key. If your read relays are down or you changed them, that list goes quiet and no setting will help.',
        'PUSH notifications are Settings → Notifications, which is a five-item prerequisite checklist: write access (a read-only account fails here), the browser notification API, permission granted, an active service worker, and a push subscription. Walk it top to bottom — the first failing item is your answer.',
        'If the tab is empty, check Settings → Relays: rows must show Connected AND have Read enabled. A relay with Read off delivers you nothing, notifications included.',
        'Worth knowing: the unread marker on the bell is invisible in the shipped app — the element renders but no stylesheet defines it. "No dot" is not evidence that you have no notifications.',
        'Check Settings → Preferences → "WoT Filter" ("Mute notes from people who are outside your web of trust"). With it on, a notification from anyone more than two follow-hops away never reaches the list at all — on a small account that is most of them.',
        'The notifications page also has four icon filters (mentions, reactions, reposts, zaps). If a whole category seems missing, check you have not filtered it out.',
      ],
      howNostrWorks:
        'There is no notification service in Nostr. A notification is just somebody else\'s event that happens to tag your public key — a reply, a reaction, a repost, a zap receipt. Your client discovers them by holding an open subscription to relays asking for those kinds where the tag is you. Three things follow. You only ever see the ones that reached a relay you read from, so changing or losing relays silently deletes notifications that were never yours to hold. Nothing is queued for you while you are offline beyond what the relay chose to keep. And browser push is a bolt-on: some server has to watch relays on your behalf and hit the push endpoint, which is why it needs a service worker, an OS permission and an account that can sign — none of which the protocol provides.',
    },
    {
      // Pages/settings/tools/sync-account.tsx: "Sync all events for your
      // profile into local cache" + Start + "Scanning {date}" / "Found {n}
      // events". Pages/settings/tools/prune-follows.tsx PUBLISHES a shortened
      // follow list — a plausible cause of the symptom, not a cure.
      // MultiAccountStore makes every new login active automatically.
      id: 'trouble-empty-profile',
      category: 'Troubleshooting',
      question: 'My profile is empty and my follows are gone',
      answer: [
        'Check which account you are on first. The bottom of the left sidebar shows the active identity and its "Switch accounts" list. A blank feed is very often the wrong session — Snort makes every new login active automatically.',
        'Snort ships a repair tool: Settings → Tools → "Sync Account" ("Sync all events for your profile into local cache"). It sweeps your own events back out of your relays with live progress. Run this when your profile and follows look empty but you know they exist.',
        'Snort may be holding your changes rather than losing them: when your profile, follows, relays or settings have unpublished edits it shows a card reading "You have unsaved changes to your profile, contacts, relays, or settings" with a "Save Changes" button. Only one such card shows at a time and the back-up-your-keys reminder outranks it, so dismiss that one first.',
        'Then widen where you are looking: Settings → Relays → "Add Relays" (one wss:// per line) → Add → Save. Connected only to relays that never held your profile and follow list, you will look like a brand-new account no matter what.',
        'Settings → Cache lets you clear the Profiles, Relays and Follow Lists caches individually — useful when the app has cached a stale or empty copy of your own data.',
        'Be careful with Settings → Tools → "Prune Follow List". It removes follows who have not posted recently and PUBLISHES the shortened list. If your follows shrank unexpectedly, that tool is a plausible cause rather than a cure.',
        'There is no "restore previous follow list" and no version history in Snort.',
      ],
      howNostrWorks:
        'Your profile and your follows are not settings, they are events on relays, and both are replaceable: one profile event per key, one follow list per key, and publishing a newer one replaces the older everywhere. That gives the two classic ways to lose everything. The wrong key — a different keypair is a different person, so signing in with the wrong nsec, or an npub you mistook for your own, shows a genuinely empty account with nothing missing at all. Or a stale overwrite: a client that only managed to fetch a partial follow list and then published on your behalf can replace hundreds of follows with a handful, and relays honour the newer timestamp. Recovery is possible only if some relay still stores the older event, which is why connecting to more relays — especially the ones you originally wrote to — is the real fix rather than anything local. Nothing you do to the client\'s cache can create or destroy those events; the cache only decides which copy you are looking at.',
    },
  ],
};

export default snortFaq;
