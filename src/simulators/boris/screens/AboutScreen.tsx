import { useState } from 'react';
import { ArrowLeft, Bug, Heart, Lightbulb, Zap } from 'lucide-react';
import { IconButton } from '../components/TopBar';
import { HighlighterMark } from '../components/BorisIcons';

/**
 * About Boris — the onboarding carousel (ui/about/AboutScreen.kt +
 * ui/about/AboutPages.kt).
 *
 * ELEVEN pages: an intro, then the nine features in ABOUT_FEATURES order, then
 * the "Come say hi" call to action (AboutPages.kt:82-86). Every string below is
 * verbatim from strings.xml:78-117 — this is the app introducing itself, and
 * paraphrasing it would put words in its mouth.
 *
 * The illustrations are ours. Upstream ships nine hand-drawn SVGs in
 * app/src/main/assets/features/; those are artwork, not interface facts, so
 * this draws its own abstract stand-in in the same palette rather than copying
 * them (the call THIRD-PARTY.md records for every client mark here).
 */

interface Page {
  title: string;
  body: string[];
  art: 'mark' | 'reader' | 'quiet' | 'plane' | 'swarm' | 'list' | 'zap' | 'palette' | 'lock' | 'free';
}

const PAGES: Page[] = [
  {
    title: "Hello! I'm Boris.",
    body: ["I'm a nostr-native app designed for reading and highlighting."],
    art: 'mark',
  },
  {
    title: 'Read Anywhere',
    body: [
      'Boris works on any device. Whether you prefer to read on desktop, mobile, or tablet, Boris is there for you.',
      'Your highlights, bookmarks, and settings sync across devices over nostr, so you can pick up where you left off on phone, tablet, or desktop.',
    ],
    art: 'reader',
  },
  {
    title: 'Distraction-Free',
    body: [
      'Boris aims to be a calm reader app with clean typography, beautiful design, and a focus on readability.',
      'Boris does not and will never have ads, trackers, paywalls, subscriptions, or any other distractions.',
    ],
    art: 'quiet',
  },
  {
    title: 'Airplane Mode',
    body: [
      'Boris is offline-first by design. You can read, create highlights, and browse your library without a network. When offline, Boris stores changes locally and syncs later.',
    ],
    art: 'plane',
  },
  {
    title: 'Social Highlights',
    body: [
      'Discover highlights from your friends and others, as well as long-form content from the nostrverse.',
      '"Swarm highlights" help you discover the most interesting passages, while the feed shows you nostr-native long-form content.',
    ],
    art: 'swarm',
  },
  {
    title: 'Lists, Libraries, and More',
    body: [
      'Boris turns your bookmarks into a focused reading queue. It supports public and private bookmarks, regular web URLs, and RSS feeds.',
      'Keep track of reading progress, jump to specific passages, and mark articles (and other stuff) as read.',
    ],
    art: 'list',
  },
  {
    title: 'Zap Splits',
    body: [
      'When creating highlights, Boris automatically sets up zap splits so that value flows to authors and curators alike.',
      'You have full control over all zap splits. You can change the splits as you wish or use one of the predefined presets.',
    ],
    art: 'zap',
  },
  {
    title: 'Comforting Colors',
    body: [
      'Read during the day or late at night. Boris has multiple light and dark themes tuned for long reads. Choose fonts and sizes, highlight styles, and pick colors that fit your personal choice.',
    ],
    art: 'palette',
  },
  {
    title: 'Peace of Mind',
    body: [
      'No signups, no accounts, no lock-ins. Your data lives on Nostr, and Boris renders it locally through an opinionated lens.',
      'You will never be locked out, no matter what. You are in full control of your data. All the highlights, bookmarks, and reading metadata you create will always be available to you, if you care enough to keep them around.',
    ],
    art: 'lock',
  },
  {
    title: 'Free as in Freedom',
    body: [
      'Boris is free and open-source and always will be. You can do with it what you want. Fork it, modify it, contribute to it, or just use it as is.',
      'Boris is free as in beer too, but you can send me sats if you appreciate my work.',
    ],
    art: 'free',
  },
  {
    title: 'Come say hi',
    body: ['Connect on Nostr, or open GitHub to report a bug or suggest a feature.'],
    art: 'mark',
  },
];

function Art({ kind }: { kind: Page['art'] }) {
  if (kind === 'mark') return <HighlighterMark size={112} />;
  const palette: Record<string, [string, string]> = {
    reader: ['#6366F1', '#38BDF8'],
    quiet: ['#A1A1AA', '#6366F1'],
    plane: ['#38BDF8', '#6366F1'],
    swarm: ['#9333EA', '#F97316'],
    list: ['#6366F1', '#FDE047'],
    zap: ['#FDE047', '#F97316'],
    palette: ['#F97316', '#9333EA'],
    lock: ['#6366F1', '#A1A1AA'],
    free: ['#FDE047', '#6366F1'],
  };
  const [a, b] = palette[kind] ?? ['#6366F1', '#9333EA'];
  return (
    <svg viewBox="0 0 120 120" width={112} height={112} aria-hidden>
      <circle cx="46" cy="52" r="30" fill={a} opacity="0.75" />
      <rect x="52" y="34" width="46" height="58" rx="6" fill={b} opacity="0.8" />
      <rect x="60" y="46" width="30" height="4" rx="2" fill="#18181B" opacity="0.55" />
      <rect x="60" y="56" width="30" height="4" rx="2" fill="#18181B" opacity="0.55" />
      <rect x="60" y="66" width="20" height="4" rx="2" fill="#18181B" opacity="0.55" />
    </svg>
  );
}

export function AboutScreen({ onBack, onStartReading }: { onBack: () => void; onStartReading: () => void }) {
  const [page, setPage] = useState(0);
  const current = PAGES[page];
  const last = page === PAGES.length - 1;

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ background: 'var(--boris-bg)' }} data-tour="boris-about">
      <div className="flex h-16 shrink-0 items-center pl-1">
        <IconButton label="Back" onClick={onBack}>
          <ArrowLeft size={24} />
        </IconButton>
        <span className="text-[16px] font-medium" style={{ color: 'var(--boris-on-bg)' }}>
          About Boris
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
        <Art kind={current.art} />
        <h2 className="boris-display text-[26px]" style={{ color: 'var(--boris-on-bg)' }}>
          {current.title}
        </h2>
        {current.body.map((p) => (
          <p key={p} className="text-[15px] leading-6" style={{ color: 'var(--boris-on-surface-variant)' }}>
            {p}
          </p>
        ))}

        {last && (
          <div className="flex w-full max-w-[300px] flex-col gap-3">
            {[
              { label: 'Connect on Nostr', icon: <Zap size={18} /> },
              { label: 'Report a bug', icon: <Bug size={18} /> },
              { label: 'Suggest a feature', icon: <Lightbulb size={18} /> },
              { label: 'Say thanks', icon: <Heart size={18} /> },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                className="flex h-12 items-center justify-center gap-2 rounded-lg text-[15px] font-medium"
                style={{
                  border: '1px solid var(--boris-outline)',
                  background: 'var(--boris-surface-variant)',
                  color: 'var(--boris-on-bg)',
                }}
              >
                {b.icon}
                {b.label}
              </button>
            ))}
            <button
              type="button"
              onClick={onStartReading}
              data-tour="boris-about-start"
              className="flex h-12 items-center justify-center gap-2 rounded-lg text-[15px] font-medium"
              style={{ background: 'var(--boris-primary)', color: 'var(--boris-on-primary)' }}
            >
              <HighlighterMark size={18} />
              Start reading!
            </button>
          </div>
        )}
      </div>

      {/* Pager dots — 11 pages (AboutPages.kt:82-86) */}
      <div className="flex shrink-0 items-center justify-center gap-1.5 pb-6 pt-2">
        {PAGES.map((p, i) => (
          <button
            key={p.title}
            type="button"
            aria-label={`Page ${i + 1} of ${PAGES.length}`}
            onClick={() => setPage(i)}
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: i === page ? 'var(--boris-on-bg)' : 'var(--boris-on-surface-variant)',
              opacity: i === page ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      {/* Tap zones so the carousel steps without a swipe gesture */}
      <div className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-between px-4">
        <button
          type="button"
          aria-label="Previous page"
          className="pointer-events-auto rounded-full px-3 py-2 text-[13px]"
          style={{ color: 'var(--boris-on-surface-variant)' }}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next page"
          className="pointer-events-auto rounded-full px-3 py-2 text-[13px]"
          style={{ color: 'var(--boris-on-surface-variant)' }}
          onClick={() => setPage((p) => Math.min(PAGES.length - 1, p + 1))}
        >
          ›
        </button>
      </div>
    </div>
  );
}
