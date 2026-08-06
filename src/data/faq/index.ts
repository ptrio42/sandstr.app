import type { ClientFaq } from './types';
import { damusFaq } from './damus';

const faqs: Record<string, ClientFaq> = {
  damus: damusFaq,
};

/** FAQ for a client, or null — the host renders FAQ affordances only when present. */
export function getFaq(clientId: string | undefined): ClientFaq | null {
  return (clientId && faqs[clientId]) || null;
}

export * from './types';
