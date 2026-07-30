import React, { useEffect, useState } from 'react';
import type { MockNote, MockUser } from '../../../data/mock';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { shortNpub, TEXT_TRUNCATE_LENGTH } from '../snortUtils';

/**
 * Snort's note creator — `docs/refs/snort/screen-map.md` §11, read together with
 * §3 (the pill system) and §3.1 (the light-mode specificity trap).
 *
 * What the previous build got wrong and this one fixes:
 *
 *  - It is **a modal, never inline** (`NoteCreator.tsx:881` → `<Modal>`): a
 *    `bg-black/80` scrim over a `layer-1 px-6 py-4 lg:w-[720px] max-h-[80dvh]`
 *    body. §6.2 is explicit that the home feed has no inline composer at all.
 *  - Order top→bottom is fixed: "Reply To" context + `<hr>` → the
 *    "Compose a note" title row with a circular × → the drop zone + textarea →
 *    the poll editor → the footer bar.
 *  - The footer's left cluster is, in exact order,
 *    **28px avatar · attachment · bar-chart · settings-outline · "Preview" ·
 *    toggle** — confirmed frame-by-frame in the owner's recording.
 *  - The submit label is **"Send"** ("Reply" when replying), never "Post", and
 *    it is a plain white pill (see the comment on the button itself).
 *  - There is no character counter and no markdown toolbar; neither exists
 *    upstream. Emoji arrive through the `:` trigger, mentions through `@`.
 *
 * Rendered at its FINAL state with no enter animation: the preview environment
 * freezes framer springs and CSS keyframes at frame 0, so an animated overlay
 * would screenshot as invisible.
 */

export interface ComposeScreenProps {
  currentUser: MockUser | null;
  replyTo: MockNote | null;
  replyAuthor?: MockUser;
  onClose: () => void;
  onPost: () => void;
}

export function ComposeScreen({
  currentUser,
  replyTo,
  replyAuthor,
  onClose,
  onPost,
}: ComposeScreenProps) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  /* §11: Escape closes the modal, ⌘/Ctrl+Enter sends. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onPost();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, onPost]);

  /* Upstream's reply context renders the target with `showFooter:false,
     showTime:false, canClick:false, showMedia:false` — i.e. author + body only. */
  const quoted = replyTo
    ? replyTo.content.length > TEXT_TRUNCATE_LENGTH
      ? `${replyTo.content.slice(0, TEXT_TRUNCATE_LENGTH)}…`
      : replyTo.content
    : '';
  const quotedName =
    replyAuthor?.displayName || replyAuthor?.username || (replyTo ? shortNpub(replyTo.pubkey) : '');

  const secondary = { color: 'var(--snort-text-secondary)' };

  return (
    <div className="snort-modal-scrim" onClick={onClose}>
      <div
        className="snort-modal-body"
        role="dialog"
        aria-modal="true"
        aria-label={replyTo ? 'Reply to note' : 'Compose a note'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1 — reply context, then the divider (§11.1). */}
        {replyTo && (
          <>
            <h4 className="snort-h4">Reply To</h4>
            <div className="max-h-64 overflow-y-auto">
              <div className="flex items-start gap-3">
                <Avatar seed={replyTo.pubkey} className="h-8 w-8" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{quotedName}</div>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm" style={secondary}>
                    {quoted}
                  </p>
                </div>
              </div>
            </div>
            <hr style={{ borderColor: 'var(--snort-border)' }} />
          </>
        )}

        {/* 2 — title row. The × is a small icon button on a layer-3 chip. */}
        <div className="font-medium flex justify-between items-center">
          <span>Compose a note</span>
          <button
            type="button"
            className="snort-btn-sm rounded-full"
            style={{ background: 'var(--snort-layer-3)' }}
            aria-label="Close"
            onClick={onClose}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* 3 — the drop zone. Its dashed border is VISIBLE at rest: the
            [REC vs REPO] note in §11 records that the shipped build dropped
            `border-transparent`, so the dashes picked up the global gray. */}
        <div className="snort-dropzone p-3">
          {preview ? (
            /* 6 — the Preview toggle replaces the editor entirely with a
               read-only render of the note (`showFooter:false, canClick:false,
               showTime:false`). */
            <div className="flex items-start gap-3">
              <Avatar seed={currentUser?.pubkey ?? 'anon'} className="h-8 w-8" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">
                  {currentUser?.displayName || currentUser?.username || 'You'}
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm">
                  {text.trim() ? (
                    text
                  ) : (
                    <span style={secondary}>Nothing to preview yet.</span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <textarea
              className="snort-textarea text-sm"
              /* `!border-none !p-0 !rounded-none` upstream — the drop zone owns
                 the frame, the textarea contributes no chrome of its own. */
              style={{ borderWidth: 0, padding: 0, borderRadius: 0 }}
              rows={4}
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}
        </div>

        {/* 5 — poll editor, revealed by the bar-chart icon. Upstream seeds two
            empty options and hides the icon once a poll exists. */}
        {pollOpen && (
          <div className="flex flex-col gap-2">
            <h4 className="snort-h4">Poll Options</h4>
            {pollOptions.map((value, i) => (
              <label key={i} className="flex w-max max-w-full items-center gap-2">
                <span className="whitespace-nowrap text-sm" style={secondary}>
                  Option: {i + 1}
                </span>
                <input
                  className="snort-input"
                  value={value}
                  onChange={(e) =>
                    setPollOptions((opts) => opts.map((o, j) => (j === i ? e.target.value : o)))
                  }
                />
                {i > 0 && (
                  <button
                    type="button"
                    className="snort-btn-sm"
                    aria-label={`Remove option ${i + 1}`}
                    onClick={() => setPollOptions((opts) => opts.filter((_, j) => j !== i))}
                  >
                    <Icon name="close" size={14} />
                  </button>
                )}
              </label>
            ))}
            <button
              type="button"
              className="snort-btn-sm w-max"
              aria-label="Add poll option"
              onClick={() => setPollOptions((opts) => [...opts, ''])}
            >
              <Icon name="plus" size={14} />
            </button>
          </div>
        )}

        {/* 4 — footer bar (`NoteCreator.tsx:575-644`). */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4" style={secondary}>
            <Avatar seed={currentUser?.pubkey ?? 'anon'} className="h-7 w-7" />
            {/* Upstream renders these as AsyncIcon divs, not buttons — the
                attachment dropdown and the advanced panel are out of scope. */}
            <span className="cursor-pointer" title="Attach media">
              <Icon name="attachment" size={24} />
            </span>
            <button
              type="button"
              className="snort-btn-sm"
              style={{ padding: 0, color: pollOpen ? 'var(--snort-text)' : undefined }}
              aria-label="Poll"
              aria-pressed={pollOpen}
              onClick={() => setPollOpen((v) => !v)}
            >
              <Icon name="bar-chart" size={24} />
            </button>
            <span className="cursor-pointer" title="Advanced">
              <Icon name="settings-outline" size={24} />
            </span>
            {/* Upstream hides this label below `sm`; the sim's column can be
                narrower than the viewport, so it stays visible here. */}
            <span>Preview</span>
            <button
              type="button"
              className={`snort-toggle ${preview ? 'active' : ''}`}
              aria-label="Preview"
              aria-pressed={preview}
              onClick={() => setPreview((v) => !v)}
            >
              <span className="snort-toggle-knob" />
            </button>
          </div>

          {/* Deliberately NOT `.primary`: upstream writes this as
              `<AsyncButton className="bg-primary">`, and `.light button` (0,1,1)
              beats that utility (0,1,0) — hence the white "Send" in the recording (§3.1). */}
          <button
            type="button"
            className="snort-btn snort-post-btn"
            data-tour="snort-post"
            onClick={onPost}
          >
            {replyTo ? 'Reply' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComposeScreen;
