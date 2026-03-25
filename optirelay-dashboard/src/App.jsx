import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Empty string: Vite proxy forwards /api/* and /admin-login to http://localhost:5000
const API = "http://localhost:5000";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const QUESTIONS = {
  round1: [
    { q: "What is the heart of Industry 4.0?", options: ["Manual labor", "Data & Connectivity", "Paper files", "Steam engines"], ans: 1 },
    { q: "Which 5S stands for 'Set in Order'?", options: ["Seiri", "Seiton", "Seiso", "Seiketsu"], ans: 1 },
    { q: "What does OEE stand for?", options: ["Overall Equipment Effectiveness", "Operational Efficiency Engine", "Output Estimation Error", "Optimal Energy Exchange"], ans: 0 },
    { q: "Lean Manufacturing originated at which company?", options: ["Ford", "GE", "Toyota", "Siemens"], ans: 2 },
    { q: "Which chart identifies most significant causes of defects?", options: ["Gantt Chart", "Pareto Chart", "Ishikawa Chart", "Control Chart"], ans: 1 },
    { q: "What does SMED stand for?", options: ["Single Minute Exchange of Die", "Standard Method Engineering Design", "Systematic Manufacturing Error Detection", "Sequential Mode Engineering Data"], ans: 0 },
    { q: "Kaizen means:", options: ["Radical change", "Continuous improvement", "Zero defects", "Pull system"], ans: 1 },
    { q: "What is takt time?", options: ["Cycle time of slowest machine", "Available production time / customer demand", "Total downtime in a shift", "Time between quality checks"], ans: 1 },
  ],
  round2: [
    { q: "In Six Sigma, DMAIC stands for:", options: ["Define, Measure, Analyze, Improve, Control", "Design, Manufacture, Assess, Inspect, Close", "Direct, Monitor, Adjust, Implement, Check", "Document, Measure, Act, Inspect, Correct"], ans: 0 },
    { q: "What does JIT stand for in manufacturing?", options: ["Job in Transit", "Just in Time", "Joint Industrial Technology", "Job Integration Tool"], ans: 1 },
    { q: "Poka-yoke refers to:", options: ["Japanese tea ceremony", "Error-proofing", "Kanban cards", "5S audits"], ans: 1 },
    { q: "The 'bullwhip effect' occurs in:", options: ["Fluid dynamics", "Supply chain management", "Structural engineering", "Thermodynamics"], ans: 1 },
    { q: "Which is NOT a type of waste in Lean (8 Wastes)?", options: ["Overproduction", "Innovation", "Waiting", "Transport"], ans: 1 },
    { q: "EOQ stands for:", options: ["Economic Order Quantity", "Estimated Output Quality", "Equipment Overhaul Quota", "Effective Operations Quality"], ans: 0 },
  ],
};

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Optimization is not about doing things faster — it's about doing the right things.", author: "Industrial Wisdom" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Excellence is never an accident. It is always the result of high intention.", author: "Aristotle" },
  { text: "Alone we can do so little; together we can do so much.", author: "Helen Keller" },
  { text: "Think fast. Optimize smart. Execute together.", author: "OptiRelay Motto" },
];

const SPONSORS = [
  { id: 1, name: "ProHawke", color: "#00d4aa", letter: "PH" },
  { id: 2, name: "NIT Jalandhar", color: "#4a9eff", letter: "NIT" },
  { id: 3, name: "IES", color: "#ff6b35", letter: "IES" },
  { id: 4, name: "TechCorp", color: "#a855f7", letter: "TC" },
  { id: 5, name: "IndustrialX", color: "#22d3ee", letter: "IX" },
];

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
const LS = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
function useLS(key, def) {
  const [val, setVal] = useState(() => LS.get(key, def));
  const set = (v) => { setVal(v); LS.set(key, v); };
  return [val, set];
}
function useSyncLS(key, def, interval = 300) {
  const [val, setVal] = useState(() => LS.get(key, def));
  useEffect(() => {
    const id = setInterval(() => {
      const v = LS.get(key, def);
      setVal(prev => JSON.stringify(prev) !== JSON.stringify(v) ? v : prev);
    }, interval);
    return () => clearInterval(id);
  }, [key]);
  return val;
}

// ─── API HELPERS ──────────────────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function GlowButton({ children, onClick, color = "#00d4aa", size = "md", style = {}, disabled = false }) {
  const pad = size === "sm" ? "8px 16px" : size === "lg" ? "14px 32px" : "10px 22px";
  const fs = size === "sm" ? 11 : size === "lg" ? 16 : 13;
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: pad, fontFamily: "'Orbitron', monospace", fontSize: fs, fontWeight: 700, letterSpacing: 2, cursor: disabled ? "default" : "pointer", borderRadius: 8, border: `1px solid ${disabled ? "rgba(255,255,255,0.1)" : color + "55"}`, background: disabled ? "rgba(255,255,255,0.04)" : `${color}15`, color: disabled ? "rgba(255,255,255,0.25)" : color, transition: "all 0.2s", ...style }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = `${color}30`; e.currentTarget.style.boxShadow = `0 0 20px ${color}40`; } }}
      onMouseLeave={e => { e.currentTarget.style.background = disabled ? "rgba(255,255,255,0.04)" : `${color}15`; e.currentTarget.style.boxShadow = "none"; }}
    >{children}</button>
  );
}

function GridBg() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
        <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#00d4aa" strokeWidth="0.5" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div style={{ position: "absolute", top: "15%", left: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "15%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,158,255,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />
    </div>
  );
}

function CornerAccents({ color = "rgba(0,212,170,0.5)" }) {
  const s = { position: "absolute", zIndex: 4, width: 24, height: 24 };
  return <>
    <div style={{ ...s, top: 0, left: 0, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
    <div style={{ ...s, top: 0, right: 0, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
    <div style={{ ...s, bottom: 0, left: 0, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
    <div style={{ ...s, bottom: 0, right: 0, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
  </>;
}

// ─── SPONSOR TICKER ───────────────────────────────────────────────────────────
function SponsorTicker() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setOffset(o => (o + 0.5) % (SPONSORS.length * 200)), 16);
    return () => clearInterval(id);
  }, []);
  const items = [...SPONSORS, ...SPONSORS, ...SPONSORS];
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, height: 44, background: "rgba(0,0,0,0.55)", borderTop: "1px solid rgba(0,212,170,0.12)", backdropFilter: "blur(8px)", overflow: "hidden", display: "flex", alignItems: "center" }}>
      <div style={{ flexShrink: 0, padding: "0 16px 0 14px", fontFamily: "'Orbitron', monospace", fontSize: 9, letterSpacing: 3, color: "rgba(0,212,170,0.5)", borderRight: "1px solid rgba(0,212,170,0.15)", whiteSpace: "nowrap" }}>SPONSORS</div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ display: "flex", transform: `translateX(-${offset}px)`, whiteSpace: "nowrap" }}>
          {items.map((s, i) => (
            <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 32px", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ width: 22, height: 22, borderRadius: 5, background: `${s.color}20`, border: `1px solid ${s.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Orbitron', monospace", fontSize: 8, fontWeight: 700, color: s.color }}>{s.letter}</div>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, letterSpacing: 2, color: "rgba(255,255,255,0.4)" }}>{s.name.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flexShrink: 0, padding: "0 14px", fontFamily: "'Orbitron', monospace", fontSize: 9, letterSpacing: 2, color: "rgba(0,212,170,0.4)", borderLeft: "1px solid rgba(0,212,170,0.15)" }}>PROHAWKE</div>
    </div>
  );
}

function SponsorColumn({ sponsors, reverse }) {
  const [offset, setOffset] = useState(0);
  useEffect(() => { const id = setInterval(() => setOffset(o => o + (reverse ? -0.3 : 0.3)), 16); return () => clearInterval(id); }, [reverse]);
  const doubled = [...sponsors, ...sponsors];
  const cardH = 110, total = sponsors.length * cardH;
  const y = ((offset % total) + total) % total;
  return (
    <div style={{ overflow: "hidden", height: "100%" }}>
      <div style={{ transform: `translateY(${reverse ? y - total : -y}px)` }}>
        {doubled.map((s, i) => (
          <div key={i} style={{ height: cardH - 10, margin: "5px 8px", background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}33`, borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: `${s.color}22`, border: `1px solid ${s.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: 10, color: s.color }}>{s.letter}</div>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>{s.name.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── WELCOME SCREEN ───────────────────────────────────────────────────────────
function WelcomeScreen() {
  const EVENT_TIME = new Date("2026-03-28T11:30:00").getTime();
  const [timeLeft, setTimeLeft] = useState({});
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);
  useEffect(() => {
    const tick = () => { const d = EVENT_TIME - Date.now(); if (d <= 0) { setTimeLeft({ done: true }); return; } setTimeLeft({ days: Math.floor(d / 86400000), hours: Math.floor((d % 86400000) / 3600000), minutes: Math.floor((d % 3600000) / 60000), seconds: Math.floor((d % 60000) / 1000) }); };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  useEffect(() => { const id = setInterval(() => { setQuoteVisible(false); setTimeout(() => { setQuoteIdx(i => (i + 1) % QUOTES.length); setQuoteVisible(true); }, 600); }, 6000); return () => clearInterval(id); }, []);
  const pad = n => String(n).padStart(2, "0");
  const q = QUOTES[quoteIdx];
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020f0d", display: "flex", overflow: "hidden", position: "relative", fontFamily: "'Rajdhani', sans-serif" }}>
      <GridBg />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)" }} />
      <div style={{ width: 90, zIndex: 3, padding: "20px 0 60px", borderRight: "1px solid rgba(0,212,170,0.1)" }}><SponsorColumn sponsors={SPONSORS} reverse={false} /></div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 3, padding: "0 20px 44px" }}>
        <div style={{ fontSize: 11, letterSpacing: 5, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", padding: "4px 14px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, marginBottom: 16 }}>THE INDUSTRIAL ENGINEERS SOCIETY · NIT JALANDHAR</div>
        <div style={{ fontSize: 13, letterSpacing: 8, color: "#00d4aa", marginBottom: 8, textTransform: "uppercase" }}>UTKANSH 2026 &nbsp;·&nbsp; PRESENTS</div>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "clamp(52px, 9vw, 110px)", fontWeight: 900, margin: "0 0 6px", letterSpacing: -2, background: "linear-gradient(90deg, #ffffff 0%, #00d4aa 40%, #ffffff 80%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
          OPTI<span style={{ background: "linear-gradient(90deg, #00d4aa, #4affe0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>RELAY</span>
        </h1>
        <div style={{ fontSize: 13, letterSpacing: 6, color: "rgba(255,255,255,0.4)", marginBottom: 36, textTransform: "uppercase" }}>THINK FAST &nbsp;|&nbsp; OPTIMIZE SMART &nbsp;|&nbsp; EXECUTE TOGETHER</div>
        <div style={{ width: 200, height: 1, marginBottom: 36, background: "linear-gradient(90deg, transparent, #00d4aa, transparent)" }} />
        {timeLeft.done ? (
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 28, color: "#00d4aa", letterSpacing: 4, animation: "pulse 1s ease-in-out infinite", marginBottom: 20 }}>🚀 EVENT IS LIVE!</div>
        ) : (
          <>
            <div style={{ fontSize: 12, letterSpacing: 6, color: "rgba(255,255,255,0.3)", marginBottom: 18, textTransform: "uppercase" }}>EVENT BEGINS IN</div>
            <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
              {[["DAYS", timeLeft.days], ["HOURS", timeLeft.hours], ["MINUTES", timeLeft.minutes], ["SECONDS", timeLeft.seconds]].map(([label, val], i, arr) => (
                <div key={label} style={{ display: "contents" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.25)", borderRadius: 12, padding: "18px 28px", minWidth: 100 }}>
                    <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 56, fontWeight: 900, color: "#00d4aa", lineHeight: 1 }}>{pad(val || 0)}</span>
                    <span style={{ fontSize: 10, letterSpacing: 4, color: "rgba(255,255,255,0.4)", marginTop: 6, textTransform: "uppercase" }}>{label}</span>
                  </div>
                  {i < arr.length - 1 && <div style={{ display: "flex", alignItems: "center", color: "#00d4aa", fontSize: 36, fontFamily: "'Orbitron', monospace", marginTop: -8 }}>:</div>}
                </div>
              ))}
            </div>
          </>
        )}
        <div style={{ display: "flex", gap: 24, marginTop: 28, background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 30, padding: "10px 28px" }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, letterSpacing: 2 }}>📅 <span style={{ color: "#fff" }}>28 MARCH 2026</span></span>
          <span style={{ color: "rgba(0,212,170,0.3)" }}>|</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, letterSpacing: 2 }}>📍 <span style={{ color: "#fff" }}>ALT, NIT JALANDHAR</span></span>
          <span style={{ color: "rgba(0,212,170,0.3)" }}>|</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, letterSpacing: 2 }}>🕐 <span style={{ color: "#fff" }}>11:30 AM ONWARDS</span></span>
        </div>
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", padding: "4px 12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4 }}>PRIZE POOL</span>
          <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 900, color: "#00d4aa" }}>UPTO ₹10,000</span>
        </div>
        <div style={{ marginTop: 32, maxWidth: 520, textAlign: "center", opacity: quoteVisible ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <p style={{ fontFamily: "'Georgia', serif", fontSize: 16, fontStyle: "italic", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 0 6px" }}>"{q.text}"</p>
          <span style={{ fontSize: 11, letterSpacing: 3, color: "rgba(0,212,170,0.6)", textTransform: "uppercase" }}>— {q.author}</span>
        </div>
      </div>
      <div style={{ width: 90, zIndex: 3, padding: "20px 0 60px", borderLeft: "1px solid rgba(0,212,170,0.1)" }}><SponsorColumn sponsors={[...SPONSORS].reverse()} reverse={true} /></div>
      <SponsorTicker />
      <CornerAccents />
    </div>
  );
}

// ─── ROUND INSTRUCTIONS ───────────────────────────────────────────────────────
function RoundInstructions({ roundNum }) {
  const rules = {
    1: ["30 seconds per question", "Fastest finger format — raise hand to answer", "No negative marking", "8 questions total", "Correct answer = 10 points"],
    2: ["45 seconds per question", "Team discussion allowed (30 sec think time)", "Wrong answer = −5 points", "6 questions total", "Leaderboard visible during questions"],
    3: ["Each team receives the same industrial case study", "20 minutes preparation time (timer shown on screen)", "5 minute presentation per team", "Judged on feasibility, creativity & IE tools used", "Q&A round follows each presentation"],
  };
  const colors = { 1: "#00d4aa", 2: "#4a9eff", 3: "#ff6b35" };
  const c = colors[roundNum] || "#00d4aa";
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020f0d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", fontFamily: "'Rajdhani', sans-serif" }}>
      <GridBg />
      <div style={{ position: "relative", zIndex: 3, textAlign: "center", maxWidth: 720, padding: "0 20px 44px" }}>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, letterSpacing: 6, color: c, marginBottom: 16, textTransform: "uppercase" }}>OPTIRELAY 2026</div>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "clamp(44px, 7vw, 84px)", fontWeight: 900, margin: "0 0 12px", color: "#fff" }}>
          ROUND <span style={{ color: c }}>{roundNum}</span>
          {roundNum === 3 && <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "0.35em", letterSpacing: 8, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>CASE COMPETITION</div>}
        </h1>
        <div style={{ width: 120, height: 2, background: `linear-gradient(90deg, transparent, ${c}, transparent)`, margin: "0 auto 40px" }} />
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          {(rules[roundNum] || []).map((rule, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 20, textAlign: "left", padding: "14px 24px", background: `${c}08`, border: `1px solid ${c}22`, borderRadius: 12 }}>
              <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 22, fontWeight: 900, color: c, minWidth: 36 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: 19, letterSpacing: 1, color: "rgba(255,255,255,0.85)" }}>{rule}</span>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 36, fontSize: 13, letterSpacing: 4, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>— GET READY —</div>
      </div>
      <SponsorTicker />
      <CornerAccents color={c + "80"} />
    </div>
  );
}

// ─── COUNTDOWN SCREEN ─────────────────────────────────────────────────────────
function CountdownScreen({ onDone }) {
  const [count, setCount] = useState(5);
  useEffect(() => { if (count <= 0) { onDone(); return; } const id = setTimeout(() => setCount(c => c - 1), 1000); return () => clearTimeout(id); }, [count]);
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020f0d", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <GridBg />
      <div style={{ position: "relative", zIndex: 3, textAlign: "center", paddingBottom: 44 }}>
        {count > 0
          ? <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "clamp(140px, 28vw, 260px)", fontWeight: 900, color: "#00d4aa", lineHeight: 1, textShadow: "0 0 80px rgba(0,212,170,0.4)", animation: "countPop 0.8s ease-out" }}>{count}</div>
          : <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "clamp(60px, 12vw, 120px)", fontWeight: 900, color: "#00d4aa", letterSpacing: 8, animation: "countPop 0.5s ease-out" }}>GO!</div>}
        <div style={{ fontSize: 14, letterSpacing: 6, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginTop: 20 }}>STARTING ROUND</div>
      </div>
      <SponsorTicker />
    </div>
  );
}

// ─── ROUND 3 CASE COMPETITION SCREEN ─────────────────────────────────────────
function Round3CaseScreen({ teams }) {
  const PREP_SECS = 20 * 60;
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => { const id = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(id); }, []);
  const remaining = Math.max(0, PREP_SECS - elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = (remaining / PREP_SECS) * 100;
  const isUrgent = remaining < 5 * 60;
  const isDone = remaining === 0;
  const sorted = [...teams].sort((a, b) => (b.r1 + b.r2 + b.r3) - (a.r1 + a.r2 + a.r3));
  const podiumColors = ["#FFD700", "#C0C0C0", "#CD7F32", "#4a9eff", "#a855f7", "#ff6b35", "#22d3ee"];
  const medals = ["🥇", "🥈", "🥉"];
  const maxScore = Math.max(...teams.map(t => t.r1 + t.r2 + t.r3), 1);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020f0d", display: "flex", flexDirection: "column", position: "relative", fontFamily: "'Rajdhani', sans-serif" }}>
      <GridBg />
      {isUrgent && !isDone && <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "rgba(255,100,50,0.04)", animation: "urgentPulse 2s ease-in-out infinite", pointerEvents: "none" }} />}
      <div style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", borderBottom: "1px solid rgba(255,107,53,0.2)", flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 10, letterSpacing: 5, color: "#ff6b35", marginBottom: 2 }}>OPTIRELAY 2026 · FINAL ROUND</div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>CASE COMPETITION</div>
        </div>
        <div style={{ textAlign: "center" }}>
          {isDone
            ? <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 32, fontWeight: 900, color: "#ff4444", letterSpacing: 4, animation: "pulse 1s ease-in-out infinite" }}>PRESENT NOW!</div>
            : <>
                <div style={{ fontSize: 10, letterSpacing: 4, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>PREP TIME REMAINING</div>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 52, fontWeight: 900, lineHeight: 1, color: isUrgent ? "#ff4444" : "#ff6b35", transition: "color 0.5s" }}>
                  {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                </div>
              </>}
        </div>
        <div style={{ textAlign: "right", fontFamily: "'Orbitron', monospace", fontSize: 11, letterSpacing: 2 }}>
          <div style={{ color: "rgba(255,255,255,0.25)", marginBottom: 4, fontSize: 9 }}>PRESENTATION</div>
          <div style={{ color: "#ff6b35" }}>5 MIN / TEAM</div>
        </div>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.05)", position: "relative", zIndex: 3, flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: isUrgent ? "#ff4444" : "#ff6b35", transition: "width 1s linear, background 0.5s" }} />
      </div>
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", zIndex: 3 }}>
        <div style={{ width: "52%", padding: "24px 32px 56px", borderRight: "1px solid rgba(255,107,53,0.15)", overflowY: "auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(255,107,53,0.7)", textTransform: "uppercase", marginBottom: 16 }}>CASE BRIEF</div>
          <div style={{ background: "rgba(255,107,53,0.05)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>SCENARIO</div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.4, marginBottom: 12 }}>Case study distributed to all teams</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>Read carefully, identify the core industrial engineering problem, and build a structured, data-backed solution. Use IE tools — lean, Six Sigma, process mapping — wherever applicable.</div>
          </div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(255,107,53,0.7)", textTransform: "uppercase", marginBottom: 14 }}>EVALUATION CRITERIA</div>
          {[
            { label: "Problem Identification", pct: 20, desc: "Correctly diagnose the root cause" },
            { label: "Solution Feasibility", pct: 30, desc: "Practical & implementable approach" },
            { label: "IE Tool Usage", pct: 25, desc: "Correct application of IE methods" },
            { label: "Presentation Clarity", pct: 15, desc: "Structure, flow, and communication" },
            { label: "Q&A Handling", pct: 10, desc: "Depth of understanding on the spot" },
          ].map((cr, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{cr.label}</span>
                <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, color: "#ff6b35", fontWeight: 700 }}>{cr.pct}%</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 5 }}>{cr.desc}</div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${cr.pct * 3.33}%`, background: "rgba(255,107,53,0.55)", borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ width: "48%", padding: "24px 28px 56px", overflowY: "auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(255,107,53,0.7)", textTransform: "uppercase", marginBottom: 16 }}>STANDINGS ENTERING ROUND 3</div>
          {sorted.length === 0
            ? <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 14, letterSpacing: 3, marginTop: 40, textAlign: "center" }}>NO TEAMS YET</div>
            : sorted.map((t, i) => {
                const id = t._id || t.id;
                const total = t.r1 + t.r2 + t.r3;
                const c = i < podiumColors.length ? podiumColors[i] : "rgba(255,255,255,0.5)";
                return (
                  <div key={id} style={{ marginBottom: 12, padding: "14px 18px", background: i === 0 ? "rgba(255,215,0,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${i === 0 ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 16, color: c, minWidth: 30 }}>{medals[i] || `#${i + 1}`}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", flex: 1 }}>{t.name}</span>
                      <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 22, fontWeight: 900, color: c }}>{total}</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${(total / maxScore) * 100}%`, background: c, borderRadius: 2, transition: "width 0.6s" }} />
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                      {[["R1", t.r1, "#00d4aa"], ["R2", t.r2, "#4a9eff"]].map(([lbl, score, lc]) => (
                        <span key={lbl} style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}><span style={{ color: lc }}>{lbl}</span>:{score}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
      <SponsorTicker />
      <CornerAccents color="rgba(255,107,53,0.6)" />
      <style>{`@keyframes urgentPulse{0%,100%{opacity:0}50%{opacity:1}}`}</style>
    </div>
  );
}

// ─── LEADERBOARD SIDEBAR ──────────────────────────────────────────────────────
function LeaderboardSidebar({ teams }) {
  const sorted = [...teams].sort((a, b) => (b.r1 + b.r2 + b.r3) - (a.r1 + a.r2 + a.r3));
  const podiumColors = ["#FFD700", "#C0C0C0", "#CD7F32", "#4a9eff", "#a855f7", "#ff6b35", "#22d3ee"];
  const medals = ["🥇", "🥈", "🥉"];
  const prevRef = useRef({});
  const [animating, setAnimating] = useState({});
  useEffect(() => {
    const newOrder = {};
    sorted.forEach((t, i) => { newOrder[t._id || t.id] = i; });
    const newAnim = {};
    Object.entries(newOrder).forEach(([id, ni]) => { const pi = prevRef.current[id]; if (pi !== undefined && pi !== ni) newAnim[id] = ni < pi ? "up" : "down"; });
    setAnimating(newAnim);
    prevRef.current = newOrder;
    if (Object.keys(newAnim).length > 0) { const t = setTimeout(() => setAnimating({}), 1200); return () => clearTimeout(t); }
  }, [JSON.stringify(sorted.map(t => (t._id || t.id) + t.r1 + t.r2 + t.r3))]);
  const max = Math.max(...teams.map(t => t.r1 + t.r2 + t.r3), 1);
  return (
    <div style={{ width: "30%", height: "100%", borderRight: "1px solid rgba(74,158,255,0.2)", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(74,158,255,0.15)", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 9, letterSpacing: 4, color: "#4a9eff", marginBottom: 2 }}>LIVE</div>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>LEADERBOARD</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
        {teams.length === 0 ? <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, textAlign: "center", marginTop: 20, letterSpacing: 2 }}>NO TEAMS</div>
          : sorted.map((t, i) => {
              const id = t._id || t.id;
              const total = t.r1 + t.r2 + t.r3;
              const anim = animating[id];
              const rankColor = i < podiumColors.length ? podiumColors[i] : "rgba(255,255,255,0.5)";
              return (
                <div key={id} style={{ padding: "10px 12px", borderRadius: 10, background: anim === "up" ? "rgba(0,212,170,0.15)" : anim === "down" ? "rgba(255,80,80,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${anim === "up" ? "rgba(0,212,170,0.5)" : anim === "down" ? "rgba(255,80,80,0.3)" : "rgba(255,255,255,0.06)"}`, transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)", transform: anim ? "scale(1.02)" : "scale(1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, minWidth: 26, color: rankColor }}>{medals[i] || `#${i + 1}`}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {anim === "up" && <span style={{ fontSize: 11, color: "#00d4aa", animation: "bounceUp 0.6s ease-out" }}>▲</span>}
                      {anim === "down" && <span style={{ fontSize: 11, color: "#ff5050", animation: "bounceDown 0.6s ease-out" }}>▼</span>}
                      <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 17, fontWeight: 900, color: rankColor }}>{total}</span>
                    </div>
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${(total / max) * 100}%`, background: rankColor, borderRadius: 2, transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    {[["R1", t.r1, "#00d4aa"], ["R2", t.r2, "#4a9eff"], ["R3", t.r3, "#ff6b35"]].map(([lbl, sc, c]) => (
                      <span key={lbl} style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}><span style={{ color: c }}>{lbl}</span>:{sc}</span>
                    ))}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}

// ─── QUESTION SCREEN ──────────────────────────────────────────────────────────
function QuestionScreen({ roundNum, qIndex, showAnswer, timeLeft, teams }) {
  const qs = QUESTIONS[`round${roundNum}`] || [];
  const q = qs[qIndex];
  const colors = { 1: "#00d4aa", 2: "#4a9eff" };
  const c = colors[roundNum] || "#00d4aa";
  const showSidebar = roundNum === 2;
  const optLabels = ["A", "B", "C", "D"];
  const maxT = roundNum === 1 ? 30 : 45;
  const pct = (timeLeft / maxT) * 100;
  if (!q) return (
    <div style={{ width: "100vw", height: "100vh", background: "#020f0d", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 32, color: "#00d4aa", paddingBottom: 44 }}>ROUND {roundNum} COMPLETE</div>
      <SponsorTicker />
    </div>
  );
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020f0d", display: "flex", flexDirection: "column", position: "relative", fontFamily: "'Rajdhani', sans-serif" }}>
      <GridBg />
      <div style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 40px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, color: c, letterSpacing: 4 }}>ROUND {roundNum}</div>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: 4 }}>Q{qIndex + 1} / {qs.length}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 36, fontWeight: 900, color: timeLeft <= 10 ? "#ff4444" : c }}>{String(timeLeft).padStart(2, "0")}</div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)" }}>SEC</div>
        </div>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.05)", position: "relative", zIndex: 3, flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: timeLeft <= 10 ? "#ff4444" : c, transition: "width 1s linear, background 0.3s" }} />
      </div>
      <div style={{ flex: 1, display: "flex", position: "relative", zIndex: 3, overflow: "hidden" }}>
        {showSidebar && <LeaderboardSidebar teams={teams} />}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: showSidebar ? "20px 36px 56px" : "20px 60px 56px", gap: 28 }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: showSidebar ? "clamp(16px, 2.3vw, 32px)" : "clamp(22px, 3.5vw, 44px)", fontWeight: 700, textAlign: "center", color: "#fff", lineHeight: 1.3, margin: 0 }}>{q.q}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
            {q.options.map((opt, i) => {
              const isCorrect = showAnswer && i === q.ans;
              return (
                <div key={i} style={{ padding: showSidebar ? "14px 16px" : "22px 26px", background: isCorrect ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.03)", border: isCorrect ? "2px solid #00d4aa" : `1px solid ${c}22`, borderRadius: 12, display: "flex", alignItems: "center", gap: 12, transition: "all 0.4s" }}>
                  <span style={{ fontFamily: "'Orbitron', monospace", fontSize: showSidebar ? 18 : 26, fontWeight: 900, color: isCorrect ? "#00d4aa" : c, minWidth: 28 }}>{optLabels[i]}</span>
                  <span style={{ fontSize: showSidebar ? 15 : 20, color: isCorrect ? "#00d4aa" : "rgba(255,255,255,0.8)", fontWeight: isCorrect ? 700 : 400, lineHeight: 1.3 }}>{opt}</span>
                  {isCorrect && <span style={{ marginLeft: "auto", fontSize: 20 }}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <SponsorTicker />
      <CornerAccents />
      <style>{`@keyframes bounceUp{0%{transform:translateY(4px);opacity:0}60%{transform:translateY(-3px)}100%{transform:translateY(0);opacity:1}}@keyframes bounceDown{0%{transform:translateY(-4px);opacity:0}60%{transform:translateY(3px)}100%{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}

// ─── SCOREBOARD ───────────────────────────────────────────────────────────────
function ScoreboardScreen({ teams }) {
  const sorted = [...teams].sort((a, b) => (b.r1 + b.r2 + b.r3) - (a.r1 + a.r2 + a.r3));
  const podiumColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020f0d", display: "flex", flexDirection: "column", position: "relative", fontFamily: "'Rajdhani', sans-serif" }}>
      <GridBg />
      <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 60px 60px", flex: 1 }}>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, letterSpacing: 8, color: "#00d4aa", marginBottom: 8 }}>OPTIRELAY 2026</div>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 900, margin: "0 0 8px", color: "#fff" }}>FINAL LEADERBOARD</h1>
        <div style={{ width: 160, height: 2, background: "linear-gradient(90deg, transparent, #00d4aa, transparent)", marginBottom: 36 }} />
        {teams.length === 0
          ? <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 20, letterSpacing: 4 }}>NO TEAMS YET</div>
          : <div style={{ width: "100%", maxWidth: 900, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px 100px 100px 120px", gap: 14, padding: "8px 20px", fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
                <span>#</span><span>TEAM</span><span style={{ textAlign: "center" }}>R1</span><span style={{ textAlign: "center" }}>R2</span><span style={{ textAlign: "center" }}>R3</span><span style={{ textAlign: "center" }}>TOTAL</span>
              </div>
              {sorted.map((team, i) => {
                const total = team.r1 + team.r2 + team.r3;
                const isTop = i < 3;
                const c = isTop ? podiumColors[i] : "rgba(255,255,255,0.7)";
                return (
                  <div key={team._id || team.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px 100px 100px 120px", gap: 14, padding: "18px 20px", background: isTop ? `${podiumColors[i]}10` : "rgba(255,255,255,0.02)", border: `1px solid ${isTop ? podiumColors[i] + "44" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, alignItems: "center" }}>
                    <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 20, fontWeight: 900, color: c }}>{medals[i] || `#${i + 1}`}</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{team.name}</span>
                    {[team.r1, team.r2, team.r3].map((s, ri) => <span key={ri} style={{ fontFamily: "'Orbitron', monospace", fontSize: 17, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>{s}</span>)}
                    <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 24, fontWeight: 900, color: c, textAlign: "center" }}>{total}</span>
                  </div>
                );
              })}
            </div>}
      </div>
      <SponsorTicker />
      <CornerAccents />
    </div>
  );
}

// ─── DISPLAY APP ──────────────────────────────────────────────────────────────
function DisplayApp() {
  const screen = useSyncLS("screen", "welcome");
  const roundNum = useSyncLS("roundNum", 1);
  const subPhase = useSyncLS("subPhase", "instructions");
  const qIndex = useSyncLS("qIndex", 0);
  const showAnswer = useSyncLS("showAnswer", false);
  const timeLeft = useSyncLS("timeLeft", 30);
  const teams = useSyncLS("teams", []);
  if (screen === "scoreboard") return <ScoreboardScreen teams={teams} />;
  if (screen === "round") {
    if (subPhase === "instructions") return <RoundInstructions roundNum={roundNum} />;
    if (subPhase === "countdown") return <CountdownScreen onDone={() => {}} />;
    if (roundNum === 3 && subPhase === "casecomp") return <Round3CaseScreen teams={teams} />;
    if (subPhase === "question") return <QuestionScreen roundNum={roundNum} qIndex={qIndex} showAnswer={showAnswer} timeLeft={timeLeft} teams={teams} />;
  }
  return <WelcomeScreen />;
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminApp() {
  const [screen, setScreenRaw] = useLS("screen", "welcome");
  const [roundNum, setRoundNumRaw] = useLS("roundNum", 1);
  const [subPhase, setSubPhaseRaw] = useLS("subPhase", "instructions");
  const [qIndex, setQIndexRaw] = useLS("qIndex", 0);
  const [showAnswer, setShowAnswerRaw] = useLS("showAnswer", false);
  const [timeLeft, setTimeLeftRaw] = useLS("timeLeft", 30);
  const [teams, setTeamsRaw] = useLS("teams", []);
  const [newTeamName, setNewTeamName] = useState("");
  const [tab, setTab] = useState("control");
  const timerRef = useRef(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [dbStatus, setDbStatus] = useState("idle");
  const [dbMsg, setDbMsg] = useState("");

  const setScreen = v => setScreenRaw(v);
  const setSubPhase = v => setSubPhaseRaw(v);
  const setQIndex = v => setQIndexRaw(v);
  const setShowAnswer = v => setShowAnswerRaw(v);
  const setTimeLeft = v => setTimeLeftRaw(v);
  const setRoundNum = v => setRoundNumRaw(v);

  const fetchTeams = useCallback(async () => {
    try {
      setDbStatus("loading");
      const data = await apiFetch("/api/teams");
      setTeamsRaw(data);
      setDbStatus("ok");
      setDbMsg(`Synced ${data.length} teams from DB`);
    } catch {
      setDbStatus("error");
      setDbMsg("Backend offline — data saved locally only");
    }
  }, []);

  useEffect(() => { fetchTeams(); }, []);
  useEffect(() => { const id = setInterval(async () => { try { const d = await apiFetch("/api/teams"); setTeamsRaw(d); } catch {} }, 5000); return () => clearInterval(id); }, []);

  const startRound = (rn) => { setRoundNum(rn); setQIndexRaw(0); setShowAnswerRaw(false); setSubPhaseRaw("instructions"); setScreenRaw("round"); setTimerRunning(false); };
  const startCountdown = () => { setSubPhase("countdown"); setTimeout(() => setSubPhase("question"), 6000); };
  const maxTime = () => roundNum === 1 ? 30 : 45;
  const startTimer = () => {
    if (timerRunning) return; setTimerRunning(true); setTimeLeft(maxTime()); clearInterval(timerRef.current);
    timerRef.current = setInterval(() => { setTimeLeft(prev => { if (prev <= 1) { clearInterval(timerRef.current); setTimerRunning(false); return 0; } return prev - 1; }); }, 1000);
  };
  const stopTimer = () => { clearInterval(timerRef.current); setTimerRunning(false); };
  const resetTimer = () => { stopTimer(); setTimeLeft(maxTime()); };
  const nextQ = () => { const qs = QUESTIONS[`round${roundNum}`] || []; if (qIndex < qs.length - 1) { setQIndex(qIndex + 1); setShowAnswer(false); resetTimer(); } };
  const prevQ = () => { if (qIndex > 0) { setQIndex(qIndex - 1); setShowAnswer(false); resetTimer(); } };

  const addTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      const team = await apiFetch("/api/teams", { method: "POST", body: JSON.stringify({ name: newTeamName.trim() }) });
      setTeamsRaw(prev => [...prev, team]);
    } catch {
      setTeamsRaw(prev => [...prev, { id: Date.now(), name: newTeamName.trim(), r1: 0, r2: 0, r3: 0 }]);
    }
    setNewTeamName("");
  };

  const removeTeam = async (t) => {
    const id = t._id || t.id;
    try { await apiFetch(`/api/teams/${id}`, { method: "DELETE" }); } catch {}
    setTeamsRaw(prev => prev.filter(x => (x._id || x.id) !== id));
  };

  const updateScore = async (t, round, delta) => {
    const id = t._id || t.id;
    const nv = Math.max(0, (t[round] || 0) + delta);
    setTeamsRaw(prev => prev.map(x => (x._id || x.id) === id ? { ...x, [round]: nv } : x));
    try { await apiFetch(`/api/teams/${id}`, { method: "PATCH", body: JSON.stringify({ [round]: nv }) }); } catch {}
  };

  const setScore = async (t, round, val) => {
    const id = t._id || t.id;
    const n = Math.max(0, parseInt(val) || 0);
    setTeamsRaw(prev => prev.map(x => (x._id || x.id) === id ? { ...x, [round]: n } : x));
    try { await apiFetch(`/api/teams/${id}`, { method: "PATCH", body: JSON.stringify({ [round]: n }) }); } catch {}
  };

  const resetAllScores = async () => {
    if (!window.confirm("Reset ALL scores to 0?")) return;
    for (const t of teams) { try { await apiFetch(`/api/teams/${t._id || t.id}`, { method: "PATCH", body: JSON.stringify({ r1: 0, r2: 0, r3: 0 }) }); } catch {} }
    setTeamsRaw(prev => prev.map(t => ({ ...t, r1: 0, r2: 0, r3: 0 })));
  };

  const rc = { 1: "#00d4aa", 2: "#4a9eff", 3: "#ff6b35" }[roundNum] || "#00d4aa";
  const qs = QUESTIONS[`round${roundNum}`] || [];
  const currentQ = qs[qIndex];

  const tabStyle = t => ({ padding: "10px 24px", fontFamily: "'Orbitron', monospace", fontSize: 11, letterSpacing: 2, cursor: "pointer", border: "none", borderRadius: 8, background: tab === t ? "#00d4aa" : "rgba(0,212,170,0.08)", color: tab === t ? "#000" : "#00d4aa", fontWeight: 700, transition: "all 0.2s" });
  const inBtn = (label, onClick, color = "#00d4aa", disabled = false) => (
    <button onClick={onClick} disabled={disabled} style={{ padding: "8px 14px", fontFamily: "'Orbitron', monospace", fontSize: 10, letterSpacing: 1.5, cursor: disabled ? "default" : "pointer", borderRadius: 6, border: `1px solid ${disabled ? "rgba(255,255,255,0.1)" : color + "55"}`, background: disabled ? "rgba(255,255,255,0.03)" : `${color}15`, color: disabled ? "rgba(255,255,255,0.25)" : color, fontWeight: 700, whiteSpace: "nowrap" }}>{label}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#020f0d", color: "#fff", fontFamily: "'Rajdhani', sans-serif" }}>
      <GridBg />
      <div style={{ position: "relative", zIndex: 3, padding: "18px 32px", borderBottom: "1px solid rgba(0,212,170,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 20, fontWeight: 900, color: "#00d4aa", letterSpacing: 2 }}>⚙ ADMIN PANEL</div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>OPTIRELAY 2026 · NIT JALANDHAR</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ padding: "4px 10px", borderRadius: 6, background: dbStatus === "ok" ? "rgba(0,212,170,0.1)" : dbStatus === "error" ? "rgba(255,80,80,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${dbStatus === "ok" ? "rgba(0,212,170,0.3)" : dbStatus === "error" ? "rgba(255,80,80,0.3)" : "rgba(255,255,255,0.1)"}`, fontSize: 10, letterSpacing: 1.5, color: dbStatus === "ok" ? "#00d4aa" : dbStatus === "error" ? "#ff5050" : "rgba(255,255,255,0.3)" }}>
            {dbStatus === "ok" ? "● DB OK" : dbStatus === "error" ? "● DB OFFLINE" : "● CONNECTING"}
          </div>
          <button onClick={fetchTeams} style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)", color: "#00d4aa", fontSize: 10, cursor: "pointer", fontFamily: "'Orbitron', monospace" }}>↺ SYNC</button>
          <div style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)", fontSize: 10, letterSpacing: 2, color: "#00d4aa" }}>
            {screen.toUpperCase()} {screen === "round" ? `→ R${roundNum} ${subPhase.toUpperCase()}` : ""}
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 3, padding: "14px 32px 6px", display: "flex", gap: 8 }}>
        {["control", "teams", "scoring"].map(t => <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{t.toUpperCase()}</button>)}
      </div>

      <div style={{ position: "relative", zIndex: 3, padding: "14px 32px 32px", display: "flex", flexDirection: "column", gap: 14 }}>

        {tab === "control" && <>
          <div style={{ background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.15)", borderRadius: 14, padding: 22 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(0,212,170,0.7)", textTransform: "uppercase", marginBottom: 14 }}>SCREEN NAVIGATION</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
              {[{ label: "WELCOME", action: () => setScreen("welcome"), s: "#00d4aa" }, { label: "R1 INSTRUCTIONS", action: () => startRound(1), s: "#00d4aa" }, { label: "R2 INSTRUCTIONS", action: () => startRound(2), s: "#4a9eff" }, { label: "R3 INSTRUCTIONS", action: () => startRound(3), s: "#ff6b35" }, { label: "SCOREBOARD", action: () => setScreen("scoreboard"), s: "#a855f7" }].map(({ label, action, s }) => (
                <GlowButton key={label} onClick={action} color={s}>{label}</GlowButton>
              ))}
            </div>
          </div>

          {screen === "round" && (
            <div style={{ background: `${rc}08`, border: `1px solid ${rc}22`, borderRadius: 14, padding: 22 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: rc, textTransform: "uppercase", marginBottom: 14 }}>ROUND {roundNum} CONTROLS — {subPhase.toUpperCase()}</div>
              {roundNum !== 3 ? (
                <>
                  <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                    {inBtn("SHOW INSTRUCTIONS", () => setSubPhase("instructions"), rc)}
                    {inBtn("COUNTDOWN → QUESTIONS", () => startCountdown(), rc, subPhase === "countdown")}
                    {inBtn("JUMP TO QUESTIONS", () => setSubPhase("question"), rc)}
                  </div>
                  {subPhase === "question" && <>
                    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 14, marginBottom: 10 }}>
                      <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>QUESTION NAV</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>Q{qIndex + 1}/{qs.length}: <span style={{ color: "#fff" }}>{currentQ?.q}</span></div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {inBtn("◀ PREV", prevQ, rc, qIndex === 0)}
                        {inBtn("▶ NEXT", nextQ, rc, qIndex >= qs.length - 1)}
                        <div style={{ marginLeft: "auto" }}>{inBtn(showAnswer ? "HIDE ANSWER" : "REVEAL ANSWER", () => setShowAnswer(!showAnswer), showAnswer ? "#ff4444" : "#00d4aa")}</div>
                      </div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>TIMER — {timeLeft}s</div>
                      <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, marginBottom: 10 }}>
                        <div style={{ height: "100%", width: `${(timeLeft / maxTime()) * 100}%`, background: timeLeft <= 10 ? "#ff4444" : rc, borderRadius: 3, transition: "width 1s linear" }} />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {inBtn(timerRunning ? "⏸ PAUSE" : "▶ START", timerRunning ? stopTimer : startTimer, rc)}
                        {inBtn("↺ RESET", resetTimer, "#ff6b35")}
                      </div>
                    </div>
                  </>}
                </>
              ) : (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {inBtn("SHOW R3 INSTRUCTIONS", () => setSubPhase("instructions"), rc)}
                  {inBtn("▶ START 20-MIN CASE TIMER", () => setSubPhase("casecomp"), rc)}
                </div>
              )}
            </div>
          )}
        </>}

        {tab === "teams" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.15)", borderRadius: 14, padding: 22 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(0,212,170,0.7)", textTransform: "uppercase", marginBottom: 14 }}>ADD TEAM</div>
              <div style={{ display: "flex", gap: 10 }}>
                <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} onKeyDown={e => e.key === "Enter" && addTeam()} placeholder="Team name..." style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", fontFamily: "'Rajdhani', sans-serif" }} />
                <GlowButton onClick={addTeam}>+ ADD</GlowButton>
              </div>
              {dbMsg && <div style={{ marginTop: 8, fontSize: 11, color: dbStatus === "ok" ? "rgba(0,212,170,0.6)" : "rgba(255,100,100,0.6)", letterSpacing: 1 }}>{dbMsg}</div>}
            </div>
            <div style={{ background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.15)", borderRadius: 14, padding: 22 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(0,212,170,0.7)", textTransform: "uppercase", marginBottom: 14 }}>TEAMS ({teams.length})</div>
              {teams.length === 0
                ? <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No teams added yet</div>
                : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {teams.map(t => {
                      const id = t._id || t.id;
                      return (
                        <div key={id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 9, border: "1px solid rgba(255,255,255,0.06)" }}>
                          <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#fff" }}>{t.name}</span>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: 2 }}>R1:{t.r1} R2:{t.r2} R3:{t.r3} | <span style={{ color: "#00d4aa" }}>{t.r1 + t.r2 + t.r3}</span></span>
                          <button onClick={() => removeTeam(t)} style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff5050", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "'Orbitron', monospace" }}>✕</button>
                        </div>
                      );
                    })}
                    <button onClick={resetAllScores} style={{ alignSelf: "flex-start", marginTop: 6, padding: "6px 14px", background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#ff5050", borderRadius: 6, cursor: "pointer", fontSize: 10, fontFamily: "'Orbitron', monospace", letterSpacing: 1.5 }}>↺ RESET ALL SCORES</button>
                  </div>}
            </div>
          </div>
        )}

        {tab === "scoring" && (
          teams.length === 0
            ? <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.3)", fontSize: 16, letterSpacing: 2 }}>No teams. Add in TEAMS tab.</div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                  {teams.map(t => {
                    const id = t._id || t.id;
                    const total = t.r1 + t.r2 + t.r3;
                    return (
                      <div key={id} style={{ background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.15)", borderRadius: 14, padding: 18 }}>
                        <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{t.name}</div>
                        <div style={{ fontSize: 11, letterSpacing: 3, color: "#00d4aa", marginBottom: 14 }}>TOTAL: {total}</div>
                        {[["R1", "r1", "#00d4aa"], ["R2", "r2", "#4a9eff"], ["R3", "r3", "#ff6b35"]].map(([label, key, c]) => (
                          <div key={key} style={{ marginBottom: 11 }}>
                            <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.35)", marginBottom: 5 }}>ROUND {label.slice(1)}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <button onClick={() => updateScore(t, key, -5)} style={{ width: 30, height: 30, background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff5050", borderRadius: 6, cursor: "pointer", fontSize: 15, fontWeight: 700 }}>−</button>
                              <input type="number" value={t[key]} onChange={e => setScore(t, key, e.target.value)} style={{ width: 65, textAlign: "center", padding: "5px 6px", background: "rgba(255,255,255,0.05)", border: `1px solid ${c}44`, borderRadius: 6, color: c, fontSize: 17, fontFamily: "'Orbitron', monospace", fontWeight: 700, outline: "none" }} />
                              <button onClick={() => updateScore(t, key, 5)} style={{ width: 30, height: 30, background: `${c}15`, border: `1px solid ${c}44`, color: c, borderRadius: 6, cursor: "pointer", fontSize: 15, fontWeight: 700 }}>+</button>
                              <button onClick={() => updateScore(t, key, 1)} style={{ padding: "4px 8px", background: `${c}10`, border: `1px solid ${c}33`, color: c, borderRadius: 6, cursor: "pointer", fontSize: 10, fontFamily: "'Orbitron', monospace" }}>+1</button>
                              <button onClick={() => updateScore(t, key, 10)} style={{ padding: "4px 8px", background: `${c}10`, border: `1px solid ${c}33`, color: c, borderRadius: 6, cursor: "pointer", fontSize: 10, fontFamily: "'Orbitron', monospace" }}>+10</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
                <div style={{ background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.15)", borderRadius: 14, padding: 22 }}>
                  <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(0,212,170,0.7)", textTransform: "uppercase", marginBottom: 14 }}>LIVE STANDINGS</div>
                  {[...teams].sort((a, b) => (b.r1 + b.r2 + b.r3) - (a.r1 + a.r2 + a.r3)).map((t, i) => {
                    const total = t.r1 + t.r2 + t.r3;
                    const max = Math.max(...teams.map(x => x.r1 + x.r2 + x.r3), 1);
                    return (
                      <div key={t._id || t.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 12, color: "#00d4aa", minWidth: 22 }}>#{i + 1}</span>
                        <span style={{ fontSize: 13, color: "#fff", minWidth: 140 }}>{t.name}</span>
                        <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                          <div style={{ height: "100%", width: `${(total / max) * 100}%`, background: "#00d4aa", borderRadius: 3, transition: "width 0.4s" }} />
                        </div>
                        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 15, fontWeight: 700, color: "#00d4aa", minWidth: 36, textAlign: "right" }}>{total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        @keyframes countPop{0%{transform:scale(1.4);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes urgentPulse{0%,100%{opacity:0}50%{opacity:1}}
        *{box-sizing:border-box}
        input[type=number]::-webkit-inner-spin-button{opacity:1}
      `}</style>
    </div>
  );
}


// ─── ADMIN LOGIN GATE ─────────────────────────────────────────────────────────
function AdminGate() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!pw.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthed(true);
      } else {
        setError("Incorrect password. Try again.");
        setPw("");
      }
    } catch {
      setError("Cannot reach server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  if (authed) return <AdminApp />;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020f0d", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", fontFamily: "'Rajdhani', sans-serif" }}>
      <GridBg />
      <CornerAccents />
      <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", width: 340 }}>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, letterSpacing: 6, color: "rgba(0,212,170,0.5)", marginBottom: 12 }}>OPTIRELAY 2026</div>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: 2, marginBottom: 4 }}>ADMIN ACCESS</div>
        <div style={{ width: 60, height: 2, background: "linear-gradient(90deg, transparent, #00d4aa, transparent)", marginBottom: 32 }} />
        <div style={{ width: "100%", background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Enter Password</div>
          <input
            type="password"
            placeholder="••••••••••••"
            value={pw}
            autoFocus
            onChange={e => { setPw(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ padding: "12px 16px", borderRadius: 8, border: `1px solid ${error ? "rgba(255,80,80,0.5)" : "rgba(0,212,170,0.3)"}`, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none", fontFamily: "'Orbitron', monospace", fontSize: 16, letterSpacing: 4, width: "100%", boxSizing: "border-box" }}
          />
          {error && <div style={{ fontSize: 11, color: "#ff5050", letterSpacing: 1, marginTop: -6 }}>⚠ {error}</div>}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ padding: "12px", background: loading ? "rgba(0,212,170,0.3)" : "#00d4aa", border: "none", borderRadius: 8, cursor: loading ? "default" : "pointer", fontWeight: 900, color: "#000", fontFamily: "'Orbitron', monospace", fontSize: 13, letterSpacing: 3, transition: "all 0.2s" }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#00ffcc"; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#00d4aa"; }}
          >
            {loading ? "VERIFYING…" : "UNLOCK"}
          </button>
        </div>
        <div style={{ marginTop: 20, fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.15)", textTransform: "uppercase" }}>Authorised personnel only</div>
      </div>
    </div>
  );
}

export default function App() {
  const isAdmin = typeof window !== "undefined" && window.location.search.includes("admin");
  return isAdmin ? <AdminGate /> : <DisplayApp />;
}