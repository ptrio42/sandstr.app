/**
 * Snort Web Simulator Tour
 * Tour drives the simulator - user clicks Next, tour navigates simulator
 */

import type { TourConfig, TourStep } from '../../components/tour';

const snortTourSteps: TourStep[] = [
  {
    id: 'snort-welcome',
    target: '.snort-simulator',
    title: 'Welcome to Snort',
    content: 'Snort is a feature-rich web Nostr client with a focus on performance and modern web technologies. It offers both simple and advanced modes for different user needs. Let us explore hands-on!',
    position: 'center',
    spotlightPadding: 0,
  },
  {
    id: 'snort-login',
    // The NIP-07 CTA, not the whole login screen. Screen anchor kept as a
    // fallback for the states where the extension button is not rendered.
    target: '[data-tour="snort-login-extension"], [data-tour="snort-login"]',
    title: 'Login Options',
    // Deliberately describes the extension/signer path only. The real client
    // also accepts a pasted nsec, but this simulation never asks for one and
    // must not suggest that pasting a private key into a web page you are just
    // trying out is normal — see the "stop soliciting private keys" fix.
    content: 'Snort signs you in with a browser signer extension like nos2x or Alby, so your key never leaves it. That key is your identity across every Nostr app — this demo just uses a throwaway one.',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 16,
  },
  {
    id: 'snort-home',
    // ONE note (the first, already flagged `tourTarget`) instead of the whole
    // feed column — the copy is about a single note's layout.
    target: '[data-tour="snort-note"], .snort-feed, [data-tour="snort-feed"]',
    title: 'Your Timeline',
    content: 'The main feed shows content from followed accounts with real-time updates. Snort uses efficient loading and caching for a smooth scrolling experience. This is where you will spend most of your time!',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'snort-compose',
    target: '.snort-compose, [data-tour="snort-compose"]',
    title: 'Create Content',
    content: 'Compose notes with full Markdown support, image uploads, and mentions. Snort also supports long-form content for blog-style posts beyond the standard note limit. Express yourself!',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 12,
  },
  {
    id: 'snort-post',
    target: '.snort-post-btn, [data-tour="snort-post"]',
    title: 'Publish Your Note',
    content: 'Write something interesting and hit Send. Your note gets cryptographically signed and broadcast to every connected relay — once it is out there, it is out there.',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 12,
  },
  {
    id: 'snort-profile',
    // Avatar + details block, which is exactly what the copy enumerates.
    target: '[data-tour="snort-profile-header"], [data-tour="snort-profile"]',
    title: 'Rich Profiles',
    content: 'Profiles show comprehensive information: bio, links, NIP-05, Lightning address, badges, and all user activity. Switch between posts, replies, likes, and zaps. This is your identity on Nostr!',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 16,
  },
  {
    id: 'snort-follow',
    target: '.snort-follow-btn, [data-tour="snort-follow"]',
    title: 'Following Users',
    content: 'Find interesting people by browsing your network. When you follow someone, their posts appear in your feed. Your follows are stored in your account and synced across all Nostr clients.',
    position: 'left',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'snort-interactions',
    target: '.snort-note-actions, [data-tour="snort-interactions"]',
    title: 'Interact with Posts',
    content: 'Engage with posts using: Reply (respond publicly), Repost (share with your followers), Like (show appreciation), or Zap (send Bitcoin sats as a tip). Zaps are a unique Nostr feature!',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'snort-settings',
    // The Preferences row rather than the whole settings column.
    target: '[data-tour="snort-settings-preferences"], [data-tour="snort-settings"]',
    title: 'Customization',
    content: 'Extensive settings include: themes, language, media preferences, notification filters, privacy options, and developer features. Make Snort work exactly how you want. Remember to backup your keys!',
    position: 'left',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'snort-complete',
    target: '.snort-simulator',
    title: 'Snort Mastered!',
    content: 'You understand Snort\'s features! It is a powerful web client with excellent threading and customization. Same keys work everywhere in Nostr - stay sovereign!',
    position: 'center',
    spotlightPadding: 0,
  },
];

export const snortTourConfig: TourConfig = {
  id: 'snort-tour',
  name: 'Snort Simulator Tour',
  steps: snortTourSteps,
  storageKey: 'nostr-tour-snort',
};

export default snortTourConfig;
