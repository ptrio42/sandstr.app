import React, { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { SearchIcon, XIcon } from '../components/icons';

const TABS = ['People', 'Notes', 'Articles', 'Media'] as const;

interface Person { name: string; seed: string; handle: string; validated: boolean; }

const people: Person[] = [
  { name: 'Block Bulletin (NewsBot)', seed: 'blockbulletin', handle: 'blockbulletin@news.example', validated: true },
  { name: 'UTXOwl', seed: 'utxowl', handle: 'bashfulopera44@wallet.example', validated: false },
  { name: 'UTXOz ⚡', seed: 'utxoz', handle: 'utxoz@cypherflow.ai', validated: true },
  { name: 'RT International (NewsBot)', seed: 'rtintl', handle: 'rt@utxo.one', validated: true },
  { name: 'rektbot', seed: 'rektbot', handle: 'rektbot@utxo.one', validated: true },
  { name: "utxo's bot", seed: 'utxobot', handle: 'bot@utxo.one', validated: false },
  { name: 'UTXO Alien', seed: 'utxoalien', handle: 'UTXOalien@nostrplebs.com', validated: false },
  { name: 'utxo the webmaster 🧑‍💻', seed: 'utxoweb', handle: 'utxo@utxo.one', validated: true },
  { name: 'Tom\'s Hardware (NewsBot)', seed: 'tomshw', handle: 'tomshardware@utxo.one', validated: true },
  { name: 'UTXO Dreams', seed: 'utxodreams', handle: 'dreams@utxo.one', validated: false },
];

interface Props {
  onBack: () => void;
  onViewProfile: (seed: string, name: string) => void;
}

export const SearchScreen: React.FC<Props> = ({ onBack, onViewProfile }) => {
  const [tab, setTab] = useState<(typeof TABS)[number]>('People');
  const [q, setQ] = useState('utxo');

  return (
    <div className="absolute inset-0 z-[56] bg-[var(--yh-bg)] flex flex-col" data-tour="yakihonne-search">
      {/* search bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5 rounded-full bg-[var(--yh-surface-2)] px-4 py-3">
          <SearchIcon className="w-5 h-5 text-[var(--yh-text-2)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            autoFocus
            className="flex-1 bg-transparent outline-none text-[16px] text-[var(--yh-text)] placeholder:text-[var(--yh-text-2)]"
          />
          <button onClick={q ? () => setQ('') : onBack} aria-label="Clear"><XIcon className="w-5 h-5 text-[var(--yh-text-2)]" /></button>
        </div>
      </div>

      {/* tabs */}
      <div className="flex gap-2.5 px-4 pb-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded-lg text-[15px] font-semibold ${tab === t ? 'bg-[var(--yh-surface-2)] text-[var(--yh-text)]' : 'text-[var(--yh-text-2)]'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'People' ? (
          people.map((p) => (
            <button key={p.seed} onClick={() => onViewProfile(p.seed, p.name)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left">
              <Avatar seed={p.seed} className="w-11 h-11" rounded="rounded-full" />
              <div className="min-w-0">
                <div className="text-[16px] font-bold truncate">{p.name}</div>
                {/* NIP-05 validation is COLOR-encoded: validated → red handle, else muted grey */}
                <div className={`text-[14px] truncate ${p.validated ? 'text-[var(--yh-red)]' : 'text-[var(--yh-text-2)]'}`}>{p.handle}</div>
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center text-[var(--yh-text-2)]">
            <SearchIcon className="w-8 h-8" />
            <div className="text-[16px] font-semibold mt-3 text-[var(--yh-text)]">Search in Nostr</div>
            <div className="text-[14px]">Find people and content</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;
