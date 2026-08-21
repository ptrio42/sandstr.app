/**
 * Post-build HTML step. Three jobs, in this order:
 *   a) writes `dist/c/<id>.html` — one real file per client route, carrying
 *      that client's own share tags (title, og:*), and
 *   b) bakes the gallery's markup into `dist/index.html`, and
 *   c) writes `dist/compare.html` — the capability matrix in words, and
 *   d) writes `dist/docs.html` — what a visitor can do on this site.
 *
 * Runs as the third stage of `npm run build`:
 *   1. `vite build`                      -> dist/ (client bundle, empty #root)
 *   2. `vite build --ssr src/entry-server.tsx --outDir dist-ssr`
 *   3. `node scripts/prerender.mjs`      -> emits + injects, then deletes dist-ssr/
 *
 * Three pages, because three are indexable:
 *   /         -> dist/index.html          the gallery
 *   /compare  -> dist/compare.html        the capability matrix in words
 *   /docs     -> dist/docs.html           what you can do on this site
 *
 * `/c/*` is Disallow'd in public/robots.txt on purpose — a pixel-faithful
 * /c/damus must not rank for "Damus" — so it is not prerendered and not listed
 * in the sitemap. /compare is the opposite case: sourced, dated text about a
 * client is an ordinary comparison page, not a clone of anyone's product, which
 * is why it may rank while /c/ may not.
 *
 * Each page gets its OWN title, description, canonical and og:*. The template
 * hard-pins those to the gallery, so shipping /compare with them untouched
 * would have told crawlers that /compare is a duplicate of / — a canonical
 * pointing elsewhere is an instruction to drop the page, which would have
 * quietly undone the whole point of prerendering it.
 *
 * Uses `react-dom/server`, already a dependency via react-dom — no new npm
 * package, per the CLAUDE.md rule. See src/entry-server.tsx for what is
 * rendered and why this is not hydration.
 *
 * Fails loudly on every anomaly. A prerender that silently no-ops is worse than
 * no prerender: the build would go green while an indexable page quietly went
 * back to being empty.
 * Uses `react-dom/server`, already a dependency via react-dom — no new npm
 * package, per the CLAUDE.md rule. See src/entry-server.tsx for why only the
 * gallery is rendered, why this is not hydration, and what the per-route copy
 * is allowed to say.
 *
 * WHY (a): every deep link shared anywhere previewed as the GALLERY, because
 * the SPA fallback (wrangler.jsonc) serves one index.html for all of them and
 * its og:* tags are hard-coded. Scrapers do not run JS, so nothing React does
 * at runtime can fix that. `docs/OUTREACH.md` builds the whole reply playbook
 * on `/c/<client>?faq=<id>` links, so this is the card those replies show.
 *
 * `<id>.html`, NOT `<id>/index.html`: Cloudflare's default html_handling is
 * `auto-trailing-slash`, under which a folder index makes `/c/damus` 307 to
 * `/c/damus/` while a flat file serves `/c/damus` with a 200 and redirects the
 * slashed form instead. The flat file is the only shape that keeps the URL
 * people actually share intact.
 * https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/
 *
 * Fails loudly on every anomaly. A prerender that silently no-ops is worse
 * than no prerender: the build would go green while the one indexable page
 * quietly went back to being empty — and a share-tag rewrite that silently
 * matched nothing is the same failure, one layer out.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ssrEntry = new URL('../dist-ssr/entry-server.js', import.meta.url);
const ssrDir = new URL('../dist-ssr/', import.meta.url);
const htmlPath = new URL('../dist/index.html', import.meta.url);
// `compare.html`, NOT `compare/index.html` — the same Cloudflare rule the client
// cards already learned: with `html_handling: auto-trailing-slash` a folder
// index makes /compare answer 307 to /compare/, so the canonical URL, the one
// in sitemap.xml and the one people paste all redirect. A flat file serves
// /compare with a 200 and it is /compare/ that redirects back.
// Measured against production, not read from docs: before this change
// `curl -sI https://sandstr.app/compare` returned 307.
const comparePath = new URL('../dist/compare.html', import.meta.url);
// Flat file for the same reason, one more time. `docs/index.html` would make
// /docs answer 307 to /docs/, and /docs is the URL the footer, the gallery and
// the sitemap all point at.
const docsPath = new URL('../dist/docs.html', import.meta.url);

const SITE = 'https://sandstr.app';
const routeDir = new URL('../dist/c/', import.meta.url);

// Vite emits exactly this, and index.html hand-writes it. If either ever
// changes, the build must stop rather than ship an empty page.
const PLACEHOLDER = '<div id="root"></div>';
const MARKER = '<!-- prerendered by scripts/prerender.mjs -->';
const ROUTE_MARKER = '<!-- share tags rewritten by scripts/prerender.mjs -->';

// Absolute, because some scrapers (Twitter in particular) will not resolve a
// relative og:image. Kept in one place so a domain move is one edit.
const ORIGIN = SITE;

function fail(message) {
  console.error(`prerender: ${message}`);
  process.exit(1);
}

/** Escape for an HTML double-quoted attribute value. */
function attr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Replace the ONE `<meta>` (or `<title>`) tag matching `find`, or stop the
 * build. index.html writes several of these across multiple lines, so the
 * scanner walks whole tags rather than trying to be clever with one regex —
 * and the exactly-one assertion is the point: a tag renamed upstream must
 * fail here, not ship twelve cards still advertising the gallery.
 */
function swapTag(html, find, replacement, label, id) {
  const tags = [...html.matchAll(/<title>[\s\S]*?<\/title>|<meta\b[^>]*>/g)];
  const hits = tags.filter((m) => find.test(m[0]));
  if (hits.length !== 1) {
    fail(`[${id}] expected exactly one ${label} tag in dist/index.html, found ${hits.length}`);
  }
  const [hit] = hits;
  return html.slice(0, hit.index) + replacement + html.slice(hit.index + hit[0].length);
}

if (!existsSync(ssrEntry)) {
  fail(`missing ${fileURLToPath(ssrEntry)} — did stage 2 (vite build --ssr) run?`);
}
if (!existsSync(htmlPath)) {
  fail(`missing ${fileURLToPath(htmlPath)} — did stage 1 (vite build) run?`);
}

const { render, renderCompare, renderDocs, shareRoutes, DOCS_TITLE, DOCS_DESCRIPTION } =
  await import(ssrEntry.href);

if (typeof renderDocs !== 'function' || !DOCS_TITLE || !DOCS_DESCRIPTION) {
  fail('the SSR bundle exports no renderDocs()/DOCS_TITLE/DOCS_DESCRIPTION — did src/entry-server.tsx change?');
}

const template = readFileSync(htmlPath, 'utf8');
const occurrences = template.split(PLACEHOLDER).length - 1;
if (occurrences !== 1) {
  fail(`expected exactly one \`${PLACEHOLDER}\` in dist/index.html, found ${occurrences}`);
}

// ---------------------------------------------------------------------------
// (a) one file per client route, BEFORE the gallery is injected below.
//
// Reading `html` here means each route file ships the empty #root, not 22 kB of
// gallery markup describing ten OTHER clients — which is both smaller and the
// honest thing for a page about one of them. index.html's inline deep-link
// guard stays in place: on these files it clears an already-empty root, so it
// is a no-op, and keeping it byte-identical is what keeps the CSP script hash
// in public/_headers valid for every emitted file (scripts/verify-headers.mjs
// checks all of them, not just index.html).
// ---------------------------------------------------------------------------
if (typeof shareRoutes !== 'function') {
  fail('the SSR bundle exports no shareRoutes() — did src/entry-server.tsx change?');
}

const routes = shareRoutes();
if (!Array.isArray(routes) || routes.length === 0) {
  fail('shareRoutes() returned nothing — every deep link would fall back to the gallery card');
}

mkdirSync(routeDir, { recursive: true });

for (const route of routes) {
  const { id, path, title, description, image, imageAlt } = route;
  if (!id || !path || !title || !description || !image || !imageAlt) {
    fail(`route "${id ?? '?'}" is missing share fields — refusing to emit a half-written card`);
  }

  let out = template;
  out = swapTag(out, /^<title>/, `<title>${attr(title)}</title>`, '<title>', id);
  out = swapTag(
    out,
    /name="description"/,
    `<meta name="description" content="${attr(description)}" />`,
    'meta description',
    id,
  );
  // og:url tracks the route here, unlike rel=canonical below: it is what
  // Telegram and friends make the card's title link, so pinning it to "/"
  // would land every card click on the gallery instead of the client the
  // reader just tapped.
  out = swapTag(
    out,
    /property="og:url"/,
    `<meta property="og:url" content="${ORIGIN}${path}" />`,
    'og:url',
    id,
  );
  out = swapTag(
    out,
    /property="og:title"/,
    `<meta property="og:title" content="${attr(title)}" />`,
    'og:title',
    id,
  );
  out = swapTag(
    out,
    /property="og:description"/,
    `<meta property="og:description" content="${attr(description)}" />`,
    'og:description',
    id,
  );
  out = swapTag(
    out,
    // the closing quote is load-bearing: it keeps og:image:width/height/alt out
    /property="og:image"/,
    `<meta property="og:image" content="${ORIGIN}${image}" />`,
    'og:image',
    id,
  );
  out = swapTag(
    out,
    /property="og:image:alt"/,
    `<meta property="og:image:alt" content="${attr(imageAlt)}" />`,
    'og:image:alt',
    id,
  );

  // rel=canonical deliberately still points at the gallery — same call as
  // `Disallow: /c/` in public/robots.txt, and this file does not reopen it.
  if (!out.includes(`<link rel="canonical" href="${ORIGIN}/" />`)) {
    fail(`[${id}] canonical link missing or moved — /c/ pages must still point at the gallery`);
  }
  if (!out.includes(PLACEHOLDER)) {
    fail(`[${id}] emitted route lost its empty #root`);
  }

  writeFileSync(new URL(`${id}.html`, routeDir), out.replace('<head>', `<head>${ROUTE_MARKER}`), 'utf8');
}

// ---------------------------------------------------------------------------

/**
 * Swap a single-attribute tag's value. Asserts the tag was there and unique —
 * a silent miss here is how a page ends up canonicalised to another one.
 */
function swap(html, pattern, replacement, label) {
  const matches = html.match(pattern);
  if (!matches || matches.length !== 1) {
    fail(`expected exactly one ${label} in the template, found ${matches?.length ?? 0}`);
  }
  return html.replace(pattern, replacement);
}

function page({ markup, path, title, description, minLength }) {
  if (typeof markup !== 'string' || markup.length < minLength || !markup.includes('<main')) {
    fail(`${path} markup looks empty or malformed (${markup?.length ?? 0} chars)`);
  }
  let html = template.replace(PLACEHOLDER, `<div id="root">${MARKER}${markup}</div>`);
  const url = `${SITE}${path}`;
  html = swap(html, /<title>[^<]*<\/title>/g, `<title>${title}</title>`, '<title>');
  html = swap(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/g,
    `<meta name="description" content="${description}" />`,
    'meta description',
  );
  html = swap(
    html,
    /<link rel="canonical" href="[^"]*" \/>/g,
    `<link rel="canonical" href="${url}" />`,
    'canonical link',
  );
  html = swap(
    html,
    /<meta property="og:url" content="[^"]*" \/>/g,
    `<meta property="og:url" content="${url}" />`,
    'og:url',
  );
  html = swap(
    html,
    /<meta property="og:title" content="[^"]*" \/>/g,
    `<meta property="og:title" content="${title}" />`,
    'og:title',
  );
  html = swap(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/g,
    `<meta property="og:description" content="${description}" />`,
    'og:description',
  );
  return html;
}

// The description is deliberately about the COMPARISON, not about any one
// brand: this page should rank for "which nostr client", never for a client's
// own name (same call as public/robots.txt).
const galleryMarkup = render();
const galleryHtml = page({
  markup: galleryMarkup,
  path: '/',
  title: 'Sandstr — Try Nostr clients, no keys, no install',
  description:
    'Feel what Nostr is like before you commit to a client — interactive, in-browser simulations with mock data. No keys, no signup, no install.',
  minLength: 500,
});
writeFileSync(htmlPath, galleryHtml, 'utf8');

const compareMarkup = renderCompare();
const compareHtml = page({
  markup: compareMarkup,
  path: '/compare',
  title: 'Which Nostr client? — a capability comparison | Sandstr',
  description:
    'Signers, multiple accounts, muting words and hashtags, built-in wallets, one-tap zaps: what real Nostr clients can and cannot do, every claim sourced and dated.',
  minLength: 2000,
});
writeFileSync(comparePath, compareHtml, 'utf8');

// The title and description live next to the copy they summarise, in
// src/host/docs/DocsContent.tsx — the same string the tab shows on the live
// route, so the two can never disagree about what this page is.
const docsMarkup = renderDocs();
const docsHtml = page({
  markup: docsMarkup,
  path: '/docs',
  title: DOCS_TITLE,
  description: DOCS_DESCRIPTION,
  minLength: 3000,
});
writeFileSync(docsPath, docsHtml, 'utf8');

rmSync(ssrDir, { recursive: true, force: true });

const kb = (n) => (Buffer.byteLength(n, 'utf8') / 1024).toFixed(1);
console.log(
  `prerender: ${kb(galleryMarkup)} kB into dist/index.html, ` +
    `${kb(compareMarkup)} kB into dist/compare.html, ` +
    `${kb(docsMarkup)} kB into dist/docs.html`,
);
