import React from 'react';
import { Search, Zap } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { VerifiedBadge } from '../components/ui';
import { exploreFeeds, explorePeople, hotTopics } from '../data';

const TABS = ['Feeds', 'People', 'Zaps', 'Media', 'Topics'] as const;
type ETab = (typeof TABS)[number];

export function ExploreScreen() {
  const [tab, setTab] = React.useState<ETab>('Feeds');
  const [following, setFollowing] = React.useState<Record<string, boolean>>({});

  return (
    <div>
      <div className="primal-pagehead">
        <div style={{ padding: '14px 20px 0' }}>
          <div className="primal-search"><Search size={18} /><input placeholder="Search..." /></div>
        </div>
        <div className="primal-tabs" style={{ marginTop: 12, alignItems: 'center' }}>
          {TABS.map((t) => (
            <button key={t} className={`primal-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
          <span className="primal-link" style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Advanced Search</span>
        </div>
      </div>

      {tab === 'Feeds' && (
        <div className="primal-feedgrid">
          {exploreFeeds.map((f) => (
            <div key={f.title} className="primal-feedcard">
              <div className="flex gap-3 items-start">
                <Avatar seed={f.title} className="w-11 h-11" />
                <div className="min-w-0">
                  <div className="primal-feedcard-title">{f.title}</div>
                  <div className="primal-feedcard-desc">{f.desc}</div>
                </div>
              </div>
              <div className="primal-freepill">FREE</div>
              <div className="primal-feedcard-stats">
                <span className="inline-flex items-center gap-1.5">♡ {f.likes}</span>
                {f.zaps > 0 && <span className="inline-flex items-center gap-1.5"><Zap size={14} /> {f.zaps}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'People' && (
        <div>
          {explorePeople.map((p) => (
            <div key={p.name} className="primal-person">
              <Avatar seed={p.name} className="w-12 h-12" legend={p.legend} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="primal-note-name">{p.name}</span>
                  {p.verified && <VerifiedBadge />}
                  <span className="primal-note-handle truncate">{p.handle}</span>
                </div>
                <div className="primal-muted truncate" style={{ fontSize: 14 }}>{p.bio}</div>
                <div className="primal-muted" style={{ fontSize: 13, marginTop: 2 }}>{p.followers} followers</div>
              </div>
              <button
                className={`primal-follow primal-follow-btn${following[p.name] ? ' following' : ''}`}
                data-tour="primal-follow"
                onClick={() => setFollowing((s) => ({ ...s, [p.name]: !s[p.name] }))}
              >
                {following[p.name] ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'Zaps' && (
        <div>
          {explorePeople.map((p, i) => (
            <div key={p.name} className="primal-person">
              <div style={{ width: 22, fontWeight: 800, color: 'var(--primal-text-2)' }}>{i + 1}</div>
              <Avatar seed={p.name} className="w-11 h-11" legend={p.legend} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="primal-note-name">{p.name}</span>{p.verified && <VerifiedBadge />}</div>
                <div className="primal-muted truncate" style={{ fontSize: 14 }}>{p.handle}</div>
              </div>
              <span className="primal-zappill"><Zap size={15} fill="var(--primal-zap)" color="var(--primal-zap)" /><span className="primal-zapamt">{(21000 - i * 2600).toLocaleString()}</span></span>
            </div>
          ))}
        </div>
      )}

      {tab === 'Media' && (
        <div style={{ padding: 20, color: 'var(--primal-text-2)' }} />
      )}

      {tab === 'Topics' && (
        <div style={{ padding: 20 }}>
          <div className="primal-topic-tags">
            {hotTopics.map((t) => (<span key={t} className="primal-topic-tag" style={{ fontSize: 15, padding: '8px 16px' }}>#{t}</span>))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExploreScreen;
