import React, { useState, useEffect } from 'react';

/**
 * Courtroom Entrance Loader
 * Authoritative splash screen with tailored pinstripes, brass emblem and justice motif.
 */
export default function Loader({ onComplete }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 350);
    }, 850);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center pinstripe-dark text-[#F6F4EF] transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute w-96 h-96 bg-[#B8975A]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Center Brand Assembly */}
      <div className="relative z-10 flex flex-col items-center space-y-4">
        {/* Emblem: Briefcase & Scales in Brass */}
        <div className="w-16 h-16 rounded-[4px] bg-gradient-to-br from-[#1E1F23] via-[#141416] to-[#0A0A0B] border border-[#B8975A]/50 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            className="w-10 h-10 text-[#B8975A] relative z-10 animate-pulse"
          >
            <path
              d="M12 7V5.5C12 4.67 12.67 4 13.5 4H18.5C19.33 4 20 4.67 20 5.5V7"
              stroke="#D4B97E"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <rect
              x="4"
              y="7"
              width="24"
              height="19"
              rx="2.5"
              stroke="#B8975A"
              strokeWidth="1.5"
            />
            <line x1="16" y1="9" x2="16" y2="23" stroke="#D4B97E" strokeWidth="1.4" />
            <circle cx="16" cy="9.5" r="1.2" fill="#F6F4EF" />
            <path d="M13 23H19" stroke="#B8975A" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M8.5 12.5H23.5" stroke="#D4B97E" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M8.5 12.5L6.5 17H11.5L8.5 12.5" stroke="#B8975A" strokeWidth="0.9" fill="rgba(184, 151, 90, 0.15)" />
            <path d="M6.5 17C6.5 18.2 7.7 18.8 9 18.8C10.3 18.8 11.5 18.2 11.5 17" stroke="#B8975A" strokeWidth="1" />
            <path d="M23.5 12.5L20.5 17H25.5L23.5 12.5" stroke="#B8975A" strokeWidth="0.9" fill="rgba(184, 151, 90, 0.15)" />
            <path d="M20.5 17C20.5 18.2 21.7 18.8 23 18.8C24.3 18.8 25.5 18.2 25.5 17" stroke="#B8975A" strokeWidth="1" />
          </svg>
        </div>

        {/* Wordmark */}
        <div className="text-center">
          <h1 className="font-serif tracking-[0.3em] text-xl sm:text-2xl text-white font-bold">
            BRIEF<span className="text-[#B8975A]">CASE</span>
          </h1>
          <p className="font-mono uppercase tracking-[0.22em] text-[9.5px] text-[#B4B7BC] mt-1">
            Law Firm Case Management
          </p>
        </div>

        {/* Thin Animated Brass Shimmer Hairline */}
        <div className="w-32 h-[1px] bg-[#2B2D32] relative overflow-hidden mt-1">
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-[#B8975A] to-transparent animate-[shimmer_1.2s_infinite]" />
        </div>
      </div>
    </div>
  );
}
