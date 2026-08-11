# Coracle (web) — reprodukcja (ZROBIONE 2026-08-05)

Ground truth: `docs/refs/coracle/screen-map.md` (autorytatywny, 19 sekcji, 814 linii; recording 2026-08-05
+ `coracle-social/coracle@efea13f`, 12-agentowy recon). Luki: `docs/gaps/coracle.md`.
Kod: `src/simulators/coracle/` (15 powierzchni), tokeny `coracle.theme.css`.

- Repo `coracle-social/coracle`, **MIT © Jon Staab / `hodlbod`** (FUTO Fellow, bardzo opt-in-friendly);
  app na `app.coracle.social`. **Svelte 4 + Tailwind 3**; tokeny wstrzykiwane **runtime z `.env.template`**
  (`VITE_DARK_THEME` / `VITE_LIGHT_THEME`) do `:root`.
- **Default = DARK** (`state.ts:36-40`, **brak `prefers-color-scheme`**) → wpis w rejestrze ma
  `theme: 'dark'`; bez tego połowa pierwszych wizyt otwierałaby motyw, którego apka sama nigdy nie wybiera.
- **Accent burnt-orange `#FC560E`, IDENTYCZNY w light i dark. Zero gradientów marki.**
  ⚠️ `LogoSvg.svelte:8` ma inny oranż `#EB5E28` jako fallback, ale ten komponent **nie ma importerów** —
  martwy kod, nie brand.
- **Killer #1: dwa rampy.** Ciepły `tinted-*` (`#3E3A38` sidebar i karty) nad zimnym `neutral-*`
  (`#262626` strona, `#171717` top bar), a **karty ALTERNUJĄ oba wg zagnieżdżenia** (`AltColor.svelte`).
  Stary sim miał jeden zimny szary i light-first, czyli podwójnie źle.
- **Lewy sidebar `w-72` = 6 pozycji TYLKO TEKST, bez ikon:** Feeds / Relays / Notifications / Messages /
  Groups / Lists (NIE Communities/Calendar/Market — te nie istnieją). Aktywna **rośnie**
  (`text-2xl`→`text-3xl`) + akcentowe podkreślenie.
- **Kolejność akcji: reply → zap → like → repost (→ open-with)** — zap DRUGI. Ikony **OBRYSOWE** (własny
  partial 17×16) poza wypełnionym repostem; licznik zapa = **suma satów**, default 21.
- **Sygnatura: prawy panel „Your Feeds"** — 7 chipów presetów + Relay Feeds / Your Lists / Custom Feeds.
- **Prawie wszystko to modale**, ze scrimem odsuniętym o sidebar (`ml-72`) i okrągłym akcentowym X.
- **Login NIE MA pola na klucz** — same delegacje (extension / bunker), więc reprodukcja też go nie ma
  (`src/simulators/shared/utils/keySafety.ts` celowo NIE jest tu importowany, choć importuje go 6 innych
  klientów z polem na klucz (amethyst, keychat, nostur, primal/web, wisp, yakihonne) — nie „dodawaj go dla spójności"). Groups = tylko notka
  „Groups are going away!".
- **Bazowy `.btn` jest BIAŁY na CZARNYM** (`app.css:374-415`, §4 screen-mapy) — akcent jest opt-in,
  tylko dla akcji głównej.
- Fonty: **Lato** (body) + **Staatliches** (`.btn` i nagłówki) — Staatliches to typeface **all-caps**, stąd
  kapitaliki w UI mimo Title case w kodzie.
- `[REC vs REPO]`: polskie ekrany w nagraniu to **nstart** (`start.njump.me`) — osobny projekt,
  nie odtwarzamy.
- **Uwaga na `configs.ts`:** `coracleConfig.primaryColor` to nadal `#6366F1` („Indigo") / `#818CF8` —
  kłamie wobec `#FC560E`. Wyrównaj przy najbliższym dotknięciu.
- Rejestr: `frame: null`, **`tour: false`** (Coracle nie ma wpisu w `src/data/tours/`), `status: 'ready'`,
  `theme: 'dark'`, `upstreamLicense: 'MIT'`. Wrapper `CoracleSimulatorWithTour` istnieje mimo braku toura —
  niesie mostek dla „Show me" z FAQ; **nie kasuj go i nie zmieniaj `tour` na `true`**.
