import React from 'react';
import { PrimalLogo } from '../components/PrimalLogo';
import {
  looksLikeRealSecretKey,
  REAL_KEY_REFUSED,
  DEMO_KEY_PLACEHOLDER,
  SECRET_INPUT_PROPS,
} from '../../../shared/utils/keySafety';

export function LoginScreen({ onLogin, theme }: { onLogin: () => void; theme: 'light' | 'dark' }) {
  const [key, setKey] = React.useState('');
  const [keyWarning, setKeyWarning] = React.useState(false);
  // Refuse real secret keys: drop from state, don't hold. See keySafety.ts.
  const onKeyChange = (value: string) => {
    if (looksLikeRealSecretKey(value)) {
      setKey('');
      setKeyWarning(true);
      return;
    }
    setKeyWarning(false);
    setKey(value);
  };
  return (
    <div className={`primal-web primal-login ${theme}`} data-theme={theme}>
      <div style={{ transform: 'scale(1.6)', marginBottom: 18 }}>
        <PrimalLogo size={44} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, textAlign: 'center' }}>The most advanced Nostr client</div>
      <div className="primal-muted" style={{ textAlign: 'center', maxWidth: 360 }}>
        No email, no password — just your Nostr keys. This is a simulation: use the demo account, never a real key.
      </div>

      <div style={{ width: 340, maxWidth: '90%' }} data-tour="primal-keys">
        <div className="primal-search" style={{ borderRadius: 12, padding: '12px 16px' }}>
          <input
            {...SECRET_INPUT_PROPS}
            value={key}
            onChange={(e) => onKeyChange(e.target.value)}
            placeholder={DEMO_KEY_PLACEHOLDER}
            style={{ fontFamily: 'monospace' }}
          />
        </div>
        {keyWarning && (
          <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.4, color: '#F59E0B' }}>
            {REAL_KEY_REFUSED}
          </div>
        )}
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
