# Primal Web — screen map (reference-verified, source: PrimalHQ/primal-web-app@main)

Primal's web app is a **3-column desktop layout**: a full-height **left nav** column (logo → NavMenu → user chip), a **center feed** column, and a **right sidebar** (search + contextual widgets). It ships **two live themes only**: light **"Ice"** and dark **"Midnight"** (default), both **blue-accented** with the default accent **BLUE `#2394EF`**. Cards are borderless-on-black, separated by hairline dividers; the signature brand element is the circular cyan→blue swirl "primal" wordmark and a cyan→purple gradient (`#14B9FF → #690DFF`). The legacy magenta "Sunset/Sunrise" themes remain in source but are commented out and no longer user-selectable. Stack: SolidJS + Kobalte, self-hosted **Nacelle** UI type.

---

## Palette / tokens

Primal ships **only two live themes today: Midnight (dark, DEFAULT) and Ice (light)** — both blue-accented (`#2394EF`). The legacy pink/magenta "sunset/sunrise" palettes are still in `src/palette.scss` but **commented out**, and the mixins `sunset_wave` / `sunrise_wave` are re-aliased to the blue themes:

```scss
@mixin sunrise_wave { @include ice_wave(); }
@mixin sunset_wave  { @include midnight_wave(); }
```

So in `src/index.scss` the "Default theme" fallback selectors call `@include sunset_wave()` — which now resolves to **Midnight (blue)**, not the old magenta:
```scss
:root[data-theme="dark"], :root[data-theme="sunset"],
:root:not([data-theme="dark"]) …:not([data-theme="ice"]) { @include sunset_wave(); }  /* → Midnight/blue */
:root[data-theme="light"], :root[data-theme="sunrise"] { @include sunrise_wave(); }  /* → Ice/blue */
:root[data-theme="midnight"] { @include midnight_wave(); }
:root[data-theme="ice"]      { @include ice_wave(); }
@media (prefers-color-scheme: dark) { :root { @include sunset_wave(); } }
```
`src/constants.ts` `themes` array only exposes two selectable themes: **`midnight` ("midnight wave", `dark: true`)** and **`ice` ("ice wave")**. Both use logo `logo_blue.svg`.

**DEFAULT = Midnight (dark, OLED black `#000000`, blue accent).** Reproduce Midnight as the out-of-the-box look. Ship the legacy Sunset magenta only as an optional/period-accurate variant if desired (NOT the current default, NOT user-selectable). Property names are misspelled in source as `--devider` / `--subtile-devider` — keep the spelling if referencing the variables, or use the hex directly.

### Theme: MIDNIGHT (default dark) — `@mixin midnight_wave`

| Token | Value | Role |
|---|---|---|
| `--accent` | `#2394EF` | brand blue (primary accent) |
| `--accent-links` | `#2394EF` | links |
| `--accent-dm` | `#0C7DD8` | DM accent (deeper blue) |
| `--accent-pro` | `#E47C00` | Primal Pro / orange (premium) |
| `--brand-gradient` | `linear-gradient(128deg, #14B9FF 0%, #690DFF 100%)` | signature gradient (cyan→purple) |
| `--brand-text` | `#D5D5D5` | brand wordmark text; also card summary text |
| `--background-site` | `#000000` | page bg (OLED black) |
| `--background-card` | `#000000` | card/panel bg (OLED black) |
| `--background-input` | `#222222` | input bg |
| `--background-sheet` | `#121212` | sheet/modal surface |
| `--background-header-input` | `#1a1a1a` | header search input bg |
| `--background-modal` | `#00000070` | modal scrim (black @ ~44%) |
| `--devider` | `#222222` | divider/border (sic: "devider") |
| `--subtile-devider` | `#444444` | subtle divider |
| `--text-primary` | `#ffffff` | primary text |
| `--text-primary-button` | `#ffffff` | text on primary button |
| `--text-secondary` | `#aaaaaa` | secondary text |
| `--text-secondary-2` | `#aaaaaa` | secondary text (variant) |
| `--text-tertiary` | `#757575` | tertiary text |
| `--text-tertiary-2` | `#666666` | tertiary text (variant) |
| `--text-highlight` | `#FFFFFF` | highlighted text |
| `--highlight` | `#2E3726` | highlight bg (muted green) |
| `--highlight-selected` | `#516440` | selected highlight bg (green) |
| `--success-bright` | `#66E205` | success (bright green) |
| `--success-dim` | `#487E1F` | success (dim green) |
| `--warning-bright` | `#FA3C3C` | warning/error (red) |
| `--warning-bright-shadow` | `#e2050588` | warning glow (red @ ~53%) |
| `--warning-dim` | `#480101` | warning dim (dark red) |
| `--active-reply` | `#cccccc` | reply icon active (grey) |
| `--active-zap` | `#ffa02f` | **zap amber** |
| `--active-liked` | `#f800c1` | **like/liked (magenta-pink)** |
| `--active-reposted` | `#66e205` | **repost (green)** |
| `--active-bookmarked` | `#0C7DD8` | **bookmark (blue)** |
| `--profile-indicator-border` | `var(--background-site)` → `#000000` | avatar ring border |

Logo assets: `--logo: logo_blue.svg`, `--logo-big: logo_blue_big.svg`. Reads placeholder: `reads_image_dark.png`. Note: `midnight_wave` has **no `--warning-bright-two`** token (the legacy sunset had `--warning-bright-two: #e20505`).

Killer detail: even though the whole UI accent is blue in Midnight, the **like ("liked") action stays magenta-pink `#f800c1`** — it did NOT get recolored to blue.

### Theme: ICE (light) — `@mixin ice_wave`

Same blue accent + same gradient as Midnight; light surfaces.

| Token | Value | Role |
|---|---|---|
| `--accent` | `#2394EF` | brand blue |
| `--accent-links` | `#2394EF` | links |
| `--accent-dm` | `#0C7DD8` | DM accent |
| `--accent-pro` | `#E47C00` | Pro / orange |
| `--brand-gradient` | `linear-gradient(128deg, #14B9FF 0%, #690DFF 100%)` | same signature gradient |
| `--brand-text` | `#444444` | brand wordmark text; also card summary text |
| `--background-site` | `#ffffff` | page bg (white) |
| `--background-card` | `#ffffff` | card/panel bg |
| `--background-input` | `#e5e5e5` | input bg |
| `--background-sheet` | `#f5f5f5` | sheet surface |
| `--background-header-input` | `#eeeeee` | header input bg |
| `--background-modal` | `#f5f5f570` | modal scrim (light @ ~44%) |
| `--devider` | `#e5e5e5` | divider |
| `--subtile-devider` | `#c8c8c8` | subtle divider |
| `--text-primary` | `#111111` | primary text |
| `--text-primary-button` | `#ffffff` | text on primary button |
| `--text-secondary` | `#666666` | secondary text |
| `--text-secondary-2` | `#666666` | secondary text (variant) |
| `--text-tertiary` | `#808080` | tertiary text |
| `--text-tertiary-2` | `#808080` | tertiary text (variant) |
| `--text-highlight` | `#111111` | highlighted text |
| `--highlight` | `#E8F3E8` | highlight bg (pale green) |
| `--highlight-selected` | `#A3D0A2` | selected highlight (green) |
| `--success-bright` | `#52CE0A` | success (bright green — lighter than Midnight's) |
| `--success-dim` | `#569724` | success (dim green) |
| `--warning-bright` | `#FA3C3C` | warning/error (red) |
| `--warning-bright-shadow` | `#C4000088` | warning glow (dark red @ ~53%) |
| `--warning-dim` | `#FAC3C3` | warning dim (pale red) |
| `--active-reply` | `#444444` | reply active (dark grey) |
| `--active-zap` | `#ffa02f` | **zap amber** (same as Midnight) |
| `--active-liked` | `#CA079F` | **like/liked (magenta)** — DEEPER than Midnight's `#f800c1` |
| `--active-reposted` | `#52CE0A` | **repost (green)** — lighter than Midnight's `#66e205` |
| `--active-bookmarked` | `#0C7DD8` | **bookmark (blue)** (same) |
| `--profile-indicator-border` | `var(--accent)` → `#2394EF` | avatar ring (blue in Ice, black in Midnight) |

Logo assets: `--logo: logo_blue.svg`, `--logo-big: logo_blue_big_dark.svg`. Reads placeholder: `reads_image_light.png`.

### Legacy SUNSET (magenta dark) — COMMENTED OUT / not shipped

Entire `@mixin sunset_wave { … }` block is commented out (live `sunset_wave` aliases `midnight_wave`). For reference / optional retro variant:

| Token | Value |
|---|---|
| `--accent` | `#ca077c` (magenta) |
| `--accent-links` | `#f800c1` |
| `--accent-dm` | `#ca077c` |
| `--accent-pro` | `#E47C00` |
| `--brand-gradient` | `linear-gradient(141deg, #EF404A 6.36%, #5B12A4 97.61%)` (red→purple, **141deg** not 128deg) |
| `--background-site` / `--background-card` | `#000000` |
| `--background-input` | `#222222`; `--background-sheet` `#121212`; `--background-header-input` `#1a1a1a` |
| `--devider` `#222222`; `--subtile-devider` `#444444` |
| `--text-primary` `#ffffff`; `--text-secondary` `#aaaaaa`; `--text-tertiary` `#757575`; `--text-tertiary-2` `#666666` |
| `--active-zap` `#ffa02f`; `--active-liked` `#f800c1`; `--active-reposted` `#66e205`; `--active-bookmarked` `#0C7DD8`; `--active-reply` `#cccccc` |
| `--success-bright` `#66E205`; `--success-dim` `#487E1F` |
| `--warning-bright` `#FA3C3C`; `--warning-bright-two` `#e20505` (extra token only in sunset); `--warning-bright-shadow` `#e2050588`; `--warning-dim` `#480101` |
| logo | `logo_fire.svg` / `logo_fire_big.svg` |

### Legacy SUNRISE (magenta light) — COMMENTED OUT / not shipped

`@mixin sunrise_wave { … }` legacy block commented out (live `sunrise_wave` aliases `ice_wave`). Reference values: `--accent: #ca077c`, `--accent-links: #CA077C`, `--accent-dm: #CA077C`, `--brand-gradient: linear-gradient(141deg, #EF404A 6.36%, #5B12A4 97.61%)`, `--background-site: #ffffff`, `--background-input: #e5e5e5`, `--text-primary: #111111`, `--active-liked: #CA079F`, `--active-reposted: #52CE0A`, `--active-bookmarked: #0C7DD8`, `--success-bright: #52CE0A`, logo `logo_fire.svg`.

### Action-bar colors are per-STATE, not per-accent (reproduce exactly)

reply grey `#cccccc` (Midnight) / `#444444` (Ice) · zap amber `#ffa02f` (both) · like magenta `#f800c1` (Midnight) / `#CA079F` (Ice) · repost green `#66e205` (Midnight) / `#52CE0A` (Ice) · bookmark blue `#0C7DD8` (both). Idle icon color = `--text-tertiary-2` (`#666666` dark), hover → `--text-primary`.

Source: `src/palette.scss` (all tokens), `src/index.scss` (theme wiring), `src/constants.ts` (theme list).

---

## Typography

Primal's UI is built on **Nacelle** (self-hosted OpenType), with **Roboto Black** reserved for the "primal" logo wordmark and **Roboto Condensed** for special cases (nav bubbles). All fonts are self-hosted (bundled, not Google Fonts), declared via `@font-face` in `public/public/fonts.css`.

### Nacelle — the entire UI (weights 100–900, each normal + italic, `.otf` from `/public/Nacelle/…`)

| Weight | File (normal) | File (italic) |
|---|---|---|
| 100 Thin | `Nacelle-Thin.otf` | `Nacelle-ThinItalic.otf` |
| 200 UltraLight | `Nacelle-UltraLight.otf` | `Nacelle-UltraLightItalic.otf` |
| 300 Light | `Nacelle-Light.otf` | `Nacelle-LightItalic.otf` |
| 400 Regular | `Nacelle-Regular.otf` | `Nacelle-Italic.otf` |
| 600 SemiBold | `Nacelle-SemiBold.otf` | `Nacelle-SemiBoldItalic.otf` |
| 700 Bold | `Nacelle-Bold.otf` | `Nacelle-BoldItalic.otf` |
| 800 Heavy | `Nacelle-Heavy.otf` | `Nacelle-HeavyItalic.otf` |
| 900 Black | `Nacelle-Black.otf` | `Nacelle-BlackItalic.otf` |

**There is no weight 500 face** — the family jumps 400 → 600. Do not use `font-weight:500` on Nacelle. `format('opentype')` on all faces.

- **Roboto Black** — logo wordmark only: `font-family:'Roboto Black'; font-weight:700; font-style:normal;` from `url(/public/roboto_3.woff2) format('woff2')`.
- **Roboto Condensed** — `font-family:'Roboto Condensed'; font-weight:500;` from `url(/public/RobotoCondensed/RobotoCondensed-Medium.ttf)`. Used for nav-badge numbers.

### Global body default (`src/index.scss`)
```css
body {
  margin: 0;
  font-family: 'Nacelle', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-y: scroll;
  background-color: var(--background-site);
}
```
No explicit `html {}` rule and **no `font-size` set on body/html** — base falls through to the Pico CSS framework default (`@picocss/pico`, imported at top of `index.scss`), i.e. `16px`. Typography is not tokenized (no `--font-*` vars); sizes/weights are set per-component. For reproduction, use `Nacelle, sans-serif`, base `16px`, antialiased.

### Weights & sizes in the note card (`src/components/Note/Note.module.scss`)

| Element | Class | font-size | font-weight | line-height |
|---|---|---|---|---|
| Author display name | `.userName` | 16px | **700** | 20px |
| Handle / NIP-05 verification | `.verification` | 16px | 400 | 18px |
| Timestamp | `.time` | 16px | 400 | 18px |
| Note body (feed) | `.message` | 16px | 400 | 20px |
| Note body large variant | `.message.bigFont` | 24px | 400 | 32px |
| Primary/thread note body | `.notePrimary .content .message` | 18px | 400 | 24px |
| Primary note large variant | `.notePrimary … .message.bigFont` | 24px | 400 | 32px |
| "Replying to" reference | `.replyingTo` | 15px | 400 | 20px |
| "Reposted by" indicator | `.repostedBy span` | 14px | 400 | 14px |

Killer detail: `.verification` and `.time` are colored `var(--text-tertiary)` (muted grey) — same 16px/400 as body but greyed; the **name is the only bold (700) element** in the note header.

### Nav labels & logo wordmark
- Side-nav link labels (`.sideNav`, `.liveNav`) set **no font-size/weight** of their own → inherit Nacelle 400 at Pico base (~16px/17px). Reproduce nav links as Nacelle 400, **not bold**. The only explicit nav font decl is `.callToAction .message { font-size:15px; font-weight:400; }`.
- Logo wordmark (`src/components/Branding/Branding.module.scss`): `font-family:"Roboto Black"; font-weight:700; font-size:30px; line-height:30px;`, lowercase — the one place Roboto (not Nacelle) is used in chrome.

Fallback: if Nacelle is unavailable, closest is a geometric-humanist sans; `sans-serif` is the only declared fallback in source.

---

## Logo / Wordmark

The Primal sidebar mark is the **circular blue swirl (a spiral "P" / stylized ostrich-neck loop) + lowercase "primal" wordmark**. In the real app both are baked into a **single SVG asset** (`logo_blue_big.svg`) painted as a CSS `background-image` — not composited from separate icon + live text at runtime.

### Rendering structure — `src/components/Branding/Branding.tsx`
Renders a `<button class={logoLink}>` (whole logo is a home-link; on Home it smooth-scrolls to top, else `navigate('/home')`):
- Full/wide state: `<div class={branding}><div class={logoBig} /></div>`
- `small` prop (collapsed): `<div class={brandingSmall}><div class={logo} /></div>`

`Branding.module.scss`:
- `.logoBig { background-image: var(--logo-big); background-size: contain; margin-right: 10px; width: 124px; height: 36px; }`
- `.logo { background-image: var(--logo); background-size: contain; width: 35px; height: 35px; }` (36×36 in small variant)
- Below `max-width: 1300px` the wide logo collapses to the swirl-only 32×32 icon (`var(--logo)`) and the text is hidden.

Killer detail: the CSS has a `.branding span { font-family:"Roboto Black"; font-weight:700; font-size:30px; line-height:30px; color:var(--brand-text); text-transform:lowercase; }` rule, **but the current `Branding.tsx` renders NO `<span>`** — the wordmark you see is vector text inside the SVG asset, not live HTML text. That `span` styling is the design intent if you reproduce the wordmark as text; `--brand-text` = `#D5D5D5` (dark) / `#444444` (light).

### CSS-variable → asset mapping (`src/palette.scss`)
- Dark (`midnight_wave`): `--logo: url('./assets/icons/logo_blue.svg')`, `--logo-big: url('./assets/icons/logo_blue_big.svg')`.
- Light (`ice_wave`/`sunrise_wave`): `--logo: logo_blue.svg`, `--logo-big: logo_blue_big_dark.svg` (identical swirl gradient; wordmark text fill changes to `#333333`).
- Commented-out `logo_fire*` variants exist for a fire/orange theme but are disabled.

### The swirl mark — geometry & gradient (re-draw as inline SVG)
Standalone icon `src/assets/icons/logo_blue.svg`, `viewBox="0 0 256 256"`, single path filled with a linear gradient. The wide asset's swirl (`logo_blue_big.svg`, `viewBox 0 0 124 36`) is the same shape scaled to ~35px with the same 3-stop gradient.

- Gradient (verbatim, identical in both assets): `linearGradient`, `gradientUnits="userSpaceOnUse"`, TL→BR diagonal:
  - stop `0` → `#00E0FF` (cyan)
  - stop `0.481323` → `#0090F8` (azure/blue)
  - stop `1` → `#2554ED` (indigo)
- Swirl geometry — see `src/assets/icons/logo_blue.svg` upstream; the path data is theirs and is not copied here.
  Geometry: an outer near-circular ring that spirals inward — a fat comma/"9"-like open loop terminating in an inner curved hook. Not a closed circle; the negative space forms the swirl.

### Combined wide wordmark (`logo_blue_big.svg`, the actual sidebar asset)
`viewBox="0 0 124 36"`, `fill="none"`. Contains: (1) the swirl path (x≈0–35.5) with the same 3-stop gradient (vector `x1=1.07 y1=0.50 x2=36.40 y2=35.87`); (2) seven vector-outlined glyph paths spelling **"primal"**, each `fill="#EEEEEE"` in the dark asset (`#333333` in `_big_dark`). Wordmark starts at x≈45.8, lowercase, heavy/black weight.

### Reproduction recipe
- Draw the swirl as inline `<svg viewBox="0 0 256 256">` with the single path + 3-stop gradient (`#00E0FF` / `#0090F8` @0.4813 / `#2554ED`), TL→BR. Size ~35px in the sidebar.
- Render "primal" as text: lowercase, weight 700 (Roboto Black / heavy geometric), ~30px, `color:#D5D5D5` dark / `#444444` light, ~10px gap. (Fidelity-equivalent to the baked SVG glyphs `#EEEEEE`/`#333333`.)
- Whole unit is a home link. Collapsed/narrow: swirl only at ~32px, hide the word.

Source: `src/components/Branding/Branding.tsx`, `Branding.module.scss`, `src/palette.scss`, `src/assets/icons/logo_blue.svg`, `logo_blue_big.svg`, `logo_blue_big_dark.svg`.

---

## Left Sidebar / Primary Nav

Desktop left sidebar is a full-height column (`styles.leftColumn`, `src/components/Layout/LayoutDesktop.tsx`) with three stacked regions:
1. `leftHeader` → `<Branding>` (logo/wordmark) at top
2. `leftContent` → `<NavMenu>` (primary nav + New Note CTA)
3. `leftFooter` → `<EventQueueWidget>` then `<ProfileWidget>` (bottom user chip)

### Nav items (exact, in order) — `src/components/NavMenu/NavMenu.tsx` `links` array

| # | Label | Route | Icon class | Default SVG | Selected SVG | Badge (bubble) |
|---|-------|-------|-----------|-------------|--------------|----------------|
| 1 | Home | `/home` | `homeIcon` | `nav/home.svg` | `home_selected.svg` | none |
| 2 | Reads | `/reads` | `readsIcon` | `nav/long.svg` | `long_selected.svg` | none |
| 3 | Explore | `/explore` | `exploreIcon` | `nav/explore.svg` | `nav/explore.svg` (no `_selected`; only recolors) | none |
| 4 | Messages | `/dms` | `messagesIcon` | `nav/messages.svg` | `messages_selected.svg` | `dms?.dmCount \|\| 0` |
| 5 | Bookmarks | `/bookmarks` | `bookmarkIcon` | `nav/bookmarks.svg` | `bookmarks_selected.svg` | none |
| 6 | Notifications | `/notifications` | `notificationsIcon` | `nav/notifications.svg` | `notifications_selected.svg` | `notifications?.notificationCount \|\| 0`; `hiddenOnSmallScreens` |
| 7 | Downloads | `/downloads` | `downloadIcon` | `nav/downloads.svg` | `downloads_selected.svg` | `notifications?.downloadsCount \|\| 0` |
| 8 | Premium | `/premium` | `premiumIcon` | `nav/premium.svg` | `nav/premium.svg` (no `_selected`; only recolors) | `accountStore.premiumReminder ? 1 : 0`; `hiddenOnSmallScreens` |
| 9 | Settings | `/settings` | `settingsIcon` | `nav/settings.svg` | `settings_selected.svg` | `accountStore.sec ? 1 : 0`; `hiddenOnSmallScreens` |

Labels come from `translations` via `intl.formatMessage` — rendered English strings are the capitalized names above. Killer notes:
- **Reads uses a `long.svg` icon** (internal name "long" = longform), selected `long_selected.svg`.
- **Explore and Premium have NO filled/`_selected` variant** — on active/hover they keep the outline glyph and only recolor; every other item swaps to a filled `_selected.svg`.
- Premium and Settings bubbles are "reminder dots" (value 1), not real counts; Messages/Notifications/Downloads are true counts.

### NavLink rendering & active style — `src/components/NavLink/NavLink.tsx` + `.module.scss`
Icons are **CSS-mask glyphs** (not `<img>`): `iconNav` mixin sets `20×20px`, `mask: <url> no-repeat 0/100%`, `background-color` = tint. `.navLink a { gap: 12px }`; label `font-size:17px; font-weight:400; line-height:20px`. `.navLink` width `152px`, `margin: 0 0 26px 0` (last child `36px`).
- **Inactive:** icon `background-color: var(--text-secondary)` (`#aaaaaa` dark / `#666666` light); label same.
- **Active (`a.active`) AND hover:** icon swaps to `_selected` mask and recolors to `var(--text-primary)` (`#ffffff` / `#111111`); label `var(--text-primary)`. **Active does NOT bold the label** — weight stays `400` (there's a commented-out `// font-weight: 600`).
- `scrollIfInactive` scrolls to top instead of navigating when already on the route.
- Below 1300px `.label` is hidden (icon-only rail); below 720px it becomes a bottom bar and `hiddenOnSmallScreens` items are `display:none`.

### Badge (bubble) style — `NavLink.module.scss` `.bubble`
`min-width:18px; height:18px; border-radius:9px; background:var(--accent); color:var(--text-primary-button)` (white); `border:1px solid var(--background-site)`; font `'Roboto Condensed' 500 12px/11px`; `margin-left:2px; margin-top:-8px` (top-right of icon). `.doubleSize` (10–99): `width:24px`. `.tripleSize` (≥100): `width:28px; padding-left:2px`. Display caps at `99+`. On the collapsed rail (≤1300px) it degrades to an 8×8 dot with the number hidden.

### "New Note" primary button — `NavMenu.tsx` + `Buttons.module.scss`
Rendered only when logged in and not on `/messages`, `/premium`, `/settings`.
- Big screen (>1300px): `<ButtonPrimary>` label **"New Note"** (`tActions.newNote`), `onClick={showNewNoteForm}`. `.callToAction` width `148px`, button `width:100%`.
- Small screen: icon-only — `postIcon` (18×18 mask of `assets/icons/post.svg`, tinted `var(--text-primary-button)`); `.callToAction` shrinks to a 36×36 round button.
- On `/reads`, `/e/naddr`, `/a/naddr` the CTA label changes to **"My Articles"** (still primary → `/myarticles`); on `/myarticles` or `/reads/edit` it becomes a **secondary** "My Articles".
- **Button style (`.primary`):** `border-radius:99999px` (full pill), `background:var(--accent)`, `color:var(--text-primary-button)` (`#ffffff`), `font-size:16px; font-weight:600; padding:10px 18px; min-height:36px`. → solid accent-blue pill labeled "New Note".
- Logged-out big-screen: CTA replaced by right-aligned `.message` (welcome text, `var(--text-tertiary)`, 15px) above a **"Get Started"** primary button.

### Bottom user chip (ProfileWidget) — `src/components/ProfileWidget/ProfileWidget.tsx`
Sits in `leftFooter` below `EventQueueWidget`. An `<A>` link to the active user's profile, class `userProfile`: `width:148px; height:48px; border-radius:24px` (pill), `background-color:var(--background-sheet)` (`#121212` / `#f5f5f5`), `padding-inline:6px`, flex row. Hover → `var(--background-input)`.
- **Left:** `<Avatar size="vvs" showCheck={false}>` in `.avatar`.
- **Right (`.userInfo`, `padding-left:6px`):**
  - `.userName` (display name): `12px/700/16px`, `color:var(--active-reply)` (`#cccccc` / `#444444`), truncated at `80px` with ellipsis.
  - `.userVerification` (NIP-05 handle/domain, e.g. `@primal.net`): `12px/400`, `color:var(--text-tertiary)` (`#757575` / `#808080`), truncated at `82px`.
- Collapsed rail (≤1300px): avatar-only 40×40; below 720px hidden. No visible "…" context button here.

Source: `LayoutDesktop.tsx`, `NavMenu.tsx` + `.module.scss`, `NavLink.tsx` + `.module.scss`, `ButtonPrimary.tsx` + `Buttons.module.scss`, `ProfileWidget.tsx` + `.module.scss`, `src/palette.scss`.

---

## Home Feed Header / Feed Selector

### There is NO tab / segmented control on Home
Home does **not** use tabs or a segmented control. The feed is chosen through a single **dropdown** (a `Select` trigger showing the current feed name + a caret). Reproduce a dropdown, not a Trending/Latest tab bar.

### Page layout (`src/pages/Home.tsx`)
- **Desktop:** `<HomeHeader ... />` inside `<div class={styles.normalCentralHeader}>`.
- **Phone:** `<HomeHeaderPhone />` wrapped in `<PageCaption>` under `<Show when={isPhone()}>`.
Both render the same `FeedSelect` dropdown.

### Desktop header (`src/components/HomeHeader/HomeHeader.tsx`), top→bottom
1. **CTA / greeting row** (`<Show when={hasPublicKey()}>`):
   - Logged-in: `styles.callToAction` button = `<Avatar size="vs">` + a `styles.input` div reading **"Say something on nostr..."** (`placeholders.callToAction.note`). Click → `showNewNoteForm()`. Then `<div class={styles.separator}>`.
   - Guest fallback: `styles.welcomeMessage` **"Welcome to nostr!"** (`placeholders.guestUserGreeting`) + `<ButtonPrimary onClick={showGetStarted}>` **"Get Started"** (`actions.getStarted`).
2. **Feed selector** (`<div class={styles.bigFeedSelect}>`): `<FeedSelect big={false} />` (the visible "Trending 24h ▾" dropdown). Beside it, `<Show when={props.hasNewPosts()}>` renders a `styles.newContentItem` counter (`feed.newPosts`: `one {# New Note}`, `=99 {99+ New Notes}`, `other {# New Notes}`; desktop caps at 99).
3. **Sticky small header** (`<div class={styles.smallHeader}>`, shown/hidden on scroll via `styles.instaHide`/`hiddenSelector`/`fixedSelector`): left = `SmallCallToAction` (logged-in) or `welcomeMessageSmall` (guest); right = a second `<FeedSelect />` (default `big`) so the dropdown stays reachable when scrolled; a `small_bottom_border` divider + `newContentNotification` (avatar stack of `newPostAuthors` + counter) on new posts.

### Phone header (`src/components/HomeHeaderPhone/HomeHeaderPhone.tsx`)
```jsx
<div class={styles.phoneHeader}>
  <Show when={home?.selectedFeed}>
    <FeedSelect isPhone={true} big={true} />
  </Show>
</div>
```
On phone the selector is the **big** variant (larger trigger font — see below).

### The feed selector — `src/components/FeedSelect/FeedSelect.tsx`
Renders a `SelectionBox2` (wrapped `@kobalte/core` `Select`) with:
```jsx
<SelectionBox2
  options={options()} onChange={selectFeed}
  initialValue={initialValue()} value={selectedValue()} isSelected={isSelected}
  isPhone={props.isPhone} big={props.big}
  caption="Notes Feed"
  captionAction={<A href="/settings/home_feeds">Edit Feeds</A>} />
```
Killer details:
- **Caption at top of open dropdown:** SelectionBox2 renders `` `${props.caption}:` `` → **"Notes Feed:"**, with an **"Edit Feeds"** link (→ `/settings/home_feeds`) right-aligned.
- **Options are data-driven, NOT hardcoded** — from `settings?.homeFeeds`, filtered `f.enabled === true`, mapped to `{ label: f.name, value: f.spec, description: f.description, id: genId(f.spec) }`. Each row = feed `name` (e.g. "Trending 24h", "Latest") with optional smaller `description` line.
- **Default selected feed = "Trending 24h".** When nothing selected, `initialValue()` picks the option whose id is `"global-trending_notes_24"`, else `opts[0]`. That feed's display name shows in the collapsed trigger.

### Where feed names come from
Feed **labels are not in the repo** — fetched from Primal's API. `src/contexts/SettingsContext.tsx` populates `store.homeFeeds` (default `[]`) via `fetchDefaultHomeFeeds` / `getDefaultHomeFeeds`. `src/constants.ts` confirms no static default (`defaultFeeds = []`); only unrelated `trendingFeed = { name: 'Trending, my network', … }`. For a mock repro, hardcode e.g. **Trending 24h** (default), **Latest**, plus user feeds; use each `name` as the row label — do not invent server descriptions.

### Dropdown mechanics & styling — `SelectionBox2.tsx` + `SelectionBox.module.scss`
`@kobalte/core` `<Select>` with `optionValue="value"`, `optionTextValue="label"`, `itemComponent={SelectionItem}`.
- **Collapsed trigger** shows `selectedOption()?.label` + a `Select.Icon` caret. Sizes:
  - `.trigger` (normal / `big={false}`): `color:var(--text-secondary); font-size:16px; font-weight:400; line-height:20px`; no bg/border/padding.
  - `.triggerBig` (`big={true}`, phone): `font-size:28px; font-weight:300; line-height:28px`.
- **Caret** (`.selectionIcon` / `.selectionIconBig`): masked `assets/icons/caret.svg`, `background-color:var(--text-secondary)`; normal 10×10, big 14×14.
- **Open panel** (`.selectionContent` → `.listbox`): `background:var(--background-input); color:var(--text-primary); border-radius:8px` (→ `0 0 8px 8px` when caption present); `padding:4px; font-size:15px`; opens ~`margin-top:7px` below trigger; `transform-origin:top left`.
- **Caption bar** (`.caption`): flex space-between, `background:var(--background-header-input); border-radius:8px 8px 0 0`; padding `10px/8px` v + `16px` inline; `.title` `color:var(--text-tertiary); font-size:14px`.
- **Option row** (`SelectionItem.tsx` → `.item`): `.label` (`var(--text-primary)`, 16px/400) + optional `.description` (`var(--text-tertiary)`, 14px/400, `margin-top:4px`). `min-width:292px; padding:10px/12px; border-radius:8px; text-transform:capitalize`; hover `background:var(--subtile-devider)`.
- **Check icon** (`.checkIcon`, 16×16, masked `check.svg`, `var(--text-primary)`) marks the selected feed (`home.selectedFeed.spec === option.value`).
- **Selecting** (`selectFeed`) → `home.actions.clearNotes()` then `selectFeed({ spec, name, description, enabled:true })`; re-selecting current spec is a no-op.

Scope note: **"Reads"** (long-form) is a separate top-level route with its own header/selector (`ReadsHeader.tsx`, `ReedSelect.tsx`, `Reads.tsx`). The Home dropdown lists **notes** feeds only (hence `caption="Notes Feed"`).

Source: `Home.tsx`, `HomeHeader.tsx`, `HomeHeaderPhone.tsx`, `FeedSelect.tsx`, `SelectionBox2.tsx`/`SelectionItem.tsx`/`SelectionBox.module.scss`, `SettingsContext.tsx`, `constants.ts`, `translations.ts`.

---

## Note Card + Action Bar

### Structure summary (feed/thread note) — `Note.tsx`
`[optional NoteRepostHeader]` → two-column layout: **left** `styles.leftSide` (avatar, with `styles.ancestorLine` for threads) + **right** `styles.rightSide` = `NoteAuthorInfo` → context trigger → `[NoteReplyToHeader]` → `ParsedNote` (`styles.message`) → `NoteTopZapsCompact` → `NoteFooter`. **Primary note** (`noteType === 'primary'`, thread focus) uses `NoteHeader` (avatar + name stacked), big-font `ParsedNote`, `NoteTopZaps` (full pills), a `styles.timePrimary` reactions/time row, then `NoteFooter` — and on phone the primary footer **hides the count numbers**.

### Header / author info row — `src/components/Note/NoteAuthorInfo.tsx`
```jsx
<div class={styles.authorInfo}>
  <span class={styles.userName}>{authorName(props.author)}</span>
  <VerificationCheck user={props.author} fallback={<div class={styles.verificationFailed}></div>} />
  <Show when={props.author?.nip05}>
    <span class={styles.verification} title={props.author.nip05}>{nip05Verification(props.author)}</span>
  </Show>
  <span class={styles.time} title={date(props.time).date.toLocaleString()}>
    <div class={styles.ellipsisIcon}></div>
    {date(props.time).label}
  </span>
</div>
```
Order: **display name → verification check badge → nip05 handle → time (with a leading "…" context-menu icon) → relative-time label**. **No "·" dot separator** and **no "@" prefix** on the handle in the DOM (avatar is rendered separately in the note's left column, not inside this component).
- `authorName` (`src/stores/profile.ts`): `display_name || displayName || name || truncated npub`.
- `nip05Verification`: if nip05 starts with `_@` it strips `_@` and shows just the domain (`_@example.com` → `example.com`); else raw nip05 (`alice@example.com`). No leading `@` added.
- **Relative time** (`src/lib/dates.ts` `date()`): `Intl.RelativeTimeFormat('en', { style: 'short' })` with `' ago'` stripped → `"23 hr."`, `"5 min."`, `"2 days"`, `"3 wk."`, `"4 mo."`, `"1 yr."`, and under a minute `` `${diff}s` `` (e.g. `"12s"`).
- **"…" menu icon** = `styles.ellipsisIcon`, mask `url(../../assets/icons/context.svg)`. `.time` = `16px/400; color:var(--text-tertiary)` (`#757575`). Unverified fallback = empty `<div class={styles.verificationFailed}>` (4×4 placeholder).

### Verification badge — `src/components/VerificationCheck/VerificationCheck.tsx`
TWO distinct badges:
- **Generic nip05** (verified, non-primal.net): grey mask badge — `styles.verifiedIcon`, `background-color:var(--text-tertiary-2)` (`#666`), mask `verified.svg`.
- **Primal-verified** (nip05 ends in `primal.net`) OR any Legend: filled badge — `div.verifiedIconPrimal` with `background:var(--accent)` (**`#2394EF` blue**) shaped by mask `purple_check.svg`, containing inner `div.checkIcon` (white, `var(--text-primary-button)`, mask `check.svg`) → **blue rounded check badge with white tick**.
- Badge box 15×15 (`verificationIcon`) or 20×20 large (`verificationIconL`), `margin-inline:4px`.

### Action bar — order, icons, active colors (KILLER DETAIL)
Left→right JSX order in `src/components/Note/NoteFooter/NoteFooter.tsx`:
1. **Reply** — `type="reply"`, count `state.replies`
2. **Zap** — `type="zap"`, count `state.satsZapped` (**sats, not zap-count**)
3. **Like** — `type="like"`, count `state.likes`
4. **Repost** — plain `<button>` `styles.repostType`, count `state.reposts`, active `styles.highlighted` on `state.reposted`
5. **Bookmark** — `<BookmarkNote ... right={true}>` (rightmost)

So order = **reply → zap → like → repost → bookmark** (zap is 2nd, before like). Each of the first three is a `<NoteFooterActionButton>`:
```jsx
<button id={`btn_${type}_${note.id}`} class={`${styles.stat} ${highlighted ? styles.highlighted : ''}`}>
  <div class={`${buttonTypeClasses[type]} ${large ? styles.large : ''}`}>
    <div class={`${styles.icon} ${large ? styles.large : ''}`} style="visibility: visible"></div>
    <Show when={!(isPhone() && noteType === 'primary')}>
      <div class={styles.statNumber}>{label || ''}</div>
    </Show>
  </div>
</button>
```
Icon is a masked `<div>`; count sits right in `styles.statNumber`, formatted `truncateNumber(x, 2)` (e.g. `1.2k`), hover title = full `x.toLocaleString()`. No `title` on the button.

**Icons (mask SVGs) from `NoteFooter.module.scss`:**
| Button | Default icon | Active/hover fill |
|---|---|---|
| reply | `feed_reply.svg` | `feed_reply_fill.svg` |
| zap | `feed_zap_2.svg` (lightning bolt) | `feed_zap_fill_2.svg` |
| like | `feed_like.svg` (**heart outline**) | `feed_like_fill.svg` (filled heart, hover) |
| repost | `feed_repost.svg` | `feed_repost_fill.svg` |

**Default "like" is a HEART** (`feed_like.svg`), not a shaka/thumbs. The `styles.highlighted` class swaps icon color to the matching `--active-*` var: zap `#ffa02f`, liked `#f800c1` (Midnight) / `#CA079F` (Ice) — **not red**, reposted `#66e205` / `#52CE0A`, replied `#cccccc` / `#444444`; idle `--text-tertiary-2` `#666666`, hover `--text-primary`.

### Legend / premium gold avatar ring — `src/components/Avatar/Avatar.tsx` + `.module.scss` (gradients in `src/index.scss`)
Legend avatars get a gradient ring/glow keyed by `legendConfig.style`; `.legend_<STYLE>` sets `background:` to the gradient behind the round avatar (`border-radius:99999px`), `.legendGlow`/`.legend_glow_<STYLE>` sets `--glow-color`. Exact gradients:
- **GOLD** (classic Legend): `linear-gradient(180deg, #FFB700 0%, #FFB700 49%, #CB721E 50%, #FFB700 100%)`; glow `#FFB700`
- AQUA: `linear-gradient(180deg, #6BCCFF 0%, #6BCCFF 49%, #247FFF 50%, #6BCCFF 100%)`
- SILVER: `linear-gradient(180deg, #CCC 0%, #CCC 49%, #777 50%, #CCC 100%)`
- PURPLE: `linear-gradient(135deg, #C803EC 15.94%, #5613FF 85.31%)`
- PURPLEHAZE: `linear-gradient(135deg, #FB00C4 0%, #04F7FC 100%)`
- (also TEAL, BROWN, BLUE, SUNFIRE, and WHITE = `#FFFFFF`)
For a Legend, the same gradient fills their verification badge (`verifiedIconPrimal.legend_GOLD { background: var(--legend-gold) }`).

### Top-zaps "gallery" pill row — `src/components/Note/NoteTopZaps.tsx` (`.zapHighlights`)
Rendered **between note content and footer**. Container `div.zapHighlights` (`display:flex; flex-wrap:wrap; gap:6px`). Each top zap = pill `a.topZap`:
```jsx
<a class={styles.topZap} style={`z-index: ${12 - index()}`}>
  <Avatar user={zapSender(zap)} size="xss" />
  <div class={styles.topZapIcon}></div>          // lightning
  <div class={styles.amount}>{zap.amount.toLocaleString()}</div>
  <Show when={zap.message}><div class={styles.description}>{zap.message}</div></Show>
</a>
<Show when={index() === 0 && topZaps.length > 3}><div class={styles.break}></div></Show>
```
`.topZap`: `border-radius:12px; background:var(--devider); padding-left:1px; padding-right:10px; padding-block:1px; gap:8px`, hover `background:var(--subtile-devider)`. Overlap via descending `z-index: 12 - index`. After the first pill, if >3 zaps a full-width `.break` wraps the rest.
- **Lightning** `.topZapIcon`: 10×12, `background-color:var(--text-primary)` (white), mask `feed_zap_fill_2.svg`, `margin-right:-6px`.
- **Amount** `.amount`: `color:var(--text-primary); 14px/600`; `toLocaleString()` (e.g. `21,000`), no leading `⚡` char.
- **Comment** `.description`: `color:var(--text-secondary-2)` (`#aaaaaa`), 14px/400, single-line ellipsis.
- Trailing **"Zap" CTA** `button.doZaps`: `background:var(--text-primary)` (white pill), inner `.zapIcon` (mask `feed_zap_fill_2.svg`) + `.zapText` "Zap" (700), both `var(--devider)` (dark text on white). A round `.moreZaps` (26px, `context.svg` "…") on overflow.

### Quote / embedded note — `Note.module.scss`
Nested note: `border:1px solid var(--background-input)` (dark `#222222`), `border-radius:8px`. Compact author row + content inside the border, inline in the parent body.

### Link-preview card — `src/components/LinkPreview/LinkPreview.tsx`
Horizontal `a.linkPreviewH`: `height:120px; border-radius:8px; background-color:var(--background-input)` (`#222`); `grid-template-columns:180px 1fr`. Left = `img.previewImage` (180×120, `object-fit:cover`). Right = `.previewInfo` (`padding:12px`): `.previewTitle`, `.previewDescription`, `.previewUrlLine` → `.previewUrl` (encoded origin, single-line clamp). Text `var(--text-tertiary)`, 14px/20px. `bordered` adds `border:1px solid var(--subtile-devider)`. No-image variant → `display:flex` (`.noImage`).

Source: `NoteFooter/{NoteFooter.tsx,.module.scss,NoteFooterActionButton.tsx}`, `Note/{Note.tsx,Note.module.scss,NoteAuthorInfo.tsx,NoteTopZaps.tsx}`, `VerificationCheck/{...}`, `Avatar/{...}`, `LinkPreview/{...}`, `stores/profile.ts`, `lib/dates.ts`, `index.scss`, `palette.scss`.

---

## Compose / Note Editor

### 1. Collapsed trigger pill ("Say something on nostr…") — `HomeHeader` / `HomeHeader.module.scss`
Shown only when logged in (`<Show when={hasPublicKey()}>`); click → `showNewNoteForm()`.
```jsx
<button class={styles.callToAction} onClick={onShowNewNoteinput}>
  <Avatar user={activeUser()} size="vs" />
  <div class={styles.input}>{intl.formatMessage(t.noteCallToAction)}</div>
</button>
```
- **Label (exact):** `Say something on nostr...` (`placeholders.callToAction.note`).
- `.callToAction`: `height:76px; padding-inline:20px; border:none; background:unset` (flex row: avatar + input pill).
- `.input`: `width:calc(100% - 50px); height:36px; font-size:16px; font-weight:400; border-radius:18px; border:none; margin-left:8px; padding-inline:16px`; text `var(--text-tertiary)` (`#808080`/`#757575`); background `var(--background-header-input)` (`#eeeeee`/`#1a1a1a`).
- **Killer detail:** the collapsed pill has **no border** — flat rounded (18px) grey-filled input. The blue border only appears when expanded.

### 2. Expanded inline editor — `NewNote.tsx` (holder) + `EditBox.tsx` (body)
```jsx
<div id="new_note_holder" class={styles.newNoteHolder}>
  <Avatar size="md" user={activeUser()} />
  <EditBox open={accountStore.showNewNoteForm} onClose={hideNewNoteForm} ... />
</div>
```
- Avatar `size="md"`, left column.
- Outer layout (`NewNote.module.scss`): `.newNote` = `display:grid; grid-template-columns:92px 1fr; min-height:122px; border-radius:6px; padding-bottom:11px; font-size:18px`.
- **Blue border:** `.newNoteBorder { border:1px solid var(--accent); border-radius:6px; padding:1px }` (in `EditBox.module.scss`). `--accent` = **`#2394EF`**. This blue outline is the defining visual of the expanded state. (A legacy `.newNote { border:2px solid var(--accent) }` exists in `NewNote.module.scss`, but the live box uses the 1px `EditBox` border.)

### 3. Editor body (top→bottom, `EditBox.tsx`)
1. `.editorWrap` wrapping `<textarea id="…new_note_text_area" rows={1}>`. **No `placeholder` attribute** — starts empty (the collapsed pill carries the prompt).
2. **"NOTE PREVIEW" caption** — `<div class={styles.previewCaption}>{intl.formatMessage(tNote.newPreview)}</div>`. Label `Note preview` (`note.newPreview`), rendered uppercase via CSS → displays **"NOTE PREVIEW"**. `.previewCaption`: `color:var(--subtile-devider); font-weight:400; font-size:10px; line-height:16px; text-transform:uppercase` (`#c8c8c8`/`#444444`, faint grey).
3. `.editorScroll` (`id="…new_note_text_preview"`) — live-rendered preview (`renderMessage()`), `min-height:60px; margin-bottom:48px; overflow-y:scroll` (scrollbar hidden).

### 4. Toolbar (`.controls` → `.editorOptions`), left→right
Three ghost-icon buttons, each a CSS-mask SVG 24×24, color `var(--text-tertiary)`, hover `var(--text-secondary)`, disabled `var(--subtile-devider)`:
| Order | Icon | Class | SVG mask | Action |
|---|---|---|---|---|
| 1 | Image / attach | `attach_icon` `.attachIcon` | `attach_media.svg` | `<label>` over hidden `<input type="file" accept="image/*,video/*,audio/*,application/pdf">` |
| 2 | Poll / list | `poll_icon` `.pollIcon` | `poll.svg` | `ButtonGhost onClick={moveToPoll}` |
| 3 | Emoji | `emoji_icon` `.emojiIcon` | `emoji.svg` | `ButtonGhost` toggles `EmojiPickPopover` |
Active/selected (poll & emoji) → `.highlight` = `background-color:var(--text-secondary)`.

### 5. Action buttons (`.editorDescision`) — Post then Cancel
```jsx
<ButtonPrimary onClick={postNote} disabled={isPostingDisabled()}>{intl.formatMessage(tActions.notePostNew)}</ButtonPrimary>  // "Post"
<ButtonSecondary onClick={closeEditor}>{intl.formatMessage(tActions.cancel)}</ButtonSecondary>  // "Cancel"
```
- **Post** = `Post` (`actions.notePostNew`); **Cancel** = `Cancel` (`actions.cancel`). Buttons `min-width:110px; margin-left:8px`.
- Post (`.primaryButton`): `border-radius:6px; font-size:14px; font-weight:700; color:white`; background `var(--brand-gradient-vertical)`.
- Cancel (`.secondaryButton`): gradient-border wrapper with inner `background-color:var(--background-card)`, `color:var(--text-tertiary-2)`.

**Fidelity caveat on the button gradient:** `--brand-gradient-vertical` is *referenced* by `NewNote.module.scss`/`EditBox.module.scss` but **not defined** anywhere in `palette.scss`/`index.scss`. The *defined* brand token is **`--brand-gradient: linear-gradient(128deg, #14B9FF 0%, #690DFF 100%)`** (cyan→purple, identical in both themes). For a faithful repro, render **Post** with that `#14B9FF → #690DFF` gradient + white bold text.

### 6. Post disabled when empty? — YES (`EditBox.tsx`)
```js
const isPostingDisabled = () => {
  if (isCreatingPoll()) return !isPollInputValid();
  return isPostingInProgress() || fileToUpload() || message().trim().length === 0;
}
```
Disabled when trimmed message empty, while posting, or while a file is pending. In poll mode gated on poll validity.

Source: `HomeHeader.tsx`/`.module.scss`, `NewNote.tsx`/`.module.scss`, `EditBox/EditBox.tsx`/`.module.scss`, `translations.ts`, `palette.scss`, `index.scss` (icon masks).

---

## Right Sidebar (Home)

Assembled in `src/pages/Home.tsx`, non-phone only:
```jsx
<Show when={!isPhone()}>
  <Wormhole to="search_section"><Search /></Wormhole>
  <StickySidebar><HomeSidebar /></StickySidebar>
</Show>
```
Top→bottom: **(1) Search pill** (portaled into the layout's `search_section` slot → very top of the right column), then **(2) `<HomeSidebar/>`** (sticky) → **(2a) "Live on Nostr"** → **(2b) Trending selector + list**.

### 1. Search pill — `src/components/Search/Search.tsx`
```jsx
<form class={formClass()} onsubmit={onSearch} autocomplete="off">
  <div class={styles.searchIcon}></div>
  <input type='text' name='searchQuery' placeholder={props.placeholder ?? intl.formatMessage(placeholders.search)} ... />
</form>
```
- **Placeholder: `Search...`** (`placeholders.search`). Empty-focused suggestion row label: **`Search nostr`** (`search.searchNostr`).
- Pill (`Search.module.scss`): `border-radius:18px; height:36px; background-color:var(--background-header-input)` (`#1a1a1a` dark). Input `height:36px; font-size:16px; color:var(--text-tertiary)` (`#757575`); `::placeholder { color:var(--text-tertiary); font-size:16px; font-weight:400 }`. Icon: `18×18; margin-left:16px; background-color:var(--text-tertiary)`, mask `search.svg` (masked SVG tinted `#757575`, not a colored image).

### 2a. "Live on Nostr" — `src/components/HomeSidebar/HomeSidebar.tsx`
Whole section is `<Show when={liveEvents.length > 0}>` (omit if no live streams).
- Heading literal **`Live on Nostr`** in `<div class={styles.headingLive}>`: sticky, `height:44px; font-size:16px; font-weight:400; line-height:20px; text-transform:none; color:var(--text-secondary-2)` (`#aaaaaa`), `background:var(--background-site)` (`#000000`). **NOT uppercase** (overrides the shared `@mixin heading` which is 18px/800/uppercase).
- List `.liveList`: `flex-direction:column; gap:12px; max-height:280px; overflow-y:scroll; margin-bottom:36px`.

**Each live card** = `src/components/LivePill/LivePill.tsx`:
```jsx
<a class={styles.liveItem} href={liveHref(...)}>
  <div class={styles.leftSide}>
    <Avatar user={props.liveAuthor} size="xxs" />
    <div class={styles.eventInfo}>
      <div class={styles.authorName}>{props.liveEvent?.title || userName(props.liveAuthor)}</div>
      <div class={styles.ribbon}>
        <Show when={props.liveEvent.status === 'live'} fallback={<div class={styles.time}>Ended {date(ends).label} ago</div>}>
          <div class={styles.time}>Started {date(starts).label} ago</div>
        </Show>
        <div class={styles.participantIcon}></div>
        <div>{props.liveEvent?.currentParticipants || 0}</div>
      </div>
    </div>
  </div>
  <Show when={props.liveEvent.status === 'live'}>
    <div class={styles.liveStatus}><div class={styles.liveDot}></div>Live</div>
  </Show>
</a>
```
Row: **xxs avatar → event info (title line 1, ribbon line 2) → right-aligned red Live badge**.
- **Title** `.authorName`: title || userName; `color:var(--text-primary)` (`#ffffff`); `14px/700/16px; -webkit-line-clamp:1`.
- **"Started … ago"** line: literal `Started {date().label} ago` (or `Ended … ago`). `date()` short style → abbreviated units (`1 yr.`, `2 mo.`, `3 wk.`, `4 days`, `1 hr.`, `5 min.`, `12s`). Renders e.g. **"Started 1 yr. ago"** — do NOT use full-word units.
- **Viewer count**: `{currentParticipants || 0}` preceded by `.participantIcon` (masked people/eye glyph). Ribbon `color:var(--text-tertiary)` (`#757575`), `12px/400/12px; gap:4px`.
- **Red "Live" badge** (`.liveStatus` + `.liveDot` + literal `Live`, only when `status === 'live'`): `.liveStatus { font-size:14px; font-weight:400; color:var(--text-tertiary); margin-right:8px; gap:4px }`; `.liveDot { width:6px; height:6px; background-color:#E00; mask:url(../../assets/icons/dot.svg) no-repeat center }` — a **6×6 dot masked to solid red `#E00` (`#EE0000`)**.
- **Pill** `.liveItem`: `display:flex; justify-content:space-between; align-items:center; padding:7px 8px; border-radius:99px; gap:8px; background:var(--background-input)` (`#222222`).

### 2b. "Trending 4h" selector + list — `HomeSidebar.tsx`
A `<SelectionBox2>` dropdown sits above the list; there is **no plain heading string** — it's the *selected option label*.
```jsx
<div class={styles.headingTrending}>
  <SelectionBox2 options={sidebarOptions} value={home?.sidebarQuery} initialValue={home?.sidebarQuery}
    onChange={(option) => { ... home?.actions.doSidebarSearch(option.value || ''); }} />
</div>
```
- **Options** (`sidebarOptions`, verbatim): `Trending 24h`, `Trending 12h`, **`Trending 4h`**, `Trending 1h`, separator, `Most-zapped 24h`, `Most-zapped 12h`, `Most-zapped 4h`, `Most-zapped 1h`. (Static repro: render label **"Trending 4h"** with a chevron.)
- Loading renders **24** `<ShortNoteSkeleton />` (`new Array(24)`).

**Each trending row** = `src/components/SmallNote/SmallNote.tsx`:
```jsx
<div class={styles.smallNote}>
  <A class={styles.avatar}><Avatar user={props.note.user} size="xxs" /></A>
  <A class={styles.content}>
    <div class={styles.header}>
      <div class={styles.name}>{nameOfAuthor()}</div>
      <div class={styles.time}>{date(props.note.post?.created_at).label}</div>
    </div>
    <div class={styles.message}><ParsedNote note noLinks="text" ignoreMedia ignoreLinebreaks shorten veryShort /></div>
  </A>
</div>
```
Row: **grid `24px 1fr`, column-gap 12px, width 300px**. Left = 24×24 xxs avatar. Right = header (name + time) over a 2-line preview.
- **Name** `.name`: `color:var(--text-secondary-2)` (`#aaaaaa`); `font-weight:800; max-width:216px; ellipsis`. Header `14px/18px`.
- **"| 1 hr." time** — killer detail: the `|` is a **CSS pseudo-element**: `.time { margin:0 2px; color:var(--text-tertiary); font-weight:400 } .time::before { content:"|"; padding:0 2px }`. Value = `date(created_at).label` short → e.g. `1 hr.`. Row reads **"Alice | 1 hr."**.
- **2-line preview** `.message`: `<ParsedNote shorten veryShort ignoreMedia ignoreLinebreaks>` (plain text, links stripped). `14px/18px/400; color:var(--text-tertiary)` (`#757575`); `width:264px`; clamped to 2 lines. Row spacing `margin-bottom:18px`.

Source: `Home.tsx`, `HomeSidebar.tsx`/`.module.scss`, `LivePill.tsx`/`.module.scss`, `SmallNote.tsx`/`.module.scss`, `Search.tsx`/`.module.scss`, `translations.ts`, `lib/dates.ts`, `palette.scss`. Live-badge red `#E00` is hardcoded in `LivePill.module.scss`, not a theme var.

---

## Explore page

Source of truth: `src/pages/Explore/Explore.tsx`.

### Page shell / layout
- Browser/tab title string: `"Explore"` (`explore.pageTitle`), via `<PageTitle title=... />`. There is **NO large "Explore" heading** on screen.
- Top: a **full-width Search bar** inside `<PageCaption>` — `<Search fullWidth={true} />` (`.exploreHeader`).
- Two-column desktop: main column (tabs + content) left, **sticky right column** right (`<StickySidebar>`, phone-hidden). Right column stack in order: `NostrStats` → `ExploreHotTopics` → `ExploreSidebar`, inside `.exploreSide` (flex column, `gap:36px`).

### Tabs (exact labels + order) — `Explore.tsx` `options()`
1. **Feeds** — value `feeds`, desc "DVM feeds"
2. **People** — value `people`, desc "Explore People"
3. **Zaps** — value `zaps`, desc "Explore Zaps"
4. **Media** — value `media`, desc "Explore Media"
5. **Topics** — value `topics`, desc "Explore Topics"

Default tab = `feeds` (from URL hash). Tab UI = `@kobalte/core/tabs`. Right of the tab strip: an **"Advanced Search"** link → `/search`. On phone the strip becomes a `SelectionBox2` dropdown with the same link beside it.
Tab styling (`Explore.module.scss`): strip `640px` wide, `border-bottom:1px solid var(--devider)`; labels `16px/600; color:var(--text-primary)`; active underline `.exploreTabIndicator` = `height:4px; border-radius:2px 2px 0 0; background:var(--accent)` (Primal blue).

### Tab 1 — Feeds (`FeedMarketPlace` → `FeedMarketPlaceItem`)
List of **DVM feed cards** ("booths"). Names (e.g. "Nostr Reads", "Trending on Primal 4h") come from live DVM data (`dvm.name`), not hardcoded. Each card:
- Left: **avatar** (`Avatar size="vs2"` from `dvm.picture`/`dvm.image`) + a **price token** below it: `"FREE"` (`.freeToken`) or `"PAID"` (`.paidToken`). `isPaid()` = amount ≠ 'free' & > 0, or `primalVerifiedRequired`.
- Right: **title** = `dvm.name`; **about** = `dvm.about`.
- If a Primal feed at header size: a `"Created by"` + `"Primal"` line with the Primal logo (`.createdBy`).
- Row of **common-follower avatars** (`.commonUsersList`, `Avatar size="micro"`).
- **Stats/actions**: a **like** + a **zap** button (`DvmFooterActionButton type="like"`/`"zap"`), each showing a truncated count (empty when 0).
- Click → `/explore/feed/${dvm.identifier}_by_${dvm.pubkey}`.

### Tab 2 — People — `src/pages/Explore/ExplorePeople.tsx`
Two-column **grid** (`.peopleGrid`, `grid-template-columns: 294px 294px`, gap 12px; single col on phone). Each card = `<A>` to profile (`.explorePerson`):
- **Avatar** (`Avatar size="mll"`) with a **Follow button** overlaid (`<FollowButton>`, `.follow`).
- **Name** = `userName(user)` + inline `<VerificationCheck>`.
- **NIP-05** line = `nip05Verification(user)` (only `<Show when={user.nip05}>`).
- **About** = `user.about` (2-line clamp; 3 lines if no nip05).
- **Stats** (`.userStats`): follower count `humanizeNumber(followers_count)` bold, then literal unit **`followers`** (lowercase). Then increase `+ {increase.toLocaleString()}` (`.increaseCount`, e.g. "+ 1,234"). Colors: number `var(--text-primary)` 12px/700; unit `var(--text-secondary)` 12px/400; increase `var(--text-primary)` 12px/700.
- Bottom: `<Paginator isSmall>`.

### Tab 3 — Zaps — `ExploreZaps.tsx` → `ProfileNoteZap`
Vertical list of zap cards (`.exploreZaps`, flex column, gap 12px). Each card (`.contentZap`): **sender avatar** (`vs2`) → **amount block** (`.zapIcon` + `{amount.toLocaleString()}` `.number` + optional `message`) → **receiver avatar** (`vs2`) → **subject** below (zapped content: note author+time+content, or article **title**, or profile **about**; fallback **"UNKNOWN"** `.subject`; header `userName · <relative time>`). Bottom `<Paginator isSmall>`. No explicit "Zaps" heading, no ranking numbers — a served list, not a leaderboard.

### Tab 4 — Media — `ExploreMedia.tsx`
Dense **image grid** `.galleryGrid`, `grid-template-columns: 148px 148px 148px 148px` (4×148px, 2px gaps; images `object-fit:cover; 148×148`). Phone: 3 cols `1fr 1fr 1fr`. Each cell = `<A href={/e/${note.noteIdShort}}>` wrapping `<NoteGallery note imgWidth={120} />`. Only notes matching `imageOrVideoRegex`. `<Paginator isSmall>` at end. No labels.

### Tab 5 — Topics — `ExploreTopics.tsx`
Two-column **grid of topic chips** (`.exploreTopics`, `grid-template-columns: 1fr 1fr`, 12px gaps; single col phone). Sorted by note count desc. Each chip = `<A href={/search/%23${topic}}>` (`.exploreTopic`), rounded `background:var(--background-header-input)`:
- **Name**: `#{topic}` (hashtag, `text-transform:capitalize`, 16px/600, `var(--text-primary)`).
- **Count**: `{humanizeNumber(count)} notes` — literal suffix `notes`, 14px/400, `var(--text-tertiary)`. e.g. "12.3K notes".

### Right column (desktop sticky sidebar)
**1. Network stats — `NostrStats` (`NostrStats.tsx`).** 3×2 grid (`1fr 1fr 1fr`, 24px gaps). Each cell = big `.number` (`var(--text-primary)`, 15px) over a small **lowercase** `.label` (`var(--text-tertiary)`, 12px, `text-transform:lowercase`). Six stats in order (`explore.statDisplay`):

| order | value | label (verbatim) |
|---|---|---|
| 1 | `stats.users` | **Users** |
| 2 | `stats.zaps` | **Zaps** |
| 3 | `(stats.satszapped/1e8).toFixed(8)` | **BTC Zapped** |
| 4 | `stats.pubnotes` | **Public Notes** |
| 5 | `stats.reactions` | **Reactions** |
| 6 | `stats.any` | **All Events** |

(render lowercased → "users", "zaps", "btc zapped", "public notes", "reactions", "all events"). `pubkeys`/`reposts` exist in translations but are commented out and NOT rendered. **Correction:** there is **no "24H reads" stat** — these are lifetime total-network counters, not 24-hour windows. Do not reproduce a "24H" label.

**2. Hot Topics — `ExploreHotTopics.tsx`.** Caption literal **`Hot Topics`** (hardcoded). Below: up to **19** topic pills (`.slice(0,19)`, sorted desc), each `<A href={/search/%23${topic}}>` showing the bare topic word (`.exploreHotTopic`). (The recording's "Trending topics" maps to this "Hot Topics" block.)

**3. Trending users — `ExploreSidebar.tsx`.** Caption `exploreSidebarCaption` → **`trending users`**. Below: trending-user rows (`.trendingUsers` → `.user`), each `<A>` to profile with `Avatar size="vs"` + display name (`.name`); name = `displayName || name || truncateNpub(npub)`.

Source: `Explore/Explore.tsx`/`.module.scss`, `ExplorePeople.tsx`, `ExploreZaps.tsx` + `ProfileNoteZap.tsx`, `ExploreMedia.tsx`, `ExploreTopics.tsx`, `FeedMarketplace/{FeedMarketPlace.tsx,FeedMarketPlaceItem.tsx}`, `NostrStats/{NostrStats.tsx,.module.scss}`, `ExploreSidebar/{ExploreHotTopics.tsx,ExploreSidebar.tsx}`, `translations.ts`.

---

## Notifications page

### Key correction vs. the recording
The recording's **"SUMMARY"** on the right is **NOT** a summary-vs-detailed toggle. There is **no** detailed/summary view switch. "Summary" is the heading of the right-hand stats panel (`NotificationsSidebar`, `defaultMessage: 'Summary'`). The main column is always the detailed, per-notification list. Do not build a toggle.

### 1. Tabs — labels + order — `src/pages/Notifications.tsx`
Kobalte `Tabs` with `Tabs.List` class `notificationTabs`, each `Tabs.Trigger` class `notificationTab`, in order:
| order | value | label (`notifications.*`) |
|---|---|---|
| 1 | `all` | **All** |
| 2 | `zaps` | **Zaps** |
| 3 | `replies` | **Replies** |
| 4 | `mentions` | **Mentions** |
| 5 | `reposts` | **Reposts** |

Labels are Title Case in source (the recording's ALL-CAPS is CSS `text-transform`). `<Tabs.Indicator class={styles.notificationTabIndicator} />` is the sliding underline. Page title/caption = **"Notifications"** (`t.title`). A 6th string **Reactions** (`pages.notifications.reactions`) exists but is NOT rendered — only these 5 tabs mount.

### 2. "New notifications" load bar
Above the tabs, shown when `newNotifCount() > 0`: a button `div.newContentNotification > div.counter` using `t.newNotifs`:
```
{number, plural, =0 {} one {# new notification} =100 {99+ new notifications} other {# new notifications}}
```
(e.g. "3 new notifications", capped "99+ new notifications").

### 3. Row anatomy — `NotificationItem.tsx` + `.module.scss`
Root `div.notifItem`. Grid = **`grid-template-columns: 44px 1fr 12px`**; `padding-top:12px; padding-bottom:17px; border-bottom:1px solid var(--devider)`. Three cells:
1. **`div.notifType`** (44px): monochrome type-icon (28 SVGs, dark + `/light/` variants; light set used when theme is `sunrise`/`ice`). For **reply** types swaps to the replier's `<Avatar size="vvs">` (`.replyAvatar`). For **likes** with a non-standard reaction, renders the raw emoji (`reactionIcon()`); a plain `+` like renders `post_liked.svg`. Live events show a `LIVE` label (`.iconLiveInfo`, `10px/800`).
2. **`div.notifContent`** (`1fr`): `div.time` (absolute top-right, relative time via `date(created_at,'narrow').label`); `div.notifHeader` (`display:flex; gap:6px; flex-wrap:wrap`) → avatar cluster + description; below, a `<Switch>` renders referenced content in `div.reference` (`color:var(--text-tertiary)`): `<Note noteType="notification">`, `<ArticlePreview notif>`, a poll (`UserPoll`/`ZapPoll`), an article highlight, or a live-event card. Follow/unfollow render **no** reference body.
3. **`div.newBubble`** (12px): a 10×10 rounded dot (`border-radius:5px; background:var(--accent); border:1px solid var(--background-site)`) marking unread. Zap-amount token in this file: **`#FFA02F`** (`.iconZapInfo`).

### 4. Avatar grouping / clustering (killer detail)
Multiple actors on one notification group into a single row with an overlapping avatar cluster:
- Deduped (`uniqueifyUsers`), **sorted by `followers_count` desc** — highest-follower actor becomes the named "first user".
- **`const avatarDisplayLimit = 6;`** — at most 6 avatars (`displayedUsers = sortedUsers().slice(0,6)`).
- Cluster: `div.avatars` (`display:flex; gap:1px`) of `<Avatar size="vvs">` each in `<A class={styles.avatar}>` (`width:36px`).
- Overflow chip: when `numberOfUsers() > avatarDisplayLimit - 1` (> 5), append `<NotificationAvatar number={remainingUsers()}>` rendering literally **`+{number}`** (`remainingUsers` = total − shown, capped at 99).
- For **reply / reply-to-reply** rows the cluster is hidden in the header (single replier avatar sits in the left cell).

### 5. Description text per row (exact phrases)
`div.description` = bold `span.firstUserName` (first user's `displayName || name || truncateNpub`, `font-weight:800; font-size:16px; max-width:200px` ellipsis) + a `VerificationCheck` + `div.restUsers` = the type phrase. Phrase = `notificationTypeTranslations`, prefixed for multi-actor rows by `notificationsNew[type]` = **`{number, plural, =0 {} one {and # other} other {and # others}}`** (number = actors − 1):

| type | phrase |
|---|---|
| NEW_USER_FOLLOWED_YOU | `followed you` |
| USER_UNFOLLOWED_YOU | `unfollowed you` |
| YOUR_POST_WAS_ZAPPED | `zapped your` |
| YOUR_POST_WAS_LIKED | `liked your` |
| YOUR_POST_WAS_REPOSTED | `reposted your` |
| YOUR_POST_WAS_REPLIED_TO | `replied to your` |
| REPLY_TO_REPLY | `replied in your thread` |
| YOU_WERE_MENTIONED_IN_POST | `mentioned you in a` |
| YOUR_POST_WAS_MENTIONED_IN_POST | `mentioned your` |
| YOUR_POST_WAS_HIGHLIGHTED | `highlighted your` |
| YOUR_POST_WAS_BOOKMARKED | `bookmarked your` |
| YOUR_POST_HAD_REACTION | `reacted to your` |
| LIVE_EVENT_HAPPENING | `is live` |
| POST_YOU_WERE_MENTIONED_IN_WAS_{ZAPPED/LIKED/REPOSTED/REPLIED_TO} | `zapped/liked/reposted/replied to a note you were mentioned in` |
| POST_YOUR_POST_WAS_MENTIONED_IN_WAS_{…} | `zapped/liked/reposted/replied to a note your note was mentioned in` |

**Reference-word suffix** (`typeDescription()`): for your-post types the phrase is followed by `note` (default), `article` (if `props.read`), or `poll` (if `props.poll`). E.g. a like → **"liked your note"**; a reply to an article → **"replied to your article"**. Follow/unfollow, reply-to-reply, and mention-of-post types get **no** suffix.

**Zap amount (killer detail):** when `type === YOUR_POST_WAS_ZAPPED && sats`, overridden to:
```
zapped your {note|article|poll} for a total of {truncateNumber(sats)} sats
```
e.g. **"zapped your note for a total of 21 sats"**. `truncateNumber` (`src/lib/notifications.ts`): `<1000` → `toLocaleString()`; `≥1000` → `12K`; `≥1e6` → `3M`; `≥1e9` → `1B`; else `1T+` (integer + suffix, no decimals).

**Like edge case:** a `YOUR_POST_WAS_LIKED` with a non-`+` reaction is re-labeled with the `YOUR_POST_HAD_REACTION` phrase → **"reacted to your note"**, and the emoji shows as the type icon.

### 6. Type icons (left cell)
`typeIcons` (in `constants.ts` + `NotificationItem.tsx`) → `src/assets/icons/notifications/` (dark) and `.../notifications/light/`: `user_followed.svg`, `user_unfollowed.svg`, `post_zapped.svg`, `post_liked.svg`, `post_reposted.svg`, `post_replied.svg`, `mention.svg`, `mentioned_post.svg`, `mention_zapped/liked/reposted/replied.svg`, `mentioned_post_zapped/liked/reposted/replied.svg`, `post_highlighted.svg`, `post_bookmarked.svg`, `post_reacted.svg`, `live.svg` — monochrome glyphs (zap bolt, heart, arrows, reply, @, etc.).

### 7. "Summary" sidebar (right column) — `NotificationsSidebar.tsx`
Mounted in a `StickySidebar` (desktop). Heading `div.sidebarHeading` = **"Summary"** (`notificationsSidebar.heading`). Empty state = **"No new notifications"** (`notificationsSidebar.empty`). Renders **aggregate stat categories** (each `div.category` = icon + `sidebarTitle` + count rows), only when count > 0: **Followers** (`new {n} follower(s)` / `lost {n} follower(s)`), **Zaps** (`{n} zap(s)` + total sats `{n} sat(s)`), **Reactions/likes** (`{n} like(s)`), **Replies**, **Reposts**, **Mentions** (`of you` / `of your note`), **Other**. Counts via `truncateNumber`. It is a per-session rollup, distinct from the detailed main list.

Source: `Notifications.tsx`, `NotificationItem.tsx`/`.module.scss`, `NotificationAvatar.tsx`, `NotificationsSidebar.tsx`, `constants.ts`, `translations.ts`, `lib/notifications.ts`.

---

## Messages / DMs page

Default accent is blue `#2394EF` (a distinct `--accent-dm: #0C7DD8` exists in the palette but the DM SCSS uses `--accent`, not `--accent-dm`).

### 1. Labels — `translations.ts` `messages` block
- Page title: **`Messages`** (`messages.title`)
- Tab 1: **`follows`** (`messages.follows`) — lowercase, literal
- Tab 2: **`other`** (`messages.other`) — lowercase, literal
- Mark-read button: **`Mark All Read`** (`messages.markAsRead`)
- (`Send a comment...` / `messages.sendComment` exists but is NOT rendered — the textarea has no placeholder.)

Tab order `follows` then `other`; default = `dms.lastConversationRelation` (falls back to `"follows"`). Killer detail: **selecting a tab immediately navigates to `/dms/<first-contact-npub>`** — tabs jump to the first conversation, not just filter.

### 2. Page layout — `src/pages/DirectMessages.tsx` + `.module.scss`
```
.dmLayout                         width 998px, border-right 1px solid --devider, column flex
 ├─ .dmHeader (PageCaption "Messages")   width 100%, height 72px, border-bottom 1px --devider
 ├─ <Search> (via Wormhole into "search_section" → right sidebar, NOT main column)
 └─ .dmContent   grid-template-columns: 334px 1fr; height calc(100vh - 70px); padding-top 1px
      ├─ .dmSidebar (left, 334px)   border-right 1px --devider
      │    └─ Tabs (Kobalte)
      │        ├─ .dmControls   flex space-between, height 48px, border-bottom 1px --devider
      │        │    ├─ Tabs.List .dmContactsTabs → Trigger "follows" · Trigger "other" · Tabs.Indicator
      │        │    └─ button .markAsRead "Mark All Read"  (disabled when dmCount===0)
      │        └─ .dmContactsList  (scroll-y) → For each contact → <DirectMessageContact> + <Paginator isSmall>
      └─ .dmConversation  (right, 1fr)   height calc(100vh - 72px); flex-direction: COLUMN-REVERSE
           ├─ <DirectMessagesComposer>   (declared FIRST in JSX but column-reverse puts it at the BOTTOM)
           └─ <DirectMessageConversation> (messages, fill above composer)
```
The conversation column is `flex-direction: column-reverse`, so the composer (written first) renders at the bottom, messages above.

- **Tab** (`.dmContactTab`): `16px/600/14px; color #ffffff` (dark) / `#111111`; `height 48px; padding-inline 14px; margin-bottom 12px`; no border/bg.
- **Tab indicator** (`.dmContactsTabIndicator`): `position absolute; height 4px; top 44px; border-radius 2px 2px 0 0; background var(--accent) #2394EF; transition 250ms`.
- **Mark All Read** (`.markAsRead`): `color var(--accent) #2394EF; 14px/400/16px; height 48px; padding-right 12px`; no bg/border.

### 3. Conversation-list item (left rail) — `DirectMessageContact.tsx`
`<button>`: `[Avatar size="md"] [.senderInfo] [.senderBubble?]`
- `.directMessageContact`: `display flex; width 333px; padding-inline 15px; padding-block 12px; background var(--background-card)` (`#000000`/`#ffffff`); `border-bottom 1px solid var(--devider)` (`#222222`/`#e5e5e5`); `border-radius 0`. Hover/`.selected`/`.focus`: `background var(--background-input)` (`#222222`/`#e5e5e5`); no shadow. (Selected from URL param.)
- `.senderInfo` (`margin-left 12px`, column):
  - `.firstLine`: `[.senderName] [·dotSeparator] [.lastMessageTime]`
    - `.senderName`: `color --text-primary; 16px/700/16px; max-width 178px ellipsis`. Value = `userName(user)`.
    - `.dotSeparator`: `4×4px` dot, `margin-inline 6px; border-radius 2px; background var(--text-tertiary-2)` (`#666666`/`#808080`). **Only when `latest_at > 0`**.
    - `.lastMessageTime`: `color --text-tertiary-2; 16px/400/16px`. Value = `date(latest_at,'narrow', now()).label`.
  - `.secondLine`: the **nip05 verification string** (`nip05Verification(user)`), NOT a message preview. `color --text-tertiary` (`#757575`/`#808080`); `14px/400/16px; margin-top 4px; max-width 228px ellipsis`.
- **Unread bubble** `.senderBubble` (when `dmInfo.cnt > 0`): `position absolute; top 12px; right 12px; min 18×18px; padding-inline 4px; 12px/600/12px; background var(--accent) #2394EF; border 1px solid var(--background-site); border-radius 8px; color --text-primary-button (#ffffff); text-shadow 0.5px 0.5px 0 black`. Shows the numeric unread **count** (a blue numeric badge, not a dot).

### 4. Chat thread (right) — `DirectMessageConversation.tsx` / `DirectMessageContent.tsx`
- `.conversation`: `background var(--background-card)` (`#000000`/`#ffffff`); `width 662px; height calc(100vh - var(--header-height) - 80px); flex-direction column-reverse`.
- `.messages`: `overflow-y scroll; padding 16px; flex-direction column-reverse` (newest at bottom). `<Paginator isSmall>` loads older.
- Grouping: `recentTime = 900`s window; consecutive same-sender messages within 900s collapse (`oldThread`), last in a run gets `lastInThread`; timestamp + avatar only on thread boundaries.

**Bubble alignment & shape** (`.myThread` / `.theirThread`):
- **Mine** (`isMe()`): right-aligned, avatar `size="xxs"` below the run on the right. Bubble `background var(--accent) #2394EF`; text `var(--text-primary-button)` (`#ffffff`). `border-radius`: mid `12px 0 0 12px`; last `12px 12px 0 12px`; new `12px 0 0 12px` (notch bottom-right). Links: `color #ffffff !important; text-decoration underline !important`.
- **Theirs**: left-aligned, contact avatar `xxs` on the left. Bubble `background var(--background-input)` (`#222222`/`#e5e5e5`); text `var(--text-primary)`. `border-radius`: `0 12px 12px 0` / last `12px 12px 12px 0` / new `0 12px 12px 0` (notch bottom-left).
- Bubble box: `padding-block 8px; padding-inline 16px; margin-bottom 8px; width fit-content; max-width calc(var(--center-col-w) + 12px - 40px); 16px/400/24px`.
- `.threadTime` (new-thread boundary): `color --text-tertiary-2 (#666666/#808080); 12px/400/16px`. Value = `date(created_at,'long', now()).label`.
- Consecutive same-side runs: `margin-bottom 20px`; each thread `margin-top -16px` (tight stacking).
- **Lightning invoices (`lnbc…`) and Cashu tokens (`cashuA…`) render as special `<Lnbc>`/`<Cashu>` cards** (`.messageLn`, `width calc(500px + 12px - 40px)`), split out of the text.

### 5. Composer — `DirectMessagesComposer.tsx` + `.newMessage`
`[.textAreaBorder → textarea] [send button]`:
- `.newMessage`: `display flex; align-items flex-end; padding 16px 16px 24px 16px; border-top 1px solid var(--devider); background var(--background-site)`.
- `.textAreaBorder`: `width 576px; height 40px; padding 1px; border-radius 8px`. Inner `textarea`: `background var(--background-header-input)` (`#1a1a1a`/`#eeeeee`); `color --text-primary; border-radius 20px; border none; 15px/400/20px; height 40px; padding-inline 16px; padding-block 8px`. **No placeholder** (`data-min-rows={2}`, no `placeholder`). Auto-grows in 20px steps.
- **Send button** (`sendButtonClass()`): default/empty → `.secondaryButton` (`40×40; border-radius 20px; background var(--background-input)` `#222222`/`#e5e5e5`); focused AND trimmed length > 0 → `.primaryButton` (same size, `background var(--accent) #2394EF`). Icon `.iconSend`: `16×16` mask of `send.svg`, `background-color var(--text-primary-button)` (`#ffffff`, white paper-plane).
- Behavior: **Enter** (no Shift, not mid-mention/emoji) sends; Shift+Enter newlines. `@` mention autocomplete (`.searchSuggestions`, width 300px) + `:` emoji autocomplete (`.emojiSuggestions`, 6-column grid `50px ×6`). Sent id pattern `` `N_M_${messageCount}` ``.

Source: `DirectMessages.tsx`/`.module.scss`, `DirectMessageContact.tsx`/`.module.scss`, `DirectMessageConversation.tsx`, `DirectMessageContent.tsx`, `DirectMessagesComposer.tsx`, `translations.ts`, `palette.scss`.

---

## Profile page (desktop)

Source: `src/pages/ProfileDesktop.tsx`, `ProfileTabs/ProfileTabs.tsx` (stat strip + tabs), `ProfileSidebar/ProfileSidebar.tsx` (right rail), `translations.ts`, `VerificationCheck/{...}`. `Profile.tsx` branches: `isPhone()` → `ProfileMobile`, else `ProfileDesktop`.

### Vertical layout order (top → bottom)
1. **Banner** (full-width image)
2. **Avatar** (overlaps banner, left) + **action row** (right)
3. **Profile card**: name + verified badge, NIP-05 identity line + "Follows you" badge, bio, website, following/followers counts, joined date, "Followed by" avatars
4. **Stat strip = the tab bar** (6 tabs, each number + label)
5. **Tab content**

The card has two variants via `shortProfileAbout()`: `styles.smallAbout` (two columns: left name/nip05/bio/website, right following-followers/joined/followed-by) when bio short, `styles.bigAbout` when long. Same data either way.

### Banner + Avatar
- Banner: `<div id="profile_banner" class={styles.banner}>` wrapping `NoteImage`. Fallback: `<div class={styles.bannerPlaceholder}>` (solid block).
- Avatar: `<div class="styles.avatar">` with `<Avatar>` sized `xxl` desktop (`lg` mobile), overlapping the banner bottom.

### Action row (`styles.profileActions`) — order left→right
1. **Context menu** — `styles.contextArea` → `styles.contextIcon` ("…" `PrimalMenu` trigger).
2. **QR** — `styles.qrIcon`, `onClick → openProfileQr`.
3. **Zap** — `<Show when={!isCurrentUser()}>`, `styles.zapIcon`, `onClick → openCustomZapModal`.
4. **Message** — `<Show when={accountStore.publicKey}>`, `styles.messageIcon`.
5. **Follow** — `<FollowButton person={...} large={true} />`. Label **"Follow"** (`t.follow`) → **"Unfollow"** (`t.unfollow`) when followed (`ButtonFlip`).
6. **Edit Profile** — `<Show when={isCurrentUser()}>` → `styles.editProfileButton` text **"Edit Profile"** (`actions.editProfile`), shown only on your own profile *instead of* zap/message/follow.
Round icon-only buttons (`ButtonSecondary`) except Follow (pill) and Edit Profile (pill). Zap and Message hide on your own profile.

### Name + verified + identity (card)
- **Display name**: `<div class={styles.text}>{profileName()}</div>` in `styles.basicInfoName`. `profileName()` = displayName → name → truncated npub.
- **Verified badge**: `<Show when={nip05 && verification()}>` → `<VerificationCheck large={true}/>`. Small rounded badge: `background var(--accent)` (blue) with **white checkmark** (`.checkIcon` = `var(--text-primary-button)`). Legend/premium get a colored badge (gold/aqua/silver/purple/…); default = accent-blue check.
- **Premium/Legend badge**: `<PremiumCohortInfo>` after the name when `isVisibleLegend()`.
- **Identity / handle line** (`styles.nipLine`): NIP-05 via `<div class={styles.nip05}>{nip05Verification(...)}</div>`. This is the "@handle"-equivalent (e.g. `alice@example.com`). **No separate `@username` element and no visible npub string in the card** — identity = NIP-05 (npub is only a fallback inside `profileName()` / copied via context menu / QR).
- **"Follows you" badge**: `<Show when={isFollowingYou()}>` → `styles.followsBadge` text **"Follows you"** (`profile.followsYou`).

### Bio + website
- Bio: `styles.profileAboutHolder` → `<ProfileAbout about={...}/>`.
- Website: `<Show when={website}>` → `styles.website` → `<a href target="_blank">{sanitized website}</a>`.

### Card counts + joined + followed-by
Two clickable count buttons in `styles.followings`, each `<button class={styles.stats}>` with `styles.number` + `styles.label`:
- **following** — `follows_count`, label literal `following` (lowercase, hardcoded).
- **followers** — `followers_count`, label literal `followers` (lowercase, hardcoded).
Clicking opens `ProfileFollowModal`.
- **Joined date**: `styles.joined` → **"Joined Nostr on {date}"** (`profile.joinDate`, `{date}` = `shortDate(time_joined)`).
- **"Followed by"**: `<Show when={commonFollowers().length > 0}>` → `styles.commonFollows` with `styles.label` **"Followed by"** (literal, capital F) + a stack of overlapping nano avatars.

### Stat strip = the tab bar (`ProfileTabs.tsx`)
`<Tabs.List class={styles.profileTabs}>` with 6 `<Tabs.Trigger class={styles.profileTab}>`, each a big number (`styles.statNumber`, `humanizeNumber(...)`) over a label (`styles.statName`):

| # | value | number source | Label | translation id |
|---|-------|---------------|-------|----------------|
| 1 | `notes` | `note_count` | **Notes** | `profile.stats.notes` |
| 2 | `replies` | `reply_count` | **Replies** | `profile.stats.replies` |
| 3 | `reads` | `long_form_note_count` | **Reads** | `profile.stats.articles` |
| 4 | `media` | `media_count` | **Media** | `profile.gallery` |
| 5 | `zaps` | `total_zap_count` | **Zaps** | `profile.stats.zaps` |
| 6 | `relays` | `relay_count` | **Relays** | `profile.stats.relays` |

Killer detail: the tab **is** the stat — number-on-top-of-label; active tab has an underline indicator `styles.profileTabIndicator`; default active = URL hash (defaults to `notes`). Tab numbers use `humanizeNumber` (e.g. `1.2k`), while card following/followers use `.toLocaleString()` (full commas).

### Tab content
Each tab = `<Tabs.Content class={styles.tabContent} value="...">`: `reads`, `notes`, `replies`, `media`, `zaps`, `relays`. Empty states use `t.noNotes` / `t.noArticles` ("hasn't published any reads") / `t.noReplies` / `t.noFollowers`, templated with `{name}`.

### Right sidebar — `ProfileSidebar.tsx`
Each section has a `styles.headingTrending` caption, top→bottom:
1. **"Live Now"** — only if the profile is streaming (`LivePill`). Literal `Live Now`.
2. **"Latest Reads"** — `<Show when={articles?.length > 0}>`, caption `t.sidebarCaptionReads` = **"Latest Reads"**. List of `<ArticleShort shorter={true}>`.
3. **"Popular Notes"** — `<Show when={notes?.length > 0}>`, caption `t.sidebarCaptionNotes` = **"Popular Notes"**. List of `<SmallNote>`. If the profile also has articles, notes capped to `slice(0,5)`.
So the side panel is captioned **"Latest Reads"** and/or **"Popular Notes"** (not "Popular Reads").

### Reproduction gotchas
- Card identity line is NIP-05 only; do not invent a separate `@handle` or visible npub row.
- following/followers labels are **lowercase hardcoded literals**; tab labels are **Title Case** from translations.
- Verified check = accent-blue rounded badge with white check (default), not a Twitter-style outline.
- Own-profile view swaps zap/message/follow for the single **"Edit Profile"** pill; QR + context menu ("…") stay.

---

## Settings

Labels are verbatim `defaultMessage` strings from `translations.ts` (`settings` block). Menu order is literal JSX order in `src/pages/Settings/Menu.tsx`.

### Left settings menu — items in EXACT order
Each item = `<A href=…>` in `<div class={styles.subpageLinks}>` with a trailing `<div class={styles.chevron}></div>`:
1. **Account** → `/settings/account` (`Account`). Only `<Show when={accountStore.sec != undefined}>`. Renders a right-side badge bubble `<div class={styles.bubble}><div>{1}</div></div>`.
2. **Appearance** → `/settings/appearance` (`Appearance`). Always.
3. **Home Feeds** → `/settings/home_feeds` (`Home Feeds`). Always.
4. **Reads Feeds** → `/settings/reads_feeds` (`Reads Feeds`). Always.
5. **Media Uploads** → `/settings/uploads` (`Media Uploads`, id `settings.sections.blossom`). `hasPublicKey()` gated.
6. **Muted Content** → `/settings/muted` (`Muted Content`). `hasPublicKey()` gated.
7. **Content Moderation** → `/settings/filters` (`Content Moderation`, id `settings.filters.title`). `hasPublicKey()` gated.
8. **Connected Wallets** → `/settings/nwc` (`Connected Wallets`). `hasPublicKey()` gated.
9. **Notifications** → `/settings/notifications` (`Notifications`). `hasPublicKey()` gated.
10. **Dev Tools** → `/settings/devtools` (`Dev Tools`, id `settings.sections.devTools`). Always.
11. **Network** → `/settings/network` (`Network`). Always.
12. **Zaps** → `/settings/zaps` (`Zaps`, id `settings.sections.zaps`). `hasPublicKey()` gated.

Correction: current `main` has NO "Uploaded Media" or "Zap Tools" items; the upload item is **"Media Uploads"**. For a guest (no key) only Appearance / Home Feeds / Reads Feeds / Dev Tools / Network appear — but reproduce the full logged-in list.

### Menu footer + version string
In `<div class={styles.settingsMenuFooter}>`:
- A **Logout** button (`ButtonPrimary`, `actions.logout`) shown only when `accountStore.publicKey && !['none','guest'].includes(accountStore.loginType)`; else an empty `<div>`.
- Version block:
```jsx
<div class={styles.webVersion}>
  <div class={styles.title}>Version</div>
  <div class={styles.value}>{version}</div>
</div>
```
`const version = import.meta.env.PRIMAL_VERSION;`. Injected at build (`vite.config.ts`: `'import.meta.env.PRIMAL_VERSION': JSON.stringify(packageJson.version)`) → equals `package.json` → `"version"`. Current `main` is `"3.0.101"`; the recording's **"2.0.19"** is the app version at record time. For the reproduction, render **"Version"** above **"2.0.19"** to match the recording.

### Appearance screen — `src/pages/Settings/Appearance.tsx`
- Breadcrumb: `Settings` (→ `/settings`) + `:` + `Appearance`.
- Section caption `t.appearance.caption` = **"Select a theme"**.
- `<ThemeChooser />` then two checkboxes:
  - `Show Animations` (literal), default checked (`settings.isAnimated ?? true`).
  - `Automatically set Dark or Light mode based on your system settings` (literal), default unchecked (`settings.useSystemTheme ?? false`).
- **Theme names** — `ThemeChooser` iterates `settings?.themes` (= `themes` in `constants.ts`). Only TWO active:
  - `{ name: 'midnight', label: 'midnight wave', dark: true }` — **"midnight wave"** (dark, default).
  - `{ name: 'ice', label: 'ice wave' }` — **"ice wave"** (light).
  - Commented-out (do NOT render): `sunset` / "sunset wave", `sunrise` / "sunrise wave". Legacy mapping: stored `sunset` → `midnight`, `sunrise` → `ice`. Each option shows its `label` + swatch/logo (`logoIce` for both live themes); selected when `checkedTheme().name === theme.name`.

### Network screen — `src/pages/Settings/Network.tsx`
Breadcrumb: `Settings : Network`. Two sections:
**1. Caching Service** — caption `t.network.cachingService` = **"Caching Service"**.
- Sub-caption **"Connected caching service"** (`connectedCachingService`) + `HelpTip`.
- One row: green `styles.connected` dot (or `styles.disconnected`) + `styles.webIcon` globe + the URL `{socket()?.url}`.
- Second caption **"Connect to a different caching service"** (`alternativeCachingService`).
- A `styles.relayInput` row (globe + text input, placeholder `placeholders.cachingServiceUrl`, connect button with `styles.connectIcon`). Invalid → `errors.invalidRelayUrl`.
- `ButtonLink` restore = `actions.restoreCachingService`. Validation requires `wss://` or `ws://`.

**2. Relays** — caption `t.network.relays` = **"Relays"**; sub-caption **"My relays"** (`myRelays`).
- `<For each={relays()}>` → each a `<button class={styles.relayItem}>`: status dot (`suspended` if `proxyThroughPrimal`, else `connected` if `isConnected(relay)`, else `disconnected`), globe, relay URL, right-side **"Remove"** (`actions.removeRelay`) → `ConfirmModal`.
- Empty fallback `t.network.noMyRelays`: "Your Nostr account doesn't have any relays specified, so we connected you to a default set of relays…".
- Checkbox (if Primal priority relay not in settings): `Post a copy of all content to the Primal relay (${import.meta.env.PRIMAL_PRIORITY_RELAYS})`.
- `ButtonLink` reset = `actions.resetRelays` + HelpTip.
- Second caption **"Connect to relay"** (`customRelay`) with another `styles.relayInput` (placeholder `placeholders.relayUrl`).
- Final checkbox + label **"Use Enhanced Privacy"** (`proxyEvents`) with description `t.network.proxyDescription`: "When enabled, your IP address will be visible to the caching service, but not to relays…".

### Right rail (StickySidebar) — `SettingsSidebar.tsx`
Not the left menu. Heading `t.relays` = **"Relays"**, then connected relays (green dot / `suspended` if proxying) then disconnected (grey dot), URLs from `accountStore.relaySettings` split by `activeRelays`. Then heading `t.cashingService` = **"Caching services"**, one row: connected/disconnected dot + `socket()?.url || cacheServer`.

### Killer details
- Left rows = text label + right-aligned chevron; Account (if present) adds a small round badge bubble "1".
- Footer: **"Version"** small-caps title over value **"2.0.19"** (hardcode for the recording); optional Logout button above.
- Appearance theme names are lowercase: **"midnight wave"** (dark, default) and **"ice wave"** (light). Only these two.
- Network status dots: green = connected, grey = disconnected, amber/`suspended` = proxying through Primal.

Source: `Settings/Menu.tsx`, `Settings/Appearance.tsx`, `Settings/Network.tsx`, `SettingsSidebar/SettingsSidebar.tsx`, `ThemeChooser/ThemeChooser.tsx`, `constants.ts` (themes), `translations.ts`, `vite.config.ts`, `package.json`.

---

## Reads (long-form / kind 30023)

### Page shell — `src/pages/Reads.tsx`
Three-column desktop (search rail via `Wormhole` → main feed → `StickySidebar`), two-column on phone. Feed = list of article cards, skeletons while loading, empty state, bottom `Paginator`.
- Desktop card: `ArticlePreview` — `src/components/ArticlePreview/ArticlePreview.tsx`
- Phone card: `ArticlePreviewPhone`
- Header: `ReadsHeader` (with new-posts notification), or a topic header prefixed with literal label **`topic:`**
- Sidebar: `ReadsSidebar`
- Skeletons: `ArticlePreviewSkeleton`, `ArticlePreviewPhoneSkeleton`

### Feed card (desktop) — `ArticlePreview.tsx` + `.module.scss`
DOM order:
```
.article
├─ .upRightFloater → <NoteContextTrigger/>   (unless hideContext)
├─ .header
│  ├─ .userInfo → <Avatar/> · .userName · <VerificationCheck/> · .nip05
│  └─ .time                                    (shortDate(article.published))
├─ .body                                       (2-col: text left, image right)
│  ├─ .text
│  │  ├─ .content → .title · .summary
│  │  └─ .tags → .estimate · <For tag×3> .tag · .tag("+ N")
│  └─ .image → <img>                           (article.image, else reads_image_*.png)
├─ .zaps → <NoteTopZapsCompact/>               (only if topZaps.length > 0)
└─ .footer → <ArticleFooter/>                  (unless hideFooter)
```
- **Killer detail — reading time label:** the string is **`{N} minute read`**, NOT "min read":
  ```jsx
  <div class={styles.estimate}>{Math.ceil(props.article.wordCount / wordsPerMinute)} minute read</div>
  ```
  `wordsPerMinute = 238;` (`constants.ts`) → minutes = `ceil(wordCount / 238)`, e.g. `5 minute read`.
- **Tag overflow** (only when `tags.length > 3`, first 3 shown): literal `+ {tags.length - 3}` (e.g. `+ 2`).
- **Date:** `shortDate(article.published)` in `.time`.

Styling (`ArticlePreview.module.scss`):
- `.article` — `display:flex; flex-direction:column; padding-inline:20px; padding-bottom:16px; border-bottom:1px solid var(--devider); border-radius:var(--border-radius-small)` (radius only when `.bordered`)
- `.article .image` — `min/max-width:175px; min/max-height:125px; border-radius:8px` (thumbnail right-side, fixed 175×125)
- `.title` — `font-size:24px; font-weight:700; color:var(--text-primary); -webkit-line-clamp:3`
- `.summary` — `font-size:15px; font-weight:400; color:var(--brand-text); -webkit-line-clamp:2; word-break:break-word`
- `.userName` — `font-size:14px; font-weight:700; color:var(--text-secondary); font-family:Nacelle`
- `.time` — `font-size:14px; font-weight:400; color:var(--text-tertiary)`; `content:'• '` bullet prefix
- `.tag` — `12px/400; color:var(--text-secondary); background-color:var(--background-input); padding:6px 10px; border-radius:12px`
- `.estimate` — `12px/600; color:var(--text-secondary); border:1px solid var(--subtile-devider); padding:6px 10px; border-radius:12px` (pill, **outlined not filled**; sits in `.tags` before the tags)
- Other variants: `.articleCompact` (grid `200px 1fr`, height 148px, image `200×148` radius `8px 0 0 8px`), `.articleShort` (image `80×56`), `.articleSuggestion` (`background:var(--background-header-input); border:1px solid var(--background-input); border-radius:8px`).

### Feed card (phone) — `ArticlePreviewPhone.tsx`
Vertical stack — image goes **below** the title. `.articlePhone`: `flex-direction:column; padding-inline:20px; padding-bottom:16px; border-bottom:1px solid var(--devider)`. `.articlePhone .image`: `min/max-width:100px; min/max-height:72px; border-radius:8px`. Order: `.header` → `.body`(`.text`→`.title` then `.image`) → `.stats`(`.estimate` + comments + zaps) → `.footer`. Reading-time identical `{N} minute read`; comments label `{Math.ceil(replies)} comments`.

### Article reader — `src/pages/Longform.tsx` + `.module.scss`
Render order:
1. `.header` — author row: `<Avatar/>` · `.userInfo`(`.userName` · `<VerificationCheck/>` · `.nip05`)
2. `.topBar` — `.time` (publish date) · `.client` (**`via {client}`**) · `.right`(`<BookmarkArticle/>` · `<NoteContextTrigger/>`)
3. `.title` — headline
4. `.image` — full-width hero via `<NoteImage/>` (PhotoSwipe lightbox), optional
5. `.summary` — `.border` (vertical rule) + `.text` (summary copy)
6. `<NoteTopZaps/>` — top-zap avatars/amounts
7. Body — `<PrimalMarkdown/>` (markdown, highlight support)
8. `.tags` — `.tag` links
9. `.footer` — `<ArticleFooter/>` (reply / repost / zap / like)
10. Reply composer (`ReplyToNote`/`ReplyToHighlight`) + replies thread (`<Note/>`, `<UserPoll/>`, `<ZapPoll/>`)
- Right sidebar: `ArticleSidebar` (or `ArticleHighlightComments` in highlight mode).
- Error fallback label: **`Read not found`**.

Styling (`Longform.module.scss`):
- `.longform` — `flex-direction:column; gap:20px; margin-bottom:22px; margin-inline:20px`
- `.title` — `color:var(--text-primary); font-size:44px; font-weight:700; line-height:120%` (much larger than the 24px card title)
- `.header` — `justify-content:space-between; align-items:center; padding:20px; height:85px; border-bottom:1px solid var(--devider)`
- `.userName` — `color:var(--text-primary); 14px/700`
- `.nip05` — `color:var(--text-tertiary); 14px/400/14px`
- `.topBar` — `justify-content:space-between; align-items:center; min-height:18px; margin-top:18px; padding-inline:20px`
- `.time` — `color:var(--text-tertiary); 14px/700`
- `.client` — `color:var(--text-tertiary); 14px/700; max-width:80%`; `::before { content:'• ' }`
- `.summary` — `display:flex; gap:12px`
- `.border` — `display:block; min-width:4px; border-radius:2px; background-color:var(--subtile-devider)` (left accent bar on the summary block)
- `.text` — `color:var(--text-primary); 16px/400/22px`
- `.image` — `width:100%; object-fit:contain; border-radius:12px; overflow:hidden`
- `.tag` — `display:inline-block; color:var(--text-secondary); 12px/400/12px; background-color:var(--background-input); padding:6px 10px; border-radius:12px; margin-block:4px; margin-right:6px`

Reproduction cheat-sheet:
- Reading-time pill: outlined (not filled), 600 weight, 12px, text = `⌈words/238⌉ minute read`.
- Card thumbnail: fixed 175×125, 8px radius, right of the text column.
- Card title 24px/700; reader title 44px/700 line-height 120%.
- Summary uses `--brand-text` (not primary), 2-line clamp on card.
- Time gets a `•` bullet prefix via `::before` (card + reader).
- Reader date row: `via {client}` attribution with its own `•` prefix, bold 14px.
- Tag pills everywhere: 12px, `background:var(--background-input)`, `border-radius:12px`, `padding:6px 10px`.

Note: `--border-radius-small` (referenced by `.article.bordered`) is not defined in `palette.scss` (a global elsewhere).

Source: `Reads.tsx`, `ArticlePreview/{ArticlePreview.tsx,.module.scss,ArticlePreviewPhone.tsx}`, `Longform.tsx`/`.module.scss`, `constants.ts` (`wordsPerMinute = 238`), `palette.scss`.

---

## Killer fidelity details

- **Default = Midnight dark, OLED black `#000000`, accent BLUE `#2394EF`** — not the legacy magenta (which is commented out and re-aliased to blue). Cards are borderless-on-black, separated by `--devider` (`#222222`) hairlines.
- **Action bar order is `reply → zap → like → repost → bookmark`** (zap is 2nd, before like); zap shows **sats** not zap-count. The **default "like" is a heart** (`feed_like.svg`).
- **Action colors are per-state, and "liked" stays magenta-pink `#f800c1`** even though the whole accent is blue: zap amber `#ffa02f`, repost green `#66e205`, bookmark blue `#0C7DD8`, reply grey `#cccccc`.
- **The logo is the cyan→blue circular swirl + lowercase "primal"** (gradient `#00E0FF → #0090F8 → #2554ED`), and the signature brand gradient is cyan→purple `#14B9FF → #690DFF` (128deg) — used on the Post button.
- **Home has no tabs — a "Notes Feed:" dropdown** (default "Trending 24h", with an "Edit Feeds" link), not a Trending/Latest segmented control.
- **Primal-verified badge = blue rounded check with a white tick** (`purple_check.svg` mask filled `var(--accent)`), distinct from the grey generic-nip05 badge; Legends get gold/aqua/silver/purple gradient rings.
- **Small-note "|" separator and card "•" prefixes are CSS pseudo-elements**, and relative times use `Intl.RelativeTimeFormat` short style → abbreviated units (`23 hr.`, `5 min.`, `1 yr.`).
- **Reading-time label is `{N} minute read`** (⌈words/238⌉), rendered as an **outlined** pill — not a filled tag, not "min read".
- **DM bubbles are blue (`#2394EF`) for your own messages** with a notch toward the avatar; the unread indicator is a **blue numeric count badge**, not a dot; own-bubble accent uses `--accent`, not the unused `--accent-dm`.
- **Nacelle everywhere (no weight-500 face; jumps 400→600); author names are the only bold element in a note header**; "primal" wordmark is the sole Roboto Black text.
- **Notifications group multiple actors into one row** (max 6 avatars + `+N` chip, sorted by follower count) and zaps render "zapped your note for a total of N sats".
