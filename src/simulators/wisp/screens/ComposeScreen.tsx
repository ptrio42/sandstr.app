import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  GalleryHorizontalEnd,
  ChevronDown,
  Image,
  TriangleAlert,
  Shield,
  BarChart3,
  Clock,
  X,
} from 'lucide-react';
import type { ComposeScreenProps } from '../types';
import { WispAvatar } from '../components/Avatar';
import { RichText } from '../components/PostCard';

/**
 * Compose ("New Post") — screen-map §11. Full-screen route with the signature
 * Wisp undo-countdown publish pill: red X-circle + a primary fill draining
 * left→right over a primary@25% track, "Post now (N)" counting 10→1.
 */
export function ComposeScreen({ currentUser, replyTo, onClose, onPublish }: ComposeScreenProps) {
  const [text, setText] = useState('');
  const [galleryMode, setGalleryMode] = useState(false);
  const [nsfw, setNsfw] = useState(false);
  const [pow, setPow] = useState(true); // default PoW is ON (16 bits)
  const [poll, setPoll] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [count, setCount] = useState(10);

  const textRef = useRef(text);
  textRef.current = text;
  const onPublishRef = useRef(onPublish);
  onPublishRef.current = onPublish;

  const blank = text.trim().length === 0;
  const canPublish = !blank || Boolean(replyTo);

  const hashtags = useMemo(() => {
    const found = text.match(/#[\p{L}\p{N}_]+/gu) ?? [];
    return Array.from(new Set(found));
  }, [text]);

  // Undo countdown: one interval while active, cleaned up on cancel/unmount.
  useEffect(() => {
    if (!publishing) return;
    const id = window.setInterval(() => {
      setCount((c) => Math.max(0, c - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [publishing]);

  useEffect(() => {
    if (publishing && count === 0) {
      onPublishRef.current(textRef.current);
    }
  }, [publishing, count]);

  const startCountdown = () => {
    setCount(10);
    setPublishing(true);
  };

  const cancelCountdown = () => {
    setPublishing(false);
    setCount(10);
  };

  const secondary = 'text-[var(--wisp-on-surface-variant)]';

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top bar */}
      <div className="flex h-12 shrink-0 items-center gap-2 px-2">
        <button
          type="button"
          aria-label="Back"
          className="grid h-10 w-10 place-items-center"
          onClick={onClose}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-[20px] font-bold">
          {replyTo ? 'Reply' : 'New Post'}
        </h1>
        <button
          type="button"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--wisp-outline)] px-3 py-1.5 text-sm"
          style={{ color: 'var(--wisp-accent)' }}
          onClick={() => setGalleryMode((g) => !g)}
        >
          {galleryMode ? (
            <Image size={18} style={{ color: 'var(--wisp-accent)' }} />
          ) : (
            <GalleryHorizontalEnd size={18} style={{ color: 'var(--wisp-accent)' }} />
          )}
          {galleryMode ? 'Switch to Text' : 'Switch to Gallery'}
        </button>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
        {/* Reply context */}
        {replyTo && (
          <div className="mx-4 rounded-lg p-3" style={{ background: 'rgba(44,44,46,0.5)' }}>
            <div className="flex items-center gap-1.5">
              <WispAvatar seed={replyTo.author.username} className="w-6 h-6" />
              <span className={`text-[12px] ${secondary}`}>Replying to </span>
              <span className="text-[12px] font-medium">{replyTo.author.displayName}</span>
              <ChevronDown size={20} className={`ml-auto ${secondary}`} />
            </div>
            <p className={`mt-1 line-clamp-2 text-[12px] ${secondary}`}>
              {replyTo.note.content.slice(0, 140)}
            </p>
          </div>
        )}

        {/* Text field */}
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className="mx-4 mt-2 h-40 w-auto resize-none rounded-lg border border-[var(--wisp-outline)] bg-transparent p-3 text-[15px] outline-none placeholder:text-[var(--wisp-on-surface-variant)]"
        />

        {/* Toolbar */}
        <div className="mx-3 mt-1 flex items-center">
          <button
            type="button"
            aria-label="Attach image"
            className={`grid h-12 w-12 place-items-center ${secondary}`}
          >
            <Image size={24} />
          </button>
          <button
            type="button"
            aria-label="Mark as NSFW"
            aria-pressed={nsfw}
            className={`grid h-12 w-12 place-items-center ${nsfw ? '' : secondary}`}
            style={nsfw ? { color: 'var(--wisp-error)' } : undefined}
            onClick={() => setNsfw((v) => !v)}
          >
            <TriangleAlert size={24} />
          </button>
          <button
            type="button"
            aria-label="Proof of work"
            aria-pressed={pow}
            className={`grid h-12 w-12 place-items-center ${pow ? '' : secondary}`}
            style={pow ? { color: 'var(--wisp-accent)' } : undefined}
            onClick={() => setPow((v) => !v)}
          >
            <Shield size={24} />
          </button>
          <button
            type="button"
            aria-label="Add poll"
            aria-pressed={poll}
            className={`grid h-12 w-12 place-items-center ${poll ? '' : secondary}`}
            style={poll ? { color: 'var(--wisp-accent)' } : undefined}
            onClick={() => setPoll((v) => !v)}
          >
            <BarChart3 size={24} />
          </button>
          <button
            type="button"
            aria-label="Schedule"
            className={`grid h-12 w-12 place-items-center ${secondary}`}
          >
            <Clock size={24} />
          </button>
          <div className="flex-1" />
          {!blank && (
            <button
              type="button"
              className="px-2 text-sm"
              style={{ color: 'var(--wisp-accent)' }}
            >
              Save draft
            </button>
          )}
        </div>

        {/* Hashtag chips */}
        {hashtags.length > 0 && (
          <div className="mx-4 mt-2 flex flex-wrap gap-1.5">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-xl px-2 py-1 text-[11px]"
                style={{ color: 'var(--wisp-accent)', background: 'rgba(255,152,0,0.12)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Live preview */}
        {!blank && (
          <div className="mx-4 mt-3 rounded-lg border border-[rgba(56,56,58,0.3)] bg-[var(--wisp-surface-variant)] p-3">
            <div className="flex items-center gap-2">
              <WispAvatar seed={currentUser.username} className="w-8 h-8" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{currentUser.displayName}</div>
                <div className={`text-[11px] ${secondary}`}>Preview</div>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-[15px]">
              <RichText text={text} />
            </p>
          </div>
        )}

        {/* NSFW banner */}
        {nsfw && (
          <div
            className="mx-4 mt-2 flex items-center gap-2 rounded-lg p-2.5"
            style={{
              background: 'var(--wisp-error-container)',
              color: 'var(--wisp-on-error-container)',
            }}
          >
            <TriangleAlert size={18} />
            <span className="text-[12px]">Marked as NSFW</span>
          </div>
        )}
      </div>

      {/* Bottom bar: Publish / undo countdown */}
      <div className="mt-auto shrink-0 p-4" data-tour="wisp-post">
        {!publishing ? (
          <button
            type="button"
            disabled={!canPublish}
            className="h-11 w-full rounded-full bg-[var(--wisp-accent)] text-[15px] font-semibold text-white disabled:opacity-[0.35]"
            onClick={startCountdown}
          >
            Publish
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Cancel"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
              style={{ background: '#E53935' }}
              onClick={cancelCountdown}
            >
              <X size={20} color="#FFFFFF" />
            </button>
            <button
              type="button"
              className="relative h-11 flex-1 overflow-hidden rounded-full"
              style={{ background: 'rgba(255,152,0,0.25)' }}
              onClick={() => onPublish(text)}
            >
              <div
                className="wisp-undo-fill absolute inset-y-0 left-0"
                style={
                  {
                    background: 'var(--wisp-accent)',
                    '--wisp-undo-duration': '10s',
                  } as React.CSSProperties
                }
              />
              <div className="absolute inset-0 grid place-items-center font-semibold text-white">
                Post now ({Math.max(1, count)})
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
