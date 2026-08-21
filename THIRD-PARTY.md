# Third-party attribution

sandstr reproduces the interfaces of eleven real, open-source Nostr clients. This
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
and Nostur (GPL-3.0) and Keychat (AGPL-3.0) are not triggered by this
repository — we derive no code from them. If that ever changes, this file
changes with it.

## Per client

| Client | Upstream repo | Upstream license | Referenced | Copied |
| --- | --- | --- | --- | --- |
| [Damus](https://damus.io) | [damus-io/damus](https://github.com/damus-io/damus) | GPL-3.0 | `DamusColors.swift` tokens, `MainTabView`/`EventActionBar`/`SideMenu` structure, action order, gradients | app icon (`public/icons/damus.webp`), UI labels |
| [Amethyst](https://amethyst.social) | [vitorpamplona/amethyst](https://github.com/vitorpamplona/amethyst) | MIT | Material 3 token values, navigation structure, action order | app icon, UI labels |
| [Primal](https://primal.net) | [PrimalHQ/primal-web-app](https://github.com/PrimalHQ/primal-web-app) | MIT | `palette.scss` (Midnight/Ice), NavMenu + NoteFooter structure, three-column layout | app icon, UI labels, **logo swirl path** — see caveat |
| [Snort](https://snort.social) | [v0l/snort](https://github.com/v0l/snort) | MIT (© 2023 Kieran / v0l) | `packages/app/src/index.css` `@theme` tokens, nav + feed-picker structure, note action order, settings menu grouping and tile colours, UI label strings | app icon (`public/icons/snort.webp`), UI labels. **Not** the `nostrich_*.png` mark — deliberately replaced with our own monogram |
| [YakiHonne](https://yakihonne.com) | [YakiHonne/web-app](https://github.com/YakiHonne/web-app) | MIT | brand orange, navigation, settings/notification copy | app icon, UI labels |
| [Wisp](https://wisp.mobile) | [barrydeen/wisp](https://github.com/barrydeen/wisp) | MIT (© 2025 Barry Deen) | `Theme.kt`/`Themes.kt` tokens, `BottomBar`/`ActionBar`/drawer structure, action order, settings copy (verified against a 2026-07-30 recording — `docs/refs/wisp/screen-map.md`) | app icon (`public/icons/wisp.svg` — the `ic_wisp_logo.xml` glyph path + radial gradient), UI labels |
| [Coracle](https://coracle.social) | [coracle-social/coracle](https://github.com/coracle-social/coracle) | MIT (© Jon Staab / hodlbod) | `.env.template` `VITE_DARK_THEME`/`VITE_LIGHT_THEME` colour tokens and `tailwind.config.cjs` naming, `MenuDesktop`/`Nav`/`Routes` shell structure, `NoteActions` action order, `RelayCard`/`RelayCardActions` anatomy, `Login`/`Onboarding`/settings copy (verified against a 2026-08-05 recording — `docs/refs/coracle/screen-map.md`) | app icon (`public/icons/coracle.webp`), UI labels. **Not** `wordmark-dark.png`/`logo.png` — the wordmark is set in type beside our own glyph. **Not** Font Awesome: every icon is re-drawn (`components/Icon.tsx`), so no FA artwork and no CC BY 4.0 obligation is inherited |
| [Nostur](https://nostur.com) | [nostur-com/nostur-ios-public](https://github.com/nostur-com/nostur-ios-public) | GPL-3.0 (see caveat) | `Theme.swift` + the `Themes.xcassets/default*.colorset` values, `MainTabs15` tab set, `TabButton`'s accent-always/underline-only selection rule, `CustomizableFooter` + the `footerButtons: "💬🔄+⚡️🔖"` default and each button's active colour, `HomeTab` toolbar (PFP / logo / `tortoise` / `gearshape`), `Sidebar` row set and order, `ZapCustomizer` amounts, `SettingsStore` defaults, settings/relay/spam copy (verified against a 2026-08-05 recording — `docs/refs/nostur/screen-map.md`) | app icon (`public/icons/nostur.png`), UI labels. **Not** `Logo Black.svg` — the in-app toolbar mark is our own redrawing of the ostrich silhouette (`components/NosturMark.tsx`) |
| [Gossip](https://github.com/mikedilger/gossip) | [mikedilger/gossip](https://github.com/mikedilger/gossip) | MIT | rough layout only (*Early preview*); no website exists, so the handoff links the repo | app icon |
| [Keychat](https://keychat.io) | [keychat-io/keychat-app](https://github.com/keychat-io/keychat-app) | AGPL-3.0 | rough layout only (*Early preview*) | app icon |
| [Boris](https://readwithboris.com) | [dergigi/boris-android](https://github.com/dergigi/boris-android) | MIT (© Gigi / dergigi) | `ui/theme/Color.kt` + `Theme.kt` scheme mapping and all six theme variants, `DESIGN.md` token manifest, `MainTab`/`BorisBottomBar` order and icon pairs, `HomeSections.DEFAULT` order and per-section tints, reader meta-chip order and label formats, the 45 %-alpha highlight rule from `HighlightMarks.kt`, settings tree and copy, About carousel copy (verified against a 2026-08-21 recording — `docs/refs/boris/screen-map.md`) | app icon (`public/icons/boris.png` — `res/drawable-nodpi/ic_boris_logo.png` downscaled to 128 px, same as every other client here), UI label strings. The in-app mark is our own redrawing of that same logo. **Not** `res/drawable/ic_launcher_highlighter.xml`, which is the Font Awesome Free highlighter glyph (CC BY 4.0) recoloured — nothing derived from it ships here. **Not** the nine `assets/features/*.svg` About illustrations, which are redrawn as abstract stand-ins |

An Olas reproduction shipped here until 2026-08-05 and was removed, icon
included — `pablof7z/olas` has not been pushed since 2025-07, so there was no
maintained client left to be faithful to.

Nostr Kitten is not in this table: it is an original client of ours and
reproduces nobody's work. It is no longer listed in the gallery either.

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
- **Client icons and screenshots on share cards.** Since 2026-08-14 the same
  icons are also composited into `public/og/<id>.png`, the link-preview card a
  shared `/c/<client>` URL renders with (`scripts/og-client-cards.mjs`). Since
  2026-08-16 each card additionally carries a **screenshot of our own
  reproduction** of that client, captured from the built site.
  This is the one place either travels away from the site — with no disclaimer
  strip, no outbound link and no address bar — so the composition is the
  mitigation and is deliberate, not decorative:
  - the screenshot is never full-bleed. It is always mounted inside a device we
    draw (a phone in perspective, or a browser window whose address bar reads
    `sandstr.app/c/<id>`), which frames it as *a screen showing X* rather than
    as X;
  - everything around it is ours: our lockup top-left, our background, our
    accent glow;
  - "simulation · unofficial · mock data · not affiliated with &lt;name&gt;" is
    burned into an amber band across the full width of every card;
  - the pixels are of OUR reproduction, not of the real client — no upstream
    screenshot, marketing asset or recording is used.

  Honouring a removal request stays cheap: drop the icon and the generator
  falls back to the emoji/monogram ladder it already uses for the original
  client, and dropping the client from `src/registry.tsx` removes its route,
  its tags and its card together.
- **Snort domain.** The GitHub repo's `homepage` field now points at
  `phoenix.social`, which serves a byte-identical build to `snort.social` while
  the PWA manifest still reads "snort.social". We link `snort.social` as the
  brand-correct URL; to be confirmed with the maintainer.
- **Gossip license detection.** GitHub reports `NOASSERTION` only because
  `LICENSE.txt` carries a modified header; the README states MIT explicitly, so
  MIT is recorded.
- **Nostur copyright holder.** Its `LICENSE` is the stock GPLv3 text with no
  per-project copyright line — only the FSF boilerplate. Authorship is evidenced
  by the source-file headers (e.g. `Theme.swift:5`),
  the README contact and the commit history, so the SPDX id is recorded above
  and a copyright holder deliberately is not. To be confirmed with the author.

## Runtime dependencies

react, react-dom, react-router-dom, framer-motion, lucide-react, clsx,
tailwind-merge — all MIT. Build: vite, typescript, tailwindcss,
@tailwindcss/typography, tailwindcss-rtl. See `package.json`; run
`npm ls --omit=dev` for the resolved tree.

## Corrections welcome

If you maintain one of these projects and anything here is wrong — or you want
your icon, your name, or the whole reproduction removed — open an issue and it
will be corrected or removed, no questions asked.
