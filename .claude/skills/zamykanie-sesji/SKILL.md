---
name: zamykanie-sesji
description: Domknięcie sesji albo większego kawałka pracy — retro, log decyzji, notatka przekazania, otwarte wątki. Użyj gdy padnie „kończymy", „podsumuj sesję", „retro", „co zostało otwarte", „notatka na start kolejnej sesji", i proponuj to SAM (nie czekając aż poproszę), gdy zadanie jest domknięte, gałąź gotowa do złożenia albo rozmowa dobiega końca. Także gdy promujesz wniosek z sesji do pamięci projektu (`MEMORY.md`), do `docs/` albo do `CLAUDE.local.md`.
---

# Zamykanie sesji

## Kiedy to odpalasz

Sam, bez proszenia: gdy zadanie jest domknięte, gdy większy kawałek pracy jest gotowy do złożenia albo
gdy rozmowa wyraźnie się kończy. Czekając na prośbę tracisz wiedzę razem z kontekstem — człowiek
pamięta wynik, nie powody, i za miesiąc podejmuje tę samą decyzję od zera. Zaproponuj jedną linijką
i czekaj na „tak"; nie zasypuj czterema sekcjami rozmowy, która trwa dalej.

Ciężar dobierz do wagi pracy: po drobnej poprawce wystarczy zdanie i „następny krok", pełny komplet
należy się sesji, w którą ktoś musi wejść bez tego kontekstu.

## Cztery artefakty

Zawsze w tej kolejności — retro wskazuje decyzje, decyzje karmią notatkę, reszta zostaje otwarta.

### 1. Retro
Bez tego powtarzasz tę samą ślepą uliczkę w kolejnej sesji. Retro bez ani jednej pozycji po stronie
agenta nie znaczy „poszło idealnie" — znaczy, że nie patrzyłeś; napisz je od tej pozycji.

```
Retro — <sesja / kawałek pracy>
Osiągnięte: <fakty, nie intencje: co realnie działa>
Poszło dobrze: <co konkretnie powtórzyć następnym razem>
Nieefektywne po mojej stronie (agent): <ślepe uliczki, brak dopytania, ceremoniał ponad potrzebę,
  w czym mogłem lepiej Cię poprowadzić — zaproponować kierunek zamiast czekać na instrukcję>
Nieefektywne po Twojej stronie (człowiek): <czego zabrakło w kontekście albo w decyzji, co blokowało>
Inaczej następnym razem: <zmiana zachowania, wykonywalna — nie „będziemy uważniejsi">
```

### 2. Log decyzji
Decyzja bez uzasadnienia jest bezwartościowa — za miesiąc nikt nie wie, czy wolno ją zmienić.

```
Log decyzji
- <decyzja> — bo <powód>
  odrzucone: <alternatywa> — bo <powód odrzucenia>
  wyzwalacz rewizji: <co musiałoby się zmienić, żeby wrócić do tematu>
```

### 3. Notatka przekazania
Piszesz ją do **wklejenia** na start kolejnej sesji, nie do czytania — żadnej narracji, żadnych
podziękowań, sam stan operacyjny.

```
Stan: <gdzie jesteśmy, jedno zdanie>
Działa (zweryfikowane): <co + czym to potwierdziłeś>
Niezweryfikowane / założenia: <co wygląda na zrobione, ale nikt tego nie odpalił>
W toku: <plik/miejsce + co dokładnie zostało do zrobienia>
Następny krok: <jedno zdanie, wykonywalne bez tej rozmowy>
Kontekst do przeczytania najpierw: <pliki/dokumenty>
```

### 4. Otwarte wątki
Rozdziel dwie rzeczy, bo mieszanie ich zamienia zamrożoną decyzję w wieczne re-litygowanie:

```
Nierozstrzygnięte (czekają na decyzję człowieka): <lista>
Świadomie zamrożone (NIE wracaj bez wyzwalacza): <decyzja> — wyzwalacz odmrożenia: <warunek>
```

## Gdzie to ląduje

Zaproponuj miejsce, **wyboru dokonuje człowiek**:

- **Tekst w czacie** — domyślne, zero skutków ubocznych. Notatka przekazania i tak jest do wklejenia
  na start kolejnej sesji, więc czat jej wystarcza.
- **Pamięć projektu** (katalog `memory/` tego projektu — ścieżkę masz w kontekście sesji) — tylko dla wniosku,
  który przeżyje wiele sesji, i tylko w formacie tego katalogu: **jeden plik na wniosek** + jedna linijka
  `- [Tytuł](plik.md) — po co to` dopisana do `MEMORY.md` (to indeks linków, nie wysypisko treści).
  Stan jednego zadania tam nie idzie.
- **`docs/`** — tylko na wyraźne „tak" i tylko gdy wniosek należy do istniejącego tematu: `AUDIT.md`,
  `FAQ.md`, `FIDELITY.md`, `GAPS.md`, `TOURS.md`, `COMPARE.md`, `VERSIONS.md`,
  `gaps/<klient>.md`, `refs/<klient>/screen-map.md`, `clips/`. Retro ani notatka przekazania **nie są
  tematem** — nie zakładaj dla nich nowego pliku w `docs/`.
- **`CLAUDE.local.md`** (gitignorowany) — osobiste i lokalne notatki. `CLAUDE.md` mówi wprost, że idą
  właśnie tam, „nie tutaj" — nie doklejaj podsumowania sesji do `CLAUDE.md`.

## Czego NIE robisz

- **Nie commituj, nie mergeuj, nie pushuj, nie zamykaj gałęzi/PR-a i nic nie kasuj** „przy okazji"
  podsumowania — podsumowanie to tekst, nie akcja, a domykanie jest tym momentem, w którym najłatwiej
  wykonać nieodwracalny ruch, o który nikt nie prosił. Dotyczy też zapisu „małej notatki" do repo.
- **Nie wpisuj do „Działa" niczego, czego w tej sesji nie potwierdziłeś** dowodem — inaczej kolejna
  sesja startuje z fałszywego stanu. Dowód ma tu konkretny kształt (CLAUDE.md → Definition of done):
  output `npm run build`, klik po kliku w dotkniętym symulatorze przy **0 błędach w konsoli**, a przy
  zmianach typów **osobno `npm run typecheck`** — `vite build` (esbuild) typów nie sprawdza, więc
  „build przeszedł" nie znaczy „typy czyste". Reszta idzie do „Niezweryfikowane / założenia".
- **Nie zgaduj, w którym checkoucie jesteś.** Kilka sesji agenta dzieli tu jeden `.git`, a worktree'y
  bywają recyklowane w trakcie — który z nich trzyma `main`, sprawdzasz **`git worktree list`**, nie
  pamięcią. Pisząc „gałąź gotowa do złożenia" podaj **nazwę gałęzi i ścieżkę worktree**, bo kolejna
  sesja startuje gdzie indziej. Samego złożenia nadal nie robisz.
- **Nie odgrzewaj decyzji zamrożonych** — bez wyzwalacza odmrożenia idą do „zamrożonych", nie do
  „nierozstrzygniętych".
- Jeśli człowiek jednak poprosi o commit, **konwencję odczytaj z `git log --oneline -20`** zamiast
  wymyślać własną: dziś jest to `typ(zakres): temat po polsku` (`feat(faq)`, `fix(tour)`,
  `docs(tours)`, `tooling(clips)`), a merge to `Merge: <opis>`.

Przeczytaj `references/pytania-do-retro.md`, gdy retro wychodzi grzeczne i ogólne albo gdy sesja była
długa i chcesz z niej wycisnąć konkret.
