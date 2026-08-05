import React, { useState } from 'react';
import { Bell, Heart, MessageSquareText, Repeat2, Settings, Users, Zap } from 'lucide-react';
import type { MockUser } from '../../../data/mock';
import { CompactRow } from '../components/PostCard';
import { EmptyState, ScreenTitle, TabButton } from '../components/Chrome';
import { ago, followingFeed, userByPubkey } from '../nosturData';
import type { NosturNotifTab } from '../types';

/**
 * Screens/MainTabs/Notifications/NotificationsScreen.swift — six ICON-ONLY
 * TabButtons with red unread capsules:
 * text.bubble · bell · heart · arrow.2.squarepath · bolt · person.3.
 * Entering the tab auto-selects the first one with unread items (MainTabs.swift).
 */
const TABS: { id: NosturNotifTab; Icon: typeof Bell; unread?: number }[] = [
  { id: 'Mentions', Icon: MessageSquareText, unread: 2 },
  { id: 'New Posts', Icon: Bell },
  { id: 'Reactions', Icon: Heart, unread: 5 },
  { id: 'Reposts', Icon: Repeat2 },
  { id: 'Zaps', Icon: Zap },
  { id: 'Followers', Icon: Users, unread: 1 },
];

export function NotificationsScreen({
  onOpenProfile,
}: {
  onOpenProfile: (u: MockUser) => void;
}) {
  const [tab, setTab] = useState<NosturNotifTab>('Mentions');
  const rows = followingFeed.slice(0, 6);

  return (
    <>
      {/* Title centred, gear at the trailing edge (frame f_051). */}
      <div className="flex shrink-0 items-center px-4 py-2">
        <span className="flex-1" />
        <ScreenTitle>Notifications</ScreenTitle>
        <span className="flex flex-1 justify-end">
          <Settings className="h-[22px] w-[22px]" style={{ color: 'var(--nostur-accent)' }} />
        </span>
      </div>

      <div className="nostur-tabrow" role="tablist" aria-label="Notification types">
        {TABS.map(({ id, Icon, unread }) => (
          <TabButton
            key={id}
            icon={<Icon className="h-[18px] w-[18px]" />}
            selected={tab === id}
            unread={unread}
            onClick={() => setTab(id)}
            aria-label={id}
          />
        ))}
      </div>

      <div className="nostur-scroll" data-tour="nostur-notifications">
        {tab === 'New Posts' || tab === 'Reposts' ? (
          <EmptyState>Nothing here yet</EmptyState>
        ) : (
          rows.map(({ note }, i) => {
            const actor = userByPubkey(note.pubkey);
            return (
              <CompactRow key={note.id} pubkey={actor.pubkey} onOpenProfile={onOpenProfile}>
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-[16px] font-bold">{actor.displayName}</span>
                  <span className="text-[13px]" style={{ color: 'var(--nostur-secondary)' }}>
                    {ago(note.created_at)}
                  </span>
                </div>
                <p className="mt-0.5 text-[13px]" style={{ color: 'var(--nostur-secondary)' }}>
                  {tab === 'Reactions'
                    ? `${actor.displayName} and ${3 + i} others reacted on your post`
                    : tab === 'Zaps'
                      ? `zapped your post ${note.zapAmount} sats`
                      : tab === 'Followers'
                        ? 'started following you'
                        : 'Replying to you'}
                </p>
                {tab !== 'Followers' && (
                  <p className="mt-1 line-clamp-3 text-[15px]">{note.content}</p>
                )}
              </CompactRow>
            );
          })
        )}
        {tab === 'Reactions' && (
          <div className="px-5 py-4">
            <span
              className="rounded-full px-3 py-1.5 text-[13px]"
              style={{ background: 'var(--nostur-fill)' }}
            >
              Show more
            </span>
          </div>
        )}
      </div>
    </>
  );
}

export default NotificationsScreen;
