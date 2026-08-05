/**
 * The home feed (`Feeds.svelte` → `Feed.svelte`), spec §6.
 *
 * Controls row, then cards, then the exhausted state. The right rail is
 * rendered by the shell, not here, because upstream's rail is `position: fixed`
 * at `xl` and a sibling Card below it — the shell owns that decision.
 */
import React from 'react';
import type { MockNote, MockUser } from '../../../data/mock';
import { NoteCard, MoreReplies } from '../components/NoteCard';
import { FeedSelector } from '../components/FeedSelector';
import { Icon } from '../components/Icon';

interface FeedsScreenProps {
  notes: MockNote[];
  usersByPubkey: Map<string, MockUser>;
  isAuthed: boolean;
  showReplies: boolean;
  onToggleReplies: () => void;
  onCustomize: () => void;
  activeFeed: string;
  onSelectFeed: (f: string) => void;
  onEdit: (what: string) => void;
  /** Rail is inline (as a card above the feed) when the container is narrow. */
  railInline: boolean;
  search: string;
  onSearch: (v: string) => void;
  onShowLogin: () => void;
  liked: Set<string>;
  reposted: Set<string>;
  zapped: Record<string, number>;
  following: Set<string>;
  onLike: (id: string) => void;
  onRepost: (id: string) => void;
  onZap: (id: string) => void;
  onReply: (n: MockNote) => void;
  onOpen: (n: MockNote) => void;
  onViewProfile: (u: MockUser) => void;
}

export const FeedsScreen: React.FC<FeedsScreenProps> = ({
  notes,
  usersByPubkey,
  isAuthed,
  showReplies,
  onToggleReplies,
  onCustomize,
  activeFeed,
  onSelectFeed,
  onEdit,
  railInline,
  search,
  onSearch,
  onShowLogin,
  liked,
  reposted,
  zapped,
  following,
  onLike,
  onRepost,
  onZap,
  onReply,
  onOpen,
  onViewProfile,
}) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const filtered = search.trim()
    ? notes.filter((n) => n.content.toLowerCase().includes(search.trim().toLowerCase()))
    : notes;

  return (
    <>
      {/* Controls — `flex flex-grow items-center justify-end gap-2` */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
        {/* `hidden xs:block`, sized rather than flexed: upstream's search sits
            in the right-aligned group, it does not stretch to the column edge. */}
        <div style={{ position: 'relative', flex: '0 1 19rem', minWidth: 0 }}>
          <input
            className="co-input co-input-dark"
            style={{ paddingRight: '2rem' }}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Search this feed"
          />
          <span
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              opacity: 0.8,
            }}
          >
            <Icon name="search" size={13} />
          </span>
        </div>

        {/* `btn btn-accent border-none` when showing replies, `btn btn-low
            border-none opacity-50` when hidden (Feed.svelte:148-152). */}
        <button
          type="button"
          className={`co-btn ${showReplies ? 'co-btn-accent' : 'co-btn-low'}`}
          style={showReplies ? undefined : { opacity: 0.5 }}
          onClick={onToggleReplies}
        >
          Replies
        </button>
        {isAuthed && (
          <button type="button" className="co-btn co-btn-low" onClick={onCustomize}>
            Customize
          </button>
        )}
      </div>

      {/* Below xl the selector is a plain card above the feed. */}
      {railInline && (
        <FeedSelector active={activeFeed} onSelect={onSelectFeed} onEdit={onEdit} />
      )}

      {/* The logged-out banner sits ABOVE a fully populated feed — Coracle
          never walls the content off (Feeds.svelte:17-26). */}
      {!isAuthed && (
        <div style={{ padding: '4rem 0', textAlign: 'center' }}>
          <p style={{ fontSize: '1.25rem' }}>Don&apos;t have an account?</p>
          <p>
            Click{' '}
            <button type="button" className="co-link" onClick={onShowLogin}>
              here
            </button>{' '}
            to join the nostr network.
          </p>
        </div>
      )}

      {filtered.map((note, i) => {
        const author = usersByPubkey.get(note.pubkey);
        const hidden = note.replies > 3 ? note.replies - 3 : 0;
        return (
          <NoteCard
            key={note.id}
            note={note}
            author={author}
            alt={i % 2 === 1}
            liked={liked.has(note.id)}
            reposted={reposted.has(note.id)}
            zapped={zapped[note.id] ?? 0}
            following={author ? following.has(author.pubkey) : false}
            onLike={() => onLike(note.id)}
            onRepost={() => onRepost(note.id)}
            onZap={() => onZap(note.id)}
            onReply={() => onReply(note)}
            onOpen={() => onOpen(note)}
            onViewProfile={() => author && onViewProfile(author)}
          >
            {hidden > 0 && !expanded.has(note.id) && (
              <div style={{ marginTop: '1rem' }}>
                <MoreReplies
                  count={hidden}
                  onClick={() => setExpanded((prev) => new Set(prev).add(note.id))}
                />
              </div>
            )}
          </NoteCard>
        );
      })}

      {filtered.length === 0 && (
        <p style={{ padding: '3rem 0', textAlign: 'center' }}>No notes found.</p>
      )}

      {/* Exhausted state — pumpkin + "That's all!" (Feed.svelte:189-193). The
          real asset is Jon Staab's; the shape is drawn locally instead. */}
      {filtered.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '6rem 0',
          }}
        >
          <svg width="80" height="80" viewBox="0 0 64 64" aria-hidden="true">
            <ellipse cx="32" cy="40" rx="24" ry="19" fill="var(--co-accent)" />
            <ellipse cx="32" cy="40" rx="10" ry="19" fill="var(--co-accent)" opacity="0.55" />
            <path d="M30 20c0-5 2-8 6-9-2 3-2 6 0 9z" fill="var(--co-success)" />
          </svg>
          <p>That&apos;s all!</p>
        </div>
      )}
    </>
  );
};
