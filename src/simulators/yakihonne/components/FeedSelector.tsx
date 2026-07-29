import React from 'react';
import { HistoryIcon, CommentIcon, HexIcon, GlobeIcon, ZapIcon, ChevronDownIcon, XIcon } from './icons';

export type FeedSource = 'recent' | 'recent_replies' | 'trending' | 'global' | 'paid' | 'widgets';

const SOURCES: { id: FeedSource; label: string; Icon: React.FC<{ className?: string }>; desc: string }[] = [
  { id: 'recent', label: 'Recent', Icon: HistoryIcon, desc: 'Latest from people you follow' },
  { id: 'recent_replies', label: 'Recent With Replies', Icon: CommentIcon, desc: 'Following, including replies' },
  { id: 'trending', label: 'Trending', Icon: HexIcon, desc: 'Popular long-form & notes' },
  { id: 'global', label: 'Global', Icon: GlobeIcon, desc: 'Everything across relays' },
  { id: 'paid', label: 'Paid', Icon: ZapIcon, desc: 'Paid relays only' },
  { id: 'widgets', label: 'Widgets', Icon: HexIcon, desc: 'Smart widgets feed' },
];

const WidgetIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.8" />
  </svg>
);

interface TriggerProps {
  value: FeedSource;
  onOpen: () => void;
}

// Trigger button only. The picker sheet itself (FeedSourceSheet) is rendered by the
// simulator ROOT as a sibling of TabBar/Drawer — never inside the sticky header, where
// `absolute inset-0` would collapse to the 62px header box and clip the sheet.
export const FeedSelector: React.FC<TriggerProps> = ({ value, onOpen }) => {
  const current = SOURCES.find((s) => s.id === value)!;
  const Icon = value === 'widgets' ? WidgetIcon : current.Icon;

  return (
    <button className="yakihonne-feedsel" onClick={onOpen} data-tour="yakihonne-feedsel">
      <Icon className="w-[22px] h-[22px]" />
      <span>{current.label}</span>
      <ChevronDownIcon className="w-5 h-5 text-[var(--yh-text-2)]" />
    </button>
  );
};

interface SheetProps {
  value: FeedSource;
  onChange: (s: FeedSource) => void;
  onClose: () => void;
}

// Bottom sheet listing the 6 community feed sources. Mount at the simulator root
// (same overlay pattern as ComposeSheet / Drawer) so `absolute inset-0` spans the phone.
export const FeedSourceSheet: React.FC<SheetProps> = ({ value, onChange, onClose }) => (
  <div className="absolute inset-0 z-[70]" onClick={onClose}>
    <div className="absolute inset-0 bg-black/50" />
    <div
      className="absolute left-0 right-0 bottom-0 rounded-t-3xl bg-[var(--yh-surface)] border-t border-[var(--yh-divider)] pt-2 pb-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mx-auto w-10 h-1 rounded-full bg-[var(--yh-border-strong)] mb-3" />
      <div className="flex items-center justify-between px-5 pb-2">
        <span className="text-[17px] font-bold">Choose a feed</span>
        <button onClick={onClose} className="text-[var(--yh-text-2)]"><XIcon className="w-6 h-6" /></button>
      </div>
      {SOURCES.map((s) => {
        const SIcon = s.id === 'widgets' ? WidgetIcon : s.Icon;
        const activeItem = s.id === value;
        return (
          <button
            key={s.id}
            onClick={() => { onChange(s.id); onClose(); }}
            className="w-full flex items-center gap-3.5 px-5 py-3 text-left"
          >
            <span className={`w-9 h-9 rounded-full flex items-center justify-center ${activeItem ? 'bg-[var(--yh-orange)] text-white' : 'bg-[var(--yh-chip)] text-[var(--yh-text)]'}`}>
              <SIcon className="w-[18px] h-[18px]" />
            </span>
            <span className="flex-1">
              <span className={`block text-[15px] font-semibold ${activeItem ? 'text-[var(--yh-orange)]' : 'text-[var(--yh-text)]'}`}>{s.label}</span>
              <span className="block text-[12px] text-[var(--yh-text-2)]">{s.desc}</span>
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

export default FeedSelector;
