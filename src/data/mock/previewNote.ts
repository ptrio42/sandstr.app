/**
 * "Paste your note, see how it looks in every client."
 *
 * Most of the feature is one mutation. Every feed-carrying simulator reads
 * `mockNotes` and — this is the load-bearing part — the derived modules hold
 * REFERENCES to the same note objects, not copies: Nostur wraps them
 * (`authored()` returns `{ note, author }`), Wisp and Coracle take
 * `mockNotes.slice(0, 25)`, which copies the array and not its members. So
 * overwriting the FIRST note's fields in place reaches all of them without a
 * single edit inside those clients' directories.
 *
 * Two rules fall out of that and must not be relaxed:
 *
 *  1. Overwrite note #0, never `unshift` a new one. `followingFeed` and
 *     `wispFeedNotes` are computed once at module scope, when the client's lazy
 *     chunk is imported; a longer array afterwards is invisible to them, a
 *     mutated object is not.
 *  2. The mock slot is claimed at the bottom of `notes.ts`, i.e. while this
 *     chunk is initialising — always before any simulator renders. The host only
 *     stores text and asks for a re-apply; it never has to win a race.
 *
 * Two clients keep their own hardcoded arrays instead (YakiHonne's `homeNotes`,
 * Primal web's `feedNotes`), so they register a target of their own. Targets
 * are re-applied on every change, which is what lets a client whose chunk was
 * imported BEFORE the visitor typed anything still pick the message up.
 *
 * The host imports this module and not `data/mock`: this one pulls in types and
 * the extract* helpers only, so the landing bundle stays free of the ~200
 * generated notes while still sharing one module instance with the sims' chunk.
 */

import type { LinkPreview, MockNote } from './types';
import { extractHashtags, extractMentions, extractUrls } from './utils';

export const PREVIEW_STORAGE_KEY = 'sandstr:preview-note';
export const PREVIEW_IMAGE_STORAGE_KEY = 'sandstr:preview-image';
export const PREVIEW_LINK_STORAGE_KEY = 'sandstr:preview-link';

/**
 * Anything an <img> can load. A picked file arrives as a `data:` URL (already
 * downscaled by the dialog); a link the note itself carries arrives as https.
 * Both are allowed by the production CSP — see the img-src note in
 * public/_headers, and the IP-exposure caveat in PRIVACY.md that comes with it.
 */
const IMAGE_URL = /\.(jpe?g|png|gif|webp|avif)(\?\S*)?$/i;

/** Long enough for a long-form-ish note, short enough to survive a URL. */
export const PREVIEW_MAX_CHARS = 2000;

/**
 * Unicode "other, control". Line breaks and tabs are part of a note and stay;
 * everything else in that category is invisible junk no real client renders.
 */
const CONTROL_CHARS = /\p{Cc}/gu;
const NEWLINE = String.fromCharCode(10);
const TAB = String.fromCharCode(9);

/** A place a pasted note can land: one client's idea of "the top of the feed". */
export interface PreviewTarget {
  /** Put `text` (never empty), its media and its link card on the note. */
  apply: (text: string, media: string[], link: LinkPreview | null) => void;
  /** Put the original mock content back. */
  reset: () => void;
}

const targets: PreviewTarget[] = [];
let current: string | null = null;
let currentImage: string | null = null;
let currentLink: LinkPreview | null | undefined;
let slotId = '';

/** Sanitised, length-capped text — the one value the rest of the app passes around. */
export function normalizePreviewText(raw: string | null | undefined): string {
  if (!raw) return '';
  // No markup ever reaches a card as HTML (the sims render note content as React
  // elements; the three `dangerouslySetInnerHTML` hits in the tree are comments
  // describing its removal), so this is about the reproduction staying honest.
  return raw.replace(CONTROL_CHARS, (c) => (c === NEWLINE || c === TAB ? c : '')).slice(0, PREVIEW_MAX_CHARS);
}

/** Read-through init: the stored message is the truth until someone sets one. */
function ensureLoaded(): string {
  if (current === null) current = readPreviewNote();
  if (currentImage === null) currentImage = readPreviewImage();
  if (currentLink === undefined) currentLink = readPreviewLink();
  return current;
}

/** Every image URL the note itself names, in the order they appear. */
function linkedImages(text: string): string[] {
  return extractUrls(text).filter((u) => IMAGE_URL.test(u));
}

/**
 * What the card should show alongside the text. A picked image wins outright:
 * the visitor chose it, and it is the only one guaranteed to load. Otherwise
 * the note's own image links are used.
 */
function mediaFor(text: string): string[] {
  ensureLoaded();
  if (currentImage) return [currentImage];
  return linkedImages(text);
}

/**
 * The text as a client would show it: with the media URLs taken OUT.
 *
 * A real client parses a note into segments and turns an image URL into the
 * picture itself, so the link never appears as text — Coracle's screen-map spells
 * this out for its parser (§7.3: media links become the image, non-media links
 * become an OG card), Primal's `ParsedNote` has to be told `ignoreMedia`
 * explicitly to suppress it, and Snort's own screen-map (§“kinds 20/21/22”)
 * describes upstream APPENDING imeta URLs to the body precisely so the renderer
 * can turn them into media. For the rest this is our reading of the same
 * pattern, not something a screen-map states.
 *
 * Doing it here rather than in eight renderers is deliberate: it keeps each
 * simulator's directory untouched, and it makes truncation count the string the
 * visitor will actually see. Mock notes are unaffected — none of the ~200 of
 * them carries an image URL in its body (grep: zero hits in notes.ts).
 *
 * The cost of doing it centrally: a client that genuinely leaves the URL in
 * cannot be modelled. None of the eight is known to.
 */
function bodyFor(text: string): string {
  const linked = linkedImages(text);
  if (linked.length === 0) return text;
  let out = text;
  for (const url of linked) out = out.split(url).join('');
  return out
    .replace(/[^\S\n]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * The URL a client would unfurl: the first link that is not itself media.
 * Clients show one card even when a note carries several links, and it is the
 * first one — Coracle's screen-map §7.3 describes exactly this split ("media
 * links become the image, non-media links become an OG preview card").
 */
export function linkCandidate(text: string): string | null {
  const url = extractUrls(text).find((u) => !IMAGE_URL.test(u) && /^https:/i.test(u));
  return url ?? null;
}

/**
 * The stored card, but only while it still belongs to this text — editing the
 * note to point somewhere else must not leave the old site's card on screen.
 */
function linkFor(text: string): LinkPreview | null {
  ensureLoaded();
  const wanted = linkCandidate(text);
  if (!wanted || !currentLink) return null;
  return currentLink.url === wanted || currentLink.url.startsWith(wanted) ? currentLink : null;
}

/** Register a landing spot. Late joiners are caught up immediately. */
export function registerPreviewTarget(target: PreviewTarget): void {
  targets.push(target);
  const text = ensureLoaded();
  if (text) target.apply(bodyFor(text), mediaFor(text), linkFor(text));
}

/**
 * Is this the note currently carrying a visitor's own message?
 *
 * Two clients deliberately ignore a note's `images` and render deterministic
 * local samples instead — Snort's MediaEmbed generates from the note id, and
 * Nostur's mediaFor() re-rolls anything that is not already a `data:` URI.
 * That is right for mock content and wrong for a pasted note, where the picture
 * is the whole point. They ask this to tell the two cases apart, so the mock
 * feed keeps rendering exactly as it did.
 */
export function isPreviewNote(noteId: string): boolean {
  return !!slotId && noteId === slotId && !!ensureLoaded();
}

/** The shared-mock landing spot: `mockNotes[0]`, restored field by field. */
export function registerPreviewSlot(note: MockNote | undefined): void {
  if (!note) return;
  slotId = note.id;
  const pristine = {
    content: note.content,
    hashtags: note.hashtags,
    links: note.links,
    mentions: note.mentions,
    images: note.images,
  };
  registerPreviewTarget({
    apply: (text, media, link) => {
      note.content = text;
      note.linkPreview = link ?? undefined;
      note.hashtags = extractHashtags(text);
      note.links = extractUrls(text);
      note.mentions = extractMentions(text);
      // Never keep the mock picture: it illustrated SOMEBODY ELSE's text.
      note.images = media;
    },
    reset: () => {
      note.content = pristine.content;
      note.hashtags = pristine.hashtags;
      note.links = pristine.links;
      note.mentions = pristine.mentions;
      note.images = pristine.images;
      note.linkPreview = undefined;
    },
  });
}

/** Push `text` to every registered target, or hand the mock content back. */
export function applyPreviewNote(text: string | null): string {
  const next = normalizePreviewText(text);
  current = next;
  if (!next) {
    targets.forEach((t) => t.reset());
    return '';
  }
  const media = mediaFor(next);
  const body = bodyFor(next);
  const link = linkFor(next);
  targets.forEach((t) => t.apply(body, media, link));
  // The visitor's own string is what goes back to the dialog and the share
  // link — the stripped one is a rendering detail, not their note.
  return next;
}

/** The text currently on the cards (`''` when the mock content is untouched). */
export function activePreviewNote(): string {
  return ensureLoaded();
}

/** The picked image, as a `data:` URL (`''` when none was picked). */
export function activePreviewImage(): string {
  ensureLoaded();
  return currentImage || '';
}

export function readPreviewNote(): string {
  if (typeof window === 'undefined') return '';
  try {
    return normalizePreviewText(window.sessionStorage.getItem(PREVIEW_STORAGE_KEY));
  } catch {
    // Private mode / storage disabled: the feature degrades to this session's
    // in-memory value, which is exactly what `current` already is.
    return '';
  }
}

export function readPreviewImage(): string {
  if (typeof window === 'undefined') return '';
  try {
    const stored = window.sessionStorage.getItem(PREVIEW_IMAGE_STORAGE_KEY) || '';
    // Only ever a data: URL, and only ever one this dialog wrote. Anything else
    // in that key is somebody's tampering, not a picture.
    return stored.startsWith('data:image/') ? stored : '';
  } catch {
    return '';
  }
}

/**
 * Attach or drop the picked image, then re-apply so the cards pick it up.
 * The caller has already downscaled it — see PreviewNoteSheet.
 */
export function writePreviewImage(dataUrl: string | null): string {
  ensureLoaded();
  currentImage = dataUrl && dataUrl.startsWith('data:image/') ? dataUrl : '';
  if (typeof window !== 'undefined') {
    try {
      if (currentImage) window.sessionStorage.setItem(PREVIEW_IMAGE_STORAGE_KEY, currentImage);
      else window.sessionStorage.removeItem(PREVIEW_IMAGE_STORAGE_KEY);
    } catch {
      // Quota is the realistic failure (a large image in a nearly full session
      // store). The picture still shows this session; it just will not survive
      // a reload, which beats losing the note along with it.
    }
  }
  applyPreviewNote(current);
  return currentImage;
}

export function activePreviewLink(): LinkPreview | null {
  ensureLoaded();
  return currentLink ?? null;
}

export function readPreviewLink(): LinkPreview | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PREVIEW_LINK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LinkPreview;
    // Only a card this dialog wrote, and only an https target — the same rule
    // the Worker enforces, re-checked because sessionStorage is user-writable.
    return parsed && typeof parsed.url === 'string' && /^https:/i.test(parsed.url) ? parsed : null;
  } catch {
    return null;
  }
}

/** Attach or drop the unfurled card, then re-apply so the notes pick it up. */
export function writePreviewLink(card: LinkPreview | null): void {
  ensureLoaded();
  currentLink = card;
  if (typeof window !== 'undefined') {
    try {
      if (card) window.sessionStorage.setItem(PREVIEW_LINK_STORAGE_KEY, JSON.stringify(card));
      else window.sessionStorage.removeItem(PREVIEW_LINK_STORAGE_KEY);
    } catch {
      /* see readPreviewNote */
    }
  }
  applyPreviewNote(current);
}

/** Persist for the session AND apply. Returns the text that actually landed. */
export function writePreviewNote(text: string | null): string {
  const next = applyPreviewNote(text);
  if (typeof window === 'undefined') return next;
  try {
    if (next) window.sessionStorage.setItem(PREVIEW_STORAGE_KEY, next);
    else window.sessionStorage.removeItem(PREVIEW_STORAGE_KEY);
  } catch {
    /* see readPreviewNote */
  }
  return next;
}
