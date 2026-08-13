# VERSIONS — wersjonowanie symulatorów per klient

Realny klient wydaje nową wersję → symulator przebudowujemy do niej, ale **starej nie
kasujemy**: zostaje jako zamrożony snapshot, dostępny obok bieżącej. Powód (2026-08-13):
symulator Amethysta odtwarza v1.12.6, a testowany v1.13.1-fdroid już wygląda inaczej —
ten rozjazd będzie się powtarzał przy każdym kliencie.

## Model

**Archiwum = katalog-rodzeństwo + ręcznie zbudowany wpis w liście `archived`**
(`src/registry.tsx`, trzecia lista obok `clients`/`unlisted`). Decyzja z panelu
sędziów 2026-08-13 (3×A przeciw wariantowi „versions wewnątrz wpisu + `/c/:id/:ver`"),
bo wszystko istniejące działa bez zmian:

- trasa `/c/<archId>` łapie się w istniejące `/c/:id`; robots `Disallow: /c/`, noindex,
  SPA fallback i deep-linki `?tour=1`/`?faq=` pokrywają ją automatycznie;
- galeria, ⌘K, rail, DesktopClientGate i prerender czytają tylko `clients` — archiwum
  jest niewidoczne dla pierwszej wizyty, osiągalne wyłącznie z menu wersji i z linków;
- osobne id = osobny remount (klucz swap w `ClientView` to `entry.id`), osobny chunk,
  osobny klucz localStorage toura, i **bezpieczny brak** FAQ (`getFaq(archId)` → null
  chowa wszystkie afordancje, zamiast strzelać komendami nowego UI w stare);
- UI: menu wersji przy nazwie klienta (renderuje się TYLKO gdy rodzina ma >1 wersję),
  pasek „older version" na archiwum, lista Versions w mobilnym AboutSheet, rail
  podświetla żywe rodzeństwo (`archivedOf`).

`versionsOf(id)` w `registry.tsx` łączy rodzinę **po polu `archivedOf`** — nigdy po
prefiksie id.

## Zasady twarde

- **Freeze wykonuj ZANIM zaczniesz przebudowę** żywego katalogu do nowej wersji.
- `src/simulators/<id>/` to ZAWSZE wersja bieżąca; snapshot to
  `src/simulators/<archId>/` — **rodzeństwo na tej samej głębokości** (importy są
  wyłącznie względne, więc kopia verbatim się kompiluje; kopia w podkatalogu NIE).
- Zamrożony katalog jest nietykalny poza naprawami krytycznymi.
- Wpis archiwum budujesz **ręcznie wzorem `nostrKitten`** — ŻADNEGO nowego membera
  `SimulatorClient`, configu w `allSimulatorConfigs` ani klucza `MOUNTS` (enum wymusza
  config, a config bez mountu crashuje rejestr przy module load).
- Zamrożony katalog **nie importuje niczego z `src/data/`** — grep-guard niżej.
- `name` wpisu archiwum = **goła marka** („Amethyst") — Disclaimer („not affiliated
  with X") i Handoff („Get the real X") interpolują ją; wersję niesie `reproduces`.

## Nazewnictwo

`archId` = `<id>-v<major>-<minor>` z `reproduces` żywego wpisu (v1.12.6 →
`amethyst-v1-12`). Gdy `reproduces` jest datą („as of Jul 2026"), użyj
`<id>-<yyyy>-<mm>` (`snort-2026-07`). Kolizja (drugi freeze w tym samym
minorze albo miesiącu) — dołóż kolejny segment: patch (`amethyst-v1-12-6`)
albo dzień (`snort-2026-07-29`). Raz nadany `archId` jest wieczny (żyje w
linkach) — nie zmieniaj go przy późniejszych freeze'ach.

## Procedura freeze

Wykonana end-to-end i zweryfikowana w przeglądarce 2026-08-13 (dry run na
Amethyście, potem cofnięta — pierwszy realny freeze to snapshot v1.12.6 przy
przebudowie do v1.13.1). Kolejność kroków 1→3 jest istotna: tour kopiujesz do
katalogu PRZED sedem klas, żeby jego selektory `target` też dostały rename.

0. **Warunki:** żywy sym `status: 'ready'`; `reproduces` w `MOUNTS` zgodne z
   `docs/refs/<id>/screen-map.md`; nagranie nowej wersji w ręku.
1. **Kopia + tour + ikona:**
   ```bash
   cp -R src/simulators/<id> src/simulators/<archId>
   mv src/simulators/<archId>/<id>.theme.css src/simulators/<archId>/<archId>.theme.css
   cp src/data/tours/<id>-tour.ts src/simulators/<archId>/tour.ts
   cp public/icons/<id>.<ext> public/icons/<archId>.<ext>
   ```
2. **Rename w całej kopii (CSS jest globalny!):** jeden przebieg sedem po
   wszystkich `.ts/.tsx/.css` kopii: `<id>.theme.css` → `<archId>.theme.css`,
   `<id>-simulator` → `<archId>-simulator`, `/icons/<id>.` → `/icons/<archId>.`.
   Obejmuje to selektory `target: '.<id>-simulator'` w skopiowanym `tour.ts`
   i warianty typu `-simulator-content` — spójnie, o to chodzi. Bez tego style
   żywej wersji nadpisują archiwum (oba chunki żyją w jednej sesji SPA, wygrywa
   ostatnio załadowany). **Uwaga:** arkusz ma też selektory NIE-scope'owane pod
   klasą rootową (`.md-card`, `.md-button`…) — one pozostają wspólne. Tokeny
   (zmienne CSS) są bezpieczne, bo żyją na przemianowanej klasie rootowej;
   dlatego po freeze dopisz na górze ŻYWEGO `<id>.theme.css` komentarz: „zmiany
   istniejących niescope'owanych selektorów wprowadzaj scope'owane pod
   `.<id>-simulator` — archiwum <archId> dzieli te reguły".
3. **Tour — re-id:** w `src/simulators/<archId>/tour.ts` zmień `id` na dokładnie
   `'<archId>-tour'` (host strzela `start-<routeId>-tour`, `TourWrapper` słucha
   `start-<tourConfig.id>` — bez re-id przycisk „Take a tour" i `?tour=1` są
   cicho martwe; dostaje też własny klucz localStorage) i analogicznie
   `storageKey` (pole martwe, ale trzymaj spójne). We wrapperze przepnij import
   na `./tour`. Mapa krok→komendy we wrapperze jest POZYCYJNA — import żywego
   pliku toura rozjeżdża się przy pierwszej edycji kolejności kroków.
4. **FAQ — wycięcie z wrappera:** usuń importy `FaqMiniTourLauncher`/`isFaqStepId`
   i `../../data/faq/<id>`, ref `faqCommandsRef`, callback `handleFaqLaunch`,
   blok `if (isFaqStepId(step.id)) …` w `handleStepChange` oraz element
   `<FaqMiniTourLauncher …/>` z JSX. Dopisz wrapperowi nagłówek
   `FROZEN <data> — … do not edit beyond critical fixes`. FAQ zostaje przy
   bieżącej wersji; na archiwum afordancje znikają same (`getFaq` → null).
5. **Ikona:** skopiowana w kroku 1, ścieżki podmienione w kroku 2 (Amethyst:
   4 hardkodowane wystąpienia w `screens/`). Plik ikony jest mutowalny in-place
   z krótkim cache — rebranding w nowej wersji nie może przemalować archiwum.
6. **Rejestr:** wpis w `archived`: `id: archId`, `name` = marka, `archivedOf: '<id>'`,
   `reproduces` = stara wersja, `capturedOn: 'YYYY-MM-DD'`, `defaultTheme` **przypięty
   do wartości żywego wpisu z chwili freeze** (rozjazd flipowałby motyw całej strony
   przy przełączaniu wersji), reszta pól (frame, platform, kolory, description,
   features, homepage/repo/licencja/installNote, `icon` = wersjonowana ścieżka)
   skopiowana z żywego wpisu; `status: 'ready'`, `kind: 'reproduction'`, `lead: false`,
   `hasTour` wg kroku 3; `Component: lazy(load)` + `preload: once(load)` — **ten sam
   loader** w obu.
7. **Dokumenty:** skopiuj `docs/refs/<id>/screen-map.md` →
   `docs/refs/<archId>/screen-map.md` i `docs/gaps/<id>.md` → `docs/gaps/<archId>.md`,
   każdemu dopisz nagłówek `FROZEN <data> — snapshot dla <archId>; nie edytować`.
   Shots zostają w żywym katalogu (nagrania są ciężkie); jeśli nowy recon podmienia
   plik shotu po tej samej nazwie, stary najpierw `git mv` do
   `docs/refs/<archId>/shots/`. Zamrożonego ledgera gapów NIE wliczaj do arytmetyki
   `docs/GAPS.md`. Freeze odnotuj datowaną notą w `docs/FIDELITY.md` (precedens: Olas).
8. **THIRD-PARTY.md:** bez zmian — ten sam upstream i ta sama licencja.
9. **Dopiero teraz** przebudowa `src/simulators/<id>/` do nowej wersji (recon wg
   skilla `wierna-reprodukcja-klienta`), nowy `reproduces` w `MOUNTS`, aktualizacja
   toura/FAQ/screen-map jak zwykle.

## Grep-guard

Celuje w instrukcje importu, nie w goły string — komentarze legalnie wspominają
`src/data/tours/…` (fałszywy alarm złapany na dry runie: komentarz w
`LoginScreen.tsx:114`). Katalogi odkrywa `find`, nie glob — w zsh niedopasowany
glob (`*-20*/` przy samych archiwach `*-v*`) ubija całą linię, ZANIM grep ruszy.

```bash
find src/simulators -maxdepth 1 -type d \( -name '*-v*' -o -name '*-20*' \) -exec grep -rEln "from ['\"][^'\"]*data/(tours|faq)" {} + | grep . && echo "FROZEN DIR IMPORTS LIVE DATA" || echo OK
```

## Definition of done (freeze)

- `npm run typecheck` i `npm run build` przechodzą (build czytany, nie tylko exit code).
- `/c/<archId>`: konsola 0 błędów; pasek „older version" widoczny; „Open the current
  version" działa; „Take a tour" startuje zamrożony tour; FAQ nieobecne; link
  „Spotted something off?" NIEobecny (zgłoszenie wierności zamrożonego katalogu
  nie ma adresata).
- `/c/<id>`: menu wersji przy nazwie w **obu** miejscach (ContextPanel lg+ dla
  klientów z ramką ORAZ meta row sm–lg / frameless — nigdy nie renderują się razem);
  przejście w obie strony działa.
- Rail: na archiwum podświetlony chip żywego rodzeństwa; `[` `]` cyklują od niego.
- Wąski viewport: lista Versions w AboutSheet; pasek archiwum nie ucina tekstu przy 320px.
- Grep-guard: OK.

## Znane ograniczenia (świadome)

- Archiwum nadal importuje żywe `../shared/` i `../../../data/mock` — traktujemy je
  jako stabilne API. Zmiana łamiąca w `shared/` = przeklikaj też archiwa.
- Niescope'owane selektory arkusza (`.md-*`) pozostają wspólne między wersjami —
  tokeny są odseparowane klasą rootową, ale zmiana KSZTAŁTU istniejącej reguły
  w żywym arkuszu bez scope'a przecieka do archiwum (patrz krok 2).
- Archiwizacja jest **źródłowa, nie artefaktowa**: snapshot jest przebudowywany przy
  każdym deployu, więc upgrade zależności może zmienić jego zachowanie.
- Postęp toura nie przenosi się między wersjami (osobne klucze
  `nostr-tour-<archId>-tour`) — celowo.
- Archiwum nie ma FAQ ani mini-tourów „Show me" — koszt pełnego kontraktu
  `CANONICAL_TOPICS` na wersję nie jest go wart; pasek archiwum linkuje bieżącą wersję.
