/**
 * Keychat Simulator Tour
 * Tour drives the simulator - user clicks Next, tour navigates simulator
 */

import type { TourConfig, TourStep } from '../../components/tour';

const keychatTourSteps: TourStep[] = [
  {
    id: 'keychat-welcome',
    target: '.keychat-simulator',
    title: 'Welcome to Keychat',
    content: 'Keychat is a super app for Bitcoiners with sovereign identity, Bitcoin ecash wallet, and secure end-to-end encrypted chat. Let\'s explore its unique features!',
    position: 'center',
    spotlightPadding: 0,
  },
  {
    id: 'keychat-login',
    // The login screen root covered everything; "Create a new account" is the
    // primary CTA the copy leads with.
    target: '[data-tour="keychat-generate-keys"], [data-tour="keychat-login"]',
    title: 'Sovereign Identity',
    content: 'Keychat uses Nostr for decentralized identity. Create a new account or import your existing private key. No phone number, email, or personal data required - you control your identity.',
    position: 'bottom',
    allowClickThrough: true,
    spotlightPadding: 16,
  },
  {
    id: 'keychat-chats',
    // The encryption badge on the first row, not the whole list — the copy is
    // about the green lock. List kept as a fallback.
    target: '[data-tour="keychat-chat-lock"], [data-tour="keychat-chat-list"]',
    title: 'Your Conversations',
    content: 'All your chats are secured with the Signal Protocol - the same encryption used by Signal Messenger. The lock icon indicates end-to-end encrypted conversations.',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 14, // tiny target — the ring needs room to read as a ring
  },
  {
    id: 'keychat-chat-item',
    target: '[data-tour="keychat-chat-item"]',
    title: 'Open a Chat',
    content: 'Tap any conversation to open it. You\'ll see your encrypted message history with this contact.',
    position: 'right',
    allowClickThrough: true,
    spotlightPadding: 12,
  },
  {
    id: 'keychat-chat-room',
    // The lock + "Signal Protocol" badge in the room header rather than the
    // whole room.
    target: '[data-tour="keychat-chat-encryption"], [data-tour="keychat-chat-room"]',
    title: 'Encrypted Messaging',
    content: 'This is your secure chat room. Every message is end-to-end encrypted using Signal Protocol. Only you and the recipient can read these messages - not even Keychat servers can decrypt them.',
    position: 'center',
    spotlightPadding: 10, // tiny target — the ring needs room to read as a ring
  },
  {
    id: 'keychat-message-input',
    target: '[data-tour="keychat-message-input"]',
    title: 'Send a Message',
    content: 'Type a message and send it securely. You can also attach images or send Bitcoin (sats) directly in the chat using the attachment and Bitcoin buttons.',
    position: 'top',
    spotlightPadding: 8,
  },
  {
    id: 'keychat-wallet',
    // The Send / Receive / Scan card instead of the whole wallet screen.
    target: '[data-tour="keychat-wallet-actions"], [data-tour="keychat-wallet"]',
    title: 'Bitcoin Ecash Wallet',
    content: 'Keychat has a built-in Bitcoin ecash (Cashu) wallet! Send and receive Bitcoin instantly with zero fees. Your wallet is non-custodial - you control your keys.',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'keychat-apps',
    // The tile grid rather than the screen with its header.
    target: '[data-tour="keychat-apps-grid"], [data-tour="keychat-apps"]',
    title: 'Mini Apps',
    content: 'Explore mini apps built on Nostr - from markets to games to social apps. These run inside Keychat and leverage your Nostr identity.',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'keychat-settings',
    // The "Privacy & Security" card, which is what the copy leads with.
    target: '[data-tour="keychat-settings-privacy"], [data-tour="keychat-settings"]',
    title: 'Privacy Settings',
    content: 'Manage your encryption settings, backup your keys, and configure your wallet. Remember: your keys are your account - backup them securely!',
    position: 'top',
    allowClickThrough: true,
    spotlightPadding: 8,
  },
  {
    id: 'keychat-complete',
    target: '.keychat-simulator',
    title: 'You\'re Ready!',
    content: 'You now know the basics of Keychat! Remember: sovereign identity, encrypted chat, and Bitcoin wallet all in one app. Your keys = your account. Never share your private key!',
    position: 'center',
    spotlightPadding: 0,
  },
];

export const keychatTourConfig: TourConfig = {
  id: 'keychat-tour',
  name: 'Keychat Simulator Tour',
  steps: keychatTourSteps,
  storageKey: 'nostr-tour-keychat',
};

export default keychatTourConfig;
