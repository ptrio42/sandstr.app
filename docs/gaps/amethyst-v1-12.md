# Amethyst — gap ledger

> **FROZEN 2026-08-13 — snapshot dla `amethyst-v1-12` (reproduces v1.12.6); nie edytować.**
> NIE wliczać do arytmetyki `docs/GAPS.md`. Żywy ledger: `docs/gaps/amethyst.md`.
> Ground truth archiwum: `docs/refs/amethyst-v1-12/screen-map.md`; sim: `src/simulators/amethyst-v1-12/`.

> Ground truth: `docs/refs/amethyst/screen-map.md` · Sim: `src/simulators/amethyst/`
> Audited: 2026-08-05 · Registry status: ready · Sim LOC: 2653 (TSX/TS, bez `amethyst.theme.css`)

## Rollup

| missing | dead | partial | unreachable | unanchored | ok |
|---|---|---|---|---|---|
| 9 | 26 | 7 | 2 | 1 | 12 |

**Top 3 do zrobienia:** ame-35 „Backup Keys" · ame-42 „Add a Relay" (dwa najczęstsze pytania FAQ, oba
martwe — dziś tylko wskazujemy lokalizację) · ame-57 profil autora z feedu.
*(Poprzednie top-3 — ame-01 mostek FAQ, ame-30 `openDrawer`, ame-43 payload sekcji — plus ame-56
i kotwice ame-25/ame-27 zamknięte 2026-08-06 przy wdrażaniu FAQ; wiersze niżej oznaczone.)*

## Gaps

| ID | Surface (ścieżka w UI) | § | Status | Gap | Evidence | FAQ impact | Effort |
|---|---|---|---|---|---|---|---|
| ame-01 | (cały klient) FAQ „Show me" → symulator | — | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: missing. **Nie ma mostka FAQ.** Wrapper nie renderuje `FaqMiniTourLauncher`, nie ma `faqCommandsRef`/`isFaqStepId`, a `handleStepChange(stepIndex)` ignoruje drugi argument (`step`) i mapuje komendy WYŁĄCZNIE po indeksie kroku głównego touru. Dopóki tego nie ma, **żaden** `showMe` nie zadziała, nawet dla zakotwiczonych powierzchni. Wzorzec do skopiowania: `src/simulators/damus/DamusSimulatorWithTour.tsx:22` (ref), `:73-77` (`handleFaqLaunch`), `:92-98` (gałąź `isFaqStepId`), `:147` (`<FaqMiniTourLauncher>`). Drugi warunek, niezależny od wrappera: host renderuje afordancje FAQ tylko gdy `getFaq('amethyst')` coś zwraca, a `src/data/faq/index.ts:4-6` mapuje dziś **wyłącznie** `damus` | `AmethystSimulatorWithTour.tsx:55,64-87` (brak launchera i mapy step-id→commands; `TourWrapper` podaje `(stepIndex, step)` — `src/components/tour/TourWrapper.tsx:24,97`) | blocks-showme | S |
| ame-02 | Login → pole klucza → ikona QR | §Login | dead | Fioletowy QR (leading icon) renderuje się jako `<button aria-label="Login with QR Code">` **bez `onClick`**; w realnej apce otwiera skaner QR | `screens/LoginScreen.tsx:113-119` | breaks-showme | S |
| ame-03 | Login / Sign Up → „Adjust **Tor Settings**" | §Login | dead | Screen-mapa mówi wprost „Cały wiersz jest klikalny"; u nas to zwykły `<p>` bez handlera i bez ekranu docelowego | `screens/LoginScreen.tsx:204-212` | breaks-showme | M |
| ame-04 | Login → „Sign Up" → ekran „Welcome Ostrich!" | §Login | unreachable | Ekran istnieje i działa, ale przełącza go tylko lokalny `mode` po kliknięciu użytkownika — w unii komend nie ma nic, co go zamontuje | `screens/LoginScreen.tsx:58,154`; unia: `AmethystSimulator.tsx:27` | blocks-showme | S |
| ame-05 | Home → app bar → selektor feedu „All Follows ⌄" | §Home app bar | partial | Otwiera **płaski popup 5 pozycji**, a realna apka otwiera **zgrupowany Dialog** (All Follows / Global / listy / #hashtagi / communities). Wybór jest czysto kosmetyczny — feed się nie zmienia (komentarz w kodzie to przyznaje). Dodatkowo **brak `data-tour`** | `components/FeedSelector.tsx:6,10,41` | breaks-showme | M |
| ame-06 | Home → app bar → licznik „16/16" + ikona grafu relayów | §Home app bar | unanchored | Wierne (screen-mapa nie dokumentuje tapnięcia, więc statyczność jest OK), ale to zwykły `<div>` bez `data-tour` → nie ma czego podświetlić w pytaniu „ile mam relayów?" | `components/AppTopBar.tsx:35-38` | blocks-showme | S |
| ame-07 | Home → sub-taby „New Threads / Conversations" | §Home sub-taby | partial | Klik przełącza podkreślenie, ale **treść jest identyczna** — lista `posts` jest inicjalizowana raz i renderowana bez filtra po `activeTab` | `screens/HomeScreen.tsx:21,121-149,195-218` | breaks-showme | M |
| ame-08 | Home → pasek „LIVE" na górze feedu | §Home treść / §Live activity | dead | `<button>` bez `onClick`; w realnej apce to wejście do widoku live-streamu | `screens/HomeScreen.tsx:180-194` | breaks-showme | S |
| ame-09 | Live activity (stream + czat) | §Live activity | missing | Widok „duży obszar mediów + bąbelki czatu + composer «reply here..»" nie istnieje w repo — bąbel LIVE nie ma dokąd prowadzić | absent (`src/simulators/amethyst/screens/` — brak pliku; grep „live" trafia tylko w `isLive`/`live-badge`) | blocks-showme | L |
| ame-10 | Home → nota → pill „Show More" przy uciętej treści | §Home treść | missing | Treść zawsze renderowana w całości, brak progu ucięcia i pilla | `components/MaterialCard.tsx:176-181` | blocks-showme | S |
| ame-11 | Home → nota → nagłówek boosta („⟲ boosted • 35m") | §Home treść | missing | Nagłówek karty ma tylko nazwę, NIP-05 i czas — nie ma wiersza informującego, że to boost | `components/MaterialCard.tsx:129-155` | blocks-showme | S |
| ame-12 | Home → nota → chipy relayów + chevron ⌄ pod avatarem | §Home treść | missing | Kolumna avatara zawiera wyłącznie avatar + pieczątkę NIP-05 | `components/MaterialCard.tsx:113-127` | blocks-showme | S |
| ame-13 | Home → nota → ⋮ (overflow noty) | §Home treść | dead | Przycisk bez `onClick`, a że nagłówek nie zatrzymuje propagacji (tylko rząd akcji ma `stopPropagation`, `:211`), tap **otwiera wątek** zamiast menu — gorzej niż no-op. *Uwaga:* §Home treść **nie wylicza** ⋮ na karcie noty — ⋮ w ground truth występuje tylko w top barze profilu (§Profile) i jako overflow sub-tabów Messages (§Messages), więc sama kontrolka jest naszym dodatkiem i wymaga reconu; błędne przekierowanie tapa jest faktem niezależnie | `components/MaterialCard.tsx:157-163` (rodzic `onClick={onOpenThread}` w `:110`) | breaks-showme | M |
| ame-14 | Home → nota → Like (long-press → paleta emoji) | §Home treść (footer) | partial | Tap przełącza serce poprawnie, ale „ten sam przycisk, long-press → emoji" nie istnieje — nie ma sposobu zareagować innym emoji | `components/MaterialCard.tsx:57-60,237-249` | blocks-showme | M |
| ame-15 | Home → FAB → Post → nowa nota w feedzie | §Compose | partial | `handleNewPost` tylko wyświetla toast; opublikowana nota **nigdy nie pojawia się w feedzie**. Setter `setPosts` istnieje, ale nie jest wołany nigdzie w repo, a `AmethystSimulator` nie przekazuje nowej noty do `HomeScreen` (brak propsa) | `AmethystSimulator.tsx:108-111`; `screens/HomeScreen.tsx:28` (lazy-init + nieużywany `setPosts`) | breaks-showme | S |
| ame-16 | Compose → dolny pasek narzędzi (wszystkie 12 ikon) | §Compose toolbar | dead | Każdy przycisk ma `aria-label`/`title` i animację tapa, ale **żaden nie ma `onClick`** — poll, zap-split, expiration, sensitive itd. są dekoracją | `screens/ComposeScreen.tsx:107-117` | breaks-showme | M |
| ame-17 | Compose → zestaw i kolejność narzędzi | §Compose toolbar | partial | 12 z 17 pozycji; brakuje **files, PoW, subject, secret-emoji, invoice**, a kolejność odbiega od źródła (real: gallery·files·camera·video·voice·**private**·**poll**·zap-split·zapraiser·PoW·subject·sensitive·expiration·schedule·geohash·secret-emoji·invoice) | `screens/ComposeScreen.tsx:20-33` | blocks-showme | S |
| ame-18 | Compose → avatar konta (tap = post anonimowy) | §Compose body | dead | Avatar + fioletowy badge to statyczny `<div>`; realny tap przełącza na anonim (ikona NoAccounts) | `screens/ComposeScreen.tsx:86-92` | breaks-showme | S |
| ame-19 | Compose → sekcje warunkowe inline (quote, notyfikowani userzy, subject, poll, content-warning, expiration, schedule, geohash, zap-split) | §Compose body | missing | Body to wyłącznie avatar + `<textarea>`; żadna sekcja nie ma reprezentacji | `screens/ComposeScreen.tsx:84-101` | blocks-showme | L |
| ame-20 | Nota → tap → Thread / note detail | §Domknięte z wideo (Thread) | unreachable | Ekran istnieje i jest wierny, ale montuje go **wyłącznie** tap w kartę — w unii komend nie ma nic dla wątku; dodatkowo brak `data-tour` w całym pliku | `screens/ThreadScreen.tsx:20-25`; unia: `AmethystSimulator.tsx:27`; setter tylko w `AmethystSimulator.tsx:217` | blocks-showme | S |
| ame-21 | Thread → „reply here.." → Post | §Domknięte z wideo (Thread) | dead | `onClick` robi tylko `setReply('')` — odpowiedź nie trafia na listę, nie ma toastu ani `registerAction` | `screens/ThreadScreen.tsx:48-56` | breaks-showme | S |
| ame-22 | Messages → wiersz rozmowy | §Messages | dead | Wiersz ma `cursor-pointer` i `whileTap`, ale **żadnego `onClick`** — i nie ma widoku czatu, który mógłby się otworzyć | `screens/MessagesScreen.tsx:107-115` | breaks-showme | M |
| ame-23 | Messages → ⋮ obok „Known / New Requests" | §Messages sub-taby | dead | `<button aria-label="More options">` bez handlera | `screens/MessagesScreen.tsx:81-83` | breaks-showme | S |
| ame-24 | Messages → FAB „+" (nowa wiadomość) | §Messages FAB | dead | `motion.button` bez `onClick` | `screens/MessagesScreen.tsx:94-102` | breaks-showme | S |
| ame-25 | Messages (Known / New Requests) | §Messages | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Ekran wierny i osiągalny (`navigate:'messages'`), taby realnie filtrują listę, ale **w pliku nie ma ani jednego `data-tour`** | `screens/MessagesScreen.tsx:61,68-84` | blocks-showme | S |
| ame-26 | Notifications → selektor okresu „Today ⌄" | §Notifications | dead | Przycisk z chevronem bez `onClick`; nie ma listy okresów | `screens/NotificationsScreen.tsx:30-33` | breaks-showme | S |
| ame-27 | Notifications (ekran + tygodniowy wykres + reakcje po typie) | §Notifications | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Najbardziej sygnaturowy ekran Amethysta, osiągalny (`navigate:'notifications'`) i wierny, ale **brak `data-tour`** na ekranie, na wykresie i na rzędach reakcji | `screens/NotificationsScreen.tsx:24,43-45,48-52` | blocks-showme | S |
| ame-28 | Bottom nav → Discover (globus) | §Bottom nav | missing | Zakładka montuje uczciwy placeholder „coming soon" — brak jakiejkolwiek treści Discover. Screen-mapa też nie opisuje tego ekranu → najpierw recon | `screens/SearchScreen.tsx:22-32` | blocks-answer | L |
| ame-29 | Bottom nav → Shorts (reels) | §Bottom nav | missing | Jak wyżej: placeholder „coming soon", brak pionowego feedu wideo; screen-mapa nie opisuje ekranu → recon | `screens/VideoScreen.tsx:23-35` | blocks-answer | L |
| ame-30 | Home → app bar → avatar → **account drawer** | §Account drawer | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. Drawer jest wierny (banner, status, „2374 Following · -- Followers", 11 pozycji menu), ale `setIsDrawerOpen(true)` woła **wyłącznie** `onOpenDrawer` z app-bara — w `switch` komend nie ma nic, a `navigate` przyjmuje tylko id zakładek (payload `'drawer'` zostałby po cichu zignorowany). Do tego **brak `data-tour`** na szufladzie i na jej wierszach → **cała gałąź konto/relaye/klucze jest poza zasięgiem FAQ** | unia: `AmethystSimulator.tsx:27,159-165`; settery: `AmethystSimulator.tsx:216,222,224,226,228`; `components/Drawer.tsx:48` | blocks-showme | S |
| ame-31 | Drawer → My Lists | §Account drawer | dead | `action: 'close'` — wiersz tylko zamyka szufladę, ekranu nie ma | `components/Drawer.tsx:22,35-39` | breaks-showme | M |
| ame-32 | Drawer → Drafts | §Account drawer | dead | `action: 'close'` — jw. | `components/Drawer.tsx:24` | breaks-showme | M |
| ame-33 | Drawer → Media Servers | §Account drawer | dead | `action: 'close'` — jw. | `components/Drawer.tsx:26` | breaks-showme | M |
| ame-34 | Drawer → Privacy Options | §Account drawer | dead | `action: 'close'` — jw. | `components/Drawer.tsx:28` | breaks-showme | M |
| ame-35 | Drawer → **Backup Keys** | §Account drawer | dead | `action: 'close'` — jw. To najczęstsze pytanie FAQ w całym produkcie („gdzie jest mój nsec / jak zrobić backup") i dziś kończy się kliknięciem w pustkę | `components/Drawer.tsx:29` | breaks-showme | M |
| ame-36 | Drawer → User Preferences | §Account drawer | dead | `action: 'close'` — jw. (osobne od „App Preferences", które działa) | `components/Drawer.tsx:31` | breaks-showme | M |
| ame-37 | Drawer → Bookmarks | §Account drawer | missing | Listy zakładek nie ma nigdzie; wiersz przekierowuje na **Profile**, a profil nie ma nawet taba Bookmarks → użytkownik ląduje na cudzych notatkach bez komunikatu | `AmethystSimulator.tsx:98-100`; `components/Drawer.tsx:23`; taby profilu `screens/ProfileScreen.tsx:136` | breaks-showme | M |
| ame-38 | Drawer → „Update your status" (+ kosz) | §Account drawer | dead | Pole statusu i ikona kosza to statyczny `<div>`/`<svg>` — nic nie edytuje i nic nie kasuje | `components/Drawer.tsx:56-60` | breaks-showme | S |
| ame-39 | Drawer → App Preferences → **każdy z 10 wierszy** (Language, Theme, Image Preview, Video Playback, URL Preview, Profile Picture, Immersive Scrolling, UI Mode, Profile Gallery Style, Push Notification) | §Settings suite | dead | Wiersze renderują wartość + chevron, ale `<button>` nie ma `onClick` — realna apka otwiera dialog wyboru. Boli szczególnie „Theme" (klasyczne „jak włączyć jasny motyw?") | `screens/SettingsScreen.tsx:41-66` | breaks-showme | M |
| ame-40 | Drawer → Security Filters → „Show sensitive content: Warn" | §Settings suite | dead | Wyrenderowane jako `<span>` wyglądający jak kontrolka; dwa toggle'e nad nim działają, ten nie ma handlera | `screens/SettingsScreen.tsx:104-106` | breaks-showme | S |
| ame-41 | Drawer → Security Filters → Blocked Users → „Unblock" | §Settings suite | dead | Przycisk bez `onClick`; wiersz zostaje na liście | `screens/SettingsScreen.tsx:125` | breaks-showme | S |
| ame-42 | Drawer → Relays → „**Add a Relay**" | §Settings suite (Relays) | dead | Przycisk bez `onClick` — nie ma pola adresu, nie da się dodać ani usunąć relaya (wiersze relayów też są statyczne) | `screens/SettingsScreen.tsx:196-200`, wiersze `:188-195` | breaks-showme | M |
| ame-43 | Drawer → Relays / Security Filters (sekcje Settings) | §Settings suite | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. `settingsSection` ustawia **tylko** szuflada; komenda `openSettings` nie przyjmuje payloadu, więc tour zawsze ląduje na „Application Preferences". Dodatkowo wszystkie trzy sekcje dzielą jedną kotwicę `amethyst-settings`, więc spotlight ich nie rozróżni | `AmethystSimulator.tsx:191-196` (bez payloadu), `:91,95,266` (wszystkie trzy settery sekcji, każdy wołany tylko z szuflady); kotwica `screens/SettingsScreen.tsx:24` | blocks-showme | S |
| ame-44 | Profile → rząd akcji → **Zap (wallet)** | §Profile | missing | Rząd ma Message / Edit / Follow / List — akcji zapa (drugiej w realnym rzędzie) nie ma wcale | `screens/ProfileScreen.tsx:76-91` | blocks-showme | S |
| ame-45 | Profile → rząd akcji → Message · Edit · Add to list | §Profile | dead | Wspólny `ActionIconButton` nie przyjmuje ani nie ustawia żadnego handlera — trzy przyciski, zero reakcji | `screens/ProfileScreen.tsx:77,78,90` + `:161-171` | breaks-showme | M |
| ame-46 | Profile → ⋮ w top barze | §Profile | dead | `<button aria-label="More">` bez `onClick`; realne menu profilu (report/mute/copy…) nie istnieje | `screens/ProfileScreen.tsx:60-62` | breaks-showme | M |
| ame-47 | Profile → npub → copy / QR | §Profile | dead | `Copy` i `QrCode` to gołe `<svg>` w `<div>`, nie przyciski — nic nie kopiuje i nie pokazuje kodu QR | `screens/ProfileScreen.tsx:100-104` | breaks-showme | S |
| ame-48 | Profile → blok tożsamości | §Profile | partial | Jest npub + NIP-05 + website + lightning + bio; **brak szarego `@username`, nprofile (+copy +QR), „Last seen", zaimków i tożsamości zewnętrznych (X/Telegram/Mastodon/GitHub)**. QR w symulatorze wisi przy npub, a w ground truth przy nprofile | `screens/ProfileScreen.tsx:94-131` | blocks-showme | M |
| ame-49 | Profile → zakładki | §Profile | partial | 4 taby (Notes/Replies/**Yours**/Gallery) zamiast realnych 12 (Notes·Replies·**Mutual**·Gallery·Apps·Follows·[Followers]·[Zaps]·Bookmarks·Followed Tags·Reports·Relays); „Yours" nie jest etykietą z realnej apki, a wszystko poza „Notes" to pusty stan. Konsekwencja: liczniki Follows/Followers/Relays (które w realnej apce siedzą w nagłówkach tych zakładek) nie mają gdzie się pojawić | `screens/ProfileScreen.tsx:36,136-154` | breaks-showme | M |
| ame-50 | Home → app bar → avatar (otwiera drawer, nie profil) | §Home app bar | ok | Wierne, klikalne, zakotwiczone `amethyst-profile-avatar`, osiągalne przez `navigate:'home'` (kotwica żyje też na Messages/Notifications/Discover/Shorts) | `components/AppTopBar.tsx:20-29` | none | — |
| ame-51 | Bottom nav (Home · Messages · Shorts · Discover · Notifications) | §Bottom nav | ok | 5 ikon bez etykiet, bez zakładki Profile i bez Search — zgodnie ze screenem; zakotwiczone `amethyst-nav`, a każdy item ma stabilny `aria-label` do selektorów pochodnych | `components/BottomNav.tsx:21-31` | none | — |
| ame-52 | Home → nota → rząd akcji Reply · Boost · Like · Zap · Stats | §Home treść (footer) | ok | Kolejność i semantyka zgodne ze screen-mapą, cztery pierwsze interaktywne (lokalny stan w karcie), piąty slot jest wskaźnikiem także w realnej apce; kotwica `amethyst-actions` + klasy `.action-btn-reply/-repost/-like/-zap` | `components/MaterialCard.tsx:211-273` | none | — |
| ame-53 | Home → FAB → Compose → Post | §Compose | ok | FAB zakotwiczony (`amethyst-fab`), composer pełnoekranowy z X + Post, gating przez treść (`canPost`), **bez fejkowego limitu 280 i bez kółka postępu**; Post zakotwiczony (`amethyst-post`), osiągalny komendą `compose` | `screens/ComposeScreen.tsx:38,58-81`; `components/FloatingActionButton.tsx:47` | none | — |
| ame-54 | Profile → Follow / Unfollow | §Profile | ok | Pill przełącza etykietę, raportuje akcję do touru, zakotwiczony `amethyst-follow`, osiągalny komendą `viewProfile` | `screens/ProfileScreen.tsx:79-89` | none | — |
| ame-55 | Login → pole klucza (maskowanie + oko) i przełączanie Login ↔ Sign Up | §Login | ok | Maskowanie, `Visibility/VisibilityOff`, cross-linki działają. `DEMO_KEY_PLACEHOLDER` + odrzucanie realnego nsec to **świadome odstępstwo** ze screen-mapy, nie luka — tak samo jak brak przycisku „Login with Amber" | `screens/LoginScreen.tsx:64-73,120-135,144-156` | none | — |
| ame-56 | (mechanika komend) Wyjście z Settings / powrót na feed po `openSettings` | §Settings suite | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. **Overlay Settings jest jednokierunkowy.** `isSettingsOpen` gasi tylko `onBack` klikany przez użytkownika; `navigate` czyści wyłącznie composer, a `back` = logout **nie resetuje** `isSettingsOpen` (po ponownym `login` Settings wracają na wierzch). Skutek dla FAQ: każdy krok po `openSettings` celuje w element, który wciąż jest w DOM, ale leży pod `absolute inset-0 z-[55]` — spotlight podświetla niewidoczny obszar. To samo dotyczy `threadPost` (nic go nie zeruje), dziś nieaktywne bo wątek jest nieosiągalny komendą (ame-20) | `AmethystSimulator.tsx:159-165` (`navigate` zamyka tylko composer), `:198-201` (`back` nie tyka `isSettingsOpen`), `:330-337` (overlay), jedyne wyzerowanie `:333` | breaks-showme | S |
| ame-57 | Home → nota → avatar / nazwa autora → profil autora | §Home treść, §Profile | dead | Avatar ma `whileTap` (wygląda na klikalny), ale **nie ma `onClick`** — tap bąbelkuje do karty i otwiera **wątek**, nie profil. Dodatkowo `ProfileScreen` nie przyjmuje pubkeya: renderuje zaszyty obiekt „sandy", więc nawet po dodaniu handlera każdy autor prowadziłby do tego samego profilu. Efekt: „jak zobaczyć czyjś profil?" nie ma w symulatorze żadnej ścieżki (drawer → Profile daje tylko własny) | `components/MaterialCard.tsx:114-127` (rodzic `onClick={onOpenThread}` w `:110`); `screens/ProfileScreen.tsx:24-31,35` (brak propsa użytkownika) | breaks-showme | M |
| ame-58 | Drawer → Security Filters → zakładka Hidden Words | §Settings suite | ok | **Domknięte 2026-08-13.** Poprzednio: zakładka renderowała sam pusty stan bez żadnego pola, więc słowa nie dało się dodać. Odtworzone ze ŹRÓDŁA `HiddenWordsScreen.kt` @ v1.12.6 — nagranie nigdy nie weszło w tę zakładkę: pole „Hide new word or sentence" zadokowane u dołu, przycisk dodania przygaszony przy pustym polu, wiersze pogrubione i wyśrodkowane z dzielnikami, pusty stan pełnym stringiem `security_hidden_words_empty`. Kotwica `amethyst-hidden-words`, komenda `openSettings` payload `security-hidden` | `screens/SettingsScreen.tsx` (SecurityView), `AmethystSimulator.tsx` | was-blocks-showme | M |

## Anchors — `data-tour` obecne w symulatorze

| Selector | Plik:linia | Powierzchnia |
|---|---|---|
| `[data-tour="amethyst-login"]` | `screens/LoginScreen.tsx:104` | Cały ekran logged-off — obejmuje **oba** tryby (Login i Sign Up), więc nie rozróżnia ich |
| `[data-tour="amethyst-login-key"]` | `screens/LoginScreen.tsx:115` | Pole „nsec / npub" na ekranie logowania |
| `[data-tour="amethyst-feed"]` | `screens/HomeScreen.tsx:117` | Cały Home (app bar + sub-taby + feed) — kontener, nie sam feed |
| `[data-tour="amethyst-profile-avatar"]` | `components/AppTopBar.tsx:25` | Avatar w app barze = otwieracz szuflady; obecny na Home/Messages/Notifications/Discover/Shorts |
| `[data-tour="amethyst-nav"]` | `components/BottomNav.tsx:31` | Dolny pasek nawigacji (całość; itemy tylko przez `aria-label`) |
| `[data-tour="amethyst-fab"]` | `components/FloatingActionButton.tsx:47` | FAB compose (montowany tylko na Home i tylko gdy composer zamknięty) |
| `[data-tour="amethyst-actions"]` | `components/MaterialCard.tsx:211` | Rząd akcji noty — **każdej** karty (feed, wątek, profil), więc selektor łapie wiele instancji |
| `[data-tour="amethyst-post"]` | `screens/ComposeScreen.tsx:72` | Przycisk „Post" w composerze |
| `[data-tour="amethyst-profile"]` | `screens/ProfileScreen.tsx:52` | Ekran profilu (kontener) |
| `[data-tour="amethyst-follow"]` | `screens/ProfileScreen.tsx:85` | Pill Follow/Unfollow |
| `[data-tour="amethyst-settings"]` | `screens/SettingsScreen.tsx:24` | Overlay Settings — **wspólny dla wszystkich trzech sekcji** (preferences/security/relays) |
| `[data-tour="amethyst-relays-outbox"]` | `screens/SettingsScreen.tsx:175` (prop `tour` → `:188`) | Settings → Relays → grupa „Public Outbox/Home Relays". Bliźniacza sekcja Inbox (`:177`) propa nie dostaje, więc kotwicy nie ma |
| `[data-tour="amethyst-drawer"]` | `components/Drawer.tsx:48` | Account drawer — cały panel *(dodane 2026-08-06)* |
| `[data-tour="amethyst-drawer-<slug>"]` | `components/Drawer.tsx:78` (szablon) | Rodzina: każdy z 11 wierszy menu szuflady (`MENU` `:20-31`), slug z labela (`…-relays`, `…-backup-keys`, `…-media-servers`, …) *(dodane 2026-08-06)* |
| `[data-tour="amethyst-messages"]` | `screens/MessagesScreen.tsx:61` | Ekran Messages *(dodane 2026-08-06, zamyka ame-25)* |
| `[data-tour="amethyst-notifications"]` | `screens/NotificationsScreen.tsx:24` | Ekran Notifications *(dodane 2026-08-06, zamyka ame-27)* |

**Razem: 26 różnych wartości `data-tour`** (14 literałów + rodzina `amethyst-drawer-*` ×11 +
`amethyst-relays-outbox` z propa) z 16 miejsc w kodzie — metodologia liczenia w [`../GAPS.md`](../GAPS.md).
Stabilne selektory pomocnicze bez `data-tour` (można ich używać w `showMe`, nie trzeba dokładać atrybutu): `.action-btn-reply` / `.action-btn-repost` / `.action-btn-like` / `.action-btn-zap` (`amethyst.theme.css:585-612`), `.md-bottom-nav-item` + `[aria-label="Messages"|"Notifications"|"Shorts"|"Discover"|"Home"]` (`components/BottomNav.tsx:36-37`), `.amethyst-simulator` (root).

**Bez kotwicy, a warte jej:** ThreadScreen (`screens/ThreadScreen.tsx:25`), selektor feedu (`components/FeedSelector.tsx:16`), sub-taby Home (`screens/HomeScreen.tsx:122`), licznik relayów (`components/AppTopBar.tsx:35`), wykres na Notifications (`screens/NotificationsScreen.tsx:44`), taby Messages (`screens/MessagesScreen.tsx:68`), pozostałe sekcje Settings. *(Drawer, jego wiersze oraz rooty Notifications i Messages kotwice już dostały 2026-08-06 — patrz tabela wyżej.)*

## Reachability — komendy toura

**Union:** `type: 'login' | 'navigate' | 'compose' | 'post' | 'viewProfile' | 'back' | 'openSettings' | 'openDrawer'`
(`AmethystSimulator.tsx`, obsługa w `switch`). *(Aktualizacja 2026-08-06:)* `openDrawer` otwiera szufladę,
`openSettings` przyjmuje payload sekcji (`'preferences' | 'security' | 'relays'`), a `navigate`/`viewProfile`/
`compose` zamykają settings/szufladę/wątek (higiena ame-56).
Payloady `navigate`: `payload: TabId` = `'home' | 'search' | 'video' | 'notifications' | 'messages' | 'profile'`;
`back` to w istocie **logout** (czyści `isAuthenticated`).
Limit kolejki: pewnie przechodzą **max 2 komendy na krok** (`AmethystSimulatorWithTour.tsx:31-53` — ta sama kolejka co w Damusie), więc każda ścieżka „login + X" jest OK, a „login + X + Y" już nie.

| Powierzchnia | Osiągalna komendą? | Czym |
|---|---|---|
| Login (logged-off) | tak | `back` |
| Sign Up („Welcome Ostrich!") | **nie** | tylko klik w „Sign Up" (lokalny `mode`) — ame-04 |
| Home / feed | tak | `login` + `navigate:'home'` |
| Home → sub-tab „Conversations" | **nie** | lokalny `useState` w `HomeScreen` |
| Home → rozwinięty selektor feedu | **nie** | lokalny `useState` w `FeedSelector` |
| Messages (Known) | tak | `login` + `navigate:'messages'` |
| Messages → New Requests | **nie** | lokalny `useState` w `MessagesScreen` |
| Shorts (placeholder) | tak | `login` + `navigate:'video'` |
| Discover (placeholder) | tak | `login` + `navigate:'search'` |
| Notifications | tak | `login` + `navigate:'notifications'` |
| Profile | tak | `login` + `viewProfile` (albo `navigate:'profile'`) |
| Profile → taby Replies/Yours/Gallery | **nie** | lokalny `useState` |
| Compose (pełny ekran) | tak | `login` + `compose` |
| Compose → wysłanie posta | tak | `post` (sam otwiera composer i po 500 ms „publikuje") |
| Thread / note detail | **nie** | tylko tap w kartę — ame-20 |
| **Account drawer** | tak *(2026-08-06)* | `login` + `openDrawer` |
| Settings → Application Preferences | tak | `login` + `openSettings` (domyślna sekcja) |
| Settings → Relays | tak *(2026-08-06)* | `login` + `openSettings` payload `'relays'` |
| Settings → Security Filters | tak *(2026-08-06)* | `login` + `openSettings` payload `'security'` |
| Powrót z Settings na feed (zamknięcie overlaya) | tak *(2026-08-06)* | każdy `navigate:<tab>` domyka settings/szufladę/wątek |
| Profil innego użytkownika (z feedu) | n/d | `ProfileScreen` ma zaszyty jeden profil, avatar w karcie bez handlera — ame-57 |
| Live activity (stream) | n/d | ekranu nie ma — ame-09 |

**Wniosek dla autora FAQ** *(zaktualizowany 2026-08-06)*: mostek FAQ działa (ame-01 ✅), szuflada i sekcje
Settings są osiągalne komendą (ame-30/ame-43 ✅), a nawigacja domyka overlaye (ame-56 ✅). Demonstrowalne:
logowanie, feed, rząd akcji, FAB → composer → Post, profil + follow, drawer + jego wiersze (jako wskazanie
lokalizacji — wiersze poza Profile/Relays/Security/App Preferences są nadal martwe, patrz ame-31…ame-38),
Messages, Notifications, Relays i Security Filters. `src/data/faq/amethyst.ts` ma 19 wpisów; martwe liście
(ame-35 Backup Keys, ame-42 Add a Relay) wciąż ograniczają mini-toury do wskazania lokalizacji.

## Poza zakresem / do recon

- **Discover i Shorts** — screen-mapa opisuje je wyłącznie jako ikony w dolnym pasku; nie ma ani jednego shota treści. Bez reconu nie da się nawet napisać uczciwej odpowiedzi tekstowej (stąd `blocks-answer` w ame-28/29). Screen-mapa sama zapowiada tu „kontekstowe sub-taby feedu (Global → Follow Packs / Reads / Feed Algorithms / Live Streams)".
- **Widok czatu DM** (po tapnięciu rozmowy w Messages) — screen-mapa opisuje tylko listę rozmów, więc luka w ame-22 dotyczy potwierdzonego martwego wiersza, a nie kształtu samego ekranu czatu.
- **Dialog zapa** (kwoty/„Send sats" po tapnięciu ⚡ na nocie) — screen-mapa Amethysta nie dokumentuje go; nasz zap toggluje +21 bez dialogu. Nie orzekam luki bez recon.
- **Pull-to-refresh** — nieopisany w screen-mapie, a implementacja (`screens/HomeScreen.tsx:58-91`) jest wyłącznie na zdarzeniach dotyku, więc myszą w przeglądarce nie zadziała; `handleRefresh` (`:93-97`) nie jest nigdzie wołane. Do rozstrzygnięcia razem z reconem gestów.
- **Kropka-badge na zakładce Notifications** jest zaszyta na stałe (`components/BottomNav.tsx:26`) i nie gaśnie po wejściu w powiadomienia; screen-mapa mówi tylko o istnieniu `NotificationDotIcon`, nie o cyklu życia.
- **Ekrany celowo nieodtworzone (fidelity, NIE luki):** brak „Login with Amber" (renderuje się tylko z zainstalowanym Amberem), brak `TermsGate` na Sign Up (nie ma go na screenie), placeholder klucza `DEMO_KEY_PLACEHOLDER` + odrzucanie realnego nsec (`shared/utils/keySafety.ts`), brak paska statystyk „followers/following" i daty dołączenia na profilu, brak rzędu chipów i stories-row na Home, opcjonalny trzeci sub-tab „Everything".
