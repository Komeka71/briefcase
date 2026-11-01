import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PageHeader({
  title,
  subtitle,
  category = 'Practice Management',
  actions,
  badge
}) {
  return (
    <div className="mb-8">
      {/* Breadcrumb / Category */}
      <div className="flex items-center gap-2 text-xs font-mono text-silver/60 mb-2">
        <Link to="/app" className="hover:text-brass transition-colors">CHAMBERS</Link>
        <ChevronRight className="w-3.5 h-3.5 text-steel/50" />
        <span className="text-silver/70 tracking-wider uppercase">{category}</span>
        {badge && (
          <span className="ml-2 px-2 py-0.5 text-[10px] uppercase font-mono tracking-widest text-brass bg-brass/10 border border-brass/25 rounded-xs">
            {badge}
          </span>
        )}
      </div>

      {/* Main Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-ivory">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-xs sm:text-sm text-silver/70 font-light max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Hairline Divider */}
      <div className="mt-6 h-[1px] w-full bg-gradient-to-r from-brass/30 via-brass/10 to-transparent" />
    </div>
  );
}

