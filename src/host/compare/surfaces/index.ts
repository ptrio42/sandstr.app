/**
 * The surfaces /compare can show, in the order a newcomer meets them: the first
 * screen asks for something, then you read a note, then you write one, and the
 * bar at the bottom is how you get anywhere else.
 */
// The nine theme sheets, imported explicitly and in one place.
//
// They are NOT reliably pulled in by the components above: a simulator's root
// imports its own sheet, but the leaf components we mount here mostly do not,
// and which ones happen to are an implementation detail that can change under
// us. A missing sheet costs nothing at build time and nothing in typecheck —
// it just renders that client unstyled, which is the one failure this page
// cannot afford. Listing them is the cheap insurance.
import '../../../simulators/damus/damus.theme.css';
import '../../../simulators/amethyst/amethyst.theme.css';
import '../../../simulators/primal/web/primal-web.theme.css';
import '../../../simulators/yakihonne/yakihonne.theme.css';
import '../../../simulators/snort/snort.theme.css';
import '../../../simulators/wisp/wisp.theme.css';
import '../../../simulators/nostur/nostur.theme.css';
import '../../../simulators/coracle/coracle.theme.css';
import '../../../simulators/boris/boris.theme.css';

import { firstScreenSurface } from './firstScreen';
import { noteSurface } from './note';
import { composeSurface } from './compose';
import { navigationSurface } from './navigation';
import type { Surface } from './types';

export const SURFACES: Surface[] = [
  firstScreenSurface,
  noteSurface,
  composeSurface,
  navigationSurface,
];

export * from './types';
