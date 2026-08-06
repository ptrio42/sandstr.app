import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Eye, Zap } from 'lucide-react';
import type { ZapDialogProps } from '../types';
import { ZAP_PRESETS, formatGrouped, formatShort } from '../wispData';
import { WispAvatar } from './Avatar';

type ZapPrivacy = 'Public' | 'Anonymous' | 'Private';

const PRIVACY_OPTIONS: ZapPrivacy[] = ['Public', 'Anonymous', 'Private'];

/** Hard cap per screen-map §12 — the real client refuses zaps above 1M sats. */
const ZAP_CAP = 1_000_000;

/**
 * ZapDialog — screen-map §12, SATS mode (Fiat Mode ships OFF per §18).
 * Bottom sheet rendered in its final state; success plays the accent ring
 * (.wisp-zap-ring, 1.1s) before handing the amount back to the shell.
 */
export function ZapDialog({ author, onClose, onZap }: ZapDialogProps) {
  const [amount, setAmount] = useState<number>(ZAP_PRESETS[0]);
  const [selected, setSelected] = useState<number | 'custom'>(ZAP_PRESETS[0]);
  const [customText, setCustomText] = useState('');
  const [message, setMessage] = useState('');
  const [privacy, setPrivacy] = useState<ZapPrivacy>('Public');
  const [privacyMenuOpen, setPrivacyMenuOpen] = useState(false);
  const [zapping, setZapping] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const pickPreset = (sats: number) => {
    setSelected(sats);
    setAmount(sats);
  };

  const pickCustom = () => {
    setSelected('custom');
    if (customText) setAmount(Math.min(parseInt(customText, 10), ZAP_CAP));
  };

  const onCustomChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    setCustomText(digits);
    setSelected('custom');
    setAmount(digits ? Math.min(parseInt(digits, 10), ZAP_CAP) : 0);
  };

  const fireZap = () => {
    if (zapping) return;
    setZapping(true);
    timerRef.current = window.setTimeout(() => onZap(amount), 1100);
  };

  return (
    <div className="absolute inset-0 z-[60]">
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={onClose} />

      {/* Bottom sheet — final state, no entry animation */}
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-[var(--wisp-surface)] px-5 pt-3 pb-6" data-tour="wisp-zap">
        {/* 1. Drag handle */}
        <div className="mx-auto h-1 w-9 rounded-full bg-[var(--wisp-outline)]" />

        {/* 2. Toolbar */}
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            className="rounded-full border px-[18px] py-2 text-sm"
            style={{ borderColor: 'rgba(56,56,58,0.4)' }}
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="rounded-full border px-[18px] py-2 text-sm text-[var(--wisp-accent)]"
            style={{ borderColor: 'rgba(255,152,0,0.45)' }}
          >
            Presets
          </button>
        </div>

        {/* 3. Recipient */}
        <div className="mt-4 flex items-center gap-3">
          <WispAvatar seed={author.username} className="h-8 w-8" />
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold">{author.displayName}</div>
            {author.lightningAddress && (
              <div className="truncate text-[12px] text-[var(--wisp-on-surface-variant)]">
                {author.lightningAddress}
              </div>
            )}
          </div>
        </div>

        {/* 4. Hero amount */}
        <div className="mt-4 text-center">
          <div className="text-[56px] font-bold leading-none text-[var(--wisp-accent)]">
            {formatGrouped(amount)}
          </div>
          <div
            className="mt-1 text-[14px] font-medium"
            style={{ color: 'var(--wisp-accent)', opacity: 0.75 }}
          >
            sats
          </div>
        </div>

        {/* 5. Preset strip */}
        <div className="mt-4 flex flex-wrap gap-2">
          {ZAP_PRESETS.map((sats) => (
            <button
              key={sats}
              type="button"
              onClick={() => pickPreset(sats)}
              className={
                selected === sats
                  ? 'rounded-full bg-[var(--wisp-accent)] px-4 py-2 text-sm font-semibold text-white'
                  : 'rounded-full bg-[var(--wisp-surface-variant)] px-4 py-2 text-sm text-[var(--wisp-on-bg)]'
              }
            >
              {formatShort(sats)}
            </button>
          ))}
          <button
            type="button"
            onClick={pickCustom}
            className={
              selected === 'custom'
                ? 'rounded-full bg-[var(--wisp-accent)] px-4 py-2 text-sm font-semibold text-white'
                : 'rounded-full bg-[var(--wisp-surface-variant)] px-4 py-2 text-sm text-[var(--wisp-on-bg)]'
            }
          >
            Custom
          </button>
        </div>

        {/* 6. Custom (sats) — outlined field with floating label */}
        <div className="relative mt-4">
          <span className="absolute -top-2 left-3 bg-[var(--wisp-surface)] px-1 text-xs text-[var(--wisp-accent)]">
            Custom (sats)
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={customText}
            onChange={(e) => onCustomChange(e.target.value)}
            className="w-full rounded-lg border border-[var(--wisp-accent)] bg-transparent px-3 py-2.5 text-[15px] outline-none"
            aria-label="Custom (sats)"
          />
        </div>

        {/* 7. Message — filled field */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message (optional)"
          className="mt-3 w-full rounded-lg bg-[var(--wisp-surface-variant)] px-3 py-2.5 text-[15px] outline-none placeholder:text-[var(--wisp-on-surface-variant)]"
        />

        {/* 8. Privacy row + dropdown */}
        <div className="relative mt-3">
          {privacyMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-xl border border-[var(--wisp-outline)] bg-[var(--wisp-surface-variant)] py-1">
              {PRIVACY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setPrivacy(option);
                    setPrivacyMenuOpen(false);
                  }}
                  className="block w-full px-3 py-2.5 text-left"
                >
                  <span
                    className={
                      option === privacy
                        ? 'text-[15px] text-[var(--wisp-accent)]'
                        : 'text-[15px]'
                    }
                  >
                    {option}
                  </span>
                  {option === 'Anonymous' && (
                    <span className="mt-0.5 block text-[12px] text-[var(--wisp-on-surface-variant)]">
                      Recipient won&apos;t see your identity.
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={privacyMenuOpen}
            onClick={() => setPrivacyMenuOpen((open) => !open)}
            className="flex w-full items-center gap-2 rounded-xl bg-[var(--wisp-surface-variant)] px-3 py-2.5"
          >
            <Eye size={18} className="shrink-0 text-[var(--wisp-on-surface-variant)]" />
            <span className="text-[15px]">{privacy}</span>
            <ChevronDown size={20} className="ml-auto shrink-0 text-[var(--wisp-on-surface-variant)]" />
          </button>
        </div>

        {/* 9. Zap button */}
        <button
          type="button"
                    onClick={fireZap}
          className="mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--wisp-accent)] text-[17px] font-bold text-white"
        >
          <Zap size={18} fill="white" className="text-white" />
          <span>Zap {formatGrouped(amount)} sats</span>
        </button>
      </div>

      {/* Success ring — 1.1s burst, then the shell gets onZap(amount) */}
      {zapping && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <div className="wisp-zap-ring h-[160px] w-[160px]" />
        </div>
      )}
    </div>
  );
}
