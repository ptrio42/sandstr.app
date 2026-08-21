# `public/media/` — the pictures the simulators show

Every image a simulator renders comes from this folder. **The filename is the contract**: drop a new
file over an old one and every client that shows it changes, with no code edit anywhere.

- Generic post photos: `photo-01.webp` … `photo-16.webp`, handed out round-robin by
  `getSampleImages()` in [`src/data/mock/utils.ts`](../../src/data/mock/utils.ts). Eight simulators,
  31 call sites.
- Boris article covers: `boris/<article-id>.webp`, named per article in
  [`src/simulators/boris/borisData.ts`](../../src/simulators/boris/borisData.ts). A reader's card is
  mostly its cover, so these carry meaning and cannot be interchangeable.

**What is here today are placeholders** — flat two-stop gradients generated with ffmpeg, the same look
the old inline-SVG data-URIs had. They exist so nothing 404s and so the real artwork is a pure file
swap. Replacing them is the job this file briefs.

## Hard rules

These are not style preferences. Each one exists because the images are shown inside faithful
reproductions of other people's apps, attributed to invented people.

1. **No recognisable real person.** No identifiable faces at all — not a stock model, not a crowd
   close-up. Every picture here is rendered as *something an invented persona posted*, so a real face
   would put invented words in a real mouth. Distant, back-turned or cropped figures are fine.
2. **No real brand, logo, wordmark or legible signage.** Not on a cup, a shopfront, a laptop lid or a
   book spine. If a shot needs a label, it must be unreadable or invented.
3. **No readable headline text baked into the image.** The UI supplies every title. A cover that
   carries its own headline will contradict the card next to it. Abstract typographic *texture* is
   fine; a sentence is not.
4. **Nothing that dates or places itself.** No timestamps, no number plates, no street names.
5. **Ours to ship.** Generated or owned outright, so `THIRD-PARTY.md` needs no per-file licence row.
   If any image is not ours, it does not go in this folder — tell me instead and we will record it.

## Technical spec

| | |
| --- | --- |
| Format | WebP, quality ~78 |
| Size | **1200 × 900** (4:3) |
| Weight | ≤ 120 kB each; the whole folder should stay under ~3 MB |
| Colour | sRGB |
| Transparency | none — these are photographs, they fill the frame |

**Composition constraint, and it is the one that bites.** The same file is cropped three ways:

- a **140 × 140 square** on Boris's Home carousel (centre crop),
- a **72 × 72 square** thumbnail in list rows,
- a **full-width hero**, roughly 16:9, in the Boris reader.

So: keep the subject **centred and away from the edges**, and do not rely on anything in the outer
15 % of the frame. A composition that only works letterboxed will lose its subject on the card.

**Two backgrounds.** Every image sits on `#18181B` (dark) or `#F4F1EA` (warm paper). Avoid near-black
and near-white edges — both make the card's rounded corner disappear into the page. Mid-tone,
slightly desaturated images read best in both.

## `photo-01` … `photo-16` — generic post photos

Pictures an ordinary person attaches to a short social post. Everyday, unstyled, a bit imperfect.
Think "phone camera", not "stock library". Sixteen distinct subjects, roughly:

| File | Subject |
| --- | --- |
| `photo-01` | a window seat on a train, landscape blurring past |
| `photo-02` | a workbench mid-project — tools, offcuts, a coffee going cold |
| `photo-03` | breakfast on a small table, overhead, homemade rather than plated |
| `photo-04` | a dog asleep in a patch of sun on floorboards |
| `photo-05` | a city street after rain at night, reflections, no legible signage |
| `photo-06` | a bookshelf corner, spines turned or blurred |
| `photo-07` | a mountain ridge at dawn, a walker small and distant |
| `photo-08` | a keyboard and notebook on a desk, top-down, screen off |
| `photo-09` | a harbour with small boats, flat grey water |
| `photo-10` | vegetables at a market stall, hands out of frame |
| `photo-11` | a bicycle leaned against a wall, long shadow |
| `photo-12` | houseplants on a windowsill, backlit |
| `photo-13` | a campfire at dusk, no faces |
| `photo-14` | snow on a bare hedge, close, shallow depth |
| `photo-15` | a half-finished cup of coffee beside an open notebook |
| `photo-16` | a rooftop skyline at golden hour, no landmark building |

## `boris/*` — article covers

Editorial covers for the invented articles in `borisData.ts`. These may be photographic **or**
editorial illustration; illustration probably reads better, because a reader app's covers are
usually commissioned art rather than snapshots. Muted, one idea per cover, legible at 140 px.

| File | Article | Brief |
| --- | --- | --- |
| `ferry-line.webp` | *The Library at the End of the Ferry Line* | a tiny island reading room: one radiator, one window, winter light. Warm interior against cold outside |
| `figure-reading-room.webp` | (inline figure in the same article) | the same room from a different angle, mid-afternoon, empty chairs |
| `infinite-scroll.webp` | *Against the Infinite Scroll* | a ruler or measuring tape that has no end — the piece is about a scroll bar that stops telling the truth |
| `commonplace-book.webp` | *Notes on Keeping a Commonplace Book* | a hand-ruled notebook page with copied-out lines, ink, two different pens |
| `read-a-river.webp` | *How to Read a River* | moving water over rock, the V-shapes a paddler reads; cold greens |
| `ninety-nine-cent-telescope.webp` | *The Ninety-Nine Cent Telescope* | a home-made cardboard-tube telescope on a tripod, night sky behind |
| `lighthouse-keeper.webp` | *What the Lighthouse Keeper Knew* | an open log book, a barometer, weather outside the glass |
| `slow-web.webp` | *The Slow Web Is Just the Web* | an old page layout — margins, a single column, nothing chasing you |
| `ninth-street-bakery.webp` | *The Bakery That Refuses to Grow* | forty loaves on a rack, one oven, morning light |

`everything-draft` has **no** cover on purpose: it exercises the coverless card, which falls back to a
tinted glyph. Do not supply one.

## When the files land

1. Drop them in, same names, same sizes.
2. `npm run build` — no code change needed.
3. `npm run og:cards` — the share cards photograph the simulators, so they need regenerating.
4. Click through one client per family (a feed client and Boris) in the preview to check the crops.
