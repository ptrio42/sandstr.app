import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Highlighter,
  History,
  List,
  MoreVertical,
  Pause,
  Play,
  Rss,
  Search,
  Settings,
  Share2,
  X,
} from 'lucide-react';
import { IconButton } from '../components/TopBar';
import { BorisAvatar } from '../components/Avatar';
import { borisHighlights, userByPubkey, type BorisArticle, type BorisBlock } from '../borisData';
import type { MockUser } from '../../../data/mock';
import type { ReaderPane } from '../types';

/**
 * The Reader (ui/reader/ReaderScreen.kt) — the screen Boris exists for.
 *
 * Anatomy, cited:
 *  - Top bar (ReaderScreen.kt:684-866): back · Contents (only when the article
 *    has headings) — title (tap = scroll to top) — [Save to library, logged in
 *    only] · Listen · ⋮. The overflow order is Share · Copy link · Open in
 *    browser · Wayback Machine · archive.ph · [Open in native app] · Find in
 *    article · [Mark as read] · [Reader settings]; the last two are gated on
 *    being logged in, which is why a signed-out menu is six items long.
 *  - Hero (ReaderScreen.kt:2356-2371): 42% of the screen height clamped to
 *    240–420dp, with a gradient that stays fully transparent for the first 40%
 *    and lands on black at 82%.
 *  - Meta chips (ReaderScreen.kt:2472-2510) in a FlowRow, in this exact order:
 *    author (nostr long-form only) · domain · + RSS · read time · highlights ·
 *    published. Accent chips (RSS, highlights) get a 55%-alpha border in the
 *    accent and `onBackground` text; plain chips use `outline` + onSurfaceVariant.
 *  - Labels: "1 min read" / "N min read" (ReadingTime.kt:18), "1 highlight" /
 *    "N highlights" (ReaderScreen.kt:2339-2342), progress "%d%%" and "✓" at 95%
 *    (strings.xml:415-416, ReadingProgress.kt:32).
 */

const HIGHLIGHT_TINT: Record<string, string> = {
  mine: 'var(--boris-mark-mine)',
  friends: 'var(--boris-mark-friends)',
  nostrverse: 'var(--boris-mark-others)',
};

function MetaChip({
  icon,
  text,
  accent,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  accent?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px]"
      style={{
        border: `1px solid ${accent ? `color-mix(in srgb, ${accent} 55%, transparent)` : 'var(--boris-outline)'}`,
        color: accent ? 'var(--boris-on-bg)' : 'var(--boris-on-surface-variant)',
      }}
    >
      <span className="flex h-3.5 w-3.5 items-center justify-center" style={{ color: accent ?? 'currentColor' }}>
        {icon}
      </span>
      {text}
    </button>
  );
}

/** A body paragraph with any highlight spans painted into it. */
function Prose({
  block,
  marks,
  spoken,
  style,
}: {
  block: BorisBlock;
  marks: { text: string; tint: string }[];
  spoken: boolean;
  style: 'marker' | 'underline';
}) {
  const text = 'text' in block ? block.text : '';
  const parts = useMemo(() => {
    let segments: { text: string; tint?: string }[] = [{ text }];
    for (const m of marks) {
      const next: typeof segments = [];
      for (const seg of segments) {
        if (seg.tint || !seg.text.includes(m.text)) {
          next.push(seg);
          continue;
        }
        const i = seg.text.indexOf(m.text);
        if (i > 0) next.push({ text: seg.text.slice(0, i) });
        next.push({ text: m.text, tint: m.tint });
        const rest = seg.text.slice(i + m.text.length);
        if (rest) next.push({ text: rest });
      }
      segments = next;
    }
    return segments;
  }, [text, marks]);

  const painted = parts.map((seg, i) =>
    seg.tint ? (
      <mark
        key={i}
        className="boris-mark"
        data-style={style}
        style={{ '--mark': seg.tint } as React.CSSProperties}
      >
        {seg.text}
      </mark>
    ) : (
      <span key={i}>{seg.text}</span>
    ),
  );

  const spokenStyle = spoken
    ? ({
        background: 'color-mix(in srgb, var(--boris-mark-spoken) 35%, transparent)',
        borderRadius: '2px',
      } as React.CSSProperties)
    : undefined;

  if (block.type === 'h2') {
    return (
      <h2 className="boris-display mb-3 mt-6 text-[22px]" style={{ color: 'var(--boris-on-bg)' }}>
        {text}
      </h2>
    );
  }
  if (block.type === 'quote') {
    return (
      <blockquote
        className="boris-prose my-5 pl-4 italic"
        style={{ borderLeft: '2px solid var(--boris-outline)', color: 'var(--boris-on-bg)', ...spokenStyle }}
      >
        {painted}
      </blockquote>
    );
  }
  if (block.type === 'image') {
    return (
      <figure className="my-6 -mx-5">
        <img src={block.src} alt="" className="w-full" />
        {block.caption && (
          <figcaption
            className="mt-2 px-5 text-[13px]"
            style={{ color: 'var(--boris-on-surface-variant)' }}
          >
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  return (
    <p className="boris-prose mb-5" style={{ color: 'var(--boris-on-bg)', ...spokenStyle }}>
      {block.type === 'lead' ? <strong>{painted}</strong> : painted}
    </p>
  );
}

export interface ReaderScreenProps {
  article: BorisArticle;
  loggedIn: boolean;
  progress: number;
  pane: ReaderPane;
  ttsPlaying: boolean;
  ttsBlock: number;
  ownMarks: string[];
  highlightStyle: 'marker' | 'underline';
  /**
   * The Highlights settings, honoured HERE and not only in the settings
   * preview. `showHighlights` is the master switch and `visibility` is the
   * per-author-class one (HighlightsSection.kt:41-45, :83-125); both gate the
   * MARKS only. The count chip and the Highlights pane list everything
   * regardless — hiding a mark does not unload it, which is why the pane
   * carries its own show/hide control.
   */
  showHighlights: boolean;
  visibility: { nostrverse: boolean; friends: boolean; mine: boolean };
  onToggleMarks: () => void;
  onBack: () => void;
  onPaneChange: (p: ReaderPane) => void;
  onScroll: (percent: number) => void;
  onToggleTts: () => void;
  onOpenProfile: (u: MockUser) => void;
  onAddHighlight: (quote: string) => void;
  /**
   * The TTS mini player, when a session is live. It is a SLOT rather than an
   * overlay because upstream stacks it inside the reader's own bottom column,
   * directly above the reading-progress strip (ReaderScreen.kt:1860-1877) —
   * floating it over the article would bury the very progress readout the real
   * app keeps visible while listening.
   */
  ttsSlot?: ReactNode;
}

export function ReaderScreen({
  article,
  loggedIn,
  progress,
  pane,
  ttsPlaying,
  ttsBlock,
  ownMarks,
  highlightStyle,
  showHighlights,
  visibility,
  onToggleMarks,
  onBack,
  onPaneChange,
  onScroll,
  onToggleTts,
  onOpenProfile,
  onAddHighlight,
  ttsSlot,
}: ReaderScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selection, setSelection] = useState<{ text: string; top: number } | null>(null);
  const [findQuery, setFindQuery] = useState('');
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  /**
   * Read whatever the visitor actually selected, and remember where it sits so
   * the toolbar can float over it the way the real one does.
   *
   * The `top` is measured against the READER's own box, never the viewport: the
   * device screen is a transformed element, so a viewport coordinate lands in
   * the wrong place inside the phone frame (the repo-wide `position: fixed`
   * trap, .claude/rules/simulators.md).
   */
  const readSelection = () => {
    const sel = window.getSelection();
    const root = rootRef.current;
    const text = sel?.toString().trim() ?? '';
    if (!sel || sel.isCollapsed || text.length < 2 || !root) {
      setSelection(null);
      return;
    }
    const node = sel.anchorNode;
    if (!node || !bodyRef.current?.contains(node)) {
      setSelection(null);
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    setSelection({ text, top: rect.top - rootRect.top });
  };

  const author = article.pubkey ? userByPubkey(article.pubkey) : null;
  const swarm = borisHighlights.filter((h) => h.articleId === article.id);
  const headings = article.body.filter((b) => b.type === 'h2') as { type: 'h2'; text: string }[];

  // `audience` is the data's word, `visibility` is the settings' word, and they
  // differ by one key: the settings call your own highlights `mine`.
  const visible = (audience: 'mine' | 'friends' | 'nostrverse') =>
    showHighlights && visibility[audience];

  const marksFor = (block: BorisBlock) => {
    const out: { text: string; tint: string }[] = [];
    if (!('text' in block)) return out;
    for (const h of swarm) {
      if (!visible(h.audience)) continue;
      if (block.text.includes(h.mark)) out.push({ text: h.mark, tint: HIGHLIGHT_TINT[h.audience] });
      if (h.mark2 && block.text.includes(h.mark2)) out.push({ text: h.mark2, tint: HIGHLIGHT_TINT[h.audience] });
    }
    if (visible('mine')) {
      for (const m of ownMarks) {
        if (block.text.includes(m)) out.push({ text: m, tint: HIGHLIGHT_TINT.mine });
      }
    }
    return out;
  };

  const pillTint = swarm.some((h) => h.audience === 'mine')
    ? HIGHLIGHT_TINT.mine
    : swarm.some((h) => h.audience === 'friends')
      ? HIGHLIGHT_TINT.friends
      : HIGHLIGHT_TINT.nostrverse;

  const highlightCount = swarm.length + ownMarks.length;
  const clamped = Math.max(0, Math.min(100, progress));
  const complete = clamped >= 95;
  const started = clamped >= 1 && clamped <= 10;
  const progressLabel = complete ? '✓' : `${clamped}%`;
  const progressColor = complete ? '#22C55E' : started ? 'var(--boris-on-bg)' : 'var(--boris-primary)';
  const progressLabelColor = complete
    ? '#22C55E'
    : started
      ? 'var(--boris-on-bg)'
      : 'var(--boris-on-surface-variant)';

  const findHits = findQuery.trim()
    ? article.body.filter((b) => 'text' in b && b.text.toLowerCase().includes(findQuery.toLowerCase())).length
    : 0;

  return (
    <div ref={rootRef} className="relative flex h-full min-h-0 flex-col" style={{ background: 'var(--boris-bg)' }}>
      {/* Top bar */}
      <div className="flex h-16 shrink-0 items-center pl-1 pr-1" style={{ background: 'var(--boris-bg)' }}>
        <IconButton label="Back" onClick={onBack} tourId="boris-reader-back">
          <ArrowLeft size={24} />
        </IconButton>
        {headings.length > 0 && (
          <IconButton
            label="Contents"
            onClick={() => onPaneChange(pane === 'contents' ? null : 'contents')}
            tourId="boris-reader-contents"
          >
            <List size={24} />
          </IconButton>
        )}
        <div
          className="min-w-0 flex-1 truncate px-1 text-[16px] font-medium"
          style={{ color: 'var(--boris-on-bg)' }}
        >
          {article.title}
        </div>
        <IconButton label={ttsPlaying ? 'Pause' : 'Listen'} onClick={onToggleTts} tourId="boris-reader-listen">
          {ttsPlaying ? <Pause size={24} /> : <Play size={24} />}
        </IconButton>
        <div className="relative">
          <IconButton label="More" onClick={() => setMenuOpen((v) => !v)} tourId="boris-reader-more">
            <MoreVertical size={24} />
          </IconButton>
          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div
                className="absolute right-2 top-11 z-50 min-w-[196px] overflow-hidden rounded-lg py-1"
                style={{
                  background: 'var(--boris-surface-variant)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                }}
              >
                {[
                  { label: 'Share', icon: <Share2 size={18} /> },
                  { label: 'Copy link', icon: <Copy size={18} /> },
                  { label: 'Open in browser', icon: <Globe size={18} /> },
                  { label: 'Wayback Machine', icon: <History size={18} /> },
                  { label: 'archive.ph', icon: <Globe size={18} /> },
                  { label: 'Find in article', icon: <Search size={18} /> },
                  ...(loggedIn
                    ? [
                        { label: 'Mark as read', icon: <CheckCircle2 size={18} /> },
                        { label: 'Reader settings', icon: <Settings size={18} /> },
                      ]
                    : []),
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-[14px]"
                    style={{ color: 'var(--boris-on-bg)' }}
                    onClick={() => {
                      setMenuOpen(false);
                      if (item.label === 'Find in article') onPaneChange('find');
                    }}
                  >
                    <span style={{ color: 'var(--boris-on-surface-variant)' }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Article */}
      <div
        className="min-h-0 flex-1 overflow-y-auto"
        onScroll={(e) => {
          const el = e.currentTarget;
          const max = el.scrollHeight - el.clientHeight;
          onScroll(max > 0 ? Math.round((el.scrollTop / max) * 100) : 0);
        }}
      >
        {article.cover && (
          <div
            className="relative w-full"
            /* ReaderScreen.kt:2365 — 42% of the screen height, clamped 240–420dp.
               The host frame is 80vh tall, so 42% of it is 33.6vh. */
            style={{ height: 'clamp(240px, 33.6vh, 420px)' }}
          >
            <img src={article.cover} alt="" className="h-full w-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(0,0,0,0.82) 100%)',
              }}
            />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h1 className="boris-display text-[30px] leading-[34px] text-white">{article.title}</h1>
              <p className="mt-2 text-[15px] leading-6 text-white/90">{article.summary}</p>
            </div>
          </div>
        )}

        <div className="px-5 pb-24 pt-5">
          {!article.cover && (
            <>
              <h1 className="boris-display mb-2 text-[30px] leading-[34px]" style={{ color: 'var(--boris-on-bg)' }}>
                {article.title}
              </h1>
              <p className="mb-5 text-[15px] leading-6" style={{ color: 'var(--boris-on-surface-variant)' }}>
                {article.summary}
              </p>
            </>
          )}

          <div className="flex flex-wrap gap-2 pb-6" data-tour="boris-reader-meta">
            {author && (
              <button
                type="button"
                onClick={() => onOpenProfile(author)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px]"
                style={{ border: '1px solid var(--boris-outline)', color: 'var(--boris-on-surface-variant)' }}
              >
                <BorisAvatar seed={author.pubkey} className="h-[18px] w-[18px]" />
                {author.displayName}
              </button>
            )}
            {article.domain !== 'nostr' && (
              <MetaChip icon={<Globe size={14} />} text={article.domain} onClick={() => undefined} />
            )}
            {article.rss && (
              <MetaChip icon={<Rss size={14} />} text="+ RSS" accent="var(--boris-primary)" onClick={() => undefined} />
            )}
            <MetaChip icon={<Clock size={14} />} text={`${article.readMinutes} min read`} />
            {highlightCount > 0 && (
              <MetaChip
                icon={<Highlighter size={14} />}
                text={highlightCount === 1 ? '1 highlight' : `${highlightCount} highlights`}
                accent={pillTint}
                onClick={() => onPaneChange('highlights')}
              />
            )}
            <MetaChip icon={<Calendar size={14} />} text={article.published} />
          </div>

          {/* REAL text selection, not a tap target per paragraph. Upstream's
              gesture is a long-press and drag over arbitrary text
              (ReaderSelection.kt:205-261); wrapping each block in a <button>
              made the paragraph the smallest thing you could pick, which meant
              the demo could never show what Boris is actually for. It also put
              block-level prose inside a button, which is invalid HTML. */}
          <div ref={bodyRef} data-tour="boris-reader-body" onMouseUp={readSelection} onTouchEnd={readSelection}>
            {article.body.map((block, i) => (
              <Prose
                key={i}
                block={block}
                marks={marksFor(block)}
                spoken={ttsPlaying && ttsBlock === i}
                style={highlightStyle}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom stack: mini player, then the reading-progress strip.
          `ReadingProgressBar` is NOT a floating percentage — it is a full-width
          row on `background` at 95%, 12dp/4dp padding, holding a 2dp track
          (outline at 45%) with the fill, and the label right-aligned in a 32dp
          min-width slot with tabular figures (ReadingProgress.kt:100-152).
          Fill AND label change colour together: 1–10% onBackground, 11–94%
          primary, >=95% #22C55E and the label becomes "✓". */}
      {ttsSlot}
      <div
        className="flex shrink-0 items-center gap-2 px-3 py-1"
        style={{ background: 'color-mix(in srgb, var(--boris-bg) 95%, transparent)' }}
        data-tour="boris-reader-progress"
      >
        <div
          className="h-[2px] flex-1 overflow-hidden rounded-full"
          style={{ background: 'color-mix(in srgb, var(--boris-outline) 45%, transparent)' }}
        >
          <div className="h-full" style={{ width: `${clamped}%`, background: progressColor }} />
        </div>
        <span
          className="min-w-8 text-right text-[10px]"
          style={{ color: progressLabelColor, fontVariantNumeric: 'tabular-nums' }}
        >
          {progressLabel}
        </span>
      </div>

      {/* Selection toolbar — inverseSurface pill, 24dp corners
          (HighlightTextToolbar.kt:53-84). "Highlight" only when logged in.
          The third action is "TTS from here", not "Read from here"
          (strings.xml:418 `tts_from_here`); Copy and Select all come from
          android.R.string, so they read as the platform's own labels. */}
      {selection && (
        <div
          className="absolute inset-x-0 z-40 flex justify-center px-4"
          /* Above the selection where there is room, below it otherwise — the
             real toolbar tracks the selection rather than parking at a fixed
             offset. Clamped so it never rides over the top bar. */
          style={{ top: Math.max(72, selection.top - 56) }}
        >
          <div
            className="flex items-center gap-1 rounded-3xl px-1 py-1"
            style={{ background: '#E6E1E5', color: '#313033' }}
            data-tour="boris-selection-toolbar"
          >
            {['Copy', ...(loggedIn ? ['Highlight'] : []), 'TTS from here', 'Select all'].map((label) => (
              <button
                key={label}
                type="button"
                className="rounded-full px-3 py-1.5 text-[13px] font-medium"
                onClick={() => {
                  if (label === 'Highlight') onAddHighlight(selection.text);
                  window.getSelection()?.removeAllRanges();
                  setSelection(null);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Panes */}
      {pane === 'contents' && (
        <Pane title="Contents" onClose={() => onPaneChange(null)} tourId="boris-pane-contents">
          {headings.length === 0 ? (
            <Empty text="No headings in this article." />
          ) : (
            headings.map((h) => (
              <div key={h.text} className="border-b px-5 py-3.5 text-[15px]" style={{ borderColor: 'var(--boris-outline)', color: 'var(--boris-on-bg)' }}>
                {h.text}
              </div>
            ))
          )}
        </Pane>
      )}

      {pane === 'highlights' && (
        <Pane
          title="Highlights"
          onClose={() => onPaneChange(null)}
          tourId="boris-pane-highlights"
          actions={
            // The pane owns the master switch, which is why hiding marks does
            // not have to mean a trip to Settings (strings.xml:199-200).
            <IconButton
              label={showHighlights ? 'Hide highlight marks' : 'Show highlight marks'}
              onClick={onToggleMarks}
              tourId="boris-pane-toggle-marks"
              tint={showHighlights ? 'var(--boris-on-bg)' : 'var(--boris-on-surface-variant)'}
            >
              {showHighlights ? <Eye size={24} /> : <EyeOff size={24} />}
            </IconButton>
          }
        >
          {swarm.length === 0 && ownMarks.length === 0 ? (
            <Empty text="No highlights on this article yet." />
          ) : (
            <>
              {swarm.map((h) => {
                const u = userByPubkey(h.pubkey);
                return (
                  <div key={h.id} className="border-b px-5 py-4" style={{ borderColor: 'var(--boris-outline)' }}>
                    <p
                      className="boris-prose text-[15px] italic"
                      style={{ textAlign: 'left', color: 'var(--boris-on-bg)' }}
                    >
                      <mark
                        className="boris-mark"
                        data-style={highlightStyle}
                        style={{ '--mark': HIGHLIGHT_TINT[h.audience] } as React.CSSProperties}
                      >
                        {h.mark}
                      </mark>
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <BorisAvatar seed={u.pubkey} className="h-5 w-5" />
                      <span className="text-[12px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
                        {u.displayName}
                      </span>
                      <span className="ml-auto text-[12px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
                        {h.ago}
                      </span>
                    </div>
                  </div>
                );
              })}
              {ownMarks.map((m) => (
                <div key={m} className="border-b px-5 py-4" style={{ borderColor: 'var(--boris-outline)' }}>
                  <p className="boris-prose text-[15px] italic" style={{ textAlign: 'left', color: 'var(--boris-on-bg)' }}>
                    <mark
                      className="boris-mark"
                      data-style={highlightStyle}
                      style={{ '--mark': HIGHLIGHT_TINT.mine } as React.CSSProperties}
                    >
                      {m}
                    </mark>
                  </p>
                  <div className="mt-2 text-[12px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
                    just now
                  </div>
                </div>
              ))}
            </>
          )}
        </Pane>
      )}

      {pane === 'find' && (
        <Pane title="Find" onClose={() => onPaneChange(null)} tourId="boris-pane-find">
          <div className="px-5 pb-2 pt-1">
            <input
              value={findQuery}
              onChange={(e) => setFindQuery(e.target.value)}
              placeholder="Search in article"
              className="w-full rounded-lg px-3 py-2.5 text-[15px] outline-none"
              style={{
                background: 'var(--boris-surface-variant)',
                color: 'var(--boris-on-bg)',
                border: '1px solid var(--boris-outline)',
              }}
            />
          </div>
          {findQuery.trim() === '' ? null : findHits === 0 ? (
            <Empty text="No matches" />
          ) : (
            article.body
              .filter((b) => 'text' in b && b.text.toLowerCase().includes(findQuery.toLowerCase()))
              .map((b, i) => (
                <div
                  key={i}
                  className="border-b px-5 py-3 text-[14px]"
                  style={{ borderColor: 'var(--boris-outline)', color: 'var(--boris-on-surface-variant)' }}
                >
                  {'text' in b ? `${b.text.slice(0, 110)}…` : ''}
                </div>
              ))
          )}
        </Pane>
      )}
    </div>
  );
}

function Pane({
  title,
  onClose,
  children,
  tourId,
  actions,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  tourId?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ background: 'var(--boris-bg)' }} data-tour={tourId}>
      <div className="flex h-16 shrink-0 items-center pl-1 pr-1" style={{ background: 'var(--boris-bg)' }}>
        <IconButton label={`Close ${title.toLowerCase()}`} onClick={onClose}>
          <X size={24} />
        </IconButton>
        <span className="flex-1 text-[16px] font-medium" style={{ color: 'var(--boris-on-bg)' }}>
          {title}
        </span>
        {actions}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="px-5 py-8 text-center text-[14px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
      {text}
    </p>
  );
}
