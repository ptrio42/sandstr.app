---
name: branding-i-ryzyko-prawne
description: 'Decyzje wokół marki i ryzyka prawnego sandstr: nazwa, domena, disclaimer, znak towarowy, zgoda zespołów klientów, licencje i atrybucja, og/canonical/robots. Użyj gdy: "czy możemy to pokazać", "napisz do twórców", "domena", "disclaimer", "znak towarowy", "licencja", "og:image", "SEO", "robots" — albo gdy dotykasz index.html, public/robots.txt, public/sitemap.xml, public/_headers, TRADEMARKS.md, THIRD-PARTY.md, LICENSE, PRIVACY.md, src/host/brand/ lub pól homepage/repo/upstreamLicense w src/registry.tsx.'
---

# Branding i ryzyko prawne

## Rdzeń: real-clients-first

Produktem są wierne reprodukcje realnych, brandowanych klientów. Ryzyko znaku towarowego
i trade-dress **mitygujemy, a nie uciekamy we własne IP**. `docs/AUDIT.md` rekomenduje
„owned-IP-first / Nostr Kitten jako front door" — to **NIEAKTUALNE**, nadpisane przez właściciela
(nota stoi w `docs/AUDIT.md:3`). Nie cytuj jego sekcji „Rekomendowany branding", „Kluczowe ryzyka"
ani „Roadmapa" jako obowiązujących — wracasz wtedy z kierunkiem, który właściciel już odrzucił.
Tak samo przeterminowane są `docs/SHIP-AND-GRANT.md` (2026-07-28) i `docs/GRANT-WOW.md` — sięgasz
po nie właśnie przy „czy możemy to pokazać", a ich blokery są już zamknięte: `LICENSE` istnieje,
`git remote` wskazuje `ptrio42/sandstr.app`, mock-tożsamości są zmyślone, README nie głosi
owned-IP-first, Kitten nie jest front doorem. Sprawdź każdy ich zarzut, zanim zgłosisz go jako żywy.

## Ścieżka (a) — GŁÓWNA: zgoda opt-in od każdego zespołu

- Twórcy są osiągalni na Nostr, a wierne demo im schlebia. Kanały per klient: sekcje „Opt-in"
  w `docs/FIDELITY.md`. **Nie monetyzujemy marki konkretnego zespołu bez jego zgody.**
- **Kontakt inicjuje właściciel — agent nie wysyła nic na zewnątrz.** Żadnych DM, maili, issue
  ani postów. Możesz przygotować draft jako plik i tyle; wysyłka to decyzja człowieka.
- Wychodzące linki są pierwszym zdaniem tej rozmowy: `homepage`/`repo`/`upstreamLicense`/
  `installNote` w `src/registry.tsx` (zweryfikowane wobec stron i repo klientów 2026-07-29 —
  komentarz `src/registry.tsx:87-99`). Martwy albo zły link kompromituje nas przed dokładnie tymi
  ludźmi, od których chcemy zgody — re-weryfikuj, zanim któryś zmienisz.
- Kanał korekty jest zaimplementowany: `fidelityReportUrl` (`src/host/contribute.ts:38`) →
  formularze w `.github/ISSUE_TEMPLATE/`. `TRADEMARKS.md` obiecuje maintainerowi poprawkę albo
  usunięcie reprodukcji na życzenie, bez pytań — to obietnica do dotrzymania, nie copy.

## Ścieżka (b) — disclaimer na każdym widoku klienta

- Dwie formy w `src/host/ClientView.tsx`: `Disclaimer` (linia 24) i `DisclaimerStrip` (linia 48,
  forma telefonowa). Renderowany tekst: **„Simulation · mock data · unofficial, not affiliated
  with &lt;nazwa&gt;"**, a dla `kind: 'original'` — „original demo client". Pierwszy człon różni się
  wielkością liter między formami: `Disclaimer` ma „Simulation", `DisclaimerStrip` — „SIMULATION"
  (`ClientView.tsx:32` vs `:60`). Wersja wypalana w klipach to jeszcze inny string
  („SIMULATION · unofficial · mock data · not affiliated", `docs/clips/build-teaser-faq.sh:52`) —
  nie „ujednolicaj" ich w jeden, bo cytujesz wtedy tekst, którego nigdzie nie ma.
- Obowiązkowe atrybuty obu: `z-[10003]` (nad backdropem toura na 9999) **oraz**
  `data-tour-keep-clear`. Bez pierwszego tour przyciemniał baner do nieczytelności; bez drugiego
  karta toura kładła się na nim. Na formie telefonowej **nigdy `truncate`** — przy 320px ucinało
  tekst do „…not affiliated wit…", a na telefonie ten pasek jest jedyną rzeczą odróżniającą stronę
  od realnego klienta.
- Mitygacja, której baner nie zastąpi: `X-Frame-Options: DENY` + CSP `frame-ancestors`
  w `public/_headers`. Bez nich pixel-wierny `/c/damus` da się osadzić w cudzej ramce bez chrome'u
  i przeczytać jako prawdziwy klient.

## Nazwa, domena, SEO

- **„Sandstr" to nazwa finalna** (2026-07-28). Domena produkcyjna **`sandstr.app`** (2026-08-03).
  `sandstr.com` jest zajęta przez niezwiązany fintech („SAND", najem krótkoterminowy, Wix, od
  2025-08) — inna branża, brak kolizji, ale i brak szans na drop. **Nie planuj `.com`.**
- W `index.html`: `canonical` i `og:url` = `https://sandstr.app/`, `og:image` =
  `https://sandstr.app/og.png` (1200×630, regenerowany z `scripts/og-image.html`). Wszystkie są
  **przypięte do galerii, nie do bieżącej trasy** — to ta sama decyzja co `Disallow: /c/`
  w `public/robots.txt`: pixel-wierny `/c/damus` nie może rankować na „Damus". `public/sitemap.xml`
  z tego samego powodu ma jeden URL i celowo nie ma `<lastmod>`.
- Blok JSON-LD w `index.html` opisuje **wyłącznie sandstr**. Nie dodawaj reprodukowanych klientów
  do structured data (to dokładnie ta konfuzja tożsamości, której unika reszta strategii) i nie
  wymyślaj `aggregateRating`.

## Licencja i atrybucja

- MIT, „Copyright (c) 2026 ptrio42" (`LICENSE`) — pokrywa **tylko kod w repo**, żadnych praw do
  cudzych nazw, logo i designów (`TRADEMARKS.md`).
- `THIRD-PARTY.md` trzyma rozróżnienie, na którym wszystko stoi: **referenced (fakty — hexy,
  kolejność akcji, zestaw zakładek) vs copied (ekspresja — logo, stringi UI)**. Żaden kod upstream
  nie jest vendorowany, więc copyleft Damusa/Nostura (GPL-3.0) i Keychata (AGPL-3.0) nie jest
  wyzwolony; jeśli to się zmieni, ten plik zmienia się razem z tym.
- **Nowy klient = nowy wiersz w `THIRD-PARTY.md` + nazwa w akapicie w `TRADEMARKS.md` + pola
  `homepage`/`repo`/`upstreamLicense`/`installNote` w `src/registry.tsx`.** Pominięcie oznacza
  shipowanie cudzego logo bez atrybucji. Otwarte pozycje (verbatim swirl Primala, realne ikony
  w `public/icons/`) są spisane w sekcji „Open items, stated plainly"; fallback bez cudzej marki już
  istnieje — `src/host/ClientGlyph.tsx`.
- **Otwarte i żywe: cztery pliki prawne — `LICENSE`, `PRIVACY.md`, `TRADEMARKS.md`, `THIRD-PARTY.md` —
  nie są podlinkowane z wdrożonej strony.** `grep` po `src/host/` nie znajduje ani jednego odwołania,
  a `public/` nie ma ich kopii, więc odwiedzający live URL nie ma do nich żadnej drogi.
  Naiwne `href="/PRIVACY.md"` po cichu wyrenderuje galerię: `wrangler.jsonc` ma
  `not_found_handling: "single-page-application"`. Linkuj blob-URL-e GitHuba albo skopiuj do `public/`.
- `PRIVACY.md`: zero backendu, analityki i cookies, tylko trzy klucze `localStorage`. Jedyny caveat —
  hotlinki, a jego stan na dziś to **12 URL-i DiceBear, wyłącznie w Keychat i Gossip** (dokładnie te
  dwa mają `status: 'preview'`). **Unsplash zszedł w `src/` do zera**, choć caveat i `img-src`
  w `public/_headers` wciąż go wymieniają. **Nie usuwaj caveatu wcześniej niż hotlinków** — to jedyna
  rzecz w tym pliku, którą recenzent sprawdzi w dziesięć sekund; gdy padnie ostatnie 12, z CSP
  wychodzą oba originy i `default-src 'self'` przestaje być aspiracją.
- `src/data/mock/users.ts`: każda tożsamość ma być zmyślona. Realne nazwisko, `nip05` albo lightning
  address = wypowiedzi przypisane realnemu człowiekowi i koniec ścieżki opt-in.

## Nostr Kitten

- **Nielistowany od 2026-08-05**, ale kod i wpis w rejestrze **zostają** (`unlisted`,
  `src/registry.tsx:331`), a `/c/nostr-kitten` dalej się routuje — nie kasuj.
- Nie promuj go na lidera, front door ani kotwicę marki: nie jest realnym klientem Nostr, a parodia
  GeoCities obok Damusa psuje zdanie „reprodukcje realnych klientów" przy pierwszej wizycie.
- Zostaje z jednego powodu: właściciel chce kiedyś zbudować z niego **prawdziwego klienta dla
  zabawy** (rozważany kierunek — fork Wispa ostylowany na Nostr Kitten). To **osobny produkt**,
  a nie symulator w tym repo.

## Znak sandstr

Przeczytaj `references/znak-sandstr.md`, zanim narysujesz, ocenisz albo zmienisz cokolwiek
w `src/host/brand/` — **pięć** twardych ograniczeń (zero obrazowania degradacji, zero kolizji ze
znakami hostowanych klientów, przetrwanie 24px i 16px, panele nigdy w perspektywie, fala cienka
i ciągła) plus zweryfikowane tokeny.

## Checklist przed „można to pokazać"

1. Widok klienta renderuje baner z `data-tour-keep-clear` i `z-[10003]`.
2. Klient ma wiersz w `THIRD-PARTY.md` i działający link wyjściowy w `src/registry.tsx`.
3. Nic nowego nie trafiło do JSON-LD, `sitemap.xml` ani poza `Disallow: /c/`.
4. Żadna mock-tożsamość nie wskazuje na realnego człowieka ani identyfikator płatności.
5. Nic nie poszło na zewnątrz bez decyzji właściciela.
