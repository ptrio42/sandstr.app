# Privacy

sandstr is a static, fully client-side site. There is no backend, no database,
no analytics, no cookies, and no account system. Nothing you type or click is
transmitted anywhere — there is no server of ours to transmit it to.

**One honest caveat:** the simulators marked *Early preview* still load some
placeholder avatars/images from third-party image services (DiceBear,
Unsplash), which — like any image request — exposes your IP address to those
services. The reference-verified simulators (Damus, Amethyst, Primal,
YakiHonne) make **zero** external requests. Removing the remaining hotlinks is
tracked work; until it lands, this file won't pretend otherwise.

## What stays in your browser

A few small preferences are kept in your browser's `localStorage`, on your
device only:

| key | what it holds |
| --- | --- |
| `sandstr-theme` | your light/dark choice, if you've made one |
| `sandstr-preferences` | whether guided tours are enabled |
| `nostr-tour-<client>` | which guided tours you've completed or skipped |

That's the complete list. There is no device ID, no fingerprinting, and no
usage tracking of any kind — not "opt-in", just absent.

## Keys and identities

The site never generates, asks for, or handles real Nostr keys. Every npub,
nsec, profile, post, and zap you see is invented mock data (all identities are
fictional — see `src/data/mock/users.ts`). Nothing connects to relays or to
the Nostr network.

## Deleting everything

Clear the site's data in your browser settings, or run
`localStorage.clear()` in the console. There is nothing to delete anywhere
else, because nothing ever left your machine.
