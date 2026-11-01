import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import TableStatsPanel from '../components/TableStatsPanel';
import {
  CountUp,
  GlassCard,
  Skeleton,
  StatusPill,
  PageHeader,
  MagneticButton
} from '../components/ui';
import {
  Users,
  Briefcase,
  UserCheck,
  Building2,
  CheckSquare,
  RefreshCw,
  AlertCircle,
  Gavel,
  History,
  Scale,
  DollarSign,
  Receipt,
  Clock
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

// Custom Recharts Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xs bg-charcoal/95 border border-brass/30 backdrop-blur-md shadow-2xl text-xs font-mono">
        <div className="text-silver/70 uppercase text-[10px] mb-1">{label || payload[0].name}</div>
        <div className="text-brass font-bold text-sm">
          {payload[0].value.toLocaleString()} {payload[0].unit || 'records'}
        </div>
      </div>
    );
  }
  return null;
};

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

  const CHART_COLORS = ['#B8975A', '#D4B97E', '#8C7040', '#9EC7F2', '#7FE0A8', '#6B6F76', '#F88585'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-8 rounded-md bg-charcoal/60 border border-brass/15">
          <Skeleton height="h-8" className="w-1/3 mb-4" />
          <Skeleton height="h-4" className="w-2/3" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-5 rounded-md bg-charcoal/50 border border-brass/15">
              <Skeleton height="h-4" className="w-1/2 mb-3" />
              <Skeleton height="h-8" className="w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-charcoal border border-court-danger/40 rounded-md text-ivory shadow-2xl">
        <div className="flex items-center space-x-3 text-red-400">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <h3 className="font-serif text-lg font-semibold">Chambers Telemetry Offline</h3>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-silver/80 font-mono">{error}</p>
        <div className="mt-4">
          <MagneticButton variant="brass" size="sm" onClick={fetchDashboard}>
            Retry Synchronization
          </MagneticButton>
        </div>
      </div>
    );
  }

  const counts = data?.counts || {};
  const financials = data?.financials || {};
  const recentAudit = data?.recentAudit || [];
  const upcomingHearings = data?.upcomingHearings || [];
  const pendingTasks = data?.pendingTasks || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header with Real-time Sync Action */}
      <PageHeader
        title="Practice Intelligence & Docket Telemetry"
        subtitle="Real-time operational overview across active judicial matters, cause lists, financial retainers, and forensic database logs."
        category="Practice Intelligence"
        badge="Live Telemetry"
        actions={
          <MagneticButton
            variant="outline"
            size="sm"
            onClick={fetchDashboard}
            icon={RefreshCw}
            iconPosition="left"
            className="text-xs font-mono uppercase tracking-wider"
          >
            Sync Telemetry
          </MagneticButton>
        }
      />

      {/* Lab Assignment 10 & 11 Shortcuts Panel */}
      <TableStatsPanel />

      {/* KPI Stats Cards - 6 Core Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Active Cases */}
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-silver/70 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Active Cases</span>
            <Scale className="w-4 h-4 text-brass" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-ivory">
            <CountUp value={counts.cases || 0} />
          </div>
          <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Dockets</span>
          </div>
        </GlassCard>

        {/* Hearings */}
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-silver/70 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Hearings</span>
            <Gavel className="w-4 h-4 text-brass" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-brass">
            <CountUp value={counts.hearings || 0} />
          </div>
          <div className="text-[10px] font-mono text-silver/70 mt-1">
            Cause Lists
          </div>
        </GlassCard>

        {/* Pending Tasks */}
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-silver/70 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Tasks</span>
            <CheckSquare className="w-4 h-4 text-brass" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-ivory">
            <CountUp value={pendingTasks.length || counts.tasks || 0} />
          </div>
          <div className="text-[10px] font-mono text-amber-400 mt-1">
            Action Items
          </div>
        </GlassCard>

        {/* Retained Clients */}
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-silver/70 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Clients</span>
            <Users className="w-4 h-4 text-brass" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-ivory">
            <CountUp value={counts.clients || 0} />
          </div>
          <div className="text-[10px] font-mono text-silver/70 mt-1">
            Retained Clients
          </div>
        </GlassCard>

        {/* Counsel */}
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-silver/70 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Counsel</span>
            <UserCheck className="w-4 h-4 text-brass" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-ivory">
            <CountUp value={counts.lawyers || 0} />
          </div>
          <div className="text-[10px] font-mono text-silver/70 mt-1">
            Bar Enrolled
          </div>
        </GlassCard>

        {/* Forensic Audit Logs */}
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-silver/70 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Audit Triggers</span>
            <History className="w-4 h-4 text-brass" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400">
            <CountUp value={recentAudit.length || 0} suffix="+" />
          </div>
          <div className="text-[10px] font-mono text-emerald-400/80 mt-1">
            Forensic Events
          </div>
        </GlassCard>
      </div>

      {/* Financial Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <div className="text-[10px] font-mono uppercase text-silver/60 tracking-wider flex items-center justify-between">
            <span>Total Matter Budgets</span>
            <Briefcase className="w-4 h-4 text-brass" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-ivory mt-2">
            ₹ <CountUp value={Number(financials.total_case_budget || 0)} />
          </div>
          <div className="text-[10px] font-mono text-silver/50 mt-1">
            Cumulative docket appropriations
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="text-[10px] font-mono uppercase text-silver/60 tracking-wider flex items-center justify-between">
            <span>Invoiced Retainers</span>
            <Receipt className="w-4 h-4 text-brass" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-brass mt-2">
            ₹ <CountUp value={Number(financials.total_invoiced || 0)} />
          </div>
          <div className="text-[10px] font-mono text-silver/50 mt-1">
            Official chambers fee billings
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="text-[10px] font-mono uppercase text-silver/60 tracking-wider flex items-center justify-between">
            <span>Cleared Receipts</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400 mt-2">
            ₹ <CountUp value={Number(financials.total_payments_received || 0)} />
          </div>
          <div className="text-[10px] font-mono text-emerald-400/70 mt-1">
            Verified client ledger credits
          </div>
        </GlassCard>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="court-card p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-brass/15 mb-4">
            <h3 className="font-serif font-medium text-ivory text-base flex items-center gap-2">
              <Scale className="w-4 h-4 text-brass" /> Matter Docket Progression
            </h3>
            <span className="text-[10px] font-mono text-silver/50">CASE_STATUS</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.statusDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="status_name" stroke="#B4B7BC" fontSize={11} tickLine={false} />
                <YAxis stroke="#B4B7BC" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#B8975A" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Practice Area Allocation */}
        <div className="court-card p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-brass/15 mb-4">
            <h3 className="font-serif font-medium text-ivory text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brass" /> Practice Area Allocation
            </h3>
            <span className="text-[10px] font-mono text-silver/50">CASE_TYPE</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.typeDistribution || []}
                  dataKey="count"
                  nameKey="type_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={3}
                >
                  {(data?.typeDistribution || []).map((entry, index) => (
                    <Cell
                      key={`cell-${entry.type_name || index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      stroke="#0A0A0B"
                      strokeWidth={1.5}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'Inter' }}
                  formatter={(value) => <span className="text-silver/80">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Upcoming Hearings & Urgent Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Hearings Cause List */}
        <div className="court-card p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-brass/15 mb-4">
            <div className="flex items-center gap-2">
              <Gavel className="w-4 h-4 text-brass" />
              <h3 className="font-serif font-medium text-ivory text-base">Cause List & Upcoming Hearings</h3>
            </div>
            <span className="text-[10px] font-mono text-silver/50">BENCH CALENDAR</span>
          </div>

          <div className="space-y-3">
            {(!upcomingHearings || upcomingHearings.length === 0) ? (
              <p className="text-xs font-serif text-silver/60 text-center py-8">
                No hearings currently scheduled on the cause list.
              </p>
            ) : (
              upcomingHearings.map((h, idx) => (
                <div
                  key={h.hearing_id || idx}
                  className="p-3.5 rounded-xs bg-graphite/50 border border-brass/15 hover:border-brass/35 transition-all flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-serif font-medium text-ivory text-sm">
                      {h.purpose || 'Bench Hearing'}
                    </div>
                    <div className="text-[11px] text-silver/70">
                      {h.court_name} • {h.city || 'Courtroom'}
                    </div>
                    <div className="text-[11px] font-mono text-brass">
                      {h.case_number}
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <div className="text-xs text-ivory font-medium flex items-center justify-end gap-1">
                      <Clock className="w-3.5 h-3.5 text-brass" />
                      <span>{h.start_time || '10:30 AM'}</span>
                    </div>
                    <div className="text-[10px] text-silver/50 mt-1">
                      {h.hearing_date ? String(h.hearing_date).slice(0, 10) : '—'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Action Items / Deadlines */}
        <div className="court-card p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-brass/15 mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-brass" />
              <h3 className="font-serif font-medium text-ivory text-base">Urgent Filing Deadlines</h3>
            </div>
            <span className="text-[10px] font-mono text-silver/50">ACTION ITEMS</span>
          </div>

          <div className="space-y-3">
            {(!pendingTasks || pendingTasks.length === 0) ? (
              <p className="text-xs font-serif text-silver/60 text-center py-8">
                All action items resolved and verified.
              </p>
            ) : (
              pendingTasks.map((t) => (
                <div
                  key={t.task_id}
                  className="p-3.5 rounded-xs bg-graphite/50 border border-brass/15 hover:border-brass/35 transition-all flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-serif font-medium text-ivory text-sm">{t.title}</div>
                    <div className="text-[11px] font-mono text-silver/70 mt-0.5">{t.case_number}</div>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <StatusPill status={t.priority} showDot={false} />
                    <div className="text-[10px] text-silver/50 mt-1.5">
                      {t.due_date ? String(t.due_date).slice(0, 10) : '—'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Forensic Trigger Activity Log */}
      {recentAudit && recentAudit.length > 0 && (
        <div className="court-card p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-brass/15 mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-brass" />
              <h3 className="font-serif font-medium text-ivory text-base">
                Recent Forensic Case Activity (Trigger Logs)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">IMMUTABLE LOG</span>
          </div>

          <div className="court-table-container">
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
                    <td className="font-mono text-xs text-silver/80">
                      {log.action_time ? String(log.action_time).replace('T', ' ').slice(0, 19) : '—'}
                    </td>
                    <td className="font-mono text-ivory text-xs font-semibold">{log.table_name}</td>
                    <td>
                      <StatusPill status={log.action_type} />
                    </td>
                    <td className="font-mono text-brass text-xs">#{log.record_id}</td>
                    <td className="text-xs text-silver/80 font-mono">{log.changed_by || 'system'}</td>
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
