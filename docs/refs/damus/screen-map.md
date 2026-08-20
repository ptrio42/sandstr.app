# Damus iOS — Ground-Truth Reproduction Spec

Authoritative spec for a faithful React/Tailwind web reproduction of the Damus iOS Nostr client. Merged from source recon of `damus-io/damus@master` (verified 2026-07-14). Convention: **repo wins for exact HEX + icon/label names; a 2026 screen recording wins for LAYOUT.** Divergences flagged with **[REC vs REPO]**.

---

## 1. Color tokens

Asset-catalog colors are adaptive (light / dark). Inline-Swift colors are single-value (no dark variant). `—` = no separate dark value.

| Token (Swift) | Asset | Light | Dark | Notes |
|---|---|---|---|---|
| `purple` | `DamusPurple` | `#CC43C5` | — | secondary UI accent; FAB + tab-underline gradient partner |
| `deepPurple` | `DamusDeepPurple` | `#BF26ED` | — | |
| `blue` | `DamusBlue` | `#4B4DFF` | — | gradient partner only, never standalone accent |
| `green` | `DamusGreen` | `#66C34F` | — | repost active |
| `bitcoin` | `Bitcoin` | `#F7931A` | — | |
| `yellow` | `DamusYellow` | `#FADF05` | — | |
| `brown` | `DamusBrown` | `#BE5F00` | — | |
| `gold` | inline | `#E2A800` | — | |
| `pink` | inline | `#D34CD9` | — | **== gradient stop 1**; the single flat-accent fallback |
| `lighterPink` | inline | `#F869B6` | — | **== gradient stop 2** |
| `lightBackgroundPink` | inline | `#F8E7F8` | — | |
| `white` | `DamusWhite` | `#FFFFFF` | — | |
| `black` | `DamusBlack` | `#000000` | — | |
| `lightGrey` | `DamusLightGrey` | `#EEEEF4` | — | |
| `mediumGrey` | `DamusMediumGrey` | `#5F5F5F` | — | @handle text |
| `darkGrey` | `DamusDarkGrey` | `#1C1C1E` | — | scrim base (`.opacity(0.6)`) |
| `adaptableGrey` | `DamusAdaptableGrey` | `#EEEEF4` | `#1C1C1E` | |
| `adaptableGrey2` | `DamusAdaptableGrey 2` | `#D1D1D7` | `#111113` | |
| `adaptableLighterGrey` | `DamusAdaptableLighterGrey` | `#F3F3F9` | `#222225` | |
| `adaptableBlack` | `DamusAdaptableBlack` | `#000000` | `#FFFFFF` | primary text |
| `adaptableWhite` | `DamusAdaptableWhite` | `#FFFFFF` | `#000000` | panel/tab-bar bg |
| `neutral1` | `DamusNeutral1` | `#F9FAFA` | `#202224` | chip fill |
| `neutral3` | `DamusNeutral3` | `#DDE1E3` | `#23262A` | chip border; segmented-pill track |
| `neutral6` | `DamusNeutral6` | `#4A5359` | `#6A7A85` | login title/subtitle text |
| `success` | `DamusSuccessPrimary` | `#04AB5A` | `#03BF64` | relay "Online" text |
| `successQuaternary` | asset | `#E8F7F0` | `#0A331F` | relay "Online" bg |
| `successBorder` | asset | `#D6F1E4` | `#125C38` | |
| `warning` | `DamusWarningPrimary` | `#F9AD1C` | `#FCB52C` | relay "Connecting" text |
| `warningQuaternary` | asset | `#FEF4E1` | `#33250A` | relay "Connecting" bg |
| `warningBorder` | asset | `#FEEED1` | `#5C4312` | |
| `danger` | `DamusDangerPrimary` | `#F51163` | `#F8206E` | relay "Error" — magenta-pink, NOT red |
| `dangerQuaternary` | asset | `#F7E8EE` | `#8B0435` | relay "Error" bg |
| `dangerBorder` | asset | `#F7D7E3` | `#611320` | |

**THE accent → the `PinkGradient`.** `#D34CD9 → #F869B6`, `startPoint .topTrailing → endPoint .bottom`. Used on every primary CTA, wallet balance, search header, profile-pic ring, app-notification bg. If forced to one flat color, use the purple stop `#D34CD9`. Damus's identity is **magenta/purple→pink**, not blue.

**Other gradients**

| Gradient | Stops | Direction | Use |
|---|---|---|---|
| **PinkGradient** (signature) | `#D34CD9 → #F869B6` | topTrailing → bottom | all primary CTAs, wallet, search, PFP ring |
| **LINEAR_GRADIENT** | `#CC43C5 → #4B4DFF` (purple→blue) | topTrailing → bottomTrailing | compose FAB fill; liked-shaka mask; tab-underline |
| **RECTANGLE_GRADIENT** | `#CC43C5 → #4B4DFF` | leading → trailing | selected-tab underline bar (h 2.5, radius 2.5) |
| **DamusGradient** (splash) | `#1C55FF → #7F35AB → #FF0BD6` | bottomLeading → topTrailing | onboarding splash, QR, app-icon bg |
| **DamusLogoGradient** | `#30B3F1 → #C539F9` (cyan→magenta) | leading → trailing | logo gem tint + login title text |
| **GrayGradient** | `#F9FAFA` (solid) | leading → trailing | unfollowed follow-button fill |

---

## 2. Bottom nav

**4-tab bar. No center compose tab.** Order left→right, all custom bundled SVG assets (not SF Symbols). Selected variant = base name + `.fill`. Active icon tinted with accent; 8×8 accent dot overlaid when unread.

| # | Timeline | Icon (unselected → selected) | Kbd |
|---|---|---|---|
| 1 | `.home` | `home` → `home.fill` | 1 |
| 2 | `.dms` | `messages` → `messages.fill` | 2 |
| 3 | `.search` | `search` → `search.fill` | 3 |
| 4 | `.notifications` | `notification-bell` → `notification-bell.fill` | 4 |

Bar sits on `adaptableWhite` bg above a top `Divider()`, mounted as bottom overlay. Both bar and FAB fade toward ~0.35 opacity on home-feed scroll.

**Compose FAB** — separate floating circular button, `plus` glyph, NOT a tab:
- Size 57 circle, filled **LINEAR_GRADIENT** (`#CC43C5 → #4B4DFF`), **rotated 20°**, drop shadow, white `plus` glyph centered.
- Pinned **bottom-right** (bottom-left in left-handed mode; default right), lifted above the tab bar. Only when logged in with a privkey.

---

## 3. Note action bar

Five icons, local asset images (20×20), all **gray** default. Order left→right, each preceded by a spacer:

**reply → repost → like(shaka) → zap → share**

| # | Button | Asset (default → active) | Default | Active color |
|---|---|---|---|---|
| 1 | Reply | `bubble2` | gray | `purple #CC43C5` (icon + count) |
| 2 | Repost | `repost` | gray | `green #66C34F` (icon + count) |
| 3 | Like | `shaka` → `shaka.fill` | gray | LINEAR_GRADIENT purple→blue mask (icon + count) |
| 4 | Zap | `zap` → `zap.fill` | gray | **orange** ("always orange") |
| 5 | Share | `upload` | gray | (no active state) |

- Trailing count `Text` per button, hidden when 0.
- Conditionals: Reply only with privkey; Like hidden in onlyzaps mode; Zap only if author has LNURL.
- **Default like emoji = shaka `🤙`** (`default_emoji_reaction`). Rendered as the `shaka.fill` asset gradient-masked, not a text glyph. Any *other* chosen reaction renders as its text emoji. Reaction palette: `🤣 🤙 ⚡ 💜 🔥 😀 😃 😄 🥶`.

---

## 4. Home header + tabs

- **Leading:** 32pt round PFP of logged-in user → opens side menu (not profile).
- **Center (principal):** bold `Text` title = `timeline_name(selected)`. Home = the localized home label; optional `.caption` subtitle below.
- **Trailing:** `SignalView` relay signal bars (see §6/§7).
- **Notes / Notes & Replies picker:** the `CustomPicker` — heavy 14pt labels, active label black/white, inactive gray; active underline = **RECTANGLE_GRADIENT** purple→blue bar (h 2.5, radius 2.5) animated via `matchedGeometryEffect`; 1px `Divider` under the row.
- Feed is a `TabView`; the FAB is a `ZStack` layer above it.

**[REC vs REPO]** Confirm the exact two picker labels against the recording (repo uses `CustomPicker` tabs; classic Damus reads "Notes" / "Notes & Replies"). Match the recording's label casing/wording for layout.

---

## 5. Side menu (drawer)

- **Width:** `min(screenWidth * 0.65, 400)`. Slides in from left. Panel bg `adaptableWhite`; scrim `darkGrey @0.6`, tap-to-dismiss. Item vertical spacing 25.
- **Header** (`TopProfile`, whole header is a NavigationLink to Profile):
  - Row 1: 50pt circular PFP left; `Spacer`; two round buttons in `neutral3` circles — **status** (`add-reaction`, 25×25, opens user-status sheet) then **QR** (`qr-code`, 25×25, opens QR sheet).
  - Row 2: display name (`.title2.bold`, `adaptableBlack`); `@handle` (`.body`, `mediumGrey`); **npub pill** (`PubkeyView sidemenu:true`) — abbrev npub 12 chars @ 10pt, `copy2` button 15×15 → swaps to green `check-circle` + "Copied" for 3s, pill bg `adaptableGrey`/`neutral1`, radius 11.
- **Rows** (`navLabel`: `HStack(spacing:20)` of `Image.tint(adaptableBlack)` + `Text .title2.semibold adaptableBlack`, 1 line autoscaling):

| # | Label | Icon | Target | Condition |
|---|---|---|---|---|
| 1 | Profile | `user` | Profile | always |
| 2 | Wallet | `wallet` | Wallet | always |
| 3 | **Purple** | `damus-dark-logo` (ostrich) | DamusPurpleView | if `enable_purple` |
| 4 | **Labs** | SF `flask` (bold) | DamusLabsView | always |
| 5 | Live | `record` | LiveEvents | if `settings.live` |
| 6 | Muted | `mute` | MuteList | always |
| 7 | Relays | `world-relays` | RelayConfig | always |
| 8 | Bookmarks | `bookmark` | Bookmarks | always |
| 9 | Merch | `shop` | external `store.damus.io` | always |
| 10 | Settings | `settings` | Config | always |
| 11 | Logout | `logout` | Button (confirm alert if privkey) | always |

- **Purple** is bespoke: gradient-bordered ostrich logo (25×25, radius 7) + **"Purple" text filled `#F869B6 → #BF26ED`** (lighterPink→deepPurple, bottomLeading→topTrailing). The one non-monochrome row.
- Merch is the only external `Link`. Logout: immediate if pubkey-only; else destructive confirm alert.

---

## 6. Universe / Search

Header chrome lives in `ContentView` toolbar; body in `SearchHomeView`. **Two visual header rows can appear** (nav bar + pinned search pill).

- **Title:** `Universe 🛸` (UFO literally in the string), bold, principal slot.
- **Leading:** 32pt PFP → toggles side menu.
- **Trailing:** `SignalView` (bars) + **funnel** `filter` icon (gray, search-timeline only) → opens `.filter` sheet.
- **Search field** (pinned top via `safeAreaInset`, `Divider` under): leading gray `search` icon + `TextField` placeholder **"Search..."**; pill = `padding 10`, bg `.secondary @0.2`, radius 20. **Cancel** (accent-color text) appears only when non-empty.
- **Empty state:** NOT results — a "Follow Packs" section (pink `sparkles` icon) + "All recent notes" (`notes.fill` icon) over a global feed.
- **Typing a word → `.multi`:** two neutral outlined pills side by side — `[ #tag ]` and `[ Search word: … ]` (both `neutral1` fill, `neutral3` 1px stroke, radius 20, `padding h15 v5`) — then profile rows.
- **User result row** (`FollowUserView`): PFP + name (tap → profile) on left; **Follow pill** on right — fixed 105×30, `.caption.bold`, radius 20, **monochrome** (black/white/grey). Filled only in the follows state; outline otherwise. Labels: `Follow` / `Follow Back` (if they follow you) / `Unfollow` / transient `Following...` / `Unfollowing...`.

**[REC vs REPO]** Relay indicator: current master renders **4 signal bars** (`num_bars 4`, `bar_heights [4,7,10,13]`, red→green), shown only when `signal < max`. The literal **"N/M" text** survives only as the a11y label. If the recording shows the classic "N/M" badge, use it for layout (e.g. "8/10").

### 6a. `.filter` sheet — "see one relay's feed"

Reconned 2026-08-17 from `v1.17` source, because the recording shows the funnel but
never opens it. Present in **both** the recorded build (**1.11 (10)**, `38dc7b04`, version
string visible in Settings → VERSION, frame `shots/full/t_040.jpg`) and `v1.17`, so this is
not a version-specific surface. This is what people mean by browsing a relay's feed: there
is no per-relay timeline screen, you narrow the CURRENT feed down to one relay.

- **Opened from:** §6 trailing funnel — `Button { present_sheet(.filter) }` wrapping
  `Image("filter")` with `.foregroundColor(.gray)`. Sits right of `SignalView`.
  Search-timeline only. (`ContentView.swift`)
- **Presentation:** sheet, **`.presentationDetents([.height(550)])`**,
  `.presentationDragIndicator(.visible)`. So: a mid-height sheet with a visible grabber,
  NOT a full screen and NOT a push.
- **Body** (`RelayFilterView(state:timeline:)`), in order:
  1. Instruction `Text` — verbatim **"Please choose relays from the list below to filter the current feed:"**, standard padding + **20pt top, 0 bottom**.
  2. `List` of `RelayToggle`, one per relay, sourced from `state.nostrNetwork.ourRelayDescriptors`, **no explicit sort** — list order is whatever the pool hands back, i.e. the same order as My Relays.
- **`RelayToggle` row**, left to right: optional relay status indicator · paid-relay badge
  (`RelayType`) · `Toggle` whose label is the relay's **full URL**
  (`relay_id.absoluteString`, e.g. `wss://relay.example.com` — NOT the bare host used in §8 rows,
  and no truncation logic in the component). `SwitchToggleStyle` tinted `.accentColor`.
- **Toggle semantics are INVERTED against the name.** ON = relay is **not** filtered, i.e.
  its notes show. OFF = relay is filtered **out**. Writing it the other way round is the
  obvious bug here. Backed by `state.relay_filters`, keyed **per timeline**.
- **Prerequisite:** a relay only appears here once it is in your list, so the honest
  walkthrough starts at §8 "Add relay" — not at the funnel.

**Not to be confused with `RelayDetailView`** (§8, relay row → push): that screen is NIP-11
metadata only — description, admin, software, supported NIPs, Connect/Disconnect. It has
**no feed and no button that opens one**. A "browse this relay" demo that lands there is
pointing at the wrong screen.

---

## 7. Notifications

Body in `NotificationsView`; header in `ContentView` toolbar.

- **Title:** `Notifications`, bold. **Subtitle is dynamic** = trusted-network state: **"All"** (filter off) or **"Trusted Network"** (on). Not a relay count; appears only when set.
- **Leading:** 32pt PFP → opens side menu.
- **Trailing toolbar (order):** gear first, then trusted-network button.
  - **Gear:** SF `gearshape` (NOT `gear`), 24×24, gray → NotificationSettings.
  - **Friend-filter** (`TrustedNetworkButton`, conditional — only if some notes would be hidden): a **network/shield** glyph, NOT person-check. Off (`.all`) = SF `network.slash` gray; On (`.friends_of_friends`) = SF `network.badge.shield.half.filled` LINEAR_GRADIENT-masked. 24×24.
  - **Relay signal:** same `SignalView` bars, only when `signal < max`, links to RelayConfig; a11y label `X/Y relays connected`. No numeric badge.
- **Tabs:** `CustomPicker` — **All → Zaps → Mentions** (3 tabs; third's internal enum is `.replies`). Heavy-14pt labels, active black/white + inactive gray, purple→blue gradient underline, 1px divider under.
- **Rows** (grouped per target note): reactions/reposts/zaps aggregate into one row; replies ungrouped, sorted by recency.
  - Reply → standard `EventView` note card (same as timeline), links to Thread.
  - Grouped row: left icon column — repost = `repost` green; reaction = `shaka.fill` gradient-masked (20×20); zap = `zap.fill` orange + abbreviated msat total (orange) below. Right: row of reactor avatars, then summary line ("Alice", "Alice & Bob", "Alice & N others"), then reused target-note body in gray → Thread.

---

## 8. Relays screen

- **Nav bar:** small centered title **"Relays"** (`.inline`), custom back chevron (`BackNav`) leading. Trailing **Edit/Done** toggle — only when logged-in + on My Relays tab; Edit reveals per-row red minus buttons.
- **Big title inside body:** `Text` **32pt bold** — "My Relays" / "Recommended". Right of it: **"Add relay"** neutral button (padding 10) → `AddRelayView` sheet (`.presentationDetents [.height(300)]`).
- **Relay row** (`HStack`, tap → RelayDetail):
  - (Edit mode, My Relays only) red `minus-circle` 20×20.
  - **Avatar:** `RelayPicView` **size 55**, **rounded square (radius 15)**, gray 0.5pt stroke. Favicon hotlink — **CSP-unsafe**; reproduce the fallback: **first letter of host, uppercased, 40pt bold** on the tile ("R" if none).
  - Text: name `.headline` 1-line (+ paid badge, `tor` icon if `.onion`); url `.subheadline` gray 1-line (full `wss://…`).
  - `Spacer`. Right side: **My Relays** = status pill + gray `chevron-large-right` 15×15; **Recommended** = "Add" capsule, or dimmed "Added".
- **Status pill** (`RelayStatusView`, height 20, radius 20, `padding h10`, `.caption`, 1px border):

| State | Condition | Label | Text | Bg | Border |
|---|---|---|---|---|---|
| Connecting | `isConnecting` | "Connecting" | `warning` | `warningQuaternary` | `warningBorder` |
| Online | `isConnected` | "Online" | `success` | `successQuaternary` | `successBorder` |
| Error | else | "Error" | `danger` | `dangerQuaternary` | `dangerBorder` |

- **Segmented control** — custom pill floating **bottom** (not native `Picker`): container 235×35, bg `neutral3` (`#DDE1E3`/`#23262A`), radius 30. Two 110×30 items, radius 30: **active** bg `adaptableWhite @0.9` + 12pt bold `adaptableBlack`; **inactive** clear + 12pt regular `adaptableBlack @0.7`. Titles **"My Relays" / "Recommended"**.

---

## 9. Compose

- Opened by the FAB (`active_sheet = .post`), presented as a **sheet**.
- Post button style: primary CTA uses **GradientButtonStyle** = rounded-rect radius 12 filled **PinkGradient** (`#D34CD9 → #F869B6`), white semibold, padding 16, press-scale 0.95.

**[REC vs REPO]** Compose sheet internal layout (avatar, text area, media/attachment row, character/relay controls) was not captured in repo detail here — take the field arrangement from the recording; keep the CTA styling above.

---

## 10. Logo geometry + gradient (for SVG)

- **Asset:** `Image("logo-nobg")` = 1024×1024 transparent faceted gem (onboarding). App-icon variant adds a thick white outline + `DamusGradient` bg — do NOT use for inline logo.
- **Shape:** low-poly triangulated "gem" in a **sideways teardrop / play-button silhouette pointing right** — asymmetric shard, not a symmetric diamond. On a ~1024 viewBox, gem occupies x≈130→900, y≈60→960:
  - Left edge: near-straight, slightly convex vertical (top-left ~150,70 → bottom-left ~230,900).
  - Top edge: slants down-right to a **sharp right apex** ~900,210.
  - Right point: single sharp vertex; below it a convex rounded belly curving back down-left.
  - Bottom edge: long convex curve — rounded bulging bottom (teardrop feel), not a flat base.
- **Facets:** ~14–18 irregular triangles. Central hub vertex ~380,360 with edges radiating out; a few secondary junctions. Facet seams rendered as **thin white/negative-space gaps** (~2–4px on 1024).
- **Coloring:** per-facet sample of **DamusLogoGradient `#30B3F1 → #C539F9`** (leading→trailing). Left facets cyan `#30B3F1` (lighter/whiter top-left), middle periwinkle blend, right-apex facets vivid magenta `#C539F9` deepening near the tip.
- **To reproduce:** draw the teardrop/play silhouette, place ~5–6 outer boundary points + 2 interior junctions, triangulate to ~15 faces, stroke each edge white, fill by x-sampled horizontal gradient.

---

## 11. Login / onboarding

Background on all onboarding: `DamusBackground` = faint `login-header` diagonal gradient-stroke lines (~0.7 opacity) at the top.

**SetupView (welcome / choose):** centered VStack, top→bottom:
1. Logo `logo-nobg` **56×56**, `.shadow(color: purple #CC43C5, radius 2)`.
2. Title **"Welcome to Damus"** — filled **DamusLogoGradient** (`#30B3F1 → #C539F9`) text, large bold.
3. Subtitle **"The social network you control"** — `neutral6`.
4. **"Create Account"** button — GradientButtonStyle → CreateAccount.
5. **"Sign In"** button — GradientButtonStyle → Login.
6. EULA line **"By continuing, you agree to our EULA"** — subheadline `neutral6`, tappable.

**LoginView (sign in with key):**
1. `SignInHeader`: `logo-nobg` 56×56 purple shadow, then title **"Sign in"** (32pt bold `neutral6`).
2. Key input: `SecureField` monospaced, placeholder **"nsec1…"**, no autocap/autocorrect, `.password`. Accepts nsec / npub / hex / NIP-05. Trailing accessories: **Paste** (SF `doc.on.clipboard`) + **QR scan** (SF `qrcode.viewfinder`).
3. Inline error/warning on invalid key.
4. **"Login"** button — GradientButtonStyle.
5. Bottom **"Create account"** link → CreateAccount.

**Button style (all CTAs — GradientButtonStyle):** rounded-rect radius 12, **PinkGradient `#D34CD9 → #F869B6`** fill, white semibold, padding 16, full-width, press-scale 0.95. Note: the "purple" in Damus branding is the *logo shadow* (`#CC43C5`) and *title gradient* (`#30B3F1→#C539F9`); the **CTA buttons read pink/magenta**, not purple.

---

## Cross-cutting fidelity notes

- Relay & PFP images are **hotlinked** in Damus (favicons, Unsplash-style avatars) → break under Sandstr CSP/offline. Use Damus's own letter-avatar fallback for relays; bundle local `data:` avatars for users.
- The **N/M relay text** is legacy/a11y-only on master — the visual is 4 signal bars. Pick per recording.
- Two accents coexist: **PinkGradient** is brand identity; **purple→blue LINEAR_GRADIENT** is UI mechanics (FAB, tab underline, liked shaka).
