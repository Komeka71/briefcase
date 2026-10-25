import React, { useState, useEffect } from 'react';

export default function Loader({ onComplete }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Short, sleek introductory reveal (1.1 seconds)
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 400);
    }, 900);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#150f0b] transition-opacity duration-400 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient Navy Glow */}
      <div className="absolute w-80 h-80 bg-[#3a2d24]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Center Brand Assembly */}
      <div className="relative z-10 flex flex-col items-center space-y-3.5">
        {/* Emblem */}
        <div className="w-14 h-14 rounded-sm bg-gradient-to-br from-[#2e231b] via-[#241b15] to-[#150f0b] border border-[#f5f0e7]/30 flex items-center justify-center shadow-2xl relative overflow-hidden">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 text-[#f5f0e7] relative z-10 animate-pulse"
          >
            <line x1="12" y1="3" x2="12" y2="20" />
            <circle cx="12" cy="3" r="1.5" fill="#f5f0e7" />
            <path d="M9 20h6" />
            <path d="M5 7h14" />
            <path d="M5 7l-2.5 5h5L5 7z" fill="rgba(245, 240, 231, 0.15)" />
            <path d="M2.5 12a2.5 2.5 0 0 0 5 0" />
            <path d="M19 7l-2.5 5h5L19 7z" fill="rgba(245, 240, 231, 0.15)" />
            <path d="M16.5 12a2.5 2.5 0 0 0 5 0" />
          </svg>
        </div>

        {/* Wordmark */}
        <div className="text-center">
          <h1 className="font-display tracking-[0.3em] text-lg sm:text-xl text-white font-semibold">
            BRIEFCASE
          </h1>
          <p className="font-serif uppercase tracking-[0.2em] text-[9px] text-[#f5f0e7]/70 mt-0.5">
            Legal Practice Management
          </p>
        </div>

        {/* Thin Animated Cream Line */}
        <div className="w-28 h-[1px] bg-white/10 relative overflow-hidden mt-1">
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-transparent via-[#f5f0e7] to-transparent animate-[shimmer_1s_infinite]" />
        </div>
      </div>
    </div>
  );
}
