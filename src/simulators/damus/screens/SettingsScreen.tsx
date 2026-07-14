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

  const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mt-6">
      <div className="px-4 pb-1 text-[13px] font-semibold uppercase tracking-wide text-[var(--damus-text-secondary)]">{title}</div>
      <div className="mx-4 rounded-2xl overflow-hidden bg-[var(--damus-bg-secondary)]">{children}</div>
    </div>
  );
  const Row = ({ label, right, onClick, danger }: { label: string; right?: React.ReactNode; onClick?: () => void; danger?: boolean }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-[var(--damus-separator)] last:border-0 text-left">
      <span className={`text-[17px] ${danger ? 'text-[var(--damus-danger)]' : 'text-[var(--damus-text)]'}`}>{label}</span>
      {right ?? <ChevronRight className="w-4 h-4 text-[var(--damus-text-tertiary)]" />}
    </button>
  );

  return (
    <div className="absolute inset-0 z-[52] flex flex-col bg-[var(--damus-bg)]" data-tour="damus-settings">
      <header className="flex items-center px-4 pt-3 pb-2 border-b border-[var(--damus-separator)]">
        <button onClick={onBack} className="w-8"><ChevronLeft className="w-6 h-6 text-[var(--damus-text)]" /></button>
        <span className="flex-1 text-center font-bold text-[17px] text-[var(--damus-text)]">Settings</span>
        <span className="w-8" />
      </header>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="flex items-center gap-3 px-4 py-4">
          <Avatar seed={currentUser?.username || 'pitiunited'} className="w-14 h-14" />
          <div>
            <div className="font-bold text-[18px] text-[var(--damus-text)]">{currentUser?.displayName || 'pitiunited'}</div>
            <div className="text-[14px] text-[var(--damus-text-secondary)]">@{currentUser?.username || 'pitiunited'}</div>
          </div>
        </div>

        <Group title="Account">
          <Row label="Keys" />
          <Row label="Relays" onClick={onOpenRelays} />
          <Row label="Wallet & Payments" />
        </Group>

        <Group title="Appearance & filters">
          <Row label="Appearance" right={<span className="text-[15px] text-[var(--damus-text-secondary)]">Dark ›</span>} />
          <Row label="Auto-translate notes" right={<Toggle on={autoTranslate} onClick={() => setAutoTranslate((v) => !v)} />} />
          <Row label="Left-handed" right={<Toggle on={leftHand} onClick={() => setLeftHand((v) => !v)} />} />
          <Row label="Muted words & users" />
        </Group>

        <Group title="Advanced">
          <Row label="Developer mode" right={<Toggle on={devMode} onClick={() => setDevMode((v) => !v)} />} />
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
