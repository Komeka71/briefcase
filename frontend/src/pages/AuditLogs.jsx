import React, { useState, useEffect } from 'react';
import { auditService } from '../services/api';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Database,
  Code,
  AlertCircle,
  ShieldCheck,
  Terminal,
  Activity
} from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [filterTable, setFilterTable] = useState('');
  const [filterOp, setFilterOp] = useState('');
  const [stats, setStats] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await auditService.getLogs(page, pageSize, filterTable, filterOp);
      setLogs(res.data.data || []);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.total_pages);
        setTotalRecords(res.data.pagination.total_records);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve audit log history.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await auditService.getStats();
      setStats(res.data.data);
    } catch (err) {
      console.warn('Could not load audit stats:', err.message);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [page, pageSize, filterTable, filterOp]);

  return (
    <div className="space-y-6 pb-8">
      {/* Editorial Header */}
      <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#c9a96e]/5 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold bg-[#18263d] text-[#c9a96e] border border-[#c9a96e]/30">
              Lab Assignment 10 • Requirement 10.9
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Table: application_audit_log (AFTER Triggers)
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-normal text-white tracking-tight">
            Forensic Audit Trail & <span className="italic text-[#c9a96e]">Mutation Logs</span>
          </h1>

          <p className="text-xs md:text-sm text-slate-300 font-serif leading-relaxed max-w-2xl">
            Automated database trigger logs capturing JSON serialization snapshots for every INSERT, UPDATE,
            and DELETE transaction with caller session context.
          </p>
        </div>

        <button
          onClick={() => {
            fetchLogs();
            fetchStats();
          }}
          className="relative z-10 inline-flex items-center space-x-2 px-4 py-2.5 bg-[#18263d] hover:bg-[#22334d] border border-[#c9a96e]/40 hover:border-[#c9a96e] text-[#dfbe85] rounded-sm text-xs font-mono uppercase tracking-wider transition-all duration-200 shadow-lg group"
        >
          <RefreshCw className="w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-180 text-[#c9a96e]" />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[#18263d] border-l-4 border-red-500 rounded-sm text-slate-200 flex items-start space-x-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs font-serif">{error}</div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[#141f32] p-4 rounded-sm border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <select
              value={filterOp}
              onChange={(e) => {
                setFilterOp(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-slate-300 font-mono focus:outline-none"
            >
              <option value="">All Operations (INSERT, UPDATE, DELETE)</option>
              <option value="INSERT">INSERT Operations</option>
              <option value="UPDATE">UPDATE Operations</option>
              <option value="DELETE">DELETE Operations</option>
            </select>
          </div>

          <div>
            <select
              value={filterTable}
              onChange={(e) => {
                setFilterTable(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-slate-300 font-mono focus:outline-none"
            >
              <option value="">All Audited Tables</option>
              <option value="CLIENT">CLIENT Table</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Logged Transactions: <span className="text-[#dfbe85] font-bold">{totalRecords}</span>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-[#141f32] rounded-sm border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0e1624] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Audit ID</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Operation</th>
                <th className="px-5 py-3.5">Target Entity</th>
                <th className="px-5 py-3.5">Record ID</th>
                <th className="px-5 py-3.5">Session User</th>
                <th className="px-5 py-3.5">Mutation State Diff / JSON Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 font-serif">
                    Scanning forensic audit logs from MySQL...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 font-serif">
                    No audit records found. Perform an INSERT, UPDATE, or DELETE on Clients to trigger automated audit logging.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  let parsedOld = null;
                  let parsedNew = null;
                  try {
                    parsedOld = typeof log.old_values === 'string' ? JSON.parse(log.old_values) : log.old_values;
                    parsedNew = typeof log.new_values === 'string' ? JSON.parse(log.new_values) : log.new_values;
                  } catch (e) {}

                  return (
                    <tr key={log.audit_id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-mono text-xs font-bold text-[#c9a96e]">
                        #{log.audit_id}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                        {log.changed_at}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-bold ${
                            log.operation_type === 'INSERT'
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                              : log.operation_type === 'UPDATE'
                              ? 'bg-[#18263d] text-[#dfbe85] border border-[#c9a96e]/30'
                              : 'bg-red-500/10 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {log.operation_type}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-white">
                        {log.table_name}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-300">#{log.record_id}</td>
                      <td className="px-5 py-4 text-xs font-mono text-slate-400">
                        {log.changed_by || 'root@localhost'}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono">
                        <div className="max-w-md overflow-x-auto space-y-1 bg-[#0a0f18] p-3 rounded-sm text-[11px] text-slate-300 border border-white/5">
                          {parsedOld && (
                            <div>
                              <span className="text-red-400 font-bold">PRE-MUTATION (OLD): </span>
                              <span className="text-slate-400">{JSON.stringify(parsedOld)}</span>
                            </div>
                          )}
                          {parsedNew && (
                            <div>
                              <span className="text-emerald-400 font-bold">POST-MUTATION (NEW): </span>
                              <span className="text-slate-200">{JSON.stringify(parsedNew)}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400 bg-[#0e1624]">
          <div>
            Page <span className="font-semibold text-white">{page}</span> of{' '}
            <span className="font-semibold text-white">{totalPages}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-sm border border-white/10 hover:border-[#c9a96e]/40 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-sm border border-white/10 hover:border-[#c9a96e]/40 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
