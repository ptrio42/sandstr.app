import { BookOpen, BookOpenText, Highlighter, HelpCircle, LogIn, MoreVertical, Shuffle, Timer } from 'lucide-react';
import type { ReactNode } from 'react';
import { ArticleCard } from '../components/ArticleCard';
import { NoticeCard } from '../components/NoticeCard';
import { SupportHeart } from '../components/SupportHeart';
import { IconButton, TopBar } from '../components/TopBar';
import { borisArticles, HIGHLIGHTERS, type BorisArticle } from '../borisData';
import type { MockUser } from '../../../data/mock';

/**
 * Home (ui/home/HomeScreen.kt).
 *
 * Section ORDER is HomeSections.DEFAULT (HomeSections.kt:13):
 *   continue · by you · by friends · by others · most · short · long · random
 * Each row is 232dp tall, 20dp side padding, 12dp between 140dp cards, and each
 * header is a 20dp icon + semibold titleMedium (HomeScreen.kt:820-848).
 *
 * The header TINT is not decoration — it is the highlight-author colour:
 * `by you` = mine yellow, `by friends` = orange, `by others` / `most` =
 * nostrverse purple, and the reading-oriented rows use the app's indigo
 * (HomeScreen.kt:547-654).
 *
 * Logged out, the "by others" row is titled plainly **"Recently highlighted"**
 * — the app only says "by others" once there is a "you" or a "friends" row to
 * distinguish it from (HomeScreen.kt:588-592). That single conditional is why a
 * signed-out Home reads so differently from every screenshot of a signed-in one.
 */

const SECTION_TOUR: Record<string, string> = {
  continue: 'boris-home-continue',
  yours: 'boris-home-yours',
  friends: 'boris-home-friends',
  others: 'boris-home-others',
  most: 'boris-home-most',
  short: 'boris-home-short',
  long: 'boris-home-long',
  random: 'boris-home-random',
};

function Section({
  id,
  title,
  icon,
  tint,
  items,
  progress,
  onOpen,
}: {
  id: string;
  title: string;
  icon: ReactNode;
  tint: string;
  items: BorisArticle[];
  progress: Record<string, number>;
  onOpen: (a: BorisArticle) => void;
}) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-4 pb-6" data-tour={SECTION_TOUR[id]}>
      <div className="flex items-center gap-2 px-5">
        <span className="flex h-5 w-5 items-center justify-center" style={{ color: tint }}>
          {icon}
        </span>
        <h2 className="text-[16px] font-semibold" style={{ color: 'var(--boris-on-bg)' }}>
          {title}
        </h2>
      </div>
      <div className="flex gap-3 overflow-x-auto px-5 pb-1">
        {items.map((a, i) => (
          <ArticleCard
            key={`${id}:${a.id}`}
            article={a}
            tint={tint}
            progress={progress[a.id] ?? 0}
            onOpen={() => onOpen(a)}
            // Index-gated so exactly ONE card carries the anchor — the pattern
            // docs/TOURS.md prescribes for repeated rows. Without the gate the
            // tour would resolve whichever card happened to be first in
            // document order, which is a different card per section.
            tourId={id === 'others' && i === 0 ? 'boris-home-card' : undefined}
          />
        ))}
      </div>
    </section>
  );
}

export interface HomeScreenProps {
  loggedIn: boolean;
  showFirstTime: boolean;
  showLoginPrompt: boolean;
  progress: Record<string, number>;
  onDismissFirstTime: () => void;
  onDismissLoginPrompt: () => void;
  onOpenAbout: () => void;
  onOpenLogin: () => void;
  onOpenSupport: () => void;
  onOpenProfile: (user: MockUser) => void;
  onOpenHomeSettings: () => void;
  onOpenArticle: (a: BorisArticle) => void;
}

export function HomeScreen({
  loggedIn,
  showFirstTime,
  showLoginPrompt,
  progress,
  onDismissFirstTime,
  onDismissLoginPrompt,
  onOpenAbout,
  onOpenLogin,
  onOpenSupport,
  onOpenProfile,
  onOpenHomeSettings,
  onOpenArticle,
}: HomeScreenProps) {
  const started = Object.keys(progress);
  const continueReading = borisArticles.filter((a) => started.includes(a.id));
  const yours = loggedIn ? borisArticles.filter((a) => ['commonplace-book', 'everything-draft'].includes(a.id)) : [];
  const friends = loggedIn ? borisArticles.filter((a) => ['infinite-scroll', 'slow-web', 'read-a-river'].includes(a.id)) : [];
  const others = borisArticles.filter((a) => a.highlights > 0);
  const most = [...borisArticles].filter((a) => a.highlights > 0).sort((a, b) => b.highlights - a.highlights).slice(0, 6);
  // ReadingTime.kt:8-9 — the real thresholds are 5 and 15 minutes, not a guess.
  const shortReads = borisArticles.filter((a) => a.readMinutes <= 5);
  const longReads = borisArticles.filter((a) => a.readMinutes >= 15);
  const random = borisArticles.filter((a) => a.highlights === 0 || a.readMinutes === 11);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TopBar
        tourId="boris-home-topbar"
        navigation={
          <SupportHeart
            supporters={HIGHLIGHTERS}
            onOpenSupport={onOpenSupport}
            onOpenProfile={onOpenProfile}
          />
        }
        actions={
          <>
            <IconButton label="About Boris" onClick={onOpenAbout} tourId="boris-home-about">
              <HelpCircle size={24} />
            </IconButton>
            <IconButton label="More" onClick={onOpenHomeSettings} tourId="boris-home-more">
              <MoreVertical size={24} />
            </IconButton>
          </>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {showFirstTime && (
          <NoticeCard
            tourId="boris-first-time"
            icon={<HelpCircle size={20} />}
            title="First time?"
            body="A short walk through of what Boris is and how highlighting works."
            cta="About Boris"
            onCta={onOpenAbout}
            onDismiss={onDismissFirstTime}
            dismissLabel="Dismiss welcome"
          />
        )}
        {showLoginPrompt && (
          <NoticeCard
            tourId="boris-connect"
            icon={<LogIn size={20} />}
            title="Connect?"
            body="Optional. Link a Nostr account to publish highlights and discover what your friends found interesting enough to highlight."
            cta="Log in"
            onCta={onOpenLogin}
            onDismiss={onDismissLoginPrompt}
            dismissLabel="Dismiss login prompt"
          />
        )}

        <Section
          id="continue"
          title="Continue reading"
          icon={<BookOpen size={20} />}
          tint="var(--boris-primary)"
          items={continueReading}
          progress={progress}
          onOpen={onOpenArticle}
        />
        <Section
          id="yours"
          title="Recently highlighted by you"
          icon={<Highlighter size={20} />}
          tint="var(--boris-mark-mine)"
          items={yours}
          progress={progress}
          onOpen={onOpenArticle}
        />
        <Section
          id="friends"
          title="Recently highlighted by friends"
          icon={<Highlighter size={20} />}
          tint="var(--boris-mark-friends)"
          items={friends}
          progress={progress}
          onOpen={onOpenArticle}
        />
        <Section
          id="others"
          title={loggedIn ? 'Recently highlighted by others' : 'Recently highlighted'}
          icon={<Highlighter size={20} />}
          tint="var(--boris-mark-others)"
          items={others}
          progress={progress}
          onOpen={onOpenArticle}
        />
        <Section
          id="most"
          title="Most highlighted this week"
          icon={<Highlighter size={20} />}
          tint="var(--boris-mark-others)"
          items={most}
          progress={progress}
          onOpen={onOpenArticle}
        />
        <Section
          id="short"
          title="Short reads"
          icon={<Timer size={20} />}
          tint="var(--boris-primary)"
          items={shortReads}
          progress={progress}
          onOpen={onOpenArticle}
        />
        <Section
          id="long"
          title="Long reads"
          icon={<BookOpenText size={20} />}
          tint="var(--boris-primary)"
          items={longReads}
          progress={progress}
          onOpen={onOpenArticle}
        />
        <Section
          id="random"
          title="Random unreads"
          icon={<Shuffle size={20} />}
          tint="var(--boris-primary)"
          items={random}
          progress={progress}
          onOpen={onOpenArticle}
        />
      </div>
    </div>
  );
}
