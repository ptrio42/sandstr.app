import { Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import MobilePhoneFrame from '../simulators/shared/components/MobilePhoneFrame';
import { getClient } from '../registry';

function Disclaimer({ name, real }: { name: string; real: boolean }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
      <Info className="h-3.5 w-3.5" />
      <span>
        <strong>Simulation</strong> · mock data ·{' '}
        {real ? `unofficial, not affiliated with ${name}` : 'original demo client'}
      </span>
    </div>
  );
}

function Fallback() {
  return (
    <div className="flex h-64 items-center justify-center text-gray-400">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

export default function ClientView() {
  const { id } = useParams<{ id: string }>();
  const entry = getClient(id);

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

  const { Component, frame, className } = entry;
  // Nostr Kitten is the only original (non-real) client in the set.
  const isReal = entry.id !== 'nostr-kitten';

  return (
    <main className="mx-auto flex max-w-6xl flex-col items-center px-4 py-8">
      <div className="mb-4 w-full max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-primary-600 dark:text-gray-400"
        >
          <ArrowLeft className="h-4 w-4" /> All clients
        </Link>
      </div>

      <h1 className="mb-1 text-2xl font-bold">{entry.name}</h1>
      <p className="mb-3 max-w-xl text-center text-sm text-gray-500 dark:text-gray-400">{entry.description}</p>
      <Disclaimer name={entry.name} real={isReal} />

      <Suspense fallback={<Fallback />}>
        {frame ? (
          <MobilePhoneFrame platform={frame}>
            <Component className={className} />
          </MobilePhoneFrame>
        ) : (
          <div className="h-[82vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
            <Component className={className ?? 'h-full w-full'} />
          </div>
        )}
      </Suspense>
    </main>
  );
}
