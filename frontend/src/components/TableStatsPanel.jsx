import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { plsqlService } from '../services/api';
import { Table2, Database, FileCode2, ArrowUpRight, Timer, Scale } from 'lucide-react';

/**
 * Lab Assignment 11.E — statistics of ALL project tables with a message each,
 * plus shortcuts to the Assignment 10 and Assignment 11 pages.
 * Styled in "The Courtroom" Dark & Brass aesthetic.
 */
export default function TableStatsPanel() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    plsqlService.getTableStats()
      .then((r) => setStats(r.data))
      .catch((e) => setError(e.response?.data?.message || 'Connecting to database schema statistics...'));
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <Link
          to="/app/plsql"
          className="group court-card p-4 flex items-start justify-between transition-all"
        >
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#D4B97E] flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#B8975A]" /> Lab Assignment 10
            </div>
            <div className="text-sm font-serif font-semibold text-white group-hover:text-[#D4B97E] transition-colors">
              PL/SQL Lab — Stored Procedures & Triggers
            </div>
            <div className="text-[11px] text-[#B4B7BC] font-sans">
              Run procedures 10.1 – 10.10 live with real-time execution telemetry
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#6B6F76] group-hover:text-[#B8975A] transition-colors" />
        </Link>

        <Link
          to="/app/reports"
          className="group court-card p-4 flex items-start justify-between transition-all"
        >
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#72C095] flex items-center gap-1.5">
              <FileCode2 className="w-3.5 h-3.5 text-[#3F7D5C]" /> Lab Assignment 11
            </div>
            <div className="text-sm font-serif font-semibold text-white group-hover:text-[#D4B97E] transition-colors">
              SQL Lab — Complex Queries, Views & XML
            </div>
            <div className="text-[11px] text-[#B4B7BC] font-sans">
              Queries 1–8, relational joins, subqueries and XML document streams
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#6B6F76] group-hover:text-[#B8975A] transition-colors" />
        </Link>
      </div>

      <div className="court-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#2B2D32]">
          <h3 className="text-sm font-serif font-semibold text-white flex items-center gap-2">
            <Table2 className="w-4 h-4 text-[#B8975A]" /> Relational Architecture — Core Tables
          </h3>
          {stats && (
            <div className="text-[10px] font-mono text-[#B4B7BC] flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-[#141416] border border-[#2B2D32]">{stats.totals?.tables || 0} Tables</span>
              <span className="px-2 py-0.5 rounded bg-[#141416] border border-[#2B2D32]">{stats.totals?.rows || 0} Records</span>
              <span className="px-2 py-0.5 rounded bg-[#141416] border border-[#2B2D32]">{stats.totals?.views || 0} Views</span>
              {stats.executionTimeMs && (
                <span className="text-[#72C095] flex items-center gap-1">
                  <Timer className="w-3 h-3" />{stats.executionTimeMs} ms
                </span>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-[#B4B7BC]/70 mt-3 font-mono">
            {error}
          </p>
        )}

        {!stats && !error && (
          <p className="text-xs text-[#B4B7BC]/60 mt-3 font-mono">
            Verifying table telemetry across relational schema...
          </p>
        )}

        {stats?.data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3.5">
            {stats.data.map((t) => (
              <div
                key={t.table_name}
                className={`p-3 rounded-sm border transition-all ${
                  Number(t.row_count) === 0
                    ? 'border-[#C08A2E]/30 bg-[#C08A2E]/5'
                    : 'border-[#2B2D32] bg-[#141416]/90 hover:border-[#B8975A]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#F6F4EF] truncate font-medium">{t.table_name}</span>
                  <span className="text-base font-serif font-bold text-[#D4B97E]">{t.row_count}</span>
                </div>
                <div className="text-[10px] text-[#6B6F76] mt-1 leading-snug">{t.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
