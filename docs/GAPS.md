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

## Stan na 2026-08-06 (korekta 2026-08-08)

> **Korekta 2026-08-08 — punktowa, nie ponowny audyt.** Fala 2 prac nad tourami zamknęła `key-35`
> (kroki 5-6 toura Keychata nie docierały do pokoju rozmowy) i częściowo `dam-39` / `yak-32`.
> Zaktualizowany jest tylko wiersz Keychata i suma. **Kolumny `Kotwice` celowo NIE ruszałem**, mimo
> że praca dodała ~23 kotwice w siedmiu klientach: kolumna liczy coś innego niż literalne
> `data-tour="…"` (część kotwic to wyrażenia, np. `data-tour={i === 0 ? 'x' : undefined}`), a nie
> znam jej pierwotnej metodologii — wstawienie liczby policzonej inaczej byłoby gorsze niż zostawienie
> starej. Do przeliczenia przy najbliższym pełnym audycie.

| Klient | Status | Luki | `missing` | `dead` | `partial` | `unreachable` | `unanchored` | `ok` | Kotwice | Mostek FAQ |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|:--:|
| [Damus](gaps/damus.md) | ready | 51 | 10 | 23 | 10 | 2 | 6 | 8 | 23 | ✅ |
| [Amethyst](gaps/amethyst.md) | ready | 45 | 9 | 26 | 7 | 2 | 1 | 12 | 24 | ✅ |
| [Primal](gaps/primal.md) | ready | 50 | 17 | 17 | 12 | 1 | 3 | 14 | 17 | ✅ |
| [YakiHonne](gaps/yakihonne.md) | ready | 77 | 27 | 30 | 13 | 5 | 2 | 20 | 20 | ✅ |
| [Snort](gaps/snort.md) | ready | 48 | 11 | 22 | 4 | 6 | 5 | 15 | 16 | ✅ |
| [Wisp](gaps/wisp.md) | ready | 75 | 26 | 32 | 12 | 4 | 1 | 15 | 22 | ✅ |
| [Coracle](gaps/coracle.md) | ready | 64 | 29 | 17 | 10 | 4 | 4 | 14 | 12 | ✅ |
| [Nostur](gaps/nostur.md) | ready | 51 | 1 | 33 | 8 | 6 | 3 | 12 | 35 | ✅ |
| [Keychat](gaps/keychat.md) | preview | 39 | 6 | 18 | 8 | 3 | 3 | 5 | 14 | ❌ |
| [Gossip](gaps/gossip.md) | preview | 35 | 9 | 11 | 6 | 5 | 4 | 2 | 0 | ❌ brak wrappera |
| **Razem** | | **535** | **145** | **229** | **90** | **38** | **32** | **117** | **183** | **8/10** |

**Kotwice** = selektory `data-tour`, które da się wskazać spotlightem, łącznie z generowanymi
szablonowo — np. Coracle ma jeden literał i jedną rodzinę `coracle-nav-${screen}` dającą 6 pozycji
(`CoracleSimulator.tsx:535,812`), a Nostur 22 literały + rodziny `nostur-tab-*` i `nostur-drawer-*`.
Sam grep po `data-tour="` policzy mniej — patrz sekcja *Anchors* w każdym ledgerze.

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

**231 z 586 luk to `dead`** — kontrolka renderuje się wiernie i nie robi nic. Wzorzec powtarza się
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

Od **34** (Nostur) i 23 (Damus) do **7** (Coracle, 15 powierzchni na 4269 LOC) i **0** (Gossip).
Kotwica to jeden atrybut — najtańsza rzecz w całym backlogu — a jej brak jest twardym blokerem dla
`showMe`. Osobno: `unanchored` (49) i `unreachable` (62) to **111 luk, w których symulator jest już
wierny** i brakuje wyłącznie haczyka albo komendy. To najlepszy stosunek zysku do wysiłku w tym pliku.

## Kolejność prac

**P0 — odblokowuje wszystko inne, prawie wszystko `S`**
1. ~~`gos-01` — crash kładący hosta~~ — naprawione 2026-08-07 (razem z `gos-05` i `gos-09`, wszystkie
   trzy były błędami typów). **`ErrorBoundary` wokół `ClientView` nadal otwarte.**
2. ~~Mostek FAQ ×7~~ — zrobione dla 8/10; zostały Keychat i Gossip, oba czekają na nowe nagrania.
3. ~~Wrapper dla Coracle~~ — zrobiony 2026-08-06. Zostaje Gossip.

**P1 — tanie odblokowania `showMe` (`unanchored` + `unreachable`, 111 luk)**
Kotwice tam, gdzie powierzchnia jest wierna i działa, oraz brakujące payloady komend. Najgęstsze:
`pri-02` (8 z 9 wierszy nawigacji bez kotwicy), `yak-17` (3 z 5 zakładek bez payloadu),
`yak-77` / `wis-71` / `nos-38` (drawer nieosiągalny, a za nim całe Settings), `wis-75`
(`openSettings` zaszyte na `'interface'`), `cor-23` (wiersz akcji noty — najczęściej wskazywana
powierzchnia w jakimkolwiek FAQ), `ame-30`, `key-05` i `yak-01` (brak `logout`, więc onboarding
jest nie do odzyskania po pierwszym logowaniu).

**P2 — martwe liście, po kolei wg tego, o co FAQ realnie pyta**
Settings (Primal, Snort, Nostur, Keychat), menu „…" w Snorcie (`sno-12` — jedyna droga do share,
bookmark, mute i copy-ID), wątki (`sno-37` renderuje „This note could not be loaded", `gos-02`).

**P3 — recon dla `preview`**
Keychat i Gossip nie mają screen-mapy, więc ich ledgery są niepełne z definicji. Sekcja
„Poza zakresem / do recon" w obu plikach to gotowa lista zakupów na następny recon.

## Zasady dla autora FAQ

1. **Odpowiedź tekstowa opisuje realną apkę i wolno ją napisać zawsze** — ground truth to
   `docs/refs/<client>/screen-map.md`, nie nasz symulator. Luka nie jest powodem, żeby nie odpowiedzieć.
2. **`showMe` dodawaj tylko wtedy, gdy w ledgerze nie ma `missing` / `dead` / `unreachable`** na tej
   ścieżce. Sprawdź też sekcję *Anchors* — potrzebujesz istniejącego selektora, a nie wymyślonego.
3. **Kończ mini-tour na podświetlonym ekranie albo wierszu, nigdy na „a teraz to kliknij"** — przy 231
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
- **Dwa ledgery** — [Keychat](gaps/keychat.md) i [YakiHonne](gaps/yakihonne.md) — mają opisy wierszy po
  polsku, pozostałe po angielsku. Kosmetyka; ID, statusy i cytaty są w tym samym formacie wszędzie.

**Aktualizacja:** ledger jest snapshotem. Zamykając lukę, skreśl wiersz w `gaps/<client>.md`, popraw
Rollup i tabelę wyżej. Nie renumeruj ID — dokładaj na końcu.
