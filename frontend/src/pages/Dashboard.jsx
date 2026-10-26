import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import TableStatsPanel from '../components/TableStatsPanel';
import {
  Users,
  Briefcase,
  UserCheck,
  Calendar,
  Building,
  CheckSquare,
  RefreshCw,
  AlertCircle,
  Gavel,
  History,
  Scale,
  DollarSign,
  Receipt,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getSummary();
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Courtroom Brass, Silver & Charcoal Palette for Charts
  const CHART_COLORS = ['#B8975A', '#D4B97E', '#8C7040', '#B4B7BC', '#3F7D5C', '#4A6A8A', '#9B2C2C'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#B8975A]/20 border-t-[#B8975A] animate-spin" />
        <p className="text-xs font-mono tracking-widest text-[#B4B7BC] uppercase">
          Synthesizing Chambers Telemetry...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#141416] border border-[#9B2C2C]/50 rounded-[4px] text-white shadow-xl">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-[#E67272]" />
          <h3 className="text-sm font-serif font-semibold">Database Connection Error</h3>
        </div>
        <p className="mt-2 text-xs text-[#B4B7BC]">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-3 px-3 py-1.5 court-btn-brass rounded-[3px] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const counts = data?.counts || {};
  const financials = data?.financials || {};
  const recentAudit = data?.recentAudit || [];
  const upcomingHearings = data?.upcomingHearings || [];
  const pendingTasks = data?.pendingTasks || [];

  return (
    <div className="space-y-6 pb-6 animate-fadeIn">
      {/* Editorial Hero Banner - The Courtroom Tailored Aesthetic */}
      <div className="relative rounded-[4px] overflow-hidden border border-[#B8975A]/25 shadow-xl bg-gradient-to-r from-[#000000] via-[#141416] to-[#1E1F23] p-5 sm:p-6">
        <div className="absolute inset-0 pinstripe-dark opacity-40 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-[#D4B97E]">
              <Scale className="w-3.5 h-3.5 text-[#B8975A]" />
              <span>Chambers Executive Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight font-semibold">
              Practice Management & <span className="italic brass-text-gradient font-normal">Docket Control</span>
            </h1>
            <p className="text-xs text-[#B4B7BC] font-sans max-w-xl">
              Live relational telemetry across case matters, cause lists, financial retainers, and forensic database trigger audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDashboard}
              className="px-3 py-1.5 rounded-[3px] court-btn-outline text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#B8975A]" />
              <span>Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lab Assignment 10 / 11 shortcuts + statistics of all tables */}
      <TableStatsPanel />

      {/* KPI Stat Cards Grid - Active Cases, Hearings, Tasks, Invoices, Clients, Lawyers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Active Cases */}
        <div className="court-card p-3.5">
          <div className="flex items-center justify-between text-[#B4B7BC]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Active Cases</span>
            <Scale className="w-4 h-4 text-[#B8975A]" />
          </div>
          <div className="text-2xl font-serif font-bold text-white mt-1.5">{counts.cases || 0}</div>
          <div className="text-[10px] font-mono text-[#72C095] mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3F7D5C]" />
            <span>Active Dockets</span>
          </div>
        </div>

        {/* Upcoming Hearings */}
        <div className="court-card p-3.5">
          <div className="flex items-center justify-between text-[#B4B7BC]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Hearings</span>
            <Gavel className="w-4 h-4 text-[#B8975A]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#D4B97E] mt-1.5">{counts.hearings || 0}</div>
          <div className="text-[10px] font-mono text-[#B4B7BC] mt-0.5">Cause Lists</div>
        </div>

        {/* Pending Tasks */}
        <div className="court-card p-3.5">
          <div className="flex items-center justify-between text-[#B4B7BC]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Pending Tasks</span>
            <CheckSquare className="w-4 h-4 text-[#B8975A]" />
          </div>
          <div className="text-2xl font-serif font-bold text-white mt-1.5">{pendingTasks.length || counts.tasks || 0}</div>
          <div className="text-[10px] font-mono text-[#E2B056] mt-0.5">Action Items</div>
        </div>

        {/* Clients */}
        <div className="court-card p-3.5">
          <div className="flex items-center justify-between text-[#B4B7BC]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Clients</span>
            <Users className="w-4 h-4 text-[#B8975A]" />
          </div>
          <div className="text-2xl font-serif font-bold text-white mt-1.5">{counts.clients || 0}</div>
          <div className="text-[10px] font-mono text-[#B4B7BC] mt-0.5">Retained Clients</div>
        </div>

        {/* Lawyers / Counsel */}
        <div className="court-card p-3.5">
          <div className="flex items-center justify-between text-[#B4B7BC]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Counsel</span>
            <UserCheck className="w-4 h-4 text-[#B8975A]" />
          </div>
          <div className="text-2xl font-serif font-bold text-white mt-1.5">{counts.lawyers || 0}</div>
          <div className="text-[10px] font-mono text-[#B4B7BC] mt-0.5">Bar Enrolled</div>
        </div>

        {/* Forensic Audit Trigger Logs */}
        <div className="court-card p-3.5">
          <div className="flex items-center justify-between text-[#B4B7BC]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Audit Triggers</span>
            <History className="w-4 h-4 text-[#B8975A]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#72C095] mt-1.5">{recentAudit.length ? `${recentAudit.length}+` : 0}</div>
          <div className="text-[10px] font-mono text-[#72C095]/80 mt-0.5">Forensic Logs</div>
        </div>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-[4px] court-card">
          <div className="text-[10px] font-mono uppercase text-[#6B6F76] tracking-wider flex items-center justify-between">
            <span>Total Matter Budgets</span>
            <Briefcase className="w-3.5 h-3.5 text-[#B8975A]" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-white mt-1.5">
            ₹ {Number(financials.total_case_budget || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-4 rounded-[4px] court-card">
          <div className="text-[10px] font-mono uppercase text-[#6B6F76] tracking-wider flex items-center justify-between">
            <span>Total Invoiced Fees</span>
            <Receipt className="w-3.5 h-3.5 text-[#B8975A]" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-[#D4B97E] mt-1.5">
            ₹ {Number(financials.total_invoiced || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-4 rounded-[4px] court-card">
          <div className="text-[10px] font-mono uppercase text-[#6B6F76] tracking-wider flex items-center justify-between">
            <span>Cleared Receipts</span>
            <DollarSign className="w-3.5 h-3.5 text-[#3F7D5C]" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-[#72C095] mt-1.5">
            ₹ {Number(financials.total_payments_received || 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="court-card p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#2B2D32] mb-3">
            <h3 className="font-serif font-semibold text-white text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#B8975A]" /> Matter Docket Progression
            </h3>
            <span className="text-[10px] font-mono text-[#6B6F76]">CASE_STATUS</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.statusDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="status_name" stroke="#B4B7BC" fontSize={11} tickLine={false} />
                <YAxis stroke="#B4B7BC" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141416', borderColor: 'rgba(184, 151, 90, 0.3)', borderRadius: '4px', fontSize: '11px', color: '#FFFFFF' }}
                  itemStyle={{ color: '#D4B97E' }}
                />
                <Bar dataKey="count" fill="#B8975A" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Case Type Distribution */}
        <div className="court-card p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#2B2D32] mb-3">
            <h3 className="font-serif font-semibold text-white text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-[#B8975A]" /> Practice Area Allocation
            </h3>
            <span className="text-[10px] font-mono text-[#6B6F76]">CASE_TYPE</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.typeDistribution || []}
                  dataKey="count"
                  nameKey="type_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {(data?.typeDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="#0A0A0B" strokeWidth={1.5} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#141416', borderColor: 'rgba(184, 151, 90, 0.3)', borderRadius: '4px', fontSize: '11px', color: '#FFFFFF' }}
                  itemStyle={{ color: '#D4B97E' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'Inter' }}
                  formatter={(value) => <span style={{ color: '#B4B7BC' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Upcoming Hearings Cause List Timeline & Urgent Filing Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Hearings Cause List Timeline */}
        <div className="court-card p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#2B2D32] mb-3">
            <div className="flex items-center gap-2">
              <Gavel className="w-4 h-4 text-[#B8975A]" />
              <h3 className="font-serif font-semibold text-white text-sm">Upcoming Hearings Timeline</h3>
            </div>
            <span className="text-[10px] font-mono text-[#6B6F76]">CAUSE LIST</span>
          </div>

          <div className="space-y-3">
            {(!upcomingHearings || upcomingHearings.length === 0) ? (
              <p className="text-xs font-serif text-[#6B6F76] text-center py-6">No hearings scheduled on the cause list.</p>
            ) : (
              upcomingHearings.map((h, idx) => (
                <div key={h.hearing_id || idx} className="p-3 rounded-[3px] bg-[#141416] border border-[#2B2D32] hover:border-[#B8975A]/40 transition-all flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-serif font-semibold text-white text-xs">{h.purpose || 'Bench Hearing'}</div>
                    <div className="text-[10px] text-[#B4B7BC]">{h.court_name} • {h.city || 'Courtroom'}</div>
                    <div className="text-[10px] font-mono text-[#D4B97E]">{h.case_number}</div>
                  </div>
                  <div className="text-right flex-shrink-0 font-mono">
                    <div className="text-xs text-white font-medium flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-[#B8975A]" />
                      <span>{h.start_time || '10:30 AM'}</span>
                    </div>
                    <div className="text-[10px] text-[#6B6F76] mt-0.5">{h.hearing_date ? String(h.hearing_date).slice(0, 10) : '—'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Action Items / Deadlines */}
        <div className="court-card p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#2B2D32] mb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#B8975A]" />
              <h3 className="font-serif font-semibold text-white text-sm">Urgent Filing Deadlines</h3>
            </div>
            <span className="text-[10px] font-mono text-[#6B6F76]">TASK Table</span>
          </div>

          <div className="space-y-2.5">
            {(!pendingTasks || pendingTasks.length === 0) ? (
              <p className="text-xs font-serif text-[#6B6F76] text-center py-6">All action items resolved.</p>
            ) : (
              pendingTasks.map((t) => (
                <div key={t.task_id} className="p-3 rounded-[3px] bg-[#141416] border border-[#2B2D32] hover:border-[#B8975A]/40 transition-all flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="font-serif font-semibold text-white text-xs">{t.title}</div>
                    <div className="text-[10px] font-mono text-[#B4B7BC] mt-0.5">{t.case_number}</div>
                  </div>
                  <div className="text-right flex-shrink-0 font-mono">
                    <span className={`px-2 py-0.5 rounded-[2px] text-[9px] uppercase font-mono ${
                      t.priority === 'High' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {t.priority}
                    </span>
                    <div className="text-[10px] text-[#6B6F76] mt-1">{t.due_date ? String(t.due_date).slice(0, 10) : '—'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Forensic Trigger Activity Log */}
      {recentAudit && recentAudit.length > 0 && (
        <div className="court-card p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#2B2D32] mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#B8975A]" />
              <h3 className="font-serif font-semibold text-white text-sm">Recent Forensic Case Activity (Trigger Logs)</h3>
            </div>
            <span className="text-[10px] font-mono text-[#72C095]">AUDIT_LOG Trigger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="court-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Entity / Table</th>
                  <th>Action</th>
                  <th>Record Key</th>
                  <th>Audited By</th>
                </tr>
              </thead>
              <tbody>
                {recentAudit.slice(0, 5).map((log, i) => (
                  <tr key={log.log_id || i}>
                    <td className="font-mono text-[11px] text-[#B4B7BC]">
                      {log.action_time ? String(log.action_time).replace('T', ' ').slice(0, 19) : '—'}
                    </td>
                    <td className="font-mono text-white text-xs font-semibold">{log.table_name}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase ${
                        log.action_type === 'INSERT' ? 'badge-success' :
                        log.action_type === 'UPDATE' ? 'badge-info' : 'badge-danger'
                      }`}>
                        {log.action_type}
                      </span>
                    </td>
                    <td className="font-mono text-[#D4B97E] text-xs">#{log.record_id}</td>
                    <td className="text-xs text-[#B4B7BC] font-mono">{log.changed_by || 'system'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
