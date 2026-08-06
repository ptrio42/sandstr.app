# Primal — gap ledger

> Ground truth: `docs/refs/primal/screen-map.md` · Sim: `src/simulators/primal/`
> Audited: 2026-08-05 · Registry status: ready · Sim LOC: 2723 (web + tour wrapper; unrouted `mobile/` stub excluded per `README.md`)

## Rollup

| missing | dead | partial | unreachable | unanchored | ok |
|---|---|---|---|---|---|
| 17 | 17 | 12 | 1 | 3 | 14 |

**Top 3 do zrobienia:** pri-51 (podekrany Settings — blokują demo `showMe` dla backup-keys/wallet/mute) · pri-15/pri-48 (cudzy profil) · pri-18 (`openThread`).
*(Poprzednie top-3 — pri-64 mostek, pri-02 kotwice nawigacji, pri-27 zakładki Explore — plus pri-04 logout zamknięte 2026-08-06; settings-połowa pri-03 też.)*

## Gaps

| ID | Surface (ścieżka w UI) | § | Status | Gap | Evidence | FAQ impact | Effort |
|---|---|---|---|---|---|---|---|
| pri-01 | Lewy pasek → nawigacja (Home, Reads, Explore, Messages, Bookmarks, Notifications, Downloads, Premium, Settings) | §Left Sidebar | ok | 9 pozycji w tej samej kolejności co `NavMenu.tsx`, bąbelki na Messages/Notifications/Downloads/Premium, każda pozycja realnie przełącza ekran | `web/components/LeftSidebar.tsx:10`, `web/WebSimulator.tsx:115` | none | — |
| pri-02 | Lewy pasek → dowolna pozycja poza Settings (spotlight) | §Left Sidebar | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Wszystkie wiersze dzielą jedną klasę `primal-nav-item` i tylko Settings dostaje `data-tour` → nie da się wskazać „zakładki Messages" ani „Bookmarks" | `web/components/LeftSidebar.tsx:43-47` | blocks-showme | S |
| pri-03 | Lewy pasek → Settings / user chip (kolizje selektorów) | §Left Sidebar | partial | **Połowa settings zamknięta 2026-08-06** (root ekranu przemianowany na `primal-settings-screen`, krok 8 touru celuje w niego); kolizja `.primal-profile` (chip vs ekran) NADAL otwarta. `[data-tour="primal-settings"]` jest DWA razy (wiersz nawigacji + root ekranu), a klasa `.primal-profile` jest na chipie użytkownika i na ekranie profilu — `querySelector` zawsze złapie element z sidebara, nie ekran | `web/components/LeftSidebar.tsx:47` + `web/screens/SettingsScreen.tsx:8`; `web/components/LeftSidebar.tsx:72` + `web/screens/ProfileScreen.tsx:20` | breaks-showme | S |
| pri-04 | Settings → Logout (i powrót do ekranu logowania) | §Settings (menu footer) | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: dead. Przycisk Logout nie ma `onClick`, a unia komend nie zna `logout` → po zalogowaniu ekran logowania i kotwica `primal-keys` są nieosiągalne do końca sesji | `web/screens/SettingsScreen.tsx:21`; unia: `web/WebSimulator.tsx:24` | breaks-showme | S |
| pri-05 | Home widziany bez logowania („Welcome to nostr!" + „Get Started") | §Home Feed Header 1 | missing | Realny Primal pokazuje feed gościom z powitaniem i CTA; sim przy `!authenticated` renderuje pełnoekranowy LoginScreen zamiast feedu | `web/WebSimulator.tsx:109-111` | blocks-showme | M |
| pri-06 | Lewy pasek → „New Note" + chip użytkownika (ProfileWidget) + „Publish pending" (EventQueueWidget) | §Left Sidebar | ok | Pill „New Note" otwiera edytor, chip prowadzi na profil, kolejka publikacji pojawia się po wysłaniu noty; obie kontrolki zakotwiczone | `web/components/LeftSidebar.tsx:61,66,71` | none | — |
| pri-07 | Home → selektor feedu („Trending 24h ▾" → „Notes Feed:") | §Home Feed Header | unanchored | Dropdown jest wierny (nie taby, caption „Notes Feed:", check przy wybranym) i działa, ale nie ma `data-tour`, a żadna komenda go nie otwiera — spotlight pokaże tylko zamknięty trigger | `web/screens/HomeScreen.tsx:78-110` | blocks-showme | S |
| pri-08 | Home → selektor feedu → „Edit Feeds" | §Home Feed Header (FeedSelect) | dead | Link ma `onClick={() => setOpen(false)}` — tylko zamyka panel; realny prowadzi do `/settings/home_feeds` | `web/screens/HomeScreen.tsx:92` | breaks-showme | S |
| pri-09 | Home → licznik „N New Notes" + przyklejony mały nagłówek z drugim selektorem | §Home Feed Header 2-3 | missing | Nagłówek ma wyłącznie selektor; nie ma licznika nowych not ani sticky-headera pojawiającego się przy scrollu | `absent` — `web/screens/HomeScreen.tsx:77-111` | blocks-showme | M |
| pri-10 | Home → „Say something on nostr..." → rozwinięty edytor | §Compose 1-6 | ok | Pill bez ramki → rozwinięcie z niebieską obwódką, brak placeholdera w textarea, „NOTE PREVIEW", Post wyłączony przy pustym tekście, Post/Cancel działają; zakotwiczone `primal-compose` | `web/components/ComposeBox.tsx:24-67` | none | — |
| pri-11 | Compose → pasek narzędzi (obraz / ankieta / emoji) | §Compose 4 | dead | Trzy przyciski renderują się, żaden nie ma `onClick` — brak file-pickera, trybu ankiety i palety emoji | `web/components/ComposeBox.tsx:54-56` | breaks-showme | M |
| pri-12 | Nota → pasek akcji (reply → zap → like → repost → bookmark) | §Note Card + Action Bar | ok | Kolejność wierna (zap DRUGI), like to serce, kolory per-stan; like/repost/bookmark realnie się przełączają, zap barwi się i wywołuje callback; selektory `.primal-action.{zap,like,repost,bookmark}` stabilne | `web/components/NoteCard.tsx:90-111` | none | — |
| pri-13 | Nota → reply (pierwsza akcja) | §Note Card + Action Bar 1 | dead | `onClick={stop}` — tylko zatrzymuje propagację; nie otwiera komponera odpowiedzi ani wątku | `web/components/NoteCard.tsx:91` | breaks-showme | M |
| pri-14 | Nota → „…" menu kontekstowe (przy czasie) | §Note Card (NoteAuthorInfo, ellipsisIcon) | dead | `onClick={stop}` — realny otwiera `PrimalMenu` (copy note ID/link, mute, report itd.) | `web/components/NoteCard.tsx:32-34` | breaks-showme | M |
| pri-15 | Nota → awatar/nazwa autora → jego profil | §Profile page | missing | Awatar i nazwa nie są klikalne; klik w kartę otwiera wątek. W symulatorze nie istnieje żaden CUDZY profil — `viewProfile` zawsze pokazuje własny | `web/components/NoteCard.tsx:23-31`; `web/WebSimulator.tsx:102-104` | blocks-showme | M |
| pri-16 | Nota → bookmark → strona Bookmarks | §Note Card 5 | partial | Toggle jest tylko lokalnym stanem karty; zakładka Bookmarks renderuje stałą listę `bookmarkedNotes` i nic o kliknięciu nie wie (dyskusyjne: sam przycisk jest wierny) | `web/components/NoteCard.tsx:19,108`; `web/screens/BookmarksScreen.tsx:12` | breaks-showme | M |
| pri-17 | Nota → pasek top-zapów → biała pigułka „Zap" + okrągłe „…" (more zaps) | §Note Card (NoteTopZaps) | missing | Renderujemy jedną pigułkę z kwotą + dwa awatary; brak CTA „Zap" i przycisku przepełnienia; pasek pojawia się tylko przy notach z mediami | `web/components/NoteCard.tsx:52-64` | blocks-showme | S |
| pri-18 | Nota → otwarcie wątku (widok pojedynczej noty) | §Note Card (notePrimary) | unreachable | Ekran istnieje i działa, ale ustawia go wyłącznie klik w kartę — unia komend nie ma nic w rodzaju `openThread`; dodatkowo nota główna nie dostaje wariantu „primary" (większa czcionka, pełne pigułki zapów) | `web/WebSimulator.tsx:79,114`; unia: `web/WebSimulator.tsx:24` | blocks-showme | S |
| pri-19 | Wątek → „Replying to this Note" → Post | §Note Card / §Compose | dead | Pole odpowiedzi jest niekontrolowane, przycisk „Post" nie ma `onClick` — odpowiedź nigdy nie powstaje | `web/screens/ThreadScreen.tsx:29-30` | breaks-showme | M |
| pri-20 | Prawy panel (Home) → „Live on Nostr" | §Right Sidebar 2a | ok | Karta pigułkowa: awatar, tytuł, „Started 1 yr. ago", liczba widzów, czerwona plakietka Live z kropką | `web/components/RightSidebar.tsx:150-158` | none | — |
| pri-21 | Prawy panel (Home) → selektor „Trending 4h" (8 opcji, w tym Most-zapped) | §Right Sidebar 2b | missing | Renderujemy statyczny nagłówek „Trending 4h"; realnie to `SelectionBox2` z 4 zakresami Trending + 4 Most-zapped | `web/components/RightSidebar.tsx:159` | blocks-showme | M |
| pri-22 | Prawy panel → Search → Enter / strona wyników | §Right Sidebar 1 | partial | Wpisanie tekstu pokazuje podpowiedzi (wiersz zapytania + profile), ale formularza nie ma — Enter nic nie robi, nie istnieje ekran wyników ani wiersz „Search nostr" przy pustym polu | `web/components/RightSidebar.tsx:12-42` | blocks-showme | M |
| pri-23 | Prawy panel → pigułka Search (spotlight) | §Right Sidebar 1 | unanchored | Brak `data-tour`, a klasa `.primal-search` jest użyta w 6 miejscach (Explore, dwa pola w Messages, komponer wątku, pole klucza na logowaniu) → selektor niejednoznaczny | `web/components/RightSidebar.tsx:16`; kolizje: `web/screens/ExploreScreen.tsx:18`, `web/screens/MessagesScreen.tsx:41,55`, `web/screens/ThreadScreen.tsx:29`, `web/screens/LoginScreen.tsx:34` (ten ostatni nie współistnieje — pełnoekranowy) | blocks-showme | S |
| pri-24 | Explore → pasek wyszukiwania (pełna szerokość, główna kolumna) | §Explore page (shell) | dead | `<input placeholder="Search...">` bez stanu, bez formularza, bez podpowiedzi — w przeciwieństwie do pigułki w prawym panelu nic nie zwraca | `web/screens/ExploreScreen.tsx:18` | breaks-showme | S |
| pri-25 | Explore → „Advanced Search" | §Explore page (tabs) | dead | `<span>` z `cursor:pointer` i bez handlera; realnie link do `/search` | `web/screens/ExploreScreen.tsx:24` | breaks-showme | M |
| pri-26 | Explore → Feeds → karta DVM (like / zap / token ceny) | §Explore Tab 1 | partial | Karty mają awatar, tytuł, opis i pigułkę FREE, ale liczniki like/zap to statyczny tekst (nie `DvmFooterActionButton`), nie ma wariantu „PAID" ani linii „Created by Primal", a karta jest bezwładna — realnie prowadzi do `/explore/feed/<id>`, którego u nas nie ma | `web/screens/ExploreScreen.tsx:39-44` | breaks-showme | M |
| pri-27 | Explore → People → Follow | §Explore Tab 2 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. Kotwica `primal-follow` żyje wyłącznie w zakładce People, a domyślna zakładka to Feeds i **żadna komenda nie przełącza zakładek Explore** — krok 6 wysyłanego touru celuje w element, którego nie ma w DOM | `web/screens/ExploreScreen.tsx:11,65`; `PrimalWebSimulatorWithTour.tsx:74` | blocks-showme | S |
| pri-28 | Explore → Zaps | §Explore Tab 3 | partial | Renderujemy RANKING (numery 1-6, nadawca + kwota). Screen-mapa mówi wprost: to lista, nie leaderboard, i każda karta ma nadawcę → kwotę → odbiorcę → zzapowaną treść | `web/screens/ExploreScreen.tsx:75-89` | breaks-showme | M |
| pri-29 | Explore → Media | §Explore Tab 4 | missing | Zakładka istnieje, ale renderuje pusty `<div>` — klik prowadzi na białą/czarną planszę; brak siatki 4×148px miniatur | `web/screens/ExploreScreen.tsx:91-93` | breaks-showme | M |
| pri-30 | Explore → Topics | §Explore Tab 5 | partial | Chipy `#topic` są `<span>`ami bez licznika i bez linku — renderują się, ale klik jest bezwładny; realnie 2-kolumnowa siatka `#topic` + „12.3K notes", każdy chip prowadzi do wyszukiwania hashtagu | `web/screens/ExploreScreen.tsx:95-101` | breaks-showme | S |
| pri-31 | Prawy panel (Explore) → statystyki sieci / Hot Topics / trending users | §Explore right column | ok | 6 liczników w kolejności users/zaps/btc zapped/public notes/reactions/all events (małe litery), 19 chipów Hot Topics, siatka trending users | `web/components/RightSidebar.tsx:56-81`; `web/data.ts:153-172` | none | — |
| pri-32 | Notifications → zakładki All / Zaps / Replies / Mentions / Reposts | §Notifications 1 | ok | Pięć zakładek w poprawnej kolejności, wielkie litery przez CSS, filtr realnie zawęża listę; brak zakładki „Reactions" jest wierny | `web/screens/NotificationsScreen.tsx:6,55-62` | none | — |
| pri-33 | Notifications → konkretna zakładka (spotlight) | §Notifications 1 | unanchored | Brak `data-tour`; klasa `.primal-tab` jest wspólna dla Explore, Messages i Notifications → nie da się wskazać „zakładki Zaps" | `web/screens/NotificationsScreen.tsx:70` | blocks-showme | S |
| pri-34 | Notifications → pasek „99+ new notifications" | §Notifications 2 | dead | Przycisk bez `onClick` — realny doładowuje nowe powiadomienia i znika | `web/screens/NotificationsScreen.tsx:77` | breaks-showme | S |
| pri-35 | Notifications → grupowanie aktorów (do 6 awatarów + „+N") i kropka nieprzeczytanych | §Notifications 4, 3 | missing | Wiersz to ikona typu + jedna nazwa + fraza; nie ma klastra awatarów, chipa „+N" ani 10×10 niebieskiej kropki `newBubble` | `absent` — `web/screens/NotificationsScreen.tsx:27-51` | blocks-showme | M |
| pri-36 | Prawy panel (Notifications) → „Summary" | §Notifications 7 | partial | Nagłówek jest, ale treść to na sztywno „no new notifications" — brak kategorii Followers / Zaps (+ suma satów) / Reactions / Replies / Reposts / Mentions / Other | `web/components/RightSidebar.tsx:50-52` | breaks-showme | M |
| pri-37 | Messages → lista rozmów | §Messages 3 | ok | Awatar, nazwa · czas, niebieski NUMERYCZNY bąbelek nieprzeczytanych, druga linia = nip05 (nie podgląd wiadomości), zaznaczenie działa | `web/screens/MessagesScreen.tsx:23-35` | none | — |
| pri-38 | Messages → zakładki „follows" / „other" | §Messages 1-2 | partial | Klik zmienia podświetlenie, ale lista kontaktów renderuje `conversations` bez filtra; realnie zakładka dodatkowo przeskakuje do pierwszej rozmowy | `web/screens/MessagesScreen.tsx:8,18-19,23` | breaks-showme | S |
| pri-39 | Messages → „Mark All Read" | §Messages 1 | dead | `<span>` bez handlera i bez stanu disabled; realnie zeruje liczniki nieprzeczytanych | `web/screens/MessagesScreen.tsx:20` | breaks-showme | S |
| pri-40 | Messages → komponer (pole + wyślij) | §Messages 5 | dead | Pole bez stanu, przycisk wysyłki bez `onClick` — nie da się wysłać wiadomości; brak zmiany przycisku secondary→primary przy tekście | `web/screens/MessagesScreen.tsx:55-56` | breaks-showme | M |
| pri-41 | Messages → pole „find user" nad rozmową | §Messages 2 | dead | Martwy input, w dodatku w złym miejscu: realny `<Search>` jest przeportowany do prawej kolumny, panel rozmowy nie ma własnego pola | `web/screens/MessagesScreen.tsx:41`; brak prawego panelu: `web/WebSimulator.tsx:132,152` | breaks-showme | S |
| pri-42 | Profil → przycisk QR | §Profile action row 2 | missing | Rząd akcji ma „…", zap, message i „edit profile"; brak okrągłego QR (`openProfileQr`) | `absent` — `web/screens/ProfileScreen.tsx:27-32` | blocks-showme | S |
| pri-43 | Profil → „…" / zap / message | §Profile action row 1,3,4 | dead | Trzy okrągłe przyciski bez `onClick`; dodatkowo zap i message powinny znikać na własnym profilu, a tu są zawsze widoczne | `web/screens/ProfileScreen.tsx:28-30` | breaks-showme | M |
| pri-44 | Profil → „Edit Profile" | §Profile action row 6 | dead | Przycisk bez `onClick` — brak formularza edycji metadanych | `web/screens/ProfileScreen.tsx:31` | breaks-showme | M |
| pri-45 | Profil → liczniki following / followers → modal listy | §Profile card counts | missing | Liczby są zwykłymi `<span>`ami, nie przyciskami; brak `ProfileFollowModal` | `web/screens/ProfileScreen.tsx:47` | blocks-showme | M |
| pri-46 | Profil → pasek statystyk = zakładki (Notes / Replies / Reads / Media / Zaps / Relays) | §Profile stat strip | partial | Sześć zakładek z poprawnymi etykietami i liczbami, ale `statTab` steruje tylko podświetleniem — pod spodem zawsze ta sama lista not (Media, Zaps, Relays nie mają własnej treści) | `web/screens/ProfileScreen.tsx:17,56-66` | breaks-showme | M |
| pri-47 | Profil → „Followed by" (nakładające się awatary) | §Profile card | missing | Karta ma nazwę, nip05, „follows you", bio, stronę, liczniki i datę dołączenia — brak sekcji „Followed by" | `absent` — `web/screens/ProfileScreen.tsx:34-53` | blocks-showme | S |
| pri-48 | Profil cudzej osoby → Follow / Unfollow | §Profile action row 5 | missing | Istnieje wyłącznie własny profil (na sztywno `currentUser`), więc pill Follow/Unfollow z profilu nie istnieje — jedyny Follow w symulatorze jest w Explore → People | `web/screens/ProfileScreen.tsx:16-31`; `web/WebSimulator.tsx:102-104` | blocks-showme | M |
| pri-49 | Prawy panel (Profil) → „Latest Reads" / „Popular Notes" | §Profile right sidebar | ok | Obie sekcje z właściwymi captionami i układem wierszy (awatar + nazwa + „\| czas" + 2-liniowy podgląd) | `web/components/RightSidebar.tsx:84-120` | none | — |
| pri-50 | Settings → „Account" (pierwszy wiersz, bąbelek „1") | §Settings menu 1 | missing | Lista zaczyna się od „Appearance" — brak wiersza Account, czyli ścieżki, którą FAQ opisuje przy kopiowaniu/backupie kluczy | `web/data.ts:294-297` | blocks-showme | S |
| pri-51 | Settings → dowolny wiersz → podekran | §Settings (całość) | dead | Klik ustawia tylko klasę `active`; chevron nigdzie nie prowadzi. Żaden z 11 podekranów nie istnieje, więc Appearance, Home Feeds, Muted Content, Connected Wallets, Notifications, Network, Zaps to ślepe wiersze | `web/screens/SettingsScreen.tsx:13-18` | breaks-showme | L |
| pri-52 | Settings → Appearance → „Select a theme" („midnight wave" / „ice wave") + 2 checkboxy | §Settings → Appearance | missing | Brak ekranu wyboru motywu; motyw symulatora steruje wyłącznie przełącznik hosta (`useParentTheme`) | `absent` — `web/screens/SettingsScreen.tsx`; motyw: `web/WebSimulator.tsx:48` | blocks-showme | M |
| pri-53 | Settings → Network → Relays (dodaj / usuń / status) + Caching Service | §Settings → Network | missing | Nie ma ekranu sieci: brak pola „Connect to relay", przycisków „Remove", checkboxa „Use Enhanced Privacy" i sekcji caching service. Prawa szyna pokazuje przekaźniki tylko do odczytu | `absent` — `web/screens/SettingsScreen.tsx`; read-only: `web/components/RightSidebar.tsx:126-143` | blocks-showme | M |
| pri-54 | Settings → Home Feeds | §Settings menu 3 | missing | Cel linku „Edit Feeds" (pri-08) nie istnieje — nie da się pokazać, gdzie włącza się i porządkuje feedy | `absent` — `web/screens/SettingsScreen.tsx` | blocks-showme | M |
| pri-55 | Prawy panel (Settings) → „Relays" + „Caching services" | §Settings right rail | ok | Zielone/czerwone kropki statusu, lista przekaźników i jeden wiersz caching service — zgodnie z `SettingsSidebar` (to szyna informacyjna, nieklikalna także w oryginale) | `web/components/RightSidebar.tsx:126-143` | none | — |
| pri-56 | Reads → selektor feedu („Reads ▾") | §Reads (ReadsHeader) | dead | `<button>` z chevronem bez `onClick` — nie ma listy feedów Reads | `web/screens/ReadsScreen.tsx:18` | breaks-showme | S |
| pri-57 | Reads → karta artykułu → czytnik (Longform) | §Reads → Article reader | missing | Karta ma `cursor:pointer`, ale zero handlerów; nie istnieje widok artykułu (tytuł 44px, hero, summary z belką, markdown, tagi, odpowiedzi). Drobiazg przy okazji: pigułka czasu czytania mówi „7 min read" zamiast „{N} minute read" | `web/screens/ReadsScreen.tsx:21,32` | blocks-showme | L |
| pri-58 | Reads → stopka karty artykułu (reply / repost / zap / like) | §Reads → ArticlePreview `.footer` | missing | Karta kończy się na miniaturze — brak `ArticleFooter`, więc z poziomu Reads nie da się wykonać żadnej akcji | `absent` — `web/screens/ReadsScreen.tsx:20-39` | blocks-showme | M |
| pri-59 | Bookmarks → „Bookmarked Notes ▾" | — (poza screen-mapą) | dead | Przycisk z chevronem bez `onClick`. Uwaga: screen-mapa w ogóle nie opisuje strony Bookmarks, więc porównania z oryginałem brak — martwa kontrolka jest jednak faktem | `web/screens/BookmarksScreen.tsx:10` | breaks-showme | S |
| pri-60 | Downloads / Premium → „Download" / „Subscribe" | §Left Sidebar (poz. 7-8) | dead | Oba ekrany to jedna plansza z CTA bez `onClick`. Screen-mapa dokumentuje tylko pozycje nawigacji, nie zawartość tych stron — zakres treści do recon | `web/screens/PlaceholderScreen.tsx:23-25` | breaks-showme | M |
| pri-61 | Prawy panel (Reads) → `ReadsSidebar` | §Reads (page shell) | partial | `RIGHT_VARIANT.reads = 'home'` → na Reads renderuje się szyna HOME („Live on Nostr" + „Trending 4h"), a realny Reads ma własny `ReadsSidebar`. Powierzchnia jest, ale pokazuje treść innej strony | `web/WebSimulator.tsx:36`; szyna: `web/components/RightSidebar.tsx:147-172` | breaks-showme | L |
| pri-62 | Notifications → wiersz → treść referencyjna i klik w aktora / notę | §Notifications 3 | partial | Referencja renderuje się jako zwykły szary tekst (`n.note`), a nie zagnieżdżony `<Note noteType="notification">` / `ArticlePreview`; ani nazwa aktora, ani referencja nie są linkami, więc z powiadomienia nie da się przejść do noty ani na profil | `web/screens/NotificationsScreen.tsx:38,47` | blocks-showme | M |
| pri-63 | Lewy pasek → „New Note" — reguły widoczności i etykiety | §Left Sidebar (New Note) | partial | Pill renderuje się zawsze; realnie znika na `/messages`, `/premium` i `/settings`, a na `/reads` zmienia etykietę na „My Articles" (primary → `/myarticles`) | `web/components/LeftSidebar.tsx:61` | none | S |
| pri-64 | (cały klient) FAQ „Show me" → symulator | — | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: missing. **Nie ma mostka FAQ.** Wrapper nie importuje ani nie renderuje `FaqMiniTourLauncher`, nie ma `faqCommandsRef` ani gałęzi `isFaqStepId` w `onStepChange`, a `src/data/faq/index.ts` nie mapuje `primal`. `SHOW_FAQ_EVENT` poleci więc w próżnię i **żaden** `showMe` z tego pliku nie zadziała — warunek konieczny dla każdego innego wiersza `blocks-showme`. Wzorzec do skopiowania: `src/simulators/damus/DamusSimulatorWithTour.tsx:9,22,74,92-98,147` | `PrimalWebSimulatorWithTour.tsx` (brak `FaqMiniTourLauncher`) · `src/data/faq/index.ts:4-6` | blocks-showme | S |

## Anchors — `data-tour` obecne w symulatorze

| Selector | Plik:linia | Powierzchnia |
|---|---|---|
| `[data-tour="primal-keys"]` | `web/screens/LoginScreen.tsx:33` | Blok pola klucza na ekranie logowania (osiągalny tylko przed pierwszym `login`) |
| `[data-tour="primal-feed"]` | `web/screens/HomeScreen.tsx:112` | Lista not na Home |
| `[data-tour="primal-compose"]` | `web/components/ComposeBox.tsx:32` | Rozwinięty edytor noty (tylko gdy `composeOpen`) |
| `[data-tour="primal-post"]` | `web/components/LeftSidebar.tsx:61` | Przycisk „New Note" w lewym pasku |
| `[data-tour="primal-profile"]` | `web/components/LeftSidebar.tsx:73` | Chip użytkownika na dole lewego paska (kolizja klasowa z `.primal-profile` = root ekranu profilu) |
| `[data-tour="primal-settings"]` | `web/components/LeftSidebar.tsx:47` | Wiersz „Settings" w nawigacji — **pierwszy w DOM** |
| `[data-tour="primal-settings"]` | `web/screens/SettingsScreen.tsx:8` | Root ekranu Settings — **ten sam selektor, drugi w DOM** (patrz pri-03) |
| `[data-tour="primal-follow"]` | `web/screens/ExploreScreen.tsx:65` | Przycisk Follow w Explore → People (nie w domyślnej zakładce — pri-27) |
| `[data-tour="primal-zaps"]` | `web/components/NoteCard.tsx:96` | Akcja zap na PIERWSZEJ nocie feedu (`zapTourHook={i === 0}`) |

8 unikalnych selektorów w 9 miejscach.

Stabilne selektory klasowe użyteczne jako zamienniki kotwic (potwierdzone w `web/primal-web.theme.css`):
`.primal-action.reply` / `.zap` / `.like` / `.repost` / `.bookmark` (515-533), `.primal-feedselector` (267),
`.primal-statcol` (781), `.primal-setrow` (802), `.primal-convo` (715), `.primal-nav-item` (167),
`.primal-tab` (341 — niejednoznaczny, patrz pri-33), `.primal-search` (576 — niejednoznaczny, patrz pri-23).

## Reachability — komendy toura

**Union:** `type: 'login' | 'navigate' | 'compose' | 'post' | 'viewProfile'` (`web/WebSimulator.tsx:23-26`),
payloady: `navigate` przyjmuje `TabId` = `home | reads | explore | messages | bookmarks | notifications | downloads | premium | settings | profile` (`web/WebSimulator.tsx:19-21`, guard `RIGHT_VARIANT[tab] !== undefined` przepuszcza wszystkie 10).
`compose`, `post` i `viewProfile` są **no-op dopóki `authenticated === false`** (`web/WebSimulator.tsx:93-104`) → każdy showMe musi zaczynać się od `{ type: 'login' }`, co zjada jeden z dwóch pewnych slotów kolejki.

| Powierzchnia | Osiągalna komendą? | Czym |
|---|---|---|
| Ekran logowania (`primal-keys`) | tylko przy starcie | brak komendy `logout`; po `login` nie ma powrotu (pri-04) |
| Home + feed | tak | `login` → `navigate:'home'` |
| Rozwinięty edytor (`primal-compose`) | tak | `login` → `compose` (samo `compose` wymusza `activeTab='home'`) |
| Wysłana nota + toast | tak | `login` → `post` (otwiera edytor i publikuje po 400 ms) |
| Reads / Explore / Messages / Bookmarks / Notifications / Downloads / Premium / Settings | tak | `login` → `navigate:'<tab>'` |
| Profil (własny) | tak | `login` → `viewProfile` (albo `navigate:'profile'`) |
| Explore → People / Zaps / Media / Topics | **nie** | brak komendy zmieniającej zakładkę Explore; domyślna to Feeds → kotwica `primal-follow` niedostępna (pri-27) |
| Notifications → Zaps / Replies / Mentions / Reposts | **nie** | brak komendy; domyślna zakładka to All |
| Profil → zakładki Replies / Reads / Media / Zaps / Relays | **nie** | brak komendy; i tak nie zmieniają treści (pri-46) |
| Messages → zakładka „other" / konkretna rozmowa | **nie** | brak komendy; domyślnie `follows` + rozmowa nr 0 |
| Wątek pojedynczej noty | **nie** | tylko klik w kartę (pri-18) |
| Otwarty panel selektora feedu („Notes Feed:") | **nie** | stan lokalny `HomeScreen`, brak komendy (pri-07) |
| Dowolny podekran Settings | **nie** | podekrany nie istnieją (pri-51) |

Uwaga o kolejce: `PrimalWebSimulatorWithTour.tsx:26-56` przepuszcza pewnie **dwie** komendy na krok.
Krok 3 i 4 wysyłanego touru wysyłają po **trzy** (`login` + `navigate` + `compose`/`post`,
`PrimalWebSimulatorWithTour.tsx:71-72`) — trzecia bywa gubiona. Autor FAQ powinien pisać
`[{login},{compose}]` / `[{login},{post}]`, bez pośredniego `navigate`.

## Poza zakresem / do recon

- **Logowanie / onboarding.** `screen-map.md` nie ma sekcji o `/login`, kluczach, rozszerzeniu NIP-07 ani
  zakładaniu konta, a symulator ma pełny `LoginScreen` z polem nsec i przyciskiem „Create a new account",
  który po prostu loguje (`web/screens/LoginScreen.tsx:55-61`). Nie da się orzec luki bez recon tej ścieżki.
- **Strona `/search` (Advanced Search).** Screen-mapa opisuje tylko pigułkę Search i link do `/search`;
  zawartość ekranu wyników nieudokumentowana (dotyczy pri-22, pri-25).
- **`ReadsSidebar` (prawa szyna na Reads).** Screen-mapa wymienia komponent z nazwy, ale nie opisuje jego
  zawartości — wiadomo więc, że nasza szyna jest zła (pri-61), ale nie wiadomo, czym ją zastąpić.
- **Strona Bookmarks.** Brak sekcji w screen-mapie — nie wiemy, czy realny Primal ma tam selektor feedu,
  zakładki ani jaki jest prawy panel (dotyczy pri-59).
- **Downloads i Premium.** Screen-mapa wymienia je tylko jako pozycje `NavMenu`; zawartość stron
  (plany, ceny, linki do sklepów) do recon (dotyczy pri-60).
- **Wątek / widok pojedynczej noty jako osobny ekran.** Screen-mapa opisuje wariant `notePrimary` w karcie,
  ale nie nagłówek trasy `/e/<id>` ani kolejność odpowiedzi — stąd „Thread ▾" w symulatorze
  (`web/screens/ThreadScreen.tsx:19`) nie ma wobec czego być mierzone.
- **Wersja aplikacji.** Symulator pokazuje `3.0.119` (`web/data.ts:299`), screen-mapa rekomenduje `2.0.19`
  „pod nagranie" — kosmetyka, nie funkcja; nie filed.
- **`src/simulators/primal/mobile/`** — nieroutowany stub (rejestr ładuje wyłącznie
  `PrimalWebSimulatorWithTour`), poza produktem i poza tym ledgerem.
