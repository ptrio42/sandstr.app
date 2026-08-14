/**
 * Post-build step: bakes each indexable page's markup into its own HTML file.
 *
 * Runs as the third stage of `npm run build`:
 *   1. `vite build`                      -> dist/ (client bundle, empty #root)
 *   2. `vite build --ssr src/entry-server.tsx --outDir dist-ssr`
 *   3. `node scripts/prerender.mjs`      -> injects, then deletes dist-ssr/
 *
 * Two pages, because two are indexable:
 *   /         -> dist/index.html          the gallery
 *   /compare  -> dist/compare/index.html  the capability matrix in words
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
 */
import { readFileSync, writeFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ssrEntry = new URL('../dist-ssr/entry-server.js', import.meta.url);
const ssrDir = new URL('../dist-ssr/', import.meta.url);
const htmlPath = new URL('../dist/index.html', import.meta.url);
const compareDir = new URL('../dist/compare/', import.meta.url);
const comparePath = new URL('../dist/compare/index.html', import.meta.url);

const SITE = 'https://sandstr.app';

// Vite emits exactly this, and index.html hand-writes it. If either ever
// changes, the build must stop rather than ship an empty page.
const PLACEHOLDER = '<div id="root"></div>';
const MARKER = '<!-- prerendered by scripts/prerender.mjs -->';

function fail(message) {
  console.error(`prerender: ${message}`);
  process.exit(1);
}

if (!existsSync(ssrEntry)) {
  fail(`missing ${fileURLToPath(ssrEntry)} — did stage 2 (vite build --ssr) run?`);
}
if (!existsSync(htmlPath)) {
  fail(`missing ${fileURLToPath(htmlPath)} — did stage 1 (vite build) run?`);
}

const { render, renderCompare } = await import(ssrEntry.href);

const template = readFileSync(htmlPath, 'utf8');
const occurrences = template.split(PLACEHOLDER).length - 1;
if (occurrences !== 1) {
  fail(`expected exactly one \`${PLACEHOLDER}\` in dist/index.html, found ${occurrences}`);
}

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
mkdirSync(compareDir, { recursive: true });
writeFileSync(comparePath, compareHtml, 'utf8');

rmSync(ssrDir, { recursive: true, force: true });

const kb = (n) => (Buffer.byteLength(n, 'utf8') / 1024).toFixed(1);
console.log(
  `prerender: ${kb(galleryMarkup)} kB into dist/index.html, ` +
    `${kb(compareMarkup)} kB into dist/compare/index.html`,
);
