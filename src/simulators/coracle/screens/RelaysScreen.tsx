/**
 * Relays — `RelayList.svelte` + `RelayCard.svelte`, spec §10.
 *
 * Two sections with DIFFERENT icons (server vs circle-nodes — deliberate
 * upstream), and the Add Relay button's icon is a COMPASS, not a plus.
 *
 * The action buttons are the tell: INFO and EXPLORE are near-white
 * (`bg-tinted-100-l`), JOIN is accent, LEAVE is dark — and LEAVE only appears
 * when you hold more than one relay, because Coracle will not let you drop your
 * last one. They are `uppercase` utility, not Staatliches, so they are caps for
 * a different reason than the rest of the UI.
 */
import React, { useState } from 'react';
import type { MockRelay } from '../../../data/mock';
import { Icon } from '../components/Icon';
import { displayRelayUrl, quantify, seededCount } from '../coracleUtils';

interface RelaysScreenProps {
  relays: MockRelay[];
  joined: Set<string>;
  onJoin: (url: string) => void;
  onLeave: (url: string) => void;
  onExplore: (relay: MockRelay) => void;
}

/** `RelayCardActions.svelte:24-49` — raw buttons, `rounded-md px-6 py-1`. */
function ActionButton({
  label,
  variant,
  onClick,
}: {
  label: string;
  variant: 'plain' | 'accent' | 'dark';
  onClick: () => void;
}) {
  const base: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '0.375rem',
    padding: '0.25rem 1.5rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '0.02em',
  };
  const skin: Record<typeof variant, React.CSSProperties> = {
    plain: { background: 'var(--co-tinted-100-l)', color: 'var(--co-tinted-700-d)' },
    accent: { background: 'var(--co-accent)', color: '#fff' },
    dark: { background: 'var(--co-tinted-700-d)', color: 'var(--co-neutral-100)' },
  } as const;
  return (
    <button type="button" style={{ ...base, ...skin[variant] }} onClick={onClick}>
      {label}
    </button>
  );
}

/** Read / Write / Messaging. Off is expressed ONLY as opacity-50 (§10). */
function PolicyChip({
  icon,
  label,
  on,
  onToggle,
}: {
  icon: 'book-open' | 'feather' | 'inbox';
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="co-chip"
      style={{ opacity: on ? 1 : 0.5, padding: '0.25rem 0.5rem' }}
      onClick={onToggle}
    >
      <Icon name={icon} size={12} style={{ color: 'var(--co-neutral-300)' }} />
      {label}
    </button>
  );
}

function RelayCard({
  relay,
  alt,
  isJoined,
  showControls,
  canLeave,
  onJoin,
  onLeave,
  onExplore,
}: {
  relay: MockRelay;
  alt: boolean;
  isJoined: boolean;
  showControls: boolean;
  canLeave: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onExplore: () => void;
}) {
  const [details, setDetails] = useState(false);
  const [policy, setPolicy] = useState({ read: true, write: true, messaging: false });
  const connections = 1 + seededCount(relay.url, 17, 40);

  return (
    <div
      className={`co-card ${alt ? 'co-card-alt' : ''}`}
      style={{ borderRadius: '0.375rem', padding: '1.5rem' }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', minWidth: 0, flex: '1 1 12rem', alignItems: 'center', gap: '0.75rem' }}>
          {/* `h-9 w-9 rounded-full border` with an `fa fa-server` fallback. */}
          <span
            style={{
              display: 'flex',
              height: '2.25rem',
              width: '2.25rem',
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '9999px',
              border: '1px solid var(--co-neutral-600)',
            }}
          >
            <Icon name="server" size={16} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayRelayUrl(relay.url)}
              </span>
              {showControls && (
                <span
                  aria-label={relay.isOnline ? 'Connected' : 'Not connected'}
                  style={{
                    height: '0.5rem',
                    width: '0.5rem',
                    borderRadius: '9999px',
                    background: relay.isOnline ? 'var(--co-success)' : 'var(--co-neutral-600)',
                  }}
                />
              )}
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0 1rem',
                fontSize: '0.75rem',
                color: 'var(--co-neutral-400)',
              }}
            >
              <span style={{ whiteSpace: 'nowrap' }}>{relay.supportedNips.length} NIPs</span>
              <span style={{ whiteSpace: 'nowrap' }}>Connected {quantify(connections, 'time')}</span>
            </div>
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', flexShrink: 0, gap: '0.75rem' }}>
          <ActionButton label="Info" variant="plain" onClick={() => setDetails((v) => !v)} />
          <ActionButton label="Explore" variant="plain" onClick={onExplore} />
          {isJoined ? (
            canLeave && <ActionButton label="Leave" variant="dark" onClick={onLeave} />
          ) : (
            <ActionButton label="Join" variant="accent" onClick={onJoin} />
          )}
        </div>
      </div>

      {details && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem 0' }}>
          <div style={{ fontSize: '0.875rem' }}>{relay.description}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.75 }}>
            Supported NIPs: {relay.supportedNips.join(', ')}
          </div>
        </div>
      )}

      {showControls && (
        <>
          <div
            style={{
              margin: '0.25rem -1.5rem',
              height: '1px',
              background: 'var(--co-tinted-700)',
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', paddingTop: '0.25rem' }}>
            <PolicyChip
              icon="book-open"
              label="Read"
              on={policy.read}
              onToggle={() => setPolicy((p) => ({ ...p, read: !p.read }))}
            />
            <PolicyChip
              icon="feather"
              label="Write"
              on={policy.write}
              onToggle={() => setPolicy((p) => ({ ...p, write: !p.write }))}
            />
            <PolicyChip
              icon="inbox"
              label="Messaging"
              on={policy.messaging}
              onToggle={() => setPolicy((p) => ({ ...p, messaging: !p.messaging }))}
            />
          </div>
        </>
      )}
    </div>
  );
}

export const RelaysScreen: React.FC<RelaysScreenProps> = ({
  relays,
  joined,
  onJoin,
  onLeave,
  onExplore,
}) => {
  const [tab, setTab] = useState<'search' | 'reviews'>('search');
  const [query, setQuery] = useState('');

  const yours = relays.filter((r) => joined.has(r.url)).sort((a, b) => a.url.localeCompare(b.url));
  const others = relays
    .filter((r) => !joined.has(r.url))
    .filter((r) => !query.trim() || r.url.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="server" size={20} />
          <h2 className="co-staatliches" style={{ fontSize: '1.5rem' }}>
            Your relays
          </h2>
        </div>
        <button type="button" className="co-btn co-btn-accent" onClick={() => setTab('search')}>
          <Icon name="compass" size={14} /> Add Relay
        </button>
      </div>
      <p>
        Relays are hubs for your content and connections. At least one is required to interact with
        the network, but you can join as many as you like.
      </p>

      {yours.length === 0 ? (
        <div
          style={{
            marginTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            textAlign: 'center',
          }}
        >
          <Icon name="triangle-exclamation" size={14} /> No relays connected
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {yours.map((relay, i) => (
            <RelayCard
              key={relay.url}
              relay={relay}
              alt={i % 2 === 1}
              isJoined
              showControls
              canLeave={yours.length > 1}
              onJoin={() => onJoin(relay.url)}
              onLeave={() => onLeave(relay.url)}
              onExplore={() => onExplore(relay)}
            />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
        <Icon name="circle-nodes" size={20} />
        <h2 className="co-staatliches" style={{ fontSize: '1.5rem' }}>
          Other relays
        </h2>
      </div>
      <p>
        Below are relays used by people in your network. Adding these may improve your ability to
        load profiles and content.
      </p>

      <div style={{ display: 'flex' }}>
        <button
          type="button"
          className={`co-tab ${tab === 'search' ? 'co-tab-active' : ''}`}
          onClick={() => setTab('search')}
        >
          Search
        </button>
        <button
          type="button"
          className={`co-tab ${tab === 'reviews' ? 'co-tab-active' : ''}`}
          onClick={() => setTab('reviews')}
        >
          Reviews
        </button>
      </div>

      {tab === 'search' ? (
        <>
          <div style={{ position: 'relative' }}>
            <input
              className="co-input"
              style={{ paddingLeft: '2.25rem', height: '2.25rem' }}
              placeholder="Search relays or add a custom url"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search relays"
            />
            <span
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--co-neutral-500)',
                pointerEvents: 'none',
              }}
            >
              <Icon name="search" size={13} />
            </span>
          </div>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {others.map((relay, i) => (
              <RelayCard
                key={relay.url}
                relay={relay}
                alt={i % 2 === 1}
                isJoined={false}
                showControls={false}
                canLeave={false}
                onJoin={() => onJoin(relay.url)}
                onLeave={() => onLeave(relay.url)}
                onExplore={() => onExplore(relay)}
              />
            ))}
            {others.length === 0 && (
              <p style={{ padding: '2rem 0', textAlign: 'center' }}>
                No relays matching &quot;{query}&quot;
              </p>
            )}
          </div>
        </>
      ) : (
        <p style={{ padding: '3rem 0', textAlign: 'center' }}>No reviews found.</p>
      )}
    </>
  );
};
