import { createContext, useContext } from 'react';

/**
 * Toast bridge, scoped to this simulator.
 *
 * Several controls across the client are "copy" buttons — the profile's npub and
 * nprofile, the wallet's on-chain address, the remote signer's bunker URI — and
 * the ledger's fix for every one of them is "handler + the host's existing
 * showToast" (gaps ame-47, ame-143). Prop-drilling one callback through five
 * screens for that is churn; a context scoped to `src/simulators/amethyst/` is
 * not, and it keeps `AmethystSimulator.tsx` to a single new line, which matters
 * while another session is editing the same file.
 *
 * NOTHING HERE TOUCHES THE CLIPBOARD, deliberately. A mock bitcoin address that a
 * visitor could paste somewhere real is a worse outcome than a button that
 * explains itself, and the same reasoning that keeps a fake nsec out of Backup
 * Keys applies to every other copy path (`shared/utils/keySafety.ts`).
 */
export type AmethystToast = (message: string, type?: 'success' | 'error' | 'info') => void;

export const AmethystToastContext = createContext<AmethystToast | null>(null);

/** Never throws: a card rendered outside the provider simply gets a no-op. */
export function useAmethystToast(): AmethystToast {
  return useContext(AmethystToastContext) ?? (() => {});
}
