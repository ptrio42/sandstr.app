import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  Heart, MessageCircle, Repeat, Zap, Share2, ChevronDown, ChevronUp, MoreVertical,
  MapPin, Cog, Stamp, Timer, Pencil, Pin, Server, Image as ImageIcon, QrCode,
  Trophy, EyeOff, ShieldCheck, Copy, Flag, BellOff, UserMinus, Radio,
} from 'lucide-react';
import { Avatar } from './Avatar';
import '../amethyst.theme.css';

interface PostAuthor {
  name: string;
  handle: string;
  avatar: string;
  nip05?: string;
  isVerified?: boolean;
  /**
   * Drives the "Following" shield on the avatar. The default feed IS
   * `All Follows`, so every author in it is one — that is the badge's whole
   * meaning upstream (gaps ame-81).
   */
  following?: boolean;
}

interface PostStats {
  replies: number;
  reposts: number;
  zaps: number;
  likes: number;
  /** Total sats zapped. The counter shows THIS, not the zap count (ame-79). */
  satsZapped?: number;
}

export interface PostData {
  id: string;
  /** Author's key, so a tap on the avatar can open THAT author's profile. */
  pubkey?: string;
  author: PostAuthor;
  content: string;
  timestamp: string;
  stats: PostStats;
  images?: string[];
  hashtags?: string[];
  community?: string;
  isLive?: boolean;
  /**
   * v1.13.1 deleted `BoostedMark()`; the only repost signal left in the header
   * is the author's name drawn in grayText (gaps ame-11).
   */
  isRepost?: boolean;
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
  /** Tap the author's avatar or name to open THEIR profile (not the thread). */
  onOpenProfile?: (post: PostData) => void;
  /**
   * Start the per-reaction gallery expanded. Ground truth: the thread's root
   * note renders with `showReactionDetail = true` (gaps ame-89/ame-137).
   */
  defaultReactionDetail?: boolean;
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

function QuietMark({ Icon, label }: { Icon?: React.ComponentType<{ className?: string }>; label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 shrink-0 text-[13px] font-bold"
      style={{ color: 'var(--amethyst-placeholder)' }}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </span>
  );
}

const MARKER_CITIES = ['Lisbon', 'Riga', 'Tbilisi', 'Nairobi'];

/**
 * A `nostr:` mention resolves to a display name in the real client. Our mock
 * notes carry opaque tokens, so we map them onto the mock roster deterministically
 * — the point is that a reader sees a NAME, which is what the client shows.
 */
const MENTION_NAMES = ['Nostrich Nina', 'Kit Kobayashi', 'Maple Dev', 'CodeWiz', 'Violet Volt', 'Karrot'];
function mentionName(token: string): string {
  let h = 0;
  for (let i = 0; i < token.length; i++) h = (h * 31 + token.charCodeAt(i)) >>> 0;
  return MENTION_NAMES[h % MENTION_NAMES.length];
}

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
    // The fifth documented pill kind. Bounties carry an amount in sats, which is
    // why they are a pill (verifiable metadata) and not a QuietMark.
    bounty: slot === 13 ? `${10 + (h % 90)}k` : null,
    edited: slot === 9,
    pinned: slot === 11,
    // The two QuietMark kinds that existed only in a code comment until now.
    draft: slot === 15,
    rumor: slot === 17,
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
function formatSats(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

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
      amount: formatSats(post.stats.satsZapped ?? post.stats.zaps),
    });
    // New in v1.13.1: BOLT12 offers get their own row beside the zap row.
    if (post.stats.zaps > 900) {
      rows.push({
        key: 'bolt12',
        glyph: '₿',
        tint: 'var(--bitcoin-orange)',
        reactors: seeds(1, 'bolt12'),
        amount: formatSats(Math.round((post.stats.satsZapped ?? post.stats.zaps) / 7)),
      });
    }
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
  onOpenProfile,
  defaultReactionDetail = false,
}: MaterialCardProps) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [isReposted, setIsReposted] = React.useState(false);
  const [isZapped, setIsZapped] = React.useState(false);
  // Upstream's leading slot in the reaction row (`showReactionDetail` →
  // ReactionRowExpandButton): a chevron that expands the per-reaction-type
  // breakdown — one row per reaction glyph, with the avatars of whoever reacted.
  const [showReactionDetail, setShowReactionDetail] = React.useState(defaultReactionDetail);
  const markers = React.useMemo(() => headerMarkers(post), [post.id]);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  // Long-press on Like opens the emoji palette; a tap is the default heart.
  // `DefaultReactionRowItems` keeps both on the SAME button (gaps ame-14).
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [reaction, setReaction] = React.useState<string | null>(null);
  const pressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = React.useRef(false);
  /**
   * Where the card's bottom sheets get rendered.
   *
   * They CANNOT be children of the card. `motion.article` keeps a framer
   * transform (`layout` plus the enter animation), and any transformed ancestor
   * becomes the containing block for `position: fixed` — so a sheet rendered in
   * place lands at the bottom of the CARD, a sliver wide and mostly off screen,
   * whether it says absolute or fixed. Portalling to the simulator root escapes
   * the transform, and there `fixed` resolves against the phone screen the way
   * MobilePhoneFrame's `translateZ(0)` intends (CLAUDE.md).
   */
  const rootRef = React.useRef<HTMLElement | null>(null);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    setPortalHost(rootRef.current?.closest('.amethyst-simulator') as HTMLElement | null);
  }, []);
  const sheet = (node: React.ReactNode) => (portalHost ? createPortal(node, portalHost) : null);

  const handleLike = () => {
    // A long press already opened the palette; swallow the click it also fires.
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    setIsLiked(!isLiked);
    if (isLiked) setReaction(null);
    onLike?.(post.id);
  };

  const startPress = () => {
    longPressed.current = false;
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      setPaletteOpen(true);
    }, 450);
  };
  const endPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };
  React.useEffect(() => () => { if (pressTimer.current) clearTimeout(pressTimer.current); }, []);

  const handleRepost = () => {
    setIsReposted(!isReposted);
    onRepost?.(post.id);
  };

  const handleZap = () => {
    setIsZapped(!isZapped);
    onZap?.(post.id);
  };

  /**
   * Avatar and name are their own tap targets upstream (`UserPicture` /
   * `NoteAuthorPicture` both route to the author's profile). They sit INSIDE
   * the card, whose own onClick opens the thread, so the tap has to be stopped
   * here — without that the ring the FAQ puts on an avatar leads to a thread.
   */
  const handleOpenProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenProfile?.(post);
  };

  // `zapAmount` on the mock note; falls back to the count when a caller has not
  // plumbed it (thread replies, profile cards).
  const satsZapped = post.stats.satsZapped ?? post.stats.zaps;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  /** A zero count renders nothing at all in the real app — the icon stands alone. */
  const ActionCount = ({ value }: { value: number }) =>
    value > 0 ? <span className="text-sm font-medium">{formatNumber(value)}</span> : null;

  /**
   * Rich text as real elements instead of `dangerouslySetInnerHTML`. The old
   * version injected coloured spans, so nothing in the body was a control: a tap
   * on a hashtag or a link bubbled to the card and opened the thread, and a
   * `nostr:` mention rendered as `@<hex-ish token>` instead of a name
   * (gaps ame-82).
   *
   * Mentions resolve to the mock display name and open that author's profile.
   * Hashtags and links stop the tap here rather than mis-navigating: neither a
   * hashtag feed nor a web view exists in this reproduction, and this simulator
   * never leaves the page.
   */
  const renderContent = (content: string) =>
    content.split(/(#\w+|nostr:\w+|https?:\/\/[^\s]+)/g).map((token, i) => {
      if (/^#\w+$/.test(token)) {
        return (
          <button
            key={i}
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="font-medium"
            style={{ color: 'var(--md-primary)' }}
          >
            {token}
          </button>
        );
      }
      if (/^nostr:\w+$/.test(token)) {
        const name = mentionName(token.slice(6));
        return (
          <button
            key={i}
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenProfile?.(post); }}
            className="font-medium"
            style={{ color: 'var(--md-primary)' }}
          >
            @{name}
          </button>
        );
      }
      if (/^https?:\/\//.test(token)) {
        return (
          <span
            key={i}
            onClick={(e) => e.stopPropagation()}
            className="underline"
            style={{ color: 'var(--md-primary)' }}
          >
            {token}
          </span>
        );
      }
      return <React.Fragment key={i}>{token}</React.Fragment>;
    });

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
      ref={rootRef}
      onClick={onOpenThread}
    >
      {/* Card Header */}
      <div className="p-4 flex items-start gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          onClick={handleOpenProfile}
          aria-label={`Open ${post.author.name}'s profile`}
          data-tour="amethyst-note-avatar"
          className="relative z-10 shrink-0"
        >
          <Avatar seed={post.author.handle || post.author.name || 'default'} className="md-avatar" />
          {/* The "Following" shield ground truth puts on the note avatar — in
              dark it is `inversePrimary` (#6200EE), NOT the accent. We used to
              draw a NIP-05 checkmark here, a different marker meaning a
              different thing, inherited from the v1.12.6 map (gaps ame-81). */}
          {post.author.following && (
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center z-20"
              style={{ background: 'var(--md-inverse-primary, #6200EE)' }}
              title="Following"
            >
              <ShieldCheck className="w-3 h-3 text-white" />
            </span>
          )}
        </motion.button>

        {/* v1.13.1 header: ONE row, `Arrangement.spacedBy(5.dp)` — name (weight 1),
            then every metadata marker, then the timestamp and ⋮ as an unspaced
            pair pinned right. v1.12.6 split this across two rows and hung the
            timestamp under the name. */}
        <div className="flex-1 min-w-0 flex items-center gap-[5px]">
          {/* A repost is signalled ONLY by the author's name going grey — the
              word "boosted" and `BoostedMark()` were deleted in v1.13.1. */}
          <button
            type="button"
            onClick={handleOpenProfile}
            className="font-semibold truncate text-left flex-1 min-w-0"
            style={{ color: post.isRepost ? 'var(--amethyst-gray-text)' : 'var(--md-on-surface)' }}
          >
            {post.author.name}
          </button>

          {markers.edited && <QuietMark Icon={Pencil} />}
          {markers.pinned && <QuietMark Icon={Pin} />}
          {markers.draft && <QuietMark label="Draft" />}
          {markers.rumor && <QuietMark Icon={EyeOff} />}
          {markers.location && <HeaderPill Icon={MapPin} label={markers.location} />}
          {markers.ots && <HeaderPill Icon={Stamp} label={markers.ots} />}
          {markers.pow && <HeaderPill Icon={Cog} label={markers.pow} />}
          {markers.expiration && <HeaderPill Icon={Timer} label={markers.expiration} />}
          {markers.bounty && <HeaderPill Icon={Trophy} label={markers.bounty} />}

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
              onClick={(e) => {
                // The header does not stopPropagation, so without this the tap
                // bubbled to the card and opened the THREAD — worse than the
                // no-op it looked like (gaps ame-13).
                e.stopPropagation();
                setMenuOpen(true);
              }}
              aria-label="Note options"
              data-tour="amethyst-note-options"
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
        <p className="text-[var(--md-on-surface)] leading-relaxed whitespace-pre-wrap">
          {renderContent(post.content)}
        </p>
      </div>

      {/* Card Images */}
      {post.images && post.images.length > 0 && (
        /* No tap target here on purpose: neither screen map documents one, and
           the hover/press springs we used to run made the tiles LOOK tappable
           while their click fell through to the card and opened the thread
           (gaps ame-80). */
        <div
          data-tour="amethyst-note-media"
          className={`px-4 pb-3 grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
        >
          {post.images.slice(0, 4).map((image, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-lg ${post.images!.length === 1 ? 'aspect-video' : 'aspect-square'}`}
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
            </div>
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
          onPointerDown={startPress}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          onContextMenu={(e) => { e.preventDefault(); setPaletteOpen(true); }}
          aria-label={isLiked ? 'Remove reaction' : 'React'}
          className={`action-btn action-btn-like md-ripple flex items-center gap-1.5 transition-colors ${
            isLiked ? 'active text-red-500' : 'text-[var(--md-on-surface-variant)] hover:text-red-500'
          }`}
        >
          {reaction ? (
            <span className="w-5 h-5 leading-5 text-center text-[15px]">{reaction}</span>
          ) : (
            <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
          )}
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
          {/* Sats, not the zap count. Ground truth shows an amount in this slot
              (the reference footer reads ⚡7.0k), so +21 used to be added to the
              wrong quantity entirely (gaps ame-79). */}
          <ActionCount value={satsZapped + (isZapped ? 21 : 0)} />
        </motion.button>

        {/* Share: `showCounter = false` upstream, so it is icon-only and — being
            the rightmost item without a counter — sits flush right instead of
            taking an equal-width slice (GenericInnerReactionRow's isLastIconOnly). */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          onClick={() => setShareOpen(true)}
          aria-label="Share"
          className="action-btn action-btn-share md-ripple flex items-center text-[var(--amethyst-placeholder)]"
        >
          <Share2 className="w-5 h-5" />
        </motion.button>
      </div>

      {/* The three sheets below use `fixed`, not `absolute`. They live inside the
          card, and the nearest positioned ancestor is the scrolling feed, so an
          absolutely-positioned `items-end` sheet lands at the bottom of the
          SCROLL CONTENT — metres below the viewport. `fixed` resolves against the
          phone screen instead, because MobilePhoneFrame's screen carries
          `translateZ(0)` precisely to be that containing block (CLAUDE.md).
          The Share sheet had this latent from the day it shipped. */}

      {/* Note overflow. `NoteQuickActionMenu.kt` — labels are the `quick_action_*`
          strings verbatim, in upstream's order. Copy paths say what they did
          rather than silently touching the clipboard; Block and Report are the
          two that open their own confirmation upstream, so they say so here. */}
      {menuOpen && sheet(
        <div
          className="fixed inset-0 z-[130] flex items-end"
          onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-label="Note options"
            data-tour="amethyst-note-menu"
            className="relative w-full rounded-t-3xl pb-3"
            style={{ background: 'var(--md-surface-container-high)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { label: 'Copy Text', Icon: Copy },
              { label: 'Note ID', Icon: Copy },
              { label: 'Author ID', Icon: Copy },
              { label: 'Broadcast', Icon: Radio },
              { label: 'Mute thread', Icon: BellOff },
              { label: 'Unfollow', Icon: UserMinus },
              { label: 'Block', Icon: ShieldCheck },
              { label: 'Report', Icon: Flag },
            ].map((row) => (
              <button
                key={row.label}
                type="button"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-4 px-5 py-3 text-left"
                style={{ color: row.label === 'Block' || row.label === 'Report' ? 'var(--md-error)' : 'var(--md-on-surface)' }}
              >
                <row.Icon className="w-5 h-5 shrink-0 text-[var(--md-on-surface-variant)]" />
                {row.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Long-press reaction palette. Upstream's default set is configurable in
          Settings › Reactions; this is the shipped default row. */}
      {paletteOpen && sheet(
        <div
          className="fixed inset-0 z-[130] flex items-end"
          onClick={(e) => { e.stopPropagation(); setPaletteOpen(false); }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-label="React"
            data-tour="amethyst-reaction-palette"
            className="relative w-full rounded-t-3xl px-4 py-5"
            style={{ background: 'var(--md-surface-container-high)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable, like the real palette: the set is configurable, so it
                must not assume it fits the phone's width. */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {['❤️', '👍', '🔥', '🤙', '😂', '🫂', '⚡'].map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    setReaction(e);
                    setIsLiked(true);
                    setPaletteOpen(false);
                    onLike?.(post.id);
                  }}
                  aria-label={`React with ${e}`}
                  className="text-2xl leading-none p-2"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share sheet. In v1.13.1 the Share button stopped firing the Android
          chooser directly and opens this in-app ModalBottomSheet instead; only
          the first row still hands off to the OS. Strings verbatim:
          quick_action_share / share_as_image / share_as_image_url / share_as_qr. */}
      {shareOpen && sheet(
        <div
          className="fixed inset-0 z-[130] flex items-end"
          onClick={(e) => {
            e.stopPropagation();
            setShareOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-label="Share"
            data-tour="amethyst-share-sheet"
            className="relative w-full rounded-t-3xl pb-3"
            style={{ background: 'var(--md-surface-container-high)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-sm py-3" style={{ color: 'var(--md-on-surface-variant)' }}>
              Share
            </p>
            {[
              { label: 'Share', Icon: Share2 },
              { label: 'Share as Image', Icon: ImageIcon },
              { label: 'Share as Image Url', Icon: ImageIcon },
              { label: 'Share as QR', Icon: QrCode },
            ].map((row, i) => (
              <button
                key={`${row.label}-${i}`}
                type="button"
                onClick={() => setShareOpen(false)}
                className="w-full flex items-center gap-4 px-5 py-3.5 text-left text-[var(--md-on-surface)]"
              >
                <row.Icon className="w-5 h-5 shrink-0 text-[var(--md-on-surface-variant)]" />
                {row.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
          <div className="pt-1">
            {/* Ground truth NAMES this row; a bare server glyph in the label
                column left it unreadable (gaps ame-12). */}
            <p className="text-xs mb-1" style={{ color: 'var(--amethyst-placeholder)' }}>
              Accepted by relays
            </p>
            <div className="flex items-center gap-3">
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
        </div>
      )}
    </motion.article>
  );
}
