import React from 'react';
import type { MockRelay } from '../../../data/mock';
import { BitcoinBadge } from './icons';

interface Props {
  relays: MockRelay[];
  /** True when this relay's notes are SHOWN — the toggle's ON state. */
  isShown: (url: string) => boolean;
  onToggle: (url: string) => void;
  onClose: () => void;
}

/**
 * The Universe funnel's `.filter` sheet — Damus's only path to "one relay's feed".
 *
 * There is no per-relay timeline anywhere in the app: you narrow the CURRENT feed
 * with one toggle per relay, so leaving a single toggle on is how you read just
 * that relay. `docs/refs/damus/screen-map.md` §6a carries the recon.
 *
 * `absolute`, not `fixed`. Overlays here are siblings of `.damus-content` inside
 * the simulator root, which is the containing block — see the CLAUDE.md gotcha
 * about `fixed` escaping the phone screen.
 */
export const RelayFilterSheet: React.FC<Props> = ({ relays, isShown, onToggle, onClose }) => (
  <div className="absolute inset-0 z-[60] flex flex-col justify-end" data-tour="damus-relay-filter">
    {/* Tapping the scrim dismisses, like any SwiftUI sheet. */}
    <button
      type="button"
      aria-label="Dismiss relay filter"
      onClick={onClose}
      className="absolute inset-0 bg-black/40"
    />

    {/*
      550pt detent out of an 812pt screen ≈ 68% — a mid-height sheet, not a full
      one. Upstream: `.presentationDetents([.height(550)])`.
    */}
    <div
      className="relative flex flex-col rounded-t-2xl bg-[var(--damus-bg)] shadow-2xl"
      style={{ height: '68%' }}
    >
      {/* `.presentationDragIndicator(.visible)` — the grabber is part of the spec. */}
      <div className="shrink-0 pt-2.5 pb-1 flex justify-center">
        <div className="w-9 h-1.5 rounded-full bg-[var(--damus-text-tertiary)]" />
      </div>

      {/*
        Verbatim from RelayFilterView, including the trailing colon. 20pt top /
        0 bottom padding is the upstream figure, not a guess.
      */}
      <p className="shrink-0 px-4 pt-5 pb-0 text-[17px] leading-snug text-[var(--damus-text)]">
        Please choose relays from the list below to filter the current feed:
      </p>

      <div className="flex-1 overflow-y-auto mt-3">
        {relays.map((r, i) => {
          const on = isShown(r.url);
          return (
            <div
              key={r.id}
              // One anchored row, gated on the index — the repeatable-row pattern
              // from docs/TOURS.md. The ring has to land on a toggle, not the list.
              data-tour={i === 0 ? 'damus-relay-toggle' : undefined}
              className="flex items-center gap-3 px-4 py-3 border-b border-[var(--damus-separator)]"
            >
              {/*
                Status dot, then the paid badge — RelayToggle's leading order.
                Literal hexes, not tokens: there is no `--damus-success`, and the
                first version used one, so every "online" dot rendered with an
                invalid colour and vanished. These are the §1 dark values, the
                same ones `.damus-pill.online` / `.error` carry.
              */}
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: r.isOnline ? '#03BF64' : '#F8206E' }}
              />
              {r.isPaid && <BitcoinBadge className="w-4 h-4 shrink-0" />}

              {/*
                The FULL url (`relay_id.absoluteString`), scheme included — the §8
                relay rows show the bare host, this one does not.
              */}
              <span className="flex-1 min-w-0 truncate text-[16px] text-[var(--damus-text)]">
                {r.url}
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`Show notes from ${r.url}`}
                onClick={() => onToggle(r.url)}
                className="shrink-0 w-[51px] h-[31px] rounded-full transition-colors relative"
                style={{ background: on ? 'var(--damus-purple)' : 'var(--damus-bg-tertiary)' }}
              >
                <span
                  className="absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow transition-all"
                  style={{ left: on ? '22px' : '2px' }}
                />
              </button>
            </div>
          );
        })}
        <div className="h-6" />
      </div>
    </div>
  </div>
);
