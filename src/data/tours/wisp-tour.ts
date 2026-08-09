/**
 * Wisp Simulator Tour
 * Tour drives the simulator — the user clicks Next, the tour navigates the sim.
 * 10 steps, index-mapped to state commands in WispSimulatorWithTour.
 */

import type { TourConfig, TourStep } from '../../components/tour';

const wispTourSteps: TourStep[] = [
  {
    id: 'wisp-welcome',
    target: '.wisp-simulator',
    title: 'Welcome to Wisp',
    content:
      'Wisp is "a wee interface to scroll posts" — a minimal, fast Android Nostr client by Barry Deen, built around the outbox relay model, an embedded Lightning wallet and an orange-on-black look. Let us take a look around.',
    position: 'center',
    spotlightPadding: 0,
  },
  {
    id: 'wisp-login',
    target: '[data-tour="wisp-login"], .wisp-simulator',
    title: 'Sign in',
    content:
      'The splash screen shows a live wall of people online right now. Continue with a Nostr key — or with Google, which creates a key for you and backs it up to your Drive. Your key never leaves the device. (Here everything is simulated with mock keys.)',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 12,
  },
  {
    id: 'wisp-feed',
    // The top post card, not the whole feed root.
    target: '[data-tour="wisp-post-card"], [data-tour="wisp-feed"]',
    title: 'Your feed',
    content:
      'Flat, dense cards on near-black. The pills up top show how many people are online and how many relays you are connected to — Wisp dials relays per author (the outbox model), so the number is big on purpose.',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'wisp-selector',
    target: '[data-tour="wisp-selector"]',
    title: 'Pick a feed',
    content:
      'Feeds switch from this dropdown pill — For You, Follows, Extended (friends-of-friends via your computed social graph), Trending, a single Relay, a List, or Hashtags.',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 10,
  },
  {
    id: 'wisp-compose',
    target: '[data-tour="wisp-compose"]',
    title: 'New post',
    content: 'The orange pencil opens the composer. Notes can carry media, polls, a content warning — and proof-of-work, which Wisp mines by default as a spam deterrent.',
    position: 'left',
    allowClickThrough: true,
    spotlightPadding: 12,
  },
  {
    id: 'wisp-post',
    target: '[data-tour="wisp-post"]',
    title: 'Publish — with an undo',
    content:
      'Wisp holds every new post for a few seconds: the pill drains while "Post now (N)" counts down, and the red X cancels. Tap the pill to send immediately.',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 12,
  },
  {
    id: 'wisp-profile',
    target: '[data-tour="wisp-profile"], .wisp-simulator',
    title: 'Profiles',
    content:
      'Banner, NIP-05 check, lightning address and a follower count that reads "∞" until it is actually known. Long-press any profile picture in the real app to follow instantly.',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'wisp-wallet',
    // The Send/Receive row rather than the whole wallet screen.
    target: '[data-tour="wisp-wallet-actions"], [data-tour="wisp-wallet"]',
    title: 'Built-in wallet',
    content:
      'A non-custodial Spark wallet via the Breez SDK, secured by your Nostr key — balance in sats, a Lightning address, and one-tap Send/Receive. Wisp never holds user funds.',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'wisp-settings',
    // Was `.wisp-simulator` — the whole client. Index 8 runs `{ openSettings }`,
    // which lands on the Interface screen, so aim at the themes row the copy
    // opens with. The Interface screen stays as a fallback, but it is itself
    // full-height, hence a last resort rather than the target.
    target: '[data-tour="wisp-set-themes"], [data-tour="wisp-set-interface"]',
    title: 'Interface & the long tail',
    content:
      'Settings expand inline in the drawer: 15 color themes, an accent picker, proof-of-work difficulty, an on-device spam filter, relay health with outbox coverage — and a social-graph visualizer.',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'wisp-complete',
    target: '.wisp-simulator',
    title: "That's Wisp!",
    content:
      'You have seen the feed, zaps, the undo countdown and the wallet. Your keys work everywhere on Nostr — when you are ready, get the real Wisp for Android from wisp.mobile.',
    position: 'center',
    spotlightPadding: 0,
  },
];

export const wispTourConfig: TourConfig = {
  id: 'wisp-tour',
  name: 'Wisp Simulator Tour',
  steps: wispTourSteps,
  storageKey: 'nostr-tour-wisp',
};

export default wispTourConfig;
