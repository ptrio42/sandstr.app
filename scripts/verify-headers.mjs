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
import { readdirSync } from 'node:fs';

const distDir = new URL('../dist/', import.meta.url);
const htmlPath = new URL('index.html', distDir);
const routeDir = new URL('c/', distDir);
const headersPath = new URL('_headers', distDir);

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

// Every HTML file the build emits, not just index.html: since prerender.mjs
// started writing dist/c/<id>.html, twelve more documents carry the same inline
// guard, and a hash that covers only one of them ships eleven pages whose
// script the browser silently refuses to run.
const htmlFiles = [htmlPath];
if (existsSync(routeDir)) {
  for (const name of readdirSync(routeDir).sort()) {
    if (name.endsWith('.html')) htmlFiles.push(new URL(name, routeDir));
  }
}

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

const missing = [];
let checked = 0;

for (const file of htmlFiles) {
  const rel = fileURLToPath(file).split('/dist/')[1] ?? fileURLToPath(file);
  const html = readFileSync(file, 'utf8');

  // Inline scripts only: the `src=` variants are covered by 'self'.
  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)];
  if (inlineScripts.length === 0) {
    fail(`no inline <script> found in dist/${rel} — the deep-link guard is gone`);
  }

  let checkedHere = 0;
  for (const [, rawAttrs, body] of inlineScripts) {
    const type = (rawAttrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1] ?? '').toLowerCase();
    if (DATA_BLOCK_TYPES.has(type)) continue;

    checkedHere += 1;
    const hash = `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`;
    if (!declaredHashes.has(hash)) {
      missing.push({ file: rel, type: type || '(classic)', hash, preview: body.trim().slice(0, 60) });
    }
  }

  if (checkedHere === 0) {
    fail(`every inline <script> in dist/${rel} is a data block — the deep-link guard is gone`);
  }
  checked += checkedHere;
}

if (missing.length > 0) {
  for (const m of missing) {
    console.error(`verify-headers: inline script ${m.type} in dist/${m.file} is not allowed by the CSP`);
    console.error(`  starts with: ${JSON.stringify(m.preview)}`);
    console.error(`  add this to script-src in public/_headers: ${m.hash}`);
  }
  fail(`${missing.length} inline script(s) would be blocked in production`);
}

console.log(
  `verify-headers: CSP covers ${checked} inline script(s) across ${htmlFiles.length} HTML file(s); frame-ancestors present`,
);
