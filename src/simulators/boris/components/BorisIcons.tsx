/**
 * The four nav glyphs Boris takes from Material Symbols and lucide has no
 * lookalike for, redrawn here from the reference recording (frame t=52s,
 * docs/refs/boris/shots/navicons.png) rather than copied: Material's
 * `MenuBook`, `DynamicFeed`, `Home` and `AccountCircle` are the icons
 * MainTab.kt names, and a stroke-only stand-in reads as a different app —
 * Material's book and stacked-cards silhouettes are the two that carry the
 * bottom bar's identity.
 *
 * Everything else in this simulator uses lucide-react, the repo's existing
 * icon dependency (no new runtime deps — CLAUDE.md).
 */

interface GlyphProps {
  filled?: boolean;
  size?: number;
  className?: string;
}

/** Material `Home` — solid house with a doorway notch when selected. */
export function HomeGlyph({ filled = false, size = 24, className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden focusable="false">
      {filled ? (
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor" />
      ) : (
        <path
          d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8zm-3-2v-7.8l5-4.5 5 4.5V18h-1v-6H8v6z"
          fill="currentColor"
        />
      )}
    </svg>
  );
}

/** Material `MenuBook` — open book, ruled lines on the right-hand page. */
export function MenuBookGlyph({ filled = false, size = 24, className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden focusable="false">
      <path
        d="M11.3 6.6C10 5.6 8.1 5 6 5c-1.4 0-2.8.3-4 .8v12.5c1.2-.5 2.6-.8 4-.8 2.1 0 4 .6 5.3 1.6zm1.4 0v13.5c1.3-1 3.2-1.6 5.3-1.6 1.4 0 2.8.3 4 .8V5.8c-1.2-.5-2.6-.8-4-.8-2.1 0-4 .6-5.3 1.6z"
        fill="currentColor"
        opacity={filled ? 1 : 0.95}
      />
      {/* ruled lines on the right page — the detail that makes it read as a book */}
      <g fill="var(--boris-bg)" opacity="0.85">
        <rect x="14.2" y="8.1" width="5.4" height="0.9" rx="0.45" />
        <rect x="14.2" y="10.1" width="5.4" height="0.9" rx="0.45" />
        <rect x="14.2" y="12.1" width="5.4" height="0.9" rx="0.45" />
        <rect x="14.2" y="14.1" width="5.4" height="0.9" rx="0.45" />
      </g>
    </svg>
  );
}

/** Material `DynamicFeed` — a card in front, two stepped brackets behind it. */
export function DynamicFeedGlyph({ filled = false, size = 24, className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden focusable="false">
      {/* stepped brackets — always outline, in both states */}
      <path
        d="M4 11v8a1.6 1.6 0 0 0 1.6 1.6h7v-1.8H5.8V11zM8 7.4V16a1.6 1.6 0 0 0 1.6 1.6h7v-1.8H9.8V7.4z"
        fill="currentColor"
      />
      {/* the front card */}
      {filled ? (
        <rect x="12.2" y="3.2" width="8.6" height="6.6" rx="1.8" fill="currentColor" />
      ) : (
        <rect
          x="13"
          y="4"
          width="7"
          height="5"
          rx="1.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      )}
    </svg>
  );
}

/** Material `AccountCircle` — head-and-shoulders inside a ring. */
export function AccountCircleGlyph({ filled = false, size = 24, className }: GlyphProps) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden focusable="false">
        <path
          d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6m0 14.2a7.2 7.2 0 0 1-6-3.2c0-2 4-3.1 6-3.1s6 1.1 6 3.1a7.2 7.2 0 0 1-6 3.2"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden focusable="false">
      <circle cx="12" cy="12" r="9.1" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="9.6" r="2.9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6.3 18.4c1-2 3.2-3 5.7-3s4.7 1 5.7 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Boris's own mark, redrawn from `res/drawable-nodpi/ic_boris_logo.png` (the
 * same artwork as `zapstore-icon.png`): an orange highlighter angled up-right,
 * a purple wedge for the ink window, and an amber chisel tip.
 *
 * The three colours are not decoration and not invented — sampled off the real
 * PNG they are `#F97316`, `#9333EA` and `#FCB434`, i.e. the app's own
 * friends / nostrverse / mine highlight tokens. The logo IS the palette, which
 * is why Gigi's own essay about the project is called "Purple Text, Orange
 * Highlights".
 *
 * Note which asset this is: `res/drawable/ic_launcher_highlighter.xml` is a
 * different, yellow glyph — the Font Awesome Free highlighter (CC BY 4.0)
 * recoloured — and is deliberately NOT what this draws.
 */
export function HighlighterMark({ size = 96, className }: { size?: number; className?: string }) {
  const id = `boris-tip-${size}`;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FDE047" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <g transform="rotate(45 32 32)">
        {/* barrel */}
        <rect x="23" y="9" width="18" height="33" rx="6" fill="#F97316" />
        {/* ink window — a wedge with its apex pointing back down the barrel */}
        <path d="M32 14 L37.5 20.5 L32 33 L26.5 20.5 Z" fill="#9333EA" />
        {/* neck */}
        <rect x="26" y="41" width="12" height="6" rx="2.5" fill="#F97316" />
        {/* chisel tip */}
        <path d="M26.5 47.5h11l-2.6 7.2a2 2 0 0 1-1.9 1.3h-2a2 2 0 0 1-1.9-1.3z" fill={`url(#${id})`} />
      </g>
    </svg>
  );
}
