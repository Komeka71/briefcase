import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import {
  Users,
  Briefcase,
  UserCheck,
  Calendar,
  DollarSign,
  CheckSquare,
  FileText,
  Building,
  History,
  TrendingUp,
  RefreshCw,
  AlertCircle
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Executing database aggregation queries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h3 className="text-base font-semibold">Database Connection or Query Error</h3>
        </div>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <p className="mt-2 text-xs text-red-600">
          Make sure your MySQL80 service is running and the database has been initialized via{' '}
          <code className="bg-red-100 px-1 py-0.5 rounded font-mono">00_master_init.sql</code>.
        </p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const counts = data?.counts || {};
  const financials = data?.financials || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Lab Assignment 11 • Requirement E
            </span>
            <span className="text-xs text-slate-500">Live Statistics from MySQL</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Law Firm Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time entity counts, financial ledgers, and trial workflow telemetry from the BriefCase database.
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh MySQL Stats</span>
        </button>
      </div>

      {/* Primary Statistic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Clients', value: counts.clients ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Legal Cases', value: counts.cases ?? 0, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Firm Lawyers', value: counts.lawyers ?? 0, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Hearings', value: counts.hearings ?? 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Active Courts', value: counts.courts ?? 0, icon: Building, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Pending Tasks', value: counts.tasks ?? 0, icon: CheckSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
              <div className={`p-2.5 rounded-lg ${item.bg} ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">{item.label}</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{item.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Allocated Case Budget</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">
            ₹ {Number(financials.total_case_budget || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">Aggregated from CASES.budget (Req 10.6)</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Invoiced Amount</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            ₹ {Number(financials.total_invoiced || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">Sum of INVOICE.amount across billing cycles</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Payments Collected</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            ₹ {Number(financials.total_payments_received || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">Completed transactions via PAYMENT</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Cases Distribution by Status</h2>
          <p className="text-xs text-slate-500 mb-4 font-mono">GROUP BY CASE_STATUS (status_name)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.statusDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="status_name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Cases Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Type Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Cases Allocation by Practice Area</h2>
          <p className="text-xs text-slate-500 mb-4 font-mono">GROUP BY CASE_TYPE (type_name)</p>
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
                  label
                >
                  {(data?.typeDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Workflow Telemetry: Upcoming Hearings & Urgent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Hearings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm">Upcoming Court Hearings</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">HEARING JOIN COURT</span>
          </div>
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {(!data?.upcomingHearings || data.upcomingHearings.length === 0) ? (
              <p className="p-6 text-sm text-slate-400 text-center">No upcoming hearings scheduled.</p>
            ) : (
              data.upcomingHearings.map((h) => (
                <div key={h.hearing_id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{h.case_title}</div>
                    <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                      <span className="font-mono text-blue-600 font-medium">{h.case_number}</span>
                      <span>•</span>
                      <span>{h.court_name} ({h.city})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      {h.hearing_date}
                    </span>
                    <div className="text-xs text-slate-400 mt-0.5">{h.start_time || '10:30 AM'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Actionable Pending Tasks</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">TASK JOIN CASES</span>
          </div>
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {(!data?.pendingTasks || data.pendingTasks.length === 0) ? (
              <p className="p-6 text-sm text-slate-400 text-center">No pending tasks found.</p>
            ) : (
              data.pendingTasks.map((t) => (
                <div key={t.task_id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{t.title}</div>
                    <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                      <span className="font-mono text-slate-600">{t.case_number}</span>
                      <span>•</span>
                      <span>Assigned to: {t.assigned_to_name || 'Lawyer'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      t.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {t.priority}
                    </span>
                    <div className="text-xs text-slate-400 mt-0.5">Due: {t.due_date || 'ASAP'}</div>
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
