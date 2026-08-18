/**
 * Mock Data Generation Utilities
 * Helper functions for creating realistic Nostr mock data
 */

import type { MockUser, MockNote, MockRelay, ContentCategory, NostrEvent } from './types';
import { EventKind } from './types';

// Generate random hex string
export function generateHex(length: number = 64): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Generate npub from hex pubkey (simplified)
/**
 * Bech32 (BIP-173, which NIP-19 uses) excludes `1`, `b`, `i` and `o` from its
 * charset, so a hex tail made these strings not-quite-npubs. That was invisible
 * until note text started being PARSED for `nostr:` references — a mention of a
 * mock identity failed to match, so it rendered as raw text (see mentions.ts).
 */
const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
export function generateNpub(): string {
  let tail = '';
  for (let i = 0; i < 58; i++) {
    tail += BECH32_CHARSET[Math.floor(Math.random() * BECH32_CHARSET.length)];
  }
  return `npub1${tail}`;
}

// Generate random timestamp within range
export function generateTimestamp(daysBack: number = 30): number {
  const now = Math.floor(Date.now() / 1000);
  const secondsBack = daysBack * 24 * 60 * 60;
  const randomOffset = Math.floor(Math.random() * secondsBack);
  return now - randomOffset;
}

// Generate realistic timestamps with clustering (more posts during certain hours)
export function generateRealisticTimestamp(daysBack: number = 30): number {
  const now = Math.floor(Date.now() / 1000);
  const secondsBack = daysBack * 24 * 60 * 60;
  const baseTime = now - Math.floor(Math.random() * secondsBack);
  
  // Cluster more posts during "active hours" (8am - 11pm)
  const date = new Date(baseTime * 1000);
  const hour = date.getHours();
  
  // 70% chance to be during active hours
  if (Math.random() < 0.7) {
    if (hour < 8 || hour > 23) {
      // Move to active hours
      date.setHours(8 + Math.floor(Math.random() * 15));
    }
  }
  
  return Math.floor(date.getTime() / 1000);
}

// Generate a mock signature (64 bytes hex)
export function generateSig(): string {
  return generateHex(128);
}

// Extract hashtags from content
export function extractHashtags(content: string): string[] {
  const hashtags: string[] = [];
  const regex = /#(\w+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    hashtags.push(match[1].toLowerCase());
  }
  return hashtags;
}

// Extract mentions (@npub...)
export function extractMentions(content: string): string[] {
  const mentions: string[] = [];
  const regex = /@(npub1[a-z0-9]+)/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
}

// Extract URLs
export function extractUrls(content: string): string[] {
  const urls: string[] = [];
  const regex = /(https?:\/\/[^\s]+)/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

// Generate random follower count with realistic distribution
export function generateFollowerCount(): number {
  const rand = Math.random();
  if (rand < 0.4) return Math.floor(Math.random() * 100); // 40% have < 100
  if (rand < 0.7) return Math.floor(Math.random() * 500) + 100; // 30% have 100-600
  if (rand < 0.9) return Math.floor(Math.random() * 2000) + 500; // 20% have 500-2500
  if (rand < 0.97) return Math.floor(Math.random() * 10000) + 2500; // 7% have 2500-12500
  return Math.floor(Math.random() * 50000) + 12500; // 3% have 12500+
}

// Generate engagement counts based on follower count and content quality
export function generateEngagement(followerCount: number, isHighQuality: boolean = false): {
  likes: number;
  reposts: number;
  replies: number;
  zaps: number;
  zapAmount: number;
} {
  const baseMultiplier = isHighQuality ? 0.15 : 0.05;
  const variance = () => 0.5 + Math.random(); // 0.5x to 1.5x variance
  
  const likes = Math.floor(followerCount * baseMultiplier * variance() * Math.random());
  const reposts = Math.floor(likes * 0.15 * variance());
  const replies = Math.floor(likes * 0.08 * variance());
  const zaps = Math.floor(likes * 0.02 * variance());
  const zapAmount = zaps > 0 ? Math.floor(zaps * (100 + Math.random() * 4900)) : 0; // 100-5000 sats avg
  
  return { likes, reposts, replies, zaps, zapAmount };
}

// Create Nostr event tags
export function createTags(
  mentions: string[] = [],
  hashtags: string[] = [],
  replyTo?: string,
  rootEvent?: string
): string[][] {
  const tags: string[][] = [];
  
  // Add reply tags if applicable
  if (rootEvent) {
    tags.push(['e', rootEvent, '', 'root']);
  }
  if (replyTo && replyTo !== rootEvent) {
    tags.push(['e', replyTo, '', 'reply']);
  }
  
  // Add mention tags
  mentions.forEach(pubkey => {
    tags.push(['p', pubkey]);
  });
  
  // Add hashtag tags (t tags for NIP-12)
  hashtags.forEach(tag => {
    tags.push(['t', tag.toLowerCase()]);
  });
  
  return tags;
}

// Avatar gradient generator
export function generateAvatarGradient(seed: string): string {
  const gradients = [
    'from-pink-500 via-red-500 to-yellow-500',
    'from-green-400 via-blue-500 to-purple-600',
    'from-orange-400 via-pink-500 to-purple-600',
    'from-blue-400 via-indigo-500 to-purple-600',
    'from-yellow-400 via-orange-500 to-red-600',
    'from-teal-400 via-cyan-500 to-blue-600',
    'from-purple-400 via-pink-500 to-red-500',
    'from-indigo-400 via-purple-500 to-pink-500',
    'from-red-400 via-pink-500 to-rose-500',
    'from-emerald-400 via-teal-500 to-cyan-600',
    'from-amber-400 via-orange-500 to-yellow-600',
    'from-violet-400 via-purple-500 to-fuchsia-600',
    'from-cyan-400 via-blue-500 to-indigo-600',
    'from-rose-400 via-pink-500 to-purple-600',
    'from-lime-400 via-green-500 to-emerald-600',
    'from-sky-400 via-blue-500 to-indigo-600',
  ];
  
  // Use seed to deterministically pick gradient
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return gradients[Math.abs(hash) % gradients.length];
}

// Post images as local, deterministic, CSP-safe inline-SVG gradient "photos".
// (The old list was mostly non-resolving fake URLs + remote picsum — broken
// offline and under strict CSP. These data-URIs need no network.)
let __imgSeq = 0;
function svgPhoto(i: number): string {
  const pairs = [[280, 330], [205, 255], [20, 48], [150, 190], [325, 15], [240, 285], [40, 90], [190, 230], [95, 140], [355, 30]];
  const [h1, h2] = pairs[i % pairs.length];
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>` +
    `<defs>` +
    `<linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='hsl(${h1},64%,54%)'/><stop offset='1' stop-color='hsl(${h2},70%,40%)'/>` +
    `</linearGradient>` +
    `<radialGradient id='b1' cx='28%' cy='30%' r='55%'>` +
    `<stop offset='0' stop-color='hsl(${h1},85%,72%)' stop-opacity='.75'/><stop offset='1' stop-color='hsl(${h1},85%,72%)' stop-opacity='0'/>` +
    `</radialGradient>` +
    `<radialGradient id='b2' cx='78%' cy='72%' r='50%'>` +
    `<stop offset='0' stop-color='hsl(${h2},88%,62%)' stop-opacity='.65'/><stop offset='1' stop-color='hsl(${h2},88%,62%)' stop-opacity='0'/>` +
    `</radialGradient>` +
    `</defs>` +
    `<rect width='800' height='600' fill='url(#g)'/><rect width='800' height='600' fill='url(#b1)'/><rect width='800' height='600' fill='url(#b2)'/>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getSampleImages(count: number = 1): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(svgPhoto(__imgSeq++));
  return out;
}

// Validate mock event structure
export function validateEvent(event: Partial<NostrEvent>): boolean {
  if (!event.id || event.id.length !== 64) return false;
  if (!event.pubkey || event.pubkey.length < 20) return false;
  if (!event.created_at || event.created_at < 1609459200) return false; // After 2021
  if (typeof event.kind !== 'number') return false;
  if (!Array.isArray(event.tags)) return false;
  if (typeof event.content !== 'string') return false;
  if (!event.sig || event.sig.length !== 128) return false;
  return true;
}

// Export all utilities
export const MockUtils = {
  generateHex,
  generateNpub,
  generateTimestamp,
  generateRealisticTimestamp,
  generateSig,
  extractHashtags,
  extractMentions,
  extractUrls,
  generateFollowerCount,
  generateEngagement,
  createTags,
  generateAvatarGradient,
  getSampleImages,
  validateEvent,
};

export default MockUtils;
