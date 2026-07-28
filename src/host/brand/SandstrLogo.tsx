import SandstrMark from './SandstrMark';
import SandstrWordmark from './SandstrWordmark';

export type SandstrLogoProps = {
  /** Height of the mark in px; the wordmark is sized from it. */
  size?: number;
  tone?: 'brand' | 'mono';
  /** Hide the wordmark and render the mark alone. */
  markOnly?: boolean;
  className?: string;
};

/**
 * Mark + wordmark lockup.
 *
 * Both halves are vector geometry — see SandstrWordmark.tsx for why the wordmark
 * is drawn rather than typeset. The wordmark's x-height is set to 0.55 of the
 * mark's height, which is the relationship on the brand sheet.
 */
export default function SandstrLogo({
  size = 28,
  tone = 'brand',
  markOnly = false,
  className,
}: SandstrLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <SandstrMark size={size} tone={tone} title={markOnly ? 'Sandstr' : undefined} />
      {!markOnly && <SandstrWordmark height={Math.round(size * 0.55)} />}
      {!markOnly && <span className="sr-only">Sandstr</span>}
    </span>
  );
}
