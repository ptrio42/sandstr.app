# Coracle — gap ledger

> Ground truth: `docs/refs/coracle/screen-map.md` · Sim: `src/simulators/coracle/`
> Audited: 2026-08-05 · Registry status: ready · Sim LOC: 5139 (4366 tsx/ts + 773 css)

## Rollup

| missing | dead | partial | unreachable | unanchored | ok |
|---|---|---|---|---|---|
| 29 | 17 | 10 | 4 | 4 | 14 |

**Top 3 do zrobienia:** cor-01 · cor-23 · cor-11
(zaraz za nimi: cor-05 „podstrony Settings bez komendy" i cor-24 „⋮ noty otwiera nie to menu")

**Uwaga wstępna — Coracle nie ma wrappera z tourem.** W repo nie istnieje
`CoracleSimulatorWithTour.tsx`; `registry.tsx:238` montuje BAZOWY `CoracleSimulator`,
a `registry.tsx:224` ma `tour: false`. Symulator przyjmuje `tourCommand`/`onCommandHandled`
(`CoracleSimulator.tsx:82-86`), ale **nikt ich nie podaje**. Cała kolumna „Reachability"
niżej opisuje więc, co komendy zrobiłyby PO dobudowaniu wrappera (cor-01) — dziś nie
działa żadna.

## Gaps

| ID | Surface (ścieżka w UI) | § | Status | Gap | Evidence | FAQ impact | Effort |
|---|---|---|---|---|---|---|---|
| cor-01 | (cały klient) FAQ „Show me" → symulator | — | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: missing. **Nie ma mostka FAQ ani żadnego touru.** Brak pliku `CoracleSimulatorWithTour.tsx`, brak `TourWrapper`, brak `FaqMiniTourLauncher`, brak wpisu w `src/data/faq/index.ts:5`. Host renderuje panel FAQ dla każdego klienta, dla którego `getFaq` coś zwróci (`host/ClientView.tsx:392,502`), ale „Show me" wysyła `SHOW_FAQ_EVENT`, którego **nikt nie nasłuchuje** → klik w „Show me" nic nie robi, po cichu. Wzorzec do skopiowania: `src/simulators/damus/DamusSimulatorWithTour.tsx:16-137` | `registry.tsx:224,238`; `CoracleSimulator.tsx:82-86` (propsy bez dostawcy); absent: `src/simulators/coracle/CoracleSimulatorWithTour.tsx` | blocks-showme | M |
| cor-02 | Sidebar → stopka „About / Terms / Privacy" | §5.2 pkt 5 | dead | Trzy `<span>`-y w `<div>`, bez handlera i bez celu; upstream to linki do trzech stron | `CoracleSimulator.tsx:715-730` | blocks-showme | S |
| cor-03 | Sidebar → „Settings" ▸ (podmenu) i wiersz konta ▸ (podmenu) | §5.2 submenus | unreachable | Oba podmenu są wierne (5+5 pozycji, `absolute bottom: 4.5rem`) i działają, ale steruje nimi wyłącznie lokalny `submenu` ustawiany klikiem — **żadna komenda go nie otwiera**. Każde pytanie „gdzie jest Wallet / Keys / Log Out" zaczyna się od tego podmenu | `CoracleSimulator.tsx:113,604-695,711,761`; unia komend: `:77-80` | blocks-showme | S |
| cor-04 | Sidebar → Settings ▸ „Toggle Theme" | §1.4 | partial | Jedyne miejsce w kliencie, gdzie zmienia się motyw — u nas pokazuje toast „Use the theme switch in the Sandstr header." zamiast przełączyć. *Arguable:* motyw naprawdę należy do hosta (`useParentTheme` obserwuje klasę `dark` na `<html>`), więc to świadoma integracja, ale `showMe` na „jak włączyć jasny motyw" podświetli wiersz, który odsyła poza symulator | `CoracleSimulator.tsx:652-653` | breaks-showme | M |
| cor-05 | Sidebar → Settings ▸ App Settings / Content Settings / Database · konto ▸ Keys / Wallet | §17 | unreachable | Podstronę wybiera lokalny `settingsPage`, którego komenda `navigate:'settings'` w ogóle nie dotyka — ląduje na tym, co stan akurat trzyma (przy starcie `'app'`, po wcześniejszym kliknięciu w podmenu: na czymkolwiek innym). Cztery z pięciu stron Settings (w tym **Your Keys** i **Your Wallet**) nie da się zamontować komendą; klikiem to 2 hopy (Settings ▸ pozycja), czyli i tak poza budżetem kroku FAQ | `CoracleSimulator.tsx:111,325-330,430-438,654-668` | blocks-showme | S |
| cor-06 | Sidebar → „Groups" / „Lists" (modale) | §14, §15 | unreachable | Obie pozycje otwierają MODAL po kliknięciu (`:541-545`), ale `case 'navigate'` ustawia `screen` na `'groups'`/`'lists'`, a `pageBody` **nie ma dla nich case'a** → `default: return null`, czyli **pusta strona**. Naturalna komenda FAQ daje białą plamę, nie ekran | `CoracleSimulator.tsx:325-330,354-444` (brak case'ów), `:513-516` (modale) | blocks-showme | S |
| cor-08 | Sidebar → publish HUD (⧗ / ☁ / ⚠) + wiersz konta | §5.2 pkt 6-7 | unanchored | Wierne i na miejscu (trzy liczniki nad hairline'em, `@username` z awatarem), ale bez `data-tour` — a HUD jest odpowiedzią na „skąd wiem, że nota poszła w świat" | `CoracleSimulator.tsx:734-767` | blocks-showme | S |
| cor-09 | Top bar → pole Search + przycisk „Search" → dropdown wyników | §5.3 | missing | Pole i przycisk są, ale dropdown (`absolute right-0 top-10 w-96`, wiersze `hover:bg-neutral-800`, stopka „Loading more options...") nie istnieje — klik daje toast „No results found for …". Wyszukiwarka nigdy nic nie znajduje | `CoracleSimulator.tsx:786-808` | blocks-showme | M |
| cor-10 | (dowolny ekran) → FAB scroll-to-top po 1000px | §5.6 | missing | Jedyny pływający przycisk w kliencie; w symulatorze nie ma go wcale (ikona `arrow-up` istnieje w `Icon.tsx:206`, nikt jej nie używa) | absent w `CoracleSimulator.tsx` (grep `arrow-up` → tylko definicja ikony) | none | S |
| cor-11 | Login „Welcome!" (3 metody) + „Register instead" → signup 1/4–4/4 | §9.1, §9.4 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. Oba ekrany są zbudowane i wierne (łącznie z **brakiem pola na klucz**, co jest fidelity, nie luką), ale otwiera je wyłącznie klik. W unii komend **nie ma `logout`**, a nic nie wypycha modala `{type:'login'}` — więc „jak się zalogować / założyć konto", najczęstsze pytanie FAQ, jest niedemonstrowalne | `CoracleSimulator.tsx:77-80` (unia bez `logout`), `:321-346` (switch), `:449-471` (modale) | blocks-showme | S |
| cor-12 | Po zalogowaniu → modal `/login/connect` („We're searching for your profile on the network.") | §9.3 | missing | Niedomykalny `mini` modal na `mt-[45vh]`, po 8 s „We're having a hard time…" + Try again / Select relays manually, potem „Success! Logging you in..." — u nas `handleLogin` przechodzi prosto do feedu | `CoracleSimulator.tsx:233-242` | blocks-showme | M |
| cor-13 | Login → Remote Signer → „What's a signer?" | §9.2 | dead | `<span className="co-link">` — `.co-link` ma `cursor: pointer`, więc wygląda na link, a nie ma handlera. Upstream to podkreślony link do wyjaśnienia | `screens/LoginScreen.tsx:107`; `coracle.theme.css:298-306` | breaks-showme | S |
| cor-14 | Signup 3/4 „Find your people" → kafelki kategorii | §9.4 krok 3 | dead | Cztery karty mają `co-card-interactive` (`cursor: pointer` + hover na prawej krawędzi), ale **żadna nie ma `onClick`** — w realnej apce wybór kategorii dodaje ludzi do obserwowanych | `screens/OnboardingScreen.tsx:155`; `coracle.theme.css:236-243` | breaks-showme | M |
| cor-15 | Signup 3/4 → „View selections" | §9.4 krok 3 | missing | Wiersz statusu „Following 24 people • 2 relays" jest, ale kontrolki „View selections" obok niego nie ma | `screens/OnboardingScreen.tsx:161-163` | blocks-showme | S |
| cor-16 | Feeds → „Customize" → kreator feedu | §6.1 | missing | Przycisk jest wierny (`btn btn-low`, tylko po zalogowaniu), ale klik daje toast „Feed customization is not part of this reproduction." — kreatora nie ma | `CoracleSimulator.tsx:364`; `screens/FeedsScreen.tsx:110-114` | blocks-showme | L |
| cor-17 | Feeds → „Your Feeds" → 7 chipów „From People you Follow" | §6.2 | partial | Chipy są komplet i w kolejności, aktywny dostaje `!bg-accent`, ale **wybór jest czysto kosmetyczny** — `activeFeed` nie wchodzi do `feedNotes`, więc Polls/Articles/Media/Reposts/Reactions pokazują dokładnie ten sam feed | `CoracleSimulator.tsx:117,218-222,369`; `components/FeedSelector.tsx:60-69` | breaks-showme | M |
| cor-18 | Feeds → „Your Feeds" → Relay Feeds / Your Lists / Custom Feeds | §6.2 | partial | Trzy nagłówki sekcji są, ale każda zawiera **tylko** chip „Edit …" — nie ma ani jednego chipa pozycji (feedu relaya, listy, feedu własnego), które upstream wylicza nad przyciskiem Edit | `components/FeedSelector.tsx:72-88` | breaks-showme | M |
| cor-19 | Feeds → „Your Feeds" → „Edit relay feeds" / „Edit lists" / „Edit feeds" | §6.2 | missing | Trzy chipy z ikoną edit; każdy kończy się toastem „Editing … is not part of this reproduction." — docelowych powierzchni nie ma | `CoracleSimulator.tsx:367,828-830`; `components/FeedSelector.tsx:73,79,85` | blocks-showme | L |
| cor-20 | Feeds → prawy rail „Your Feeds" | §6.2 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Sygnaturowa powierzchnia Coracle, wierna i działająca (poza cor-17/18/19), a **bez `data-tour`** — nie ma czego podświetlić w pytaniu „czym są feedy w Coracle" | `components/FeedSelector.tsx:51-54`; montowanie: `CoracleSimulator.tsx:823-833` | blocks-showme | S |
| cor-21 | Feeds → wiersz kontrolek (search / Replies / Customize) | §6.1 | unanchored | Cały wiersz i każdy jego element bez `data-tour` | `screens/FeedsScreen.tsx:75-115` | blocks-showme | S |
| cor-22 | Feeds → interstitial „Enjoying Coracle?" (Dismiss / Zap the developer) | §6.3 | missing | Karta wstawiana po 20. pozycji na 1 na 100 not — nie istnieje w symulatorze | absent w `screens/FeedsScreen.tsx` (pętla `:137-167` renderuje same `NoteCard`) | none | S |
| cor-23 | Nota → rząd akcji (reply → zap → like → repost) | §7.2 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Zachowanie jest wierne (kolejność, suma satów, `co-beat`, akcent na aktywnym), ale **cały rząd i każdy przycisk są bez `data-tour`**. Stabilne zaczepy istnieją: `.co-action` + `aria-label="Reply"|"Zap"|"Like"|"Repost"`. To najczęściej wskazywana powierzchnia w każdym FAQ | `components/NoteCard.tsx:302-354` (przyciski `:319,324,334,344`) | blocks-showme | S |
| cor-24 | Nota → ⋮ → menu (Quote · Tag · Mute · Report · Broadcast · Delete · Pin · Details) | §7.2 overflow | missing | Menu nie istnieje, a przycisk ⋮ jest podpięty pod `onOpen`, więc **otwiera modal szczegółów** — użytkownik dostaje inny ekran niż obiecuje ikona. Chip „N relays" obok prowadzi tam samo, czego screen-mapa ani nie potwierdza, ani nie wyklucza (§7.2 opisuje sam chip, nie jego cel) | `components/NoteCard.tsx:372-383` | breaks-showme | M |
| cor-25 | Nota → długa treść → maska + „See more" | §7.3 | missing | Treść renderowana zawsze w całości; progu 500–1000 znaków nie ma. Klasa `.co-truncated` **jest zdefiniowana i nieużywana** — ktoś zaczął i nie dokończył | `components/NoteCard.tsx:134-162` (brak progu); `coracle.theme.css:588-593` (martwy CSS) | blocks-showme | S |
| cor-26 | Nota → wątek: odpowiedzi zagnieżdżone (`ml-4`, łuk 36×36, pion 4px, depth 5) | §7.5 | missing | Karta nie renderuje żadnych odpowiedzi — `children` dostaje wyłącznie pasek „Show N more replies". Zagnieżdżenia, łuku ani alternacji kolorów wątku nie ma. `.co-thread-rail` też jest martwym CSS-em. Dane są (`src/data/mock/threads.ts:630`), symulator ich nie importuje | `components/NoteCard.tsx:387`; `screens/FeedsScreen.tsx:156-165`; `coracle.theme.css:631`; `CoracleSimulator.tsx:197-206` (import bez `mockThreads`) | blocks-showme | L |
| cor-27 | Nota → „Show N more replies" | §7.5 | dead | Przycisk jest wierny (gradient w lewo, `fa-up-down`), ale klik tylko **chowa sam przycisk** — żadna odpowiedź się nie pojawia, bo wątków nie ma (cor-26) | `screens/FeedsScreen.tsx:157-164`; `components/NoteCard.tsx:396-406` | breaks-showme | M |
| cor-28 | Nota → odpowiedź INLINE pod kartą (okrągły paper-plane, pasek paperclip/cog, chipy wzmianek) | §7.6 | missing | U nas reply otwiera pełny **modal compose** z nagłówkiem „Reply" — upstream nie zmienia trasy i nie otwiera modala, edytor rozwija się pod kartą | `CoracleSimulator.tsx:289-295`; `screens/ComposeScreen.tsx:28-30` | breaks-showme | M |
| cor-29 | Compose / reply → wpisanie `nsec1…` → ostrzeżenie NsecWarning (Abort / Proceed) | §7.6 | missing | Composer przyjmuje dowolny tekst i nic nie sprawdza; realny klient odpala modal „It looks like you might be sharing a private key." Jedyny bezpiecznikowy ekran, jaki ten klient ma | `screens/ComposeScreen.tsx:53-67` | blocks-showme | S |
| cor-30 | Nota → stan publikacji („Publishing… n of m relays", „Sending reply in n seconds" + Cancel) | §7.6 NotePending | missing | Zamiast paska postępu zastępującego rząd akcji na 60 s — jeden toast „Your note has been published!". Znika przez to widoczny związek z ustawieniem „Send Delay" w App Settings | `CoracleSimulator.tsx:306-310` | blocks-showme | M |
| cor-31 | Nota → cytowane wydarzenie jako zagnieżdżona karta (awatar 24px, max depth 2) | §7.3 | missing | Segmentacja obsługuje tylko `topic` i `code`; `event`/`profile`/`address` lecą do tekstu. Zamierzone i opisane w komentarzu, ale ścieżki „jak zacytować notę" nie da się pokazać | `components/NoteCard.tsx:78-132` | blocks-showme | M |
| cor-32 | Nota → link niebędący mediami → karta OG z BIAŁĄ stopką | §7.3 | missing | Linki renderują się jako goły tekst — brak karty podglądu z pogrubionym tytułem i 140-znakowym opisem („Design Engineer Tools" z nagrania) | `components/NoteCard.tsx:87-132` | none | M |
| cor-33 | Nota → siatka mediów (MediaGrid) | §7.3 | partial | Obrazy są, ale siatka jest zahardkodowana na 1–2 kolumny zamiast `ceil(sqrt(n))`, pierwszy element nie jest rozciągany, i **nie ma białego okrągłego X do odrzucenia obrazka** | `components/NoteCard.tsx:272-297` | blocks-showme | S |
| cor-34 | Nota → chip „Encrypted" (`fa-lock`) w prawym zestawie | §7.2 | missing | Z czterech elementów prawego zestawu są trzy (PoW, „N relays", ⋮) — chipa kłódki nie ma | `components/NoteCard.tsx:356-384` | none | S |
| cor-35 | Nota → „View Parent" / „View Thread" | §7.1 | missing | Podkreślone afordancje z `fa-code-merge` / `fa-code-pull-request` w nagłówku noty — nieobecne | `components/NoteCard.tsx:241-267` | blocks-showme | M |
| cor-36 | Nota → przypięta (pinezka) / wyciszona („You have hidden this note." + „Show") | §7.1 | missing | Ani stanu pinned, ani muted; ikona `thumbtack` jest zdefiniowana w `Icon.tsx:252` i nieużywana | `components/NoteCard.tsx:204-299` | blocks-showme | M |
| cor-37 | Nota → tarcza WoT → popover (about / NIP-05 / lud16 / npub) | §7.1 | missing | Sama tarcza jest wierna (akcent gdy obserwowany, `neutral-200` gdy nie), ale hover nic nie otwiera — a to jedyne miejsce, gdzie klient tłumaczy, czym jest ten pierścień | `components/Avatar.tsx:92-123` | blocks-showme | M |
| cor-38 | Nota → klik w kartę → modal szczegółów | §7.4 | unreachable | Modal istnieje i działa, ale montuje go wyłącznie klik w kartę (albo ⋮/chip relayów, patrz cor-24) — żadna komenda nie otwiera `{type:'note'}` | `CoracleSimulator.tsx:380,480-490`; unia: `:77-80` | blocks-showme | S |
| cor-39 | Nota → Details → sekcje „Reposted By" / „In this conversation" / „Apps" | §7.4 | missing | Modal ma Zapped By · Liked By · Relays · Details — brakuje trzech z siedmiu sekcji (nagłówek pliku wymienia nawet „Reposted By", którego nie renderuje) | `screens/ComposeScreen.tsx:112-115,148-319` | blocks-showme | M |
| cor-40 | Nota → Details → wiersz relaya → INFO / EXPLORE / LEAVE | §7.4 | dead | Wszystkie trzy przyciski wołają `onCopy(label)`, a host renderuje z tego toast **„Info copied to clipboard!"** — nic nie kopiuje, nic nie otwiera, i komunikat wprowadza w błąd | `screens/ComposeScreen.tsx:247-277`; `CoracleSimulator.tsx:488` | breaks-showme | M |
| cor-41 | Post + → „+ Add poll options" | §8 | dead | `<button className="co-link">` **bez `onClick`**; UI ankiety nie istnieje | `screens/ComposeScreen.tsx:85-87` | breaks-showme | M |
| cor-42 | Post + → „Show Preview" | §8 | dead | `<button className="co-link">` **bez `onClick`**; upstream przełącza edytor z białego na `bg-tinted-700` | `screens/ComposeScreen.tsx:89-91` | breaks-showme | S |
| cor-43 | Post + → ⚙ → modal „Note settings" (content warning · schedule · PoW · expire at · post anonymously · relays) | §8 | missing | Zębatka w wierszu meta to **goła `<Icon>`, nie przycisk** — nie ma czego kliknąć, a cały modal sześciu ustawień nie istnieje | `screens/ComposeScreen.tsx:92` | blocks-showme | L |
| cor-44 | Post + → biały kwadratowy przycisk uploadu | §8 | dead | `<button aria-label="Upload media">` **bez `onClick`** | `screens/ComposeScreen.tsx:104-106` | breaks-showme | S |
| cor-45 | Relays → „Add Relay" (ikona kompasu) | §10 | dead | `onClick={() => setTab('search')}`, a `search` to **domyślna** zakładka (`:238`) — w świeżym stanie klik nie zmienia dosłownie nic (nie skupia nawet pola). Realny przycisk prowadzi do dodania relaya | `screens/RelaysScreen.tsx:238,255-257` | breaks-showme | M |
| cor-46 | Relays → „Other relays" → wiersz gwiazdek (ocena) | §10 | missing | Upstream pokazuje ocenę **tylko** w sekcji Other relays (`!showStatus`); u nas nie ma jej nigdzie | `screens/RelaysScreen.tsx:108-228` | none | S |
| cor-47 | Relays → kropka statusu relaya | §10 RelayStatus | partial | Dwa stany zamiast czterech: jest `success`/`neutral-600`, nie ma `warning` (logging/reconnecting/unstable) ani `danger` (failed) — a pytanie „co znaczy pomarańczowa kropka" jest naturalne | `screens/RelaysScreen.tsx:149-159` | breaks-showme | S |
| cor-48 | Relays → „EXPLORE" → strona relaya `/relays/:url` | §10 | missing | Klik daje toast „… relay pages are outside this reproduction." *Arguable:* screen-mapa podaje tylko trasę, nie opisuje zawartości tej strony — bez reconu nie da się jej zbudować wiernie | `CoracleSimulator.tsx:401`; `screens/RelaysScreen.tsx:178` | blocks-showme | L |
| cor-49 | Relays (cały ekran: dwie sekcje, taby, karty) | §10 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Wierny i interaktywny, a bez jednego `data-tour` — „jak dodać relay" to top-3 pytanie każdego FAQ | `screens/RelaysScreen.tsx:246-372` | blocks-showme | S |
| cor-50 | Profil (własny) → „Edit" → edytor profilu | §11 | missing | Edytora nie ma, a przycisk „Edit" jest podpięty pod **`onFollow`**, więc klik po cichu przełącza cię w zbiorze `following` — gorzej niż no-op | `screens/ProfileScreen.tsx:78-80`; `CoracleSimulator.tsx:420,503` | breaks-showme | M |
| cor-51 | Profil → wiersz adresu lightning (⚡ = przycisk zapa) | §11 | dead | To JEST przycisk zapa w tym kliencie (nie ma osobnego), a u nas woła `onCopy('Zap')` → toast **„Zap copied to clipboard!"**. Nic nie zapuje i myli komunikatem | `screens/ProfileScreen.tsx:139-160`; `CoracleSimulator.tsx:421` | breaks-showme | M |
| cor-52 | Profil → ⋮ (overflow profilu) | §11 | dead | `onCopy('Profile options')` → toast „Profile options copied to clipboard!"; menu nie istnieje | `screens/ProfileScreen.tsx:173-181` | breaks-showme | M |
| cor-53 | Profil → zakładki Likes / Collections / Relays / Following / Followers | §11 | partial | Sześć zakładek jest, w dobrej kolejności, z badge'ami liczb — ale pięć z nich renderuje jeden placeholder „Nothing to show here yet — check back later!" | `screens/ProfileScreen.tsx:214-241` | breaks-showme | M |
| cor-54 | Profil → wiersz strony www | §11 | dead | `<span className="co-link">` (kursor łapka) bez handlera; upstream to link zewnętrzny | `screens/ProfileScreen.tsx:161-166` | none | S |
| cor-55 | Profil → nagłówek (awatar 128px, pełny npub + copy + QR) | §11 | unanchored | Wierny (bez bannera, bez wiersza statystyk — obie rzeczy poprawnie NIEobecne) i działający, ale bez `data-tour`; „jak skopiować swój npub" nie ma czego wskazać | `screens/ProfileScreen.tsx:71-122` | blocks-showme | S |
| cor-56 | Notifications → wiersze powiadomień + separatory dat | §12 | missing | Ekran **zawsze** pokazuje stan pusty — nie ma ani jednego wiersza, ani grupowania po dacie, ani fraz „mentioned you" / „replied to your note". Pusty stan sam w sobie jest wierny nagraniu, ale nie da się pokazać powiadomienia | `screens/SimpleScreens.tsx:53-55` | blocks-showme | M |
| cor-57 | Notifications → taby „Mentions & Replies" / „Reactions" + pigułka na nieaktywnym | §12 | unanchored | Wierne i działające (pigułka rzeczywiście tylko na nieaktywnym tabie), bez `data-tour` | `screens/SimpleScreens.tsx:37-52` | blocks-showme | S |
| cor-58 | Messages → lista rozmów → widok czatu (placeholder „Say hello...") | §13 | missing | Zakładki Conversations/Requests zawsze pokazują „No messages found." — nie ma ani wiersza rozmowy, ani ekranu czatu, więc nie istnieje żadna ścieżka do wysłania DM-a | `screens/SimpleScreens.tsx:100` | blocks-showme | L |
| cor-59 | Messages → dzwonek „Mark all as read" | §13 | dead | `<span>` z `title`/`aria-label`, bez `onClick` i bez `role` — wygląda jak kontrolka paska, nie robi nic | `screens/SimpleScreens.tsx:91-97` | breaks-showme | S |
| cor-60 | Messages → „+ Create" → „Start a conversation" → „Start chat" | §13 | dead | Modal jest wierny (60px nagłówek, komunikat o relayach NIP-17), ale przycisk „Start chat" **nie ma `onClick`**, a pole wyszukiwania osób nie ma stanu ani wyników | `screens/SimpleScreens.tsx:115-118` | breaks-showme | M |
| cor-61 | Lists → „+ List" / „+ Create a list" → kreator listy | §15 | missing | Oba przyciski kończą się toastem „List creation is not part of this reproduction." | `CoracleSimulator.tsx:516`; `screens/SimpleScreens.tsx:167,186-193` | blocks-showme | M |
| cor-62 | Lists → sekcja „Other lists" | §15 | partial | Nagłówek z akcentową ikoną jest, treści (list z sieci) nie ma — jedno zdanie opisu i koniec | `screens/SimpleScreens.tsx:197-206` | blocks-showme | S |
| cor-63 | Invite → „Create Invite Link" → modal QR | §16 | missing | Submit pokazuje toast „Invite link created."; modala z kodem QR, który upstream otwiera, nie ma | `CoracleSimulator.tsx:440,518`; `screens/SimpleScreens.tsx:325-332` | blocks-showme | M |
| cor-64 | Invite → karta People → chip osoby → X | §16 | dead | Chip renderuje `<Icon name="times">` wewnątrz `<span>` — brak przycisku, więc osoby nie da się usunąć (choć sama karta ma działający X w nagłówku) | `screens/SimpleScreens.tsx:260-266` | none | S |
| cor-65 | Settings → App Settings → „Blossom Provider URLs" / „Dufflepud URL" / „Imgproxy URL" | §17 | partial | Osiem z jedenastu pól; brakuje dokładnie tych trzech adresowych, między „Authenticate with relays" a „Report errors and analytics" | `screens/SettingsScreens.tsx:116-216` | blocks-showme | S |
| cor-66 | Settings → Content Settings → Mutes (4 selektory: konta / słowa / tematy, publiczne i prywatne) | §17 | partial | Są dwa z czterech („Publicly muted accounts", „Privately muted words"), oba jako gołe `<input>` bez stanu i bez dodawania — tematów nie ma wcale | `screens/SettingsScreens.tsx:289-301` | blocks-showme | S |
| cor-67 | Settings → App Database → „Create Backup" / „Upload Backup" | §17 | dead | Oba wołają `onCopy(...)`, więc klik w „Create Backup" mówi **„Backup copied to clipboard!"** — nic nie eksportuje ani nie importuje, a komunikat kłamie | `screens/SettingsScreens.tsx:333,350`; `CoracleSimulator.tsx:436` | breaks-showme | M |
| cor-68 | Settings → Your Wallet → „Connect Wallet" | §17 | dead | `onCopy('Wallet')` → toast „Wallet copied to clipboard!". *Arguable:* screen-mapa podaje dla tej trasy sam nagłówek, więc reszta ekranu („No wallet connected.") jest naszym domysłem — ale przycisk i tak jest martwy | `screens/SettingsScreens.tsx:467-469` | breaks-showme | M |
| cor-69 | Settings → wszystkie pięć stron (App / Content / Database / Keys / Wallet) | §17 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Pięć wiernych ekranów z nagłówkami 60px, suwakami i toggle'ami — i ani jednego `data-tour`. Razem z cor-05 znaczy to, że żadnego pytania o ustawienia nie da się dziś pokazać | `screens/SettingsScreens.tsx:116,221,310,389,457` | blocks-showme | S |
| cor-70 | Sidebar → sześć pozycji TYLKO TEKST (Feeds · Relays · Notifications · Messages · Groups · Lists) | §5.2 | ok | Kolejność i etykiety verbatim, aktywna rośnie `text-2xl`→`text-3xl` + akcentowe podkreślenie, kropka nieprzeczytanych zakotwiczona do ETYKIETY, pozycje poza Feeds wygaszone bez sesji. **Jedyna zakotwiczona nawigacja w symulatorze** | `CoracleSimulator.tsx:89-96,526-559` | none | — |
| cor-71 | Top bar → „Post +" → composer | §5.3, §8 | ok | Etykieta verbatim ze spacją, akcent, bez sesji zamienia się w „Log In"; ma `data-tour="coracle-compose"` i osiągalny komendą `compose` | `CoracleSimulator.tsx:809-816`; `screens/ComposeScreen.tsx:17-109` | none | — |
| cor-72 | Feeds → przełącznik „Replies" | §6.1 | ok | `btn-accent` gdy włączony, `btn-low opacity-50` gdy nie, i **naprawdę filtruje** feed po tagu `e` | `screens/FeedsScreen.tsx:102-109`; `CoracleSimulator.tsx:218-222` | none | — |
| cor-73 | Relays → JOIN / LEAVE | §10 | ok | JOIN akcentowy, LEAVE ciemny i **pojawia się tylko przy >1 relayu** — blokada „nie możesz zostawić ostatniego" odtworzona | `screens/RelaysScreen.tsx:179-183,286` | none | — |
| cor-74 | Relays → chipy Read / Write / Messaging | §10 | ok | Trzy właściwe ikony, stan OFF wyrażony **wyłącznie** przez `opacity-50` (bez zmiany koloru), przełączają się | `screens/RelaysScreen.tsx:61-83,205-224` | none | — |
| cor-75 | Groups → „Groups are going away!" | §14 | ok | Cała trasa to nota o wygaszeniu: Lato bold, sentence case, oba hosty w `<strong>`, biały „Continue to Groups" + akcentowy „Try Flotilla" | `screens/SimpleScreens.tsx:134-155` | none | — |
| cor-76 | Signup → przepływ 1/4 → 4/4 (badge, BACK/CONTINUE, kropki) | §9.4 | ok | Cztery kroki, okrągły badge `n/4`, tytuły Lato-bold (nie kapitaliki), kropki `neutral-300`/`neutral-500` (NIE akcent), krok 2 uczciwie oddaje handoff do nstart | `screens/OnboardingScreen.tsx:78-231` | none | — |
| cor-77 | Nota → segmentacja treści (`#topic` bez `_`, ` ```code``` ` z tagiem języka) | §7.3.1 | ok | Regexy i kolejność parserów przepisane z `@welshman/content`; oba upstreamowe dziwactwa odtworzone celowo — **nie „naprawiaj" ich** | `components/NoteCard.tsx:83-132` | none | — |
| cor-78 | Relays → „Other relays" → pole „Search relays or add a custom url" → dodanie relaya po URL | §10 | missing | Pole **wyłącznie filtruje** listę mocków; URL, którego nie ma w `mockRelays`, kończy się komunikatem „No relays matching …" i niczym więcej. Razem z martwym „Add Relay" (cor-45) znaczy to, że **w symulatorze nie da się dodać relaya, którego nie ma na liście** — a „jak dodać relay" to pytanie, wokół którego zbudowana jest cała sekcja §10 | `screens/RelaysScreen.tsx:242-244,326-333,361-365` | blocks-showme | M |
| cor-79 | Nota → przycisk Reply → stan „odpowiedziałeś" (akcent na ikonie) | §7.2 wiersz 1 | partial | Zap, Like i Repost dostają `is-on`; **Reply jako jedyny z czwórki nigdy się nie zabarwia**, bo odpowiedź nie zapisuje się w żadnym stanie (wysłanie daje tylko toast). Odpowiedź FAQ „ikona zmieni kolor, kiedy odpowiesz" będzie sprzeczna z tym, co widać. Kotwice całego rzędu: cor-23 | `components/NoteCard.tsx:319-322` (brak `is-on`) vs `:324-353`; `CoracleSimulator.tsx:289-295,306-310` | breaks-showme | S |

## Anchors — `data-tour` obecne w symulatorze

| Selector | Plik:linia | Powierzchnia |
|---|---|---|
| `[data-tour="coracle-nav-feeds"]` | `CoracleSimulator.tsx:535` | Pozycja „Feeds" w sidebarze |
| `[data-tour="coracle-nav-relays"]` | `CoracleSimulator.tsx:535` | Pozycja „Relays" w sidebarze |
| `[data-tour="coracle-nav-notifications"]` | `CoracleSimulator.tsx:535` | Pozycja „Notifications" (z kropką nieprzeczytanych) |
| `[data-tour="coracle-nav-messages"]` | `CoracleSimulator.tsx:535` | Pozycja „Messages" |
| `[data-tour="coracle-nav-groups"]` | `CoracleSimulator.tsx:535` | Pozycja „Groups" (otwiera modal) |
| `[data-tour="coracle-nav-lists"]` | `CoracleSimulator.tsx:535` | Pozycja „Lists" (otwiera modal) |
| `[data-tour="coracle-compose"]` | `CoracleSimulator.tsx:812` | Przycisk „Post +" w top barze (bez sesji: „Log In") |

**Razem: 7 selektorów z 2 miejsc w kodzie** — sześć z jednego szablonu
(`data-tour={\`coracle-nav-${item.screen}\`}`, `:535`) plus jeden literał (`:812`).
Grep po `data-tour="` znajduje tylko ten drugi, więc pokrycie wygląda na jeszcze mniejsze,
niż jest. **Poza sidebarem i przyciskiem Post + nie ma ani jednej kotwicy w całym drzewie.**

**Stabilne selektory pomocnicze bez `data-tour`** (można ich używać w `showMe` od razu):
`.co-action` + `[aria-label="Reply"|"Zap"|"Like"|"Repost"]` (`components/NoteCard.tsx:319,324,334,344`),
`.co-card` / `.co-card-alt` (karta noty), `.co-chip` / `.co-chip-accent` (chipy raila i note-actions),
`.co-tab` / `.co-tab-active` (Notifications, Messages, Relays, Profil), `.co-toggle` (Settings),
`.co-account-row` i `.co-hud` (`CoracleSimulator.tsx:734,760`), `.co-modal-close`, `.co-rail`,
`.co-sidebar`, `.coracle-simulator` (root).

**Bez kotwicy, a warte jej (najpilniejsze najpierw):** rząd akcji noty (cor-23), ekran Relays
(cor-49), strony Settings (cor-69), rail „Your Feeds" (cor-20), nagłówek profilu (cor-55),
taby Notifications (cor-57), wiersz kontrolek feedu (cor-21), HUD + wiersz konta (cor-08),
modal „Welcome!" i podmenu sidebara (dziś i tak nieosiągalne — cor-03, cor-11).

## Reachability — komendy toura

**Union:** `type: 'login' | 'navigate' | 'compose' | 'post' | 'viewProfile'`
(`CoracleSimulator.tsx:77-80`), obsługa w `switch` `:321-346`.
Payloady: tylko `navigate` (`payload: CoracleScreen` = `'feeds' | 'relays' | 'notifications' |
'messages' | 'groups' | 'lists' | 'profile' | 'settings' | 'invite'`) oraz `viewProfile`
(`payload: 'other'` → cudzy profil, cokolwiek innego → własny).
**Brak `logout`** — z sesji nie ma jak wyjść komendą, a start jest wylogowany, więc
`login` jest jednokierunkowe.
Limit kolejki: **max 2 komendy na krok** (ten sam wzorzec kolejki co w Damusie —
`DamusSimulatorWithTour.tsx:34-59`), więc „login + X" przechodzi, „login + X + Y" nie.
**Dziś nic z tego nie działa — nie ma wrappera, który by te komendy podał (cor-01).**

| Powierzchnia | Osiągalna komendą? | Czym |
|---|---|---|
| Feeds (wylogowany, z banerem „Don't have an account?") | tak | stan startowy, bez komendy |
| Feeds (zalogowany) | tak | `login` (sam ustawia `screen: 'feeds'`) |
| Feeds → rail „Your Feeds" | tak (pośrednio) | `login`; rail montuje się przy szerokości ≥1000px (`:193,823`) |
| Feeds → wybrany preset (Media, Articles…) | **nie** | `activeFeed` to lokalny stan zmieniany tylko klikiem — cor-17 |
| Relays | tak | `login` + `navigate:'relays'` |
| Notifications | tak | `login` + `navigate:'notifications'` |
| Notifications → tab „Reactions" | **nie** | lokalny `useState` w `NotificationsScreen` |
| Messages | tak | `login` + `navigate:'messages'` |
| Messages → „Start a conversation" | **nie** | tylko klik w „+ Create" (`:407`) |
| Invite (Create an Invite) | tak | `login` + `navigate:'invite'` |
| Compose (Create a Note) | tak | `login` + `compose` (albo `post` — robi to samo) |
| Compose w trybie reply | **nie** | `replyTo` ustawia tylko klik w ikonę reply (`:289-295`) |
| Profil cudzy (MODAL) | tak | `login` + `viewProfile:'other'` |
| Profil własny (MODAL) | tak | `login` + `viewProfile` |
| Profil własny (STRONA, jak w nagraniu) | tak, ale tylko w tej kolejności | `viewProfile` + `navigate:'profile'` w JEDNYM kroku: pierwsza ustawia `profileUser` (i modal), druga zdejmuje modal i przełącza trasę. **Sam `navigate:'profile'` daje pustą stronę** (guard `profileUser ?`, `:408-429`), a `login` musi paść w kroku WCZEŚNIEJSZYM — budżet to 2 komendy |
| Settings → App Settings | tak | `login` + `navigate:'settings'` (ląduje na `settingsPage`, który przy starcie trzyma `'app'`) |
| Settings → Content / Database / Your Keys / Your Wallet | **nie** | `settingsPage` bez payloadu w komendzie — cor-05 |
| Sidebar → podmenu Settings / konta | **nie** | lokalny `submenu`, tylko klik — cor-03 |
| Groups (modal) | **nie** | `navigate:'groups'` renderuje **pustą stronę**, modal otwiera tylko klik — cor-06 |
| Lists (modal) | **nie** | j.w. — cor-06 |
| Login „Welcome!" (modal) | **nie** | brak komendy `logout` i nic nie otwiera `{type:'login'}` — cor-11 |
| Signup 1/4–4/4 | **nie** | dostępne wyłącznie przez „Register instead" w modalu logowania — cor-11 |
| Remote Signer (bunker) | **nie** | j.w., o jeden klik dalej |
| Nota → modal szczegółów (Details) | **nie** | tylko klik w kartę / ⋮ / chip relayów — cor-38 |
| Toast (dowolny) | **nie** samą komendą | `login` + `compose` dowozi composer, ale toast odpala dopiero KLIK w „Send" (`:306-310`) |

**Wniosek dla autora FAQ:** dopóki nie ma cor-01, **żaden `showMe` nie zadziała** — a co gorsza
nie zawiedzie głośno: „Show me" wyśle zdarzenie, którego nikt nie łapie, i panel po prostu się
zamknie. Po cor-01 demonstrowalne bez żadnej dalszej pracy są tylko: nawigacja w sidebarze
(6 kotwic) i „Post +" → composer. Wszystko inne wymaga najpierw dołożenia kotwic
(cor-23 / cor-49 / cor-69 / cor-20 / cor-55 — każda to jeden atrybut), a pytania o logowanie,
klucze i ustawienia dodatkowo nowych komend (`logout`, payload dla `settingsPage`,
otwarcie modali Groups/Lists — cor-05, cor-06, cor-11).

## Poza zakresem / do recon

- **Mobilne chrome (<1024px)** — trzy strefy dolnego paska i `MenuMobile` (siatka kafli 112×112).
  Świadomie nieodtworzone (§18.8), host gatuje Coracle poniżej 640px (`host/ClientView.tsx:249,400`),
  a pasmo 640–768px jest osobnym zadaniem. Nie luka — decyzja.
- **Brak pola na klucz w logowaniu** — realny klient go NIE MA (§9.1: `loginWithNip01` wołane
  wyłącznie z `main.js:39`). Nieobecność `keySafety.ts` w `LoginScreen.tsx` jest wiernością;
  dopisanie pola byłoby wymyśleniem powierzchni phishingowej, której klient nie ma.
- **Prywatny klucz w „Your Keys"** — symulator mówi wprost „This is a simulation — no key exists
  to reveal." zamiast renderować wiarygodny nsec (`screens/SettingsScreens.tsx:420-451`).
  Świadome odejście od realnej apki, udokumentowane w kodzie.
- **nstart (`start.njump.me`)** — polskie ekrany z nagrania to osobny projekt (§9.4 [REC vs REPO]).
  Nie odtwarzamy i nie mierzymy.
- **Piąta akcja noty „Open with" (NIP-89)** — upstream pokazuje ją tylko dla kind ≠ 1 z handlerami;
  cały mock to kind 1, więc nieobecność jest poprawna. Nie luka.
- **Dialog zapa** — screen-mapa nie dokumentuje, co otwiera się po kliknięciu ⚡ na karcie
  (podaje tylko „Zap default is 21 sats"). Nasz zap dolicza +21 i pokazuje toast. Bez reconu
  nie orzekam luki; cor-51 dotyczy wyłącznie potwierdzonego martwego wiersza na profilu.
- **Strona relaya `/relays/:url`** — trasa jest w §10, zawartość nie. cor-48 filuję jako lukę
  ścieżki, ale jej wypełnienie wymaga nowego reconu.
- **Ekran „Your Wallet"** — §17 podaje sam nagłówek i trasę. Wszystko poza nagłówkiem w
  `SettingsScreens.tsx:457-473` jest naszym domysłem (cor-68 dotyczy martwego przycisku,
  nie kształtu ekranu).
- **„Switch Account"** — pozycja podmenu konta istnieje i daje toast „Multiple accounts are
  outside this reproduction." (`CoracleSimulator.tsx:686`). Screen-mapa nazywa pozycję, ale nie
  opisuje jej celu — bez reconu nie da się orzec, czego brakuje.
- **Chip „close all" (`fa-angles-down`) w zagnieżdżonym modalu i swipe-down** (§5.7) — nasza
  logika modali jest stosem (`modals: CoracleModal[]`), więc zagnieżdżanie działa, ale ani chipa,
  ani gestu nie ma. Za drobne i zbyt mobilne, żeby filować osobno; do sprzątnięcia razem z §18.8.
