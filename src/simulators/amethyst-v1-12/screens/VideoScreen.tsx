import React from 'react';
import { SquarePlay } from 'lucide-react';
import { AppTopBar } from '../components/AppTopBar';
import '../amethyst-v1-12.theme.css';

interface VideoScreenProps {
  onOpenDrawer?: () => void;
}

// Shorts (vertical video feed) exists in the real app, but we have no reference
// shots for it yet — rather than showing an invented layout (the old screen had
// a made-up "Amethyst Video" wordmark and hotlinked picsum thumbnails), the tab
// stays tappable and shows an honest in-sim placeholder in Amethyst's own
// visual language until it can be rebuilt faithfully.
export function VideoScreen({ onOpenDrawer }: VideoScreenProps) {
  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]">
      <AppTopBar
        onOpenDrawer={onOpenDrawer}
        center={<img src="/icons/amethyst-v1-12.png" alt="Amethyst" className="w-8 h-8 object-contain" />}
      />

      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-10 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[var(--md-surface-variant)]">
          <SquarePlay className="w-8 h-8 text-[var(--md-primary)]" />
        </div>
        <div>
          <p className="font-medium text-[var(--md-on-surface)]">Shorts</p>
          <p className="text-sm text-[var(--md-on-surface-variant)] mt-1 leading-relaxed">
            This part of the simulation isn't ready yet — coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
