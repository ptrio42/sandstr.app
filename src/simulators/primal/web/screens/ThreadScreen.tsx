import React from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { NoteCard } from '../components/NoteCard';
import { currentUser, type PNote } from '../data';

const replies: PNote[] = [
  { id: 'r1', name: 'Zen Zapper', handle: 'zen@zenzapper.example', time: '18 hr.', verified: true, body: 'This is the way. Signal over noise, every time. ⚡', reply: 2, zap: '441', like: 58, repost: 4 },
  { id: 'r2', name: 'D4ta D0ll', handle: 'd4ta@d0ll.example', time: '17 hr.', body: 'Bookmarked. Need to reread this later.', reply: 0, zap: '77', like: 19, repost: 1 },
];

export function ThreadScreen({ note, onBack, onOpenThread }: { note: PNote; onBack: () => void; onOpenThread: (n: PNote) => void }) {
  return (
    <div>
      <div className="primal-pagehead" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px' }}>
        <button onClick={onBack} aria-label="back" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primal-text)', display: 'flex' }}>
          <ArrowLeft size={22} />
        </button>
        <span className="primal-feedselector" style={{ padding: 0 }}>Thread <ChevronDown size={18} /></span>
      </div>

      <NoteCard note={note} />

      {/* reply composer */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--primal-border)' }}>
        <div className="primal-muted" style={{ fontSize: 14, marginBottom: 10 }}>Replying to this Note</div>
        <div className="flex gap-3 items-center">
          <Avatar seed={currentUser.name} className="w-10 h-10" />
          <div className="primal-search" style={{ flex: 1 }}><input placeholder="Reply..." /></div>
          <button className="primal-btn-pill primal-btn-post">Post</button>
        </div>
      </div>

      {replies.map((r) => (
        <NoteCard key={r.id} note={r} onOpen={() => onOpenThread(r)} />
      ))}
    </div>
  );
}

export default ThreadScreen;
