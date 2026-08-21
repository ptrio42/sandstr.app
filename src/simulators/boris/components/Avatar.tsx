import { hashSeed } from '../borisData';

interface BorisAvatarProps {
  seed: string;
  /** Tailwind size classes for the container, e.g. "h-8 w-8". */
  className?: string;
}

/**
 * CSP-safe, offline, deterministic robohash-style avatar — the repo-wide idiom
 * (the real Boris renders whatever picture a nostr profile points at, which we
 * cannot fetch). Pure inline SVG, no network, seed hashed with FNV-1a.
 */
export function BorisAvatar({ seed, className = 'h-8 w-8' }: BorisAvatarProps) {
  const h = hashSeed(seed || 'anon');
  const bg = h % 360;
  const bg2 = (bg + 40) % 360;
  const headHue = (h >> 9) % 360;
  const eyeType = (h >> 4) & 3;
  const mouthType = (h >> 6) & 3;

  const headFill = `hsl(${headHue} 20% ${64 + (h % 18)}%)`;
  const detail = `hsl(${(headHue + 205) % 360} 52% 26%)`;
  const eye = `hsl(${bg2} 72% 46%)`;
  const gid = `borisav${h.toString(36)}`;

  return (
    <div className={`${className} shrink-0 overflow-hidden rounded-full`}>
      <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="avatar">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={`hsl(${bg} 60% 54%)`} />
            <stop offset="1" stopColor={`hsl(${bg2} 64% 40%)`} />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#${gid})`} />
        <line x1="50" y1="30" x2="50" y2="16" stroke={detail} strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="13" r="3.5" fill={eye} />
        <rect x="16" y="45" width="8" height="16" rx="3" fill={headFill} />
        <rect x="76" y="45" width="8" height="16" rx="3" fill={headFill} />
        <rect x="25" y="28" width="50" height="50" rx="13" fill={headFill} />
        {eyeType === 0 && (
          <>
            <circle cx="39" cy="48" r="6" fill={detail} />
            <circle cx="61" cy="48" r="6" fill={detail} />
          </>
        )}
        {eyeType === 1 && (
          <>
            <rect x="33" y="43" width="12" height="10" rx="4" fill={eye} />
            <rect x="55" y="43" width="12" height="10" rx="4" fill={eye} />
          </>
        )}
        {eyeType === 2 && (
          <>
            <circle cx="39" cy="48" r="7" fill={detail} />
            <circle cx="61" cy="48" r="7" fill={detail} />
            <circle cx="41" cy="46" r="2" fill="#fff" />
            <circle cx="63" cy="46" r="2" fill="#fff" />
          </>
        )}
        {eyeType === 3 && (
          <>
            <rect x="31" y="43" width="38" height="11" rx="5" fill={detail} />
            <circle cx="42" cy="48.5" r="3" fill={eye} />
            <circle cx="58" cy="48.5" r="3" fill={eye} />
          </>
        )}
        {mouthType === 0 && <rect x="38" y="63" width="24" height="4" rx="2" fill={detail} />}
        {mouthType === 1 && (
          <g fill={detail}>
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={38 + i * 6} y="61" width="4" height="7" rx="1" />
            ))}
          </g>
        )}
        {mouthType === 2 && <rect x="40" y="61" width="20" height="8" rx="3" fill={detail} />}
        {mouthType === 3 && (
          <path d="M40 62 Q50 71 60 62" stroke={detail} strokeWidth="3" fill="none" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}
