/**
 * One mock note, rendered by eight clients' real note cards.
 *
 * This is the thing no real client can show you: the same post, at the same
 * moment, in eight interfaces. Doing it for real needs eight devices and eight
 * accounts. It is possible here for one reason — every simulator already reads
 * from the same `src/data/mock` bank (CLAUDE.md), so the note is genuinely
 * identical and only the chrome differs.
 *
 * Each adapter mounts that client's OWN card component — the one its feed uses,
 * with its own action order, icons and colours. Nothing here re-implements a
 * card; a re-implementation would compare our two guesses instead of their two
 * designs, which is the whole point missed.
 *
 * Two rules for this file:
 *
 * 1. THEME IS THE CLIENT'S SHIPPING DEFAULT, NOT THE HOST'S. `ClientEntry.theme`
 *    in the registry records what the real app opens in (Coracle dark from
 *    state.ts, YakiHonne light, Snort "system"). A comparison strip that
 *    repainted every card in the host's current theme would be comparing
 *    sandstr with itself. YakiHonne's sheet has no dark variant at all, so
 *    following the host would also simply break it.
 *
 * 2. HANDLERS ARE INERT ON PURPOSE. These cards are a shop window, not a
 *    simulator — clicking one should not open a thread that does not exist in
 *    this route. Anything interactive lives one click away, in /c/<id>.
 *
 * Three clients need a shape mapper because their card predates the shared
 * MockNote plumbing and takes its own view model (Primal's PNote, YakiHonne's
 * YakiNoteData, Amethyst's PostData). The mapping is mechanical and lives with
 * its adapter.
 */
import { useState, type ComponentType } from 'react';
import type { MockNote, MockUser } from '../../data/mock';

import { NoteCard as DamusNote } from '../../simulators/damus/components/NoteCard';
import { NoteCard as SnortNote } from '../../simulators/snort/components/NoteCard';
import { NoteCard as CoracleNote } from '../../simulators/coracle/components/NoteCard';
import { PostCard as NosturPost } from '../../simulators/nostur/components/PostCard';
import { PostCard as WispPost } from '../../simulators/wisp/components/PostCard';
import { NoteCard as YakiNote } from '../../simulators/yakihonne/components/NoteCard';
import { NoteCard as PrimalNote } from '../../simulators/primal/web/components/NoteCard';
import { MaterialCard } from '../../simulators/amethyst/components/MaterialCard';

import '../../simulators/damus/damus.theme.css';
import '../../simulators/snort/snort.theme.css';
import '../../simulators/coracle/coracle.theme.css';
import '../../simulators/nostur/nostur.theme.css';
import '../../simulators/wisp/wisp.theme.css';
import '../../simulators/yakihonne/yakihonne.theme.css';
import '../../simulators/primal/web/primal-web.theme.css';
import '../../simulators/amethyst/amethyst.theme.css';

export interface NotePreviewProps {
  note: MockNote;
  author: MockUser;
  /** Snort resolves mentions and quotes against the full user bank. */
  users: MockUser[];
}

const noop = () => {};

/** Sats total → the short form several cards print beside the bolt. */
function short(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

function timeAgo(ts: number): string {
  const diff = Math.max(1, Math.floor(Date.now() / 1000) - ts);
  if (diff < 3600) return `${Math.floor(diff / 60) || 1}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

// ------------------------------------------------------------------ Damus --
function DamusAdapter({ note, author }: NotePreviewProps) {
  return <DamusNote note={note} author={author} />;
}

// ------------------------------------------------------------------ Snort --
function SnortAdapter({ note, author, users }: NotePreviewProps) {
  return <SnortNote note={note} author={author} users={users} isRoot />;
}

// ---------------------------------------------------------------- Coracle --
// Coracle's card owns no state of its own — the feed holds it, so the adapter
// does too. `alt` false is the neutral surface a root note gets (AltColor).
function CoracleAdapter({ note, author }: NotePreviewProps) {
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

// ----------------------------------------------------------------- Nostur --
function NosturAdapter({ note, author }: NotePreviewProps) {
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

// ------------------------------------------------------------------- Wisp --
function WispAdapter({ note, author }: NotePreviewProps) {
  return <WispPost note={note} author={author} showDivider={false} />;
}

// -------------------------------------------------------------- YakiHonne --
// YakiHonne's card takes its own view model: a seed instead of a user (its
// Avatar is seed-driven) and separate counters, including quotes, which
// MockNote has no field for — so it stays at 0 rather than being invented.
function YakiAdapter({ note, author }: NotePreviewProps) {
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
        reactions: note.likes,
        replies: note.replies,
        reposts: note.reposts,
        quotes: 0,
        zaps: note.zapAmount,
      }}
    />
  );
}

// ----------------------------------------------------------------- Primal --
function PrimalAdapter({ note, author }: NotePreviewProps) {
  return (
    <PrimalNote
      note={{
        id: note.id,
        name: author.displayName,
        handle: author.nip05 ?? `@${author.username}`,
        time: timeAgo(note.created_at),
        verified: !!author.nip05,
        body: note.content,
        reply: note.replies,
        zap: short(note.zapAmount),
        like: note.likes,
        repost: note.reposts,
      }}
    />
  );
}

// --------------------------------------------------------------- Amethyst --
function AmethystAdapter({ note, author }: NotePreviewProps) {
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

export interface NoteAdapter {
  clientId: string;
  Component: ComponentType<NotePreviewProps>;
  /**
   * The class the client's theme CSS is scoped to — WITHOUT a theme modifier.
   *
   * The theme itself is applied by the caller as BOTH a class and `data-theme`,
   * because the eight sheets are split on which one they key off: Damus and
   * Coracle read a class (`.damus-simulator.dark`), Amethyst and YakiHonne read
   * the attribute (`.amethyst-simulator[data-theme="dark"]`). Each simulator's
   * own root sets both, which is why this never came up before — and why
   * setting only the class here rendered Amethyst light on a dark page and
   * YakiHonne dark when its shipping default is light.
   */
  rootClass: string;
}

export const NOTE_ADAPTERS: NoteAdapter[] = [
  { clientId: 'damus', Component: DamusAdapter, rootClass: 'damus-simulator' },
  { clientId: 'amethyst', Component: AmethystAdapter, rootClass: 'amethyst-simulator' },
  { clientId: 'primal', Component: PrimalAdapter, rootClass: 'primal-web' },
  { clientId: 'yakihonne', Component: YakiAdapter, rootClass: 'yakihonne-simulator' },
  { clientId: 'snort', Component: SnortAdapter, rootClass: 'snort-simulator' },
  { clientId: 'wisp', Component: WispAdapter, rootClass: 'wisp-simulator' },
  { clientId: 'nostur', Component: NosturAdapter, rootClass: 'nostur-simulator' },
  { clientId: 'coracle', Component: CoracleAdapter, rootClass: 'coracle-simulator' },
];
