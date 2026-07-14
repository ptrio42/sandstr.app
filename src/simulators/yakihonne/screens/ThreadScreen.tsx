import React from 'react';
import { OverlayHeader } from '../components/OverlayHeader';
import { NoteCard } from '../components/NoteCard';
import type { YakiNoteData } from '../data';

const replies: YakiNoteData[] = [
  { id: 'r1', name: 'Marina', seed: 'marina', nip05: true, zap: true, timeAgo: '12 minutes ago', content: 'Looks delicious! 🤤', reactions: 2, replies: 0, reposts: 0, quotes: 0, zaps: 21 },
  { id: 'r2', name: 'Bohemia', seed: 'bohemia', timeAgo: '4 minutes ago', content: 'Recipe please 🙏', reactions: 0, replies: 0, reposts: 0, quotes: 0, zaps: 0 },
];

interface Props {
  note: YakiNoteData;
  onBack: () => void;
  onViewProfile: (seed: string, name: string) => void;
  onReply: () => void;
  onZap: (sats: number) => void;
}

export const ThreadScreen: React.FC<Props> = ({ note, onBack, onViewProfile, onReply, onZap }) => (
  <div className="absolute inset-0 z-[56] bg-[var(--yh-bg)] flex flex-col">
    <OverlayHeader title="Thread" onBack={onBack} logo />
    <div className="flex-1 overflow-y-auto">
      <NoteCard note={note} onViewProfile={() => onViewProfile(note.seed, note.name)} onReply={onReply} onZap={onZap} />
      <div className="px-4 py-2 text-[14px] font-semibold text-[var(--yh-text-2)]">Replies</div>
      {replies.map((r) => (
        <NoteCard key={r.id} note={r} onViewProfile={() => onViewProfile(r.seed, r.name)} onReply={onReply} onZap={onZap} />
      ))}
      <div className="h-16" />
    </div>
  </div>
);

export default ThreadScreen;
