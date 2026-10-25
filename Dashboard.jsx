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
  FileText,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Gavel,
  History,
  Scale,
  Sparkles,
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

  // Midnight Navy & Cream High-Contrast Palette for Charts
  const CHART_COLORS = ['#f5f0e7', '#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f87171', '#cbd5e1'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <p className="text-xs font-mono tracking-widest text-[#f5f0e7]/70 uppercase">
          Synthesizing Chambers Telemetry...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#1c1510] border border-red-500/30 rounded-sm text-white shadow-xl">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h3 className="text-sm font-serif font-semibold">Database Connection Error</h3>
        </div>
        <p className="mt-2 text-xs text-[#f5f0e7]/70">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-3 px-3 py-1.5 bg-[#2e231b] hover:bg-[#3a2d24] border border-white/20 text-white rounded-sm text-xs font-mono uppercase tracking-wider transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const counts = data?.counts || {};
  const financials = data?.financials || {};
  const recentAudit = data?.recentAudit || [];

  return (
    <div className="space-y-6 pb-6">
      {/* Editorial Hero Banner - Compact & Clean */}
      <div className="relative rounded-sm overflow-hidden border border-white/10 shadow-xl bg-gradient-to-r from-[#1c1510] via-[#241b15] to-[#2e231b] p-5 sm:p-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-[#c8a27a]">
              <Scale className="w-3.5 h-3.5 text-white" />
              <span>Chambers Executive Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
              Practice Management & <span className="italic text-[#d9b98f]">Docket Control</span>
            </h1>
            <p className="text-xs text-[#f5f0e7]/75 font-sans max-w-xl">
              Live relational telemetry across matters, hearings, and forensic database logs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDashboard}
              className="px-3 py-2 bg-[#150f0b] hover:bg-[#2e231b] border border-white/15 text-white rounded-sm text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lab Assignment 10 / 11 shortcuts + statistics of all tables (11.E) */}
      <TableStatsPanel />

      {/* KPI Cards Grid - Compact & Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#1c1510] p-3.5 rounded-sm border border-white/10 shadow-md">
          <div className="flex items-center justify-between text-[#f5f0e7]/60">
            <span className="text-[10px] font-mono uppercase tracking-wider">Clients</span>
            <Users className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-2xl font-serif font-bold text-white mt-1.5">{counts.clients || 0}</div>
          <div className="text-[10px] font-mono text-[#f5f0e7]/50 mt-0.5">Enrolled</div>
        </div>

        <div className="bg-[#1c1510] p-3.5 rounded-sm border border-white/10 shadow-md">
          <div className="flex items-center justify-between text-[#f5f0e7]/60">
            <span className="text-[10px] font-mono uppercase tracking-wider">Active Cases</span>
            <Briefcase className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-2xl font-serif font-bold text-white mt-1.5">{counts.cases || 0}</div>
          <div className="text-[10px] font-mono text-emerald-400 mt-0.5">Active Dockets</div>
        </div>

        <div className="bg-[#1c1510] p-3.5 rounded-sm border border-white/10 shadow-md">
          <div className="flex items-center justify-between text-[#f5f0e7]/60">
            <span className="text-[10px] font-mono uppercase tracking-wider">Counsel</span>
            <UserCheck className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-2xl font-serif font-bold text-white mt-1.5">{counts.lawyers || 0}</div>
          <div className="text-[10px] font-mono text-[#f5f0e7]/50 mt-0.5">Bar Enrolled</div>
        </div>

        <div className="bg-[#1c1510] p-3.5 rounded-sm border border-white/10 shadow-md">
          <div className="flex items-center justify-between text-[#f5f0e7]/60">
            <span className="text-[10px] font-mono uppercase tracking-wider">Benches</span>
            <Building className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-2xl font-serif font-bold text-white mt-1.5">{counts.courts || 0}</div>
          <div className="text-[10px] font-mono text-[#f5f0e7]/50 mt-0.5">Jurisdictions</div>
        </div>

        <div className="bg-[#1c1510] p-3.5 rounded-sm border border-white/10 shadow-md">
          <div className="flex items-center justify-between text-[#f5f0e7]/60">
            <span className="text-[10px] font-mono uppercase tracking-wider">Hearings</span>
            <Calendar className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#f5f0e7] mt-1.5">{counts.hearings || 0}</div>
          <div className="text-[10px] font-mono text-[#f5f0e7]/50 mt-0.5">Cause Lists</div>
        </div>

        <div className="bg-[#1c1510] p-3.5 rounded-sm border border-white/10 shadow-md">
          <div className="flex items-center justify-between text-[#f5f0e7]/60">
            <span className="text-[10px] font-mono uppercase tracking-wider">Audit Logs</span>
            <History className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-400 mt-1.5">{recentAudit.length ? '10+' : 0}</div>
          <div className="text-[10px] font-mono text-emerald-400/80 mt-0.5">Trigger Audited</div>
        </div>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-sm bg-[#1c1510] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-[#f5f0e7]/60 tracking-wider">Total Matter Budgets</div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
            ₹ {Number(financials.total_case_budget || 0).toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-4 rounded-sm bg-[#1c1510] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-[#f5f0e7]/60 tracking-wider">Total Invoiced Fees</div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
            ₹ {Number(financials.total_invoiced || 0).toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-4 rounded-sm bg-[#1c1510] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-[#f5f0e7]/60 tracking-wider">Cleared Receipts</div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-400 mt-1">
            ₹ {Number(financials.total_payments_received || 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="bg-[#1c1510] p-4 sm:p-5 rounded-sm border border-white/10 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
            <h3 className="font-serif font-semibold text-white text-sm">
              Matter Docket Progression
            </h3>
            <span className="text-[10px] font-mono text-[#f5f0e7]/60">CASE_STATUS</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.statusDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="status_name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#150f0b', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '4px', fontSize: '11px' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Bar dataKey="count" fill="#f5f0e7" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Case Type Distribution */}
        <div className="bg-[#1c1510] p-4 sm:p-5 rounded-sm border border-white/10 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
            <h3 className="font-serif font-semibold text-white text-sm">
              Practice Area Allocation
            </h3>
            <span className="text-[10px] font-mono text-[#f5f0e7]/60">CASE_TYPE</span>
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
                  stroke="#1c1510"
                  strokeWidth={2}
                >
                  {(data?.typeDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#150f0b', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '4px', fontSize: '11px' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(value) => <span className="text-[#f5f0e7]/80">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cause Lists & Action Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Hearings */}
        <div className="bg-[#1c1510] p-4 sm:p-5 rounded-sm border border-white/10 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white" />
              <h3 className="font-serif font-semibold text-white text-sm">Upcoming Cause List</h3>
            </div>
            <span className="text-[10px] font-mono text-[#f5f0e7]/60">Next 14 Days</span>
          </div>

          <div className="space-y-2.5">
            {(!data?.upcomingHearings || data.upcomingHearings.length === 0) ? (
              <p className="text-xs font-serif text-[#f5f0e7]/60 text-center py-6">No scheduled court appearances on docket.</p>
            ) : (
              data.upcomingHearings.map((h) => (
                <div key={h.hearing_id} className="p-3 rounded-sm bg-[#150f0b] border border-white/5 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="font-serif font-semibold text-white text-xs">{h.case_title}</div>
                    <div className="text-[10px] font-mono text-[#f5f0e7]/60 mt-0.5">{h.case_number} • {h.court_name}</div>
                    <div className="text-[11px] text-[#f5f0e7]/75 font-serif mt-1">{h.purpose}</div>
                  </div>
                  <div className="text-right flex-shrink-0 font-mono text-[11px] text-white">
                    <div>{h.hearing_date}</div>
                    <div className="text-[10px] text-[#f5f0e7]/50">{h.start_time?.slice(0, 5)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Action Items */}
        <div className="bg-[#1c1510] p-4 sm:p-5 rounded-sm border border-white/10 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-white" />
              <h3 className="font-serif font-semibold text-white text-sm">Urgent Filing Deadlines</h3>
            </div>
            <span className="text-[10px] font-mono text-[#f5f0e7]/60">TASK Table</span>
          </div>

          <div className="space-y-2.5">
            {(!data?.pendingTasks || data.pendingTasks.length === 0) ? (
              <p className="text-xs font-serif text-[#f5f0e7]/60 text-center py-6">All action items resolved.</p>
            ) : (
              data.pendingTasks.map((t) => (
                <div key={t.task_id} className="p-3 rounded-sm bg-[#150f0b] border border-white/5 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="font-serif font-semibold text-white text-xs">{t.title}</div>
                    <div className="text-[10px] font-mono text-[#f5f0e7]/60 mt-0.5">{t.case_number}</div>
                  </div>
                  <div className="text-right flex-shrink-0 font-mono">
                    <span className={`px-2 py-0.5 rounded-sm text-[9px] ${
                      t.priority === 'High' ? 'bg-red-950/60 text-red-300 border border-red-500/30' : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                    }`}>
                      {t.priority}
                    </span>
                    <div className="text-[10px] text-[#f5f0e7]/60 mt-1">{t.due_date ? String(t.due_date).slice(0, 10) : '—'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
