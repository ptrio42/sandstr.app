import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ExternalLink, Flag, Info, Monitor, Moon, Play, Sun } from 'lucide-react';
import MobilePhoneFrame from '../simulators/shared/components/MobilePhoneFrame';
import { ClientGlyph, platformLabel } from './ClientGlyph';
import { clients, getClient, type ClientEntry } from '../registry';
import { useMediaQuery, MOBILE_QUERY } from './useMediaQuery';
import { useTheme } from './useTheme';
import { fidelityReportUrl } from './contribute';
import { cn } from '../utils/cn';

function Disclaimer({ name, real }: { name: string; real: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
      <Info className="h-3.5 w-3.5" />
      <span>
        <strong>Simulation</strong> · mock data ·{' '}
        {real ? `unofficial, not affiliated with ${name}` : 'original demo client'}
      </span>
    </div>
  );
}

/**
 * The phone-width form of the mandated banner. It sits above the tour's
 * 9999/10001/10002 band so the one legal mitigation CLAUDE.md calls
 * non-negotiable stays legible even while a tour backdrop is up.
 * NO `truncate` here, ever: at 320px (the most common narrow-Android width)
 * it cut the text to "…not affiliated wit…" — on phones this strip is the
 * only thing distinguishing the page from the real client, so it wraps to a
 * second line instead of losing words.
 */
function DisclaimerStrip({ name, real }: { name: string; real: boolean }) {
  return (
    <div className="relative z-[10003] flex shrink-0 items-center justify-center gap-1.5 border-b border-amber-300/60 bg-amber-50 px-3 py-1 text-[11px] leading-snug text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300">
      <Info className="h-3 w-3 shrink-0" />
      <span className="text-center">
        <strong>SIMULATION</strong> · mock data ·{' '}
        {real ? `unofficial, not affiliated with ${name}` : 'original demo client'}
      </span>
    </div>
  );
}

/** Brand-tinted skeleton for the rare cold path (a fresh deep-link that hasn't been preloaded). */
function SimSkeleton({ color }: { color: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: `${color}0a` }}>
      <div
        className="h-10 w-10 animate-pulse rounded-2xl"
        style={{ backgroundColor: `${color}33`, boxShadow: `0 0 0 6px ${color}14` }}
      />
    </div>
  );
}

/**
 * Desktop-only context lane. The gutter beside a 9:19.5 device is ~77% of a
 * 1440px viewport — roughly four times the area of the phone itself. Furnishing
 * it is also what finally gives the description and `features` a home: the
 * former lived only in a `title=` tooltip, the latter existed on ClientEntry and
 * was rendered nowhere.
 */
function ContextPanel({ entry, real }: { entry: ClientEntry; real: boolean }) {
  return (
    <aside className="hidden h-full w-[290px] shrink-0 flex-col justify-center gap-5 py-2 lg:flex">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <ClientGlyph client={entry} className="h-7 w-7" />
          <h1 className="text-lg font-semibold leading-none">{entry.name}</h1>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {platformLabel(entry.platform)}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{entry.description}</p>
      </div>

      {entry.features.length > 0 && (
        <div>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            What to try
          </h2>
          <ul className="flex flex-wrap gap-1.5">
            {entry.features.slice(0, 8).map((f) => (
              <li
                key={f}
                className="rounded-md bg-gray-100 px-2 py-1 text-[11px] capitalize text-gray-600 dark:bg-gray-800/80 dark:text-gray-300"
              >
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {entry.hasTour && (
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(`start-${entry.id}-tour`))}
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary-300 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-500/40 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/20"
        >
          <Play className="h-3.5 w-3.5" /> Take a tour
        </button>
      )}

      <Disclaimer name={entry.name} real={real} />

      {real && (
        <div className="space-y-2">
          <Handoff entry={entry} />
          <ReportLink entry={entry} />
        </div>
      )}
    </aside>
  );
}

/**
 * The way out. A reproduction with no exit is a copy; one that hands you off is
 * a signpost — which is both the product's actual purpose ("try it, then go get
 * the real thing") and the cheapest trademark mitigation there is. Rendered at
 * every breakpoint: inline in the ContextPanel at lg+, in the meta row below
 * that, and in the mobile About sheet. URLs verified per-project — see the
 * caveats above MOUNTS in registry.tsx.
 */
/**
 * Phone-width "About this reproduction": the description, the honest status
 * note, and the handoff. On a phone the sim is full-bleed and both the
 * ContextPanel and the meta row are hidden, so without this the visitor has no
 * way to learn who made the real client or where to get it. z-index sits above
 * the tour band (9999/10001/10002) like the disclaimer strip.
 */
function AboutSheet({ entry, real, onClose }: { entry: ClientEntry; real: boolean; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[10004] flex items-end sm:hidden" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative w-full rounded-t-2xl bg-white p-5 pb-8 shadow-2xl dark:bg-gray-900">
        <div className="mb-3 flex items-center gap-2">
          <ClientGlyph client={entry} className="h-7 w-7" />
          <h2 className="text-base font-semibold">{entry.name}</h2>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {platformLabel(entry.platform)}
          </span>
        </div>
        <p className="mb-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{entry.description}</p>
        {entry.statusNote && (
          <p className="mb-3 text-xs italic leading-relaxed text-gray-400 dark:text-gray-500">
            Early preview — {entry.statusNote}
          </p>
        )}
        {real && (
          <div className="space-y-2">
            <Handoff entry={entry} />
            <ReportLink entry={entry} />
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-gray-100 py-2.5 text-sm font-medium dark:bg-gray-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Handoff({ entry, compact }: { entry: ClientEntry; compact?: boolean }) {
  const target = entry.homepage ?? entry.repo;
  return (
    <div className={compact ? 'contents' : 'space-y-2'}>
      <a
        href={target}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
      >
        Get the real {entry.name} <ExternalLink className="h-3 w-3" />
      </a>
      {!compact && (
        <p className="text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
          {entry.installNote}. Made by the {entry.name} team ({entry.upstreamLicense}) — this
          reproduction is not their software.
        </p>
      )}
    </div>
  );
}

/**
 * The crowdsourcing hook, and deliberately the quietest thing on the surface —
 * it must never compete with the mandated disclaimer or the handoff.
 *
 * It sits ON the client view rather than on a contribute page because that is
 * where the qualified reviewer already is: someone who opened /c/damus and
 * actually uses Damus can price a wrong action-row order in two seconds, and
 * fidelity to the real app is the entire product claim. Unlike a capture, this
 * contribution carries no privacy load — they're describing our reproduction,
 * not uploading their account. Real clients only: "fidelity" is meaningless for
 * Nostr Kitten, which isn't a reproduction of anything.
 */
function ReportLink({ entry }: { entry: ClientEntry }) {
  return (
    <a
      href={fidelityReportUrl(entry)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-fit items-center gap-1.5 text-[11px] text-gray-400 transition-colors hover:text-gray-600 hover:underline dark:text-gray-500 dark:hover:text-gray-300"
    >
      <Flag className="h-3 w-3 shrink-0" /> Spotted something off?
    </a>
  );
}

/**
 * Phone-width answer for the five frameless clients. Their own CSS keys off the
 * viewport, not the container: below 768px Snort and Gossip `display: none` the
 * aside that is their only navigation, and Primal resolves to a 244px nav beside
 * a 112px feed. Shipping that would damage the "faithful reproduction IS the
 * product" claim on the surface where most first visits land, so we say so
 * plainly and point at the clients that do work here.
 */
function DesktopClientGate({ entry }: { entry: ClientEntry }) {
  // Ready reproductions only. The gate's whole argument is "we'd rather send
  // you elsewhere than show you a broken app" — recommending the unverified
  // previews from that same screen would undercut it in one row.
  const mobileClients = clients.filter((c) => c.frame && c.status === 'ready');
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
      <ClientGlyph client={entry} className="h-14 w-14" />
      <div>
        <h1 className="mb-1.5 text-lg font-semibold">{entry.name} is a desktop client</h1>
        <p className="mx-auto max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Its real interface is built for a wide screen — three columns, a persistent sidebar. We'd
          rather send you to a wider screen than show you a broken version of someone else's app.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        <Monitor className="h-4 w-4 shrink-0" />
        Open this page on a laptop or tablet
      </div>

      <div className="w-full max-w-xs">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Built for a phone — try these now
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {mobileClients.map((c) => (
            <Link
              key={c.id}
              to={`/c/${c.id}`}
              onPointerDown={() => c.preload()}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <ClientGlyph client={c} className="h-4 w-4" />
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <Link to="/" className="text-xs text-gray-400 hover:underline">
        ← All clients
      </Link>
    </div>
  );
}

export default function ClientView() {
  const { id } = useParams<{ id: string }>();
  const entry = getClient(id);
  const reduce = useReducedMotion();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [aboutOpen, setAboutOpen] = useState(false);
  // The global header is hidden on this route at phone widths, so the bar below
  // has to carry the theme switch or it becomes unreachable here.
  const { dark, toggle } = useTheme();

  // Open each client in ITS real shipping default (Damus/Amethyst OLED dark,
  // Primal Midnight, YakiHonne light — docs/refs/*/screen-map.md). Fidelity is
  // the product, and on a light-mode OS the three strongest reproductions
  // opened in a theme the real app never defaults to. An explicit choice on the
  // host toggle (persisted as sandstr-theme) always wins; we never write that
  // key here, so auto-switching stops the moment the visitor picks a side.
  // The switcher can change client while the sheet is open — it describes a
  // specific reproduction, so it must not survive into the next one.
  useEffect(() => setAboutOpen(false), [id]);

  const clientTheme = entry?.defaultTheme;
  useEffect(() => {
    if (!clientTheme) return;
    if (localStorage.getItem('sandstr-theme')) return;
    document.documentElement.classList.toggle('dark', clientTheme === 'dark');
  }, [clientTheme]);

  // Keep client routes out of search indexes (robots.txt Disallow: /c/ is the
  // main lever; this covers crawlers that render JS anyway). A pixel-faithful
  // /c/damus ranking for "Damus" is the textbook confusion pattern, and that
  // ranking is worth nothing to us — the gallery is the page that should rank.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  if (!entry) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="mb-4 text-lg text-gray-600 dark:text-gray-400">No simulator called “{id}”.</p>
        <Link to="/" className="text-primary-600 hover:underline">
          ← Back to all clients
        </Link>
      </main>
    );
  }

  const { Component, frame, className, primaryColor } = entry;
  // Nostr Kitten is the only original (non-real) client in the set.
  const isReal = entry.id !== 'nostr-kitten';
  // Frameless clients are desktop web apps; at phone widths we gate instead of
  // mounting a sim whose own media queries have deleted its navigation.
  const gated = isMobile && !frame;

  // The mounted simulator cross-fades in place on every switch; the frame/card
  // chrome around it stays put so it reads as "same device, new app".
  // Enter-only keyed fade — the sim stays in normal flow (its own scroll/status-bar
  // padding intact). Keying on entry.id remounts on every switch so the incoming
  // sim fades in; the brand skeleton covers the rare cold (un-preloaded) chunk.
  // (AnimatePresence mode="wait" was avoided: it deadlocks when a lazy child
  // suspends — it holds the outgoing sim and never mounts the incoming one.)
  // OPACITY ONLY, deliberately: a live `transform` (even scale: 0.992) makes this
  // element the containing block for every `position: fixed` descendant, and
  // framer settles it to `transform: none` at 220ms — at which point the sims'
  // 16 fixed-position backdrops, FABs and drawers escape the device and cover
  // the host. Reduced-motion users never had the transform and so lived with the
  // permanent version of that bug.
  const swap = (children: ReactNode) => (
    <motion.div
      key={entry.id}
      className="h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0.12 : 0.22, ease: 'easeOut' }}
    >
      <Suspense fallback={<SimSkeleton color={primaryColor} />}>{children}</Suspense>
    </motion.div>
  );

  const stage = frame ? (
    <MobilePhoneFrame
      platform={frame}
      // Geometry rides the existing className prop through the component's own
      // cn() (clsx + tailwind-merge), so the shared defaults at MobilePhoneFrame
      // :42 are never edited and any other consumer keeps the old behaviour.
      // h-full = "fill the row that's left" instead of guessing 80vh; the 900px
      // cap (up from 820) is what turns the reclaimed space into a bigger device
      // on a 1080p display.
      // Deliberately NO min-height: the stage row is `flex-1 min-h-0`, so its
      // height is always definite and `h-full` cannot collapse. A floor here has
      // no container left to scroll — at 844x390 landscape a 420px floor put the
      // device 89px past the bottom of a 285px row and over the mandated
      // disclaimer. A small device beats a clipped one.
      className={cn(
        'h-full max-h-[900px] max-w-full',
        // On a phone the visitor's own device IS the device: no bezel, no radius,
        // no shadow, no fake OS chrome — see MobilePhoneFrame's max-sm: variants.
        'max-sm:aspect-auto max-sm:h-full max-sm:w-full max-sm:max-h-none max-sm:max-w-none',
        'max-sm:rounded-none max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:ring-0',
      )}
    >
      {swap(<Component className={className} />)}
    </MobilePhoneFrame>
  ) : (
    <div
      className={cn(
        'mx-auto h-full w-full max-w-5xl overflow-hidden overscroll-contain rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950',
        // A containing block for the sims' `position: fixed` descendants, so a
        // web client's modal can't paint over the host chrome.
        '[transform:translateZ(0)]',
        'max-sm:rounded-none max-sm:border-0 max-sm:shadow-none',
      )}
    >
      {swap(<Component className={className ?? 'h-full w-full'} />)}
    </div>
  );

  return (
    <main className="flex w-full min-h-0 flex-1 flex-col overflow-hidden">
      {/* ---------------- mobile: compact bar + strip + full-bleed sim -------- */}
      <div className="flex shrink-0 items-center gap-1 border-b border-gray-200 px-2 py-1.5 dark:border-white/10 sm:hidden">
        <Link
          to="/"
          aria-label="All clients"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        {/* The title is the About affordance: at 320px the bar has no room for
            another icon button, and a tappable title is a standard mobile
            pattern. This is how the handoff to the real client exists on a
            phone, where the ContextPanel and the meta row are both hidden. */}
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          aria-haspopup="dialog"
          aria-label={`About this ${entry.name} reproduction`}
          className="flex min-w-0 items-center gap-1 rounded-lg px-1 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ClientGlyph client={entry} className="h-5 w-5 shrink-0" />
          <span className="truncate text-sm font-semibold">{entry.name}</span>
          <Info className="h-3 w-3 shrink-0 text-gray-400" />
        </button>
        <span className="ml-auto flex shrink-0 items-center gap-0.5">
          {entry.hasTour && !gated && (
            <button
              type="button"
              aria-label="Take a tour"
              onClick={() => window.dispatchEvent(new Event(`start-${entry.id}-tour`))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10"
            >
              <Play className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            aria-label="Switch client"
            // Mirrors the existing `start-${id}-tour` idiom: the switcher's
            // floating pill used to sit on top of the simulator's own tab bar,
            // so on phones the trigger lives up here instead.
            onClick={() => window.dispatchEvent(new Event('sandstr-open-switcher'))}
            className="flex h-8 items-center gap-0.5 rounded-lg px-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </span>
      </div>
      <div className="sm:hidden">
        <DisclaimerStrip name={entry.name} real={isReal} />
      </div>

      {/* ---------------- desktop: one compact meta row ----------------------- */}
      {/* The name/description/features/tour/disclaimer all live in the context
          panel at lg+; this row is the fallback for the sm–lg band, where the
          gutter is too narrow to furnish. */}
      <div
        className={cn(
          'mb-2 hidden shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 pt-3 sm:flex',
          // Only framed clients hand this job over to the ContextPanel at lg+.
          // Frameless clients have no panel, so without this the mandated
          // disclaimer would vanish entirely on a wide screen.
          frame && 'lg:hidden',
        )}
      >
        <div className="flex items-center gap-2" title={entry.description}>
          <ClientGlyph client={entry} className="h-6 w-6" />
          <h1 className="text-base font-semibold leading-none">{entry.name}</h1>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {platformLabel(entry.platform)}
          </span>
        </div>
        <Disclaimer name={entry.name} real={isReal} />
        {entry.hasTour && (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(`start-${entry.id}-tour`))}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary-300 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-500/40 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/20"
          >
            <Play className="h-3.5 w-3.5" /> Take a tour
          </button>
        )}
        {isReal && <Handoff entry={entry} compact />}
        {/* The frameless clients have no ContextPanel, so this row is their ONLY
            desktop home for the report link — hence it lives here and not just
            in the panel. Framed clients hide this whole row at lg+, so the two
            never render together. */}
        {isReal && <ReportLink entry={entry} />}
      </div>

      {/* ---------------- the stage ------------------------------------------ */}
      {/* flex-1 + min-h-0 is the load-bearing pair: it hands the device the row
          that's actually left over, which is what replaces the 80vh guess. The
          left inset clears the switcher rail (fixed at left-3, 58px wide). */}
      <div
        className={cn(
          'mx-auto flex min-h-0 w-full max-w-6xl flex-1 items-stretch justify-center gap-6',
          'px-4 pb-4 sm:pr-5 lg:pt-3',
          // Clear the switcher rail (fixed at left-3, 58px wide) only while the
          // stage actually reaches the left edge. From xl up the centred 6xl box
          // starts at x>=64, so the rail is already in free gutter and the inset
          // would just be width taken from the client for nothing.
          'sm:pl-[84px] xl:pl-5',
          'max-sm:gap-0 max-sm:p-0',
        )}
      >
        <div className="flex h-full min-w-0 flex-1 items-center justify-center">
          {gated ? <DesktopClientGate entry={entry} /> : stage}
        </div>
        {/* Framed clients only. A web client already fills its width — the panel
            would be taking room from the reproduction it is describing. */}
        {frame && <ContextPanel entry={entry} real={isReal} />}
      </div>

      {aboutOpen && <AboutSheet entry={entry} real={isReal} onClose={() => setAboutOpen(false)} />}
    </main>
  );
}
