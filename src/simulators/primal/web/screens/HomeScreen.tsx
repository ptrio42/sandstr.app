import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
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

/**
 * Home feeds — per screen-map.md the real list is server-driven; hardcode the
 * documented defaults ("Trending 24h" default + "Latest") plus the one feed
 * name that IS in the repo (constants.ts trendingFeed: "Trending, my network").
 * No invented descriptions.
 */
type FeedId = 'trending24' | 'latest' | 'trending-network';
const FEEDS: { id: FeedId; label: string }[] = [
  { id: 'latest', label: 'Latest' },
  { id: 'trending24', label: 'Trending 24h' },
  { id: 'trending-network', label: 'Trending, my network' },
];

/** Rough recency in hours from the mock relative-time strings ("23 hr.", "1 day"). */
function ageHours(t: string): number {
  const n = parseFloat(t) || 0;
  if (t.includes('min')) return n / 60;
  if (t.includes('hr')) return n;
  if (t.includes('day')) return n * 24;
  if (t.includes('wk')) return n * 24 * 7;
  if (t.includes('mo')) return n * 24 * 30;
  if (t.includes('yr')) return n * 24 * 365;
  return n;
}

function feedFor(id: FeedId): PNote[] {
  switch (id) {
    case 'latest':
      // newest first
      return [...feedNotes].sort((a, b) => ageHours(a.time) - ageHours(b.time));
    case 'trending-network':
      // "my network" = the accounts you'd follow → verified subset, by zaps
      return feedNotes
        .filter((n) => n.verified)
        .sort((a, b) => parseInt(b.zap.replace(/\D/g, ''), 10) - parseInt(a.zap.replace(/\D/g, ''), 10));
    case 'trending24':
    default:
      return feedNotes; // curated order mirrors the recording
  }
}

export function HomeScreen({ composeOpen, onOpenCompose, onCloseCompose, onPost, onOpenThread }: HomeScreenProps) {
  const [feedId, setFeedId] = React.useState<FeedId>('trending24');
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  // close on outside click
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const current = FEEDS.find((f) => f.id === feedId)!;
  const notes = feedFor(feedId);

  return (
    <div>
      <ComposeBox open={composeOpen} onOpen={onOpenCompose} onClose={onCloseCompose} onPost={onPost} />
      <div className="primal-pagehead">
        <div className="primal-feedselect-wrap" ref={wrapRef}>
          <button
            className="primal-feedselector"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {current.label}
            <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 120ms ease' }} />
          </button>
          {open && (
            <div className="primal-feeddrop" role="listbox">
              <div className="primal-feeddrop-caption">
                <span className="primal-feeddrop-title">Notes Feed:</span>
                <button className="primal-feeddrop-edit" onClick={() => setOpen(false)}>Edit Feeds</button>
              </div>
              <div className="primal-feeddrop-list">
                {FEEDS.map((f) => (
                  <button
                    key={f.id}
                    className="primal-feeddrop-item"
                    role="option"
                    aria-selected={f.id === feedId}
                    onClick={() => { setFeedId(f.id); setOpen(false); }}
                  >
                    <span>{f.label}</span>
                    {f.id === feedId && <span className="primal-feeddrop-check"><Check size={16} /></span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="primal-feed" data-tour="primal-feed">
        {notes.map((n, i) => (
          <NoteCard key={n.id} note={n} onOpen={() => onOpenThread(n)} zapTourHook={i === 0} />
        ))}
      </div>
    </div>
  );
}

export default HomeScreen;
