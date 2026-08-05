import React, { useState } from 'react';
import { ArrowUp, Info, Settings, SquarePen, X } from 'lucide-react';
import type { MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { EmptyState, FollowPill, NavBar, ScreenTitle, Segmented, TabButton } from '../components/Chrome';
import { mockUsers } from '../../../data/mock';

/**
 * Screens/MainTabs/DMs/. Tabs "Accepted | Requests", a teal "Upgrade your DMs"
 * pill that opens the NIP-17 explainer, and the empty state
 * "You have not received any messages". Own bubbles are solid accent, right
 * aligned; the composer's send button is a teal circle with an arrow.up.
 */
export function MessagesScreen({ onOpenProfile }: { onOpenProfile: (u: MockUser) => void }) {
  const [tab, setTab] = useState<'Accepted' | 'Requests'>('Accepted');
  const [upgrade, setUpgrade] = useState(false);
  const [newConvo, setNewConvo] = useState(false);
  const [openWith, setOpenWith] = useState<MockUser | null>(null);
  const [sent, setSent] = useState<string[]>([]);
  const [draft, setDraft] = useState('');

  if (openWith) {
    return (
      <>
        <NavBar
          back={{ label: 'Messages', onClick: () => setOpenWith(null) }}
          title={`To: ${openWith.displayName}`}
          trailing={<Info className="h-5 w-5" style={{ color: 'var(--nostur-accent)' }} />}
        />
        <div className="nostur-scroll px-4">
          <div className="flex flex-col items-center gap-2 py-6">
            <Avatar seed={openWith.pubkey} size={92} />
            <p className="text-[22px] font-bold">{openWith.displayName}</p>
            <p className="text-[14px]" style={{ color: 'var(--nostur-secondary)' }}>
              {openWith.pubkey.slice(0, 11)}…
            </p>
            <p className="text-[13px]" style={{ color: 'var(--nostur-secondary)' }}>
              Last seen: 20m ago
            </p>
            <FollowPill following={false} onClick={() => onOpenProfile(openWith)} />
            <p className="text-[13px]" style={{ color: 'var(--nostur-secondary)' }}>
              Followed by 0 others you follow
            </p>
          </div>

          <p className="py-2 text-center text-[13px]" style={{ color: 'var(--nostur-secondary)' }}>
            Wed, 5 Aug
          </p>

          {sent.map((m, i) => (
            <div key={i} className="mb-2 flex justify-end">
              <div
                className="max-w-[75%] rounded-2xl px-3 py-2 text-[16px]"
                style={{ background: 'var(--nostur-accent)', color: 'var(--nostur-on-accent)' }}
              >
                {m}
              </div>
            </div>
          ))}
        </div>
        <div
          className="flex shrink-0 items-center gap-2 px-3 py-2"
          style={{ borderTop: '1px solid var(--nostur-separator)' }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your message..."
            aria-label="Message"
            className="min-w-0 flex-1 bg-transparent text-[16px] outline-none"
            style={{ color: 'var(--nostur-primary)' }}
          />
          <button
            type="button"
            aria-label="Send"
            onClick={() => {
              if (!draft.trim()) return;
              setSent((s) => [...s, draft.trim()]);
              setDraft('');
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'var(--nostur-accent)', color: 'var(--nostur-on-accent)' }}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex shrink-0 items-center px-4 py-2">
        <span className="flex-1" />
        <ScreenTitle>Messages</ScreenTitle>
        <span className="flex flex-1 justify-end gap-3">
          <button type="button" aria-label="New conversation" onClick={() => setNewConvo(true)}>
            <SquarePen className="h-[22px] w-[22px]" style={{ color: 'var(--nostur-accent)' }} />
          </button>
          <Settings className="h-[22px] w-[22px]" style={{ color: 'var(--nostur-accent)' }} />
        </span>
      </div>

      <div className="nostur-tabrow" role="tablist" aria-label="Message folders">
        {(['Accepted', 'Requests'] as const).map((t) => (
          <TabButton key={t} label={t} selected={tab === t} onClick={() => setTab(t)} />
        ))}
      </div>

      <div className="nostur-scroll" data-tour="nostur-messages">
        <div className="flex justify-center py-2">
          <button
            type="button"
            onClick={() => setUpgrade(true)}
            className="rounded-full px-3 py-1 text-[12px]"
            style={{ background: 'var(--nostur-accent)', color: 'var(--nostur-on-accent)' }}
          >
            Upgrade your DMs
          </button>
        </div>
        {tab === 'Requests' ? (
          <EmptyState>You have not received any messages</EmptyState>
        ) : (
          mockUsers.slice(3, 6).map((u) => (
            <button
              key={u.pubkey}
              type="button"
              onClick={() => setOpenWith(u)}
              className="flex w-full items-center gap-3 px-5 py-3 text-left"
              style={{ borderBottom: '1px solid var(--nostur-separator)' }}
            >
              <Avatar seed={u.pubkey} size={40} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="truncate text-[16px] font-bold">{u.displayName}</span>
                  <span className="text-[13px]" style={{ color: 'var(--nostur-secondary)' }}>
                    just now
                  </span>
                </span>
                <span
                  className="block truncate text-[14px]"
                  style={{ color: 'var(--nostur-secondary)' }}
                >
                  You: gm
                </span>
              </span>
            </button>
          ))
        )}
      </div>

      {upgrade && (
        <div
          className="absolute inset-0 z-[80] flex flex-col"
          style={{ background: 'var(--nostur-list-bg)' }}
          role="dialog"
          aria-label="Upgrade your DMs"
        >
          <div className="flex shrink-0 items-center px-3 py-2" style={{ minHeight: 44 }}>
            <button type="button" onClick={() => setUpgrade(false)} aria-label="Close">
              <X className="h-6 w-6" style={{ color: 'var(--nostur-accent)' }} />
            </button>
          </div>
          <div
            className="mx-5 rounded-xl p-4 text-[15px] leading-relaxed"
            style={{ background: 'var(--nostur-bg)' }}
          >
            <p>Publish on which relays you wish to receive DMs.</p>
            <p className="mt-3">
              This enables you to use a more private messaging format (NIP-17).
            </p>
            <p className="mt-3">
              Others who have not upgraded can still communicate with you using the older format
              (NIP-04).
            </p>
          </div>
        </div>
      )}

      {newConvo && (
        <div
          className="absolute inset-0 z-[80] flex flex-col"
          style={{ background: 'var(--nostur-list-bg)' }}
          role="dialog"
          aria-label="Private conversation"
        >
          <div className="flex shrink-0 items-center px-3 py-2" style={{ minHeight: 44 }}>
            <button type="button" onClick={() => setNewConvo(false)} aria-label="Close">
              <X className="h-6 w-6" style={{ color: 'var(--nostur-accent)' }} />
            </button>
            <span className="flex-1 text-center text-[17px] font-bold">Private conversation</span>
            <span className="text-[17px]" style={{ color: 'var(--nostur-secondary)' }}>
              Start
            </span>
          </div>
          <div className="px-4 pb-2">
            <input
              placeholder="Search contacts"
              aria-label="Search contacts"
              className="w-full bg-transparent py-1 text-[16px] outline-none"
              style={{ color: 'var(--nostur-primary)' }}
            />
            <div className="mt-2">
              <Segmented
                options={['Following', 'All']}
                value="Following"
                onChange={() => undefined}
                label="Contact scope"
              />
            </div>
          </div>
          <div className="nostur-scroll">
            {mockUsers.slice(6, 12).map((u) => (
              <button
                key={u.pubkey}
                type="button"
                onClick={() => {
                  setNewConvo(false);
                  setOpenWith(u);
                }}
                className="flex w-full items-center gap-3 px-5 py-3 text-left"
                style={{ borderBottom: '1px solid var(--nostur-separator)' }}
              >
                <Avatar seed={u.pubkey} size={40} />
                <span className="min-w-0 flex-1 truncate text-[16px]">{u.displayName}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default MessagesScreen;
