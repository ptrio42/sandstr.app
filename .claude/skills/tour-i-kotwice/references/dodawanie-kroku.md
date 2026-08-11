# Dodawanie kroku, kotwicy i `showMe` — procedura

Kolejność ma znaczenie: kotwica najpierw, potem komenda, na końcu treść kroku. Odwrotnie zawsze
kończy się krokiem, który nie rozwiązuje celu i po cichu podświetla całą appkę.

## 1. Sprawdź, czy ścieżka w ogóle istnieje

Otwórz `docs/gaps/<client>.md` (indeks: `docs/GAPS.md`, słownik statusów: `docs/gaps/README.md`).
Status wiersza mówi dokładnie, co wolno:

- `missing`, `dead` → **`showMe` zabronione**; sama odpowiedź tekstowa OK. (`dead` = renderuje się,
  ale klik jest no-opem — podświetlisz coś, w co użytkownik kliknie w pustkę.)
- `unreachable` → `showMe` dopiero po dorobieniu komendy w `*SimulatorWithTour`.
- `unanchored` → `showMe` dopiero po dodaniu `data-tour` (fix = jeden atrybut).
- `partial` → wolno, ale treść ma opisywać to, co symulator **faktycznie** pokazuje.

Ledger to snapshot z 2026-08-05 i **potrafi być nieaktualny w szczegółach**: wiersze `yak-40`/`yak-91`
są zamknięte, ale tabela „Anchors" na końcu `docs/gaps/yakihonne.md` wciąż opisuje stan sprzed
naprawy. Nazwę kotwicy i `plik:linia` potwierdzaj Grepem w `src/simulators/`, nie tabelą.

Treść kroku opisuje realnego klienta — źródłem jest `docs/refs/<client>/screen-map.md`, nie domysł.
**Uwaga: Keychat i Gossip nie mają katalogu w `docs/refs/`** (jest 8 z 10), a Keychat mimo to ma tour —
dla niego jedynym źródłem w repo jest `docs/gaps/keychat.md`.

## 2. Kotwica w symulatorze

Dwa jedyne wzorce (żadnych zmian wizualnych, żadnych rozgałęzień w JSX):

```tsx
// powtarzalne wiersze — dokładnie jeden zakotwiczony
data-tour={index === 0 ? 'keychat-chat-item' : undefined}
// src/simulators/keychat/screens/ChatListScreen.tsx:91
```

```tsx
// listy generowane z danych — opcjonalne pole na typie wiersza
const Group = ({ title, children, tour }: { title: string; children: React.ReactNode; tour?: string }) => (
// src/simulators/damus/screens/SettingsScreen.tsx:24
```

Nazwa kotwicy: `<client>-<rzecz>` (np. `damus-settings-account` w
`src/simulators/damus/screens/SettingsScreen.tsx:71`, `damus-auth-actions` w `LoginScreen.tsx:45`).
**Dwie kotwice o tej samej nazwie nie mogą być zamontowane jednocześnie** — `resolveTarget` woła
`querySelector`, więc trafia tylko pierwsza w kolejności DOM. Tak wyglądały `yak-40` i `yak-91`
(root `HomeScreen` kontra overlay Profile / przycisk zakładki); dziś naprawione, bo ekrany dostały
własne nazwy (`yakihonne-profile-screen`, `yakihonne-tab-<id>`). Powtórzona nazwa w **wykluczających
się** gałęziach jest natomiast celowa i dobra: `snort-compose` w railu i w dolnym pasku
(`src/simulators/snort/SnortSimulator.tsx:625` i `:724`) daje mini-tourowi cel na każdej szerokości.

## 3. Komenda, która montuje cel

Cel rozwiąże się tylko wtedy, gdy symulator jest na ekranie, który go montuje.

- Typ komendy żyje przy symulatorze i u ośmiu klientów nazywa się po prostu `SimulatorCommand`
  (Nostur/Wisp: `src/simulators/<client>/types.ts`; reszta: plik komponentu bazowego). **Damus jest
  jedynym wyjątkiem** — `DamusSimulatorCommand`, `src/simulators/damus/DamusSimulator.tsx:27-30`:
  `{ type: 'login' | 'logout' | 'navigate' | 'compose' | 'post' | 'viewProfile' | 'viewUser' | 'back'; payload?: any }`.
  Nowa destynacja = nowy wariant `type` **albo** nowy `payload` w istniejącym `navigate` (Damus
  dorzucił tak `relays | dms | search | notifications | drawer`, `DamusSimulator.tsx:22-25`).
- Obsługa w symulatorze: efekt na `tourCommand`, `switch (tourCommand.type)`, **na końcu**
  `onCommandHandled?.()` (`DamusSimulator.tsx:95-143`).
- Mapowanie w `*SimulatorWithTour.tsx`: `stepCommands: Record<number, SimulatorCommand[]>`
  po indeksie kroku. **Jedna samowystarczalna komenda na krok** — gałąź komendy ma sama ustawić
  `authenticated` i zakładkę (wzorzec Nostura, `NosturSimulatorWithTour.tsx:79-97`). Dwie działają,
  trzecia ginie.

## 4. Krok w `src/data/tours/<client>-tour.ts`

Kształt pola-po-polu jest w `src/components/tour/types.ts` (`TourStep`, `TourConfig`). Minimalny krok:

```ts
{
  id: 'damus-settings',
  target: '[data-tour="damus-settings-account"], [data-tour="damus-settings"]',
  title: 'Settings & Security',
  content: '…',
  position: 'bottom',
  allowClickThrough: true,
  spotlightPadding: 0,
}
```

- Wąska kotwica pierwsza, szeroka na końcu.
- `allowClickThrough` jest **bezczynne** i tak ma zostać (komentarz przy `TourStep` w `types.ts`) —
  ustawiaj je dla spójności, ale nie licz na modalność.
- Kroki welcome/outro celowo celują w `.<client>-simulator` i renderują się jako wyśrodkowane karty
  bez ringu — to nie jest błąd do naprawienia.
- Dodając indeks kroku w środku touru **przenumeruj `stepCommands`** w wrapperze — mapa jest po
  indeksie, nie po `id`.
- Nowy tour: eksport `<client>TourConfig` + `default`, wpis w `src/data/tours/index.ts` (`tourConfigs`)
  i `tour: true` w `src/registry.tsx` (rejestr derywuje z tego `hasTour`, `registry.tsx:304`).
  `tour: false` (Coracle, Gossip) znaczy „brak głównego touru". `showMe` dalej działa tylko tam, gdzie
  jest wrapper: Coracle ma `CoracleSimulatorWithTour`, Gossip nie ma żadnego (`registry.tsx` ładuje
  goły `GossipSimulator`), więc u niego nie da się odpalić ani touru, ani mini-touru.

## 5. `showMe` w `src/data/faq/<client>.ts`

Typ `FaqShowMeStep` (`src/data/faq/types.ts:12-26`): `target`, `title`, `content`, opcjonalnie
`position`, `spotlightPadding`, `commands`. `commands` jest tam celowo `unknown[]` — wrapper klienta
rzutuje na swój typ komend i puszcza tą samą kolejką (czyli **maks. 2 komendy na krok**).
Launcher (`src/components/faq/FaqMiniTourLauncher.tsx`) buduje świeży `TourConfig` per uruchomienie
i nadaje krokom id `faq:<clientId>:<entryId>:<i>` — wrapper rozpoznaje je przez `isFaqStepId(step.id)`
i bierze komendy z wpisu FAQ zamiast z mapy indeksów. Kanał host→sim to zdarzenie `sandstr-show-faq`.

## 6. Weryfikacja klik-po-kliku

1. `preview_start` → config `sandstr` (`.claude/launch.json`), wejdź na `/c/<id>`.
2. „Take a tour" wysyła `start-<id>-tour`; `TourWrapper` nasłuchuje tego zdarzenia i robi
   `restartTour` — działa też po skipie/ukończeniu (`TourWrapper.tsx:66-80`).
3. Screenshot **przed** każdym pomiarem geometrii; ≥2,5 s postoju na kroku przed oceną.
4. Konsola: **0 błędów**. `ResizeObserver loop completed with undelivered notifications` to realny
   błąd, nie szum — znaczy, że liczysz layout w callbacku obserwatora.
5. `npm run typecheck` i `npm run build`.
