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
