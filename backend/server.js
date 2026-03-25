const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// ─── CORS CONFIG ──────────────────────────────────────────────────────────────
const allowedOrigins = [
  "https://optirelay.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("❌ Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

const server = http.createServer(app);

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

// ─── SHOW STATE (persisted in DB, single doc) ─────────────────────────────────
const ShowStateSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "singleton" },
    screen: { type: String, default: "welcome" },
    roundNum: { type: Number, default: 1 },
    subPhase: { type: String, default: "instructions" },
    qIndex: { type: Number, default: 0 },
    showAnswer: { type: Boolean, default: false },
    timeLeft: { type: Number, default: 30 },
    // timerRunning is managed server-side for accuracy
    timerRunning: { type: Boolean, default: false },
    timerEndsAt: { type: Number, default: 0 }, // epoch ms when timer hits 0
    updatedAt: { type: Number, default: 0 },
  },
  { _id: false }
);

const ShowState = mongoose.model("ShowState", ShowStateSchema);

// Ensure singleton exists
async function getState() {
  let state = await ShowState.findById("singleton");
  if (!state) {
    state = await ShowState.create({ _id: "singleton", updatedAt: Date.now() });
  }
  return state;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
app.post("/admin-login", (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ success: false, error: "No password provided" });
  const correct = process.env.ADMIN_PASSWORD || "ies2026";
  res.json({ success: password === correct });
});

// ─── SHOW STATE API ───────────────────────────────────────────────────────────

// GET current show state (display polls this)
app.get("/api/state", async (req, res) => {
  try {
    const state = await getState();
    const now = Date.now();

    // Compute live timeLeft from server clock if timer is running
    let timeLeft = state.timeLeft;
    let timerRunning = state.timerRunning;

    if (state.timerRunning && state.timerEndsAt > 0) {
      const remaining = Math.ceil((state.timerEndsAt - now) / 1000);
      if (remaining <= 0) {
        timeLeft = 0;
        timerRunning = false;
        // persist the stopped state
        await ShowState.findByIdAndUpdate("singleton", {
          timeLeft: 0,
          timerRunning: false,
          updatedAt: Date.now(),
        });
      } else {
        timeLeft = remaining;
      }
    }

    res.json({
      screen: state.screen,
      roundNum: state.roundNum,
      subPhase: state.subPhase,
      qIndex: state.qIndex,
      showAnswer: state.showAnswer,
      timeLeft,
      timerRunning,
      updatedAt: state.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update show state (admin calls this)
app.patch("/api/state", async (req, res) => {
  try {
    const allowed = ["screen", "roundNum", "subPhase", "qIndex", "showAnswer", "timeLeft", "timerRunning", "timerEndsAt"];
    const update = { updatedAt: Date.now() };
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    const state = await ShowState.findByIdAndUpdate("singleton", update, { new: true, upsert: true });
    res.json({ success: true, state });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── TEAMS API ────────────────────────────────────────────────────────────────
app.get("/api/teams", async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: 1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/teams", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Name required" });
    const existing = await Team.findOne({ name: name.trim() });
    if (existing) return res.status(409).json({ error: "Team already exists" });
    const team = await Team.create({ name: name.trim(), r1: 0, r2: 0, r3: 0 });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/teams/:id", async (req, res) => {
  try {
    const { r1, r2, r3 } = req.body;
    const update = {};
    if (r1 !== undefined) update.r1 = Math.max(0, r1);
    if (r2 !== undefined) update.r2 = Math.max(0, r2);
    if (r3 !== undefined) update.r3 = Math.max(0, r3);
    const team = await Team.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/teams/:id", async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/teams", async (req, res) => {
  try {
    await Team.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));