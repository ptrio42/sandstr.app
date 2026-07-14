import React from 'react';

/** Filled blue Primal verified badge (nip05). */
export function VerifiedBadge({ size = 16 }: { size?: number }) {
  return (
    <span className="primal-verified" aria-label="verified">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1.5l2.35 1.7 2.9-.03 1.7 2.35 2.68 1.1-.9 2.76.9 2.76-2.68 1.1-1.7 2.35-2.9-.03L12 22.5l-2.35-1.7-2.9.03-1.7-2.35-2.68-1.1.9-2.76-.9-2.76 2.68-1.1 1.7-2.35 2.9.03L12 1.5z" />
        <path d="M10.6 15.2l-2.9-2.9 1.25-1.25 1.65 1.65 3.9-3.9 1.25 1.25-5.15 5.15z" fill="#fff" />
      </svg>
    </span>
  );
}

/** Renders note body text, highlighting @mentions and links in accent blue. */
export function NoteBody({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="primal-note-body">
      {lines.map((line, li) => {
        const trimmed = line.trim();
        // whole-line mention (e.g. "@CITADEL WIRE")
        if (trimmed.startsWith('@') && trimmed.length < 40 && !trimmed.includes(' the ')) {
          return (
            <div key={li}>
              <span className="primal-mention">{line}</span>
            </div>
          );
        }
        const parts = line.split(/(@[\p{L}\p{N}_.]+|https?:\/\/\S+)/u);
        return (
          <div key={li} style={{ minHeight: line === '' ? '0.7em' : undefined }}>
            {parts.map((p, pi) =>
              /^(@|https?:\/\/)/.test(p) ? (
                <span key={pi} className="primal-mention">{p}</span>
              ) : (
                <React.Fragment key={pi}>{p}</React.Fragment>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
