import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import ClientSwitcher from './ClientSwitcher';
import SandstrLogo from './brand/SandstrLogo';

function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('sandstr-theme', next ? 'dark' : 'light');
  };
  return { dark, toggle };
}

export default function Layout() {
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-brand-obsidian dark:text-gray-100">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-brand-obsidian/80">
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

      <footer className="border-t border-gray-200 py-8 text-center text-xs text-gray-400 dark:border-gray-800">
        Sandstr — interactive simulations for learning. Not affiliated with any client. Mock data only.
      </footer>

      {/* Persistent in-place client switcher — only paints on /c/:id. */}
      <ClientSwitcher />
    </div>
  );
}
