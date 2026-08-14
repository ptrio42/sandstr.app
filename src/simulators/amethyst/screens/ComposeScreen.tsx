import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ImagePlus, Camera, Video, Mic, ListChecks, Zap, Activity,
  EyeOff, Lock, Clock, CalendarClock, MapPin,
  Paperclip, Cog, Type, Smile, Receipt, UserX,
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import '../amethyst.theme.css';

interface ComposeScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onPost?: (content: string) => void;
  /**
   * The note being replied to. Upstream a reply opens this same full-screen
   * composer with the parent quoted above the field and the recipients listed —
   * without it, "Reply" was indistinguishable from "new note" (gaps ame-77).
   */
  replyTo?: { author: string; content: string } | null;
}

// Real Amethyst composer (ShortNotePostScreen.kt, verified vs shots/compose*.png):
// FULL-SCREEN. Top bar = X (close) + "Post". Body = account avatar + "What's on
// your mind?". Bottom = horizontally-scrollable action toolbar. NO character limit,
// NO progress ring, NO public/followers selector (all Twitter-isms Nostr lacks).
/**
 * All 17 upstream items, in upstream's order — we shipped 12 in an order of our
 * own (gaps ame-17). `adds` is what pressing the tool would put in the note; the
 * toolbar reports it rather than pretending to open the inline section, because
 * the conditional sections are their own (deliberately deferred) piece of work,
 * tracked as ame-19.
 */
const TOOLBAR = [
  { icon: ImagePlus, label: 'Add Image', adds: 'an image from your gallery' },
  { icon: Paperclip, label: 'Upload File', adds: 'any file, uploaded to your media server' },
  { icon: Camera, label: 'Take picture', adds: 'a photo from the camera' },
  { icon: Video, label: 'Take video', adds: 'a clip from the camera' },
  { icon: Mic, label: 'Record voice', adds: 'a voice message' },
  { icon: Lock, label: 'Private note', adds: 'encryption — only the people you tag can read it' },
  { icon: ListChecks, label: 'Poll', adds: 'a poll with its own options and closing time' },
  { icon: Zap, label: 'Forward zap to', adds: 'a zap split, so zaps go to other people too' },
  { icon: Activity, label: 'Zapraiser', adds: 'a fundraising goal in sats' },
  { icon: Cog, label: 'Proof of Work', adds: 'a mined PoW stamp, which makes spamming you expensive' },
  { icon: Type, label: 'Subject', adds: 'a subject line above the note' },
  { icon: EyeOff, label: 'Sensitive Content', adds: 'a content warning, with an optional reason' },
  { icon: Clock, label: 'Expiration', adds: 'an expiry, after which relays should drop it' },
  { icon: CalendarClock, label: 'Schedule', adds: 'a send time — it lands under Scheduled posts' },
  { icon: MapPin, label: 'Expose Location as', adds: 'a geohash — the public learns you are within 5km' },
  { icon: Smile, label: 'Secret Emoji Maker', adds: 'an emoji carrying a hidden message' },
  { icon: Receipt, label: 'Lightning Invoice', adds: 'a lightning invoice inside the note' },
];

export function ComposeScreen({ isOpen, onClose, onPost, replyTo }: ComposeScreenProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canPost = content.trim().length > 0;
  // Which toolbar tool was last pressed. Upstream each opens an inline section
  // in the body; those are ame-19 and deliberately still open, so the toolbar
  // says what the tool does instead of miming a section it does not have.
  const [tool, setTool] = useState<(typeof TOOLBAR)[number] | null>(null);
  // Upstream taps the composer avatar to switch to the anonymous account
  // (NoAccounts icon) — gaps ame-18.
  const [anonymous, setAnonymous] = useState(false);

  const handlePost = () => {
    if (!canPost) return;
    onPost?.(content);
    setContent('');
    setTool(null);
    setAnonymous(false);
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
            {replyTo && (
              <div
                className="mb-3 rounded-2xl px-4 py-3"
                style={{ background: 'var(--md-surface-container-low)' }}
                data-tour="amethyst-compose-reply-to"
              >
                <p className="text-sm" style={{ color: 'var(--md-primary)' }}>
                  Replying to {replyTo.author}
                </p>
                <p className="text-sm mt-1 line-clamp-3 text-[var(--md-on-surface-variant)]">
                  {replyTo.content}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAnonymous((v) => !v)}
                aria-label={anonymous ? 'Post as sandy' : 'Post anonymously'}
                data-tour="amethyst-compose-account"
                className="relative shrink-0"
              >
                {anonymous ? (
                  <span className="w-11 h-11 rounded-full flex items-center justify-center bg-[var(--md-surface-variant)]">
                    <UserX className="w-6 h-6 text-[var(--md-on-surface-variant)]" />
                  </span>
                ) : (
                  <Avatar seed="sandy" className="w-11 h-11" />
                )}
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--md-primary)] ring-2 ring-[var(--md-background)] flex items-center justify-center">
                  <Lock className="w-2 h-2 text-[var(--md-on-primary)]" />
                </span>
              </button>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={replyTo ? 'Post your reply' : "What's on your mind?"}
                className="flex-1 bg-transparent border-none resize-none outline-none text-[var(--md-on-surface)] text-lg min-h-[140px] placeholder:text-[var(--md-on-surface-variant)]"
                autoFocus
              />
            </div>
          </div>

          {/* Bottom action toolbar (horizontally scrollable) */}
          <div className="border-t border-[var(--md-outline-variant)] safe-area-bottom">
            {tool && (
              <p className="px-4 pt-2 text-xs leading-relaxed" style={{ color: 'var(--amethyst-placeholder)' }}>
                <span className="font-semibold text-[var(--md-on-surface)]">{tool.label}</span> adds {tool.adds}.
                In the real app it opens its own section in the note above.
              </p>
            )}
            <div
              className="flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-hide"
              data-tour="amethyst-compose-toolbar"
            >
              {TOOLBAR.map((item) => (
                <motion.button
                  key={item.label}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setTool((cur) => (cur?.label === item.label ? null : item))}
                  aria-label={item.label}
                  aria-pressed={tool?.label === item.label}
                  title={item.label}
                  className="p-2.5 rounded-full transition-colors shrink-0"
                  style={{
                    color: tool?.label === item.label ? 'var(--md-primary)' : 'var(--md-on-surface)',
                    background: tool?.label === item.label ? 'var(--md-surface-variant)' : undefined,
                  }}
                >
                  <item.icon className="w-5 h-5" />
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
