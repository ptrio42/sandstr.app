import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, MessageCircle, Repeat, Heart, Zap, MoreVertical, Play } from 'lucide-react';
import { AppTopBar } from '../components/AppTopBar';
import { FeedSelector } from '../components/FeedSelector';
import { Avatar } from '../components/Avatar';
import '../amethyst.theme.css';

interface NotificationsScreenProps {
  onOpenDrawer?: () => void;
  onOpenSearch?: () => void;
}

const BITCOIN = 'var(--bitcoin-orange)';
const RED = '#F0407A';
const GREEN = '#22C55E';
const PURPLE = '#B69DF8';
const BLUE = '#3B9EFF';

// Real Amethyst Notifications screen (v1.12.6 screenshot): app bar + a period
// summary, a signature weekly multi-series stats chart (dual axis: counts + sats),
// then reactions grouped by type with avatar clusters.
export function NotificationsScreen({ onOpenDrawer, onOpenSearch }: NotificationsScreenProps) {
  // The period selector had a chevron and no list to open (gaps ame-26); the
  // tail item's ⋮ was a bare svg and the item itself took no tap (gaps ame-93).
  const [period, setPeriod] = useState('Today');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [itemMenu, setItemMenu] = useState(false);
  const [itemNotice, setItemNotice] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[var(--md-background)]" data-tour="amethyst-notifications">
      <AppTopBar
        onOpenDrawer={onOpenDrawer}
        onOpenSearch={onOpenSearch}
        center={<FeedSelector defaultFeed="All Follows" />}
      />

      <div className="flex-1 overflow-y-auto">
        {/* Period + totals summary */}
        <div className="flex items-center justify-between px-4 py-3 flex-wrap gap-y-2">
          <button
            type="button"
            onClick={() => setPeriodOpen(true)}
            aria-haspopup="dialog"
            data-tour="amethyst-notifications-period"
            className="flex items-center gap-1 font-semibold text-[var(--md-on-surface)]"
          >
            {period}
            <ChevronDown className="w-4 h-4 text-[var(--md-on-surface-variant)]" />
          </button>
          <div className="flex items-center gap-4 text-[var(--md-on-surface)] font-semibold">
            <span className="flex items-center gap-1.5"><MessageCircle className="w-5 h-5" style={{ color: BLUE }} />41</span>
            <span className="flex items-center gap-1.5"><Repeat className="w-5 h-5" style={{ color: GREEN }} />17</span>
            <span className="flex items-center gap-1.5"><Heart className="w-5 h-5" style={{ color: RED }} />152</span>
            <span className="flex items-center gap-1.5"><Zap className="w-5 h-5" style={{ color: BITCOIN }} />7k</span>
          </div>
        </div>

        {/* Signature weekly stats chart */}
        <div className="px-2 pb-2">
          <StatsChart />
        </div>

        {/* Reactions grouped by type */}
        <div className="border-t border-[var(--md-outline-variant)] py-1">
          {reactionGroups.map((g, i) => (
            <ReactionRow key={i} group={g} />
          ))}
        </div>

        {/* A tail notification item (release announcement) */}
        <button
          type="button"
          onClick={() => setItemNotice(true)}
          data-tour="amethyst-notification-item"
          className="w-full text-left flex gap-3 px-4 py-4 border-t border-[var(--md-outline-variant)]"
        >
          <Avatar seed="Violet Volt" className="w-11 h-11" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[var(--md-on-surface-variant)]">
              <span className="font-semibold text-[var(--md-on-surface)]">Violet Volt</span>
              <Play className="w-4 h-4" />
              <span className="text-sm" style={{ color: 'var(--md-primary)' }}>#Amethyst</span>
              <span className="text-sm ml-auto">· 2d</span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); setItemMenu(true); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); setItemMenu(true); } }}
                aria-label="Note options"
                className="p-0.5"
              >
                <MoreVertical className="w-4 h-4" />
              </span>
            </div>
            <p className="mt-1 text-[var(--md-on-surface)]">
              <span style={{ color: 'var(--md-primary)' }}>#Amethyst</span> v1.13.1: Performance Improvements
            </p>
            <p className="mt-1 text-[var(--md-on-surface-variant)] text-sm">- Moves state assignments to the main…</p>
          </div>
        </button>
      </div>

      {periodOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center px-6" role="dialog" aria-label="Period" onClick={() => setPeriodOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-full rounded-3xl py-4" style={{ background: 'var(--md-surface-container-high)' }} onClick={(e) => e.stopPropagation()}>
            <p className="px-5 pb-2 text-lg font-bold text-[var(--md-on-surface)]">Period</p>
            {['Today', 'This week', 'This month', 'All time'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => { setPeriod(p); setPeriodOpen(false); }}
                className="w-full flex items-center gap-3 px-5 py-3 text-left"
              >
                <span
                  className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center"
                  style={{ border: `2px solid ${p === period ? 'var(--md-primary)' : 'var(--md-outline)'}` }}
                >
                  {p === period && <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--md-primary)' }} />}
                </span>
                <span className="text-[16px] text-[var(--md-on-surface)]">{p}</span>
              </button>
            ))}
            <p className="px-5 pt-2 text-xs leading-relaxed" style={{ color: 'var(--amethyst-placeholder)' }}>
              The counters and the chart above are a fixed snapshot in this reproduction, so changing
              the period relabels the row and nothing else.
            </p>
          </div>
        </div>
      )}

      {itemMenu && (
        <div className="fixed inset-0 z-[140] flex items-end" onClick={() => setItemMenu(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div role="dialog" aria-label="Note options" className="relative w-full rounded-t-3xl pb-3" style={{ background: 'var(--md-surface-container-high)' }} onClick={(e) => e.stopPropagation()}>
            {['Copy Text', 'Note ID', 'Author ID', 'Broadcast', 'Mute thread', 'Block', 'Report'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setItemMenu(false)}
                className="w-full px-5 py-3 text-left"
                style={{ color: label === 'Block' || label === 'Report' ? 'var(--md-error)' : 'var(--md-on-surface)' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {itemNotice && (
        <div className="fixed inset-0 z-[140] flex items-end" onClick={() => setItemNotice(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div role="dialog" aria-label="Open note" className="relative w-full rounded-t-3xl px-5 pt-4 pb-5" style={{ background: 'var(--md-surface-container-high)' }} onClick={(e) => e.stopPropagation()}>
            <p className="text-lg font-bold text-[var(--md-on-surface)]">#Amethyst v1.13.1</p>
            <p className="text-sm mt-2 leading-relaxed text-[var(--md-on-surface-variant)]">
              Tapping a notification opens the note it is about, in the thread view.
            </p>
            <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--amethyst-placeholder)' }}>
              Simulation: this announcement is not one of the mock feed notes, so it has no thread to
              open. Tap any note in Home to see the thread view itself.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Weekly multi-series stats chart (SVG) ---------- */

const DAYS = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
const SERIES = [
  { key: 'likes', color: RED, vals: [0.52, 0.6, 0.7, 0.46, 1.0, 0.5, 0.48] },
  { key: 'reposts', color: PURPLE, vals: [0.28, 0.4, 0.36, 0.26, 0.5, 0.34, 0.12] },
  { key: 'zaps', color: BITCOIN, vals: [0.22, 0.34, 0.95, 0.4, 0.55, 0.2, 0.12] },
  { key: 'replies', color: GREEN, vals: [0.1, 0.12, 0.13, 0.08, 0.11, 0.14, 0.1] },
];

const CW = 340, CH = 190;
const PX0 = 34, PX1 = 306, PY0 = 12, PY1 = 158; // plot area
const xAt = (i: number) => PX0 + (i * (PX1 - PX0)) / (DAYS.length - 1);
const yAt = (v: number) => PY1 - v * (PY1 - PY0);

function smoothLine(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

function StatsChart() {
  const leftLabels = [339, 254, 170, 85];
  const rightLabels = ['74k', '55k', '37k', '18k'];
  const gridY = [0.9, 0.65, 0.4, 0.15];

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full" role="img" aria-label="Weekly interaction stats">
      {/* grid + axis labels */}
      {gridY.map((v, i) => {
        const y = yAt(v);
        return (
          <g key={i}>
            <line x1={PX0} y1={y} x2={PX1} y2={y} stroke="var(--md-outline-variant)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
            <text x={PX0 - 5} y={y + 3} textAnchor="end" fontSize="9" fill="var(--md-on-surface-variant)">{leftLabels[i]}</text>
            <text x={PX1 + 5} y={y + 3} textAnchor="start" fontSize="9" fill="var(--md-on-surface-variant)">{rightLabels[i]}</text>
          </g>
        );
      })}

      {/* area fills (back-to-front) + lines */}
      {SERIES.map((s) => {
        const pts = s.vals.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
        const line = smoothLine(pts);
        const area = `${line} L ${pts[pts.length - 1].x},${PY1} L ${pts[0].x},${PY1} Z`;
        return (
          <g key={s.key}>
            <path d={area} fill={s.color} opacity="0.18" />
            <path d={line} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}

      {/* x-axis day labels */}
      {DAYS.map((d, i) => (
        <text key={d} x={xAt(i)} y={CH - 6} textAnchor="middle" fontSize="9" fill="var(--md-on-surface-variant)">{d}</text>
      ))}
    </svg>
  );
}

/* ---------- Grouped reactions ---------- */

type ReactUser = { seed: string; sat?: string };
type ReactGroup = { emoji: string; users: ReactUser[] };

const reactionGroups: ReactGroup[] = [
  { emoji: '⚡', users: [
    { seed: 'z1', sat: '666' }, { seed: 'z2', sat: '21' }, { seed: 'z3', sat: '50' }, { seed: 'z4', sat: '21' },
    { seed: 'z5', sat: '21' }, { seed: 'z6', sat: '1k' }, { seed: 'z7', sat: '69' }, { seed: 'z8', sat: '5k' },
    { seed: 'z9', sat: '2' },
  ] },
  { emoji: '🔁', users: [{ seed: 'r1' }, { seed: 'r2' }, { seed: 'r3' }] },
  { emoji: '♥', users: [
    { seed: 'h1' }, { seed: 'h2' }, { seed: 'h3' }, { seed: 'h4' }, { seed: 'h5' }, { seed: 'h6' },
    { seed: 'h7' }, { seed: 'h8' }, { seed: 'h9' }, { seed: 'h10' }, { seed: 'h11' }, { seed: 'h12' }, { seed: 'h13' },
  ] },
  { emoji: '👍', users: [{ seed: 't1' }] },
  { emoji: '🔥', users: [{ seed: 'f1' }] },
  { emoji: '🤙', users: [{ seed: 'c1' }, { seed: 'c2' }, { seed: 'c3' }, { seed: 'c4' }] },
  { emoji: '👀', users: [{ seed: 'e1' }] },
];

function ReactionRow({ group }: { group: ReactGroup }) {
  return (
    <div className="flex items-start gap-2 px-4 py-1.5">
      <span className="w-6 text-lg leading-9 shrink-0 text-center">{group.emoji}</span>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {group.users.map((u, i) => (
          <div key={i} className="relative">
            <Avatar seed={u.seed} className="w-9 h-9" />
            {u.sat && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold leading-none px-0.5 rounded" style={{ color: BITCOIN, background: 'var(--md-background)' }}>
                {u.sat}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
