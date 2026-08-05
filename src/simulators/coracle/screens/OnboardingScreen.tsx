/**
 * Signup — `Onboarding.svelte`, spec §9.4. Four steps, and Coracle generates no
 * keys itself.
 *
 * Step 2 hands off to **nstart** (`start.njump.me`), a separate project. The
 * recording follows that redirect and the Polish screens after frame ~26 are
 * nstart, not Coracle. Reproducing them would be reproducing someone else's
 * app, so this stops where the client's own copy stops and states the handoff.
 *
 * Note the typography split, which is easy to get backwards: the step titles
 * are `text-2xl font-bold` LATO — sentence case, not the all-caps display face
 * — while the buttons are `.btn`, which is Staatliches and therefore caps.
 */
import React from 'react';
import { Icon } from '../components/Icon';

const STAGES = ['intro', 'keys', 'follows', 'note'] as const;
export type OnboardingStage = (typeof STAGES)[number];

interface OnboardingScreenProps {
  stage: OnboardingStage;
  onStage: (s: OnboardingStage) => void;
  onFinish: () => void;
  onExternal: (what: string) => void;
}

function StepHeader({ step, title }: { step: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <p
        style={{
          display: 'flex',
          height: '3rem',
          width: '3rem',
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '9999px',
          background: 'var(--co-neutral-700)',
          fontSize: '1.125rem',
          marginLeft: '-0.25rem',
          marginTop: '-0.5rem',
        }}
      >
        {step}
      </p>
      <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{title}</p>
    </div>
  );
}

/** The 4:3 video tiles of step 1. The real ones use bundled Unsplash photos;
 *  these are local gradients, because the photos are not ours to ship. */
function VideoTile({ label, hue, wide }: { label: string; hue: number; wide?: boolean }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        aspectRatio: '4 / 3',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: '0.75rem',
        padding: '2rem',
        textAlign: 'center',
        width: wide ? '50%' : '100%',
        background: `linear-gradient(150deg, hsl(${hue},38%,26%), hsl(${hue + 30},44%,14%))`,
      }}
    >
      <p className="co-staatliches" style={{ position: 'relative', fontSize: '2rem', color: '#fff' }}>
        {label}
      </p>
    </div>
  );
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  stage,
  onStage,
  onFinish,
  onExternal,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
    {stage === 'intro' && (
      <>
        <StepHeader step="1/4" title="New to Nostr?" />
        <p>Learn about the protocol at your own pace by watching one of our tutorial videos.</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <VideoTile label="Nostr in 30 seconds" hue={18} wide />
          <VideoTile label="Coracle deep dive" hue={186} wide />
        </div>
        <p>
          When you&apos;re ready, click below and we&apos;ll guide you through the process of
          creating an account.
        </p>
        <button
          type="button"
          className="co-btn co-btn-accent"
          style={{ textAlign: 'center' }}
          onClick={() => onStage('keys')}
        >
          Let&apos;s go!
        </button>
      </>
    )}

    {stage === 'keys' && (
      <>
        <StepHeader step="2/4" title="Create your Profile" />
        <p>
          To get you started, we&apos;ll redirect you to an app called <strong>nstart</strong>, which
          will guide you through the process of creating and securely storing your account keys.
        </p>
        <p>
          Nstart will also help you fill out your social profile, then when you&apos;re done
          you&apos;ll be sent back here to finish setting up your account.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="co-btn" onClick={() => onStage('intro')}>
            <Icon name="arrow-left" size={14} /> Back
          </button>
          <button
            type="button"
            className="co-btn co-btn-accent"
            style={{ flexGrow: 1 }}
            onClick={() => {
              onExternal('start.njump.me');
              onStage('follows');
            }}
          >
            Continue
          </button>
        </div>
      </>
    )}

    {stage === 'follows' && (
      <>
        <StepHeader step="3/4" title="Find your people" />
        <p>Pick a category to find some people to follow, or click here to search for specific accounts.</p>
        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          }}
        >
          {[
            ['Christianity', 'Followers of Jesus'],
            ['Freedom', 'Advocates for individual freedom, privacy and sovereignty'],
            ['Culture', 'People who talk about culture, art, appreciation of life'],
            ['Art, Music & Video', 'Folks who make and share things'],
          ].map(([title, description]) => (
            <div key={title} className="co-card co-card-interactive" style={{ borderRadius: '1rem' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</p>
              <p style={{ paddingBottom: '1.25rem' }}>{description}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <Icon name="info-circle" size={13} /> Following 24 people • 2 relays
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="co-btn" onClick={() => onStage('keys')}>
            <Icon name="arrow-left" size={14} /> Back
          </button>
          <button
            type="button"
            className="co-btn co-btn-accent"
            style={{ flexGrow: 1 }}
            onClick={() => onStage('note')}
          >
            Continue
          </button>
        </div>
      </>
    )}

    {stage === 'note' && (
      <>
        <StepHeader step="4/4" title="You're all set!" />
        <p>
          If you have any questions, just use the #asknostr hashtag — people are always happy to lend
          a hand.
        </p>
        <p>Now is a great time to introduce yourself to the Nostr network!</p>
        <div style={{ borderLeft: '2px solid var(--co-neutral-600)', paddingLeft: '1rem' }}>
          <textarea
            className="co-input"
            style={{ minHeight: '6rem', background: 'transparent', color: 'inherit' }}
            defaultValue="Hello world! #introductions"
            aria-label="Your first note"
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="co-btn" onClick={() => onStage('follows')}>
            <Icon name="arrow-left" size={14} /> Back
          </button>
          <button
            type="button"
            className="co-btn co-btn-accent"
            style={{ flexGrow: 1, textAlign: 'center' }}
            onClick={onFinish}
          >
            Say Hello
          </button>
        </div>
        <button type="button" className="co-link" style={{ textAlign: 'center' }} onClick={onFinish}>
          Skip and see your feed →
        </button>
      </>
    )}

    {/* Step dots — active `bg-neutral-300`, inactive `bg-neutral-500`. NOT the
        accent, which is the reflex a reproducer would follow. */}
    <div style={{ margin: '0 auto', display: 'flex', gap: '0.5rem' }}>
      {STAGES.map((s) => (
        <div
          key={s}
          style={{
            height: '0.5rem',
            width: '0.5rem',
            borderRadius: '9999px',
            background: s === stage ? 'var(--co-neutral-300)' : 'var(--co-neutral-500)',
          }}
        />
      ))}
    </div>
  </div>
);
