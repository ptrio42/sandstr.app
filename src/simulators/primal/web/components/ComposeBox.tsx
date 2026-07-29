import React from 'react';
import { Image as ImageIcon, ListTodo, Smile } from 'lucide-react';
import { Avatar } from './Avatar';
import { currentUser } from '../data';

interface ComposeBoxProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onPost: (text: string) => void;
}

export function ComposeBox({ open, onOpen, onClose, onPost }: ComposeBoxProps) {
  const [text, setText] = React.useState('');
  const ref = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (open) ref.current?.focus();
    if (!open) setText('');
  }, [open]);

  if (!open) {
    return (
      <div className="primal-compose-trigger">
        <Avatar seed={currentUser.name} className="w-11 h-11" />
        <button className="primal-compose-pill" onClick={onOpen}>Say something on nostr...</button>
      </div>
    );
  }

  return (
    <div className="primal-editor primal-compose" data-tour="primal-compose">
      <div className="flex gap-3 items-start">
        <Avatar seed={currentUser.name} className="w-11 h-11" />
        {/* Real Primal's expanded editor has NO placeholder — the collapsed
            "Say something on nostr..." pill carries the prompt (screen-map). */}
        <textarea
          ref={ref}
          className="primal-editor-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
        />
      </div>

      {text.trim() !== '' && (
        <>
          <div className="primal-editor-previewlabel">NOTE PREVIEW</div>
          <div className="primal-editor-preview">{text}</div>
        </>
      )}

      <div className="primal-editor-toolbar">
        <button className="primal-editor-tool" aria-label="image"><ImageIcon size={22} /></button>
        <button className="primal-editor-tool" aria-label="attach"><ListTodo size={22} /></button>
        <button className="primal-editor-tool" aria-label="emoji"><Smile size={22} /></button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button
            className="primal-btn-pill primal-btn-post"
            disabled={text.trim() === ''}
            onClick={() => onPost(text)}
          >
            Post
          </button>
          <button className="primal-btn-pill primal-btn-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ComposeBox;
