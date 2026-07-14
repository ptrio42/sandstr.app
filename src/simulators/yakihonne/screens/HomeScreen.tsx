import React from 'react';
import { Avatar } from '../components/Avatar';
import { FeedSelector, type FeedSource } from '../components/FeedSelector';
import { NoteCard } from '../components/NoteCard';
import { ArticleCard } from '../components/ArticleCard';
import { SlidersIcon, SearchIcon } from '../components/icons';
import { homeNotes, yakiArticles, type YakiArticle } from '../data';

interface Props {
  currentUserSeed: string;
  source: FeedSource;
  onSource: (s: FeedSource) => void;
  onOpenDrawer: () => void;
  onOpenSearch: () => void;
  onOpenThread: (id: string) => void;
  onOpenArticle: (a: YakiArticle) => void;
  onViewProfile: (seed: string, name: string) => void;
  onReply: () => void;
  onZap: (sats: number) => void;
}

export const HomeScreen: React.FC<Props> = ({
  currentUserSeed, source, onSource, onOpenDrawer, onOpenSearch,
  onOpenThread, onOpenArticle, onViewProfile, onReply, onZap,
}) => {
  const isArticles = source === 'trending';

  return (
    <div className="min-h-full" data-tour="yakihonne-feed">
      {/* top app bar */}
      <header className="sticky top-0 z-30 bg-[color-mix(in_srgb,var(--yh-bg)_88%,transparent)] backdrop-blur-xl">
        <div className="flex items-center justify-between px-3.5 pt-3 pb-2.5">
          <button onClick={onOpenDrawer} aria-label="Menu" data-tour="yakihonne-profile">
            <Avatar seed={currentUserSeed} className="w-9 h-9" rounded="rounded-full" />
          </button>
          <FeedSelector value={source} onChange={onSource} />
          <div className="flex items-center gap-2">
            <button className="yakihonne-appbar-chip" aria-label="Filter"><SlidersIcon className="w-5 h-5" /></button>
            <button className="yakihonne-appbar-chip" aria-label="Search" onClick={onOpenSearch}><SearchIcon className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      {/* feed body */}
      {isArticles ? (
        <div>
          {yakiArticles.map((a) => (
            <ArticleCard key={a.id} article={a} onOpen={() => onOpenArticle(a)} onViewProfile={() => onViewProfile(a.authorSeed, a.authorName)} />
          ))}
          <div className="h-28" />
        </div>
      ) : (
        <div>
          {homeNotes.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              onOpenThread={() => onOpenThread(n.id)}
              onViewProfile={() => onViewProfile(n.seed, n.name)}
              onReply={onReply}
              onZap={onZap}
            />
          ))}
          <div className="h-28" />
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
