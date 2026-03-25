const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// ─── CORS CONFIG ──────────────────────────────────────────────────────────────
const allowedOrigins = [
  "https://optirelay.netlify.app", // your deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
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

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(express.json());

const server = http.createServer(app);

// ─── MONGODB ──────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/optirelay")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ─── SCHEMA ───────────────────────────────────────────────────────────────────
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

// ─── AUTH ─────────────────────────────────────────────────────────────────────
app.post("/admin-login", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      error: "No password provided",
    });
  }

  const correct = process.env.ADMIN_PASSWORD || "ies2026";

  if (password === correct) {
    return res.json({ success: true });
  } else {
    return res.json({ success: false });
  }
});

// ─── TEAMS API ────────────────────────────────────────────────────────────────

// GET all teams
app.get("/api/teams", async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: 1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create team
app.post("/api/teams", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Name required" });
    }

    const existing = await Team.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ error: "Team already exists" });
    }

    const team = await Team.create({
      name: name.trim(),
      r1: 0,
      r2: 0,
      r3: 0,
    });

    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update scores
app.patch("/api/teams/:id", async (req, res) => {
  try {
    const { r1, r2, r3 } = req.body;
    const update = {};

    if (r1 !== undefined) update.r1 = Math.max(0, r1);
    if (r2 !== undefined) update.r2 = Math.max(0, r2);
    if (r3 !== undefined) update.r3 = Math.max(0, r3);

    const team = await Team.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE one team
app.delete("/api/teams/:id", async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE all teams
app.delete("/api/teams", async (req, res) => {
  try {
    await Team.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});