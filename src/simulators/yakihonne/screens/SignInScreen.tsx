import React, { useMemo, useState } from 'react';
import { ChevronLeftIcon, KeyIcon, CopyIcon } from '../components/icons';
import {
  looksLikeRealSecretKey,
  REAL_KEY_REFUSED,
  DEMO_KEY_PLACEHOLDER,
  SECRET_INPUT_PROPS,
} from '../../shared/utils/keySafety';

interface Props {
  onBack: () => void;
  onLogin: () => void;
}

/**
 * YakiHonne "Log in" (`logify_view/signin_view.dart`).
 *
 * Reference: docs/refs/yakihonne/screen-map.md §Login / onboarding, verified
 * against the 2026-08-05 recording (shots/onboarding/t_035.jpg = Keys,
 * t_038.jpg = Remote signer).
 *
 * Signature: the two sign-in methods are not tabs at the top but a pair of
 * cards pinned to the BOTTOM of the screen, and the selected one is marked by a
 * 1.5px orange border only — the fill stays surface grey.
 *
 * Keys tab: oversized left-aligned "Hey, Welcome Back" (the only place in the
 * app that types this large), one key field, a full-width orange
 * "Paste your key" button, then the storage reassurance.
 *
 * The key field runs through shared/utils/keySafety.ts: it shows the real
 * affordance but never asks for a real nsec, and refuses one if pasted.
 * (Real placeholder is "npub, nsec or hex".)
 */
export const SignInScreen: React.FC<Props> = ({ onBack, onLogin }) => {
  const [method, setMethod] = useState<'keys' | 'signer'>('keys');
  const [key, setKey] = useState('');
  const [keyWarning, setKeyWarning] = useState(false);
  const [bunker, setBunker] = useState('');
  const [copied, setCopied] = useState(false);

  // Refuse real secret keys: drop from state, don't hold. See keySafety.ts.
  const onKeyChange = (value: string) => {
    if (looksLikeRealSecretKey(value)) {
      setKey('');
      setKeyWarning(true);
      return;
    }
    setKeyWarning(false);
    setKey(value);
  };

  const nostrconnect = 'nostrconnect://0bbc9b765d6bf7ebaa42…';

  return (
    <div className="absolute inset-0 z-[65] flex flex-col bg-[var(--yh-bg)]">
      <div className="flex items-center px-4 pt-5 pb-3 shrink-0">
        <button type="button" onClick={onBack} aria-label="Back" className="w-9 h-9 -ml-2 flex items-center">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center text-[19px] font-bold pr-7">Log in</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5">
        {method === 'keys' ? (
          <>
            <h2 className="mt-4 text-[30px] font-extrabold leading-[1.15] tracking-[-0.5px]">
              Hey,
              <br />
              Welcome
              <br />
              Back
            </h2>

            <div className="mt-9 flex items-center gap-2.5 rounded-[12px] bg-[var(--yh-surface-2)] px-3.5 h-[52px]">
              <KeyIcon className="w-5 h-5 text-[var(--yh-text)] shrink-0" />
              <input
                {...SECRET_INPUT_PROPS}
                value={key}
                onChange={(e) => onKeyChange(e.target.value)}
                placeholder={DEMO_KEY_PLACEHOLDER}
                className="flex-1 min-w-0 bg-transparent text-[15px] text-[var(--yh-text)] placeholder:text-[var(--yh-text-2)] focus:outline-none"
              />
            </div>

            {keyWarning && (
              <p className="mt-2 text-[12px] leading-snug text-[var(--yh-red)]">{REAL_KEY_REFUSED}</p>
            )}

            <button
              type="button"
              onClick={onLogin}
              className="yakihonne-btn-orange mt-2.5 w-full py-3 text-[16px] rounded-[10px]"
            >
              {key.trim() ? 'Login' : 'Paste your key'}
            </button>

            <p className="mt-3.5 text-center text-[12.5px] leading-[1.5] text-[var(--yh-text-2)]">
              Your keys are stored securely on your device and never shared with us or anyone else.
            </p>
          </>
        ) : (
          <>
            <h2 className="mt-4 text-center text-[17px] font-bold">Remote signer</h2>
            <p className="mt-1 text-center text-[14px] text-[var(--yh-text-2)]">
              Use the below URL to connect to your bunker
            </p>

            <QrBlock value={nostrconnect} />

            <div className="mt-3 flex items-center gap-2 rounded-[10px] border border-dashed border-[var(--yh-border-strong)] px-3.5 py-3">
              <span className="flex-1 min-w-0 truncate text-[14px] text-[var(--yh-text)]">{nostrconnect}</span>
              <button
                type="button"
                aria-label="Copy connection URL"
                onClick={() => {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1400);
                }}
                className="shrink-0 text-[var(--yh-text-2)]"
              >
                <CopyIcon className="w-[18px] h-[18px]" />
              </button>
            </div>

            <p className="my-2.5 text-center text-[15px] text-[var(--yh-text-2)]">{copied ? 'Copied' : 'Or'}</p>

            <input
              value={bunker}
              onChange={(e) => setBunker(e.target.value)}
              placeholder="bunker://.."
              autoComplete="off"
              spellCheck={false}
              className="w-full h-[52px] rounded-[12px] bg-[var(--yh-surface-2)] px-3.5 text-[15px] text-[var(--yh-text)] placeholder:text-[var(--yh-text-2)] focus:outline-none"
            />

            <button
              type="button"
              onClick={onLogin}
              className="yakihonne-btn-orange mt-2.5 w-full py-3 text-[16px] rounded-[10px]"
            >
              Login
            </button>
          </>
        )}
      </div>

      <div className="flex items-stretch gap-2.5 px-5 pt-3 pb-6 shrink-0">
        <MethodCard active={method === 'keys'} label="Keys" onClick={() => setMethod('keys')}>
          <KeyIcon className="w-[18px] h-[18px]" />
        </MethodCard>
        <MethodCard active={method === 'signer'} label="Remote signer" onClick={() => setMethod('signer')}>
          <ShareIcon />
        </MethodCard>
      </div>
    </div>
  );
};

/** Selected = 1.5px orange border. The fill never changes. */
const MethodCard = ({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`flex-1 flex flex-col items-center justify-center gap-1.5 rounded-[12px] bg-[var(--yh-surface-2)] py-3.5 text-[14px] text-[var(--yh-text)] ${
      active ? 'border-[1.5px] border-[var(--yh-orange)]' : 'border-[1.5px] border-transparent'
    }`}
  >
    {children}
    {label}
  </button>
);

/** `share-global.svg` — the iOS-style share/upload box used for Remote signer. */
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path d="M12 3v12" strokeLinecap="round" />
    <path d="M8.5 6.5L12 3l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 11H4.5v9.5h15V11H18" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * The nostrconnect QR. Deterministic (FNV-1a over the URL) rather than a real
 * encoder — there is nothing to scan in a simulation — and rendered as ONE svg
 * path so a 45×45 grid costs a single DOM node. White-on-black, matching the
 * app's dark-mode QR in the recording (which is dense enough to read as a real
 * nostrconnect payload).
 */
const QrBlock = ({ value }: { value: string }) => {
  const path = useMemo(() => {
    const N = 45;
    let h = 2166136261;
    for (let i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const isFinder = (x: number, y: number) =>
      (x < 7 && y < 7) || (x > N - 8 && y < 7) || (x < 7 && y > N - 8);
    let d = '';
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (isFinder(x, y)) continue;
        h ^= (x * 73856093) ^ (y * 19349663);
        h = Math.imul(h, 16777619) >>> 0;
        if ((h >>> 13) & 1) d += `M${x + 0.1} ${y + 0.1}h0.8v0.8h-0.8z`;
      }
    }
    // finder rings: 7×7 outline + 3×3 centre, drawn at all three corners
    for (const [ox, oy] of [
      [0, 0],
      [N - 7, 0],
      [0, N - 7],
    ]) {
      d += `M${ox} ${oy}h7v7h-7zM${ox + 1} ${oy + 1}v5h5v-5z`;
      d += `M${ox + 2} ${oy + 2}h3v3h-3z`;
    }
    return d;
  }, [value]);

  return (
    <div className="mt-3.5 rounded-[10px] border-2 border-[var(--yh-text)] bg-black p-2">
      <svg viewBox="0 0 45 45" className="w-full h-auto block" fill="var(--yh-text)" role="img" aria-label="QR code">
        <path d={path} fillRule="evenodd" />
      </svg>
    </div>
  );
};

export default SignInScreen;
