import { useState } from 'react';
import { cn } from '../utils/cn';
import type { ClientEntry } from '../registry';

export function platformLabel(platform: ClientEntry['platform']): string {
  if (platform === 'ios') return 'iOS';
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

/**
 * A client's icon, rendered as one coherent set across the mixed png/svg/ico
 * assets. Falls back to the client's emoji, then to a brand-tinted monogram if
 * the image 404s or the format won't paint (e.g. .ico at small sizes).
 */
export function ClientGlyph({ client, className }: { client: ClientEntry; className?: string }) {
  const [broken, setBroken] = useState(false);
  const showImg = client.icon && !broken;

  return (
    <span
      className={cn('flex items-center justify-center overflow-hidden rounded-[9px] select-none', className)}
      style={showImg ? undefined : { backgroundColor: `${client.primaryColor}1f`, color: client.primaryColor }}
    >
      {showImg ? (
        <img
          src={client.icon}
          alt=""
          aria-hidden
          draggable={false}
          onError={() => setBroken(true)}
          className="h-full w-full object-contain"
        />
      ) : client.emoji ? (
        <span className="text-[1.1em] leading-none">{client.emoji}</span>
      ) : (
        <span className="text-[0.72em] font-bold leading-none">{client.name.charAt(0)}</span>
      )}
    </span>
  );
}
