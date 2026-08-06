import React from 'react';
import { ChevronRight } from 'lucide-react';
import { settingsMenu, appVersion } from '../data';

export function SettingsScreen({ onLogout }: { onLogout?: () => void }) {
  const [active, setActive] = React.useState('Appearance');
  return (
    // Unique anchor (gaps pri-03): `primal-settings` stays on the NAV row only.
    <div className="primal-settings-screen" data-tour="primal-settings-screen">
      <div className="primal-pagehead">
        <div className="primal-pagetitle">settings</div>
      </div>
      <div>
        {settingsMenu.map((row) => (
          <div key={row} className={`primal-setrow${active === row ? ' active' : ''}`} onClick={() => setActive(row)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {row}
            <ChevronRight size={20} className="primal-muted" />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
        <button
          className="primal-newnote"
          style={{ marginTop: 0, width: 'auto', padding: '11px 26px' }}
          data-tour="primal-logout"
          onClick={onLogout}
        >
          Logout
        </button>
        <div className="primal-muted">Version <span style={{ fontWeight: 800, color: 'var(--primal-text)' }}>{appVersion}</span></div>
      </div>
    </div>
  );
}

export default SettingsScreen;
