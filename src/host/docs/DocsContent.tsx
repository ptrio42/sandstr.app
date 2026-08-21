/**
 * `/docs` — what a visitor can actually DO on this site, one section per
 * feature. Rendered by BOTH the live route (`DocsView`) and the build's
 * prerender (`renderDocs()` in src/entry-server.tsx), so there is no second
 * version of this page to drift from.
 *
 * Kept pure — no hooks, no browser APIs — because the prerender renders it in
 * Node. The `<main>` root is load-bearing: scripts/prerender.mjs refuses to
 * write a page whose markup does not contain one.
 *
 * WHAT THIS PAGE IS FOR. Three shipped features were explained nowhere a
 * visitor could see: pasting your own note into a client, composing a demo
 * link, and the way your screen follows you when you switch clients. The FAQ
 * banks answer questions about the REAL apps; nothing answered questions about
 * this site.
 *
 * TWO RULES WHEN EDITING.
 *  1. No hard-coded counts. Every number and every list of client names here is
 *     derived from `registry.tsx` and `src/data/faq/` at render time, per the
 *     CLAUDE.md rule — a client added or a tour written must move this page on
 *     its own.
 *  2. Describe only what ships. This page is read by people deciding whether to
 *     trust the site; a feature promised here and missing on screen costs more
 *     than the feature was worth.
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { clients } from '../../registry';
import { getFaq } from '../../data/faq';
import { repoFileUrl } from '../contribute';

export const DOCS_TITLE = 'What you can do on Sandstr — tours, note previews, demo links | Sandstr';
export const DOCS_DESCRIPTION =
  'A guide to Sandstr: try real Nostr clients in your browser, take a guided tour, get a how-to replayed in the app, preview your own note in every client, and share a demo link.';

/** Sections in page order — one source for the nav and for the anchors. */
const SECTIONS = [
  { id: 'try-a-client', title: 'Try a real Nostr client' },
  { id: 'tours', title: 'Take a guided tour' },
  { id: 'faq', title: 'Ask “How do I…?” and watch the answer' },
  { id: 'preview-note', title: 'Preview your own note' },
  { id: 'switching', title: 'Switch clients and keep your place' },
  { id: 'compare', title: 'Compare what each client can do' },
  { id: 'demo-links', title: 'Share a demo link' },
  { id: 'versions', title: 'Try an older version' },
  { id: 'get-the-real-app', title: 'Get the real app' },
  { id: 'contribute', title: 'Missing your client?' },
  { id: 'good-to-know', title: 'Good to know' },
] as const;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  // scroll-mt belongs on the SECTION, not on the heading: the anchor target is
  // that element, and both the browser's own #hash jump and DocsView's
  // scrollIntoView honour the scroll-margin of the element they scroll to. On
  // the heading it does nothing, and the sticky header lands on top of the
  // title of the section the reader just asked for.
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mt-10 scroll-mt-20">
      <h2 id={`${id}-heading`} className="text-lg font-semibold">
        {title}
      </h2>
      <div className="mt-2 space-y-3 text-gray-600 dark:text-gray-400">{children}</div>
    </section>
  );
}

/** A link that performs the thing the section just described. */
function TryIt({ to, children }: { to: string; children: ReactNode }) {
  return (
    <p className="text-sm">
      <Link
        to={to}
        className="font-medium text-primary-600 hover:underline dark:text-primary-400"
      >
        {children} →
      </Link>
    </p>
  );
}

export default function DocsContent() {
  const ready = clients.filter((c) => c.status === 'ready');
  const previews = clients.filter((c) => c.status === 'preview');
  const toured = clients.filter((c) => c.hasTour);
  const faqClients = clients.filter((c) => getFaq(c.id));

  // The examples below are picked from the data rather than written down, so a
  // renamed id or a retired tour cannot leave a dead link on the page.
  const tourExample = toured.find((c) => c.status === 'ready') ?? toured[0];
  const showMeExample = faqClients
    .map((c) => ({ client: c, entry: getFaq(c.id)?.entries.find((e) => e.showMe?.length) }))
    .find((pair) => pair.entry);

  const names = (list: { name: string }[]) => list.map((c) => c.name).join(', ');

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-3 text-3xl font-bold sm:text-4xl">What you can do on Sandstr</h1>
      <p className="mb-3 text-gray-600 dark:text-gray-400">
        Sandstr runs interactive reproductions of real Nostr clients in your browser. There is no
        signup, no key to generate and no account to lose — every client here is a simulation
        filled with mock data, so you can open one, press everything, and find out what the real
        app is like before you install it.
      </p>
      <p className="mb-8 text-sm text-gray-500">
        These are unofficial reproductions, not the real apps, and they are not affiliated with
        the clients they reproduce. Nothing you do here is published to Nostr.
      </p>

      <nav aria-label="On this page" className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">On this page</h2>
        <ul className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-primary-600 hover:underline dark:text-primary-400"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Section id="try-a-client" title="Try a real Nostr client">
        <p>
          Pick a client from the shelf on the home page and it opens right there — phone clients
          inside a phone frame, desktop ones full-width. Scroll the feed, open a thread, react to a
          note, look through profiles and relay settings, and in most clients write a note in the
          app&rsquo;s own composer and watch it land on the feed. What you can reach differs from
          client to client, and that difference is the whole reason to try more than one.
        </p>
        <p>
          Most reproductions open on the real app&rsquo;s sign-in screen, because that is what the
          real app does. Tap straight through it: nothing is checked and no key is needed. Where
          the real client takes a pasted key, the field is drawn here too — but it is a tripwire,
          not an input. Paste something shaped like a real secret key and it is discarded on the
          spot, with a note telling you never to paste one into a site you are only trying out.
        </p>
        <p className="text-sm text-gray-500">
          The clients that are desktop web apps in real life are desktop web apps here as well: on
          a narrow phone screen they are not mounted, and the page says so and points you at the
          ones built for a phone.
        </p>
        <p className="text-sm text-gray-500">
          {ready.length} reproductions are reference-verified — rebuilt screen by screen against
          recordings of the real apps. {previews.length} more are early previews: clickable, but
          not yet checked against the real client, so treat the look as approximate.
        </p>
        <TryIt to="/">See the shelf and pick one</TryIt>
      </Section>

      <Section id="tours" title="Take a guided tour">
        <p>
          Most clients come with a guided tour: press <strong>Take a tour</strong> and the app
          walks you through its signature flow a step at a time, spotlighting the control it is
          talking about and driving the simulator as it goes. Press Next to move on, Skip or
          Escape to leave — you can wander off at any point and keep using the client.
        </p>
        <p className="text-sm text-gray-500">
          Tours exist for {toured.length} of the {clients.length} clients on the shelf. On a client
          without one, the button is simply not there.
        </p>
        {tourExample && (
          <TryIt to={`/c/${tourExample.id}?tour=1`}>Take the {tourExample.name} tour</TryIt>
        )}
      </Section>

      <Section id="faq" title="Ask “How do I…?” and watch the answer">
        <p>
          Inside a client, <strong>How do I…?</strong> opens that client&rsquo;s own help panel —
          on a phone it is the question-mark button in the top bar. The answers are about the{' '}
          <em>real</em> app: backing up your keys, sending a zap, adding a relay, muting someone,
          finding your bookmarks, what to do when a profile looks empty. Search it in your own
          words; the matching runs in your browser.
        </p>
        <p>
          Most answers carry a <strong>Show me in the simulator</strong> button. Press it and the
          answer plays out in front of you: the panel closes, the client navigates to the right
          screen, and the control the answer is about gets spotlighted.
        </p>
        <p className="text-sm text-gray-500">
          Help banks exist for {faqClients.length} clients: {names(faqClients)}.
        </p>
        {showMeExample?.entry && (
          <TryIt to={`/c/${showMeExample.client.id}?showme=${showMeExample.entry.id}`}>
            Watch one replayed in {showMeExample.client.name}
          </TryIt>
        )}
      </Section>

      <Section id="preview-note" title="Preview your own note">
        <p>
          <strong>Preview your note</strong> takes text you write or paste — and, if you like, a
          picture from your disk — and puts it at the top of the client&rsquo;s feed, drawn in that
          client&rsquo;s own card style. It is the fastest way to see how your writing will
          actually look: where a long note gets truncated, how the line breaks fall, whether the
          hashtags and mentions render the way you expected.
        </p>
        <p>
          Your note travels with you. Switch clients and it is still there, so the same paragraph
          can be read side by side in every reproduction — including on the comparison page, which
          shows it in all of them at once.
        </p>
        <p className="text-sm text-gray-500">
          If your note contains a link, most clients draw a preview card for it. That card is the
          one thing on this site that needs a server: your browser cannot fetch another site&rsquo;s
          preview tags itself, so Sandstr does it. Pictures you attach are never uploaded — they
          stay in your own browser.{' '}
          <a
            href={repoFileUrl('PRIVACY.md')}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-200"
          >
            The privacy note has the details
          </a>
          .
        </p>
      </Section>

      <Section id="switching" title="Switch clients and keep your place">
        <p>
          You never have to go back to the shelf to try the next client. On a laptop there is a
          rail down the left side, <kbd>[</kbd> and <kbd>]</kbd> step to the previous and next
          client, and <kbd>⌘K</kbd> opens a search box for jumping straight to one by name. On a
          phone, the bar above the app opens the same switcher.
        </p>
        <p>
          The useful part is what happens next: the screen you were on comes with you. Read the
          relay list in one client, switch, and you land on the relay list in the next one — which
          turns &ldquo;how does this app do X&rdquo; into a single keypress. When the client you
          switch to has no equivalent screen, it opens on its feed instead.
        </p>
        <p className="text-sm text-gray-500">
          Screens that carry across: feed, notifications, messages, search, profile, settings,
          relays and bookmarks. Where you are is remembered by your own browser for the rest of the
          tab&rsquo;s session — there is no account and nothing is sent anywhere.
        </p>
      </Section>

      <Section id="compare" title="Compare what each client can do">
        <p>
          When the question is &ldquo;which client should I install&rdquo; rather than &ldquo;what
          is this one like&rdquo;, the comparison page answers it directly: a matrix of what the
          real apps can and cannot do, every claim linked to where it came from and stamped with
          the build it was checked against. Below it, the same post rendered by every client at
          once.
        </p>
        <TryIt to="/compare">Compare the clients</TryIt>
      </Section>

      <Section id="demo-links" title="Share a demo link">
        <p>
          Every client view has a <strong>Demo link</strong> button. It builds a URL that opens the
          client already showing the thing you mean — a particular screen, a running tour, a
          specific how-to answer, or your own note on the feed. It is for answering someone&rsquo;s
          question with the app itself instead of a paragraph describing it.
        </p>
        <p>
          The composer only offers what the client on stage actually has: the tour option appears
          for clients with a tour, the help options for clients with a bank, and the screen picker
          lists only the screens that client really publishes. If you would rather write the link
          by hand, these are the parts it uses:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm">
          <li>
            <code>?tour=1</code> — start the guided tour
          </li>
          <li>
            <code>?faq=&lt;id&gt;</code> — open the help panel on one answer
          </li>
          <li>
            <code>?showme=&lt;id&gt;</code> — replay that answer in the app, without the panel
          </li>
          <li>
            <code>?screen=&lt;name&gt;</code> — open on a screen, e.g. <code>relays</code>
          </li>
          <li>
            <code>?theme=dark</code> or <code>?theme=light</code> — for this view only
          </li>
          <li>
            <code>?note=&lt;text&gt;</code> — carry a note onto the feed
          </li>
        </ul>
        <p className="text-sm text-gray-500">
          Two things worth knowing. Not every client maps every screen — asking for one it does not
          have opens its feed instead. And <code>?screen=</code> is dropped when it is paired with
          a tour or a replay, because those navigate the client themselves and would only fight it.
        </p>
      </Section>

      <Section id="versions" title="Try an older version">
        <p>
          Next to a client&rsquo;s name is the build its reproduction was modeled on. When a client
          ships a redesign and the reproduction is rebuilt to match, the previous one is not thrown
          away: it is frozen and stays reachable from the version menu in the header, which is the
          only place on the site where you can put two releases of the same app side by side.
        </p>
        <p className="text-sm text-gray-500">
          Frozen versions are kept as a copy of the simulator&rsquo;s source rather than a preserved
          build, so read them as &ldquo;how that version looked and behaved&rdquo;.
        </p>
      </Section>

      <Section id="get-the-real-app" title="Get the real app">
        <p>
          Every client view links out to the real thing — <strong>Get the real {' '}
          {ready[0]?.name ?? 'client'}</strong>, and the same for each of the others. That is the
          point of the site: Sandstr is the test drive, not the destination. Nothing you did here
          carries over, because nothing here was ever real — you arrive at the actual app with a
          clear idea of what you are installing.
        </p>
      </Section>

      <Section id="contribute" title="Missing your client?">
        <p>
          The shelf is limited by reference material, not by code. Every reproduction is rebuilt
          against recordings of the real app in real use, and that is the part a single author
          cannot manufacture. So there are two things a visitor can do that genuinely move it:
          request a client that is not here, or send reference material for one that is. Both are
          public GitHub issue forms, linked in the footer of this page.
        </p>
        <p className="text-sm text-gray-500">
          If you use one of these clients and something in its reproduction is wrong, the report
          form on the client&rsquo;s own page is the most useful thing on this list — you are
          describing our app, not uploading yours.
        </p>
      </Section>

      <Section id="good-to-know" title="Good to know">
        <p>
          Everything here is mock data. The people, notes, follower counts and zaps are invented,
          and no simulated action reaches the Nostr network. There is no login, no analytics and no
          cookie banner because there is nothing to consent to: your theme choice and which tours
          you have finished are kept in your own browser, and that is the whole of it.
        </p>
        <p>
          The one exception to &ldquo;nothing leaves your browser&rdquo; is the link-preview card
          described above, which is fetched by a small endpoint on this site.{' '}
          <a
            href={repoFileUrl('PRIVACY.md')}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-200"
          >
            Privacy
          </a>{' '}
          spells that out, and{' '}
          <a
            href={repoFileUrl('TRADEMARKS.md')}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-200"
          >
            Trademarks
          </a>{' '}
          covers the names and marks these reproductions necessarily show.
        </p>
      </Section>

      {/* The prerendered copy of this page ships without Layout, so it has no
          header and no footer. Without these two links a crawler landing here
          would have nowhere allowed to go — every other link on the page points
          under /c/, which robots.txt disallows. */}
      <p className="mt-12 text-sm">
        <Link to="/" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
          See all the reproductions and try one →
        </Link>
      </p>
      <p className="mt-2 text-sm">
        <Link
          to="/compare"
          className="font-medium text-primary-600 hover:underline dark:text-primary-400"
        >
          Or compare what each one can do →
        </Link>
      </p>
    </main>
  );
}
