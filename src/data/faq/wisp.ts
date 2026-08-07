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
  'Troubleshooting',
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
    'multi-account': 'multi-account',
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
      note: 'The pills beside it look like labels but are buttons in the real app: one opens an "Online Now" sheet, the other a list of the relays you are connected to.',
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
        'Your profile, the settings and the logout row live there — the bottom bar carries only Home, Wallet, Search, Messages and Notifications.',
        '"Settings" expands in place into ten rows: Interface, Relays, Media Servers, Keys, Safety, Proof of Work, Social Graph, Custom Emojis, Relay Health and Console.',
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
            'The orange pencil, bottom-right. It fades to a ghost while the list scrolls rather than sliding away.',
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
        'Tap the second icon in the row under the note — that opens Wisp\'s emoji popup, seventeen of them to choose from.',
        'Press and hold the same icon instead to send the default reaction straight away.',
      ],
      note: 'Wisp does something no other client here does: the emoji you pick REPLACES the icon rather than colouring it. So a reacted note shows your emoji sitting where the heart was, in the same neutral shade — the row never lights up.',
      showMe: [
        actionStep(
          '[data-tour="wisp-actions"]',
          'React',
          'The second slot — tapping it opens the emoji popup. Whatever you send takes the icon\'s place rather than colouring it.',
        ),
      ],
    },
    {
      // §7 action row (zap, ₿ default) + §13 zap sheet
      id: 'zap',
      category: 'Reactions & zaps',
      question: 'How do I zap (tip sats to) a note?',
      answer: [
        'Tap the ₿ — fourth in the row under the note. Wisp shows a bitcoin sign there, not a lightning bolt, unless you switch it to fiat.',
        'The zap sheet opens with preset amounts: 21, 100, 500, 1000 and 5000 sats.',
        'Or tap "Custom", type an amount, and use its "+" to keep that amount as a preset of your own.',
      ],
      note: 'The number beside it is the total sats a note has earned. Switching to fiat in Interface settings swaps both the number and the ₿ for a bolt.',
      showMe: [
        {
          target: '[data-tour="wisp-zap"]',
          title: 'The zap sheet',
          content:
            'Who you are paying, the amount in large type, a row of preset chips with a Custom one beside them, and a send button that names the amount.',
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
        'The screen opens on the Profiles tab: type a name and matching people appear as you type. Switch to Notes to search post text instead.',
      ],
      showMe: [
        {
          target: '[data-tour="wisp-search"]',
          title: 'Search',
          content: 'It starts empty, on the Profiles tab — the segmented control switches between Profiles and Notes.',
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
          content: 'Everything that happened, with a filter above it. The bell in the bottom bar carries a small dot while something is unread.',
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
          content: 'Your conversation list, titled Chat — reachable from the bottom bar and from the drawer alike.',
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
    {
      // repo/KeyRepository.kt: AccountInfo + SigningMode { LOCAL, READ_ONLY },
      // addAccount / switchToAccount / removeAccount / moveAccount, and a
      // migration that PURGES the old REMOTE signing mode — so there is no
      // bunker and no Amber. ui/component/WispDrawerContent.kt mounts the
      // header People chip with a "+N" badge (screen-map §15) which opens the
      // account list; ui/component/AccountSwitcherSheet.kt is the current
      // "Accounts" sheet on main, with a pinned "Sign in with another account".
      // Per-account stores: wisp_prefs_<pubkey>, wisp_contacts_<pubkey>,
      // wisp_notif_<pubkey>, wisp_spark_<pubkey>. Interface settings are
      // GLOBAL (InterfacePreferences → "wisp_settings").
      id: 'multi-account',
      category: 'Account & keys',
      question: 'How do I add a second account or switch between accounts?',
      answer: [
        'Open the drawer with your avatar, then tap the people icon beside your big avatar in the header — it carries a "+N" badge counting your other accounts.',
        'Your account list opens: each one shows its avatar and name, an eye icon if it is watch-only, and a mark on the one you are using. Tap another to switch — Wisp rebuilds the whole session (feed, relays, media servers, wallet) and passes through the loading screen.',
        'To add one, use "Sign in with another account" at the bottom of that list. It takes you back to the Wisp splash with your current account remembered: paste an nsec for a full account, an npub for a watch-only one, mint a fresh key, or restore an encrypted backup from Google Drive.',
        'The Google route is its own account system: it opens "Your backed-up accounts" to restore one, or "Create another account" under the same Google login. It is gated by a 4–8 digit recovery PIN you set the first time, and forgetting it loses the key for good — there is no reset. Only accounts minted through that flow are in the Drive backup, so an account you added by pasting an nsec still needs that nsec written down.',
        'Backing out of the splash without signing in returns you to the account you were on — nothing is lost.',
        'To remove one, switch to it first, then drawer → the red "Logout" row. It deletes only that account and moves you to the first one remaining.',
        'With two or more accounts each row gets up/down chevrons so you can reorder the list.',
      ],
      note: 'Signing in with the nsec of a key you already watch upgrades that entry instead of duplicating it. Relays, follows, notifications and the wallet are per account; theme, accent, language, media settings and notification filters are global and do not change when you switch. One global catches people out: minting a brand-new account switches the WHOLE app to fiat display, so every zap counter turns into dollars — Settings → Interface puts it back. Wisp has no bunker or Amber login, so the private key has to live on the device.',
      howNostrWorks:
        'On Nostr an account IS a keypair — there is no server-side account — so adding one just means storing a second key on the device, and switching means signing and subscribing as a different public key. Everything that feels like your account (profile, follow list, relay list, DM relays, mutes, bookmarks) are events published on relays under that one key, which is why each account arrives with its own relays and follows, and why the same key gives you the same account on any client or device. A public key alone is enough to read as that identity but never enough to sign, so an npub-added account is inherently read-only.',
      showMe: [
        {
          target: '[aria-label="Switch account"]',
          title: 'The account switcher',
          // Descriptive: the chip is display-only in our reproduction. Do not
          // invite a tap.
          content:
            'This people chip in the drawer header is Wisp\'s account switcher — in the real app it carries a "+N" badge and opens your list of accounts, with "Sign in with another account" pinned at the bottom.',
          position: 'bottom',
          commands: cmd({ type: 'openDrawer' }),
        },
      ],
    },

    // ------------------------------------------------------- Troubleshooting --
    // "Why doesn't this work" answers. TEXT-ONLY on purpose: the simulator
    // cannot stage a failure, so a demo here could only contradict itself.
    // Grounded in barrydeen/wisp main + the screen-map (2026-08-07).
    {
      // CrashHandler.kt + ui/component/CrashReportDialog.kt: the next launch
      // after a crash shows an AlertDialog titled "Wisp crashed" with the log
      // and "Send Report" / "Dismiss"; the report is a NIP-17 gift-wrapped DM
      // to the developer and silently does nothing on a watch-only account.
      // LoadingScreen.kt has a 30s safety timeout. RelayLifecycleManager
      // forceReconnectAll() when the app was backgrounded ≥30s.
      // WispDrawerContent.kt: 7 avatar taps in 2s throws a TEST crash.
      id: 'trouble-startup',
      category: 'Troubleshooting',
      question: 'Wisp crashes or hangs when I open it — what can I do?',
      answer: [
        'After a crash the very next launch shows a "Wisp crashed" dialog with the whole log — time, version, device, stack trace — and two buttons, "Send Report" and "Dismiss". Send Report messages the log to the developer as an encrypted DM. Either button deletes the stored log, so send it before dismissing.',
        'On a watch-only account Send Report silently does nothing: there is no key to sign the message with.',
        'A hang usually means the loading screen ("Connecting to relays…", "Searching for your profile…", "Finding your friends…"). It has a 30-second safety timeout, but that only lets you through once something has actually arrived — with no relay connected it can genuinely sit there.',
        'Drawer → Settings → Console is the log view: one row per relay event marked REJECTED, NOTICE, FAILURE or CLOSED, with the relay\'s own message. Settings → Relay Health summarises it as "Connected X/Y" and "Bad N" with per-relay dots.',
        'The nearest thing to a retry: background Wisp for at least 30 seconds and reopen it — that forces every relay to reconnect and re-subscribe. There is no Reconnect button anywhere.',
        'For deeper logging, Settings → Interface → tap the version footer five times to reveal a Diagnostics section with a diagnostic-mode switch and a share/clear pair.',
      ],
      howNostrWorks:
        'A Nostr client has no backend that can be "down". At launch it opens a connection to each relay in your list and asks for your own data first — your profile, your follow list, your relay list — then waits for those to arrive before it can build a feed. So a startup that hangs is almost always relays not answering (unreachable host, an authentication-gated relay, a TLS or DNS failure) rather than lost data: your events are still sitting on the relays that do answer.',
      note: 'Wisp has no clear-cache screen, no storage reset and no safe mode. If you go to Android\'s App info, beware that "Clear storage" sits right beside "Clear cache" and is not the same thing — it deletes Wisp\'s stored keys, and an nsec you have not written down is gone for good. Curiosity warning: tapping your own avatar in the drawer header seven times fast deliberately throws a test crash.',
    },
    {
      // relay/RelayPool.kt trackPublish → BroadcastState(accepted, sent);
      // FeedScreen shows "Broadcasting (%d/%d)" then "Published to N relay(s)".
      // OK-false is logged to the Console as REJECTED with the relay message.
      // strings.xml: error_no_relays_connected, broadcast_nip65 = "Broadcast
      // Relay List (NIP-65)", broadcast_mining = "Mining PoW (%dk)…".
      // The note ⋮ menu has NO rebroadcast (btn_share / copy id / copy json /
      // hide / pin / mute thread / add to list / block).
      id: 'trouble-not-delivered',
      category: 'Troubleshooting',
      question: 'My notes are not showing up for other people (or I cannot see theirs)',
      answer: [
        'Watch the status row right after you post: "Broadcasting (n/m)" while relays answer, then "Published to N relay(s)". That N counts relays that actually accepted it, not attempts — if it stays at 0 or far below your write-relay count, the note did not land.',
        'With nothing connected, Wisp refuses outright: "No relays connected — note was not published".',
        'Drawer → Settings → Console explains a rejection: every relay that refused is logged with its own message — rate limit, paid relay, blocked key, proof-of-work required.',
        'Settings → Relays → General: each relay row has read / write / auth chips, and a relay without write never receives your notes. The full-width "Broadcast Relay List (NIP-65)" button republishes your relay list so other clients know where to fetch you.',
        'Relay Health shows "covers N" per relay — how many of your follows that relay actually carries — plus failure and rate-limit counters, which is how you spot a relay that accepts nothing.',
        'Proof-of-work is on by default for notes, so "Mining PoW…" before broadcasting is normal and can be slow on an older phone. Settings → Proof of Work turns it down.',
        'The other direction — you cannot see THEIR note — is usually a filter of yours, not a relay. Safety → Filters → "Spam replies" is ON by default and moves replies from people you do not follow into a "hidden replies from likely spam accounts" row at the bottom of the thread; expand it and tap "Not spam" to bring that person back for good. Muted words hide matching notes with no marker at all, and the Web of Trust switch on the same screen hides everything from outside your computed graph.',
      ],
      howNostrWorks:
        'A note exists only on the relays that actually accepted it. Your client sends it to your write relays and each answers yes or no with a reason — a relay may refuse for rate-limiting, being paid-only, requiring authentication, or requiring proof-of-work. Readers see it only if they read from a relay that has it, which under the outbox model means your published write relays must overlap with the read relays of the people following you. So "nobody saw my note" is usually either zero acceptances, or a perfectly healthy note sitting on relays nobody else reads.',
      note: 'There is no per-note rebroadcast in Wisp — its ⋮ menu has no republish. To get a note onto a new relay you have to add the relay and post again.',
    },
    {
      // repo/ZapSender.kt failure strings, verbatim: "Could not resolve
      // lightning address" / "Recipient does not support Nostr zaps" / "Amount
      // out of range" / "Could not get invoice from lightning provider" /
      // "Private zaps require DM relays on both sides"; FeedScreen renders them
      // in an AlertDialog titled "Zap Failed". ZapDialog shows "Wallet Not
      // Connected" first. SocialActionManager.subscribeZapReceipt closes the
      // kind-9735 subscription after exactly 30 seconds.
      id: 'trouble-zap-failed',
      category: 'Troubleshooting',
      question: 'My zap failed — what went wrong?',
      answer: [
        'With no wallet connected you get "Wallet Not Connected" — "Connect a Lightning wallet to send zaps." The Wallet tab offers Wisp\'s built-in wallet (its key derives from your Nostr key, so it restores anywhere) or Nostr Wallet Connect, where you paste a connection string from Alby, Zeus and friends.',
        'Every other failure raises a "Zap Failed" alert naming the actual reason, and each points at a different stage: could not resolve the lightning address (their profile), the recipient does not support Nostr zaps (their provider — you can still pay them, just not zap), amount out of range, could not get an invoice, or your wallet\'s own error.',
        'Check the recipient first: their profile shows a lightning row. No lightning address there means there is nothing to zap.',
        'Private zaps need more than the others: "Private zaps require DM relays on both sides", plus a key held on this device and a specific note to zap — profile zaps fall back to public.',
        'If the payment clearly went through but the count on the note never moves, that is the receipt half: after paying, Wisp listens for the zap receipt for exactly 30 seconds and then stops.',
        'The zap sheet has its own guards — over 10k sats asks for confirmation and 1M is a hard cap — and the Public / Anonymous / Private choice changes which failures can bite.',
      ],
      howNostrWorks:
        'A zap is five steps and any of them can fail. Your client reads the recipient\'s lightning address from their profile and resolves it; it builds and signs a zap request naming the relays where the receipt should be published; it asks that provider for an invoice, which requires the provider to support Nostr zaps and the amount to sit inside its limits; your wallet pays the invoice over Lightning; and finally the recipient\'s provider publishes the zap receipt to those relays. The counter you see on a note is built from that last step, so a payment that really went through can still look like a failed zap if the receipt never reaches a relay you read.',
    },
    {
      // ui/screen/WatchOnlyOnboardingScreen.kt: full-screen "Watch-only mode"
      // step with the verbatim copy and a "Start watching" button.
      // BottomBar.kt drops WALLET and MESSAGES when isReadOnly; Navigation.kt
      // sets onCompose = null and onReply = {} for READ_ONLY.
      // SocialActionManager's write paths all `val s = getSigner() ?: return`,
      // which is why follow/react/repost stay visible and do nothing.
      // KeysScreen.kt prints "No private key is stored on this device."
      id: 'trouble-read-only',
      category: 'Troubleshooting',
      question: 'I cannot post — I am in watch-only mode',
      answer: [
        'You signed in with an npub (or an nprofile, or a raw hex public key), so Wisp created a watch-only account. It tells you at the time with a full-screen "Watch-only mode" step: you can read, browse and follow, but posting, reacting and zapping need a private key.',
        'The signed-in state looks different too: the bottom bar drops from five tabs to three (Wallet and Messages disappear), the orange compose button is not drawn at all, and replies do nothing.',
        'Confirm which mode you are in: drawer → Settings → Keys shows your npub as usual, but under Private Key it reads "No private key is stored on this device." In the account list a watch-only account carries an eye icon.',
        'Worth knowing, because the onboarding copy overpromises: following does not work either. Follow, react and repost all return early with no signer, so those controls stay visible and silently do nothing. Mute and pin are the exception — they take effect on the device, so a blocked user really does disappear from your feed, notifications and DMs — but neither list is ever published, so none of it follows your key to another client.',
        'To fix it, open the account switcher → "Sign in with another account" and enter the nsec. Signing in with the nsec of the same key replaces the watch-only entry rather than adding a duplicate. Logging out first also works — its confirm dialog reassures you that you can sign back in with your npub any time.',
      ],
      howNostrWorks:
        'Every action other people can see is an event you sign with your private key — a note, a reaction, a repost, a follow list, a zap request. An npub is only the public half of the keypair: a name others can address and a filter you can subscribe with, but it cannot produce a signature, so a client holding only an npub reads the whole network as you and writes nothing. Clients that support a remote signer can be key-less and still write, because something else does the signing.',
      note: 'Wisp has no remote-signer or Amber login, so the private key has to live on the device.',
    },
    {
      // strings.xml settings_auto_load_media / settings_auto_load_description
      // (ships ON). RichContent.kt: when off, media renders as a "Tap to load"
      // block over the blurhash; long-press gives "Copy URL" / "Download".
      // PostCard.kt gates content-warning notes behind "Tap to reveal".
      // LoadingAsyncImage's onError just stops the spinner — there is NO
      // "failed to load" message. Blossom.kt is the UPLOAD server list.
      id: 'trouble-images',
      category: 'Troubleshooting',
      question: 'Images are not loading',
      answer: [
        'Check the setting first: Settings → Interface → Media → "Auto-load media". It ships on; with it off every image is a placeholder captioned "Tap to load" over a blurred preview — by design, not a failure.',
        'Notes flagged as sensitive are covered by a "Tap to reveal" panel instead of showing the media at all.',
        'Long-press an image for "Copy URL" and "Download". Pasting that URL into a browser is the fastest way to tell whether the host is down, geo-blocked or rate-limiting you — the note itself is fine either way.',
        'Settings → Media Servers is not the fix: it governs where YOUR uploads go and does not mirror or proxy other people\'s images.',
        'There is no image-proxy setting, no media cache to clear, and no "failed to load" message — a failed fetch simply stops the spinner and leaves the placeholder, so a permanently grey block usually means the remote host.',
        'If media fails everywhere at once, treat it as a network problem rather than a relay problem. Images travel over ordinary HTTPS, not over your relay connections, so a green Relay Health tells you nothing about them.',
      ],
      howNostrWorks:
        'Images are not part of a Nostr note. A note is text, and an image is just an https URL inside that text — often described by a tag carrying dimensions and a blurhash so the client can draw a placeholder before the bytes arrive. The file itself lives on a third-party host that has no relationship to the relays. So relays can be perfectly healthy while every image fails, nothing any relay does can bring a dead image host back, and the same note shows pictures for one person and not another.',
      note: 'Video autoplay and looping have their own switches in that same Media section — "the video does not start" is often just autoplay being off.',
    },
    {
      // AndroidManifest.xml requests no POST_NOTIFICATIONS and build.gradle.kts
      // has no Firebase / UnifiedPush / WorkManager: there is NO push at all.
      // NotificationsScreen.kt: the Tune icon opens "Notification Filters"
      // (Replies / Reactions / Zaps / Reposts / Mentions / Votes / DMs +
      // Chat rooms + Enable all / Disable all). Safety "Spam replies" is ON by
      // default and hides likely-bot replies from non-follows.
      // Filters + sound live in the GLOBAL wisp_settings; only read/unread
      // state is per account (wisp_notif_<pubkey>).
      id: 'trouble-notifications',
      category: 'Troubleshooting',
      question: 'My notifications stopped arriving',
      answer: [
        'The single most important fact: Wisp has no push notifications at all. No lock-screen alerts, no background service, nothing accumulating while the app is closed — notifications exist only inside the app, only while it is running.',
        'Check the filters first: on the Notifications tab, the tune icon (accent-coloured when filters are active) opens "Notification Filters" with switches for replies, reactions, zaps, reposts, mentions, votes and DMs, plus chat rooms and enable/disable-all. One switch left off is the usual cause of "reactions stopped but replies still work".',
        'The speaker icon beside it mutes the notification sound.',
        'Check Safety → Filters → "Spam replies" too. It is on by default and uses an on-device model to hide likely-bot replies from people you do not follow — silently.',
        'Muted threads, muted users and muted words all suppress their notifications as well.',
        'The 24-hour summary bar at the top is a FILTER, not a total: tapping a stat isolates that type. If the list suddenly looks empty, tap the highlighted stat again.',
        'If everything stopped, check Relay Health and Console — mentions can only arrive on read relays that are actually connected. Backgrounding the app for 30 seconds and reopening forces a reconnect.',
      ],
      howNostrWorks:
        'Notifications on Nostr are not pushed to you — they are ordinary events that happen to tag your public key, and a client finds them by keeping a live subscription open on your read relays. Whoever replied to or zapped you published their event to the relays THEY write to; you only learn about it if one of those is a relay you read from. That is why notifications can go quiet after a relay change, and why a client with no background service shows you nothing while it is closed: nobody is holding the events for you, they simply sit on relays until you ask again.',
      note: 'The Notification Filters and the sound toggle are global — they stay put when you switch accounts. Read/unread state is per account, and so are the things that quietly suppress notifications: the Safety "Spam replies" switch and your muted users, words and threads all belong to the account you are signed in as.',
    },
    {
      // FeedScreen.kt guards the first follow with "No follow list found":
      // "…If you follow this person, your follow list will start at 1. If you
      // believe this is wrong, rebroadcast your follow list from another client
      // first, then try again." StartupCoordinator.subscribeSelfData() asks a
      // fixed indexer set + your write relays for the replaceable kinds.
      // There is no "refresh my profile" action anywhere.
      id: 'trouble-empty-profile',
      category: 'Troubleshooting',
      question: 'My profile is empty and my follows are gone',
      answer: [
        'Identify the account first: drawer → Settings → Keys shows the npub you are actually signed in as, and the account list shows every account on the device. An empty profile is very often the wrong key, or a watch-only npub added by mistake.',
        'Take the guard dialog seriously. The first time you follow someone while your follow list looks empty, Wisp warns: "No existing follow list was found on your relays… If you believe this is wrong, rebroadcast your follow list from another client first, then try again." Choosing "Follow anyway" publishes a follow list containing exactly one person. Cancel until you have checked.',
        'On startup Wisp re-fetches your own profile, follows and relay list from a fixed set of indexer relays plus your own write relays — that is the "Searching for your profile…" and "Finding your friends…" step. If it passes with nothing, none of them answered with your list.',
        'Add the relay you actually publish to in Settings → Relays → General (tick read and write), then press "Broadcast Relay List (NIP-65)" so other clients and Wisp\'s own next startup look in the right place.',
        'There is no "refresh my profile" button. Background the app for 30 seconds and reopen, or switch accounts and back — both reload everything.',
        'Relay Health and Console tell you whether the relays holding your history are connected: a follow list on an unreachable or authentication-gated relay looks identical to one that does not exist.',
      ],
      howNostrWorks:
        'Your profile and your follow list are two events signed by your key and stored on relays. Two very different situations look identical in a client: a different key (a genuinely empty account — nothing was lost, you are simply someone else), and the same key queried against relays that never received those events (your data exists, you are looking in the wrong place). Because those events are replaceable, relays keep only the newest one per key — so a client that publishes a fresh, shorter follow list can overwrite a good one. That is exactly why a "start at 1" follow is dangerous, and why rebroadcasting the full list from a client that still has it is the fix.',
    },
  ],
};

export default wispFaq;
