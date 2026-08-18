import React, { useMemo, useState } from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { MaterialCard, PostData } from '../components/MaterialCard';
import { mockNotes } from '../../../data/mock';
import { toPostData } from '../notesToPosts';
import { useAmethystToast } from '../toast';
import '../amethyst.theme.css';

/**
 * Hashtag feed — upstream `Route.Hashtag` (`loggedIn/hashtag/HashtagScreen.kt`).
 *
 * The destination a `#tag` in a note body has always been missing (gaps ame-82):
 * the token was tinted and clickable, and its handler existed only to swallow
 * the tap. Search's hashtag line had the same hole (ame-146).
 *
 * From source: `TopBarExtensibleWithBackButton` whose title slot is
 * `Text("#${tag}", Modifier.weight(1f))` followed by `HashtagActionOptions` —
 * a Follow/Unfollow button and a `MoreVert` menu whose one entry is
 * `mute_hashtag` = "Mute hashtag" (it flips to "Unmute hashtag" once muted, and
 * that menu is the only way back). Body is the ordinary feed of notes carrying
 * the tag; there is a compose FAB, which this reproduction leaves out for the
 * same reason the other per-screen FABs are out (gaps ame-148).
 *
 * Content comes from the existing corpus with no mock edit. Only a handful of
 * mock notes carry hashtags, so most tags land on one to three notes — thin,
 * but true, and a real hashtag feed is often thin too. The screen says so when
 * nothing matches rather than pretending to a fuller feed.
 */

interface HashtagScreenProps {
  tag: string;
  onBack: () => void;
  onOpenThread?: (post: PostData) => void;
}

export function HashtagScreen({ tag, onBack, onOpenThread }: HashtagScreenProps) {
  const toast = useAmethystToast();
  const [following, setFollowing] = useState(false);
  const [muted, setMuted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const posts = useMemo(() => {
    const lower = tag.toLowerCase();
    return mockNotes
      .filter((n) => (n.hashtags || []).some((h) => h.toLowerCase() === lower))
      .sort((a, b) => b.created_at - a.created_at)
      .map((n) => toPostData(n));
  }, [tag]);

  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-[var(--md-background)]" data-tour="amethyst-hashtag">
      <div className="md-app-bar md-app-bar-enhanced">
        <button onClick={onBack} aria-label="Back" className="md-app-bar-icon-btn">
          <ArrowLeft className="w-6 h-6 text-[var(--md-on-surface)]" />
        </button>
        <h1 className="flex-1 font-semibold text-[var(--md-on-surface)] px-1 truncate">#{tag}</h1>
        <button
          type="button"
          onClick={() => setFollowing((v) => !v)}
          aria-pressed={following}
          data-tour="amethyst-hashtag-follow"
          className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
          style={
            following
              ? { border: '1px solid var(--md-outline)', color: 'var(--md-on-surface)' }
              : { background: 'var(--md-primary)', color: 'var(--md-on-primary)' }
          }
        >
          {following ? 'Unfollow' : 'Follow'}
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="More options"
          className="md-app-bar-icon-btn"
        >
          <MoreVertical className="w-5 h-5 text-[var(--md-on-surface)]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-10 text-center gap-2">
            <p className="text-[var(--md-on-surface)]">Feed is empty.</p>
            <p className="text-sm text-[var(--md-on-surface-variant)]">
              No note in this reproduction's sample carries #{tag}.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <MaterialCard key={post.id} post={post} onOpenThread={() => onOpenThread?.(post)} />
          ))
        )}
      </div>

      {/* `HashtagMuteMenu` — one entry, and it is the only way to unmute. */}
      {menuOpen && (
        <div className="absolute inset-0 z-[70] flex items-end" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-label="Hashtag options"
            className="relative w-full rounded-t-3xl pb-3"
            style={{ background: 'var(--md-surface-container-high)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setMuted((v) => !v);
                setMenuOpen(false);
                toast(muted ? `#${tag} unmuted` : `#${tag} muted`, 'success');
              }}
              className="w-full px-5 py-3.5 text-left text-[var(--md-on-surface)]"
            >
              {muted ? 'Unmute hashtag' : 'Mute hashtag'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
