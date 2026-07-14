# Sandstr

**Try every Nostr client in your browser — no keys, no install.**

A standalone extraction of the "client simulators" feature originally built inside the
`nostrich.love` beginner guide. Interactive, in-browser simulations of 10 Nostr clients
(Damus, Amethyst, Primal, Snort, YakiHonne, Coracle, Gossip, Keychat, Olas + the original
**Nostr Kitten**), with guided tours and mock data. No backend, no network, no real crypto.

> **Status: extraction spike.** This is the first isolated build — it lifts the feature out of
> the Astro guide into a standalone Vite + React SPA and gets all 10 simulators rendering under
> their own shell. Polish, branding, and the trademark/permission motion are follow-up phases.

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

- `src/simulators/` — the feature (shared foundation + 10 clients)
- `src/data/mock/` — mock users/notes/threads/relays
- `src/data/tours/` — per-client guided-tour configs
- `src/components/tour/` — the tour engine
- `src/lib/progressService.ts`, `src/utils/cn.ts` — support utilities

The only new code is the host shell in `src/host/` (Layout, Gallery, ClientView) + `src/registry.tsx`
(which maps each client to its component + phone-frame, mirroring the original Astro pages exactly).
The 4 legacy/superseded simulators from the source repo (`interactive/damus`, `AmethystSimulatorDemo`,
`NostrSimulator`, `QuickstartSimulator`) were intentionally **not** carried over.

## Branding & trademark note

As a standalone, potentially-monetized product, faithfully reproducing other teams' branded
clients (Damus, Primal, …) carries real trademark/trade-dress risk that a free educational guide
did not. The intended direction is **owned-IP-first**: lead with the original **Nostr Kitten**
(and future generic-archetype clients), treat every real-branded simulator as strictly opt-in /
permissioned, and keep a persistent "simulation · unofficial · mock data" disclaimer on every
client view (already wired in `ClientView.tsx`).
