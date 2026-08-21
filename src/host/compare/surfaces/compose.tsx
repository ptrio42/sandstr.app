/**
 * Surface: the composer — where the post is actually written.
 *
 * The differences here are the ones people feel on day one and cannot see from
 * a screenshot of a feed: Coracle counts characters AND words and hides content
 * warnings, scheduling, proof-of-work and expiry behind a cog; Wisp arms a
 * 10-second undo countdown instead of sending; Primal renders a live NOTE
 * PREVIEW under the field; YakiHonne's toolbar carries a scheduler and smart
 * widgets. Every one of those is that client's own component, mounted here.
 *
 * Sizes: a phone composer is a full screen, a web one is a modal or an inline
 * box, so the web cells declare their own natural box rather than the shelf's
 * full-page default.
 */
import { ComposeScreen as DamusCompose } from '../../../simulators/damus/screens/ComposeScreen';
import { ComposeScreen as AmethystCompose } from '../../../simulators/amethyst/screens/ComposeScreen';
import { ComposeBox as PrimalCompose } from '../../../simulators/primal/web/components/ComposeBox';
import { ComposeSheet as YakiCompose } from '../../../simulators/yakihonne/screens/ComposeSheet';
import { ComposeScreen as SnortCompose } from '../../../simulators/snort/screens/ComposeScreen';
import { ComposeScreen as WispCompose } from '../../../simulators/wisp/screens/ComposeScreen';
import { ComposeScreen as NosturCompose } from '../../../simulators/nostur/screens/ComposeScreen';
import { ComposeScreen as CoracleCompose } from '../../../simulators/coracle/screens/ComposeScreen';

import { PHONE, type Surface, type SurfacePreviewProps } from './types';

const noop = () => {};

/** The web composers are panels, not pages — a full 1022x640 would be mostly air. */
const WEB_PANEL = { width: 700, height: 460 };

function DamusComposeCell({ author, users }: SurfacePreviewProps) {
  return <DamusCompose currentUser={author} users={users} onPost={noop} onCancel={noop} />;
}
function AmethystComposeCell() {
  return <AmethystCompose isOpen onClose={noop} onPost={noop} />;
}
function PrimalComposeCell() {
  return <PrimalCompose open onOpen={noop} onClose={noop} onPost={noop} />;
}
function YakiComposeCell({ author }: SurfacePreviewProps) {
  return <YakiCompose currentUserSeed={author.username} onClose={noop} onPost={noop} />;
}
function SnortComposeCell({ author }: SurfacePreviewProps) {
  return <SnortCompose currentUser={author} replyTo={null} onClose={noop} onPost={noop} />;
}
function WispComposeCell({ author }: SurfacePreviewProps) {
  return <WispCompose currentUser={author} replyTo={null} onClose={noop} onPublish={noop} />;
}
function NosturComposeCell({ author }: SurfacePreviewProps) {
  return <NosturCompose account={author} replyTo={null} onClose={noop} onPost={noop} />;
}
function CoracleComposeCell() {
  return <CoracleCompose onSend={noop} />;
}

export const composeSurface: Surface = {
  id: 'compose',
  label: 'Writing a post',
  blurb:
    'The screen you meet the first time you have something to say. Watch the toolbar under the field — that row is where the clients disagree most, and where Wisp’s undo countdown and Coracle’s note settings live.',
  byClient: {
    damus: { Component: DamusComposeCell, rootClass: 'damus-simulator', natural: PHONE },
    amethyst: { Component: AmethystComposeCell, rootClass: 'amethyst-simulator', natural: PHONE },
    primal: { Component: PrimalComposeCell, rootClass: 'primal-web', natural: WEB_PANEL },
    yakihonne: { Component: YakiComposeCell, rootClass: 'yakihonne-simulator', natural: PHONE },
    snort: { Component: SnortComposeCell, rootClass: 'snort-simulator', natural: WEB_PANEL },
    wisp: { Component: WispComposeCell, rootClass: 'wisp-simulator', natural: PHONE },
    nostur: { Component: NosturComposeCell, rootClass: 'nostur-simulator', natural: PHONE },
    coracle: { Component: CoracleComposeCell, rootClass: 'coracle-simulator', natural: WEB_PANEL },
  },
  absent: {
    boris:
      'has no composer. The only thing you publish is a highlight, and you make one by selecting a sentence in an article — there is no screen to show.',
  },
};
