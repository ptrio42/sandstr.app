#!/usr/bin/env node
// The capture harness every sandstr clip script drives Chrome through.
//
// Extracted verbatim from capture-faq.mjs (2026-08-20) when a second cut needed
// the same machinery. Nothing here is generic browser automation: every helper
// carries a measurement and a failure it exists to prevent, and those lessons
// cost hours each. Read the comment before changing a constant.
//
// The short version, all of it measured on Chrome 151:
//
//   - Frames are PULLED with Page.captureScreenshot on a paced loop, NOT pushed
//     by Page.startScreencast. The push API only emits when the compositor
//     produces a frame, and a client sitting still between scripted clicks
//     produces almost none (2 frames in 13.8s). See `startPool`.
//   - A frame's timestamp is when it ARRIVED here, never a browser timestamp.
//   - Waits poll INSIDE the page (`Page.until`), never over CDP, because the
//     driver and the recorder share one socket.
//   - A paint pump keeps the compositor committing so the rate stays even.
//   - One Chrome per capture. Reuse dries the stream up, and
//     Page.bringToFront flips the tab you are driving to hidden.
//
// No npm deps: Node >= 22 ships a global WebSocket (this repo runs 24).

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ------------------------------------------------------------ static server --
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.ico': 'image/x-icon', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json',
};

export async function serveDist(DIST) {
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
export class CDP {
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
export class Page {
  constructor(cdp, sessionId) { this.cdp = cdp; this.sid = sessionId; }

  send(method, params) { return this.cdp.send(method, params, this.sid); }

  async eval(expression) {
    const { result, exceptionDetails } = await this.send('Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise: true,
    });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'eval failed');
    return result.value;
  }

  /**
   * Wait for an expression to go truthy — polling INSIDE the page, not over CDP.
   *
   * The obvious version (evaluate every 100ms from here) shares one socket with
   * the screencast, and a few seconds of it reliably starves the stream: frames
   * stopped arriving mid-run while the driver carried on, so clips ended early
   * with the last action missing and nothing looked broken. One round trip with
   * `awaitPromise` costs the same whether the wait is 50ms or 15s.
   */
  async until(expression, { timeout = 15000, every = 100, label = expression } = {}) {
    const v = await this.eval(`new Promise((resolve) => {
      const started = Date.now();
      const tick = () => {
        let value = null;
        try { value = (${expression}); } catch { value = null; }
        if (value) return resolve(JSON.stringify({ ok: true, value }));
        if (Date.now() - started > ${timeout}) return resolve(JSON.stringify({ ok: false }));
        setTimeout(tick, ${every});
      };
      tick();
    })`);
    const res = JSON.parse(v);
    if (!res.ok) throw new Error(`timed out waiting for: ${label}`);
    return res.value;
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

  /** Same in-page wait as `until` — see the note there on why not to poll CDP. */
  async waitVisible(selector, opts = {}) {
    const js = selector.startsWith('text:')
      ? `[...document.querySelectorAll('button')].filter(b => b.textContent.includes(${JSON.stringify(selector.slice(5))}))`
      : `[...document.querySelectorAll(${JSON.stringify(selector)})]`;
    return this.until(
      `(() => {
        const el = ${js}.find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height };
      })()`,
      { timeout: opts.timeout ?? 15000, label: `no visible element: ${selector}` },
    );
  }

  /**
   * Keep the compositor committing frames, so screenshots stay evenly spaced.
   *
   * `Page.captureScreenshot` waits for a frame from the surface. On a client
   * screen that is sitting still nothing schedules one, and the wait goes long
   * and lumpy — measured on an idle /c/amethyst: p50 45 ms but a 446 ms max, and
   * in a real scripted run that tail opened 2.6 s holes with zero frames. A
   * 2x2 px layer nudged every animation frame flattens it: p50 61 ms, max 84 ms.
   *
   * Parked at -8px so it falls outside the captured viewport entirely — it is a
   * metronome for the compositor, not something the camera can see.
   *
   * A CSS animation, NOT a requestAnimationFrame loop writing `style.transform`.
   * The rAF version mutates an attribute 60 times a second inside document.body,
   * and this app watches for that: the tour overlay recomputes its spotlight on
   * every DOM mutation. Driving it from JS cost more than it bought — p50 rose
   * to 203 ms a shot with a 1948 ms tail. A composited keyframe animation
   * produces the same frames with no DOM writes and no JS on the main thread.
   */
  async installPaintPump() {
    await this.eval(`(() => {
      if (document.getElementById('__cap_pump')) return true;
      const s = document.createElement('style');
      s.textContent = '@keyframes __cap_pump_kf{from{transform:translateX(0)}to{transform:translateX(0.5px)}}'
        + '#__cap_pump{position:fixed;left:-8px;top:-8px;width:2px;height:2px;background:#000;opacity:0.01;'
        + 'pointer-events:none;will-change:transform;z-index:2147483647;'
        + 'animation:__cap_pump_kf .1s linear infinite alternate}';
      document.head.appendChild(s);
      const d = document.createElement('div');
      d.id = '__cap_pump';
      document.body.appendChild(d);
      return true;
    })()`);
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

  /**
   * Scroll a target into its scroll container before measuring it.
   *
   * `getBoundingClientRect()` is happily non-zero for an element scrolled out
   * of an `overflow:auto` parent, so "visible" was a lie: the FAQ entry with the
   * longest answer put "Show me" below the bottom sheet's clip box, and the
   * click went to whatever was painted at those coordinates instead. The tour
   * never started and the failure looked like a broken anchor.
   */
  async ensureInView(selector) {
    const js = selector.startsWith('text:')
      ? `[...document.querySelectorAll('button')].filter(b => b.textContent.includes(${JSON.stringify(selector.slice(5))}))`
      : `[...document.querySelectorAll(${JSON.stringify(selector)})]`;
    await this.eval(`(() => {
      const el = ${js}.find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
      if (el) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      return true;
    })()`);
    await sleep(220);
  }

  async click(selector) {
    await this.ensureInView(selector);
    const r = await this.waitVisible(selector);
    await this.moveCursor(r.x, r.y);
    // Re-measure right before pressing. The cursor move takes ~340ms, and an
    // accordion that is still expanding moves its own button in that window:
    // the FAQ entry with the longest answer had "Show me" slide out from under
    // the click, which landed on the header instead and silently collapsed it.
    const fresh = (await this.visibleRect(selector)) ?? r;
    if (Math.hypot(fresh.x - r.x, fresh.y - r.y) > 4) await this.moveCursor(fresh.x, fresh.y, { settle: 160 });
    await this.clickAt(fresh.x, fresh.y);
    return fresh;
  }

  async typeText(text, perChar) {
    for (const ch of text) {
      await this.send('Input.insertText', { text: ch });
      await sleep(perChar);
    }
  }

  async pressKey(key, code = key, vk = { ArrowRight: 39, Enter: 13, Escape: 27 }[key] ?? 0) {
    for (const type of ['rawKeyDown', 'keyUp']) {
      await this.send('Input.dispatchKeyEvent', {
        type, key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk,
        // Enter needs the text payload or the renderer treats it as a bare
        // keydown and the field never sees a submit.
        ...(key === 'Enter' && type === 'rawKeyDown' ? { text: '\r' } : {}),
      });
    }
  }

  /**
   * Hide the tour's own tooltip for the camera and keep the spotlight.
   *
   * The card carries "1 / 2", Prev / Next / Skip and a progress bar — product
   * chrome that, on a phone-sized card, takes 30-45% of the frame and shouts
   * louder than the client underneath. On video it reads as a demo of our
   * onboarding widget rather than the app. The words it carries move to the
   * caption band in the cut; the ring is what the shot is actually for.
   *
   * opacity rather than display:none on purpose — the overlay measures and
   * positions the tooltip, and removing it from layout moves the spotlight.
   */
  /**
   * Hide the HOST's FAQ panel for the camera, from the demo onwards.
   *
   * Once "Show me in the simulator" has been pressed the panel is no longer part
   * of the walkthrough — but ClientView deliberately slides it back when a mini
   * tour ends, and a tour can end whenever it likes: mid-hold, after the
   * harness's Escape loop has already confirmed a closed panel, at the exact
   * frame a phase boundary lands on. Chasing it with marks and trims cost an
   * afternoon and still left a 1.4s flash of FAQ across the client.
   *
   * Same justification as `hideTourChrome`: our own chrome, hidden so the shot is
   * of the client. Applied only after the demo starts, so the press itself — the
   * beat that shows WHERE the demo came from — still has the panel in frame.
   */
  async hideHostPanel() {
    await this.eval(`(() => {
      if (document.getElementById('__cap_hide_panel')) return true;
      const s = document.createElement('style');
      s.id = '__cap_hide_panel';
      s.textContent = '[data-sandstr-modal]{opacity:0 !important;pointer-events:none !important;}';
      document.head.appendChild(s);
      return true;
    })()`);
  }

  async hideTourChrome() {
    await this.eval(`(() => {
      if (document.getElementById('__cap_hide_tour')) return true;
      const s = document.createElement('style');
      s.id = '__cap_hide_tour';
      s.textContent = '.tour-tooltip{opacity:0 !important;pointer-events:none !important;}';
      document.head.appendChild(s);
      return true;
    })()`);
  }
}

// ------------------------------------------------------------- the recorder --
/** Width/height straight out of the JPEG's SOF marker — no decoder needed. */
export function jpegSize(buf) {
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
 * ONE frame pool for the whole run, fed by a `Page.captureScreenshot` TIMER.
 *
 * This used to be `Page.startScreencast`, and that stopped working: Chrome 151
 * only emits a screencast frame when the compositor actually produces one, and
 * a client sitting still between scripted clicks produces almost none. Measured
 * on 2026-08-14, same machine, same build:
 *
 *   page driven by the script, screencast   →   2 frames in 13.8 s
 *   same page with a 30 fps spinner forced  → 134 frames in  6.0 s
 *   captureScreenshot on a 100 ms timer     →  ~10.8 fps, median 87 ms, p90 93 ms
 *
 * The second row is why the older loops recorded fine: a running mini-tour
 * repaints its spotlight continuously, so the stream had something to send. The
 * scripted Hidden Words shot has no tour, and it kept shipping 10-31 frames.
 *
 * Pulling frames also fixes the driver, which is the non-obvious half. With
 * nothing consuming its output the renderer throttles the page's own timers, so
 * `until()` — which polls INSIDE the page — crawled: a single `click('Login')`
 * took 9.1 s and one walk to Hidden Words burned 65 s of wall clock. Asking for
 * a screenshot every 100 ms keeps the renderer producing, and the same walk
 * finishes in a fraction of that.
 *
 * The old warning that a screenshot loop "throttles everything to ~1 fps" was
 * true of the version that ALSO polled the DOM over CDP on the same socket.
 * That polling is long gone (see `until`), and one in-flight screenshot at a
 * time leaves the driver's occasional round trip plenty of room.
 */
export async function startPool(cdp, page, poolDir) {
  // Clear it: the pool is numbered from 1 each run, so a short run leaves the
  // previous run's tail behind and "834 files on disk" stops meaning anything
  // when you are trying to work out why a clip came out empty.
  await rm(poolDir, { recursive: true, force: true });
  await mkdir(poolDir, { recursive: true });
  const frames = [];
  const writes = [];
  const lat = [];
  let n = 0;
  let stopped = false;

  const shoot = async () => {
    const t = Date.now();
    try {
      // NO `clip` unless the frame would be oversized, because `clip.scale`
      // MULTIPLIES the emulated device scale factor rather than replacing it.
      // Asking for scale 2 on a dsf-2 phone viewport returned 1720x3100 — 5.3 MP
      // a frame, which dropped the rate to 7 fps and was most of why the first
      // timer build still only managed 1.4 fps. Measured 2026-08-14 at 430x775:
      //
      //   no clip       20.2 fps, median 49 ms   860x1550   <- what we want
      //   clip scale=1  16.2 fps, median 64 ms   860x1550
      //   clip scale=2   7.0 fps, median 139 ms  1720x3100
      //
      // The emulation override already delivers device pixels, so the plain
      // call is both the fastest path and the correct size.
      const vw = page.viewportW ?? 430;
      const vh = page.viewportH ?? 775;
      const dsf = page.dsf ?? 2;
      // Cap the long side at 1600 device px: a desktop viewport is 2560x2000 =
      // 5 MP, and at that size the per-frame cost dominates. 1600 still
      // outresolves the 860-wide card the frame lands in.
      const natural = Math.max(vw, vh) * dsf;
      // RACED, never bare. A screenshot request can be left hanging forever —
      // most reliably on about:blank before the first navigation, where nothing
      // ever produces the frame it waits for. Unraced, that single pending
      // promise parks the pump on its first call: the pool stays empty, the run
      // prints nothing, and `stop()` then waits in `finally` on a loop that can
      // never come back. Three runs "hung" this way before it was this.
      const data = await Promise.race([
        page.send('Page.captureScreenshot', {
          format: 'jpeg', quality: 92, captureBeyondViewport: false,
          ...(natural > 1600
            ? { clip: { x: 0, y: 0, width: vw, height: vh, scale: 1600 / natural } }
            : {}),
        }).then((r) => r?.data ?? null),
        sleep(4000).then(() => null),
      ]);
      if (stopped || !data) return;
      const at = Date.now();
      const buf = Buffer.from(data, 'base64');
      const path = join(poolDir, `f-${String(++n).padStart(5, '0')}.jpg`);
      const { w, h } = jpegSize(buf);
      frames.push({ at, path, w, h });
      writes.push(writeFile(path, buf));
    } catch { /* navigation in flight — the next pass picks it back up */ }
    lat.push(Date.now() - t);
  };

  /**
   * A CONTINUOUS loop, not setInterval — but with a floor.
   *
   * setInterval plus an in-flight guard quantises every capture up to a multiple
   * of the period: at a 66 ms tick, a shot that takes 140 ms misses two ticks and
   * lands 198 ms after the last one. That is exactly what the first timer build
   * measured — a p50 inter-frame gap of 198 ms, three ticks to the millisecond,
   * while the capture itself was nowhere near that slow. Chaining the next shot
   * off the previous one's completion spends the real latency and nothing more.
   *
   * The floor is not optional. The pool starts before the first navigation, and
   * on about:blank every capture fails instantly — an unpaced loop then fires
   * ~125 CDP calls a second on the socket the driver is trying to navigate with,
   * and the run hangs with an empty pool. FLOOR_MS caps the rate at ~18 fps,
   * which is above anything the renderer delivers anyway.
   */
  const FLOOR_MS = 55;
  const pump = (async () => {
    while (!stopped) {
      const started = Date.now();
      await shoot();
      const spent = Date.now() - started;
      if (spent < FLOOR_MS) await sleep(FLOOR_MS - spent);
    }
  })();

  return {
    frames,
    /** Capture rate, so a thin clip is visible in the run output, not days later. */
    stats() {
      if (!lat.length) return '0 shots';
      const s = [...lat].sort((a, b) => a - b);
      const at = (p) => s[Math.min(s.length - 1, Math.floor(s.length * p))];
      return `shot p50 ${at(0.5)}ms p90 ${at(0.9)}ms max ${s.at(-1)}ms`;
    },
    async stop() {
      stopped = true;
      // Bounded. `stop()` runs in withBrowser's finally, so waiting on the pump
      // unconditionally turns any stuck capture into a hung process that never
      // reports the error that actually killed the run. The pump only touches
      // `frames`/`writes`, both already snapshotted by the time we get here, so
      // walking away from a late one costs nothing.
      await Promise.race([pump.catch(() => {}), sleep(5000)]);
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
export async function encodeRange(pool, t0, t1, dir, out) {
  await mkdir(dir, { recursive: true });
  // Keep the window's DOMINANT frame size rather than a size computed up front:
  // Chrome scales frames down to the screencast cap, and the first frame after a
  // viewport change still carries the old geometry. A size change mid-list is
  // what the concat demuxer refuses, so one size has to win — the common one.
  const inWindow = pool.frames.filter((f) => f.at >= t0 && f.at <= t1);
  const counts = new Map();
  for (const f of inWindow) {
    const k = `${f.w}x${f.h}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const [best] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const shot = best ? inWindow.filter((f) => `${f.w}x${f.h}` === best[0]) : [];
  if (shot.length === 0) {
    throw new Error(
      `no frames for ${out}: window ${t1 - t0}ms held ${inWindow.length} frames, ` +
      `pool ${pool.frames.length}`,
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

export function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'inherit', 'inherit'] });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
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
export async function withBrowser({ id, debugPort, workDir, chrome: CHROME, windowSize = '1400,1000' }, fn) {
  const userDataDir = join(workDir, `.chrome-profile-${id}`);
  await rm(userDataDir, { recursive: true, force: true });
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${userDataDir}`,
    // Screencast frames come out at the CSS viewport size; only a browser-level
    // scale factor makes them physical pixels (maxWidth/maxHeight cap, never upscale).
    '--force-device-scale-factor=2', '--high-dpi-support=1',
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    '--force-color-profile=srgb', '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding', `--window-size=${windowSize}`,
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

  const pool = await startPool(cdp, page, join(workDir, '.pool', id));
  try {
    const result = await fn(cdp, page, pool);
    return result && typeof result === 'object' ? { ...result, rate: pool.stats() } : result;
  } finally {
    await pool.stop().catch(() => {});
    cdp.close();
    chrome.kill();
  }
}
