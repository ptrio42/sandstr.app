/**
 * Compose — `NoteCreate.svelte`, spec §8, and the note detail modal, §7.4.
 *
 * Two things a reproducer usually misses on the composer:
 *  - the heading is `text-2xl font-bold` LATO, so it is NOT uppercase, unlike
 *    almost every other heading in the app;
 *  - the editor is WHITE with black text while editing, sitting in a
 *    `rounded-xl border-neutral-600` box on a dark page. It is the brightest
 *    thing on the screen.
 */
import React, { useState } from 'react';
import type { MockNote, MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { formatSats, formatTimestamp, seededCount, shortNpub } from '../coracleUtils';

export const ComposeScreen: React.FC<{
  replyTo?: MockNote | null;
  replyAuthor?: MockUser;
  /** Receives the composed text — see composeBridge.ts. */
  onSend: (text: string) => void;
}> = ({ replyTo, replyAuthor, onSend }) => {
  const [value, setValue] = useState('');
  const chars = value.length;
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>
        {replyTo ? 'Reply' : 'Create a Note'}
      </span>

      {replyTo && replyAuthor && (
        <div style={{ borderLeft: '2px solid var(--co-neutral-600)', paddingLeft: '1rem', opacity: 0.75 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Avatar seed={replyAuthor.pubkey} size={24} />
            <span>{replyAuthor.displayName}</span>
          </div>
          <p style={{ marginTop: '0.25rem' }}>{replyTo.content.slice(0, 160)}</p>
        </div>
      )}

      <strong>What do you want to say?</strong>

      <div
        style={{
          borderRadius: '0.75rem',
          border: '1px solid var(--co-neutral-600)',
          padding: '0.75rem',
          background: '#fff',
          color: '#000',
        }}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Note content"
          style={{
            minHeight: '6rem',
            width: '100%',
            border: 'none',
            outline: 'none',
            resize: 'none',
            background: 'transparent',
            color: 'inherit',
            font: 'inherit',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          color: 'var(--co-neutral-200)',
          fontSize: '0.9375rem',
        }}
      >
        <span>{chars} characters</span>
        <span>•</span>
        <span>{words} words</span>
        <span>•</span>
        <button type="button" className="co-link">
          + Add poll options
        </button>
        <span>•</span>
        <button type="button" className="co-link">
          Show Preview
        </button>
        <Icon name="cog" size={14} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          className="co-btn co-btn-accent"
          style={{ flexGrow: 1 }}
          onClick={() => onSend(value)}
        >
          Send
        </button>
        <button type="button" className="co-btn" aria-label="Upload media">
          <Icon name="upload" size={15} />
        </button>
      </div>
    </div>
  );
};

/**
 * Note detail — `NoteInfo.svelte`, §7.4. Sections in upstream's order:
 * Zapped By · Liked By · Reposted By · Relays · Details.
 */
export const NoteDetailScreen: React.FC<{
  note: MockNote;
  author: MockUser | undefined;
  users: MockUser[];
  joined: Set<string>;
  onViewProfile: (u: MockUser) => void;
  onCopy: (what: string) => void;
}> = ({ note, author, users, joined, onViewProfile, onCopy }) => {
  const likers = users.slice(0, 6);
  const relayCount = 1 + seededCount(note.id, 61, 5);
  const relays = [...joined].slice(0, Math.max(1, Math.min(relayCount, 3)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="co-card">
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Avatar seed={author?.pubkey ?? note.pubkey} size={40} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span>{author?.displayName ?? 'unknown'}</span>
              <span style={{ fontSize: '0.75rem' }}>{formatTimestamp(note.created_at)}</span>
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>
              {shortNpub(author?.pubkey ?? note.pubkey)}
            </div>
          </div>
        </div>
        <p style={{ marginTop: '0.5rem', paddingLeft: '3.5rem', whiteSpace: 'pre-wrap' }}>
          {note.content}
        </p>
      </div>

      {note.zapAmount > 0 && (
        <section>
          <h2 className="co-staatliches" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
            Zapped By
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="bolt" size={16} style={{ color: 'var(--co-accent)' }} />
            <strong>{formatSats(note.zapAmount)}</strong> sats
          </div>
        </section>
      )}

      <section>
        <h2 className="co-staatliches" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
          Liked By
        </h2>
        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          }}
        >
          {likers.map((u) => (
            <button
              key={u.pubkey}
              type="button"
              onClick={() => onViewProfile(u)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                textAlign: 'left',
                padding: 0,
                font: 'inherit',
              }}
            >
              <Avatar seed={u.pubkey} size={36} />
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {u.displayName}
                </span>
                <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.6 }}>
                  {shortNpub(u.pubkey)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="co-staatliches" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
          Relays
        </h2>
        <p style={{ marginBottom: '0.75rem' }}>
          This note was found on {relays.length} {relays.length === 1 ? 'relay' : 'relays'} below.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {relays.map((url) => (
            <div
              key={url}
              className="co-card"
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem' }}
            >
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
                <Icon name="server" size={15} />
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                {url.replace(/^wss:\/\//, '')}
                <span
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.75rem',
                    color: 'var(--co-neutral-400)',
                  }}
                >
                  <span>10 NIPs</span>
                  <span>Connected 1 time</span>
                </span>
              </span>
              {/* The same INFO / EXPLORE / LEAVE row the relay cards carry —
                  present on every relay row of the Details modal (§7.4). */}
              <span style={{ display: 'flex', flexShrink: 0, gap: '0.5rem' }}>
                {(
                  [
                    ['Info', 'plain'],
                    ['Explore', 'plain'],
                    ['Leave', 'dark'],
                  ] as const
                ).map(([label, variant]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onCopy(label)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '0.375rem',
                      padding: '0.25rem 1rem',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      border: 'none',
                      cursor: 'pointer',
                      background:
                        variant === 'plain' ? 'var(--co-tinted-100-l)' : 'var(--co-tinted-700-d)',
                      color: variant === 'plain' ? 'var(--co-tinted-700-d)' : 'var(--co-neutral-100)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="co-staatliches" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
          Details
        </h2>
        <p style={{ marginBottom: '0.5rem' }}>Link</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            aria-label="Copy link"
            onClick={() => onCopy('Link')}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <Icon name="copy" size={15} />
          </button>
          <button
            type="button"
            aria-label="Show QR code"
            onClick={() => onCopy('QR code')}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <Icon name="qrcode" size={15} />
          </button>
          <code
            style={{
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
              fontSize: '0.8125rem',
            }}
          >
            nostr:nevent1{note.id.slice(0, 44)}
          </code>
        </div>
      </section>
    </div>
  );
};
