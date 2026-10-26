import React, { useState, useEffect } from 'react';
import { auditService } from '../services/api';
import {
  History,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Code,
  AlertCircle,
  ShieldCheck,
  Clock,
  Scale
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
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2D32]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B8975A] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Forensic Database Auditing</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight mt-1 font-semibold">
            Compliance Trail & Forensic Trigger Logs
          </h2>
          <p className="text-xs text-[#B4B7BC] font-sans mt-0.5">
            Automated database trigger audit logs capturing JSON serialization state snapshots for every INSERT, UPDATE, and DELETE transaction.
          </p>
        </div>

        <button
          onClick={() => {
            fetchLogs();
            fetchStats();
          }}
          className="court-btn-outline px-4 py-2 rounded-[3px] text-xs font-mono uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#B8975A]" />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="court-card p-4">
            <div className="text-[10px] font-mono uppercase text-[#6B6F76] tracking-wider">Total Audit Events</div>
            <div className="text-2xl font-serif font-bold text-white mt-1">
              {stats.total_events || totalRecords}
            </div>
            <div className="text-[10px] font-mono text-[#B4B7BC] mt-0.5">Trigger Captured</div>
          </div>

          <div className="court-card p-4">
            <div className="text-[10px] font-mono uppercase text-[#6B6F76] tracking-wider">Insert Operations</div>
            <div className="text-2xl font-serif font-bold text-[#72C095] mt-1">
              {stats.insert_count || 0}
            </div>
            <div className="text-[10px] font-mono text-[#72C095]/80 mt-0.5">Records Enrolled</div>
          </div>

          <div className="court-card p-4">
            <div className="text-[10px] font-mono uppercase text-[#6B6F76] tracking-wider">Update Operations</div>
            <div className="text-2xl font-serif font-bold text-[#8EB7DF] mt-1">
              {stats.update_count || 0}
            </div>
            <div className="text-[10px] font-mono text-[#8EB7DF]/80 mt-0.5">State Modifications</div>
          </div>

          <div className="court-card p-4">
            <div className="text-[10px] font-mono uppercase text-[#6B6F76] tracking-wider">Delete Operations</div>
            <div className="text-2xl font-serif font-bold text-[#E67272] mt-1">
              {stats.delete_count || 0}
            </div>
            <div className="text-[10px] font-mono text-[#E67272]/80 mt-0.5">Expunged Records</div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="court-card p-3.5 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#6B6F76]" />
            <select
              value={filterTable}
              onChange={(e) => {
                setFilterTable(e.target.value);
                setPage(1);
              }}
              className="court-input px-3 py-1.5 text-xs text-white font-mono"
            >
              <option value="" className="bg-[#141416]">All Database Entities</option>
              <option value="CLIENT" className="bg-[#141416]">CLIENT</option>
              <option value="CASES" className="bg-[#141416]">CASES</option>
              <option value="LAWYER" className="bg-[#141416]">LAWYER</option>
              <option value="HEARING" className="bg-[#141416]">HEARING</option>
              <option value="INVOICE" className="bg-[#141416]">INVOICE</option>
              <option value="PAYMENT" className="bg-[#141416]">PAYMENT</option>
              <option value="TASK" className="bg-[#141416]">TASK</option>
              <option value="DOCUMENT" className="bg-[#141416]">DOCUMENT</option>
              <option value="USERS" className="bg-[#141416]">USERS</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterOp}
              onChange={(e) => {
                setFilterOp(e.target.value);
                setPage(1);
              }}
              className="court-input px-3 py-1.5 text-xs text-white font-mono"
            >
              <option value="" className="bg-[#141416]">All DML Operations</option>
              <option value="INSERT" className="bg-[#141416]">INSERT</option>
              <option value="UPDATE" className="bg-[#141416]">UPDATE</option>
              <option value="DELETE" className="bg-[#141416]">DELETE</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-[#6B6F76]">
          Showing {logs.length} of {totalRecords} logged mutations
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-[#9B2C2C]/20 border border-[#9B2C2C]/60 rounded-[3px] text-[#E67272] text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="court-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="court-table">
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Timestamp</th>
                <th>Target Entity</th>
                <th>Operation</th>
                <th>Record Key</th>
                <th>Actor Session</th>
                <th className="text-right">State Diff</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs font-mono text-[#B4B7BC]">
                    Querying forensic trigger logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs font-serif text-[#6B6F76]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <History className="w-8 h-8 text-[#B8975A]/40" />
                      <p>No mutation logs match current filter criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isInsert = log.operation_type === 'INSERT';
                  const isUpdate = log.operation_type === 'UPDATE';

                  return (
                    <tr key={log.audit_id}>
                      <td className="font-mono text-xs font-bold text-[#D4B97E]">
                        #{log.audit_id}
                      </td>

                      <td className="font-mono text-xs text-[#B4B7BC] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#6B6F76]" />
                          <span>{log.changed_at}</span>
                        </div>
                      </td>

                      <td className="font-mono text-xs font-semibold text-white">
                        <span className="px-2 py-0.5 rounded-[2px] bg-[#141416] border border-[#2B2D32]">
                          {log.table_name}
                        </span>
                      </td>

                      <td>
                        <span className={`px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase ${
                          isInsert ? 'badge-success' :
                          isUpdate ? 'badge-info' : 'badge-danger'
                        }`}>
                          {log.operation_type}
                        </span>
                      </td>

                      <td className="font-mono text-xs text-[#B4B7BC]">
                        {log.record_id ? `#${log.record_id}` : '—'}
                      </td>

                      <td className="font-mono text-xs text-[#6B6F76]">
                        {log.changed_by_name || log.changed_by || 'DB System'}
                      </td>

                      <td className="text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="court-btn-outline px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-[3px] transition-colors cursor-pointer"
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
          <div className="px-5 py-3 bg-[#141416] border-t border-[#2B2D32] flex items-center justify-between text-xs font-mono text-[#6B6F76]">
            <div>
              Page <span className="text-white font-medium">{page}</span> of <span className="text-white font-medium">{totalPages}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-[3px] border border-[#2B2D32] hover:border-[#B8975A]/40 text-[#B4B7BC] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-[3px] border border-[#2B2D32] hover:border-[#B8975A]/40 text-[#B4B7BC] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* JSON State Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="court-card-elevated max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-[#2B2D32] flex items-center justify-between bg-[#141416]">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#B8975A]" />
                <h3 className="font-serif font-semibold text-white text-sm">
                  Audit Snapshot #{selectedLog.audit_id} • {selectedLog.table_name} ({selectedLog.operation_type})
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-[#6B6F76] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs font-mono text-[#B4B7BC] pb-3 border-b border-[#2B2D32]">
                <div>Recorded: <span className="text-white">{selectedLog.changed_at}</span></div>
                <div>Record ID: <span className="text-[#D4B97E]">#{selectedLog.record_id}</span></div>
              </div>

              {selectedLog.old_data && (
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#E67272] mb-1">
                    Previous State (BEFORE Mutation):
                  </div>
                  <pre className="p-3 bg-[#0A0A0B] border border-[#9B2C2C]/30 rounded-[3px] text-xs font-mono text-[#E67272] overflow-x-auto">
                    {JSON.stringify(parseJsonSafe(selectedLog.old_data), null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_data && (
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#72C095] mb-1">
                    Committed State (AFTER Mutation):
                  </div>
                  <pre className="p-3 bg-[#0A0A0B] border border-[#3F7D5C]/30 rounded-[3px] text-xs font-mono text-[#72C095] overflow-x-auto">
                    {JSON.stringify(parseJsonSafe(selectedLog.new_data), null, 2)}
                  </pre>
                </div>
              )}

              <div className="pt-3 flex justify-end border-t border-[#2B2D32]">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="court-btn-brass px-4 py-1.5 rounded-[3px] text-xs font-mono uppercase tracking-wider font-semibold cursor-pointer"
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
