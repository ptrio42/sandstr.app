# Damus — reprodukcja (ZROBIONE 2026-07-14)

Ground truth: `docs/refs/damus/screen-map.md` (autorytatywny spec: hexy `DamusColors.swift`,
`MainTabView`, `EventActionBar`, `SideMenu`, Search/Notifications/Relays).
Luki: `docs/gaps/damus.md`. Kod: `src/simulators/damus/`, tokeny `damus.theme.css`.

- **Wzorzec wierności** razem z Amethystem: głęboki, zweryfikowany referencyjnie flagowiec/szablon,
  **11 powierzchni**. Do niego równamy.
- Powstał z pełnego rebuildu **z recordingu + recon repo** (`damus-io/damus`, **GPL-3.0**,
  `damus.io`).
- **OLED-dark.** Dwa akcenty **współistnieją, nie zlewaj ich**:
  - DamusPurple `#CC43C5`
  - **PinkGradient `#D34CD9→#F869B6`** — marka: CTA / Post / banner
  - **LINEAR_GRADIENT `#CC43C5→#4B4DFF`** — mechanika: FAB / underline / like
- **Nawigacja: dokładnie 4 taby** (Home / DMs / Search / Notifications) **+ osobny gradientowy
  compose-FAB** (NIE center-post tab — to nowszy layout z mastera, nagranie wygrywa).
- **Kolejność akcji: reply → repost → shaka (🤙, domyślny „like", NIE serce) → zap → share.**
- Follow = **monochromatyczny** (czarny/biały), nie gradient.
- Drawer z magenta wierszem **„Purple"** (struś).
- Ikony to **bundlowane assety** (`Assets.xcassets/iconography/`), nie SF Symbols; selected = wariant `.fill`.
- `configs.ts` ma poprawne hexy (`primaryColor '#CC43C5'`, `secondaryColor '#F869B6'`) — nie „poprawiaj".
- Rejestr: `frame: 'ios'`, `tour: true`, `status: 'ready'`, `theme: 'dark'`, `upstreamLicense: 'GPL-3.0'`.

**Marka:** bardzo rozpoznawalna → nie shipuj upstreamowego rastra, użyj `ClientGlyph` (patrz `TRADEMARKS.md`).
