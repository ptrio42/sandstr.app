---
description: "Host, silnik toura i kontrakt parametrów trasy /c/<id> — kto komu zabiera klawiaturę i nawigację."
paths:
  - "src/host/**"
  - "src/components/tour/**"
  - "src/data/tours/**"
  - "src/data/faq/**"
  - "src/simulators/shared/screenSync.ts"
  - "src/simulators/**/*Simulator.tsx"
  - "src/main.tsx"
---

# Host, tour i demo-linki — zmierzone pułapki

- **Escape należy do warstwy NA WIERZCHU, i to samo `data-sandstr-modal` o tym rozstrzyga.** Każdy
  dialog hosta (FAQ, ⌘K, About, mobilny switcher) stempluje ten atrybut; tour (`TourOverlay`,
  `HOST_MODAL_SELECTOR`) oddaje wtedy **całą** klawiaturę, nie tylko Escape — oba nasłuchy siedzą na
  `window`, więc zamknięcie FAQ kończyło też tour, a Enter na wpisie FAQ rozwijał odpowiedź *i*
  przewijał krok. `ClientSwitcher` rozstrzyga Escape **przed** swoim strażnikiem (jego własny arkusz
  też nosi ten atrybut) i **przed** `tourActive`. Nowy dialog: dodaj atrybut i własny Escape.
- **Tour i mini-tour FAQ PRZEJMUJĄ nawigację klienta** (zmierzone 2026-08-21): tour odpalony na
  ekranie Relays Snorta wrócił do feedu na kroku 3, a `?screen=search&showme=zap` na Wispie otworzył
  arkusz zapa, nigdy search — komendy mini-touru stawiają symulator tam, gdzie żyje ich target.
  Dlatego `?screen=` obok `?tour=1` albo `?showme=` jest klauzulą, która się nie dzieje, i
  `buildDemoUrl` ją wycina. `?faq=` jest wyjątkiem: otwiera tylko nasz panel nad bieżącym ekranem.
- **Słownik ekranów jest CZĘŚCIOWY per klient, a niedopasowanie leci cicho na feed.** `ScreenIntent`
  ma osiem wartości, ale każdy symulator mapuje tylko część (`useScreenSync`, `map:`) — Amethyst
  nie ma `relays`, bo relaye siedzą u niego w szufladzie, nie w zakładce. `?screen=relays` na
  Amethyście **nie jest błędem**, tylko fallbackiem na feed: link wygląda jak działający i nic nie
  robi. Dlatego listy mapowanych intencji **nie duplikuj** — `useScreenSync` publikuje ją przez
  `SCREEN_VOCAB_EVENT` / `mountedScreenIntents()` i tylko z tego czyta picker kreatora. Klient
  zagate'owany na telefonie (frameless < 640px) nie jest zamontowany, więc nie publikuje nic.
- **Zapis w inicjalizatorze `useState` nie może dispatchować eventu, którego nasłuch woła `setState`.**
  `writeScreenIntent` ogłasza zmianę przez `sandstr-screen`, a host na tym siedzi — wywołanie go
  z inicjalizatora dało „Cannot update a component while rendering a different component".
  Stąd `seedScreenIntent` (zapis bez ogłaszania) obok niego; nie sklejaj ich z powrotem w jedno.
- **StrictMode jest wyłączony** (`main.tsx`) — świadomie, by uniknąć podwójnego montowania w stanach
  toura/efektów.

<!-- Wyjęte z sekcji Gotchas w CLAUDE.md 2026-08-21. Treść verbatim; zmienił się tylko moment ładowania. -->
