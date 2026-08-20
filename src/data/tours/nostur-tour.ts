/**
 * Nostur Simulator Tour
 * Tour drives the simulator — the user clicks Next, the tour navigates the sim.
 * 9 steps, index-mapped to state commands in NosturSimulatorWithTour.
 */

import type { TourConfig, TourStep } from '../../components/tour';

const nosturTourSteps: TourStep[] = [
  {
    id: 'nostur-welcome',
    target: '.nostur-simulator',
    title: 'Welcome to Nostur',
    content:
      'Nostur is a native SwiftUI Nostr client for iPhone, iPad and macOS — teal on pure black, ten built-in themes and an unusually deep settings tree. Let us take a look around.',
    position: 'center',
    spotlightPadding: 0,
  },
  {
    id: 'nostur-signin',
    target: '[data-tour="nostur-create-account"], .nostur-simulator',
    title: 'Sign in',
    content:
      'Create a key, paste one you already have, or take the guest account for a spin first. (Here everything is simulated with mock keys — never paste a real nsec into a site you are only trying out.)',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 12,
  },
  {
    id: 'nostur-feed',
    target: '[data-tour="nostur-feedtabs"]',
    title: 'Three feeds, one rule',
    content:
      'Following, Discover and Explore. Watch the labels: every tab stays teal whether it is selected or not — only the hairline underneath moves. Nostur grows more tabs (Zapped, Hot, Gallery, Live Streams…) once you follow more than ten people.',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'nostur-lowdata',
    target: '[data-tour="nostur-lowdata"]',
    title: 'The turtle',
    content:
      'Low Data Mode lives behind a tortoise in the toolbar — dimmed to 30% when it is off. Tap it and media stops downloading: every image turns into a "Loading paused" block with a Load anyway link.',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 10,
  },
  {
    id: 'nostur-actions',
    target: '[data-tour="nostur-actionbar"]',
    title: 'Five actions',
    content:
      'Reply, repost, react, zap, bookmark — spread across the full width and teal until you use one. Then exactly one icon takes a colour: a red heart, a green repost, a yellow bolt, an orange bookmark. The zap is dimmed when the author has no Lightning address.',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'nostur-zap',
    // The 16-coin grid, not the whole zap sheet.
    target: '[data-tour="nostur-zap-amounts"], [data-tour="nostur-zapsheet"]',
    title: 'Send sats',
    content:
      'Sixteen orange coins from 3 sats to a million, with 21 preselected. Add a public note, or send the zap privately or anonymously.',
    position: 'center',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'nostur-drawer',
    // The drawer's row list rather than the whole drawer.
    target: '[data-tour="nostur-drawer-rows"], [data-tour="nostur-sidebar"]',
    title: 'The side menu',
    content:
      'Your account avatar opens it: Profile, Lists & Feeds, Bookmarks, Badges, Settings, Block list, Signer. The footer prints the exact build and links straight to the source — Nostur is GPL-3.0.',
    position: 'right',
    allowClickThrough: true,
    spotlightPadding: 6,
  },
  {
    id: 'nostur-settings',
    // The Relay Connections + Spam Filtering group, not the settings root.
    target: '[data-tour="nostur-settings-relays"], [data-tour="nostur-settings"]',
    title: 'Settings go deep',
    content:
      'Relay Connections with Autopilot and VPN detection, a Web-of-Trust spam filter with its own "Nostr Dunbar Number", default zap amounts, and an appearance panel that lets you rearrange the action row itself.',
    position: 'center',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'nostur-complete',
    target: '.nostur-simulator',
    title: "That's Nostur!",
    content:
      'You have seen the feed, the action row, zaps and the settings tree. Your keys work everywhere on Nostr — when you are ready, get the real Nostur from nostur.com or the iOS App Store.',
    position: 'center',
    spotlightPadding: 0,
  },
];

export const nosturTourConfig: TourConfig = {
  id: 'nostur-tour',
  name: 'Nostur Simulator Tour',
  steps: nosturTourSteps,
  storageKey: 'nostr-tour-nostur',
};

export default nosturTourConfig;
