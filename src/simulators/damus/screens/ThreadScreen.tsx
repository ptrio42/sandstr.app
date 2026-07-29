import React from 'react';
import type { MockUser, MockNote } from '../../../data/mock';
import { getUserByPubkey } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { NoteCard, Nip05Check, renderContent } from '../components/NoteCard';
import {
  ChevronLeft, EllipsisIcon, ReplyIcon, RepostIcon, ShakaIcon, ZapIcon, ShareIcon,
} from '../components/icons';

interface Props {
  note: MockNote;
  notes: MockNote[];
  users: MockUser[];
  currentUser: MockUser | null;
  onBack: () => void;
  onOpenThread: (n: MockNote) => void;
  onViewProfile: (u: MockUser) => void;
  onReply: (n: MockNote) => void;
}

export const ThreadScreen: React.FC<Props> = ({ note, notes, users, currentUser, onBack, onOpenThread, onViewProfile, onReply }) => {
  const author = getUserByPubkey(note.pubkey) || users[0];
  const replies = notes.filter((n) => n.id !== note.id).slice(0, 6).map((n) => ({ n, a: getUserByPubkey(n.pubkey) || users[0] }));

  return (
    <div className="absolute inset-0 z-[50] flex flex-col bg-[var(--damus-bg)]">
      <header className="flex items-center gap-4 px-4 pt-3 pb-2 border-b border-[var(--damus-separator)] bg-[var(--damus-bg)]">
        <button onClick={onBack}><ChevronLeft className="w-6 h-6 text-[var(--damus-text)]" /></button>
        <span className="font-bold text-[17px] text-[var(--damus-text)]">Thread</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* root note (expanded) */}
        <div className="px-4 pt-3 pb-2 border-b border-[var(--damus-separator)]">
          <div className="flex items-center gap-3">
            <button onClick={() => onViewProfile(author)}><Avatar seed={author.username} className="w-12 h-12" zap={!!author.lightningAddress} /></button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[var(--damus-text)] truncate">{author.displayName}</span>
                {author.nip05 && <Nip05Check />}
                <span className="ml-auto text-[var(--damus-text-secondary)]"><EllipsisIcon className="w-5 h-5" /></span>
              </div>
              <div className="text-[14px] text-[var(--damus-text-secondary)] truncate">@{author.username}</div>
            </div>
          </div>
          <div className="text-[var(--damus-text)] text-[19px] leading-snug whitespace-pre-wrap break-words mt-3">
            {renderContent(note.content)}
          </div>
          {note.images && note.images[0] && (
            <img src={note.images[0]} alt="" className="mt-3 w-full max-h-96 object-cover rounded-2xl" />
          )}
          <div className="text-[14px] text-[var(--damus-text-secondary)] mt-3">
            {new Date(note.created_at * 1000).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })} · {new Date(note.created_at * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="flex items-center justify-between mt-3 py-2 border-y border-[var(--damus-separator)] text-[var(--damus-text-secondary)]">
            <ReplyIcon className="w-6 h-6" />
            <RepostIcon className="w-6 h-6" />
            <ShakaIcon className="w-6 h-6" />
            <ZapIcon className="w-6 h-6" />
            <ShareIcon className="w-6 h-6" />
          </div>
        </div>

        {/* replies */}
        {replies.map(({ n, a }) => (
          <NoteCard
            key={n.id}
            note={n}
            author={a}
            replyingTo={`@${author.username}`}
            onOpenThread={() => onOpenThread(n)}
            onViewProfile={() => onViewProfile(a)}
            onReply={() => onReply(n)}
          />
        ))}
        <div className="h-20" />
      </div>

      {/* reply bar — lifted above the tab bar, which stays mounted on stack pushes */}
      <button
        onClick={() => onReply(note)}
        className="flex items-center gap-3 px-4 py-2.5 border-t border-[var(--damus-separator)] bg-[var(--damus-bg)]"
        style={{ marginBottom: 'calc(50px + env(safe-area-inset-bottom, 16px))' }}
      >
        <Avatar seed={currentUser?.username || 'sandy'} className="w-8 h-8" />
        <span className="flex-1 text-left text-[var(--damus-text-secondary)] text-[16px]">Type your note here...</span>
      </button>
    </div>
  );
};

export default ThreadScreen;
