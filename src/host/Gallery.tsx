import { Link } from 'react-router-dom';
import { ArrowRight, KeyRound, ServerOff, Sparkles } from 'lucide-react';
import { clients, type ClientEntry } from '../registry';

function PlatformBadge({ platform }: { platform: ClientEntry['platform'] }) {
  const label = platform === 'ios' ? 'iOS' : platform.charAt(0).toUpperCase() + platform.slice(1);
  return (
    <span className="absolute right-4 top-4 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      {label}
    </span>
  );
}

/**
 * Status chips are deliberately NEUTRAL GRAY — amber belongs to the simulation
 * disclaimer alone, and the "Ready" story is told by the section heading, not
 * by shouting on every card.
 */
function StatusChip({ c }: { c: ClientEntry }) {
  if (c.kind === 'original') {
    return (
      <span className="absolute left-4 top-4 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        Original
      </span>
    );
  }
  if (c.status === 'preview') {
    return (
      <span className="absolute left-4 top-4 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        Early preview
      </span>
    );
  }
  return null;
}

function ClientCard({ c }: { c: ClientEntry }) {
  return (
    <Link
      to={`/c/${c.id}`}
      className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
    >
      <PlatformBadge platform={c.platform} />
      <StatusChip c={c} />

      <div
        className="mt-6 mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl text-3xl"
        style={{ backgroundColor: `${c.primaryColor}1a` }}
      >
        {c.icon ? (
          // Icons are 128px sources in a 64px box (2× for retina). Intrinsic
          // width/height let the browser reserve the space before the file
          // lands — the markup is prerendered now, so these tags exist before
          // any JS runs.
          <img
            src={c.icon}
            alt={`${c.name} logo`}
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
            className="h-full w-full rounded-2xl object-cover"
          />
        ) : (
          <span>{c.emoji}</span>
        )}
      </div>

      <h3 className="mb-2 text-xl font-bold group-hover:text-primary-600 dark:group-hover:text-primary-400">
        {c.name}
      </h3>
      <p className="mb-4 flex-1 text-sm text-gray-600 dark:text-gray-400">{c.description}</p>

      {c.statusNote && (
        <p className="mb-4 text-xs italic leading-relaxed text-gray-400 dark:text-gray-500">{c.statusNote}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {c.features.slice(0, 4).map((f) => (
          <span
            key={f}
            className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          >
            {f}
          </span>
        ))}
        {c.features.length > 4 && (
          <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-800">
            +{c.features.length - 4}
          </span>
        )}
      </div>

      <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-primary-600 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

function Section({ title, note, items }: { title: string; note?: string; items: ClientEntry[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-12">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">{title}</h2>
        {note && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{note}</p>}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <ClientCard key={c.id} c={c} />
        ))}
      </div>
    </section>
  );
}

export default function Gallery() {
  const ready = clients.filter((c) => c.kind === 'reproduction' && c.status === 'ready');
  const previews = clients.filter((c) => c.kind === 'reproduction' && c.status === 'preview');
  const originals = clients.filter((c) => c.kind === 'original');

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-14 text-center">
        <h1 className="mb-5 text-4xl font-bold md:text-5xl">
          Try Nostr clients
          {/* Sand only sings on the dark ground; on white it greys out, so light
              mode stays inside the purple family. */}
          <span className="block bg-gradient-to-r from-brand-primary to-[#5B45D9] bg-clip-text text-transparent dark:to-brand-sand">
            without installing anything
          </span>
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Interactive, in-browser simulations of real Nostr clients — {ready.length} faithful
          reproductions ready to try, {previews.length} more in progress. Feel what each one is like
          before you commit to an install — or a keypair.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <KeyRound className="h-4 w-4" /> No keys generated
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" /> No signup
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ServerOff className="h-4 w-4" /> No server
          </span>
        </div>
      </section>

      <Section
        title="Ready to try"
        note="Reference-verified reproductions — rebuilt screen by screen against recordings of the real apps."
        items={ready}
      />
      <Section
        title="Early previews"
        note="Clickable, but not yet verified against the real clients. Treat the look as approximate."
        items={previews}
      />
      <Section
        title="Not a real Nostr client"
        note="Our own creation — no real-world counterpart, no trademark, just proof the shell can host anything."
        items={originals}
      />
    </main>
  );
}
