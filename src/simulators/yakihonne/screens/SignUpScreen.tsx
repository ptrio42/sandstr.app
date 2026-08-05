import React, { useEffect, useState } from 'react';
import { YakiMark } from '../components/YakiLogo';
import { Avatar } from '../components/Avatar';
import { ChevronLeftIcon, ChevronRightIcon, KeyIcon } from '../components/icons';

interface Props {
  onBack: () => void;
  onDone: () => void;
}

/**
 * YakiHonne "Create account" (`logify_view/signup_view.dart`).
 *
 * Reference: docs/refs/yakihonne/screen-map.md §Login / onboarding, verified
 * against the 2026-08-05 recording (shots/onboarding/t_004, t_008, t_013,
 * t_016, t_019, t_020).
 *
 * A 5-page `PageView` under one fixed "Create account" header, with a fixed
 * footer that pairs a widening page indicator (the active dot stretches into a
 * pill) with a full-width orange button — "Next" on pages 1–4, "Let's get
 * started!" on page 5. Only the last page swaps its own primary action to the
 * GREEN "Export keys"; the orange footer button stays put.
 *
 * Submitting shows the provisioning screen (logo + "Initializing account…")
 * before the feed, exactly as the real client does while it publishes kind-0.
 */

const STEPS = 5;

const PACKS = [
  { name: 'Nostr Streamers', desc: 'The top 50 most prolific live streamers on Nostr', others: 47, art: 'linear-gradient(135deg,#7a2f14,#c2410c 45%,#1e3a8a)' },
  { name: 'Nostr Minute | DYOR | DIY', desc: '#FAQ Q&A | https://nostr.org | https://soapbox…', others: 905, art: null },
  { name: 'Nostr Minute | DYOR', desc: '#FAQ Q&A | https://nostr.org | https://soapbox…', others: 882, art: null },
  { name: 'Timechain Art Magazine', desc: 'npubs from members of the Timechain Art Magazine', others: 62, art: 'linear-gradient(135deg,#f5f5f4,#d6d3d1)' },
  { name: 'Les Femmes Orange', desc: "Let's connect around the world: Les Femmes Orange", others: 43, art: null },
  { name: 'Freedom Tech Signal', desc: 'high signal accounts focused on bitcoin, nostr…', others: 119, art: null },
  { name: 'German speaking users | Deutsch sprechende', desc: 'Eine Sammlung von npubs, die auf Deutsch kommunizieren', others: 54, art: 'linear-gradient(135deg,#1e3a8a,#dc2626)' },
  { name: 'Visionairies', desc: 'Join a tribe of daring visionaries—collaborate…', others: 47, art: 'linear-gradient(135deg,#0f172a,#334155)' },
  { name: 'Desenvolvedores Nostr', desc: 'Uma lista de pessoas que constroem aplicações…', others: 130, art: 'linear-gradient(135deg,#7c3aed,#c026d3)' },
  { name: 'Artisan Traders', desc: 'Plebs & businesses growing the bitcoin circular…', others: 47, art: 'linear-gradient(135deg,#78350f,#a16207)' },
  { name: 'Photographers', desc: 'Photographers. Sfw only.', others: 2, art: 'linear-gradient(135deg,#0e7490,#155e75)' },
  { name: 'Farmstr & Permaculture', desc: '🌱🐓🐄🐝🚜', others: 45, art: 'linear-gradient(135deg,#14532d,#65a30d)' },
];

const INTERESTS = [
  { name: 'Freedom', people: 4, art: null },
  { name: 'Bitcoin', people: 4, art: 'linear-gradient(135deg,#fcd34d,#f59e0b)' },
  { name: 'News', people: 5, art: 'linear-gradient(135deg,#6b7280,#111827)' },
  { name: 'Technology', people: 3, art: 'linear-gradient(135deg,#cbd5e1,#64748b)' },
  { name: 'Travel', people: 4, art: null },
  { name: 'Social', people: 3, art: null },
  { name: 'Nostr', people: 2, art: 'linear-gradient(135deg,#a21caf,#7c3aed)' },
  { name: 'Writing', people: 4, art: 'linear-gradient(135deg,#78350f,#292524)' },
  { name: 'Food', people: 4, art: 'linear-gradient(135deg,#166534,#b91c1c)' },
];

const CLUSTER = ['ostrich', 'maria2000', 'jack', 'sandy', 'greeny', 'lost_signal'];

export const SignUpScreen: React.FC<Props> = ({ onBack, onDone }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [walletCreated, setWalletCreated] = useState(false);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    if (!initializing) return;
    const t = window.setTimeout(onDone, 1100);
    return () => window.clearTimeout(t);
  }, [initializing, onDone]);

  const back = () => (step === 0 ? onBack() : setStep((s) => s - 1));
  const next = () => (step === STEPS - 1 ? setInitializing(true) : setStep((s) => s + 1));

  const toggle = (n: string) => setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));

  if (initializing) {
    return (
      <div className="absolute inset-0 z-[66] flex flex-col items-center justify-center gap-6 bg-[var(--yh-bg)]">
        <YakiMark className="w-[9%] min-w-[30px] h-auto" color="var(--yh-text)" />
        <p className="text-[16px] text-[var(--yh-text)]">Initializing account...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[65] flex flex-col bg-[var(--yh-bg)]">
      <div className="flex items-center px-4 pt-5 pb-3 shrink-0">
        <button type="button" onClick={back} aria-label="Back" className="w-9 h-9 -ml-2 flex items-center">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center text-[19px] font-bold pr-7">Create account</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4">
        {step === 0 && (
          <DetailsStep name={name} about={about} onName={setName} onAbout={setAbout} />
        )}
        {step === 1 && <PacksStep />}
        {step === 2 && <InterestsStep picked={picked} onToggle={toggle} />}
        {step === 3 && (
          <WalletStep name={name} created={walletCreated} onCreate={() => setWalletCreated(true)} />
        )}
        {step === 4 && <PreviewStep name={name} />}
      </div>

      <div className="shrink-0 px-5 pb-6 pt-2">
        <div className="flex items-center justify-center gap-1.5 pb-3">
          {Array.from({ length: STEPS }, (_, i) => (
            <span
              key={i}
              // No CSS transition: this preview environment freezes running
              // animations, which leaves two dots stretched at once.
              className={`h-[5px] rounded-full bg-[var(--yh-text)] ${
                i === step ? 'w-[26px]' : 'w-[5px] opacity-90'
              }`}
            />
          ))}
        </div>
        <button type="button" onClick={next} className="yakihonne-btn-orange w-full py-3 text-[16px] rounded-[10px]">
          {step === STEPS - 1 ? "Let's get started!" : 'Next'}
        </button>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- step 1 */

const DetailsStep = ({
  name,
  about,
  onName,
  onAbout,
}: {
  name: string;
  about: string;
  onName: (v: string) => void;
  onAbout: (v: string) => void;
}) => (
  <>
    <h2 className="mt-1 text-[19px] font-bold">Details</h2>
    <p className="mt-1 text-[14px] text-[var(--yh-text-2)]">Share a glimpse of you, in words that feel true.</p>

    <CoverAndPicture />

    <p className="mt-2.5 text-center text-[15px] text-[var(--yh-text)]">Add picture</p>

    <input
      value={name}
      onChange={(e) => onName(e.target.value)}
      placeholder="Your name"
      autoComplete="off"
      className="mt-4 w-full h-[52px] rounded-[12px] bg-[var(--yh-surface)] px-3.5 text-[15px] text-[var(--yh-text)] placeholder:text-[var(--yh-text-2)] focus:outline-none"
    />
    <textarea
      value={about}
      onChange={(e) => onAbout(e.target.value)}
      placeholder="About you"
      rows={3}
      className="mt-2.5 w-full rounded-[12px] bg-[var(--yh-surface)] px-3.5 py-3 text-[15px] text-[var(--yh-text)] placeholder:text-[var(--yh-text-2)] focus:outline-none resize-none"
    />
  </>
);

/** Cover strip with the "Add cover" chip, and the avatar hanging off its bottom edge. */
const CoverAndPicture = () => (
  <div className="mt-4">
    <div className="relative h-[112px] rounded-[12px] bg-[var(--yh-surface)]">
      <span className="absolute right-2 top-2 rounded-[8px] bg-[var(--yh-surface-3)] px-2.5 py-1.5 text-[13px] text-[var(--yh-text)]">
        Add cover
      </span>
    </div>
    {/* the cover is `relative`, so the avatar needs its own stacking context to
        sit in front of it rather than behind */}
    <div className="relative z-10 -mt-[56px] flex justify-center">
      <PersonPlaceholder className="w-[112px] h-[112px]" />
    </div>
  </div>
);

const PersonPlaceholder = ({ className = 'w-20 h-20' }: { className?: string }) => (
  <div
    className={`${className} rounded-full bg-[var(--yh-surface)] border border-[var(--yh-border)] overflow-hidden shrink-0`}
  >
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="#d0d0d0" aria-hidden="true">
      <circle cx="32" cy="25" r="11" />
      <path d="M32 40c-10 0-18 6.5-20 15h40c-2-8.5-10-15-20-15z" />
    </svg>
  </div>
);

/* ---------------------------------------------------------------- step 2 */

const PacksStep = () => (
  <>
    <h2 className="mt-1 text-[19px] font-bold">Starter packs</h2>
    <p className="mt-1 text-[14px] leading-snug text-[var(--yh-text-2)]">
      Pick a pack and start your feed with content from its creators
    </p>

    <div className="mt-4 space-y-3.5">
      {PACKS.map((p) => (
        <div key={p.name} className="flex items-center gap-3">
          <div
            className="w-[42px] h-[42px] rounded-[10px] bg-[var(--yh-surface)] shrink-0"
            style={p.art ? { background: p.art } : undefined}
          />
          <div className="flex-1 min-w-0">
            <div className="truncate text-[16px] text-[var(--yh-text)]">{p.name}</div>
            <div className="truncate text-[13px] text-[var(--yh-text-2)]">{p.desc}</div>
            <PeopleCluster count={p.others} noun="others" />
          </div>
          <span className="w-9 h-9 rounded-[10px] bg-[var(--yh-surface)] flex items-center justify-center shrink-0">
            <ChevronRightIcon className="w-4 h-4 text-[var(--yh-text-2)]" />
          </span>
        </div>
      ))}
    </div>
  </>
);

const PeopleCluster = ({ count, noun }: { count: number; noun: string }) => (
  <div className="mt-1 flex items-center gap-2">
    <div className="flex">
      {CLUSTER.slice(0, 3).map((s, i) => (
        <Avatar
          key={s}
          seed={s}
          className={`w-[22px] h-[22px] ${i > 0 ? '-ml-2' : ''}`}
          rounded="rounded-full"
        />
      ))}
    </div>
    <span className="text-[13px] text-[var(--yh-text-2)]">
      + {count} {noun}
    </span>
  </div>
);

/* ---------------------------------------------------------------- step 3 */

const InterestsStep = ({ picked, onToggle }: { picked: string[]; onToggle: (n: string) => void }) => (
  <>
    <h2 className="mt-1 text-[19px] font-bold">Interests</h2>
    <p className="mt-1 text-[14px] text-[var(--yh-text-2)]">
      Tailor your experience by selecting your top interests
    </p>

    <div className="mt-4 space-y-3">
      {INTERESTS.map((it) => {
        const on = picked.includes(it.name);
        return (
          <div key={it.name} className="flex items-center gap-3">
            <div
              className="w-[58px] h-[58px] rounded-[14px] bg-[var(--yh-surface)] shrink-0"
              style={it.art ? { background: it.art } : undefined}
            />
            <div className="flex-1 min-w-0">
              <div className="truncate text-[16px] text-[var(--yh-text)]">{it.name}</div>
              <PeopleCluster count={it.people} noun="people" />
            </div>
            <button
              type="button"
              aria-label={`${on ? 'Remove' : 'Add'} ${it.name}`}
              aria-pressed={on}
              onClick={() => onToggle(it.name)}
              className="w-9 h-9 rounded-full bg-[var(--yh-orange)] text-white flex items-center justify-center shrink-0"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.6}>
                {on ? (
                  <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  </>
);

/* ---------------------------------------------------------------- step 4 */

const WalletStep = ({ name, created, onCreate }: { name: string; created: boolean; onCreate: () => void }) => (
  <div className="h-full flex flex-col items-center justify-center text-center">
    <div className="w-[100px] h-[100px] rounded-full bg-[var(--yh-surface)] flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M6.5 7.5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-11" strokeLinecap="round" />
        <path d="M19.5 11h-2a1.5 1.5 0 0 0 0 3h2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 7.5h8" strokeLinecap="round" />
        <circle cx="6.5" cy="12.5" r="4.5" />
        <path d="M6.5 10.5v4M4.5 12.5h4" strokeLinecap="round" />
      </svg>
    </div>

    <h2 className="mt-6 text-[23px] font-bold">Let's get started!</h2>
    <p className="mt-1.5 text-[15px] text-[var(--yh-text-2)]">Create a wallet to send and receive sats</p>

    <div className="mt-5 flex w-full items-center gap-2">
      <span className="flex-1 min-w-0 truncate rounded-full bg-[var(--yh-surface)] px-4 py-3 text-left text-[15px] text-[var(--yh-text)]">
        {name.trim() || 'Your name'}
      </span>
      <span className="shrink-0 text-[15px] text-[var(--yh-text-2)]">@wallet.yakihonne.com</span>
    </div>

    <button
      type="button"
      onClick={onCreate}
      className="mt-3 w-full rounded-[10px] border border-[var(--yh-orange)] py-3 text-[16px] text-[var(--yh-orange)]"
    >
      {created ? 'Wallet created' : 'Create wallet'}
    </button>
  </div>
);

/* ---------------------------------------------------------------- step 5 */

const PreviewStep = ({ name }: { name: string }) => (
  <>
    <div className="mt-1 h-[112px] rounded-[12px] bg-[var(--yh-surface)]" />
    <div className="relative z-10 -mt-[56px] flex justify-center">
      <PersonPlaceholder className="w-[112px] h-[112px]" />
    </div>

    <p className="mt-2.5 text-center text-[19px] text-[var(--yh-text)]">{name.trim() || 'Your name'}</p>

    <div className="mt-5 flex items-start gap-3 rounded-[12px] bg-[var(--yh-surface)] px-3.5 py-3">
      <KeyIcon className="w-6 h-6 shrink-0 text-[var(--yh-text)]" />
      <p className="text-[14px] leading-[1.45] text-[var(--yh-text)]">
        You can find your account secret key in your settings. This key is essential to secure access to your
        account. Please keep it safe and private.
      </p>
    </div>

    <button
      type="button"
      className="mt-2.5 w-full rounded-[10px] py-3 text-[16px] text-white"
      style={{ background: 'var(--yh-green)' }}
    >
      Export keys
    </button>
  </>
);

export default SignUpScreen;
