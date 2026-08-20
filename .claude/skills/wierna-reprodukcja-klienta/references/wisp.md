# Wisp (Android) — reprodukcja (ZROBIONE 2026-07-30)

Ground truth: `docs/refs/wisp/screen-map.md` (autorytatywny; §1–18 + „Recording coverage" + „Fidelity pass";
recording 2026-07-30 + `barrydeen/wisp@11ac08f`, v1.2.1, 14-agentowy recon). Luki: `docs/gaps/wisp.md`.
Kod: `src/simulators/wisp/` (13 powierzchni: login / feed / thread / profile / notifications / chat /
wallet / search / compose / zap / drawer / settings×4 — Interface, Relays, Keys, Social Graph),
tokeny `wisp.theme.css`.

- Repo `barrydeen/wisp`, **MIT**; homepage `wisp.mobile`,
  Play `com.wisp.app`, w repo jest `zapstore.yaml`. Kotlin / Compose M3.
- **Default = theme „custom" DARK**, accent `#FF9800`, bg `#0A0A0B`, error = celowy iOS-red `#FF3B30`.
  Jedyny brand-gradient to radial logo `#FFBA60→#E97941` (evenodd ghost z wyciętymi oczami).
- **Kolejność akcji: reply → react → repost → zap → add-to-list.**
  - **Serce NIGDY się nie barwi** — zastępuje je twoje emoji.
  - **Zap = ₿ `CurrencyBitcoin` domyślnie** (bolt jest opt-in) i pokazuje **SUMĘ satów**.
- **Sygnatura #1: undo-countdown „Post now (N)" na KAŻDYM poście.** Dalej: feed-selector **DROPDOWN**
  (For You default), pigułki online / relay-count w top barze, **„∞ Followers"**, statusy NIP-38 pod
  nazwami, ICQ-flower na dzwonku (+ dźwięk na reply/DM).
- **Celowo odtworzone leaki M3:** `secondaryContainer #4A4458` na chipach relay read/write/auth
  i na segmentach Gallery|Stack. To nie jest do „naprawienia".
- `[REC vs REPO]`: recording miał **Fiat Mode ON**, ale repo-default to OFF (`FiatPreferences.kt`) — sim
  szipuje repo-default (sats + ₿); patrz §18 screen-mapy. README obiecuje Amber/NIP-55, ale **kod NIP-55
  nie istnieje** w repo.
- `configs.ts` ma poprawne hexy (`#FF9800` / `#E97941`).
- Rejestr: `frame: 'android'`, `tour: true`, `status: 'ready'`, `theme: 'dark'`, `upstreamLicense: 'MIT'`.

**Gotcha z tej sesji (cross-client):** ustawiony `overflow-y` wylicza nieustawiony `overflow-x` na `auto`,
więc jeden nierozrywalny token (URL, linia kodu) w nocie robi cały feed przewijalnym w poziomie. Fix:
`overflow-wrap: anywhere` na roocie sima **plus** `button { overflow-wrap: normal; white-space: nowrap }`,
inaczej liczniki typu „69" łamią się w środku.
