import { Suspense, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Info, Play } from 'lucide-react';
import MobilePhoneFrame from '../simulators/shared/components/MobilePhoneFrame';
import { getClient } from '../registry';

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

export default function ClientView() {
  const { id } = useParams<{ id: string }>();
  const entry = getClient(id);
  const reduce = useReducedMotion();

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

  // The mounted simulator cross-fades in place on every switch; the frame/card
  // chrome around it stays put so it reads as "same device, new app".
  // Enter-only keyed fade — the sim stays in normal flow (its own scroll/status-bar
  // padding intact). Keying on entry.id remounts on every switch so the incoming
  // sim fades in; the brand skeleton covers the rare cold (un-preloaded) chunk.
  // (AnimatePresence mode="wait" was avoided: it deadlocks when a lazy child
  // suspends — it holds the outgoing sim and never mounts the incoming one.)
  const swap = (children: ReactNode) => (
    <motion.div
      key={entry.id}
      className="h-full w-full"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.992 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduce ? 0.12 : 0.22, ease: 'easeOut' }}
    >
      <Suspense fallback={<SimSkeleton color={primaryColor} />}>{children}</Suspense>
    </motion.div>
  );

  return (
    <main className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-28 pt-8">
      <h1 className="mb-1 text-2xl font-bold">{entry.name}</h1>
      <p className="mb-3 max-w-xl text-center text-sm text-gray-500 dark:text-gray-400">{entry.description}</p>
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <Disclaimer name={entry.name} real={isReal} />
        {entry.hasTour && (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(`start-${entry.id}-tour`))}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary-300 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-500/40 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/20"
          >
            <Play className="h-3.5 w-3.5" /> Take a tour
          </button>
        )}
      </div>

      {frame ? (
        <MobilePhoneFrame platform={frame}>{swap(<Component className={className} />)}</MobilePhoneFrame>
      ) : (
        <div className="h-[82vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
          {swap(<Component className={className ?? 'h-full w-full'} />)}
        </div>
      )}
    </main>
  );
}
