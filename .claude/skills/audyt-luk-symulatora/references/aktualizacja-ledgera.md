# Aktualizacja ledgera — jak dopisać i zamknąć wiersz bez psucia formatu

Ledger jest snapshotem, na którym pracują dwie inne role (autor FAQ i kolejny fidelity pass). Każda
niespójność między wierszem a Rollupem i indeksem podważa cały plik, więc edycja to zawsze trzy miejsca:
wiersz → Rollup → `docs/GAPS.md`.

## Nowy wiersz

- ID = `<prefiks>-NN`, **dokładany na końcu numeracji, nigdy nie renumerujesz** — ID są cytowane
  w `docs/GAPS.md`, w innych ledgerach i w komentarzach commitów. Prefiksy: `dam` `ame` `pri` `yak`
  `sno` `wis` `cor` `nos` `key` `gos`.
- Kolumny w kolejności: `ID | Surface | § | Status | Gap | Evidence | FAQ impact | Effort`.
- **Język opisu bierzesz z pliku, do którego piszesz**: osiem z dziesięciu ledgerów jest **po polsku**,
  po angielsku są dwa — **`docs/gaps/wisp.md`** i **`docs/gaps/amethyst.md`** (ten drugi od przebudowy
  do v1.13.1; zamrożony `docs/gaps/amethyst-v1-12.md` został po polsku). Zweryfikowane 2026-08-14
  wierszami tabel. ID, statusy i cytaty są w tym samym formacie wszędzie, a **nagłówki tabel są polskie
  we wszystkich jedenastu plikach** („Surface (ścieżka w UI)", „Osiągalna komendą?") — angielski dotyczy
  wyłącznie kolumn opisowych. Zdanie zamykające wiersz idzie za językiem pliku: `**Zamknięte …**`
  w polskich (także w Wispie), `**Closed …**` w `amethyst.md`.
- `§` = nagłówek `##` ze screen-mapy, dosłownie: numer albo nazwa, zależnie od klienta — pełny podział
  w `metoda-audytu.md` §0.

## Zamknięcie wiersza

`docs/GAPS.md` mówi „skreśl wiersz", ale **w plikach obowiązuje inna, lepsza praktyka** (wdrożenia FAQ
2026-08-06 i tourów 2026-08-08) i to ją kopiuj:

1. status → `ok`,
2. kolumna *Gap* zaczyna się od `**Zamknięte YYYY-MM-DD (powód).** Poprzednio: <stary status>.`,
   a **pierwotny opis luki zostaje** za tym zdaniem,
3. `Evidence` zostawiasz — pokazuje, gdzie luka była,
4. `FAQ impact` dostaje prefiks `was-`: `blocks-showme` → `was-blocks-showme`, `breaks-showme` →
   `was-breaks-showme` (definicje: `docs/gaps/README.md` §FAQ impact). **Nie kasuj do `none`** — `none`
   znaczy „FAQ na tym nie cierpiało", a tu cierpiało i właśnie przestało: prefiks jest jedynym śladem,
   że wpis FAQ dla tej powierzchni może dziś obiecać więcej, niż obiecuje. `none` wpisujesz dopiero,
   gdy rewizja FAQ ten dług odbierze.

Dzięki temu wiersz dalej liczy się w Rollupie (w kolumnie `ok` — prefiks `was-` nie zmienia arytmetyki,
bo ta idzie z kolumny *Status*), a następny audytor widzi, że ta powierzchnia była sprawdzana, zamiast
zgłaszać ją drugi raz.

## Rollup i nagłówek

- Rollup ma sześć kolumn: `missing | dead | partial | unreachable | unanchored | ok`. Przelicz je
  po każdej edycji — to jedyne miejsce, z którego bierze się indeks.
- **Top 3 do zrobienia** aktualizuj razem ze statusami; poprzednie top-3 zostaw w kursywie/blockquote
  pod spodem z datą i powodem przetasowania (wzorce: `docs/gaps/wisp.md`, `docs/gaps/damus.md`).
- Nagłówek: `> Audited: YYYY-MM-DD · Registry status: ready|preview · Sim LOC: N`. `Registry status`
  bierz z `src/registry.tsx` (pole `status`), nie z pamięci.

## Indeks `docs/GAPS.md`

Kolumny: `Klient | Status | Luki | missing | dead | partial | unreachable | unanchored | ok | Kotwice | Mostek FAQ`.

- **`Luki` = suma pięciu statusów BEZ `ok`.** Po przeliczeniu 2026-08-11 zgadza się dla wszystkich
  dziesięciu klientów, a `Razem` (533) sumuje się z kolumn. Jeśli u Ciebie przestaje — to Twój wiersz.
- **Kolumna `Kotwice` ma od 2026-08-11 zapisaną metodologię** (akapit pod tabelą): liczba **różnych
  wartości `data-tour`, jakie mogą trafić do DOM**, czyli literały plus wartości rozwinięte z rodzin
  szablonowych, bez powtórzeń. Sam `grep 'data-tour="'` daje mniej — licz oba przypadki albo nie
  ruszaj kolumny.
- Popraw wiersz klienta **i** wiersz `Razem`.

## Proza pod tabelą — trzymaj ją w zgodzie

Do 2026-08-11 proza i tabela rozjeżdżały się (proza mówiła „586 luk" i „231 dead" przy tabeli
535/229, a wiersz Keychata nie sumował się do własnych statusów). Zostało to przeliczone od zera
z wierszy dziesięciu ledgerów i doprowadzone do zgodności — **nie szukaj już tego rozjazdu, on jest
zamknięty**.

Cytując stan luk, cytuj **tabelę i Rollupy** — one są liczone, proza jest pisana. Zmieniając wiersz,
popraw w jednym ruchu: Rollup w pliku klienta → wiersz w tabeli → `Razem` → każde zdanie prozy,
które podaje tę liczbę. Zostawienie prozy „na potem" jest dokładnie tym, co wyprodukowało poprzedni
rozjazd.
