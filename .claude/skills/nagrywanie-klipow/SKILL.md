---
name: nagrywanie-klipow
description: 'Nagrywanie i montaż klipów demo sandstr: teaser, screencast pętli FAQ, klip porównawczy, screenshoty do promocji. Użyj gdy: "nagraj teaser", "klip", "screencast", "capture", "zmontuj", "shoty na twittera", "klip na Nostra", albo gdy dotykasz docs/clips/ (harness.mjs, capture-faq.mjs, capture-compare.mjs, capture-demo.mjs, build-teaser-*.sh, capture-shots.sh). Także gdy pada "nagraj ten link" albo "zrób plik z demo linku". Harness to headless Chrome przez CDP + ffmpeg, zero zależności npm.'
---

# Nagrywanie klipów demo sandstr

Najpierw przeczytaj scenariusze — ten skill ich NIE powtarza: `docs/clips/README.md` (cut #1),
`docs/clips/faq-teaser.md` (cut #2: beat sheet FAQ, reguły kadru, uzasadnienia)
i `docs/clips/compare-teaser.md` (cut #3: jedna notatka w ośmiu klientach).

## Co gdzie leży

- **`docs/clips/harness.mjs` — wspólny harness** (Chrome, CDP, `Page`, pula klatek, `encodeRange`),
  wydzielony 2026-08-20, gdy drugi cut potrzebował tych samych helperów. **Zmieniasz coś tutaj →
  zmieniasz OBA cuty**; każdy helper ma w komentarzu pomiar i awarię, której zapobiega. Po edycji
  odpal smoke test jednej pętli: `node docs/clips/capture-faq.mjs sw-nostur-wisp`.
- `docs/clips/capture-faq.mjs` — tablice `LOOPS` (6 pętli), `SWITCHES` (3 przejścia), `TOURS`. Wyjście:
  surowe `.work/faq/<id>.mp4`, a dla pętli dodatkowo `.work/faq/<id>/marks.json` (bez podpisów
  i karty). Switche marks.json **nie mają** — montaż ich nie potrzebuje.
- `docs/clips/build-teaser-faq.sh` — sam ffmpeg; z pętli robi `out/sandstr-faq-a.mp4`, `-b.mp4`,
  sześć klipów per pytanie i `-hero.mp4`.
- `docs/clips/capture-shots.sh` + `build-teaser.sh` + `Nagranie z ekranu 2026-08-5 o 22.07.56.mov`
  (lokalne, nieśledzone) — starsza generacja (cut #1): stills z dev servera i montaż z nagrania ekranu.
  Nie ma go w świeżym klonie: `build-teaser.sh` przyjmuje ścieżkę przez `SRC=`.
- `docs/clips/capture-compare.mjs` + `build-teaser-compare.sh` — cut #3: JEDNO nagranie ciągłe
  (jedna notatka, pięciu klientów telefonowych, potem `/compare`), montaż bez podpisów. Tekst
  notatki przez `NOTE=`. Wyjścia dwa: `sandstr-compare.mp4` (z podkładem) i `-mute.mp4`.
- `docs/clips/make-bed.mjs` — podkład cutu #3, **syntezowany w Node** (bez zależności, bez sampli,
  deterministyczny seed). Nie licencjonujemy muzyki: to materiał promocyjny pod nazwiskiem
  właściciela, a wygenerowany podkład nie niesie licencji, atrybucji ani ryzyka roszczenia.
  Mapa sekcji w nagłówku pliku i cele betów w `build-teaser-compare.sh` to **jedna decyzja zapisana
  dwa razy** — ruszasz jedno, musisz ruszyć drugie.
- **`docs/clips/capture-demo.mjs` — NIE cut, tylko narzędzie: nagrywa DOWOLNY link demo.**
  Bierze URL (`/c/<id>?...` albo pełny `https://sandstr.app/...`) i filmuje to, co ten link robi.
  Powstało, bo `/c/<id>` ma kontrakt parametrów (`docs/OUTREACH.md`) składany przez kreator
  `src/host/DemoLinkSheet.tsx` — jedna konfiguracja ma dawać oba artefakty: link i plik.
  Wyjście: `.work/demo/<slug>.mp4` + `<slug>.marks.json`.
- `docs/clips/build-demo.sh` — **najmniejszy** z build-scriptów, bo to nie jest cut: bez podpisów,
  bez montażu, bez karty końcowej. Dokleja pod kadrem pasek `sandstr.app · <wersja>` plus stały
  disclaimer i cichą ścieżkę AAC. **Powód istnienia to etykieta wersji**: baner jest już w kadrze
  (dlatego take nie jest kadrowany do samego urządzenia, inaczej niż w `build-teaser.sh`), ale
  `reproduces` widać tylko przy kadrze desktopowym — telefonowy compact bar nie ma na to miejsca,
  więc bez tego paska plik jedzie do maintainera bez żadnego znacznika nieaktualności.
- Katalogi: `.work/` (pośrednie, m.in. pula klatek `.work/faq/.pool/<id>/*.jpg`), `out/`, `shots/`.

**Git: w `docs/clips/` NIE JEST ŚLEDZONE nic binarnego** (od 2026-08-19). `docs/clips/.gitignore`
wyklucza `*.mov`/`*.mp4`/`*.png` oraz katalogi `.work/`, `out/`, `shots/`. Śledzone są **wyłącznie**
skrypty i scenariusze (`*.sh`, `*.mjs`, `*.md`). Nagrania to zrzuty ekranu właściciela, a cuty i stille
to wyjście builda — **nie commituj ich z powrotem**; ważyły połowę historii repo. Zniknięcie plików
z gita nie znaczy, że zniknęły z dysku: leżą lokalnie i wszystkie skrypty działają jak wcześniej.
Jeśli materiał ma trafić do kogoś, wyślij plik, nie linkuj repo.

## Uruchomienie — cut #2 (FAQ)

```bash
npm run build                                       # capture sam serwuje dist/ na wolnym porcie
node docs/clips/capture-faq.mjs                     # wszystkie pętle + switche
node docs/clips/capture-faq.mjs wisp sw-nostur-wisp # podzbiór po id
./docs/clips/build-teaser-faq.sh
```

- ID pętli: `damus-shaka`, `amethyst`, `wisp`, `coracle`, `nostur`, `damus-npub`; switche:
  `sw-damus-nostur`, `sw-nostur-wisp`, `sw-amethyst-damus`.
- Argumenty filtrują **obie** listy naraz: podanie samych pętli nie nagra żadnego switcha, a montaż
  przerwie się na brakującym `.work/faq/sw-*.mp4`.
- W PATH muszą być `ffmpeg`, `ffprobe`, `node`; ścieżka do Chrome jest w `capture-faq.mjs` zaszyta
  na sztywno (inaczej niż w `capture-shots.sh`, gdzie nadpiszesz ją zmienną `CHROME`).
- Komentarze nagłówkowe obu skryptów FAQ są przestarzałe (mówią o „four loops", podają nieistniejące
  id `damus`, zapowiadają `out/sandstr-faq-teaser.mp4`) — ufaj tablicom `LOOPS` / `CUT_A` / `CUT_B`.

## Uruchomienie — cut #3 (porównanie)

```bash
npm run build
node docs/clips/capture-compare.mjs                    # ~60 s ciągłego nagrania
NOTE='gm — inna treść? #asknostr' node docs/clips/capture-compare.mjs
./docs/clips/build-teaser-compare.sh                   # -> out/sandstr-compare.mp4

SWITCH=arrows node docs/clips/capture-compare.mjs      # przejścia strzałkami zamiast arkusza
SWITCH=arrows ./docs/clips/build-teaser-compare.sh     # -> out/sandstr-compare-arrows.mp4
```

Trzy rzeczy, które ten cut ustalił i które obowiązują każdy następny klip pokazujący TĘ SAMĄ treść
w kilku klientach:

- **Jedno wczytanie strony na całe nagranie.** `src/data/mock` losuje bank niezaseedowanym
  `Math.random()` przy inicjalizacji modułu (15 miejsc), więc każdy `Page.navigate` daje innego
  autora, inne liczniki i inne źródło reposta. Poruszaj się nawigacją SPA (switcher, „All clients",
  link `/compare` z galerii), nigdy kolejnym `navigate`.
- **Klienci webowi (Primal, Snort, Coracle) są zablokowani poniżej 640 px.** Przy 430 px nie
  wyrenderują ani klienta, ani afordancji FAQ. Do kadru telefonowego wchodzi pięciu klientów
  telefonowych; ósemka pojawia się dopiero na `/compare`, bo tam karty są płynne.
- **Ściana logowania jest tylko na PIERWSZYM kliencie.** Dalej „screen intent" przenosi ekran, więc
  każdy kolejny montuje się od razu na feedzie. Za to każdy zamontowany przez switchera odpala
  toast powitalny 2500 ms — dlatego capture stawia `mount:` i `feed:` po dwóch stronach tego okna.

Sync z muzyką jest **z konstrukcji, nie z dociągania**: 120 BPM, takt 2 s, 16 taktów = 32,0 s,
a każdy bet jest kodowany z `-frames:v` na dokładnie `cel × 30` klatek. Samo `-ss`/`-to` zostawia
~30 ms zaokrąglenia na segment, co przez szesnaście betów daje słyszalny dryf. Build asertuje sumę
przed muxem i wywala się, jeśli bety przestaną się sumować do 16 taktów.

## Uruchomienie — dowolny link demo

```bash
npm run build
node docs/clips/capture-demo.mjs '/c/wisp?theme=light&showme=zap'
STEPS=3 node docs/clips/capture-demo.mjs '/c/wisp?tour=1'
DWELL=9000 node docs/clips/capture-demo.mjs '/c/coracle?screen=relays'
./docs/clips/build-demo.sh                     # wszystkie takes -> out/sandstr-demo-*.mp4
./docs/clips/build-demo.sh wisp-tour-1         # albo jeden po slugu
```

Cztery tryby, wszystkie zmierzone 2026-08-21: mini-tour (`?showme=`), tour (`?tour=1`, przewijany
`ArrowRight`, `STEPS=` przycina), sam ekran (`?screen=`, hold przez `DWELL=`) i goły link.

- **Ten skrypt NIE przeklikuje ściany logowania**, w przeciwieństwie do tablic `ENTRY`
  w `capture-faq.mjs` i `capture-compare.mjs`. Tamte inscenizują cut, w którym ściana nie występuje;
  tu odbiorca otworzy dokładnie ten URL, więc take, który po cichu się loguje, filmuje stronę,
  której ten link nie produkuje. Goły `/c/damus` kończy na powitalnym ekranie i skrypt **to wypisuje**
  wraz z podpowiedzią (`?screen=feed`, `?showme=`, `?tour=1`). Naprawia się link, nie skrypt.
- **Kadr wybiera się sam.** Start telefonowy (430×775); jeśli `ClientView` odda bramkę „is a desktop
  client", skrypt przekadrowuje na 1280×1000 i ładuje raz jeszcze. Sygnałem gotowości hosta jest
  **baner disclaimera** (renderuje się też na bramce i na ścianie logowania), a sygnałem gotowości
  klienta `[data-tour]` — to samo, na co czeka `ClientView` przy `?tour=1`, więc nie może się
  rozjechać z aplikacją.
- **Próg „THIN" jest per kadr**: 8 fps dla telefonu, 5 dla desktopu. Zmierzone na jednej maszynie:
  `?showme=zap` na Wispie 16,1 fps (telefon), `?screen=relays` na Coracle 7,4 fps (desktop, klatka
  1600×1250 zamiast 860×1550). Jeden wspólny próg albo przepuszczałby martwy take telefonowy, albo
  krzyczał przy każdym zdrowym desktopowym.

## Uruchomienie — cut #1 (stills + teaser z .mov)

```bash
npm run dev
PORT=5173 ./docs/clips/capture-shots.sh   # tylko gdy zmienił się ekran startowy klienta
./docs/clips/build-teaser.sh              # pełny rebuild ~3 min
```
Starsza generacja strzela `--screenshot` (nie screencast), jedzie po **dev serverze**, robi jeden shot
naraz (równoległe instancje przeciw jednemu Vite dawały puste pliki) i wymusza `--force-dark-mode`
(profil headless nie ma `sandstr-theme` w localStorage).

## Twarde lekcje harnessu — złamanie kosztowało godziny

1. **Klatki się POBIERA (`Page.captureScreenshot` na tempowanej pętli), nie czeka się na push
   z `Page.startScreencast`.** Odwrotnie niż mówiła ta lista do 2026-08-14: na Chrome 151 screencast
   emituje klatkę tylko wtedy, gdy kompozytor ją wyprodukuje, a klient stojący między kliknięciami
   nie produkuje prawie nic — zmierzone 2 klatki w 13,8 s. Timer daje ~10,8 fps (mediana 87 ms).
   Stare ostrzeżenie („pętla dławi wszystko do ~1 fps") było prawdziwe dla wersji, która przy okazji
   odpytywała DOM po tym samym sockecie; `Page.until` poluje dziś WEWNĄTRZ strony i problem zniknął.
   Kod jest źródłem prawdy: `startPool` w `harness.mjs` niesie wszystkie pomiary.
2. **Czas klatki licz z momentu PRZYJŚCIA (`Date.now()`)**, nie z `metadata.timestamp` — ten jest
   niemonotoniczny i robił fantomowe 7-sekundowe dziury w timeline.
3. **Nagrywaj przeciw buildowi produkcyjnemu**, nigdy przeciw `npm run dev` — inne sesje agentów
   trzymają 5173 i sama kontencja CPU wydłużyła przebieg 3× aż do timeoutu na czekaniu na ekran.
4. **Jeden Chrome na pętlę, screencast nigdy nie zatrzymywany w środku** — reuse przeglądarki wysusza
   stream po pierwszej pętli, a `Page.bringToFront` przestawia nagrywaną kartę w `hidden`.
5. **Czekaj na `.tour-spotlight` z rectem > 8×8**, zanim uznasz, że krok wstał — mini-tour mocuje ekran
   ~1–1,5 s, a do tego czasu leci bez spotlightu (siatka missing-target) i filmujesz defekt.
   **⚠ Ale NIE jako bramka przy kadrze telefonowym** (zmierzone 2026-08-21): mini-tour przy 375 px
   rysuje kartę i poprawnie przestawia klienta, a `.tour-spotlight` **nie pojawia się nigdy**
   (Wisp `showme=zap`: rect 352×573 przy 1280 px, `null` przy 375 px — identycznie z linku i z
   przycisku „Show me", więc to silnik przy wąskich szerokościach, nie ścieżka wejścia).
   Czekanie na spotlight wisi wtedy do timeoutu. `capture-demo.mjs` bramkuje na `.tour-overlay`
   i traktuje ring jako opcjonalny. Zgłoszone osobno — jeśli to naprawisz, ta lekcja wraca do
   pierwotnej postaci.
6. **Wstrzyknij fejkowy kursor** (`installCursor`/`moveCursor`) — CDP go nie rysuje; po każdym kroku
   parkuj go na środku ringu, bo tooltip jest ukryty i nic innego nie mówi „patrz tu".
7. **Następny krok touru wybijaj klawiszem `ArrowRight`**, nie klikiem w „Next" — ten przycisk jest
   w ukrytym tooltipie (ukrywanym `opacity`; `display:none` przesunęłoby spotlight).
8. **Klatki są capowane do 1600 px na dłuższym boku** — bez capa desktopowy kadr to ~5 MP/klatkę
   i stream głodnieje (jeden przebieg Coracle: 24 klatki i cisza przed właściwym betem).
9. **`--screenshot` zapisuje plik i NIE kończy procesu** (zmierzone na Chrome 151, 2026-08-14;
   `--virtual-time-budget` nie pomaga, a `--headless=old`, które kończyło, wypadło w Chrome 132).
   Dotyczy „starszej generacji" opisanej wyżej i każdego nowego skryptu, który sięgnie po ten flag:
   pętla na `execFileSync` robi PIERWSZY shot i wisi na drugim, co wygląda jak wolny render.
   Czekaj na **plik** (poll, aż rozmiar przestanie rosnąć), potem ubij **grupę procesów** — sam pid
   zostawia kilkanaście helperów. Wzorzec działa w `scripts/og-client-cards.mjs`. Przy więcej niż
   kilku ujęciach i tak wygrywa CDP (lekcje 1–8); `--screenshot` zostaw statycznym stronom.
10. **Ustawiając viewport, ustaw WSZYSTKIE PIĘĆ pól na `page`** — `viewportW`, `viewportH`, `dsf`
   (czyta je `startPool`, licząc rozmiar zrzutu) oraz `deviceW`/`deviceH` (czyta je `encodeRange`
   i clamp kursora). `capture-compare.mjs` i `capture-faq.mjs` ustawiają komplet; nowy skrypt, który
   skopiował tylko parę `deviceW/deviceH`, dostał fallback `?? 430 / ?? 775` i **łapał nieprzycięte
   klatki 2560×2000** (~5 MP). Objaw: `4 klatki w 1,7 s` przy desktopie, czyli wygląda jak martwa
   pula albo statyczna strona, a jest źle policzonym cropem. Po komplecie pól: 35 klatek, 7,4 fps.

## Checklist

Przed montażem:
- Capture wypisał dla każdej pozycji `→ N frames, Xs`. Referencja z dobrego przebiegu: pętle
  178–565 klatek (Coracle najniżej, bo desktop), switche 38–81. Kilkanaście klatek na pętlę =
  stream zdechł (patrz lekcje 1/4/8), nie „mało ruchu na ekranie".
- Każda **pętla** (nie switch) ma `.work/faq/<id>/marks.json` z `typing`/`question`/`demo` — z nich
  montaż liczy prędkości faz; brak pliku wywala build (`require` w `mark()`), ale **brak klucza
  cicho daje 0** i faza wyjdzie absurdalnie szybka. `answer` i `end` są zapisywane i nieużywane —
  koniec klipu bierze się z `ffprobe`.
- Błąd `"<query>" ranked X first, expected Y` znaczy, że zepsuty jest **ranking / wpis FAQ**, nie klip
  — nie obchodź go podmianą `query` bez decyzji właściciela.

Po montażu:
- Disclaimer „SIMULATION · unofficial · mock data · not affiliated" jest na **każdym** becie, z end
  cardem włącznie — w segmentach rysuje go `chrome()`, w kartach intro/end osobny `drawtext`
  w `card()`. To nie jest dekoracja (CLAUDE.md, sekcja Branding).
- Podpisy: build sam przerywa przy >28 znaków (`CAP_MAX`), bo `drawtext` nie zawija ani nie zmniejsza.
- Tempo wg beat sheetu: typing gra **1.0×** (nagrane 110 ms/znak), skracane są tylko otwarcie panelu,
  przerwa odpowiedź→demo i switch. Zmierzone długości: cut A 35,5 s, cut B 34,3 s, klip per pytanie
  8,7–11,1 s.
- W montażu występują wyłącznie klienci `status: ready` z `src/registry.tsx`.

Przeczytaj `references/parametry.md`, gdy zmieniasz tempo, kadr, rozdzielczość albo selektory: pełne
stałe obu skryptów + lista kotwic w `src/`, na których stoi capture.
