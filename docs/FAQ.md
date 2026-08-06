# Sandstr — FAQ (stan i wnioski z wdrożenia)

> **Co to jest.** Kurowane FAQ per klient: pytania „jak zrobić X w tym kliencie", z odpowiedziami
> opartymi o **realną appkę**, i z opcjonalnym przyciskiem **„Show me in the simulator"**, który
> odtwarza odpowiedź jako 1–3-krokowy mini-tour w naszym symulatorze.
>
> Kontrakt autorski (jak pisać wpisy) żyje w [`src/data/faq/README.md`](../src/data/faq/README.md).
> Ten plik to stan wdrożenia + wnioski, których nie widać z samego kodu.
>
> Wdrożenie: 2026-08-06, ośmiu klientów, każdy przez recon → treść → weryfikacja klik-po-kliku →
> rewizja adwersaryjna → poprawki.

## Stan

| Klient | Wpisy | Mini-toury | Uwagi |
|---|---:|---:|---|
| Damus | 20 | 12 | pierwszy, prototyp całej mechaniki |
| Amethyst | 19 | 10 | odblokowany drawer + sekcje Settings |
| Primal | 20 | 13 | pierwszy klient webowy (bez ramki) |
| Nostur | 23 | 17 | miał najlepsze kotwice i zero demonstracji |
| YakiHonne | 22 | 11 | 8 nowych komend; najwięcej luk w simie |
| Snort | 19 | 12 | dwa realne bugi symulatora przy okazji |
| Wisp | 19 | 13 | 5 odblokowań, o które prosił ledger |
| Coracle | 24 | 16 | **pierwszy klient bez wrappera** — zbudowany od zera |
| **Razem** | **166** | **104** | |

**Nie zrobione:** Keychat i Gossip — czekają na nowe nagrania (bez recon nie ma czym mierzyć).
Gossip ma dodatkowo `gos-01`: klik w notatkę wyrzuca `TypeError`, a brak `ErrorBoundary` odmontowuje
całego hosta razem z **obowiązkowym banerem disclaimera**. To trzeba naprawić przed FAQ.

## Mechanizmy, które trzymają jakość

**1. Kontrakt pokrycia wymuszany przez kompilator.** `CANONICAL_TOPICS` w
[`types.ts`](../src/data/faq/types.ts) to bank 16 tematów, na które **każdy** plik klienta musi
odpowiedzieć: id wpisu, `'n/a'` (klient nie ma takiej funkcji) albo `'todo'` (jawny dług). Plik, który
pominie temat, nie przechodzi typechecka. Dodanie nowego tematu celowo psuje wszystkie pliki, dopóki
każdy się nie zadeklaruje — to jest cel, nie uciążliwość.

**2. Rejestr luk jako bramka `showMe`.** [`GAPS.md`](GAPS.md) i `gaps/<client>.md` mówią, czy dana
ścieżka w symulatorze w ogóle istnieje, ma kotwicę i jest osiągalna komendą. Odpowiedź tekstową wolno
napisać zawsze; **demo tylko wtedy, gdy sim potrafi je pokazać**.

**3. Rewizja adwersaryjna po każdym kliencie.** Osobne agenty próbują **obalić** każde znalezisko.
Bilans: **68 potwierdzonych** znalezisk, w tym **8 realnych bugów kodu**. Same odpowiedzi tekstowe
przeszłyby zwykły przegląd — to demo pokazało, że są nieprawdziwe.

## Czego się nauczyliśmy (i co z tego weszło do kontraktu)

**Najgroźniejszy błąd: podpis opisuje realną appkę, a spotlight ramuje symulator.** To był ~70%
wszystkich znalezisk. Rekord: YakiHonne — dziesięć na dziesięć. Objawy zawsze te same: ekran montuje
się na pustej zakładce, pole wyszukiwania startuje z wpisanym tekstem, menu nie ma wiersza, który
podpis nazywa, przycisk nigdy nie zmienia wyglądu. Lekarstwo jest nudne i skuteczne: **otwórz sim na
tym ekranie i przeczytaj podpis na głos przeciwko temu, co widzisz**. Gdy sim nie potrafi tego pokazać
— usuń `showMe`. Uczciwy wpis tekstowy bije demo, które samo sobie przeczy.

**Temat kanoniczny to pytanie użytkownika, nie nazwa funkcji.** Wyszło od właściciela przy okazji
mute: cztery z pięciu wpisów odpowiadały „jak wyciszyć kogoś" i kończyły. Audyt przeciwko źródłom
pokazał, że realny kształt jest zupełnie inny per klient — Amethyst ma **sześć** rodzajów (ludzie,
słowa, hashtagi, wątki, spamerzy, blokowane relaye), Nostur **nie ma** hashtagów, YakiHonne nie ma ani
słów, ani hashtagów. Fakt „ten klient tego nie ma" jest równie wartościowy jak instrukcja — o ile jest
zweryfikowany, a nie domniemany przez ciszę. Ta sama próba dotyczy `manage-relays`, `notifications`
i `connect-wallet`.

**Odwrócone fakty zdarzają się przy pisaniu z pamięci.** Dwa razy napisałem coś dokładnie na opak:
w Wispie **tap otwiera paletę emoji, a przytrzymanie wysyła reakcję** (napisałem odwrotnie), a ikona
zapa to **₿, nie błyskawica** — przy czym moja własna notatka dwa wiersze niżej mówiła poprawnie.
Stąd zasada: cytuj plik i symbol przy każdym twierdzeniu z warstwy Advanced.

**Pułapki inżynierskie, które przeszłyby code review** (wszystkie w kontrakcie):
- stan ustawiony przez wyniesione logowanie **nie jest widoczny w tym samym przebiegu efektu** —
  Snort pokazywał własny profil zamiast cudzego w demie „jak kogoś obserwować";
- dwa moduły mocków, z których każdy generuje id, **nigdy się nie zejdą** — wyszukanie „znajdź wątek
  tej notatki" cicho zwracało null i demo ramowało samotną notatkę zamiast konwersacji;
- `querySelector` z listą przecinkową bierze **pierwszy w kolejności dokumentu**, nie listy;
- kotwica musi siedzieć na **powierzchni, którą opisuje**, nie na kontrolce w środku (spotlight
  przycina się do prostokąta celu), i **w tej gałęzi**, którą montuje komenda;
- stan ustawiony komendą (wymuszona zakładka, przełączony tryb) **przeżywa demo** i psuje kolejne.

## Jak pracowaliśmy (lekcje procesowe — najbardziej przenośne)

**Schemat wyjścia to miejsce, w którym egzekwuje się lekcję — nie proza w prompcie.** Po YakiHonne
(dziesięć na dziesięć znalezisk to podpisy sprzeczne z ekranem) dodałem do schematu reconu **wymagane**
pole `verifiedOnScreen`: agent musi opisać, co użytkownik dosłownie widzi w zakotwiczonym elemencie.
To zadziałało mocniej niż jakiekolwiek zdanie w instrukcji — bo pola wymaganego nie da się pominąć,
a prozę można przeczytać i nie zastosować. Snort i Wisp miały po nim mniej znalezisk tej klasy.

**Prompt uczył się między klientami.** Każdy kolejny recon dostawał znaleziska z poprzedniej rewizji
wpisane wprost: po Snorcie doszły dwie pułapki inżynierskie, po pytaniu właściciela — obowiązek
wyliczania rodzajów tematu, po Wispie — dwie zasady o kotwiczeniu. Efekt jest mierzalny: Coracle
**nie miał** ani jednego znaleziska klasy „nieświeży `currentUser`" czy „kotwica w złej gałęzi", bo oba
były zaprojektowane poprawnie od pierwszego podejścia.

**Jedno pytanie właściciela znalazło lukę, której nie znalazło 68 agentowych znalezisk.** Rewizje
adwersaryjne sprawdzały, czy *napisane* odpowiedzi są prawdziwe — i były. Nikt nie spytał, czy pytanie
jest **kompletne**, dopóki właściciel nie zapytał o rodzaje mute. To jest systematyczna ślepota:
weryfikator sprawdza tezę, którą dostał, a nie tezę, której brakuje. Stąd „completeness critic" jako
osobny krok jest wart więcej niż kolejny weryfikator.

**Rewizja adwersaryjna TREŚCI znalazła 8 bugów KODU.** Demo przechodzi ścieżki, których nie przechodzi
żaden test: montuje ekran komendą, kotwiczy element, mierzy prostokąt spotlightu. Dlatego wyszły rzeczy
niewidoczne w testach — profil własny zamiast cudzego, wątek bez odpowiedzi, arkusz zapa nad komponerem.
Wniosek: gdy budujesz warstwę, która *steruje* istniejącym kodem, jej przegląd jest zarazem testem
integracyjnym tego kodu.

**Skrypty do edycji zbiorczych muszą raportować, nie przerywać.** Dwa razy skrypt z `assert` przerwał
się na pierwszym niedopasowaniu, zapisując część zmian albo nic — a wyglądało to jak sukces poprzednich.
Wzorzec, który się sprawdził: pętla po poprawkach, `if old in s` → zamień i licz, `else` → wypisz `MISS`,
na końcu `applied N of M`. Wtedy widać dokładnie, co zostało.

**Wstawianie kotwic skryptem wymaga weryfikacji sztuka po sztuce.** Skrypt brał „pierwszy `<div>` po
deklaracji komponentu" — i w `MessagesScreen` trafił w gałąź rozmowy zamiast listy, przez co demo DM-ów
nie miało celu w ogóle. Kotwica wygląda tak samo w diffie niezależnie od tego, czy jest w dobrej gałęzi.

**Weryfikuj przez DOM, nie po obrazku.** Panel przeglądarki potrafi przestać kompozytować klatki —
screenshot pokazuje szkielet, a `document.querySelector` widzi kompletne drzewo. Straciłem na tym
kilkanaście minut przy Coracle, przekonany, że zepsułem montowanie. Objaw rozpoznawczy: *kilku* klientów
naraz przestaje się renderować, w tym taki, który działał godzinę wcześniej.

## Inne znaleziska (poza FAQ)

- **Brak `ErrorBoundary` w całym `src/`** — wyjątek z symulatora kładzie hosta razem z banerem
  disclaimera, który wg CLAUDE.md jest nienegocjowalny. Rekomendacja: granica błędu wokół `ClientView`.
- **`CLAUDE.md` opisuje undo-countdown Wispa jako „na każdym poście"** — to stan ekranu tworzenia
  notatki, nie feedu. Symulator jest zrobiony dobrze; myli tylko to zdanie w instrukcjach.
- **Wyścig kolejki komend** (przeterminowany timer z poprzedniego kroku dispatchował komendę po
  komendzie następnego) był **we wszystkich ośmiu wrapperach**. Naprawiony wszędzie, gdzie dotykaliśmy.
- **Snort: wyciszone słowa są zapisywane, ale nic po nich nie filtruje** w wersji, którą odtwarzamy —
  fakt o upstreamie, nie o naszym simie.
- **Panel przeglądarki potrafi przestać kompozytować klatki** — screenshoty pokazują sam szkielet,
  podczas gdy DOM jest kompletny. Weryfikuj przez `javascript_exec` na DOM, nie po obrazku.

## Możliwy kierunek (decyzja produktowa, nie techniczna)

„How to change relays in Damus" to klasyczny long-tail search — ludzie to googlują i lądują na
przestarzałych postach. Statyczne, indeksowalne strony `/faq/<client>` z linkiem „try it in the
simulator" mogłyby być głównym kanałem pozyskania ruchu. Wymaga świadomego wyjątku od `Disallow: /c/`
w `robots.txt` i przypiętego canonicala — dziś oba celowo blokują indeksowanie tras klientów.
