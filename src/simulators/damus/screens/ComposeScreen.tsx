import React, { useState } from 'react';
import type { MockUser, MockNote } from '../../../data/mock';
import { getUserByPubkey } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { renderContent, Nip05Check } from '../components/NoteCard';
import { ChevronLeft, EllipsisIcon } from '../components/icons';

interface ComposeScreenProps {
  currentUser: MockUser | null;
  users: MockUser[];
  replyTo?: MockNote | null;
  onPost: (content: string) => void;
  onCancel: () => void;
}

// Damus new-note screen. Full-screen (not a sheet). Post button turns magenta when there's
// content. NO character limit / progress ring — Nostr notes are uncapped.
export const ComposeScreen: React.FC<ComposeScreenProps> = ({ currentUser, users, replyTo, onPost, onCancel }) => {
  const [content, setContent] = useState('');
  const canPost = content.trim().length > 0;
  const parentAuthor = replyTo ? getUserByPubkey(replyTo.pubkey) || users[0] : null;

  return (
    <div className="absolute inset-0 z-[55] flex flex-col bg-[var(--damus-bg)]">
      {/* Cancel / Post */}
      <div className="flex items-center justify-between px-4 pt-3 pb-3">
        <button onClick={onCancel} className="damus-btn damus-btn-pill px-5 py-2 text-[16px]">Cancel</button>
        <button
          onClick={() => canPost && onPost(content.trim())}
          disabled={!canPost}
          data-tour="damus-post"
          className={`damus-btn damus-btn-cta px-6 py-2 text-[16px] ${canPost ? 'damus-btn-gradient' : 'bg-[var(--damus-bg-tertiary)] text-[var(--damus-text-secondary)]'}`}
        >
          Post
        </button>
      </div>
      <div className="h-px bg-[var(--damus-separator)]" />

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {replyTo && parentAuthor && (
          <div className="flex gap-3">
            <div className="flex flex-col items-center shrink-0">
              <Avatar seed={parentAuthor.username} className="w-11 h-11" zap={!!parentAuthor.lightningAddress} />
              <div className="w-0.5 flex-1 my-1 bg-[var(--damus-separator)]" />
            </div>
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-[var(--damus-text)]">{parentAuthor.displayName}</span>
                <span className="text-[var(--damus-text-secondary)] text-[15px]">@{parentAuthor.username}</span>
                {parentAuthor.nip05 && <Nip05Check />}
                <span className="text-[var(--damus-text-secondary)]">· 1h</span>
                <span className="ml-auto text-[var(--damus-text-secondary)]"><EllipsisIcon className="w-5 h-5" /></span>
              </div>
              <div className="text-[var(--damus-text)] text-[17px] leading-snug whitespace-pre-wrap mt-0.5">
                {renderContent(replyTo.content.slice(0, 240))}
              </div>
              <div className="text-[14px] text-[var(--damus-text-secondary)] mt-2">
                Replying to <span className="text-[var(--damus-purple)]">@{parentAuthor.username}</span>
              </div>
            </div>
          </div>
        )}

        {/* your reply / new note */}
        <div className="flex gap-3 mt-1">
          <Avatar seed={currentUser?.username || 'sandy'} className="w-11 h-11" zap={!!currentUser?.lightningAddress} />
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your note here..."
            className="flex-1 bg-transparent resize-none border-0 focus:outline-none text-[18px] text-[var(--damus-text)] placeholder-[var(--damus-text-secondary)] min-h-[160px] pt-1.5"
          />
        </div>
      </div>

      {/* Compose toolbar */}
      <div className="flex items-center gap-6 px-5 py-3 border-t border-[var(--damus-separator)] text-[var(--damus-purple)]">
        <ToolbarIcon path="M4 16l4.6-4.6a2 2 0 0 1 2.8 0L16 16m-2-2 1.6-1.6a2 2 0 0 1 2.8 0L20 14M4 6h16v12H4z" />
        <ToolbarIcon path="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        <ToolbarIcon path="M14.8 11.2 11.6 9A1 1 0 0 0 10 9.9v4.3a1 1 0 0 0 1.6.8l3.2-2.1a1 1 0 0 0 0-1.7z M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
        <ToolbarIcon path="M3 6h18M7 12h10M10 18h4" />
        <ToolbarIcon path="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2 M12 4v16 M9 20h6" />
      </div>
    </div>
  );
};

function ToolbarIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      {path.split(' M').map((d, i) => <path key={i} d={(i === 0 ? d : 'M' + d)} />)}
    </svg>
  );
}

export default ComposeScreen;
