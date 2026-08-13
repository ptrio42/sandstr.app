import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import '../amethyst.theme.css';

/**
 * Browser — the globe destination in v1.13.1's bottom bar (upstream
 * `NavBarItem.BROWSER`, icon MaterialSymbols.Language, label string `browser`).
 * In v1.12.6 that slot held Discover; Discover still exists but moved to the
 * drawer's "Navigate" section.
 *
 * Reproduced from the reference recording: a full-width rounded address field
 * ("Search or enter address") with no avatar and no app bar above it, then the
 * purple section header "Discover web apps" over a directory of Nostr web
 * clients — name, one-line description, and a favourite star per row.
 *
 * The directory entries are the ones the recording actually lists, in its order.
 * Icons are drawn locally as tinted monograms: this simulator ships zero remote
 * requests, so real client artwork is out of scope (see docs/FIDELITY.md).
 */

type WebApp = { name: string; desc: string; mark: string; bg: string; fg: string; round?: boolean };

const APPS: WebApp[] = [
  { name: 'Primal', desc: 'All-in-one client with a built-in wallet', mark: '◗', bg: '#1E7BE8', fg: '#FFFFFF' },
  { name: 'Coracle', desc: 'Relay-savvy client for regular people', mark: '☾', bg: '#FFFFFF', fg: '#EB5E28' },
  { name: 'Snort', desc: 'Fast, feature-packed social client', mark: '✦', bg: '#5B2C6F', fg: '#E9D5FF' },
  { name: 'noStrudel', desc: 'Power-user client for exploring Nostr', mark: '▤', bg: '#7CB342', fg: '#3E2723' },
  { name: 'Iris', desc: 'Simple, fast social client', mark: '◉', bg: '#101014', fg: '#F97316', round: true },
  { name: 'Nostter', desc: 'Lightweight web social client', mark: '❊', bg: '#FFFFFF', fg: '#111111' },
  { name: 'Jumble', desc: 'Explore feeds relay by relay', mark: 'J', bg: '#FFFFFF', fg: '#111111' },
  { name: 'Nostria', desc: 'Social without the noise', mark: '☀', bg: '#F59E0B', fg: '#FFFFFF' },
  { name: 'Nosotros', desc: 'A weirdly fast social client', mark: 'n', bg: '#0B0B0F', fg: '#FFFFFF' },
  { name: 'lumilumi', desc: 'Lightweight Nostr client', mark: '●', bg: '#FFFFFF', fg: '#A855F7' },
  // The recording's list continues past this point (the next row, "Phoenix", is
  // clipped by the frame edge and its description is never legible), so it stops
  // here rather than inventing copy for a row we could not read.
];

export function BrowserScreen() {
  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]" data-tour="amethyst-browser">
      {/* Omnibox. Upstream shows no top app bar on this screen — the address
          field IS the header, edge to edge under the status bar. */}
      <div className="px-2 pt-2 shrink-0">
        <div
          className="w-full rounded-lg px-4 py-4 text-[15px] text-[var(--md-on-surface-variant)]"
          style={{ background: 'var(--md-surface-container-high)' }}
        >
          Search or enter address
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <p className="px-4 pt-4 pb-2 text-sm font-medium" style={{ color: 'var(--md-primary)' }}>
          Discover web apps
        </p>

        {APPS.map((a, i) => (
          <motion.button
            key={a.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="w-full flex items-center gap-4 px-4 py-2.5 text-left"
          >
            <span
              className={`w-9 h-9 shrink-0 flex items-center justify-center text-lg font-semibold ${a.round ? 'rounded-full' : 'rounded-lg'}`}
              style={{ background: a.bg, color: a.fg }}
              aria-hidden
            >
              {a.mark}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[17px] text-[var(--md-on-surface)] truncate">{a.name}</span>
              <span className="block text-sm text-[var(--md-on-surface-variant)] truncate">{a.desc}</span>
            </span>
            <Star className="w-6 h-6 shrink-0 text-[var(--md-on-surface)]" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
