---
name: rejestr-i-galeria
description: 'Podpięcie klienta do produktu: registry.tsx, galeria (src/host/Gallery.tsx), chipy statusu, paleta ⌘K / Cmd+K, rail switchera, ramka telefonu, ikona w public/icons/. Użyj gdy: "dodaj klienta", "podepnij do galerii", "przełącz na ready", "ukryj z listy", "nie widać go w galerii", "Cmd+K go nie widzi", albo gdy dotykasz src/registry.tsx, src/simulators/shared/configs.ts lub src/host/Gallery.tsx.'
---

# Rejestr i galeria

`src/registry.tsx` to JEDYNE źródło prawdy o tym, co produkt pokazuje i w jakim stanie.
Galeria, paleta ⌘K, rail switchera i `/c/:id` czytają tylko jego.

## Oś gotowości

- `status: 'ready' | 'preview' | 'planned'` × `kind: 'reproduction' | 'original'`, plus `statusNote`
  (jedno uczciwe zdanie). Renderuje się na KAŻDEJ karcie, która je ma (`Gallery.tsx:67`), a mobilny
  `AboutSheet` (`ClientView.tsx:189`) dokleja przed nim zaszyty na sztywno prefiks „Early preview — ".
  Wpisany przy `status: 'ready'` powie więc na telefonie „Early preview" o gotowej reprodukcji.
- `'ready'` wymaga weryfikacji referencyjnej (`docs/refs/<id>/screen-map.md` + fidelity pass).
  Podnosząc status bez tego kłamiesz w nagłówku sekcji „Reference-verified reproductions".
- **`lead` jest DERYWOWANE** w `branded` (`lead: mount.status === 'ready'`, a `kind` jest tam zawsze
  `'reproduction'`). Nie dokładaj pola `lead` do `MOUNTS` ani nie wpisuj go na sztywno w `branded` —
  ręczna wartość rozjedzie się ze statusem, a `lead` decyduje o ★ w palecie (`CommandPalette`)
  i o podziale rail switchera na `leads`/`rest`.
- `Gallery.tsx` renderuje DOKŁADNIE dwie sekcje: `status === 'ready'` i `status === 'preview'`
  (liczby w nagłówku hero też z nich liczy). Wpis `'planned'` zniknie z galerii, ale **nadal będzie**
  w palecie ⌘K i w railu — dziś nikt go nie używa; jeśli go wprowadzisz, dodaj obsługę w galerii.
- Chip „Early preview" jest neutralnie szary i tylko dla preview — bursztyn należy do banera
  disclaimera, nie do kart.

## Trzy listy

- `clients` (eksportowana) = wszystko, co produkt POKAZUJE. Czytają ją: `Gallery`, `CommandPalette`,
  `ClientSwitcher`, `DesktopClientGate`. Sortowana `rank` — `ready` przed resztą.
- `unlisted` (prywatna, dziś sam `nostrKitten`) = wciąż routowalne pod `/c/<id>`, niewidoczne nigdzie.
- `archived` (prywatna, dziś pusta) = zamrożone starsze wersje klientów: routowalne, niewidoczne w
  galerii/⌘K/railu, dostępne z menu wersji w `ClientView` (`versionsOf()` łączy rodzinę po `archivedOf`).
  **Podbicie klienta do nowej wersji upstream = NAJPIERW freeze starej wg `docs/VERSIONS.md`** — kopia
  verbatim bez re-id toura i przemianowania theme-CSS psuje się cicho; nie improwizuj, idź po checkliście.
- `getClient()` przeszukuje WSZYSTKIE TRZY — to ono trzyma easter-egg i stare linki przy życiu. Nie
  „upraszczaj" tego do jednej listy i nie kasuj wpisu Kittena: ukrycie było decyzją produktową, nie
  sprzątaniem.
- Ukrycie klienta = przeniesienie wpisu do `unlisted`, nie usunięcie pliku.

## Montowanie

- `frame: 'ios' | 'android'` → `MobilePhoneFrame` z `platform`; `frame: null` (web/desktop) → karta bez
  ramki. `ClientView` przy `isMobile && !frame` pokazuje `DesktopClientGate` zamiast sim — bo web-klienty
  poniżej 768px kasują własną nawigację własnymi media queries.
- `defaultTheme` = realny shipping default klienta; `ClientView` stosuje go tylko dopóki w localStorage
  nie ma klucza `sandstr-theme` (wybór gościa zawsze wygrywa).
- Baner „SIMULATION · mock data · unofficial, not affiliated with <nazwa>" wchodzi automatycznie
  z `ClientView` — dwie formy: pigułka `Disclaimer` (desktop) i pasek `DisclaimerStrip` (telefon),
  obie `z-[var(--z-disclaimer)]` + `data-tour-keep-clear`. Nie usuwaj i nie owijaj — to twarda mitygacja z CLAUDE.md.
  (Dla `kind: 'original'` drugi człon brzmi „original demo client" — steruje tym `isReal`.)
- „Take a tour" i mobilny przycisk toura emitują `window` event `start-<id>-tour`; przycisk pojawia się
  wyłącznie przy `hasTour` (czyli `MOUNTS[<id>].tour`). Coracle ma wrapper `*SimulatorWithTour`, ale
  `tour: false` — wrapper istnieje tylko po to, by FAQ „Show me" mogło sterować simem.
- Kształt powłoki `/c/:id`, ramka i warstwy z-index: **przeczytaj `references/powloka-i-warstwy.md`**,
  gdy urządzenie się przycina, strona zaczyna scrollować albo budujesz pływające UI hosta.

## Pułapki

- **Brak wpisu w `MOUNTS` = biały ekran, nie błąd typów.** `branded` mapuje `Object.values(allSimulatorConfigs)`
  i czyta `MOUNTS[cfg.id]`; `MOUNTS` to `Record<string, …>`, a `noUncheckedIndexedAccess` jest wyłączone,
  więc tsc przepuści config bez mountu, a runtime wywali się na `mount.frame`.
- **`Component` i `preload` MUSZĄ dzielić tę samą referencję loadera** (`lazy(mount.load)` + `once(mount.load)`).
  Inny loader = inny chunk Vite = mignięcie Suspense przy przełączaniu klienta.
- **Kształt eksportu.** Wszystkie `*SimulatorWithTour` mają default export i tak są importowane. Gossip
  i Nostr Kitten idą przez named export z remapem: `import('./simulators/gossip').then((m) => ({ default: m.GossipSimulator }))`
  i analogicznie `m.NostrKittenSimulator`. Zły kształt importu = pusty ekran bez błędu w konsoli.
- **`registry.tsx` musi być bezpieczny w Node** — importuje go build-time prerender (`src/entry-server.tsx`
  renderuje samą galerię). Żadnego `window`/`localStorage` na poziomie modułu.
- **`src/simulators/primal/mobile/MobileSimulator.tsx` jest eksportowany z `src/simulators/primal/index.ts`,
  ale nie ma wpisu w `MOUNTS`** — jest nieroutowalny (`MOUNTS.primal` ładuje `PrimalWebSimulatorWithTour`).
  Nie traktuj obecności katalogu jako dowodu, że klient jest podpięty.
- Ikona: `public/icons/` (mieszane png/webp/svg/ico). Literówka w ścieżce nie wywala niczego, ale
  łamie się ASYMETRYCZNIE: chrome hosta (`ClientView`, `CommandPalette`, `ClientSwitcher`) idzie przez
  `ClientGlyph`, który po `onError` cicho spada na `emoji`, potem na monogram z pierwszej litery —
  natomiast **karta w galerii rysuje surowy `<img>` bez `onError`** (`Gallery.tsx`, `c.icon ? <img> :
  c.emoji`), więc tam zobaczysz pustą/zepsutą grafikę. Sprawdzaj ikonę na galerii, nie na `/c/<id>`.
  Trzecie miejsce: ta sama ikona ląduje na karcie link-preview (`public/og/<id>.png`), ale tam
  **nie ma cichego fallbacku** — `scripts/og-client-cards.mjs` wywala się głośno, gdy ścieżka
  z rejestru nie wskazuje pliku na dysku. To jedyny konsument, który tę literówkę złapie.
- **Każdy wpis w rejestrze = jedna trasa = jedna karta.** Build wypuszcza `dist/c/<id>.html`
  z `og:image` na `/og/<id>.png` dla WSZYSTKICH trzech list (`clients`, `unlisted`, `archived` —
  `routable` w `registry.tsx`), więc nawet niewidoczny w galerii Nostr Kitten ma własną kartę.
  Nowy wpis bez `npm run og:cards` = `og:image` na 404. Build tego nie sprawdza (nie zna dysku
  po stronie `public/og/`), więc to jedyny krok w tym skillu, którego nie pilnuje kompilator.

## Checklist podpięcia nowego klienta

> **„Podpięty" to nie „skończony", i punkty 4-6 są tym, co je dzieli.** Klient bez toura i banku FAQ
> jest widoczny, klikalny i może stać `ready` (Coracle tak stoi) — ale **nie ma `showMe`, nie wchodzi
> na `/compare` i nie pojawia się w „How the other N clients do this" w panelu FAQ**. To realna
> nieobecność w trzech powierzchniach produktu, nie kosmetyka, więc jeśli je odkładasz — powiedz to
> wprost i zostaw wiersz w `docs/gaps/<id>.md`. Boris (2026-08-21) jest wzorcowym przykładem obu
> stron: wszedł bez jednego i drugiego, tour dopisano tego samego dnia, bank FAQ został jako dług.

1. `SimulatorClient` w `src/simulators/shared/types/index.ts` + config w `src/simulators/shared/configs.ts`
   (`allSimulatorConfigs` jest `Record<SimulatorClient, …>`, więc kompilator wymusi config dla nowej wartości).
2. Wpis w `MOUNTS` w `src/registry.tsx`: `frame`, `tour`, `status` (+ `statusNote` dla preview), opcjonalny
   `theme`, `homepage`/`repo`/`upstreamLicense`/`installNote` — te cztery weryfikuj na STRONIE i w REPO
   projektu, nie z pamięci; renderują się jako „Get the real X" i jako pierwsze zdanie maila o zgodę.
   Do tego **`availableOn`** (`ios`/`android`/`web`), wyprowadzone z `installNote` i edytowane RAZEM
   z nim. To NIE jest `platform`: `platform` mówi, którą wersję odtwarzamy (YakiHonne z apki iOS),
   a `availableOn` — gdzie realny klient chodzi. Filtr platformy na `/compare` czyta to drugie;
   czytanie `platform` gubiło klientów, które na pytanym urządzeniu jak najbardziej działają.
3. Ikona 128px w `public/icons/` + `icon` w configu.
4. Tour — **odkładany, nie opcjonalny** (bez niego znika przycisk „Take a tour"):
   `src/data/tours/<id>-tour.ts`, a w `src/data/tours/index.ts` re-eksport ORAZ wpis
   w mapie `tourConfigs` (z niej derywuje się `TourClient`; sam re-eksport nie wystarczy i nic o tym nie
   powie — kompilator nie pilnuje kompletności tej mapy). W `MOUNTS` `tour: true`. Reguły: `docs/TOURS.md`.
5. FAQ — **odkładany, nie opcjonalny**: `src/data/faq/<id>.ts` + wpis w mapie `faqs` w
   `src/data/faq/index.ts` — bez tego `getFaq()` zwróci null i wszystkie afordancje FAQ znikną.
   Kontrakt autorski: `src/data/faq/README.md` (17 tematów kanonicznych, `coverage` wymuszane przez
   kompilator). Przed pisaniem `showMe` czytaj `docs/gaps/<id>.md`.
6. `/compare`: wiersze w `src/data/capabilities.ts` + id w `COMPARED_CLIENTS`. **Wymaga banku FAQ** —
   każda komórka cytuje id wpisu FAQ, więc bez punktu 5 klienta po prostu tam nie ma. Reguły:
   `docs/COMPARE.md`.
7. `docs/FIDELITY.md`, `docs/refs/<id>/screen-map.md`, `docs/gaps/<id>.md` i wiersz w `THIRD-PARTY.md`.
8. Nazwa klienta trafia też do dropdownów w `.github/ISSUE_TEMPLATE/*.yml` — `fidelityReportUrl()` prefiluje
   pole `client` dokładnym dopasowaniem, a niedopasowanie po cichu zostawia je puste.
9. `npm run og:cards` — karta share dla nowej trasy. Ręcznie, bo robi build i woła headless
   Chrome; pominięte daje `og:image` na 404. Karta **fotografuje symulator**, więc przebiegu
   wymaga też każda widoczna zmiana w kliencie, nie tylko `name`/`status`/`primaryColor`/
   `platform`/`icon` (pigułka „Early preview" znika przy promocji na `ready`).
   **Jeśli klient otwiera się na logowaniu — dopisz go do tabeli `ENTRY`** w
   `scripts/og-client-cards.mjs`: lista WIDOCZNYCH etykiet do kliknięcia po kolei (krok `{ fill }`,
   gdy przycisk jest `disabled` do czasu wypełnienia pola — tak ma Wisp). Dziewięciu z dwunastu
   klientów tego potrzebuje; bez tego karta reklamuje ekran logowania, czyli dokładnie tarcie,
   które produkt usuwa. Zmiana onboardingu istniejącego klienta wywali `og:cards` z nazwą kroku
   i tekstem ekranu — to jedyny alarm, jaki dostaniesz.
10. Definition of done z CLAUDE.md: `npm run build` + realny klik po `/c/<id>` z czystą konsolą.
