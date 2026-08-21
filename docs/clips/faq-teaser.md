# FAQ teasers — beat sheet (cut #2)

Second cut in the sandstr promo series. Where `build-teaser.sh` sells
**capability** ("eight clients, open one, zap, DM"), this one sells **utility**:
a question somebody actually types, the answer, and the answer running in the
real interface.

Pattern, three times per cut: **pain phrase → answer → the simulator points at it.**

```
capture-faq.mjs      # headless Chrome over CDP -> .work/faq/<id>.mp4 + marks.json
build-teaser-faq.sh  # those loops -> out/sandstr-faq-*.mp4
```

## Two cuts, three loops each

Three loops can carry a thesis; six are a list.

**A — "Every client is different."** The client is not what you expect.

| # | client | typed | answer | ring lands on |
|---|---|---|---|---|
| 1 | Damus (iOS) | `no heart` | Why the like button is a 🤙 | the shaka in the action row |
| 2 | Nostur (iOS) | `nothing loads` | What the turtle is | turtle → paused media → back |
| 3 | Wisp (Android) | `cancel my post` | The undo countdown | "Post now (10)" pill |

**B — "It is not the app. It is Nostr."** The surprise is the protocol.

| # | client | typed | answer | ring lands on |
|---|---|---|---|---|
| 1 | Coracle (**web**) | `block someone` | Coracle mutes, it does not block | the mute rows in Content Settings |
| 2 | Amethyst (Android) | `nobody sees my notes` | You write to relays | Relays row → outbox group |
| 3 | Damus (iOS) | `share my profile` | Your npub is your address | the npub row |

A **client switch** sits between loops: the switcher sheet opens, another client
mounts. It is the one wordless shot that says these are all one tab. Cut B opens
on Coracle because that is the single desktop capture — a switch shot is a
phone-viewport shot, so it can only bridge phone loops.

## Rules this cut is built on

- **The tour's own tooltip is hidden at capture.** It carries "1 / 2", Prev /
  Next / Skip and a progress bar; on a phone card that is 30-45% of the frame,
  louder than the client underneath, and it reads as a demo of our onboarding
  widget rather than of the app. The ring stays, the words move to the caption.
- **Minimum words.** One line while the query is typed, nothing while the answer
  is on screen (the answer card is legible by itself), one line over the
  spotlight. Captions are capped at 28 characters and the build refuses to run
  over that — `drawtext` neither wraps nor shrinks, it just runs off the frame.
- **Typing plays at 1.0x.** It is captured at 110ms/char and never sped up. An
  earlier cut gave the whole opening one multiplier and the query appeared at
  ~12ms/char; it read as fake before anything else registered. Opening the
  panel, the wait before the demo, and nothing else, are compressed.
- **The caption over a spotlight describes exactly what the ring contains**, and
  the pain phrase is a user's situation, never a defect claim about someone's
  app — these are the teams we are asking for consent.
- **The disclaimer is redrawn on every beat**, end card included, on top of the
  in-app SIMULATION strip that is already inside the capture.

Troubleshooting entries stay out: all 56 are text-only by design (the simulator
cannot stage a failure), so a "crashing app" beat would have to cut from a
failure to a healthy screen.

## Capture notes worth keeping

- **Phone loops: 430 × 775 CSS @ DPR 2 = 860 × 1550 native**, exactly the card
  size, so nothing is rescaled. 430px also keeps us under the `max-width: 639px`
  branch — the one where the FAQ panel is a bottom sheet and the client is
  full-bleed.
- **Coracle: 1280 × 1000 @ DPR 2.** Frameless clients are `gated` below 640px
  and render no FAQ affordance at all. 1000 tall rather than 720 because its
  mute rows sit ~930px down Content Settings and the tour's scroll-into-view
  does not reach inside that screen's own scroll container (open engine bug,
  filed with the anchor sweep) — a taller window puts the target on screen
  honestly instead of filming a ring the viewer would never see.
- **Frames are capped at 1600px on the long side.** A desktop capture is 5MP per
  frame and the screencast starves at that size: one Coracle run produced 24
  frames and stopped emitting before the demo started.
- One Chrome **per loop**, and the screencast is never stopped inside one.
  Reusing a browser dries the stream up after the first loop, and
  `Page.bringToFront` makes it worse — it flips the very tab you are driving to
  `visibilityState: 'hidden'`.
- **The capture line now divides by the DRIVER's window, so its fps is not
  comparable with anything written down before 2026-08-21.** It used to divide by
  the span of the frames that survived, which quietly excluded the silence at
  either end: one switch printed `18 frames, 1.3s, 13.8 fps` while a third of the
  beat had no frames at all. Read `hole 610ms@3.1s` first — size and offset of the
  longest silence — and the frame count second. A healthy switch is 35-48 frames.
- **A switch that ENDS on a continuously animating client costs about twice as
  much per frame, and that is the client being faithful.** Wisp's splash bobs its
  glyph forever (`docs/refs/wisp/screen-map.md`: bob ±8dp/1.2s + sway ±3°/2.4s,
  verified against recording frames), and a `Page.captureScreenshot` mostly waits
  for the next surface frame. Suppressing that one animation puts the same
  viewport back on 67 ms a shot — identical to a still client. Never touch a
  simulator to make a recording faster; the harness carries the cost instead
  (`MAX_INFLIGHT` in `startPool`).

## Tour teaser (the opposite rules to the FAQ clips)

`capture-faq.mjs` carries a separate `TOURS` table: it lands on `/c/<client>?tour=1`
and lets the tour drive. Two decisions are deliberately **inverted** from the FAQ clips.

- **The tour tooltip stays on top.** In the FAQ clips it is hidden, because there it
  is our chrome sitting on somebody else's app. In a "take the tour" post the card IS
  the product being advertised — the viewer should see it drive itself, step counter
  and all.
- **No captions.** The note above the video carries the words, the card in frame
  carries the rest.
- Modest pace (12s for five steps): the card has to be READABLE, which is the entire
  claim the clip is making.
- The clip is recorded through **the same link that goes in the note**, so it doubles
  as proof that the link does what it promises.

## The cursor points, it never covers

The cursor parks **outside the ring's bottom-right corner** (+16px, clamped to the
viewport). It used to park dead centre, where a 22px dot hid a 40px zap icon — the
exact thing the caption was naming. Without the tour tooltip nothing else in frame
says "look here", so the cursor earns its place; it just must not sit on the subject.

## Filming finds bugs nothing else does

Every time we filmed the product, real defects fell out: anchors framing whole
screens instead of controls (FAQ demos), no scroll to a target that mounts late
(Nostur, Coracle), and on the Wisp tour three at once — including a step that **lost
its entire body text** at 430px. No test catches that, because nothing else measures
whether the words fit in the card.

Practical rule: **look at the frames before anything ships.** A suspicious frame is
sometimes a transition artifact — measure the same thing live in the browser before
calling it a bug. One alarm here was false (a card "cut in half" mid-transition), one
was real, and they looked identical.

## Outputs

| file | what |
|---|---|
| `out/sandstr-faq-a.mp4` | cut A, ~35s |
| `out/sandstr-faq-b.mp4` | cut B, ~34s |
| `out/sandstr-faq-<loop>.mp4` ×6 | one question each, 9-11s |
| `out/sandstr-faq-hero.mp4` | loop 1, no captions, for the landing page |

The per-question clips are the point of the format, not a by-product: each one
answers something people search for, so each has somewhere to be posted.

Outputs are gitignored — they rebuild from the captured loops in about a minute.
