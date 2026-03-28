const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { WebSocketServer, WebSocket } = require("ws");
require("dotenv").config();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "https://optirelay.netlify.app"
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

const server = http.createServer(app);

// ─── WEBSOCKET SERVER ─────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server });
const clients = new Set();

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

function sendTo(ws, data) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
}

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log(`⚡ WS connected. Total: ${clients.size}`);

  // Send full state immediately on connect
  (async () => {
    try {
      const [state, teams] = await Promise.all([
        getState(),
        Team.find().sort({ createdAt: 1 }),
      ]);
      sendTo(ws, { type: "full_state", state: computeState(state), teams });
    } catch (err) {
      console.error("Initial state error:", err);
    }
  })();

  ws.on("message", async (raw) => {
    try {
      const msg = JSON.parse(raw);

      // ── Admin: patch show state ──────────────────────────────────────────────
      if (msg.type === "patch_state") {
        const allowed = [
          "screen", "roundNum", "subPhase", "qIndex",
          "showAnswer", "timeLeft", "timerRunning", "timerEndsAt",
          "slideIndex",
        ];
        const $set = { updatedAt: Date.now() };
        for (const key of allowed) {
          if (msg.payload[key] !== undefined) $set[key] = msg.payload[key];
        }
        const update = { $set };
        // FIX: Use $set operator explicitly so upsert doesn't lose existing fields.
        // Also use setDefaultsOnInsert to ensure schema defaults apply on first create.
        const updated = await ShowState.findByIdAndUpdate(
          "singleton",
          update,
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        broadcast({ type: "state_update", state: computeState(updated) });
      }

      // ── Admin: update one team score ─────────────────────────────────────────
      if (msg.type === "patch_team") {
        const { id, round, value } = msg.payload;
        const team = await Team.findByIdAndUpdate(
          id, { [round]: value }, { new: true }
        );
        if (team) broadcast({ type: "team_update", team });
      }

      // ── Admin: add team ──────────────────────────────────────────────────────
      if (msg.type === "add_team") {
        const { name } = msg.payload;
        if (!name?.trim()) return;
        const existing = await Team.findOne({ name: name.trim() });
        if (existing) {
          sendTo(ws, { type: "error", message: "Team already exists" });
          return;
        }
        const team = await Team.create({ name: name.trim(), r1: 0, r2: 0, r3: 0 });
        broadcast({ type: "team_added", team });
      }

      // ── Admin: remove team ───────────────────────────────────────────────────
      if (msg.type === "remove_team") {
        const { id } = msg.payload;
        await Team.findByIdAndDelete(id);
        broadcast({ type: "team_removed", id });
      }

      // ── Admin: reset all scores ──────────────────────────────────────────────
      if (msg.type === "reset_scores") {
        await Team.updateMany({}, { r1: 0, r2: 0, r3: 0 });
        const teams = await Team.find().sort({ createdAt: 1 });
        broadcast({ type: "teams_reset", teams });
      }

      // ── Keepalive ────────────────────────────────────────────────────────────
      if (msg.type === "ping") sendTo(ws, { type: "pong" });

    } catch (err) {
      console.error("WS message error:", err);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`WS disconnected. Total: ${clients.size}`);
  });

  ws.on("error", (err) => {
    console.error("WS error:", err.message);
    clients.delete(ws);
  });
});

// ─── SERVER-SIDE TIMER TICK ───────────────────────────────────────────────────
setInterval(async () => {
  try {
    const state = await ShowState.findById("singleton");
    if (!state?.timerRunning || !state.timerEndsAt) return;

    const remaining = Math.ceil((state.timerEndsAt - Date.now()) / 1000);

    if (remaining <= 0) {
      await ShowState.findByIdAndUpdate("singleton", {
        $set: { timeLeft: 0, timerRunning: false, updatedAt: Date.now() },
      });
      broadcast({ type: "state_update", state: { timeLeft: 0, timerRunning: false } });
    } else {
      broadcast({ type: "timer_tick", timeLeft: remaining });
    }
  } catch {}
}, 1000);

// ─── MONGODB ──────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/optirelay")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ─── SCHEMAS ──────────────────────────────────────────────────────────────────
const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    r1: { type: Number, default: 0 },
    r2: { type: Number, default: 0 },
    r3: { type: Number, default: 0 },
  },
  { timestamps: true }
);
const Team = mongoose.model("Team", TeamSchema);

// FIX: Removed { _id: false } schema option — this was preventing Mongoose from
// correctly handling the string _id "singleton" during upserts, causing the
// document to sometimes be re-created without persisted fields like slideIndex.
const ShowStateSchema = new mongoose.Schema({
  _id: { type: String, default: "singleton" },
  screen: { type: String, default: "welcome" },
  roundNum: { type: Number, default: 1 },
  subPhase: { type: String, default: "instructions" },
  qIndex: { type: Number, default: 0 },
  showAnswer: { type: Boolean, default: false },
  timeLeft: { type: Number, default: 30 },
  timerRunning: { type: Boolean, default: false },
  timerEndsAt: { type: Number, default: 0 },
  slideIndex: { type: Number, default: 0 },
  updatedAt: { type: Number, default: 0 },
});
const ShowState = mongoose.model("ShowState", ShowStateSchema);

async function getState() {
  let s = await ShowState.findById("singleton");
  if (!s) {
    s = await ShowState.create({
      _id: "singleton",
      screen: "welcome",
      roundNum: 1,
      subPhase: "instructions",
      qIndex: 0,
      showAnswer: false,
      timeLeft: 30,
      timerRunning: false,
      timerEndsAt: 0,
      slideIndex: 0,   // FIX: explicit default so it's always present
      updatedAt: Date.now(),
    });
  }
  // FIX: patch missing slideIndex on existing docs (migration safety)
  if (s.slideIndex === undefined || s.slideIndex === null) {
    s = await ShowState.findByIdAndUpdate(
      "singleton",
      { $set: { slideIndex: 0 } },
      { new: true }
    );
  }
  return s;
}

function computeState(state) {
  const obj = state.toObject ? state.toObject() : { ...state };
  if (obj.timerRunning && obj.timerEndsAt > 0) {
    const remaining = Math.ceil((obj.timerEndsAt - Date.now()) / 1000);
    obj.timeLeft = Math.max(0, remaining);
    if (remaining <= 0) obj.timerRunning = false;
  }
  // FIX: ensure slideIndex is always a number in the broadcast state
  if (obj.slideIndex === undefined || obj.slideIndex === null) {
    obj.slideIndex = 0;
  }
  return obj;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
app.post("/admin-login", (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ success: false });
  res.json({ success: password === (process.env.ADMIN_PASSWORD || "ies2026") });
});

// ─── REST fallbacks ───────────────────────────────────────────────────────────
app.get("/api/state", async (req, res) => {
  try { res.json(computeState(await getState())); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/teams", async (req, res) => {
  try { res.json(await Team.find().sort({ createdAt: 1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/teams/:id", async (req, res) => {
  try {
    const { r1, r2, r3 } = req.body;
    const update = {};
    if (r1 !== undefined) update.r1 = r1;
    if (r2 !== undefined) update.r2 = r2;
    if (r3 !== undefined) update.r3 = r3;
    const team = await Team.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/teams/:id", async (req, res) => {
  try { await Team.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/teams", async (req, res) => {
  try { await Team.deleteMany({}); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server on port ${PORT} · WS ready`));