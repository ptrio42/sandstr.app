import React from 'react';
import { Search } from 'lucide-react';
import { Avatar } from './Avatar';
import { VerifiedBadge } from './ui';
import {
  liveCard, trending, networkStats, hotTopics, trendingUsers,
  latestReads, popularNotes, searchResults, currentUser, relays,
} from '../data';

export type RightVariant = 'home' | 'explore' | 'profile' | 'notifications' | 'bookmarks' | 'settings';

function SearchPill() {
  const [q, setQ] = React.useState('');
  return (
    <div style={{ position: 'relative' }}>
      <div className="primal-search">
        <Search size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." />
      </div>
      {q.trim() !== '' && (
        <div className="primal-searchdrop">
          <div className="primal-searchrow">
            <Search size={18} className="primal-muted" />
            <span>{q}</span>
          </div>
          {searchResults.map((r) => (
            <div key={r.name} className="primal-searchrow">
              <Avatar seed={r.name} className="w-9 h-9" legend={r.legend} />
              <div className="min-w-0 flex-1">
                <div className="primal-note-name truncate" style={{ fontSize: 15 }}>{r.name}</div>
                {r.handle && <div className="primal-note-handle truncate" style={{ fontSize: 13 }}>{r.handle}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.followers}</div>
                <div className="primal-muted" style={{ fontSize: 12 }}>followers</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RightSidebar({ variant }: { variant: RightVariant }) {
  if (variant === 'notifications') {
    return (
      <div className="primal-col-right">
        <SearchPill />
        <div className="primal-side-h strong" style={{ letterSpacing: '0.03em', textTransform: 'uppercase' }}>Summary</div>
        <div className="primal-muted">no new notifications</div>
      </div>
    );
  }

  if (variant === 'explore') {
    return (
      <div className="primal-col-right">
        <div className="primal-statgrid">
          {networkStats.map((s) => (
            <div key={s.label}>
              <div className="primal-stat-num">{s.num}</div>
              <div className="primal-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="primal-side-h strong">Hot Topics</div>
        <div className="primal-topic-tags">
          {hotTopics.map((t) => (<span key={t} className="primal-topic-tag">{t}</span>))}
        </div>
        <div className="primal-side-h strong">Trending Users</div>
        <div className="primal-user-grid">
          {trendingUsers.map((u) => (
            <div key={u.name} className="primal-user-grid-cell">
              <Avatar seed={u.name} className="w-12 h-12" legend={u.legend} />
              <div className="primal-user-grid-name">{u.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className="primal-col-right">
        <SearchPill />
        <div className="primal-side-h">Latest Reads</div>
        {latestReads.map((r, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--primal-border)', paddingBottom: 14, marginBottom: 12 }}>
            <div className="flex items-center gap-2">
              <Avatar seed={currentUser.name} className="w-6 h-6" />
              <span className="primal-note-name" style={{ fontSize: 14 }}>{currentUser.name}</span>
              <span className="primal-muted" style={{ fontSize: 13 }}>· {r.time}</span>
            </div>
            <div className="flex justify-between gap-3 mt-2">
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.25 }}>{r.title}</div>
                <div className="primal-muted" style={{ fontSize: 13, marginTop: 4 }}>{r.read}</div>
              </div>
              <div style={{ width: 64, height: 64, borderRadius: 8, border: '1px solid var(--primal-border)', flexShrink: 0 }} />
            </div>
          </div>
        ))}
        <div className="primal-side-h">Popular Notes</div>
        {popularNotes.map((n, i) => (
          <div key={i} className="primal-trend">
            <Avatar seed={currentUser.name} className="w-9 h-9" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="primal-trend-name">{currentUser.name}</span>
                <span className="primal-muted" style={{ fontSize: 13 }}>| {n.time}</span>
              </div>
              <div className="primal-trend-preview">{n.text}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'bookmarks') {
    return <div className="primal-col-right"><SearchPill /></div>;
  }

  if (variant === 'settings') {
    return (
      <div className="primal-col-right">
        <SearchPill />
        <div className="primal-side-h strong">Relays</div>
        {relays.map((r) => (
          <div key={r.url} className="primal-relay-item">
            <span className="primal-relay-dot" style={{ background: r.up ? 'var(--primal-repost)' : 'var(--primal-live)' }} />
            {r.url}
          </div>
        ))}
        <div className="primal-side-h strong">Caching services</div>
        <div className="primal-relay-item">
          <span className="primal-relay-dot" style={{ background: 'var(--primal-repost)' }} />
          wss://cache2.primal.net/v1
        </div>
      </div>
    );
  }

  // home (default)
  return (
    <div className="primal-col-right">
      <SearchPill />
      <div className="primal-side-h">Live on Nostr</div>
      <div className="primal-live-card">
        <Avatar seed={liveCard.name} className="w-9 h-9" />
        <div className="min-w-0">
          <div className="primal-note-name" style={{ fontSize: 14 }}>{liveCard.name}</div>
          <div className="primal-muted" style={{ fontSize: 12 }}>{liveCard.started}  {liveCard.viewers}</div>
        </div>
        <span className="primal-live-badge"><span className="primal-live-dot" /> Live</span>
      </div>
      <div className="primal-side-h">Trending 4h</div>
      {trending.map((t, i) => (
        <div key={i} className="primal-trend">
          <Avatar seed={t.name} className="w-9 h-9" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="primal-trend-name">{t.name}</span>
              <span className="primal-muted" style={{ fontSize: 13 }}>| {t.time}</span>
            </div>
            <div className="primal-trend-preview">{t.preview}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RightSidebar;
