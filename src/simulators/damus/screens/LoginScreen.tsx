import React, { useState } from 'react';
import type { MockUser } from '../../../data/mock';
import { getRandomUsers } from '../../../data/mock';
import { DamusLogo } from '../components/DamusLogo';
import { CopyIcon } from '../components/icons';

interface Props {
  onLogin: (user: MockUser) => void;
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [view, setView] = useState<'home' | 'create'>('home');
  const nsec = 'nsec1' + 'q7x9c2vk8m4n6p0'.repeat(1).slice(0, 52);

  const signIn = () => onLogin(getRandomUsers(1)[0]);

  return (
    <div className="absolute inset-0 z-[65] flex flex-col items-center justify-between bg-[var(--damus-bg)] px-7 pt-16 pb-10" data-tour="damus-login">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div style={{ filter: 'drop-shadow(0 0 3px rgba(204,67,197,0.7))' }}>
          <DamusLogo className="w-16 h-16" />
        </div>
        <h1
          className="text-[32px] font-extrabold mt-5 tracking-tight text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(90deg, #30B3F1 0%, #C539F9 100%)' }}
        >
          Welcome to Damus
        </h1>
        <p className="text-[17px] text-[var(--damus-text-secondary)] mt-2">The social network you control</p>

        {view === 'create' && (
          <div className="w-full mt-8 text-left">
            <div className="text-[13px] font-semibold uppercase tracking-wide text-[var(--damus-text-secondary)] mb-1">Your secret key (nsec)</div>
            <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-[var(--damus-bg-secondary)]">
              <code className="flex-1 text-[13px] text-[var(--damus-text)] break-all font-mono">{nsec}</code>
              <CopyIcon className="w-5 h-5 text-[var(--damus-purple)] shrink-0" />
            </div>
            <p className="text-[13px] text-[var(--damus-danger)] mt-2">⚠️ This is your password. Save it — it can never be recovered.</p>
          </div>
        )}
      </div>

      {/* The tour's "Your Keys Are Your Identity" step points here rather than at
          the whole screen: this band is the only thing on it a visitor acts on. */}
      <div data-tour="damus-auth-actions" className="w-full space-y-3">
        {view === 'home' ? (
          <>
            <button onClick={() => setView('create')} className="damus-btn damus-btn-gradient w-full py-3.5 text-[17px]">
              Create Account
            </button>
            <button onClick={signIn} className="damus-btn damus-btn-gradient w-full py-3.5 text-[17px]">
              Sign In
            </button>
            <p className="text-[13px] text-[var(--damus-text-secondary)] text-center pt-1">
              By continuing, you agree to our <span className="text-[var(--damus-purple)]">EULA</span>
            </p>
          </>
        ) : (
          <>
            {/* No `data-tour="damus-post"` here. That anchor belongs to the
                composer's Post button (ComposeScreen.tsx:31); a duplicate on the
                login screen meant the "Publish Your Note" step could spotlight
                "Let's go" instead — and since the tour now resolves a selector
                list in document order within each alternative, whichever mounts
                first wins. One anchor, one element. */}
            <button onClick={signIn} className="damus-btn damus-btn-gradient w-full py-3.5 text-[17px]">
              Let's go
            </button>
            <button onClick={() => setView('home')} className="damus-btn damus-btn-pill w-full py-3.5 text-[17px]">
              Back
            </button>
          </>
        )}
        <p className="text-[12px] text-[var(--damus-text-tertiary)] text-center pt-1">Simulation · mock keys · not the real network</p>
      </div>
    </div>
  );
};

export default LoginScreen;
