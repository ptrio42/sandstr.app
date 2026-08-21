# Sandstr — guided toury (stan i twarde reguły)

> **Co to jest.** Silnik `src/components/tour/` plus 8 konfiguracji kroków w `src/data/tours/`.
> Ten sam silnik napędza **mini-toury FAQ** (`showMe`), więc każda zmiana tutaj dotyka 137 mini-tourów,
> nie tylko 79 kroków głównych tourów.
>
> Ten plik opisuje **reguły, których nie widać z kodu** — i defekty, które z ich złamania wynikły.
> Kontrakt autorski FAQ żyje w [`src/data/faq/README.md`](../src/data/faq/README.md), stan wdrożenia
> FAQ w [`FAQ.md`](FAQ.md), a to, ile z realnej apki mamy — w [`GAPS.md`](GAPS.md).
>
> Przepisane 2026-08-08 (merge `0e26529`) po audycie, który zaczął się od pytania „czemu toury
> zasłaniają symulatory".

## Stan

| | |
|---|---|
| Kroki głównych tourów | 79 w 8 klientach (Coracle i Gossip nie mają toura) |
| Kroki celujące w cały klient | **0** w środku touru; 16 to welcome/outro i tak ma być |
| Martwe selektory klasowe w celach | 0 |
| Kroki wymagające akcji (`trigger: 'action'`) | 8, wszystkie w Amethyście |

## Pięć reguł, których nie łam

**1. Kolejność alternatyw w selektorze ma znaczenie.** `resolveTarget()` dzieli listę i bierze
**pierwszą pasującą alternatywę w kolejności autora**, nie pierwszy element w kolejności dokumentu.
Dzięki temu `'[data-tour="x"], .client-simulator'` znaczy wreszcie „kotwica, a w ostateczności cała
appka". Zanim to naprawiono, korzeń klienta — będąc **przodkiem** kotwicy — wygrywał zawsze, i 25 z 79
kroków po cichu podświetlało cały klient. **Szeroką kotwicę zawsze stawiaj na końcu listy.**

**2. Nie zawężaj celu kroku akcyjnego poniżej kontrolki, która akcję spełnia.** Rozmieszczenie omija
CEL. Wskazanie krokiem `trigger: 'action'` na pod-element pozwala karcie zadokować się na przycisku,
na który krok czeka — zweryfikowana ślepa uliczka na Amethyście 2/10 przy 375×812. Cel wielkości
ekranu idzie zamiast tego ścieżką `interactiveBox`, która trzyma osiągalne wszystkie kontrolki tego
ekranu.

**3. Sufit wysokości karty musi być niezależny od karty.** `maxHeight` liczy się z celu i pasma, nigdy
ze zmierzonej wysokości karty. Inaczej: sufit zmienia wysokość → wysokość zmienia zwycięskie miejsce →
miejsce zmienia sufit, i karta miga między dwoma rozmiarami w nieskończoność. Ta sama pułapka czeka na
każdą przyszłą heurystykę „dopasuj do wolnego miejsca".

**4. Całe chrome toura żyje w karcie.** Pasek postępu i Prev/Next/Skip są dziećmi `.tour-tooltip`.
Nie dodawaj elementów `position: fixed` — środek viewportu to dokładnie miejsce, gdzie stoi ramka
telefonu. Poprzednia wersja paska sterowania zakrywała ~49% tab-baru Nostura i **przechwytywała tam
dotyk**: `elementFromPoint` na każdej z pięciu zakładek zwracał pasek toura.

**5. Chrome hosta deklaruje się, nie zgaduje.** `[data-tour-keep-clear]` na elemencie (dziś oba
warianty disclaimera w `ClientView`) sprawia, że karta go omija **i** że pasmo rozmieszczenia zaczyna
się pod nim. Sam z-index rozstrzyga tylko, który z dwóch nachodzących tekstów wygra piksele.

## Dwa wzorce dodawania kotwic

**Powtarzalne wiersze** — bramkuj na indeksie, żeby zakotwiczyć dokładnie jeden:
`data-tour={index === 0 ? 'keychat-chat-lock' : undefined}`. Tak działają Damus `NoteCard`, wiersze
czatów Keychata i istniejący prop `tourTarget` w Snorcie.

**Listy generowane z danych** — dodaj opcjonalne pole do typu wiersza (`tour?: string`) i przekaż je
do `data-tour`. Tak zrobione są ustawienia YakiHonne i komponent `Group` w ustawieniach Damusa. Zero
zmian wizualnych, zero rozgałęzień w JSX.

## Pułapki runtime

- **Kolejka komend niesie dokładnie dwie komendy.** Trzecia jest gubiona deterministycznie, nie
  losowo. Keychat miał dwa kroki nieosiągalne właśnie z tego powodu (`key-35`). Jeśli potrzebujesz
  trzech — poszukaj komendy, która jest zbędna (często `navigate` do zakładki, która i tak jest
  domyślna).
- **Kilka `registerAction` w jednym ticku działa**, ale tylko dlatego, że provider czyta stan przez
  synchroniczny ref. Wcześniej druga akcja leciała na starym domknięciu i przepadała — tour stał na
  „Waiting…" dla kroku, który użytkownik już wykonał.
- **Krok logowania potrzebuje komendy wylogowania.** `[]` zakłada, że odwiedzający przychodzi
  wylogowany; wystarczy, że zaloguje się przed startem albo cofnie z kroku 3. Stan kolejkowany przez
  krok 1 (ścieżki względem `src/simulators/<klient>/`): **pięciu** klientów wysyła `{type:'logout'}` —
  Damus `DamusSimulatorWithTour.tsx:109`, Nostur `NosturSimulatorWithTour.tsx:89`, Primal
  `PrimalWebSimulatorWithTour.tsx:107`, Snort `SnortSimulatorWithTour.tsx:93`, YakiHonne
  `YakiHonneSimulatorWithTour.tsx:101`. Amethyst (`AmethystSimulatorWithTour.tsx:99`) i Wisp
  (`WispSimulatorWithTour.tsx:83`) wysyłają `{type:'back'}`, bo ich unie komend nie znają `logout`
  (`AmethystSimulator.tsx:17-20`, `wisp/types.ts:13-26`) — ale ich `back` realnie kasuje sesję
  (`AmethystSimulator.tsx:232-235`, `WispSimulator.tsx:221-225`). **Keychat wysyła to samo
  `{type:'back'}` (`KeychatSimulatorWithTour.tsx:71`) i jako jedyny nic tym nie osiąga**: jego `back`
  czyści wyłącznie `selectedChat` (`KeychatSimulator.tsx:100-102`), a unia komend nie zna `logout`
  (`KeychatSimulator.tsx:23-26`) — patrz `key-34`, `key-05`.
- **Obserwatory montują się bezwarunkowo**, a pomiary są koalescowane przez `requestAnimationFrame`.
  Liczenie prosto w callbacku `ResizeObservera` zmienia layout z jego wnętrza — przeglądarka zgłasza
  to jako `ResizeObserver loop completed with undelivered notifications`, czyli realny błąd w konsoli.

## Znaleziska z nagrywania promocyjnego (2026-08-12)

Trzy błędy, wszystkie w jednym kroku przewodnika po Wispie, wszystkie znalezione
dopiero przez **sfilmowanie touru** — nie przez przegląd kodu i nie przez klikanie.

- **Pasmo, w którym karta się mieści, to nie to samo co pasmo, w którym da się ją
  przeczytać.** Matematyka pozycjonowania miała próg czytelności (`LEGIBLE` 240),
  ale stosowała go tylko w pierwszym z trzech przejść, a podłoga dla zwycięskiego
  pasma wynosiła 180 px. Zmierzone na 430×775: karta 180 px, nagłówek plus pasek
  akcji plus przyciski biorą 155, na przewijaną treść zostaje **25 px przy 140 px
  zawartości**. Tekst kroku nie był ucięty — był **nieobecny**, bez paska
  przewijania, który by to zdradził. Próg `UNUSABLE` (200) odrzuca teraz takie
  pasmo we wszystkich przejściach; karta idzie wtedy do krawędzi ekranu i zasłania
  kawałek celu. Cel zasłonięty częściowo wciąż jest na ekranie; słowa nie były.
- **Selektor z przecinkiem trafia w pierwszy element w kolejności DOKUMENTU, nie
  listy.** `'[data-tour="wisp-post-card"], [data-tour="wisp-feed"]'` z komentarzem
  „the top post card, not the whole feed root" robił dokładnie odwrotnie:
  `wisp-feed` jest rodzicem kart, więc wygrywał zawsze, cel wypełniał ekran, a
  przy takim celu silnik świadomie nie rysuje pierścienia. Pułapka była już
  opisana w `src/data/faq/README.md` dla mini-tourów — tu weszła do zwykłego touru.
- **Podpis opisywał coś, czego pierścień nie obejmował.** Krok mówił o pigułkach
  „online" i „relays" w górnym pasku, a ring siedział na karcie notatki trzysta
  pikseli niżej; pigułki nie miały żadnej kotwicy. Rozbite na dwa kroki (tour ma
  teraz 11), pigułki dostały wspólną kotwicę `wisp-pills`. To ta sama klasa błędu,
  która była ~70% znalezisk przy rewizji FAQ — obowiązuje tak samo w tourach.

**Wniosek przenośny: nagranie jest testem integracyjnym.** Przechodzi ścieżki,
których nie przechodzi żaden test — montuje ekran komendą, mierzy prostokąt,
utrzymuje kadr na tyle długo, żeby dało się przeczytać. Zanim cokolwiek z touru
pójdzie w świat, sfilmuj go i obejrzyj klatka po klatce.

## Jak to weryfikować

Pomiary geometrii z `javascript_exec` są **śmieciowe, gdy panel podglądu nie jest na wierzchu**:
`innerWidth` czyta 0, tranzycje nie postępują, `setTimeout` jest dławiony. W trakcie tego audytu
wyprodukowało to kilka pewnych-ale-fałszywych znalezisk. Zrzut ekranu przed każdym pomiarem, a każdą
liczbę idącą do raportu potwierdź renderem.

Drugie, niezależne źródło fałszywych alarmów: **automatyczne klikanie Next szybciej niż człowiek
wyprzedza kolejkę komend**. Krok, którego kotwica montuje się po `login` + `navigate`, czyta się wtedy
jako nierozwiązany — nie do odróżnienia od realnego defektu. Odczekaj ≥2,5 s na krok.

## Świadome decyzje, nie przeoczenia

- **`allowClickThrough` jest bezczynne** i tak ma zostać. Backdrop nigdy nie blokował kliknięć
  (`.tour-overlay` ma `pointer-events: none`), więc każdy krok jest przepuszczalny — a to jest
  zachowanie, którego ten produkt chce: obietnicą jest „po prostu spróbuj", a tour zamrażający
  reprodukcję jej przeczy. Szczegóły i sposób włączenia modalności: komentarz przy `TourStep` w
  [`types.ts`](../src/components/tour/types.ts).
- **Kroki welcome/outro celują w `.<client>-simulator`** — u Primala w `.primal-web`
  (`primal-tour.ts:11,97`; klasa z `primal/web/WebSimulator.tsx:165`). Renderują się jako wyśrodkowane karty
  wprowadzające z łagodnym przyciemnieniem i bez ringu. To jest zamierzone.
- **Fioletowy chrome `#8b5cf6` nie należy do żadnego klienta ani do marki sandstr** (`#7C68F2`). To
  odziedziczony `primary` z `nostrich.love`. Świadomie zostawiony — otwarta decyzja produktowa, czy
  chrome ma brać akcent klienta z `registry`, czy przejść na neutralny achromat.
