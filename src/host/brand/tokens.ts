/**
 * Sandstr brand tokens — "Palette 3" (Dark / Nostr / Premium), the approved set.
 *
 * These belong to the HOST chrome only. Simulators keep their own client-accurate
 * tokens (see docs/FIDELITY.md); nothing here may leak into `src/simulators/`.
 */

export const brand = {
  /** Page ground in dark mode. */
  obsidian: '#0B0B10',
  /** Raised surface on obsidian — cards, topbar, wells. */
  surface: '#15161D',
  /** The mark's purple. Primary action colour. */
  primary: '#7C68F2',
  /** The mark's sand. Secondary action colour, used sparingly. */
  sand: '#E7C27A',
  /** Secondary text on dark. */
  muted: '#A1A1AA',
  /** Text/ink on light ground. */
  ink: '#0F1115',
} as const;

/**
 * Gradient stops sampled from the approved artwork. The mark is not flat
 * `primary` — it carries a slight vertical shift, and the sand hugs the
 * underside of the wave rather than filling the lower panel evenly.
 */
export const markGradient = {
  purpleFrom: '#8A63F5',
  purpleTo: '#7350E8',
  sandFrom: '#F0CE86',
  sandTo: '#E7C27A',
  /** Where sand hands over to purple, below each panel's own wave crossing. */
  blend: '#8266E2',
} as const;

export type BrandColor = keyof typeof brand;
