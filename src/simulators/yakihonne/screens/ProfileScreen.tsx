import React, { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { NoteCard } from '../components/NoteCard';
import {
  ChevronLeftIcon, EllipsisVIcon, VerifiedRosette, Nip05Badge, LinkIcon, QrIcon, PersonIcon, ZapIcon,
} from '../components/icons';
import { homeNotes } from '../data';

export interface YakiProfile {
  seed: string;
  name: string;
  nip05?: boolean;
  nip05addr?: string;
  website?: string;
  bio?: string;
  followings: string;
  followers: string;
  isSelf?: boolean;
  followsYou?: boolean;
}

const TABS = ['Notes', 'Articles', 'Media', 'Others'] as const;
const SUBTABS = ['Pinned', 'Notes', 'Replies', 'Mentions'] as const;

interface Props {
  profile: YakiProfile;
  onBack: () => void;
  onOpenThread: (id: string) => void;
  onReply: () => void;
  onZap: (sats: number) => void;
}

export const ProfileScreen: React.FC<Props> = ({ profile, onBack, onOpenThread, onReply, onZap }) => {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Notes');
  const [sub, setSub] = useState<(typeof SUBTABS)[number]>('Notes');

  const notes = homeNotes.filter((n) => n.seed === profile.seed);
  const list = notes.length ? notes : homeNotes.slice(0, 3).map((n) => ({ ...n, seed: profile.seed, name: profile.name }));

  // gaps yak-40: 'yakihonne-profile' is the app-bar avatar (earlier in the
  // DOM), so this screen root needs a name of its own to be reachable.
  return (
    <div className="absolute inset-0 z-[55] bg-[var(--yh-bg)] overflow-y-auto" data-tour="yakihonne-profile-screen">
      {/* banner */}
      <div className="relative h-40">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg,#7a117e 0%,#b026c9 45%,#5b1170 100%)' }} />
        <div className="absolute inset-0 flex items-center justify-center text-white/25 text-[46px] font-black tracking-[0.5em] select-none">NOSTR</div>
        <button onClick={onBack} aria-label="Back" className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/45 flex items-center justify-center text-white"><ChevronLeftIcon className="w-5 h-5" /></button>
        <button aria-label="More" className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/45 flex items-center justify-center text-white"><EllipsisVIcon className="w-5 h-5" /></button>
      </div>

      {/* Everything below the banner: avatar, Follow/Edit, name + NIP-05, bio,
          counts and the tab row. The tour's profile step aims here so the
          spotlight is not simply the whole screen. */}
      <div data-tour="yakihonne-profile-id" className="px-4">
        {/* avatar + action */}
        <div className="flex items-start justify-between -mt-9">
          <Avatar seed={profile.seed} className="w-20 h-20 ring-4 ring-[var(--yh-bg)] rounded-full" rounded="rounded-full" />
          <button className={`mt-11 px-5 py-2 rounded-xl text-[15px] font-semibold ${profile.isSelf ? 'bg-[var(--yh-surface-2)] text-[var(--yh-text)]' : 'yakihonne-btn-orange'}`} data-tour="yakihonne-follow">
            {profile.isSelf ? 'Edit profile' : 'Follow'}
          </button>
        </div>

        {/* name */}
        <div className="flex items-center gap-2 mt-2.5">
          <span className="text-[24px] font-extrabold">{profile.name}</span>
          {profile.nip05 && <VerifiedRosette className="w-[19px] h-[19px]" />}
          <QrIcon className="w-[18px] h-[18px] text-[var(--yh-text-2)]" />
        </div>

        {/* nip05 + website */}
        {profile.nip05addr && (
          <div className="flex items-center gap-2 mt-2 text-[15px]">
            <Nip05Badge className="w-[18px] h-[18px] text-[var(--yh-text-2)]" />
            <span className="text-[var(--yh-text)]">{profile.nip05addr}</span>
          </div>
        )}
        {profile.website && (
          <div className="flex items-center gap-2 mt-1.5 text-[15px]">
            <LinkIcon className="w-[17px] h-[17px] text-[var(--yh-text-2)]" />
            <span className="text-[var(--yh-text)]">{profile.website}</span>
          </div>
        )}

        {profile.bio && <p className="text-[15px] mt-2.5">{profile.bio}</p>}

        {/* counts */}
        <div className="flex items-center gap-4 mt-3 text-[15px]">
          <span className="flex items-center gap-1.5 text-[var(--yh-text-2)]">
            <PersonIcon className="w-4 h-4" />
            <span className="font-bold text-[var(--yh-text)]">{profile.followings}</span> Followings
          </span>
          <span className="text-[var(--yh-text-2)]"><span className="font-bold text-[var(--yh-text)]">{profile.followers}</span> Followers</span>
          {profile.followsYou && <span className="text-[12px] px-2 py-1 rounded-md bg-[var(--yh-surface-2)] text-[var(--yh-text-2)]">Follows you</span>}
        </div>

        {/* main tabs */}
        <div className="flex gap-6 mt-4 border-b border-[var(--yh-divider)]">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`pb-2.5 text-[16px] font-semibold ${tab === t ? 'yakihonne-seg-active' : 'text-[var(--yh-text-2)]'}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* sub-tabs (Notes) */}
      {tab === 'Notes' && (
        <div className="flex gap-2 px-4 py-3">
          {SUBTABS.map((s) => (
            <button key={s} onClick={() => setSub(s)} className={`px-3.5 py-1.5 rounded-lg text-[14px] font-medium ${sub === s ? 'bg-[var(--yh-surface-2)] text-[var(--yh-text)]' : 'text-[var(--yh-text-2)]'}`}>{s}</button>
          ))}
        </div>
      )}

      {tab === 'Notes' ? (
        <div>
          {list.map((n) => (
            <NoteCard key={n.id} note={n} onOpenThread={() => onOpenThread(n.id)} onReply={onReply} onZap={onZap} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ZapIcon className="w-9 h-9 text-[var(--yh-text-3)]" />
          <div className="text-[17px] font-bold mt-3">Oops! Nothing to show here!</div>
          <div className="text-[15px] text-[var(--yh-text-2)]">{tab}</div>
        </div>
      )}
      <div className="h-16" />
    </div>
  );
};

export default ProfileScreen;
