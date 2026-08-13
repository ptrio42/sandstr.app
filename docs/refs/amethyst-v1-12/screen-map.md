# Amethyst — screen map (ground truth)

> **FROZEN 2026-08-13 — snapshot dla `amethyst-v1-12` (reproduces v1.12.6); nie edytować.**
> Żywa wersja: `docs/refs/amethyst/screen-map.md`. Shots pozostają w żywym katalogu
> (`docs/refs/amethyst/shots/`), dopóki nowy recon nie podmieni pliku o tej samej nazwie.

**Źródła:** kod `vitorpamplona/amethyst` @ tag **v1.12.6** (Kotlin/Compose, MD3) + oficjalny screenshot
`docs/screenshots/home.png` → [`shots/home.png`](shots/home.png). Każdy wpis: co widać (screen) + czym jest (kod).
**Dogrywka 2026-08-05:** dwa brakujące ekrany logged-off od użytkownika — [`shots/login.png`](shots/login.png)
i [`shots/signup.png`](shots/signup.png) — zweryfikowane razem z `main` (`LoginScreen.kt`, `SignUpScreen.kt`,
`KeyTextField.kt`, `res/values/strings.xml`, `res/drawable/amethyst.xml`). Patrz sekcja „Login / Sign up".

## Home — app bar (góra)
Ze screena, od lewej:
- **LEFT = avatar użytkownika** (okrągłe zdjęcie), tap → otwiera **drawer** (konto/relay). NIE hamburger, NIE logo.
  Kod: `HomeTopBar.kt` → `UserDrawerSearchTopBar.kt` `LoggedInUserPictureDrawer`, `onClick = nav::openDrawer`.
- **CENTER = selektor feedu „All Follows ⌄"** (etykieta wybranego feedu + chevron w dół). NIE logo/checkmark.
  Tap → otwiera **zgrupowany Dialog** z feedami (All Follows / Global / listy / #hashtagi / communities…).
  Kod: `FeedFilterSpinner.kt` (`ExpandMore` chevron), default `TopFilter.AllFollows` → string `follow_list_kind3follows` = „All Follows".
- **RIGHT = licznik relayów „16/16" (szary) + fioletowa ikona grafu relayów** (połączone węzły).
  ⚠️ Niuans wersji: screenshot pokazuje graf relayów; źródło v1.12.6 w tym slocie ma lupę (Search). Bazujemy na **screenie** (graf + „16/16").

## Home — sub-taby (pod app barem)
- **„New Threads" | „Conversations"** (aktywny podkreślony fioletem). Trzeci „Everything" bywa włączany.
  ⚠️ **SIM BŁĄD:** symulator ma „Following / Global" — to NIEPRAWDA. Following-vs-Global należy do selektora feedu w app barze, nie do tego rzędu tabów. Kod: `HomeScreen.kt` `AssembleHomeTabs` (`new_threads`/`conversations`/`home_tab_everything`).

## Home — treść
- **Rząd LIVE (nie stories!):** pojedynczy pasek „live-now" na górze feedu (NIP-53), np. „Exploring random ideas… / LIVE 🚀17 ⚡122.5k". To bąbel trwających transmisji, NIE karuzela stories per-user.
  ⚠️ **SIM BŁĄD:** symulator ma instagramowy „stories row" — Amethyst go NIE ma. Kod: `home/live/DisplayLiveBubbles`.
- **Karty notatek:** avatar-left (robohash), nagłówek `name @handle` + znak boost (⟲ „boosted • 35m"), znaczki NIP-05 (zielona pieczątka), „Show More" (fioletowy pill) przy ucięciu, media inline. Małe chipy relayów + chevron ⌄ pod avatarem.
- **Footer akcji (ze screena):** `💬14  ⟲35  ♡73  ⚡7.0k  📊911` = **Reply → Boost → Like(serce) → Zap → Stats(słupki, liczba)**. „Like" = reakcja (serce, long-press → emoji; ten sam przycisk). Kod: `ReactionsRow.kt` `DefaultReactionRowItems` = Reply, Boost, Like, Zap, Pay(ukryty), Share; na screenie 5. slot to wskaźnik statystyk/słupki.
- **FAB** = fioletowy „pióro +" (compose), prawy-dół. Kod: `NewNoteButton`.
- ⚠️ **SIM BŁĄD:** symulator ma wymyślony rząd chipów „All/Bitcoin/Nostr/Tech/Memes" — nie ma go w realnym Home.

## Home — bottom nav (5 ikon, bez etykiet)
Ze screena, od lewej: **Home (dom, aktywny fiolet) · Messages (koperta) · Shorts (reels/prostokąt z play) · Discover (globus) · Notifications (dzwonek z fioletową kropką)**. Ikony bez podpisów.
- **BRAK zakładki Profile** (profil = przez avatar→drawer). **BRAK zakładki Search** (search w app barze/źródle).
- Kod: `AppBottomBar.kt` / `NavBarItem.kt`. Źródłowy default v1.12.6 ma 6 (dokłada „Favorite Feed Algorithms"); screenshot pokazuje 5 → **bazujemy na 5 ze screena**. Kropki-badge: `NotificationDotIcon` (kolor `primary`).

## Kolory / avatary (potwierdzone)
- Tło **pure black** `#000000` ✓ (nasz token OK). Akcent fiolet z rodziny `#7F67BE`/`#D0BCFF` ✓. Zap ⚡ orange.
- **Avatary = robohash** generowane **lokalnie na urządzeniu** (nie robohash.org), seed = sha256(pubkey), składane z części body/face/eyes/mouth/accessory. Kod: `commons/.../robohash/RobohashAssembler.kt`.
  ⚠️ **SIM BŁĄD:** symulator hotlinkuje DiceBear (sieć) — powinny być lokalne robohash-owe roboty.

## Messages ([`shots/messages.png`](shots/messages.png)) — ZROBIONE
- **App bar:** avatar (lewo) · **logo Amethyst** na środku (NIE selektor feedu!) · „16/16" + graf relayów (prawo). Potwierdza, że centrum app-bara zależy od ekranu (Home = selektor, Messages = logo).
- **Sub-taby:** „Known" (aktywny) / „New Requests" + ⋮ overflow.
- **Wiersze rozmów:** avatar/ikona grupy · nazwa + `@handle` (szary) + ⚡ (zap-enabled) · ikona ▷ (play) · „• czas" po prawej · podgląd ostatniej wiadomości pod spodem. Public chaty („Nostr Public Chat", „Amethyst Users") mają kwadratowe ikony grup; zielona pieczątka NIP-05.
- **FAB** „+" (fiolet, prawy-dół).
- Zaimplementowane w `screens/MessagesScreen.tsx` + współdzielony `components/AppTopBar.tsx` (center-slot). Avatary = gradient-initials (CSP-safe; robohash zunifikuje je globalnie — #8).

## Notifications ([`shots/notifications.png`](shots/notifications.png)) — ZROBIONE (sygnaturowy ekran)
- App bar jak wyżej (tu selektor pokazuje „Global"). Pod nim: **wiersz podsumowania** „Today ⌄" + `💬41  🔁17(zielony)  ♥152(róż)  ⚡7k(orange)`.
- **Sygnaturowy wykres tygodniowy** (Fri–Thu): wielo-seryjny area chart, **podwójna oś** (lewo liczby 42–339, prawo saty 9k–74k), serie: czerwona/pomarańczowa(zapy)/fioletowa/zielona. To najbardziej rozpoznawalny element — wymaga SVG area-chartu.
- **Reakcje pogrupowane po typie**: rzędy `⚡ / 🔁 / ♥ / 👍 / 🔥 / 🤙 / 👀`, każdy z klastrem avatarów osób, które zareagowały (na rzędzie ⚡ kwoty satów na avatarach: 666/21/1k/5k…). Potem pojedyncze itemy powiadomień.

## Live activity ([`shots/replies.png`](shots/replies.png))
- To NIE zwykły wątek, tylko **widok live-streamu + czat** (otwierany z bąbla LIVE): duży obszar mediów, nagłówek „Exploring random ideas… LIVE 🚀17 ⚡122.5k", bąbelki czatu z reakcjami, composer „reply here.." + Post.

## Profile ([`shots/profile.png`](shots/profile.png) — screen od użytkownika) — ZROBIONE
`ui/screen/loggedIn/profile/ProfileScreen.kt` (+ `header/*`). Góra→dół:
- **Top bar** przezroczysty, płynie nad bannerem: lewo = okrągły back (jeśli `canPop`), prawo = okrągły **⋮ (MoreVert)**. Bez tytułu.
- **Banner** full-width, wys. **150dp**, crop. **Avatar** 100dp, okrągły, **nachodzi na banner** (content column `padding(top=100dp)`).
- **Rząd akcji** (prawo, na wysokości avatara, FilledTonalButton 50dp): **Message/DM · Zap(wallet) · Edit(tylko `isMe`) · Follow/Unfollow · List**. (QR jest niżej, „more" = ⋮ w top barze.)
- **Blok tożsamości:** display name (bold 22sp) + opc. `(zaimki)`; `@username` (szary); skrócony **npub** + copy; **nprofile** + copy + **QR**; „Last seen"; **NIP-05** (✓ + user@domain); **Website** (link); zewn. tożsamości (X/Telegram/Mastodon/GitHub); **lightning** (lud16); badges; **bio** (rich text); divider.
- ⚠️ **BRAK twitterowego paska statystyk** „1.2K followers / 340 following". Liczby są w nagłówkach zakładek Follows/Followers/Relays.
- **Zakładki** (scrollable): **Notes · Replies · Mutual · Gallery · Apps · Follows · [Followers*] · [Zaps*] · Bookmarks · Followed Tags · Reports · Relays** (* warunkowe).
- ⚠️ SIM ma twitterowy profil: „Joined March 2023" (Nostr nie ma daty dołączenia), taby Posts/Replies/Likes, pasek statystyk — do wymiany.

## Compose / New Post ([`shots/compose.png`](shots/compose.png) + [`compose-typed.png`](shots/compose-typed.png) — screeny od użytkownika) — ZROBIONE
`ui/screen/loggedIn/home/ShortNotePostScreen.kt` (VM `ShortNotePostViewModel.kt`). **PEŁNY EKRAN** (Scaffold), nie bottom-sheet. Post: szary gdy pusty → **fiolet gdy jest treść**. Avatar ma mały fioletowy badge konta.
- **Top bar** (`ActionTopBar`): lewo = **X** (Close, zapisuje draft), prawo = filled **„Post"** (`R.string.post`), enabled = `canPost`. Bez selektora konta.
- **Body:** okrągły **avatar** (35dp; tap = post anonimowy → ikona NoAccounts) + pole **„What's on your mind?"** (multiline). Sekcje warunkowe inline: quote, notyfikowani userzy, subject, poll, content-warning, expiration, schedule, geohash, zap-split…
- **Toolbar** (scrollable Row 50dp, kolejność): gallery · files · camera · video · voice · **private(Lock)** · **poll** · zap-split · zapraiser · PoW · **subject** · **sensitive/NSFW** · **expiration(NIP-40)** · schedule · **geohash** · secret-emoji · invoice.
- ⚠️ **BRAK limitu znaków** (grep `maxLength/280` = 0). Bez licznika, bez kółka postępu. Post gated przez `canPost`, nie długość.
- ⚠️ SIM ma **fejkowy 280-limit + kółko postępu** + selektor Public/Followers (nie istnieje) — do usunięcia.

## Login / Sign up ([`shots/login.png`](shots/login.png) + [`shots/signup.png`](shots/signup.png) — screeny od użytkownika 2026-08-05) — ZROBIONE
Dwa ekrany logged-off, ten sam szkielet. Kod: `ui/screen/loggedOff/login/LoginScreen.kt` (`LoginPage`) i
`.../signup/SignUpScreen.kt` (`SignUpPage`) — obydwa to wyśrodkowana `Column` (padding **20dp**,
`verticalScroll`, `imePadding`), więc treść **jest wyśrodkowana w pionie**, bez app-bara i bez footera.

**Wspólna kolejność (verbatim z Compose):**
logo **150dp** (`CustomHashTagIcons.Amethyst`, `ContentScale.Inside`) → **Spacer 40dp** → pole → [tekst błędu,
`colorScheme.error`, `bodySmall`] → **Spacer 10dp** → `TorSettingsSetup` → [`TermsGate`] → **Spacer 10dp** →
**wypełniony pill** → **Spacer 40dp** → pytanie krzyżowe → **Spacer 20dp** → **pill obrysowy**.

- **Logo:** ta sama ikona co launcher — struś wycięty z litery „A". Ścieżki **verbatim** z
  `res/drawable/amethyst.xml` (viewport 512×512, dwie ścieżki: oczko + korpus), gradient **`#652D80` →
  `#2598CF`** (`userSpaceOnUse`, x 22.6 → 489.54).
  ⚠️ **[REC vs REPO]** drawable deklaruje gradient oczka w przestrzeni viewportu (startX 42.27 → endX 55.73),
  co dałoby płaski błękit; realny render (i screen) pokazuje **rampę fiolet→błękit w obrębie samej kropki** —
  reprodukcja używa gradientu `objectBoundingBox`.
- **Pole klucza** (`KeyTextField.kt`): M3 `OutlinedTextField` przy **domyślnej szerokości 280dp**, czyli
  **68% szerokości ekranu** (411dp) — **NIE full-bleed**; ten margines to najbardziej rozpoznawalny detal ekranu.
  `leadingIcon` = **QR** (`ic_qrcode`, 24dp, `tint = colorScheme.primary` → **fioletowy**),
  `trailingIcon` = **oko** (`MaterialSymbols.Visibility`/`VisibilityOff`, kolor on-surface, biały),
  `visualTransformation = PasswordVisualTransformation` (maskowanie), placeholder **„nsec.. or npub.."**
  (`nsec_npub_hex_private_key`). Pod polem warunkowe `PasswordField` (ncryptsec) — na screenie nieobecne.
- **Linia Tor:** `connect_via_tor1` **„Adjust"** (kolor tekstu) + `connect_via_tor2` **„Tor Settings"**
  (akcentowy fiolet). Cały wiersz jest klikalny, ale tylko druga połowa jest zabarwiona.
- **Przyciski:** `Button`/`OutlinedButton`, `RoundedCornerShape(35dp)`, **wysokość 50dp**, etykieta z
  `padding(horizontal = 40dp)` → pill **dopasowany do treści**, nie na całą szerokość.
  ⚠️ **[REC vs REPO]** M3 barwi etykietę `OutlinedButton` kolorem `primary`; realny render trzyma ją
  **białą (on-surface)** przy neutralnym obrysie — bierzemy screen.
- **Login** (`shots/login.png`): pole klucza → „Adjust Tor Settings" → **„Login"** (wypełniony) →
  **„Don't have a Nostr account?"** → **„Sign Up"** (obrysowy).
  `ExternalSignerButton` („Login with Amber") renderuje się **tylko gdy Amber jest zainstalowany** — na
  screenie go nie ma, więc reprodukcja go nie ma.
- **Sign up** (`shots/signup.png`): **„Welcome Ostrich!"** (`titleLarge`) → Spacer 20dp →
  **„How should we call you?"** (`titleMedium`) → Spacer 20dp → pole z placeholderem **„Ostrich McAwesome"**
  (`my_awesome_name`) → „Adjust Tor Settings" → **„Create Account"** (wypełniony) →
  **„Already have a Nostr account?"** → **„Login"** (obrysowy).
  `TermsGate` (checkbox regulaminu) jest w kodzie bezwarunkowo, ale na screenie go **nie ma** — reprodukcja
  pomija, zgodnie z zasadą „recording wygrywa dla layoutu".
- Wszystkie literały potwierdzone verbatim w `res/values/strings.xml`: `welcome`, `how_should_we_call_you`,
  `my_awesome_name`, `nsec_npub_hex_private_key`, `login`, `sign_up`, `create_account`,
  `don_t_have_an_account`, `already_have_an_account`, `connect_via_tor1/2`.
- ⚠️ **Świadome odstępstwo (bezpieczeństwo, nie wierność):** pole klucza używa `DEMO_KEY_PLACEHOLDER`
  zamiast prawdziwego „nsec.. or npub.." i odrzuca wklejony realny nsec — patrz
  `src/simulators/shared/utils/keySafety.ts`. Ta sama reguła obowiązuje w każdej reprodukcji.
- ⚠️ **SIM BŁĄD (naprawiony 2026-08-05):** poprzedni `LoginScreen.tsx` był generycznym stubem — fioletowy
  app bar z ikoną „checkmark w kółku", nagłówek „Welcome", **taby Sign In / Create Account**, osobne pola
  npub i nsec, generator kluczy z toastem „Copied to clipboard!" i stopka „By signing in, you agree to the
  Terms of Service". Nic z tego nie istnieje w prawdziwym Amethyście.

## Domknięte z wideo (screen recording od użytkownika, 37 klatek scene-detect)
Wideo (`shots/*.mp4`, gitignored) + contact sheets → potwierdziło 5 zbudowanych ekranów i ujawniło resztę.
- **Thread / note-detail** — ZROBIONE: tap notatki (`MaterialCard.onOpenThread`) → `ThreadScreen` (parent + wcięte odpowiedzi z linią-łącznikiem + composer „reply here.." + back). Overlay `z-[60]` (musi być nad app-barem, który jest `md-app-bar-enhanced` sticky z-50 — inaczej home app bar przebija i jego avatar jest klikalny → otwierał drawer).
- **Settings suite** — ZROBIONE (3 widoki w `SettingsScreen` wg `section`): **Application Preferences** (Language/Theme/Image Preview/Video Playback/URL Preview/Profile Picture/Immersive Scrolling/UI Mode/Gallery Style/Push Notification), **Security Filters** (toggle Warn-on-reports/Filter-spam + „Warn" + taby Blocked/Spammers/Hidden + Unblock), **Relays** (Public Outbox/Inbox + nostr.wine 196MB itd. + Add a Relay). Drawer: Settings→preferences, Security→security, Relays→relays. Settings = full-screen `absolute inset-0 z-[55]` **plain div** (framer opacity spring zacinał się na ~0.95 → przebijał feed).
- **Security Filters → Hidden Words** — ZROBIONE 2026-08-13, **ze źródła, nie z nagrania**.
  `[REC vs REPO]` **rozjazd strukturalny**: nagranie (2026-07-14) pokazuje na tym ekranie trzy
  ZAKŁADKI (`Blocked Users | Spammers | Hidden Words`) — widać je na kilkunastu klatkach, z aktywnym
  „Blocked Users" i listą npubów z przyciskiem „Unblock". Kod `v1.12.6`
  (`ui/screen/loggedIn/settings/SecurityFiltersScreen.kt`) ma tam natomiast **listę wierszy**
  prowadzących do osobnych ekranów (Blocked Users / Spamming Users / Hidden Words / Muted threads),
  a `HiddenWordsScreen.kt` jest własnym ekranem z własnym top barem. Zgodnie z regułą pierwszeństwa
  **bierzemy nagranie** (layout) — zakładki zostają.
  **Nagranie NIGDY nie otwiera zakładki Hidden Words**, więc jej zawartość jest odtworzona
  z `HiddenWordsScreen.kt` @ v1.12.6, verbatim ze stringów:
  - pusty stan `security_hidden_words_empty` = „No hidden words. Add a word below to hide posts
    containing it." (wcześniej mieliśmy skrócone „No hidden words");
  - pole `AddMuteWordTextField`: `OutlinedTextField`, label **i** placeholder to ten sam string
    `hide_new_word_label` = „Hide new word or sentence", `singleLine`, `ImeAction.Send`, trailing
    `AddButton(isActive = hasChanged)` — czyli przycisk przygaszony, dopóki pole jest puste;
  - pole siedzi w `bottomBar` na `Surface(tonalElevation = 3.dp)`, dociśnięte do dołu ekranu
    (u nas `sticky bottom-0` + kolumna `min-h-full`, bo inaczej wisiało pod ostatnim wierszem);
  - wiersz słowa (`MutedWordRow`): tekst **pogrubiony, wyśrodkowany**, `HorizontalDivider` pod każdym,
    długie przytrzymanie zaznacza (zaznaczenie = tło `primary` @ 12%).
  Czego świadomie NIE odtwarzamy: trybu zaznaczania wielu słów, akcji „show" per wiersz i top bara
  z licznikiem zaznaczeń — nagranie ich nie pokazuje, a demo ich nie potrzebuje.
- **Messages New Requests** — ZROBIONE: npub-owe nieznane kontakty z datami (Known = nazwane wg messages.png).
- **Account drawer** ([`drawer.png`](shots/drawer.png)) — ZROBIONE: banner + avatar + „pitiunited" + „Update your status" (Building nostr stuff… 🧑‍💻 + kosz) + „2374 Following · -- Followers" + menu (Profile/My Lists/Bookmarks/Drafts/Relays 528/1806/Media Servers/Security Filters/Privacy Options/Backup Keys/App Preferences/User Preferences). `absolute` (nie `fixed` — było wychodziło poza telefon), bez slajdu (animacje w podglądzie nie grają — patrz niżej).
- ⏳ Odłożone niuanse z wideo: kontekstowe sub-taby feedu (Global → Follow Packs/Reads/Feed Algorithms/Live Streams); full-bleed media-note z pionowymi akcjami; ekrany Media Servers / Privacy Options / Backup Keys / My Lists / Drafts (w drawerze są, ale bez własnych widoków).

> **Ważne (środowisko podglądu):** animacje wejścia (framer ORAZ CSS `@keyframes`) **nie postępują** w podglądzie — utykają na klatce startowej (opacity ~0.7–0.95, translateX -100%/-31px). Wszystkie overlaye (compose/thread/settings/drawer) renderuj **w stanie końcowym** (plain div, bez enter-animacji), inaczej nie zweryfikujesz i użytkownik widzi utknięty stan.

## Checklista rozbieżności (status)
1. ✅ App bar center: checkmark-logo → **selektor „All Follows ⌄"** (klikalny dropdown feedów).
2. ✅ App bar left: hamburger → **avatar (otwiera drawer)** (placeholder gradient; docelowo robohash — p. #8).
3. ✅ App bar right: search+bell → **„16/16" + ikona grafu relayów** (`Waypoints`).
4. ✅ Sub-taby: „Following/Global" → **„New Threads / Conversations"**.
5. ✅ Usunięto **rząd chipów** i **stories row** → **jeden bąbel LIVE** jako pierwszy element feedu (scrolluje z treścią).
6. ✅ Footer: dodany 5. slot **Stats (słupki + liczba)** → Reply/Boost/Like/Zap/Stats.
7. ✅ Bottom nav: **5 ikon: Home/Messages/Shorts/Discover/Notifications** (bez etykiet, bez Profile; kropka-badge na Notifications; nawigacja tourem programowa, `data-tour` zachowane).
8. ✅ Avatary: DiceBear (sieć) → **lokalne robohash-owe roboty** — `components/Avatar.tsx` (deterministyczny FNV-1a hash → inline-SVG robot: głowa/antena/uszy/oczy/usta, kolory z seedu). CSP-safe, offline. Podmienione wszędzie (feed/thread/profile-notes via MaterialCard, Messages DM, Notifications, Search, Video, app-bar/compose/drawer/profile = ten sam robot usera `pitiunited`). Grupy/logo/live-bubble zostają. **Zdjęcia w postach:** `getSampleImages` (`src/data/mock/utils.ts`) przepisane na lokalne inline-SVG gradient-„photo" jako `data:`-URI (było głównie martwe fake-URL-e + zdalny picsum). Amethyst = **zero zdalnych żądań obrazów** (avatary inline-SVG, media data:-URI), offline/CSP-safe.

9. ✅ **Login / Sign up** (2026-08-05): generyczny stub (fioletowy app bar, taby „Sign In / Create Account",
   osobne pola npub+nsec, generator kluczy, stopka ToS) → **dwa realne ekrany logged-off** — verbatim logo
   z `amethyst.xml`, pole 280dp z fioletowym QR + okiem, „Adjust **Tor Settings**", pill 50dp/r35dp,
   przełączanie Login ↔ Sign Up. Nowy `components/AmethystLogo.tsx`.

_Zweryfikowane side-by-side z [`shots/home.png`](shots/home.png): build OK, 0 błędów w konsoli, struktura zgodna z v1.12.6._
_Login/Sign-up zweryfikowane side-by-side z [`shots/login.png`](shots/login.png) i [`shots/signup.png`](shots/signup.png)._
