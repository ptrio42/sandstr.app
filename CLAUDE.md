# Sandstr — CLAUDE.md

Samodzielny, w 100% kliencki produkt: **„try Nostr clients in your browser — no keys, no install"**.
(Bez liczby w taglinie — publiczna narracja to „4 wierne reprodukcje + 5 early previews + 1 original",
sterowana osią `status`/`kind` w `src/registry.tsx`, nie „10 klientów".)
**Rdzeń wartości = REAL-CLIENTS-FIRST:** wierne, wysokiej wierności, przeglądarkowe reprodukcje **realnych,
brandowanych klientów Nostr** (Damus, Amethyst, Primal, Snort, YakiHonne, Coracle, Keychat, Olas, Gossip) —
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

- **`src/simulators/` — SERCE.** 10 klientów na wspólnym fundamencie.
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
deryzykowania. **Web klienty odtwarzamy we wspólnym stacku React („Poziom A")**, nie uruchamiając realnego
kodu klienta. **„Sandstr" to finalna nazwa projektu** (decyzja właściciela 2026-07-28; wcześniej robocza).
Licencja: MIT, copyright „ptrio42" — patrz `LICENSE` + `TRADEMARKS.md`.

## Liderzy vs reszta

- **Wzorzec wierności:** **Amethyst** i **Damus** — głębokie, zweryfikowane referencyjnie flagowce/szablony
  (Amethyst 8 powierzchni; Damus 11) — inline-SVG robohash avatary, lokalne media postów jako `data:`-URI,
  offline/CSP-safe, tokeny z repo klienta + weryfikacja side-by-side z realnym recordingiem. Do nich równamy.
- **READY (status w `registry.tsx`, 2026-07-28): Amethyst, Damus, YakiHonne, Primal (web)** — zweryfikowane
  referencyjnie (screen-map + fidelity pass). (+ Nostr Kitten: `kind: 'original'`, opcjonalny easter-egg,
  nie lider i nie front door.)
- **Druga fala / PREVIEW** (słabsza wierność / bugi): **Snort** (korekta wcześniejszego wpisu — zero
  realnych tokenów, brak `docs/refs/snort/screen-map.md`; wymaga pełnego recon→rebuild), Keychat, Olas,
  Coracle, Gossip. (Primal-MOBILE stub, nieroutowany.) Galeria etykietuje je „Early preview" +
  `statusNote`; nie przedstawiaj ich jako skończonych.
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
