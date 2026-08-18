import { useEffect, useRef, useState } from 'react';
import { Check, ImagePlus, Link2, RotateCcw, X } from 'lucide-react';
import { PREVIEW_MAX_CHARS, normalizePreviewText } from '../data/mock/previewNote';
import { cn } from '../utils/cn';

/** Refuse before reading: a 4000×3000 phone photo is already several MB. */
const MAX_FILE_BYTES = 12 * 1024 * 1024;
/** Wider than any client renders a feed image, so downscaling is never visible. */
const MAX_EDGE = 1280;

/**
 * File -> `data:` URL, downscaled if it is big.
 *
 * `data:` and not `blob:` deliberately: the note text is kept in sessionStorage
 * so it survives a reload, and an object URL would be dead by then. The size
 * cost is what forces the downscale — base64 adds a third on top, and the
 * session store is ~5 MB for everything.
 *
 * Small files are passed through untouched: re-encoding a 60 kB PNG through a
 * canvas only costs it its transparency.
 */
async function toDataUrl(file: File): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  if (file.size <= 400 * 1024) return raw;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('decode failed'));
    el.src = raw;
  });
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  if (scale === 1 && raw.length < 1_200_000) return raw;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return raw;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * "Paste your note, see how it looks in every client."
 *
 * A host dialog like every other one here: it rides `--z-host-modal`, stamps
 * `data-sandstr-modal` (the single contract that makes the tour and the
 * switcher let go of the keyboard — see HOST_MODAL_SELECTOR), and answers
 * Escape itself.
 *
 * It imports `data/mock/previewNote` and NOT `data/mock`: that module pulls in
 * types and the extract* helpers only, so the landing bundle stays free of the
 * ~200 generated notes while still sharing one module instance with the
 * simulators' chunk.
 */
export default function PreviewNoteSheet({
  clientName,
  initialText,
  initialImage,
  onApply,
  onPickImage,
  onClose,
}: {
  clientName: string;
  initialText: string;
  initialImage: string;
  onApply: (text: string) => void;
  onPickImage: (dataUrl: string | null) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(initialText);
  const [image, setImage] = useState(initialImage);
  const [imageError, setImageError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File | undefined) => {
    setImageError(null);
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setImageError('That file is over 12 MB — pick a smaller one.');
      return;
    }
    try {
      const dataUrl = await toDataUrl(file);
      setImage(dataUrl);
      onPickImage(dataUrl);
    } catch {
      setImageError("Couldn't read that file.");
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // The textarea swallows plain Enter (a note has line breaks), so the
      // keyboard way to submit is the one every compose box uses.
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onApply(normalizePreviewText(text));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onApply, text]);

  useEffect(() => {
    areaRef.current?.focus();
  }, []);

  const clean = normalizePreviewText(text);
  const over = text.length > PREVIEW_MAX_CHARS;

  const copyLink = async () => {
    const url = new URL(window.location.href);
    if (clean) url.searchParams.set('note', clean);
    else url.searchParams.delete('note');
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (insecure context, denied permission): the URL is
      // still selectable in the address bar after Show it, so this is a
      // convenience that is allowed to fail quietly.
    }
  };

  return (
    <div
      className="fixed inset-0 z-[var(--z-host-modal)] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Preview your own note"
      data-sandstr-modal=""
    >
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative m-0 w-full max-w-lg rounded-t-2xl bg-white p-5 pb-7 shadow-2xl dark:bg-gray-900 sm:m-4 sm:rounded-2xl">
        <h2 className="text-base font-semibold">Preview your own note</h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          Paste a message and it takes the top spot of the feed in every client here — switch
          clients to compare how each one renders it.
        </p>

        <textarea
          ref={areaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={`How does this read in ${clientName}?`}
          className="mt-3 w-full resize-y rounded-xl border border-gray-200 bg-white p-3 text-sm leading-relaxed text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />

        {/* Attachment row. The picked image wins over any image link in the
            text — see mediaFor() in previewNote.ts. */}
        <div className="mt-2 flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              void pick(e.target.files?.[0]);
              // Let the same file be picked again after a remove.
              e.target.value = '';
            }}
          />
          {image ? (
            <>
              <img
                src={image}
                alt="Attached preview"
                className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-gray-700"
              />
              <button
                type="button"
                onClick={() => {
                  setImage('');
                  onPickImage(null);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <X className="h-3 w-3" /> Remove image
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ImagePlus className="h-3.5 w-3.5" /> Attach an image
            </button>
          )}
          {imageError && <span className="text-[11px] text-amber-600 dark:text-amber-400">{imageError}</span>}
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[11px]">
          <span className={cn('text-gray-400', over && 'font-medium text-amber-600 dark:text-amber-400')}>
            {over ? `Trimmed to ${PREVIEW_MAX_CHARS} characters` : `${text.length} / ${PREVIEW_MAX_CHARS}`}
          </span>
          {/* An attached image is a data: URL of up to a few hundred kB — far
              past what a browser will carry in a query string, so the link is
              honestly labelled as text-only rather than silently dropping it. */}
          <button
            type="button"
            onClick={copyLink}
            title={image ? 'The link carries the text only — the attached image stays in this tab' : undefined}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {copied ? <Check className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
            {copied ? 'Link copied' : image ? 'Copy link (text only)' : 'Copy link'}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onApply(clean)}
            className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            Show it
          </button>
          {(initialText || image) && (
            <button
              type="button"
              onClick={() => {
                setText('');
                setImage('');
                onPickImage(null);
                onApply('');
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Back to the mock note
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-full px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>

        {/* Says what this does and does not prove, and names the one request the
            site can make on your behalf: an image URL inside the note is loaded
            by your browser from that host (see PRIVACY.md). A picked file never
            leaves the tab — it becomes a `data:` URL. */}
        <p className="mt-3 text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
          Shown the way each reproduction renders a note: length, wrapping, truncation, hashtags,
          links and the attached image. A link to an image is replaced by the picture, the way a
          real client does it. Not resolved: <code className="font-mono">nostr:</code> mentions
          (NIP-27), link preview cards and long-form markdown. Nothing is published. An image you attach stays in this tab; if the
          note itself links to an image, your browser loads it from that host, which sees your IP
          address.
        </p>
      </div>
    </div>
  );
}
