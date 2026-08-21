/**
 * Shared contracts between the Boris shell (BorisSimulator.tsx) and its screens.
 * Screens are built against these interfaces — keep them stable.
 */

import type { MockUser } from '../../data/mock';
import type { BorisArticle, BorisHighlight } from './borisData';

/** The five bottom-bar destinations, in the real app's order (BorisBottomBar.kt). */
export type BorisTab = 'home' | 'library' | 'feeds' | 'search' | 'you';

/** Every settings sub-screen, in the order the root list presents them. */
export type BorisSettingsScreen =
  | 'root'
  | 'appearance'
  | 'reading'
  | 'tts'
  | 'media'
  | 'highlights'
  | 'zap-splits'
  | 'home'
  | 'library'
  | 'feeds'
  | 'scroll'
  | 'relays'
  | 'airplane'
  | 'about';

/** Library scope chips (LibraryScreen.kt). */
export type LibraryScope = 'all' | 'private' | 'public' | 'web' | 'lookmarks' | 'archive';

/** Feeds content-type chips (ContentTabs.kt). */
export type FeedTab = 'all' | 'highlights' | 'writings' | 'rss';

/** Feeds audience scope — the three icons in the Feeds top bar. */
export type FeedScope = 'nostrverse' | 'friends' | 'you';

/** Profile content tabs (ContentTabs.kt, profile variant). */
export type ProfileTab = 'highlights' | 'writings' | 'public' | 'web';

/** Tour command contract (CLAUDE.md: non-negotiable interface shape). */
export interface SimulatorCommand {
  type:
    | 'login'
    | 'navigate'
    | 'openArticle'
    | 'highlight'
    | 'openPane'
    | 'playTts'
    | 'openSettings'
    | 'openAbout'
    | 'viewProfile'
    | 'back';
  payload?: any;
}

export interface BorisSimulatorProps {
  className?: string;
  tourCommand?: SimulatorCommand | null;
  onCommandHandled?: () => void;
}

/** What the reader is currently doing with an article. */
export type ReaderPane = null | 'contents' | 'highlights' | 'find';

export interface ReaderState {
  article: BorisArticle;
  /** 0–100, the number the real app prints bottom-right */
  progress: number;
  pane: ReaderPane;
  /** the reader's own highlights, added live by the selection toolbar */
  ownMarks: string[];
}

export interface TtsState {
  article: BorisArticle;
  playing: boolean;
  /** index of the body block being spoken — drives the teal follow-along mark */
  blockIndex: number;
  speed: number;
}

export interface HighlightWithArticle extends BorisHighlight {
  article: BorisArticle;
  author: MockUser;
}
