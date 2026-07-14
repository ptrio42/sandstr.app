/**
 * Curated Primal-flavoured mock content, mirroring the reference recording
 * (docs/refs/primal/shots) so the reproduction reads as the real app.
 * All media = local data: URIs (getSampleImages); avatars = robohash <Avatar seed>.
 */
import { getSampleImages } from '../../../data/mock/utils';

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
  name: 'pitiunited',
  handle: 'thisbitcointhing.com',
  npub: 'npub1thisbitcoinq7…8ga8y2eh0p58c79',
  bio: 'All-round buidler.',
  website: 'https://UseLessShit.co',
  verified: true,
};

export const feedNotes: PNote[] = [
  {
    id: 'n-flash',
    name: 'FLASH',
    handle: 'flash@primal.net',
    time: '23 hr.',
    verified: true,
    legend: true,
    body: '⚡🇺🇸 NEW - Police in Houston, Texas, are panicking and have started an immediate investigation as citizens continue to destroy Flock cameras across the city.\n\nThe police are struggling to make a single arrest because nobody in the city is assisting them with the investigation.\n\n"Public distaste for the cameras is growing nationwide."',
    media: img(),
    zapTop: { amount: '777' },
    reply: 20,
    zap: '1312',
    like: 67,
    repost: 32,
  },
  {
    id: 'n-unclejim',
    name: 'uncleJim21',
    handle: 'uncleJim21@nostrly.com',
    time: '23 hr.',
    body: 'Google = SEO Ad Slop + Dog Shit Answers + 2010s Interface\nJamie = The Future + High Signal Data Straight from the Source + Zero Ads',
    reply: 8,
    zap: '921',
    like: 44,
    repost: 12,
  },
  {
    id: 'n-pip',
    name: 'Pip the WoT guy',
    handle: 'pip@vertexlab.io',
    time: '23 hr.',
    verified: true,
    body: '🚀 npub.world v2 just dropped.\n\nSearch and discovery for Nostr, done right.\n\nMultiple algorithms.\nMultiple providers.\nOne personalized, decentralized experience.\n\nSo fast to feel instant. So flexible to be yours.',
    media: img(),
    zapTop: { amount: '1389', comment: '🤘' },
    reply: 6,
    zap: '2462',
    like: 27,
    repost: 26,
  },
  {
    id: 'n-odell',
    name: 'ODELL',
    handle: 'odell@primal.net',
    time: '20 hr.',
    verified: true,
    legend: true,
    body: '50k visitors 📈\n\n@CITADEL WIRE',
    link: { title: 'CITADEL WIRE', desc: 'high signal news', url: 'https://citadelwire.com' },
    zapTop: { amount: '50 005', comment: 'Proof of work 😎😎' },
    reply: 13,
    zap: '50 388',
    like: 33,
    repost: 7,
  },
  {
    id: 'n-kratter',
    name: 'Matthew Kratter',
    handle: 'kratter@primal.net',
    time: '23 hr.',
    verified: true,
    body: 'Is 55% Miner Activation Too Low For BIP-110?',
    reply: 4,
    zap: '188',
    like: 21,
    repost: 5,
  },
  {
    id: 'n-hzrd',
    name: 'hzrd149',
    handle: 'hzrd149.com',
    time: '1 day',
    body: 'blossom is now serving over 2 million blobs across the network 🌸',
    quote: {
      name: 'hzrd149',
      handle: 'hzrd149.com',
      time: '23 hr.',
      body: "I don't really remember, but I was asking it questions about eth and solana stuff and it was nice to get results that I normally cant find using google or other search engines",
    },
    reply: 3,
    zap: '412',
    like: 67,
    repost: 57,
  },
];

export const liveCard = { name: 'NoGood Radio', started: 'Started 1 yr. ago', viewers: 8 };

export const trending = [
  { name: 'HODL', time: '1 hr.', preview: "This is tough to do, but every time I can get into the headspace where I'm just…" },
  { name: 'Matthew Kratter', time: '4 hr.', preview: '12 Attacks On Bitcoin (Happening Now) https://blossom.primal.net/1164e2864b…' },
  { name: 'FLASH', time: '1 hr.', preview: "⚡🤠 FLASH - It's time for me to renew my VPN subscription. Do you have any…" },
  { name: 'gladstein', time: '2 hr.', preview: 'Revolting I wonder how many people who drink these "energy drinks" know they…' },
  { name: 'alp', time: '3 hr.', preview: 'https://image.nostr.build/f2c0104cbb2522c186fa3f3ca068cebe5170364ae3805…' },
  { name: 'wickedsoul', time: '3 hr.', preview: 'Good night, BchNostr fam! Just wanna say thanks for being so nice and for lettin…' },
  { name: 'Benking', time: '3 hr.', preview: 'People always talk about lack of money, but the real lack is of ideas and…' },
];

export const exploreFeeds = [
  { title: 'Nostr Reads', desc: 'Nostr-related long form notes', likes: 137, zaps: 37 },
  { title: 'Trending on Primal 4h', desc: 'Global trending notes in the past 4 hours', likes: 108, zaps: 121 },
  { title: 'Podcasts Reads', desc: 'Podcasts-related long form notes', likes: 53, zaps: 0 },
  { title: 'Human Rights Reads', desc: 'Human rights-related long form notes', likes: 96, zaps: 21 },
  { title: 'Technology Reads', desc: 'Technology-related long form notes', likes: 138, zaps: 21 },
  { title: 'Food Reads', desc: 'Food-related long form notes', likes: 114, zaps: 63 },
  { title: 'Gaming Reads', desc: 'Gaming-related long form notes', likes: 152, zaps: 0 },
  { title: 'Notarized Notes', desc: 'Spam-free global feed of notarized notes. notary.electrum.org.', likes: 27, zaps: 0 },
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
  { name: 'FLASH', legend: true }, { name: 'uncleJim21' }, { name: 'Pip the WoT…' }, { name: 'ODELL', legend: true },
  { name: 'Matthew Kr…' }, { name: 'L0la L33tz' }, { name: 'Gigi' }, { name: 'Constantin' },
  { name: 'UNCLE RO…' }, { name: 'Scott …' }, { name: 'Noshole' }, { name: 'HODL', legend: true },
  { name: 'Joe Nakam…' }, { name: 'Ben Justma…' }, { name: 'rabble' }, { name: 'Sergio' },
];

export const explorePeople = [
  { name: 'ODELL', handle: 'odell@primal.net', verified: true, legend: true, bio: 'Focused on freedom tech and Bitcoin privacy.', followers: '312K' },
  { name: 'Lyn Alden', handle: 'lyn@lynalden.com', verified: true, bio: 'Investment strategist. Macro & Bitcoin.', followers: '289K' },
  { name: 'BTC Sessions', handle: 'btcsessions@primal.net', verified: true, bio: 'Bitcoin education, one tutorial at a time.', followers: '184K' },
  { name: 'Matt Corallo', handle: 'matt@bluematt.me', verified: true, bio: 'Bitcoin & Lightning developer.', followers: '141K' },
  { name: 'Simply Bitcoin', handle: 'simplybitcoin@primal.net', verified: true, bio: 'Keeping it simple. Stack sats.', followers: '133K' },
  { name: 'TFTC', handle: 'tftc@primal.net', verified: true, bio: 'Tales From The Crypt. Bitcoin media.', followers: '128K' },
];

export const searchResults = [
  { name: 'jack', handle: 'jack@primal.net', legend: true, followers: '274K' },
  { name: 'jack mallers', handle: 'jackmallers@primal.net', legend: true, followers: '169K' },
  { name: 'Jameson Lopp', handle: 'lopp@lopp.net', followers: '86K' },
  { name: 'James Lavish', handle: 'james@primal.net', followers: '52K' },
  { name: '@Jay', handle: 'jayjay@nostrplebs.com', followers: '32K' },
  { name: 'Sara Jade', handle: 'sarajade@tunestr.io', followers: '32K' },
  { name: 'Jack Spirko', handle: 'jackspirko@primal.net', followers: '32K' },
  { name: 'Jeff Jarvis', handle: 'jeffjarvis@mastodon-soci…', followers: '18K' },
  { name: 'Abel James', handle: 'Abel@primal.net', followers: '15K' },
  { name: 'Jammalynn Flower', handle: '', followers: '13K' },
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
  { id: 'no1', type: 'follow', name: 'Ashna', time: '8h' },
  { id: 'no2', type: 'follow', name: 'Wrestin', time: '1d' },
  { id: 'no3', type: 'follow', name: 'CosmicWhispers', legend: true, time: '3d' },
  { id: 'no4', type: 'follow', name: 'tzongocu', time: '3d' },
  { id: 'no5', type: 'like', name: 'Rasha', time: '3d', note: 'GM ☀️' },
  { id: 'no6', type: 'zap', name: 'Bitcoin Makueni', time: '3d', sats: '2 100', note: 'weekend project — how it started vs how its going' },
  { id: 'no7', type: 'reply', name: 'Christian Larsen', time: '4d', note: 'ck this is the way' },
  { id: 'no8', type: 'repost', name: 'Adam', time: '5d', note: 'GM 😊' },
];

export const conversations = [
  { name: 'Bitcoin Makueni 🇰🇪', handle: 'bitcoinmakueni@geyser.fund', time: '4mo', unread: 2 },
  { name: 'PayPerQ', handle: 'payperq@nostr.lol', time: '4mo', unread: 1 },
  { name: 'Holoboard.space', handle: '', time: '5mo', unread: 54 },
  { name: 'PandaPark', handle: '', time: '5mo', unread: 0 },
  { name: 'Enjoy the ride', handle: 'enjoytheride@rizful.com', time: '5mo', unread: 1 },
  { name: 'JesterHodl', handle: 'jesterhodl@jesterhodl.com', time: '7mo', unread: 8 },
  { name: 'Alby', handle: 'hello@getalby.com', time: '1y', unread: 1 },
  { name: 'binsky', handle: 'Binsky@noderunners.org', time: '1y', unread: 3 },
  { name: 'Stories for Satoshis', handle: '', time: '1y', unread: 4 },
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
  { title: 'Fat Is Not Optional', time: '5 mo.', read: '1 minutes' },
  { title: 'Chapter 1: Meat, fat and simplicity', time: '5 mo.', read: '1 minutes' },
];

export const popularNotes = [
  { time: '3 yr.', text: 'Looks like 69ers are way behind again 😅 @npub138guayty78..pekq6wk36k…' },
  { time: '3 yr.', text: "Wanna try a little game 👍 I'm thinking of a number 💭 Zap ⚡ this note with an…" },
  { time: '3 yr.', text: 'GM #Nostr ☀️💜👥 Getting married today 😅👍…' },
  { time: '3 yr.', text: '@npub1dqg3at6cma..sn0szs3643 @npub1dy7zsvk7jw..78as6hljz5 put you…' },
  { time: '1 yr.', text: 'CATSTRR - a nostr relay that only accepts notes with cat pictures 🐱…' },
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
    name: 'Robin von Mises',
    handle: 'robin@excentered.com',
    time: '1 yr.',
    replyTo: '@ivycharcoal',
    body: "Apple doesn't support it YET. Technically possible, only a matter of time",
    reply: 1,
    zap: '0',
    like: 0,
    repost: 0,
  },
  {
    id: 'bm2',
    name: 'pitiunited',
    handle: 'thisbitcointhing.com',
    time: '1 yr.',
    verified: true,
    body: 'Some fresh screenshots from the upcoming @Ghost of Swarmstr release',
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
