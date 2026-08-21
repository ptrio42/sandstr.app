import { Key, Shield } from 'lucide-react';

/**
 * The sign-in pair (ui/auth/AuthBar.kt:88-110) plus the nstart footer
 * (AuthBar.kt:270-290). "Amber" is the filled button and hands off to the
 * NIP-55 external signer app; "Bunker" is the outlined one and takes a
 * `bunker://…` NIP-46 URI. Both shapes are 8dp.
 *
 * Nothing here signs anything: sandstr never touches real keys, so tapping
 * either button signs the visitor in as a mock account — the same contract
 * every other reproduction here works under.
 */
export function AuthBar({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex w-full max-w-[320px] flex-col gap-3">
      <button
        type="button"
        onClick={onLogin}
        data-tour="boris-login-amber"
        className="flex h-[52px] items-center justify-center gap-2 rounded-lg text-[16px] font-medium"
        style={{ background: 'var(--boris-primary)', color: 'var(--boris-on-primary)' }}
      >
        <Key size={18} />
        Amber
      </button>
      <button
        type="button"
        onClick={onLogin}
        data-tour="boris-login-bunker"
        className="flex h-[52px] items-center justify-center gap-2 rounded-lg text-[16px] font-medium"
        style={{
          border: '1px solid var(--boris-outline)',
          background: 'var(--boris-surface-variant)',
          color: 'var(--boris-on-bg)',
        }}
      >
        <Shield size={18} />
        Bunker
      </button>
      <p className="pt-1 text-center text-[12px]" style={{ color: 'var(--boris-on-surface-variant)' }}>
        New to nostr? Start here:{' '}
        <span style={{ color: 'var(--boris-primary)' }}>nstart.me</span>
      </p>
    </div>
  );
}
