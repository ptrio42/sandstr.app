import { Link, Outlet, useMatch } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import ClientSwitcher from './ClientSwitcher';
import SandstrLogo from './brand/SandstrLogo';
import { useTheme } from './useTheme';
import { cn } from '../utils/cn';

export default function Layout() {
  const { dark, toggle } = useTheme();
  // A client view is an application surface, not a document: one viewport tall,
  // never scrolling, with the simulator sized off the leftover row. The gallery
  // keeps the ordinary scrolling-document treatment.
  const onClient = !!useMatch('/c/:id');

  return (
    <div
      className={cn(
        'bg-gray-50 text-gray-900 dark:bg-brand-obsidian dark:text-gray-100',
        onClient ? 'sandstr-shell flex flex-col overflow-hidden' : 'min-h-screen',
      )}
    >
      <header
        className={cn(
          'z-40 shrink-0 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-brand-obsidian/80',
          // Nothing scrolls on /c/:id, so `sticky` there bought nothing but a
          // z-40 lid that buried the top 128px of the phone at max scroll.
          !onClient && 'sticky top-0',
          onClient && 'max-sm:hidden',
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3" aria-label="Sandstr — home">
            <SandstrLogo size={26} />
            <span className="hidden text-xs text-gray-400 sm:inline">
              try Nostr, no keys, no install
            </span>
          </Link>
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="rounded-lg border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <Outlet />

      {/* Not on /c/:id. It cost 81px there and was never seen (it sat ~121px
          below the fold at 1440×800), and its text is a strict subset of the
          Disclaimer that ClientView keeps permanently on screen — so dropping it
          here strengthens rather than weakens the CLAUDE.md mitigation. */}
      {!onClient && (
        <footer className="border-t border-gray-200 py-8 text-center text-xs text-gray-400 dark:border-gray-800">
          Sandstr — interactive simulations for learning. Not affiliated with any client. Mock data only.
        </footer>
      )}

      {/* Persistent in-place client switcher — only paints on /c/:id. */}
      <ClientSwitcher />
    </div>
  );
}
