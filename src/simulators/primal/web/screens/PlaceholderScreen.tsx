import React from 'react';
import { Download, BadgeCheck } from 'lucide-react';

export function PlaceholderScreen({ kind }: { kind: 'downloads' | 'premium' }) {
  const isPremium = kind === 'premium';
  return (
    <div>
      <div className="primal-pagehead">
        <div className="primal-pagetitle">{isPremium ? 'premium' : 'downloads'}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, padding: '64px 24px' }}>
        <div style={{ color: 'var(--primal-accent)' }}>
          {isPremium ? <BadgeCheck size={56} /> : <Download size={56} />}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>
          {isPremium ? 'Primal Premium' : 'Get the Primal apps'}
        </div>
        <div className="primal-muted" style={{ maxWidth: 380 }}>
          {isPremium
            ? 'A verified Nostr name, a Bitcoin Lightning wallet, and advanced tools — all in one subscription.'
            : 'Primal is available on iOS, Android, and the web. Take your Nostr feed everywhere.'}
        </div>
        <button className="primal-newnote" style={{ marginTop: 8, width: 'auto', padding: '11px 26px' }}>
          {isPremium ? 'Subscribe' : 'Download'}
        </button>
      </div>
    </div>
  );
}

export default PlaceholderScreen;
