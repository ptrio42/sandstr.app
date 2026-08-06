import React from 'react';
import type { MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { Nip05Check } from '../components/NoteCard';

interface Props {
  currentUser: MockUser | null;
  users: MockUser[];
  onOpenDrawer: () => void;
  onViewProfile: (u: MockUser) => void;
}

const PREVIEWS = [
  'gm! did you see the new relay spec?', 'sent you 2100 sats ⚡', 'lets ship it 🚀', 'thanks for the zap 🙏',
  'wen nostr takeover', 'that note blew up haha', 'check your DMs on the other relay', 'coffee this week?',
];

// Damus DMs (encrypted messages). NIP-04/NIP-17 chats; here a simple conversation list.
export const DMScreen: React.FC<Props> = ({ currentUser, users, onOpenDrawer, onViewProfile }) => {
  const me = currentUser?.username || 'sandy';
  const convos = users.slice(3, 13);

  return (
    <div className="min-h-full bg-[var(--damus-bg)]" data-tour="damus-dms">
      <header className="damus-topbar">
        <div className="flex items-center gap-3 px-4 pt-2 pb-2">
          <button onClick={onOpenDrawer}><Avatar seed={me} className="w-9 h-9" /></button>
          <div className="flex-1 text-center font-bold text-[17px] text-[var(--damus-text)]">DMs</div>
          <span className="text-[14px] text-[var(--damus-text-secondary)] w-9 text-right">7/13</span>
        </div>
        <div className="h-px bg-[var(--damus-separator)]" />
      </header>

      <div>
        {convos.map((u, i) => (
          <button
            key={u.pubkey}
            onClick={() => onViewProfile(u)}
            className="w-full flex items-center gap-3 px-4 py-3 border-b border-[var(--damus-separator)] text-left"
          >
            <Avatar seed={u.username} className="w-12 h-12" zap={!!u.lightningAddress} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[var(--damus-text)] truncate">{u.displayName}</span>
                {u.nip05 && <Nip05Check />}
                <span className="ml-auto text-[13px] text-[var(--damus-text-secondary)] shrink-0">{i + 1}h</span>
              </div>
              <div className="text-[15px] text-[var(--damus-text-secondary)] truncate">{PREVIEWS[i % PREVIEWS.length]}</div>
            </div>
          </button>
        ))}
        <div className="h-24" />
      </div>
    </div>
  );
};

export default DMScreen;
