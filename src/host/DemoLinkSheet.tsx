import { useEffect, useRef, useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import type { ClientEntry } from '../registry';
import type { ClientFaq } from '../data/faq/types';
import { SCREEN_LABELS, type ScreenIntent } from '../simulators/shared/screenSync';
import { cn } from '../utils/cn';

/**
 * "Build a demo link" — compose one URL that opens this client the way you want
 * to show it, then copy it.
 *
 * The feature is almost entirely a URL builder, because a demo here already IS
 * a URL: `?screen=`, `?theme=`, `?tour=1`, `?faq=` and `?note=` each set one
 * part of the opening state, and until this dialog existed you had to know all
 * five from memory. Nothing new is rendered into the simulator and nothing is
 * stored — this reads the state the page already has and writes a link.
 *
 * Two rules it exists to keep, and neither is cosmetic:
 *
 *  1. **It composes; it does not author.** Every option here points at material
 *     the product already stands behind — a screen the client really has, an
 *     answer that is already in its FAQ bank, its own guided tour. There is
 *     deliberately no free-text caption field: a box that draws arbitrary words
 *     in a spotlight card on top of somebody else's client would turn a
 *     reproduction into a way to put words in their mouth. The pasted-note text
 *     is the one visitor-authored string, and it is not ours to invent either —
 *     it is reused from "Preview your note", where it already ships.
 *  2. **Nothing here can hide the host.** No option removes the SIMULATION
 *     banner or the way out to the real client. Those are the mitigations the
 *     whole reproduction rests on (CLAUDE.md, branding), so a demo link that
 *     could switch them off would be the one configuration worth refusing.
 */

/** What the link makes happen after the client opens. Exactly one of these. */
type DemoAction = 'none' | 'tour' | 'answer' | 'play';

export interface DemoLinkConfig {
  screen: ScreenIntent | '';
  theme: '' | 'dark' | 'light';
  action: DemoAction;
  entryId: string;
  includeNote: boolean;
}

/**
 * Build the link. Exported and pure so the same rules can be read (and tested)
 * without mounting anything.
 *
 * `origin` comes from the caller rather than being hardcoded to sandstr.app:
 * on production that IS sandstr.app, and in development it is localhost, which
 * is the only way to click the link you just built. Same choice, for the same
 * reason, as copyLink() in PreviewNoteSheet.
 */
export function buildDemoUrl(
  origin: string,
  clientId: string,
  cfg: DemoLinkConfig,
  noteText: string,
): string {
  const url = new URL(`/c/${clientId}`, origin);
  // A start screen only survives next to things that do not navigate.
  //
  // Both measured on 2026-08-21, not reasoned about: a tour launched on Snort's
  // Relays screen had walked the client back to its feed by step 3, and
  // `?screen=search&showme=zap` on Wisp opened the zap sheet, never search —
  // a mini-tour's `commands` put the simulator wherever its target lives. In
  // both cases the parameter is not merely redundant, it is a clause of the
  // link that does not happen. `answer` is different: `?faq=` only opens our
  // panel over whatever screen the client is on, so the pair is honest.
  const drives = cfg.action === 'tour' || cfg.action === 'play';
  if (cfg.screen && !drives) url.searchParams.set('screen', cfg.screen);
  if (cfg.theme) url.searchParams.set('theme', cfg.theme);
  if (cfg.action === 'tour') url.searchParams.set('tour', '1');
  if (cfg.action === 'answer' && cfg.entryId) url.searchParams.set('faq', cfg.entryId);
  if (cfg.action === 'play' && cfg.entryId) url.searchParams.set('showme', cfg.entryId);
  if (cfg.includeNote && noteText) url.searchParams.set('note', noteText);
  return url.toString();
}

const FIELD =
  'w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 outline-none focus:border-primary-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100';

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-1 text-[11px] leading-snug text-gray-500 dark:text-gray-400">{hint}</p>}
    </label>
  );
}

interface Props {
  entry: ClientEntry;
  faq: ClientFaq | null;
  /** Intents the mounted simulator really maps — see mountedScreenIntents(). */
  screens: ScreenIntent[];
  /** The visitor's pasted note, if any. Not editable here: this dialog composes. */
  noteText: string;
  onClose: () => void;
}

export default function DemoLinkSheet({ entry, faq, screens, noteText, onClose }: Props) {
  const [cfg, setCfg] = useState<DemoLinkConfig>({
    screen: '',
    theme: '',
    action: 'none',
    entryId: '',
    includeNote: !!noteText,
  });
  const [copied, setCopied] = useState(false);
  const firstRef = useRef<HTMLSelectElement>(null);

  // Every host dialog owns its own Escape. The tour and the switcher both go
  // quiet on `data-sandstr-modal` below, which means neither of them will close
  // this for us — and the tour handing over the WHOLE keyboard is exactly why
  // closing the FAQ used to end a running tour (CLAUDE.md, Gotchas).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const answers = faq?.entries ?? [];
  const playable = answers.filter((e) => e.showMe?.length);
  const needsEntry = cfg.action === 'answer' || cfg.action === 'play';
  const options = cfg.action === 'play' ? playable : answers;
  const url = buildDemoUrl(window.location.origin, entry.id, cfg, noteText);
  const incomplete = needsEntry && !cfg.entryId;

  const set = <K extends keyof DemoLinkConfig>(key: K, value: DemoLinkConfig[K]) =>
    setCfg((c) => {
      const next = { ...c, [key]: value };
      // Switching what happens invalidates whichever answer was picked for the
      // previous mode — "play" offers a strict subset, so carrying the id over
      // silently produced a link naming an entry with no mini-tour.
      if (key === 'action') next.entryId = '';
      return next;
    });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (insecure context, denied permission). The link is
      // selectable in the box below, so this is a convenience allowed to fail.
    }
  };

  return (
    <div
      className="fixed inset-0 z-[var(--z-host-modal)] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Build a ${entry.name} demo link`}
      data-sandstr-modal=""
    >
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative m-0 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 pb-7 shadow-2xl dark:bg-gray-900 sm:m-4 sm:rounded-2xl">
        <h2 className="text-base font-semibold">Build a demo link</h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          One link that opens {entry.name} the way you want to show it — a screen, a theme, and
          optionally something that happens on arrival. It always opens as a simulation, banner and
          all.
        </p>

        <div className="mt-4 space-y-3">
          <Row
            label="Opens on"
            hint={
              cfg.action === 'tour' || cfg.action === 'play'
                ? 'That walks the client to its own screens, so it decides where you land.'
                : screens.length
                  ? undefined
                  : 'This client is not mounted here, so it publishes no screens to pick from.'
            }
          >
            <select
              ref={firstRef}
              className={FIELD}
              value={cfg.screen}
              disabled={cfg.action === 'tour' || cfg.action === 'play' || !screens.length}
              onChange={(e) => set('screen', e.target.value as ScreenIntent | '')}
            >
              <option value="">Wherever it really opens</option>
              {screens.map((s) => (
                <option key={s} value={s}>
                  {SCREEN_LABELS[s]}
                </option>
              ))}
            </select>
          </Row>

          <Row label="Theme" hint="Applies to this link only — it never overwrites a visitor's own choice.">
            <select
              className={FIELD}
              value={cfg.theme}
              onChange={(e) => set('theme', e.target.value as DemoLinkConfig['theme'])}
            >
              <option value="">As {entry.name} ships it</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </Row>

          <Row label="On arrival">
            <select
              className={FIELD}
              value={cfg.action}
              onChange={(e) => set('action', e.target.value as DemoAction)}
            >
              <option value="none">Nothing — just open it</option>
              {entry.hasTour && <option value="tour">Start the guided tour</option>}
              {!!answers.length && <option value="answer">Open one FAQ answer</option>}
              {!!playable.length && <option value="play">Play one answer in the client</option>}
            </select>
          </Row>

          {needsEntry && (
            <Row
              label={cfg.action === 'play' ? 'Which answer to play' : 'Which answer to open'}
              hint={
                cfg.action === 'play'
                  ? `${playable.length} of ${answers.length} answers can be replayed in the simulator.`
                  : undefined
              }
            >
              <select className={FIELD} value={cfg.entryId} onChange={(e) => set('entryId', e.target.value)}>
                <option value="">Pick one…</option>
                {options.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.question}
                  </option>
                ))}
              </select>
            </Row>
          )}

          <label
            className={cn(
              'flex items-start gap-2 rounded-lg border p-2.5 text-sm',
              noteText
                ? 'border-gray-200 dark:border-gray-700'
                : 'border-dashed border-gray-200 text-gray-400 dark:border-gray-700',
            )}
          >
            <input
              type="checkbox"
              className="mt-0.5"
              disabled={!noteText}
              checked={cfg.includeNote && !!noteText}
              onChange={(e) => set('includeNote', e.target.checked)}
            />
            <span>
              Carry the note you previewed
              {noteText ? (
                <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
                  “{noteText.slice(0, 80)}
                  {noteText.length > 80 ? '…' : ''}”
                </span>
              ) : (
                <span className="mt-0.5 block text-xs">
                  Nothing pasted yet — use “Preview your note” first.
                </span>
              )}
            </span>
          </label>
        </div>

        <div className="mt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">The link</span>
          <textarea
            readOnly
            value={url}
            rows={2}
            onFocus={(e) => e.currentTarget.select()}
            className="mt-1 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-2.5 font-mono text-xs leading-relaxed text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
          />
          {incomplete && (
            <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
              Pick an answer, or the link just opens {entry.name}.
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Close
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Try it
          </a>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      </div>
    </div>
  );
}
