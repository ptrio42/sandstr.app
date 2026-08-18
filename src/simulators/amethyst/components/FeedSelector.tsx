import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Users, User, VolumeX, Globe, MapPin, Navigation, Table } from 'lucide-react';
import '../amethyst.theme.css';

/**
 * The app-bar feed selector ("All Follows ⌄"). Tapping it opens upstream's
 * GroupedFeedFilterDialog (FeedFilterSpinner.kt): a titled dialog whose rows are
 * bucketed into the FeedGroup enum's categories, each group drawn as its own
 * rounded card with an uppercase header. Titles and labels are verbatim from
 * res/values/strings.xml:
 *   select_list_to_filter  = "Select an option to filter the feed"
 *   feed_group_feeds/relays/interest_sets/locations/lists
 *   follow_list_kind3follows / _users_only / kind3_follows_users_only /
 *   mute_list / global / aroundme / teleport
 * Groups render only when they have entries, which is why the reference
 * recording shows five of the eight (no Hashtags, Feed Algorithms or
 * Communities on that account).
 */

type Option = { label: string; Icon: React.ComponentType<{ className?: string }> };
type Group = { title: string; options: Option[] };

const GROUPS: Group[] = [
  {
    title: 'Feeds',
    options: [
      { label: 'All Follows', Icon: Users },
      { label: 'All User Follows', Icon: User },
      { label: 'Default Follow List', Icon: Users },
      { label: 'Mute List', Icon: VolumeX },
    ],
  },
  { title: 'Relays', options: [{ label: 'Global', Icon: Globe }] },
  { title: 'Interest Sets', options: [{ label: 'Tags', Icon: User }] },
  {
    title: 'Locations',
    options: [
      { label: 'Around Me', Icon: MapPin },
      { label: 'Teleport to a place…', Icon: Navigation },
    ],
  },
  {
    title: 'Lists',
    options: [
      { label: 'List', Icon: Table },
      { label: 'mute', Icon: Table },
    ],
  },
];

export function FeedSelector({
  defaultFeed = 'All Follows', onChange,
}: {
  defaultFeed?: string;
  /** The picked feed, so the choice is not purely cosmetic (gaps ame-74). */
  onChange?: (feed: string) => void;
}) {
  const [selected, setSelected] = useState(defaultFeed);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-tour="amethyst-feed-selector"
        className="flex items-center gap-1 font-semibold text-[var(--md-on-surface)]"
      >
        {selected}
        <ChevronDown className={`w-4 h-4 text-[var(--md-on-surface-variant)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Scrim + dialog are absolute, not fixed: `fixed` escapes the phone
                screen's containing block and dims the whole host page. */}
            <div className="absolute inset-0 bg-black/60 z-[130]" onClick={() => setOpen(false)} />
            <motion.div
              role="dialog"
              aria-label="Select an option to filter the feed"
              data-tour="amethyst-feed-filter-dialog"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 500, damping: 34 }}
              className="absolute left-3 right-3 top-10 z-[140] max-h-[78%] overflow-y-auto rounded-3xl p-3"
              style={{ background: 'var(--md-surface-container-high)' }}
            >
              <p className="text-center font-medium text-[var(--md-on-surface)] py-3">
                Select an option to filter the feed
              </p>

              <div className="space-y-3">
                {GROUPS.map((g) => (
                  <div key={g.title} className="rounded-2xl overflow-hidden" style={{ background: 'var(--md-surface-container)' }}>
                    <p className="px-4 pt-3 pb-1 text-center text-xs font-medium uppercase tracking-wide text-[var(--md-on-surface-variant)]">
                      {g.title}
                    </p>
                    {g.options.map((o) => (
                      <button
                        key={o.label}
                        onClick={() => {
                          setSelected(o.label);
                          onChange?.(o.label);
                          setOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-left ${
                          o.label === selected ? 'text-[var(--md-primary)]' : 'text-[var(--md-on-surface)]'
                        }`}
                      >
                        <o.Icon className="w-5 h-5 shrink-0 text-[var(--md-on-surface-variant)]" />
                        <span className="text-[15px]">{o.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
