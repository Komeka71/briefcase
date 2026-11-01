import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_EXPO } from '../lib/motion';

/**
 * Cinematic Courtroom Entrance Loader
 * 1.5-2.0s intro:
 * - Handcrafted emblem draws in with animated brass paths
 * - Resonant gavel strike pulse wave
 * - Typographic reveal in Cinzel
 * - Theatrical vertical curtain-wipe transition into chambers
 */
export default function Loader({ onComplete }) {
  const [stage, setStage] = useState('drawing'); // 'drawing' -> 'pulse' -> 'curtain' -> 'done'

  useEffect(() => {
    // Pulse trigger
    const pulseTimer = setTimeout(() => {
      setStage('pulse');
    }, 900);

    // Curtain reveal trigger
    const curtainTimer = setTimeout(() => {
      setStage('curtain');
    }, 1750);

    // Complete callback
    const doneTimer = setTimeout(() => {
      setStage('done');
      if (onComplete) onComplete();
    }, 2400);

    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(curtainTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage !== 'done' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-ink select-none">
          {/* Top & Bottom Split Curtains */}
          <motion.div
            initial={{ y: '0%' }}
            animate={stage === 'curtain' ? { y: '-100%' } : { y: '0%' }}
            transition={{ duration: 0.75, ease: EASE_EXPO }}
            className="absolute top-0 left-0 right-0 h-1/2 bg-[#080809] border-b border-brass/20 z-20 pointer-events-none pinstripe-dark"
          />
          <motion.div
            initial={{ y: '0%' }}
            animate={stage === 'curtain' ? { y: '100%' } : { y: '0%' }}
            transition={{ duration: 0.75, ease: EASE_EXPO }}
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#080809] border-t border-brass/20 z-20 pointer-events-none pinstripe-dark"
          />

          {/* Ambient Warm Candlelight Glow */}
          <motion.div
            animate={{
              scale: stage === 'pulse' ? [1, 1.45, 1.1] : [1, 1.08, 1],
              opacity: stage === 'pulse' ? [0.25, 0.6, 0.35] : [0.15, 0.3, 0.15]
            }}
            transition={{ duration: stage === 'pulse' ? 0.6 : 2.5, repeat: stage === 'pulse' ? 0 : Infinity }}
            className="absolute w-[500px] h-[500px] rounded-full bg-radial from-brass/30 via-brass/5 to-transparent blur-3xl pointer-events-none z-10"
          />

          {/* Gavel Strike Shockwave Ring */}
          {stage === 'pulse' && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.7, ease: EASE_EXPO }}
              className="absolute w-48 h-48 rounded-full border border-brass/60 z-15 pointer-events-none shadow-[0_0_24px_rgba(184,151,90,0.5)]"
            />
          )}

          {/* Center Brand Assembly */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={stage === 'curtain' ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative z-30 flex flex-col items-center space-y-6"
          >
            {/* The Emblem Box */}
            <div className="relative w-20 h-20 rounded-md bg-gradient-to-br from-[#1E1F23] via-[#141416] to-[#0A0A0B] border border-brass/40 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.85)]">
              {/* Corner Gold Highlights */}
              <span className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-brass/60" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-brass/60" />
              <span className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-brass/60" />
              <span className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-brass/60" />

              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12"
              >
                {/* Handle */}
                <motion.path
                  d="M12 7V5.5C12 4.67 12.67 4 13.5 4H18.5C19.33 4 20 4.67 20 5.5V7"
                  stroke="#E2CA94"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: EASE_EXPO }}
                />

                {/* Briefcase Body */}
                <motion.rect
                  x="4"
                  y="7"
                  width="24"
                  height="19"
                  rx="2.5"
                  stroke="#B8975A"
                  strokeWidth="1.6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.1, ease: EASE_EXPO }}
                />

                {/* Scales Stem */}
                <motion.line
                  x1="16"
                  y1="9.5"
                  x2="16"
                  y2="23"
                  stroke="#E2CA94"
                  strokeWidth="1.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                />

                {/* Crossbeam */}
                <motion.path
                  d="M8 12.5H24"
                  stroke="#B8975A"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                />

                {/* Left Pan */}
                <motion.path
                  d="M8 12.5L6 17H11L9 12.5"
                  stroke="#B8975A"
                  strokeWidth="1"
                  fill="rgba(184, 151, 90, 0.15)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                />

                {/* Right Pan */}
                <motion.path
                  d="M24 12.5L21 17H26L24 12.5"
                  stroke="#B8975A"
                  strokeWidth="1"
                  fill="rgba(184, 151, 90, 0.15)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                />
              </svg>
            </div>

            {/* Wordmark and Monogram */}
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: EASE_EXPO }}
                className="font-display tracking-[0.35em] text-2xl sm:text-3xl text-ivory font-bold"
              >
                BRIEF<span className="text-brass">CASE</span>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="font-mono uppercase tracking-[0.26em] text-[10px] text-silver/70 mt-1.5"
              >
                ADVOCATES & PRACTICE CHAMBERS
              </motion.p>
            </div>

            {/* Brass Animated Hairline Accent */}
            <div className="w-36 h-[1px] bg-slate/50 relative overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-full bg-gradient-to-r from-transparent via-brass to-transparent"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
