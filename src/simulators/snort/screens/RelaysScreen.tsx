import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '../components/Icon';
import { formatShort, seededUnit } from '../snortUtils';

/**
 * Snort — Relay settings (`/settings/relays`).
 *
 * Rebuilt from `docs/refs/snort/screen-map.md` §12, which is the authority for
 * every string, column and colour below. Upstream is
 * `Pages/settings/Relays.tsx` + `Components/Relay/Relay.tsx`,
 * `status-label.tsx`, `uptime-label.tsx` and `permissions.tsx`.
 *
 * Page = `flex flex-col gap-4` of **My Relays → Add Relays → Discover**, inside
 * the `px-3` wrapper the whole `/settings` subtree carries.
 *
 * The four things a reproducer habitually gets wrong here:
 *
 *  1. **The RELAY column shows the short derived name, never the `wss://` URL.**
 *     Upstream is `connection.info?.name ?? getRelayName(addr)`, truncated to 20
 *     chars + "…", with the full URL only in the `title` tooltip.
 *     [REC ✓ "memlay", "nostr.wine", "damus.io", "nos.lol".]
 *  2. **PERMISSIONS are two plain clickable words, not switches** — "Read" then
 *     "Write", disabled ones gray. Toggling is local; only Save publishes.
 *  3. **UPTIME is a separate latency verdict from STATUS**, so a row legitimately
 *     reads a red "Dead" beside a green "Connected". See UPTIME_NOTE below.
 *  4. **Both Discover sections start COLLAPSED**, and their header rows are
 *     `text-gray-light uppercase` — a class that does not exist in Snort's
 *     Tailwind v4 theme, so they render in the inherited font colour while My
 *     Relays' `text-neutral-400` headers are genuinely gray. §19 lists that
 *     inconsistency among the bugs to reproduce rather than fix.
 *
 * Everything is deterministic: user counts, latency and distances come from
 * `seededUnit`, never `Math.random()`.
 */

export interface RelaysScreenProps {
  onBack: () => void;
}

/**
 * Reset for the controls upstream builds out of bare `<div onClick>`s. Snort's
 * `@utility button` (§3) turns every real `<button>` into a white pill, so the
 * section headers must not inherit that look.
 */
const BARE: CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  color: 'inherit',
  fontFamily: 'inherit',
  cursor: 'pointer',
  textAlign: 'left',
};

interface SimRelay {
  url: string;
  /** NIP-11 `info.name`; upstream prefers it over `getRelayName(addr)`. */
  infoName?: string;
  read: boolean;
  write: boolean;
}

/**
 * The relay set from the recording. `relay.damus.io` displays as "damus.io"
 * because that is the NIP-11 name the relay itself serves — the host is not
 * being trimmed.
 */
const DEFAULT_RELAYS: SimRelay[] = [
  { url: 'wss://relay.snort.social', infoName: 'memlay', read: true, write: true },
  { url: 'wss://nostr.wine', read: true, write: true },
  { url: 'wss://relay.damus.io', infoName: 'damus.io', read: true, write: true },
  { url: 'wss://nos.lol', read: true, write: true },
];

/** `getRelayName(addr)` — host + pathname, no scheme, no trailing slash. */
function getRelayName(url: string): string {
  return url.replace(/^wss?:\/\//i, '').replace(/\/+$/, '');
}

/** Upstream truncates the displayed name to 20 chars and appends an ellipsis. */
function truncateName(name: string): string {
  return name.length > 20 ? `${name.slice(0, 20)}…` : name;
}

function relayLabel(relay: SimRelay): string {
  return truncateName(relay.infoName ?? getRelayName(relay.url));
}

/** `wss://` is prefixed when no scheme was typed; trailing slashes are dropped. */
function sanitizeRelayUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^wss?:\/\//i.test(trimmed) ? trimmed : `wss://${trimmed}`;
  return withScheme.replace(/\/+$/, '');
}

/**
 * `uptime-label.tsx` — a 4-state verdict from the average `rtt-read` in
 * kind-30166 relay-monitor events, `idealPing 500` / `badPing 1000`, always
 * `font-semibold` and carrying a `{ms} ms` tooltip.
 *
 * UPTIME_NOTE: with no monitor data the average is `NaN` and the cell reads a
 * red **"Dead"** — which is exactly what every row showed in the owner's
 * recording, sitting right next to a green "Connected". It looks like a
 * contradiction and it is; §12 and §19 both say to keep it, so the My Relays
 * rows below pass `null`. The Discover sections do have monitor data, which is
 * where the other three states show up.
 */
const IDEAL_PING = 500;
const BAD_PING = 1000;

function uptimeVerdict(rttMs: number | null): { label: string; color: string; title: string } {
  if (rttMs === null || Number.isNaN(rttMs)) {
    return { label: 'Dead', color: 'var(--snort-error)', title: 'No monitor data' };
  }
  if (rttMs > BAD_PING) return { label: 'Poor', color: 'var(--snort-error)', title: `${rttMs} ms` };
  if (rttMs >= IDEAL_PING) return { label: 'Good', color: 'var(--snort-warning)', title: `${rttMs} ms` };
  return { label: 'Great', color: 'var(--snort-success)', title: `${rttMs} ms` };
}

interface DiscoverRelay {
  url: string;
  users: number;
  rttMs: number;
  distanceKm: number;
}

/** Deterministic stand-in for the kind-30166 monitor aggregates. */
function discoverRelay(url: string): DiscoverRelay {
  return {
    url,
    users: Math.round(1200 + seededUnit(`${url}:users`) * 90000),
    rttMs: Math.round(80 + seededUnit(`${url}:rtt`) * 1400),
    distanceKm: Math.round(seededUnit(`${url}:km`) * 950),
  };
}

/** Upstream lists the top 20 / up to 100; the sim ships a representative slice. */
const POPULAR_RELAYS: DiscoverRelay[] = [
  'wss://relay.nostr.band',
  'wss://nostr.mom',
  'wss://offchain.pub',
  'wss://nostr.oxtr.dev',
  'wss://relay.nostr.bg',
].map(discoverRelay);

const CLOSE_RELAYS: DiscoverRelay[] = [
  'wss://eden.nostr.land',
  'wss://nostr-pub.wellorder.net',
  'wss://nostr.bitcoiner.social',
  'wss://relay.nostrich.land',
].map(discoverRelay);

export function RelaysScreen({ onBack }: RelaysScreenProps) {
  const [relays, setRelays] = useState<SimRelay[]>(DEFAULT_RELAYS);
  const [draft, setDraft] = useState('');
  /**
   * Upstream's Save is an `AsyncButton`, which hosts a transient state on the
   * button itself while the NIP-65 list is published and blasted out. Ours is a
   * static check glyph — no animation, because the preview environment freezes
   * springs and keyframes at frame 0.
   */
  const [published, setPublished] = useState(false);

  const mutate = (next: SimRelay[]) => {
    setRelays(next);
    setPublished(false);
  };

  const togglePermission = (url: string, key: 'read' | 'write') => {
    mutate(relays.map((r) => (r.url === url ? { ...r, [key]: !r[key] } : r)));
  };

  /** The trash icon removes the relay and persists immediately (§12). */
  const removeRelay = (url: string) => {
    mutate(relays.filter((r) => r.url !== url));
  };

  const addRelays = (text: string) => {
    // Submission splits on newlines — "a single or multiple relays, one per line".
    const parsed = text.split('\n').map(sanitizeRelayUrl);
    const next = [...relays];
    for (const url of parsed) {
      if (!url) continue;
      if (next.some((r) => r.url === url)) continue;
      next.push({ url, read: true, write: true });
    }
    mutate(next);
  };

  const isAdded = (url: string) => relays.some((r) => r.url === url);

  return (
    <div className="snort-relays flex flex-col gap-4 px-3 py-2" data-tour="snort-relays">
      {/* Sandstr affordance: upstream relies on the header's history back arrow,
          which in this shell returns to the timeline rather than to Settings. */}
      <button
        type="button"
        style={BARE}
        className="snort-muted flex w-fit items-center gap-2 text-sm"
        onClick={onBack}
      >
        <Icon name="arrowBack" size={16} />
        Settings
      </button>

      {/* ---------------------------- My Relays ---------------------------- */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-medium">My Relays</h2>
        {/* Verbatim from `Relays.tsx`; `small` is muted body text (§2). */}
        <small className="snort-muted leading-6">
          Relays are servers you connect to for sending and receiving events. Aim for 4-8 relays.
        </small>
        <small className="snort-muted leading-6">
          The relay name shown is not the same as the full URL entered.
        </small>

        <div className="overflow-x-auto">
          <table className="snort-relay-table">
            <thead>
              <tr>
                <th>Relay</th>
                <th>Status</th>
                <th>Permissions</th>
                <th className="text-center">Uptime</th>
                {/* Blank header over the trash column. */}
                <th className="w-8">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {relays.map((relay) => {
                // Every rendered row has a live connection — upstream renders
                // nothing at all for a relay without one — so "Offline" never
                // appears here and the dot is always `--success`.
                const uptime = uptimeVerdict(null);
                return (
                  <tr key={relay.url}>
                    <td className="pr-4">
                      {/* Upstream links this to `/settings/relays/:id`; that detail
                          page is out of scope for the sim, so it stays plain text
                          with the full URL in the tooltip, as upstream sets it. */}
                      <span title={relay.url} className="font-medium">
                        {relayLabel(relay)}
                      </span>
                    </td>
                    <td className="pr-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="snort-status-dot"
                          style={{ backgroundColor: 'var(--snort-success)' }}
                          aria-hidden
                        />
                        Connected
                      </div>
                    </td>
                    <td className="pr-4">
                      <div className="flex items-center gap-3">
                        <PermissionWord
                          label="Read"
                          enabled={relay.read}
                          onToggle={() => togglePermission(relay.url, 'read')}
                        />
                        <PermissionWord
                          label="Write"
                          enabled={relay.write}
                          onToggle={() => togglePermission(relay.url, 'write')}
                        />
                      </div>
                    </td>
                    <td className="px-4 text-center">
                      <span
                        className="font-semibold"
                        style={{ color: uptime.color }}
                        title={uptime.title}
                      >
                        {uptime.label}
                      </span>
                    </td>
                    <td>
                      {/* `text-gray-light` is undefined upstream, so the trash
                          glyph inherits the body colour instead of going gray. */}
                      <button
                        type="button"
                        className="snort-btn-sm"
                        aria-label={`Remove ${relayLabel(relay)}`}
                        onClick={() => removeRelay(relay.url)}
                      >
                        <Icon name="trash" size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button type="button" className="snort-btn self-start" onClick={() => setPublished(true)}>
          Save
          {published && <Icon name="check" size={16} />}
        </button>
      </section>

      {/* ---------------------------- Add Relays --------------------------- */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xl font-medium">Add Relays</h3>
        <small className="snort-muted leading-6">
          You can add a single or multiple relays, one per line.
        </small>
        {/* A textarea keeps the 12px radius — only inputs and selects are pills (§3). */}
        <textarea
          className="snort-textarea"
          rows={4}
          placeholder="wss://my-relay.com"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="button"
          className="snort-btn secondary self-start"
          onClick={() => {
            addRelays(draft);
            setDraft('');
          }}
        >
          Add
        </button>
      </section>

      {/* ----------------------------- Discover ---------------------------- */}
      <CollapsedSection title="Popular Relays">
        <small className="snort-muted leading-6">Popular relays used by people you follow.</small>
        <div className="overflow-x-auto">
          <table className="snort-relay-table">
            <thead>
              <tr>
                <DiscoverHeader>Relay</DiscoverHeader>
                <DiscoverHeader>Uptime</DiscoverHeader>
                <DiscoverHeader>Users</DiscoverHeader>
                <DiscoverHeader>
                  <span className="sr-only">Add</span>
                </DiscoverHeader>
              </tr>
            </thead>
            <tbody>
              {POPULAR_RELAYS.map((relay) => {
                const uptime = uptimeVerdict(relay.rttMs);
                return (
                  <tr key={relay.url}>
                    <td className="pr-4">
                      <RelayName url={relay.url} />
                    </td>
                    <td className="pr-4">
                      <span
                        className="font-semibold"
                        style={{ color: uptime.color }}
                        title={uptime.title}
                      >
                        {uptime.label}
                      </span>
                    </td>
                    <td className="pr-4">{formatShort(relay.users)}</td>
                    <td className="text-right">
                      <AddButton
                        url={relay.url}
                        added={isAdded(relay.url)}
                        onAdd={() => addRelays(relay.url)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CollapsedSection>

      <CollapsedSection title="Close Relays">
        <small className="snort-muted leading-6">Relays close to your geographic location.</small>
        <div className="overflow-x-auto">
          <table className="snort-relay-table">
            <thead>
              <tr>
                <DiscoverHeader>Relay</DiscoverHeader>
                <DiscoverHeader>Distance</DiscoverHeader>
                <DiscoverHeader>Uptime</DiscoverHeader>
                <DiscoverHeader>
                  <span className="sr-only">Add</span>
                </DiscoverHeader>
              </tr>
            </thead>
            <tbody>
              {CLOSE_RELAYS.map((relay) => {
                const uptime = uptimeVerdict(relay.rttMs);
                return (
                  <tr key={relay.url}>
                    <td className="pr-4">
                      <RelayName url={relay.url} />
                    </td>
                    <td className="pr-4">{`${relay.distanceKm} km`}</td>
                    <td className="pr-4">
                      <span
                        className="font-semibold"
                        style={{ color: uptime.color }}
                        title={uptime.title}
                      >
                        {uptime.label}
                      </span>
                    </td>
                    <td className="text-right">
                      <AddButton
                        url={relay.url}
                        added={isAdded(relay.url)}
                        onAdd={() => addRelays(relay.url)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CollapsedSection>
    </div>
  );
}

/**
 * `permissions.tsx:9-34` — two clickable WORDS, never switches. Enabled keeps the
 * default colour, disabled goes gray. A `<span>` (upstream uses a bare `div`)
 * keeps this out of the pill-button system and out of any nested-button trap.
 */
function PermissionWord({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      aria-pressed={enabled}
      className={`cursor-pointer select-none${enabled ? '' : ' text-neutral-500'}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {label}
    </span>
  );
}

/**
 * Discover column heading. Upstream writes `text-gray-light uppercase`, and
 * `text-gray-light` is one of the undefined classes §19 lists — so these headers
 * are uppercase but NOT gray, unlike My Relays'. The inline colour is what beats
 * `.snort-relay-table thead th`'s neutral-400.
 */
function DiscoverHeader({ children }: { children: ReactNode }) {
  return <th style={{ color: 'var(--snort-text)' }}>{children}</th>;
}

/**
 * Upstream pairs the name with a `RelayFavicon`, which hotlinks the relay host's
 * favicon — CSP-unsafe and offline-breaking for Sandstr (§19.10). The bundled
 * `relay` glyph stands in for the favicon's fallback shape.
 */
function RelayName({ url }: { url: string }) {
  return (
    <span className="flex items-center gap-2" title={url}>
      <Icon name="relay" size={16} />
      <span className="font-medium">{truncateName(getRelayName(url))}</span>
    </span>
  );
}

/** Upstream: `AsyncButton className="!py-1 mb-1"` — a default white pill, squashed. */
function AddButton({ url, added, onAdd }: { url: string; added: boolean; onAdd: () => void }) {
  return (
    <button
      type="button"
      className="snort-btn mb-1"
      style={{ paddingTop: 4, paddingBottom: 4 }}
      disabled={added}
      aria-label={`Add ${getRelayName(url)}`}
      onClick={onAdd}
    >
      Add
    </button>
  );
}

/**
 * `CollapsedSection` — a clickable `text-xl` title row with a caret, `startClosed`
 * by default, which is how both Discover sections render (§12).
 */
function CollapsedSection({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="flex flex-col gap-2">
      <button
        type="button"
        style={BARE}
        className="flex w-full items-center gap-4 text-xl font-medium"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <Icon name="chevronDown" size={20} className={open ? 'rotate-180' : undefined} />
      </button>
      {open && <div className="flex flex-col gap-2">{children}</div>}
    </section>
  );
}

export default RelaysScreen;
