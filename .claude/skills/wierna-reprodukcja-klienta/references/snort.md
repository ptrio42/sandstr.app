# Snort (web) — reprodukcja (ZROBIONE 2026-07-30)

Ground truth: `docs/refs/snort/screen-map.md` (autorytatywny, 19 sekcji, 1267 linii; recording 2026-07-14
+ `v0l/snort@3cc8317`). Luki: `docs/gaps/snort.md`. Kod: `src/simulators/snort/` (12 powierzchni),
tokeny `snort.theme.css`.

- Repo `v0l/snort`, **MIT**, Kieran (`v0l`); `snort.social`. **GitHub jest kanoniczny, `git.v0l.io` to
  mirror.** Tokeny: `packages/app/src/index.css` — **Tailwind v4, blok `@theme{}`**, a `tailwind.config`
  w repo **NIE ISTNIEJE** → to PORT, nie tłumaczenie.
- **Dwa akcenty WSPÓŁISTNIEJĄ:** violet `--highlight` `#ac88ff` (dark) / `#7139f1` (light) obok CTA
  `--primary #ff3f15`. Dawny teal w symulatorze to był błąd — `#1ecbe1` to wyłącznie `--repost`.
- **Reakcja = SERCE `#ef4444`**, nie emoji.
- **Kolejność akcji: reply → repost → heart → [PoW] → zap → avatary zapperów.** Kolor zmieniają **TYLKO
  serce i zap** — `text-nostr-purple` / `-blue` **nie istnieją** w prawdziwym kliencie.
- **Selektor feedu = DROPDOWN.** Nigdzie w Snorcie nie ma tabów z podkreśleniem.
- **Domyślny motyw = `system`** (`Utils/Login/Preferences.ts`), nie dark — baza CSS jest ciemna, ale user
  w light mode widzi jasnego Snorta. Dlatego wpis w rejestrze **celowo nie ma pola `theme`**.
- **Deck mode NIE jest sygnaturą — to martwy kod** (potrójnie zablokowany, `route /deck` nie istnieje).
  Nie buduj na nim i nie opisuj go jako dostępnego trybu.
- **Odtworzone bugi upstreamu:** kafelek Relays w Settings celowo **bez tła** (`bg-dark` + Tailwind v4);
  w light mode `.light button` bije utility Tailwinda, więc prawie wszystkie guziki są białe.
- Naprawione przy rebuildzie: B8 (highlighter + `dangerouslySetInnerHTML` usunięte — Snort nie ma
  kolorowania składni), B9b (scroller), B10 (dolny pasek ≤768px), zero requestów zewnętrznych.
- `configs.ts` niesie stopy `--snort-gradient` (`#a178ff` / `#ff6baf`) jako brand swatch — to świadome,
  robocze tokeny są w `snort.theme.css`.
- Rejestr: `frame: null`, `tour: true`, `status: 'ready'`, bez `theme`, `upstreamLicense: 'MIT'`.

**Gotcha hosta (dotyczy każdego frameless klienta):** host montuje go w karcie `max-w-5xl`, więc sim
dostaje **dokładnie 1022px przy KAŻDYM viewporcie** — progi breakpointów upstreamu (1024 prawa kolumna,
1280 labelki) nigdy się nie spełnią. Skaluj progi do karty. Szerokość mierz **callback-refem +
listenerem `resize`**, nie jednorazowym observerem: wylogowany i zalogowany montują RÓŻNE roota, więc
observer utknie na odłączonym węźle.

**Marka:** struś to raster `nostrich_*.png` — **nie szipuj go bez zgody**, użyj `src/host/ClientGlyph.tsx`.
