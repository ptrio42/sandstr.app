import { Link } from 'react-router-dom';
import { ArrowRight, KeyRound, Sparkles, Zap } from 'lucide-react';
import { clients, type ClientEntry } from '../registry';

function PlatformBadge({ platform }: { platform: ClientEntry['platform'] }) {
  const label = platform === 'ios' ? 'iOS' : platform.charAt(0).toUpperCase() + platform.slice(1);
  return (
    <span className="absolute right-4 top-4 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      {label}
    </span>
  );
}

function ClientCard({ c }: { c: ClientEntry }) {
  return (
    <Link
      to={`/c/${c.id}`}
      className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
    >
      <PlatformBadge platform={c.platform} />
      {c.lead && (
        <span className="absolute left-4 top-4 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
          ★ pick
        </span>
      )}

      <div
        className="mt-6 mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl text-3xl"
        style={{ backgroundColor: `${c.primaryColor}1a` }}
      >
        {c.icon ? (
          <img src={c.icon} alt={`${c.name} logo`} className="h-full w-full rounded-2xl object-cover" />
        ) : (
          <span>{c.emoji}</span>
        )}
      </div>

      <h3 className="mb-2 text-xl font-bold group-hover:text-primary-600 dark:group-hover:text-primary-400">
        {c.name}
      </h3>
      <p className="mb-4 flex-1 text-sm text-gray-600 dark:text-gray-400">{c.description}</p>

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

export default function Gallery() {
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
          Interactive, in-browser simulations of {clients.length} Nostr clients. Feel what each one is like before you
          commit to an install — or a keypair.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <KeyRound className="h-4 w-4" /> No keys generated
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" /> No signup
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-4 w-4" /> Nothing leaves your browser
          </span>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => (
          <ClientCard key={c.id} c={c} />
        ))}
      </section>
    </main>
  );
}
