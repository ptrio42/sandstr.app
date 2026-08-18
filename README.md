# Sandstr

**Try Nostr clients in your browser — no keys, no install.**

Interactive, in-browser simulations of real Nostr clients, with guided tours and mock data.
No accounts, no real crypto, no relays — everything you see is computed in your browser. The one
server-side endpoint is `/api/unfurl`, which exists so a pasted note can show a link preview card
([PRIVACY.md](PRIVACY.md), `workers/index.ts`).

**Honest state of the shelf:** 8 reproductions are reference-verified and ready to try
(Damus, Amethyst, Primal, YakiHonne, Snort, Wisp, Coracle, Nostur — rebuilt screen by screen
against recordings of the real apps) and 2 more are clickable early previews (Gossip, Keychat). The
gallery labels each one accordingly. Every client on the shelf is a reproduction of a real
one — that is the whole point of the shelf.

**Preview your own note.** Paste a message into "Preview your note" on any client view (or open
`/c/<client>?note=<text>`) and it takes the top spot of that client's feed, so you can switch
clients and compare how each one wraps, truncates and links it. The text stays in the browser tab
(sessionStorage) and is never published. Length, wrapping, truncation, hashtags, links and an
attached image are rendered the way each reproduction does it, `nostr:` references resolve to a name
(or a shortened npub when nobody here knows them), and a link is unfurled into a preview card — in every client with a feed — via
the `/api/unfurl` Worker (`workers/index.ts`). Long-form markdown
is not rendered, and truncation is approximate outside Snort — see `src/data/mock/previewNote.ts`. An image you
attach from disk becomes a `data:` URL and stays in the tab; an image the note *links to* is
fetched by your browser from that host ([PRIVACY.md](PRIVACY.md)).

**Your place survives a client switch.** Leave Amethyst on Notifications, open Primal, and you land
on Primal's notifications — not on its sign-in wall. Clients share a small screen vocabulary (feed,
notifications, messages, search, profile, settings, relays, bookmarks) and map it to their own
names; anything a client doesn't have falls back to its feed. A **Start screen** button next to the
client name puts you back where that reproduction really opens. See
`src/simulators/shared/screenSync.ts`.

Every simulator is unofficial and unaffiliated; client names and designs belong to their
teams ([TRADEMARKS.md](TRADEMARKS.md)). Each view carries a permanent
"SIMULATION · mock data · unofficial" banner, and all identities in the mock feeds are
fictional.

## Stack

- **Vite 6 + React 19 + TypeScript** SPA (Astro dropped — every simulator was already a heavy
  client-side island, so Astro's island architecture bought nothing).
- **React Router 7** — one route per client (`/c/:id`) + a landing gallery (`/`).
- **Tailwind 3** (theme ported verbatim from the source) + **framer-motion** + **lucide-react**.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
npm run preview
npm run og:cards # regenerate the link-preview cards (needs a local Chrome; not part of build)
```

## How it was extracted

The feature is self-contained. These trees were copied verbatim, preserving `src/`-relative
paths so internal imports resolve unchanged:

- `src/simulators/` — the feature (shared foundation + all client reproductions)
- `src/data/mock/` — mock users/notes/threads/relays
- `src/data/tours/` — per-client guided-tour configs
- `src/components/tour/` — the tour engine
- `src/lib/progressService.ts`, `src/utils/cn.ts` — support utilities

The only new code is the host shell in `src/host/` (Layout, Gallery, ClientView) + `src/registry.tsx`
(which maps each client to its component + phone-frame, mirroring the original Astro pages exactly).
The 4 legacy/superseded simulators from the source repo (`interactive/damus`, `AmethystSimulatorDemo`,
`NostrSimulator`, `QuickstartSimulator`) were intentionally **not** carried over.

## Branding & trademark note

Faithfully reproducing other teams' branded clients (Damus, Primal, …) carries real
trademark/trade-dress risk, and the mitigation is **honesty plus consent, not evasion**:

- a permanent "SIMULATION · mock data · unofficial · not affiliated" banner on every client
  view (`ClientView.tsx`), with [TRADEMARKS.md](TRADEMARKS.md) and
  [THIRD-PARTY.md](THIRD-PARTY.md) recording exactly what was referenced vs. copied;
- the same notice **burned into every link-preview card** (`public/og/<id>.png`), because a
  shared card is the one surface that travels without the banner, the outbound link or the
  address bar. Each card does show the reproduction — but always inside a device we draw
  (a phone in perspective, a browser window addressed `sandstr.app/c/<id>`), never
  full-bleed, and always surrounded by sandstr's own chrome;
- every client view links out to the real client — the reproduction exists to send people
  *to* the teams whose work it depicts;
- the primary mitigation is **opt-in consent from each client's maintainers**, who can have
  any fidelity error fixed or the whole reproduction removed on request, no questions asked.

(Nostr Kitten, our own GeoCities-parody client, is **unlisted** as of 2026-08-05 — it is not a
real Nostr client, so it has no place on a shelf of reproductions. The code stays and
`/c/nostr-kitten` still opens it, as the easter egg it always was.)
