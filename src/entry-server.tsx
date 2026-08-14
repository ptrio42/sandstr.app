/**
 * Build-time prerender entry — consumed only by `scripts/prerender.mjs`,
 * never shipped to the browser.
 *
 * WHY: the app is a client-rendered SPA, so `dist/index.html` ships an empty
 * `#root` and the pages crawlers may index contain none of their own copy: no
 * h1, no headings, no client names. Google renders JS on a second pass; Bing,
 * social scrapers and the LLM crawlers largely do not. For a site with two
 * indexable URLs that is the whole SEO surface, so we bake their markup into
 * the HTML at build time.
 *
 * WHAT IS RENDERED: the gallery, and `/compare`.
 *  - Both are pure — they read `clients` from ../registry (plain data plus
 *    `lazy()` loaders that are never invoked here) and `capabilities`, and
 *    touch no browser API.
 *  - `Layout` is deliberately excluded: `useTheme` reads localStorage and
 *    ClientSwitcher reads matchMedia at render, neither of which exists in
 *    Node, and its markup carries no indexable copy the pages lack.
 *  - `/compare` renders through `CompareStatic`, which shares its table and its
 *    prose with the live view rather than duplicating them. What it leaves out
 *    is what needs a browser: the chooser, the cell-detail panel, and the
 *    side-by-side strip — which mounts eight clients' components and carries
 *    almost no text worth indexing.
 *
 * NOT hydration. `src/main.tsx` mounts with `createRoot`, which clears the
 * container, so React re-renders from scratch and this markup is never diffed.
 * It exists for crawlers and for first paint on a slow connection. That also
 * means it must stay a faithful subset of what renders live — it is generated
 * from the same components and the same data, so it cannot drift.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import Gallery from './host/Gallery';
import CompareStatic from './host/compare/CompareStatic';

export function render(): string {
  return renderToStaticMarkup(
    <StaticRouter location="/">
      <Gallery />
    </StaticRouter>,
  );
}

export function renderCompare(): string {
  return renderToStaticMarkup(
    <StaticRouter location="/compare">
      <CompareStatic />
    </StaticRouter>,
  );
}
