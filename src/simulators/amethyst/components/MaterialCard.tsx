import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart, MessageCircle, Repeat, Zap, Share2, ChevronDown, ChevronUp, MoreVertical,
  MapPin, Cog, Stamp, Timer, Pencil, Pin, Server,
} from 'lucide-react';
import { Avatar } from './Avatar';
import '../amethyst.theme.css';

interface PostAuthor {
  name: string;
  handle: string;
  avatar: string;
  nip05?: string;
  isVerified?: boolean;
}

interface PostStats {
  replies: number;
  reposts: number;
  zaps: number;
  likes: number;
}

export interface PostData {
  id: string;
  author: PostAuthor;
  content: string;
  timestamp: string;
  stats: PostStats;
  images?: string[];
  hashtags?: string[];
  community?: string;
  isLive?: boolean;
}

interface MaterialCardProps {
  post: PostData;
  onLike?: (id: string) => void;
  onRepost?: (id: string) => void;
  onZap?: (id: string) => void;
  onReply?: (id: string) => void;
  onShare?: (id: string) => void;
  /** Tap the card body to open the note/thread detail. */
  onOpenThread?: () => void;
}

/**
 * The two header-marker primitives v1.13.1 introduced.
 *
 * `HeaderPill` carries tappable/verifiable metadata (PoW, OpenTimestamps,
 * location, expiration): a 6dp-rounded surface filled with onSurface @7%, a
 * 13px glyph, 3px gap, labelSmall text in placeholderText.
 * `QuietMark` carries passive markers (edited, pinned, Draft, private rumor):
 * bold grey text at row size with an optional 16px glyph and no background.
 *
 * Before v1.13.1 these were coloured bold text links scattered across two rows;
 * the second row is Complete-mode-only and SIMPLIFIED is the shipping default,
 * so moving them into the first row is precisely what a default user newly sees.
 */
function HeaderPill({ Icon, label }: { Icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-[3px] shrink-0 rounded-md px-1.5 py-0.5 text-[11px] leading-tight"
      style={{ background: 'color-mix(in srgb, var(--md-on-surface) 7%, transparent)', color: 'var(--amethyst-placeholder)' }}
    >
      <Icon className="w-[13px] h-[13px]" />
      {label}
    </span>
  );
}

function QuietMark({ Icon }: { Icon: React.ComponentType<{ className?: string }> }) {
  return (
    <span className="shrink-0" style={{ color: 'var(--amethyst-placeholder)' }}>
      <Icon className="w-4 h-4" />
    </span>
  );
}

const MARKER_CITIES = ['Lisbon', 'Riga', 'Tbilisi', 'Nairobi'];

/**
 * Which header markers a note carries. Derived deterministically from the note
 * id rather than from `MockNote`: those fields do not exist upstream in our mock
 * data, and `src/data/mock/types.ts` is read by ~78 files across ten simulators,
 * so extending it to decorate ONE client would be a shared-surface change for no
 * shared gain.
 *
 * At most ONE marker per note, on roughly a quarter of them. That is denser than
 * the reference recording (where the visible feed carries essentially none), and
 * deliberately so: a marker nobody ever sees teaches nothing about the client.
 * Sparse enough to read as an exception, common enough to be discoverable.
 */
function headerMarkers(post: PostData) {
  let h = 0;
  for (let i = 0; i < post.id.length; i++) h = (h * 31 + post.id.charCodeAt(i)) >>> 0;
  const slot = h % 23;
  return {
    location: slot === 1 ? MARKER_CITIES[h % MARKER_CITIES.length] : null,
    ots: slot === 3 ? `${1 + (h % 9)}d` : null,
    pow: slot === 5 ? String(20 + (h % 8)) : null,
    expiration: slot === 7 ? '1y+' : null,
    edited: slot === 9,
    pinned: slot === 11,
  };
}

/** The relays a note was seen on — same mock relay hosts the Settings editor lists. */
const RELAY_POOL = [
  { host: 'nostr.wine', hue: 300 },
  { host: 'nostr.mom', hue: 140 },
  { host: 'nos.lol', hue: 40 },
  { host: 'relay.damus.io', hue: 260 },
  { host: 'garden.zap.cooking', hue: 90 },
];

function relaysFor(post: PostData) {
  let h = 0;
  for (let i = 0; i < post.id.length; i++) h = (h * 33 + post.id.charCodeAt(i)) >>> 0;
  const count = 2 + (h % 3);
  return Array.from({ length: count }, (_, i) => RELAY_POOL[(h + i) % RELAY_POOL.length]);
}

/**
 * Rows for the expanded reaction breakdown. Derived deterministically from the
 * note's own counts so the panel matches the collapsed row: reaction glyphs in
 * the order the recording shows them (zap first with its sat amount, then
 * boosts, then the emoji reactions), each with as many reactor avatars as the
 * count supports, capped at five the way a phone-width row is.
 */
function reactionBreakdown(post: PostData) {
  const seeds = (n: number, salt: string) =>
    Array.from({ length: Math.max(0, Math.min(n, 5)) }, (_, i) => `${post.id}-${salt}-${i}`);

  const rows: { key: string; glyph: string; tint: string; reactors: string[]; amount?: string }[] = [];
  if (post.stats.zaps > 0) {
    rows.push({
      key: 'zap',
      glyph: '⚡',
      tint: 'var(--bitcoin-orange)',
      reactors: seeds(Math.ceil(post.stats.zaps / 400), 'zap'),
      amount: String(post.stats.zaps),
    });
  }
  if (post.stats.reposts > 0) {
    rows.push({ key: 'boost', glyph: '🔁', tint: '#4CAF50', reactors: seeds(post.stats.reposts, 'boost') });
  }
  if (post.stats.likes > 0) {
    rows.push({ key: 'heart', glyph: '❤️', tint: 'inherit', reactors: seeds(post.stats.likes, 'heart') });
    if (post.stats.likes > 3) {
      rows.push({ key: 'thumb', glyph: '👍', tint: 'inherit', reactors: seeds(post.stats.likes - 3, 'thumb') });
    }
    if (post.stats.likes > 8) {
      rows.push({ key: 'fire', glyph: '🔥', tint: 'inherit', reactors: seeds(post.stats.likes - 8, 'fire') });
    }
  }
  return rows;
}

export function MaterialCard({
  post,
  onLike,
  onRepost,
  onZap,
  onReply,
  onOpenThread,
}: MaterialCardProps) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [isReposted, setIsReposted] = React.useState(false);
  const [isZapped, setIsZapped] = React.useState(false);
  // Upstream's leading slot in the reaction row (`showReactionDetail` →
  // ReactionRowExpandButton): a chevron that expands the per-reaction-type
  // breakdown — one row per reaction glyph, with the avatars of whoever reacted.
  const [showReactionDetail, setShowReactionDetail] = React.useState(false);
  const markers = React.useMemo(() => headerMarkers(post), [post.id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(post.id);
  };

  const handleRepost = () => {
    setIsReposted(!isReposted);
    onRepost?.(post.id);
  };

  const handleZap = () => {
    setIsZapped(!isZapped);
    onZap?.(post.id);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  /** A zero count renders nothing at all in the real app — the icon stands alone. */
  const ActionCount = ({ value }: { value: number }) =>
    value > 0 ? <span className="text-sm font-medium">{formatNumber(value)}</span> : null;

  const renderContent = (content: string) => {
    // Highlight hashtags
    let processedContent = content.replace(
      /#(\w+)/g,
      '<span style="color: var(--md-primary); font-weight: 500;">#$1</span>'
    );
    
    // Highlight mentions
    processedContent = processedContent.replace(
      /nostr:(\w+)/g,
      '<span style="color: var(--md-primary); font-weight: 500;">@$1</span>'
    );
    
    // Highlight links
    processedContent = processedContent.replace(
      /(https?:\/\/[^\s]+)/g,
      '<span style="color: var(--md-primary); text-decoration: underline;">$1</span>'
    );
    
    return { __html: processedContent };
  };

  return (
    <motion.article
      className={`bg-[var(--md-background)] ${onOpenThread ? 'cursor-pointer' : ''}`}
      /* Real Amethyst feed: flat, edge-to-edge on black — no elevated card, no
         rounded corners; just a hairline divider BETWEEN notes. */
      style={{ borderBottom: '1px solid var(--amethyst-feed-divider)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      layout
      onClick={onOpenThread}
    >
      {/* Card Header */}
      <div className="p-4 flex items-start gap-3">
        <motion.div
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="relative z-10"
        >
          <Avatar seed={post.author.handle || post.author.name || 'default'} className="md-avatar" />
          {post.author.nip05 && (
            <div className="nip05-badge absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center z-20">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </motion.div>
        
        {/* v1.13.1 header: ONE row, `Arrangement.spacedBy(5.dp)` — name (weight 1),
            then every metadata marker, then the timestamp and ⋮ as an unspaced
            pair pinned right. v1.12.6 split this across two rows and hung the
            timestamp under the name. */}
        <div className="flex-1 min-w-0 flex items-center gap-[5px]">
          <span className="font-semibold text-[var(--md-on-surface)] truncate">
            {post.author.name}
          </span>

          {markers.edited && <QuietMark Icon={Pencil} />}
          {markers.pinned && <QuietMark Icon={Pin} />}
          {markers.location && <HeaderPill Icon={MapPin} label={markers.location} />}
          {markers.ots && <HeaderPill Icon={Stamp} label={markers.ots} />}
          {markers.pow && <HeaderPill Icon={Cog} label={markers.pow} />}
          {markers.expiration && <HeaderPill Icon={Timer} label={markers.expiration} />}

          {post.isLive && (
            <span className="live-badge text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0">
              LIVE
            </span>
          )}

          {/* Timestamp + ⋮ share their own unspaced row so the pair stays tight */}
          <span className="ml-auto flex items-center shrink-0">
            <span className="text-sm" style={{ color: 'var(--amethyst-placeholder)' }}>
              • {post.timestamp}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              aria-label="Note options"
              className="p-1"
            >
              <MoreVertical className="w-5 h-5" style={{ color: 'var(--amethyst-placeholder)' }} />
            </motion.button>
          </span>
        </div>
      </div>

      {/* NIP-05 sits on the second row, which is Complete-mode only upstream —
          we keep it visible because it is the one identity signal the FAQ leans
          on, but it no longer competes with the markers for the first row. */}
      {post.author.nip05 && (
        <div className="px-4 -mt-2 pb-1 flex items-center gap-0.5 text-[var(--md-primary)]">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium truncate max-w-[180px]">{post.author.nip05}</span>
        </div>
      )}

      {/* Community Tag */}
      {post.community && (
        <div className="px-4 pb-2">
          <span className="community-badge inline-flex items-center gap-1 text-xs font-medium text-[var(--md-primary)] bg-[var(--md-primary-container)] px-2 py-1 rounded-full">
            Posted in {post.community}
          </span>
        </div>
      )}

      {/* Card Content */}
      <div className="px-4 pb-3">
        <p 
          className="text-[var(--md-on-surface)] leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={renderContent(post.content)}
        />
      </div>

      {/* Card Images */}
      {post.images && post.images.length > 0 && (
        <div className={`px-4 pb-3 grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {post.images.slice(0, 4).map((image, index) => (
            <motion.div
              key={index}
              className={`relative overflow-hidden rounded-lg ${post.images!.length === 1 ? 'aspect-video' : 'aspect-square'}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <img
                src={image}
                alt={`Post image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {post.images!.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">+{post.images!.length - 4}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Action Buttons.
          v1.13.1 `DefaultReactionRowItems` (AccountSyncedSettingsInternal.kt),
          verbatim: Reply · Boost · Like · Zap · Pay(disabled) · Share(no
          counter) — preceded by the expand chevron. Pay ships disabled, so the
          rendered row is five icons plus the chevron, exactly as in the
          recording. Counters are omitted when a count is zero.
          NOTE: v1.12.6 had the SAME default list — the bar-chart "stats" slot we
          shipped until now was a misread of the old promo screenshot, not a
          version difference. The frozen archive keeps the misread. */}
      {/* No rule above the action row in the real app — the only divider sits between notes */}
      <div className="px-4 py-2 flex items-center justify-between gap-1" data-tour="amethyst-actions" onClick={(e) => e.stopPropagation()}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          onClick={() => setShowReactionDetail((v) => !v)}
          aria-label={showReactionDetail ? 'Hide reaction details' : 'Show reaction details'}
          aria-expanded={showReactionDetail}
          className="action-btn action-btn-expand md-ripple flex items-center text-[var(--amethyst-placeholder)]"
        >
          {showReactionDetail ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          onClick={() => onReply?.(post.id)}
          className={`action-btn action-btn-reply md-ripple flex items-center gap-1.5 text-[var(--amethyst-placeholder)] hover:text-[var(--md-on-surface)] transition-colors`}
        >
          <MessageCircle className="w-5 h-5" />
          <ActionCount value={post.stats.replies} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          onClick={handleRepost}
          className={`action-btn action-btn-repost md-ripple flex items-center gap-1.5 transition-colors ${
            isReposted ? 'active text-green-600' : 'text-[var(--md-on-surface-variant)] hover:text-green-600'
          }`}
        >
          <Repeat className="w-5 h-5" />
          <ActionCount value={post.stats.reposts + (isReposted ? 1 : 0)} />
        </motion.button>

        {/* Reaction (Amethyst's default reaction is a heart; can be any emoji) */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          onClick={handleLike}
          className={`action-btn action-btn-like md-ripple flex items-center gap-1.5 transition-colors ${
            isLiked ? 'active text-red-500' : 'text-[var(--md-on-surface-variant)] hover:text-red-500'
          }`}
        >
          <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
          <ActionCount value={post.stats.likes + (isLiked ? 1 : 0)} />
        </motion.button>

        {/* Zap — the last counted action; Share follows it icon-only */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          onClick={handleZap}
          className={`action-btn action-btn-zap md-ripple flex items-center gap-1.5 transition-colors ${
            isZapped ? 'active' : 'text-[var(--md-on-surface-variant)]'
          }`}
          style={{ color: isZapped ? 'var(--bitcoin-orange)' : undefined }}
        >
          <Zap className="w-5 h-5" fill={isZapped ? 'currentColor' : 'none'} />
          <ActionCount value={post.stats.zaps + (isZapped ? 21 : 0)} />
        </motion.button>

        {/* Share: `showCounter = false` upstream, so it is icon-only and — being
            the rightmost item without a counter — sits flush right instead of
            taking an equal-width slice (GenericInnerReactionRow's isLastIconOnly). */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          aria-label="Share"
          className="action-btn action-btn-share md-ripple flex items-center text-[var(--amethyst-placeholder)]"
        >
          <Share2 className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Per-reaction-type breakdown, revealed by the leading chevron. One row
          per reaction glyph with the reactors' avatars; the zap row carries the
          sat amount. Amethyst-signature surface — no other client in the shelf
          has it. */}
      {showReactionDetail && (
        <div className="px-4 pb-3 space-y-2" onClick={(e) => e.stopPropagation()}>
          {reactionBreakdown(post).map((row) => (
            <div key={row.key} className="flex items-center gap-3">
              <span className="w-6 shrink-0 text-center text-sm" style={{ color: row.tint }}>
                {row.glyph}
              </span>
              <div className="flex items-center -space-x-2">
                {row.reactors.map((seed) => (
                  <div key={seed} className="relative">
                    <Avatar seed={seed} className="w-7 h-7 ring-2 ring-[var(--md-background)]" />
                  </div>
                ))}
              </div>
              {row.amount && (
                <span className="text-xs font-medium" style={{ color: 'var(--bitcoin-orange)' }}>
                  {row.amount}
                </span>
              )}
            </div>
          ))}

          {/* "Accepted by relays" — new in v1.13.1. The relay favicons used to
              sit in a column under the author's avatar on the note card itself;
              that slot was deleted from NoteComposeLayout and the same set
              reappears here, so it is now visible to every user instead of only
              Complete-mode ones. Marks are drawn locally: this simulator makes
              zero remote requests, so real relay favicons are out of scope. */}
          <div className="flex items-center gap-3 pt-1">
            <span className="w-6 shrink-0 flex justify-center">
              <Server className="w-5 h-5" style={{ color: 'var(--amethyst-placeholder)' }} />
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {relaysFor(post).map((r) => (
                <span
                  key={r.host}
                  title={r.host}
                  className="w-[26px] h-[26px] rounded-md shrink-0 flex items-center justify-center text-[11px] font-semibold text-black"
                  style={{ background: `linear-gradient(135deg, hsl(${r.hue} 55% 62%), hsl(${(r.hue + 40) % 360} 60% 48%))` }}
                >
                  {r.host[0].toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.article>
  );
}
