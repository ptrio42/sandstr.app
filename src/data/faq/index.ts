import type { ClientFaq } from './types';
import { damusFaq } from './damus';
import { amethystFaq } from './amethyst';
import { primalFaq } from './primal';
import { nosturFaq } from './nostur';

const faqs: Record<string, ClientFaq> = {
  damus: damusFaq,
  amethyst: amethystFaq,
  primal: primalFaq,
  nostur: nosturFaq,
};

// The coverage contract is enforced by types at compile time; this catches
// the one thing types can't — a coverage value naming an entry id that does
// not exist (typo, renamed entry). Dev-only, loud, zero production cost.
if (import.meta.env.DEV) {
  for (const faq of Object.values(faqs)) {
    for (const [topic, ref] of Object.entries(faq.coverage)) {
      if (ref !== 'n/a' && ref !== 'todo' && !faq.entries.some((e) => e.id === ref)) {
        console.error(
          `[faq] ${faq.clientId}: coverage['${topic}'] points at missing entry '${ref}'`,
        );
      }
    }
  }
}

/** FAQ for a client, or null — the host renders FAQ affordances only when present. */
export function getFaq(clientId: string | undefined): ClientFaq | null {
  return (clientId && faqs[clientId]) || null;
}

export * from './types';
