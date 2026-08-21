/**
 * Generates `public/og/<id>.png` — one 1200x630 share card per client route,
 * each showing that client's ACTUAL reproduction inside a device.
 *
 *   npm run og:cards
 *     = npm run build                                   (a dist/ to shoot against)
 *       && vite build --ssr src/entry-server.tsx …      (shareRoutes())
 *       && node scripts/og-client-cards.mjs
 *
 * The cards it writes are inputs to the NEXT `npm run build`, which copies
 * public/ into dist/. So the deploy sequence is: og:cards, then build, then
 * ship. Running build alone never regenerates them — that is deliberate, it
 * needs a local Chrome that CI does not have.
 *
 * MANUAL, not part of `npm run build`, for the same reason public/og.png is.
 * Re-run it after a brand change, a new client, a status flip, or any visual
 * change to a simulator — the card is a photograph of the reproduction and
 * goes stale the moment the reproduction moves.
 *
 * WHY THE CARDS EXIST: scrapers do not run JS, so per-route tags alone are not
 * enough — every one of them still pointed at the gallery's og.png, which made
 * a Damus link and a Wisp link look identical in a feed. scripts/prerender.mjs
 * emits the tags; this writes the pictures they point at.
 *
 * WHAT THE CARD MAY SHOW, and why it is drawn the way it is. This is the ONE
 * sandstr surface that travels with no disclaimer strip, no handoff link and
 * no address bar — the exact context in which a pixel-faithful reproduction
 * could be read as the real client. A full-bleed screenshot would BE that
 * confusion. So the screenshot is always mounted in a device we draw: a phone
 * in perspective for mobile clients, a browser window for web and desktop
 * ones. A device turns the image into "here is a screen showing X" instead of
 * "this is X" — the same move the site itself makes with MobilePhoneFrame.
 * Around it: our lockup, our background, and "simulation · unofficial · mock
 * data · not affiliated with <name>" burned into a band across the bottom in
 * the same amber as the in-app banner. The client's own mark stays on the
 * card at identification size, which is what nominative use is for.
 *
 * No new npm dependency (CLAUDE.md): Node 24 ships a global WebSocket, so CDP
 * needs no client library; the static server is node:http; the lockup geometry
 * comes from the mirror in scripts/og-image.html rather than a third copy.
 *
 * RELATION TO docs/clips/capture-faq.mjs: that harness drives the same browser
 * the same way and its measured lessons are honoured here (shoot the
 * production build, never `npm run dev`, because other agent sessions hold
 * 5173; poll inside the page, not over CDP). Its CDP plumbing is deliberately
 * NOT imported — it is a 1179-line clip pipeline with an ffmpeg stage, and
 * coupling a build asset to it would make every clip change a card risk. If a
 * third consumer appears, that is the moment to extract a shared module.
 */
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  existsSync,
  mkdtempSync,
  statSync,
} from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, extname } from 'node:path';

const root = new URL('../', import.meta.url);
const ssrEntry = new URL('dist-ssr/entry-server.js', root);
const ssrDir = new URL('dist-ssr/', root);
const sourceCard = new URL('scripts/og-image.html', root);
const publicDir = new URL('public/', root);
const outDir = new URL('public/og/', root);
const DIST = fileURLToPath(new URL('dist/', root));

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * Capture viewports. Widths are load-bearing, heights are only a starting
 * guess — `fitStage()` corrects the height so the stage lands on the aspect
 * the card's device wants, instead of cropping to it afterwards.
 *
 * 430 for phones because ClientView's `max-sm:` branch drops the bezel, the
 * radius and the shadow there ("on a phone the visitor's own device IS the
 * device"), which is exactly the bare screen this wants — the bezel is drawn
 * on the card instead. 1280 for web because frameless clients are `gated`
 * below 640 and render no simulator at all.
 */
const PHONE = { width: 430, height: 950, aspect: 9 / 19.5 };
const DESK = { width: 1280, height: 900, aspect: 16 / 10 };

/**
 * How long a welcome toast stays up after sign-in. 2500ms is what the three
 * simulators that raise one all use (`showToast` in Amethyst, Amethyst v1.12
 * and Keychat); 3000 leaves room for the exit transition on top of it.
 */
const TOAST_MS = 3000;

/** Breathing room the device must keep from the card's edges. */
const MARGIN = 8;

const CHROME =
  process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

function fail(message) {
  console.error(`og-client-cards: ${message}`);
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- inputs -----------------------------------------------------------------

if (!existsSync(join(DIST, 'index.html'))) {
  fail('dist/index.html missing — run `npm run build` first (npm run og:cards does)');
}
if (!existsSync(ssrEntry)) {
  fail(`missing ${fileURLToPath(ssrEntry)} — run \`npm run og:cards\`, which builds the SSR bundle`);
}
if (!existsSync(CHROME)) {
  fail(`no Chrome at ${CHROME} — set CHROME_BIN to a headless-capable Chrome binary`);
}

const { shareRoutes } = await import(ssrEntry.href);
if (typeof shareRoutes !== 'function') fail('the SSR bundle exports no shareRoutes()');

const routes = shareRoutes();
if (!Array.isArray(routes) || routes.length === 0) fail('shareRoutes() returned nothing');

/**
 * The sandstr lockup, lifted out of scripts/og-image.html rather than copied
 * again. That file already calls itself "a static mirror" of
 * src/host/brand/*.tsx; a third copy here would be a mirror of a mirror, and
 * the one that quietly stops matching after a brand change.
 */
const lockup = (() => {
  const html = readFileSync(sourceCard, 'utf8');
  // From <body> onward, never from the top: that file's head comment documents
  // this very extraction, and the moment it spells the tag out literally a
  // whole-file indexOf starts slicing from inside a comment and splices the
  // page's closing tags into every card.
  const bodyAt = html.indexOf('<body');
  if (bodyAt === -1) fail('scripts/og-image.html has no <body>');
  const open = html.indexOf('<div class="lockup">', bodyAt);
  // The block holds two <svg> elements and no nested <div>, so the first
  // closing tag after it is its own. If that ever stops being true the shape
  // assertion below is what catches it.
  const close = open === -1 ? -1 : html.indexOf('</div>', open);
  if (open === -1 || close === -1) {
    fail('could not find the div.lockup block in scripts/og-image.html');
  }
  const block = html.slice(open, close + '</div>'.length);
  if (!block.includes('viewBox="0 0 100 100"') || !block.includes('viewBox="-10 0 727.7 133"')) {
    fail('the lockup block in scripts/og-image.html no longer holds both brand SVGs');
  }
  return block;
})();

// --- colour -----------------------------------------------------------------

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

/** WCAG relative luminance, used only to decide how far to lighten. */
const luminance = ([r, g, b]) => {
  const lin = [r, g, b]
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
};

/**
 * Brand accents are chosen against each client's own background, not against
 * #0b0b10 — Amethyst's #6B21A8 and Keychat's #1E40AF are unreadable here. Mix
 * toward white until the text clears roughly 7:1 on the card, which keeps the
 * hue (still recognisably "the purple one") while making the line legible.
 * The unmixed accent stays in use for the glow, where contrast is irrelevant.
 */
function readable(hex) {
  let rgb = hexToRgb(hex);
  for (let i = 0; i < 20 && luminance(rgb) < 0.42; i += 1) {
    rgb = rgb.map((v) => Math.round(v + (255 - v) * 0.12));
  }
  return `rgb(${rgb.join(', ')})`;
}

const rgba = (hex, a) => `rgba(${hexToRgb(hex).join(', ')}, ${a})`;

// --- assets -----------------------------------------------------------------

/**
 * Inline the client's mark as a data: URI. The card renders from a file:// page
 * in a temp directory, so a relative /icons/ path would resolve to nothing and
 * the card would silently ship a hole where the mark goes.
 */
function inlineIcon(iconPath) {
  const file = new URL(iconPath.replace(/^\//, ''), publicDir);
  if (!existsSync(file)) fail(`icon ${iconPath} is in the registry but not on disk`);
  const ext = iconPath.slice(iconPath.lastIndexOf('.')).toLowerCase();
  const mime = MIME[ext];
  if (!mime) fail(`icon ${iconPath} has an extension this script cannot inline (${ext})`);
  return `data:${mime};base64,${readFileSync(file).toString('base64')}`;
}

const escape = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const PLATFORM = { ios: 'iOS', android: 'Android', web: 'Web', desktop: 'Desktop' };

// --- static server ----------------------------------------------------------

/**
 * Serves dist/ with the SPA fallback, so /c/<id> resolves the same way
 * Cloudflare resolves it. Port 0 = whatever is free: hardcoding one would
 * collide with the other agent sessions this repo runs alongside.
 */
async function serveDist() {
  const server = createServer(async (req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    const candidates = [
      join(DIST, url),
      join(DIST, `${url}.html`),
      join(DIST, url, 'index.html'),
      join(DIST, 'index.html'),
    ];
    for (const file of candidates) {
      if (!file.startsWith(DIST)) continue;
      try {
        const body = await readFile(file);
        res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
        res.end(body);
        return;
      } catch {
        /* next candidate — SPA fallback is the last one */
      }
    }
    res.writeHead(404).end('not found');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, port: server.address().port };
}

// --- minimal CDP ------------------------------------------------------------

class CDP {
  #ws;
  #id = 0;
  #pending = new Map();
  #waiters = [];
  /** Page-side errors since the last reset, surfaced when a wait times out. */
  pageErrors = [];

  static async attach(url) {
    const cdp = new CDP();
    cdp.#ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      cdp.#ws.addEventListener('open', resolve, { once: true });
      cdp.#ws.addEventListener('error', reject, { once: true });
    });
    cdp.#ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id === undefined) {
        // A simulator that throws on mount renders nothing, and without this
        // the only symptom is a timeout naming a client that "did not render"
        // — which reads like a slow machine and is not.
        if (msg.method === 'Runtime.exceptionThrown') {
          const d = msg.params?.exceptionDetails;
          cdp.pageErrors.push(d?.exception?.description ?? d?.text ?? 'unknown exception');
        }
        if (msg.method === 'Log.entryAdded' && msg.params?.entry?.level === 'error') {
          cdp.pageErrors.push(`${msg.params.entry.source}: ${msg.params.entry.text}`);
        }
        // Events: only one-shot waiters, which is all this script needs.
        for (const w of cdp.#waiters.splice(0)) {
          w.method === msg.method ? w.resolve(msg.params) : cdp.#waiters.push(w);
        }
        return;
      }
      const p = cdp.#pending.get(msg.id);
      if (!p) return;
      cdp.#pending.delete(msg.id);
      msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
    });
    return cdp;
  }

  /** Resolve on the next occurrence of `method`. */
  once(method, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const waiter = { method, resolve };
      this.#waiters.push(waiter);
      setTimeout(() => {
        this.#waiters = this.#waiters.filter((w) => w !== waiter);
        reject(new Error(`timed out waiting for CDP event ${method}`));
      }, timeout);
    });
  }

  send(method, params = {}, sessionId) {
    const id = (this.#id += 1);
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
      this.#ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }

  close() {
    this.#ws.close();
  }
}

class Page {
  constructor(cdp, sid) {
    this.cdp = cdp;
    this.sid = sid;
  }

  send(method, params) {
    return this.cdp.send(method, params, this.sid);
  }

  async eval(expression) {
    const { result, exceptionDetails } = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'eval failed');
    return result.value;
  }

  /**
   * Poll INSIDE the page rather than round-tripping CDP every 100ms — the
   * lesson docs/clips/capture-faq.mjs paid for: a busy driver socket starves
   * everything else sharing it, and one awaited round trip costs the same
   * whether the wait is 50ms or 15s.
   */
  async until(expression, { timeout = 20000, label = expression } = {}) {
    const raw = await this.eval(`new Promise((resolve) => {
      const started = Date.now();
      const tick = () => {
        let value = null;
        try { value = (${expression}); } catch { value = null; }
        if (value) return resolve(JSON.stringify({ ok: true, value }));
        if (Date.now() - started > ${timeout}) return resolve(JSON.stringify({ ok: false }));
        setTimeout(tick, 100);
      };
      tick();
    })`);
    const res = JSON.parse(raw);
    if (!res.ok) throw new Error(`timed out waiting for: ${label}`);
    return res.value;
  }

  async viewport({ width, height, scale = 2 }) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: scale,
      mobile: false,
    });
  }

  /**
   * Navigate and wait for the NEW document.
   *
   * The obvious `navigate(); until(readyState === "complete")` is a race, and
   * it produced exactly the failure that is hardest to read: a different client
   * broke on each run, always with an empty stage. `Runtime.evaluate` issued
   * straight after `Page.navigate` can still land on the OUTGOING document —
   * where readyState is already "complete", so the poll returns instantly and
   * the caller starts hunting for buttons in a page that is being torn down;
   * or the in-page poll is discarded mid-navigation and never resolves at all.
   * Waiting for the load event first means every later eval sees the page that
   * was actually asked for.
   */
  async goto(url) {
    const loaded = this.cdp.once('Page.loadEventFired');
    await this.send('Page.navigate', { url });
    await loaded;
    await this.until('document.readyState === "complete"', { label: `load ${url}` });
  }

  /**
   * A real mouse event, not `el.click()`. Keychat's entry button is the case
   * that forced it: a synthetic click on the DOM node did nothing at all,
   * while a dispatched press/release pair walks straight in.
   */
  async clickAt(x, y) {
    for (const type of ['mousePressed', 'mouseReleased']) {
      await this.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
    }
  }

  /** PNG bytes, optionally clipped to a CSS-pixel rect. */
  async shot(clip) {
    const { data } = await this.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
      ...(clip ? { clip: { ...clip, scale: 1 } } : {}),
    });
    return Buffer.from(data, 'base64');
  }
}

// --- capture ----------------------------------------------------------------

/** The bare reproduction, without host chrome. Both halves of ClientView's stage. */
const STAGE = '[data-sandstr-stage], .mobile-phone-frame-bezel';

/**
 * How to get past each client's entry screen, by button label, in order.
 *
 * Nine of the twelve open on a sign-in wall, because that is faithfully where
 * the real client opens. Faithful is not the same as sellable: a card whose
 * whole promise is "no keys, no install" cannot show a login form, and a shelf
 * of twelve login forms is also the one screen on which every client looks the
 * same. So the capture walks in first and photographs the feed.
 *
 * By visible label rather than by selector: these are the strings a person
 * reads on the screen, so a mismatch is legible in the error, and it does not
 * bind the card pipeline to a simulator's internal class names or to the tour
 * command interface (which CLAUDE.md marks untouchable). Verified by walking
 * all twelve, 2026-08-16 — an unlisted client is one that needed no click.
 * Boris, added 2026-08-21, is the thirteenth route and the clearest case of
 * that: it has no login wall at all, so it photographs its own Home.
 */
const ENTRY = {
  damus: ['Sign In'],
  amethyst: ['Login'],
  'amethyst-v1-12': ['Login'],
  primal: ['Sign in'],
  snort: ['Sign in with key'],
  yakihonne: ['Continue as a guest'],
  // Wisp's onboarding is three screens deep: method, then account, then a
  // profile form whose Continue stays `disabled` until a display name exists —
  // hence the fill step. The name is the same demo identity the simulator logs
  // in as either way, so nothing invented reaches the card.
  wisp: [
    'Continue with Nostr',
    'Create new account',
    { fill: 'input[type="text"]', value: 'Sandy' },
    'Continue',
  ],
  nostur: ['Try guest account'],
  gossip: ['Get Started'],
  // Keychat fakes 1.5s of key generation before it swaps the screen, which is
  // why every click below waits for the stage to CHANGE rather than for a
  // fixed delay — a 1500ms sleep here landed exactly on the boundary and
  // photographed the login wall.
  keychat: ['Create New Account'],
};

/**
 * Centre of the visible control carrying this label.
 *
 * Searches EVERY element, not just button/a/[role=button]: Snort's "Sign in
 * with key" is none of those, and restricting the query made the run fail with
 * the label plainly readable on screen. Among matches it takes the SMALLEST
 * box, which is the label's own element rather than the section wrapping it —
 * clicking a wrapper's centre lands wherever that centre happens to fall.
 */
const locate = (label) => `(() => {
  const want = ${JSON.stringify(label)}.toLowerCase();
  const ok = (el) => { const r = el.getBoundingClientRect(); return r.width > 10 && r.height > 10; };
  const txt = (el) => (el.innerText || el.getAttribute('aria-label') || '').trim().toLowerCase();
  const all = [...document.querySelectorAll('*')].filter(ok);
  const area = (el) => { const r = el.getBoundingClientRect(); return r.width * r.height; };
  const pick = (list) => list.sort((a, b) => area(a) - area(b))[0] ?? null;
  const hit = pick(all.filter((e) => txt(e) === want)) ?? pick(all.filter((e) => txt(e).includes(want)));
  if (!hit) return null;
  const r = hit.getBoundingClientRect();
  return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
})()`;

/**
 * Click the labelled node directly, bypassing hit-testing.
 *
 * Walks up to the nearest button/anchor first: the tightest text match is
 * often a <span> inside the control, and the handler lives on the control.
 */
const clickNode = (label) => `(() => {
  const want = ${JSON.stringify(label)}.toLowerCase();
  const ok = (el) => { const r = el.getBoundingClientRect(); return r.width > 10 && r.height > 10; };
  const txt = (el) => (el.innerText || el.getAttribute('aria-label') || '').trim().toLowerCase();
  const all = [...document.querySelectorAll('*')].filter(ok);
  const area = (el) => { const r = el.getBoundingClientRect(); return r.width * r.height; };
  const pick = (list) => list.sort((a, b) => area(a) - area(b))[0] ?? null;
  const hit = pick(all.filter((e) => txt(e) === want)) ?? pick(all.filter((e) => txt(e).includes(want)));
  if (!hit) return false;
  (hit.closest('button, a, [role="button"]') ?? hit).click();
  return true;
})()`;

/** Centre of the first visible match for a plain CSS selector. */
const locateSel = (selector) => `(() => {
  const el = [...document.querySelectorAll(${JSON.stringify(selector)})]
    .find((e) => { const r = e.getBoundingClientRect(); return r.width > 10 && r.height > 10; });
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
})()`;

const stageText = `(() => {
  const el = document.querySelector('${STAGE}');
  return el ? el.innerText.replace(/\\s+/g, ' ').slice(0, 400) : '';
})()`;

const rectOf = `(() => {
  const el = document.querySelector('${STAGE}');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width > 100 && r.height > 100 ? {x: r.x, y: r.y, width: r.width, height: r.height} : null;
})()`;

/**
 * Readiness is CONTENT, not geometry. ClientView lays the stage box out the
 * moment the route matches — a full-size, entirely empty div — and the lazy()
 * chunk arrives well after that, so waiting on the rect alone starts the entry
 * walk inside a blank page and every failure reads "matched nothing visible"
 * with an empty stage, on a different client each run.
 *
 * Counted in elements rather than in text because Gossip's welcome modal is
 * portalled out of the stage and leaves its innerText empty while the client
 * behind it is fully rendered.
 *
 * The threshold is deliberately LOW. An earlier 30 looked like a safe "is it
 * really up" bar and silently excluded Primal, whose sign-in screen renders 19
 * elements and nothing more — the run failed with "never rendered" against a
 * page that was fully painted. An empty stage has zero children, so anything
 * above a handful separates mounted from not; the specific control `enter()`
 * then waits for is what actually proves the screen is the expected one.
 */
const stageReady = `(() => {
  const el = document.querySelector('${STAGE}');
  return !!el && el.querySelectorAll('*').length > 5;
})()`;

/**
 * Resize the WINDOW until the STAGE lands on the aspect the card's device
 * wants, instead of cropping the screenshot to it afterwards.
 *
 * Cropping was the obvious version and it is wrong here: the parts a feed
 * reader recognises are the top bar and the bottom tab bar, i.e. exactly the
 * two edges a centre-crop eats. The host chrome above and below the stage is
 * near enough constant, so one correction pass converges — and the assertion
 * afterwards means a layout change that breaks the assumption fails the run
 * rather than shipping twelve subtly squashed cards.
 */
async function fitStage(page, base, id) {
  let height = base.height;
  let rect = null;

  for (let pass = 0; pass < 4; pass += 1) {
    await page.viewport({ width: base.width, height });
    rect = await page.until(rectOf, { label: `${id}: simulator stage` });
    const want = rect.width / base.aspect;
    const delta = Math.round(want - rect.height);
    if (Math.abs(delta) <= 4) return rect;
    height += delta;
    if (height < 400 || height > 4000) break;
  }

  const got = (rect.width / rect.height).toFixed(3);
  fail(
    `[${id}] stage will not reach aspect ${base.aspect.toFixed(3)} (stuck at ${got}) — ` +
      'ClientView\'s chrome around the stage probably changed height with the viewport',
  );
}

/**
 * Walk past the entry screen. Each click waits for the stage's text to CHANGE
 * rather than for a fixed delay, so a simulator that fakes work (Keychat's
 * 1.5s key generation) is handled by the same three lines as one that swaps
 * instantly, and a step that quietly stops doing anything fails the run.
 */
async function enter(page, route) {
  for (const step of ENTRY[route.id] ?? []) {
    const filling = typeof step !== 'string';
    const what = filling ? step.fill : step;

    // WAIT for the control, never assume it is already laid out: the stage
    // gets its rect as soon as the lazy chunk mounts, which for Primal is
    // several hundred ms before its sign-in screen paints a button.
    let point;
    try {
      point = await page.until(filling ? locateSel(step.fill) : locate(step), {
        timeout: 15000,
        label: `"${what}"`,
      });
    } catch {
      // What IS on screen, not just what is missing: an entry table drifts
      // silently and the stage text says in one line whether the flow moved,
      // the client failed to mount, or a step landed somewhere unexpected.
      const seen = await page.eval(stageText).catch(() => '(stage unreadable)');
      fail(
        `[${route.id}] entry step "${what}" matched nothing visible — that flow changed; ` +
          `re-walk the client and update ENTRY in this file.\n  stage now reads: ${seen}`,
      );
    }

    if (filling) {
      // Real focus then real text input, so a controlled React field updates
      // through its own onChange instead of us reaching past it.
      await page.clickAt(point.x, point.y);
      await page.send('Input.insertText', { text: step.value });
      await page.until(
        `${locateSel(step.fill)} && document.querySelector(${JSON.stringify(step.fill)}).value.length > 0`,
        { timeout: 5000, label: `${route.id}: "${step.fill}" accepted text` },
      );
      continue;
    }

    const before = await page.eval(stageText);
    // "It worked" is EITHER the stage saying something new OR the control
    // being gone. Text alone is not enough: Gossip's welcome modal is
    // portalled outside the stage, so dismissing it changes nothing the stage
    // reports, and the run stalled on a click that had in fact landed.
    const changed = `((${stageText}) !== ${JSON.stringify(before)}) || !(${locate(step)})`;

    // Two click mechanisms, because the twelve clients need both and neither
    // alone is enough. A dispatched mouse event is hit-tested, so Keychat's
    // entry button — which ignores a synthetic DOM click completely — takes it;
    // but hit-testing is also what lets an invisible scrim swallow the click,
    // which is what Gossip's welcome modal does. So: real mouse first, and if
    // the screen has not moved, reach for the node directly.
    await page.clickAt(point.x, point.y);
    try {
      await page.until(changed, { timeout: 4000, label: `after "${step}"` });
    } catch {
      await page.eval(clickNode(step));
      await page.until(changed, {
        timeout: 12000,
        label: `${route.id}: screen after "${step}" (both click paths tried)`,
      });
    }
  }
}

/** One reproduction, shot bare, as a data: URI ready to drop into the card. */
async function captureScreen(page, route, baseUrl) {
  const framed = route.platform === 'ios' || route.platform === 'android';
  const base = framed ? PHONE : DESK;

  await page.viewport(base);
  page.cdp.pageErrors = [];
  // Clear the cross-client "keep your place" intent before the client mounts.
  // All thirteen routes share one origin and one reused tab, so the previous
  // client's `sessionStorage['sandstr:screen']`
  // (src/simulators/shared/screenSync.ts) survives into the next one — and a
  // client whose `onRestore` signs itself in then walks straight past the login
  // wall `enter()` is waiting to click. Symptom: `entry step "…" matched
  // nothing visible` with a stage that is already showing a feed; Wisp hit it
  // first because Coracle, which needs no entry click, reports `feed` on mount.
  //
  // It has to be its own navigation. Between two clients this tab is parked on
  // the `file://` card page, and sessionStorage is per-origin — clearing it
  // there empties the wrong store and changes nothing.
  await page.goto(`${baseUrl}/`);
  await page.eval('sessionStorage.clear()');
  await page.goto(`${baseUrl}/c/${route.id}`);
  // 30s: a cold lazy() chunk genuinely takes longer than the default when
  // another agent session's Chrome is competing for this machine — the same
  // contention docs/clips/capture-faq.mjs raised its own timeout for.
  try {
    await page.until(stageReady, { timeout: 30000, label: `${route.id}: simulator rendered` });
  } catch {
    const errs = page.cdp.pageErrors;
    fail(
      `[${route.id}] the simulator never rendered.` +
        (errs.length ? `\n  page errors:\n    ${errs.slice(0, 6).join('\n    ')}` : '\n  (no page errors reported)'),
    );
  }
  await enter(page, route);
  const enteredAt = Date.now();

  // Fit AFTER entering: the entry screen and the feed do not always give the
  // stage the same chrome around them.
  const rect = await fitStage(page, base, route.id);
  await page.until('document.fonts.status === "loaded"', { label: `${route.id}: fonts` });

  // Signing in fires a welcome toast — Amethyst's "Welcome, Sat Signal!",
  // Keychat's "Welcome to Keychat!" — and three cards shipped with one sitting
  // on the feed. Every one of those simulators hides it 2500ms after login
  // (grep `showToast`), so wait out the REMAINDER of that window rather than
  // sleeping a flat few seconds on top of the fitting we just did. Only for
  // clients that were actually walked in: the rest never raise one.
  if ((ENTRY[route.id] ?? []).length > 0) {
    await sleep(Math.max(0, TOAST_MS - (Date.now() - enteredAt)));
  }

  // One settle for the cross-fade ClientView swaps the stage with; without it
  // the card catches the simulator at partial opacity.
  await sleep(900);

  const png = await page.shot(rect);
  return { uri: `data:image/png;base64,${png.toString('base64')}`, framed };
}

// --- the card ---------------------------------------------------------------

function card(route, screen) {
  const accentText = readable(route.accent);
  const real = route.kind === 'reproduction';
  // Burned in, because the card is read where the banner cannot follow.
  const notice = real
    ? `Simulation · unofficial · mock data · not affiliated with ${route.name}`
    : 'Simulation · mock data · original demo client';
  // Icon, then emoji, then a monogram — the same ladder src/host/ClientGlyph.tsx
  // walks in the app. It is what lets THIRD-PARTY.md ("Client icons on share
  // cards") say a maintainer's mark comes off in one deletion rather than a
  // redesign, which is in turn what TRADEMARKS.md promises: corrected or
  // removed on request, no questions asked.
  const glyph = route.icon
    ? `<img class="mark" src="${inlineIcon(route.icon)}" alt="" />`
    : route.emoji
      ? `<span class="emoji">${escape(route.emoji)}</span>`
      : `<span class="monogram">${escape(route.name.slice(0, 1).toUpperCase())}</span>`;

  const device = screen.framed
    ? `<div class="phone"><div class="phone-screen"><img src="${screen.uri}" alt="" /></div></div>`
    : `<div class="window">
         <div class="chrome">
           <span class="light"></span><span class="light"></span><span class="light"></span>
           <div class="url">sandstr.app/c/${escape(route.id)}</div>
         </div>
         <div class="window-screen"><img src="${screen.uri}" alt="" /></div>
       </div>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${escape(route.name)} — share card</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { width: ${WIDTH}px; height: ${HEIGHT}px; }
      body {
        background: #0b0b10;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
        position: relative;
        overflow: hidden;
      }
      /* Client accent behind the device; sandstr's sand tone kept in the far
         corner so twelve cards still read as one set. */
      .glow-client {
        position: absolute; right: -180px; top: -280px; width: 1100px; height: 1100px;
        border-radius: 50%;
        background: radial-gradient(circle, ${rgba(route.accent, 0.34)} 0%, ${rgba(route.accent, 0)} 62%);
      }
      .glow-sand {
        position: absolute; left: -320px; bottom: -380px; width: 820px; height: 820px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(231, 194, 122, 0.13) 0%, rgba(231, 194, 122, 0) 62%);
      }

      /* Text left, device right. The device needs the depth of bleeding off an
         edge, and only the right edge is free — the notice band owns the bottom. */
      .copy {
        position: absolute; left: 72px; top: 52px; width: 560px;
        display: flex; flex-direction: column; align-items: flex-start;
      }
      .lockup { display: flex; align-items: center; gap: 14px; opacity: 0.92; }
      .lockup svg.mark { width: 46px; height: 46px; display: block; }
      .lockup svg.word { height: 26px; width: auto; display: block; color: #fff; }

      .row { display: flex; align-items: center; gap: 22px; margin-top: 62px; }
      .tile {
        width: 96px; height: 96px; border-radius: 24px; flex: none;
        display: flex; align-items: center; justify-content: center;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 44px ${rgba(route.accent, 0.3)};
      }
      /* Rounded, because several marks ship with their own opaque background
         (YakiHonne's is a white square) and a hard-edged white block inside a
         rounded tile reads as a rendering bug rather than as their icon. */
      .tile .mark { width: 68px; height: 68px; object-fit: contain; display: block; border-radius: 15px; }
      .tile .emoji { font-size: 54px; line-height: 1; }
      .tile .monogram { font-size: 48px; line-height: 1; font-weight: 650; color: ${accentText}; }
      h1 { font-size: 66px; line-height: 1; font-weight: 650; letter-spacing: -0.035em; color: #fff; }

      .line { margin-top: 34px; font-size: 36px; font-weight: 600; letter-spacing: -0.02em; color: ${accentText}; }
      .meta {
        margin-top: 22px; display: flex; align-items: center; gap: 14px;
        font-size: 21px; color: #a1a1aa; letter-spacing: -0.01em;
      }
      .dot { width: 5px; height: 5px; border-radius: 50%; background: #4b4b57; flex: none; }
      .pill {
        margin-top: 26px;
        border: 1px solid rgba(245, 158, 11, 0.45);
        background: rgba(245, 158, 11, 0.12);
        color: #fcd34d;
        border-radius: 999px; padding: 8px 18px;
        font-size: 19px; font-weight: 600; letter-spacing: 0.02em;
      }

      /* ---- the device ---------------------------------------------------- */
      /* Perspective is what makes this read as an OBJECT showing a screen
         rather than as the screen itself, which is the point of putting a
         reproduction on a card at all. */
      /* The device sits WHOLLY inside the card, top and bottom. An earlier
         version let the phone bleed off both edges for depth and it stopped
         reading as an object at all — a cropped rectangle of someone's app is
         the exact thing the frame exists to prevent. Depth comes from the
         rotation and the shadow instead. */
      .stage {
        position: absolute; right: 0; top: 0; bottom: 76px; width: 600px;
        display: flex; align-items: center; justify-content: center;
        perspective: 1700px;
      }
      .phone {
        width: 232px; height: 502px; flex: none;
        border-radius: 34px; padding: 8px; background: #16161c;
        box-shadow: 0 40px 90px -20px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.09) inset;
        transform: rotateY(-19deg) rotateX(5deg) rotateZ(1.5deg);
      }
      .phone-screen { width: 100%; height: 100%; border-radius: 27px; overflow: hidden; background: #000; }
      .window {
        width: 546px; flex: none;
        border-radius: 14px; overflow: hidden; background: #16161c;
        box-shadow: 0 40px 90px -20px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.09) inset;
        /* No translateX: the rotation alone already pushes the near edge right,
           and any nudge on top of it clipped the window against the card. */
        transform: rotateY(-16deg) rotateX(4deg);
      }
      .chrome {
        height: 40px; display: flex; align-items: center; gap: 8px; padding: 0 16px;
        background: #202027; border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      }
      .light { width: 11px; height: 11px; border-radius: 50%; background: rgba(255, 255, 255, 0.18); flex: none; }
      /* The address people will actually land on, which is a quieter way of
         saying "this runs in a browser" than any copy would be. */
      .url {
        margin-left: 12px; flex: 1; height: 24px; border-radius: 999px;
        background: rgba(255, 255, 255, 0.07); color: #8b8b96;
        font-size: 14px; display: flex; align-items: center; padding: 0 14px;
      }
      .window-screen { background: #000; }
      .stage img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top center; }
      .window-screen img { height: 341px; }

      /* The in-app banner's amber, at a size nobody has to look for. This is
         the whole mitigation once the card leaves the site. */
      .notice {
        position: absolute; left: 0; right: 0; bottom: 0; height: 76px;
        display: flex; align-items: center; justify-content: center;
        border-top: 1px solid rgba(245, 158, 11, 0.32);
        /* Opaque, not a tint: Wisp's and YakiHonne's orange glows reach this
           far down, and a translucent band let the warm background swallow the
           one line on the card that has to survive being skimmed. */
        background: linear-gradient(0deg, rgba(245, 158, 11, 0.14), rgba(245, 158, 11, 0.14)), #0b0b10;
        color: #fcd34d;
        font-size: 22px; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 500;
        z-index: 2;
      }
    </style>
  </head>
  <body>
    <div class="glow-client"></div>
    <div class="glow-sand"></div>

    <div class="stage">${device}</div>

    <div class="copy">
      ${lockup}
      <div class="row">
        <div class="tile">${glyph}</div>
        <h1>${escape(route.name)}</h1>
      </div>
      <div class="line">try it in your browser</div>
      <div class="meta">
        <span>${PLATFORM[route.platform] ?? route.platform}</span><span class="dot"></span>
        <span>No keys</span><span class="dot"></span>
        <span>No install</span>
      </div>
      ${route.badge ? `<div class="pill">${escape(route.badge)}</div>` : ''}
    </div>

    <div class="notice">${escape(notice)}</div>
  </body>
</html>
`;
}

// --- run --------------------------------------------------------------------

mkdirSync(outDir, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'sandstr-og-'));

const { server, port } = await serveDist();
const baseUrl = `http://127.0.0.1:${port}`;

const chrome = spawn(
  CHROME,
  [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--remote-debugging-port=0',
    `--user-data-dir=${join(work, 'profile')}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync',
    // The site reads `prefers-color-scheme` on first paint and the headless
    // profile has no stored sandstr-theme, so without this every card would
    // show the light build of a product whose own card is dark.
    '--force-dark-mode',
    '--enable-features=WebContentsForceDark',
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'], detached: true },
);

/**
 * Chrome prints the DevTools URL to stderr once the port is bound. Reading it
 * beats polling /json/version on a guessed port, and `--remote-debugging-port=0`
 * (a free port, chosen by Chrome) is what makes concurrent agent sessions safe.
 */
const wsUrl = await new Promise((resolve, reject) => {
  let buf = '';
  const timer = setTimeout(() => reject(new Error('Chrome never printed a DevTools URL')), 30000);
  chrome.stderr.on('data', (chunk) => {
    buf += chunk;
    const m = buf.match(/ws:\/\/[^\s]+/);
    if (m) {
      clearTimeout(timer);
      resolve(m[0]);
    }
  });
  chrome.on('exit', (code) => {
    clearTimeout(timer);
    reject(new Error(`Chrome exited early (${code})`));
  });
});

let written = 0;
let bytes = 0;
let cdp;

try {
  cdp = await CDP.attach(wsUrl);
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const page = new Page(cdp, sessionId);
  await page.send('Page.enable', {});
  await page.send('Runtime.enable', {});
  await page.send('Log.enable', {});
  await page.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: 'dark' }],
  });

  for (const route of routes) {
    const screen = await captureScreen(page, route, baseUrl);

    const pagePath = join(work, `${route.id}.html`);
    const png = fileURLToPath(new URL(`${route.id}.png`, outDir));
    writeFileSync(pagePath, card(route, screen), 'utf8');

    // The card itself at 1x: 2x would quadruple twelve already-large PNGs for
    // sharpness no feed renders at.
    await page.viewport({ width: WIDTH, height: HEIGHT, scale: 1 });
    await page.goto(pathToFileURL(pagePath).href);
    await page.until('document.fonts.status === "loaded"', { label: `${route.id}: card fonts` });
    await sleep(200);

    // The device must sit WHOLLY inside the card, above the notice band.
    // Measured, not reasoned about: a rotated element's on-screen box is its
    // CSS width scaled by perspective on the near edge, and the arithmetic I
    // did by hand said the browser window fitted while Coracle and Snort were
    // visibly losing their right-hand column. Anyone retuning the rotation or
    // the widths gets a number here instead of a card they have to eyeball.
    const box = await page.eval(`(() => {
      const el = document.querySelector('.phone, .window');
      const notice = document.querySelector('.notice');
      if (!el || !notice) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom,
               noticeTop: notice.getBoundingClientRect().top };
    })()`);
    if (!box) fail(`[${route.id}] the card rendered no device`);
    const over = [
      box.left < MARGIN && `${Math.round(MARGIN - box.left)}px off the left`,
      box.right > WIDTH - MARGIN && `${Math.round(box.right - (WIDTH - MARGIN))}px off the right`,
      box.top < MARGIN && `${Math.round(MARGIN - box.top)}px off the top`,
      box.bottom > box.noticeTop && `${Math.round(box.bottom - box.noticeTop)}px into the notice band`,
    ].filter(Boolean);
    if (over.length) {
      fail(`[${route.id}] the device does not fit the card: ${over.join(', ')}`);
    }

    writeFileSync(png, await page.shot());
    const size = statSync(png).size;
    written += 1;
    bytes += size;
    console.log(`og-client-cards: ${route.id}.png (${(size / 1024).toFixed(0)} kB)`);
  }
} finally {
  cdp?.close();
  try {
    // The group, not the pid: killing the binary we spawned leaves a dozen
    // helper processes behind.
    process.kill(-chrome.pid, 'SIGKILL');
  } catch {
    /* already gone */
  }
  server.close();
  rmSync(work, { recursive: true, force: true });
  rmSync(ssrDir, { recursive: true, force: true });
}

console.log(
  `og-client-cards: wrote ${written} card(s) to public/og/, ${(bytes / 1024 / 1024).toFixed(1)} MB total`,
);
