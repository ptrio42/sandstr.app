/**
 * The one piece of server code in this project.
 *
 * Everything else on sandstr.app is static: no backend, no network, no auth
 * (CLAUDE.md). This exists for a single feature — "Preview your note" showing
 * the LINK PREVIEW CARD a real client would show. That card's title, description
 * and image live in the target page's Open Graph tags, and a browser cannot read
 * a third-party page (CORS). So something server-side has to fetch it.
 *
 * Being a URL-fetcher on someone else's behalf makes this endpoint the classic
 * SSRF target, so the rules below are deliberately strict and deliberately
 * boring:
 *
 *  - https only, default port only;
 *  - the host must be a name, never an IP literal, and never a private/loopback
 *    /link-local name (Workers cannot reach a private network from the edge
 *    anyway, but the check does not depend on that being true);
 *  - redirects are followed by the runtime, so the final URL is re-checked;
 *  - text/html only, 512 kB max, 5 s timeout;
 *  - the response is the four extracted fields — never the fetched bytes.
 *
 * There is no application-level rate limit: this relies on Cloudflare's own
 * protection in front of it. If the endpoint ever gets abused, that is the first
 * thing to add.
 */

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

const MAX_BYTES = 512 * 1024;
const TIMEOUT_MS = 5000;
const CACHE_SECONDS = 3600;

/** Hostnames we refuse outright. IP literals are rejected separately. */
const BLOCKED_HOST = /^(localhost|.*\.local|.*\.internal|.*\.localdomain)$/i;
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

function json(body: unknown, status = 200, cacheSeconds = 0): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cacheSeconds > 0 ? `public, max-age=${cacheSeconds}` : 'no-store',
      // Same-origin use only; no CORS header on purpose.
      'x-content-type-options': 'nosniff',
    },
  });
}

/** Throws a human-readable reason when `raw` is not safe to fetch. */
function safeTarget(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('not a URL');
  }
  if (url.protocol !== 'https:') throw new Error('https only');
  if (url.port && url.port !== '443') throw new Error('default port only');
  const host = url.hostname.toLowerCase();
  if (BLOCKED_HOST.test(host)) throw new Error('host not allowed');
  // Bracketed IPv6 or dotted IPv4 — a name is required, so no address literal
  // can be aimed at an internal service.
  if (host.startsWith('[') || IPV4.test(host)) throw new Error('address literals not allowed');
  if (!host.includes('.')) throw new Error('host not allowed');
  return url;
}

/** Open Graph / Twitter / bare-title extraction, streamed with HTMLRewriter. */
async function extract(response: Response, finalUrl: string) {
  const found: Record<string, string> = {};
  let title = '';
  let capturingTitle = false;

  const rewriter = new HTMLRewriter()
    .on('meta', {
      element(el: any) {
        const key = (el.getAttribute('property') || el.getAttribute('name') || '').toLowerCase();
        const value = el.getAttribute('content');
        if (!key || !value) return;
        if (
          key === 'og:title' ||
          key === 'og:description' ||
          key === 'og:image' ||
          key === 'og:site_name' ||
          key === 'twitter:title' ||
          key === 'twitter:description' ||
          key === 'twitter:image' ||
          key === 'description'
        ) {
          // First writer wins, so og:* beats the twitter:* fallback below it.
          if (!found[key]) found[key] = value;
        }
      },
    })
    .on('title', {
      element() {
        capturingTitle = true;
      },
      text(chunk: any) {
        if (capturingTitle && title.length < 300) title += chunk.text;
      },
    });

  // Consume the stream so the handlers run, with a hard byte ceiling.
  const transformed = rewriter.transform(response);
  const reader = transformed.body?.getReader();
  let read = 0;
  if (reader) {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      read += value?.byteLength ?? 0;
      if (read > MAX_BYTES) {
        await reader.cancel();
        break;
      }
    }
  }

  const pick = (...keys: string[]) => keys.map((k) => found[k]).find(Boolean) || '';
  const image = pick('og:image', 'twitter:image');
  let absoluteImage = '';
  if (image) {
    try {
      const resolved = new URL(image, finalUrl);
      // The card renders this in an <img>; the page CSP allows https only.
      if (resolved.protocol === 'https:') absoluteImage = resolved.toString();
    } catch {
      /* an unparseable og:image is simply dropped */
    }
  }

  return {
    url: finalUrl,
    title: (pick('og:title', 'twitter:title') || title).trim().slice(0, 200),
    description: pick('og:description', 'twitter:description', 'description').trim().slice(0, 400),
    image: absoluteImage,
    siteName: (pick('og:site_name') || new URL(finalUrl).hostname.replace(/^www\./, '')).slice(0, 100),
  };
}

async function unfurl(request: Request): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'GET only' }, 405);

  const raw = new URL(request.url).searchParams.get('url') || '';
  let target: URL;
  try {
    target = safeTarget(raw);
  } catch (e) {
    return json({ error: (e as Error).message }, 400);
  }

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        // Identify honestly. A site that does not want this can block on it.
        'user-agent': 'sandstr-link-preview/1.0 (+https://sandstr.app)',
        accept: 'text/html,application/xhtml+xml',
      },
    });
  } catch {
    return json({ error: 'could not reach that page' }, 502);
  }

  // A redirect chain can end somewhere the first check would have refused.
  try {
    safeTarget(upstream.url || target.toString());
  } catch {
    return json({ error: 'redirected somewhere not allowed' }, 400);
  }

  if (!upstream.ok) return json({ error: `that page returned ${upstream.status}` }, 502);
  const type = upstream.headers.get('content-type') || '';
  if (!/^text\/html|^application\/xhtml/i.test(type)) return json({ error: 'not an HTML page' }, 415);

  const card = await extract(upstream, upstream.url || target.toString());
  if (!card.title && !card.description && !card.image) {
    return json({ error: 'no preview data on that page' }, 404);
  }
  return json(card, 200, CACHE_SECONDS);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/unfurl') return unfurl(request);
    // Everything else is the static site, served by the assets binding so that
    // `not_found_handling` (the SPA fallback) and public/_headers still apply.
    return env.ASSETS.fetch(request);
  },
};
