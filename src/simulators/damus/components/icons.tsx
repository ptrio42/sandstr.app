import React from 'react';

/**
 * Damus icon set. The app ships custom bundled iconography (not SF Symbols); the
 * distinctive ones are the note action row — reply · repost · shaka "like" · zap · share —
 * where the default "like" reaction is Damus's shaka hand, not a heart.
 */

type P = { className?: string; filled?: boolean };
const S = (p: React.SVGProps<SVGSVGElement>) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...p,
});

/* ---- tab bar ---- */
export const HomeIcon = ({ className, filled }: P) => (
  <svg {...S({ className, fill: filled ? 'currentColor' : 'none', strokeWidth: filled ? 0 : 1.9 })}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </svg>
);
export const MailIcon = ({ className, filled }: P) => (
  <svg {...S({ className, fill: filled ? 'currentColor' : 'none', strokeWidth: filled ? 0 : 1.9 })}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" fill={filled ? 'currentColor' : 'none'} />
    <path d="M4 7.5 12 13l8-5.5" stroke={filled ? '#000' : 'currentColor'} />
  </svg>
);
export const SearchIcon = ({ className }: P) => (
  <svg {...S({ className })}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);
export const BellIcon = ({ className, filled }: P) => (
  <svg {...S({ className, fill: filled ? 'currentColor' : 'none', strokeWidth: filled ? 0 : 1.9 })}>
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" stroke={filled ? '#000' : 'currentColor'} />
  </svg>
);

/* ---- note action row ---- */
export const ReplyIcon = ({ className }: P) => (
  <svg {...S({ className })}>
    <path d="M20 11.5a7.5 7.5 0 0 1-10.6 6.8L4 20l1.3-4.2A7.5 7.5 0 1 1 20 11.5Z" />
  </svg>
);
export const RepostIcon = ({ className }: P) => (
  <svg {...S({ className })}>
    <path d="M4 9V7a2 2 0 0 1 2-2h11" />
    <path d="m14 2 3 3-3 3" />
    <path d="M20 15v2a2 2 0 0 1-2 2H7" />
    <path d="m10 22-3-3 3-3" />
  </svg>
);
// Shaka hand — Damus's default "like" reaction (not a heart).
export const ShakaIcon = ({ className, filled }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor"
    strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 10.5 5.2 8.7a1.6 1.6 0 0 0-2.3 2.3l3 3c1.1 2.4 3 4 6 4 3.6 0 6-2.4 6-6v-2.2a1.5 1.5 0 0 0-3 0V11" />
    <path d="M18 9.8 20.6 7a1.6 1.6 0 0 0-2.3-2.2L15 8.2" />
    <path d="M12 12.5v-2M9.5 12.5v-1.5" />
  </svg>
);
export const ZapIcon = ({ className, filled }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 4.5 13.2a.6.6 0 0 0 .5 1H11l-1 7.8 8.5-11.2a.6.6 0 0 0-.5-1H12z" />
  </svg>
);
export const ShareIcon = ({ className }: P) => (
  <svg {...S({ className })}>
    <path d="M12 15V3" />
    <path d="m8 7 4-4 4 4" />
    <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
  </svg>
);

/* ---- misc / chrome ---- */
export const GearIcon = ({ className }: P) => (
  <svg {...S({ className, strokeWidth: 1.7 })}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.6l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
  </svg>
);
export const PersonCheckIcon = ({ className }: P) => (
  <svg {...S({ className, strokeWidth: 1.7 })}>
    <path d="M15 19a6 6 0 0 0-12 0" />
    <circle cx="9" cy="7" r="4" />
    <path d="m16 11 2 2 4-4" />
  </svg>
);
export const FilterIcon = ({ className }: P) => (
  <svg {...S({ className })}>
    <path d="M3 5h18l-7 8v6l-4 2v-8z" />
  </svg>
);
export const ChevronRight = ({ className }: P) => (
  <svg {...S({ className, strokeWidth: 2 })}><path d="m9 6 6 6-6 6" /></svg>
);
export const ChevronLeft = ({ className }: P) => (
  <svg {...S({ className, strokeWidth: 2.2 })}><path d="m15 6-6 6 6 6" /></svg>
);
export const EllipsisIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>
);
export const PlusIcon = ({ className }: P) => (
  <svg {...S({ className, strokeWidth: 2.4 })}><path d="M12 5v14M5 12h14" /></svg>
);
export const CopyIcon = ({ className }: P) => (
  <svg {...S({ className, strokeWidth: 1.7 })}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></svg>
);
export const QrIcon = ({ className }: P) => (
  <svg {...S({ className, strokeWidth: 1.7 })}>
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M21 14v7h-7v-3" />
  </svg>
);
export const SmilePlusIcon = ({ className }: P) => (
  <svg {...S({ className, strokeWidth: 1.7 })}>
    <path d="M22 11v1a10 10 0 1 1-6-9" /><path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <path d="M9 9h.01M15 9h.01M19 3v4M17 5h4" />
  </svg>
);

/* side-menu glyphs */
export const PersonIcon = ({ className }: P) => (
  <svg {...S({ className, strokeWidth: 1.7 })}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const WalletIcon = ({ className }: P) => (
  <svg {...S({ className, strokeWidth: 1.7 })}><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /><circle cx="17" cy="14" r="1.2" fill="currentColor" stroke="none" /></svg>
);
export const OstrichIcon = ({ className }: P) => (
  // "Damus Purple" glyph (an ostrich), always rendered in magenta
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M15.5 3.2c-2.7 0-4.8 2-5 4.6-2 .5-3.4 2.2-3.4 4.3 0 .9.3 1.7.7 2.4L5 20.6h2.3l1.5-4c.6.3 1.3.5 2 .5h.3l-1.4 3.5h2.2l1.4-3.7c1.9-.6 3.2-2.2 3.4-4.2l1.9-1.1c.6-.4 1-1 1-1.8V6.1c0-.5-.4-.9-.9-.9-.4 0-.7.2-.9.5-.6-1.5-2-2.5-3.7-2.5zm.7 3.1a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z" />
  </svg>
);
export const MuteIcon = ({ className }: P) => (
  <svg {...S({ className, strokeWidth: 1.7 })}><path d="M11 5 6 9H3v6h3l5 4z" /><path d="m22 9-6 6M16 9l6 6" /></svg>
);
export const RelayIcon = ({ className }: P) => (
  <svg {...S({ className, strokeWidth: 1.7 })}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.4 4 5.6 4 9s-1.5 6.6-4 9c-2.5-2.4-4-5.6-4-9s1.5-6.6 4-9z" /></svg>
);
export const BookmarkIcon = ({ className, filled }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12a1 1 0 0 1 1 1v16l-7-4.5L5 21V5a1 1 0 0 1 1-1z" /></svg>
);
export const StoreIcon = ({ className }: P) => (
  <svg {...S({ className, strokeWidth: 1.7 })}><path d="M4 9V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" /><path d="M3 9h18l-1 3a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0z" /><path d="M5 12v8h14v-8" /></svg>
);
export const LogoutIcon = ({ className }: P) => (
  <svg {...S({ className, strokeWidth: 1.7 })}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
);
export const BitcoinBadge = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className}>
    <circle cx="12" cy="12" r="11" fill="#F7931A" />
    <path d="M15.3 10.6c.2-1.3-.8-2-2.1-2.4l.4-1.7-1-.3-.4 1.7-.8-.2.4-1.7-1-.3-.4 1.7-2-.5-.3 1.1s.8.2.7.2c.4.1.5.4.5.6l-1.1 4.6c-.1.2-.2.4-.5.3 0 0-.7-.2-.7-.2l-.5 1.2 1.9.5-.4 1.8 1 .3.4-1.8.8.2-.4 1.7 1 .3.4-1.8c1.8.3 3.1.2 3.7-1.4.5-1.3 0-2-.9-2.5.7-.2 1.2-.6 1.3-1.6zm-2.3 3.3c-.3 1.3-2.5.6-3.2.4l.6-2.3c.7.2 3 .5 2.6 1.9zm.3-3.3c-.3 1.2-2.1.6-2.7.4l.5-2.1c.6.2 2.5.4 2.2 1.7z" fill="#fff" />
  </svg>
);
export const CloseIcon = ({ className }: P) => (
  <svg {...S({ className, strokeWidth: 2.2 })}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
