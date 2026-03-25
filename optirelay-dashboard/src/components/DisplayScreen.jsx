import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import WelcomeScreen from "./WelcomeScreen";
import Round1 from "./Round1";
import Round2 from "./Round2";
import Round3 from "./Round3";

export default function DisplayScreen({ gameState }) {
  const { phase } = gameState;

  const renderContent = () => {
    switch (phase) {
      case "welcome": return <WelcomeScreen />;
      case "round1": return <Round1 qIndex={gameState.qIndex} />;
      case "round2": return <Round2 qIndex={gameState.qIndex} />;
      case "round3": return <Round3 />;
      default: return <WelcomeScreen />;
    }
  };

  return (
    <div className="w-full h-screen relative overflow-hidden flex items-center justify-center font-orbitron">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,#00d4aa_1px,transparent_1px),linear-gradient(to_bottom,#00d4aa_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full flex items-center justify-center"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}