import React from 'react';

/**
 * YakiHonne logo mark — the angular, folded-paper / flame glyph that appears (white)
 * in the onboarding, Article / Notifications / Settings headers.
 *
 * Path data is VERBATIM from the brand asset shipped in this repo
 * (`public/icons/yakihonne.svg`, 6 paths, brand purple #7A117E); only the white
 * backing rect is dropped and the fill is parameterised so headers can tint it.
 * The viewBox is cropped to the glyph's own bounds so it fills the box it is
 * given. CSP-safe inline SVG — no asset fetch.
 */
const YAKI_PATHS = [
  'M526.038 417.094L574.205 137.519L548.516 486.061L460.532 566.892L384.106 863.523L425.53 617.877L421.035 479.571L526.038 417.094Z',
  'M517.039 281.038L573.556 137.543L517.039 332.207V405.623L360.016 505.551L381.851 852.238L290.334 356.308L517.039 281.038Z',
  'M481.409 641.697L394.387 841.738L502.281 624.084L567.787 562.164V493.197L481.409 564.944V641.697Z',
  'M672.49 360.723L584.185 422.459V519.236L668.316 437.662L672.49 360.723Z',
  'M623.655 305.509L576.451 138.84L644.847 293.273L685.63 269.728L682.739 336.284L620.764 383.931L623.655 305.509Z',
  'M655.115 227.659L577.728 137L661.537 202.073L710.668 185.203L705.529 246.011L655.115 275.119V227.659Z',
];

export function YakiMark({ className = 'w-7 h-7', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="288 135 425 731" className={className} fill={color} role="img" aria-label="YakiHonne">
      {YAKI_PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}
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
