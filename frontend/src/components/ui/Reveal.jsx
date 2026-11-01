import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, fadeIn, scaleIn, slideInLeft, slideInRight } from '../../lib/motion';

const variantsMap = {
  fadeUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight
};

export default function Reveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration,
  className = '',
  threshold = 0.15,
  once = true
}) {
  const selectedVariant = variantsMap[variant] || fadeUp;

  const customVariant = {
    ...selectedVariant,
    visible: {
      ...selectedVariant.visible,
      transition: {
        ...selectedVariant.visible.transition,
        delay,
        ...(duration ? { duration } : {})
      }
    }
  };

  return (
    <motion.div
      variants={customVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

