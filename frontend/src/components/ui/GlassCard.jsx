import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  ...props
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverEffect ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={`relative overflow-hidden rounded-md border border-brass/15 bg-charcoal/70 backdrop-blur-md shadow-xl transition-colors duration-200 hover:border-brass/35 ${className}`}
      {...props}
    >
      {/* Corner brass accent */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[1px] h-3 bg-brass" />
        <div className="absolute top-0 right-0 w-3 h-[1px] bg-brass" />
      </div>

      {children}
    </motion.div>
  );
}

