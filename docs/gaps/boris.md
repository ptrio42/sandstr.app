# Boris — gap ledger

> Ground truth: `docs/refs/boris/screen-map.md` · Sim: `src/simulators/boris/`
> Spisany: 2026-08-21 · **Przeliczony 2026-08-22 po drugim (zalogowanym) nagraniu**
> Registry status: ready · Tour: 11 kroków (`src/data/tours/boris-tour.ts`)
> FAQ: 43 wpisy, **18 mini-tourów** (`src/data/faq/boris.ts`, 2026-08-22)
>
> **Kotwic jest 83** (przeliczone skryptem 2026-08-22): 52 nazwy literalne — licząc zarówno
> `data-tour="…"`, jak i `tourId="…"`, bo `TopBar`/`IconButton`/`FilterChip` przepuszczają je na
> `data-tour` — plus 31 z pięciu rodzin szablonowych (`boris-tab-*` 5, `boris-settings-*` 13,
> `boris-library-scope-*` 6, `boris-feeds-scope-*` 3, `boris-feeds-tab-*` 4). Rodziny sterowanej
> danymi (`boris-feed-card-<id>`) nie liczę, bo jej rozmiar zależy od mocków.
>
> **Poprzednie 77 było o jeden za niskie**, niezależnie od pięciu kotwic dołożonych w tej sesji
> (`boris-reader-save`, `boris-reader-save-menu`, `boris-you-more`, `boris-you-menu`,
> `boris-you-header`): ten sam skrypt puszczony na `HEAD` liczy 47 literałów, nie 46. Drobiazg, ale
> ten ledger reklamuje te liczby jako mierzone, więc różnica należy się czytelnikowi. Wcześniejsze
> 94 było z kolei szacunkiem autora, nie pomiarem — dokładnie ta klasa liczby, przed którą ostrzega
> akapit niżej.

> **Ten ledger jest deklaracją autora, nie niezależnym audytem.** Pozostałe dziesięć powstało w
> przebiegu wieloagentowym z adwersaryjną weryfikacją każdego wiersza innego niż `ok`; ten spisała ta
> sama sesja, która budowała symulator, więc dzieli z nim ślepe plamy. Traktuj go jako listę roboczą,
> nie jako pomiar — i przy pierwszym prawdziwym audycie Borisa policz go od zera. Wiersze `ok` są tu
> szczególnie podejrzane: [pamięć projektu](../../CLAUDE.md) notuje, że to zielone wiersze przeżywają
> re-audyt najgorzej.

## Rollup

| missing | dead | partial | unreachable | unanchored | ok |
|---|---|---|---|---|---|
| 14 | 14 | 10 | 1 | 0 | 9 |

48 wierszy = 39 luk + 9 `ok`. Liczby policzone skryptem po kolumnie *Status*, nie ręcznie
(przeliczone 2026-08-22 po drugim nagraniu).

**Co zmieniło drugie nagranie (`shots/screen-20260822-085358-*.mp4`, zalogowane).** Trzy wiersze
w dół: bor-06 domknięty (przycisk zapisu z menu private/public), bor-42 i bor-03 z `missing`/`partial`
na mniej. Trzy nowe w górę: bor-46 i bor-47 to powierzchnie, których screen-mapa w ogóle nie znała
(`Move to Archive & Close` i zielony pasek po zapisie — obie same znikają, więc świadomie nieodtworzone),
a bor-48 nazywa wprost to, czego **żadne z dwóch nagrań nie pokazało**: menu gotowego markera i
usuwanie zakreślenia. Naprawiona też numeracja — wiersze o signerze i „Highlight with Boris" nosiły
duplikaty ID `bor-41`/`bor-42` i są teraz `bor-44`/`bor-45`.

**Top 3 do zrobienia:** bor-48 (usuwanie zakreślenia — menu markera i dialog, jedyna duża
powierzchnia rdzenia produktu bez ani jednej klatki dowodu) · bor-03 (Library wciąż filtruje ten sam
zaszyty zbiór w każdym scope, i nie ma stanu „zaszyfrowane, odblokuj signerem") · bor-31 (półki
offline i limit pamięci wyrenderowane na sztywno — to one zablokowały demo `clear-cache` i `offline`).

**Do trzeciego nagrania, gdyby było:** long-press na gotowym markerze → menu → Delete → dialog,
chip `Private` w Library, panel Highlights i jego przełącznik oka, oraz ścieżka porażki podpisu.
To jest cała lista tego, czego dwa nagrania nie tknęły.

**bor-01 zamknięte 2026-08-21.** Bank FAQ jest (`src/data/faq/boris.ts`, 43 wpisy), wrapper ma
`FaqMiniTourLauncher`, a Boris jest w `/compare` (12 osi, 3 `yes` / 8 `no` / 1 `partial`).
Do banku doszły cztery kotwice, których nie było: `boris-relays-list`, `boris-zap-presets`,
`boris-scroll-switches`, `boris-highlight-colors`.

**Ile z tego dało się pokazać: 18 mini-tourów na 43 wpisy (42%), przy ~60% u pozostałych ośmiu
klientów** — 16 przy spisaniu ledgera, +2 po drugim nagraniu. Ta różnica to ten ledger działający jak bramka. Tekst dostały, a demo nie, dokładnie
te odpowiedzi, których powierzchnia jest tu `dead` albo `partial`: Library i jej scope'y (bor-03,
bor-04), menu ⋮ czytnika (bor-07), spis treści i Find (bor-08, bor-10), wiersze panelu Highlights
(bor-09), wyniki wyszukiwania (bor-20), RSS (bor-30), półki offline i limit pamięci (bor-31),
usuwanie zakreślenia (bor-19, bor-22).

**Dwa wiersze dopisane przy okazji banku FAQ (bor-41, bor-43)** — oba znalezione klik-po-kliku
podczas weryfikacji mini-tourów, nie przeglądem kodu.

**Mini-tourów jest 18, nie 16** (`src/data/faq/boris.ts`, 2026-08-22): `library` dostał dwa kroki
(menu zapisu + półki), `logout` jeden. Oba były wcześniej tekstowe dokładnie dlatego, że powierzchni
nie było — bor-06 i bor-42 działały jak bramka, i przestały.

## Gaps

| ID | Surface (ścieżka w UI) | § | Status | Gap | Evidence | FAQ impact | Effort |
|---|---|---|---|---|---|---|---|
| bor-01 | cały klient → bank FAQ (`showMe`) | — | ok | **Zamknięte 2026-08-21.** `src/data/faq/boris.ts` = 43 wpisy / 18 mini-tourów (16 przy zamknięciu, +2 z 2026-08-22), `borisFaq` w `src/data/faq/index.ts`, `FaqMiniTourLauncher` + gałąź `isFaqStepId` we wrapperze, Boris w `src/data/capabilities.ts` (12 osi) i na `/compare` (pierwszy ekran + pasek zakładek; nota i composer jako `absent` z powodem) | `src/data/faq/boris.ts`, `src/simulators/boris/BorisSimulatorWithTour.tsx:16-17,61-80,125` | none | — |
| bor-02 | Reader → zaznaczenie tekstu → pasek Copy / Highlight / TTS from here / Select all | §4.1 | ok | **Domknięte 2026-08-22.** Realna selekcja przez `window.getSelection()`: zaznaczasz dowolny fragment, pasek wychodzi nad zaznaczeniem i zakreśla dokładnie to, co zaznaczyłeś. Wcześniej blok był owinięty w `<button>` (klik brał pierwsze zdanie i wkładał prozę blokową do przycisku — niepoprawny HTML). Realny gest to long-press + przeciągnięcie; u nas przeciągnięcie myszą/palcem, bo to przeglądarka. Sprawdzone drag-em w podglądzie: zaznaczony fragment = zakreślony fragment, chip 2 → 3 | `screens/ReaderScreen.tsx` (`readSelection`) | none | — |
| bor-03 | Library (zalogowany) → chipy All / Private / Public / Web / Lookmarks / Archive | §6 | partial | **Zmniejszone 2026-08-22.** To, co odwiedzający realnie zapisze w czytniku, ląduje teraz na górze `All` i swojego scope'u, a wiersz stracił streszczenie, którego realna półka nie ma (t=151). Zostaje: sześć scope'ów wciąż filtruje ten sam zaszyty zbiór po długości/domenie, i nie ma stanu „Private bookmarks are encrypted. Unlock them with your signer." — tego akurat nagranie **nie pokazuje** (właściciel nie ruszył chipa `All`), więc to nadal wiersz z samego źródła | `screens/LibraryScreen.tsx` (`seeded` / `justSaved`) | breaks-showme | M |
| bor-04 | Library → top bar → Info → arkusz „Library sources" | §6 | dead | Ikona `i` otwiera ekran ustawień Library zamiast arkusza z pięcioma opisami źródeł (lookmark = kind 7 👀 itd.) | `BorisSimulator.tsx:262` | breaks-showme | S |
| bor-05 | Feeds → top bar → Info → arkusz „Feed visibility" | §5 | dead | To samo: otwiera ustawienia Feeds, nie arkusz z trzema zdaniami o zasięgach | `BorisSimulator.tsx:283` | breaks-showme | S |
| bor-06 | Reader → top bar → Save to library (zalogowany) | §4 | ok | **Domknięte 2026-08-22 z nagrania.** Przycisk jest, tylko dla zalogowanego, i odtwarza dwa stany, które nagranie pokazuje: `AddCircleOutline` niezapisane (t=112, t=139) → **wypełniony** `Bookmark` po zapisie (t=116.5, t=140.5). Tap otwiera dwuwierszowe menu `Add to private bookmarks` (kłódka) / `Add to public bookmarks` (globus z lądem), t=137.5–139.0, i wybór trafia do Library. Trzeci stan (zarchiwizowane) nie był filmowany i nie jest odtworzony. Sprawdzone klik-po-kliku: etykieta „Save to library" → „In your library", artykuł na górze `All` i `Public`, nie ma go w `Private` | `screens/ReaderScreen.tsx` (`savedAs`/`onSave`), `BorisSimulator.tsx` (`savedArticles`) | none | — |
| bor-07 | Reader → ⋮ → Share / Copy link / Open in browser / Wayback / archive.ph | §4 | dead | Pozycje mają poprawne etykiety, kolejność i bramkę logowania, ale tylko zamykają menu (poza „Find in article") | `screens/ReaderScreen.tsx:322-336` | breaks-showme | S |
| bor-08 | Reader → pane Contents → pozycja spisu | §4 | dead | Nagłówki się wyliczają i renderują, ale klik nie przewija do sekcji | `screens/ReaderScreen.tsx:449-455` | breaks-showme | S |
| bor-09 | Reader → pane Highlights → wiersz → „Go to quote" / ⋯ / usuń | §4 | partial | Lista highlightów jest wierna, ale wiersz nie jest klikalny i nie ma menu `HighlightCardMenu` | `screens/ReaderScreen.tsx:462-520` | breaks-showme | M |
| bor-10 | Reader → Find in article → nawigacja po trafieniach | §4 | partial | Pole i lista trafień działają, ale nie ma licznika „N of M", strzałek prev/next ani podświetlenia `FindMark #93C5FD` w tekście | `screens/ReaderScreen.tsx:523-548` | breaks-showme | M |
| bor-11 | Reader → obraz w treści → galeria pełnoekranowa | §4 | missing | `ImageGallery` nie ma odpowiednika — obrazy są statyczne | `screens/ReaderScreen.tsx:157-171` | blocks-showme | M |
| bor-12 | Reader → link w treści → otwarcie w Borisie / przeglądarce | §4 | missing | Treść mocków nie zawiera linków inline, a `openWeblink` nie ma odpowiednika (brak in-app browsera) | `borisData.ts` (brak linków w `body`) | none | M |
| bor-13 | Reader → przypisy, listy, kod | §4 | missing | `BorisBlock` zna `p / lead / h2 / quote / image`; realny renderuje też listy, kod i przypisy z `Footnotes.kt` | `borisData.ts:27-32` | none | M |
| bor-14 | Home → karta → long-press → menu akcji | §3.3 | missing | Karty reagują tylko na klik; nie ma `combinedClickable` z Share / Copy link / Open original / Mark as read | `components/ArticleCard.tsx:48-53` | blocks-showme | M |
| bor-15 | Home → ⋮ → „Hide archived" (zalogowany) | §2.2 | missing | Menu ⋮ nie istnieje — ikona idzie prosto do ustawień Home, więc przełącznik „Hide archived" jest tylko w ustawieniach | `screens/HomeScreen.tsx:139-141` | blocks-showme | S |
| bor-16 | Home → banner „Open from clipboard" | §3 | missing | `ClipboardBanner` nie ma odpowiednika (i nie może mieć — nie czytamy schowka) | — | none | L |
| bor-17 | Home → stany ładowania („Connecting…", „Fetching from relays…" …) | §3 | missing | Sześć komunikatów rotujących co 2200 ms; symulator nie ma stanu ładowania w ogóle | `strings.xml:70-77` (upstream) | none | S |
| bor-18 | Feeds → zakładka Writings → wiersz artykułu | §5 | partial | Renderuje dwa artykuły nostr, ale bez awatara autora i znacznika czasu, które ma `ArticleRow` | `screens/FeedsScreen.tsx:171-208` | none | S |
| bor-19 | Feeds / Search → karta highlightu → ⋯ | §5 | dead | Trójkropek jest `<span>`em bez handlera; realne menu ma Go to quote / View profile / Delete | `components/HighlightCard.tsx:96-101` | breaks-showme | M |
| bor-20 | Search → wyniki typu Article / Bookmark / Person | §5 | partial | Szukamy tylko po highlightach; realny zwraca cztery rodzaje wyników z etykietami rodzaju | `screens/SearchScreen.tsx:27-36` | breaks-showme | M |
| bor-21 | You (zalogowany) → zakładki Writings / Public / Web | §6 | partial | Trzy z czterech zakładek renderują zaślepkę; tylko Highlights ma treść (realny też bywa pusty, ale ma dane) | `screens/YouScreen.tsx:145-160` | none | S |
| bor-22 | Profile → ⋮ → menu profilu | §6 | dead | Trójkropek bez handlera | `screens/ProfileScreen.tsx:56-58` | breaks-showme | S |
| bor-23 | Auth → Bunker → pole `bunker://…` + Connect / Cancel | §6 | missing | Oba przyciski logują natychmiast; realny Bunker pokazuje pole URI, stan „Connecting…" i cztery komunikaty błędu | `components/AuthBar.tsx:26-40` | blocks-showme | M |
| bor-24 | Auth → Amber niezainstalowany → karta z trzema linkami instalacji | §6 | missing | Ścieżka „brak signera" nie istnieje | `components/AuthBar.tsx` | none | S |
| bor-25 | Settings → Reading → Reading Font (10 rodzin) | §7.1 | dead | Pole pokazuje „Source Serif 4" i chevron, ale nie rozwija listy i nie zmienia kroju | `screens/SettingsScreens.tsx:614-622` | breaks-showme | M |
| bor-26 | Settings → Text-to-Speech → Default Playback Speed (cykl 11 presetów) | §7.1 | dead | Chip pokazuje `2.1x`, klik nic nie robi; realny cykluje 0.8 → 3.0 i przy długim naciśnięciu daje menu | `screens/SettingsScreens.tsx:700-708` | breaks-showme | S |
| bor-27 | Settings → Text-to-Speech → Speaker language (13 pozycji) | §7.1 | dead | Dropdown statyczny | `screens/SettingsScreens.tsx:710-718` | breaks-showme | S |
| bor-28 | Settings → Home → zmiana kolejności sekcji (↑ ↓) | §7.1 | dead | Strzałki renderują się ze stanem `disabled` na krańcach, ale nie przestawiają sekcji na Home | `screens/SettingsScreens.tsx:872-893` | breaks-showme | M |
| bor-29 | Settings → Library / Feeds → chipy „Default view" | §7.1 | dead | Chipy są `<span>`ami — pokazują domyślny wybór, ale nie zapisują go i nie zmieniają startowej zakładki | `screens/SettingsScreens.tsx:1012-1030` | breaks-showme | S |
| bor-30 | Settings → Feeds → RSS: dodaj URL / Import OPML | §7.1 | dead | Pole i oba przyciski są statyczne | `screens/SettingsScreens.tsx:960-985` | breaks-showme | M |
| bor-31 | Settings → Airplane mode → przełączniki półek offline + limit pamięci | §7.1 | dead | Pięć przełączników i pięć przycisków limitu jest wyrenderowanych na sztywno w stanie domyślnym | `screens/SettingsScreens.tsx:1180-1240` | breaks-showme | M |
| bor-32 | Settings → Relays → odświeżanie co 15 s, sub-label pokrycia | §7.1 | partial | Lista jest statyczna: brak ponownego sondowania, brak „N of your follows write here" | `screens/SettingsScreens.tsx:1120-1160`, `borisData.ts:640-666` | none | M |
| bor-33 | Settings → About → wiersze Website / Web app / Source code / Author | §8 | dead | Wiersze mają poprawne etykiety i podtytuły, ale nie prowadzą nigdzie (świadomie — symulator nie otwiera linków zewnętrznych) | `screens/SettingsScreens.tsx:1300-1330` | none | S |
| bor-34 | About → carousel → gest swipe | §8 | partial | Strony przełącza się kropkami albo ‹ ›; realny to `HorizontalPager` przesuwany palcem | `screens/AboutScreen.tsx:214-233` | none | S |
| bor-35 | Support → sekcje Legends / Supporters, sumy | §8 | ok | Renderuje serce, dwa poziomy, sumy i trzy zdania stopki; liczby zmyślone z założenia | `screens/SupportScreen.tsx` | none | — |
| bor-36 | Bottom bar → pięć zakładek, pigułka M3, etykiety zawsze widoczne | §2.1 | ok | Kolejność, pary ikon filled/outlined i `#4A4458` zmierzone z nagrania | `components/BottomBar.tsx` | none | — |
| bor-37 | Home → dwa dismissible prompty | §3.1 | ok | Kopie verbatim, ikony, zachowanie zamykania | `components/NoticeCard.tsx`, `screens/HomeScreen.tsx:147-170` | none | — |
| bor-38 | Reader → pasek postępu (2 dp + etykieta, trzy kolory, `✓` przy 95 %) | §4 | ok | Cała reguła kolorów i format etykiety odtworzone | `screens/ReaderScreen.tsx` | none | — |
| bor-39 | You (wylogowany) → „the passages you care about" z żółtym markerem | §6 | ok | Krój, rozmiar, 32 % alfa, promień i padding zgodne z `YouLoggedOut.kt` | `screens/YouScreen.tsx:78-96` | none | — |
| bor-40 | Home → top bar → cyklujący awatar wspierającego | §2.2 | unreachable | Działa i ma kotwicę, ale żadna komenda toura nie ustawia go w stan „kliknięty" — a to najbardziej mylona kontrolka w całym kliencie | `components/SupportHeart.tsx:44-57` | blocks-showme | S |
| bor-41 | Settings → Reading / Highlights → karta podglądu `ReadingPreview` | §7.2 | partial | Kotwica `boris-settings-preview` istnieje i treść jest wierna, ale jako CEL toura jest bezużyteczna: zmierzone w działającym simie, karta zaczyna się 65 px nad dolną krawędzią telefonu i ma 1436 px wysokości — pierścień wychodzi poza kadr na obiekcie dwa razy wyższym od ekranu. Realna karta mieści się w ekranie, bo jej trzy akapity są krótsze. `reading-settings` przez to nie ma demo, a `highlight-colors` celuje w nową kotwicę `boris-highlight-colors` | `screens/SettingsScreens.tsx:331`; pomiar: `getBoundingClientRect()` na `/c/boris`, ekran Highlights | breaks-showme | M |
| bor-42 | You (zalogowany) → top bar → ⋮ → Copy Link / Share / njump / Sign out | §6 | partial | **Zmniejszone 2026-08-22.** Nagranie potwierdza, że realny pasek You ma serce po lewej oraz koło zębate **i** trójkropek po prawej (t=0–7, t=92–95), więc trójkropek jest, `Sign out` realnie kończy sesję (czyści markery, zapisy i zakładkę), a `logout` dostał mini-tour. **Zawartość menu wciąż jest z samego źródła** — nagranie go nie otwiera — i pozycja `Open with Native App` jest pominięta, bo w przeglądarce nie znaczy nic | `screens/YouScreen.tsx` (menu), `src/data/faq/boris.ts` (`logout` → `showMe`) | none | S |
| bor-44 | Reader → Highlight → runda do signera (Amber / bunker) | §4.1 | missing | Zakreślenie pojawia się natychmiast i lokalnie. Realny Boris buduje NIEPODPISANE zdarzenie NIP-84 i oddaje je Amberowi (Intent) albo bunkerowi (NIP-46). **Zmierzone 2026-08-22, oba przebiegi:** między tapnięciem a wjazdem Ambera ~3 s, a po powrocie marker wchodzi w **0,3–0,5 s**, bez toastu i bez stanu pośredniego — czyli różnica wobec nas to sam wyskok do Ambera, nie opóźnienie markera. Nie ma też dwóch ścieżek porażki (`Highlight rejected.` / `Highlight cancelled.`), i tych nagranie nie pokazuje. Świadome: bez sieci i bez krypto (CLAUDE.md) | `BorisSimulator.tsx` (case 'highlight'), `screens/ReaderScreen.tsx` (onAddHighlight) | blocks-answer | L |
| bor-45 | „Highlight with Boris" — tekst udostępniony z innej apki | §4.1 | missing | Drugie wejście do zakreślania w ogóle nie jest modelowane: brak promptu o URL artykułu (`highlight_url_title`/`_hint`/`_continue`) i brak komunikatu `Connect a signer to highlight with Boris.` dla wylogowanego. Poza zasięgiem symulatora przeglądarkowego (to systemowe menu zaznaczania Androida), ale jest realną powierzchnią realnej apki | `PendingHighlight.kt` (upstream), brak odpowiednika w `src/simulators/boris/` | blocks-answer | L |
| bor-46 | Reader → dolna kolumna → przycisk `Move to Archive & Close` | §4 | missing | Nagranie 2026-08-22 pokazuje obrysowany przycisk w `primary` z glifem trzech książek, wyśrodkowany nad paskiem postępu, który **sam znika po ~4 s** od otwarcia artykułu (t=107.0–110.0 na After Kinism przy 0 % i bez przewijania; t=30–32 na Buddha Boy). Nie odtwarzamy: kontrolka kasująca się po czterech sekundach nie może być celem toura ani `showMe`, a jej wyzwalacza nagranie nie rozstrzyga — dorobienie go byłoby dokładnie tą cichą inferencją, przed którą ostrzega skill | nagranie t=107–110; brak odpowiednika w `src/simulators/boris/` | none | M |
| bor-47 | Reader → dolna kolumna → nieokreślony zielony pasek po zapisaniu do biblioteki | §4 | missing | Po podpisaniu bookmarka w tym samym slocie jedzie pełnej szerokości zielony `LinearProgressIndicator` przez ~7 s (t=117.5–124.0). Najpewniej pobieranie offline świeżo zapisanej pozycji, ale **nagranie tego nie dowodzi, a źródła pod to nie czytałem** — dlatego wiersz, nie implementacja | nagranie t=117.5–124.0 | none | S |
| bor-48 | Reader → long-press na gotowym markerze → menu highlightu → Delete → dialog | §4.1 | missing | Ani pierwsze, ani drugie nagranie tego nie pokazuje: właściciel nigdy nie przycisnął gotowego markera. Cała ta ścieżka — pozycje menu, ich kolejność, ikony i treść dialogu potwierdzenia — pozostaje **wyłącznie ze źródła**, więc `delete-highlight` w banku FAQ zostaje tekstowe do czasu trzeciego nagrania albo recon-u po `HighlightCardMenu` | brak klatek; `src/data/faq/boris.ts` (`delete-highlight`) | blocks-showme | M |
| bor-43 | Reader → widoczność markerów (`Show highlights` + trzy warstwy) | §4.1 | ok | **Domknięte 2026-08-21.** Marker gasi `Show highlights` i przełącznik warstwy autora, panel i chip liczą dalej wszystko, a własne zakreślenie force-włącza swoją warstwę (`withOwnHighlightsVisible()`). Pane ma własny przełącznik oka. Sprawdzone w przeglądarce: 3 markery → 0 po wyłączeniu, chip nadal „2 highlights", po zakreśleniu 3 markery i chip „3 highlights" | `screens/ReaderScreen.tsx` (`visible()`), `BorisSimulator.tsx` (onAddHighlight) | none | — |

## Czego tu nie ma i nie będzie

In-app browser, realne pobieranie offline, realne sondowanie relayów, OPML, integracja z Amberem i
bunkerem, czytanie schowka. To nie są luki do domknięcia — to granica „bez sieci i bez realnej
krypto" z `CLAUDE.md`. Wiersze wyżej opisują je jako `missing` tylko tam, gdzie realna apka ma w tym
miejscu widoczny **interfejs**, którego u nas nie ma.
