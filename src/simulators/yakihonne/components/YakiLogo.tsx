import React from 'react';

/**
 * YakiHonne logo mark — the angular, folded-paper / flame glyph that appears (white)
 * in the Article / Notifications / Settings headers. Approximated as inline SVG from
 * the recording; CSP-safe. Real app ships it as a vector asset.
 */
export function YakiMark({ className = 'w-7 h-7', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" role="img" aria-label="YakiHonne">
      {/* main folded blade leaning up-right */}
      <path d="M17 44 L27 4 L33 8 L26 40 Z" fill={color} />
      {/* secondary shard (the fold) */}
      <path d="M9 30 L23 6 L26 16 L16 44 Z" fill={color} opacity="0.92" />
      {/* thin accent tip */}
      <path d="M30 12 L39 20 L34 30 L29 22 Z" fill={color} opacity="0.8" />
    </svg>
  );
}

/**
 * Squircle brand tile — purple background + white mark. Matches the app icon shown in
 * the Settings footer ("YakiHonne v1.9.8+179") and used on the login screen.
 */
export function YakiTile({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <div
      className={`${className} rounded-[26%] flex items-center justify-center shrink-0`}
      style={{ background: 'linear-gradient(150deg, #86318c 0%, #6b218d 100%)' }}
    >
      <YakiMark className="w-[58%] h-[58%]" color="#ffffff" />
    </div>
  );
}

export default YakiMark;
