import { useEffect, useState } from 'react';

/**
 * Shared by ClientSwitcher (dock vs bottom sheet) and ClientView (full-bleed sim
 * vs framed device, and the desktop-client gate). Kept in one place so the two
 * never disagree about where the mobile breakpoint is — they render interlocking
 * chrome and a mismatch shows up as a floating pill over a full-bleed simulator.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    // Re-read on both the MQL change and a plain resize: the latter covers
    // environments that don't fire MQL change reliably and the layout-not-yet
    // settled race where innerWidth briefly reads 0 on first paint.
    const on = () => setMatches(window.matchMedia(query).matches);
    on();
    mql.addEventListener('change', on);
    window.addEventListener('resize', on);
    return () => {
      mql.removeEventListener('change', on);
      window.removeEventListener('resize', on);
    };
  }, [query]);
  return matches;
}

/** The one breakpoint the host chrome agrees on (Tailwind's `sm`). */
export const MOBILE_QUERY = '(max-width: 639px)';

export default useMediaQuery;
