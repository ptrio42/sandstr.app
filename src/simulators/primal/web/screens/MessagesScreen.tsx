import React from 'react';
import { Search, Send } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { conversations } from '../data';

export function MessagesScreen() {
  const [active, setActive] = React.useState(0);
  const [tab, setTab] = React.useState<'follows' | 'other'>('follows');
  const convo = conversations[active];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', height: '100%' }}>
      {/* conversation list */}
      <div style={{ borderRight: '1px solid var(--primal-border)', height: '100%', overflowY: 'auto' }}>
        <div className="primal-pagehead">
          <div className="primal-pagetitle" style={{ fontSize: 30 }}>messages</div>
          <div className="primal-tabs">
            <button className={`primal-tab${tab === 'follows' ? ' active' : ''}`} onClick={() => setTab('follows')}>follows</button>
            <button className={`primal-tab${tab === 'other' ? ' active' : ''}`} onClick={() => setTab('other')}>other</button>
            <span className="primal-link" style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 14, cursor: 'pointer', alignSelf: 'center' }}>Mark All Read</span>
          </div>
        </div>
        {conversations.map((c, i) => (
          <div key={c.name} className={`primal-convo${i === active ? ' active' : ''}`} onClick={() => setActive(i)}>
            <Avatar seed={c.name} className="w-12 h-12" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="primal-note-name truncate">{c.name}</span>
                <span className="primal-muted" style={{ fontSize: 13 }}>· {c.time}</span>
                {c.unread > 0 && <span className="primal-unread">{c.unread}</span>}
              </div>
              {c.handle && <div className="primal-note-handle truncate" style={{ fontSize: 14 }}>{c.handle}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* chat pane */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="primal-pagehead" style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 20px' }}>
          <div className="primal-search" style={{ maxWidth: 280 }}><Search size={18} /><input placeholder="find user" /></div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ alignSelf: 'flex-start', maxWidth: '70%', background: 'var(--primal-surface-2)', borderRadius: 16, padding: '10px 16px' }}>
            gm! saw your note about {convo.name.split(' ')[0]} — really solid work ⚡
          </div>
          <div style={{ alignSelf: 'flex-end', maxWidth: '70%', background: 'var(--primal-accent)', color: '#fff', borderRadius: 16, padding: '10px 16px' }}>
            thank you 🙏 means a lot coming from you
          </div>
          <div style={{ alignSelf: 'flex-start', maxWidth: '70%', background: 'var(--primal-surface-2)', borderRadius: 16, padding: '10px 16px' }}>
            keep building 🚀
          </div>
        </div>
        <div style={{ padding: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="primal-search" style={{ flex: 1 }}><input placeholder="Message..." /></div>
          <button className="primal-roundbtn" style={{ background: 'var(--primal-accent)', color: '#fff' }} aria-label="send"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}

export default MessagesScreen;
