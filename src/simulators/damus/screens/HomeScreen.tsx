import React, { useState } from 'react';
import type { MockUser, MockNote } from '../../../data/mock';
import { getUserByPubkey } from '../../../data/mock';
import { NoteCard } from '../components/NoteCard';
import { Avatar } from '../components/Avatar';
import { DamusLogo } from '../components/DamusLogo';

interface HomeScreenProps {
  currentUser: MockUser | null;
  notes: MockNote[];
  users: MockUser[];
  onOpenDrawer: () => void;
  onOpenThread: (note: MockNote) => void;
  onViewProfile: (user: MockUser) => void;
  onReply: (note: MockNote) => void;
  onOpenRelays: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser, notes, users, onOpenDrawer, onOpenThread, onViewProfile, onReply, onOpenRelays,
}) => {
  const [tab, setTab] = useState<'notes' | 'replies'>('notes');

  const feed = notes.slice(0, 25).map((note) => ({
    note,
    author: getUserByPubkey(note.pubkey) || users[0],
    reposter: note.isRepost && note.repostedBy ? getUserByPubkey(note.repostedBy) : null,
  }));

  return (
    <div className="min-h-full bg-[var(--damus-bg)]" data-tour="damus-home">
      {/* Top bar: avatar (drawer) · Damus logo · relay count */}
      <header className="damus-topbar">
        <div className="flex items-center justify-between px-4 pt-2 pb-1.5">
          <button onClick={onOpenDrawer} aria-label="Open menu">
            <Avatar seed={currentUser?.username || 'sandy'} className="w-9 h-9" />
          </button>
          <DamusLogo className="w-8 h-8" />
          <button onClick={onOpenRelays} className="text-[15px] text-[var(--damus-text-secondary)] font-medium w-9 text-right">
            7/13
          </button>
        </div>

        {/* Notes / Notes & Replies */}
        <div className="flex">
          {([['notes', 'Notes'], ['replies', 'Notes & Replies']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 py-2.5 relative text-[16px] font-semibold"
            >
              <span className="relative inline-block">
                <span className={tab === id ? 'text-[var(--damus-text)]' : 'text-[var(--damus-text-secondary)]'}>{label}</span>
                {tab === id && <span className="absolute -bottom-[7px] -left-1 -right-1 h-[3px] rounded-full damus-underline" />}
              </span>
            </button>
          ))}
        </div>
        <div className="h-px bg-[var(--damus-separator)]" />
      </header>

      {/* Feed */}
      <div>
        {feed.map(({ note, author, reposter }) => (
          <NoteCard
            key={note.id}
            note={note}
            author={author}
            reposter={reposter}
            onOpenThread={() => onOpenThread(note)}
            onViewProfile={() => onViewProfile(author)}
            onReply={() => onReply(note)}
          />
        ))}
        <div className="h-24" />
      </div>
    </div>
  );
};

export default HomeScreen;
