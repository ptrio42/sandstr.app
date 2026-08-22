---
description: "Prerender, karty share i powierzchnia Cloudflare — kształt artefaktów, nie treść."
paths:
  - "scripts/prerender.mjs"
  - "scripts/verify-headers.mjs"
  - "src/entry-server.tsx"
  - "src/shareMeta.ts"
  - "wrangler.jsonc"
  - "workers/**"
  - "public/_headers"
---

# Build i deploy — zmierzone pułapki

- **Karta share to `dist/c/<id>.html`, NIGDY `dist/c/<id>/index.html`.** Cloudflare ma domyślnie
  `html_handling: auto-trailing-slash`: folder-index każe `/c/damus` zrobić 307 na `/c/damus/`,
  czyli przekierowuje dokładnie ten URL, który ludzie wklejają w odpowiedziach. Płaski plik
  serwuje `/c/damus` z 200, a to `/c/damus/` dostaje 307 z powrotem. Zweryfikowane na
  `wrangler dev`, nie z dokumentacji.

<!-- Wyjęte z sekcji Gotchas w CLAUDE.md 2026-08-21. Treść verbatim; zmienił się tylko moment ładowania. -->
