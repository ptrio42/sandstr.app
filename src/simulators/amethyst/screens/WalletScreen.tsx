import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Copy, Send, Info, Wallet as WalletIcon, Link2 } from 'lucide-react';
import { useAmethystToast } from '../toast';
import '../amethyst.theme.css';

/**
 * Wallet — new in v1.13.1 and, per upstream's `DefaultBottomBarItems`, the third
 * destination in the shipped bottom bar. Reproduced from the reference recording
 * (tab-root variant): a plain left-aligned "Wallet" title with a "+" action (no
 * avatar and no search here, unlike the feed top bars), an orange-outlined
 * on-chain Bitcoin card, and the NWC empty state underneath.
 *
 * The balance genuinely renders a spinner before it resolves in the recording;
 * the resolved state ("0 sats") is what we paint, because preview environments
 * freeze entry animations and a permanent spinner would read as broken.
 */
export function WalletScreen() {
  const toast = useAmethystToast();
  // `+` in the app bar and "Add NWC Connection" reach the same wallet-type
  // chooser upstream (`WalletScreen.kt`) — gaps ame-140/ame-141.
  const [addOpen, setAddOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]" data-tour="amethyst-wallet">
      <div className="md-app-bar md-app-bar-enhanced">
        <h1 className="flex-1 text-[22px] text-[var(--md-on-surface)] pl-2">Wallet</h1>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          aria-label="Add wallet"
          data-tour="amethyst-wallet-add"
          className="md-app-bar-icon-btn"
        >
          <Plus className="w-6 h-6 text-[var(--md-on-surface)]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* On-chain card — the one place in Amethyst that is bitcoin-orange
            end to end: 1px orange border, warm near-black fill, orange numerals. */}
        <div
          className="mx-4 mt-3 rounded-2xl p-3.5"
          style={{ border: '1px solid var(--bitcoin-orange)', background: 'rgba(247, 147, 26, 0.06)' }}
        >
          <div className="flex items-start gap-2">
            <div
              className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-black"
              style={{ background: 'var(--bitcoin-orange)' }}
            >
              ₿
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[var(--md-on-surface)]">Bitcoin</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container-high)]">
                  <Info className="w-3 h-3" /> Public
                </span>
              </div>
              <p className="text-sm text-[var(--md-on-surface-variant)] mt-1">Onchain · Taproot</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold leading-none" style={{ color: 'var(--bitcoin-orange)' }}>0</p>
              <p className="text-sm text-[var(--md-on-surface-variant)]">sats</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              onClick={() => toast('Simulation: nothing was copied. A mock on-chain address you could paste somewhere real would be worse than none.')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-[var(--md-on-surface)]"
              style={{ border: '1px solid var(--md-outline)' }}
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
            <button
              type="button"
              onClick={() => setSendOpen(true)}
              data-tour="amethyst-wallet-send"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black"
              style={{ background: 'var(--bitcoin-orange)' }}
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </div>

        {/* NWC empty state, vertically centred in the space under the card */}
        <div className="flex flex-col items-center text-center px-8 pt-32">
          <p className="text-2xl font-bold text-[var(--md-on-surface)]">No wallets connected</p>
          <p className="text-[15px] text-[var(--md-on-surface-variant)] mt-3 leading-relaxed">
            Connect one or more NWC wallets to send and receive payments.
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setAddOpen(true)}
            data-tour="amethyst-wallet-nwc"
            className="mt-7 flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold"
            style={{ background: 'var(--md-primary)', color: 'var(--md-on-primary)' }}
          >
            <Plus className="w-5 h-5" /> Add NWC Connection
          </motion.button>
        </div>
      </div>

      {/* Wallet-type chooser. The FAQ's `connect-wallet` answer walks the reader
          through exactly these steps, so the destination has to exist. */}
      {addOpen && (
        <div className="fixed inset-0 z-[140] flex items-end" onClick={() => setAddOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-label="Add a wallet"
            data-tour="amethyst-wallet-add-sheet"
            className="relative w-full rounded-t-3xl px-5 pt-4 pb-5"
            style={{ background: 'var(--md-surface-container-high)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-[var(--md-on-surface)]">Add a wallet</p>
            <div className="mt-3 space-y-1">
              {[
                { Icon: Link2, title: 'Connect a Lightning wallet (NWC)', body: 'Scan its QR or paste a nostr+walletconnect:// URI.' },
                { Icon: WalletIcon, title: 'Watch an on-chain address', body: 'Follow a balance without holding the key.' },
              ].map((row) => (
                <div key={row.title} className="flex items-start gap-3 py-2">
                  <row.Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--md-primary)' }} />
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--md-on-surface)]">{row.title}</p>
                    <p className="text-sm text-[var(--md-on-surface-variant)]">{row.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--amethyst-placeholder)' }}>
              Simulation: both paths end at a real wallet connection, and this reproduction has neither
              network nor keys. Nothing you paste here would be used.
            </p>
          </div>
        </div>
      )}

      {/* Send. The screen map documents the button, not the destination, so this
          is the minimum honest shape: amount, address, and a plain refusal. */}
      {sendOpen && (
        <div className="fixed inset-0 z-[140] flex items-end" onClick={() => setSendOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-label="Send"
            className="relative w-full rounded-t-3xl px-5 pt-4 pb-5"
            style={{ background: 'var(--md-surface-container-high)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-[var(--md-on-surface)]">Send</p>
            <p className="text-sm mt-2 leading-relaxed text-[var(--md-on-surface-variant)]">
              The real screen asks for an amount and a destination address, then signs the transaction
              with your on-chain key.
            </p>
            <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--amethyst-placeholder)' }}>
              Simulation: this wallet holds 0 sats and no key, so there is nothing to send and no form
              worth filling in. Reproducing one would only teach the wrong habit.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
