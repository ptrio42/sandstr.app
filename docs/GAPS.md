# Sandstr — GAPS (indeks luk w symulatorach)

> **Co to jest.** `docs/refs/<client>/screen-map.md` mówi, jak wygląda **realny** klient.
> `docs/gaps/<client>.md` mówi, **ile z tego naprawdę jest u nas** — per ekran, per kontrolka, z cytatem
> `plik:linia`. Ten plik to indeks nad tamtymi dziesięcioma: liczby, wnioski przekrojowe i kolejność prac.
> Schemat i słownik statusów: [`gaps/README.md`](gaps/README.md).
>
> **Dwóch odbiorców:** autor FAQ (`src/data/faq/<client>.ts`) — zanim napiszesz `showMe`, sprawdź, czy
> powierzchnia istnieje, ma kotwicę i jest osiągalna komendą; oraz kolejny fidelity pass — to jest
> backlog „co dobudować, żeby symulator był kompletny".
>
> Audyt: 2026-08-05, 10 audytorów + 10 weryfikatorów kwestionujących każdy wpis `missing`/`dead`/`partial`.
> **Aktualizacja 2026-08-06:** wdrożenie FAQ zamknęło 15 luk w Damusie/Amethyście/Primalu/Nosturze
> (mostki, kotwice, payloady komend) — wiersze oznaczone w ledgerach, liczby w tabeli odświeżone.
> **Aktualizacja 2026-08-07:** przywrócenie `npm run typecheck` zamknęło `gos-01` (P0, crash kładący
> hosta), `gos-05` i `gos-09` — wszystkie trzy były błędami typów, które martwy typecheck przemilczał.

## Stan na 2026-08-06 (korekty 2026-08-08 i 2026-08-11)

> **Korekta 2026-08-08 — punktowa, nie ponowny audyt.** Fala 2 prac nad tourami zamknęła `key-35`
> (kroki 5-6 toura Keychata nie docierały do pokoju rozmowy) i częściowo `dam-39` / `yak-32`.
>
> **Przeliczenie 2026-08-11 — same liczby, żaden wiersz nie zmienił treści.** Tabela przeczyła sobie
> w trzech miejscach: `Razem` (535) nie sumowało się z kolumn (534), wiersz Keychata (39) nie sumował
> się do własnych statusów (38), a proza niżej mówiła „586 luk" i „231 dead". Wszystkie kolumny
> policzono od zera z wierszy dziesięciu ledgerów (Rollup YakiHonne'a miał `unreachable` 5 zamiast
> realnych 4 — poprawiony). Kolumnę `Kotwice`, zostawioną 2026-08-08 bez metodologii, też przeliczono
> — metodologia jest teraz zapisana pod tabelą.

> **Re-audyt 2026-08-13 + domknięcie backlogu 2026-08-13/14 — tylko Amethyst.** Symulator został
> przebudowany z v1.12.6 do v1.13.1, jego ledger policzono od zera (7 audytorów + adwersaryjna
> weryfikacja każdego wiersza innego niż `ok`) na **139 wierszy = 95 luk + 44 `ok`**, a potem
> sesja domykająca zeszła do **18 luk + 121 `ok`** (77 zamknięć; dwa dalsze wiersze — ame-78,
> ame-86 — okazały się nieaktualne, nie otwarte). Kotwice 26 → 74 → **158**. `unreachable`
> i `unanchored` spadły do zera. Wiersz `Razem` przeliczono deltą na tym jednym kliencie;
> pozostałe dziewięć kolumn niesie wartości z przeliczenia 2026-08-11. Liczby Amethysta
> policzone skryptem po kolumnie *Status* jego ledgera i po `data-tour` w źródle, nie ręcznie.
> Wiersz `Razem` sprawdzony drugą metodą: zsumowany po kolumnach z dziesięciu wierszy tabeli,
> zgadza się z przeliczeniem deltą.
>
> **Amethyst ma teraz ~2,5× więcej wierszy niż inni klienci nie dlatego, że jest
> gorszy — jego szuflada urosła z 11 do 49 pozycji i doszły dwa pełne ekrany.** Porównuj
> proporcje, nie liczby bezwzględne; metodologia zwijania rodzin jest opisana w jego ledgerze.
> Zamrożony ledger `gaps/amethyst-v1-12.md` **nie wchodzi** do tej tabeli.

| Klient | Status | Luki | `missing` | `dead` | `partial` | `unreachable` | `unanchored` | `ok` | Kotwice | Mostek FAQ |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|:--:|
| [Damus](gaps/damus.md) | ready | 51 | 10 | 23 | 10 | 2 | 6 | 8 | 28 | ✅ |
| [Amethyst](gaps/amethyst.md) | ready | 18 | 6 | 4 | 8 | 0 | 0 | 121 | 158 | ✅ |
| [Primal](gaps/primal.md) | ready | 50 | 17 | 17 | 12 | 1 | 3 | 14 | 18 | ✅ |
| [YakiHonne](gaps/yakihonne.md) | ready | 76 | 27 | 30 | 13 | 4 | 2 | 20 | 27 | ✅ |
| [Snort](gaps/snort.md) | ready | 48 | 11 | 22 | 4 | 6 | 5 | 15 | 23 | ✅ |
| [Wisp](gaps/wisp.md) | ready | 75 | 26 | 32 | 12 | 4 | 1 | 15 | 25 | ✅ |
| [Coracle](gaps/coracle.md) | ready | 64 | 29 | 17 | 10 | 4 | 4 | 14 | 13 | ✅ |
| [Nostur](gaps/nostur.md) | ready | 51 | 1 | 33 | 8 | 6 | 3 | 12 | 41 | ✅ |
| [Keychat](gaps/keychat.md) | preview | 38 | 6 | 18 | 8 | 3 | 3 | 5 | 19 | ❌ |
| [Gossip](gaps/gossip.md) | preview | 35 | 9 | 11 | 6 | 5 | 4 | 2 | 0 | ❌ brak wrappera |
| **Razem** | | **506** | **142** | **207** | **91** | **35** | **31** | **226** | **352** | **8/10** |

**Metodologia kolumny `Kotwice`:** liczba **różnych wartości `data-tour`, jakie mogą trafić do DOM**
danego klienta — każdy literał `data-tour="…"` plus każda wartość, jaką potrafi wyprodukować
wyrażenie (szablon ``data-tour={`x-${id}`}`` rozwinięty po swojej tablicy źródłowej; warunek
`data-tour={cond ? 'x' : undefined}` liczony jako jedna) — bez powtórzeń.

Dlatego sam `grep 'data-tour="'` daje mniej: Coracle ma 7 literałów, ale rodzina
`coracle-nav-${item.screen}` (`CoracleSimulator.tsx:609`) dokłada 6 pozycji z `NAV` (`:99-106`) → 13;
Nostur ma 29 literałów + `nostur-tab-*` ×5 (`components/BottomBar.tsx:49` po `TABS` `:16-22`) +
`nostur-drawer-*` ×7 (`components/Sidebar.tsx:90` po `ROWS` `:26-33`) → 41. Kotwica policzona tu
**nie** znaczy „da się ją podświetlić zawsze": część jest duplikatami albo montuje się warunkowo —
patrz sekcja *Anchors* w każdym ledgerze.

Liczby `preview` (Keychat, Gossip) są **niższe, bo nie ma dla nich screen-mapy** — audytor mógł zgłosić
tylko to, co da się oprzeć o `FIDELITY.md` albo o wprost martwy kod. Reszta poszła do „do recon" w ich
ledgerach. Nie czytaj tego jako „Gossip jest bliżej ideału niż Wisp".

## Cztery wnioski przekrojowe

### 1. Mostek FAQ — 8/10 zrobione, reszta to wciąż gate przed wszystkim innym

`FaqMiniTourLauncher` jest podpięty w **ośmiu** wrapperach (damus, amethyst, primal, nostur, yakihonne,
snort, wisp, coracle — `ame-01` · `pri-64` · `nos-01` · `yak-96` · `sno-63` · `wis-90` · `cor-01`
zamknięte 2026-08-06). W pozostałych dwóch `SHOW_FAQ_EVENT` leci w próżnię — **żaden `showMe` nie
zadziała, niezależnie od kotwic i komend**.

| | Co trzeba | Effort |
|---|---|---|
| keychat | doszyć launcher + `faqCommandsRef` + gałąź `isFaqStepId` do istniejącego wrappera, wpisać klienta do `src/data/faq/index.ts` | **S** ×1 |
| gossip | **nie ma wrappera w ogóle** — trzeba go najpierw zbudować (`*SimulatorWithTour` + `TourWrapper`); `gos-01` już naprawione (2026-08-07) | **M** ×1 |

Wiersze: `key-42` · `gos-29`. **Oba czekają na nowe nagrania** (decyzja właściciela 2026-08-06):
bez recon nie ma czym mierzyć ani screen-mapy, więc FAQ dla nich powstanie po odświeżeniu referencji.
Wzorzec dla Coracle (klient BEZ wrappera) jest już zrobiony — patrz `CoracleSimulatorWithTour.tsx`:
wrapper może nie nieść żadnego touru (pusty placeholder config, `hasTour: false`) i służyć wyłącznie FAQ.

**Wzorzec do skopiowania** (cztery przejścia, każde tak samo): launcher + `faqCommandsRef` +
gałąź `isFaqStepId` + **czyszczenie timerów kolejki** w `queueCommands`; do tego w symulatorze
komenda `logout` (żeby dało się pokazać onboarding), payload sekcji w `openSettings` i higiena
„każda nawigacja domyka drawer/sheet/wątek". Patrz `src/data/faq/README.md`.

### 2. Nawigacja żyje, liście są martwe

**229 z 533 luk to `dead`** — kontrolka renderuje się wiernie i nie robi nic. Wzorzec powtarza się
u wszystkich dziesięciu: górny poziom (zakładki, ekrany, drawery) jest zbudowany i osiągalny komendą,
a wszystko o jedno kliknięcie niżej to ślepy zaułek. Najgęstsze skupisko to **Settings**: Primal 11
martwych wierszy, Snort 12 z 13, Nostur 12, Keychat 6, a w Wispie cały podzbiór siedzi za drawerem,
którego żadna komenda nie otwiera.

**Konsekwencja dla FAQ:** `dead` jest gorsze niż `missing`. Brakującego ekranu po prostu nie obiecasz —
ale działająco wyglądający przycisk, który podświetlasz spotlightem i który nic nie robi, to wprost
zaproszenie do kliknięcia w pustkę. Stąd reguła z sekcji „Zasady dla autora FAQ" niżej.

### 3. W całym `src/` nie ma ani jednego `ErrorBoundary` — wyjątek z symulatora kładzie hosta

Udowodnione na `gos-01`: `ThreadScreen.tsx:96` wołał `.map` na `note.replies`, które
w [`types.ts:70`](../src/data/mock/types.ts:70) jest **liczbą**. Klik w dowolną notatkę w Gossipie
wyrzucał `TypeError`, a ponieważ nie ma żadnej granicy błędu, React odmontowywał **całe** drzewo —
razem z topbarem, switcherem i **banerem disclaimera**, który wg CLAUDE.md musi zostać na każdym
widoku klienta.

**`gos-01` naprawione 2026-08-07** (przy przywracaniu `npm run typecheck` — działający typecheck
złapałby go od razu; był jedną z 40 diagnostyk wyciszonych przez błąd składniowy w `useSimulator.ts`).
**Sama teza tej sekcji zostaje otwarta:** w `src/` nadal nie ma ani jednego `ErrorBoundary`, więc
następny wyjątek w dowolnym symulatorze zrobi dokładnie to samo. `ErrorBoundary` wokół `ClientView`
to wciąż rekomendacja bez wiersza w żadnym ledgerze.

### 4. Kotwice rozłożone skrajnie nierówno

Od **41** (Nostur) i 28 (Damus) do **13** (Coracle, 15 powierzchni) i **0** (Gossip).
Kotwica to jeden atrybut — najtańsza rzecz w całym backlogu — a jej brak jest twardym blokerem dla
`showMe`. Osobno: `unanchored` (32) i `unreachable` (37) to **69 luk, w których symulator jest już
wierny** i brakuje wyłącznie haczyka albo komendy. To najlepszy stosunek zysku do wysiłku w tym pliku.

## Kolejność prac

**P0 — odblokowuje wszystko inne, prawie wszystko `S`**
1. ~~`gos-01` — crash kładący hosta~~ — naprawione 2026-08-07 (razem z `gos-05` i `gos-09`, wszystkie
   trzy były błędami typów). **`ErrorBoundary` wokół `ClientView` nadal otwarte.**
2. ~~Mostek FAQ ×7~~ — zrobione dla 8/10; zostały Keychat i Gossip, oba czekają na nowe nagrania.
3. ~~Wrapper dla Coracle~~ — zrobiony 2026-08-06. Zostaje Gossip.

**P1 — tanie odblokowania `showMe` (`unanchored` + `unreachable`, 69 luk)**
Kotwice tam, gdzie powierzchnia jest wierna i działa, oraz brakujące payloady komend. Najgęstsze
skupiska po przeliczeniu 2026-08-11: **Snort 11** (`sno-38` wyniki wyszukiwania, `sno-39` compose
w trybie reply, `sno-45`/`sno-46`/`sno-52`/`sno-53` bez kotwic), **Nostur 9** i **Gossip 9**
(`gos-30` — zero kotwic w całym kliencie), **Coracle 8** (`cor-55` nagłówek profilu, `cor-57` taby
Notifications, `cor-21` wiersz kontrolek feedu), **Damus 8** (`dam-34` wątek i `dam-35` Bookmarks bez
komendy, `dam-45`…`dam-50` bez kotwic), **Keychat 6** (`key-05` — brak `logout`, więc onboarding jest
nie do odzyskania po pierwszym logowaniu).

*Poprzednia lista przykładów w tym akapicie (`pri-02`, `yak-17`, `yak-77`, `wis-71`, `nos-38`,
`wis-75`, `cor-23`, `ame-30`, `yak-01`) była nieaktualna — wszystkie dziewięć wierszy ma dziś
status `ok`.*

**P2 — martwe liście, po kolei wg tego, o co FAQ realnie pyta**
Settings (Primal, Snort, Nostur, Keychat), menu „…" w Snorcie (`sno-12` — jedyna droga do share,
bookmark, mute i copy-ID), wątki (`gos-02`; `sno-37` zamknięte 2026-08-06).

**P3 — recon dla `preview`**
Keychat i Gossip nie mają screen-mapy, więc ich ledgery są niepełne z definicji. Sekcja
„Poza zakresem / do recon" w obu plikach to gotowa lista zakupów na następny recon.

## Zasady dla autora FAQ

1. **Odpowiedź tekstowa opisuje realną apkę i wolno ją napisać zawsze** — ground truth to
   `docs/refs/<client>/screen-map.md`, nie nasz symulator. Luka nie jest powodem, żeby nie odpowiedzieć.
2. **`showMe` dodawaj tylko wtedy, gdy w ledgerze nie ma `missing` / `dead` / `unreachable`** na tej
   ścieżce. Sprawdź też sekcję *Anchors* — potrzebujesz istniejącego selektora, a nie wymyślonego.
3. **Kończ mini-tour na podświetlonym ekranie albo wierszu, nigdy na „a teraz to kliknij"** — przy 229
   martwych kontrolkach ostatni krok najczęściej prowadzi w pustkę.
4. **Maksymalnie 2 komendy na krok** — kolejka toura niezawodnie obsługuje tyle
   (`FaqShowMeStep.commands`). Powierzchnia wymagająca trzech przeskoków jest praktycznie nieosiągalna;
   ledgery oznaczają takie przypadki jako `unreachable` i mówią to wprost.
5. **Sprawdź sekcję *Reachability*** danego ledgera — jest tam unia komend i to, jaki ekran montuje
   każda z nich. Payload, którego nie ma w unii, po prostu nic nie zrobi (`yak-17`, `dam-35`).
6. Damus ma już 17 wpisów w [`../src/data/faq/damus.ts`](../src/data/faq/damus.ts) — ledger
   [`gaps/damus.md`](gaps/damus.md) wskazuje trzy z nich, które celują w martwe elementy
   (`dam-13` copy-npub, `dam-29` manage-relays). Trzeci, `dam-39` follow, **przestał być problemem
   `showMe` 2026-08-08**: kotwica zeszła z martwego „Edit", a krok toura otwiera cudzy profil i celuje
   w realną pigułkę Follow.

## Metoda i zaufanie

Każdy klient przeszedł dwie tury: audytor (screen-mapa sekcja po sekcji przeciw kodowi symulatora,
pięć przebiegów: surface walk, dead-control sweep, inwentarz kotwic, reachability, zapis pliku)
i **weryfikator**, którego zadaniem było obalić każdy wpis `missing`/`dead`/`partial` przez otwarcie
cytowanego pliku i szukanie handlerów na rodzicach, we wrapperach i w propsach. Weryfikatorzy sprawdzili
**454 wiersze**, poprawili 18, usunęli 1 obalony i dopisali 22 luki przeoczone przez audytorów.
Wiersze o braku mostka FAQ w czterech ledgerach (`pri-64`, `sno-63`, `wis-90`, `yak-96`) dopisano ręcznie
po audycie — te cztery przeoczyły go, mimo że grep pokazuje `FaqMiniTourLauncher` w jednym wrapperze.

**Czego ten audyt NIE robi:**
- **Czytanie kodu, nie runtime.** Wyjątkiem jest `gos-01`, potwierdzony realnym klikiem (białe `#root`).
  Klasa błędów widocznych dopiero w przeglądarce (błędy konsoli, złamany layout, timing) jest poza zakresem.
- **Nie ocenia wierności wizualnej** — od tego jest [`FIDELITY.md`](FIDELITY.md) i side-by-side.
  Tu jest wyłącznie brakująca **funkcja i ścieżka**.
- **Świadomie odtworzone bugi upstreamu nie są lukami** (Snort: kafelek Relays bez tła, Deck jako martwy
  kod; Wisp: wycieki M3 `#4A4458`; Coracle: login bez pola na klucz). Audytorzy dostali je jako wykluczenia.
- **Jeden ledger** — [Wisp](gaps/wisp.md) — ma opisy wierszy po **angielsku** (81 z 90 wierszy;
  9 domkniętych 2026-08-06 dostało polski prefiks „Zamknięte…"). Pozostałych dziewięć, w tym Keychat
  i YakiHonne, jest po polsku. Kosmetyka; ID, statusy i cytaty są w tym samym formacie wszędzie.

**Aktualizacja:** ledger jest snapshotem. Zamykając lukę, skreśl wiersz w `gaps/<client>.md`, popraw
Rollup i tabelę wyżej. Nie renumeruj ID — dokładaj na końcu.
