import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import {
  DEMO_KEY_PLACEHOLDER,
  REAL_KEY_REFUSED,
  SECRET_INPUT_PROPS,
  looksLikeRealSecretKey,
} from '../../shared/utils/keySafety';

/**
 * Onboarding — Nostur/Onboarding/WelcomeSheet.swift +
 * Nostur/Accounts/AddExistingAccountSheet.swift, on `wowBackground()`
 * (Nostur/Utils/View+wowBackground.swift): a linear gradient #2BF5EB
 * (bottom-trailing) → #267A40 (top-leading), clipped RoundedRectangle(20).
 * That gradient is the only brand gradient in the whole app.
 *
 * REPO-ONLY SURFACE: the recording opens already signed in, so this screen is
 * built from source alone and is listed as such in screen-map.md §18.
 *
 * The key field goes through shared/utils/keySafety.ts: it never asks for a
 * real nsec and it carries no custody reassurance.
 */
export function WelcomeScreen({ onLogin }: { onLogin: () => void }) {
  const [step, setStep] = useState<'welcome' | 'existing'>('welcome');
  const [key, setKey] = useState('');
  const [refused, setRefused] = useState(false);

  if (step === 'existing') {
    return (
      <div className="nostur-wow flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 items-center px-3 py-2" style={{ minHeight: 44 }}>
          <button
            type="button"
            onClick={() => setStep('welcome')}
            className="flex items-center text-[17px] text-white"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            Back
          </button>
        </div>
        <div className="nostur-scroll flex flex-col items-center px-6">
          <h1 className="mt-4 text-[26px] font-bold">Add existing account</h1>
          <div className="mt-6 w-full max-w-[300px]">
            <input
              {...SECRET_INPUT_PROPS}
              value={key}
              onChange={(e) => {
                const v = e.target.value;
                if (looksLikeRealSecretKey(v)) {
                  setKey('');
                  setRefused(true);
                  return;
                }
                setRefused(false);
                setKey(v);
              }}
              placeholder={DEMO_KEY_PLACEHOLDER}
              aria-label="Account key"
              className="w-full rounded-xl px-4 py-3 text-[15px] text-black outline-none"
              style={{ background: 'rgba(255,255,255,0.92)' }}
            />
            {refused && (
              <p className="mt-2 rounded-lg bg-black/35 p-2 text-[12px] leading-snug text-white">
                {REAL_KEY_REFUSED}
              </p>
            )}
            <button
              type="button"
              onClick={onLogin}
              className="mt-4 w-full rounded-full py-3 text-[16px] font-bold text-white"
              style={{ background: 'rgba(0,0,0,0.65)' }}
            >
              Add
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="mt-3 w-full rounded-full py-3 text-[16px] text-white"
              style={{ background: 'rgba(0,0,0,0.1)' }}
            >
              Skip and try as guest first
            </button>
            <p className="mt-5 text-[13px] leading-relaxed text-white/70">
              Note: You can also add someone elses public key to try out Nostur from their
              perspective.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nostur-wow flex h-full min-h-0 flex-col items-center justify-center px-6 text-center">
      <h1 className="text-[34px] leading-tight">
        Welcome to <strong>Nostur</strong>
      </h1>
      <p className="mt-1 text-[16px]">See what&apos;s happening on nostr right now</p>

      <div className="mt-8 w-full max-w-[300px] space-y-3">
        <button
          type="button"
          onClick={onLogin}
          className="w-full rounded-full py-3 text-[17px] font-bold text-white"
          style={{ background: 'rgba(0,0,0,0.65)' }}
          data-tour="nostur-create-account"
        >
          Create new account
        </button>
        <button
          type="button"
          onClick={() => setStep('existing')}
          className="w-full rounded-full py-3 text-[17px] text-white"
          style={{ background: 'rgba(0,0,0,0.1)' }}
        >
          Use existing account
        </button>
        <button
          type="button"
          onClick={onLogin}
          className="w-full rounded-full py-3 text-[17px] text-white"
          style={{ background: 'rgba(0,0,0,0.1)' }}
        >
          Try guest account
        </button>
      </div>

      <div className="mt-8 text-[15px] opacity-60">
        <p>By continuing you agree to the</p>
        <p className="underline">Terms and Conditions</p>
      </div>
    </div>
  );
}

export default WelcomeScreen;
