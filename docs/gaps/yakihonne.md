# YakiHonne — gap ledger

> Ground truth: `docs/refs/yakihonne/screen-map.md` · Sim: `src/simulators/yakihonne/`
> Audited: 2026-08-05 · Registry status: ready · Sim LOC: 3602

## Rollup

| missing | dead | partial | unreachable | unanchored | ok |
|---|---|---|---|---|---|
| 27 | 30 | 13 | 5 | 2 | 20 |

**Top 3 do zrobienia:** yak-19 (menu „⋯" noty — jedyna droga do Bookmark/Share/Mute) · yak-30 (pasek narzędzi
komponera) · yak-32 (przycisk Follow bez handlera).
*(Poprzednie top-3 — yak-96 mostek, yak-17 payloady zakładek, yak-77 drawer — plus yak-01/29/40/61/66/76/79/91/93/94
zamknięte 2026-08-06 przy wdrażaniu FAQ; wiersze niżej oznaczone.)*

## Gaps

| ID | Surface (ścieżka w UI) | § | Status | Gap | Evidence | FAQ impact | Effort |
|---|---|---|---|---|---|---|---|
| yak-01 | Landing ("Log in / Create account / Continue as a guest") — powrót po zalogowaniu | §Login | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. Unia komend nie ma `logout`, a żaden wiersz drawera/Settings nie wylogowuje. Landing istnieje wyłącznie jako stan startowy sima — po pierwszym `login` kotwica `yakihonne-keys` nigdy się już nie zamontuje. Damus ma na to `{type:'logout'}` (`src/data/faq/damus.ts:60`) | `YakiHonneSimulator.tsx:33` (unia), `:129-155` (brak case'a), `:75-78` | blocks-showme | S |
| yak-02 | Landing → "Log in" → Keys / Remote signer | §Login | unreachable | Ekran jest wierny (karty metod przy dolnej krawędzi, 1.5px pomarańczowa ramka, QR white-on-black, pole `bunker://`), ale nie ma komendy ustawiającej `authRoute='signin'` — wchodzi się tylko kliknięciem | `SignInScreen.tsx:34`, `YakiHonneSimulator.tsx:215` | blocks-showme | S |
| yak-03 | Landing → "Create account" (kreator 5 stron) | §Login | unreachable | Wszystkie 5 stron zbudowane, ale żadna komenda nie otwiera kreatora, a każda strona wymaga własnego tapnięcia w "Next" — strona 5 to 6 przeskoków od zimnego sima, daleko poza limit 2 komend/krok | `SignUpScreen.tsx:59`, `:87-126`, `YakiHonneSimulator.tsx:216` | blocks-showme | M |
| yak-04 | Create account → strona 2 "Starter packs" → wybór packa | §Login | dead | Wiersze renderują miniaturę/opis/klaster awatarów/kafelek z chevronem, ale to gołe `<div>`-y — brak stanu wyboru, klik nic nie robi | `SignUpScreen.tsx:205-219` | breaks-showme | S |
| yak-05 | Create account → strona 1 → "Add cover" / "Add picture" | §Login | dead | Oba to elementy nieinteraktywne (`<span>` chip, `<p>` etykieta); realna apka otwiera pickery obrazów | `SignUpScreen.tsx:171-173`, `:148` | breaks-showme | S |
| yak-06 | Create account → strona 5 → zielony "Export keys" | §Login | dead | Jedyne zielone CTA w apce renderuje się bez `onClick` | `SignUpScreen.tsx:339-345` | breaks-showme | S |
| yak-07 | Landing → "Continue as a guest ›" → tryb gościa | §Login | missing | Guest wywołuje to samo `login()` co realne logowanie: brak banera "View as" z ikoną oka, brak zwiniętego drawera gościa (YakiHonne / Articles / Explore / Relay orbits / Settings) i pomarańczowego "Login ⇥" | `YakiHonneSimulator.tsx:213` (`onGuest={login}`), `:97-101` | blocks-showme | M |
| yak-08 | Landing → "End User Licence Agreement (EULA)" | §Login | dead | Wyrenderowany jako `<span>`, nie kontrolka — nigdzie nie prowadzi | `LoginScreen.tsx:60` | none | S |
| yak-09 | Log in → Keys → "Paste your key" | §Login | partial | Przycisk loguje bezwarunkowo, także przy pustym polu; realny najpierw wkleja ze schowka i dopiero wtedy zmienia się w "Login". Etykieta przełącza się poprawnie | `SignInScreen.tsx:89-95` | none | S |
| yak-10 | Home → top app bar → Filter | §Home feed | dead | Chip `FilterGlobalButton` bez `onClick`; nie istnieje ani arkusz filtrów, ani pomarańczowa kropka aktywnego filtra | `HomeScreen.tsx:38` | breaks-showme | M |
| yak-11 | Media → top app bar → Filter | §Home feed / §Bottom nav | dead | Ten sam chip, brak handlera | `MediaScreen.tsx:26` | breaks-showme | S |
| yak-12 | Home → feed selector → arkusz źródeł → Relays / Packs | §Home feed | partial | Arkusz ma dokładnie 6 domyślnych źródeł Community (poprawnie), ale realny `AppSourcesList` listuje pod nimi jeszcze relaye użytkownika i Packs | `FeedSelector.tsx:6-13`, `:63` | blocks-showme | M |
| yak-13 | Home → feed selector → arkusz źródeł (jako powierzchnia) | §Home feed | unreachable | Arkusz otwiera tylko tapnięcie triggera; komendy brak, a kotwica `yakihonne-feedsel` siedzi na przycisku, nie na arkuszu | `YakiHonneSimulator.tsx:230-232`, `FeedSelector.tsx:51` | blocks-showme | S |
| yak-14 | Home → pigułka "new content" | §Home feed | missing | Brak dolnej bąbelkowej pigułki z licznikiem (`99+`) i awatarami nowych autorów; brak scroll-to-top po ponownym tapnięciu Home | absent — `screens/HomeScreen.tsx:44-66` | blocks-showme | M |
| yak-15 | Home → pull-to-refresh / load-more | §Home feed | missing | Statyczna lista, brak odpowiednika `SmartRefresher` (ani odświeżania, ani doładowania) | absent — `HomeScreen.tsx:52-66` | blocks-showme | M |
| yak-16 | Home → sliver sugestii + poziomy pasek MediaBox + box listy kontaktów | §Home feed | missing | Slivery 1-3 timeline'u i ostrzeżenie o cache nie istnieją — feed zaczyna się od razu notatkami | absent — `HomeScreen.tsx:45` | none | M |
| yak-17 | Bottom nav → Media / Wallet / DMs / Notifications | §Bottom nav | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. `navigate` przyjmuje tylko `feed`/`home`, `profile`, `settings`, `wallet` — trzy z pięciu zakładek nie mają komendy | `YakiHonneSimulator.tsx:135-141` | blocks-showme | S |
| yak-18 | Bottom nav → kropka nieprzeczytanych (DMs / Notifications) | §Bottom nav | partial | Badge jest zaszyty na sztywno na obu zakładkach i nigdy nie znika — realny czyści się po wejściu w Notifications, a long-press na DMs oznacza wszystko jako przeczytane | `TabBar.tsx:22-23`, `:46` | none | S |
| yak-19 | Note → "⋯" (Copy npub / note id / text, Show raw event, Pin, **Bookmark**, Republish, Share as image, **Share**, Mute thread, Mute user, Delete) | §Note card | dead | `onClick={stop()}` — całe menu nie istnieje, a razem z nim JEDYNA ścieżka do Bookmark, Share i Mute | `NoteCard.tsx:143` | breaks-showme | M |
| yak-20 | Note → Quote | §Note card | dead | Przycisk i licznik są, `onClick={stop()}` to no-op | `NoteCard.tsx:135` | breaks-showme | S |
| yak-21 | Note → Translation | §Note card | dead | `onClick={stop()}` | `NoteCard.tsx:142` | breaks-showme | S |
| yak-22 | Note → React → `ReactionsBox` (quick-row emoji + pełny picker) / long-press → kto zareagował | §Note card | missing | Tap przełącza serce natychmiast (zachowanie one-tap-reaction ON); wariant OFF z pickerem i lista reagujących nie istnieją | `NoteCard.tsx:51`, `:123-128` | blocks-showme | M |
| yak-23 | Note → Zap → arkusz kwoty (presety 20/100/500/1000/5000/10000/50000/100000, komentarz, Invoice, Send, Min/Max, Zap splits) | §Wallet + zap | missing | Zap wysyła sztywne 21 satów prosto z action baru; `zapPresets` jest wyeksportowane i **nigdzie nieimportowane** (grep: jedyne wystąpienie) | `NoteCard.tsx:53`, `data.ts:160` | blocks-showme | L |
| yak-24 | Home → Trending (Articles) → action bar karty artykułu | §Articles | dead | Wszystkie 5 kontrolek to `onClick={stop()}` — cały rząd akcji feedu artykułów jest martwy, w odróżnieniu od feedu notatek | `ArticleCard.tsx:57-61` | breaks-showme | S |
| yak-25 | Article reader → "Posted by" → Follow / zap | §Articles | dead | Oba przyciski renderują się bez handlera; `SendZapsView` nie istnieje | `ArticleReader.tsx:32-35` | breaks-showme | S |
| yak-26 | Article reader → dolny action bar + pigułka "See translation" | §Articles | dead | Pięć dolnych akcji i pigułka bez `onClick`; pigułka nigdy nie przełącza się na "See original" | `ArticleReader.tsx:56`, `:62-66` | breaks-showme | S |
| yak-27 | Article reader → summary + chipy hashtagów | §Articles | partial | Są: Posted by, tytuł, "Posted from", cover, body. Brakuje linii summary i pomarańczowych chipów hashtagów między tytułem a coverem | `ArticleReader.tsx:39-52` | none | S |
| yak-28 | Discover → All · Articles · Videos · Curations | §Articles | missing | Widoku Discover nie ma w ogóle; long-form dostępny wyłącznie jako źródło feedu "Trending", a karty video / curation / flash-news nie istnieją | absent — `HomeScreen.tsx:26`, `:45-51` | blocks-showme | L |
| yak-29 | Article reader (jako powierzchnia) | §Articles | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. Otwiera się tylko przez zmianę źródła na Trending + tap w kartę (3+ przeskoki), a komendy nawigacyjnej brak | `YakiHonneSimulator.tsx:104`, `:135-141` | blocks-showme | S |
| yak-30 | Compose → dolny toolbar (image · GIF · @ · tools/smart widgets · calendar) | §Compose | dead | Wszystkie pięć przycisków bez `onClick` — brak MediaSelectora, Giphy, wstawiania `@`, ToolsView i planowania (ikona kalendarza nigdy nie robi się pomarańczowa) | `ComposeSheet.tsx:83-87` | breaks-showme | M |
| yak-31 | Compose → przełącznik kont (`NoteAccountsSwitcher`) | §Compose | missing | Zredukowany do statycznego awatara | `ComposeSheet.tsx:70` | none | S |
| yak-32 | Profile → Follow / Edit profile | §Profile | dead | Przycisk nie ma `onClick`, a **jest celem kroku 6 istniejącego toura** (`data-tour="yakihonne-follow"`, tooltip „Follow people") — spotlight ląduje na kontrolce, której nie da się użyć. Dodatkowo: komendy montują wyłącznie profil SELF, więc etykieta w demo brzmi **„Edit profile", nigdy „Follow"** (yak-93) | `ProfileScreen.tsx:54-56`, `src/data/tours/yakihonne-tour.ts` (krok `yakihonne-follow`), `YakiHonneSimulatorWithTour.tsx:71` | breaks-showme | S |
| yak-33 | Profile → "⋯" (copy npub / hex, user relays, share, refresh, mute) | §Profile | dead | Przycisk w banerze bez handlera | `ProfileScreen.tsx:47` | breaks-showme | M |
| yak-34 | Profile (cudzy) → zap · DM | §Profile | missing | Action row to samo Follow — obwiedzionych przycisków `zaps.svg` i `start-dms.svg` nie ma | `ProfileScreen.tsx:52-57` | blocks-showme | S |
| yak-35 | Profile → QR | §Profile | dead | `QrIcon` renderuje się jako gołe SVG obok nazwy, nie jako przycisk | `ProfileScreen.tsx:63` | breaks-showme | S |
| yak-36 | Profile → tap w Followings / Followers → arkusz połączeń | §Profile (C) | missing | Liczniki to zwykły tekst; list obserwujących/obserwowanych nie ma | `ProfileScreen.tsx:83-90` | blocks-showme | M |
| yak-37 | Profile → zakładki Articles / Media / Others (+ ich pod-zakładki) | §Profile | partial | Zakładki przełączają się, ale wszystkie trzy pokazują "Oops! Nothing to show here!"; chipy Media (All/Pictures/Videos) i Others (Curations/Smart widgets) nie istnieją — zdefiniowane są tylko cztery chipy Notes | `ProfileScreen.tsx:109-121`, `:23` | blocks-showme | M |
| yak-38 | Profile → Notes → Pinned · Notes · Replies · Mentions | §Profile | partial | Chipy zmieniają stan, ale lista jest identyczna dla wszystkich czterech | `ProfileScreen.tsx:101-113` | breaks-showme | S |
| yak-39 | Profile → arkusz "Impact" (Writing impact / Rating impact) | §Profile (B) | missing | Reputacja Uncensored-Notes nie istnieje w symulatorze | absent — `screens/ProfileScreen.tsx` | blocks-showme | L |
| yak-40 | Profile (kotwica) | §Profile | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. `data-tour="yakihonne-profile"` jest na DWÓCH elementach: awatarze w app barze Home i na roocie overlaya Profile. Home zostaje zamontowany pod overlayami, więc `querySelector` trafia w ukryty przycisk app baru — spotlight wypada w lewym górnym rogu, POD profilem | `HomeScreen.tsx:33` + `ProfileScreen.tsx:41` | breaks-showme | S |
| yak-41 | Wallet → wiersz wybranego portfela ("Wallet of Satoshi ▾") | §Wallet 1 | dead | Wiersz z chevronem bez `onClick`; brak przełącznika portfeli NWC i stanu "No Wallet Linked" | `WalletScreen.tsx:44-47` | breaks-showme | S |
| yak-42 | Wallet → Receive / Send | §Wallet 4 | dead | Oba przyciski mają wierny podział (neutralny / pomarańczowy) i zero handlerów; żaden flow wysyłki ani odbioru nie istnieje | `WalletScreen.tsx:69-74` | breaks-showme | M |
| yak-43 | Wallet → dropdown waluty fiat + "Copy LN" | §Wallet 3 | dead | Oba to `<button>` bez `onClick`; brak też stanu ukrytego salda (`*****`) | `WalletScreen.tsx:57-63` | breaks-showme | S |
| yak-44 | Wallet → "Redeem" | §Wallet 2 | missing | Szklanego przycisku na górze karty salda nie ma | absent — `WalletScreen.tsx:50-65` | blocks-showme | S |
| yak-45 | Wallet → wyśrodkowany pływający QR w rzędzie akcji | §Wallet 4 | missing | Kontrolki ze specyfikacji (QR między Receive a Send) nie ma w ogóle; jedyny QR to chip „Scan" w headerze — inna funkcja i **też bez handlera** | `WalletScreen.tsx:68-75` (brak), `:39` (martwy chip) | blocks-showme | S |
| yak-46 | Wallet → transakcja → rozwijany "Comment" | §Wallet 5 | partial | Wiersze renderują kierunek/datę/saty/kontrahenta jako statyczne `<div>`-y; nic się nie rozwija | `WalletScreen.tsx:81-92` | blocks-showme | S |
| yak-47 | Settings → Wallets → siatka "Wallets" (WoS · Alby Go · Blue Wallet · Muun · Breez · Zebedee · Zeus LN · Phoenix · Blitz + "Always use external") | §Wallet | missing | Wiersz Settings skacze na zakładkę Wallet; arkusza z siatką portfeli zewnętrznych (pomarańczowa ramka wybranego) nie ma | `YakiHonneSimulator.tsx:123`, absent w `screens/WalletScreen.tsx` | blocks-showme | M |
| yak-48 | Wallet → Connect a wallet ("Create Yaki Wallet" / "Nostr Wallet Connect" / "Alby", formularz NWC) | §Wallet | missing | Brak flow podłączania i stanu pustego — sim zawsze ma podpięte saldo | absent — `WalletScreen.tsx:32-47` | blocks-showme | M |
| yak-49 | Side menu → Settings → Keys | §Settings 2 | missing | Wiersz jest, ekranu nie ma — klik pokazuje wyłącznie toast z etykietą. Własny tekst kreatora obiecuje "your account secret key in your settings" | `SettingsScreen.tsx:46`, `:73` | blocks-showme | M |
| yak-50 | Side menu → Settings → "Relay settings 10 / 10" | §Settings 3 | missing | Wiersz jest poprawny, ale pcha "Relay orbits" (widok eksploracji), nie `RelayUpdateView` — w symulatorze NIE MA gdzie zobaczyć, dodać ani usunąć własnego relaya | `SettingsScreen.tsx:47`, `YakiHonneSimulator.tsx:122` | blocks-showme | M |
| yak-51 | Side menu → Settings → Appearance (motyw + 6 wybieralnych akcentów) | §Settings 9 / §Brand tokens | missing | Tylko toast; brak pickera motywu (dark `#171718` / black OLED / light / cream) i `mainColorsList`, mimo że CSS sima jest tokenowy | `SettingsScreen.tsx:53`, `:73` | blocks-showme | M |
| yak-52 | Side menu → Settings → Content moderation | §Settings 4 | missing | Tylko toast — brak ekranu, a więc i list wyciszeń | `SettingsScreen.tsx:48`, `:73` | blocks-showme | M |
| yak-53 | Side menu → Settings → Customization | §Settings 6 | missing | Tylko toast (tu w realnej apce siedzi m.in. `defaultActionsArrangement` i one-tap reaction/zap) | `SettingsScreen.tsx:50`, `:73` | blocks-showme | M |
| yak-54 | Side menu → Settings → Language preferences | §Settings 8 | missing | Tylko toast | `SettingsScreen.tsx:52`, `:73` | blocks-showme | S |
| yak-55 | Side menu → Settings → Crashlytics & cache | §Settings 10 | missing | Tylko toast | `SettingsScreen.tsx:54`, `:73` | blocks-showme | S |
| yak-56 | Side menu → Settings → Yaki chest | §Settings 11 / §Gamification | missing | Wiersz i pigułka "Connect" są, ale prowadzi do Home dashboard; widoków punktów/nagród (XP, tiery Bronze→Platinum, "One-time"/"Repeated rewards", "Claim" + odliczanie) nie ma. Pigułka nigdy nie zmienia się na "Connected" | `SettingsScreen.tsx:55`, `YakiHonneSimulator.tsx:125` | blocks-showme | L |
| yak-57 | Side menu → Settings → sekcja profilu → "Edit profile" | §Settings 1 | missing | Renderowany jest tylko "View profile"; drugiego przycisku (`cardColor`) obok brak | `SettingsScreen.tsx:64-68` | blocks-showme | S |
| yak-58 | Side menu → Settings → Delete account | §Settings | partial | Przycisk wierny (czerwona ramka `#DD2222`, kosz), ale klik tylko toastuje — brak kroku potwierdzenia | `SettingsScreen.tsx:84` | none | S |
| yak-59 | Side menu → Settings → chip wersji | §Settings | dead | `property_version.dart` mówi „centered, **tappable**"; nasz chip nie ma `onClick` | `SettingsScreen.tsx:91-98` | none | S |
| yak-60 | Settings (kotwice) | §Settings | unanchored | Ekran jest osiągalny (`navigate:'settings'`) i wierny, ale nie ma ANI JEDNEGO `data-tour` — żaden krok FAQ nie wskaże Keys, Relay settings, Appearance ani Yaki chest | `SettingsScreen.tsx:70-80` | blocks-showme | S |
| yak-61 | Side menu → Relay orbits | §Relays | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. Ekran wierny (tytuł + podtytuł, 4 zakładki, empty state), ale nie ma komendy — drawer → Relay orbits to 3 przeskoki, a komendy otwarcia drawera też nie ma | `YakiHonneSimulator.tsx:115`, `screens/RelaysScreen.tsx:14` | blocks-showme | S |
| yak-62 | Side menu → Relay orbits → "Search relay" | §Relays | dead | Zrobione jako `<div>` + `<span>`, nie `input` — nie da się nic wpisać | `RelaysScreen.tsx:35-38` | breaks-showme | S |
| yak-63 | Side menu → Relay orbits → karta relaya → "Browse relay" / "Share" | §Relays | dead | Oba przyciski stopki bez handlera; `RelayFeedView` nie istnieje | `RelaysScreen.tsx:70-71` | breaks-showme | M |
| yak-64 | Side menu → Relay orbits → karta relaya → rozwijane info | §Relays | partial | Jest domena, pigułka Online/Offline, "Followed by {N}" i latencja z progami kolorów. Brakuje chipów Paid / Required authentication, awatarów obserwujących, sekcji "Favored by {N}", flagi kraju i samego rozwijania | `RelaysScreen.tsx:53-68` | blocks-showme | M |
| yak-65 | Side menu → Relay orbits → zakładka Following | §Relays | partial | Following (domyślna) zawsze pokazuje "Engage to expand", a pozostałe trzy zakładki renderują tę samą listę 4 relayów | `RelaysScreen.tsx:16-17`, `:42` | none | S |
| yak-66 | Home → Search | §Search | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. Overlay istnieje i chip go otwiera, ale żadna komenda go nie pcha | `YakiHonneSimulator.tsx:163`, `screens/SearchScreen.tsx:27` | blocks-showme | S |
| yak-67 | Search → wpisywanie zapytania | §Search | partial | Pole jest realnym `input`em ze stanem, ale wyniki nigdy się nie zmieniają — te same 10 osób dla każdego zapytania; brak spinnera w suffiksie i stanu "no results" | `SearchScreen.tsx:29`, `:37-44`, `:63` | breaks-showme | M |
| yak-68 | Search → zakładki Notes / Articles / Media | §Search | partial | Trzy zakładki treści renderują stan bezczynności "Search in Nostr" zamiast `DetailedNoteContainer` / `ArticleContainer` / `MediaGrid` | `SearchScreen.tsx:73-79` | breaks-showme | M |
| yak-69 | Search → sekcja "Interests" + przełącznik "Interested/Remove" | §Search | missing | Brak sekcji i poziomych chipów `#hashtag` na zakładce People | absent — `SearchScreen.tsx:61-79` | blocks-showme | M |
| yak-70 | Search → ikona relayów/ustawień w app barze | §Search | missing | Trailing `FeatureIcons.settings` (→ `RelayUpdateView`) nie istnieje w headerze wyszukiwarki | absent — `SearchScreen.tsx:34-46` | blocks-showme | S |
| yak-71 | DMs → wiersz konwersacji | §Bottom nav (tab 4) | dead | Każdy wiersz to `<button>` bez `onClick` — widoku rozmowy nie ma w ogóle (screen-mapa też go nie specyfikuje — patrz „do recon") | `MessagesScreen.tsx:32-44` | breaks-showme | L |
| yak-72 | DMs → FAB "New message" | §Bottom nav | dead | Brak `onClick`, a do tego **przykrywa go pomarańczowy FAB kompozytora**: `fabVisible` jest true na `dms`, oba używają klasy `.yakihonne-fab` (`right:16 / bottom:84 / z-index:55`), a TabBar jest później w DOM → przy równym z-index wygrywa on. Dodatkowo FAB DM-a jest pozycjonowany względem SCROLLUJĄCEGO roota `MessagesScreen` (`relative`), nie roota sima, więc nie jest przypięty do dołu ramki | `MessagesScreen.tsx:12`, `:49-51`, `TabBar.tsx:28-32`, `YakiHonneSimulator.tsx:239`, `yakihonne.theme.css:124-136` | breaks-showme | S |
| yak-73 | DMs → header "⋯" + selektor "Followings ▾" | §— (brak w screen-mapie) | dead | Chip bez handlera, selektor to `<span>`. Realnego zachowania screen-mapa nie opisuje — kandydat na recon | `MessagesScreen.tsx:18-19` | none | S |
| yak-74 | Notifications → filtr "All ▾" | §— (brak w screen-mapie) | dead | `<span>` ostylowany na dropdown, bez handlera | `NotificationsScreen.tsx:53` | none | S |
| yak-75 | Notifications → wiersz powiadomienia | §— (brak w screen-mapie) | dead | Wiersze to `<div>`-y; tap nie otwiera ani treści, ani profilu | `NotificationsScreen.tsx:62-74` | breaks-showme | M |
| yak-76 | Notifications → ⚙ → przełączniki powiadomień | §Notification toggles | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. Wszystkie 8 przełączników jest verbatim i działa, ale dojazd to zakładka Notifications → ⚙ = 3+ przeskoki, a żadna z tych ścieżek nie ma komendy | `NotificationSettingsScreen.tsx:15`, `YakiHonneSimulator.tsx:175`, `:135-141` | blocks-showme | S |
| yak-77 | Side menu (drawer) | §Home feed (leading) | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. Drawer otwiera wyłącznie tap w awatar; żadna komenda nie ustawia `drawerOpen`, więc nic z jego środka (My profile, Home dashboard, Bookmarks, Relay orbits, Settings) nie da się podświetlić | `YakiHonneSimulator.tsx:83`, `:226` | blocks-showme | S |
| yak-78 | Side menu → Bookmarks | §Note card ("⋯" → Bookmark) | missing | Wiersz tylko toastuje "Bookmarks"; nie ma ani listy zakładek, ani sposobu, by cokolwiek zakładkować | `YakiHonneSimulator.tsx:117` | blocks-showme | M |
| yak-79 | Side menu → Home dashboard | §Profile (A) | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. Ekran wierny (Followings/Followers/Notes/Replies, Zaps received/sent + Total amount, "Joined on", Latest, Popular notes), ale komendy brak — wchodzi się tylko tapem z drawera **albo z Settings → „Yaki chest"** (ten wiersz też pcha `dashboard`, patrz yak-56). Brak linku "See all" przy „Latest" | `YakiHonneSimulator.tsx:114`, `:125`, `DashboardScreen.tsx:31`, `:88` | blocks-showme | S |
| yak-80 | Note → Thread (widok noty) | §Note card | unreachable | Otwiera się tylko tapnięciem w kartę; komendy brak | `YakiHonneSimulator.tsx:105`, `:135-141` | blocks-showme | S |
| yak-81 | Media → kafelek | §Bottom nav (tab 2) | dead | Kafelki siatki to `<div>`-y — nic nie otwiera podglądu mediów | `MediaScreen.tsx:35-41` | breaks-showme | M |
| yak-82 | Media → selektor źródła "Media ▾" | §Bottom nav | dead | `<span>` z chevronem, bez handlera | `MediaScreen.tsx:22-24` | none | S |
| yak-83 | Home → feed selector → Recent · Recent With Replies · Trending · Global · Paid · Widgets | §Home feed | ok | Sześć etykiet w poprawnej kolejności, Recent domyślny, wybór realnie przełącza feed | `FeedSelector.tsx:6-13`, `YakiHonneSimulator.tsx:80`, `:230` | none | — |
| yak-84 | Bottom nav (5 zakładek, ikony bez etykiet) | §Bottom nav | ok | Kolejność Home·Media·Wallet·DMs·Notifications, aktywna = wariant filled + kropka 4px w kolorze `primaryColorDark` (NIE pomarańcz), FAB osobny i pomarańczowy | `TabBar.tsx:18-51` | none | — |
| yak-85 | Note → action bar (react · reply · repost · quote · zap + translate/⋯) | §Note card | ok | Kolejność poprawna, domyślna reakcja to SERCE, zap pokazuje sumę satów (`abbrev`), a karta artykułu poprawnie **gubi repost** | `NoteCard.tsx:122-145`, `ArticleCard.tsx:56-62` | none | — |
| yak-86 | Notifications → ⚙ → 8 przełączników | §Notification toggles | ok | Kolejność i stringi verbatim, przełączniki trzymają stan (osiągalność zgłoszona jako yak-76) | `NotificationSettingsScreen.tsx:4-13`, `:31-36` | none | — |
| yak-87 | Search → People → wiersz osoby | §Search | ok | Weryfikacja NIP-05 zakodowana KOLOREM (validated = czerwony `#FF4A4A`, reszta szara), bez ptaszka, bez przycisku follow, "NewsBot" tylko w nazwie | `SearchScreen.tsx:64-71` | none | — |
| yak-88 | Landing → "Log in" → karty Keys / Remote signer | §Login | ok | Karty przypięte do DOLNEJ krawędzi, zaznaczenie = wyłącznie 1.5px pomarańczowa ramka (fill bez zmian); QR white-on-black, dashed `nostrconnect://`, pole `bunker://`. Świadome odstępstwo: `keySafety` zamiast realnego placeholdera | `SignInScreen.tsx:147-154`, `:160-182` | none | — |
| yak-89 | Compose (arkusz) | §Compose | ok | Bottom sheet z grabberem, X na szarym kółku, tytuł "Compose", Send = papierowy samolot na pomarańczowym kółku; osiągalny `{login},{compose}`, zakotwiczony `yakihonne-post` (martwota toolbara → yak-30) | `ComposeSheet.tsx:29-50` | none | — |
| yak-90 | Wallet (kotwice) | §Wallet | unanchored | Osiągalny `{login},{navigate:'wallet'}`, ale ani karta salda, ani Receive/Send, ani lista transakcji nie mają `data-tour` | `WalletScreen.tsx:32-96` | blocks-showme | S |
| yak-91 | Bottom nav → poszczególne przyciski zakładek | §Bottom nav | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Tylko Home ma `data-tour` — i to zduplikowany `yakihonne-feed` (kolizja z rootem HomeScreen); Media/Wallet/DMs/Notifications nie mają czego podświetlić | `TabBar.tsx:42` | blocks-showme | S |
| yak-92 | Compose → Send (papierowy samolot) przy pustym polu | §Compose | dead | `onClick={() => canPost && onPost(text)}` — Send jest no-opem, dopóki nie wpiszesz tekstu, a przycisk **nie ma stanu wyłączonego** (`opacity-90` czyta się jak aktywny, kolor pełny pomarańcz). Każdy `showMe` na `yakihonne-post` z komendami `{login},{compose}` montuje PUSTY kompozytor → spotlight na kontrolce, w którą użytkownik kliknie w pustkę. Dokładnie to robi krok 4 istniejącego toura | `ComposeSheet.tsx:43`, `:46`, `YakiHonneSimulatorWithTour.tsx:69` | breaks-showme | S |
| yak-93 | Profil CUDZEGO użytkownika (rząd akcji z „Follow") | §Profile | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. `viewProfile` i `navigate:'profile'` **ignorują payload** i zawsze montują `SELF`, więc komendą nie da się otworzyć cudzego profilu. Skutek: kotwica `yakihonne-follow` w demo zawsze pokazuje „Edit profile", nigdy „Follow" (i tak martwe — yak-32), a cały wątek FAQ „jak kogoś obserwować" nie ma czego pokazać. Cudzy profil otwiera wyłącznie tap w awatar w feedzie/wyszukiwarce | `YakiHonneSimulator.tsx:138`, `:150`, `:103`, `ProfileScreen.tsx:54-56` | blocks-showme | S |
| yak-94 | Home → feed "Trending" (feed artykułów) jako powierzchnia | §Articles | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. Żadna komenda nie ustawia `source` — jedyny w symulatorze widok long-formu (`ArticleCard`) wymaga tapnięcia w selektor feedu i wyboru "Trending". Dla klienta, którego sygnaturą są artykuły, blokuje to całą kategorię FAQ (a razem z nią jedyne wejście do yak-29) | `YakiHonneSimulator.tsx:80`, `:135-141`, `HomeScreen.tsx:26` | blocks-showme | S |
| yak-95 | Note → Reply → kontekst "Replying to" | §Compose | partial | `openReply()` nie przyjmuje żadnego argumentu — odpowiedź z DOWOLNEJ karty (feed, wątek, profil) otwiera kompozytor z tym samym zaszytym cytatem „Maria2000" / `homeNotes[0]` i datą „On Jul 14 2026, 3:07PM". Demo pokaże cudzą notatkę zamiast tej, w którą użytkownik kliknął | `YakiHonneSimulator.tsx:107`, `NoteCard.tsx:129`, `ComposeSheet.tsx:54-66` | breaks-showme | S |
| yak-96 | (cały klient) FAQ „Show me" → symulator | — | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: missing. **Nie ma mostka FAQ.** Wrapper nie importuje ani nie renderuje `FaqMiniTourLauncher`, nie ma `faqCommandsRef` ani gałęzi `isFaqStepId` w `onStepChange`, a `src/data/faq/index.ts` nie mapuje `yakihonne`. `SHOW_FAQ_EVENT` poleci więc w próżnię i **żaden** `showMe` z tego pliku nie zadziała — warunek konieczny dla każdego innego wiersza `blocks-showme`. Wzorzec do skopiowania: `src/simulators/damus/DamusSimulatorWithTour.tsx:9,22,74,92-98,147` | `YakiHonneSimulatorWithTour.tsx` (brak `FaqMiniTourLauncher`) · `src/data/faq/index.ts:4-6` | blocks-showme | S |

## Anchors — `data-tour` obecne w symulatorze

| Selector | Plik:linia | Powierzchnia |
|---|---|---|
| `yakihonne-keys` | `screens/LoginScreen.tsx:32` | Root landingu onboardingu (cały ekran, nie pole klucza) — po zalogowaniu nie do odzyskania (yak-01) |
| `yakihonne-feed` | `screens/HomeScreen.tsx:29` | Root ekranu Home (app bar + feed) — **pierwszy w DOM, to on wygrywa** |
| `yakihonne-feed` | `components/TabBar.tsx:42` | Przycisk zakładki Home — **duplikat selektora**, nieosiągalny dla `querySelector` (yak-91) |
| `yakihonne-feedsel` | `components/FeedSelector.tsx:35` | Trigger selektora feedu w app barze (nie sam arkusz — yak-13) |
| `yakihonne-profile` | `screens/HomeScreen.tsx:33` | Awatar/hamburger w app barze Home — **pierwszy w DOM** |
| `yakihonne-profile` | `screens/ProfileScreen.tsx:41` | Root overlaya Profile — **duplikat, nigdy nie trafiony** (yak-40) |
| `yakihonne-follow` | `screens/ProfileScreen.tsx:54` | Przycisk Follow / Edit profile — **martwy** (yak-32) |
| `yakihonne-compose` | `components/TabBar.tsx:29` | Pomarańczowy FAB (montowany tylko gdy `fabVisible`) |
| `yakihonne-post` | `screens/ComposeSheet.tsx:45` | Przycisk Send w arkuszu Compose |
| `yakihonne-interactions` | `components/NoteCard.tsx:122` | Cały rząd akcji noty — **powtarza się na każdej karcie** (6 w feedzie), `querySelector` bierze pierwszą |
| `yakihonne-zaps` | `components/NoteCard.tsx:138` | Przycisk zapa — również powtarzalny per karta |

**9 unikalnych selektorów / 11 wystąpień.** Zero kotwic ma: Settings, Wallet, Relay orbits, Search, Home dashboard, Notification settings, Drawer, Thread, Article reader, Media, DMs, Notifications, oba ekrany auth poza landingiem.

## Reachability — komendy toura

**Union:** `type: 'login' | 'navigate' | 'compose' | 'post' | 'viewProfile'` (`YakiHonneSimulator.tsx:32-35`),
payloady tylko dla `navigate`: `'feed' | 'home' | 'profile' | 'settings' | 'wallet'` (`:135-141`; każda inna
wartość to cichy no-op). Bridge: `YakiHonneSimulator.tsx:129-155`; kolejka: `YakiHonneSimulatorWithTour.tsx:23-53`
(**pewnie obsługuje ≤ 2 komendy na krok** — mapa kroków `:64-75` już to respektuje).

| Powierzchnia | Osiągalna komendą? | Czym |
|---|---|---|
| Home feed (notatki) | tak | `{login}` + `{navigate:'feed'}` |
| Compose (arkusz) | tak | `{login}` + `{compose}` (pcha overlay na stos) |
| Profil (własny) | tak | `{login}` + `{viewProfile}` lub `{navigate:'profile'}` — payload ignorowany, zawsze SELF (yak-93) |
| Settings | tak | `{login}` + `{navigate:'settings'}` (podmienia stos overlayów) |
| Wallet | tak | `{login}` + `{navigate:'wallet'}` |
| Toast "Note published" | tak | `{login}` + `{post}` — **samo `{post}` nie wystarczy**: toast żyje w gałęzi `authed`, a `post` nie loguje. Znika po 2.4 s, więc spotlight na nim jest nietrwały |
| Articles / Trending feed | **nie** | brak komendy na `setSource` (yak-94) |
| Media · DMs · Notifications | **nie** | `navigate` nie zna tych payloadów (yak-17) |
| Drawer | **nie** | brak komendy na `drawerOpen` (yak-77) |
| Arkusz źródeł feedu | **nie** | brak komendy na `sourceSheetOpen` (yak-13) |
| Search | **nie** | overlay pchany tylko z app baru (yak-66) |
| Thread | **nie** | tylko tap w kartę (yak-80) |
| Article reader | **nie** | wymaga Trending + tap (yak-29) |
| Relay orbits | **nie** | tylko drawer → wiersz = 3 przeskoki (yak-61) |
| Home dashboard | **nie** | tylko drawer → wiersz (yak-79) |
| Notification settings | **nie** | zakładka Notifications → ⚙ = 3+ przeskoki (yak-76) |
| Profil cudzego użytkownika | **nie** | `viewProfile` ma zaszyte `SELF` (yak-93) |
| Landing / Sign in / Create account | **nie** (po zalogowaniu) | brak `logout`; landing tylko jako stan startowy — z zimnego sima `commands: []` jeszcze go zastanie (yak-01/02/03) |

## Poza zakresem / do recon

Screen-mapa tego nie pokrywa, więc nie da się orzec luki — kandydaci na kolejny recon:

- **Widok konwersacji DM** i cały ekran DMs poza samą zakładką w bottom navie (screen-mapa opisuje tylko
  badge i „long-press = mark all read"). Nasze wiersze/FAB są martwe (yak-71/72/73), pasek „Search by
  username" jest atrapą (`<div>` + `<span>`, `MessagesScreen.tsx:22-27`) — ale nie wiadomo, jak wygląda
  realny wątek, kompozytor DM-a ani selektor „Followings", więc nie ma wobec czego orzec luki.
- **Lista Notifications** — screen-mapa ma sekcję *przełączników* powiadomień, ale nie samego ekranu.
  Nasz feed pokazuje wyłącznie publikacje (smart widget / video / curation / article), a przełączniki
  sugerują też mentions/replies/reactions/reposts/zaps/DM — nie da się tego potwierdzić bez recon
  (dotyczy yak-74/75).
- **`RelayUpdateView`** — cel wiersza „Relay settings {N / M}" i ikony w app barze Search. Screen-mapa
  nazywa widok, ale nie opisuje jego zawartości (dodawanie/usuwanie relaya, read/write, N/M) → yak-50
  filujemy jako brak ścieżki, ale kształt ekranu wymaga recon.
- **`MainViewDrawer` po zalogowaniu** — screen-mapa opisuje tylko drawer GOŚCIA (YakiHonne / Articles /
  Explore / Relay orbits / Settings + „Login ⇥", t_032). Nasze 5 wierszy (My profile / Home dashboard /
  Bookmarks / Relay orbits / Settings) jest częściowo zgadywane — recon przed dokładaniem czegokolwiek.
- **Smart widgets** (`lib/views/smart_widgets_view/`) — screen-mapa oznacza layout jako (UNVERIFIED),
  a źródło feedu „Widgets" istnieje w naszym selektorze i renderuje zwykłe notatki.
- **Ekran Keys** (Settings → Keys) — sama istnienie potwierdzone (`keys.svg`, tekst kreatora o secret key),
  ale zawartości screen-mapa nie podaje (yak-49).

**Nie-luki (świadoma wierność / świadome odstępstwa) — nie zgłaszać:**
`keySafety` zamiast realnego placeholdera „npub, nsec or hex" (bezpieczeństwo, §Login ⚠) ·
brak „Amber" na ekranie logowania (Android-only, registry montuje ramkę **ios**) ·
FAB widoczny na DMs i ukryty na feedzie Trending ([REC vs REPO], `YakiHonneSimulator.tsx:237-239`) ·
aktywna zakładka NIE jest pomarańczowa · brak repostu na pasku artykułu ·
brak ptaszka weryfikacji w wynikach Search · wersja `v1.9.8+179` z nagrania zamiast repo `v2.0.5+189` ·
cap ~25 notatek w feedzie. **Znany nit z CLAUDE.md („FAB nachodzi na action row w ArticleReader") jest
nieaktualny:** FAB nie renderuje się przy otwartym overlayu (`YakiHonneSimulator.tsx:202`) ani na feedzie
Trending (`:239`).
