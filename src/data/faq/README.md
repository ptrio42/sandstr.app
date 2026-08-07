# FAQ data — authoring contract

Curated per-client "How do I…?" answers, rendered by `src/host/FaqPanel.tsx`,
optionally replayed inside the simulator as "Show me" mini-tours
(`src/components/faq/FaqMiniTourLauncher.tsx`).

## The coverage contract (why hard questions can't be skipped)

`types.ts` defines `CANONICAL_TOPICS` — the question bank every client FAQ
must account for, including the hard ones real users actually hit
(**connect-wallet, media-uploader, clear-cache**, backup-keys, mute…).
`ClientFaq.coverage` is a `Record<CanonicalTopic, …>`, so a client file that
ignores a topic **does not typecheck**. Each topic maps to:

- an **entry id** — the question exists (`getFaq` dev-validates the id),
- `'n/a'` — the real client genuinely lacks the feature (e.g. no DMs),
- `'todo'` — not written yet; visible debt instead of silent absence.

Adding a topic to `CANONICAL_TOPICS` intentionally breaks every client file
until each declares it — that is the mechanism working, not a nuisance.

> **The enforcement is real again as of 2026-08-07.** Between 2026-08-06 and then
> it was not: a syntax error in `useSimulator.ts` made `tsc` drop *every* semantic
> diagnostic, so `npm run typecheck` looked almost clean while checking nothing.
> Verified after the fix — adding a throwaway topic names exactly the eight client
> files. See the Gotchas section in `CLAUDE.md`.

**Worked example of the mechanism: `multi-account` (added 2026-08-07).**
Adding it broke all eight files until each declared an answer, and the answers
came out genuinely different: Amethyst, Nostur, YakiHonne and Wisp have a real
switcher; Snort has one but ships no way to ADD a second account; Damus and
Primal hold one key at a time and switching means logging out. "This client
does not have it" is a first-class answer — provided it was verified, not
inferred from silence.

**A topic is a user's question, not a feature name — enumerate its kinds.**
`mute` is the worked example: the clients variously mute *people*, *words*,
*hashtags* and *threads*, in different places and under different
vocabulary (Nostur blocks people and only mutes threads and words; Damus
files all four on one screen with an optional duration). A single "how do
I mute someone" answers a quarter of the question. Ask the recon agent to
enumerate the kinds the client supports and where each is managed, and say
plainly when a kind does not exist. The same test applies elsewhere:
`manage-relays` (read/write/inbox/outbox splits), `notifications` (the
list vs the settings), `connect-wallet` (built-in vs NWC vs handoff).

## Two classes of question

**Navigational — "where is X / how do I do X".** The original bank. Answer in
`answer` as numbered imperative steps naming the real app's real labels, and
add a `showMe` when the sim can honestly demonstrate it.

**Troubleshooting — "why doesn't this work".** Added 2026-08-07, category
`Troubleshooting`, one entry per symptom (`trouble-*`). Two rules make this
class different:

- **They are TEXT-ONLY.** The simulator cannot stage a failure — it has no
  broken relay, no failed zap, no read-only session — so a `showMe` here could
  only contradict itself. `showMe` is optional; omit it.
- **The answer has two halves and `howNostrWorks` is where the second one
  goes.** Half of "why doesn't this work" is not about the client at all: it
  is relays, keys and NIPs. Keeping the protocol half in its own field (the
  panel renders it as a labelled block) stops protocol facts being smuggled
  into steps the reader is meant to *follow in this app*. The field must be
  true of Nostr generally — a client-specific behaviour in there is a bug.

The seven symptoms every client answers: startup crash/hang, notes not
reaching others, zap failed, cannot post (read-only npub session), images not
loading, notifications stopped, empty profile / lost follows.

## Grounding tiers (fidelity is the product)

1. **`docs/refs/<client>/screen-map.md`** — authoritative for everything the
   reference recording covers. Answers describe the REAL app: real menu
   names, real placement, real colors.
2. **Upstream source** — for surfaces the recording never visited (Settings
   internals, wallet flows). Cite file/symbol in a comment next to the entry
   (see the Advanced section of `damus.ts`). All 9 real clients are open
   source — `docs/FIDELITY.md` lists the repos.
3. Never ground a claim in our simulator alone — the sim is the copy, not
   the truth.

## showMe rules

Follow **docs/GAPS.md → „Zasady dla autora FAQ"** (and the per-client ledger
`docs/gaps/<client>.md`) before writing any `showMe`:

- text answers are always allowed; `showMe` only where the ledger shows no
  `missing`/`dead`/`unreachable` on the path and an anchor exists,
- ≤ 2 commands per step (the tour queue's hard limit),
- end on a highlighted screen or row — never on "now tap this" when the
  control is dead in the sim; captions describe the real app instead,
- entries without `showMe` are fine — the panel hides the button.

## Recurring review findings (check these before shipping)

Every client's adversarial review has caught at least one of these:

- **A showMe step whose own command unmounts its target.** Only the top
  overlay renders in most sims, so `openSettings` with a sub-screen payload
  removes the settings-root anchor. Target the screen you actually open.
- **A multi-match selector framing the wrong instance.** `querySelector`
  returns the first match in DOCUMENT order — never selector-list order. If
  what you describe (a media block, a Follow pill) exists on only some cards,
  anchor that element itself instead of pointing at "the first post".
- **Commanded state that outlives the demo.** A forced sub-tab or a toggled
  mode silently changes every later demo. Reset it on navigation, or end the
  walk-through by switching it back.
- **A caption describing the real app while the spotlight frames the sim.**
  Both must be true at once: ground the claim upstream AND check the sim
  renders it (counts, colors, empty states differ). This is the one that
  bites hardest — YakiHonne's review returned ten findings and every single
  one was this. Before shipping a `showMe`, open the sim on that screen and
  read the caption against it out loud: a screen that mounts on an empty
  tab, a search box that starts pre-filled, a menu missing the row you
  named, a button that never dims — all shipped past a "grounded" answer.
  When the sim cannot show it, drop the `showMe`; a text-only entry is a
  better answer than a demo that contradicts itself.

**Making commands self-sufficient? Watch the stale `currentUser`.** Hoisting
sign-in above the command switch is the right move (one command per step,
nothing for the queue to drop) — but the state it sets is NOT visible to the
same effect pass. Any branch that reasons about "me" (open someone else's
profile, find another author) must use the value you just signed in with,
not the `currentUser` in scope. Snort shipped a demo of the Follow button
that opened the visitor's own profile because of exactly this.

**Anchor the surface your caption describes, not a control inside it.** The
spotlight is clipped to the target's own rect, so a caption about "the
sheet" pinned to its send button leaves everything it names under the
scrim. Whole-surface captions belong on the surface root.

**When you add an anchor, check which BRANCH you put it in.** A screen that
renders a list or a detail view depending on local state has two roots; the
command mounts one of them. Wisp's DM anchor went on the conversation
branch, which no command reaches — the demo had no target at all.

**Mock data does not join up by default.** Two mock modules that both mint
ids will never match each other, so a lookup like "find the thread
containing this note" silently returns null and the demo frames an empty
shell. Verify the command lands on real data, not just on the right screen.

## Adding a client

1. Draft entries from the screen-map (+ upstream recon for hard topics).
2. Fill `coverage` — the compiler tells you what you forgot.
3. Wire the sim: `FaqMiniTourLauncher` as a child of its `TourWrapper`,
   an `isFaqStepId` branch in the wrapper's `onStepChange`, commands that
   close drawers/modals they might be under, `data-tour` anchors.
4. Register in `index.ts`. Host UI (buttons, panel) lights up by itself.
