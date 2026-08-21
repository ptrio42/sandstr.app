import type { ReactNode } from 'react';
import { X } from 'lucide-react';

/**
 * The two dismissible prompts at the top of Home (`HomePromptSection`,
 * ui/home/HomeScreen.kt:846-806). Not a card at all despite how it reads on a
 * screenshot: no fill, no border — a tinted 20dp icon, a semibold titleMedium,
 * a close button on the right, then the body copy and a filled 8dp-corner
 * button, all on the page background.
 *
 * Copy is verbatim from strings.xml:62-69.
 */
export function NoticeCard({
  icon,
  title,
  body,
  cta,
  onCta,
  onDismiss,
  dismissLabel,
  tourId,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  cta: string;
  onCta: () => void;
  onDismiss: () => void;
  dismissLabel: string;
  tourId?: string;
}) {
  return (
    <section className="flex flex-col gap-4 pb-4" data-tour={tourId}>
      <div className="flex items-center gap-2 pl-5 pr-2">
        <span className="flex h-5 w-5 items-center justify-center" style={{ color: 'var(--boris-primary)' }}>
          {icon}
        </span>
        <h2 className="flex-1 text-[16px] font-semibold" style={{ color: 'var(--boris-on-bg)' }}>
          {title}
        </h2>
        <button
          type="button"
          aria-label={dismissLabel}
          title={dismissLabel}
          onClick={onDismiss}
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{ color: 'var(--boris-on-surface-variant)' }}
        >
          <X size={24} />
        </button>
      </div>
      <div className="flex flex-col gap-3 px-5">
        <p className="text-[14px] leading-[1.43]" style={{ color: 'var(--boris-on-surface-variant)' }}>
          {body}
        </p>
        <div>
          <button
            type="button"
            onClick={onCta}
            className="rounded-lg px-6 py-2.5 text-[14px] font-medium"
            style={{ background: 'var(--boris-primary)', color: 'var(--boris-on-primary)' }}
          >
            {cta}
          </button>
        </div>
      </div>
    </section>
  );
}
