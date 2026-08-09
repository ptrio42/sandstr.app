import React from 'react';
import { Avatar } from '../components/Avatar';
import { OverlayHeader } from '../components/OverlayHeader';
import { YakiTile } from '../components/YakiLogo';
import {
  KeyIcon, WalletIcon, BellIcon, TranslateIcon, TrashIcon, ChevronRightIcon, ZapIcon, ComposeDmIcon,
} from '../components/icons';

type IconC = React.FC<{ className?: string }>;

const ServerIcon: IconC = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><rect x="4" y="4" width="16" height="6" rx="2" /><rect x="4" y="14" width="16" height="6" rx="2" /><path d="M8 7h.01M8 17h.01" /></svg>
);
const ModIcon: IconC = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M6 4h9l4 4v12H6z" /><path d="M9 12l2 2 4-4" /></svg>
);
const WandIcon: IconC = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M6 18 16 8M14 6l1.5-1.5M18 10l1.5-1.5M9 4l.6 1.4L11 6l-1.4.6L9 8l-.6-1.4L7 6l1.4-.6z" /></svg>
);
const BrushIcon: IconC = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M4 15l9-9 5 5-9 9H6a2 2 0 0 1-2-2z" /><path d="M13 6l3-3 5 5-3 3" /></svg>
);
const DeviceIcon: IconC = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><rect x="6" y="3" width="12" height="18" rx="2.5" /><path d="M11 18h2" /></svg>
);
const TrophyIcon: IconC = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M7 4h10v4a5 5 0 0 1-10 0z" /><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 15h6M10 20h4M12 15v5" /></svg>
);
const GithubIcon: IconC = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z" /></svg>
);

type NavDest = 'profile' | 'relays' | 'wallet' | 'notifications' | 'dashboard';

// `tour` is opt-in per row: the tour's settings step needs to point at ONE row
// (Wallets) rather than the whole list, and the rows are generated from data.
interface Row { label: string; Icon: IconC; dest?: NavDest; trailing?: React.ReactNode; tour?: string }

interface Props {
  currentUserSeed: string;
  onBack: () => void;
  onNav: (d: NavDest) => void;
  onToast: (m: string) => void;
}

export const SettingsScreen: React.FC<Props> = ({ currentUserSeed, onBack, onNav, onToast }) => {
  const rows: Row[] = [
    { label: 'Keys', Icon: KeyIcon },
    { label: 'Relay settings 10 / 10', Icon: ServerIcon, dest: 'relays' },
    { label: 'Content moderation', Icon: ModIcon },
    { label: 'Wallets', Icon: WalletIcon, dest: 'wallet', tour: 'yakihonne-settings-wallets' },
    { label: 'Customization', Icon: WandIcon },
    { label: 'Notifications', Icon: BellIcon, dest: 'notifications' },
    { label: 'Language preferences', Icon: TranslateIcon },
    { label: 'Appearance', Icon: BrushIcon },
    { label: 'Crashlytics & cache', Icon: DeviceIcon },
    { label: 'Yaki chest', Icon: TrophyIcon, dest: 'dashboard', trailing: <span className="text-[13px] font-semibold text-[var(--yh-orange)] px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--yh-orange)_15%,transparent)]">Connect</span> },
  ];

  return (
    <div className="absolute inset-0 z-[58] bg-[var(--yh-bg)] flex flex-col" data-tour="yakihonne-settings">
      <OverlayHeader title="Settings" onBack={onBack} logo />

      <div className="flex-1 overflow-y-auto">
        {/* profile section */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar seed={currentUserSeed} className="w-12 h-12" />
          <div className="flex-1" />
          <button onClick={() => onNav('profile')} className="yakihonne-btn-orange px-5 py-2.5 text-[15px]">View profile</button>
        </div>

        {rows.map((r) => (
          <button
            key={r.label}
            data-tour={r.tour}
            onClick={() => (r.dest ? onNav(r.dest) : onToast(r.label))}
            className="w-full flex items-center gap-4 px-5 py-4 border-b border-[var(--yh-divider)] text-left"
          >
            <r.Icon className="w-6 h-6 text-[var(--yh-text)]" />
            <span className="flex-1 text-[17px] font-medium">{r.label}</span>
            {r.trailing}
          </button>
        ))}

        {/* delete account */}
        <div className="px-4 py-5">
          <button onClick={() => onToast('Delete account')} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[#DD2222] text-[#FF4A4A] font-semibold">
            <TrashIcon className="w-5 h-5" /> Delete account
          </button>
        </div>

        {/* version footer */}
        <div className="px-6 pb-10 flex flex-col items-center text-center">
          <button className="flex items-center gap-2.5">
            <YakiTile className="w-9 h-9" />
            <span className="text-left leading-tight">
              <span className="block text-[13px] text-[var(--yh-text-2)]">YakiHonne</span>
              <span className="block text-[17px] font-extrabold">v1.9.8+179</span>
            </span>
            <ChevronRightIcon className="w-5 h-5 text-[var(--yh-orange)]" />
          </button>
          <p className="text-[13px] text-[var(--yh-text-2)] mt-4 leading-relaxed">
            We strive to make the best out of Nostr, Support us below or send us your valuable feed: zap, dms, github.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button onClick={() => onToast('Zap YakiHonne')} className="w-11 h-11 rounded-full bg-[var(--yh-surface-2)] flex items-center justify-center text-[var(--yh-orange)]"><ZapIcon filled className="w-5 h-5" /></button>
            <button onClick={() => onToast('Email us')} className="w-11 h-11 rounded-full bg-[var(--yh-surface-2)] flex items-center justify-center"><ComposeDmIcon className="w-5 h-5" /></button>
            <button onClick={() => onToast('GitHub')} className="w-11 h-11 rounded-full bg-[var(--yh-surface-2)] flex items-center justify-center"><GithubIcon className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
