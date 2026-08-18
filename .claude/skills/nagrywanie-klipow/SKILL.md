---
name: nagrywanie-klipow
description: 'Nagrywanie i montaż klipów demo sandstr: teaser, screencast pętli FAQ, screenshoty do promocji. Użyj gdy: "nagraj teaser", "klip", "screencast", "capture", "zmontuj", "shoty na twittera", "klip na Nostra", albo gdy dotykasz docs/clips/ (capture-faq.mjs, build-teaser-faq.sh, capture-shots.sh, build-teaser.sh). Harness to headless Chrome przez CDP + ffmpeg, zero zależności npm.'
---

# Nagrywanie klipów demo sandstr

Najpierw przeczytaj scenariusze — ten skill ich NIE powtarza: `docs/clips/README.md` (cut #1)
i `docs/clips/faq-teaser.md` (cut #2: beat sheet FAQ, reguły kadru, uzasadnienia).

## Co gdzie leży

- `docs/clips/capture-faq.mjs` — headless Chrome przez CDP, **zero zależności npm** (globalny
  `WebSocket` z Node ≥22; tu 24); tablice `LOOPS` (6 pętli) i `SWITCHES` (3 przejścia). Wyjście:
  surowe `.work/faq/<id>.mp4`, a dla pętli dodatkowo `.work/faq/<id>/marks.json` (bez podpisów
  i karty). Switche marks.json **nie mają** — montaż ich nie potrzebuje.
- `docs/clips/build-teaser-faq.sh` — sam ffmpeg; z pętli robi `out/sandstr-faq-a.mp4`, `-b.mp4`,
  sześć klipów per pytanie i `-hero.mp4`.
- `docs/clips/capture-shots.sh` + `build-teaser.sh` + `Nagranie z ekranu 2026-08-5 o 22.07.56.mov`
  — starsza generacja (cut #1): stills z dev servera i montaż z nagrania ekranu.
- Katalogi: `.work/` (pośrednie, m.in. pula klatek `.work/faq/.pool/<id>/*.jpg`), `out/`, `shots/`.

**Git:** `docs/clips/.gitignore` wyklucza tylko `.work/` i `out/sandstr-faq-*.mp4`. Reszta binariów
(`.mov`, `shots/*.png`, `out/sandstr-teaser-vertical.mp4`, `out/sandstr-loop-zap.mp4`) **jest
śledzona** — nie kasuj jej i nie dokładaj nowych plików do `out/` poza wzorcem `sandstr-faq-*`.

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

1. **`Page.startScreencast`, nigdy pętla `captureScreenshot`** — pętla dzieli socket CDP z driverem
   i dławi wszystko do ~1 fps. **Ackuj klatkę przed zapisem na dysk** — ack po zapisie stawia ją za
   round-tripem fs i Chrome przestaje nadawać.
2. **Czas klatki licz z momentu PRZYJŚCIA (`Date.now()`)**, nie z `metadata.timestamp` — ten jest
   niemonotoniczny i robił fantomowe 7-sekundowe dziury w timeline.
3. **Nagrywaj przeciw buildowi produkcyjnemu**, nigdy przeciw `npm run dev` — inne sesje agentów
   trzymają 5173 i sama kontencja CPU wydłużyła przebieg 3× aż do timeoutu na czekaniu na ekran.
4. **Jeden Chrome na pętlę, screencast nigdy nie zatrzymywany w środku** — reuse przeglądarki wysusza
   stream po pierwszej pętli, a `Page.bringToFront` przestawia nagrywaną kartę w `hidden`.
5. **Czekaj na `.tour-spotlight` z rectem > 8×8**, zanim uznasz, że krok wstał — mini-tour mocuje ekran
   ~1–1,5 s, a do tego czasu leci bez spotlightu (siatka missing-target) i filmujesz defekt.
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
