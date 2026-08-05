# Sandstr — Biblioteka referencji (ground truth do wiernego odwzorowania)

Każde odwzorowanie klienta bazuje na **dwóch warstwach prawdy**, które się nawzajem sprawdzają:

1. **Screenshoty** (`<client>/shots/`) — jak realna apka *wygląda*: proporcje, kolory, hierarchia, stan domyślny.
   Native (Amethyst, Damus, Keychat, Wisp) → listingi sklepów / repo / realne urządzenie. Web (Snort,
   Coracle, Primal, YakiHonne) → złapane na żywo w przeglądarce. Desktop (Gossip) → `assets/` w repo.
2. **Kod klienta** (open-source) — *czym* element jest i *jak działa*: że „All Follows ▾" to selektor
   feedu (dropdown), a nie logo. Chroni przed plausible-but-wrong z samego obrazka.

## Konwencja

```
docs/refs/<client>/
  screen-map.md   # co jest czym, per ekran/region, z cytatami: plik źródłowy + URL screena
  shots/          # zebrane screeny (nazwa = ekran, np. home-feed.png)
```

**Zasada:** każda decyzja layoutowa w symulatorze cytuje konkretny wpis ze `screen-map.md`. Czytamy
wersję kodu, która jest w sklepie (najnowszy release/tag), nie losowy branch. Zob. proces w
[`../FIDELITY.md`](../FIDELITY.md) (krok 1 „ground truth" + krok 5 „verify side-by-side").
