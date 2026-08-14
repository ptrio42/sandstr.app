/**
 * /compare — "which client can do X", and what the same note looks like in each.
 *
 * The gallery answers "what is there" and the per-client FAQ answers "how do I
 * do X in this one". Neither answers the question people actually arrive with,
 * which is the fourth-biggest topic on #asknostr: which client should I use.
 * This page is that missing step, built from data that already existed — the
 * capability matrix (src/data/capabilities.ts, derived from the FAQ banks) and
 * the note cards the simulators already ship.
 *
 * Three sections, in funnel order: answer a few questions → the matrix narrows
 * → see the surviving clients render the same post.
 *
 * PROVENANCE IS PART OF THE UI, not a footnote. Every cell links to the FAQ
 * answer it came from (/c/<id>?faq=<entry>), and every client prints the
 * upstream build it was verified against. A capability claim about someone
 * else's product with no date and no source is exactly the kind of thing that
 * quietly becomes false — see the header of src/data/capabilities.ts.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, HelpCircle, Info, Minus, X } from 'lucide-react';
import { getClient, type ClientEntry } from '../../registry';
import { mockNotes, mockUsers, getUserByPubkey } from '../../data/mock';
import {
  COMPARISON_AXES,
  COMPARED_CLIENTS,
  capabilities,
  type AxisId,
  type Verdict,
} from '../../data/capabilities';
import { SURFACES, type ClientSurface } from './surfaces';
import { ScaledFrame } from './ScaledFrame';

/* -------------------------------------------------------------- verdicts -- */

const VERDICT_META: Record<Verdict, { icon: typeof Check; label: string; className: string }> = {
  yes: { icon: Check, label: 'Yes', className: 'text-emerald-600 dark:text-emerald-400' },
  partial: { icon: Minus, label: 'Partly', className: 'text-amber-600 dark:text-amber-400' },
  no: { icon: X, label: 'No', className: 'text-rose-600 dark:text-rose-400' },
  unknown: { icon: HelpCircle, label: 'Not verified', className: 'text-gray-400 dark:text-gray-500' },
};

/* --------------------------------------------------------------- chooser -- */

/**
 * The questions are the axes' own `question` field, so a new axis cannot drift
 * out of sync with the thing it filters. `platform` is the exception: it is not
 * a capability, it is where the real client runs.
 *
 * It filters `ClientEntry.availableOn`, NOT `platform`. `platform` says which
 * build this shelf reproduces — YakiHonne from its iOS app, Primal from its web
 * app — and filtering on it hid clients that do run on the device being asked
 * about. `availableOn` is read off each entry's verified `installNote`.
 */
const PLATFORM_CHOICES = [
  { id: 'any', label: 'Any' },
  { id: 'ios', label: 'iPhone' },
  { id: 'android', label: 'Android' },
  { id: 'web', label: 'Browser' },
] as const;

type PlatformChoice = (typeof PLATFORM_CHOICES)[number]['id'];

/** Axes worth asking about up front — the ones where the answers split hardest. */
const CHOOSER_AXES: AxisId[] = [
  'signer',
  'guest-mode',
  'multi-account',
  'mute-words',
  'builtin-wallet',
];

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={
            value === o.id
              ? 'rounded-md bg-white px-3 py-1 text-sm font-medium text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
              : 'rounded-md px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const YES_NO = [
  { id: 'any', label: "Doesn't matter" },
  { id: 'need', label: 'I want this' },
] as const;

type Requirement = (typeof YES_NO)[number]['id'];

/* ---------------------------------------------------------------- matrix -- */

function MatrixCell({
  clientId,
  axisId,
  selected,
  onSelect,
}: {
  clientId: string;
  axisId: AxisId;
  selected: boolean;
  onSelect: () => void;
}) {
  const cell = capabilities[clientId][axisId];
  const meta = VERDICT_META[cell.verdict];
  const Icon = meta.icon;
  return (
    <td className="border-t border-gray-100 p-0 dark:border-gray-800">
      <button
        type="button"
        onClick={onSelect}
        aria-label={`${clientId}: ${meta.label}`}
        className={`flex h-11 w-full items-center justify-center transition-colors ${
          selected ? 'bg-primary-50 dark:bg-primary-500/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
        }`}
      >
        <Icon className={`h-4 w-4 ${meta.className}`} />
      </button>
    </td>
  );
}

/* ------------------------------------------------------------ note strip -- */

function SurfaceCell({ entry, surface, note, author, users }: {
  entry: ClientEntry;
  surface: ClientSurface;
  note: (typeof mockNotes)[number];
  author: ReturnType<typeof getUserByPubkey>;
  users: typeof mockUsers;
}) {
  const { Component, rootClass, natural } = surface;
  // The real client's shipping default, straight off the registry — Snort is
  // the only one with none (it ships `theme: "system"`), and it opens dark.
  const theme = entry.defaultTheme ?? 'dark';
  const content = <Component note={note} author={author!} users={users} />;
  // A desktop surface takes the whole row. Squeezed into a third of it, a
  // 1022px screen scales to ~34% — legible as a thumbnail, useless as a
  // comparison, and next to a phone at 90% it reads as "this client is smaller"
  // rather than "this client is wider".
  const fullRow = !!natural && natural.width >= 600;
  return (
    <figure
      className={`flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 ${
        fullRow ? 'sm:col-span-2 lg:col-span-3' : ''
      }`}
    >
      <figcaption className="flex items-baseline justify-between gap-2 border-b border-gray-100 px-3 py-2 dark:border-gray-800">
        <span className="truncate text-sm font-semibold">{entry.name}</span>
        {entry.reproduces && (
          <span className="shrink-0 text-[11px] text-gray-400 dark:text-gray-500">
            {entry.reproduces}
          </span>
        )}
      </figcaption>

      {natural ? (
        // A whole screen, shown at its real proportions and scaled to the cell.
        <ScaledFrame width={natural.width} height={natural.height} className={rootClass} theme={theme}>
          {content}
        </ScaledFrame>
      ) : (
        // A note card is designed to fill a column, and is the one surface
        // worth reading at 1:1. Class AND attribute, same reason as above.
        <div className={`${rootClass} ${theme} min-w-0 overflow-x-auto`} data-theme={theme}>
          {content}
        </div>
      )}

      <Link
        to={`/c/${entry.id}`}
        className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2 text-xs font-medium text-primary-600 hover:bg-gray-50 dark:border-gray-800 dark:text-primary-400 dark:hover:bg-gray-800/60"
      >
        Open {entry.name} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </figure>
  );
}

/* ------------------------------------------------------------------ page -- */

export default function CompareView() {
  const [platform, setPlatform] = useState<PlatformChoice>('any');
  const [surfaceId, setSurfaceId] = useState<string>(SURFACES[0].id);
  const [reqs, setReqs] = useState<Record<string, Requirement>>({});
  const [picked, setPicked] = useState<{ client: string; axis: AxisId } | null>(null);

  const entries = useMemo(
    () => COMPARED_CLIENTS.map((id) => getClient(id)).filter((c): c is ClientEntry => !!c),
    [],
  );

  const matches = useMemo(
    () =>
      entries.filter((c) => {
        if (platform !== 'any' && !c.availableOn.includes(platform)) return false;
        // A requirement drops only an explicit `no`. `partial` survives because
        // "it does a smaller version of this" is information the reader should
        // weigh, not something to silently delete; `unknown` survives because
        // filtering on absent evidence would turn a shrug into a verdict.
        return CHOOSER_AXES.every(
          (axis) => reqs[axis] !== 'need' || capabilities[c.id][axis].verdict !== 'no',
        );
      }),
    [entries, platform, reqs],
  );

  // One note, shared by every cell — that identity IS the comparison. Picked
  // for shape, not at random: enough text to wrap, a hashtag, no attachment
  // (media would compare our placeholder renderers, not their designs).
  const note = useMemo(
    () =>
      mockNotes.find(
        (n) => !n.images?.length && !n.isRepost && n.content.length > 90 && n.content.length < 220,
      ) ?? mockNotes[0],
    [],
  );
  const author = useMemo(() => getUserByPubkey(note.pubkey) ?? mockUsers[0], [note]);

  const surface = SURFACES.find((s) => s.id === surfaceId) ?? SURFACES[0];

  const detail = picked ? capabilities[picked.client][picked.axis] : null;
  const detailClient = picked ? getClient(picked.client) : null;
  const detailAxis = picked ? COMPARISON_AXES.find((a) => a.id === picked.axis) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">Which Nostr client?</h1>
        <p className="max-w-3xl text-gray-600 dark:text-gray-400">
          Answer a few questions, see what each client actually does, then look at the same post
          rendered by every one of them. Every claim links to the answer it came from and names the
          build it was checked against.
        </p>
        <p className="mt-3 max-w-3xl text-sm text-gray-500 dark:text-gray-500">
          These describe the <strong>real apps</strong>, not the simulations on this site — the
          source is each client&rsquo;s own FAQ, which is grounded in its published source code.
          Where an answer did not settle a question, the cell says &ldquo;not verified&rdquo; rather
          than guessing.
        </p>
      </header>

      {/* ------------------------------------------------------- chooser -- */}
      <section aria-labelledby="chooser-heading" className="mb-10">
        <h2 id="chooser-heading" className="mb-4 text-lg font-semibold">
          What do you need?
        </h2>
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Which build do you want to try?
            </span>
            <Segmented value={platform} options={PLATFORM_CHOICES} onChange={setPlatform} />
          </div>
          {CHOOSER_AXES.map((axisId) => {
            const axis = COMPARISON_AXES.find((a) => a.id === axisId)!;
            return (
              <div key={axisId} className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">{axis.question}</span>
                <Segmented
                  value={reqs[axisId] ?? 'any'}
                  options={YES_NO}
                  onChange={(v) => setReqs((r) => ({ ...r, [axisId]: v }))}
                />
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {matches.length === entries.length
            ? `All ${entries.length} reproductions shown.`
            : `${matches.length} of ${entries.length} match: ${matches.map((c) => c.name).join(', ') || '—'}`}
        </p>
      </section>

      {/* -------------------------------------------------------- matrix -- */}
      <section aria-labelledby="matrix-heading" className="mb-12">
        <h2 id="matrix-heading" className="mb-4 text-lg font-semibold">
          What each one does
        </h2>

        {matches.length === 0 ? (
          <p className="rounded-xl border border-gray-200 p-6 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">
            Nothing matches all of those at once. Loosen one of the answers above — the matrix below
            shows what each client gives up.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-white p-3 text-left font-medium text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                      <span className="sr-only">Capability</span>
                    </th>
                    {matches.map((c) => (
                      <th key={c.id} className="p-3 align-bottom">
                        <Link
                          to={`/c/${c.id}`}
                          className="flex flex-col items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          <span
                            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg"
                            style={{ backgroundColor: `${c.primaryColor}1a` }}
                          >
                            {c.icon ? (
                              <img src={c.icon} alt="" width={32} height={32} className="h-full w-full object-cover" />
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
                      {matches.map((c) => (
                        <MatrixCell
                          key={c.id}
                          clientId={c.id}
                          axisId={axis.id}
                          selected={picked?.client === c.id && picked?.axis === axis.id}
                          onSelect={() => setPicked({ client: c.id, axis: axis.id })}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* The detail slot. A grid of glyphs is a summary; this is where the
                actual claim, and the link that backs it, live. */}
            <div className="mt-4 min-h-[5.5rem] rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              {detail && detailClient && detailAxis ? (
                <>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    {detailClient.name} · {detailAxis.label} ·{' '}
                    <span className={VERDICT_META[detail.verdict].className}>
                      {VERDICT_META[detail.verdict].label}
                    </span>
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{detail.detail}</p>
                  {/* Printed whenever the FAQ answer alone does not carry the
                      claim — otherwise the "read the full answer" link below
                      would be pointing at something that does not say this. */}
                  {detail.grounding && (
                    <p className="mt-2 border-l-2 border-gray-200 pl-3 text-xs leading-relaxed text-gray-500 dark:border-gray-700 dark:text-gray-400">
                      {detail.grounding}
                    </p>
                  )}
                  <Link
                    to={`/c/${detailClient.id}?faq=${detail.source}`}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Read the full answer in {detailClient.name}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  {detailClient.reproduces && (
                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                      True of {detailClient.name} {detailClient.reproduces}.{' '}
                      <a
                        href={detailClient.repo}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        Check it upstream
                      </a>
                      .
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pick any cell in the table to read what it means and where the claim comes from.
                </p>
              )}
            </div>
          </>
        )}
      </section>

      {/* -------------------------------------------------- surface strip -- */}
      <section aria-labelledby="strip-heading">
        <h2 id="strip-heading" className="mb-2 text-lg font-semibold">
          Side by side
        </h2>
        <p className="mb-4 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
          The same part of the interface, in every client at once — each one rendered by its own
          component, at its own proportions, in the theme it really ships with.
        </p>

        <div
          role="tablist"
          aria-label="Which part of the interface"
          className="mb-3 inline-flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800"
        >
          {SURFACES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={s.id === surfaceId}
              onClick={() => setSurfaceId(s.id)}
              className={
                s.id === surfaceId
                  ? 'rounded-md bg-white px-3 py-1 text-sm font-medium text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                  : 'rounded-md px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mb-4 max-w-3xl text-sm text-gray-600 dark:text-gray-400">{surface.blurb}</p>

        {/* The mandated disclaimer, in its host-wide wording. These are
            brand-faithful reproductions rendered outside /c/, so the strip
            carries it once for the whole section rather than eight times. */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>Simulation</strong> · mock data · unofficial, not affiliated with any of these
            projects
          </span>
        </div>

        <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((entry) => {
            const cell = surface.byClient[entry.id];
            if (!cell) return null;
            return (
              <SurfaceCell
                key={`${surface.id}-${entry.id}`}
                entry={entry}
                surface={cell}
                note={note}
                author={author}
                users={mockUsers}
              />
            );
          })}
        </div>

        {/* Absences are printed, never silently skipped — a missing tile with no
            explanation reads as "this client does not have one". */}
        {matches.some((c) => surface.absent?.[c.id]) && (
          <ul className="mt-5 space-y-2">
            {matches
              .filter((c) => surface.absent?.[c.id])
              .map((c) => (
                <li key={c.id} className="text-xs text-gray-500 dark:text-gray-500">
                  <strong className="font-medium text-gray-600 dark:text-gray-400">{c.name}</strong>{' '}
                  — {surface.absent![c.id]}
                </li>
              ))}
          </ul>
        )}

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-500">
          Keychat and Gossip are absent on purpose: both are early previews with no verified
          screen-map, so there is nothing to ground a claim about them in.
        </p>
      </section>
    </div>
  );
}
