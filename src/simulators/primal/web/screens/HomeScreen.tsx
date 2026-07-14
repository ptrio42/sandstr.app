import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ComposeBox } from '../components/ComposeBox';
import { NoteCard } from '../components/NoteCard';
import { feedNotes, type PNote } from '../data';

interface HomeScreenProps {
  composeOpen: boolean;
  onOpenCompose: () => void;
  onCloseCompose: () => void;
  onPost: (text: string) => void;
  onOpenThread: (n: PNote) => void;
}

export function HomeScreen({ composeOpen, onOpenCompose, onCloseCompose, onPost, onOpenThread }: HomeScreenProps) {
  return (
    <div>
      <ComposeBox open={composeOpen} onOpen={onOpenCompose} onClose={onCloseCompose} onPost={onPost} />
      <div className="primal-pagehead">
        <button className="primal-feedselector">Trending 24h <ChevronDown size={18} /></button>
      </div>
      <div className="primal-feed" data-tour="primal-feed">
        {feedNotes.map((n, i) => (
          <NoteCard key={n.id} note={n} onOpen={() => onOpenThread(n)} zapTourHook={i === 0} />
        ))}
      </div>
    </div>
  );
}

export default HomeScreen;
