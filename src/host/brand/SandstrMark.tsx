import { useId } from 'react';
import { markGradient } from './tokens';

/**
 * The Sandstr mark: three receding panels cut by one continuous wave.
 *
 * Geometry is measured from the approved brand sheet and baked in as constants —
 * the panels are quads with slanted top/bottom edges (not rects), and the wave is
 * a single curve spanning the whole mark, so its phase carries across the panel
 * gaps. Above the cut is purple; below it, sand hugs the underside of the wave
 * and hands over to purple. That "sand follows the wave" behaviour is why each
 * panel gets its own userSpaceOnUse gradient anchored at its wave crossing.
 *
 * Pure inline SVG: no raster, no runtime deps, offline- and CSP-safe.
 */

const PANELS = [
  'M14.00,18.14 A5.20,5.20 0 0 1 17.42,13.25 L34.42,7.05 A5.20,5.20 0 0 1 41.40,11.93 L41.40,80.49 A5.20,5.20 0 0 1 38.40,85.20 L21.40,93.14 A5.20,5.20 0 0 1 14.00,88.43 Z',
  'M44.30,24.99 A5.20,5.20 0 0 1 47.40,20.23 L58.50,15.33 A5.20,5.20 0 0 1 65.80,20.08 L65.80,78.91 A5.20,5.20 0 0 1 62.70,83.67 L51.60,88.57 A5.20,5.20 0 0 1 44.30,83.82 Z',
  'M68.70,32.34 A5.20,5.20 0 0 1 72.25,27.41 L79.15,25.10 A5.20,5.20 0 0 1 86.00,30.03 L86.00,77.74 A5.20,5.20 0 0 1 82.94,82.48 L76.04,85.59 A5.20,5.20 0 0 1 68.70,80.85 Z',
];

/** Everything above the wave. */
const CLIP_ABOVE =
  'M14.00,44.05 C16.52,43.70 18.72,42.20 21.10,41.95 C23.48,41.70 25.92,41.80 28.30,42.55 C30.68,43.30 33.62,45.50 35.40,46.45 C37.18,47.40 37.32,47.47 39.00,48.25 C40.68,49.03 43.22,50.27 45.50,51.15 C47.78,52.03 50.32,53.50 52.70,53.55 C55.08,53.60 58.02,51.70 59.80,51.45 C61.58,51.20 61.72,51.15 63.40,52.05 C65.08,52.95 67.62,55.70 69.90,56.85 C72.18,58.00 74.72,58.95 77.10,58.95 C79.48,58.95 81.68,57.20 84.20,56.85 L106,-10 L-10,-10 Z';

/** Everything below the wave. The band between the two is the gap, left unpainted. */
const CLIP_BELOW =
  'M14.00,49.55 C16.52,49.20 18.72,47.70 21.10,47.45 C23.48,47.20 25.92,47.30 28.30,48.05 C30.68,48.80 33.62,51.00 35.40,51.95 C37.18,52.90 37.32,52.97 39.00,53.75 C40.68,54.53 43.22,55.77 45.50,56.65 C47.78,57.53 50.32,59.00 52.70,59.05 C55.08,59.10 58.02,57.20 59.80,56.95 C61.58,56.70 61.72,56.65 63.40,57.55 C65.08,58.45 67.62,61.20 69.90,62.35 C72.18,63.50 74.72,64.45 77.10,64.45 C79.48,64.45 81.68,62.70 84.20,62.35 L106,110 L-10,110 Z';

/** Wave crossing at each panel's centre — anchors that panel's sand gradient. */
const CUT_Y = [46, 55, 60.5];

export type SandstrMarkProps = {
  /** Rendered size in px. The mark is square. */
  size?: number;
  /**
   * `brand` paints the approved purple/sand gradients.
   * `mono` paints flat `currentColor` — for favicons, print, 1-bit and
   * anywhere the mark sits on an unknown ground.
   */
  tone?: 'brand' | 'mono';
  className?: string;
  /** Set when the mark is the only content of a link or button. */
  title?: string;
};

export default function SandstrMark({
  size = 32,
  tone = 'brand',
  className,
  title,
}: SandstrMarkProps) {
  // useId() emits colons, which are not safe inside url(#…) references.
  const uid = `sm${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const mono = tone === 'mono';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title && <title>{title}</title>}
      <defs>
        <clipPath id={`${uid}a`}>
          <path d={CLIP_ABOVE} />
        </clipPath>
        <clipPath id={`${uid}b`}>
          <path d={CLIP_BELOW} />
        </clipPath>
        {PANELS.map((d, i) => (
          <clipPath key={i} id={`${uid}p${i}`}>
            <path d={d} />
          </clipPath>
        ))}
        {!mono && (
          <>
            <linearGradient id={`${uid}up`} x1="0" y1="0" x2="0.35" y2="1">
              <stop offset="0" stopColor={markGradient.purpleFrom} />
              <stop offset="1" stopColor={markGradient.purpleTo} />
            </linearGradient>
            {CUT_Y.map((cy, i) => (
              <linearGradient
                key={i}
                id={`${uid}lo${i}`}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1={cy}
                x2="0"
                y2={cy + 24}
              >
                <stop offset="0" stopColor={markGradient.sandFrom} />
                <stop offset="0.3" stopColor={markGradient.sandTo} />
                <stop offset="0.72" stopColor={markGradient.blend} />
                <stop offset="1" stopColor={markGradient.purpleTo} />
              </linearGradient>
            ))}
          </>
        )}
      </defs>

      {PANELS.map((_, i) => (
        <g key={i} clipPath={`url(#${uid}p${i})`}>
          <rect
            x="-10"
            y="-10"
            width="120"
            height="120"
            fill={mono ? 'currentColor' : `url(#${uid}up)`}
            clipPath={`url(#${uid}a)`}
          />
          <rect
            x="-10"
            y="-10"
            width="120"
            height="120"
            fill={mono ? 'currentColor' : `url(#${uid}lo${i})`}
            clipPath={`url(#${uid}b)`}
            opacity={mono ? 0.72 : 1}
          />
        </g>
      ))}
    </svg>
  );
}
