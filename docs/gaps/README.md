# Sandstr — Gap Ledger (czego brakuje w symulatorach)

**Po co to jest.** `docs/refs/<client>/screen-map.md` mówi, jak wygląda **realny** klient.
Ten katalog mówi, **ile z tego naprawdę jest w symulatorze** — per ekran, per kontrolka.
Dwa odbiorcy:

1. **Autor FAQ** (`src/data/faq/<client>.ts`) — zanim napiszesz `showMe`, sprawdź w ledgerze, czy
   powierzchnia w ogóle istnieje, czy ma kotwicę `data-tour` i czy da się do niej dojechać komendą
   toura. Odpowiedź tekstowa opisuje **realną apkę** i wolno ją napisać zawsze; `showMe` wolno dodać
   **tylko** dla wpisów, które nie są `missing`/`dead`/`unreachable`.
2. **Kolejny fidelity pass** — priorytetyzowany backlog „co dobudować, żeby symulator był kompletny".

**Zasada:** ledger nie zgaduje. Każdy wpis cytuje albo sekcję `screen-map.md` (czym to jest w realnej
apce), albo `plik:linia` w `src/simulators/<client>/` (co jest — lub czego nie ma — u nas).

## Konwencja

```
docs/gaps/
  README.md      # ten plik — schemat i słownik statusów
  <client>.md    # ledger jednego klienta (szablon niżej)
```

Indeks zbiorczy + ranking priorytetów: [`../GAPS.md`](../GAPS.md).

## Słownik statusów

Jeden wiersz = jedna kontrolka / ekran / zachowanie realnej apki. Status opisuje **stan w symulatorze**:

| Status | Znaczenie | Co blokuje |
|---|---|---|
| `missing` | Powierzchni/kontrolki nie ma w symulatorze w ogóle. | `showMe` niemożliwe; odpowiedź tekstowa OK. |
| `partial` | Jest, ale materialnie uproszczona — mniej wierszy/opcji/stanów niż w realnej apce. | `showMe` możliwe, ale może pokazać coś innego, niż mówi odpowiedź. |
| `dead` | Renderuje się, ale klik nic nie robi (`onClick` brak / no-op), a realna apka reaguje. | `showMe` da się podświetlić, ale użytkownik kliknie w pustkę — **najgorszy UX FAQ**. |
| `unanchored` | Wierne i działające, ale **brak `data-tour`** → nie ma czego wskazać spotlightem. | tylko `showMe`; fix = jeden atrybut. |
| `unreachable` | Istnieje, ale **żadna komenda toura** nie ustawia symulatora w ten stan. | tylko `showMe`; fix = nowa komenda w `*SimulatorWithTour`. |
| `ok` | Wierne, interaktywne, zakotwiczone i osiągalne. Notujemy tylko wtedy, gdy sekcja screen-mapy była sprawdzana i wyszła czysto. | nic |

**Kolejność, gdy pasuje kilka:** `missing` > `dead` > `partial` > `unreachable` > `unanchored` > `ok`.
Zapisz najcięższy, resztę wspomnij w kolumnie *Gap*.

### FAQ impact

| Wartość | Znaczenie |
|---|---|
| `blocks-showme` | Odpowiedź tekstowa się obroni, ale mini-tour nie. |
| `breaks-showme` | Istniejący/naturalny `showMe` podświetli martwy lub mylący element. |
| `blocks-answer` | Nie da się nawet uczciwie opisać kroków — brakuje całej ścieżki (rzadkie; zwykle znaczy, że screen-mapa też tego nie pokrywa). |
| `none` | FAQ na tym nie cierpi (czysta wierność wizualna). |
| `was-blocks-showme` | Wiersz **domknięty**: blokada zniknęła. Powierzchnia istnieje, działa, ma kotwicę — autor FAQ może dopisać `showMe`, którego wcześniej nie wolno mu było obiecać. |
| `was-breaks-showme` | Wiersz **domknięty**: `showMe` nie celuje już w martwy ani mylący element. Istniejący mini-tour można rozszerzyć albo doprowadzić do końca ścieżki, zamiast urywać go przed kliknięciem. |

**Prefiks `was-` = dług do odebrania po stronie FAQ.** Wstawiasz go przy zamykaniu wiersza (procedura:
`.claude/skills/audyt-luk-symulatora/references/aktualizacja-ledgera.md` §Zamknięcie wiersza): status
idzie na `ok`, a `blocks-showme`/`breaks-showme` dostaje prefiks zamiast być kasowane do `none`. `none`
skasowałoby jedyny ślad, że **wpis FAQ dla tej powierzchni może dziś obiecać więcej, niż obiecuje** —
a to jest lista robocza kolejnej rewizji FAQ, nie ozdobnik. Dwie reguły:

- **Prefiks nie zmienia arytmetyki.** Rollup i indeks liczą się z kolumny *Status*, a ta jest wtedy `ok`.
- **Zdejmujesz go dopiero wtedy, gdy FAQ ten dług odbierze** (`showMe` dopisany/rozszerzony) → `none`.
  `was-blocks-answer` nie występuje i nie zakładaj go z góry.

Stan na 2026-08-14: prefiksu używa wyłącznie Amethyst — [`amethyst.md`](amethyst.md) (31 `was-blocks-showme`
+ 47 `was-breaks-showme`, wszystkie 78 na wierszach `ok`) i [`amethyst-v1-12.md`](amethyst-v1-12.md) (1).
Pozostałe dziewięć ledgerów zna tylko cztery wartości bez prefiksu.

### Effort

`S` ≤ ~30 min (atrybut, handler, kilka wierszy listy) · `M` = nowy ekran/overlay w istniejącym wzorcu ·
`L` = nowy podsystem albo wymaga recon/screen-mapy, której nie ma.

## Szablon `<client>.md`

```markdown
# <Client> — gap ledger

> Ground truth: `docs/refs/<client>/screen-map.md` · Sim: `src/simulators/<client>/`
> Audited: YYYY-MM-DD · Registry status: ready|preview · Sim LOC: N

## Rollup

| missing | dead | partial | unreachable | unanchored | ok |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 |

**Top 3 do zrobienia:** <ID> · <ID> · <ID>

## Gaps

| ID | Surface (ścieżka w UI) | § | Status | Gap | Evidence | FAQ impact | Effort |
|---|---|---|---|---|---|---|---|
| dam-01 | Side menu → Mutelist | §5 | missing | Wiersz jest, ekranu nie ma — klik nie prowadzi nigdzie | `screens/SideMenu.tsx:88` | blocks-showme | M |

## Anchors — `data-tour` obecne w symulatorze

| Selector | Plik:linia | Powierzchnia |
|---|---|---|

## Reachability — komendy toura

**Union:** `type: 'login' | 'logout' | …` (`<Client>Simulator.tsx:NN`), payloady: …

| Powierzchnia | Osiągalna komendą? | Czym |
|---|---|---|

## Poza zakresem / do recon

Czego screen-mapa nie pokrywa, więc nie da się orzec luki (kandydaci na kolejny recon).
```

## ID

`<3-4-literowy prefiks klienta>-NN`, stabilne — nie renumeruj przy dopisywaniu, dokładaj na końcu.
Prefiksy: `dam` `ame` `pri` `yak` `sno` `wis` `cor` `nos` `key` `gos`.

## Czego tu NIE ma

- **`nostr-kitten`** — `kind: 'original'`, nie ma realnego pierwowzoru, więc nie ma wobec czego mierzyć luki.
- **Primal-mobile stub** — nieroutowany, poza produktem.
- **Wierność wizualna per-piksel** — od tego jest [`../FIDELITY.md`](../FIDELITY.md) i side-by-side.
  Tu notujemy tylko brakującą **funkcję/ścieżkę**, nie odcień guzika.
