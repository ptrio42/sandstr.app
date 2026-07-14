import React from 'react';
import { Avatar } from '../components/Avatar';
import { OverlayHeader } from '../components/OverlayHeader';
import { HeartIcon, CommentIcon, QuoteIcon, ZapIcon, EllipsisVIcon } from '../components/icons';
import type { YakiArticle } from '../data';

function abbrev(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${n}`;
}

interface Props {
  article: YakiArticle;
  onBack: () => void;
  onViewProfile: (seed: string, name: string) => void;
}

export const ArticleReader: React.FC<Props> = ({ article, onBack, onViewProfile }) => (
  <div className="absolute inset-0 z-[55] bg-[var(--yh-bg)] flex flex-col">
    <OverlayHeader title="Article" onBack={onBack} logo />

    <div className="flex-1 overflow-y-auto px-4 pb-4">
      {/* posted by + follow */}
      <div className="flex items-center gap-3 py-2.5 border-b border-[var(--yh-divider)]">
        <button onClick={() => onViewProfile(article.authorSeed, article.authorName)}>
          <Avatar seed={article.authorSeed} className="w-10 h-10" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-[var(--yh-text-2)]">Posted by</div>
          <div className="text-[16px] font-bold text-[var(--yh-orange)] truncate">{article.authorName}</div>
        </div>
        <button className="yakihonne-btn-orange px-5 py-2 text-[15px]">Follow</button>
        <button className="w-10 h-10 rounded-full border border-[var(--yh-border-strong)] flex items-center justify-center text-[var(--yh-text)]">
          <ZapIcon className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* title */}
      <h1 className="text-[30px] font-extrabold leading-[1.15] mt-4">{article.title}</h1>
      <div className="text-[15px] text-[var(--yh-text-2)] mt-2">
        Posted from <span className="text-[var(--yh-orange)]">{article.client}</span> · {article.timeAgo}
      </div>

      {/* cover */}
      {article.cover && (
        <img src={article.cover} alt="" className="w-full aspect-video object-cover rounded-2xl mt-4" />
      )}

      {/* body */}
      <div className="mt-4 space-y-4 text-[18px] leading-[1.5]">
        {article.body.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      {/* see translation */}
      <div className="flex justify-center my-6">
        <button className="px-5 py-2.5 rounded-xl bg-[var(--yh-surface)] border border-[var(--yh-orange)] text-[15px] font-medium">See translation</button>
      </div>
    </div>

    {/* bottom action bar (no repost) */}
    <div className="border-t border-[var(--yh-divider)] px-6 py-3 flex items-center justify-between text-[var(--yh-text-2)]">
      <button className="yakihonne-action"><HeartIcon className="w-[22px] h-[22px]" /><span>{article.likes}</span></button>
      <button className="yakihonne-action"><CommentIcon className="w-[22px] h-[22px]" /><span>{article.comments}</span></button>
      <button className="yakihonne-action"><QuoteIcon className="w-5 h-5" /><span>{article.quotes}</span></button>
      <button className="yakihonne-action"><ZapIcon className="w-[22px] h-[22px]" /><span>{abbrev(article.zaps)}</span></button>
      <button><EllipsisVIcon className="w-5 h-5" /></button>
    </div>
  </div>
);

export default ArticleReader;
