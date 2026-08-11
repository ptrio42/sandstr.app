# Powłoka `/c/:id` i kontrakt warstw

Czytaj, gdy: urządzenie się przycina lub jest za małe, strona klienta zaczyna scrollować, modal sima
wychodzi poza ramkę, albo dodajesz pływające UI hosta (rail, sheet, paleta).

## Łańcuch flex — każde ogniwo jest load-bearing

`/c/:id` jest **nieprzewijalną powłoką aplikacji**, nie dokumentem. `h-full` urządzenia rozsypie się,
jeśli zerwiesz którekolwiek ogniwo:

1. `.sandstr-shell` — `height: 100vh`, pod `@supports` `100dvh` (`src/index.css`).
2. root `Layout` — `sandstr-shell flex flex-col overflow-hidden` (tylko na trasie klienta;
   galeria zostaje zwykłym `min-h-screen` dokumentem).
3. `main` w `ClientView` — `flex w-full min-h-0 flex-1 flex-col overflow-hidden`.
4. rząd sceny — `mx-auto flex min-h-0 w-full max-w-6xl flex-1 items-stretch justify-center`.
5. urządzenie — `h-full`.

Header ma `shrink-0` i `max-sm:hidden` na trasie klienta; footer w ogóle się tam nie renderuje.

## MobilePhoneFrame

- **Nie edytuj domyślnych w `src/simulators/shared/components/MobilePhoneFrame.tsx:42`**
  (`h-[80vh] max-h-[820px] aspect-[9/19.5] max-w-[92vw]`) — komponent jest współdzielony
  (uwaga: leży w `shared/components/`, nie w samym `shared/`). Host nadpisuje je przez prop `className`,
  bo wewnętrzne `cn()` to clsx + tailwind-merge i rozstrzyga konflikty poprawnie.
- Host podaje `h-full max-h-[900px] max-w-full` plus komplet wariantów `max-sm:` — na telefonie
  urządzeniem jest urządzenie gościa, więc bezel, promień, cień i fejkowe chrome OS znikają.
- **Żadnego `min-height` na urządzeniu.** Rząd sceny ma zawsze definitywną wysokość, więc `h-full` nie
  może się zapaść, a podłoga nie ma już kontenera do scrollowania: `min-h-[420px]` wypchnęło urządzenie
  89px poniżej 285px rzędu (844×390 landscape), na mandatowy disclaimer. Małe urządzenie bije przycięte.
- `ContextPanel` (290px) renderuje się **tylko dla klientów z ramką** i dopiero od `lg`. Doliczenie go do
  tego samego `max-w-6xl` przy web-klientach zagłodziło ich kartę.
- Inset na rail (fixed `left-3`, 58px): `sm:pl-[84px] xl:pl-5` — od `xl` wyśrodkowany box `max-w-6xl`
  i tak zaczyna się za railem (x≥64), więc inset schodzi do zwykłego `pl-5`, zamiast zabierać
  szerokość reprodukcji. Nie jest zerowany, tylko redukowany.

## Animacja podmiany sima

`ClientView.swap()` animuje **wyłącznie `opacity`**, z `key={entry.id}` (enter-only, bez
`AnimatePresence` — ta w tym stacku nie odmontowuje dzieci, a `mode="wait"` zakleszcza się na lazy
dziecku). Żadnego `transform`, nawet `scale: 0.992`: żywy transform czyni ten element containing
blockiem dla każdego `position: fixed` potomka, a po ustaniu animacji framer ustawia `transform: none`
— wtedy backdropy, FAB-y i drawery simów uciekają z urządzenia na hosta.

Karta klientów bez ramki celowo ma `[transform:translateZ(0)]` — tam containing block jest pożądany,
żeby modal web-klienta nie malował po chrome hosta.

## Kontrakt z-index (od dołu)

| warstwa | wartość | gdzie |
| --- | --- | --- |
| wnętrze sima | do ~2000 | przecieka do ROOT stacking context — bezel i karta nie tworzą własnego |
| rail switchera | `z-[3000]` | `ClientSwitcher` |
| paleta ⌘K, mobilny sheet switchera | `z-[8000]` | `CommandPalette`, `ClientSwitcher` |
| backdrop/spotlight toura | `9999` | `src/components/tour/tour.css:13` |
| karta toura | `10002` | `tour.css:105` |
| disclaimer hosta | `z-[10003]` | `Disclaimer` + `DisclaimerStrip` |
| mobilny AboutSheet | `z-[10004]` | `ClientView` |

Disclaimer celowo bije kartę toura — nie wolno go zasłonić. Sam z-index to jednak tylko rozstrzygnięcie
pikseli: nakładaniu zapobiega `data-tour-keep-clear`, które silnik toura traktuje jako przeszkodę przy
liczeniu pozycji karty. Każde nowe chrome hosta, które ma zostać widoczne w trakcie toura, deklaruje się
tym atrybutem.

Aktywny tour wykrywasz z poziomu hosta obserwując `document.body` `MutationObserver`em pod kątem
`.tour-overlay` (portal do body) — host nie ma dostępu do `useTour`, provider siedzi w każdym simie.
Tak robi to `ClientSwitcher` (przygasza rail) i `ClientView` (wznawia panel FAQ po mini-tourze).
