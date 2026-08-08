/**
 * Tour System Type Definitions
 */

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: TooltipPosition;
  action?: string;
  /**
   * INERT, and deliberately so. The backdrop has never blocked clicks:
   * `.tour-overlay` is `pointer-events: none` and `.tour-backdrop` never opts
   * back in, so every step is click-through whether or not it sets this.
   *
   * Kept because that IS the behaviour this product wants — the pitch is "just
   * try it", and a tour that freezes the reproduction contradicts it. 61 of the
   * 79 steps set it to true; of the 18 that don't, 16 are welcome/outro cards
   * and two (`keychat-chat-room`, `keychat-message-input`) simply forgot. So the
   * flag encodes a universal intent, not a per-step choice.
   *
   * To make it real, give `.tour-backdrop` `pointer-events: auto` and let
   * `--click-through` turn it off again — but that makes those 18 steps modal,
   * which is a product decision, not a cleanup.
   */
  allowClickThrough?: boolean;
  spotlightPadding?: number;
  /**
   * Whether the step advances manually (clicking Next) or automatically on action
   * @default 'manual'
   */
  trigger?: 'manual' | 'action';
  /**
   * Identifier for the action that triggers advancement when trigger is 'action'
   */
  actionType?: string;
  /**
   * Callback when an action is triggered for this step
   */
  onAction?: (actionType: string, data?: any) => void;
  /**
   * Optional validation function that must return true before advancing
   */
  validateStep?: () => boolean;
  /**
   * Callback when tour enters this step - use to navigate simulator to correct state
   */
  onEnter?: () => void;
}

export interface TourConfig {
  id: string;
  name: string;
  steps: TourStep[];
  storageKey: string;
}

export interface TourState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  hasCompleted: boolean;
  hasSkipped: boolean;
  /**
   * Whether the current step is waiting for an action to be triggered
   */
  waitingForAction: boolean;
  /**
   * The action type that the current step is waiting for
   */
  expectedActionType: string | null;
}

export interface TourContextValue {
  state: TourState;
  config: TourConfig | null;
  startTour: (config: TourConfig) => void;
  endTour: (skip?: boolean) => void;
  goToStep: (stepIndex: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  restartTour: (tourConfig?: TourConfig) => void;
  currentStepData: TourStep | null;
  /**
   * Register an action that may trigger tour advancement
   * @param actionType - The type of action being performed
   * @param data - Optional data associated with the action
   */
  registerAction: (actionType: string, data?: any) => void;
  /**
   * Check if the tour is currently waiting for a specific action
   * @param actionType - The action type to check
   */
  isWaitingForAction: (actionType: string) => boolean;
}

export interface TooltipRect {
  top: number;
  left: number;
  width: number;
  height: number;
  /**
   * Height ceiling for the card, so a long step can't grow back over the control
   * it is describing. Derived only from the target and the viewport — never from
   * the card's own size, which would make it oscillate.
   */
  maxHeight: number;
}

export interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
  padding: number;
}
