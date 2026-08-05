/**
 * Post-build step: proves `dist/_headers` still describes `dist/index.html`.
 *
 * Runs as the fourth stage of `npm run build`, after scripts/prerender.mjs.
 *
 * The CSP in public/_headers pins index.html's inline script by SHA-256 hash,
 * which is the only way to keep `script-src` free of 'unsafe-inline'. A hash is
 * also the one part of a header file that silently rots: edit one character of
 * that script — even a comment, even whitespace — and the browser stops running
 * it. The failure is invisible in dev (no dev server applies _headers) and
 * nearly invisible in production: the deep-link guard just stops clearing the
 * prerendered gallery, so someone opening a shared /c/damus sees the GALLERY
 * flash before React swaps it. A wrong page, on the exact path visitors arrive
 * by, reported by nobody.
 *
 * So the build recomputes the hash and refuses to ship a mismatch.
 *
 * Non-executable blocks (<script type="application/ld+json">) are exempt:
 * browsers never run them, so script-src is not consulted. Anything else —
 * including a future importmap — is treated as executable and must be hashed.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const htmlPath = new URL('../dist/index.html', import.meta.url);
const headersPath = new URL('../dist/_headers', import.meta.url);

// Script types the browser parses as data, not code.
const DATA_BLOCK_TYPES = new Set(['application/ld+json', 'application/json', 'text/plain']);

function fail(message) {
  console.error(`verify-headers: ${message}`);
  process.exit(1);
}

for (const p of [htmlPath, headersPath]) {
  if (!existsSync(p)) {
    fail(`missing ${fileURLToPath(p)} — did the build stages before this one run?`);
  }
}

const html = readFileSync(htmlPath, 'utf8');
const headers = readFileSync(headersPath, 'utf8');

// One CSP line, or the file has been restructured in a way this check no longer
// understands — which is itself worth stopping for.
const cspLines = headers
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.toLowerCase().startsWith('content-security-policy:'));

if (cspLines.length !== 1) {
  fail(`expected exactly one Content-Security-Policy line in dist/_headers, found ${cspLines.length}`);
}

const csp = cspLines[0];
if (!csp.includes('frame-ancestors')) {
  fail("CSP has no frame-ancestors directive — /c/<client> would be framable on any domain");
}
if (/script-src[^;]*'unsafe-inline'/.test(csp)) {
  fail("CSP allows 'unsafe-inline' in script-src, which defeats the point of hashing");
}

const declaredHashes = new Set(csp.match(/'sha256-[A-Za-z0-9+/=]+'/g) ?? []);

// Inline scripts only: the `src=` variants are covered by 'self'.
const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)];
if (inlineScripts.length === 0) {
  fail('no inline <script> found in dist/index.html — the deep-link guard is gone');
}

const missing = [];
let checked = 0;

for (const [, rawAttrs, body] of inlineScripts) {
  const type = (rawAttrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1] ?? '').toLowerCase();
  if (DATA_BLOCK_TYPES.has(type)) continue;

  checked += 1;
  const hash = `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`;
  if (!declaredHashes.has(hash)) {
    missing.push({ type: type || '(classic)', hash, preview: body.trim().slice(0, 60) });
  }
}

if (checked === 0) {
  fail('every inline <script> in dist/index.html is a data block — the deep-link guard is gone');
}

if (missing.length > 0) {
  for (const m of missing) {
    console.error(`verify-headers: inline script ${m.type} is not allowed by the CSP`);
    console.error(`  starts with: ${JSON.stringify(m.preview)}`);
    console.error(`  add this to script-src in public/_headers: ${m.hash}`);
  }
  fail(`${missing.length} inline script(s) would be blocked in production`);
}

console.log(`verify-headers: CSP covers ${checked} inline script(s); frame-ancestors present`);
