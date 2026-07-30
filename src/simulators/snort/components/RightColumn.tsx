import React, { useMemo, useState } from 'react';
import type { MockNote, MockUser } from '../../../data/mock';
import { Avatar } from './Avatar';
import { Icon, type IconName } from './Icon';
import { noteImages, noteTime, shortNpub } from '../snortUtils';

/**
 * Snort's right widget column (`RightColumn.tsx`, screen-map §5.4).
 *
 * `hidden lg:flex flex-col lg:w-1/3 sticky top-0 h-screen py-3 px-4 border-l` —
 * the `.snort-right` class carries all of that; the shell decides whether to
 * mount us at all (>=1024px container width, JS-gated exactly like upstream).
 *
 * The order is not decorative, it is `RightColumn.tsx`'s own array:
 *   always `<SearchBox />` → `<span className="mb-4" />` → the widget stack.
 *   Logged in:  Ask-Snort AI → TaskList → Invite Friends → Trending Notes →
 *               Latest Articles.
 *   Logged out: TaskList only.
 * (`LiveStreams` / `TrendingPeople` / `TrendingHashtags` are cases in the same
 * switch but are commented out of the array upstream — unreachable, so absent.)
 *
 * Things this reproduction is deliberately careful about:
 *  - `BaseWidget` = a `layer-1` card whose title row is
 *    `flex gap-2 items-center text-xl font-semibold mb-2`, with the optional
 *    icon sitting in a `layer-2 rounded-full` chip.
 *  - Accent discipline (§1): `--snort-primary` is CTA/compose only, so the one
 *    orange thing here is the Ask-Snort lightbulb. Everything link-ish is
 *    `--snort-highlight` violet. They never blend.
 *  - Every bare button is a pill (`.snort-btn`), and in LIGHT mode the theme's
 *    specificity trap turns them white — which is precisely what the recording
 *    shows ("white Copy link pill", "gear in a white circle").
 *  - The trending rows are `<TrendingNotes small={true} count={6} />`: a compact
 *    row with a ~30px avatar and NO action bar, so `NoteCard` is not reused.
 *  - Zero remote requests: avatars are drawn locally, article covers come from
 *    `noteImages()` `data:` URIs.
 */

export interface RightColumnProps {
  currentUser: MockUser | null;
  notes: MockNote[];
  users: MockUser[];
  onViewProfile: (u: MockUser) => void;
}

export function RightColumn({ currentUser, notes, users, onViewProfile }: RightColumnProps) {
  const loggedIn = currentUser !== null;

  const usersByPubkey = useMemo(() => {
    const m = new Map<string, MockUser>();
    for (const u of users) m.set(u.pubkey, u);
    return m;
  }, [users]);

  return (
    <aside className="snort-right">
      <SearchBox users={users} onViewProfile={onViewProfile} />

      {/* `<span className="mb-4">` upstream; the column's own gap covers it. */}
      <div className="flex flex-col gap-4">
        {loggedIn && <AskSnortWidget />}

        <TaskList loggedIn={loggedIn} />

        {loggedIn && (
          <>
            <InviteFriendsWidget />
            <TrendingNotesWidget
              notes={notes}
              usersByPubkey={usersByPubkey}
              onViewProfile={onViewProfile}
            />
            <LatestArticlesWidget
              notes={notes}
              usersByPubkey={usersByPubkey}
              onViewProfile={onViewProfile}
            />
          </>
        )}
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ *
 * BaseWidget
 * ------------------------------------------------------------------ */

interface WidgetProps {
  title?: string;
  icon?: IconName;
  /** The chip glyph's colour — a `--snort-*` token. */
  iconColor?: string;
  /** Right-hand side of the title row (upstream's context-menu slot). */
  action?: React.ReactNode;
  /** `layer-1` is `px-3 py-2`; Ask-Snort overrides it to a flat `p-3`. */
  padding?: string;
  children?: React.ReactNode;
}

function Widget({ title, icon, iconColor, action, padding, children }: WidgetProps) {
  return (
    <section className="snort-layer-1" style={padding ? { padding } : undefined}>
      {(title || action) && (
        <div className="mb-2 flex items-center gap-2 text-xl font-semibold">
          {icon && (
            <span
              className="flex items-center justify-center rounded-full p-2"
              style={{ backgroundColor: 'var(--snort-layer-2)', color: iconColor }}
            >
              <Icon name={icon} size={20} />
            </span>
          )}
          {title && <span className="min-w-0 truncate">{title}</span>}
          {action && <span className="ml-auto flex shrink-0 items-center gap-1">{action}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

/** A shrunken `IconButton` — upstream passes size 18 into the 40px circle. */
function SmallIconButton({
  name,
  label,
  rotated = false,
  onClick,
}: {
  name: IconName;
  label: string;
  rotated?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="snort-btn icon"
      style={{ width: 32, height: 32 }}
      aria-label={label}
      onClick={onClick}
    >
      <span style={rotated ? { transform: 'rotate(180deg)', display: 'flex' } : undefined}>
        <Icon name={name} size={18} />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * SearchBox — `SearchBox.tsx:139-176`
 * ------------------------------------------------------------------ */

function SearchBox({
  users,
  onViewProfile,
}: {
  users: MockUser[];
  onViewProfile: (u: MockUser) => void;
}) {
  const [term, setTerm] = useState('');

  const matches = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    return users
      .filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          (u.nip05 ?? '').toLowerCase().includes(q),
      )
      .slice(0, 3);
  }, [term, users]);

  return (
    <div
      className="snort-layer-1 relative flex items-center"
      style={{ padding: 0, overflow: 'visible' }}
    >
      <input
        className="snort-input"
        // `w-full !border-none !rounded-none leading-10 py-2.5 px-4`
        style={{
          border: 'none',
          borderRadius: 0,
          background: 'transparent',
          padding: '10px 16px',
          lineHeight: '40px',
        }}
        placeholder="Search"
        value={term}
        // Upstream refuses anything that looks like a private key outright.
        onChange={(e) => {
          const v = e.target.value;
          if (!v.trim().toLowerCase().startsWith('nsec1')) setTerm(v);
        }}
        aria-label="Search"
      />
      <span
        className="mx-4 my-2.5 shrink-0"
        style={{ color: 'var(--snort-text-secondary)' }}
        aria-hidden="true"
      >
        <Icon name="search-outline" size={24} />
      </span>

      {/* `absolute top-full mt-2 w-full border shadow-lg rounded-lg z-10
          overflow-hidden` — first row is always "Search notes: {term}". */}
      {term.trim().length > 0 && (
        <div
          className="absolute left-0 top-full z-10 mt-2 w-full overflow-hidden rounded-lg shadow-lg"
          style={{
            backgroundColor: 'var(--snort-bg)',
            border: '1px solid var(--snort-border)',
          }}
        >
          <div className="truncate px-4 py-2 text-sm">Search notes: {term.trim()}</div>
          {matches.map((u) => (
            <div
              key={u.pubkey}
              className="flex w-full cursor-pointer items-center gap-2 px-4 py-2"
              onClick={() => {
                setTerm('');
                onViewProfile(u);
              }}
            >
              <Avatar seed={u.username} className="h-6 w-6" />
              <span className="min-w-0 truncate text-sm font-medium">{u.displayName}</span>
              {u.nip05 && (
                <span
                  className="min-w-0 truncate text-xs"
                  style={{ color: 'var(--snort-text-secondary)' }}
                >
                  {u.nip05}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Ask Snort AI — `AskSnort/AskSnortInput.tsx`
 * ------------------------------------------------------------------ */

function AskSnortWidget() {
  const [prompt, setPrompt] = useState('');

  return (
    <Widget padding="0.75rem">
      <div className="mb-2 flex items-center gap-2">
        {/* The ONLY --snort-primary on this column: CTA/compose accent. */}
        <span style={{ color: 'var(--snort-primary)' }} className="flex shrink-0">
          <Icon name="lightbulb" size={16} />
        </span>
        <span className="text-base font-semibold">Ask Snort AI</span>
      </div>

      <div className="flex items-end gap-2">
        <textarea
          className="snort-textarea"
          rows={1}
          placeholder="Try: Summarize my timeline"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          aria-label="Ask Snort AI"
        />
        {/* [REC ✓ white circular arrow button] — `.icon` is white in light mode
            via the theme's specificity trap, layer-2 in dark. */}
        <button
          type="button"
          className="snort-btn icon"
          style={{ width: 36, height: 36 }}
          aria-label="Ask"
          disabled={prompt.trim().length === 0}
        >
          <Icon name="arrow-right" size={18} />
        </button>
      </div>
    </Widget>
  );
}

/* ------------------------------------------------------------------ *
 * TaskList — `.slice(0, 1)`: at most ONE task is ever visible
 * ------------------------------------------------------------------ */

function TaskList({ loggedIn }: { loggedIn: boolean }) {
  const [dismissed, setDismissed] = useState(false);

  // Upstream's tasks are BackupKey / PendingChanges / FollowMorePeople / Nip5,
  // and every one of their `check()`s requires a session — which is why the
  // recording's sign-in screen shows the right column with nothing but the
  // Search box. Logged out therefore renders an empty TaskList, not a card.
  if (!loggedIn || dismissed) return null;

  return (
    <Widget>
      <div className="flex items-start gap-2">
        <span
          className="flex shrink-0 items-center justify-center rounded-full p-2"
          style={{ backgroundColor: 'var(--snort-layer-2)', color: 'var(--snort-warning)' }}
        >
          <Icon name="key" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">Back up your keys</div>
          <p className="mt-1 text-sm" style={{ color: 'var(--snort-text-secondary)' }}>
            Please make sure to back up your keys!
          </p>
        </div>
        <button
          type="button"
          className="snort-btn-sm shrink-0"
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
        >
          <Icon name="x" size={16} />
        </button>
      </div>
      <div className="mt-3">
        <button type="button" className="snort-btn secondary">
          Back up now
        </button>
      </div>
    </Widget>
  );
}

/* ------------------------------------------------------------------ *
 * Invite Friends
 * ------------------------------------------------------------------ */

function InviteFriendsWidget() {
  const [copied, setCopied] = useState(false);

  return (
    <Widget title="Invite Friends" icon="heart-solid" iconColor="var(--snort-heart)">
      <p className="mb-3 text-sm">Share a personalized invitation with friends!</p>
      <button type="button" className="snort-btn secondary" onClick={() => setCopied(true)}>
        <Icon name={copied ? 'check' : 'copy'} size={18} />
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </Widget>
  );
}

/* ------------------------------------------------------------------ *
 * Trending Notes — `<TrendingNotes small={true} count={6} />`
 * ------------------------------------------------------------------ */

function TrendingNotesWidget({
  notes,
  usersByPubkey,
  onViewProfile,
}: {
  notes: MockNote[];
  usersByPubkey: Map<string, MockUser>;
  onViewProfile: (u: MockUser) => void;
}) {
  // Deterministic "trending": a fixed engagement score with the id as tiebreak,
  // so the list never reshuffles between renders.
  const trending = useMemo(() => {
    const score = (n: MockNote) => n.likes + n.reposts * 2 + n.replies + n.zaps * 3;
    return [...notes]
      .sort((a, b) => score(b) - score(a) || (a.id < b.id ? -1 : 1))
      .slice(0, 6);
  }, [notes]);

  if (trending.length === 0) return null;

  return (
    <Widget
      title="Trending Notes"
      action={<SmallIconButton name="gear" label="Trending notes settings" />}
    >
      <div className="flex flex-col gap-3">
        {trending.map((n) => (
          <CompactNoteRow
            key={n.id}
            note={n}
            author={usersByPubkey.get(n.pubkey)}
            onViewProfile={onViewProfile}
          />
        ))}
      </div>
    </Widget>
  );
}

/**
 * The compact row: ~30px avatar, bold display name, gray nip05, right-aligned
 * relative time, two lines of body with violet links. No action bar — that is
 * the whole point of `small={true}`.
 */
function CompactNoteRow({
  note,
  author,
  onViewProfile,
}: {
  note: MockNote;
  author?: MockUser;
  onViewProfile: (u: MockUser) => void;
}) {
  const name = author?.displayName || shortNpub(note.pubkey);

  return (
    <div
      className="flex w-full cursor-pointer gap-2"
      onClick={() => {
        if (author) onViewProfile(author);
      }}
    >
      <Avatar seed={author?.username || note.pubkey} className="h-[30px] w-[30px]" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1">
          <span className="min-w-0 truncate text-sm font-bold">{name}</span>
          {author?.nip05 && (
            <span
              className="min-w-0 truncate text-xs"
              style={{ color: 'var(--snort-text-secondary)' }}
            >
              {author.nip05}
            </span>
          )}
          <time className="ml-auto shrink-0 text-xs text-neutral-500">
            {noteTime(note.created_at)}
          </time>
        </div>
        <div
          className="text-sm"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            overflowWrap: 'break-word',
          }}
        >
          <Snippet text={note.content} />
        </div>
      </div>
    </div>
  );
}

/** Hashtags, @mentions and URLs are `--snort-highlight` violet, no pill. */
function Snippet({ text }: { text: string }) {
  const parts = useMemo(() => text.replace(/\n+/g, ' ').split(/(\s)/), [text]);
  return (
    <>
      {parts.map((part, i) =>
        /^#[\w-]+$/.test(part) || /^@[\w.-]+$/.test(part) || /^https?:\/\/\S+$/.test(part) ? (
          <span key={i} style={{ color: 'var(--snort-highlight)' }}>
            {part}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Latest Articles
 * ------------------------------------------------------------------ */

function LatestArticlesWidget({
  notes,
  usersByPubkey,
  onViewProfile,
}: {
  notes: MockNote[];
  usersByPubkey: Map<string, MockUser>;
  onViewProfile: (u: MockUser) => void;
}) {
  const [index, setIndex] = useState(0);

  // The mock set has no kind-30023 events, so the long-form stand-ins are the
  // newest substantial notes — deterministic order, id as tiebreak.
  const articles = useMemo(
    () =>
      [...notes]
        .filter((n) => n.content.trim().length > 80)
        .sort((a, b) => b.created_at - a.created_at || (a.id < b.id ? -1 : 1))
        .slice(0, 3),
    [notes],
  );

  if (articles.length === 0) return null;

  const article = articles[index % articles.length];
  const author = usersByPubkey.get(article.pubkey);
  const cover = noteImages(article.id, 1)[0];
  const title = articleTitle(article.content);

  const page = (delta: number) =>
    setIndex((i) => (i + delta + articles.length) % articles.length);

  return (
    <Widget
      title="Latest Articles"
      action={
        <>
          <SmallIconButton
            name="arrowFront"
            label="Previous article"
            rotated
            onClick={() => page(-1)}
          />
          <SmallIconButton name="arrowFront" label="Next article" onClick={() => page(1)} />
        </>
      }
    >
      <div className="relative overflow-hidden rounded-lg">
        {cover && <img src={cover} alt="" className="aspect-video w-full object-cover" />}
        <div className="absolute bottom-2 left-4 right-4 rounded bg-black/50 px-2 py-1">
          <span className="line-clamp-2 text-sm font-medium text-white">{title}</span>
        </div>
      </div>

      <div
        className="mt-2 flex w-full cursor-pointer items-center gap-2"
        onClick={() => {
          if (author) onViewProfile(author);
        }}
      >
        <Avatar seed={author?.username || article.pubkey} className="h-6 w-6" />
        <span className="min-w-0 truncate text-sm font-medium">
          {author?.displayName || shortNpub(article.pubkey)}
        </span>
        <time className="ml-auto shrink-0 text-xs text-neutral-500">
          {noteTime(article.created_at)}
        </time>
      </div>
    </Widget>
  );
}

/** A long-form `title` tag stand-in: the first line, trimmed to a headline. */
function articleTitle(content: string): string {
  const first = content.split('\n').map((l) => l.trim()).find((l) => l.length > 0) ?? '';
  const clean = first.replace(/https?:\/\/\S+/g, '').trim();
  return clean.length > 72 ? `${clean.slice(0, 72).trimEnd()}…` : clean;
}

export default RightColumn;
