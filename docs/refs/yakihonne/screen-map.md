# YakiHonne Mobile — Ground-Truth Reproduction Spec

Authoritative spec for a faithful React/Tailwind web reproduction of the **YakiHonne mobile app** (Flutter/Dart). Merged from source recon of `YakiHonne/mobile-app@main` (11-surface pass, 2026-07-14), cross-checked against `YakiHonne/web-app` `src/styles/root.css`. Convention: **repo wins for exact HEX + icon/label names; a screen recording wins for LAYOUT.** All hex values converted from Flutter `Color(0xAARRGGBB)`. Divergences flagged **[REC vs REPO]**; unconfirmed items flagged **(UNVERIFIED)**.

> **The one thing to get right:** the default brand accent is **orange `#EE7700`**, not purple. Purple is the *logo-asset* color and one *selectable* theme accent among six — never the default UI accent. AUDIT.md's "purple" recommendation is wrong; this file corrects it.

---

## Brand tokens

**Font family:** **DMSans** (custom, locally bundled `.ttf`, weights 400–900), fallback **NotoSans** (CJK/extended). Set on every ThemeData: `fontFamily: 'DMSans', fontFamilyFallback: ['NotoSans']`. NOT Google-Fonts-fetched at runtime. Material 3.

Source: `lib/utils/constants.dart`. Web cross-check confirms `--c1: #ee7700` / `--orange-main: #ee7700` as the constant primary across all 4 web themes.

| Token (Dart) | Hex | Role |
|---|---|---|
| `kMainColor` | **`#EE7700`** | **DEFAULT brand accent — orange.** `primaryColor` in every theme: FAB, primary buttons, active/self action icons, links, mentions, tag chips, "Posted by" name, toggles' active track |
| `kMainColorSide` | `#FFFAF3` | pale orange bg tint (web `--orange-side`; dark web = orange @ ~15% alpha) |
| `noOrange` | `#FFA02F` | lighter "Nostr protocol" orange |
| `kMainColor1` | `#6B218D` | **selectable purple accent** (3rd in the picker) — NOT default |
| `kPurple` | `#86318C` | brand-purple surface/accent tone (version chip); web `--c1-transparent: #86318c08` |
| `kDimPurple` | `#220038` | very deep purple surface |
| `kLightPurple` | `#E040FB` | Flutter `purpleAccent` |
| logo-mark purple | `#7A117E` | fill of `logo-*-purple.svg` (app icon / launcher) — deepest brand purple, NOT a `constants.dart` token |
| `kScaffoldDark` | **`#171718`** | **default dark scaffold bg** (near-black, NOT pure OLED) |
| `kCardDark` | `#222525` | dark card / surface |
| `kOutlineDark` | `#393B3B` | dark divider / border |
| `kBlackTheme` | `#000000` | true-OLED scaffold (separate "black" theme; its cards = `#171718`, border `kBlackOutline #404040`) |
| `kDimGrey` | **`#B3B3B3`** | **secondary / hint / muted text** (`highlightColor` in dark); input hint+label |
| `kDimGrey3` | `#808080` | muted secondary text in light theme (`highlightColor` light) |
| `kCreamTheme` | `#FAF7F3` | cream (warm-light) scaffold; card `#F0ECE8`, border `#E6E4E2`, hint `kCreamHint #B8B6B4` |
| light scaffold | `#FFFFFF` | light theme bg; card `kPaleGrey2 #F4F4F4`, divider `kOutlineLight #E5E5E5` |
| `kGreen` / `kMainColor3` | `#00C04D` / `#00994D` | **success / online / positive** (relay "Online", incoming tx, relay-found). Note two greens: `#00C04D` semantic, `#00994D` selectable accent |
| `kRed` / `kMainColor2` | `#FF4A4A` / `#DD2222` | **error / destructive / negative** (mute, delete, outgoing tx, unreachable relay, verified-nip05 handle color). `#FF4A4A` semantic, `#DD2222` the "Delete account" border + red accent |
| `kBlue` | `#504DFF` | indigo/link-ish |
| `kNavyBlue` | `#1D9BF0` | Twitter-style link blue |
| **zap / sats** | **(UNVERIFIED as a token)** | NO dedicated `kZap`/`kSats` constant. Zap/sats accents draw from the orange/amber family per-widget: `kMainColor #EE7700` (default), `kMainColor4 #FFC107` (amber), `kYellow #FFE604`. Balance number + zap amount render in `#EE7700` orange |

**Selectable accent picker** (`mainColorsList`, in order): orange `#EE7700` → green `#00994D` → purple `#6B218D` → red `#DD2222` → amber `#FFC107` → blue `#1565C0`. Any becomes `primaryColor`; **orange is default.**

**Theme roles** (widgets reference roles, not raw hex): `primaryColor` = orange; `primaryColorDark` = `#FFFFFF` (dark/black) / `#000000` (light/cream); `highlightColor` = muted grey (`#B3B3B3` dark / `#808080` light); `cardColor` = surface fill.

**Radii:** buttons `10px`, inputs `15px`, generic containers `~13.3px` (`kDefaultPadding/1.5`). Base spacing `kDefaultPadding = 20`. **No gradient tokens** at the design layer (flat-color theme; any gradients are inline per-widget, e.g. curation placeholder `#8E2DE2 → #4B1248`).

---

## Home feed + app bar + feed selector

Home = **`LeadingView`** (the "leading" tab), first bottom-nav tab. Sources: `lib/views/leading_view/leading_view.dart`, `lib/views/main_view/widgets/main_view_appbar.dart`.

**Top app bar** (`MainViewAppBar`), 3 zones:
- **Leading (left)** — logged-in: user avatar (`ProfilePicture2`, size 35). Logged-out: hamburger `FeatureIcons.menu`. Both tap → open left drawer (`MainViewDrawer`).
- **Title (center)** — the **feed-source selector** (`SourceButton`), width-constrained, centered. Tap opens a **source-picker bottom sheet** (`AppSourcesList`) listing Community feed options + user Relays + Packs. This is the "add feed / switch feed" control.
- **Trailing (right)** — exactly two: (1) **filter** `FeatureIcons.filter` (`FilterGlobalButton`; opens filter sheet; orange dot badge when a filter is active), (2) **search** `FeatureIcons.search` → `SearchView`. NO notifications icon here (Notifications is its own tab).

**Feed selector — exact default Community options, in order** (`ContentSources.defaultSources()`):

| # | Label | Source key | Icon |
|---|---|---|---|
| 0 | **Recent** *(default)* | `recent` | `recent` |
| 1 | **Recent With Replies** | `recent_with_replies` | `recentWithReplies` |
| 2 | **Trending** | `trending` | `trending` |
| 3 | **Global** | `global` | `globe` |
| 4 | **Paid** | `paid` | `sats` |
| 5 | **Widgets** | `widgets` | `smartWidget` |

`recent` / `recent_with_replies` are the "following" feeds (use your contact list). Two extra source keys exist only in Articles/Discover: `top` → **Top**, `network` → **From Network**. The full `CommonFeedTypes` label set (surfaces elsewhere): Recent, Recent With Replies, Explore, Following, Trending, Highlights, Widgets, Paid, Others, Global. **For mobile home, render: Recent · Recent With Replies · Trending · Global · Paid · Widgets** (Recent selected).

**Timeline layout** (`SmartRefresher` → `CustomScrollView`, pull-to-refresh + pull-up load-more): (1) Suggestions sliver (if enabled; has "Hide Suggestions"), (2) horizontal `MediaBox` strip, (3) `ShowFollowingListMessageBox` (small contact list), (4) feed body (`LeadingFeed`), (5) `CacheExceedsSizeContainer` warning. Phone = single-column `SliverList`; tablet = 2-col masonry. Empty → `EmptyList`.

**"New content" pill** — floating bottom-center bubble showing a count (caps `99+`) + up to 2 avatars of new posters; tap appends + scrolls to top. Re-tapping the Home tab also scrolls to top.

---

## Bottom nav

Custom widget `MainViewBottomNavigationBar` (NOT Flutter's `BottomNavigationBar`). **Exactly 5 tabs, icon-only** (no labels), evenly spaced. Source: `lib/views/main_view/widgets/bottom_navigation_bar.dart`.

| # | Tab | View | Unselected → Selected icon |
|---|---|---|---|
| 1 | **Home** *(default)* | `leading` | `home.svg` → `home-filled.svg` |
| 2 | **Media** | `media` | `media.svg` → **`media-bold.svg`** (bold, not "-filled") |
| 3 | **Wallet** | `wallet` | `wallet.svg` → `wallet-filled.svg` |
| 4 | **DMs** | `dms` | `message.svg` → `message-filled.svg` |
| 5 | **Notifications** | `notifications` | `notification.svg` → `notification-filled.svg` |

**CRITICAL — active tab is NOT tinted orange.** Both active and inactive icons use `primaryColorDark` = **white (dark/OLED) / black (light/cream)**. Selection is shown two ways: (1) the **filled** SVG variant swaps in, (2) a tiny **4×4px rounded-square dot** animates in *below* the active icon (white/black, 200ms) — not orange. Icon render size 28×28.

**Bar container:** height ~56 + safe-area; bg = `scaffoldBackgroundColor` (`#171718` dark / `#000000` OLED); top corners rounded (radius `kDefaultPadding=20`); **top border only**, `0.5px` `dividerColor`; `extendBody: true`.

**Badges:** DMs (tab 4) and Notifications (tab 5) show a `redAccent #FF5252` unread dot (size 8), only when logged in. Notifications badge clears on tap; DMs long-press = mark all read.

**Compose FAB — separate, NOT a tab.** Round `FloatingActionButton`, `CircleBorder`, bg `primaryColor` **`#EE7700` orange**, white icon. Shown **only on Home & Media** tabs (hidden on Wallet/DMs/Notifications), default Material **bottom-right** (not docked/centered). Icon: Home → `plus-sign.svg` (22); Media → `media-add.svg` (25). Tap → compose sheet.

---

## Note card + action bar

Sources: `lib/views/widgets/note_container.dart`, `note_stats.dart`. Card = `Column` in a rounded container (radius `~13.3px`, padding `kDefaultPadding/2`): (1) `ProfileInfoHeader` (avatar + name + NIP-05 validity + relative time), (2) `ParsedText` content, (3) action bar (`NoteStats`).

**Action bar — exact default order** (data-driven via `defaultActionsArrangement`, left→right):

| # | Action | Icon (default → active) | Value shown |
|---|---|---|---|
| 1 | **React** (like) | `heart.svg` → `heart-filled.svg` (or the user's emoji / NIP-30 custom emoji) | reaction count |
| 2 | **Reply** | `comments.svg` | reply count |
| 3 | **Repost** | `repost.svg` *(detailed notes only)* | repost count |
| 4 | **Quote** | `quote.svg` | quote count |
| 5 | **Zap** | `zap.svg` → `zap-amount.svg` (self-zapped) | **total SATS** (`zapsData['total']`), not zapper count |

After the 5 arrangement buttons, two always-present trailing elements: **Translation** toggle (`translate.svg`, detailed notes) and **"⋯" overflow** (Material `Icons.more_vert_rounded`, size 20). **Bookmark and Share live INSIDE the ⋯ menu — NOT on the bar.**

**Default like icon is a HEART** (outline → filled), not a shaka/emoji-by-default. One-tap-reaction setting: ON → applies default reaction instantly; OFF → opens the reaction popup (`ReactionsBox`: recent-emoji quick-row → full `emoji_picker_flutter` picker with search; quick-row falls back to Smileys category). Long-press → who-reacted list. Zap mirrors this (one-tap-zap vs amount sheet; long-press → zappers list; self-zap is a no-op).

**Button color rule (uniform):** interacted state → `primaryColor` **orange `#EE7700`** (icon + count); idle → `highlightColor` muted grey. Each button = SVG (size 18) immediately followed by count text (fontSize 15). Counts abbreviate (`1.1k`) via `AnimatedFlipCounter`.

**"⋯" overflow menu** (`PullDownGlobalButton`, each row a 20×20 SVG tinted `primaryColorDark`, destructive rows `kRed`): Copy npub (`keys.svg`), Copy note id (`copy-naddr.svg`), Copy text (`code-text.svg`), Show raw event, Pin/Unpin (own), **Bookmark** (`bookmark-empty/filled-*.svg`), Republish, Share as image (`image.svg`), **Share** (`share-global.svg`), Mute thread, Mute user (red), Delete (own, red).

---

## Articles feed + Article reader

Sources: `content_container.dart` (shared card for articles/curations/videos), `article_view/article_view.dart`, `articles_header.dart`, `content_stats.dart`.

**Feed card** (`ContentContainer`, vertical `Column` — NOT a left-thumbnail card):
- **Author row**: 30px avatar + author name (`w700`, `primaryColorDark`) + **following-check glyph** `user-followed.svg` (15×15) if followed — **no Follow button on the card**. Below name: relative time (`highlightColor`) + dot + **read-time** `"N min read"` in **orange** (`primaryColor`; `estimateReadingTime` = ceil(words/200)).
- **Info row**: left `Expanded` = **Title** (`w800`, maxLines 2) + **summary** (`highlightColor`, maxLines 2, "No description" fallback); right `Flexible` = **square rounded thumbnail on the RIGHT** (`AspectRatio 1`, radius 20). Video variant adds a centered play-arrow overlay.
- **Stats row** = `ContentStats(isInside: false)`.

**Article action bar** (`ContentStats`) — **repost is REMOVED** here. Order: **reactions → replies → quotes → zaps → ⋯**. Inactive `highlightColor`, active/self `primaryColor` orange; counts abbreviated (`1.1k`). NO separate "views" counter — the `1.1k` numbers are engagement counts. When `isInside:false`, a `ZappersRow` fades in above the actions.

**Article reader** (`article_view.dart`, `ListView`):
- **AppBar** (`CustomAppBar`): back chevron `Icons.arrow_back_ios_new_rounded` + centered title **"Article"** (`w700`) + trailing **YakiHonne logo mark** (`logoMarkPurple`, tinted `primaryColorDark`, taps → home). **[REC vs REPO]** The reader header has **NO dedicated share/bookmark icons** — those live in the bottom bar's ⋯ menu.
- **bottomNavigationBar** = a `Divider(0.5)` + `ContentStats(isInside: true)` = the same reaction·reply·quote·zap·⋯ bar, spread `spaceEvenly`.
- **Body**: `ArticleHeader` (40px avatar; label **"Posted by"** over author name in **orange**; `verified.svg` if NIP-05; **Follow/Unfollow** button — not-following = orange fill white text, following = `cardColor`; own article shows **"Edit"**; a bordered **zap** button `zaps.svg` opens `SendZapsView`) → divider → **Title** (`SelectableText`, `w800`) → **"Posted from"** + client name (orange) + relative time → summary → **hashtag chips** (orange fill, white text) → **cover image** (`AspectRatio 16/9`, appears *after* title/tags) → markdown body.
- **"See translation" pill** — floats bottom-center (`cardColor` bg, orange border); toggles "See translation" ↔ "See original".

**Discover / Articles feed tabs** (`discover_view.dart`, `ExploreType`): **All · Articles · Videos · Curations**, default = **Articles**. Curations card `attachedText` = "N articles"/"N videos"; Videos = "Watch now". (Note: the horizontal tag-tab bar is currently commented out in `main`.) Flash news = a distinct rounded card (not `ContentContainer`). Smart widgets under `lib/views/smart_widgets_view/` — layout **(UNVERIFIED, partial)**.

---

## Compose

Sources: `write_note_view/write_note_view.dart` (`AddReply` widget handles new notes AND replies), `publish_media_container.dart`, `reply_container.dart`.

**Presentation:** a **modal bottom sheet** (`DraggableScrollableSheet`, initial 0.95, min 0.60), top corners rounded 20px, bg `scaffoldBackgroundColor`, `0.5px` `dividerColor` border, centered grabber handle at top. **NOT a full-screen page.**

**Header row** (space-between): (1) **Close** `close-sign.svg` (X) on `cardColor` grey circle (NOT orange), (2) center title **"Compose"** (`w800`), (3) **Send** — `send.svg` on an **orange `#EE7700` circular** button, white glyph. The send glyph is a **paper-airplane / telegram-style icon** (stroked outline 1.5px, round caps) — **NOT an up-arrow or chevron**.

**Text input:** row of `NoteAccountsSwitcher` (35px avatar + multi-account toggle) then `ClipboardPasteMentionTextField`. Placeholder **"Write something"**. Borderless, `bodyMedium`, sentence-caps. **Mentions colored orange** (`primaryColor`). Auto-saved as debounced draft. **No character counter / limit** in the compose UI (UNVERIFIED elsewhere).

**Bottom toolbar** (`spaceAround`, icons tinted `primaryColorDark` white/black, 22×22), exact left→right:

| # | Icon | Action |
|---|---|---|
| 1 | `image-link.svg` | `MediaSelector` sheet (image/video → inserted as URL; camera lives inside this sheet) |
| 2 | `gif.svg` | Giphy picker |
| 3 | plain text **`@`** (not an SVG) | insert `@` to trigger mention search |
| 4 | `menu.svg` | `ToolsView` — insert **Smart Widgets** / tools |
| 5 | `calendar.svg` | schedule the note (icon turns orange when a schedule is set) |
| 6 | "Paid note" pill (conditional) | Cupertino toggle (orange active track) |

**NO camera / emoji / hashtag / poll buttons** in this toolbar. Hashtags typed inline via `#`. Polls are a separate view (`write_zap_poll_view/`). Long-form articles are a **separate editor** (`add_content_view/`) — not this sheet.

**"Replying to" context** (above input when a reply): 35px avatar + connector line; date, quoted content, and **"Replying to <name>"** in **orange** (tappable). **Relay indicator** (`NoteSelectedRelay`, above toolbar, only in source-relay mode): "Publish only" + relay favicon + hostname + small orange toggle. No numeric relay count.

---

## Profile (+ stats view)

Sources: `profile_view/profile_view.dart`, `profile_header.dart`. Labels from `en.json` via `context.t.*` (casing may differ after `.capitalizeFirst()`).

**Header order:** banner → 80px circular avatar (overlapping bottom-left, with ring) → name → nip05 row → website row → bio → counts → action row.
- **Banner** — user's `banner` image full-width (tappable); the "purple NOSTR" banner is *user content*, not a brand token — placeholder if none.
- **Name** — `titleLarge`, `w800`; **orange `verified.svg` badge** (15×15) right of name if NIP-05 valid. **No printed `@handle`** (UNVERIFIED) — identity line is the **NIP-05 row** (`nip05.svg` 20×20 `primaryColorDark` + address).
- **Website** — `link.svg` + clickable URL (if present). **Bio** — `about` via `ParsedText` (`bodySmall`).
- **Counts** — `UserStatsRow`: `user.svg` icon + **`<n> Followings   <n> Followers`** (count then label; numbers `.numeral` compact `1.2K`; label words muted). A **"Follows you"** pill (`cardColor`) if the viewed user follows you.
- **Action row** — own: **"Edit profile"**. Other: **Follow/Unfollow** (orange fill when not following) + **zaps** icon (`zaps.svg`, bordered) + **DM** icon (`start-dms.svg`, bordered) + **overflow** menu (copy npub / hex, user relays, share, refresh, mute) + **QR** (`qr.svg`).

**Content tabs** (main `TabBar`, 4): **Notes · Articles · Media · Others**. Sub-tabs (chip `TagContainer`, active = `cardColor`): Notes → **Pinned · Notes · Replies · Mentions**; Media → **All · Pictures · Videos**; Others → **Curations · Smart widgets**; Articles → none.

**Stats surfaces (three distinct — do not conflate):**
- **(A) Home Dashboard** (`dashboard_view/widgets/home/home_dashboard.dart`) — the stats block: cards **Followings · Followers · Notes · Replies · Zaps received · Zaps sent · Total amount**, header **"Joined on: {date}"**, sections **"Latest"** (+ "See all") and **"Popular notes"**. `cardColor` tiles, orange accents.
- **(B) "Impact" sheet** (`un_stats_details.dart`) — Uncensored-Notes reputation: toggles **"Writing impact" / "Rating impact"**, positive/negative/ongoing columns in `kGreen`/`kRed`/`highlightColor`. NOT the zap dashboard.
- **(C) Connections sheet** (`profile_connections_view.dart`) — **followers / followings** lists (tap the counts).

---

## Wallet + zap

Sources: `wallet_view/wallet_view.dart`, `wallet_balance_container.dart`, `external_wallets_list_view.dart`, `send_zaps_view/send_amount_set.dart`.

**Wallet home** (top→bottom):
1. **Selected-wallet row** — "No Wallet Linked" when empty; a `PullDownButton` switches between connected NWC wallets by name.
2. **Redeem** glass button (top of balance card).
3. **Balance block**: label **"BALANCE"** + sats glyph; huge number in **orange `#EE7700`** (`displayLarge`, "N/A" if unset); **fiat line** `"$ 12.34"` with a chevron **currency-dropdown** (`PullDownButton`; `*****` when hidden); **Lightning-address row** + **"Copy LN"** button (`copy.svg`).
4. **Action buttons**: **Receive** (`arrow_downward`, neutral `cardColor`) · **Send** (`arrow_upward`, solid **orange**, white) · centered floating **QR** (`qr.svg`). **[REC vs REPO]** There is **no "Invoice" button on the wallet home** — "Invoice" appears in the zap sheet. No standalone lightning-bolt button.
5. **Transactions list**: direction arrow (↓ incoming **green**, ↑ outgoing **red**), date, sats + counterparty, expandable "Comment".

**External-wallet picker** (`external_wallets_list_view.dart`) — bottom sheet titled **"Wallets"**, 4-col grid; selected tile gets an **orange border**; **"Always use external"** toggle (orange track). Exact list, **`defaultExternalWallet = 'satoshi'` → Wallet of Satoshi is the DEFAULT**: **Wallet of Satoshi · Alby Go · Blue Wallet · Muun · Breez · Zebedee · Zeus LN · Phoenix · Blitz**.

**Connect-a-wallet** (`wallet_options_view.dart`): **"Create Yaki Wallet"** → **"Yaki NWC"** (`logoMarkWhite`); or **"Nostr Wallet Connect"** / **"Alby"**; paste-NWC form.

**Zap sheet** (`send_amount_set.dart`, the "zap sheet"):
- **Amount input** — big `TextField`, hint `0`, text in **orange**; a `repost.svg` toggle flips **SATS ⇄ fiat** with a converted-amount line.
- **Preset chips** (`defaultZaps`, exact, in order): **20 · 100 · 500 · 1000 · 5000 · 10000 · 50000 · 100000** sats. Single-tap default = **21** sats (`defaultZapamount`).
- **Comment** — hint **"Write a comment (optional)"**.
- **Min/Max** chips ("Min sats"/"Max sats") when bounds defined. **Zap Splits** section ("Zap splits", "Split zaps with") when applicable.
- **Action buttons**: **Invoice** (`qr.svg`; "Generate invoices" when split) generates a BOLT11/QR for external/manual pay; **Send** (`send.svg`, orange) pays via the connected NWC/Yaki wallet.

**"Zapped from YakiHonne" attribution — (UNVERIFIED).** No hardcoded literal in the wallet/zap code; it's a NIP-57 zap-receipt convention. YakiHonne's default comment is empty. Brand URL `https://yakihonne.com/`. Treat any "Zapped from YakiHonne" chip as your own faithful convention, not a verbatim string.

---

## Settings + Relays ("Relay orbits") + Notification toggles

**Settings** (`settings_view/settings_view.dart`, `ListView`, title **"Settings"**), exact order (signed-in):
1. **Profile section** — 50px avatar + **"View profile"** (orange fill on mobile) + **"Edit profile"** (`cardColor`).
2. **Keys** (`keys.svg`) · 3. **Relay settings {N / M}** (`relays.svg`; renders e.g. **"Relay settings 10 / 10"**, right-chevron → `RelayUpdateView`) · 4. **Content moderation** (`shuffle.svg`) · 5. **Wallets** (`wallet.svg`) · 6. **Customization** · 7. **Notifications** (`notification.svg`) · 8. **Language preferences** (`translation.svg`) · 9. **Appearance** · 10. **Crashlytics & cache** (internal key `analyticsCache`; label literally **"Crashlytics & cache"**) · 11. **Yaki chest** (`reward.svg`; trailing **"Connected"** orange pill or **"Connect"** button).
- **Delete account** — `OutlinedButton` with **red border** (`kRed #DD2222`), trash icon + red **"Delete account"** text.
- **Version footer** (`property_version.dart`, centered, tappable): **purple chip** (`kPurple #86318C`, 35×35, radius 8) with white logo mark + "YakiHonne" + version string + orange chevron. Tagline: **"We strive to make the best out of Nostr, Support us below or send us your valuable feed: zap, dms, github."** Then 3 icon buttons: **zap** (zap YakiHonne) · **message** (email) · **GitHub**.
- **[REC vs REPO]** repo `main` version = **v2.0.5+189**; the reference recording shows **v19.8+179** (older build). Use the recording's string only when matching that capture.

**Relays — "Relay orbits"** (`explore_relays_view/explore_relays_view.dart`):
- **App bar**: title **"Relay orbits"**, subtitle **"Browse and explore relay feeds"**.
- **Tabs** (`TagContainer` pills): **Following** *(default)* · **Network** · **Collections** · **Global**.
- **Search field**: hint **"Search relay"** (shown on Global, or non-Collections tabs when signed-in).
- **Empty state**: globe icon + **"Engage to expand"** + "Engaging with more users helps you discover new relays…".
- **`RelayBox`** (`cardColor`, `0.5px` border, radius 8): favicon + relay domain + **Online/Offline** status pill (**Online** = green `#00994D` dot/text/border, 10%-alpha fill). Expandable info: **Paid** (`sats.svg`), **Required authentication** (`protected.svg`), **"Followed by {N}"** + avatars, **"Favored by {N}"** + avatars, **latency** `"{ms} ms"` (green <500 / orange <1000 / red ≥1000) + country flag. Footer: **"Browse relay"** (→ `RelayFeedView`) + **"Share"**.

**Notification toggles** (`notifications_customization.dart`, `CupertinoSwitch`, orange active track), exact order + strings:
1. **Push notifications** — "Get instant alerts on your device. Privacy-focused using secure FCM and APNS protocols"
2. **Max mentions** — "Hide notifications from notes with more than 10 user mentions."
3. **Following** — "Get notified when people you follow post new content."
4. **Mentions / Replies** — "Get alerted when someone mentions you or replies to your posts."
5. **Reactions** — "Get notified when some likes or react to your posts." *(sic)*
6. **Reposts** — "Get alerted when someone shares or reposts your content."
7. **Zaps** — "Get notified when you receive Bitcoin tips (zaps) on your posts."
8. **Private messages** — "Get alerted for new direct messages and private conversations."

---

## Search

Source: `search_view/search_view.dart`. (Distinct from `discover_view.dart`, which is a passive feed with NO search bar — do not conflate.)

**Search bar** — `CupertinoTextField` in a **pill** (radius 30) `cardColor` container; grey `CupertinoIcons.search` prefix; placeholder **"Search"**; suffix = spinner (while searching) + clear **×**. Lives in a pinned `SliverAppBar`; live search on every keystroke; auto-focuses ~500ms after mount. AppBar trailing = a settings/relay icon (`FeatureIcons.settings`) → `RelayUpdateView`.

**Result tabs** (`TagContainer` pills, pinned under the bar), exact order: **People · Notes · Articles · Media**. Active pill = subtle `cardColor` fill (`w600`), inactive = transparent — **no underline, no orange**.

**Interests row** (People tab / idle, signed-in): section **"Interests"** + horizontal `#hashtag` chips (rounded, `0.5px` border; selected = `cardColor` fill); tapping runs it as a search. On content tabs with a query, an **"Interested/Remove"** toggle appears (added state = red `#FF4A4A`).

**Idle state**: centered search icon + **"Search in Nostr"** + **"Find people and content"**. **No-results**: `noResKeyword` title + description.

**Person row** (`SearchAuthorContainer`): 40px **circular** avatar (no ring) · **bold display name** (+ optional small grey **"You Follow"** chip) · second line = **NIP-05 handle** via `Nip05Component`. **Verification is encoded by COLOR:** a validated NIP-05 renders the handle in **red `#FF4A4A`**; invalid = muted grey. **No check-mark badge, no follow button** in search results (follow affordance exists in the widget but search passes `hasAction:false`). **"NewsBot"** is just part of an account's display-name string — **no bot chip/badge** exists.

**Content tabs** render: Notes → `DetailedNoteContainer` (full note cards); Articles → `ArticleContainer`; Media → `MediaGrid` (masonry).

---

## Branding / logo / login

**Wordmark:** **`YakiHonne`** — one word, capital **Y** and **H**, lowercase rest. Vector SVG glyph paths (not a font). Developer entity **JustHonne Technologies**; App Store tagline "Your all in one nostr client". IDs: iOS `id6472556189`, Android `com.yakihonne.yakihonne`.

**Logo mark:** a **stylized faceted/angular abstract mark** (6 sharp polygonal facets, needle-sharp point at bottom, two thin spike-tips at top splaying up-right; silhouette leans right) — **NOT literally a leaf/bird/flame** (semantic intent undocumented). Two SVG forms, 3 color variants each (tinted at runtime → treat as monochrome):
- **Mark only** `logo-mark-{white,black,purple}.svg`, `viewBox="0 0 35 61"` (`LogosIcons.logoMark*`).
- **Full logo + wordmark** `logo-{white,black,purple}.svg`, `viewBox="0 0 149 61"`.
- Purple variant fill = **`#7A117E`**. Reproduce the mark from the exact 6-path SVG geometry (`viewBox 0 0 35 61`) in the recon, not a semantic label.

**App icon / launcher:** white mark on a **purple→magenta vertical gradient** rounded-square (`assets/icon.png`); `logo.png` = white mark on flat `#7A117E` purple. **Duality to preserve:** the *icon/logo asset* is **purple**, but the *in-app UI accent* is **orange `#EE7700`**. Onboarding tints the mark near-white and renders the FAB/links/buttons orange. No custom in-Flutter splash (native splash = launcher assets).

**Login / onboarding** (`logify_view/`, "Logify" module; dark scaffold `#171718` + subtle `primaryColorLight` gradient wash; programmatic `PageView`).
**VERIFIED against a second recording, 2026-08-05** (1080×2400, 40s → `shots/onboarding/`, `fps=1` = 40 frames). Every literal below is now read off a real render, not off an i18n key. Frame refs are `shots/onboarding/t_NNN.jpg`.

- **Landing** (`onboarding_option_view.dart` — **t_033**): white logo mark → tagline **"Enjoy the experience of owning / your own data!"** (two lines, centred) → **hero illustration** (`initial_onboarding.png` = a photo of an iPhone on a dark plinth showing the real OLED-black home feed: search bar, Highlights/Art/Writing/Freedom category row, two media cards with "3m read", notes, orange FAB, bottom nav) → filled orange **"Log in"** → **orange-OUTLINED "Create account"** (outline is orange, not neutral) → **"By continuing you agree with our"** + bold orange **"End User Licence Agreement (EULA)"** → **"Continue as a guest ›"** (chevron, not a button-looking control). Buttons are `~10px` radius, **not pills**.
- **Sign-in** (`signin_view.dart` — **t_035** Keys, **t_038** Remote signer): centred bold **"Log in"** title with a back chevron. **Signature: the two methods are not top tabs — they are a pair of cards pinned to the BOTTOM of the screen**, and the selected one is marked by a **1.5px orange border only** (the surface fill never changes).
  - **Keys**: oversized, LEFT-aligned **"Hey,⏎Welcome⏎Back"** (~30dp, the largest type anywhere in the app) → one rounded field with a key glyph and placeholder **"npub, nsec or hex"** → full-width orange **"Paste your key"** (toggles to "Login" once the field has content) → centred muted **"Your keys are stored securely on your device and never shared with us or anyone else."**
  - **Remote signer**: centred bold **"Remote signer"** + **"Use the below URL to connect to your bunker"** → **QR rendered WHITE-on-BLACK** (dark-mode QR, thin light rounded border) → **dashed** rounded box with `nostrconnect://0bbc9b765d6bf7ebaa42…` + copy icon → **"Or"** → `bunker://..` field → orange **"Login"**.
  - Android additionally offers **"Amber"** (external signer). **Sign-in methods: Keys · Remote signer (NIP-46) · Amber.**
- **Create account** (`signup_view.dart`): 5-page `PageView` under a fixed **"Create account"** header (back chevron + centred bold title) and a fixed footer that pairs a **widening page indicator** (active dot stretches into a ~26px pill, the other four stay 5px dots) with a full-width orange button — **"Next"** on pages 1–4, **"Let's get started!"** on page 5.
  1. **Details** (t_004): **"Details"** / **"Share a glimpse of you, in words that feel true."** → cover strip with an **"Add cover"** chip top-right → circular avatar placeholder **overlapping the cover's bottom edge by half** → **"Add picture"** → **"Your name"** field → **"About you"** textarea.
  2. **Starter packs** (t_008): **"Starter packs"** / **"Pick a pack and start your feed with content from its creators"** → rows of `[thumbnail] title / description / 3 overlapping avatars + "+ N others" / chevron in a rounded-square tile`. Real packs seen: Nostr Streamers (47), Nostr Minute | DYOR | DIY (905), Nostr Minute | DYOR (882), Timechain Art Magazine (62), Les Femmes Orange (43), Freedom Tech Signal (119), German speaking users | Deutsch (54), Visionairies, Desenvolvedores Nostr (130), Artisan Traders (47), Desenvolvedores Bitchat (5), Builders Human Architecture (18), Photographers (2), Farmstr & Permaculture (45), Questr-Basic (13). **Several thumbnails are empty dark tiles** — reproduce that, it is what the real screen looks like.
  3. **Interests** (t_013): **"Interests"** / **"Tailor your experience by selecting your top interests"** → rows of `[rounded image tile] name / avatars + "+N people" / orange circular "+"`. Order: Freedom · Bitcoin · News · Technology · Travel · Social · Nostr · Writing · Food.
  4. **Wallet** (t_016): circular grey icon tile (wallet-with-plus) → bold **"Let's get started!"** → **"Create a wallet to send and receive sats"** → a **pill-shaped field holding the chosen name with `@wallet.yakihonne.com` sitting OUTSIDE it to the right** → **orange-outlined "Create wallet"** (outlined here, while the footer "Next" stays filled).
  5. **Preview** (t_019): banner + overlapping avatar + the chosen name → a grey info card with a key glyph and **"You can find your account secret key in your settings. This key is essential to secure access to your account. Please keep it safe and private."** → a **GREEN "Export keys"** button (the only green CTA in the app) → footer **"Let's get started!"**.
  - Submitting shows the provisioning screen (t_020): logo mark + **"Initializing account..."** (Lottie loader in the real app).
- **Guest mode** ("Continue as a guest") lands in the feed with an eye-icon banner: **"View as" / "Your current feed is based on someone else's following list, start following people to tailor your feed to your preference"**, and the drawer collapses to `YakiHonne / Articles / Explore / Relay orbits / Settings` + an orange **"Login ⇥"** button (t_032).
- ⚠️ **Deliberate deviation in the reproduction (safety, not fidelity):** the key field uses `DEMO_KEY_PLACEHOLDER` instead of the real "npub, nsec or hex" and refuses a pasted real nsec — see `src/simulators/shared/utils/keySafety.ts`. Same rule in every reproduction.

**Gamification — "Yaki Chest" / points:** real shipped feature. `points_management_view/` ("Points statistics view": XP/points/tiers, "One-time rewards" / "Repeated rewards"), `rewards_view/` (claim rewards, **"Claim"** button + countdown). **Tier badges**: Bronze → Silver → Gold → Platinum. **Yaki Chest icon** (`yaki_chest.png`) = a 3D open treasure chest of gold coins, front coin bearing the Bitcoin **₿**.

*(Previously UNVERIFIED, now settled by the 2026-08-05 recording: `enjoyExpOwnData` = "Enjoy the experience of owning your own data!", `heyWelcomeBack` = "Hey, Welcome Back", `continueAsGuest` = "Continue as a guest", `letsGetStarted` = "Let's get started!". Note the landing button is **"Log in"** (two words) while the Remote-signer submit is **"Login"** (one word) — both spellings are real and both are used.)*

---

## Fidelity killers

The ~12 details that most define YakiHonne's look and are easiest to get wrong:

1. **Orange, not purple.** Default accent = **`#EE7700`**. Purple (`#6B218D` / `#86318C` / `#7A117E`) is the logo-asset color + a *selectable* accent, never the default UI accent. (Corrects AUDIT.md.)
2. **The purple↔orange duality.** The **app icon/logo is purple**, but the **live UI is orange**. Reproduce both — a purple splash/icon feeding an orange in-app accent.
3. **The logo mark is a faceted angular abstract**, not a leaf/bird/flame. Reproduce from the exact 6-path SVG (`viewBox 0 0 35 61`), needle-tip bottom, two spike-tips top.
4. **Active bottom-nav tab is NOT orange** — it's white/black (`primaryColorDark`) with a **filled icon + tiny 4px dot below**. Only the **compose FAB is orange**.
5. **5 bottom tabs, icon-only, exact order:** Home · Media · Wallet · DMs · Notifications (default Home). Compose is a separate orange FAB, bottom-right, only on Home & Media.
6. **Feed selector labels:** Recent · Recent With Replies · Trending · Global · Paid · Widgets (Recent default) — not generic "For You / Following".
7. **Note action-bar order:** react(**heart**) · reply · repost · quote · zap, with bookmark/share **inside the ⋯ menu**. Zap shows **total sats**, not zapper count. Articles **drop repost**.
8. **Article-centric surfaces:** article cards show **read-time ("N min read"), a square rounded thumbnail on the RIGHT, and a following-check (no Follow button)**; the reader has "Posted by"/"Posted from" rows and a bottom-center **"See translation"** pill.
9. **Wallet-of-Satoshi is the default external wallet**; the picker is a **"Wallets"** grid (orange selected-border). Zap presets: **20/100/500/1000/5000/10000/50000/100000**, single-tap default **21**.
10. **Relays are branded "Relay orbits"** with tabs Following · Network · Collections · Global, Online/Offline pills, "Followed by {N}", "Browse relay".
11. **Search verification is COLOR-only:** a validated NIP-05 handle renders **red `#FF4A4A`** — no check-mark badge, no follow button, no bot chip ("NewsBot" is just a name).
12. **Onboarding is bottom-anchored.** On "Log in" the two sign-in methods (Keys / Remote signer) are **cards pinned to the bottom edge**, selected by a **1.5px orange border only** — never top tabs, never a filled selection. "Create account" is a **5-page wizard** whose footer pairs a widening dot indicator with one orange button; only the last page swaps its own CTA to **green "Export keys"**, while the footer stays orange.
13. **DMSans font + `#171718` near-black dark bg** (not pure OLED by default — OLED `#000000` is a separate "black" theme). Compose is a **bottom sheet** with a **paper-plane** send glyph on an **orange circle** — not an up-arrow.
