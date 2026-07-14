import React from 'react';
import { PrimalLogo } from '../components/PrimalLogo';

export function LoginScreen({ onLogin, theme }: { onLogin: () => void; theme: 'light' | 'dark' }) {
  const [key, setKey] = React.useState('');
  return (
    <div className={`primal-web primal-login ${theme}`} data-theme={theme}>
      <div style={{ transform: 'scale(1.6)', marginBottom: 18 }}>
        <PrimalLogo size={44} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, textAlign: 'center' }}>The most advanced Nostr client</div>
      <div className="primal-muted" style={{ textAlign: 'center', maxWidth: 360 }}>
        No email, no password — just your Nostr keys. Paste your <code>nsec</code> or create a new account.
      </div>

      <div style={{ width: 340, maxWidth: '90%' }} data-tour="primal-keys">
        <div className="primal-search" style={{ borderRadius: 12, padding: '12px 16px' }}>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="nsec1…"
            style={{ fontFamily: 'monospace' }}
          />
        </div>
        <button
          className="primal-newnote"
          style={{ marginTop: 12, width: '100%' }}
          onClick={onLogin}
        >
          Sign in
        </button>
        <button
          className="primal-btn-pill primal-btn-cancel"
          style={{ marginTop: 10, width: '100%' }}
          onClick={onLogin}
        >
          Create a new account
        </button>
      </div>
    </div>
  );
}

export default LoginScreen;
