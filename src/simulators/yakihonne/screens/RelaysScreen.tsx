import React, { useState } from 'react';
import { OverlayHeader } from '../components/OverlayHeader';
import { GlobeIcon, SearchIcon, ChevronRightIcon } from '../components/icons';
import { yakiRelays } from '../data';

const TABS = ['Following', 'Network', 'Collections', 'Global'] as const;

function latencyColor(ms: number) {
  if (ms < 500) return 'var(--yh-green)';
  if (ms < 1000) return 'var(--yh-orange)';
  return 'var(--yh-red)';
}

export const RelaysScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Following');
  const showList = tab !== 'Following';

  return (
    <div className="absolute inset-0 z-[58] bg-[var(--yh-bg)] flex flex-col">
      <OverlayHeader title="Relay orbits" subtitle="Browse and explore relay feeds" onBack={onBack} logo />

      <div className="px-4">
        <div className="flex gap-5 pb-3">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-[16px] font-semibold ${tab === t ? 'text-[var(--yh-text)] bg-[var(--yh-surface-2)] px-3 py-1.5 rounded-lg' : 'text-[var(--yh-text-2)] py-1.5'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 rounded-2xl bg-[var(--yh-surface-2)] px-4 py-3.5 text-[var(--yh-text-2)]">
          <SearchIcon className="w-5 h-5" />
          <span className="text-[15px]">Search relay</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {!showList ? (
          <div className="flex flex-col items-center text-center pt-10">
            <GlobeIcon className="w-9 h-9 text-[var(--yh-text)]" />
            <div className="text-[18px] font-extrabold mt-3">Engage to expand</div>
            <p className="text-[15px] text-[var(--yh-text-2)] mt-2 leading-relaxed max-w-[280px]">
              Engaging with more users helps you discover new relays and grow your relay list for a richer, more connected experience.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-6">
            {yakiRelays.map((r) => (
              <div key={r.domain} className="rounded-xl border border-[var(--yh-divider)] bg-[var(--yh-surface)] p-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--yh-surface-2)] flex items-center justify-center"><GlobeIcon className="w-5 h-5 text-[var(--yh-text-2)]" /></div>
                  <span className="flex-1 text-[15px] font-semibold truncate">{r.domain}</span>
                  <span
                    className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ color: r.online ? 'var(--yh-green)' : 'var(--yh-red)', background: `color-mix(in srgb, ${r.online ? 'var(--yh-green)' : 'var(--yh-red)'} 12%, transparent)` }}
                  >
                    {r.online ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2.5 text-[13px] text-[var(--yh-text-2)]">
                  <span>Followed by {r.followedBy}</span>
                  <span>·</span>
                  <span style={{ color: latencyColor(r.latency) }}>{r.latency} ms</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--yh-divider)]">
                  <button className="text-[14px] font-semibold text-[var(--yh-orange)] flex items-center gap-1">Browse relay <ChevronRightIcon className="w-4 h-4" /></button>
                  <button className="text-[14px] font-medium text-[var(--yh-text-2)]">Share</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RelaysScreen;
