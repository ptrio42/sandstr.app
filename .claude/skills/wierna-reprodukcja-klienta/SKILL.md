---
name: wierna-reprodukcja-klienta
description: Wierne odtwarzanie realnego klienta Nostr — recon repo klienta, screen-map z nagrania, tokeny marki, kolejność akcji w note action barze, fidelity pass side-by-side. Użyj gdy pada „odtwórz X", „popraw wierność", „recon", „screen-map", „tokeny", „akcent", „REC vs REPO", „kolejność akcji", albo gdy dotykasz czegokolwiek w `src/simulators/<klient>/`, `<klient>.theme.css`, `docs/refs/<klient>/` lub `primaryColor` w `src/simulators/shared/configs.ts`.
---

# Wierna reprodukcja realnego klienta Nostr

Wierność wobec prawdziwej appki JEST produktem, a wszystkie odtwarzane klienty są open source — to
**port z ground truth, nie zgadywanie z pamięci**.
**Zasada nadrzędna:** `docs/refs/<klient>/screen-map.md` jest AUTORYTATYWNY — twoja pamięć i ten skill
nie są. Przeczytaj screen-mapę dotkniętego klienta ZANIM zmienisz pierwszą linię; samo źródło klienta bez
realnego renderu daje plausible-but-wrong (o mało nie wylądowało logo tam, gdzie Amethyst ma „All Follows ⌄").

## Router — co przeczytać dla którego klienta

| Klient | Szczegóły marki | Ground truth | Ile z tego mamy |
|---|---|---|---|
| Damus | `references/damus.md` | `docs/refs/damus/screen-map.md` | `docs/gaps/damus.md` |
| Amethyst | `references/amethyst.md` | `docs/refs/amethyst/screen-map.md` | `docs/gaps/amethyst.md` |
| Primal (web) | `references/primal.md` | `docs/refs/primal/screen-map.md` | `docs/gaps/primal.md` |
| Snort | `references/snort.md` | `docs/refs/snort/screen-map.md` | `docs/gaps/snort.md` |
| Wisp | `references/wisp.md` | `docs/refs/wisp/screen-map.md` | `docs/gaps/wisp.md` |
| Coracle | `references/coracle.md` | `docs/refs/coracle/screen-map.md` | `docs/gaps/coracle.md` |
| Nostur | `references/nostur.md` | `docs/refs/nostur/screen-map.md` | `docs/gaps/nostur.md` |
| YakiHonne, Keychat, Gossip, Primal-mobile, Nostr Kitten, Olas | `references/pozostali.md` | screen-mapę ma tylko YakiHonne | `docs/gaps/{yakihonne,keychat,gossip}.md` |

Tokeny, ich pliki-źródła w repo klienta i kanały opt-in: `docs/FIDELITY.md` (tam też korekty kolorów
z `docs/AUDIT.md` — AUDIT to snapshot historyczny, jego rekomendacjom kolorów NIE ufaj).

## Proces reference-first (kolejność jest obowiązkowa)

1. **Referencja LAYOUTU = realny render.** Bez nagrania/screenów w `docs/refs/<klient>/shots/` NIE startuj
   — web-klienty to SPA za Cloudflare, `WebFetch` zwraca pustą skorupę.
2. **Klatki:** maszyna ma `ffmpeg`, NIE ma ImageMagick. Na web-appkach scene-detect prawie nie strzela
   (płynny scroll) — podstawą jest przebieg periodyczny `fps=1/3`, scene-detect to dodatek.
3. **Recon repo klienta** — przypnij commit/tag ze sklepu (nie losowy `main`), zanotuj licencję i autora
   (lądują w `src/registry.tsx`: `repo`, `upstreamLicense`, `homepage`, `installNote`). Nowy klient
   dopisuje też wiersz w `THIRD-PARTY.md` — tabela „referenced (fakty o UI: hexy, kolejność akcji) vs
   copied (logo/artwork, stringi)"; to ona, nie rejestr, niesie obowiązek atrybucji.
4. **Zapisz `docs/refs/<klient>/screen-map.md`** verbatim, z cytatami `plik:linia` do repo klienta. To jest
   commitowany spec — bez niego klient nie ma prawa dostać `status: 'ready'`.
5. **Buduj token-first:** najpierw `<klient>.theme.css`, potem komponenty i ekrany. Wyrównaj
   `primaryColor`/`secondaryColor` w `src/simulators/shared/configs.ts` — dla Amethysta, Coracle, Keychata
   i Gossipa te hexy DO DZIŚ kłamią (szczegóły w `references/`).
6. **Weryfikacja side-by-side** z realnym screenem/klatką, nie z pamięcią. To był brakujący krok.

## [REC vs REPO] — reguła pierwszeństwa

**Nagranie wygrywa o LAYOUT, repo wygrywa o dokładny HEX, nazwy ikon-assetów i labelki.** Każdy rozjazd
MUSI trafić do screen-mapy oznaczony `[REC vs REPO]`, inaczej następny agent „naprawi" go z powrotem.
Realne przypadki: **Nostur** — nagranie to pre-iOS-26 `MainTabs15` (5. zakładka = koperta Messages + osobny
FAB), repo ma też `MainTabs26` bez Messages; bierzemy nagranie. **Wisp** — nagranie miało Fiat Mode ON,
repo-default to OFF; szipujemy repo-default (sats + ₿). **Coracle** — polskie ekrany w nagraniu to
**nstart** (`start.njump.me`), osobny projekt, poza zakresem. Bramkowane UI to legalny powód, dla którego
nagranie pokazuje MNIEJ niż repo (Nostur: 3 z 13 zakładek feedu, reszta za
`viewFollowingPublicKeys.count > 10`) — szipuj to, co widać, i opisz bramkę.

**Wyjątek Display-P3 od „repo hex zawsze wygrywa":** gdy `*.colorset/Contents.json` ma
`"color-space": "display-p3"`, zwykły hex z repo NIE ISTNIEJE — są trzy odpowiedzi. Nostur: naiwny hex
`#33A2A6`, konwersja kolorymetryczna do sRGB `#00A5A8`, a urządzenie maluje `#00BDA9` i to bierzemy.
Sprawdź `"color-space"` zanim zaufasz konwersji; trzy wartości i powód wyboru zapisz w screen-mapie.

## Detal-zabójca wierności

Jeden zły stan aktywny czyta się natychmiast jako inna appka — mocniej niż złe tło. **Nostur: `TabButton`
renderuje label ZAWSZE w `theme.accent`, a zaznaczenie to WYŁĄCZNIE 1px podkreślenie**; odruchowe „szary →
biały" to tu po prostu inna apka. Uwaga na zasięg: `TabButton` to sub-taby feedu / profilu / notyfikacji —
**dolny tab bar jest natywny iOS-owy** (aktywny akcent, nieaktywny systemowy szary `#8E8E93`). Czytaj realny komponent, zanim założysz zwykły idiom. Odtwarzaj BUGI
upstreamu (Snort: kafelek Relays bez tła; Wisp: leaki M3 `secondaryContainer #4A4458`) i KASUJ tam, gdzie
realny klient jest prostszy (Snort nie ma kolorowania składni — usunięcie highlightera zabrało przy okazji
`dangerouslySetInnerHTML`).

## Twarde zasady (łamanie = regres, nie kwestia gustu)

- **Katalog per symulator.** Nie dotykaj innych klientów ani `shared/` — `shared/` jest współdzielony
  przez 10 symulatorów, więc zmiana tam jest zmianą u wszystkich naraz.
- **Interfejs komend toura nietykalny** (`tourCommand` / `onCommandHandled` / `className` + `switch`) i
  każda kotwica `data-tour` — inaczej pada guided tour i mini-toury FAQ (`showMe`). Reguły silnika są
  w `docs/TOURS.md`; przeczytaj przed ruszeniem kotwicy.
- **Zero nowych zależności npm** (masz: react, react-dom, framer-motion, lucide-react, clsx,
  tailwind-merge) i **zero sieci / realnej krypto** — to symulacja liczona w przeglądarce.
- **Zero requestów zewnętrznych:** avatary jako inline-SVG robohash —
  `src/simulators/<klient>/components/Avatar.tsx` (Primal: `primal/web/components/Avatar.tsx`), seed
  hashowany FNV-1a; **wyjątek: Coracle celowo powiela djb2 upstreamu** — nie „ujednolicaj". Media jako
  `data:`-URI z `getSampleImages` (`src/data/mock/utils.ts:208`). Hotlink do DiceBear/Unsplash łamie się
  offline i pod CSP, i czyta się jako „fake".
- **Baner disclaimera zostaje** — `Disclaimer` + `DisclaimerStrip` w `src/host/ClientView.tsx`, dosłownie
  „SIMULATION · mock data · unofficial, not affiliated with {nazwa klienta}", oba z `data-tour-keep-clear`.
  To #1 lekka mitygacja ryzyka znaku towarowego. **`status: 'ready'` w `src/registry.tsx` wymaga
  screen-mapy + fidelity passu**; `lead` jest DERYWOWANE, nie ustawiaj ręcznie; `preview` nie udawaj
  skończonym.

## Komponenty, które montuje `/compare`

`/compare` pokazuje cztery powierzchnie ośmiu klientów obok siebie i montuje **prawdziwe
komponenty danego klienta**, nie podróbki (`docs/COMPARE.md`). Dwie konsekwencje przy
przebudowie symulatora:

- **Nie odbieraj eksportu.** Wciągnięte są `NoteCard`/`PostCard`/`MaterialCard`,
  `LoginScreen`/`WelcomeScreen`, `Compose*` oraz nawigacja (`TabBar`, `BottomNav`,
  `BottomBar`, `LeftSidebar`, Snortowy `Rail`, Coracle’owy `Sidebar`). Zmiana propsów jest OK
  — typecheck wskaże adapter w `src/host/compare/surfaces/`. Schowanie komponentu z powrotem
  do środka symulatora nie jest.
- **Motyw niosą KLASA i `data-theme` naraz.** Arkusze się nie zgadzają: Damus i Coracle
  kluczują na klasie (`.damus-simulator.dark`), Amethyst i YakiHonne na atrybucie
  (`.amethyst-simulator[data-theme="dark"]`). Root każdego symulatora ustawia jedno i drugie,
  więc nigdy to nie wypłynęło — dopóki `/compare` nie ustawiło samej klasy i Amethyst wyszedł
  jasny na ciemnej stronie. Przebudowujesz root: ustaw oba.

## Checklist fidelity pass (zanim powiesz „gotowe")

1. `npm run build` przechodzi — **pokaż output**. Build NIE jest bramką typów → osobno `npm run typecheck`.
2. Live click-through w podglądzie, każda powierzchnia, w OBU motywach jeśli klient ma oba.
3. **0 błędów w konsoli** — bufor konsoli podglądu nie czyści się po reloadzie ANI po restarcie serwera;
   czysty odczyt daje tylko NOWA KARTA. Ufaj live-DOM, nie staremu logowi.
4. `document.querySelectorAll('.<klient>-simulator button button').length === 0` — **root Primala to
   `.primal-web`**, nie `.primal-simulator`; ze złą klasą test przechodzi na pustym zbiorze. Oraz
   `[...root.querySelectorAll('p')].filter(p => p.querySelector('div,p'))` pusta — `Avatar` renderuje
   `<div>`, więc `<p className="flex items-center">` z awatarem to niepoprawny HTML.
5. Overlaye (compose/thread/drawer/settings) renderuj w stanie **KOŃCOWYM** — podgląd zamraża framer ORAZ
   CSS `@keyframes` na klatce 0, więc animacja wejścia jest i zablokowana, i nieweryfikowalna.
6. **`npm run og:cards`** — karta link-preview `/c/<id>` **FOTOGRAFUJE ten symulator**
   (`public/og/<id>.png`, generator `scripts/og-client-cards.mjs`). Każda widoczna zmiana, którą
   właśnie zrobiłeś, jest w niej nieaktualna, dopóki nie przepuścisz generatora — a to jedyny obrazek
   produktu, który podróżuje po cudzych feedach. Dotyczy też zmiany `primaryColor`: karta bierze
   z niego poświatę i kolor linii „try it in your browser". **Jeśli ruszałeś onboarding/logowanie
   klienta** (albo etykiety jego przycisków wejścia), zaktualizuj tabelę `ENTRY` w generatorze —
   dziewięciu z dwunastu klientów otwiera się na ścianie logowania i generator przeklikuje wejście
   po WIDOCZNYCH etykietach, żeby karta nie reklamowała formularza logowania. Zmiana etykiety wywali
   `og:cards` z nazwą kroku i tekstem ekranu; to jedyny alarm.
7. Zmiany izolowane do katalogu symulatora; screen-map i labelowane PNG zacommitowane. Surowe wideo
   i dumpy klatek ignoruje `docs/refs/.gitignore`: `*.mp4/*.mov/*.webm/*.mkv` + katalogi `frames/`,
   `sheets/`, `full/` — **contact sheet leżący luzem jako `sheet_*.jpg` NIE jest ignorowany**, wrzuć go
   do `sheets/`.
