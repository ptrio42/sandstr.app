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

Everything comes **straight from relays**, via one Node script (global `WebSocket`,
no dependencies). The pattern that worked:

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
- the address bar mirrors whichever answer is open, so every answer copies itself
  without any "share" affordance.

Without those parameters a reply reads "open it, hit the question mark, search" —
three steps at exactly the moment the asker is impatient. This was the single most
important product change that promotion forced.

**A clip shows WHERE a thing is, not WHY it broke.** For "my zap failed" the right
answer is the text one (the `trouble-*` entries name the stage that failed); keep the
clip for "how do I even do this".

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
on the list: it is simultaneously the trademark mitigation, the source of the grant's
reference letters (`SHIP-AND-GRANT.md`), and the only channel where a single repost
outweighs everything above. The first post tagging an author went out 2026-08-12
(Wisp), deliberately without asking for corrections — the owner's call.

The second open thread is `Disallow: /c/` in `robots.txt`: while it stands, linkable
answers do nothing for search long tail (see "Możliwy kierunek" in `FAQ.md`).
