import { getUserByPubkey, generateAvatarGradient } from '../../data/mock';
import type { MockNote } from '../../data/mock';
import type { PostData } from './components/MaterialCard';

/**
 * One mock note -> one feed card. Extracted from HomeScreen so the Search
 * results list renders note hits with exactly the same card the feed does
 * (upstream's search results are `NoteCompose`, i.e. the feed note itself).
 */
export function toPostData(note: MockNote): PostData {
  const author = getUserByPubkey(note.pubkey);
  return {
    id: note.id,
    author: {
      name: author?.displayName || 'Unknown',
      handle: author?.nip05 || author?.username || 'unknown',
      avatar: author?.avatar || generateAvatarGradient(note.pubkey), // local, offline — no DiceBear
      nip05: author?.nip05,
      isVerified: author?.isVerified,
    },
    content: note.content,
    timestamp: formatTimestamp(note.created_at),
    stats: {
      replies: note.replies,
      reposts: note.reposts,
      zaps: note.zaps,
      likes: note.likes,
    },
    images: note.images,
    hashtags: note.hashtags,
    community: note.community,
    isLive: note.isLive,
  };
}

export function formatTimestamp(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(timestamp * 1000).toLocaleDateString();
}
