import React from 'react';
import { YakiMark } from '../components/YakiLogo';
import { Avatar } from '../components/Avatar';
import { ChevronRightIcon, HeartIcon, CommentIcon, RepostIcon, ZapIcon, SearchIcon } from '../components/icons';

interface Props {
  /** "Log in" → the Keys / Remote signer screen. */
  onSignIn: () => void;
  /** "Create account" → the 5-step wizard. */
  onSignUp: () => void;
  /** "Continue as a guest ›" → straight into the read-only feed. */
  onGuest: () => void;
}

/**
 * YakiHonne onboarding landing (`logify_view/onboarding_option_view.dart`).
 *
 * Reference: docs/refs/yakihonne/screen-map.md §Login / onboarding, verified
 * against the 2026-08-05 recording (shots/onboarding/t_033.jpg).
 *
 * Order, verbatim: white logo mark → "Enjoy the experience of owning your own
 * data!" → hero illustration → filled orange "Log in" → orange-OUTLINED "Create
 * account" → "By continuing you agree with our" + orange "End User Licence
 * Agreement (EULA)" → "Continue as a guest ›".
 *
 * The hero is a photo of an iPhone running the app; reproduced here as a
 * composed mini-feed inside a phone frame so nothing is fetched.
 */
export const LoginScreen: React.FC<Props> = ({ onSignIn, onSignUp, onGuest }) => (
  <div
    className="absolute inset-0 z-[65] flex flex-col bg-[var(--yh-bg)] px-6 pt-12 pb-8 overflow-y-auto"
    data-tour="yakihonne-keys"
  >
    <YakiMark className="w-[7.5%] min-w-[26px] h-auto mx-auto shrink-0" color="var(--yh-text)" />

    <p className="mt-5 text-center text-[17px] leading-[1.35] text-[var(--yh-text)] shrink-0">
      Enjoy the experience of owning
      <br />
      your own data!
    </p>

    <HeroIllustration />

    {/* The tour's sign-in step points here, not at the whole landing: this
        block is Log in / Create account / EULA / Continue as a guest. */}
    <div data-tour="yakihonne-login-actions" className="shrink-0">
      <button type="button" onClick={onSignIn} className="yakihonne-btn-orange w-full py-3 text-[16px] rounded-[10px]">
        Log in
      </button>

      <button
        type="button"
        onClick={onSignUp}
        className="mt-3 w-full py-3 text-[16px] font-medium rounded-[10px] border border-[var(--yh-orange)] text-[var(--yh-orange)]"
      >
        Create account
      </button>

      <p className="mt-4 text-center text-[12px] leading-[1.5] text-[var(--yh-text)]">
        By continuing you agree with our
        <br />
        <span className="font-bold text-[var(--yh-orange)]">End User Licence Agreement (EULA)</span>
      </p>

      <button
        type="button"
        onClick={onGuest}
        className="mt-4 w-full flex items-center justify-center gap-2 text-[15px] text-[var(--yh-text)]"
      >
        Continue as a guest
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  </div>
);

/**
 * The `initial_onboarding.png` hero: a phone, angled on a dark plinth, showing
 * the OLED-black home feed. Rebuilt from primitives — no image request.
 */
const HeroIllustration = () => (
  // Height-driven and clipped: the card is `aspect-square` off `h-full`, so on a
  // short frame (the mobile gate, where there is no phone bezel) it scales down
  // instead of spilling out of its flex box and overlapping the tagline above
  // and the buttons below.
  <div className="flex-1 min-h-0 flex items-center justify-center py-5 overflow-hidden">
    <div className="h-full max-h-[300px] aspect-square max-w-full rounded-[18px] bg-[#161617] p-[7%] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]">
      <div className="h-full mx-auto w-[68%] rounded-[14px] border-[3px] border-[#2b2c33] bg-black overflow-hidden">
        {/* app bar */}
        <div className="flex items-center gap-1.5 px-1.5 pt-2 pb-1">
          <YakiMark className="w-[7px] h-[11px]" color="var(--yh-text)" />
          <div className="flex-1 flex items-center gap-1 rounded-full bg-[#1b1b1d] px-1.5 py-[3px]">
            <SearchIcon className="w-[7px] h-[7px] text-[var(--yh-text-3)]" />
            <span className="text-[5px] text-[var(--yh-text-3)]">Search…</span>
          </div>
          <div className="w-[11px] h-[11px] rounded-full bg-[var(--yh-purple)]" />
        </div>

        {/* category chips */}
        <div className="flex items-center gap-1 px-1.5 pb-1">
          <span className="rounded-[3px] bg-[#1b1b1d] px-1 py-[1px] text-[5px] text-[var(--yh-text)]">Highlights</span>
          {['Art', 'Writing', 'Freedom', 'Books'].map((c) => (
            <span key={c} className="text-[5px] text-[var(--yh-text-2)]">
              {c}
            </span>
          ))}
        </div>

        {/* two media cards */}
        <div className="flex gap-1 px-1.5">
          {[
            'linear-gradient(140deg,#2b3f8f,#7a2f5a)',
            'linear-gradient(140deg,#1f5f6d,#123043)',
          ].map((bg, i) => (
            <div key={i} className="flex-1 rounded-[3px] overflow-hidden bg-[#141416]">
              <div className="h-7" style={{ background: bg }} />
              <div className="p-1 space-y-[2px]">
                <div className="h-[2px] w-[85%] rounded-full bg-white/25" />
                <div className="h-[2px] w-[60%] rounded-full bg-white/15" />
                <div className="text-[4px] text-[var(--yh-orange)]">3m read</div>
              </div>
            </div>
          ))}
        </div>

        {/* two notes */}
        <div className="mt-1 px-1.5 space-y-1.5 pb-1">
          {[
            { seed: 'signalsage', name: 'Signal Sage', w: ['92%', '78%', '64%'] },
            { seed: 'wrenwebb', name: 'wren', w: ['70%', '48%'] },
            { seed: 'zenzapper', name: 'ZEN', w: ['84%', '56%'] },
          ].map((n) => (
            <div key={n.seed} className="flex items-start gap-1">
              <Avatar seed={n.seed} className="w-[9px] h-[9px]" rounded="rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="text-[5px] font-bold text-[var(--yh-text)]">{n.name}</div>
                <div className="mt-[2px] space-y-[2px]">
                  {n.w.map((w, i) => (
                    <div key={i} className="h-[2px] rounded-full bg-white/20" style={{ width: w }} />
                  ))}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[var(--yh-text-3)]">
                  <CommentIcon className="w-[5px] h-[5px]" />
                  <HeartIcon className="w-[5px] h-[5px]" />
                  <RepostIcon className="w-[5px] h-[5px]" />
                  <ZapIcon className="w-[5px] h-[5px]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAB + bottom nav */}
        <div className="relative">
          <div className="absolute -top-3 right-1.5 w-[13px] h-[13px] rounded-full bg-[var(--yh-orange)]" />
          <div className="flex items-center justify-around border-t border-white/10 px-1.5 py-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-[6px] h-[6px] rounded-[1px] ${i === 0 ? 'bg-white/70' : 'bg-white/25'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default LoginScreen;
