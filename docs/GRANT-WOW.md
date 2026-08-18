> **SUPERSEDED 2026-08-14 — do not draft from this file.** Its strategy still holds; its facts do
> not. The repo is public (186 commits, pushed), the site is live, the `nsec` solicitation is gone
> behind a key-safety tripwire, the handoff ships, and Amethyst's hotlinks are fixed. It also calls
> HRF's programme by the wrong name — it is the **Bitcoin Development Fund**. The live application
> draft is [`docs/grants/opensats.md`](grants/opensats.md); the current gap list is the
> 2026-08-14 grant-readiness audit.

## 1) THE ONE-LINE ANSWER

Yes — but almost none of it is engineering. The three things that raise grant odds are (a) getting the repo public *now* so a public commit history exists by the time you submit, (b) removing two self-inflicted contradictions that a checking reviewer or maintainer will find in under a minute (a fake login that asks for your `nsec` while PRIVACY.md swears it never does; a README that argues for the strategy you abandoned), and (c) finishing the outbound handoff and shooting the short video — because OpenSats' own advice page asks for one. Do not add protocol code, do not do more fidelity work.

## 2) THE SHORTLIST

**1. Push public today, deploy, then link the legal docs and fix the README tail. ~2–4 h.**
`git remote -v` is still empty; 35 commits, first `2026-07-14`, all local. OpenSats' application FAQ requires work be published under a FOSS licence with **"frequent, public commits to GitHub (or equivalent)"** and states that private development followed by later publication does not satisfy grant terms (opensats.org/faq/application). So every day unpushed is a day of the one credential you can't backdate not accruing. Second half: `src/host/Layout.tsx:55-57` is a single unlinked sentence, and `src/host/Gallery.tsx` contains **zero** `href=` — so a live-URL visitor has no path to LICENSE, PRIVACY.md, TRADEMARKS.md or THIRD-PARTY.md, all four of which already exist at repo root. Note `public/_redirects` does `/* -> /index.html 200`, so a naive `/PRIVACY.md` link silently renders the gallery: either link GitHub blob URLs or copy the files into `public/`. Third half, five minutes and the most damaging: the last section of `README.md` still reads *"The intended direction is **owned-IP-first**: lead with the original **Nostr Kitten**"* — the exact opposite of CLAUDE.md, `src/registry.tsx` and the shipped gallery, in the first file every reviewer and every maintainer opens.
*Honest wow: zero.* Grant criterion: the FOSS/public-development requirement, plus the "meaningful progress already made" item on OpenSats' how-to-improve list. Risk: shipping footer links before the push makes them 404 — same commit or not at all.

**2. Stop soliciting private keys, then teach why. 2–4 h.**
Verified, and worse than previously described. `src/simulators/keychat/screens/LoginScreen.tsx:117-121` is a real `type="password"` field with placeholder **"Paste your nsec private key"**, its handler (line 44) accepts *any* string of ≥10 characters and logs you in, and line ~135 reassures the user **"Your keys never leave this device. You are in control."** `src/simulators/amethyst/screens/LoginScreen.tsx:140-142` (a READY flagship) has the same field with `nsec1...`; `snort/screens/LoginScreen.tsx:115-117` likewise; `primal/web/screens/LoginScreen.tsx:13,21` invites "Paste your `nsec`". Meanwhile PRIVACY.md:29-31 states the site *"never generates, asks for, or handles real Nostr keys"* — that is false today, in a document you are about to publish. Order: delete the false reassurance line and the "paste your nsec" solicitation, *then* add a shared prefix heuristic (`/nsec1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{20,}/i`, no crypto, no dependency) that clears the field and shows one sentence. Add `autoComplete="off" spellCheck={false}`; make Primal's field `type="password"`.
*Honest wow: modest, and it is defensive.* Damus and YakiHonne have no editable key field, so the screenshot can only come from Amethyst or Primal. Grant criterion: The Nostr Fund funds, verbatim, *"design work that makes nostr usable for people who are not already comfortable with the protocol"* — a newcomer key-safety intervention sits inside that sentence. Risk: the copy must not be patronising, and this touches four sim directories plus `shared/`, which CLAUDE.md's isolation rule cannot cover.

**3. Finish the handoff — two gaps, not a build. ~1–1.5 h.**
`src/registry.tsx` already carries `homepage`/`repo`/`upstreamLicense`/`installNote` for all ten clients with per-client reasoning in comments (including the Snort git.v0l.io-vs-GitHub question, already decided; don't reopen it), and `src/host/ClientView.tsx:159` renders a working `Handoff` with `rel="noopener noreferrer"` and non-endorsing copy, at three sites including a compact phone variant. What's missing: gallery cards (the card is a `<Link>`, so the outbound anchor must be a **sibling row outside it** — a nested anchor is invalid HTML), and the dead ending at `src/data/tours/damus-tour.ts` (`damus-complete` asks *"Ready to try the real app?"* with nothing to click).
*Honest wow: low visually, high for maintainers.* Grant criterion: makes TRADEMARKS.md's existing promise ("the reproduction of your work exists to send users *to* you") true rather than aspirational; it is the opening line of the consent email, and consent is what produces the two reference letters OpenSats requires.

**4. The short video. 3–4 h including retakes.**
Not a nice-to-have. OpenSats' "How can I increase my funding chances?" list says verbatim: **"Submit a short video explaining your project or proposal."** It is also item 7 of the outreach package already specified in `docs/SHIP-AND-GRANT.md`. This is the only artifact that transmits the actual wow — four reference-verified clients running full-bleed on the visitor's own phone, no install, no key — and none of the other moves increase the number of people who see it.
Risk: it must show only the four ready clients, and must not reproduce any claim you can't defend (see §6).

**5. KNOWN-DIFFS per ready client, as a markdown reply asset. 3–5 h.**
`docs/refs/{amethyst,damus,primal,yakihonne}/screen-map.md` exist (Snort has `shots/` only, no screen-map — consistent with its preview label). No KNOWN-DIFFS file exists anywhere. Write one per ready client: what differs · why (deliberate / not built / unverified detail) · scheduled or not. State the deepest diff once at the top: this reproduces the interface, not the protocol.
**Fix one thing first or this backfires:** Amethyst — a READY client — still hotlinks DiceBear at `AmethystSimulator.tsx:147`, `screens/HomeScreen.tsx:37` and `screens/LoginScreen.tsx:40`, the last firing on in-sim key generation. An error inside a self-audit costs more than no self-audit.
*Risk:* incomplete is worse than absent. Keep it in `docs/`, paste it in the DM. Do **not** hang it in the product next to the demo you want people impressed by.

**No move on this list breaks a CLAUDE.md hard rule.** A hyperlink is not network code, a regex is not crypto, and the SIMULATION banner stays. The only OWNER DECISION on the table is §3.

## 3) THE PROTOCOL QUESTION

**Don't. Not a live relay mode, not a narrow one, not behind a flag.**

It breaks two hard rules verbatim: *"Zero backendu, sieci, auth, realnej krypto"* and *"Bez realnej krypto/sieci — to symulacja"*, plus *"Bez nowych zależności npm"* — and a NIP-01 relay client with signature verification and no library is days, not hours. It also costs you the claim you just bought: PRIVACY.md's "nothing connects to relays or to the Nostr network" is currently true and is the reason the product needs no keys. And it does not buy what it looks like it buys — no funder scores WebSocket code, and The Nostr Fund's own words point the other way ("design work that makes nostr usable for people who are not already comfortable with the protocol").

**What gets the credit instead:** (a) that Nostr Fund sentence, used as your positioning line; (b) the honest framing stated first, not extracted under questioning — *sandstr reproduces interfaces, not the protocol; that is precisely why it needs no keys and can run offline*; (c) maintainer consent letters, which are both the trademark mitigation and the reference-letter source; (d) later, a genuinely offline, self-hostable static build — killing the hotlinks makes "works behind a hostile or absent network" a checkable claim, and HRF's Bitcoin Development Fund names open-source software development and censorship-resistant communications among its focus areas.

**The one narrow item, and only after you submit:** `src/data/mock/utils.ts:20-22` — `generateNpub()` returns `'npub1' + generateHex(32)`. That is 37 characters where a real npub is 63, uses a hex alphabet that includes `b` (not in the bech32 charset), and has no checksum, so every displayed npub is malformed. Fixing it correctly means 63-char strings flowing through the four clients that just passed the audited fidelity pass — a layout regression risk aimed at your only verified asset, to fix something a permanent "mock data" banner already covers. If you touch it at all, emit bech32-charset characters at the right length, **npub and note only, never nsec** (a faithful clone that hands out an importable secret key is a phishing kit with better UX), and never write "implements NIP-19" in an application.

## 4) SEQUENCE (~10–15 h/week)

**This week (~10 h).** Push public + deploy (hour one, before anything else). Footer links + README tail rewrite, same commit. Kill the nsec solicitation and the false reassurance line; land the tripwire; correct PRIVACY.md to what is then true. Finish the two handoff gaps. Fix Amethyst's three DiceBear calls.

**Next week (~12 h).** KNOWN-DIFFS for the four ready clients. Shoot the video. Assemble the outreach package and send the first two DMs (Amethyst, Primal) — *not before* the above is live, since you get one first impression each and there are only nine of them.

**Before submitting.** Two reference letters in hand (OpenSats: *"at least two written reference letters"* — evaluation does not start without them). Note the real window: applications are open the first two months of each quarter and closed in March, June, September and December — so July/August and October/November are open, and review takes under 90 days. HRF's **Bitcoin Development Fund** (that is its actual name — correct `docs/SHIP-AND-GRANT.md:23` and `:156`, which call it "Open-Source Bitcoin Grants") takes rolling submissions via its form or `dev.fund@hrf.org`, so it can go earlier. Add a one-line note that 4 of 35 commits are authored by `Claude <noreply@anthropic.com>`; disclosing is neutral, hiding is not.

## 5) DO NOT DO

- **Any protocol code.** See §3.
- **A `/fidelity` or `/ledger` route.** `src/App.tsx` has two routes. The entire audience for a self-audit is already on GitHub; a new page means design, dark mode, responsive work and a DoD click-through for zero additional readers.
- **KNOWN-DIFFS in the product before you hold any consent.** Pre-consent and public, a self-authored list of ways you misrepresent someone's trademarked interface reads to an unfriendly reader as a written admission, not as diligence.
- **The 83 remaining hotlinks in the five preview sims.** 31 files, days of work, no reviewer's decision turns on it, "Early preview" and `robots.txt`'s `/c/` disallow already carry the honesty. (SHIP-AND-GRANT.md says 92; I count 83 URLs / 85 token mentions.) Fix only Amethyst's three, because Amethyst is a lead.
- **More fidelity work on the four ready clients before outreach.** Fidelity reaches the grant through exactly one channel: whether maintainers say yes. KNOWN-DIFFS buys more of that per hour than closing diffs does.
- **Leading with the nostrich.love traction claim.** There is no note ID, no zap count, nothing in the repo. Unevidenced traction in front of someone who can check Nostr in ten seconds costs more than silence.
- **Re-introducing "nothing leaves your browser."** You removed it from og.png once. It is still false site-wide.

## 6) THE HONEST CEILING

Things sandstr cannot claim, no matter the polish:

- **Not a Nostr client, and not a NIP implementation.** Zero WebSocket, zero relay connection, zero key, zero event, zero signature. Every `wss://` string is mock data. Nothing here breaks if the protocol changes. This is the single most greppable false claim available to you — one caught overclaim costs more than every gap it hides.
- **Not "10 clients."** Four reference-verified reproductions, five early previews, one original. The gallery already tells this truth; the application must match it.
- **Not offline or CSP-clean yet.** 31 files still hotlink DiceBear/Unsplash/Picsum, including three calls in Amethyst.
- **No measured audience.** No note IDs, no zap counts, no analytics, no `AUDIENCE.md`. "Potential impact" currently rests on an anecdote.
- **No maintainer endorsement, today.** Until a team says yes in writing, the trademark question is decided by a cautious programme officer with nothing to argue from.
- **No credible promise of staying accurate.** One part-time person tracking nine moving upstreams; your own note that Damus drifted within two weeks is evidence for the objection. Either propose a mechanism (screenshot diffing, maintainer-owned fixtures, a stated sync cadence) or scope publicly to fewer clients maintained well. Do not promise nine.

Files worth opening in order: `/Users/piotrczarnoleski/sandstr/README.md` (tail), `/Users/piotrczarnoleski/sandstr/src/host/Layout.tsx:55`, `/Users/piotrczarnoleski/sandstr/src/simulators/keychat/screens/LoginScreen.tsx:117`, `/Users/piotrczarnoleski/sandstr/PRIVACY.md:29`, `/Users/piotrczarnoleski/sandstr/src/host/Gallery.tsx`, `/Users/piotrczarnoleski/sandstr/src/data/tours/damus-tour.ts`, `/Users/piotrczarnoleski/sandstr/docs/SHIP-AND-GRANT.md:23`.

Sources: [opensats.org/apply](https://opensats.org/apply), [opensats.org/faq/application](https://opensats.org/faq/application), [opensats.org/faq](https://opensats.org/faq), [opensats.org/funds/nostr](https://opensats.org/funds/nostr), [HRF Bitcoin Development Fund](https://hrf.org/program/financial-freedom/bitcoin-development-fund/), [Announcing HRF's Bitcoin Development Fund](https://archive.hrf.org/announcing-hrfs-bitcoin-development-fund/).