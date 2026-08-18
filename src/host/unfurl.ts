import type { LinkPreview } from '../data/mock/types';

/**
 * Ask our own Worker for a link's preview card (workers/index.ts).
 *
 * This is the ONLY fetch the site makes, and it goes to our own origin — which
 * is why the CSP can stay `connect-src 'self'`. The Worker does the third-party
 * request, so the visitor's browser never contacts the linked site; only the
 * card's IMAGE is loaded directly by the browser afterwards, which PRIVACY.md
 * spells out.
 *
 * On `npm run dev` there is no Worker: Vite answers /api/unfurl with index.html,
 * the JSON parse fails, and this returns null — the note simply renders without
 * a card. Use `wrangler dev` (the sandstr-workers preview) to exercise the real
 * path.
 */
export async function fetchLinkPreview(url: string, signal?: AbortSignal): Promise<LinkPreview | null> {
  try {
    const response = await fetch(`/api/unfurl?url=${encodeURIComponent(url)}`, {
      signal,
      headers: { accept: 'application/json' },
    });
    if (!response.ok) return null;
    if (!/application\/json/i.test(response.headers.get('content-type') || '')) return null;
    const card = (await response.json()) as LinkPreview;
    return card && typeof card.url === 'string' ? card : null;
  } catch {
    // Offline, blocked, aborted, or the dev server answering with HTML.
    return null;
  }
}
