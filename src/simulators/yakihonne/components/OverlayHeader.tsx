import React from 'react';
import { ChevronLeftIcon } from './icons';
import { YakiMark } from './YakiLogo';

interface Props {
  title?: string;
  subtitle?: string;
  onBack: () => void;
  logo?: boolean;         // trailing YakiHonne mark (Article / Notifications headers)
  right?: React.ReactNode; // custom trailing element
}

// Shared pushed-page header: back chevron · centered title (+ optional subtitle) · trailing mark.
export const OverlayHeader: React.FC<Props> = ({ title, subtitle, onBack, logo, right }) => (
  <header className="relative flex items-center justify-between px-3 pt-3 pb-2.5">
    <button onClick={onBack} aria-label="Back" className="w-10 h-10 flex items-center justify-center text-[var(--yh-text)]">
      <ChevronLeftIcon className="w-6 h-6" />
    </button>
    <div className="absolute left-1/2 -translate-x-1/2 text-center">
      {title && <div className="text-[18px] font-bold text-[var(--yh-text)] leading-tight">{title}</div>}
      {subtitle && <div className="text-[13px] text-[var(--yh-text-2)]">{subtitle}</div>}
    </div>
    <div className="w-10 h-10 flex items-center justify-center">
      {right ?? (logo ? <YakiMark className="w-6 h-7" color="var(--yh-text)" /> : null)}
    </div>
  </header>
);

export default OverlayHeader;
