# sandstr — ship & grant decision document
*2026-07-28. Every claim below traces to a file in this repo or to the three audit lanes. Estimates are labelled as estimates.*

> **SUPERSEDED 2026-08-14 — do not draft from this file.** Most of its blocker list has shipped,
> and it calls HRF's programme "Open-Source Bitcoin Grants" at `:23` and `:156` — the real name is
> the **Bitcoin Development Fund** (`hrf.org/program/financial-freedom/bitcoin-development-fund/`).
> Its outreach package (§ maintainer consent) is still the plan of record. The live application
> draft is [`docs/grants/opensats.md`](grants/opensats.md).

---

## 1. SHIP OR NOT

**Yes — a credible public v1 can ship, and the shortest path is roughly one focused week (~12–15 h) of work that is almost entirely *not* fidelity work.** Nothing in the codebase is architecturally broken: `npm run build` passes in 8.53 s, the app-shell rework (cf1cd2b) landed clean, `public/_redirects` is correct, and four reproductions (Damus, Amethyst, YakiHonne, Primal-web) are genuinely good after small fixes. What blocks v1 is a different category: the repo publishes fabricated posts under real people's real names and lightning addresses (`src/data/mock/users.ts`), it has no LICENSE and no public remote (`git remote -v` is empty, 21 local commits), it ships nine teams' logos with zero attribution, its front page makes a privacy claim that 92 hotlinks falsify, and it presents 10 clients as equally finished when 5 are not. Fix those, add a readiness axis so half the gallery is honestly labelled "early preview", fix the four hard dead-ends (Snort code block, Snort login clipping, Gossip's unreachable feed, the 640–768 px nav band), and you have a defensible public v1. **Do not ship anything until the real-person mock identities are gone** — that single file is the only item here that can produce an irrecoverable outcome.

---

## 2. REAL BLOCKERS

Ordered by blocking severity, then effort. Everything not on this list is section 4 or later, deliberately.

**B1 — Fabricated posts published under real people's names, sites and lightning addresses.**
*What:* `src/data/mock/users.ts` seeds identifiable real people as `isVerified: true` profiles with working real-world identifiers — verified in-file: `fiatjaf` (`fiatjaf@getalby.com`, `fiatjaf@fiatjaf.com`), `Will Casarin` / `jb55` (`jb55@getalby.com`, `jb55@jb55.com`), `Vitor Pamplona` (`vitor@getalby.com`), `Alex Gladstein` (`https://hrf.org`, `alex@hrf.org`), plus Kieran, PabloF7z, Lyn Alden, Matt Odell, NVK, Gigi, Bitcoin Magazine, Satoshi. `src/data/mock/notes.ts:380-428` then assigns content templates to a **random** author, so real names emit invented opinions ("Inflation is theft…", "Major tech company announces Bitcoin support") with generated engagement counts. PabloF7z's bio is also factually false (`Developer of Damus iOS`, website `damus.io`).
*Why it blocks:* it is defamation-shaped, it puts a real payment identifier in a demo, and it destroys the consent strategy — you plan to ask Casarin, Pamplona and Kieran for permission while the demo puts words in their mouths. Alex Gladstein is HRF's Chief Strategy Officer, i.e. a plausible reader of an HRF application.
*Effort:* hours (one file). *Fix:* replace all 55 identities with invented personas (the file already has CodeWiz, Open Source Sarah, Stoic Steve as the pattern); strip every `website`, `nip05`, `lightningAddress` that resolves to a real entity; use `.invalid`/`.test` domains.

**B2 — No LICENSE, `"private": true`, no public repo.**
*What:* verified — no `LICENSE`/`COPYING`/`NOTICE` anywhere; `package.json` is `{"name":"sandstr","version":"0.1.0","private":true}` with no `license` field; `git remote -v` returns empty.
*Why it blocks:* default copyright = all rights reserved. OpenSats' application gates on "a proper open-source license"; HRF's programme is literally "Open-Source Bitcoin Grants". You are screened out before anyone forms an opinion. It also blocks the whole grant lane, the consent email, and any "self-hostable" claim.
*Effort:* minutes. *Fix:* MIT (matches 7 of the 9 clients you reproduce — Damus is GPL-3.0, Keychat AGPL-3.0), set `"license": "MIT"`, drop `"private": true`, push to a public GitHub, deploy to a real URL.

**B3 — Verbatim third-party assets shipped with zero attribution.**
*What:* `public/icons/` ships real client logos as binaries (damus.png, primal.png, snort.png, coracle.png, amethyst.png, gossip.png, keychat.svg, olas.svg, yakihonne.svg) rendered live in `src/host/Gallery.tsx`; `docs/refs/primal/screen-map.md:230-235` records Primal's swirl path taken verbatim from `logo_blue.svg`, and :920 records verbatim `translations.ts` strings. No NOTICE/THIRD-PARTY file exists.
*Why it blocks:* MIT's one condition is the copyright notice, so you are currently out of compliance with seven of the projects you want to befriend — an unforced error. Damus (GPL) and Keychat (AGPL) are worse. Note the distinction that protects you: reading `DamusColors.swift` for hex values and action ordering is **not** a license problem (facts, not expression); the exposure is the copied artwork and strings specifically.
*Effort:* hours. *Fix:* add `THIRD-PARTY.md` listing per client the repo URL, license, copyright line, and what was referenced vs. copied. Replace the verbatim Primal swirl with your own mark. Either keep real icons only where consent exists, or use the `ClientGlyph` monogram fallback that already exists.

**B4 — The one mandated legal mitigation truncates on the most common Android width.**
*What:* `DisclaimerStrip` in `src/host/ClientView.tsx` uses `text-[10px]` + `truncate`; measured at 320 px on /c/snort: scrollWidth 298 vs clientWidth 278 → renders "SIMULATION · mock data · unofficial, not affiliated wit…". Every client truncates at 320 px; YakiHonne truncates at 360 px. On phones the framed sims are full-bleed, so this strip is the *only* thing distinguishing the page from real Damus.
*Effort:* minutes. *Fix:* drop `truncate`, allow two lines, bump to 11–12 px; re-measure at 320/360/375.

**B5 — "Nothing leaves your browser" is false.**
*What:* `src/host/Gallery.tsx` renders that badge; verified 92 hotlink URLs across 31 files (dicebear 54, unsplash 34, picsum 4). Live: signed-in Snort loads 27 dicebear images, Olas 14, Coracle 21, Gossip 326 — each carrying the visitor's IP plus a per-profile seed to a third-party CDN. Companion: `src/lib/progressService.ts:13-29` writes a permanent `crypto.randomUUID()` device ID and defaults `{trackingEnabled: true, dataRetention: 'forever'}` directly under a comment saying "all opt-in, disabled by default".
*Why it blocks:* for this audience a false privacy claim is worse than no claim, and it is the first thing a technical visitor checks.
*Effort:* minutes to stop the bleeding; days for the real fix (§4). *Fix now:* soften the badge to "No account, no keys, no server"; delete `getDeviceId()`, flip the defaults, rename keys `nostrich-*` → `sandstr-*`, add a short `PRIVACY.md`.

**B6 — No readiness axis: 5 unfinished clients are presented as finished.**
*What:* `src/registry.tsx:64` is `const LEADS = new Set(['snort','amethyst','nostr-kitten','yakihonne'])` — a hardcoded set copied from the superseded AUDIT.md. `ClientEntry` has no status field. Coracle is a generic indigo card; Gossip (a Rust/egui desktop app in reality) is a generic dark-green web app; Keychat is a Material-blue messenger with 3 rows and wrong brand colour (`keychat.theme.css:7` = `#2D7FF9`, docs say purple); Olas is an Instagram clone.
*Why it blocks:* this is the owner's actual question, and it is also the strongest grant framing available — "4 faithful reproductions plus 5 in progress" beats "10 clients, half rough".
*Effort:* hours. *Fix:* add required `status: 'ready'|'preview'|'planned'` and `kind: 'reproduction'|'original'` to `ClientEntry`, carried in the existing `MOUNTS` record (not `shared/configs.ts` — that's consumed by the sims). Derive `lead: status==='ready' && kind==='reproduction'`, delete `LEADS`. Split the gallery into "Ready to try" / "Early previews" / "Not a real Nostr client". Wording discipline: "Early preview" only for things you can click; "Coming soon" only for `planned`; "Desktop only" is a platform fact, not a status. Preview chip must be neutral gray — amber belongs to the disclaimer alone.

**B7 — Nostr Kitten is the front door.**
*What:* it is the first gallery card with a ★ PICK badge and the top switcher chip, description "Pure vibes, zero trademark" — an internal joke about the exact risk being managed. CLAUDE.md forbids this explicitly. Meanwhile Damus and Primal, your two deepest rebuilds, carry no badge.
*Effort:* minutes. *Fix:* `kind:'original'`, sort originals last, own gallery section headed "Not a real Nostr client", chip reads "Original". Rewrite the description without the legal self-commentary.

**B8 — Snort's code block renders corrupted markup as visible text on the first note of a badged lead.**
*What:* live at /c/snort the top note renders `1"snort-code-keyword">fn parse_event(json: &str)…`. Cause in `src/simulators/snort/components/CodeBlock.tsx`: escape-then-inject, and the string regex re-matches the `"` inside the `<span class="…">` it just wrote; result goes to `dangerouslySetInnerHTML` (:217).
*Effort:* hours. *Fix:* cheapest safe route is to drop the regex highlighter and render plain monospace with line numbers — removes the corruption and the `dangerouslySetInnerHTML` a source-reading reviewer will flag.

**B9 — Dead ends: content unreachable with no scroller.**
*What:* three separate instances. (a) Gossip: `.gossip-main` computed `overflow-y: hidden`, clientHeight 765 vs scrollHeight 50,886 across 326 notes — 98 % unreachable; `gossip/components/Sidebar.tsx:94` also 404s on `/simulators/avatars/avatar-1.svg` (`public/simulators/` doesn't exist). (b) Snort login: `.snort-main` 765/900, the "New to Nostr?" block and the working Sign In button are below the fold — a dead end on the first screen. (c) Nostr Kitten: 765/1419, 654 px unreachable, plus absolutely-positioned badges escaping the card.
*Effort:* hours. *Fix:* `overflow-y: auto` on the frameless card body (a scrollbar *inside* the card is correct — the shell is intentionally non-scrolling); slice Gossip's feed to ~25 notes; bundle or replace the missing avatar.

**B10 — The 640–768 px band deletes all navigation.**
*What:* `useMediaQuery.ts:31` `MOBILE_QUERY = '(max-width: 639px)'`, `ClientView.tsx:192` `gated = isMobile && !frame`. At 768×1024 Snort's left and right sidebars compute width 0 — Timeline/Profile/Relays/Settings simply gone, no replacement. iPad portrait is 768 px; a half-screen laptop window is ~720 px.
*Effort:* hours. *Fix:* add `NARROW_QUERY = '(max-width: 767px)'` and use it for `gated` only — leave `MOBILE_QUERY` driving the compact bar so tablets don't get phone chrome. Comment that the real cause is viewport `@media` instead of `@container` in the sims' theme CSS, and that the container-query conversion is a separate, larger job.

**B11 — The desktop gate recommends your two weakest sims.**
*What:* `ClientView.tsx:124` `clients.filter((c) => c.frame)` → the "try these now" row offers Keychat and Olas. The one screen whose argument is "we'd rather send you elsewhere than show you a broken app" hands you the broken apps.
*Effort:* one line. *Fix:* `c.frame && c.status === 'ready'` → Damus, Amethyst, YakiHonne. Keep the gate and status as separate axes; when gated, append one sentence rather than stacking a preview chip.

**B12 — Every shipped count says "10 clients", including the baked `og.png`.**
*What:* `Gallery.tsx:77`, `scripts/og-image.html:169`, `index.html:34` (og:image:alt), `index.html:7`, `public/site.webmanifest:4`, README:6, CLAUDE.md. `public/og.png` is a 274 KB raster containing the text and is cached by every scraper that sees the first share.
*Effort:* hours. *Fix:* derive the counts from status in the hero; regenerate og.png with the number removed; make `og:image`/`og:url` absolute (index.html's own comment already flags that Twitter won't resolve relative paths). **Do this before the first public link is shared** — the raster is the one asset you cannot fix retroactively.

**B13 — Debug logging ships to production.**
*What:* ~40 `console.log` in `src/`; `keychat/KeychatSimulator.tsx:49` logs on every render, plus `=== LOGIN HANDLER CALLED ===` (:139) and friends; `[TourAutoStarter]` observed live on /c/damus. Devtools is the first thing a technical reviewer or a client author opens.
*Effort:* minutes. *Fix:* strip or gate behind `import.meta.env.DEV`; keep `console.error` in `MockKeyDisplay.tsx:42`; add a no-console lint rule.

**B14 — No robots.txt; the meta description competes for other teams' marks.**
*What:* `public/` contains no robots.txt (verified listing). `index.html:7` advertises "Interactive simulations of Damus, Amethyst, Primal, Snort and more" and `/c/damus` is a crawlable deep link. A user searching "Damus" landing on a full-bleed pixel-faithful Damus is the textbook confusion pattern — and ranking for "Damus" is worth almost nothing to you.
*Effort:* minutes. *Fix:* `Disallow: /c/`, allow `/`; rewrite the description around value, not brand names; `noindex` on client routes.

**B15 — No outbound link to any real client.**
*What:* `grep href="http` across `src/host/` and `src/registry.tsx` returns nothing. The good attribution sentence in `ContextPanel` is `hidden … lg:flex`, i.e. invisible below 1024 px — every phone.
*Why it blocks:* it is the cheapest material risk reduction available and it converts "a copy of Damus" into "a pointer to Damus" — better trademark posture, better opening line in the consent email, and the only observable evidence that the product does what it claims (help people choose a client).
*Effort:* hours. *Fix:* homepage + repo URLs per registry entry; "Made by <team>. Visit the real <client> →" as a real anchor in ContextPanel, on gallery cards, and in the /c/:id header menu so it exists at every breakpoint.

**B16 — Clients render in the wrong default theme (this is the "drift" the owner felt).**
*What:* `src/main.tsx` seeds `dark` from `prefers-color-scheme` only. On a light-mode OS, /c/damus, /c/amethyst and /c/primal all open light — but their real defaults are OLED dark, Amethyst OLED black, Primal Midnight, per `docs/refs/damus/screen-map.md` and CLAUDE.md. So on roughly half of first visits your three strongest reproductions look wrong, and fidelity is the product's core claim.
*Effort:* hours. *Fix:* `defaultTheme?: 'dark'|'light'` on `ClientEntry` (damus/amethyst/primal → dark, yakihonne → light), applied on mount, host toggle still overrides.

*Deliberately not blockers, for the record:* the number of finished simulators, the tour-controls overlay, YakiHonne's FAB, reduced-motion, the ⌘K scrim, every "subtle" fidelity item. **No grant reviewer will diff your Damus against real Damus.** Fidelity matters to the grant through exactly one channel: whether the maintainers say yes.

---

## 3. WHICH SIMULATORS SHIP

| Client | Ship as | Platform | Why (from the audits) | Card wording |
|---|---|---|---|---|
| **Damus** | **Ready** *(after §4 glaring list — ~half a day)* | Framed, iOS | Chrome is faithful (4 tabs, gradient FAB, shaka-first order, drawer, relays); note card is laid out Twitter-style, Follow label is invisible, two tab icons render as blobs | — |
| **Amethyst** | **Ready** *(after ~10 lines + 2 tabs hidden)* | Framed, Android | Best structure in the repo, but every action row currently renders in Comic Sans on Win95 grey from a CSS collision; Discover and Shorts are generic non-Amethyst screens | Hide/soft-gate Discover + Shorts inside the sim as "coming soon" |
| **YakiHonne** | **Ready** *(after 1 functional fix + 2 tokens)* | Framed, mobile | Structurally the most faithful checked — settings, notifications copy, search, relays near-verbatim; feed-source picker renders 87 % off-screen and is unclickable | — |
| **Primal (web)** | **Ready** *(after 1 import line + 2 overflows)* | Frameless, desktop | Best-evidenced sim (`docs/refs/primal/screen-map.md`, 1097 lines, 11 shots); one mobile-CSS leak turns nav badges orange and stacks them on the labels | "Desktop only" |
| **Snort** | **Early preview** | Frameless, desktop | Mislabeled a lead: none of Snort's real tokens (`#7c3aed` vs `#ac88ff`, `#0f172a` vs `#000`, `#ff3f15` absent), invented nav, invented right sidebar, no `docs/refs/snort/screen-map.md`, corrupted code block | "Early preview — layout and brand marks not yet verified against the real client" |
| **Coracle** | **Early preview** | Frameless, desktop | Generic indigo card with an invented paper-plane logo; 5 files still hotlink; card clips | "Early preview — an early sketch, not yet a faithful reproduction" |
| **Gossip** | **Early preview** *(or pull from v1)* | Frameless, desktop | Real Gossip is a Rust/egui desktop app; sim is a generic dark-green web app, 326 notes in a 765 px pane with `overflow:hidden`, 326 dicebear requests, one 404 asset | "Early preview — the real Gossip is a native desktop app; this is a rough web sketch". Pulling it entirely is also defensible |
| **Keychat** | **Early preview** | Framed, mobile | Generic Material-blue messenger, 3 chat rows, 2/3 empty; brand colour is documented-wrong (blue, should be purple); per-render console spam | "Early preview — brand and layout not yet verified" |
| **Olas** | **Early preview** | Framed, mobile | Instagram clone with DiceBear robots and a hotlinked Unsplash photo; 6 files hotlink | "Early preview — an early sketch, not yet a faithful reproduction" |
| **Nostr Kitten** | **Original — last section** | Frameless, desktop | Finished, but not a real Nostr client; currently the ★ front door, which CLAUDE.md forbids | Chip: "Original". Not "preview", not "coming soon". Description: "A deliberately silly original client — not a real one. Built to show the shell works with anything." |

*Primal-mobile:* still a stub; it should not have its own card. Either leave Primal as one desktop entry, or add it as the first `planned` card to prove the slot works.

**Honest headline:** 4 reproductions ready, 5 early previews, 1 original. Not "10 clients". Fix CLAUDE.md:81 in the same commit — Snort belongs in the second wave until it has a `docs/refs/snort/screen-map.md` like the other four.

---

## 4. FIDELITY: what to fix per client

**Walk order: Primal → Amethyst → YakiHonne → Damus. Do not walk Snort — demote it.**
Rationale: Primal's single glaring item is one import line; Amethyst's worst item is ~10 lines but is currently the most visibly broken thing in the repo on a cold load; YakiHonne has one hard functional break; Damus is the longest list (the owner's own observation) at about half a day.

**Worst client: Snort.** It is the only one of the five "leads" with no committed reference material at all (`docs/refs/snort/shots/` holds a `.mov` that is gitignored), and it uses none of Snort's real tokens. It needs the full recon → screen-map → token-first rebuild playbook, which is weeks, not hours. Ship it as preview and leave it alone.

### 1. Primal — ~30 min for the glaring three
- **Nav badges orange and stacked on the labels.** `src/simulators/primal/PrimalWebSimulatorWithTour.tsx:9` imports the barrel `./index`, which drags in `mobile/primal-mobile.theme.css` and its **unscoped** `.primal-nav-badge` (line 227, `#F97316`), which loads last and wins. Verified present in the production build too. → import `from './web/WebSimulator'`. Belt-and-braces: scope every selector in `primal-mobile.theme.css` under `.primal-mobile` (it currently declares ~40 globals on `:root`).
- **Profile stat strip overflows** (462 px visible vs 652 px content; zaps/relays unreachable; number and label render inline instead of stacked) — `primal-web.theme.css:704-725`.
- **Explore right sidebar wraps and clips** — stat numbers break mid-number, the 4-column user grid truncates names — `primal-web.theme.css:590-610`.
- Then, cheap and worth it: active Messages icon renders as a solid rectangle (`LeftSidebar.tsx:14`, drop `fillable` for Mail); nav labels are 21 px/bold vs the spec's 17 px/400 with colour (not weight) as the active cue; the feed-selector dropdown has no `onClick` at all (`web/screens/HomeScreen.tsx:20`) — it is the mechanic Home is built around; remove the Twitter placeholder "What's on your mind?" from `ComposeBox.tsx:38` (real Primal has none).

### 2. Amethyst — ~1 hour for the glaring set, plus a decision on two tabs
- **The `.action-btn` class collision.** Defined unscoped in *both* `nostr-kitten/nostr-kitten.theme.css:403` and `amethyst/amethyst.theme.css:580` — the only such collision in the repo. `ClientSwitcher.tsx:155-156` preloads adjacent clients and Kitten sits next to Amethyst in the rail, so Kitten's sheet wins the tie and every note action row renders as Comic Sans on Windows-95 silver. It breaks in reverse too. → scope Kitten's rules under `.nostr-kitten-simulator`.
- **Wrong brand purple:** `--md-primary: #D0BCFF` (generic Material You) → `#BB86FC` (`amethyst.theme.css:129`). This is exactly the failure mode `docs/FIDELITY.md` warns about.
- **FAB** is `#4F378B` with 16 px radius; should be `--md-primary` and a true circle (`amethyst.theme.css:283-296` + drop `rounded-2xl` in `FloatingActionButton.tsx:45`).
- **Feed cards** are 15 px-radius elevated cards with 8 px gutters and a rule *above* the action row; real Amethyst is flat, edge-to-edge on black with a `#2F2F2F` divider *between* notes (`screens/HomeScreen.tsx:172`, `components/MaterialCard.tsx:102,207`).
- **Bottom nav** paints a selection pill and a 3 px indicator bar that don't exist; the real cue is the icon tinted `#BB86FC` (`amethyst.theme.css:400-421`, `BottomNav.tsx:41-56`).
- **Discover and Shorts** render no `AppTopBar` and are invented screens (Shorts has an invented "Amethyst Video" wordmark and 4 live `picsum.photos` requests at `VideoScreen.tsx:25,38,51,64` — note this falsifies the "zero remote requests" line in `docs/refs/amethyst/screen-map.md:89`). → strip the invented branding and the picsum calls now; mark both tabs coming-soon inside the sim rather than shipping them as Amethyst.
- Also fix before showing Pamplona: `public/icons/amethyst.png` has opaque white corners, so the app bar renders the mark in a white box (`MessagesScreen.tsx:64,117`).

### 3. YakiHonne — ~1 hour
- **Feed-source picker is unusable.** `components/FeedSelector.tsx` renders its `absolute inset-0` overlay inside `HomeScreen.tsx:31`'s `sticky` header (62 px tall), so the sheet lands at y = −276 and 5 of 6 sources are unclickable. → hoist the sheet to the simulator root as a sibling of `TabBar`/`Drawer`, which is the pattern `ComposeSheet` and `Drawer` already use correctly.
- **Like state is purple.** `--yh-like: #9333ea` (`yakihonne.theme.css:20`) — the reference pixel-samples to `#EE7700`. This is the one colour `docs/FIDELITY.md` explicitly warns about, inverted. Delete the wrong comment on that line too.
- **Scaffold too dark:** `--yh-bg: #0a0a0b` vs the measured `#171718`; chips land at ≈`#1a1a1b` vs `#222424`. The whole surface ladder reads one notch too contrasty.
- **DM Sans is declared but never bundled** — `grep font-face` returns nothing, so every glyph is SF Pro. Bundle the OFL woff2 locally (no CDN).
- Then: 10 px card gutters and 30 px avatars (currently 16 px / 44 px), FAB shown on the Articles feed where the reference has none while DMs has none where the reference does, zap count colliding with the translate icon, profile avatar is a rounded square (should be an 80 px circle).

### 4. Damus — ~half a day; this is what the owner saw
- **Note card is laid out Twitter-style.** In real Damus the avatar + name row sit on the top line and the **body and action row run full width from the card's left margin** (measured 16 pt in the reference frames); the sim indents both past the avatar (72 px vs 33 px). → `components/NoteCard.tsx:74-131`: keep only the header inside the `flex gap-3` row; move the body (:98), media grid (:106) and action row (:115) out as siblings under the `<article>`. This fixes thread, profile and notifications for free.
- **Avatar floats to the vertical middle of the post.** `NoteCard.tsx:74` is `<div className="flex gap-3">` with no `items-start`, so the `shrink-0 mt-0.5` button stretches and centres its 44 px image — measured 157–168 px below the name row, grotesque next to a 10-line code block. Add `items-start`. Same pattern to check in `snort/screens/TimelineScreen.tsx:132`, `snort/screens/ThreadScreen.tsx:108`, `shared/components/NoteCard.tsx:97`.
- **Follow button label is invisible** — computed `background: #fff` *and* `color: #fff`, because `.damus-btn { color:#fff }` in `damus.theme.css:94` beats the Tailwind utility. Drop `color` and `font-size` from the `.damus-btn` base and move them to variants; the same bug is latent in `SearchScreen.tsx:78-83`. Also render "Edit" on your own profile (`ProfileScreen.tsx:52-58`).
- **Active DMs/Notifications tab icons render as solid blobs** — `components/icons.tsx:26-43` sets `strokeWidth: filled ? 0 : 1.9` on the `<svg>`, which the inner detail paths inherit. Give those paths their own `strokeWidth={1.9}`.
- **Sticky headers are transparent** — `bg-[var(--damus-bg)]/85` is invalid Tailwind (opacity modifier on a CSS variable emits nothing), so scrolled avatars smear through. Four files: `HomeScreen.tsx:33`, `NotificationsScreen.tsx:29`, `SearchScreen.tsx:28`, `DMScreen.tsx:25`.
- **Profile banner is a pink gradient band** where the real one is plain dark, plus invented QR/circle-chrome action buttons (`ProfileScreen.tsx:33,48-51`).
- **Tab bar and FAB unmount on profile/thread pushes** — those are stack pushes in real Damus, not modal takeovers (`DamusSimulator.tsx:129`).
- Then the cheap ones: segmented underline is a fixed 36 px stub under a 119 px label; profile empty state silently fills with other users' notes; gradient angles are mirrored (150/160deg → 200deg); CTAs are full capsules where the spec is 12 px radius; 4 of 9 drawer rows are dead taps.

**Cross-cutting, lands once, lifts Snort/Olas/Keychat/Coracle/Amethyst/Gossip together:** the 92 hotlinks, and the fact that post images are flat CSS gradients that read as failed image loads. Bundle ~10 licence-clean photos as `data:` URIs keyed by note id, and use the inline-SVG `Avatar` everywhere. This is the highest-leverage engineering task in the repo — it raises fidelity *and* unlocks offline + strict CSP.

---

## 5. GRANT PLAN

**Honest odds today: ~0 %, and not because of quality.** Verified: no LICENSE, `private: true`, empty git remote, 21 local commits, oldest 2026-07-14 (the project is 14 days old), no deploy config, no public URL. OpenSats' form gates on the licence; HRF's programme is "Open-Source Bitcoin Grants". You are screened out before a human reads anything.

**Primary funder: OpenSats / The Nostr Fund.** No Bitcoin hook required, nym-friendly, and clear precedent in the category (Nostr Design, Wisp, 44Billion, Nostr How). The gate that is *not* a writing problem: **two reference letters — evaluation does not begin without them.**
**Second: HRF Bitcoin Development Fund.** Rolling intake, no deadline, typical $25–35k, and LearnNostr (Q1 2026) proves an education-only Nostr project can clear it. But it cleared on an authoritarianism framing sandstr does not have and would have to *earn* — i18n and genuine offline operation, not a paragraph. Complication: HRF has funded Damus and Coracle directly; OpenSats funded Amethyst Desktop this April. Program staff know these people personally.
**Third, worth a look, unverified:** OTF Internet Freedom Fund (bigger money, stricter diligence; I could not read opentech.fund directly — it returned 403 — so treat the figures and the May 7 deadline as unconfirmed). NLnet NGI Zero Commons would have been the structurally best fit and closed its final call 1 June 2026; three successor funds are listed "coming soon" — worth a monthly check.

**Timing:** do **not** apply in the August OpenSats window. You would burn your two reference letters on an application that fails at screening. Target **1 Oct – 30 Nov**. HRF is rolling — submit whenever repo, licence, live URL and at least one maintainer's blessing exist.

**Estimated odds after the work below — my judgment, not data:** with licence + public repo + live URL + two references but *no* maintainer endorsement, OpenSats is low single digits, because the trademark question gets decided by a nervous program officer with no policy to argue against. With two or three client teams saying yes in writing, I'd put it somewhere in the 15–25 % range. That delta is the entire grant strategy.

### The one thing for the next 2 weeks: make it public, then put it in the maintainers' hands
It is the only item on this whole document **not under your unilateral control**, so it has the longest lead time. It is simultaneously CLAUDE.md's primary trademark mitigation, OpenSats' gating reference requirement (Nostr-signed references are explicitly a plus), the single strongest sentence any application could contain, and a kill-switch test of the thesis: if Damus says no, you need to know in August, not after three more months of polish.

**Consent-outreach package** (send nothing until B1–B4, B6 and B15 have landed — the current site would show an author fabricated posts under his own name and NIP-05):
1. A live link to *that client's* page, on a real domain that is not a play on any client's name.
2. One paragraph: what this is and explicitly is not.
3. The `THIRD-PARTY.md` entry showing exactly what was referenced (tokens, ordering — facts) vs. copied (icon, strings), and under which licence.
4. A screenshot of the disclaimer and of the outbound "visit the real <client>" link.
5. An unconditional offer: "I will fix any fidelity error you name, or remove the reproduction entirely, no questions asked."
6. One clear ask: "May we keep your name and icon on this page?"
7. A 90-second screen capture.

*Order — I differ from the adversarial lane here.* It recommended starting with hodlbod (Coracle) and pablof7z (Olas) as most receptive. But their reproductions are among the weakest in the repo, and a bad reproduction is precisely what triggers "take it down". What you show matters more than who you ask. So: **Vitor Pamplona (Amethyst) → Primal team → JustHonne (YakiHonne) → Will Casarin (Damus)** once their four sims are fixed; approach hodlbod and pablof7z separately with the honest "this one is an early preview, here's the plan, want it removed or improved?" framing — which is a genuinely good conversation to have and low-stakes practice for the script. Log every reply in-repo; "three client teams have said yes in writing" is a load-bearing sentence.

### The three after, ranked by odds-improvement ÷ effort
1. **Kill the 92 hotlinks; ship a fully offline, self-hostable static build.** Pattern already proven on Amethyst and Damus. It converts a tech-debt line into HRF's and OTF's core narrative and a budget line ("deployable behind hostile networks"), makes a strict CSP possible, and raises fidelity at the same time. Best remaining ratio.
2. **Manufacture the evidence you're claiming.** "The only part of the guide that got traction" appears nowhere as evidence — no note IDs, no zap or reaction counts, no analytics. Collect the actual notes, put the numbers in the repo, add privacy-preserving analytics to the live site, write a short `AUDIENCE.md` naming who, where, in which languages, on what evidence. The entire "potential impact" score currently rests on an unverifiable anecdote.
3. **Add a real handoff.** Every simulator should end with "install the real one" — real download links, real client deep links, a "here's what changes when the keys are yours" screen. It answers "does anyone actually end up on Nostr", creates a measurable funnel, and begins to answer the deepest objection: that sandstr *depicts* Nostr rather than using it (no relay, no NIP, no key, no event — nothing here breaks if the protocol changes).

**Two objections you cannot fully answer, so answer them honestly in the application rather than hoping they don't come up:** (a) you are proposing a hand-maintained mirror of nine moving targets staffed by one person — your own observation that Damus drifted in two weeks is evidence for the objection; propose a mechanism (screenshot diffing, maintainer-owned fixtures, upstream-sync cadence) or scope down to fewer clients maintained well. (b) 4 of 21 commits are authored by `Claude <noreply@anthropic.com>`. Rewriting history to hide that is worse than disclosing it; a one-line note in CONTRIBUTING is neutral.

---

## 6. SEQUENCED PLAN

Assumes one person, part-time, ~10–15 h/week. Ship v1 at the end of week 2; grant-ready at the end of week 6.

**Week 1 — legal, identity, and going public (nothing here is fidelity work).**
B1 (rewrite `users.ts` to fictional personas — do this first, everything else is gated on it) · B2 (LICENSE, drop `private`, push public, deploy to a real domain) · B3 (`THIRD-PARTY.md`, replace the verbatim Primal swirl) · B4 (disclaimer wrapping) · B5-now (soften the privacy badge, gut `progressService`, add `PRIVACY.md`) · B13 (console) · B14 (robots + meta) · rewrite README as a product README and put a dated "superseded" banner on `docs/AUDIT.md`.
*Deliverable: a public repo with a licence and a live URL.*

**Week 2 — honest packaging and the four dead ends. Ship v1.**
B6 (status/kind axis + gallery sections) · B7 (Nostr Kitten demoted, LEADS deleted) · B11 (gate row filters to ready) · B10 (NARROW_QUERY) · B9 (card scrollers, Gossip overflow + 25-note slice + missing avatar) · B8 (Snort code block) · B15 (outbound links at every breakpoint) · B12 (copy + regenerate og.png + absolute og tags — **before any public link is shared**) · correct CLAUDE.md:81 (Snort → second wave).
*Deliverable: public v1. 4 ready, 5 preview, 1 original.*

**Week 3 — fidelity walk, part 1, and the theme decision.**
B16 (`defaultTheme`) · Primal (one import line + two overflows + nav scale) · Amethyst (CSS collision, `#BB86FC`, FAB, flat cards, bottom nav, drop the picsum calls and the invented "Amethyst Video" branding, hide Discover/Shorts) · YakiHonne (feed picker, like colour, scaffold, bundle DM Sans).

**Week 4 — Damus, then the package.**
Damus glaring list (card restructure, `items-start`, `.damus-btn` colour, tab icons, header opacity, banner, tab-bar persistence) · record the 90-second capture · assemble the outreach package · send the first two DMs (Pamplona, Primal).

**Week 5 — de-hotlink.**
The 92 hotlinks across 31 files, plus the flat-gradient post images. Then commit `netlify.toml` with the security headers and a `Content-Security-Policy-Report-Only: default-src 'self'` to confirm nothing else leaks, then enforce. Send the remaining DMs (YakiHonne, Casarin) now that Damus is fixed.

**Week 6 — the "so what".**
Real-client handoff screens + `AUDIENCE.md` + the traction evidence + analytics. Then: **submit to HRF** (rolling) and start drafting for the OpenSats **1 Oct – 30 Nov** window, chasing the two reference letters in parallel.

### Deliberately do NOT do
- **Do not rebuild Snort.** It needs the full recon → `screen-map.md` → token rebuild (weeks). Preview label, move on. Also skip Deck mode.
- **Do not touch Coracle, Gossip, Keychat or Olas beyond the dead-end fixes and the Keychat colour.** They are labelled preview; that label is doing the work.
- **Do not rebuild Amethyst's Discover/Shorts or Primal-mobile.** No reference shots exist; hide them.
- **Do not do any "subtle" fidelity item** in the audits until after the grant application — number formatting, gradient stop angles, drawer scrim opacity, avatar sizes, picker font weights. Nobody will check, and each one costs the same attention as a blocker.
- **Do not do i18n yet.** It only pays off if HRF/OTF becomes the primary lane, which is a decision for week 6, not now.
- **Do not apply to OpenSats in August.**
- **Do not touch `useSimulator`, the pre-existing `tsc` errors, or the tour engine.** They are scaffolding, not load-bearing, and nothing on this list depends on them.
- **Do not add features.** Every hour spent on a new client is an hour not spent on the one item — maintainer consent — that has four-way leverage and the longest lead time.