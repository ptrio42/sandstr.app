/**
 * Local YakiHonne content — articles, activity feed, DM list, relay orbits.
 * Modeled on the reference recording (docs/refs/yakihonne). All media are inline
 * `data:` SVG placeholders (getSampleImages) → zero remote requests, CSP-safe.
 */
import { getSampleImages, registerPreviewTarget } from '../../data/mock';
import type { LinkPreview } from '../../data/mock';

export interface YakiNoteData {
  id: string;
  name: string;
  seed: string;
  nip05?: boolean;
  zap?: boolean;
  timeAgo: string;
  content: string;
  images?: string[];
  /** "Preview your note" only — see src/data/mock/previewNote.ts. */
  linkPreview?: LinkPreview;
  reactions: number;
  replies: number;
  reposts: number;
  quotes: number;
  zaps: number; // total sats
  reactionEmoji?: string;       // emoji shown for the reaction (else default heart)
  defaultLiked?: boolean;
  zapChip?: { sats: number; from?: string; reactors?: string[] };
  quoted?: 'loading' | { name: string; content: string };
}

export interface YakiArticle {
  id: string;
  authorName: string;
  authorSeed: string;
  nip05?: boolean;
  title: string;
  summary: string;
  readMin: number;
  timeAgo: string;
  likes: number;
  comments: number;
  quotes: number;
  zaps: number;      // total sats
  cover: string;
  client?: string;   // "Posted from ..."
  body: string[];
}

const cover = () => getSampleImages(1)[0];

const ARTICLE_BODY = [
  "When I landed here about six months ago, I had no idea what I was doing (and I'm still very much figuring it out). As I've mentioned before, the only other time I ever kept an account anywhere was as a teenager, back when forums still had guestbooks and nobody carried a phone that could load one.",
  "I didn't come here because I missed feeds. If anything I was against the whole idea, which is why I skipped the last two decades of it. From the outside it seemed to take more out of the people I knew than it ever gave back to them.",
  "The beauty of this place, for me, is in the accounts with small to medium follower counts. Ordinary people, often living quiet lives, held together by a shared appetite for freedom and self-reliance. People, frequently anonymous, saying plainly what they find funny or useful or beautiful, and expecting nothing back for it.",
  "I used those first few big follows as a way in, poking through their replies and opening whatever profile looked interesting. I wandered, I replied, I zapped, I followed the people who had bothered to answer somebody else's note.",
];

export const yakiArticles: YakiArticle[] = [
  {
    id: 'art-ai',
    authorName: '霧猫', authorSeed: 'kirineko', nip05: true,
    title: 'わたしの Nostr 開発メモ', summary: 'No description',
    readMin: 1, timeAgo: '19 hours ago',
    likes: 0, comments: 0, quotes: 0, zaps: 100, cover: cover(),
    client: 'YakiHonne', body: ARTICLE_BODY,
  },
  {
    id: 'art-cbdc',
    authorName: 'Policy Pleb', authorSeed: 'policypleb', nip05: true,
    title: 'Why a State Ledger Cannot Be Opt-In',
    summary: 'Given the risks of a programmable currency, opting out has to stay a real choice.',
    readMin: 1, timeAgo: '1 day ago',
    likes: 3, comments: 0, quotes: 0, zaps: 0, cover: cover(),
    client: 'YakiHonne', body: ARTICLE_BODY,
  },
  {
    id: 'art-relay',
    authorName: '0xDevBot', authorSeed: '0xdevbot', nip05: true,
    title: 'What Running a Relay Actually Costs',
    summary: "Relay bills are quieter than relay opinions. A month of bandwidth, disk and moderation, itemised, and w…",
    readMin: 3, timeAgo: '1 day ago',
    likes: 4, comments: 0, quotes: 1, zaps: 0, cover: cover(),
    client: 'YakiHonne', body: ARTICLE_BODY,
  },
  {
    id: 'art-community',
    authorName: 'FernStructure', authorSeed: 'fernstructure', nip05: true,
    title: 'On Finding Your Footing on Nostr', summary: 'No description',
    readMin: 6, timeAgo: '1 day ago',
    likes: 20, comments: 1, quotes: 2, zaps: 1100, cover: cover(),
    client: 'YakiHonne', body: ARTICLE_BODY,
  },
  {
    id: 'art-futuro',
    authorName: 'abu pixel', authorSeed: 'abupixel', nip05: false,
    title: 'Futurology', summary: "Tomorrow is not promising us much.",
    readMin: 4, timeAgo: '1 day ago',
    likes: 0, comments: 0, quotes: 0, zaps: 0, cover: cover(),
    client: 'YakiHonne', body: ARTICLE_BODY,
  },
];

export type ActivityKind = 'smart_widget' | 'video' | 'curation' | 'article';

export interface YakiActivity {
  id: string;
  name: string;
  seed: string;
  timeAgo: string;
  kind: ActivityKind;
  subtitle: string;
}

export const yakiActivity: YakiActivity[] = [
  { id: 'a1', name: 'Pipit', seed: 'pipit', timeAgo: '6 hours ago', kind: 'smart_widget', subtitle: 'Featured Calendar Events' },
  { id: 'a2', name: 'Pipit', seed: 'pipit', timeAgo: '6 hours ago', kind: 'smart_widget', subtitle: 'Community Stream' },
  { id: 'a3', name: 'Darrin Vale', seed: 'darrinvale', timeAgo: '1 day ago', kind: 'video', subtitle: '' },
  { id: 'a4', name: 'MadMarmot2141', seed: 'madmarmot', timeAgo: '2 days ago', kind: 'curation', subtitle: 'Musical Profile' },
  { id: 'a5', name: 'ϟtella', seed: 'stella', timeAgo: '2 days ago', kind: 'article', subtitle: 'My Nostr Stuff' },
  { id: 'a6', name: 'stmarlo88', seed: 'stmarlo88', timeAgo: '2 days ago', kind: 'video', subtitle: 'Cascade Protocol' },
  { id: 'a7', name: 'Ottavino', seed: 'ottavino', timeAgo: '2 days ago', kind: 'article', subtitle: 'Longhand - Chapter 14' },
  { id: 'a8', name: 'Ottavino', seed: 'ottavino', timeAgo: '2 days ago', kind: 'article', subtitle: 'Longhand - Chapter 13' },
  { id: 'a9', name: 'Ottavino', seed: 'ottavino', timeAgo: '2 days ago', kind: 'article', subtitle: 'Longhand - Chapter 12' },
];

export interface YakiDM {
  name: string;
  seed: string;
  preview: string;
  time: string;
  unread?: boolean;
  fromYou?: boolean;
}

export const yakiDMs: YakiDM[] = [
  { name: 'Smoothsail_dev', seed: 'smoothsail', preview: 'Testing followers broadcast (sorry for spam)', time: '3mo', unread: true },
  { name: 'BitBlink', seed: 'bitblink', preview: "Yes, if it doesn't you need to contact the coor…", time: '3mo', unread: true },
  { name: 'JesterHodl', seed: 'jesterhodl', preview: 'Hi — put together a short onboarding guide…', time: '4mo', fromYou: true },
  { name: 'Sat Circle 🌍', seed: 'satcircle', preview: 'Explore 👇 more about the Sat Circle initi…', time: '4mo' },
  { name: 'Quill.Post', seed: 'quillpost', preview: 'Dm', time: '4mo' },
  { name: 'PayPerNote', seed: 'paypernote', preview: 'It was our provider. Fixed now.', time: '4mo' },
  { name: 'Aria Relay', seed: 'ariarelay', preview: 'Hey, I hope you will be able to join us for #eur…', time: '5mo' },
  { name: 'PineHarbor', seed: 'pineharbor', preview: 'nostr:nevent1qqs2f8kt7wq3ljae5gkqpdrf9…', time: '5mo', fromYou: true },
  { name: 'Slow Ride', seed: 'slowride', preview: '🙏 ✌️ 😊', time: '5mo' },
  { name: 'Jokes4Sats', seed: 'jokes4sats', preview: 'Test', time: '6mo' },
  { name: 'Zapbox', seed: 'zapbox', preview: 'Hey, can I ask you to fill this short survey, plea…', time: '6mo' },
];

export interface YakiRelay {
  domain: string;
  online: boolean;
  followedBy: number;
  latency: number;
}

export const yakiRelays: YakiRelay[] = [
  { domain: 'nostr.0x7e.xyz', online: true, followedBy: 289, latency: 312 },
  { domain: 'relay.bitcoiner.social', online: true, followedBy: 1053, latency: 604 },
  { domain: 'nostr.ch3n2k.com', online: false, followedBy: 402, latency: 1180 },
  { domain: 'nostr.lsat.org', online: true, followedBy: 158, latency: 470 },
];

export const zapPresets = [20, 100, 500, 1000, 5000, 10000, 50000, 100000];

// Curated home feed — invented personas, laid out in the reference feed's shape.
export const homeNotes: YakiNoteData[] = [
  {
    id: 'n-steak', name: 'Prairie2100', seed: 'prairie2100', nip05: true, zap: true, timeAgo: '22 minutes ago',
    content: 'Lunch time!  Its hard to beat leftover brisket for lunch, with avocado on the side. 🤤🤤',
    images: [cover()],
    reactions: 6, replies: 3, reposts: 2, quotes: 0, zaps: 177,
    zapChip: { sats: 100, from: 'Sat Kitchen', reactors: ['satkitchen', 'marina'] },
  },
  {
    id: 'n-rainy', name: 'Prairie2100', seed: 'prairie2100', nip05: true, zap: true, timeAgo: '3 hours ago',
    content: 'A dark and rainy morning up here, not typical for July on the ridge.  As soon as it  quits i need to take advantage of the moisture and get some clover seeds in the ground.\n#RainyDay',
    images: [cover()],
    reactions: 5, replies: 1, reposts: 0, quotes: 0, zaps: 31,
    reactionEmoji: '💜', defaultLiked: true,
    zapChip: { sats: 21, reactors: ['ostrich', 'zenzapper'] },
  },
  {
    id: 'n-breath', name: 'Bohemya', seed: 'bohemya', timeAgo: '5 hours ago',
    content: 'Did you know you can hack your breathing software??',
    reactions: 1, replies: 1, reposts: 0, quotes: 0, zaps: 0,
    quoted: 'loading',
  },
  {
    id: 'n-gn', name: 'Moonlark', seed: 'moonlark', nip05: true, zap: true, timeAgo: '1 hour ago',
    content: "GN 🌙\n\nSlow ambient piano is honestly the best concentration music I've ever enjoyed. My brain runs extremely smooth when listening to it.\n\nNighty night everybody! 🧡💜\n\nHere my favorite piece:",
    reactions: 3, replies: 0, reposts: 0, quotes: 0, zaps: 12,
  },
  {
    id: 'n-zen', name: 'Zen Zapper', seed: 'zenzapper', nip05: true, zap: true, timeAgo: '5 hours ago',
    content: '"Why must one talk? Often one shouldn\'t talk, but live in silence."',
    images: [cover()],
    reactions: 1, replies: 1, reposts: 0, quotes: 0, zaps: 0,
  },
  {
    id: 'n-gm', name: 'sandy', seed: 'sandy', nip05: true, zap: true, timeAgo: '6 hours ago',
    content: 'GM 😋',
    images: [cover()],
    reactions: 1, replies: 0, reposts: 0, quotes: 0, zaps: 0,
    reactionEmoji: '👍', defaultLiked: true,
  },
];


/**
 * "Preview your own note" (src/data/mock/previewNote.ts). This client curates
 * its own feed instead of reading `mockNotes`, so the top card is registered as
 * a landing spot by hand — one call, no change to how the feed renders.
 */
const pristineHomeNote = {
  content: homeNotes[0].content,
  images: homeNotes[0].images,
  linkPreview: homeNotes[0].linkPreview,
};
registerPreviewTarget({
  apply: (text, media, link) => {
    homeNotes[0].content = text;
    homeNotes[0].linkPreview = link ?? undefined;
    // The mock cover illustrated somebody else's post, so it never survives —
    // the card shows the visitor's own image, or none.
    homeNotes[0].images = media.length > 0 ? media : undefined;
  },
  reset: () => {
    homeNotes[0].content = pristineHomeNote.content;
    homeNotes[0].images = pristineHomeNote.images;
    homeNotes[0].linkPreview = pristineHomeNote.linkPreview;
  },
});
