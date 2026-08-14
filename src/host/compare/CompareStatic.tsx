/**
 * The prerendered form of `/compare` — what a crawler, and anyone on a slow
 * connection, gets before any JavaScript runs.
 *
 * It is not a second version of the page. It renders the same
 * `CapabilityTable` and `CapabilityDetails` the live view renders, from the
 * same `capabilities.ts`, so it cannot drift: the only things missing are the
 * ones that need a browser — the chooser's state, the cell-detail panel, and
 * the side-by-side strip, which mounts eight clients' components and carries
 * almost no text worth indexing anyway.
 *
 * Kept deliberately free of hooks and browser APIs. `Layout` is excluded for
 * the same reason the gallery's prerender excludes it (see `entry-server.tsx`):
 * `useTheme` reads localStorage and `ClientSwitcher` reads matchMedia at
 * render, neither of which exists in Node.
 */
import { getClient, type ClientEntry } from '../../registry';
import { COMPARED_CLIENTS } from '../../data/capabilities';
import { CapabilityTable, CapabilityDetails, BackToShelf } from './CapabilityTable';

export default function CompareStatic() {
  const clients = COMPARED_CLIENTS.map((id) => getClient(id)).filter(
    (c): c is ClientEntry => !!c,
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-3 text-3xl font-bold sm:text-4xl">Which Nostr client?</h1>
      <p className="mb-3 max-w-3xl text-gray-600 dark:text-gray-400">
        What {clients.length} real Nostr clients can and cannot do, one capability at a time —
        every claim linked to the answer it came from and stamped with the build it was checked
        against.
      </p>
      <p className="mb-8 max-w-3xl text-sm text-gray-500">
        These describe the real apps, not the simulations on this site. The source is each
        client&rsquo;s own FAQ, its screen-map, or its published source code.
      </p>

      <h2 className="mb-4 text-lg font-semibold">What each one does</h2>
      <CapabilityTable clients={clients} />

      <h2 className="mb-4 mt-12 text-lg font-semibold">Every answer, in words</h2>
      <CapabilityDetails clients={clients} />

      <BackToShelf />
    </main>
  );
}
