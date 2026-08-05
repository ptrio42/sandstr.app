/**
 * Coracle's avatar — its own `PlaceholderCircle`, not a substitute for it.
 *
 * `PersonCircle.svelte:12-16` picks `ImageCircle` when the profile has a
 * picture and `PlaceholderCircle` otherwise. Sandstr's mock identities are
 * fictional and have no pictures, so the placeholder IS the code path the real
 * client would take for them — which is both the faithful choice and the one
 * that makes zero network requests. (The old sketch hotlinked DiceBear from
 * five files.)
 *
 * The drawing is upstream's: a hue derived from the pubkey
 * (`stringToHue`, `src/util/misc.ts:84-92` — the classic
 * `hash = c + ((hash << 5) - hash)` walk, then `% 360`), a two-stop gradient
 * between `hsl(hue, ?, 80%)` and `hsl(hue, 30%, 40%)`
 * (`PlaceholderCircle.svelte:7-9`), and a bust glyph at `fill-opacity 0.66` on
 * a `bg-neutral-800` disc.
 *
 * Upstream animates the gradient stops for 5 iterations and then settles
 * (`repeatCount="5"`, 1.6s/1.8s). That is reproduced with CSS on the same
 * schedule, and dropped entirely under `prefers-reduced-motion`.
 */
import React from 'react';

/** `stringToHue` — src/util/misc.ts:84-92, reproduced exactly. */
function stringToHue(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash % 360;
}

interface AvatarProps {
  /** Pubkey or any stable identity string — the hue is derived from it. */
  seed: string;
  /** px. Upstream sizes: 24 quote, 40 note, 128 profile header. */
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ seed, size = 40, className = '' }) => {
  const hue = stringToHue(seed || 'anon');
  const primary = `hsl(${hue}, 50%, 80%)`;
  const secondary = `hsl(${hue}, 30%, 40%)`;
  // Gradient ids must be unique per instance or the first one on the page wins
  // for every avatar. Hue alone is not unique enough across a long feed.
  const gid = `co-av-${Math.abs(hue)}-${seed.length}-${(seed.charCodeAt(0) || 0).toString(36)}`;

  return (
    <span
      className={`co-avatar ${className}`}
      style={{
        width: size,
        height: size,
        display: 'flex',
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: '9999px',
        background: 'var(--co-neutral-800)',
      }}
    >
      <svg viewBox="0 0 17 20" width={size * 0.8} height={size * 0.8} aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={primary} />
            <stop offset="1" stopColor={secondary} />
          </linearGradient>
        </defs>
        {/* head + shoulders, the two paths of PlaceholderCircle */}
        <circle cx="8.5" cy="5.6" r="4.1" fill={`url(#${gid})`} fillOpacity="0.66" />
        <path
          d="M8.5 11.2c4.2 0 7.6 3 7.6 6.8v2H0.9v-2c0-3.8 3.4-6.8 7.6-6.8z"
          fill={`url(#${gid})`}
          fillOpacity="0.66"
        />
      </svg>
    </span>
  );
};

/**
 * The web-of-trust dial that sits immediately right of every display name
 * (`WotScore.svelte:33-43`). A 16x16 arc over a `neutral-600` background ring,
 * stroked with the accent when the person is followed or is you.
 *
 * Worth naming: this is NOT a verified badge, and a reproducer who reads it as
 * one gets the client's whole trust model backwards. Coracle ships no
 * checkmark anywhere — the ring is the score.
 */
export const WotScore: React.FC<{ score: number; accent?: boolean; size?: number }> = ({
  score,
  accent = false,
  size = 16,
}) => {
  const r = 6;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, score));
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-label={`Web of trust score ${Math.round(pct * 100)}%`}
      role="img"
      style={{ flexShrink: 0 }}
    >
      <circle cx="8" cy="8" r={r} fill="none" stroke="var(--co-neutral-600)" strokeWidth="2" />
      <circle
        cx="8"
        cy="8"
        r={r}
        fill="none"
        stroke={accent ? 'var(--co-accent)' : 'var(--co-neutral-200)'}
        strokeWidth="2"
        strokeDasharray={`${circumference * pct} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 8 8)"
      />
    </svg>
  );
};
