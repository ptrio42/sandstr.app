/**
 * Local YakiHonne content — articles, activity feed, DM list, relay orbits.
 * Modeled on the reference recording (docs/refs/yakihonne). All media are inline
 * `data:` SVG placeholders (getSampleImages) → zero remote requests, CSP-safe.
 */
import { getSampleImages } from '../../data/mock';

export interface YakiNoteData {
  id: string;
  name: string;
  seed: string;
  nip05?: boolean;
  zap?: boolean;
  timeAgo: string;
  content: string;
  images?: string[];
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
  "When I arrived here about six months ago, I had no idea what I was doing (and I'm still very much figuring it out). As I've written about previously, the only other time I was ever on social media of any kind was as a teenager, circa 2003-2005, on a website (there were no mobile apps at the time) called Nexopia.",
  "I came here not because I had any desire to return to social media. In fact, I was rather against the whole thing, hence my complete avoidance for the past twenty years. It seemed to be doing more harm than good to most of the people I knew who used it.",
  "The beauty of Nostr, for me, is found in the profiles with small to medium size follower counts. Random people, often living obscure lives, united by a common desire for freedom and sovereignty. People, frequently anonymous, expressing themselves honestly, telling whoever cares to listen what they find cool or interesting or beautiful.",
  "I used those initial \"celebrity\" follows as inroads into the murky community of Nostr by poking through their replies and checking out interesting profiles. I wandered, I replied, I zapped, I looked into people who had replied to other posts.",
];

export const yakiArticles: YakiArticle[] = [
  {
    id: 'art-ai',
    authorName: '雪猫', authorSeed: 'yukineko', nip05: true,
    title: 'みんなの AI 開発フロー', summary: 'No description',
    readMin: 1, timeAgo: '19 hours ago',
    likes: 0, comments: 0, quotes: 0, zaps: 100, cover: cover(),
    client: 'YakiHonne', body: ARTICLE_BODY,
  },
  {
    id: 'art-cbdc',
    authorName: 'Nick Anthony', authorSeed: 'nickanthony', nip05: true,
    title: 'CBDC Banned in United States Until 2031',
    summary: 'Given the risks of CBDCs, this passage marks a great win for financial freedom.',
    readMin: 1, timeAgo: '1 day ago',
    likes: 3, comments: 0, quotes: 0, zaps: 0, cover: cover(),
    client: 'YakiHonne', body: ARTICLE_BODY,
  },
  {
    id: 'art-relay',
    authorName: '0xDevBot', authorSeed: '0xdevbot', nip05: true,
    title: 'Where the Free-Relay Dream Falls Flat',
    summary: "Nostr's relay economy is bleeding — 95% of relays can't cover costs. The pay-wall reality, and why 0…",
    readMin: 3, timeAgo: '1 day ago',
    likes: 4, comments: 0, quotes: 1, zaps: 0, cover: cover(),
    client: 'YakiHonne', body: ARTICLE_BODY,
  },
  {
    id: 'art-community',
    authorName: 'FeynStructure', authorSeed: 'feynstructure', nip05: true,
    title: 'On Finding Your Community on Nostr', summary: 'No description',
    readMin: 6, timeAgo: '1 day ago',
    likes: 20, comments: 1, quotes: 2, zaps: 1100, cover: cover(),
    client: 'YakiHonne', body: ARTICLE_BODY,
  },
  {
    id: 'art-futuro',
    authorName: 'abu ruqayyah', authorSeed: 'aburuqayyah', nip05: false,
    title: 'Futurology', summary: "The future doesn't hold much good.",
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
  { id: 'a1', name: 'Fife', seed: 'fife', timeAgo: '6 hours ago', kind: 'smart_widget', subtitle: 'Featured Calendar Events' },
  { id: 'a2', name: 'Fife', seed: 'fife', timeAgo: '6 hours ago', kind: 'smart_widget', subtitle: 'Community Stream' },
  { id: 'a3', name: 'Dallen Older', seed: 'dallen', timeAgo: '1 day ago', kind: 'video', subtitle: '' },
  { id: 'a4', name: 'MadMonke2141', seed: 'madmonke', timeAgo: '2 days ago', kind: 'curation', subtitle: 'Musical Profile' },
  { id: 'a5', name: 'ϟtefan', seed: 'stefan', timeAgo: '2 days ago', kind: 'article', subtitle: 'My Nostr Stuff' },
  { id: 'a6', name: 'stlouie88', seed: 'stlouie88', timeAgo: '2 days ago', kind: 'video', subtitle: 'Concord Protocol' },
  { id: 'a7', name: 'Eporedano', seed: 'eporedano', timeAgo: '2 days ago', kind: 'article', subtitle: 'Consensus - Chapter 14' },
  { id: 'a8', name: 'Eporedano', seed: 'eporedano', timeAgo: '2 days ago', kind: 'article', subtitle: 'Consensus - Chapter 13' },
  { id: 'a9', name: 'Eporedano', seed: 'eporedano', timeAgo: '2 days ago', kind: 'article', subtitle: 'Consensus - Chapter 12' },
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
  { name: 'Smoothflow_dev', seed: 'smoothflow', preview: 'Testing followers broadcast (sorry for spam)', time: '3mo', unread: true },
  { name: 'BitBlick', seed: 'bitblick', preview: "Yes, if it doesn't you need to contact the coor…", time: '3mo', unread: true },
  { name: 'JokerHodl', seed: 'jokerhodl', preview: 'Cześć, zbudowałem serwis edukacyjny n…', time: '4mo', fromYou: true },
  { name: 'Bitcoin Baraza 🇰🇪', seed: 'baraza', preview: 'Explore 👇 more about the Bitcoin Baraza ini…', time: '4mo' },
  { name: 'Ostrich.Post', seed: 'ostrichpost', preview: 'Dm', time: '4mo' },
  { name: 'PayPerBit', seed: 'payperbit', preview: 'It was our provider. Fixed now.', time: '4mo' },
  { name: 'Aidra', seed: 'aidra', preview: 'Hey, I hope you will be able to join us for #eur…', time: '5mo' },
  { name: 'PandaPier', seed: 'pandapier', preview: 'nostr:nevent1qqsz22t953qvst7kccf5frfvu…', time: '5mo', fromYou: true },
  { name: 'Enjoy the ride', seed: 'enjoytheride', preview: '🙏 ✌️ 😊', time: '5mo' },
  { name: 'Japes4Sats', seed: 'japes4sats', preview: 'Test', time: '6mo' },
  { name: 'Zapmail', seed: 'zapmail', preview: 'Hey, can I ask you to fill this short survey, plea…', time: '6mo' },
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

// Curated home feed — mirrors the reference recording note-for-note.
export const homeNotes: YakiNoteData[] = [
  {
    id: 'n-steak', name: 'Mariah2100', seed: 'mariah2100', nip05: true, zap: true, timeAgo: '22 minutes ago',
    content: 'Lunch time!  Its hard to beat ribeye steak for lunch, with avocado on the side. 🤤🤤',
    images: [cover()],
    reactions: 6, replies: 3, reposts: 2, quotes: 0, zaps: 177,
    zapChip: { sats: 100, from: 'Zap Cooking', reactors: ['zapcooking', 'marina'] },
  },
  {
    id: 'n-rainy', name: 'Mariah2100', seed: 'mariah2100', nip05: true, zap: true, timeAgo: '3 hours ago',
    content: 'A dark and rainy morning for us, not typical for July in texas.  As soon as it  quits i need to take advantage of the moisture and get some buckwheat seeds in the ground.\n#RainyDay',
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
    id: 'n-gn', name: 'Marinka', seed: 'marinka', nip05: true, zap: true, timeAgo: '1 hour ago',
    content: "GN 🌙\n\nAngine de Poitrine is honestly the best concentration music I've ever enjoyed. My brain runs extremely smooth when listening to it.\n\nNighty night everybody! 🧡💜\n\nHere my favorite piece:",
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

