/**
 * Post-build step: bakes the gallery's markup into `dist/index.html`.
 *
 * Runs as the third stage of `npm run build`:
 *   1. `vite build`                      -> dist/ (client bundle, empty #root)
 *   2. `vite build --ssr src/entry-server.tsx --outDir dist-ssr`
 *   3. `node scripts/prerender.mjs`      -> injects, then deletes dist-ssr/
 *
 * Uses `react-dom/server`, already a dependency via react-dom — no new npm
 * package, per the CLAUDE.md rule. See src/entry-server.tsx for why only the
 * gallery is rendered and why this is not hydration.
 *
 * Fails loudly on every anomaly. A prerender that silently no-ops is worse
 * than no prerender: the build would go green while the one indexable page
 * quietly went back to being empty.
 */
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ssrEntry = new URL('../dist-ssr/entry-server.js', import.meta.url);
const ssrDir = new URL('../dist-ssr/', import.meta.url);
const htmlPath = new URL('../dist/index.html', import.meta.url);

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

const { render } = await import(ssrEntry.href);
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

writeFileSync(
  htmlPath,
  html.replace(PLACEHOLDER, `<div id="root">${MARKER}${markup}</div>`),
  'utf8',
);

rmSync(ssrDir, { recursive: true, force: true });

const kb = (Buffer.byteLength(markup, 'utf8') / 1024).toFixed(1);
console.log(`prerender: injected ${kb} kB of gallery markup into dist/index.html`);
