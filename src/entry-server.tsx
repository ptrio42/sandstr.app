/**
 * Build-time prerender entry — consumed only by `scripts/prerender.mjs`,
 * never shipped to the browser.
 *
 * WHY: the app is a client-rendered SPA, so `dist/index.html` ships an empty
 * `#root` and the one page crawlers may index (`/` — `public/robots.txt`
 * Disallow's `/c/`) contains none of its own copy: no h1, no section headings,
 * no client names, no card descriptions. Google renders JS on a second pass;
 * Bing, social scrapers and the LLM crawlers largely do not. For a site with
 * exactly one indexable URL that is the whole SEO surface, so we bake the
 * gallery's markup into the HTML at build time.
 *
 * WHAT IS RENDERED: the gallery alone.
 *  - It is pure — reads `clients` from ../registry (plain data plus `lazy()`
 *    loaders that are never invoked here) and touches no browser API.
 *  - `Layout` is deliberately excluded: `useTheme` reads localStorage and
 *    ClientSwitcher reads matchMedia at render, neither of which exists in
 *    Node, and its markup carries no indexable copy the gallery lacks.
 *
 * NOT hydration. `src/main.tsx` mounts with `createRoot`, which clears the
 * container, so React re-renders from scratch and this markup is never
 * diffed. It exists for crawlers and for first paint on a slow connection.
 * That also means it must stay a faithful subset of what renders live — it is
 * generated from the same component and the same registry, so it cannot drift.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import Gallery from './host/Gallery';

export function render(): string {
  return renderToStaticMarkup(
    <StaticRouter location="/">
      <Gallery />
    </StaticRouter>,
  );
}
