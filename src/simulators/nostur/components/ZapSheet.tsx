import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { MockUser } from '../../../data/mock';
import { Avatar } from './Avatar';
import { Switch } from './Chrome';
import { DEFAULT_ZAP_AMOUNT, ZAP_AMOUNTS, compact, fiatForSats } from '../nosturData';

/**
 * "Send sats" — Zaps/ZapCustomizer/ZapCustomizer.swift.
 *
 * Sixteen ZapAmountButtons in a 4×4 grid: 75×75 circles filled `.orange` with a
 * 5 pt stroke (theme.background unselected, .orange selected) and 0.75 opacity
 * when unselected (ZapAmountButton.swift:21-23). Amount in white bold compact
 * notation with a fiat caption at white@75 %. The last cell is "Custom".
 *
 * 21 is preselected — SettingsStore.swift:203 `defaultZapAmount: 21`.
 */
export function ZapSheet({
  target,
  onClose,
  onSend,
}: {
  target: MockUser;
  onClose: () => void;
  onSend: (sats: number) => void;
}) {
  const [amount, setAmount] = useState(DEFAULT_ZAP_AMOUNT);
  const [remember, setRemember] = useState(false);
  const [privateZap, setPrivateZap] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

  return (
    <div
      className="absolute inset-0 z-[80] flex flex-col"
      style={{ background: 'var(--nostur-list-bg)' }}
      role="dialog"
      aria-label="Send sats"
      data-tour="nostur-zapsheet"
    >
      <div className="flex shrink-0 items-center px-3 py-2" style={{ minHeight: 44 }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cancel"
          style={{ color: 'var(--nostur-accent)' }}
        >
          <X className="h-6 w-6" />
        </button>
        <span className="flex-1 text-center text-[17px] font-bold">Send sats</span>
        <span className="w-6" />
      </div>

      <div className="nostur-scroll px-5 pb-5">
        <div className="grid grid-cols-4 gap-3">
          {ZAP_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              className="nostur-coin"
              aria-selected={amount === a}
              onClick={() => setAmount(a)}
            >
              <span>{compact(a)}</span>
              <span className="nostur-coin-fiat">{fiatForSats(a)}</span>
            </button>
          ))}
          <button
            type="button"
            className="nostur-coin"
            aria-selected={false}
            onClick={() => setAmount(21)}
          >
            <span className="text-[11px]">Custom</span>
          </button>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Avatar seed="demo-account" size={40} />
          <input
            className="min-w-0 flex-1 bg-transparent text-[16px] outline-none"
            placeholder="Add public note (optional)"
            style={{ color: 'var(--nostur-primary)' }}
          />
        </div>

        <button
          type="button"
          onClick={() => onSend(amount)}
          className="mt-5 w-full rounded-xl py-3 text-[16px] font-semibold"
          style={{ background: 'var(--nostur-accent)', color: 'var(--nostur-on-accent)' }}
        >
          Send {amount.toLocaleString('en-US')} sats to {target.displayName}
        </button>

        <div className="mt-5 space-y-1">
          {[
            ['Remember this amount for all zaps', remember, setRemember] as const,
            ['Private zap', privateZap, setPrivateZap] as const,
            ['Send anonymously', anonymous, setAnonymous] as const,
          ].map(([label, value, set]) => (
            <div key={label} className="flex items-center justify-between py-1.5">
              <span className="text-[16px]">{label}</span>
              <Switch checked={value} onChange={set} label={label} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ZapSheet;
