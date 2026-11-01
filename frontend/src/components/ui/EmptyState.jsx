import React from 'react';
import { Scale } from 'lucide-react';
import MagneticButton from './MagneticButton';

export default function EmptyState({
  icon: Icon = Scale,
  title = 'No records found',
  description = 'There are no active records in this registry matching your current criteria.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`p-12 text-center rounded-md border border-brass/15 bg-charcoal/40 backdrop-blur-sm flex flex-col items-center justify-center my-4 ${className}`}>
      <div className="w-14 h-14 rounded-full bg-graphite/70 border border-brass/25 flex items-center justify-center text-brass mb-4 shadow-inner">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>

      <h4 className="font-serif text-lg font-medium text-ivory mb-2">
        {title}
      </h4>

      <p className="text-xs sm:text-sm text-silver/70 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <MagneticButton variant="brass" size="sm" onClick={onAction}>
          {actionLabel}
        </MagneticButton>
      )}
    </div>
  );
}

