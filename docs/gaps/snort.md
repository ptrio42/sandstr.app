# Snort — gap ledger

> Ground truth: `docs/refs/snort/screen-map.md` · Sim: `src/simulators/snort/`
> Audited: 2026-08-05 · Registry status: ready · Sim LOC: 6862 (6066 ts/tsx + 796 css)

## Rollup

| missing | dead | partial | unreachable | unanchored | ok |
|---|---|---|---|---|---|
| 11 | 22 | 4 | 6 | 5 | 15 |

**Top 3 do zrobienia:** sno-12 (menu „…" noty — jedyna droga do Mute/Bookmark/Share/Copy ID) · sno-01
(kreator sign-up) · sno-45 (feed picker bez kotwicy).
*(Poprzednie: sno-63 mostek i sno-37 wątek zamknięte 2026-08-06 razem z kotwicami sno-44/47/48/49/50.)*

Konwencja statusów w tym pliku (spójna z README): **`dead`** = kontrolka jest w symulatorze, klik nic
nie robi, a realna apka reaguje (nawet jeśli reakcją jest podstrona, której u nas nie ma — cel jest
w kolumnie *Gap*). **`missing`** = powierzchni/kontrolki nie ma w ogóle. Ścieżki w kolumnie *Surface*
są po angielsku, bo FAQ pyta angielskimi słowami. Evidence = ścieżki względem
`src/simulators/snort/`.

**Świadomie odtworzone bugi/nieobecności upstreamu — NIE luki, nie zgłaszaj ich ponownie:** blank tile
przy `Settings → Relays` (§14), brak Decka (§5.6, potrójnie martwy upstream), "Dead" uptime obok
"Connected" (§12), brak koloru na reply/repost (`text-nostr-purple`/`-blue` nieistniejące, §4.4), brak
podświetlania składni w blokach kodu (§4.3), brak stanu wizualnego zaznaczonego wiersza DM i niewidoczna
kropka `has-unread` (§10), martwy link "Supported Extensions" (§15), brak zakładek z podkreśleniem
(§18.3), brak pola na klucz prywatny na logowaniu (decyzja Sandstr, commit `2b885f2`).

## Gaps

| ID | Surface (ścieżka w UI) | § | Status | Gap | Evidence | FAQ impact | Effort |
|---|---|---|---|---|---|---|---|
| sno-01 | Sign in → "Sign Up" → sign-up wizard | §15 | missing | Guzik jest, kreatora nie ma — 5 ekranów (Name/nym → Profile Image → Topics → Recommended for you → Clean up your feed) nie istnieje; klik loguje demo | `screens/LoginScreen.tsx:190` (`onClick={enterDemo}`), brak plików onboardingu w `screens/` | blocks-showme | L |
| sno-02 | Feed → note → tap an image · Profile → tap the avatar → full-screen lightbox | §4.3, §8.1 | missing | Media i awatar profilu nie mają żadnego handlera; upstream otwiera pełnoekranowy spotlight ze strzałkami i zawijaniem | `components/MediaEmbed.tsx:43,55` (`<img>` bez `onClick`), `screens/ProfileScreen.tsx:420` | blocks-showme | M |
| sno-03 | Feed → note → zap (long-press) → Zap modal | §4.4 | missing | Klik robi tylko fast-zap stałych 50 satów; nie ma modala z kwotą/komentarzem ani fallbacku po błędzie | `components/NoteCard.tsx:286-294` (`setZapped((v) => !v)`, `+50`) | blocks-showme | M |
| sno-04 | Feed → note → hover the avatar → profile hover-card | §4.2 | missing | Awatar jest tylko linkiem do profilu; upstream ma Radix HoverCard (openDelay 100) na KAŻDEJ nocie | `components/NoteCard.tsx:146-159` (tylko `onClick`) | blocks-showme | M |
| sno-05 | Feed → "{name} reposted" label bar | §4.6 | missing | Pasek repostu (18px `repeat` + "{name} reposted" nad notką) ma gotowy props, ale **żaden ekran go nie przekazuje** — kind-6 nigdy nie pojawia się w feedzie | `components/NoteCard.tsx:49,128-138`; grep `repostedByName` w `screens/` = 0 trafień | blocks-showme | S |
| sno-06 | Feed → note with a content warning / muted note | §4.6 | missing | Brak `WarningNotice` (blok `text-warning` + 26px `alert-circle`) i brak zwinięcia "This note has been muted" + Show | absent — `components/NoteCard.tsx:196-238` renderuje treść bezwarunkowo | blocks-showme | M |
| sno-07 | Feed → poll note (vote by zapping) | §4.6, §11 | missing | Composer potrafi zbudować ankietę, ale feed nie umie jej wyrenderować ani zagłosować — nic nie stoi między treścią a stopką | absent w `components/NoteCard.tsx:239`; kreator ankiety w `screens/ComposeScreen.tsx:158-194` | blocks-showme | M |
| sno-08 | Thread → reply → "re: @name" sub-header line | §4.8 | missing | Linia `re:` (≤2 wzmianki + "& {n} others" w `<small>`) nieodtworzona — świadomie odłożona, bo należy do `NoteCard`, nie do wątku | absent w `components/NoteCard.tsx:174-177`; decyzja opisana w `screens/ThreadScreen.tsx:34-37` | none | M |
| sno-09 | Compose → textarea → "@" mentions · ":" emoji | §11 | missing | Zwykły `<textarea>`; brak obu triggerów autouzupełniania (10 wierszy profili / 5 wierszy emoji) | `screens/ComposeScreen.tsx:143-152` | blocks-showme | M |
| sno-10 | Settings → Relays → relay name → relay detail page | §12 | missing | Nazwa relaya to zwykły tekst; nie ma podstrony z 80px faviconem, chipem Paid/Free, siatką Admin/Contact/Software/Status/Permissions/Uptime, "View Feed" i "Supported NIPs" | `screens/RelaysScreen.tsx:241-248` (komentarz: "detail page is out of scope") | blocks-showme | M |
| sno-11 | Messages → group chat row / "Group Chat" · "Secret Group Chat" | §10 | missing | Lista i okno obsługują wyłącznie rozmowy 1:1 — brak nakładających się awatarów, tytułu grupy i nagłówka grupowego | absent — `screens/MessagesScreen.tsx:484-537` (`ChatRow` przyjmuje jednego `user`) | blocks-showme | M |
| sno-12 | Feed → note → "…" menu | §4.5 | dead | Ikona `dots` renderuje się i ma `cursor-pointer`, ale `onClick` tylko zatrzymuje propagację — cały kontekst (Reactions · Share · Pin · Bookmark · Copy ID · Mute · Broadcast Event · Translate · Copy Event JSON · Delete) jest nieosiągalny. To JEDYNA droga do share i bookmark w Snorcie (§4.4: w pasku akcji ich nie ma) | `components/NoteCard.tsx:185-192` (`onClick={stop}`) | breaks-showme | M |
| sno-13 | Feed → note → zapper avatars → Reactions modal | §4.4 | dead | Trzy nakładające się awatary zapperów są renderowane, ale klik nic nie robi; upstream otwiera modal reakcji na zakładce Zaps | `components/NoteCard.tsx:297-303` | breaks-showme | M |
| sno-14 | Profile → QR button | §8.2 | dead | Pierwszy przycisk rzędu akcji, bez `onClick`; upstream pokazuje kod QR profilu | `screens/ProfileScreen.tsx:428-430` | breaks-showme | M |
| sno-15 | Profile (own) → "Edit" | §8.2 | dead | Bez `onClick`; upstream prowadzi do `/settings/profile` (a na mobile ten sam slot to "Settings" → `/settings`) | `screens/ProfileScreen.tsx:434-436` | breaks-showme | M |
| sno-16 | Profile (other) → zap button · lightning address row | §8.2, §8.3 | dead | Oba elementy udają klikalność (przycisk `icon` i `cursor-pointer hover:underline`), oba bez handlera; upstream otwiera ZapModal — ten sam brak co sno-03 | `screens/ProfileScreen.tsx:441-443`, `:503-505` | breaks-showme | M |
| sno-17 | Left rail → wallet balance row (+ "⋮") | §5.1 | dead | Wiersz ma `cursor-pointer`, saldo, kurs i ikonę `dots` — i zero handlerów; `/wallet` (+ send/receive) nie istnieje w symulatorze | `SnortSimulator.tsx:647-660` | breaks-showme | M |
| sno-18 | Left rail (logged out) → "Sign up" | §5.1 | dead | Pomarańczowy `primary` guzik z ikoną `sign-in` bez `onClick` — jedyne CTA rejestracji na wylogowanej powłoce; celem jest kreator z sno-01 | `SnortSimulator.tsx:691-694` | breaks-showme | S |
| sno-19 | Right column → Ask Snort AI → send arrow / Enter | §5.4 | dead | Strzałka nie ma `onClick`, a textarea nie ma `onKeyDown` — upstream na Enter idzie do `/agent` | `components/RightColumn.tsx:290-297`, `:300-308` | breaks-showme | M |
| sno-20 | Right column → Back up your keys → "Back up now" | §5.4 | dead | Guzik bez `onClick` (dismiss "×" obok działa). Arguable: §5.4 opisuje TaskList, ale nie precyzuje CTA — nasz label jest wymyślony, więc fix = podpiąć albo usunąć | `components/RightColumn.tsx:352-354` | breaks-showme | M |
| sno-21 | Right column → Trending Notes → gear | §5.4 | dead | `SmallIconButton` bez `onClick`; upstream otwiera selektor DVM (kind 5300) | `components/RightColumn.tsx:403-406` (brak `onClick` w wywołaniu), `:130-154` | breaks-showme | M |
| sno-22 | Compose → attachment (paperclip) | §11 | dead | `<span cursor-pointer>` bez handlera. Nieosiągalny cały łańcuch uploadu: dropdown "From Server"/"From File", wiersze postępu (Preparing…/Uploading…/Mirroring…/Processing…/Complete), miniatury 80×80 z "×", flyout "Attach Media" | `screens/ComposeScreen.tsx:202-204` | breaks-showme | L |
| sno-23 | Compose → advanced (gear) | §11 | dead | `<span cursor-pointer>` bez handlera; panel "Custom Relays" / "Zap Splits" / "Sensitive Content" nie istnieje (a to jedyna droga do oznaczenia treści wrażliwej) | `screens/ComposeScreen.tsx:215-217` | breaks-showme | M |
| sno-24 | Home → live-stream card | §6.3 | dead | Kafelek ma `cursor-pointer` i zero handlerów. Arguable: §6.3 opisuje wygląd paska, nie mówi wprost, dokąd prowadzi klik — minimalny fix to zdjąć kursor, pełny to ekran streamu | `screens/TimelineScreen.tsx:213-235` | breaks-showme | M |
| sno-25 | Notifications → a notification group row | §9.2 | dead | Wiersz nie ma `onClick` (ani `cursor-pointer`), więc z powiadomienia nie da się wejść w notkę/profil; upstream ma `cursor-pointer` i nawiguje po `contextLink` | `screens/NotificationsScreen.tsx:232-236` | breaks-showme | S |
| sno-26 | Settings → Profile | §14 | dead | Wiersz z kafelkiem i chevronem jest, ekranu edycji profilu nie ma — `onClick` jest `undefined` dla wszystkiego poza Relays | `screens/SettingsScreen.tsx:126` (`item.id === 'relays' ? onOpenRelays : undefined`), `:77` | breaks-showme | M |
| sno-27 | Settings → Export Keys | §14 | dead | Jak wyżej — najczęstsze pytanie FAQ o klucze kończy się kliknięciem w pustkę | `screens/SettingsScreen.tsx:78,126` | breaks-showme | M |
| sno-28 | Settings → Preferences | §14 | dead | Jak wyżej. To podstrona z motywem, językiem, mediami, domyślną kwotą zapa i `autoTranslate` — czyli cel większości pytań "how do I change…" | `screens/SettingsScreen.tsx:80,126` | breaks-showme | L |
| sno-29 | Settings → Wallet | §14 | dead | Jak wyżej; `/wallet` + `lndhub`/`nwc`/`alby` nie istnieją (ten sam brak co sno-17) | `screens/SettingsScreen.tsx:81,126` | breaks-showme | L |
| sno-30 | Settings → Moderation | §14 | dead | Jak wyżej; jedyna ścieżka do mutelisty poza `…` menu (sno-12) | `screens/SettingsScreen.tsx:89,126` | breaks-showme | M |
| sno-31 | Settings → Log Out | §14 | dead | Wiersz jest, wylogowania nie ma — `currentUser` nigdy nie wraca do `null`, a w unii komend nie ma `logout` | `screens/SettingsScreen.tsx:105,126`; `SnortSimulator.tsx:62` | breaks-showme | S |
| sno-32 | Settings → Nostr Address · Tools · Notifications · Cache · Media · Donate | §14 | dead | Pozostałe sześć wierszy indeksu, wszystkie z tym samym `undefined` handlerem i bez podstron (Donate prowadzi upstream do `/about`) | `screens/SettingsScreen.tsx:79,82,90,91,92,98` + `:126` | breaks-showme | L |
| sno-62 | Profile → note → reply · Search results → note → reply | §4.4 | dead | Ikona `reply` z licznikiem renderuje się na KAŻDEJ notce, ale `ProfileScreen` i `SearchScreen` nie przekazują `onReply` do `NoteCard`, więc `onClick={() => onReply?.(note)}` jest tam no-opem. Modal odpowiedzi otwiera się wyłącznie z feedu i z wątku — a to jedyne dwa ekrany, które ten prop podają | `screens/ProfileScreen.tsx:259-266`, `:369-376`, `screens/SearchScreen.tsx:144-152` (brak propa) vs `components/NoteCard.tsx:246`, `SnortSimulator.tsx:397,407` | breaks-showme | S |
| sno-63 | (cały klient) FAQ „Show me" → symulator | — | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: missing. **Nie ma mostka FAQ.** Wrapper nie importuje ani nie renderuje `FaqMiniTourLauncher`, nie ma `faqCommandsRef` ani gałęzi `isFaqStepId` w `onStepChange`, a `src/data/faq/index.ts` nie mapuje `snort`. `SHOW_FAQ_EVENT` poleci więc w próżnię i **żaden** `showMe` z tego pliku nie zadziała — warunek konieczny dla każdego innego wiersza `blocks-showme`. Wzorzec do skopiowania: `src/simulators/damus/DamusSimulatorWithTour.tsx:9,22,74,92-98,147` | `SnortSimulatorWithTour.tsx` (brak `FaqMiniTourLauncher`) · `src/data/faq/index.ts:4-6` | blocks-showme | S |
| sno-33 | Feed → note → repost | §4.4 | partial | Klik repostuje od razu; upstream **nigdy nie repostuje bezpośrednio** — otwiera dropdown **Repost** (`repeat`) / **Quote Repost** (`edit`), więc cytowanie jest u nas nieosiągalne | `components/NoteCard.tsx:252-260` | breaks-showme | M |
| sno-34 | Left rail → profile row (bottom) → ProfileMenu | §5.1 | partial | Trigger (awatar + nazwa + chevron) jest, ale klik idzie prosto na profil; brak menu **Profile** / captionu "Switch accounts" / wierszy innych sesji / czerwonego "Read Only" | `SnortSimulator.tsx:698-713` | breaks-showme | M |
| sno-35 | Keyboard shortcuts | §5 | partial | Działa tylko `n` (compose) i wewnętrzne `g`+`h`; brak `.` (scroll-to-top), `/` (focus search — hook przechwytuje klawisz i woła nieprzekazany `onSearch`, czyli robi `preventDefault` w próżnię), `t`, ⌘K, Esc-clear. Zestaw skrótów w hooku jest odziedziczony, nie snortowy | `SnortSimulator.tsx:279`; `hooks/useKeyboardShortcuts.ts:64-69,71-76,142-161` | blocks-showme | S |
| sno-36 | Profile → Followers / Follows → pager | §8.4 | partial | Jest sam napis "Page 1 of 1 ({n} items)"; brak przycisków **Previous** / **Next** i stronicowania po 50 | `screens/ProfileScreen.tsx:244-247` | none | S |
| sno-37 | Feed → note → thread (via tour command) | §4.8, §5.7 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. `navigate: 'thread'` ustawia ekran, ale nie ustawia `selectedNote`/`selectedThread`, więc wątek renderuje "This note could not be loaded." Wątek z treścią osiągalny WYŁĄCZNIE klikiem w notkę → żaden `showMe` go nie pokaże | `SnortSimulator.tsx:307-312`, `screens/ThreadScreen.tsx:101-105` | blocks-showme | S |
| sno-38 | Search results (Notes / People) | §13 | unreachable | `navigate: 'search'` zostawia `searchQuery` puste, a §13 (wiernie) nie renderuje przy pustej frazie nic — nie ma komendy z payloadem frazy | `SnortSimulator.tsx:258-262,428-437`, `screens/SearchScreen.tsx:141,157` | blocks-showme | S |
| sno-39 | Compose in REPLY mode ("Reply To" + przycisk "Reply") | §11 | unreachable | Komenda `compose` czyści `replyTo`, `post` tylko otwiera modal — żadna komenda nie ustawia kontekstu odpowiedzi; osiągalne tylko klikiem w ikonę reply na notce | `SnortSimulator.tsx:314-323`, `screens/ComposeScreen.tsx:87-103` | blocks-showme | S |
| sno-40 | Profile → Reactions · Followers · Follows · Zaps · Relays · Bookmarks · Muted | §8.4 | unreachable | Zakładka to lokalny `useState`; `viewProfile` nie przyjmuje payloadu zakładki, a login + viewProfile + tab = 3 komendy, czyli ponad limit kolejki (2) | `screens/ProfileScreen.tsx:99`; `SnortSimulator.tsx:325-332` | blocks-showme | M |
| sno-41 | Mobile bottom tab bar · narrow icon rail | §5.5, §5.1 | unreachable | Oba stany są zbudowane i wierne, ale bramkowane szerokością KONTENERA (`<=768` = bottom bar, `<900` = wąski rail), której **żadna komenda nie zmienia** — stąd `unreachable`. Uwaga: one się w produkcie POKAZUJĄ, wbrew intuicji „karta ma zawsze 1022px": scena to `max-w-6xl` minus `sm:pl-[84px]` + `pr-5`, więc przy viewporcie 768px sim dostaje ~662px (bottom bar), a przy ~900-1000px ~780-880px (wąski rail); dopiero od ~1024px karta osiąga pełne 1022px, a poniżej 640px `gated` wycina klienta całkiem. Fix = komenda wymuszająca compact, nie budowa powierzchni | `SnortSimulator.tsx:193-198,512-520,549-608`; host: `src/host/ClientView.tsx:400,454,590-591`, `src/host/useMediaQuery.ts:31` | blocks-showme | M |
| sno-42 | Messages → "+" → New Chat modal | §10 | unreachable | Modal działa, ale otwiera go tylko klik w `+`; brak komendy (login + navigate 'messages' zjada cały budżet 2 komend) | `screens/MessagesScreen.tsx:233-240,393-473` | blocks-showme | S |
| sno-43 | Home → feed picker → otwarta lista kanałów | §6.1 | unreachable | `pickerOpen` to lokalny stan bez komendy; `showMe` może podświetlić trigger, ale nie rozwiniętą listę ani innej zakładki niż domyślne "Following". Lista ma **8** pozycji, nie 9 — `Topics` jest u upstreamu warunkowe (`user has interest tags`) i celowo pominięte | `SnortSimulator.tsx:73-82,114,469-479,747-765` | blocks-showme | S |
| sno-44 | Left rail → Home · Discover · Notifications · Messages · Settings | §5.1 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Pięć wiernych, działających pozycji nawigacji bez ani jednego `data-tour` — nie da się wskazać spotlightem "kliknij Settings" | `SnortSimulator.tsx:662-677` | blocks-showme | S |
| sno-45 | Home → header feed picker | §6.1 | unanchored | Sygnaturowy dropdown (jedyna rzecz w desktopowym nagłówku) bez kotwicy | `SnortSimulator.tsx:469-479`, `:726-767` | blocks-showme | S |
| sno-46 | Right column → Search box | §5.4 | unanchored | Jedyna desktopowa droga do wyszukiwarki (rail prowadzi do Discover) i nie ma kotwicy | `components/RightColumn.tsx:189-222` | blocks-showme | S |
| sno-47 | Notifications (ekran + 4 filtry ikonowe) | §9.1 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Ekran i przełączniki reactions/zaps/reposts/mentions działają, ale nie mają `data-tour` | `screens/NotificationsScreen.tsx:196-219` | blocks-showme | S |
| sno-48 | Messages (lista, "Mark all read", rozmowa, composer) | §10 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Cały ekran DM bez kotwicy | `screens/MessagesScreen.tsx:211-241,325-387` | blocks-showme | S |
| sno-49 | Search (pole + zakładki Notes / People) | §13 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Brak kotwicy na polu i na pigułkach | `screens/SearchScreen.tsx:114-138` | blocks-showme | S |
| sno-50 | Thread (wątek z linią połączeń) | §4.8 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Brak kotwicy na korzeniu wątku i na odpowiedziach | `screens/ThreadScreen.tsx:109-136` | blocks-showme | S |
| sno-51 | Settings → Relays → "Add Relays" (textarea + "Add") | §12 | unanchored | Zakotwiczony jest cały ekran (`snort-relays`), więc spotlight na "jak dodać relay" obejmie całą stronę zamiast pola | `screens/RelaysScreen.tsx:308-331` vs kotwica w `:195` | blocks-showme | S |
| sno-52 | Profile → tab pills | §8.4 | unanchored | Rząd pigułek działa, ale kotwica jest tylko na całym profilu i na Follow | `screens/ProfileScreen.tsx:564-580` | blocks-showme | S |
| sno-53 | Compose → "Preview" toggle · poll icon | §11 | unanchored | W modalu zakotwiczony jest wyłącznie przycisk Send (`snort-post`) | `screens/ComposeScreen.tsx:205-229` | blocks-showme | S |
| sno-54 | Settings → Relays → My Relays (Read/Write, trash, Save) | §12 | ok | Tabela, dwa klikalne słowa uprawnień, kasowanie i Save działają; "Dead" obok "Connected" to celowo odtworzony bug | `screens/RelaysScreen.tsx:234-304` | none | — |
| sno-55 | Settings → Relays → Popular Relays / Close Relays | §12 | ok | Obie sekcje startują zwinięte, kolumny i "Add" działają | `screens/RelaysScreen.tsx:334-426,511-528` | none | — |
| sno-56 | Feed → note action bar (reply → repost → heart → zap → zappers) | §4.4 | ok | Kolejność, ikony 18px, suma satów w zapie, liczniki ukryte przy 0 i brak koloru na reply/repost — zgodne; braki dotyczą menu repostu (sno-33) i modali (sno-03, sno-13) | `components/NoteCard.tsx:239-304` | none | — |
| sno-57 | Discover (pigułki + Follow) | §7, §8.4 | ok | Pigułkowe `TabSelectors`, opis, pole "Search sets…" i Follow działają; jest kotwica `snort-discover` | `screens/DiscoverScreen.tsx:170-261` | none | — |
| sno-58 | Profile → "follows you" chip + "Followed by …" | §8.3 | ok | Brak rzędu statystyk (wiernie), social proof i chip na miejscu | `screens/ProfileScreen.tsx:484-491,528-559` | none | — |
| sno-59 | Home → "N new notes" pill + "Load more" | §6.4 | ok | Fioletowa pigułka z awatarami i strzałką znika po kliknięciu; "Load more" dokłada porcję | `screens/TimelineScreen.tsx:141-186` | none | — |
| sno-60 | Messages → conversation (bubbles, Mark all read, unread, Other Chats) | §10 | ok | Gradient tylko na własnych dymkach, Enter wysyła, "Other Chats" startuje zwinięte, Note to Self pierwsze | `screens/MessagesScreen.tsx:243-320,353-387` | none | — |
| sno-61 | Sign in card | §15 | ok | 460px `layer-1`, `mt-15vh`, `float-right` translate + `<select>`, pomarańczowa odznaka klucza w białej pigułce, kotwica `snort-login` | `screens/LoginScreen.tsx:107-195` | none | — |

## Anchors — `data-tour` obecne w symulatorze

**23 różne wartości `data-tour`** (15 literałów + rodzina `snort-nav-*` ×5 + `snort-note`,
`snort-interactions`, `snort-settings-preferences` z wyrażeń warunkowych) z 21 miejsc w kodzie —
metodologia liczenia w [`../GAPS.md`](../GAPS.md).

| Selector | Plik:linia | Powierzchnia |
|---|---|---|
| `[data-tour="snort-login"]` | `screens/LoginScreen.tsx:130` | karta Sign In (460px `layer-1`) |
| `[data-tour="snort-login-extension"]` | `screens/LoginScreen.tsx:165` | przycisk logowania rozszerzeniem (NIP-07) |
| `[data-tour="snort-feed"]` | `screens/TimelineScreen.tsx:161` | lista notek na home feedzie (`.snort-feed`) |
| `[data-tour="snort-note"]` | `components/NoteCard.tsx:130` | cała **pierwsza** karta notki (`tourTarget`) |
| `[data-tour="snort-interactions"]` | `components/NoteCard.tsx:245` | pasek akcji **pierwszej** notki (`tourTarget`) |
| `[data-tour="snort-nav-<screen>"]` | `SnortSimulator.tsx:709` (szablon) | Rodzina: 5 pozycji raila — `timeline` `discover` `notifications` `messages` `settings` (`NAV` `:85-91`). **Dodane po audycie, zamyka sno-44** |
| `[data-tour="snort-compose"]` | `SnortSimulator.tsx:724` (rail) **i** `:625` (dolny pasek ≤768px) | przycisk "＋ New Note"; obie gałęzie noszą tę samą nazwę, ale montuje się dokładnie jedna (komentarz `:621-624`) |
| `[data-tour="snort-post"]` | `screens/ComposeScreen.tsx:238` | przycisk "Send"/"Reply" w modalu compose |
| `[data-tour="snort-profile"]` | `screens/ProfileScreen.tsx:412` (+ `:199` pusty stan) | cały ekran profilu |
| `[data-tour="snort-profile-header"]` | `screens/ProfileScreen.tsx:419` | nagłówek profilu (AvatarSection + ProfileDetails: awatar, akcje, nazwa, NIP-05, bio) |
| `[data-tour="snort-follow"]` | `screens/ProfileScreen.tsx:473` | przycisk Follow/Unfollow (tylko cudzy profil) |
| `[data-tour="snort-settings"]` | `screens/SettingsScreen.tsx:113` | indeks ustawień (`.snort-settings`) |
| `[data-tour="snort-settings-preferences"]` | `screens/SettingsScreen.tsx:124` (warunek `item.id === 'preferences'`) | Settings → wiersz „Preferences" |
| `[data-tour="snort-relays"]` | `screens/RelaysScreen.tsx:195` | cały ekran relayów |
| `[data-tour="snort-discover"]` | `screens/DiscoverScreen.tsx:170` | cały ekran Discover |
| `[data-tour="snort-notifications"]` | `screens/NotificationsScreen.tsx:194` | cały ekran Notifications (zamyka sno-47) |
| `[data-tour="snort-messages"]` | `screens/MessagesScreen.tsx:212` | cały ekran Messages (zamyka sno-48) |
| `[data-tour="snort-search"]` | `screens/SearchScreen.tsx:114` | cały ekran Search (zamyka sno-49) |
| `[data-tour="snort-thread"]` | `screens/ThreadScreen.tsx:110` | cały ekran wątku (zamyka sno-50) |

Bez kotwicy nadal: feed picker (sno-45), SearchBox (sno-46), Add Relays (sno-51), pigułki profilu
(sno-52), kontrolki stopki compose (sno-53).

## Reachability — komendy toura

**Union:** `type: 'login' | 'navigate' | 'compose' | 'post' | 'viewProfile'`
(`SnortSimulator.tsx:61-64`, `switch` w `:285-333`; mapa kroków w `SnortSimulatorWithTour.tsx:57-74`).
Payloady: `navigate` → `SnortScreen` (`'login' | 'timeline' | 'thread' | 'profile' | 'relays' |
'settings' | 'discover' | 'notifications' | 'messages' | 'search'`), `viewProfile` → `'other'` albo brak
(= własny profil). `compose` i `post` payloadu nie czytają. **Nie ma komendy `logout`** — wylogowaną
powłokę daje `navigate: 'login'` (`SnortSimulator.tsx:339` renderuje gałąź `isAuthed=false` po samym
ekranie). Limit kolejki to 2 komendy na krok, a każdy stan po zalogowaniu zjada jedną na `login`.

| Powierzchnia | Osiągalna komendą? | Czym |
|---|---|---|
| Sign In (wylogowana powłoka + rail + right column) | tak | stan startowy albo `navigate: 'login'` |
| Home feed (+ live strip, new-notes pill, Load more) | tak | `login` + `navigate: 'timeline'` |
| Note action bar (`snort-interactions`) | tak | jw. — kotwica jest na pierwszej notce feedu |
| Compose modal (nowa notka) | tak | `login` + `compose` (albo `post`) |
| Compose w trybie REPLY | **nie** | `compose` zeruje `replyTo`; tylko klik w reply (sno-39) |
| Profil własny | tak | `login` + `viewProfile` |
| Profil cudzy (+ Follow) | tak | `login` + `viewProfile: 'other'` |
| Zakładki profilu poza Notes | **nie** | lokalny `useState`, wymaga 3. kroku (sno-40) |
| Settings (indeks) | tak | `login` + `navigate: 'settings'` |
| Relays | tak | `login` + `navigate: 'relays'` (bezpośrednio, bez przechodzenia przez Settings) |
| Discover | tak | `login` + `navigate: 'discover'` |
| Notifications | tak | `login` + `navigate: 'notifications'` |
| Messages (lista + pierwsza rozmowa) | tak | `login` + `navigate: 'messages'` |
| Messages → New Chat modal | **nie** | tylko klik w `+` (sno-42) |
| Search — ekran | tak | `login` + `navigate: 'search'` |
| Search — WYNIKI | **nie** | brak payloadu frazy, pusty term nie renderuje nic (sno-38) |
| Thread — z treścią | **nie** | `navigate: 'thread'` bez `selectedNote` → "This note could not be loaded." (sno-37) |
| Feed picker rozwinięty / inna zakładka feedu | **nie** | lokalny `pickerOpen`/`feedTab` (sno-43) |
| Bottom tab bar / wąski rail | **nie** | bramka szerokości kontenera, nie stan (sno-41) |

## Poza zakresem / do recon

- **Micro-affordance notki, których świadomie nie policzyłem jako osobnych wierszy** (są w screen-mapie,
  ale mają znikomą wartość dla FAQ i zerową dla `showMe`): modal z rozbiciem punktacji przy ikonie
  `fingerprint` w linii "via {client}" (§4.2), linia `<small>` "Translated from {lang}" /
  "Translation failed" (§4.6), pływająca kopia pigułki "N new notes" po przewinięciu (§6.4),
  podświetlanie dopasowanej frazy w wynikach wyszukiwania (§13), `AutoLoadMore` na Notifications (§9.2).
  Jeśli kolejny fidelity pass ich dotknie — dopisz je jako `sno-62+`.
- **Pole na klucz prywatny na ekranie logowania.** §15 mówi „reprodukuj *kształt* pola", a symulator go
  nie ma w ogóle (`screens/LoginScreen.tsx:92-105`). To **decyzja produktowa** (commit `2b885f2`,
  „stop soliciting private keys"), nie luka — nie zgłaszaj i nie „naprawiaj".
- **Marka.** Zamiast rastrowego `nostrich_512.png` symulator rysuje monogram "S" na gradiencie
  (`screens/LoginScreen.tsx:148-154`) — to wymóg z przeglądu 2026-07-28 (B3, §16), nie luka.
- **Czego screen-mapa nie pokrywa, więc nie da się orzec luki:** treść i zachowanie podstron
  `/settings/{profile,preferences,keys,moderation,notifications,cache,media,tools,handle}` (§14 opisuje
  wyłącznie indeks i kafelki — sno-26…sno-32 mówią „wiersz jest martwy", a nie „ekran wygląda tak"),
  strony `/wallet/{send,receive}`, `/about` (DonatePage), `/help`, `/changelog`, ekran streamu za
  kafelkiem live (§6.3 opisuje tylko pasek) oraz zawartość modala QR profilu (§8.2 wymienia sam
  przycisk). Każde z nich wymaga osobnego reconu, zanim ktokolwiek je zbuduje.
- **Nagranie nie pokrywa** dark theme, żadnego viewportu <1024px ani dymków DM (§17) — jeśli kolejny
  pass będzie je zmieniał, ma za sobą tylko repo, nie side-by-side.
