import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUESTIONS = [
  { q: "What is the heart of Industry 4.0?", options: ["Manual labor", "Data", "Paper files", "Steam engines"] },
  { q: "Which 5S stands for 'Set in Order'?", options: ["Seiri", "Seiton", "Seiso", "Seiketsu"] },
];

export default function Round1() {
  const [subPhase, setSubPhase] = useState("rules"); // rules, countdown, questions
  const [qIndex, setQIndex] = useState(0);
  const [count, setCount] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setSubPhase(localStorage.getItem("r1_subphase") || "rules");
      setQIndex(parseInt(localStorage.getItem("qIndex") || "0"));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Countdown Logic
  useEffect(() => {
    if (subPhase === "countdown" && count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else if (subPhase === "countdown" && count === 0) {
      localStorage.setItem("r1_subphase", "questions");
    }
  }, [subPhase, count]);

  const current = QUESTIONS[qIndex] || QUESTIONS[0];

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#020f0d] text-white font-rajdhani">
      <AnimatePresence mode="wait">
        
        {/* STAGE 1: RULES */}
        {subPhase === "rules" && (
          <motion.div key="rules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-10 border border-emerald-500/20 rounded-3xl bg-emerald-500/5">
            <h1 className="text-6xl font-orbitron text-emerald-400 mb-8">ROUND 1 RULES</h1>
            <ul className="text-3xl space-y-4 text-left inline-block">
              <li>⚡ 30 Seconds per question</li>
              <li>⚡ Fastest Finger format</li>
              <li>⚡ No negative marking</li>
            </ul>
          </motion.div>
        )}

        {/* STAGE 2: COUNTDOWN */}
        {subPhase === "countdown" && (
          <motion.div key="count" initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0 }} className="text-[200px] font-orbitron text-emerald-500">
            {count > 0 ? count : "GO!"}
          </motion.div>
        )}

        {/* STAGE 3: QUESTIONS */}
        {subPhase === "questions" && (
          <motion.div key="ques" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-center max-w-6xl">
            <h3 className="text-emerald-500 font-orbitron mb-4 tracking-[0.3em]">QUESTION {qIndex + 1}</h3>
            <h2 className="text-5xl font-bold mb-12 uppercase leading-tight">{current.q}</h2>
            <div className="grid grid-cols-2 gap-8 text-3xl">
              {current.options.map((opt, i) => (
                <div key={i} className="p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl">
                  <span className="text-emerald-500 font-orbitron mr-4">{String.fromCharCode(65+i)}.</span>{opt}
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}