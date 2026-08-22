---
description: "Zmierzone pułapki wewnątrz symulatorów: warstwy, motyw, dane i scaffolding."
paths:
  - "src/simulators/**"
  - "src/data/mock/**"
  - "src/main.tsx"
  - "src/host/Layout.tsx"
  - "src/index.css"
---

# Symulatory — zmierzone pułapki

- **Hotlinki DiceBear: zostało 12 URL-i, wyłącznie w preview** (9 Keychat, 3 Gossip) — łamią się offline
  i pod ostrym CSP. Klienci `ready` mają lokalne inline-SVG avatary; nie dokładaj nowych hotlinków.
- `useSimulator` (Context+reducer) jest **w większości nieużywany** — symulatory trzymają lokalny
  `useState`. Nie myl scaffoldingu z load-bearing.
- Feed **capuje wyświetlanie do ~25 notatek** (filtry działają na treści/kolejności, nie na liczbie).
- **Dark mode = klasa `dark` na `<html>`**: `main.tsx` ustawia, `Layout` przełącza, `useParentTheme`
  obserwuje. Bez tego symulator utknie w jednym motywie.
- **`position: fixed` w symulatorze = ekran telefonu, nie okno przeglądarki.** Ekran w
  `MobilePhoneFrame` ma `[transform:translateZ(0)]` właśnie po to (bezramkowa scena w `ClientView`
  ma to samo). `relative` + `overflow-hidden` NIE wystarczy — overflow nie przycina `fixed`, dopóki
  ten sam element nie jest jego blokiem zawierającym. Bez tego modal Keychata zaciemniał całą stronę,
  a niewidoczny scrim dropdownu Amethysta zjadał pierwszy klik w panel hosta.
  **…ale tylko dopóki po drodze nie ma DRUGIEGO transformu.** Blok zawierający dla `fixed` tworzy
  *najbliższy* transformowany przodek, a `motion.*` z `layout` albo z animacją wejścia trzyma
  `transform` także w spoczynku. Overlay renderowany wewnątrz takiego komponentu przyklei się do
  NIEGO, nie do ekranu: arkusze `MaterialCard` (share / menu ⋮ / paleta reakcji) lądowały na dole
  karty, na jej szerokość, poza kadrem — i `absolute`, i `fixed` dawały to samo. Reguła: overlay
  wewnątrz komponentu animowanego framerem **portaluj** (`createPortal`) do korzenia symulatora
  i tam dopiero użyj `fixed`; korzeń transformu nie ma. Zanim uwierzysz tej regule w nowym miejscu,
  sprawdź `getComputedStyle(przodek).transform` — arkusz Share nosił ten błąd od dnia powstania.


<!-- Wyjęte z sekcji Gotchas w CLAUDE.md 2026-08-21. Treść verbatim; zmienił się tylko moment ładowania. -->
