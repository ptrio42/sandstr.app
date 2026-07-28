import React from 'react';
import { Avatar } from '../components/Avatar';
import { SlidersIcon, SearchIcon, ChevronDownIcon, VideoIcon } from '../components/icons';
import { getSampleImages } from '../../../data/mock';

const tiles = getSampleImages(8);
const seeds = ['mariah2100', 'zenzapper', 'marinka', 'sandy', 'bohemya', 'dallen', 'fife', 'stlouie88'];

interface Props {
  currentUserSeed: string;
  onOpenDrawer: () => void;
  onOpenSearch: () => void;
}

export const MediaScreen: React.FC<Props> = ({ currentUserSeed, onOpenDrawer, onOpenSearch }) => (
  <div className="min-h-full">
    <header className="sticky top-0 z-30 bg-[color-mix(in_srgb,var(--yh-bg)_88%,transparent)] backdrop-blur-xl">
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2.5">
        <button onClick={onOpenDrawer} aria-label="Menu">
          <Avatar seed={currentUserSeed} className="w-9 h-9" rounded="rounded-full" />
        </button>
        <span className="yakihonne-feedsel">
          <VideoIcon className="w-[20px] h-[20px]" /> Media <ChevronDownIcon className="w-5 h-5 text-[var(--yh-text-2)]" />
        </span>
        <div className="flex items-center gap-2">
          <button className="yakihonne-appbar-chip" aria-label="Filter"><SlidersIcon className="w-5 h-5" /></button>
          <button className="yakihonne-appbar-chip" aria-label="Search" onClick={onOpenSearch}><SearchIcon className="w-5 h-5" /></button>
        </div>
      </div>
    </header>

    {/* masonry media grid */}
    <div className="px-2 pt-1 columns-2 gap-2 [column-fill:_balance]">
      {tiles.map((src, i) => (
        <div key={i} className="mb-2 break-inside-avoid rounded-2xl overflow-hidden relative">
          <img src={src} alt="" className="w-full object-cover" style={{ height: 150 + (i % 3) * 46 }} />
          <div className="absolute left-2 bottom-2">
            <Avatar seed={seeds[i % seeds.length]} className="w-7 h-7 ring-2 ring-black/40" />
          </div>
        </div>
      ))}
    </div>
    <div className="h-28" />
  </div>
);

export default MediaScreen;
