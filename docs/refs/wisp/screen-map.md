# Wisp (Android) — Ground-Truth Reproduction Spec

Authoritative spec for a faithful React/Tailwind web reproduction of the **Wisp** Android Nostr
client. Merged from (a) the owner's screen recording
`docs/refs/wisp/shots/screen-20260730-000719-1785362421617.mp4` (1080×2400, 2026-07-30, gitignored)
and (b) source recon of `barrydeen/wisp@11ac08f` (v1.2.1, 2026-07-23; 14-agent workflow). Convention:
**repo wins for exact HEX / icon names / labels; the recording wins for LAYOUT.** Divergences are
flagged **[REC vs REPO]**.

Identity (verified 2026-07-30 from the project's own materials): repo
`https://github.com/barrydeen/wisp` ("wee interface for scrolling posts"), homepage
`https://wisp.mobile` ("Wisp — Social that's actually fun again"), **MIT**
(`LICENSE`), Google Play id `com.wisp.app`. README pitch
(`README.md:3,25`): "A minimal, performant Android client … implements the full outbox/inbox relay
model with reliability scoring … decentralization is the default path, not an opt-in."

---

## 1. Color tokens

Source: `app/src/main/kotlin/com/wisp/app/ui/theme/Theme.kt` (the runtime `WispTheme` composable —
for the default "custom" theme it **overrides** the same-named preset in `Themes.kt`) +
`repo/InterfacePreferences.kt` (defaults). **Shipped default = theme "custom", DARK, accent
`#FF9800`** (`InterfacePreferences.kt:18,27`, `MainActivity.kt:47` `dark_theme=true`).

| Token | Dark (default) | Light | Notes |
|---|---|---|---|
| primary / accent | `#FF9800` | `#FF9800` (custom keeps accent; preset light `#CC7000`) | zap, bookmark, links, FAB, active tab |
| background | `#0A0A0B` | `#ECECEC` | near-OLED, not pure black |
| surface | `#1C1C1E` | `#F5F5F5` | drawer, dropdowns, sheets |
| surfaceVariant | `#2C2C2E` | `#E0E0E0` | pills, chips, input fills |
| onBackground / onSurface | `#E0E0E0` | `#1C1B1F` | primary text — NOT #FFF |
| onSurfaceVariant | `#9998A0` | `#6B6B6B` | secondary text, inactive icons |
| outline | `#38383A` | `#CCCCCC` | dividers (0.5dp), quote borders |
| error | `#FF3B30` | `#FF3B30` | deliberate iOS systemRed (Theme.kt comment); logout, delete, unread dots |
| zapColor | `#FF9800` | `#B85C00` | = accent in dark custom |
| repostColor | `#4CAF50` | `#2E7D32` | repost active, online-green, ICQ flower |
| paidColor | `#FFD54F` | `#C9A000` | "Paid" relay badge, rate-limit stat |

**Un-overridden M3 slots fall back to Compose dark baseline** — visible in the app and worth
reproducing: `secondaryContainer` ≈ `#4A4458` (lavender-gray — selected FilterChips: relay
read/write/auth chips, "Gallery|Stack" segmented control), `outlineVariant` ≈ `#49454F` (thread
connectors @50%, some dividers), `errorContainer` ≈ `#8C1D18` / `onErrorContainer` ≈ `#F9DEDC`
(NSFW banner, spam toggle).

**Hardcoded literals outside the theme** (each cited in recon): NIP-05 verified check `#FF8C00`
(profile header) · lightning/zap icons on profile `#FFC107` · private-reply/zap eye `#FF8C00` ·
relay-error red `#FF5252` · LIVE badge `#E53935` (NOT theme error) · compose undo-X `#E53935` ·
nsec-paste warning surface `#B71C1C` · tx-income green `#2E7D32` · splash "Google" button
`#131314`/text `#E3E3E3`/border `#8E918F` · splash "Nostr" button `#1A0E2E`/text
`#E9DDFF`/border `#8E30EB` (nostr-purple; ostrich icon `#A223E9`+`#FD962C`).

**Brand gradient (the only one): radial `#FFBA60 → #E97941`** — exclusively the logo glyph fill
(`res/drawable/ic_wisp_logo.xml`). No brand linear gradient exists anywhere.

15 theme presets exist (Custom, Nord, Dracula, Gruvbox, Catppuccin, Everforest, One Dark, Tokyo
Night, Srcery, Kanagawa, Ayu, Emerald, Amethyst, Ruby, Sapphire — `Themes.kt`); only "custom" ships.

## 2. Logo / identity

- Glyph: `ic_wisp_logo.xml` — 72×72 viewport, single evenodd path: round ghost/flame blob, curl
  sweeping to top-right, **two vertical-oval eye CUTOUTS** (bg shows through). Radial fill
  `#FFBA60→#E97941`, center ≈ (31,23), r ≈ 44.5. Verbatim path in the recon report; reproduce as
  inline SVG with `fill-rule="evenodd"`.
- Wordmark: always lowercase **"wisp"**, system sans-serif, weight 500 (56sp splash / 36sp auth).
  Tagline string: **"a wee interface to scroll posts"**.
- Empty-reply doodle: `ic_no_replies` — hand-sketched **dashed-outline wisp-ghost** (65×75), tinted
  onSurface @25%.
- Launcher: black bg + glyph. Splash: black + glyph, bob ±8dp/1.2s + sway ±3°/2.4s animation.

## 3. Typography

`WispTypography` (Theme.kt:52-58): titleLarge 20sp Bold · titleMedium 16sp SemiBold · bodyLarge
15sp/22 · bodyMedium 14sp · bodySmall 12sp · labelSmall 11sp. Font = platform default (Roboto);
no bundled font files.

## 4. App shell

- **Bottom bar** (`BottomBar.kt`): 0.5dp top divider (outlineVariant@50%) over 56dp bar on
  `background` (NOT surface). **5 icon-only tabs**: Home (`Home`) · Wallet (custom card drawable
  `ic_wallet`) · Search (`Search`) · Messages (`Forum` two-bubbles) · Notifications
  (`Notifications` bell). Selected = filled variant tinted `primary`; unselected = outlined
  `onSurfaceVariant`. **No M3 indicator pill** (deliberate, "matches iOS"). Unread badge = 8dp
  `#FF3B30` dot top-end (Home/Messages/Notifications only). Bell morphs to ₿/bolt for ~0.9s when
  a zap arrives + `ZapBurstEffect`; replies/DMs fire the **ICQ flower** burst on the bell.
- Bar hidden on: splash/auth/onboarding/loading, DM conversations, group rooms, live stream.
- Edge-to-edge, transparent system bars; content on `background`.
- Screens stack over the persistent `feed` root; back always falls to feed.

## 5. Feed (Home)

Top bar `CenterAlignedTopAppBar`, 48dp content height, bg = `background`, no divider below.
- **Leading:** 32dp avatar (opens drawer) · content-filter icon cycling All→Notes→Gallery→Polls
  (`GridView` gray → `Article`/`Photo`/`HowToVote` tinted primary when active), 22dp.
- **Center:** feed-selector **pill** (surfaceVariant, radius 20, pad 14×6): label `titleSmall` +
  `ArrowDropDown` 20dp. Dropdown (surface): **For You · Follows · Extended · Trending · Relay ·
  List · Hashtags** — active gets trailing ✓ 18dp. Default feed = **For You**
  (`FeedSubscriptionManager.kt:86`). "Relay" opens a picker dialog listing relays with
  "covers N" coverage counts [REC: "Select Relay" dialog with "+ New Set" chip, input
  `relay.example.com`, rows nos.lol "covers 9" etc.].
- **Trailing:** two surfaceVariant pills, 16dp radius: online-users (`Person` 14dp tinted
  `#4CAF50` + count; only when >0; opens "Online Now" sheet) then relay-count (`Hub` 14dp,
  green when connected else `#FF5252`, + count; dropdown of connected relay hosts).
  [REC: shows "3" and "73" respectively.]
- **LIVE row** (first list item): "LIVE" badge (radius 6, `#E53935`, white labelSmall bold) then
  48dp pills (radius 28, `primary`@12%): 40dp avatar + title (max 160dp) + "N chatting".
- **FAB:** 56dp circle `primary`, white `Edit` pencil, bottom-right; **dims to 30% while
  scrolling, never hides**. New-notes pill top-center: `primary` bg, `KeyboardArrowUp` +
  "%d new notes".
- Pull-to-refresh; manual "Load more" footer button; feed display capped (sim: ~25 notes).

## 6. Post card (`PostCard.kt`)

Flat full-width column on `background` — **no card surface**; separator = full-bleed 0.5dp
`outline` divider. Padding 16dp h / 8dp v. Top-to-bottom:
1. Repost header (centered row): `Repeat` 14dp gray + 20dp reposter avatars (overlap) +
   "{name} reposted" labelSmall (+" · time" @70%).
2. Reply attribution: `Reply` 14dp + "Replying to %s" bodySmall.
3. Author row: **40dp avatar** (follow-badge: bottom-end primary circle w/ black ✓ when you follow
   them; long-press avatar = follow toggle) · 10dp · name `titleMedium` + **icon-only NIP-05
   `Verified` 14dp tinted primary** (no handle text in feed) · status line (NIP-38) italic
   bodySmall @60% under the name · right: private-eye `#FF8C00` (if private) → timestamp
   labelSmall @70% ("Ns/Nm/Nh/Nd", then "MMM d, HH:mm") → PoW chip ("PoW %d", primary@15% bg)
   → `MoreVert` 18dp @70%.
4. Content: `bodyLarge` `#E0E0E0`; links/mentions/hashtags = `primary`, **no underline**.
   Text-only posts clamp at 500dp with bottom fade + centered "Show more"/"Show less" in primary.
   Media never clamps.
5. Media: single image full-width **radius 12**; 2+ = carousel of 4:5 crops with 48dp peek and a
   bottom-center **"N / M" counter pill** (white on black@55%) — NO dots. Quoted note = radius-12
   surface, 1dp `outlineVariant` border, full nested card. Link preview = radius-12 card, site
   name UPPERCASE labelSmall.
6. Top-zapper banner (if zapped): 1dp zap-orange@30% pill — 18dp avatar + bolt/₿ + amount.
7. **Action bar** (only when signed in), left-packed with 8dp gaps, counts right of icon, hidden
   at 0, 22dp icons, then a trailing **expand chevron** (engagement drawer):

| # | Action | Icon (M3 outlined) | Active color |
|---|---|---|---|
| 1 | Reply | `ModeComment` | never changes |
| 2 | React | `FavoriteBorder` heart | heart **replaced by your emoji** (20sp); count `#FF9800` |
| 3 | Repost | `Repeat` (opens "Repost / Quote" popup) | `#4CAF50` |
| 4 | Zap | **`CurrencyBitcoin` ₿ 22dp default**; `ic_bolt` 18dp or coin-stack in prefs/fiat | `#FF9800`; count = sats `formatShort` ("1.2k") |
| 5 | Add to List | `BookmarkBorder`→`Bookmark` | `#FF9800`, no count |

- Reaction: tap = **emoji picker popup** (surfaceVariant, radius 24; default 17 emojis
  `🧡 👍 👎 🤙 🚀 🤗 😂 😢 👨‍💻 👀 ✅ 🤡 🐸 💀 ⚡ 🙏 🍆` + "+"); long-press = instant like.
- Zap tap opens ZapDialog; success = `ZapBurstEffect` (ring + bolt particles + sparks, 1.1s).

## 7. Thread

- Top bar: back + title **"Thread"**; bg `background`. Root note = same PostCard (NO focused-note
  treatment, no bigger text).
- Replies indent **16dp/level, capped at depth 3**; connector = single 1dp vertical rail
  (`outlineVariant`@50%) with rounded 8dp elbow into a bottom line to the screen edge; dashed top
  when starting mid-air. Deeper subtrees fold into "**Show N more replies**" row (chevron-down
  16dp + label, both `primary`).
- Empty state: dashed wisp-ghost doodle 72dp @25% + "No replies yet".
- Sticky bottom reply bar: pill surfaceVariant@50% radius 18 — "Reply…" placeholder + `Edit` 16dp
  primary. Targets the note at the top of the viewport.
- "Back to Top" pill (primary bg) appears on upward scroll. Spam replies fold behind an
  errorContainer@40% "N hidden replies from likely spam accounts · Show" toggle.

## 8. Profile

- Top bar: back + display-name title + actions Search / QR (`QrCodeScanner`) / `MoreVert`
  ("Copy Profile JSON" / "Add to List" / "Block").
- Banner 150dp crop; **72dp avatar overlapping banner by only 16dp, NO ring**. Right of avatar,
  40dp circular action buttons (8dp gaps): DM (`Send` tinted primary on surfaceVariant) · Zap
  (bolt/₿ tinted `#FFC107`) · **Follow circle** (not following = primary bg + `PersonAdd` white;
  following = surfaceVariant + `PersonRemove` gray) · Mute (`VolumeOff`). Own profile instead:
  one **"Edit Profile"** button (surfaceVariant bg, onSurfaceVariant text).
- Name `titleLarge` + "Follows you" chip (labelSmall on surfaceVariant, radius 4). NIP-05 row:
  `Verified` 14dp **`#FF8C00`** + handle bodySmall primary. Bio `bodyMedium` (clamps at ~100dp w/
  "Read more"). Lightning row: bolt/₿ 16dp `#FFC107` + lud16 gray (tap = copy).
- Stats: "N Following · **∞** Followers" — follower count renders the literal **infinity** sign
  until known [REC confirms]; format 1.2k. Right: **sort pill** "Recent ▾" (primary@12% bg,
  primary text; menu Recent/Likes/Reposts/Zaps/Replies).
- Followed-by row: up to 10× 22dp overlapping avatars + "+N others in your network".
- Tabs (`ScrollableTabRow` on `background`, right-edge fade, 28dp tall): **Notes · Replies ·
  [Conversation] · Gallery · Media · Following · Followers · Chat Rooms · Relays**; active =
  primary text + 2dp primary underline (inset 6dp). Empty states: "No notes yet" /
  "No shared threads yet" etc.
- Following/Followers rows use labeled `FollowButton`: filled primary "Follow" / outlined
  "Following" (primary text, `outline` border).

## 9. Notifications

- Top bar: back + "Notifications" + `"  |  24h"` suffix (titleSmall @50%) + `Tune` filter icon
  (primary when filters active) + `VolumeUp/Off` sound toggle.
- First item = **24h summary bar** (surfaceVariant, SpaceEvenly): 6 stats — Replies
  (`ChatBubbleOutline`) · Reactions (`FavoriteBorder`) · Zaps (₿/bolt, label = **sat total**) ·
  Reposts (`Repeat`) · Mentions (`AlternateEmail`) · DMs (`MailOutline`); tap isolates a type
  (primary tint + primary@12% bg).
- Rows are FLAT "zen" style (no per-actor stacking; only same-actor zap spam folds): 28dp type
  icon slot → 32dp avatar → name titleMedium + action text bodyMedium gray ("reacted" / "zapped"
  / "reposted" / "replied" / "quoted" / "mentioned you" / "voted" / "messaged you") → timestamp
  right. Zap icon shows **sat amount stacked below** it; reaction rows show the actual emoji at
  22sp. Tap expands the target note inline (full PostCard); replies get an inline composer
  ("Reply…" pill + 28dp primary send circle).
- Filter sheet: "Notification Filters" + 7 switch rows (Replies/Reactions/Zaps/Reposts/Mentions/
  Votes/DMs) + "Chat rooms" + "Enable all"/"Disable all".
- Empty: "No notifications yet". Unread = the bottom-bar dot only.

## 10. Messages (Chat)

- Title **"Chat"**; `TabRow`: **"Direct Messages" | "Chat Rooms"**. FAB primary: `GroupAdd`
  (new group DM → contact picker with checkboxes + group-name field) / `Add` (rooms: menu
  "Discover chat rooms / Join existing chat room / Create new chat room").
- DM row: 40dp avatar (group = 48dp cluster of 3×28dp) · name titleMedium · preview bodySmall
  gray · date "MMM d" right. NO unread badge on DM rows; 0.5dp outline dividers. Empty: "No
  messages yet" + "Send a message from someone's profile".
- Conversation: back `KeyboardArrowLeft`, 40dp avatar + name (tap → profile); trailing **relay
  cloud** (`Cloud` icon + 16dp primary count badge) expanding a per-participant relay panel.
  Date headers "Today"/"Yesterday"/"EEEE, MMMM d" between thin dividers.
- **Bubbles:** own = **`primary`@35%** (mustard) aligned right, tail corner 4dp bottom-right;
  other = surfaceVariant@62%, 36dp sender avatar, tail bottom-left; radius 16 elsewhere.
  Timestamp "HH:mm" inside bubble (sent: bottom-right labelSmall). Sender name (received) =
  primary. Swipe-right to reply. Tap bubble → actions sheet (Comment / REACT emoji strip /
  Zap + Copy).
- Input bar: floating surface radius 12 — 32dp "+" attach square (onSurface@8%), "Message…"
  placeholder @45%, `Send` 20dp (primary when non-blank).
- Group rooms: same bubbles but sender names = deterministic per-pubkey HSV hue; in-chat search;
  join gate with "Join Chat Room" button.

## 11. Compose ("New Post")

Full-screen route (not a sheet). Top bar: back + title "New Post"/"Reply"/"Quote"/"Gallery Post";
right `OutlinedButton` **"Switch to Gallery"** (`PhotoLibrary` 18dp) ↔ "Switch to Text".
- Text field: outlined box **160dp tall**, placeholder **"What's on your mind?"**, cursor primary.
- Toolbar under field: `Image` (attach) · `Warning` (NSFW; error-red when on) · `Shield` (PoW;
  **orange when on** — default PoW is ON, 16 bits) · `BarChart` (poll) · [`VisibilityOff` private
  reply, replies only, `#FF8C00`] · `Schedule` · spacer · **"Save draft"** TextButton (when text
  non-blank).
- Reply context: surfaceVariant@50% radius-8 card "Replying to {name}" + collapsed original
  (expandable). Hashtag chips auto-detected below (primary@12% pills).
- Live preview card (keyboard hidden): surfaceVariant radius 8, 1dp outline@30% — 32dp avatar +
  name over "Preview" caption + RichContent body.
- **Publish**: full-width 44dp filled primary Button "Publish". With **undo countdown (default ON,
  10s)**: red `#E53935` 44dp X-circle + 44dp pill whose **primary fill grows left→right over a
  primary@25% track**, centered white text **"Post now (N)"** counting down; tap = post now.
  [REC: exactly this — X + draining pill.]
- Drafts & Scheduled screen: 2 icon tabs, rows mirror PostCard + "(empty)" fallback.

## 12. Wallet + Zap

- **Wallet home**: top-left **"*Spark + Breez"** logos (Spark wordmark + Breez logo tinted
  onSurface); right Refresh + Settings. Banner card (surfaceVariant): `VpnKey` 28dp accent +
  "Secured by your Nostr key" / "Restores on any device when you sign in. Tap to also save your
  seed phrase as a backup." Balance centered `displayLarge` bold; **default unit = SATS**
  ("%,d" + "sats" caption; tap cycles sats→fiat→hidden). Lightning-address pill (surfaceVariant,
  radius 50%): bolt 14dp accent + `user@breez.tips`. Two **64dp accent circles** `ArrowUpward` /
  `ArrowDownward` with labels **"Send" / "Receive"**. "RECENT" tx footer.
- Wallet detail/settings [REC]: address card + copy; outlined pills "QR Code" / "Change"; red
  "Remove Lightning Address"; "Wallet Info" → "*Spark + Breez" dropdown card; "Security" →
  outlined "View Recovery Phrase"; warning card "IMPORTANT: Wisp never holds user funds. You
  manage your own wallet and are responsible for securing it properly."; "Disconnect Wallet" →
  red "⇄ Switch to a different wallet"; footer "Built on *Spark / Breez SDK".
- **ZapDialog** (bottom sheet): "Close" pill (outline@40%) left, "Presets" pill (accent border)
  right; 32dp avatar + name; **hero amount 56sp bold accent**; preset chips (selected = filled
  accent white, unselected surfaceVariant) — **defaults 21 / 100 / 500 / 1.0k / 5.0k sats** +
  "Custom"; `Custom (sats)` outlined field; "Message (optional)"; privacy dropdown
  Public/Anonymous/Private; "Instant zaps" switch row; full-width 52dp accent button
  **"Zap %,d sats"** (bolt 18dp). >10k sats asks "Zap %,d sats?" confirm; hard cap 1M.
- **[REC vs REPO — Fiat Mode]**: the recording ran with Fiat Mode ON (default **OFF**,
  `FiatPreferences.kt:11`) — hence "$0.1 / USD", "Custom (cents)", coin-stack action icons and a
  "$0.00" wallet. The reproduction ships the repo default: sats + ₿ `CurrencyBitcoin`.
- Zap success: `ZapBurstEffect` — white/orange center flash, expanding ring, 5-7 bolt particles,
  12-19 sparks, 1.1s (+ `zap_thunder` sound in the real app).

## 13. Search

- Top block on **surface** (#1C1C1E — the one top bar not on background): segmented pill
  container (surfaceVariant, radius 50, 4dp pad) with 2 equal tabs — **"Profiles"**
  (`AccountCircle` 18dp) | **"Notes"** (`Forum`) — selected = **filled primary pill, WHITE
  SemiBold** text. Default = Profiles.
- Below: filled `TextField` pill (surfaceVariant, radius 50, no underline): `Search` 20dp leading,
  placeholder "Search", `Clear` 18dp when non-empty; right `Tune` icon (primary when advanced
  panel open → "Search relay" dropdown, default `search.nostrarchives.com`; Notes tab adds
  "Author" filter).
- States: initial "Search for users and notes on relays"; loading spinner primary; "No results
  found". Profiles rows: 48dp avatar + name bodyLarge + nip05 + `FollowButton` (filled primary
  "Follow" / outlined "Following"). Notes results = full PostCards.

## 14. Relays (Settings → Relays)

- Title "Relays"; 4 tabs **General · DM · Search · Blocked** (primary underline).
- Add row: outlined field labeled **"wss://"** + `Add` icon. Full-width primary button:
  **"Broadcast Relay List (NIP-65)"** (General) / "Broadcast DM Relays" / "Broadcast Search
  Relays" / "Broadcast Blocked Relays".
- General row: full `wss://…` url bodyMedium over 3 `FilterChip`s **read / write / auth**
  (selected = M3 tonal → the lavender `#4A4458` look) + red `Delete` trash. Other tabs: url +
  trash only. [REC rows: nostr.mom, relay.mostr.pub, relay.snort.social, relay.ditto.pub,
  relay.mostro.network, nostr.bitcoiner.social, offchain.pub; DM tab: auth.nostr1.com.]
- **Relay Health** (separate settings screen): summary "Connected X/Y" + "Bad"; rows =
  surfaceVariant cards with 40dp `RelayIcon` (letter fallback: first char of domain after
  stripping `relay.`) + 12dp status dot (green/`#FFD54F` cooldown/`#FF5252` bad) + type badges
  ("DM" on `#90CAF9`@20%, "Ephemeral") + "X/Y sessions OK" + **outbox proof: up to 5 overlapping
  22dp avatars captioned "covers N"**.
- **Relay detail**: 72dp icon, name, badges (Paid `#FFD54F` / Auth Required `#90CAF9` /
  Restricted Writes `#CE93D8` / Open `#81C784`), ★ Favorite + "Add to Set" chips, "Statistics"
  header (primary) + 2-col stat cards (Events Received/Sent, Data, Connections/Uptime,
  Failures/Rate Limits, First Seen/Last Connected).

## 15. Drawer + Settings

Left modal drawer on **surface**, opened by the feed avatar. Header: 64dp avatar · account-switcher
chip (`People` 16dp on surfaceVariant) · spacer · **theme toggle** (`DarkMode`/`LightMode`) · QR
scan. Then name titleMedium, npub `take(16)+"..."`, italic **"Set status..."** row (`Edit` 14dp
@50%; dialog "Update Status" / "What are you up to?").
Rows (48dp): My Profile (`Person`) · Feeds (`Home`) · Search · Messages (`Email` envelope!) ·
Wallet (card) · Lists (`FormatListBulleted`) · Drafts & Scheduled (`Edit`) · **Settings** (`Settings`,
chevron-expands INLINE, indented 36dp): Interface (`Palette`) · Relays (`Settings`) · Media Servers
(`Cloud`) · Keys (`Key`) · Safety (`Block`) · Proof of Work (`Shield`) · Social Graph (`Hub`) ·
Custom Emojis (`EmojiEmotions`) · Relay Health (`FavoriteBorder`) · Console (`BugReport`) — then
**Logout** in `#FF3B30` (`ExitToApp`; confirm "Back up your private key before logging out…").
Footer: 16dp glyph + **"wisp v1.2.1"** @30%.

- **Interface**: Language (System Default ▾) · Text Size ("Large text") · Themes ("Choose a color
  scheme" → 15 preset cards) · Accent Color (32dp circle, "Tap to customize", HSV picker; custom
  theme only) · "Hide new notes button" · Media (Auto-load ON / Video autoplay ON / Loop videos ON /
  "Multi-image layout" segmented **✓ Gallery | Stack** / Hide live streams) · Translation ·
  Client Tag ("Tag notes with Wisp", ON) · Posting (**"Undo countdown"** ON, 5/10/15/20/30s
  segmented, default 10s) · Fiat Mode (OFF) · Zaps ("Instant zaps") · Zap Icon (₿ vs bolt; default
  **₿**) · footer "Wisp v1.2.1" (5 taps → Diagnostics).
- **Keys**: "Public Key — Share this freely — it's your Nostr identifier." npub card + QR + copy
  (icons primary); "Private Key" → filled **"Reveal Private Key"** button (`Visibility` icon);
  bottom `#FF3B30` warning **"Never share your private key with anyone!"**.
- **Safety**: tabs Filters / Muted Words / Muted Users. Filters: "Spam replies" ON ("Uses an
  on-device model to hide likely-bot replies… Model runs locally, no data leaves your device.") ·
  "Web of Trust" OFF + graph status ("Social graph not computed" warning + "Compute now").
- **Proof of Work**: intro copy; sections Notes (ON, 16 bits) / Reactions (ON, 12 bits) / DMs
  (ON, 12 bits) with "− N bits +" steppers.
- **Social Graph**: empty → "Social graph has not been computed yet" + "Compute Now" (primary);
  computing stats (Follows 22 / 2nd degree 7549 / Qualified 75 / Relays covered 7 [REC]); then a
  full-bleed **force-graph canvas** — thin gray web of edges + avatar nodes (own node centered
  with orange glow) over a bottom sheet **"Top Accounts" / "75 qualified from 22 follows"** +
  ranked rows ("#1 … followed by 15").
- **Console**: log rows — red "FAILURE" label + timestamp right + monospace-ish message lines
  ("Expected HTTP 101 response but was '401 Unauthorized'").

## 16. Login / onboarding

- **Splash**: full-bleed grid of **44dp circular avatars** (4dp gaps) fading via vertical scrim
  (transparent→bg between 25%→72% height); bottom column: animated glyph 96dp + black halo,
  "wisp" 56sp W500 white, **online pill** (M3 card radius 24: 8dp green dot + "%d people online
  now"), "Continue with Google" (48dp, radius 24, `#131314`, G logo 20dp), "Continue with Nostr"
  (`#1A0E2E`, purple border, ostrich 22dp).
- **Nostr sheet**: ostrich 48dp, title "Continue with Nostr", body "Enter your existing key, or
  create a new account. Your key never leaves the device.", outlined field **"nsec or npub…"**
  password-masked with eye + QR-scan trailing icons, filled "Log In", divider, outlined "Create
  new account". (Sim: key field goes through `keySafety.ts` — refuse real-looking keys.)
- **Profile step**: 96dp circle `CameraAlt` "Add photo", "Display name" + "About" outlined
  fields, button "Please wait…"→"Continue"; relay-probe status lines below ("Testing relays…" →
  "Done!").
- **Suggestions**: "Find people to follow" / "Follow at least 5 accounts to build your feed";
  sections "Meet the creators" (2 cards, surfaceVariant@50%: 56dp avatar + name + role caption
  ["Creator of Nostr" / "Creator of Wisp"] + Follow pill) · "Active right now" ("N people posting
  right now") + **Follow All** tonal-primary pill + StackedAvatars (44dp, 35% overlap, max 8,
  "+N") · "News sources" horizontal 120dp cards. CTA: disabled "Select at least 5 (N/5)" →
  "Follow N accounts". (Sim mock: fictional identities only — never transcribe the recording's
  real accounts.)
- **Topics**: "Follow topics" + Skip; "Search topics" field; "Popular topics" FilterChip cloud
  (#news #bitcoin …); CTA "Continue without topics" / "Follow N topics".
- **First post**: "Say hello to nostr" + Skip; prefilled "#introductions" textarea; **"Post now
  (N)" countdown pill + "Undo"** — the undo-countdown idiom debuts right in onboarding [REC].
- **Loading**: avatar + progress bar + "Finding your friends… N/M".

## 17. Signature details (get these right)

1. **Orange-on-near-black** everywhere; text is `#E0E0E0`, never white; dividers hairline 0.5dp.
2. **Undo countdown pill** ("Post now (N)" + red X, primary fill draining track) — unique idiom.
3. **₿ CurrencyBitcoin as the default zap icon** (bolt is opt-in) and **sats totals, not counts**.
4. **Emoji-reaction model**: heart never fills — it is *replaced* by your emoji; 17-emoji quick
   picker starting 🧡👍👎🤙🚀.
5. **Feed pills**: online-users + relay-count with green icons; feed switching via center
   dropdown pill, never tabs.
6. **Outbox model as UI**: relay coverage counts ("covers N") in pickers and Relay Health.
7. **ICQ flower** green burst + classic sound on incoming replies/DMs (bottom-bar bell).
8. **User status lines** (NIP-38) under names; "Set status..." in drawer.
9. **"∞" follower count** placeholder on profiles.
10. **Spam-filter fold** ("N hidden replies from likely spam accounts") — on-device classifier.
11. Icon-only bottom bar with **no active-pill indicator**, 8dp iOS-red badges.
12. Drawer footer "wisp v1.2.1" + inline-expanding Settings subtree.

## 18. [REC vs REPO] divergence log

| Topic | Recording (2026-07-30) | Repo @11ac08f | Verdict for sim |
|---|---|---|---|
| Fiat Mode | ON ($0.1, cents, coin-stack, $0.00 wallet) | default OFF (`FiatPreferences.kt:11`) | ship sats+₿ (repo default); note only |
| Zap presets | $0.013/$0.064/$0.318/$0.637/$3.18 (USD of sats presets) | 21/100/500/1000/5000 sats | repo values |
| Amber/NIP-55 | — | no external-signer integration found during recon (`NostrSigner.kt` is local only) | omit signer button |
| "Select Relay" dialog | shown with "+ New Set", "covers N" | feed relay-picker (`FeedScreen.kt`) | REC layout |
| Wallet balance | "$0.00" | default unit SATS | "0 sats" |
| Onboarding Suggestions "Skip" | not visible | DEBUG builds only | omit (matches both) |

## Recording coverage vs repo-only

**Verified against recording frames:** splash/login, Nostr sheet, create-account, suggestions,
topics, first-post countdown, feed (+selector dropdown, relay picker, LIVE row), thread (+emoji
picker, empty state), reply, zap dialog (fiat variant), add-to-list, wallet home/detail, search
(profiles/notes), profile (a followed account), DMs (list/new-group/conversation), notifications (empty),
compose (+draft, undo pill), own profile, drawer (+settings subtree), Interface, Relays
(General/DM), Keys, Safety, PoW, Social Graph (+computed viz), Custom Emojis, Relay Health,
relay detail, Console.
**Repo-only (no recording render):** light theme, non-custom theme presets, group rooms/live
stream screens, gallery compose mode, polls, NWC wallet mode, Amber (absent anyway), Bookmarks/
Lists screens, floating audio player, populated notifications.

Cross-cutting for the sim: all avatars/media local (inline SVG + `data:` URIs — the real app
hotlinks profile pictures); every identity fictional from `src/data/mock`; key input guarded by
`keySafety.ts`; both themes via `useParentTheme` with **dark as the registry default**.

## Fidelity pass — side-by-side verdicts (2026-07-30, sim vs recording frames)

Live click-through of `src/simulators/wisp/` at 1440×900 (framed) and phone-width full-bleed;
0 console errors, 0 external hosts in `performance` resource entries, 0 nested buttons,
`--wisp-bg` computed `rgb(10,10,11)`, SIMULATION strip present.

| Surface | vs frame | Verdict |
|---|---|---|
| Splash/login + Nostr sheet | t_002/t_006 | ✅ avatar wall, floating glyph, online pill, both buttons, sheet copy + masked key field; real-key tripwire fires |
| Feed + selector + relay picker | t_031/t_033/t_034 | ✅ pill dropdown items verbatim, "covers N" rows, LIVE row, PoW chips, statuses; pills compacted to fit the 340px frame |
| Thread | t_038/t_039 | ✅ "Thread" bar, plain root card, reply pill + pencil; ghost-doodle empty state |
| Zap dialog | t_043 (fiat) | ✅ layout 1:1; ships sats+₿ per repo default (divergence log §18) |
| Compose + undo pill | t_092 | ✅ "Switch to Gallery", PoW shield on-orange, hashtag chip, Preview card, red X + draining "Post now (N)" at 1s cadence |
| Wallet home/detail | t_048/t_050 | ✅ *Spark + Breez, key banner, "0 sats", breez.example pill, Send/Receive circles |
| Search | t_051 | ✅ Profiles|Notes segmented (white-on-accent), pill field, Follow rows |
| Messages + conversation | t_086/t_088 | ✅ Chat tabs, rows, mustard own-bubble, in-bubble times, bar hidden in conversation |
| Notifications | design from repo | ✅ "| 24h", 6-stat summary, zen rows, sats under ₿ icon |
| Drawer + settings subtree | t_106/t_108 | ✅ header chips, envelope Messages icon, inline-expanding Settings, red Logout, "wisp v1.2.1" footer |
| Interface / Relays / Keys | t_110/t_112/t_118 | ✅ switches, ✓Gallery|Stack + read/write/auth in leaked `#4A4458`, npub card + Reveal Private Key |
| Social Graph | t_126/t_128 | ✅ Compute → stats (22/7,549/75/7) → graph canvas + "Top Accounts" sheet |
| Guided tour | — | ✅ 10 steps drive login/feed/compose/profile/wallet/settings (≤2 cmds/step) |

Known deltas (accepted): lucide icons approximate Material symbols; graph viz has fewer edges
than the real force layout; Chat Rooms tab is a static two-row sketch; onboarding
suggestions/topics/first-post steps are compressed into the create sheet.
