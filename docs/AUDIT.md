# Sandstr — Audyt (feature izolacji symulatorów Nostr)

> **⚠️ AKTUALIZACJA KIERUNKU (po audycie) — CZYTAJ NAJPIERW.** Ten dokument to **snapshot historyczny (2026-07-14)** i pozostaje jako zapis. Jego rekomendacja strategiczna — „owned-IP-first / Nostr Kitten jako front door / tylko permissioned" — została **NADPISANA** przez właściciela. Obowiązujący kierunek: **real-clients-first** — rdzeniem produktu są **wierne, wysokiej wierności, przeglądarkowe reprodukcje REALNYCH brandowanych klientów** (Damus, Amethyst, Primal, Snort, YakiHonne, Coracle, Keychat, Olas, Gossip); wierność realnym aplikacjom JEST produktem. **Nostr Kitten NIE jest fundamentem ani front doorem** — to co najwyżej opcjonalny easter-egg / maskotka, nie kotwica marki. Ryzyko znaku towarowego mitygujemy przez: (a) **permissioned opt-in od każdego zespołu jako ścieżkę GŁÓWNĄ** (właściciel odzywa się do twórców — są osiągalni na Nostr, a wierne demo im pochlebia); oraz (b) **trwały baner „SIMULATION · unofficial · mock data · not affiliated" na każdym widoku** (zostaje — nadal #1 lekka mitygacja). Nie monetyzujemy marki konkretnego zespołu bez jego zgody. Klienty webowe odtwarzamy we wspólnym stacku React („Poziom A"), nie uruchamiając realnego kodu klienta. Proces to **reference-first fidelity**: realne screenshoty + źródła klienta czytane razem, weryfikacja side-by-side (biblioteka referencji w `docs/refs/<client>/`; Amethyst = głęboki, zweryfikowany flagowy szablon). **Aktualne, wiążące źródła: `CLAUDE.md` i `docs/FIDELITY.md`.** Poniższe rekomendacje dot. brandingu/pozycjonowania/ryzyk (zwł. sekcje „Werdykt (synteza)", „Kierunki brandingu", „Ryzyko znaku towarowego", „Synteza — rekomendacje", „Rekomendowany branding", „Kluczowe ryzyka", „Roadmapa") czytaj przez ten pryzmat — są nieaktualne. Oceny wierności/kompletności/bugów, plan wydzielenia i analiza znaku towarowego pozostają użyteczne.

> **Co to jest:** wierny snapshot wieloagentowego audytu przeprowadzonego **2026-07-14** na feature klientowych symulatorów (wtedy jeszcze wewnątrz przewodnika `nostrich.love`), zanim wyodrębniono go do tego repo. Audyt objął: wierność/kompletność/polish każdego z 10 symulatorów, wykonalność wydzielenia + architekturę, oraz pozycjonowanie/branding/ryzyka prawne. Ten plik istnieje, żeby **kontekst decyzji nie zależał od pamięci sesji** w innym projekcie.

**Status od czasu audytu:** Faza 1 (extraction spike → to repo, Vite+React SPA) **zrobiona**. Faza 2 (dopieszczenie 4 liderów: Snort, Amethyst, Nostr Kitten, YakiHonne) **zrobiona i zweryfikowana** (zob. `CLAUDE.md` i historię git). Poniższe oceny/rankingi opisują stan **sprzed** dopieszczenia — część bugów liderów jest już naprawiona.

Skróty ocen: **c** = completeness, **f** = fidelity (wierność realnemu klientowi), **p** = polish, **wow** = standout / demo-worthiness. Skala 0–10. Autor oryginału (Kimi 2.5) pracował **bez modelu wizji**, więc wierność jest z założenia luźna.

## Werdykt (synteza)

**Pewność:** medium — high confidence on the extraction path and the trademark analysis (well-evidenced by the findings), medium on market pull because the "viral signal" is asserted rather than measured and Nostr's newcomer TAM is genuinely small; a small paid pilot or landing-page test would raise this to high.

Yes-but. There is a real, unoccupied wedge here — "try 10 Nostr clients in-browser, no keys, no install" is a genuine gap between the app directories and Nstart, and the interactive/shareable nature is exactly what the parent guide lacked. The extraction is cheap (medium effort, ~1-2 days to a skeleton) and the shared foundation is clean. But the honest read is that this is a public-good funnel utility, not a business: retention is inherently one-shot, the TAM is small, and the single biggest existential threat — trademark/trade-dress exposure once it's a standalone, potentially-monetized product reproducing Damus/Primal/Amethyst marks — turns from tolerable-in-an-educational-guide to materially risky. Spin it off only if you (a) fund it as a grant-backed community utility, not a revenue play, and (b) restructure the brand around owned IP (Nostr Kitten) plus permissioned-only real clients. As-is, fidelity is loose and several sims have live bugs, so it needs a focused polish pass before it can headline anything.

## Symulatory — tabela ocen

| Symulator | c | f | p | wow | ~LOC | real? |
|---|---|---|---|---|---|---|
| **Snort** (LIDER) | 8 | 5 | 6 | 6 | 4848 | real |
| **Amethyst** (LIDER) | 7 | 5 | 6 | 6 | 4705 | real |
| **Nostr Kitten** (LIDER) | 3 | 5 | 5 | 7 | 972 | original |
| **YakiHonne** (LIDER) | 7 | 3 | 7 | 6 | 3848 | real |
| **Primal** | 7 | 4 | 6 | 5 | 4402 | real |
| **Damus Simulator** | 6 | 5 | 6 | 5 | 2424 | real |
| **Coracle** | 7 | 2 | 6 | 4 | 2878 | real |
| **Keychat** | 6 | 5 | 6 | 5 | 1554 | real |
| **Olas** | 6 | 4 | 5 | 4 | 1564 | real |
| **Gossip** | 6 | 2 | 4 | 3 | 1925 | real |

## Symulatory — szczegóły

### Snort — LIDER

`c8 / f5 / p6 / wow6 / ~4848 LOC`

**Real client:** real — Snort (v0l/snort, now snort.social) is a real, well-known web Nostr client. This is a simulation of it, though it reframes Snort as "developer-friendly" (code blocks, syntax highlighting, NIP badges) which is an invented angle, and picks a teal accent instead of Snort's actual purple/violet branding.

**Ekrany:** Login (Sign In + Create Account tabs, key generation); Timeline/Feed (following/global/trending filters, quick-compose); Thread (tree view with nested replies + reply composer); Profile (banner, avatar, NIP-05, stats, follow, posts/replies/likes tabs); Relays (add/remove, connect, read/write policies, latency stats); Settings (General/Keys/Privacy/About sections); Compose (modal with markdown toolbar + char counter); Zap modal (preset + custom amounts); Image lightbox (keyboard nav)

**Interakcje:** Login via demo user or generated npub/nsec keys; Compose and 'post' a note (logged, closes modal); Reply in thread (validates non-empty, char counter); Like / unlike with optimistic count; Repost / un-repost with count; Zap with preset or custom sat amount (updates displayed total); Follow / unfollow toggle on profile; Relay connect/disconnect with simulated latency; Add custom relay + remove custom relay; Toggle relay read/write policies; Toggle ~8 settings switches (mostly inert visually); Show/hide + copy private key; Copy public key / code blocks / generated keys to clipboard; Markdown insertion toolbar (bold/italic/code/link) in composer; Image lightbox open + prev/next + Escape; Feed refresh with spinner; Keyboard shortcuts (N new post, / search, R refresh, G+H home); Guided tour that drives login/navigate/compose/post/profile/settings

**Mocne strony:**
- Broad flow coverage: 7 full screens plus zap/lightbox/compose modals — one of the more complete simulators in scope
- Genuinely thoughtful Relays screen (connect state machine, read/write policy toggles, latency/user stats, add/remove custom relays) that goes beyond decoration
- Large, well-organized 1095-line theme CSS driven entirely by CSS variables — clean design-token system that would be easy to re-skin
- Real interactive depth: optimistic like/repost/zap counters, working clipboard copy, markdown-insertion composer, keyboard-navigable image lightbox
- Content parser handles URLs, hashtags, nostr: references, and fenced code blocks with a home-grown multi-language syntax highlighter
- Tour integration is wired to drive real simulator state through a command queue

**Słabości:**
- Brand fidelity is off: real Snort uses a purple/violet accent and a Notes/Notifications/Messages/Search nav; this uses teal and a 'dev-friendly' framing (NIP badges, code highlighting, keyboard-shortcut panel) that Snort doesn't actually foreground
- Live bug: SnortSimulatorState has no `theme` field, yet Settings receives `theme={state.theme}` (always undefined) and `toggleTheme` mutates a non-existent field — the dark-mode toggle is inert
- Feed filter tabs (following/global/trending) don't actually filter the notes — purely cosmetic
- Timeline empty state renders 'Loading timeline...' even after data loads, and most Settings toggles change nothing but their own switch
- All avatars are dicebear 'bottts' robots regardless of user, which reads generic and unlike real Nostr profile pictures
- syntax highlighter uses dangerouslySetInnerHTML with regex over already-escaped text — fragile and can mis-highlight, and there is no light theme despite a Dark Mode toggle existing

**Top polish items:**
- Fix the theme bug: add `theme` to SnortSimulatorState (or drop the toggle), and add a real light-theme CSS variable block so the Dark Mode switch actually works
- Re-skin to match real Snort: switch the teal accent to Snort's purple/violet, and reconsider the 'developer client' framing (NIP badges / shortcuts panel) toward Snort's actual social-first UI
- Make the feed filter tabs (following/global/trending) actually filter notes, and fix the 'Loading timeline...' empty-state copy
- Replace the uniform dicebear 'bottts' robot avatars with varied, more human/profile-like images so the feed reads as a real social client
- Wire the inert Settings toggles (compact mode, media previews, etc.) to at least one visible effect, or mark them clearly as demo-only
- Add a Notifications and DM/Messages screen — both are core Snort surfaces referenced by the nav/shortcuts but not implemented

**Werdykt:** A strong supporting act — one of the most feature-complete simulators here with an excellent relay screen and clean tokenized CSS, but weak brand fidelity (teal + dev framing vs Snort's purple social UI) and a live theme bug keep it out of flagship contention until re-skinned and debugged.

### Amethyst — LIDER

`c7 / f5 / p6 / wow6 / ~4705 LOC`

**Real client:** real — simulates Amethyst, the dominant Android Nostr client by Vitor Pamplona, using Material Design 3 / Material You. Mock data name-drops the real author, fiatjaf, jb55, ODELL, and references the actual QuoteBorder 15dp shape and Teal200 from the app's Color.kt.

**Ekrany:** Login (sign-in npub/nsec + Create Account key generation with clipboard copy); Home feed (stories row, Following/Global tabs, filter chips, pull-to-refresh, note cards); Search (recent searches, trending topics, suggested users, live content filtering); Video (grid with Trending/Subscriptions/Library tabs, thumbnails, durations); Notifications (All/Mentions tabs, typed icons, zap amounts, mark-all-read); Messages (encrypted DM conversation list, search, online indicators, unread badges); Profile (banner, avatar, bio, stats, Posts/Replies/Likes tabs); Settings (Account, Appearance theme selector, Notification toggles, expandable Relays, Support, Sign out/Delete); Compose (modal with char-count progress ring, Public/Followers privacy selector, image previews, formatting toolbar)

**Interakcje:** Log in with mock account or generate a fresh keypair and copy npub/nsec to clipboard; Navigate between tabs via bottom nav and section sub-tabs (animated layoutId indicator); Compose and publish a post -> success toast; Like / repost / zap toggles with optimistic count updates (zap adds +21 sats, Bitcoin-orange fill); Search with live substring filtering over mock notes; Mark all notifications read; switch All/Mentions; Toggle notification switches, pick Light/Dark/Auto theme, expand/collapse relay list; Follow / Edit Profile toggle on profile; Add/remove mock images and switch post privacy in composer; Guided tour that programmatically drives login -> feed -> compose -> post -> profile -> settings; Pull-to-refresh gesture on the feed (touch handlers with resistance + spinner)

**Mocne strony:**
- Unusually complete for the set: 9 distinct screens, all wired into a working tab shell with a compose modal, settings drawer, toasts, and a scripted guided tour.
- The MD3 theme CSS is the real asset here — 1000+ lines of proper Material You design tokens (elevation tints, ripple, switches, chips, snackbar, bottom-nav pill indicator) with correct #6750A4 purple, #D0BCFF dark primary, teal secondary, and Bitcoin-orange #F7931A for zaps, plus a scoped dark theme.
- Rich framer-motion usage throughout: spring tab indicators, pull-to-refresh with resistance physics, staggered card entrances, animated drawer/modal/toast — it feels alive.
- Genuine domain accuracy: mock data uses the actual Amethyst author (Vitor Pamplona), fiatjaf, jb55, ODELL; comments cite real source constants (QuoteBorder 15dp, Teal200); NIP-05 badges, encrypted-DM notice, sats amounts, relay latency all present.
- Optimistic action-button state (like/repost/zap flip color and bump counts) makes the feed feel interactive rather than static.

**Słabości:**
- The left Drawer is fully built and integrated in AmethystSimulator.tsx but is DEAD CODE — setIsDrawerOpen(true) is never called anywhere, and HomeScreen's hamburger button has no onClick, so the drawer can never open. Video, Bookmarks, Relays, Security are only reachable through this broken drawer (or the tour), making them effectively unreachable in normal use.
- Bottom nav has only 5 items and no Video entry, so the Video screen — one of the touted feature-rich highlights — is orphaned.
- Fidelity is loose (no vision model): a generic circle-checkmark logo stands in for Amethyst's actual amethyst-gem icon; note cards are elevated Twitter-style cards rather than Amethyst's dense, flat, threaded list; there's a fake 280-char limit and an Instagram-style Stories row that Amethyst doesn't have.
- Missing the actual feature-rich hallmarks that define Amethyst: long-form articles, communities, live streams/live activities, image feed, drafts, multi-account — Video is a YouTube-style grid, not NIP-71 video events.
- Buttons reference .md-btn / .md-btn-primary classes (LoginScreen) that aren't defined in the theme CSS (only .md-button-* exist), so those primary buttons render unstyled.
- The theme CSS duplicates the Bitcoin-orange token block four times; the committed VALIDATION_REPORT self-grades 'A+ 100% / 60/60' which is not credible and inflates perceived quality.

**Top polish items:**
- Wire the drawer: pass an onOpenDrawer handler into HomeScreen (and other app bars) and hook it to the hamburger Menu button so the fully-built Drawer actually opens; this single fix unlocks Video, Bookmarks, Relays, Security.
- Fix the LoginScreen buttons: replace the undefined .md-btn/.md-btn-primary/.md-btn-secondary classes with the existing .md-button md-button-filled/-outlined so Sign In / Continue render as styled Material buttons.
- Add a Video entry to the bottom nav (or a proper 'more' overflow) so every screen is reachable without the tour, and reconsider hiding the bottom nav on Video/Profile.
- Replace the generic checkmark-circle logo with an actual amethyst-gem SVG and tighten note cards toward Amethyst's flatter, denser threaded layout to lift fidelity.
- Deduplicate the four identical Bitcoin-orange blocks in amethyst.theme.css and delete the unused --amethyst-* brand-color scales that were flagged as never referenced.
- Add at least one signature Amethyst feature screen (long-form article reader or a live-stream/community view) to justify the 'very feature-rich' positioning, and replace the fake 280-char compose limit.

**Werdykt:** A supporting act with flagship bones — the deepest MD3 theme and broadest screen count in the set, but a dead-drawer wiring bug orphans several screens and fidelity to the real Amethyst is only loose; fix the wiring and add one signature feature (long-form/live) and it becomes a genuine flagship candidate.

### Nostr Kitten — LIDER

`c3 / f5 / p5 / wow7 / ~972 LOC`

**Real client:** original — "NostrKitten" is an invented, playful parody concept (a 90s GeoCities / Netscape-era personal homepage reimagined as a Nostr client). Web search finds no real Nostr client by this name; the in-code comments even self-describe it as "The most chaotic Nostr client ever / Pure 90s GeoCities energy." Fully original brand, so it dodges trademark issues entirely — a plus for a spinoff.

**Ekrany:** Home (About Me / currently-listening marquee / stats widgets); My Notes (feed of 3 seeded notes + compose box); Guestbook (3 seeded entries + sign form); Cool Links (links list + awards section)

**Interakcje:** Tab navigation between Home / Notes / Guestbook / Links (real, working via activeTab state); Play/Stop MIDI toggle button (toggles label text only — no actual audio); Note compose textarea with 140-char maxLength (typeable, but Post button does nothing); Like / Repost / Zap buttons on notes (rendered, no handlers — pure decoration); Guestbook form inputs (typeable, Sign button is a no-op)

**Mocne strony:**
- Strong, coherent creative concept executed with real commitment — the 90s GeoCities/Netscape aesthetic is nailed via CSS: rainbow gradient headers, blinking text, UNDER CONSTRUCTION banner, marquee, starfield with twinkle animation, visitor counter, hit-counter img, ridge/groove/outset beveled borders, Comic Sans, ICQ/email floating tags, webring footer, custom chunky scrollbars.
- Original invented brand — zero trademark risk, and genuinely differentiated from every other 'clone-a-real-client' simulator. Memorable and demo-worthy on novelty alone.
- Clean, self-contained implementation: one 274-line component + one 698-line themed CSS file, no external asset dependencies beyond one remote hit-counter image. Tabs actually work.
- Thematic jokes land (Y2K prep note, 'Bitcoin maximalist since 2024 / online since 1999', SatoshiNakamoto guestbook entry, 140-char note limit as a Twitter-era wink, awards section).
- Responsive breakpoint at 600px collapses the two-column home grid and stacks nav — shows some care.

**Słabości:**
- Almost nothing actually functions as a Nostr client: no posting, no likes/reposts/zaps wired up, no login/keys, no relays, no profiles, no real feed. Forms are visual props with no submit handlers. Completeness as a *client* is very low.
- Dead state: visitorCount, setNotes, setEntries, useCallback import, and MockUser/MockNote type imports are declared but never meaningfully used — counter never increments, notes never get added. Reads as an unfinished scaffold.
- MIDI player is fake (label toggle only, no audio element) — a missed easy win given the whole gag is 'All-Star.mid'.
- Relies on the deprecated <marquee> element and a remote counter.digits.com image — fragile, and the external image will likely 404, breaking the footer.
- No WithTour variant, no README/IMPLEMENTATION notes, no mock-data integration despite importing the types — an island wired only into the .astro page.
- The Nostr-ness is skin-deep flavor text; it barely gestures at the protocol.

**Top polish items:**
- Wire the interactions: make Post Note prepend to the notes list, make Sign Guestbook append an entry, and give Like/Repost/Zap working counters with optimistic bumps. This alone would 3x perceived quality.
- Make the visitor counter live (increment on mount / random tick) and remove the dead setNotes/setEntries/useCallback/Mock* imports so the code reads as finished, not scaffolded.
- Ship real (looping, muted-by-default, user-gestured) chiptune/MIDI-style audio via Web Audio or a data-URI so 'Play MIDI' does something — it's the signature gag.
- Replace the remote counter.digits.com hit-counter <img> with a self-rendered CSS/odometer counter so nothing 404s, and swap deprecated <marquee> for a CSS keyframe scroller.
- Add a fake 'Connect with nsec' GeoCities login modal and a relay list styled as an AIM buddy list — turns flavor into a mini guided flow and adds Nostr legitimacy.
- Add an easter-egg layer (cursor trail, Comic Sans toggle, 'sign my guestbook' popup, dial-up connect sound) to make it a viral standalone toy rather than a static page.

**Werdykt:** Supporting act with flagship potential IF built out — the strongest *concept* in the set (original, trademark-safe, instantly memorable 90s-GeoCities gag) but currently a near-static skin with almost no working client functionality, so it earns a spinoff slot only after the interactions are actually wired up.

### YakiHonne — LIDER

`c7 / f3 / p7 / wow6 / ~3848 LOC`

**Real client:** real — YakiHonne is a genuine, well-known Nostr client (web/iOS/Android) focused on long-form NIP-23 articles, Smart Widgets, curations, and an integrated Lightning/Cashu wallet. This is a loose simulation of it, not an invented app.

**Ekrany:** Login (Sign In with nsec/extension + Create Keys with generated npub/nsec); Feed (mixed notes/long-form/repost with All/Following/Zapped tabs); Articles (Trending/Latest/Saved with cover-image cards); Media (grid/list gallery with lightbox viewer, Photos/Videos tabs); Profile (cover, avatar, follow, stats, Posts/Articles/Media/Likes tabs); Wallet (balance card, Receive/Send/QR quick actions, tx history with Zaps/Received filters); Settings (Appearance/Notifications/Content/Security/About sections, keys modal); Compose (bottom-sheet modal with Post/Article/Media type switcher + toolbar)

**Interakcje:** Demo login (random user) and Create-Keys flow that generates mock npub/nsec with copy-to-clipboard toast; Bottom-tab navigation across 5 tabs + FAB compose; Compose modal: type switching, article title, char counter (280 for posts), mock image attach, simulated posting spinner + success toast; Like/repost/zap toggles on feed notes (zap decrements wallet balance by 21 sats); Bookmark toggle on articles feeding the Saved tab; Media grid item click opens fullscreen lightbox; Wallet Receive modal 'Simulate Receive 10,000 sats' and Send modal (both mutate balance + toast); Wallet balance show/hide (eye toggle) with sats/BTC display; Profile Follow/Unfollow toggle; Settings toggles (notifications, autoplay, theme item) and keys modal; Guided tour that programmatically drives login/navigate/compose/post/profile/settings steps

**Mocne strony:**
- Broad surface area: 8 distinct screens, all reachable and stateful, plus a working compose modal and lightbox — genuinely feels like a multi-screen app, not a single mockup
- The wallet is the most differentiated piece: gradient balance card, show/hide, sats↔BTC, Receive/Send/QR modals, filterable tx history, and a live balance that zaps actually decrement — a real end-to-end money loop few simulators bother with
- Cohesive, well-structured design system: 809-line themed CSS with light/dark tokens, consistent spacing/radius/shadow variables, reusable ContentTabs with a shared framer-motion layoutId indicator
- Consistent, tasteful motion throughout (spring transitions, staggered list entrances, animated toasts, bottom-sheet compose) that reads as polished
- Clean component decomposition (screens/ + components/ + theme) and a real guided-tour integration with a command queue driving simulator state
- Login screen is a highlight: Sign In vs Create Keys tabs, generated key pair with red-flagged nsec warning and copy — good Nostr onboarding pedagogy

**Słabości:**
- Brand/visual identity is wrong: real YakiHonne is purple/violet; this sim is themed Bitcoin-orange (#F7931A) throughout, and the shared config even declares pink (#EC4899) — three conflicting brand colors and none match the real app
- Misses YakiHonne's signature features entirely: no Smart Widgets (kind:30033 interactive mini-apps), no Curations, no NWC/Cashu wallet framing — the wallet is a generic Lightning wallet, not YakiHonne's actual model
- No article reader/detail view — 'Articles' only lists cards; tapping an article does nothing, which is the exact opposite of a long-form-first client's core loop
- Layout is a generic bottom-tab social app; the real client leads with long-form and (on desktop) a suggested-articles-over-timeline structure — the sim reads like a Bitcoin-flavored Twitter clone
- Heavy reliance on external Unsplash/DiceBear URLs for all imagery — offline/CSP-restricted environments render broken images
- Lots of dead/no-op controls: search buttons, notification bell, hashtag/mention/link toolbar buttons, QR action, terms/help/relay/privacy rows — all inert
- Data is fully hardcoded per-screen (5 different mock arrays inline); no shared user/session identity flows through (Profile shows Satoshi regardless of who logged in), Following/Zapped filters are effectively fake

**Top polish items:**
- Re-skin to YakiHonne's real purple/violet brand and reconcile the config (#EC4899 pink) vs theme (#F7931A orange) into one correct color; update logo mark accordingly
- Add an article reader/detail view (tap an ArticleCard → NIP-23-style rendered long-form with author, zaps, comments) — this is the client's defining experience and is currently absent
- Implement at least a token 'Smart Widget' and/or Curation surface to capture what makes YakiHonne unique rather than generic; even one interactive widget card in-feed would sell it
- Thread the logged-in user through Profile/Compose so identity is consistent (currently Profile hardcodes Satoshi and posted content is discarded), and make Following/Zapped filters operate on real state
- Wire up or gracefully hide the many inert controls (search, notifications, toolbar hashtag/mention, QR) — either make them do something minimal or remove them to avoid dead affordances
- Replace remote Unsplash/DiceBear assets with bundled/local placeholders so it renders reliably offline and under strict CSP

**Werdykt:** A supporting act: genuinely broad and polished (standout wallet + strong onboarding), but with the wrong brand color and none of YakiHonne's signature long-form/Smart-Widget DNA, it needs a re-skin and an article reader before it could ever headline a spinoff.

### Primal

`c7 / f4 / p6 / wow5 / ~4402 LOC`

**Real client:** real — simulates Primal (primal.net), the commercial Nostr client with built-in Lightning wallet and discovery feed. It is a recognizable, existing product, though this sim renders it as a fairly generic Twitter/X-style three-column clone rather than Primal's actual distinctive layout.

**Ekrany:** Web: Login (sign-in + generate-keys with clipboard copy); Web: Home feed (For you / Following tabs, inline compose box); Web: Explore (categories, trending topics, popular users, topic chips); Web: Notifications (All / Mentions / Zaps filters); Web: Messages (DM conversation list); Web: Profile (banner, notes/replies/media/likes tabs, follow); Web: Settings (slide-in drawer, theme toggle, account/relay sections); Web components: ComposeModal, LeftSidebar, RightSidebar with Wallet card + Trending + Who-to-follow; Mobile: Home feed (For You / Following); Mobile: Search (Trending / Users / Media, recent searches); Mobile: Notifications (All / Mentions / Zaps); Mobile: Profile (banner, tabs, settings links); Mobile chrome: iOS status bar, notch, home indicator, BottomNav, FAB, ComposeSheet; Mobile: SettingsScreen exists but is DEAD CODE (never imported/rendered)

**Interakcje:** Demo login (random user) and generate-new-keys flow with npub/nsec + copy-to-clipboard; Tab navigation across all screens (web + mobile); Compose + publish note -> success toast; Like / Repost / Zap with optimistic local count updates in NoteCard; Follow / Unfollow toggle with toast (profile); Notification tab filtering (all/mentions/zaps); Explore category selection + topic/hashtag chips -> toast; Search text input (mobile + web, non-functional filtering); Guided 10-step tour that auto-drives login/navigate/compose/post via a command queue; Theme toggle UI present but web version is disabled (onThemeChange undefined) and mobile SettingsScreen unwired

**Mocne strony:**
- Two full variants (web three-column + mobile with iOS device chrome) sharing mock data — broad surface area for ~4.4k LOC
- Clean, modular architecture: per-screen components, shared hooks, exported public API in index.ts
- Comprehensive design-token CSS theme (spacing, radius, elevation, transitions, light/dark overrides) for both variants
- NoteCard has genuine optimistic-update state (liked/reposted/zapped toggles + count adjustment), not just static markup
- Polished login screen that actually teaches the Nostr key model (nsec input, extension option, key generation, save-your-key warnings)
- Full 10-step guided tour with a command-queue that programmatically drives the simulator (login -> navigate -> compose -> post)
- Framer-motion micro-interactions throughout (hover/tap scales, enter animations, spring drawers/sheets)
- Includes Primal-signature wallet card (balance + Receive/Send) in the web right sidebar

**Słabości:**
- Brand-color chaos: CSS theme defines orange #F97316 but 42 hardcoded #7C3AED purple instances across 14 files override it — the two systems disagree and accent elements ignore the theme
- Config/theme claim 'Orange Bitcoin-themed', but real Primal is purple/magenta — so nothing matches the real brand cleanly; it's a generic X/Twitter clone visually
- Missing Primal's actual differentiators: no Reads (long-form), no Feeds marketplace, no Advanced Search, no analytics/charts, and the wallet is a static non-interactive card
- Theme switching is broken: web Settings passes onThemeChange=undefined (buttons disabled); theme is driven only by useParentTheme, so in-app toggle does nothing
- Hardcoded purple accents defeat light/dark theming for buttons, active states, links, badges
- Mobile SettingsScreen is dead code (never wired); mobile wallet CSS exists but no mobile screen renders it
- All avatars are gradient placeholders and every profile is 'Your Name / @handle' — no identity realism
- Search inputs are decorative (no filtering); many actions just fire a toast rather than change state
- Fake Twitter-isms leak in: '© 2025 Primal, Inc.', 'Terms of Service/Ads info' footer, 'What is happening?!' placeholder — not Primal copy

**Top polish items:**
- Unify on one brand palette: replace all 42 hardcoded #7C3AED with the real Primal purple/magenta gradient via CSS vars (--primal-primary), and fix the config's inaccurate 'orange' claim so theme and components agree
- Wire real theme switching: connect the Settings toggle to actual state (remove the disabled/undefined onThemeChange) so light/dark works, and make accents use vars so they respond
- Add Primal's signature surfaces to lift fidelity above 'generic X clone': a 'Reads' long-form tab, a 'Feeds' marketplace, and a real interactive Wallet screen (send/receive/zap history) instead of a static card
- Give the feed/profiles real identity: use mock avatars and distinct display names/handles instead of gradient placeholders and repeated 'Your Name / @handle'
- Make search and category filters actually filter the mock data, and remove or implement the dead mobile SettingsScreen and unused mobile wallet CSS
- Replace Twitter-leftover copy/footer ('Primal, Inc.', 'Ads info', 'What is happening?!') with Primal-authentic strings and a Primal-style top-nav rather than X's layout

**Werdykt:** Supporting act — a competent, broad two-variant build with a strong tour and login flow, but too much of a generic Twitter clone with brand-color inconsistencies and none of Primal's real differentiators (Reads/Feeds/wallet/analytics) to lead as a flagship without significant Primal-specific rework.

### Damus Simulator

`c6 / f5 / p6 / wow5 / ~2424 LOC`

**Real client:** real — simulates Damus, the flagship iOS Nostr client by Will Casarin (jb55). Purple accent, iOS-native styling, and mock data seeded with real Damus-adjacent Nostr figures (fiatjaf, jb55, Vitor Pamplona, Kieran, PabloF7z) confirm the intent.

**Ekrany:** Login (Sign In / Create Account tabs with key generation); Home feed (Following/Global filter, pull-to-refresh, load-more); Profile (banner, stats, Posts/Replies/Likes tabs, follow); Compose (char counter + progress ring, reply context, media toolbar); Settings (General/Relays/Account sections with toggles, relay list, key management, logout)

**Interakcje:** Login as random mock user or via generated keys; Generate mock npub/nsec keypair and copy to clipboard; Like / Repost / Zap with optimistic count updates and toggle state; Reply to a note (opens compose with reply context); Post with 280-char counter, animated progress ring, Cmd+Enter shortcut, posting spinner; Follow / Unfollow toggle on profiles; Navigate via bottom tab bar (Home/Profile/Settings) + compose FAB; View profile from avatar/name taps; Toggle settings switches (dark mode, show images, auto-play GIFs, expand threads); Browse connected relays with online/latency/user-count status; Add recommended relays; Pull-to-refresh feed (scroll-triggered with spinner); Logout with confirm dialog; Full auto-driven guided tour (10 steps) that logs in and navigates screens

**Mocne strony:**
- Genuinely careful iOS design system: real Apple system colors (#007AFF, #FF3B30, #34C759, #FF9500), SF font stack, 51x31 iOS toggle switch, env(safe-area-inset) padding, 10/12px iOS corner radii — the 530-line theme is the strongest asset and reads as authentically iOS
- Purple accent (#8B5CF6) and clean white/dark backgrounds correctly capture Damus's signature look
- Mock data uses real Nostr personalities (fiatjaf, Will Casarin/jb55, Vitor Pamplona, Kieran, PabloF7z) which makes the feed feel legitimately Nostr-native rather than generic
- Zap (lightning bolt) is present as a first-class action alongside reply/repost/like/share — correctly Nostr-specific, not just a Twitter clone
- Optimistic UI on like/repost/zap with per-note local state; compose has a polished animated character-progress ring and posting spinner
- Full tour integration (DamusSimulatorWithTour) with a command-queue system that auto-logs-in and drives navigation across 10 steps
- Clean, well-typed component architecture (screens/ + components/ split, typed props, DamusScreen union type) that would be easy to extend
- Dark mode variables defined at the theme root and wired to parent theme via useParentTheme hook

**Słabości:**
- Tab bar is wrong for real Damus: real Damus has Home / Universe(Search) / Notifications / Messages(DMs) — this has Home / Profile / Settings, so the most recognizable navigation is inaccurate
- No Search/Universe, no Notifications, no DMs, no thread/conversation view — all core Damus screens are absent
- 280-character limit is imported from Twitter; Nostr/Damus has no character cap, so this is a conceptual fidelity error
- No 'Purple' subscription — the single most brand-distinctive Damus feature is entirely missing
- NoteCard hardcodes text-gray-900/text-gray-500 (not theme vars), so post text stays dark-on-dark in dark mode — dark mode is only half-implemented despite the CSS being defined
- Dead code: ProfileHeader.tsx (124 lines) is exported but never used; HomeScreen also relies on a fragile scroll-triggered pull-to-refresh that rarely fires in a fixed-height frame
- Minor bug: ComposeScreen reads replyTo.author?.username, but MockNote has no author field, so reply context always renders '@user'
- Login 'Sign In' ignores the entered npub/nsec entirely and logs in a random user; keys are cosmetic hex, not real bech32
- Zap has no sats-amount picker (real Damus prompts for zap amount) — it's a one-tap toggle like a like

**Top polish items:**
- Fix the tab bar to match real Damus (Home / Universe / Notifications / Messages) and add at least a stub Search/Universe screen and a Notifications list — this is the highest-leverage fidelity fix
- Make dark mode actually work: replace hardcoded text-gray-* in NoteCard (and the gray-* literals in ProfileHeader) with --damus-text / --damus-text-secondary vars so post text is legible in dark mode
- Remove the 280-char cap (or reframe it as a soft indicator) since Nostr has no limit, and add a real zap-amount sheet (e.g. 21 / 100 / 500 / custom sats) to make zapping feel Damus-authentic
- Add a Damus 'Purple' subscription screen/upsell — it's the client's signature monetization and instantly recognizable
- Delete or wire up the unused ProfileHeader.tsx, and replace the flaky scroll-based pull-to-refresh with a reliable button or gesture that works inside the fixed phone frame
- Fix the replyTo.author bug (resolve author via getUserByPubkey) and make Login actually accept/echo the typed npub instead of silently substituting a random user

**Werdykt:** A supporting act: a clean, well-architected iOS-styled shell with an authentic theme and the right Nostr primitives (zaps, relays, keys), but it's missing Damus's most recognizable screens (Universe, DMs, Notifications, Purple) and has a wrong tab bar and half-baked dark mode — solid foundation to promote later, but not flagship-ready as-is.

### Coracle

`c7 / f2 / p6 / wow4 / ~2878 LOC`

**Real client:** real — Coracle (coracle.social) is a real, well-known Nostr web client by Jon Staab (hodlbod). BUT this simulator does not resemble it: the real client is dark-first, orange/gold accented, Svelte, left-sidebar, and power-user/relay/web-of-trust focused; this sim reimagines it as a light-theme, indigo, top-nav, explicitly "beginner-friendly" generic client — essentially the opposite positioning.

**Ekrany:** Login (Sign In tab + Create Account tab with mock key generation and copy); Home feed (welcome banner, stat cards, feed of NoteCards, Latest/Popular toggle, Load More); Profile (header with avatar/bio/stats, inline Edit Profile form, Notes/Replies/Likes tabs); Relays manager (stat cards, search, filter dropdown, relay cards with NIPs/latency/users, connect/disconnect, Add Relay modal); Settings (General / Privacy / Appearance / Advanced sub-sections with toggles, zap-amount slider, account info, logout); Guided Tour (5-step onboarding overlay with progress bar); Compose modal (textarea, char counter, hashtag/mention insert, keyboard shortcuts); Zap modal (amount input + preset chips, in NoteCard)

**Interakcje:** Log in with a random mock user (Sign In); Generate mock npub/nsec keypair, copy to clipboard, and continue as new user; Navigate between Home/Relays/Profile/Settings via top nav (desktop + mobile hamburger); Like / unlike notes (optimistic count update, console log); Repost / un-repost notes (count update); Zap notes with preset or custom sat amounts (accumulates, shows indicator); Reply button opens compose modal; Follow / unfollow users from Profile; Edit own profile (name, username, bio, location, website, lightning address) and save to state; Connect / disconnect relays (updates connected count, disabled when offline); Search + filter relays (all/connected/paid/free); Compose a post with char counter, hashtag/mention insertion, Cmd+Enter to post (logs, closes — does not persist to feed); Toggle settings switches (notifications, autoplay, compact, dark mode, high contrast, large text, reduce motion) held in local state; Adjust default zap amount via range slider; Start/advance/skip the 5-step guided tour; Log out (with confirm) and reset to login

**Mocne strony:**
- Broad flow coverage — login (two modes + key generation), feed, profile view/edit, relay management, multi-section settings, compose, zap, and an onboarding tour all present and wired to shared mock data
- Cohesive, well-factored design system in coracle.theme.css with real accessibility affordances: :focus-visible outlines, prefers-contrast, prefers-reduced-motion, iOS 16px anti-zoom, custom scrollbars
- Relays screen is the strongest and most on-brand-adjacent piece: NIP badges, latency, user counts, paid/free status, online indicators, search + filter + add-relay modal — genuinely useful and relay-centric
- Real optimistic interactions with console logging (like/repost/zap/follow/connect) and clean React state management via a single typed state object
- Thoughtful NoteCard: relative time formatting, number abbreviation (k/M), image grid layouts, show-more clamp, zap presets
- Good beginner-education touches: nsec 'keep secret' warnings, 'Privacy on Nostr' notice, relay explainer box

**Słabości:**
- Almost zero fidelity to the real Coracle: wrong color (indigo vs Coracle's orange/gold), wrong theme (light vs dark-first), wrong nav (top bar vs left sidebar), wrong ethos (beginner-friendly vs power-user), and none of the signature features (custom feeds, web-of-trust, groups/spaces, multi-relay routing)
- Dark mode is a toggle in Settings state that is never applied to the UI — only 3 stray dark: classes exist; the whole app is hardcoded light (bg-white everywhere)
- Many dead buttons: Extension/QR login, compose image & emoji, Share, Load More, Latest/Popular, Export Data, Clear Cache, Learn more, and the Privacy toggles are hardcoded ON with no-op handlers
- Composed posts never appear in the feed — onPost only logs and closes; no local note prepend, so the core 'post' loop feels fake
- Profile edits to own profile aren't reflected in the feed (notes still keyed off mock user), and non-followed authors surface in feed only via a likes>50 heuristic
- Login npub input is decorative — any/empty input just logs in as a random mock user; no validation
- Uses generic dicebear 'bottts' robot avatars rather than anything resembling real Nostr profile pictures, cheapening the visual
- Guided tour describes UI regions ('top navigation', 'Post button') but doesn't spotlight/anchor to them — it's a centered modal, not a real product tour

**Top polish items:**
- Reskin to the real Coracle identity: dark-first palette with the orange/gold accent, and move primary navigation to a left sidebar to match coracle.social's actual layout
- Actually apply the dark-mode + high-contrast + large-text + compact toggles to the DOM (data-attribute or class on the root) so Settings changes are visible
- Make composing real: prepend the new note to the top of the feed (with the current user as author, 'just now' timestamp) so the post loop closes
- Wire up or remove dead buttons — at minimum give Share a copy-link toast, Load More a spinner+append, and make the hardcoded Privacy toggles stateful
- Lean into Coracle's differentiators to earn the name: add a 'Custom Feeds' builder and a web-of-trust / relay-routing indicator on notes, since relay-centrism is the client's whole identity
- Replace bottts robot avatars with more realistic mock profile images, and anchor the guided-tour steps to real elements (spotlight/arrow) instead of a centered modal

**Werdykt:** Supporting act — a competent, accessible, broadly-featured generic Nostr client, but it's Coracle in name only (wrong theme, wrong nav, none of the real client's power-user/relay/WoT identity), so it needs a substantial reskin and its signature features before it could headline a spinoff.

### Keychat

`c6 / f5 / p6 / wow5 / ~1554 LOC`

**Real client:** real — Keychat (keychat.io / keychat-io/keychat-app) is an actual shipping Android/cross-platform "super app": Signal-protocol encrypted chat + Bitcoin ecash (Cashu) wallet + Nostr sovereign identity + mini-apps. The simulator targets it directly and its blue brand + feature pillars are correct.

**Ekrany:** Login / Onboarding (create account or import nsec); Chat List; Chat Room (1:1 messaging); Wallet (Ecash/Bitcoin tabs + Receive modal); Mini Apps (grid + featured banner); Settings (grouped toggles + profile card)

**Interakcje:** Create New Account (1.5s spinner then logs in with generated npub); Import nsec key (enabled when >=10 chars, then logs in); Bottom-nav tab switching with animated scale/indicator; Open a chat from the list; Back out of a chat room; Type and send a real message (appends to list, autoscrolls, send button animates in on input); Enter key sends message; Wallet Ecash/Bitcoin tab toggle; Wallet Receive modal open/close (mock QR bottom sheet); Settings toggles: E2E encryption, notifications, dark mode, message preview (local state); 10-step guided tour that auto-logs-in and drives navigation across all screens; Toast notification on login

**Mocne strony:**
- Conceptually the most accurate simulator of Keychat's actual value prop: tour and settings copy correctly describe Signal Protocol E2E, Cashu ecash, non-custodial keys, no phone/email, NIP-05 — unusually faithful for an LLM without a vision model
- Correct brand color family (blue #2D7FF9) matching the real app, applied consistently across all headers and accents
- Six distinct, coherent screens covering the three real pillars (chat, wallet, mini-apps) plus identity and settings
- Genuinely working message send with state, autoscroll, and an animated send button that appears only when there's input
- Polished micro-interactions throughout via framer-motion: staggered list entrance, spring tab indicator, bottom-sheet Receive modal, login spinner
- Well-engineered 10-step guided tour that programmatically logs in and navigates the whole app — the strongest differentiator
- Clean dark-mode support driven by parent site theme, wired through CSS variables

**Słabości:**
- Visual layout is a generic Telegram/Material chat app, not a reproduction of Keychat's actual screens — the real onboarding, wallet UI, and iconography are not matched; it's a plausible reconstruction, not a lookalike
- Debug cruft shipped: KeychatSimulator.tsx is labeled 'Debug Version' and is full of console.log statements; unused motion import
- The WithTour command-queue logic is convoluted and fragile (double queue-slicing in handleCommandHandled, timing-based setTimeout hacks) — easy to desync
- Lots of decorative dead controls: search icons, the +/attach/emoji/zap buttons in chat, most settings links, the wallet Send/Zap buttons, and the mini-app tiles do nothing
- Settings 'Dark Mode' toggle is local state only and does not actually re-theme the app (theme comes from parent site), which is misleading
- No group-chat view despite a 'Nostr Group' entry in the list; tapping any chat always shows the same hardcoded 'Alice' conversation regardless of chatId
- Ecash-as-stamps mechanic — Keychat's single most distinctive technical feature — is only mentioned in copy, never visualized or demonstrated
- USD conversion, balance, and all transactions are hardcoded; no persistence

**Top polish items:**
- Strip all console.log/debug scaffolding and the 'Debug Version' comment; remove the unused motion import in KeychatSimulator.tsx before any spinoff
- Make the chat room read from chatId so different contacts (and the group chat) show distinct names/avatars/messages instead of always 'Alice'
- Wire up the currently-dead but high-value controls: at minimum the wallet Send flow (amount entry) and a real 'send sats in chat' action, since ecash-in-chat is Keychat's core hook
- Visualize the ecash-stamp/relay-post-office mechanic somewhere (e.g. a send animation or a 'stamped with 1 sat' badge) to actually differentiate from a generic Signal clone
- Fix or remove the local-only Dark Mode toggle so it either truly themes the app or isn't presented as functional
- Simplify the WithTour command queue into a single declarative step->state map to remove the timing-based fragility

**Werdykt:** A solid supporting act — conceptually faithful and pleasantly animated with a strong guided tour, but visually generic and full of dead controls; it needs debug cleanup and its signature ecash-in-chat mechanic made real before it could carry a spinoff as a flagship.

### Olas

`c6 / f4 / p5 / wow4 / ~1564 LOC`

**Real client:** real — Olas is a genuine, shipping Instagram-like photo/video Nostr client (iOS/Android/web, olas.app, kind:20 picture events, Blossom media). The simulator targets it by name, but the implementation is a generic "Instagram clone" rather than a faithful Olas reproduction.

**Ekrany:** Login / welcome ('Start Exploring'); Home feed (StoryRow + MediaCard list + 'You're all caught up'); Discover (search bar, trending tags, featured creators, explore grid); Upload / compose modal (gallery picker, preview, caption, Share); Profile (avatar, stats, Edit/Share buttons, Grid/Saved tabs, photo grid); Notifications / Activity (follow requests + like/follow/comment/mention list)

**Interakcje:** Login (button or tour command) toggles authenticated state + welcome toast; Bottom-nav tab switching (home/discover/notifications/profile) with active-state scaling; Upload FAB opens full-screen compose modal; Select a sample photo in compose → enables Share → posts, shows success toast, returns to home; Caption text input in compose; Double-tap a MediaCard image → heart animation + like increment; Like button toggle with fill/color change and count update; Profile Grid/Saved tab switch (Saved shows empty state); Auto-starting guided tour that drives login + navigation across all screens via a command queue; Search input and trending-tag/creator buttons render but are non-functional (decorative)

**Mocne strony:**
- Covers the full five-tab IG-style surface (feed, discover, upload, notifications, profile) plus a login gate — good breadth for ~1560 LOC
- Genuinely working micro-interactions: double-tap-to-like heart animation, like toggle with live count, Framer Motion screen/toast transitions, story gradient rings
- Clean, well-organized code: separate screens/ and components/ dirs, a proper theme CSS with CSS custom properties + dark-mode vars, typed props throughout
- Sophisticated tour integration — an event-driven command queue (OlasSimulatorWithTour) that logs the user in and navigates per step, with data-tour anchors on every screen
- Thorough design/research markdown (DESIGN_SPEC ~379 lines) documenting palette, spacing, components and tour flow — strong scaffolding for further work

**Słabości:**
- Real bug: ProfileScreen reads currentUser?.picture and currentUser?.about, but MockUser defines avatar and bio — so the profile NEVER shows the logged-in user's avatar/bio, always the fallback placeholder
- Not actually Olas-faithful: it's a generic Instagram clone. Missing Olas's real differentiators (kind:20 picture events, Blossom server selection, Reels/short-video, relay-scoped feeds, zaps on photos)
- Imports Instagram concepts that don't exist in Nostr/Olas: '24h ephemeral Stories', 'Follow Requests', 'private account' — these are fidelity/conceptual misses the tour even narrates as fact
- Depends entirely on external network assets (Unsplash photos, DiceBear 'bottts' robot avatars) — breaks offline and the robot avatars shatter the 'real app' illusion
- Search bar, trending tags, featured creators, comment/share/bookmark buttons, Edit/Share Profile, follow-request Confirm, and story taps are all non-functional decoration
- No zap UI at all despite ZAPS being listed in olasConfig.supportedFeatures and being Olas's core Nostr value-add; no relay picker, no NIP-05 display beyond a hardcoded string
- Upload only lets you pick from 6 canned photos — no real file/camera affordance, and the video 'type' is faked with a play badge over a still image

**Top polish items:**
- Fix the ProfileScreen field bug: use currentUser?.avatar and currentUser?.bio (not .picture/.about) so the logged-in identity actually renders
- Add Olas-specific Nostr fidelity: a zap/tip flow on photos (sats), a Blossom/relay-feed toggle on the home feed (Friends / Extended network / Relay), and rename/reframe 'Stories' and 'Follow Requests' to match a real Nostr photo client
- Replace robot bottts avatars and Unsplash hotlinks with photo-style avatars and locally-bundled/base64 images so it renders offline and reads as a real photo app
- Make the decorative controls real: wire search filtering of the explore grid, trending-tag clicks, comment/bookmark toggles, and the Grid/Saved profile counts
- Implement a real photo viewer: tapping a grid cell should open a full-screen media view (the DESIGN_SPEC and tour promise 'tap to view full screen' but nothing happens)
- Add short-video/Reels support (a genuine Olas feature) instead of faking video with a play-icon overlay on a static image

**Werdykt:** Supporting act — a competent, tour-complete Instagram-style shell that reads as 'generic photo app' more than 'Olas', and needs Nostr-specific features (zaps, relay feeds, kind:20) plus the profile bug fix and offline assets before it could carry a spinoff.

### Gossip

`c6 / f2 / p4 / wow3 / ~1925 LOC`

**Real client:** real — this simulates Gossip, the real Rust/egui desktop Nostr client by Mike Dilger. However the simulation captures almost none of the real client's actual look: it's a generic dark web-app sidebar shell, not the spartan egui developer-tool aesthetic of the real thing.

**Ekrany:** Feed (main note list); Thread (single-note conversation view); People (user directory grid); Relays (relay manager with read/write toggles, add/remove, latency, status dots); Settings (General / Privacy / Account toggles + Export/Delete); Onboarding Tour (modal, shown on load); Compose Note (modal)

**Interakcje:** Navigate between Feed/People/Relays/Settings via sidebar clicks; Open a thread by clicking a note; Back button from thread to feed; Compose a note via modal — actually prepends the new note to the feed; Cmd/Ctrl+Enter posts and Esc cancels INSIDE the compose textarea; Resize the sidebar by dragging the edge (clamped 200-400px, works); Relays: toggle read, toggle write, remove relay, add relay by URL (Enter or button) — real local state; Settings: toggle General settings on/off (real local state); Privacy/Account toggles are static/non-wired; Dismiss onboarding tour with Get Started

**Mocne strony:**
- Relays screen is the genuine highlight and thematically on-point for Gossip: per-relay read/write toggles, add/remove, latency + colored connection-status dots (connected/connecting/error with pulse animation) — this is the one place that echoes the real relay-centric client
- Clean, self-consistent CSS design system (~924 lines) with well-organized custom properties, a working drag-to-resize sidebar, and a nice toggle-switch component
- Compose actually mutates feed state, so posting a note visibly works end-to-end
- Settings and Relays hold real React state, so those toggles feel alive
- Includes a thoughtful power-user onboarding tour and dark theme that follows the parent app's theme via useParentTheme

**Słabości:**
- Keyboard shortcuts are FAKE: the sidebar renders Cmd1-Cmd4 / Cmd-comma badges and the tour teaches Cmd1-4 and CmdN, but there is NO global keydown listener anywhere in the simulator — only Cmd+Enter/Esc inside the compose textarea work. The central advertised feature is non-functional.
- ThreadScreen is broken: it calls getUserByPubkey(n.author), but MockNote has no `author` field (it's `pubkey`), so the author lookup returns undefined and renderNote returns null — the main note can render blank. Replies also never render (note.replies is a NUMBER, code does note.replies?.map).
- Reply counts always show 0: FeedScreen does note.replies?.length on a numeric field. People stats always show '0 following / 0 followers' because it reads user.following?.length and user.followers, but the type only has followingCount/followersCount (numbers).
- Fidelity to real Gossip is very low: real Gossip is a spartan egui immediate-mode desktop tool with a narrow icon rail, dense monospace panels and outbox-model UI; this looks like a generic Twitter-ish dark sidebar client. No relay-per-person outbox visualization, no event JSON, no NIP-05/petname/spam UI.
- Avatars are inconsistent and CSP-fragile: feed/people/thread pull remote api.dicebear.com bottts URLs while the sidebar uses a local /simulators/avatars/avatar-1.svg — remote avatars would break under a strict artifact CSP and don't match.
- Like/Repost/Zap buttons in the feed and thread are pure decoration — clicking them only stops propagation; no counts change, nothing is toggled. Filter/Search/Refresh-All header buttons do nothing. Profile viewing is a no-op (viewProfile only stores state, there is no profile screen).
- People and Compose are wired but shallow: no follow/unfollow toggle actually exists despite IMPLEMENTATION.md claiming it; no key generation/login flow despite the claim of 'key generation via auth flow'.

**Top polish items:**
- Wire the global keyboard shortcuts for real: add a window keydown listener in GossipSimulator for Cmd1-4 (navigate), Cmd/Ctrl+N (compose), and Esc (back/close) so the sidebar badges and tour stop lying.
- Fix the data-shape bugs: use note.pubkey (not note.author) in ThreadScreen; render numeric reply counts directly instead of .replies?.length; read user.followersCount/followingCount in PeopleScreen.
- Make the note action buttons functional: local like/repost/zap toggles with incrementing counts, and render real threaded replies (source them from the mock threads.ts data which already models nested replies).
- Redesign toward real Gossip fidelity: swap the consumer-app sidebar for a narrow egui-style icon rail, add a dense flat/light theme option, surface the outbox model (which relays a person posts to) and per-relay event counts, and show raw event JSON — the developer-tool feel is the whole identity of Gossip.
- Unify avatars on local/inline assets (drop remote dicebear) so it renders under strict CSP and looks consistent across feed/thread/people/sidebar.
- Add the missing flows the docs already claim: a key-generation/login entry screen, a real Profile screen for viewProfile, and a working follow/unfollow button on person cards.

**Werdykt:** Supporting act at best — the relay manager is a genuinely nice, on-theme module, but fake keyboard shortcuts, several data-shape bugs (broken thread view, always-zero counts), and near-zero visual fidelity to the real spartan egui client make it too rough and too generic to lead a spinoff without significant rework.

## Architektura i wykonalność wydzielenia

**Fundament (`shared/`):** src/simulators/shared/ is a clean, well-factored foundation and the single biggest asset for extraction. It provides: (1) a full typed state layer in shared/types/index.ts (SimulatorState, ~30 actions, SimulatorConfig, view/modal/feature enums, prop types) that is self-contained except for re-exporting MockUser/MockNote/MockRelay/EventKind from data/mock/types; (2) useSimulator.ts — a Context + useReducer store with a rich set of selector hooks (useCurrentUser, useFeed, useUnreadNotificationsCount, etc.), pure React with zero repo coupling except now() from mockEvents; (3) useParentTheme.ts — a MutationObserver on documentElement's `dark` class, the ONLY hard coupling to the host Astro site's theming (trivial to keep or replace); (4) presentational components SimulatorShell, MobilePhoneFrame (iPhone bezel, 9/19.5 aspect), MockKeyDisplay (npub/nsec copy/reveal), NoteCard — Tailwind + lucide-react, depending only on utils/cn; (5) mockKeys.ts (fake bech32 npub/nsec generators, NO real crypto) and mockEvents.ts (event/time helpers), self-contained; (6) configs.ts — 9 SimulatorConfig objects consumed by pages and the index. Quality is good: strict types, consistent patterns, memoized context. Reusability is high — the whole shared/ tree moves as-is; the only external touchpoints are utils/cn (one-liner) and data/mock/types (types only). Notable: the SimulatorProvider store is UNDERUSED — most client simulators (Damus, Snort, etc.) keep local useState and import mock data directly rather than going through the reducer, so the store is more scaffolding than load-bearing.

**Wysiłek wydzielenia:** medium — 1-2 days to a working standalone skeleton (Vite+React SPA: copy simulators/ + data/mock + components/tour + data/tours + utils/cn, add router + Tailwind + dark toggle + one landing page). ~1 week to polish: rebuild sidebar/landing UX, normalize tours across all 9 clients, prune legacy code, wire routing/SEO, set up build/deploy.

The feature is highly self-contained: ~24.5K LOC under src/simulators/ plus 4 clearly-bounded support trees (data/mock ~3.8K LOC, components/tour, data/tours, utils/cn). All coupling is either copy-as-is (mock data, tour engine, cn) or a thin rewrite (Astro page shells, dark-mode toggling). No backend, no network, no auth, no real crypto — everything is static client-side React. The main cost is not untangling dependencies (shallow and few) but re-creating the ~11 page shells + sidebar navigation + Tailwind/dark-mode config in a new host, deleting 4 legacy simulators, and normalizing the inconsistent WithTour coverage across the 9 clients.

**Rekomendowany stack standalone:** Recommended: Vite + React 19 + TypeScript SPA with React Router and Tailwind v3, deployed as a fully static site. Rationale: these simulators are 100% client-side interactive React islands with no server logic, no data fetching, no SSR-critical SEO surface beyond a few marketing pages, and they rely on browser-only APIs (MutationObserver theme sync, localStorage tour progress, framer-motion). Astro's value proposition (island architecture, minimal JS, content-collection MDX) buys almost nothing here because every simulator page is already a heavy client:load island — you'd ship the same React bundle while carrying Astro's build complexity and the awkward .astro page-shell layer that is exactly what you want to shed. Next.js is overkill and misaligned: it optimizes for SSR/RSC/server routes/data fetching this product doesn't need, and its App Router would fight the entirely-client-side, animation-heavy nature of the simulators. A plain Vite SPA removes the island boilerplate, gives instant HMR for React work, and deploys as static files. Keep Astro ONLY if the standalone product must live inside a larger content/marketing site with many MDX guides; otherwise Vite+React SPA is the cleaner, lighter target. If light per-client SEO/meta is desired later, add a prerender/SSG step (e.g. vite-plugin-ssg) rather than adopting Next.

**Sprzężenie z resztą oryginalnego repo:**
- `../../data/mock (barrel: mockUsers, mockNotes, mockThreads, mockRelays, getters, stats)` **[copy-as-is]** — Imported by ~50 files across every client (screens/components) for user/note/thread/relay fixtures — the primary content source for all simulators. ~3,800 LOC of static TS fixtures in src/data/mock/{users,notes,threads,relays,generator,utils,types}.ts.
- `../../data/mock/types (MockUser, MockNote, MockRelay, EventKind, ContentCategory)` **[copy-as-is]** — Imported by shared/types, shared/utils/mockEvents, and directly by many screens. Foundational domain model.
- `../../components/tour (TourWrapper, TourProvider, TourButton, etc.)` **[copy-as-is]** — Imported by all 7 *SimulatorWithTour wrappers plus a few base simulators. Self-contained tour engine in src/components/tour/ (~15 files: TourProvider/Overlay/Tooltip/Progress + tourStorage localStorage + tour.css). No hard data-tour DOM-selector coupling in TourProvider; tour steps drive simulator state via onStepChange command callbacks.
- `../../data/tours/* (damus-tour, keychat-tour, olas-tour, and barrel data/tours)` **[copy-as-is]** — Per-client tour step configs consumed by the *WithTour wrappers. 8 small tour definition files (~4KB each).
- `../../../utils/cn` **[copy-as-is]** — Tailwind class merge (clsx + tailwind-merge). Used by SimulatorShell, MobilePhoneFrame, MockKeyDisplay, NoteCard and many client components.
- `Astro layer (layouts/Layout.astro, components/layout/Header.astro, components/navigation/SimulatorSidebar) via src/pages/simulators/*.astro` **[rewrite]** — The 11 Astro pages wrap each simulator in the site Layout + Header + a SimulatorSidebar (React island, client:load) + MobilePhoneFrame, and mount the *SimulatorWithTour component as a React island. Host-shell wiring, not part of the feature core.
- `Host site theming (html.dark class) via useParentTheme + Tailwind dark: variants + tailwind.config` **[rewrite]** — Simulators read the site's dark-mode class and use Tailwind dark: utilities throughout. Needs a Tailwind setup and a dark-class toggler in the standalone app.
- `framer-motion, lucide-react, qrcode/bech32, class-variance-authority (npm)` **[copy-as-is]** — Animations, icons, key display. Standard npm deps already in package.json.

**Duplikacja / martwy kod:**
- LEGACY/SUPERSEDED: src/components/interactive/damus/ (DamusInteractiveSimulator.tsx + Interactions.tsx + index.ts) is an older standalone Damus mock that imports cn from `../../../lib/utils` (a DIFFERENT cn than src/utils/cn) and hardcodes its own MOCK_POSTS. Fully superseded by src/simulators/damus/ (DamusSimulator + DamusSimulatorWithTour, screen/component split, shared mock data). No page/mdx references it — dead code. DROP.
- AmethystSimulatorDemo.tsx in src/components/interactive/ is a tiny (~2KB) legacy demo superseded by src/simulators/amethyst/. Not referenced by the live amethyst.astro (which uses AmethystSimulatorWithTour). Dead. DROP.
- NostrSimulator.tsx (~29KB) and QuickstartSimulator.tsx (~37KB) in src/components/interactive/ are the ORIGINAL monolithic single-file simulators that predate the src/simulators/ framework. NostrSimulator is still imported by what-is-nostr.mdx in ~7 locales but EVERY usage is COMMENTED OUT (`{ /* <NostrSimulator client:load /> */ }`), so effectively inert. These are the v1 that src/simulators/ replaced. DROP / exclude from the extracted product.
- The `*SimulatorWithTour` vs base `*Simulator` pattern is NOT duplication — intentional layering: base XxxSimulator is the pure UI/state component, XxxSimulatorWithTour wraps it in TourWrapper and maps tour steps to simulator commands (see DamusSimulatorWithTour's stepCommands table). All 7 tour-enabled Astro pages import the WithTour variant; the base is the reusable primitive. Keep both. BUT coracle/gossip/nostr-kitten have NO WithTour wrapper (their pages import the base directly), so the pattern is applied inconsistently across the 9 clients.
- Each client re-implements its own NoteCard (damus/components/NoteCard, snort/components/NoteCard, coracle/components/NoteCard, primal/web/components/NoteCard) rather than using shared/components/NoteCard — deliberate per-client visual fidelity, not accidental dup, but it means the shared NoteCard is barely used and could be dropped or kept only as a reference.

**Plan wydzielenia (kolejność):**
1. 1. Scaffold a new Vite + React 19 + TypeScript SPA. Add Tailwind v3 (+ @tailwindcss/typography), clsx, tailwind-merge, framer-motion, lucide-react, qrcode, bech32 — mirror the relevant subset of package.json. Port the tailwind.config content globs and dark-mode 'class' setting.
2. 2. Copy src/simulators/ wholesale into the new repo. Copy its four external deps verbatim: src/data/mock/, src/components/tour/ (+ tour.css), src/data/tours/, src/utils/cn.ts. Keep the same relative import depth so `../../data/mock` / `../../../utils/cn` resolve unchanged (or add a tsconfig path alias and rewrite once).
3. 3. DELETE the legacy tree from scope: src/components/interactive/damus/, AmethystSimulatorDemo.tsx, NostrSimulator.tsx, QuickstartSimulator.tsx. Confirm nothing in the new SPA imports them (already dead / commented-out in source).
4. 4. Replace the Astro host shell with React Router: one route per client (/damus, /amethyst, /primal, /snort, /yakihonne, /coracle, /gossip, /keychat, /olas), each rendering MobilePhoneFrame (or web frame) + the client's *SimulatorWithTour (falling back to base for coracle/gossip/nostr-kitten). Port the landing grid from src/pages/simulators/index.astro into a React <SimulatorsIndex> using allSimulatorConfigs.
5. 5. Reimplement navigation: convert src/components/navigation/SimulatorSidebar (currently a client:load island) into a plain React sidebar; replace the Astro Layout/Header with a lightweight React app shell.
6. 6. Handle theming: keep useParentTheme but add the SPA's own dark-class toggler (a theme toggle that sets/removes `dark` on documentElement), since there is no parent Astro site.
7. 7. Normalize tour coverage: either add WithTour wrappers + tour configs for coracle/gossip/nostr-kitten or explicitly document them as no-tour, so all 9 clients behave consistently.
8. 8. Copy static assets referenced by configs (/icons/*.png client logos) and any avatar/image URLs used by mock data into the SPA's public/ dir.
9. 9. Verify each simulator renders and its tour runs; run a Tailwind purge/build; deploy as a static site (Vercel/Netlify/GitHub Pages).
10. 10. Optional cleanup: adopt or remove the underused SimulatorProvider store to reduce dead scaffolding; dedupe per-client NoteCards against shared/components/NoteCard where visual parity allows.

**Ryzyka techniczne:**
- Import-path fragility: the tree uses many deep relative imports (`../../../data/mock`, `../../../utils/cn`). If directory depth changes during extraction, dozens of imports break; mitigate by preserving structure or doing a single scripted alias migration (tsconfig paths + codemod).
- Bleeding-edge pins: React 19 + framer-motion@12 + @astrojs/react. A bare Vite/React setup must reproduce the exact React 19 runtime or risk subtle behavior differences (effect timing in useParentTheme / tour state machines).
- Tour engine coupling: tours drive simulator state through onStepChange->command mapping (per-client stepCommands tables). These are brittle, hand-maintained, and only cover 6-7 of 9 clients — extracting without exercising each tour risks shipping broken/omitted tours.
- The SimulatorProvider/useReducer store is largely unused (most clients hold local useState and read mock data directly), so it is dead-ish scaffolding that can mislead future contributors; decide early whether to adopt or remove it.
- Legacy confusion: two parallel 'cn' utils exist (src/utils/cn vs src/lib/utils) and multiple simulator generations (interactive/* vs simulators/*). Carrying the wrong one over, or leaving legacy files in, bloats the bundle and confuses the codebase — prune decisively in step 3.
- Static assets: configs reference /icons/*.png and mock data references local/external avatar and image URLs; these must be inventoried and copied or the app renders broken images.
- Dark-mode/theme: without a parent Astro site setting html.dark, useParentTheme observes a class nothing toggles unless a replacement theme switcher is added, so simulators could be stuck in light mode.
- Tailwind purge: many class names are composed dynamically via cn(); the standalone Tailwind content config must include the copied simulators/ paths or production builds strip needed utility classes.

## Produkt / pozycjonowanie / branding

**Teza produktu:** A standalone "try 10 Nostr clients in your browser, no install, no keys" sandbox — the interactive demo layer the Nostr onboarding funnel is missing. Every existing "get started" resource is either a static directory of app links (nostrapps.com, nostr.com/clients, nostr.co.uk) or a key-generation wizard (Nstart / start.njump.me); none let a curious newcomer actually feel what Damus/Amethyst/Primal/etc. are like before committing to an install and an irreversible keypair. This product sits one step earlier in the funnel than Nstart: it answers "which of these apps do I even want?" via guided, mock-data tours, then hands off to real installs and to Nstart for key creation. It serves newcomers deciding whether Nostr is for them, and it doubles as an embeddable demo widget that client teams and educators can drop into their own sites.

**Dlaczego symulatory zarezonowały (a przewodnik nie) — hipotezy:**
- Interactive 'try it now' beats prose: the parent guide asked people to read; the simulators let them DO, which is inherently more shareable and screenshot-able on a social protocol.
- Novelty/craft signal: hand-built pixel-accurate recreations of 10 real clients (plus the geocities-parody Nostr Kitten) read as impressive labor-of-love work that Nostr's builder-heavy audience zaps and boosts.
- It solves a pain the community complains about constantly — client fragmentation and choice paralysis for newcomers — in a single link, whereas a full 'beginner guide' feels generic and crowded.
- The Nostr Kitten parody injects humor/meme energy; funny original content travels far on Nostr where zaps reward wit, not just utility.
- Client-team ego/tribal loops: seeing your own app faithfully simulated is flattering; Damus/Primal/etc. supporters amplify a demo that features their app.
- A single feature is a crisp, legible artifact ('try clients here') vs. a sprawling multi-page guide that has no obvious one-line hook to boost.
- Lower perceived commitment: no signup, no key, no relay setup — the friction that kills guide readers is absent, so the share-through rate is higher.

**Docelowi użytkownicy:**
- Nostr-curious newcomers arriving from Bitcoin/X who want to feel the apps before installing anything or generating keys
- People experiencing client choice-paralysis who need a fast side-by-side 'which app fits me' experience
- Educators, podcasters, and Bitcoin/Nostr content creators who need a live demo to point audiences to
- Nostr client development teams who want an embeddable, zero-backend demo of their app for their own landing pages and app-store-alternative listings
- Conference/meetup presenters and onboarding volunteers (e.g. Nostr ambassadors) who demo the ecosystem live
- Journalists and researchers writing about Nostr who want to screenshot/experience clients without account creation

**Wyróżnik (wedge):** Everyone in the space does discovery (lists, screenshots) or account creation (Nstart). Nobody does experiential trial. The wedge is 'try-before-install': fully interactive, in-browser, mock-data recreations of real clients with guided tours, requiring zero keys, zero relays, zero signup — so a newcomer can compare the actual feel of 10 clients in five minutes and only then install and create keys. Secondary wedge: the same simulators are packaged as embeddable widgets, making the product infrastructure that other onboarding tools, client teams, and educators plug into rather than a single destination site.

**Konkurencja / krajobraz onboardingu Nostr:**
- **nostrapps.com** — The dominant app directory — 'Nostr the easy way.' Static cards linking out to each app's site/store. No in-browser trial; you leave to install. This is the incumbent to differentiate against.
- **nostr.com/clients** — Canonical clients list on the flagship nostr.com domain. Text descriptions + links only, no interactivity. High authority, low experience depth.
- **Nstart / start.njump.me** — The onboarding wizard (by dtonon, OpenSats-funded). Handles key creation, backup, bunker/Nostr Connect, auto-follow, and app hand-off. Complementary, not competitive — it starts AFTER the 'which client?' question the simulator answers. Best partnership target.
- **njump.me / nostr.now** — Nostr-to-web gateway and 'jump on board' entry point. Focused on content rendering and getting people onto the network, not on trying clients.
- **nostr.how** — Well-known text/tutorial 'Get started' and 'What are clients' guides. Educational prose, no interactive client demos. Same category the failed parent guide competed in.
- **nostr.co.uk/clients** — Clients directory with per-client pages (Iris, Nostur, etc.). Screenshots + filters by platform. Richer than a bare list but still static, install-required.
- **nostr.net (Awesome Nostr)** — Comprehensive dev-oriented resource index. Discovery for builders, not an experiential newcomer funnel.
- **nostrdesign.org** — Onboarding design patterns/reference for client builders. A design-guidance peer, not a consumer product — but useful signal that 'onboarding' is an active, unsolved space.
- **App-store-alternatives (Zapstore et al.)** — Decentralized app-store style discovery signed by dev keys. Distribution/install layer; still no try-before-install experience.

**Kierunki brandingu:**
- **TryNostr (trynostr.app / trynostr.com)** — Dead-literal, SEO-perfect, category-defining. Positions the product as THE place to try Nostr before you commit. Risk: generic and possibly contested naming; strongest if the domain is obtainable.
- **Nostr Playground / nplay** — 'A sandbox to play with every Nostr app before you install.' Emphasizes safe, no-consequence experimentation (mock data, no keys). Friendly, low-stakes, newcomer-warm.
- **Sandstr (Sandbox + Nostr)** — Original coined name that sidesteps trademark overlap. Positions as the 'Nostr sandbox / demo environment' — clean, brandable, memeable, no dependence on any client's marks.
- **Nostrich Test Flight / 'Before You Fly'** — Leans on the existing purple Nostrich mascot IP the team already owns. 'Take Nostr clients for a test flight before takeoff.' Retains brand equity from nostrich.love while repositioning around the one feature that worked.
- **Kitten Clients / built around Nostr Kitten** — Lead with the ORIGINAL, owned character (Nostr Kitten). A playful mascot-first brand where the simulator gallery is 'Kitten's tour of Nostr apps.' Maximizes owned-IP, minimizes reliance on other teams' brands, and carries the humor that drove the viral signal.

**Ryzyko znaku towarowego (KLUCZOWE):**

This is the central legal/ethical shift and must be handled deliberately. Inside a free, clearly-educational guide, faithfully reproducing Damus/Primal/Amethyst names, logos, and UIs has a reasonable nominative-fair-use and educational posture. As a STANDALONE, branded product — potentially monetized (zaps, sponsorship, embeds) — the same reproductions carry materially higher risk: (1) Trademark: client names and logos are trademarks regardless of the code being open source. GPL/MIT (Damus is GPL, Amethyst MIT) license the CODE, not the marks or trade dress; you have no license to their logos or 'look and feel.' (2) Impersonation/passing-off: a polished simulator that looks like the real app could confuse users into thinking it's official, or that the product is endorsed — especially once money is involved. (3) Brand dilution / reputational: bugs or stale UI in your mock could reflect badly on their brand, and teams may object to a third party monetizing their identity. Mitigations, in ascending order of safety: (a) Prominent, persistent 'SIMULATION — unofficial, not affiliated with X. Fan-made demo with mock data' labeling on every screen, plus a clear disclaimer and non-endorsement notice; use logos only nominatively and honor any takedown immediately. (b) Get explicit written permission / opt-in from each client team — turn it into a partnership so featured clients WANT to be in the gallery (this also becomes a sponsorship channel). Nostr's small, reachable builder community makes this realistic; some teams will happily embed 'their' simulator. (c) The safest pivot: lead with ORIGINAL/generic clients. Nostr Kitten already appears to be an original creation of this project (no external client of that name exists in the ecosystem searches), so it carries zero third-party trademark risk and can anchor the brand. Build one or two additional generic archetype clients ('a Twitter-style client', 'a photo client', 'a chat client') that teach the same UX patterns without any real mark, and treat real-branded simulators as strictly opt-in, permissioned inclusions. Recommendation: launch on owned/original + permissioned-only clients; never monetize a specific team's brand without their sign-off.

**Dystrybucja:**
- Launch natively on Nostr with a single shareable link + short demo GIF; seed to Nostr's builder/onboarding influencers and let zaps/boosts carry it (the same mechanism that gave the feature its original signal)
- Tag and DM the featured client teams for opt-in and amplification — a faithful demo of their app is flattering and they'll reshare to their followers
- Partner with Nstart/start.njump.me for a two-way handoff: simulator answers 'which client?', then deep-links into Nstart for key creation; propose a link back from Nstart's app-picker step
- Get listed ON the directories you differ from — a 'Try it live' entry on nostrapps.com, nostr.com/clients, nostr.co.uk, and Awesome Nostr (nostr.net)
- Ship an embeddable widget/iframe so client teams, nostr.how, educators, and bloggers drop live demos into their own pages — turns third parties into distribution
- Target Nostr/Bitcoin conferences, meetups, and the Nostr ambassador/onboarding-volunteer network as a live demo tool
- Lean on the Nostr Kitten meme as top-of-funnel humor content (short clips of the geocities parody) to pull attention that converts into the serious gallery
- SEO on 'try nostr', 'nostr clients compared', 'best nostr app for beginners' — an interactive page can outrank static lists on engagement signals

**Utrzymanie / finansowanie:**

Realistic, blended, and modest — this is a public-good utility, not a venture business. (1) OpenSats / The Nostr Fund grant: onboarding and education are explicitly funded categories (recent waves funded onboarding apps and an Education Initiative), and Nstart itself is OpenSats-backed — a permissioned, ecosystem-serving simulator gallery is a strong grant fit and likely the primary funding source. (2) Zaps / value-for-value: a Lightning zap button and nprofile; realistic as supplemental tips, not a salary, given Nostr's zap culture rewards exactly this kind of craft. (3) Client-team sponsorship: once inclusion is opt-in, offer featured/priority placement or 'sponsored by' slots to client teams and relay/wallet businesses — but keep it clearly non-corrupting of the neutral comparison. (4) Embed licensing: the embeddable-demo widget can be free for OSS/community and a small paid tier for commercial sites, though revenue here is speculative. Honest assessment: grants + zaps sustain a maintainer-scale project; the main ongoing cost is engineering upkeep as real clients evolve and simulators drift out of date, so budget maintenance into any grant. Do NOT bank on ads or paid consumer subscriptions — Nostr's audience and ethos reject both.

**Ryzyka produktowe:**
- Maintenance treadmill: 10 real clients ship UI changes constantly; simulators go stale fast and stale demos actively mislead newcomers and annoy the teams depicted
- Trademark/impersonation exposure escalates the moment the product is standalone and monetized (see trademark_risks) — the single biggest existential risk
- A client team could demand removal, forcing a scramble to pull or replace their simulator and denting credibility
- 'Fake app' perception: users may distrust or feel tricked by mock data, or conversely expect real functionality (posting, keys) the sandbox can't provide
- Narrow, one-shot value: trying clients is a do-once action, so retention is inherently low; the product is a funnel step, not a destination people return to — makes standalone metrics look weak
- Small TAM: Nostr's total newcomer inflow is modest; even winning the category is a small absolute audience
- Being leapfrogged: a well-funded incumbent (nostrapps.com, Nstart, or a client team) could add a 'live demo' tab and absorb the wedge, since the idea is easy to copy once proven
- Neutrality tension: taking client-team sponsorship undermines the trusted 'unbiased comparison' positioning that gives the gallery its value
- Solo-maintainer/bus-factor risk after grant funding lapses; abandonment leaves broken, brand-infringing demos live on the web

## Synteza — rekomendacje

**Liderzy do zbudowania produktu (ranking):**
- **Snort** (completeness 8 / fidelity 5 / polish 6 / standout 6) — The most feature-complete simulator (8/10 completeness) with the standout relay-management screen and the cleanest fully-tokenized CSS, making it the easiest to re-skin and the most convincing 'this is a real client' demo. Two fixable defects (inert theme toggle, cosmetic filter tabs) and a teal/dev-framing that needs recoloring to Snort's purple, but the bones are flagship-grade.
- **Amethyst** (completeness 7 / fidelity 5 / polish 6 / standout 6) — Broadest surface (9 screens) and the deepest MD3 theme in the set, with genuinely accurate domain data. The dead-drawer wiring bug orphans several screens but is a one-handler fix that instantly unlocks Video/Bookmarks/Relays/Security — highest ceiling per unit of effort. Add one signature feature (long-form or live) and it headlines.
- **Nostr Kitten** (completeness 3 / fidelity 5 / polish 5 / standout 7) — The strategic lead, not the most complete build. It is the ONLY original, trademark-safe, instantly-memorable artifact in the set (90s GeoCities parody) and is the correct top-of-funnel/mascot anchor that de-risks the whole product legally. Currently near-static (completeness 3) so it must be wired up — but its standout score (7) and zero legal risk make it the brand centerpiece.
- **YakiHonne** (completeness 7 / fidelity 3 / polish 7 / standout 6) — Highest polish (7) and the only end-to-end 'money loop' (a live wallet that zaps actually decrement) — the most differentiated interactive demo. Wrong brand color and no article reader hold it back, but the wallet is a genuine showcase piece worth leading a 'what makes Nostr different' narrative around.

**Do odłożenia / cut na start:**
- Gossip — DEFER/CUT: lowest polish (4) and fidelity (2) with multiple live data-shape bugs (broken thread view via note.author, always-zero counts) and fake keyboard shortcuts that actively lie to users. The real client's spartan egui identity is entirely absent. Too rough to ship without a near-rewrite; keep only its genuinely good relay module as a reference.
- Coracle — DEFER: lowest fidelity in the set (2). It is 'Coracle in name only' — wrong theme, wrong nav, wrong ethos, none of the WoT/custom-feed identity, plus an unapplied dark-mode toggle and a fake post loop. Reskinning it to the real dark/orange/left-sidebar power-user client is effectively a rebuild; not worth it for launch.
- Olas — DEFER: competent but reads as a generic Instagram clone with a real profile-field bug (.picture/.about vs .avatar/.bio) and Instagram-isms (Stories, Follow Requests) that don't exist in Nostr. Needs zaps/kind:20/relay-feed fidelity before it earns a slot.
- Primal — DEFER: broad two-variant build but brand-color chaos (42 hardcoded purples fighting an orange theme), a generic X-clone layout, dead mobile Settings, and none of Primal's real differentiators (Reads/Feeds/wallet screen). Fixable but not launch-priority.
- Damus — DEFER (do NOT cut): clean and well-architected but wrong tab bar (its most recognizable nav), half-baked dark mode, and missing Universe/DMs/Notifications/Purple. Promote in a later wave once the leads ship; the iOS theme is a strong reusable asset.
- Keychat — DEFER: conceptually the most faithful (correct value-prop copy and brand blue) but visually generic and shipped with 'Debug Version' console.log cruft; the signature ecash-in-chat mechanic is only described, never shown. Clean it up for a later wave.

**Cross-cutting polish backlog (dotyczy wielu symulatorów):**
- Add a persistent, unmissable 'SIMULATION — unofficial, mock data, not affiliated with [Client]' badge/disclaimer on every simulator frame. This is both the top legal mitigation and a trust/expectation-setter — do it before any public launch.
- Normalize the WithTour pattern across all clients: coracle/gossip/nostr-kitten have no tour wrapper, so behavior is inconsistent. Either add wrappers+configs or explicitly gate the tour affordance so every client behaves predictably.
- Kill remote-asset dependence: multiple sims hotlink Unsplash photos and DiceBear 'bottts' robot avatars that break offline/under strict CSP AND cheapen the 'real app' illusion. Bundle local, human-looking mock avatars and images repo-wide — this single change lifts perceived fidelity across Snort, Coracle, Gossip, Olas, YakiHonne.
- Fix the recurring dark-mode lie: several clients (Snort, Coracle, Keychat, Damus's NoteCard) present a Dark Mode toggle that doesn't actually re-theme. Either wire toggles to a root data-attribute/class or remove them — a non-functional theme switch reads as broken.
- Sweep the pervasive fake 280-char limit (Twitter-ism) across Damus/Amethyst/YakiHonne — Nostr has no cap. Reframe as a soft indicator; it's a conceptual fidelity error repeated everywhere.
- Purge dead code and debug cruft as a hygiene pass before extraction: unused ProfileHeader (Damus), dead Drawer wiring (Amethyst), dead mobile SettingsScreen (Primal), 'Debug Version' console.logs (Keychat), and the four legacy simulators (interactive/damus, AmethystSimulatorDemo, NostrSimulator, QuickstartSimulator).
- Thread the logged-in identity consistently: several sims hardcode Profile to Satoshi/'Your Name' regardless of who logged in, and discard composed posts. A shared 'current user + prepend-my-post' pattern via the underused SimulatorProvider store would make the core loop feel real everywhere.
- Build a consistent standalone app shell + landing/gallery grid + sidebar (replacing the Astro Layout/Header) with a real theme toggle, so all 10 sims live under one coherent, mobile-framed product chrome.
- De-fake the most-visible dead controls per client (search that filters, working like/repost/zap counters in Gossip/Nostr Kitten, real filter tabs in Snort) — dead affordances are the fastest way to erode the 'this is a real app' illusion.
- Add per-simulator honesty about scope: a small 'what's simulated vs. what the real app does' note, which doubles as educational content and as a fidelity-expectation manager.

**Ścieżka wydzielenia (skrót):** The feature is highly self-contained and cheap to extract — medium effort overall. Everything lives under src/simulators/ (~24.5K LOC) plus four cleanly-bounded support trees (data/mock ~3.8K LOC, components/tour, data/tours, utils/cn), all of which move copy-as-is. The only real coupling to rewrite is the thin Astro page-shell/sidebar layer and the host dark-mode class. There is no backend, network, auth, or real crypto — it's 100% static client-side React. Recommended target is a Vite + React 19 + TypeScript SPA with React Router and Tailwind v3 (Astro buys nothing here since every page is already a heavy client:load island; Next is overkill for a no-server, animation-heavy app). Estimate: 1-2 days to a working standalone skeleton, ~1 week to polish (rebuild sidebar/landing, normalize tours, prune 4 legacy sims, wire routing/deploy).

**Rekomendowany branding:** **[NIEAKTUALNE — patrz nota na górze + `CLAUDE.md`; owned-IP-first / Kitten-front-door odrzucone na rzecz real-clients-first + permissioned opt-in]** Lead with 'Sandstr' (or 'Nostr Playground') as the product wordmark, anchored visually by the owned Nostr Kitten mascot, and reserve 'try-before-install' as the tagline ('Try every Nostr app before you commit — no keys, no install'). Rationale: an original coined name plus an owned character is the only branding direction that survives the trademark analysis. TryNostr is SEO-perfect but generic/contestable; anything leaning on client marks is exactly what escalates risk. Handle the trademark issue in three deliberate layers: (1) launch on OWNED/original clients only — make Nostr Kitten the front door and build 1-2 additional generic archetypes ('a Twitter-style client', 'a photo client') that teach the same UX without any real mark; (2) treat every real-branded simulator (Damus/Primal/Amethyst/etc.) as strictly opt-in and permissioned — get written sign-off from each team, which conveniently doubles as an amplification and sponsorship channel in Nostr's small, reachable builder community; (3) put a persistent 'unofficial simulation, mock data, not affiliated' disclaimer on every screen, use logos only nominatively, and honor takedowns immediately. Never monetize a specific team's brand without their consent. This turns the legal risk into a partnership motion instead of an exposure.

**Kluczowe ryzyka:**
- Trademark / trade-dress / passing-off exposure is the #1 existential risk: reproducing real client names, logos, and look-and-feel is defensible inside a free educational guide but materially riskier as a standalone, potentially-monetized product. GPL/MIT license the code, not the marks. Mitygacja (AKTUALNA): **permissioned opt-in od zespołów jako ścieżka główna** + trwały disclaimer na każdym widoku (owned-IP-first odrzucone — patrz nota na górze).
- Maintenance treadmill: 10 real clients ship UI changes constantly; simulators drift stale fast, and a stale demo actively misleads newcomers and annoys the teams depicted. Budget ongoing engineering upkeep into any funding — this is the recurring cost that kills these projects.
- Inherently one-shot / low retention: 'try clients' is a do-once action. This is a funnel step, not a destination, so standalone engagement metrics will look weak by design — don't measure it like a retention product.
- Small TAM: Nostr's total newcomer inflow is modest; even winning the category is a small absolute audience, capping upside.
- Neutrality tension: client-team sponsorship (a natural revenue path) undermines the 'unbiased comparison' positioning that gives the gallery its value — keep sponsorship clearly firewalled from the comparison.
- Easily leapfrogged: the wedge is easy to copy once proven — nostrapps.com, Nstart, or a client team could add a 'live demo' tab and absorb it. First-mover + partnerships are the only moat.
- Fidelity/trust perception: the sims are loose (built by an LLM without vision) and several have live bugs; users may feel tricked by mock data or expect real functionality. Ship the honesty labeling and fix the visible bugs before launch.
- Solo-maintainer / bus-factor: after grant funding lapses, abandonment leaves broken, brand-infringing demos live on the web — a reputational and legal liability, not just a dead project.

**Roadmapa (fazowa):**
1. Phase 0 — Validate & decide (a few days, before writing extraction code): put up a simple landing page ('Try 10 Nostr clients in your browser — no keys, no install') with a waitlist/interest signal and seed it to a couple of Nostr onboarding voices. Confirm the pull is real and gauge how many client teams will opt in. Simultaneously get an informal read on the trademark posture. Gate the whole spin-off on this.
2. Phase 1 — Extraction spike (1-2 days): scaffold Vite + React 19 + TS + Tailwind v3 SPA; copy src/simulators/ + data/mock + components/tour + data/tours + utils/cn verbatim; delete the 4 legacy simulators; replace the Astro shell with React Router (one route per client) and a landing gallery from allSimulatorConfigs; add a real dark-mode toggle to replace the parent-site class. Goal: all 10 sims render and run standalone.
3. Phase 2 — Lead polish + honesty layer (~1 week): focus polish ONLY on the ranked leads (Snort, Amethyst, Nostr Kitten, YakiHonne). Fix their live bugs (Amethyst drawer wiring, Snort theme toggle, YakiHonne re-skin, wire up Nostr Kitten interactions), bundle local avatars/images to kill remote-asset breakage, and add the persistent 'SIMULATION — unofficial, mock data' badge to every frame. Normalize tour coverage across the leads.
4. Phase 3 — Brand + permission motion (parallel with Phase 2): finalize the Sandstr/Playground + Nostr Kitten brand, build 1-2 original generic-archetype clients as the trademark-safe front door, and DM/tag each real client team for written opt-in and amplification. Only ship a real-branded sim once its team signs off.
5. Phase 4 — Soft launch on Nostr: publish a single shareable link + demo GIF, lead with the Nostr Kitten humor as top-of-funnel, and seed to builder/onboarding influencers. Propose the two-way Nstart handoff ('which client?' → key creation) and request 'Try it live' listings on nostrapps.com / nostr.com/clients / Awesome Nostr.
6. Phase 5 — Sustain & expand: apply for an OpenSats / Nostr Fund grant (onboarding+education is explicitly funded) with maintenance explicitly budgeted; add a Lightning zap button. Ship the embeddable widget/iframe so client teams and educators become distribution. Promote the deferred sims (Damus, Primal, Keychat, Olas, Coracle, Gossip) into the gallery one at a time as they're polished and permissioned.

---

_Wygenerowano z surowego wyniku wieloagentowego audytu (13 agentów). Oceny są opiniami modeli skalibrowanymi wiedzą o realnych klientach + web search; traktuj jako punkt startowy, nie wyrocznię._
