# Nostur — gap ledger

> Ground truth: `docs/refs/nostur/screen-map.md` · Sim: `src/simulators/nostur/`
> Audited: 2026-08-05 · Registry status: ready · Sim LOC: 3502 (TSX/TS, bez `nostur.theme.css`)

## Rollup

| missing | dead | partial | unreachable | unanchored | ok |
|---|---|---|---|---|---|
| 1 | 33 | 8 | 6 | 3 | 12 |

**Top 3 do zrobienia:** nos-26 „Private key" · nos-32 „Add new relay…" · nos-46 (rozmowa DM) — trzy martwe liście,
przez które mini-toury kończą się na wskazaniu ekranu zamiast na kontrolce.
*(Poprzednie top-3 — nos-01 mostek FAQ, nos-38 payload sekcji Settings, plus nos-02 `logout`, nos-21 cudzy
profil i kotwica nos-25 — zamknięte 2026-08-06 przy wdrażaniu FAQ; wiersze niżej oznaczone.)*

Kontekst: **Nostur ma najlepsze pokrycie kotwicami w repo** (22 literalne `data-tour` + 2 rodziny
generowane = **34 selektory**), ale to pokrycie jest częściowo pozorne — dwie kotwice
(`nostur-relays`, `nostur-feeds`) są **sierotami**, bo żadna komenda nie montuje ekranu, na którym
siedzą (nos-38). Prawdziwy hamulec to nie brak kotwic, tylko **martwe kontrolki** (33 pozycje `dead`,
z czego 12 to same wiersze Settings) i **brak mostka FAQ** (nos-01).

## Gaps

| ID | Surface (ścieżka w UI) | § | Status | Gap | Evidence | FAQ impact | Effort |
|---|---|---|---|---|---|---|---|
| nos-01 | (cały klient) FAQ „Show me" → symulator | — | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: missing. **Nie ma mostka FAQ.** Wrapper nie importuje `FaqMiniTourLauncher`, nie ma `faqCommandsRef`/`isFaqStepId`, a `handleStepChange(stepIndex)` przyjmuje tylko indeks (bez drugiego argumentu `step`) i mapuje komendy WYŁĄCZNIE po indeksie kroku głównego touru. Dopóki tego nie ma, **żaden** `showMe` nie zadziała, nawet dla powierzchni zakotwiczonych i osiągalnych. Wzorzec do skopiowania: `src/simulators/damus/DamusSimulatorWithTour.tsx:9,22,72-97` (+ render launchera `:147`); dodatkowo brakuje `src/data/faq/nostur.ts` i wpisu w `src/data/faq/index.ts:5-7` | `NosturSimulatorWithTour.tsx:41-67` (brak launchera i mapy step-id→commands) | blocks-showme | S |
| nos-02 | Welcome („Create new account" / „Use existing account" / „Try guest account") | §18, §19 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. **Nie ma komendy `logout`.** Efekt komend zaczyna się od bezwarunkowego `setAuthenticated(true)`, więc po pierwszym poleceniu nie da się już wrócić na ekran logowania. Kotwica `nostur-create-account` żyje tylko na świeżym mountcie — dokładnie odwrotnie niż w Damusie, gdzie FAQ „jak się zalogować" odpala `{ type: 'logout' }` | `NosturSimulator.tsx:199-201`; unia: `types.ts:40-52` | blocks-showme | S |
| nos-03 | Welcome → „Use existing account" → pole klucza + „Add" | §18 | unreachable | Ekran istnieje i jest wierny (`keySafety.ts` odrzuca prawdziwy nsec), ale montuje go wyłącznie lokalne `setStep('existing')` po kliknięciu użytkownika; brak komendy i brak `data-tour` na tym kroku | `screens/WelcomeScreen.tsx:26,30-92` (kotwica tylko na `:108`) | blocks-showme | S |
| nos-04 | Welcome → „Terms and Conditions" | §19 | dead | Podkreślony `<p>`, nie link ani przycisk — wygląda jak odnośnik i nic nie robi | `screens/WelcomeScreen.tsx:132` | none | S |
| nos-05 | Home → górny pasek → znak Nostura (tap = przewiń feed na górę) | §5 | dead | `NosturMark` renderuje gołe `<svg>` w `<div className="flex flex-1 justify-center">` — brak `<button>` i handlera. Screen-mapa mówi wprost: slot `.principal`, „tap → scroll feed to top" | `screens/FeedScreen.tsx:62-64`; `components/NosturMark.tsx:15-42` | breaks-showme | S |
| nos-06 | Home → górny pasek → ⚙︎ → arkusz „Following Feed settings" | §18 | unreachable | Arkusz istnieje, oba switche (Show replies / Remember feed) działają, ale montuje go tylko lokalny `feedSettings` — żadna komenda go nie otwiera. Dodatkowo ani ⚙︎, ani arkusz nie mają `data-tour` | `NosturSimulator.tsx:81,348,449-480`; ⚙︎ `screens/FeedScreen.tsx:74-81` | blocks-showme | S |
| nos-07 | Home → post → media w Low Data Mode → „Load anyway" | §7.5 | dead | `<button type="button">` **bez `onClick`** — w realnej apce dociąga zablokowany obrazek. Bolesne, bo to jedna z dwóch sygnatur Low Data Mode i tour ją wprost obiecuje | `components/PostCard.tsx:166-168`; tekst touru `src/data/tours/nostur-tour.ts` (krok „The turtle") | breaks-showme | S |
| nos-08 | Home → post → ••• (menu kontekstowe posta) | §7.2 | dead | `MoreHorizontal` to gołe `<svg>` w akcentowym kolorze, nie przycisk; menu posta nie istnieje | `components/PostCard.tsx:114` | breaks-showme | M |
| nos-09 | Home → post → repost → arkusz repost / quote | §18 | partial | Tap od razu przełącza licznik i barwi ikonę na zielono; nagranie pokazuje **arkusz z wyborem repost vs quote** (§18 „repost/quote sheet"). Nie da się zacytować posta | `NosturSimulator.tsx:113`; `components/ActionBar.tsx:71-81` | breaks-showme | M |
| nos-10 | Home → post → ♥ → własne emoji reakcji | §7 (tabela, wiersz 3), §17.4 | partial | Serce przełącza się poprawnie na czerwone, ale „custom emoji **zastępuje** glif serca" nie istnieje — nie ma sposobu zareagować czymkolwiek innym niż sercem (patrz też nos-30). `partial`, nie `missing`, bo screen-mapa **nie mówi, skąd wywołuje się picker** — wiemy tylko, że wynik podmienia glif; sam przycisk reakcji jest wierny (nos-55) | `components/ActionBar.tsx:83-93`; `NosturSimulator.tsx:112` | blocks-showme | M |
| nos-11 | Home → post → zakładka (long-press → wybór koloru) | §1 (hardcoded literals) | missing | Bookmark tylko przełącza pomarańcz; long-press z paletą brown/red/blue/purple/green/orange nie istnieje w żadnej formie | `components/ActionBar.tsx:113-122` | blocks-showme | M |
| nos-12 | Home → Discover → karta follow-packa → „Show preview" | §15 (Discover tab) | dead | Chip to `<span>` bez handlera, a cała karta nie ma `onClick` — nie da się podejrzeć ani otworzyć listy | `screens/FeedScreen.tsx:126-139` (chip `:133-138`) | breaks-showme | M |
| nos-13 | Home → Discover (lista follow-packów) | §15 (Discover tab) | unanchored | Wierna i osiągalna (`openFeed: 'Discover'`), ale sama lista nie ma `data-tour` — jedyna kotwica w okolicy to rząd tabów. Pytanie „gdzie znajdę ludzi do obserwowania?" nie ma czego podświetlić | `screens/FeedScreen.tsx:122-165` | blocks-showme | S |
| nos-14 | Bookmarks (zakładka) → FAB „New post"; profil otwarty spoza Home | §4 | partial | §4 mówi „Present on Home/**Bookmarks**/Profile", u nas `showFab = tab === 'home' && (!top \|\| top.kind === 'profile')` — więc FAB znika nie tylko na Bookmarks, ale i na profilu wypchniętym z Search/Notifications/Messages. *Arguable:* komentarz w kodzie twierdzi, że klatki pokazują coś innego niż §4 — do rozstrzygnięcia przy kolejnym passie z nagraniem | `NosturSimulator.tsx:369-372` | none | S |
| nos-15 | Post detail → odpowiedzi pod postem | §8, §19 | partial | Odpowiedzi to deterministyczne zastępniki z tej samej roty (świadomy delta z §19), ale dodatkowo **nie dostają `onOpen`** — tap w treść odpowiedzi nic nie robi, choć w realnej apce otwiera ten post | `screens/ThreadScreen.tsx:50-52,54-74` (brak `onOpen` w `card()`); `components/PostCard.tsx:128-134` | breaks-showme | M |
| nos-16 | Profil (własny) → „Edit profile" | §9 | dead | Pigułka to `<span>` w slocie `trailing` — bez handlera i bez ekranu edycji | `screens/ProfileScreen.tsx:73-78` | breaks-showme | M |
| nos-17 | Profil (cudzy) → ••• | §9 | dead | Gołe `<svg>` zamiast przycisku; menu profilu nie istnieje | `screens/ProfileScreen.tsx:80` | breaks-showme | M |
| nos-18 | Profil → dzwonek (notify-on-post) | §9 | dead | `Bell` to statyczna ikona nad banerem — realna apka włącza powiadomienia o nowych postach | `screens/ProfileScreen.tsx:93` | breaks-showme | S |
| nos-19 | Profil → npub → ikona kopiowania | §9 | dead | `Copy` to `<svg>` w `<p>`, nie przycisk; realny `CopyableTextView` kopiuje do schowka | `screens/ProfileScreen.tsx:100-103` | breaks-showme | S |
| nos-20 | Profil → zakładki Replies / Media / Reactions / Zaps | §9, §19 | partial | Sześć tabów jest i przełączają podkreślenie, ale tylko **Relays** ma własną treść — pozostałe pięć renderuje ten sam zestaw notatek (świadomy delta z §19). Rząd tabów nie ma też `data-tour` | `screens/ProfileScreen.tsx:58-59,129-133,137-150` | breaks-showme | M |
| nos-21 | Profil cudzej osoby (Follow pill, „Followed by N others you follow") | §9 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. `viewProfile` nie przyjmuje payloadu i zawsze montuje `DEMO_USER`, czyli `isSelf === true` → pigułki Follow i wiersza „Followed by…" **nie da się zamontować komendą**; jedyna droga to tap w autora | `NosturSimulator.tsx:222-226,300`; unia: `types.ts:40-52` | blocks-showme | S |
| nos-22 | Follow / Unfollow (inline w feedzie oraz pigułka na profilu) | §7.2, §9 | unanchored | Obie kontrolki działają i są wierne (pigułka monochromatyczna, nie akcentowa), ale **żadna nie ma `data-tour`** — najbardziej oczywiste pytanie FAQ („jak kogoś obserwować?") nie ma czego podświetlić. Selektory zastępcze: `.nostur-followbtn` i przycisk w `FollowLink` (bez klasy własnej) | `components/Chrome.tsx:206-223` (pill), `:226-237` (inline link) | blocks-showme | S |
| nos-23 | Side menu → przełącznik kont (avatar + `ellipsis.circle` → arkusz kont) | §15 | dead | `Avatar` i `MoreHorizontal` w prawym dolnym rogu banera są statyczne; arkusz kont nie istnieje | `components/Sidebar.tsx:58-64` | breaks-showme | M |
| nos-24 | Side menu → npub → ikona kopiowania | §15 | dead | Jak na profilu: `<svg>` bez handlera | `components/Sidebar.tsx:69-72` | breaks-showme | S |
| nos-25 | Side menu → „Log out" | §15 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Wiersz działa (wraca na Welcome), ale jako jedyny w szufladzie **nie ma `data-tour`** — pętla `ROWS` kotwiczy 7 destynacji, a Log out jest dorzucony osobno poniżej | `components/Sidebar.tsx:92-97` (vs `:78-91`) | blocks-showme | S |
| nos-26 | Side menu → Settings → ACCOUNT → **Private key** | §15 (Settings root) | dead | `SettingRow` bez `onClick` renderuje `<div>`, więc wiersz z chevronem **nie jest klikalny**, a ekranu klucza nie ma nigdzie w symulatorze. To najczęstsze pytanie FAQ całego produktu („gdzie jest mój nsec / jak zrobić backup") | `screens/SettingsScreens.tsx:76`; `components/Chrome.tsx:163-170` | breaks-showme | M |
| nos-27 | Side menu → Settings → ACCOUNT → **Delete account** (czerwony) | §15 | dead | Wiersz renderuje się na czerwono, ale bez handlera i bez potwierdzenia | `screens/SettingsScreens.tsx:77` | breaks-showme | M |
| nos-28 | Side menu → Settings → **Posting & Media Uploading** | §15 | dead | Chevron bez `onClick`, brak ekranu docelowego — jedna z trzech pozycji roota Settings bez własnego ekranu (obok nos-29 i nos-26); reszta roota (`appearance`/`zaps`/`relays`/`spam`) prowadzi do zbudowanych ekranów | `screens/SettingsScreens.tsx:54`; `NosturSimulator.tsx:310-338` | breaks-showme | M |
| nos-29 | Side menu → Settings → **Database & Cache** | §15 | dead | Jak wyżej — chevron bez handlera | `screens/SettingsScreens.tsx:71` | breaks-showme | M |
| nos-30 | Settings → Appearance → „Reaction buttons" | §15 (Appearance) | dead | Pasek `💬 🔄 ♡ ⚡ 🔖` to statyczny `<span>` w slocie `trailing`. W realnej apce to konfiguracja `footerButtons` — i tekst naszego touru wprost obiecuje „an appearance panel that lets you rearrange the action row itself" | `screens/SettingsScreens.tsx:111`; obietnica: `src/data/tours/nostur-tour.ts` (krok „Settings go deep") | breaks-showme | M |
| nos-31 | Settings → Zaps → „Lightning wallet" · „Default zap amount: 21" · „Fiat currency" | §15 (Zaps) | dead | Trzy wiersze z chevronem, **żaden nie ma `onClick`** — nie prowadzą nigdzie (działa tylko switch „Show fiat value"). „Default zap amount" to dokładnie miejsce, w którym powinna wylądować odpowiedź „jak zmienić domyślną kwotę zapa" | `screens/SettingsScreens.tsx:136,138-142,151` | breaks-showme | M |
| nos-32 | Settings → Relay Connections → „Configure your relays…" → **„Add new relay…"** | §15 (Relay Connections) | dead | Teal `<button>` **bez `onClick`** — nie ma pola adresu, nie da się dodać ani usunąć relaya, a kropki read/write są statycznymi `<span>`. Drugie najczęstsze pytanie FAQ w produkcie | `screens/SettingsScreens.tsx:194-200`; wiersze `:171-193` | breaks-showme | M |
| nos-33 | Settings → Relay Connections → „Relay connection stats" | §15 | dead | Chevron bez handlera, brak ekranu statystyk | `screens/SettingsScreens.tsx:249` | breaks-showme | M |
| nos-34 | Settings → Spam Filtering → „Web of Trust filter: Normal" · „Main account" · „Media downloading: Web of Trust only" | §15 (Spam Filtering) | dead | Trzy wiersze pokazują wartość + chevron, żaden nie ma `onClick`; realna apka otwiera wybór | `screens/SettingsScreens.tsx:265-270,271-275,300-305` | breaks-showme | M |
| nos-35 | Settings → Spam Filtering → „Update" (odświeżenie Web of Trust) | §15 | dead | Teal „Update" to `<span>` wewnątrz `<p>`, nie przycisk; „Last updated: Never" nigdy się nie zmieni | `screens/SettingsScreens.tsx:290-295` | breaks-showme | S |
| nos-36 | Side menu → Lists & Feeds → „Edit" + „+" | §15 (Lists & Feeds) | dead | Slot `trailing` to `<span>Edit</span>` i goła ikona `Plus` — nie da się dodać ani przestawić feedu (same toggle'e wierszy działają) | `screens/SettingsScreens.tsx:329-336` | breaks-showme | M |
| nos-37 | Side menu → Badges → „Create new badge" (+ arkusz Code / Name / Description / Image URL / Thumbnail URL) | §15 (Badges) | dead | Akcja w toolbarze to `<span>` bez handlera, a arkusza z pięcioma polami — który screen-mapa opisuje wprost — nie ma | `screens/SettingsScreens.tsx:368-372` | breaks-showme | M |
| nos-38 | Side menu → **każda destynacja** (Profile / Lists & Feeds / Badges / Block list / Signer) **oraz** Settings → **każdy pod-ekran** (Appearance / Zaps / Relay Connections / Spam Filtering / lista relayów) | §15 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. Unia komend nie ma niczego dla destynacji szuflady, a `openSettings` **nie przyjmuje payloadu** — zawsze ląduje na roocie Settings. Jedyne, co montuje pod-ekrany, to `onDrawerNavigate`/`onOpen` wywoływane klikiem użytkownika. Skutek: kotwice **`nostur-relays` i `nostur-feeds` są sierotami** — istnieją w kodzie, ale żaden `showMe` ich nie zamontuje. Lista relayów to dodatkowo trzeci skok (root → Relay Connections → Configure), czyli poza zasięgiem kolejki nawet gdyby payload istniał | `NosturSimulator.tsx:246-250` (bez payloadu), `:159-187` (destynacje tylko z klika), `:309`; unia `types.ts:40-52` | blocks-showme | M |
| nos-39 | Settings → Appearance / Zaps / Spam Filtering / lista relayów / Badges (ekrany) | §15 | unanchored | Pięć wiernych, w pełni działających ekranów bez ani jednego `data-tour` (kotwice ma tylko root, Relay Connections i Feeds). Nawet po naprawie nos-38 nie byłoby czego podświetlić | `screens/SettingsScreens.tsx:84-126` (Appearance), `:128-156` (Zaps), `:162-204` (lista relayów), `:256-318` (Spam), `:361-397` (Badges) | blocks-showme | S |
| nos-40 | Notifications → ⚙︎ (ustawienia powiadomień) | §10 | dead | Statyczna ikona w slocie trailing; arkusza ustawień powiadomień nie ma | `screens/NotificationsScreen.tsx:38-40` | breaks-showme | M |
| nos-41 | Notifications → Reactions → pigułka „Show more" | §10 | dead | `<span>` w pigułce, bez handlera — zgrupowana reakcja nigdy się nie rozwija | `screens/NotificationsScreen.tsx:86-95` | breaks-showme | S |
| nos-42 | Notifications → wiersz powiadomienia | §10 | partial | §10 opisuje wiersz jako „avatar + name + teal **Follow** + «Replying to @x and @y» + treść noty, **then the same action row**". U nas `CompactRow` renderuje avatar + nazwę + tekst; **nie ma pigułki Follow, nie ma rzędu akcji**, a wiersz nie jest klikalny (klikalny jest tylko avatar) | `components/PostCard.tsx:220-241`; `screens/NotificationsScreen.tsx:60-85` | breaks-showme | M |
| nos-43 | Messages → ⚙︎ (ustawienia DM) | §11 | dead | Gołe `<svg>` obok działającego „New conversation" | `screens/MessagesScreen.tsx:100` | breaks-showme | M |
| nos-44 | Messages → rozmowa → ⓘ | §11 | dead | Ikona w slocie `trailing` `NavBar`, bez handlera | `screens/MessagesScreen.tsx:28` | breaks-showme | S |
| nos-45 | Messages → „New conversation" → „Search contacts" + segment Following \| All | §11 | dead | Pole `Search contacts` nie ma `value`/`onChange` i nic nie filtruje; segment ma jawny no-op `onChange={() => undefined}` i zawsze pokazuje „Following". *(Szary, nieaktywny „Start" to WIERNOŚĆ — §11 opisuje go jako disabled.)* | `screens/MessagesScreen.tsx:196-211` (pole `:197-202`, segment `:204-209`) | breaks-showme | S |
| nos-46 | Messages → rozmowa / arkusz „Private conversation" / arkusz „Upgrade your DMs" | §11 | unreachable | Wszystkie trzy są wierne i działają (własne bąbelki akcentowe, wysyłka, tekst NIP-17), ale montuje je wyłącznie lokalny stan `openWith`/`newConvo`/`upgrade` — `navigate: 'messages'` dowozi tylko listę. Żadna z nich nie ma też `data-tour` | `screens/MessagesScreen.tsx:15-22,152,180`; komenda: `NosturSimulator.tsx:204-207` | blocks-showme | S |
| nos-47 | Search → zapytanie `#hashtag` → wiersz nagłówka → „Follow" | §12 | dead | Pigułka Follow przy nagłówku hashtaga to `<span>`, w odróżnieniu od działających `FollowLink` w wynikach profilowych | `screens/SearchScreen.tsx:67-80` (pigułka `:73-78`) | breaks-showme | S |
| nos-48 | Search → zapytanie `#hashtag` → pasujące noty | §12 | partial | §12: po wierszu hashtaga idą „matching notes as full PostCards". U nas hashtag zwraca `mockUsers.slice(0, 5)`, czyli **wyłącznie wiersze profili** — ani jednej noty | `screens/SearchScreen.tsx:28-37` (`:30`) | breaks-showme | M |
| nos-49 | Search → wyniki (wiersze profili, Follow, bio) | §12 | unreachable | `navigate: 'search'` montuje ekran, ale `results` jest puste dopóki użytkownik nie **wpisze** zapytania, a tour nie umie pisać → `showMe` zawsze pokaże pusty stan „Search for people and posts" | `screens/SearchScreen.tsx:25-37,82` | blocks-showme | M |
| nos-50 | Bookmarks → „Search in bookmarks…" | §15 (Bookmarks) | dead | `<input>` bez `value`/`onChange` — można pisać, ale lista zakładek nigdy się nie filtruje | `screens/BookmarksScreen.tsx:62-70` | breaks-showme | S |
| nos-51 | Compose → pasek załączników (photo · camera · video · GIF · voice) | §13 | dead | Pięć gołych ikon/`<span>`, zero `<button>` i zero handlerów — cały pasek jest dekoracją | `screens/ComposeScreen.tsx:68-82` | breaks-showme | M |
| nos-52 | Compose → wyślij (`paperplane`) → nowa nota w feedzie | §13 | partial | `onPost` zamyka arkusz, woła `registerAction('post')` i pokazuje toast „Posted", ale **nota nigdy nie pojawia się w feedzie** — `followingFeed`/`exploreFeed` to stałe modułowe bez settera. Dotyczy też odpowiedzi (`onReply` → compose → nic nie ląduje w wątku) | `NosturSimulator.tsx:427-431`; `nosturData.ts:107-114` | breaks-showme | M |
| nos-53 | Zap sheet („Send sats") → moneta „Custom" | §14 | dead | `onClick` ustawia **21**, czyli udaje, że coś się stało, a wraca do domyślnej kwoty; nie ma pola na własną kwotę. Przy okazji siatka ma 15 monet zamiast 16 — brakuje slotu „[last custom]", który w realnej apce trzyma ostatnią własną kwotę | `components/ZapSheet.tsx:68-74`; `nosturData.ts:175-177` (14 kwot + Custom) | breaks-showme | M |
| nos-61 | Notifications → rząd sub-tabów (Mentions · New Posts · Reactions · Reposts · Zaps · Followers) | §10 | unreachable | `navigate: 'notifications'` zawsze ląduje na **„Mentions"**: `tab` to lokalny `useState`, unia komend nie ma dla tej osi payloadu, a sam rząd **nie ma `data-tour`** (kotwica siedzi dopiero na liście). Pytania „gdzie widzę, kto mnie zapował / kto mnie zaobserwował" nie da się pokazać, choć oba widoki są zbudowane i działają. Ten sam kształt mają rzędy Accepted \| Requests (Messages) i Bookmarks \| Private Notes | `screens/NotificationsScreen.tsx:29,43-54`; unia `types.ts:40-52` | blocks-showme | S |
| nos-62 | Post → reply → Compose w trybie odpowiedzi („Replying to @{name}") | §13 | unreachable | Arkusz odpowiedzi jest zbudowany i wierny, ale komenda `compose` twardo ustawia `replyToId: null`, więc tryb odpowiedzi montuje **wyłącznie klik** w ikonę reply. FAQ „jak odpowiedzieć na post" podświetli co najwyżej przycisk (`.nostur-action[data-role="reply"]`), nigdy samego arkusza z wierszem „Replying to @…" | `NosturSimulator.tsx:227-231` (bez payloadu), `:282`; `screens/ComposeScreen.tsx:49-54` | blocks-showme | S |
| nos-63 | Messages → rozmowa → karta odbiorcy → „Follow" | §11 | dead | Pigułka ma `following` zahardkodowane na `false`, a jej `onClick` **otwiera profil** zamiast zaobserwować — nikogo nie da się zaobserwować z rozmowy, a klik wyprowadza użytkownika z ekranu, na którym stoi mini-tour. Jedyna kontrolka w symulatorze, która pod znajomą etykietą robi coś innego niż realna apka | `screens/MessagesScreen.tsx:40` | breaks-showme | S |
| nos-54 | Dolny pasek zakładek (Home · Bookmarks · Search · Notifications · Messages) | §4 | ok | Pięć ikon bez etykiet w kolejności `MainTabs15`, badge'y na bell/envelope, każdy tab z własną kotwicą `nostur-tab-<id>` i `aria-label`, wszystkie osiągalne `navigate`. Brak zakładki „New Post" i obecność koperty to **wierność** wg §16, nie luka | `components/BottomBar.tsx:16-23,41-58`; `NosturSimulator.tsx:378-385` | none | — |
| nos-55 | Post → rząd akcji (reply → repost → ♥ → zap → bookmark) | §7, §17.3 | ok | Kolejność, `space-between`, liczniki ukrywane przy 0, suma satów + słowo „sats", zap wygaszony i `disabled` bez adresu LN, aktywny stan barwi dokładnie jedną ikonę (`data-role` + CSS `:309-314`). Kotwice: `nostur-actionbar`, `nostur-zap`, plus stabilne selektory `.nostur-action[data-role="…"]` | `components/ActionBar.tsx:57-124`; `nostur.theme.css:296-314` | none | — |
| nos-56 | Home → górny pasek → żółw (Low Data Mode) + toast + blok „Loading paused" | §5, §17.6 | ok | Żółw przygaszony do 30 % gdy OFF, tap przełącza stan i publikuje toast „Low Data mode: enabled/disabled", media zamieniają się w blok `background`. Kotwica `nostur-lowdata`, osiągalne `openFeed`. *(Sam stan ON jest osiągalny tylko klikiem — patrz nos-07 dla martwego „Load anyway".)* | `screens/FeedScreen.tsx:65-72`; `NosturSimulator.tsx:152-157,400`; `components/PostCard.tsx:156-169` | none | — |
| nos-57 | Post → zap → arkusz „Send sats" | §14 | ok | Tytuł, `X` Cancel, siatka pomarańczowych monet z podpisami fiat, **21 preselected**, „Add public note (optional)", akcentowy „Send N sats to {name}", trzy toggle'e (Remember / Private zap / Send anonymously). Zakotwiczony `nostur-zapsheet`, osiągalny komendą `zap` (celuje w pierwszego autora z adresem LN) | `components/ZapSheet.tsx:32-109`; `NosturSimulator.tsx:232-239` | none | — |
| nos-58 | Side menu (baner, avatar w 3 pt ringu, npub, „**N** Following", 8 wierszy, stopka) | §15 | ok | Kolejność wierszy zgodna z repo, **brak wiersza Messages to wierność** (§16), stopka drukuje „Nostur 1.30.2 (Build: 527)" i linkuje „Source code" do repo. Kotwice: `nostur-sidebar` + `nostur-drawer-<id>` ×7; osiągalne `openDrawer`. Wyjątki wypisane osobno: nos-23, nos-24, nos-25 | `components/Sidebar.tsx:26-34,49-115`; `NosturSimulator.tsx:240-245` | none | — |
| nos-59 | Home → sub-taby feedu (Following · Discover · Explore) | §6, §17.2 | ok | Trzy taby to **wierność**, nie okrojenie: pozostałe 10 jest w repo za bramką `viewFollowingPublicKeys.count > 10` (§6/§16). `TabButton` trzyma etykietę akcentową niezależnie od zaznaczenia, zaznaczenie niesie wyłącznie 1 px podkreślenie. Kotwica `nostur-feedtabs`, osiągalne `openFeed` z payloadem | `screens/FeedScreen.tsx:11,84-88`; `components/Chrome.tsx:11-51` | none | — |
| nos-60 | Settings root + Lists & Feeds + Spam (kontrolki, które NAPRAWDĘ działają) | §15 | ok | Działają i trzymają stan: „Low Data Mode" w roocie (ten sam stan co żółw), 8 switchy w Appearance, Autopilot / Follow relay hints / VPN detection + czerwony wiersz „VPN not detected", segment „Nostr Dunbar Number" (250/500/1000/2000/All, default 1000), „Verify message signatures", 9 toggle'i „DEFAULT FEEDS". Root zakotwiczony `nostur-settings` i osiągalny `openSettings` | `screens/SettingsScreens.tsx:62-69,113-121,224-248,276-299,309-313,340-355` | none | — |

## Anchors — `data-tour` obecne w symulatorze

29 literalnych nazw + 2 rodziny generowane (`nostur-tab-<id>` ×5, `nostur-drawer-<id>` ×7)
= **41 różnych wartości `data-tour`** faktycznie obecnych w DOM (metodologia liczenia
w [`../GAPS.md`](../GAPS.md)). Najlepsze pokrycie w repo — ale patrz kolumna „uwaga".

| Selector | Plik:linia | Powierzchnia / uwaga |
|---|---|---|
| `[data-tour="nostur-create-account"]` | `screens/WelcomeScreen.tsx:108` | Welcome → „Create new account". **Tylko na świeżym mountcie** — brak `logout` (nos-02) |
| `[data-tour="nostur-toolbar"]` | `screens/FeedScreen.tsx:53` | Cały górny pasek Home (avatar · znak · żółw · ⚙︎) |
| `[data-tour="nostur-account"]` | `screens/FeedScreen.tsx:58` | Górny pasek → avatar konta (otwiera szufladę) |
| `[data-tour="nostur-lowdata"]` | `screens/FeedScreen.tsx:69` | Górny pasek → żółw Low Data Mode |
| `[data-tour="nostur-feedtabs"]` | `screens/FeedScreen.tsx:84` | Rząd sub-tabów feedu (Following/Discover/Explore) |
| `[data-tour="nostur-post"]` | `components/PostCard.tsx:88` | **Każda** karta posta — selektor trafia wiele elementów; w `showMe` używaj z ograniczeniem albo celuj w rodzica |
| `[data-tour="nostur-actionbar"]` | `components/ActionBar.tsx:58` | Rząd akcji pod postem (też wielokrotny) |
| `[data-tour="nostur-zap"]` | `components/ActionBar.tsx:103` | Przycisk zapa w rzędzie akcji |
| `[data-tour="nostur-lowdata-block"]` | `components/PostCard.tsx:164` | Blok „Loading paused (Low data mode)" — celowo na bloku, nie na „pierwszym poście": media są losowane per nota (komentarz `:161-163`) |
| `[data-tour="nostur-fab"]` | `NosturSimulator.tsx:434` | FAB „New post" (tylko Home i wypchnięty profil — nos-14) |
| `[data-tour="nostur-thread"]` | `screens/ThreadScreen.tsx:79` | Post detail (scroller) — osiągalny `openThread` |
| `[data-tour="nostur-profile"]` | `screens/ProfileScreen.tsx:85` | Profil (scroller). Komendą montuje się **tylko własny** (nos-21) |
| `[data-tour="nostur-notifications"]` | `screens/NotificationsScreen.tsx:56` | Lista powiadomień (nie taby — te są bez kotwicy) |
| `[data-tour="nostur-messages"]` | `screens/MessagesScreen.tsx:110` | Lista rozmów. Sama rozmowa i oba arkusze są bez kotwicy (nos-46) |
| `[data-tour="nostur-search"]` | `screens/SearchScreen.tsx:66` | Scroller wyników wyszukiwania — **pusty bez wpisanego zapytania** (nos-49) |
| `[data-tour="nostur-bookmarks"]` | `screens/BookmarksScreen.tsx:72` | Lista zakładek — osiągalna `navigate: 'bookmarks'` |
| `[data-tour="nostur-compose"]` | `screens/ComposeScreen.tsx:31` | Arkusz „New Post" — osiągalny `compose` |
| `[data-tour="nostur-send"]` | `screens/ComposeScreen.tsx:42` | Compose → `paperplane` (wysyłka; nota nie ląduje w feedzie — nos-52) |
| `[data-tour="nostur-zapsheet"]` | `components/ZapSheet.tsx:38` | Arkusz „Send sats" — osiągalny `zap` |
| `[data-tour="nostur-zap-amounts"]` | `components/ZapSheet.tsx:55` | Siatka 16 monet w arkuszu „Send sats" |
| `[data-tour="nostur-sidebar"]` | `components/Sidebar.tsx:50` | Szuflada — osiągalna `openDrawer` |
| `[data-tour="nostur-switcher"]` | `components/Sidebar.tsx:62` | Szuflada → para avatar + „…" (przełącznik kont), zakotwiczona jako jedna powierzchnia |
| `[data-tour="nostur-drawer-rows"]` | `components/Sidebar.tsx:83` | Szuflada → cała lista wierszy (dla kroków o liście, nie o pojedynczym wierszu) |
| `[data-tour="nostur-drawer-<id>"]` | `components/Sidebar.tsx:90` (szablon) | 7 wierszy z `ROWS` (`:26-33`): `profile` `feeds` `bookmarks` `badges` `settings` `blocklist` `signer` |
| `[data-tour="nostur-drawer-logout"]` | `components/Sidebar.tsx:98` | Wiersz „Log out" — poza tablicą `ROWS`, własny literał. **Zamyka nos-25** (dawniej: rodzina była „bez `logout`") |
| `[data-tour="nostur-settings"]` | `screens/SettingsScreens.tsx:49` | Settings root — osiągalny `openSettings` |
| `[data-tour="nostur-settings-relays"]` | `screens/SettingsScreens.tsx:59` | Settings → grupa „Relay Connections + Spam Filtering" (NIE podekran — komentarz `:57-58`) |
| `[data-tour="nostur-relays"]` | `screens/SettingsScreens.tsx:211` | Relay Connections — **SIEROTA**: żadna komenda nie montuje tego ekranu (nos-38) |
| `[data-tour="nostur-zapsettings"]` | `screens/SettingsScreens.tsx:135` | Settings → Zaps — **SIEROTA**: jw. (nos-38) |
| `[data-tour="nostur-feeds"]` | `screens/SettingsScreens.tsx:340` | Lists & Feeds („Feeds") — **SIEROTA**: jw. (nos-38) |
| `[data-tour="nostur-tab-<id>"]` | `components/BottomBar.tsx:49` | 5 zakładek dolnego paska: `home` `bookmarks` `search` `notifications` `messages` |

**Stabilne selektory zastępcze** (bez `data-tour`, ale wystarczające dla `showMe` — tak jak
`.damus-action.is-like` w FAQ Damusa): `.nostur-action[data-role="reply|repost|react|zap|bookmark"]`,
`[aria-label="Account menu"]`, `[aria-label="Low Data Mode"]`, `[aria-label="Feed settings"]`,
`[aria-label="New post"]`, `.nostur-followbtn`, `.nostur-coin`, `.nostur-tabbtn`,
`.nostur-sidebar-row`, `.nostur-showmore`, `.nostur-toast`, `.nostur-segmented`.

## Reachability — komendy toura

**Union:** `type: 'login' | 'navigate' | 'openFeed' | 'openThread' | 'viewProfile' | 'compose' | 'zap' |
'openDrawer' | 'openSettings'` (`types.ts:40-52`), payload: `payload?: string`.
Payload realnie czytają tylko `navigate` (`NosturTab`) i `openFeed` (`NosturFeed`).

Dwie właściwości tego wrappera, o których autor FAQ MUSI wiedzieć:

1. **Każda komenda najpierw loguje** (`setAuthenticated(true)`, `NosturSimulator.tsx:200`) i większość
   woła `closeOverlays()`, więc komendy są samowystarczalne — **jedna komenda na krok wystarcza i jest
   zalecana**. `handleStepChange` w tym wrapperze celowo mapuje po jednej (`NosturSimulatorWithTour.tsx:46-59`).
2. Ta sama właściwość oznacza, że **nie ma jak się wylogować** — patrz nos-02.

| Powierzchnia | Osiągalna komendą? | Czym |
|---|---|---|
| Welcome / „Add existing account" | **NIE** | brak `logout` (nos-02, nos-03) |
| Home feed — Following / Explore | tak | `{ type: 'openFeed', payload: 'Following' \| 'Explore' }` |
| Home feed — Discover (follow packs) | tak | `{ type: 'openFeed', payload: 'Discover' }` (bez własnej kotwicy — nos-13) |
| Górny pasek Home (avatar / znak / żółw / ⚙︎) | tak | `openFeed` lub `navigate: 'home'` |
| Arkusz „Following Feed settings" | **NIE** | tylko lokalny stan (nos-06) |
| Stan Low Data Mode ON (bloki „Loading paused") | **NIE** | wymaga tapnięcia żółwia; komenda montuje tylko OFF |
| Post detail (thread) | tak | `{ type: 'openThread' }` — zawsze pierwsza nota z Following |
| Profil własny | tak | `{ type: 'viewProfile' }` |
| Profil cudzy (Follow pill) | **NIE** | brak payloadu (nos-21) |
| Compose (nowy post) | tak | `{ type: 'compose' }` |
| Compose w trybie odpowiedzi („Replying to @…") | **NIE** | `compose` wymusza `replyToId: null` (nos-62) |
| Zap sheet „Send sats" | tak | `{ type: 'zap' }` — pierwszy autor z adresem LN |
| Side menu | tak | `{ type: 'openDrawer' }` |
| Settings root | tak | `{ type: 'openSettings' }` |
| Settings → Appearance / Zaps / Relay Connections / Spam | **NIE** | `openSettings` bez payloadu (nos-38) |
| Settings → lista relayów („Configure your relays…") | **NIE** | trzeci skok — poza zasięgiem kolejki nawet z payloadem (nos-38) |
| Lists & Feeds / Badges / Block list / Signer | **NIE** | destynacje szuflady nie są komendami (nos-38) |
| Bookmarks | tak | `{ type: 'navigate', payload: 'bookmarks' }` |
| Search (ekran) | tak | `{ type: 'navigate', payload: 'search' }` |
| Search (wyniki) | **NIE** | wymaga wpisania zapytania (nos-49) |
| Notifications (lista) | tak | `{ type: 'navigate', payload: 'notifications' }` |
| Notifications → tab Reactions / Zaps / Followers / … | **NIE** | `navigate` nie ma payloadu dla sub-tabu — zawsze „Mentions" (nos-61) |
| Messages (lista) | tak | `{ type: 'navigate', payload: 'messages' }` |
| Messages → rozmowa / „Private conversation" / „Upgrade your DMs" | **NIE** | lokalny stan (nos-46) |

## Poza zakresem / do recon

- **NWC / „Your balance:"** — §14 i §15 wspominają saldo portfela, ale §18 klasyfikuje `NWCWalletBalance`
  jako **repo-only** (nagranie tego nie pokazuje). Nie ma czego odtwarzać bez recon.
- **Picker motywu.** §1 dokumentuje 10 nazwanych motywów (`app_theme` w `UserDefaults`), ale lista
  Appearance w §15 **nie zawiera** wiersza wyboru motywu — nie wiadomo, gdzie w realnej apce ten wybór
  żyje. Brak tej kontrolki u nas nie jest więc mierzalną luką (nasz jasny/ciemny idzie przez
  `useParentTheme`, zgodnie z `preferredColorScheme == nil`).
- **Flow „Create new account"** — §18 mówi tylko „onboarding (`WelcomeSheet`, `AddExistingAccountSheet`,
  guest account)"; kroków generowania klucza screen-mapa nie opisuje, więc nasz skrót „przycisk → feed"
  nie ma wobec czego być oceniony.
- **Zawartość menu ••• posta i profilu** — screen-mapa notuje glif w akcencie, ale nie wylicza pozycji
  menu. `dead` w nos-08/nos-17 dotyczy braku reakcji, nie braku konkretnych pozycji.
- **Tap w `@mention` / `#hashtag` / link w treści noty** — §7.3 opisuje wyłącznie kolor (akcent, bez
  podkreślenia) i nie mówi, dokąd prowadzi tap. U nas to `<span>` bez nawigacji
  (`components/PostCard.tsx:14-37`) — świadome, bo sim nie ma celu, ale bez recon nie da się orzec,
  czy to luka.
- **Skąd wywołuje się picker własnego emoji** (nos-10) i **czy „Announce your relays…" ma osobny ekran**
  (u nas oba wiersze otwierają tę samą listę, `screens/SettingsScreens.tsx:212-223`) — §15 wymienia
  wiersze, ale nie ich cele.
- **Arkusze ustawień z ⚙︎ w Notifications i Messages** — screen-mapa notuje same ikony (§10, §11).
- **Repo-only wg §18:** jasny wygląd pozostałych dziewięciu motywów, układy iPad/macOS, live streams,
  feedy Gallery/Picture/Yak/Vine/Emoji/Zapped/Hot/Articles, wydawanie odznak, treść Block list i Signer.
  §19 uznaje puste stany Badges / Block list / Signer za **zaakceptowaną deltę** — nie zgłaszać jako luki.

### Świadoma wierność — NIE zgłaszać jako luk

3 sub-taby feedu zamiast 13 (§6/§16, bramka „following > 10") · brak wiersza „Messages" w szufladzie
(§16) · brak zakładki „New Post" / `MainTabs26` (§16) · Low Data Mode domyślnie OFF mimo nagrania (§16) ·
szary, nieaktywny „Start" w arkuszu nowej rozmowy (§11) · „∞ Followers" (§9) · etykiety `TabButton`
zawsze akcentowe (§17.2) · płaskie, seedowane kolory zamiast brakujących avatarów (§17.9) ·
`keySafety.ts` odrzucający prawdziwy nsec · limit ~25 not w feedzie i treść z `src/data/mock`.
