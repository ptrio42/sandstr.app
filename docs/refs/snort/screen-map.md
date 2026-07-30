# Snort (web) — Ground-Truth Reproduction Spec

Authoritative spec for a faithful React/Tailwind web reproduction of the Snort Nostr web client.

**Sources**
- **Recording:** `docs/refs/snort/shots/Nagranie z ekranu 2026-07-14 o 22.34.31.mov` — owner's capture of the real
  `snort.social`, recorded **2026-07-14**, 4:12 (252 s), 2868×1592 @60 fps ≈ **1434×796 CSS px @2× (desktop, LIGHT theme,
  signed in)**. Frames extracted to `docs/refs/snort/shots/frames/` + `periodic/` + `full/` (all gitignored).
- **Repo recon:** `v0l/snort` @ **`3cc8317af0b95ca227d8c91b014eea414e0ac26f`** ("chore: bump @snort/system to 2.1.7",
  2026-07-29). **`github.com/v0l/snort` is canonical** — `git.v0l.io` is a mirror (verified 2026-07-29). License **MIT**,
  © 2023 Kieran (v0l).
- Stack: React 19.2 · **Tailwind v4.1** (CSS-first `@theme`, **no `tailwind.config.*` exists**) · react-router 7 ·
  react-intl 7 · Radix dropdown/hover-card · `classnames`. Breakpoints are Tailwind v4 defaults:
  `sm 640 · md 768 · lg 1024 · xl 1280`.

**Convention:** repo wins for exact HEX / icon names / label strings; the **recording wins for LAYOUT** and for
"what actually shipped". Divergences flagged **[REC vs REPO]**.

**Pixel samples.** Hexes sampled from the recording run ~5 % darker/more saturated than the CSS value, because macOS
captures in Display P3 and the JPEG is decoded as sRGB. Sampled values below are given only as *corroboration*; the
repo hex is authoritative. (e.g. `--primary #ff3f15` sampled as `#ed2518`; `--live #f83838` sampled as `#dd2a3f` —
distinct in the same frame, which is how we know they are two different tokens.)

> ## ⚠ OPEN QUESTION — confirm the brand with the maintainer before shipping
> The GitHub repo's homepage field now points at **phoenix.social**, which serves a byte-identical build, while the
> PWA manifest still says snort.social. No rename announcement was found as of 2026-07-29.
>
> **What the source says (recon verdict): the canonical brand is still Snort.** The repo is a multi-brand
> white-label: `packages/app/config/{default,iris,meku,nostr,phoenix,soloco}.json`, selected at build time by
> `NODE_CONFIG_ENV` via the `config` npm package (`packages/app/config/README.md`, `packages/app/vite.config.ts`).
> - `config/default.json` **is Snort** — `appName "Snort"`, `hostname "snort.social"`, `publicDir "public/snort"`.
> - **All four Drone pipelines set `NODE_CONFIG_ENV: default`** (`.drone.yml:25,66,98,145`); the GitHub workflows set
>   nothing, i.e. also default. Images publish as `voidic/snort`.
> - `config/phoenix.json` is a near-verbatim copy of `default.json` (only appName/appTitle/hostname/nip05Domain/icon/
>   publicDir and the first relay differ), and its asset dir is **partly broken**: `public/phoenix/manifest.json` points
>   at a nonexistent `phoenix_256.png`, and `public/phoenix/.well-known/*` + `robots.txt` still declare **Snort's**
>   app IDs (`social.snort.app`) and Snort's sitemap.
> - The Snort brand is hardcoded in app logic: `isBirthday()` is gated on `CONFIG.appName === "Snort"`
>   (`src/Utils/index.ts:455`), and `Nip05.tsx:38-39` gradient-highlights `snort.social` *in addition to*
>   `CONFIG.nip05Domain`. `README.md`, `zapstore.yaml`, `maintainers.yaml`, `AGENTS.md` and every `@snort/*` package
>   name say Snort.
>
> Phoenix reads as a white-label deployment, **not** a rename — but nothing in-repo explains the homepage field, so a
> rebuild must confirm current branding + logo usage with Kieran (`v0l`) as part of the opt-in ask.

---

## 1. Color tokens

All tokens live in **one `@theme` block**: `packages/app/src/index.css:6-61`, with the light overrides in
`html.light` at `:106-123`. **Dark is the CSS base; light is an opt-in class.**

| Token | Dark (base) | Light (`html.light`) | Role |
|---|---|---|---|
| `--bg-color` | `#000` | `#fff` | page background (**pure black**, not `#121212`) |
| `--nearly-bg-color` | `#090909` | `#f9f9f9` | secondary surface |
| `--header-bg-color` | `rgba(0,0,0,.3)` | `rgba(255,255,255,.3)` | sticky header behind `backdrop-blur-lg` |
| `--font-color` | `#fff` | `#0f0f0f` | primary text **and default icon color** |
| `--font-secondary-color` | `#a7a7a7` | `#5c6c92` | ghost-button label, muted text |
| `--primary` | `#ff3f15` | `#ff3f15` | **CTA orange-red** — compose FAB, Send, upload bar |
| `--highlight` | `#ac88ff` | **`#7139f1`** | **accent violet** — links, hashtags, mentions, unread, new-notes pill |
| `--error` | `#ff6053` | — | offline relay, delete, unverified-nip05 ×, profile mute button |
| `--success` | `#2ad544` | — | connected relay, follow-distance check, Preview toggle "on" |
| `--warning` | `#ff8800` | — | content warnings, NIP-07 key badge, "Good" uptime |
| `--live` | `#f83838` | — | **LIVE badge on stream cards** (distinct from `--primary`) |
| `--heart` | `#ef4444` | — | like/reaction (**a heart, not an emoji**) |
| `--zap` | `#ff710a` | — | zaps |
| `--repost` | `#1ecbe1` | — | repost **cyan/teal** (see §4 — mostly unreachable) |
| `--mention` | `#961ee1` | — | mention *filter* icon only (`Notifications.tsx:131`) |
| `--pro` | `#ffdd65` | — | subscription diamond, "Paid" relay chip |
| `--free` | `#1a5aff` | — | "Free" relay chip |

**Layer scale — inverts direction in light mode:**

| Token | Dark | Light |
|---|---|---|
| `--color-layer-1` | `neutral-900` `#171717` | `neutral-200` `#e5e5e5` |
| `--color-layer-2` | `neutral-800` `#262626` | `neutral-300` `#d4d4d4` |
| `--color-layer-3` | `neutral-700` `#404040` | `neutral-400` `#a1a1a1` |

Consumed via two utilities (`index.css:67-81`): `layer-1` / `layer-2` = `bg-layer-N rounded-lg border px-3 py-2`,
plus `-hover` variants that step one layer up. **Global border color for everything**: `* { @apply
border-neutral-800 light:border-neutral-400 }` (`:63-65`) — this is the note divider, card border and thread line.

**Gradients**

| Gradient | Stops | Where it is actually used |
|---|---|---|
| `--snort-gradient` | `#a178ff → #ff6baf` (90deg) | **only** `text-snort-gradient` on a *verified* first-party nip05 **domain** (`Components/User/Nip05.tsx:61`). NOT on the wordmark. |
| `--dm-gradient` | `#5722d2 → #db1771` (90deg) | **only** your own DM bubbles (`Pages/Messages/DM.tsx`). Light mode sets it to the flat `#dee1e8`, fed into `background-image` → invalid → transparent. |
| `--invoice-gradient` | `neutral-800 50% → rgba(161,120,255,.2) → rgba(255,107,175,.2)` (45deg) | lightning invoice cards |
| `--gray-gradient` | `neutral-700 → neutral-700 → neutral-100` | decorative |

**Accent discipline (the thing a reproducer gets wrong):** violet `--highlight` and orange-red `--primary` **coexist
and never blend**. `--primary` is compose/CTA only. `--highlight` is links + "new content". The current Sandstr sim's
teal is not the accent — teal `#1ecbe1` is only `--repost`.

---

## 2. Typography

- **Stack:** `body { font-family: "Inter", sans-serif }` (`index.css:125-135`). That is the whole stack. No `@theme`
  font-family token exists, so Tailwind's `font-sans` utility still resolves to Tailwind's default stack — **only
  `body` inheritance carries Inter.**
- **Bundled:** `src/assets/fonts/inter.css` — 7 `.woff2` subset files (latin, latin-ext, cyrillic, cyrillic-ext,
  greek, greek-ext, vietnamese), 28 `@font-face` rules declaring weights **400/500/600/700**, all `font-style: normal`,
  `font-display: swap`. **No italics, no 300/800/900.** CSP is `font-src 'self'` — fonts must be local.
- **Base size:** `--font-size: 15px` — body text *and* every button label.
- ⚠ `--font-size-small` (13px) and `--font-size-tiny` (11px) are **dead** — referenced nowhere. And because this is
  Tailwind v4 (where the type namespace is `--text-*`, not `--font-size-*`), these three custom props generate **zero
  utility classes**. The UI actually runs on **Tailwind's default type scale**: measured usage `text-sm` 148 ×,
  `text-xs` 44 ×, `text-xl` 43 ×, `text-lg` 38 ×, `text-2xl` 25 ×, `text-base` 11 ×, `text-3xl` 7 ×.
- **Hardcoded headings** (`index.css:387-415`): all `font-weight: 600`, `padding: 0`; h1 `32/42`, h2 `26/36`,
  h3 `20/30`, h4 `18/28`.
- `small` (`:154-156`): `@apply text-neutral-300 leading-6 font-medium light:text-neutral-500`.
- `code`: `source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace`.

---

## 3. Buttons, inputs — the pill system

**Every bare `<button>` is a white pill.** `index.css:217-239` applies `@utility button` to `button`,
`button[type=reset]`, `button[type=submit]`:

```
padding: 10px 16px · font-weight: 600 · font-size: 15px · color: black · background: white
border: none · border-radius: 100px · position: relative (hosts AsyncButton's spinner)
```
Hover → `neutral-100`. Disabled → `opacity: .3; cursor: not-allowed`. `button.tall` → `height: 40px`.
`.action-heading button` → `min-width: 98px`.

| Variant | Class | Dark | Light |
|---|---|---|---|
| Primary CTA | `.primary` | `--primary #ff3f15` fill, white text; hover = **orange glow** `0 0 10px var(--primary)`, fill unchanged | same fill + `shadow rgba(0,0,0,.08) 0 1px 1px` |
| Secondary | `.secondary` | `neutral-700` fill, font-color text; hover → `neutral-800` | **white fill, `#4b5c83` text, 1px `neutral-800` border, subtle shadow** |
| Ghost | `.transparent` | transparent, `--font-secondary-color` text, 1px `neutral-800` border, **weight 400** (the only variant that drops from 600); hover **inverts** to solid white pill w/ black text | text → `--font-color` |
| Icon (CSS) | `.icon` | 40×40 + inherited radius 100px = **circle**; `background: var(--bg-secondary)` → ⚠ **undefined in dark**, so unfilled; hover glyph → `--highlight` | `#f5f5f5` fill + 1px border + shadow |
| Icon (React) | `IconButton` | `w-10 h-10 aspect-square !p-0 !m-0 bg-neutral-800 text-white` | see §3.1 |
| Small icon | `.button-icon-sm` | `padding: 4px; border-radius: **8px**` (not a pill); `.active` → `rgba(255,255,255,.1)` | — |
| `.btn` family | `.btn` | `padding: 10px; border-radius: **5px**`; hover text → `--highlight`; `.active` → weight 700 | text `#64748b` |

**Inputs are pills too.** `.btn, input, select { @apply rounded-full }` (`:241-245`) **overrides** the 12px radius
set at `:417-429` (`padding: 8px 12px; background: transparent; border: 2px solid rgba(255,255,255,.1);
border-radius: 12px; font-size: 15px; line-height: 24px`; light border → `2px solid neutral-400`).
**`textarea` keeps the 12px radius** — only `input`/`select` become pills. Placeholders `text-neutral-500`.

### 3.1 ⚠ The light-mode specificity trap (explains the whole recording)

`index.css:524-546` styles buttons by *element* selector under `.light`:

```css
.light button, .light button.secondary { color: #4b5c83; background-color: #fff;
  border: 1px solid var(--color-neutral-800); box-shadow: rgba(0,0,0,.08) 0 1px 1px; }
.light button.primary { background: var(--primary); color: #fff; ... }
```

`.light button` has specificity **(0,1,1)** and therefore **beats any single Tailwind utility class (0,1,0)**. Consequences,
all confirmed in the recording:

| Element | Written as | Light-mode result |
|---|---|---|
| Compose **Send** | `<AsyncButton className="bg-primary">` | **white pill, dark text** — `bg-primary` loses. NOT orange. |
| Profile QR / zap / DM buttons | `IconButton` → `bg-neutral-800 text-white` | **white circles, 1px border, slate-blue glyph** — `bg-neutral-800` loses. |
| Profile **mute** button | `IconButton className="!bg-error"` | **stays red** — `!important` wins. |
| Compose FAB "New Note" | `className="… primary …"` | **stays orange** — `.light button.primary` is an equal-specificity, later rule. |

So in light mode the *only* colored buttons are `.primary` and `!`-forced ones. In the recording this reads as a page
of white/bordered pills with exactly two colored controls: the orange "New Note" and the red mute circle.

---

## 4. Note card + action bar

The single highest-fidelity-value surface. `Components/Event/Note/Note.tsx:78-101`.

### 4.1 Card shell — a flat divided list, no cards

```jsx
<div className="relative border-b">
  <div className={classNames("min-h-[110px] flex flex-col gap-4 px-3 py-2", {
      "outline-highlight outline-2": highlight,
      "hover:bg-neutral-950 light:hover:bg-neutral-50 cursor-pointer": !opt?.isRoot })}>
```
- **No border-radius, no shadow, no card.** Separation is `border-b` only, in the global border color.
- padding `px-3 py-2` (12/8), **`min-h-[110px]`**, `gap-4` (16px) between header and body block.
- **Row hover tint** `neutral-950` / light `neutral-50` — **[REC ✓]** visible in the recording as a faintly gray row
  under the cursor next to white neighbours. Suppressed on the thread root (`isRoot`).
- The focused thread note gets `outline-highlight outline-2` — a 2px violet **outline**, not a border.

### 4.2 Header row

`NoteHeader.tsx:39-69` → `<div className="flex justify-between">`, left `ProfileImage`, right
`<div className="flex items-center gap-2">` holding the timestamp then the `…` menu.

- **Avatar 48 px** circle (`Components/User/Avatar.tsx:38-53`), inline `width/height: 48px`,
  `relative rounded-full aspect-square … bg-neutral-600 z-1`, image `absolute rounded-full w-full h-full object-cover`.
  **[REC ✓ measured ≈48 CSS px.]** Placeholder fill is `neutral-600`.
  Default picture (when the profile has none) is a **remote** robohash-style URL
  `https://nostr-rs-api.v0l.io/avatar/cyberpunks/<pubkey>.webp` (`zombies` at Halloween) → **hotlink, CSP-unsafe for
  Sandstr; substitute the inline-SVG `Avatar`.**
- Name row: `<div className="font-medium">` (15px / weight 500) = display name + `&nbsp;` + `<Nip05 className="text-xs">`.
- **Sub-header line = "via {client}"** — `Note/ClientTag.tsx`, `text-xs text-neutral-400 light:text-neutral-500`, read
  from the `client` tag; with no tag Snort **fingerprints the event** (`ClientFingerprinting.tsx`) and shows its guess
  with a 12px `fingerprint` icon, clickable into a score-breakdown modal. **[REC ✓ "via Amethyst", "via Dark Wisp".]**
  This is a signature Snort detail and a cheap, high-value fidelity win.
- Timestamp: `text-sm text-neutral-500 font-medium`; `…` menu trigger is `dots` at **size 15**,
  `cursor-pointer text-neutral-500 px-1 py-0.5`.
- Name fallback chain (`Utils/index.ts:462-472`): `display_name` → `name` → *(AnimalName — disabled for Snort,
  `animalNamePlaceholders: false`)* → `npub1…` truncated to **12 chars**. **[REC ✓ "npub178umpxt".]**
- **nip05** (`Nip05.tsx:50-69`): `inline-flex items-center text-neutral-400 font-normal`, `opacity-50` while
  unverified; `name@` in a `.nick` span then the domain; `_@domain` hides the `_@`; **domain gets
  `text-snort-gradient` when it is `snort.social`/`CONFIG.nip05Domain` and verified**; a 13px **red `x`**
  (`text-error`) is appended when `showBadges && !isVerified` — **[REC ✓ visible after "sandwich.farm".]**
  There is **no green check**; only the failure badge exists.
- The avatar is a Radix **HoverCard** trigger on every note (openDelay 100 / closeDelay 300, `z-[9999]`).
- **Follow-distance check-mark on the avatar** (`FollowDistanceIndicator.tsx`): a 16px `bg-layer-1` circle with a 10px
  `check`, positioned by `transform: rotate(-135deg) translateY(50%)`; `text-success` for self/following,
  `text-zap` for distance-2 with >10 mutuals, hidden beyond distance 2.

### 4.3 Body

`NoteContent.tsx:26-40` — body + footer share one wrapper; **the body is NOT indented under the name**, it starts at
the card's left padding, full width. **[REC ✓.]**

- `<div dir="auto" className="whitespace-pre-wrap wrap-break-word">`, 15px inherited.
- Timeline notes truncate at **400 chars** with a `text-highlight` "Show more"/"Show less".
- Footer is separated from the body by **`mt-4` only — no divider above the action bar**.
- Inline entities: hashtags and @mentions are **`text-highlight` violet, no pill background**
  (`Embed/Hashtag.tsx`, `Embed/Mention.tsx`). **[REC ✓ violet `#BIP110`, violet links.]** Bare URLs are
  `text-highlight` **only when link previews are off** — by default a URL becomes a `LinkPreview` card or a provider
  embed (YouTube/Tidal/SoundCloud/MixCloud/Spotify/Twitch/AppleMusic/Wavlake).
- Code: `<pre className="bg-layer-2 px-2 py-1 rounded-lg">` / `<code className="bg-layer-2 px-1.5 py-0.5 rounded-lg">`.
  **No syntax highlighting exists in Snort** — relevant to the Sandstr `CodeBlock.tsx` corruption bug (see §16).
- **Media is inline, edge-to-edge, and NOT rounded**: `relative max-h-[80vh] w-full h-full object-contain
  object-center`; because `CONFIG.media.preferLargeMedia = true` the `md:max-h-[510px]` cap is dropped and video
  containers get `-mx-3` to bleed past the card padding. Multiple images collapse into
  `grid grid-cols-4 gap-0.5 place-items-start` with a hard-coded span map for 1–6 images, row height 200, gap 2.
- **Quote-embeds are the only rounded box on the note surface**: `<div className="rounded-lg border">` around a nested
  note with `showFooter:false, truncate:true`; at depth > 1 it degrades to a plain `#nevent1…` text link.
- Media click → full-screen spotlight lightbox with arrow-key navigation and wrap-around.
- Whole-row click opens the thread, with an escape hatch: the handler walks up the DOM and aborts on `A`, `BUTTON`,
  `.reaction-pill`, `.szh-menu-container`, or an active text selection; ⌘-click opens a new tab. Links are `/${nevent1…}`.

### 4.4 Action bar — **reply → repost → like(heart) → [PoW] → zap → zapper avatars**

`Components/Event/Note/NoteFooter/NoteFooter.tsx:20-52`:
```jsx
<div className="flex flex-row gap-4 overflow-hidden max-w-full h-6 items-center">
```
Fixed height **24px**, `gap-4` (16px). Each button is a **`<div>`, not a `<button>`**, is an `AsyncIcon` (icon swaps to a
20px spinner while its handler runs), and is a fixed-width column **`flex-none min-w-[50px] md:min-w-[80px]`**.
**Icons are 18px. There is no share and no bookmark button** — those live only in the `…` menu.

| # | Button | Icon `name` | Default | Active | Count |
|---|---|---|---|---|---|
| 1 | Reply | `reply` | inherited font color | `reacted text-nostr-purple` ⚠ **undefined → no visible change** | `replyCount`, hidden at 0 |
| 2 | Repost | `repeat` | inherited | `reacted text-nostr-blue` ⚠ **undefined → no visible change** | `reposts.length` |
| 3 | **Like** | `heart` → **`heart-solid`** | inherited | **`text-heart #ef4444`** | positive reactions |
| 4 | PoW | `diamond` | `hidden md:flex`, no color | — | leading-zero count |
| 5 | Zap | `zap` → **`zapFast`** when a wallet is ready | inherited | **`text-zap #ff710a`** | **`zapTotal` = sats, not a count** |

**[REC ✓ exact order and glyph shapes: speech-bubble → two-arrow repeat → outline heart → lightning bolt → a small
round avatar.]** That trailing avatar is `ZapsSummary` — the **top-3 zappers at 24px** (`AvatarGroup`, `-ml-2` overlap)
plus `+N` (`hidden md:inline-flex`), click opens the reactions modal on the Zaps tab.

> **⚠ Two of the five colors do not exist at this commit.** `text-nostr-purple` and `text-nostr-blue` are consumed by
> `ReplyButton.tsx:50` / `RepostButton.tsx:49` but defined **nowhere** (no `nostr-*` entry in the single `@theme` block,
> no Tailwind config). Likewise `.reacted`, `.reaction-pill`, `.reaction-pill-number` have **no CSS at all**
> (`reaction-pill` is only a click-target marker). And `svg.repeat{color:var(--repost)}` / `svg.heart-solid` /
> `svg.zap-solid` (`index.css:503-513`) **never match in the footer**, because `Icon` forwards only `name`/`size` to the
> `<svg>` and `AsyncIcon` passes it no `className` — footer color comes purely from `currentColor` inheritance.
> **Net: only the heart and the zap ever change color.** Reproduce *that*; if you'd rather show Snort's intent, add the
> purple/cyan deliberately and note the divergence.

- **Default icon color is the inherited body color** — white in dark, `#0f0f0f` in light — **not a muted gray**.
  **[REC ✓ black icons on white.]** Only the timestamp and `…` are gray.
- Counts sit **right of the icon**, `gap-2`, 15px, **hidden when 0**. `formatShort` (`Utils/Number.ts:6-16`):
  **< 2000 → raw integer** (`1543`, *not* `1.5K`), then `K`/`M`/`G` at ≤2 fraction digits (`2.5K`, `1.23M`).
- **Default reaction is `"+"`, drawn as a heart.** No emoji picker on notes. `normalizeReaction`
  (`packages/shared/src/utils.ts:261-270`) counts `-`/`👎` as negative and **everything else as positive**, so a `🔥`
  increments the heart count.
- Zap: single click = fast-zap of `defaultZapAmount` (**50 sats**); **long-press opens the zap modal**; failures fall
  back to the modal. **The zap button renders nothing at all when the author has no lud16/lud06 and no zap tag.**
  No zap gradient and no zap animation exist anywhere in `Components/Event/Note/`.
- **Repost has a second menu**: clicking opens a Radix dropdown with **Repost** (`repeat`) / **Quote Repost** (`edit`) —
  the button never reposts directly.
- Logged out: nothing is hidden; reply/like/repost **navigate to `/login`**. Readonly: reply is a silent no-op.
  Like is hidden unless the `enableReactions` preference (default true).
- Reply counts are fetched with a local `COUNT` query when the timeline doesn't supply one → **counts appear a beat
  late and can read 0 in a fresh session**.

### 4.5 `…` context menu

Radix, content `bg-layer-2 rounded-lg overflow-hidden z-[9999] min-w-48`; items
`grid grid-cols-[2rem_auto] gap-2 px-6 py-2 text-base font-semibold bg-layer-2 light:bg-white hover:bg-layer-3
light:hover:bg-neutral-200 cursor-pointer outline-none`. In order:

**Reactions** (`heart`) · **Share** (`share`) · **Pin/Unpin** (`pin`) · **Bookmark** (`bookmark`) · **Copy ID** (`copy`) ·
**Mute** (`mute`, if `!readonly && !isMine`) · **Broadcast Event** (`relay`) · **Translate to {lang}** (`translate`) ·
**Copy Event JSON** (`json`) · **Report Media** (`shield-tick`, conditional) · **Delete** (`trash`, `text-error`, `isMine` only).

### 4.6 Reposts, warnings, translation

- A repost (kind 6) renders a label bar **above** the quoted note (`NoteReaction.tsx:41-52,70`):
  `<div className="flex gap-1 text-base font-semibold px-3 py-2 border-b">` + `repeat` icon **18px** +
  **"{name} reposted"** — **no color class** (inherits body color). Kind-7 in a feed renders **"{name} liked"** with
  **no icon**. The reposted note below has no rounded border (unlike inline quotes).
- Content warnings / non-follow media are gated by a **block, not a blur**: `WarningNotice` =
  `text-warning border px-4 py-2 rounded-lg flex gap-2 items-center font-bold` + 26px `alert-circle`.
  Muted notes collapse to **"This note has been muted"** + a Show button.
- **`autoTranslate` defaults to true**; a translated note prints a clickable `<small>` "Translated from {lang}" /
  "Translation failed" between body and footer.
- Kinds 20/21/22 (Photo/Video/ShortVideo) are **mutated into kind-1-looking notes** by appending imeta URLs to
  `ev.content`. Polls (kind 1068) render between body and footer and **vote by zapping** with a `poll_option` tag.
- Long-form (30023) is the only surface with a **doubled footer** — action bar above *and* below the article, split by
  `<hr className="h-px my-1" />`, plus a "{n} mins to read · Listen to this article" row.

### 4.7 Timestamps

`NoteTime.tsx:15-60`, class `text-sm text-neutral-500 font-medium`:
`<60s` → **"now"** · `<1h` → **"{n}m"** · `<24h` → **"{n}h"** · same year → **"Jul 14"** · older → **"Jul 14, 2024"**.
Rendered as `<time dateTime={ISO} title={medium date + long time}>`. **It is computed once via `useState` and never
re-ticks** while mounted.

### 4.8 Thread / reply connection

**Avatar-column vertical line + indented text**, drawn as an absolutely positioned sibling, not a wrapper
(`Note.tsx:59-76`):
```jsx
<div className={classNames(tl.inset, "absolute border-l z-1", {
  "top-0": topLine, "top-2": !topLine, "bottom-0": bottomLine, "h-4": !bottomLine })} />
```
`Subthread.tsx:34-62` passes `inset: "left-9"` (**36px = the avatar's centre**: 12px padding + 24px half of 48) and
indents the note's text+footer with `inset="ml-14"` (**56px**). Depth 0 gets `bottomLine` only when it has replies;
deeper levels always get `topLine`. Stub segments are `h-4` from `top-2`. Line color = global border color.

Above the body a reply shows a `re:` line in the sub-header (`ReplyTag.tsx:27-45`): `re:&nbsp;` + up to **2**
`text-highlight` mentions, then **"& {n} others"**, all inside `<small className="text-xs">`.

---

## 5. App shell — three columns

`Pages/Layout/index.tsx:74-101`:
```jsx
<div className="flex justify-center">
  <div className="w-full max-w-screen-xl">        {/* hard cap 1280px */}
    <div className="flex">
      <NavSidebar />
      <div className="flex flex-1 flex-col w-full md:w-1/3 pb-safe-area-plus-footer">
        <Header /> <Outlet />
      </div>
      <RightColumn />
```

| Column | Classes | Behaviour |
|---|---|---|
| Left nav | `xl:w-56 xl:gap-2 xl:items-start` + `select-none overflow-y-auto hide-scrollbar sticky items-center border-r top-0 z-20 h-screen max-h-screen flex flex-col px-2 py-4 flex-shrink-0 gap-1` | icon rail 769–1279px; **224px with labels at ≥1280** |
| Center | `flex flex-1 flex-col w-full md:w-1/3` | `flex-1` dominates |
| Right | `hidden lg:flex flex-col lg:w-1/3 sticky top-0 h-screen py-3 px-4 border-l` | appears at **≥1024px** |

**Visibility is decided twice — in CSS *and* in JS, and the JS gate wins** (early `return`, so the region truly
unmounts): `NavSidebar.tsx:75-77` `width <= 768` → null; `RightColumn.tsx:31-33` `width >= 1024` required;
`Footer.tsx:40-42` `width <= 768` required; `ProfileMenu` narrow at `<= 1280`. Driven by a plain
`window.innerWidth` + `resize` listener (`Hooks/useWindowSize.ts`).

Columns are **`sticky top-0 h-screen`** while `body { overflow-y: scroll }` — **the page scrolls as one document**,
the columns are not independently-scrolling panes. That is a real structural difference from Primal/Damus-style shells
and from Sandstr's own non-scrolling app shell.

Shell path rules (`:42-44`): `hideHeaderPaths = ["/login", "/new"]`; footer hidden on `/messages/`.
Keyboard: `.` scroll-to-top, `t` trace overlay, `/` focus search, `n` compose, `⌘K` focus search box, `Esc` clear.

> **[REC vs REPO] The right column also renders on `/login`.** `RightColumn.tsx:25-26` computes
> `hideRightColumnPaths = ["/login","/new","/messages"]`, but the flag is **dead**: it is only applied as
> `classNames("hidden lg:flex …", { "lg:flex": show })` — `lg:flex` is already in the base string, so the conditional
> adds nothing (and it reads `globalThis.location.pathname`, so it wouldn't re-evaluate on client navigation anyway).
> **The recording confirms this**: the sign-in screen shows the right column's Search box. Reproduce the right column
> on every ≥1024px route.

### 5.1 Left nav

`NavSidebar.tsx:18-53` — `MENU_ITEMS` in order. English labels resolved against `translations/en.json`:

| # | Label | Icon (outline/solid) | Route | Condition |
|---|---|---|---|---|
| 1 | **Home** | `home-*` | `/` | always |
| 2 | **Discover** | `search-*` | `/discover` | always |
| 3 | **Notifications** | `bell-*` | `/notifications` | logged in |
| 4 | **Messages** | `mail-*` | `/messages` | logged in, hidden if readonly |
| 5 | ~~Deck~~ | `deck-*` | `/deck` | logged in **and** `CONFIG.features.deck` — **`false` in `default.json`, so absent in real Snort** |
| 6 | **Settings** | `settings-*` | `/settings` | logged in |

**[REC ✓ exactly Home · Discover · Notifications · Messages · Settings — no Deck.]** Logged out: **Home · Discover**
only, plus a `primary` **"Sign up"** button with a `sign-in` icon. **[REC ✓.]**

- Each item renders **both** icon variants at size 24 and lets CSS pick (`index.css:582-592`):
  `.icon-solid{display:none}`, `.active > .icon-outline{display:none}`, `.active > .icon-solid{display:inline-block}`.
- Link class: `rounded-full p-3 flex flex-row items-center transition-colors duration-200 hover:bg-secondary
  hover:no-underline`, active adds `active font-bold`. **There is no pill/background on the active item** — active =
  solid icon + bold label. ⚠ **`hover:bg-secondary` produces no CSS** (`--color-secondary` is undefined) → **nav hover
  has no background.**
- **Labels only exist at ≥1280px** (`hidden xl:inline ml-3`). Below that it is a pure icon rail.
- **Wallet balance row, ≥1280px only** (`WalletBalance.tsx:24-53`): `w-full flex flex-col max-xl:hidden pl-3 py-2`,
  a **28px `sats` icon** + balance, a `dots` icon right, and a second line with the fiat value and BTC rate.
  **[REC ✓ the "◎ 0 / ~0,00 $ / ⋮ / 0 $" block directly under the wordmark.]**
- **Compose button** (`NoteCreatorButton.tsx:63-83`): `aspect-square flex flex-row items-center primary rounded-full`
  + `xl:aspect-auto`, **16px `plus`** icon, label **"New Note"** as `ml-2 hidden xl:inline` → a circular `+` in the
  rail, an orange **"＋ New Note"** pill at ≥1280. **[REC ✓ orange pill.]** Self-hides on `/settings`, `/messages`,
  `/new`, `/login`, `/about`, `/e`, `/nevent`, `/note1`, `/naddr`, `/subscribe` and when readonly.
- **`ProfileMenu` at the very bottom**: trigger is a `ProfilePreview` with a **40px avatar**, display name
  `max-xl:hidden`, and an `arrowFront` icon rotated 90° as the caret. **[REC ✓ avatar + "npub178umpxt" + chevron.]**
  Menu (`bg-layer-2 rounded-lg overflow-hidden z-[9999] min-w-48`): **Profile** (`user`), a non-interactive
  **"Switch accounts"** caption, then one row per other session. A red **"Read Only"** (`text-heart`) sub-header when readonly.

### 5.2 Icon system

`Components/Icons/Icon.tsx` is 6 lines: `<svg width={size} height={size}><use href={`${IconsSvg}#${name}`} /></svg>`
against a **single sprite sheet** `Components/Icons/icons.svg` (external `<use>`, emitted as an asset URL).
**Default size 20**; nav/footer/header pass 24; footer actions 18. No `fill`/`stroke` props — the symbols carry
`stroke="currentColor"`, `fill="none"`, `stroke-width` ~1.67–2, round caps/joins (a Lucide / Untitled-UI-ish outline set).

**119 symbols.** Shell-relevant: `home|search|bell|mail|deck|settings` × `-outline/-solid`, `sign-in`, `plus`,
`diamond`, `sats`, `dots`, `user`, `user-v2`, `arrowFront`, `arrowBack`, `arrowUp`, `chevronDown`, `close`, `x`,
`settings-02`, `settings-outline`, `lightbulb`, `heart`, `heart-solid`, `zap`, `zap-solid`, `zapFast`, `zapCircle`,
`repeat`, `repost`, `reply`, `reverse-left`, `at-sign`, `hash`, `fire`, `message-chat-circle`, `camera-plus`,
`camera-lens`, `thumbs-up`, `copy`, `check`, `rows-01`, `file-06`, `pencil`, `stars`, `mute`, `wifi`,
`bookmark-solid`, `relay`, `key`, `profile`, `badge`, `gear`, `wallet`, `tool`, `shield-tick`, `hard-drive`, `link`,
`logout`, `attachment`, `bar-chart`, `qr`, `trash`, `expand`, `refresh-ccw-01`, `piggy-bank`, `code-circle`,
`fingerprint`, `translate`, `json`, `share`, `pin`, `alert-circle`, `book-closed`, `edit`, `dislike`, `openeye`.

### 5.3 Center-column header

`Pages/Layout/Header.tsx:89-119` — `flex justify-between items-center self-stretch gap-6 sticky top-0 z-10
backdrop-blur-lg` over `--header-bg-color`.

- **Left:** `arrowBack` icon, only when `location.pathname !== "/" && !isRootTab`. Otherwise a `LogoHeader` renders in
  that slot but as **`md:invisible`** — i.e. **an invisible spacer on desktop**, the visible "S" box on mobile.
- **Centre on a root feed:** the feed picker (§6.1). **Elsewhere:** a click-to-scroll-top title —
  `cursor-pointer flex-1 text-center p-2 overflow-hidden whitespace-nowrap truncate md:text-lg`. Title resolution:
  capitalized path segment by default; **"Search: {term}"** on `/search/*`; **"{KindName} by {DisplayName}"** for a
  note/naddr in the path **[REC ✓ "Short Text Note by utxo the webmaster 🧑‍💻"]**; display name for npub/nprofile;
  `#tag` on `/t/*`; relay name on `/relay*`.
- **Right:** `NotificationsHeader` wrapped in **`md:invisible`** — on desktop the bell only reserves space.

**Net desktop main-feed header: invisible logo spacer · centered feed dropdown · invisible bell.** **[REC ✓ — the
recording's feed header contains nothing but the centered "Following ⌄" pill.]**

⚠ `HasNotificationsMarker` renders `<span className="has-unread absolute top-0 right-0 rounded-full">` and
**`.has-unread` is defined in no CSS file** → **the unread dot is invisible**.

### 5.4 Right column

`RightColumn.tsx` — always `<SearchBox />`, then `<span className="mb-4">`, then
`<div className="flex flex-col gap-4 overflow-y-auto hide-scrollbar flex-1">` of widgets.

**Logged in:** Ask-Snort AI → TaskList → Invite Friends → **Trending Notes** → Latest Articles.
**Logged out: TaskList only.** (`LiveStreams` / `TrendingPeople` / `TrendingHashtags` cases exist in the switch but are
unreachable — commented out of the array.)

- `BaseWidget` = `layer-1` card + title row `flex gap-2 items-center text-xl font-semibold mb-2`, optional icon in a
  `layer-2 rounded-full` chip, optional right-side context menu.
- **SearchBox** (`SearchBox.tsx:139-176`): `flex layer-1 relative`, input
  `w-full !border-none !rounded-none leading-10 py-2.5 px-4` placeholder **"Search"**, trailing 24px `search-outline`
  icon (or a spinner) at `my-2.5 mx-4`. **[REC ✓ gray rounded box, placeholder left, magnifier right.]** Dropdown
  `absolute top-full mt-2 w-full border bg-white dark:bg-black shadow-lg rounded-lg z-10 overflow-hidden`, first row
  **"Search notes: {term}"** then ≤3 profiles. **It refuses input matching `nsec1…`**, auto-navigates a pasted
  `npub|note|nevent|nprofile`, resolves `user@domain` via NIP-05, else goes to `/search/{term}`.
- **Ask Snort AI** (`AskSnort/AskSnortInput.tsx`): `p-3 bg-layer-1 rounded-lg`, 16px `lightbulb` in `text-primary`,
  heading **"Ask {appName} AI"**, textarea placeholder **"Try: Summarize my timeline"**, Enter → `/agent`.
  **[REC ✓ red lightbulb, "Ask Snort AI", "Try: Summarize my timeline", white circular arrow button.]**
- **TaskList** shows **at most one** task (`.slice(0, 1)`) from BackupKey / PendingChanges / FollowMorePeople / Nip5.
- **Invite Friends**: `heart-solid` in `text-heart`, copy-link `AsyncButton className="secondary"` producing
  `https://{host}?ref={code}`. **[REC ✓ red heart in a gray circle chip, "Share a personalized invitation with
  friends!", white "Copy link" pill.]**
- **Trending Notes**: title + a `settings-02` size-18 `IconButton` opening a **DVM selector** (kind 5300);
  body `<TrendingNotes small={true} count={6} />`. **[REC ✓ gear in a white circle; compact rows = ~30px avatar, bold
  name, gray nip05, right-aligned relative time, body with violet links/hashtags.]**
- **Latest Articles**: `aspect-video` cover with the title overlaid `absolute bottom-2 left-4 right-4 … bg-black/50`,
  plus two `arrowFront` `IconButton`s (one rotated 180°) paging through articles.

### 5.5 Mobile — bottom tab bar (NOT in the recording)

`Pages/Layout/Footer.tsx:44-55` — `md:hidden fixed bottom-0 z-10 w-full pb-safe-area bg-layer-1`, inner
`grid grid-flow-col`, gated by both `md:hidden` and the JS `width <= 768`. **56px tall** plus the safe-area inset
(`pb-safe-area-plus-footer` = `calc(env(safe-area-inset-bottom) + 56px)`). Suppressed on `/messages/*`.

**Five equal, icon-only cells, no labels:** `/` (home) · `/messages` (mail) · **compose `+`** (center,
`alwaysShow`) · **`/search`** (search) · `ProfileMenu` avatar.

Note the asymmetries: the footer's magnifier goes to **`/search`** while the sidebar's goes to **`/discover`**; the
footer has **no Notifications item** (the bell lives in the mobile header) and no Settings. Each item is
`flex flex-1 p-4 justify-center items-center cursor-pointer` and applies `active` **on route match *or* hover**.

### 5.6 Deck mode — documented but unreachable

`Pages/Deck/DeckLayout.tsx` exports `SnortDeckLayout`, a **second shell** (not a page inside Layout):
`.deck-layout` (`index.css:178-215`) = `display:flex; height:100vh; overflow-y:hidden`; `.deck-cols` scrolls
horizontally; **each column is exactly `width: 550px; min-width: 550px`, full height**, header
`padding: 8px 16px; border: 1px solid neutral-800; font-size: 20px; font-weight: 700; min/max-height: 40px`
(right border removed on non-last); every non-first child of a column scrolls. Left rail is the **same `NavSidebar`
with `narrow={true}`**. Hard-coded columns: **notes · media · notifications · articles**.

> **⚠ Corrects `docs/FIDELITY.md`, which calls Deck "the signature".** It is **triple-gated and currently dead**:
> the nav item needs `CONFIG.features.deck` (**`false` in `default.json`** — only `iris.json` enables it); the layout
> needs login **plus** a subscription tier (`deckSubKind: 1`, and `features.subscriptions` is **`false`**), else it
> renders a paywall card; and **`SnortDeckLayout` is referenced nowhere** — there is no `/deck` route, so `/deck` falls
> through the `/:link` catch-all to `NostrLinkHandler`. **Do not present Deck as a reachable mode**, and do not build
> the Sandstr sim around it.

### 5.7 Routes (abridged)

Single `createBrowserRouter` (`index.tsx:252`). A pathless shell route (`lazy: Pages/Layout`, `loader: initSite()`)
holds everything; `/component-debug` is a sibling that renders **without** the shell.

- `/` → `RootPage` → index redirects to `defaultRootTab` (**`"following"`**) when logged in, else `/trending/notes`.
  Children: `for-you`, `following`, `followed-by-friends`, `conversations`, `discover`, `tag/:tag`, `trending/notes`,
  `trending/hashtags`, `t/:tag`, `topics`, `media`, `follow-sets`, `relay/:relay?`, `suggested`, `agent`.
- Flat: `/e/:id` (thread) · `/p/:id` (profile) · `/notifications` · `/messages/:id?` · `/search/:keyword?` ·
  `/about` (→ **DonatePage**, not About) · `/changelog` (→ AboutPage) · `/wallet` + `/wallet/{send,receive}` ·
  `/nostr-address` · `/free-nostr-address` · `/list-feed/:id` · `/help` · `/cache-debug`.
- `/login` → `OnboardingLayout` with `sign-up`, `sign-up/{profile,topics,discover,moderation}`.
- `/settings` (wrapped `<div className="px-3">`) → index Menu, `profile`, `relays`, `relays/:id`, `preferences`,
  `notifications`, `accounts`, `keys`, `moderation`, `cache`, `media`, `invite`, `tools` (+ `prune-follows`,
  `follows-relay-health`, `sync-account`), `handle`, `wallet` (+ `lndhub`, `nwc`, `alby`).
- **Feature-gated OFF in `default.json`:** `/zap-pool`, `/subscribe`, `/subscribe/manage`.
- **Catch-all last:** `/:link` → `NostrLinkHandler` (resolves bare `npub…`/`note…`/NIP-05, and swallows `/deck`).

---

## 6. Home feed

### 6.1 The feed picker is a **DROPDOWN**, not a tab row

The single most important shell fact. **There is no underline tab bar anywhere in Snort.**
`Components/Feed/RootTabs.tsx:58-94` renders a Radix dropdown centered in the header:

```jsx
<div className="root-type flex items-center justify-center flex-grow">
  <DropdownMenu.Trigger asChild>
    <button type="button" className="bg-transparent text-font-color text-base px-4 py-2.5
      flex items-center justify-center gap-3 border-none shadow-none hover:!shadow-none">
      {currentMenuItem()} <Icon name="chevronDown" />
```
Menu content `bg-layer-2 rounded-lg overflow-hidden z-[9999] min-w-48`, `sideOffset 5`, `align center`; rows
`px-6 py-2 text-base font-semibold bg-layer-2 light:bg-white hover:bg-layer-3 light:hover:bg-neutral-200 cursor-pointer
outline-none flex gap-3 items-center`. **Active state is conveyed only by which label the trigger shows.**
Selecting a row navigates and does `window.scrollTo({top:0, behavior:"instant"})`.

> **[REC vs REPO] The recording's trigger is a bordered white pill with a shadow** (icon + "Following" + chevron),
> whereas HEAD explicitly strips it (`bg-transparent border-none shadow-none hover:!shadow-none`). The `!important`
> and the redundant `border-none` read as a deliberate later change. The 2026-07-14 build got the default
> `.light button` treatment (white fill, 1px border, shadow — see §3.1). **Reproduce the recording's pill** if the
> target is "Snort as captured"; note the divergence either way.

Tabs in order (`Components/Feed/RootTabItems.tsx:8-107`), each with a 
leading icon:

| # | Label (verbatim) | Icon | Path | Shown when |
|---|---|---|---|---|
| 1 | **For you** | `user-v2` | `/for-you` | logged in |
| 2 | **Following** | `user-v2` | `/following` | logged in — **the default** |
| 3 | **Trending Notes** | `fire` | `/trending/notes` | always |
| 4 | **Conversations** | `message-chat-circle` | `/conversations` | logged in |
| 5 | **Followed by friends** | `user-v2` | `/followed-by-friends` | logged in |
| 6 | **Trending Hashtags** | `hash` | `/trending/hashtags` | always |
| 7 | **Topics** | `hash` | `/topics` | user has interest tags |
| 8 | **Media** | `camera-plus` | `/media` | always |
| 9 | **Follow Sets** | `thumbs-up` | `/follow-sets` | always |

Reproduce the **inconsistent casing verbatim** — sentence-case "For you" / "Followed by friends" next to Title Case
"Trending Notes" / "Follow Sets". `/discover` and `/suggested` are routed but **absent from this menu** (Discover is
reached from the sidebar). On `/t/*` the trigger shows a `hash` icon + the raw tag instead of a menu label.

### 6.2 There is **no inline compose box**

`TimelineFollows.tsx:87-116` renders only the latest-pill, the note chunks, and `AutoLoadMore`. `NoteCreatorButton` is
mounted **only** in the sidebar and the mobile footer. **[REC ✓ nothing between the header and the first note but the
live strip.]** Compose is exclusively a modal (§11).

### 6.3 Live-stream strip — `/` and `/following` only

`Components/LiveStream/LiveStreams.tsx:20` — `flex mx-2 gap-4 overflow-x-auto sm-hide-scrollbar`, cards
**`h-[80px]`**, `aspect-video` thumbnail, an **uppercase `bg-heart` status badge**, a **25px host avatar with
`outline-2 outline-highlight`** (violet ring), and a viewer-count pill.

> **[REC vs REPO] badge color.** The recording's **"LIVE"** badge samples `#dd2a3f` — a crimson clearly distinct from
> the "New Note" button's `#ed2518` in the same frame — i.e. the shipped build used **`--live #f83838`**, while HEAD's
> class is `bg-heart` (`#ef4444`). All three are close; the recording is the tiebreak for "not `--primary`".
> **[REC ✓ dark title bar over the thumbnail, red LIVE pill bottom-left, violet-ringed avatar bottom-right, a dark
> "1 viewers" pill, and a visible horizontal scrollbar.]**

### 6.4 "N new notes" pill

`Components/Feed/TimelineRenderer.tsx:67-81`:
```jsx
<div className="cursor-pointer flex flex-row justify-center items-center py-1.5 px-6 gap-2
     text-white bg-highlight rounded-full">
  <AvatarGroup ids={…slice(0,3)} />  {"{n} new note(s)"}  <Icon name="arrowUp" />
```
Fill is **`bg-highlight`** (violet), white text, fully rounded; contents in order: up to 3 overlapping 24px avatars
(`-ml-2`), the count text, an up-arrow. Rendered **twice** — inline at the top of the feed, and, once that copy
scrolls away, a floating copy at `fixed top-[50px] z-3 opacity-90 shadow-md animate-fade-in` whose `left` is
JS-centered on the feed column. Inline click = `showLatest(false)`; floating click also scrolls to top.

Feed body: each note is `EventComponent` with `{truncate: true}`; the list ends with **`AutoLoadMore`** — an
infinite-scroll trigger (`rootMargin: 1000px`) wrapping a plain `<button>` labelled **"Load more"**.
**[REC ✓ white "Load more" pill.]**

Per-tab sources: `following` = `TimelineFollows postsOnly` · `conversations` = same with `postsOnly={false}` ·
`followed-by-friends` = `Timeline followDistance={2}` · `media` = follows restricted to Photo/Video/ShortVideo in
`<div className="py-2">` · `for-you` interleaves a DVM feed with the follows feed ~1-in-5 ·
`trending/hashtags` wrapped in `<div className="px-2">`.

---

## 7. Discover

Route `/discover`, reached from the sidebar (**not** from the feed dropdown). Uses the shared **pill `TabSelectors`**
(§8.4). **[REC ✓ a horizontally scrollable pill row — "Popular · Followed By Friends · Follow Sets · Suggested
Follows · …" — with the active pill filled a darker gray (`bg-layer-3` = `neutral-400` in light) and inactive pills
`layer-1` + border. Below: a description line and a `rounded-full` "Search sets…" input.]**

---

## 8. Profile

### 8.1 Banner + avatar geometry

`ProfilePage.tsx:133-152`:
```jsx
const bannerWidth = Math.min(window.innerWidth, 940)
{user?.banner && <ProxyImg className="cursor-pointer max-h-[200px] object-cover -mb-6" … />}
<div className="px-4"> <AvatarSection /> <ProfileDetails /> </div>
```
- Banner full-width, **`max-h-[200px]`**, `object-cover`, requested at `min(viewportWidth, 940)`px. **If missing,
  nothing renders** — no placeholder block; the avatar then sits at the top. **[REC ✓ the captured profile had no
  banner: blank space above the avatar.]**
- **Overlap is exactly `-mb-6` (−24px) on the banner** — that is the entire mechanism. **No ring, no border, no
  z-index juggling on the avatar.**
- Avatar **`size={100}`**, click → spotlight lightbox. Header gutter `px-4`; the tab row below uses `px-3 py-2`.

### 8.2 Header action row — QR → zap → DM → mute → Follow

`AvatarSection.tsx:141-156` — `flex justify-between`, 100px avatar left, `flex gap-2 items-center` right:

1. **QR** — always, `IconButton icon={{name:"qr", size:16}}`.
2. **If it's me:** a **"Settings"** button (`md:hidden`, → `/settings`) and an **"Edit"** button
   (`hidden md:inline`, → `/settings/profile`) — mobile says Settings, desktop says Edit.
3. **If not me:** zap `IconButton` (`zap`, only when an lnurl exists) → envelope `IconButton` (→
   `/messages/<nchat17…>`) → **mute**: `IconButton className={muted ? "bg-success" : "!bg-error"}` icon `mute` size 16
   — i.e. a **red `#ff6053` circle when not muted**. Readonly viewers get an `openeye` button prompting
   **"View as user?"**.
4. **Follow button last.**

**[REC ✓ exactly: QR · bolt · envelope · red person-x circle · "Follow" pill — three white bordered circles with
slate-blue glyphs, one red circle, then the pill. Per §3.1 that is `.light button` beating `bg-neutral-800` while
`!bg-error` survives.]**

### 8.3 There is **no stat row**

**Not found in source.** No following/followers/notes/relays counts anywhere in the profile header.
`ProfileDetails.tsx:99-113` renders, in a `flex flex-col gap-4`:

1. `<h2 className="flex items-center gap-2">` = display name + the **"follows you"** chip, then `<Nip05>` on its own
   line, then optional badges / music status, then the links block.
2. The `about` text as `<Text disableMedia disableLinkPreview>`.
3. `<FollowedBy size={24} />` (logged in only).

- **"follows you"** chip: `<span className="layer-1 text-xs font-normal px-1.5 py-1 leading-none">follows you</span>`
  — **lowercase**. **[REC ✓ small gray chip after the name.]**
- **Social proof replaces counts** (`FollowedBy.tsx:34-64`): **"Followed by"** + ≤3 linked names +
  **"and {count} others you follow"**; or **"Followed by friends of friends"** at distance 3; or **"Not followed by
  anyone you follow"** beyond. Wrapper `flex items-center gap-2`, text `text-gray-light`.
  **[REC ✓ "Not followed by anyone you follow".]**
- The strings "{n} followers" / "Follows {n}" exist in `Components/messages.ts:25-26` but are **referenced by no file
  under `Pages/Profile/`** — counts are only reachable by opening the Followers/Follows tabs.
- **Links block** (`flex flex-col gap-1`, website first then lightning): website =
  `flex items-center gap-2` + 16px `link-02` + an `<a target="_blank" rel="noreferrer">` whose label is stripped to
  `hostname + pathname`; lightning = `flex gap-2 items-center` + 16px **`zapCircle`** + the LNURL name in
  `text-ellipsis overflow-hidden hover:underline cursor-pointer`, click opens the ZapModal.
  **[REC ✓ a black bolt-in-circle then `utxo@rizful.com`; bio links in violet.]**

### 8.4 Tabs — the shared pill `TabSelectors`

`Components/TabSelectors/TabSelectors.tsx:23-50` — the second (and only other) tab idiom in Snort:
```jsx
// container
<div className={classNames(className, "flex gap-2 overflow-hidden hide-scrollbar w-full")} ref={horizontalScroll}>
// each tab
"flex gap-2 items-center px-4 py-2 my-1 layer-1-hover rounded-full cursor-pointer font-semibold whitespace-pre"
"hover:drop-shadow-sm"   +   { "bg-layer-3": active, disabled: t.disabled }
```
Horizontally scrollable (scrollbar hidden), **fully-rounded pills**, base `layer-1-hover`, **active = `bg-layer-3`**
(`neutral-700` dark / `neutral-400` light). **No underline.**

Profile tab order (`ProfilePage.tsx:164-176`), each with a 16px leading icon:

| Label | Icon | Note |
|---|---|---|
| **Notes** | `pencil` | default |
| **Reactions** | `heart-solid` | → red via the global `svg.heart-solid` rule |
| **Followers** | `user-v2` | |
| **Follows** | `stars` | label is **"Follows"**, not "Following" |
| **Zaps** | `zap-solid` | → orange |
| **Relays** | `wifi` | |
| **Bookmarks** | `bookmark-solid` | |
| **Muted** | `mute` | **own profile only, appended last** |

**[REC ✓ pill row reading Notes · Reactions · Followers · Follows · Zaps …]**

Tab contents: Notes = pinned notes then a `Timeline` (`showTime:false, showPinned:true`) · Followers/Follows =
`FollowListBase` (`px-3 py-2 flex flex-col gap-1`, **50/page**, a **"Follow All"** `transparent` button, and
**"Page {current} of {total} ({count} items)"** / **Previous** / **Next**) · Zaps = a `px-3 py-2 text-2xl font-medium`
**"Profile Zaps"** header with the total, then rows `px-4 py-1 hover:bg-neutral-800 … rounded-lg flex items-center
justify-between` · Relays = `flex gap-2 layer-1` rows of `RelayFavicon` + `<code className="grow f-ellipsis">` + bare
**R** / **W** letters.

---

## 9. Notifications

Route `/notifications`. Everything is marked read on mount.

### 9.1 Filters are **four icon toggles**, not tabs

`Notifications.tsx:107-134` — a `flex justify-between items-center mx-1` bar with an empty left `<div>` and
`flex items-center gap-2` on the right. Bitmask (Reactions 1 · Reposts 2 · Mentions 4 · Zaps 8 · All 255), **all
enabled initially**, rendered in this order:

| # | Icon | Active class | Filters |
|---|---|---|---|
| 1 | `heart-solid` | `text-heart` `#ef4444` | reactions |
| 2 | `zap-solid` | `text-zap` `#ff710a` | zaps |
| 3 | `repeat` | `text-repost` `#1ecbe1` | reposts |
| 4 | `at-sign` | `text-mention` `#961ee1` | mentions |

Each is `AsyncIcon className="button-icon-sm transparent"` + `active` + the tint → **8px-radius square with a faint
`rgba(255,255,255,.1)` fill when on** (not a pill).

### 9.2 Grouping + row geometry

Events bucket by `` `${timeKey}:${contextLink}:${kind}` `` where `timeKey` floors `created_at` to a **6-hour**
interval. Feed sorted desc, sliced to `limit` (+100 per `AutoLoadMore`), muted authors dropped, must `p`-tag you.

`NotificationGroup.tsx:106-159`:
```jsx
<div className="flex gap-2 py-4 pr-4 cursor-pointer w-full overflow-hidden border-b">
  <div className="flex flex-col items-center gap-2 w-[64px] min-w-[64px]">
    <Icon name={iconName()} size={24} className={iconName()} />
    <div>{kind === ZapReceipt && formatShort(totalZaps)}</div>
  </div>
  <div className="flex flex-col gap-2 overflow-hidden break-all w-full">
    <div className="flex flex-row justify-between items-center">
      <AvatarGroup ids={…slice(0,12)} showUsername={kind === TextNote} size={40} />
      <div className="text-neutral-500"><NoteTime … /></div>
    </div>
    {kind !== TextNote && <div className="font-bold">{actionName(…)}</div>}
    {context && <NotificationContext link={context} />}
```
**Fixed 64px left gutter** with a 24px icon (and, for zaps, the summed sats beneath), then up to **12 overlapping
40px avatars** with the relative time right-aligned in `text-neutral-500`, then the bold action line, then the
context. Separator is `border-b` only — **no card background**.

### 9.3 Icon + color per type — and the asymmetry

Color is applied by passing the **icon name as the `className`**, matched by global element rules
(`index.css:503-513`):

| Kind | Icon | Color |
|---|---|---|
| Reaction | `heart-solid` | `svg.heart-solid` → `#ef4444` |
| ZapReceipt | `zap-solid` | `svg.zap-solid` → `#ff710a` |
| Repost | `repeat` | `svg.repeat` → `#1ecbe1` |
| **TextNote** (mention/reply) | **`reverse-left`** | ⚠ **no CSS rule → inherits body color (black/white)** |

Note the deliberate asymmetry: the mention **filter** icon is `at-sign` tinted violet `#961ee1`, but the mention
**group** icon is `reverse-left` and is **not** purple. **[REC ✓ both confirmed in one frame — a large red heart on the
"liked" group, and a plain black `↰` arrow on the mention group.]**

### 9.4 Action line

`n = pubkeys.length - 1`:
- Reaction — `"{n,plural,=0{{name} liked} other{{name} & {n} others liked}}"` **[REC ✓ bold "npub178umpxt liked".]**
- Repost — `"… reposted"` · ZapReceipt — `"… zapped"`
- **TextNote — empty string**: the mention group shows **no action line**; instead its `AvatarGroup` sets
  `showUsername={true}` so the name sits beside the avatar. **[REC ✓ the "sandwich / sandwich.farm ×" row has no bold
  line, just gray context text.]**
- Anonymous zappers render as the literal **"Anon"**.

### 9.5 Context block

`notificationContext.tsx:10-33`: a pubkey link → `ProfilePreview` with no actions; a LiveEvent → `LiveEvent`;
otherwise the note body as `<Text truncate={160} disableLinkPreview disableGallery className="text-neutral-400" />`.
Loading literal **"Loading context..."**. If no context resolves: a `WarningNotice` reading **"Invalid notification
context"** plus a raw JSON `<pre>`. **[REC ✓ gray truncated body + the note's media below it.]**

---

## 10. Messages / DMs

Route `/messages/:id?`. **`const TwoCol = 768`** (`MessagesPage.tsx:20`).

```jsx
<div className="flex flex-1 min-h-0 overflow-hidden">
  {(pageWidth >= TwoCol || !id) && <div className="overflow-y-auto p-2 w-full md:w-1/3 flex-shrink-0 flex flex-col gap-2">…list…</div>}
  {id ? <DmWindow id={id} /> : pageWidth >= TwoCol && <div className="flex-1 rt-border"></div>}
```
**≥768px = two columns** (list `w-1/3` + conversation); **<768px = one**, list *or* conversation. The empty desktop
right pane is just `flex-1 rt-border` (a 1px right border). The shell cooperates: the page header becomes
`md:hidden` when `pageName === "messages"`, and the mobile footer is dropped inside a conversation.

- **List header:** `flex items-center justify-between` — **"Mark all read"** (`text-sm font-semibold`, disabled with
  no unread) left, `<NewChatWindow />` right. **[REC ✓ — the captured Messages page was EMPTY: just "Mark all read"
  and a white circular `+`. No conversation styling is verifiable from the recording; §10 below is repo-only.]**
- **List row:** `flex items-center px-3 py-2 cursor-pointer justify-between` + `active`; left is
  `ProfileImage className="grow"` (or overlapping avatars + title / **"Group Chat"**); right is the relative time in
  `<small>` then the unread badge. ⚠ **`active` has no CSS** → the selected row has no visual state.
- **Unread badge:** `text-font-color text-sm inline-block px-2 py-0.5 rounded-[10px] select-none mx-1 my-0.5` +
  `bg-highlight light:text-white` when unread, else `bg-neutral-800`.
- **Self-chat** renders `NoteToSelf`: a 48×48 `book-closed` box + bold **"Note to Self"** + a `badge` icon; always
  sorts first.
- **Trust split:** participants at `followDistance <= 2` are listed flat; the rest go in a `CollapsedSection` titled
  **"Other Chats"** (`text-xl flex items-center gap-4`), **starts closed**, with a bare `has-unread` dot (⚠ invisible).
- **Conversation pane:** `FixedPage className="flex flex-1 flex-col"` — `min-h-0 min-w-0 w-full fixed md:relative
  bg-background overflow-hidden` with inline `height: calc(100dvh - <measured header height>px)`; participant header
  `p-3`; scroller `overflow-y-auto hide-scrollbar p-2.5 flex-grow min-w-0`; composer row
  `flex items-center gap-2.5 p-2.5 shrink-0`. Auto-scrolls to bottom via `requestAnimationFrame`. Group header uses
  `flex -space-x-5 mb-2.5` overlapping avatars + title or **"Secret Group Chat"**.
- **Bubbles** (`DM.tsx:71-101`) — wrapper `mt-4 min-w-[100px] max-w-[90%] whitespace-pre-wrap` (+ `self-end` for mine):
  - **mine:** `p-3 bg-[image:var(--dm-gradient)] rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-rounded-lg-none`
    → the violet→pink `#5722d2 → #db1771` gradient. ⚠ that 4th class is a **typo** and matches nothing.
  - **theirs:** `p-3 bg-layer-1 rounded-tl-lg rounded-tr-lg rounded-br-none rounded-bl-none` — both bottom corners
    genuinely squared, flattening the bottom edge.
  - ⚠ **In light mode `--dm-gradient` is the flat `#dee1e8`** fed into `background-image` → invalid → **outgoing
    bubbles render transparent in light mode.**
  - Timestamp under each bubble: `text-gray-400 text-sm mt-1` (+ `text-end` for mine). Failure states: italic gray
    **"Unable to decrypt message"**, **"Loading..."**.
- **Composer:** a `grow`-wrapped autofocus `Textarea` (placeholder empty) + `AsyncIcon className="rounded-full flex
  items-center button" iconName="arrow-right"` → a **white circular pill** send control. Enter sends, Shift+Enter newline.
- **New chat modal:** trigger `<button className="flex justify-center new-chat">` + 16px `plus`. Contains `<h2>`
  **"New Chat"** + a **"Start chat"** button in a `flex justify-between` row; `<h3>` **"Search users"** + input
  placeholder **`npub/nprofile/nostr address`**; selected avatars; `<p>` **"People you follow"** + a
  `user-list flex flex-col gap-0.5` of `ProfilePreview` rows.

---

## 11. Compose (note creator)

**A modal, never inline.** `NoteCreator.tsx:881-886` → `<Modal id="note-creator">`.
`Modal.tsx:71-95` portals to `document.body`: backdrop `w-screen h-screen fixed top-0 left-0 **bg-black/80** flex
justify-center z-[42] overflow-y-auto`; body `**layer-1 px-6 py-4** flex flex-col my-auto **lg:w-[720px]** max-w-full
**max-h-[80dvh]**`. Escape closes; `scroll-lock` on body. **[REC ✓ gray panel over a dimmed page.]**

Trigger = the sidebar/footer FAB (§5.1); keyboard **`n`**.

Order top→bottom (`noteCreatorForm`, wrapper `flex flex-col gap-4`):

1. **Reply context** (if replying): `<h4>` **"Reply To"**, the target note in `max-h-64 overflow-y-auto` with
   `{showFooter:false, showContextMenu:false, showProfileCard:false, showTime:false, canClick:false,
   longFormPreview:true, showMedia:false}`, then `<hr/>`. **[REC ✓ a "Reply To" modal with the quoted note above the
   textarea.]**
2. **Quote context** (if quoting): same shape, `<h4>` **"Quote Repost"**.
3. **Title row + editor** (or the preview, mutually exclusive):
   ```jsx
   <div className="font-medium flex justify-between items-center">
     "Compose a note"
     <AsyncIcon iconName="x" className="bg-neutral-600 rounded-full items-center justify-center flex p-1 cursor-pointer" />
   ```
   **[REC ✓ "Compose a note" + a dark circular × top-right.]** Then the drop zone
   `relative rounded-lg border-2 border-dashed transition-colors` — `border-primary bg-primary/5` while dragging,
   `border-transparent` otherwise — overlaying a `bg-primary/90 text-white px-4 py-2 rounded-lg font-medium text-sm`
   pill reading **"Drop files to upload"**. The textarea is stripped of chrome:
   `!border-none !resize-none !p-0 !rounded-none !text-sm`.

   > **[REC vs REPO] the dashed border is VISIBLE in the recording** (gray dashes around the input at rest), whereas
   > HEAD sets `border-transparent` when not dragging. The 2026-07-14 build evidently omitted `border-transparent`, so
   > the dashed border picked up the global `* { light:border-neutral-400 }` gray. Reproduce the recording's visible
   > dashed border and note the change.
4. Upload progress rows, 5. attachment thumbnails, 6. the footer bar, 7. `text-error` errors, 8. the advanced panel,
   9. a right-side media `Flyout`.

**Textarea** = `ReactTextareaAutocomplete` over `TextareaAutosize`, placeholder **"What's on your mind?"**
**[REC ✓]**, with two triggers: **`:`** → emoji search (5 rows, `flex flex-row items-center gap-2 !py-3 !px-4`) and
**`@`** → profile fuzzy search (10 rows, 28px avatar + name, emits `@nprofile1…`). Dropdown
`border-radius: 1rem; background: var(--color-layer-1)`, selected `var(--color-layer-2)`.
Draft is mirrored into `localStorage["msgDraft"]` on every change and restored on mount. **⌘/Meta+Enter sends.**

**Footer bar** (`NoteCreator.tsx:575-644`) — `flex justify-between`; left cluster `flex items-center gap-4
text-gray-light cursor-pointer`, in exact order:

**28px avatar → `attachment` (24) → `bar-chart` (24) → `settings-outline` (24) → the word "Preview" (`sm:inline
hidden`) → a 40px `ToggleSwitch`** … then, right-aligned, the submit button.

**[REC ✓ exactly: avatar · paperclip · bar-chart · gear · "Preview" · toggle · "Send".]**

- Submit label is **"Send"** — or **"Reply"** in reply mode. **Not "Post".** Written as
  `<AsyncButton className="bg-primary">`, which in light mode renders **white, not orange** (§3.1). **[REC ✓ white
  "Send" pill.]**
- **Attachment** is a Radix dropdown with **"From Server"** / **"From File"**.
- **There is no emoji button** — emoji only via the `:` trigger. **Poll**: clicking seeds `["A","B"]` and the icon then
  disappears; never shown in reply mode. **Advanced** icon goes `text-white` when active.
- **Preview** toggle (`Icons/Toggle.tsx`): an inline SVG pill, `fill-neutral-600` → **`[.active_&]:fill-success`**
  (green `#2ad544`), knob translating `translate-x-3`, 500ms. Toggling on builds the real event and renders it via
  `<Note className="hover:bg-transparent" options={{showContextMenu:false, showFooter:false, canClick:false,
  showTime:false}} />`, replacing the editor entirely.
- **Poll options UI:** `<h4>` **"Poll Options"**, per option a `w-max` block with **"Option: {n}"** (1-indexed) + an
  input, a `CloseButton` for indices > 1, and a trailing `<button>` with a 14px `plus`. **[REC ✓.]**
- **Attachment thumbnails:** `flex gap-2 flex-wrap` of `object-cover w-[80px] h-[80px] !mt-0 rounded-lg`, each with an
  `x` at `absolute -top-1 -right-1 bg-neutral-600 rounded-full`.
- **Upload progress:** `flex items-center gap-2 bg-layer-2 rounded-lg p-2` per file — name (or **"Pasted image"**) in
  `text-sm truncate font-medium`, a stage line in `text-xs text-gray-light` cycling **"Preparing…" / "Uploading…" /
  "Mirroring…" / "Processing…" / "Complete"** (errors `text-error`, fallback **"Upload failed"**), and an
  indeterminate bar `h-1 bg-neutral-600 rounded-full mt-1 overflow-hidden` > `h-full bg-primary rounded-full
  animate-pulse`. Trailing `refresh-ccw-01` retry on error, else `close`.
- **Advanced panel** — three `<h4>` sections: **"Custom Relays"** ("Send note to a subset of your write relays") with
  `px-3 py-2 flex items-center justify-between bg-neutral-600 rounded-lg` checkbox rows · **"Zap Splits"**
  (Recipient placeholder `npub / nprofile / nostr address` + Weight + `close`, an **"Add"** button, a `text-warning`
  caveat) · **"Sensitive Content"** (a `w-full` input placeholder **"Reason"**, `maxLength 50`, plus `text-warning`
  **"Not all clients support this yet"**).
- **Media flyout:** right-side `Flyout` titled **"Attach Media"** (`text-xl font-medium`), `70vw` in wide mode, an
  `expand` `IconButton` (`max-lg:!hidden`) toggling a 2-col / 6-col grid.
- State lives in an `ExternalStore` singleton (`State/NoteCreator.ts`), **not React context**, mounted once as
  `key="global-note-creator"`.

---

## 12. Relays

**Route `/settings/relays`** (`Pages/settings/Relays.tsx`); detail `/settings/relays/:id`; the relay *feed* is
elsewhere at `/relay/:relay?`. The whole `/settings` subtree is wrapped in `<div className="px-3">`.

Page = `flex flex-col gap-4` of My Relays → Add Relays → Discover.

**"My Relays"** — `text-xl font-medium` heading, then two `<small>` lines, verbatim:
> "Relays are servers you connect to for sending and receiving events. Aim for 4-8 relays."
> "The relay name shown is not the same as the full URL entered."

then an **HTML `<table className="table-auto w-full">`** whose `<thead>` row is `className="uppercase
text-neutral-400"`:

**RELAY | STATUS | PERMISSIONS | UPTIME | ⟨trash⟩**

**[REC ✓ all four uppercase gray headers and the layout.]**

Row (`Components/Relay/Relay.tsx:21-48`): name = `connection.info?.name ?? getRelayName(addr)`, **truncated to 20
chars + "…"**, linked to the detail page, full URL in `title` — **[REC ✓ short names "memlay", "nostr.wine",
"damus.io", "nos.lol", not `wss://` URLs]** · status · permissions · uptime (`text-center`) · a bare `trash` icon in
`text-gray-light` that removes **and immediately persists**. **A row renders nothing at all if there is no live
connection object.** Then an `AsyncButton` **"Save"** (default white pill) that publishes a NIP-65 list and blasts it.

**Status — exactly two states** (`status-label.tsx:5-16`), no "connecting"/"reconnecting":
`<div className="rounded-full w-4 h-4">` — **16px circle**, `bg-success` `#2ad544` + **"Connected"**, or `bg-error`
`#ff6053` + **"Offline"**. **[REC ✓ green dot + "Connected".]**

**Uptime — a separate 4-state latency verdict** (`uptime-label.tsx`), from average `rtt-read` in kind-30166 monitor
events over the last day, `idealPing 500`, `badPing 1000`, all `font-semibold` with `title="{ms} ms"`:

| Condition | Label | Color |
|---|---|---|
| `NaN` (no data) | **Dead** | `text-error` `#ff6053` |
| `> 1000ms` | **Poor** | `text-error` |
| `500–1000ms` | **Good** | `text-warning` `#ff8800` |
| `< 500ms` | **Great** | `text-success` `#2ad544` |

**[REC ✓ every row read a red "Dead" while simultaneously "Connected" — reproduce this; it is what the real client
shows when no monitor data has loaded.]**

**Permissions are two clickable words, not switches** (`permissions.tsx:9-34`): **"Read"** then **"Write"**, enabled =
default color, disabled = `text-gray`. Toggling mutates login state immediately but does **not** publish — you must
press Save. **[REC ✓ "Read  Write" as plain words.]**

**Add Relays** — `text-xl` heading, `<small>` **"You can add a single or multiple relays, one per line."**, a plain
`<textarea rows={4} placeholder="wss://my-relay.com">` (12px radius per §3, *not* a pill), then an
`AsyncButton className="secondary"` **"Add"**. Submission splits on `\n`, prefixes `wss://` when no scheme, sanitizes,
and adds `{read:true, write:true}`. **[REC ✓.]**

**Discover** — two `CollapsedSection`s, **both start collapsed**: **"Popular Relays"** ("Popular relays used by people
you follow.", columns **Relay | Uptime | Users | ⟨add⟩**, top 20, each row `RelayFavicon` + linked name +
`AsyncButton className="!py-1 mb-1"` **"Add"**) and **"Close Relays"** ("Relays close to your geographic location.",
columns **Relay | Distance | Uptime | ⟨add⟩**, up to 100, distance as **"{n} km"**). Both header rows use
`text-gray-light uppercase` — inconsistent with My Relays' `text-neutral-400`; reproduce as-is. **[REC ✓ both
sections present and collapsed below Add Relays.]**

**Detail page** (`RelayInfo.tsx`): `flex flex-col gap-4`; an **80px `RelayFavicon`** + `text-2xl font-bold` name + a
paid/free chip (`rounded-full px-2 py-1 font-medium`, `bg-[var(--pro)] text-black` `#ffdd65` = **"Paid"**,
`bg-[var(--free)]` `#1a5aff` = **"Free"**), raw URL beneath in `text-gray-light`; then a `grid grid-cols-3 gap-4` of
cells labelled `uppercase text-neutral-400 font-bold text-sm` — **Admin · Contact · Software · Status · Permissions ·
Uptime**; `<hr/>`, a **"View Feed"** button, `<hr/>`, and a `CollapsedSection` **"Supported NIPs"**
(`startClosed={false}`) linking each NIP to the nips repo. `RelayFavicon` hotlinks the relay host's favicon —
**CSP-unsafe for Sandstr.**

---

## 13. Search

Route `/search/:keyword?`. `SearchPage.tsx:89-108`:
```jsx
<div className="px-3 py-2 flex flex-col gap-2">
  <input type="search" placeholder={"Search..."} … />   {/* Enter → /search/<term> */}
  <TabSelectors tabs={SearchTab} … />
</div>
{content}
```
- A **bare `<input type="search">`**, placeholder **"Search..."** — no icon, no wrapper, no button. Per §3 it is a
  **fully-rounded pill** (`.btn, input, select { @apply rounded-full }` beating the 12px rule).
- **Two pill tabs**: **Notes** (default) then **People**, no icons.
- Notes results = `Timeline subject={{type:"post_keyword", …}} postsOnly={false} method="LIMIT_UNTIL"`, and because
  `Timeline` forwards `highlightText` for `post_keyword`, **matched terms are highlighted inside notes**.
- People = `px-3 flex flex-col gap-4`, a `PageSpinner` while the external `NostrProfiles` API is in flight, then
  `FollowListBase` over API results merged ahead of local fuzzy matches, `options:{about:true}`.
- Empty keyword renders nothing. The shell header title becomes **"Search: {term}"**.

---

## 14. Settings index

Route `/settings` → `Pages/settings/Menu/Menu.tsx`, rendered by
`Pages/settings/Menu/SettingsMenuComponent.tsx:7-36`:

```jsx
<div className="p-2 font-bold uppercase text-neutral-400 text-xs tracking-wide">{group.title}</div>
<Link className={classNames("px-2.5 py-1.5 flex justify-between items-center border", {
    "rounded-t-xl": first, "rounded-b-xl": last, "border-t-0": !first })}>
  <div className="flex items-center gap-3">
    <div className={`p-1 ${iconBg} rounded-lg flex justify-center items-center text-white`}>
      <Icon name={icon} size={18} className="relative" /></div>
    <span className="text-base font-semibold flex-grow">{message}</span>
  </div>
  <Icon name="arrowFront" size={12} className="text-neutral-400" />
```

Each group is a **collapsed-border stack** — `rounded-t-xl` on the first row, `rounded-b-xl` on the last,
`border-t-0` on the rest (iOS-Settings-like). Group titles are `uppercase text-neutral-400 text-xs font-bold
tracking-wide`. Each row = a **`p-1 rounded-lg` colored icon tile** with an 18px white glyph + `text-base
font-semibold` label + a 12px `arrowFront` chevron in `text-neutral-400`. **[REC ✓ every detail, including the
uppercase group headings ACCOUNT / INTERACTION / SUPPORT.]**

| Group | Item | Icon | `iconBg` | Sampled from recording | Present in Snort? |
|---|---|---|---|---|---|
| **Account** | Profile | `profile` | `bg-green-500` | `#12db4f` ✓ | yes |
| | Export Keys | `key` | `bg-amber-500` | `#f48c09` ✓ | yes |
| | Nostr Address | `badge` | `bg-pink-500` | `#e5118d` ✓ | yes (`features.nostrAddress`) |
| | Preferences | `gear` | `bg-slate-500` | `#586681` ✓ | yes |
| | Wallet | `wallet` | `bg-emerald-500` | `#07d074` ✓ | yes |
| | *Accounts* | `code-circle` | `bg-indigo-500` | — | **no** (subscription only) |
| | Tools | `tool` | `bg-slate-800` | `#1b2435` ✓ | yes |
| **Interaction** | **Relays** | `relay` | **`bg-dark bg-opacity-20`** | **no tile rendered** ✓ | yes — see ⚠ |
| | Moderation | `shield-tick` | `bg-yellow-500` | `#e6ad0a` ✓ | yes |
| | Notifications | `bell-outline` | `bg-red-500` | `#eb0f33` ✓ | yes (`features.pushNotifications`) |
| | *Invite* | `link` | `bg-blue-500` | — | **no** (`communityLeaders: false`) |
| | Cache | `hard-drive` | `bg-cyan-500` | `#0fc1cf` ✓ | yes |
| | Media | `camera-plus` | `bg-lime-500` | `#aeff3c` ✓ | yes |
| **Support** | Donate | `heart` | `bg-purple-500` | `#9f23fd` ✓ | yes → `/about` |
| | *Subscription* | `diamond` | `bg-violet-500` | — | **no** (`subscriptions: false`) |
| | *Zap Pool* | `piggy-bank` | `bg-rose-500` | — | **no** (`zapPool: false`) |
| **Log Out** | Log Out | `logout` | `bg-red-500` | — | yes (one-item group; title == item) |

> ⚠ **The Relays tile has no background.** `bg-dark` is not a defined color and `bg-opacity-*` was removed in
> Tailwind v4, so **the Relays row renders with no colored tile while every other row has one**.
> **[REC ✓ — independently confirmed: in the captured Settings index the Relays row's tile is blank.]** Reproduce the
> gap; do not "fix" it.

The sampled hexes above are P3-shifted (see the header note) but each matches its Tailwind-500 counterpart in hue and
ordering; the class names are authoritative. Note `Pages/settings/messages.ts` exists (81 lines) but the index does
**not** use it — every label is an inline `defaultMessage`.

---

## 15. Onboarding / sign-in

Routes under `/login` → `OnboardingLayout`. **The Header and (nominally) the RightColumn are hidden, but the
NavSidebar and mobile Footer still render** — onboarding is *not* a standalone full-page shell.
**[REC ✓ the sign-in screen keeps the left sidebar (Snort · Home · Discover · red "Sign Up"), and — per §5 — the
right column's Search box is visible too.]**

**Shell** (`Pages/onboarding/index.tsx`):
```jsx
<div className="p-6">
  <div className="float-right flex gap-2 items-center">
    <Icon name="translate" /> <select className="capitalize">…all language codes…</select>
  </div>
  <div className="w-[460px] max-w-full mx-auto my-auto mt-[15vh] rounded-lg px-8 py-7 layer-1">
    <Outlet />
```
A **460px** `layer-1` card, pushed down **`mt-[15vh]`**, `px-8 py-7`, with a **translate icon + language `<select>`
floated top-right**. **[REC ✓ gray card centered in the feed column; sampled card fill `#e1e1e1` = `neutral-200`;
translate icon + a `<select>` showing "العربية" top-right.]**
Wizard state travels in react-router `location.state` (`NewUserState`), not a store.

### Screen 1 — Sign In (`sign-in.tsx`)

`flex flex-col gap-6`; brand image `<img src={CONFIG.icon} width={48} height={48} className="rounded-lg mr-auto
ml-auto" />` = **`nostrich_512.png`**; header block `flex flex-col gap-4 items-center` with an `<h1>` (32/42, w600).

| String (verbatim) | intl id | Element |
|---|---|---|
| **Sign In** | `Ub+AGc` | `<h1>` |
| **Use a nostr signer extension to sign in** | `eF0Re7` | subtitle (signer path only) |
| **Sign in with Nostr Extension** | `TaeBqw` | NIP-07 CTA |
| **Sign in with Nostr Connect** | `90OuKH` | NIP-46 CTA (Android UA only) |
| **Supported Extensions** | `aMaLBK` | `<Link to="" className="highlight">` — ⚠ **empty href, dead link**, and `.highlight` is undefined (the utility would be `text-highlight`) |
| **Sign in with key** | `X6tipZ` | switches to the key form |
| **nsec, npub, nip-05, hex, mnemonic** | `X7xU8J` | input placeholder |
| **Login** | `AyGauy` | submit, `AsyncButton className="primary"` |
| **Don't have an account?** | `25WwxF` | link to `/login/sign-up` |
| **Sign Up** | `39AHJm` | footer `AsyncButton className="secondary"` |
| **Unknown login error** | `OLEm6z` | `<b className="text-error">` |

**[REC ✓ heading, subtitle, both CTAs, "Supported Extensions", "Don't have an account?" and the Sign Up button, in
this exact order.]**

Each signer CTA is a plain `AsyncButton` (→ white pill) containing
`<div className="rounded-full bg-warning p-3 text-white"><Icon name="key"/></div>` — **an `#ff8800` circular badge
with a white key**. **[REC ✓ orange circle + key inside a white pill; sampled `#f57d0d` = P3-shifted `--warning`.]**
`signerExtLogin = (hasNip7 || hasNip46) && !useKey`, `hasNip7 = "nostr" in window`,
`hasNip46 = /Android/i.test(navigator.userAgent)`; container gets `items-center` in that state.

**Key-import methods** (`Hooks/useLoginHandler.tsx`), tried in order: **`nsec…`** (bech32→hex, else
`throw "INVALID PRIVATE KEY"`) · **24-word BIP-39 mnemonic** (NIP-06) · **raw 64-char hex** · **`npub…`/`nprofile…`**
(read-only session) · **NIP-05 address** (fetches `nostr.json`; opens a `bunker://` NIP-46 session if it advertises
`nip46`, else read-only) · **`bunker://…`**. Anything else throws.
⚠ **Pasting a bech32 string auto-submits** (`onChange` calls `doLogin` when the value matches `Bech32Regex`) — no
button press needed. ⚠ Keys are stored **unencrypted during onboarding** (`NotEncrypted`); PIN encryption exists only
via `LoginUnlock`/`PinPrompt`.

> **Sandstr note:** the sim must NOT solicit real keys. This repo detail is recorded for layout fidelity only — the
> existing "stop soliciting private keys" fix (commit `2b885f2`) governs. Reproduce the *shape* of the field, never a
> working nsec path.

### Screens 2–6

| # | Route | `<h1>` | Body / controls | CTA |
|---|---|---|---|---|
| 2 | `/login/sign-up` | **Sign Up** | **"What should we call you?"** (`SmuYUd`); `input.new-username` placeholder **"Name or nym"**; ⚠ input blocks anything matching `Bech32Regex` | **Next** (`9+Ddtu`) — or **Go** if `signUp.quickStart` (**false** for Snort). Footer: **"Already have an account?"** + secondary **Sign In** |
| 3 | `/login/sign-up/profile` | **Profile Image** | `AvatarEditor`: `layer-2 w-40 h-40 rounded-full` (**160px**) with `backgroundImage`/`cover`/`center`, inner `opacity-20 hover:opacity-90` once set, glyph chip `light:bg-neutral-200 p-4 rounded-full` holding a `Spinner` or `edit`/`camera-plus`. **Keys are generated and the account created here.** | **Next** |
| 4 | `/login/sign-up/topics` | **Pick a few topics of interest** | `flex gap-2 flex-wrap justify-center` of chips: `flex gap-2 items-center px-4 py-2 my-1 border cursor-pointer font-semibold layer-2 !rounded-full hover:drop-shadow-sm`, active `!bg-white !text-black`, optional `text-xs opacity-60` count. 6 groups ordered by API count: **Bitcoin & Nostr · Technology · Content & Art · Gaming · Lifestyle · Privacy & Freedom**. Publishes an InterestsList. | **Next** |
| 5 | `/login/sign-up/discover` | **{site} is more fun together!** (→ "Snort is more fun together!") | `FollowListBase` titled **"Recommended for you"** (or **"Trending Users"**), `showFollowAll`, `options:{about:true}`; **"Follow All"** is a `transparent` button | **Next** |
| 6 | `/login/sign-up/moderation` | **Clean up your feed** + **"Your space the way you want it 😌"** | `<small className="grow uppercase">` **"Lists to mute:"**, **"Toggle all"** + a 50px `ToggleSwitch`; one row per list (`flex gap-2 items-center bb`, title `font-semibold grow`); then **"Additional Terms:"**, **"Use commas to separate words e.g. word1, word2, word3"**, a bare `<textarea>`. Lists **NSFW · Crypto · Politics**, **all three default ON**, all `canEdit:false` (`hateSpeech`/`derogatory` are commented out) | **Finish** (`2O2sfp`) → `/` |

Other login entries: sidebar `primary` **"Sign up"** + 24px `sign-in` icon; mobile header `mr-3 primary p-2` with a
20px `sign-in`; and every interaction gate (reply/like/repost/compose) redirects to `/login`.

---

## 16. Logo / brand marks

**There is no Snort SVG and no wordmark asset.** An exhaustive SVG search over `packages/app` finds only
`public/phoenix/logo.svg`, the `icons.svg` sprite, `assets/img/telegram.svg`, and a docs diagram.

- **The mark is raster only.** `public/snort/`: `nostrich_256.png` (256², 150 KB), **`nostrich_512.png` (512², the
  `CONFIG.icon`)**, `nostrich_orig.jpeg`, `favicon.png` (32²), `img/apple-touch-icon.png` (128²). Plus
  `src/assets/img/nostrich.webp` (200²) as the offline/fallback avatar.
- **What it depicts:** a square, full-bleed painterly close-up of an **ostrich head in three-quarter profile facing
  right**, plumage running deep violet → magenta → hot pink in dense scalloped feather shapes with fine stippling; a
  pale peach-to-salmon beak sweeping right; a small dark eye with a violet ring; near-black violet upper-right
  background; a fanned crest top-left. No transparency, no lettering, no vector geometry — **it cannot be redrawn as
  paths; it is a bitmap.** It is also *why* `--highlight` and `--snort-gradient` are violet→pink.
  **[REC ✓ visible as the 48px `rounded-lg` violet bird on the sign-in card.]**
- **The wordmark is live text**, `Pages/Layout/LogoHeader.tsx:52-72`:
  `<h1 className="flex flex-row items-center md:justify-center my-0 p-0 md:mx-3 font-bold text-3xl">`.
  With `navLogo: null` (Snort) it renders **no image**; instead
  - a **monogram tile** — `CONFIG.appName[0]` = **"S"** in a `w-8 h-8` (32px) `rounded-lg bg-dark` box,
    `text-xl` mobile / `text-3xl` from `md`, **`xl:hidden`**. ⚠ **`bg-dark` is undefined → an unfilled box with a
    letter.**
  - the **wordmark** — `{appName}` = **"Snort"**, exact casing, in **Inter `font-bold` (700)** at
    **`text-3xl` (30/36)**, `ml-2`, visible only `md:hidden xl:inline` (i.e. **<768px and ≥1280px**).
    **[REC ✓ bold "Snort", no icon beside it.]**
  - `.logo` is defined in no CSS; `hover:no-underline` cancels the global `a:hover{text-decoration:underline}`.
  - **Seasonal suffixes** appended after the wordmark: ordinal-age **🎂** on the app birthday
    (`Birthday = 2022-12-17`, gated to `CONFIG.appName === "Snort"`), **🎃** Halloween, **🍀** St Patrick's,
    **🎄** Christmas. A `diamond` `text-pro` subscription badge sits under the logo (inert — subscriptions off).
- **`--snort-gradient` is NOT on the wordmark.** Its only consumer is `text-snort-gradient`, applied in exactly one
  place: the **verified first-party nip05 domain** (`Nip05.tsx:61`).
- Mounts: `NavSidebar.tsx:86` (`showText={!narrow}`) and `Header.tsx:104` (`showText={false}`, wrapper
  `p-2 md:p-0 md:invisible` → mobile-only).
- **Phoenix's `logo.svg` is the one redrawable vector** (228×228, 9 paths, 8 linear gradients): a stylized phoenix
  rising, built from overlapping flame ribbons — head and hooked beak top-center-right, a swept crest, a body ribbon
  curling down-left, layered tail/wing sweeps closing into a rough circle. Tight red→orange ramp
  (`#DE271D`/`#F13117`/`#FB4A11` bottom, `#FD5110→#F73714→#EE2F16→#F97910` body, `#E5261A` left wing,
  `#FD6A0F→#F83B11` head, `#FB8811` alpha fades), most gradients vertical. **No wordmark in it.**

> **Sandstr / `THIRD-PARTY.md` note (SHIP-AND-GRANT B3):** reading hex values, icon names, label strings and action
> ordering from this repo is fact-gathering, not copying expression. **Do not ship `nostrich_*.png` or Phoenix's
> `logo.svg` path data**; use the `ClientGlyph` monogram fallback until Kieran grants explicit consent — which the
> §0 open question makes a prerequisite anyway.

---

## 17. What the recording does and does not cover

**Covered (desktop 1434×796 CSS, LIGHT theme, signed in):** logged-out home · Sign In · home feed with the
`Following` picker and the live strip · note cards with the full action bar · thread/replies · Discover pill tabs ·
Notifications (reaction + mention groups) · **empty** Messages list · Profile (no banner) with the action row and tab
pills · Settings index and its colored tiles · Preferences · Notifications settings · **Relays** · Cache · Media
Servers · Nostr Address · compose modal · reply modal · poll composer · a zap attempt that failed with
"500 Internal Server Error" · the Trending Notes / Ask Snort AI / Invite Friends widgets.

**NOT covered — take these from the repo sections above:**
- **Dark theme.** The whole recording is light. Snort's default preference is **`theme: "system"`**
  (`Utils/Login/Preferences.ts:135`) and `useTheme.tsx` maps system-light → the `.light` class, so a light-mode
  visitor sees light Snort. The CSS *base* is dark. → **"dark-first" is only half true**; see §18.
- **Any viewport < 1024px** — the mobile bottom bar, the icon-rail sidebar (769–1279px), and the one-column DM layout
  were never exercised.
- **DM conversation bubbles** (the Messages page was empty) — §10 is repo-only.
- Deck (dead), zap-pool / subscribe (feature-gated off), wallet pages, relay detail page, long-form notes,
  quote-reposts, content warnings.

---

## 18. Cross-cutting fidelity notes

1. **Two accents that never blend.** `--primary #ff3f15` = compose/CTA only. `--highlight` violet
   (`#ac88ff` dark / **`#7139f1` light**) = links, hashtags, mentions, unread badge, new-notes pill, icon-button hover.
   The sim's current teal is neither — teal `#1ecbe1` is `--repost` alone.
2. **Theme default is `system`, not dark.** Reproduce both palettes and let the host's `.dark`/`.light` class on
   `<html>` drive it — which happens to match Snort's own mechanism exactly (`useTheme` toggles those same classes) and
   Sandstr's `useParentTheme`. The recording is the authority for **light**; §1 covers dark.
3. **No underline tabs anywhere.** Two idioms only: the **header dropdown** (home feed) and the **rounded pill row**
   (`TabSelectors`, active `bg-layer-3`) for Profile, Search and Discover.
4. **Everything is a pill.** Every bare `<button>` (radius 100px, 10/16, w600, white) and every `input`/`select`.
   Only `textarea` (12px), `.button-icon-sm` (8px) and `.btn` (5px) differ.
5. **Light-mode `.light button` beats Tailwind utilities** (§3.1) — this single rule explains why the recording is a
   page of white pills with exactly two colored controls. Get it wrong and every button reads as the wrong color.
6. **Semantic icon colors come from global element selectors**, not utilities: `svg.heart-solid`, `svg.zap-solid`,
   `svg.repeat` (`index.css:503-513`), reached by passing the icon **name** as the `className`. This is why the
   notification list and profile tabs are colored but the **action bar is not** (§4.4).
7. **Flat divided list, not cards.** `border-b` + `min-h-[110px]` + `px-3 py-2`; media is edge-to-edge and unrounded;
   the only rounded box on a note is an inline quote-embed.
8. **The body is not indented under the avatar** — it starts at the card's left padding, full width.
9. **"via {client}"** in the sub-header is the cheapest distinctive Snort signal available (§4.2).
10. **Hotlinks to replace for Sandstr (CSP/offline):** default avatars
    `https://nostr-rs-api.v0l.io/avatar/cyberpunks/<pubkey>.webp`, relay favicons (`RelayFavicon`), link previews and
    provider embeds. Use the existing inline-SVG `Avatar` and bundled `data:` media, and Snort's own
    `nostrich.webp`-style fallback shape for relays.
11. **Reproduce the bugs — do not "fix" them.** They are load-bearing for fidelity:
    `bg-dark` (logo tile, Relays settings tile, `CloseButton`, deck panel) → no such token, renders unfilled ·
    `hover:bg-secondary` on nav → no hover background · `.has-unread` → invisible unread dot ·
    `text-nostr-purple` / `text-nostr-blue` → reply & repost never change color · `.reacted`, `.reaction-pill*`,
    `.highlight`, `.logo`, `.new-username`, `.new-trending`, `.bb`, `.error`, `text-gray-light` → undefined ·
    `button.icon` unfilled in dark (`--bg-secondary` is light-only) · `.btn` radius 5px not pill ·
    `border-border` in `AsyncButton` → no-op · light-mode DM gradient → transparent outgoing bubbles ·
    `rounded-rounded-lg-none` typo · "Supported Extensions" links nowhere · relay "Dead" uptime beside "Connected" ·
    `--font-size-small` / `--font-size-tiny` dead.
12. **Real identities in the recording are reference-only.** The capture shows real people (Jameson Lopp, utxo the
    webmaster, semisol, Kyma Fi, sandwich, Zaikaboy) with real nip05s and lightning addresses. Per SHIP-AND-GRANT
    **B1**, mock data must use invented personas — **do not transcribe any of these into `src/data/mock/`.**

---

## 19. Why Snort is preview-tier, and what this spec fixes

From `docs/SHIP-AND-GRANT.md` §4 the Snort sim has **zero real tokens, invented navigation, and a corrupted code
block**. Mapping each to the sections above:

| Defect | Fix source |
|---|---|
| **Zero real tokens** — `snort.theme.css` uses teal; nothing traceable to the client | §1 (full token table + light/dark + gradients), §2 (Inter, 15px, real type scale), §3 (the pill system) |
| **Invented navigation** | §5.1 (the real 5 items + labels-only-at-1280 + wallet row + ProfileMenu), §5.3 (the near-empty desktop header), §6.1 (**feed picker is a dropdown, not tabs**), §5.5 (the real mobile bar), §5.6 (**Deck is dead — don't build on it**) |
| **Corrupted code block** (`CodeBlock.tsx` escape-then-inject → visible markup, `dangerouslySetInnerHTML`) | §4.3: **Snort has no syntax highlighter.** Real code rendering is `<pre className="bg-layer-2 px-2 py-1 rounded-lg">` / `<code className="bg-layer-2 px-1.5 py-0.5 rounded-lg">`. Deleting the regex highlighter is *more* faithful, not less — it removes the bug and the `dangerouslySetInnerHTML` in one move. |
| **Login clipping / dead end** (B9b: `.snort-main` 765 vs 900) | §15 exact card geometry (460px, `mt-[15vh]`, `px-8 py-7`) + §5 (the shell scrolls as one document — Snort has no non-scrolling app shell, so the Sandstr card body needs `overflow-y: auto`) |
| **640–768px band deletes nav** (B10) | §5: the real breakpoints are **`<=768` no sidebar / `>=1024` right column**, enforced in **JS as well as CSS**. Reproducing Snort's own gates gives the correct behaviour in that band for free. |
| Wrong default theme (B16) | §18.2: default is **`system`**, and the recording is light. |

**Surfaces to build, in fidelity-value order:** note card + action bar (§4) → shell/nav + feed picker (§5, §6) →
Settings index with its colored tiles and the blank Relays tile (§14) → Relays (§12) → Profile (§8) →
Notifications (§9) → compose modal (§11) → Sign In (§15) → Discover (§7) → Search (§13) → DMs (§10, repo-only).
