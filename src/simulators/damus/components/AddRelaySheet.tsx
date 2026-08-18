import React, { useState } from 'react';
import { CopyIcon } from './icons';

interface Props {
  /** Returns false when the URL was empty or already on the list. */
  onAdd: (url: string) => boolean;
  onClose: () => void;
}

/**
 * `AddRelayView` — the sheet behind "Add relay" on the Relays screen.
 *
 * Layout is from the RECORDING (`docs/refs/damus/shots/full/t_034.jpg`), which
 * catches this sheet open: grabber, centred bold "Add relay", a divider, one
 * rounded field with a paste glyph and the placeholder "wss://some.relay.com",
 * then a full-width pink-gradient CTA repeating the title. Screen-map §8 gives
 * the height — `.presentationDetents [.height(300)]`.
 *
 * It exists because the relay filter (§6a) can only list relays you have added,
 * so this is step one of "read one relay's feed", not a side quest.
 */
export const AddRelaySheet: React.FC<Props> = ({ onAdd, onClose }) => {
  const [url, setUrl] = useState('');
  const submit = () => { if (onAdd(url)) onClose(); };

  return (
    <div className="absolute inset-0 z-[62] flex flex-col justify-end" data-tour="damus-add-relay">
      <button
        type="button"
        aria-label="Dismiss add relay"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* 300pt of an 812pt screen ≈ 37%. */}
      <div
        className="relative flex flex-col rounded-t-2xl bg-[var(--damus-bg-secondary)] shadow-2xl"
        style={{ height: '37%' }}
      >
        <div className="shrink-0 pt-2.5 pb-1 flex justify-center">
          <div className="w-9 h-1.5 rounded-full bg-[var(--damus-text-tertiary)]" />
        </div>

        <div className="shrink-0 pt-3 pb-4 text-center text-[20px] font-bold text-[var(--damus-text)]">
          Add relay
        </div>
        <div className="h-px mx-4 bg-[var(--damus-separator)]" />

        <div className="px-4 pt-5">
          {/*
            Anchored on the FIELD, not on the sheet root: the root is
            `absolute inset-0` and the tour overlay refuses to spotlight a target
            the size of the screen (docs/TOURS.md). Pointing a step at
            `damus-add-relay` produced a step with no ring at all.
          */}
          <div
            data-tour="damus-add-relay-field"
            className="flex items-center gap-3 px-3 h-[52px] rounded-xl bg-[var(--damus-bg-tertiary)]"
          >
            {/* The leading glyph is a paste affordance, not a search icon. */}
            <CopyIcon className="w-5 h-5 shrink-0 text-[var(--damus-text)]" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              placeholder="wss://some.relay.com"
              aria-label="Relay address"
              className="flex-1 bg-transparent outline-none text-[17px] text-[var(--damus-text)] placeholder:text-[var(--damus-text-secondary)]"
            />
          </div>

          <button
            type="button"
            onClick={submit}
            className="damus-btn-gradient mt-4 w-full h-[52px] rounded-xl text-[17px] font-semibold text-white"
          >
            Add relay
          </button>
        </div>
      </div>
    </div>
  );
};
