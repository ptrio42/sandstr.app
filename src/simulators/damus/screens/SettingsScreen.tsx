import React, { useState } from 'react';
import type { MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { ChevronLeft, ChevronRight } from '../components/icons';

interface Props {
  currentUser: MockUser | null;
  onBack: () => void;
  onLogout: () => void;
  onOpenRelays: () => void;
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return <button className={`damus-toggle ${on ? 'active' : ''}`} onClick={onClick}><span className="damus-toggle-thumb" /></button>;
}

export const SettingsScreen: React.FC<Props> = ({ currentUser, onBack, onLogout, onOpenRelays }) => {
  const [devMode, setDevMode] = useState(false);
  const [leftHand, setLeftHand] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);

  // `tour` is opt-in per group: the tour's settings step needs to point at ONE
  // group (Account) rather than the whole scrolling screen.
  const Group = ({ title, children, tour }: { title: string; children: React.ReactNode; tour?: string }) => (
    <div data-tour={tour} className="mt-6">
      <div className="px-4 pb-1 text-[13px] font-semibold uppercase tracking-wide text-[var(--damus-text-secondary)]">{title}</div>
      <div className="mx-4 rounded-2xl overflow-hidden bg-[var(--damus-bg-secondary)]">{children}</div>
    </div>
  );
  // `control` is for a trailing element that is itself a button (a Toggle): such a
  // row renders as a <div>, because a <button> inside a <button> is invalid HTML
  // and swallows the control's own click. Plain rows stay real buttons.
  const rowClass = 'w-full flex items-center justify-between px-4 py-3.5 border-b border-[var(--damus-separator)] last:border-0 text-left';
  const Row = ({ label, right, control, onClick, danger }: { label: string; right?: React.ReactNode; control?: React.ReactNode; onClick?: () => void; danger?: boolean }) => {
    const text = <span className={`text-[17px] ${danger ? 'text-[var(--damus-danger)]' : 'text-[var(--damus-text)]'}`}>{label}</span>;
    if (control) {
      return (
        <div className={rowClass}>
          {text}
          {control}
        </div>
      );
    }
    return (
      <button onClick={onClick} className={rowClass}>
        {text}
        {right ?? <ChevronRight className="w-4 h-4 text-[var(--damus-text-tertiary)]" />}
      </button>
    );
  };

  return (
    <div className="absolute inset-0 z-[52] flex flex-col bg-[var(--damus-bg)]" data-tour="damus-settings">
      <header className="flex items-center px-4 pt-3 pb-2 border-b border-[var(--damus-separator)]">
        <button onClick={onBack} className="w-8"><ChevronLeft className="w-6 h-6 text-[var(--damus-text)]" /></button>
        <span className="flex-1 text-center font-bold text-[17px] text-[var(--damus-text)]">Settings</span>
        <span className="w-8" />
      </header>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="flex items-center gap-3 px-4 py-4">
          <Avatar seed={currentUser?.username || 'sandy'} className="w-14 h-14" />
          <div>
            <div className="font-bold text-[18px] text-[var(--damus-text)]">{currentUser?.displayName || 'sandy'}</div>
            <div className="text-[14px] text-[var(--damus-text-secondary)]">@{currentUser?.username || 'sandy'}</div>
          </div>
        </div>

        <Group title="Account" tour="damus-settings-account">
          <Row label="Keys" />
          <Row label="Relays" onClick={onOpenRelays} />
          <Row label="Wallet & Payments" />
        </Group>

        <Group title="Appearance & filters">
          <Row label="Appearance" right={<span className="text-[15px] text-[var(--damus-text-secondary)]">Dark ›</span>} />
          <Row label="Auto-translate notes" control={<Toggle on={autoTranslate} onClick={() => setAutoTranslate((v) => !v)} />} />
          <Row label="Left-handed" control={<Toggle on={leftHand} onClick={() => setLeftHand((v) => !v)} />} />
          <Row label="Muted words & users" />
        </Group>

        <Group title="Advanced">
          <Row label="Developer mode" control={<Toggle on={devMode} onClick={() => setDevMode((v) => !v)} />} />
          <Row label="First aid" />
        </Group>

        <Group title="">
          <Row label="Sign out" danger onClick={onLogout} right={<span />} />
        </Group>

        <div className="text-center text-[13px] text-[var(--damus-text-tertiary)] mt-6">Damus · simulation</div>
      </div>
    </div>
  );
};

export default SettingsScreen;
