import React, { useState } from 'react';
import { OverlayHeader } from '../components/OverlayHeader';

const ITEMS: { title: string; desc: string; on: boolean }[] = [
  { title: 'Push notifications', desc: 'Get instant alerts on your device. Privacy-focused using secure FCM and APNS protocols', on: true },
  { title: 'Max mentions', desc: 'Hide notifications from notes with more than 10 user mentions.', on: true },
  { title: 'Following', desc: 'Get notified when people you follow post new content.', on: true },
  { title: 'Mentions / Replies', desc: 'Get alerted when someone mentions you or replies to your posts.', on: true },
  { title: 'Reactions', desc: 'Get notified when some likes or react to your posts.', on: true },
  { title: 'Reposts', desc: 'Get alerted when someone shares or reposts your content.', on: true },
  { title: 'Zaps', desc: 'Get notified when you receive Bitcoin tips (zaps) on your posts.', on: true },
  { title: 'Private messages', desc: 'Get alerted for new direct messages and private conversations.', on: true },
];

export const NotificationSettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [state, setState] = useState(ITEMS.map((i) => i.on));

  return (
    <div className="absolute inset-0 z-[59] bg-[var(--yh-bg)] flex flex-col">
      <OverlayHeader title="Notifications" onBack={onBack} logo />
      <div className="flex-1 overflow-y-auto px-5">
        <p className="text-[16px] text-[var(--yh-text-2)] pt-1 pb-3">
          Manage how you get notified about mentions, replies, zaps, reactions, and other Nostr events.
        </p>
        {ITEMS.map((it, i) => (
          <div key={it.title} className="flex items-start gap-4 py-4 border-t border-[var(--yh-divider)]">
            <div className="flex-1">
              <div className="text-[18px] font-bold">{it.title}</div>
              <div className="text-[15px] text-[var(--yh-text-2)] mt-1 leading-snug">{it.desc}</div>
            </div>
            <button
              aria-label={`Toggle ${it.title}`}
              onClick={() => setState((s) => s.map((v, j) => (j === i ? !v : v)))}
              className={`yakihonne-toggle mt-1 ${state[i] ? 'on' : ''}`}
            />
          </div>
        ))}
        <div className="h-16" />
      </div>
    </div>
  );
};

export default NotificationSettingsScreen;
