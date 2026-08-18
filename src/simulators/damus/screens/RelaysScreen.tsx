import React, { useState } from 'react';
import { mockRelays } from '../../../data/mock';
import type { MockRelay } from '../../../data/mock';
import { ChevronLeft, ChevronRight, PlusIcon, BitcoinBadge } from '../components/icons';

interface Props {
  /**
   * My Relays, owned by `relayState` instead of read straight from the mock
   * pool: a relay added here has to appear in the Universe `.filter` sheet, and
   * a screen-local slice of `mockRelays` could never show that.
   */
  relays: MockRelay[];
  onBack: () => void;
  onAddRelay: () => void;
}

type Status = 'online' | 'connecting' | 'error';
function statusFor(isOnline: boolean, i: number): Status {
  if (!isOnline) return 'error';
  if (i % 4 === 3) return 'connecting';
  if (i % 7 === 6) return 'error';
  return 'online';
}

export const RelaysScreen: React.FC<Props> = ({ relays: mine, onBack, onAddRelay }) => {
  const [seg, setSeg] = useState<'mine' | 'recommended'>('mine');
  // "Recommended" is still a static slice of the pool — it is a catalogue of
  // relays you have NOT added, so it does not come from My Relays (dam-31 covers
  // what is still wrong with that segment).
  const relays = seg === 'mine' ? mine : mockRelays.slice(0, 8);

  return (
    <div className="absolute inset-0 z-[52] flex flex-col bg-[var(--damus-bg)]" data-tour="damus-relays">
      <header className="flex items-center px-4 pt-3 pb-2">
        <button onClick={onBack} className="w-8"><ChevronLeft className="w-6 h-6 text-[var(--damus-text)]" /></button>
        <span className="flex-1 text-center font-bold text-[17px] text-[var(--damus-text)]">Relays</span>
        <button className="w-12 text-right text-[16px] text-[var(--damus-purple)]">Edit</button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="flex items-end justify-between px-4 pt-2 pb-1">
          <h1 className="text-[34px] font-extrabold text-[var(--damus-text)] leading-none">My&nbsp;Relays</h1>
          <button
            type="button"
            onClick={onAddRelay}
            data-tour="damus-add-relay-button"
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[var(--damus-bg-tertiary)] text-[15px] text-[var(--damus-text)]"
          >
            <PlusIcon className="w-4 h-4" /> Add relay
          </button>
        </div>

        <div className="mt-2">
          {relays.map((r, i) => {
            const st = statusFor(r.isOnline, i);
            const host = r.url.replace(/^wss?:\/\//, '');
            const letter = (r.name || host).replace(/[^A-Za-z]/, '').charAt(0).toUpperCase() || 'N';
            return (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--damus-separator)]">
                <div className="w-12 h-12 rounded-2xl bg-[var(--damus-bg-tertiary)] flex items-center justify-center text-[22px] font-bold text-[var(--damus-text)] shrink-0">
                  {letter}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[17px] text-[var(--damus-text)] truncate">{host}</span>
                    {r.isPaid && <BitcoinBadge className="w-4 h-4 shrink-0" />}
                  </div>
                  <div className="text-[14px] text-[var(--damus-text-secondary)] truncate">{r.url}</div>
                </div>
                <span className={`damus-pill ${st}`}>{st === 'online' ? 'Online' : st === 'connecting' ? 'Connecting' : 'Error'}</span>
                <ChevronRight className="w-4 h-4 text-[var(--damus-text-tertiary)] shrink-0" />
              </div>
            );
          })}
        </div>
        <div className="h-24" />
      </div>

      {/* segmented control */}
      <div className="flex justify-center py-3 border-t border-[var(--damus-separator)] bg-[var(--damus-bg)]">
        <div className="damus-segment">
          <button className={seg === 'mine' ? 'active' : ''} onClick={() => setSeg('mine')}>My relays</button>
          <button className={seg === 'recommended' ? 'active' : ''} onClick={() => setSeg('recommended')}>Recommended</button>
        </div>
      </div>
    </div>
  );
};

export default RelaysScreen;
