import React from 'react';

// Damus logo (`logo-nobg`) — a low-poly faceted gem in a sideways teardrop / play-button
// silhouette pointing right, tinted with DamusLogoGradient (#30B3F1 cyan → #C539F9 magenta,
// leading→trailing) with thin white facet seams. Inline SVG (CSP-safe, no asset).
export function DamusLogo({ className = 'w-8 h-8' }: { className?: string }) {
  const id = React.useId().replace(/:/g, '');
  const shape = 'M28,15 L89,41 Q73,63 48,88 Q24,73 17,45 Q20,25 28,15 Z';
  const H = '44,45';
  const seams = [
    `M${H} L28,15`, `M${H} L89,41`, `M${H} L48,88`, `M${H} L17,45`,
    `M${H} L64,27`, `M${H} L62,68`, `M${H} L30,66`, `M62,68 L48,88`, `M64,27 L89,41`,
  ];
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Damus">
      <defs>
        <linearGradient id={`dl-${id}`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#30B3F1" />
          <stop offset="0.5" stopColor="#8B67F0" />
          <stop offset="1" stopColor="#C539F9" />
        </linearGradient>
        <filter id={`dg-${id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <path d={shape} fill="#C539F9" opacity="0.3" filter={`url(#dg-${id})`} />
      <path d={shape} fill={`url(#dl-${id})`} />
      <g stroke="#fff" strokeWidth="1.1" strokeOpacity="0.55" fill="none" strokeLinejoin="round">
        {seams.map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  );
}

export default DamusLogo;
