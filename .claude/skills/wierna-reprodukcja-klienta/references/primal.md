# Primal (web) — reprodukcja (ZROBIONE 2026-07-14)

Ground truth: `docs/refs/primal/screen-map.md` (autorytatywny, 1097 linii: exact tokeny `palette.scss`
Midnight/Ice, NavMenu, NoteFooter, Explore/Notifications/DMs). Luki: `docs/gaps/primal.md`.
Kod: `src/simulators/primal/web/` (+ tokeny `primal-web.theme.css`), wrapper
`src/simulators/primal/PrimalWebSimulatorWithTour.tsx`.

- Powstał z rebuildu **z recordingu + recon** repo `PrimalHQ/primal-web-app` (**MIT**, Primal Systems Inc.,
  Miljan Braticevic; `primal.net`). Uwaga: to **SolidJS**, nie React → tokeny tłumaczysz ręcznie.
- **Layout 3-kolumnowy:** lewy nav / feed / prawy sidebar.
- **Dwa motywy: Ice (light, ten z recordingu) + Midnight (dark, OLED, realny default).**
- **Accent BLUE `#2394EF`** — NIE oranż i NIE magenta. Magenta to legacy alt-theme „Sunset". `configs.ts`
  jest już naprawiony (`primaryColor '#2394EF'`, `secondaryColor '#14B9FF'`).
- **Kolejność akcji: reply → zap → like → repost → bookmark** (zap DRUGI). Kolory są **per-STATE**:
  like = magenta `#f800c1` (Midnight) / `#CA079F` (Ice), repost green, bookmark `#0C7DD8`.
- **Inline compose** z etykietą „NOTE PREVIEW" (nie modal).
- **Swirl-logo:** verbatim path + gradient `#00E0FF→#0090F8→#2554ED`.
- **Nav badge PO labelu**, nie na ikonie — `[REC vs REPO]`, recording wygrywa z repo.
- **Prawy sidebar jest zmienny per-ekran:** Home = Search / Live / Trending; Explore = Stats / Hot Topics /
  Trending Users; Settings = Relays.
- Rejestr: `frame: null` (web, bez ramki), `tour: true`, `status: 'ready'`, `theme: 'dark'`,
  `upstreamLicense: 'MIT'`.

**Znany drobny:** `src/simulators/primal/mobile/` to nadal **stary stub**, nieroutowany — patrz
`references/pozostali.md`. Zrobiony jest wyłącznie web.
