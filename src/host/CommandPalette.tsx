import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { CornerDownLeft, Search } from 'lucide-react';
import { clients, type ClientEntry } from '../registry';
import { ClientGlyph, platformLabel } from './ClientGlyph';
import { cn } from '../utils/cn';

interface Props {
  open: boolean;
  currentId?: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}

/** Ranking: name hits first, then id/feature hits, then a name-only subsequence. */
function score(c: ClientEntry, q: string): number {
  if (!q) return 1;
  const needle = q.toLowerCase();
  const name = c.name.toLowerCase();
  if (name.startsWith(needle)) return 4;
  if (name.includes(needle)) return 3;
  if (`${c.id} ${c.features.join(' ')}`.toLowerCase().includes(needle)) return 2;
  // Subsequence over the NAME only, so "amt" still finds "Amethyst" without a
  // short query matching half the list via concatenated feature strings.
  let i = 0;
  for (const ch of name) {
    if (ch === needle[i]) i++;
    if (i === needle.length) return 1;
  }
  return 0;
}

export default function CommandPalette({ open, currentId, onClose, onSelect }: Props) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    return clients
      .map((c) => ({ c, s: score(c, query.trim()) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s);
  }, [query]);

  // Reset transient state each time the palette opens; focus the input.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(t);
  }, [open]);

  // Keep the highlighted row valid + scrolled into view as the list narrows.
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, results.length - 1)));
  }, [results.length]);

  useEffect(() => {
    if (!open) return;
    const row = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    row?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  // Lock body scroll while open; restore the previous value on every exit path.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const commit = (i: number) => {
    const hit = results[i]?.c;
    if (hit) onSelect(hit.id);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((a) => (results.length ? (a + 1) % results.length : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0));
        break;
      case 'Enter':
        e.preventDefault();
        commit(active);
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  // Conditional mount (no AnimatePresence) — close unmounts immediately; the
  // enter animation still plays on open.
  return createPortal(
    open ? (
        <motion.div
          className="fixed inset-0 z-[var(--z-host-modal)] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Switch client simulator"
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 460, damping: 34 }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 dark:border-gray-800">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a client…"
                aria-label="Search clients"
                className="w-full bg-transparent py-3.5 text-[15px] outline-none placeholder:text-gray-400"
              />
              <kbd className="hidden shrink-0 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-gray-700 sm:block">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[46vh] overflow-y-auto p-1.5">
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-gray-400">No clients match “{query}”.</p>
              )}
              {results.map(({ c }, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={c.id}
                    type="button"
                    data-idx={i}
                    onMouseMove={() => setActive(i)}
                    onPointerEnter={() => c.preload()}
                    onClick={() => commit(i)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors',
                      isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                    )}
                    style={isActive ? { boxShadow: `inset 3px 0 0 ${c.primaryColor}` } : undefined}
                  >
                    <ClientGlyph client={c} className="h-9 w-9 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-medium text-gray-900 dark:text-gray-100">{c.name}</span>
                        {c.lead && (
                          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-amber-500">
                            ★
                          </span>
                        )}
                        {c.id === currentId && (
                          <span className="shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                            current
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                        <span>{platformLabel(c.platform)}</span>
                        {c.hasTour && <span>· guided tour</span>}
                      </span>
                    </span>
                    {isActive && <CornerDownLeft className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
    ) : null,
    document.body,
  );
}
