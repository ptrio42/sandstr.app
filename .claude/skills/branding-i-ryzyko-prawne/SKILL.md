---
name: branding-i-ryzyko-prawne
description: 'Decyzje wokół marki i ryzyka prawnego sandstr: nazwa, domena, disclaimer, znak towarowy, zgoda zespołów klientów, licencje i atrybucja, og/canonical/robots, karty link-preview. Użyj gdy: "czy możemy to pokazać", "napisz do twórców", "domena", "disclaimer", "znak towarowy", "licencja", "og:image", "karta share", "link preview", "SEO", "robots" — albo gdy dotykasz index.html, public/robots.txt, public/sitemap.xml, public/_headers, public/og/, scripts/og-image.html, scripts/og-client-cards.mjs, src/shareMeta.ts, TRADEMARKS.md, THIRD-PARTY.md, LICENSE, PRIVACY.md, src/host/brand/ lub pól homepage/repo/upstreamLicense w src/registry.tsx.'
---

# Branding i ryzyko prawne

## Rdzeń: real-clients-first

Produktem są wierne reprodukcje realnych, brandowanych klientów — to kierunek właściciela i nie
podmieniamy go na własne IP. Starsze notatki procesowe (nieśledzone od 2026-08-19, patrz
`.gitignore`) mówią co innego — „owned-IP-first / Nostr Kitten jako front door". To jest
**przeterminowane**: nie cytuj ich zaleceń jako obowiązujących i nie przywracaj ich do repo.
Ich blokery są zamknięte: `LICENSE` istnieje, `git remote` wskazuje `ptrio42/sandstr.app`,
mock-tożsamości są zmyślone, README nie głosi owned-IP-first, Kitten nie jest front doorem.

## Ścieżka (a) — GŁÓWNA: kanał korekty dla zespołów

- **Kanał jest zaimplementowany:** `fidelityReportUrl` (`src/host/contribute.ts:38`) → formularze
  w `.github/ISSUE_TEMPLATE/`. `TRADEMARKS.md` obiecuje każdemu zespołowi poprawkę błędu wierności
  albo usunięcie reprodukcji na życzenie, bez pytań — **to obietnica do dotrzymania, nie copy.**
- **Nie monetyzujemy cudzej marki.**
- **Kontakt na zewnątrz inicjuje właściciel — agent nie wysyła nic.** Żadnych DM, maili, issue
  ani postów. Możesz przygotować draft jako plik i tyle; wysyłka to decyzja człowieka.
- Wychodzące linki (`homepage`/`repo`/`upstreamLicense`/`installNote` w `src/registry.tsx`,
  zweryfikowane wobec stron i repo klientów 2026-07-29) to jedyna droga odwiedzającego do
  prawdziwej appki — martwy albo zły link zostawia go w symulacji. Re-weryfikuj przed zmianą.

## Ścieżka (b) — disclaimer na każdym widoku klienta

- Dwie formy w `src/host/ClientView.tsx`: `Disclaimer` (linia 24) i `DisclaimerStrip` (linia 48,
  forma telefonowa). Renderowany tekst: **„Simulation · mock data · unofficial, not affiliated
  with &lt;nazwa&gt;"**, a dla `kind: 'original'` — „original demo client". Pierwszy człon różni się
  wielkością liter między formami: `Disclaimer` ma „Simulation", `DisclaimerStrip` — „SIMULATION"
  (`ClientView.tsx:32` vs `:60`). Wersja wypalana w klipach to jeszcze inny string
  („SIMULATION · unofficial · mock data · not affiliated", `docs/clips/build-teaser-faq.sh:52`) —
  nie „ujednolicaj" ich w jeden, bo cytujesz wtedy tekst, którego nigdzie nie ma.
- Obowiązkowe atrybuty obu: `z-[var(--z-disclaimer)]` (skala warstw hosta stoi w `:root` w `src/index.css`: rail 3000 < tour-backdrop 9000 < tour-card 9200 < disclaimer 9400 < host-modal 9600; gola liczba `z-[...]` w `src/host/` jest zakazana) (nad backdropem toura) **oraz**
  `data-tour-keep-clear`. Bez pierwszego tour przyciemniał baner do nieczytelności; bez drugiego
  karta toura kładła się na nim. Na formie telefonowej **nigdy `truncate`** — przy 320px ucinało
  tekst do „…not affiliated wit…", a to ten pasek mówi odwiedzającemu, że ogląda symulację.
- **Link demo NIE jest powierzchnią bez banera** — w przeciwieństwie do karty og. `?screen=`,
  `?theme=`, `?tour=1`, `?faq=`, `?showme=`, `?note=` otwierają zwykły `/c/<id>` z całym chrome'em
  hosta: baner, wyjście do prawdziwego klienta, link do zgłoszenia błędu wierności. Dlatego kreator
  (`src/host/DemoLinkSheet.tsx`) nie potrzebuje własnej mitygacji — potrzebuje tylko **nie mieć
  parametru, który to chowa**. Nie dodawaj `?bare=`, `?chrome=0` ani trybu pełnoekranowego bez
  hosta; to zamieniłoby link w dokładnie tę powierzchnię, przed którą broni `frame-ancestors`.
- **Kreator składa, nie autoruje** (twarda zasada w `CLAUDE.md`): oferuje ekran, który klient realnie
  mapuje, wpis z jego banku FAQ i jego własny tour. **Żadnego pola na własne podpisy** rysowane nad
  cudzą apką — to jedyne miejsce w tym pomyśle, które wkłada komuś słowa w usta. Wklejona notatka
  jest wyjątkiem, który już shipował („Preview your note"), nie precedensem do rozszerzania.
- Czego baner nie załatwia: `X-Frame-Options: DENY` + CSP `frame-ancestors` w `public/_headers`.
  Bez nich stronę `/c/<klient>` da się osadzić w cudzej ramce z pominięciem całego chrome'u hosta,
  razem z banerem.

## Nazwa, domena, SEO

- **„Sandstr" to nazwa finalna** (2026-07-28). Domena produkcyjna **`sandstr.app`** (2026-08-03).
  `sandstr.com` jest zajęta przez niezwiązany fintech („SAND", najem krótkoterminowy, Wix, od
  2025-08) — inna branża, brak kolizji, ale i brak szans na drop. **Nie planuj `.com`.**
- **Indeksowalne są DWIE strony: `/` i `/compare`** (od 2026-08-14). `Disallow: /c/` stoi
  niezmieniony — i to nie jest furtka, tylko rozróżnienie rodzaju: `/c/damus` to pikselowo wierny
  klon cudzej apki i nie wolno go z nią pomylić, a `/compare` to ocytowana i datowana proza o tym,
  co klienci potrafią. `public/robots.txt` mówi to wprost, `public/sitemap.xml` ma dwa URL-e
  i celowo nie ma `<lastmod>`.
- W `index.html` `canonical`/`og:url` dalej wskazują galerię, ale to już tylko SZABLON.
  `scripts/prerender.mjs` nadpisuje `title`, `description`, `canonical` i `og:*` **per strona**
  i asertuje, że każdy z tych tagów występuje dokładnie raz, zanim go podmieni. Zostawienie ich
  nietkniętych skanonikalizowałoby `/compare` do `/` — czyli instrukcja „porzuć tę stronę".
  `og:image` = `https://sandstr.app/og.png` (1200×630, z `scripts/og-image.html`) jest wspólny.
- **Obie strony są prerenderowane** (`dist/index.html`, `dist/compare/index.html`) — SPA oddaje
  crawlerowi puste `#root`, a poza Google prawie nikt nie dorenderowuje JS. `/compare` renderuje
  `CompareStatic`, który współdzieli tabelę i prozę z żywym widokiem, więc nie może się rozjechać.
- **Strona indeksowalna musi mieć dozwolone wyjście.** Prerenderowane `/compare` nie ma `Layoutu`,
  więc nie ma nagłówka ani stopki, a wszystkie pozostałe linki celują pod `/c/` — czyli w `Disallow`.
  Bez `BackToShelf` crawler lądował w ślepym zaułku. Sprawdzaj to przy każdej nowej trasie.
- **Karty share są per klient od 2026-08-14, `og:url` NIE jest już przypięty do galerii.**
  `scripts/prerender.mjs` kopiuje `index.html` do `dist/c/<id>.html` i nadpisuje `<title>`,
  `description`, `og:url`, `og:title`, `og:description`, `og:image`, `og:image:alt` z
  `shareRoutes()` (`src/entry-server.tsx`); teksty stoją w `src/shareMeta.ts` i czyta je też
  `ClientView` dla `document.title`. Reszta tagów (`og:type`, `og:site_name`, `twitter:card`,
  JSON-LD, canonical) jest wspólna. Plik nazywa się `<id>.html`, **nie** `<id>/index.html` —
  przy `html_handling: auto-trailing-slash` folder-index robi 307 z `/c/damus` na `/c/damus/`
  i psuje dokładnie ten URL, który ludzie wklejają. Zmiana nazwy któregokolwiek z tych tagów
  **wywala build**, zamiast wypuścić dwanaście kart reklamujących galerię.
- Obrazki: `public/og/<id>.png`, generator `scripts/og-client-cards.mjs` (`npm run og:cards`,
  ręcznie — nie w `npm run build`, bo robi build i woła headless Chrome). Karta **pokazuje
  reprodukcję**, ale NIGDY pełnoekranowo: zrzut zawsze siedzi w rysowanym przez nas urządzeniu —
  telefon w perspektywie dla mobile, okno przeglądarki z paskiem `sandstr.app/c/<id>` dla web
  i desktop. To jest cała różnica prawna: urządzenie czyta się jako „ekran POKAZUJĄCY X",
  pełne kadrowanie jako „to JEST X". Reszta kadru jest nasza (lockup, tło, poświata akcentu),
  a piksele są z NASZEJ reprodukcji — żadnych materiałów upstreamu. To jedyna powierzchnia,
  która podróżuje bez banera, bez linku wyjściowego i bez paska adresu, więc mitygacja jest
  wypalona w obrazek:
  amber pas „SIMULATION · UNOFFICIAL · MOCK DATA · NOT AFFILIATED WITH &lt;NAZWA&gt;" plus pigułka
  na kartach `preview` i archiwalnych. Nowa pozycja w `THIRD-PARTY.md` („Client icons on share
  cards") to zapisuje; ścieżka wycofania znaku maintainera = usuń ikonę, generator schodzi na
  emoji/monogram.
- `public/robots.txt` ma dwa wyjątki: `Twitterbot` i `facebookexternalhit`. To **renderery kart,
  nie indeksery** — X sam dokumentuje, że Twitterbot implementuje spec robots.txt i przy
  `Disallow` nie pokazuje karty w ogóle, więc `Disallow: /c/` po cichu kasował każdy podgląd
  deep linku na X. Nazwana grupa user-agenta **zastępuje** grupę `*`, więc te dwie linijki to
  całość polityki, którą widzą. Discord/Telegram/Slack nie czytają tego pliku — nie dopisuj ich.
  Decyzja „`/c/` poza indeksem" stoi nienaruszona.
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
- **Cztery pliki prawne — `LICENSE`, `PRIVACY.md`, `TRADEMARKS.md`, `THIRD-PARTY.md` — są
  podlinkowane ze stopki** (`src/host/Layout.tsx:126-141`, przez `repoFileUrl()` z
  `src/host/contribute.ts`). Dodając piąty, dopisz go tam. Nie linkuj naiwnie `href="/PRIVACY.md"` —
  `wrangler.jsonc` ma `not_found_handling: "single-page-application"`, więc taki link po cichu
  wyrenderuje galerię; idź przez blob-URL GitHuba albo skopiuj plik do `public/`.
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

1. Widok klienta renderuje baner z `data-tour-keep-clear` i `z-[var(--z-disclaimer)]`
   (goła liczba `z-[…]` w `src/host/` jest zakazana — patrz `CLAUDE.md`).
2. Klient ma wiersz w `THIRD-PARTY.md` i działający link wyjściowy w `src/registry.tsx`.
3. Nic nowego nie trafiło do JSON-LD. Do `sitemap.xml` trafia tylko strona, która jest
   prerenderowana, ma własny `canonical` i ma dozwolony link wyjściowy — dziś `/` i `/compare`.
   Reprodukcje zostają pod `Disallow: /c/` (wyjątki dla Twitterbota i facebookexternalhit to
   renderery kart — nie dopisuj tam indeksera).
4. Nowy albo przemianowany klient: `npm run og:cards`, bo inaczej jego `og:image` wskazuje na
   404 i share pokazuje kartę bez obrazka.
5. Żadna mock-tożsamość nie wskazuje na realnego człowieka ani identyfikator płatności.
6. Nic nie poszło na zewnątrz bez decyzji właściciela.
7. Nowy parametr trasy `/c/<id>`: nie chowa banera ani wyjścia, jest w tabeli w `docs/OUTREACH.md`
   i w kreatorze, i nie pozwala wpisać własnego tekstu NAD reprodukcją.
