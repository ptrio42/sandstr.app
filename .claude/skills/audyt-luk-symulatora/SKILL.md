---
name: audyt-luk-symulatora
description: 'Audyt czego brakuje w symulatorze: martwe przyciski, nieosiągalne ekrany, brak kotwic, niepełne ekrany. Użyj gdy: „czego tu brakuje", „ten przycisk nic nie robi", „audyt luk", „zaktualizuj gaps", „co dobudować w <kliencie>", albo gdy piszesz do docs/gaps/ lub docs/GAPS.md. Także zanim dodasz showMe w src/data/faq/ — ledger mówi, czy powierzchnia w ogóle istnieje, ma kotwicę data-tour i jest osiągalna komendą toura.'
---

# Audyt luk symulatora (gap ledger)

## Przeczytaj najpierw

1. `docs/gaps/README.md` — **schemat i słownik statusów, autorytatywny**. Szablon pliku, kolumny
   `FAQ impact` i `Effort`, prefiksy ID (`dam` `ame` `pri` `yak` `sno` `wis` `cor` `nos` `key` `gos`).
2. `docs/GAPS.md` — indeks, wnioski przekrojowe i sekcja „Zasady dla autora FAQ".
3. `docs/gaps/<client>.md` — dotychczasowy ledger tego klienta (nie zaczynasz od zera).
4. `docs/refs/<client>/screen-map.md` — ground truth. Keychat i Gossip **nie mają screen-mapy**, więc
   ich ledgery są niepełne z definicji; nowe wiersze dla nich idą do „Poza zakresem / do recon".

## Co tu właściwie mierzysz

`docs/refs/<client>/screen-map.md` mówi, **jak wygląda i działa realny klient**.
`docs/gaps/<client>.md` mówi, **ile z tego mamy w `src/simulators/<client>/`**.
Różnica między tymi dwoma dokumentami = jeden wiersz w ledgerze. Nie wymyślasz braków „z głowy" —
brak istnieje tylko wtedy, gdy screen-mapa coś specyfikuje, a symulator tego nie robi.

## Statusy (pełne definicje w `docs/gaps/README.md`)

- `missing` — powierzchni/kontrolki nie ma w ogóle. *(wis-05: pigułki online/relay-count to statyczne `<div>`.)*
- `dead` — renderuje się wiernie, klik nic nie robi. *(wis-07: „Load more" woła tylko `registerAction`.)*
- `partial` — jest, ale materialnie uproszczona. *(wis-02: filtr treści przełącza ikonę, listy nie filtruje.)*
- `unreachable` — istnieje, ale żadna komenda toura nie ustawia sim w ten stan. *(wis-76: arkusz loginu to lokalny state, tylko klik.)*
- `unanchored` — wierne i działające, ale brak `data-tour`. *(wis-66: Settings → Interface.)*
- `ok` — wierne, interaktywne, zakotwiczone, osiągalne. Notuj tylko sprawdzone sekcje.

Gdy pasuje kilka — zapisz najcięższy wg kolejności `missing > dead > partial > unreachable > unanchored > ok`,
resztę wspomnij w kolumnie *Gap*. Bez tej kolejności dwa audyty tego samego ekranu dają różne liczby.

## Twarde reguły

- **Każdy wiersz cytuje `plik:linia`** (ścieżka względem `src/simulators/<client>/`) albo sekcję
  screen-mapy. Wiersz bez cytatu jest nieweryfikowalny i nie wchodzi do pliku.
- **Zanim zgłosisz `dead`/`missing`/`partial`, spróbuj to obalić** — otwórz cytowany plik i poszukaj
  handlera u rodzica, we wrapperze i w propsach. W audycie 2026-08-05 weryfikatorzy poprawili tak 18
  wierszy i jeden usunęli; wiersz obalony po fakcie kosztuje autora FAQ zaufanie do całego pliku.
- **Klikaj, nie tylko czytaj.** Audyt 2026-08-05 był czytaniem kodu i sam wpisuje to jako swoją słabość
  („Czego ten audyt NIE robi"). `dead` i `unreachable` potwierdzaj w podglądzie: `preview_start` z configu
  **`sandstr`** (port 5173) albo `sandstr-preview` (4173), gdy dev jest zajęty przez inną sesję.
  Nie mierz geometrii, gdy panel Browser jest schowany — najpierw screenshot, potem pomiar.
- **`unanchored` i `unreachable` są tak samo ważne jak `missing`.** Ledger jest bramką dla `showMe`
  w FAQ (`FaqShowMeStep`, `src/data/faq/types.ts:11-26`): autor wolno dopisze mini-tour tylko tam, gdzie
  nie ma `missing`/`dead`/`unreachable` i istnieje kotwica. Brak jednego atrybutu blokuje demo tak samo
  skutecznie jak brak ekranu.
- **Nie zgłaszasz wierności wizualnej** (od tego jest `docs/FIDELITY.md`), **ani świadomie odtworzonych
  bugów upstreamu** (Snort: kafelek Relays bez tła; Wisp: wycieki M3 `#4A4458`; Coracle: login bez pola
  na klucz). Ledger notuje brakującą **funkcję i ścieżkę**, nie odcień guzika.
- **`nostr-kitten` nie ma ledgera** — `kind: 'original'` (`src/registry.tsx:280`), brak realnego pierwowzoru,
  nie ma wobec czego mierzyć. Tak samo poza zakresem: stub `src/simulators/primal/mobile/` — nieroutowany.

## Metoda

Pięć przebiegów (surface walk → dead-control sweep → inwentarz kotwic → reachability → zapis) plus runda
obalania. **Przeczytaj `references/metoda-audytu.md`** — są tam gotowe polecenia grep i wzorce, po których
poznajesz martwą kontrolkę i nieosiągalny stan, plus dwa klienty o nietypowym układzie plików (Primal,
Gossip) i powód, dla którego `grep 'data-tour="'` gubi 21 kotwic w ośmiu klientach z dziesięciu.

## Zapis wyniku

**Przeczytaj `references/aktualizacja-ledgera.md`, zanim dopiszesz cokolwiek do istniejącego pliku** —
jak dokładać ID bez renumeracji, jak zamykać wiersz (praktyka w plikach różni się od instrukcji w
`docs/GAPS.md`), jak przeliczyć Rollup i którego wiersza w indeksie `docs/GAPS.md` **nie ruszać**.
