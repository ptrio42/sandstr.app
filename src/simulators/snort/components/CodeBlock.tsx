import React from 'react';

/**
 * A fenced code block.
 *
 * Deliberately dumb, and that is the faithful choice: **real Snort has no
 * syntax highlighter at all.** Code in a note renders as
 * `<pre className="bg-layer-2 px-2 py-1 rounded-lg">` and inline code as
 * `<code className="bg-layer-2 px-1.5 py-0.5 rounded-lg">`
 * (`docs/refs/snort/screen-map.md` §4.3).
 *
 * The previous implementation invented a regex highlighter that escaped the
 * source and then injected `<span class="…">` markup into the same string, so
 * the string-literal pattern re-matched the quotes in the markup it had just
 * written. The corrupted result went through `dangerouslySetInnerHTML` and was
 * visible as raw markup on the first note of the feed — the 2026-07-28 review, B8:
 *
 *     1"snort-code-keyword">fn parse_event(json: &str)…
 *
 * Deleting the highlighter fixes the corruption AND removes the
 * `dangerouslySetInnerHTML` a source-reading reviewer would flag, while moving
 * *closer* to the real client rather than further away.
 */

interface CodeBlockProps {
  code: string;
  /** Accepted for call-site compatibility; Snort renders no language chrome. */
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => (
  <pre className="snort-code my-2 overflow-x-auto px-2 py-1 text-sm leading-relaxed">
    <code>{code.replace(/\s+$/, '')}</code>
  </pre>
);

export default CodeBlock;
