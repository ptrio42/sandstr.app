# Sandstr — Fidelity Kit (wierne odtwarzanie realnych klientów)

> **Co to jest:** zweryfikowany (multi-agentowy recon, 2026-07-14) zestaw „ground truth" do podnoszenia **wierności** (`fidelity` — najsłabsza oś w `docs/AUDIT.md`, `f`=2–5). Dla każdego z 9 realnych klientów: prawdziwe tokeny marki, **plik-źródło tokenów w repo klienta**, struktura nawigacji i detale, które decydują o rozpoznawalności. Powstało, bo oryginał robiono bez modelu wizji — kolory/nawigacja/layout były zgadywane.
>
> **Klucz:** **wszystkie te klienty są open source.** Wierne odtwarzanie to **port z ground truth**, nie zgadywanie z pamięci. Nie zgadujesz fioletu Amethysta — to stała w `Color.kt`.

## Proces (powtarzalny, per klient)

1. **Ground truth.** Web (Snort, Primal, Coracle, YakiHonne) → otwórz żywą instancję i czytaj wyliczone zmienne CSS w devtools (te SPA są za Cloudflare — `WebFetch` dostaje pustą skorupę, trzeba realnego browsera). Mobile/desktop (Damus, Amethyst, Olas, Keychat, Gossip) → czytaj plik motywu w repo (mapa niżej). Layout → screeny App Store / Google Play.
2. **Spec tokenów PRZED kodem:** accent (light+dark), tła/warstwy, radius, spacing, skala typografii, ikonografia, **struktura nawigacji**.
3. **Napraw „szkielet" — 2–3 detale-zabójcy** (nawigacja, gęstość kart, styl ikon). Decydują o rozpoznawalności bardziej niż kolor.
4. **Wpompuj realne tokeny do `src/simulators/<client>/<client>.theme.css`.** Architektura jest token-driven → wierność to głównie podmiana wartości, nie przepisywanie.
5. **Weryfikacja side-by-side.** Render obok realnego screena/żywej strony (`preview_start` config `sandstr`, port 5173) — nie obok pamięci. To był brakujący krok.

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
- **Tokeny:** `packages/app/src/index.css` (`:root` custom props) + `tailwind.config`. Żywa instancja: `snort.social` (devtools).
- **Paleta (confirmed):** accent fiolet `--highlight` `#ac88ff` dark / `#7139f1` light · CTA orange-red `--primary` `#ff3f15` · sygnaturowy gradient `#a178ff→#ff6baf` · DM gradient `#5722d2→#db1771` · mention `#961ee1` · zap `#ff710a` · bg `#000`/`#fff`, warstwa `#090909`/`#f9f9f9` · font **Inter**.
- **Nav / killer:** dark-first; **lewy sidebar** (web, nie bottom-tab); pill-buttony `border-radius:100px`; sygnatura = **Deck mode** (wielokolumnowy); akcent fiolet i CTA oranż współistnieją — nie zlewaj. (Obecny sim: teal = błąd.)
- **Opt-in:** Kieran (`v0l`) — GitHub/Gitea `git.v0l.io`, aktywny na Nostr.

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

### Coracle — web (repo `coracle-social/coracle`, MIT)
- **Tokeny:** `.env.template` (`VITE_DARK_THEME`/`VITE_LIGHT_THEME` — listy `key:hex`) + `tailwind.config.cjs` (`var(--accent)`, `--neutral-N`, `--tinted-N`) + `src/app.css` (fonty). Żywa: `app.coracle.social` (SPA, realny browser).
- **Paleta (confirmed):** accent **burnt-orange `#FC560E`** (light+dark) · dark bg `#0A0A0A`/`#171717`, surface `#262626` · **ciepłe brązowe „tinted"** `#332f2d`/`#3E3A38`/`#5A524F`… (definiują przytulny ciemny look) · success teal `#12D2B0` · warning `#FCAB0E` · danger `#dc0c0c`.
- **Nav / killer:** **dark-first + ciepłe brązy** (sim: light+cold = podwójnie źle); **lewy sidebar** (Feeds/Relays/Communities/Calendar/Market); fonty **Lato** (body) + **Staatliches** (wordmark, condensed all-caps); sygnatura = composable **Custom Feeds** + rating relayów + web-of-trust; gęsty, utylitarny layout.
- **Opt-in:** Jon Staab (`hodlbod`), FUTO Fellow, bardzo opt-in-friendly.

### Keychat — cross-platform (repo `keychat-io/keychat-app`, **AGPL-3.0**)
- **Tokeny:** `packages/app/lib/page/theme.dart` (`MaterialTheme` light/dark) + `app_theme.dart` (orange selection). Wallet: `packages/keychat_ecash`. Assety: `packages/app/assets/images/`.
- **Paleta (confirmed):** **PURPLE** light `#8700ED` / dark `#d4bbff` (Material 3, seed ~`#695392`) · **orange** akcenty `#EC6E0E` (invite), selection `#FDDABB`/`#896647` · light surface `#fef7fe`, dark `#141317` · secondary magenta `#783776`/`#fcacf3`.
- **Nav / killer:** **3-tab CupertinoTabBar**: Chats / Browser / Me (nie drawer, nie 4–5 tabów); Material 3 bez ripple (NoSplash); sygnatura = „super app" (szyfrowany czat kosztujący ecash „stamps" + Cashu/Lightning wallet + browser mini-appów); badge trybu szyfrowania per-room; „Red Pocket" (czerwona koperta); onboarding tworzy nsec/seed, bez telefonu/emaila.
- ⚠️ **Korekta AUDIT.md:** brand **NIE** jest niebieski `#2D7FF9` — jest fioletowo-pomarańczowy.
- **Opt-in:** zespół aktywny na Nostr (npub w README).

### Olas — iOS/Android (repo `pablof7z/olas`, MIT)
- ⚠️ **Branch:** shipping = `master` (React Native); `main` to STARA implementacja SwiftUI. Nie mylić.
- **Tokeny:** `theme/colors.ts` (master — osobne zestawy iOS i Android!) + `tailwind.config.js` (NativeWind) + `global.css`. Assety: `assets/logo.svg` itd.
- **Paleta (confirmed):** accent iOS `#112FED` (light+dark) · Android dark primary **IG-pink `#E1306C`**, Android light `#0070E9` · iOS light bg `#F2F2F7`/card `#FFF`, dark bg `#000`/card `#1C1C1E` · muted = foreground @ 60% opacity. **Celowo mono** (biel/czerń/systemowe szarości) + jeden akcent.
- **Nav / killer:** bottom-tab 5: Home / Reels / **centralny Publish „+"** / **Wallet** / Profile(avatar); tab-bar **chowa się przy scrollu w dół** (reanimated); ikony **lucide** (~2px stroke, active = strokeWidth 3); picture-first edge-to-edge single-column (niska gęstość); story-ring „flare"; sygnatura non-IG = **wbudowany ecash wallet + zapy**; publish → kind:20 + Blossom.
- **Opt-in:** pablof7z (Sanity Island LLC), mały indie, ryzyko trade-dress niskie; bardzo dostępny.

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
