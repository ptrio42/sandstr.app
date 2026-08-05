import React from 'react';

/**
 * The disc that sits in the Home toolbar's `.principal` slot.
 *
 * In the real app this is `Image("NosturLogo")` — the 1024² app icon — rendered
 * at 30 pt and `clipShape(Circle())` (Screens/MainTabs/Home/HomeTab.swift), so
 * it reads as a dark disc with a white long-necked bird. Tapping it scrolls the
 * feed to the top.
 *
 * The glyph below is OUR OWN redrawing of that silhouette, not the upstream
 * `Logo Black.svg` path — we reference the design, we do not vendor the artwork.
 * See THIRD-PARTY.md for how that distinction is applied across this repo.
 */
export function NosturMark({ size = 30, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Nostur"
    >
      <defs>
        <linearGradient id="nostur-mark-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4B6065" />
          <stop offset="1" stopColor="#1B262A" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#nostur-mark-bg)" />
      {/* head + crest */}
      <path
        d="M50 13c-7 0-12 3-14 6 3-1 6-1 8 1-4 1-6 3-6 5 0 4 5 6 12 6s12-2 12-6c0-2-2-4-6-5 2-2 5-2 8-1-2-3-7-6-14-6z"
        fill="#fff"
      />
      {/* neck */}
      <path d="M45 32h10l-2 27h-6z" fill="#fff" />
      {/* flared tail / legs */}
      <path d="M50 55l30 33-30-15-30 15z" fill="#fff" />
    </svg>
  );
}

export default NosturMark;
