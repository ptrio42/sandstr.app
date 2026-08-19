import React from 'react';

/**
 * Deterministic, CSP-safe, offline robohash-style avatar — the shared pattern
 * already used by Amethyst, Damus and Primal. Same seed always yields the same
 * robot, and nothing leaves the browser.
 *
 * This replaces the DiceBear hotlinks the old Snort sim used (2026-07-28 review,
 * B5: signed-in Snort was loading 27 remote images, each carrying the visitor's
 * IP and a per-profile seed to a third-party CDN while the front page claimed
 * "nothing leaves your browser").
 *
 * Real Snort's own default avatar is itself a remote robohash-style URL
 * (`nostr-rs-api.v0l.io/avatar/cyberpunks/<pubkey>.webp`, screen-map §4.2), so
 * a locally-drawn robot is the faithful substitute, not a downgrade.
 */
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

interface AvatarProps {
  seed: string;
  /** Tailwind size/shape classes. Snort's note avatar is 48px → "w-12 h-12". */
  className?: string;
  /**
   * Web-of-trust distance badge (`FollowDistanceIndicator`): a 16px chip with a
   * 10px check, green for self/following, orange at distance 2 with >10 mutual
   * friends, hidden beyond that.
   */
  distance?: 0 | 1 | 2 | null;
}

export function Avatar({ seed, className = 'w-12 h-12', distance = null }: AvatarProps) {
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
  const gid = `snortbg${h.toString(36)}`;

  const showBadge = distance !== null && distance <= 2;

  return (
    <div className={`${className} shrink-0 relative`}>
      <div className="w-full h-full rounded-full overflow-hidden bg-neutral-600">
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

      {showBadge && (
        <span
          className="absolute -top-0.5 -left-0.5 flex h-4 w-4 items-center justify-center rounded-full"
          style={{
            backgroundColor: 'var(--snort-layer-1)',
            color: distance === 2 ? 'var(--snort-zap)' : 'var(--snort-success)',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 13 4 4L19 7" />
          </svg>
        </span>
      )}
    </div>
  );
}

export default Avatar;
