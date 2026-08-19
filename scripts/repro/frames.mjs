#!/usr/bin/env node
/**
 * frames.mjs — turn a screen recording into the frame set the reproduction
 * pipeline actually reads.
 *
 * WHY THIS EXISTS. Nothing downstream ever watches the video. Recon reads
 * contact sheets first, then full-resolution stills of the screens the sheets
 * point at. The video is 10-40x larger than the frames derived from it (Wisp:
 * 401 MB -> 12 MB) and does not fit any public Blossom server's per-file cap
 * (20 MiB free / 100 MiB paid), while the frame set fits the free tier. So the
 * frame set — not the recording — is the transferable reference artifact.
 *
 * Until now these were ad-hoc ffmpeg one-liners retyped per session, which is
 * why every client's shots/ directory is laid out differently
 * (wisp: frames/t_*, snort: periodic/p_*, nostur: full/f_* + sheets/).
 *
 * TWO PASSES, AND THE PERIODIC ONE IS PRIMARY.
 * Scene detection barely fires on smooth scrolling: it found 6 frames on a
 * Primal web capture, 13 on Snort, 18 on Wisp. The periodic pass is what
 * carries coverage. Scene detection is kept as a cheap supplement, and this
 * script warns when it under-fires rather than letting you discover it later.
 *
 * MACHINE CONSTRAINTS. ffmpeg is available; ImageMagick is not, so contact
 * sheets go through ffmpeg's own `tile` filter. `-pattern_type sequence`
 * combined with `-start_number` errors out; a plain `-start_number N` with a
 * `%03d` input pattern works.
 *
 * Usage:
 *   node scripts/repro/frames.mjs <video> --out <dir> [options]
 *
 *   --fps <rate>        periodic sampling rate (default 1/3; use 1/2 for web)
 *   --scene <threshold> scene-detect threshold (default 0.15; 0 disables)
 *   --still <t,t,...>   full-resolution stills at these timestamps (seconds)
 *   --cols/--rows <n>   contact sheet grid (default 5x5)
 *   --width <px>        contact sheet thumbnail width (default 230)
 *   --quality <n>       JPEG quality, 2 (best) - 31 (default 3)
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

// `quality` is deliberately unset by default. Every existing reference set in
// docs/refs/ was produced by ffmpeg one-liners that omitted -q:v, and those
// frames were good enough to build eight clients from — that is the empirical
// bar. Forcing -q:v 3 instead more than doubled the byte size of the Wisp set
// (17 MB vs 9.7 MB for the same 138 frames at the same 1080x2400) and pushed
// it past the 20 MiB free tier on public Blossom servers, buying detail that
// nothing downstream reads. Pass --quality to override for a specific need.
const DEFAULTS = { fps: '1/3', scene: 0.15, cols: 5, rows: 5, width: 230, quality: null };

/** Scene detection below this many frames means the periodic pass is your only coverage. */
const SCENE_UNDERFIRE = 25;

function die(msg) {
  console.error(`frames.mjs: ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = { ...DEFAULTS, video: null, out: null, stills: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) die(`${a} needs a value`);
      return v;
    };
    if (a === '--out') opts.out = next();
    else if (a === '--fps') opts.fps = next();
    else if (a === '--scene') opts.scene = Number(next());
    else if (a === '--cols') opts.cols = Number(next());
    else if (a === '--rows') opts.rows = Number(next());
    else if (a === '--width') opts.width = Number(next());
    else if (a === '--quality') opts.quality = Number(next());
    else if (a === '--still') opts.stills.push(...next().split(',').map(Number));
    else if (a.startsWith('--')) die(`unknown flag ${a}`);
    else if (opts.video === null) opts.video = a;
    else die(`unexpected argument ${a}`);
  }
  if (!opts.video) die('no video given\n\n  node scripts/repro/frames.mjs <video> --out <dir>');
  if (!opts.out) die('--out <dir> is required');
  if (opts.stills.some(Number.isNaN)) die('--still takes comma-separated seconds');
  return opts;
}

function run(bin, args, { capture = 'stderr' } = {}) {
  const r = spawnSync(bin, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error) die(`could not run ${bin}: ${r.error.message}`);
  if (r.status !== 0) {
    die(`${bin} exited ${r.status}\n${(r.stderr || '').split('\n').slice(-15).join('\n')}`);
  }
  return capture === 'stdout' ? r.stdout : r.stderr;
}

/** Rate strings are written as ffmpeg writes them ("1/3"), not as decimals. */
function rateToNumber(rate) {
  if (rate.includes('/')) {
    const [n, d] = rate.split('/').map(Number);
    if (!d || Number.isNaN(n)) die(`bad --fps "${rate}"`);
    return n / d;
  }
  const n = Number(rate);
  if (Number.isNaN(n) || n <= 0) die(`bad --fps "${rate}"`);
  return n;
}

function probe(video) {
  const raw = run('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate,color_space,color_transfer,color_primaries',
    '-show_entries', 'format=duration,size',
    '-of', 'default=noprint_wrappers=1',
    video,
  ], { capture: 'stdout' });

  const kv = Object.fromEntries(
    raw.trim().split('\n').filter(Boolean).map((line) => {
      const i = line.indexOf('=');
      return [line.slice(0, i), line.slice(i + 1)];
    }),
  );
  return {
    width: Number(kv.width),
    height: Number(kv.height),
    durationSec: Number(kv.duration),
    bytes: Number(kv.size),
    // Recorded because it decides whether a sampled hex can be trusted at all:
    // a macOS capture tagged Display P3 reads ~5% off when decoded as sRGB.
    colorSpace: kv.color_space || 'unknown',
    colorTransfer: kv.color_transfer || 'unknown',
    colorPrimaries: kv.color_primaries || 'unknown',
  };
}

function sha256(path) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    createReadStream(path)
      .on('error', reject)
      .on('data', (chunk) => hash.update(chunk))
      .on('end', () => resolve(hash.digest('hex')));
  });
}

function freshDir(path) {
  rmSync(path, { recursive: true, force: true });
  mkdirSync(path, { recursive: true });
  return path;
}

const listJpgs = (dir) => readdirSync(dir).filter((f) => f.endsWith('.jpg')).sort();

/** `-q:v` only when asked for; otherwise ffmpeg's default, which is the baseline. */
const qFlag = (quality) => (quality === null ? [] : ['-q:v', String(quality)]);

function periodicPass(video, outDir, { fps, quality }) {
  const dir = freshDir(join(outDir, 'periodic'));
  run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', video,
    '-vf', `fps=${fps}`,
    ...qFlag(quality),
    join(dir, 'p_%03d.jpg'),
  ]);
  return { dir, files: listJpgs(dir) };
}

function scenePass(video, outDir, { scene, quality }) {
  const dir = freshDir(join(outDir, 'frames'));
  const stderr = run('ffmpeg', [
    '-hide_banner', '-loglevel', 'info', '-y',
    '-i', video,
    '-vf', `select='gt(scene,${scene})',showinfo`,
    '-vsync', 'vfr',
    ...qFlag(quality),
    join(dir, 'scene_%03d.jpg'),
  ]);
  // showinfo prints one line per kept frame; pts_time is what lets a reader
  // jump back into the video at the moment a screen changed.
  const times = [...stderr.matchAll(/pts_time:([0-9.]+)/g)].map((m) => Number(m[1]));
  return { dir, files: listJpgs(dir), times };
}

function stillsPass(video, outDir, timestamps, { quality }) {
  const dir = freshDir(join(outDir, 'full'));
  const files = [];
  timestamps.forEach((t, i) => {
    const name = `f_${String(i + 1).padStart(3, '0')}.jpg`;
    // -ss before -i seeks by keyframe and is orders of magnitude faster than
    // decoding from the start, which matters at 3-10 minute captures.
    run('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-ss', String(t), '-i', video,
      '-frames:v', '1', ...qFlag(quality),
      join(dir, name),
    ]);
    files.push({ name, tSec: t });
  });
  return { dir, files };
}

function sheetPass(srcDir, srcFiles, outDir, { cols, rows, width, quality }) {
  const dir = freshDir(join(outDir, 'sheets'));
  const perSheet = cols * rows;
  const sheets = [];
  for (let start = 0; start < srcFiles.length; start += perSheet) {
    const n = Math.min(perSheet, srcFiles.length - start);
    const name = `sheet_${String(sheets.length).padStart(2, '0')}.jpg`;
    run('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y',
      // NOTE: `-pattern_type sequence` alongside -start_number errors out.
      // A bare -start_number with a %03d pattern is the form that works.
      '-start_number', String(start + 1),
      '-i', join(srcDir, 'p_%03d.jpg'),
      '-frames:v', '1',
      '-vf', `scale=${width}:-1,tile=${cols}x${rows}:padding=6:margin=6:color=0x222222`,
      ...qFlag(quality),
      join(dir, name),
    ]);
    sheets.push({ name, firstIndex: start + 1, count: n });
  }
  return { dir, sheets };
}

const main = async () => {
  const opts = parseArgs(process.argv.slice(2));
  let src;
  try {
    src = statSync(opts.video);
  } catch {
    die(`no such file: ${opts.video}`);
  }
  if (!src.isFile()) die(`not a file: ${opts.video}`);

  const meta = probe(opts.video);
  const fpsValue = rateToNumber(opts.fps);
  mkdirSync(opts.out, { recursive: true });

  console.log(`source   ${basename(opts.video)}`);
  console.log(`         ${meta.width}x${meta.height}  ${meta.durationSec.toFixed(1)}s  ${(meta.bytes / 1048576).toFixed(0)} MB  ${meta.colorPrimaries}`);

  const periodic = periodicPass(opts.video, opts.out, opts);
  console.log(`periodic ${periodic.files.length} frames @ ${opts.fps}`);

  let scene = { files: [], times: [] };
  if (opts.scene > 0) {
    scene = scenePass(opts.video, opts.out, opts);
    console.log(`scene    ${scene.files.length} frames @ threshold ${opts.scene}`);
    if (scene.files.length < SCENE_UNDERFIRE) {
      console.log(`         ^ under-fired. Normal for a web capture (smooth scrolling gives`);
      console.log(`           tiny inter-frame deltas). The periodic pass is your coverage.`);
    }
  }

  const sheets = sheetPass(periodic.dir, periodic.files, opts.out, opts);
  console.log(`sheets   ${sheets.sheets.length} contact sheets (${opts.cols}x${opts.rows})`);

  let stills = { files: [] };
  if (opts.stills.length) {
    stills = stillsPass(opts.video, opts.out, opts.stills, opts);
    console.log(`stills   ${stills.files.length} full-resolution`);
  }

  const fileEntry = (dir, name, extra = {}) => {
    const p = join(dir, name);
    return { path: relative(opts.out, p), bytes: statSync(p).size, ...extra };
  };

  const manifest = {
    generatedBy: 'scripts/repro/frames.mjs',
    source: {
      name: basename(opts.video),
      bytes: meta.bytes,
      sha256: await sha256(opts.video),
      width: meta.width,
      height: meta.height,
      durationSec: meta.durationSec,
      colorSpace: meta.colorSpace,
      colorTransfer: meta.colorTransfer,
      colorPrimaries: meta.colorPrimaries,
    },
    passes: {
      periodic: { fps: opts.fps, count: periodic.files.length },
      scene: { threshold: opts.scene, count: scene.files.length, underFired: scene.files.length > 0 && scene.files.length < SCENE_UNDERFIRE },
      sheets: { grid: `${opts.cols}x${opts.rows}`, thumbWidth: opts.width, count: sheets.sheets.length },
      stills: { count: stills.files.length },
    },
    files: [
      ...periodic.files.map((n, i) => fileEntry(periodic.dir, n, { tSecNominal: Number((i / fpsValue).toFixed(3)) })),
      ...scene.files.map((n, i) => fileEntry(scene.dir, n, scene.times[i] === undefined ? {} : { tSec: scene.times[i] })),
      ...sheets.sheets.map((s) => fileEntry(sheets.dir, s.name, { firstIndex: s.firstIndex, count: s.count })),
      ...stills.files.map((f) => fileEntry(join(opts.out, 'full'), f.name, { tSec: f.tSec })),
    ],
    // Surfaces are labelled by a human (or by capture-web.mjs) after the fact;
    // an unlabelled frame set is still usable, an unlabelled one that pretends
    // to be labelled is not.
    surfaces: null,
  };
  writeFileSync(join(opts.out, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  const total = manifest.files.reduce((sum, f) => sum + f.bytes, 0);
  console.log(`total    ${manifest.files.length} files, ${(total / 1048576).toFixed(1)} MB  ->  ${opts.out}`);
  if (total > 20 * 1024 * 1024) {
    console.log(`         ^ over 20 MiB, the free tier on public Blossom servers.`);
  }
};

main();
