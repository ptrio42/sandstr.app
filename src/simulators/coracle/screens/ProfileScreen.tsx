/**
 * Profile — `PersonDetail.svelte`, spec §11.
 *
 * Three things a reproducer gets wrong here:
 *  - There is NO banner. `grep -rni banner src/` in the real repo returns zero
 *    hits, and the profile editor has no banner field.
 *  - There is NO follower/following stats row. `PersonStats.svelte` exists but
 *    has zero importers — dead code. The counts live only as tab badges.
 *  - The lightning-address row IS the zap button. There is no separate zap
 *    control on a profile.
 */
import React, { useState } from 'react';
import type { MockNote, MockUser } from '../../../data/mock';
import { Avatar, WotScore } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { NoteCard } from '../components/NoteCard';
import { commaFormat, fullNpub, wotScore } from '../coracleUtils';

const TABS = ['Notes', 'Likes', 'Collections', 'Relays', 'Following', 'Followers'] as const;

interface ProfileScreenProps {
  user: MockUser;
  isSelf: boolean;
  isFollowing: boolean;
  notes: MockNote[];
  usersByPubkey: Map<string, MockUser>;
  following: Set<string>;
  liked: Set<string>;
  reposted: Set<string>;
  zapped: Record<string, number>;
  onFollow: () => void;
  onCopy: (what: string) => void;
  onLike: (id: string) => void;
  onRepost: (id: string) => void;
  onZap: (id: string) => void;
  onReply: (n: MockNote) => void;
  onOpen: (n: MockNote) => void;
  onViewProfile: (u: MockUser) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  isSelf,
  isFollowing,
  notes,
  usersByPubkey,
  following,
  liked,
  reposted,
  zapped,
  onFollow,
  onCopy,
  onLike,
  onRepost,
  onZap,
  onReply,
  onOpen,
  onViewProfile,
}) => {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Notes');
  const own = notes.filter((n) => n.pubkey === user.pubkey);

  const badge = (t: string) => {
    if (t === 'Following') return commaFormat(user.followingCount);
    if (t === 'Followers') return commaFormat(user.followersCount);
    return undefined;
  };

  return (
    <>
      <div
        className="co-card"
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}
      >
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Avatar seed={user.pubkey} size={128} />
            <button type="button" className="co-btn" onClick={onFollow}>
              {isSelf ? 'Edit' : isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', maxWidth: '80%', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName}
              </div>
              <WotScore score={wotScore(user.pubkey)} accent={isSelf || isFollowing} />
            </div>

            {/* Full npub + the TWO icons of CopyValueSimple: copy and qrcode. */}
            <div style={{ marginTop: '1rem', wordBreak: 'break-all', opacity: 0.75 }}>
              {fullNpub(user.pubkey)}
              <button
                type="button"
                aria-label="Copy npub"
                onClick={() => onCopy('Npub')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--co-neutral-400)',
                  cursor: 'pointer',
                  padding: '0 0.25rem',
                }}
              >
                <Icon name="copy" size={13} />
              </button>
              <button
                type="button"
                aria-label="Show npub QR code"
                onClick={() => onCopy('QR code')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--co-neutral-400)',
                  cursor: 'pointer',
                  padding: '0 0.25rem',
                }}
              >
                <Icon name="qrcode" size={13} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                maxWidth: '80%',
                flexDirection: 'column',
                gap: '0.75rem',
                marginTop: '1rem',
              }}
            >
              {user.nip05 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icon name="at" size={14} style={{ color: 'var(--co-accent)', width: '1rem' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.nip05}</span>
                </div>
              )}
              {user.lightningAddress && (
                <button
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: 0,
                    font: 'inherit',
                  }}
                  onClick={() => onCopy('Zap')}
                >
                  <Icon name="bolt" size={14} style={{ color: 'var(--co-accent)', width: '1rem' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.lightningAddress}
                  </span>
                </button>
              )}
              {user.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icon name="link" size={14} style={{ color: 'var(--co-accent)', width: '1rem' }} />
                  <span className="co-link">{user.website.replace(/^https?:\/\//, '')}</span>
                </div>
              )}
            </div>

            <p style={{ marginTop: '1rem', fontWeight: 300, opacity: 0.75 }}>{user.bio}</p>
          </div>
        </div>

        <button
          type="button"
          className="co-overflow-btn"
          aria-label="Profile options"
          style={{ position: 'absolute', right: '1rem', top: '1rem' }}
          onClick={() => onCopy('Profile options')}
        >
          <Icon name="ellipsis-v" size={12} />
        </button>
      </div>

      <div style={{ display: 'flex', overflowX: 'auto' }}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`co-tab ${tab === t ? 'co-tab-active' : ''}`}
            style={{ whiteSpace: 'nowrap', padding: '0.5rem 0.75rem' }}
            onClick={() => setTab(t)}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {t}
              {badge(t) && (
                <span
                  style={{
                    height: '1.5rem',
                    borderRadius: '9999px',
                    background: 'var(--co-neutral-700)',
                    padding: '0 0.5rem',
                    fontSize: '0.75rem',
                    lineHeight: '1.5rem',
                  }}
                >
                  {badge(t)}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {tab === 'Notes' ? (
        own.length > 0 ? (
          own.map((note, i) => (
            <NoteCard
              key={note.id}
              note={note}
              author={user}
              alt={i % 2 === 1}
              liked={liked.has(note.id)}
              reposted={reposted.has(note.id)}
              zapped={zapped[note.id] ?? 0}
              following={following.has(user.pubkey)}
              onLike={() => onLike(note.id)}
              onRepost={() => onRepost(note.id)}
              onZap={() => onZap(note.id)}
              onReply={() => onReply(note)}
              onOpen={() => onOpen(note)}
              onViewProfile={() => onViewProfile(user)}
            />
          ))
        ) : (
          <p style={{ padding: '3rem 0', textAlign: 'center' }}>No notes found.</p>
        )
      ) : (
        <p style={{ padding: '3rem 0', textAlign: 'center' }}>
          Nothing to show here yet — check back later!
        </p>
      )}
    </>
  );
};
