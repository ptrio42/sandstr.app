import React from 'react';
import { ChevronRight } from 'lucide-react';
import { settingsMenu, appVersion } from '../data';

export function SettingsScreen() {
  const [active, setActive] = React.useState('Appearance');
  return (
    <div className="primal-settings-screen" data-tour="primal-settings">
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
        <button className="primal-newnote" style={{ marginTop: 0, width: 'auto', padding: '11px 26px' }}>Logout</button>
        <div className="primal-muted">Version <span style={{ fontWeight: 800, color: 'var(--primal-text)' }}>{appVersion}</span></div>
      </div>
    </div>
  );
}

export default SettingsScreen;
