# Sandstr — Fidelity Kit (wierne odtwarzanie realnych klientów)

> **Co to jest:** zweryfikowany (multi-agentowy recon, 2026-07-14) zestaw „ground truth" do podnoszenia **wierności** (`fidelity` — najsłabsza oś w `docs/AUDIT.md`, `f`=2–5). Dla każdego z 9 realnych klientów: prawdziwe tokeny marki, **plik-źródło tokenów w repo klienta**, struktura nawigacji i detale, które decydują o rozpoznawalności. Powstało, bo oryginał robiono bez modelu wizji — kolory/nawigacja/layout były zgadywane.
>
> **Klucz:** **wszystkie te klienty są open source.** Wierne odtwarzanie to **port z ground truth**, nie zgadywanie z pamięci. Nie zgadujesz fioletu Amethysta — to stała w `Color.kt`.

## Status / next-up (aktualizuj po każdym kliencie)

**Głębokie flagowce ZROBIONE (wzorzec wierności, recording→recon→screen-map→rebuild→verify):**
- ✅ **Amethyst** (9 powierzchni) — `0ea6f07`, `docs/refs/amethyst/`. **Dogrywka 2026-08-05:** doszły dwa
  brakujące ekrany logged-off (Login ↔ Sign Up) — verbatim logo z `res/drawable/amethyst.xml`
  (`#652D80→#2598CF`), pole 280dp = **68% szerokości ekranu** z fioletowym QR + okiem, „Adjust **Tor
  Settings**", pill 50dp/r35dp; etykieta `OutlinedButton` jest **biała, nie fioletowa** [REC vs REPO].
- ✅ **Damus** (11) — `6ab3956`, `docs/refs/damus/screen-map.md`
- ✅ **YakiHonne** (15) — `eacd2c3`, `docs/refs/yakihonne/screen-map.md`. **Dogrywka 2026-08-05:** drugi
  recording domknął całe onboarding — landing („Enjoy the experience of owning your own data!" + hero +
  Log in / **orange-outlined** Create account / EULA / „Continue as a guest ›"), **Log in** (wielkie
  „Hey, Welcome Back", pole klucza, a metody **Keys / Remote signer** jako karty **przyklejone do dołu**,
  zaznaczenie = **sam 1.5px pomarańczowy obrys**; Remote signer = **QR biały-na-czarnym** + dashed
  `nostrconnect://` + `bunker://`) i **Create account** = 5-stronicowy kreator (Details → Starter packs →
  Interests → Wallet → Preview) z rozszerzającym się wskaźnikiem stron; jedyny **zielony** CTA w apce to
  „Export keys" na ostatniej stronie, a stopka i tak zostaje pomarańczowa.
- ✅ **Primal (web)** (9 powierzchni: Home/Explore/Notifications/Messages/Bookmarks/Profile/Settings/Thread/Login + compose + search-drop) — `docs/refs/primal/screen-map.md` (autorytatywny, 14 sekcji z `PrimalHQ/primal-web-app@main`). Ice(light)+Midnight(dark) OLED, accent BLUE `#2394EF`, akcje reply→zap→like→repost→bookmark (zap 2., like=magenta `#f800c1`), swirl-logo (verbatim path + gradient `#00E0FF→#0090F8→#2554ED`).

- ✅ **Snort (web)** (12 powierzchni: Home/Thread/Profile/Notifications/Messages/Discover/Search/Settings/Relays/Compose/Login + right column) — `docs/refs/snort/screen-map.md` (autorytatywny, 19 sekcji; recording 2026-07-14 + `v0l/snort@3cc8317`), rebuild `cbe56b1`. Accent violet `--highlight` `#ac88ff`(dark)/`#7139f1`(light) **współistnieje** z CTA `--primary #ff3f15` (dawny teal to był błąd — `#1ecbe1` to wyłącznie `--repost`) · reakcja = **SERCE `#ef4444`, nie emoji** · akcje **reply→repost→heart→[PoW]→zap→avatary zapperów** (18px, brak share/bookmark — są w `…`; kolor zmieniają TYLKO serce i zap, bo `text-nostr-purple`/`-blue` nie istnieją) · selektor feedu = **DROPDOWN**, nigdzie nie ma tabów z podkreśleniem (drugi idiom to pill-row) · **domyślny motyw = `system`** · **Deck = martwy kod** · w light mode `.light button` bije utility Tailwinda, więc prawie wszystkie guziki są białe. Przy okazji naprawione: B8 (highlighter usunięty — Snort nie ma kolorowania składni), B9b, B10 (dolny pasek ≤768px), zero requestów zewnętrznych.
  **Gotcha hosta:** frameless klient dostaje dokładnie **1022px** (karta `max-w-5xl`) przy każdym viewporcie — progi breakpointów trzeba skalować do karty, inaczej prawa kolumna nigdy się nie zamontuje. I mierz szerokość callback-refem + `resize`, bo ekran logowania i zalogowany montują różne roota (jednorazowy observer obserwuje odłączony węzeł).

- ✅ **Wisp** (13 powierzchni: login/feed/thread/profile/notifications/chat/wallet/search/compose/zap/
  drawer/settings×4) — `docs/refs/wisp/screen-map.md` (autorytatywny; recording 2026-07-30 +
  `barrydeen/wisp@11ac08f` v1.2.1, 14-agentowy recon). Android, Kotlin/Compose M3; **default = theme
  „custom" DARK, accent `#FF9800`**, bg `#0A0A0B`, error = celowy iOS-red `#FF3B30`; jedyny brand-gradient
  to radial logo `#FFBA60→#E97941` (evenodd ghost z wyciętymi oczami). Akcje **reply→react→repost→zap→
  add-to-list**; serce NIGDY nie barwi się — zastępuje je twój emoji; zap = **₿ CurrencyBitcoin** (bolt
  to opt-in) i pokazuje SUMĘ satów; sygnatura #1 = **undo-countdown „Post now (N)"** na każdym poście.
  Feed-selector = dropdown-pill (For You default); pigułki online+relay-count (zielone) w top barze;
  „∞ Followers"; statusy NIP-38 pod nazwami; ICQ-flower + dźwięk na reply/DM. Odtworzone leaki M3:
  `secondaryContainer #4A4458` na chipach relay read/write/auth i segmencie Gallery|Stack. [REC vs REPO]:
  recording miał **Fiat Mode ON** (default OFF, `FiatPreferences.kt`) — sim szipuje sats+₿; README
  obiecuje Amber/NIP-55, ale **kod NIP-55 nie istnieje** w repo. Opt-in: Barry Deen (`barrydeen`),
  OpenSats-funded, aktywny na Nostr; homepage `wisp.mobile`, Play `com.wisp.app`, MIT.

- ✅ **Coracle (web)** (15 powierzchni: feeds/note-detail/compose/login/bunker/signup×4/relays/profile/
  notifications/messages/start-conversation/groups/lists/invite/settings×5) —
  `docs/refs/coracle/screen-map.md` (autorytatywny, 19 sekcji; recording 2026-08-05 +
  `coracle-social/coracle@efea13f`, 12-agentowy recon). Svelte 4 + Tailwind 3, tokeny wstrzykiwane
  **runtime z `.env.template`** (`VITE_DARK_THEME`/`VITE_LIGHT_THEME`) do `:root`. **Default = DARK**
  (`state.ts:36-40`; **brak `prefers-color-scheme`**), accent **`#FC560E` identyczny w light i dark**,
  **zero gradientów marki**. Killer #1 = **ciepły ramp `tinted-*`** (`#3E3A38`) na sidebarze i kartach
  nad **zimnym `neutral-*`** (`#262626` strona, `#171717` top bar) + **alternacja kart** wg zagnieżdżenia
  (`AltColor.svelte`) — stary sim miał jeden zimny szary i light-first, czyli podwójnie źle.
  Nav = 6 pozycji **tylko tekst**, aktywna **rośnie** + akcentowe podkreślenie (`elasticOut`).
  Akcje: **reply→zap→like→repost→open-with**, ikony **obrysowe** (własny 17×16 partial) poza
  wypełnionym `fa-rotate`; zap = **suma satów**, default 21. Sygnatura = panel **„Your Feeds"**
  (composable feeds). **Login bez pola na klucz** — same delegacje; `.btn` bazowy jest **biały na
  czarnym**, akcent tylko dla akcji głównej. [REC vs REPO]: polskie ekrany w nagraniu to **nstart**
  (`start.njump.me`), osobny projekt — poza zakresem. Opt-in: Jon Staab (`hodlbod`), FUTO Fellow,
  bardzo opt-in-friendly.

- ✅ **Nostur (iOS)** (13 powierzchni: welcome+add-account/feed×3/thread/profile/notifications/
  messages+DM/search/bookmarks/compose/zap/drawer/settings×6) — `docs/refs/nostur/screen-map.md`
  (autorytatywny, 19 sekcji; recording 2026-08-05 + `nostur-com/nostur-ios-public@11bcebb`).
  SwiftUI, **GPL-3.0**, autor Fabian Lachman; `nostur.com`, App Store `1672780508` (+ macOS `.dmg`).
  **10 nazwanych motywów, default dosłownie `"default"`** (`Theme.swift:39`); light/dark to preferencja
  systemu (`preferredColorScheme` = `nil` poza `dark_garnet`) → robimy oba, registry otwiera dark.
  Accent w repo to **`display-p3(51,162,166)`** (`Themes.xcassets/defaultAccentColor.colorset`) —
  naiwny hex `#33A2A6`, kolorymetryczny sRGB `#00A5A8`, a urządzenie maluje **`#00BDA9`**; bierzemy
  recording. **Feed na `listBackground` = `#000`** (nie na `background` `#1C1C1E`); `lineColor` jest
  **akcentowy @35%**, ale separator postów to zwykły `Divider()`.
  Akcje **reply→repost→SERCE→zap(suma satów + „sats")→bookmark**, `space-between`, cały rząd akcentowy,
  aktywny stan barwi dokładnie jedną ikonę (red/green/yellow/orange); default
  `footerButtons: "💬🔄+⚡️🔖"` gdzie `+` = `EmojiButton` = serce. **Killer: `TabButton` ma label ZAWSZE
  akcentowy** — zaznaczenie to wyłącznie 1px podkreślenie. Dalsze sygnatury: **żółw** Low Data Mode
  (30% gdy OFF) + toast i bloki „Loading paused"; akcentowy chip `chevron.compact.down`; media
  edge-to-edge bez radiusa; brak awatara = **płaska seedowana barwa**; „∞ Followers"; 16 pomarańczowych
  monet w „Send sats" (21 default); stopka drawera „Nostur 1.30.2 (Build: 527)" + „Source code".
  [REC vs REPO]: recording to pre-iOS-26 `MainTabs15` (koperta Messages + osobny FAB), repo ma też
  `MainTabs26` bez Messages i z zakładką „New Post" — bierzemy recording; tak samo 3 zakładki feedu,
  bo reszta jest za bramką `viewFollowingPublicKeys.count > 10`. Opt-in: `fabian@nostur.com`,
  `npub1n0stur…`; **`LICENSE` nie ma linii copyright** — autorstwo tylko z nagłówków plików.

**Do zrobienia (druga fala, słabsza wierność / stare stuby):** Keychat, Gossip. Tokeny + killery każdego są niżej w tym pliku; korekty kolorów w `[[client-fidelity-ground-truth]]`. (Primal-MOBILE nadal stary stub — zrobiony tylko web.)

**ZAMROŻONE 2026-08-13 — Amethyst v1.12.6 → archiwum `amethyst-v1-12`.** Pierwszy realny freeze
wg `docs/VERSIONS.md`, wykonany przed przebudową żywego symulatora do v1.13.1-fdroid. Snapshot:
`src/simulators/amethyst-v1-12/` (wpis w liście `archived` w `src/registry.tsx`, trasa
`/c/amethyst-v1-12`), zamrożone dokumenty: `docs/refs/amethyst-v1-12/screen-map.md` +
`docs/gaps/amethyst-v1-12.md`. Tokeny marki Amethysta niżej w tym pliku opisują wersję ŻYWĄ;
archiwum nosi własną kopię arkusza (`amethyst-v1-12.theme.css`) i własną klasę rootową.

**USUNIĘTE 2026-08-05 — Olas.** Upstream `pablof7z/olas` bez pushu od 2025-07 (a `olas-nmp` to nielicencjonowany, niedokończony rewrite), więc nie ma stabilnego ground truth do odwzorowania, a nasza wersja była generycznym klonem Instagrama ze Stories/Follow Requests, których Nostr nie ma. Wypadły: `src/simulators/olas/`, `olas-tour.ts`, `public/icons/olas.svg`, wpisy w rejestrze/configs/typach oraz sekcja tokenów w tym pliku. Historia jest w gicie — gdyby upstream ożył, wracamy przez normalny proces reference-first, nie przez `git revert`.

**Start następnej sesji (agent robiący kolejny symulator):**
1. **Użytkownik NAJPIERW wrzuca referencję** do `docs/refs/<client>/shots/` — screen-RECORDING (mobile: Keychat/Primal-mobile) albo screeny/live-capture (web za Cloudflare: Snort/Primal-web/Coracle — `WebFetch` daje pustą skorupę). Bez realnego renderu nie startuj (layout ≠ pamięć).
2. Odpal **background `Workflow`** recon repo (~11 agentów/powierzchnia) → zapisz verbatim `docs/refs/<client>/screen-map.md`.
3. Czytaj recording (klatki: `ffmpeg select='gt(scene,0.12)'`) + repo RAZEM. **[REC vs REPO]:** recording wygrywa LAYOUT, repo wygrywa HEX/nazwy-ikon/labelki.
4. Rebuild token-first w `src/simulators/<client>/`, reużyj inline-SVG robohash `Avatar` + `data:` media. Zachowaj interfejs komend toura + `data-tour`.
5. Weryfikacja (DoD niżej): `npm run build` + live click-through w podglądzie (**0 błędów, 0 zagnieżdżonych buttonów**), overlaye w stanie końcowym. Port podglądu: fixed `--strictPort` w `.claude/launch.json` (5173 bywa zajęty przez dev usera → użyj np. 5180, potem cofnij). Gotcha: avatar-`<button>` we `flex` bez `items-start` rozciąga się i centruje w pionie.
6. Commit `<client>: faithful, reference-verified reproduction (recording + repo)` (labelowane PNG + screen-map, surowe wideo/klatki w `.gitignore`). Zaktualizuj ten Status.

Pełny how-to w pamięci `[[fidelity-repro-playbook]]`.

## Proces (powtarzalny, per klient)

1. **Ground truth.** Web (Snort, Primal, Coracle, YakiHonne) → otwórz żywą instancję i czytaj wyliczone zmienne CSS w devtools (te SPA są za Cloudflare — `WebFetch` dostaje pustą skorupę, trzeba realnego browsera). Mobile/desktop (Damus, Amethyst, Keychat, Gossip) → czytaj plik motywu w repo (mapa niżej). Layout → screeny App Store / Google Play.
2. **Spec tokenów PRZED kodem:** accent (light+dark), tła/warstwy, radius, spacing, skala typografii, ikonografia, **struktura nawigacji**.
3. **Napraw „szkielet" — 2–3 detale-zabójcy** (nawigacja, gęstość kart, styl ikon). Decydują o rozpoznawalności bardziej niż kolor.
4. **Wpompuj realne tokeny do `src/simulators/<client>/<client>.theme.css`.** Architektura jest token-driven → wierność to głównie podmiana wartości, nie przepisywanie.
5. **Weryfikacja side-by-side.** Render obok realnego screena/żywej strony (`preview_start` config `sandstr`, port 5173) — nie obok pamięci. To był brakujący krok.

## Techniki wykonawcze (recording → klatki, recon repo, weryfikacja)

> Sprawdzone na **Amethyście** (8 powierzchni) i **Damusie** (11). To „jak" do powyższego „co".

1. **Referencja LAYOUTU = realny render, nie pamięć.** Mobile → poproś użytkownika o screen-RECORDING lub screeny do `docs/refs/<client>/shots/` (gitignore surowe `*.mp4` + `frames/`/`full/`/`sheet_*.jpg`; commituj tylko labelowane PNG + `screen-map.md`). Web = Cloudflare SPA → **`WebFetch` zwraca pustą skorupę**; potrzeba screenów od usera albo live-capture przez `claude-in-chrome`. Repo zawsze czytelne (raw.githubusercontent); web-klienci (Snort/Primal/Coracle) są React/TS → **port, nie translacja** (czytaj `index.css`/`*.scss` + komponenty TSX wprost).

2. **Klatki z nagrania — maszyna ma `ffmpeg`, NIE ma ImageMagick** (`montage`/`convert` brak). Scene-detect: `ffmpeg -i in.MP4 -vf "select='gt(scene,0.15)',showinfo" -vsync vfr frames/scene_%03d.jpg`. Contact-sheet **filtrem `tile` ffmpega** (nie IM): `ffmpeg -pattern_type sequence -start_number 1 -i "frames/scene_%03d.jpg" -frames:v 1 -vf "scale=230:-1,tile=5x5:padding=6:margin=6:color=0x222222" sheet.jpg`. Czytaj sheety → potem pojedyncze klatki full-res kluczowych ekranów.

3. **Recon repo = background `Workflow`** (Ultracode = zawsze Workflow). ~8 agentów, 1 na powierzchnię/zagadnienie (kolory→dokładne heksy, bottom-nav, action-bar, drawer, search, notifications, relays, logo/login) czyta źródło (raw + WebSearch); 1 agent-synteza scala → zapis **verbatim** do `docs/refs/<client>/screen-map.md` (commituj — to autorytatywny spec). Konwertuj komponenty kolorów Swift/Kotlin (0–1 lub 0–255) na hex. Damus: 9 agentów, ~0,5 mln tokenów, dokładne heksy z `DamusColors.swift`.

4. **Reguła [REC vs REPO]:** **recording wygrywa o LAYOUT, repo o dokładny HEX / nazwy ikon-assetów / labelki.** Realne przypadki (Damus): 4-tab bar + osobny compose-FAB (nie center-post z nowszego mastera); ikona person-check, nie network/shield; `7/13` mimo że master pokazuje tylko słupki sygnału.

5. **Weryfikacja (definition of done):** `npm run build` (pokaż output) + `npx tsc --noEmit 2>&1 | grep simulators/<client>` (build NIE jest bramką typów). Live click-through w podglądzie, **0 błędów w konsoli**, live-DOM `document.querySelectorAll('.<client>-simulator button button').length===0` (bufor konsoli podglądu NIE czyści się po reloadzie → ufaj live-DOM, nie staremu logowi). Overlaye (compose/thread/drawer/settings) renderuj w stanie **KOŃCOWYM** (plain div, bez enter-animacji) — podgląd zamraża framer ORAZ CSS `@keyframes` na klatce 0.

6. **Gotcha serwera podglądu:** stały `--port N --strictPort` w `.claude/launch.json` — Vite **ignoruje `PORT`** z harnessu, więc `autoPort` zostawia proxy bez celu → pusty `chrome-error`. 5173 bywa zajęte przez własny `npm run dev` usera — nie przejmuj portu (użyj np. 5180 i przywróć launch.json po weryfikacji). Steruj symulatorem po **konkretnych** selektorach (`.<client>-fab`, `[aria-label="…"]`), nie „pierwszym buttonie" — JS `.click()` omija z-index i trafia w element pod overlayem.

## Fundament cross-cutting (podnosi wszystkie sim naraz)

- **Lokalne assety (leverage #1).** ~45 plików hotlinkuje `api.dicebear.com`; `getSampleImages` (`src/data/mock/utils.ts:184`) zwraca fake/remote URL-e → pod strict CSP i offline avatary/media znikają, co czyta się jako „fake". Warstwa mocków **ma już** CSP-safe `generateAvatarGradient` (`utils.ts:152`), ale ekrany go omijają. → jeden obowiązkowy `<Avatar>` + zbundlowane obrazy.
- **Kontrakt tokenów.** Każdy klient ma własny namespace (`--md-*` vs `--snort-*`); `src/simulators/shared/configs.ts` rozjeżdża się z `theme.css`. Cienki wspólny schemat (surface / on-surface / accent / spacing / radius / elevation) zamienia wierność w wypełnianie tabelki.
- **`MobilePhoneFrame`** jest generyczny (jeden bezel, jeden `aspect-[9/19.5]`, dosłowne `9:41`) i renderuje status bar drugi raz obok `SimulatorShell` — sparametryzuj per-device i usuń duplikat.
- **Realny NoteCard jest per-klient.** Liderzy re-implementują własny NoteCard; `shared/components/NoteCard.tsx` jest w praktyce martwy — celuj w pliki danego klienta (`<client>/components/NoteCard.tsx` lub feed w `screens/`), nie w shared.

## Mapowanie na pliki repo (gdzie co zmieniać)

- Tokeny marki → `src/simulators/<client>/<client>.theme.css`
- Layout/nawigacja/ekrany → `src/simulators/<client>/screens/` + `components/`
- Ramka urządzenia → `src/registry.tsx` (`MOUNTS[id].frame`) + `shared/components/MobilePhoneFrame.tsx`
- Zachowanie toura → `<Client>SimulatorWithTour.tsx` (**nie ruszać** interfejsu komend)

---

## Per-client kit (zweryfikowane, confidence: high)

### Snort — web (repo `v0l/snort`, MIT)
- 📄 **Pełny spec: `docs/refs/snort/screen-map.md`** (19 sekcji, cytaty do plików repo). Poniżej tylko streszczenie.
- **Tokeny:** `packages/app/src/index.css` — ⚠ **korekta:** to **Tailwind v4, blok `@theme{}`** (nie `:root`), a **`tailwind.config` NIE ISTNIEJE** w repo. Dark = baza `@theme`, light = override `html.light`. Skala typografii to **domyślna skala Tailwinda** (`--font-size-*` w `@theme` nie generują żadnych klas w v4; `--font-size-small`/`-tiny` są martwe). Żywa instancja: `snort.social` (devtools).
- **Paleta (confirmed):** accent fiolet `--highlight` `#ac88ff` dark / `#7139f1` light · CTA orange-red `--primary` `#ff3f15` · sygnaturowy gradient `#a178ff→#ff6baf` · DM gradient `#5722d2→#db1771` · mention `#961ee1` · zap `#ff710a` · bg `#000`/`#fff`, warstwa `#090909`/`#f9f9f9` · font **Inter**.
- **Nav / killer:** **lewy sidebar** (web, nie bottom-tab) — Home/Discover/Notifications/Messages/Settings, aktywny = **swap ikony outline→solid + `font-bold`, BEZ tła/paska**, labelki **tylko ≥1280px** (niżej goły rail, ≤768px sidebar znika i pojawia się dolny bar 56px); widget salda sats w railu; czerwony pill „＋ New Note"; pill-buttony `border-radius:100px` (każdy goły `<button>` i każdy `input`/`select`); akcent fiolet i CTA oranż współistnieją — nie zlewaj. (Obecny sim: teal = błąd.)
- ⚠ **Korekta „sygnatury":** **Deck mode NIE jest sygnaturą — to martwy kod.** Potrójnie zablokowany: `features.deck: false` w `config/default.json`, dodatkowo paywall subskrypcji (`deckSubKind: 1`, a `features.subscriptions: false`), a `SnortDeckLayout` **nie jest nigdzie zaimportowany** → **route `/deck` nie istnieje** (wpada w catch-all `/:link`). Nie buduj na nim symulatora i nie opisuj go jako dostępnego trybu.
- ⚠ **Korekta „dark-first":** baza CSS jest ciemna, ale domyślna preferencja to **`theme: "system"`** (`Utils/Login/Preferences.ts`), a `useTheme.tsx` przełącza klasy `.light`/`.dark` na `<html>` — czyli user w light mode widzi **jasny** Snort (recording właśnie taki jest). Rób OBA motywy i oddaj sterowanie hostowemu `useParentTheme`.
- **Multi-brand:** repo buduje 6 marek z jednego kodu (`config/{default,iris,meku,nostr,phoenix,soloco}.json`, wybór przez `NODE_CONFIG_ENV`). `default.json` **to Snort** i wszystkie 4 pipeline'y Drone budują `default` → Snort jest kanoniczny; phoenix.social to white-label (patrz otwarte pytanie w nagłówku screen-mapy).
- **Opt-in:** Kieran (`v0l`) — **GitHub `github.com/v0l/snort` jest kanoniczny, `git.v0l.io` to mirror** (zweryfikowane 2026-07-29); aktywny na Nostr. Licencja MIT, © 2023 Kieran (v0l). Marka = raster `nostrich_*.png` (fioletowy struś) — **nie shipuj go bez zgody**, użyj `ClientGlyph`.

### Amethyst — Android (repo `vitorpamplona/amethyst`, MIT)
- **Tokeny:** `amethyst/src/main/java/com/vitorpamplona/amethyst/ui/theme/Color.kt` (raw) + `Theme.kt` (light/dark ColorScheme) + `Type.kt` / `Shape.kt`. Brak wersji web — weryfikuj ze źródła + screenów Play.
- **Paleta (confirmed):** `#7F67BE` (Primary50 — sygnaturowy fiolet) · `#9A82DB` · `#B69DF8` · `#D0BCFF` (Primary80 / DEFAULT) · `#BB86FC` · light-primary `#6200EE` · `#3700B3` · zap **BitcoinOrange `#F7931A`** · dark bg/surface **pure `#000000`**. Uwaga: `#6750A4` to generyczny Material default, **NIE** token Amethysta.
- **Nav / killer:** bottom-nav Material 3, ~5 dest. (Home/Search/Live-Video z kropką/Notifications/Messages) + górny drawer konta/relayów; **kolejność akcji: comments → boost → reaction (EMOJI, nie serce) → zap (⚡ + suma sat)**; Material You, czysta czerń, robohash-avatary; domyślny akcent = fiolet (user-selectable, ale fiolet definiuje markę).
- **Opt-in:** Vitor Pamplona — bardzo aktywny, OpenSats, `amethyst.social`.

### YakiHonne — web/iOS/Android (repo `YakiHonne/web-app` + `YakiHonne/mobile-app`, MIT)
- ⚠️ **Repo:** używać `YakiHonne/web-app` i `YakiHonne/mobile-app`; `yakihonne-web-app`/`yakihonne-mobile-app` są **ZARCHIWIZOWANE**.
- **Tokeny:** mobile `lib/utils/constants.dart` (`kMainColor`, `kMainColor1..5`, `kPurple`) + `lib/utils/theme/theme.dart` (4 warianty). Web `src/styles/root.css` (`--c1`/`--orange-main`, `--c2`, `--c3`). Żywa: `yakihonne.com`.
- **Paleta (confirmed):** **DEFAULT = ORANŻ `#EE7700`** (`kMainColor`/`--orange-main`) · fiolet `#6B218D` (selectable accent) · `#86318C` (kPurple) · deep purple `#220038` (ciemne powierzchnie) · aubergine `#1F0021` · dark bg `#171718` · cream `#FAF7F3`.
- **Nav / killer:** mobile bottom-nav 5 tabów: **Home, Media, Wallet (center), Notifications, Messages**; desktop 3-kolumnowy (rail + suggested articles + timeline); **Smart Widgets inline = sygnatura**; Cashu wallet jako centralna zakładka; 4 motywy (light/dark/black/cream); dual content model (artykuły vs notatki), article reader.
- ⚠️ **Korekta AUDIT.md:** audyt każe „przeskinować na fiolet" — **błąd**. Oranż to prawdziwy default; sim miał go dobrze. Fiolet dodaj jako drugorzędny/ciemne powierzchnie.
- **Opt-in:** JustHonne Technologies — bardzo aktywni (weekly OSS, DoraHacks/Luma).

### Primal — web/iOS/Android (org `PrimalHQ`, MIT)
- **Tokeny:** `primal-web-app/src/palette.scss` (autorytatywne, per named theme) + `*.module.scss`. Android `primal-android-app/.../theme/colors/Midnight.kt`, `Ice.kt`. Żywa: `primal.net` (SolidJS — **nie React**, tokeny trzeba przetłumaczyć ręcznie).
- **Paleta (confirmed):** **DEFAULT accent BLUE `#2394EF`** (Midnight/Ice) · alt-theme magenta `#ca077c` + liked `#F800C1` · gradient sunset `#EF404A→#5B12A4`, midnight `#14B9FF→#690DFF` · dark bg OLED `#000`, input `#222`, surface `#1A1A1A` · zapped amber `#FFA02F`, reposted green `#66E205`, bookmarked `#0090F8`.
- **Nav / killer:** wbudowany **Lightning wallet + kwoty zapów** = sygnatura; **domyślny akcent to niebieski, nie magenta** (magenta = alt „Sunset"); OLED-czerń (nie `#121212`); nav z **Reads + Wallet** jako first-class; gęste, tekst-first karty; przełącznik custom feeds na górze feedu.
- ⚠️ **Korekta AUDIT.md:** „purple/magenta" to tylko alt-theme; default = blue.
- **Opt-in:** Miljan Braticevic, Primal Systems Inc. (funded), aktywny na Nostr/X.

### Damus — iOS/macOS (repo `damus-io/damus`, **GPL-3.0**)
- **Tokeny:** `damus/Shared/Components/DamusColors.swift` + `Assets.xcassets/Colors/*.colorset/Contents.json` (RGB light/dark) + `Gradients/PinkGradient.swift`. Ikony = **bundlowane assety** (`Assets.xcassets/iconography/`), nie SF Symbols. Tab-bar: `Features/Timeline/Views/MainTabView.swift`.
- **Paleta (confirmed):** `#CC43C5` DamusPurple (accent) · `#BF26ED` DeepPurple · **gradient `#D34CD9→#F869B6`** (sygnatura) · `#4B4DFF` blue · `#66C34F` green · `#F7931A` Bitcoin · purpurowe tło `#F4DAF4`/`#5D2D5C`.
- **Nav / killer:** dokładnie **4 taby + centralny compose FAB**; kolejność (MainTabView): Home / DMs / [FAB] / Search(=Universe) / Notifications(bell); **własne ikony** (selected = `.fill` wariant), nie SF Symbols; poza tym natywny iOS (SF Pro, systemowe nav/sheets); gradient purple→pink na follow/banner/QR; „Purple" subscription (numer subskrybenta + badge + DeepL).
- **Opt-in:** William Casarin (`@jb55`), aktywny; marka rozpoznawalna → wymagana wyraźna zgoda.

### Coracle — web (repo `coracle-social/coracle`, MIT) — ✅ ZROBIONE 2026-08-05
- 📄 **Pełny spec: `docs/refs/coracle/screen-map.md`** (19 sekcji, cytaty do plików repo). Niżej streszczenie.
- **Tokeny:** `.env.template` (`VITE_DARK_THEME`/`VITE_LIGHT_THEME` — listy `key:hex`, parsowane w `src/partials/state.ts:29-34` i wstrzykiwane jako `:root` w `App.svelte:359-363`) + `tailwind.config.cjs` (`var(--accent)`, `--neutral-N`, `--tinted-N`, warianty `-l`/`-d` liczone w JS ±10%) + `src/app.css` (fonty). Żywa: `app.coracle.social`.
- **Paleta (confirmed):** accent **burnt-orange `#FC560E`** — **identyczny w light i dark** · dark bg `#262626` (strona) / `#171717` (top bar) · **ciepłe brązowe „tinted"** `#3E3A38` (sidebar+karty) / `#332f2d` / `#5A524F` · success teal `#12D2B0` · warning `#FCAB0E` · danger `#dc0c0c`. **Zero gradientów marki.**
- ⚠️ **Korekta:** `LogoSvg.svelte:8` ma inny oranż `#EB5E28` jako fallback `--logo-color`, ale ten komponent **nie ma żadnych importerów** — martwy. Brand to `#FC560E`.
- **Nav / killer:** **dark-first + ciepłe brązy** (stary sim: light+cold = podwójnie źle); **lewy sidebar `w-72`** z 6 pozycjami **TYLKO TEKST, bez ikon**: Feeds/Relays/Notifications/Messages/Groups/Lists (NIE Communities/Calendar/Market — te nie istnieją), aktywna **rośnie** `text-2xl`→`text-3xl` + akcentowe podkreślenie; fonty **Lato** (body) + **Staatliches** (wszystkie `.btn`/nagłówki — to typeface **all-caps**, stąd kapitaliki w UI mimo Title case w kodzie); sygnatura = panel **„Your Feeds"** (composable feeds) + rating relayów + **WoT dial przy każdej nazwie** (nie checkmark!); gęsty, utylitarny layout; prawie wszystko to **modale**.
- ⚠️ **Bazowy `.btn` jest BIAŁY na CZARNYM** (`app.css:374-376`) — akcent jest opt-in, tylko dla akcji głównej.
- **Opt-in:** Jon Staab (`hodlbod`), FUTO Fellow, bardzo opt-in-friendly.

### Keychat — cross-platform (repo `keychat-io/keychat-app`, **AGPL-3.0**)
- **Tokeny:** `packages/app/lib/page/theme.dart` (`MaterialTheme` light/dark) + `app_theme.dart` (orange selection). Wallet: `packages/keychat_ecash`. Assety: `packages/app/assets/images/`.
- **Paleta (confirmed):** **PURPLE** light `#8700ED` / dark `#d4bbff` (Material 3, seed ~`#695392`) · **orange** akcenty `#EC6E0E` (invite), selection `#FDDABB`/`#896647` · light surface `#fef7fe`, dark `#141317` · secondary magenta `#783776`/`#fcacf3`.
- **Nav / killer:** **3-tab CupertinoTabBar**: Chats / Browser / Me (nie drawer, nie 4–5 tabów); Material 3 bez ripple (NoSplash); sygnatura = „super app" (szyfrowany czat kosztujący ecash „stamps" + Cashu/Lightning wallet + browser mini-appów); badge trybu szyfrowania per-room; „Red Pocket" (czerwona koperta); onboarding tworzy nsec/seed, bez telefonu/emaila.
- ⚠️ **Korekta AUDIT.md:** brand **NIE** jest niebieski `#2D7FF9` — jest fioletowo-pomarańczowy.
- **Opt-in:** zespół aktywny na Nostr (npub w README).

### Gossip — desktop (repo `mikedilger/gossip`, MIT)
- **Tokeny:** `gossip-bin/src/ui/theme/default.rs` (`Color32::from_rgb`) + `mod.rs` (roundness/spacing) + `test_page.rs` (mapa token→widget). Screeny: `assets/gossip_screenshot_{dark,light}.png`. Brak DOM — czytaj Rust.
- **Paleta (confirmed):** accent **stalowy błękit `#74A7CC`** dark / `#557A95` light (jeden brand color) · dark bg `#0A0A0A`/`#1B1B1B`/`#262626` · error `#EF4444`, success `#22C55E`, amber `#FBBF24` · highlight: relay `#A040A0`, pubkey green, eventid red.
- **Nav / killer:** **wąski pionowy icon-rail** po lewej + cienki status bar na dole (sim: generyczny „Twitter sidebar" = największy błąd); spartańskie **egui** immediate-mode (płaskie fille, hairline separatory, wysoka gęstość, brak cieni/kart); sygnatura = **outbox/gossip relay model** (Relays screen z per-relay read/write/outbox); developer-tool DNA (surowy JSON eventu, kolorowe chipy pubkey/eventid/relay).
- **Opt-in:** Mike Dilger, dostępny; repo idle (aktywny fork YGGverse).

---

## Korekty do `docs/AUDIT.md` (rekomendacje kolorów częściowo błędne)

| Klient | AUDIT.md mówi | Ground truth |
|---|---|---|
| YakiHonne | „re-skin na fiolet, oranż zły" | **oranż `#EE7700` to prawdziwy default**; fiolet = akcent/ciemne powierzchnie |
| Keychat | brand blue `#2D7FF9` | **fiolet `#8700ED`/`#d4bbff` + orange** |
| Primal | „purple/magenta" | **default blue `#2394EF`**; magenta = alt-theme |
| Amethyst | (implikuje `#6750A4`) | **`#7F67BE`/`#D0BCFF`**; `#6750A4` to generyczny Material |

_Źródło: multi-agentowy recon (10 agentów, ~0,5 mln tokenów, WebSearch/WebFetch + lektura repo). Heksy/ścieżki zweryfikowane; traktuj jako punkt startowy — realne klienty ewoluują, więc odświeżaj przy każdym szlifie._
