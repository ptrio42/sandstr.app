# Amethyst — screen map (ground truth)

**Źródła:** nagranie użytkownika z realnej **v1.13.1-fdroid** (2026-08-13, 1080×2400, 570 s →
285 klatek co 2 s w `shots/frames/periodic/`, gitignored) + kod `vitorpamplona/amethyst`
@ tag **v1.13.1** (`1bda3ab`). Wersję potwierdza sama appka: stopka szuflady renderuje
**`v1.13.1-FDROID`** (`BuildConfig.VERSION_NAME` + sufiks smaku).
Poprzednia wersja tego dokumentu (v1.12.6) jest zamrożona w
[`docs/refs/amethyst-v1-12/screen-map.md`](../amethyst-v1-12/screen-map.md).

**[REC vs REPO]** nagranie wygrywa LAYOUT, repo wygrywa HEX / etykiety / nazwy ikon. Każdy rozjazd
jest niżej oznaczony.

> ## ⚠️ Trzy „fakty" z ery v1.12.6, które były błędne
>
> Poprzednia screen-mapa opierała ekran Home na **oficjalnym promo-screenshocie**
> (`docs/screenshots/home.png`) i tam, gdzie screenshot kłócił się ze źródłem, wybierała screenshot.
> Recon v1.13.1 pokazał, że w trzech miejscach źródło miało rację **już w v1.12.6**, a screenshot był
> po prostu starszy niż kod:
>
> 1. **Prawy slot app bara.** Szipowaliśmy licznik „16/16" + ikonę grafu relayów. Upstream nie ma
>    licznika relayów w app barze **w żadnej z wersji** — `UserDrawerSearchTopBar.kt` ma tam
>    wyłącznie `SearchIcon`. Jedyny licznik połączeń w całej appce siedzi w wierszu **Relays**
>    w szufladzie (`DrawerContent.kt`, `PoolStatus("connected/available")`).
> 2. **Piąty slot rzędu akcji.** Szipowaliśmy „Stats" (słupki + liczba wyświetleń).
>    `DefaultReactionRowItems` jest **bajt w bajt identyczne w v1.12.6 i v1.13.1** i kończy się na
>    `Share(showCounter = false)`. Akcji „view count" nie ma w kodzie ani jednej, ani drugiej wersji.
> 3. **Pasek LIVE na górze feedu.** Szipowaliśmy stały, pełnej szerokości pasek z tytułem, podtytułem,
>    plakietką LIVE i licznikami 🚀/⚡. Upstream renderuje `DisplayLiveBubbles` jako **poziomy
>    `LazyRow` okrągłych bąbli** i tylko `if (feed.list.isNotEmpty())` — własny komentarz w kodzie
>    nazywa brak bąbli „the common case". W 285 klatkach nagrania pasek nie pojawia się ani raz.
>
> Wszystkie trzy naprawione w wersji żywej; **zamrożone archiwum `amethyst-v1-12` zachowuje je**
> (freeze jest snapshotem tego, co szipowaliśmy, nie erratą). Nie „naprawiaj" ich z powrotem.

---

## Motyw i tokeny (największa zmiana wydania)

v1.13.1 dorzuca **wybieralny akcent** (6 opcji, domyślny Purple) i przy okazji **odfiolecia całą
neutralną rampę** — zamiast fallbacku na fioletowawy baseline Material 3 wchodzą szarości bez
odcienia. Cytat z `Theme.kt`: *„Left unset, these fall back to Material's violet-tinted baseline
greys, which read as a faint purple wash independent of the accent."*

Dark, akcent PURPLE (domyślka — to szipujemy):

| rola | v1.12.6 | v1.13.1 |
|---|---|---|
| `primary` | `#BB86FC` | `#BB86FC` (Purple200) |
| `onPrimary` | baseline `#381E72` | **`#000000`** — `onAccent()` wybiera przez kontrast WCAG (7.9:1 vs 2.7:1) |
| `secondary` | `#03DAC5` (Teal200) | `#03DAC5` — tylko Purple zachowuje teal |
| `primary/secondary/tertiaryContainer` | baseline | **`#36244C`** = `lerp(primary, Black, 0.58)` w Oklab |
| `onXContainer` | baseline | **`#F4EDFF`** = `lerp(primary, White, 0.85)` w Oklab |
| `background`/`surface` | `#000000` | `#000000` |
| `onSurface` | baseline `#E6E1E5` | **`#E6E6E6`** |
| `surfaceVariant` | `#1D1A22` | **`#1E1E1E`** |
| `onSurfaceVariant` | baseline `#CAC4D0` | **`#CACACA`** |
| `outline` / `outlineVariant` | baseline | **`#909090`** / **`#454545`** |
| rampa kontenerów | brak | `#141414` · `#1A1A1A` · `#252525` · `#2E2E2E` · `#383838` |
| `inversePrimary` | `#7F67BE` | **`#6200EE`** (Purple500) |

Pochodne (formuły bez zmian): `placeholderText` = onSurface @42%, `grayText` = @52%,
`lessImportantLink` = primary @52%, `newItemBackgroundColor` = primary @12%.
Bitcoin-orange `#F7931A` bez zmian.

**Weryfikacja:** `#36244C` policzone z formuły zgadza się z pikselem pigułki nawigacji spróbkowanym
z nagrania (`#34224B`) w granicach zaokrągleń — to potwierdza, że `lerp` Compose'a działa w Oklab,
nie w sRGB.

---

## Home — app bar

Od lewej: **avatar konta** (tap → szuflada; `LoggedInUserPictureDrawer`, `nav::openDrawer`) ·
**selektor feedu „All Follows ⌄"** (`follow_list_kind3follows`, chevron `ExpandMore` 20 dp) ·
**lupa** (`SearchIcon`, 22 dp, tint `placeholderText` → nawiguje do `Route.Search`).
Wysokość paska `TopBarSize = 50 dp`. Pasek **auto-chowa się przy scrollu** (`DisappearingScaffold`).

`HomeTopBar.kt` **nie występuje w diffie v1.12.6→v1.13.1** — kompozycja jest bajt w bajt ta sama.

## Home — sub-taby

`SecondaryTabRow` (płaskie taby tekstowe + pełnej szerokości podkreślenie, **bez pigułek**):
**„New Threads" · „Conversations"** (+ opcjonalny **„Everything"**, wyłączony domyślnie).
Etykiety i kolejność bez zmian od v1.12.6. Rząd znika, gdy włączony jest tylko jeden tab.
Nowość: **Settings → Home → „Visible tabs"** pozwala wyłączyć każdy z trzech, a druga karta
**„Content in the feed"** daje 19 przełączników rodzajów treści (wszystkie ON).

## Home — treść

- **Brak paska LIVE** w stanie domyślnym (patrz ramka na górze). Bąble live to poziomy `LazyRow`,
  renderowany warunkowo; v1.13.1 usunął też 5 dp martwego odstępu, który wcześniej rezerwował się
  nad pierwszą notatką, gdy bąbli nie było.
- **Karta notatki:** avatar (55 dp) z plakietką „Following" (tarcza, w dark = `inversePrimary`
  `#6200EE`) · nazwa/npub · znaczniki metadanych · `• czas` + `⋮` jako zwarta para.
- **Nagłówek przebudowany:** wszystkie znaczniki przeniesione do **pierwszego** wiersza i zamienione
  na dwa nowe prymitywy — `HeaderPill` (chip: `RoundedCornerShape(6dp)`, tło `onSurface @7%`,
  ikona 13 dp, `labelSmall`) dla PoW / OTS / lokalizacji / wygaśnięcia / bounty, oraz `QuietMark`
  (pogrubiony szary tekst + opcjonalna ikona 16 dp) dla Draft / edycji / przypięcia / private-rumor.
  Konkretnie: `PoW-24` → chip „24"; „Existed since 3d" → chip „3d"; „Edited" → sama ikona ołówka.
- **Słowo „boosted" ZNIKŁO** — jedynym sygnałem repostu w nagłówku jest wyszarzona nazwa autora
  (`grayText`, onSurface @52%). `BoostedMark()` usunięty ze źródła.
- **Kolumna favikon relayów pod avatarem USUNIĘTA** z karty notatki. Te same relaye pojawiają się
  teraz jako wiersz **„Accepted by relays"** wewnątrz rozwiniętej galerii reakcji.
- **Rząd akcji** (`DefaultReactionRowItems`, identyczne w obu wersjach):
  **[chevron rozwijania] · Reply · Boost · Like · Zap · Share**.
  `Pay` istnieje w enumie, ale ships `enabled = false`. `Share` ma `showCounter = false`, więc jest
  ikoną bez liczby i — jako ostatni element bez licznika — dokleja się do prawej krawędzi
  (`isLastIconOnly` w `GenericInnerReactionRow`). **Liczniki renderują się tylko przy wartości > 0.**
- **Chevron rozwijania pokazuje się teraz praktycznie na KAŻDEJ notatce** — wcześniej wymagał
  reakcji/zapów/boostów, teraz wystarczy, że notatka była widziana na jakimkolwiek relayu.
- **Galeria reakcji** (po chevronie): wiersz na typ reakcji, w każdym avatary reagujących; wiersz ⚡
  niesie kwotę w satach na pomarańczowo; doszedł wiersz BOLT12 i „Accepted by relays".
- **Share** nie odpala już systemowego choosera Androida — otwiera wewnętrzny `ModalBottomSheet`
  „Share" z czterema wierszami: Share · Share as Image · Share as Image Url · **Share as QR**.
- **FAB** = lawendowe kółko 55 dp z piórem; **glif zmienił kolor z białego na `onPrimary`**, czyli
  w dark na **czarny**.

## Home — bottom nav

**`DefaultBottomBarItems` = Home · Messages · Wallet · Browser · Notifications** (5 pozycji).
W v1.12.6 domyślka miała **6**: Home · Messages · Shorts · Discover · Favorite Feed Algorithms ·
Notifications. Shorts i Discover wypadły z paska — zostają w sekcji **Navigate** szuflady.

**To jest domyślka, nie przeróbka użytkownika:** zapis paska przeniósł się z lokalnego DataStore do
synchronizowanego bloba NIP-78 **bez migracji** (`BottomBarPersistenceTest`: *„no migration from the
old app-global setting is attempted"*), więc każdy użytkownik po aktualizacji ląduje na nowej
domyślce. To odróżnia ten przypadek od Wispa (gdzie nagranie pokazywało przestawiony toggle).

- Ikony (Material Symbols, waga 300, FILL 0): `Home` · `Mail` · `AccountBalanceWallet` ·
  `Language` (globus) · `Notifications`. Bez etykiet (`alwaysShowLabel = false`).
- **Nowość: pigułka M3** pod aktywną ikoną (`secondaryContainer` `#36244C`). v1.12.6 nie miał żadnego
  wskaźnika — zaznaczenie niósł sam tint. Tint bez zmian: `primary` aktywny, `onSurface65`
  (`#969696`) nieaktywny.
- `HorizontalDivider` 0.25 dp **na górze** paska — było i jest.
- Kropka-badge tylko na Home / Messages / Notifications. Wallet i Browser **nigdy** jej nie mają.
- Pasek znika na każdym ekranie, który nie jest korzeniem zakładki, i przy otwartej klawiaturze.
- **Wallet i Browser nie mają FAB-a** — z nową domyślką dwie z pięciu zakładek są bez FAB-a.

## Home — dialog filtra feedu

Tap w „All Follows ⌄" otwiera `GroupedFeedFilterDialog`.
**[REC vs REPO] ten dialog istniał już w v1.12.6** — nasz płaski popup 5 pozycji był błędem
reprodukcji, nie różnicą wersji.

- `Dialog` + `Surface` `RoundedCornerShape(28dp)` w `surfaceContainerHigh`; tytuł
  `select_list_to_filter` = **„Select an option to filter the feed"**, wyśrodkowany `titleSmall`.
- Grupy: własny `Surface` `RoundedCornerShape(16dp)` w `surfaceContainerLow`, nagłówek **wersalikami**
  12 sp, tracking 0.8 sp. Nazwy grup: `Feeds` · `Relays` · `Hashtags` · `Interest Sets` ·
  `Locations` · `Feed Algorithms` · `Communities` · `Lists`. Grupa bez wpisów się nie renderuje —
  dlatego nagranie pokazuje pięć z ośmiu.
- Wiersz = ikona 20 dp + odstęp 12 dp + etykieta 14 sp.
- Z nagrania: FEEDS → All Follows · All User Follows · Default Follow List · Mute List;
  RELAYS → Global; INTEREST SETS → Tags (własny zestaw użytkownika);
  LOCATIONS → Around Me · **Teleport to a place…** (nowe w v1.13.1); LISTS → List · mute.

## Wallet (NOWA zakładka)

Korzeń zakładki: **lewy tytuł „Wallet"** (bez avatara, bez lupy) + **„+"** po prawej.
Karta on-chain: obramowanie bitcoin-orange, okrągła ikona ₿, **„Bitcoin"** + chip **„(i) Public"**,
druga linia **„Onchain · Taproot"**, po prawej duże pomarańczowe **„0"** nad **„sats"**;
pod spodem obrysowy **„⧉ Copy"** i wypełniony pomarańczowy **„▷ Send"**.
Niżej pusty stan NWC: **„No wallets connected"** ·
**„Connect one or more NWC wallets to send and receive payments."** · lawendowa pigułka
**„+ Add NWC Connection"** (tekst ciemny — `onPrimary` = czarny).
Saldo w nagraniu realnie ładuje się przez spinner; odtwarzamy stan **końcowy**.

## Browser (NOWA zakładka, globus)

**Bez app bara.** Na górze pełnej szerokości zaokrąglone pole adresu
**„Search or enter address"**, pod nim fioletowy nagłówek **„Discover web apps"** i katalog
webowych klientów Nostr: ikona · nazwa · jednolinijkowy opis · gwiazdka ulubionych.
Z nagrania, w kolejności: Primal · Coracle · Snort · noStrudel · Iris · Nostter · Jumble · Nostria ·
Nosotros · lumilumi · (Phoenix — ucięty krawędzią kadru, opis nieczytelny → **nie odtwarzamy**).

## Messages

App bar: avatar · **logo Amethyst** na środku · lupa. Sub-taby **„Known" / „New Requests"** + `⋮`.
Wiersz rozmowy: avatar · nazwa/npub · `• czas` po prawej · podgląd („You: …") · fioletowa kropka
nieprzeczytanych. **Nowość: karta „Older legacy messages"** wpleciona w listę Known —
`⋯` + tytuł + podtytuł **„NIP-04 · 7 relays · loaded since Aug 2026"**. FAB = lawendowe **„+"**.
Kropka na kopercie w dolnym pasku zapala się teraz dla **każdej** nieprzeczytanej rozmowy, nie tylko
dla DM-ów NIP-17/NIP-04.

## Thread

Top bar: **„← Thread"**, wyrównany do lewej. Notatka główna: avatar 55 dp, nazwa, **NIP-05 pod nazwą**
(kolor = `primary`), treść 18 sp, pigułka **„Show More"** nad wygaszonym tekstem, rząd akcji
z licznikami. Odpowiedzi wcięte z pionową linią-łącznikiem (zebra bez zmian).
Notatka główna renderuje się z `showReactionDetail = true`, więc galeria reakcji
(z „Accepted by relays") jest tam widoczna od razu.

## Profile

Banner 150 dp (bez zmian), avatar 100 dp nachodzący na banner, top bar przezroczysty z okrągłym
back i `⋮`.

- **Rząd akcji.** Upstream: Message · Payment · **BOLT12** · [Edit gdy `isMe`] · Follow/Unfollow ·
  List — ale Payment, BOLT12 i Edit są warunkowe.
  **[REC vs REPO]** na profilu obcego użytkownika, który otwiera nagranie, renderują się
  **dokładnie trzy**: koperta · **Follow** · lista. Tyle szipujemy.
- **Blok tożsamości** (kolejność bez zmian): display name (bold 22 sp) → `@username` →
  **npub + copy** → **nprofile + copy + QR** → **„Last seen …"** → NIP-05 → website →
  tożsamości zewnętrzne → **chipy szyn płatności** → badges → bio.
- **Chipy płatności** zamiast dawnej linijki lightning: obrysowane chipy w barwie szyny —
  z nagrania **„⚡ Lightning <adres>"** i **„₿ On-chain"**, oba bitcoin-orange.
- **Zakładki** (pełna kolejność v1.13.1): **Notes · Replies · Yours · Gallery · Apps & Sites ·
  Follows · [Followers] · [Zaps] · Bookmarks · Followed Tags · Reports · Relays**.
  „Yours" to realna etykieta (string `mutual`), nie nasz wymysł; **„Apps & Sites" jest nowe**.
- **Nadal BRAK twitterowego paska statystyk** — liczby follows/followers siedzą w nagłówkach zakładek.

## Szuflada (account drawer)

Kolejność wg `DrawerContent.kt`: nagłówek → **You** → **Navigate** → **Feeds** → **Create** →
**System** → (spacer) → **Accounts** → stopka z wersją. Sekcje są zwijane (chevron po prawej).

- **Nagłówek:** banner + avatar + nazwa + pole **„Update your status"** + „N Following · N Followers".
- **You** (`DrawerYouItems`): Profile (tint `primary`) · My Lists · Bookmarks · **Web Bookmarks** ·
  Drafts · **Scheduled posts** · Hashtag Sets · My Blossom Files · My Emoji Packs · Wallet ·
  **Remote Signer**.
- **Navigate** (`DrawerNavigateItems`): Home · Messages · Shorts · Browser · Discover · Notifications.
- **Feeds** (`DrawerFeedsItems`, 28 pozycji): Reads · Pictures · Shorts · Videos · Episodes ·
  Podcasts · Music · Playlists · Polls · Marketplace · Workouts · Git Repositories · Live Streams ·
  Nests · Communities · Public Chats · Relay Groups · Concord Channels · Location Channels ·
  Calendars · Calendar lists · App Store · Web apps · nApplets · nSites · Follow Packs · Badges ·
  Emojis.
- **Create:** tylko **HLS Upload** — sąsiedni wiersz „Chess" jest w `if (isDebug)`, więc w wydaniu
  release go nie ma.
- **System:** **Relays** z licznikiem (jedyny kolorowy tekst w szufladzie; w nagraniu `355/1810`,
  wartość żyje — między klatkami skacze `148/1810` → `321/1811`) · **Settings**.
- **Stopka:** **`v1.13.1-FDROID`** + ikona QR. Sufiks smaku był już w v1.12.6.

**To jest zmiana strukturalna:** v1.12.6 miał tu płaskie menu konta na 11 pozycji. W v1.13.1
szuflada jest mapą możliwości appki i **Security Filters, Media Servers oraz Backup Keys już w niej
nie ma** — przeniosły się do Settings (Backup Keys do Danger Zone).

## Settings

Jeden **przeszukiwalny korzeń** zamiast trzech osobnych celów ze szuflady.

- **Top bar:** back + **pigułka „Search settings"** (`settings_search_placeholder`).
  **Nagłówka „Settings" na tym ekranie nie ma** — pole wyszukiwania zajmuje jego miejsce.
- Wiersz = **kafelek ikony w zaokrąglonym kwadracie** (fiolet) + etykieta + chevron; sekcja = jedna
  duża zaokrąglona karta; hairline zaczyna się za kolumną ikon. Kafelki to sygnatura tego ekranu.
- **`account_settings` = „Account Settings":** Relays · Relay Sync · Import Follows · Media Servers ·
  Nest servers · Zaps · Reactions · Reaction Row · Messages · Bottom Navigation Bar ·
  Video Player Buttons · Audio Visualizer · Favorite Feed Algorithms · Profile badges ·
  Payment Targets · BOLT12 Offers · **Security Filters** · Translations · Connected Apps ·
  Relay Authentication · Call Settings.
- **`app_settings` = „App Settings":** Privacy Options · UI Preferences · Home · Notifications ·
  Compose Settings · Profile UI · Calendar reminders · Bitcoin Explorer (OTS) · Namecoin Settings ·
  App resource usage.
- **`danger_zone` = „Danger Zone":** **Backup Keys** · Request to Vanish · Vanish History ·
  Reset Marmot State. Cała sekcja kodowana kolorem błędu (łososiowe etykiety, ciemnoczerwone kafelki).
  „Reset Marmot State" pyta dialogiem potwierdzenia.
- **Smak F-Droid:** nie ma czwartej kategorii „About & Legal" (Privacy Policy / Child Safety
  Standards) — lista kończy się na Danger Zone. Za to **ma** wiersz „Push provider" w Notifications,
  którego nie ma w buildzie Play (odwrotnie, niż zakładaliśmy). Tor **nie jest** bramkowany smakiem.

## Login / Sign up

Bez zmian względem v1.12.6 — patrz zamrożona screen-mapa po szczegóły (logo 150 dp z
`amethyst.xml`, pole klucza 280 dp z fioletowym QR i okiem, „Adjust **Tor Settings**", pigułki
50 dp / r35 dp). W smaku F-Droid **nie ma bramki regulaminu** („I accept the terms of use"), którą
pokazuje build Play — czyli nasz brak `TermsGate` jest teraz potwierdzony źródłowo, nie tylko
screenem.

## Compose

Pełny ekran; top bar **X w obrysowanym kółku** (lewo) + **„Post"** (prawo, szary → akcent po wpisaniu
treści). Body: avatar z fioletowym badge konta + pole **„What's on your mind?"**.
Toolbar u dołu, przewijalny. **Bez limitu znaków i bez kółka postępu.**

## Bramkowane / nieodtworzone (świadomie)

- **`FeatureSetType.SIMPLIFIED` jest domyślką** — drugi wiersz nagłówka notatki nie rysuje się wcale.
  Dlatego przeniesienie znaczników do pierwszego wiersza jest tym, co domyślny użytkownik NOWO widzi.
- Bąble live, chip lokalizacji przy filtrze, przycisk BOLT12 na profilu, karta pseudonimu,
  pusty stan zablokowanego użytkownika — wszystkie warunkowe, żadnego nie widać w nagraniu.
- **Discover** i **Shorts**: nagranie ich nie otwiera (wychodzą z dolnego paska), więc obie zakładki
  zostają uczciwymi placeholderami w języku wizualnym Amethysta.
- Ekrany z szuflady poza Wallet/Browser/Messages/Notifications/Profile: wiersze renderujemy wiernie
  (szuflada JEST mapą możliwości appki), ale bez ekranów docelowych — rejestr luk w
  [`docs/gaps/amethyst.md`](../../gaps/amethyst.md).

> **Ważne (środowisko podglądu):** animacje wejścia (framer ORAZ CSS `@keyframes`) **nie postępują**
> w podglądzie — utykają na klatce startowej. Wszystkie overlaye (compose/thread/settings/drawer)
> renderuj **w stanie końcowym**.
