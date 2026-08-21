/**
 * Surface: the navigation chrome — how you get anywhere.
 *
 * The starkest structural split on the shelf, and one a feed screenshot hides:
 * phone clients put four or five icons in a bottom bar (and disagree about
 * which five, and about whether compose is one of them or floats above), while
 * web clients hand you a left rail or a sidebar. Amethyst's five are Home,
 * Messages, Shorts, Discover, Notifications — no search tab at all, which is a
 * FAQ question of its own.
 *
 * Each cell mounts that client's real bar or rail with its real item list.
 *
 * Two of the eight needed their component freed first, and neither was faked in
 * the meantime: Snort's `Rail` only needed an `export`, and Coracle's sidebar —
 * written inline in `CoracleSimulator`, closed over screen, modal, auth and
 * submenu state — was lifted into `coracle/components/Sidebar.tsx` verbatim,
 * with that state turned into props. Same markup, same classes, same order.
 */
import { useState } from 'react';
import { TabBar as DamusTabBar } from '../../../simulators/damus/components/TabBar';
import { BottomNav as AmethystNav } from '../../../simulators/amethyst/components/BottomNav';
import { TabBar as YakiTabBar } from '../../../simulators/yakihonne/components/TabBar';
import { BottomBar as WispBar } from '../../../simulators/wisp/components/BottomBar';
import { BottomBar as NosturBar } from '../../../simulators/nostur/components/BottomBar';
import { LeftSidebar as PrimalSidebar } from '../../../simulators/primal/web/components/LeftSidebar';
import { Rail as SnortRail } from '../../../simulators/snort/SnortSimulator';
import { Sidebar as CoracleSidebar } from '../../../simulators/coracle/components/Sidebar';
import { BottomBar as BorisBar } from '../../../simulators/boris/components/BottomBar';

import type { Surface, SurfacePreviewProps } from './types';

const noop = () => {};

/** A bar is the width of the phone and about as tall as a thumb. */
const BAR = { width: 390, height: 96 };
/** A rail is the height of the page and a fraction of its width. */
const RAIL = { width: 300, height: 620 };

function DamusNav() {
  return <DamusTabBar activeTab="home" onNavigate={noop} onCompose={noop} notificationDot />;
}
function AmethystNavCell() {
  return <AmethystNav activeTab="home" onTabChange={noop} />;
}
function YakiNav() {
  return <YakiTabBar active="home" fabVisible onNavigate={noop} onCompose={noop} />;
}
function WispNav() {
  return <WispBar activeTab="home" onTabChange={noop} unread={{ notifications: true }} />;
}
// The only bar on this row with no compose affordance anywhere — not in it,
// not floating above it. Boris has nothing to compose.
function BorisNav() {
  return <BorisBar activeTab="home" onTabChange={noop} />;
}
function NosturNav() {
  return <NosturBar active="home" onSelect={noop} badges={{ notifications: 3 }} />;
}
function PrimalNav() {
  return (
    <PrimalSidebar activeTab="home" onTabChange={noop} onNewNote={noop} onOpenProfile={noop} />
  );
}
function SnortNav({ author }: SurfacePreviewProps) {
  return (
    <SnortRail
      wide
      screen="timeline"
      isAuthed
      currentUser={author}
      onNavigate={noop}
      onCompose={noop}
      onViewProfile={noop}
    />
  );
}

// Coracle's submenu is controlled by design (the simulator closes it on every
// navigation), so the shop-window copy holds it too — it is the one thing on
// this surface that opens, and a dead Settings row would misrepresent it.
function CoracleNav({ author }: SurfacePreviewProps) {
  const [submenu, setSubmenu] = useState<'settings' | 'account' | null>(null);
  return (
    <CoracleSidebar
      screen="feeds"
      modalOpen={false}
      isAuthed
      currentUser={author}
      submenu={submenu}
      onSubmenu={setSubmenu}
      onNavigate={noop}
      onOpenModal={noop}
      onOpenSettings={noop}
      onViewOwnProfile={noop}
      onLogout={noop}
      onToast={noop}
    />
  );
}

export const navigationSurface: Surface = {
  id: 'navigation',
  label: 'Getting around',
  blurb:
    'Bottom bar or left rail, and which handful of destinations earned a permanent slot. Amethyst has no search tab; Damus and YakiHonne float compose above the bar instead of putting it in it; Boris has no compose control at all.',
  byClient: {
    damus: { Component: DamusNav, rootClass: 'damus-simulator', natural: BAR },
    amethyst: { Component: AmethystNavCell, rootClass: 'amethyst-simulator', natural: BAR },
    primal: { Component: PrimalNav, rootClass: 'primal-web', natural: RAIL },
    yakihonne: { Component: YakiNav, rootClass: 'yakihonne-simulator', natural: BAR },
    snort: { Component: SnortNav, rootClass: 'snort-simulator', natural: RAIL },
    wisp: { Component: WispNav, rootClass: 'wisp-simulator', natural: BAR },
    nostur: { Component: NosturNav, rootClass: 'nostur-simulator', natural: BAR },
    coracle: { Component: CoracleNav, rootClass: 'coracle-simulator', natural: RAIL },
    boris: { Component: BorisNav, rootClass: 'boris-simulator', natural: BAR },
  },
};
