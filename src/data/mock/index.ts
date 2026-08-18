/**
 * Mock Data Index
 * Central export point for all Nostr mock data
 */

// Export types
export * from './types';

// Export utilities
export * from './utils';

// Export data
export { 
  mockUsers, 
  getUserByPubkey, 
  getUserByUsername, 
  getVerifiedUsers, 
  getUsersByBadge, 
  getRandomUsers, 
  userStats 
} from './users';

export { 
  mockNotes, 
  notesByCategory, 
  getNoteById, 
  getNotesByAuthor, 
  getNotesWithImages, 
  getMostLikedNotes, 
  getMostZappedNotes, 
  getRecentNotes, 
  noteStats 
} from './notes';

export { 
  mockThreads, 
  getThreadById, 
  getThreadByRootNoteId, 
  getThreadsByCategory, 
  getThreadsByParticipant, 
  getMostActiveThreads, 
  getRecentThreads, 
  threadStats 
} from './threads';

export { 
  mockRelays, 
  getRelayById, 
  getRelayByUrl, 
  getOnlineRelays, 
  getPaidRelays, 
  getFreeRelays, 
  getRelaysBySoftware, 
  getRelaysByNip, 
  getRelaysWithFeature, 
  getFastestRelays, 
  getLargestRelays, 
  relayStats, 
  recommendedRelays, 
  recommendedPaidRelays 
} from './relays';

// "Paste your note, see it in every client". The host reaches this through a
// dynamic import so the landing bundle keeps none of the mock data.
export {
  PREVIEW_STORAGE_KEY,
  PREVIEW_IMAGE_STORAGE_KEY,
  PREVIEW_MAX_CHARS,
  normalizePreviewText,
  registerPreviewTarget,
  applyPreviewNote,
  activePreviewNote,
  activePreviewImage,
  isPreviewNote,
  readPreviewNote,
  writePreviewNote,
  readPreviewImage,
  writePreviewImage,
  linkCandidate,
  activePreviewLink,
  readPreviewLink,
  writePreviewLink,
  PREVIEW_LINK_STORAGE_KEY,
} from './previewNote';

// `nostr:` references in note text (NIP-21) — see mentions.ts.
export {
  MENTION_SPLIT_RE,
  MENTION_TOKEN_RE,
  resolveMention,
  isProfileMention,
  type Mention,
  type MentionKind,
} from './mentions';

// Re-export with alternative names for convenience
export { mockUsers as users } from './users';
export { mockNotes as notes } from './notes';
export { mockThreads as threads } from './threads';
export { mockRelays as relays } from './relays';
