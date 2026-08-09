# FAQ teaser — beat sheet (cut #2)

Second cut in the sandstr promo series. Where `build-teaser.sh` sells **capability**
("eight clients, open one, zap, DM"), this one sells **utility**: a question someone
actually types, the answer, and the answer running in the real interface.

Pattern, four times: **pain phrase → answer → the simulator points at it.**

Status: scenario approved-pending. Nothing captured yet.

---

## Why these four questions

Every query below was measured against the shipped ranking (`score()` in
`FaqPanel.tsx`) on 2026-08-09: each lands its entry at **#1**, and each of those
entries **has a `showMe`**, so the third beat is the product working, not a
recreation. The four `searchAliases` sets that make the pain phrasings findable
landed in `86be0c3`.

The `Troubleshooting` class is deliberately **not** used here. Those 56 entries are
text-only by design (the sim cannot stage a failure), so a "crashing app" beat would
have to cut from a failure to a healthy screen — the exact caption-vs-spotlight
failure the FAQ review spent itself killing. Related discipline, non-negotiable:

- The **pain phrase is the user's situation**, never a defect claim about someone's
  app. "Nobody sees my notes" is a Nostr fact (relays), not "Amethyst is broken".
  We are asking these teams for consent; the teaser is part of that first impression.
- A caption over a **spotlight** must describe exactly what the ring contains, and is
  quoted from the step's own `title`/`content`. Captions over the **answer card** may
  narrate, but every claim traces to that entry's text.

## The four loops

| # | client | typed into FAQ search | entry that opens | demo (steps) |
|---|---|---|---|---|
| 1 | Damus (iOS) | `lost my phone` | Where do I find and back up my private key (nsec)? | drawer → **Settings** → **Keys** (2) |
| 2 | Amethyst (Android) | `nobody sees my notes` | How do I add or remove relays? | drawer → **Relays** row → relay settings (2) |
| 3 | Primal (**web**) | `tip someone` | How do I zap (tip sats to) a note? | **zap**, 2nd action in the footer (1) |
| 4 | Nostur (iOS) | `nothing loads` | What is the turtle icon in the top bar? | **turtle** → paused media → back off (3) |

Order is deliberate: the most universal fear first (an account you think you lost),
the protocol lesson second, the web client third so the rhythm breaks before it sets,
and the turtle last because it is the only beat where the screen visibly changes twice
— and because a detail that specific is the fidelity argument, made without a word.

---

## Beat sheet

Each loop is three beats on one continuous shot: the sheet slides up, the answer
expands, the sheet closes and the spotlight runs. No cut inside a loop.

**0 · Intro — 2.5 s**
Four client opening screens, ~0.6 s each (reuse `shots/*.png`).
Caption: *Four questions. Four apps. Nothing installed.*

**1 · Damus — 8 s**
- 1a (2.5 s) FAQ sheet up; `lost my phone` types out; one result.
  Caption: *"Lost my phone. Is my account gone?"*
- 1b (2.5 s) entry expands — three steps plus the italic note.
  Caption: *Your key **is** your account.* — quoted from the entry's note.
- 1c (3 s) Show me → drawer → spotlight **Settings** → spotlight **Keys**.
  Sub: *Settings → Keys is where you back up your nsec.*

**2 · Amethyst — 8 s**
- 2a (2.5 s) `nobody sees my notes` → top hit is the relay entry.
  Caption: *"Nobody sees my notes."*
- 2b (2.5 s) answer expands.
  Caption: *You don't post to a network. You post to relays.*
  (grounded in `trouble-not-delivered.howNostrWorks`)
- 2c (3 s) Show me → drawer, spotlight the **Relays** row and its connected count →
  the grouped relay screen.
  Sub: *The Relays row shows connected out of total.*

**3 · Primal — 7 s** · the only landscape beat; label it *Web clients too.*
- 3a (2 s) desktop window, FAQ drawer, `tip someone` → one result.
  Caption: *"How do I tip someone?"*
- 3b (2 s) answer expands.
  Caption: *It's called a zap.*
- 3c (3 s) Show me → spotlight the **zap** in the note footer.
  Sub: *Second action, before the heart — the number is total sats.*

**4 · Nostur — 9 s**
- 4a (2 s) `nothing loads`.
  Caption: *"Nothing is loading."*
- 4b (2 s) answer expands: *What is the turtle icon in the top bar?*
  Caption: *There is a turtle in the toolbar.*
- 4c (5 s) Show me → spotlight the dimmed **turtle** → toggled on, media becomes
  "Loading paused / Load anyway" → toggled back off, media returns.
  Sub 1: *Low Data Mode — dimmed when off, lit when on.*
  Sub 2: *Media pauses. The text still loads.*

**5 · End card — 3.5 s**
Identical to cut #1 (lockup, *try Nostr / no keys, no install*, `sandstr.app`,
disclaimer) so the two read as one series.

Total ≈ 38 s.

---

## Frame and capture

Layout constants, ambient backdrop, rounded card, lockup and `chrome()` are inherited
from `build-teaser.sh` unchanged — same series, same furniture. **`chrome()` must keep
drawing the disclaimer on every beat, end card included.** It is redundant here (the
in-app strip is inside the capture at the top of every framed shot) and it still stays.

**Framed clients (Damus, Amethyst, Nostur).** Capture viewport **430 × 775 CSS @ DPR 2
= 860 × 1550 native** — exactly `CARDW × CARDH`, so the card is pixel-for-pixel with no
rescale. 430 px keeps us under the `max-width: 639px` branch, which is what turns the
FAQ panel into the bottom sheet this cut is built around, and renders the client
full-bleed with the SIMULATION strip on top.

**Primal.** Frameless clients are `gated` below 640 px (no FAQ affordance at all), so it
is captured at **1280 × 720 CSS @ DPR 2** and composed as the landscape card
(`LW/LH/LX/LY` in the existing script). Two crops in this beat: a punch-in on the
drawer for 3a–3b, the landscape window for 3c.

**Driver.** Headless Chrome over CDP, no npm deps, against `npm run build` output served
from `dist/` on a free port — never `npm run dev` (other sessions hold 5173 and the CPU
contention alone tripled a previous run). Four rules that cost time last time:

1. `Page.startScreencast`, never a `captureScreenshot` loop; ack every frame.
2. Timestamp frames on **arrival**, not from `metadata.timestamp`.
3. Poll for `.tour-spotlight` before advancing a demo beat — a mini-tour needs ~1–1.5 s
   to mount its screen, and the tooltip renders centred with no ring until it does.
4. Inject a fake cursor (fixed div above z-9999) and move it with every synthetic event.

Determinism: clear `localStorage` per run (tour + progress keys), force dark theme,
type queries at ~55 ms/char, let the sheet's spring settle before the beat's hold frame.

## Outputs

| file | what |
|---|---|
| `out/sandstr-faq-teaser.mp4` | 1080×1920, ~38 s — the main post |
| `out/sandstr-faq-<client>.mp4` ×4 | 1080×1920, 7–9 s each — one question per clip, for replying to that exact question on Nostr |
| `out/sandstr-faq-hero.mp4` | loop 1, no captions, for the landing page / future `/faq/<client>` |

The four standalone clips are the point of the format, not a by-product: each one
answers a question people search for, so each has somewhere to be posted.

The grant video is a separate artifact and reuses these captures rather than this cut.
