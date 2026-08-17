/**
 * Post-build HTML step. Two jobs, in this order:
 *   a) writes `dist/c/<id>.html` — one real file per client route, carrying
 *      that client's own share tags (title, og:*), and
 *   b) bakes the gallery's markup into `dist/index.html`.
 *
 * Runs as the third stage of `npm run build`:
 *   1. `vite build`                      -> dist/ (client bundle, empty #root)
 *   2. `vite build --ssr src/entry-server.tsx --outDir dist-ssr`
 *   3. `node scripts/prerender.mjs`      -> emits + injects, then deletes dist-ssr/
 *
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
const routeDir = new URL('../dist/c/', import.meta.url);

// Vite emits exactly this, and index.html hand-writes it. If either ever
// changes, the build must stop rather than ship an empty page.
const PLACEHOLDER = '<div id="root"></div>';
const MARKER = '<!-- prerendered by scripts/prerender.mjs -->';
const ROUTE_MARKER = '<!-- share tags rewritten by scripts/prerender.mjs -->';

// Absolute, because some scrapers (Twitter in particular) will not resolve a
// relative og:image. Kept in one place so a domain move is one edit.
const ORIGIN = 'https://sandstr.app';

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

const { render, shareRoutes } = await import(ssrEntry.href);
const markup = render();

// A render that returns an empty shell still "succeeds", so assert on shape.
if (typeof markup !== 'string' || markup.length < 500 || !markup.includes('<main')) {
  fail(`gallery markup looks empty or malformed (${markup?.length ?? 0} chars)`);
}

const html = readFileSync(htmlPath, 'utf8');
const occurrences = html.split(PLACEHOLDER).length - 1;
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

  let out = html;
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
// (b) the gallery, into dist/index.html
// ---------------------------------------------------------------------------
writeFileSync(
  htmlPath,
  html.replace(PLACEHOLDER, `<div id="root">${MARKER}${markup}</div>`),
  'utf8',
);

rmSync(ssrDir, { recursive: true, force: true });

const kb = (Buffer.byteLength(markup, 'utf8') / 1024).toFixed(1);
console.log(`prerender: wrote ${routes.length} share-card route(s) to dist/c/`);
console.log(`prerender: injected ${kb} kB of gallery markup into dist/index.html`);
