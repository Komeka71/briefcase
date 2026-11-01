import React from 'react';
import { motion } from 'framer-motion';
import { EASE_EXPO } from '../../lib/motion';

export default function SectionHeading({
  numeral,
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
  light = false
}) {
  const isCentered = align === 'center';

  return (
    <div className={`mb-12 md:mb-16 ${isCentered ? 'text-center mx-auto max-w-3xl' : 'max-w-2xl'} ${className}`}>
      {/* Eyebrow / Numeral */}
      {(numeral || eyebrow) && (
        <div className={`flex items-center gap-3 mb-3 ${isCentered ? 'justify-center' : 'justify-start'}`}>
          {numeral && (
            <span className="font-display text-xs md:text-sm font-semibold tracking-widest text-brass border border-brass/30 px-2 py-0.5 rounded-xs">
              SECTION {numeral}
            </span>
          )}
          {eyebrow && (
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-silver/80">
              {eyebrow}
            </span>
          )}
        </div>
      )}

      {/* Main Title */}
      <h2 className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.15] mb-4 ${light ? 'text-ivory' : 'text-ivory'}`}>
        {title}
      </h2>

      {/* Brass Hairline */}
      <div className={`py-1 flex ${isCentered ? 'justify-center' : 'justify-start'}`}>
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8, ease: EASE_EXPO }}
          className="h-[1px] w-24 bg-gradient-to-r from-transparent via-brass to-transparent origin-left"
        />
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-4 text-sm sm:text-base text-silver/80 leading-relaxed font-sans font-light">
          {subtitle}
        </p>
      )}
    </div>
  );
}

