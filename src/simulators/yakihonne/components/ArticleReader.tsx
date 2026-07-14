import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Zap,
  Bookmark,
  Share2,
  Clock,
  Calendar,
} from 'lucide-react';

export interface ReaderArticle {
  id: string;
  title: string;
  summary: string;
  coverImage: string;
  author: {
    name: string;
    avatar: string;
    nip05?: string;
  };
  readTime: string;
  publishedAt: string;
  likes: number;
  comments: number;
  zaps: number;
  tags: string[];
  /** Optional pre-rendered body paragraphs (NIP-23 long-form content). */
  body?: string[];
}

interface ArticleReaderProps {
  article: ReaderArticle;
  isBookmarked: boolean;
  onBookmark: () => void;
  onBack: () => void;
  onZap?: (amount: number) => void;
}

/**
 * Fallback long-form body derived from the article summary + title so that
 * tapping any mock ArticleCard opens a plausible NIP-23 style reader view.
 */
function buildBody(article: ReaderArticle): string[] {
  if (article.body && article.body.length > 0) return article.body;
  const topic = article.tags[0] || 'Nostr';
  return [
    article.summary,
    `In this piece we take a closer look at ${topic.toLowerCase()} and why it matters for the decentralized web. The ideas here build on years of open-source work across the Nostr ecosystem.`,
    `The protocol's simplicity is its greatest strength. By keeping the core specification small, developers can build a diverse range of clients — from micro-blogging apps to long-form publishing tools like the one you are reading this in right now.`,
    `Zaps turn attention into value. Instead of ad-driven engagement, readers can reward writers directly over the Lightning Network, aligning incentives between creators and their audience in a way legacy platforms never could.`,
    `As adoption grows, expect richer editorial experiences, better discovery, and deeper integration with self-custodial wallets. The future of publishing is open, portable, and owned by the people who create it.`,
  ];
}

export function ArticleReader({
  article,
  isBookmarked,
  onBookmark,
  onBack,
  onZap,
}: ArticleReaderProps) {
  const [liked, setLiked] = useState(false);
  const [zapped, setZapped] = useState(false);

  const body = buildBody(article);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleZap = () => {
    if (zapped) return;
    setZapped(true);
    onZap?.(21);
  };

  return (
    <motion.div
      className="flex flex-col h-full"
      data-tour="yakihonne-article-reader"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header with back affordance */}
      <div className="yakihonne-header">
        <button
          onClick={onBack}
          aria-label="Back to articles"
          className="p-2 -ml-2 rounded-full hover:bg-[var(--yh-surface-variant)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--yh-text-primary)]" />
        </button>
        <span className="yakihonne-header-title flex-1 text-center pr-8 truncate">
          Article
        </span>
      </div>

      {/* Scrollable article body */}
      <div className="flex-1 overflow-y-auto">
        {/* Cover Image */}
        <div className="relative">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full aspect-[16/9] object-cover"
          />
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="yakihonne-badge bg-black/60 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4">
          {/* Title */}
          <h1 className="text-2xl font-bold leading-snug text-[var(--yh-text-primary)]">
            {article.title}
          </h1>

          {/* Author + meta */}
          <div className="flex items-center gap-3 mt-4">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="yakihonne-avatar yakihonne-avatar-md"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--yh-text-primary)] text-sm truncate">
                {article.author.name}
              </p>
              {article.author.nip05 && (
                <p className="text-xs text-[var(--yh-primary)] truncate">
                  ✓ {article.author.nip05}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-[var(--yh-text-tertiary)]">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(article.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime}
            </span>
          </div>

          <div className="my-4 h-px bg-[var(--yh-border)]" />

          {/* Body paragraphs */}
          <div className="space-y-4">
            {body.map((paragraph, index) => (
              <p
                key={index}
                className="text-[15px] leading-7 text-[var(--yh-text-primary)]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="h-6" />
        </div>
      </div>

      {/* Sticky action bar: zap / comment / bookmark */}
      <div className="yakihonne-card-footer border-t border-[var(--yh-border)] bg-[var(--yh-surface)]">
        <div className="yakihonne-actions">
          <button
            onClick={() => setLiked((v) => !v)}
            className={`yakihonne-action ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span>{formatNumber(article.likes + (liked ? 1 : 0))}</span>
          </button>
          <button className="yakihonne-action hover:text-blue-500">
            <MessageCircle className="w-4 h-4" />
            <span>{formatNumber(article.comments)}</span>
          </button>
          <button
            onClick={handleZap}
            className={`yakihonne-action ${zapped ? 'text-yellow-500' : 'hover:text-yellow-500'}`}
          >
            <Zap className={`w-4 h-4 ${zapped ? 'fill-current' : ''}`} />
            <span>{formatNumber(article.zaps + (zapped ? 1 : 0))}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBookmark}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
            className={`p-2 rounded-full transition-colors ${
              isBookmarked
                ? 'text-[var(--yh-primary)] bg-[var(--yh-primary)]/10'
                : 'text-[var(--yh-text-tertiary)] hover:bg-[var(--yh-surface-variant)]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button
            aria-label="Share article"
            className="p-2 text-[var(--yh-text-tertiary)] hover:bg-[var(--yh-surface-variant)] rounded-full transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default ArticleReader;
