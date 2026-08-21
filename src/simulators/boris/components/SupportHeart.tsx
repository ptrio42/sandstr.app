import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { BorisAvatar } from './Avatar';
import type { MockUser } from '../../../data/mock';

/**
 * The Home/Library/Search/You top bar's left group (ui/support/SupportHeart.kt).
 *
 * This is the surface most likely to be reproduced wrong from a screenshot: the
 * round picture beside the heart LOOKS like a sign-in button and is not one. It
 * is a supporter's profile picture, cycled from recent zap receipts every 21
 * seconds with a 1.4s crossfade (SupportAvatars.kt:12, SupportHeart.kt:35), and
 * tapping it opens THAT person's profile — which is exactly what it does in the
 * reference recording at 03:08→03:12. The heart itself opens Support Boris and
 * is tinted `HighlightFriends` #F97316, not the app's indigo.
 */
export function SupportHeart({
  supporters,
  onOpenSupport,
  onOpenProfile,
}: {
  supporters: MockUser[];
  onOpenSupport: () => void;
  onOpenProfile: (user: MockUser) => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (supporters.length < 2) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % supporters.length), 21_000);
    return () => window.clearInterval(t);
  }, [supporters.length]);

  const current = supporters[Math.min(index, supporters.length - 1)];

  return (
    <div className="flex items-center" data-tour="boris-support">
      <button
        type="button"
        aria-label="Support Boris"
        title="Support Boris"
        onClick={onOpenSupport}
        className="flex h-12 w-12 items-center justify-center rounded-full"
      >
        <Heart size={24} fill="var(--boris-mark-friends)" color="var(--boris-mark-friends)" />
      </button>
      {current && (
        <button
          type="button"
          aria-label={`Featured supporter ${current.displayName}`}
          title={`Featured supporter ${current.displayName}`}
          onClick={() => onOpenProfile(current)}
          className="mr-2"
          data-tour="boris-supporter"
        >
          <BorisAvatar seed={current.pubkey} className="h-8 w-8" />
        </button>
      )}
    </div>
  );
}
