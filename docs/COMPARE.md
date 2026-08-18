# Sandstr — /compare (capability matrix + side-by-side surfaces)

> **What it is.** A third host surface next to the gallery and the client view. The gallery answers
> "what is there"; the per-client FAQ answers "how do I do X in this one". Neither answers the
> question people actually arrive with — **which client should I use** — which is 13% of `#asknostr`
> (1932 sampled notes, [`OUTREACH.md`](OUTREACH.md)), the fourth-biggest topic on the tag.
>
> Built 2026-08-13 as a prototype from data that already existed — the FAQ banks and the note cards
> the simulators ship. Taken to full over 2026-08-13/14: four surfaces instead of one, twelve axes
> instead of nine, and — deliberately breaking the "no new recon" constraint it started under — nine
> cells grounded by reading screen-maps and upstream source. That constraint was what made the
> prototype cheap; keeping it would have shipped a table with five shrugs in it.

## The four sections

1. **Chooser** — six questions (one platform, five capabilities) that narrow the set.
2. **Capability matrix** — 12 axes × 8 clients = 96 cells, one glyph each; picking a cell prints the
   claim, links to the FAQ answer behind it, and dates it. Tally today: 57 `yes`, 26 `no`,
   13 `partial`, **0 `unknown`**.
3. **Side-by-side strip** — one part of the interface, in every client at once, switchable between
   four surfaces.
4. **Every answer, in words** — the same 96 claims grouped by capability. This is the part the
   build prerenders, and the reason the page is worth crawling.

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
| Getting around | `TabBar` / `BottomNav` / `BottomBar` / `LeftSidebar` / `Rail` / `Sidebar` | 8/8 |

Two of the eight needed their component freed first, and neither was faked in the meantime. Snort's
`Rail` only needed an `export`. Coracle's sidebar was written inline in `CoracleSimulator`, closed
over screen, modal, auth and submenu state; it now lives in
`coracle/components/Sidebar.tsx` — same markup, same classes, same order, with that state arriving
as props. The submenu stayed **controlled**: the simulator closes it from eight places (every
navigation and most tour commands), so owning it locally would have needed an imperative escape
hatch to reproduce behaviour a prop gives for free.

`Surface.absent` still exists and still prints. Nothing uses it today; it is what let the navigation
surface ship at 7/8 while the extraction was outstanding, instead of shipping a lookalike.

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

  **No cell is `unknown` today, and that is the point rather than a reason to drop the verdict.**
  Five were; they were treated as a work list, and four fell to the screen-maps and one to upstream.
  Keeping `unknown` available is what let the table ship honestly while that work was outstanding —
  the alternative was guessing, or leaving an axis out because one client's cell was awkward.
- **Citation per cell.** `source` names an entry id in that client's FAQ bank, rendered as a link to
  `/c/<client>?faq=<entry>`. Dev-validated at import — a renamed entry logs an error instead of
  silently linking nowhere.
- **`grounding` when the FAQ answer does not carry the claim.** Nine cells cite a deeper source,
  in the two tiers the FAQ contract already uses: `docs/refs/<client>/screen-map.md`, or the
  client's own published source named by file and symbol. Upgrading a verdict while still citing
  only the FAQ would make `source` a lie — the reader clicks through and finds an answer that does
  not say that. The link stays; the real grounding prints beside it.

  The upstream tier is not a fallback for laziness, it is how a comparative axis gets settled at
  all. Screen-maps are **recording-driven**: excellent for anything the camera visited, silent on
  Settings internals. Checking whether Damus, Amethyst and Primal zap on a single tap meant reading
  `NoteZapButton.swift`, `ReusableZapButton.kt` and `NoteFooter.tsx` — three languages, one
  question. All nine clients are open source, so the answer is always available; it costs a pass
  per client, and that cost is the real ceiling on how wide this table gets.
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

- **Widening past 12 axes is upstream work, not UI work.** Three of the four axes tried next —
  timed mutes, whether a mute list publishes to relays, DM request inboxes — are **not in the
  screen-maps for half the clients**, because no recording opened those screens. They are all
  answerable from source (`fast-zap` was), at roughly one reading pass per client per axis. Budget
  it that way or not at all; do not let an axis ship with four `unknown`s to look wider.
- **The chooser asks five capability questions out of twelve axes.** Which five is a product
  judgement, not a data one — `CHOOSER_AXES` in `CompareView.tsx`.

## Indexing

`/compare` is the one page on this site meant to rank, and `Disallow: /c/` is untouched. The
distinction is not a loophole: `/c/damus` is a pixel-faithful clone of someone's app and must never
be mistaken for it, while `/compare` is sourced, dated prose about what clients do. Those are
different objects, and `robots.txt` now says so in as many words.

Three pieces, all of which have to hold together:

- **`scripts/prerender.mjs` emits `dist/compare/index.html`.** A client-rendered SPA hands a crawler
  an empty `#root`; Google runs JS on a second pass, most other crawlers never do. 110 kB of markup
  is baked in at build time, rendered by `CompareStatic` — which shares its table and prose with the
  live page, so the two cannot drift.
- **Its own `<title>`, description, canonical and `og:*`.** The template hard-pins those to the
  gallery. Shipping `/compare` with them untouched would have canonicalised it to `/` — an
  instruction to drop the page — quietly undoing the prerender. `prerender.mjs` asserts each tag is
  present exactly once before swapping it.
- **`sitemap.xml` lists both.** Nothing under `/c/` is listed; asking crawlers to fetch what the
  same site forbids is worse than silence.

### Inbound links

Until 2026-08-14 there was exactly **one** — the gallery's hero — which is close to the worst shape
an indexable page can have. Three now, each covering a case the others cannot:

- **Gallery hero** (`Gallery.tsx`) — the shelf's "not sure which one?" step. In the prerendered
  `dist/index.html`.
- **Layout footer** — every page that has a footer, which is `/` and `/compare`. Deliberately **not**
  `/c/:id`: Layout drops the whole footer there (it cost 81px and was never seen).
- **The FAQ answer itself** (`FaqPanel.tsx`) — "How the other 7 clients do this", linking to
  `/compare?cell=<client>:<axis>`. This is the only route out of a client view, and the strongest of
  the three: someone reading how Damus zaps is one click from how the other seven do. It uses the
  matrix's own `source` mapping in reverse, so there is no new data and a renamed FAQ entry silently
  stops offering the link rather than pointing somewhere wrong. 8 entries per client qualify.

**And one link back.** The prerendered `/compare` is the page body without `Layout`, so it has no
header and no footer, and every other link on it points under `/c/` — which `robots.txt` Disallows.
A crawler landing there had nowhere allowed to go next. `BackToShelf` fixes that, and lives in the
shared module so the static file is never quietly given markup the live page lacks.

## Linkable state

Every part of the page state lives in the query string and is read on arrival:
`?on=ios|android|web`, `?need=<axis,axis>`, `?show=<surface>`, `?cell=<client>:<axis>`. Defaults are
omitted — a link should carry what someone chose, not the state of a page nobody touched — and
unknown values degrade to the unfiltered page rather than a blank one.

This exists for the reply playbook in [`OUTREACH.md`](OUTREACH.md): answering someone in a thread
needs a link that lands on the answer, not on a page they then have to operate.
`?cell=snort:fast-zap` is one claim with its source under it.

**Gotcha found by the test:** state is read once, at mount (`useState` initialiser, not an effect —
so a shared link never paints the unfiltered page first). That means navigating from `/compare` to
`/compare?on=android` **inside the app** is a same-document navigation and does not re-read. A cold
load — which is what a shared link always is — works. Model the cold load when testing it; a
same-document navigation will show you stale state and look like a bug in the feature.

## Resolved

- **Coracle's navigation cell** — its sidebar is now `coracle/components/Sidebar.tsx`. Verified by a
  click-through of `/c/coracle`, not just a build: nav still marks the active item, the footer
  submenu still toggles.
- **The last `unknown`** — Coracle ships no wallet of its own. `UserWallet.svelte` offers "Connect
  Wallet" and reads a balance off whatever is attached; `WalletConnect.svelte` implements exactly
  two routes, `connectWithWebLn` and `connectWithNWC`; `WalletDisconnect.svelte` clears it.
- **Per-client availability** — `ClientEntry.availableOn` (`ios` / `android` / `web`), read off each
  entry's already-verified `installNote`. The chooser filters on that, not on `platform`.
  `platform` says which build this shelf *reproduces* — YakiHonne from its iOS app, Primal from its
  web app — and filtering on it hid clients that do run on the device being asked about. The two
  fields must be edited together.
