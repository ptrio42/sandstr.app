import React, { useState, useEffect, useRef } from 'react';
import './nostr-kitten.theme.css';

interface NostrKittenSimulatorProps {
  className?: string;
}

export function NostrKittenSimulator({ className = '' }: NostrKittenSimulatorProps) {
  const [visitorCount, setVisitorCount] = useState(1337);
  const [activeTab, setActiveTab] = useState('home');
  const [midiPlaying, setMidiPlaying] = useState(false);

  // Live visitor counter: bump once on mount, then slow random ticks.
  useEffect(() => {
    setVisitorCount((c) => c + 1);
    const interval = setInterval(() => {
      // occasionally a new "visitor" wanders in
      if (Math.random() < 0.4) {
        setVisitorCount((c) => c + 1);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`nostr-kitten-simulator ${className}`}>
      {/* Starfield Background */}
      <div className="starfield" />

      {/* MIDI Player */}
      <MidiPlayer playing={midiPlaying} onToggle={() => setMidiPlaying((p) => !p)} />

      {/* Main Container */}
      <div className="geocities-container">
        {/* Header with Marquee */}
        <header className="geocities-header">
          <div className="construction-banner">
            🚧 UNDER CONSTRUCTION 🚧
          </div>
          <h1 className="main-title">
            <span className="rainbow-text">✨ NostrKitten ✨</span>
          </h1>
          <p className="subtitle blink">Welcome to my Nostr Page!</p>

          {/* Visitor Counter */}
          <div className="visitor-counter">
            <span>👀 Visitors: </span>
            <OdometerCounter value={visitorCount} digits={6} />
          </div>

          {/* Best viewed badge */}
          <div className="browser-badge">
            Best viewed in Netscape 4.0 at 800x600
          </div>

          {/* Navigation Tabs */}
          <nav className="geocities-nav">
            <button
              onClick={() => setActiveTab('home')}
              className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            >
              🏠 Home
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`nav-btn ${activeTab === 'notes' ? 'active' : ''}`}
            >
              📝 My Notes
            </button>
            <button
              onClick={() => setActiveTab('guestbook')}
              className={`nav-btn ${activeTab === 'guestbook' ? 'active' : ''}`}
            >
              📖 Guestbook
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`nav-btn ${activeTab === 'links' ? 'active' : ''}`}
            >
              🔗 Cool Links
            </button>
          </nav>
        </header>

        {/* Main Content */}
        <main className="geocities-content">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'notes' && <NotesTab />}
          {activeTab === 'guestbook' && <GuestbookTab />}
          {activeTab === 'links' && <LinksTab />}
        </main>

        {/* Footer */}
        <footer className="geocities-footer">
          <p>© 1999-2026 NostrKitten Industries</p>
          <p>Made with 💖 and Netscape Composer</p>
          <p className="webring">
            Part of the <a href="#">Nostr Webring</a> |
            <a href="#">Previous</a> |
            <a href="#">Next</a> |
            <a href="#">Random</a>
          </p>
          <div className="hit-counter">
            <span className="hit-counter-label">You are visitor number</span>
            <OdometerCounter value={visitorCount} digits={6} />
          </div>
        </footer>
      </div>

      {/* Floating Elements */}
      <div className="floating-email">📧 Email me!</div>
      <div className="floating-icq">💬 ICQ: 123456789</div>
    </div>
  );
}

/**
 * Self-rendered odometer-style hit counter (digit boxes).
 * Replaces the old remote counter.digits.com <img> so nothing 404s.
 */
function OdometerCounter({ value, digits = 6 }: { value: number; digits?: number }) {
  const str = Math.max(0, Math.floor(value)).toString().padStart(digits, '0');
  return (
    <span className="odometer" aria-label={`counter ${str}`}>
      {str.split('').map((d, i) => (
        <span key={i} className="odometer-digit">
          {d}
        </span>
      ))}
    </span>
  );
}

/**
 * MIDI player gag. On user gesture, emits a short looping (muted-by-default,
 * very low gain) oscillator-based chiptune via the Web Audio API. No assets,
 * no deps. Cleans up on stop / unmount.
 */
function MidiPlayer({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      // stop any scheduled loop and tear down the context
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
      return;
    }

    // Guard for environments without Web Audio.
    const AudioCtor =
      typeof window !== 'undefined'
        ? window.AudioContext || (window as any).webkitAudioContext
        : undefined;
    if (!AudioCtor) return;

    let cancelled = false;
    let ctx: AudioContext;
    try {
      ctx = new AudioCtor();
    } catch {
      return;
    }
    ctxRef.current = ctx;

    // Cheesy 8-note chiptune loop (C-E-G-C-B-G-E-C), kept intentionally quiet.
    const melody = [523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 659.25, 523.25];
    const noteDur = 0.18;

    const playLoop = () => {
      if (cancelled || ctx.state === 'closed') return;
      const now = ctx.currentTime;
      melody.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        const start = now + i * noteDur;
        // Keep it barely audible so it doesn't blast anyone.
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.03, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + noteDur * 0.9);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + noteDur);
      });
    };

    // resume() is needed after a user gesture in some browsers.
    ctx.resume().catch(() => {});
    playLoop();
    timerRef.current = window.setInterval(playLoop, melody.length * noteDur * 1000);

    return () => {
      cancelled = true;
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      ctx.close().catch(() => {});
      if (ctxRef.current === ctx) ctxRef.current = null;
    };
  }, [playing]);

  return (
    <div className="midi-player">
      <button onClick={onToggle} className="midi-btn">
        {playing ? '⏹ Stop MIDI' : '▶ Play MIDI'}
      </button>
      <span className="midi-text">🎵 All-Star.mid</span>
    </div>
  );
}

function HomeTab() {
  return (
    <div className="home-tab">
      <div className="welcome-box">
        <h2>🌟 Welcome to my Nostr Page! 🌟</h2>
        <p>Hi! I'm NostrKitten and this is my personal Nostr client page!</p>
        <p>I've been into decentralized social media since like, yesterday!</p>

        <div className="about-me">
          <h3>About Me:</h3>
          <ul>
            <li>🐱 I love cats</li>
            <li>⚡ Bitcoin maximalist since 2024</li>
            <li>🌙 Online since 1999</li>
            <li>💾 56k modem user</li>
          </ul>
        </div>

        <div className="currently-listening">
          <h3>🎵 Currently Listening To:</h3>
          <marquee>
            Smash Mouth - All Star | Aqua - Barbie Girl | Backstreet Boys - I Want It That Way |
            Nirvana - Smells Like Teen Spirit | Creedence Clearwater Revival - Bad Moon Rising
          </marquee>
        </div>

        <div className="animated-gifs">
          <span className="spinning">🌐</span>
          <span className="bouncing">💾</span>
          <span className="spinning">📧</span>
          <span className="bouncing">⚡</span>
        </div>
      </div>

      <div className="side-widgets">
        <div className="widget">
          <h3>🔥 This page is HOT!</h3>
          <div className="flames">🔥🔥🔥</div>
        </div>

        <div className="widget">
          <h3>📊 Stats</h3>
          <p>Page created: 1999</p>
          <p>Last updated: Just now!</p>
          <p>Relays connected: 1337</p>
        </div>
      </div>
    </div>
  );
}

interface KittenNote {
  id: number;
  content: string;
  date: string;
  author: string;
  likes: number;
  liked: boolean;
  reposts: number;
  reposted: boolean;
  zaps: number;
  zapped: boolean;
}

const KITTEN_PERSONA = 'NostrKitten';

function NotesTab() {
  const [notes, setNotes] = useState<KittenNote[]>([
    {
      id: 1,
      content: 'Just discovered Nostr! This is so cool! ⚡',
      date: '1999-12-31',
      author: KITTEN_PERSONA,
      likes: 42,
      liked: false,
      reposts: 7,
      reposted: false,
      zaps: 21,
      zapped: false,
    },
    {
      id: 2,
      content: 'My Y2K bug preparations are complete! 🐛',
      date: '1999-12-30',
      author: KITTEN_PERSONA,
      likes: 13,
      liked: false,
      reposts: 3,
      reposted: false,
      zaps: 9,
      zapped: false,
    },
    {
      id: 3,
      content: 'Anyone want to trade Pokemon cards? 🎴',
      date: '1999-12-29',
      author: KITTEN_PERSONA,
      likes: 8,
      liked: false,
      reposts: 1,
      reposted: false,
      zaps: 4,
      zapped: false,
    },
  ]);
  const [draft, setDraft] = useState('');

  const handlePost = () => {
    const content = draft.trim();
    if (!content) return;
    setNotes((prev) => [
      {
        id: prev.length ? Math.max(...prev.map((n) => n.id)) + 1 : 1,
        content,
        date: 'just now',
        author: KITTEN_PERSONA,
        likes: 0,
        liked: false,
        reposts: 0,
        reposted: false,
        zaps: 0,
        zapped: false,
      },
      ...prev,
    ]);
    setDraft('');
  };

  const toggleLike = (id: number) =>
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, liked: !n.liked, likes: n.likes + (n.liked ? -1 : 1) } : n
      )
    );

  const toggleRepost = (id: number) =>
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, reposted: !n.reposted, reposts: n.reposts + (n.reposted ? -1 : 1) }
          : n
      )
    );

  const zap = (id: number) =>
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, zapped: !n.zapped, zaps: n.zaps + (n.zapped ? -1 : 1) } : n
      )
    );

  return (
    <div className="notes-tab">
      <h2>📝 My Notes</h2>
      <div className="notes-list">
        {notes.map((note) => (
          <div key={note.id} className="note-card">
            <div className="note-header">
              <span className="note-author">{note.author}</span>
              <span className="note-date">{note.date}</span>
            </div>
            <p className="note-content">{note.content}</p>
            <div className="note-actions">
              <button
                className={`action-btn ${note.liked ? 'action-btn-on' : ''}`}
                onClick={() => toggleLike(note.id)}
              >
                ❤️ Like {note.likes}
              </button>
              <button
                className={`action-btn ${note.reposted ? 'action-btn-on' : ''}`}
                onClick={() => toggleRepost(note.id)}
              >
                🔄 Repost {note.reposts}
              </button>
              <button
                className={`action-btn ${note.zapped ? 'action-btn-on' : ''}`}
                onClick={() => zap(note.id)}
              >
                ⚡ Zap {note.zaps}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="new-note-box">
        <textarea
          placeholder="What's on your mind? (max 140 chars)"
          maxLength={140}
          className="note-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="post-btn" onClick={handlePost} disabled={!draft.trim()}>
          🚀 Post Note!
        </button>
      </div>
    </div>
  );
}

interface GuestbookEntry {
  name: string;
  message: string;
  date: string;
}

function GuestbookTab() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([
    { name: 'CyberPunk99', message: 'Cool page! Love the starfield!', date: '1999-12-31' },
    { name: 'SatoshiNakamoto', message: 'Working on something big... stay tuned', date: '1999-12-30' },
    { name: 'WebSurfer2000', message: 'A/S/L? Just kidding! Great Nostr client!', date: '1999-12-29' },
  ]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSign = () => {
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedMessage) return;
    setEntries((prev) => [
      { name: trimmedName, message: trimmedMessage, date: 'just now' },
      ...prev,
    ]);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="guestbook-tab">
      <h2>📖 Sign My Guestbook!</h2>
      <div className="guestbook-entries">
        {entries.map((entry, idx) => (
          <div key={idx} className="guestbook-entry">
            <div className="entry-header">
              <span className="entry-name">💌 {entry.name}</span>
              <span className="entry-date">{entry.date}</span>
            </div>
            <p className="entry-message">{entry.message}</p>
          </div>
        ))}
      </div>

      <div className="guestbook-form">
        <h3>✍️ Leave a message!</h3>
        <input
          type="text"
          placeholder="Your name"
          className="gb-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Your email (optional)"
          className="gb-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          placeholder="Your message"
          className="gb-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="gb-submit" onClick={handleSign} disabled={!name.trim() || !message.trim()}>
          📨 Sign Guestbook!
        </button>
      </div>
    </div>
  );
}

function LinksTab() {
  const links = [
    { name: 'Bitcoin.org', url: '#', desc: 'The original cryptocurrency!' },
    { name: 'GeoCities', url: '#', desc: 'RIP 1994-2009 💀' },
    { name: 'AOL', url: '#', desc: 'You\'ve got mail!' },
    { name: 'Napster', url: '#', desc: 'Download MP3s here!' },
    { name: 'AltaVista', url: '#', desc: 'Best search engine!' },
  ];

  return (
    <div className="links-tab">
      <h2>🔗 Cool Links</h2>
      <p className="links-intro">Check out these awesome sites!</p>

      <div className="links-list">
        {links.map((link, idx) => (
          <div key={idx} className="link-item">
            <a href={link.url} className="link-url">{link.name}</a>
            <span className="link-desc">- {link.desc}</span>
            <span className="link-new">NEW!</span>
          </div>
        ))}
      </div>

      <div className="awards-section">
        <h3>🏆 Awards This Page Has Won</h3>
        <div className="awards">
          <span className="award">⭐ Site of the Day</span>
          <span className="award">🔥 Hot Page Award</span>
          <span className="award">💎 Diamond Quality</span>
        </div>
      </div>
    </div>
  );
}

export default NostrKittenSimulator;
