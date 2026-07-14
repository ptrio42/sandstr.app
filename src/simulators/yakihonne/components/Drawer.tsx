import React from 'react';
import { Avatar } from './Avatar';
import { ChevronRightIcon } from './icons';
import { YakiMark } from './YakiLogo';

const NoteGlyph = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M7 4h8l4 4v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /><path d="M9 11h6M9 15h4" /></svg>
);
const PersonGlyph = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></svg>
);
const BookmarkGlyph = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M7 4h10v16l-5-3.5L7 20z" /></svg>
);
const RelayGlyph = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M5 5l2.5 2.5M19 5l-2.5 2.5M5 19l2.5-2.5M19 19l-2.5-2.5" /></svg>
);
const GearGlyph = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M4 7l1.7 1M18.3 16l1.7 1M4 17l1.7-1M18.3 8l1.7-1" /></svg>
);

export type DrawerDest = 'profile' | 'dashboard' | 'bookmarks' | 'relays' | 'settings';

interface Props {
  seed: string;
  onClose: () => void;
  onNav: (d: DrawerDest) => void;
}

export const Drawer: React.FC<Props> = ({ seed, onClose, onNav }) => {
  const rows: { label: string; Icon: React.FC<{ className?: string }>; dest: DrawerDest }[] = [
    { label: 'My profile', Icon: PersonGlyph, dest: 'profile' },
    { label: 'Home dashboard', Icon: NoteGlyph, dest: 'dashboard' },
    { label: 'Bookmarks', Icon: BookmarkGlyph, dest: 'bookmarks' },
    { label: 'Relay orbits', Icon: RelayGlyph, dest: 'relays' },
    { label: 'Settings', Icon: GearGlyph, dest: 'settings' },
  ];

  return (
    <div className="absolute inset-0 z-[64]">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-[82%] max-w-[320px] bg-[var(--yh-bg)] border-r border-[var(--yh-divider)] flex flex-col">
        {/* account header */}
        <div className="px-5 pt-8 pb-4 border-b border-[var(--yh-divider)]">
          <button onClick={() => onNav('profile')} className="flex items-center gap-3">
            <Avatar seed={seed} className="w-14 h-14" rounded="rounded-2xl" />
            <div className="text-left">
              <div className="text-[18px] font-extrabold">pitiunited</div>
              <div className="text-[13px] text-[var(--yh-text-2)]">All-round buidler.</div>
            </div>
          </button>
          <div className="flex items-center gap-4 mt-3 text-[14px] text-[var(--yh-text-2)]">
            <span><span className="font-bold text-[var(--yh-text)]">2.37K</span> Followings</span>
            <span><span className="font-bold text-[var(--yh-text)]">3.51K</span> Followers</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {rows.map((r) => (
            <button key={r.label} onClick={() => onNav(r.dest)} className="w-full flex items-center gap-4 px-5 py-3.5 text-left">
              <r.Icon className="w-6 h-6 text-[var(--yh-text)]" />
              <span className="flex-1 text-[16px] font-medium">{r.label}</span>
              <ChevronRightIcon className="w-4 h-4 text-[var(--yh-text-3)]" />
            </button>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-[var(--yh-divider)] flex items-center gap-2 text-[var(--yh-text-2)]">
          <YakiMark className="w-4 h-5" color="var(--yh-text-2)" />
          <span className="text-[12px]">SIMULATION · not affiliated</span>
        </div>
      </div>
    </div>
  );
};

export default Drawer;
