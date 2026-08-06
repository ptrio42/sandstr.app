import React, { useState } from 'react';
import type { MockUser, MockNote } from '../../../data/mock';
import { getUserByPubkey } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { NoteCard, Nip05Check } from '../components/NoteCard';
import { ChevronLeft, EllipsisIcon, CopyIcon } from '../components/icons';

interface Props {
  user: MockUser | null;
  currentUser: MockUser | null;
  notes: MockNote[];
  users: MockUser[];
  onBack: () => void;
  onOpenThread: (n: MockNote) => void;
  onViewProfile: (u: MockUser) => void;
  onReply: (n: MockNote) => void;
}

export const ProfileScreen: React.FC<Props> = ({ user, currentUser, notes, users, onBack, onOpenThread, onViewProfile, onReply }) => {
  const u = user || currentUser || users[0];
  const isMe = !!currentUser && u.username === currentUser.username;
  const [following, setFollowing] = useState(!isMe);
  const [tab, setTab] = useState<'notes' | 'replies'>('notes');

  const npub = 'npub1' + u.username.padEnd(6, 'x').slice(0, 6) + '…' + (u.pubkey || '').slice(-6);
  const userNotes = notes.filter((n) => n.pubkey === u.pubkey);
  const feed = userNotes.map((n) => ({ n, a: getUserByPubkey(n.pubkey) || u }));

  return (
    <div className="absolute inset-0 z-[50] flex flex-col bg-[var(--damus-bg)]" data-tour="damus-profile">
      <div className="flex-1 overflow-y-auto">
        {/* banner — plain dark in the recording, no gradient */}
        <div className="relative h-32 bg-[var(--damus-bg-secondary)]">
          <button onClick={onBack} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/35 backdrop-blur flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/35 backdrop-blur flex items-center justify-center">
            <EllipsisIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="px-4">
          {/* avatar + follow/edit */}
          <div className="flex items-end justify-between -mt-10">
            <div className="rounded-full ring-4 ring-[var(--damus-bg)]">
              <Avatar seed={u.username} className="w-[84px] h-[84px]" zap={!!u.lightningAddress} />
            </div>
            <div className="flex items-center gap-2 mb-1">
              {isMe ? (
                <button data-tour="damus-follow" className="damus-btn damus-btn-outline text-[15px] px-5 py-2">
                  Edit
                </button>
              ) : (
                <button
                  data-tour="damus-follow"
                  onClick={() => setFollowing((f) => !f)}
                  className={`damus-btn text-[15px] px-5 py-2 ${following ? 'damus-btn-outline' : 'bg-[var(--damus-text)] text-[var(--damus-bg)]'}`}
                >
                  {following ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          {/* identity */}
          <div className="mt-2">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[22px] text-[var(--damus-text)]">{u.displayName}</span>
              {u.nip05 && <Nip05Check className="w-[18px] h-[18px]" />}
            </div>
            <div className="text-[15px] text-[var(--damus-text-secondary)]">@{u.username}</div>
            <button className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--damus-bg-secondary)] text-[13px] text-[var(--damus-text-secondary)]">
              {npub} <CopyIcon className="w-4 h-4" />
            </button>
            {u.nip05 && <div className="text-[15px] text-[var(--damus-purple)] mt-2">{u.nip05}</div>}
            {u.lightningAddress && <div className="text-[15px] text-[var(--damus-bitcoin)] mt-1">⚡ {u.lightningAddress}</div>}
            <p className="text-[16px] text-[var(--damus-text)] leading-snug mt-2 whitespace-pre-wrap">{u.bio}</p>
            <div className="flex gap-4 text-[15px] mt-3">
              <span className="text-[var(--damus-text)]"><b>{u.followingCount.toLocaleString()}</b> <span className="text-[var(--damus-text-secondary)]">Following</span></span>
              <span className="text-[var(--damus-text)]"><b>{u.followersCount.toLocaleString()}</b> <span className="text-[var(--damus-text-secondary)]">Followers</span></span>
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="flex mt-4 border-b border-[var(--damus-separator)]">
          {([['notes', 'Notes'], ['replies', 'Notes & Replies']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className="flex-1 py-3 relative text-[15px] font-semibold">
              <span className="relative inline-block">
                <span className={tab === id ? 'text-[var(--damus-text)]' : 'text-[var(--damus-text-secondary)]'}>{label}</span>
                {tab === id && <span className="absolute -bottom-[7px] -left-1 -right-1 h-[3px] rounded-full damus-underline" />}
              </span>
            </button>
          ))}
        </div>

        <div>
          {feed.map(({ n, a }) => (
            <NoteCard key={n.id} note={n} author={a} onOpenThread={() => onOpenThread(n)} onViewProfile={() => onViewProfile(a)} onReply={() => onReply(n)} />
          ))}
          {/* real empty state: Damus renders a blank timeline — never other users' notes */}
          <div className="h-24" />
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
