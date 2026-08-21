#!/usr/bin/env node
// The comparison teaser's music bed. Pure Node, no deps, no samples.
//
//   node docs/clips/make-bed.mjs            -> .work/compare/bed.wav
//   node docs/clips/make-bed.mjs /tmp/x.wav
//
// Synthesised from scratch rather than licensed, for one reason that matters
// more than the sound: this is promotional material posted under the owner's
// name, and a generated bed carries no licence, no attribution and no takedown
// risk. It is also why the source is a script and not a file — the media in
// docs/clips is never committed.
//
// -----------------------------------------------------------------------
// THE STRUCTURE IS THE EDIT. 120 BPM, bar = 2.0s, 16 bars = 32.0s exactly,
// which is the length build-teaser-compare.sh cuts to. Every section boundary
// below is a beat boundary in the film:
//
//   bars  1-4   0.0- 8.0  intro      the sheet opens, the note is typed
//   bars  5-10  8.0-20.0  main       the note lands on the feed, then four clients
//   bars 11-12 20.0-24.0  build      the last client, then out through the shelf
//   bar  13    24.0-26.0  drop       the cut to /compare — drums out, pad hit
//   bars 14-15 26.0-30.0  payoff     drums back, the pan across all eight
//   bar  16    30.0-32.0  outro      resolve
//
// Two coincidences carry the whole thing, and both are exact:
//
//   8.0s  the note appears on the first feed  <-> the kit enters
//  24.0s  the cut from the phone to the strip <-> the drop
//
// The drop belongs on the CUT, not on the pan that follows it: the surprise is
// eight clients appearing at once, and a first take with the drop two seconds
// later left it landing on a shot the viewer had already read. The beat targets
// in build-teaser-compare.sh and the section map here are one decision written
// down twice — move one and you must move the other.
// -----------------------------------------------------------------------
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] ?? join(HERE, '.work', 'compare', 'bed.wav');

const SR = 44100, BPM = 120, BEAT = 60 / BPM, BAR = 4 * BEAT, BARS = 16;
const DUR = BARS * BAR;
const N = Math.round(SR * DUR);

const mk = () => new Float32Array(N);
const drums = mk(), bass = mk(), arp = mk(), pad = mk();

// Deterministic noise: the same command twice gives the same file, so a rebuilt
// bed never silently desyncs a cut that was checked against the old one.
let seed = 0x2f6e2b1;
const rnd = () => (((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1);

const put = (buf, at, dur, fn) => {
  const s = Math.round(at * SR), n = Math.round(dur * SR);
  for (let i = 0; i < n; i++) { const j = s + i; if (j >= 0 && j < N) buf[j] += fn(i / SR); }
};

// ---- voices -----------------------------------------------------------------
const kick = (buf, at, g = 1) => {
  let ph = 0;
  put(buf, at, 0.55, (t) => {
    const f = 46 + 92 * Math.exp(-t * 34);
    ph += (2 * Math.PI * f) / SR;
    return g * (Math.sin(ph) * Math.exp(-t * 7.5) * (1 - Math.exp(-t * 900))
      + Math.exp(-t * 420) * 0.35 * rnd());
  });
};
const snare = (buf, at, g = 1) => put(buf, at, 0.32, (t) =>
  g * (rnd() * Math.exp(-t * 21) * 0.55 + Math.sin(2 * Math.PI * 187 * t) * Math.exp(-t * 27) * 0.35));
const hat = (buf, at, g = 1, d = 62) => {
  let prev = 0;
  put(buf, at, 0.14, (t) => { const x = rnd(); const hp = x - prev; prev = x; return g * hp * Math.exp(-t * d) * 0.4; });
};
const pluck = (buf, at, f, g = 1, d = 11) => put(buf, at, 1.1, (t) =>
  g * 0.34 * (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * d)
    + 0.28 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * d * 1.9)
    + 0.12 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t * d * 3)));
const bassNote = (buf, at, f, dur, g = 1) => {
  let lp = 0;
  put(buf, at, dur + 0.15, (t) => {
    const saw = 2 * ((f * t) % 1) - 1;
    const sq = Math.tanh(3.2 * Math.sin(2 * Math.PI * f * t));
    const a = 1 - Math.exp((-2 * Math.PI * (240 + 900 * Math.exp(-t * 9))) / SR);
    lp += a * ((saw * 0.55 + sq * 0.45) - lp);
    const env = Math.min(1, t * 220) * Math.exp(-t * 2.1) * (t < dur ? 1 : Math.exp(-(t - dur) * 26));
    return g * lp * env * 0.5;
  });
};
const padChord = (buf, at, freqs, dur, g = 1) => {
  let lp = 0;
  put(buf, at, dur + 0.9, (t) => {
    let s = 0;
    for (const f of freqs) for (const det of [0.997, 1, 1.004]) s += 2 * ((f * det * t) % 1) - 1;
    s /= freqs.length * 3;
    const a = 1 - Math.exp((-2 * Math.PI * (420 + 1500 * Math.min(1, t / 0.8))) / SR);
    lp += a * (s - lp);
    const env = Math.min(1, t / 0.35) * (t < dur ? 1 : Math.exp(-(t - dur) * 2.2));
    return g * lp * env * 0.42;
  });
};

// ---- harmony: i - VI - III - VII in A minor ---------------------------------
const ROOT = [110.0, 87.31, 130.81, 98.0];
const ARP = [
  [440.0, 523.25, 659.25, 880.0],
  [349.23, 440.0, 523.25, 698.46],
  [523.25, 659.25, 783.99, 1046.5],
  [392.0, 493.88, 587.33, 783.99],
];
const PAD = [[220, 261.63, 329.63], [174.61, 220, 261.63], [261.63, 329.63, 392], [196, 246.94, 293.66]];
const STEP = [0, 1, 2, 3, 2, 1, 2, 3];

/** Which section a bar belongs to — the map at the top of this file. */
const sectionOf = (b) =>
  b < 4 ? 'intro' : b < 10 ? 'main' : b < 12 ? 'build' : b === 12 ? 'drop' : b < 15 ? 'payoff' : 'outro';

for (let b = 0; b < BARS; b++) {
  const t0 = b * BAR;
  const sec = sectionOf(b);
  const c = b % 4;
  const intro = sec === 'intro', build = sec === 'build', drop = sec === 'drop', outro = sec === 'outro';
  const quiet = intro || drop;

  // drums
  if (!quiet) {
    for (let k = 0; k < 4; k++) kick(drums, t0 + k * BEAT, outro ? 0.72 : 1);
    snare(drums, t0 + BEAT, outro ? 0.5 : 0.72);
    snare(drums, t0 + 3 * BEAT, outro ? 0.5 : 0.72);
    const div = build ? 16 : 8;
    for (let i = 0; i < div; i++) hat(drums, t0 + (i * BAR) / div, i % 2 ? 0.5 : 0.85, build ? 78 : 62);
  } else if (b === 3 || drop) {
    // The bar before the kit enters, and the drop itself: pulse only.
    for (let i = 0; i < 8; i++) hat(drums, t0 + (i * BAR) / 8, 0.22 + i * 0.06);
    if (drop) kick(drums, t0, 1.1);
  }
  // Risers into the two moments that matter: the note landing on the first feed
  // (bar 5) and the cut to the strip (bar 13).
  if (b === 3 || b === 11) {
    put(drums, t0 + 3 * BEAT, BEAT, (t) => {
      const x = t / BEAT;
      return rnd() * 0.16 * x * x * Math.sin(2 * Math.PI * (600 + 2600 * x) * t) * 0.6 + rnd() * 0.1 * x * x;
    });
    if (b === 11) for (let i = 0; i < 4; i++) snare(drums, t0 + 3 * BEAT + i * (BEAT / 4), 0.3 + i * 0.16);
  }
  // bass
  if (!quiet) {
    bassNote(bass, t0, ROOT[c], BEAT * 1.6, outro ? 0.7 : 1);
    bassNote(bass, t0 + 2 * BEAT, ROOT[c], BEAT * 1.1, outro ? 0.55 : 0.85);
    if (build) bassNote(bass, t0 + 3.5 * BEAT, ROOT[c] * 1.5, BEAT * 0.4, 0.7);
  }
  // arp
  if (!drop) {
    const div = build ? 16 : 8;
    const g = intro ? 0.55 : outro ? 0.6 : 1;
    for (let i = 0; i < div; i++) {
      const f = ARP[c][STEP[i % 8]] * (build && i % 4 === 3 ? 2 : 1);
      pluck(arp, t0 + (i * BAR) / div, f, g * (i % 2 ? 0.7 : 1), build ? 15 : 11);
    }
  }
  // pad
  if (intro) padChord(pad, t0, PAD[c], BAR, 0.3);
  if (drop || sec === 'payoff' || outro) padChord(pad, t0, PAD[c], BAR, drop ? 1 : outro ? 0.6 : 0.85);
}

// ---- stereo delay on the arp, then the mix ----------------------------------
const L = mk(), R = mk();
const dL = Math.round(BEAT * 0.75 * SR), dR = Math.round(BEAT * 0.5 * SR);
for (let i = 0; i < N; i++) {
  const a = arp[i];
  L[i] += a; R[i] += a;
  if (i + dL < N) L[i + dL] += a * 0.34;
  if (i + dR < N) R[i + dR] += a * 0.28;
  if (i + dL * 2 < N) R[i + dL * 2] += a * 0.14;
}
for (let i = 0; i < N; i++) {
  // The intro sits under the typing rather than over it.
  const duck = i / SR < 4 * BAR ? 0.55 : 1;
  const m = drums[i] * 0.95 + bass[i] * 0.9 + pad[i] * 0.75;
  L[i] = (L[i] * 0.55 + m) * duck;
  R[i] = (R[i] * 0.55 + m) * duck;
}

let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * 0.9); R[i] = Math.tanh(R[i] * 0.9);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak, fade = Math.round(1.5 * SR);
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
const clip = (v) => Math.max(-32768, Math.min(32767, Math.round(v * 32767)));
for (let i = 0; i < N; i++) {
  const f = i > N - fade ? (N - i) / fade : 1;
  buf.writeInt16LE(clip(L[i] * norm * f), 44 + i * 4);
  buf.writeInt16LE(clip(R[i] * norm * f), 46 + i * 4);
}
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, buf);
console.log(`  · bed: ${DUR.toFixed(1)}s, ${BARS} bars @ ${BPM} BPM (bar ${BAR}s) -> ${OUT}`);
