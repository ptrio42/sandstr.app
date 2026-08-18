# Sandstr — CLAUDE.md

## Czym to jest

Samodzielny, w 100% kliencki produkt: **„try Nostr clients in your browser — no keys, no install"**.
**Rdzeń wartości = REAL-CLIENTS-FIRST:** wierne przeglądarkowe reprodukcje **realnych, brandowanych
klientów Nostr** (lista: `src/registry.tsx`). **Wierność wobec prawdziwej appki JEST produktem** —
użytkownik ma naprawdę przetestować klienta, nie „jakiś losowy twór". Wszystko, co widoczne, jest
reprodukcją realnego klienta.
**W taglinie NIE MA liczby klientów** — publiczna narracja („8 wiernych reprodukcji + 2 early previews")
jest derywowana z osi `status` w `src/registry.tsx`; nie wpisuj takich liczb na sztywno.

Stack: **Vite 6 + React 19 + TypeScript SPA**, React Router 7, Tailwind 3, framer-motion, lucide-react.
**Bez auth i bez realnej krypto** — mock data, fejkowe klucze, symulowane interakcje liczone
w przeglądarce. **Jeden wyjątek od „zero backendu": `workers/index.ts`** — endpoint `/api/unfurl`
pobiera tagi OG cudzej strony, żeby „Preview your note" mógł pokazać kartę podglądu linku (przeglądarka
sama nie może, CORS). Endpoint jest wąski i pilnowany przed SSRF (https, bez literałów IP, tylko
text/html, 512 kB, 5 s); poza `/api/*` wszystko idzie prosto z assetów, więc SPA fallback i `_headers`
są nietknięte. **Nie dokładaj do niego funkcji** bez dobrego powodu — to jedyna powierzchnia serwerowa
w projekcie. `connect-src` zostaje `'self'`. **Deploy = `git push` na main** — Cloudflare Workers Builds (integracja GitHub) buduje
i wdraża samo; lokalny `wrangler deploy` NIE zadziała (brak logowania, tylko `CLOUDFLARE_API_TOKEN` by
pomógł). Po wdrożeniu sprawdź TAKŻE endpoint: `curl -s 'https://sandstr.app/api/unfurl?url=https%3A%2F%2Fnostr.com'`
musi zwrócić JSON — `<!doctype html>` znaczy, że `run_worker_first` nie zadziałało.
Weryfikacja części klienckiej: porównaj hash chunka z `dist/assets/` z tym serwowanym na
`sandstr.app/assets/…` albo grepni marker treści — hash samego `index-*.js` to za mało, bo zmiany
w symulatorze siedzą w lazy chunkach.

## Komendy

```bash
npm run dev        # Vite dev server -> http://localhost:5173
npm run build      # klient + bundle SSR + scripts/prerender.mjs + scripts/verify-headers.mjs
npm run preview    # podgląd builda
npm run typecheck  # tsc --noEmit; NIE jest bramką builda — patrz Gotchas
npm run og:cards   # RĘCZNIE: build + zrzuty symulatorów przez CDP -> public/og/<id>.png (headless Chrome)
```

Podgląd w sesji (`.claude/launch.json` → `preview_start`): **sandstr** (dev, 5173) ·
**sandstr-preview** (4173) · **sandstr-workers** (`wrangler dev`, 8787).

## Mapa kodu

- **`src/registry.tsx` — punkt wejścia.** `id → { Component (lazy), platforma, ramka, tour, status, kind }`;
  tu podpinasz klienta. **Trzy listy:** `clients` (eksport) = to, co produkt POKAZUJE (galeria, ⌘K, rail);
  `unlisted` (dziś sam Nostr Kitten) = routowalne pod `/c/<id>`, ale niewidoczne; `archived` (dziś pusta) =
  zamrożone starsze wersje klientów: routowalne pod `/c/<archId>`, niewidoczne w galerii/⌘K/railu,
  osiągalne z menu wersji w `ClientView`, listy Versions w AboutSheet i z bezpośrednich linków
  (`versionsOf()`; freeze: `docs/VERSIONS.md`). `getClient()` czyta wszystkie trzy — to trzyma easter-egg
  i stare linki przy życiu.
- **`src/simulators/` — SERCE.** 11 katalogów klientów (10 brandowanych + `nostr-kitten`) + `shared/`
  (`SimulatorShell`, `MobilePhoneFrame`, `NoteCard`, `useParentTheme`, `configs.ts` = metadata klientów).
- **`src/data/`** — `mock/` (users/notes/threads/relays; treść dla WSZYSTKICH symulatorów), `tours/`, `faq/`.
- **`src/components/`** — `tour/` (silnik: Provider/Overlay/Tooltip + `tourStorage`), `faq/`
  (mostek `FaqMiniTourLauncher`).
- **`src/host/`** — `Layout`, `Gallery`, `ClientView` (klient + ramka + **baner disclaimera**),
  `CommandPalette`, `ClientSwitcher`, `FaqPanel`, oraz `compare/` — trasa `/compare`: macierz
  możliwości + te same powierzchnie UI w ośmiu klientach obok siebie (`docs/COMPARE.md`).
  `CapabilityTable.tsx` jest współdzielony z prerenderem (`CompareStatic` → `entry-server.tsx`),
  więc wersja dla crawlerów nie może się rozjechać z żywą stroną.
- **`src/shareMeta.ts`** — tytuł i opis trasy `/c/<id>`, jedno źródło dla karty share
  (build, przez `shareRoutes()` w `src/entry-server.tsx` → `dist/c/<id>.html`) i dla
  `document.title` w `ClientView`. Obrazki kart: `public/og/<id>.png` z `npm run og:cards`.
- Montowanie: mobilne (ios/android) w `MobilePhoneFrame`, web/desktop bez ramki. `*SimulatorWithTour`
  = **default export**; Gossip i Nostr Kitten montowane przez **named export** (patrz `registry.tsx`).

## Twarde zasady

- **NIE przywracaj 4 legacy symulatorów** z oryginału (`interactive/damus`, `AmethystSimulatorDemo`,
  `NostrSimulator`, `QuickstartSimulator`) — świadomie nieprzeniesione, martwe/zastąpione.
- **NIE przywracaj Olasa** (usunięty 2026-08-05, upstream martwy) bez ponownego recon reference-first.
- **Każdy symulator = własny katalog.** Edytując jednego, nie dotykaj innych ani `shared/` bez potrzeby —
  `shared/` zmienia wszystkie naraz.
- **Interfejs komend toura jest nietykalny** (`tourCommand` / `onCommandHandled` / `className` + `switch`
  komend) — inaczej psują się toury i mini-toury FAQ.
- **Bez nowych zależności RUNTIME** (są: react, react-dom, react-router-dom, framer-motion,
  lucide-react, clsx, tailwind-merge) — nic z tego nie dochodzi do bundla. Narzędzia buildowe
  w `devDependencies` to osobna sprawa: **`wrangler` jest PRZYPIĘTY dokładną wersją** (`4.118.0`,
  bez `^`), bo Workers Builds użyłby własnej, a `assets.run_worker_first` w `wrangler.jsonc`
  starsza wersja po cichu zignoruje — wtedy `/api/unfurl` odda `index.html` i karty linków
  przestaną działać bez żadnego błędu deployu. Podnosząc tę wersję, przetestuj endpoint
  (`wrangler dev` + curl) ZANIM zmergujesz. Bez realnej krypto i sieci — to symulacja.
- **Baner disclaimera MUSI zostać** na każdym widoku klienta (`Disclaimer` / `DisclaimerStrip`
  w `src/host/ClientView.tsx`, tekst „Simulation · mock data · unofficial, not affiliated with
  &lt;nazwa&gt;") — #1 lekka mitygacja ryzyka znaku towarowego. Nie usuwaj i nie skracaj.
- **Kolejność warstw hosta jest jedna i stoi w `:root` w `src/index.css`** (`--z-host-rail` <
  `--z-tour-backdrop` < `--z-tour-card` < `--z-disclaimer` < `--z-host-modal`). Żadnej gołej liczby
  `z-[…]` w `src/host/` ani w `src/components/tour/` — czytaj zmienną. Baner ma być **nad tourem**
  (backdrop 0.6 czerni robił z niego nieczytelną plamę na cały tour) i **pod dialogami**, które
  użytkownik sam otworzył (FAQ, ⌘K, About, mobilny switcher) — jego wyniesienie ponad wszystko
  wstawiało chip w środek otwartego panelu FAQ. Symulatory grają we własnej piaskownicy (max ~2000,
  `gossip.theme.css`) i nigdy nie sięgają pasm hosta.

## Gotchas

- **`npm run build` NIE jest bramką typów** (esbuild strzypuje) — `npm run typecheck` (tsc) puszczaj
  osobno. **Jeden błąd składniowy wycisza WSZYSTKIE diagnostyki semantyczne tsc** — nigdy nie odkładaj go
  jako „znanego"; tak chowało się 40 realnych błędów. `vite.config.ts` świadomie poza zakresem.
- **Karta share to `dist/c/<id>.html`, NIGDY `dist/c/<id>/index.html`.** Cloudflare ma domyślnie
  `html_handling: auto-trailing-slash`: folder-index każe `/c/damus` zrobić 307 na `/c/damus/`,
  czyli przekierowuje dokładnie ten URL, który ludzie wklejają w odpowiedziach. Płaski plik
  serwuje `/c/damus` z 200, a to `/c/damus/` dostaje 307 z powrotem. Zweryfikowane na
  `wrangler dev`, nie z dokumentacji.
- **`--screenshot` w headless Chrome zapisuje PNG i się NIE kończy** (zmierzone na Chrome 151,
  także z `--virtual-time-budget`; `--headless=old` wypadło w Chrome 132). Pętla na
  `execFileSync` robi pierwszy zrzut i wisi na drugim. Dlatego `og-client-cards.mjs` jedzie
  dziś przez CDP (jeden Chrome, `Page.captureScreenshot`) — jak `docs/clips/capture-faq.mjs`.
  Jeśli kiedykolwiek wrócisz do `--screenshot`: czekaj na **plik**, nie na kod wyjścia,
  i ubijaj całą grupę procesów — sam pid zostawia kilkanaście helperów.
- **Zrzut symulatora do karty share: czekaj na TREŚĆ, nie na pudełko, i wchodź przez logowanie.**
  `ClientView` układa stage natychmiast po dopasowaniu trasy, a chunk `lazy()` dochodzi znacznie
  później — warunek na sam prostokąt startuje kroki w pustej stronie i wywala się na losowym
  kliencie za każdym przebiegiem. Próg liczony w elementach, i **nisko**: ekran logowania Primala
  ma ich 19, przez co próg 30 zgłaszał „never rendered" dla w pełni namalowanej strony. Do tego
  `Page.navigate` + natychmiastowy `Runtime.evaluate` potrafi trafić w WYCHODZĄCY dokument
  (readyState już `complete`), więc `goto()` czeka najpierw na `Page.loadEventFired`.
  Dziewięciu z dwunastu klientów otwiera się na ścianie logowania — tabela `ENTRY` w generatorze
  przeklikuje wejście po WIDOCZNYCH etykietach; zmiana onboardingu klienta wywala `og:cards`
  z nazwą kroku, nie po cichu.
- **Klik w symulator z zewnątrz potrzebuje OBU dróg.** Prawdziwe `Input.dispatchMouseEvent`
  przechodzi hit-test (Keychat ignoruje syntetyczny `el.click()`), ale przez ten sam hit-test
  niewidoczny scrim zjada klik (modal powitalny Gossipa). Generator próbuje myszy, a gdy ekran
  nie drgnie — sięga po węzeł. I sprawdza „udało się" jako **zmiana ekranu ALBO zniknięcie
  kontrolki**: modal Gossipa jest portalowany poza stage, więc jego zamknięcie nie zmienia
  tekstu stage'u wcale.
- **Po zalogowaniu leci toast powitalny — 2500 ms** (`showToast` w Amethyst, Amethyst v1.12
  i Keychat). Trzy karty wyszły z nim na feedzie. Generator dośpi RESZTĘ tego okna licząc od
  wejścia, nie płaski sleep na wierzchu dopasowywania kadru. Geometrii urządzenia na karcie
  **nie licz trygonometrią** — obrót plus perspektywa robią z tego coś innego, niż wychodzi
  na kartce; `og-client-cards.mjs` mierzy `getBoundingClientRect()` gotowej karty i wywala
  się z liczbą pikseli wyjazdu.
- **Hotlinki DiceBear: zostało 12 URL-i, wyłącznie w preview** (9 Keychat, 3 Gossip) — łamią się offline
  i pod ostrym CSP. Klienci `ready` mają lokalne inline-SVG avatary; nie dokładaj nowych hotlinków.
- `useSimulator` (Context+reducer) jest **w większości nieużywany** — symulatory trzymają lokalny
  `useState`. Nie myl scaffoldingu z load-bearing.
- Feed **capuje wyświetlanie do ~25 notatek** (filtry działają na treści/kolejności, nie na liczbie).
- **Dark mode = klasa `dark` na `<html>`**: `main.tsx` ustawia, `Layout` przełącza, `useParentTheme`
  obserwuje. Bez tego symulator utknie w jednym motywie.
- **StrictMode jest wyłączony** (`main.tsx`) — świadomie, by uniknąć podwójnego montowania w stanach
  toura/efektów.
- **Escape należy do warstwy NA WIERZCHU, i to samo `data-sandstr-modal` o tym rozstrzyga.** Każdy
  dialog hosta (FAQ, ⌘K, About, mobilny switcher) stempluje ten atrybut; tour (`TourOverlay`,
  `HOST_MODAL_SELECTOR`) oddaje wtedy **całą** klawiaturę, nie tylko Escape — oba nasłuchy siedzą na
  `window`, więc zamknięcie FAQ kończyło też tour, a Enter na wpisie FAQ rozwijał odpowiedź *i*
  przewijał krok. `ClientSwitcher` rozstrzyga Escape **przed** swoim strażnikiem (jego własny arkusz
  też nosi ten atrybut) i **przed** `tourActive`. Nowy dialog: dodaj atrybut i własny Escape.
- **`position: fixed` w symulatorze = ekran telefonu, nie okno przeglądarki.** Ekran w
  `MobilePhoneFrame` ma `[transform:translateZ(0)]` właśnie po to (bezramkowa scena w `ClientView`
  ma to samo). `relative` + `overflow-hidden` NIE wystarczy — overflow nie przycina `fixed`, dopóki
  ten sam element nie jest jego blokiem zawierającym. Bez tego modal Keychata zaciemniał całą stronę,
  a niewidoczny scrim dropdownu Amethysta zjadał pierwszy klik w panel hosta.
  **…ale tylko dopóki po drodze nie ma DRUGIEGO transformu.** Blok zawierający dla `fixed` tworzy
  *najbliższy* transformowany przodek, a `motion.*` z `layout` albo z animacją wejścia trzyma
  `transform` także w spoczynku. Overlay renderowany wewnątrz takiego komponentu przyklei się do
  NIEGO, nie do ekranu: arkusze `MaterialCard` (share / menu ⋮ / paleta reakcji) lądowały na dole
  karty, na jej szerokość, poza kadrem — i `absolute`, i `fixed` dawały to samo. Reguła: overlay
  wewnątrz komponentu animowanego framerem **portaluj** (`createPortal`) do korzenia symulatora
  i tam dopiero użyj `fixed`; korzeń transformu nie ma. Zanim uwierzysz tej regule w nowym miejscu,
  sprawdź `getComputedStyle(przodek).transform` — arkusz Share nosił ten błąd od dnia powstania.

## Definition of done

1. `npm run build` przechodzi — **pokaż output**.
2. **Runtime:** odpal dev, wejdź w dotknięty symulator, sprawdź konsolę (**0 błędów**) i zachowanie
   klik-po-kliku — nie zakładaj sukcesu bez dowodu.
3. Zmiany symulatora **izolowane do jego katalogu**; interfejs komend toura nienaruszony.

## Skille (`.claude/skills/`) — kiedy który

| Kiedy | Skill |
|---|---|
| Wierność, tokeny, recon, screen-map; `src/simulators/<klient>/`, `docs/refs/` | `wierna-reprodukcja-klienta` |
| Podpięcie klienta, status, galeria, ⌘K, rail; `registry.tsx`, `shared/configs.ts`, `Gallery.tsx` | `rejestr-i-galeria` |
| Kroki toura, kotwice `data-tour`, spotlight; `src/data/tours/`, `src/components/tour/`, `showMe` | `tour-i-kotwice` |
| Piszesz albo rewidujesz FAQ; `src/data/faq/`, `docs/FAQ.md` | `faq-klienta` |
| „czego tu brakuje", martwy przycisk, audyt luk; `docs/gaps/`, `docs/GAPS.md` | `audyt-luk-symulatora` |
| Marka, domena, disclaimer, znak towarowy, licencje, og/robots, „czy możemy to pokazać" | `branding-i-ryzyko-prawne` |
| Klip demo, teaser, screencast, shoty; `docs/clips/` | `nagrywanie-klipow` |
| Domknięcie sesji: retro, log decyzji, notatka przekazania, promocja wniosku do pamięci | `zamykanie-sesji` |

## Dokumenty

- `docs/refs/<klient>/screen-map.md` — **AUTORYTATYWNY** opis realnego klienta (+ `shots/`); czytaj przed
  zmianą jego symulatora. Keychat i Gossip screen-mapy NIE mają.
- `docs/FIDELITY.md` — tokeny marki per klient + ich pliki-źródła w repo klienta + kanały opt-in.
- `docs/GAPS.md` + `docs/gaps/<klient>.md` (schemat: `docs/gaps/README.md`) — ile z realnego klienta mamy
  (736 wierszy w dziesięciu ledgerach, stan 2026-08-13); czytaj ZANIM dodasz `showMe` w FAQ.
- `docs/TOURS.md` — reguły silnika tourów; czytaj przed edycją `src/data/tours/` i `src/components/tour/`.
- `docs/VERSIONS.md` — wersjonowanie symulatorów per klient: procedura freeze starszej wersji. Czytaj
  ZANIM przebudujesz symulator do nowej wersji realnego klienta — freeze idzie PRZED przebudową.
- `docs/FAQ.md` — stan wdrożenia FAQ (230 wpisów, 133 mini-toury, 8 klientów); kontrakt autorski
  w `src/data/faq/README.md`.
- `docs/COMPARE.md` — `/compare`: macierz możliwości (9 osi × 8 klientów) + ten sam post w ośmiu
  klientach. Czytaj ZANIM dotkniesz `src/data/capabilities.ts` — werdykt bez cytatu i bez wersji
  jest twierdzeniem o cudzym produkcie, a `unknown` jest pełnoprawną wartością, nie brakiem.
- `docs/OUTREACH.md` — jak promować to na Nostrze: zmierzone formy, które działają na
  koncie właściciela, realne tematy pytań z `#asknostr`, playbook odpowiadania i lista
  rzeczy, których nie wolno twierdzić. Czytaj ZANIM zaczniesz robić materiał promocyjny.
- `docs/clips/README.md` + `docs/clips/faq-teaser.md` — scenariusze klipów demo.
- `docs/AUDIT.md` — snapshot historyczny; „owned-IP-first / front door = Nostr Kitten" jest NIEAKTUALNE.
  Tak samo przeterminowane `SHIP-AND-GRANT.md` i `GRANT-WOW.md` — sprawdź ich zarzuty, zanim je powtórzysz.
- `README.md` (przegląd + wydzielenie), `PRIVACY.md`, `TRADEMARKS.md`, `THIRD-PARTY.md`.

## Licencja / origin

MIT, „Copyright (c) 2026 ptrio42" (`LICENSE`) — pokrywa kod w repo, nie cudze marki. Nazwa finalna
**Sandstr**, domena produkcyjna **`sandstr.app`**; reszta decyzji brandingowych → skill
`branding-i-ryzyko-prawne`.
Origin: extraction spike (2026-07-14) z symulatorów żyjących w przewodniku `nostrich.love` — mechanika
w `README.md`, audyt z tamtej sesji w `docs/AUDIT.md`. Notatki osobiste: `CLAUDE.local.md` (gitignored).
