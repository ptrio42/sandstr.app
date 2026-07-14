import React, { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { XIcon, SendIcon, ChevronDownIcon } from '../components/icons';

const ImageIcon = ({ className = 'w-[22px] h-[22px]' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="8.5" cy="9.5" r="1.8" /><path d="M4 17l5-5 4 4 3-2 4 4" /></svg>
);
const GifIcon = ({ className = 'w-[22px] h-[22px]' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="14" rx="3" /><text x="12" y="15.5" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="currentColor" stroke="none">GIF</text></svg>
);
const ToolsIcon = ({ className = 'w-[22px] h-[22px]' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
);
const CalendarIcon = ({ className = 'w-[22px] h-[22px]' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 9h17M8 3v4M16 3v4" /></svg>
);

interface Props {
  currentUserSeed: string;
  replyTo?: { name: string; seed: string; content: string; when: string } | null;
  onClose: () => void;
  onPost: (text: string) => void;
}

export const ComposeSheet: React.FC<Props> = ({ currentUserSeed, replyTo, onClose, onPost }) => {
  const [text, setText] = useState('');
  const canPost = text.trim().length > 0;

  return (
    <div className="absolute inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      {/* sheet — rendered at its final ~92% height (no enter animation; preview freezes springs) */}
      <div className="absolute left-0 right-0 bottom-0 h-[92%] rounded-t-3xl bg-[var(--yh-bg)] border-t border-[var(--yh-divider)] flex flex-col">
        <div className="mx-auto w-10 h-1 rounded-full bg-[var(--yh-border-strong)] mt-2" />

        {/* header */}
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-[var(--yh-surface-2)] flex items-center justify-center">
            <XIcon className="w-5 h-5" />
          </button>
          <span className="text-[18px] font-extrabold">Compose</span>
          <button
            onClick={() => canPost && onPost(text)}
            aria-label="Send"
            data-tour="yakihonne-post"
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white bg-[var(--yh-orange)] transition ${canPost ? '' : 'opacity-90'}`}
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {/* reply context */}
          {replyTo && (
            <div className="flex gap-3 pb-1">
              <div className="flex flex-col items-center">
                <Avatar seed={replyTo.seed} className="w-9 h-9" />
                <div className="w-px flex-1 bg-[var(--yh-border-strong)] mt-1" />
              </div>
              <div className="flex-1 min-w-0 pb-3">
                <div className="text-[13px] text-[var(--yh-text-2)]">{replyTo.when}</div>
                <div className="text-[15px] mt-0.5">{replyTo.content}</div>
                <div className="text-[14px] text-[var(--yh-orange)] mt-2">Replying to: {replyTo.name}</div>
              </div>
            </div>
          )}

          {/* input */}
          <div className="flex gap-3 pt-2 items-start">
            <Avatar seed={currentUserSeed} className="w-9 h-9" />
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write something…"
              className="flex-1 bg-transparent outline-none resize-none text-[17px] text-[var(--yh-text)] placeholder:text-[var(--yh-text-2)] min-h-[120px]"
            />
          </div>
        </div>

        {/* bottom toolbar */}
        <div className="flex items-center gap-6 px-5 py-3 border-t border-[var(--yh-divider)] text-[var(--yh-text)]">
          <button aria-label="Image"><ImageIcon /></button>
          <button aria-label="GIF"><GifIcon /></button>
          <button aria-label="Mention" className="text-[19px] font-bold w-[22px] text-center leading-none">@</button>
          <button aria-label="Tools"><ToolsIcon /></button>
          <button aria-label="Schedule"><CalendarIcon /></button>
          <span className="ml-auto"><ChevronDownIcon className="w-5 h-5 text-[var(--yh-text-2)]" /></span>
        </div>
      </div>
    </div>
  );
};

export default ComposeSheet;
