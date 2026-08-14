import React, { useState } from 'react';
import {
  Ban, ChevronRight, Eye, EyeOff, Filter, Flag, Hash, MessagesSquare, Minus, Plus, Shield, UserX,
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { WARNING_TYPES } from '../securityState';
import type { MockUser } from '../../../data/mock';
import type { SecurityState, WarningType } from '../securityState';
import '../amethyst.theme.css';

/**
 * Security Filters @ v1.13.1 — `settings/SecurityFiltersScreen.kt`.
 *
 * REBUILT: what we shipped was the v1.12.6 shape — two switches, a sensitive-content
 * chooser dialog and a three-tab strip (Blocked Users / Spammers / Hidden Words)
 * inside the screen. v1.13.1 has **no tabs at all**. It is a scrolling column of
 * two titled section cards:
 *
 *   "Filtering preferences" — five tiles, dividers between, each with a rounded
 *   icon box: Show sensitive content (an INLINE full-width segmented row, not a
 *   dialog: Warn · Show · Hide, in `WarningType.entries` order) · Filter spam ·
 *   Hide posts that violate community rules · Warn on reports, with an indented
 *   "Report warning threshold" stepper that dims when the switch is off · Max
 *   hashtags per post, a stepper whose 0 renders as "∞".
 *
 *   "Blocked content" — four navigation rows, each with a live count badge, each
 *   PUSHING its own screen: Blocked Users · Spammers · Hidden Words · Muted
 *   threads. The fourth is new to this simulator; the first three stopped being
 *   tabs.
 *
 * Every string here is `res/values/strings.xml` verbatim.
 *
 * Deliberate deviation, one: upstream enters multi-select with a long press. A
 * long press is not a gesture a mouse offers, so the rows also accept a plain
 * press-and-hold (400ms) and right-click, and the row's own "Unblock" button
 * stays available for the single-item case exactly as upstream's does.
 */

const HOLD_MS = 400;

/** Amethyst's `SettingsSection`: a title in the accent over one rounded card. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="px-1 text-sm font-semibold" style={{ color: 'var(--md-primary)' }}>
        {title}
      </p>
      <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--md-surface-container-low)' }}>
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px ml-16" style={{ background: 'var(--md-outline-variant)' }} />;
}

/** The rounded-square accent icon box every tile on this screen leads with. */
type IconType = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

function IconBox({ Icon }: { Icon: IconType }) {
  return (
    <span
      className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center"
      style={{ background: 'var(--md-primary-container)' }}
    >
      <Icon className="w-5 h-5" style={{ color: 'var(--md-on-primary-container)' }} />
    </span>
  );
}

function Tile({
  Icon, title, description, trailing, children, dim = false,
}: {
  Icon: IconType;
  title: string;
  description?: string;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
  dim?: boolean;
}) {
  return (
    <div className="px-4 py-3" style={{ opacity: dim ? 0.38 : 1 }}>
      <div className="flex items-start gap-3">
        <IconBox Icon={Icon} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--md-on-surface)]">{title}</p>
          {description && (
            <p className="text-sm leading-snug mt-0.5 text-[var(--md-on-surface-variant)]">{description}</p>
          )}
        </div>
        {trailing && <div className="shrink-0 pt-0.5">{trailing}</div>}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className="w-12 h-7 rounded-full p-0.5 flex items-center transition-colors"
      style={{
        background: on ? 'var(--md-primary)' : 'transparent',
        border: on ? 'none' : '2px solid var(--md-outline)',
        justifyContent: on ? 'flex-end' : 'flex-start',
      }}
    >
      <span
        className="rounded-full block"
        style={{
          width: on ? 24 : 16,
          height: on ? 24 : 16,
          margin: on ? 0 : 4,
          background: on ? 'var(--md-on-primary)' : 'var(--md-outline)',
        }}
      />
    </button>
  );
}

/** `SettingsStepper`: − value + , with an optional label standing in for 0. */
function Stepper({
  value, min, max, unsetLabel, enabled = true, onChange, label,
}: {
  value: number;
  min: number;
  max: number;
  unsetLabel?: string;
  enabled?: boolean;
  onChange: (v: number) => void;
  label: string;
}) {
  const step = (delta: number) => enabled && onChange(Math.min(max, Math.max(min, value + delta)));
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={!enabled || value <= min}
        aria-label={`${label}: less`}
        className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-38"
        style={{ background: 'var(--md-surface-container-high)' }}
      >
        <Minus className="w-4 h-4 text-[var(--md-on-surface)]" />
      </button>
      <span
        aria-label={`${label}: ${value}`}
        className="min-w-[3ch] text-center font-medium text-[var(--md-on-surface)]"
      >
        {unsetLabel && value === min ? unsetLabel : value}
      </span>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={!enabled || value >= max}
        aria-label={`${label}: more`}
        className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-38"
        style={{ background: 'var(--md-surface-container-high)' }}
      >
        <Plus className="w-4 h-4 text-[var(--md-on-surface)]" />
      </button>
    </div>
  );
}

/** `SettingsCountBadge`: nothing at all when the count is zero. */
function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: 'var(--md-secondary-container)', color: 'var(--md-on-secondary-container)' }}
    >
      {count}
    </span>
  );
}

function NavRow({
  Icon, title, count, onClick, tour,
}: {
  Icon: IconType;
  title: string;
  count: number;
  onClick: () => void;
  tour: string;
}) {
  return (
    <button type="button" onClick={onClick} data-tour={tour} className="w-full flex items-center gap-3 px-4 py-3 text-left">
      <IconBox Icon={Icon} />
      <span className="flex-1 min-w-0 font-medium text-[var(--md-on-surface)]">{title}</span>
      <CountBadge count={count} />
      <ChevronRight className="w-5 h-5 shrink-0 text-[var(--md-on-surface-variant)]" />
    </button>
  );
}

export type SecuritySection =
  | 'security'
  | 'security-blocked'
  | 'security-spammers'
  | 'security-hidden'
  | 'security-muted';

export function SecurityFiltersView({
  state, onOpen,
}: {
  state: SecurityState;
  onOpen: (section: SecuritySection) => void;
}) {
  return (
    <div className="px-4 py-3 space-y-5" data-tour="amethyst-security-filters">
      <Section title="Filtering preferences">
        <Tile
          Icon={Eye}
          title="Show sensitive content"
          description="Shows a warning message when the author of the post marked it as sensitive"
        >
          {/* SingleChoiceSegmentedButtonRow, full width, inline — upstream never
              opens a dialog for this. */}
          <div
            className="flex rounded-full overflow-hidden"
            role="group"
            aria-label="Show sensitive content"
            data-tour="amethyst-security-sensitive"
            style={{ border: '1px solid var(--md-outline)' }}
          >
            {WARNING_TYPES.map((t: WarningType) => {
              const selected = state.sensitive === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => state.setSensitive(t)}
                  aria-pressed={selected}
                  className="flex-1 py-1.5 text-sm"
                  style={{
                    background: selected ? 'var(--md-secondary-container)' : 'transparent',
                    color: selected ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface)',
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </Tile>

        <Divider />

        <Tile
          Icon={Filter}
          title="Filter spam"
          description="Hides posts from strangers that were exactly the same for 5 or more times"
          trailing={
            <Switch label="Filter spam" on={state.filterSpam} onToggle={() => state.setFilterSpam(!state.filterSpam)} />
          }
        />

        <Divider />

        <Tile
          Icon={Shield}
          title="Hide posts that violate community rules"
          description="Drops posts from community feeds when the community publishes a NIP-9B rules document and an event would fail it. No effect when a community has no structured rules."
          trailing={
            <Switch
              label="Hide posts that violate community rules"
              on={state.hideViolations}
              onToggle={() => state.setHideViolations(!state.hideViolations)}
            />
          }
        />

        <Divider />

        <Tile
          Icon={Flag}
          title="Warn on reports"
          description="Shows a warning message when posts or profiles have reports from your follows"
          trailing={
            <Switch label="Warn on reports" on={state.warnReports} onToggle={() => state.setWarnReports(!state.warnReports)} />
          }
        />
        {/* SettingsSubControlRow: indented under its switch and disabled with it. */}
        <div className="pl-16 pr-4 pb-3 flex items-start gap-3" style={{ opacity: state.warnReports ? 1 : 0.38 }}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--md-on-surface)]">Report warning threshold</p>
            <p className="text-xs leading-snug text-[var(--md-on-surface-variant)]">
              Warns when posts or profiles reach this many reports from people you follow
            </p>
          </div>
          <Stepper
            label="Report warning threshold"
            value={state.reportThreshold}
            min={1}
            max={999}
            enabled={state.warnReports}
            onChange={state.setReportThreshold}
          />
        </div>

        <Divider />

        <Tile
          Icon={Hash}
          title="Max hashtags per post"
          description="Hides posts with more hashtags than this limit. Set to 0 to disable"
          trailing={
            <Stepper
              label="Max hashtags per post"
              value={state.maxHashtags}
              min={0}
              max={99}
              // strings.xml security_unlimited — the literal glyph, not a word.
              unsetLabel="∞"
              onChange={state.setMaxHashtags}
            />
          }
        />
      </Section>

      <Section title="Blocked content">
        <NavRow
          Icon={UserX}
          title="Blocked Users"
          count={state.blocked.length}
          onClick={() => onOpen('security-blocked')}
          tour="amethyst-security-blocked-row"
        />
        <Divider />
        <NavRow
          Icon={Ban}
          title="Spammers"
          count={state.spammers.length}
          onClick={() => onOpen('security-spammers')}
          tour="amethyst-security-spammers-row"
        />
        <Divider />
        <NavRow
          Icon={EyeOff}
          title="Hidden Words"
          count={state.hiddenWords.length}
          onClick={() => onOpen('security-hidden')}
          tour="amethyst-security-hidden-row"
        />
        <Divider />
        <NavRow
          Icon={MessagesSquare}
          title="Muted threads"
          count={state.mutedThreads.length}
          onClick={() => onOpen('security-muted')}
          tour="amethyst-security-muted-row"
        />
      </Section>
    </div>
  );
}

/** `EmptyState`: a 48dp outline shield over the message, both centred. */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <Shield className="w-12 h-12 mb-4" style={{ color: 'var(--md-outline)' }} />
      <p className="text-[var(--md-on-surface-variant)]">{message}</p>
    </div>
  );
}

/** Press-and-hold → selection mode, the mouse-reachable stand-in for long press. */
function useHold(onHold: () => void) {
  const timer = React.useRef<number | null>(null);
  const cancel = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };
  return {
    onPointerDown: () => {
      cancel();
      timer.current = window.setTimeout(() => {
        timer.current = null;
        onHold();
      }, HOLD_MS);
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      cancel();
      onHold();
    },
  };
}

function UserListView({
  users, emptyMessage, selected, onToggle, onRelease, tour,
}: {
  users: MockUser[];
  emptyMessage: string;
  selected: string[];
  onToggle: (pubkey: string) => void;
  onRelease: (pubkeys: string[]) => void;
  tour: string;
}) {
  const selectionMode = selected.length > 0;
  if (users.length === 0) return <EmptyState message={emptyMessage} />;
  return (
    <div data-tour={tour}>
      {users.map((u) => (
        <UserRow
          key={u.pubkey}
          user={u}
          selectionMode={selectionMode}
          isSelected={selected.includes(u.pubkey)}
          onToggle={() => onToggle(u.pubkey)}
          onRelease={() => onRelease([u.pubkey])}
        />
      ))}
    </div>
  );
}

function UserRow({
  user, selectionMode, isSelected, onToggle, onRelease,
}: {
  user: MockUser;
  selectionMode: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onRelease: () => void;
}) {
  const hold = useHold(onToggle);
  return (
    <div>
      <div
        {...hold}
        onClick={() => selectionMode && onToggle()}
        className="flex items-center gap-3 px-4 py-2.5 select-none"
        style={{
          background: isSelected ? 'color-mix(in srgb, var(--md-primary) 12%, transparent)' : undefined,
          cursor: selectionMode ? 'pointer' : 'default',
        }}
      >
        <Avatar seed={user.nip05 || user.username} className="md-avatar shrink-0" />
        <span className="flex-1 min-w-0 truncate font-medium text-[var(--md-on-surface)]">
          {user.displayName}
        </span>
        {selectionMode ? (
          <span
            aria-hidden
            className="w-5 h-5 shrink-0 rounded flex items-center justify-center"
            style={{
              border: `2px solid ${isSelected ? 'var(--md-primary)' : 'var(--md-outline)'}`,
              background: isSelected ? 'var(--md-primary)' : 'transparent',
            }}
          >
            {isSelected && <span className="w-2 h-2 rounded-sm" style={{ background: 'var(--md-on-primary)' }} />}
          </span>
        ) : (
          <button
            type="button"
            onClick={onRelease}
            className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ background: 'var(--md-primary)', color: 'var(--md-on-primary)' }}
          >
            Unblock
          </button>
        )}
      </div>
      <div className="h-px" style={{ background: 'var(--amethyst-feed-divider)' }} />
    </div>
  );
}

export function BlockedUsersView({
  state, selected, onToggle,
}: {
  state: SecurityState;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <UserListView
      users={state.blocked}
      emptyMessage="You haven't blocked any users yet."
      selected={selected}
      onToggle={onToggle}
      onRelease={state.unblockUsers}
      tour="amethyst-blocked-list"
    />
  );
}

export function SpammersView({
  state, selected, onToggle,
}: {
  state: SecurityState;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  if (state.spammers.length === 0) {
    return (
      <EmptyState
        message={
          state.filterSpam
            ? 'No accounts have been flagged as spam in this session.'
            : 'Spam filtering is off, so nothing gets flagged. Turn "Filter spam" back on to start collecting this list.'
        }
      />
    );
  }
  return (
    <UserListView
      users={state.spammers}
      emptyMessage="No accounts have been flagged as spam in this session."
      selected={selected}
      onToggle={onToggle}
      onRelease={state.unmarkSpammers}
      tour="amethyst-spammers-list"
    />
  );
}

export function HiddenWordsView({
  state, selected, onToggle,
}: {
  state: SecurityState;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const selectionMode = selected.length > 0;
  const add = () => {
    state.addWord(draft);
    setDraft('');
  };

  return (
    <div className="flex flex-col min-h-full">
      {state.hiddenWords.length === 0 ? (
        <EmptyState message="No hidden words. Add a word below to hide posts containing it." />
      ) : (
        <div className="flex-1" data-tour="amethyst-hidden-list">
          {state.hiddenWords.map((w) => (
            <WordRow
              key={w}
              word={w}
              selectionMode={selectionMode}
              isSelected={selected.includes(w)}
              onToggle={() => onToggle(w)}
              onShow={() => state.showWords([w])}
            />
          ))}
        </div>
      )}

      {/* AddMuteWordTextField — docked at the bottom on a tonally elevated
          surface. The label and the placeholder are the same string upstream, so
          the field reads identically empty or filled; the trailing control is a
          text button reading "Add", dim until the field has something in it. */}
      <div
        data-tour="amethyst-hidden-words"
        className="sticky bottom-0 mt-2 px-3 py-3"
        style={{ background: 'var(--md-surface-container-high)' }}
      >
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
            placeholder="Hide new word or sentence"
            aria-label="Hide new word or sentence"
            className="md-input flex-1"
          />
          <button
            type="button"
            onClick={add}
            disabled={!draft.trim()}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              border: '1px solid var(--md-outline)',
              color: 'var(--md-primary)',
              opacity: draft.trim() ? 1 : 0.38,
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function WordRow({
  word, selectionMode, isSelected, onToggle, onShow,
}: {
  word: string;
  selectionMode: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onShow: () => void;
}) {
  const hold = useHold(onToggle);
  return (
    <div>
      <div
        {...hold}
        onClick={() => selectionMode && onToggle()}
        className="flex items-center gap-3 px-4 py-3.5 select-none"
        style={{ background: isSelected ? 'color-mix(in srgb, var(--md-primary) 12%, transparent)' : undefined }}
      >
        {/* `Text(tag, fontWeight = Bold, modifier = Modifier.weight(1f))` — the
            weight eats the row, so the word is start-aligned, not centred. */}
        <span className="flex-1 min-w-0 truncate font-bold text-[var(--md-on-surface)]">{word}</span>
        {selectionMode ? (
          <span
            aria-hidden
            className="w-5 h-5 shrink-0 rounded flex items-center justify-center"
            style={{
              border: `2px solid ${isSelected ? 'var(--md-primary)' : 'var(--md-outline)'}`,
              background: isSelected ? 'var(--md-primary)' : 'transparent',
            }}
          >
            {isSelected && <span className="w-2 h-2 rounded-sm" style={{ background: 'var(--md-on-primary)' }} />}
          </span>
        ) : (
          <button
            type="button"
            onClick={onShow}
            className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ background: 'var(--md-primary)', color: 'var(--md-on-primary)' }}
          >
            Unblock
          </button>
        )}
      </div>
      <div className="h-px" style={{ background: 'var(--amethyst-feed-divider)' }} />
    </div>
  );
}

export function MutedThreadsView({ state }: { state: SecurityState }) {
  if (state.mutedThreads.length === 0) {
    return <EmptyState message="No muted threads" />;
  }
  return (
    <div data-tour="amethyst-muted-threads-list">
      {state.mutedThreads.map((t) => (
        <div key={t.id}>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex-1 min-w-0 truncate text-[var(--md-on-surface)]">{t.title}</span>
            <button
              type="button"
              onClick={() => state.unmuteThread(t.id)}
              className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ background: 'var(--md-primary)', color: 'var(--md-on-primary)' }}
            >
              Unmute
            </button>
          </div>
          <div className="h-px" style={{ background: 'var(--amethyst-feed-divider)' }} />
        </div>
      ))}
    </div>
  );
}
