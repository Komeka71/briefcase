import React from 'react';

/**
 * BriefCase Brand Logo
 * Inline SVG emblem combining the Scales of Justice with a formal legal Briefcase silhouette.
 * Styled in The Courtroom brass-on-black aesthetic.
 */
export default function Logo({ size = 'md', showSubtitle = true, light = false }) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8 sm:w-9 sm:h-9',
    lg: 'w-10 h-10 sm:w-11 sm:h-11',
    xl: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-xs tracking-[0.22em]',
    md: 'text-xs sm:text-sm tracking-[0.24em]',
    lg: 'text-sm sm:text-base tracking-[0.26em]',
    xl: 'text-lg sm:text-xl tracking-[0.3em]'
  };

  const subSizes = {
    sm: 'text-[7px] tracking-[0.18em]',
    md: 'text-[8px] sm:text-[9px] tracking-[0.2em]',
    lg: 'text-[9px] sm:text-[10px] tracking-[0.22em]',
    xl: 'text-[11px] tracking-[0.25em]'
  };

  return (
    <div className="flex items-center space-x-2.5 sm:space-x-3 group select-none">
      {/* Emblem: BriefCase + Scales of Justice in Brass & Charcoal */}
      <div className={`${iconSizes[size]} relative flex items-center justify-center flex-shrink-0`}>
        {/* Dark Charcoal / Ink container with Brass border */}
        <div className="absolute inset-0 rounded-[4px] bg-gradient-to-br from-[#1E1F23] via-[#141416] to-[#0A0A0B] border border-[#B8975A]/40 shadow-md group-hover:border-[#D4B97E] group-hover:shadow-[0_0_12px_rgba(184,151,90,0.35)] transition-all duration-300" />
        
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5 relative z-10 transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4B97E" />
              <stop offset="55%" stopColor="#B8975A" />
              <stop offset="100%" stopColor="#8C7040" />
            </linearGradient>
            <linearGradient id="brassLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B8975A" />
              <stop offset="50%" stopColor="#F6F4EF" />
              <stop offset="100%" stopColor="#B8975A" />
            </linearGradient>
          </defs>

          {/* Briefcase Handle */}
          <path
            d="M12 7V5.5C12 4.67 12.67 4 13.5 4H18.5C19.33 4 20 4.67 20 5.5V7"
            stroke="url(#brassGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Briefcase Outer Frame */}
          <rect
            x="4"
            y="7"
            width="24"
            height="19"
            rx="2.5"
            stroke="url(#brassGrad)"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Scales of Justice inside Briefcase */}
          {/* Center Pillar */}
          <line x1="16" y1="9" x2="16" y2="23" stroke="url(#brassGrad)" strokeWidth="1.4" />
          
          {/* Pillar Finial / Apex */}
          <circle cx="16" cy="9.5" r="1.2" fill="url(#brassLight)" />
          
          {/* Base Stand */}
          <path d="M13 23H19" stroke="url(#brassGrad)" strokeWidth="1.4" strokeLinecap="round" />

          {/* Balance Crossbeam */}
          <path d="M8.5 12.5H23.5" stroke="url(#brassGrad)" strokeWidth="1.3" strokeLinecap="round" />

          {/* Left Scale Pan & Strings */}
          <path d="M8.5 12.5L6.5 17H11.5L9.5 12.5" stroke="url(#brassGrad)" strokeWidth="0.9" fill="rgba(184, 151, 90, 0.12)" />
          <path d="M6.5 17C6.5 18.2 7.7 18.8 9 18.8C10.3 18.8 11.5 18.2 11.5 17" stroke="url(#brassGrad)" strokeWidth="1" />

          {/* Right Scale Pan & Strings */}
          <path d="M23.5 12.5L20.5 17H25.5L23.5 12.5" stroke="url(#brassGrad)" strokeWidth="0.9" fill="rgba(184, 151, 90, 0.12)" />
          <path d="M20.5 17C20.5 18.2 21.7 18.8 23 18.8C24.3 18.8 25.5 18.2 25.5 17" stroke="url(#brassGrad)" strokeWidth="1" />
        </svg>
      </div>

      {/* Typographic Wordmark */}
      <div className="leading-tight">
        <div className={`font-serif font-bold ${textSizes[size]} tracking-[0.25em] ${light ? 'text-[#0A0A0B]' : 'text-white'}`}>
          BRIEF<span className="text-[#B8975A]">CASE</span>
        </div>
        {showSubtitle && (
          <div className={`font-sans uppercase ${subSizes[size]} text-[#B4B7BC] tracking-[0.18em] mt-0.5`}>
            Law Firm Case Management
          </div>
        )}
      </div>
    </div>
  );
}
