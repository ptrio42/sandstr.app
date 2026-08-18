/**
 * "I wrote a note in the client — why doesn't it get the preview treatment?"
 *
 * Everything the preview feature does (media URLs taken out of the body,
 * `nostr:` references resolved, a link unfurled into a card) hangs off the note
 * the HOST dialog fills in. Writing a note inside a simulator's own composer is
 * the more natural reflex, and it used to bypass all of it — Amethyst pushed
 * its own object onto the feed, Damus dropped the text entirely.
 *
 * A simulator cannot call the host directly (the host imports simulators, never
 * the other way round), so this is the same one-way event idiom the switcher
 * already uses (`sandstr-open-switcher`): the composer announces the text and
 * the host decides what to do with it.
 *
 * IMPORTANT: call this from the USER's compose action only, never from a tour
 * command handler. The host remounts the simulator to render the new note, and
 * a remount mid-tour would kill the tour.
 */
export const COMPOSE_EVENT = 'sandstr-composed-note';

export function publishComposedNote(text: string): void {
  const body = (text || '').trim();
  if (!body || typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<string>(COMPOSE_EVENT, { detail: body }));
}
