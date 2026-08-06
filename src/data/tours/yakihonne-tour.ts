/**
 * YakiHonne Simulator Tour
 * Tour drives the simulator - user clicks Next, tour navigates the sim.
 * 10 steps — index-mapped to state commands in YakiHonneSimulatorWithTour.
 */

import type { TourConfig, TourStep } from '../../components/tour';

const yakihonneTourSteps: TourStep[] = [
  {
    id: 'yakihonne-welcome',
    target: '.yakihonne-simulator',
    title: 'Welcome to YakiHonne',
    content: 'YakiHonne is a mobile-first Nostr client built around long-form articles, curations, videos and a built-in Lightning wallet — with its signature orange accent. Let us take a look around.',
    position: 'center',
    spotlightPadding: 0,
  },
  {
    id: 'yakihonne-login',
    target: '.yakihonne-login, [data-tour="yakihonne-keys"]',
    title: 'Sign in',
    content: 'Log in with your Nostr keys, a remote signer, or continue as a guest. Your key is your identity — it works across every Nostr app. (Here it is fully simulated with mock keys.)',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 16,
  },
  {
    id: 'yakihonne-home',
    target: '.yakihonne-feed, [data-tour="yakihonne-feed"]',
    title: 'Your feed',
    content: 'The home timeline. Tap the feed selector up top to switch between Recent, Trending, Global and more — Trending surfaces long-form articles with read-times and cover images.',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'yakihonne-compose',
    target: '.yakihonne-compose, [data-tour="yakihonne-compose"]',
    title: 'Compose a note',
    content: 'The orange button opens the compose sheet. Attach media, GIFs, mentions and smart widgets, or schedule your note for later.',
    position: 'left',
    allowClickThrough: true,
    spotlightPadding: 12,
  },
  {
    id: 'yakihonne-post',
    target: '.yakihonne-post-btn, [data-tour="yakihonne-post"]',
    title: 'Publish',
    content: 'Hit send and your note is signed and broadcast to your relays. On Nostr, once published it lives on the network — no central server to delete it.',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 12,
  },
  {
    id: 'yakihonne-profile',
    // The profile SCREEN, which this step's viewProfile command opens. The old
    // target resolved to the app-bar avatar — same name, earlier in the DOM,
    // and by then hidden behind the profile overlay.
    target: '[data-tour="yakihonne-profile-screen"]',
    title: 'Your profile',
    content: 'Your profile has a NOSTR banner, NIP-05 verification, and tabs for Notes, Articles, Media and more. The account drawer also opens your Yaki-chest dashboard and Relay orbits.',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 16,
  },
  {
    id: 'yakihonne-follow',
    target: '.yakihonne-follow-btn, [data-tour="yakihonne-follow"]',
    title: 'Follow people',
    content: 'Follow anyone to see their notes and articles in your feed. Your follow list is stored on Nostr and syncs across every client you use.',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'yakihonne-interactions',
    target: '.yakihonne-zap-btn, [data-tour="yakihonne-zaps"]',
    title: 'Zaps & reactions',
    content: 'React, reply, repost, quote — and zap. Zaps send real Bitcoin over the Lightning Network straight to a creator; YakiHonne shows the total sats a note has earned.',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'yakihonne-settings',
    target: '.yakihonne-simulator',
    title: 'Wallet, relays & Yaki chest',
    content: 'YakiHonne bundles a Lightning wallet (Wallet of Satoshi by default), branded "Relay orbits", and a gamified "Yaki chest" that rewards you with XP for being active.',
    position: 'center',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'yakihonne-complete',
    target: '.yakihonne-simulator',
    title: 'That\'s YakiHonne!',
    content: 'You have explored YakiHonne — articles, media, wallet and all. Your keys work everywhere on Nostr; the protocol is yours to explore freely.',
    position: 'center',
    spotlightPadding: 0,
  },
];

export const yakihonneTourConfig: TourConfig = {
  id: 'yakihonne-tour',
  name: 'YakiHonne Simulator Tour',
  steps: yakihonneTourSteps,
  storageKey: 'nostr-tour-yakihonne',
};

export default yakihonneTourConfig;
