/**
 * The contract every /compare surface implements.
 *
 * A surface is one part of a client's interface shown side by side across the
 * shelf: the note, the first screen, the composer, the navigation. Each cell
 * mounts THAT CLIENT'S OWN component — never a lookalike built here. A
 * lookalike would compare our two guesses instead of their two designs, which
 * is the entire point missed.
 *
 * Two consequences of that rule, both visible in the data below:
 *
 * - **Sizes are per client, not per surface.** A phone client's screen is
 *   390pt wide; a web client's is 1022px, which is exactly what a frameless
 *   client gets inside `ClientView`'s card (CLAUDE.md's breakpoint gotcha —
 *   a web layout rendered at phone width is not that client's design, it is
 *   its mobile breakpoint). The cell renders at the natural size and scales
 *   the whole thing down, so what you compare is the real layout.
 *
 * - **A client with no extractable component is ABSENT and says why.** It is
 *   not quietly dropped and never re-implemented. `Surface.absent` carries the
 *   reason, and the page prints it.
 */
import type { ComponentType } from 'react';
import type { MockNote, MockUser } from '../../../data/mock';

export interface SurfacePreviewProps {
  note: MockNote;
  author: MockUser;
  /** Snort resolves mentions and quotes against the full bank. */
  users: MockUser[];
}

export interface ClientSurface {
  Component: ComponentType<SurfacePreviewProps>;
  /**
   * The class the client's theme CSS is scoped to, WITHOUT a theme modifier —
   * the caller applies the theme as both a class and `data-theme`, because the
   * eight sheets disagree about which one they read. See docs/COMPARE.md.
   */
  rootClass: string;
  /**
   * Natural CSS size the component is designed for. The cell scales to the
   * column width and keeps the aspect. Omit for a fluid component (the note
   * cards), which are laid out at the column's own width and read at 1:1.
   */
  natural?: { width: number; height: number };
}

export interface Surface {
  id: string;
  label: string;
  /** One line under the tab — what the reader is looking at and why it differs. */
  blurb: string;
  byClient: Record<string, ClientSurface>;
  /** clientId → why there is no cell. Rendered; never silently omitted. */
  absent?: Record<string, string>;
}

/** Phone clients render at a phone's width, web clients at ClientView's card. */
export const PHONE = { width: 390, height: 720 };
export const WEB = { width: 1022, height: 640 };
