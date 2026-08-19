# Coracle (web) — Ground-Truth Reproduction Spec

Authoritative spec for a faithful React/Tailwind web reproduction of the Coracle Nostr web client.

**Sources**

- **Recording:** `docs/refs/coracle/shots/Nagranie z ekranu 2026-08-5 o 12.10.29.mov` — owner's capture of the
  real `app.coracle.social`, recorded **2026-08-05**, 7:40 (460 s), 2868×1576 ≈ **1434×788 CSS px @2×
  (desktop, DARK theme, signed in as `@test`)**. Frames extracted to `shots/frames/` (scene-detect) and
  `shots/periodic/` (0.5 fps, 230 frames) — all gitignored, only this map is committed.
- **Repo recon:** `coracle-social/coracle` @ **`efea13f02ea44083d93e695a860dedadda68fe5e`** ("Fix a tag
  parsing error", 2026-08-04). License **MIT**. Author **Jon Staab (`hodlbod`)**, FUTO fellow.
- Stack: **Svelte 4** (`package.json:81` — *not* Svelte 5) · **Tailwind 3** (`tailwind.config.cjs`) ·
  Vite 6 · a hand-rolled router (`src/util/router.ts`) · `@welshman/*` for the nostr layer ·
  Tiptap via `@welshman/editor`. Breakpoints are custom: `xs 400 · sm 640 · md 768 · lg 1024 · xl 1280 ·
  2xl 1536` (`tailwind.config.cjs:84-91`).

**Convention:** the repo wins for exact HEX / icon names / label strings; the **recording wins for LAYOUT**
and for "what actually shipped". Divergences are flagged **[REC vs REPO]**.

> ### Reading note — the app is at `app.coracle.social`
> The GitHub repo's `homepage` field and `CNAME` both say **`https://app.coracle.social`**;
> `coracle.social` is the marketing site in front of it. Both are the same project, so
> `registry.tsx` keeps `homepage: 'https://coracle.social'` as the human front door. `.env.template:16`
> `VITE_APP_URL=https://app.coracle.social`, `CNAME:1` — verified 2026-08-05, benign.

---

## 1. Color tokens

Coracle does not ship a CSS palette. Two **env strings** hold `key:hex` pairs, are parsed at boot
(`src/partials/state.ts:29-34`, `fromPairs(raw.split(",").map(x => x.split(":")))`), have `-l`/`-d`
brightness variants computed in JS at ±10 % per channel (`state.ts:52-59`, `adjustBrightness` at `:77-102`),
and are injected as one `:root` `<style>` element (`src/app/App.svelte:359-363`):

```
$: style.textContent = `:root { ${$themeVariables}; background: var(--neutral-800); }`
```

Tailwind then maps every colour name to `var(--name)` (`tailwind.config.cjs:3-49`) and **replaces** the
default palette (`theme.colors`, not `extend`). So `bg-neutral-800` is not Tailwind's neutral-800.

### 1.1 Accents — identical in both themes

| Token | Value | Role |
|---|---|---|
| `--accent` | **`#FC560E`** | the entire brand. Burnt orange. |
| `--warning` | `#FCAB0E` | content warnings, unstable relay |
| `--danger` | `#dc0c0c` | delete, failed relay |
| `--success` | `#12D2B0` | connected relay dot |

**`--accent` is the same hex in light and dark** (`.env.template:1-2`, both strings start `accent:#FC560E`).
There is **no second brand colour and no brand gradient anywhere in the app** — `grep` finds only a shimmer
skeleton, the publish-bar trailing fade, the "show more replies" fade and the avatar placeholder. A
reproducer's reflex to add a hero gradient is wrong for this client.

⚠ `src/partials/LogoSvg.svelte:8` hardcodes a *different* orange, `#EB5E28`, as the fallback for
`--logo-color`. That component has **zero importers** — dead code. `#FC560E` is the brand.

### 1.2 The two ramps — dark base (`.env.template:1`)

| Token | Dark | Where it lands |
|---|---|---|
| `--neutral-950` | `#0A0A0A` | — |
| `--neutral-900` | `#171717` | **top bar** (`Nav.svelte:53`) |
| `--neutral-800` | `#262626` | **page background** and the **modal panel** |
| `--neutral-700` | `#404040` | count pills, onboarding step badge |
| `--neutral-600` | `#525252` | **every hairline border in the app** |
| `--neutral-500` | `#737373` | inactive onboarding dot |
| `--neutral-400` | `#A3A3A3` | meta text, placeholders |
| `--neutral-300` | `#D4D4D4` | active onboarding dot |
| `--neutral-100` | `#F5F5F5` | **app-wide foreground** (`Routes.svelte:53`) |
| `--tinted-800` | `#332f2d` | mobile bottom bar (lowercase hex in source, verbatim) |
| `--tinted-700` | `#3E3A38` | **sidebar + the primary card surface** |
| `--tinted-600` | `#5A524F` | `.btn-low` hover |
| `--tinted-500` | `#756A65` | sidebar footer links |
| `--tinted-400` | `#B9A69E` | **inactive nav label** |
| `--tinted-200` | `#DED3CF` | body text (`App.svelte:454`) |
| `--tinted-100` | `#F1EAE7` | nav label hover |

**This is the thing to get right.** `tinted-*` is a *warm brown-grey* ramp and it carries the sidebar, the
cards and the low-emphasis buttons; `neutral-*` is the cold ramp under the page and the top bar. The old
Sandstr sketch used one cold grey scale and lost the entire character. In the recording the sidebar
(`#3E3A38`) is visibly warmer than the page behind it (`#262626`), and the top bar (`#171717`) is darker
than both.

### 1.3 Light theme inverts the ramp in place (`.env.template:2`)

Light does not add overrides — it **reassigns the same variable names** so `neutral-950:#FAFAFA`,
`neutral-100:#171717`, `tinted-800:#FFFFFF`, `tinted-700:#FAFAFA`, and so on. Consequence:
`text-neutral-100` means "foreground" in **both** themes, and every component is written once.
`--accent`, `--warning`, `--danger`, `--success` are byte-identical across the two.

### 1.4 Theme default and mechanism

`src/partials/state.ts:36-40`:

```ts
export const theme = synced({key: "ui/theme", defaultValue: "dark", storage: localStorageProvider})
```

**Dark is the shipping default** — persisted under localStorage `ui/theme`, and a subscriber toggles the
`dark` class on `document.documentElement` (`:42-48`). There is **no `prefers-color-scheme` detection**
anywhere. `toggleTheme` (`:50`) is reachable only from a menu item (`MenuDesktop.svelte:135-137`
`fa fa-palette` "Toggle Theme"; `MenuMobile.svelte:122-124` "Theme") — **there is no theme control in
Settings**.

Because the variables swap wholesale, Tailwind `dark:` variants are nearly unused: ~18 in the whole app.

### 1.5 Card alternation — the mechanism a reproducer will miss

`src/partials/AltColor.svelte:9-30` walks the DOM counting `.bg-swap-bg` ancestors: even depth →
`bg-tinted-700`, odd → `bg-neutral-800`. `Card.svelte:53-59` wraps its content in one. So **nested reply
cards alternate `#3E3A38` / `#262626` by depth**, and that alternation *is* how threads read. Chips and
overflow buttons sitting on a card use the opposite surface for the same reason.

---

## 2. Typography

- **Body: Lato.** `:root { font-family: Lato; --bc-color-brand: var(--accent) }` (`app.css:90-93`).
  Self-hosted TTF (`app.css:45-70`, `/fonts/Lato-Regular.ttf`, `-Bold.ttf`).
- **Display: Staatliches.** `.staatliches { font-family: Staatliches }` (`app.css:86-88`), self-hosted
  `/fonts/Staatliches Regular 400.ttf` (`app.css:72-79`). Used by `.btn`, `Heading`, `Subheading`, every
  nav label and every section `h2`.
- **`.staatliches` sets ONLY `font-family`** — `grep text-transform src/app.css` → no hits. The recording
  shows FEEDS / RELAYS / CREATE / TRY FLOTILLA in caps because **Staatliches is an all-caps typeface**:
  its lowercase codepoints draw capitals. Every copy string in the repo is Title or sentence case.
- `Heading` = `h1.staatliches.my-4.text-6xl` (60px) — `Heading.svelte:5`.
  `Subheading` = `h2.staatliches.my-1.text-3xl` — `Subheading.svelte:5`.
  Section headers are `h2.staatliches.text-2xl`.
- Base size is the browser default 16px — no `fontSize` extension in `tailwind.config.cjs:71-96`.
- ⚠ `.montserrat` (`app.css:81-84`) resolves to **Lato**, and is referenced nowhere. Dead.
- ⚠ The italic `@font-face` points at `/fonts/Italic.ttf`, which does not exist; the file shipped is
  `Lato-Italic.ttf` (`app.css:63-70`). Real, harmless, unfixed.
- `"Satoshis"` (`/fonts/Satoshi Symbol.ttf`) exists for exactly one glyph: `CurrencySymbol.svelte:8`
  renders `!` at `font-size: 1.2em` to draw the sat sign.

**Sandstr substitution.** Neither font is bundled here (no new dependencies; a webfont request is
forbidden). Both resolve through fallback stacks, and `.co-staatliches` adds an explicit
`text-transform: uppercase` — the one property this reproduction has that the client does not, added
precisely to preserve what the client *looks* like once the all-caps face is gone.

---

## 3. Icons

**Font Awesome 6 Free, solid, class-based.** `@fortawesome/fontawesome-free ^6.7.2` (`package.json:33`),
imported once (`App.svelte:2-3`) and used as `<i class="fa fa-name" />` ~349 times. Most-used:
`fa-times` 15, `fa-search` 13, `fa-plus` 13, `fa-server` 10, `fa-info-circle` 10,
`fa-triangle-exclamation` 9, `fa-circle-notch` 8 (with `fa-spin`), `fa-bolt` 7.

**Plus a seven-icon bespoke SVG partial** — `src/partials/Icon.svelte`, a 17×16 viewBox, colour resolved
through `$themeColors[color]` (`:8`), default `neutral-100`:
`bolt` · `heart` · `message` · `people-nearby` · `server` · `network` · `openwith` (25×27).

**These seven are STROKED OUTLINES, ~1.4 stroke width.** That is why Coracle's note action row looks
lighter and more hand-drawn than every other client's filled row — and the zap bolt in particular is an
open slanted zig-zag, not FA's filled lightning. Preserve the outline-vs-fill contrast: action icons
stroke, chrome icons fill.

⚠ `NoteContentKind7.svelte:9-12` renders `Icon icon="thumbs-down"` for a `"-"` reaction, but
`thumbs-down` is not in `Icon.svelte`'s if-chain → **renders an empty SVG**. Dead branch.

**Sandstr substitution.** Neither Font Awesome nor its art ships here. The glyphs in
`src/simulators/coracle/components/Icon.tsx` are drawn for this repo on a 512 box with solid fills, so they
read the way FA-solid reads. The seven stroked action icons are reproduced on upstream's own 17×16 box.

---

## 4. Buttons, cards, chips, inputs (`app.css:374-415`)

```css
.btn      { @apply staatliches flex h-7 items-center justify-center gap-2 whitespace-nowrap
                   rounded bg-white px-6 text-xl text-black transition-all; }
.btn-low  { @apply bg-tinted-700 text-tinted-200; }   /* hover: bg-tinted-600 */
.btn-accent { @apply bg-accent text-white; }          /* :hover re-declares the SAME bg */
.btn-danger { @apply border border-solid border-danger text-danger; }  /* OUTLINE, not filled */
.btn-tall { @apply h-10; }
.btn-circle { @apply rounded-full aspect-square w-7 !p-0; }
.btn-disabled { @apply pointer-events-none opacity-50; }
```

**The base `.btn` is WHITE on BLACK.** That is the default variant — the recording's BACK, INFO, EXPLORE
and EDIT buttons are all this. Accent is opt-in and reserved for the primary action. Radius is a bare
`rounded` (0.25rem) — Coracle is not a pill-button app; `rounded-full` is for avatars and chips only.

- **Card** — `AltColor background class="rounded text-neutral-100 px-7 py-5"` (`Card.svelte:53-59`).
  `interactive` adds `cursor-pointer border-r-4 border-transparent hover:border-neutral-600`: the hover
  affordance is a **right-edge bar**, never a background change and never a shadow.
- **Chip** — `inline-block rounded-full border border-solid`, `border-neutral-100`, `pad` → `py-1 px-2`
  (`Chip.svelte:13-32`). The feed filter pills in the right rail are these; `!bg-accent` marks the active
  one.
- **Input** — `h-7 rounded`, **white with dark text by default**, `bg-neutral-900 text-neutral-100` with
  the `dark` prop (`Input.svelte:30-37`). Both are used: white on the relay search and the composer, dark
  in the top bar. ⚠ Every input carries `shadow-inset`, which **is defined nowhere** (not in `app.css`,
  not in the Tailwind config) — a no-op.
- **Tabs** — neutral, **not** accent: active `border-neutral-500`, inactive `border-neutral-700 opacity-75`
  (`Tabs.svelte:12-19`).
- **Links are underlined and untinted** (`app.css:281-283`). Coracle does not colour its links.
- **Toggle** — react-switch with a `1px solid var(--neutral-600)` border (`app.css:341-343`).
- **Shadows are sparse**: `shadow-2xl` on the search dropdown and the scroll-to-top FAB, `shadow-xl` on
  toasts, `shadow-lg` on popovers. **No `backdrop-blur` anywhere** (zero grep hits).
- **Scrollbars are only hidden, never skinned** (`app.css:362-370`).

---

## 5. App shell

### 5.1 Breakpoint logic is JS, not CSS

`Nav.svelte:48-51,108` binds `innerWidth` and renders the top bar only `>= 1024`, the bottom bar only
`< 1024`. `Menu.svelte:10-14` picks `MenuMobile` vs `MenuDesktop` on the same threshold.

### 5.2 Desktop sidebar (`MenuDesktop.svelte:77-241`)

`fixed z-sidebar w-72 bg-tinted-700` — **288px, warm, full height**, `z-sidebar` = 6, which is *above*
`z-nav` = 2, so the top bar sits behind it.

1. **Wordmark** (`:78-87`) — an `<img>` of `/images/wordmark-{dark,light}.png` (1729×438), swapped by
   theme, wrapped in a link to the GitHub repo. The art is the orange swirl glyph + "CORACLE" in
   Staatliches letterforms.
2. **Six text-only items, no icons**, in order (`:88-123`):
   **Feeds** `/notes` · **Relays** `/settings/relays` · **Notifications** `/notifications` ·
   **Messages** `/channels` · **Groups** `/groups` (modal) · **Lists** `/lists` (modal).
   All but Feeds are `disabled={!$signer}`.
3. **Active state** (`MenuDesktopItem.svelte:12-32`): `text-3xl text-accent` vs inactive
   `text-2xl text-tinted-400 hover:text-tinted-100`, plus an accent underline `h-px w-full bg-accent`
   that flies in with `elasticOut {x: 50, duration: 1000}`. **No pill, no tint, no background.** The item
   physically grows when selected — that size jump is a signature.
4. **Unread badge** — `absolute -right-2.5 top-1 h-1.5 w-1.5 rounded bg-accent` (`:96,107,118`). Note
   `rounded`, **not** `rounded-full`: a 6px accent *block*, not a bead.
5. **Footer** (`:124-132`): a `Settings` button opening a submenu, then `About / Terms / Privacy` in
   `staatliches text-tinted-500`.
6. **Publish HUD** (`:208-228`) — `h-12`, `border-t border-neutral-600`, three counters:
   `fa fa-hourglass` pending · `fa fa-cloud-arrow-up` succeeded · `fa fa-triangle-exclamation` failed.
   Zeros are `text-tinted-500`; the failure icon turns `text-accent` when non-zero. Confirmed in the
   recording, which shows `⧗2  ☁7  ⚠0` and later `⧗1 ☁11 ⚠1` with the warning glyph orange.
7. **Account row** (`:229-241`) — `h-20`, `border-t`, `PersonCircle h-10 w-10` + `@{displayName}` →
   opens the account submenu; logged out it is a `btn btn-accent` **Log In** instead.

**Submenus** (`MenuDesktopSecondary.svelte:14-24`) slide up from `bottom: 4.5rem`, `w-72`,
`rounded-t-xl bg-neutral-800`, items hover `bg-accent`:
- *settings*: `fa-palette` Toggle Theme · `fa-database` Database · `fa-wallet` Wallet · `fa-cog` App
  Settings · `fa-volume-xmark` Content Settings
- *account*: `fa-user-circle` Profile · `fa-key` Keys · `fa-paper-plane` Create Invite ·
  `fa-right-left` Switch Account · `fa-right-to-bracket` Log Out

### 5.3 Top bar — desktop only (`Nav.svelte:51-105`)

`flex h-16 items-center justify-end gap-8 bg-neutral-900 pl-4 pr-8` — **right-aligned, 64px, and it
contains no logo and no tabs**. Only two things: a `dark` search Input plus a
`btn !bg-tinted-700 !text-tinted-200` **Search** button, and the accent **`Post +`** button (verbatim
label, with the space). Logged out the CTA is **Log In**. Typing opens a dropdown
`absolute right-0 top-10 w-96 rounded shadow-2xl` over `max-h-[70vh] overflow-auto rounded bg-tinted-700`,
rows `px-4 py-2 hover:bg-neutral-800`, footer `fa-circle-notch fa-spin` + "Loading more options...".

### 5.4 Page container (`Routes.svelte:50-68`)

```
id="page"  m-sai scroll-container relative overflow-auto pb-32 text-neutral-100 lg:pl-72 lg:pt-16
  → m-auto w-full max-w-2xl
    → flex max-w-2xl flex-grow flex-col gap-4 p-4
```

**Content column is `max-w-2xl` = 672px**, centred in the space left of the sidebar, `gap-4 p-4`.

### 5.5 Mobile (`< 1024px`) — three zones, not a tab bar (`Nav.svelte:108-151`)

`fixed bottom-0 z-nav bg-tinted-800 dark:bg-black`, inner `rounded-t-xl px-4 py-2`:
left third a round `fa fa-search` button in `text-accent`; centre the same **Post +** accent pill; right
third a hamburger (an inline FA-bars SVG, the one icon not drawn by the font) overlapped by a
`PersonCircle -ml-4 h-11 w-11 border-4`. Tapping opens `MenuMobile`, a **bottom sheet** with a 2-column
grid of 112×112 `bg-tinted-700` tiles. Not reproduced here — the host gates Coracle behind
`DesktopClientGate` under 640px, and this band is separately tracked work.

### 5.6 Foreground buttons (`ForegroundButtons.svelte`)

**There is no compose FAB.** The only floating control is scroll-to-top, shown after `scrollY > 1000`:
a `rounded-full border shadow-2xl hover:scale-105` circle with `fa fa-arrow-up`.

### 5.7 Modals (`Routes.svelte:71-81`, `Modal.svelte`)

Almost everything is a modal, not a page: note detail, profile, login, signup, compose, groups, lists,
invite, QR. Scrim `absolute inset-0 cursor-pointer bg-black opacity-50`; the scrim layer gets **`ml-72`
at ≥1024px so the sidebar stays lit and clickable** (`:114`) — visible in every modal frame of the
recording. Panel is opaque `bg-neutral-800`, inner `m-auto flex max-w-2xl flex-col gap-4 p-4`. Close is a
**round accent button**, `h-10 w-10 rounded-full border-accent bg-accent text-white` + `fa fa-times fa-lg`
(`:139-142`) — one of the loudest Coracle tells. A nested modal adds a `fa-angles-down` "close all" chip.
`mini` floats the sheet at `mt-[45vh]`. Swipe-down dismisses (deltaY > 200).

---

## 6. Feeds — the home surface

Route `/` → `Home.svelte` → `Feeds.svelte` → `Feed.svelte`. `defaultFeed` (`engine/state.ts:539-548`) is
`Scope.Follows` ∩ note kinds, or `DEFAULT_FOLLOWS` when you follow nobody.

### 6.1 Controls row (`FeedControls.svelte:88-102`)

`flex flex-grow items-center justify-end gap-2`: a `dark` search Input with a trailing `fa fa-search`,
then the **Replies** toggle — `btn btn-accent border-none` when on, `btn btn-low border-none opacity-50`
when off (`Feed.svelte:148-152`, persisted under localStorage `Feed.shouldHideReplies`) — then
**Customize** as `btn btn-low`, which opens the feed builder. In the recording REPLIES is accent-filled
and CUSTOMIZE is the muted tinted button, exactly as specified.

### 6.2 The right rail is the feed selector (`FeedControls.svelte:99-102`)

```
Card class="flex flex-col gap-4 xl:fixed xl:bottom-4 xl:right-4 xl:top-20 xl:z-nav
            xl:w-80 xl:overflow-y-auto 2xl:w-96"
```

**Below `xl` this is a card sitting above the feed; at `xl` and up it is promoted to a fixed right
sidebar.** It is not a global third column — it exists only on the feed route, and `Feeds.svelte:28-30`
compensates with `<div class="xl:-ml-40 xl:mr-40">`.

Contents (`FeedSelector.svelte:79-141`), all verbatim:

- `Your Feeds` — `p.staatliches.text-2xl`
- **From People you Follow** (`<strong>`): seven chips —
  `Notes & Replies` · `Polls` · `Articles` · `Media` · `Reposts` · `Reactions` · `Everything`
- **Relay Feeds**: one chip per relay feed + `fa fa-edit` **Edit relay feeds**
- **Your Lists**: list chips + `fa fa-edit` **Edit lists**
- **Custom Feeds**: user/list/favourited feeds + `fa fa-edit` **Edit feeds**

The active chip is `!bg-accent`. This composable-feeds panel is the Coracle signature — the thing you
would miss if you cloned the note card and stopped.

### 6.3 Feed body (`Feed.svelte`)

Items enter `in:fly={{y: 20}}`. Paging splices **10 at a time** from a buffer refilled at 25
(`:109-116`); infinite scroll polls with rAF at a 3000px threshold — **no IntersectionObserver, and no
skeletons anywhere in the repo** (`grep skeleton` → 0). Loading is the `Circle2` spinner with
`colorOuter = accent`, faded in after a 1000ms delay, `py-20`.

- **Exhausted state** (`:189-193`): `/images/pumpkin.png` at `h-20 w-20` above the text **"That's all!"**.
- **"Enjoying Coracle?" interstitial** (`:171-183`): after item 20, on a hash-derived 1-in-100 note, a
  Card offering **Dismiss** and accent **Zap the developer**.
- **There is no "new notes" indicator** — `grep` finds none; new events sit in the buffer.
- Logged out, `Feeds.svelte:17-26` puts a `py-16 text-center` block above a **fully populated feed**:
  "Don't have an account?" / "Click here to join the nostr network."

---

## 7. Note card

`Feed → NoteReducer → FeedItem → Note(Card) → NoteHeader / NoteContent / NoteActions / NoteReply`.

### 7.1 Header (`NoteHeader.svelte:43-80`)

`flex gap-4`: `PersonCircle h-10 w-10` (**40px**), then the name block, then a right-aligned
`text-xs` timestamp button.

- Line 1: display name + the **WoT score dial** immediately to its right.
- Line 2 (`text-xs`): **NIP-05 handle in `text-accent`** (hidden below 400px), a `-` separator at 50%
  opacity, then the truncated npub at `opacity-50`. **There is no verified checkmark anywhere** — the WoT
  ring plays that role.
- Content is indented `mt-2 sm:pl-14`, actions `pt-4 sm:pl-14` — aligned under the name, avatar
  overhanging on mobile.
- Parent/thread affordances: `fa fa-code-merge` + underlined **View Parent**, `fa fa-code-pull-request` +
  **View Thread**.
- Pinned: `fa fa-thumbtack absolute -right-1 -top-1 rotate-45 text-accent`.
- Muted: `ml-14 mt-4 border-l-2 border-neutral-600 pl-4` + "You have hidden this note." + underlined
  **Show**.
- **Clicking the card body opens the note detail MODAL** (`Note.svelte:47-56`), unless the target is an
  `<i>` or inside an `<a>`.

**WoT dial** (`WotScore.svelte:33-43`): a 16×16 SVG arc, stroke `accent` when the person is followed or is
you, `neutral-200` otherwise, over a `var(--neutral-600)` background ring. Hovering opens `WotPopover`
with about / NIP-05 / lud16 / npub. In the recording this reads as a small orange or grey **circle
outline** after every display name — trivially easy to mistake for a "verified" badge and just as easy to
omit. It is neither: it is the web-of-trust score.

### 7.2 Action row (`NoteActions.svelte:267-382`)

Wrapper `flex w-full justify-between text-neutral-100`, left group `flex gap-8 text-sm`, each button
`pt-1 hover:pb-1 hover:pt-0` (a 1px lift). Counts are tweened integers.

**ORDER: Reply → Zap → Like → Repost → Open-with.**

| # | Icon | Active colour | Count |
|---|---|---|---|
| 1 Reply | `Icon message` (stroked) | accent if you replied | distinct replies |
| 2 Zap | `Icon bolt` (stroked, slanted) | accent if you zapped | **total sats**, `formatSats` (`1,1K`) |
| 3 Like | `Icon heart` (stroked) | accent + `fa-beat` scale 1.4 / 0.4s once | unique reactors |
| 4 Repost | `fa fa-rotate` (**filled**, the only FA one) | `text-accent` | unique reposters |
| 5 Open-with | `Icon openwith` | — | kind ≠ 1 with NIP-89 handlers only |

Defaults from `note_actions` = `["zaps","replies","reactions","reposts","recommended_apps"]`.
The reaction is a plain `"+"` kind-7 — **no emoji picker on the card**. Zap default is **21 sats**.
**ABSENT: bookmark, share, view counts.**

Right side (`scale-90 gap-2`): a PoW chip (`fa fa-hammer text-accent` + bits, when pow > 15), an
`fa fa-lock` "Encrypted" chip, the **seen-on-relays chip** (`staatliches bg-neutral-800 px-2`, count in
accent, "relay"/"relays"), then the overflow `⋮`. All four appear in the recording.

**Overflow menu** (`OverflowMenu.svelte`): `fa fa-ellipsis-v` in a `w-6 rounded bg-neutral-800` tile;
the popover is a vertical stack of right-aligned labels each with a circular `btn btn-tall btn-circle
text-accent` icon, over a blurred `bg-neutral-800` blob. Items: **Quote · Tag · Mute/Unmute · Report ·
Broadcast · Delete · Pin/Unpin · Details**.

### 7.3 Content (`NoteContentKind1.svelte`)

Truncates at 500–1000 chars, applies `mask-image: linear-gradient(0deg, transparent 0px, black 100px)`,
then a centred `btn btn-low` labelled **"See more"** (not "Show more"). Quoted events render as nested
interactive cards with a 24px avatar to **max depth 2**, beyond which they degrade to a truncated
underlined bech32. Images go through `MediaGrid` (`grid-cols-{ceil(sqrt(n))}`, first item spanning, each
dismissible via a white circular `fa fa-times`); non-media links become an OG preview card with a
**white footer** (`bg-white px-4 py-2 text-black`) holding a bold title and a 140-char description — the
recording's "Design Engineer Tools" card. **Hashtags render underlined, not accent-coloured.**

#### 7.3.1 Segmentation, and the code quirk

Content is segmented by `@welshman/content`, whose `parsers` array is tried **in order** at each
position (`parser.js:186-198`: newline · legacyMention · **topic** · **codeBlock** · **codeInline** ·
address · profile · emoji · event · cashu · invoice · email · link). The three that matter for kind-1
plain text, verbatim from `@welshman/content@0.9.0-pre4`:

```js
parseTopic       /^#[^\s!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]+/   // skips /^#\d+$/, value = slice(1)
parseCodeBlock   /^```([^]*?)```/
parseCodeInline  /^`(.*?)`/
```

Two consequences that look like bugs and are not:

1. **The topic charset excludes `_`.** `#stacking_sats` parses as the topic `#stacking` followed by
   the literal text `_sats`. Numeric topics (`#840000`) are skipped entirely and stay text.
2. **`parseCodeBlock` captures the language tag.** The capture group is everything between the
   fences, and `NoteContentCode` only calls `.trim()` on it — so ```` ```rust ```` renders with
   `rust` as the **first line of the code block**. Coracle has no syntax highlighting and no info-string
   handling.

**`NoteContentCode.svelte` is a single `<span>` for both forms** — there is no separate `<pre>`:

```
rounded bg-neutral-700 px-1 py-px font-mono text-sm text-neutral-100 dark:bg-neutral-900
+ block whitespace-pre overflow-auto   ← only when the value contains a newline
```

Note the background is the one place that needs **different variables per theme**: `neutral-900` in
dark, `neutral-700` in light. Because the ramp inverts, picking either variable alone would give the
wrong surface in one theme.

### 7.4 Details modal (`NoteInfo.svelte:75-167`)

Sections in order: **Zapped By · Liked By · Reposted By · Relays · In this conversation · Apps ·
Details**. The recording's frame shows LIKED BY as a two-column people grid, then RELAYS ("This note was
found on 2 relays below.") with per-relay INFO / EXPLORE / JOIN|LEAVE rows, then DETAILS with the
`nostr:nevent1…` link plus copy and QR icons.

### 7.5 Threads (`FeedItem.svelte`)

Replies nest `ml-4 mt-4`. Each child draws **a partial stroked arc** (`svg h=36 w=36` at
`absolute -left-[18px] top-1`, `r=14`, `stroke-width 4`, `stroke-dashoffset 54`) plus a 4px vertical rail
in the alternating colour; the last reply gets a short `h-10` stub. **Only the first 3 replies show**,
the rest behind a left-fading gradient button `Show {n} more replies` with `fa fa-up-down`. Collapse is a
round `h-8 w-8` button whose `fa fa-arrow-up` rotates 180°. Depth is `isMobile ? 2 : 5`.

### 7.6 Reply editor (`NoteReply.svelte:167-215`)

Opens **inline beneath the card** — no route change. `AltColor rounded` box, Tiptap editor with
**no placeholder**, a circular `h-12 w-12 rounded-full hover:bg-accent` send button holding
`fa fa-paper-plane`, and a bottom toolbar with `fa-paperclip` and `fa-cog` separated by a
`border-neutral-600` divider. Mentions are auto-populated as removable chips; empty state "No mentions".
**nsec tripwire** (`:96`): content matching `/\bnsec1.+/` opens `NsecWarning` —
"It looks like you might be sharing a private key." with **Abort** / danger **Proceed**.

Pending state (`NotePending.svelte`) replaces the action row for 60s: an accent progress bar plus
"Publishing... {n} of {m} relays" / "Published to {x}/{y} relays" + "See details"; with a send delay,
"Sending reply in {n} seconds" + **Cancel**.

---

## 8. Compose (`NoteCreate.svelte`, modal `/notes/create`)

Heading `<span class="text-2xl font-bold">Create a Note</span>` — **Lato bold, not Staatliches**, so it is
NOT uppercase. Label **"What do you want to say?"**. The editor box is
`rounded-xl border border-solid border-neutral-600 p-3` and is **white with black text while editing**
(`class:bg-white={!showPreview} class:text-black`), `bg-tinted-700` in preview.

Meta row under it (`text-neutral-200`): `{n} characters` • `{n} words` • `+ Add poll options` •
`Show Preview` • `fa fa-cog`. Then a `btn btn-accent flex-grow` **Send** and, beside it, a separate
**white square upload button** with `fa fa-upload`. Loading labels: "Signing your note...",
"Generating Work...", "Uploading media...". Every element confirmed in the recording.

**Note settings modal** (`NoteOptions.svelte`, heading "Note settings"): Content warnings (placeholder
"Why might people want to skip this post?") · Schedule post · Proof Of Work (range 0–32 with a work
estimate) · Expire at · Post anonymously · Relays.

---

## 9. Login and onboarding

### 9.1 Login (`Login.svelte`, modal `/login`) — the "Welcome!" screen

`Welcome!` occurs exactly once in the repo. Heading is `Heading` (60px Staatliches), body:
**"Coracle is built using the nostr protocol, which allows you to own your social identity."** with
`nostr protocol` an underlined external link. Column is `max-w-md gap-6`.

Methods **in order**:

| # | Label (verbatim) | Icon | Class | Condition |
|---|---|---|---|---|
| 1 | `Use Browser Extension` | `fa fa-puzzle-piece` | `btn btn-tall btn-accent` | NIP-07 present |
| 2 | `Use {app.name}` | the app's own `<img>` | `btn btn-tall` | **native only** (`Capacitor.isNativePlatform()`) |
| 3 | `Use Remote Signer` | `fa fa-box` | `btn btn-tall` | always |
| 4 | `Browse Signer Apps` | `fa fa-compass` | `btn btn-tall btn-low` | always, external |

Footer: `Need an account?` + underlined **Register instead**.

> **There is NO secret-key field.** No nsec paste, no "generate a key here", no email, no NIP-05 login.
> `loginWithNip01` is called from exactly one place in the whole app — `src/main.js:39`, inside the
> nstart return handler — never from UI. **The most key-safe login screen of any client reproduced in
> this repo, and reproducing it faithfully means shipping no key input at all.**

The recording's three stacked buttons are rows 1, 3 and 4 (web build, extension detected).

### 9.2 Remote signer (`LoginBunker.svelte`, `/login/bunker`)

Heading **"Login with Signer"**, body "To log in using a remote signer, scan the QR code below or enter a
connection link." + underlined **What's a signer?**, a QR canvas (`rounded-xl`), an Input placeholder
`bunker://...` with `fa fa-box`, then `Back` (`fa fa-arrow-left`) and accent `Continue`. Confirmed in the
recording as a large QR over a white input.

### 9.3 After login (`state.ts:110-113`)

`boot()` opens `/login/connect` as a **non-dismissible `mini` modal** floating at `mt-[45vh]`:
"We're searching for your profile on the network.", an underlined "click here" for manual relays, and
"You can also skip this step, but be aware that your profile and relays may not get properly
synchronized." After 8s: "We're having a hard time finding your profile." + **Try again** /
**Select relays manually**. On success: "Success! Logging you in..." held ~2.5s, then `/notes`.

### 9.4 Signup (`Onboarding.svelte`, `/signup`) — 4 steps, and Coracle generates no keys

Step badge is `h-12 w-12 rounded-full bg-neutral-700` showing `1/4`…`4/4`; titles are `text-2xl font-bold`
(Lato). The dot indicator is `h-2 w-2 rounded-full`, active `bg-neutral-300`, inactive `bg-neutral-500` —
**not accent**.

1. **New to Nostr?** — two `aspect-[4/3] rounded-xl` video tiles with `staatliches text-5xl` labels
   **"Nostr in 30 seconds"** and **"Coracle deep dive"** (the second is `sm:` only), then accent
   **"Let's go!"**. ⚠ Both tiles have an unterminated `url('…` in their inline style (`:41`, `:50`) — a
   real bug.
2. **Create your Profile** — "To get you started, we'll redirect you to an app called **nstart**, which
   will guide you through the process of creating and securely storing your account keys." Continue is an
   **external same-tab navigation** to `https://start.njump.me/?an=Coracle&ac=…&at=web&aa=FC560E&asf=yes`
   — note `aa` passes the accent hex so nstart themes itself to match.
3. **Find your people** — a category grid of remote kind-30000 lists, status row "Following {n} people •
   {n} relays" + **View selections**.
4. **You're all set!** — "If you have any questions, just use the #asknostr hashtag — people are always
   happy to lend a hand." / "Now is a great time to introduce yourself to the Nostr network!", a composer
   prefilled **"Hello world! #introductions"**, accent **Say Hello** (which mines 20 bits of PoW first),
   and **Skip and see your feed**.

> **[REC vs REPO] — the Polish screens in the recording are not Coracle.** Frames ~26–50 show
> "ZAPREZENTUJ SIEBIE", "TWOJE KLUCZE SĄ GOTOWE", "KOPIA ZAPASOWA", "LOGOWANIE Z BUNKREM" and
> "JESTEŚ GOTOWY DO STARTU!" on a light background. That is **nstart** (`start.njump.me`), a separate
> project, localised to the browser's Polish locale — reached by step 2's redirect and confirmed by the
> orange `|NOSTR` marketing page in the same run. Reproducing it would be reproducing someone else's app,
> so the sim stops at Coracle's own step 2 and states the handoff, exactly as the client's own copy does.

---

## 10. Relays (`RelayList.svelte`, `/settings/relays`)

Two sections, both `h2.staatliches.text-2xl`:

- **Your relays** with `fa fa-server fa-lg`, and a top-right `btn btn-accent` **Add Relay** whose icon is
  `fa-solid fa-compass` — **not a plus**. Blurb: "Relays are hubs for your content and connections. At
  least one is required to interact with the network, but you can join as many as you like." Empty state:
  `fa fa-triangle-exclamation` + "No relays connected".
- **Other relays** with `fa fa-circle-nodes fa-lg` (a different icon from section 1, deliberately).
  Blurb: "Below are relays used by people in your network. Adding these may improve your ability to load
  profiles and content." Then **Search** / **Reviews** tabs and an Input placeholder
  **"Search relays or add a custom url"** with a leading `fa-solid fa-search`.

**RelayCard** (`RelayCard.svelte:63-136`): `AltColor rounded-md p-6 shadow`. A `h-9 w-9 rounded-full border`
icon (the relay's own, or a fallback `fa fa-server`), the URL with `wss://` stripped, then a
`text-xs text-neutral-400` meta row: **"{n} NIPs"** and **"Connected {n} time(s)"** (comma-formatted,
pluralised). A star rating row appears **only in the Other-relays section** (`!showStatus`).

**Actions** (`RelayCardActions.svelte:23-49`) — raw buttons, all-caps via the `uppercase` utility rather
than Staatliches, `rounded-md px-6 py-1 text-sm font-bold`:

| Button | Fill | Note |
|---|---|---|
| `Info` | `bg-tinted-100-l` / `text-tinted-700-d` (near-white) | toggles the detail drawer |
| `Explore` | same near-white | opens `/relays/:url` |
| `Join` | **`bg-accent` white text** | shown when not joined |
| `Leave` | `bg-tinted-700-d` (dark) | **only when you have more than one relay** — you cannot leave your last |

**Read / Write / Messaging chips** (`showControls && $signer`, `:141-189`): `fa fa-book-open` Read,
`fa fa-feather` Write, `fa fa-inbox` Messaging. **The off state is expressed ONLY as `opacity-50`** —
there is no colour or fill change. Above them a `-mx-6 my-1 h-px bg-tinted-700` divider.

**Status dot** (`RelayStatus.svelte:22-33`): `h-2 w-2 rounded-full` — `neutral-600` not connected,
`success` connected, `warning` logging/reconnecting/unstable, `danger` failed.

⚠ Real bug: `RelayCard.svelte:125` names the slot `"description text-sm"`, which never matches the
`slot="description"` passed by `RelayList.svelte:202` — so the search results' "Used by …" line does not
render in the desktop drawer, only in the mobile modal.

---

## 11. Profile (`PersonDetail.svelte`, usually a modal)

**There is NO banner** — `grep -rni banner src/` returns zero hits, and the profile editor has no banner
field. Header is `AltColor relative flex flex-col gap-8 p-6 sm:flex-row sm:gap-4`:

- `PersonCircle mt-1 h-32 w-32` — **128px**, left on `sm:`, stacked on mobile.
- Name row `flex max-w-[80%] items-center gap-2 text-xl` + the WoT dial.
- `mt-4 break-all opacity-75` **full npub** followed by `CopyValueSimple`, which renders **two** icons:
  `fa-solid fa-copy` and `fa-solid fa-qrcode`. Confirmed in the recording.
- Metadata rows, each `w-4 text-accent` icon + text: `fa fa-at` NIP-05 · `fa fa-bolt` lightning address
  (**this row IS the zap button — there is no separate zap control**) · `fa fa-link` website.
- About via `PersonAbout`, `font-thin opacity-75`, shown in full.
- `⋮` overflow absolutely positioned `right-4 top-4`.

**There is no follower/following stats row.** `PersonStats.svelte` exists and is **dead code** — zero
importers. The counts live only as badges inside the tab row.

Tabs, in order: **Notes · Likes · Collections · Relays · Following · Followers** — matching the recording
exactly.

---

## 12. Notifications (`/notifications`)

Tabs verbatim: `["Mentions & Replies", "Reactions"]`, default the first. The **non-active** tab carries an
unread pill `h-6 rounded-full bg-neutral-700 px-2`. Rows group under date separators
(`small` + `h-px w-full bg-neutral-600`); Mentions buckets by 3 hours, Reactions by 1 day.

Empty state, identical in both sections and matching the recording character for character:

```
No notifications found - check back later!
```

(ASCII hyphen with spaces, not an en dash.) Row phrasings: "mentioned you", "responded to your poll",
"replied to your note", "replied to a note mentioning you".

---

## 13. Messages (`/channels`)

Header: `fa fa-comments fa-lg` + `h2.staatliches.text-2xl` **Your conversations** → renders YOUR
CONVERSATIONS, and a `btn btn-accent` **+ Create**. Tabs `Conversations` / `Requests`, each with an
**always-visible** count pill. To the right of the strip, an `fa fa-bell` with the tooltip "Mark all as
read". Empty state, one string for both tabs: **"No messages found."** (with the period).

**Start a conversation** (`/channels/create`, modal): `h2.staatliches.text-center.text-6xl`
**Start a conversation**. Chat placeholder is `"Say hello..."`. NIP-17 misconfiguration copy: "In order to
deliver messages, Coracle needs to know where to send them. Please visit your settings page and set up
your messaging relays." — visible in the recording.

---

## 14. Groups — a deprecation notice, and nothing else

`GroupList.svelte` is **15 lines total**. The entire route is:

- `p.text-2xl.font-bold` **"Groups are going away!"** — Lato bold, sentence case, **not** uppercase.
- Body naming two hosts in `<strong>`: `groups.coracle.social` and `flotilla.social`.
- Right-aligned buttons: white `.btn` **Continue to Groups** → `https://groups.coracle.social`, and
  `.btn.btn-accent` **Try Flotilla** → `https://flotilla.social`.

Anyone reproducing "Coracle groups" from an older screenshot would be reproducing a surface the client has
already retired. Ship the notice.

---

## 15. Lists (`/lists`)

**Your lists** — `fa fa-list fa-lg text-accent` + `h2.staatliches.text-2xl`, with a `btn btn-accent`
**+ List**. Empty state is a Card: `fa fa-list fa-2x`, "You don't have any lists yet.", and a
**`btn btn-low`** (muted, *not* accent) **+ Create a list**. Then **Other lists** under
`fa fa-circle-nodes fa-lg text-accent`.

## 16. Invite (`/invite/create`)

`Heading` **Create an Invite** (60px, centred) over "Invite links allow you to help your friends onboard
to nostr more easily, or get easy access to relays." Then a **People** card (`Subheading`, dismiss
`fa fa-times` top-right, "Suggest people to follow - this is especially useful for new users.") and a
**Relays** card. Below, two **bare text buttons** (no `.btn` class, so plain Lato):
`+ Add people` / `+ Add relays`, right-aligned. Submit is `btn btn-accent` **Create Invite Link**,
disabled until at least one person or relay is added; it opens the **QR modal**.

## 17. Settings

Five routes, each with a `Heading` (60px Staatliches) and a one-line subtitle, all confirmed in the
recording:

| Route | Heading | Subtitle |
|---|---|---|
| `/settings` | **App Settings** | Make Coracle work the way you want it to. |
| `/settings/content` | **Content Settings** | Control who and what you see on Coracle. |
| `/settings/data` | **App Database** | View, import, and export your local database. |
| `/settings/keys` | **Your Keys** | — |
| `/settings/wallet` | **Your Wallet** | — |

**There is no theme picker in Settings** — the toggle is a menu item only.

*App Settings* fields, in order: `Default zap amount` (default **21**) · `Platform zap split` (range
0–0.5, default 0) · `Send Delay` (range 0–15000ms) · `Proof Of Work` (range 0–32 with a work estimate) ·
`Max relays per request` (range 1–10, default 3) · `Authenticate with relays` (toggle, on) ·
`Blossom Provider URLs` · `Dufflepud URL` · `Imgproxy URL` · `Report errors and analytics` (toggle, on) ·
`Enable client fingerprinting` (toggle, **off**). Save is a sticky footer `btn flex-grow`.

*Content Settings*: `Note actions` (multi-select over zaps/replies/reactions/reposts/recommended_apps) ·
`Show images and link previews` · `Hide sensitive content` · `Minimum WoT score` (range −10…10) ·
`Minimum Proof of Work` · a bare `Mutes` divider · four public/private mute selectors for accounts, words
and topics. The recording's CONTENT SETTINGS frame shows exactly this, including the accent-filled
note-action chips.

*App Database*: two centred cards — **Export Database** / **Create Backup**, **Import Database** /
**Upload Backup** — over a table with headers **Created · Author · Kind**, each row led by a
`fa fa-link text-accent`.

---

## 18. Sandstr deviations (deliberate, and where they are)

Recorded here rather than hidden, because the readiness axis is the product's honesty.

1. **Column widths are scaled to the host card.** Sandstr gives a frameless client a `max-w-5xl` card —
   measured at **1022px at a 1440px viewport and 918px at 1024px**. Upstream's three columns need
   288 + 672 + 320 = 1280. The sidebar is **240px** here and the rail **248px**
   (`coracle.theme.css`, `--co-sidebar-w` / `--co-rail-w`), leaving the feed ~534px: that puts the feed
   at 52 % of the width against upstream's 47 %, with the sidebar and rail a few points fatter.
   Proportions and the degradation order survive; the absolute pixels cannot. The rail appears above a
   **1000px container**, chosen so the two verified viewports match upstream's own behaviour — a 1440px
   window shows the rail as the 1434px recording does, and a 1024px window folds it into a card above
   the feed as upstream folds below `xl`. Same precedent as Snort's scaled breakpoints.
2. **Fonts.** Lato and Staatliches are not bundled; both fall back, and `.co-staatliches` adds
   `text-transform: uppercase` to preserve the all-caps look the real face produces. See §2.
3. **Icons** are re-drawn, not Font Awesome. See §3.
4. **Avatars** are the client's own `PlaceholderCircle` — the hue-from-pubkey gradient bust it renders for
   anyone without a picture (`PlaceholderCircle.svelte:7-16`, `stringToHue` at `misc.ts:84-95`). Mock
   users have no pictures, so this is the real code path, not a substitute. Zero network requests.
5. **The wordmark image is not reproduced.** `/images/wordmark-dark.png` is Jon Staab's artwork. The sim
   sets "CORACLE" in the display face beside the host's neutral `ClientGlyph`, the same call made for
   Snort's nostrich.
6. **nstart is not reproduced** — see the [REC vs REPO] box in §9.4.
7. **Timestamps** render as `D.MM.YYYY, HH:mm` to match the recording. That format is the *Polish* locale
   rendering of `formatTimestamp`; an en-US visitor to the real app sees `M/D/YYYY, h:mm AM`. Following
   the recording here is a judgement call, flagged.
8. **Mobile (< 1024px) chrome is not reproduced.** The host gates Coracle behind `DesktopClientGate` under
   640px, and the 640–768px band is separately tracked.

---

## 19. Side-by-side verification log (2026-08-05)

Method: `preview_start` → `/c/coracle`, then a click-through of every surface at **1440×900**, plus
re-checks at **1024×768** and **390×844**. Result on every pass: **0 console errors, 0 external
network requests** (`performance.getEntriesByType('resource')` filtered to non-origin returned `[]`),
0 nested `button` elements, feed capped at 25 notes, and the host's SIMULATION banner present.

**Reference basis.** Full-resolution frames read individually: `p_027` (nstart), `p_030` (signup 2/4),
`p_072` and `p_101` (feed), `p_087` (note detail), `p_104` (relays), `p_126` (compose), `p_186`
(profile). Every other surface was checked against the ten 5×5 contact sheets covering all 230
periodic frames — enough to confirm layout and copy, not fine spacing. Where a verdict rests only on
a contact sheet it says so.

| # | Surface | Basis | Verdict |
|---|---|---|---|
| 1 | Shell: sidebar, top bar, publish HUD, account row | `p_101` | ✅ warm sidebar over cold page, darker top bar, text-only nav, active item grows + accent underline, three HUD counters |
| 2 | Feeds: controls row, cards, right rail | `p_101`, `p_072` | ✅ REPLIES accent / CUSTOMIZE muted, alternating cards, 7 filter chips, three Edit-… chips |
| 3 | Note card: header, WoT dial, actions, meta chips | `p_101` | ✅ 40px avatar, accent NIP-05, stroked icons in reply→zap→like→repost order, "N RELAYS" + PoW chips, ⋮ |
| 4 | Note detail modal | `p_087` | ✅ after fixes — panel widened to full width, relay rows given their INFO/EXPLORE/LEAVE buttons |
| 5 | Compose modal | `p_126` | ✅ Lato-bold heading, white editor, meta row, SEND + upload square |
| 6 | Login "Welcome!" | contact sheet `sheet_p0` | ✅ 60px heading, three stacked buttons, "Register instead"; **no key field** |
| 7 | Signup 1/4–4/4 | `p_030`, `sheet_p0` | ✅ round step badge, Lato-bold titles, BACK + CONTINUE, 4 neutral dots |
| 8 | Relays: two sections, tabs, cards | `p_104` | ✅ white INFO/EXPLORE, accent JOIN, "N NIPs / Connected N time", read-write-messaging chips |
| 9 | Profile | `p_186` | ✅ 128px avatar, no banner, no stats row, EDIT as a white `.btn`, six tabs with count badges |
| 10 | Notifications | `sheet_p4`, `sheet_p5` | ✅ two tabs, pill on the inactive tab, verbatim "No notifications found - check back later!" |
| 11 | Messages + Start a conversation | `sheet_p6` | ✅ YOUR CONVERSATIONS + CREATE, count pills, "No messages found." |
| 12 | Groups deprecation | `sheet_p7` | ✅ sentence-case bold headline, two buttons, both hosts named |
| 13 | Lists | `sheet_p7` | ✅ accent list icon, + LIST, muted CREATE A LIST empty state |
| 14 | Settings: App / Content / Database / Keys | `sheet_p8`, `sheet_p9` | ✅ headings + subtitles, ranges with readouts, toggles, accent note-action chips, two DB cards + table |
| 15 | Invite | `sheet_p7`, `sheet_p8` | ✅ 60px CREATE AN INVITE, People card, bare `+ Add people` / `+ Add relays` |

**Defects this pass found and fixed** (each was a real mismatch, not a polish item):

1. The unread dot was anchored to the full-width nav button, so it rendered **outside the sidebar**,
   floating in the page. Upstream anchors it to the label (`-right-2.5`).
2. The account/settings submenu **pushed** the sidebar footer down instead of overlaying it, clipping
   the account row out of the card. Upstream is `absolute` at `bottom: 4.5rem`.
3. The modal panel was capped at `max-w-2xl`, leaving scrim showing down both sides. Upstream's panel
   is `w-full bg-neutral-800`; only its *content* is capped (`Modal.svelte:154-156`).
4. Own-profile opened as a modal. Frame `p_186` shows it with no scrim and no active nav item — it is
   the page route. Feed avatars still open the modal.
5. `.co-column` lacked `min-width: 0`, so at a 1024px viewport the flex row overflowed and
   `overflow: hidden` silently **clipped the right rail**.
6. The note action row could not wrap, pushing the meta chips off the card in a narrow column.
7. The feed search input was `flex: 1`, stretching to the column edge; upstream sizes it inside the
   right-aligned group.
8. Relay policy chips and two section headers used the wrong stand-in glyphs (star/edit/message rather
   than book-open/feather/inbox, globe rather than compass, star rather than bell).

**Follow-up landed 2026-08-05** (separate commit): kind-1 content was rendering fenced code as raw
``` markers, because the segmenter only handled hashtags. It now mirrors upstream's parser order and
regexes, including both quirks in §7.3.1. Verified against six cases (underscore topic, numeric topic,
inline backticks, fence-beats-inline, topic-before-code, plain text) plus the rendered block's
computed background in each theme: `#171717` dark, `#D4D4D4` light.

**Known gaps, stated rather than papered over:**

- The rail's "From People you Follow" heading wraps to two lines at the scaled 248px width; upstream's
  320px rail holds it on one.
- Verdicts 10–15 rest on contact sheets, so they confirm structure and copy but not exact spacing.
- Mobile chrome (< 1024px) is not reproduced — see §18.8.
