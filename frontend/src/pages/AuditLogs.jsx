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
  AlertCircle
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Lab Assignment 10 • Requirement 10.9
            </span>
            <span className="text-xs text-slate-500 font-mono">Table: application_audit_log (AFTER Triggers)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Audit Trail & Forensic Mutation Logs</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated database trigger logs capturing JSON snapshots for every INSERT, UPDATE, and DELETE event.
          </p>
        </div>

        <button
          onClick={() => {
            fetchLogs();
            fetchStats();
          }}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div>
            <select
              value={filterOp}
              onChange={(e) => {
                setFilterOp(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-medium"
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
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-medium"
            >
              <option value="">All Audited Tables</option>
              <option value="CLIENT">CLIENT Table</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Total Logged Transactions: <strong>{totalRecords}</strong>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Audit ID</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Operation</th>
                <th className="px-4 py-3">Target Table</th>
                <th className="px-4 py-3">Record ID</th>
                <th className="px-4 py-3">Changed By (Session Context)</th>
                <th className="px-4 py-3">State Diff / Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">Loading audit records...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    No audit records recorded yet. Perform an INSERT, UPDATE, or DELETE on Clients to trigger audit logging.
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
                    <tr key={log.audit_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-800">#{log.audit_id}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {log.changed_at}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            log.operation_type === 'INSERT'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : log.operation_type === 'UPDATE'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                        >
                          {log.operation_type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-800">
                        {log.table_name}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-700">#{log.record_id}</td>
                      <td className="px-4 py-3.5 text-xs font-mono text-slate-500">
                        {log.changed_by || 'root@localhost'}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono">
                        <div className="max-w-md overflow-x-auto space-y-1 bg-slate-950 p-2.5 rounded text-[11px] text-slate-300">
                          {parsedOld && (
                            <div>
                              <span className="text-red-400 font-bold">OLD: </span>
                              <span className="text-slate-400">{JSON.stringify(parsedOld)}</span>
                            </div>
                          )}
                          {parsedNew && (
                            <div>
                              <span className="text-emerald-400 font-bold">NEW: </span>
                              <span className="text-slate-300">{JSON.stringify(parsedNew)}</span>
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
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Page <span className="font-semibold text-slate-800">{page}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
