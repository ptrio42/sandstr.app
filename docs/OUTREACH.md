# Sandstr — promoting it on Nostr (method, measurements, what not to do)

> Written 2026-08-12, after the first run of promo material. Every number below is
> measured against relay data, not estimated — the method is reproducible and
> described here. This document is about the **channel**, not the product; what may
> be claimed about other people's brands is settled by `TRADEMARKS.md` and the
> `branding-i-ryzyko-prawne` skill.

## The mistake to start from

The first set of teasers was made like this: pick the questions that **look good on
screen**, cut them together, and only then ask who this is talking to. The answer
undid the direction. The product is for people who do not use Nostr yet; the
publishing channel is a feed of people who have used it for years. Material
explaining that "your key is your account" was being aimed at an audience that
learned this two years ago.

**The rule that survived: measure the channel before choosing the content.** Doing
it the other way round cost a session of editing.

## How to measure

Everything comes **straight from relays**, via `scripts/nostr-pull.mjs` (global
`WebSocket`, no dependencies):

```bash
node scripts/nostr-pull.mjs notes <npub> > notes.json
node scripts/nostr-pull.mjs engagement <npub> > engagement.json
node scripts/nostr-pull.mjs tag asknostr > asknostr.json
```

JSON on stdout, progress on stderr. What it does under the hood:

- `bech32` decodes an `npub` to hex in twenty lines — no library needed;
- `{authors:[hex], kinds:[1], limit:400}`, paged backwards with `until` set to the
  oldest `created_at` seen, a few rounds, six relays in parallel, dedup by `id`;
- engagement: `{kinds:[1,6,7,9735], '#e':[…40 ids…]}` in batches of 40 notes; zap
  amounts pulled out of `bolt11` with a regex (`lnbc<number><munp>`);
- tag traffic: `{kinds:[1], '#t':['asknostr'], limit:400}`, paged the same way.

**What not to use:** `nostr.band` (refuses connections from this environment, both
the site and the API), `primal.net` and other SPAs (WebFetch gets an empty shell).
`njump.me/<npub>` works and renders the last ~100 notes — fine for a quick read of
someone's style, far too small for statistics.

**Caveat on every number below:** engagement counted from six relays is an
**undercount** (reactions and zaps live on others too), and the `#asknostr` sample is
what those relays kept, not the whole tag.

## What the measurements said

### Which forms work on the owner's account

1798 notes, February 2025 → August 2026.

| form | result |
|---|---|
| **a question to the reader** | 44, 30, 25, 23, 19, 18 replies — the account's ceiling |
| aphorism / opinion | up to 44 reactions and 1512 sats zapped |
| workshop / kitchen photo | median 2 reactions, 2 replies |
| **product announcement** | 6 notes, median 3 reactions, **0–5 replies** |

Announcements are the **weakest** category this account has, and questions beat them
by 10–40×. The note announcing the FAQ scored ♥3 ↩0 ⇄4.

**So a broadcast post should be a question, not an announcement.** The video goes
under the question, not instead of it.

### What people actually ask

1932 notes tagged `#asknostr`, March 2023 → August 2026.

| topic | share | clip exists |
|---|---|---|
| zaps / wallet | 17% | ✅ Damus, Amethyst |
| keys and accounts | 14% | ✅ Damus, Amethyst |
| images and media | 13% | ✅ Nostur (turtle) |
| which client | 13% | ✅ both cuts (the shelf) |
| profile, NIP-05 | 9% | ✅ Damus (npub) |
| who to follow | 7% | — |
| relays | 6% | ✅ Amethyst |
| mute / block / spam | 5% | ✅ Coracle |
| DMs | 1% | — |
| notifications | 1% | — |

The first teaser set **skipped the two biggest topics** (zaps, keys) and included two
that answer nothing on this list (Damus's shaka, Wisp's undo countdown — charming,
but nobody asks). The zap and keys clips were built afterwards.

### How many threads are actually worth answering

A mistake worth remembering: the first filter reported **244 "client questions"**, and
that number reached the owner before it was checked. It was inflated because the
matching ran over the **whole note including its links** — and image links contain
`blossom`, host names contain `media` and `image`. Every note with a photo landed in
the "media" bucket.

After stripping URLs before matching, dropping bitcoin-wallet talk, politics and
non-English notes, and requiring the question to actually be about a Nostr client:
**17 questions in 90 days, of which ~6 are worth replying to.**

**Two rules out of that: match against the prose, never the raw content. And read a
sample by hand before quoting a count** — three minutes of reading would have saved
publishing an inflated number.

## The reply playbook

Replying beats broadcasting: the product shows up as help, inside a thread where
somebody is already stuck. It requires one thing — **a linkable answer**.

- `sandstr.app/c/<client>?faq=<id>` — opens the panel on that specific answer;
- `sandstr.app/c/<client>?tour=1` — starts the guided tour at step one;
- `sandstr.app/compare?cell=<client>:<axis>` — lands on ONE capability claim with its
  source and the build it was checked against underneath (added 2026-08-14);
- `sandstr.app/compare?on=android&need=signer` — "here are the Android clients that
  keep your key out of the app". `on` is ios/android/web, `need` is a comma-separated
  list of chooser axes;
- the address bar mirrors whichever answer, filter or cell is open, so every one of
  them copies itself without any "share" affordance.

Without those parameters a reply reads "open it, hit the question mark, search" —
three steps at exactly the moment the asker is impatient. This was the single most
important product change that promotion forced.

**Every `/c/<client>` link now previews as that client** (2026-08-14). Until then
all of them rendered the gallery card, so a Damus reply and a Wisp reply looked
identical in a feed — the link preview is often the only part of a reply a
scroller reads. The build writes one `dist/c/<id>.html` per client with its own
title, description and image (`scripts/prerender.mjs`), and the images are
`public/og/<id>.png`, regenerated with `npm run og:cards`. Two things follow for
promotion:

- the card **shows that client's actual screen** (2026-08-16), captured from the
  built site — a phone in perspective for the mobile clients, a browser window
  addressed `sandstr.app/c/<id>` for the web and desktop ones. Never full-bleed:
  the device frame is what makes it read as *a screen showing X* rather than as
  X, which is the whole reason a faithful reproduction is allowed on a card at
  all. Around it sits sandstr chrome — our lockup, the client's mark, and
  "SIMULATION · UNOFFICIAL · MOCK DATA · NOT AFFILIATED WITH &lt;NAME&gt;" burned
  in along the bottom — so a reply can link a client without the note itself
  having to carry the disclaimer sentence (still carry it when the note names a
  brand in prose — see "What not to claim");
- **do not also attach a screenshot** to a note that links a client. The card
  already is one, and a second image pushes the link preview out of view in most
  Nostr clients — you would be trading the disclaimer-bearing image for a bare one;
- the card is a **photograph of the reproduction, so it goes stale when the
  reproduction changes**. Anyone rebuilding a simulator has to re-run
  `npm run og:cards` (it is in the fidelity-pass checklist); a promo push is a
  reasonable moment to check the cards match what the site currently renders;
- previews and archived snapshots say so **on the card**, in a pill. Sharing an
  early preview as if it were a finished reproduction now takes effort.

`robots.txt` gained a `Twitterbot` and a `facebookexternalhit` exception at the
same time, for a reason worth knowing: **X documents that Twitterbot implements
the robots.txt spec and renders no card at all when the URL is disallowed** —
not a fallback card, nothing — and its troubleshooting page tells publishers to
add exactly this exception. Meta's crawler documentation says the same about
respecting the file. So `Disallow: /c/` had been suppressing X previews of every
deep link, and probably Facebook's too. Discord, Telegram and the Nostr clients
never consulted the file, which is why this was invisible from where the owner
was posting. Search is untouched: neither crawler feeds an index.

**A clip shows WHERE a thing is, not WHY it broke.** For "my zap failed" the right
answer is the text one (the `trouble-*` entries name the stage that failed); keep the
clip for "how do I even do this".

## Next material: the zap comparison

Owner's call, 2026-08-14, and the framing matters: this is **flavour, not a warning**.
An earlier draft led with "a stray click in Snort spends sats", which is true and is
also mildly patronising to a feed of people who have used Nostr for years. The
interesting thing is not that one client is risky — it is that eight teams looked at
the same gesture and disagreed about literally every part of it.

What the matrix and the FAQ banks already hold (`/compare`, axis `fast-zap`, plus each
client's `zap` entry):

| | |
|---|---|
| **Where the bolt sits** | 2nd in Primal and Coracle (before the heart), 4th in Damus, Amethyst, Wisp and Nostur, last in Snort and YakiHonne |
| **What it looks like** | a lightning bolt everywhere except Wisp, which draws **₿** unless you switch it to fiat |
| **What one tap does** | Snort sends 50 sats and Coracle 21, with no sheet; Wisp and Nostur always open one; YakiHonne makes it a setting; Amethyst zaps straight away only if you have exactly one amount configured, and ships three |
| **The default** | three of them default to **21** (YakiHonne, Nostur, Coracle); Snort picked 50. Amethyst's and Wisp's preset rows also start at 21 — but 21 is a bitcoin convention, so read it as a shared idiom, not as eight teams converging by accident |
| **The number beside it** | a total of **sats** in six of them, not a count of zaps (Amethyst, Primal, YakiHonne, Wisp, Nostur, Coracle) — Nostur even writes "sats" after it. Damus and Snort do not say |
| **One-offs** | Coracle has a "Platform zap split" deciding how much of each zap goes to its developer (ships at 0); YakiHonne's "Invoice" makes a QR someone else pays — zapping backwards; Wisp lets you keep a custom amount as your own preset |

Why it fits the measured channel: it aims at the tag's **biggest** topic (zaps/wallet,
17%), it is a question the reader can answer about their own client rather than an
announcement — announcements are the weakest category this account has — and it is
about design taste, which is what a room of long-time users actually enjoys arguing
about.

It also comes with its own picture, which is rare: `/compare?show=note` renders the
same post in all eight, so the action rows sit side by side and the reader can count
the positions themselves. The claim and the evidence are one link.

The linkable forms: `sandstr.app/compare?cell=snort:fast-zap` for the single claim,
`sandstr.app/compare?show=note` for the row-by-row picture.

Two rules from above still bind: the note names other people's brands, so it carries
"unofficial, not affiliated"; and a teaser goes UNDER a question, not instead of it.

## What not to claim

- no client count in the copy (the narrative is derived from the `status` axis in
  `src/registry.tsx`);
- nothing implying a protocol implementation — this reproduces interfaces;
- "unofficial, not affiliated" in any note that names someone else's brand, until
  their teams have said yes;
- do not announce a feature twice. The FAQ was announced in August 2026; later notes
  should **show what people find through it**.

## Open

**Talking to the client maintainers** is still open and still the highest-value item
on the list: it is simultaneously the trademark mitigation and the only channel where a
single repost outweighs everything above. The first post tagging an author went out
2026-08-12 (Wisp), deliberately without asking for corrections — the owner's call.

A reaction to a note is **not** consent: a zap is a tip, not a licence, and a "how does it
work?" reply says nothing about whether the author wants the thing to exist. Nobody has
approved anything, and nothing in this file may be presented as if they had. What a
reaction does buy is a warm follow-up — "you saw it, anything you want corrected?".

**What produces reactions: the tag.** Both notes that tagged a maintainer got that
maintainer, 2 for 2. Neither note was otherwise remarkable (numbers below). Credit the tag,
not the copy — and note the tag is also what makes the "anything you want corrected?"
follow-up cheap.

### The two tagged notes, measured (2026-08-15)

| note | ↩ | ⇄ | ♥ | ⚡ |
|---|---|---|---|---|
| 2026-08-12 Wisp, `?tour=1`, tagged the maintainer | 3 | 8 | 6 | 3 |
| 2026-08-14 Amethyst, `?faq=mute`, tagged the maintainer | 3 | 7 | 7 | 1 |
| *baseline: product announcements* | *0–5* | *4* | *3* | *—* |

Both notes open with a question, per the rule above — and both landed **inside the old
announcement band on replies**, nowhere near the 44/30/25 reply ceiling. The lift is in
**reposts and zaps** (roughly double the announcement median).

**The refinement that follows: a rhetorical question is still an announcement.** "Had enough
of the current thing?" gives the reader nothing to answer, so it does not buy replies; what
earned 44 replies was a question the reader could actually answer ("can you recommend an app
for tracking expenses?"). Rhetorical openers buy **distribution** — that is a real win for a
note carrying a link, just not the one the question rule promised.

The second open thread is `Disallow: /c/` in `robots.txt`: while it stands, linkable
answers do nothing for search long tail (see "Możliwy kierunek" in `FAQ.md`). The
2026-08-14 card work did **not** settle this — it carved out the two link-preview
crawlers, which do not index, and left the search decision exactly where it was.
