import React from 'react';
import { Avatar } from '../components/Avatar';
import {
  ChevronDownIcon, QrIcon, CopyIcon, ArrowUpIcon, ZapIcon, ChevronRightIcon,
} from '../components/icons';

interface Tx {
  dir: 'in' | 'out';
  sats: number;
  who: string;
  when: string;
}

const txs: Tx[] = [
  { dir: 'in', sats: 210, who: 'Zap Cooking', when: 'Today' },
  { dir: 'in', sats: 1000, who: 'Marina', when: 'Yesterday' },
  { dir: 'out', sats: 21, who: 'FeynStructure', when: 'Yesterday' },
  { dir: 'in', sats: 5000, who: 'Zapmail', when: '3 days ago' },
  { dir: 'out', sats: 500, who: 'sandy', when: '4 days ago' },
];

interface Props {
  currentUserSeed: string;
  balance: number;
  onOpenDrawer: () => void;
}

const DownArrow = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 12l6 6 6-6" /></svg>
);

export const WalletScreen: React.FC<Props> = ({ currentUserSeed, balance, onOpenDrawer }) => (
  <div className="min-h-full">
    <header className="flex items-center justify-between px-3.5 pt-3.5 pb-2">
      <button onClick={onOpenDrawer} aria-label="Menu">
        <Avatar seed={currentUserSeed} className="w-9 h-9" rounded="rounded-full" />
      </button>
      <span className="text-[18px] font-bold">Wallet</span>
      <button className="yakihonne-appbar-chip" aria-label="Scan"><QrIcon className="w-5 h-5" /></button>
    </header>

    <div className="px-4 pt-2">
      {/* selected wallet */}
      <button className="w-full flex items-center justify-center gap-2 py-2 text-[15px] font-semibold text-[var(--yh-text)]">
        <ZapIcon filled className="w-4 h-4 text-[var(--yh-orange)]" /> Wallet of Satoshi
        <ChevronDownIcon className="w-4 h-4 text-[var(--yh-text-2)]" />
      </button>

      {/* balance card */}
      <div className="mt-2 rounded-3xl bg-[var(--yh-surface)] border border-[var(--yh-divider)] px-5 py-6 text-center">
        <div className="text-[12px] font-semibold tracking-[0.14em] text-[var(--yh-text-2)]">BALANCE</div>
        <div className="mt-1 flex items-center justify-center gap-1.5">
          <ZapIcon filled className="w-6 h-6 text-[var(--yh-orange)]" />
          <span className="text-[44px] leading-none font-extrabold text-[var(--yh-orange)]">{balance.toLocaleString()}</span>
        </div>
        <div className="text-[13px] text-[var(--yh-text-2)] mt-1">sats</div>
        <button className="mt-1 inline-flex items-center gap-1 text-[15px] text-[var(--yh-text)]">
          ${(balance * 0.0006).toFixed(2)} <ChevronDownIcon className="w-4 h-4 text-[var(--yh-text-2)]" />
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-[13px] text-[var(--yh-text-2)]">
          <span className="truncate">sandy@wallet.example</span>
          <button className="inline-flex items-center gap-1 text-[var(--yh-orange)] font-medium"><CopyIcon className="w-4 h-4" />Copy LN</button>
        </div>
      </div>

      {/* actions */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[var(--yh-surface)] border border-[var(--yh-divider)] font-semibold">
          <DownArrow className="w-5 h-5" /> Receive
        </button>
        <button className="yakihonne-btn-orange flex items-center justify-center gap-2 py-3.5">
          <ArrowUpIcon className="w-5 h-5" /> Send
        </button>
      </div>

      {/* transactions */}
      <div className="mt-6 mb-24">
        <div className="text-[15px] font-bold mb-1.5">Transactions</div>
        {txs.map((t, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-[var(--yh-divider)]">
            <span className={`w-10 h-10 rounded-full flex items-center justify-center ${t.dir === 'in' ? 'text-[var(--yh-green)] bg-[color-mix(in_srgb,var(--yh-green)_14%,transparent)]' : 'text-[var(--yh-red)] bg-[color-mix(in_srgb,var(--yh-red)_14%,transparent)]'}`}>
              {t.dir === 'in' ? <DownArrow className="w-5 h-5" /> : <ArrowUpIcon className="w-5 h-5" />}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold">{t.dir === 'in' ? 'Received' : 'Sent'}</div>
              <div className="text-[13px] text-[var(--yh-text-2)] truncate">{t.who} · {t.when}</div>
            </div>
            <div className={`text-[15px] font-bold ${t.dir === 'in' ? 'text-[var(--yh-green)]' : 'text-[var(--yh-text)]'}`}>
              {t.dir === 'in' ? '+' : '-'}{t.sats.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default WalletScreen;
