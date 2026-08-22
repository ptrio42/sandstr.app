/**
 * Boris FAQ — grounded in docs/refs/boris/screen-map.md, with upstream
 * dergigi/boris-android @ 8456da4 (= release 1.4.49, MIT) cited by
 * file:symbol wherever the recording never opened the screen. That is most of
 * this bank: Boris keeps its interesting answers inside Settings, inside the
 * signer handoff and inside the nostr kinds it writes, and a camera pointed at
 * the reader sees none of them.
 *
 * docs/gaps/boris.md is the showMe gate, and it bites harder here than
 * anywhere else in the bank. Sixteen entries carry a demo; the rest are
 * text-only on purpose, because the surface they describe is `dead` or
 * `partial` in our reproduction (the Library scopes, the reader overflow, the
 * offline shelves, the storage-limit chips, the search results) and a
 * spotlight on a control that does nothing is worse than no spotlight.
 *
 * WHAT MAKES THIS BANK DIFFERENT. Boris is a reader, not a social client, so
 * six canonical topics have answers no other client here can give:
 *
 *  - `post` — the thing you publish is a *highlight* (kind 9802). There is no
 *    composer anywhere in the app.
 *  - `reactions` — the only reactions Boris knows are 👀 (a lookmark) and 📚
 *    (the archive), and it only *writes* the second one.
 *  - `backup-keys` — Boris never holds a key at all. That is not `n/a`, it is
 *    the strongest answer in the file.
 *  - `zap` — there is no zap button. What Boris does instead is attach a zap
 *    SPLIT to everything you publish.
 *  - `clear-cache` — no clear button either; a storage cap read at launch.
 *  - `manage-relays` — a read-only screen over your NIP-65 list, plus a local
 *    Citrine slot.
 *
 * Only `mute` and `dms` are `n/a`, and both were checked rather than inferred:
 * there is no mute or block code in the 291 Kotlin files (the word only occurs
 * as a colour name), and NIP-04/NIP-44 appear solely as transport for encrypted
 * bookmark lists and for the NIP-46 bunker — never for messages.
 *
 * Reader-shaped questions ("how do I listen", "how do I read offline", "how do
 * I add an RSS feed") are ordinary `entries` in their own categories. They are
 * deliberately NOT new CANONICAL_TOPICS: nobody asks them about Damus, and
 * adding one there would break the eight other client files to describe one app.
 */

import type { SimulatorCommand } from '../../simulators/boris/types';
import type { ClientFaq } from './types';

/** Typed authoring helper — keeps command payloads honest against the sim. */
const cmd = (...cs: SimulatorCommand[]): SimulatorCommand[] => cs;

const CATEGORIES = [
  'Getting started',
  'Reading',
  'Highlighting',
  'Library & feeds',
  'Finding things',
  'Value & zaps',
  'Account & relays',
  'Troubleshooting',
];

// Most of Boris's commands are self-sufficient by construction — `openPane`
// and `playTts` open the reader first, `openSettings` closes whatever else was
// up, `highlight` opens the article it marks — so 12 of the 15 command-bearing
// steps below carry exactly ONE and the queue can never drop a second. The
// three pairs are all a SESSION plus a screen, which is the one thing a single
// command cannot express: `{back}` to force the signed-out state, or `{login}`
// to force the signed-in one, and then where to look.
const home = cmd({ type: 'navigate', payload: 'home' });

export const borisFaq: ClientFaq = {
  clientId: 'boris',
  categories: CATEGORIES,
  coverage: {
    'sign-in': 'sign-in',
    'backup-keys': 'backup-keys',
    logout: 'logout',
    'multi-account': 'multi-account',
    post: 'highlight',
    reply: 'reply',
    reactions: 'lookmarks',
    zap: 'zap',
    'connect-wallet': 'connect-wallet',
    'media-uploader': 'media-images',
    'clear-cache': 'clear-cache',
    'manage-relays': 'manage-relays',
    // Verified absent, not inferred from silence: there is no mute, block or
    // filter list anywhere in dergigi/boris-android@8456da4 — `mute` occurs
    // twice in 291 files, both times as a colour variable. Boris shows every
    // highlight it finds and gives you no per-person switch; the only filters
    // are the three audience layers (nostrverse / friends / mine).
    mute: 'n/a',
    // Also verified: Boris has no messaging surface of any kind. NIP-04 and
    // NIP-44 are present (Nip51.isNip04, ReaderViewModel, LibraryViewModel,
    // BunkerClient) but only ever to decrypt your own private bookmark list
    // and to carry NIP-46 signer traffic.
    dms: 'n/a',
    search: 'search',
    notifications: 'notifications',
    follow: 'follow',
  },
  entries: [
    // ---------------------------------------------------- Getting started --
    {
      // ui/auth/AuthBar.kt:88-110 renders the pair; AuthViewModel.connectIntent()
      // builds the NIP-55 `nostrsigner:` intent with type=get_public_key
      // (nostr/RemoteSignerBridge.kt:24-29). The bar is mounted in exactly two
      // places — LibraryScreen.kt:425 and account/AccountScreen.kt:185.
      id: 'sign-in',
      category: 'Getting started',
      question: 'How do I sign in?',
      searchAliases: [
        'log in',
        'connect my account',
        'where do I paste my nsec',
        'amber',
        'nip-46',
        'remote signer',
        'nstart',
      ],
      answer: [
        'Open the You tab (the rightmost one) or the Library tab. Both show the same pair of buttons; nothing else in Boris ever asks you to sign in.',
        '"Amber" is the filled button with a key icon. It hands off to Amber, the NIP-55 signer app, which asks for your permission and returns only your public key.',
        '"Bunker" is the outlined button with a shield. Tapping it replaces the pair with a monospace field for a `bunker://…` URI and a Connect / Cancel row — that is NIP-46, a signer running somewhere else.',
        'Under both, in small type: "New to nostr? Start here: nstart.me". Tapping nstart.me opens it in your browser.',
        'Home also has a dismissible "Connect?" card. Its "Log in" button just takes you to the You tab — there is no separate sign-in screen.',
      ],
      note: 'There is no field to paste an nsec into, and no npub read-only mode either. Boris has exactly two sign-in states: a signer, or signed out — and signed out is a genuinely usable state, not a wall.',
      showMe: [
        {
          target: '[data-tour="boris-login-amber"]',
          title: 'Amber first',
          content:
            'The filled button with the key. It opens the Amber signer app, which shows you what is being asked for and hands back a public key — your secret key never crosses into Boris.',
          position: 'top',
          // `back` clears the session and every overlay; `navigate` then lands
          // on the You tab, which is where the signed-out auth pair mounts.
          // Without the reset, a visitor who already signed in sees their own
          // highlights here and the step rings nothing.
          commands: cmd({ type: 'back' }, { type: 'navigate', payload: 'you' }),
        },
        {
          target: '[data-tour="boris-login-bunker"]',
          title: 'Or a bunker',
          content:
            'The outlined one, with a shield. In the real app tapping it swaps this pair for a bunker://… field and a Connect / Cancel row, then shows "Connecting…" while it pairs over NIP-46.',
          position: 'top',
        },
      ],
    },
    {
      // strings.xml:62-69, verbatim. The signed-out reader is the whole point:
      // ui/home/HomeScreen.kt:588-592 even retitles the "by others" row to a
      // plain "Recently highlighted" when there is no "you" to contrast it with.
      id: 'no-account',
      category: 'Getting started',
      question: 'Do I need an account to use Boris?',
      searchAliases: ['try without signing up', 'guest', 'is it free', 'do I need a key'],
      answer: [
        'No. Home, Feeds, Search and the entire reader work with no account at all — you can open an article, read it, listen to it and search inside it while signed out.',
        'Two tabs ask you to connect, and both ask politely rather than blocking: Library shows "Your bookmarks / Connect, and they show up here.", and You shows "Your highlights" over a yellow-marked sample sentence.',
        'Home carries a dismissible card that says exactly what an account adds: "Optional. Link a Nostr account to publish highlights and discover what your friends found interesting enough to highlight."',
        'The two things you cannot do signed out are publishing your own highlights and saving bookmarks. Reading is not one of them.',
      ],
      note: 'Signed out, the Feeds tab shows a bright Nostrverse toggle between two greyed-out neighbours — Friends and You need a login they do not have.',
      showMe: [
        {
          target: '[data-tour="boris-connect"]',
          title: 'The app says it itself',
          content:
            'Boris puts this on Home rather than in front of it. "Connect?" — optional, and the card tells you what connecting buys before you decide. Dismiss it and Home carries on working.',
          position: 'bottom',
          // The notice only renders while signed OUT, so reset first.
          commands: cmd({ type: 'back' }, { type: 'navigate', payload: 'home' }),
        },
      ],
    },
    {
      // ui/about/AboutPages.kt:82-86 — ABOUT_PAGES is Intro + nine
      // ABOUT_FEATURES + Cta = eleven. Copy verbatim in strings.xml:78-117.
      id: 'tutorial',
      category: 'Getting started',
      question: 'What is Boris, and is there a tour?',
      searchAliases: ['walkthrough', 'onboarding', 'help', 'how does this app work'],
      answer: [
        'Boris is a nostr-native reader: bookmarks become a reading queue, articles arrive stripped to their text, and the sentences you mark are published to nostr as events of their own.',
        'The tour is "About Boris" — the question-mark icon in the Home top bar, the "About Boris" button on the "First time?" card, or Settings → About → Tutorial.',
        'It is eleven pages: an introduction, then nine features — Read Anywhere, Distraction-Free, Airplane Mode, Social Highlights, Lists Libraries and More, Zap Splits, Comforting Colors, Peace of Mind, Free as in Freedom — and a closing page.',
        'The last page has five buttons: Connect on Nostr · Report a bug · Suggest a feature · Say thanks · Start reading!',
      ],
      note: 'The About *settings* screen is a different surface from the tour: Tutorial · Vision ("Purple Text, Orange Highlights") · Support Boris · Report a bug · Suggest a feature, then a Links group with the website, the web app, the source repo and the author.',
      showMe: [
        {
          target: '[data-tour="boris-about"]',
          title: 'Eleven pages, one idea per page',
          content:
            'The carousel opens on "Hello! I’m Boris." and walks through the nine things the app claims for itself. The dots at the bottom are the pager; the real app swipes between pages.',
          position: 'center',
          spotlightPadding: 0,
          commands: cmd({ type: 'openAbout' }),
        },
      ],
    },
    {
      // ui/shell/MainTab.kt:19-53 for order and icon pairs; BorisBottomBar.kt:26-72
      // for the bar itself. BorisApp.kt:216 — the bar exists ONLY on the five tabs.
      id: 'getting-around',
      category: 'Getting started',
      question: 'Where is everything — what are the five tabs?',
      searchAliases: ['navigation', 'menu', 'where is the settings button', 'tab bar'],
      answer: [
        'Home · Library · Feeds · Search · You, left to right, with the label always visible under every icon.',
        'Home is rows of articles chosen by highlights rather than by an algorithm. Library is your bookmarks. Feeds is a stream of other people’s highlights and long-form writing. Search looks through what Boris has already downloaded. You is your own highlights — and your sign-in.',
        'Signed in, the You icon is replaced by your own profile picture, with a thin indigo ring when the tab is selected.',
        'Settings is the gear in the You tab’s top bar. There is no settings row in a drawer, because there is no drawer.',
        'The bar disappears the moment you leave the five tabs: the reader, Settings, About, Support and a profile are all full-bleed.',
      ],
      note: 'Re-tapping the tab you are already on does nothing — no scroll-to-top, no refresh. The one "tap the chrome to go back to the top" affordance in the whole app is the article title in the reader.',
      showMe: [
        {
          target: '[data-tour="boris-tabs"]',
          title: 'Five destinations, and no compose button',
          content:
            'The clearest structural difference between Boris and every other client on this shelf: no plus, no pencil, no floating action button. There is nothing to compose. The pill behind the selected icon is Material’s own, not a Boris colour.',
          position: 'top',
          commands: home,
        },
      ],
    },

    // ------------------------------------------------------------ Reading --
    {
      // ui/reader/ReaderScreen.kt:2472-2510 — the chip FlowRow, in order:
      // author (nostr long-form only) · domain · + RSS · read time · highlights
      // · published. Labels from data/ReadingTime.kt:18 and :2339-2342.
      id: 'open-article',
      category: 'Reading',
      question: 'How do I open and read an article?',
      searchAliases: ['reader mode', 'read a link', 'where do the articles come from'],
      answer: [
        'Tap any card on Home, any row in Library, or any highlight in Feeds — every one of them lands in the reader.',
        'A web page arrives stripped to its text and set in Source Serif 4, justified, at 21sp by default. A nostr long-form post arrives the same way.',
        'Under the title is a row of chips, always in this order: the author (nostr long-form only), the site it came from, "+ RSS" if the page publishes a feed, the reading time, the highlight count, and the publication date.',
        'The highlight chip is the interesting one — it is tinted by the strongest class of highlight on the page (yours, then friends, then the nostrverse), and tapping it opens every mark on that page.',
        'To share it back out: ⋮ → Share, Copy link, Open in browser, Wayback Machine or archive.ph.',
      ],
      note: 'To get a link INTO Boris you share it from another app — Boris registers as a share target, and Home also shows an "Open from clipboard" banner when it spots a URL you have copied. Share plain TEXT rather than a link and you get a "Highlight with Boris" dialog asking for the Article URL instead. No screen has a standing "add URL" field.',
      showMe: [
        {
          target: '[data-tour="boris-home-card"]',
          title: 'One card, one article',
          content:
            'A 140dp cover, the title over two lines, and the host it came from. Coverless articles get a glyph tinted with the row’s own colour instead.',
          position: 'top',
          commands: home,
        },
        {
          target: '[data-tour="boris-reader-meta"]',
          title: 'What Boris knows before you commit',
          content:
            'Where it came from, how long it takes, how many people have marked it, when it was published. The highlight chip carries the colour of the strongest mark on the page — tap it to read them.',
          position: 'bottom',
          commands: cmd({ type: 'openArticle', payload: 'infinite-scroll' }),
        },
      ],
    },
    {
      // tts/TtsSpeed.kt:6-7 — eleven presets 0.8…3.0, DEFAULT 2.1, cycled by a
      // chip. ui/shell/TtsMiniPlayer.kt:132-224 for the player; BorisApp.kt:218-221
      // and ReaderScreen.kt:1866-1870 for its three mounting sites.
      id: 'listen',
      category: 'Reading',
      question: 'Can Boris read an article out loud?',
      searchAliases: ['text to speech', 'audio', 'listen to articles', 'podcast', 'tts', 'voice'],
      answer: [
        'Yes. In the reader, tap the play triangle in the top bar — it turns into a pause while it reads. Or select a sentence and choose "TTS from here" to start from that point instead.',
        'A 56dp mini player appears with, left to right: the title (tap to reopen the article), a speed chip, follow-along, previous paragraph, play/pause, next paragraph, and close.',
        'The speed chip cycles through eleven presets — 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.1, 2.4, 2.8, 3.0 — and drops the decimal on whole numbers, so it reads "2x", not "2.0x". Boris ships at 2.1.',
        'Follow-along paints the sentence being spoken in teal as it goes. Turn it off in Settings → Text-to-Speech.',
        'The player follows you out of the article: it sits above the bottom bar on the five tabs, and as an overlay on Settings, About, Support and profiles.',
        'Pressing play picks up from your saved reading position rather than from the top, so listening and reading share one place in the article.',
      ],
      howNostrWorks:
        'Nothing about this touches nostr. Boris uses the phone’s own text-to-speech engine and whatever voices are installed on it — which is why Settings → Text-to-Speech offers a speaker language (System, Content auto-detect, and eleven named languages) rather than a list of voices Boris ships.',
      note: 'Playback runs as an Android media session, so it puts a Playback notification in your shade with the transport controls. That is the only notification Boris ever posts.',
      showMe: [
        {
          target: '[data-tour="boris-tts-player"]',
          title: 'The mini player',
          content:
            'Title, speed chip, follow-along, the two paragraph skips around play/pause, and a close. It sits inside the reader’s own bottom column here, just above the reading-progress strip.',
          position: 'top',
          commands: cmd({ type: 'playTts' }),
        },
      ],
    },
    {
      // ui/settings/OfflineSection.kt + AirplaneModeSection.kt. Shelves from
      // data/OfflineShelf; storage options from data/OfflineStore.kt:50.
      // TEXT-ONLY: docs/gaps/boris.md bor-31 — our five shelf switches and five
      // limit chips are hard-rendered spans, so a spotlight here would frame
      // ten controls that do nothing.
      id: 'offline',
      category: 'Reading',
      question: 'Can I read without a connection?',
      searchAliases: ['airplane mode', 'download articles', 'no signal', 'on a plane', 'offline'],
      answer: [
        'Settings → Airplane mode. Boris downloads article text ahead of time so your library stays readable with no network.',
        'Five shelves, each with its own switch and an "N of M downloaded" progress bar: Bookmarks, Web Bookmarks, Lookmarks, Archive, Highlights. All five are on by default.',
        'Articles you open are always cached whatever those switches say — the shelves only decide what gets fetched *before* you ask for it.',
        'Under them: "Storage limit", with 210 MB / 512 MB / 1 GB / 2 GB / 5 GB. Boris ships at 1 GB and prints what you are currently using above the row.',
        'The same screen has "Use local relays as cache" and a live line telling you whether Citrine — a relay that runs on the phone itself — is reachable on ws://127.0.0.1:4869.',
      ],
      howNostrWorks:
        'Offline-first is easier on nostr than it sounds: an event is a signed blob with a timestamp, so one written on a plane is just as valid when it reaches a relay six hours later. Boris queues what you create and rebroadcasts it when you are back online. A local relay makes this sturdier still — your phone keeps its own copy of everything, and the wider network becomes a sync target rather than the source of truth.',
      note: 'Highlighting offline needs the signer, not the network: Amber runs on the same phone, so it can sign while you are in a tunnel. A bunker cannot — NIP-46 is relay traffic.',
    },
    {
      // ui/settings/ReadingSection.kt + ReadingFonts.kt:26,28-35 (ten families,
      // six sizes, six link swatches) and ThemeSection.kt:38-39 (both theme rows
      // visible on the default "system"). Preview card: ReadingPreview.kt:174-188.
      id: 'reading-settings',
      category: 'Reading',
      question: 'How do I change the font, the size or the theme?',
      searchAliases: [
        'text too small',
        'dark mode',
        'night mode',
        'sepia',
        'change typeface',
        'justify text',
      ],
      answer: [
        'Settings → Reading holds the typography: Reading Font (ten families), Font Size (six "A" buttons, each set in the size it selects), Paragraph Alignment (left or justified — justified is the default), Link Color, and "Open weblinks in Boris".',
        'Settings → Appearance holds the theme: Light / Dark / System as three icon toggles, then a swatch row for each mode. Dark offers Black, Midnight and Charcoal; light offers Paper White, Sepia and Ivory.',
        'The shipped defaults are not the obvious ones — Midnight (#18181B) for dark and Sepia (#F4F1EA) for light, with the mode itself following the system.',
        'On the default "system" setting both swatch rows are visible at once. That is intentional: you are picking which dark and which light Boris uses when the phone switches.',
        'Every one of those screens carries the same live preview card — "The Quick Brown Fox" and three Lorem paragraphs — so you read the change before you leave.',
      ],
      note: 'The preview always marks the second sentence of each paragraph, in mine → friends → nostrverse order, which is how you compare all three highlight colours at once.',
      // No showMe, and the reason is worth recording. The obvious target is the
      // preview card, and it is unusable as one: measured in the running sim it
      // starts 65px above the bottom of the phone and is 1436px tall, so the
      // ring lands below the fold on something twice the height of the screen
      // (docs/TOURS.md — "a step whose subject needs scrolling has the wrong
      // target", and "a screen-sized ring is no ring"). The screen's headline
      // control is out anyway: gap bor-25, the Reading Font row shows its value
      // and a chevron but opens nothing.
    },
    {
      // ui/reader/ReadingProgress.kt:100-152 (the strip) and :65-97 (the card
      // bar). Sync is kind 39802 via nostr/Nip85.kt + data/ReadingPositionSync.kt.
      id: 'progress',
      category: 'Reading',
      question: 'How does Boris keep track of how far I got?',
      searchAliases: [
        'where did I stop reading',
        'resume',
        'continue reading',
        'sync across devices',
        'reading position',
      ],
      answer: [
        'Every article carries a percentage. In the reader it is a full-width strip at the bottom — a 2dp track with the number right-aligned beside it.',
        'The fill and the number change colour together: barely-there at 1–10%, indigo through the middle, green at 95% and over, where the number is replaced by a ✓.',
        'On Home and in Library the same number is a thin bar under each card. It renders nothing at all until you have opened the article once, so an untouched card looks untouched.',
        'Articles you have started show up in the "Continue reading" row at the top of Home.',
        'Settings → Scroll Behaviour → "Sync reading position across devices" (on by default) publishes that position so the web app and another phone pick up where you stopped. "Auto-scroll to saved reading position" is what actually jumps you there.',
      ],
      howNostrWorks:
        'The position is a nostr event like anything else — an addressable kind 39802, one per article, replaced each time it moves. It syncs the way your profile syncs: written to your relays, read back by whatever client asks. Boris signs these silently in the background rather than popping the signer mid-paragraph, so if silent signing is not available the position simply stays on the device.',
      showMe: [
        {
          target: '[data-tour="boris-reader-progress"]',
          title: 'The strip, not a floating badge',
          content:
            'A 2dp track across the full width with the percentage in a fixed-width slot beside it, set in tabular figures so the number does not jitter as it climbs. Read past 95% and it becomes a ✓.',
          position: 'top',
          commands: cmd({ type: 'openArticle', payload: 'infinite-scroll' }),
        },
      ],
    },
    {
      // ui/reader/OutlinePane.kt, FindPane.kt, ArticleFind.kt. TEXT-ONLY:
      // gaps bor-08 (contents rows do not scroll to their section) and bor-10
      // (no "N of M" counter, no prev/next, no FindMark painted in the text) —
      // and no tour command can type a query, so a demo would ring an empty box.
      id: 'find-in-article',
      category: 'Reading',
      question: 'How do I search inside an article, or jump to a heading?',
      searchAliases: ['ctrl-f', 'table of contents', 'find on page', 'jump to a section'],
      answer: [
        'Find: ⋮ → "Find in article". A full-height pane slides in with the placeholder "Search in article", a "N of M" counter, and previous/next arrows to walk the matches.',
        'Every match is painted in the article in a pale blue (#93C5FD) that is not one of the highlight colours and cannot be changed. Empty state: "No matches".',
        'Contents: the list icon in the top bar, left of the title — it only appears when the article actually has headings. Tapping a heading scrolls to it.',
        'Both panes are full-height sheets over a dimmed page, as is the Highlights pane. Only one is ever open.',
        'To get back to the very top of an article, tap its title in the top bar.',
      ],
      note: 'Find searches the article you are in. To search across everything Boris has, use the Search tab instead — they are separate tools with separate empty states ("No matches" here, "No matches." with a full stop there).',
    },
    {
      // ui/settings/ScrollBehaviourSection.kt:38-80; amounts from
      // ui/reader/VolumeKeys.kt:9 (25/50/75/90/100, default 90).
      id: 'scroll',
      category: 'Reading',
      question: 'Can I scroll with the volume buttons?',
      searchAliases: [
        'hardware buttons',
        'page turn',
        'one handed reading',
        'top bar keeps hiding',
        'auto archive',
      ],
      answer: [
        'Yes — Settings → Scroll Behaviour → "Use volume buttons to scroll", on by default.',
        'Turning it on reveals "Scroll amount": 25%, 50%, 75%, 90%, 100% of a screen per press. Boris ships at 90%, which leaves a line of overlap so you do not lose your place.',
        'The same screen holds five other switches: "Hide top bar on scroll" (on), "Sync reading position across devices" (on), "Auto-scroll to saved reading position" (on), "Automatically move to archive at 100%" (off), and "Archive button closes reader" (on).',
        'The two archive switches are the ones worth knowing about: the first files an article for you the moment you finish it, the second decides whether tapping Archive also shuts the reader.',
      ],
      showMe: [
        {
          target: '[data-tour="boris-scroll-switches"]',
          title: 'Six switches about how the page moves',
          content:
            'Everything on this screen is about the mechanics of reading rather than the look of it — the chrome hiding itself, the volume keys, where you left off, and what happens when you reach the end.',
          position: 'top',
          commands: cmd({ type: 'openSettings', payload: 'scroll' }),
        },
      ],
    },
    {
      // ui/settings/MediaSection.kt:23-24 is one switch. The ONLY file picker
      // in the app is the OPML import (ui/settings/RssFeedsSection.kt:52,
      // ActivityResultContracts.GetContent) — Boris never uploads anything.
      id: 'media-images',
      category: 'Reading',
      question: 'How do I add an image — and why is this one full-bleed?',
      searchAliases: [
        'upload a photo',
        'attach an image',
        'blossom',
        'media server',
        'nip-96',
        'pictures too big',
      ],
      answer: [
        'You cannot add one. Boris has no composer, no camera button and no image picker, so it never uploads anything and never asks you for a media server.',
        'Images in an article come from the article: the extractor pulls them out of the page (or out of the nostr long-form event) along with the text, and strips ads, comment threads and sidebars around them.',
        'Settings → Media has exactly one switch — "Full-width images in articles", on by default. Turn it off if you would rather images sat inside the reading column.',
        'Tapping an image in the reader opens it full-screen.',
        'The one file picker in the whole app is Settings → Feeds → Import OPML, and that reads a subscription list, not media.',
      ],
      howNostrWorks:
        'Clients that post pictures upload them to a media host first (Blossom, NIP-96 and friends) and put the resulting URL in the event, because relays carry text, not files. Boris never publishes media, so it needs none of that — the only events it writes are a highlight, an archive reaction, a reading position and its own settings blob.',
    },

    // ------------------------------------------------------- Highlighting --
    {
      // The flagship. nostr/Nip84.kt:7-8 — KIND 9802, alt text "Highlight
      // created by Boris Android. readwithboris.com". Toolbar gating at
      // ui/reader/HighlightTextToolbar.kt:69 (`showHighlight` = signed in).
      // Publish path: ui/reader/ReaderViewModel.kt:241-308.
      id: 'highlight',
      category: 'Highlighting',
      question: 'How do I highlight a passage?',
      searchAliases: [
        'save a quote',
        'mark a sentence',
        'how do I post',
        'publish something',
        'clip text',
      ],
      answer: [
        'Select any text in the reader. A rounded pill appears over it with Copy · Highlight · TTS from here · Select all.',
        'Tap Highlight. Your signer asks you to sign, and the passage is published to nostr as an event of its own.',
        'The mark appears immediately, painted behind the words in your colour (yellow by default) at 45% opacity — the text itself is never recoloured.',
        '"Highlight" only appears in that pill when you are signed in. Signed out you still get Copy, TTS from here and Select all, and the message "Connect a signer to highlight with Boris."',
        'Everything you have marked lands in the You tab, and in the Highlights pane of each article.',
      ],
      howNostrWorks:
        'A highlight is NIP-84, kind 9802: the content is the quoted passage, and tags point at what it came from — an `r` tag for a web page, or `a`/`e`/`p` tags for a nostr long-form article and its author. Boris also stores the sentence before and after the quote in a `context` tag, so another client can show it in place rather than stranded. Because it is an ordinary event on your relays, any other client that reads kind 9802 can show your marks, and nothing about them is stuck inside Boris.',
      note: 'Boris attaches zap-split tags to the same event, so sats sent to a highlight are shared with the article’s author rather than landing entirely on you. See "What are zap splits".',
      showMe: [
        {
          target: '[data-tour="boris-reader-body"]',
          title: 'Select, and a pill appears',
          content:
            'Copy · Highlight · TTS from here · Select all, on a dark rounded bar over the selection. Highlight is the one that needs an account — the other three work signed out.',
          position: 'top',
          // Session + screen: the pair the queue exists for. `login` first,
          // because the real toolbar only offers Highlight to a signed-in
          // reader, so demonstrating it signed out would show something the
          // app does not do.
          commands: cmd({ type: 'login' }, { type: 'openArticle', payload: 'infinite-scroll' }),
        },
        {
          target: '[data-tour="boris-reader-body"]',
          title: 'And it is yours, on nostr',
          content:
            'The mark is drawn behind the words at 45% opacity, in the colour that means "mine". It is now a kind 9802 event on your relays — portable, deletable, and readable by any client that speaks the same kind.',
          position: 'top',
          // `highlight` is self-sufficient: it opens the article and marks the
          // LEAD paragraph, which sits directly under the meta chips and
          // inside the same ring, so the new mark is visible without scrolling.
          commands: cmd({ type: 'highlight' }),
        },
      ],
    },
    {
      // ui/reader/HighlightsPane.kt:120-175 — an 88%-wide sheet from the right
      // over a black-45% scrim, with three audience filters in its header.
      // Empty state strings.xml:201 "No highlights on this article yet."
      id: 'swarm',
      category: 'Highlighting',
      question: 'How do I see other people’s highlights on a page?',
      searchAliases: [
        'swarm highlights',
        'what did others mark',
        'popular passages',
        'social reading',
      ],
      answer: [
        'Tap the highlight chip under the article title — the one that reads "N highlights". It opens a full-height pane over the page.',
        'It lists every mark on that article, not only yours, each in the colour of whoever made it and each with its author and a relative time.',
        'The pane header carries three filters in those same three colours — nostrverse, friends, mine — so you can narrow it to just the people you follow.',
        'The header also has a switch that hides the marks in the article text itself, and a shortcut into the highlight settings.',
        'Where several people stopped at the same sentence, the colours pile up in the page — that is the "swarm", and it is Boris’s idea of a recommendation.',
      ],
      howNostrWorks:
        'Nobody has to have used Boris for their marks to show up here. A highlight is a public kind 9802 event tagged with the article’s URL or coordinate, so Boris just asks its relays for every event pointing at this page and paints what comes back. The "friends" layer is your own kind 3 follow list, read the same way.',
      note: 'Empty state, verbatim: "No highlights on this article yet."',
      showMe: [
        {
          target: '[data-tour="boris-pane-highlights"]',
          title: 'Everyone who stopped here',
          content:
            'Each row is one passage, painted in its author’s colour: yellow for you, orange for people you follow, purple for the rest of the nostrverse.',
          position: 'center',
          spotlightPadding: 0,
          // `openPane` opens the reader first, so this stands on its own.
          commands: cmd({ type: 'openPane', payload: 'highlights' }),
        },
      ],
    },
    {
      // ui/theme/Color.kt:22-24 for the three defaults; the swatch palette is
      // ui/settings/ReadingFonts.kt:28-35, shared by all three rows.
      id: 'highlight-colors',
      category: 'Highlighting',
      question: 'What do the yellow, orange and purple marks mean?',
      searchAliases: ['colours', 'change highlight color', 'underline instead', 'what is purple'],
      answer: [
        'They say WHOSE the highlight is, not what kind it is. Yellow (#FDE047) is yours, orange (#F97316) is someone you follow, purple (#9333EA) is anyone else on nostr.',
        'Settings → Highlights lets you change all three from the same six-swatch palette — yellow, orange, pink, green, blue, purple.',
        'The same screen switches the whole app between marker style (a rounded block behind the words) and underline style (a 2dp line under them).',
        '"Default Highlight Visibility" is three toggles below that, in nostrverse → friends → mine order, each drawn in that layer’s own current colour. Turning one off hides that layer everywhere.',
        'Teal is not one of these: it is the sentence text-to-speech is reading. Pale blue is a find-in-article match. Neither is configurable.',
      ],
      note: 'The mark is drawn behind the glyphs at 45% opacity and never recolours the text, which is why a purple mark on a dark page reads as #502479 rather than as purple.',
      showMe: [
        {
          // The three colour rows, not the preview card below them: the preview
          // is 1436px tall and starts below the fold, so a ring on it marks
          // nothing. Measured in the running sim, not assumed.
          target: '[data-tour="boris-highlight-colors"]',
          title: 'One row per layer',
          content:
            'My Highlights, Friends Highlights, Nostrverse Highlights — the same six swatches under each. Whatever you pick here is also the colour of that layer’s toggle in the row below, and of its filter in the reader’s Highlights pane.',
          position: 'top',
          commands: cmd({ type: 'openSettings', payload: 'highlights' }),
        },
      ],
    },
    {
      // ui/settings/HighlightsSection.kt — `showHighlights` is the master
      // switch (data/UserSettings.kt:6, default true); the three visibility
      // toggles sit under it, and UserSettings.visibleMine() ANDs the two.
      id: 'hide-highlights',
      category: 'Highlighting',
      question: 'How do I turn other people’s highlights off?',
      searchAliases: [
        'too many colours',
        'distracting',
        'clean page',
        'hide marks',
        'plain text',
      ],
      answer: [
        'Settings → Highlights → "Show highlights" is the master switch. Off, the article is plain text and no marks are painted at all.',
        'To keep only some of them, leave that on and use "Default Highlight Visibility" underneath: three toggles for nostrverse, friends and mine. Turn off nostrverse and you keep your own marks and your friends’.',
        'There is a faster version while you are reading: open the Highlights pane and use the eye in its header, which toggles the marks in the page without leaving the article.',
        'The pane’s three colour filters narrow what the LIST shows, which is a different thing from what the page paints.',
      ],
      note: 'Boris has no mute or block list of any kind, so this is the only filter it offers. You cannot hide one person’s highlights while keeping the rest of the nostrverse.',
      showMe: [
        {
          target: '[data-tour="boris-settings-show-highlights"]',
          title: 'The master switch',
          content:
            'One switch above the whole section. Off, nothing is painted; on, the three visibility toggles below it decide which layers you see.',
          position: 'bottom',
          commands: cmd({ type: 'openSettings', payload: 'highlights' }),
        },
      ],
    },
    {
      // ui/HighlightCardMenu.kt:103-142 for the menu; strings.xml:216-221 for
      // the delete dialog. TEXT-ONLY: gaps bor-19 and bor-22 — the ⋯ on our
      // highlight cards has no handler at all.
      id: 'delete-highlight',
      category: 'Highlighting',
      question: 'How do I delete a highlight I made?',
      searchAliases: ['undo a highlight', 'remove a mark', 'take it back', 'unpublish'],
      answer: [
        'Find the highlight — in the You tab, in Feeds, or in the article’s Highlights pane — and open the ⋯ menu on its card.',
        'The menu is Share quote · Share article · Go to quote · View profile · Open with njump · Open with Native App · Delete. Delete only appears on your own.',
        'A dialog asks to confirm, and it is honest about what it can promise: "This asks relays to remove the highlight. Some relays may keep it."',
        'Confirm and Boris tells you "Highlight deleted."',
      ],
      howNostrWorks:
        'Deleting on nostr is a request, not an operation. Your client publishes a kind 5 deletion event naming the thing you want gone, and each relay decides for itself whether to honour it. Well-behaved relays drop the event and stop serving it; others keep it, and anyone who already downloaded it still has it. Treat "delete" as "ask politely and widely", never as "erase".',
    },
    {
      // Verified absent: no reply, comment or kind-1111 code path exists in the
      // 291 Kotlin files — the only hits for "comment" are DOM selectors the
      // article extractor strips (data/ArticleExtractor.kt:96,111).
      id: 'reply',
      category: 'Highlighting',
      question: 'Can I reply to or comment on something in Boris?',
      searchAliases: ['comment', 'discussion', 'conversation', 'write a note', 'compose'],
      answer: [
        'No. Boris has no composer of any kind — no reply field, no comment box, no quote-post, and no floating compose button on any of the five tabs.',
        'The one thing you author about somebody else’s writing is a highlight, and it carries only the passage plus the sentences either side of it, never your own words.',
        'A highlight is a normal public event, so people can reply to it — just not here. Open one with njump or in your usual client from the ⋯ menu, and reply there.',
        'The article extractor actively strips comment sections out of the pages it renders, which tells you how the app thinks about this.',
      ],
      howNostrWorks:
        'Replies on nostr are ordinary notes with an `e` tag pointing at what they answer, so a thread is assembled by whoever is reading, not stored anywhere. That is why a client can publish something it has no interface for reading, and why a highlight made in Boris can collect replies in Damus or Amethyst without Boris knowing.',
    },

    // ---------------------------------------------------- Library & feeds --
    {
      // strings.xml:7-12 for the scopes, :19-20 for the signed-out pair.
      // TEXT-ONLY: gaps bor-03 (every scope filters the same set in our
      // reproduction) and bor-04 (the Info button opens settings, not the
      // sources sheet).
      id: 'library',
      category: 'Library & feeds',
      question: 'Where are my bookmarks?',
      searchAliases: [
        'saved articles',
        'reading list',
        'read later',
        'my stuff',
        'saved for later',
      ],
      answer: [
        'The Library tab — "Your Library" — the second of the five. Signed out it says "Your bookmarks / Connect, and they show up here." and offers the sign-in pair.',
        'Six scope chips across the top: All · Private · Public · Web · Lookmarks · Archive.',
        'These are nostr concepts, not folders. Private bookmarks are an encrypted list and need your signer to open — until you unlock them the screen says "Private bookmarks are encrypted. Unlock them with your signer." Public ones are a plain list anyone can read. Web is pages you saved as public web bookmarks.',
        'The Info button in the top bar opens a "Library sources" sheet that explains all five in the app’s own words.',
        'To put something in here, open it and use the Save button in the reader’s top bar — it offers "Add to private bookmarks" or "Add to public bookmarks", and turns into a filled bookmark once the article is saved.',
      ],
      note: 'Settings → Library → "Default view" picks which of the six chips Library opens on.',
      showMe: [
        {
          target: '[data-tour="boris-reader-save-menu"]',
          title: 'Private or public, decided here',
          content:
            'The save button in the reader is not a toggle — it opens this. "Add to private bookmarks" goes into an encrypted list only your signer can read; "Add to public bookmarks" goes into a plain one anybody can. Either way the button then turns into a filled bookmark.',
          position: 'bottom',
          // Self-sufficient: signs in, opens an unsaved article and parks the
          // menu open. Confirmed against the 2026-08-22 recording, t=137.5.
          commands: cmd({ type: 'saveToLibrary' }),
        },
        {
          target: '[data-tour="boris-library-scopes"]',
          title: 'Six shelves, not six folders',
          content:
            'What you just saved lands in All and in the scope you picked. Private · Public · Web · Lookmarks · Archive are nostr concepts underneath — two encrypted-or-not bookmark lists and two emoji reactions.',
          position: 'bottom',
          commands: cmd({ type: 'navigate', payload: 'library' }),
        },
      ],
    },
    {
      // nostr/Lookmarks.kt:6-8 (👀, kind 7) and nostr/Archive.kt:9-13 (📚,
      // kind 7 for nostr and kind 17 for a web URL); kinds at
      // nostr/Nip01Event.kt:61-62. Boris READS lookmarks and WRITES archives.
      id: 'lookmarks',
      category: 'Library & feeds',
      question: 'What is a lookmark, and what does the Archive do?',
      searchAliases: [
        'like',
        'react to an article',
        'eyes emoji',
        'heart button',
        'thumbs up',
        'what does 👀 mean',
      ],
      answer: [
        'A lookmark is a 👀 reaction — the app describes it as "less official than a bookmark", something you glanced at and might come back to. Boris collects yours into the Lookmarks scope in Library.',
        'The Archive is the 📚 one: articles and pages you have finished with. It has its own scope in Library, and its own colour: once an article is filed, the reader’s save icon and its Archive button both turn the same green (#22C55E) the progress bar uses at 100%.',
        'You archive from the reader: ⋮ → "Mark as read", or the Archive button at the end of the article, which reads "Move to Archive", "Move to Archive & Close" or "Archived" depending on your settings and its state.',
        'Settings → Scroll Behaviour → "Automatically move to archive at 100%" does it for you when you finish something.',
        'Settings → Home → "Hide archived articles" keeps what you have already read out of the Home rows.',
      ],
      howNostrWorks:
        'Both are NIP-25 reactions, which is the same event a "like" is in any other client: kind 7, with the emoji as the content and a tag pointing at what it reacts to. The archive has a second form — kind 17, the website reaction — because a plain web page has no event id to point at, only a URL. That is the whole trick: Boris does not invent a storage system, it picks two emoji and lets an existing kind carry the meaning.',
      note: 'Boris reads lookmarks but never creates one — there is no 👀 button anywhere in the app. The only reaction it publishes is the 📚 archive. Make lookmarks in a client that has an emoji picker and they show up here.',
    },
    {
      // ui/reader/ReaderScreen.kt:846-856 ("Mark as read", signed in and not
      // already archived) and :2286-2325 (the ArchiveButton's three states).
      // TEXT-ONLY: gaps bor-06 (no Save button rendered at all) and bor-07 (the
      // overflow rows close the menu and nothing else).
      id: 'mark-as-read',
      category: 'Library & feeds',
      question: 'How do I mark an article as read?',
      searchAliases: ['finished', 'done with this', 'clear from home', 'archive an article'],
      answer: [
        'In the reader, ⋮ → "Mark as read". The row only appears when you are signed in and the article is not already archived.',
        'There is also a button at the end of the article itself. It reads "Move to Archive", or "Move to Archive & Close" if you have that setting on, and turns green with a ✓ and the word "Archived" once it is done.',
        'Either way the article moves into Library → Archive, and the Save button in the top bar becomes a green check.',
        'On Home, long-pressing a card gives the same action alongside Share, Copy link and Open original.',
        'Reading past 95% turns the progress readout into a ✓ on its own — but that is progress, not archiving. Turn on Settings → Scroll Behaviour → "Automatically move to archive at 100%" if you want the two to be the same thing.',
      ],
      note: 'Marking as read publishes a public reaction. If you would rather not tell relays what you have finished, leave it alone and let the reading-progress percentage do the job quietly.',
    },
    {
      // ui/feed/FeedScreen.kt:204-249 and FeedScope.kt:24-31 — three
      // independent switches with a floor of one, NOT a radio group.
      // Chips from ui/ContentTabs.kt:37,128-150.
      id: 'feeds',
      category: 'Library & feeds',
      question: 'What is the Feeds tab, and how do I see what my friends highlighted?',
      searchAliases: [
        'timeline',
        'what are my friends reading',
        'discover',
        'firehose',
        'following feed',
      ],
      answer: [
        'Feeds is a stream of other people’s highlights and long-form writing — the closest thing Boris has to a timeline.',
        'Three icons in its top bar choose WHOSE: Nostrverse (a hub), Friends (two people), You (one person). Each is drawn in its own highlight colour.',
        'They are independent switches, not a picker, with a floor of one — "Nostrverse + You" is a real state. Friends and You need a login; without one they sit dimmed at 28% and say "Connect to see friends content".',
        'Under those, four chips choose WHAT: All · Highlights · Writings · RSS.',
        'The Info button beside them opens a "Feed visibility" sheet with one sentence per scope: "Highlights from anyone on nostr. The public firehose.", "Highlights from people you follow. Needs a login.", "Your own highlights. Needs a login."',
      ],
      howNostrWorks:
        '"Friends" is your kind 3 follow list, which lives on relays rather than in the app — so it is the same set of people your other clients show, and Boris does not need an account system to know who they are. The nostrverse scope is simply the same query without an author filter.',
      note: 'Settings → Feeds → "Default Feeds Scope" sets which of the three is on when you arrive. It ships with Friends on and the other two off.',
      showMe: [
        {
          target: '[data-tour="boris-feeds-scopes"]',
          title: 'Whose highlights',
          content:
            'Three switches, each in the colour of the layer it controls. Any combination works as long as one stays on — and the two that need an account are dimmed until you have one.',
          position: 'bottom',
          commands: cmd({ type: 'navigate', payload: 'feeds' }),
        },
        {
          target: '[data-tour="boris-feeds-tabs"]',
          title: 'And what kind of thing',
          content:
            'All, Highlights, Writings, RSS. Writings is nostr long-form; RSS is whatever feeds you have subscribed to, mixed into the same stream.',
          position: 'bottom',
        },
      ],
    },
    {
      // ui/settings/RssFeedsSection.kt:124-153 (field + add, OPML import via
      // GetContent) and reader chip at ReaderScreen.kt:2488-2494 + the confirm
      // dialog at :657-680. TEXT-ONLY: gap bor-30 — our field and both buttons
      // are static.
      id: 'rss',
      category: 'Library & feeds',
      question: 'How do I add an RSS feed?',
      searchAliases: ['subscribe to a blog', 'opml', 'feed reader', 'import my feeds', 'newsletter'],
      answer: [
        'Settings → Feeds → RSS feeds. Paste a URL into the "Feed URL" field and tap the + beside it.',
        'Already-subscribed feeds are listed above, each with a remove button.',
        '"Import OPML" underneath takes the subscription file any other feed reader exports, and tells you how many were added: "N feeds imported." or "No new feeds found."',
        'There is a shortcut from the reader: when a page publishes a feed, a "+ RSS" chip appears among the meta chips under the title. Tapping it asks "Add <url> to your RSS feeds?" and adds it.',
        'Items arrive in the RSS chip of the Feeds tab. Boris says what happens to them: "Articles open in Boris and can be highlighted like any web page."',
      ],
      note: 'RSS is the one part of Boris that is not nostr at all — the feeds live in your settings blob and the items are fetched over plain HTTP. They are also the reason a "web bookmark" and a "highlight" can point at something no nostr event ever mentioned.',
    },

    // ------------------------------------------------------ Finding things --
    {
      // data/LocalSearch.kt — "Local-only search over EventCache. Relay NIP-50
      // search is backlog." (:10), minimum 2 characters (:70), MAX_RESULTS 40
      // (:12), four Hit kinds (:19-62). TEXT-ONLY: gap bor-20, plus no command
      // can type a query, so a demo would ring an empty field.
      id: 'search',
      category: 'Finding things',
      question: 'How do I search?',
      searchAliases: [
        'find a person',
        'find that article again',
        'nothing comes up',
        'search does not work',
        'look something up',
      ],
      answer: [
        'The Search tab, fourth of the five. Placeholder: "Highlights, articles, bookmarks…".',
        'Results are labelled by kind — Highlight, Article, Bookmark, Person — and sorted newest first, up to 40 of them.',
        'It needs at least two characters before it does anything. Empty state, with the full stop: "No matches."',
        'People match on name and bio, and on a public key if you type at least eight characters of one.',
        'There is a second, narrower search field on a profile ("Search…") that looks only inside that person’s highlights, and a third inside an article (⋮ → Find in article).',
      ],
      howNostrWorks:
        'This is the part that surprises people: Boris searches only what it has already downloaded, not the network. Relay-side search (NIP-50) is not implemented at this version. So a name you have never encountered returns nothing — not because it is not on nostr, but because it is not yet on your phone. Scroll the feeds, open some articles, and the same query starts working.',
      note: 'That local-only design is also why search works with no signal at all.',
    },

    // -------------------------------------------------------- Value & zaps --
    {
      // Verified: there is no zap button anywhere in ui/. The single Lightning
      // surface is Support Boris — ui/support/SupportScreen.kt:368-400 and
      // nostr/LightningAddress.kt:13 build a `lightning:` URI and hand it to
      // the OS (ui/ExternalUri.kt:44 falls back to copying the address).
      id: 'zap',
      category: 'Value & zaps',
      question: 'How do I zap from Boris?',
      searchAliases: [
        'send sats',
        'tip someone',
        'lightning',
        'pay the author',
        'send someone money',
        'where is the zap button',
      ],
      answer: [
        'You do not — Boris has no zap button. Not on a highlight, not on a profile, not on an article. It is a reader, and it never asks you to spend anything.',
        'The one payment surface in the app is Support Boris (the orange heart in the top bar, or Settings → About → Support Boris), and even that is a handoff: "Open in Wallet" builds a lightning: link and lets whatever wallet you have installed take over. With no wallet it copies the address instead and says so.',
        'What Boris does about value is the other direction: every highlight you publish carries zap-split tags, so when somebody ELSE zaps your highlight in a client that can, the sats are divided between you, the article’s author and Boris.',
        'To zap a highlight you have found here, open it with njump or in your usual client from the ⋯ menu and zap it there.',
        'The Support screen also lists the people who have zapped Boris, in two tiers — Legends and Supporters — with a total. Only public zaps appear.',
      ],
      howNostrWorks:
        'A zap is a Lightning payment plus a receipt: your wallet pays an invoice fetched from the recipient’s lightning address, and the wallet provider publishes a kind 9735 receipt so clients can show a count. A client needs a wallet connection to start that, which is precisely what Boris declines to have. Its zap SPLIT tags are the other half — NIP-57’s split convention, weights on the event saying how a future zap should be divided.',
      note: 'The recipient of a split has to be a nostr pubkey with a lightning address, which is why the author’s share is skipped for ordinary web pages: there is nobody to pay.',
    },
    {
      // ui/settings/ZapSplitsSection.kt:39-42 for the presets (highlighter,
      // boris, author) and :118-125 for the Boris slider's maxValue = 10.0.
      // Tag construction: nostr/ZapSplits.kt:20-58. Defaults 50 / 2.1 / 50
      // from data/UserSettings.kt:76-79.
      id: 'zap-splits',
      category: 'Value & zaps',
      question: 'What are zap splits, and how do I change mine?',
      searchAliases: [
        'revenue share',
        'pay the author automatically',
        'who gets the sats',
        'split payments',
      ],
      answer: [
        'Settings → Zap Splits. "Add zap splits to highlights" is the master switch, on by default; turning it off collapses the rest of the screen.',
        'Four presets: Default (you 50, author 50, Boris 2.1) · Generous (5 / 75 / 10) · Selfless (1 / 80 / 19) · Boris 🧡 (10 / 10 / 80).',
        'Below them, three sliders — "Your Share", "Author’s Share", "Boris’ Share" — each with the weight and its resulting percentage. Each percentage is that weight over the sum of all three, printed to one decimal, so the default 50 / 50 / 2.1 reads 49.0% / 49.0% / 2.1% and the column adds up to 100.1.',
        'They are weights, not percentages, which is why the numbers do not have to add up to anything in particular.',
        'The note at the bottom says what happens in the awkward cases: multiple authors divide their share proportionally, and "For web content the author is unknown, so their share is skipped."',
      ],
      howNostrWorks:
        'Zap splits are NIP-57’s split convention: a published event can carry several `zap` tags, each naming a pubkey, a relay and a weight. A zapping client reads them and pays each party its proportion instead of paying the author of the event everything. Because the tags travel with the event, the split holds wherever the highlight is read — Boris is not in the loop when the money moves.',
      note: 'A quirk worth expecting: the Boris slider only goes up to 10, so choosing the "Boris 🧡" preset (weight 80) pins the thumb at the far end while the label still reads 80.0. It is not broken, it is out of the slider’s range.',
      showMe: [
        {
          target: '[data-tour="boris-zap-presets"]',
          title: 'Four opinions about who gets paid',
          content:
            'Default splits it evenly between you and the author and takes 2.1 for Boris. Generous and Selfless push it towards the author. Boris 🧡 is the one for people who want to fund the app.',
          position: 'bottom',
          commands: cmd({ type: 'openSettings', payload: 'zap-splits' }),
        },
      ],
    },
    {
      // Verified absent: no NWC, no WebLN, no built-in wallet, no balance
      // anywhere. `Profile.lud16` is read only so the Support screen can build
      // a lightning: URI (ui/support/SupportStore.kt:61).
      id: 'connect-wallet',
      category: 'Value & zaps',
      question: 'How do I connect a wallet?',
      searchAliases: [
        'nwc',
        'nostr wallet connect',
        'alby',
        'set up zaps',
        'balance',
        'where is my wallet',
      ],
      answer: [
        'There is nothing to connect. Boris has no wallet, no Nostr Wallet Connect field, no WebLN and no balance — no screen in the app asks for wallet credentials of any kind.',
        'The only place money is mentioned is Support Boris. Its "Open in Wallet" button hands a lightning: address to Android, and whichever wallet app you have installed picks it up.',
        'If no app claims it, Boris copies the address to your clipboard and tells you: "No Lightning wallet found. Address copied."',
        'Your own lightning address matters anyway — it is the one in your nostr profile, and it is what makes you payable when somebody zaps a highlight you published with a zap split.',
      ],
      howNostrWorks:
        'A lightning address (the you@example.com in your profile’s lud16 field) is just a way to fetch an invoice over HTTPS. Any client can look yours up and pay it; none of them need your permission, and none of them need a wallet connection to RECEIVE. Connecting a wallet is only ever about spending, which is why an app that never spends can skip the whole apparatus.',
    },
    {
      // ui/support/SupportHeart.kt:35,87-96 + SupportAvatars.kt:12 — a filled
      // heart tinted HighlightFriends #F97316, and when there are any, a 32dp
      // supporter avatar cycled from recent zap receipts every 21 000 ms with a
      // 1 400 ms crossfade. Tapping the avatar opens THAT person's profile.
      id: 'support',
      category: 'Value & zaps',
      question: 'What is the orange heart in the top bar?',
      searchAliases: ['who is that face', 'donate', 'thank the developer', 'that little avatar'],
      answer: [
        'It opens Support Boris — the app’s thank-you page, with "Your zaps help keep this project alive." under the title.',
        'The round face beside it is not your account. It is one of the people who have zapped Boris, cycled every 21 seconds with a slow crossfade. Tapping it opens THAT person’s profile.',
        'This is the single most misread control in the app: it looks like a sign-in avatar and it is a credit.',
        'The Support screen lists supporters in two tiers, Legends and Supporters, with totals underneath and the caveat "Only public zaps appear here."',
      ],
      note: 'The heart is #F97316 — the same orange Boris uses for your friends’ highlights. It is one of only two accent colours in the app.',
      showMe: [
        {
          target: '[data-tour="boris-support"]',
          title: 'A credit, not an account',
          content:
            'The heart opens Support Boris. The face beside it is somebody who zapped the project, and it changes on its own every 21 seconds — tap it and you land on their profile, not yours.',
          position: 'bottom',
          commands: home,
        },
      ],
    },

    // ---------------------------------------------------- Account & relays --
    {
      // The strongest answer in this bank. data/SessionStore.kt:8-16 lists
      // every key it persists: pubkey_hex, signer_package, kind, and for a
      // bunker the remote signer pubkey, its relays, an ENCRYPTED ephemeral
      // client key and an optional secret. Session.kt has no nsec field at all.
      id: 'backup-keys',
      category: 'Account & relays',
      question: 'How do I back up my key?',
      searchAliases: [
        'nsec',
        'seed phrase',
        'private key',
        'lost my phone',
        'reset my password',
        'export my key',
        'recovery',
      ],
      answer: [
        'Not from Boris — and that is the point. Boris never receives your private key, so there is nothing here to back up and no screen that could show it to you.',
        'Sign in with Amber and Boris stores your public key and the signer’s package name. Every event it wants to publish is handed to Amber to sign; back up the key inside Amber.',
        'Sign in with a bunker and Boris stores your public key, the remote signer’s public key and its relays, plus an encrypted throwaway key it uses to talk to that signer. Your identity key lives on the bunker, and that is where it is backed up.',
        'Losing the phone therefore loses nothing but a session. Install Boris elsewhere, point it at the same signer, and your highlights, bookmarks, reading positions and settings all come back off the relays.',
        'New to nostr and have no key yet? The sign-in screen points at nstart.me, which walks you through making one properly.',
      ],
      howNostrWorks:
        'Your account IS a keypair — there is no password, no email and no reset. That makes "where does the key live" the most consequential decision on nostr, and the reason external signers exist: NIP-55 (an app like Amber on the same phone) and NIP-46 (a "bunker" somewhere else) both let a client publish on your behalf without ever seeing the secret. A client that never holds the key cannot leak it, and cannot be the thing you have to trust.',
      note: 'Boris says this in its own tour: "You will never be locked out, no matter what… All the highlights, bookmarks, and reading metadata you create will always be available to you."',
    },
    {
      // ui/account/AccountScreen.kt:133-144 (the ⋮ appears only when signed in)
      // and :93-115 (the confirm dialog). AuthViewModel.signOut():118-136 also
      // sends a NIP-46 logout to the bunker and wipes SecretBox.
      id: 'logout',
      category: 'Account & relays',
      question: 'How do I sign out?',
      searchAliases: ['log out', 'disconnect', 'switch account', 'remove my account'],
      answer: [
        'Go to the You tab and open the ⋮ menu in its top bar. It only exists when you are signed in.',
        'The menu is Copy Link · Share · Open with njump · Open with Native App · Sign out — the first four act on your own npub.',
        'Sign out asks first: "Sign out?" / "You can connect again anytime." with Sign out and Cancel.',
        'Confirming clears the stored session and, on a bunker session, tells the remote signer to drop the connection as well.',
        'Everything you published stays where it was — on relays. Signing out of Boris does not delete a highlight, a bookmark or a reading position.',
      ],
      note: 'Signing out does not lock you out of the app. Home, Feeds, Search and the reader keep working exactly as before; only Library and You go back to asking.',
      showMe: [
        {
          target: '[data-tour="boris-you-menu"]',
          title: 'The one way out',
          content:
            'You → ⋮. This menu is the only place in Boris where a session can end, and the only place your own npub is on screen. It exists only while you are signed in.',
          position: 'bottom',
          commands: cmd({ type: 'accountMenu' }),
        },
      ],
    },
    {
      // data/SessionStore.kt:19-31 — load() reads ONE session out of one
      // SharedPreferences file; Session is a sealed interface with no list and
      // no active-account index. Verified, not inferred.
      id: 'multi-account',
      category: 'Account & relays',
      question: 'Can I use more than one account?',
      searchAliases: [
        'two accounts',
        'alt',
        'work and personal',
        'account switcher',
        'add another profile',
      ],
      answer: [
        'Not at once. Boris holds a single session — one public key, one signer — and there is no account list, no switcher and no "add account" anywhere in the app.',
        'To change accounts: You tab → ⋮ → Sign out, then connect the other one.',
        'Nothing is lost in the swap, because nothing is stored locally that matters. Highlights, bookmarks, reading positions and settings are all fetched back off the relays for whichever key you connect.',
        'If your signer holds several keys, Amber will ask which one it is granting on each fresh connection.',
      ],
      note: 'The practical consequence is a slower switch than in Amethyst or YakiHonne, but a cleaner one: there is no per-account state on the phone to get out of sync.',
    },
    {
      // ui/settings/RelaysSection.kt — read-only by construction. Sections at
      // :106-108, rows at :212-268, REFRESH_MS = 15_000 at :66. The list itself
      // is your NIP-65 event (nostr/RelayList.kt:17-40), with RelayList.FALLBACK
      // (:8-13) when there is none. Local slot is LocalRelays.CITRINE (:6).
      id: 'manage-relays',
      category: 'Account & relays',
      question: 'How do I add or change relays?',
      searchAliases: [
        'add a relay',
        'relay list',
        'nothing is loading',
        'where does my data go',
        'citrine',
        'local relay',
      ],
      answer: [
        'Settings → Relays shows you the list, but it does not let you edit it — there is no add field and no remove button on this screen.',
        'Three groups in order, and an empty group renders nothing at all: Read, Write, Local. A relay that does both appears in both.',
        'Each row is the URL in monospace with the scheme stripped, a green check when connected or a red no-wifi icon when not, and — only when it is not connected — a clock with how long ago it last answered. That badge is last-seen, not latency.',
        'Some rows carry a sub-label, "N of your follows write here", which is Boris telling you why a relay you never chose is in your read set.',
        'Status re-checks itself every 15 seconds while the screen is open. "Relays Boris reads from and publishes to. Status is checked while this screen is open."',
        'To actually change the list, edit your relay list in another client. Boris reads it back the next time it looks.',
      ],
      howNostrWorks:
        'Your relay list is itself a nostr event — kind 10002, NIP-65 — with one entry per relay marked read, write or both. Every client reads the same event, so "your relays" follow the key rather than the app, and a client can honestly offer no editor at all. When Boris cannot find one it falls back to four public relays so a brand-new account still sees something.',
      note: 'The Local section is the exception: Settings → Airplane mode → "Use local relays as cache" adds Citrine, a relay running on the phone itself at ws://127.0.0.1:4869. Its row shows as localhost:4869 and wears a plane icon instead of the check, and the Airplane mode screen tells you live whether Citrine is running.',
      showMe: [
        {
          target: '[data-tour="boris-relays-list"]',
          title: 'A status board, not an editor',
          content:
            'Read, then Write, then Local. Green means connected right now; the list itself comes from your NIP-65 relay list, which you edit in whichever client does have an editor.',
          position: 'top',
          commands: cmd({ type: 'openSettings', payload: 'relays' }),
        },
      ],
    },
    {
      // Verified: no follow/unfollow action exists. The contact list is READ
      // only — nostr/RelayQuery.kt:140-141 cachedContactPubkeys() feeds the
      // "friends" highlight layer and the relay coverage counts.
      id: 'follow',
      category: 'Account & relays',
      question: 'How do I follow someone?',
      searchAliases: [
        'follow button',
        'add to my contacts',
        'unfollow',
        'friends list',
        'who am I following',
      ],
      answer: [
        'You cannot, in Boris. There is no Follow button on a profile, on a highlight card or anywhere else — the app reads your follow list and never writes to it.',
        'It uses that list for two things: deciding which highlights are "friends" and get the orange colour, and working out which relays the people you follow publish to.',
        'To follow someone whose highlight you liked here, open their profile’s ⋯ menu and use "Open with njump" or "Open with Native App", then follow them in the client that opens.',
        'A profile in Boris shows a bordered header card — picture, display name, about clipped to two lines — then four chips: Highlights · Writings · Public · Web, and a search field over their highlights.',
      ],
      howNostrWorks:
        'Your follow list is a kind 3 event on your relays, so it is shared by every client you use. Boris subscribing to it without offering to edit it is the same pattern as its relay screen: read what the protocol already stores, leave the editing to apps whose job that is.',
    },
    {
      // data/OfflineStore.kt:46-61 (CacheLimit, OPTIONS_MB, DEFAULT_MB 1024) and
      // :66-79 (CacheUsage over four directories). The limit is read at launch —
      // BorisApplication.kt:26 and MainActivity.kt:73 — which is why the note
      // says "Takes effect on the next launch". TEXT-ONLY: gap bor-31, our five
      // limit chips are spans.
      id: 'clear-cache',
      category: 'Account & relays',
      question: 'Boris is taking up space — how do I clear it?',
      searchAliases: [
        'storage full',
        'free up space',
        'app is huge',
        'delete downloads',
        'clear data',
      ],
      answer: [
        'There is no "clear cache" button in Boris. What it gives you instead is a cap: Settings → Airplane mode → "Storage limit", with 210 MB / 512 MB / 1 GB / 2 GB / 5 GB. It ships at 1 GB.',
        'Above the row it prints what you are actually using, so you can see whether the cap is anywhere near binding.',
        'The note under it matters: "Applies to the article and image caches. Takes effect on the next launch." Lowering the limit does nothing until you close and reopen the app; after that the caches evict themselves down to it.',
        'You can also shrink what gets downloaded in the first place, with the five shelf switches on that same screen — Bookmarks, Web Bookmarks, Lookmarks, Archive, Highlights.',
        'To wipe it outright, use Android’s own App info → Storage → Clear cache.',
      ],
      howNostrWorks:
        'Nothing in that cache is irreplaceable. A nostr client’s local store is a copy of events that live on relays — your highlights, your bookmarks, other people’s marks on the pages you read — so clearing it costs you a re-download, not data. The two things worth keeping are outside it anyway: your key (which is in your signer, not in Boris) and anything created offline that has not been rebroadcast yet.',
      note: 'In Android’s App info, "Clear storage" sits right beside "Clear cache" and is not the same thing — it drops your session too, so you have to connect the signer again.',
    },
    {
      // The ONLY notification Boris posts is the TTS media-session one:
      // tts/TtsPlaybackService.kt, channel name strings.xml:445 "Playback",
      // and the POST_NOTIFICATIONS permission is requested once on first play
      // (ui/reader/ReaderScreen.kt:473-474,498-501) and never blocks playback.
      id: 'notifications',
      category: 'Account & relays',
      question: 'Why doesn’t Boris notify me about anything?',
      searchAliases: [
        'no notifications',
        'alerts',
        'push',
        'someone replied',
        'notification settings',
      ],
      answer: [
        'Because it has nothing to notify you about. There is no notifications tab, no badge and no bell — Boris never tells you that somebody highlighted your highlight or followed you.',
        'It posts exactly one notification, and it is not social: a "Playback" media notification while text-to-speech is running, with the transport controls in it.',
        'Android asks for notification permission the first time you press play. Declining it does not stop playback; you just lose the shade controls.',
        'For replies, mentions and follows, use a social client alongside Boris. Your highlights are ordinary events, so the interactions land there.',
      ],
      note: 'Nothing in Boris pings a server on your behalf while it is closed, which is the flip side of having no notifications: no background sync, no push service, no account with anybody.',
    },
    {
      // nostr/Nip78.kt:8-9 — kind 30078, d = "com.dergigi.boris.user-settings".
      // Load/publish path: data/SettingsSync.kt. Failure strings at
      // strings.xml:321-323.
      id: 'settings-sync',
      category: 'Account & relays',
      question: 'Why did my settings follow me to another device?',
      searchAliases: [
        'sync settings',
        'my colours changed',
        'web app and phone',
        'settings were not signed',
      ],
      answer: [
        'Because Boris stores them on nostr rather than on the phone. Your theme, fonts, highlight colours, zap splits, RSS feeds and Home section order all live in one event under your account.',
        'Sign in on read.withboris.com or on a second phone with the same key and the same setup arrives with you.',
        'Saving them needs your signer, which is why a rejected or cancelled signature produces "Settings were not signed." or "Settings save cancelled." and the change stays local.',
        'Sign out and the app drops straight back to its own defaults: system theme, Midnight and Sepia, Source Serif at 21sp, justified.',
      ],
      howNostrWorks:
        'This is NIP-78 — kind 30078, an addressable "application data" event keyed by an identifier the app picks for itself. It is the standard way a nostr app keeps per-user configuration without a backend: the relays store an opaque blob, and only clients that know the identifier care about it. Anything you can configure is therefore public unless the app encrypts it, so Boris keeps nothing sensitive in there.',
      note: 'The one setting that is NOT in it is the storage limit, which is device-local — a 5 GB cap on a tablet should not become a 5 GB cap on a phone.',
    },

    // ------------------------------------------------------ Troubleshooting --
    {
      id: 'trouble-startup',
      category: 'Troubleshooting',
      question: 'Boris hangs on a loading message when I open it — what can I do?',
      searchAliases: ['stuck on connecting', 'wont open', 'frozen', 'blank home screen'],
      answer: [
        'Home shows a rotating status while it fills up — "Connecting…", "Fetching from relays…", "Finding highlights…", "Grabbing bookmarks…", "Looking for articles…", "Almost there…". Sitting on one of those means relays are not answering.',
        'Check Settings → Relays. Every row carries a live green check or a red no-wifi icon, and it re-probes every 15 seconds while you are looking at it. All red is a network problem, not a Boris problem.',
        'A signed-out Boris still fills Home from public relays, so if signing out makes it work, the problem is with fetching your own data rather than with the connection.',
        'Turn on Settings → Airplane mode → "Use local relays as cache" and install Citrine if you want the app to be readable regardless — a local relay answers instantly and never times out.',
        'There is no crash reporter, no console and no reconnect button. Force-stopping and reopening is the whole retry story.',
      ],
      howNostrWorks:
        'There is no server that can be "down", so a hang is almost always a client waiting on relays. At launch a client opens a socket to each relay in your list and asks for your own data first — profile, follow list, relay list — and cannot build much until those arrive. Unreachable hosts, relays that require authentication you have not given, and TLS or DNS failures all look identical from inside the app: nothing arrives. Your events are unaffected; they are sitting on whichever relays do answer.',
      note: 'If Android’s App info tempts you: "Clear cache" is safe and costs you a re-download. "Clear storage" also drops the session, so you reconnect the signer afterwards — but it still cannot lose your key, because Boris never had it.',
    },
    {
      id: 'trouble-not-delivered',
      category: 'Troubleshooting',
      question: 'I published a highlight but nobody else can see it',
      searchAliases: [
        'my highlight is not showing up',
        'did it publish',
        'nobody sees my marks',
        'not synced',
      ],
      answer: [
        'First check it exists: the You tab lists your own highlights, and the article’s Highlights pane shows it in your colour. If it is there, it was signed.',
        'Then check where it went. Settings → Relays → the Write group is the set Boris publishes to. If those rows are red, the event has not left the phone yet.',
        'Boris queues events created offline and rebroadcasts them when you are back online, so a highlight made in a tunnel can be minutes or hours behind you.',
        'If the Write group is short or full of relays you do not recognise, your relay list is the problem — edit it in a client that has an editor and Boris will pick the change up.',
        'Someone reading your highlight in another client also has to be asking a relay you wrote to. Two people with disjoint relay sets simply do not see each other.',
      ],
      howNostrWorks:
        'Publishing means sending a signed event to each relay you write to, and each of them decides independently whether to keep it — some rate-limit, some accept only from paying members, some require authentication first. There is no acknowledgement you can rely on and no central copy, so "published" really means "accepted by at least one relay somebody else reads". Being on more relays is the entire mitigation.',
      note: 'A highlight on a plain web page is tagged with the page’s URL. If the article you marked is served from a slightly different URL somewhere else — tracking parameters, www, http — the marks may not line up for the other reader.',
    },
    {
      id: 'trouble-zap-failed',
      category: 'Troubleshooting',
      question: 'I zapped a highlight and the author got nothing',
      searchAliases: ['zap did not arrive', 'split not working', 'author was not paid', 'sats lost'],
      answer: [
        'The zap did not happen in Boris — it has no zap button — so start from the client you actually sent it in.',
        'For a highlight made in Boris, the split is on the event: you, the article’s author and Boris, by whatever weights the highlighter had set. A zapping client that ignores split tags pays the highlighter everything, and that is its choice, not a Boris failure.',
        'For a plain web page there is often no author share at all. Boris says so on the settings screen: "For web content the author is unknown, so their share is skipped." A web page has no pubkey to pay.',
        'A split recipient with no lightning address in their profile cannot be paid either — their portion is simply not sent.',
        'If the highlighter turned "Add zap splits to highlights" off before publishing, the event carries no split tags and everything goes to them.',
      ],
      howNostrWorks:
        'A zap is two separate things: a Lightning payment, and a kind 9735 receipt published by the recipient’s wallet provider so clients can count it. Either half can fail on its own — the sats can arrive while the receipt never gets published, which looks exactly like a failed zap in every client that counts receipts. Splits add a third variable, because honouring them is the sending client’s job and not every client does.',
      note: 'Boris’ own share is capped low by design and its slider only goes to 10, so a highlight cannot quietly be routing most of a zap to the app unless the highlighter deliberately chose the "Boris 🧡" preset.',
    },
    {
      id: 'trouble-read-only',
      category: 'Troubleshooting',
      question: 'The Highlight button is missing when I select text',
      searchAliases: [
        'cannot highlight',
        'button greyed out',
        'read only',
        'why can I only copy',
        'signer not responding',
      ],
      answer: [
        'The selection pill only offers Highlight when you are signed in. Signed out you get Copy, TTS from here and Select all, and the message "Connect a signer to highlight with Boris."',
        'Check the You tab. If it shows "Your highlights" and the two sign-in buttons, you are signed out — the session may have been cleared, or a bunker connection may have dropped.',
        'If you are signed in and the tap does nothing, the signer is the suspect. Amber declining gives "Amber declined the request."; closing it without answering gives "Amber did not return a key."',
        'On a bunker, four distinct failures each say so: "That bunker link is not valid.", "The bunker did not respond in time.", "The bunker declined the request.", "The bunker did not return a public key."',
        'Amber not installed at all shows a card with three install links — Zapstore, F-Droid and GitHub — rather than a dead button.',
      ],
      howNostrWorks:
        'Boris cannot sign anything itself; it builds an unsigned event and asks a signer to sign it. NIP-55 does that through an app on the same phone, NIP-46 through a remote one over relays. So "cannot post" here is never about permissions on an account — it is either no signer connected, or a signer that did not answer. The remote case has a network in the middle, which is why a bunker can time out where Amber cannot.',
      note: 'Boris has no read-only npub mode at all. Unlike most clients on this shelf there is no key field to paste an npub into — you are either connected to a signer or signed out, and signed out is a fully usable reader.',
    },
    {
      id: 'trouble-images',
      category: 'Troubleshooting',
      question: 'Images in an article are missing or broken',
      searchAliases: ['no pictures', 'images not loading', 'cover missing', 'blank thumbnails'],
      answer: [
        'Boris renders what its extractor found in the page. If a site loads its images with JavaScript after the fact, there is nothing in the HTML to extract and the article arrives text-only.',
        'Cards with no cover are not broken: a coverless article deliberately gets a glyph instead, tinted with its Home row’s colour — a page icon for a web page, a note icon for a nostr note.',
        'Check the network first. Images are fetched from the original host, not from a relay, so a host that is down or blocking takes them with it.',
        'If images used to be there and are not now, your storage cap may be evicting them: Settings → Airplane mode shows what you are using against the limit.',
        'Settings → Media → "Full-width images in articles" changes how they are laid out, never whether they load.',
        'To see the page as its author built it, ⋮ → "Open in browser", or try Wayback Machine or archive.ph from the same menu.',
      ],
      howNostrWorks:
        'Relays carry text, not files. Even for a nostr long-form article the images are ordinary URLs pointing at somebody’s web host, so a broken image is a broken web link and the protocol has nothing to do with it. That is also why an article can be perfectly readable offline while its pictures are not: the text was cached as an event, the pictures were cached as HTTP responses.',
    },
    {
      id: 'trouble-notifications',
      category: 'Troubleshooting',
      question: 'I get no alerts from Boris — did I turn something off?',
      searchAliases: [
        'notifications stopped',
        'no badge',
        'missing alerts',
        'why is it silent',
        'playback notification',
      ],
      answer: [
        'No. Boris has no social notifications to turn off — no notifications tab, no badges, no bell, and nothing in Settings that enables them.',
        'The one notification it can post is the media control while text-to-speech plays, on a channel called "Playback".',
        'If that one is missing, Android denied the permission. It is asked for once, on your first play, and declining never stops playback — you just lose the shade controls. Re-enable it in Android’s App info → Notifications.',
        'For replies, mentions, zaps and follows, run a social client alongside Boris. Everything you publish here is an ordinary event, so the interactions arrive there.',
      ],
      howNostrWorks:
        'Nostr has no push infrastructure. A client learns that something happened by keeping a subscription open to relays and watching for events that tag you — which needs the app running, or a push service you have trusted with your data. Clients that do notify you have all made one of those trades. Boris makes neither, which is why it is silent and why it never phones anything home while it is closed.',
    },
    {
      id: 'trouble-empty-profile',
      category: 'Troubleshooting',
      question: 'I signed in and my highlights and bookmarks are missing',
      searchAliases: [
        'empty library',
        'lost my highlights',
        'my stuff is gone',
        'no bookmarks after login',
        'wrong account',
      ],
      answer: [
        'Check the key first. The You tab’s ⋮ → Copy Link gives you the npub Boris is signed in as; if your signer holds several keys, it is easy to have granted the wrong one.',
        'Give it a moment. Everything on those screens is fetched from relays after sign-in, and a slow or short relay list makes both look empty before it makes them look full.',
        'Library → Private will stay locked until you unlock it: "Private bookmarks are encrypted. Unlock them with your signer." Tap Unlock and approve in the signer. A cancelled unlock says so.',
        'Settings → Relays → Read is what Boris is asking. If your bookmarks were published to a relay that is not in that group, they will not appear — fix the relay list in a client that has an editor.',
        'Nothing was deleted. Highlights, bookmarks and archives are events on relays; an empty screen in Boris means it has not fetched them, not that they are gone.',
      ],
      howNostrWorks:
        'A nostr profile is not stored in the app: it is a set of events under your public key, scattered across whichever relays each was published to. So a client shows you the intersection of what it asked for and what answered — and an "empty account" is nearly always a relay mismatch, a still-loading subscription, or a different key than you expected. The fix is on the relay side, never in the client’s local storage.',
      note: 'Private bookmarks are encrypted to yourself, so they need a decryption round-trip through the signer that public ones do not. A signer that will not decrypt makes exactly one scope look empty while the rest work.',
    },
  ],
};

export default borisFaq;
