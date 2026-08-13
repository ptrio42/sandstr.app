import React from 'react';

/**
 * Amethyst brand mark — the ostrich head knocked out of a capital "A".
 *
 * Path data is VERBATIM from the client's own vector drawable
 * (`amethyst/src/main/res/drawable/amethyst.xml`, viewport 512×512), so the
 * silhouette is the real one rather than a trace. Two paths: the eye dot and
 * the A/ostrich body, both filled with the brand gradient #652D80 → #2598CF.
 *
 * [REC vs REPO] the drawable declares the eye's gradient in viewport space
 * (startX 42.27 → endX 55.73), which would land the dot in flat blue; the real
 * render — and the reference screenshot — shows a purple→blue ramp across the
 * dot itself, so the eye uses an objectBoundingBox gradient here.
 *
 * Inline SVG: CSP-safe, no network, no asset.
 */
const A_PATH =
  'M489.48,391.59C488.93,389.92 360.91,85.09 325.7,0.54c-42.87,0 -133.4,0 -197.26,0 -18.74,46.35 -67.12,164.49 -105.93,259.66 21.27,50.74 40.37,96.32 55.1,131.48l80.32,0a5.49,5.49 0,0 0,5.13 -6.45c-0.69,-16.22 -44.84,-75.17 -31.67,-138.94 3.51,-13.72 6.2,-27.66 10.04,-41.33a482.36,482.36 135,0 1,36.88 -95.5c2.44,-4.64 3.57,-6.72 9.19,-3.21 11.99,7.46 25.38,7.03 38.72,6.06 11.5,-2.5 17.1,-8.01 38.17,-2.41 4.17,0 8.23,0 12.49,0.38 10.13,0.8 19.62,3.21 25.71,12.38 6.64,10.02 7.71,21.35 6.64,32.93 -1.62,17.32 -0.47,33.45 14.19,45.66a157.85,157.85 0,0 0,16.47 10.98c7.27,4.67 16.05,6.7 22.28,13.17 3.68,3.81 5.85,7.88 4.25,13.31 -1.59,5.43 -5.85,7.99 -11.44,8.59 -14.16,1.54 -27.99,-1.34 -41.9,-3.02 -1.81,-0.22 -3.59,-0.36 -5.49,-0.47a31.48,31.48 0,0 1,-10.46 0.36l-3.27,0a73.27,73.27 0,0 0,-16.19 3.87c-13.12,4.78 -25.06,10.04 -40.53,9.77a11.86,11.86 0,0 0,-5.63 2.44c-12.13,10.78 -19.43,24.4 -13.36,44.29 16.63,46.46 59.3,158.54 77.64,206.92 -0.52,-32.77 -0.66,-91.44 -0.77,-119.92 73.22,0.11 185.48,0.05 194.43,0.05z';

const EYE_PATH = 'M242.66,157.32a15.48,15.75 90,1 0,31.5 0a15.48,15.75 90,1 0,-31.5 0z';

export function AmethystLogo({ className = 'w-8 h-8' }: { className?: string }) {
  const id = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 512 512" className={className} role="img" aria-label="Amethyst">
      <defs>
        <linearGradient
          id={`am-a-${id}`}
          gradientUnits="userSpaceOnUse"
          x1="22.6"
          y1="255.92"
          x2="489.54"
          y2="255.92"
        >
          <stop offset="0" stopColor="#652D80" />
          <stop offset="1" stopColor="#2598CF" />
        </linearGradient>
        <linearGradient id={`am-e-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#652D80" />
          <stop offset="1" stopColor="#2598CF" />
        </linearGradient>
      </defs>
      <path d={EYE_PATH} fill={`url(#am-e-${id})`} />
      <path d={A_PATH} fill={`url(#am-a-${id})`} />
    </svg>
  );
}

export default AmethystLogo;
