/**
 * Coracle's iconography, hand-drawn.
 *
 * The real client draws almost everything with Font Awesome 6 Free solid
 * (`package.json:33`, imported in `App.svelte:2-3`, rendered as
 * `<i class="fa fa-name" />`), plus a seven-icon bespoke SVG partial
 * (`src/partials/Icon.svelte`) used for the note action row.
 *
 * Sandstr can ship neither: adding Font Awesome would be a new dependency, and
 * loading it from a CDN would be the external request this repo forbids. So the
 * glyphs below are re-drawn from scratch to read the way FA-solid reads — solid
 * fills, chunky, 512-unit box — rather than copied from it. That also keeps the
 * attribution story clean: nothing here is Font Awesome's art (which is CC BY
 * 4.0 and would carry its own notice obligation), it is a like-for-like
 * substitution recorded in THIRD-PARTY.md.
 *
 * The five action icons are the exception worth care: upstream draws those as
 * OUTLINES on a 17x16 box with a ~1.4 stroke, which is why Coracle's action row
 * looks lighter than every other client's filled row. That contrast is
 * preserved here — action icons stroke, chrome icons fill.
 */
import React from 'react';

export type IconName =
  // --- the bespoke stroked set (Icon.svelte) ---
  | 'message'
  | 'bolt'
  | 'heart'
  | 'openwith'
  | 'server'
  | 'network'
  | 'people-nearby'
  // --- FA-solid stand-ins ---
  | 'search'
  | 'times'
  | 'plus'
  | 'minus'
  | 'check'
  | 'rotate'
  | 'ellipsis-v'
  | 'hourglass'
  | 'cloud-arrow-up'
  | 'triangle-exclamation'
  | 'info-circle'
  | 'copy'
  | 'qrcode'
  | 'edit'
  | 'arrow-left'
  | 'arrow-up'
  | 'up-down'
  | 'rss'
  | 'circle-nodes'
  | 'palette'
  | 'database'
  | 'wallet'
  | 'cog'
  | 'sliders'
  | 'volume-xmark'
  | 'key'
  | 'user-circle'
  | 'paper-plane'
  | 'right-left'
  | 'right-to-bracket'
  | 'bookmark'
  | 'thumbtack'
  | 'hammer'
  | 'lock'
  | 'clock'
  | 'trash'
  | 'quote-left'
  | 'tag'
  | 'microphone-slash'
  | 'paperclip'
  | 'upload'
  | 'circle-notch'
  | 'angle-down'
  | 'code-merge'
  | 'code-pull-request'
  | 'at'
  | 'link'
  | 'earth'
  | 'tags'
  | 'bars-staggered'
  | 'user-secret'
  | 'wind'
  | 'star'
  | 'book-open'
  | 'feather'
  | 'inbox'
  | 'comments'
  | 'compass'
  | 'bell';

interface IconProps {
  name: IconName;
  /** px, matching FA's sizing helpers (fa-sm 14 / default 16 / fa-lg 20). */
  size?: number;
  className?: string;
  /** Applied to the svg as `color`; both fill and stroke inherit it. */
  style?: React.CSSProperties;
}

/** The seven stroked action glyphs, drawn on upstream's 17x16 box. */
const STROKED: Partial<Record<IconName, React.ReactNode>> = {
  message: (
    <path
      d="M2 3.2h13v8.2H7.6L4.3 14v-2.6H2z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  ),
  // Upstream's bolt is a lightning drawn as an open, slanted zig-zag rather
  // than the filled FA bolt — it reads almost like a Z, which is why Coracle's
  // zap does not look like anybody else's.
  bolt: (
    <path
      d="M10.5 1.6 4 7.1h4.2L6.5 14.4 13 8.6H8.7z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  ),
  heart: (
    <path
      d="M8.5 13.6S1.9 9.6 1.9 5.6a3.4 3.4 0 0 1 6.6-1.2 3.4 3.4 0 0 1 6.6 1.2c0 4-6.6 8-6.6 8z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  ),
  openwith: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M2.2 2.4h5.1v5.1H2.2zM9.7 2.4h5.1v5.1H9.7zM2.2 9.4h5.1v5.1H2.2zM9.7 9.4h5.1v5.1H9.7z" />
    </g>
  ),
  server: (
    <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
      <rect x="1.9" y="2.4" width="13.2" height="4.6" rx="1.2" />
      <rect x="1.9" y="9" width="13.2" height="4.6" rx="1.2" />
      <path d="M4.4 4.7h.01M4.4 11.3h.01" strokeLinecap="round" strokeWidth="1.8" />
    </g>
  ),
  network: (
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8.5" cy="3.3" r="1.9" />
      <circle cx="3.2" cy="12.4" r="1.9" />
      <circle cx="13.8" cy="12.4" r="1.9" />
      <path d="M7.2 4.9 4.4 10.7M9.8 4.9l2.8 5.8M5.1 12.4h6.8" />
    </g>
  ),
  'people-nearby': (
    <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="8.5" cy="5.2" r="2.3" />
      <path d="M4.6 13.4a3.9 3.9 0 0 1 7.8 0" />
      <path d="M2 3.4a7 7 0 0 0 0 9.2M15 3.4a7 7 0 0 1 0 9.2" />
    </g>
  ),
};

/** FA-solid stand-ins, drawn on a 512 box so the proportions match FA's. */
const FILLED: Partial<Record<IconName, React.ReactNode>> = {
  search: (
    <path d="M208 32a176 176 0 1 0 106 316l108 108a30 30 0 0 0 42-42L356 306A176 176 0 0 0 208 32zm0 60a116 116 0 1 1 0 232 116 116 0 0 1 0-232z" />
  ),
  times: (
    <path d="M100 58 58 100l156 156L58 412l42 42 156-156 156 156 42-42-156-156 156-156-42-42-156 156z" />
  ),
  plus: <path d="M226 60h60v166h166v60H286v166h-60V286H60v-60h166z" />,
  minus: <path d="M60 226h392v60H60z" />,
  check: <path d="M448 116 196 368 64 236l42-42 90 90 210-210z" />,
  rotate: (
    <path d="M436 96v112a20 20 0 0 1-20 20H304a20 20 0 0 1-14-34l38-38a148 148 0 0 0-235 46 30 30 0 0 1-55-24A208 208 0 0 1 371 111l31-31a20 20 0 0 1 34 16zM76 416V304a20 20 0 0 1 20-20h112a20 20 0 0 1 14 34l-38 38a148 148 0 0 0 235-46 30 30 0 1 1 55 24A208 208 0 0 1 141 401l-31 31a20 20 0 0 1-34-16z" />
  ),
  'ellipsis-v': (
    <path d="M256 56a48 48 0 1 1 0 96 48 48 0 0 1 0-96zm0 152a48 48 0 1 1 0 96 48 48 0 0 1 0-96zm0 152a48 48 0 1 1 0 96 48 48 0 0 1 0-96z" />
  ),
  hourglass: (
    <path d="M96 32h320a24 24 0 0 1 0 48h-8v24c0 53-30 101-77 124 47 23 77 71 77 124v24h8a24 24 0 0 1 0 48H96a24 24 0 0 1 0-48h8v-24c0-53 30-101 77-124-47-23-77-71-77-124V80h-8a24 24 0 0 1 0-48zm56 48v24c0 44 30 82 72 93v78c-42 11-72 49-72 93v24h208v-24c0-44-30-82-72-93v-78c42-11 72-49 72-93V80z" />
  ),
  'cloud-arrow-up': (
    <path d="M144 448a144 144 0 0 1-16-287 160 160 0 0 1 301-27 128 128 0 0 1-13 254v-56a72 72 0 0 0 3-144l-24 1-9-23a104 104 0 0 0-196 18l-6 25-25 3a88 88 0 0 0 9 175h13v58zm128-267 84 84a24 24 0 0 1-34 34l-42-42v151a24 24 0 0 1-48 0V257l-42 42a24 24 0 0 1-34-34z" />
  ),
  'triangle-exclamation': (
    <path d="M228 58a32 32 0 0 1 56 0l188 340a32 32 0 0 1-28 48H68a32 32 0 0 1-28-48zM256 172a22 22 0 0 0-22 22v104a22 22 0 0 0 44 0V194a22 22 0 0 0-22-22zm0 152a26 26 0 1 0 0 52 26 26 0 0 0 0-52z" />
  ),
  'info-circle': (
    <path d="M256 32a224 224 0 1 0 0 448 224 224 0 0 0 0-448zm0 96a32 32 0 1 1 0 64 32 32 0 0 1 0-64zm-40 112h56a16 16 0 0 1 16 16v96h16a16 16 0 0 1 0 32h-88a16 16 0 0 1 0-32h16v-80h-16a16 16 0 0 1 0-32z" />
  ),
  copy: (
    <path d="M176 32h176a32 32 0 0 1 23 9l73 73a32 32 0 0 1 9 23v207a32 32 0 0 1-32 32H176a32 32 0 0 1-32-32V64a32 32 0 0 1 32-32zm-64 96v240a64 64 0 0 0 64 64h176a32 32 0 0 1-32 32H112a48 48 0 0 1-48-48V176a48 48 0 0 1 48-48z" />
  ),
  qrcode: (
    <path d="M48 48h160v160H48zm40 40v80h80V88zm-40 176h160v160H48zm40 40v80h80v-80zm176-256h160v160H264zm40 40v80h80V88zM264 264h64v64h-64zm96 0h64v64h-64zM264 360h64v64h-64zm96 0h64v64h-64z" />
  ),
  edit: (
    <path d="M410 34a44 44 0 0 1 62 62l-30 30-62-62zM348 96l62 62-186 186-78 16 16-78zM64 112h136v48H80v272h272V312h48v136a32 32 0 0 1-32 32H64a32 32 0 0 1-32-32V144a32 32 0 0 1 32-32z" />
  ),
  'arrow-left': (
    <path d="M232 88 72 248a16 16 0 0 0 0 22l160 160a24 24 0 0 0 34-34L146 276h294a24 24 0 0 0 0-48H146L266 122a24 24 0 0 0-34-34z" />
  ),
  'arrow-up': (
    <path d="M264 72 424 232a24 24 0 0 1-34 34L280 156v276a24 24 0 0 1-48 0V156L122 266a24 24 0 0 1-34-34L248 72a12 12 0 0 1 16 0z" />
  ),
  'up-down': (
    <path d="M256 32 152 136h72v112h64V136h72zM224 264v112h-72l104 104 104-104h-72V264z" />
  ),
  rss: (
    <path d="M64 96a32 32 0 0 1 32-32c194 0 352 158 352 352a32 32 0 0 1-64 0c0-159-129-288-288-288a32 32 0 0 1-32-32zm0 128a32 32 0 0 1 32-32c123 0 224 101 224 224a32 32 0 0 1-64 0c0-88-72-160-160-160a32 32 0 0 1-32-32zm48 128a56 56 0 1 1 0 112 56 56 0 0 1 0-112z" />
  ),
  'circle-nodes': (
    <path d="M408 32a56 56 0 1 1 0 112 56 56 0 0 1 0-112zM120 176a56 56 0 1 1 0 112 56 56 0 0 1 0-112zm232 192a56 56 0 1 1 0 112 56 56 0 0 1 0-112zM160 232l208-64 12 38-208 64zm14 62 168 84-18 36-168-84z" />
  ),
  palette: (
    <path d="M256 32C132 32 32 122 32 232c0 92 71 152 160 152h32a24 24 0 0 1 0 48h-16a48 48 0 0 0 0 96h48c124 0 224-90 224-200S380 32 256 32zM120 216a32 32 0 1 1 0 64 32 32 0 0 1 0-64zm56-96a32 32 0 1 1 0 64 32 32 0 0 1 0-64zm160 0a32 32 0 1 1 0 64 32 32 0 0 1 0-64zm56 96a32 32 0 1 1 0 64 32 32 0 0 1 0-64z" />
  ),
  database: (
    <path d="M256 32c106 0 192 25 192 56v40c0 31-86 56-192 56S64 159 64 128V88c0-31 86-56 192-56zM64 176c34 22 111 32 192 32s158-10 192-32v72c0 31-86 56-192 56S64 279 64 248zm0 128c34 22 111 32 192 32s158-10 192-32v72c0 31-86 56-192 56S64 407 64 376z" />
  ),
  wallet: (
    <path d="M96 64h256a32 32 0 0 1 0 64H96a16 16 0 0 0 0 32h304a48 48 0 0 1 48 48v176a48 48 0 0 1-48 48H96a64 64 0 0 1-64-64V128a64 64 0 0 1 64-64zm272 192a32 32 0 1 0 0 64 32 32 0 0 0 0-64z" />
  ),
  cog: (
    <path d="M256 176a80 80 0 1 0 0 160 80 80 0 0 0 0-160zm0 48a32 32 0 1 1 0 64 32 32 0 0 1 0-64zM214 32h84l10 56a184 184 0 0 1 37 21l53-20 42 73-43 37a186 186 0 0 1 0 43l43 37-42 73-53-20a184 184 0 0 1-37 21l-10 56h-84l-10-56a184 184 0 0 1-37-21l-53 20-42-73 43-37a186 186 0 0 1 0-43l-43-37 42-73 53 20a184 184 0 0 1 37-21z" />
  ),
  sliders: (
    <path d="M32 96h96v48H32zm160 0h288v48H192zM32 232h288v48H32zm352 0h96v48h-96zM32 368h96v48H32zm160 0h288v48H192zM152 72h48v96h-48zm192 136h48v96h-48zM152 344h48v96h-48z" />
  ),
  'volume-xmark': (
    <path d="M232 64v384L112 344H40a24 24 0 0 1-24-24V192a24 24 0 0 1 24-24h72zm88 128 40 40 40-40 34 34-40 40 40 40-34 34-40-40-40 40-34-34 40-40-40-40z" />
  ),
  key: (
    <path d="M336 32a144 144 0 0 0-136 192L34 390a24 24 0 0 0-7 17v65a24 24 0 0 0 24 24h72a24 24 0 0 0 24-24v-32h32a24 24 0 0 0 24-24v-32h32a24 24 0 0 0 17-7l36-36A144 144 0 1 0 336 32zm40 72a40 40 0 1 1 0 80 40 40 0 0 1 0-80z" />
  ),
  'user-circle': (
    <path d="M256 32a224 224 0 1 0 0 448 224 224 0 0 0 0-448zm0 96a72 72 0 1 1 0 144 72 72 0 0 1 0-144zm0 296a168 168 0 0 1-118-48c14-42 65-72 118-72s104 30 118 72a168 168 0 0 1-118 48z" />
  ),
  'paper-plane': (
    <path d="M480 32 32 232l144 56 24 152 72-88 128 88zM216 296l176-176-224 136z" />
  ),
  'right-left': (
    <path d="M32 176 144 64v72h192v80H144v72zm448 160L368 448v-72H176v-80h192v-72z" />
  ),
  'right-to-bracket': (
    <path d="M280 64h136a48 48 0 0 1 48 48v288a48 48 0 0 1-48 48H280a24 24 0 0 1 0-48h128V112H280a24 24 0 0 1 0-48zM216 136l112 112a12 12 0 0 1 0 16L216 376a20 20 0 0 1-34-14v-58H72a24 24 0 0 1 0-48h110v-58a20 20 0 0 1 34-14z" />
  ),
  bookmark: <path d="M96 32h256a32 32 0 0 1 32 32v416L224 384 64 480V64a32 32 0 0 1 32-32z" />,
  thumbtack: (
    <path d="M136 32h240a24 24 0 0 1 0 48h-16l16 128 56 40a24 24 0 0 1-14 44H280v160l-24 48-24-48V292H134a24 24 0 0 1-14-44l56-40 16-128h-16a24 24 0 0 1 0-48z" />
  ),
  hammer: (
    <path d="M304 32 208 96l32 32-152 152a48 48 0 0 0 68 68l152-152 32 32 64-96-40-40-40 40-40-40z" />
  ),
  lock: (
    <path d="M256 32a112 112 0 0 0-112 112v48h-16a48 48 0 0 0-48 48v192a48 48 0 0 0 48 48h256a48 48 0 0 0 48-48V240a48 48 0 0 0-48-48h-16v-48A112 112 0 0 0 256 32zm0 56a56 56 0 0 1 56 56v48H200v-48a56 56 0 0 1 56-56z" />
  ),
  clock: (
    <path d="M256 32a224 224 0 1 0 0 448 224 224 0 0 0 0-448zm-24 96h48v128l88 52-24 42-112-66z" />
  ),
  trash: (
    <path d="M192 32h128l16 32h80a24 24 0 0 1 0 48H96a24 24 0 0 1 0-48h80zM112 144h288l-20 300a48 48 0 0 1-48 44H180a48 48 0 0 1-48-44z" />
  ),
  'quote-left': (
    <path d="M112 96a112 112 0 0 0 0 224 111 111 0 0 0 27-4c-14 44-52 76-99 82v54c101-8 180-93 180-196A160 160 0 0 0 112 96zm256 0a112 112 0 0 0 0 224 111 111 0 0 0 27-4c-14 44-52 76-99 82v54c101-8 180-93 180-196A160 160 0 0 0 368 96z" />
  ),
  tag: (
    <path d="M32 64h192l224 224-192 192L32 256zm80 48a40 40 0 1 0 0 80 40 40 0 0 0 0-80z" />
  ),
  'microphone-slash': (
    <path d="M64 58 38 84l122 122v18a96 96 0 0 0 145 82l35 36a160 160 0 0 1-58 12v56h48v48H182v-48h48v-56A160 160 0 0 1 96 208h48a112 112 0 0 0 12 50L38 428l26 26zM192 96a64 64 0 0 1 128 0v112c0 8-1 15-4 22L192 106zm176 112h48c0 24-5 47-14 68l-36-37c1-10 2-20 2-31z" />
  ),
  paperclip: (
    <path d="M368 128v208a112 112 0 0 1-224 0V112a80 80 0 0 1 160 0v208a48 48 0 0 1-96 0V144h48v176a16 16 0 0 0 32 0V112a48 48 0 0 0-96 0v224a80 80 0 0 0 160 0V128z" />
  ),
  upload: (
    <path d="M256 32 136 152h72v168h96V152h72zM64 352h48v64h288v-64h48v80a48 48 0 0 1-48 48H112a48 48 0 0 1-48-48z" />
  ),
  'circle-notch': (
    <path d="M256 32a224 224 0 1 0 224 224h-56a168 168 0 1 1-168-168z" />
  ),
  'angle-down': <path d="M96 176 256 336 416 176l-40-40-120 120-120-120z" />,
  'code-merge': (
    <path d="M128 96a48 48 0 1 1 0 96 48 48 0 0 1 0-96zm-24 128h48v64h48a96 96 0 0 0 96-96h48a144 144 0 0 1-144 144h-48v56h-48zM384 288a48 48 0 1 1 0 96 48 48 0 0 1 0-96z" />
  ),
  'code-pull-request': (
    <path d="M128 96a48 48 0 1 1 0 96 48 48 0 0 1 0-96zm-24 128h48v160h-48zM128 400a48 48 0 1 1 0 96 48 48 0 0 1 0-96zM384 96a48 48 0 1 1 0 96 48 48 0 0 1 0-96zm-24 128h48v160h-48zM384 400a48 48 0 1 1 0 96 48 48 0 0 1 0-96z" />
  ),
  at: (
    <path d="M256 32a224 224 0 1 0 96 427l-20-44a176 176 0 1 1 76-155v42a26 26 0 0 1-52 0V144h-40v20a112 112 0 1 0 8 154 74 74 0 0 0 132-46v-42A224 224 0 0 0 256 32zm0 160a64 64 0 1 1 0 128 64 64 0 0 1 0-128z" />
  ),
  link: (
    <path d="M312 56a112 112 0 0 1 158 158l-64 64a112 112 0 0 1-158 0l40-40a56 56 0 0 0 79 0l63-64a56 56 0 0 0-79-79l-33 33a145 145 0 0 0-58-20zM42 298a112 112 0 0 1 0-158l64-64a112 112 0 0 1 158 0l-40 40a56 56 0 0 0-79 0l-63 64a56 56 0 0 0 79 79l33-33c18 10 38 17 58 20l-52 52a112 112 0 0 1-158 0z" />
  ),
  earth: (
    <path d="M256 32a224 224 0 1 0 0 448 224 224 0 0 0 0-448zM88 256a168 168 0 0 1 12-62l43 43v40l48 48v70a168 168 0 0 1-103-139zm200 165v-45l-56-56v-48h-56l-32-32 40-40h48l24-24-24-24h-40l-24 24-27-27a168 168 0 0 1 251 92h-52l-40 40v56l48 48h32a168 168 0 0 1-92 36z" />
  ),
  tags: (
    <path d="M0 80v144l208 208 144-144L144 80zm80 32a32 32 0 1 1 0 64 32 32 0 0 1 0-64zM192 80h64l208 208-136 136-32-32 128-128z" />
  ),
  'bars-staggered': (
    <path d="M32 96h448v48H32zm96 136h352v48H128zM32 368h288v48H32z" />
  ),
  'user-secret': (
    <path d="M256 32c-40 0-72 40-72 88 0 12 2 24 6 34h132c4-10 6-22 6-34 0-48-32-88-72-88zM128 192h256l32 40H96zM64 272h384l32 208H32zm128 64-16 48h48l-16-48zm112 0-16 48h48l-16-48z" />
  ),
  wind: (
    <path d="M32 128h280a56 56 0 1 0-53-74l-46-15a104 104 0 1 1 99 137H32zm0 128h376a56 56 0 1 1-53 74l-46-15a104 104 0 1 0 99-137H32zm0 128h216a56 56 0 1 1-53 74l-46-15a104 104 0 1 0 99-137H32z" />
  ),
  star: (
    <path d="m256 48 64 130 144 21-104 101 25 143-129-68-129 68 25-143L48 199l144-21z" />
  ),
  // The relay read/write/messaging chips (RelayCard.svelte:141-189).
  'book-open': (
    <path d="M32 88c48-24 112-32 160-8v336c-48-24-112-16-160 8zm448 0v336c-48-24-112-32-160-8V80c48-24 112-16 160 8z" />
  ),
  feather: (
    <path d="M448 32c0 96-40 168-104 208h-64l-32 48h72c-48 40-112 56-176 56l-64 88-32-24 64-88C96 256 160 152 264 104c56-26 120-48 184-72zM216 232l128-96-160 80z" />
  ),
  inbox: (
    <path d="M96 64h320l64 192v144a48 48 0 0 1-48 48H80a48 48 0 0 1-48-48V256zm26 48-50 144h96l24 48h128l24-48h96l-50-144z" />
  ),
  comments: (
    <path d="M192 32c106 0 192 65 192 144s-86 144-192 144a234 234 0 0 1-52-6l-92 46 28-78C40 254 0 214 0 176 0 97 86 32 192 32zm240 128c48 24 80 66 80 112 0 33-17 63-45 85l24 67-80-40a250 250 0 0 1-52 6c-71 0-133-29-166-73 111-6 199-77 199-165z" />
  ),
  compass: (
    <path d="M256 32a224 224 0 1 0 0 448 224 224 0 0 0 0-448zm104 120-56 152-152 56 56-152zm-104 76a28 28 0 1 0 0 56 28 28 0 0 0 0-56z" />
  ),
  bell: (
    <path d="M256 32a32 32 0 0 1 32 32v16a136 136 0 0 1 104 132v60l40 60a16 16 0 0 1-13 25H93a16 16 0 0 1-13-25l40-60v-60A136 136 0 0 1 224 80V64a32 32 0 0 1 32-32zm0 448a56 56 0 0 1-56-56h112a56 56 0 0 1-56 56z" />
  ),
};

export const Icon: React.FC<IconProps> = ({ name, size = 16, className = '', style }) => {
  const stroked = STROKED[name];
  if (stroked) {
    return (
      <svg
        viewBox="0 0 17 16"
        width={size}
        height={size}
        className={className}
        style={style}
        aria-hidden="true"
        focusable="false"
      >
        {stroked}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      style={style}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {FILLED[name] ?? FILLED.plus}
    </svg>
  );
};
