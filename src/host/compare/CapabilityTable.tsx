/**
 * The capability matrix and the prose that carries it — the two pieces
 * `/compare` shares with the build-time prerender.
 *
 * WHY THEY LIVE HERE AND NOT INSIDE `CompareView`. `/compare` is the page that
 * is meant to RANK: it is the one surface on this site whose content is
 * ordinary sourced text about a client rather than a pixel-faithful clone of
 * one, which is exactly why `robots.txt` can invite crawlers here while still
 * keeping `/c/` out. A client-rendered SPA hands a crawler an empty `#root`,
 * so the content has to be baked in at build time (`scripts/prerender.mjs`).
 *
 * The trap in doing that is drift: a hand-written "SEO version" of a page stops
 * matching the page within a release or two, and nothing fails when it does.
 * So the prerender does not get its own markup — it renders THESE components,
 * the same ones the live page uses, from the same data. The table is
 * presentational and takes `onSelect`; without it, cells render as plain text
 * instead of buttons, which is also what a crawler should see.
 *
 * `CapabilityDetails` is not an SEO device bolted on the side. Ninety-six
 * one-line claims are the long tail people actually search for ("can you mute
 * a hashtag in Nostur", "does Damus have a wallet"), and grouped by axis they
 * read as a straight answer to a straight question. That it is also the
 * indexable payload is a consequence of writing the useful thing, not the
 * reason for it.
 */
import { Link } from 'react-router-dom';
import { Check, HelpCircle, Minus, X } from 'lucide-react';
import type { ClientEntry } from '../../registry';
import { COMPARISON_AXES, capabilities, type AxisId, type Verdict } from '../../data/capabilities';

export const VERDICT_META: Record<
  Verdict,
  { icon: typeof Check; label: string; className: string }
> = {
  yes: { icon: Check, label: 'Yes', className: 'text-emerald-600 dark:text-emerald-400' },
  partial: { icon: Minus, label: 'Partly', className: 'text-amber-600 dark:text-amber-400' },
  no: { icon: X, label: 'No', className: 'text-rose-600 dark:text-rose-400' },
  unknown: {
    icon: HelpCircle,
    label: 'Not verified',
    className: 'text-gray-400 dark:text-gray-500',
  },
};

export interface Selection {
  client: string;
  axis: AxisId;
}

export function CapabilityTable({
  clients,
  selected,
  onSelect,
}: {
  clients: ClientEntry[];
  selected?: Selection | null;
  /** Omit for the prerendered/static form: cells become text, not buttons. */
  onSelect?: (next: Selection) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">
          What each Nostr client can do, one capability per row
        </caption>
        <thead>
          <tr>
            <th className="sticky left-0 bg-white p-3 text-left font-medium text-gray-500 dark:bg-gray-950 dark:text-gray-400">
              <span className="sr-only">Capability</span>
            </th>
            {clients.map((c) => (
              <th key={c.id} scope="col" className="p-3 align-bottom">
                <Link
                  to={`/c/${c.id}`}
                  className="flex flex-col items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg"
                    style={{ backgroundColor: `${c.primaryColor}1a` }}
                  >
                    {c.icon ? (
                      <img
                        src={c.icon}
                        alt=""
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span aria-hidden>{c.emoji}</span>
                    )}
                  </span>
                  <span className="text-xs font-semibold">{c.name}</span>
                  {c.reproduces && (
                    <span className="text-[10px] font-normal text-gray-400 dark:text-gray-500">
                      {c.reproduces}
                    </span>
                  )}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_AXES.map((axis) => (
            <tr key={axis.id}>
              <th
                scope="row"
                className="sticky left-0 border-t border-gray-100 bg-white p-3 text-left font-normal dark:border-gray-800 dark:bg-gray-950"
              >
                {axis.label}
              </th>
              {clients.map((c) => {
                const cell = capabilities[c.id][axis.id];
                const meta = VERDICT_META[cell.verdict];
                const Icon = meta.icon;
                const isSelected = selected?.client === c.id && selected?.axis === axis.id;
                const glyph = <Icon className={`h-4 w-4 ${meta.className}`} aria-hidden />;
                return (
                  <td key={c.id} className="border-t border-gray-100 p-0 dark:border-gray-800">
                    {onSelect ? (
                      <button
                        type="button"
                        onClick={() => onSelect({ client: c.id, axis: axis.id })}
                        aria-label={`${c.name}: ${axis.label} — ${meta.label}`}
                        className={`flex h-11 w-full items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-primary-50 dark:bg-primary-500/10'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
                        }`}
                      >
                        {glyph}
                      </button>
                    ) : (
                      <span className="flex h-11 w-full items-center justify-center">
                        {glyph}
                        <span className="sr-only">
                          {c.name}: {axis.label} — {meta.label}
                        </span>
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The way back to the shelf, rendered by the live page and the prerender alike.
 *
 * It exists because of a dead end only the prerendered file has. That file is
 * the page body without `Layout`, so it carries no header and no footer, and
 * every other link on it points under `/c/` — which `robots.txt` Disallows. A
 * crawler landing on `/compare` therefore had nowhere allowed to go next, which
 * is close to the worst shape an indexable page can have.
 *
 * On the live page Layout's logo already goes home, so this is one extra link
 * there. That is the right way round: the shared component is a strict superset
 * of what the static file needs, rather than the static file quietly growing
 * markup the real page does not have.
 */
export function BackToShelf() {
  return (
    <p className="mt-12 text-sm">
      <Link to="/" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
        See all the reproductions and try one →
      </Link>
    </p>
  );
}

/**
 * Every claim in the matrix, in words, grouped by capability. This is the
 * readable form of the same 96 cells — and the reason `/compare` is worth
 * crawling at all.
 */
export function CapabilityDetails({ clients }: { clients: ClientEntry[] }) {
  return (
    <div className="space-y-8">
      {COMPARISON_AXES.map((axis) => (
        <section key={axis.id} aria-labelledby={`axis-${axis.id}`}>
          <h3 id={`axis-${axis.id}`} className="mb-1 text-base font-semibold">
            {axis.label}
          </h3>
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{axis.question}</p>
          <dl className="space-y-2">
            {clients.map((c) => {
              const cell = capabilities[c.id][axis.id];
              const meta = VERDICT_META[cell.verdict];
              return (
                <div key={c.id} className="sm:flex sm:gap-3">
                  <dt className="shrink-0 sm:w-40">
                    <Link
                      to={`/c/${c.id}?faq=${cell.source}`}
                      className="font-medium hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {c.name}
                    </Link>{' '}
                    <span className={`text-xs ${meta.className}`}>{meta.label}</span>
                    {c.reproduces && (
                      <span className="ml-1 text-[11px] text-gray-400 dark:text-gray-500">
                        {c.reproduces}
                      </span>
                    )}
                  </dt>
                  <dd className="min-w-0 text-sm text-gray-700 dark:text-gray-300">
                    {cell.detail}
                    {cell.grounding && (
                      <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                        {cell.grounding}
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}
