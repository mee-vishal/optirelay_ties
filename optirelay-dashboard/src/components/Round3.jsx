import React from "react";

const ROUND1_QUESTIONS = [
  { q: "What is the heart of Industry 4.0?", options: ["Manual labor", "Data", "Paper files", "Steam engines"] },
  { q: "Which 5S stands for 'Set in Order'?", options: ["Seiri", "Seiton", "Seiso", "Seiketsu"] },
];

export default function Round1({ qIndex }) {
  const current = ROUND1_QUESTIONS[qIndex] || ROUND1_QUESTIONS[0];

  return (
    <div className="text-center p-10 max-w-6xl">
      <h3 className="text-emerald-500 mb-4 tracking-[0.5em]">ROUND 1: KNOWLEDGE SPRINT</h3>
      <h2 className="text-5xl md:text-6xl font-bold mb-12 uppercase leading-tight">
        {current.q}
      </h2>
      <div className="grid grid-cols-2 gap-8 text-3xl font-rajdhani">
        {current.options.map((opt, i) => (
          <div key={i} className="p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl">
            <span className="text-emerald-500 font-orbitron mr-4">{String.fromCharCode(65+i)}.</span>
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
}