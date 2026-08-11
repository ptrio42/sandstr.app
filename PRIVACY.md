# Privacy

sandstr is a static, fully client-side site. There is no backend, no database,
no analytics, no cookies, and no account system. Nothing you type or click is
transmitted anywhere — there is no server of ours to transmit it to.

**One honest caveat:** the two simulators marked *Early preview* — Keychat and
Gossip — still load placeholder avatars from a third-party image service
(DiceBear; 12 hotlinked URLs, 9 in Keychat and 3 in Gossip), which — like any
image request — exposes your IP address to that service. Every other simulator
makes **zero** external requests, including all eight reference-verified ones
(Damus, Amethyst, YakiHonne, Snort, Primal, Wisp, Nostur, Coracle). Removing
the last hotlinks is tracked work; until it lands, this file won't pretend
otherwise.

## What stays in your browser

A few small preferences are kept in your browser's `localStorage`, on your
device only:

| key | what it holds |
| --- | --- |
| `sandstr-theme` | your light/dark choice, if you've made one |
| `sandstr-preferences` | whether guided tours are enabled |
| `nostr-tour-<client>` | which guided tours you've completed or skipped — plus the FAQ's "Show me" replays, which share one slot per client under `nostr-tour-<client>-faq` |

That's the complete list. There is no device ID, no fingerprinting, and no
usage tracking of any kind — not "opt-in", just absent.

## Keys and identities

The site never asks for a real Nostr key, and it cannot use one. Every npub,
nsec, profile, post, and zap you see is invented mock data (all identities are
fictional — see `src/data/mock/users.ts`). Nothing connects to relays or to the
Nostr network, and there is no signing, no crypto, and no key storage anywhere
in the code.

The simulated sign-in screens do show the key-import field the real clients
have — it is part of the interface being reproduced — but they never solicit a
real key, and if you paste something that looks like one, it is **discarded
immediately** rather than held in memory, with an explanation. See
`src/simulators/shared/utils/keySafety.ts`. Nothing you type on a sign-in
screen is stored, transmitted, or used for anything: any input signs you into a
mock account.

**Never paste a real nsec into any site you are only trying out — including
this one.**

## Deleting everything

Clear the site's data in your browser settings, or run
`localStorage.clear()` in the console. There is nothing to delete anywhere
else, because nothing ever left your machine.
