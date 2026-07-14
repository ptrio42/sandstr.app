import React from 'react';
import { UserPlus, Heart, Zap, MessageCircle, Repeat2, AtSign } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { notifications, type PNotif, type NotifType } from '../data';

const TABS = ['ALL', 'ZAPS', 'REPLIES', 'MENTIONS', 'REPOSTS'] as const;
type NTab = (typeof TABS)[number];

const iconFor: Record<NotifType, { Icon: React.ComponentType<any>; color: string; fill?: boolean }> = {
  follow: { Icon: UserPlus, color: 'var(--primal-text-2)' },
  like: { Icon: Heart, color: 'var(--primal-like)', fill: true },
  zap: { Icon: Zap, color: 'var(--primal-zap)', fill: true },
  reply: { Icon: MessageCircle, color: 'var(--primal-accent)' },
  repost: { Icon: Repeat2, color: 'var(--primal-repost)' },
  mention: { Icon: AtSign, color: 'var(--primal-accent)' },
};

const verbFor: Record<NotifType, string> = {
  follow: 'followed you',
  like: 'liked your note',
  zap: 'zapped your note',
  reply: 'replied to your note',
  repost: 'reposted your note',
  mention: 'mentioned you',
};

function Row({ n }: { n: PNotif }) {
  const { Icon, color, fill } = iconFor[n.type];
  return (
    <div className="primal-notif">
      <div className="primal-notif-icon" style={{ color }}>
        <Icon size={22} fill={fill ? color : 'none'} />
      </div>
      <div className="primal-notif-body">
        <div className="flex items-start">
          <div>
            {n.legend && <span style={{ color: 'var(--primal-legend)' }}>⭐ </span>}
            <span className="primal-note-name">{n.name}</span>{' '}
            {n.type === 'zap' && n.sats ? (
              <span className="primal-muted">zapped your note for a total of <span style={{ color: 'var(--primal-zap)', fontWeight: 700 }}>{n.sats} sats</span></span>
            ) : (
              <span className="primal-muted">{verbFor[n.type]}</span>
            )}
          </div>
          <span className="primal-notif-time">{n.time}</span>
        </div>
        {n.note && <div className="primal-muted" style={{ marginTop: 6, fontSize: 15 }}>{n.note}</div>}
      </div>
    </div>
  );
}

export function NotificationsScreen() {
  const [tab, setTab] = React.useState<NTab>('ALL');
  const filtered = notifications.filter((n) => {
    if (tab === 'ALL') return true;
    if (tab === 'ZAPS') return n.type === 'zap';
    if (tab === 'REPLIES') return n.type === 'reply';
    if (tab === 'MENTIONS') return n.type === 'mention';
    if (tab === 'REPOSTS') return n.type === 'repost';
    return true;
  });

  return (
    <div>
      <div className="primal-pagehead">
        <div className="primal-pagetitle">notifications</div>
        <div className="primal-tabs">
          {TABS.map((t) => (
            <button key={t} className={`primal-tab primal-tab-upper${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        {tab === 'ALL' && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 2px' }}>
            <button className="primal-newpill">99+ new notifications</button>
          </div>
        )}
        {filtered.map((n) => (<Row key={n.id} n={n} />))}
      </div>
    </div>
  );
}

export default NotificationsScreen;
