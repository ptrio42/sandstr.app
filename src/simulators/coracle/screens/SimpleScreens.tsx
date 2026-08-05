/**
 * The surfaces that are mostly verbatim copy: notifications, messages, groups,
 * lists and the invite builder. Spec §12–§16.
 *
 * Every string here is quoted from the real client — including the hyphen in
 * "No notifications found - check back later!" (ASCII, spaced, not an en dash)
 * and the full stop in "No messages found." Those are the sort of details that
 * decide whether a side-by-side pass says "same app".
 */
import React, { useState } from 'react';
import type { MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';

function CountPill({ n }: { n: number }) {
  return (
    <span
      style={{
        height: '1.5rem',
        borderRadius: '9999px',
        background: 'var(--co-neutral-700)',
        padding: '0 0.5rem',
        fontSize: '0.8125rem',
        lineHeight: '1.5rem',
      }}
    >
      {n}
    </span>
  );
}

/** §12 — tabs "Mentions & Replies" / "Reactions", ampersand and all. */
export const NotificationsScreen: React.FC = () => {
  const [tab, setTab] = useState<'Mentions & Replies' | 'Reactions'>('Mentions & Replies');
  return (
    <>
      <div style={{ display: 'flex' }}>
        {(['Mentions & Replies', 'Reactions'] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={`co-tab ${tab === t ? 'co-tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {t}
              {/* The unread pill shows on the NON-active tab only. */}
              {tab !== t && <CountPill n={t === 'Reactions' ? 3 : 1} />}
            </span>
          </button>
        ))}
      </div>
      <p style={{ padding: '3rem 0', textAlign: 'center' }}>
        No notifications found - check back later!
      </p>
    </>
  );
};

/** §13 — "Your conversations", + CREATE, always-visible count pills. */
export const MessagesScreen: React.FC<{ onCreate: () => void }> = ({ onCreate }) => {
  const [tab, setTab] = useState<'conversations' | 'requests'>('conversations');
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="comments" size={20} />
          <h2 className="co-staatliches" style={{ fontSize: '1.5rem' }}>
            Your conversations
          </h2>
        </div>
        <button type="button" className="co-btn co-btn-accent" onClick={onCreate}>
          <Icon name="plus" size={13} /> Create
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {(['conversations', 'requests'] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={`co-tab ${tab === t ? 'co-tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {t === 'conversations' ? 'Conversations' : 'Requests'}
              <CountPill n={0} />
            </span>
          </button>
        ))}
        <span
          style={{ padding: '0 1rem', color: 'var(--co-neutral-600)' }}
          title="Mark all as read"
          aria-label="Mark all as read"
        >
          <Icon name="bell" size={15} />
        </span>
      </div>

      <p style={{ padding: '2rem 0', textAlign: 'center' }}>No messages found.</p>
    </>
  );
};

/** `ChannelCreate.svelte` — a 60px centred display heading. */
export const StartConversationScreen: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <h2
      className="co-staatliches"
      style={{ fontSize: '3rem', textAlign: 'center', lineHeight: 1.1 }}
    >
      Start a conversation
    </h2>
    <p>Who do you want to talk to?</p>
    <input className="co-input" style={{ height: '2.25rem' }} aria-label="Search for people" />
    <button type="button" className="co-btn" style={{ width: '100%' }}>
      Start chat
    </button>
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.875rem' }}>
      <Icon name="info-circle" size={14} style={{ marginTop: '0.15rem', flexShrink: 0 }} />
      <span>
        In order to deliver messages, Coracle needs to know where to send them. Please visit your
        settings page and set up your messaging relays.
      </span>
    </div>
  </div>
);

/**
 * §14 — Groups. The real `GroupList.svelte` is fifteen lines and all of them
 * are a deprecation notice, so that is what ships. Anyone reproducing "Coracle
 * groups" from an older screenshot would be reproducing a retired surface.
 */
export const GroupsScreen: React.FC<{ onExternal: (what: string) => void }> = ({ onExternal }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {/* Lato bold, sentence case — NOT the all-caps display face. */}
    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>Groups are going away!</p>
    <p>
      You can still access your groups at <strong>groups.coracle.social</strong>, or you can try our
      very new relay-based groups client at <strong>flotilla.social</strong>.
    </p>
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
      <button type="button" className="co-btn" onClick={() => onExternal('groups.coracle.social')}>
        Continue to Groups
      </button>
      <button
        type="button"
        className="co-btn co-btn-accent"
        onClick={() => onExternal('flotilla.social')}
      >
        Try Flotilla
      </button>
    </div>
  </div>
);

/** §15 — Lists. Note the empty-state CTA is `btn-low` (muted), not accent. */
export const ListsScreen: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Icon name="bars-staggered" size={20} style={{ color: 'var(--co-accent)' }} />
        <h2 className="co-staatliches" style={{ fontSize: '1.5rem' }}>
          Your lists
        </h2>
      </div>
      <button type="button" className="co-btn co-btn-accent" onClick={onCreate}>
        <Icon name="plus" size={13} /> List
      </button>
    </div>

    <div className="co-card">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '2rem 0',
          textAlign: 'center',
          color: 'var(--co-neutral-400)',
        }}
      >
        <Icon name="bars-staggered" size={28} />
        <p>You don&apos;t have any lists yet.</p>
        <button
          type="button"
          className="co-btn co-btn-low"
          style={{ marginTop: '0.5rem' }}
          onClick={onCreate}
        >
          <Icon name="plus" size={13} /> Create a list
        </button>
      </div>
    </div>

    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Icon name="circle-nodes" size={20} style={{ color: 'var(--co-accent)' }} />
      <h2 className="co-staatliches" style={{ fontSize: '1.5rem' }}>
        Other lists
      </h2>
    </div>
    <p style={{ fontSize: '0.875rem', color: 'var(--co-neutral-400)' }}>
      Lists created by people in your network.
    </p>
  </>
);

/**
 * §16 — Invite builder. The two "+ Add people" / "+ Add relays" controls carry
 * no `.btn` class upstream, so they render as plain Lato text, not pills.
 */
export const InviteScreen: React.FC<{ currentUser: MockUser | null; onSubmit: () => void }> = ({
  currentUser,
  onSubmit,
}) => {
  const [sections, setSections] = useState<string[]>(['people']);
  const show = (s: string) => setSections((prev) => (prev.includes(s) ? prev : [...prev, s]));
  const hide = (s: string) => setSections((prev) => prev.filter((x) => x !== s));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        style={{
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1
          className="co-staatliches"
          style={{ fontSize: '3.75rem', margin: '1rem 0', lineHeight: 1 }}
        >
          Create an Invite
        </h1>
        <p style={{ textAlign: 'center' }}>
          Invite links allow you to help your friends onboard to nostr more easily, or get easy
          access to relays.
        </p>
      </div>

      {sections.includes('people') && (
        <div className="co-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="co-staatliches" style={{ fontSize: '1.875rem' }}>
              People
            </h2>
            <button
              type="button"
              aria-label="Remove people section"
              onClick={() => hide('people')}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <Icon name="times" size={14} />
            </button>
          </div>
          <p>Suggest people to follow - this is especially useful for new users.</p>
          {currentUser && (
            <span className="co-chip" style={{ width: 'fit-content' }}>
              <Avatar seed={currentUser.pubkey} size={20} />
              {currentUser.displayName}
              <Icon name="times" size={11} />
            </span>
          )}
        </div>
      )}

      {sections.includes('relays') && (
        <div className="co-card co-card-alt" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="co-staatliches" style={{ fontSize: '1.875rem' }}>
              Relays
            </h2>
            <button
              type="button"
              aria-label="Remove relays section"
              onClick={() => hide('relays')}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <Icon name="times" size={14} />
            </button>
          </div>
          <p>
            Invite people to use specific relays. An invite code can optionally be provided to grant
            access to private relays.
          </p>
          <input
            className="co-input"
            style={{ height: '2.25rem' }}
            placeholder="Claim (optional)"
            aria-label="Relay claim"
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button
          type="button"
          className="co-link"
          style={{
            textDecoration: 'none',
            opacity: sections.includes('people') ? 0.5 : 1,
            pointerEvents: sections.includes('people') ? 'none' : 'auto',
          }}
          onClick={() => show('people')}
        >
          + Add people
        </button>
        <button
          type="button"
          className="co-link"
          style={{
            textDecoration: 'none',
            opacity: sections.includes('relays') ? 0.5 : 1,
            pointerEvents: sections.includes('relays') ? 'none' : 'auto',
          }}
          onClick={() => show('relays')}
        >
          + Add relays
        </button>
      </div>

      <button
        type="button"
        className="co-btn co-btn-accent"
        disabled={sections.length === 0}
        onClick={onSubmit}
      >
        Create Invite Link
      </button>
    </div>
  );
};
