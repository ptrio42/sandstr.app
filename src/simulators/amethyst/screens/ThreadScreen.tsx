import React, { useMemo, useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { MaterialCard, PostData } from '../components/MaterialCard';
import { mockThreads } from '../../../data/mock';
import { toPostData } from '../notesToPosts';
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

/**
 * A real conversation instead of three canned replies.
 *
 * What shipped was a module-scope `REPLY_POOL` of three fixtures sliced by the
 * note's reply count, so every thread in the simulator was the same three
 * replies and there was no nesting at all (gaps ame-135). `src/data/mock`
 * already builds nested threads: each reply carries `['e', <root>, '', 'root']`
 * and, when it answers another reply, `['e', <parent>, '', 'reply']` — so the
 * parent chain is reconstructable without touching the read-only corpus.
 *
 * Feed notes and thread roots are separately generated, so a feed note is
 * mapped onto a thread deterministically by its own id. The same note therefore
 * always opens the same conversation.
 */
interface ReplyNode {
  post: PostData;
  depth: number;
}

function threadFor(postId: string): ReplyNode[] {
  if (mockThreads.length === 0) return [];
  let hash = 0;
  for (let i = 0; i < postId.length; i += 1) hash = (hash * 31 + postId.charCodeAt(i)) >>> 0;
  const thread = mockThreads[hash % mockThreads.length];

  const replies = thread.notes.filter((n) => n.id !== thread.rootNoteId);
  const parentOf = new Map<string, string>();
  for (const n of replies) {
    const replyTag = (n.tags || []).find((t) => t[0] === 'e' && t[3] === 'reply');
    parentOf.set(n.id, replyTag ? replyTag[1] : thread.rootNoteId);
  }

  const depthOf = (id: string): number => {
    let depth = 0;
    let cur = parentOf.get(id);
    // Three levels is all the screen tints; deeper chains flatten onto it.
    while (cur && cur !== thread.rootNoteId && depth < 4) {
      depth += 1;
      cur = parentOf.get(cur);
    }
    return depth;
  };

  // Depth-first so a nested answer sits under the reply it answers.
  const byParent = new Map<string, typeof replies>();
  for (const n of replies) {
    const parent = parentOf.get(n.id) ?? thread.rootNoteId;
    byParent.set(parent, [...(byParent.get(parent) ?? []), n]);
  }
  const out: ReplyNode[] = [];
  const walk = (parent: string) => {
    for (const n of (byParent.get(parent) ?? []).sort((a, b) => a.created_at - b.created_at)) {
      out.push({ post: toPostData(n), depth: depthOf(n.id) });
      walk(n.id);
    }
  };
  walk(thread.rootNoteId);
  return out;
}

export function ThreadScreen({ post, onBack, onOpenProfile }: ThreadScreenProps) {
  const replyRef = React.useRef<HTMLInputElement>(null);
  const [reply, setReply] = useState('');
  const canSend = reply.trim().length > 0;
  // Replies the visitor writes here, newest last, so a posted reply is visible
  // instead of the field just clearing as if it had sent (gaps ame-21).
  const [posted, setPosted] = useState<PostData[]>([]);

  /**
   * The conversation, cut to the reply count the card promises so a note whose
   * action row reads "0 replies" does not open onto a full thread.
   */
  const replies = useMemo(
    () => threadFor(post.id).slice(0, post.stats.replies),
    [post.id, post.stats.replies],
  );

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
          <div className="mt-1" data-tour="amethyst-thread-replies">
            {/* One indent step and one connector per level, with the alternating
                per-level tint the screen map calls the zebra. Replies the
                visitor writes land at the first level, under the root. */}
            {[...replies, ...posted.map((p2) => ({ post: p2, depth: 0 }))].map(({ post: r, depth }) => (
              <div
                key={r.id}
                style={{
                  marginLeft: 12 + depth * 12,
                  paddingLeft: 12,
                  borderLeft: '2px solid var(--md-outline-variant)',
                  background:
                    depth % 2 === 1
                      ? 'color-mix(in srgb, var(--md-on-surface) 4%, transparent)'
                      : undefined,
                }}
              >
                <MaterialCard post={r} onOpenProfile={onOpenProfile} onReply={() => replyRef.current?.focus()} />
              </div>
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
