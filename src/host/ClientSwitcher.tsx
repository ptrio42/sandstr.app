import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMatch, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, LayoutGrid, Search } from 'lucide-react';
import { clients, getClient, type ClientEntry } from '../registry';
import { ClientGlyph, platformLabel } from './ClientGlyph';
import CommandPalette from './CommandPalette';
import { useMediaQuery, MOBILE_QUERY } from './useMediaQuery';
import { cn } from '../utils/cn';

/* ------------------------------- hooks ---------------------------------- */

/** True while a guided tour overlay is mounted (portaled to <body> as .tour-overlay). */
function useTourActive(): boolean {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const check = () => setActive(!!document.querySelector('.tour-overlay'));
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);
  return active;
}

function isEditableTarget(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName;
  return node.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function idleWarm(fn: () => void): () => void {
  const w = window as typeof window & {
    requestIdleCallback?: (cb: () => void) => number;
    cancelIdleCallback?: (h: number) => void;
  };
  if (w.requestIdleCallback) {
    const h = w.requestIdleCallback(fn);
    return () => w.cancelIdleCallback?.(h);
  }
  const t = window.setTimeout(fn, 400);
  return () => clearTimeout(t);
}

/* ------------------------------- chip ----------------------------------- */

type Orientation = 'horizontal' | 'vertical';

/**
 * How long the "you are now in X" pill stays up, in ms.
 *
 * Long enough to read at a glance, short enough to be gone before the next tap
 * on a control people press repeatedly. 1.8s rather than 1.4s because the
 * mount itself eats the first ~1.2s of it: the pill is up while the incoming
 * client's chunk loads and its first screen paints, and it should still be
 * legible for a beat AFTER that, not expire on arrival.
 */
const LANDED_MS = 1800;

interface ChipProps {
  client: ClientEntry;
  active: boolean;
  reduce: boolean;
  orientation: Orientation;
  onSelect: () => void;
}

function DockChip({ client, active, reduce, orientation, onSelect }: ChipProps) {
  const warm = () => client.preload();
  const vertical = orientation === 'vertical';
  const hover = vertical ? { x: 6, scale: 1.12 } : { y: -6, scale: 1.12 };
  return (
    <motion.button
      type="button"
      data-chip
      aria-label={`${client.name} — ${platformLabel(client.platform)}${client.hasTour ? ', guided tour' : ''}`}
      aria-current={active ? 'page' : undefined}
      tabIndex={active ? 0 : -1}
      onClick={onSelect}
      onPointerEnter={warm}
      onFocus={warm}
      whileHover={reduce ? undefined : hover}
      whileTap={reduce ? undefined : { scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className="group relative flex h-11 w-11 items-center justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
      style={{ ['--tw-ring-color' as string]: client.primaryColor }}
    >
      {active && (
        <motion.span
          layoutId="switcher-active"
          className="absolute inset-0 rounded-xl"
          style={{
            backgroundColor: `${client.primaryColor}22`,
            boxShadow: `0 0 0 1.5px ${client.primaryColor}, 0 6px 18px -4px ${client.primaryColor}80`,
          }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 34 }}
        />
      )}
      <ClientGlyph client={client} className="relative h-7 w-7" />
      {client.lead && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-gray-900"
        />
      )}
      {/* tooltip — above for the horizontal dock, to the right for the vertical rail */}
      <span
        className={cn(
          'pointer-events-none absolute z-10 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-gray-700',
          vertical ? 'left-full top-1/2 ml-2.5 -translate-y-1/2' : '-top-9 left-1/2 -translate-x-1/2',
        )}
      >
        {client.name}
      </span>
    </motion.button>
  );
}

/* ------------------------------ dock ------------------------------------ */

export default function ClientSwitcher() {
  const match = useMatch('/c/:id');
  const id = match?.params.id;
  const active = getClient(id);
  // An archived snapshot highlights its LIVING sibling: the rail lists only
  // `clients`, so matching on the raw route id would highlight no chip and
  // [ / ] would cycle from findIndex -1 (dead keys) — the nostr-kitten
  // accident, inherited by every archived route without this.
  const railId = active?.archivedOf ?? id;
  const navigate = useNavigate();
  const reduce = !!useReducedMotion();
  const tourActive = useTourActive();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (cid: string) => {
      setPaletteOpen(false);
      setSheetOpen(false);
      if (cid !== id) navigate(`/c/${cid}`);
    },
    [id, navigate],
  );

  /**
   * The client `dir` steps away — SKIPPING anything that cannot render here.
   *
   * At phone width a frameless client renders `DesktopClientGate` instead of
   * the client ("Primal is a desktop client — open this on a laptop"). That is
   * the right screen when you picked Primal by name, and a wall when you are
   * just walking the shelf: the registry order is damus, amethyst, **primal,
   * snort**, yakihonne, **coracle**, wisp, nostur, so stepping through it on a
   * phone hits three gates in a row.
   *
   * So stepping skips them and the sheet and the palette do not: an explicit
   * choice deserves the explanation, a casual next does not.
   *
   * The walk starts from the position in the FULL list rather than filtering
   * first, so the arrows still work while you are standing ON a gate — which is
   * exactly where you most want to leave.
   */
  const neighbour = useCallback(
    (dir: 1 | -1): ClientEntry | undefined => {
      if (!railId) return undefined;
      const from = clients.findIndex((c) => c.id === railId);
      if (from < 0) return undefined;
      const n = clients.length;
      for (let k = 1; k <= n; k++) {
        const cand = clients[(((from + dir * k) % n) + n) % n];
        if (!isMobile || cand.frame) return cand;
      }
      return undefined;
    },
    [railId, isMobile],
  );

  /**
   * "You are now in X", for one beat, after a prev/next step.
   *
   * Stepping is the only way into a client that never names where it is
   * sending you: the sheet and the palette are both a labelled tile you tapped
   * on purpose. Nothing else fills the gap at phone width either — the compact
   * bar's 14px title is the only label on screen, it sits in a corner, and it
   * does not move when it changes, so a fast walk through the shelf leaves you
   * guessing which app you are looking at.
   *
   * Phone only. Above `sm` the meta row and the context panel both restate the
   * client and the rail moves its highlight, so there it would be our chrome on
   * somebody's app for nothing.
   */
  const [landed, setLanded] = useState<{ client: ClientEntry; nonce: number } | null>(null);

  const step = useCallback(
    (dir: 1 | -1) => {
      const next = neighbour(dir);
      if (!next || next.id === id) return;
      stepped.current = true;
      go(next.id);
    },
    [neighbour, go, id],
  );

  /**
   * ON ARRIVAL, not on the tap — and this is measured, not a preference.
   *
   * Announcing at the tap cannot work: the frames between the tap and the new
   * client appearing are frames the main thread spends loading that client's
   * lazy chunk and mounting it, so nothing new rasterises. Filmed at 30fps the
   * pill first reached the screen 1000-1400ms after the tap however it was
   * scheduled — including with flushSync, which commits synchronously but
   * cannot conjure a paint out of a blocked thread. All that bought was a pill
   * that spent most of its life invisible and expired shortly after becoming
   * visible.
   *
   * So the pill says "you are HERE" rather than "you are going there". It costs
   * nothing — during the transition the old client is still on screen and the
   * question does not arise yet — and it means the full LANDED_MS is on screen.
   */
  const stepped = useRef(false);
  const nonce = useRef(0);
  useEffect(() => {
    if (!stepped.current) return;
    stepped.current = false;
    if (!isMobile || !active) return;
    nonce.current += 1;
    setLanded({ client: active, nonce: nonce.current });
  }, [railId, active, isMobile]);

  // Unmount when the animation below has finished fading it out, so the two
  // never disagree. Keyed by `nonce`, so a second step restarts both.
  useEffect(() => {
    if (!landed) return;
    const t = window.setTimeout(() => setLanded(null), LANDED_MS);
    return () => window.clearTimeout(t);
  }, [landed]);

  // The bottom sheet is a mobile-only surface; close it if we grow to desktop.
  useEffect(() => {
    if (!isMobile) setSheetOpen(false);
  }, [isMobile]);

  // Warm the neighbours casual next/prev will actually reach, so it is instant.
  // Via `neighbour`, not raw indices: at phone width the raw ±1 is a client the
  // arrows now skip, so the old version warmed the two chunks that never get
  // mounted and none of the two that do.
  useEffect(() => {
    if (!railId) return;
    return idleWarm(() => {
      neighbour(1)?.preload();
      neighbour(-1)?.preload();
    });
  }, [railId, neighbour]);

  // On phones the sim is full-bleed, so the switcher has no floating pill to
  // tap — ClientView's compact bar fires this instead. Mirrors the existing
  // `start-${id}-tour` idiom so the two host surfaces stay decoupled.
  useEffect(() => {
    const open = () => setSheetOpen(true);
    window.addEventListener('sandstr-open-switcher', open);
    return () => window.removeEventListener('sandstr-open-switcher', open);
  }, []);

  // Same idiom for the phone's prev/next arrows. They must NOT own the
  // definition of "next": the wrap-around, the archived-snapshot redirect via
  // `railId`, and the neighbour preloading all live in `step`, and a second
  // copy in ClientView would drift from this one the first time any of the
  // three changes.
  useEffect(() => {
    const onStep = (e: Event) =>
      step((e as CustomEvent<number>).detail < 0 ? -1 : 1);
    window.addEventListener('sandstr-step-client', onStep);
    return () => window.removeEventListener('sandstr-step-client', onStep);
  }, [step]);

  // Global shortcuts: ⌘/Ctrl-K opens the palette, [ / ] cycle prev/next.
  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => {
      // Escape is dismissal, and it belongs to the TOPMOST surface — so it is
      // settled before every guard below, including `tourActive`. Two bugs lived
      // in the old order: the whole listener was dead during a tour, so Escape
      // under an open sheet ended the TOUR and left the sheet standing; and the
      // sheet closed even when the palette (which it launches, and which sits
      // above it) was the thing on top, so one keypress dismissed both.
      if (e.key === 'Escape') {
        if (paletteOpen || !sheetOpen) return; // the palette dismisses itself
        setSheetOpen(false);
        return;
      }
      if (tourActive) return;
      // A host modal owned by another component (the FAQ panel and the About
      // sheet portal in with data-sandstr-modal) gets the keyboard to itself —
      // same contract as paletteOpen/sheetOpen below, probed via DOM because
      // those dialogs live in ClientView. Keeps ] from switching clients (and
      // ⌘K from stacking the palette) under an open dialog.
      //
      // Our own palette and sheet carry the attribute too, and their state is
      // right here — so exempt them and let the probe answer only for dialogs
      // somebody else owns. Without that, ⌘K would stop being a toggle the
      // instant it opened the thing it toggles.
      if (!paletteOpen && !sheetOpen && document.querySelector('[data-sandstr-modal]')) return;
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (paletteOpen || sheetOpen) return;
      if (isEditableTarget(e.target)) return;
      if (e.key === ']') {
        e.preventDefault();
        step(1);
      } else if (e.key === '[') {
        e.preventDefault();
        step(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, tourActive, paletteOpen, sheetOpen, step]);

  // Roving-tabindex arrow navigation across the dock chips (both orientations).
  const onToolbarKeyDown = (e: React.KeyboardEvent) => {
    const fwd = ['ArrowRight', 'ArrowDown'];
    const back = ['ArrowLeft', 'ArrowUp'];
    if (![...fwd, ...back, 'Home', 'End'].includes(e.key)) return;
    const chips = Array.from(toolbarRef.current?.querySelectorAll<HTMLButtonElement>('[data-chip]') ?? []);
    if (chips.length === 0) return;
    const cur = chips.findIndex((c) => c === document.activeElement);
    let next = cur < 0 ? 0 : cur;
    if (fwd.includes(e.key)) next = (cur + 1) % chips.length;
    else if (back.includes(e.key)) next = (cur - 1 + chips.length) % chips.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = chips.length - 1;
    e.preventDefault();
    chips[next]?.focus();
  };

  if (!id || !active) return null;

  const leads = clients.filter((c) => c.lead);
  const rest = clients.filter((c) => !c.lead);
  const dimmed = tourActive;
  // One desktop orientation for every client: a rail in the left gutter, which
  // on this layout is empty anyway. The old bottom dock (web sims) was
  // viewport-fixed and measured 29–58px of overlap onto the card's lower edge —
  // document padding could never move it off.
  const vertical = true;
  const orientation: Orientation = vertical ? 'vertical' : 'horizontal';
  const divider = (
    <span
      className={cn('shrink-0 bg-gray-200/80 dark:bg-gray-700/80', vertical ? 'my-0.5 h-px w-6' : 'mx-0.5 h-6 w-px')}
    />
  );
  // Dim + disable the whole switcher while a tour overlay is up. The opacity goes
  // on the OUTER plain div as an INLINE style (framer owns the inner element's
  // inline opacity for the entrance; a class there loses to it).
  const dimClass = cn(dimmed && 'pointer-events-none');
  const dimStyle = { opacity: dimmed ? 0.4 : 1 };

  return (
    <>
      {/* Announce switches to assistive tech. Archived snapshots carry the same
          brand name as their living sibling, so the version label is the only
          thing keeping the two announcements distinct. */}
      <div className="sr-only" aria-live="polite">
        Now viewing {active.name}
        {active.archivedOf && active.reproduces ? ` ${active.reproduces} (older version)` : ''} simulator
      </div>

      {isMobile ? (
        /* ---------- mobile: no floating chrome at all ----------
           The sim is full-bleed here, so anything floating sits ON the client's
           own tab bar (the old pill measured a 50px band of overlap and clipped
           Damus's compose FAB). ClientView's compact bar owns the trigger and
           fires `sandstr-open-switcher`; the bottom sheet below is the surface. */
        null
      ) : (
        /* ---------- desktop: a rail in the empty left gutter ---------- */
        <div
          className={cn('fixed left-3 top-1/2 z-[var(--z-host-rail)] -translate-y-1/2', dimClass)}
          style={dimStyle}
        >
          <motion.nav
            ref={toolbarRef}
            role="toolbar"
            aria-label="Switch client simulator"
            aria-orientation={vertical ? 'vertical' : 'horizontal'}
            onKeyDown={onToolbarKeyDown}
            initial={reduce ? false : vertical ? { x: -20, opacity: 0 } : { y: 24, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className={cn(
              'flex gap-1 border border-white/60 bg-white/70 shadow-[0_8px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/70',
              vertical ? 'flex-col items-center rounded-[20px] p-1.5' : 'items-center rounded-2xl p-1.5',
              // The rail is 611px tall with all ten chips. Overflow is scoped to
              // short windows on purpose: each chip's hover tooltip is an
              // absolutely-positioned child at `left-full`, so ANY overflow value
              // other than visible turns this into a clipper (measured
              // scrollWidth 141 vs clientWidth 56 — clipped tooltips plus a stray
              // horizontal scrollbar). Above 660px tall nothing overflows and the
              // tooltips stay free; below it, four controls were landing off
              // screen with nothing to scroll, so a clipped tooltip is the lesser
              // evil.
              '[@media(max-height:660px)]:max-h-[calc(100vh-1.5rem)]',
              '[@media(max-height:660px)]:overflow-y-auto',
              '[@media(max-height:660px)]:overscroll-contain',
            )}
          >
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label="All clients"
              className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-500 outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              <LayoutGrid className="h-5 w-5" />
              <span
                className={cn(
                  'pointer-events-none absolute z-10 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-gray-700',
                  vertical ? 'left-full top-1/2 ml-2.5 -translate-y-1/2' : '-top-9 left-1/2 -translate-x-1/2',
                )}
              >
                All clients
              </span>
            </button>

            {divider}

            {leads.map((c) => (
              <DockChip key={c.id} client={c} active={c.id === railId} reduce={reduce} orientation={orientation} onSelect={() => go(c.id)} />
            ))}
            {leads.length > 0 && rest.length > 0 && divider}
            {rest.map((c) => (
              <DockChip key={c.id} client={c} active={c.id === railId} reduce={reduce} orientation={orientation} onSelect={() => go(c.id)} />
            ))}

            {divider}

            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Search clients (Command K)"
              className={cn(
                'group relative flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl text-gray-500 outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                vertical ? 'w-11' : 'px-2.5',
              )}
            >
              <Search className="h-4 w-4" />
              {!vertical && (
                <kbd className="rounded border border-gray-300 px-1 text-[10px] font-medium leading-tight text-gray-400 dark:border-gray-600">
                  ⌘K
                </kbd>
              )}
              {vertical && (
                <span className="pointer-events-none absolute left-full top-1/2 z-10 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-gray-700">
                  Search ⌘K
                </span>
              )}
            </button>
          </motion.nav>
        </div>
      )}

      {/* "you are now in X" — conditional mount, same as the sheet below. The
          fade-OUT is a keyframe inside `animate` rather than an exit prop:
          AnimatePresence does not unmount reliably in this tree, so the
          animation ends at zero opacity exactly when the timer unmounts it. */}
      {createPortal(
        landed ? (
          <motion.div
            key={landed.nonce}
            // Rail band: over the simulator's own sandbox (~2000, see
            // gossip.theme.css) and UNDER the disclaimer, which nothing covers.
            // Order lives in :root in src/index.css.
            className="pointer-events-none fixed inset-x-0 top-1/2 z-[var(--z-host-rail)] flex -translate-y-1/2 justify-center sm:hidden"
            initial={{ opacity: 0 }}
            animate={reduce ? { opacity: [0, 1, 1, 0] } : { opacity: [0, 1, 1, 0], scale: [0.94, 1, 1, 1] }}
            transition={{ duration: LANDED_MS / 1000, times: [0, 0.12, 0.74, 1], ease: 'easeOut' }}
          >
            <span
              role="status"
              aria-live="polite"
              // Solid, and ringed in the CLIENT'S OWN colour. The first version
              // was a translucent dark pill with a plain shadow, which is
              // invisible for most of this shelf: six of the eight clients
              // default to a near-black feed, so dark-on-dark read only in the
              // one frame that happened to land on a bright image. A solid body
              // separates it from a light theme (YakiHonne), the coloured ring
              // separates it from a dark one, and the two never fail together.
              style={{ boxShadow: `0 0 0 2px ${landed.client.primaryColor}, 0 18px 50px rgba(0,0,0,0.55)` }}
              className="flex items-center gap-3 rounded-2xl bg-gray-950 px-5 py-4 text-white"
            >
              <ClientGlyph client={landed.client} className="h-11 w-11" />
              <span className="text-xl font-semibold leading-none">{landed.client.name}</span>
            </span>
          </motion.div>
        ) : null,
        document.body,
      )}

      {/* mobile bottom sheet — conditional mount (no AnimatePresence) */}
      {createPortal(
        sheetOpen ? (
            <motion.div
              className="fixed inset-0 z-[var(--z-host-modal)] sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm" onClick={() => setSheetOpen(false)} />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Switch client simulator"
                // See HOST_MODAL_SELECTOR in components/tour/TourOverlay.tsx.
                // The Escape branch above deliberately runs BEFORE this file's
                // own foreign-modal guard, because this sheet carries the
                // attribute too and would otherwise refuse to close itself.
                data-sandstr-modal=""
                initial={reduce ? { opacity: 0 } : { y: '100%' }}
                animate={reduce ? { opacity: 1 } : { y: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-gray-200 bg-white p-4 pb-8 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
                style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
              >
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Switch client</h2>
                  <button
                    type="button"
                    onClick={() => setPaletteOpen(true)}
                    className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 dark:bg-gray-800"
                  >
                    <Search className="h-3.5 w-3.5" /> Search
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {clients.map((c) => {
                    const isActive = c.id === railId;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => go(c.id)}
                        onPointerEnter={() => c.preload()}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'flex flex-col items-center gap-1.5 rounded-2xl p-2 transition-colors',
                          isActive ? 'bg-gray-100 dark:bg-gray-800' : 'active:bg-gray-50 dark:active:bg-gray-800/50',
                        )}
                        style={isActive ? { boxShadow: `inset 0 0 0 1.5px ${c.primaryColor}` } : undefined}
                      >
                        <ClientGlyph client={c} className="h-11 w-11" />
                        <span className="w-full truncate text-center text-[11px] font-medium text-gray-700 dark:text-gray-300">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
        ) : null,
        document.body,
      )}

      <CommandPalette
        open={paletteOpen}
        currentId={railId}
        onClose={() => setPaletteOpen(false)}
        onSelect={(cid) => go(cid)}
      />
    </>
  );
}
