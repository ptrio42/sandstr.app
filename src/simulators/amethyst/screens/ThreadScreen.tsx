import React, { useMemo, useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { MaterialCard, PostData } from '../components/MaterialCard';
import '../amethyst.theme.css';

interface ThreadScreenProps {
  post: PostData;
  onBack: () => void;
  /** Tap an author in the thread → their profile. */
  onOpenProfile?: (post: PostData) => void;
}

// Note / thread detail (verified vs the screen recording): the tapped note at the
// top, its replies below (indented with a connector line), and a "reply here.."
// composer pinned at the bottom.
const REPLY_POOL: PostData[] = [
  { id: 'rep1', author: { name: 'sandwich', handle: 'sandwich', avatar: '', nip05: 'sandwich', isVerified: true, following: true }, content: 'GM ☀️', timestamp: '3d', stats: { replies: 1, reposts: 0, zaps: 0, likes: 2 } },
  { id: 'rep2', author: { name: 'sandy', handle: 'sandy.example', avatar: '', nip05: 'sandy.example', isVerified: true, following: true }, content: 'GM ☕', timestamp: '4d', stats: { replies: 0, reposts: 0, zaps: 100, likes: 1, satsZapped: 2100 } },
  { id: 'rep3', author: { name: 'Matt', handle: 'matt', avatar: '', nip05: 'matt', isVerified: false, following: true }, content: 'GM #nostr 🦩 ☕😊🙏\n\nOff for breakfast then a swim today, gotta make the most of the good stuff.', timestamp: '4d', stats: { replies: 2, reposts: 1, zaps: 21, likes: 5, satsZapped: 4200 } },
];

export function ThreadScreen({ post, onBack, onOpenProfile }: ThreadScreenProps) {
  const replyRef = React.useRef<HTMLInputElement>(null);
  const [reply, setReply] = useState('');
  const canSend = reply.trim().length > 0;
  // Replies the visitor writes here, newest last, so a posted reply is visible
  // instead of the field just clearing as if it had sent (gaps ame-21).
  const [posted, setPosted] = useState<PostData[]>([]);

  /**
   * How many of the canned replies this note has. It used to show all three on
   * EVERY note, so a note whose action row read "0 replies" still opened onto
   * three (gaps ame-135). Keyed off the note's own reply count, which is the
   * number the card promises.
   */
  const replies = useMemo(() => REPLY_POOL.slice(0, Math.min(post.stats.replies, REPLY_POOL.length)), [post.stats.replies]);

  const send = () => {
    if (!canSend) return;
    setPosted((cur) => [
      ...cur,
      {
        id: `own-${cur.length}`,
        author: { name: 'sandy', handle: 'sandy.example', avatar: '', nip05: 'sandy.example', isVerified: true, following: true },
        content: reply.trim(),
        timestamp: 'now',
        stats: { replies: 0, reposts: 0, zaps: 0, likes: 0 },
      },
    ]);
    setReply('');
  };

  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-[var(--md-background)]" data-tour="amethyst-thread">
      <div className="md-app-bar md-app-bar-enhanced">
        <button onClick={onBack} aria-label="Back" className="md-app-bar-icon-btn">
          <ArrowLeft className="w-6 h-6 text-[var(--md-on-surface)]" />
        </button>
        <h1 className="flex-1 font-semibold text-[var(--md-on-surface)] px-1">Thread</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {/* The root note reads as the note you opened: an 18sp body and its
            reaction gallery already expanded, which is what
            `showReactionDetail = true` gives it upstream (gaps ame-136/ame-137). */}
        <div className="amethyst-thread-root" data-tour="amethyst-thread-root">
          {/* Inside a thread, Reply belongs to the docked bar at the bottom —
              not the full-screen composer (gaps ame-77). */}
          <MaterialCard
            post={post}
            onOpenProfile={onOpenProfile}
            onReply={() => replyRef.current?.focus()}
            defaultReactionDetail
          />
        </div>
        {(replies.length > 0 || posted.length > 0) && (
          <div className="mt-1 ml-3 pl-3 border-l-2 border-[var(--md-outline-variant)] space-y-2">
            {[...replies, ...posted].map((r) => (
              <MaterialCard key={r.id} post={r} onOpenProfile={onOpenProfile} onReply={() => replyRef.current?.focus()} />
            ))}
          </div>
        )}
      </div>

      {/* Reply composer */}
      <div className="flex items-center gap-2 p-2 border-t border-[var(--md-outline-variant)] safe-area-bottom bg-[var(--md-surface)]" data-tour="amethyst-thread-reply">
        <input
          ref={replyRef}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          placeholder="reply here.."
          aria-label="reply here.."
          className="flex-1 bg-[var(--md-surface-variant)] rounded-full px-4 py-2.5 text-[var(--md-on-surface)] outline-none placeholder:text-[var(--md-on-surface-variant)]"
        />
        <button
          onClick={send}
          disabled={!canSend}
          aria-label="Post reply"
          className={`px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-1.5 ${
            canSend ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)]' : 'bg-[var(--md-surface-variant)] text-[var(--md-on-surface-variant)]'
          }`}
        >
          <Send className="w-4 h-4" /> Post
        </button>
      </div>
    </div>
  );
}
