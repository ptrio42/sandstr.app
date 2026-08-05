# Sandstr

**Try Nostr clients in your browser — no keys, no install.**

Interactive, in-browser simulations of real Nostr clients, with guided tours and mock data.
No backend, no network, no real crypto — everything is static and computed in your browser
([PRIVACY.md](PRIVACY.md)).

**Honest state of the shelf:** 6 reproductions are reference-verified and ready to try
(Damus, Amethyst, Primal, YakiHonne, Snort, Wisp — rebuilt screen by screen against recordings
of the real apps) and 3 more are clickable early previews (Coracle, Gossip, Keychat). The
gallery labels each one accordingly. Every client on the shelf is a reproduction of a real
one — that is the whole point of the shelf.

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
- every client view links out to the real client — the reproduction exists to send people
  *to* the teams whose work it depicts;
- the primary mitigation is **opt-in consent from each client's maintainers**, who can have
  any fidelity error fixed or the whole reproduction removed on request, no questions asked.

(Nostr Kitten, our own GeoCities-parody client, is **unlisted** as of 2026-08-05 — it is not a
real Nostr client, so it has no place on a shelf of reproductions. The code stays and
`/c/nostr-kitten` still opens it, as the easter egg it always was.)
