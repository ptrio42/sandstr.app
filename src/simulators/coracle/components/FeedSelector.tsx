/**
 * "Your Feeds" — the composable feed selector (`FeedSelector.svelte:79-141`).
 *
 * This panel is the Coracle signature. It is NOT a global third column: it is
 * the feed selector Card, which `FeedControls.svelte:99-102` promotes to a
 * fixed right sidebar at `xl` and folds back above the feed below that. So it
 * exists on the feed route and nowhere else, and the sim mirrors that.
 *
 * Every label below is verbatim, including the inconsistent casing of
 * "From People you Follow".
 */
import React from 'react';
import { Icon } from './Icon';

/** `FeedSelector.svelte:40-48` — the seven follow-scoped presets, in order. */
export const FOLLOW_FEEDS = [
  'Notes & Replies',
  'Polls',
  'Articles',
  'Media',
  'Reposts',
  'Reactions',
  'Everything',
] as const;

export type FollowFeed = (typeof FOLLOW_FEEDS)[number];

interface FeedSelectorProps {
  active: string;
  onSelect: (feed: string) => void;
  /** Opens the "not in this reproduction" toast for the Edit … affordances. */
  onEdit: (what: string) => void;
  className?: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <strong style={{ fontSize: '1rem' }}>{title}</strong>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>{children}</div>
    </div>
  );
}

export const FeedSelector: React.FC<FeedSelectorProps> = ({
  active,
  onSelect,
  onEdit,
  className = '',
}) => (
  <div
    className={`co-card ${className}`}
    // gaps cor-20: "Your Feeds" is Coracle's signature panel and had no anchor.
    data-tour="coracle-feed-selector"
    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
  >
    <p className="co-staatliches" style={{ fontSize: '1.5rem', lineHeight: 1.1 }}>
      Your Feeds
    </p>

    <Section title="From People you Follow">
      {FOLLOW_FEEDS.map((label) => (
        <button
          key={label}
          type="button"
          className={`co-chip ${active === label ? 'co-chip-accent' : ''}`}
          onClick={() => onSelect(label)}
        >
          {label}
        </button>
      ))}
    </Section>

    <Section title="Relay Feeds">
      <button type="button" className="co-chip" onClick={() => onEdit('relay feeds')}>
        <Icon name="edit" size={13} /> Edit relay feeds
      </button>
    </Section>

    <Section title="Your Lists">
      <button type="button" className="co-chip" onClick={() => onEdit('lists')}>
        <Icon name="edit" size={13} /> Edit lists
      </button>
    </Section>

    <Section title="Custom Feeds">
      <button type="button" className="co-chip" onClick={() => onEdit('feeds')}>
        <Icon name="edit" size={13} /> Edit feeds
      </button>
    </Section>
  </div>
);
