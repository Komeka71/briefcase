import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { EASE_EXPO } from '../../lib/motion';

export default function Toast({
  message,
  type = 'success',
  onClose,
  visible = true
}) {
  if (!message || !visible) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-brass-light shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/30',
    error: 'border-rose-500/30',
    info: 'border-brass/30'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: EASE_EXPO }}
        className={`fixed top-6 right-6 z-50 flex items-start gap-3 p-4 max-w-md rounded-md bg-charcoal/95 border ${borders[type] || borders.info} backdrop-blur-xl shadow-2xl text-ivory`}
      >
        {icons[type] || icons.info}
        <div className="flex-1 text-xs sm:text-sm font-sans leading-snug">
          {message}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-silver/60 hover:text-ivory transition-colors cursor-pointer p-0.5"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

