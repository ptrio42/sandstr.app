# Parametry harnessu klipów (stan zweryfikowany w repo)

Wartości przepisane 1:1 z plików w `docs/clips/`. Gdy któraś tu nie zgadza się ze skryptem,
skrypt wygrywa — popraw ten plik.

## capture-faq.mjs — capture

**Viewporty**
- `PHONE = { w: 430, h: 775, dsf: 2 }` → 860×1550 device px = dokładnie rozmiar karty w montażu,
  więc nic nie jest przeskalowywane. 430 px trzyma kadr pod progiem `max-width: 639px`
  (FAQ jako bottom sheet, klient full-bleed).
- `DESK = { w: 1280, h: 1000, dsf: 2 }` — tylko Coracle (frameless jest `gated` poniżej 640 px
  i nie renderuje żadnego wejścia do FAQ). 1000 px wysokości, nie 720: wiersze mute siedzą ~930 px
  w dół Content Settings, a scroll-into-view touru tam nie dosięga.

**Tablica `T` (ms)** — `afterLoad 900`, `afterFaqOpen 500`, `perChar 110`, `afterType 800`,
`readAnswer 2400`, `afterShowMe 300`, `holdStep 1700`, `holdLastStep 2500`, `tail 700`,
`swSettle 700`, `swHold 1300`.

**Pętle** (`id`, ścieżka, query → `entry`, liczba kroków): `damus-shaka` /c/damus „no heart" → `shaka` (1);
`amethyst` /c/amethyst „nobody sees my notes" → `manage-relays` (2); `wisp` /c/wisp „cancel my post"
→ `post-note` (2); `coracle` /c/coracle „block someone" → `mute` (1); `nostur` /c/nostur „nothing loads"
→ `low-data` (3); `damus-npub` /c/damus „share my profile" → `copy-npub` (1).

**Screencast** — `format: 'jpeg', quality: 92, everyNthFrame: 1, maxWidth: 1600, maxHeight: 1600`.
`maxWidth/maxHeight` są w pikselach urządzenia; bez nich klatki przychodzą w rozmiarze CSS,
czyli w połowie rozdzielczości przy dsf 2.

**Flagi Chrome** — `--headless=new`, `--remote-debugging-port=<n>`,
`--user-data-dir=.work/faq/.chrome-profile-<id>` (kasowany przed każdą pętlą),
`--force-device-scale-factor=2`, `--high-dpi-support=1`, `--no-first-run`,
`--no-default-browser-check`, `--hide-scrollbars`, `--force-color-profile=srgb`,
`--disable-background-timer-throttling`, `--disable-renderer-backgrounding`,
`--window-size=1400,1000`.

**Porty** — statyczny serwer `dist/` na porcie przydzielonym przez system (`listen(0)`);
port debugowania to `port + 1 + i` dla pętli i `port + 40 + i` dla switchy.

**Stan startowy** — `Emulation.setEmulatedMedia` z `prefers-color-scheme: dark` +
`Page.addScriptToEvaluateOnNewDocument`, który czyści klucze localStorage zaczynające się od
`sandstr-`, `nostr-tour-`, `nostrich-` i ustawia `sandstr-theme = 'dark'`.

**Timeouty** — `document.readyState` 30 s, `waitVisible` na FAQ 20 s, `until` domyślnie 15 s co 100 ms,
spotlight 12 s.

**Enkodowanie surowej pętli (`encodeRange`)** — czas klatki = różnica czasów przyjścia, clamp
`0.001–2.0 s`; ostatnia klatka dopisywana drugi raz (demuxer concat gubi ostatni `duration`);
z listy o rozmiarach mieszanych wygrywa rozmiar **dominujący** (zmiana rozmiaru w środku listy
jest tym, czego concat odmawia); `-r 30`, `scale=trunc(iw/2)*2:trunc(ih/2)*2`, `libx264 -crf 18
-preset medium`, `yuv420p`, `+faststart`.

## build-teaser-faq.sh — montaż

**Kadr 1080×1920** — `CANW 1080`, `CANH 1920`, `CARDW 860`, `CARDH 1550`, `CARDX 110`, `CARDY 200`,
`CARDR 40`, `CAPY 96` (w cut #1 było 84), `FOOTY 1782`, `DISCY 1858`.
Kolory: `ACCENT 0xA78BFA`, `MUTED 0x74747F`. Fonty:
`/System/Library/Fonts/Supplemental/Arial Bold.ttf` i `Arial.ttf` — ścieżki macOS zaszyte na sztywno
w obu skryptach montażu (tak jak ścieżka do Chrome w `capture-faq.mjs`); poza macOS `drawtext` padnie.

**Coracle ma dwa kadrowania** — faza a/t/b: `crop=800:1250:800:0` → 880×1375 @ (100, 250);
faza d: `crop=1100:900:400:350` → 1000×818 @ (40, 560).

**Tempo** — `CAP_MAX=28` (twarda bramka długości podpisu), `T_OPEN=0.7`, `T_WAIT=1.5`, `T_SWITCH=2.0`.
Czas fazy d per pętla: damus-shaka 3.0, amethyst 3.8, wisp 4.0, coracle 3.0, nostur 4.6,
damus-npub 3.0.

**Cztery fazy pętli** liczone z `marks.json`: `a` = 0→`typing` (przyspieszone do `T_OPEN`),
`t` = `typing`→`question` (zawsze 1.0×), `b` = `question`→`demo` (do `T_WAIT`),
`d` = `demo`→koniec (do czasu z tabeli `LOOPS`).

**Kolejność cutów** — `CUT_A=(damus-shaka sw-damus-nostur nostur sw-nostur-wisp wisp)`,
`CUT_B=(coracle amethyst sw-amethyst-damus damus-npub)`.

**Karty** — intro 2,2 s, end 3,2 s („try Nostr" / „no keys, no install" / „sandstr.app"), tag 1,5 s.
**Segment**: `-crf 17 -preset medium -r 30`. **Sklejka końcowa**: `libx264 -crf 21 -preset slow
-profile:v high -level 4.0 -pix_fmt yuv420p -g 60 +faststart` + cicha ścieżka AAC 48k
(`anullsrc`, stereo 44100) — dla playerów, które wymagają audio.

## Starsza generacja (cut #1)

`capture-shots.sh`: `grab <name> <url> <w> <h> [dpr]`; klienci mobilni 1120×1480, web 1600×1000,
`lockup` z `/` przy 560×300 i dpr **6**; `--virtual-time-budget=8000`; Chrome nie kończy się po
`--screenshot` w `headless=new`, więc proces jest ubijany po pojawieniu się pliku. `PORT` i `CHROME`
nadpisywalne z env.

`build-teaser.sh`: ekran telefonu w nagraniu to `PX=814 PW=600 PH=1082`; tabela `SEGMENTS`
(`name|in|out|speed|crop-y|caption`, 6 wierszy) i `MONT` (8 klientów `ready` + prostokąty crop), `MFRAMES=10`
(pierwsza karta 21 klatek); kadr landscape Primala `1060×993 @ (10, 479)`; pętla zapa
`-ss 15.4 -to 22.6`, speed 1.2, `-crf 20`.

## Kotwice w `src/`, na których stoi capture

Zmiana którejkolwiek psuje nagrywanie — sprawdź je, zanim ruszysz montaż:

- `[aria-label="<Klient> FAQ"]` — `src/host/ClientView.tsx:529` (przycisk) i
  `src/host/FaqPanel.tsx:155` (panel). **To wejście istnieje tylko w pasku mobilnym.** Na desktopie
  (Coracle) FAQ otwiera przycisk z TEKSTEM „How do I…?" — `src/host/ClientView.tsx:597` (wiersz meta)
  i `:143` (ContextPanel); dlatego pętla `coracle` ma `faq: 'text:How do I'`. Selektor `text:` szuka
  wyłącznie po `<button>` (`visibleRect`), więc zamiana tego przycisku na link zabija capture.
- `gated = isMobile && !frame`, `MOBILE_QUERY = '(max-width: 639px)'`
  (`src/host/useMediaQuery.ts:31`) — poniżej 640 px klient frameless nie renderuje ŻADNEGO wejścia
  do FAQ, stąd desktopowy viewport dla Coracle.
- `[data-faq-entry="<id>"]` — `src/host/FaqPanel.tsx:241`; capture asertuje, że pierwszy element
  z tym atrybutem to oczekiwany wpis.
- Tekst przycisku „Show me in the simulator" — `src/host/FaqPanel.tsx:289` (capture klika po tekście,
  bo selektor pozycyjny trafia w nagłówek wpisu i zwija odpowiedź).
- `[aria-label="Switch client"]` — `src/host/ClientView.tsx:546`; kafelki w arkuszu (`sm:hidden`,
  `src/host/ClientSwitcher.tsx:389`) mają nazwę klienta jako TEKST — `aria-label` nosi dopiero
  `DockChip` railu (`ClientSwitcher.tsx:67`), a rail przy 430 px się nie renderuje.
- `.tour-spotlight` — `src/components/tour/TourOverlay.tsx:206`; `.tour-tooltip` —
  `src/components/tour/tour.css:19` (ukrywany na czas nagrania).
