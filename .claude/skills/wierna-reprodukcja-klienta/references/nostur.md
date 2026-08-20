# Nostur (iOS) — reprodukcja (ZROBIONE 2026-08-05)

Ground truth: `docs/refs/nostur/screen-map.md` (autorytatywny, 19 sekcji, 472 linie; recording 2026-08-05
+ `nostur-com/nostur-ios-public@11bcebb`). Luki: `docs/gaps/nostur.md`.
Kod: `src/simulators/nostur/` (13 powierzchni: welcome / feed×3 / thread / profile / notifications /
messages+DM / search / bookmarks / compose / zap / drawer / settings×6), tokeny `nostur.theme.css`.

- Repo `nostur-com/nostur-ios-public`, **GPL-3.0**; `nostur.com`,
  App Store id `1672780508`, także macOS `.dmg`. SwiftUI. ⚠️ `LICENSE` to stock GPLv3 **bez linii
  copyright** — autorstwo tylko z nagłówków plików i historii commitów.
- **10 nazwanych motywów; default nazywa się dosłownie `"default"`** (`Theme.swift:39`). Light/dark to
  preferencja SYSTEMU (`preferredColorScheme` = `nil` dla wszystkich poza `dark_garnet`) → robimy oba,
  rejestr otwiera dark (bo takie było urządzenie w nagraniu).
- **Accent = `display-p3(51,162,166)`** z `Themes.xcassets/defaultAccentColor.colorset`: naiwny hex
  `#33A2A6`, kolorymetryczny sRGB `#00A5A8`, a urządzenie maluje **`#00BDA9`** — i **to bierzemy**
  (wyjątek Display-P3, patrz SKILL.md). `configs.ts` ma już `#00BDA9`.
- **Feed siedzi na `listBackground` = czysta czerń `#000`**, nie na `background` `#1C1C1E`
  (`secondaryColor` w `configs.ts` to właśnie `#000000` — świadomie).
- `lineColor` jest **akcentowy @35%** (hairline'y są turkusowe), ale separator postów to zwykły `Divider()`.
- **Kolejność akcji: reply → repost → SERCE → zap (suma satów + słowo „sats") → bookmark**, rozstrzelone
  `space-between`, **cały rząd akcentowy**, a aktywny stan barwi DOKŁADNIE jedną ikonę
  (red / green / yellow / orange). Default `footerButtons: "💬🔄+⚡️🔖"` (`SettingsStore.swift:228`),
  gdzie `+` = `EmojiButton` = SERCE.
- **ZABÓJCA WIERNOŚCI: `TabButton` ma label ZAWSZE `theme.accent`** — zaznaczenie to WYŁĄCZNIE 1px
  podkreślenie. Typowe „szary → biały" czyta się natychmiast jako inna appka. Dotyczy sub-tabów feedu
  (`MainFeedsScreen`), profilu i notyfikacji; **dolny 5-zakładkowy tab bar to natywny iOS** — aktywna
  ikona akcentowa, nieaktywna systemowy szary `#8E8E93`.
- **Sygnatury:** **żółw** Low Data Mode w toolbarze (przygaszony do 30% gdy OFF) + toast
  „Low Data mode: enabled/disabled" i bloki „Loading paused (Low data mode) / Load anyway"; akcentowy chip
  **`chevron.compact.down`** (show-more); media **edge-to-edge bez zaokrągleń** (`fullWidthImages` = true);
  brak awatara = **płaska, seedowana barwa** (bez inicjałów); **„∞ Followers"**; 16 pomarańczowych monet
  w „Send sats" (21 preselected); stopka drawera „Nostur 1.30.2 (Build: 527)" + „Source code".
- `[REC vs REPO]`: recording to **pre-iOS-26 `MainTabs15`** (5. zakładka = koperta Messages + osobny FAB);
  repo ma też `MainTabs26`, gdzie Messages znika z paska i wchodzi do drawera, a 5. zakładką jest
  „New Post" — **bierzemy recording**. Tak samo 3 zakładki feedu (Following / Discover / Explore), bo
  pozostałe 10 jest za bramką `viewFollowingPublicKeys.count > 10`. **Nie „przywracaj" tego, czego
  nagranie nie pokazuje** — bramkowane UI to poprawny stan, nie brak.
- Rejestr: `frame: 'ios'`, `tour: true`, `status: 'ready'`, `theme: 'dark'`, `upstreamLicense: 'GPL-3.0'`.

**Recon-lesson:** dla jednojęzykowego repo SwiftUI recon poszedł **solo `curl`em** po
raw.githubusercontent (~15 celowanych plików po jednym listingu `git/trees?recursive=1`) — szybciej niż
rozpraszanie agentów.
