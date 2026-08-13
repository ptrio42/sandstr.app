#!/usr/bin/env node
// Pull public Nostr data straight from relays, for measuring the channel before
// writing anything for it (see docs/OUTREACH.md). No npm deps — Node ships a
// global WebSocket, and bech32 decoding is twenty lines.
//
//   node scripts/nostr-pull.mjs notes <npub> [--rounds 4] > notes.json
//   node scripts/nostr-pull.mjs engagement <npub> > engagement.json
//   node scripts/nostr-pull.mjs tag asknostr [--rounds 5] > asknostr.json
//
// JSON goes to stdout, progress to stderr, so `> file.json` stays clean.
//
// What NOT to use instead: nostr.band refuses connections from this environment
// (site and API share the host), and primal.net / iris / nostrudel are SPAs, so
// fetching them returns an empty shell. njump.me/<npub> renders the last ~100
// notes as plain HTML — fine for reading someone's style, useless for counting.

const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://nostr.mom',
  'wss://relay.nostr.band',
  'wss://nostr.wine',
];

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
/** bech32 → hex. Good enough for npub/note: we drop the 6-char checksum unread. */
function bech32ToHex(s) {
  const data = s.slice(s.lastIndexOf('1') + 1, -6);
  let acc = 0, bits = 0;
  const out = [];
  for (const c of data) {
    const v = CHARSET.indexOf(c);
    if (v < 0) throw new Error(`not bech32: ${s}`);
    acc = (acc << 5) | v; bits += 5;
    while (bits >= 8) { bits -= 8; out.push((acc >> bits) & 0xff); }
  }
  return out.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** One REQ against one relay. Resolves on EOSE, or on the timeout, never rejects. */
function req(url, filter, ms = 14000) {
  return new Promise((resolve) => {
    const events = [];
    let ws;
    const done = () => { try { ws.close(); } catch { /* already gone */ } resolve(events); };
    const timer = setTimeout(done, ms);
    try { ws = new WebSocket(url); } catch { clearTimeout(timer); return resolve(events); }
    const sub = 's' + Math.floor(performance.now() * 1000).toString(36);
    ws.addEventListener('open', () => ws.send(JSON.stringify(['REQ', sub, filter])));
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m[0] === 'EVENT' && m[1] === sub) events.push(m[2]);
      else if (m[0] === 'EOSE') { clearTimeout(timer); done(); }
    });
    ws.addEventListener('error', () => { clearTimeout(timer); done(); });
    ws.addEventListener('close', () => { clearTimeout(timer); resolve(events); });
  });
}

/**
 * Page backwards with `until`. Relays cap a single REQ (usually a few hundred),
 * so the only way to reach further back is to ask again below the oldest event
 * already seen. Stops early when a round adds nothing new.
 */
async function gather(filterFor, rounds) {
  const seen = new Map();
  let until;
  for (let r = 0; r < rounds; r++) {
    const before = seen.size;
    const batches = await Promise.all(RELAYS.map((u) => req(u, filterFor(until))));
    for (const evs of batches) for (const e of evs) seen.set(e.id, e);
    if (seen.size === before) break;
    until = Math.min(...[...seen.values()].map((e) => e.created_at)) - 1;
    process.stderr.write(`  round ${r + 1}: ${seen.size}\n`);
  }
  return [...seen.values()].sort((a, b) => b.created_at - a.created_at);
}

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? Number(process.argv[i + 1]) : fallback;
};

const [mode, subject] = process.argv.slice(2);
if (!mode || !subject) {
  process.stderr.write('usage: nostr-pull.mjs <notes|engagement|tag> <npub|tagname> [--rounds N]\n');
  process.exit(1);
}
const rounds = arg('rounds', mode === 'tag' ? 5 : 4);

if (mode === 'tag') {
  process.stderr.write(`#${subject}:\n`);
  const notes = await gather((until) => ({ kinds: [1], '#t': [subject], limit: 400, ...(until ? { until } : {}) }), rounds);
  process.stderr.write(`  ${notes.length} notes\n`);
  console.log(JSON.stringify({ tag: subject, count: notes.length, notes: notes.map((n) => ({ id: n.id, at: n.created_at, content: n.content })) }));
} else {
  const author = bech32ToHex(subject);
  process.stderr.write(`notes for ${author.slice(0, 12)}…:\n`);
  const notes = await gather((until) => ({ authors: [author], kinds: [1], limit: 400, ...(until ? { until } : {}) }), rounds);
  process.stderr.write(`  ${notes.length} notes\n`);

  const out = {
    author,
    count: notes.length,
    notes: notes.map((n) => ({ id: n.id, at: n.created_at, content: n.content })),
  };

  if (mode === 'engagement') {
    // Replies, reposts, reactions and zap receipts pointing at those notes.
    // Batched by 40 ids: a `#e` filter with hundreds of values gets dropped by
    // some relays without an error, which looks exactly like "nobody reacted".
    process.stderr.write('engagement:\n');
    const ids = notes.map((n) => n.id);
    const seen = new Map();
    for (let i = 0; i < ids.length; i += 40) {
      const batch = ids.slice(i, i + 40);
      const got = await Promise.all(RELAYS.map((u) => req(u, { kinds: [1, 6, 7, 9735], '#e': batch, limit: 500 }, 10000)));
      for (const evs of got) for (const e of evs) seen.set(e.id, e);
      process.stderr.write(`  ${Math.min(i + 40, ids.length)}/${ids.length} notes, ${seen.size} events\n`);
    }
    out.engagement = [...seen.values()].map((e) => ({
      id: e.id, kind: e.kind, at: e.created_at,
      e: e.tags.filter((t) => t[0] === 'e').map((t) => t[1]),
      // Zap amount lives in the invoice: lnbc<amount><m|u|n|p>.
      bolt11: (e.tags.find((t) => t[0] === 'bolt11') ?? [])[1] ?? null,
    }));
    // Counts here are a FLOOR, not a total: six relays is not every relay.
    process.stderr.write(`  ${out.engagement.length} engagement events (undercount — six relays)\n`);
  }
  console.log(JSON.stringify(out));
}
