import React, { useState } from 'react';
import { AudioLines, Camera, Image as ImageIcon, Send, Video, X } from 'lucide-react';
import type { MockNote, MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';

/**
 * New Post. Teal `X` close, teal `paperplane` send, avatar + the placeholder
 * "What's happening?", and an attachment strip along the bottom
 * (photo · camera · video · GIF · voice) — the row that sits above the keyboard
 * in the recording.
 */
export function ComposeScreen({
  account,
  replyTo,
  onClose,
  onPost,
}: {
  account: MockUser;
  replyTo: { note: MockNote; author: MockUser } | null;
  onClose: () => void;
  /** Carries the composed text so the host can preview it (composeBridge.ts). */
  onPost: (text: string) => void;
}) {
  const [text, setText] = useState('');

  return (
    <div
      className="absolute inset-0 z-[80] flex flex-col"
      style={{ background: 'var(--nostur-list-bg)' }}
      role="dialog"
      aria-label="New post"
      data-tour="nostur-compose"
    >
      <div className="flex shrink-0 items-center px-3 py-2" style={{ minHeight: 44 }}>
        <button type="button" onClick={onClose} aria-label="Close">
          <X className="h-6 w-6" style={{ color: 'var(--nostur-accent)' }} />
        </button>
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => onPost(text)}
          aria-label="Send"
          data-tour="nostur-send"
          style={{ color: 'var(--nostur-accent)', opacity: text.trim() ? 1 : 0.4 }}
        >
          <Send className="h-6 w-6" />
        </button>
      </div>

      {replyTo && (
        <p className="shrink-0 px-4 pb-2 text-[14px]" style={{ color: 'var(--nostur-secondary)' }}>
          Replying to{' '}
          <span style={{ color: 'var(--nostur-accent)' }}>@{replyTo.author.username}</span>
        </p>
      )}

      <div className="nostur-scroll flex gap-3 px-4">
        <Avatar seed={account.pubkey} size={40} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's happening?"
          aria-label="Post text"
          className="min-h-[140px] w-full flex-1 resize-none bg-transparent text-[17px] outline-none"
          style={{ color: 'var(--nostur-primary)' }}
        />
      </div>

      <div
        className="flex shrink-0 items-center gap-6 px-5 pt-3"
        style={{
          borderTop: '1px solid var(--nostur-separator)',
          color: 'var(--nostur-accent)',
          // Clear the home indicator the frame draws at bottom:8px.
          paddingBottom: 'calc(18px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <ImageIcon className="h-[22px] w-[22px]" />
        <Camera className="h-[22px] w-[22px]" />
        <Video className="h-[22px] w-[22px]" />
        <span className="rounded border px-1 text-[11px] font-bold leading-tight">GIF</span>
        <AudioLines className="h-[22px] w-[22px]" />
      </div>
    </div>
  );
}

export default ComposeScreen;
