import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { VerifiedBadge } from '../components/ui';
import { getSampleImages } from '../../../../data/mock/utils';

const READS = [
  { author: 'ODELL', handle: 'odell@primal.net', verified: true, legend: true, title: 'Bitcoin Privacy Is a Practice, Not a Product', summary: 'Freedom tech only matters if people actually use it. A practical guide to reclaiming your privacy one habit at a time.', read: '7 min read', time: '2 days' },
  { author: 'Lyn Alden', handle: 'lyn@lynalden.com', verified: true, title: 'The Fiat Ratchet and the Long Game', summary: 'Why monetary debasement compounds slowly, then all at once — and what a hard-money base layer changes about the calculus.', read: '12 min read', time: '4 days' },
  { author: 'Gigi', handle: 'gigi@primal.net', verified: true, title: '21 Lessons, Revisited', summary: 'What deep diving down the rabbit hole taught me about money, time, and self-sovereignty.', read: '9 min read', time: '1 wk.' },
];

export function ReadsScreen() {
  const thumbs = READS.map(() => getSampleImages(1)[0]);
  return (
    <div>
      <div className="primal-pagehead">
        <button className="primal-feedselector">Reads <ChevronDown size={18} /></button>
      </div>
      {READS.map((r, i) => (
        <div key={r.title} className="primal-note" style={{ cursor: 'pointer' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
            <Avatar seed={r.author} className="w-7 h-7" legend={r.legend} />
            <span className="primal-note-name" style={{ fontSize: 14 }}>{r.author}</span>
            {r.verified && <VerifiedBadge size={14} />}
            <span className="primal-muted" style={{ fontSize: 13 }}>· {r.time}</span>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{r.title}</div>
              <div className="primal-muted" style={{ marginTop: 8, fontSize: 15, lineHeight: 1.4 }}>{r.summary}</div>
              <div className="primal-muted" style={{ marginTop: 10, fontSize: 13 }}>{r.read}</div>
            </div>
            <div style={{ width: 132, height: 132, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
              <img src={thumbs[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReadsScreen;
