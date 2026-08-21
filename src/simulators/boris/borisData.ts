/**
 * Boris mock content.
 *
 * EVERYTHING HERE IS INVENTED. Boris is a reader: whatever this file holds is
 * rendered as somebody's article, somebody's highlight and somebody's feed. A
 * real headline, a real byline or a real publication in this file would put an
 * invented body of text under a real person's name — the exact failure this
 * repo already had to clean up once (see the mock-data header in
 * src/data/mock/users.ts). So: fictional publications on `.example` domains
 * (RFC 2606, guaranteed never to resolve), fictional bylines, prose written for
 * this file.
 *
 * Shape, not substance, comes from the reference recording
 * (docs/refs/boris/screen-map.md): article lengths, read-time spreads, highlight
 * counts, timestamp formats and the mix of nostr long-form vs plain web pages
 * all match what the real app was showing.
 */

import { mockUsers } from '../../data/mock';
import type { MockUser } from '../../data/mock';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BorisBlock =
  | { type: 'p'; text: string }
  | { type: 'lead'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'image'; src: string; caption?: string };

export interface BorisArticle {
  id: string;
  title: string;
  /** the one-line description under the title in the reader header */
  summary: string;
  /** byline shown in the meta chip row for nostr long-form; web pages use the domain */
  byline?: string;
  /** set when the article is a nostr long-form event rather than a scraped web page */
  pubkey?: string;
  domain: string;
  readMinutes: number;
  published: string;
  cover: string | null;
  highlights: number;
  /** article arrived through an RSS subscription — adds the "+ RSS" chip */
  rss?: boolean;
  body: BorisBlock[];
}

export type HighlightAudience = 'mine' | 'friends' | 'nostrverse';

export interface BorisHighlight {
  id: string;
  articleId: string;
  /** text before the marked span, the marked span itself, and the text after */
  pre: string;
  mark: string;
  post: string;
  /** a second marked span in the same quote, when the real card showed two */
  mark2?: string;
  post2?: string;
  pubkey: string;
  ago: string;
  audience: HighlightAudience;
}

export interface BorisFeedItem {
  id: string;
  title: string;
  excerpt: string;
  source: string;
  ago: string;
  /** true = the row draws the generic document glyph instead of a thumbnail */
  glyph?: boolean;
  cover?: string;
}

// ---------------------------------------------------------------------------
// People — reused from the shared mock database so a Boris highlight and an
// Amethyst note are by the same invented person, not two of them.
// ---------------------------------------------------------------------------

const pick = (username: string): MockUser =>
  mockUsers.find((u) => u.username === username) ?? mockUsers[0];

export const DEMO_USER: MockUser = pick('nostrich_nina');

export const HIGHLIGHTERS: MockUser[] = [
  pick('kitbuilder'),
  pick('mapledev'),
  DEMO_USER,
];

export function userByPubkey(pubkey: string | undefined): MockUser {
  return mockUsers.find((u) => u.pubkey === pubkey) ?? DEMO_USER;
}

/** npub1… fallback the real app prints when a profile has no name yet. */
export function shortNpub(pubkey: string): string {
  return `${pubkey.slice(0, 12)}…`;
}

// ---------------------------------------------------------------------------
// Covers.
//
// Boris is the one client here whose pictures carry meaning: a reader's card is
// mostly its cover, so a generic gradient reads as "no data loaded". These are
// therefore NAMED per article rather than pulled off the shared pool — the file
// is `public/media/boris/<article-id>.webp`, and the brief each one is drawn
// against is in `public/media/README.md`. Replacing the artwork is a file drop;
// nothing here changes.
//
// `everything-draft` has no cover on purpose: it exercises the coverless path,
// where the card falls back to a section-tinted glyph (screen-map §3.3).
// ---------------------------------------------------------------------------

const cover = (id: string) => `/media/boris/${id}.webp`;

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export const borisArticles: BorisArticle[] = [
  {
    id: 'ferry-line',
    title: 'The Library at the End of the Ferry Line',
    summary:
      'A reading room with eleven members, one radiator and a waiting list. What a very small library knows that a very large one forgot.',
    domain: 'slowpaper.example',
    readMinutes: 21,
    published: 'Mar 14, 2026',
    cover: cover('ferry-line'),
    highlights: 3,
    body: [
      {
        type: 'lead',
        text: 'The ferry runs four times a day in summer and twice in winter, and on the winter schedule it is possible to visit the library on Orsay Island only by giving up the whole day to it.',
      },
      {
        type: 'p',
        text: 'I gave up the whole day. I want to tell you about it carefully, because the temptation with a place like this is to make it charming, and charm is the thing that has been killing it for forty years. It is not a charming library. It is a working one. The distinction matters more on an island than it does anywhere else.',
      },
      {
        type: 'p',
        text: 'There are eleven members. Not eleven regular visitors — eleven members, a number the librarian, Anneke Sol, can recite in the order they joined. Membership costs nothing and confers nothing except the right to take the key from the hook by the harbourmaster’s office and let yourself in when Anneke is not there, which is most of the time.',
      },
      {
        type: 'quote',
        text: 'A library that is always open is a room. A library you have to fetch a key for is an appointment you made with yourself.',
      },
      {
        type: 'p',
        text: 'Anneke said that on the walk up from the dock and then apologised for it, because she has said it before to other visitors and she thinks it sounds rehearsed. It does sound rehearsed. It is also the truest thing anybody said to me all month.',
      },
      { type: 'image', src: cover('figure-reading-room'), caption: 'The reading room, mid-afternoon, one radiator.' },
      { type: 'h2', text: 'What the shelves are for' },
      {
        type: 'p',
        text: 'The collection is nine hundred and forty volumes, which is small enough that Anneke has read most of it and remembers who else has. This is the part that does not survive scale. In a library of nine hundred books, a recommendation is a fact about two people. In a library of nine hundred thousand, a recommendation is a fact about a database.',
      },
      {
        type: 'p',
        text: 'I have spent a decade building software for readers and I have watched us solve, repeatedly and expensively, a problem this room solves with a pencil. The pencil is a card in the back of each book. You write your initials and the month. That is the entire social layer. It is better than mine.',
      },
      {
        type: 'p',
        text: 'When I said so, Anneke pointed out that the card fails completely for anyone who is not on the island, which is nearly everybody, and that a system serving eleven people is not a system, it is a habit. She is right and it does not make the pencil less good. Both things are allowed to be true at once, and I think our refusal to let them be true at once is why so much reading software feels like it was designed by someone who does not read.',
      },
      { type: 'h2', text: 'The winter schedule' },
      {
        type: 'p',
        text: 'On the two-boat schedule you arrive at ten and leave at four and you cannot leave in between. Six hours is longer than you think and shorter than a book. Anneke says most first-time visitors bring three and finish none, and that the ones who come back bring one.',
      },
      {
        type: 'p',
        text: 'I brought three. I finished none. I read forty pages of one of them four times, each time from the start, because every time the light moved I looked up, and every time I looked up I lost the thread, and every time I lost the thread I decided that starting again was cheaper than pretending I had not.',
      },
      {
        type: 'p',
        text: 'That is not a failure of attention. That is what attention is when you stop paying it in the small denominations we have all got used to. Forty pages, four times, is a hundred and sixty pages of reading and forty pages of book, and I would not trade the ratio.',
      },
      {
        type: 'p',
        text: 'The four o’clock boat was late. Anneke put the key back on the hook and walked down with me, and we stood on the dock not talking, which on an island is a full sentence.',
      },
    ],
  },
  {
    id: 'infinite-scroll',
    title: 'Against the Infinite Scroll',
    summary:
      'The scroll bar was not decoration. It was the only honest promise the web ever made about how long something would take.',
    domain: 'coldtype.example',
    readMinutes: 8,
    published: 'Jan 29, 2026',
    cover: cover('infinite-scroll'),
    highlights: 5,
    rss: true,
    body: [
      {
        type: 'lead',
        text: 'Somewhere between 2011 and 2014 we quietly deleted the one control that told a reader the truth, and almost nobody wrote it down.',
      },
      {
        type: 'p',
        text: 'A scroll bar is a contract. Its length is a claim about the size of the thing you are holding, and its position is a claim about how much of that thing you have got through. Both claims are checkable. You can drag it to the bottom and see whether the page ends where the bar said it would. Very few interface elements are falsifiable. This one was, and it was right.',
      },
      {
        type: 'p',
        text: 'Infinite scroll does not break that contract so much as decline to enter into it. The bar is still drawn, out of habit, but it now describes the amount of material that has been loaded rather than the amount that exists, which is a different quantity that happens to look the same. It shrinks as you read. A ruler that shrinks as you measure is not a ruler.',
      },
      { type: 'h2', text: 'The defence, and why it is thin' },
      {
        type: 'p',
        text: 'The defence is that people scroll more. This is true and it is not a defence, because "people scroll more" is a claim about the software’s appetite, not the reader’s. If I eat more crisps out of a bowl that is silently refilled, the correct summary is not that I wanted more crisps.',
      },
      {
        type: 'quote',
        text: 'Every interface that hides its own length is asking you to make a decision it has decided you should not be able to make.',
      },
      {
        type: 'p',
        text: 'The second defence is better: that the material genuinely is unbounded, so an honest bar would be infinitely long and therefore useless. Fine. Then draw nothing. An absent promise is more honest than a false one, and the reader can adjust. What is not defensible is drawing the shape of a promise around a thing you have decided not to promise.',
      },
      { type: 'h2', text: 'What a reader wants instead' },
      {
        type: 'p',
        text: 'Two numbers, and they are not the same number. How long is this. How far am I. Reading time answers the first and is a decent estimate; a percentage answers the second and is exact. Between them they restore what the bar used to do, and they survive on a phone, where the bar never really worked anyway.',
      },
      {
        type: 'p',
        text: 'Everything else — the progress ring, the little train that chugs along the top, the dot that fills in — is the same two numbers wearing a costume. There is nothing wrong with the costume. There is something wrong with not having the numbers underneath it.',
      },
      {
        type: 'p',
        text: 'I am not asking for the scroll bar back. I am asking for the thing it was standing in for, which is a page that is willing to tell you how big it is before you commit.',
      },
    ],
  },
  {
    id: 'commonplace-book',
    title: 'Notes on Keeping a Commonplace Book',
    summary:
      'Six months of copying sentences out by hand, and the four rules that survived.',
    byline: 'Nostrich Nina',
    pubkey: DEMO_USER.pubkey,
    domain: 'nostr',
    readMinutes: 6,
    published: 'Feb 2, 2026',
    cover: cover('commonplace-book'),
    highlights: 12,
    body: [
      {
        type: 'lead',
        text: 'I started keeping a commonplace book because I noticed I could remember where a sentence was but not what it said, which is the exact inverse of useful.',
      },
      {
        type: 'p',
        text: 'The practice is old and dull: when a sentence stops you, you copy it out somewhere permanent, by hand, with a note of where it came from. That is the whole of it. There is no system to buy. Six months in, four rules have survived contact with actual laziness.',
      },
      { type: 'h2', text: 'One: copy it or lose it' },
      {
        type: 'p',
        text: 'Highlighting is not copying. Highlighting is a promise to copy later, and later is a place where nothing happens. The copying is not storage — the storage is incidental — the copying is the reading. You find out what a sentence is made of at about the fourth word, when your hand is committed and your attention catches up.',
      },
      { type: 'h2', text: 'Two: the source goes in first' },
      {
        type: 'p',
        text: 'Write down where it came from before you write the sentence. If you do it after, you will not do it, and an unattributed sentence in your own handwriting will eventually read as your own thought. That failure mode is not hypothetical and it is embarrassing in public.',
      },
      { type: 'h2', text: 'Three: no commentary on the same day' },
      {
        type: 'p',
        text: 'What you think about a sentence on the day you meet it is mostly the excitement of having met it. Leave the margin empty. Come back in a month with a different pen. Half the entries get nothing, ever, and those are the ones that told you the truth about your taste.',
      },
      { type: 'h2', text: 'Four: it is allowed to be boring' },
      {
        type: 'p',
        text: 'A commonplace book that is a pleasure to keep is a scrapbook. The whole value is in the entries you copied out on a Tuesday, tired, because the rule said to.',
      },
      {
        type: 'quote',
        text: 'You do not keep the book so that you can find the sentence again. You keep it so that the sentence has to pass through you on the way in.',
      },
      {
        type: 'p',
        text: 'That last line is mine, six months late, in a different pen.',
      },
    ],
  },
  {
    id: 'read-a-river',
    title: 'How to Read a River',
    summary:
      'Fieldcraft for moving water: what the surface tells you, and the three mistakes that cost people a boat.',
    domain: 'fieldnotes.example',
    readMinutes: 17,
    published: 'Nov 2, 2025',
    cover: cover('read-a-river'),
    highlights: 2,
    body: [
      {
        type: 'lead',
        text: 'Water is the most legible surface in the natural world and almost nobody is taught the alphabet.',
      },
      {
        type: 'p',
        text: 'A river tells you what is under it by what it does on top. The whole skill is learning that the shapes are not decoration — every ripple is the visible half of an object, and the object is usually a rock, and the rock is usually a foot upstream of where you think it is.',
      },
      {
        type: 'p',
        text: 'Start with the V. A downstream-pointing V is a gate: deep water squeezing between two obstacles, and the safest line through. An upstream-pointing V is the obstacle itself, water piling on the front of a rock and peeling off both sides. Same letter, opposite meanings, and the difference between them has capsized more beginners than every other feature combined.',
      },
      { type: 'h2', text: 'The three mistakes' },
      {
        type: 'p',
        text: 'The first is reading the water where you are instead of where you will be. At four knots you are making decisions for a boat that is already eight metres downstream of the water you are looking at.',
      },
      {
        type: 'p',
        text: 'The second is trusting flat water. A perfectly smooth tongue of surface in a rough section is usually a deep fast channel, and occasionally a submerged ledge with a recirculating hole behind it, and the two look identical from upstream. Get out and look.',
      },
      {
        type: 'p',
        text: 'The third is the one that gets experienced people: reading the river you paddled last year. Gravel moves. A rapid you know is a rapid you knew.',
      },
    ],
  },
  {
    id: 'everything-draft',
    title: 'Everything Is a Draft',
    summary: 'A short argument for publishing the version you have.',
    byline: 'Kit Kobayashi',
    pubkey: pick('kitbuilder').pubkey,
    domain: 'nostr',
    readMinutes: 4,
    published: 'Apr 3, 2026',
    cover: null,
    highlights: 7,
    body: [
      {
        type: 'lead',
        text: 'The finished version is a genre, not a state. Nothing is finished; some things are just abandoned in a tidier position than others.',
      },
      {
        type: 'p',
        text: 'I have a folder of forty-one things that are nearly ready. Every one of them is nearly ready in the same way: one more pass, one more read, one more week. The folder is nine years old. The oldest item in it was nearly ready when I could still be described as young.',
      },
      {
        type: 'p',
        text: 'What I have slowly understood is that "nearly ready" is not a measurement of the work. It is a measurement of my nerve, wearing the work as a costume.',
      },
      {
        type: 'quote',
        text: 'Publishing is not the moment the work becomes good. It is the moment it stops being only yours, which is a different and much scarier improvement.',
      },
      {
        type: 'p',
        text: 'So here is the rule I am trying: the draft goes out when it would be useful to one specific person I can name. Not when it is right. When it is useful. The naming matters — it converts an infinite standard into a finite one, and finite standards can actually be met.',
      },
    ],
  },
  {
    id: 'ninety-nine-cent-telescope',
    title: 'The Ninety-Nine Cent Telescope',
    summary:
      'You can resolve the moons of Jupiter with a lens from a junk drawer. The hard part was never the glass.',
    domain: 'orbitspill.example',
    readMinutes: 11,
    published: 'Oct 8, 2025',
    cover: cover('ninety-nine-cent-telescope'),
    highlights: 1,
    rss: true,
    body: [
      {
        type: 'lead',
        text: 'Galileo’s telescope was worse than the one you can build this weekend out of a mailing tube and two lenses, and he found four moons with it.',
      },
      {
        type: 'p',
        text: 'This is the fact that ought to be printed on the box of every consumer telescope, right under the magnification number, which is the least useful number on the box.',
      },
      {
        type: 'p',
        text: 'Aperture gathers light. Magnification just spreads the light you already gathered over a bigger area, so a cheap instrument at 400× shows you a large dim smudge where a modest one at 40× shows you a small bright disc with detail on it. The industry sells the large smudge because the number is bigger.',
      },
      { type: 'h2', text: 'What actually stops people' },
      {
        type: 'p',
        text: 'Not optics. Three things, in order: not knowing where to point it, the wobble, and the cold. The wobble is the assassin. A mount that costs more than the tube is the single unintuitive purchase in this hobby, and it is the one that decides whether the tube gets used twice or two hundred times.',
      },
    ],
  },
  {
    id: 'lighthouse-keeper',
    title: 'What the Lighthouse Keeper Knew',
    summary:
      'Automation arrived in 1987. The log books stayed. Reading forty years of weather in one handwriting.',
    domain: 'thequietledger.example',
    readMinutes: 14,
    published: 'Dec 19, 2025',
    cover: cover('lighthouse-keeper'),
    highlights: 4,
    body: [
      {
        type: 'lead',
        text: 'The last keeper at Bram Head wrote in the log every four hours for thirty-one years, and for the last four of them there was nothing to keep.',
      },
      {
        type: 'p',
        text: 'The light had been automated in 1987. He stayed until 1991 because the paperwork to remove him was slower than the paperwork to install the machine, and in the gap he kept writing: wind, visibility, sea state, four times a day, in a hand that gets smaller every year and never gets less careful.',
      },
      {
        type: 'p',
        text: 'You can read the whole run in an afternoon. I did, and I came out of it convinced that the log is a better instrument than the machine that replaced it, and that this is not nostalgia but a claim about resolution.',
      },
      {
        type: 'quote',
        text: 'The sensor recorded the weather. The keeper recorded the weather and the fact that somebody was there to see it, which turns out to be a separate measurement.',
      },
    ],
  },
  {
    id: 'slow-web',
    title: 'The Slow Web Is Just the Web',
    summary:
      'Every "slow web" feature is a normal web feature with the growth team removed.',
    domain: 'driftpress.example',
    readMinutes: 9,
    published: 'Feb 21, 2026',
    cover: cover('slow-web'),
    highlights: 6,
    body: [
      {
        type: 'lead',
        text: 'There is no slow web. There is the web, and there is the web with a metrics dashboard pointed at it, and we have started calling the first one slow.',
      },
      {
        type: 'p',
        text: 'Take any feature from a slow-web manifesto and you will find it was standard in 2003: a page that loads once and stays loaded, content that ends, a subscription you own, a link that goes where it says. None of these were designed. They were what you got when nobody had a reason to build otherwise.',
      },
      {
        type: 'p',
        text: 'This matters because "slow" frames the thing as a lifestyle choice, an artisanal preference, a fixed gear bicycle. It is not. It is the default, restored. Restoration is a much easier argument to win than asceticism, and we keep choosing the harder one.',
      },
    ],
  },
  {
    id: 'ninth-street-bakery',
    title: 'The Bakery That Refuses to Grow',
    summary: 'Forty loaves a day, sold out by nine, for nineteen years. The maths of deliberately staying small.',
    domain: 'coldtype.example',
    readMinutes: 12,
    published: 'Jul 30, 2025',
    cover: cover('ninth-street-bakery'),
    highlights: 0,
    rss: true,
    body: [
      {
        type: 'lead',
        text: 'Forty loaves, sold out by nine, nineteen years running. Every consultant who has walked through that door has left with the same rejected proposal.',
      },
      {
        type: 'p',
        text: 'The proposal is always some version of "make eighty". The objection is never about the dough. It is about the second oven, which requires a second person, which requires a schedule, which requires a manager, which requires eighty loaves to pay for — and at the end of that chain is a business that has to sell bread rather than one that gets to bake it.',
      },
    ],
  },
];

export function articleById(id: string): BorisArticle | undefined {
  return borisArticles.find((a) => a.id === id);
}

// ---------------------------------------------------------------------------
// Highlights — the quoted context, with the marked span inside it. This is the
// unit the Feeds tab, Search and the You tab all render.
// ---------------------------------------------------------------------------

export const borisHighlights: BorisHighlight[] = [
  {
    id: 'hl-1',
    articleId: 'infinite-scroll',
    pre: 'A scroll bar is a contract. ',
    mark: 'Its length is a claim about the size of the thing you are holding, and its position is a claim about how much of that thing you have got through.',
    post: ' Both claims are checkable.',
    pubkey: pick('kitbuilder').pubkey,
    ago: '3m',
    audience: 'friends',
  },
  {
    id: 'hl-2',
    articleId: 'ferry-line',
    pre: 'In a library of nine hundred books, ',
    mark: 'a recommendation is a fact about two people.',
    post: ' In a library of nine hundred thousand, ',
    mark2: 'a recommendation is a fact about a database.',
    post2: '',
    pubkey: pick('mapledev').pubkey,
    ago: '4m',
    audience: 'nostrverse',
  },
  {
    id: 'hl-3',
    articleId: 'commonplace-book',
    pre: 'Highlighting is not copying. ',
    mark: 'Highlighting is a promise to copy later, and later is a place where nothing happens.',
    post: '',
    pubkey: DEMO_USER.pubkey,
    ago: '18m',
    audience: 'mine',
  },
  {
    id: 'hl-4',
    articleId: 'slow-web',
    pre: 'It is not. ',
    mark: 'It is the default, restored.',
    post: ' Restoration is a much easier argument to win than asceticism, and we keep choosing the harder one.',
    pubkey: pick('kitbuilder').pubkey,
    ago: '1h',
    audience: 'friends',
  },
  {
    id: 'hl-5',
    articleId: 'lighthouse-keeper',
    pre: 'The sensor recorded the weather. ',
    mark: 'The keeper recorded the weather and the fact that somebody was there to see it,',
    post: ' which turns out to be a separate measurement.',
    pubkey: pick('mapledev').pubkey,
    ago: '2h',
    audience: 'nostrverse',
  },
  {
    id: 'hl-6',
    articleId: 'everything-draft',
    pre: '',
    mark: 'Publishing is not the moment the work becomes good. It is the moment it stops being only yours,',
    post: ' which is a different and much scarier improvement.',
    pubkey: DEMO_USER.pubkey,
    ago: '2d',
    audience: 'mine',
  },
  {
    id: 'hl-7',
    articleId: 'read-a-river',
    pre: 'Gravel moves. ',
    mark: 'A rapid you know is a rapid you knew.',
    post: '',
    pubkey: pick('kitbuilder').pubkey,
    ago: '1mo',
    audience: 'friends',
  },
  {
    id: 'hl-8',
    articleId: 'ninety-nine-cent-telescope',
    pre: 'Aperture gathers light. ',
    mark: 'Magnification just spreads the light you already gathered over a bigger area,',
    post: ' so a cheap instrument at 400× shows you a large dim smudge.',
    pubkey: pick('mapledev').pubkey,
    ago: '2mo',
    audience: 'nostrverse',
  },
  {
    id: 'hl-9',
    articleId: 'infinite-scroll',
    pre: 'A ruler that shrinks as you measure ',
    mark: 'is not a ruler.',
    post: '',
    pubkey: pick('mapledev').pubkey,
    ago: '22m',
    audience: 'nostrverse',
  },
  {
    id: 'hl-10',
    articleId: 'infinite-scroll',
    pre: '',
    mark: 'Every interface that hides its own length is asking you to make a decision it has decided you should not be able to make.',
    post: '',
    pubkey: DEMO_USER.pubkey,
    ago: '1d',
    audience: 'mine',
  },
  {
    id: 'hl-11',
    articleId: 'ferry-line',
    pre: 'A library that is always open is a room. ',
    mark: 'A library you have to fetch a key for is an appointment you made with yourself.',
    post: '',
    pubkey: pick('kitbuilder').pubkey,
    ago: '6h',
    audience: 'friends',
  },
  {
    id: 'hl-12',
    articleId: 'commonplace-book',
    pre: '',
    mark: 'You do not keep the book so that you can find the sentence again. You keep it so that the sentence has to pass through you on the way in.',
    post: '',
    pubkey: pick('mapledev').pubkey,
    ago: '3d',
    audience: 'nostrverse',
  },
];

/**
 * `highlights` on an article is DERIVED, never hand-set: the reader's chip
 * counts the highlights it actually has (ReaderScreen.kt:1117), so a hand-typed
 * number on the Home card would contradict the chip the moment you opened it.
 */
for (const a of borisArticles) {
  a.highlights = borisHighlights.filter((h) => h.articleId === a.id).length;
}

// ---------------------------------------------------------------------------
// RSS rows — the "All" scope of the Feeds tab mixes highlights with plain
// article rows coming from subscribed feeds.
// ---------------------------------------------------------------------------

export const borisFeedItems: BorisFeedItem[] = [
  {
    id: 'rss-1',
    title: 'Building White Noise Inside White Noise',
    excerpt:
      'The workshop where every annoyance becomes a fresh build. This week: a fan that is quieter than the room it cools.',
    source: 'Driftpress (RSS Feed)',
    ago: '1h',
    glyph: true,
  },
  {
    id: 'rss-2',
    title: 'Field Report: Nineteen Days Without a Feed Reader',
    excerpt:
      'An experiment in going back to typing addresses in by hand, and an honest accounting of what I missed.',
    source: 'The Quiet Ledger',
    ago: '1h',
  },
  {
    id: 'rss-3',
    title: 'Winter Waves Keep Every Play Turn Bright',
    excerpt:
      'Notes from a month of cold-water swimming, mostly about the ten minutes afterwards.',
    source: 'Fieldnotes',
    ago: '2h',
    glyph: true,
  },
  {
    id: 'rss-4',
    title: 'New Features on the Site',
    excerpt: 'Search now covers the archive. Feeds can be imported from OPML. Two bugs closed.',
    source: 'Coldtype (RSS Feed)',
    ago: '3h',
    glyph: true,
  },
];

// ---------------------------------------------------------------------------
// Relays — the Relays settings screen. Fictional hosts only; a real relay URL
// here would be a claim about somebody else's infrastructure.
// ---------------------------------------------------------------------------

export interface BorisRelayRow {
  url: string;
  state: 'connected' | 'retrying';
  latency?: string;
}

export const borisReadRelays: BorisRelayRow[] = [
  { url: 'relay.example', state: 'connected' },
  { url: 'inbox.relays.example', state: 'connected' },
  { url: 'nostr.mailbox.example', state: 'connected' },
  { url: 'relay.gittr.example', state: 'connected' },
  { url: 'relay.pocketnostr.example', state: 'connected' },
  { url: 'wot.example', state: 'connected' },
  { url: 'relay.offline.example', state: 'retrying', latency: '2m' },
];

export const borisWriteRelays: BorisRelayRow[] = [
  { url: 'relay.example', state: 'connected' },
  { url: 'wot.example', state: 'connected' },
  { url: 'relay.offline.example', state: 'retrying', latency: '2m' },
];

export const borisLocalRelays: BorisRelayRow[] = [
  { url: 'localhost:4869', state: 'retrying' },
];

/** FNV-1a — the repo-wide avatar seed hash (same idiom as the other sims). */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
