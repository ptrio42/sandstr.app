import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { mockNotes } from '../../../data/mock';
import type { MockNote, MockUser } from '../../../data/mock';
import type { ThreadScreenProps } from '../types';
import { hashSeed, userByPubkey } from '../wispData';
import { PostCard } from '../components/PostCard';

/**
 * Thread screen (screen-map §7): back + "Thread" top bar, root note as a plain
 * PostCard (no focused-note treatment), replies indented 16dp/level with a
 * hairline connector rail, dashed wisp-ghost empty state, spam-reply fold,
 * sticky "Reply…" pill and the primary "Back to Top" pill on scroll.
 */

interface DerivedReply {
  note: MockNote;
  author: MockUser;
  depth: number;
}

/** Hand-sketched dashed wisp-ghost doodle (ic_no_replies), 72px, @25%. */
function NoRepliesDoodle() {
  return (
    <svg width={72} height={72} viewBox="0 0 72 72" aria-hidden="true" className="opacity-25">
      <g
        fill="none"
        stroke="var(--wisp-on-bg)"
        strokeWidth={2}
        strokeDasharray="4 4"
        strokeLinecap="round"
      >
        {/* circle-ish blob with the curl sweeping to the top-right */}
        <path d="M33 65 C18 65 7 54 7 41 C7 28 17 18 32 18 C38 18 42 20 47 19 C52 18 55 13 53 7 C61 13 65 24 64 35 C63 51 51 65 33 65 Z" />
        <path d="M53 7 C58 9 61 13 62 18" />
        {/* two vertical-oval eyes */}
        <ellipse cx="21" cy="41" rx="4" ry="7" />
        <ellipse cx="36" cy="41" rx="4" ry="7" />
      </g>
    </svg>
  );
}

export function ThreadScreen({
  note,
  author,
  onBack,
  onOpenThread,
  onOpenProfile,
  onZap,
  onReply,
  registerAction,
}: ThreadScreenProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Deterministic reply derivation: 0-3 replies picked from the mock DB by a
  // seeded index, replies stripped to avoid recursion, always another author.
  const replies = useMemo<DerivedReply[]>(() => {
    const count = Math.min(3, note.replies);
    const base = hashSeed(note.id);
    const out: DerivedReply[] = [];
    for (let i = 0; i < count; i++) {
      let idx = (base + i * 7) % mockNotes.length;
      let guard = 0;
      while (
        guard < mockNotes.length &&
        (mockNotes[idx].pubkey === note.pubkey || mockNotes[idx].id === note.id)
      ) {
        idx = (idx + 1) % mockNotes.length;
        guard += 1;
      }
      const source = mockNotes[idx];
      const reply: MockNote = {
        ...source,
        id: `${note.id}-reply-${i}`,
        replies: 0,
        isRepost: false,
        repostedBy: undefined,
        tags: [['e', note.id]],
        mentions: [note.pubkey],
      };
      out.push({
        note: reply,
        author: userByPubkey(source.pubkey),
        depth: Math.min(3, i === 2 ? 2 : 1),
      });
    }
    return out;
  }, [note]);

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {/* Top bar */}
      <div className="flex h-12 shrink-0 items-center gap-2 px-2">
        <button type="button" aria-label="Back" className="p-2" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Thread</h1>
      </div>

      {/* Scroll region */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto"
        onScroll={(e) => setShowBackToTop(e.currentTarget.scrollTop > 300)}
      >
        {/* Root note — same PostCard, no focused-note treatment */}
        <PostCard
          note={note}
          author={author}
          showDivider={false}
          onOpenThread={onOpenThread}
          onOpenProfile={onOpenProfile}
          onReply={onReply}
          onZap={onZap}
          registerAction={registerAction}
        />
        <div className="wisp-divider" />

        {replies.length === 0 ? (
          /* Empty state: dashed wisp-ghost + "No replies yet" */
          <div className="flex flex-col items-center gap-3 py-8">
            <NoRepliesDoodle />
            <p className="text-sm opacity-25">No replies yet</p>
          </div>
        ) : (
          replies.map((reply) => {
            const indent = reply.depth * 16;
            return (
              <div key={reply.note.id} className="relative" style={{ paddingLeft: indent }}>
                {/* connector: 1px vertical rail + bottom hairline elbow to the edge */}
                <div
                  className="absolute bottom-0 top-0 w-px rounded-full"
                  style={{
                    left: indent - 8,
                    background: 'var(--wisp-outline-variant)',
                    opacity: 0.5,
                  }}
                />
                <div
                  className="absolute bottom-0 h-px"
                  style={{
                    left: 0,
                    width: indent - 8,
                    background: 'var(--wisp-outline-variant)',
                    opacity: 0.5,
                  }}
                />
                <PostCard
                  note={reply.note}
                  author={reply.author}
                  showDivider={false}
                  onOpenThread={onOpenThread}
                  onOpenProfile={onOpenProfile}
                  onReply={onReply}
                  onZap={onZap}
                  registerAction={registerAction}
                />
              </div>
            );
          })
        )}

        {/* Spam fold (on-device classifier idiom) — static */}
        {note.replies > 4 && (
          <div
            className="mx-4 my-2 flex items-center gap-2 rounded-md px-3.5 py-2.5"
            style={{
              background: 'rgba(140,29,24,0.4)',
              color: 'var(--wisp-on-error-container)',
            }}
          >
            <ChevronDown size={18} className="shrink-0" />
            <span className="text-xs">2 hidden replies from likely spam accounts</span>
            <span className="ml-auto text-[11px] opacity-70">Show</span>
          </div>
        )}
      </div>

      {/* Sticky reply bar */}
      <div className="shrink-0" style={{ background: 'var(--wisp-bg)' }}>
        <div className="wisp-divider" />
        <div className="px-3 py-2">
          <button
            type="button"
            data-tour="wisp-reply"
            className="flex w-full items-center rounded-[18px] px-3.5 py-2.5 text-left"
            style={{ background: 'rgba(44,44,46,0.5)' }}
            onClick={() => {
              registerAction?.('reply');
              onReply(note);
            }}
          >
            <span className="text-sm text-[var(--wisp-on-surface-variant)]">Reply…</span>
            <span className="ml-auto" />
            <Pencil size={16} className="shrink-0" style={{ color: 'var(--wisp-accent)' }} />
          </button>
        </div>
      </div>

      {/* Back to Top pill — appears once the reader has scrolled down */}
      {showBackToTop && (
        <button
          type="button"
          className="absolute left-1/2 top-14 z-10 flex -translate-x-1/2 items-center gap-1 rounded-[20px] bg-[var(--wisp-accent)] px-4 py-1.5 text-sm text-white"
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp size={18} />
          Back to Top
        </button>
      )}
    </div>
  );
}
