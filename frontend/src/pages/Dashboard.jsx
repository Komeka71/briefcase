import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import {
  Users,
  Briefcase,
  UserCheck,
  Calendar,
  Landmark,
  Scale,
  CheckSquare,
  FileText,
  Building,
  History,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Gavel
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

  // Luxury Legal Palette for Charts
  const CHART_COLORS = ['#c9a96e', '#3e5b87', '#5f7fa8', '#8e713e', '#dfbe85', '#22334d'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border border-[#c9a96e]/30 border-t-[#c9a96e] animate-spin" />
        <p className="text-xs font-serif tracking-widest text-[#c9a96e] uppercase">
          Synthesizing Chambers Telemetry...
        </p>
        <p className="text-[11px] font-mono text-slate-500">Querying MySQL Relational Aggregates</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#18263d] border border-red-500/30 rounded-sm text-slate-200 shadow-xl">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <h3 className="text-base font-serif font-semibold text-white">Database Connection or Query Error</h3>
        </div>
        <p className="mt-2 text-sm text-slate-300">{error}</p>
        <p className="mt-2 text-xs text-slate-400 font-mono">
          Ensure MySQL 8.0 service is active and the database has been initialized via{' '}
          <code className="text-[#c9a96e] bg-black/40 px-1 py-0.5 rounded font-mono">00_master_init.sql</code>.
        </p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-[#22334d] hover:bg-[#2c4263] border border-[#c9a96e]/30 text-[#dfbe85] rounded-sm text-xs font-mono uppercase tracking-wider transition-colors"
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
    <div className="space-y-8 pb-8">
      {/* Editorial Architectural Hero Banner */}
      <div className="relative rounded-sm overflow-hidden border border-white/10 shadow-2xl bg-[#0c1421]">
        {/* Background courthouse image with moody navy gradient overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity filter contrast-125"
          style={{ backgroundImage: `url('/courthouse.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1421] via-[#0c1421]/90 to-[#101827]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1421] via-transparent to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18263d]/80 border border-[#c9a96e]/30 text-[10px] tracking-widest uppercase font-mono text-[#c9a96e]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] animate-pulse"></span>
              <span>BriefCase Chambers • Law Firm Management</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-serif font-normal tracking-tight text-white leading-tight">
              Your Practice, <span className="italic text-[#c9a96e] font-serif">In Perspective</span>
            </h1>
            
            <p className="text-sm md:text-base text-slate-300 font-serif leading-relaxed max-w-xl">
              An overview of your firm's cases, clients, judicial hearings, and fiduciary ledger.
              Powered by real-time MySQL relational procedures and triggers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-left sm:text-right text-xs font-mono text-slate-400">
              <div className="text-slate-500 text-[10px] uppercase tracking-wider">Session Timestamp</div>
              <div className="text-[#c9a96e] font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
            </div>

            <button
              onClick={fetchDashboard}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#18263d] hover:bg-[#22334d] border border-[#c9a96e]/40 hover:border-[#c9a96e] text-[#dfbe85] rounded-sm text-xs font-mono uppercase tracking-wider transition-all duration-200 shadow-lg group"
            >
              <RefreshCw className="w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-180 text-[#c9a96e]" />
              <span>Sync Telemetry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Statistics Grid — Architectural Columns */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#a8b2c2]">
            Registry Overview • Real-Time Database Counts
          </div>
          <div className="text-[10px] font-mono text-slate-500">SELECT COUNT(*) FROM Entities</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { label: 'Total Clients', value: counts.clients ?? 0, icon: Users, desc: 'Registered Entities', link: '/clients' },
            { label: 'Legal Cases', value: counts.cases ?? 0, icon: Briefcase, desc: 'Active Lawsuits', link: '/cases' },
            { label: 'Firm Counsel', value: counts.lawyers ?? 0, icon: UserCheck, desc: 'Enrolled Advocates', link: '/lawyers' },
            { label: 'Court Hearings', value: counts.hearings ?? 0, icon: Calendar, desc: 'Scheduled Sessions', link: '/hearings' },
            { label: 'Judicial Forums', value: counts.courts ?? 0, icon: Building, desc: 'High & District Courts', link: '/hearings' },
            { label: 'Pending Tasks', value: counts.tasks ?? 0, icon: CheckSquare, desc: 'Action Items', link: '/cases' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#141f32]/90 hover:bg-[#18263d] border border-white/10 hover:border-[#c9a96e]/40 p-4 rounded-sm transition-all duration-200 flex flex-col justify-between group shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 group-hover:text-slate-300">
                    {item.label}
                  </span>
                  <div className="p-1.5 rounded bg-[#101827] border border-white/5 text-[#c9a96e] group-hover:text-[#dfbe85] transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-2xl md:text-3xl font-serif font-light text-white group-hover:text-[#dfbe85] transition-colors">
                    {item.value}
                  </div>
                  <div className="text-[10px] text-slate-500 font-serif mt-1 truncate">
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fiduciary / Financial Overview Cards */}
      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#a8b2c2] mb-3 px-1">
          Fiduciary Ledger • Aggregate Case Valuations
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#18263d] border border-[#c9a96e]/30 rounded-sm p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#c9a96e]/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="uppercase tracking-wider">Allocated Case Budget</span>
              <Scale className="w-4 h-4 text-[#c9a96e]" />
            </div>
            <div className="text-3xl font-serif font-light text-[#dfbe85] mt-3">
              ₹ {Number(financials.total_case_budget || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 font-serif mt-1">
              Aggregated from CASES.budget via SUM() procedure (Req 10.6)
            </div>
          </div>

          <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="uppercase tracking-wider">Total Invoiced Amount</span>
              <FileText className="w-4 h-4 text-slate-300" />
            </div>
            <div className="text-3xl font-serif font-light text-white mt-3">
              ₹ {Number(financials.total_invoiced || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 font-serif mt-1">
              Sum of INVOICE.amount across billing cycles
            </div>
          </div>

          <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="uppercase tracking-wider">Settled & Collected</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-serif font-light text-emerald-300 mt-3">
              ₹ {Number(financials.total_payments_received || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 font-serif mt-1">
              Reconciled payment receipts in PAYMENT table
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics — Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div>
              <h2 className="text-base font-serif font-semibold text-white">Matter Lifecycle Distribution</h2>
              <p className="text-[10px] font-mono text-[#c9a96e] mt-0.5">GROUP BY CASE_STATUS (status_name)</p>
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              {data?.statusDistribution?.length || 0} Status Stages
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.statusDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#22334d" />
                <XAxis dataKey="status_name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c1421',
                    borderColor: 'rgba(201, 169, 110, 0.4)',
                    color: '#f8fafc',
                    borderRadius: '2px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#c9a96e" radius={[2, 2, 0, 0]} name="Cases Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Practice Type Distribution */}
        <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div>
              <h2 className="text-base font-serif font-semibold text-white">Chambers Practice Areas</h2>
              <p className="text-[10px] font-mono text-[#c9a96e] mt-0.5">GROUP BY CASE_TYPE (type_name)</p>
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Practice Spectrum
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.typeDistribution || []}
                  dataKey="count"
                  nameKey="type_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={36}
                  paddingAngle={3}
                  label
                >
                  {(data?.typeDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c1421',
                    borderColor: 'rgba(201, 169, 110, 0.4)',
                    color: '#f8fafc',
                    borderRadius: '2px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Workflow: Hearings & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Hearings */}
        <div className="bg-[#141f32] border border-white/10 rounded-sm overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#18263d]/50">
            <div className="flex items-center space-x-2.5">
              <Calendar className="w-4 h-4 text-[#c9a96e]" />
              <h3 className="font-serif font-semibold text-white text-sm">Upcoming Court Hearings</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">HEARING JOIN COURT</span>
          </div>

          <div className="divide-y divide-white/5">
            {(!data?.upcomingHearings || data.upcomingHearings.length === 0) ? (
              <div className="p-8 text-center">
                <Gavel className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-serif">No court hearings currently scheduled.</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Add hearings via the Court Hearings module.</p>
              </div>
            ) : (
              data.upcomingHearings.map((h) => (
                <div key={h.hearing_id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                  <div>
                    <div className="text-sm font-serif font-medium text-white">{h.case_title}</div>
                    <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                      <span className="font-mono text-[#c9a96e] text-xs">{h.case_number}</span>
                      <span>•</span>
                      <span>{h.court_name} ({h.city})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-sm text-xs font-mono font-medium bg-[#18263d] text-[#dfbe85] border border-[#c9a96e]/30">
                      {h.hearing_date}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{h.start_time || '10:30 AM'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actionable Tasks */}
        <div className="bg-[#141f32] border border-white/10 rounded-sm overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#18263d]/50">
            <div className="flex items-center space-x-2.5">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <h3 className="font-serif font-semibold text-white text-sm">Actionable Pending Tasks</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">TASK JOIN CASES</span>
          </div>

          <div className="divide-y divide-white/5">
            {(!data?.pendingTasks || data.pendingTasks.length === 0) ? (
              <div className="p-8 text-center">
                <CheckSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-serif">No actionable tasks pending resolution.</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">All case milestones are up to date.</p>
              </div>
            ) : (
              data.pendingTasks.map((t) => (
                <div key={t.task_id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                  <div>
                    <div className="text-sm font-serif font-medium text-white">{t.title}</div>
                    <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                      <span className="font-mono text-slate-300">{t.case_number}</span>
                      <span>•</span>
                      <span>Assigned to: {t.assigned_to_name || 'Counsel'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-mono font-medium ${
                      t.priority === 'High' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-white/5 text-slate-300 border border-white/10'
                    }`}>
                      {t.priority}
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">Due: {t.due_date || 'ASAP'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Forensic Audit Telemetry Strip */}
      {recentAudit.length > 0 && (
        <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div className="flex items-center space-x-2.5">
              <History className="w-4 h-4 text-[#c9a96e]" />
              <h3 className="font-serif font-semibold text-white text-sm">Recent Forensic Trigger Activity</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              AFTER INSERT/UPDATE/DELETE Triggers (Req 10.9)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentAudit.map((item, idx) => (
              <div key={idx} className="p-3 bg-[#101827] border border-white/5 rounded-sm text-xs">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#c9a96e] font-semibold">{item.operation_type}</span>
                  <span className="text-slate-500">{item.changed_at}</span>
                </div>
                <div className="mt-1 font-serif text-slate-200">
                  Target Entity: <span className="font-mono text-white">{item.table_name}</span> #{item.record_id}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
