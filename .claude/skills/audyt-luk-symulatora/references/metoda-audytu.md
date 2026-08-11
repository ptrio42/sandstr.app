# Metoda audytu — pięć przebiegów + runda obalania

Wykonuj po kolei. Każdy przebieg produkuje surowe notatki; wiersze do pliku składasz dopiero w piątym.

## 0. Przygotowanie

- Lista sekcji ground truth: nagłówki `##` w `docs/refs/<client>/screen-map.md`. To one trafiają do
  kolumny `§`. Numerowane w Damusie/Snorcie/Wispie/Coracle/Nosturze (`§5`, `§6.3`), **nazwane
  w Amethyście, YakiHonne i Primalu** (`§Settings suite`, `§Login`, `§Left Sidebar`) — nie dopisuj im numerów.
- Lista plików symulatora: `ls -R src/simulators/<client>/`. Wzorzec to `<Client>Simulator.tsx`
  (stan + `switch` komend), `<Client>SimulatorWithTour.tsx` (mapa kroków → komendy), `screens/`,
  `components/`, `<client>.theme.css` — z **dwoma wyjątkami, które trzeba znać przed pierwszym `ls`**:
  - **Gossip nie ma wrappera** — sam `GossipSimulator.tsx`, więc nie ma czego audytować pod reachability.
  - **Primal nie ma nic z tego wzorca w katalogu klienta.** Jest `PrimalWebSimulatorWithTour.tsx`,
    a cała reszta siedzi piętro niżej: `web/WebSimulator.tsx`, `web/screens/`, `web/components/`,
    `web/primal-web.theme.css`. Dlatego Evidence w `docs/gaps/primal.md` cytuje **z prefiksem `web/`**
    (`web/components/LeftSidebar.tsx:…`) i tak pisz nowe wiersze.
- `Sim LOC` do nagłówka: `find src/simulators/<client> -name '*.ts*' -o -name '*.css' | xargs wc -l`
  (nagłówki ledgerów rozbijają to na ts/tsx + css, np. Damus „2098 (1815 ts/tsx + 283 css)").
  W Primalu **odejmij nieroutowany `mobile/`** — naiwna komenda daje 4459, a do nagłówka idzie
  `web/` + wrapper (ledger notuje to wprost w linii `Sim LOC`).

## 1. Surface walk — czy ekran w ogóle jest

Sekcja screen-mapy po sekcji: znajdź odpowiadający ekran w `screens/`. Brak pliku/gałęzi = `missing`.
Ekran jest, ale ma mniej wierszy/opcji/stanów niż specyfikacja = `partial`. Notuj ścieżkę w UI tak, jak
przejdzie ją użytkownik (`Feed → note → ⋮ menu → Copy Note ID`) — kolumna *Surface* to nawigacja, nie plik.

## 2. Dead-control sweep — czy klik cokolwiek robi

Przejrzyj każdy element, który wygląda na klikalny. Wzorce, które w tym repo realnie produkują `dead`:

- brak `onClick` na elemencie, który w realnej apce reaguje (najczęstszy przypadek — `<div>` udający
  przycisk, np. `wis-24` wiersz lightning-address);
- handler, który **tylko zamyka menu / arkusz** i nic poza tym (`wis-08`: osiem pozycji menu ⋮);
- **early `return`** dla konkretnej gałęzi — `screens/FeedScreen.tsx:91` w Wispie:
  `if (item === 'List' || item === 'Hashtags') return;`;
- stan czytany **wyłącznie do etykiety albo tinta**, a nigdy do treści — to jest `partial`, nie `dead`
  (`wis-02` filtr treści, `wis-22` pigułka sortowania: menu się przełącza, lista nie).

Kolumna *Evidence* przy `partial` tego typu ma dwa cytaty: gdzie stan jest ustawiany **i** gdzie lista
go ignoruje (wzorzec z pliku: `screens/FeedScreen.tsx:81-83,109-116` vs list at `:223`).

## 3. Inwentarz kotwic

```bash
grep -rnE "\btour[=:] *['\"]" src/simulators/<client>/   # nazwy kotwic, także te podawane propem
grep -rn  "data-tour" src/simulators/<client>/            # miejsca montażu, także wyrażenia
```

**Nie zawężaj do ``data-tour="``.** Zmierzone 2026-08-11 na całym `src/simulators/`: literalny grep łapie
**151 linii**, pełny **172** — gubisz **21 kotwic w ośmiu klientach z dziesięciu**. Bez kotwic są tylko
Gossip (zero w ogóle) i Wisp (same literały). Trzy formy, które umykają:

- **rodzina z template literalem** (``data-tour={`…`}``) — jeden wiersz kodu = kilka realnych celów.
  Wszystkie osiem: `damus-menu-${d}` (`damus/screens/SideMenu.tsx:62`), `amethyst-drawer-${…}`
  (`amethyst/components/Drawer.tsx:78`), `yakihonne-tab-${id}` (`yakihonne/components/TabBar.tsx:45`),
  `snort-nav-${item.screen}` (`snort/SnortSimulator.tsx:709`), `coracle-nav-${item.screen}`
  (`coracle/CoracleSimulator.tsx:609`), `keychat-nav-${tab.id}` (`keychat/components/BottomNav.tsx:63`),
  `nostur-tab-${id}` (`nostur/components/BottomBar.tsx:49`), `nostur-drawer-${id}`
  (`nostur/components/Sidebar.tsx:90`);
- **ternarny opt-in** — `data-tour={index === 0 ? 'keychat-chat-item' : undefined}`: kotwica istnieje na
  **jednym** elemencie listy, nie na wszystkich. Tak jest w `keychat/screens/ChatListScreen.tsx`,
  `snort/components/NoteCard.tsx`, `primal/web/components/NoteCard.tsx`;
- **przekazana propem** — `data-tour={tour}` / `data-tour={r.tour}` w ekranach Settings Damusa, Amethysta
  i YakiHonne. Tu grep po `data-tour` pokazuje **ujście, nie nazwy**; same selektory
  (`damus-settings-keys`, `yakihonne-settings-wallets`, …) leżą w wywołaniach `tour="…"` / `tour: '…'`,
  czyli w pierwszym grepie wyżej.

Do sekcji *Anchors* wpisz selektor, `plik:linia` i powierzchnię. Zaznacz kotwice montowane warunkowo
(wzór z Wispa: „`wisp-follow` — **only in the `!isOwn` branch**"), bo z punktu widzenia `showMe` taka
kotwica bywa martwa mimo że istnieje w kodzie.

## 4. Reachability — czy komenda toura tam dojedzie

- **Unia komend:** `src/simulators/<client>/types.ts` tam, gdzie istnieje (Wisp, Nostur — `SimulatorCommand`),
  w pozostałych klientach `switch (tourCommand.type)` w `<Client>Simulator.tsx`. Zapisz też **payloady** —
  komenda bez payloadu (albo z payloadem zaszytym na stałe) nie dowiezie sub-ekranu.
- **Mapa kroków:** `<Client>SimulatorWithTour.tsx`. Kolejka niesie **dokładnie dwie komendy na krok**
  (`docs/TOURS.md:63`, kontrakt w `src/data/faq/types.ts:19-25`); trzecia jest dropowana
  deterministycznie. Powierzchnia wymagająca trzech przeskoków = `unreachable`, i tak to nazwij wprost —
  wzorzec `key-35` (tour Keychata kolejkował `login` + `navigate` + `selectChat` i nigdy nie dojechał).
- **Stan lokalny `useState` w ekranie = `unreachable`.** Jeśli `peer`, `view`, `sheet`, `replyTo` czy
  `zapTarget` ustawia wyłącznie klik, żaden `showMe` tam nie wejdzie.
- Sprawdź też **wyjście**: overlay, którego żadna komenda nie zamyka, zostaje na wierzchu i kolejny krok
  podświetla element leżący pod nim (wzorzec `ame-56`).

Wynik zapisz w tabeli *Reachability* (powierzchnia | osiągalna? | czym) i zakończ zdaniem, które komendy
odblokowałyby najwięcej wierszy naraz — to jest najtańsza część backlogu.

## 5. Zapis

Wiersze → `docs/gaps/<client>.md` wg szablonu z `docs/gaps/README.md`, potem Rollup i indeks
(patrz `aktualizacja-ledgera.md`).

## Runda obalania (rób ją zawsze, także sam na sobie)

Dla **każdego** wiersza `missing`/`dead`/`partial`, zanim go zostawisz:

1. otwórz cytowany plik i przeczytaj cytowaną linię — czy nadal mówi to, co twierdzisz (pliki żyją,
   cytaty z 2026-08-05 mogły się przesunąć);
2. poszukaj handlera **wyżej**: na rodzicu (delegacja kliknięcia), w propsach (`onZap`, `onQuote` bywają
   przekazywane albo nie — `wis-09`), we wrapperze `*SimulatorWithTour`;
3. odpal podgląd (`preview_start`, config `sandstr` — ma `autoPort: true`, więc przy zajętym 5173 wstanie
   na innym porcie, czytaj wynik wywołania; `sandstr-preview` to 4173 ze `--strictPort`), wejdź na ekran
   i **kliknij**. Konsola musi być czysta — `gos-01` (crash kładący całego hosta razem z banerem
   disclaimera) dało się zobaczyć wyłącznie klikiem, nigdy z lektury. Sam `gos-01` jest **naprawiony
   2026-08-07** i stoi w ledgerze jako `unanchored` — nie zgłaszaj go drugi raz, to tu tylko przykład.

## Czego NIE zgłaszasz

- wierności wizualnej (piksele, odcienie) — `docs/FIDELITY.md` i side-by-side;
- świadomie odtworzonych bugów upstreamu — **każdy ledger ma taki blok wykluczeń, ale pod inną nazwą**
  („Deliberate, NOT gaps" tylko w `wisp.md`; gdzie indziej „Świadoma wierność — NIE zgłaszać jako luki",
  „Świadome / NIE luki", „Nie-luki…"). Nie szukaj stałego nagłówka, tylko
  `grep -niE "nie luk|nie zgłasz|NOT gaps" docs/gaps/<client>.md`; w Primalu i Coracle wykluczenia są
  wyłącznie w prozie pod tabelą;
- afordancji gestowych, których wskaźnikowy symulator nie udźwignie (pull-to-refresh, swipe-to-reply) —
  odnotuj w prozie, nie zakładaj osobnego wiersza;
- powierzchni, których screen-mapa nie pokrywa („repo-only, no recording render") — te idą do sekcji
  „Poza zakresem / do recon" jako lista zakupów na następny recon, bo nie ma wobec czego mierzyć.
