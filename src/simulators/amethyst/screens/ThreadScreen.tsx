import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { MaterialCard, PostData } from '../components/MaterialCard';
import '../amethyst.theme.css';

interface ThreadScreenProps {
  post: PostData;
  onBack: () => void;
}

// Note / thread detail (verified vs the screen recording): the tapped note at the
// top, its replies below (indented with a connector line), and a "reply here.."
// composer pinned at the bottom.
const replies: PostData[] = [
  { id: 'rep1', author: { name: 'sandwich', handle: 'sandwich', avatar: '', nip05: 'sandwich', isVerified: true }, content: 'GM ☀️', timestamp: '3d', stats: { replies: 1, reposts: 0, zaps: 0, likes: 2 } },
  { id: 'rep2', author: { name: 'pitiunited', handle: 'thisbitcointhing.com', avatar: '', nip05: 'thisbitcointhing.com', isVerified: true }, content: 'GM ☕', timestamp: '4d', stats: { replies: 0, reposts: 0, zaps: 100, likes: 1 } },
  { id: 'rep3', author: { name: 'Matt', handle: 'matt', avatar: '', nip05: 'matt', isVerified: false }, content: 'GM #nostr 🦩 ☕😊🙏\n\nOff for breakfast then a swim today, gotta make the most of the good stuff.', timestamp: '4d', stats: { replies: 2, reposts: 1, zaps: 21, likes: 5 } },
];

export function ThreadScreen({ post, onBack }: ThreadScreenProps) {
  const [reply, setReply] = useState('');
  const canSend = reply.trim().length > 0;

  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-[var(--md-background)]">
      <div className="md-app-bar md-app-bar-enhanced">
        <button onClick={onBack} aria-label="Back" className="md-app-bar-icon-btn">
          <ArrowLeft className="w-6 h-6 text-[var(--md-on-surface)]" />
        </button>
        <h1 className="flex-1 font-semibold text-[var(--md-on-surface)] px-1">Thread</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <MaterialCard post={post} />
        <div className="mt-1 ml-3 pl-3 border-l-2 border-[var(--md-outline-variant)] space-y-2">
          {replies.map((r) => <MaterialCard key={r.id} post={r} />)}
        </div>
      </div>

      {/* Reply composer */}
      <div className="flex items-center gap-2 p-2 border-t border-[var(--md-outline-variant)] safe-area-bottom bg-[var(--md-surface)]">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="reply here.."
          className="flex-1 bg-[var(--md-surface-variant)] rounded-full px-4 py-2.5 text-[var(--md-on-surface)] outline-none placeholder:text-[var(--md-on-surface-variant)]"
        />
        <button
          onClick={() => setReply('')}
          disabled={!canSend}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold ${
            canSend ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)]' : 'bg-[var(--md-surface-variant)] text-[var(--md-on-surface-variant)]'
          }`}
        >
          Post
        </button>
      </div>
    </div>
  );
}
