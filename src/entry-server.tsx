/**
 * Build-time prerender entry — consumed only by `scripts/prerender.mjs`,
 * never shipped to the browser.
 *
 * WHY: the app is a client-rendered SPA, so `dist/index.html` ships an empty
 * `#root` and the one page crawlers may index (`/` — `public/robots.txt`
 * Disallow's `/c/`) contains none of its own copy: no h1, no section headings,
 * no client names, no card descriptions. Google renders JS on a second pass;
 * Bing, social scrapers and the LLM crawlers largely do not. For a site with
 * exactly one indexable URL that is the whole SEO surface, so we bake the
 * gallery's markup into the HTML at build time.
 *
 * WHAT IS RENDERED: the gallery alone.
 *  - It is pure — reads `clients` from ../registry (plain data plus `lazy()`
 *    loaders that are never invoked here) and touches no browser API.
 *  - `Layout` is deliberately excluded: `useTheme` reads localStorage and
 *    ClientSwitcher reads matchMedia at render, neither of which exists in
 *    Node, and its markup carries no indexable copy the gallery lacks.
 *
 * NOT hydration. `src/main.tsx` mounts with `createRoot`, which clears the
 * container, so React re-renders from scratch and this markup is never
 * diffed. It exists for crawlers and for first paint on a slow connection.
 * That also means it must stay a faithful subset of what renders live — it is
 * generated from the same component and the same registry, so it cannot drift.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import Gallery from './host/Gallery';
import { routable, type ClientEntry } from './registry';
import { shareCopy } from './shareMeta';

export function render(): string {
  return renderToStaticMarkup(
    <StaticRouter location="/">
      <Gallery />
    </StaticRouter>,
  );
}

/** One share card's worth of data — everything the two build scripts need. */
export interface ShareRoute {
  id: string;
  /** request path the card belongs to; the emitted file is `dist${path}.html` */
  path: string;
  name: string;
  status: ClientEntry['status'];
  kind: ClientEntry['kind'];
  /** upstream build label, when this reproduction was verified against one */
  reproduces?: string;
  /** the real client's platform, printed on the card as one word */
  platform: ClientEntry['platform'];
  /** brand accent — drives the card's glow; too dark for text on its own */
  accent: string;
  /** the brand's lighter second stop, when it has one; preferred for card text */
  accent2?: string;
  /** public/ path of the client's own mark, absent for Nostr Kitten */
  icon?: string;
  emoji?: string;
  /**
   * Card pill, set only when the card would otherwise overstate what it shows.
   * A finished reproduction gets none — so the pill's presence always means
   * "read this one more carefully", and there is no version string to go stale
   * inside a card scrapers cache forever.
   */
  badge?: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

/**
 * Per-route share metadata for every `/c/<id>`.
 *
 * WHY THIS EXISTS: link previews are built by scrapers that do not run JS, so
 * a React `<title>` swap reaches none of them. Every share of a deep link —
 * and `docs/OUTREACH.md` makes deep links the whole reply playbook
 * (`/c/<client>?faq=<id>`) — showed the gallery's card, because the SPA
 * fallback serves one `index.html` for all of them. The build now writes a
 * real file per route with its own tags; see scripts/prerender.mjs.
 *
 * The title and description themselves come from src/shareMeta.ts, which
 * ClientView also reads for `document.title` — one string, both surfaces, and
 * that file explains what the copy has to carry and why.
 */
export function shareRoutes(): ShareRoute[] {
  return routable.map((c) => {
    const real = c.kind === 'reproduction';
    const { title, description, label } = shareCopy(c);

    return {
      id: c.id,
      path: `/c/${c.id}`,
      name: c.name,
      status: c.status,
      kind: c.kind,
      reproduces: c.reproduces,
      platform: c.platform,
      accent: c.primaryColor,
      accent2: c.secondaryColor,
      icon: c.icon,
      emoji: c.emoji,
      badge: !real
        ? 'Original demo client'
        : c.archivedOf
          ? `Archived · ${c.reproduces ?? 'older version'}`
          : c.status === 'preview'
            ? 'Early preview'
            : undefined,
      title,
      description,
      image: `/og/${c.id}.png`,
      imageAlt: real
        ? `A Sandstr card for the ${label} reproduction: the ${c.name} mark over "try it in your browser", above the line "simulation · unofficial · mock data · not affiliated".`
        : `A Sandstr card for ${c.name}, an original demo client, over the line "try it in your browser".`,
    } satisfies ShareRoute;
  });
}
