/**
 * Nostr Kitten renders a real `<marquee>` — the 1999 GeoCities bit is the whole
 * joke, so it stays. React passes the tag through to the DOM, but the element is
 * deprecated and `@types/react` therefore does not declare it.
 *
 * Scoped to this simulator's own directory on purpose (CLAUDE.md: one directory
 * per simulator); nothing else in the repo should reach for a marquee.
 */
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      marquee: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        behavior?: 'scroll' | 'slide' | 'alternate';
        direction?: 'left' | 'right' | 'up' | 'down';
        scrollamount?: number | string;
        scrolldelay?: number | string;
        loop?: number | string;
      };
    }
  }
}
