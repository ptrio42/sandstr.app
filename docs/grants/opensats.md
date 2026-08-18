# OpenSats grant application — Sandstr (DRAFT)

Written against the official template
(`opensats.org/static/opensats-grant-application-template.md`, downloaded 2026-08-14) for the
form at `opensats.org/apply/grant`. **Status: draft, not submitted.** Items needing the owner's
input are marked **`[OWNER]`** and collected at the bottom.

Window: applications are open the first two months of each quarter, so this one closes
**2026-08-31**. References may be emailed separately to `references@opensats.org` with the
subject `Reference Letter for Sandstr by <name>`; evaluation does not start until two arrive.

Every number below was counted from source on 2026-08-14, not copied from `docs/`. Where a
tracked doc disagrees (`docs/FAQ.md` still says 133 mini-tours), the source count wins.

---

## Project Details

**Project Name:** Sandstr

**Main Focus:** `Nostr`

> Not `Education`. Selecting it makes the form state that OpenSats currently supports only
> *developer-focused* education and switches the grant to monthly reporting. Sandstr is aimed at
> newcomers, not developers, and `Nostr` routes it to The Nostr Fund, which funds "client
> developers, library maintainers, designers".

### Project Description

Sandstr is a browser sandbox for Nostr clients: **try Nostr clients in your browser — no keys,
no install.**

It reproduces the interfaces of real, branded Nostr clients closely enough that a newcomer can
walk a client's actual screens, press its actual controls and read its actual copy — then switch
to the next client and compare — without downloading anything, generating a key, or connecting
to a relay. Eight reproductions are reference-verified (Damus, Amethyst, Primal, YakiHonne,
Snort, Wisp, Coracle, Nostur) and two are clickable early previews (Gossip, Keychat); the gallery
labels each one honestly.

**What it is not, stated first:** Sandstr reproduces *interfaces*, not the protocol. There is no
relay connection, no signature, no cryptography and no backend anywhere in it. Feeds, profiles,
threads and zaps are mock data computed in the visitor's browser. That constraint is not a
shortcut — it is the reason the product needs no key, survives a hostile or absent network, and
can be self-hosted as static files.

The problem it addresses sits *before* onboarding. "Which Nostr client should I use?" is
currently answered by installing three or four apps, generating throwaway keys for each, and
hoping one of them clicks — a chain in which the two riskiest steps for a newcomer (installing an
unfamiliar app, handling a secret key) come *before* any understanding of what the app does.
Sandstr moves the evaluation ahead of both. The client's own interface does the explaining.

Each reference-verified reproduction was rebuilt screen by screen against recordings of the real
app and, where a recording never opened a screen, against the client's own published source, with
the reasoning written down per client in `docs/refs/<client>/screen-map.md` and the brand tokens
traced to their source files in `docs/FIDELITY.md`. On top of that sit:

- **8 guided tours, 80 steps** — the tour drives the simulator, so the visitor watches the client
  being used rather than reading about it.
- **230 curated FAQ answers**, of which **136 carry a replayable in-app demonstration**: the
  answer does not describe where the control is, it takes you there and works it.
- **A per-client gap ledger** — `docs/GAPS.md` and `docs/gaps/<client>.md`, **533 catalogued
  gaps** between each reproduction and the real client, classified and public. It is the
  reproduction's own list of what it does not do.

Design constraints, all enforced rather than promised: no backend, no network requests, no
analytics, no cookies, no account system, no service worker (the shipped CSP pins
`connect-src 'self'`, so a tracker could not phone home even if one were added); a key-safety
tripwire that refuses anything `nsec`-shaped typed into a login field, so the sandbox cannot be
used to harvest a real key; a permanent **"SIMULATION · mock data · unofficial"** banner on every
client view; `Disallow: /c/` in `robots.txt` so a pixel-faithful clone never competes with the
real client in search results; and an outbound link on every client view to the real client's own
site and repository.

Stack: Vite + React + TypeScript, MIT, seven runtime dependencies, static output. 186 commits
between 2026-07-14 and 2026-08-14.

### Potential Impact

**For newcomers.** The first look at Nostr costs one tap instead of an app-store account, an
install and a secret key. That matters most where installing an unknown app is expensive,
metered, blocked, or personally risky — which is also why every client view links out to the real
client rather than trying to keep the visitor.

**For Bitcoin.** Zaps are Lightning's most-used consumer surface, and they are the part of Nostr
newcomers understand last. Every reproduction simulates the zap flow — the button, the amount
sheet, the wallet prompt, the receipt — so someone can see what zapping *is*, and what a
Lightning wallet is for, before owning a single sat. Sandstr is a rehearsal space for the
Bitcoin-native part of Nostr, not just for its feed.

**For client maintainers.** A branded, always-current, zero-risk walkthrough of their own app
that they do not have to build or host, and a public per-client gap ledger that is, in effect,
free UX research on their interface. Consent from each team is the project's stated trademark
posture, and the outbound handoff means the reproduction exists to send users *to* them.

**For the ecosystem's answers.** "How do I mute a word?", "why did my zap fail?", "where are my
relays?" recur constantly under `#asknostr`. Sandstr turns 136 of those into something you can
link — a demonstration that runs in the reader's browser rather than a screenshot of someone
else's phone.

**Scalability.** The expensive part is the per-client reproduction; the tour engine, FAQ format,
gap ledger and host shell are shared and already carry ten clients. Adding a client is a recon
pass plus a screen build, not new infrastructure.

---

## Written References

**Status: being requested. `[OWNER]`**

Candidates, in order of how much their word would mean to OpenSats and how warm the contact
already is:

1. **Barry Deen (Wisp)** — OpenSats published a profile of him on 2026-07-27, and he zapped the
   note that introduced sandstr's Wisp reproduction without objecting.
2. **Fabian Lachman (Nostur)** — zapped the same material without ever being tagged, i.e. he
   found it himself.
3. **A maintainer of a reproduced client who holds an OpenSats long-term-support grant** —
   jb55 (Damus), hodlbod (Coracle), Kieran (Snort), Vitor Pamplona (Amethyst), Mike Dilger
   (Gossip). These are the people OpenSats means by references "from people in the Bitcoin
   community or open-source space who are familiar with you or your project."

Not a candidate: **Gigi (dergigi)** sits on OpenSats' board. He is the funder, not a referee.

The ask must go out before anything else in this document is finished, because it is the only
item whose clock belongs to somebody else. References signed with Nostr or PGP are "a plus" —
worth requesting explicitly, since every candidate here already has a Nostr key.

### Prior Contributions

**`[OWNER]` — needs your list.** What exists in the repo today: sandstr itself was extracted on
2026-07-14 from simulators originally built for the `nostrich.love` Nostr guide (mechanics in
`README.md`). Anything else — earlier open-source work, Nostr contributions, prior clients,
libraries, translations — is not recorded anywhere I can cite, and this field is where "Proof of
Work in the Bitcoin and/or nostr ecosystems" (OpenSats' first tip for improving odds) actually
lands.

**Years of Developer Experience:** `[OWNER]`

---

## Source Code

**Repository:** https://github.com/ptrio42/sandstr.app

**Open-Source License:** MIT — `LICENSE`, "Copyright (c) 2026 ptrio42". Detected as MIT by GitHub.
No upstream client source is vendored, so no reproduced client's GPL/AGPL copyleft is triggered;
the referenced-facts vs copied-expression line is drawn per client in `THIRD-PARTY.md`.

**Project Website:** https://sandstr.app

### Screenshots / Videos

**`[OWNER]` — the one asset gap.** A finished 28.5 s vertical teaser (1080×1920) is tracked in the
repo at `docs/clips/out/sandstr-teaser-vertical.mp4`, with sixteen further FAQ and tour cuts in
the same directory (two tracked, the rest local), produced by a reproducible capture harness
(`docs/clips/`). None of it is published anywhere.
OpenSats "strongly encourage" a ~2-minute narrated video and list it among the five things that
increase funding chances; for a product whose entire value is what it looks like in a browser,
this is the highest-yield item on the list. Estimated 3–5 h with the harness that already exists.

---

## Timeline

**Duration:** 6 months

**Time Commitment:** 50% — Part Time

> A first application for a shorter, part-time grant is the shape OpenSats itself recommends to
> rejected applicants ("Consider applying for a shorter grant of 3 or 6 months"). Six months is
> long enough to close the preview clients and the offline story, short enough to be judged on
> delivered work rather than on a promise.

### Project Timeline and Potential Milestones

Every milestone below is drawn from the project's own public backlog (`docs/GAPS.md`,
`docs/VERSIONS.md`, `docs/FAQ.md`), not invented for the application.

| # | Month | Milestone | Done when |
|---|---|---|---|
| 1 | 1 | **Maintainer consent pass.** Written contact with all ten teams, corrections applied, replies logged in-repo. | Every reproduced client's team has been asked; consent or objection recorded per client. |
| 2 | 1–2 | **KNOWN-DIFFS per reference-verified client.** The 533-row gap ledger turned into a reader-facing statement of what each reproduction does and does not do. | Eight published diff sheets, linked from each client view. |
| 3 | 2–3 | **Gossip and Keychat from preview to reference-verified.** Both currently lack a `screen-map.md`; this is the recon-and-rebuild work the other eight already had. | Two new screen-maps, two rebuilt reproductions, two tours, two FAQ sets. |
| 4 | 3–4 | **Offline and self-hostable.** Remove the last 12 external image hotlinks, tighten the CSP to `img-src 'self'`, ship a documented static self-host path. | A downloaded build runs with the network switched off; documented in `README.md`. |
| 5 | 4–5 | **Reachable without JavaScript and without sight.** Client pages currently render blank with JS off; legal documents are not reachable from the live domain. Plus an accessibility pass on the host shell. | Server-rendered fallback per client route, legal set served at real paths, keyboard and screen-reader pass. |
| 6 | 5–6 | **Two more clients, and a version-freeze cadence.** Client selection driven by what maintainers and `#asknostr` actually ask for, under the freeze procedure in `docs/VERSIONS.md`. | Two new reproductions shipped; one older client version frozen and reachable. |

Reporting: quarterly progress reports as required, each one verifiable against public commits.

---

## Budget

### Costs & Proposed Budget

**`[OWNER]` — the number is yours; this is a defensible default, not a benchmark.**

| Item | Basis | USD |
|---|---|---|
| Development time | 6 months × 50% (≈20 h/week) | 22,800 |
| Recording and reference devices | Android and iOS hardware for reference capture; the reproductions are only as good as the recordings | 900 |
| Domain, hosting, incidentals | static hosting is near-zero; 12 months of `sandstr.app` | 300 |
| **Grand total** | | **24,000** |

Neither funder publishes per-grant figures — OpenSats states it does not usually disclose
individual grant amounts — so any anchor here is derived, not quoted. This total is set to be
plainly justifiable per hour rather than to test a ceiling.

### Prior Funding

**No.** `[OWNER] — confirm.` Sandstr has received no grant, sponsorship, or revenue. The
predecessor guide it was extracted from was likewise unfunded.

### Additional Funding Sources

**Yes — disclosed.** An application to HRF's Bitcoin Development Fund is planned for the same
period; that fund accepts submissions year-round. If both were awarded, the scope would be split
rather than double-billed, and OpenSats would be told before accepting. `[OWNER] — confirm this
is the intent.`

---

## Video Application

**Video Link:** `[OWNER]` — to be recorded. See *Screenshots / Videos* above.

---

## Anything Else

**On reproducing other teams' branded interfaces.** This is the project's central risk and it is
better raised by me than found by you. Every client view carries a permanent "SIMULATION · mock
data · unofficial, not affiliated with <client>" banner; `TRADEMARKS.md` names every mark as its
team's property and commits to correcting or removing any reproduction on request, no questions
asked; `robots.txt` blocks `/c/` so no reproduction can outrank the real client; no upstream code
is vendored; where a mark could not be used cleanly it was replaced rather than copied; and every
client view links out to the real client. The primary mitigation is consent, which is why
milestone 1 is the maintainer pass and not a feature. Two maintainers of reproduced clients have
seen the material and raised no objection, but neither has been asked, and I do not present that
as permission.

**On how the code was written.** 173 of 186 commits carry a `Co-Authored-By: Claude` trailer and
4 are authored by Claude directly; the remaining 182 are mine. I use coding agents heavily and
deliberately, under review, with a written per-repo contract for what they may and may not touch.
I would rather state that up front than have you find it with `git shortlog`. The verification
standard the project holds itself to is in the repo: every reproduction is checked click-by-click
against a recording of the real app, every headline number is recounted from source before it is
published, and the gap ledger exists specifically so that the things the reproduction gets wrong
are written down by me first.

**On what this project will never claim.** It does not implement NIP-anything. It cannot show
real content, real people or real relay behaviour. Somebody who has used sandstr has seen an
interface, not the network — and the FAQ says so on the first screen. The honest ceiling is that
sandstr answers "what is this app like and do I want it", and hands the visitor to the real client
for everything after that.

**On the commit log.** The project is developed publicly, but its commit subjects are written in
Polish, my working language; from this application forward they are in English, and a tagged
release with English notes summarises what the Polish month delivered. The repository went public
on 2026-08-04 with the full history from 2026-07-14 intact — the 21 days before that were the
extraction spike, and no work is being published retroactively from here on.

---

## `[OWNER]` — what I need from you before this can be submitted

1. **Prior contributions and years of experience.** Two form fields I cannot fill. This is where
   "Proof of Work in the Bitcoin and/or nostr ecosystems" is judged.
2. **Send the reference asks.** Nothing else on this page is on anyone else's clock; this is.
   Two letters, `references@opensats.org`, Nostr- or PGP-signed if the referee will.
3. **The budget number.** 24,000 for 6 months at 50% is my default, not your decision.
4. **Record the ~2-minute video.** The harness and the footage exist.
5. **Confirm:** no prior funding, and that the HRF application is intended in parallel.
