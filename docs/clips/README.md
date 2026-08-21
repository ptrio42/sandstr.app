# docs/clips — promo cuts

Three cuts, one series. This file is cut #1; the other two have their own beat
sheets, and everything drives the same harness.

| cut | sells | scenario |
|---|---|---|
| #1 teaser | capability — eight clients, open one, zap, DM | this file |
| #2 FAQ | utility — a question, the answer, the answer running | [`faq-teaser.md`](faq-teaser.md) |
| #3 comparison | the thing nothing else does — one note, eight interfaces | [`compare-teaser.md`](compare-teaser.md) |

`harness.mjs` is the shared Chrome/CDP/recorder layer behind cuts #2 and #3.
Every helper in it carries the measurement and the failure it exists to prevent;
changing one changes both cuts, so smoke-test with
`node capture-faq.mjs sw-nostur-wisp` afterwards.

## Cut #1

Source recording plus the two scripts that turn it into something postable.

**Only the scripts and these notes are in git.** The recording, the stills and the
finished cuts are local files — a fresh clone has the pipeline but not the media,
and `build-teaser.sh` takes another source via `SRC=/path/to/recording.mov`.

```
Nagranie z ekranu 2026-08-5 o 22.07.56.mov   # 96s walkthrough: Wisp → Nostur → Primal (local)
capture-shots.sh                             # dev server → shots/*.png (headless Chrome, 2x)
build-teaser.sh                              # recording + shots → out/*.mp4 (ffmpeg only)
shots/                                       # one hero frame per client + the 6x brand lockup
out/                                         # what you actually post

harness.mjs                                  # shared: Chrome, CDP, frame pool, encode (cuts #2, #3)
capture-faq.mjs      build-teaser-faq.sh     # cut #2
capture-compare.mjs  build-teaser-compare.sh # cut #3
make-bed.mjs                                 # cut #3's music bed, synthesised (no deps, no samples)
```

## Output

| file | what it is |
|---|---|
| `out/sandstr-teaser-vertical.mp4` | 1080×1920, 28.5s, ~4 MB — the main post |
| `out/sandstr-loop-zap.mp4` | 1080×1920, 6s, ~0.8 MB — the zap on its own, for replies and quotes |

Both are silent (there is a silent AAC track for players that insist on one),
H.264 high / yuv420p / `+faststart`, so they inline in every Nostr client.

## The cut

| beat | source | caption |
|---|---|---|
| 1 | 8 client stills, ~0.33s each | Eight real Nostr clients. |
| 2 | Wisp feed opening | Open one. Nothing to install. |
| 3 | Wisp search + follow | Search. Follow. |
| 4 | Wisp zap 21 → 500 → sent | Zap 500 sats. |
| 5 | Wisp DM thread | Send a DM. |
| 6 | Nostur welcome → feed | Switch apps. Same tab. |
| 7 | Nostur settings, Low Data Mode | Down to the settings screen. |
| 8 | Primal web | Web clients too. |
| 9 | end card | try Nostr — no keys, no install / sandstr.app |

Only `status: ready` clients appear in the montage — Keychat and Gossip are
early previews and stay out, same axis the gallery sorts on.

## Non-negotiable

The recording frames the phone inside the host chrome, where the "SIMULATION ·
unofficial · mock data · not affiliated with X" banner lives. The video crops the
phone screen out of that frame, so the banner is **redrawn as a persistent footer
line on every single beat**, end card included. It is not decoration and it is
not optional — see the branding section of `CLAUDE.md`. If you re-cut this,
`chrome()` in `build-teaser.sh` is the one function that must keep drawing it.

## Re-cutting

Timings, crops and captions all live in the `SEGMENTS` / `MONT` tables at the top
of `build-teaser.sh`; the frame layout is the constants block above them. A full
rebuild is about 3 minutes.

```bash
./build-teaser.sh
```

The stills only need re-capturing when a client's opening screen changes.
