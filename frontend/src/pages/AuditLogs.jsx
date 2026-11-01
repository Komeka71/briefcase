import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auditService } from '../services/api';
import {
  History,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Code,
  AlertCircle,
  Clock,
  Database,
  Copy,
  Check,
  X,
  FileSpreadsheet,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PageHeader, GlassCard, StatusPill, Skeleton, EmptyState, CountUp } from '../components/ui';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [filterTable, setFilterTable] = useState('');
  const [filterOp, setFilterOp] = useState('');
  const [stats, setStats] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filterTable, filterOp]);

  const parseJsonSafe = (str) => {
    if (!str) return null;
    try {
      return typeof str === 'object' ? str : JSON.parse(str);
    } catch {
      return str;
    }
  };

  const copyToClipboard = (content, section) => {
    navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getOperationVariant = (op) => {
    switch (op) {
      case 'INSERT':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Activity Trail • Audit Logging"
        title="Activity History & Audit Trail"
        subtitle="Comprehensive audit trail capturing mutation snapshots for every created, updated, and removed record across Chambers entities."
        actions={
          <button
            onClick={() => {
              fetchLogs();
              fetchStats();
            }}
            className="court-btn-outline px-4 py-2 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-2 hover:border-brass-500/60 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brass-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Trail</span>
          </button>
        }
      />

      {/* KPI Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <GlassCard className="p-4 space-y-1">
            <div className="text-[10px] font-mono uppercase text-graphite-400 tracking-wider">
              Total Audit Events
            </div>
            <div className="text-2xl font-serif font-bold text-ivory-100">
              <CountUp value={stats.total_events || totalRecords} />
            </div>
            <div className="text-[10px] font-mono text-brass-400/80 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>Audited Events</span>
            </div>
          </GlassCard>

          <GlassCard className="p-4 space-y-1">
            <div className="text-[10px] font-mono uppercase text-graphite-400 tracking-wider">
              Insert Operations
            </div>
            <div className="text-2xl font-serif font-bold text-emerald-400">
              <CountUp value={stats.insert_count || 0} />
            </div>
            <div className="text-[10px] font-mono text-emerald-400/80">Records Enrolled</div>
          </GlassCard>

          <GlassCard className="p-4 space-y-1">
            <div className="text-[10px] font-mono uppercase text-graphite-400 tracking-wider">
              Update Operations
            </div>
            <div className="text-2xl font-serif font-bold text-sky-400">
              <CountUp value={stats.update_count || 0} />
            </div>
            <div className="text-[10px] font-mono text-sky-400/80">State Modifications</div>
          </GlassCard>

          <GlassCard className="p-4 space-y-1">
            <div className="text-[10px] font-mono uppercase text-graphite-400 tracking-wider">
              Delete Operations
            </div>
            <div className="text-2xl font-serif font-bold text-red-400">
              <CountUp value={stats.delete_count || 0} />
            </div>
            <div className="text-[10px] font-mono text-red-400/80">Expunged Records</div>
          </GlassCard>
        </div>
      )}

      {/* Filter and Control Bar */}
      <GlassCard className="p-3.5 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-brass-400" />
            <select
              value={filterTable}
              onChange={(e) => {
                setFilterTable(e.target.value);
                setPage(1);
              }}
              className="court-input px-3 py-1.5 text-xs text-ivory-100 font-mono bg-charcoal-900 border border-brass-500/20 rounded cursor-pointer"
            >
              <option value="" className="bg-charcoal-900">All Database Entities</option>
              <option value="CLIENT" className="bg-charcoal-900">CLIENT</option>
              <option value="CASES" className="bg-charcoal-900">CASES</option>
              <option value="LAWYER" className="bg-charcoal-900">LAWYER</option>
              <option value="HEARING" className="bg-charcoal-900">HEARING</option>
              <option value="INVOICE" className="bg-charcoal-900">INVOICE</option>
              <option value="PAYMENT" className="bg-charcoal-900">PAYMENT</option>
              <option value="TASK" className="bg-charcoal-900">TASK</option>
              <option value="DOCUMENT" className="bg-charcoal-900">DOCUMENT</option>
              <option value="USERS" className="bg-charcoal-900">USERS</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterOp}
              onChange={(e) => {
                setFilterOp(e.target.value);
                setPage(1);
              }}
              className="court-input px-3 py-1.5 text-xs text-ivory-100 font-mono bg-charcoal-900 border border-brass-500/20 rounded cursor-pointer"
            >
              <option value="" className="bg-charcoal-900">All DML Operations</option>
              <option value="INSERT" className="bg-charcoal-900">INSERT</option>
              <option value="UPDATE" className="bg-charcoal-900">UPDATE</option>
              <option value="DELETE" className="bg-charcoal-900">DELETE</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-graphite-400 flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-brass-400/60" />
          <span>
            Displaying <strong className="text-ivory-100">{logs.length}</strong> of{' '}
            <strong className="text-ivory-100">{totalRecords}</strong> audited mutations
          </span>
        </div>
      </GlassCard>

      {error && (
        <div className="p-3.5 bg-red-950/30 border border-red-500/40 rounded text-red-300 text-xs flex items-start gap-2.5 font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="court-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="court-table w-full">
            <thead>
              <tr>
                <th className="w-20">Audit ID</th>
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
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-3 px-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <EmptyState
                      icon={History}
                      title="No Audit Records Found"
                      description="No mutation entries match your selected table and DML operation filters."
                      actionLabel="Clear Filters"
                      onAction={() => {
                        setFilterTable('');
                        setFilterOp('');
                        setPage(1);
                      }}
                    />
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  return (
                    <tr key={log.audit_id} className="hover:bg-charcoal-850/60 transition-colors">
                      <td className="font-mono text-xs font-bold text-brass-300">
                        #{log.audit_id}
                      </td>

                      <td className="font-mono text-xs text-graphite-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-graphite-500" />
                          <span>{log.changed_at}</span>
                        </div>
                      </td>

                      <td className="font-mono text-xs font-semibold text-ivory-100">
                        <span className="px-2 py-0.5 rounded bg-charcoal-900 border border-brass-500/20 text-ivory-200">
                          {log.table_name}
                        </span>
                      </td>

                      <td>
                        <StatusPill
                          status={log.operation_type}
                          variant={getOperationVariant(log.operation_type)}
                          size="sm"
                        />
                      </td>

                      <td className="font-mono text-xs text-brass-400">
                        {log.record_id ? `#${log.record_id}` : '—'}
                      </td>

                      <td className="font-mono text-xs text-graphite-300">
                        {log.changed_by_name || log.changed_by || 'System Agent'}
                      </td>

                      <td className="text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="court-btn-outline px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded transition-colors text-brass-300 hover:text-brass-200 cursor-pointer"
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
          <div className="px-5 py-3.5 bg-charcoal-900 border-t border-brass-500/15 flex items-center justify-between text-xs font-mono text-graphite-400">
            <div>
              Page <span className="text-ivory-100 font-semibold">{page}</span> of{' '}
              <span className="text-ivory-100 font-semibold">{totalPages}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded border border-brass-500/20 hover:border-brass-500 text-ivory-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded border border-brass-500/20 hover:border-brass-500 text-ivory-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Forensic JSON State Diff Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 bg-ink-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="court-card max-w-3xl w-full overflow-hidden max-h-[90vh] flex flex-col shadow-2xl border border-brass-500/30"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-brass-500/20 flex items-center justify-between bg-charcoal-900">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-brass-500/15 border border-brass-500/30 flex items-center justify-center text-brass-400">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-ivory-100 text-sm flex items-center gap-2">
                      <span>Audit Snapshot #{selectedLog.audit_id}</span>
                      <StatusPill
                        status={selectedLog.operation_type}
                        variant={getOperationVariant(selectedLog.operation_type)}
                        size="sm"
                      />
                    </h3>
                    <div className="text-[10px] font-mono text-graphite-400 mt-0.5">
                      Target: {selectedLog.table_name} • Key: #{selectedLog.record_id || 'N/A'} • {selectedLog.changed_at}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1 rounded text-graphite-400 hover:text-ivory-100 hover:bg-charcoal-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 overflow-y-auto scrollbar-thin">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-ink-950/60 border border-brass-500/15 rounded text-xs font-mono">
                  <div>
                    <span className="text-graphite-400 block text-[10px] uppercase">Changed At</span>
                    <span className="text-ivory-100">{selectedLog.changed_at}</span>
                  </div>
                  <div>
                    <span className="text-graphite-400 block text-[10px] uppercase">Entity</span>
                    <span className="text-brass-300 font-semibold">{selectedLog.table_name}</span>
                  </div>
                  <div>
                    <span className="text-graphite-400 block text-[10px] uppercase">Actor</span>
                    <span className="text-ivory-200">{selectedLog.changed_by_name || selectedLog.changed_by || 'System'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* BEFORE Mutation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-mono uppercase tracking-wider text-red-300 flex items-center gap-1.5 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span>Pre-Mutation (BEFORE)</span>
                      </div>
                      {selectedLog.old_data && (
                        <button
                          onClick={() => copyToClipboard(parseJsonSafe(selectedLog.old_data), 'old')}
                          className="text-[10px] font-mono text-graphite-400 hover:text-brass-300 flex items-center gap-1"
                        >
                          {copiedSection === 'old' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy JSON</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {selectedLog.old_data ? (
                      <pre className="p-3 bg-ink-950 border border-red-500/30 rounded text-[11px] font-mono text-red-300/90 overflow-x-auto max-h-72 scrollbar-thin leading-relaxed">
                        {JSON.stringify(parseJsonSafe(selectedLog.old_data), null, 2)}
                      </pre>
                    ) : (
                      <div className="p-6 bg-ink-950/40 border border-brass-500/10 rounded text-center text-xs font-mono text-graphite-500 italic">
                        No previous state record (INSERT event)
                      </div>
                    )}
                  </div>

                  {/* AFTER Mutation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-mono uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Post-Mutation (AFTER)</span>
                      </div>
                      {selectedLog.new_data && (
                        <button
                          onClick={() => copyToClipboard(parseJsonSafe(selectedLog.new_data), 'new')}
                          className="text-[10px] font-mono text-graphite-400 hover:text-brass-300 flex items-center gap-1"
                        >
                          {copiedSection === 'new' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy JSON</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {selectedLog.new_data ? (
                      <pre className="p-3 bg-ink-950 border border-emerald-500/30 rounded text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-72 scrollbar-thin leading-relaxed">
                        {JSON.stringify(parseJsonSafe(selectedLog.new_data), null, 2)}
                      </pre>
                    ) : (
                      <div className="p-6 bg-ink-950/40 border border-brass-500/10 rounded text-center text-xs font-mono text-graphite-500 italic">
                        No committed state record (DELETE event)
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 flex justify-between items-center border-t border-brass-500/15">
                  <div className="text-[11px] font-mono text-graphite-400 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-brass-400" />
                    <span>Table: <span className="text-ivory-100">{selectedLog.table_name}</span></span>
                    <ArrowRight className="w-3 h-3 text-graphite-600" />
                    <span>Schema: <span className="text-ivory-100">briefcase</span></span>
                  </div>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="court-btn-brass px-4 py-1.5 rounded text-xs font-mono uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    Close Inspection
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
