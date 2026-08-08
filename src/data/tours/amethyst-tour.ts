/**
 * Amethyst Android Simulator Tour
 * Interactive, event-driven guided tour for Amethyst client
 */

import type { TourConfig, TourStep } from '../../components/tour';

const amethystTourSteps: TourStep[] = [
  {
    id: 'amethyst-welcome',
    target: '.amethyst-simulator',
    title: 'Welcome to Amethyst',
    content: 'Amethyst is a Material Design 3 Android Nostr client. It is feature-rich with support for both dark and light themes. Let us explore its interface together!',
    position: 'center',
    spotlightPadding: 0,
  },
  {
    id: 'amethyst-login',
    target: '[data-tour="amethyst-login"]',
    title: 'Keys: Your Digital Identity',
    content: 'On Nostr, you are identified by cryptographic keys. Amethyst generates these for you or imports existing ones. Your nsec (private key) is your password - guard it carefully! Extensions are the safest option.',
    position: 'bottom',
    trigger: 'action',
    actionType: 'login',
    allowClickThrough: true,
    action: 'Login with a test account to continue',
    spotlightPadding: 16,
  },
  {
    id: 'amethyst-home',
    target: '.amethyst-feed, [data-tour="amethyst-feed"]',
    title: 'Your Timeline',
    content: 'The main feed shows posts from people you follow. Amethyst uses a smooth, card-based design. Pull down to refresh and see the latest content from the Nostr network.',
    position: 'top',
    trigger: 'action',
    actionType: 'navigate_home',
    allowClickThrough: true,
    action: 'Tap the Home icon to view your feed',
    spotlightPadding: 8,
  },
  {
    id: 'amethyst-compose',
    target: '.amethyst-fab, [data-tour="amethyst-fab"]',
    title: 'Compose with FAB',
    content: 'Amethyst uses Material Design\'s Floating Action Button (FAB) for creating new posts. This prominent purple button makes it easy to share your thoughts anytime.',
    position: 'left',
    trigger: 'action',
    actionType: 'compose',
    allowClickThrough: true,
    action: 'Tap the + button to start composing',
    spotlightPadding: 12,
  },
  {
    id: 'amethyst-post',
    target: '[data-tour="amethyst-post"]',
    title: 'Publish Your Note',
    content: 'Write something interesting and hit post! Your note will be cryptographically signed and broadcast to all connected relays. Once published, it is permanent on the Nostr network.',
    position: 'bottom',
    trigger: 'action',
    actionType: 'post',
    allowClickThrough: true,
    action: 'Type a message and tap "Post" to publish',
    spotlightPadding: 12,
  },
  {
    id: 'amethyst-profile',
    // Spotlight the top-bar avatar (the thing you actually tap) and fall back to
    // the profile screen itself when the avatar isn't on screen. The avatar
    // opens the account drawer — as in the real app — so the step only completes
    // once "Profile" is picked there, which is what the copy now says.
    target: '[data-tour="amethyst-profile-avatar"], .amethyst-profile, [data-tour="amethyst-profile"]',
    title: 'Profile Management',
    content: 'Customize your profile with name, picture, bio, and NIP-05 verification. View your posts, followers, and follows. Your profile data is stored on Nostr relays. This is your identity!',
    position: 'bottom',
    trigger: 'action',
    actionType: 'view_profile',
    allowClickThrough: true,
    action: 'Tap your avatar, then "Profile" in the menu',
    spotlightPadding: 16,
  },
  {
    id: 'amethyst-follow',
    target: '[data-tour="amethyst-follow"]',
    title: 'Following Users',
    content: 'Find interesting people by browsing your network. When you follow someone, their posts appear in your feed. Your follows are stored in your account and synced across all Nostr clients.',
    position: 'left',
    trigger: 'action',
    actionType: 'follow',
    allowClickThrough: true,
    // The profile opens already-followed, so the control reads "Unfollow" —
    // name the button, not one of its two labels.
    action: 'Tap the follow button on this profile',
    spotlightPadding: 8,
  },
  {
    id: 'amethyst-interactions',
    target: '[data-tour="amethyst-actions"]',
    title: 'Engagement Options',
    content: 'Each post has actions: Reply (comment), Boost (repost), Like (heart), and Zap (Bitcoin tip). Zaps use Lightning Network to send real Bitcoin to content creators!',
    position: 'top',
    trigger: 'action',
    actionType: 'like',
    allowClickThrough: true,
    action: 'Tap the heart icon to like a post',
    spotlightPadding: 8,
  },
  {
    id: 'amethyst-settings',
    // Settings lives in the account drawer, which the top-bar avatar opens —
    // there is no settings tab in the bottom nav. Spotlight the avatar, and fall
    // back to the settings surface once it is open.
    target: '[data-tour="amethyst-profile-avatar"], .amethyst-settings, [data-tour="amethyst-settings"]',
    title: 'Rich Settings',
    content: 'Amethyst offers extensive customization: themes (light/dark/auto), relay management, notification settings, security options, and key backup. Remember to backup your private key securely!',
    position: 'left',
    trigger: 'action',
    actionType: 'navigate_settings',
    allowClickThrough: true,
    action: 'Tap your avatar, then "App Preferences"',
    spotlightPadding: 12,
  },
  {
    id: 'amethyst-complete',
    target: '.amethyst-simulator',
    title: 'Ready for Nostr!',
    content: 'You understand Amethyst basics! Its Material Design makes it intuitive for Android users. Your account works across all Nostr clients - try another one!',
    position: 'center',
    spotlightPadding: 0,
  },
];

export const amethystTourConfig: TourConfig = {
  id: 'amethyst-tour',
  name: 'Amethyst Simulator Tour',
  steps: amethystTourSteps,
  storageKey: 'nostr-tour-amethyst',
};

export default amethystTourConfig;
