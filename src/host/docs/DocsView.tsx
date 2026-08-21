/**
 * The live `/docs` route. It is `DocsContent` plus the two things a crawler's
 * copy has no use for: the tab title, and honouring a `#hash` on arrival.
 *
 * The hash effect is not belt-and-braces. `index.html` ships an inline guard
 * that clears `#root` on any path other than `/`, so on a direct load of
 * `/docs#demo-links` the browser looks for that element while the document is
 * still the prerendered one being emptied — it finds nothing, gives up, and the
 * reader lands at the top of a page they asked a specific question of. React
 * mounts the section a moment later, by which time nobody is scrolling.
 */
import { useEffect } from 'react';
import DocsContent, { DOCS_TITLE } from './DocsContent';

export default function DocsView() {
  // Set on mount, restored on unmount — same reasoning as ClientView's title
  // effect: walking here from the gallery is a client-side transition, so
  // without this the tab (and any bookmark taken from it) keeps the gallery's.
  useEffect(() => {
    const previous = document.title;
    document.title = DOCS_TITLE;
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }, []);

  return <DocsContent />;
}
