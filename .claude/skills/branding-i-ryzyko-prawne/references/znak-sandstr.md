# Znak sandstr — ograniczenia i stan

Zapis z przeglądu 2026-07-27 (9 propozycji B/W, potem 2 kierunki × 3 warianty) plus to, co realnie
stoi w repo. Czytaj przed każdą zmianą w `src/host/brand/`.

## Stan: rozstrzygnięte i zaimplementowane

- **Kierunek A: trzy cofające się panele przecięte jedną ciągłą falą.** `src/host/brand/SandstrMark.tsx`
  — czysty inline SVG, bez rastra i bez zależności runtime, więc offline- i CSP-safe. Panele to quady
  ze skośnymi krawędziami; fala jest jedną krzywą przez cały znak, więc jej faza przechodzi przez
  przerwy między panelami (stąd osobny `userSpaceOnUse` gradient na panel).
- **Lockup = `src/host/brand/SandstrLogo.tsx`** (mark + wordmark; x-height wordmarku to 0.55 wysokości
  znaku). To on, a nie `SandstrMark`, jest importowany w produkcie, i dokładnie raz:
  `src/host/Layout.tsx:34`, `size={26}`. `tone="mono"` maluje płaski `currentColor` (favicon, druk,
  1-bit) — ograniczenie 16px sprawdzaj na tym wariancie, bo gradienty go nie ratują.
- **Paleta 3**, tokeny w `src/host/brand/tokens.ts`: `obsidian #0B0B10`, `surface #15161D`,
  `primary #7C68F2`, `sand #E7C27A`, `muted #A1A1AA`, `ink #0F1115`; stopy gradientu znaku w
  `markGradient` (`purpleFrom #8A63F5`, `purpleTo #7350E8`, `sandFrom #F0CE86`, `sandTo #E7C27A`,
  `blend #8266E2`).
- **Sand jako kolor UI działa tylko na ciemnym tle** — na białym szarzeje, więc light mode zostaje
  w rodzinie fioletu. Wzorzec do skopiowania stoi w `src/host/Gallery.tsx:123`: gradient nagłówka to
  `from-brand-primary to-[#5B45D9]`, a `to-brand-sand` wchodzi dopiero pod `dark:`. (Wewnątrz samego
  znaku sand jest legalny w obu motywach — leży na fioletowym panelu, nie na tle strony.)
- **Tokeny marki należą do chrome'u hosta.** Nagłówek `tokens.ts` mówi wprost: nic stąd nie może
  wyciekać do `src/simulators/` — symulatory mają własne, client-accurate tokeny (`docs/FIDELITY.md`).
- W `tailwind.config.js` `brand.*` jest **namespace'em dodanym obok** istniejących kluczy kolorów
  (linia 49). Istniejące klucze są load-bearing dla klas utility w symulatorach — nie przesuwaj ich.
- **Wordmark to wektor, nie font**: `src/host/brand/SandstrWordmark.tsx` jest przerysowany na siatce
  (x-height 100, stroke 20, ascender 133, baseline y=123), więc nie ma licencji fontu do dźwigania
  i renderuje się identycznie na każdej platformie. Dawna pozycja otwarta „potrzebny geometryczny
  sans / działa tylko tam, gdzie zainstalowana jest Futura" jest **zamknięta** — nie odgrzewaj jej.
  Ścieżki to stroked centrelines, nie wypełnione kontury; jeśli kiedyś ktoś potrzebuje prawdziwych
  outline'ów (cięcie, haft, folia), rozwija się je dopiero na tym etapie.

## Twarde ograniczenia dla każdego znaku sandstr

1. **Zero obrazowania degradacji** („gładkie → poszarpane → gruz"). Sześć z dziewięciu propozycji
   rundy 1 rysowało dokładnie to. Obrazuje **generation loss** — dokładną odwrotność tezy produktu
   (wierna reprodukcja) i fatalny pierwszy slajd dla strategii opt-in z zespołami klientów. Jeśli
   w ogóle używasz motywu ziarna/pikseli, kierunek czytania musi biec ziarna → uformowany kształt
   (ziarna po LEWEJ, ruch scala się do środka), nigdy odwrotnie.
2. **Kolizje, sprawdzone bezpośrednim renderem:**
   - Fasetowana bryła rozcięta cienkimi jasnymi szwami **to własne urządzenie Damusa**
     (`src/simulators/damus/components/DamusLogo.tsx` — u niego niskopoligonowy klejnot w gradiencie
     `#30B3F1`→`#C539F9`, więc inna barwa tego nie rozbraja: kolizja jest w formie). Przy 16px nie do
     odróżnienia od Damusa ani od kanciastego glifu YakiHonne
     (`src/simulators/yakihonne/components/YakiLogo.tsx`), a fasetowany klejnot dodatkowo **jest**
     nazwą Amethysta.
   - Trzy równoległe pasy układające się w S = własny opis znaku Solany, najgorzej ze ścięciem 45°.
     Nigdy nie koloruj jednego pasa z trzech i nie przeciągaj gradientu w poprzek równoległych
     elementów.
   - Ułożone sinusoidy = `lucide waves` (jest w `node_modules` tego repo). Trzy przesunięte panele
     = `lucide square-stack`, a Replit zajmuje tę formę w przestrzeni „odpal to w przeglądarce".
     Każde przejście falą trzymaj jako pojedynczą krzywą S.
   - **WYCOFANE:** „koncentryczne/pasmowe S czyta się jak swirl Primala" jest FAŁSZEM. Znak Primala
     (`src/simulators/primal/web/components/PrimalLogo.tsx`) to jeden wypełniony dysk z wycięciem —
     jeden kontur, symbol, nie litera. Ta flaga wzięła się ze słowa „swirl", nie z kształtu, i
     niesłusznie zabiła dobry znak w rundzie 1.
   - Żaden z hostowanych znaków nie jest literą, więc monogram **jest** odróżnialny od półki — ale
     samo „S" jest sporne na ekranie z Snortem (oraz Shopstr, Stacker News), więc znak literowy musi
     zawsze łączyć się z wordmarkiem i nigdy nie shipować solo.
3. **Musi przetrwać 24px i 16px.** Skaluj w dół, zanim zaczniesz oceniać estetykę: to wyeliminowało
   5 z 9 propozycji przed jakąkolwiek dyskusją o guście. Ofiarą padają zwykle włosowe linie
   i odłączone elementy podpikselowe.
4. **Panele nigdy w perspektywie.** Pełne czworokąty w perspektywie rozdzielone białymi przerwami
   = znak Microsoft Windows. Tylko front-on.
5. **Fala przecinająca panele musi być cienka i ciągła.** Gruba czyta się jak pęknięcie ekranu —
   najgorszy możliwy komunikat dla produktu o wierności.

## Pozycja wciąż otwarta

Kolizyjny check webowy dla przebudowanego kierunku A nigdy nie został dokończony.
