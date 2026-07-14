import React from 'react';
import { MoreHorizontal, Zap, Mail } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { VerifiedBadge } from '../components/ui';
import { NoteCard } from '../components/NoteCard';
import { currentUser, profileStats, profileMeta, feedNotes, type PNote } from '../data';

interface ProfileScreenProps { onOpenThread: (n: PNote) => void; }

// a couple of the current user's own notes
const ownNotes: PNote[] = [
  { id: 'own1', name: currentUser.name, handle: currentUser.handle, time: '6 hr.', verified: true, body: 'GM 😊', reply: 12, zap: '842', like: 210, repost: 18 },
  { id: 'own2', name: currentUser.name, handle: currentUser.handle, time: '2 days', verified: true, body: 'Shipping something faithful to the real thing today. Reference-first, token-by-token. ⚡', reply: 24, zap: '1 940', like: 331, repost: 41 },
];

export function ProfileScreen({ onOpenThread }: ProfileScreenProps) {
  const [statTab, setStatTab] = React.useState('notes');

  return (
    <div className="primal-profile">
      <div className="primal-banner">
        <div className="primal-profile-avatar-wrap">
          <Avatar seed={currentUser.name} className="w-[110px] h-[110px]" />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '12px 20px' }}>
        <button className="primal-roundbtn" aria-label="more"><MoreHorizontal size={20} /></button>
        <button className="primal-roundbtn" aria-label="zap"><Zap size={20} /></button>
        <button className="primal-roundbtn" aria-label="message"><Mail size={20} /></button>
        <button className="primal-follow following">edit profile</button>
      </div>

      <div style={{ padding: '0 20px 12px' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 24, fontWeight: 800 }}>{currentUser.name}</span>
              <VerifiedBadge size={20} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="primal-muted">{currentUser.handle}</span>
              <span className="primal-topic-tag" style={{ fontSize: 13, padding: '2px 10px' }}>follows you</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div><span style={{ fontWeight: 800 }}>{profileMeta.following}</span> <span className="primal-muted">following</span>  <span style={{ fontWeight: 800 }}>{profileMeta.followers}</span> <span className="primal-muted">followers</span></div>
            <div className="primal-muted" style={{ fontSize: 14, marginTop: 6 }}>{profileMeta.joined}</div>
          </div>
        </div>
        <div style={{ marginTop: 10 }}>{currentUser.bio}</div>
        <a className="primal-link" style={{ display: 'inline-block', marginTop: 8 }}>{currentUser.website}</a>
      </div>

      <div className="primal-statstrip">
        {profileStats.map((s) => (
          <div key={s.l} className={`primal-statcol${statTab === s.l ? ' active' : ''}`} onClick={() => setStatTab(s.l)}>
            <span className="n">{s.n}</span><span className="l">{s.l}</span>
          </div>
        ))}
      </div>

      <div>
        {[...ownNotes, ...feedNotes.slice(0, 2)].map((n) => (
          <NoteCard key={n.id} note={{ ...n, name: currentUser.name, handle: currentUser.handle, verified: true }} onOpen={() => onOpenThread(n)} />
        ))}
      </div>
    </div>
  );
}

export default ProfileScreen;
