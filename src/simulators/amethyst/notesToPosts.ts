import { getUserByPubkey, generateAvatarGradient } from '../../data/mock';
import type { MockNote } from '../../data/mock';
import type { PostData } from './components/MaterialCard';

/**
 * One mock note -> one feed card. The single mapping in the simulator: the feed
 * builds from it and so does the Search results list, whose note hits are
 * `NoteCompose` upstream — i.e. the very same card. Two copies would drift, and
 * the drift would be invisible (a search hit quietly missing its sats or its
 * Following shield).
 *
 * `following` is a parameter rather than a constant because it is only true by
 * construction on Home: that feed IS `All Follows`, so every author in it is a
 * follow. A search hit is not.
 */
export function toPostData(note: MockNote, opts: { following?: boolean } = {}): PostData {
  const author = getUserByPubkey(note.pubkey);
  return {
    id: note.id,
    pubkey: note.pubkey,
    author: {
      name: author?.displayName || 'Unknown',
      handle: author?.nip05 || author?.username || 'unknown',
      avatar: author?.avatar || generateAvatarGradient(note.pubkey), // local, offline — no DiceBear
      nip05: author?.nip05,
      isVerified: author?.isVerified,
      following: opts.following ?? false,
    },
    content: note.content,
    timestamp: formatTimestamp(note.created_at),
    stats: {
      replies: note.replies,
      reposts: note.reposts,
      zaps: note.zaps,
      likes: note.likes,
      // The zap slot shows an AMOUNT upstream; the count alone was the wrong
      // quantity (gaps ame-79).
      satsZapped: note.zapAmount,
    },
    isRepost: note.isRepost,
    images: note.images,
    linkPreview: note.linkPreview,
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
