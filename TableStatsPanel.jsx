import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { plsqlService } from '../services/api';
import { Table2, Database, FileCode2, ArrowUpRight, Timer } from 'lucide-react';

/**
 * Lab Assignment 11.E — statistics of ALL project tables with a message each,
 * plus shortcuts to the Assignment 10 and Assignment 11 pages.
 */
export default function TableStatsPanel() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    plsqlService.getTableStats()
      .then((r) => setStats(r.data))
      .catch((e) => setError(e.response?.data?.message || e.message));
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link to="/app/plsql" className="group bg-[#1c1510] border border-white/10 hover:border-white/30 rounded-sm p-4 flex items-start justify-between transition-colors">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#e6cfa9] flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> Lab Assignment 10</div>
            <div className="text-sm font-serif font-semibold text-white mt-1">PL/SQL Lab — Procedures, Cursors, Functions & Triggers</div>
            <div className="text-[11px] text-[#f5f0e7]/60 mt-0.5">Run 10.1 – 10.10 live with execution time</div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#f5f0e7]/60 group-hover:text-white" />
        </Link>
        <Link to="/app/reports" className="group bg-[#1c1510] border border-white/10 hover:border-white/30 rounded-sm p-4 flex items-start justify-between transition-colors">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 flex items-center gap-1.5"><FileCode2 className="w-3.5 h-3.5" /> Lab Assignment 11</div>
            <div className="text-sm font-serif font-semibold text-white mt-1">SQL Lab — Queries 1–8, Joins, Views & XML</div>
            <div className="text-[11px] text-[#f5f0e7]/60 mt-0.5">XML output for Queries 1, 3 and 4</div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#f5f0e7]/60 group-hover:text-white" />
        </Link>
      </div>

      <div className="bg-[#1c1510] border border-white/10 rounded-sm p-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/5">
          <h3 className="text-sm font-serif font-semibold text-white flex items-center gap-2">
            <Table2 className="w-4 h-4" /> Database Statistics — All Tables
          </h3>
          {stats && (
            <div className="text-[10px] font-mono text-[#f5f0e7]/70 flex items-center gap-3">
              <span>{stats.totals.tables} tables</span>
              <span>{stats.totals.rows} rows</span>
              <span>{stats.totals.views} views</span>
              <span className="text-emerald-400 flex items-center gap-1"><Timer className="w-3 h-3" />{stats.executionTimeMs} ms</span>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-300 mt-3">Could not load table statistics: {error}</p>}
        {!stats && !error && <p className="text-xs text-[#f5f0e7]/60 mt-3 font-mono">Counting rows in every table…</p>}

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
            {stats.data.map((t) => (
              <div key={t.table_name} className={`p-3 rounded-sm border ${Number(t.row_count) === 0 ? 'border-amber-500/30 bg-amber-950/20' : 'border-white/5 bg-[#150f0b]'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#f5f0e7]/80 truncate">{t.table_name}</span>
                  <span className="text-lg font-serif font-bold text-white">{t.row_count}</span>
                </div>
                <div className="text-[10px] text-[#f5f0e7]/55 mt-1 leading-snug">{t.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
