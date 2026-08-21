---
name: tour-i-kotwice
description: Guided toury i mini-toury FAQ w sandstr — kroki, kotwice data-tour, spotlight, komendy stanu symulatora. Użyj gdy dodaję krok toura, gdy „podświetlenie łapie nie to co trzeba", gdy pada słowo „kotwica", „spotlight" albo „tour się sypie", oraz zawsze gdy edytujesz src/data/tours/, src/components/tour/ lub pole showMe w src/data/faq/.
---

# Toury i kotwice

**Zanim cokolwiek zmienisz, przeczytaj `docs/TOURS.md` w całości.** Ten skill jest streszczeniem
i routerem — nie zamiennikiem tamtego pliku.

## Pięć reguł, których nie łam (za `docs/TOURS.md`)

1. **Kolejność alternatyw w selektorze ma znaczenie.** `resolveTarget()`
   (`src/components/tour/useTourElement.ts:47`) bierze **pierwszą pasującą alternatywę w kolejności
   autora**, nie pierwszy element w kolejności dokumentu. Szeroką kotwicę (`.<client>-simulator`)
   stawiaj **zawsze na końcu** — korzeń klienta jest przodkiem kotwicy, więc przed naprawą wygrywał
   zawsze i 25 z 79 kroków po cichu podświetlało cały klient.
2. **Nie zawężaj celu kroku `trigger: 'action'` poniżej kontrolki, która akcję spełnia.**
   Rozmieszczenie omija CEL, więc karta zadokuje się dokładnie na przycisku, na który krok czeka
   (zweryfikowana ślepa uliczka na Amethyście przy 375×812). Cel wielkości ekranu idzie ścieżką
   `interactiveBox()` (`useTourElement.ts:91`), która trzyma kontrolki tego ekranu osiągalne.
3. **Sufit wysokości karty musi być niezależny od karty.** `maxHeight` (`TooltipRect` w
   `src/components/tour/types.ts`) liczy się z celu i pasma, nigdy ze zmierzonej wysokości karty —
   inaczej sufit → wysokość → miejsce → sufit i karta miga między dwoma rozmiarami bez końca.
4. **Całe chrome toura żyje w karcie.** `TourProgress` i `TourControls` są dziećmi `.tour-tooltip`
   (`src/components/tour/TourTooltip.tsx`). Żadnych elementów `position: fixed` — środek viewportu to
   dokładnie miejsce ramki telefonu; poprzedni pasek zakrywał tab-bar Nostura i przechwytywał tam dotyk.
5. **Chrome hosta deklaruje się, nie zgaduje.** `[data-tour-keep-clear]` na elemencie (dziś oba
   warianty disclaimera w `src/host/ClientView.tsx`) sprawia, że karta go omija **i** że pasmo
   rozmieszczenia zaczyna się pod nim. Sam z-index rozstrzyga tylko, który tekst wygra piksele.

Szósta, z audytu targetowania: **spotlight ma pasować do tego, co mówi treść kroku**, a nie tylko być
mniejszy — ciasny ring wokół złej rzeczy jest gorszy niż luźny wokół właściwej.

## Kontrakt komend — nie zmieniaj nazw

Symulator bazowy przyjmuje `className`, `tourCommand?: SimulatorCommand | null` oraz
`onCommandHandled?: () => void`, a efekt robi `switch (tourCommand.type)` i **na końcu woła
`onCommandHandled?.()`** (wzorzec: `src/simulators/damus/DamusSimulator.tsx:27-36` i `:95-143`).
Typ nazywa się dosłownie `SimulatorCommand` u ośmiu klientów — **jedyny wyjątek to Damus
(`DamusSimulatorCommand`)**. Mieszka w różnych miejscach: `<client>/types.ts` (Nostur, Wisp), plik
komponentu bazowego (Damus, Amethyst, Coracle, Keychat, Snort, YakiHonne) albo **sam wrapper**
(Primal, `PrimalWebSimulatorWithTour.tsx:17`) — grepnij `SimulatorCommand` w katalogu klienta zamiast
zgadywać. Amethyst ma **dwie niezależne, identyczne deklaracje** (`AmethystSimulator.tsx:26`
i `AmethystSimulatorWithTour.tsx:14`) — nowy wariant dopisz w obu.
Wrapper `*SimulatorWithTour.tsx` mapuje indeks kroku na komendy
(`stepCommands: Record<number, SimulatorCommand[]>`) i ma osobną gałąź `isFaqStepId(step.id)` dla
mini-tourów FAQ. Zerwanie tego interfejsu psuje naraz wszystkie toury i wszystkie `showMe`.

## Pułapki runtime

- **Kolejka komend niesie dokładnie dwie komendy** — trzecia ginie deterministycznie, nie losowo.
  Projektuj krok tak, żeby **jedna** komenda była samowystarczalna: wzorzec Nostura
  (`src/simulators/nostur/NosturSimulatorWithTour.tsx:79-97`) — każda komenda loguje sama, więc nic
  nie trzeba parować z `{ type: 'login' }`.
- **Krok logowania musi wymusić stan wylogowany.** `[]` zakłada, że odwiedzający przychodzi
  wylogowany; wystarczy, że zaloguje się przed startem albo cofnie z kroku 3 — kotwica jest
  odmontowana. Komenda to `{ type: 'logout' }` (Damus, Primal, Snort, YakiHonne, Nostur, Coracle)
  **albo `{ type: 'back' }` tam, gdzie unia komend nie zna `logout`** (Amethyst, Wisp —
  `AmethystSimulator.tsx:232-235`, `WispSimulator.tsx:221-225`). Sprawdź unię przed wpisaniem.
  **Keychat jest tu pułapką:** wysyła `{ type: 'back' }` (`KeychatSimulatorWithTour.tsx:71`), ale jego
  `back` czyści wyłącznie `selectedChat` (`KeychatSimulator.tsx:100-102`) — czyli nie wymusza niczego.
  Krok logowania Keychata zakłada gościa wylogowanego i pęka, gdy nim nie jest (`key-34`, `key-05`).
- **Timery kolejki czyść przy nowym kroku** (`pendingTimersRef` / `clearPendingTimers` w
  `DamusSimulatorWithTour.tsx:27-31`), inaczej druga komenda porzuconego kroku odpala już po komendzie
  następnego.
- **Krok nie może otwierać overlaya, który zasłania jego własny cel**, a każda gałąź `navigate`
  w symulatorze musi domykać drawer/modal, pod którym cel by wylądował.

## Kotwice `data-tour`

- **Powtarzalne wiersze** — bramkuj na indeksie, żeby zakotwiczyć dokładnie jeden:
  `data-tour={index === 0 ? 'keychat-chat-item' : undefined}`
  (`src/simulators/keychat/screens/ChatListScreen.tsx:91`).
- **Listy generowane z danych** — dodaj opcjonalne `tour?: string` do typu wiersza i przekaż do
  `data-tour` (`src/simulators/damus/screens/SettingsScreen.tsx:24` i `:36`,
  `src/simulators/yakihonne/screens/SettingsScreen.tsx:37`). Zero zmian wizualnych, zero rozgałęzień w JSX.
- **Dwie kotwice o tej samej nazwie nie mogą być zamontowane naraz.** `resolveTarget` woła
  `querySelector` na każdej alternatywie, więc trafia wyłącznie pierwsza w kolejności DOM — tak psuł
  się YakiHonne (`yak-40`, `yak-91`, oba już naprawione). Ta sama nazwa w **wykluczających się**
  gałęziach jest OK i celowa: `snort-compose` siedzi i w railu, i w dolnym pasku
  (`SnortSimulator.tsx:625` oraz `:724`), bo montuje się dokładnie jedna z nich.

## Zasięg i sąsiednie dokumenty

Ten sam silnik napędza **mini-toury FAQ** (`showMe: FaqShowMeStep[]` w `src/data/faq/<client>.ts`,
typ w `src/data/faq/types.ts:12`) — wg `docs/TOURS.md` to 153 mini-toury obok 79 kroków głównych
(zweryfikowane: 79 kroków w 8 plikach `src/data/tours/*-tour.ts`), więc każda zmiana
w `src/components/tour/` dotyka ich wszystkich. **Obie listy się nie pokrywają:** Keychat ma tour,
ale nie ma pliku FAQ; Coracle ma FAQ, ale `tour: false` (wrapper istnieje wyłącznie dla `showMe`);
Gossip nie ma ani jednego, ani drugiego — ładuje się bez wrappera. Kontrakt autorski wpisów:
`src/data/faq/README.md`; zanim dodasz `showMe`, sprawdź w `docs/gaps/<client>.md`, czy ścieżka
istnieje, ma kotwicę i jest osiągalna komendą.

## Weryfikacja

Odpal podgląd (`.claude/launch.json` → config `sandstr`), wejdź w klienta, kliknij **Take a tour**
(host wysyła `start-<id>-tour`) i przejdź krok po kroku, patrząc na konsolę. Dwie pułapki produkują
pewne-ale-fałszywe znaleziska:

- **Geometria mierzona przy nieaktywnym Browser pane to śmieci** (`innerWidth` = 0, tranzycje stoją,
  `setTimeout` dławiony). Najpierw `screenshot`, dopiero potem pomiar — i każdą liczbę idącą do raportu
  potwierdź renderem.
- **Nie klikaj Next szybciej niż kolejka komend.** Odczekaj ≥2,5 s na krok, inaczej krok, którego
  kotwica montuje się po `logout`/`navigate`, czyta się jak realny defekt.

Na koniec `npm run typecheck` (tsc realnie sprawdza `src/`) i `npm run build`.

Przeczytaj `references/dodawanie-kroku.md`, gdy dopisujesz nowy krok, kotwicę albo `showMe` —
a nie tylko poprawiasz treść istniejącego kroku.
