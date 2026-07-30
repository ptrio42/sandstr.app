import React from 'react';
import { hashSeed } from '../wispData';

interface WispAvatarProps {
  seed: string;
  /** Tailwind size classes for the container, e.g. "w-10 h-10". */
  className?: string;
}

// CSP-safe, offline, deterministic robohash-style avatar (same idiom as the
// other flagship sims — the real Wisp hotlinks profile pictures, which we
// cannot do). Pure inline SVG, no network.
export function WispAvatar({ seed, className = 'w-10 h-10' }: WispAvatarProps) {
  const h = hashSeed(seed || 'anon');
  const bg = h % 360;
  const bg2 = (bg + 45) % 360;
  const headHue = (h >> 9) % 360;
  const eyeType = (h >> 4) & 3;
  const mouthType = (h >> 6) & 3;
  const bigAntenna = ((h >> 11) & 1) === 1;

  const headFill = `hsl(${headHue} 22% ${65 + (h % 20)}%)`;
  const detail = `hsl(${(headHue + 200) % 360} 55% 28%)`;
  const eye = `hsl(${bg2} 75% 48%)`;
  const gid = `wisprob${h.toString(36)}`;

  return (
    <div className={`${className} rounded-full overflow-hidden shrink-0`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label="avatar">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={`hsl(${bg} 62% 56%)`} />
            <stop offset="1" stopColor={`hsl(${bg2} 66% 42%)`} />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#${gid})`} />
        <line x1="50" y1="30" x2="50" y2="15" stroke={detail} strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="12" r={bigAntenna ? 5 : 3.5} fill={eye} />
        <rect x="15" y="45" width="8" height="16" rx="3" fill={headFill} />
        <rect x="77" y="45" width="8" height="16" rx="3" fill={headFill} />
        <rect x="24" y="28" width="52" height="50" rx="13" fill={headFill} />
        {eyeType === 0 && (<><circle cx="39" cy="48" r="6" fill={detail} /><circle cx="61" cy="48" r="6" fill={detail} /></>)}
        {eyeType === 1 && (<><rect x="33" y="43" width="12" height="10" rx="4" fill={eye} /><rect x="55" y="43" width="12" height="10" rx="4" fill={eye} /></>)}
        {eyeType === 2 && (<><circle cx="39" cy="48" r="7" fill={detail} /><circle cx="61" cy="48" r="7" fill={detail} /><circle cx="41" cy="46" r="2" fill="#fff" /><circle cx="63" cy="46" r="2" fill="#fff" /></>)}
        {eyeType === 3 && (<><rect x="31" y="43" width="38" height="11" rx="5" fill={detail} /><circle cx="42" cy="48.5" r="3" fill={eye} /><circle cx="58" cy="48.5" r="3" fill={eye} /></>)}
        {mouthType === 0 && (<rect x="38" y="63" width="24" height="4" rx="2" fill={detail} />)}
        {mouthType === 1 && (<g fill={detail}>{[0, 1, 2, 3].map((i) => (<rect key={i} x={38 + i * 6} y="61" width="4" height="7" rx="1" />))}</g>)}
        {mouthType === 2 && (<rect x="40" y="61" width="20" height="8" rx="3" fill={detail} />)}
        {mouthType === 3 && (<path d="M40 62 Q50 71 60 62" stroke={detail} strokeWidth="3" fill="none" strokeLinecap="round" />)}
      </svg>
    </div>
  );
}
