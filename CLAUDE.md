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
**Zero backendu, sieci, auth, realnej krypto** — mock data, fejkowe klucze, symulowane interakcje liczone
w przeglądarce. Deploy = statyczne pliki.

## Komendy

```bash
npm run dev        # Vite dev server -> http://localhost:5173
npm run build      # klient + bundle SSR + scripts/prerender.mjs + scripts/verify-headers.mjs
npm run preview    # podgląd builda
npm run typecheck  # tsc --noEmit; NIE jest bramką builda — patrz Gotchas
```

Podgląd w sesji (`.claude/launch.json` → `preview_start`): **sandstr** (dev, 5173) ·
**sandstr-preview** (4173) · **sandstr-workers** (`wrangler dev`, 8787).

## Mapa kodu

- **`src/registry.tsx` — punkt wejścia.** `id → { Component (lazy), platforma, ramka, tour, status, kind }`;
  tu podpinasz klienta. **Dwie listy:** `clients` (eksport) = to, co produkt POKAZUJE (galeria, ⌘K, rail);
  `unlisted` (dziś sam Nostr Kitten) = routowalne pod `/c/<id>`, ale niewidoczne. `getClient()` czyta obie
  — to trzyma easter-egg przy życiu.
- **`src/simulators/` — SERCE.** 11 katalogów klientów (10 brandowanych + `nostr-kitten`) + `shared/`
  (`SimulatorShell`, `MobilePhoneFrame`, `NoteCard`, `useParentTheme`, `configs.ts` = metadata klientów).
- **`src/data/`** — `mock/` (users/notes/threads/relays; treść dla WSZYSTKICH symulatorów), `tours/`, `faq/`.
- **`src/components/`** — `tour/` (silnik: Provider/Overlay/Tooltip + `tourStorage`), `faq/`
  (mostek `FaqMiniTourLauncher`).
- **`src/host/`** — `Layout`, `Gallery`, `ClientView` (klient + ramka + **baner disclaimera**),
  `CommandPalette`, `ClientSwitcher`, `FaqPanel`.
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
- **Bez nowych zależności npm** (są: react, react-dom, react-router-dom, framer-motion, lucide-react,
  clsx, tailwind-merge). Bez realnej krypto i sieci — to symulacja.
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
  (533 wiersze); czytaj ZANIM dodasz `showMe` w FAQ.
- `docs/TOURS.md` — reguły silnika tourów; czytaj przed edycją `src/data/tours/` i `src/components/tour/`.
- `docs/FAQ.md` — stan wdrożenia FAQ (230 wpisów, 133 mini-toury, 8 klientów); kontrakt autorski
  w `src/data/faq/README.md`.
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
