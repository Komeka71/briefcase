import React from 'react';

const statusMap = {
  // Success / Green
  active: 'badge-success',
  paid: 'badge-success',
  completed: 'badge-success',
  resolved: 'badge-success',
  won: 'badge-success',
  verified: 'badge-success',
  approved: 'badge-success',
  success: 'badge-success',

  // Warning / Gold / Amber
  pending: 'badge-warning',
  in_progress: 'badge-warning',
  'in progress': 'badge-warning',
  scheduled: 'badge-warning',
  partial: 'badge-warning',
  review: 'badge-warning',
  medium: 'badge-warning',

  // Danger / Red
  urgent: 'badge-danger',
  critical: 'badge-danger',
  high: 'badge-danger',
  overdue: 'badge-danger',
  failed: 'badge-danger',
  closed: 'badge-danger',
  terminated: 'badge-danger',
  error: 'badge-danger',

  // Info / Blue / Slate
  draft: 'badge-info',
  filed: 'badge-info',
  low: 'badge-info',
  normal: 'badge-info',
  open: 'badge-info',
  info: 'badge-info',
  discovery: 'badge-info'
};

export default function StatusPill({ status = '', className = '', showDot = true }) {
  const normalized = String(status).toLowerCase().trim();
  const badgeClass = statusMap[normalized] || 'bg-slate/40 text-silver border border-slate';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-medium ${badgeClass} ${className}`}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      )}
      <span>{status || 'Unknown'}</span>
    </span>
  );
}

