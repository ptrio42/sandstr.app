#!/usr/bin/env node
// Capture the comparison teaser (cut #3): ONE note, typed once, then carried
// through five clients and finally shown in all eight side by side.
//
//   npm run build && node docs/clips/capture-compare.mjs
//   NOTE='your text #tag' node docs/clips/capture-compare.mjs
//   SWITCH=arrows node docs/clips/capture-compare.mjs
//
// Output: .work/compare/compare[-arrows].mp4  (raw — no captions, no chrome)
//         .work/compare/marks[-arrows].json   (phase boundaries in ms)
//
// TWO WAYS THROUGH THE SHELF, and the take records whichever you ask for.
// `sheet` (default) opens the bottom sheet and picks a tile — two taps, and the
// sheet covers 55% of the screen. `arrows` uses the compact bar's prev/next
// arrows — one tap, no sheet. The arrows only exist at >=400px, which the
// 430px capture viewport clears, and their stepping SKIPS the frameless
// clients that cannot render at this width, so the order they walk is exactly
// the PHONES list below. If that ever stops being true this script fails on
// the `waitVisible` for the client it expected rather than filming the wrong
// one.
//
// Where cut #1 sells capability and cut #2 sells utility, this one sells the
// one thing no real client can show you: YOUR post, unchanged, rendered by
// eight different interfaces. The whole point is that the note is identical, so
// everything below exists to protect that identity on camera.
//
// ---------------------------------------------------------------------------
// THE RULE THIS CUT LIVES OR DIES BY: one page load for the whole recording.
//
// src/data/mock builds its bank with unseeded Math.random() at module init (15
// call sites across notes.ts, threads.ts and generator.ts), so every page LOAD
// invents a different author, different counters and a different repost source
// for the very note we are claiming is "the same". Two loads measured minutes
// apart gave "Writer Wendy · 3/3/31 · via Gossip" and "CodeWiz · 3/10/61 · via
// Coracle". Filmed as separate navigations, the viewer sees a different person
// in every cut and the thesis dies in the second beat.
//
// So: navigate ONCE, then move with the app's own SPA navigation — the client
// switcher (`useNavigate`, ClientSwitcher.tsx), the rail's "All clients", the
// gallery's /compare link. The mock module stays in memory and the note, its
// author and its numbers are frozen for the whole take. As a bonus this makes
// the claim literally true: it really is one browser tab.
// ---------------------------------------------------------------------------
//
// Measured facts this script is built on (probe runs, 2026-08-20):
//
//   - Only the FIRST client needs its login wall clicked. After that the host's
//     screen intent (`sandstr-screen` / readScreenIntent) carries "you were on
//     the feed" across switches, so every later client mounts on its feed with
//     the note already on top. No onboarding detours mid-cut.
//   - Primal, Snort and Coracle are GATED at 430px — they are web clients and
//     ClientView refuses to render them below 640px. They cannot appear in the
//     phone run at all; they appear in the /compare strip at the end, which is
//     fluid and renders every client's card at any width.
//   - /compare at 430px lays the strip out in ONE column, ~1860px of cards.
//     That is the payoff shot: a slow scroll past eight versions of one note.

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { encodeRange, serveDist, sleep, withBrowser } from './harness.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const DIST = join(ROOT, 'dist');
const WORK = join(HERE, '.work', 'compare');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/**
 * The note that gets typed. Keep it SHORT.
 *
 * It is typed at 1.0x (see T.perChar) and never sped up, because a query
 * appearing at ~12ms/char reads as fake before anything else registers — the
 * same finding that set the FAQ cut's typing speed. 38 characters is ~4.2s of
 * screen time; every character past that is a character the viewer waits
 * through before the cut has said anything.
 *
 * A hashtag earns its place: it is the single clearest difference between the
 * eight renderings (purple, blue chip, orange, teal, underlined, plain).
 */
const NOTE = process.env.NOTE ?? 'gm — does this look the same? #asknostr';

/** 'sheet' (two taps, the bottom sheet) or 'arrows' (one tap, no sheet). */
const SWITCH_MODE = process.env.SWITCH === 'arrows' ? 'arrows' : 'sheet';
const SUFFIX = SWITCH_MODE === 'arrows' ? '-arrows' : '';

/**
 * 430 x 775 CSS @ DPR 2 = 860 x 1550 native — the same frame the FAQ cut uses.
 * Under the 639px branch the client is full-bleed, i.e. the client's interface
 * IS the frame, with no phone bezel and no host chrome around it.
 */
const PHONE = { w: 430, h: 775, dsf: 2 };

/** Phone clients only — see the gating note in the header. */
// `welcomeToast` marks the clients that greet you on mount and therefore need
// the extra settle before the feed is clean. It is AMETHYST ALONE among these
// five — verified by reading the frames, not the source: at mount+400ms only
// Amethyst carries one ("Welcome, Nostrich Nina!", bottom right). The wait used
// to be unconditional, which threw away 2.7s of usable footage per client and,
// worse, threw away exactly the window the landing pill lives in.
const PHONES = [
  { id: 'damus', name: 'Damus' },
  { id: 'amethyst', name: 'Amethyst', welcomeToast: true },
  { id: 'yakihonne', name: 'YakiHonne' },
  { id: 'wisp', name: 'Wisp' },
  { id: 'nostur', name: 'Nostur' },
];

/**
 * The one login wall in the whole take. Same labels scripts/og-client-cards.mjs
 * clicks — kept here rather than imported because that file is a card generator
 * and this is a clip harness; when they disagree it is because a client's
 * onboarding changed and both should fail loudly.
 */
const ENTRY = ['Sign In'];

const T = {
  afterLoad: 900,
  afterEntry: 1400,
  beforeOpen: 700,
  afterOpen: 800,
  // 110ms/char, played at 1.0x in the cut. Never speed this up.
  perChar: 110,
  afterType: 800,
  // The note lands on the feed: the single most important frame in the cut.
  afterApply: 2200,
  holdClient: 1700,
  swSettle: 550,
  // A client mounted by the switcher fires a 2500ms welcome toast (showToast in
  // Amethyst and Keychat) — "Welcome, <persona>!" bottom-right, over the feed.
  // Three OG cards already shipped with it (CLAUDE.md, Gotchas). The beat is
  // marked only after this window has passed, counted from the note being
  // visible, so the montage can never cut into it.
  toast: 2700,
  // The client has to be on screen LONGER than the sheet that got us to it.
  // At 1500ms the first take spent ~2.4s per beat in the switcher and ~1.5s on
  // the client — the cut is about the client, so the ratio is inverted here and
  // the switcher is trimmed to a glimpse in the montage.
  afterSwitch: 2700,
  beforeShelf: 700,
  afterShelf: 1100,
  afterCompare: 1300,
  afterTab: 1500,
  // The payoff scroll past all eight cards.
  scrollMs: 5200,
  tail: 1400,
};

/** A phase boundary the montage can cut on. */
const mark = (marks, t0, name) => { marks[name] = Date.now() - t0; };

/** The note's text as it appears on a card, for "has it arrived yet" waits. */
const probe = JSON.stringify(NOTE.slice(0, 24));

async function capture(page, pool, base) {
  page.viewportW = PHONE.w;
  page.viewportH = PHONE.h;
  page.dsf = PHONE.dsf;
  page.deviceW = PHONE.w * PHONE.dsf;
  page.deviceH = PHONE.h * PHONE.dsf;
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: PHONE.w, height: PHONE.h, deviceScaleFactor: PHONE.dsf, mobile: false,
  });

  // The ONLY navigation in the whole run.
  await page.send('Page.navigate', { url: `${base}/c/${PHONES[0].id}` });
  await page.until(`document.readyState === 'complete'`, { timeout: 30000, label: 'document ready' });
  await page.waitVisible('[aria-label="Switch client"]', { timeout: 20000 });

  // Through the login wall BEFORE the camera rolls: it is the one part of this
  // cut that is not about the note, and it only happens once.
  for (const label of ENTRY) {
    await page.click(`text:${label}`);
    await sleep(T.afterEntry);
  }
  await page.until(`!!document.querySelector('[aria-label="Preview your note"]')`, {
    timeout: 20000, label: 'the preview control (are we past the wall?)',
  });

  await page.installPaintPump();
  await page.installCursor();
  await sleep(T.afterLoad);

  const marks = {};
  const t0 = Date.now();

  // -- 1. open the sheet ----------------------------------------------------
  mark(marks, t0, 'open');
  await sleep(T.beforeOpen);
  await page.click('[aria-label="Preview your note"]');
  await page.waitVisible('textarea', { timeout: 8000 });
  await sleep(T.afterOpen);

  // -- 2. type it -----------------------------------------------------------
  // The sheet focuses its textarea on mount (PreviewNoteSheet), so insertText
  // lands there without a click of its own.
  mark(marks, t0, 'typing');
  await page.typeText(NOTE, T.perChar);
  await sleep(T.afterType);

  // -- 3. it appears on the feed --------------------------------------------
  mark(marks, t0, 'apply');
  await page.click('text:Show it');
  await page.until(`document.body.innerText.includes(${probe})`, {
    timeout: 15000, label: 'the note on the first feed',
  });
  // Every `feed:` mark is the first moment the note is READABLE in that client.
  // The montage cuts on these, not on the `client:` marks, which are when the
  // switcher opened — a beat and a half earlier.
  mark(marks, t0, `feed:${PHONES[0].id}`);
  await sleep(T.afterApply);

  // -- 4. the same note, client after client --------------------------------
  for (const client of PHONES.slice(1)) {
    mark(marks, t0, `client:${client.id}`);
    if (SWITCH_MODE === 'arrows') {
      await page.click('[aria-label="Next client"]');
    } else {
      await page.click('[aria-label="Switch client"]');
      await page.waitVisible(`text:${client.name}`, { timeout: 8000 });
      await sleep(T.swSettle);
      await page.click(`text:${client.name}`);
    }
    // Doubles as the assertion that `arrows` walked where we expected: a
    // reordered registry times out here by name instead of filming a stranger.
    await page.waitVisible(`[aria-label="${client.name} FAQ"]`, { timeout: 20000 });
    // Wait for the NOTE, not for the client: the chunk mounts before the feed
    // has painted, and a hold measured from the mount films an empty column.
    await page.until(`document.body.innerText.includes(${probe})`, {
      timeout: 15000, label: `the note on ${client.id}`,
    });
    // `mount:` is where the switch is over and the note is readable; `feed:` is
    // where the welcome toast has expired. The montage cuts the transition on
    // the first and the client beat on the second, so the toast window falls
    // between two beats and never reaches the film.
    mark(marks, t0, `mount:${client.id}`);
    // NO toast wait any more, deliberately, and it reverses a rule that still
    // holds for og:cards (CLAUDE.md, Gotchas). Amethyst is the only one of
    // these five that greets you on mount, and its 2.5s toast used to be waited
    // out here — which meant the montage discarded the 2.7s after the mount,
    // and that window is exactly where the landing pill is legible. A welcome
    // toast in the corner of a 2.25s beat that the viewer has JUST arrived in
    // is honest: it is what the app does. The same toast frozen into a still
    // share card is an artifact, which is why the card generator still waits.
    mark(marks, t0, `feed:${client.id}`);
    await sleep(T.afterSwitch);
  }
  mark(marks, t0, 'lastClientEnd');
  await sleep(T.holdClient);

  // -- 5. out to the shelf, then to /compare --------------------------------
  // Both are the app's own links, so the page never reloads and the mock bank
  // (author, counters) stays exactly as it has been all take.
  mark(marks, t0, 'shelf');
  await sleep(T.beforeShelf);
  await page.click('[aria-label="All clients"]');
  await page.until(`!!document.querySelector('a[href="/compare"]')`, {
    timeout: 15000, label: 'the gallery (with its /compare link)',
  });
  await sleep(T.afterShelf);

  mark(marks, t0, 'compare');
  await page.click('a[href="/compare"]');
  await page.until(`!!document.getElementById('strip-heading')`, {
    timeout: 20000, label: '/compare',
  });
  await sleep(T.afterCompare);

  // The strip opens on "The first screen"; the note surface is one tab across.
  // (A ?note= URL would have selected it, but arriving here through the app is
  // the whole point — see the one-page-load rule in the header.)
  mark(marks, t0, 'tab');
  await page.click('text:A note');
  const geom = await page.until(
    `(() => {
      const f = [...document.querySelectorAll('section[aria-labelledby="strip-heading"] figure')];
      if (f.length < 8) return null;
      if (!document.body.innerText.includes(${probe})) return null;
      const top = Math.min(...f.map((x) => x.getBoundingClientRect().top + scrollY));
      const bot = Math.max(...f.map((x) => x.getBoundingClientRect().bottom + scrollY));
      return { count: f.length, top: Math.round(top), bottom: Math.round(bot) };
    })()`,
    { timeout: 20000, label: 'eight cards carrying the note' },
  );
  // Park at the first card before the pan starts.
  await page.eval(`(() => { scrollTo(0, ${geom.top - 8}); return true; })()`);
  mark(marks, t0, 'cards');
  await sleep(T.afterTab);

  // -- 6. the payoff: one slow pan past all eight ---------------------------
  mark(marks, t0, 'scroll');
  const to = Math.max(geom.top - 8, geom.bottom - PHONE.h + 24);
  // Driven by rAF INSIDE the page, not by a stack of CDP scroll calls: the
  // recorder and the driver share one socket, and a scroll animation made of
  // round trips spends the frame budget it is supposed to be filling.
  await page.eval(`new Promise((done) => {
    const from = ${geom.top - 8}, to = ${to}, ms = ${T.scrollMs};
    const started = performance.now();
    const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
    const step = () => {
      const k = Math.min(1, (performance.now() - started) / ms);
      scrollTo(0, from + (to - from) * ease(k));
      k < 1 ? requestAnimationFrame(step) : done(true);
    };
    step();
  })`);
  mark(marks, t0, 'end');
  await sleep(T.tail);

  const t1 = Date.now();
  await sleep(250);
  await pool.flush();

  const dir = join(WORK, `frames${SUFFIX}`);
  await rm(dir, { recursive: true, force: true });
  const out = join(WORK, `compare${SUFFIX}.mp4`);
  const manifest = await encodeRange(pool, t0, t1, dir, out);
  await writeFile(
    join(WORK, `marks${SUFFIX}.json`),
    JSON.stringify({ note: NOTE, switch: SWITCH_MODE, marks }, null, 2),
  );
  const secs = (manifest.windowMs / 1000).toFixed(1);
  return { frames: manifest.length, secs, hole: manifest.holeMs, holeAt: manifest.holeAtMs, out, cards: geom.count };
}

async function main() {
  await mkdir(WORK, { recursive: true });
  const { server, port } = await serveDist(DIST);
  const base = `http://127.0.0.1:${port}`;
  console.log(`  · serving dist/ on ${base}`);
  console.log(`  · note: ${JSON.stringify(NOTE)} (${NOTE.length} chars, ~${(NOTE.length * T.perChar / 1000).toFixed(1)}s of typing)`);
  console.log(`  · switching: ${SWITCH_MODE}`);

  try {
    const r = await withBrowser(
      { id: `compare${SUFFIX}`, debugPort: 9421, workDir: WORK, chrome: CHROME, windowSize: '430,775' },
      (cdp, page, pool) => capture(page, pool, base),
    );
    const fps = r.frames / Number(r.secs);
    console.log(
      `  · compare → ${r.frames} frames, ${r.secs}s  ${fps.toFixed(1)} fps  worst hole ${r.hole}ms@${(r.holeAt / 1000).toFixed(1)}s  ${r.cards} cards` +
      (fps < 8 ? '   ← THIN (see startPool in harness.mjs)' : ''),
    );
    console.log(`\n  raw take (no captions, no card — the cut is assembled separately):\n    ${r.out}`);
  } finally {
    server.close();
  }
}

await main();
