import { useState, useEffect, useCallback } from "react";

// ── Quotes ──────────────────────────────────────────────────────────────────
const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Optimization is not about doing things faster — it's about doing the right things.", author: "Industrial Wisdom" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Think fast. Optimize smart. Execute together.", author: "OptiRelay Motto" },
  { text: "Engineering is the art of directing the great sources of power in nature for the use and convenience of man.", author: "Thomas Tredgold" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Alone we can do so little; together we can do so much.", author: "Helen Keller" },
  { text: "Excellence is never an accident. It is always the result of high intention.", author: "Aristotle" },
];

// Placeholder sponsor data — replace src with real image paths
const SPONSORS = [
  { id: 1, name: "ProHawke", color: "#00d4aa", letter: "PH" },
  { id: 2, name: "NIT Jalandhar", color: "#4a9eff", letter: "NIT" },
  { id: 3, name: "IES", color: "#ff6b35", letter: "IES" },
  { id: 4, name: "TechCorp", color: "#a855f7", letter: "TC" },
  { id: 5, name: "IndustrialX", color: "#22d3ee", letter: "IX" },
  { id: 6, name: "OptiPro", color: "#f59e0b", letter: "OP" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function getTimeLeft(target) {
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, done: false };
}

function pad(n) { return String(n).padStart(2, "0"); }

// ── Sub-components ────────────────────────────────────────────────────────────
function CountBlock({ label, value }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.25)",
      borderRadius: 12, padding: "18px 28px", minWidth: 110, position: "relative",
      backdropFilter: "blur(8px)",
    }}>
      <span style={{
        fontFamily: "'Orbitron', monospace", fontSize: 64, fontWeight: 900,
        color: "#00d4aa", lineHeight: 1, letterSpacing: 2,
        textShadow: "0 0 30px rgba(0,212,170,0.6), 0 0 60px rgba(0,212,170,0.3)",
      }}>{pad(value)}</span>
      <span style={{
        fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: 4,
        color: "rgba(255,255,255,0.45)", marginTop: 6, textTransform: "uppercase",
      }}>{label}</span>
      {/* Corner accents */}
      <span style={{ position:"absolute", top:4, left:4, width:8, height:8, borderTop:"1px solid #00d4aa", borderLeft:"1px solid #00d4aa" }} />
      <span style={{ position:"absolute", bottom:4, right:4, width:8, height:8, borderBottom:"1px solid #00d4aa", borderRight:"1px solid #00d4aa" }} />
    </div>
  );
}

function SponsorColumn({ sponsors, reverse }) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setOffset(o => o + (reverse ? -0.4 : 0.4));
    }, 16);
    return () => clearInterval(id);
  }, [reverse]);

  const doubled = [...sponsors, ...sponsors];
  const cardH = 110;
  const total = sponsors.length * cardH;
  const y = ((offset % total) + total) % total;

  return (
    <div style={{ overflow: "hidden", height: "100%", position: "relative" }}>
      <div style={{ transform: `translateY(${reverse ? y - total : -y}px)`, transition: "none" }}>
        {doubled.map((s, i) => (
          <div key={i} style={{
            height: cardH - 10, margin: "5px 8px",
            background: `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))`,
            border: `1px solid ${s.color}33`,
            borderRadius: 10, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 6,
            boxShadow: `0 0 20px ${s.color}22`,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              background: `linear-gradient(135deg, ${s.color}33, ${s.color}11)`,
              border: `1px solid ${s.color}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: 11,
              color: s.color, letterSpacing: 1,
            }}>{s.letter}</div>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2 }}>
              {s.name.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScanlineOverlay() {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
      background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
    }} />
  );
}

function GridBg() {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 0, overflow: "hidden",
      background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(0,80,60,0.35) 0%, transparent 70%)",
    }}>
      {/* Grid lines */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.08 }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#00d4aa" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Glowing orbs */}
      <div style={{ position:"absolute", top:"15%", left:"20%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)", filter:"blur(40px)" }} />
      <div style={{ position:"absolute", bottom:"20%", right:"15%", width:250, height:250, borderRadius:"50%", background:"radial-gradient(circle, rgba(74,158,255,0.07) 0%, transparent 70%)", filter:"blur(40px)" }} />
    </div>
  );
}

// ── Main Welcome Screen ────────────────────────────────────────────────────────
export default function WelcomeScreen({ isFullscreen, onToggleFullscreen }) {
  const EVENT_TIME = new Date("2026-03-28T11:30:00").getTime();
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(EVENT_TIME));
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 3 + 1, speed: Math.random() * 20 + 15,
      delay: Math.random() * 10,
    }))
  );

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(EVENT_TIME)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIdx(i => (i + 1) % QUOTES.length);
        setQuoteVisible(true);
      }, 600);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const q = QUOTES[quoteIdx];

  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#020f0d",
      display: "flex", overflow: "hidden", position: "relative",
      fontFamily: "'Rajdhani', sans-serif",
    }}>
      <GridBg />
      <ScanlineOverlay />

      {/* Floating particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, bottom: "-10px",
          width: p.size, height: p.size, borderRadius: "50%",
          background: "#00d4aa", opacity: 0.3,
          animation: `floatUp ${p.speed}s ${p.delay}s linear infinite`,
          zIndex: 1,
        }} />
      ))}

      {/* Left sponsor column */}
      <div style={{ width: 90, zIndex: 3, padding: "20px 0", borderRight: "1px solid rgba(0,212,170,0.1)" }}>
        <SponsorColumn sponsors={SPONSORS} reverse={false} />
      </div>

      {/* Center content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", position: "relative", zIndex: 3,
        gap: 0, padding: "0 20px",
      }}>
        {/* Header badge */}
        <div style={{
          display: "flex", gap: 12, marginBottom: 16, alignItems: "center",
        }}>
          <span style={{
            fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: 5,
            color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
            padding: "4px 12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20,
          }}>THE INDUSTRIAL ENGINEERS SOCIETY · NIT JALANDHAR</span>
        </div>

        {/* Sub-event name */}
        <div style={{
          fontFamily: "'Rajdhani', sans-serif", fontSize: 13, letterSpacing: 8,
          color: "#00d4aa", marginBottom: 8, textTransform: "uppercase",
        }}>UTKANSH 2026 &nbsp;·&nbsp; PRESENTS</div>

        {/* Main title */}
        <div style={{ position: "relative", marginBottom: 6 }}>
          <h1 style={{
            fontFamily: "'Orbitron', monospace", fontSize: "clamp(52px, 9vw, 110px)",
            fontWeight: 900, margin: 0, letterSpacing: -2,
            background: "linear-gradient(90deg, #ffffff 0%, #00d4aa 40%, #ffffff 80%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            textShadow: "none",
            lineHeight: 1,
          }}>
            OPTI<span style={{
              background: "linear-gradient(90deg, #00d4aa, #4affe0)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>RELAY</span>
          </h1>
          {/* Glow behind title */}
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: "120%", height: "200%", zIndex: -1,
            background: "radial-gradient(ellipse, rgba(0,212,170,0.15) 0%, transparent 70%)",
            filter: "blur(20px)",
          }} />
        </div>

        {/* Tagline */}
        <div style={{
          fontFamily: "'Rajdhani', sans-serif", fontSize: 13, letterSpacing: 6,
          color: "rgba(255,255,255,0.5)", marginBottom: 36,
          textTransform: "uppercase",
        }}>
          THINK FAST &nbsp;|&nbsp; OPTIMIZE SMART &nbsp;|&nbsp; EXECUTE TOGETHER
        </div>

        {/* Divider */}
        <div style={{
          width: 200, height: 1, marginBottom: 36,
          background: "linear-gradient(90deg, transparent, #00d4aa, transparent)",
        }} />

        {/* Countdown label */}
        {timeLeft.done ? (
          <div style={{
            fontFamily: "'Orbitron', monospace", fontSize: 28, color: "#00d4aa",
            letterSpacing: 4, textShadow: "0 0 30px #00d4aa",
            animation: "pulse 1s ease-in-out infinite",
            marginBottom: 20,
          }}>🚀 EVENT IS LIVE NOW!</div>
        ) : (
          <>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif", fontSize: 12, letterSpacing: 6,
              color: "rgba(255,255,255,0.35)", marginBottom: 18, textTransform: "uppercase",
            }}>EVENT BEGINS IN</div>
            <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
              <CountBlock label="DAYS" value={timeLeft.days} />
              <div style={{ display: "flex", alignItems: "center", color: "#00d4aa", fontSize: 40, fontFamily: "'Orbitron', monospace", marginTop: -8 }}>:</div>
              <CountBlock label="HOURS" value={timeLeft.hours} />
              <div style={{ display: "flex", alignItems: "center", color: "#00d4aa", fontSize: 40, fontFamily: "'Orbitron', monospace", marginTop: -8 }}>:</div>
              <CountBlock label="MINUTES" value={timeLeft.minutes} />
              <div style={{ display: "flex", alignItems: "center", color: "#00d4aa", fontSize: 40, fontFamily: "'Orbitron', monospace", marginTop: -8 }}>:</div>
              <CountBlock label="SECONDS" value={timeLeft.seconds} />
            </div>
          </>
        )}

        {/* Event date/venue pill */}
        <div style={{
          display: "flex", gap: 24, marginTop: 28,
          background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.2)",
          borderRadius: 30, padding: "10px 28px",
        }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, letterSpacing: 2 }}>
            📅 <span style={{ color: "#fff" }}>28 MARCH 2026</span>
          </span>
          <span style={{ color: "rgba(0,212,170,0.4)" }}>|</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, letterSpacing: 2 }}>
            📍 <span style={{ color: "#fff" }}>ALT, NIT JALANDHAR</span>
          </span>
          <span style={{ color: "rgba(0,212,170,0.4)" }}>|</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, letterSpacing: 2 }}>
            🕐 <span style={{ color: "#fff" }}>11:30 AM ONWARDS</span>
          </span>
        </div>

        {/* Prize pool */}
        <div style={{
          marginTop: 20, display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{
            fontFamily: "'Rajdhani', sans-serif", fontSize: 12, letterSpacing: 4,
            color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
            padding: "4px 12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4,
          }}>PRIZE POOL</span>
          <span style={{
            fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 900,
            color: "#00d4aa", letterSpacing: 1,
            textShadow: "0 0 20px rgba(0,212,170,0.5)",
          }}>UPTO ₹10,000</span>
        </div>

        {/* Quote section */}
        <div style={{
          marginTop: 32, maxWidth: 520, textAlign: "center",
          opacity: quoteVisible ? 1 : 0, transition: "opacity 0.6s ease",
        }}>
          <p style={{
            fontFamily: "'Crimson Text', serif", fontSize: 16, fontStyle: "italic",
            color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: "0 0 6px",
          }}>"{q.text}"</p>
          <span style={{
            fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: 3,
            color: "rgba(0,212,170,0.6)", textTransform: "uppercase",
          }}>— {q.author}</span>
        </div>

        {/* Sponsor branding bottom */}
        <div style={{
          marginTop: 28, display: "flex", alignItems: "center", gap: 8,
          fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: 3,
        }}>
          POWERED BY
          <span style={{
            fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: 13,
            color: "#00d4aa", letterSpacing: 2,
          }}>PROHAWKE</span>
        </div>
      </div>

      {/* Right sponsor column */}
      <div style={{ width: 90, zIndex: 3, padding: "20px 0", borderLeft: "1px solid rgba(0,212,170,0.1)" }}>
        <SponsorColumn sponsors={[...SPONSORS].reverse()} reverse={true} />
      </div>

      {/* Fullscreen button */}
      <button
        onClick={onToggleFullscreen}
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        style={{
          position: "absolute", bottom: 16, right: 110, zIndex: 10,
          background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.3)",
          color: "#00d4aa", borderRadius: 6, padding: "6px 12px", cursor: "pointer",
          fontSize: 11, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 2,
          backdropFilter: "blur(8px)", transition: "all 0.2s",
        }}
      >{isFullscreen ? "⊠ EXIT FULLSCREEN" : "⊡ FULLSCREEN"}</button>

      {/* Corner decorations */}
      {[["top:0,left:0","borderTop,borderLeft"],["top:0,right:0","borderTop,borderRight"],
        ["bottom:0,left:0","borderBottom,borderLeft"],["bottom:0,right:0","borderBottom,borderRight"]
      ].map(([pos, borders], i) => {
        const style = { position:"absolute", zIndex:4, width:24, height:24 };
        pos.split(",").forEach(p => { const [k,v]=p.split(":"); style[k]=v==="0"?0:v; });
        borders.split(",").forEach(b => { style[b]="2px solid rgba(0,212,170,0.5)"; });
        return <div key={i} style={style} />;
      })}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&family=Crimson+Text:ital@0;1&display=swap');
        @keyframes floatUp { 0%{transform:translateY(0);opacity:0.3} 100%{transform:translateY(-100vh);opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}