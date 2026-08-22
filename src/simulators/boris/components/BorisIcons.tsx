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

/**
 * Material `DynamicFeed` — an outlined card in front, two stepped brackets
 * behind it, each offset from the next by the same 4 units.
 *
 * MEASURED off the reference recording at its native 1080x2400, not eyeballed:
 * the ink box is 20 x 18 units (53 x 47 px at 2.65 px/unit), the card is
 * x10-22 / y3-13 with an x12-20 / y7-11 hole, and the brackets are 2-unit
 * strokes at x6-17 / y8-17 and x2-13 / y12-21. The AccountCircle beside it
 * measures a square 53 x 53 in the same frames, which is how we know the capture
 * is not squashed and this glyph really is wider than it is tall.
 *
 * Deliberately NO `filled` branch. Thresholded and compared, the selected and
 * unselected Feeds glyphs differ only along their edges: not one ink pixel of
 * either sits more than 1 px outside the other, where a solid card against an
 * outlined one would differ across the whole hole. The selection is the M3
 * indicator pill and the colour, not a second glyph. Home DOES swap outline for
 * solid under the same test, which is why HomeGlyph keeps its pair.
 */
export function DynamicFeedGlyph({ size = 24, className }: Omit<GlyphProps, 'filled'>) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden focusable="false">
      {/* back to front: lower bracket, middle bracket, then the card */}
      <path d="M4 12H2v7c0 1.1.9 2 2 2h9v-2H4v-7z" fill="currentColor" />
      <path d="M8 8H6v7c0 1.1.9 2 2 2h9v-2H8V8z" fill="currentColor" />
      <path
        d="M20 3h-8c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 8h-8V7h8v4z"
        fill="currentColor"
      />
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
 * Boris's highlighter, taken from the project's own `boris-logo.svg` on
 * readwithboris.com instead of redrawn: barrel `#F97316` with the ink window as
 * a hole, chisel tip on a `#FDE047 → #F97316` gradient.
 *
 * The redrawing this replaced filled that window `#9333EA`, giving the pen a
 * purple wedge the real one does not have — in the real logo the purple is the
 * WORDMARK next to the pen, not part of it.
 *
 * The glyph is Font Awesome Free's `highlighter` recoloured (measured: eleven
 * segment lengths divide into Font Awesome's by 5.7916, spread 0.0001), so it
 * carries CC BY 4.0 — attributed in `THIRD-PARTY.md`.
 */
export function HighlighterMark({ size = 96, className }: { size?: number; className?: string }) {
  const id = `boris-tip-${size}`;
  return (
    // viewBox is the pen's own bounding box in the source file (measured with
    // getBBox: 307.07,72.63 94.38×88.68), padded to a square so `size` gives a
    // square mark at any scale.
    <svg
      viewBox="306.07 68.78 96.38 96.38"
      width={size}
      height={size}
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient
          id={id}
          x1="307.52621"
          y1="152.47421"
          x2="329.85146"
          y2="152.47421"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(1.0408008,0,0,1.0408008,-13.002768,-6.1359144)"
        >
          <stop offset="0" stopColor="#FDE047" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <path
        fill="#F97316"
        d="m 361.91353,127.0166 27.34974,-37.139715 -5.05902,-5.05902 -37.13972,27.349765 z m -32.2879,0.86332 v 0 -12.3799 c 0,-2.64174 1.24317,-5.11082 3.36693,-6.66478 l 47.15413,-34.756975 c 1.27769,-0.94965 2.83169,-1.45037 4.42014,-1.45037 1.96838,0 3.85037,0.77698 5.24898,2.17556 l 9.46187,9.4619 c 1.39861,1.39858 2.17558,3.2806 2.17558,5.26621 0,1.58849 -0.50073,3.14246 -1.45037,4.42017 L 365.26317,141.0886 c -1.55393,2.12375 -4.04027,3.36692 -6.66476,3.36692 h -12.37989 l -4.38561,4.38563 c -2.15829,2.15827 -5.66338,2.15827 -7.82166,0 l -8.75395,-8.75399 c -2.15828,-2.15828 -2.15828,-5.66333 0,-7.82161 z m -20.89218,25.26052 8.92668,-8.92665 12.18999,12.18998 -3.40146,3.40145 c -0.77697,0.77697 -1.83023,1.20863 -2.93525,1.20863 l -11.84464,0.0172 c -2.29644,0 -4.1439,-1.84749 -4.1439,-4.1439 v -0.81151 c 0,-1.10505 0.43162,-2.15829 1.20858,-2.93527 z"
      />
      <path
        fill={`url(#${id})`}
        d="m 308.32866,153.09852 9.29089,-9.29087 12.68735,12.68734 -3.54024,3.54024 c -0.80867,0.80868 -1.9049,1.25795 -3.05501,1.25795 l -12.32791,0.0179 c -2.39014,0 -4.31297,-1.92287 -4.31297,-4.31298 v -0.84462 c 0,-1.15014 0.44923,-2.24635 1.25789,-3.05504 z"
      />
    </svg>
  );
}
