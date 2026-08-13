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
>
> **Rozszerzenie 2026-08-07:** temat `multi-account` + nowa KLASA pytań `Troubleshooting`
> (7 objawów × 8 klientów). Dodatkowy krok w procesie: **completeness critic**. Patrz „Runda 2".

## Stan

| Klient | Wpisy | Mini-toury | Uwagi |
|---|---:|---:|---|
| Damus | 28 | 18 | pierwszy, prototyp całej mechaniki |
| Amethyst | 27 | 13 | odblokowany drawer + sekcje Settings |
| Primal | 28 | 16 | pierwszy klient webowy (bez ramki) |
| Nostur | 31 | 21 | miał najlepsze kotwice i zero demonstracji |
| YakiHonne | 30 | 14 | 8 nowych komend; najwięcej luk w simie |
| Snort | 27 | 15 | dwa realne bugi symulatora przy okazji |
| Wisp | 27 | 16 | 5 odblokowań, o które prosił ledger |
| Coracle | 32 | 20 | **pierwszy klient bez wrappera** — zbudowany od zera |
| **Razem** | **230** | **133** | +64 wpisy w rundzie 2 (8 × 8) |

**Liczby w tabeli to snapshot drzewa roboczego z 2026-08-11** — nie aktualizują się same, więc przed
cytowaniem ich gdziekolwiek indziej przelicz:

```bash
for f in src/data/faq/{amethyst,coracle,damus,nostur,primal,snort,wisp,yakihonne}.ts; do
  echo "$(grep -cE "^      id: '" $f) $(grep -cE "^      showMe: \[" $f) $f"
done | awk '{e+=$1;s+=$2; print} END{print "RAZEM", e, s}'
```

(pierwsza kolumna = wpisy, druga = mini-toury; wcięcie 6 spacji odróżnia pole wpisu od kluczy
`coverage` i od pól kroków `showMe`).

**Nie zrobione:** Keychat i Gossip — czekają na nowe nagrania (bez recon nie ma czym mierzyć).
~~Gossip ma dodatkowo `gos-01`~~ — **naprawione 2026-08-07** razem z przywróceniem typechecka: klik
w notatkę nie rzuca już `TypeError`, wątek renderuje notę główną, a baner disclaimera zostaje na
ekranie. `ErrorBoundary` wokół `ClientView` nadal **nie istnieje** — to osobna, otwarta rekomendacja
(patrz [`GAPS.md`](GAPS.md)).

## Mechanizmy, które trzymają jakość

**1. Kontrakt pokrycia wymuszany przez kompilator.** `CANONICAL_TOPICS` w
[`types.ts`](../src/data/faq/types.ts) to bank 17 tematów, na które **każdy** plik klienta musi
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
**Runda 2 to zmierzyła:** ten sam materiał dał 55 znalezisk rewizji i — już PO ich naprawieniu —
77 luk krytyka kompletności, w tym 44 „must-add". Krok się opłaca; patrz sekcja „Runda 2".

**~~Kontrakt pokrycia jest dziś martwy w `npm run typecheck`~~ — NAPRAWIONE 2026-08-07.** Historia jest
warta zapamiętania, bo obie warstwy udawały zdrowie. `tsc` pomija **wszystkie** diagnostyki semantyczne,
gdy w programie jest choć jeden błąd składniowy — a `useSimulator.ts` miał cztery (JSX w pliku `.ts`,
odziedziczone). Efekt: `Record<CanonicalTopic, …>` nie pilnował niczego, a wyjście wyglądało na
„prawie czyste": cztery znane, opisane w CLAUDE.md jako PRE-EXISTING błędy. Drugą warstwą był `TS6310`
z `references` na `tsconfig.node.json` (`noEmit` + `composite`), który sam w sobie ucinał resztę.

Zdjęcie obu (rename na `.tsx`, `references` usunięte) odsłoniło **40 realnych błędów**; wszystkie
naprawione. Weryfikacja kontraktu: tymczasowe dorzucenie atrapy do `CANONICAL_TOPICS` wypisuje dokładnie
osiem plików klientów. Czyli od teraz **`npm run typecheck` faktycznie egzekwuje pokrycie** — dodanie
tematu psuje build każdego klienta, dopóki się nie zadeklaruje.

**Morał ogólniejszy:** narzędzie, które raportuje *mało* błędów, nie musi znaczyć, że kod jest zdrowy —
sprawdź najpierw, czy w ogóle doszło do analizy. Tu pojedynczy błąd składniowy uciszał ~40 diagnostyk
przez wiele miesięcy, w tym P0 kładący hosta (`gos-01`).

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

## Runda 2 (2026-08-07): `multi-account` + klasa `Troubleshooting`

Obie luki z poprzedniej sekcji zamknięte. **+64 wpisy** (8 klientów × 8), z czego 56 to nowa,
tekstowa klasa „dlaczego to nie działa", a 8 to temat `multi-account` — z **5 nowymi demami**
(Damus, Primal, Nostur, Wisp, Coracle; pozostałe trzy simy nie mają czego pokazać, więc nie mają `showMe`).

**Temat `multi-account` udowodnił mechanizm kontraktu.** Odpowiedzi wyszły naprawdę różne, a nie
wariantami jednej: Amethyst / Nostur / YakiHonne / Wisp mają realny przełącznik; **Snort ma przełącznik,
ale nie ma ŻADNEGO przycisku „dodaj konto"** (strona `/settings/accounts` istnieje, tylko jej wpis
w menu jest za subskrypcją, której Snort nie włącza); Damus i Primal trzymają jeden klucz naraz.
„Ten klient tego nie ma" okazało się równie użyteczną odpowiedzią jak instrukcja.

**Nowe pole `FaqEntry.howNostrWorks`** — protokolarna połowa odpowiedzi, renderowana jako osobny blok.
Powód jest twardy: przy „dlaczego to nie działa" połowa odpowiedzi nie dotyczy klienta (relaye, klucze,
NIP-y), a wmieszana w kroki czyta się jak instrukcja do wyklikania. Rewizja od razu to wykorzystała:
trzy znaleziska dotyczyły **faktów o kliencie przemyconych do bloku o protokole**.

### Co dał completeness critic (nowy krok)

To była najbardziej opłacalna zmiana w procesie. Rewizja adwersaryjna dała **55 znalezisk** (wszystkie
poprawione) — sprawdzała, czy napisane zdania są PRAWDZIWE. Critic pytał tylko „czego tu **brakuje**"
i dał **77 luk, w tym 44 „must-add"** w tekstach, które właśnie przeszły rewizję. To jest dokładnie ta
ślepota, którą odkrył właściciel pytając o rodzaje mute — tylko zmierzona.

Przykłady tego, co znalazł krytyk, a czego nie znalazł weryfikator:
- **Damus**: „Delete Account" w Settings **nie kasuje konta** — podpisuje profil „nobody / account
  deleted" i wylogowuje; klucz działa dalej wszędzie indziej. Wylogowanie **odłącza portfel** (NWC to
  jeden wpis w keychainie na urządzenie, nie per klucz).
- **Primal**: zmiana konta **w rozszerzeniu przeglądarki** nie zmienia konta w Primalu.
- **Nostur**: „Follow" ma **trzy** stany — drugie tapnięcie to *cichy* follow, który **usuwa** kogoś
  z publikowanej listy obserwowanych.
- **Snort**: klucz zaszyfrowany PIN-em → **Anuluj na pytaniu o PIN robi sesję read-only** na całą wizytę.
- **Wisp**: założenie nowego konta przełącza **całą apkę** na wyświetlanie w fiacie.

### Następna sesja: dwa tematy, na które zbiegły się wszystkie osiem krytyk

Pole `questionNobodyAsked` (jedno na klienta, wymagane w schemacie) dało zaskakująco spójny wynik —
**dwa** pytania powtórzyły się po trzy razy każde:

1. **„Wysłałem DM i nie dotarł"** (Amethyst, Wisp, YakiHonne). DM to jedyna powierzchnia z **własną
   listą relayów** (NIP-17, kind 10050), własnym szyfrowaniem i własnymi błędami — a cały bank mówi
   o DM-ach tylko „gdzie jest zakładka". Konkrety już namierzone: Amethyst ma string
   `recipient_missing_dm_relays`, YakiHonne baner „Private messages relays are not configured!" plus
   trzy zakładki (Followings / Known / Unknown — pierwsza wiadomość obcego ląduje niewidoczna),
   Wisp nie ma **żadnego** przycisku „nowa rozmowa" (start tylko z profilu).
2. **„Skasowałem notatkę, a ona dalej jest"** (Damus, Nostur, Primal). Na Nostrze delete to **prośba**
   (kind 5), nie polecenie — Nostur mówi to wprost w tytule dialogu („It's up to relays and other apps
   to honor your request"), Primal nazywa to „Request Delete", a **Damus nie ma kasowania w ogóle**
   i bank tego nie mówi. Idealny materiał na wpis z `howNostrWorks`.

Poza tym dwa mocne singletony: **Coracle** — „Send stoi na »Signing your note...« w nieskończoność"
(przy wyłącznie delegowanym podpisywaniu to najczęstsza awaria, a apka nie ma ani timeoutu, ani
komunikatu); **Snort** — „jak ustawić własny profil, żeby ktoś mógł mnie zapnąć" (bez pola Lightning
Address w profilu przycisk zapa **nie renderuje się** u odbiorcy, a bank uczy tylko wysyłania).

Sugerowany kształt: temat kanoniczny `delete-note` (kompilator znów wypisze robotę) + rozbudowa `dms`
z osobnym objawem `trouble-dm-not-delivered`. Proces bez zmian — recon → treść → klik-po-kliku →
rewizja → **critic** — bo w tej rundzie zadziałał.

## Runda 3 (2026-08-11/12): `searchAliases` i linkowalne odpowiedzi

Dwie zmiany wymuszone przez promocję, obie z twardym pomiarem pod spodem.

**Wyszukiwarka mówiła naszym słownictwem, nie słownictwem pytającego.** `score()`
dopasowuje wyłącznie słowa, które wpis już zawiera, więc bank odpowiadał tym, którzy
znają termin, a nowicjuszom nie odpowiadał wcale. Zmierzone na realnych danych przed
zmianą: **„lost my phone", „reset my password", „tip someone", „send someone money",
„where is the like button", „block someone" i „how do people find me" dawały po ZERO
trafień** — w banku, który odpowiada na wszystkie siedem.

`searchAliases` (kontrakt w [`src/data/faq/README.md`](../src/data/faq/README.md))
to dodatkowe frazy: przeszukiwane, nigdy renderowane, trafienie liczone jak
trafienie w tytuł. Dwie zasady, obie wymuszone doborem danych, nie kodem:
nie aliasuj frazy, którą inny wpis ma jako TYTUŁ (wpis z demem nie może porwać
pytania objawowego), i alias to co użytkownik wpisuje, nie teza odpowiedzi.

Pokryte dziś: `damus/{backup-keys,shaka,copy-npub,zap}`, `amethyst/{manage-relays,
backup-keys,zap}`, `wisp/post-note`, `coracle/mute`, `nostur/low-data`, `primal/zap`.
Weryfikacja przy każdej rundzie: wszystkie frazy na #1, strażnicy objawowi trzymają
swoje tytuły, 230 tytułów w 8 klientach bez przesunięć.

**Odpowiedzi nie dało się zalinkować** — panel był stanem komponentu, więc
odpowiedź w cudzym wątku brzmiała „wejdź, kliknij znak zapytania, wyszukaj". Dziś
`/c/<klient>?faq=<id>` ląduje na konkretnej odpowiedzi, `?tour=1` odpala przewodnik,
a pasek adresu synchronizuje rozwinięty wpis, więc każdy link kopiuje się sam.
Szczegół implementacyjny wart pamięci: rozwinięty wpis mieszka w osobnym stanie niż
`initialEntryId` — wpuszczenie go z powrotem jako „wyląduj tutaj" restartowało efekt
otwarcia panelu i kasowało wpisane zapytanie pod rękami czytelnika.

Po co to całe zamieszanie: patrz [`OUTREACH.md`](OUTREACH.md) — bez linkowalnych
odpowiedzi kanał „odpowiadaj ludziom, którzy właśnie pytają" nie działa, a to on ma
lepszy zwrot niż nadawanie.

## Możliwy kierunek (decyzja produktowa, nie techniczna)

„How to change relays in Damus" to klasyczny long-tail search — ludzie to googlują i lądują na
przestarzałych postach. Statyczne, indeksowalne strony `/faq/<client>` z linkiem „try it in the
simulator" mogłyby być głównym kanałem pozyskania ruchu. Wymaga świadomego wyjątku od `Disallow: /c/`
w `robots.txt` i przypiętego canonicala — dziś oba celowo blokują indeksowanie tras klientów.
