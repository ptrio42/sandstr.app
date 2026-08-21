# Boris — screen map (ground truth)

**What this is.** The authoritative description of the **real** Boris, the reference every line of
`src/simulators/boris/` must be traceable to. Read it before changing that directory; your memory is
not a source and neither is our reproduction.

## Provenance

| Layer | Source |
| --- | --- |
| Layout, states, what a real session looks like | Owner's Android screen recording, 2026-08-21, 3 min 52 s, 1080×2400 — `shots/screen-20260821-122851-*.mp4` (untracked; `shots/.gitignore` keeps recordings out of git) |
| What each element *is*, exact strings, exact hex | `dergigi/boris-android` **@ `8456da4`** = release **1.4.49**, 291 Kotlin files. The app prints that pair itself in its settings footer, so the recording and the checkout are the same build. |
| Design-system contract | `DESIGN.md` at that repo's root (a token manifest in front-matter, then prose) |

Upstream: **MIT**, © Gigi (`dergigi`). Website `readwithboris.com`, web app `read.withboris.com`.
Attribution and what we copied vs referenced: [`../../../THIRD-PARTY.md`](../../../THIRD-PARTY.md).

Citations below are `path/to/File.kt:LINE` **relative to the boris-android checkout**, unless the path
starts with `src/`, which means this repo.

## 0. What Boris is, and why it does not look like the other nine

Boris is a **reader**, not a social client. There is no compose button, no reply, no notifications
tab, no DM. What it has instead is an article, other people's highlights on that article, and a way
to add your own. Two consequences shape everything below:

- **Signed out is a first-class state, not a wall.** Home, Feeds, Search and the entire reader work
  with no account. Only Library and You ask you to connect, and both ask politely rather than
  blocking (`strings.xml:19-20`, `:403-405`). Nine of the twelve clients in this repo open on a
  sign-in screen; Boris opens on content, and our reproduction opens signed out for that reason.
- **The bottom bar exists only on the five tabs** (`ui/BorisApp.kt:216`). Reader, Settings, About,
  Support, Profile and the in-app browser are full-bleed. That absence is most of why the app feels
  calm, and dropping a persistent tab bar into the reader would be the single most un-Boris thing a
  reproduction could do.

## 1. Tokens

### 1.1 Themes — three dark, three light, and neither default is the obvious one

`ui/theme/Theme.kt:41-129` builds six Material 3 schemes. The shipped defaults are
`darkColorTheme = "midnight"` and `lightColorTheme = "sepia"` (`data/UserSettings.kt:34,39`) — **not**
black and **not** paper white. Appearance itself defaults to `"system"` (`UserSettings.kt:29`).

| Role | dark `black` | dark **`midnight`** | dark `charcoal` | light `paper-white` | light **`sepia`** | light `ivory` |
| --- | --- | --- | --- | --- | --- | --- |
| `primary` | `#6366F1` | `#6366F1` | `#6366F1` | `#4F46E5` | `#4F46E5` | `#4F46E5` |
| `onPrimary` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |
| `secondary` | `#38BDF8` | `#38BDF8` | `#38BDF8` | `#3B82F6` | `#3B82F6` | `#3B82F6` |
| `background` = `surface` | `#000000` | `#18181B` | `#1C1C1E` | `#FFFFFF` | `#F4F1EA` | `#FFFFF0` |
| `onBackground` = `onSurface` | `#E4E4E7` | `#E4E4E7` | `#E4E4E7` | `#111827` | `#2D2A24` | `#1A1A18` |
| `surfaceVariant` | `#0A0A0A` | `#27272A` | `#2C2C2E` | `#F5F5F5` | `#EBE6DB` | `#FAF8F0` |
| `onSurfaceVariant` | `#A1A1AA` | `#A1A1AA` | `#A1A1AA` | `#374151` | `#5D5A54` | `#4A4A48` |
| `outline` | `#1A1A1A` | `#3F3F46` | `#3A3A3C` | `#E5E7EB` | `#D4CFC4` | `#E8E6DE` |

**Naming trap.** In `Theme.kt` the local variable called `surface` is what lands in
**`surfaceVariant`**; the Material `surface` role is always assigned `background`
(`Theme.kt:77`, `:122`). So the bottom bar, which uses `containerColor = surface`
(`ui/shell/BorisBottomBar.kt:29`), is exactly the same colour as the page and draws no divider.

**[REC vs REPO] — none.** The recording is a `midnight` dark device and every sampled pixel agrees
with the table: page `#18181B` at t=52 s, settings card `#1E1E20` (= `surfaceVariant` at the 40%
alpha `ui/settings/SettingsScreen.kt:225` asks for).

### 1.2 The two loud colours, and the three highlight colours

`DESIGN.md` states the rule: indigo is for actions, yellow is for marks, do not add a third accent.
Highlight colours are a separate axis — they encode **whose** highlight it is.

| Token | Hex | Role | Cite |
| --- | --- | --- | --- |
| `Indigo500` / `Indigo600` | `#6366F1` / `#4F46E5` | filled actions, dark / light | `ui/theme/Color.kt:20-21` |
| `HighlightMine` | `#FDE047` | your highlights | `Color.kt:22` |
| `HighlightFriends` | `#F97316` | people you follow — **and the Support heart** | `Color.kt:23`, `ui/support/SupportHeart.kt:57` |
| `HighlightOther` | `#9333EA` | the nostrverse | `Color.kt:24` |
| `FindMark` | `#93C5FD` | Find-in-article match — not user-configurable | `Color.kt:25` |
| `SpokenMark` | `#2DD4BF` | the sentence TTS is speaking | `Color.kt:26` |
| `#22C55E` / `#EF4444` | — | relay up / down, and 100 % reading progress | `ui/settings/RelaysSection.kt:211-212`, `ui/reader/ReadingProgress.kt:58` |
| `SettingsTints` | `#8D6E63` / `#5B7C99` / `#78909C` | the three settings-group icon tints | `ui/settings/SettingsTints.kt:7-9` |

Each of the three highlight colours is user-selectable from the same six-swatch palette
`#fde047 #f97316 #ec4899 #22c55e #3b82f6 #9333ea` (`ui/settings/ReadingFonts.kt:28-35`).

**The M3 baseline leaks in exactly once.** The scheme never defines `secondaryContainer`, so the
navigation-bar indicator pill and every selected `FilterChip` use the Material baseline `#4A4458`
(dark) / `#E8DEF8` (light). Measured off the recording at t = 52 s: `#4A4458`. This is the one
colour on screen that is outside the Boris palette, and guessing an indigo pill here would have been
the most obvious wrong pixel in the whole reproduction.

### 1.3 The mark is 45 % alpha and never recolours its text

`HighlightMarks.paintHighlight` draws a round rect **behind** the glyphs at `HIGHLIGHT_ALPHA = 0.45f`,
inflated 5 dp horizontally and 3 dp vertically, 3 dp corner radius (`ui/reader/HighlightMarks.kt:24`,
`:173-203`). Underline style is a 2 dp line at 85 % alpha on the line bottom.

Measured: the purple mark in the recording at t = 61 s reads `#502479`, which is exactly `#9333EA`
at 45 % over `#18181B`. **[REC vs REPO] agreement.** `DESIGN.md` does say "text on the mark is
black", but that describes the `mark-highlight` component used for the Home *copy* marks, not
article marks — reading it as a rule for the reader makes every highlighted passage shout.

Highlight cards use the same 45 %, with `onBackground` text (`ui/HighlightCard.kt:121-123`).

### 1.4 Typography

`ui/theme/Type.kt:48-121`. Chrome is sans (Compose default Roboto); reading is **Source Serif 4**,
bundled in the APK (`app/src/main/res/font/source_serif_4.ttf`).

| Role | Family | Size / line | Used for |
| --- | --- | --- | --- |
| `bodyLarge` | Source Serif 4 | 21 sp / 36 sp, justified, `letterSpacing 0` | the article body |
| `bodyMedium` | Source Serif 4 | 16 sp / 24 sp | settings labels, quotes |
| `titleLarge` | Source Serif 4 | 20 sp / 28 sp, SemiBold | preview title |
| `titleMedium` | sans | 16 sp / 24 sp, Medium | section headers, top-bar titles |
| `labelLarge` | sans | 14 sp / 20 sp, Medium | chips, mini-player |
| `labelMedium` | sans | 12 sp / 16 sp, Medium | nav labels, captions |
| `bodySmall` | sans | 13 sp / 18 sp | subtitles, meta chips |

Reading Font is user-selectable from ten families and Font Size from six steps
(16/18/**21**/24/28/32, `ReadingFonts.kt:26`).

**Deviation, deliberate.** sandstr ships no fonts and makes no external requests, so
`src/simulators/boris/boris.theme.css` degrades to a platform serif stack. Everything else about the
reading column — 1.71 line height, justification, hyphenation — is reproduced.

## 2. Shell

`ui/BorisApp.kt`. One app-level Scaffold owns the bottom bar; each of the five tab screens nests its
own Scaffold with its own top bar. There is **no shared top-bar composable** — only the overflow
menu is shared (`ui/TopBarMoreMenu.kt`).

### 2.1 Bottom navigation

Stock M3 `NavigationBar`, 80 dp, `containerColor = surface`, `tonalElevation = 0`, labels always
visible (`ui/shell/BorisBottomBar.kt:26-72`). Order and icon pairs from `ui/shell/MainTab.kt:19-53`:

| # | Label | Unselected | Selected |
| --- | --- | --- | --- |
| 1 | `Home` | `Outlined.Home` | `Filled.Home` |
| 2 | `Library` | `AutoMirrored.Outlined.MenuBook` | `AutoMirrored.Filled.MenuBook` |
| 3 | `Feeds` | `Outlined.DynamicFeed` | `Filled.DynamicFeed` |
| 4 | `Search` | `Outlined.Search` | `Filled.Search` |
| 5 | `You` | `Outlined.AccountCircle` | `Filled.AccountCircle` — **replaced by your profile picture when signed in**, 24 dp, circle-clipped, with a 1.5 dp `primary` ring when selected (`BorisBottomBar.kt:39-60`) |

Re-tapping the active tab does nothing visible: no scroll-to-top, no refresh
(`BorisBottomBar.kt:36`, `BorisApp.kt:164-172`). The only "tap chrome to scroll to top" affordance in
the app is the **reader's title** (`ui/reader/ReaderScreen.kt:690-704`).

### 2.2 The Home top-bar left group is not a sign-in button

This is the surface most likely to be reproduced wrong from a screenshot. `ui/support/SupportHeart.kt`
renders two things: a filled `Favorite` heart tinted `HighlightFriends` `#F97316` that opens Support
Boris, and — when there are any — a **32 dp round supporter profile picture, cycled from recent zap
receipts every 21 000 ms with a 1 400 ms crossfade** (`SupportAvatars.kt:12`, `SupportHeart.kt:35`,
`:87-96`). Tapping it opens **that person's** profile. The recording shows exactly this at
03:08 → 03:12: the round mark next to the heart is a supporter's avatar, and tapping it lands on
their profile.

Right side of the Home bar: `HelpOutline` → About Boris, then `⋮` with `[Hide archived, signed in
only]` and `Home settings` (`ui/home/HomeScreen.kt:183-220`).

### 2.3 TTS mini player

`ui/shell/TtsMiniPlayer.kt:132-224`. 56 dp over a 1 dp `outline` divider, on `background` at 95 %
alpha, 16 dp leading / 8 dp trailing padding. Strictly left to right:

`title (weight 1, tap = open article)` · `speed chip` · `follow-along` · `previous ¶` · `play/pause` ·
`next ¶` · `8 dp spacer` · `close`

The speed chip is outline-only, 8 dp corners, and drops the decimal on whole numbers — `2x`, not
`2.0x` (`:285-286`). Default rate is `2.1` (`UserSettings.kt:69`), which is what the recording shows.

**Three mounting sites, and they differ** (`BorisApp.kt:218-221`, `:455-462`;
`ReaderScreen.kt:1866-1870`): above the bottom bar on the five tabs; a bottom overlay on
Settings/About/Support/Profile; and **inside the reader's own bottom column, above the reading
progress strip**. Never in the in-app browser.

## 3. Home

`ui/home/HomeScreen.kt`. Two dismissible prompts, then up to eight horizontal rows.

### 3.1 The two prompts (`strings.xml:62-69`, verbatim)

| | Title | Body | Button | Icon |
| --- | --- | --- | --- | --- |
| 1 | `First time?` | `A short walk through of what Boris is and how highlighting works.` | `About Boris` | `HelpOutline` |
| 2 | `Connect?` | `Optional. Link a Nostr account to publish highlights and discover what your friends found interesting enough to highlight.` | `Log in` | `Login` |

Neither is a card: no fill, no border. A 20 dp `primary`-tinted icon, a semibold `titleMedium`, a
close button, then the body and a filled 8 dp button, all on the page background
(`HomeScreen.kt:846-806`).

### 3.2 Sections — default order, header icon, header tint

`HomeSections.DEFAULT` (`ui/home/HomeSections.kt:13`); tints at `HomeScreen.kt:547-654`. An empty
section renders nothing.

| # | Title | Icon | Tint |
| --- | --- | --- | --- |
| 1 | `Continue reading` | `MenuBook` | `primary` |
| 2 | `Recently highlighted by you` | Boris `Highlighter` | mine `#FDE047` |
| 3 | `Recently highlighted by friends` | `Highlighter` | friends `#F97316` |
| 4 | `Recently highlighted by others` | `Highlighter` | nostrverse `#9333EA` |
| 5 | `Most highlighted this week` | `Highlighter` | nostrverse |
| 6 | `Short reads` | `Timer` | `primary` |
| 7 | `Long reads` | `AutoStories` | `primary` |
| 8 | `Random unreads` | `Shuffle` | `primary` |

**Signed out, row 4 is titled plainly `Recently highlighted`** — the app only says "by others" once
there is a "you" or a "friends" row to distinguish it from (`HomeScreen.kt:588-592`). That one
conditional is why a signed-out Home reads so differently from every screenshot of a signed-in one,
and the recording is signed out throughout.

`Short reads` ≤ 5 min and `Long reads` ≥ 15 min (`data/ReadingTime.kt:8-9`, 200 wpm).

### 3.3 The carousel card

`HomeScreen.kt:866-930`. Row 232 dp tall, 20 dp side padding, 12 dp between cards. Card 140 dp wide:
a 140×140 cover clipped to 12 dp on `surfaceVariant`, then the title (`bodyMedium` sans SemiBold,
max 2 lines) and the host (`bodySmall`, `onSurfaceVariant`, 1 line), then `CardReadingProgress`.

Coverless articles get a 28 dp glyph tinted with **the section's colour** — `Article` for a web page,
`StickyNote2` for a nostr note (`:897-905`). Long-press opens Share / Copy link / Open original /
[Open in native app] / [Mark as read].

`CardReadingProgress` (`ui/reader/ReadingProgress.kt:65-97`) renders **nothing** until the article
has been opened; then a 2 dp track (`outline` at 30 %) whose fill is `onBackground` at 1–10 %,
`primary` at 11–94 %, `#22C55E` at ≥ 95 %.

## 4. Reader

`ui/reader/ReaderScreen.kt` — the screen the app exists for.

**Top bar** (`:684-866`): `back` · `Contents` (only when the article has headings) — `title` (tap =
scroll to top) — `[Save to library, signed in only]` · `Listen` · `⋮`.
Overflow order: `Share` · `Copy link` · `Open in browser` · `Wayback Machine` · `archive.ph` ·
`[Open in native app]` · `Find in article` · `[Mark as read]` · `[Reader settings]`. The last two are
gated on being signed in, which is why the signed-out menu in the recording is six items long.

**Hero** (`:2356-2371`): 42 % of screen height clamped to 240–420 dp; gradient transparent → still
transparent at 40 % → black at 82 %. Title `headlineLarge` bold white, 34 sp line height; summary
`titleMedium` white at 90 %, max 3 lines.

**Meta chips** (`:2472-2510`), a FlowRow with 8 dp gaps, in this exact order:

`author (nostr long-form only)` · `domain` · `+ RSS` · `read time` · `highlights` · `published`

Chip: 8 dp corners, 1 dp border, 10/6 dp padding, 14 dp icon, `bodySmall`. Accent chips (`+ RSS`,
highlights) take a 55 %-alpha border in the accent, `onBackground` text and an accent icon; plain
chips use `outline` + `onSurfaceVariant`. The highlights chip's accent follows the **strongest**
author class present: mine, else friends, else nostrverse (`:2344-2353`).

Label formats: `1 min read` / `N min read` (`data/ReadingTime.kt:18`); `1 highlight` / `N highlights`
(`:2339-2342`); dates like `May 8, 2006`.

**Selection → highlight** (`ui/reader/HighlightTextToolbar.kt:53-84`): a 24 dp-corner pill on
`inverseSurface` with text buttons `Copy` · `[Highlight — signed in only]` · `TTS from here` ·
`Select all`. `Copy` and `Select all` are `android.R.string`, so they render in the platform's
own words; the third one is Boris's and reads **`TTS from here`** (`strings.xml:418`), not
"Read from here".

**Bottom stack** (`:1860-1877`): mini player, then `ReadingProgressBar`, then a navigation-bar
spacer. The progress readout is **not** a floating percentage: it is a full-width row on `background`
at 95 % with 12/4 dp padding, holding a 2 dp track (`outline` at 45 %) and a right-aligned label in a
32 dp min-width slot with tabular figures. Fill and label change colour together, and at ≥ 95 % the
label becomes `✓` (`ReadingProgress.kt:100-152`, `strings.xml:415-416`).

**Panes**: `Contents`, `Highlights`, `Find` — each a full-height sheet over a black-45 % scrim
(`OutlinePane.kt:61`, `HighlightsPane.kt:120`, `FindPane.kt:86`). Empty states, verbatim:
`No highlights on this article yet.` (`strings.xml:201`), `No matches` (`:337`), placeholder
`Search in article` (`:336`).

## 5. Feeds and Search

**Feeds top bar** (`ui/feed/FeedScreen.kt:204-249`): title `Feeds`, then three audience toggles, and
only then `Info` and `⋮`. The toggles are **not** a radio group — they are independent switches with
a floor of one, so "Nostrverse + You" is a real state (`ui/feed/FeedScope.kt:24-31`). Icons
`Hub` / `Group` / `Person`, each drawn in its own highlight colour at **alpha 1 on, 0.4 off, 0.28
when it needs a login it does not have** (`:679-692`). Signed out that reads as one bright purple hub
between two greyed-out neighbours — exactly what the recording shows.

**Chip row**: `All` (`Apps`) · `Highlights` (`Highlighter`) · `Writings` (`Edit`) · `RSS` (`RssFeed`),
M3 `FilterChip` with an 18 dp leading icon and `selectedContainerColor = secondaryContainer`
(`ui/ContentTabs.kt:37`, `:128-150`).

**Highlight card** (`ui/HighlightCard.kt:161-240`), 8 dp corners, 1 dp border in the highlight
colour, 16 dp padding, 12 dp gaps:

1. an 18 dp `FormatQuote` glyph ←→ the relative time (`3m`, `18m`, `1h`, `2d`, `1mo` — no space, no
   unit word, `data/RelativeTime.kt:4-14`)
2. the quote: Source Serif, **17 sp / 26 sp, italic** — the only italic body text in the app — with
   the marked span at 45 % alpha
3. `— host` (`strings.xml:414`)
4. author (20 dp avatar + `labelMedium` name) ←→ a `⋯` menu

**Search** (`ui/search/SearchScreen.kt`): placeholder `Highlights, articles, bookmarks…`, empty state
`No matches.` **with the full stop**, result kinds Highlight / Article / Bookmark / Person
(`strings.xml:38-44`).

## 6. Library, You, profile, auth

**Library signed out** (`strings.xml:19-20`): `Your bookmarks` / `Connect, and they show up here.`,
then the auth pair and `New to nostr? Start here: nstart.me`.

**Library scopes** (`strings.xml:7-12`): `All` · `Private` · `Public` · `Web` · `Lookmarks` ·
`Archive`. These are nostr concepts, not folders, and the app's own Info sheet says so: a lookmark is
a kind-7 👀 reaction, archive is the 📚 one, private bookmarks are encrypted and need the signer
(`strings.xml:28-32`).

**You signed out** — the app's one piece of showmanship, worth copying exactly
(`ui/you/YouLoggedOut.kt:38-101`): the heading `Your highlights`, then the phrase
`the passages you care about` set in Source Serif at 22 sp / 30 sp and painted with a real highlight
— a rounded rect at **32 % alpha in dark, 42 % in light**, 6 dp / 2 dp padding, 2 dp radius, drawn
behind the text — then `Connect, and they show up here.`

**Auth** (`ui/auth/AuthBar.kt:88-110`): `Amber` is the filled button with a `Key` icon and hands off
to the NIP-55 external signer; `Bunker` is outlined with a `Shield` icon and takes a `bunker://…`
NIP-46 URI. Both 8 dp.

**Profile** (`ui/you/ProfileScreen.kt`): bordered header card (48 dp picture, display name, about
clipped to two lines), then the four content chips `Highlights` · `Writings` · `Public` · `Web` and
an in-profile `Search…` field.

## 7. Settings

`ui/settings/SettingsScreen.kt`. **One screen with two states**, not two destinations: Back inside a
sub-screen returns to the root list rather than popping the app's nav stack (`:143-207`).

Root list: three cards 16 dp apart, each `RoundedCornerShape(24.dp)` filled with `surfaceVariant` at
**40 % alpha** (`:219-234`). No group headers — the card break is the grouping. Each row is a 40 dp
circle filled with the group tint at 16 % alpha holding a 22 dp icon at full tint, then a semibold
`titleMedium` over a `bodySmall` subtitle. **No chevron**: the title column is unweighted, so there is
no trailing slot at all (`:247-281`).

| Group (tint) | Rows — title / subtitle, in order |
| --- | --- |
| Look `#8D6E63` | `Appearance` / `Theme, dark and light colors` · `Reading` / `Font, size, alignment, weblinks` · `Text-to-Speech` / `Speed, voice, preview, follow-along` · `Media` / `Full-width images` · `Highlights` / `Style, colors, visibility` · `Zap Splits` / `Shares for you, authors, and Boris` |
| Places `#5B7C99` | `Home` / `Sections, archived articles` · `Library` / `Default view` · `Feeds` / `Default view, scope, RSS feeds` · `Scroll Behaviour` / `Top bar, volume button scrolling` · `Relays` / `Connection status of your nostr relays` · `Airplane mode` / `Downloads, storage, local relays` |
| About `#78909C` | `About` / `Boris, tutorial, support, links` |

Version footer, three separate nodes with the `·` as its own (`ui/settings/SettingsVersionFooter.kt:32-69`):
`Version 1.4.49` `·` `8456da4`, the hash in monospace, both `labelSmall` / `onSurfaceVariant`.

### 7.1 Sub-screens worth naming

- **Appearance** — `Theme` (3 icon toggles: Light / Dark / **System**, default system), then `Dark
  Theme` and `Light Theme` swatch rows. On the default `system` theme **both** rows are visible at
  once (`ThemeSection.kt:38-39`); that is the shipped state, not a bug.
- **Reading** — `Reading Font` (10 families), `Font Size` (six `A` buttons at `size − 8` sp),
  `Paragraph Alignment` (left / **justify**), `Link Color` (six swatches, palette differs per theme),
  `Open weblinks in Boris` (on).
- **Highlights** — `Show highlights` · `Highlight Style` (marker / underline) · three colour rows ·
  `Default Highlight Visibility`, three toggles in **nostrverse → friends → mine** order, each tinted
  with *that layer's currently chosen colour* at alpha 1 / 0.4 (`HighlightsSection.kt:83-125`).
- **Zap Splits** — presets `Default` (50/50/2.1) · `Generous` (5/75/10) · `Selfless` (1/80/19) ·
  `Boris 🧡` (10/10/80, and the heart is U+1F9E1 ORANGE HEART, verified by hexdump). Boris' own slider
  maxes at **10**, so the `Boris 🧡` preset pins the thumb while the label still reads `80.0`
  (`ZapSplitsSection.kt:162`). Reproduce the quirk; do not smooth it over.
- **Relays** — read-only. Sections `Read`, `Write`, `Local` in that order; an empty group renders
  nothing at all, not a placeholder. URLs are monospace with the scheme stripped and `127.0.0.1`
  rewritten to `localhost`, so Citrine shows as `localhost:4869`. The trailing badge is **last-seen,
  not latency** — a clock glyph plus a relative label, shown only when the relay is *not* connected
  (`RelaysSection.kt:178`, `:256-269`).
- **Airplane mode** — five offline shelves (`Bookmarks`, `Web Bookmarks`, `Lookmarks`, `Archive`,
  `Highlights`), all on by default, each with a progress bar and `N of M downloaded`; then
  `Storage limit` with `210 MB / 512 MB / **1 GB** / 2 GB / 5 GB`.

### 7.2 The preview card

One component, `ReadingPreview`, rendered on **three** sub-screens (Appearance, Reading, Highlights).
Fixed copy (`ReadingPreview.kt:174-188`): title `The Quick Brown Fox` and three Lorem paragraphs. The
marked span in each is always the **second sentence**, in mine → friends → nostrverse order, and
`inventore veritatis` in P3 is coloured with the current link colour but never highlighted.

## 8. About / onboarding

`ui/about/AboutPages.kt:82-86` — **eleven** pages: an intro, the nine features in `ABOUT_FEATURES`
order, then the call to action. All copy is verbatim in `strings.xml:78-117`; the final page's buttons
are `Connect on Nostr` · `Report a bug` · `Suggest a feature` · `Say thanks` · `Start reading!`.

The About **settings** screen is a different surface: `Tutorial` · `Vision` (`Purple Text, Orange
Highlights`) · `Support Boris` · `Report a bug` · `Suggest a feature`, then a `Links` group —
`Website readwithboris.com` · `Web app read.withboris.com` · `Source code dergigi/boris-android` ·
`Author Gigi · dergigi.com` · `Author on Nostr npub1dergggklka9…`.

---

## 9. What our reproduction does differently, and why

Everything here is a deliberate, recorded deviation. Anything **not** on this list that differs from
the description above is a bug.

| Deviation | Why |
| --- | --- |
| Platform serif instead of the bundled Source Serif 4 | sandstr ships no fonts and makes no external requests |
| Invented articles, bylines and publications on `.example` domains | a reader renders whatever the data says as somebody's article; real headlines under invented text would put words in real mouths. Shape (lengths, read times, highlight counts, timestamp formats) follows the recording. |
| Our own highlighter mark instead of the app icon | upstream's icon is the Font Awesome Free highlighter (CC BY 4.0) recoloured; redrawing keeps that obligation out of this repo, as already done for Coracle's icon set |
| Our own About illustrations | the nine `assets/features/*.svg` are artwork, not interface facts |
| Robohash inline-SVG avatars | the real app loads profile pictures over the network |
| No in-app browser, no OPML import, no real relay probing | no network, no crypto — this is a simulation |
| Supporter avatars cycle at the real 21 s | faithful, but a visitor will rarely see it change |

Coverage of the real app, surface by surface: [`../../gaps/boris.md`](../../gaps/boris.md).
