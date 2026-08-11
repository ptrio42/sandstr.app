# Rewizja FAQ — dwa przebiegi

Uruchamiaj je **po kolei i osobno**. Przebieg 1 pyta „czy to prawda", przebieg 2 „czego brakuje".
Żaden nie znajdzie wyników drugiego: weryfikator strukturalnie nie zauważy tezy, której nie dostał.
Zmierzone na rundzie 2 FAQ: 55 znalezisk rewizji, a potem — **na już poprawionym tekście** — 77 luk
krytyka kompletności, w tym 44 „must-add".

---

## Przebieg 1 — rewizja adwersaryjna

**Zadanie agenta: obalić każde twierdzenie.** Nie „ocenić jakość", nie „zaproponować ulepszenia".
Materiał wejściowy: `src/data/faq/<client>.ts`, `docs/refs/<client>/screen-map.md`, upstream repo
(z `docs/FIDELITY.md`), `docs/gaps/<client>.md` i **żywy symulator** pod `/c/<client>`.

### Pytania do KAŻDEGO wpisu

1. Czy każdy krok `answer` da się wskazać w `screen-map.md` albo w upstreamie? Cytat `plik:symbol`
   — brak cytatu = znalezisko, nie „prawdopodobnie ok".
2. Czy nazwy w krokach to **dosłowne** etykiety realnej apki (menu, przyciski, sekcje Settings)?
3. Czy `note` nie przemyca twierdzenia, którego nikt nie zweryfikował?
4. Czy `howNostrWorks` jest prawdziwe o **Nostrze ogólnie**? Fakt o kliencie w tym polu = bug.
5. Czy fakt nie jest **odwrócony**? Ta klasa zdarza się przy pisaniu z pamięci: w Wispie tap otwiera
   paletę emoji, a przytrzymanie wysyła reakcję (napisane odwrotnie), ikona zapa to ₿, nie błyskawica.
6. Czy `searchAliases` nie przejmuje frazy, którą inny wpis ma jako `question`? Alias trafia w tier 4
   `score()` — tak samo jak tytuł (`src/host/FaqPanel.tsx`).

### Pytania do KAŻDEGO kroku `showMe` (tu siedzi większość bugów)

7. **Podpis vs ekran.** Czy `content` jest prawdziwy o tym, co spotlight faktycznie ramuje w simie?
   To ~70% wszystkich potwierdzonych znalezisk — sprawdzaj to jako pierwsze i zawsze na żywo.
8. **Czy komenda kroku nie odmontowuje własnego celu?** W większości simów renderuje się tylko górna
   warstwa: `openSettings` z payloadem podekranu usuwa kotwicę korzenia Settings.
9. **Selektor z wieloma trafieniami.** `querySelector` bierze pierwszy w kolejności **dokumentu**,
   nie w kolejności listy przecinkowej. Jeśli opisujesz element, który jest tylko na niektórych
   kartach (blok mediów, pigułka Follow) — zakotwicz ten element, nie „pierwszy post".
10. **Kotwica na powierzchni, którą opisuje** — spotlight przycina się do prostokąta celu, więc
    podpis o „arkuszu" przypięty do jego przycisku Send zostawia resztę pod scrimem.
11. **Kotwica w tej gałęzi, którą montuje komenda.** Ekran z listą i widokiem szczegółu ma dwa
    korzenie; kotwica DM-ów Wispa siedziała w gałęzi rozmowy, do której nie dojeżdża żadna komenda.
12. **Stan ustawiony komendą przeżywa demo** (wymuszona zakładka, przełączony tryb) i psuje kolejne.
13. **Nieświeży `currentUser`.** Stan ustawiony przez wyniesione logowanie nie jest widoczny w tym
    samym przebiegu efektu — gałąź „otwórz cudzy profil" musi użyć wartości, którą właśnie zalogowała.
    Snort pokazywał własny profil w demie „jak kogoś obserwować".
14. **Mock nie łączy się sam.** Dwa moduły mocków generujące id nigdy się nie zejdą — „znajdź wątek
    tej notatki" zwraca null i demo ramuje pustą skorupę. Sprawdź, że komenda ląduje na DANYCH.
15. Czy krok kończy się na podświetlonym ekranie/wierszu, a nie na „a teraz kliknij" w martwą kontrolkę?

### Wymagane pola wyjścia agenta

Lekcję egzekwuje **schemat wyjścia, nie proza w prompcie** — pola wymaganego nie da się pominąć,
prozę można przeczytać i zignorować.

| Pole | Po co |
|---|---|
| `entryId` + `stepIndex` | adresowalność poprawki |
| `claim` | zacytowane zdanie, które jest kwestionowane |
| `verifiedOnScreen` | **wymagane** — co użytkownik DOSŁOWNIE widzi w zakotwiczonym elemencie; to pole samo w sobie ucięło klasę „podpis vs ekran" u kolejnych klientów |
| `evidence` | `plik:linia` w simie albo sekcja screen-mapy / symbol upstreamu |
| `verdict` | `confirmed` / `refuted` — agent ma prawo obalić własne znalezisko |
| `fix` | najmniejsza poprawka: przepisz podpis, przenieś kotwicę, albo **usuń `showMe`** |

---

## Przebieg 2 — completeness critic

**Powiedz krytykowi wprost, że rewizja adwersaryjna już przeszła i jej znaleziska są naprawione** —
inaczej znów sprawdza prawdziwość zamiast szukać nieobecności.

**Jedyne pytanie: czego tu NIE MA?** Nie wolno mu zgłaszać stylu, kolejności ani „można by dodać demo".

### Pytania

1. Czy pytanie jest **kompletne**, czy odpowiada tylko na jeden jego rodzaj? (mute: ludzie / słowa /
   hashtagi / wątki / spamerzy / blokowane relaye — wylicz, które klient ma, a których nie).
2. Czy objaw `trouble-*` ma **wszystkie** przyczyny, czy jedną z trzech?
3. Czy któryś temat kanoniczny ma odpowiedź formalnie poprawną, ale bezużyteczną dla kogoś, kto
   właśnie w to wdepnął?
4. Czy `n/a` jest zweryfikowane, czy domniemane z ciszy screen-mapy?
5. Czego użytkownik nie wie, że powinien zapytać — a odkryje boleśnie? (Damus: „Delete Account" nie
   kasuje konta; Primal: zmiana konta w rozszerzeniu nie zmienia konta w apce; Snort: Anuluj na
   pytaniu o PIN robi sesję read-only na całą wizytę).

### Wymagane pola wyjścia

| Pole | Po co |
|---|---|
| `gap` | czego brakuje, jednym zdaniem |
| `whoHitsIt` | **nazwij użytkownika, którego to zostawia bez odpowiedzi** — zabija hipotetyki |
| `evidence` | plik + symbol upstreamu albo sekcja screen-mapy; bez tego luka nie jest zgłaszana |
| `kindsMissing` | wyliczenie rodzajów tematu / przyczyn objawu, których brakuje |
| `severity` | `must-add` / `nice` (patrz klasyfikacja) |
| `questionNobodyAsked` | **jedno na klienta, wymagane** — najcenniejsze pole: to ono wskazuje NASTĘPNY temat kanoniczny. W rundzie 2 osiem niezależnych krytyk zbiegło się na dwóch pytaniach po trzy głosy każde („wysłałem DM i nie dotarł", „skasowałem notatkę, a ona dalej jest"). Zbieżność JEST sygnałem. |

---

## Klasyfikacja znaleziska

- **must-add** — bez tego odpowiedź jest fałszywa albo zostawia realnego użytkownika w martwym
  punkcie: brakujący rodzaj tematu, brakująca przyczyna objawu, nieodwracalny skutek uboczny
  (utrata klucza, odłączony portfel, sesja read-only), albo demo sprzeczne z ekranem.
- **nice** — poprawia trafność, ale wpis bez tego nie kłamie: dodatkowy alias, doprecyzowanie `note`,
  drugi wariant ścieżki.
- **odrzucone** — brak `evidence`, dotyczy stylu, albo proponuje `showMe` przez bramkę ledgera
  (`missing`/`dead`/`unreachable`). Zapisz powód odrzucenia — inaczej wróci w następnej rundzie.

## Po rewizji

- **Skrypty do edycji zbiorczych mają raportować, nie przerywać.** `assert`-i-umrzyj zostawia stan
  częściowy wyglądający jak sukces. Wzorzec: pętla po poprawkach, `if old in s` → zamień i licz,
  `else` → wypisz `MISS`, na końcu `applied N of M`.
- **Kotwice wstawiane skryptem weryfikuj sztuka po sztuce** — „pierwszy `<div>` po deklaracji
  komponentu" trafił w gałąź rozmowy zamiast listy, a w diffie wygląda identycznie.
- **Wpisz znaleziska wprost do promptu reconu następnego klienta.** Efekt jest mierzalny: Coracle nie
  miał ani jednego znaleziska klas „nieświeży `currentUser`" i „kotwica w złej gałęzi".
- Aliasy weryfikuj rankingiem, nie na oko: lista fraz-bólu ma trafiać swój wpis na #1, a wszystkie
  dotychczasowe `question` mają nadal znajdować same siebie (tak zmierzono 18 fraz na 114 tytułach).
