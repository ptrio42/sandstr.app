# Sandstr — /compare (capability matrix + note strip)

> **What it is.** A third host surface next to the gallery and the client view. The gallery answers
> "what is there"; the per-client FAQ answers "how do I do X in this one". Neither answers the
> question people actually arrive with — **which client should I use** — which is 13% of `#asknostr`
> (1932 sampled notes, [`OUTREACH.md`](OUTREACH.md)), the fourth-biggest topic on the tag.
>
> Built 2026-08-13 as a prototype, deliberately from data that already existed: no new recon, no new
> source of truth.

## The three sections

1. **Chooser** — six questions (one platform, five capabilities) that narrow the set.
2. **Capability matrix** — 11 axes × 8 clients = 88 cells, one glyph each; picking a cell prints the
   claim, links to the FAQ answer behind it, and dates it. Tally today: 53 `yes`, 23 `no`,
   11 `partial`, **1 `unknown`**.
3. **Side-by-side strip** — one part of the interface, in every client at once, switchable between
   four surfaces.

The strip is the part nothing else can do. Every simulator already reads `src/data/mock`, so the
note is genuinely identical and only the chrome differs — a side-by-side that would otherwise need
eight devices and eight accounts.

## Surfaces

`src/host/compare/surfaces/` — one module per surface, registered in `index.ts`, contract in
`types.ts`. Each cell mounts **that client's own component**; a lookalike built here would compare
our two guesses instead of their two designs.

| Surface | What it mounts | Coverage |
|---|---|---|
| The first screen | `LoginScreen` / `WelcomeScreen` | 8/8 |
| A note | `NoteCard` / `PostCard` / `MaterialCard` | 8/8 |
| Writing a post | `ComposeScreen` / `ComposeBox` / `ComposeSheet` | 8/8 |
| Getting around | `TabBar` / `BottomNav` / `BottomBar` / `LeftSidebar` / `Rail` | 7/8 |

**Coracle has no navigation cell**, and the page says so in place of the tile. Its sidebar is written
inline in `CoracleSimulator.tsx`, closed over screen, modal, auth and submenu state; extracting it is
a refactor of a `ready` client, not the one-line `export` that Snort's `Rail` needed. Adding a
lookalike instead would break the rule the whole page runs on.

Three clients need a shape mapper on the note surface (Primal's `PNote`, YakiHonne's `YakiNoteData`,
Amethyst's `PostData`) because their card predates the shared `MockNote` plumbing.

### Sizing

`ScaledFrame` renders each surface at its **natural** size and scales the whole thing down —
390×720 for a phone, 1022×640 for a web client, which is exactly what a frameless client gets inside
`ClientView`'s card. Letting a web layout reflow into a 350px column would not be that client's
design at all: it would be its mobile breakpoint, and `SnortSimulator` measures its own root to
decide which one to mount.

Two consequences: a surface wider than 600px **takes the whole row** (a 1022px screen at a third of
the grid scales to ~34%, which next to a phone at 90% reads as "this client is smaller" rather than
"this client is wider"), and the scale is **capped at 1** so a full row never blows a client up past
its own design size.

`ScaledFrame` measures with a callback ref plus a `ResizeObserver`, not a one-shot effect — the
cells mount inside a grid that is still settling. Its `transform: scale()` also establishes a
containing block, so a `position: fixed` overlay inside a composer resolves against the cell instead
of the browser window (CLAUDE.md's Keychat gotcha, solved for free).

The note surface is the exception: fluid, laid out at the column's own width, read at 1:1.

> **When adding a surface, import its theme sheet in `surfaces/index.ts`.** The leaf components
> mostly do not import their own, only the simulator roots do. A missing sheet passes typecheck and
> passes the build, and renders that client unstyled.

## Data contract

`src/data/capabilities.ts`. Read its header before editing; the rules in short:

- **Grounded in the FAQ banks, never in our simulators.** The FAQ describes the real apps
  (`src/data/faq/README.md` grounding tiers). The simulator is a subset of the real client —
  `docs/GAPS.md` counts 145 `missing` rows — so reading a verdict off the sim would ship false
  claims about someone else's product.
- **Four verdicts, and `unknown` is load-bearing.** `yes` / `partial` / `no` / `unknown`. Where the
  sources neither show the feature nor deny it, the cell says so. Inferring absence from silence is
  the one thing the FAQ contract forbids, and a matrix cell reads as a claim even when it is a shrug.
  Exactly one cell is `unknown` today — Coracle's built-in wallet — and it names the pass that would
  settle it.
- **Citation per cell.** `source` names an entry id in that client's FAQ bank, rendered as a link to
  `/c/<client>?faq=<entry>`. Dev-validated at import — a renamed entry logs an error instead of
  silently linking nowhere.
- **`grounding` when the FAQ answer does not carry the claim.** Six cells cite
  `docs/refs/<client>/screen-map.md` directly, because the FAQ entry they link to was written to
  answer a neighbouring question. Upgrading a verdict while still citing only the FAQ would make
  `source` a lie — the reader clicks through and finds an answer that does not say that. The link
  stays; the real grounding prints beside it.
- **Date per claim.** Not stored here: `ClientEntry.reproduces` in `src/registry.tsx` ('v1.12.6',
  'as of Jul 2026'), printed beside every client. A capability claim about someone else's product
  with no version and no date decays into a false statement the moment they ship.
- **Compiler-enforced coverage.** `Record<AxisId, CapabilityCell>` — adding an axis breaks all eight
  client blocks until each one answers it, exactly like `ClientFaq.coverage`.

Scope is the eight `ready` clients. Keychat and Gossip have no screen-map and no FAQ, so there is
nothing to ground a claim in; the page says that rather than leaving a gap.

### Theme gotcha

**The eight theme sheets disagree about how the theme is applied.** Damus and Coracle key off a
class (`.damus-simulator.dark`); Amethyst and YakiHonne key off an attribute
(`.amethyst-simulator[data-theme="dark"]`). Every simulator root sets *both*, which is why this
never surfaced before — setting only the class rendered Amethyst light on a dark page and YakiHonne
dark against its own light default. Every cell sets both, from `ClientEntry.defaultTheme`.

Cells render in the **client's** shipping default, not the host's theme: a strip that repainted
every card in the host theme would compare sandstr with itself, and YakiHonne's sheet has no dark
variant at all.

The mandated disclaimer rides the strip once for the whole section (host wording, verbatim) — these
are brand-faithful reproductions rendered outside `/c/`.

## Open

- **`robots.txt` / `sitemap.xml` untouched.** `Disallow: /c/` stands, and `/compare` is exactly the
  surface that *should* rank — a sourced, dated, disclaimered text page about a client is a
  different SEO object from a pixel-faithful clone. Flipping that is a publishing decision, not a
  prototype's to make. See "Open" in [`OUTREACH.md`](OUTREACH.md).
- **Widening past 11 axes needs recon, not UI.** The mute family carries three rows and sign-in
  three because those are the FAQ topics written to *enumerate kinds* per client; the rest of the
  bank describes one path each, which grounds a verdict for the client it was written about and
  nothing comparative. The next axes (timed mutes, whether a mute list publishes to relays, NIP-17
  DMs, DM request inboxes) each need a pass over the eight screen-maps first. That is the cost, and
  it is the honest one.
- **One `unknown` left.** Coracle's `/settings/wallet` is the only settings page the screen-map
  lists without enumerating its fields. Resolving it means reading `coracle-social/coracle`.

## Resolved

- **Per-client availability** — `ClientEntry.availableOn` (`ios` / `android` / `web`), read off each
  entry's already-verified `installNote`. The chooser filters on that, not on `platform`.
  `platform` says which build this shelf *reproduces* — YakiHonne from its iOS app, Primal from its
  web app — and filtering on it hid clients that do run on the device being asked about. The two
  fields must be edited together.
