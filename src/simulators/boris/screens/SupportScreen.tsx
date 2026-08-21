import { ArrowLeft, Heart } from 'lucide-react';
import { BorisAvatar } from '../components/Avatar';
import { IconButton } from '../components/TopBar';
import { HIGHLIGHTERS } from '../borisData';
import { mockUsers } from '../../../data/mock';

/**
 * Support Boris (ui/support/SupportScreen.kt) — reached from the orange heart
 * in the Home top bar and from About → Support Boris.
 *
 * Two tiers, "Legends" and "Supporters" (strings.xml:123-124), an orange heart,
 * and a footer that is deliberately explicit about what does and does not show
 * up: only public zaps (strings.xml:130). The totals line is
 * "Total supporters: N • Total zaps: N" (strings.xml:128).
 *
 * Amounts here are invented, like everything else in this reproduction — a real
 * zap total would be a claim about somebody's actual receipts.
 */
export function SupportScreen({ onBack }: { onBack: () => void }) {
  const legends = HIGHLIGHTERS;
  const supporters = mockUsers.slice(3, 15);

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ background: 'var(--boris-bg)' }}>
      <div className="flex h-16 shrink-0 items-center pl-1">
        <IconButton label="Back" onClick={onBack}>
          <ArrowLeft size={24} />
        </IconButton>
        <span className="text-[16px] font-medium" style={{ color: 'var(--boris-on-bg)' }}>
          Support Boris
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <div className="flex flex-col items-center gap-3 py-6">
          <Heart size={56} fill="var(--boris-mark-friends)" color="var(--boris-mark-friends)" />
          <h2 className="boris-display text-[26px]" style={{ color: 'var(--boris-on-bg)' }}>
            Thank You!
          </h2>
          <p className="text-center text-[15px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
            Your <span style={{ color: 'var(--boris-primary)' }}>zaps</span> help keep this project alive.
          </p>
        </div>

        <h3 className="pb-2 pt-2 text-[14px] font-semibold" style={{ color: 'var(--boris-on-surface-variant)' }}>
          Legends
        </h3>
        <div className="space-y-2">
          {legends.map((u, i) => (
            <div key={u.pubkey} className="flex items-center gap-3">
              <BorisAvatar seed={u.pubkey} className="h-10 w-10" />
              <span className="min-w-0 flex-1 truncate text-[15px]" style={{ color: 'var(--boris-on-bg)' }}>
                {u.displayName}
              </span>
              <span className="text-[13px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
                {[210_000, 121_000, 84_000][i] ?? 21_000} sats
              </span>
            </div>
          ))}
        </div>

        <h3 className="pb-2 pt-6 text-[14px] font-semibold" style={{ color: 'var(--boris-on-surface-variant)' }}>
          Supporters
        </h3>
        <div className="flex flex-wrap gap-2">
          {supporters.map((u) => (
            <BorisAvatar key={u.pubkey} seed={u.pubkey} className="h-10 w-10" />
          ))}
        </div>

        <p className="pt-6 text-[13px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
          Total supporters: {legends.length + supporters.length} • Total zaps: 418
        </p>
        <p className="pt-3 text-[13px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
          Zap <span style={{ color: 'var(--boris-primary)' }}>Boris</span> a{' '}
          <span style={{ color: 'var(--boris-primary)' }}>meaningful amount of sats</span> and your name will
          show above.
        </p>
        <p className="pt-2 text-[12px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
          Only public zaps appear here.
        </p>
      </div>
    </div>
  );
}
