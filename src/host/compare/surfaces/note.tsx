/**
 * Surface: one mock note, rendered by eight clients' real note cards.
 *
 * The thing no real client can show you — the same post, at the same moment, in
 * eight interfaces. Doing it for real needs eight devices and eight accounts.
 * It works here because every simulator already reads `src/data/mock`, so the
 * note is genuinely identical and only the chrome differs.
 *
 * This surface is FLUID (no `natural` size): a note card is designed to fill a
 * column, and it is the one surface worth reading at 1:1 rather than scaled.
 *
 * Handlers are inert on purpose — these cards are a shop window, not a
 * simulator. Anything interactive lives one click away, in /c/<id>.
 *
 * Three clients need a shape mapper because their card takes its own view model
 * (Primal's PNote, YakiHonne's YakiNoteData, Amethyst's PostData) rather than
 * the shared MockNote. The mapping is mechanical and lives beside its adapter.
 */
import { useState } from 'react';

import { NoteCard as DamusNote } from '../../../simulators/damus/components/NoteCard';
import { NoteCard as SnortNote } from '../../../simulators/snort/components/NoteCard';
import { NoteCard as CoracleNote } from '../../../simulators/coracle/components/NoteCard';
import { PostCard as NosturPost } from '../../../simulators/nostur/components/PostCard';
import { PostCard as WispPost } from '../../../simulators/wisp/components/PostCard';
import { NoteCard as YakiNote } from '../../../simulators/yakihonne/components/NoteCard';
import { NoteCard as PrimalNote } from '../../../simulators/primal/web/components/NoteCard';
import { MaterialCard } from '../../../simulators/amethyst/components/MaterialCard';

import type { Surface, SurfacePreviewProps } from './types';

const noop = () => {};

/** Sats total → the short form several cards print beside the bolt. */
export function short(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

export function timeAgo(ts: number): string {
  const diff = Math.max(1, Math.floor(Date.now() / 1000) - ts);
  if (diff < 3600) return `${Math.floor(diff / 60) || 1}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function DamusNoteCell({ note, author }: SurfacePreviewProps) {
  return <DamusNote note={note} author={author} />;
}

function SnortNoteCell({ note, author, users }: SurfacePreviewProps) {
  return <SnortNote note={note} author={author} users={users} isRoot />;
}

// Coracle's card owns no state — the feed holds it, so the adapter does too.
// `alt` false is the neutral surface a root note gets (AltColor).
function CoracleNoteCell({ note, author }: SurfacePreviewProps) {
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [zapped, setZapped] = useState(0);
  return (
    <CoracleNote
      note={note}
      author={author}
      alt={false}
      liked={liked}
      reposted={reposted}
      zapped={zapped}
      following={false}
      onLike={() => setLiked((v) => !v)}
      onRepost={() => setReposted((v) => !v)}
      onZap={() => setZapped((v) => v + 21)}
      onReply={noop}
      onOpen={noop}
      onViewProfile={noop}
    />
  );
}

function NosturNoteCell({ note, author }: SurfacePreviewProps) {
  const [reacted, setReacted] = useState(false);
  return (
    <NosturPost
      note={note}
      author={author}
      following={false}
      bookmarked={false}
      reacted={reacted}
      reposted={false}
      zapped={false}
      onOpenProfile={noop}
      onReply={noop}
      onRepost={noop}
      onReact={() => setReacted((v) => !v)}
      onZap={noop}
      onBookmark={noop}
      onFollow={noop}
    />
  );
}

function WispNoteCell({ note, author }: SurfacePreviewProps) {
  return <WispPost note={note} author={author} showDivider={false} />;
}

// YakiHonne's card takes a seed instead of a user (its Avatar is seed-driven)
// and separate counters, including quotes — which MockNote has no field for, so
// it stays 0 rather than being invented.
function YakiNoteCell({ note, author }: SurfacePreviewProps) {
  return (
    <YakiNote
      note={{
        id: note.id,
        name: author.displayName,
        seed: author.username,
        nip05: !!author.nip05,
        zap: !!author.lightningAddress,
        timeAgo: timeAgo(note.created_at),
        content: note.content,
        // A pasted note carries these; a curated mock one does not.
        images: note.images?.length ? note.images : undefined,
        reactions: note.likes,
        replies: note.replies,
        reposts: note.reposts,
        quotes: 0,
        zaps: note.zapAmount,
      }}
    />
  );
}

function PrimalNoteCell({ note, author }: SurfacePreviewProps) {
  return (
    <PrimalNote
      note={{
        id: note.id,
        name: author.displayName,
        handle: author.nip05 ?? `@${author.username}`,
        time: timeAgo(note.created_at),
        verified: !!author.nip05,
        body: note.content,
        media: note.images?.[0],
        link: note.linkPreview
          ? {
              title: note.linkPreview.title || note.linkPreview.siteName,
              desc: note.linkPreview.description.slice(0, 140),
              url: note.linkPreview.url,
            }
          : undefined,
        reply: note.replies,
        zap: short(note.zapAmount),
        like: note.likes,
        repost: note.reposts,
      }}
    />
  );
}

function AmethystNoteCell({ note, author }: SurfacePreviewProps) {
  return (
    <MaterialCard
      post={{
        id: note.id,
        author: {
          name: author.displayName,
          handle: `@${author.username}`,
          avatar: author.avatar,
          nip05: author.nip05,
          isVerified: !!author.nip05,
        },
        content: note.content,
        timestamp: timeAgo(note.created_at),
        images: note.images?.length ? note.images : undefined,
        stats: {
          replies: note.replies,
          reposts: note.reposts,
          zaps: note.zapAmount,
          likes: note.likes,
        },
        hashtags: note.hashtags,
      }}
    />
  );
}

export const noteSurface: Surface = {
  id: 'note',
  label: 'A note',
  blurb:
    'Identical note, identical author, identical numbers — everything that differs is the client’s own design: which actions it shows, in what order, and what it colours.',
  byClient: {
    damus: { Component: DamusNoteCell, rootClass: 'damus-simulator' },
    amethyst: { Component: AmethystNoteCell, rootClass: 'amethyst-simulator' },
    primal: { Component: PrimalNoteCell, rootClass: 'primal-web' },
    yakihonne: { Component: YakiNoteCell, rootClass: 'yakihonne-simulator' },
    snort: { Component: SnortNoteCell, rootClass: 'snort-simulator' },
    wisp: { Component: WispNoteCell, rootClass: 'wisp-simulator' },
    nostur: { Component: NosturNoteCell, rootClass: 'nostur-simulator' },
    coracle: { Component: CoracleNoteCell, rootClass: 'coracle-simulator' },
  },
};
