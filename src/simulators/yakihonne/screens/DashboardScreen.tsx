import React from 'react';
import { Avatar } from '../components/Avatar';
import {
  ChevronLeftIcon, ChevronDownIcon, ChevronRightIcon, PersonIcon, ZapIcon,
  HeartIcon, CommentIcon, EllipsisVIcon,
} from '../components/icons';
import { getSampleImages } from '../../../data/mock';

const NoteGlyph = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M7 4h8l4 4v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /><path d="M9 11h6M9 15h4" /></svg>
);

const stats = [
  { icon: PersonIcon, value: '2.374K', label: 'Followings' },
  { icon: PersonIcon, value: '3.514K', label: 'Followers' },
  { icon: NoteGlyph, value: '3.397K', label: 'Notes' },
  { icon: NoteGlyph, value: '6.577K', label: 'Replies' },
];

const covers = getSampleImages(3);
const latest = [
  { date: 'Jan 26, 2026', title: 'Fat Is Not Optional', likes: 0, comments: 0, zaps: 0, cover: covers[0] },
  { date: 'Jan 25, 2026', title: 'Pulled Beef Tacos in Cheese Shells', likes: 6, comments: 1, zaps: 138, cover: covers[1] },
];

interface Props {
  currentUserSeed: string;
  onBack: () => void;
}

export const DashboardScreen: React.FC<Props> = ({ currentUserSeed, onBack }) => (
  <div className="absolute inset-0 z-[58] bg-[var(--yh-bg)] flex flex-col">
    {/* header */}
    <div className="relative flex items-center justify-center px-3 pt-3 pb-1">
      <button onClick={onBack} aria-label="Back" className="absolute left-2 w-10 h-10 flex items-center justify-center"><ChevronLeftIcon className="w-6 h-6" /></button>
      <span className="yakihonne-feedsel">Home <ChevronDownIcon className="w-5 h-5 text-[var(--yh-text-2)]" /></span>
    </div>

    <div className="flex-1 overflow-y-auto px-4">
      <h1 className="text-[30px] font-extrabold mt-2 mb-3">Home</h1>

      {/* profile + XP */}
      <div className="flex items-center gap-3 rounded-2xl bg-[var(--yh-surface)] border border-[var(--yh-divider)] p-3">
        <Avatar seed={currentUserSeed} className="w-14 h-14" rounded="rounded-full" />
        <div className="flex-1 min-w-0">
          <div className="text-[18px] font-extrabold">pitiunited</div>
          <div className="text-[14px] text-[var(--yh-text-2)]">Joined on: Jul 14</div>
        </div>
        <div className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--yh-surface-2)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#FFC107" strokeWidth="3" strokeLinecap="round" strokeDasharray="97" strokeDashoffset="30" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-[var(--yh-orange)] leading-none">104 xp</span>
            <span className="text-[12px] font-extrabold leading-tight">LVL 2</span>
          </div>
        </div>
        <ChevronRightIcon className="w-5 h-5 text-[var(--yh-text-2)]" />
      </div>

      {/* stats grid */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl bg-[var(--yh-surface)] border border-[var(--yh-divider)] p-4">
            <s.icon className="w-6 h-6 text-[var(--yh-text)]" />
            <div>
              <div className="text-[19px] font-extrabold leading-none">{s.value}</div>
              <div className="text-[14px] text-[var(--yh-text-2)] mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* zaps received / sent */}
      <div className="rounded-2xl bg-[var(--yh-surface)] border border-[var(--yh-divider)] p-4 mt-3 flex items-center gap-3">
        <ZapIcon className="w-7 h-7 text-[var(--yh-text)]" />
        <div className="flex-1"><div className="text-[19px] font-extrabold leading-none">3.348K</div><div className="text-[14px] text-[var(--yh-text-2)] mt-1">Zaps received</div></div>
        <div className="flex-1"><div className="text-[19px] font-extrabold leading-none">537.311K</div><div className="text-[14px] text-[var(--yh-text-2)] mt-1">Total amount</div></div>
      </div>
      <div className="rounded-2xl bg-[var(--yh-surface)] border border-[var(--yh-divider)] p-4 mt-3 flex items-center gap-3">
        <ZapIcon className="w-7 h-7 text-[var(--yh-text)]" />
        <div className="flex-1"><div className="text-[19px] font-extrabold leading-none">0</div><div className="text-[14px] text-[var(--yh-text-2)] mt-1">Zaps sent</div></div>
        <div className="flex-1"><div className="text-[19px] font-extrabold leading-none">0</div><div className="text-[14px] text-[var(--yh-text-2)] mt-1">Total amount</div></div>
      </div>

      {/* latest */}
      <h2 className="text-[20px] font-extrabold mt-6 mb-1">Latest</h2>
      {latest.map((a) => (
        <div key={a.title} className="flex items-center gap-3 rounded-2xl bg-[var(--yh-surface)] border border-[var(--yh-divider)] p-3 mb-3">
          <img src={a.cover} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-[var(--yh-text-2)]">Published on: {a.date}</div>
            <div className="text-[16px] font-bold truncate">{a.title}</div>
            <div className="flex items-center gap-4 mt-1.5 text-[13px] text-[var(--yh-text-2)]">
              <span className="flex items-center gap-1"><HeartIcon className="w-4 h-4" />{a.likes}</span>
              <span className="flex items-center gap-1"><CommentIcon className="w-4 h-4" />{a.comments}</span>
              <span className="flex items-center gap-1"><ZapIcon className="w-4 h-4" />{a.zaps}</span>
              <span className="text-[12px] px-2 py-0.5 rounded-md bg-[var(--yh-surface-2)]">Article</span>
            </div>
          </div>
          <EllipsisVIcon className="w-5 h-5 text-[var(--yh-text-2)]" />
        </div>
      ))}

      <h2 className="text-[20px] font-extrabold mt-4 mb-1">Popular notes</h2>
      <div className="flex items-center gap-3 rounded-2xl bg-[var(--yh-surface)] border border-[var(--yh-divider)] p-3 mb-24">
        <div className="w-16 h-16 rounded-xl bg-[var(--yh-surface-2)] flex items-center justify-center shrink-0"><NoteGlyph className="w-7 h-7 text-[var(--yh-text-2)]" /></div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-[var(--yh-text-2)]">Published on: Apr 09, 2023</div>
          <div className="text-[16px] font-bold">Looks like 69ers are way behind again 😅 #[1]</div>
        </div>
        <EllipsisVIcon className="w-5 h-5 text-[var(--yh-text-2)]" />
      </div>
    </div>
  </div>
);

export default DashboardScreen;
