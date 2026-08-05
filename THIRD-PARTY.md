# Third-party attribution

sandstr reproduces the interfaces of ten real, open-source Nostr clients. This
file records, per client, **what was referenced and what was copied** — because
those are different things with different obligations, and being precise about
it is part of asking each team for their blessing (see [TRADEMARKS.md](TRADEMARKS.md)).

Everything below was verified against each project's own site and repository on
2026-07-29. Upstream URLs also live in `src/registry.tsx`, which is what renders
the "Get the real *X*" link on every client view.

## The distinction that matters

- **Referenced (facts).** Hex colour values, spacing, type sizes, the order of
  actions in a note footer, which tabs exist. These are functional facts about
  an interface, read from the client's own source and from screen recordings.
  Reading `DamusColors.swift` to learn that DamusPurple is `#CC43C5` is not
  copying expression.
- **Copied (expression).** Logo artwork and UI strings. This is where the actual
  obligation sits, and where we minimise: the reproductions are re-implemented
  from scratch in React, and no upstream source code is vendored into this repo.

**No upstream source code is included in sandstr.** Every screen is an
independent React re-implementation. Consequently the copyleft terms of Damus
(GPL-3.0) and Keychat (AGPL-3.0) are not triggered by this repository — we
derive no code from them. If that ever changes, this file changes with it.

## Per client

| Client | Upstream repo | Upstream license | Referenced | Copied |
| --- | --- | --- | --- | --- |
| [Damus](https://damus.io) | [damus-io/damus](https://github.com/damus-io/damus) | GPL-3.0 | `DamusColors.swift` tokens, `MainTabView`/`EventActionBar`/`SideMenu` structure, action order, gradients | app icon (`public/icons/damus.webp`), UI labels |
| [Amethyst](https://amethyst.social) | [vitorpamplona/amethyst](https://github.com/vitorpamplona/amethyst) | MIT | Material 3 token values, navigation structure, action order | app icon, UI labels |
| [Primal](https://primal.net) | [PrimalHQ/primal-web-app](https://github.com/PrimalHQ/primal-web-app) | MIT | `palette.scss` (Midnight/Ice), NavMenu + NoteFooter structure, three-column layout | app icon, UI labels, **logo swirl path** — see caveat |
| [Snort](https://snort.social) | [v0l/snort](https://github.com/v0l/snort) | MIT (© 2023 Kieran / v0l) | `packages/app/src/index.css` `@theme` tokens, nav + feed-picker structure, note action order, settings menu grouping and tile colours, UI label strings | app icon (`public/icons/snort.webp`), UI labels. **Not** the `nostrich_*.png` mark — deliberately replaced with our own monogram |
| [YakiHonne](https://yakihonne.com) | [YakiHonne/web-app](https://github.com/YakiHonne/web-app) | MIT | brand orange, navigation, settings/notification copy | app icon, UI labels |
| [Wisp](https://wisp.mobile) | [barrydeen/wisp](https://github.com/barrydeen/wisp) | MIT (© 2025 Barry Deen) | `Theme.kt`/`Themes.kt` tokens, `BottomBar`/`ActionBar`/drawer structure, action order, settings copy (verified against a 2026-07-30 recording — `docs/refs/wisp/screen-map.md`) | app icon (`public/icons/wisp.svg` — the `ic_wisp_logo.xml` glyph path + radial gradient), UI labels |
| [Coracle](https://coracle.social) | [coracle-social/coracle](https://github.com/coracle-social/coracle) | MIT | rough layout only (*Early preview*) | app icon |
| [Gossip](https://github.com/mikedilger/gossip) | [mikedilger/gossip](https://github.com/mikedilger/gossip) | MIT | rough layout only (*Early preview*); no website exists, so the handoff links the repo | app icon |
| [Keychat](https://keychat.io) | [keychat-io/keychat-app](https://github.com/keychat-io/keychat-app) | AGPL-3.0 | rough layout only (*Early preview*) | app icon |
| [Olas](https://olas.app) | [pablof7z/olas](https://github.com/pablof7z/olas) | MIT | rough layout only (*Early preview*) | app icon |

Nostr Kitten is not in this table: it is an original client of ours and
reproduces nobody's work.

## Open items, stated plainly

- **Primal logo swirl.** `docs/refs/primal/screen-map.md` records the SVG path
  and gradient stops as taken verbatim from Primal's `logo_blue.svg`. That is
  copied artwork and should be replaced with our own mark or kept only with
  Primal's consent.
- **Client icons.** `public/icons/` ships each project's real app icon. They are
  not byte-identical originals: each is downscaled to 128 px (the gallery draws
  them at 64) and re-encoded, four of them to WebP, purely to cut page weight —
  no recolouring, no redrawing. A monogram fallback already exists in
  `src/host/ClientGlyph.tsx`, so any team that prefers we not use their mark can
  be honoured immediately.
- **Olas copyright line.** Its `LICENSE.md` is MIT text but the copyright holder
  named in it is leftover `create-expo-app` boilerplate, not the Olas author.
  The SPDX id (MIT) is recorded above; the name deliberately is not. To be
  confirmed with the author, along with which repo backs the current build —
  `pablof7z/olas` was last pushed 2025-07 while `olas-nmp` looks like an
  in-progress, unlicensed rewrite.
- **Snort domain.** The GitHub repo's `homepage` field now points at
  `phoenix.social`, which serves a byte-identical build to `snort.social` while
  the PWA manifest still reads "snort.social". We link `snort.social` as the
  brand-correct URL; to be confirmed with the maintainer.
- **Gossip license detection.** GitHub reports `NOASSERTION` only because
  `LICENSE.txt` carries a modified header; the README states MIT explicitly, so
  MIT is recorded.

## Runtime dependencies

react, react-dom, react-router-dom, framer-motion, lucide-react, clsx,
tailwind-merge — all MIT. Build: vite, typescript, tailwindcss,
@tailwindcss/typography, tailwindcss-rtl. See `package.json`; run
`npm ls --omit=dev` for the resolved tree.

## Corrections welcome

If you maintain one of these projects and anything here is wrong — or you want
your icon, your name, or the whole reproduction removed — open an issue and it
will be corrected or removed, no questions asked.
