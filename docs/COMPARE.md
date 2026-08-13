# Sandstr — /compare (capability matrix + note strip)

> **What it is.** A third host surface next to the gallery and the client view. The gallery answers
> "what is there"; the per-client FAQ answers "how do I do X in this one". Neither answers the
> question people actually arrive with — **which client should I use** — which is 13% of `#asknostr`
> (1932 sampled notes, [`OUTREACH.md`](OUTREACH.md)), the fourth-biggest topic on the tag.
>
> Built 2026-08-13 as a prototype, deliberately from data that already existed: no new recon, no new
> source of truth.

## The three sections

1. **Chooser** — five questions (one platform, four capabilities) that narrow the set.
2. **Capability matrix** — 9 axes × 8 clients, one glyph per cell; picking a cell prints the claim,
   links to the FAQ answer behind it, and dates it.
3. **Note strip** — the same mock note rendered by each client's own note card.

The strip is the part nothing else can do. Every simulator already reads `src/data/mock`, so the
note is genuinely identical and only the chrome differs — a side-by-side that would otherwise need
eight devices and eight accounts.

## Data contract

`src/data/capabilities.ts`. Read its header before editing; the rules in short:

- **Grounded in the FAQ banks, never in our simulators.** The FAQ describes the real apps
  (`src/data/faq/README.md` grounding tiers). The simulator is a subset of the real client —
  `docs/GAPS.md` counts 145 `missing` rows — so reading a verdict off the sim would ship false
  claims about someone else's product.
- **Four verdicts, and `unknown` is load-bearing.** `yes` / `partial` / `no` / `unknown`. Where the
  cited answer neither shows the feature nor denies it, the cell says so. Inferring absence from
  silence is the one thing the FAQ contract forbids, and a matrix cell reads as a claim even when it
  is a shrug. 5 of 72 cells are `unknown` today; they are the recon backlog.
- **Citation per cell.** `source` names an entry id in that client's FAQ bank, rendered as a link to
  `/c/<client>?faq=<entry>`. Dev-validated at import — a renamed entry logs an error instead of
  silently linking nowhere.
- **Date per claim.** Not stored here: `ClientEntry.reproduces` in `src/registry.tsx` ('v1.12.6',
  'as of Jul 2026'), printed beside every client. A capability claim about someone else's product
  with no version and no date decays into a false statement the moment they ship.
- **Compiler-enforced coverage.** `Record<AxisId, CapabilityCell>` — adding an axis breaks all eight
  client blocks until each one answers it, exactly like `ClientFaq.coverage`.

Scope is the eight `ready` clients. Keychat and Gossip have no screen-map and no FAQ, so there is
nothing to ground a claim in; the page says that rather than leaving a gap.

## Note strip gotcha

**The eight theme sheets disagree about how the theme is applied.** Damus and Coracle key off a
class (`.damus-simulator.dark`); Amethyst and YakiHonne key off an attribute
(`.amethyst-simulator[data-theme="dark"]`). Every simulator root sets *both*, which is why this
never surfaced before — setting only the class rendered Amethyst light on a dark page and YakiHonne
dark against its own light default. `CompareView` sets both, from `ClientEntry.defaultTheme`.

Cards render in the **client's** shipping default, not the host's theme: a strip that repainted
every card in the host theme would compare sandstr with itself, and YakiHonne's sheet has no dark
variant at all.

The mandated disclaimer rides the strip once for the whole section (host wording, verbatim) — these
are brand-faithful reproductions rendered outside `/c/`.

## Open

- **`robots.txt` / `sitemap.xml` untouched.** `Disallow: /c/` stands, and `/compare` is exactly the
  surface that *should* rank — a sourced, dated, disclaimered text page about a client is a
  different SEO object from a pixel-faithful clone. Flipping that is a publishing decision, not a
  prototype's to make. See "Open" in [`OUTREACH.md`](OUTREACH.md).
- **No per-client availability field.** The chooser's platform question filters the *reproduction*
  (`SimulatorConfig.platform`), not where the real client runs — YakiHonne is reproduced from its
  iOS app but also runs in a browser. Fixing it properly needs a data field on `ClientEntry`, not a
  cleverer query. Every result prints the real client's `installNote` meanwhile.
- **9 axes is the prototype's width, not the ceiling.** The mute family carries four of them because
  `mute` was the one FAQ topic written to enumerate kinds per client. Widening the matrix means
  writing that kind of enumerating answer for more topics first.
