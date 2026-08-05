# Sandstr — CLAUDE.md

Samodzielny, w 100% kliencki produkt: **„try Nostr clients in your browser — no keys, no install"**.
(Bez liczby w taglinie — publiczna narracja to „7 wiernych reprodukcji + 2 early previews",
sterowana osią `status` w `src/registry.tsx`, nie „N klientów". Od 2026-08-05 **wszystko, co widoczne,
jest reprodukcją realnego klienta** — Nostr Kitten wyszedł z listy, Olas wyleciał z repo.)
**Rdzeń wartości = REAL-CLIENTS-FIRST:** wierne, wysokiej wierności, przeglądarkowe reprodukcje **realnych,
brandowanych klientów Nostr** (Damus, Amethyst, Primal, Snort, YakiHonne, Wisp, Coracle, Keychat, Gossip) —
bez kluczy, bez instalacji. **Wierność wobec prawdziwych appek JEST produktem** — użytkownik ma naprawdę
przetestować klienta, nie „jakiś losowy twór".
Wyodrębniony (extraction spike, 2026-07-14) z feature'u symulatorów klientów, który żył w przewodniku
`nostrich.love` i jako **jedyny** złapał sygnał na Nostr, podczas gdy sam przewodnik nie zyskał trakcji.

Stack: **Vite 6 + React 19 + TypeScript SPA**, React Router 7, Tailwind 3, framer-motion, lucide-react.
**Zero backendu, sieci, auth, realnej krypto** — wszystko statyczne i liczone w przeglądarce (mock data,
fejkowe klucze, symulowane interakcje). Deploy = statyczne pliki.

## Komendy

```bash
npm run dev        # Vite dev server -> http://localhost:5173
npm run build      # produkcyjny build do dist/ (vite/esbuild)
npm run preview    # podgląd builda
npm run typecheck  # tsc --noEmit (NIE jest bramką builda — patrz Gotchas)
```

Podgląd w sesji: `.claude/launch.json` → config **sandstr** (`preview_start`, port 5173).

## Architektura / mapa kodu

- **`src/simulators/` — SERCE.** 10 klientów na wspólnym fundamencie (9 na liście + nielistowany Kitten).
  - `shared/` — `useSimulator` (Context+reducer, w większości **NIEUŻYWANY** — sim trzymają lokalny
    `useState`), `SimulatorShell`, `MobilePhoneFrame` (ramka iPhone, `platform` ios/android),
    `MockKeyDisplay`, `NoteCard`, `useParentTheme` (obserwuje klasę `dark` na `<html>`),
    `mockKeys`/`mockEvents`, **`configs.ts`** (metadata 9 brandowanych klientów), `types`.
  - `<client>/` — każdy klient: `<Client>Simulator.tsx` (baza UI/stan) +
    `<Client>SimulatorWithTour.tsx` (wrapper: `TourWrapper` + mapowanie kroków toura na komendy stanu) +
    `screens/` + `components/` + `<client>.theme.css`.
- **`src/data/mock/`** — mock users/notes/threads/relays; źródło treści dla WSZYSTKICH symulatorów.
- **`src/data/tours/`** — konfiguracje guided-tourów per klient.
- **`src/components/tour/`** — silnik tourów (Provider/Overlay/Tooltip + `tourStorage` localStorage).
  Zależy od `src/lib/progressService.ts`.
- **`src/utils/cn.ts`** — `clsx` + `tailwind-merge`.
- **`src/host/`** — NOWA warstwa hosta (nie z oryginału): `Layout` (topbar + theme toggle), `Gallery`
  (landing), `ClientView` (montuje klienta + ramkę + **baner disclaimera**).
- **`src/registry.tsx`** — mapa `id → { Component (lazy), platforma, ramka, tour, status, kind }`.
  Oś gotowości: `status: ready|preview|planned` + `kind: reproduction|original` (+ `statusNote` dla
  preview) steruje sekcjami galerii, chipami i wierszem poleceń w bramce mobile; `lead` jest DERYWOWANE
  (`ready && reproduction`), nie ustawiaj ręcznie. **TU dodajesz/mapujesz
  klienta.** Odwzorowuje 1:1 dawne strony `.astro` z oryginału.
  **Dwie listy:** `clients` (eksportowana) = to, co produkt POKAZUJE — galeria, paleta ⌘K, rail
  switchera czytają tylko ją; `unlisted` (prywatna, dziś sam Nostr Kitten) = wciąż routowalne pod
  `/c/<id>`, ale niewidoczne. `getClient()` przeszukuje obie — to ono trzyma easter-egg przy życiu.

**Montowanie klienta:** mobilne (ios/android) w `MobilePhoneFrame`; web/desktop bez ramki.
`*SimulatorWithTour` = **default export**; bazowe Coracle/Gossip/NostrKitten = **named export**.

## Twarde zasady

- **NIE przywracaj 4 legacy symulatorów** z oryginału (`interactive/damus`, `AmethystSimulatorDemo`,
  `NostrSimulator`, `QuickstartSimulator`) — świadomie nieprzeniesione, martwe/zastąpione.
- Każdy symulator = własny katalog. Edytując jednego, **nie dotykaj innych ani `shared/`** bez potrzeby.
- **Zachowuj interfejs komend toura** (`tourCommand` / `onCommandHandled` / `className` + `switch`
  komend) — inaczej guided tour się psuje.
- **Bez nowych zależności npm** (dostępne: react, react-dom, framer-motion, lucide-react, clsx,
  tailwind-merge). Bez realnej krypto/sieci — to symulacja.
- **Baner „SIMULATION · unofficial · mock data · not affiliated" MUSI zostać** na każdym widoku klienta
  (`ClientView`) — to #1 lekka mitygacja ryzyka znaku towarowego. Nie usuwaj.

## Branding / ryzyko prawne (kontekst decyzji — WAŻNE)

**Real-clients-first.** Reprodukcja realnych, brandowanych klientów (Damus/Primal/Amethyst…) niesie ryzyko
znaku towarowego i trade-dress, którego darmowy przewodnik edukacyjny nie miał — mitygujemy je, **nie**
ucieczką od cudzej marki. Ścieżki:
(a) **GŁÓWNA: zgoda-opt-in od każdego zespołu.** Właściciel odzywa się do twórców — są osiągalni na Nostr,
    a wierne demo im schlebia (to dokładnie mitygacja z audytu „zdobądź pisemną zgodę", wybrana jako
    podstawowa zamiast „prowadź własnym IP"). **Nie monetyzujemy marki konkretnego zespołu bez jego zgody.**
(b) trwały disclaimer „SIMULATION · unofficial · mock data · not affiliated" na każdym widoku — nadal #1
    lekka mitygacja.
**Nostr Kitten NIE jest fundamentem ani „front door"** — nie istnieje jako realny klient Nostr; najwyżej
opcjonalny easter-egg / maskotka. Nie traktuj go jako lidera strategicznego, kotwicy marki ani centrum
deryzykowania. **NIELISTOWANY od 2026-08-05** (decyzja właściciela): półka mówi „reprodukcje realnych
klientów", a parodia GeoCities stojąca obok Damusa psuła to zdanie przy każdej pierwszej wizycie. Kod
i wpis w rejestrze ZOSTAJĄ (`unlisted` w `registry.tsx`), `/c/nostr-kitten` dalej działa — nie kasuj go.
**Powód, dla którego zostaje: przyszły, prawdziwy klient dla zabawy.** Właściciel chce kiedyś zbudować
działającego klienta Nostr w tym duchu — na Nostrze taki żart potrafi zaskoczyć mocniej niż kolejny
poważny feed. Rozważany kierunek: **fork Wispa ostylowany na Nostr Kitten** (Wisp = mały, czytelny,
MIT, Android, już mamy jego screen-mapę i tokeny). To jest osobny produkt, a NIE symulator w tym repo —
sandstr pozostaje półką reprodukcji. **Web klienty odtwarzamy we wspólnym stacku React („Poziom A")**, nie uruchamiając realnego
kodu klienta. **„Sandstr" to finalna nazwa projektu** (decyzja właściciela 2026-07-28; wcześniej robocza).
**Domena produkcyjna: `sandstr.app`** (decyzja 2026-08-03). `sandstr.com` jest zajęta przez niezwiązany
fintech („SAND", najem krótkoterminowy, Wix, od 2025-08) — inna branża, brak kolizji, ale i brak szans na
drop; nie planuj `.com`. Absolutne `og:url`/`og:image` i `canonical` w `index.html` są **przypięte do
galerii** (`https://sandstr.app/`), nie do bieżącej trasy — to ta sama decyzja co `Disallow: /c/`
w `public/robots.txt`. Licencja: MIT, copyright „ptrio42" — patrz `LICENSE` + `TRADEMARKS.md`.

## Liderzy vs reszta

- **Wzorzec wierności:** **Amethyst** i **Damus** — głębokie, zweryfikowane referencyjnie flagowce/szablony
  (Amethyst 8 powierzchni; Damus 11) — inline-SVG robohash avatary, lokalne media postów jako `data:`-URI,
  offline/CSP-safe, tokeny z repo klienta + weryfikacja side-by-side z realnym recordingiem. Do nich równamy.
- **READY (status w `registry.tsx`): Amethyst, Damus, YakiHonne, Primal (web)** (2026-07-28) **+ Snort
  + Wisp** (2026-07-30) **+ Coracle** (2026-08-05) — zweryfikowane referencyjnie (screen-map + fidelity
  pass). (Nostr Kitten `kind: 'original'` istnieje nadal, ale jest NIELISTOWANY — patrz sekcja Branding.)
- **Wisp (ZROBIONE 2026-07-30):** recon (`barrydeen/wisp@11ac08f`, v1.2.1, MIT © Barry Deen; homepage
  `wisp.mobile`) + recording → `docs/refs/wisp/screen-map.md` (autorytatywny) i `src/simulators/wisp/`
  (13 powierzchni: login/feed/thread/profile/notifications/chat/wallet/search/compose/zap/drawer/
  Interface/Relays/Keys/Social Graph). Default = theme „custom" DARK, accent `#FF9800`, bg `#0A0A0B`,
  error = iOS-red `#FF3B30`; akcje **reply→react(emoji zastępuje serce, nigdy nie barwi)→repost→
  zap(₿ CurrencyBitcoin domyślnie, suma satów)→add-to-list**; sygnatury: **undo-countdown „Post now (N)"**
  na każdym poście, feed-selector DROPDOWN (For You default), pigułki online/relay-count w top barze,
  „∞ Followers", statusy NIP-38, ICQ-flower na bell. Celowo odtworzone bugi/leaki: M3 `secondaryContainer`
  `#4A4458` na chipach read/write/auth i segmentach Gallery|Stack. Recording miał Fiat Mode ON — sim
  szipuje repo-default (sats+₿); patrz §18 screen-mapy.
- **Snort (ZROBIONE 2026-07-30):** recon + pełny rebuild → `docs/refs/snort/screen-map.md`
  (autorytatywny, 19 sekcji z recordingu 2026-07-14 + `v0l/snort@3cc8317`) i przepisany
  `src/simulators/snort/` (12 powierzchni). Accent violet `--highlight` `#ac88ff`/`#7139f1`
  **współistnieje** z CTA `--primary #ff3f15`; reakcja = SERCE `#ef4444`; akcje
  **reply→repost→heart→zap→avatary zapperów** (kolor zmieniają TYLKO serce i zap — `text-nostr-purple`/
  `-blue` nie istnieją w prawdziwym kliencie); selektor feedu = **dropdown**, nigdzie nie ma tabów
  z podkreśleniem; kafelek Relays w Settings **celowo bez tła** (prawdziwy bug: `bg-dark` + Tailwind v4).
  Naprawione po drodze: B8 (highlighter + `dangerouslySetInnerHTML` usunięte — Snort nie ma kolorowania
  składni), B9b (scroller), B10 (dolny pasek ≤768px), zero requestów zewnętrznych.
- **Coracle (ZROBIONE 2026-08-05):** recon (`coracle-social/coracle@efea13f`, MIT © Jon Staab/hodlbod;
  app na `app.coracle.social`) + recording → `docs/refs/coracle/screen-map.md` (autorytatywny, 19 sekcji)
  i przepisany `src/simulators/coracle/` (15 powierzchni). Svelte 4 + Tailwind 3; **default = DARK**
  (`state.ts:36-40`, brak `prefers-color-scheme`), accent **burnt-orange `#FC560E` IDENTYCZNY w obu
  motywach**, zero gradientów marki. Klucz: **ciepły ramp `tinted-*`** (`#3E3A38` sidebar/karty) nad
  **zimnym `neutral-*`** (`#262626` strona, `#171717` top bar), a karty **ALTERNUJĄ** oba wg zagnieżdżenia
  (`AltColor.svelte`). Lewy sidebar = 6 pozycji **TYLKO TEKST, bez ikon**; aktywna **rośnie**
  (`text-2xl`→`text-3xl`) + akcentowe podkreślenie. Akcje noty: **reply→zap→like→repost** (zap DRUGI),
  ikony **OBRYSOWE** (własny partial 17×16) poza wypełnionym repostem; licznik zapa = **suma satów**.
  Sygnatura = prawy panel **„Your Feeds"** (7 chipów presetów + Relay Feeds/Your Lists/Custom Feeds).
  Prawie wszystko to **modale** ze scrimem odsuniętym o sidebar (`ml-72`) i okrągłym akcentowym X.
  **Login NIE MA pola na klucz** — same delegacje (extension/bunker), więc reprodukcja też go nie ma
  (`keySafety.ts` celowo nieużyty). Groups = tylko notka „Groups are going away!". [REC vs REPO]:
  polskie ekrany w nagraniu to **nstart** (`start.njump.me`), osobny projekt — nie odtwarzamy.
- **Druga fala / PREVIEW** (słabsza wierność / bugi): Keychat, Gossip.
  (Primal-MOBILE stub, nieroutowany.) Galeria etykietuje je „Early preview" +
  `statusNote`; nie przedstawiaj ich jako skończonych.
- **USUNIĘTY 2026-08-05: Olas.** Upstream `pablof7z/olas` bez pushu od 2025-07 (a `olas-nmp` to
  nielicencjonowany, niedokończony rewrite) — nie ma czego wiernie odtwarzać, a nasza wersja i tak była
  generycznym klonem Instagrama (Stories/Follow Requests nie istnieją w Nostrze). Wyleciały:
  `src/simulators/olas/`, `olas-tour.ts`, `public/icons/olas.svg`, wpisy w `registry.tsx`/`configs.ts`/
  `SimulatorClient` oraz sekcja w `docs/FIDELITY.md`. **Nie przywracaj bez ponownego recon** — jeśli
  upstream ożyje, robimy go od nowa procesem reference-first.
- **Primal web (ZROBIONE 2026-07-14):** rebuild z recordingu + recon → `docs/refs/primal/screen-map.md`
  (autorytatywny: exact tokeny `palette.scss` Midnight/Ice, NavMenu, NoteFooter, Explore/Notifications/DMs).
  3-kolumnowy (lewy nav / feed / prawy sidebar); Ice(light, w recordingu) + Midnight(dark, OLED, realny
  default); accent **BLUE `#2394EF`** (NIE oranż — configs naprawiony); akcje **reply→zap→like→repost→
  bookmark** (zap 2., like=magenta `#f800c1`/`#CA079F`, repost green, bookmark `#0C7DD8`); inline compose
  z „NOTE PREVIEW"; swirl-logo (verbatim path + grad `#00E0FF→#0090F8→#2554ED`); nav badge PO labelu
  (recording > repo). Prawy sidebar zmienny per-ekran (Home: Search/Live/Trending; Explore: Stats/HotTopics/
  TrendingUsers; Settings: Relays). Znany drobny: Primal-mobile wciąż stary stub.
- **Damus (ZROBIONE 2026-07-14):** pełny rebuild z recordingu + recon repo → `docs/refs/damus/screen-map.md`
  (autorytatywny spec: hexy DamusColors.swift, MainTabView, EventActionBar, SideMenu, Search/Notif/Relays).
  OLED-dark; DamusPurple `#CC43C5` + **PinkGradient `#D34CD9→#F869B6`** (marka: CTA/Post/banner) +
  **LINEAR_GRADIENT `#CC43C5→#4B4DFF`** (mechanika: FAB/underline/like) — dwa akcenty współistnieją.
  4 taby (Home/DMs/Search/Notifications) + osobny gradientowy compose-FAB; akcje **reply→repost→shaka(🤙,
  domyślny „like", NIE serce)→zap→share**; follow = monochromatyczny; drawer z magenta „Purple" (struś).

## Gotchas

- **Build NIE jest bramką typów.** `vite build` (esbuild) tylko strzypuje typy — `npm run typecheck`
  (tsc) osobno. Są **PRE-EXISTING** błędy w `src/simulators/shared/hooks/useSimulator.ts` (JSX w pliku
  `.ts`) odziedziczone z oryginału; esbuild je toleruje, `npm run build` przechodzi.
- **Mock hotlinkuje Unsplash / DiceBear** — łamie się offline i pod ostrym CSP, i obniża wierność.
  Zbundlowanie lokalnych avatarów/obrazków to **najwyższy cross-cutting task** (podnosi wszystkie sim naraz).
- `useSimulator`/reducer store jest **w większości nieużywany** (sim trzymają lokalny `useState`) — nie
  myl scaffoldingu z load-bearing.
- Feed w symulatorach **capuje wyświetlanie do ~25 notatek** (filtry działają na treści/kolejności, nie liczbie).
- **Dark mode:** `useParentTheme` obserwuje klasę `dark` na `<html>`; host ma własny theme toggle
  (`main.tsx` ustawia, `Layout` przełącza). Bez niego sim utknąłby w jednym motywie.
- **StrictMode jest wyłączony** (`main.tsx`) — świadomie, by uniknąć podwójnego montowania w stanach
  tour/efektów.
- Znany drobny nit: **FAB nachodzi na wiersz akcji w YakiHonne `ArticleReader`** (FAB pokazuje się zawsze
  na zakładce Articles).

## Definition of done

1. `npm run build` przechodzi — **pokaż output**.
2. **Runtime:** odpal dev, wejdź w dotknięty symulator, sprawdź konsolę (**0 błędów**) i realne zachowanie
   klik-po-kliku (nie zakładaj sukcesu bez dowodu).
3. Zmiany symulatora **izolowane do jego katalogu**; interfejs komend toura nienaruszony.

## Pointers

- **`docs/AUDIT.md`** — pełny audyt w-repo: wierność/kompletność/polish **każdego z 10 symulatorów**,
  architektura + plan wydzielenia, pozycjonowanie/branding/ryzyka prawne, synteza + roadmapa.
  **UWAGA: snapshot historyczny.** Jego rekomendacja „owned-IP-first / front door = Nostr Kitten" jest
  **nieaktualna** — kierunek zmieniono na real-clients-first (patrz sekcja „Branding / ryzyko prawne" wyżej
  + `docs/FIDELITY.md`). Reszta (mapa wierności, architektura) nadal wartościowa jako kontekst.
- **`docs/FIDELITY.md`** — **główny kit wiernego odtwarzania (proces reference-first).** Dla każdego z 9
  realnych klientów zweryfikowane tokeny marki + **plik-źródło tokenów w repo klienta** (wszystkie są
  open source), struktura nawigacji, detale-zabójcy wierności, kanały opt-in. Proces: **realne screeny +
  źródło klienta czytane razem → tokeny → weryfikacja side-by-side.** Biblioteka referencji żyje w
  **`docs/refs/<client>/`** (`screen-map.md` + `shots/`). Zawiera **korekty błędnych rekomendacji kolorów
  z `AUDIT.md`** (YakiHonne jest oranż, nie fiolet; Keychat fiolet, nie blue; Primal domyślnie blue).
  Wzorzec wykonany na Amethyście: głęboki, zweryfikowany referencyjnie (8 powierzchni, realny fiolet
  `#7F67BE` + OLED czerń + kolejność akcji reply/boost/react/zap, inline-SVG avatary, lokalne `data:` media).
- `README.md` — przegląd + jak dokładnie wyodrębniono feature z oryginału.
- Origin: audyt powstał w sesji w `../nostr-beginner-guide` (pamięć `sandstr-simulators-spinoff`); ten
  katalog to inny projekt, więc tamta pamięć **nie** ładuje się tu automatycznie — dlatego audyt jest
  w `docs/AUDIT.md`.
- Osobiste / lokalne notatki: `CLAUDE.local.md` (gitignore), nie tutaj.
