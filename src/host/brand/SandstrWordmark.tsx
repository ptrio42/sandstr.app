/**
 * The "sandstr" wordmark, drawn as vector geometry — no font dependency.
 *
 * Redrawn on a fixed grid rather than traced or typeset: x-height 100, stroke 20,
 * ascender 133, baseline y=123. Monoline throughout, matching the brand sheet's
 * geometric lowercase with its single-storey `a`. Because it is our own drawing
 * there is no font licence to carry, and it renders identically on every platform
 * (the previous font-stack version only looked right where Futura was installed).
 *
 * Paths are stroked centrelines, not filled contours. That keeps them small and
 * keeps the weight exactly uniform at any size. If a vendor ever needs true
 * outlines — cutting, embroidery, foil — expand the strokes at that point.
 */

const VIEW_BOX = '-10 0 727.7 133';

/** Letter origins along the baseline, in grid units. */
const GLYPHS: Array<{ x: number; d: string[] }> = [
  {
    x: 0,
    d: ['M70.37,50.69 A33.76,20.00 0 1 0 43.76,83.00 A33.76,20.00 0 1 1 17.16,115.31'],
  },
  {
    x: 100.9,
    d: [
      'M10.00,83.00 a34.97,40.00 0 1 0 69.94,0 a34.97,40.00 0 1 0 -69.94,0',
      'M84.40,43.00 L84.40,123.00',
    ],
  },
  {
    x: 212.3,
    d: ['M10.00,123.00 L10.00,72.76 A38.15,29.76 0 0 1 86.30,72.76 L86.30,123.00'],
  },
  {
    x: 322.6,
    d: [
      'M10.00,83.00 a39.34,40.00 0 1 0 78.68,0 a39.34,40.00 0 1 0 -78.68,0',
      'M93.70,10.00 L93.70,123.00',
    ],
  },
  {
    x: 443.3,
    d: ['M71.94,50.69 A34.64,20.00 0 1 0 44.64,83.00 A34.64,20.00 0 1 1 17.34,115.31'],
  },
  {
    x: 541,
    d: [
      'M34.08,10.00 L34.08,102.00 A21.00,21.00 0 0 0 55.08,123.00',
      'M4.00,49.00 L67.20,49.00',
    ],
  },
  {
    x: 639.2,
    d: ['M10.00,123.00 L10.00,70.20 A30.07,27.20 0 0 1 40.07,43.00'],
  },
];

/** Width : height of the artwork, for callers that need to reserve space. */
export const WORDMARK_ASPECT = 727.7 / 133;

export type SandstrWordmarkProps = {
  /** Rendered height in px; width follows from the aspect ratio. */
  height?: number;
  className?: string;
};

export default function SandstrWordmark({ height = 18, className }: SandstrWordmarkProps) {
  return (
    <svg
      height={height}
      width={Math.round(height * WORDMARK_ASPECT)}
      viewBox={VIEW_BOX}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={20}
        strokeLinecap="butt"
        strokeLinejoin="round"
      >
        {GLYPHS.map((g, i) =>
          g.d.map((d, j) => <path key={`${i}-${j}`} d={d} transform={`translate(${g.x},0)`} />),
        )}
      </g>
    </svg>
  );
}
