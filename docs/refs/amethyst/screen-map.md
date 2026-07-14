# Amethyst — screen map (ground truth)

**Źródła:** kod `vitorpamplona/amethyst` @ tag **v1.12.6** (Kotlin/Compose, MD3) + oficjalny screenshot
`docs/screenshots/home.png` → [`shots/home.png`](shots/home.png). Każdy wpis: co widać (screen) + czym jest (kod).

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

## Domknięte z wideo (screen recording od użytkownika, 37 klatek scene-detect)
Wideo (`shots/*.mp4`, gitignored) + contact sheets → potwierdziło 5 zbudowanych ekranów i ujawniło resztę.
- **Thread / note-detail** — ZROBIONE: tap notatki (`MaterialCard.onOpenThread`) → `ThreadScreen` (parent + wcięte odpowiedzi z linią-łącznikiem + composer „reply here.." + back). Overlay `z-[60]` (musi być nad app-barem, który jest `md-app-bar-enhanced` sticky z-50 — inaczej home app bar przebija i jego avatar jest klikalny → otwierał drawer).
- **Settings suite** — ZROBIONE (3 widoki w `SettingsScreen` wg `section`): **Application Preferences** (Language/Theme/Image Preview/Video Playback/URL Preview/Profile Picture/Immersive Scrolling/UI Mode/Gallery Style/Push Notification), **Security Filters** (toggle Warn-on-reports/Filter-spam + „Warn" + taby Blocked/Spammers/Hidden + Unblock), **Relays** (Public Outbox/Inbox + nostr.wine 196MB itd. + Add a Relay). Drawer: Settings→preferences, Security→security, Relays→relays. Settings = full-screen `absolute inset-0 z-[55]` **plain div** (framer opacity spring zacinał się na ~0.95 → przebijał feed).
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

_Zweryfikowane side-by-side z [`shots/home.png`](shots/home.png): build OK, 0 błędów w konsoli, struktura zgodna z v1.12.6._
