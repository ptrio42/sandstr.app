import React from 'react';
import { Avatar } from './Avatar';
import { HeartIcon, CommentIcon, QuoteIcon, ZapIcon, EllipsisVIcon, VerifiedRosette } from './icons';
import type { YakiArticle } from '../data';

function abbrev(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${n}`;
}

interface Props {
  article: YakiArticle;
  onOpen?: () => void;
  onViewProfile?: () => void;
}

// Article feed card: author row (avatar + name + orange "N min read"), then title +
// summary on the LEFT with a square rounded thumbnail on the RIGHT. Action bar drops
// repost: reactions · replies · quotes · zaps · ⋯
export const ArticleCard: React.FC<Props> = ({ article, onOpen, onViewProfile }) => {
  const stop = (fn?: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn?.(); };

  return (
    <article onClick={onOpen} className="px-4 pt-4 pb-3 border-b border-[var(--yh-divider)] cursor-pointer">
      {/* author row */}
      <div className="flex items-center gap-2.5">
        <button onClick={stop(onViewProfile)} className="shrink-0">
          <Avatar seed={article.authorSeed} className="w-8 h-8" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[15px] truncate">{article.authorName}</span>
            {article.nip05 && <VerifiedRosette className="w-[15px] h-[15px] shrink-0" />}
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-[var(--yh-text-2)]">
            <span>{article.timeAgo}</span><span>·</span>
            <span className="text-[var(--yh-orange)] font-medium">{article.readMin}m read</span>
          </div>
        </div>
      </div>

      {/* title + summary (left) · thumbnail (right) */}
      <div className="flex gap-4 mt-2.5">
        <div className="flex-1 min-w-0">
          <h3 className="text-[21px] font-extrabold leading-[1.2] text-[var(--yh-text)]">{article.title}</h3>
          <p className={`text-[15px] mt-1.5 leading-snug line-clamp-2 ${article.summary === 'No description' ? 'italic text-[var(--yh-text-3)]' : 'text-[var(--yh-text-2)]'}`}>
            {article.summary}
          </p>
        </div>
        {article.cover && (
          <img src={article.cover} alt="" className="w-[104px] h-[104px] rounded-2xl object-cover shrink-0" />
        )}
      </div>

      {/* action bar (no repost) */}
      <div className="flex items-center mt-3.5 pr-0.5 text-[var(--yh-text-2)]">
        <button onClick={stop()} className="yakihonne-action w-[16%]"><HeartIcon className="w-[21px] h-[21px]" /><span>{article.likes}</span></button>
        <button onClick={stop()} className="yakihonne-action w-[16%]"><CommentIcon className="w-[21px] h-[21px]" /><span>{article.comments}</span></button>
        <button onClick={stop()} className="yakihonne-action w-[16%]"><QuoteIcon className="w-[19px] h-[19px]" /><span>{article.quotes}</span></button>
        <button onClick={stop()} className="yakihonne-action w-[16%]"><ZapIcon className="w-[21px] h-[21px]" /><span>{abbrev(article.zaps)}</span></button>
        <button onClick={stop()} className="ml-auto"><EllipsisVIcon className="w-5 h-5" /></button>
      </div>
    </article>
  );
};

export default ArticleCard;
