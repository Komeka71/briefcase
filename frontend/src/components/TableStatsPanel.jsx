import React, { useEffect, useState } from 'react';
import { plsqlService } from '../services/api';
import { Table2 } from 'lucide-react';

export default function TableStatsPanel() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    plsqlService.getTableStats()
      .then((r) => setStats(r.data))
      .catch((e) => setError(e.response?.data?.message || 'Connecting to database schema statistics...'));
  }, []);

  return (
    <div className="space-y-5">
      <div className="court-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-brass/15">
          <h3 className="text-sm font-serif font-medium text-ivory flex items-center gap-2.5">
            <Table2 className="w-4 h-4 text-brass" /> Practice Entity Registry — Core Tables
          </h3>
          {stats && (
            <div className="text-[10px] font-mono text-silver flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-xs bg-graphite border border-brass/15">{stats.totals?.tables || 0} Tables</span>
              <span className="px-2.5 py-0.5 rounded-xs bg-graphite border border-brass/15">{stats.totals?.rows || 0} Records</span>
              <span className="px-2.5 py-0.5 rounded-xs bg-graphite border border-brass/15">{stats.totals?.views || 0} Views</span>
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-silver/70 mt-4 font-mono">
            {error}
          </p>
        )}

        {!stats && !error && (
          <p className="text-xs text-silver/60 mt-4 font-mono">
            Verifying table statistics across practice schema...
          </p>
        )}

        {stats?.data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {stats.data.map((t) => (
              <div
                key={t.table_name}
                className={`p-3.5 rounded-xs border transition-all ${
                  Number(t.row_count) === 0
                    ? 'border-amber-500/30 bg-amber-950/20'
                    : 'border-brass/15 bg-graphite/60 hover:border-brass/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-ivory truncate font-medium">{t.table_name}</span>
                  <span className="text-base font-serif font-bold text-brass">{t.row_count}</span>
                </div>
                <div className="text-[11px] text-silver/60 mt-1 leading-snug">{t.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
