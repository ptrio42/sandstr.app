/**
 * Curated Primal-flavoured mock content. Layout, density, badge mix and counts
 * mirror the reference recording (docs/refs/primal/shots) so the reproduction
 * reads as the real app — but EVERY identity is invented. The recording showed
 * real users; shipping their names with fabricated posts is defamation-shaped
 * (see the header of src/data/mock/users.ts). Handles use .example domains
 * (RFC 2606, never resolve). Relay URLs are kept real on purpose: they are
 * infrastructure facts and part of fidelity, not statements by people.
 * All media = local data: URIs (getSampleImages); avatars = robohash <Avatar seed>.
 */
import { getSampleImages } from '../../../data/mock/utils';
import { registerPreviewTarget } from '../../../data/mock/previewNote';

export interface PNote {
  id: string;
  name: string;
  handle: string;
  time: string;
  legend?: boolean;
  verified?: boolean;
  body: string;
  media?: string;
  zapTop?: { amount: string; comment?: string };
  quote?: { name: string; handle: string; time: string; body: string };
  link?: { title: string; desc: string; url: string };
  replyTo?: string;
  reply: number;
  zap: string;
  like: number;
  repost: number;
}

const img = () => getSampleImages(1)[0];

export const currentUser = {
  name: 'sandy',
  handle: 'sandy.example',
  npub: 'npub1sandysandboxq7…8ga8y2eh0p58c79',
  bio: 'All-round buidler.',
  website: 'https://sandy.example',
  verified: true,
};

export const feedNotes: PNote[] = [
  {
    id: 'n-spark',
    name: 'SPARK',
    handle: 'spark@sparkwire.example',
    time: '23 hr.',
    verified: true,
    legend: true,
    body: '⚡ NEW - The city council in Milltown has voted to switch off its license-plate camera network after a residents’ petition passed 50,000 signatures in a week.\n\nCouncillors admitted nobody could name a single crime the cameras had solved.\n\n"Public distaste for the cameras is growing nationwide."',
    media: img(),
    zapTop: { amount: '777' },
    reply: 20,
    zap: '1312',
    like: 67,
    repost: 32,
  },
  {
    id: 'n-auntkay',
    name: 'auntKay42',
    handle: 'auntkay42@relayly.example',
    time: '23 hr.',
    body: 'Big Search = SEO Ad Slop + Recycled Answers + 2010s Interface\nMy local model = High Signal Data Straight from the Source + Zero Ads',
    reply: 8,
    zap: '921',
    like: 44,
    repost: 12,
  },
  {
    id: 'n-pia',
    name: 'Pia the WoT gal',
    handle: 'pia@trustgraph.example',
    time: '23 hr.',
    verified: true,
    body: '🚀 wotscout v2 just dropped.\n\nFollow graphs you can actually inspect.\n\nPick a scorer.\nPick a source.\nOne feed that stays yours end to end.\n\nQuick enough to forget it is there. Yours to retune.',
    media: img(),
    zapTop: { amount: '1389', comment: '🤘' },
    reply: 6,
    zap: '2462',
    like: 27,
    repost: 26,
  },
  {
    id: 'n-castle',
    name: 'CASTLE',
    handle: 'castle@keepwire.example',
    time: '20 hr.',
    verified: true,
    legend: true,
    body: '50k visitors 📈\n\n@KEEP WIRE',
    link: { title: 'KEEP WIRE', desc: 'high signal news', url: 'https://keepwire.example' },
    zapTop: { amount: '50 005', comment: 'Proof of work 😎😎' },
    reply: 13,
    zap: '50 388',
    like: 33,
    repost: 7,
  },
  {
    id: 'n-kessler',
    name: 'Mira Kessler',
    handle: 'mira@kessler.example',
    time: '23 hr.',
    verified: true,
    body: 'Is 40% Miner Signalling Enough For A Soft Fork?',
    reply: 4,
    zap: '188',
    like: 21,
    repost: 5,
  },
  {
    id: 'n-petal',
    name: 'petal_dev',
    handle: 'petal-dev.example',
    time: '1 day',
    body: 'petals is now serving over 2 million blobs across the network 🌸',
    quote: {
      name: 'petal_dev',
      handle: 'petal-dev.example',
      time: '23 hr.',
      body: "I don't really remember, but I was asking it questions about relay stuff and it was nice to get results that I normally cant find using regular search engines",
    },
    reply: 3,
    zap: '412',
    like: 67,
    repost: 57,
  },
];

export const liveCard = { name: 'Static Bloom Radio', started: 'Started 1 yr. ago', viewers: 8 };

export const trending = [
  { name: 'HODLR', time: '1 hr.', preview: "This is tough to do, but every time I can get into the headspace where I'm just…" },
  { name: 'Mira Kessler', time: '4 hr.', preview: '9 Myths About Bitcoin (And What Broke Them) https://media.sandbox.example/1164e2…' },
  { name: 'SPARK', time: '1 hr.', preview: "⚡🤠 SPARK - It's time for me to renew my VPN subscription. Do you have any…" },
  { name: 'freedomfran', time: '2 hr.', preview: 'Grim stuff I wonder how many people who buy these "wellness shots" ever read…' },
  { name: 'alv', time: '3 hr.', preview: 'https://media.sandbox.example/f2c0104cbb2522c186fa3f3ca068cebe5170364ae3805…' },
  { name: 'wildersoul', time: '3 hr.', preview: 'Good night, Nostr fam! Just wanna say thanks for being so nice and for lettin…' },
  { name: 'Bertking', time: '3 hr.', preview: 'People always talk about lack of money, but the real lack is of ideas and…' },
];

export const exploreFeeds = [
  { title: 'Nostr Reads', desc: 'Nostr-related long form notes', likes: 137, zaps: 37 },
  { title: 'Trending on Primal 4h', desc: 'Global trending notes in the past 4 hours', likes: 108, zaps: 121 },
  { title: 'Podcasts Reads', desc: 'Podcasts-related long form notes', likes: 53, zaps: 0 },
  { title: 'Human Rights Reads', desc: 'Human rights-related long form notes', likes: 96, zaps: 21 },
  { title: 'Technology Reads', desc: 'Technology-related long form notes', likes: 138, zaps: 21 },
  { title: 'Food Reads', desc: 'Food-related long form notes', likes: 114, zaps: 63 },
  { title: 'Gaming Reads', desc: 'Gaming-related long form notes', likes: 152, zaps: 0 },
  { title: 'Notarized Notes', desc: 'Spam-free global feed of notarized notes. notary.example.', likes: 27, zaps: 0 },
];

export const networkStats = [
  { num: '508 134', label: 'users' },
  { num: '2 760 584', label: 'zaps' },
  { num: '6.78515902', label: 'btc zapped' },
  { num: '109 104 029', label: 'public notes' },
  { num: '23 232 553', label: 'reactions' },
  { num: '503 758 309', label: 'all events' },
];

export const hotTopics = [
  'the', 'list', 'island', 'and', 'season', 'film', 'united', 'election', 'series',
  'football', 'states', 'act', 'world', 'team', 'national', 'school', 'cup', 'john', 'league',
];

export const trendingUsers = [
  { name: 'SPARK', legend: true }, { name: 'auntKay42' }, { name: 'Pia the WoT…' }, { name: 'CASTLE', legend: true },
  { name: 'Mira Kessl…' }, { name: 'D4ta D0ll' }, { name: 'Zen Zapper' }, { name: 'Konstant' },
  { name: 'UNCLE BL…' }, { name: 'Scout …' }, { name: 'Nosforall' }, { name: 'HODLR', legend: true },
  { name: 'Jo Nakagi…' }, { name: 'Ben Varga…' }, { name: 'ramble' }, { name: 'Serge' },
];

export const explorePeople = [
  { name: 'CASTLE', handle: 'castle@keepwire.example', verified: true, legend: true, bio: 'Focused on freedom tech and Bitcoin privacy.', followers: '312K' },
  { name: 'Macro Mia', handle: 'mia@macromia.example', verified: true, bio: 'Investment strategist. Macro & Bitcoin.', followers: '289K' },
  { name: 'Sat Sessions', handle: 'satsessions@satsessions.example', verified: true, bio: 'Bitcoin education, one tutorial at a time.', followers: '184K' },
  { name: 'Max Corvin', handle: 'max@corvin.example', verified: true, bio: 'Bitcoin & Lightning developer.', followers: '141K' },
  { name: 'Simply Sats', handle: 'simplysats@simplysats.example', verified: true, bio: 'Keeping it simple. Stack sats.', followers: '133K' },
  { name: 'Signal Feed', handle: 'signalfeed@signalfeed.example', verified: true, bio: 'Bitcoin media, daily.', followers: '128K' },
];

export const searchResults = [
  { name: 'jasper', handle: 'jasper@purple.example', legend: true, followers: '274K' },
  { name: 'jasper mills', handle: 'jaspermills@purple.example', legend: true, followers: '169K' },
  { name: 'Jamie Locke', handle: 'jamie@locke.example', followers: '86K' },
  { name: 'James Lavender', handle: 'james@purple.example', followers: '52K' },
  { name: '@Jaye', handle: 'jayjay@plebs.example', followers: '32K' },
  { name: 'Sana Jade', handle: 'sanajade@tunes.example', followers: '32K' },
  { name: 'Jak Spero', handle: 'jakspero@purple.example', followers: '32K' },
  { name: 'Joss Jarman', handle: 'jossjarman@fedi.examp…', followers: '18K' },
  { name: 'Abel Jame', handle: 'abel@purple.example', followers: '15K' },
  { name: 'Jamberry Flow', handle: '', followers: '13K' },
];

export type NotifType = 'follow' | 'like' | 'zap' | 'reply' | 'repost' | 'mention';
export interface PNotif {
  id: string;
  type: NotifType;
  name: string;
  legend?: boolean;
  time: string;
  note?: string;
  sats?: string;
}
export const notifications: PNotif[] = [
  { id: 'no1', type: 'follow', name: 'Ashra', time: '8h' },
  { id: 'no2', type: 'follow', name: 'Wrenlin', time: '1d' },
  { id: 'no3', type: 'follow', name: 'CometWhispers', legend: true, time: '3d' },
  { id: 'no4', type: 'follow', name: 'Nocturne', time: '3d' },
  { id: 'no5', type: 'like', name: 'Rayla', time: '3d', note: 'GM ☀️' },
  { id: 'no6', type: 'zap', name: 'Sat Circle', time: '3d', sats: '2 100', note: 'weekend project — how it started vs how its going' },
  { id: 'no7', type: 'reply', name: 'Cedar Lin', time: '4d', note: 'ck this is the way' },
  { id: 'no8', type: 'repost', name: 'Alva', time: '5d', note: 'GM 😊' },
];

export const conversations = [
  { name: 'Sat Circle 🌍', handle: 'satcircle@fund.example', time: '4mo', unread: 2 },
  { name: 'PayPerNote', handle: 'paypernote@bots.example', time: '4mo', unread: 1 },
  { name: 'Lumen Lab', handle: '', time: '5mo', unread: 54 },
  { name: 'PineHarbor', handle: '', time: '5mo', unread: 0 },
  { name: 'Slow Ride', handle: 'slowride@ride.example', time: '5mo', unread: 1 },
  { name: 'JesterHodl', handle: 'jesterhodl@jesterhodl.example', time: '7mo', unread: 8 },
  { name: 'Zapbox', handle: 'hello@wallet.example', time: '1y', unread: 1 },
  { name: 'brimsley', handle: 'brimsley@nodecrew.example', time: '1y', unread: 3 },
  { name: 'Stories for Sats', handle: '', time: '1y', unread: 4 },
];

export const profileStats = [
  { n: '3397', l: 'notes' },
  { n: '6577', l: 'replies' },
  { n: '25', l: 'reads' },
  { n: '947', l: 'media' },
  { n: '3348', l: 'zaps' },
  { n: '10', l: 'relays' },
];

export const profileMeta = { following: '2374', followers: '3514', joined: 'Joined Nostr on Dec 20, 2022' };

export const latestReads = [
  { title: 'Sleep Is Not Optional', time: '5 mo.', read: '1 minutes' },
  { title: 'Chapter 1: Rest, light and routine', time: '5 mo.', read: '1 minutes' },
];

export const popularNotes = [
  { time: '3 yr.', text: 'Looks like my bracket is busted again 😅 @npub1qz4h7e2vk9..r3dts5x0mw…' },
  { time: '3 yr.', text: "Fancy a quick puzzle 👍 I'm picking a block height 💭 Zap ⚡ this note with your…" },
  { time: '3 yr.', text: 'GM #Nostr ☀️💜👥 Shipping the beta today 😅👍…' },
  { time: '3 yr.', text: '@npub1w5tgq2v7dx..u3znf6a9pk @npub1e4rc8h0sym..d27v5xqjt4 put you…' },
  { time: '1 yr.', text: 'PURRSTR - a nostr relay that only accepts notes with cat pictures 🐱…' },
];

export const relays = [
  { url: 'wss://nos.lol/', up: true },
  { url: 'wss://nostr.mom/', up: true },
  { url: 'wss://nostr.wine/', up: true },
  { url: 'wss://purplepag.es/', up: true },
  { url: 'wss://relay.damus.io/', up: true },
  { url: 'wss://wot.utxo.one/', up: true },
  { url: 'ws://umbrel.local:4848/', up: false },
  { url: 'wss://garden.zap.cooking/', up: false },
  { url: 'wss://relay.nostr.band/', up: false },
  { url: 'wss://wot.swarmstr.com/', up: false },
];

export const bookmarkedNotes: PNote[] = [
  {
    id: 'bm1',
    name: 'Rook von Bastiat',
    handle: 'rook@offcentered.example',
    time: '1 yr.',
    replyTo: '@ivyember',
    body: "Apple doesn't support it YET. Technically possible, only a matter of time",
    reply: 1,
    zap: '0',
    like: 0,
    repost: 0,
  },
  {
    id: 'bm2',
    name: 'sandy',
    handle: 'sandy.example',
    time: '1 yr.',
    verified: true,
    body: 'Some fresh screenshots from the upcoming @Driftwood release',
    media: img(),
    reply: 4,
    zap: '210',
    like: 33,
    repost: 6,
  },
];

export const settingsMenu = [
  'Appearance', 'Home Feeds', 'Reads Feeds', 'Media Uploads', 'Muted Content',
  'Content Moderation', 'Connected Wallets', 'Notifications', 'Dev Tools', 'Network', 'Zaps',
];

export const appVersion = '3.0.119';

/**
 * "Preview your own note" (src/data/mock/previewNote.ts). Primal web curates
 * its own feed instead of reading `mockNotes`, so the top card is registered as
 * a landing spot by hand. `media` is a single image here, so only the first one
 * a pasted note carries is shown.
 */
const pristineTopNote = { body: feedNotes[0].body, media: feedNotes[0].media, link: feedNotes[0].link };
registerPreviewTarget({
  apply: (text, media, link) => {
    feedNotes[0].body = text;
    // PNote's own card shape; the unfurled description is trimmed the way the
    // curated mock ones are.
    feedNotes[0].link = link
      ? { title: link.title || link.siteName, desc: link.description.slice(0, 140), url: link.url }
      : undefined;
    // The mock image illustrated somebody else's post, so it never survives —
    // the card shows the visitor's own image, or none.
    feedNotes[0].media = media[0];
  },
  reset: () => {
    feedNotes[0].body = pristineTopNote.body;
    feedNotes[0].media = pristineTopNote.media;
    feedNotes[0].link = pristineTopNote.link;
  },
});
