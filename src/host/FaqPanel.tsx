import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, HelpCircle, Play, Search, X } from 'lucide-react';
import type { ClientFaq, FaqEntry } from '../data/faq';
import { cn } from '../utils/cn';

interface Props {
  clientName: string;
  faq: ClientFaq;
  open: boolean;
  /** Entry to pre-expand (e.g. when reopening after its "Show me" tour). */
  initialEntryId?: string | null;
  onClose: () => void;
  /** "Show me" was clicked; the host closes the panel and hands off to the sim. */
  onShowMe: (entryId: string) => void;
  /**
   * Which answer is open right now (null when collapsed). The host mirrors it
   * into the URL so any answer can be linked to — deliberately NOT fed back in
   * as `initialEntryId`, which would re-run this panel's open effect on every
   * expand and reset the search box under the reader's hands.
   */
  onEntryOpen?: (entryId: string | null) => void;
}

/**
 * Same ranking idea as CommandPalette: whole-phrase question hits first, then
 * all-tokens-in-question, then all-tokens-anywhere, then a question-only
 * subsequence so "rly" still finds "relays" without matching half the list.
 *
 * `searchAliases` join both phrase tiers: an alias IS the question in the
 * asker's own words, so hitting one ranks with a title hit rather than with a
 * mention buried in an answer. Aliases are joined on " · " so the phrase tier
 * cannot match across two of them.
 */
function score(e: FaqEntry, q: string): number {
  if (!q) return 1;
  const needle = q.toLowerCase();
  const question = e.question.toLowerCase();
  const aliases = (e.searchAliases ?? []).join(' · ').toLowerCase();
  if (question.includes(needle) || aliases.includes(needle)) return 4;
  const tokens = needle.split(/\s+/).filter(Boolean);
  if (tokens.every((t) => question.includes(t))) return 3;
  const hay =
    `${question} ${aliases} ${e.answer.join(' ')} ${e.howNostrWorks ?? ''} ${e.note ?? ''} ${e.category}`.toLowerCase();
  if (tokens.every((t) => hay.includes(t))) return 2;
  let i = 0;
  for (const ch of question) {
    if (ch === needle[i]) i++;
    if (i === needle.length) return 1;
  }
  return 0;
}

export default function FaqPanel({ clientName, faq, open, initialEntryId, onClose, onShowMe, onEntryOpen }: Props) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Reset transient state on every open; land on the handed-back entry if any.
  // Focus lives inside the dialog from the start (aria-modal contract), and
  // whatever had focus when it opened gets it back when it closes.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    setQuery('');
    setCategory(null);
    setExpanded(initialEntryId ?? null);
    const t = setTimeout(() => {
      if (!initialEntryId) {
        inputRef.current?.focus();
        return;
      }
      // Returning from a "Show me" tour: bring the expanded entry into view
      // and put focus on it, so Tab/Enter continue from where the user left.
      const row = listRef.current?.querySelector<HTMLElement>(
        `[data-faq-entry="${initialEntryId}"] button`,
      );
      row?.scrollIntoView({ block: 'center' });
      row?.focus();
    }, 30);
    return () => {
      clearTimeout(t);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, initialEntryId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Minimal focus trap: Tab cycles within the dialog instead of walking into
  // the scrim-dimmed host chrome and the simulator behind it.
  const trapTab = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const els = [
      ...panelRef.current.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((el) => !el.hasAttribute('disabled'));
    if (els.length === 0) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Lock body scroll while open; restore the previous value on every exit path.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim();
    return faq.entries
      .filter((e) => !category || e.category === category)
      .map((e) => ({ e, s: score(e, q) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s);
  }, [faq, query, category]);

  const categories = useMemo(
    () => faq.categories.filter((c) => faq.entries.some((e) => e.category === c)),
    [faq],
  );

  // Conditional mount (no AnimatePresence — it can't unmount over the sims);
  // close unmounts immediately, the enter animation still plays on open.
  return createPortal(
    open ? (
      <motion.div
        className="fixed inset-0 z-[8000] flex items-end justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${clientName} FAQ`}
          // Marks a host modal for ClientSwitcher's global-shortcut guard
          // ([ / ] / ⌘K stay dead while this is open — same contract as its
          // own palette/sheet, probed via DOM because the panel lives here).
          data-sandstr-modal=""
          onKeyDown={trapTab}
          className={cn(
            // Explicit text color: the portal mounts on <body>, OUTSIDE
            // Layout's text-gray-900/dark:text-gray-100 wrapper — without
            // this, dark mode renders browser-default black on gray-900.
            'relative flex w-full flex-col overflow-hidden bg-white text-gray-900 shadow-2xl dark:bg-gray-900 dark:text-gray-100',
            'max-h-[82dvh] rounded-t-2xl border-t border-gray-200 dark:border-gray-800',
            'sm:h-full sm:max-h-none sm:max-w-[420px] sm:rounded-none sm:border-l sm:border-t-0',
          )}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 460, damping: 38 }}
        >
          {/* header */}
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <HelpCircle className="h-4 w-4 text-primary-500" /> {clientName} FAQ
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                How-tos for the real app — most answers can show you in the simulator.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close FAQ"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* search */}
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 dark:border-gray-800">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="How do I…?"
              aria-label={`Search ${clientName} FAQ`}
              className="w-full bg-transparent py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
            />
          </div>

          {/* category chips */}
          <div className="flex flex-wrap gap-1.5 border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
            {[null, ...categories].map((c) => (
              <button
                key={c ?? 'all'}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                  category === c
                    ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',
                )}
              >
                {c ?? 'All'}
              </button>
            ))}
          </div>

          {/* entries */}
          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-2">
            {results.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-gray-400">
                Nothing matches “{query}”. Try a shorter word — or{' '}
                <button type="button" className="underline" onClick={() => setQuery('')}>
                  browse all questions
                </button>
                .
              </p>
            )}
            {results.map(({ e }) => {
              const isOpen = expanded === e.id;
              return (
                <div
                  key={e.id}
                  data-faq-entry={e.id}
                  className={cn(
                    'rounded-xl',
                    isOpen && 'bg-gray-50 ring-1 ring-gray-200 dark:bg-gray-800/50 dark:ring-gray-700',
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => {
                      const next = isOpen ? null : e.id;
                      setExpanded(next);
                      onEntryOpen?.(next);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <span className="min-w-0 flex-1">{e.question}</span>
                    <ChevronDown
                      className={cn('h-4 w-4 shrink-0 text-gray-400 transition-transform', isOpen && 'rotate-180')}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3">
                      <ol className="list-decimal space-y-1 pl-5 text-[13px] leading-relaxed text-gray-600 dark:text-gray-300">
                        {e.answer.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                      {/* The protocol half of a troubleshooting answer. Visually
                          distinct on purpose: these sentences are true of Nostr
                          everywhere, not instructions to follow in this client. */}
                      {e.howNostrWorks && (
                        <div className="mt-2.5 rounded-lg border-l-2 border-primary-400 bg-gray-100/70 px-3 py-2 dark:border-primary-500/50 dark:bg-gray-800/70">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            How Nostr works
                          </p>
                          <p className="mt-1 text-[13px] leading-relaxed text-gray-600 dark:text-gray-300">
                            {e.howNostrWorks}
                          </p>
                        </div>
                      )}
                      {e.note && (
                        <p className="mt-2 text-xs italic leading-relaxed text-gray-400 dark:text-gray-500">
                          {e.note}
                        </p>
                      )}
                      {e.showMe && e.showMe.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onShowMe(e.id)}
                          className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-primary-300 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-500/40 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/20"
                        >
                          <Play className="h-3.5 w-3.5" /> Show me in the simulator
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    ) : null,
    document.body,
  );
}
