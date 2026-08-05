# Nostur (iOS) — Ground-Truth Reproduction Spec

Authoritative spec for a faithful React/Tailwind web reproduction of the **Nostur** iOS Nostr
client. Merged from (a) the owner's screen recording
`docs/refs/nostur/shots/RPReplay_Final1785926123.MP4` (828×1792 @60fps, 291 s, recorded
2026-08-05, gitignored — `RPReplay_Final*` is the iOS ReplayKit naming pattern, and every frame
shows iOS chrome, which independently confirms the platform) and (b) source recon of
`nostur-com/nostur-ios-public@11bcebb` (2026-08-05, "Handle unavailable private reply parents").

**Convention for this file: where the recording and the repo disagree, the RECORDING wins.** Both
values are recorded and the one taken is stated. Divergences are flagged **[REC vs REPO]** and
collected in §16.

## Identity (verified 2026-08-05 from the project's own site and repository)

| Field | Value | Source |
|---|---|---|
| Homepage | `https://nostur.com` | the site itself; also the repo's `homepage` field |
| Repo | `https://github.com/nostur-com/nostur-ios-public` | GitHub API `full_name`, `fork: false`, `archived: false` |
| Repo description | "A nostr client for iOS" | GitHub API |
| License | **GPL-3.0** | GitHub API `license.spdx_id`; `LICENSE` is the stock GPLv3 text |
| Copyright holder | **not asserted in-repo** — `LICENSE` carries only the FSF boilerplate, no per-project copyright line. Authorship is evidenced by every Swift file header, e.g. `Theme.swift:5` "Created by **Fabian Lachman** on 28/08/2023", and by the HEAD commit author "Fabian". | repo files |
| Author contact | `fabian@nostur.com` · `npub1n0sturny6w9zn2wwexju3m6asu7zh7jnv2jt2kx6tlmfhs7thq0qnflahe` | `README.md`, nostur.com |
| Platforms | iPhone, iPad **and macOS** — site tagline "A nostr client for iPhone and macOS"; `README.md:1` says "a nostr client for Mac, iPhone and iPad" | site + README |
| Install | **iOS App Store, app id `1672780508`**; macOS also as a direct `.dmg` (`nostur.com/Nostur-1.30.2.dmg` at time of check); source on GitHub | nostur.com download section |
| Version in the recording | **1.30.2 (Build: 527)** — read off the sidebar footer | frame `f_059` |

**Unverified / deliberately not asserted:** the surname "Lachman" comes from source-file headers,
not from a signed copyright line or the site — it is recorded as evidence, not as a legal
attribution. The repo has no `CONTRIBUTING`/`TRADEMARK` policy, so no stated position on
third-party use of the name or the mark exists. OpenSats/other funding was not checked.

---

## 1. Color tokens

Nostur ships **10 named themes**; the shipped default is literally `"default"`
(`Theme.swift:39` — `UserDefaults "app_theme" ?? "default"`, and the `init()` switch falls through
to `loadDefault()`). Every token below is an asset catalog colour; the file path in the upstream
repo is given for each.

**Light/dark is the OS preference, not a Nostur setting** — `Themes.preferredColorScheme` returns
`nil` for every theme except `dark_garnet` (`Theme.swift:47-56`). The recording is a dark-mode
device, so the sim pins dark and the registry marks `theme: 'dark'`.

### Default theme (the one the recording shows)

| Token | Repo source file | Repo value | Dark (shipped) | Light |
|---|---|---|---|---|
| `accent` | `Themes.xcassets/defaultAccentColor.colorset/Contents.json` | `display-p3(51, 162, 166)`, same in both appearances | **`#00BDA9`** (see note) | same |
| `background` | `Themes.xcassets/defaultBackground.colorset/Contents.json` | sRGB hex components | `#1C1C1E` | `#F2F2F7` |
| `listBackground` | `Themes.xcassets/defaultListBackground.colorset/Contents.json` | sRGB hex components | **`#000000`** | `#FFFFFF` |
| `primary` (body text) | `Themes.xcassets/defaultPrimary.colorset/Contents.json` (`Theme.swift` uses `Color.primary`) | system label | `#FFFFFF` | `#000000` |
| `secondary` | `Color.secondary` (`Theme.swift:15`) | system secondaryLabel | `rgba(235,235,245,.60)` ≈ `#8D8D93` | `rgba(60,60,67,.60)` |
| `secondaryBackground` | `Themes.xcassets/defaultSecondaryBackground.colorset/Contents.json` | **reference** to `secondarySystemBackgroundColor` | `#1C1C1E` | `#F2F2F7` |
| `lineColor` | `Themes.xcassets/defaultLineColor.colorset/Contents.json` | `display-p3(51,162,166)` **@ alpha 0.35** (light: 0.40) | accent @35% | accent @40% |
| `footerButtons` | `Themes.xcassets/defaultFooterButtonsColor.colorset/Contents.json` | `display-p3(51,162,166)` | = accent | = accent |
| `badge` | `Color.red` (`Theme.swift:18`) | system red | `#FF453A` | `#FF3B30` |

> **The accent, and why the sim ships `#00BDA9`.** The repo stores the accent in **Display P3**,
> not sRGB, so there are three candidate numbers: the naive component hex `#33A2A6`, a
> colorimetric P3→sRGB conversion `#00A5A8` (red clamps — the colour is outside sRGB), and what
> the device actually painted, sampled from a solid 20×20 patch of the compose FAB in two
> independent frames: **`#00BDA9`** (`f_032`, `f_044`). Per this file's rule the recording wins;
> `#00BDA9` is what a visitor sees and what the sim uses. The repo value is the citation.
>
> **`lineColor` is accent-tinted, and that is not a mistake** — Nostur's hairlines are teal at 35%,
> not neutral gray. The *post separator* in the feed is a plain SwiftUI `Divider()`, though, and
> measures neutral (`#1F1D20` peak); do not use `lineColor` for it.

### The other nine themes (`Theme.swift:96-118`, accent colorsets in `Themes.xcassets/`)

`classic` p3(51,121,189) · `green` p3(20,135,18) light / p3(27,201,60) dark · `blue` p3(13,166,216)/p3(17,197,255) ·
`purple` p3(131,16,111)/p3(140,44,146) · `red` p3(203,59,73)/p3(208,2,10) · `pink` p3(255,50,221) ·
`orange` p3(255,103,3) · `bw` (no components — system reference) · `dark_garnet` p3(184,20,36)/p3(204,10,31),
the **only** OLED theme (`isOledTheme`, forces `.dark`). None of them is teal — which is how we
know the recording is on `default`, not a picked theme.

### Hardcoded literals outside the theme (each cited)

- Reaction active: **`.red`** (`Post/PostFooter/EmojiButton.swift:33`) — iOS dark `#FF453A`.
- Repost active: **`.green`** (`Post/PostFooter/RepostButton.swift`) — `#30D158`.
- Zap active: **`.yellow`** (`Zaps/NIP47-NWC/ZapButton.swift:924`) — `#FFD60A`.
- Bookmark active: `footerAttributes.bookmarkColor`, **default `.orange`**
  (`Post/PostFooter/BookmarkButton.swift:438` `addBookmark(_ color: Color = .orange)`) — `#FF9F0A`.
  Long-press offers brown / red / blue / purple / green / orange.
- Zap amount buttons: **`.orange`** fill, 5 pt stroke (`Zaps/ZapCustomizer/ZapAmountButton.swift:21-23`).
- Detail stats row: **`.gray`**, 14 pt (`Post/DetailFooterFragment.swift`) — `#8E8E93`.
- Onboarding backdrop `wowBackground()` (`Utils/View+wowBackground.swift`): linear gradient
  **`#2BF5EB` (bottom-trailing) → `#267A40` (top-leading)**, clipped `RoundedRectangle(20)`.
  This is the only brand gradient in the app.
- Sidebar version line: `Color.red` (`Screens/Layout/Sidebar.swift`, comment: "So we can quickly
  check if we are in debug or release build"). **[REC vs REPO]** the recording's release build
  renders it gray — see §16.
- Missing profile picture = a **flat, seeded random solid colour** (`Utils/Color+random.swift`
  `randomColor(seed:)`, `srand48` on the pubkey's scalar sum). No initials, no monogram, no image.
  Sampled example in `f_032`: `#68FF49`.

## 2. Logo / identity mark

- App icon: `Assets.xcassets/NosturLogo.imageset/NosturLogo1024.png` (1024², sRGB) — a **white
  stylised ostrich** (long neck, tiny head with two small crest feathers, splayed tail/feet) on a
  dark slate ground with a long diagonal drop shadow to the lower-right.
- Vector form: `NosturIcon.icon/Assets/Logo Black.svg` — 687.7² viewBox, one path
  (`id="XMLID_165_"`), glyph only, solid black on transparent (unusable on a dark card as-is).
- **Where the mark appears in-app:** the Home tab's `.principal` toolbar slot renders
  `Image("NosturLogo")` at 30 pt **clipped to a `Circle()`** (`Screens/MainTabs/Home/HomeTab.swift`),
  which is exactly the dark disc with a white bird visible top-centre in every feed frame.
  Tapping it scrolls the feed to top.
- Wordmark: plain system text "Nostur", capital N, no custom typeface anywhere.

## 3. Typography

100% system: SF Pro via SwiftUI text styles. No bundled font files
(`Nostur/Utils/UIFont+Nostur.swift` only adapts system fonts). Sizes seen in the specs read:
footer icon row `.system(size: 14)` (`CustomizableFooter.swift`), detail stats `.system(size: 14)`,
tab labels `.subheadline`, tab secondary text `.caption`, unread badge `.footnote`, sidebar name
`.headline`, welcome title `.largeTitle`.

## 4. App shell

### Bottom tab bar — 5 tabs (`Screens/MainTabs/MainTabs.swift`, `MainTabs15`)

`house` **Home** · `bookmark` **Bookmarks** · `magnifyingglass` **Search** · `bell.fill`
**Notifications** (badge) · `envelope.fill` **Messages** (badge). Icon-only, no labels. Selected
tints the accent, unselected is the system gray (`#8E8E93`); sampled `#00BDA9` / `#838184` in
`f_044`. Native iOS tab bar on `background`, hairline top divider.

**[REC vs REPO]** the repo also has `MainTabs26` (iOS 26+) whose fifth tab is **New Post**
(`plus`, `role: .search`) and which has **no Messages tab** — Messages moves into the sidebar
instead. The recording device runs the pre-26 path: envelope tab present, no plus tab, and a
separate floating compose button. **Sim ships the recording's `MainTabs15` shape.**

### Compose FAB (`ViewFragments/NewPostButton.swift`)

`Label("New post", systemImage: "plus")`, `.font(.title)`, bold, icon-only, glass button style
tinted `theme.accent`, `buttonBorderShape(.roundedRectangle(radius: 45))`. Renders as a solid teal
**squircle** roughly 112×104 px in the recording (not a circle), white bold plus, floating bottom-
right above the tab bar and over the feed content. Present on Home/Bookmarks/Profile; not on
Messages.

### Sidebar (`Screens/Layout/Sidebar.swift`)

`NOSTUR_SIDEBAR_WIDTH = 310` pt — ≈75 % of a 414 pt screen, matching the recording. Opened by
tapping the account avatar in the Home toolbar. Slides in over a dimmed feed,
`withAnimation(.easeOut(duration: 0.1))`. Panel background = `listBackground` (black).

## 5. Home top bar (`Screens/MainTabs/Home/HomeTab.swift`, pre-26 toolbar)

Three toolbar slots, all on `listBackground`:

| Slot | Content | Behaviour |
|---|---|---|
| leading | `PFP(size: 30)` — the active account's avatar | tap → open sidebar (`accessibilityLabel "Account menu"`) |
| principal | `Image("NosturLogo")` 30 pt, `clipShape(Circle())` | tap → scroll feed to top |
| trailing | `tortoise` SF Symbol, `theme.accent.opacity(lowDataMode ? 1.0 : 0.3)` | tap toggles Low Data Mode and posts the status toast **"Low Data mode: enabled" / "Low Data mode: disabled"** |
| trailing | `gearshape`, accent | tap → feed-settings sheet (`sendNotification(.showFeedToggles)`) |

The tortoise being a **dimmed 30 % teal when Low Data Mode is off** is a signature detail — it
looks half-broken and is meant to.

## 6. Feed sub-tabs (`Screens/MainTabs/Home/MainFeedsScreen.swift` + `ViewFragments/TabButton.swift`)

Horizontal `ScrollView` of `TabButton`s, `MAINFEEDS_TABS_HEIGHT = 42`, `Spacer()` between each.

**`TabButton` is the fidelity trap: the label is `theme.accent` whether selected or not.**
Selection is signalled *only* by a 1 pt `theme.accent` bar under the button
(`opacity(selected ? 1 : 0)`), height 41 for the label row. Optional `secondaryText` renders at
`.caption` in `accent.opacity(0.5)`; an `unread` count renders white on a `theme.badge` (red)
capsule, offset `y: -2`, and drops to 25 % opacity when `muted`.

**The recording shows exactly three tabs: `Following` · `Discover` · `Explore`.** That is not a
trimmed-down build — most tabs are gated behind `la.viewFollowingPublicKeys.count > 10` and the
recorded account follows 2 people. The full repo list, in order:
Following · [Picture `photo`] · [Yak `waveform.circle`] · [Vine `person.crop.square.badge.video`] ·
[user lists] · [Emoji `LaughterIcon`/`RageIcon` + "Nh"] · [Zapped + "Nh"] · [Hot + "Nh"] ·
**Discover** (= DiscoverLists, ungated) · [Live Streams] · [Gallery + "Nh"] · **Explore** (ungated) ·
[Articles]. **Sim ships the recording's three** and documents the rest here.

## 7. Post card

Flat, full-bleed, on `listBackground` (**pure black**) — no card surface, no inset, no radius.
Separator between posts is a neutral full-width hairline. Top to bottom (`f_044`, `f_057`):

1. **Repost header** — `arrow.2.squarepath` ~18 px gray + 24 px reposter avatar + "{name}" in
   **secondary gray bold**. (No "reposted" word; the icon carries it.)
2. **Author row** — 50 px circular avatar, aligned top-left. Right of it a two-line stack:
   name in **bold white ~19 px**, then a row of "20h" (secondary gray) + **"Follow"** in bold
   accent. Far right: `•••` ellipsis in **accent**.
3. **Content** — white, ~19 px, blank lines preserved. Mentions (`@name`), hashtags (`#Bitcoin`)
   and links render in **accent, no underline** (`ContentRenderer` passes `accentColor: theme.accent`).
4. **Show-more** — when clamped, `ShowMoreChevronButton` (`Post/ReadMoreButton.swift`):
   `chevron.compact.down` **white** on a `RoundedRectangle(cornerRadius: 5)` filled `theme.accent`,
   padding 5 (+5 top), outer padding 10. Sits bottom-right of the content block. Tapping the body
   also expands ("Show-more is chevron-only so it doesn't steal taps from nested embeds" —
   `ContentRenderer.swift:47`).
5. **Media** — `fullWidthImages` defaults **true** (`SettingsStore.swift:216`), so images run
   **edge to edge with no corner radius**. With Low Data Mode on, media is replaced by a
   `background`-coloured block reading *"Loading paused (Low data mode)"*, the URL in italic
   secondary, and a teal **"Load anyway"** link.
6. **Link preview** — `secondaryBackground` rounded card (~12 px) with a `link` chain glyph in
   gray and the URL in gray.
7. **Action bar** (`Post/PostFooter/CustomizableFooter.swift`) — `HStack(spacing: 0)` with a
   `Spacer()` between every button, i.e. **evenly distributed across the full width**, 14 pt,
   `foregroundColor(theme.footerButtons)`, padding top 5 / bottom 16. Counts sit to the right of
   the icon and are **hidden at 0**.

The button set comes from `SettingsStore.Keys.footerButtons`, whose **shipped default is
`"💬🔄+⚡️🔖"`** (`Screens/Settings/SettingsStore.swift:228`). The `+` slot is the `EmojiButton`,
which renders a **heart**:

| # | Action | Icon (SF Symbol) | Active state |
|---|---|---|---|
| 1 | Reply | `bubble.left` → `bubble.left.fill` | `theme.accent` |
| 2 | Repost | `arrow.2.squarepath` | `.green`; **dimmed to 30 %** when the post is private |
| 3 | React | **`heart` → `heart.fill`** (`EmojiButton.swift:32`) | `.red`. If you pick a custom emoji it **replaces the heart glyph** with that emoji |
| 4 | Zap | `bolt` → `bolt.fill` (→ `hourglass.tophalf.filled` while sending) | `.yellow`; count is a **sat tally** + the literal word "sats", plus a fiat string at 50 % opacity when `showFiat` |
| 5 | Bookmark | `bookmark` → `bookmark.fill` | `.orange` by default, no count |

The zap button is dimmed to **opacity 0.3 and disabled** when the author has no lightning address
(`CustomizableFooter.swift`) — visible on most rows in the recording.

`IS_NOT_APPSTORE` gates the zap button, but it is defined as
`((infoDictionary["NOSTUR_IS_DESKTOP"] as? String) ?? "NO") != "NNO"` — `"NNO"` is never the value,
so the guard is always true and the zap button always ships. Recorded as a quirk, not acted on.

## 8. Thread / post detail

Same PostCard, plus `DetailFooterFragment` above the action bar: a `.gray` 14 pt row
**"N reactions · N reposts · N mentions · N zaps"** (labels from `DetailFooterFragment.swift`,
localized as "reactions"/"reposts"/"mentions"/"zaps"). Nav bar: teal `< {previous tab name}` back
button (e.g. "< Following", "< Explore") and the bold white title **"Post"**.

## 9. Profile (`Profiles/ProfileView.swift`, `Profiles/ProfileBanner.swift`)

- Nav bar: teal `< {origin}` · centred **small avatar + display name** (bold white) · trailing
  **"Edit profile"** pill on own profile (gray capsule, white bold caption).
- Banner: `BANNER_HEIGHT` crop, parallax `scaleEffect` on pull. **Fallback when the user has no
  banner is `LinearGradient(colors: [theme.listBackground, theme.accent])`** — a teal-to-black
  ramp (`ProfileBanner.swift:93`). This is what the sidebar header shows too.
- Avatar overlaps the banner, ringed 3 pt in `listBackground`.
- Header actions: bell (notify-on-post), **"Edit profile"** / Follow, `•••`.
- Name bold; npub truncated with a teal copy glyph; **"Last seen: Nm ago"**; bio; a stats line
  **"N Following   ∞ Followers"** — the follower count renders as the literal **infinity sign**
  until it is known.
- Tabs (`TabButton`s, all accent, underline on the active one):
  **Posts · Replies · Media · Reactions · Zaps · Relays**.
- Someone else's profile shows **"Followed by N others you follow"** under the Follow button.
- `FollowButtonInner` (`Screens/Layout/NosturStyles.swift`) is **monochrome, not accent**:
  105×30, `.caption.weight(.heavy)`, capsule radius 20 with a 1 pt gray stroke; not-following =
  black bg + white text (dark mode), following = white bg + black text, and the private-follow
  state prefixes the label with **"🤫 Following"**.

## 10. Notifications (`Screens/MainTabs/Notifications/NotificationsScreen.swift`)

`navigationTitle("Notifications")`, trailing gear. Six **icon-only** `TabButton`s with red unread
capsules: `text.bubble` **Mentions** · `bell` **New Posts** · `heart` **Reactions** ·
`arrow.2.squarepath` **Reposts** · `bolt` **Zaps** · `person.3` **Followers**. Entering the tab
auto-selects the first tab that has unread items (`MainTabs.swift`).

Rows: avatar + name + teal **Follow** + gray "Replying to @x and @y" + the note body, then the
same action row. Grouped reactions render as **"X and N others reacted on your post"** with the
target note quoted underneath and a **"Show more"** pill.

## 11. Messages (`Screens/MainTabs/DMs/`)

- Title **"Messages"**, trailing teal `square.and.pencil` (new conversation) + `gearshape`.
- Two `TabButton`s: **"Accepted" | "Requests"**.
- A teal **"Upgrade your DMs"** pill sits under the tabs; tapping it opens a sheet explaining
  NIP-17: *"Publish on which relays you wish to receive DMs. This enables you to use a more private
  messaging format (NIP-17). Others who have not upgraded can still communicate with you using the
  older format (NIP-04)."*
- Empty state: **"You have not received any messages"**.
- New conversation sheet: teal `X` · bold **"Private conversation"** · gray disabled **"Start"**;
  "Search contacts" field; segmented **Following | All**.
- Conversation: `< Messages` · **"To: {name}"** · `ⓘ`. Above the first message, the recipient card:
  big avatar, name, npub, "Last seen: 20m ago", Follow button, "Followed by 0 others you follow".
  Date headers "2026" / "Wed, 5 Aug". **Own bubbles are solid accent teal, right-aligned**, with
  the time below. Input bar: "Type your message…" + a teal circular `arrow.up` send button.

## 12. Search (`Screens/MainTabs/Search/Search.swift`)

`navigationTitle("Search")` with the account avatar in the leading slot. `SearchBox` with prompt
**"Search..."**, a magnifier leading glyph and a filled `xmark.circle` clear button. Results are
profile rows (avatar, bold name, teal **Follow**, gray bio) — and for a hashtag query, a
**"#introductions"** header row with its own Follow pill, then matching notes as full PostCards.

## 13. Compose ("New Post")

Full-screen: teal `X` close, trailing toolbar, teal `paperplane` send. Avatar + placeholder
**"What's happening?"**. Attachment toolbar above the keyboard (left to right in the recording):
photo library · camera · video · **GIF** badge, plus voice/waveform. Reply mode shows
"Replying to @{name}" above the field.

## 14. Zap sheet — "Send sats" (`Zaps/ZapCustomizer/ZapCustomizer.swift`)

`navigationTitle("Send sats")`, `Cancel` (`xmark`) in the toolbar.

- **Sixteen 75×75 orange circles in a 4×4 grid**, 5 pt stroke (`theme.background` when unselected,
  `.orange` when selected), unselected at 0.75 opacity. White bold compact-notation amount, fiat
  price beneath at white@75 % (`ZapAmountButton.swift`).
  Amounts, in order: **3 · 21 · 100 · 500 / 1k · 2k · 5k · 10k / 25k · 50k · 100k · 200k /
  500k · 1M · [last custom] · Custom**.
- **Default selection = 21** (`SettingsStore.swift:203` `defaultZapAmount: 21`).
- Then: your avatar + **"Add public note (optional)"**.
- Full-width accent button **"Send {amount} sats to {name}"**.
- Three toggle rows: **"Remember this amount for all zaps"** · **"Private zap"** ·
  **"Send anonymously"**.
- When a wallet is connected the sheet is topped by **"Your balance:"**.
- Success plays a `lightningStrike` effect (`LightningEffect.swift`, `Thunderzap16.m4a`).

## 15. Sidebar + Settings

### Sidebar (`Screens/Layout/Sidebar.swift`) — verbatim from `f_059`

Header: banner (teal→black gradient fallback) · 96 px avatar overlapping it with a 3 pt
`listBackground` ring · bottom-right of the banner, the `FastAccountSwitcher` avatar + a teal
`ellipsis.circle` (25 px) opening the accounts sheet.
Then: name `.headline` · npub truncated + teal copy glyph (`CopyableTextView`) · **"**2**  Following"**
(count bold, label regular, `.caption`) · `NWCWalletBalance` on the right when a wallet is connected.

Rows — 30 pt icon column, accent icon **and** accent label, 8 pt vertical padding:

| Row | SF Symbol |
|---|---|
| Profile | `person` |
| Lists & Feeds | `list.bullet.rectangle` |
| Bookmarks | `bookmark` |
| *(Messages — iOS 26 only, `envelope`)* | — |
| Badges | `medal` (`rosette` pre-iOS-16) |
| Settings | `gearshape` |
| Block list | `person.badge.minus` |
| Signer | `signature` |
| Log out | `rectangle.portrait.and.arrow.right` |

Footer: **"Nostur 1.30.2 (Build: 527)"** then a teal underlined **"Source code"** link to the repo.
No Messages row in the recording — see §16.

### Settings root (`Screens/Settings/`)

Grouped `Form` rows, each with a small accent glyph and a chevron:
**Appearance** · **Posting & Media Uploading** · **Zaps** · — · **Relay Connections** ·
**Spam Filtering** · *DATA USAGE*: **Low Data Mode** (toggle, default OFF) · **Database & Cache** ·
*ACCOUNT*: **Private key** · **Delete account** (red).

- **Appearance**: "Reaction buttons" (emoji strip) · "Show zaps fiat value" ON · "Fetch counts on
  timeline" ON · "Auto scroll to new posts" OFF · "Hide posts you have already seen (beta)" ·
  "Loading indicator" · "We Don't Need No Stinkin' Badges" · "Include Nostur caption when sharing
  posts" ON · "Show extra relays used on post preview".
- **Zaps**: *ZAPPING* — "Lightning wallet", **"Default zap amount: 21"**; *APPEARANCE* —
  "Show fiat value", "Fiat currency".
- **Relay Connections**: "Configure your relays… / Relays Nostur uses to find or publish content" ·
  "Announce your relays… / Relays others will use to find your content" · **Autopilot** (OFF,
  "Automatically connect to additional relays from people you follow to reduce missing content
  that can't be found on your own relay set") · **Follow relay hints** ON · **VPN detection** ON
  with a red "VPN not detected" line · "Relay connection stats".
  The relay list screen explains: *"These relays are used for all your accounts, and are not
  announced unless configured on the account specific tabs."*, one row per `wss://` URL with two
  green read/write dots, and a teal **"Add new relay…"**.
- **Spam Filtering**: "Web of Trust filter: Normal" · "Main account" · **"Nostr Dunbar Number"**
  segmented **250 | 500 | 1000 | 2000 | All** (default 1000) · "Last updated: Never" + teal
  "Update" · "Currently allowed by the filter: N contacts" · "Media downloading: Web of Trust only" ·
  *MESSAGE VERIFICATION* "Verify message signatures" ON.

### Lists & Feeds ("Feeds")

Title **"Feeds"**, trailing "Edit" + `+`. Section *DEFAULT FEEDS*, one toggle row per feed with a
one-line description: **Pictures** ("Pictures-only feed from people you follow") · **Yaks** ("Voice
Messages feed from people you follow") · **Divines** ("Short videos feed from people you follow") ·
**Zapped** · **Hot** · **Follow Packs & Lists** · **Live Streams** · **Funny Feed** · **Gallery**.

### Bookmarks / Badges

- Bookmarks: segmented **"Bookmarks ⊕" | "Private Notes"**, plus a "Search in bookmarks…" field.
- Badges: **Issued | Received** tabs and a teal **"Create new badge"** action, whose sheet has
  Code, Name, Description, Image URL (1024x1024) and Thumbnail URL (256x256) fields.

### Discover tab

Cards for follow-packs/lists: bold title + teal **"Show preview"** chip, a dense row of member
avatars, "{name}, {name}, {name} and N more", and "by {curator}" with a small avatar.

## 16. [REC vs REPO] divergence log

| Topic | Recording (2026-08-05, v1.30.2 b527) | Repo @11bcebb | Verdict for the sim |
|---|---|---|---|
| Bottom tab bar | 5 tabs ending in `envelope.fill` **Messages**; separate floating `+` FAB | `MainTabs26` (iOS 26+) replaces Messages with a **New Post** tab and moves Messages to the sidebar; `MainTabs15` matches the recording | **recording** — envelope tab + separate FAB |
| Sidebar "Messages" row | absent | present, but `if #available(iOS 26.0, *), !IS_CATALYST` | **recording** — no Messages row |
| Feed sub-tabs | 3: Following / Discover / Explore | 13 possible; 10 of them gated on `viewFollowingPublicKeys.count > 10` | **recording** — ship 3, document 13 |
| Accent hex | painted `#00BDA9` | `display-p3(51,162,166)` → naive `#33A2A6`, colorimetric sRGB `#00A5A8` | **recording** — `#00BDA9` |
| Sidebar version line | gray | `Color.red` unconditionally in source | **recording** — gray (release build) |
| Zap button availability | present on every post (dimmed where the author has no LN address) | gated on `IS_NOT_APPSTORE`, which compares against the never-used literal `"NNO"` and is therefore always true | agree — always ship it |
| Low Data Mode | **ON** during the recording (media replaced by "Loading paused" blocks) | default **OFF** (`SettingsStore.swift:226`) | **repo default OFF**, but the sim keeps the tortoise toggle and both media states, because the toast and the paused block are the recording's most distinctive moments |

## 17. Signature details (get these right)

1. **Teal on pure black.** `listBackground` is `#000000`, not `#1C1C1E`; `background` (`#1C1C1E`)
   is only for chrome and media placeholders.
2. **Tab labels never change colour.** Every `TabButton` is accent whether selected or not; only a
   1 px underline moves. Copying the usual "gray inactive → white active" pattern is instantly wrong.
3. **The action row is space-between across the full width**, five icons, counts hidden at 0, and
   the whole row is accent until an action fires — then exactly one icon takes a system colour
   (red heart, green repost, yellow bolt, orange bookmark).
4. **The heart is the reaction button** (`+` = `EmojiButton`), and a custom emoji *replaces* it.
5. **Full-bleed media, no corner radius** (`fullWidthImages` default true).
6. **The dimmed tortoise** in the toolbar, and the "Low Data mode: enabled/disabled" toast.
7. **`•••` and the whole sidebar are accent-tinted** — Nostur tints far more chrome accent than
   its peers, including hairlines (`lineColor` = accent @35 %).
8. **Author name and timestamp stack on two lines**, with "Follow" inline next to the timestamp.
9. **Missing avatars are flat seeded colours**, not initials.
10. **"∞ Followers"** until the count is known.
11. **The teal show-more chevron chip** (radius 5, white `chevron.compact.down`).
12. **Sixteen orange coins** in the zap sheet, 21 preselected.
13. Sidebar footer prints the exact build: **"Nostur 1.30.2 (Build: 527)"** + "Source code".

## 18. Recording coverage vs repo-only

**Verified against recording frames:** feed (Following, Discover, Explore) · top bar (avatar /
logo / tortoise / gear) · feed-settings sheet ("Following Feed settings": Show replies, Remember
feed) · post card in every state (repost header, reply, media, Low-Data placeholder, link preview,
show-more chevron, counts, orange bookmark) · post detail + stats row · thread · own and other
profiles (all six tabs) · sidebar + footer · Feeds (Lists & Feeds) · Bookmarks · Badges +
"Create new badge" · Settings root, Appearance, Zaps, Relay Connections, relay list, Spam Filtering ·
Notifications (six tabs, grouped reactions, "Show more") · Messages (empty, Accepted/Requests,
"Upgrade your DMs" sheet, new-conversation sheet, conversation with own teal bubbles) · Search
(profiles, hashtag) · compose + keyboard · zap sheet ("Send sats", 16 coins, toggles) ·
repost/quote sheet · "Low Data mode: enabled/disabled" toasts.

**Repo-only (no recording render):** onboarding (`WelcomeSheet`, `AddExistingAccountSheet`,
guest account) · light appearance · the nine non-default themes · iPad/macOS column layouts ·
NWC wallet balance · live streams · Gallery/Picture/Yak/Vine/Emoji/Zapped/Hot/Articles feeds ·
badge issuance · block list · signer.

Cross-cutting for the sim: every avatar and every image is local (inline SVG + `data:` URIs — the
real app hotlinks profile pictures and media); every identity is fictional, from `src/data/mock`;
the onboarding key field goes through `shared/utils/keySafety.ts`; the theme is pinned dark
because the recording is dark and Nostur's default theme has no opinion of its own
(`preferredColorScheme` is `nil`).

## 19. Fidelity pass — side-by-side verdicts (2026-08-05, sim vs recording frames)

Live click-through of `src/simulators/nostur/` at 1440×900 (framed) and 390×844 (full-bleed):
**0 console errors** in a fresh tab, **0 external hosts** in `performance` resource entries
(only `localhost`), **0 nested buttons**, no invalid `<div>`-in-`<p>` nesting, no horizontal
overflow, `--nostur-accent` computes `#00bda9`, SIMULATION strip present at both widths.

| Surface | vs frame | Verdict |
|---|---|---|
| Welcome / add existing account | repo-only | ✅ `wowBackground` gradient (cyan bottom-right → green top-leading), three capsule buttons, Terms block at 60 %; key field refuses a real-looking nsec via `keySafety.ts` |
| Feed + toolbar | `f_032`, `f_044` | ✅ avatar / circular app mark / dimmed tortoise / gear; three accent tabs with the underline as the only selection cue; flat black rows, repost header, two-line author block, `•••` in accent |
| Post card actions | `f_044`, `f_057` | ✅ reply → repost → heart → bolt → bookmark, space-between, counts hidden at 0, zap dimmed without a lightning address, bookmark fills orange |
| Media + Low Data Mode | `f_034`, `f_044` | ✅ full-bleed no-radius images; tortoise toggles the "Loading paused (Low data mode)" block + "Load anyway" and posts the "Low Data mode: enabled/disabled" toast |
| Show-more chevron | `f_044` | ✅ accent chip, radius 5, white `chevron.compact.down` |
| Discover (follow packs) | `sheet_1` | ✅ title + accent "Show preview" chip, overlapping member avatars, "…and N more", "by {curator}" |
| Post detail | `f_034` | ✅ "< {origin} / Post" bar + the gray "N reactions · N reposts · N mentions · N zaps" row |
| Profile | `f_057` | ✅ nav bar (back / avatar+name / "Edit profile"), teal→black banner fallback, ringed avatar, "Last seen", "∞ Followers", six-tab scrollable rail |
| Notifications | `f_051` | ✅ centred title + gear, six icon-only tabs with red unread capsules, grouped-reaction rows + "Show more" |
| Messages + conversation | `f_145`, `sheet_5` | ✅ centred title, compose+gear, Accepted/Requests, "Upgrade your DMs" pill and its NIP-17 sheet, new-conversation sheet (X / title / disabled "Start" / Following‑All), recipient card, accent right-aligned own bubbles, circular send |
| Search | `sheet_3`, `sheet_5` | ✅ account avatar + centred "Search", "Search..." prompt, profile rows with Follow, hashtag header row with its own Follow chip |
| Compose | `f_059`-adjacent | ✅ X / paperplane, "What's happening?", attachment strip (photo · camera · video · GIF · voice) |
| Zap sheet | `f_021` | ✅ "Send sats", 4×4 orange coins with fiat captions, **21 preselected**, "Add public note (optional)", accent "Send 21 sats to {name}", three toggles |
| Sidebar | `f_059` | ✅ banner gradient, 3 pt-ringed avatar, account switcher + `ellipsis.circle`, npub + copy glyph, "**2** Following", eight accent rows in the repo's order (no Messages row), "Nostur 1.30.2 (Build: 527)" + "Source code" |
| Settings root + Relay Connections + Spam | `sheet_2`, `sheet_3` | ✅ grouped rows, DATA USAGE / ACCOUNT sections, red "Delete account"; Autopilot / Follow relay hints / VPN detection with the red "VPN not detected" line; relay list copy + read/write dots + "Add new relay..."; Dunbar segmented control |
| Lists & Feeds / Bookmarks / Badges | `sheet_2` | ✅ "DEFAULT FEEDS" toggle rows with captions; Bookmarks/Private Notes + search field; Issued/Received + "Create new badge" |
| Guided tour | — | ✅ 9 steps drive sign-in / feed / turtle / action row / zap sheet / sidebar / settings, one command per step, completes with no errors |
| Light appearance | repo-only | ✅ the same "default" theme's light colorset values via `useParentTheme`; registry still opens dark |

Known deltas (accepted): lucide icons approximate SF Symbols; the feed shows the recording's three
sub-tabs rather than the repo's full thirteen (the rest are gated on following > 10 people — §16);
thread replies are stand-ins drawn from the same mock roster rather than a real reply tree; Badges,
Block list and Signer are empty states because the recording never populates them; profile tabs
other than Posts/Relays reuse the same note set.
