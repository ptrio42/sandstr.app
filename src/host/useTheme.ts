import { useEffect, useState } from 'react';

/**
 * The host's dark-mode switch. Simulators observe the `dark` class on <html>
 * through useParentTheme, so this is the single source of truth for all ten.
 *
 * Shared between Layout's header toggle and ClientView's mobile bar: on a phone
 * the client view hides the global header (the sim is full-bleed), so without
 * a second mount point the toggle would be unreachable on that route.
 */
export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  // Two toggles can be mounted at once (header on desktop, bar on mobile) and a
  // resize can swap which one is showing, so re-sync from the DOM rather than
  // trusting a stale local copy.
  useEffect(() => {
    const el = document.documentElement;
    const mo = new MutationObserver(() => setDark(el.classList.contains('dark')));
    mo.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('sandstr-theme', next ? 'dark' : 'light');
    setDark(next);
  };

  return { dark, toggle };
}

export default useTheme;
