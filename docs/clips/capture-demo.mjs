#!/usr/bin/env node
// Record ANY sandstr demo link. The other capture scripts each film one
// scripted cut; this one takes a URL and films whatever that URL does.
//
//   npm run build
//   node docs/clips/capture-demo.mjs '/c/wisp?theme=light&showme=zap'
//   node docs/clips/capture-demo.mjs 'https://sandstr.app/c/damus?tour=1'
//   DWELL=9000 node docs/clips/capture-demo.mjs '/c/coracle?screen=relays'
//   STEPS=4 node docs/clips/capture-demo.mjs '/c/wisp?tour=1'
//
// Output: .work/demo/<slug>.mp4 + <slug>.marks.json (raw — no captions, no
// card, no chrome; the cut is assembled separately, as with every take here).
//
// The link is the unit of work on purpose. `/c/<id>` carries a parameter
// contract (docs/OUTREACH.md, "The reply playbook") that the in-app builder
// composes — `?screen=`, `?theme=`, `?tour=1`, `?faq=`, `?showme=`, `?note=`.
// One configuration should produce both things you can hand someone: the link
// itself, and a file. Anything the builder can express, this can film, and
// nothing here knows the difference between them.
//
// ---------------------------------------------------------------------------
// IT FILMS WHAT THE LINK DOES. It never clicks a client through its own login
// wall, the way capture-faq.mjs and capture-compare.mjs do with their ENTRY
// tables. Those scripts are staging a cut and the wall is not part of it; here
// the recipient is going to open this exact URL, so a take that quietly signs
// in would be filming a page the link does not produce. A link that lands on a
// sign-in screen is a fact about the link — the fix is `?screen=feed` or
// `?showme=`, not a script that papers over it. The run prints what it ended on
// so you can see which you got.
// ---------------------------------------------------------------------------
//
// Everything else — one Chrome per take, pulled frames, arrival timestamps, the
// paint pump — is harness.mjs, and the reasoning lives in its header.

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { encodeRange, serveDist, sleep, withBrowser } from './harness.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const DIST = join(ROOT, 'dist');
const WORK = join(HERE, '.work', 'demo');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Same two framings the rest of the series uses: a phone for framed clients,
// a desktop window for the frameless ones (ClientView refuses to render those
// below 640px at all).
const PHONE = { w: 430, h: 775, dsf: 2 };
const DESK = { w: 1280, h: 1000, dsf: 2 };

const T = {
  afterLoad: 900,
  // What a viewer needs to read one tour card. The welcome card carries the
  // most text, so it gets its own, longer beat.
  tourFirst: 2600,
  tourStep: 2200,
  // A mini-tour's first card is not a welcome card — it is the whole answer,
  // and most of them are one step, so the beat that would open a guided tour
  // is the entire take. Measured: `showme=zap` on Wisp ran 3.3s end to end.
  miniOnly: 4200,
  // Hold on the client after the last card, always. Without it the take ends on
  // the frame the tour ended on, which reads as a clip that was cut short — and
  // for a demo the seconds AFTER the explanation are the ones showing the app.
  hold: 2500,
  // A plain landing with nothing scripted: long enough to read the screen.
  dwell: Number(process.env.DWELL ?? 6000),
  tail: 700,
};

const target = process.argv[2];
if (!target) {
  console.error('usage: node docs/clips/capture-demo.mjs \'<demo link or /c/... path>\'');
  process.exit(1);
}

/** Accept a full sandstr URL or a bare path — only the path+query is ours. */
function parseTarget(raw) {
  const u = new URL(raw, 'http://placeholder.invalid');
  if (!u.pathname.startsWith('/c/')) {
    throw new Error(`not a client link: ${u.pathname} — this films /c/<id> demo links`);
  }
  return { path: u.pathname + u.search, params: u.searchParams, clientId: u.pathname.split('/')[2] };
}

const LINK = parseTarget(target);
const SLUG = (LINK.clientId + (LINK.params.toString() ? '-' + LINK.params.toString() : ''))
  .replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 60).toLowerCase();

const mark = (marks, t0, name) => { marks[name] = Date.now() - t0; };

/**
 * Which upstream build this reproduction was verified against ('v1.2.1',
 * 'as of Jul 2026'), for the cut to burn into the frame.
 *
 * Read out of `dist/c/<id>.html`, which the build writes from `shareCopy()`
 * (src/shareMeta.ts) — so it is derived from `reproduces` in the registry
 * without this script parsing TSX or loading another page. It matters because
 * the version label is only ON SCREEN at desktop framing: the meta row shows
 * "AS OF AUG 2026" beside the client name, and the phone compact bar has no
 * room for it. A phone take therefore carries no staleness marker at all
 * unless the cut draws one, and a stale reproduction published under a
 * maintainer's own name is their problem, not ours.
 */
async function reproducesLabel(clientId) {
  try {
    const html = await readFile(join(DIST, 'c', `${clientId}.html`), 'utf8');
    const desc = html.match(/name="description" content="([^"]*)"/)?.[1] ?? '';
    return desc.match(/\(([^)]*(?:v\d|as of)[^)]*)\)/i)?.[1] ?? '';
  } catch {
    return '';
  }
}

/** The desktop gate ClientView renders instead of a frameless client on a phone. */
const GATED = `!!document.body.innerText.match(/is a desktop client|Open this page on a laptop/i)`;

// ClientView has mounted. The disclaimer banner is the signal precisely because
// it is the one thing CLAUDE.md forbids removing, and it renders in every state
// this script can land in — client, login wall, and the desktop gate alike. The
// gate is why readiness is split in two: a condition that demanded the CLIENT
// would time out on the gate page, before the code that exists to detect it.
const MOUNTED = `/SIMULATION|Simulation/.test(document.body.innerText)`;

// The client's own DOM. `[data-tour]` and not an element count: it is the exact
// signal ClientView itself waits for before firing ?tour=1 and ?showme=, so this
// cannot drift away from what the app considers "the simulator is up". Every
// client carries anchors, including the two with no guided tour of their own
// (Coracle renders 8, measured 2026-08-21).
const CLIENT_UP = `document.querySelectorAll('[data-tour]').length > 0`;

async function setViewport(page, vp) {
  // All FIVE fields, not just the device pair. `startPool` sizes each capture
  // from `viewportW/viewportH/dsf` and falls back to the 430x775 phone when they
  // are missing — so a desktop take with only `deviceW/deviceH` set was grabbing
  // uncapped 2560x2000 frames, 5 MP each, and the pool delivered 4 frames in
  // 1.7s (measured 2026-08-21). `deviceW/deviceH` are what the encoder and the
  // cursor clamp read. Set them together or the failure is a silent slideshow.
  page.viewportW = vp.w;
  page.viewportH = vp.h;
  page.dsf = vp.dsf;
  page.deviceW = vp.w * vp.dsf;
  page.deviceH = vp.h * vp.dsf;
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: vp.w, height: vp.h, deviceScaleFactor: vp.dsf, mobile: false,
  });
}

async function goto(page, url) {
  await page.send('Page.navigate', { url });
  await page.until(`document.readyState === 'complete'`, { timeout: 30000, label: 'document ready' });
  await page.until(MOUNTED, { timeout: 25000, label: 'ClientView (the disclaimer banner)' });
}

async function capture(page, pool, base) {
  // Phone first: it is the framing for the six framed clients, and it is what
  // someone opening a link from a Nostr reply is holding. If ClientView answers
  // with the desktop gate, this is one of the frameless clients and the take is
  // re-framed and reloaded once — a second load costs nothing here, because
  // unlike cut #3 this take makes no claim that spans two clients.
  await setViewport(page, PHONE);
  await goto(page, base + LINK.path);

  let framing = 'phone';
  if (await page.eval(GATED)) {
    framing = 'desktop';
    await setViewport(page, DESK);
    await goto(page, base + LINK.path);
    if (await page.eval(GATED)) throw new Error('still gated at desktop size — check the client id');
  }

  // Only now, with the framing settled, is it worth waiting for the simulator:
  // its chunk loads lazily, long after the route matches.
  await page.until(CLIENT_UP, { timeout: 25000, label: 'the simulator chunk' });

  await page.installPaintPump();
  await page.installCursor();
  await sleep(T.afterLoad);

  const marks = {};
  const t0 = Date.now();
  mark(marks, t0, 'start');

  const drives = LINK.params.get('tour') === '1' || LINK.params.get('showme');
  if (drives) {
    // Wait on `.tour-overlay`, NOT on `.tour-spotlight`.
    //
    // The clips checklist says to wait for a spotlight with a rect over 8x8
    // before believing a step has stood up, and for a guided tour that is still
    // the sharper check. This gate is deliberately the looser one, for a reason
    // that outlived its original cause: the overlay is what says "a tour owns
    // the screen", and a ring is a property of the STEP. A step may legitimately
    // have none — the whole-app intro cards suppress it by design — so a script
    // that films arbitrary links cannot require one.
    //
    // The original reason was a defect, and it is worth keeping the history:
    // this script was written on 2026-08-21 against an engine where a mini-tour
    // at phone width rendered its card and navigated correctly while
    // `.tour-spotlight` never appeared at all (Wisp `showme=zap`: 352x573 at
    // 1280px, null at 375px). Fixed the same day on main by abf34b0 — the
    // whole-app test was measuring the target against the viewport, and on a
    // phone the client IS the viewport. So the hang this avoided is gone; the
    // gate stays because the reasoning above never depended on that bug.
    await page.until(`!!document.querySelector('.tour-overlay')`, {
      timeout: 25000, label: 'the tour/mini-tour overlay',
    });
    mark(marks, t0, 'overlay');

    // "3 / 11" in the card header is the only place the length is published.
    const total = Number(
      await page.eval(`(document.querySelector('.tour-overlay')?.innerText || '')
        .match(/\\d+\\s*\\/\\s*(\\d+)/)?.[1] ?? 1`),
    ) || 1;
    const want = Math.min(total, Number(process.env.STEPS ?? total));
    console.log(`  · ${LINK.params.get('tour') ? 'tour' : 'mini-tour'}: ${want} of ${total} steps`);

    await sleep(want === 1 ? T.miniOnly : T.tourFirst);
    for (let i = 1; i < want; i++) {
      // ArrowRight, never a click on "Next": in the FAQ cut that button lives
      // inside a tooltip hidden by opacity, and reaching for it films a hunt.
      await page.pressKey('ArrowRight');
      mark(marks, t0, `step${i}`);
      await sleep(T.tourStep);
    }
    mark(marks, t0, 'hold');
    await sleep(T.hold);
  } else {
    await sleep(T.dwell);
  }

  mark(marks, t0, 'end');
  await sleep(T.tail);

  const t1 = Date.now();
  await sleep(250);
  await pool.flush();

  // What actually ended up on camera — the whole point of not clicking through
  // a login wall is that you get told when the link lands on one.
  const tail = String(await page.eval(
    `document.body.innerText.replace(/\\s+/g, ' ').trim().slice(0, 220)`,
  ));
  const wall = /Sign In|Create Account|Welcome to|Get started|Log in/i.test(tail);

  const reproduces = await reproducesLabel(LINK.clientId);

  const dir = join(WORK, `frames-${SLUG}`);
  await rm(dir, { recursive: true, force: true });
  const out = join(WORK, `${SLUG}.mp4`);
  const manifest = await encodeRange(pool, t0, t1, dir, out, { w: page.deviceW, h: page.deviceH });
  await writeFile(
    join(WORK, `${SLUG}.marks.json`),
    JSON.stringify({ link: LINK.path, framing, reproduces, marks, endedOn: tail }, null, 2),
  );
  // `manifest.windowMs`, not last-arrival minus first: dividing by the span of
  // the frames that DID arrive hides the holes at both ends, which is exactly
  // how a pool that was dead for its first seconds still reported a healthy
  // rate. The window is what the driver actually spent. `holeMs` is the worst
  // gap, ends included — an average sails straight through a freeze.
  const secs = (manifest.windowMs / 1000).toFixed(1);
  return {
    frames: manifest.length, secs, out, framing, wall, tail, reproduces,
    hole: manifest.holeMs, holeAt: manifest.holeAtMs,
  };
}

async function main() {
  await mkdir(WORK, { recursive: true });
  const { server, port } = await serveDist(DIST);
  const base = `http://127.0.0.1:${port}`;
  console.log(`  · serving dist/ on ${base}`);
  console.log(`  · link: ${LINK.path}`);

  try {
    const r = await withBrowser(
      { id: `demo-${SLUG}`, debugPort: 9423, workDir: WORK, chrome: CHROME, windowSize: '1400,1100' },
      (cdp, page, pool) => capture(page, pool, base),
    );
    const fps = r.frames / Number(r.secs);
    // The floor is per FRAMING, because the two are not comparable: a phone
    // frame is 860x1550 and a desktop one is capped at 1600x1250, so the
    // desktop take pays about twice the per-frame cost. Measured 2026-08-21 on
    // the same machine: `/c/wisp?showme=zap` 16.1 fps at phone,
    // `/c/coracle?screen=relays` 7.4 fps at desktop. One threshold for both
    // would either miss a genuinely dead phone take or cry wolf on every
    // healthy desktop one — and a warning that always fires stops being read.
    const floor = r.framing === 'desktop' ? 5 : 8;
    console.log(
      `  · ${SLUG} → ${r.frames} frames, ${r.secs}s  ${fps.toFixed(1)} fps  (${r.framing})` +
      `  worst hole ${r.hole}ms@${(r.holeAt / 1000).toFixed(1)}s` +
      (fps < floor ? `   ← THIN for ${r.framing} (see startPool in harness.mjs)` : ''),
    );
    console.log(`  · reproduces: ${r.reproduces || '(none — check dist/c/<id>.html)'}`);
    if (r.wall) {
      console.log(
        `\n  ⚠ this link ends on a sign-in screen, so that is what got filmed:\n    "${r.tail.slice(0, 120)}…"\n` +
        `    Add ?screen=feed, ?showme=<entry> or ?tour=1 to the link — this script\n` +
        `    deliberately does not click through the wall on the link's behalf.`,
      );
    }
    console.log(`\n  raw take (no captions, no card):\n    ${r.out}`);
  } finally {
    server.close();
  }
}

await main();
