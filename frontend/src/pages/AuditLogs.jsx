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
  Activity,
  FileText,
  Clock,
  Layers
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
  const [selectedLog, setSelectedLog] = useState(null);

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
      setError(err.response?.data?.message || 'Failed to retrieve audit trail history.');
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

  const parseJsonSafe = (str) => {
    if (!str) return null;
    try {
      return typeof str === 'object' ? str : JSON.parse(str);
    } catch {
      return str;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Editorial Header */}
      <div className="relative overflow-hidden rounded-sm bg-gradient-to-r from-[#0a1020] via-[#0d1527] to-[#121c33] border border-white/10 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase font-semibold bg-[#060a12] text-[#f5f0e7] border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>Chambers Compliance & Immutable Logging</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-normal text-white tracking-tight">
              Compliance Trail & <span className="italic text-[#f5f0e7]">Activity History</span>
            </h1>

            <p className="text-xs md:text-sm text-[#f5f0e7]/75 font-serif leading-relaxed">
              Automated trigger audit logs capturing JSON serialization state snapshots for every INSERT, UPDATE, and DELETE transaction with caller session context.
            </p>
          </div>

          <button
            onClick={() => {
              fetchLogs();
              fetchStats();
            }}
            className="self-start md:self-auto inline-flex items-center space-x-2 px-4 py-2.5 bg-[#060a12] hover:bg-[#121c33] border border-white/15 hover:border-white/30 text-white rounded-sm text-xs font-mono uppercase tracking-wider transition-all duration-200 shadow-xl group cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-180 text-white" />
            <span>Refresh Audit Trail</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-[#0a1020] p-4 rounded-sm border border-white/10 shadow-lg">
            <div className="text-[10px] font-mono uppercase text-[#f5f0e7]/60 tracking-wider">Total Audit Events</div>
            <div className="text-2xl font-serif font-bold text-white mt-1">
              {stats.total_events || totalRecords}
            </div>
          </div>
          <div className="bg-[#0a1020] p-4 rounded-sm border border-white/10 shadow-lg">
            <div className="text-[10px] font-mono uppercase text-[#f5f0e7]/60 tracking-wider">Insert Operations</div>
            <div className="text-2xl font-serif font-bold text-emerald-400 mt-1">
              {stats.insert_count || 0}
            </div>
          </div>
          <div className="bg-[#0a1020] p-4 rounded-sm border border-white/10 shadow-lg">
            <div className="text-[10px] font-mono uppercase text-[#f5f0e7]/60 tracking-wider">Update Operations</div>
            <div className="text-2xl font-serif font-bold text-sky-400 mt-1">
              {stats.update_count || 0}
            </div>
          </div>
          <div className="bg-[#0a1020] p-4 rounded-sm border border-white/10 shadow-lg">
            <div className="text-[10px] font-mono uppercase text-[#f5f0e7]/60 tracking-wider">Delete Operations</div>
            <div className="text-2xl font-serif font-bold text-red-400 mt-1">
              {stats.delete_count || 0}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-[#0a1020] p-3.5 rounded-sm border border-white/10 shadow-md flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-white" />
            <select
              value={filterTable}
              onChange={(e) => {
                setFilterTable(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-[#060a12] border border-white/15 rounded-sm text-xs text-white font-mono focus:border-white focus:outline-none"
            >
              <option value="">All Database Entities</option>
              <option value="CLIENT">CLIENT</option>
              <option value="CASES">CASES</option>
              <option value="LAWYER">LAWYER</option>
              <option value="HEARING">HEARING</option>
              <option value="INVOICE">INVOICE</option>
              <option value="PAYMENT">PAYMENT</option>
              <option value="TASK">TASK</option>
              <option value="DOCUMENT">DOCUMENT</option>
              <option value="USERS">USERS</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterOp}
              onChange={(e) => {
                setFilterOp(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-[#060a12] border border-white/15 rounded-sm text-xs text-white font-mono focus:border-white focus:outline-none"
            >
              <option value="">All DML Operations</option>
              <option value="INSERT">INSERT</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-[#f5f0e7]/60">
          Showing {logs.length} of {totalRecords} logged mutations
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border-l-4 border-red-500 rounded-sm text-[#f5f0e7] flex items-start space-x-3 shadow-lg border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs font-serif leading-relaxed">{error}</div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-[#0a1020] rounded-sm border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#f5f0e7]/75">
            <thead className="bg-[#060a12] text-white/70 text-[11px] uppercase tracking-wider font-mono border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Audit ID</th>
                <th className="px-5 py-3.5 font-semibold">Timestamp</th>
                <th className="px-5 py-3.5 font-semibold">Target Table</th>
                <th className="px-5 py-3.5 font-semibold">Operation</th>
                <th className="px-5 py-3.5 font-semibold">Record ID</th>
                <th className="px-5 py-3.5 font-semibold">Actor / User</th>
                <th className="px-5 py-3.5 font-semibold text-right">State Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-[#f5f0e7]/60 font-serif">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Querying audit trail transactions...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-[#f5f0e7]/60 font-serif">
                    <History className="w-10 h-10 text-white/30 mx-auto mb-3" />
                    <p className="text-sm text-white">No mutation logs match current filter criteria.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isInsert = log.operation_type === 'INSERT';
                  const isUpdate = log.operation_type === 'UPDATE';
                  const isDelete = log.operation_type === 'DELETE';

                  return (
                    <tr key={log.audit_id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5 text-white font-bold font-mono">
                        #{log.audit_id}
                      </td>

                      <td className="px-5 py-3.5 text-white/80 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-white/60" />
                          <span>{log.changed_at}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-sm bg-[#060a12] border border-white/10 text-white font-semibold">
                          {log.table_name}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold ${
                          isInsert ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' :
                          isUpdate ? 'bg-sky-950/60 text-sky-300 border border-sky-500/30' :
                          'bg-red-950/60 text-red-300 border border-red-500/30'
                        }`}>
                          {log.operation_type}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-white/80">
                        {log.record_id ? `ID #${log.record_id}` : '—'}
                      </td>

                      <td className="px-5 py-3.5 text-white/60">
                        {log.changed_by_name || log.changed_by || 'DB System'}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 text-[11px] font-mono text-white hover:text-white bg-[#121c33] hover:bg-[#1a294b] border border-white/20 rounded-sm transition-colors cursor-pointer"
                        >
                          View Diff
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-5 py-3 bg-[#060a12] border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#f5f0e7]/70">
            <div>
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-sm border border-white/10 hover:border-white/30 disabled:opacity-30 disabled:pointer-events-none text-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-sm border border-white/10 hover:border-white/30 disabled:opacity-30 disabled:pointer-events-none text-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* JSON State Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#0a1020] rounded-sm shadow-2xl border border-white/20 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#060a12]">
              <div className="flex items-center gap-2.5">
                <Code className="w-4 h-4 text-white" />
                <h3 className="font-serif font-semibold text-white text-base">
                  Audit Snapshot #{selectedLog.audit_id} • {selectedLog.table_name} ({selectedLog.operation_type})
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-white/60 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs font-mono text-[#f5f0e7]/70 pb-3 border-b border-white/10">
                <div>Recorded: <span className="text-white">{selectedLog.changed_at}</span></div>
                <div>Record ID: <span className="text-white">#{selectedLog.record_id}</span></div>
              </div>

              {selectedLog.old_data && (
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-red-400 mb-1">
                    Previous State (BEFORE Mutation):
                  </div>
                  <pre className="p-3 bg-[#060a12] border border-red-500/20 rounded-sm text-xs font-mono text-red-300 overflow-x-auto">
                    {JSON.stringify(parseJsonSafe(selectedLog.old_data), null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_data && (
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
                    Committed State (AFTER Mutation):
                  </div>
                  <pre className="p-3 bg-[#060a12] border border-emerald-500/20 rounded-sm text-xs font-mono text-emerald-300 overflow-x-auto">
                    {JSON.stringify(parseJsonSafe(selectedLog.new_data), null, 2)}
                  </pre>
                </div>
              )}

              <div className="pt-3 flex justify-end border-t border-white/10">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 bg-[#f5f0e7] hover:bg-white text-[#060a12] rounded-sm text-xs font-mono uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
