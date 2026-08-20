# Amethyst — reprodukcja (pilot wzorca)

Ground truth: `docs/refs/amethyst/screen-map.md` + `shots/` (część screenów to zdjęcia z telefonu
właściciela — gold standard, gdy repo ich nie miało). Luki: `docs/gaps/amethyst.md`.
Kod: `src/simulators/amethyst/`, tokeny `amethyst.theme.css`.

- **Wzorzec wierności** razem z Damusem: głęboki, zweryfikowany referencyjnie flagowiec/szablon,
  **9 powierzchni**. Do niego równamy — inline-SVG robohash avatary, lokalne media postów jako
  `data:`-URI, offline/CSP-safe, tokeny z repo klienta + weryfikacja side-by-side z realnym recordingiem.
- Repo: `vitorpamplona/amethyst`, **MIT**; `amethyst.social`. Tokeny:
  `.../ui/theme/Color.kt` + `Theme.kt`. Brak wersji web — weryfikuj ze źródła + screenów.
- **Realny fiolet `#7F67BE`** (Primary50) / `#D0BCFF` (Primary80). **`#6750A4` to generyczny Material
  default, NIE token Amethysta** — nie wpisuj go. Zap = BitcoinOrange `#F7931A`, dark bg/surface = czysta
  czerń `#000000`.
- **Kolejność akcji (screen-map §„Home — treść"): Reply → Boost → Like → Zap → Stats.** „Like" to serce,
  a long-press na TYM SAMYM przycisku daje emoji-reakcję. ⚠️ `docs/FIDELITY.md` skraca to do „reaction
  (EMOJI, nie serce)" — screen-mapa jest autorytatywna, więc rysuj serce z emoji pod long-pressem.
- Bottom nav = **5 ikon bez etykiet** (Home/Messages/Shorts/Discover/Notifications) — **bez zakładki
  Profile i bez Search**. App bar: avatar (→ drawer) / **centrum zależne od ekranu** (Home = selektor feedu
  „All Follows ⌄", Messages = logo) / „16/16" + graf relayów. Sub-taby Home to **New Threads |
  Conversations**, nie Following/Global.
- **Uwaga na `configs.ts`:** `amethystConfig.primaryColor` to nadal `#6B21A8` („Deep purple"), a
  `secondaryColor` `#A855F7` — rozjeżdża się z ground truth `#7F67BE`/`#D0BCFF`. Poprawiając wierność,
  wyrównaj też ten plik.
- Ekrany logged-off (Login ↔ Sign Up, dogrywka 2026-08-05) są w `screen-map.md`; etykieta
  `OutlinedButton` jest **biała, nie fioletowa** `[REC vs REPO]`.
- Rejestr: `frame: 'android'`, `tour: true`, `status: 'ready'`, `theme: 'dark'`, `upstreamLicense: 'MIT'`.
