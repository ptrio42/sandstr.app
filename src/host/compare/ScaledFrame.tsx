/**
 * A cell that renders a client surface at its NATURAL size and scales the whole
 * thing down to the column.
 *
 * Why not just let it reflow into a narrow column: because then it is not that
 * client's design any more. A web client laid out at 350px is showing you its
 * mobile breakpoint — and `SnortSimulator` measures its own root to decide
 * which one to mount, so a narrow box silently swaps the layout under you.
 * Scaling keeps the real 1022px composition and only shrinks the pixels.
 *
 * Two mechanics worth keeping:
 *
 * - **Measured with a callback ref plus a ResizeObserver.** Not a one-shot read
 *   in an effect: these cells mount inside a grid that is still settling, and a
 *   single early measurement pins the scale to a stale width. (The same trap
 *   `SnortSimulator` documents — a one-shot observer ends up watching a
 *   detached node.)
 *
 * - **`transform: scale()` establishes a containing block**, so a `position:
 *   fixed` overlay inside a composer resolves against this cell instead of the
 *   browser window. That is the CLAUDE.md gotcha (Keychat's modal dimming the
 *   whole page) solved for free — but only because the transform is here, on
 *   the wrapper, and not on some ancestor.
 */
import { useCallback, useRef, useState, type ReactNode } from 'react';

export function ScaledFrame({
  width,
  height,
  className,
  theme,
  children,
}: {
  width: number;
  height: number;
  className: string;
  theme: 'dark' | 'light';
  children: ReactNode;
}) {
  const [box, setBox] = useState(0);
  const observer = useRef<ResizeObserver | null>(null);

  const attach = useCallback((node: HTMLDivElement | null) => {
    observer.current?.disconnect();
    if (!node) return;
    setBox(node.clientWidth);
    observer.current = new ResizeObserver(([entry]) => setBox(entry.contentRect.width));
    observer.current.observe(node);
  }, []);

  // Never above 1:1. A desktop client given a full row would otherwise be
  // blown up past its own design size, which reads as a different product.
  const scale = box ? Math.min(1, box / width) : 0;
  // Centred when the cap leaves slack, since transform-origin is the top-left.
  const inset = box ? Math.max(0, (box - width * scale) / 2) : 0;

  return (
    <div ref={attach} className="relative w-full overflow-hidden" style={{ height: height * scale }}>
      <div
        // Class AND attribute: the eight theme sheets disagree about which one
        // carries the theme, and every simulator root sets both.
        className={`${className} ${theme} absolute top-0`}
        data-theme={theme}
        style={{
          width,
          height,
          left: inset,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          // Until the first measurement lands, scale is 0 and the content would
          // flash at full size in a zero-height box.
          visibility: scale ? undefined : 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}
