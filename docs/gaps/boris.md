# Boris — gap ledger

> Ground truth: `docs/refs/boris/screen-map.md` · Sim: `src/simulators/boris/`
> Spisany: 2026-08-21 · Registry status: ready · Sim LOC: 5577 · kotwice `data-tour`: 94
> Tour: 11 kroków (`src/data/tours/boris-tour.ts`, dopisany 2026-08-21)

> **Ten ledger jest deklaracją autora, nie niezależnym audytem.** Pozostałe dziesięć powstało w
> przebiegu wieloagentowym z adwersaryjną weryfikacją każdego wiersza innego niż `ok`; ten spisała ta
> sama sesja, która budowała symulator, więc dzieli z nim ślepe plamy. Traktuj go jako listę roboczą,
> nie jako pomiar — i przy pierwszym prawdziwym audycie Borisa policz go od zera. Wiersze `ok` są tu
> szczególnie podejrzane: [pamięć projektu](../../CLAUDE.md) notuje, że to zielone wiersze przeżywają
> re-audyt najgorzej.

## Rollup

| missing | dead | partial | unreachable | unanchored | ok |
|---|---|---|---|---|---|
| 11 | 14 | 9 | 1 | 0 | 5 |

40 wierszy = 35 luk + 5 `ok`. Liczby policzone skryptem po kolumnie *Status*, nie ręcznie.

**Top 3 do zrobienia:** bor-01 (brak banku FAQ — blokuje `showMe` i wejście do `/compare`) ·
bor-02 (zaznaczanie tekstu jest udawane: klik w akapit, nie realna selekcja) · bor-03 (Library
zalogowany pokazuje te same artykuły w każdym scope).

## Gaps

| ID | Surface (ścieżka w UI) | § | Status | Gap | Evidence | FAQ impact | Effort |
|---|---|---|---|---|---|---|---|
| bor-01 | cały klient → bank FAQ (`showMe`) | — | missing | Tour wszedł 2026-08-21 (11 kroków, `tour: true`, wrapper `BorisSimulatorWithTour`), ale nie ma `src/data/faq/boris.ts`. Bez banku: brak `showMe`, brak Borisa w `/compare` (komórki w `capabilities.ts` cytują id wpisów FAQ) i brak `FaqMiniTourLauncher` we wrapperze. Silnik i 94 kotwice są gotowe — brakuje treści | `src/simulators/boris/BorisSimulatorWithTour.tsx:5-9`, `src/data/capabilities.ts` (SCOPE) | blocks-showme | L |
| bor-02 | Reader → zaznaczenie tekstu → pasek Copy / Highlight / Read from here / Select all | §4 | partial | Pasek ma poprawny kształt i kolejność, ale nie ma realnej selekcji: klik w akapit „zaznacza" jego pierwsze zdanie. Prawdziwe `window.getSelection()` dałoby dowolny fragment | `screens/ReaderScreen.tsx:398-410` | breaks-showme | M |
| bor-03 | Library (zalogowany) → chipy All / Private / Public / Web / Lookmarks / Archive | §6 | partial | Każdy scope filtruje ten sam zbiór artykułów po długości/domenie; nie ma osobnych zbiorów bookmarków ani stanu „zaszyfrowane, odblokuj signerem" | `screens/LibraryScreen.tsx:49-58` | breaks-showme | M |
| bor-04 | Library → top bar → Info → arkusz „Library sources" | §6 | dead | Ikona `i` otwiera ekran ustawień Library zamiast arkusza z pięcioma opisami źródeł (lookmark = kind 7 👀 itd.) | `BorisSimulator.tsx:262` | breaks-showme | S |
| bor-05 | Feeds → top bar → Info → arkusz „Feed visibility" | §5 | dead | To samo: otwiera ustawienia Feeds, nie arkusz z trzema zdaniami o zasięgach | `BorisSimulator.tsx:283` | breaks-showme | S |
| bor-06 | Reader → top bar → Save to library (zalogowany) | §4 | missing | Przycisk zapisu w ogóle nie jest renderowany; realny ma trzy stany (zapisz / w bibliotece / zarchiwizowane) i wybór prywatny/publiczny | `screens/ReaderScreen.tsx:262-286` | blocks-showme | M |
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

## Czego tu nie ma i nie będzie

In-app browser, realne pobieranie offline, realne sondowanie relayów, OPML, integracja z Amberem i
bunkerem, czytanie schowka. To nie są luki do domknięcia — to granica „bez sieci i bez realnej
krypto" z `CLAUDE.md`. Wiersze wyżej opisują je jako `missing` tylko tam, gdzie realna apka ma w tym
miejscu widoczny **interfejs**, którego u nas nie ma.
