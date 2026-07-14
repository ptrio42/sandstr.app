import React from 'react';

type IP = { className?: string };
type FilledIP = IP & { filled?: boolean };

const S = 2; // default stroke width

/* ============================ bottom nav ============================ */

export function HomeIcon({ className = 'w-7 h-7', filled }: FilledIP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={S} strokeLinejoin="round" strokeLinecap="round">
      <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 19z" />
    </svg>
  );
}

export function VideoIcon({ className = 'w-7 h-7', filled }: FilledIP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={S} strokeLinejoin="round" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="16" rx="4" fill={filled ? 'currentColor' : 'none'} />
      <path d="M3 8h18" />
      <path d="M10.5 11.2v4.6l4-2.3z" fill={filled ? 'var(--yh-bg)' : 'currentColor'} stroke={filled ? 'var(--yh-bg)' : 'currentColor'} strokeWidth="1.2" />
    </svg>
  );
}

export function WalletIcon({ className = 'w-7 h-7', filled }: FilledIP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={S} strokeLinejoin="round" strokeLinecap="round">
      <path d="M3 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2" />
      <rect x="3" y="7" width="18" height="13" rx="3" />
      <path d="M16 12.5h3.5a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H16a2 2 0 0 1 0-4z" fill={filled ? 'var(--yh-bg)' : 'currentColor'} stroke="none" />
    </svg>
  );
}

export function InboxIcon({ className = 'w-7 h-7', filled }: FilledIP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={S} strokeLinejoin="round" strokeLinecap="round">
      <rect x="3.5" y="4.5" width="17" height="15" rx="4.5" />
      <path d="M8 11.5c1.3 1.8 6.7 1.8 8 0" stroke={filled ? 'var(--yh-bg)' : 'currentColor'} />
    </svg>
  );
}

export function BellIcon({ className = 'w-7 h-7', filled }: FilledIP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={S} strokeLinejoin="round" strokeLinecap="round">
      <path d="M18 16V11a6 6 0 1 0-12 0v5l-1.5 2.5h15z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

/* ============================ note actions ============================ */

export function HeartIcon({ className = 'w-[22px] h-[22px]', filled }: FilledIP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={S} strokeLinejoin="round" strokeLinecap="round">
      <path d="M12 20s-7-4.4-9.2-8.4C1.3 8.9 2.6 5.5 6 5.5c2 0 3.2 1.2 4 2.4.8-1.2 2-2.4 4-2.4 3.4 0 4.7 3.4 3.2 6.1C19 15.6 12 20 12 20z" />
    </svg>
  );
}

export function CommentIcon({ className = 'w-[22px] h-[22px]' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={S} strokeLinejoin="round" strokeLinecap="round">
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H9l-4 3.5V6.5z" />
    </svg>
  );
}

export function RepostIcon({ className = 'w-[22px] h-[22px]' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={S} strokeLinejoin="round" strokeLinecap="round">
      <path d="M4 9V8a3 3 0 0 1 3-3h9l-2.5-2.5M4 9l2.5 2.5" />
      <path d="M20 15v1a3 3 0 0 1-3 3H8l2.5 2.5M20 15l-2.5-2.5" />
    </svg>
  );
}

export function QuoteIcon({ className = 'w-[22px] h-[22px]' }: IP) {
  // the distinctive "99" quote glyph
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" stroke="none">
      <path d="M6.5 5.5c-2 0-3.5 1.6-3.5 3.6 0 1.9 1.4 3.3 3.2 3.3.3 0 .6 0 .8-.1-.4 1.5-1.6 2.7-3.1 3.2l.7 1.5c2.8-.9 4.9-3.4 4.9-6.6 0-2.9-1.5-4.4-3-4.4z" />
      <path d="M17 5.5c-2 0-3.5 1.6-3.5 3.6 0 1.9 1.4 3.3 3.2 3.3.3 0 .6 0 .8-.1-.4 1.5-1.6 2.7-3.1 3.2l.7 1.5c2.8-.9 4.9-3.4 4.9-6.6 0-2.9-1.5-4.4-3-4.4z" />
    </svg>
  );
}

export function ZapIcon({ className = 'w-[22px] h-[22px]', filled }: FilledIP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={S} strokeLinejoin="round" strokeLinecap="round">
      <path d="M13 2 5 13.2a.6.6 0 0 0 .5 1H11l-1 7.8 8-11.2a.6.6 0 0 0-.5-1H12z" />
    </svg>
  );
}

export function TranslateIcon({ className = 'w-[22px] h-[22px]' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
      <path d="M3.5 6h7M7 4.5V6c0 3-1.7 5.4-3.5 6.5M5 9c.6 1.8 2.2 3.3 4 3.8" />
      <path d="M12.5 20l3.4-8.5a.6.6 0 0 1 1.1 0L20.5 20M14 16.5h5.2" />
    </svg>
  );
}

export function EllipsisVIcon({ className = 'w-5 h-5' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" />
    </svg>
  );
}

export function EllipsisHIcon({ className = 'w-5 h-5' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" />
    </svg>
  );
}

/* ============================ top bar / misc ============================ */

export function HistoryIcon({ className = 'w-6 h-6' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <path d="M3.5 8A9 9 0 1 1 3 12" />
      <path d="M3 4v4h4" />
      <path d="M12 8v4.2l2.8 1.7" />
    </svg>
  );
}

export function HexIcon({ className = 'w-6 h-6' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <path d="M12 3.2l7 4v9.6l-7 4-7-4V7.2z" />
      <circle cx="12" cy="12" r="2.4" />
    </svg>
  );
}

export function SlidersIcon({ className = 'w-5 h-5' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <path d="M7 4v6M7 14v6M12 4v3M12 11v9M17 4v9M17 17v3" />
      <circle cx="7" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="9" r="2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="15" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SearchIcon({ className = 'w-5 h-5' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.8-3.8" />
    </svg>
  );
}

export function GearIcon({ className = 'w-6 h-6' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.2 7l1.9 1.1M17.9 15.9l1.9 1.1M4.2 17l1.9-1.1M17.9 8.1l1.9-1.1" />
    </svg>
  );
}

export function ChevronDownIcon({ className = 'w-5 h-5' }: IP) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>;
}

export function ChevronLeftIcon({ className = 'w-6 h-6' }: IP) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>;
}

export function ChevronRightIcon({ className = 'w-5 h-5' }: IP) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>;
}

export function XIcon({ className = 'w-6 h-6' }: IP) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>;
}

export function PlusIcon({ className = 'w-7 h-7' }: IP) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>;
}

export function SendIcon({ className = 'w-6 h-6' }: IP) {
  // paper-plane / navigation send glyph (points up-right)
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
      <path d="M20.4 4.1 4 10.6c-.8.3-.8 1.5.1 1.7l6 1.6 1.6 6c.2.9 1.4.9 1.7.1L20.9 4.7c.3-.7-.3-1.3-.5-.6z" />
    </svg>
  );
}

export function ComposeDmIcon({ className = 'w-7 h-7' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round">
      <path d="M4.5 5.5h9M4.5 11h6.5" />
      <path d="M18 4.2l2 2-7.5 7.5-2.8.8.8-2.8z" fill="currentColor" stroke="currentColor" />
    </svg>
  );
}

export function QrIcon({ className = 'w-5 h-5' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" /><path d="M14 14h3v3M20 14v6M17 20h3" />
    </svg>
  );
}

export function LinkIcon({ className = 'w-4 h-4' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M8 12l-2 2a3 3 0 0 0 4.2 4.2l2-2M16 12l2-2a3 3 0 0 0-4.2-4.2l-2 2" />
    </svg>
  );
}

export function ExternalLinkIcon({ className = 'w-3.5 h-3.5' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 5h5v5M19 5l-8 8M18 14v4a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 18V8a1.5 1.5 0 0 1 1.5-1.5H10" />
    </svg>
  );
}

export function PersonIcon({ className = 'w-4 h-4' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

export function GlobeIcon({ className = 'w-8 h-8' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.4 3.8 5.6 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.6-3.8-9S9.5 5.4 12 3z" />
    </svg>
  );
}

export function BracesIcon({ className = 'w-4 h-4' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4c-2 0-2 1.5-2 3s0 2.5-2 3c2 .5 2 1.5 2 3s0 3 2 3M16 4c2 0 2 1.5 2 3s0 2.5 2 3c-2 .5-2 1.5-2 3s0 3-2 3" />
    </svg>
  );
}

export function CopyIcon({ className = 'w-5 h-5' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function KeyIcon({ className = 'w-6 h-6' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <circle cx="8" cy="8" r="4.5" /><path d="M11.5 11.5 20 20M17 17l2-2M14.5 14.5l2-2" />
    </svg>
  );
}

export function TrashIcon({ className = 'w-5 h-5' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    </svg>
  );
}

export function ArrowUpIcon({ className = 'w-5 h-5' }: IP) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V6M6 12l6-6 6 6" /></svg>;
}

/* ============================ verification / nip05 badges ============================ */

// Orange scalloped seal + white check — YakiHonne "verified" badge.
export function VerifiedRosette({ className = 'w-[18px] h-[18px]' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="verified">
      <path fill="var(--yh-orange)" d="M12 1.6l2.3 1.7 2.8-.4 1 2.7 2.5 1.4-.6 2.8 1.6 2.3-1.6 2.3.6 2.8-2.5 1.4-1 2.7-2.8-.4L12 22.4l-2.3-1.7-2.8.4-1-2.7-2.5-1.4.6-2.8L2 12l1.6-2.3-.6-2.8 2.5-1.4 1-2.7 2.8.4z" />
      <path fill="#fff" d="M10.6 14.6 8.2 12.2l-1.2 1.2 3.6 3.6 6-6-1.2-1.2z" />
    </svg>
  );
}

// NIP-05 "05" rosette badge shown before the nip05 identifier.
export function Nip05Badge({ className = 'w-[18px] h-[18px]' }: IP) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" d="M12 2.4l2 1.5 2.5-.3.9 2.3 2.2 1.3-.5 2.5 1.4 2-1.4 2 .5 2.5-2.2 1.3-.9 2.3-2.5-.3-2 1.5-2-1.5-2.5.3-.9-2.3-2.2-1.3.5-2.5L4 12l-1.4-2 .5-2.5 2.2-1.3.9-2.3 2.5.3z" />
      <text x="12" y="15" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor">05</text>
    </svg>
  );
}
