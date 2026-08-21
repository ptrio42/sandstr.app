# Comparison teaser — beat sheet (cut #3)

Third cut in the sandstr promo series. Cut #1 sells **capability** ("eight
clients, open one, zap, DM"). Cut #2 sells **utility** (a question somebody
types, the answer, the answer running). This one sells the thing nothing else
on the site can do: **your post, unchanged, rendered by eight interfaces.**

Doing that for real needs eight devices and eight accounts. Here it is one tab.

```
capture-compare.mjs      # one continuous take -> .work/compare/compare.mp4 + marks.json
make-bed.mjs             # the music bed, synthesised -> .work/compare/bed.wav
build-teaser-compare.sh  # take + bed -> out/sandstr-compare.mp4 (+ -mute.mp4)
```

```bash
npm run build
node docs/clips/capture-compare.mjs   &&               ./docs/clips/build-teaser-compare.sh
SWITCH=arrows node docs/clips/capture-compare.mjs && SWITCH=arrows ./docs/clips/build-teaser-compare.sh
```

**Two variants, one grid.** They differ only in how the shelf is walked:
`sheet` opens the bottom sheet and picks a tile (two taps, and the sheet covers
55% of the screen); `arrows` uses the compact bar's prev/next arrows (one tap,
no sheet). Both are 16 bars and share the same bed — the arrows buy each client
time back from the transitions (2.2s + 0.8s instead of 2.0s + 1.0s), so the
section boundaries the music is written to do not move.

**Whole frames or it is not 16 bars.** Every beat target must be an integer
number of frames at 30fps, and the build now refuses one that is not. The first
arrows cut used 0.75s + 2.25s, which is 22.5 and 67.5 frames; both rounded up,
the four transitions and four client beats each gained a frame, and the film ran
4 frames past the bed. Every assert passed anyway — `CUM` sums the decimal
targets, and `-shortest` trims the muxed file back to the music, so the drift was
invisible in both. The picture is now counted before the mux.

`NOTE='your text #tag' node docs/clips/capture-compare.mjs` changes what gets
typed. Keep it near 40 characters: it types at 1.0x and every character is
screen time before the cut has said anything.

## The beats

**The cut is 16 bars at 120 BPM.** Bar = 2.0s, total 32.0s, and the bed
(`make-bed.mjs`) is written to the same map. Every beat is encoded with
`-frames:v` at exactly `target x 30` frames, so nothing accumulates the ~30ms of
rounding `-ss`/`-to` leaves behind: sync is by construction, and the build
asserts the total before it muxes.

| beat | s | ends | what is in frame |
|---|---|---|---|
| open | 2.0 | 2.0 | Damus feed, the pointer opens "Preview your note" |
| typing | 4.5 | 6.5 | the note typed into the sheet, **1.0x**, untouched |
| apply | 1.5 | **8.0** | "Show it" — the sheet closes |
| damus | 2.0 | 10.0 | the note on top of the Damus feed: purple hashtag, 🤙 where other clients put a heart |
| switch | 1.0 / **0.8** | — | the switcher sheet at ~2.4x — or, in the arrows variant, a cursor flick and a hard cut |
| amethyst | 2.0 / **2.2** | 13.0 | same note, same author, same counters — different action row |
| yakihonne | 2.0 | 16.0 | the only light card in the cut; hashtag as a blue chip with an external-link glyph |
| wisp | 2.0 | 19.0 | orange hashtag, ₿ where the others put a lightning bolt |
| nostur | 2.0 | 22.0 | teal, an inline Follow, a repost header |
| hop | 2.0 | **24.0** | out through the shelf to `/compare` at ~3x — the one beat that says this is a site |
| cards | 2.0 | 26.0 | the side-by-side strip, first cards |
| pan | 5.0 | 31.0 | **the payoff**: a slow pan past all eight, one column |
| tail | 1.0 | 32.0 | rest on the last cards |

Two moments are load-bearing and both are exact:

| s | picture | music |
|---|---|---|
| **8.0** | the note appears on the first feed | the kit enters (measured: -34.4 dB → -14.0 dB) |
| **24.0** | the cut from the phone to the strip | the drop (-13.7 dB → -18.9 dB) |

The drop belongs on the CUT, not on the pan after it. A first pass put it two
seconds later and it landed on a shot the viewer had already read.

Total 32.0s, 1080x1920.

## Rules this cut is built on

- **No captions.** The words live in the note it is posted with. What stays
  burned in is the series furniture — brand lockup, `sandstr.app`, and the
  disclaimer strip, which is not optional and is redrawn on every beat.
- **It has to read silent.** The bed is synced, but most people scroll muted and
  cuts #1 and #2 are silent outright. The rhythm is carried by the cutting; the
  music agrees with it rather than carrying it. `-mute.mp4` ships beside the
  scored version for exactly that reason.
- **The bed is synthesised, not licensed** (`make-bed.mjs`, ~200 lines of Node,
  no deps, no samples, deterministic). This is promotional material posted under
  the owner's name: a generated bed carries no licence, no attribution and no
  takedown risk. It is also why the source is a script — media in `docs/clips`
  is never committed.
- **The typing plays at 1.0x** (110ms/char), the same rule cut #2 arrived at:
  text appearing at ~12ms/char reads as fake before anything else registers.
- **The client is on screen longer than the sheet that reached it.** The first
  take had the ratio backwards — 2.4s of switcher against 1.5s of client — and
  it read as a demo of our switcher rather than of their apps.
- **Same frame furniture as the other two cuts.** 1080x1920 canvas, 860x1550
  card at 110,200, the ambient blurred backdrop, the footer. The capture
  viewport is chosen to equal the card, so nothing in the phone beats is
  rescaled.

## The rule the whole cut depends on

**One page load for the entire take.**

`src/data/mock` builds its bank with unseeded `Math.random()` at module init —
15 call sites across `notes.ts`, `threads.ts` and `generator.ts`. Every page
LOAD therefore invents a different author, different counters and a different
repost source for the very note the cut claims is the same one. Two loads
minutes apart gave *Writer Wendy · 3/3/31 · via Gossip* and *CodeWiz · 3/10/61 ·
via Coracle*.

Filmed as eight navigations, the viewer sees a different person in every cut and
the thesis dies in the second beat. So the take navigates once and then moves
with the app's own SPA navigation: the client switcher (`useNavigate`), the
rail's "All clients", the gallery's `/compare` link. The mock module stays in
memory and the note is frozen for the whole take.

The bonus is that the claim becomes literally true — it really is one tab.

## Measured facts the capture is built on

- **Only the first client needs its login wall clicked.** After that the host's
  screen intent (`sandstr-screen` / `readScreenIntent`) carries "you were on the
  feed" across switches, so every later client mounts on its feed with the note
  already on top. No onboarding detours mid-cut.
- **Primal, Snort and Coracle cannot appear in the phone run at all.** They are
  web clients and `ClientView` gates frameless clients below 640px; at 430px
  they render no client and no FAQ affordance. They appear in the `/compare`
  strip instead, which is fluid and renders every client's card at any width.
  This is why the rhythm section is five clients and the payoff is eight.
- **The landing pill is announced ON ARRIVAL, and it has to be.** Stepping is
  the only way into a client that never names where it sends you, so
  `ClientSwitcher` flashes the client's glyph and name for 1.8s at phone width.
  Announcing it at the TAP is impossible on camera: the frames between the tap
  and the new client appearing are frames the main thread spends loading that
  client's chunk and mounting it, so nothing new rasterises. Filmed at 30fps the
  pill first reached the screen 1000-1400ms after the tap however it was
  scheduled, `flushSync` included — a synchronous commit cannot conjure a paint
  out of a blocked thread. Triggered on arrival, the whole 1.8s is on screen.
  It is solid with a ring in the client's own `primaryColor`: the first version
  was a translucent dark pill, which is invisible on the six clients that
  default to a near-black feed, and read in exactly one sampled frame — the one
  that happened to land on a bright image.
- **The welcome toast is now IN frame, and that reverses a rule on purpose.**
  Amethyst is the only one of these five that greets you on mount. The capture
  used to wait its 2.5s out, which meant the montage discarded the 2.7s after
  every mount — and that window is exactly where the pill lives, so Amethyst was
  the one switch with no announcement. A toast in the corner of a beat the
  viewer has just arrived in is honest; the same toast frozen into a still share
  card is an artifact, so `scripts/og-client-cards.mjs` still waits (CLAUDE.md,
  Gotchas). The two media get different answers.
- **The arrows walk exactly the PHONES list, and that is not a coincidence.**
  `ClientSwitcher.step` skips clients that cannot render at the current width,
  so on a phone the registry order (damus, amethyst, **primal, snort**,
  yakihonne, **coracle**, wisp, nostur) collapses to the five framed ones.
  Without that skip the arrows variant would have filmed three
  `DesktopClientGate` screens in a row. The capture still asserts the landing by
  name on every step, so a reordered registry fails the run instead of quietly
  filming the wrong client.
- **`/compare` at 430px lays the strip out in ONE column**, ~1860px of cards —
  which is what makes the payoff a vertical pan rather than a grid. At ~830px it
  is two columns and the whole strip fits one 9:16 frame; that framing is
  available if a future cut wants it, but it needs a second viewport and the
  take can only have one.
- **A client mounted by the switcher fires a 2500ms welcome toast** over the
  feed. The capture marks `mount:` when the note is readable and `feed:` after
  the toast has expired; the montage cuts the transition on the first and the
  client beat on the second, so the toast window belongs to no beat and never
  reaches the film. Cutting straight through it also drove the switcher beats to
  6x, which is a blur rather than a glimpse.

## Known, and deliberately not fixed

**YakiHonne shows a different author.** Two clients keep their own hardcoded
feed arrays instead of the shared bank (`yakihonne/data.ts`, `primal/web/data.ts`)
and register a preview target of their own, so the note lands on top of *their*
first note, with *their* author. In the phone run four clients say "Garden
Grace" and YakiHonne says "Prairie2100".

It is real product behaviour rather than a capture artifact, the text is
identical, and YakiHonne is the most visually distinct beat in the cut (the only
light card). Changing it means touching a simulator's data module to satisfy a
video, which is the wrong way round. Worth knowing before someone reports it as
a bug in the cut.

## Outputs

| file | what |
|---|---|
| `out/sandstr-compare.mp4` | 1080x1920, 32.0s, ~7 MB — sheet variant, picture + bed |
| `out/sandstr-compare-mute.mp4` | same picture, no audio |
| `out/sandstr-compare-arrows.mp4` | arrows variant, picture + bed |
| `out/sandstr-compare-arrows-mute.mp4` | same picture, no audio |

Outputs are gitignored and rebuild from the captured take in about a minute.
