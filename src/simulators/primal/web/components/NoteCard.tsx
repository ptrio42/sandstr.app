import React from 'react';
import { MoreHorizontal, MessageCircle, Zap, Heart, Repeat2, Bookmark } from 'lucide-react';
import { Avatar } from './Avatar';
import { VerifiedBadge, NoteBody } from './ui';
import type { PNote } from '../data';

interface NoteCardProps {
  note: PNote;
  onOpen?: () => void;
  onZap?: () => void;
  /** the zap action gets the .primal-zap-btn tour hook on the first feed note */
  zapTourHook?: boolean;
}

export function NoteCard({ note, onOpen, onZap, zapTourHook }: NoteCardProps) {
  const [liked, setLiked] = React.useState(false);
  const [reposted, setReposted] = React.useState(false);
  const [zapped, setZapped] = React.useState(false);
  const [marked, setMarked] = React.useState(false);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="primal-note" onClick={onOpen}>
      <div className="flex gap-3 items-start">
        <Avatar seed={note.name} className="w-11 h-11" legend={note.legend} />
        <div className="flex-1 min-w-0">
          <div className="primal-note-head">
            <span className="primal-note-name">{note.name}</span>
            {note.verified && <VerifiedBadge />}
            <span className="primal-note-handle">{note.handle}</span>
            <span className="primal-note-time">· {note.time}</span>
            <button className="primal-note-more" onClick={stop} aria-label="more">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {note.replyTo && (
            <div className="primal-muted" style={{ fontSize: 15, marginTop: 2 }}>
              replying to <span className="primal-mention">{note.replyTo}</span>
            </div>
          )}

          <div style={{ marginTop: 4 }}>
            <NoteBody text={note.body} />
          </div>

          {note.media && (
            <>
              <div className="primal-media">
                <img src={note.media} alt="" />
              </div>
              {note.zapTop && (
                <div className="primal-zapgallery">
                  <span className="primal-zappill">
                    <Zap size={15} fill="var(--primal-zap)" color="var(--primal-zap)" />
                    <span className="primal-zapamt">{note.zapTop.amount}</span>
                    {note.zapTop.comment && <span className="primal-muted">{note.zapTop.comment}</span>}
                  </span>
                  <span className="primal-zapgallery-avatars">
                    <Avatar seed={note.name + 'z1'} className="w-7 h-7" />
                    <Avatar seed={note.name + 'z2'} className="w-7 h-7" />
                  </span>
                </div>
              )}
            </>
          )}

          {note.link && (
            <div className="primal-linkcard">
              <div className="primal-linkcard-title">{note.link.title}</div>
              <div className="primal-linkcard-desc">{note.link.desc}</div>
              <div className="primal-linkcard-url">{note.link.url}</div>
            </div>
          )}

          {note.quote && (
            <div className="primal-quote">
              <div className="primal-note-head">
                <Avatar seed={note.quote.name} className="w-6 h-6" />
                <span className="primal-note-name" style={{ fontSize: 14 }}>{note.quote.name}</span>
                <span className="primal-note-handle" style={{ fontSize: 14 }}>{note.quote.handle}</span>
                <span className="primal-note-time" style={{ fontSize: 14 }}>· {note.quote.time}</span>
              </div>
              <div style={{ marginTop: 4 }}>
                <NoteBody text={note.quote.body} />
              </div>
            </div>
          )}

          <div className="primal-actions">
            <button className="primal-action reply" onClick={stop}>
              <MessageCircle /> {note.reply > 0 && <span>{note.reply}</span>}
            </button>
            <button
              className={`primal-action zap${zapped ? ' on' : ''}`}
              data-tour={zapTourHook ? 'primal-zaps' : undefined}
              onClick={(e) => { stop(e); setZapped(true); onZap?.(); }}
              {...(zapTourHook ? { 'aria-label': 'zap' } : {})}
            >
              <Zap fill={zapped ? 'var(--primal-zap)' : 'none'} /> <span>{note.zap}</span>
            </button>
            <button className={`primal-action like${liked ? ' on' : ''}`} onClick={(e) => { stop(e); setLiked((v) => !v); }}>
              <Heart fill={liked ? 'var(--primal-like)' : 'none'} /> {note.like > 0 && <span>{note.like + (liked ? 1 : 0)}</span>}
            </button>
            <button className={`primal-action repost${reposted ? ' on' : ''}`} onClick={(e) => { stop(e); setReposted((v) => !v); }}>
              <Repeat2 /> {note.repost > 0 && <span>{note.repost + (reposted ? 1 : 0)}</span>}
            </button>
            <button className={`primal-action bookmark${marked ? ' on' : ''}`} onClick={(e) => { stop(e); setMarked((v) => !v); }}>
              <Bookmark fill={marked ? 'var(--primal-bookmark)' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteCard;
