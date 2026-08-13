import React from 'react';
import { Radio } from 'lucide-react';
import { AppTopBar } from '../components/AppTopBar';
import { AmethystLogo } from '../components/AmethystLogo';
import '../amethyst.theme.css';

interface DiscoverScreenProps {
  onOpenDrawer?: () => void;
}

// Discover (upstream `NavBarItem.DISCOVER`, icon MaterialSymbols.Sensors) lost
// its bottom-bar slot in v1.13.1 — the globe there is the Browser now — but it
// is still a destination in the drawer's "Navigate" section, so the tab stays.
// The reference recording never opens it, so rather than inventing a layout the
// screen states that honestly, in Amethyst's own visual language.
export function DiscoverScreen({ onOpenDrawer }: DiscoverScreenProps) {
  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]">
      <AppTopBar onOpenDrawer={onOpenDrawer} center={<AmethystLogo className="w-8 h-8" />} />

      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-10 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[var(--md-surface-variant)]">
          <Radio className="w-8 h-8 text-[var(--md-primary)]" />
        </div>
        <div>
          <p className="font-medium text-[var(--md-on-surface)]">Discover</p>
          <p className="text-sm text-[var(--md-on-surface-variant)] mt-1 leading-relaxed">
            This part of the simulation isn't ready yet — coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
