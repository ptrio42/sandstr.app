# Gossip — gap ledger

> Ground truth: **brak `docs/refs/gossip/screen-map.md`** — jedyne cytowalne źródło to
> `docs/FIDELITY.md` § „Gossip — desktop" (dalej **FID**) · Sim: `src/simulators/gossip/`
> Audited: 2026-08-05 · Registry status: preview · Sim LOC: 1002 TS/TSX (+923 CSS)

> **Zasada tego pliku.** Nie ma screen-mapy, więc wiersz powstaje tylko wtedy, gdy da się go oprzeć
> albo o FID, albo o **martwy/zepsuty kod w naszym symulatorze** (kontrolka renderuje się i nic nie robi,
> stan nikt nie czyta, pole nie istnieje w typie). Wszystko inne, co realny Gossip pewnie ma, ale czego
> FID nie nazywa, leci do sekcji **Poza zakresem / do recon** — nie do tabeli.
> `statusNote` w rejestrze mówi wprost: „The real Gossip is a native desktop app; this is a rough web
> sketch" (`src/registry.tsx:244`) — ledger to potwierdza w każdym wierszu.

## Rollup

| missing | dead | partial | unreachable | unanchored | ok |
|---|---|---|---|---|---|
| 9 | 11 | 6 | 5 | 4 | 2 |

**Top 3 do zrobienia:** gos-29 (+gos-30) · gos-21 · gos-02

> **Aktualizacja 2026-08-07:** `gos-01`, `gos-05` i `gos-09` naprawione — wszystkie trzy były błędami
> typów wyciszonymi przez martwy `npm run typecheck` (patrz Gotchas w `CLAUDE.md`). Rollup wyżej to
> uwzględnia; `gos-01` zjechał z `dead` na `unanchored` (ekran działa, Gossip nadal nie ma kotwic).

## Gaps

| ID | Surface (ścieżka w UI) | § | Status | Gap | Evidence | FAQ impact | Effort |
|---|---|---|---|---|---|---|---|
| gos-01 | Feed → klik w notatkę → Thread | — | ~~dead~~ → unanchored | **NAPRAWIONE 2026-08-07.** Było: wywalało CAŁĄ aplikację hosta na białą stronę. Dwie przyczyny w jednym ekranie: `note.replies?.map(...)` wołało `.map` na **liczbie** (`replies: number`), a `getUserByPubkey(n.author)` czytało pole `author`, którego `MockNote` nie ma. Fix: martwa pętla usunięta (odpowiedzi to nadal gos-02), `n.author` → `n.pubkey`. Potwierdzone runtime (1440×900): klik w pierwszą notatkę → nagłówek „Thread", nota główna z autorem „Pierre from Paris", `#root` 31 kB, baner disclaimera na miejscu, 0 błędów konsoli. **Zostaje `unanchored`** — ekran działa, ale Gossip nie ma ani jednej kotwicy `data-tour`. W `src/` **nadal nie ma `ErrorBoundary`** (osobna, otwarta rekomendacja) | `screens/ThreadScreen.tsx:29,96` · `src/data/mock/types.ts:61,70` | blocks-showme | S |
| gos-02 | Thread → lista odpowiedzi | — | missing | Po naprawie gos-01 wątek pokazuje **wyłącznie notę główną** — martwa pętla (`return null` z komentarzem „In a real app, we'd fetch the reply note") została usunięta, bo to ona rzucała. **Korpus odpowiedzi jednak ISTNIEJE** (`mockThreads`: 21 wątków z pełnymi notami-odpowiedziami, eksportowany z `src/data/mock`) i Snort już z niego renderuje wątek — problem w tym, że roota wątków są generowane osobno od `mockNotes`, więc żadna nota z feedu nie ma dopasowanego wątku (Snort: `find(t => t.rootNoteId === note.id \|\| t.notes.some(...)) ?? null`) | `screens/ThreadScreen.tsx:96-99` · `src/data/mock/threads.ts:630,637` · `src/simulators/snort/SnortSimulator.tsx:249-251` | blocks-showme | M |
| gos-03 | Thread → wiersz akcji (Reply / repost / like / zap) | — | dead | Cztery `<button>` **bez `onClick`** — żaden nie ma nawet `stopPropagation`. Od naprawy gos-01 (2026-08-07) ekran jest osiągalny, więc te cztery martwe przyciski są teraz **widoczne dla użytkownika** | `screens/ThreadScreen.tsx:51,57,63,69` | breaks-showme | S |
| gos-04 | Feed → notatka → Reply / Repost / Like / Zap | — | dead | Wszystkie cztery mają `onClick={(e) => e.stopPropagation()}` i **nic więcej** — klik tylko blokuje otwarcie wątku. Liczniki się nie zmieniają, nie ma stanu „zalajkowane" | `screens/FeedScreen.tsx:90,96,102,108` | breaks-showme | S |
| gos-05 | Feed → notatka → licznik odpowiedzi | — | ~~partial~~ → ok | **NAPRAWIONE 2026-08-07.** Było: `{note.replies?.length \|\| 0}` na **liczbie** → `.length` było `undefined` → **zawsze 0**, podczas gdy reposty/lajki/zapy pokazywały realne wartości. Fix: `{note.replies \|\| 0}`. Runtime: trzy pierwsze noty renderują `1·2·16·0`, `9·12·82·1`, `1·1·22·0` — licznik odpowiedzi wreszcie zmienny | `screens/FeedScreen.tsx:94` · `src/data/mock/types.ts:70` | none | S |
| gos-06 | Feed → nagłówek → „Filter" | — | dead | `<button className="gossip-header-btn">` bez `onClick`; nigdzie w katalogu nie ma panelu/sheetu filtrów | `screens/FeedScreen.tsx:35-40` | blocks-showme | M |
| gos-07 | Feed → awatar autora / People → karta osoby → **ekran profilu** | — | missing | Ekranu profilu **nie ma w `screens/` w ogóle**: `renderContent()` nie zna case'a `profile`, a `viewProfile` tylko ustawia `state.selectedUser`, którego **nikt nie czyta**. Wtórnie martwy jest przez to klik w awatar w feedzie i w kartę w People — runtime potwierdzone (klik w kartę osoby nie zmienia ani bajtu DOM: `innerHTML.length` identyczny) | `GossipSimulator.tsx:20,51-56,98-149` · `screens/FeedScreen.tsx:75-78` · `screens/PeopleScreen.tsx:34` | breaks-showme | M |
| gos-08 | People → nagłówek → „Search" | — | dead | `<button>` bez `onClick`; w całym katalogu nie ma ani pola wyszukiwania, ani ekranu wyników (grep `search` w `*.tsx` = tylko ten napis) | `screens/PeopleScreen.tsx:18-24` | blocks-showme | M |
| gos-09 | People → karta → „N following / N followers" | — | ~~partial~~ → ok | **NAPRAWIONE 2026-08-07.** Było: czytało `user.following?.length` i `user.followers`, a `MockUser` ma `followingCount` / `followersCount` → **każda z 55 kart pokazywała „0 following 0 followers"**. Runtime po fiksie: `423 following / 25430 followers`, `312 / 18920`, `289 / 22100`, … | `screens/PeopleScreen.tsx:49-50` · `src/data/mock/types.ts:49-50` | none | S |
| gos-10 | Relays → nagłówek → „Refresh All" | — | dead | `<button>` bez `onClick`. Nie ma czego odświeżać — statusy są statyczne, nie ma pętli reconnect | `screens/RelaysScreen.tsx:55-61` | blocks-showme | S |
| gos-11 | Relays → per-relay flaga **outbox** | FID | missing | FID nazywa **outbox/gossip relay model** sygnaturą klienta i mówi wprost o „Relays screen z per-relay read/write/**outbox**". Nasz typ `Relay` ma tylko `read`/`write`; nie ma kolumny, przełącznika ani żadnej wzmianki o outboxie | `screens/RelaysScreen.tsx:3-10,94-113` | blocks-showme | M |
| gos-12 | Settings → Privacy → „Private mode" | — | dead | `<div className="gossip-toggle">` **bez `onClick`** (w przeciwieństwie do sekcji General). Runtime: klik nie zmienia klasy | `screens/SettingsScreen.tsx:58-60` | breaks-showme | S |
| gos-13 | Settings → Privacy → „Tor connection" | — | dead | j.w. — martwy toggle. Runtime potwierdzone | `screens/SettingsScreen.tsx:67-69` | breaks-showme | S |
| gos-14 | Settings → Account → „Export private key" | — | dead | `<button className="gossip-relay-btn">Export</button>` bez `onClick`; nie ma ekranu ani modalu z kluczem (brak użycia `MockKeyDisplay` z `shared/`) | `screens/SettingsScreen.tsx:80` | breaks-showme | M |
| gos-15 | Settings → Account → „Delete account" | — | dead | `<button ... danger>Delete</button>` bez `onClick` i bez potwierdzenia — nic nie kasuje | `screens/SettingsScreen.tsx:87` | breaks-showme | S |
| gos-16 | Settings → General → 5 przełączników (media previews / auto-load / compact / hide reply counts / anonymous zaps) | — | dead | Kciuk się przesuwa, ale stan `settings` żyje **wyłącznie w `useState` tego ekranu** i nikt go nie czyta — „Compact mode" nie zagęszcza feedu, „Show media previews" nic nie pokazuje (patrz gos-36), „Hide reply counts" nie chowa licznika. Grep: żaden inny plik nie importuje tego stanu. Runtime: stan jest per-mount — przełącz „Compact mode", wyjdź na Feed, wróć i jest z powrotem domyślny | `screens/SettingsScreen.tsx:19-23,35-48` | breaks-showme | M |
| gos-17 | Skróty klawiszowe ⌘1–⌘4 / ⌘N / Esc (globalne) | — | dead | Symulator **reklamuje** je w dwóch miejscach — etykiety `⌘1 ⌘2 ⌘3 ⌘,` w wierszach sidebara i tabelka „KEYBOARD SHORTCUTS" w modalu powitalnym — a globalnego listenera nie ma nigdzie. Jedyna obsługa klawiatury to `onKeyDown` na textarea komposera i na inpucie add-relay. Runtime: `dispatchEvent(⌘2)` i `⌘N` nie zmieniają widoku ani nie otwierają komposera. Esc „Go back" z wątku też nie istnieje | `components/Sidebar.tsx:45-48,86` · `components/OnboardingTour.tsx:43-61` · brak listenera w `GossipSimulator.tsx:27-96` | breaks-showme | M |
| gos-18 | Sidebar → wiersze nawigacji (Feed / People / Relays / Settings) | — | unanchored | Myszą działa, więc nie `dead`, i wszystkie cztery pozycje są na miejscu, więc nie `partial`. Ale: to `<div onClick>`, nie `<button>` — brak fokusa, Entera i roli, **żaden z czterech wierszy nie figuruje w drzewie dostępności jako interaktywny** (na kliencie sprzedającym się jako keyboard-first — gos-17 — to funkcjonalna luka, nie kosmetyka). Dla FAQ ważniejsze: to **jedyna droga do People/Relays/Settings**, a wiersze nie mają kotwicy i są nieodróżnialne bez `:nth-child` | `components/Sidebar.tsx:79-88` | blocks-showme | S |
| gos-19 | Sidebar → stopka → awatar bieżącego użytkownika | — | partial | `src="/simulators/avatars/avatar-1.svg"` — **katalog `public/simulators/` nie istnieje**, to jedyne odwołanie do tej ścieżki w całym `src/`. Runtime: `naturalWidth === 0`, w kadrze widać ikonę zepsutego obrazka | `components/Sidebar.tsx:94` | breaks-showme | S |
| gos-20 | Sidebar → stopka → wiersz konta („Nostr User / @nostruser") | — | partial | Tożsamość w stopce jest **zmyślona i sprzeczna z resztą symulatora**: post z komposera leci jako `mockUsers[0]` = „Nostrich Nina" — runtime potwierdzone (nowa nota na czele feedu ma to nazwisko, nie „Nostr User"). Wtórnie: to zwykły `<div>` bez handlera (nie prowadzi do własnego profilu, nie kopiuje npuba, nie przełącza tożsamości) — ale `dead` wymaga, żeby realna apka reagowała, a FID nie mówi, co Gossip trzyma w tym rogu, więc liczymy tylko udowodniony rozjazd tożsamości | `components/Sidebar.tsx:93-99` · `GossipSimulator.tsx:67-71` | breaks-showme | S |
| gos-21 | Modal powitalny „Welcome to Gossip" | — | partial | Trzy problemy naraz: (1) `showTour: true` jest zaszyte w stanie startowym i **nic tego nie zapamiętuje**, więc modal zasłania każdy pierwszy render; (2) overlay nie ma `onClick`, nie ma też handlera Esc — **jedyne wyjście to guzik „Get Started"**; (3) `.gossip-tour` ma stałe 667 px i `overflow: hidden` bez `max-height`, a overlay jest uwięziony w kontenerze symulatora (nie w viewporcie, bo host ma przodka z `transform`) — więc już przy 1280×800 modal wystaje poza ramkę sima, przy 1280×720 tytuł jest przycięty przez `overflow:hidden` hosta, a przy wysokości viewportu ≤ ~700 px guzik wychodzi **całkowicie poza ekran** (runtime 1280×620: `btn.top = 628 > innerHeight = 620`, `elementFromPoint` zwraca kontener hosta) → jedyne wyjście znika i symulatora nie da się w ogóle użyć. Każdy `showMe` musi startować zza tego modalu | `GossipSimulator.tsx:35,175-177` · `components/OnboardingTour.tsx:9,64-68` · `gossip.theme.css:809-816` | blocks-showme | S |
| gos-22 | Nawigacja = wąski pionowy **icon-rail** | FID | missing | FID nazywa to killerem i **wprost punktuje nasz obecny kształt**: „wąski pionowy icon-rail po lewej + cienki status bar na dole (sim: generyczny »Twitter sidebar« = największy błąd)". Mamy 280 px resizowalny sidebar z logo, wielkim zielonym CTA „Compose", nagłówkiem sekcji „NAVIGATION", etykietami tekstowymi i stopką konta | `components/Sidebar.tsx:25,44-49,52-106` · `GossipSimulator.tsx:34` | blocks-showme | L |
| gos-23 | Cienki **status bar** na dole | FID | missing | Druga połowa killera z FID. Nie ma go w żadnym ekranie i **nie ma nawet klasy** w motywie (pełna lista selektorów `gossip.theme.css` nie zawiera niczego typu `gossip-status*`). Efekt dla FAQ: pytanie „skąd wiem, czy jestem połączony / co apka teraz robi?" nie ma gdzie wskazać — poza ekranem Relays | absent w `screens/` i `gossip.theme.css` | blocks-showme | M |
| gos-24 | Notatka → surowy **JSON eventu** | FID | missing | FID: developer-tool DNA = „surowy JSON eventu". Grep `json` po wszystkich `*.tsx` w katalogu = 0 trafień; nota nie ma też menu „…", z którego dałoby się go otworzyć | absent w `screens/FeedScreen.tsx:64-115` i `screens/ThreadScreen.tsx:32-77` | blocks-showme | M |
| gos-25 | Kolorowe chipy **pubkey / eventid / relay** w treści | FID | missing | FID podaje nawet tokeny podświetleń (relay `#A040A0`, pubkey green, eventid red). Treść noty renderuje się jako goły tekst w jednym `<div>`; w motywie nie ma żadnej klasy chipa/podświetlenia. Mentions/hashtags z mocka (`MockNote.mentions`, `.hashtags`) nie są w ogóle konsumowane | `screens/FeedScreen.tsx:88` · `screens/ThreadScreen.tsx:49` | blocks-showme | M |
| gos-26 | Motyw jasny | FID | missing | FID dokumentuje **dwa** akcenty (dark `#74A7CC`, light `#557A95`) i dwa referencyjne screeny (`gossip_screenshot_{dark,light}.png`) — realny Gossip ma tryb jasny. Nasz motyw to jeden blok tokenów, bez `.dark`, bez `[data-theme="light"]`, bez `prefers-color-scheme`. `useParentTheme` jest odczytywany i wpisywany w `className`/`data-theme`, ale **CSS się na to nie rozgałęzia** → w jasnym hoście symulator zostaje czarny | `gossip.theme.css:7-36` (jedyny blok tokenów) · `GossipSimulator.tsx:28,151-155` | none | M |
| gos-27 | Metadane klienta (`gossipConfig`) | FID | partial | `supportedFeatures` deklaruje **DM, SEARCH, NIP05, MUTE_LIST** — żadnej z tych powierzchni w symulatorze nie ma (grep `dm\|message\|mute\|nip05` po `*.tsx` = 0). Do tego `primaryColor: '#22C55E'` przeczy FID (`#74A7CC` dark / `#557A95` light) — dokładnie ta klasa błędu, którą naprawiono w Primalu. Autor FAQ czytający configs uwierzy w ścieżki, których nie ma | `src/simulators/shared/configs.ts:186,189-197` | none | S |
| gos-28 | Compose (sidebar „Compose" / Feed „New" → modal → Post) | — | unreachable | **Działa** end-to-end: otwiera się z dwóch miejsc, ⌘Enter i „Post" dodają notatkę na czoło feedu, Cancel / X / klik w scrim zamykają, Esc działa gdy textarea ma fokus. Dwa haczyki (runtime): post wysłany z People/Relays/Settings **nie przełącza widoku na Feed** — zero potwierdzenia, że cokolwiek się stało — a autorem jest `mockUsers[0]`, nie tożsamość ze stopki sidebara (gos-20). Blokada jest jednak strukturalna: żadna komenda toura tego nie otworzy (gos-29) i nie ma kotwicy (gos-30) | `components/ComposeModal.tsx:34-75` · `GossipSimulator.tsx:66-88,169-173` | blocks-showme | S |
| gos-29 | **Brak wrappera `GossipSimulatorWithTour`** | — | unreachable | Struktura, której nie ma nigdzie indziej w repo: katalog nie zawiera `*SimulatorWithTour.tsx`, `GossipSimulator` **nie przyjmuje żadnych propsów** (brak `tourCommand` / `onCommandHandled` / `className`), w `src/data/tours/` nie ma `gossip-tour.ts`, a rejestr ma `tour: false`. Konsekwencja jest **mocniejsza niż „brak komend"**: `FaqMiniTourLauncher` musi renderować się WEWNĄTRZ `TourWrapper`, czyli w `*SimulatorWithTour`; bez niego `showFaqInSimulator()` z hosta trafia w próżnię i **żaden `showMe` nie zadziała — nawet taki, który celuje w domyślny Feed** | `GossipSimulator.tsx:27` · brak pliku `src/simulators/gossip/GossipSimulatorWithTour.tsx` · `src/components/faq/FaqMiniTourLauncher.tsx:1-9` · `src/data/tours/` (brak wpisu) · `src/registry.tsx:242` | blocks-showme | M |
| gos-30 | **Zero kotwic `data-tour`** | — | unanchored | `grep -rn "data-tour" src/simulators/gossip/` = 0 trafień; runtime z zamontowanym symulatorem: `document.querySelectorAll('[data-tour]').length === 0`. Każdy `showMe` musiałby celować w klasy CSS (`.gossip-nav-item`, `.gossip-note`…), co jest kruche i nieodróżnialne dla powtarzalnych elementów | brak w całym `src/simulators/gossip/` | blocks-showme | M |
| gos-31 | Feed → lista notatek | — | unanchored | Wierne w zakresie, w jakim w ogóle istnieje, i **jest to widok domyślny**, więc osiągalne bez komendy. Brak kotwic na kontenerze feedu i na pojedynczej nocie; do tego feed renderuje **wszystkie 326 mock notatek naraz** (runtime; brak cap-a, paginacji i wirtualizacji — inaczej niż gotcha „~25" z `CLAUDE.md`), więc `.gossip-note` to 326 nieodróżnialnych celów | `screens/FeedScreen.tsx:31,50,59-67` | blocks-showme | S |
| gos-32 | People → siatka osób | — | unreachable | Ekran działa (55 kart z awatarem, bio i statystykami), ale wchodzi się tylko klikiem w sidebar — nie ma komendy (gos-29) ani kotwicy (gos-30). Kliknięcie karty jest martwe (gos-07), statystyki zawsze zerowe (gos-09) | `screens/PeopleScreen.tsx:29-53` · `GossipSimulator.tsx:127-133` | blocks-showme | S |
| gos-33 | Relays → dodaj / usuń / Read / Write | — | unreachable | Najlepiej działający fragment symulatora: `addRelay` (Enter lub przycisk), `removeRelay`, `toggleRead`, `toggleWrite` — wszystkie realnie mutują listę i podpis „45ms • Read • Write". Blokada jest wyłącznie strukturalna: brak komendy i brak kotwicy | `screens/RelaysScreen.tsx:23-48,84-115` | blocks-showme | S |
| gos-34 | Sidebar → uchwyt zmiany szerokości | — | partial | Drag działa (200–400 px, listenery na `document`) i modal powitalny reklamuje go jako feature #1 („Split-Pane Layout"), ale `onResize(... e.clientX)` bierze **surowy X viewportu**, a sim jest wcięty w layout hosta (lewa krawędź ≈ 209 px przy 1440) → **uchwyt odkleja się od kursora o całe wcięcie**: runtime, kursor na `clientX = 360` daje sidebar 360 px, którego krawędź stoi na 569. Maks 400 px wypada, gdy kursor jest jeszcze przy lewym brzegu sima. Do tego brak kotwicy na 4-px uchwycie | `components/Sidebar.tsx:22-42,102-105` · `GossipSimulator.tsx:90-92` | breaks-showme | S |
| gos-35 | Relays → status połączenia | — | partial | `wss://relay.snort.social` jest zaszyty jako `connecting` i **nigdy się nie łączy**; każdy dodany relay też startuje jako `connecting` z `latency: 0` i tam zostaje. Nie ma maszyny stanów ani przejścia do `error`, mimo że typ i kropka statusu je przewidują. Odpowiedź „poczekaj aż zrobi się zielona" nigdy się nie ziści | `screens/RelaysScreen.tsx:6,16,38-43,86` | breaks-showme | S |
| gos-36 | Feed → media w notatce | — | missing | Renderowany jest wyłącznie `note.content`; `MockNote.images` istnieje i mock notatki je wypełniają — i to już jako **CSP-safe inline-SVG `data:`**, więc dobudowanie jest tanie — ale żaden ekran gossipa ich nie czyta. To także druga strona gos-16: przełącznik „Show media previews" jest domyślnie **włączony** i nie ma czego pokazywać | `screens/FeedScreen.tsx:88` · `src/data/mock/types.ts:75` · `src/data/mock/utils.ts:183-186` | blocks-showme | S |
| gos-37 | Settings → ekran jako całość | — | unreachable | Ekran renderuje się i sekcja General reaguje, ale wchodzi się w niego **tylko klikiem w sidebar** — nie ma komendy (gos-29) ani kotwicy (gos-30); ta sama blokada co People (gos-32) i Relays (gos-33), której audyt tu nie zapisał. Dodatkowo stan jest per-mount: przełącz „Compact mode", wyjdź na Feed, wróć — jest z powrotem domyślny (runtime potwierdzone), więc dwukrokowy `showMe` pokaże zresetowany przełącznik | `screens/SettingsScreen.tsx:18-23` · `GossipSimulator.tsx:136-137` | blocks-showme | S |

## Anchors — `data-tour` obecne w symulatorze

| Selector | Plik:linia | Powierzchnia |
|---|---|---|
| _(brak)_ | — | **Zero kotwic w całym `src/simulators/gossip/`** — potwierdzone grepem i runtime (`[data-tour]` → 0 elementów przy zamontowanym symulatorze). Patrz gos-30. |

Najbliższe użyteczne zaczepy, gdyby ktoś pisał `showMe` **dziś** (klasy CSS, nie kotwice — kruche):
`.gossip-sidebar`, `.gossip-compose-btn`, `.gossip-nav-item` (×4, nieodróżnialne bez `:nth-child`),
`.gossip-note` (**×326** — feed renderuje cały mock naraz, patrz gos-31),
`.gossip-note-actions .gossip-action` (×4/notę), `.gossip-relay-item` (×4),
`.gossip-toggle` (×7: 5 żywych w General + 2 martwe w Privacy), `.gossip-modal`, `.gossip-tour-overlay`.
Liczby ×N potwierdzone runtime na zamontowanym symulatorze (1440×900).

## Reachability — komendy toura

**Union:** _brak._ `GossipSimulator` to komponent **bez propsów** (`GossipSimulator.tsx:27`) —
nie ma `tourCommand`, `onCommandHandled` ani `className`, nie ma pliku `GossipSimulatorWithTour.tsx`,
nie ma `gossip-tour.ts` w `src/data/tours/`, a rejestr ustawia `tour: false` (`src/registry.tsx:242`).
Cała nawigacja to prywatne `useState` w `GossipSimulator.tsx:29-37` (`currentView`, `selectedNote`,
`selectedUser`, `isComposeOpen`, `sidebarWidth`, `showTour`, `notes`) sterowane wyłącznie klikiem
użytkownika. Limit „≤2 komendy na krok" jest tu nieistotny — komend jest zero.
**I jeszcze mocniej:** `FaqMiniTourLauncher` renderuje się tylko wewnątrz `TourWrapper`
(`src/components/faq/FaqMiniTourLauncher.tsx:1-9`), więc dopóki nie ma `GossipSimulatorWithTour`,
zdarzenie `showFaqInSimulator()` z hosta nie ma odbiorcy — **żaden `showMe` nie wystartuje, nawet
celujący w domyślny Feed**. Kolumna „osiągalna komendą" niżej mówi więc dziś tylko o tym, dokąd da się
dojść myszą.

| Powierzchnia | Osiągalna komendą? | Czym |
|---|---|---|
| Modal powitalny (stan startowy) | **nie** — ale montuje się sam przy każdym wejściu | `GossipSimulator.tsx:35` |
| Feed (widok domyślny) | **nie** — jedyny stan osiągalny „za darmo", po ręcznym zamknięciu modalu | `currentView: 'feed'` (`GossipSimulator.tsx:30`) |
| People | **nie** | tylko klik `.gossip-nav-item` (`Sidebar.tsx:82`) |
| Relays | **nie** | j.w. |
| Settings | **nie** | j.w. |
| Thread | **nie** | tylko klik w notatkę (od 2026-08-07 działa — gos-01 naprawione) |
| Compose (modal) | **nie** | tylko klik „Compose" w sidebarze lub „New" w nagłówku feedu |
| Profil użytkownika | **nie istnieje** | `selectedUser` ustawiane, nieczytane (gos-07) |

## Poza zakresem / do recon

**Nie ma `docs/refs/gossip/screen-map.md`.** FID daje tylko tokeny, jeden akapit „Nav / killer" i namiary
na źródło (`gossip-bin/src/ui/theme/default.rs`, `mod.rs`, `test_page.rs`, screeny
`assets/gossip_screenshot_{dark,light}.png`). Poniższego **nie da się orzec** — to lista zakupów na recon,
nie luki:

- **Realna mapa nawigacji icon-raila** — ile ikon, w jakiej kolejności, co jest pod każdą. Bez tego
  gos-22 wiadomo tylko *że* jest źle, nie *jak* ma być.
- **Zawartość status bara** — co Gossip tam pokazuje (liczba relayów? kolejka? postęp fetcha? tryb?).
- **Ekran Person / Profile** — czego brakuje poza tym, że u nas nie istnieje w ogóle (gos-07).
- **Feeds** — Gossip ma feed-listy/kanały; nie wiemy jakie, więc „Feed" jako jeden ekran zostaje bez oceny.
- **DM / prywatne wiadomości, wyszukiwanie, mute list, NIP-05** — `configs.ts` je deklaruje (gos-27),
  ale bez screen-mapy nie wiemy nawet, czy realny Gossip ma je w tym kształcie.
- **Wizard logowania / zarządzanie kluczem** — realny Gossip startuje od setupu (klucz, hasło do
  lokalnego szyfrowania); nasz symulator startuje „zalogowany" i nie ma żadnej ścieżki logowania.
  Bez recon nie wiemy, jak wygląda, więc to nie jest jeszcze wiersz.
- **Menu kontekstowe noty** (kandydat na wejście do surowego JSON-a z gos-24) — FID mówi *że* jest
  developer-tool DNA, nie *gdzie* są wejścia.
- **Renderowanie treści** — nasze mock notatki pokazują surowe ogrodzenia ```` ``` ```` (widoczne w
  pierwszej nocie feedu); czy realny Gossip renderuje bloki kodu — nie wiadomo.
- **Egui immediate-mode look** (płaskie fille, hairline separatory, brak cieni i kart, wysoka gęstość) —
  FID to nazywa, ale to warstwa wizualna: idzie do fidelity passa, nie do tego ledgera.

**Świadomie poza tabelą (nie zgłaszać jako luki):**
akcent zielony `#22C55E` zamiast stalowego `#74A7CC` (`gossip.theme.css:8` · `configs.ts:186`) — to
**pomyłka kolorystyczna**, adres to `docs/FIDELITY.md` i side-by-side, nie ten plik; hotlink awatarów do
`api.dicebear.com` (`FeedScreen.tsx:72`, `ThreadScreen.tsx:36`, `PeopleScreen.tsx:38`) — znany
**cross-cutting** task z `CLAUDE.md` § Gotchas, dotyczy wszystkich symulatorów (w gossipie boli podwójnie:
326 not × awatar = 326 zdalnych żądań); liczba i treść mock notatek; brak ramki urządzenia
(`frame: null` — Gossip jest desktopowy, to poprawne).
