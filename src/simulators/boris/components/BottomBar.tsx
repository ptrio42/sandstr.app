import { Search } from 'lucide-react';
import type { BorisTab } from '../types';
import { AccountCircleGlyph, DynamicFeedGlyph, HomeGlyph, MenuBookGlyph } from './BorisIcons';

/**
 * Bottom navigation — a stock Material 3 `NavigationBar`
 * (ui/shell/BorisBottomBar.kt:26-31) with `containerColor = surface` and
 * `tonalElevation = 0.dp`. In this colour scheme `surface` IS `background`
 * (ui/theme/Theme.kt:73-75), so the bar does not step away from the page.
 *
 * Two details that are easy to get wrong and instantly legible:
 *  - The selected item wears M3's own indicator PILL, not a tint. Boris never
 *    overrides `secondaryContainer`, so the pill is the framework's dark
 *    baseline #4A4458 — measured off the reference recording at t=52s, not
 *    assumed. An indigo pill would have been the wrong pixel.
 *  - Labels are always visible, on every tab, selected or not.
 *
 * Tab order and the filled/outlined icon pairs come from MainTab.kt:19-53.
 */

interface BottomBarProps {
  activeTab: BorisTab;
  onTabChange: (tab: BorisTab) => void;
}

const TABS: { id: BorisTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'library', label: 'Library' },
  { id: 'feeds', label: 'Feeds' },
  { id: 'search', label: 'Search' },
  { id: 'you', label: 'You' },
];

function TabGlyph({ id, active }: { id: BorisTab; active: boolean }) {
  switch (id) {
    case 'home':
      return <HomeGlyph filled={active} />;
    case 'library':
      return <MenuBookGlyph filled={active} />;
    case 'feeds':
      // No filled/outlined pair: in the reference recording the two states are
      // the same shape to within a pixel of antialiasing, so selection here is
      // the pill and the colour alone. See DynamicFeedGlyph for the measurement.
      return <DynamicFeedGlyph />;
    case 'search':
      return <Search size={24} strokeWidth={active ? 2.5 : 2} />;
    case 'you':
      return <AccountCircleGlyph filled={active} />;
  }
}

export function BottomBar({ activeTab, onTabChange }: BottomBarProps) {
  return (
    <nav
      className="shrink-0"
      style={{ background: 'var(--boris-bg)' }}
      data-tour="boris-tabs"
      aria-label="Main"
    >
      <div className="flex h-20 items-start justify-around gap-0.5 px-1 pt-3">
        {TABS.map(({ id, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? 'page' : undefined}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
              onClick={() => onTabChange(id)}
              data-tour={`boris-tab-${id}`}
            >
              <span
                className="flex h-8 w-full max-w-16 items-center justify-center rounded-full transition-colors"
                style={{
                  background: active ? 'var(--boris-secondary-container)' : 'transparent',
                  color: active
                    ? 'var(--boris-on-secondary-container)'
                    : 'var(--boris-on-surface-variant)',
                }}
              >
                <TabGlyph id={id} active={active} />
              </span>
              <span
                className="text-[12px] leading-none"
                style={{
                  color: active ? 'var(--boris-on-bg)' : 'var(--boris-on-surface-variant)',
                  fontWeight: active ? 600 : 500,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
