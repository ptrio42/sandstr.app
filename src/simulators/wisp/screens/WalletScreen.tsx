import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardPaste,
  Copy,
  Image,
  KeyRound,
  QrCode,
  RefreshCw,
  Settings,
  X,
  Zap,
} from 'lucide-react';
import type { WalletScreenProps } from '../types';
import { hashSeed } from '../wispData';

/**
 * Wallet screen (screen-map §12): *Spark + Breez wallet home — Nostr-key
 * banner, tappable balance (sats → fiat → hidden; Fiat Mode OFF so sats is
 * default, §18), lightning-address pill, Send/Receive circles with bottom
 * sheets, RECENT tx footer, and the wallet detail/settings view.
 */

const LIGHTNING_ADDRESS = 'onyxocelot36@breez.example';

type BalanceMode = 'sats' | 'fiat' | 'hidden';
type WalletView = 'home' | 'detail';
type SheetKind = 'send' | 'receive' | null;

const SHEET_BOX_BG = 'rgba(44,44,46,0.4)'; /* --wisp-surface-variant @40% */

/** "*Spark" + "Breez" wordmarks — Spark bold with the asterisk, Breez italic. */
function BrandWordmark() {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-base font-bold">*Spark</span>
      <span className="text-xs text-[var(--wisp-on-surface-variant)]">+</span>
      <span className="text-base font-semibold italic">Breez</span>
    </span>
  );
}

interface TxRowProps {
  direction: 'in' | 'out';
  label: string;
  time: string;
  amount: string;
}

function TxRow({ direction, label, time, amount }: TxRowProps) {
  const incoming = direction === 'in';
  const tint = incoming ? 'var(--wisp-income)' : 'var(--wisp-error)';
  const circleBg = incoming ? 'rgba(46,125,50,0.1)' : 'rgba(255,59,48,0.1)';
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
        style={{ background: circleBg }}
      >
        {incoming ? (
          <ArrowDown size={20} style={{ color: tint }} />
        ) : (
          <ArrowUp size={20} style={{ color: tint }} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm">{label}</div>
        <div className="text-xs text-[var(--wisp-on-surface-variant)]">{time}</div>
      </div>
      <div className="text-right">
        <div className="text-base font-semibold" style={{ color: tint }}>
          {amount}
        </div>
        <div className="text-xs text-[var(--wisp-on-surface-variant)]">sats</div>
      </div>
    </div>
  );
}

export function WalletScreen({ currentUser }: WalletScreenProps) {
  const [view, setView] = useState<WalletView>('home');
  const [balanceMode, setBalanceMode] = useState<BalanceMode>('sats');
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [sendInput, setSendInput] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('0');
  const [expiry, setExpiry] = useState<'1 hour' | '24 hours' | 'Custom'>('1 hour');
  const [copied, setCopied] = useState(false);

  // Deterministic relative times for the RECENT rows.
  const seed = hashSeed(currentUser.pubkey);
  const receivedAgo = `${(seed % 5) + 1}h`;
  const sentAgo = `${((seed >> 3) % 3) + 1}d`;

  const cycleBalance = () => {
    setBalanceMode((m) => (m === 'sats' ? 'fiat' : m === 'fiat' ? 'hidden' : 'sats'));
  };

  const handleCopy = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const sendReady = sendInput.trim().length > 0;

  const renderHome = () => (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {/* Top row: brand + refresh/settings */}
      <div className="flex h-12 shrink-0 items-center px-4">
        <BrandWordmark />
        <div className="ml-auto flex items-center gap-3 text-[var(--wisp-on-surface-variant)]">
          <button type="button" aria-label="Refresh" className="grid place-items-center">
            <RefreshCw size={22} />
          </button>
          <button
            type="button"
            aria-label="Wallet settings"
            className="grid place-items-center"
            onClick={() => setView('detail')}
          >
            <Settings size={22} />
          </button>
        </div>
      </div>

      {/* Nostr-key backup banner */}
      <div className="mx-4 flex items-center gap-3 rounded-xl bg-[var(--wisp-surface-variant)] p-3.5">
        <KeyRound size={28} className="shrink-0" style={{ color: 'var(--wisp-accent)' }} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Secured by your Nostr key</div>
          <div className="text-xs text-[var(--wisp-on-surface-variant)]">
            Restores on any device when you sign in. Tap to also save your seed phrase as a backup.
          </div>
        </div>
        <ChevronRight size={18} className="shrink-0 text-[var(--wisp-on-surface-variant)]" />
      </div>

      {/* Balance — tap cycles sats → fiat → hidden */}
      <button type="button" className="grid flex-1 place-items-center py-6" onClick={cycleBalance}>
        {balanceMode === 'sats' && (
          <span className="text-center">
            <span className="block text-5xl font-bold">0</span>
            <span className="mt-1 block text-sm text-[var(--wisp-on-surface-variant)]">sats</span>
          </span>
        )}
        {balanceMode === 'fiat' && (
          <span className="text-center">
            <span className="block text-5xl font-bold">$0.00</span>
          </span>
        )}
        {balanceMode === 'hidden' && (
          <span className="text-center">
            <span className="block text-5xl font-bold">* * * * *</span>
            <span className="mt-1 block text-xs text-[var(--wisp-on-surface-variant)]">
              Tap to reveal
            </span>
          </span>
        )}
      </button>

      {/* Lightning-address pill */}
      <div className="flex shrink-0 justify-center">
        <div className="flex items-center gap-1.5 rounded-full bg-[var(--wisp-surface-variant)] px-4 py-2">
          <Zap size={14} style={{ color: 'var(--wisp-accent)' }} />
          <span className="text-sm">{LIGHTNING_ADDRESS}</span>
        </div>
      </div>

      {/* Send / Receive */}
      <div className="mt-6 flex shrink-0 justify-center gap-10">
        <button
          type="button"
          className="flex flex-col items-center gap-2"
          onClick={() => setSheet('send')}
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[var(--wisp-accent)]">
            <ArrowUp size={28} className="text-white" />
          </span>
          <span className="text-sm font-medium text-[var(--wisp-on-surface-variant)]">Send</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-2"
          onClick={() => setSheet('receive')}
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[var(--wisp-accent)]">
            <ArrowDown size={28} className="text-white" />
          </span>
          <span className="text-sm font-medium text-[var(--wisp-on-surface-variant)]">Receive</span>
        </button>
      </div>

      {/* RECENT transactions footer */}
      <div className="mt-6 shrink-0 px-4 pb-3">
        <div className="flex items-center justify-between py-2">
          <span className="text-[11px] tracking-wide text-[var(--wisp-on-surface-variant)]">
            RECENT
          </span>
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-medium text-[var(--wisp-on-surface-variant)]"
          >
            View all
            <ChevronUp size={16} />
          </button>
        </div>
        <div className="wisp-divider" />
        <TxRow direction="in" label="Received" time={receivedAgo} amount="+210" />
        <TxRow direction="out" label="Sent" time={sentAgo} amount="−55" />
      </div>
    </div>
  );

  const renderDetail = () => (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-3 px-4">
        <button type="button" aria-label="Back" onClick={() => setView('home')}>
          <ArrowLeft size={22} />
        </button>
        <span className="text-xl font-bold">Wallet</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        {/* Address card */}
        <div className="flex items-center justify-between rounded-xl bg-[var(--wisp-surface-variant)] p-4">
          <span className="text-sm">{LIGHTNING_ADDRESS}</span>
          <button
            type="button"
            aria-label="Copy lightning address"
            className="text-[var(--wisp-on-surface-variant)]"
            onClick={handleCopy}
          >
            {copied ? <Check size={20} style={{ color: 'var(--wisp-accent)' }} /> : <Copy size={20} />}
          </button>
        </div>

        {/* QR Code / Change pills */}
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-[var(--wisp-outline)] px-5 py-2.5 text-sm font-medium"
            style={{ color: 'var(--wisp-accent)' }}
          >
            <QrCode size={16} style={{ color: 'var(--wisp-accent)' }} />
            QR Code
          </button>
          <button
            type="button"
            className="rounded-full border border-[var(--wisp-outline)] px-5 py-2.5 text-sm font-medium"
            style={{ color: 'var(--wisp-accent)' }}
          >
            Change
          </button>
        </div>

        <button type="button" className="py-3 text-sm" style={{ color: 'var(--wisp-error)' }}>
          Remove Lightning Address
        </button>

        {/* Wallet Info */}
        <div className="mt-4 text-base font-semibold">Wallet Info</div>
        <button
          type="button"
          className="mt-2 flex w-full items-center justify-between rounded-xl bg-[var(--wisp-surface-variant)] p-4"
        >
          <BrandWordmark />
          <ChevronDown size={18} className="text-[var(--wisp-on-surface-variant)]" />
        </button>

        {/* Security */}
        <div className="mt-5 text-base font-semibold">Security</div>
        <button
          type="button"
          className="mt-2 w-full rounded-full border border-[var(--wisp-outline)] py-2.5 text-sm font-medium"
          style={{ color: 'var(--wisp-accent)' }}
        >
          View Recovery Phrase
        </button>

        {/* Custody warning */}
        <div className="mt-5 rounded-xl bg-[var(--wisp-surface-variant)] p-4 text-sm text-[var(--wisp-on-surface-variant)]">
          IMPORTANT: Wisp never holds user funds. You manage your own wallet and are responsible
          for securing it properly.
        </div>

        {/* Disconnect */}
        <div className="mt-5 text-xs font-medium text-[var(--wisp-on-surface-variant)]">
          Disconnect Wallet
        </div>
        <button
          type="button"
          className="mt-2 flex w-full items-center gap-3 rounded-xl bg-[var(--wisp-surface-variant)] p-4"
          style={{ color: 'var(--wisp-error)' }}
        >
          <ArrowLeftRight size={18} />
          <span className="text-sm">Switch to a different wallet</span>
        </button>
        <div className="mt-2 text-xs text-[var(--wisp-on-surface-variant)]">
          Your default wallet is linked to your key and can always be restored. Switching connects
          a different wallet instead.
        </div>

        <div className="mt-6 text-center text-xs text-[var(--wisp-on-surface-variant)]">
          <div>Built on *Spark</div>
          <div>Breez SDK</div>
        </div>
      </div>
    </div>
  );

  const renderSendSheet = () => (
    <div className="absolute inset-x-0 bottom-0 z-30 rounded-t-2xl bg-[var(--wisp-surface)] p-5">
      <button
        type="button"
        aria-label="Close"
        className="absolute right-4 top-4 text-[var(--wisp-on-surface-variant)]"
        onClick={() => setSheet(null)}
      >
        <X size={20} />
      </button>
      <div className="text-center text-xl font-semibold">Send</div>
      <div className="mt-4 min-h-[100px] rounded-[14px] p-3" style={{ background: SHEET_BOX_BG }}>
        <textarea
          value={sendInput}
          onChange={(e) => setSendInput(e.target.value)}
          placeholder="Lightning address or invoice"
          className="h-full min-h-[76px] w-full resize-none bg-transparent text-[15px] outline-none placeholder:text-[var(--wisp-on-surface-variant)]"
        />
      </div>
      <div
        className="mt-3 flex items-center justify-center rounded-[14px] p-3"
        style={{ background: SHEET_BOX_BG }}
      >
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 text-sm font-medium"
          style={{ color: 'var(--wisp-accent)' }}
        >
          <QrCode size={18} />
          Scan QR
        </button>
        <div className="h-6 w-px shrink-0" style={{ background: 'var(--wisp-outline)' }} />
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 text-sm font-medium"
          style={{ color: 'var(--wisp-accent)' }}
        >
          <ClipboardPaste size={18} />
          Paste
        </button>
        <div className="h-6 w-px shrink-0" style={{ background: 'var(--wisp-outline)' }} />
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 text-sm font-medium"
          style={{ color: 'var(--wisp-accent)' }}
        >
          <Image size={18} />
          Gallery
        </button>
      </div>
      <button
        type="button"
        disabled={!sendReady}
        onClick={() => setSheet(null)}
        className="mt-4 h-[52px] w-full rounded-[14px] text-[15px] font-semibold"
        style={
          sendReady
            ? { background: 'var(--wisp-accent)', color: 'var(--wisp-on-accent)' }
            : { background: SHEET_BOX_BG, color: 'var(--wisp-on-surface-variant)' }
        }
      >
        Next
      </button>
    </div>
  );

  const renderReceiveSheet = () => (
    <div className="absolute inset-x-0 bottom-0 z-30 rounded-t-2xl bg-[var(--wisp-surface)] p-5">
      <button
        type="button"
        aria-label="Close"
        className="absolute right-4 top-4 text-[var(--wisp-on-surface-variant)]"
        onClick={() => setSheet(null)}
      >
        <X size={20} />
      </button>
      <div className="text-center text-xl font-semibold">Receive</div>
      <div className="mt-4 text-xs font-semibold tracking-wide text-[var(--wisp-on-surface-variant)]">
        AMOUNT
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <input
          value={receiveAmount}
          onChange={(e) => setReceiveAmount(e.target.value.replace(/[^0-9]/g, '') || '0')}
          inputMode="numeric"
          className="w-full min-w-0 flex-1 bg-transparent text-4xl font-bold outline-none"
          aria-label="Amount in sats"
        />
        <span className="shrink-0 text-sm text-[var(--wisp-on-surface-variant)]">sats</span>
      </div>
      <div className="mt-4 text-xs font-semibold tracking-wide text-[var(--wisp-on-surface-variant)]">
        EXPIRES
      </div>
      <div className="mt-2 flex gap-2">
        {(['1 hour', '24 hours', 'Custom'] as const).map((opt) => {
          const selected = expiry === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setExpiry(opt)}
              className="flex-1 rounded-full border px-3 py-2 text-sm"
              style={
                selected
                  ? {
                      background: 'rgba(255,152,0,0.12)',
                      borderColor: 'var(--wisp-accent)',
                      color: 'var(--wisp-accent)',
                    }
                  : { borderColor: 'var(--wisp-outline)' }
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setSheet(null)}
        className="mt-5 h-[52px] w-full rounded-[14px] text-[15px] font-semibold"
        style={{ background: 'var(--wisp-accent)', color: 'var(--wisp-on-accent)' }}
      >
        Create invoice
      </button>
    </div>
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col" data-tour="wisp-wallet">
      {view === 'home' ? renderHome() : renderDetail()}

      {sheet && (
        <button
          type="button"
          aria-label="Dismiss"
          className="absolute inset-0 z-20 cursor-default"
          onClick={() => setSheet(null)}
        />
      )}
      {sheet === 'send' && renderSendSheet()}
      {sheet === 'receive' && renderReceiveSheet()}
    </div>
  );
}
