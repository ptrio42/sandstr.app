import React from 'react';
import { YakiMark } from '../components/YakiLogo';
import { Avatar } from '../components/Avatar';
import { HeartIcon, CommentIcon, RepostIcon, ZapIcon } from '../components/icons';

interface Props {
  onLogin: () => void;
}

// YakiHonne onboarding landing. Purple→magenta hero framing the OLED-black home feed,
// orange primary CTA — the app-icon/logo is purple, the in-app accent is orange.
export const LoginScreen: React.FC<Props> = ({ onLogin }) => (
  <div className="absolute inset-0 z-[65] flex flex-col bg-[var(--yh-bg)] px-7 pt-14 pb-9" data-tour="yakihonne-keys">
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <YakiMark className="w-14 h-16" color="var(--yh-text)" />
      <h1 className="text-[30px] font-extrabold mt-4">YakiHonne</h1>
      <p className="text-[16px] text-[var(--yh-text-2)] mt-1.5">Your all in one nostr client</p>

      {/* hero — glassy frame around a mini home feed */}
      <div className="mt-8 w-[210px] rounded-[26px] p-2.5" style={{ background: 'linear-gradient(160deg,#7a117e,#b026c9)' }}>
        <div className="rounded-[20px] bg-[var(--yh-bg)] p-3 text-left">
          <div className="flex items-center gap-2">
            <Avatar seed="maria2000" className="w-7 h-7" />
            <div className="text-[12px] font-bold">Maria2000</div>
          </div>
          <div className="text-[12px] mt-1.5 leading-snug">Lunch time! Its hard to beat ribeye steak 🤤</div>
          <div className="mt-2 h-16 rounded-lg" style={{ background: 'linear-gradient(135deg,#3a2b1e,#6b4a2f)' }} />
          <div className="flex items-center gap-4 mt-2 text-[var(--yh-text-2)]">
            <HeartIcon className="w-4 h-4" /><CommentIcon className="w-4 h-4" /><RepostIcon className="w-4 h-4" /><ZapIcon className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>

    <div className="w-full space-y-3">
      <button onClick={onLogin} className="yakihonne-btn-orange w-full py-3.5 text-[17px]">Login</button>
      <button onClick={onLogin} className="w-full py-3.5 rounded-xl border border-[var(--yh-border-strong)] text-[17px] font-semibold">Create account</button>
      <p className="text-[12px] text-[var(--yh-text-2)] text-center pt-1">
        By continuing you agree to our <span className="text-[var(--yh-orange)]">EULA</span>
      </p>
      <button onClick={onLogin} className="w-full text-[15px] text-[var(--yh-text-2)] font-medium pt-1">Continue as guest</button>
      <p className="text-[11px] text-[var(--yh-text-3)] text-center">Simulation · mock keys · not the real network</p>
    </div>
  </div>
);

export default LoginScreen;
