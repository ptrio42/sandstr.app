import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MoreVertical, Mail, SquarePen, List, Copy, QrCode,
  BadgeCheck, Link as LinkIcon, Zap, Play,
} from 'lucide-react';
import { MaterialCard } from '../components/MaterialCard';
import { Avatar } from '../components/Avatar';
import { mockNotes, getUserByPubkey } from '../../../data/mock';
import '../amethyst-v1-12.theme.css';

interface ProfileScreenProps {
  onBack?: () => void;
  /** Reported so the guided tour's follow step can complete. */
  onFollowToggle?: () => void;
}

// Real Amethyst profile (ProfileScreen.kt, verified vs shots/profile.png):
// banner + floating ⋮ · overlapping avatar w/ account badge · action row
// (Message/Edit/Follow/List) · name + npub + copy/QR · badges · NIP-05/website/
// lightning links · bio · tabs Notes/Replies/Yours/Gallery. NO Twitter-style
// stat strip and NO "joined date" (Nostr has neither).

const profile = {
  name: 'sandy',
  npub: 'npub178u…vq05qrg4',
  nip05: 'sandy.example',
  website: 'sandy.example',
  lightning: 'sandy@wallet.example',
  bio: 'All-round buidler.',
};

const badgeHues = [275, 45, 30, 200, 320, 160, 260];

export function ProfileScreen({ onBack, onFollowToggle }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'replies' | 'yours' | 'gallery'>('notes');
  const [isFollowing, setIsFollowing] = useState(true);

  const userPosts = mockNotes.slice(0, 6).map((note) => {
    const author = getUserByPubkey(note.pubkey);
    return {
      id: note.id,
      author: { name: profile.name, handle: profile.nip05, avatar: author?.avatar || '', isVerified: true, nip05: profile.nip05 },
      content: note.content,
      timestamp: formatTimestamp(note.created_at),
      stats: { replies: note.replies, reposts: note.reposts, zaps: note.zaps, likes: note.likes },
      images: note.images,
    };
  });

  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]" data-tour="amethyst-profile">
      <div className="flex-1 overflow-y-auto">
        {/* Banner + floating actions */}
        <div className="relative h-36 w-full bg-gradient-to-br from-[#3a1d6e] via-[#7b2ff7] to-[#c026d3]">
          <div className="absolute inset-0 flex items-start justify-between p-3">
            <button onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button aria-label="More" className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Avatar row + action buttons */}
        <div className="px-4">
          <div className="flex justify-between items-end -mt-12">
            <div className="relative">
              <Avatar seed="sandy" className="w-24 h-24 border-4 border-[var(--md-background)]" />
              <span className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[var(--md-primary)] ring-2 ring-[var(--md-background)] flex items-center justify-center">
                <BadgeCheck className="w-3.5 h-3.5 text-[var(--md-on-primary)]" />
              </span>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <ActionIconButton label="Message"><Mail className="w-5 h-5" /></ActionIconButton>
              <ActionIconButton label="Edit"><SquarePen className="w-5 h-5" /></ActionIconButton>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsFollowing((f) => !f);
                  onFollowToggle?.();
                }}
                data-tour="amethyst-follow"
                className="px-5 py-2 rounded-full text-sm font-medium bg-[var(--md-surface-variant)] text-[var(--md-on-surface)]"
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </motion.button>
              <ActionIconButton label="Add to list"><List className="w-5 h-5" /></ActionIconButton>
            </div>
          </div>

          {/* Name + identity */}
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-[var(--md-on-surface)]">{profile.name}</h2>
              <Play className="w-4 h-4 text-[var(--md-on-surface-variant)]" />
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[var(--md-on-surface-variant)]">
              <span className="text-sm">{profile.npub}</span>
              <Copy className="w-4 h-4" />
              <QrCode className="w-4 h-4" />
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-2 mt-3">
            {badgeHues.map((h, i) => (
              <div key={i} className="w-9 h-9 rounded-full shrink-0" style={{ background: `linear-gradient(135deg, hsl(${h} 60% 55%), hsl(${(h + 40) % 360} 60% 40%))` }} />
            ))}
          </div>

          {/* Links */}
          <div className="mt-3 space-y-1.5 text-[15px]">
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span style={{ color: 'var(--md-primary)' }}>{profile.nip05}</span>
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[var(--md-on-surface-variant)] shrink-0" />
              <span style={{ color: 'var(--md-primary)' }}>{profile.website}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 shrink-0" style={{ color: 'var(--bitcoin-orange)' }} />
              <span className="truncate" style={{ color: 'var(--md-primary)' }}>{profile.lightning}</span>
            </div>
          </div>

          {/* Bio */}
          <p className="mt-3 mb-1 text-[var(--md-on-surface)]">{profile.bio}</p>
        </div>

        {/* Tabs */}
        <div className="md-tabs sticky top-0 z-10 bg-[var(--md-background)] mt-2 overflow-x-auto">
          {(['notes', 'replies', 'yours', 'gallery'] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`md-tab capitalize whitespace-nowrap ${activeTab === t ? 'active' : ''}`}>
              {t}
              {activeTab === t && (
                <motion.div layoutId="profile-tab-indicator" className="md-tab-indicator" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-2">
          {activeTab === 'notes' ? (
            <div className="space-y-2">
              {userPosts.map((post) => <MaterialCard key={post.id} post={post} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-[var(--md-on-surface-variant)] capitalize">No {activeTab} yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionIconButton({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      aria-label={label}
      className="w-10 h-10 rounded-full bg-[var(--md-surface-variant)] text-[var(--md-on-surface)] flex items-center justify-center"
    >
      {children}
    </motion.button>
  );
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}
