import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ImagePlus, Camera, Video, Mic, ListChecks, Zap, Activity,
  EyeOff, Lock, Clock, CalendarClock, MapPin,
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import '../amethyst.theme.css';

interface ComposeScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onPost?: (content: string) => void;
}

// Real Amethyst composer (ShortNotePostScreen.kt, verified vs shots/compose*.png):
// FULL-SCREEN. Top bar = X (close) + "Post". Body = account avatar + "What's on
// your mind?". Bottom = horizontally-scrollable action toolbar. NO character limit,
// NO progress ring, NO public/followers selector (all Twitter-isms Nostr lacks).
const TOOLBAR = [
  { icon: ImagePlus, label: 'Add image / video' },
  { icon: Camera, label: 'Take picture' },
  { icon: Video, label: 'Take video' },
  { icon: Mic, label: 'Record voice' },
  { icon: ListChecks, label: 'Poll' },
  { icon: Zap, label: 'Forward zap to' },
  { icon: Activity, label: 'Zapraiser' },
  { icon: EyeOff, label: 'Mark as sensitive' },
  { icon: Lock, label: 'Private note' },
  { icon: Clock, label: 'Expiration' },
  { icon: CalendarClock, label: 'Schedule' },
  { icon: MapPin, label: 'Location' },
];

export function ComposeScreen({ isOpen, onClose, onPost }: ComposeScreenProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canPost = content.trim().length > 0;

  const handlePost = () => {
    if (!canPost) return;
    onPost?.(content);
    setContent('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 z-50 flex flex-col bg-[var(--md-background)]"
        >
          {/* Top bar: X + Post */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 rounded-full border border-[var(--md-outline)] flex items-center justify-center text-[var(--md-on-surface)]"
            >
              <X className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileTap={canPost ? { scale: 0.95 } : undefined}
              onClick={handlePost}
              disabled={!canPost}
              data-tour="amethyst-post"
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
                canPost
                  ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)]'
                  : 'bg-[var(--md-surface-variant)] text-[var(--md-on-surface-variant)] cursor-not-allowed'
              }`}
            >
              Post
            </motion.button>
          </div>

          {/* Body: avatar + text field (inline) */}
          <div className="flex-1 overflow-y-auto px-4 pt-2">
            <div className="flex gap-3">
              <div className="relative shrink-0">
                <Avatar seed="pitiunited" className="w-11 h-11" />
                {/* account / anonymous badge (real app shows a small purple badge here) */}
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--md-primary)] ring-2 ring-[var(--md-background)] flex items-center justify-center">
                  <Lock className="w-2 h-2 text-[var(--md-on-primary)]" />
                </span>
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="flex-1 bg-transparent border-none resize-none outline-none text-[var(--md-on-surface)] text-lg min-h-[140px] placeholder:text-[var(--md-on-surface-variant)]"
                autoFocus
              />
            </div>
          </div>

          {/* Bottom action toolbar (horizontally scrollable) */}
          <div className="border-t border-[var(--md-outline-variant)] safe-area-bottom">
            <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-hide">
              {TOOLBAR.map(({ icon: Icon, label }) => (
                <motion.button
                  key={label}
                  whileTap={{ scale: 0.9 }}
                  aria-label={label}
                  title={label}
                  className="p-2.5 rounded-full text-[var(--md-on-surface)] hover:bg-[var(--md-surface-variant)] transition-colors shrink-0"
                >
                  <Icon className="w-5 h-5" />
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
