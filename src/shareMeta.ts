/**
 * The one place a client route's title and description are written.
 *
 * Two consumers, deliberately sharing a string:
 *  - `shareRoutes()` in src/entry-server.tsx, which bakes them into
 *    `dist/c/<id>.html` at build time — that is what link-preview scrapers
 *    read, since none of them run JS;
 *  - `ClientView`, which sets `document.title` at runtime — without it, opening
 *    /c/damus directly showed "Try Damus…" while walking to the same client
 *    from the gallery left the tab (and any bookmark taken there) on the
 *    generic gallery title.
 *
 * The copy carries its own mitigation. A share card is the ONE sandstr surface
 * that travels with no disclaimer strip, no handoff link and no address bar, so
 * "unofficial" and "not affiliated with <name>" belong in the sentence itself,
 * and a preview says it is a preview before anyone can share it as a finished
 * reproduction.
 */
import type { ClientEntry } from './registry';

export interface ShareCopy {
  title: string;
  description: string;
  /** the name to print, version-qualified for a frozen snapshot */
  label: string;
}

export function shareCopy(c: ClientEntry): ShareCopy {
  const real = c.kind === 'reproduction';
  // An archived snapshot keeps the living client's bare `name` (Disclaimer and
  // Handoff interpolate it), so without the version its card and its tab title
  // are indistinguishable from the current one.
  const label = c.archivedOf && c.reproduces ? `${c.name} ${c.reproduces}` : c.name;

  if (!real) {
    return {
      label,
      title: `${c.name} — an original demo client on Sandstr`,
      description: `${c.description} Runs entirely in your browser on mock data — no keys, no signup, no install.`,
    };
  }

  if (c.archivedOf) {
    return {
      label,
      title: `Try ${label} in your browser — Sandstr`,
      description: `A frozen snapshot of the ${c.name} reproduction as it stood at ${c.reproduces}, running in your browser on mock data. Unofficial, not affiliated with ${c.name}.`,
    };
  }

  if (c.status === 'ready') {
    const version = c.reproduces ? ` (${c.reproduces})` : '';
    return {
      label,
      title: `Try ${c.name} in your browser — Sandstr`,
      description: `An unofficial, interactive reproduction of ${c.name}${version}, running entirely in your browser on mock data. No keys, no signup, no install. Not affiliated with ${c.name}.`,
    };
  }

  return {
    label,
    title: `Try ${c.name} in your browser (early preview) — Sandstr`,
    description: `An early, not-yet-verified preview of ${c.name}'s interface, running in your browser on mock data. No keys, no signup, no install. Unofficial, not affiliated with ${c.name}.`,
  };
}
