# Keychat — gap ledger

> Ground truth: **brak `docs/refs/keychat/screen-map.md`** — jedyne cytowalne źródła to
> `docs/FIDELITY.md:183-188` (sekcja „Keychat — cross-platform") i `src/registry.tsx:141-142`
> (`status: 'preview'` + „Brand and layout not yet verified against the real client.").
> Sim: `src/simulators/keychat/`
> Audited: 2026-08-05 · Registry status: preview · Sim LOC: 1580

**Jak czytać kolumnę §** (nie ma screen-mapy, więc nie ma numerów sekcji):
`FID` = punkt „Nav / killer" w `docs/FIDELITY.md:186` · `FID-tok` = `docs/FIDELITY.md:184-185` ·
`reg` = statusNote w `src/registry.tsx:142` · `—` = brak ground truth po stronie realnej apki; wiersz
opiera się **wyłącznie** na tym, że kontrolka w symulatorze renderuje się i nie robi nic (martwy
`onClick`, chevron bez celu, toggle, którego nikt nie czyta). Wierszy typu „realna apka ma X"
**nie ma**, jeśli X nie stoi w FIDELITY.md — takie rzeczy są na liście recon na dole.
Wyjątek: key-35, key-36 i key-42 dotyczą **warstwy komend / mostka FAQ**, gdzie ground truth to nasz
własny kontrakt (`src/data/faq/types.ts:19-25`, wzorzec `DamusSimulatorWithTour.tsx`), a nie realna apka.

## Rollup

| missing | dead | partial | unreachable | unanchored | ok |
|---|---|---|---|---|---|
| 6 | 18 | 8 | 3 | 3 | 5 |

**Top 3 do zrobienia:** key-42 · key-05 · key-28
(zaraz za nimi: key-25/key-02 — cała zakładka Apps to plakat.)

> **Aktualizacja 2026-08-08.** key-35 zamknięty (kroki 5-6 toura docierają już do pokoju rozmowy).
> key-34 **zostaje otwarty**: fala 2 dodała komendę wylogowania w krokach logowania sześciu klientów,
> ale Keychata pominęła — jego unia komend nie zna `logout`, więc krok 2 wciąż wysyła `{type:'back'}`,
> które czyści wyłącznie `selectedChat`. Fix jest ten sam co dla key-05.

Kontekst: 43 wiersze, ale pierwszy hamulec jest jeden i tani — **nie ma mostka FAQ** (key-42), więc
dziś żaden `showMe` nie zadziała, nawet dla 14 istniejących kotwic. Zaraz za nim: **z sesji nie ma
wyjścia** (brak komendy `logout`, key-05 + key-32), co wycina całą kategorię „Getting started" i
psuje wszystkie kotwice ekranu logowania (key-38).

## Gaps

| ID | Surface (ścieżka w UI) | § | Status | Gap | Evidence | FAQ impact | Effort |
|---|---|---|---|---|---|---|---|
| key-01 | Dolny pasek zakładek (Chats / Wallet / Apps / Settings) | FID | partial | Realna apka to **3-tab CupertinoTabBar: Chats / Browser / Me**; my mamy 4 zakładki Material, promujemy Wallet do zakładki, a Settings stoi w miejscu „Me" | `components/BottomNav.tsx:11-49` vs `docs/FIDELITY.md:186` | breaks-showme | M |
| key-02 | Dolny pasek → zakładka **Browser** (przeglądarka mini-appów) | FID | missing | Nie ma żadnej powierzchni przeglądarki — ani paska URL, ani webview, ani hosta mini-appa. Zakładka „Apps" to statyczna kratka launchera | absent — `components/BottomNav.tsx:11-49` (brak wpisu) + `screens/MiniAppsScreen.tsx:50-101` | blocks-showme | L |
| key-03 | Dolny pasek → zakładka **Me** → ekran profilu | FID | missing | Ekran profilu nie istnieje. Jedyna powierzchnia profilu to statyczna karta w Settings (awatar + `npub1...8x2k` + „Verified via NIP-05"), bez podglądu, bez edycji | absent — `screens/SettingsScreen.tsx:105-132` to cały „profil" | blocks-showme | M |
| key-04 | Login → „Create New Account" → wygenerowany nsec / seed | FID | missing | Realny onboarding tworzy nsec/seed. U nas „Create New Account" po 1,5 s spinnera wrzuca prosto na listę czatów — **żaden klucz ani seed nigdy się nie pokazuje**, mimo że kotwica nazywa się `keychat-generate-keys` | `screens/LoginScreen.tsx:54-60,118-124` | blocks-showme | M |
| key-05 | Powrót na ekran logowania (wylogowanie) | — | unreachable | Po zalogowaniu nie ma drogi powrotnej: unia komend nie zna `logout`, a `back` czyści tylko `selectedChat`. Ekran `keychat-login` da się pokazać wyłącznie na świeżym montażu symulatora | `KeychatSimulator.tsx:23-26` (unia), `:100-102` (`back`) | blocks-showme | S |
| key-06 | Chats → nagłówek → lupa (szukaj) | — | dead | Brak `onClick`; rodzic (`div` w `:66`) też go nie ma. Nie ma ekranu wyszukiwania | `screens/ChatListScreen.tsx:67-71` | breaks-showme | M |
| key-07 | Chats → nagłówek → „+" (nowy czat / dodaj kontakt) | — | dead | Brak `onClick`. Nie ma pickera kontaktów, dodania po npub ani skanera QR | `screens/ChatListScreen.tsx:72-76` | breaks-showme | M |
| key-08 | Chats → dowolny wiersz poza pierwszym → pokój | — | partial | Wszystkie pięć wierszy otwiera **ten sam** pokój 1:1 zahardkodowany na „Alice" z tymi samymi pięcioma wiadomościami; `chatId` wpływa tylko na seed awatara. Dwa wiersze `isGroup` (Nostr Group, Bitcoin Dev Chat) nigdy nie pokazują czatu grupowego | `screens/ChatRoomScreen.tsx:10-46` (stały `mockMessages`), `:92` (jedyne użycie `chatId`), `:97` (twarde „Alice") | breaks-showme | M |
| key-09 | Chats → licznik nieprzeczytanych po otwarciu rozmowy | — | partial | `mockChats` to stała modułowa, nigdy nie mutowana — po wejściu w czat Alice i powrocie badge dalej pokazuje „3". Arguable: realnego zachowania nie da się zacytować, ale licznik, który nigdy nie znika, jest jawnym no-opem | `screens/ChatListScreen.tsx:9-57,123-127` | none | S |
| key-10 | Chat → nagłówek → ⋮ (menu pokoju) | — | dead | Brak `onClick`. Nie ma ustawień pokoju, wyciszenia, opuszczenia ani przełącznika trybu szyfrowania | `screens/ChatRoomScreen.tsx:107-111` | breaks-showme | M |
| key-11 | Chat → nagłówek → badge trybu szyfrowania | FID | partial | FIDELITY wymienia **badge trybu szyfrowania per-room** jako sygnaturę. U nas to statyczny napis „Signal Protocol" identyczny w każdym pokoju — nie badge, nie klikalny, nie pokazuje trybu | `screens/ChatRoomScreen.tsx:98-103` vs `docs/FIDELITY.md:186` | blocks-showme | M |
| key-12 | Chat → pasek pisania → „+" (załącznik) | — | dead | Brak `onClick` — a **shipowany tour wprost go opowiada** („You can also attach images … using the attachment and Bitcoin buttons") | `screens/ChatRoomScreen.tsx:151-155`, narracja `src/data/tours/keychat-tour.ts:56` | breaks-showme | M |
| key-13 | Chat → pasek pisania → emoji | — | dead | Brak `onClick`; nie ma pickera emoji ani reakcji na wiadomość | `screens/ChatRoomScreen.tsx:157-161` | breaks-showme | M |
| key-14 | Chat → pasek pisania → przycisk satów (wyślij saty w czacie) | — | dead | Brak `onClick`; nie ma arkusza płatności w rozmowie, choć tour go opowiada tym samym zdaniem co key-12 | `screens/ChatRoomScreen.tsx:175-179`, `src/data/tours/keychat-tour.ts:56` | breaks-showme | M |
| key-15 | Chat → „Red Pocket" (czerwona koperta) | FID | missing | FIDELITY nazywa Red Pocket sygnaturą Keychata. W symulatorze nie ma jej nigdzie — pasek pisania to tylko „+", emoji, saty i wyślij | absent — `screens/ChatRoomScreen.tsx:149-197`; grep `red pocket` w `src/simulators/keychat/` = 0 | blocks-showme | L |
| key-16 | Chat → ecash „stamps" (koszt wiadomości) | FID | missing | „Szyfrowany czat kosztujący ecash »stamps«" to udokumentowany haczyk super-appa. Nigdzie nie ma kosztu stampa, obciążenia salda ani UI stampów — ani w pokoju, ani w portfelu | absent — `screens/ChatRoomScreen.tsx`, `screens/WalletScreen.tsx`; grep `stamp` (poza `timestamp`) = 0 | blocks-showme | L |
| key-17 | Chat → strzałka wstecz / przycisk wyślij | — | unanchored | Obie kontrolki działają (wstecz woła `onBack`, wyślij dokleja wiadomość), ale żadna nie ma `data-tour` — w pokoju zakotwiczone są tylko root i pole tekstowe | `screens/ChatRoomScreen.tsx:81-88,183-193` (brak `data-tour`) | blocks-showme | S |
| key-18 | Chat → trwałość wysłanej wiadomości | — | partial | `handleSend` dokłada wiadomość do lokalnego `useState`; wyjście z pokoju odmontowuje ekran i wątek wraca do pięciu mocków, a podgląd/„timestamp" na liście czatów nigdy się nie aktualizuje | `screens/ChatRoomScreen.tsx:49,61-74` + `KeychatSimulator.tsx:180-184` (warunkowy montaż) | none | S |
| key-19 | Wallet → przełącznik Ecash / Bitcoin | — | dead | `activeTab` jest czytany **wyłącznie** do podbarwienia dwóch pigułek; saldo, rząd akcji i lista aktywności są identyczne w obu trybach | `screens/WalletScreen.tsx:5,39-55` vs saldo `:31` i lista `:98-102` | breaks-showme | M |
| key-20 | Wallet → Send | — | dead | Brak `onClick`; nie ma wklejenia invoice/tokena, pola kwoty ani potwierdzenia | `screens/WalletScreen.tsx:73-80` | breaks-showme | M |
| key-21 | Wallet → Zap | — | dead | Brak `onClick` | `screens/WalletScreen.tsx:82-89` | breaks-showme | M |
| key-22 | Wallet → nagłówek → koło zębate (ustawienia portfela / mennice) | — | dead | Brak `onClick`. Nie ma zarządzania mennicami Cashu, mimo że FIDELITY wskazuje `packages/keychat_ecash` jako portfel, a Settings pokazuje „Default Mint · mint.keychat.io" (też martwe — key-28) | `screens/WalletScreen.tsx:15-20` | breaks-showme | M |
| key-23 | Wallet → Receive → arkusz | — | partial | Arkusz otwiera się i zamyka (backdrop + „Done"), ale QR to trzy dekoracyjne prostokąty SVG, tytuł brzmi „Receive Bitcoin" nawet na zakładce Ecash, i nie ma pola kwoty, ciągu invoice/tokena ani przycisku kopiowania. Dodatkowo scrim jest `fixed inset-0`, a **ścieżka z ramką nie tworzy containing blocku** (`transform` ma tylko wariant web, `host/ClientView.tsx:455-458`) → arkusz **wychodzi poza telefon i zakrywa hosta**; spotlight FAQ podświetliłby wtedy całą stronę | `screens/WalletScreen.tsx:152-191` (QR `:173-178`, scrim `:159`) | breaks-showme | M |
| key-24 | Wallet → karta salda / wiersze „Recent Activity" | — | unanchored | Karta salda i cztery wiersze transakcji renderują się poprawnie, ale poniżej roota ekranu nie ma żadnego `data-tour`; wiersze to `motion.div` bez klikalności (brak szczegółów transakcji) | `screens/WalletScreen.tsx:24-35,104-147` (jedyna kotwica: `:10`) | blocks-showme | S |
| key-25 | Apps → dowolny kafelek aplikacji | — | dead | Sześć `motion.button` (Nostr Market, Chess, Nostrgram, Wikistr, Zap Poll, BTC Map) **bez `onClick`** — nic się nie uruchamia, nie ma hosta mini-appa. Cała zakładka jest plakatem | `screens/MiniAppsScreen.tsx:5-48,69-81` | breaks-showme | L |
| key-26 | Apps → nagłówek → lupa | — | dead | Brak `onClick` | `screens/MiniAppsScreen.tsx:56-60` | breaks-showme | M |
| key-27 | Apps → baner „Build Your Own App" → „Get Started" | — | dead | Brak `onClick` | `screens/MiniAppsScreen.tsx:96-98` | breaks-showme | S |
| key-28 | Settings → dowolny wiersz z chevronem (Backup Keys / Privacy Settings / Message Preview / Theme Color / Default Mint / Transaction History) | — | dead | Każdy element `type: 'link'` renderuje się jako `div` z chevronem i **bez żadnego handlera** — sześć wierszy, zero celów. Backup Keys jest szczególnie bolesny: to jedyna ścieżka do klucza, a klucza nie ma też w onboardingu (key-04) | `screens/SettingsScreen.tsx:148-181` (renderer), pozycje `:35,40,57,74,84,90` | breaks-showme | L |
| key-29 | Settings → Appearance → Dark Mode | — | dead | Toggle przełącza własną pigułkę i nic więcej — `darkMode` nie jest nigdzie czytany; motyw symulatora bierze się z hosta przez `useParentTheme` | `screens/SettingsScreen.tsx:19,66-71` vs `KeychatSimulator.tsx:37,153-156` | breaks-showme | S |
| key-30 | Settings → Privacy & Security → End-to-End Encryption · Notifications → Push Notifications | — | dead | Oba toggle'e przełączają się wizualnie, a `encryption`/`notifications` nie są czytane przez nic poza własnym renderem. Arguable: globalny wyłącznik E2EE jest prawdopodobnie **wymyślony** (upstream szyfruje Signal Protocolem z definicji) — przed „naprawą" zrób recon | `screens/SettingsScreen.tsx:18,20,26-32,48-54,158-170` | breaks-showme | S |
| key-31 | Settings → karta profilu → chevron | — | dead | Brak `onClick`, a i tak nie ma ekranu, który mógłby się otworzyć (key-03) | `screens/SettingsScreen.tsx:126-130` | breaks-showme | M |
| key-32 | Settings → Log Out | — | dead | Brak `onClick`. Razem z key-05 oznacza to, że z sesji nie ma wyjścia żadną drogą — ani klikiem, ani komendą | `screens/SettingsScreen.tsx:194-196` | breaks-showme | S |
| key-33 | Settings → pojedyncze grupy i wiersze | — | unanchored | `data-tour` jest tylko na roocie ekranu; `showMe` o „Backup Keys" albo „Default Mint" nie ma czego podświetlić mniejszego niż cały ekran | `screens/SettingsScreen.tsx:98` (jedyna kotwica w pliku) | blocks-showme | S |
| key-34 | Tour → krok 2 „Sovereign Identity" (cel `keychat-login`) | — | unreachable | Krok wysyła `{type:'back'}` z komentarzem „ensure not authenticated", ale `back` czyści wyłącznie `selectedChat`. Jeśli zwiedzający zdążył się zalogować, krok celuje w węzeł, którego nie ma w DOM | `KeychatSimulatorWithTour.tsx:70-71` + `KeychatSimulator.tsx:100-102` | breaks-showme | S |
| key-35 | Tour → kroki 5 i 6 („Encrypted Messaging" / „Send a Message") | — | ok | **Zamknięte 2026-08-08 (fala 2 tourów).** Poprzednio: unreachable. Mapa kroków kolejkowała **trzy** komendy (`login` + `navigate` + `selectChat`), a kolejka niesie dokładnie dwie — trzecia nie była wysyłana nigdy (deterministyczny drop, nie loteria), więc oba kroki celowały w kotwice, których nie było w DOM. Zastosowano obejście, które ten wpis sam rekomendował: listy skrócone do `login` + `selectChat`, bo `chats` to i tak zakładka domyślna, a `selectedChat` ma pierwszeństwo w gałęzi renderującej. Zweryfikowane na żywo: krok 5 podświetla plakietkę „Signal Protocol" w zamontowanym pokoju | `KeychatSimulatorWithTour.tsx:77-79` (2 komendy) · `KeychatSimulator.tsx:35` (default `'chats'`) | none | S |
| key-36 | Dowolna powierzchnia osiągana **drugą** komendą, gdy krok się zmieni w trakcie | — | partial | Kolejka **nie kasuje uzbrojonych timerów**: `handleCommandHandled` uzbraja `setTimeout(…,100)` z *przechwyconą* kolejką, a `queueCommands` tylko nadpisuje stan. Szybkie „Next" (albo mini-tour FAQ z kilkoma krokami) → timer starego kroku odpala jego drugą komendę **po** komendzie nowego kroku i przestawia sim na poprzednią zakładkę. Damus ma na to `pendingTimersRef`/`clearPendingTimers` (`src/simulators/damus/DamusSimulatorWithTour.tsx:23-31,62,69`) — tu tego nie ma. *Skorygowane:* w obrębie **jednego** kroku dwie komendy jadą niezawodnie (baza zeruje `tourCommand` w tym samym batchu, więc ta sama komenda nie wykonuje się dwa razy) | `KeychatSimulatorWithTour.tsx:28-41,44-53` + `KeychatSimulator.tsx:60-107` | breaks-showme | S |
| key-37 | Dolny pasek → przełączanie zakładek | — | ok | Cztery zakładki działają, każda ma własną kotwicę `keychat-nav-<tab>`, każda jest osiągalna komendą `navigate` | `components/BottomNav.tsx:55-80` + `KeychatSimulator.tsx:86-92` | none | — |
| key-38 | Login → pole klucza + „Import Key" | — | unreachable | Same kontrolki są w porządku: pole zakotwiczone (`keychat-import-key`), przycisk gated na ≥10 znaków, wejście wyglądające na prawdziwy nsec odrzucane i czyszczone (`keySafety`). Ale **nie są osiągalne komendą** — jak cały `LoginScreen` żyją tylko do pierwszego zalogowania (key-05), a sim **nie remontuje się** między wpisami FAQ w jednej sesji: pierwszy `showMe`, który zaloguje, kasuje te kotwice do końca wizyty. Damus rozwiązuje to `{type:'logout'}` w showMe „sign-in" (`src/data/faq/damus.ts:60`) | `screens/LoginScreen.tsx:23-31,62-71,136-153`; brak `logout` w unii `KeychatSimulator.tsx:23-26` | blocks-showme | S |
| key-39 | Chats → pierwszy wiersz → pokój rozmowy | — | ok | Wiersz zakotwiczony (`keychat-chat-item`), klik montuje `ChatRoomScreen`, powrót działa; osiągalne dwiema komendami (`login` + `selectChat`) | `screens/ChatListScreen.tsx:84-91` + `KeychatSimulator.tsx:94-98,180-184` | none | — |
| key-40 | Chat → napisz i wyślij wiadomość | — | ok | Pole zakotwiczone (`keychat-message-input`), Enter i przycisk wysyłają, bąbelek dokleja się i lista scrolluje (trwałość → key-18) | `screens/ChatRoomScreen.tsx:57-74,164-172` | none | — |
| key-41 | Rooty czterech ekranów (Chats / Wallet / Apps / Settings) | — | ok | Każdy ma `data-tour` i jest osiągalny parą `login` + `navigate:<tab>` — to jest ta część symulatora, na której `showMe` może stać (po key-42) | `screens/ChatListScreen.tsx:61`, `screens/WalletScreen.tsx:10`, `screens/MiniAppsScreen.tsx:51`, `screens/SettingsScreen.tsx:98` | none | — |
| key-42 | (cały klient) FAQ „Show me" → symulator | — | missing | **Nie ma mostka FAQ.** Wrapper nie importuje/nie renderuje `FaqMiniTourLauncher`, nie ma `faqCommandsRef` ani gałęzi `isFaqStepId`, a `handleStepChange(stepIndex)` bierze **tylko indeks** (ignoruje drugi argument `step`, który `TourWrapper` podaje) i mapuje komendy WYŁĄCZNIE po indeksie kroku głównego touru. Skutek podwójny: `SHOW_FAQ_EVENT` nie ma słuchacza (klik „Show me" nic nie robi, po cichu), a gdyby launcher dodać bez gałęzi `isFaqStepId`, kroki mini-touru trafiłyby w mapę głównego touru (krok 1 → `{type:'back'}`). Dopóki tego nie ma, **żaden** `showMe` nie zadziała, nawet dla tych jedenastu powierzchni, które są i zakotwiczone, i osiągalne. Drugi, niezależny warunek: `src/data/faq/index.ts:4-6` mapuje dziś **wyłącznie** `damus`. Wzorzec do skopiowania: `src/simulators/damus/DamusSimulatorWithTour.tsx:9,22` (import+ref), `:73-77` (`handleFaqLaunch`), `:92-98` (gałąź), `:147` (`<FaqMiniTourLauncher>`) | `KeychatSimulatorWithTour.tsx:6-10,56,67-88,96-113` (brak launchera i mapy step-id→commands); `src/components/tour/TourWrapper.tsx:24,97` (podaje `(stepIndex, step)`); `src/components/faq/FaqMiniTourLauncher.tsx:28,76-81` | blocks-showme | S |
| key-43 | Settings → karta profilu → tożsamość zalogowanej sesji | — | partial | Logowanie **generuje** użytkownika (losowy `npub1…`, awatar seedowany tym npubem), ale `currentUser` w bazie jest tylko zapisywany i **nigdzie nie czytany** (grep `currentUser` = 1 trafienie, sama deklaracja) — żaden ekran nie dostaje go w propsach. Karta w Settings pokazuje na sztywno `npub1...8x2k`, awatar `seed=keychat` i **„Verified via NIP-05"**, czego w tej sesji nikt nie ustawiał. FAQ „gdzie mój npub / czy jestem zweryfikowany" podświetli dane niezwiązane z kontem, które właśnie założyliśmy | `KeychatSimulator.tsx:51` (stan bez czytelnika), `:138-146` (login), `screens/LoginScreen.tsx:34-52`; karta `screens/SettingsScreen.tsx:111-124`, `SettingsScreen()` bez propsów `:17` | breaks-showme | S |

## Anchors — `data-tour` obecne w symulatorze

| Selector | Plik:linia | Powierzchnia |
|---|---|---|
| `keychat-login` | `screens/LoginScreen.tsx:74` | Ekran logowania → cały kontener (gradient + panel akcji) |
| `keychat-generate-keys` | `screens/LoginScreen.tsx:121` | Logowanie → przycisk „Create New Account" (**żadnych kluczy nie pokazuje** — key-04) |
| `keychat-import-key` | `screens/LoginScreen.tsx:142` | Logowanie → pole „nsec1…" (nie przycisk „Import Key") |
| `keychat-chat-list` | `screens/ChatListScreen.tsx:61` | Chats → cały ekran (nagłówek + lista) |
| `keychat-chat-item` | `screens/ChatListScreen.tsx:91` | Chats → **tylko pierwszy wiersz** (`index === 0`, Alice); wiersze 2–5 są bez kotwicy |
| `keychat-chat-lock` | `screens/ChatListScreen.tsx:104` | Chats → zielona plakietka kłódki **na pierwszym wierszu** (ten sam warunek `index === 0`) |
| `keychat-chat-room` | `screens/ChatRoomScreen.tsx:77` | Pokój rozmowy → cały ekran |
| `keychat-chat-encryption` | `screens/ChatRoomScreen.tsx:99` | Pokój → nagłówek „🔒 Signal Protocol" |
| `keychat-message-input` | `screens/ChatRoomScreen.tsx:172` | Pokój → pole „Message…" (nie przycisk wyślij — key-17) |
| `keychat-wallet` | `screens/WalletScreen.tsx:10` | Wallet → cały ekran |
| `keychat-wallet-actions` | `screens/WalletScreen.tsx:62` | Wallet → karta Send / Receive / Scan |
| `keychat-apps` | `screens/MiniAppsScreen.tsx:51` | Mini Apps → cały ekran |
| `keychat-apps-grid` | `screens/MiniAppsScreen.tsx:68` | Mini Apps → sama siatka kafelków (bez nagłówka) |
| `keychat-settings` | `screens/SettingsScreen.tsx:98` | Settings → cały ekran |
| `keychat-settings-privacy` | `screens/SettingsScreen.tsx:150` (warunek `groupIndex === 0`) | Settings → karta „Privacy & Security" |
| `keychat-nav-chats` | `components/BottomNav.tsx:63` (szablon) | Dolny pasek → zakładka Chats |
| `keychat-nav-wallet` | `components/BottomNav.tsx:63` (szablon) | Dolny pasek → zakładka Wallet |
| `keychat-nav-apps` | `components/BottomNav.tsx:63` (szablon) | Dolny pasek → zakładka Apps |
| `keychat-nav-settings` | `components/BottomNav.tsx:63` (szablon) | Dolny pasek → zakładka Settings |

**19 różnych wartości `data-tour`** (12 literałów + rodzina `keychat-nav-*` ×4 + `keychat-chat-item`,
`keychat-chat-lock`, `keychat-settings-privacy` z warunków) z 16 miejsc w kodzie — metodologia
liczenia w [`../GAPS.md`](../GAPS.md). Dziesięć z nich to *rooty ekranów albo zakładki*; kotwic
wewnątrzekranowych jest **dziewięć** (`keychat-generate-keys`, `keychat-import-key`,
`keychat-chat-item`, `keychat-chat-lock`, `keychat-chat-encryption`, `keychat-message-input`,
`keychat-wallet-actions`, `keychat-apps-grid`, `keychat-settings-privacy`).
Dodatkowo `.keychat-simulator` (root, `KeychatSimulator.tsx:163,175`) jest używany jako cel przez
tour (kroki 1 i 10) — to klasa, nie `data-tour`, ale działa jako selektor.

**Dwie pułapki liczbowe** (kotwica ≠ zawsze w DOM):
`keychat-login` / `keychat-generate-keys` / `keychat-import-key` **znikają na zawsze po pierwszym
zalogowaniu** w danej sesji (key-05, key-38) — po nim zostaje **szesnaście**. I te szesnaście nie
współistnieje: w pokoju rozmowy znikają cztery `keychat-nav-*` (`BottomNav` montowany warunkowo na
`!selectedChat`, `KeychatSimulator.tsx:200`), rooty i wnętrza wszystkich czterech zakładek oraz
`keychat-chat-item` / `keychat-chat-lock` — zostają wyłącznie `keychat-chat-room`,
`keychat-chat-encryption` i `keychat-message-input`. Każdy `showMe` musi więc dobrać komendy pod swoją
kotwicę — i to dopiero po dodaniu mostka z key-42.

## Reachability — komendy toura

**Union:** `type: 'login' | 'navigate' | 'selectChat' | 'back'` (`KeychatSimulator.tsx:23-26`),
obsługa w `switch` na `KeychatSimulator.tsx:65-103`. Payloady:
`navigate` → `'chats' | 'wallet' | 'apps' | 'settings'` (walidowane białą listą, `:88`);
`selectChat` → id czatu, **gated na `isAuthenticated`** (`:95`), fallback `'1'`;
`login` → bez payloadu, no-op gdy już zalogowany (`:67`); `back` → **tylko** `setSelectedChat(null)` (`:101`).
Wrapper mapuje 10 kroków toura na komendy w `KeychatSimulatorWithTour.tsx:67-88`; kroki 5 i 6 mają
po trzy komendy, czyli ponad limit kolejki — trzecia jest gubiona deterministycznie (key-35).
**Uwaga nadrzędna:** ta mapa jest indeksowa i obsługuje **wyłącznie** główny tour — komendy z `showMe`
nie mają dziś jak dojechać do symulatora w ogóle (key-42), a timery kolejki nie są kasowane przy
zmianie kroku (key-36).

| Powierzchnia | Osiągalna komendą? | Czym |
|---|---|---|
| **Dowolna powierzchnia z FAQ `showMe`** | **nie** | brak mostka `FaqMiniTourLauncher` + brak gałęzi `isFaqStepId` (key-42) — warunek konieczny dla każdego wiersza niżej |
| Ekran logowania | **tylko na świeżym montażu** | brak `logout`; `back` nie wylogowuje (key-05, key-34) |
| Logowanie → pole importu klucza / „Create New Account" | jw. | te same warunki co wyżej (key-38, key-04) |
| Chats (lista) | tak | `login` (+ opcjonalnie `navigate: 'chats'` — to i tak default) |
| Chats → pierwszy wiersz (kotwica) | tak | `login` + `navigate: 'chats'` |
| Pokój rozmowy + pole wiadomości | tak, **dwiema** | `login` + `selectChat` (payload `'1'`); tour używa trzech, więc sam tam **nie dojeżdża** (key-35) |
| Dolny pasek (dowolna zakładka) po `selectChat` | **nie w pokoju** | `BottomNav` odmontowany, gdy `selectedChat` (`KeychatSimulator.tsx:200`); wraca po `back` albo `navigate` |
| Pokój → menu ⋮ / załącznik / emoji / saty | n/d | kontrolki martwe (key-10, key-12…key-14) |
| Wallet (ekran) | tak | `login` + `navigate: 'wallet'` |
| Wallet → arkusz Receive | **nie** | lokalny `showReceive` (`screens/WalletScreen.tsx:6`), tylko klik |
| Wallet → tryb Ecash vs Bitcoin | **nie** | lokalny `activeTab` (`:5`) — i tak nic nie zmienia (key-19) |
| Mini Apps (ekran) | tak | `login` + `navigate: 'apps'` |
| Settings (ekran) | tak | `login` + `navigate: 'settings'` |
| Settings → konkretna grupa / wiersz | **nie** | brak kotwic (key-33) i brak komendy scrollującej |
| Toast | **nie** bezpośrednio | pojawia się jako efekt uboczny `login` (`KeychatSimulator.tsx:82`), 2,5 s |

Najtańsze odblokowanie dla FAQ, w tej kolejności: **(1) mostek FAQ** — przepisać cztery fragmenty
z `DamusSimulatorWithTour.tsx` (import + `faqCommandsRef` + gałąź `isFaqStepId` + `<FaqMiniTourLauncher>`)
i dopisać klienta do `src/data/faq/index.ts:4-6` (key-42); bez tego reszta jest teoretyczna.
**(2) komenda `logout`** (jeden `case`, odwraca key-05, key-34 i key-38 — bez niej cała kategoria
„Getting started" nie ma `showMe`). **(3)** skrócić kroki 5/6 wrappera do dwóch komend (key-35)
i przy okazji przenieść `pendingTimersRef`/`clearPendingTimers` (key-36). Wszystko mieści się
w `KeychatSimulator.tsx:65-103` i `KeychatSimulatorWithTour.tsx:19-53,67-88,96-113`.

## Poza zakresem / do recon

**Nie ma screen-mapy Keychata** (`docs/refs/` zawiera amethyst, coracle, damus, nostur, primal,
snort, wisp, yakihonne — keychata brak). Poniższe rzeczy są w symulatorze nieobecne albo wyglądają
podejrzanie, ale **nie da się orzec luki bez recon** (recording + lektura `keychat-io/keychat-app`).
To lista zakupowa na następny pass, nie backlog:

- **Zakładka Browser** — pasek URL, zakładki/bookmarki, chrome webview, sposób startu mini-appa
  (key-02 mówi tylko, że u nas nie ma nic; nie wiemy, jak to wygląda).
- **Zakładka „Me"** — co dokładnie zawiera (profil? klucze? ustawienia? saldo?) i jak wygląda edycja;
  co realna apka pokazuje jako tożsamość (npub w całości? skrót? NIP-05 tylko gdy ustawiony?) (key-43).
- **Red Pocket** — tworzenie, odbiór, kwoty, animacja, gdzie w UI startuje (key-15).
- **Ecash „stamps"** — gdzie widać koszt wiadomości, co się dzieje przy zerowym saldzie (key-16).
- **Tryby szyfrowania per-room** — jakie wartości ma badge, czy da się je zmienić, gdzie (key-11).
- **Portfel** — lista mennic Cashu, tryb Lightning, ekrany invoice/token, szczegóły transakcji,
  czy „Zap" w ogóle istnieje jako osobna akcja portfela (key-19…key-23).
- **Onboarding** — co dokładnie widać po „create account" (nsec? słowa seed? prompt backupu?) i jakie
  są ścieżki importu (nsec / QR / wklej) (key-04).
- **Kontakty** — dodawanie po npub, skan QR, książka adresowa (key-07).
- **Czaty grupowe** — czy istnieją jako osobny typ pokoju i czym różnią się od 1:1 (key-08).
- **Powiadomienia, ustawienia relayów, wyszukiwarka** — czy w ogóle istnieją; FIDELITY milczy.
- **Light vs dark default** i to, czy w apce jest w ogóle przełącznik motywu (key-29).

**Świadome / NIE luki** (nie „naprawiaj"):

- `LoginScreen` odrzuca i czyści wszystko, co wygląda na prawdziwy sekret, a w miejscu realnego
  zapewnienia o powierzaniu klucza pokazuje disclaimer symulacji — celowe, opisane w komentarzu
  (`screens/LoginScreen.tsx:23-31,156-162`).
- Cap ~25 notatek nie dotyczy Keychata (nie ma feedu).

**Znane, ale poza słownikiem tego ledgera** (wierność wizualna → `docs/FIDELITY.md`, nie tutaj):

- **Zły brand.** Symulator jest niebieski `#2D7FF9`/`#1E40AF` (`keychat.theme.css:7-8`,
  `src/simulators/shared/configs.ts:210-211`), a ground truth to **fiolet `#8700ED` / `#d4bbff`
  + orange `#EC6E0E`** (`docs/FIDELITY.md:185`, jawnie jako korekta AUDIT.md w `:187` i `:203`).
  To dokładnie to, co mówi statusNote w rejestrze — naprawa to recon + rebuild, nie łatanie wierszy.
- `keychat.theme.css` definiuje `.ripple`, `.md-card`, `.chat-bubble*`, `.keychat-bottom-nav`,
  `.bottom-nav-indicator` — **żadna z tych klas nie jest użyta w JSX** (grep po `*.tsx` = 0).
  Uwaga przy sprzątaniu: FIDELITY mówi, że upstream jest Material 3 **bez** ripple (NoSplash), więc
  `.ripple` nie należy „przywracać do użycia", tylko usunąć.
- `configs.ts:213-220` reklamuje `SEARCH`, `MUTE_LIST`, `BADGES`, `NIP05` — w symulatorze search to
  dwa martwe przyciski (key-06, key-26), mute-listy i badge'ów nie ma wcale.
- **Awatary hotlinkują `api.dicebear.com`** — 9 miejsc (`KeychatSimulator.tsx:73`,
  `ChatListScreen.tsx:13,22,31,41,50`, `ChatRoomScreen.tsx:92`, `SettingsScreen.tsx:112`,
  `LoginScreen.tsx:40`). Offline / pod ostrym CSP demo FAQ pokazuje puste kwadraty. To znany
  cross-cutting task z `CLAUDE.md`, nie luka funkcjonalna tego klienta.
- `KeychatSimulator.tsx` loguje na konsolę przy **każdym renderze** (`:49`) i przy każdej akcji
  (`:43,63,119,132,139-143,160,171`) — to logi, nie błędy, więc DoD „0 błędów w konsoli" przechodzi,
  ale przy demie FAQ konsola jest zaszumiona.
