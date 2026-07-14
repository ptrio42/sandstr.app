import React from 'react';
import { ChevronDown } from 'lucide-react';
import { NoteCard } from '../components/NoteCard';
import { bookmarkedNotes, type PNote } from '../data';

export function BookmarksScreen({ onOpenThread }: { onOpenThread: (n: PNote) => void }) {
  return (
    <div>
      <div className="primal-pagehead">
        <button className="primal-feedselector">Bookmarked Notes <ChevronDown size={18} /></button>
      </div>
      {bookmarkedNotes.map((n) => (
        <NoteCard key={n.id} note={n} onOpen={() => onOpenThread(n)} />
      ))}
    </div>
  );
}

export default BookmarksScreen;
