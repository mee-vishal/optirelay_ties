import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API = "https://optirelay-ties.onrender.com";
// const API = "http://localhost:5000";
const WS_URL = API.replace(/^https/, "wss").replace(/^http/, "ws");

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const QUESTIONS = {
  round1: [
  { q: "Which situation BEST reflects Jevons Paradox?", options: ["Efficiency reduces total consumption", "Efficiency lowers cost, increasing demand", "Efficiency has no demand impact", "Both A and C"], ans: 1 },

  { q: "Why are jet engines harder to develop than rocket engines despite lower peak temperatures?", options: ["Rockets face more fatigue", "Jet engines face sustained creep and fatigue", "Both face identical conditions", "None of these"], ans: 1 },

  { q: "Which is a key technological bottleneck in modern jet engines?", options: ["Polycrystalline blades", "Lack of cooling systems", "Single crystal turbine blade manufacturing", "Both A and B"], ans: 2 },

  { q: "In speech-to-math AI systems, what is the MOST critical transformation step?", options: ["Direct symbolic mapping", "Vectorization into embeddings", "Grammar parsing first", "Both B and C"], ans: 3 },

  { q: "In IoT ecosystems, digital twins are BEST described as:", options: ["Physical replacements", "Static visualization tools", "Dynamic virtual replicas for simulation", "Both B and C"], ans: 2 },

  { q: "Which statement correctly distinguishes Eulerian and Newtonian approaches?", options: ["Eulerian tracks particles", "Newtonian ignores variation", "Eulerian observes fixed points", "Both A and B"], ans: 2 },

  { q: "A company's revenue rises from ₹200 to ₹260 crore. What is the % increase?", options: ["30%", "25%", "60%", "Both A and B"], ans: 0 },

  { q: "Proof resilience differs from resilience because it is:", options: ["Only theoretical", "Mathematically verified robustness", "Limited to software", "Both B and C"], ans: 1 },

  { q: "Which is generally faster during execution?", options: ["Interpreter", "Compiler", "Both equal", "Interpreter due to memory"], ans: 1 },

  { q: "Which statement about ramjet engine is correct?", options: ["Work at zero speed", "Carry oxidizer", "Require high speed & atmospheric air", "None of these"], ans: 2 },

  { q: "Which airline is linked to the largest aircraft order in history?", options: ["Emirates", "IndiGo", "American Airlines", "Air India"], ans: 3 },

  { q: "Why do airlines prefer leasing aircraft?", options: ["Lower upfront capital & flexibility", "Higher maintenance cost", "Ownership reduces risk", "Both A and B"], ans: 0 },

  { q: "Which scenario BEST demonstrates sunk cost fallacy?", options: ["Ignoring past costs", "Continuing due to past investment", "Future-based decisions", "Both A and C"], ans: 1 },

  { q: "Which company executed the largest share buyback program in history as of 2024, signaling massive cash reserves rather than reinvestment?", options: ["Microsoft", "Apple", "Alphabet", "Saudi Aramco"], ans: 1 },

  { q: "The concept of 'too big to fail' became globally prominent after which financial crisis event exposed systemic risk in interconnected banks?", options: ["Dot-com Bubble", "Asian Financial Crisis", "2008 Lehman Brothers Collapse", "Eurozone Debt Crisis"], ans: 2 },

  { q: "Customer churn ratio refers to:", options: ["Customers retained", "Customer acquisition rate", "Customers lost percentage", "Both A and B"], ans: 2 },

  { q: "The Evergrande crisis was primarily due to:", options: ["Agricultural debt", "Overleveraged real estate expansion", "Banking collapse", "Both A and C"], ans: 1 },

  { q: "Positive cash flow with rising working capital indicates:", options: ["Inefficiency", "Strong liquidity", "High debt", "Both A and C"], ans: 1 },

  { q: "A circular supply chain focuses on:", options: ["Linear production", "Recycling and reuse", "Global sourcing", "Both A and C"], ans: 1 },

  { q: "Which country holds the MOST strategic leverage over the Strait of Malacca?", options: ["India", "China", "Singapore", "None of these"], ans: 0 },

  { q: "Which country dominates advanced lithography technology?", options: ["Taiwan", "Japan", "Netherlands", "China"], ans: 2 },

  { q: "What is the core USP of SpaceX?", options: ["Cryogenic fuels", "Autonomous navigation", "Reusable rockets", "None of these"], ans: 2 },

  { q: "Which error metric is MORE sensitive to outliers?", options: ["MAE", "MSE", "Both equal", "None"], ans: 1 },

  { q: "High precision but low accuracy means:", options: ["Scattered values", "Clustered but far from true value", "Clustered near true value", "None"], ans: 1 },

  { q: "Why is cast iron used in lathe beds?", options: ["High tensile strength", "Poor damping", "Good vibration damping", "Both A and B"], ans: 2 },

  { q: "If a startup increases revenue rapidly but burns cash faster, it risks a ________ crisis.", options: ["Liquidity", "Profitability", "Demand", "Supply"], ans: 0 },

  { q: "In financial terms, EBITDA excludes interest, tax, depreciation and ________.", options: ["Amortization", "Inflation", "Dividends", "Revenue"], ans: 0 },

  { q: "A trader exploiting tiny price differences across exchanges performs ________.", options: ["Speculation", "Hedging", "Arbitrage", "Shorting"], ans: 2 },

  { q: "The parent company behind Claude AI is:", options: ["OpenAI", "Google", "Anthropic", "Meta"], ans: 2 },

  { q: "Choosing one option means giving up another—the lost benefit is called ________ cost.", options: ["Fixed", "Marginal", "Sunk", "Opportunity"], ans: 3 }
],

   round2 :[

    {q: "Cost that cannot be recovered once spent: ____ cost",options: ["sunk"],ans: 0,},
    { q: "Opposite of inflation: ____", options: ["Deflation"], ans: 0 },
    { q: "if dataset is small model overfits or underfits", options: ["overfit"], ans: 0 },
    { q: "solve puzzle", options: ["5"], img:"/round2/puzzle2.png",ans: 0 },
    { q: " if bias is more  and varience is low is it underfitting or overfitting", options: ["underfitting"],ans: 0 },
    { q: " A firm dominating market with no competition: ____", options: ["Monopoly"],ans: 0 },
     { q: "company related to which sector ?", options: ["aviation"], img:"/round2/united.png",ans: 0 },
     { q: "company related to which sector ?", options: ["oil and gas"], img:"/round2/aramco.png",ans: 0 },
    { q: " In marketing, attracting customers without ads → ____ marketing", options: ["Inbound Marketing."],ans: 0 },
    { q: " A country importing more than exporting runs a ____ deficit", options: ["Trade"],ans: 0 },
    { q: "When a company repurchases its own shares from the market, the process is called a share ____.", options: ["Buyback"],ans: 0 },
    { q: "The central banking authority responsible for monetary policy in India is the ____.", options: ["RBI"],ans: 0 },
    { q: "When interest rates rise, the market value of existing bonds typically tends to ____.", options: ["Fall"],ans: 0 },
     { q: "name of company ?", options: ["hindustan unilever"], img:"/round2/unilever.png",ans: 0 },
     { q: "name of company ?", options: ["Goldman Sachs."], img:"/round2/gs.png",ans: 0 },
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
  { id: 1, name: "ProHawke", color: "#00d4aa", logo: "/logos/image.png" },
  { id: 2, name: "COLDOP", color: "#4a9eff", logo: "/logos/coldop.jpeg" },
];

const SLIDE_IMAGES = ["/logos/1.png", "/logos/2.png", "/logos/3.png"];
const ROUND_TIMERS = { 1: 30, 2: 10 };

// ─── WEBSOCKET HOOK ───────────────────────────────────────────────────────────
function useWebSocket(onMessage) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimer = useRef(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => { setConnected(true); clearTimeout(reconnectTimer.current); };
    ws.onmessage = (e) => { try { const msg = JSON.parse(e.data); onMessageRef.current(msg); } catch {} };
    ws.onclose = () => { setConnected(false); reconnectTimer.current = setTimeout(connect, 2000); };
    ws.onerror = () => { ws.close(); };
  }, []);

  useEffect(() => {
    connect();
    const pingId = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify({ type: "ping" }));
    }, 25000);
    return () => { clearInterval(pingId); clearTimeout(reconnectTimer.current); wsRef.current?.close(); };
  }, [connect]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(data));
  }, []);

  return { send, connected };
}

// ─── DISPLAY STATE HOOK ───────────────────────────────────────────────────────
function useDisplayState() {
  const [state, setState] = useState({ screen: "welcome", roundNum: 1, subPhase: "instructions", qIndex: 0, showAnswer: false, timeLeft: 30, timerRunning: false, slideIndex: 0 });
  const [teams, setTeams] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const { send, connected } = useWebSocket((msg) => {
    if (msg.type === "full_state") { setState(msg.state); setTeams(msg.teams); }
    if (msg.type === "state_update") setState(prev => ({ ...prev, ...msg.state }));
    if (msg.type === "timer_tick") setState(prev => ({ ...prev, timeLeft: msg.timeLeft }));
    if (msg.type === "team_update") setTeams(prev => prev.map(t => (t._id === msg.team._id ? msg.team : t)));
    if (msg.type === "team_added") setTeams(prev => [...prev, msg.team]);
    if (msg.type === "team_removed") setTeams(prev => prev.filter(t => t._id !== msg.id));
    if (msg.type === "teams_reset") setTeams(msg.teams);
  });
  useEffect(() => { setWsConnected(connected); }, [connected]);
  return { state, teams, wsConnected };
}

// ─── ADMIN STATE HOOK ─────────────────────────────────────────────────────────
function useAdminState() {
  const [state, setState] = useState({ screen: "welcome", roundNum: 1, subPhase: "instructions", qIndex: 0, showAnswer: false, timeLeft: 30, timerRunning: false, slideIndex: 0 });
  const [teams, setTeams] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const { send, connected } = useWebSocket((msg) => {
    if (msg.type === "full_state") { setState(msg.state); setTeams(msg.teams); }
    if (msg.type === "state_update") setState(prev => ({ ...prev, ...msg.state }));
    if (msg.type === "timer_tick") setState(prev => ({ ...prev, timeLeft: msg.timeLeft }));
    if (msg.type === "team_update") setTeams(prev => prev.map(t => (t._id === msg.team._id ? msg.team : t)));
    if (msg.type === "team_added") setTeams(prev => [...prev, msg.team]);
    if (msg.type === "team_removed") setTeams(prev => prev.filter(t => t._id !== msg.id));
    if (msg.type === "teams_reset") setTeams(msg.teams);
  });
  useEffect(() => { setWsConnected(connected); }, [connected]);

  const patchState = useCallback((patch) => {
    setState(prev => ({ ...prev, ...patch }));
    send({ type: "patch_state", payload: patch });
  }, [send]);

  const maxTime = useCallback((rn) => ROUND_TIMERS[rn] ?? 30, []);
  const startTimer = useCallback((rn) => { const d = maxTime(rn); patchState({ timerRunning: true, timerEndsAt: Date.now() + d * 1000, timeLeft: d }); }, [patchState, maxTime]);
  const stopTimer = useCallback(() => { patchState({ timerRunning: false, timerEndsAt: 0 }); }, [patchState]);
  const resetTimer = useCallback((rn) => { patchState({ timerRunning: false, timerEndsAt: 0, timeLeft: maxTime(rn) }); }, [patchState, maxTime]);
  const startRound = useCallback((rn) => { patchState({ screen: "round", roundNum: rn, qIndex: 0, showAnswer: false, subPhase: "instructions", timerRunning: false, timerEndsAt: 0, timeLeft: maxTime(rn) }); }, [patchState, maxTime]);
  const startCountdown = useCallback(() => { patchState({ subPhase: "countdown" }); setTimeout(() => patchState({ subPhase: "question" }), 6000); }, [patchState]);
  const nextQ = useCallback((qi, rn, qs) => { if (qi < qs.length - 1) patchState({ qIndex: qi + 1, showAnswer: false, timeLeft: maxTime(rn), timerRunning: false, timerEndsAt: 0 }); }, [patchState, maxTime]);
  const prevQ = useCallback((qi, rn) => { if (qi > 0) patchState({ qIndex: qi - 1, showAnswer: false, timeLeft: maxTime(rn), timerRunning: false, timerEndsAt: 0 }); }, [patchState, maxTime]);

  const addTeam = useCallback((name) => { send({ type: "add_team", payload: { name } }); }, [send]);
  const removeTeam = useCallback((t) => { send({ type: "remove_team", payload: { id: t._id || t.id } }); }, [send]);

  const updateScore = useCallback((t, round, delta) => {
    const id = t._id || t.id;
    const newVal = (t[round] || 0) + delta;
    setTeams(prev => prev.map(x => (x._id || x.id) === id ? { ...x, [round]: newVal } : x));
    send({ type: "patch_team", payload: { id, round, value: newVal } });
  }, [send]);

  const setScore = useCallback((t, round, val) => {
    const id = t._id || t.id;
    const n = parseInt(val) || 0;
    setTeams(prev => prev.map(x => (x._id || x.id) === id ? { ...x, [round]: n } : x));
    send({ type: "patch_team", payload: { id, round, value: n } });
  }, [send]);

  const resetAllScores = useCallback(() => {
    if (!window.confirm("Reset ALL scores to 0?")) return;
    send({ type: "reset_scores" });
  }, [send]);

  return { state, teams, wsConnected, patchState, startRound, startCountdown, nextQ, prevQ, startTimer, stopTimer, resetTimer, maxTime, addTeam, removeTeam, updateScore, setScore, resetAllScores };
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function GlowButton({ children, onClick, color = "#00d4aa", size = "md", style = {}, disabled = false }) {
  const pad = size === "sm" ? "8px 16px" : size === "lg" ? "14px 32px" : "10px 22px";
  const fs = size === "sm" ? 11 : size === "lg" ? 16 : 13;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: pad, fontFamily: "'Orbitron', monospace", fontSize: fs, fontWeight: 700, letterSpacing: 2, cursor: disabled ? "default" : "pointer", borderRadius: 8, border: `1px solid ${disabled ? "rgba(255,255,255,0.1)" : color + "55"}`, background: disabled ? "rgba(255,255,255,0.04)" : `${color}15`, color: disabled ? "rgba(255,255,255,0.25)" : color, transition: "all 0.2s", ...style }}
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

function HeaderLogos() {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, padding: "20px 180px", display: "flex", justifyContent: "space-between", alignItems: "center", pointerEvents: "none" }}>
      <img src="/logos/nitj.png" alt="NIT Jalandhar" style={{ height: "100px", width: "auto", objectFit: "contain" }} />
      <img src="/logos/ties.png" alt="TIES" style={{ height: "100px", width: "auto", objectFit: "contain" }} />
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

function WsIndicator({ connected }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, background: connected ? "rgba(0,212,170,0.1)" : "rgba(255,80,80,0.1)", border: `1px solid ${connected ? "rgba(0,212,170,0.35)" : "rgba(255,80,80,0.35)"}`, fontSize: 10, letterSpacing: 1.5, color: connected ? "#00d4aa" : "#ff5050", fontFamily: "'Orbitron', monospace" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: connected ? "#00d4aa" : "#ff5050", boxShadow: connected ? "0 0 6px #00d4aa" : "none", display: "inline-block" }} />
      {connected ? "WS LIVE" : "RECONNECTING…"}
    </div>
  );
}

// ─── ANIMATED BACKGROUND FOR WELCOME ─────────────────────────────────────────
function WelcomeAnimatedBg() {
  const particles = useMemo(() =>
    Array.from({ length: 45 }, (_, i) => ({
      id: i,
      x: ((i * 13.7 + 7) % 97) + 1.5,
      size: (i % 3) + 1.5,
      duration: 12 + (i % 14),
      delay: -((i * 1.7) % 14),
      color: i % 5 === 0 ? "#4a9eff" : i % 7 === 0 ? "rgba(255,255,255,0.8)" : "#00d4aa",
      opacity: 0.12 + (i % 4) * 0.07,
    })), []);

  return (
    <>
      <style>{`
        @keyframes float-up {
          0%   { transform: translateY(0)       scale(1);   opacity: 0;   }
          8%   { opacity: 1; }
          85%  { opacity: 0.7; }
          100% { transform: translateY(-102vh)  scale(0.4); opacity: 0;   }
        }
        @keyframes pulse-ring {
          0%   { transform: translate(-50%,-50%) scale(0.2); opacity: 0.55; }
          100% { transform: translate(-50%,-50%) scale(2.8); opacity: 0;   }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes rotate-rev {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(-360deg); }
        }
        @keyframes data-stream {
          0%   { opacity: 0; transform: scaleY(0); transform-origin: top; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; transform: scaleY(0.3); transform-origin: bottom; }
        }
      `}</style>

      <div style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden", pointerEvents: "none" }}>
        {particles.map(p => (
          <div key={p.id} style={{
            position: "absolute",
            left: `${p.x}%`,
            bottom: "-8px",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            opacity: p.opacity,
            animation: `float-up ${p.duration}s ${p.delay}s infinite linear`,
          }} />
        ))}
      </div>

      <div style={{ position: "absolute", top: "44%", left: "50%", zIndex: 1, pointerEvents: "none" }}>
        {[0, 1.8, 3.6].map((delay, i) => (
          <div key={i} style={{
            position: "absolute",
            width: 220,
            height: 220,
            border: `1px solid rgba(0,212,170,${0.18 - i * 0.04})`,
            borderRadius: "50%",
            animation: `pulse-ring ${5}s ${delay}s infinite ease-out`,
          }} />
        ))}
      </div>

      <div style={{ position: "absolute", top: "50%", left: "50%", zIndex: 1, pointerEvents: "none" }}>
        <div style={{
          position: "absolute",
          width: 520,
          height: 520,
          border: "1px dashed rgba(0,212,170,0.06)",
          borderRadius: "50%",
          transform: "translate(-50%,-50%)",
          animation: "rotate-slow 40s linear infinite",
        }}>
          {[0, 90, 180, 270].map(deg => (
            <div key={deg} style={{
              position: "absolute",
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "rgba(0,212,170,0.4)",
              top: "50%",
              left: "50%",
              transform: `rotate(${deg}deg) translateX(260px) translate(-50%,-50%)`,
            }} />
          ))}
        </div>

        <div style={{
          position: "absolute",
          width: 680,
          height: 680,
          border: "1px dashed rgba(74,158,255,0.04)",
          borderRadius: "50%",
          transform: "translate(-50%,-50%)",
          animation: "rotate-rev 60s linear infinite",
        }} />
      </div>

      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
        {[8, 21, 37, 52, 68, 83, 94].map((x, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${x}%`,
            top: 0,
            width: 1,
            height: `${30 + (i % 4) * 18}%`,
            background: `linear-gradient(to bottom, transparent, rgba(0,212,170,0.18), transparent)`,
            animation: `data-stream ${7 + i * 1.3}s ${-i * 1.1}s infinite ease-in-out`,
          }} />
        ))}
      </div>
    </>
  );
}

// ─── SPONSOR TICKER (bottom bar) ──────────────────────────────────────────────
export function SponsorTicker() {
  const [offset, setOffset] = useState(0);
  useEffect(() => { const id = setInterval(() => { setOffset((o) => (o + 0.6) % (SPONSORS.length * 260)); }, 16); return () => clearInterval(id); }, []);
  const items = [...SPONSORS, ...SPONSORS, ...SPONSORS];
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, height: 60, background: "rgba(0,0,0,0.6)", borderTop: "1px solid rgba(0,212,170,0.12)", backdropFilter: "blur(10px)", overflow: "hidden", display: "flex", alignItems: "center" }}>
      <div style={{ flexShrink: 0, padding: "0 18px", fontFamily: "'Orbitron', monospace", fontSize: 10, letterSpacing: 3, color: "rgba(0,212,170,0.6)", borderRight: "1px solid rgba(0,212,170,0.15)" }}>SPONSORS</div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ display: "flex", transform: `translateX(-${offset}px)`, whiteSpace: "nowrap" }}>
          {items.map((s, i) => (
            <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "0 50px", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: `${s.color}20`, border: `1px solid ${s.color}55`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <img src={s.logo} alt={s.name} style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain", filter: "brightness(1.2)" }} onError={e => { e.target.style.display = "none"; }} />
              </div>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, letterSpacing: 2, color: "rgba(255,255,255,0.6)" }}>{s.name.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flexShrink: 0, padding: "0 18px", fontFamily: "'Orbitron', monospace", fontSize: 10, letterSpacing: 2, color: "rgba(0,212,170,0.5)", borderLeft: "1px solid rgba(0,212,170,0.15)" }}>PROHAWKE</div>
    </div>
  );
}

// ─── SPONSOR COLUMN (side strips) ────────────────────────────────────────────
export function SponsorColumn({ sponsors, reverse }) {
  const CARD_H = 100;
  const GAP = 10;
  const ITEM_H = CARD_H + GAP;
  const total = sponsors.length * ITEM_H;
  const [offset, setOffset] = useState(0);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    const speed = 0.04;
    const animate = (ts) => {
      if (lastRef.current !== null) {
        const delta = ts - lastRef.current;
        setOffset(o => (o + speed * delta) % total);
      }
      lastRef.current = ts;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [total]);

  const items = [...sponsors, ...sponsors, ...sponsors];
  const translateY = reverse ? (offset % total) - total : -(offset % total);

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 36, zIndex: 2, background: "linear-gradient(to bottom, #020f0d 40%, transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 36, zIndex: 2, background: "linear-gradient(to top, #020f0d 40%, transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, transform: `translateY(${translateY}px)`, willChange: "transform" }}>
        {items.map((s, i) => (
          <div key={i} style={{ height: CARD_H, marginBottom: GAP, marginLeft: 6, marginRight: 6, background: "rgba(255,255,255,0.03)", border: `1px solid ${s.color}44`, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, background: `${s.color}22`, border: `1px solid ${s.color}55`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              <img src={s.logo} alt={s.name} style={{ maxWidth: "75%", maxHeight: "75%", objectFit: "contain", filter: "brightness(1.2)" }} onError={e => { e.target.style.display = "none"; }} />
            </div>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 1.2, textAlign: "center", padding: "0 4px", lineHeight: 1.2 }}>{s.name.toUpperCase()}</span>
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
    const tick = () => {
      const d = EVENT_TIME - Date.now();
      if (d <= 0) { setTimeLeft({ done: true }); return; }
      setTimeLeft({ days: Math.floor(d / 86400000), hours: Math.floor((d % 86400000) / 3600000), minutes: Math.floor((d % 3600000) / 60000), seconds: Math.floor((d % 60000) / 1000) });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => { setQuoteIdx(i => (i + 1) % QUOTES.length); setQuoteVisible(true); }, 600);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const pad = n => String(n).padStart(2, "0");
  const q = QUOTES[quoteIdx];

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020f0d", display: "flex", overflow: "hidden", position: "relative", fontFamily: "'Rajdhani', sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)" }} />

      <GridBg />
      <WelcomeAnimatedBg />
      <HeaderLogos />

      <div style={{ width: 88, flexShrink: 0, zIndex: 3, paddingTop: 20, paddingBottom: 68, borderRight: "1px solid rgba(0,212,170,0.1)", display: "flex", flexDirection: "column" }}>
        <SponsorColumn sponsors={SPONSORS} reverse={false} />
      </div>

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        zIndex: 3,
        padding: "108px 24px 72px",
        minWidth: 0,
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", padding: "4px 16px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20 }}>
            THE INDUSTRIAL ENGINEERS SOCIETY · NIT JALANDHAR
          </div>
          <div style={{ fontSize: 11, letterSpacing: 6, color: "#00d4aa", textTransform: "uppercase" }}>
            UTKANSH 2026 &nbsp;·&nbsp; PRESENTS
          </div>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "clamp(46px, 7vw, 92px)", fontWeight: 900, margin: "4px 0 0", letterSpacing: -2, background: "linear-gradient(90deg, #ffffff 0%, #00d4aa 40%, #ffffff 80%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, textAlign: "center", textShadow: "none" }}>
            OPTI<span style={{ background: "linear-gradient(90deg, #00d4aa, #4affe0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>RELAY</span>
          </h1>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", textAlign: "center", marginTop: 2 }}>
            THINK FAST &nbsp;|&nbsp; OPTIMIZE SMART &nbsp;|&nbsp; EXECUTE TOGETHER
          </div>
          <div style={{ width: 200, height: 1, background: "linear-gradient(90deg, transparent, #00d4aa, transparent)", marginTop: 4 }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { icon: "📅", label: "28 MARCH 2026" },
              { icon: "📍", label: "ALT, NIT JALANDHAR" },
              { icon: "🕐", label: "11:30 AM ONWARDS" },
            ].map(({ icon, label }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,212,170,0.07)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 20, padding: "6px 16px" }}>
                <span style={{ fontSize: 13 }}>{icon}</span>
                <span style={{ fontSize: 11, letterSpacing: 1.5, color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>

          {timeLeft.done ? (
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 28, color: "#00d4aa", letterSpacing: 4, textAlign: "center", padding: "12px 28px", background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.4)", borderRadius: 12 }}>🚀 EVENT IS LIVE!</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 9, letterSpacing: 5, color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>EVENT BEGINS IN</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
                {[["DAYS", timeLeft.days], ["HRS", timeLeft.hours], ["MIN", timeLeft.minutes], ["SEC", timeLeft.seconds]].map(([label, val], i, arr) => (
                  <div key={label} style={{ display: "contents" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(0,212,170,0.07)", border: "1px solid rgba(0,212,170,0.28)", borderRadius: 10, padding: "10px 20px", minWidth: 68, boxShadow: "0 0 20px rgba(0,212,170,0.05)" }}>
                      <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 900, color: "#00d4aa", lineHeight: 1 }}>{pad(val || 0)}</span>
                      <span style={{ fontSize: 8, letterSpacing: 2.5, color: "rgba(255,255,255,0.35)", marginTop: 4, textTransform: "uppercase" }}>{label}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ color: "rgba(0,212,170,0.5)", fontSize: 22, fontFamily: "'Orbitron', monospace", paddingBottom: 14 }}>:</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.22)", borderRadius: 12, padding: "10px 28px" }}>
            <span style={{ fontSize: 9, letterSpacing: 3, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontFamily: "'Orbitron', monospace" }}>PRIZE POOL</span>
            <div style={{ width: 1, height: 20, background: "rgba(0,212,170,0.25)" }} />
            <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 24, fontWeight: 900, color: "#00d4aa" }}>UPTO ₹10,000</span>
          </div>
          <div style={{ maxWidth: 500, textAlign: "center", opacity: quoteVisible ? 1 : 0, transition: "opacity 0.6s ease", padding: "8px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
            <p style={{ fontFamily: "'Georgia', serif", fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, margin: "0 0 5px" }}>"{q.text}"</p>
            <span style={{ fontSize: 9, letterSpacing: 2.5, color: "rgba(0,212,170,0.6)", textTransform: "uppercase" }}>— {q.author}</span>
          </div>
        </div>
      </div>

      <div style={{ width: 88, flexShrink: 0, zIndex: 3, paddingTop: 20, paddingBottom: 68, borderLeft: "1px solid rgba(0,212,170,0.1)", display: "flex", flexDirection: "column" }}>
        <SponsorColumn sponsors={[...SPONSORS].reverse()} reverse={true} />
      </div>

      <SponsorTicker />
      <CornerAccents />
    </div>
  );
}

// ─── ROUND INSTRUCTIONS ───────────────────────────────────────────────────────
function RoundInstructions({ roundNum }) {
  const rules = {
    1: [ "Each question will be displayed for 20 seconds","TOTAL 30 QUESTIONS", "Correct answer = +2 points ,incorrect -1","rouond 1 score + round 2 score accounted for qualification for third round "],
    2: ["This is a buzzer based round","15 seconds time window to press the buzzer", "right answer = +5 points, wrong answer = -2 ", "10 questions total", "Leaderboard visible during questions"],
    3: ["Each team receives the same industrial case study based upon the Team size",  "Judged on closeness to ideal solution and minimum average time taken by team ", "Q&A round follows each presentation"],
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
      <SponsorTicker /><CornerAccents color={c + "80"} />
    </div>
  );
}

function CountdownScreen() {
  const [count, setCount] = useState(5);
  useEffect(() => { const id = setInterval(() => setCount(c => Math.max(0, c - 1)), 1000); return () => clearInterval(id); }, []);
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020f0d", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <GridBg />
      <div style={{ position: "relative", zIndex: 3, textAlign: "center", paddingBottom: 44 }}>
        {count > 0
          ? <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "clamp(140px, 28vw, 260px)", fontWeight: 900, color: "#00d4aa", lineHeight: 1, textShadow: "0 0 80px rgba(0,212,170,0.4)" }}>{count}</div>
          : <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "clamp(60px, 12vw, 120px)", fontWeight: 900, color: "#00d4aa", letterSpacing: 8 }}>GO!</div>}
        <div style={{ fontSize: 14, letterSpacing: 6, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginTop: 20 }}>STARTING ROUND</div>
      </div>
      <SponsorTicker />
    </div>
  );
}

function Round3CaseScreen({ teams }) {
  const PREP_SECS = 20 * 60;
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => { const id = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(id); }, []);
  const remaining = Math.max(0, PREP_SECS - elapsed);
  const mins = Math.floor(remaining / 60), secs = remaining % 60;
  const pct = (remaining / PREP_SECS) * 100;
  const isUrgent = remaining < 5 * 60, isDone = remaining === 0;
  const sorted = [...teams].sort((a, b) => (b.r1 + b.r2 + b.r3) - (a.r1 + a.r2 + a.r3));
  const podiumColors = ["#FFD700", "#C0C0C0", "#CD7F32", "#4a9eff", "#a855f7", "#ff6b35", "#22d3ee"];
  const medals = ["🥇", "🥈", "🥉"];
  const maxScore = Math.max(...teams.map(t => t.r1 + t.r2 + t.r3), 1);
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020f0d", display: "flex", flexDirection: "column", position: "relative", fontFamily: "'Rajdhani', sans-serif" }}>
      <GridBg />
      <div style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", borderBottom: "1px solid rgba(255,107,53,0.2)", flexShrink: 0 }}>
        <div><div style={{ fontFamily: "'Orbitron', monospace", fontSize: 10, letterSpacing: 5, color: "#ff6b35", marginBottom: 2 }}>OPTIRELAY 2026 · FINAL ROUND</div><div style={{ fontFamily: "'Orbitron', monospace", fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>CASE COMPETITION</div></div>
        <div style={{ textAlign: "center" }}>
          {isDone ? <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 32, fontWeight: 900, color: "#ff4444", letterSpacing: 4 }}>PRESENT NOW!</div>
            : <><div style={{ fontSize: 10, letterSpacing: 4, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>PREP TIME REMAINING</div><div style={{ fontFamily: "'Orbitron', monospace", fontSize: 52, fontWeight: 900, lineHeight: 1, color: isUrgent ? "#ff4444" : "#ff6b35" }}>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</div></>}
        </div>
        <div style={{ textAlign: "right", fontFamily: "'Orbitron', monospace", fontSize: 11, letterSpacing: 2 }}><div style={{ color: "rgba(255,255,255,0.25)", marginBottom: 4, fontSize: 9 }}>PRESENTATION</div><div style={{ color: "#ff6b35" }}>5 MIN / TEAM</div></div>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.05)", position: "relative", zIndex: 3, flexShrink: 0 }}><div style={{ height: "100%", width: `${pct}%`, background: isUrgent ? "#ff4444" : "#ff6b35", transition: "width 1s linear" }} /></div>
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", zIndex: 3 }}>
        <div style={{ width: "52%", padding: "24px 32px 56px", borderRight: "1px solid rgba(255,107,53,0.15)", overflowY: "auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(255,107,53,0.7)", textTransform: "uppercase", marginBottom: 16 }}>CASE BRIEF</div>
          <div style={{ background: "rgba(255,107,53,0.05)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.4, marginBottom: 12 }}>Case study distributed to all teams</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>Read carefully, identify the core industrial engineering problem, and build a structured, data-backed solution. Use IE tools — lean, Six Sigma, process mapping — wherever applicable.</div>
          </div>
          {[{ label: "Problem Identification", pct: 20 }, { label: "Solution Feasibility", pct: 30 }, { label: "IE Tool Usage", pct: 25 }, { label: "Presentation Clarity", pct: 15 }, { label: "Q&A Handling", pct: 10 }].map((cr, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{cr.label}</span><span style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, color: "#ff6b35", fontWeight: 700 }}>{cr.pct}%</span></div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}><div style={{ height: "100%", width: `${cr.pct * 3.33}%`, background: "rgba(255,107,53,0.55)", borderRadius: 2 }} /></div>
            </div>
          ))}
        </div>
        <div style={{ width: "48%", padding: "24px 28px 56px", overflowY: "auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(255,107,53,0.7)", textTransform: "uppercase", marginBottom: 16 }}>STANDINGS ENTERING ROUND 3</div>
          {sorted.map((t, i) => {
            const total = t.r1 + t.r2 + t.r3;
            const c = podiumColors[i] || "rgba(255,255,255,0.5)";
            return (
              <div key={t._id || t.id} style={{ marginBottom: 12, padding: "14px 18px", background: i === 0 ? "rgba(255,215,0,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${i === 0 ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 16, color: c, minWidth: 30 }}>{medals[i] || `#${i + 1}`}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", flex: 1 }}>{t.name}</span>
                  <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 22, fontWeight: 900, color: c }}>{total}</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}><div style={{ height: "100%", width: `${(total / maxScore) * 100}%`, background: c, borderRadius: 2 }} /></div>
              </div>
            );
          })}
        </div>
      </div>
      <SponsorTicker /><CornerAccents color="rgba(255,107,53,0.6)" />
    </div>
  );
}

function LeaderboardSidebar({ teams }) {
  const sorted = [...teams].sort((a, b) => (b.r1 + b.r2 + b.r3) - (a.r1 + a.r2 + a.r3));
  const podiumColors = ["#FFD700", "#C0C0C0", "#CD7F32", "#4a9eff", "#a855f7", "#ff6b35", "#22d3ee"];
  const medals = ["🥇", "🥈", "🥉"];
  const max = Math.max(...teams.map(t => t.r1 + t.r2 + t.r3), 1);
  return (
    <div style={{ width: "30%", height: "100%", borderRight: "1px solid rgba(74,158,255,0.2)", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(74,158,255,0.15)", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 9, letterSpacing: 4, color: "#4a9eff", marginBottom: 2 }}>LIVE</div>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>LEADERBOARD</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
        {sorted.map((t, i) => {
          const total = t.r1 + t.r2 + t.r3;
          const rankColor = podiumColors[i] || "rgba(255,255,255,0.5)";
          return (
            <div key={t._id || t.id} style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, minWidth: 26, color: rankColor }}>{medals[i] || `#${i + 1}`}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 17, fontWeight: 900, color: rankColor }}>{total}</span>
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}><div style={{ height: "100%", width: `${Math.max(0, (total / max) * 100)}%`, background: rankColor, borderRadius: 2, transition: "width 0.8s" }} /></div>
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
  const showOptions = roundNum === 1;
  const optLabels = ["A", "B", "C", "D"];
  const maxT = ROUND_TIMERS[roundNum] ?? 30;
  const pct = (timeLeft / maxT) * 100;
  const hasImage = Boolean(q?.img);

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
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 36, fontWeight: 900, color: timeLeft <= 5 ? "#ff4444" : c }}>{String(timeLeft).padStart(2, "0")}</div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)" }}>SEC</div>
        </div>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.05)", position: "relative", zIndex: 3, flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: timeLeft <= 5 ? "#ff4444" : c, transition: "width 1s linear, background 0.3s" }} />
      </div>
      <div style={{ flex: 1, display: "flex", position: "relative", zIndex: 3, overflow: "hidden" }}>
        {showSidebar && <LeaderboardSidebar teams={teams} />}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: showSidebar ? "20px 48px 56px" : "20px 60px 56px", gap: showOptions ? 20 : 32 }}>
          <h2 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: showOptions
              ? (hasImage ? (showSidebar ? "clamp(13px, 1.6vw, 22px)" : "clamp(18px, 2.5vw, 34px)") : (showSidebar ? "clamp(16px, 2.3vw, 32px)" : "clamp(22px, 3.5vw, 44px)"))
              : "clamp(24px, 3.8vw, 52px)",
            fontWeight: 700, textAlign: "center", color: "#fff", lineHeight: 1.35, margin: 0,
            maxWidth: showOptions ? "100%" : "80%",
          }}>{q.q}</h2>

          {!showOptions && (
            <>
              {hasImage && (
                <div style={{ border: `1px solid ${c}44`, borderRadius: 14, overflow: "hidden", background: "rgba(0,0,0,0.3)", padding: 8, boxShadow: `0 0 30px ${c}20` }}>
                  <img src={q.img} alt="Question visual" style={{ maxWidth: "100%", maxHeight: "35vh", objectFit: "contain", borderRadius: 10, display: "block" }} />
                </div>
              )}
              {showAnswer ? (
                <div style={{ padding: "22px 44px", background: "rgba(0,212,170,0.12)", border: "2px solid #00d4aa", borderRadius: 16, textAlign: "center", animation: "fadeIn 0.4s ease" }}>
                  <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(0,212,170,0.6)", marginBottom: 8, textTransform: "uppercase" }}>CORRECT ANSWER</div>
                  <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "clamp(18px, 2.6vw, 32px)", fontWeight: 900, color: "#00d4aa", lineHeight: 1.3 }}>{q.options[q.ans]}</div>
                  <div style={{ marginTop: 8, fontSize: 22 }}>✓</div>
                </div>
              ) : (
                <div style={{ padding: "16px 40px", background: `${c}08`, border: `1px dashed ${c}44`, borderRadius: 12, fontFamily: "'Orbitron', monospace", fontSize: 13, letterSpacing: 3, color: `${c}88`, textTransform: "uppercase" }}>
                  Answer hidden — teams discuss
                </div>
              )}
            </>
          )}

          {showOptions && (
            hasImage ? (
              <div style={{ display: "flex", gap: 24, width: "100%", alignItems: "flex-start" }}>
                <div style={{ flex: "0 0 auto", width: showSidebar ? "35%" : "42%", display: "flex", justifyContent: "center" }}>
                  <div style={{ border: `1px solid ${c}44`, borderRadius: 14, overflow: "hidden", background: "rgba(0,0,0,0.3)", padding: 6, boxShadow: `0 0 30px ${c}20` }}>
                    <img src={q.img} alt="Question visual" style={{ maxWidth: "100%", maxHeight: showSidebar ? "32vh" : "40vh", objectFit: "contain", borderRadius: 10, display: "block" }} />
                  </div>
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                  {q.options.map((opt, i) => { const isCorrect = showAnswer && i === q.ans; return (<div key={i} style={{ padding: showSidebar ? "12px 14px" : "16px 20px", background: isCorrect ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.03)", border: isCorrect ? "2px solid #00d4aa" : `1px solid ${c}22`, borderRadius: 12, display: "flex", alignItems: "center", gap: 12, transition: "all 0.4s" }}><span style={{ fontFamily: "'Orbitron', monospace", fontSize: showSidebar ? 16 : 22, fontWeight: 900, color: isCorrect ? "#00d4aa" : c, minWidth: 26 }}>{optLabels[i]}</span><span style={{ fontSize: showSidebar ? 14 : 18, color: isCorrect ? "#00d4aa" : "rgba(255,255,255,0.8)", fontWeight: isCorrect ? 700 : 400, lineHeight: 1.3 }}>{opt}</span>{isCorrect && <span style={{ marginLeft: "auto", fontSize: 18 }}>✓</span>}</div>); })}
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
                {q.options.map((opt, i) => { const isCorrect = showAnswer && i === q.ans; return (<div key={i} style={{ padding: showSidebar ? "14px 16px" : "22px 26px", background: isCorrect ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.03)", border: isCorrect ? "2px solid #00d4aa" : `1px solid ${c}22`, borderRadius: 12, display: "flex", alignItems: "center", gap: 12, transition: "all 0.4s" }}><span style={{ fontFamily: "'Orbitron', monospace", fontSize: showSidebar ? 18 : 26, fontWeight: 900, color: isCorrect ? "#00d4aa" : c, minWidth: 28 }}>{optLabels[i]}</span><span style={{ fontSize: showSidebar ? 15 : 20, color: isCorrect ? "#00d4aa" : "rgba(255,255,255,0.8)", fontWeight: isCorrect ? 700 : 400, lineHeight: 1.3 }}>{opt}</span>{isCorrect && <span style={{ marginLeft: "auto", fontSize: 20 }}>✓</span>}</div>); })}
              </div>
            )
          )}
        </div>
      </div>
      <SponsorTicker />
      <CornerAccents />
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// ─── SCOREBOARD SCREEN (TWO-COLUMN SPLIT) ─────────────────────────────────────
function ScoreboardScreen({ teams }) {
  const sorted = [...teams].sort((a, b) => (b.r1 + b.r2 + b.r3) - (a.r1 + a.r2 + a.r3));
  const podiumColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const medals = ["🥇", "🥈", "🥉"];

  // Split teams into two halves for two-column layout
  const mid = Math.ceil(sorted.length / 2);
  const leftTeams = sorted.slice(0, mid);
  const rightTeams = sorted.slice(mid);

  const TeamRow = ({ team, i }) => {
    const total = team.r1 + team.r2 + team.r3;
    const isTop = i < 3;
    const c = isTop ? podiumColors[i] : "rgba(255,255,255,0.7)";
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "52px 1fr 60px 60px 60px 80px",
        gap: 10,
        padding: "14px 16px",
        background: isTop ? `${podiumColors[i]}10` : "rgba(255,255,255,0.02)",
        border: `1px solid ${isTop ? podiumColors[i] + "44" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 12,
        alignItems: "center",
      }}>
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 18, fontWeight: 900, color: c }}>{medals[i] || `#${i + 1}`}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.name}</span>
        {[team.r1, team.r2, team.r3].map((s, ri) => (
          <span key={ri} style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>{s}</span>
        ))}
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 20, fontWeight: 900, color: c, textAlign: "center" }}>{total}</span>
      </div>
    );
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020f0d", display: "flex", flexDirection: "column", position: "relative", fontFamily: "'Rajdhani', sans-serif" }}>
      <GridBg />
      <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 48px 0", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, letterSpacing: 8, color: "#00d4aa", marginBottom: 8 }}>OPTIRELAY 2026</div>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "clamp(28px, 4vw, 56px)", fontWeight: 900, margin: "0 0 8px", color: "#fff" }}>FINAL LEADERBOARD</h1>
        <div style={{ width: 160, height: 2, background: "linear-gradient(90deg, transparent, #00d4aa, transparent)", marginBottom: 20 }} />

        {/* Column header */}
        {teams.length > 0 && (
          <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[0, 1].map(col => (
              <div key={col} style={{ display: "grid", gridTemplateColumns: "52px 1fr 60px 60px 60px 80px", gap: 10, padding: "6px 16px", fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
                <span>#</span><span>TEAM</span>
                <span style={{ textAlign: "center" }}>R1</span>
                <span style={{ textAlign: "center" }}>R2</span>
                <span style={{ textAlign: "center" }}>R3</span>
                <span style={{ textAlign: "center" }}>TOTAL</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: "relative", zIndex: 3, flex: 1, overflow: "hidden", padding: "8px 48px 68px" }}>
        {teams.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 20, letterSpacing: 4, textAlign: "center", paddingTop: 60 }}>NO TEAMS YET</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, height: "100%" }}>
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
              {leftTeams.map((team, i) => (
                <TeamRow key={team._id || team.id} team={team} i={i} />
              ))}
            </div>
            {/* Right column — indices continue from where left column ends */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
              {rightTeams.map((team, i) => (
                <TeamRow key={team._id || team.id} team={team} i={mid + i} />
              ))}
            </div>
          </div>
        )}
      </div>

      <SponsorTicker /><CornerAccents />
    </div>
  );
}

// ─── PPT SCREEN ───────────────────────────────────────────────────────────────
function PptScreen({ slideIndex }) {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020f0d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", fontFamily: "'Rajdhani', sans-serif" }}>
      <GridBg />
      <div style={{ position: "relative", zIndex: 3, width: "85vw", height: "70vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(74,158,255,0.3)", borderRadius: 12, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(0,0,0,0.8)" }}>
          <img
            key={slideIndex}
            src={`${SLIDE_IMAGES[slideIndex]}?s=${slideIndex}`}
            alt={`Slide ${slideIndex + 1}`}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", transition: "opacity 0.4s ease", display: "block" }}
          />
          <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 100px rgba(74,158,255,0.1)", pointerEvents: "none" }} />
        </div>

        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 12, letterSpacing: 4, color: "rgba(74,158,255,0.6)" }}>
            SLIDE {slideIndex + 1} / {SLIDE_IMAGES.length}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {SLIDE_IMAGES.map((_, i) => (
              <div key={i} style={{
                width: i === slideIndex ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: i === slideIndex ? "#4a9eff" : "rgba(74,158,255,0.25)",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
        </div>
      </div>
      <SponsorTicker /><CornerAccents color="rgba(74,158,255,0.5)" />
    </div>
  );
}

// ─── DISPLAY APP ──────────────────────────────────────────────────────────────
function DisplayApp() {
  const { state, teams, wsConnected } = useDisplayState();
  const { screen, roundNum, subPhase, qIndex, showAnswer, timeLeft, slideIndex = 0 } = state;
  return (
    <>
      <div style={{ position: "fixed", top: 10, right: 10, zIndex: 9999 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: wsConnected ? "#00d4aa" : "#ff5050", boxShadow: wsConnected ? "0 0 8px #00d4aa" : "none" }} />
      </div>
      {screen === "welcome" && <WelcomeScreen />}
      {screen === "ppt" && <PptScreen slideIndex={slideIndex} />}
      {screen === "scoreboard" && <ScoreboardScreen teams={teams} />}
      {screen === "round" && (
        <>
          {subPhase === "instructions" && <RoundInstructions roundNum={roundNum} />}
          {subPhase === "countdown" && <CountdownScreen />}
          {roundNum === 3 && subPhase === "casecomp" && <Round3CaseScreen teams={teams} />}
          {subPhase === "question" && <QuestionScreen roundNum={roundNum} qIndex={qIndex} showAnswer={showAnswer} timeLeft={timeLeft} teams={teams} />}
        </>
      )}
    </>
  );
}

// ─── SCORING TAB ──────────────────────────────────────────────────────────────
function ScoringTab({ teams, updateScore, setScore, resetAllScores }) {
  const ROUNDS = [
    { key: "r1", label: "R1", color: "#00d4aa" },
    { key: "r2", label: "R2", color: "#4a9eff" },
    { key: "r3", label: "R3", color: "#ff6b35" },
  ];

  const Btn = ({ label, onClick, color, title }) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 30, borderRadius: 5,
        border: `1px solid ${color}55`,
        background: `${color}12`,
        color,
        fontWeight: 800, fontSize: 12, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        fontFamily: "monospace", lineHeight: 1,
        transition: "background 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = `${color}28`; }}
      onMouseLeave={e => { e.currentTarget.style.background = `${color}12`; }}
    >{label}</button>
  );

  if (teams.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.2)", fontFamily: "'Orbitron', monospace", fontSize: 12, letterSpacing: 3 }}>
      NO TEAMS — ADD IN TEAMS TAB
    </div>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(100px,1fr) repeat(3, 200px) 70px", gap: 10, padding: "0 12px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 8 }}>
        <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', monospace" }}>TEAM</span>
        {ROUNDS.map(r => (<span key={r.key} style={{ fontSize: 10, letterSpacing: 3, color: r.color, fontFamily: "'Orbitron', monospace", textAlign: "center" }}>{r.label}</span>))}
        <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', monospace", textAlign: "center" }}>Σ</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[...teams].sort((a, b) => (b.r1 + b.r2 + b.r3) - (a.r1 + a.r2 + a.r3)).map((t) => {
          const total = t.r1 + t.r2 + t.r3;
          return (
            <div key={t._id || t.id} style={{ display: "grid", gridTemplateColumns: "minmax(100px,1fr) repeat(3, 200px) 70px", gap: 10, alignItems: "center", padding: "10px 12px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>

              {ROUNDS.map(({ key, color }) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "center" }}>
                  <Btn label="−5" color="#ff6060" onClick={() => updateScore(t, key, -5)} title="-5 points" />
                  <Btn label="−1" color="#ff9090" onClick={() => updateScore(t, key, -1)} title="-1 point" />
                  <input
                    type="number"
                    value={t[key]}
                    onChange={e => setScore(t, key, e.target.value)}
                    style={{
                      width: 50, textAlign: "center", padding: "4px 2px",
                      background: "rgba(0,0,0,0.35)",
                      border: `1px solid ${t[key] < 0 ? "#ff606055" : color + "50"}`,
                      borderRadius: 6,
                      color: t[key] < 0 ? "#ff8080" : color,
                      fontSize: 14, fontFamily: "'Orbitron', monospace", fontWeight: 700,
                      outline: "none",
                    }}
                  />
                  <Btn label="+1" color={color} onClick={() => updateScore(t, key, 1)} title="+1 point" />
                  <Btn label="+5" color={color} onClick={() => updateScore(t, key, 5)} title="+5 points" />
                </div>
              ))}

              <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 16, fontWeight: 900, color: total < 0 ? "#ff8080" : "rgba(255,255,255,0.9)", textAlign: "center" }}>{total}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", letterSpacing: 1, fontFamily: "'Rajdhani', sans-serif" }}>
          Buttons ±1 · ±5 &nbsp;|&nbsp; Type any value directly &nbsp;|&nbsp; Negatives allowed
        </span>
        <button onClick={resetAllScores} style={{ padding: "5px 14px", background: "transparent", border: "1px solid rgba(255,80,80,0.3)", color: "rgba(255,80,80,0.7)", borderRadius: 6, cursor: "pointer", fontSize: 10, fontFamily: "'Orbitron', monospace", letterSpacing: 1.5 }}
          onMouseEnter={e => { e.currentTarget.style.color = "#ff5050"; e.currentTarget.style.borderColor = "rgba(255,80,80,0.6)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,80,80,0.7)"; e.currentTarget.style.borderColor = "rgba(255,80,80,0.3)"; }}
        >↺ RESET ALL</button>
      </div>
    </div>
  );
}

// ─── ADMIN APP ────────────────────────────────────────────────────────────────
function AdminApp() {
  const {
    state, teams, wsConnected,
    patchState, startRound, startCountdown, nextQ, prevQ,
    startTimer, stopTimer, resetTimer, maxTime,
    addTeam, removeTeam, updateScore, setScore, resetAllScores,
  } = useAdminState();

  const { screen, roundNum, subPhase, qIndex, showAnswer, timeLeft, timerRunning, slideIndex = 0 } = state;
  const [newTeamName, setNewTeamName] = useState("");
  const [tab, setTab] = useState("control");
  const rc = { 1: "#00d4aa", 2: "#4a9eff", 3: "#ff6b35" }[roundNum] || "#00d4aa";
  const qs = QUESTIONS[`round${roundNum}`] || [];
  const currentQ = qs[qIndex];

  const updateSlide = (newIdx) => {
    patchState({ screen: "ppt", slideIndex: newIdx });
  };

  const tabStyle = (t) => ({ padding: "10px 24px", fontFamily: "'Orbitron', monospace", fontSize: 11, letterSpacing: 2, cursor: "pointer", border: "none", borderRadius: 8, background: tab === t ? "#00d4aa" : "rgba(0,212,170,0.08)", color: tab === t ? "#000" : "#00d4aa", fontWeight: 700, transition: "all 0.2s" });
  const inBtn = (label, onClick, color = "#00d4aa", disabled = false) => (
    <button onClick={onClick} disabled={disabled} style={{ padding: "8px 14px", fontFamily: "'Orbitron', monospace", fontSize: 10, letterSpacing: 1.5, cursor: disabled ? "default" : "pointer", borderRadius: 6, border: `1px solid ${disabled ? "rgba(255,255,255,0.1)" : color + "55"}`, background: disabled ? "rgba(255,255,255,0.03)" : `${color}15`, color: disabled ? "rgba(255,255,255,0.25)" : color, fontWeight: 700, whiteSpace: "nowrap" }}>{label}</button>
  );

  return (
    <div style={{ height: "100vh", background: "#020f0d", color: "#fff", fontFamily: "'Rajdhani', sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <GridBg />

      {/* ── Fixed header ── */}
      <div style={{ position: "relative", zIndex: 3, padding: "18px 32px", borderBottom: "1px solid rgba(0,212,170,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 20, fontWeight: 900, color: "#00d4aa", letterSpacing: 2 }}>⚙ ADMIN PANEL</div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>OPTIRELAY 2026 · NIT JALANDHAR</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <WsIndicator connected={wsConnected} />
          <div style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)", fontSize: 10, letterSpacing: 2, color: "#00d4aa" }}>
            {screen.toUpperCase()}{screen === "round" ? ` → R${roundNum} ${subPhase.toUpperCase()}` : ""}
          </div>
        </div>
      </div>

      {/* ── Fixed tab bar ── */}
      <div style={{ position: "relative", zIndex: 3, padding: "14px 32px 6px", display: "flex", gap: 8, flexShrink: 0 }}>
        {["control", "teams", "scoring"].map(t => <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{t.toUpperCase()}</button>)}
      </div>

      {/* ── Scrollable content area ── */}
      <div style={{ position: "relative", zIndex: 3, flex: 1, overflowY: "auto", padding: "14px 32px 32px", display: "flex", flexDirection: "column", gap: 14 }}>

        {tab === "control" && <>
          <div style={{ background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.15)", borderRadius: 14, padding: 22 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(0,212,170,0.7)", textTransform: "uppercase", marginBottom: 14 }}>SCREEN NAVIGATION</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
              {[
                { label: "WELCOME", action: () => patchState({ screen: "welcome" }), s: "#00d4aa" },
                { label: "R1 INSTRUCTIONS", action: () => startRound(1), s: "#00d4aa" },
                { label: "R2 INSTRUCTIONS", action: () => startRound(2), s: "#4a9eff" },
                { label: "R3 INSTRUCTIONS", action: () => startRound(3), s: "#ff6b35" },
                { label: "PPT MODE", action: () => patchState({ screen: "ppt" }), s: "#4a9eff" },
                { label: "SCOREBOARD", action: () => patchState({ screen: "scoreboard" }), s: "#a855f7" },
              ].map(({ label, action, s }) => <GlowButton key={label} onClick={action} color={s}>{label}</GlowButton>)}
            </div>
          </div>

          {screen === "ppt" && (
            <div style={{ background: "rgba(74,158,255,0.08)", border: "1px solid rgba(74,158,255,0.3)", borderRadius: 14, padding: 22 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#4a9eff", textTransform: "uppercase", marginBottom: 14 }}>SLIDE CONTROL</div>
              <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                {inBtn("◀ PREV", () => updateSlide(Math.max(0, slideIndex - 1)), "#4a9eff", slideIndex === 0)}
                <div style={{ padding: "6px 20px", background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.3)", borderRadius: 8 }}>
                  <span style={{ fontFamily: "'Orbitron', monospace", color: "#4a9eff", fontSize: 14, letterSpacing: 2 }}>
                    SLIDE {slideIndex + 1} / {SLIDE_IMAGES.length}
                  </span>
                </div>
                {inBtn("NEXT ▶", () => updateSlide(Math.min(SLIDE_IMAGES.length - 1, slideIndex + 1)), "#4a9eff", slideIndex === SLIDE_IMAGES.length - 1)}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {SLIDE_IMAGES.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => updateSlide(i)}
                    style={{ width: i === slideIndex ? 20 : 10, height: 10, borderRadius: 5, background: i === slideIndex ? "#4a9eff" : "rgba(74,158,255,0.25)", cursor: "pointer", transition: "all 0.2s" }}
                  />
                ))}
              </div>
            </div>
          )}

          {screen === "round" && (
            <div style={{ background: `${rc}08`, border: `1px solid ${rc}22`, borderRadius: 14, padding: 22 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: rc, textTransform: "uppercase", marginBottom: 14 }}>ROUND {roundNum} CONTROLS — {subPhase.toUpperCase()}</div>
              {roundNum !== 3 ? (
                <>
                  <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                    {inBtn("SHOW INSTRUCTIONS", () => patchState({ subPhase: "instructions" }), rc)}
                    {inBtn("COUNTDOWN → QUESTIONS", startCountdown, rc, subPhase === "countdown")}
                    {inBtn("JUMP TO QUESTIONS", () => patchState({ subPhase: "question" }), rc)}
                  </div>
                  {subPhase === "question" && <>
                    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 14, marginBottom: 10 }}>
                      <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>QUESTION NAV</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>Q{qIndex + 1}/{qs.length}: <span style={{ color: "#fff" }}>{currentQ?.q}</span></div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {inBtn("◀ PREV", () => prevQ(qIndex, roundNum), rc, qIndex === 0)}
                        {inBtn("▶ NEXT", () => nextQ(qIndex, roundNum, qs), rc, qIndex >= qs.length - 1)}
                        <div style={{ marginLeft: "auto" }}>{inBtn(showAnswer ? "HIDE ANSWER" : "REVEAL ANSWER", () => patchState({ showAnswer: !showAnswer }), showAnswer ? "#ff4444" : "#00d4aa")}</div>
                      </div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>TIMER — {timeLeft}s (Round {roundNum}: {maxTime(roundNum)}s max)</div>
                      <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, marginBottom: 10 }}>
                        <div style={{ height: "100%", width: `${(timeLeft / maxTime(roundNum)) * 100}%`, background: timeLeft <= 5 ? "#ff4444" : rc, borderRadius: 3, transition: "width 1s linear" }} />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {inBtn(timerRunning ? "⏸ PAUSE" : "▶ START", timerRunning ? stopTimer : () => startTimer(roundNum), rc)}
                        {inBtn("↺ RESET", () => resetTimer(roundNum), "#ff6b35")}
                      </div>
                    </div>
                  </>}
                </>
              ) : (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {inBtn("SHOW R3 INSTRUCTIONS", () => patchState({ subPhase: "instructions" }), rc)}
                  {inBtn("▶ START 20-MIN CASE TIMER", () => patchState({ subPhase: "casecomp" }), rc)}
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
                <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && newTeamName.trim()) { addTeam(newTeamName); setNewTeamName(""); } }}
                  placeholder="Team name..." style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", fontFamily: "'Rajdhani', sans-serif" }} />
                <GlowButton onClick={() => { if (newTeamName.trim()) { addTeam(newTeamName); setNewTeamName(""); } }}>+ ADD</GlowButton>
              </div>
            </div>
            <div style={{ background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.15)", borderRadius: 14, padding: 22 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(0,212,170,0.7)", textTransform: "uppercase", marginBottom: 14 }}>TEAMS ({teams.length})</div>
              {teams.length === 0
                ? <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No teams added yet</div>
                : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {teams.map(t => (
                      <div key={t._id || t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 9, border: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#fff" }}>{t.name}</span>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: 2 }}>R1:{t.r1} R2:{t.r2} R3:{t.r3} | <span style={{ color: "#00d4aa" }}>{t.r1 + t.r2 + t.r3}</span></span>
                        <button onClick={() => removeTeam(t)} style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff5050", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "'Orbitron', monospace" }}>✕</button>
                      </div>
                    ))}
                  </div>}
            </div>
          </div>
        )}

        {tab === "scoring" && (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 22 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 18, fontFamily: "'Orbitron', monospace" }}>SCORING</div>
            <ScoringTab teams={teams} updateScore={updateScore} setScore={setScore} resetAllScores={resetAllScores} />
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        #root { height: 100%; overflow: hidden; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,170,0.25); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,212,170,0.45); }
      `}</style>
    </div>
  );
}

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────
function AdminGate() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleLogin = async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/admin-login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      const data = await res.json();
      if (data.success) setAuthed(true);
      else { setError("Incorrect password."); setPw(""); }
    } catch { setError("Cannot reach server."); }
    finally { setLoading(false); }
  };
  if (authed) return <AdminApp />;
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020f0d", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", fontFamily: "'Rajdhani', sans-serif" }}>
      <GridBg /><CornerAccents />
      <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", width: 340 }}>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, letterSpacing: 6, color: "rgba(0,212,170,0.5)", marginBottom: 12 }}>OPTIRELAY 2026</div>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: 2, marginBottom: 4 }}>ADMIN ACCESS</div>
        <div style={{ width: 60, height: 2, background: "linear-gradient(90deg, transparent, #00d4aa, transparent)", marginBottom: 32 }} />
        <div style={{ width: "100%", background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Enter Password</div>
          <input type="password" placeholder="••••••••••••" value={pw} autoFocus onChange={e => { setPw(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ padding: "12px 16px", borderRadius: 8, border: `1px solid ${error ? "rgba(255,80,80,0.5)" : "rgba(0,212,170,0.3)"}`, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none", fontFamily: "'Orbitron', monospace", fontSize: 16, letterSpacing: 4, width: "100%", boxSizing: "border-box" }} />
          {error && <div style={{ fontSize: 11, color: "#ff5050", letterSpacing: 1, marginTop: -6 }}>⚠ {error}</div>}
          <button onClick={handleLogin} disabled={loading}
            style={{ padding: "12px", background: loading ? "rgba(0,212,170,0.3)" : "#00d4aa", border: "none", borderRadius: 8, cursor: loading ? "default" : "pointer", fontWeight: 900, color: "#000", fontFamily: "'Orbitron', monospace", fontSize: 13, letterSpacing: 3 }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#00ffcc"; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#00d4aa"; }}
          >{loading ? "VERIFYING…" : "UNLOCK"}</button>
        </div>
        <div style={{ marginTop: 20, fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.15)", textTransform: "uppercase" }}>Authorised personnel only</div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const isAdmin = typeof window !== "undefined" && window.location.search.includes("admin");
  return isAdmin ? <AdminGate /> : <DisplayApp />;
}