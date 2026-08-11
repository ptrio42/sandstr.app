# Wisp — gap ledger

> Ground truth: `docs/refs/wisp/screen-map.md` · Sim: `src/simulators/wisp/`
> Audited: 2026-08-05 · Registry status: ready · Sim LOC: 5745

## Rollup

| missing | dead | partial | unreachable | unanchored | ok |
|---|---|---|---|---|---|
| 26 | 32 | 12 | 4 | 1 | 15 |

**Top 3 do zrobienia:** wis-76 (arkusz klucza na loginie) · wis-77 (compose w trybie reply/quote) · wis-79
(Wallet detail / Send / Receive).
*(Poprzednie top-3 — wis-90 mostek, wis-71 drawer, wis-75 payload sekcji — plus wis-72/73/74 i kotwice
wis-25/32/48 zamknięte 2026-08-06 przy wdrażaniu FAQ.)*

## Gaps

| ID | Surface (ścieżka w UI) | § | Status | Gap | Evidence | FAQ impact | Effort |
|---|---|---|---|---|---|---|---|
| wis-01 | Bottom bar → Notifications bell → zap-morph / ICQ-flower burst | §4, §17.7 | missing | Bell is a static icon + red dot; no ₿/bolt morph, no green ICQ-flower burst on replies/DMs | `components/BottomBar.tsx:44-55` | blocks-showme | M |
| wis-02 | Feed → top bar → content-filter icon (All→Notes→Gallery→Polls) | §5 | partial | Icon and tint cycle, but the list is never filtered — `contentFilter` is read only to pick the icon | `screens/FeedScreen.tsx:81-83,109-116` vs list at `:223` | breaks-showme | S |
| wis-03 | Feed → feed-selector pill → "List" / "Hashtags" | §5 | dead | `selectFeed` returns early for both — no picker, no label change, no feed change | `screens/FeedScreen.tsx:91` | breaks-showme | M |
| wis-04 | Feed → feed-selector → "Relay" → Select Relay dialog → url field / "+ New Set" | §5 | dead | "+ New Set" only closes the dialog; the `relay.example.com` input has no submit path (relay rows themselves work) | `screens/FeedScreen.tsx:282-295` | breaks-showme | S |
| wis-05 | Feed → top bar → online-users pill / relay-count pill | §5 | missing | Both are static `<div>`s — no "Online Now" sheet, no connected-relay-host dropdown | `screens/FeedScreen.tsx:179-186` | blocks-showme | M |
| wis-06 | Feed → LIVE row → stream pill | §5 | missing | Pills are `<div>`s with no tap target and there is no live-stream screen (screen-map has no render for it either — see recon list) | `screens/FeedScreen.tsx:197-213` | blocks-showme | L |
| wis-07 | Feed → "Load more" footer | §5 | dead | Fires `registerAction('load_more')` only; no notes are appended, nothing visible happens | `screens/FeedScreen.tsx:236-245` | breaks-showme | S |
| wis-08 | Feed → note → ⋮ menu (Follow / Block / Mute Thread / Add to List / Share / Copy Note ID / Copy Note JSON / Translate) | §6.3 | dead | All eight items only close the menu | `components/PostCard.tsx:364-376` | breaks-showme | M |
| wis-09 | Feed → note → Repost → "Quote" | §6.7 | dead | `PostCard` never passes `onQuote`, so Quote closes the popup and no quote composer opens ("Repost" works) | `components/ActionBar.tsx:178-184` + `components/PostCard.tsx:294-299` | breaks-showme | M |
| wis-10 | Feed → note → React → emoji picker → "+" | §6 | dead | Closes the picker; no full / custom-emoji picker exists | `components/ActionBar.tsx:143-151` | breaks-showme | M |
| wis-11 | Feed → note → long-press avatar (follow) / long-press heart (instant like) | §6, §6.3 | missing | No long-press or context handlers on the avatar or the react button — pointer-only sim | `components/PostCard.tsx:196-213`, `components/ActionBar.tsx:54-62` | blocks-showme | M |
| wis-12 | Feed / Thread → note → embedded quoted note | §6.5 | partial | The nested `quoted` card is built but only Notifications renders it; no feed or thread note ever shows a quote | `components/PostCard.tsx:142-163`, used only at `screens/NotificationsScreen.tsx:335` | blocks-showme | M |
| wis-13 | Feed → note → link-preview card | §6.5 | missing | `MediaBlock` renders images/carousel only; no radius-12 preview card with UPPERCASE site name | `components/PostCard.tsx:74-119` | none | M |
| wis-14 | Feed → note → private-reply eye indicator | §6.3 | missing | Author row has timestamp / PoW chip / ⋮ but no `#FF8C00` eye | `components/PostCard.tsx:214-244` | none | S |
| wis-15 | Thread → "Show N more replies" fold | §7 | missing | Reply depth is clamped to 2 by construction and no fold row is rendered | `screens/ThreadScreen.tsx:86,128-163` | blocks-showme | M |
| wis-16 | Thread → spam fold → "Show" | §7 | dead | The errorContainer block is static; "Show" is a `<span>` — hidden replies never appear | `screens/ThreadScreen.tsx:166-178` | breaks-showme | S |
| wis-17 | Profile → top bar → Search / QR | §8 | dead | Neither button has an `onClick`; no in-profile search, no QR sheet | `screens/ProfileScreen.tsx:143-156` | breaks-showme | M |
| wis-18 | Profile → ⋮ → Copy Profile JSON / Add to List / Block | §8 | dead | Items only close the menu | `screens/ProfileScreen.tsx:170-179` | breaks-showme | M |
| wis-19 | Own profile → "Edit Profile" | §8 | dead | No `onClick`; no edit-profile screen (the screen itself is also outside the screen-map — see recon list) | `screens/ProfileScreen.tsx:196-201` | breaks-showme | M |
| wis-20 | Profile → DM (paper-plane) circle | §8 | dead | No `onClick` — a conversation cannot be started from a profile even though Messages has a working conversation view | `screens/ProfileScreen.tsx:204-210` | breaks-showme | M |
| wis-21 | Profile → Mute circle | §8 | dead | No `onClick` | `screens/ProfileScreen.tsx:238-244` | breaks-showme | S |
| wis-22 | Profile → "Recent ▾" sort pill | §8 | partial | Menu opens and re-labels, but the Notes list is never re-sorted (`sort` is read only for the label/tint) | `screens/ProfileScreen.tsx:118,302-315` vs list at `:365-379` | breaks-showme | S |
| wis-23 | Profile → tabs Replies / Conversation / Gallery / Media / Chat Rooms / Relays | §8 | partial | Six of the nine tabs render a hardcoded empty state; only Notes / Following / Followers have content | `screens/ProfileScreen.tsx:47-54,388-394` | breaks-showme | M |
| wis-24 | Profile → lightning-address row (tap = copy) | §8 | dead | Plain `<div>`, no copy affordance | `screens/ProfileScreen.tsx:268-275` | none | S |
| wis-25 | Notifications (whole screen) | §9 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Interactive — 24h summary isolate, 7-switch filter sheet, inline note expand (but that expand is the compact card — wis-87) — and the file contains no `data-tour` | `screens/NotificationsScreen.tsx:221-425` (no `data-tour`) | blocks-showme | S |
| wis-26 | Chat → Direct Messages → FAB (new group DM) | §10 | dead | `onClick` branches only for the rooms tab; on the DM tab the FAB does nothing — no contact picker, no group-name field | `screens/MessagesScreen.tsx:342-352` | breaks-showme | M |
| wis-27 | Chat → Chat Rooms → FAB menu (Discover / Join existing / Create new) | §10 | dead | All three items only close the menu | `screens/MessagesScreen.tsx:360-369` | breaks-showme | M |
| wis-28 | Chat → Chat Rooms → room row → room conversation | §10 | missing | Rows are non-clickable `<div>`s; no group-room view (fidelity pass already calls this tab "a static two-row sketch") | `screens/MessagesScreen.tsx:298-333` | blocks-showme | L |
| wis-29 | Chat → conversation → "+" attach | §10 | dead | No `onClick` | `screens/MessagesScreen.tsx:172-179` | breaks-showme | S |
| wis-30 | Chat → conversation → relay-cloud badge | §10 | dead | No `onClick`; the per-participant relay panel does not exist | `screens/MessagesScreen.tsx:115-127` | breaks-showme | M |
| wis-31 | Chat → conversation → tap bubble → actions sheet (Comment / react / Zap / Copy) | §10 | missing | Bubbles are plain divs with no tap handler | `screens/MessagesScreen.tsx:138-167` | blocks-showme | M |
| wis-32 | Chat (list + conversation) | §10 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Tabs, rows, bubbles and the input bar all work; no `data-tour` in the file | `screens/MessagesScreen.tsx` (no `data-tour`) | blocks-showme | S |
| wis-33 | New Post → toolbar → attach image / Schedule | §11 | dead | Neither button has an `onClick` | `screens/ComposeScreen.tsx:129-135,166-172` | breaks-showme | M |
| wis-34 | New Post → "Save draft" | §11 | dead | No `onClick`, and there is no Drafts & Scheduled screen to save into (wis-55) | `screens/ComposeScreen.tsx:174-182` | breaks-showme | M |
| wis-35 | Reply → toolbar → private-reply (eye-off, `#FF8C00`) | §11 | missing | Toolbar is image / NSFW / PoW / poll / Schedule even when `replyTo` is set | `screens/ComposeScreen.tsx:128-183` | blocks-showme | S |
| wis-36 | New Post → toolbar → poll | §11 | partial | Button tints but no poll option fields appear — `poll` is read only for the tint | `screens/ComposeScreen.tsx:27,156-165` | breaks-showme | M |
| wis-37 | New Post → "Switch to Gallery" | §11 | partial | Only the button label flips; the title stays "New Post" (real app: "Gallery Post") and no gallery composer mounts. Arguable: gallery compose has no recording render either | `screens/ComposeScreen.tsx:24,83-98` | breaks-showme | M |
| wis-38 | Wallet → Refresh | §12 | dead | No `onClick` | `screens/WalletScreen.tsx:118-120` | breaks-showme | S |
| wis-39 | Wallet → "Secured by your Nostr key" banner (tap to save seed phrase) | §12 | dead | Chevron row is a `<div>` — the documented tap target does nothing | `screens/WalletScreen.tsx:133-142` | breaks-showme | M |
| wis-40 | Wallet → RECENT → "View all" | §12 | dead | No `onClick`; no full transaction list | `screens/WalletScreen.tsx:205-211` | breaks-showme | M |
| wis-41 | Wallet → Settings (gear) → QR Code / Change / Remove Lightning Address / Wallet Info / View Recovery Phrase / Switch to a different wallet | §12 | dead | Every action button on the detail screen is inert; only Back and Copy work | `screens/WalletScreen.tsx:244,252,261,267,277,295` | breaks-showme | L |
| wis-42 | Wallet → Send sheet → Scan QR / Paste / Gallery, "Next" | §12 | dead | The three helper buttons have no `onClick`; "Next" only closes the sheet. Scope is soft: §12 specifies only the two circles, the sheet interior is sim-invented (see recon list) | `screens/WalletScreen.tsx:339,348,357,366-378` | breaks-showme | M |
| wis-43 | Wallet → Receive sheet → "Create invoice" | §12 | partial | Amount and expiry work; the button just closes the sheet — no invoice or QR is produced. Same soft scope as wis-42 | `screens/WalletScreen.tsx:433-440` | breaks-showme | M |
| wis-44 | Zap sheet → "Presets" pill | §12 | dead | No `onClick`; no preset editor | `components/ZapDialog.tsx:79-85` | breaks-showme | M |
| wis-45 | Zap sheet → "Instant zaps" switch row | §12 | missing | Sheet goes privacy dropdown → Zap button with no switch row in between | `components/ZapDialog.tsx:167-221` | blocks-showme | S |
| wis-46 | Zap sheet → >10k confirm ("Zap %,d sats?") | §12 | missing | `fireZap` fires at any amount; only the 1M hard cap is enforced | `components/ZapDialog.tsx:43,50,53-57` | blocks-showme | S |
| wis-47 | Search → advanced (Tune) → Search relay → "Add new" | §13 | dead | Closes the menu without offering an add-relay field | `screens/SearchScreen.tsx:152-156` | breaks-showme | S |
| wis-48 | Search (whole screen) | §13 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unanchored. Segmented Profiles\|Notes, pill field, advanced panel, Follow rows and both result types all work; no `data-tour` in the file | `screens/SearchScreen.tsx:70-260` (no `data-tour`) | blocks-showme | S |
| wis-49 | Settings → Relays → "Broadcast Relay List (NIP-65)" | §14 | dead | No `onClick` on any of the four per-tab broadcast variants | `screens/SettingsScreens.tsx:349-355` | breaks-showme | S |
| wis-50 | Settings → Relays → relay row → relay detail | §14 | missing | Rows are not tappable; no detail screen (72dp icon, Paid/Auth/Restricted badges, ★ Favorite, statistics grid) | `screens/SettingsScreens.tsx:358-401` | blocks-showme | L |
| wis-51 | Side menu → Settings → Relay Health | §14 | missing | Drawer row has no `dest`, so it only closes the drawer; no "Connected X/Y", status dots or "covers N" outbox proof | `components/Drawer.tsx:71` + `Drawer.tsx:157`; screen absent from `screens/SettingsScreens.tsx` | blocks-showme | L |
| wis-52 | Side menu → header → account-switcher chip / QR-scan | §15 | dead | Neither header button has an `onClick` (the theme toggle next to them works) | `components/Drawer.tsx:95-108` | breaks-showme | M |
| wis-53 | Side menu → "Set status..." | §15, §17.8 | missing | Static `<div>`; no "Update Status" / "What are you up to?" dialog, so NIP-38 statuses can only be read on cards | `components/Drawer.tsx:114-119` | blocks-showme | M |
| wis-54 | Side menu → Lists | §15 | missing | Row exists; `dest: 'lists'` falls to the default branch → toast "Not in this demo" (the Lists screen itself is repo-only — see recon list, so only the row is measurable) | `components/Drawer.tsx:51` + `WispSimulator.tsx:134-136` | blocks-showme | M |
| wis-55 | Side menu → Drafts & Scheduled | §11, §15 | missing | Same default-branch toast; no drafts/scheduled screen with its two icon tabs | `components/Drawer.tsx:52` + `WispSimulator.tsx:134-136` | blocks-showme | M |
| wis-56 | Side menu → Settings → Media Servers | §15 | missing | No `dest` → the row just closes the drawer | `components/Drawer.tsx:65` + `Drawer.tsx:157` | blocks-showme | M |
| wis-57 | Side menu → Settings → Safety (Filters / Muted Words / Muted Users) | §15 | missing | Same; no spam-replies switch, no Web-of-Trust row, no muted-words list | `components/Drawer.tsx:67` + `Drawer.tsx:157` | blocks-showme | M |
| wis-58 | Side menu → Settings → Proof of Work | §15 | missing | Same; no Notes/Reactions/DMs "− N bits +" steppers (the composer shield at wis-36's neighbour is unrelated) | `components/Drawer.tsx:68` + `Drawer.tsx:157` | blocks-showme | M |
| wis-59 | Side menu → Settings → Custom Emojis | §15 | missing | Same | `components/Drawer.tsx:70` + `Drawer.tsx:157` | blocks-showme | M |
| wis-60 | Side menu → Settings → Console | §15 | missing | Same; no FAILURE log rows | `components/Drawer.tsx:72` + `Drawer.tsx:157` | blocks-showme | S |
| wis-61 | Settings → Interface → Language | §15 | missing | Row is a `<div>` with a chevron; no "System Default" dropdown | `screens/SettingsScreens.tsx:131-132` | blocks-showme | S |
| wis-62 | Settings → Interface → Themes ("Choose a color scheme") | §15 | missing | Inert row; the 15 preset theme cards (Nord, Dracula, …) do not exist anywhere in the sim | `screens/SettingsScreens.tsx:141-147` | blocks-showme | M |
| wis-63 | Settings → Interface → Accent Color | §15 | missing | Inert row; no HSV picker behind "Tap to customize" | `screens/SettingsScreens.tsx:149-156` | blocks-showme | M |
| wis-64 | Settings → Interface → Translation / Client Tag / Fiat Mode / Zaps / Zap Icon | §15 | partial | Five documented groups are absent from the screen (it stops after Posting) | `screens/SettingsScreens.tsx:130-237` | blocks-showme | M |
| wis-65 | Settings → Interface → every switch + the undo-duration segments | §15 | partial | All state is screen-local: Large text, Hide new notes, the three media toggles, Undo countdown and 5/10/15/20/30s never reach the feed or the composer | `screens/SettingsScreens.tsx:108-118` vs `screens/ComposeScreen.tsx:29,264` (hardcoded 10s) and `screens/FeedScreen.tsx:249-261` | breaks-showme | M |
| wis-66 | Settings → Interface (whole screen) | §15 | unanchored | Reachable (`openSettings`) and interactive, but no `data-tour` — a showMe has nothing to spotlight | `screens/SettingsScreens.tsx:127-240` (no `data-tour`) | blocks-showme | S |
| wis-67 | Settings → Keys → QR / Copy (both key cards) | §15 | dead | Both `KeyCard` buttons lack `onClick` ("Reveal Private Key" works) | `screens/SettingsScreens.tsx:419-428` | breaks-showme | S |
| wis-68 | Sign in → "Continue with Nostr" sheet → QR-scan | §16 | dead | No `onClick` (the mask/unmask eye beside it works) | `screens/LoginScreen.tsx:258-264` | breaks-showme | S |
| wis-69 | Create account → "Add photo" | §16 | dead | The 96px circle is a `<div>`, not a control | `screens/LoginScreen.tsx:296-301` | breaks-showme | S |
| wis-70 | Create account → Suggestions / Topics / First post / Loading steps | §16 | missing | `handleCreateContinue` logs straight into the demo identity after the relay probe — no "Follow at least 5 accounts", no topic chips, no onboarding undo-countdown post. Accepted delta in the fidelity pass, but still a missing path | `screens/LoginScreen.tsx:118-124` | blocks-showme | L |
| wis-71 | Side menu (drawer) — and everything inside it | §15 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. No command sets `drawerOpen`; `openSettings` even closes it via `closeOverlays`. `[data-tour="wisp-settings"]` can never mount from a showMe, so no drawer row is demoable | `WispSimulator.tsx:142-197` (no drawer case), anchor at `components/Drawer.tsx:139` | blocks-showme | S |
| wis-72 | Zap sheet | §12 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. `zapTarget` is only set by a card/profile click; no command opens it, so `[data-tour="wisp-zap"]` never mounts | `WispSimulator.tsx:95-97` + command switch `:142-197` | blocks-showme | S |
| wis-73 | Thread (incl. sticky reply bar) | §7 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. `openThread` is click-only; `[data-tour="wisp-reply"]` cannot be reached by any command | `WispSimulator.tsx:87` + command switch `:142-197` | blocks-showme | S |
| wis-74 | Someone else's profile → Follow circle | §8 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. `viewProfile` opens the CURRENT user, so `isOwn` is true and the follow/DM/zap/mute circles never render — `[data-tour="wisp-follow"]` is dead weight | `WispSimulator.tsx:175-181` + `screens/ProfileScreen.tsx:195,219-237` | breaks-showme | S |
| wis-75 | Settings → Relays / Keys / Social Graph screens | §14, §15 | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: unreachable. `openSettings` hardcodes `'interface'` and accepts no payload; the only other route is drawer → Settings → row = 3 hops, over the 2-command queue limit | `WispSimulator.tsx:182-188`, screens exist at `screens/SettingsScreens.tsx:260,433,511` | blocks-showme | S |
| wis-76 | Sign in → Nostr sheet (key field) | §16 | unreachable | The sheet is `LoginScreen` local state; `[data-tour="wisp-keys"]` only mounts after a real click on "Continue with Nostr" | `screens/LoginScreen.tsx:77,181-193` | blocks-showme | S |
| wis-77 | Reply composer (title "Reply", reply-context card) | §11 | unreachable | The `compose` command always opens a blank composer; nothing sets `replyTo` | `WispSimulator.tsx:157-164` | blocks-showme | S |
| wis-78 | Chat → conversation (bubbles, input bar, hidden bottom bar) | §10 | unreachable | `peer` is `MessagesScreen` local state; `navigate: 'messages'` only reaches the list. Also unanchored (wis-32) | `screens/MessagesScreen.tsx:57,73-78` | blocks-showme | M |
| wis-79 | Wallet → Settings detail | §12 | unreachable | `view` is `WalletScreen` local state; only the gear click reaches it | `screens/WalletScreen.tsx:88,121-128` | blocks-showme | S |
| wis-80 | Feed → post list + note action row (reply → react → repost → zap → add-to-list) | §5, §6 | ok | Anchored, reachable, emoji-replaces-heart and sat-total zap counts behave as specified | `screens/FeedScreen.tsx:216-246`, `components/ActionBar.tsx:36-120` | none | — |
| wis-81 | Feed → feed-selector pill → For You / Follows / Extended / Trending / Relay | §5 | partial | Dropdown items verbatim, ✓ on the active feed, Relay opens the picker and re-labels the pill — but the notes never change: the list is the fixed `wispFeedNotes` slice and `activeFeed` only drives the label and the ✓ (same defect as wis-02) | `screens/FeedScreen.tsx:96-100,146-176` vs list at `:223` + `wispData.ts:33` | breaks-showme | M |
| wis-82 | New Post → Publish → undo countdown ("Post now (N)" + red X) | §11 | ok | Anchored (`wisp-post`), reachable with `login` + `compose`, drains at 1s cadence, X cancels | `screens/ComposeScreen.tsx:232-273` | none | — |
| wis-83 | Bottom bar → 5 icon-only tabs | §4 | ok | Anchored, reachable, no M3 indicator pill, iOS-red unread dot | `components/BottomBar.tsx:27-61` | none | — |
| wis-84 | Sign in → splash (avatar wall, online pill, Google / Nostr buttons) | §16 | ok | Anchored (`wisp-login`), reachable via the `back` command; real-key tripwire fires | `screens/LoginScreen.tsx:133-201` | none | — |
| wis-85 | Wallet → balance (sats→fiat→hidden) / lightning pill / Send-Receive circles | §12 | ok | Anchored (`wisp-wallet`), reachable with `navigate: 'wallet'`; ships the repo default "0 sats" | `screens/WalletScreen.tsx:144-197` | none | — |
| wis-86 | Own profile → header (banner, 72px avatar, "∞ Followers", NIP-05, tabs) | §8 | ok | Anchored (`wisp-profile`), reachable with `viewProfile` | `screens/ProfileScreen.tsx:186-361` | none | — |
| wis-87 | Notifications → row → tap expands the target note | §9 | partial | §9 expands it as a **full PostCard**; the sim renders the compact `quoted` variant instead — no action row, no media, no ⋮ — so reply/react/zap cannot be demoed from a notification (`onZap` is passed in and never used) | `screens/NotificationsScreen.tsx:171,335` + `components/PostCard.tsx:142-163` | breaks-showme | S |
| wis-88 | Any note → hashtag / mention / link inside the content | §6.4 | dead | `RichText` paints them accent-orange but emits plain `<span>`s with no handler, so a tap falls through to the card and opens the Thread instead of a hashtag feed / profile / link. Arguable: §6.4 specifies the styling, not the tap target | `components/PostCard.tsx:57-72` (used at `:260`) | breaks-showme | M |
| wis-89 | Search → advanced (Tune) → "Author" filter (Notes tab) | §13 | partial | The field renders and stores `authorQuery`, but results are matched on note content only — typing an author changes nothing | `screens/SearchScreen.tsx:35,164-175` vs `:46-48` | breaks-showme | S |
| wis-90 | (whole client) FAQ "Show me" → simulator | — | ok | **Zamknięte 2026-08-06 (wdrożenie FAQ).** Poprzednio: missing. **No FAQ bridge.** The wrapper neither imports nor renders `FaqMiniTourLauncher`, has no `faqCommandsRef` and no `isFaqStepId` branch in `onStepChange`, and `src/data/faq/index.ts` does not map `wisp`. `SHOW_FAQ_EVENT` fires into nothing, so **no** `showMe` in this file can run — a precondition for every other `blocks-showme` row. Pattern to copy: `src/simulators/damus/DamusSimulatorWithTour.tsx:9,22,74,92-98,147` | `WispSimulatorWithTour.tsx` (no `FaqMiniTourLauncher`) · `src/data/faq/index.ts:4-6` | blocks-showme | S |

## Anchors — `data-tour` obecne w symulatorze

| Selector | Plik:linia | Powierzchnia |
|---|---|---|
| `wisp-login` | `screens/LoginScreen.tsx:167` | Splash → the two auth buttons (Google / Nostr) |
| `wisp-keys` | `screens/LoginScreen.tsx:234` | Nostr sheet → "nsec or npub…" field (NOT the Keys settings screen) |
| `wisp-drawer` | `screens/FeedScreen.tsx:125` | Feed top bar → avatar button that opens the side menu |
| `wisp-selector` | `screens/FeedScreen.tsx:150` | Feed top bar → feed-selector pill |
| `wisp-feed` | `screens/FeedScreen.tsx:219` | Feed → scrolling post list |
| `wisp-compose` | `screens/FeedScreen.tsx:267` | Feed → orange pencil FAB |
| `wisp-post-card` | `components/PostCard.tsx:167` | Any post card → whole card (repeats per card; the first one wins) |
| `wisp-actions` | `components/ActionBar.tsx:37` | Any post card → action row (every card carries one) |
| `wisp-reply` | `screens/ThreadScreen.tsx:187` | Thread → sticky "Reply…" pill |
| `wisp-profile` | `screens/ProfileScreen.tsx:190` | Profile → header block (avatar, stats, sort pill) |
| `wisp-follow` | `screens/ProfileScreen.tsx:222` | Profile → follow circle — **only in the `!isOwn` branch** |
| `wisp-post` | `screens/ComposeScreen.tsx:232` | Compose → Publish / undo-countdown bar |
| `wisp-messages` | `screens/MessagesScreen.tsx:211` | Chat → whole screen (closes wis-32) |
| `wisp-notifications` | `screens/NotificationsScreen.tsx:222` | Notifications → whole screen (closes wis-25) |
| `wisp-search` | `screens/SearchScreen.tsx:71` | Search → whole screen (closes wis-48) |
| `wisp-wallet` | `screens/WalletScreen.tsx:446` | Wallet → whole screen (home or detail) |
| `wisp-wallet-actions` | `screens/WalletScreen.tsx:177` | Wallet → Send / Receive pair (the tour's wallet step aims here, not at the screen) |
| `wisp-zap` | `components/ZapDialog.tsx:65` | Zap sheet → the bottom sheet itself |
| `wisp-settings` | `components/Drawer.tsx:139` | Side menu → "Settings" row (inline-expanding) |
| `wisp-set-interface` | `screens/SettingsScreens.tsx:128` | Settings → Interface screen |
| `wisp-set-themes` | `screens/SettingsScreens.tsx:144` | Settings → Interface → "Choose a color scheme" row |
| `wisp-set-relays` | `screens/SettingsScreens.tsx:298` | Settings → Relays screen |
| `wisp-set-keys` | `screens/SettingsScreens.tsx:439` | Settings → Keys screen |
| `wisp-set-social` | `screens/SettingsScreens.tsx:517` | Settings → Social Graph screen |
| `wisp-tabs` | `components/BottomBar.tsx:29` | Bottom navigation bar |

**25 distinct `data-tour` values**, all of them literals — Wisp is the only client with no
templated or conditional anchor, so a plain `grep 'data-tour="'` gets the count right here.
Counting method: [`../GAPS.md`](../GAPS.md).
`wisp-actions` is mountable by command, but only on the feed and the own-profile Notes tab —
Search renders cards only after a query is typed, and Notifications expands notes as the
action-less `quoted` card (wis-87). See below.

## Reachability — komendy toura

**Union:** `type: 'login' | 'navigate' | 'compose' | 'post' | 'viewProfile' | 'openSettings' | 'back'`
(`types.ts:13-16`, handled in `WispSimulator.tsx:142-197`). Payload is used by `navigate` only:
`'home' | 'wallet' | 'search' | 'messages' | 'notifications'` (`WispSimulator.tsx:36,147-155`).
The `*SimulatorWithTour` switch maps 10 tour steps to at most 2 commands each
(`WispSimulatorWithTour.tsx:47-58`); the queue drops a third.

| Powierzchnia | Osiągalna komendą? | Czym |
|---|---|---|
| Splash / sign-in | tak | `back` (logs out → splash) |
| Nostr sign-in sheet / key field | **nie** | local `view` state, click-only (wis-76) |
| Feed (list, selector, FAB, pills, LIVE row) | tak | `login` + `navigate: 'home'` |
| Post card action row | tak | `login` + `navigate: 'home'`, or `login` + `viewProfile` (Search lists cards only after a query is typed; Notifications never does — wis-87) |
| Emoji picker, repost popup, ⋮ menu | **nie** | local `useState` in ActionBar/PostCard, click-only |
| Thread + sticky reply bar | **nie** | `openThread` is click-only (wis-73) |
| Compose (blank) | tak | `login` + `compose` |
| Compose (reply / quote variant) | **nie** | nothing sets `replyTo` (wis-77) |
| Publish + undo countdown | tak | `login` + `compose` (the bar is always mounted) |
| Own profile | tak | `login` + `viewProfile` |
| Someone else's profile / follow circle | **nie** | `viewProfile` targets `currentUser` (wis-74) |
| Wallet home | tak | `login` + `navigate: 'wallet'` |
| Wallet detail / Send / Receive sheets | **nie** | local `view` / `sheet` state (wis-79) |
| Zap sheet | **nie** | `zapTarget` is click-only (wis-72) |
| Search | tak | `login` + `navigate: 'search'` (unanchored — wis-48) |
| Messages list | tak | `login` + `navigate: 'messages'` (unanchored — wis-32) |
| DM conversation | **nie** | local `peer` state (wis-78) |
| Notifications | tak | `login` + `navigate: 'notifications'` (unanchored — wis-25) |
| Notification filter sheet | **nie** | local `sheetOpen` state |
| Side menu (drawer) | **nie** | no command touches `drawerOpen`; `openSettings` closes it (wis-71) |
| Settings → Interface | tak | `login` + `openSettings` |
| Settings → Relays / Keys / Social Graph | **nie** | `openSettings` hardcodes `'interface'` (wis-75) |

Cheapest unlock for FAQ authoring: add `openDrawer`, a `zap` command, an `openThread` command, a
payload for `openSettings`, and let `viewProfile` take a pubkey. All five are one `case` each in
`WispSimulator.tsx:142-197` and would flip wis-71…wis-75 in a single pass.

## Poza zakresem / do recon

Screen-map coverage marks these as **repo-only (no recording render)**, so there is no ground truth
to measure the sim against — do not file gaps until a recon exists: light theme, the 14 non-custom
theme presets, group-room and live-stream screens, gallery compose mode, poll UI, NWC wallet mode,
Bookmarks/Lists screens, floating audio player, populated notifications. Also outside the
screen-map: the Edit Profile screen, wallet Send/Receive sheet internals (only the two circles are
specified), the transaction-history screen, the group-DM contact picker, and the "Update Status"
dialog beyond its two strings.

**Deliberate, NOT gaps** (do not "fix"): the M3 `secondaryContainer` `#4A4458` leak on relay
read/write/auth chips and the Gallery|Stack segments (§1); sats + ₿ instead of the recording's Fiat
Mode (§18); no Amber/NIP-55 signer button (§18 — no such code upstream); no onboarding "Skip"
(DEBUG-only upstream); the ~25-note feed cap (`wispData.ts:33`); lucide icons standing in for
Material symbols; the sparser force-graph; the splash "Continue with Google" button answering with
a "Not available in this demo — use Nostr" pill instead of an OAuth flow
(`screens/LoginScreen.tsx:170,194-198`) — the sim is keyless by design.

Gesture-only affordances the pointer sim cannot carry as-is and that are noted rather than filed as
separate rows: pull-to-refresh on the feed (§5) and swipe-right-to-reply in DMs (§10).
