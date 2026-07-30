import React from 'react';

/**
 * Snort's icon set.
 *
 * The real client ships ONE sprite sheet (`Components/Icons/icons.svg`, 119
 * symbols) and renders it as `<svg width={size} height={size}><use
 * href={sprite#name} /></svg>` — no fill/stroke props, so colour comes purely
 * from `currentColor` inheritance (`Icon.tsx`, and see screen-map §5.2). The
 * symbols are a Lucide / Untitled-UI-ish outline set: `stroke="currentColor"`,
 * `fill="none"`, ~1.7 stroke width, round caps and joins.
 *
 * We can't ship their sprite (it's their artwork — see SHIP-AND-GRANT B3), so
 * these are equivalent outline glyphs drawn here, keeping Snort's OWN NAMES so
 * the screens read like the real source. Default size 20; the nav passes 24 and
 * the note action bar passes 18, exactly as upstream does.
 *
 * `-solid` variants are the filled counterparts the nav swaps to when active.
 */

export type IconName =
  | 'home-outline' | 'home-solid'
  | 'search-outline' | 'search-solid'
  | 'bell-outline' | 'bell-solid'
  | 'mail-outline' | 'mail-solid'
  | 'settings-outline' | 'settings-solid'
  | 'reply' | 'repeat' | 'heart' | 'heart-solid'
  | 'zap' | 'zap-solid' | 'zapFast' | 'zapCircle'
  | 'plus' | 'chevronDown' | 'arrowBack' | 'arrowFront' | 'arrowUp' | 'arrow-right'
  | 'dots' | 'x' | 'close' | 'copy' | 'check' | 'trash'
  | 'qr' | 'mute' | 'wifi' | 'pencil' | 'stars' | 'user-v2' | 'user-x'
  | 'bookmark-solid' | 'at-sign' | 'hash' | 'fire' | 'message-chat-circle'
  | 'camera-plus' | 'thumbs-up' | 'reverse-left' | 'lightbulb' | 'sats'
  | 'attachment' | 'bar-chart' | 'link-02' | 'key' | 'translate' | 'sign-in'
  | 'relay' | 'profile' | 'badge' | 'gear' | 'wallet' | 'tool' | 'shield-tick'
  | 'hard-drive' | 'logout' | 'diamond' | 'book-closed' | 'alert-circle'
  | 'share' | 'expand';

const S = 'currentColor';

/** Outline glyphs — stroked, never filled. */
const OUTLINE: Partial<Record<IconName, React.ReactNode>> = {
  'home-outline': <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  'search-outline': <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></>,
  'bell-outline': <><path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" /><path d="M13.7 20a2 2 0 0 1-3.4 0" /></>,
  'mail-outline': <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6 8.5-6" /></>,
  'settings-outline': <><circle cx="12" cy="12" r="3" /><path d="M19.4 14a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V20a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 18.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 5.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H10a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V10a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></>,
  reply: <path d="M20 17a8 8 0 0 0-8-8H8V5l-5 5 5 5v-4h4a5 5 0 0 1 5 5z" />,
  repeat: <><path d="M4 8V7a3 3 0 0 1 3-3h11" /><path d="m15 1 3 3-3 3" /><path d="M20 16v1a3 3 0 0 1-3 3H6" /><path d="m9 23-3-3 3-3" /></>,
  heart: <path d="M19.1 5.4a4.6 4.6 0 0 0-6.5 0l-.6.6-.6-.6a4.6 4.6 0 0 0-6.5 6.5l.6.6L12 19l6.5-6.5.6-.6a4.6 4.6 0 0 0 0-6.5z" />,
  zap: <path d="M13 2 4 14h6l-1 8 9-12h-6z" />,
  zapFast: <><path d="M13 2 5 13h5l-1 7 8-11h-5z" /><path d="M20 8h2M19 12h3M20 16h2" /></>,
  zapCircle: <><circle cx="12" cy="12" r="9" /><path d="M13 6.5 8.5 12.5H12l-1 5 4.5-6H12z" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  arrowBack: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
  arrowFront: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  arrowUp: <><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>,
  'arrow-right': <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  dots: <><circle cx="12" cy="5" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="12" cy="19" r="1.4" /></>,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></>,
  check: <path d="m5 13 4 4L19 7" />,
  trash: <><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M6 6v14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6" /></>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1" /></>,
  mute: <><path d="M11 5 6 9H2v6h4l5 4z" /><path d="m22 9-6 6M16 9l6 6" /></>,
  wifi: <><path d="M2 8.8a16 16 0 0 1 20 0" /><path d="M5 12.5a11 11 0 0 1 14 0" /><path d="M8.5 16a6 6 0 0 1 7 0" /><circle cx="12" cy="19.5" r="1" /></>,
  pencil: <><path d="M17 3.5a2.1 2.1 0 0 1 3 3L7.5 19 3 20.5 4.5 16z" /><path d="m15 5.5 3 3" /></>,
  stars: <><path d="m12 3 2.2 5.1L20 9.3l-4 3.9.9 5.8-4.9-2.8-4.9 2.8.9-5.8-4-3.9 5.8-1.2z" /></>,
  'user-v2': <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  'user-x': <><circle cx="10" cy="8" r="4" /><path d="M3 21a7 7 0 0 1 11.5-5.4" /><path d="m17 17 4 4M21 17l-4 4" /></>,
  'at-sign': <><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></>,
  hash: <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />,
  fire: <path d="M12 2s5 4.5 5 9a5 5 0 0 1-10 0c0-1.6.7-3 1.6-4.1.2 1.4 1 2.6 2.1 2.6 1.3 0 1.8-1.2 1.3-3.1-.4-1.6-.6-3.2 0-4.4z" />,
  'message-chat-circle': <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.8L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />,
  'camera-plus': <><path d="M21 18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l1.5-2h5L15 7h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="3.2" /></>,
  'thumbs-up': <><path d="M7 21V10l5-8a2.5 2.5 0 0 1 2.4 3.2L13.5 9H19a2 2 0 0 1 2 2.4l-1.6 7A2 2 0 0 1 17.4 20H7z" /><path d="M7 10H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3" /></>,
  'reverse-left': <><path d="M4 9h11a5 5 0 0 1 0 10h-3" /><path d="m8 5-4 4 4 4" /></>,
  lightbulb: <><path d="M9.5 18h5" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 1 3.6 10.8c-.6.5-.9 1-1 1.7H9.4c-.1-.7-.4-1.2-1-1.7A6 6 0 0 1 12 3z" /></>,
  sats: <><circle cx="12" cy="12" r="9" /><path d="M8.5 9.5h7M8.5 14.5h7M8 12h8" /></>,
  attachment: <path d="M20 11.5 12.3 19a5 5 0 0 1-7-7l8-8a3.3 3.3 0 0 1 4.7 4.7l-7.9 8a1.7 1.7 0 0 1-2.4-2.4l7.2-7.2" />,
  'bar-chart': <path d="M6 20v-6M12 20V7M18 20v-9" />,
  'link-02': <><path d="M10 13.5a4 4 0 0 0 6 .5l2.5-2.5a4.2 4.2 0 0 0-6-6L11 7" /><path d="M14 10.5a4 4 0 0 0-6-.5L5.5 12.5a4.2 4.2 0 0 0 6 6L13 17" /></>,
  key: <><circle cx="8" cy="14" r="4.5" /><path d="m11.5 11 8-8M17 5.5l2.5 2.5M14.5 8l2.5 2.5" /></>,
  translate: <><path d="M3 6h11M8.5 3.5V6" /><path d="M11 6c0 4-3 8-8 8" /><path d="M6 10.5c0 2.5 2.5 4.5 6 5.5" /><path d="m13 21 4.5-10L22 21M14.8 17.5h5.4" /></>,
  'sign-in': <><path d="M14 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5M15 12H3" /></>,
  relay: <><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /><path d="M7 7.5h.01M7 16.5h.01" /></>,
  profile: <><circle cx="12" cy="12" r="9" /><path d="M12 12.5a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6z" /><path d="M6.5 19a6 6 0 0 1 11 0" /></>,
  badge: <><path d="M12 3.2 14 5l2.6-.4.7 2.5 2.2 1.5-1.2 2.4 1.2 2.4-2.2 1.5-.7 2.5L14 16.6 12 18.4 10 16.6l-2.6.5-.7-2.5L4.5 13l1.2-2.4L4.5 8.2l2.2-1.5.7-2.5L10 5z" /><path d="m9.5 11.5 1.8 1.8 3.2-3.6" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 14a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V20a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 18.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 5.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H10a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V10a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></>,
  wallet: <><path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2" /><path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" /><path d="M21 10h-4a2.5 2.5 0 0 0 0 5h4z" /></>,
  tool: <path d="M14.5 5.5a4.5 4.5 0 0 0 5.8 5.8L21 12l-8.5 8.5a2.1 2.1 0 0 1-3-3L18 9l.7-.7a4.5 4.5 0 0 0-4.2-2.8z" />,
  'shield-tick': <><path d="M12 3 5 6v6c0 4.5 3 7.8 7 9 4-1.2 7-4.5 7-9V6z" /><path d="m9 12 2 2 4-4" /></>,
  'hard-drive': <><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /><path d="M7 7.5h.01M7 16.5h.01" /></>,
  logout: <><path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
  diamond: <path d="m12 3 8 6-8 12-8-12z" />,
  'book-closed': <><path d="M5 4a2 2 0 0 1 2-2h11v18H7a2 2 0 0 0-2 2z" /><path d="M5 18h13" /></>,
  'alert-circle': <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16.2h.01" /></>,
  share: <><path d="M12 15V3" /><path d="m8 7 4-4 4 4" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></>,
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
};

/** Filled counterparts — the nav swaps outline→solid on the active item. */
const SOLID: Partial<Record<IconName, React.ReactNode>> = {
  'home-solid': <path d="M11.4 2.3a1 1 0 0 1 1.2 0l8.5 7a1 1 0 0 1 .4.8V20a1 1 0 0 1-1 1h-5.5v-6h-4v6H4.5a1 1 0 0 1-1-1v-9.9a1 1 0 0 1 .4-.8z" />,
  // Filled ring + handle, NOT a solid disc: at 24px a filled circle reads as a
  // featureless blob rather than a magnifier.
  'search-solid': (
    <>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 3.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6z"
      />
      <path d="M16.5 16.5a1.1 1.1 0 0 1 1.6 0l3 3a1.1 1.1 0 0 1-1.6 1.6l-3-3a1.1 1.1 0 0 1 0-1.6z" />
    </>
  ),
  'bell-solid': <><path d="M12 2a6 6 0 0 0-6 6c0 5.5-2 6.6-2 6.6a1 1 0 0 0 .6 1.8h14.8a1 1 0 0 0 .6-1.8S18 13.5 18 8a6 6 0 0 0-6-6z" /><path d="M10.3 19a2 2 0 0 0 3.4 0z" /></>,
  'mail-solid': <path d="M3 7.3V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7.3l-8.4 5.9a1 1 0 0 1-1.2 0zM4.2 5h15.6a1 1 0 0 1 .8 1.6L12 12 3.4 6.6A1 1 0 0 1 4.2 5z" />,
  'settings-solid': <path d="M13.7 2.2a2 2 0 0 0-3.4 0l-.5 1.5a1.6 1.6 0 0 1-2 1.1l-1.5-.5A2 2 0 0 0 4 7.2l1 1.2a1.6 1.6 0 0 1 0 2.3L4 11.9a2 2 0 0 0 2.3 2.9l1.5-.5a1.6 1.6 0 0 1 2 1.2l.5 1.5a2 2 0 0 0 3.4 0l.5-1.5a1.6 1.6 0 0 1 2-1.2l1.5.5a2 2 0 0 0 2.3-2.9l-1-1.2a1.6 1.6 0 0 1 0-2.3l1-1.2a2 2 0 0 0-2.3-2.9l-1.5.5a1.6 1.6 0 0 1-2-1.1zM12 15.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4z" />,
  'heart-solid': <path d="M19.1 5.4a4.6 4.6 0 0 0-6.5 0l-.6.6-.6-.6a4.6 4.6 0 0 0-6.5 6.5l.6.6L12 19l6.5-6.5.6-.6a4.6 4.6 0 0 0 0-6.5z" />,
  'zap-solid': <path d="M13 2 4 14h6l-1 8 9-12h-6z" />,
  'bookmark-solid': <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.2L5 21V4a1 1 0 0 1 1-1z" />,
};

export interface IconProps {
  name: IconName;
  /** Upstream default is 20; nav passes 24, the note action bar passes 18. */
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, className, strokeWidth = 1.7 }: IconProps) {
  const solid = SOLID[name];
  const body = solid ?? OUTLINE[name];
  if (!body) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...(solid
        ? { fill: S, stroke: 'none' }
        : {
            fill: 'none',
            stroke: S,
            strokeWidth,
            strokeLinecap: 'round' as const,
            strokeLinejoin: 'round' as const,
          })}
    >
      {body}
    </svg>
  );
}

export default Icon;
