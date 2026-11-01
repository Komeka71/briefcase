import React from 'react';

/**
 * BriefCase Brand Emblem & Typographic Wordmark
 * Refined 'Midnight Chambers' luxury identity:
 * Handcrafted scales inside formal legal briefcase with polished warm brass styling.
 */
export default function Logo({ size = 'md', showSubtitle = true, light = false }) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-xs tracking-[0.24em]',
    md: 'text-sm tracking-[0.26em]',
    lg: 'text-base sm:text-lg tracking-[0.28em]',
    xl: 'text-xl sm:text-2xl tracking-[0.3em]'
  };

  const subSizes = {
    sm: 'text-[7.5px] tracking-[0.22em]',
    md: 'text-[8.5px] tracking-[0.24em]',
    lg: 'text-[10px] tracking-[0.25em]',
    xl: 'text-xs tracking-[0.28em]'
  };

  return (
    <div className="flex items-center space-x-3 group select-none">
      {/* Emblem: Scales + BriefCase Silhouette in Polished Brass */}
      <div className={`${iconSizes[size]} relative flex items-center justify-center flex-shrink-0`}>
        {/* Deep Charcoal Chamber Frame with 1px Brass Hairline */}
        <div className="absolute inset-0 rounded-[4px] bg-gradient-to-br from-[#1E1F23] via-[#141416] to-[#0A0A0B] border border-brass/40 shadow-lg group-hover:border-brass-light group-hover:shadow-[0_0_16px_rgba(184,151,90,0.35)] transition-all duration-300" />

        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5 relative z-10 transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="logoBrassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F0DBA8" />
              <stop offset="50%" stopColor="#B8975A" />
              <stop offset="100%" stopColor="#8C7040" />
            </linearGradient>
            <linearGradient id="logoBrassLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B8975A" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#B8975A" />
            </linearGradient>
          </defs>

          {/* Briefcase Handle */}
          <path
            d="M12 7V5.5C12 4.67 12.67 4 13.5 4H18.5C19.33 4 20 4.67 20 5.5V7"
            stroke="url(#logoBrassGrad)"
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
            stroke="url(#logoBrassGrad)"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Pillar / Stem */}
          <line x1="16" y1="9.5" x2="16" y2="23" stroke="url(#logoBrassGrad)" strokeWidth="1.4" />

          {/* Finial / Apex */}
          <circle cx="16" cy="9.5" r="1.2" fill="url(#logoBrassLight)" />

          {/* Pedestal Stand */}
          <path d="M12.5 23H19.5" stroke="url(#logoBrassGrad)" strokeWidth="1.4" strokeLinecap="round" />

          {/* Balance Crossbeam */}
          <path d="M8 12.5H24" stroke="url(#logoBrassGrad)" strokeWidth="1.3" strokeLinecap="round" />

          {/* Left Pan */}
          <path d="M8 12.5L6 17H11L9 12.5" stroke="url(#logoBrassGrad)" strokeWidth="0.9" fill="rgba(184, 151, 90, 0.15)" />
          <path d="M6 17C6 18.2 7.2 18.8 8.5 18.8C9.8 18.8 11 18.2 11 17" stroke="url(#logoBrassGrad)" strokeWidth="1" />

          {/* Right Pan */}
          <path d="M24 12.5L21 17H26L24 12.5" stroke="url(#logoBrassGrad)" strokeWidth="0.9" fill="rgba(184, 151, 90, 0.15)" />
          <path d="M21 17C21 18.2 22.2 18.8 23.5 18.8C24.8 18.8 26 18.2 26 17" stroke="url(#logoBrassGrad)" strokeWidth="1" />
        </svg>
      </div>

      {/* Typographic Wordmark in Cinzel Display */}
      <div className="leading-tight">
        <div className={`font-display font-bold ${textSizes[size]} ${light ? 'text-charcoal' : 'text-ivory'}`}>
          BRIEF<span className="text-brass">CASE</span>
        </div>
        {showSubtitle && (
          <div className={`font-mono uppercase ${subSizes[size]} text-silver/70 tracking-[0.2em] mt-0.5`}>
            LEGAL CHAMBERS & PRACTICE
          </div>
        )}
      </div>
    </div>
  );
}
