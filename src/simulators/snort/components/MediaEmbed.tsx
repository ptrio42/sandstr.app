import React from 'react';
import { noteImages } from '../snortUtils';

/**
 * Inline note media.
 *
 * Snort renders media **edge-to-edge and unrounded**, inside the text flow:
 * `relative max-h-[80vh] w-full h-full object-contain object-center`. Because
 * `CONFIG.media.preferLargeMedia` is true in `config/default.json`, the
 * `md:max-h-[510px]` cap is dropped (`docs/refs/snort/screen-map.md` §4.3).
 *
 * Several consecutive images collapse into a `grid grid-cols-4 gap-0.5
 * place-items-start` gallery with a hard-coded column-span map for 1–6 images
 * and a 200px row height.
 *
 * Images are local, deterministic `data:` URIs (`noteImages` memoises
 * `getSampleImages` per note id, since that helper walks a module-level counter
 * and would otherwise hand back a different picture on every re-render). Zero
 * network requests, so this survives strict CSP and offline.
 */

interface MediaEmbedProps {
  noteId: string;
  count?: number;
}

/** Column spans per image count, mirroring upstream's hard-coded map. */
const SPANS: Record<number, string[]> = {
  1: ['col-span-4'],
  2: ['col-span-2', 'col-span-2'],
  3: ['col-span-4', 'col-span-2', 'col-span-2'],
  4: ['col-span-2', 'col-span-2', 'col-span-2', 'col-span-2'],
  5: ['col-span-2', 'col-span-2', 'col-span-2', 'col-span-1', 'col-span-1'],
  6: ['col-span-2', 'col-span-2', 'col-span-2', 'col-span-2', 'col-span-2', 'col-span-2'],
};

export const MediaEmbed: React.FC<MediaEmbedProps> = ({ noteId, count = 1 }) => {
  const n = Math.min(Math.max(count, 1), 6);
  const images = noteImages(noteId, n);

  if (n === 1) {
    return (
      <img
        src={images[0]}
        alt=""
        className="w-full object-contain object-center"
        style={{ maxHeight: '60vh' }}
      />
    );
  }

  const spans = SPANS[n] ?? SPANS[4];
  return (
    <div className="grid grid-cols-4 gap-0.5 place-items-start">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className={`${spans[i]} w-full object-cover`}
          style={{ height: 200 }}
        />
      ))}
    </div>
  );
};

export default MediaEmbed;
