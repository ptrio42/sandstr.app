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
// Frames come from a Page.captureScreenshot TIMER plus a paint pump that keeps
// the compositor busy — see `startPool` and `installPaintPump` for the numbers
// behind both. This replaced Page.startScreencast, which stopped delivering on
// Chrome 151 for anything that is not continuously animating. Each frame's
// duration is measured from ARRIVAL time, never from a browser timestamp.

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
const PHONE = { w: 430, h: 775, dsf: 2 };
// Frameless clients are `gated` below 640px and render no FAQ affordance at all,
// so a web client has to be shot at desktop size and framed differently.
// 1000px tall, not 720: Coracle's mute rows sit ~930px down Content Settings,
// and the tour's scroll-into-view does not reach them inside that screen's own
// scroll container (open engine bug, filed with the anchor sweep). A desktop
// window this tall is ordinary, and it puts the target on screen honestly
// rather than filming a ring the viewer would never see.
const DESK = { w: 1280, h: 1000, dsf: 2 };

const LOOPS = [
  {
    id: 'damus-shaka',
    path: '/c/damus',
    viewport: PHONE,
    faq: '[aria-label="Damus FAQ"]',
    query: 'no heart',
    entry: 'shaka',
    steps: 1,
  },
  {
    id: 'amethyst',
    path: '/c/amethyst',
    viewport: PHONE,
    faq: '[aria-label="Amethyst FAQ"]',
    query: 'nobody sees my notes',
    entry: 'manage-relays',
    steps: 2,
  },
  {
    id: 'wisp',
    path: '/c/wisp',
    viewport: PHONE,
    faq: '[aria-label="Wisp FAQ"]',
    query: 'cancel my post',
    entry: 'post-note',
    steps: 2,
  },
  {
    id: 'coracle',
    path: '/c/coracle',
    viewport: DESK,
    faq: 'text:How do I',
    query: 'block someone',
    entry: 'mute',
    steps: 1,
  },
  {
    id: 'nostur',
    path: '/c/nostur',
    viewport: PHONE,
    faq: '[aria-label="Nostur FAQ"]',
    query: 'nothing loads',
    entry: 'low-data',
    steps: 3,
  },
  {
    id: 'damus-npub',
    path: '/c/damus',
    viewport: PHONE,
    faq: '[aria-label="Damus FAQ"]',
    query: 'share my profile',
    entry: 'copy-npub',
    steps: 1,
  },
  {
    // The four below answer the questions people are asking in live threads
    // right now (zaps 17% and keys 14% of #asknostr, measured 2026-08-11),
    // and they exist as clips because a reply needs an asset, not a teaser.
    id: 'damus-keys',
    path: '/c/damus',
    viewport: PHONE,
    faq: '[aria-label="Damus FAQ"]',
    query: 'lost my phone',
    entry: 'backup-keys',
    steps: 2,
  },
  {
    id: 'damus-zap',
    path: '/c/damus',
    viewport: PHONE,
    faq: '[aria-label="Damus FAQ"]',
    query: 'tip someone',
    entry: 'zap',
    steps: 1,
  },
  {
    id: 'amethyst-keys',
    path: '/c/amethyst',
    viewport: PHONE,
    faq: '[aria-label="Amethyst FAQ"]',
    query: 'lost my phone',
    entry: 'backup-keys',
    steps: 1,
  },
  {
    id: 'amethyst-zap',
    path: '/c/amethyst',
    viewport: PHONE,
    faq: '[aria-label="Amethyst FAQ"]',
    query: 'tip someone',
    entry: 'zap',
    steps: 1,
  },
  {
    // "Read one relay" — four ring steps because the answer names four screens
    // and the first one is a prerequisite: the relay has to be on your list
    // before the filter can list it. `topical relays` is the query because that
    // is what people call this; the term is nowhere in Damus itself.
    id: 'damus-relay-feed',
    path: '/c/damus',
    viewport: PHONE,
    faq: '[aria-label="Damus FAQ"]',
    query: 'topical relays',
    entry: 'relay-feed',
    // TWO rings, not four. The rings show WHERE the address goes; the tail below
    // then adds the relay for real and narrows the feed to it. Ringing the funnel
    // and a toggle as steps 3-4 filmed the right controls with the wrong relay:
    // nothing was ever added, and the switch that went off belonged to
    // relay.damus.io rather than to the address the clip had just pointed at.
    steps: 2,
    afterTour: [
      { click: '[data-tour="damus-add-relay-field"] input' }, { sleep: 400 },
      // NOT one of the seeded twelve — `addRelay` refuses duplicates, and a
      // silently-rejected add would film a relay that was already there.
      { type: 'wss://relay.nostr.wine' }, { sleep: 500 },
      { key: 'Enter' }, { sleep: 1900 },          // the row lands in My Relays
      // Back out of Relays first. Confirming the sheet pops it by itself, but the
      // Relays screen replaces the bottom edge with its own chrome — there is no
      // tab bar to aim at until we leave it.
      { click: '[data-tour="damus-relays"] button' }, { sleep: 1300 },
      // The tab bar labels its buttons with the tab id, not a display name.
      { click: '[aria-label="search"]' }, { sleep: 1500 },
      { click: '[data-tour="damus-search-filter"]' }, { sleep: 1500 },
      // Everything off except the one just added — this is the beat the clip is
      // for, and the only state in which "read one relay" is true on screen.
      { toggleOthers: { container: '[data-tour="damus-relay-filter"]', keep: 'wss://relay.nostr.wine', gap: 150 } },
      // End ON the relay we added, switch still on, everything above it dark.
      { reveal: { container: '[data-tour="damus-relay-filter"]', text: 'wss://relay.nostr.wine' } },
      { sleep: 2800 },
    ],
    // Filmed or it did not happen: the added relay has to be on screen at the end.
    expect: ['wss://relay.nostr.wine'],
  },
  {
    // The keyword-mute clip, and the one loop that keeps filming after the
    // mini-tour ends: the ring lands on the field, then the words get typed
    // into it. It goes through the FAQ like every other loop — search, answer,
    // "Show me in the simulator" — because that flow IS the product; a scripted
    // walk through the same screens shows the app but not what sandstr adds.
    id: 'amethyst-mute',
    path: '/c/amethyst',
    viewport: PHONE,
    faq: '[aria-label="Amethyst FAQ"]',
    query: 'too much noise',
    entry: 'mute',
    // Four ring steps: drawer → Settings row → Hidden Words row → the field.
    steps: 4,
    typeInSim: {
      selector: '[data-tour="amethyst-hidden-words"] input',
      words: ['bip110', 'coldcard'],
    },
  },
];

// Client switches used as interstitials between loops. Captured at the phone
// viewport, where the switcher is a bottom sheet of client tiles — the one shot
// that says "one tab, many apps" without a word of caption.
const SWITCHES = [
  // Tiles carry their client name as TEXT, not as an aria-label — the rail's
  // buttons are the ones with labels, and the rail is not rendered at this width.
  { id: 'sw-damus-nostur', from: '/c/damus', to: 'text:Nostur', wait: '[aria-label="Nostur FAQ"]' },
  { id: 'sw-nostur-wisp', from: '/c/nostur', to: 'text:Wisp', wait: '[aria-label="Wisp FAQ"]' },
  { id: 'sw-amethyst-damus', from: '/c/amethyst', to: 'text:Damus', wait: '[aria-label="Damus FAQ"]' },
];

// Scripted shots: no FAQ mini-tour, just a list of actions — for anything that
// cannot be reached through a mini-tour at all.
//
// EMPTY on purpose. This existed for one shot (amethyst-mute) because typing
// while a tour was running killed Page.startScreencast: the overlay recomputes
// its spotlight on every DOM mutation, typing mutates continuously, and the
// stream died mid-word. The recorder now PULLS frames instead of waiting to be
// pushed them (see `startPool`), so tour churn no longer costs frames — and a
// scripted walk through the same screens films the client without filming the
// thing sandstr adds to it. That loop went back through the FAQ where it
// belongs. Keep the mechanism; reach for it only when there is no mini-tour.
const SCRIPTS = [];

// Guided-tour teasers: land on ?tour=1 and let the tour drive. The tooltip is
// NOT hidden here — in a "take the tour" post the card IS the thing being
// advertised, the opposite of the FAQ clips where it was our chrome sitting on
// top of somebody's app.
const TOURS = [
  { id: 'tour-wisp', path: '/c/wisp?tour=1', steps: 5 },
];

// -------------------------------------------------------------------- beats --
const T = {
  afterLoad: 900,
  afterFaqOpen: 500,
  // 110ms/char, not 55: the cut plays the typing at 1.0x, and 55ms/char reads as
  // a machine even before any speed-up. The panel-opening half of the beat is
  // sped up instead — see the `typing` mark.
  perChar: 110,
  afterType: 800,
  // 4s, nie 2.4: to jest moment, w którym widz CZYTA odpowiedź, a klip ma
  // wyglądać jak człowiek, nie jak makro. Montaż i tak tę fazę skraca.
  readAnswer: 4000,
  // The pointer sits on "Show me in the simulator" for this long BEFORE pressing
  // it, and the frame holds this long after. 300ms of "after" and nothing at all
  // of "before" was the whole reason the demo looked like it started by itself.
  beforeShowMe: 1100,
  afterShowMe: 1100,
  holdStep: 1700,
  holdLastStep: 2500,
  tail: 700,
  // switch interstitial
  swSettle: 700,
  swHold: 1300,
  // tour teaser
  tourFirst: 2600,   // the welcome card carries the most text
  tourStep: 2200,
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
async function startPool(cdp, page, poolDir) {
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
async function encodeRange(pool, t0, t1, dir, out) {
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

/**
 * The scripted-step runner, shared by SCRIPTS and by a loop's `afterTour` tail.
 *
 * Step kinds: `{sleep}` `{key}` `{type}` `{click}` and `{toggleOthers}`.
 *
 * `toggleOthers: { container, keep }` clicks every `[role="switch"]` inside
 * `container` whose row does NOT contain the `keep` text, one at a time with the
 * cursor travelling to each. It exists because "read one relay" is only true on
 * screen once the others are off, and doing that with a list of nth-clicks would
 * hard-code a relay count that the previous step just changed by adding one.
 */
async function runSteps(page, steps, onStep) {
  for (const step of steps) {
    onStep?.(Date.now());
    if (step.sleep) await sleep(step.sleep);
    else if (step.key) await page.pressKey(step.key);
    else if (step.type) await page.typeText(step.type, T.perChar);
    else if (step.click) await page.click(step.click);
    else if (step.reveal) {
      // Scroll the row carrying this text into view and park the pointer beside
      // it. The assertion at the end of a loop reads `innerText`, which is happy
      // with a row scrolled out of the sheet — the added relay ended up below the
      // fold on the final hold and the clip closed on somebody else's switch.
      const box = await page.eval(`(() => {
        const row = [...document.querySelectorAll(${JSON.stringify(`${step.reveal.container} [role="switch"]`)})]
          .map(sw => sw.closest('div'))
          .find(r => r && r.textContent.includes(${JSON.stringify(step.reveal.text)}));
        if (!row) return null;
        row.scrollIntoView({ block: 'center' });
        const r = row.getBoundingClientRect();
        return JSON.stringify({ x: r.x + r.width - 30, y: r.y + r.height / 2 });
      })()`);
      if (!box) throw new Error(`reveal found no row for: ${step.reveal.text}`);
      await sleep(320);
      const { x, y } = JSON.parse(box);
      await page.moveCursor(x, y, { settle: 380 });
    }
    else if (step.toggleOthers) {
      const { container, keep } = step.toggleOthers;
      const n = await page.eval(
        `document.querySelectorAll(${JSON.stringify(`${container} [role="switch"]`)}).length`,
      );
      for (let i = 0; i < n; i++) {
        // Re-resolve every pass: the list scrolls under the pointer as rows are
        // brought into view, so an index captured up front goes stale.
        const box = await page.eval(`(() => {
          const rows = [...document.querySelectorAll(${JSON.stringify(`${container} [role="switch"]`)})];
          const sw = rows[${i}];
          if (!sw) return null;
          const row = sw.closest('div');
          if (row && row.textContent.includes(${JSON.stringify(keep)})) return 'skip';
          if (sw.getAttribute('aria-checked') === 'false') return 'skip';
          sw.scrollIntoView({ block: 'nearest' });
          const r = sw.getBoundingClientRect();
          return JSON.stringify({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
        })()`);
        if (!box || box === 'skip') continue;
        const { x, y } = JSON.parse(box);
        await page.moveCursor(x, y, { settle: 200 });
        await page.clickAt(x, y);
        await sleep(step.toggleOthers.gap ?? 220);
      }
    }
  }
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
  page.viewportW = loop.viewport.w;
  page.viewportH = loop.viewport.h;
  page.dsf = loop.viewport.dsf;
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: loop.viewport.w, height: loop.viewport.h,
    deviceScaleFactor: loop.viewport.dsf, mobile: false,
  });

  await page.send('Page.navigate', { url: baseUrl + loop.path });
  // 30s, not the 15s default: with another agent session's Chrome on the same
  // machine a cold client chunk genuinely took longer than 15s to settle once.
  await page.until(`document.readyState === 'complete'`, { timeout: 30000, label: 'document ready' });
  await page.waitVisible(loop.faq, { timeout: 20000 });
  await page.hideTourChrome();
  await page.installPaintPump();
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
  marks.typing = Date.now() - t0;
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
  //
  // Driven by hand rather than through `page.click`, because this is the beat
  // the whole clip turns on and it needs to be SEEN. Left inside the compressed
  // "read the answer" phase, the pointer arrived and the button fired inside a
  // couple of frames at 2.4x: the drawer just flew open with nothing on screen
  // explaining why. So: park the pointer on the button, hold while the viewer
  // reads it, press, hold again — and mark the moment, so the cut can play this
  // stretch at something near real speed (see the `showMe` split).
  //
  // By text, not by position: the entry's header button is also "the last button
  // of its parent", so a positional selector collapses the answer instead.
  const SHOW_ME = 'text:Show me in the simulator';
  await page.ensureInView(SHOW_ME);
  const smRect = await page.waitVisible(SHOW_ME);
  await page.moveCursor(smRect.x, smRect.y);
  marks.showMe = Date.now() - t0;
  await sleep(T.beforeShowMe);
  // Re-measure: the answer may still be expanding under the pointer.
  const smFresh = (await page.visibleRect(SHOW_ME)) ?? smRect;
  if (Math.hypot(smFresh.x - smRect.x, smFresh.y - smRect.y) > 4) {
    await page.moveCursor(smFresh.x, smFresh.y, { settle: 160 });
  }
  await page.clickAt(smFresh.x, smFresh.y);
  await sleep(T.afterShowMe);
  marks.demo = Date.now() - t0;

  for (let step = 1; step <= loop.steps; step++) {
    // A mini-tour needs ~1-1.5s to mount its screen, and until it does the
    // tooltip renders centred with NO spotlight — filming that ships the exact
    // failure mode the FAQ review spent itself hunting. (The tooltip is hidden
    // for the camera, so this wait is also the only proof the step landed.)
    let rect;
    try {
      rect = await page.until(
      `(() => { const s = document.querySelector('.tour-spotlight'); if (!s) return null; const r = s.getBoundingClientRect();
        return (r.width > 8 && r.height > 8) ? JSON.stringify({x: r.x, y: r.y, w: r.width, h: r.height}) : null; })()`,
        { timeout: 12000, label: `spotlight for step ${step}` },
      );
    } catch (err) {
      const state = await page.eval(`JSON.stringify({
        tourActive: !!document.querySelector('.tour-overlay'),
        step: document.querySelector('.tour-tooltip__title')?.textContent ?? null,
        anchors: [...document.querySelectorAll('[data-tour]')].map(e => e.getAttribute('data-tour')).slice(0, 8),
        url: location.pathname + location.search,
        panelOpen: !!document.querySelector('[role="dialog"][aria-modal="true"]'),
        showMeVisible: [...document.querySelectorAll('button')].some(b => /Show me/.test(b.textContent) && b.getBoundingClientRect().width > 0),
        expanded: [...document.querySelectorAll('[data-faq-entry]')].map(e => e.getAttribute('data-faq-entry')).slice(0, 3),
        spotlight: (() => { const s = document.querySelector('.tour-spotlight'); if (!s) return null;
          const r = s.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })(),
      })`);
      throw new Error(`${err.message}\n     state: ${state}`);
    }
    // Park the pointer just OUTSIDE the ring's bottom-right, not on its centre.
    // Without the tooltip nothing else in frame says "look here", but a 22px dot
    // dead-centre on a 40px zap icon hides the very thing the caption names.
    const r = JSON.parse(rect);
    const cx = Math.min(r.x + r.w + 16, page.viewportW - 14);
    const cy = Math.min(r.y + r.h + 16, page.viewportH - 14);
    await page.moveCursor(cx, cy, { settle: 420 });
    await sleep(step === loop.steps ? T.holdLastStep : T.holdStep);
    if (step < loop.steps) {
      const before = await page.eval(`JSON.stringify(document.querySelector('.tour-spotlight')?.getBoundingClientRect())`);
      // Keyboard, not the Next button: that button is inside the tooltip we just
      // hid, and clicking an invisible control by coordinates is a coin flip.
      await page.pressKey('ArrowRight');
      await page.until(
        `JSON.stringify(document.querySelector('.tour-spotlight')?.getBoundingClientRect()) !== ${JSON.stringify(before)}`,
        { timeout: 12000, label: `spotlight to move for step ${step + 1}` },
      );
    }
  }
  if (loop.typeInSim) {
    // END THE TOUR FIRST. Its overlay watches document.body for mutations and
    // recomputes the spotlight's clip-path on each one; typing mutates the DOM
    // continuously, and the resulting churn stalls the screencast a few seconds
    // in — the words landed in the app while the video quietly stopped, so the
    // clip shipped showing one word of two. The ring has already done its job
    // by this point: it pointed at the field.
    // Fixed pauses, no waiting predicates. Both kinds of wait — polling over CDP
    // and polling inside the page — have stalled this phase: the tab stops
    // painting a few seconds in, the screencast dies with it, and an in-page
    // wait then never resolves because the page's own timers are frozen too.
    // Two Escapes on a timer are dumber and they work: the first ends the tour,
    // the second closes the FAQ panel that ClientView deliberately reopens when
    // a tour ends (good product behaviour, wrong for this shot — the panel lands
    // over the simulator and eats the typing).
    //
    // `dismiss` marks the start of that clean-up so the CUT CAN DROP IT. On
    // screen it reads as the simulator vanishing behind the FAQ panel for a
    // second and coming back, which is our scaffolding showing through, not
    // anything the app does to a viewer who never opened a mini-tour. Frames
    // between `dismiss` and `typing2` are captured and simply never rendered.
    marks.dismiss = Date.now() - t0;
    await page.pressKey('Escape');
    await sleep(1200);
    await page.pressKey('Escape');
    await sleep(1200);
    const box = await page.waitVisible(loop.typeInSim.selector);
    await page.moveCursor(box.x, box.y);
    await page.clickAt(box.x, box.y);
    marks.typing2 = Date.now() - t0;
    for (const word of loop.typeInSim.words) {
      await page.typeText(word, T.perChar);
      await sleep(500);
      await page.pressKey('Enter');
      // ONE check, not a poll. Polling the DOM every 100ms over the same CDP
      // socket starves the screencast: the words landed in the app but the
      // frames stopped arriving mid-typing, so the clip shipped showing only
      // the first of the two. Sleep long enough for the row to render, then ask
      // once — and fail loudly if it is not there.
      await sleep(1600);
    }
  }
  if (loop.typeInSim) {
    // One check, after the filming: every word must be on the list, or the clip
    // is a lie. Cheap here — nothing is being recorded any more.
    const missing = await page.eval(
      `${JSON.stringify(loop.typeInSim.words)}.filter(w =>
         ![...document.querySelectorAll('[data-tour="amethyst-hidden-list"] div')]
           .some(d => d.textContent.trim() === w))`,
    );
    if (missing.length) throw new Error(`typed but never landed: ${missing.join(', ')}`);
  }

  if (loop.afterTour) {
    // The mini-tour points; the tail DOES. A ring on "Add relay" followed by a
    // teleport to a filter that then narrows a DIFFERENT relay is two halves
    // with no thread between them — the viewer never sees the relay arrive, and
    // the one being switched off is not the one that was just added. So the tail
    // types the address for real, watches the row appear, walks to the tab, opens
    // the sheet and turns the others off.
    //
    // End the tour first, same as typeInSim: its overlay recomputes the spotlight
    // on every DOM mutation, and the tail mutates continuously. Second Escape
    // closes the FAQ panel ClientView reopens when a tour ends.
    marks.dismiss = Date.now() - t0;
    await page.pressKey('Escape');
    await sleep(1200);
    await page.pressKey('Escape');
    await sleep(1200);
    marks.typing2 = Date.now() - t0;
    await runSteps(page, loop.afterTour);
  }
  if (loop.expect) {
    const missing = await page.eval(
      `${JSON.stringify(loop.expect)}.filter(t => !document.body.innerText.includes(t))`,
    );
    if (missing.length) throw new Error(`never appeared on screen: ${missing.join(', ')}`);
  }
  await sleep(T.tail);

  const t1 = Date.now();
  marks.end = t1 - t0;
  await sleep(250); // let the last frames of the hold land in the pool
  await pool.flush();
  const out = join(WORK, `${loop.id}.mp4`);
  const manifest = await encodeRange(pool, t0, t1, dir, out);
  await writeFile(join(dir, 'marks.json'), JSON.stringify(marks, null, 1));

  const secs = ((manifest.at(-1).at - manifest[0].at) / 1000).toFixed(1);
  return { id: loop.id, frames: manifest.length, secs, out };
}

// ------------------------------------------------------------- one switch ----
async function captureSwitch(page, pool, sw, baseUrl) {
  page.deviceW = PHONE.w * PHONE.dsf;
  page.deviceH = PHONE.h * PHONE.dsf;
  page.viewportW = PHONE.w;
  page.viewportH = PHONE.h;
  page.dsf = PHONE.dsf;
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: PHONE.w, height: PHONE.h, deviceScaleFactor: PHONE.dsf, mobile: false,
  });
  await page.send('Page.navigate', { url: baseUrl + sw.from });
  await page.until(`document.readyState === 'complete'`, { timeout: 30000, label: 'document ready' });
  await page.waitVisible('[aria-label="Switch client"]', { timeout: 20000 });
  await page.installPaintPump();
  await page.installCursor();
  await sleep(T.afterLoad);

  const dir = join(WORK, sw.id);
  await rm(dir, { recursive: true, force: true });
  const t0 = Date.now();

  await page.click('[aria-label="Switch client"]');
  await page.waitVisible(sw.to, { timeout: 8000 });
  await sleep(T.swSettle);
  await page.click(sw.to);
  await page.waitVisible(sw.wait, { timeout: 20000 });
  await sleep(T.swHold);

  const t1 = Date.now();
  await sleep(250);
  await pool.flush();
  const out = join(WORK, `${sw.id}.mp4`);
  const manifest = await encodeRange(pool, t0, t1, dir, out);
  const secs = ((manifest.at(-1).at - manifest[0].at) / 1000).toFixed(1);
  return { id: sw.id, frames: manifest.length, secs, out };
}

// ------------------------------------------------------------- one script ----
async function captureScript(page, pool, script, baseUrl) {
  page.deviceW = script.viewport.w * script.viewport.dsf;
  page.deviceH = script.viewport.h * script.viewport.dsf;
  page.viewportW = script.viewport.w;
  page.viewportH = script.viewport.h;
  page.dsf = script.viewport.dsf;
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: script.viewport.w, height: script.viewport.h,
    deviceScaleFactor: script.viewport.dsf, mobile: false,
  });
  await page.send('Page.navigate', { url: baseUrl + script.path });
  await page.until(`document.readyState === 'complete'`, { timeout: 30000, label: 'document ready' });
  await page.installPaintPump();
  await page.installCursor();
  await sleep(T.afterLoad);

  const dir = join(WORK, script.id);
  await rm(dir, { recursive: true, force: true });
  const t0 = Date.now();
  const marks = { steps: [] };

  await runSteps(page, script.steps, (at) => marks.steps.push(at - t0));

  const t1 = Date.now();
  marks.end = t1 - t0;
  if (script.expect) {
    const missing = await page.eval(
      `${JSON.stringify(script.expect)}.filter(w => !document.body.innerText.includes(w))`,
    );
    if (missing.length) throw new Error(`never appeared on screen: ${missing.join(', ')}`);
  }
  await sleep(250);
  await pool.flush();
  const out = join(WORK, `${script.id}.mp4`);
  const manifest = await encodeRange(pool, t0, t1, dir, out, { w: page.deviceW, h: page.deviceH });
  await writeFile(join(dir, 'marks.json'), JSON.stringify(marks, null, 1));
  const secs = ((manifest.at(-1).at - manifest[0].at) / 1000).toFixed(1);
  return { id: script.id, frames: manifest.length, secs, out };
}

// --------------------------------------------------------------- one tour ----
async function captureTour(page, pool, tour, baseUrl) {
  page.deviceW = PHONE.w * PHONE.dsf;
  page.deviceH = PHONE.h * PHONE.dsf;
  page.viewportW = PHONE.w;
  page.viewportH = PHONE.h;
  page.dsf = PHONE.dsf;
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: PHONE.w, height: PHONE.h, deviceScaleFactor: PHONE.dsf, mobile: false,
  });
  await page.send('Page.navigate', { url: baseUrl + tour.path });
  await page.until(`document.readyState === 'complete'`, { timeout: 30000, label: 'document ready' });
  // The deep link starts the tour by itself — that IS what this clip is proving.
  await page.until(`!!document.querySelector('.tour-tooltip')`, { timeout: 20000, label: 'tour to start' });
  await page.installPaintPump();
  await page.installCursor();

  const dir = join(WORK, tour.id);
  await rm(dir, { recursive: true, force: true });
  const t0 = Date.now();
  const marks = { steps: [] };

  for (let step = 1; step <= tour.steps; step++) {
    // Some steps mount their screen first (the feed needs a beat after sign-in),
    // so hold only once the ring has settled. Intro steps legitimately have no
    // ring — those fall through on the timeout instead of failing the run.
    await page.until(
      `(() => { const s = document.querySelector('.tour-spotlight'); if (!s) return false;
        const r = s.getBoundingClientRect(); return r.width > 8 && r.height > 8; })()`,
      { timeout: 2500, label: `ring for tour step ${step}` },
    ).catch(() => {});
    marks.steps.push(Date.now() - t0);
    await sleep(step === 1 ? T.tourFirst : T.tourStep);
    if (step < tour.steps) {
      const before = await page.eval(`document.querySelector('.tour-tooltip__title')?.textContent ?? ''`);
      await page.click('[aria-label="Next step"]');
      await page.until(
        `(document.querySelector('.tour-tooltip__title')?.textContent ?? '') !== ${JSON.stringify(before)}`,
        { timeout: 10000, label: `tour step ${step + 1}` },
      );
    }
  }
  const t1 = Date.now();
  marks.end = t1 - t0;
  await sleep(250);
  await pool.flush();
  const out = join(WORK, `${tour.id}.mp4`);
  const manifest = await encodeRange(pool, t0, t1, dir, out, { w: page.deviceW, h: page.deviceH });
  await writeFile(join(dir, 'marks.json'), JSON.stringify(marks, null, 1));
  const secs = ((manifest.at(-1).at - manifest[0].at) / 1000).toFixed(1);
  return { id: tour.id, frames: manifest.length, secs, out };
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
    const result = await fn(cdp, page, pool);
    return result && typeof result === 'object' ? { ...result, rate: pool.stats() } : result;
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
  const switches = wanted.length ? SWITCHES.filter((s) => wanted.includes(s.id)) : SWITCHES;
  const tours = wanted.length ? TOURS.filter((t) => wanted.includes(t.id)) : TOURS;
  const scripts = wanted.length ? SCRIPTS.filter((x) => wanted.includes(x.id)) : SCRIPTS;
  if (!loops.length && !switches.length && !tours.length && !scripts.length) throw new Error(`no such loop: ${wanted.join(', ')}`);

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
      console.log(`→ ${r.frames} frames, ${r.secs}s  ${(r.frames / r.secs).toFixed(1)} fps  ${r.rate}${r.frames / r.secs < 8 ? '   ← THIN' : ''}`);
    }
    for (const [i, script] of scripts.entries()) {
      process.stdout.write(`  · ${script.id} (scripted) `);
      const r = await withBrowser(port + 90 + i, script, (cdp, page, pool) =>
        captureScript(page, pool, script, baseUrl),
      );
      results.push(r);
      console.log(`→ ${r.frames} frames, ${r.secs}s  ${(r.frames / r.secs).toFixed(1)} fps  ${r.rate}${r.frames / r.secs < 8 ? '   ← THIN' : ''}`);
    }
    for (const [i, tour] of tours.entries()) {
      process.stdout.write(`  · ${tour.id} `);
      const r = await withBrowser(port + 70 + i, tour, (cdp, page, pool) =>
        captureTour(page, pool, tour, baseUrl),
      );
      results.push(r);
      console.log(`→ ${r.frames} frames, ${r.secs}s  ${(r.frames / r.secs).toFixed(1)} fps  ${r.rate}${r.frames / r.secs < 8 ? '   ← THIN' : ''}`);
    }
    for (const [i, sw] of switches.entries()) {
      process.stdout.write(`  · ${sw.id} `);
      const r = await withBrowser(port + 40 + i, sw, (cdp, page, pool) =>
        captureSwitch(page, pool, sw, baseUrl),
      );
      results.push(r);
      console.log(`→ ${r.frames} frames, ${r.secs}s  ${(r.frames / r.secs).toFixed(1)} fps  ${r.rate}${r.frames / r.secs < 8 ? '   ← THIN' : ''}`);
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
