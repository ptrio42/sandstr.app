/**
 * Local preferences — the ONLY host-owned persistent state.
 *
 * This used to be a 350-line "progress tracking service" inherited from the
 * nostrich.love guide: it minted a permanent crypto.randomUUID() device ID and
 * defaulted { trackingEnabled: true, dataRetention: 'forever' } directly under
 * a comment claiming "all opt-in, disabled by default". None of that machinery
 * had a consumer here (the tour engine only ever read `toursEnabled`), so it
 * is gone rather than gated: sandstr has NO tracking, no device ID, no
 * analytics — there is nothing to opt out of. See PRIVACY.md.
 *
 * What localStorage actually holds (all local, never transmitted):
 *   sandstr-theme        — explicit light/dark choice (useTheme.ts)
 *   sandstr-preferences  — this file (tour enablement)
 *   nostr-tour-<id>      — per-tour completed/skipped state (tourStorage.ts)
 */

const PREFERENCES_KEY = 'sandstr-preferences';

// Keys written by the pre-extraction guide code; cleared on sight so no stale
// device ID lingers from earlier builds.
const LEGACY_KEYS = ['nostrich-gamification-v1', 'nostrich-device-id', 'nostrich-privacy-settings'];

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export interface PrivacySettings {
  /** master switch for the guided tours (read by tourStorage.shouldAutoStartTour) */
  toursEnabled: boolean;
}

const defaults: PrivacySettings = {
  toursEnabled: true,
};

export function getPrivacySettings(): PrivacySettings {
  if (!isBrowser) return defaults;
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) return { ...defaults, ...JSON.parse(stored) };
  } catch (e) {
    console.error('Error reading preferences:', e);
  }
  return defaults;
}

export function updatePrivacySettings(settings: Partial<PrivacySettings>): void {
  if (!isBrowser) return;
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ ...getPrivacySettings(), ...settings }));
}

/** Remove every trace of sandstr from this browser (PRIVACY.md's "delete everything"). */
export function deleteAllLocalData(): void {
  if (!isBrowser) return;
  const mine = Object.keys(localStorage).filter(
    (k) => k.startsWith('sandstr-') || k.startsWith('nostr-tour-') || LEGACY_KEYS.includes(k),
  );
  mine.forEach((k) => localStorage.removeItem(k));
}

// One-time hygiene: drop the legacy guide keys (incl. the old device ID).
if (isBrowser) {
  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
}
