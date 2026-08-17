# Damus — gap ledger

> Ground truth: `docs/refs/damus/screen-map.md` · Sim: `src/simulators/damus/`
> Audited: 2026-08-05 · Registry status: ready · Sim LOC: 2098 (1815 ts/tsx + 283 css)

## Rollup

| missing | dead | partial | unreachable | unanchored | ok |
|---|---|---|---|---|---|
| 10 | 21 | 10 | 2 | 6 | 10 |

**Top 3 do zrobienia:** dam-13 · dam-42 · dam-37 (+dam-28)

> **Przetasowanie 2026-08-17.** dam-19 i dam-29 zeszły do `ok` (23 → 21 `dead`,
> 8 → 10 `ok`), więc dam-29 wypada z Top 3 i awansuje dam-37 („DM conversation" —
> cała druga zakładka kończy się na liście). **dam-28 zostaje otwarty i jest teraz
> bardziej widoczny:** relay można DODAĆ i odfiltrować, ale nie da się go usunąć,
> bo `Edit` wciąż nie ma handlera — asymetria, której przedtem nie było widać, bo
> dodawanie też nie działało.

> **Przetasowanie 2026-08-08.** dam-39 wypadł z Top 3: był tam dlatego, że główny tour podświetlał
> ten martwy przycisk, a nie dlatego, że sam brak handlera boli. Tour już w niego nie celuje, więc
> została zwykła martwa kontrolka bez odbiorcy. Awansuje dam-42 („Keys" — jedyny cel FAQ
> `backup-keys`).

## Gaps

| ID | Surface (ścieżka w UI) | § | Status | Gap | Evidence | FAQ impact | Effort |
|---|---|---|---|---|---|---|---|
| dam-01 | Welcome → Sign In → key entry (nsec1… + Paste + QR scan + Login) | §11 | missing | Cały `LoginView` nie istnieje — "Sign In" loguje od razu losowym mockiem; nie ma pola na klucz, akcesoriów Paste/QR ani CTA "Login" (FAQ `sign-in` opisuje krok, którego nie da się pokazać) | `screens/LoginScreen.tsx:15,49` | blocks-showme | M |
| dam-02 | Welcome → "EULA" link | §11 | dead | Renderowany jako fioletowy link w `<span>`, brak handlera; realny jest tappable | `screens/LoginScreen.tsx:53` | none | S |
| dam-03 | Welcome → Create Account → copy secret key | §11 | dead | Ikona kopiowania to goły SVG w `<div>` — nic nie kopiuje, brak stanu "Copied". (Ekran jest nasz — §11 specyfikuje tylko wejście w CreateAccount) | `screens/LoginScreen.tsx:36` | blocks-showme | S |
| dam-04 | Home → note → Share (5. akcja) | §3 | dead | `onClick={stop()}` — wyłącznie `stopPropagation`, żadnego share sheeta | `components/NoteCard.tsx:131` | breaks-showme | S |
| dam-05 | Home → note → Zap (widoczność) | §3 | partial | Zap renderuje się zawsze; §3 warunkuje go LNURL autora, a FAQ `zap` wprost to obiecuje — mock users bez `lightningAddress` i tak dostają przycisk | `components/NoteCard.tsx:128` | breaks-showme | S |
| dam-06 | Home → note → reaction picker (emoji inne niż 🤙) | §3 | missing | Jest tylko toggle shaka; brak palety `🤣 🤙 ⚡ 💜 🔥 😀 😃 😄 🥶` i brak wiersza `default_emoji_reaction` w Settings, o którym mówi FAQ `shaka` | `components/NoteCard.tsx:125` · absent w `screens/SettingsScreen.tsx` | blocks-showme | M |
| dam-07 | Home → note → "…" (overflow) | §3 | dead | `EllipsisIcon` w `<span>` bez handlera i **bez `stopPropagation`** — klik przechodzi na `onClick` całej karty i otwiera WĄTEK zamiast menu noty (copy text/id, broadcast, mute, bookmark). Ten sam martwy "…" w wątku i w podglądzie odpowiedzi. Arguable: screen-mapa nie specyfikuje zawartości menu | `components/NoteCard.tsx:61,89` · `screens/ThreadScreen.tsx:41` · `screens/ComposeScreen.tsx:52` | breaks-showme | M |
| dam-08 | Home → Notes / Notes & Replies (picker) | §4 | partial | Klik przesuwa tylko podkreślenie — obie zakładki renderują ten sam feed (mock note nie ma pola parent/reply) | `screens/HomeScreen.tsx:22,24` | breaks-showme | M |
| dam-09 | Side menu → Labs | §5 | missing | Wiersza nie ma w tablicy `items`; §5 ma go jako `always` (między Purple a Muted) — FAQ `side-menu` też go pomija, bo powstał z symulatora, nie ze screen-mapy | `screens/SideMenu.tsx:24-34` | blocks-showme | S |
| dam-10 | Side menu → Wallet | §5 | missing | Wiersz jest i jest zakotwiczony, ale klik daje toast "Not in this demo" — ekranu Wallet nie ma | `screens/SideMenu.tsx:26` → `DamusSimulator.tsx:91` | blocks-showme | L |
| dam-11 | Side menu → Purple | §5 | missing | j.w. — `DamusPurpleView` nie istnieje; FAQ `purple` krok 3 ("tap it to see the subscription") nie do zademonstrowania | `screens/SideMenu.tsx:27` → `DamusSimulator.tsx:91` | blocks-showme | M |
| dam-12 | Side menu → Muted (MuteList) | §5 | missing | j.w. — brak listy wyciszonych; FAQ `muted` kończy się na podświetleniu wiersza | `screens/SideMenu.tsx:28` → `DamusSimulator.tsx:91` | blocks-showme | M |
| dam-13 | Side menu → npub pill (copy) | §5 | dead | `<button>` bez `onClick` — nie kopiuje i nie przełącza się na zielony check + "Copied" (3 s). FAQ `copy-npub` podświetla dokładnie ten element | `screens/SideMenu.tsx:51` | breaks-showme | S |
| dam-14 | Side menu → QR button | §5 | dead | `<button>` bez handlera; QR sheet nie istnieje. Żaden `showMe` w niego nie celuje, ale siedzi tuż nad spotlightem `copy-npub`, a krok 3 odpowiedzi każe go stuknąć | `screens/SideMenu.tsx:44` | blocks-showme | M |
| dam-15 | Side menu → status button (`add-reaction`) | §5 | dead | `<button>` bez handlera; user-status sheet nie istnieje | `screens/SideMenu.tsx:43` | blocks-showme | M |
| dam-16 | Side menu → header (awatar + nazwa) → Profile | §5 | dead | W realnej apce cały `TopProfile` to NavigationLink do profilu; u nas zwykły `<div>` — profil tylko przez wiersz "Profile". FAQ `side-menu` krok 3 wprost każe stuknąć w nagłówek, a spotlight kroku 2 obejmuje cały drawer razem z nim | `screens/SideMenu.tsx:40-50` · `src/data/faq/damus.ts:204,215` | breaks-showme | S |
| dam-17 | Side menu → Logout → confirm alert | §5 | missing | Wylogowanie jest natychmiastowe; brak destrukcyjnego potwierdzenia, mimo że sesja jest "z privkey". FAQ `logout` krok 3 | `DamusSimulator.tsx:71,90` | blocks-showme | S |
| dam-18 | Side menu → Merch | §5 | partial | Przygaszony wiersz + toast zamiast zewnętrznego linku do `store.damus.io`. Arguable: świadome (brak sieci), ale ścieżki nie da się pokazać | `screens/SideMenu.tsx:31` → `DamusSimulator.tsx:91` | none | S |
| dam-19 | Universe → funnel (filter) → `.filter` sheet | §6, §6a | ok | Lejek jest `<button>`; arkusz `RelayFilterSheet` = detent 68% (550/812), uchwyt, napis dosłowny, toggle per relay z PEŁNYM URL-em, ON = relay widoczny. Stan w `relayState.ts` ponad oba ekrany, więc relay dodany w dam-29 pojawia się tutaj. FAQ `relay-feed` kroki 3–4 | `screens/SearchScreen.tsx:37-47` · `components/RelayFilterSheet.tsx` · `relayState.ts` | none | — |
| dam-20 | Universe / Notifications / DMs → relay signal ("7/13") | §6, §7 | dead | `<span>` bez handlera; §6/§7 linkują sygnał do RelayConfig. Na Home ten sam wskaźnik JEST przyciskiem otwierającym Relays | `screens/SearchScreen.tsx:32` · `screens/NotificationsScreen.tsx:36` · `screens/DMScreen.tsx:29` | blocks-showme | S |
| dam-21 | Universe → empty state | §6 | partial | Globalny feed **"All recent notes"** JEST (2026-08-17) i respektuje filtr relayów z dam-19 — notatki dostają relay deterministycznie po hashu id (`relayState.relayForNote`), a licznik "N of M" w nagłówku sekcji pokazuje zawężenie. Nadal brak sekcji **Follow Packs**, stąd wciąż `partial` | `screens/SearchScreen.tsx:90-119` · `relayState.ts` | none | S |
| dam-22 | Universe → pigułki `#tag` / `Search word` / trending | §6 | dead | Wszystkie pigułki to `<span>` — klik nie uruchamia wyszukiwania ani nie otwiera hashtagu | `screens/SearchScreen.tsx:49,50,58` | breaks-showme | S |
| dam-23 | Universe → Follow pill (stany) | §6 | partial | Tylko Follow/Unfollow (etykiety i wypełnienie zgodne z §6); brak "Follow Back" i przejściowych "Following…"/"Unfollowing…". Oba miejsca startują w stanie **już-obserwowany** (`followed[…] ?? true`, `following = !isMe`), więc `showMe` FAQ `follow` — tytuł „Follow", treść o wypełnionej pigułce Follow — podświetla obrysowe **"Unfollow"** | `screens/SearchScreen.tsx:67,82` · `screens/ProfileScreen.tsx:22,59` | breaks-showme | S |
| dam-24 | Notifications → gear (notification settings) | §7 | dead | Goła `GearIcon`, brak handlera i ekranu ustawień powiadomień. FAQ `notifications` krok 3 wskazuje ten gear | `screens/NotificationsScreen.tsx:37` | breaks-showme | M |
| dam-25 | Notifications → trusted-network filter | §7 | dead | Ikona bez handlera; podtytuł zahardkodowany na "All", więc stanu "Trusted Network" nie da się pokazać. Dodatkowo użyty `PersonCheckIcon`, który §7 wprost wyklucza (ma być network/shield) | `screens/NotificationsScreen.tsx:34,38` | breaks-showme | M |
| dam-26 | Notifications → zakładka Mentions | §7 | partial | Filtruje tylko `zaps`; Mentions renderuje dokładnie tę samą listę co All | `screens/NotificationsScreen.tsx:24` | breaks-showme | S |
| dam-27 | Notifications → zgrupowany wiersz (reakcje / reposty / zapy) | §7 | missing | Każdy wiersz to zwykły `NoteCard`; brak lewej kolumny ikon, rzędu awatarów reagujących, podsumowania "Alice & N others" i sumy msat | `screens/NotificationsScreen.tsx:55-64` | blocks-showme | M |
| dam-28 | Side menu → Relays → Edit / Done | §8 | dead | `<button>Edit</button>` bez `onClick`; brak trybu edycji i czerwonych minusów, czyli brak ścieżki usuwania relaya. FAQ `manage-relays` krok 3 | `screens/RelaysScreen.tsx:37` | breaks-showme | M |
| dam-29 | Side menu → Relays → Add relay | §8 | ok | `AddRelaySheet` odtworzony z nagrania (`shots/full/t_034.jpg`): detent 37% (300pt), uchwyt, wyśrodkowane „Add relay", dywizor, pole z ikoną wklejania i placeholderem `wss://some.relay.com`, CTA w gradiencie różowym. Dodany relay ląduje w My Relays I w arkuszu filtra. FAQ `relay-feed` kroki 1–2 | `screens/RelaysScreen.tsx:37-44` · `components/AddRelaySheet.tsx` | none | — |
| dam-30 | Relays → tap relay → RelayDetail | §8 | dead | Wiersz to `<div>` z chevronem i bez handlera — chevron obiecuje push, którego nie ma | `screens/RelaysScreen.tsx:57,71` | blocks-showme | M |
| dam-31 | Relays → segment "Recommended" | §8 | partial | Segment przełącza i skraca listę (12→8), ale wielki tytuł zostaje "My Relays", wiersze dalej mają status pill + chevron zamiast kapsuły "Add"/"Added", a Edit zostaje w nagłówku (§8: tylko na My Relays) | `screens/RelaysScreen.tsx:30,37,42,54` | breaks-showme | S |
| dam-32 | Compose → pasek załączników (foto / aparat / wideo / …) | §9 | dead | Pięć gołych SVG bez `<button>` i bez handlerów. §9 oznacza wnętrze sheeta jako [REC vs REPO], więc zakres jest miękki — ale kontrolki są martwe | `screens/ComposeScreen.tsx:78-84` | blocks-showme | M |
| dam-33 | Note → Thread → rząd akcji noty głównej | §3 | dead | Pięć ikon rozwiniętej noty to gołe SVG, nie przyciski — w wątku nie da się zrobić repost/shaka/zap (reply tylko przez dolny pasek) | `screens/ThreadScreen.tsx:55-61` | breaks-showme | S |
| dam-34 | Note → Thread (ekran) | — | unreachable | Pushowany wyłącznie kliknięciem noty; żadna komenda toura go nie montuje, brak też `data-tour` na ekranie | `DamusSimulator.tsx:28,61` · `screens/ThreadScreen.tsx:26` | blocks-showme | S |
| dam-35 | Side menu → Bookmarks (ekran) | — | unreachable | `navigate` nie ma payloadu `'bookmarks'` (i żadna komenda nie klika wiersza drawera) — ekran otwiera wyłącznie realny klik; dodatkowo nie ma `data-tour`. Fix = jeden payload, nie głębsza kolejka | `DamusSimulator.tsx:22-25,88` · `screens/BookmarksScreen.tsx:19` | blocks-showme | S |
| dam-36 | Bookmarks → Clear All | — | dead | `<button>` bez `onClick` | `screens/BookmarksScreen.tsx:23` | breaks-showme | S |
| dam-37 | DMs → otwarcie rozmowy | §2 | missing | Tap w konwersację otwiera PROFIL autora, nie czat; nie ma widoku wiadomości, pola pisania ani przycisku nowej rozmowy | `screens/DMScreen.tsx:38` | blocks-showme | M |
| dam-38 | Profile → "…" (overflow) | — | dead | `<button>` w bannerze bez `onClick` | `screens/ProfileScreen.tsx:37` | none | M |
| dam-39 | Profile (własny) → Edit | — | dead | `<button>` bez `onClick`. **Część „tourowa" zamknięta 2026-08-08 (fala 2 tourów):** przycisk nie nosi już `data-tour="damus-follow"` (kotwica została tylko na pigułce Follow), a krok 6 dostał komendę `viewUser` zamiast `viewProfile`, więc otwiera CUDZY profil i podświetla realną pigułkę. Zostaje sam martwy handler — nic już w niego nie celuje, stąd impact `breaks-showme` → `none` | `screens/ProfileScreen.tsx:50` (bez kotwicy) · `DamusSimulatorWithTour.tsx:116` (`viewUser`) | none | S |
| dam-40 | Profile → npub pill | — | dead | `<button>` bez handlera kopiowania (bliźniak dam-13) | `screens/ProfileScreen.tsx:72` | blocks-showme | S |
| dam-41 | Profile → Notes / Notes & Replies | §4 (wzorzec pickera) | partial | Jak dam-08 — zmienia się tylko podkreślenie, feed autora identyczny | `screens/ProfileScreen.tsx:23,26` | breaks-showme | S |
| dam-42 | Side menu → Settings → Account → Keys | §5 (row 10 → Config) | missing | Wiersz renderuje się z chevronem, ale nie ma `onClick` i nie istnieje ekran Keys — nsec nigdy nie jest pokazywany. FAQ `backup-keys` każe w niego stuknąć (jego `showMe` ratuje się podświetleniem całego ekranu) | `screens/SettingsScreen.tsx:68` | breaks-showme | M |
| dam-43 | Settings → Wallet & Payments / Appearance / Muted words & users / First aid | §5 (row 10 → Config) | dead | Cztery wiersze z chevronem, żaden nie ma `onClick` — każdy jest ślepą uliczką | `screens/SettingsScreen.tsx:70,74,77,82` | blocks-showme | M |
| dam-44 | Settings → toggles (Auto-translate, Left-handed, Developer mode) | §2 (left-handed → FAB), §5 | partial | NIE martwe: `Toggle` ma `onClick`, przełącznik realnie przeskakuje na zielone (`.damus-toggle.active`). Ale stan jest lokalny i nikt go nie czyta — w szczególności "Left-handed" wg §2 przenosi FAB do lewego dolnego rogu, a u nas nie robi nic (działający na oko przełącznik bez efektu myli bardziej niż martwy) | `screens/SettingsScreen.tsx:13-15,18-20,75,76,81` · `damus.theme.css:251,260,270` | breaks-showme | S |
| dam-45 | Compose → pole tekstowe noty | §9 | unanchored | Działa i jest wierne, ale kotwicę ma tylko przycisk Post — nie ma czego podświetlić przy "gdzie piszę treść" | `screens/ComposeScreen.tsx:67` | blocks-showme | S |
| dam-46 | Bottom nav → 4 zakładki | §2 | unanchored | Brak `data-tour`; FAQ celuje w `.damus-tab[aria-label="…"]` (działa, ale wisi na klasie Tailwind + aria) | `components/TabBar.tsx:33-38` | none | S |
| dam-47 | Home → awatar w lewym górnym rogu | §4 | unanchored | Brak `data-tour`; FAQ `side-menu` krok 1 celuje w `[aria-label="Open menu"]` | `screens/HomeScreen.tsx:35` | none | S |
| dam-48 | Universe → pole Search | §6 | unanchored | Brak `data-tour`; FAQ `search` krok 2 celuje w `.damus-search` | `screens/SearchScreen.tsx:39` | none | S |
| dam-49 | Relays → segmented control | §8 | unanchored | Brak `data-tour`; FAQ `manage-relays` krok 3 celuje w `.damus-segment` | `screens/RelaysScreen.tsx:81` | none | S |
| dam-50 | Home → note → pojedyncze akcje (reply/repost/shaka/zap) | §3 | unanchored | Kotwica jest tylko na całym rzędzie (`damus-interactions`); FAQ celuje w `.damus-action.is-*` | `components/NoteCard.tsx:119,122,125,128` | none | S |
| dam-51 | Bottom nav — 4 zakładki + osobny FAB (bez środkowej zakładki compose) | §2 | ok | Kolejność Home/DMs/Search/Notifications, FAB gradientowy poza paskiem, kropka na dzwonku obecna (jej stan → dam-59) | `components/TabBar.tsx:16-21,25` | none | — |
| dam-52 | Home → note → rząd akcji: kolejność i kolory | §3 | ok | reply→repost→shaka→zap→share; aktywne: purple / green / gradient-like / bitcoin; licznik ukryty przy 0 | `components/NoteCard.tsx:118-133` · `damus.theme.css:179-183` | none | — |
| dam-53 | Home → awatar otwiera side menu (nie profil) | §4 | ok | `onOpenDrawer`, zgodnie z §4 | `screens/HomeScreen.tsx:35` | none | — |
| dam-54 | Relays → status pill + letter-avatar relaya | §8 | ok | Online/Connecting/Error z hexami §8 + fallback pierwszej litery hosta (CSP-safe) | `screens/RelaysScreen.tsx:41,44,54` · `damus.theme.css:243-245` | none | — |
| dam-55 | Relays → pigułka segmentowa na DOLE ekranu | §8 | ok | Własny pill, nie natywny Picker, przyklejony do dołu | `screens/RelaysScreen.tsx:64-68` | none | — |
| dam-56 | Compose → CTA "Post" | §9 | ok | Gradient PinkGradient dopiero gdy jest treść, wcześniej wyszarzony i `disabled` | `screens/ComposeScreen.tsx:28-35` | none | — |
| dam-57 | Welcome (SetupView) | §11 | ok | Logo z fioletowym cieniem, tytuł w DamusLogoGradient, podtytuł, dwa CTA, linia EULA (sam link → dam-02) | `screens/LoginScreen.tsx:18-55` | none | — |
| dam-58 | Universe → wyniki wyszukiwania (wiersze profili + Cancel) | §6 | ok | Cancel pojawia się tylko przy niepustym polu; wiersz profilu = awatar + nazwa (tap → profil) + pigułka Follow po prawej | `screens/SearchScreen.tsx:41,66-85` | none | — |
| dam-59 | Bottom nav → kropka unread na dzwonku | §2 | partial | `notificationDot` ma domyślne `true` i nikt nigdy nie podaje propa — kropka świeci zawsze, także po wejściu w Notifications. §2: nakładana **gdy nieprzeczytane**. FAQ `notifications` krok 1 mówi "a small purple dot appears… when you have unread notifications" — pokaże się, ale nigdy nie zgaśnie | `components/TabBar.tsx:10,15,40-42` · `DamusSimulator.tsx:189` | none | S |

## Anchors — `data-tour` obecne w symulatorze

| Selector | Plik:linia | Powierzchnia |
|---|---|---|
| `damus-login` | `screens/LoginScreen.tsx:18` | Root ekranu powitalnego (SetupView) |
| `damus-auth-actions` | `screens/LoginScreen.tsx:45` | Pasek CTA landingu (Create Account / Sign In / linia EULA). **Zastąpił dawną kotwicę `damus-post` na „Let's go"** — duplikat nazwy CTA komposera usunięto (komentarz `screens/LoginScreen.tsx:60-65`) |
| `damus-home` | `screens/HomeScreen.tsx:31` | Root feedu Home |
| `damus-note` | `components/NoteCard.tsx:64` | Cała karta noty — **powtarza się na każdej karcie** |
| `damus-dms` | `screens/DMScreen.tsx:24` | Root listy DM |
| `damus-search` | `screens/SearchScreen.tsx:27` | Root Universe |
| `damus-notifications` | `screens/NotificationsScreen.tsx:28` | Root Notifications |
| `damus-menu` | `screens/SideMenu.tsx:38` | Panel drawera |
| `damus-npub` | `screens/SideMenu.tsx:51` | Pigułka npub w drawerze (martwa — dam-13) |
| `damus-menu-profile` … `-wallet` `-purple` `-muted` `-relays` `-bookmarks` `-merch` `-settings` `-logout` | `screens/SideMenu.tsx:62` (template literal) | 9 wierszy drawera; brak `-labs` i `-live`, bo wierszy nie ma (dam-09) |
| `damus-relays` | `screens/RelaysScreen.tsx:22` | Root ekranu Relays |
| `damus-add-relay-button` | `screens/RelaysScreen.tsx:40` | Relays → „Add relay" (FAQ `relay-feed` krok 1) |
| `damus-add-relay` | `components/AddRelaySheet.tsx:27` | Root arkusza Add relay — **nie celuj w niego**, jest wielkości ekranu i overlay go nie podświetli |
| `damus-add-relay-field` | `components/AddRelaySheet.tsx:52` | Pole adresu w arkuszu (FAQ `relay-feed` krok 2) |
| `damus-search-filter` | `screens/SearchScreen.tsx:44` | Universe → lejek (FAQ `relay-feed` krok 4) |
| `damus-universe-feed` | `screens/SearchScreen.tsx:91` | Universe → sekcja "All recent notes" (globalny feed po filtrze) |
| `damus-relay-filter` | `components/RelayFilterSheet.tsx:24` | Root arkusza filtra — jak wyżej, **nie celuj** |
| `damus-relay-toggle` | `components/RelayFilterSheet.tsx:66` (bramka `i === 0`) | Pierwszy wiersz z togglem (FAQ `relay-feed` krok 4) |
| `damus-settings` | `screens/SettingsScreen.tsx:55` | Root ekranu Settings |
| `damus-settings-account` | `screens/SettingsScreen.tsx:71` (prop `tour` → `:25`) | Settings → grupa „Account" |
| `damus-settings-keys` | `screens/SettingsScreen.tsx:72` (prop `tour` → `:47`) | Settings → wiersz „Keys" (sam wiersz nadal martwy — dam-42) |
| `damus-profile` | `screens/ProfileScreen.tsx:30` | Root ekranu profilu |
| `damus-profile-identity` | `screens/ProfileScreen.tsx:69` | Blok tożsamości na profilu (nazwa + pigułka npub) |
| `damus-follow` | `screens/ProfileScreen.tsx:58` | **Tylko** gałąź cudzego profilu = pigułka Follow. Gałąź własna (przycisk Edit, `:53`) kotwicy już NIE ma — zdjęta 2026-08-08, patrz dam-39 i komentarz `:50-52` |
| `damus-compose` | `components/TabBar.tsx:25` | FAB compose |
| `damus-post` | `screens/ComposeScreen.tsx:31` | CTA "Post" w komposerze |
| `damus-interactions` | `components/NoteCard.tsx:121` | Rząd akcji noty — **powtarza się na każdej karcie**, spotlight łapie pierwszą |

**28 różnych wartości `data-tour`** (17 literałów + rodzina `damus-menu-*` ×9 + 2 z propów `Group`/`Row`
w Settings) z 21 miejsc w kodzie — metodologia liczenia w [`../GAPS.md`](../GAPS.md).
Poza nimi FAQ opiera się na selektorach nie-`data-tour`:
`.damus-action.is-reply|is-repost|is-like|is-zap`, `.damus-tab[aria-label="dms|search|notifications"]`,
`.damus-search`, `.damus-segment`, `[aria-label="Open menu"]` (dam-46…dam-50).

## Reachability — komendy toura

**Union:** `type: 'login' | 'logout' | 'navigate' | 'compose' | 'post' | 'viewProfile' | 'viewUser' | 'back'`
(`DamusSimulator.tsx:28`), payload tylko dla `navigate`:
`'home' | 'profile' | 'settings' | 'relays' | 'dms' | 'search' | 'notifications' | 'drawer'`
(`DamusSimulator.tsx:22-25`; `switch` komend `:97-140`, gałęzie `navigate` `:109-116`). Kroki głównego toura
mapuje **tablica `stepCommands`** (nie `switch`) w `DamusSimulatorWithTour.tsx:101-123`; kroki FAQ niosą
własne komendy, dispatchowane w gałęzi `isFaqStepId` (`:92-98`). Kolejka obsługuje pewnie **2 komendy na
krok** (`queueCommands` + handoff `:43-71`, kontrakt w `src/data/faq/types.ts:19-25`).

| Powierzchnia | Osiągalna komendą? | Czym |
|---|---|---|
| Welcome / SetupView | tak | `logout` (albo stan startowy) |
| Create Account (widok klucza) | **nie** | lokalny `view` w `LoginScreen.tsx:12` — tylko realny klik |
| Home feed | tak | `login` + `navigate:'home'` |
| Home → Notes & Replies | **nie** | lokalny `tab` (`HomeScreen.tsx:22`) |
| DM list | tak | `login` + `navigate:'dms'` |
| DM conversation | **nie** | nie istnieje (dam-37) |
| Universe / Search | tak | `login` + `navigate:'search'` |
| Universe → stan wpisanego zapytania (pigułki) | **nie** | lokalne `q` (`SearchScreen.tsx:18`) |
| Notifications | tak | `login` + `navigate:'notifications'` |
| Notifications → Zaps / Mentions | **nie** | lokalny `tab` (`NotificationsScreen.tsx:19`) |
| Side menu (drawer) | tak | `login` + `navigate:'drawer'` |
| Compose | tak | `login` + `compose` |
| Profil własny | tak | `login` + `viewProfile` (lub `navigate:'profile'`) |
| Profil innego użytkownika | tak | `login` + `viewUser` |
| Relays (My Relays) | tak | `login` + `navigate:'relays'` |
| Relays → Recommended | **nie** | lokalny `seg` (`RelaysScreen.tsx:18`) |
| Settings | tak | `login` + `navigate:'settings'` |
| Thread | **nie** | tylko `openThread` z kliknięcia noty (dam-34) |
| Bookmarks | **nie** | brak payloadu `'bookmarks'` w `navigate` — tylko realny klik wiersza drawera (dam-35) |
| Toast "Not in this demo" | **nie** | efekt uboczny kliknięcia Wallet/Purple/Muted/Merch |

## Poza zakresem / do recon

Screen-mapa Damusa ma 11 sekcji i **nie pokrywa** poniższych powierzchni — nie da się orzec luki,
choć symulator coś tam renderuje (layout wzięty z nagrania przy rebuildzie 2026-07-14):

- **Profile screen** — banner, awatar, licznik Following/Followers, pigułka npub, przycisk Edit, menu "…",
  picker Notes / Notes & Replies. (Martwe kontrolki na nim: dam-38…dam-41.)
- **Thread / EventDetail** — układ noty głównej, timestamp, lista odpowiedzi, dolny pasek reply.
- **DM conversation** — widok czatu NIP-04/NIP-17, pole pisania, tworzenie nowej rozmowy.
- **Bookmarks** — ekran oraz **sposób dodania noty do zakładek** (w realnym Damusie z menu "…" noty; u nas
  zakładek nie da się dodać w ogóle, a ekran ma preseedowane notatki).
- **Settings / Config** — §5 mówi tylko, że wiersz 10 celuje w `Config`. Cała siatka grup i wierszy w
  `SettingsScreen.tsx` jest nasza (lokalizację wiersza "Keys" FAQ wziął z nagrania). Recon `ConfigView`
  dałby podstawę do dam-42/43/44.
- **Ekrany docelowe drawera:** Wallet, DamusPurpleView, Labs, LiveEvents, MuteList — §5 nazywa cele,
  nie opisuje zawartości.
- **Sheety nazwane, ale nie opisane:** `AddRelayView`, QR sheet, user-status sheet,
  NotificationSettings.
- **Opisane 2026-08-17** (recon `v1.17`, screen-map §6a): `.filter` sheet w Universe
  (`RelayFilterView` + `RelayToggle`) i `RelayDetailView`. Dwa ustalenia zmieniają ocenę
  istniejących wierszy: **dam-19 jest tym, czego ludzie szukają pod „przeglądaniem feedu
  relaya"** — nie ma ekranu per-relay, zawęża się BIEŻĄCY feed togglami — a **dam-30
  (RelayDetail) prowadzi do ekranu bez feedu** (metadane NIP-11, Connect/Disconnect), więc
  jego zamknięcie nie da tej ścieżki. Toggle jest ODWROTNY do nazwy: ON = relay widoczny,
  OFF = odfiltrowany. Warunek wstępny: relay musi być na liście, czyli ścieżka zaczyna się
  od dam-29 (`Add relay`), nie od lejka.
- **Zap flow** — §3 opisuje tylko przycisk. Co robi tap (domyślny zap z portfela) vs long-press (wybór
  kwoty / ZapView) nie jest odtworzone: u nas tap tylko inkrementuje licznik. Bez reconu `ZapView`
  nie da się orzec, czy to luka, czy uproszczenie zgodne z appką.
- **CreateAccount flow** — §11 nazywa tylko przycisk wejściowy.

**Świadoma wierność — NIE zgłaszać jako luki:** brak wiersza **Live** w drawerze (§5: warunkowy na
`settings.live`); wskaźnik relayów jako tekst **"7/13"** zamiast 4 słupków (§6/§7 [REC vs REPO]: nagranie
wygrywa); brak animacji wsuwania drawera (`SideMenu.tsx:17-18` — preview zamraża enter-animacje);
brak limitu znaków w komposerze (`ComposeScreen.tsx:16-17`); pusty timeline na cudzym profilu bez notatek
(`ProfileScreen.tsx:101`); cap ~25 notatek w feedzie.
