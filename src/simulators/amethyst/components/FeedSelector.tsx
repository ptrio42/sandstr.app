import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import '../amethyst.theme.css';

const FEEDS = ['All Follows', 'Global', 'Around Me', '#bitcoin', '#nostr'];

// The app-bar feed selector ("All Follows ▾"): opens a grouped feed list in the real app.
// Self-contained state (the selection is cosmetic here) so any screen can drop it in.
export function FeedSelector({ defaultFeed = 'All Follows' }: { defaultFeed?: string }) {
  const [selected, setSelected] = useState(defaultFeed);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1 font-semibold text-[var(--md-on-surface)]"
      >
        {selected}
        <ChevronDown className={`w-4 h-4 text-[var(--md-on-surface-variant)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              className="absolute top-full mt-2 z-30 min-w-[200px] rounded-2xl overflow-hidden py-2"
              style={{ background: 'var(--md-surface-3)', boxShadow: 'var(--md-shadow-3)' }}
            >
              {FEEDS.map((f) => (
                <li key={f}>
                  <button
                    onClick={() => { setSelected(f); setOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm ${
                      f === selected
                        ? 'text-[var(--md-primary)] bg-[var(--md-secondary-container)]'
                        : 'text-[var(--md-on-surface)]'
                    }`}
                  >
                    {f}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
