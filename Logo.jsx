import React from 'react';

export default function Logo({ size = 'md', showSubtitle = true, light = false }) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7 sm:w-8 sm:h-8',
    lg: 'w-9 h-9 sm:w-10 sm:h-10',
    xl: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-xs tracking-[0.2em]',
    md: 'text-xs sm:text-sm tracking-[0.22em]',
    lg: 'text-sm sm:text-base tracking-[0.25em]',
    xl: 'text-lg sm:text-xl tracking-[0.28em]'
  };

  const subSizes = {
    sm: 'text-[7px] tracking-[0.18em]',
    md: 'text-[8px] sm:text-[9px] tracking-[0.2em]',
    lg: 'text-[9px] sm:text-[10px] tracking-[0.22em]',
    xl: 'text-[11px] tracking-[0.25em]'
  };

  return (
    <div className="flex items-center space-x-2.5 sm:space-x-3 group">
      {/* Refined Scales Emblem in Midnight Navy & Cream */}
      <div className={`${iconSizes[size]} relative flex items-center justify-center flex-shrink-0`}>
        <div className="absolute inset-0 rounded-sm bg-gradient-to-br from-[#2e231b] via-[#241b15] to-[#150f0b] border border-[#f5f0e7]/25 shadow-md group-hover:border-[#ffffff]/60 transition-colors" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3/5 h-3/5 text-[#f5f0e7] relative z-10 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Central Pillar & Apex */}
          <line x1="12" y1="3" x2="12" y2="20" />
          <circle cx="12" cy="3" r="1.25" fill="#f5f0e7" />
          <path d="M9 20h6" />
          {/* Balance Beam */}
          <path d="M5 7h14" />
          {/* Left Pan */}
          <path d="M5 7l-2.5 5h5L5 7z" fill="rgba(245, 240, 231, 0.12)" />
          <path d="M2.5 12a2.5 2.5 0 0 0 5 0" />
          {/* Right Pan */}
          <path d="M19 7l-2.5 5h5L19 7z" fill="rgba(245, 240, 231, 0.12)" />
          <path d="M16.5 12a2.5 2.5 0 0 0 5 0" />
        </svg>
      </div>

      {/* Typographic Wordmark */}
      <div className="leading-tight select-none">
        <div className={`font-display font-semibold ${textSizes[size]} ${light ? 'text-[#150f0b]' : 'text-white'}`}>
          BRIEFCASE
        </div>
        {showSubtitle && (
          <div className={`font-serif uppercase ${subSizes[size]} text-[#f5f0e7]/75 mt-0.5`}>
            Chambers & Practice
          </div>
        )}
      </div>
    </div>
  );
}
