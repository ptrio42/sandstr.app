import React, { useState } from 'react';
import type { MockUser, MockNote } from '../../../data/mock';
import { getUserByPubkey } from '../../../data/mock';
import { NoteCard } from '../components/NoteCard';
import { Avatar } from '../components/Avatar';
import { GearIcon, PersonCheckIcon } from '../components/icons';

interface Props {
  currentUser: MockUser | null;
  notes: MockNote[];
  users: MockUser[];
  onOpenDrawer: () => void;
  onOpenThread: (n: MockNote) => void;
  onViewProfile: (u: MockUser) => void;
  onReply: (n: MockNote) => void;
}

export const NotificationsScreen: React.FC<Props> = ({ currentUser, notes, users, onOpenDrawer, onOpenThread, onViewProfile, onReply }) => {
  const [tab, setTab] = useState<'all' | 'zaps' | 'mentions'>('all');
  const me = currentUser?.username || 'sandy';

  const items = notes
    .slice(2, 22)
    .filter((n) => (tab === 'zaps' ? n.zaps > 0 : true))
    .map((note, i) => ({ note, author: getUserByPubkey(note.pubkey) || users[i % users.length], reply: i % 2 === 0 }));

  return (
    <div className="min-h-full bg-[var(--damus-bg)]" data-tour="damus-notifications">
      <header className="sticky top-0 z-30 bg-[var(--damus-bg)]/85 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 pt-2 pb-1">
          <button onClick={onOpenDrawer}><Avatar seed={me} className="w-9 h-9" /></button>
          <div className="flex-1 text-center">
            <div className="font-bold text-[17px] text-[var(--damus-text)] leading-tight">Notifications</div>
            <div className="text-[12px] text-[var(--damus-text-secondary)] -mt-0.5">All</div>
          </div>
          <span className="text-[14px] text-[var(--damus-text-secondary)]">7/13</span>
          <GearIcon className="w-6 h-6 text-[var(--damus-text)]" />
          <PersonCheckIcon className="w-6 h-6 text-[var(--damus-text)]" />
        </div>

        <div className="flex px-2">
          {([['all', 'All'], ['zaps', 'Zaps'], ['mentions', 'Mentions']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className="flex-1 py-2.5 relative text-[16px] font-semibold">
              <span className={tab === id ? 'text-[var(--damus-text)]' : 'text-[var(--damus-text-secondary)]'}>{label}</span>
              {tab === id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full damus-underline" />}
            </button>
          ))}
        </div>
        <div className="h-px bg-[var(--damus-separator)]" />
      </header>

      <div>
        {items.map(({ note, author, reply }) => (
          <NoteCard
            key={note.id}
            note={note}
            author={author}
            replyingTo={reply ? `@${me}` : null}
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

export default NotificationsScreen;
