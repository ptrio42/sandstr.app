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
 * ONE CLIENT IS ABSENT AND SAYS SO. Coracle's sidebar is written inline inside
 * `CoracleSimulator.tsx`, closed over the simulator's screen, modal, auth and
 * submenu state. Pulling it out is a genuine refactor of a `ready` client, not
 * a one-line export like Snort's rail, so it is named here rather than faked
 * with a lookalike — the rule this whole page runs on.
 */
import { TabBar as DamusTabBar } from '../../../simulators/damus/components/TabBar';
import { BottomNav as AmethystNav } from '../../../simulators/amethyst/components/BottomNav';
import { TabBar as YakiTabBar } from '../../../simulators/yakihonne/components/TabBar';
import { BottomBar as WispBar } from '../../../simulators/wisp/components/BottomBar';
import { BottomBar as NosturBar } from '../../../simulators/nostur/components/BottomBar';
import { LeftSidebar as PrimalSidebar } from '../../../simulators/primal/web/components/LeftSidebar';
import { Rail as SnortRail } from '../../../simulators/snort/SnortSimulator';

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

export const navigationSurface: Surface = {
  id: 'navigation',
  label: 'Getting around',
  blurb:
    'Bottom bar or left rail, and which handful of destinations earned a permanent slot. Amethyst has no search tab; Damus and YakiHonne float compose above the bar instead of putting it in it.',
  byClient: {
    damus: { Component: DamusNav, rootClass: 'damus-simulator', natural: BAR },
    amethyst: { Component: AmethystNavCell, rootClass: 'amethyst-simulator', natural: BAR },
    primal: { Component: PrimalNav, rootClass: 'primal-web', natural: RAIL },
    yakihonne: { Component: YakiNav, rootClass: 'yakihonne-simulator', natural: BAR },
    snort: { Component: SnortNav, rootClass: 'snort-simulator', natural: RAIL },
    wisp: { Component: WispNav, rootClass: 'wisp-simulator', natural: BAR },
    nostur: { Component: NosturNav, rootClass: 'nostur-simulator', natural: BAR },
  },
  absent: {
    coracle:
      'Coracle’s sidebar is written inline in its simulator, closed over screen, modal and auth state. Extracting it is a refactor of a ready client, not a one-line export — so it is missing here rather than approximated.',
  },
};
