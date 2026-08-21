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

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// The Chrome/CDP/recorder machinery lives in harness.mjs — extracted when the
// comparison cut needed the same helpers. The lessons behind each one are in
// that file's header; this one keeps only what is specific to the FAQ cut.
import { encodeRange, serveDist, withBrowser as withChrome } from './harness.mjs';

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
    // THREE rings: the drawer row, the Add relay button, then the address field.
    // Two started on the Relays screen with no account of how you got there,
    // which is exactly the half of step 1 people ask about.
    steps: 3,
    holdLast: 1100,
    afterTour: [
      { click: '[data-tour="damus-add-relay-field"] input' }, { sleep: 400 },
      // A thematic relay, not one of the big public ones. The clip's argument is
      // "read Nostr like a newspaper — pick a section", and `relay.nostr.wine`
      // reads as infrastructure rather than as a section. Also NOT one of the
      // seeded five: addRelay refuses duplicates, so a silently rejected add
      // would film a row that was already on the list.
      { type: 'wss://gardening.relay.town' }, { sleep: 500 },
      // Everything up to here plays at 1.0x — see the `typed` split in the build.
      { mark: 'typed' },
      { key: 'Enter' }, { sleep: 1900 },          // the row lands in My Relays
      // Back out of Relays first. Confirming the sheet pops it by itself, but the
      // Relays screen replaces the bottom edge with its own chrome — there is no
      // tab bar to aim at until we leave it.
      { click: '[data-tour="damus-relays"] button' }, { sleep: 1300 },
      // The tab bar labels its buttons with the tab id, not a display name.
      { click: '[aria-label="search"]' }, { sleep: 1600 },
      { click: '[data-tour="damus-search-filter"]' }, { sleep: 1500 },
      // Everything off except the one just added — this is the beat the clip is
      // for, and the only state in which "read one relay" is true on screen.
      { toggleOthers: { container: '[data-tour="damus-relay-filter"]', keep: 'wss://gardening.relay.town', gap: 120 } },
      { reveal: { container: '[data-tour="damus-relay-filter"]', text: 'wss://gardening.relay.town' } },
      { sleep: 1500 },
      // CLOSE THE SHEET AND SHOW THE FEED. Ending on a settings sheet leaves the
      // whole point unproven — the viewer never sees that the feed behind it
      // actually changed. The counter in the section header ("N of M") is the
      // evidence, and it only exists because the filter really narrows the pool.
      // y=110 of a 775pt viewport: the sheet is a 68% bottom detent, so anything
      // above ~250 is scrim. Aiming at the scrim's own centre hits the panel.
      { clickAt: { x: 215, y: 110 } }, { sleep: 3400 },
    ],
    // The clip ends on the FEED, so the relay's own name is no longer on screen —
    // real Damus does not label a feed with the relay carrying it, and adding
    // such a label would be our invention. The relay is asserted mid-flow
    // instead: `reveal` throws if that row is not in the sheet.
    //
    // UPPERCASE on purpose — the header is styled `uppercase` and Chrome's
    // innerText reports text as RENDERED, so the source spelling never matches.
    expect: ['ALL RECENT NOTES'],
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


/** Same signature the capture functions below already call. */
function withBrowser(debugPort, loop, fn) {
  return withChrome({ id: loop.id, debugPort, workDir: WORK, chrome: CHROME }, fn);
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
async function runSteps(page, steps, onStep, marks, t0) {
  for (const step of steps) {
    onStep?.(Date.now());
    // `{ mark: 'name' }` stamps a phase boundary from inside a step list, so the
    // cut can give one beat its own speed. Used for `typed`: the address being
    // entered is the one thing in the tail a viewer has to READ, and at the
    // tail's overall 1.95x it went by in 1.4s for 25 characters.
    if (step.mark) { if (marks) marks[step.mark] = Date.now() - t0; }
    else if (step.sleep) await sleep(step.sleep);
    else if (step.key) await page.pressKey(step.key);
    else if (step.type) await page.typeText(step.type, T.perChar);
    else if (step.click) await page.click(step.click);
    else if (step.clickAt) {
      // Explicit viewport coordinates, for targets whose BOX is not where you can
      // actually hit them. A sheet scrim is `absolute inset-0`, so `click()` aims
      // at the centre of the screen — which is the sheet panel sitting on top of
      // it. The dismiss never fired and the clip ended on the sheet it was meant
      // to close.
      await page.moveCursor(step.clickAt.x, step.clickAt.y, { settle: 300 });
      await page.clickAt(step.clickAt.x, step.clickAt.y);
    }
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
        // Short settle on purpose: twelve of these is the longest and most
        // repetitive stretch in the clip, so every 100ms here is 100ms the cut
        // has to squeeze out of the beats that matter.
        await page.moveCursor(x, y, { settle: 120 });
        await page.clickAt(x, y);
        await sleep(step.toggleOthers.gap ?? 220);
      }
    }
  }
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
  // From here on the panel is scaffolding, not subject — see hideHostPanel. Only
  // for loops with a tail: the plain loops end while the tour is still up and
  // never reach the reopen.
  if (loop.afterTour) await page.hideHostPanel();

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
    // A mini-tour can END BY ITSELF here, and when it does ClientView reopens the
    // FAQ panel over the client — a flash the cut cannot remove, because it lands
    // INSIDE the ring phase rather than in the stretch between `dismiss` and
    // `typing2`. Shortening the hold was not enough: on damus-relay-feed the
    // panel came back ~2s before the mark either way.
    //
    // So for a loop with a tail, phase D ends the instant the last ring settles.
    // `dismiss` is stamped HERE, before the hold, and everything after — the
    // hold, the self-ending tour, the reopened panel, the two Escapes — falls
    // into the stretch the cut drops. The last frame of D is the settled ring,
    // which is the frame that phase wanted anyway.
    if (step === loop.steps && loop.afterTour) marks.dismiss = Date.now() - t0;
    await sleep(step === loop.steps ? (loop.holdLast ?? T.holdLastStep) : T.holdStep);
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
    // `dismiss` is already stamped — the ring loop does it the moment the last
    // ring settles, so this whole clean-up sits inside the dropped stretch.
    marks.dismiss ??= Date.now() - t0;
    // Escape until the host panel is ACTUALLY gone, not a fixed two presses.
    //
    // Two was a guess that held only while the tour ended before the harness got
    // here. When the tour self-ends AFTER the second Escape, ClientView reopens
    // the FAQ panel and nothing closes it again — so the tail began with the
    // panel over the client, and no amount of cutting phase D could hide it,
    // because the flash was at the START of phase E. Verified: the panel was
    // still up 2s into the tail.
    for (let i = 0; i < 4; i++) {
      await page.pressKey('Escape');
      await sleep(900);
      const open = await page.eval(`!!document.querySelector('[data-sandstr-modal], .tour-overlay')`);
      if (!open) break;
      if (i === 3) throw new Error('FAQ panel / tour would not close before the tail');
    }
    // Run the FIRST tail step, THEN stamp `typing2`.
    //
    // Anything earlier is a promise rather than a fact: the tour can self-end
    // after the Escape loop has already confirmed a closed panel, and ClientView
    // slides the FAQ back over the client at exactly the moment phase E begins.
    // Trimming the end of D did not help, because the flash was on the other side
    // of the join. The first step is a click INTO the simulator — it can only
    // succeed with the panel gone, so stamping after it means the cut swallows
    // every last frame of the clean-up, however late the tour gets around to it.
    const [firstStep, ...restSteps] = loop.afterTour;
    await runSteps(page, [firstStep], undefined, marks, t0);
    marks.typing2 = Date.now() - t0;
    await runSteps(page, restSteps, undefined, marks, t0);
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


// --------------------------------------------------------------------- main --
async function main() {
  const wanted = process.argv.slice(2);
  const loops = wanted.length ? LOOPS.filter((l) => wanted.includes(l.id)) : LOOPS;
  const switches = wanted.length ? SWITCHES.filter((s) => wanted.includes(s.id)) : SWITCHES;
  const tours = wanted.length ? TOURS.filter((t) => wanted.includes(t.id)) : TOURS;
  const scripts = wanted.length ? SCRIPTS.filter((x) => wanted.includes(x.id)) : SCRIPTS;
  if (!loops.length && !switches.length && !tours.length && !scripts.length) throw new Error(`no such loop: ${wanted.join(', ')}`);

  await mkdir(WORK, { recursive: true });
  const { server, port } = await serveDist(DIST);
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
