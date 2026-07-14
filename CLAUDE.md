# Sandstr — CLAUDE.md

Samodzielny, w 100% kliencki produkt: **„try 10 Nostr clients in your browser — no keys, no install"**.
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
- **`src/registry.tsx`** — mapa `id → { Component (lazy), platforma, ramka, tour }`. **TU dodajesz/mapujesz
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
- **Baner „SIMULATION · unofficial · mock data" MUSI zostać** na każdym widoku klienta (`ClientView`) —
  to #1 mitygacja ryzyka znaku towarowego. Nie usuwaj.

## Branding / ryzyko prawne (kontekst decyzji — WAŻNE)

**Owned-IP-first.** Jako samodzielny/monetyzowalny produkt, reprodukcja marek cudzych klientów
(Damus/Primal/Amethyst…) niesie ryzyko znaku towarowego i trade-dress, którego darmowy przewodnik
edukacyjny nie miał. Kierunek: **front door = Nostr Kitten** (oryginalny, bezpieczny prawnie klient
parodia GeoCities), realne klienty tylko **opt-in / za zgodą** zespołów, trwały disclaimer na każdym
widoku. **„Sandstr" to nazwa robocza** — trywialna do zmiany.

## Liderzy vs reszta

- **Liderzy** (dopieszczeni 2026-07-14): **Snort, Amethyst, Nostr Kitten, YakiHonne**.
- **Druga fala** (odłożone: słabsza wierność / bugi): Damus (defer, **nie cut** — dobry motyw iOS),
  Primal, Keychat, Olas, Coracle, Gossip.

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
  architektura + plan wydzielenia, pozycjonowanie/branding/ryzyka prawne, synteza + roadmapa. Główne
  źródło kontekstu decyzji (samowystarczalne, nie zależy od pamięci sesji).
- `README.md` — przegląd + jak dokładnie wyodrębniono feature z oryginału.
- Origin: audyt powstał w sesji w `../nostr-beginner-guide` (pamięć `sandstr-simulators-spinoff`); ten
  katalog to inny projekt, więc tamta pamięć **nie** ładuje się tu automatycznie — dlatego audyt jest
  w `docs/AUDIT.md`.
- Osobiste / lokalne notatki: `CLAUDE.local.md` (gitignore), nie tutaj.
