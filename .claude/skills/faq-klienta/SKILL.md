---
name: faq-klienta
description: Pisanie i rewizja kurowanego FAQ per klient w src/data/faq/ — nowe pytanie, nowy temat kanoniczny, showMe (mini-tour do odpowiedzi), pokrycie tematów, searchAliases. Użyj gdy padnie "dopisz pytanie", "FAQ dla X", "czy to pokrywa temat", "mini-tour do odpowiedzi", "dodaj temat do CANONICAL_TOPICS", albo gdy edytujesz src/data/faq/ lub docs/FAQ.md.
---

# FAQ klienta — jak pisać i rewidować

Osiem plików klientów (`coracle damus amethyst primal nostur yakihonne snort wisp`), 231 wpisów,
137 mini-tourów. Keychat i Gossip **nie mają FAQ** — brak `docs/refs/<client>/` i brak mostka
`FaqMiniTourLauncher`; nie dopisuj ich do `src/data/faq/index.ts` bez recon.

## Kolejność czytania — zanim napiszesz pierwszy wpis

1. **`src/data/faq/README.md`** — kontrakt autorski (grounding tiers, klasy pytań, zasady aliasów).
   To jest źródło nadrzędne wobec tego skilla; skill dodaje kolejność, bramki i checklistę.
2. **`docs/refs/<client>/screen-map.md`** — ground truth odpowiedzi. Opisujesz **realną apkę**,
   nie nasz symulator. Czego screen-mapa nie pokrywa → upstream repo (lista w `docs/FIDELITY.md`),
   z cytatem `plik:symbol` w komentarzu nad wpisem.
3. **`docs/gaps/<client>.md`** — bramka `showMe` (patrz niżej). Sekcje *Anchors* i *Reachability*.
4. Dopiero teraz pisz. `docs/FAQ.md` = stan wdrożenia i wnioski; czytaj, gdy planujesz nową rundę.

## Schemat (dokładne nazwy pól — `src/data/faq/types.ts`)

`FaqEntry`: `id` (kebab-case, unikalne w kliencie) · `category` · `question` · `searchAliases?` ·
`answer: string[]` (numerowane, imperatywne kroki) · `howNostrWorks?` · `note?` · `showMe?`.
`FaqShowMeStep`: `target` (preferuj `[data-tour="…"]`) · `title` · `content` · `position?` ·
`spotlightPadding?` · `commands?` (`unknown[]` — typuj lokalnym helperem
`const cmd = (...cs: SimulatorCommand[]): SimulatorCommand[] => cs`, tak robi każdy z ośmiu plików).
**Typ komendy jest per klient**: Damus ma `DamusSimulatorCommand` (z `simulators/damus/DamusSimulator`),
Nostur i Wisp `SimulatorCommand` z `simulators/<client>/types`, pozostałe `SimulatorCommand`
z `simulators/<client>/<Client>Simulator` — import skopiowany od sąsiada się nie skompiluje.
`ClientFaq`: `clientId`, `categories`, `entries`, `coverage`. `category` wpisu musi być jednym
z `categories` (lokalna stała `CATEGORIES` w każdym pliku: 8 pozycji, `Troubleshooting` ostatnia;
YakiHonne ma dziewiątą — `Long-form`). Chipy filtra to przecięcie obu list, więc literówka w `category`
nie usuwa wpisu z listy — po prostu nie da się do niego dofiltrować i nikt tego nie zauważy.

Wpisy `Troubleshooting` (`trouble-*`) są **TEKSTOWE**: sim nie umie zainscenizować awarii, więc
`showMe` tam kłamie z definicji. Protokolarną połowę odpowiedzi wkładaj w `howNostrWorks` — fakt
o kliencie w tym polu to bug (rewizja rundy 2 złapała trzy takie).

## Id wpisu jest teraz adresem, nie etykietą

Od 2026-08-14 `src/data/capabilities.ts` cytuje wpisy FAQ po id (pole `source`), a `/compare`
renderuje z tego zarówno komórki macierzy, jak i link zwrotny w panelu FAQ. Do tego adres
`/c/<id>?faq=<entry>` chodzi po Nostrze w odpowiedziach (`docs/OUTREACH.md`).

**Przemianowanie id psuje trzy rzeczy naraz** — udostepniony link, cytat w macierzy i link
zwrotny z panelu. Kompilator tego nie złapie, bo `TopicCoverage` to `string`; łapią to dwa
dev-only strażnicy (`getFaq` i nagłówek `capabilities.ts`), które krzyczą w konsoli. Więc:
**nie przemianowuj id bez powodu** — a jak musisz, przejdź `capabilities.ts` w tym samym
commicie i odpal `/compare`, żeby zobaczyć, że nic nie zniknęło.

## Bramka `showMe` — nie negocjuj jej

Wolno dodać `showMe` **tylko** gdy `docs/gaps/<client>.md` nie ma na tej ścieżce statusu
`missing` / `dead` / `unreachable`, kotwica istnieje w sekcji *Anchors*, a komenda montująca ekran
jest w sekcji *Reachability*. `dead` jest gorsze niż `missing`: podświetlasz spotlightem przycisk,
który nic nie robi — 229 kontrolek w repo jest właśnie takich. Reguły źródłowe:
`docs/GAPS.md` → „Zasady dla autora FAQ".

- **≤ 2 komendy na krok** — kolejka toura niesie dokładnie dwie; **trzecia jest gubiona
  deterministycznie, nie losowo** (`docs/TOURS.md` → „Pułapki runtime"). Najbezpieczniej: jedna,
  samowystarczalna komenda na krok (loguje się sama).
- **Kończ na podświetlonym ekranie albo wierszu**, nigdy na „a teraz to kliknij".
- Wpis bez `showMe` jest w porządku — panel po prostu chowa przycisk.

## Kontrakt pokrycia — to CECHA, nie bug

`coverage: Record<CanonicalTopic, TopicCoverage>` (17 tematów w `CANONICAL_TOPICS`). Wartość to id
wpisu, `'n/a'` (realny klient tego nie ma — zweryfikowane, nie domniemane z ciszy) albo `'todo'`
(jawny dług). Dodanie tematu **celowo** wysypuje wszystkie osiem plików, dopóki każdy się nie
zadeklaruje — tak wymuszamy komplet. Nigdy nie obchodź tego rzutowaniem, `Partial<>` ani
opcjonalnością pola: obejście zamienia bank pytań w „to, co autor akurat pamiętał". Literówka w id
wpisu nie jest błędem typów — łapie ją dev-only `console.error` w `index.ts`, więc po edycji
`coverage` otwórz sim i sprawdź konsolę.

**Temat kanoniczny to pytanie użytkownika, nie nazwa funkcji.** Wylicz jego rodzaje i powiedz
wprost, których klient nie ma (mute: ludzie/słowa/hashtagi/wątki/spamerzy/blokowane relaye — Amethyst
ma wszystkie sześć, Nostur nie ma hashtagów, YakiHonne nie ma ani słów, ani hashtagów). Ta sama próba:
`manage-relays` (read/write/inbox/outbox), `notifications` (lista vs ustawienia), `connect-wallet`
(wbudowany vs NWC vs handoff).

## Typecheck

`npm run typecheck` (`tsc --noEmit`) odpalaj **osobno** — `npm run build` idzie przez vite/esbuild
(+ SSR + prerender) i typów nie sprawdza. Jeden błąd składniowy wyciszył tu kiedyś 40 diagnostyk,
przez co kontrakt pokrycia nie egzekwował niczego przez miesiące: nie oznaczaj błędu jako
„znany/PRE-EXISTING" i nie idź dalej — on ucisza całą analizę semantyczną.

## Najczęstszy tryb awarii (~70% znalezisk z rewizji)

**Podpis opisuje realną apkę, a spotlight ramuje symulator.** Rekord: YakiHonne, dziesięć na
dziesięć. Sprawdzenie jest nudne i skuteczne: odpal `npm run dev`, wejdź w `/c/<client>`, otwórz
FAQ, kliknij „Show me", i **przeczytaj podpis na głos przeciwko temu, co widzisz**. Typowe objawy:
ekran montuje się na pustej zakładce, pole wyszukiwania startuje z tekstem, menu nie ma wiersza
z podpisu, przycisk nigdy nie zmienia wyglądu. Gdy sim nie potrafi tego pokazać — **usuń `showMe`**.
**Treść** czytaj z DOM (`document.querySelector().textContent`) — panel podglądu potrafi przestać
kompozytować klatki i pokazywać szkielet przy kompletnym drzewie. **Geometrię odwrotnie: najpierw
zrzut, potem pomiar** — w schowanym panelu `innerWidth` czyta 0 i tranzycje stoją (`docs/TOURS.md`
→ „Jak to weryfikować"). Nie klikaj też Next szybciej niż kolejka komend: krok, którego kotwica
montuje się po `login` + `navigate`, czyta się wtedy jak defekt — odczekaj ≥2,5 s.

## Dwie OSOBNE rewizje, nie jedna

Adwersaryjna („czy to, co napisane, jest PRAWDĄ?") i completeness critic („czego BRAKUJE?").
Drugi znalazł 77 luk (44 must-add) w tekście, który właśnie przeszedł pierwszą i dał 55 poprawek —
weryfikator sprawdza tylko tezę, którą mu dałeś. **Przeczytaj `references/rewizja.md`, zanim
uruchomisz którykolwiek przebieg** (pytania, pola schematu wyjścia, klasyfikacja znalezisk).

## Checklist przed oddaniem

- [ ] Każde twierdzenie zakotwiczone w `screen-map.md` albo w cytacie upstreamu w komentarzu.
- [ ] `showMe` przepuszczony przez ledger (`Anchors` + `Reachability`), ≤2 komendy/krok.
- [ ] Klik-po-kliku w dev: podpis vs ekran, konsola bez błędów.
- [ ] `npm run typecheck` czysty; `coverage` bez `console.error` w dev.
- [ ] Nowy alias nie przejmuje pytania, które inny wpis ma w `question` (alias waży tyle co tytuł).
- [ ] Stan ustawiony komendą nie przecieka do następnego demo.
