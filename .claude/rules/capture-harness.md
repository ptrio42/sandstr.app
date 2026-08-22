---
description: "Headless Chrome przez CDP: zrzuty kart share, klipy demo, shoty promocyjne."
paths:
  - "scripts/**"
  - "docs/clips/**"
---

# Harness zrzutów (headless Chrome / CDP) — zmierzone pułapki

- **`--screenshot` w headless Chrome zapisuje PNG i się NIE kończy** (zmierzone na Chrome 151,
  także z `--virtual-time-budget`; `--headless=old` wypadło w Chrome 132). Pętla na
  `execFileSync` robi pierwszy zrzut i wisi na drugim. Dlatego `og-client-cards.mjs` jedzie
  dziś przez CDP (jeden Chrome, `Page.captureScreenshot`) — jak `docs/clips/capture-faq.mjs`.
  Jeśli kiedykolwiek wrócisz do `--screenshot`: czekaj na **plik**, nie na kod wyjścia,
  i ubijaj całą grupę procesów — sam pid zostawia kilkanaście helperów.
- **Zrzut symulatora do karty share: czekaj na TREŚĆ, nie na pudełko, i wchodź przez logowanie.**
  `ClientView` układa stage natychmiast po dopasowaniu trasy, a chunk `lazy()` dochodzi znacznie
  później — warunek na sam prostokąt startuje kroki w pustej stronie i wywala się na losowym
  kliencie za każdym przebiegiem. Próg liczony w elementach, i **nisko**: ekran logowania Primala
  ma ich 19, przez co próg 30 zgłaszał „never rendered" dla w pełni namalowanej strony. Do tego
  `Page.navigate` + natychmiastowy `Runtime.evaluate` potrafi trafić w WYCHODZĄCY dokument
  (readyState już `complete`), więc `goto()` czeka najpierw na `Page.loadEventFired`.
  Dziewięciu z dwunastu klientów otwiera się na ścianie logowania — tabela `ENTRY` w generatorze
  przeklikuje wejście po WIDOCZNYCH etykietach; zmiana onboardingu klienta wywala `og:cards`
  z nazwą kroku, nie po cichu.
- **Klik w symulator z zewnątrz potrzebuje OBU dróg.** Prawdziwe `Input.dispatchMouseEvent`
  przechodzi hit-test (Keychat ignoruje syntetyczny `el.click()`), ale przez ten sam hit-test
  niewidoczny scrim zjada klik (modal powitalny Gossipa). Generator próbuje myszy, a gdy ekran
  nie drgnie — sięga po węzeł. I sprawdza „udało się" jako **zmiana ekranu ALBO zniknięcie
  kontrolki**: modal Gossipa jest portalowany poza stage, więc jego zamknięcie nie zmienia
  tekstu stage'u wcale.
- **Po zalogowaniu leci toast powitalny — 2500 ms** (`showToast` w Amethyst, Amethyst v1.12
  i Keychat). Trzy karty wyszły z nim na feedzie. Generator dośpi RESZTĘ tego okna licząc od
  wejścia, nie płaski sleep na wierzchu dopasowywania kadru. Geometrii urządzenia na karcie
  **nie licz trygonometrią** — obrót plus perspektywa robią z tego coś innego, niż wychodzi
  na kartce; `og-client-cards.mjs` mierzy `getBoundingClientRect()` gotowej karty i wywala
  się z liczbą pikseli wyjazdu.

<!-- Wyjęte z sekcji Gotchas w CLAUDE.md 2026-08-21. Treść verbatim; zmienił się tylko moment ładowania. -->
