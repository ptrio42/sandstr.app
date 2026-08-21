/**
 * Boris Simulator Tour
 *
 * 11 steps, index-mapped to state commands in BorisSimulatorWithTour.
 *
 * The spine of this tour is one gesture no other client here has: select a
 * sentence, tap Highlight, and then see that you were not the only one who
 * stopped there. Everything else — the feed of other people's highlights,
 * listening, reading offline — hangs off that. So the middle four steps stay
 * inside a single article rather than touring the tab bar.
 *
 * Two rules from docs/TOURS.md are doing visible work here:
 *  - selector alternatives resolve in AUTHOR order, so the broad
 *    `.boris-simulator` fallback only ever appears last, and only on steps
 *    where "the whole client" is genuinely the subject;
 *  - the command queue carries exactly TWO commands, so no step sends three.
 *    Most send one, because every command in `SimulatorCommand` was written to
 *    be self-sufficient (`highlight` opens its own article; `openPane` opens
 *    the reader first). The two that send a pair both do it for the same
 *    reason: they need a KNOWN session state, not just a screen.
 */

import type { TourConfig, TourStep } from '../../components/tour';

const borisTourSteps: TourStep[] = [
  {
    id: 'boris-welcome',
    target: '.boris-simulator',
    title: 'Welcome to Boris',
    content:
      'Boris is a nostr-native reader: bookmark a link, read it without the clutter, and mark the sentences worth keeping. No ads, no trackers, no paywalls — and no account needed to start. Let us take a look around.',
    position: 'center',
    spotlightPadding: 0,
  },
  {
    id: 'boris-home',
    target: '[data-tour="boris-home-others"]',
    title: 'A home made of other people’s marks',
    content:
      'Home is rows of articles, and most of them are chosen by highlights rather than by an algorithm — what you marked, what your friends marked, what the wider nostrverse marked this week. The colour of each row’s pen says whose highlights built it.',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    // Placed BEFORE the reader on purpose. Highlighting is the one thing in
    // Boris that needs an account (`showHighlight = loggedIn`,
    // HighlightTextToolbar.kt:69), so the tour has to answer "do I need to sign
    // in?" before it asks the visitor to mark a sentence — and the app already
    // answers it, in its own words, in this dismissible card.
    id: 'boris-connect',
    target: '[data-tour="boris-connect"]',
    title: 'Connecting is optional',
    content:
      'Everything you have seen so far works signed out — Home, the feeds, search and the whole reader. An account only adds your side of it: publishing your own highlights, and a library of bookmarks. Boris never holds your key; Amber signs on your behalf, or a remote bunker does.',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'boris-card',
    target: '[data-tour="boris-home-card"]',
    title: 'One card, one article',
    content:
      'Cover, title, and the site it came from. Once you have opened something, a thin bar under the card tracks how far in you are — and turns green when you finish it.',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 10,
  },
  {
    id: 'boris-reader',
    target: '[data-tour="boris-reader-meta"]',
    title: 'The article, and what Boris knows about it',
    content:
      'A web page arrives stripped to its text, set in Source Serif and justified. The chips under the title are the facts worth having before you commit: where it came from, how long it takes, how many people have highlighted it, when it was published.',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'boris-highlight',
    target: '[data-tour="boris-reader-body"]',
    title: 'Highlighting is the whole point',
    content:
      'Select any sentence and a small bar offers Copy, Highlight, Read from here. Highlight publishes the passage to nostr as its own event — so your marks are yours, portable, and readable by any other client that speaks the same kind. Boris also attaches a zap split as it goes, so anything the highlight earns is shared with the author.',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 10,
  },
  {
    id: 'boris-swarm',
    target: '[data-tour="boris-pane-highlights"]',
    title: 'Swarm highlights',
    content:
      'Tap the highlight chip and you get every mark on this page, not just yours — yellow for you, orange for people you follow, purple for everyone else. Where the colours pile up is where a page is actually worth reading.',
    position: 'center',
    allowClickThrough: true,
    spotlightPadding: 0,
  },
  {
    id: 'boris-listen',
    target: '[data-tour="boris-tts-player"]',
    title: 'Or listen to it',
    content:
      'Boris reads articles aloud with the phone’s own voices, at up to 3×, and follows along in the text as it speaks — the teal mark is the sentence being read. The player stays with you if you leave the article.',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'boris-feeds',
    target: '[data-tour="boris-feeds-scopes"]',
    title: 'Feeds, scoped by who',
    content:
      'The Feeds tab is a stream of highlights and long-form writing. These three toggles choose whose: the whole nostrverse, people you follow, or just you. They are switches, not a picker — you can have two on at once.',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 10,
  },
  {
    // Aims at the Airplane-mode SCREEN, not at its row in the settings list.
    // The row is twelfth: filming the tour showed the ring landing below the
    // fold, drawn half-off the phone over the mini player, with nothing legible
    // inside it. A step whose subject needs scrolling to see has the wrong target.
    id: 'boris-offline',
    target: '[data-tour="boris-offline-shelves"]',
    title: 'Made to work with no signal',
    content:
      'Boris downloads your library ahead of time, shelf by shelf — bookmarks, lookmarks, the archive, the highlights — so a tunnel or a flight changes nothing. You can read, highlight and browse offline, and it syncs when you are back.',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'boris-complete',
    target: '.boris-simulator',
    title: 'That’s Boris!',
    content:
      'You have marked a sentence, seen other people’s marks on the same page, and heard it read aloud. Your highlights live on nostr, so they are not stuck here — when you are ready, get the real Boris from readwithboris.com.',
    position: 'center',
    spotlightPadding: 0,
  },
];

export const borisTourConfig: TourConfig = {
  id: 'boris-tour',
  name: 'Boris Simulator Tour',
  steps: borisTourSteps,
  storageKey: 'nostr-tour-boris',
};

export default borisTourConfig;
