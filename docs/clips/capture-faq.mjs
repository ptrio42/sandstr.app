#!/usr/bin/env node
// Capture the four FAQ teaser loops (docs/clips/faq-teaser.md) by driving
// headless Chrome over CDP. No npm deps — Node 24 ships a global WebSocket.
//
//   node capture-faq.mjs              # all four loops
//   node capture-faq.mjs damus nostur # a subset
//
// Serves the PRODUCTION build from dist/ on a free port. Never point this at
// `npm run dev`: other agent sessions hold 5173 and the CPU contention alone
// made a previous run take 3x longer and time out waiting for a screen.
//
// Output: .work/faq/<loop>/frame-*.jpg + frames.json, then .work/faq/<loop>.mp4
// (raw — no captions, no card, no chrome; the cut is assembled separately).
//
// Frames come from Page.startScreencast, NOT a captureScreenshot loop: the loop
// shares the CDP socket with the driver and throttles everything to ~1 fps.
// Screencast emits nothing while the screen is static, so each frame's duration
// is measured from ARRIVAL time (metadata.timestamp is non-monotonic and
// produced phantom 7-second gaps last time).

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const DIST = join(ROOT, 'dist');
const WORK = join(HERE, '.work', 'faq');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// ---------------------------------------------------------------- the loops --
// Every query below is verified to rank its entry #1 in the shipped ranking,
// and every entry has a showMe. See docs/clips/faq-teaser.md.
const LOOPS = [
  {
    id: 'damus',
    path: '/c/damus',
    viewport: { w: 430, h: 775, dsf: 2 },
    faq: '[aria-label="Damus FAQ"]',
    query: 'lost my phone',
    entry: 'backup-keys',
    steps: 2,
  },
  {
    id: 'amethyst',
    path: '/c/amethyst',
    viewport: { w: 430, h: 775, dsf: 2 },
    faq: '[aria-label="Amethyst FAQ"]',
    query: 'nobody sees my notes',
    entry: 'manage-relays',
    steps: 2,
  },
  {
    id: 'primal',
    path: '/c/primal',
    // Frameless clients are `gated` below 640px and render no FAQ affordance at
    // all, so this one is a desktop shot and gets composed as a landscape card.
    viewport: { w: 1280, h: 720, dsf: 2 },
    faq: 'text:How do I',
    query: 'tip someone',
    entry: 'zap',
    steps: 1,
  },
  {
    id: 'nostur',
    path: '/c/nostur',
    viewport: { w: 430, h: 775, dsf: 2 },
    faq: '[aria-label="Nostur FAQ"]',
    query: 'nothing loads',
    entry: 'low-data',
    steps: 3,
  },
];

// -------------------------------------------------------------------- beats --
const T = {
  afterLoad: 900,
  afterFaqOpen: 500,
  perChar: 55,
  afterType: 800,
  readAnswer: 2400,
  afterShowMe: 300,
  holdStep: 1700,
  holdLastStep: 2500,
  tail: 700,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ------------------------------------------------------------ static server --
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.ico': 'image/x-icon', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json',
};

async function serveDist() {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error('dist/index.html missing — run `npm run build` first.');
  }
  const server = createServer(async (req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    const candidates = [join(DIST, url), join(DIST, url, 'index.html'), join(DIST, 'index.html')];
    for (const file of candidates) {
      if (!file.startsWith(DIST)) continue;
      try {
        const body = await readFile(file);
        res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
        res.end(body);
        return;
      } catch { /* next candidate — SPA fallback is the last one */ }
    }
    res.writeHead(404).end('not found');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { server, port: server.address().port };
}

// ------------------------------------------------------------- minimal CDP ---
class CDP {
  #ws; #id = 0; #pending = new Map(); #handlers = new Map();

  static async attach(browserWsUrl) {
    const cdp = new CDP();
    cdp.#ws = new WebSocket(browserWsUrl);
    await new Promise((res, rej) => {
      cdp.#ws.addEventListener('open', res, { once: true });
      cdp.#ws.addEventListener('error', rej, { once: true });
    });
    cdp.#ws.addEventListener('message', (ev) => cdp.#onMessage(JSON.parse(ev.data)));
    return cdp;
  }

  #onMessage(msg) {
    if (msg.id !== undefined) {
      const p = this.#pending.get(msg.id);
      if (!p) return;
      this.#pending.delete(msg.id);
      msg.error ? p.reject(new Error(`${msg.error.message} (${JSON.stringify(msg.error.data ?? '')})`)) : p.resolve(msg.result);
      return;
    }
    for (const h of this.#handlers.get(msg.method) ?? []) h(msg.params, msg.sessionId);
  }

  on(method, handler) {
    if (!this.#handlers.has(method)) this.#handlers.set(method, []);
    this.#handlers.get(method).push(handler);
  }

  off(method) { this.#handlers.delete(method); }

  send(method, params = {}, sessionId) {
    const id = ++this.#id;
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
      this.#ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }

  close() { this.#ws.close(); }
}

// ------------------------------------------------------------- page driver ---
class Page {
  constructor(cdp, sessionId) { this.cdp = cdp; this.sid = sessionId; }

  send(method, params) { return this.cdp.send(method, params, this.sid); }

  async eval(expression) {
    const { result, exceptionDetails } = await this.send('Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise: true,
    });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'eval failed');
    return result.value;
  }

  /** Poll an expression until it returns truthy. Returns the value. */
  async until(expression, { timeout = 15000, every = 100, label = expression } = {}) {
    const t0 = Date.now();
    for (;;) {
      const v = await this.eval(expression);
      if (v) return v;
      if (Date.now() - t0 > timeout) throw new Error(`timed out waiting for: ${label}`);
      await sleep(every);
    }
  }

  /**
   * Rect of the first VISIBLE match — the mobile compact bar and the desktop
   * meta row both live in the DOM at every width, only one of them laid out,
   * so a plain querySelector would happily hand back a 0x0 box.
   */
  async visibleRect(selector) {
    const js = selector.startsWith('text:')
      ? `[...document.querySelectorAll('button')].filter(b => b.textContent.includes(${JSON.stringify(selector.slice(5))}))`
      : `[...document.querySelectorAll(${JSON.stringify(selector)})]`;
    return this.eval(`(() => {
      const el = ${js}.find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height };
    })()`);
  }

  async waitVisible(selector, opts = {}) {
    const t0 = Date.now();
    for (;;) {
      const r = await this.visibleRect(selector);
      if (r) return r;
      if (Date.now() - t0 > (opts.timeout ?? 15000)) throw new Error(`no visible element: ${selector}`);
      await sleep(100);
    }
  }

  // A headless screenshot has no pointer, and a demo without one is unreadable.
  async installCursor() {
    await this.eval(`(() => {
      if (document.getElementById('__cap_cursor')) return true;
      const c = document.createElement('div');
      c.id = '__cap_cursor';
      c.style.cssText = [
        'position:fixed', 'left:0', 'top:0', 'width:22px', 'height:22px',
        'margin:-11px 0 0 -11px', 'border-radius:50%',
        'background:radial-gradient(circle at 35% 35%, #fff, #cbc3ff 55%, rgba(167,139,250,.25) 70%, rgba(167,139,250,0) 72%)',
        'box-shadow:0 0 0 2px rgba(17,17,22,.55), 0 6px 18px rgba(0,0,0,.45)',
        'pointer-events:none', 'z-index:2147483647', 'opacity:0',
        'transition:transform .32s cubic-bezier(.22,.61,.36,1), opacity .2s, width .12s, height .12s',
      ].join(';');
      document.body.appendChild(c);
      return true;
    })()`);
  }

  async moveCursor(x, y, { settle = 340 } = {}) {
    await this.eval(`(() => {
      const c = document.getElementById('__cap_cursor');
      if (c) { c.style.opacity = '1'; c.style.transform = 'translate(${x}px, ${y}px)'; }
      return true;
    })()`);
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, buttons: 0 });
    await sleep(settle);
  }

  async clickAt(x, y) {
    // A quick pinch of the dot reads as a press without faking a whole cursor set.
    await this.eval(`(() => { const c=document.getElementById('__cap_cursor'); if(c){c.style.width='15px';c.style.height='15px';} return true; })()`);
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1, buttons: 1 });
    await sleep(90);
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1, buttons: 0 });
    await this.eval(`(() => { const c=document.getElementById('__cap_cursor'); if(c){c.style.width='22px';c.style.height='22px';} return true; })()`);
  }

  async click(selector) {
    const r = await this.waitVisible(selector);
    await this.moveCursor(r.x, r.y);
    await this.clickAt(r.x, r.y);
    return r;
  }

  async typeText(text, perChar) {
    for (const ch of text) {
      await this.send('Input.insertText', { text: ch });
      await sleep(perChar);
    }
  }
}

// ------------------------------------------------------------- the recorder --
/** Width/height straight out of the JPEG's SOF marker — no decoder needed. */
function jpegSize(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return { w: 0, h: 0 };
}

/**
 * ONE screencast for the whole run, never stopped.
 *
 * Measured the hard way: headless flips a page to `visibilityState: 'hidden'`
 * once nothing consumes its frames, and neither `Page.bringToFront` nor
 * `Page.setWebLifecycleState({state:'active'})` brings it back — so the second
 * per-loop `startScreencast` returned a single frame and the loop came out
 * empty. Keeping one consumer attached across navigations keeps the page
 * visible; loops are sliced out of the pool by arrival time afterwards.
 */
async function startPool(cdp, page, poolDir) {
  await mkdir(poolDir, { recursive: true });
  const frames = [];
  const writes = [];
  let n = 0;
  cdp.on('Page.screencastFrame', (params, sid) => {
    if (sid !== page.sid) return;
    const at = Date.now();
    // ACK FIRST, disk second. Acking after the write puts every frame behind an
    // fs round-trip; the acks fall behind, Chrome stops sending, and a later
    // loop records 3 frames in 13 seconds. This was the whole "the page must be
    // hidden" red herring.
    cdp.send('Page.screencastFrameAck', { sessionId: params.sessionId }, page.sid).catch(() => {});
    const buf = Buffer.from(params.data, 'base64');
    const path = join(poolDir, `f-${String(++n).padStart(5, '0')}.jpg`);
    const { w, h } = jpegSize(buf);
    frames.push({ at, path, w, h });
    writes.push(writeFile(path, buf));
  });
  // maxWidth/maxHeight in DEVICE pixels: without them Chrome emits frames at the
  // CSS viewport size and a dsf-2 capture arrives at half resolution.
  await page.send('Page.startScreencast', {
    format: 'jpeg', quality: 92, everyNthFrame: 1, maxWidth: 2560, maxHeight: 2560,
  });
  return {
    frames,
    async stop() {
      await page.send('Page.stopScreencast').catch(() => {});
      cdp.off('Page.screencastFrame');
      await Promise.allSettled(writes);
    },
    /** Frames are written in the background; flush before slicing a loop out. */
    flush: () => Promise.allSettled(writes),
  };
}

/**
 * ffmpeg concat list for one loop's slice, with REAL durations (holds capped so
 * nothing sits dead). Frames are filtered to the loop's own pixel size: the
 * viewport changes between loops and a size change mid-list breaks concat.
 */
async function encodeRange(pool, t0, t1, dir, out, size) {
  await mkdir(dir, { recursive: true });
  const shot = pool.frames.filter((f) => f.at >= t0 && f.at <= t1 && f.w === size.w && f.h === size.h);
  if (shot.length === 0) {
    const inWindow = pool.frames.filter((f) => f.at >= t0 && f.at <= t1);
    const sizes = {};
    for (const f of pool.frames) sizes[`${f.w}x${f.h}`] = (sizes[`${f.w}x${f.h}`] ?? 0) + 1;
    throw new Error(
      `no frames for ${out}: wanted ${size.w}x${size.h}, window ${t1 - t0}ms held ` +
      `${inWindow.length} frames, pool ${pool.frames.length} (${JSON.stringify(sizes)})`,
    );
  }
  const lines = [];
  for (const [i, f] of shot.entries()) {
    const next = shot[i + 1]?.at ?? f.at + 400;
    const d = Math.min(Math.max((next - f.at) / 1000, 0.001), 2.0);
    lines.push(`file '${f.path}'`, `duration ${d.toFixed(3)}`);
  }
  lines.push(`file '${shot.at(-1).path}'`); // concat demuxer drops the last duration
  await writeFile(join(dir, 'concat.txt'), lines.join('\n'));
  await writeFile(join(dir, 'frames.json'), JSON.stringify(shot, null, 1));
  await run('ffmpeg', [
    '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', join(dir, 'concat.txt'),
    // CFR 30 out of variable-duration frames, same as build-teaser.sh expects.
    // (-r with -vsync vfr is contradictory and ffmpeg refuses the output.)
    '-r', '30', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out,
  ]);
  return shot;
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'inherit', 'inherit'] });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

// ----------------------------------------------------------------- one loop --
async function captureLoop(page, pool, loop, baseUrl) {
  page.deviceW = loop.viewport.w * loop.viewport.dsf;
  page.deviceH = loop.viewport.h * loop.viewport.dsf;
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: loop.viewport.w, height: loop.viewport.h,
    deviceScaleFactor: loop.viewport.dsf, mobile: false,
  });

  await page.send('Page.navigate', { url: baseUrl + loop.path });
  // 30s, not the 15s default: with another agent session's Chrome on the same
  // machine a cold client chunk genuinely took longer than 15s to settle once.
  await page.until(`document.readyState === 'complete'`, { timeout: 30000, label: 'document ready' });
  await page.waitVisible(loop.faq, { timeout: 20000 });
  await page.installCursor();
  await sleep(T.afterLoad);

  const dir = join(WORK, loop.id);
  await rm(dir, { recursive: true, force: true });
  const t0 = Date.now();
  // Phase marks, so the cut can speed up the typing without blurring the demo.
  const marks = {};

  // 1 — the question
  await page.click(loop.faq);
  await page.until(`!!document.querySelector('[role="dialog"] input')`, { label: 'FAQ panel' });
  await sleep(T.afterFaqOpen);
  const input = await page.waitVisible('[role="dialog"] input');
  await page.moveCursor(input.x, input.y);
  await page.clickAt(input.x, input.y);
  await page.typeText(loop.query, T.perChar);
  await page.until(`!!document.querySelector('[data-faq-entry="${loop.entry}"]')`, {
    label: `search hit for "${loop.query}"`,
  });
  // The whole premise: the pain phrase must land THIS entry at the top.
  const top = await page.eval(`document.querySelector('[data-faq-entry]')?.getAttribute('data-faq-entry')`);
  if (top !== loop.entry) throw new Error(`"${loop.query}" ranked ${top} first, expected ${loop.entry}`);
  await sleep(T.afterType);
  marks.question = Date.now() - t0;

  // 2 — the answer
  await page.click(`[data-faq-entry="${loop.entry}"] button`);
  await sleep(T.readAnswer);
  marks.answer = Date.now() - t0;

  // 3 — the simulator shows it
  // By text, not by position: the entry's header button is also "the last button
  // of its parent", so a positional selector collapses the answer instead.
  await page.click('text:Show me in the simulator');
  await sleep(T.afterShowMe);
  marks.demo = Date.now() - t0;

  for (let step = 1; step <= loop.steps; step++) {
    // A mini-tour needs ~1-1.5s to mount its screen, and until it does the
    // tooltip renders centred with NO spotlight — filming that ships the exact
    // failure mode the FAQ review spent itself hunting.
    await page.until(
      `(() => { const s = document.querySelector('.tour-spotlight'); if (!s) return false; const r = s.getBoundingClientRect(); return r.width > 8 && r.height > 8; })()`,
      { timeout: 12000, label: `spotlight for step ${step}` },
    );
    await sleep(step === loop.steps ? T.holdLastStep : T.holdStep);
    if (step < loop.steps) {
      const before = await page.eval(`JSON.stringify(document.querySelector('.tour-spotlight')?.getBoundingClientRect())`);
      await page.click('[aria-label="Next step"]');
      await page.until(
        `JSON.stringify(document.querySelector('.tour-spotlight')?.getBoundingClientRect()) !== ${JSON.stringify(before)}`,
        { timeout: 12000, label: `spotlight to move for step ${step + 1}` },
      );
    }
  }
  await sleep(T.tail);

  const t1 = Date.now();
  marks.end = t1 - t0;
  await sleep(250); // let the last frames of the hold land in the pool
  await pool.flush();
  const out = join(WORK, `${loop.id}.mp4`);
  const manifest = await encodeRange(pool, t0, t1, dir, out, { w: page.deviceW, h: page.deviceH });
  await writeFile(join(dir, 'marks.json'), JSON.stringify(marks, null, 1));

  const secs = ((manifest.at(-1).at - manifest[0].at) / 1000).toFixed(1);
  return { id: loop.id, frames: manifest.length, secs, out };
}

// ------------------------------------------------------------ one browser ----
/**
 * A FRESH Chrome per loop, and the screencast never stops inside one.
 *
 * Reusing a browser across loops looked obviously right and cost most of an
 * afternoon: after the first loop the stream dries up (measured: a 42 s window
 * with 0 frames while the pool held 386 from the loop before), and the renderer
 * throttles with it. `Page.bringToFront` makes it worse, not better — it flips
 * the very tab you are driving to `visibilityState: 'hidden'`. A process per
 * loop costs ~2 s and makes each capture hermetic, which is worth having anyway.
 */
async function withBrowser(debugPort, loop, fn) {
  const userDataDir = join(WORK, `.chrome-profile-${loop.id}`);
  await rm(userDataDir, { recursive: true, force: true });
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${userDataDir}`,
    // Screencast frames come out at the CSS viewport size; only a browser-level
    // scale factor makes them physical pixels (maxWidth/maxHeight cap, never upscale).
    '--force-device-scale-factor=2', '--high-dpi-support=1',
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    '--force-color-profile=srgb', '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding', '--window-size=1400,1000',
  ], { stdio: ['ignore', 'ignore', 'ignore'] });

  let wsUrl = null;
  for (let i = 0; i < 60 && !wsUrl; i++) {
    await sleep(250);
    try {
      const r = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      wsUrl = (await r.json()).webSocketDebuggerUrl;
    } catch { /* not up yet */ }
  }
  if (!wsUrl) { chrome.kill(); throw new Error('Chrome did not expose a DevTools endpoint'); }

  const cdp = await CDP.attach(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const existing = targetInfos.find((t) => t.type === 'page');
  const targetId = existing
    ? existing.targetId
    : (await cdp.send('Target.createTarget', { url: 'about:blank' })).targetId;
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const page = new Page(cdp, sessionId);
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  await page.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: 'dark' }],
  });
  // Deterministic start: no leftover tour/FAQ state, and the theme pinned rather
  // than inherited from whatever the host machine prefers.
  await page.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('sandstr-') || k.startsWith('nostr-tour-') || k.startsWith('nostrich-'))
        .forEach(k => localStorage.removeItem(k));
      localStorage.setItem('sandstr-theme', 'dark');
    } catch {}`,
  });

  const pool = await startPool(cdp, page, join(WORK, '.pool', loop.id));
  try {
    return await fn(cdp, page, pool);
  } finally {
    await pool.stop().catch(() => {});
    cdp.close();
    chrome.kill();
  }
}

// --------------------------------------------------------------------- main --
async function main() {
  const wanted = process.argv.slice(2);
  const loops = wanted.length ? LOOPS.filter((l) => wanted.includes(l.id)) : LOOPS;
  if (!loops.length) throw new Error(`no such loop: ${wanted.join(', ')}`);

  await mkdir(WORK, { recursive: true });
  const { server, port } = await serveDist();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`  · serving dist/ on ${baseUrl}`);

  const results = [];
  try {
    for (const [i, loop] of loops.entries()) {
      process.stdout.write(`  · ${loop.id}: "${loop.query}" `);
      const r = await withBrowser(port + 1 + i, loop, (cdp, page, pool) =>
        captureLoop(page, pool, loop, baseUrl),
      );
      results.push(r);
      console.log(`→ ${r.frames} frames, ${r.secs}s`);
    }
  } finally {
    server.close();
  }

  console.log('\n  raw loops (no captions, no card — the cut is assembled separately):');
  for (const r of results) console.log(`    ${r.out}  ${r.secs}s`);
}

main().catch((err) => {
  console.error(`\n  ✗ ${err.message}`);
  process.exit(1);
});
