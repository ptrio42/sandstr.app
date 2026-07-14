import React from 'react';
import type { MockUser, MockNote } from '../../../data/mock';
import { getUserByPubkey } from '../../../data/mock';
import { NoteCard } from '../components/NoteCard';
import { ChevronLeft } from '../components/icons';

interface Props {
  notes: MockNote[];
  users: MockUser[];
  onBack: () => void;
  onOpenThread: (n: MockNote) => void;
  onViewProfile: (u: MockUser) => void;
  onReply: (n: MockNote) => void;
}

export const BookmarksScreen: React.FC<Props> = ({ notes, users, onBack, onOpenThread, onViewProfile, onReply }) => {
  const feed = notes.slice(4, 12).map((n) => ({ n, a: getUserByPubkey(n.pubkey) || users[0] }));
  return (
    <div className="absolute inset-0 z-[52] flex flex-col bg-[var(--damus-bg)]">
      <header className="flex items-center px-4 pt-3 pb-2 border-b border-[var(--damus-separator)]">
        <button onClick={onBack} className="w-8"><ChevronLeft className="w-6 h-6 text-[var(--damus-text)]" /></button>
        <span className="flex-1 text-center font-bold text-[17px] text-[var(--damus-text)]">Bookmarks</span>
        <button className="text-[15px] text-[var(--damus-purple)]">Clear All</button>
      </header>
      <div className="flex-1 overflow-y-auto">
        {feed.map(({ n, a }) => (
          <NoteCard key={n.id} note={n} author={a} onOpenThread={() => onOpenThread(n)} onViewProfile={() => onViewProfile(a)} onReply={() => onReply(n)} />
        ))}
        <div className="h-16" />
      </div>
    </div>
  );
};

export default BookmarksScreen;
