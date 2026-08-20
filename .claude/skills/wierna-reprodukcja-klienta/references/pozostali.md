# Pozostali klienci — ready bez własnego bloku, previews, stuby i to, czego NIE przywracamy

## YakiHonne — READY (`status: 'ready'`), ale bez bloku w CLAUDE.md

Ground truth: **`docs/refs/yakihonne/screen-map.md`** (312 linii; brand tokens, feed + app bar + feed
selector, bottom nav, note card + action bar, Articles + Article reader, Compose, Profile, Wallet + zap,
Settings/Relay orbits, Search, Branding/logo/login, sekcja „Fidelity killers"). Luki:
`docs/gaps/yakihonne.md`. Kod: `src/simulators/yakihonne/`, tokeny `yakihonne.theme.css`.
**Przed pracą czytaj screen-mapę — to ona, nie ten plik, jest specem.**

- Repo: **`YakiHonne/web-app` + `YakiHonne/mobile-app`** (MIT). `yakihonne-web-app` /
  `yakihonne-mobile-app` są **ZARCHIWIZOWANE** — nie linkuj ich i nie czytaj z nich.
- **Default accent = ORANŻ `#EE7700`** (`kMainColor` / `--orange-main`). ⚠️ stary snapshot każe
  „przeskinować na fiolet" — **to błąd**; fiolet `#6B218D`/`#86318C` to selectable accent i ciemne
  powierzchnie. `configs.ts` ma już poprawnie `#EE7700`.
- Rejestr: `frame: 'ios'`, `tour: true`, `status: 'ready'`, **`theme: 'light'`**, `upstreamLicense: 'MIT'`.
- **Znany drobny nit (z CLAUDE.md):** FAB nachodzi na wiersz akcji w `ArticleReader` — FAB pokazuje się
  zawsze na zakładce Articles.
- Dogrywka 2026-08-05 domknęła onboarding (landing / Log in / 5-stronicowy Create account) — szczegóły
  w `docs/FIDELITY.md` i w screen-mapie.

## Druga fala / PREVIEW: Keychat i Gossip

**Słabsza wierność, bugi, BRAK `docs/refs/<klient>/screen-map.md`.** Galeria etykietuje je „Early preview"
+ `statusNote` — **nie przedstawiaj ich jako skończonych**. Podniesienie ich do `ready` wymaga PEŁNEGO
procesu reference-first (nagranie → recon → screen-map → rebuild → fidelity pass), nie kosmetyki.
Luki: `docs/gaps/keychat.md`, `docs/gaps/gossip.md`. Tokeny w `docs/FIDELITY.md` (sekcje per-client).

- **Keychat** — `keychat-io/keychat-app`, **AGPL-3.0**; `keychat.io`. Rejestr: `frame: 'android'`,
  `tour: true`, `status: 'preview'`, statusNote „Brand and layout not yet verified against the real client.".
  Brand = **fiolet `#8700ED` (light) / `#d4bbff` (dark) + oranż `#EC6E0E`**. ⚠️ stary snapshot mówi
  brand blue `#2D7FF9` — **NIEPRAWDA**, i dokładnie ten błędny hex siedzi dziś w
  `configs.ts` (`keychatConfig.primaryColor: '#2D7FF9'`). Nawigacja: **3-tab CupertinoTabBar**
  Chats / Browser / Me — nie drawer, nie 4–5 tabów.
- **Gossip** — `mikedilger/gossip`, **MIT**. **Genuinely nie ma strony** → w rejestrze
  `homepage: null`, linkujemy repo; **nie wymyślaj domeny**. Rejestr: `frame: null`, `tour: false`,
  `status: 'preview'`, statusNote „The real Gossip is a native desktop app; this is a rough web sketch.".
  Brand = **stalowy błękit `#74A7CC` (dark) / `#557A95` (light)**, jeden kolor; ⚠️ `configs.ts` ma zieleń
  `#22C55E` — kłamie. Nawigacja: **wąski pionowy icon-rail** + cienki status bar na dole; spartańskie
  **egui** (płaskie fille, hairline'y, brak cieni i kart). Generyczny „Twitter sidebar" w symulatorze to
  jego największy błąd. Brak DOM — tokeny czytasz z Rusta (`gossip-bin/src/ui/theme/default.rs`).
  Uwaga na eksport: `GossipSimulator` to **named export** (rejestr mapuje go przez `.then(m => …)`).

## Primal-mobile — stub, nieroutowany

`src/simulators/primal/mobile/` (`MobileSimulator.tsx` + `primal-mobile.theme.css`) to **stary stub**.
Jest eksportowany z `src/simulators/primal/index.ts` jako `PrimalMobileSimulator`, ale rejestr montuje pod
`primal` wyłącznie `PrimalWebSimulatorWithTour` — **mobile nie ma żadnej trasy**.
Zrobiony jest tylko web (`references/primal.md`). Nie promuj stuba bez pełnego recon.

## Nostr Kitten — NIELISTOWANY, kod ZOSTAJE

`kind: 'original'` (nasz, nie cudza marka), `src/simulators/nostr-kitten/`. **NIELISTOWANY od 2026-08-05**
(decyzja właściciela): półka mówi „reprodukcje realnych klientów", a parodia GeoCities obok Damusa psuła to
zdanie przy pierwszej wizycie. **Wpis i kod ZOSTAJĄ** — jest w prywatnej tablicy `unlisted` w
`src/registry.tsx`, `getClient()` przeszukuje obie listy, więc `/c/nostr-kitten` dalej działa.
**Nie kasuj go.** Nie traktuj go jako lidera strategicznego, kotwicy marki ani „front door" — najwyżej
easter-egg. Powód, dla którego zostaje: właściciel chce kiedyś zbudować z niego **prawdziwego** klienta
(rozważany kierunek: fork Wispa ostylowany na Nostr Kitten) — to byłby OSOBNY produkt, nie symulator tutaj.

## USUNIĘTE — NIE PRZYWRACAJ

- **Olas (usunięty 2026-08-05).** Upstream `pablof7z/olas` bez pushu od 2025-07, a `olas-nmp` to
  nielicencjonowany, niedokończony rewrite → **nie ma stabilnego ground truth do odwzorowania**, a nasza
  wersja i tak była generycznym klonem Instagrama (Stories / Follow Requests **nie istnieją w Nostrze**).
  Wyleciały: `src/simulators/olas/`, `olas-tour.ts`, `public/icons/olas.svg`, wpisy w
  `registry.tsx`/`configs.ts`/`SimulatorClient` oraz sekcja w `docs/FIDELITY.md`. **Nie przywracaj bez
  ponownego recon** — jeśli upstream ożyje, robimy go od nowa procesem reference-first, nie `git revert`.
- **4 legacy symulatory z oryginału** (`interactive/damus`, `AmethystSimulatorDemo`, `NostrSimulator`,
  `QuickstartSimulator`) — świadomie nieprzeniesione, martwe/zastąpione. **NIE przywracaj.**
