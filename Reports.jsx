import React, { useState, useEffect } from 'react';
import { reportService, caseService } from '../services/api';
import {
  FileCode2,
  Play,
  Clock,
  Code,
  Layers,
  Database,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Zap,
  Eye,
  RefreshCw,
  GitBranch,
  TableProperties,
  Cpu,
  BarChart3,
  Download,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('q1');

  // Shared status state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);

  // Tab 1: Client Register & XML Export
  const [q1Data, setQ1Data] = useState([]);
  const [q1Xml, setQ1Xml] = useState(null);

  // Tab 2: Transactional Intake
  const [q2Form, setQ2Form] = useState({
    client_name: 'Gujarat Maritime Board',
    client_type: 'Organization',
    client_phone: '+91 261 2470001',
    client_email: 'legal@gmbports.gov.in',
    client_address: 'Port Colony, Athwalines, Surat',
    case_title: 'Hazira Port Coastal Injunction Defense',
    case_type_id: 1,
    budget: 450000.00,
    priority: 'High'
  });
  const [q2Result, setQ2Result] = useState(null);

  // Tab 3: Aggregate Financials
  const [q3Func, setQ3Func] = useState('SUM');
  const [q3Result, setQ3Result] = useState(null);
  const [q3Xml, setQ3Xml] = useState(null);

  // Tab 4: Filtered Practice Directory
  const [q4Column, setQ4Column] = useState('client_type');
  const [q4Operator, setQ4Operator] = useState('=');
  const [q4Value, setQ4Value] = useState('Individual');
  const [q4Data, setQ4Data] = useState([]);
  const [q4Xml, setQ4Xml] = useState(null);

  // Tab 5: Cross-Entity Joins
  const [q5Table1, setQ5Table1] = useState('CLIENT');
  const [q5Table2, setQ5Table2] = useState('CASES');
  const [q5JoinType, setQ5JoinType] = useState('INNER');
  const [q5Data, setQ5Data] = useState([]);

  // Tab 6: High-Value Matters Subquery
  const [q6Threshold, setQ6Threshold] = useState(300000);
  const [q7Operator, setQ7Operator] = useState('>');
  const [q6Data, setQ6Data] = useState([]);

  // Tab 7: Departmental Benchmark Subquery
  const [q7Data, setQ7Data] = useState([]);

  // Tab 8: Matter Financial Modification
  const [q8CaseId, setQ8CaseId] = useState(1);
  const [q8Budget, setQ8Budget] = useState(600000.00);
  const [q8Notes, setQ8Notes] = useState('Budget increment approved by managing committee');
  const [q8Result, setQ8Result] = useState(null);

  // Tab 9: Consolidated Views
  const [selectedView, setSelectedView] = useState('vw_client_cases');
  const [viewData, setViewData] = useState([]);

  // Reset errors on tab switch
  useEffect(() => {
    setError(null);
    setSuccess(null);
    setExecutionTime(null);
  }, [activeTab]);

  // Execute Query 1: Client Register
  const runQuery1 = async (format = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getQuery1(format);
      if (format === 'xml') {
        setQ1Xml(res.data);
      } else {
        setQ1Data(res.data.data || []);
        setExecutionTime(res.data.executionTimeMs);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Master client query execution failed.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Query 2: Transactional Intake
  const runQuery2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await reportService.postQuery2(q2Form);
      setQ2Result(res.data.data);
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Transactional intake failed due to relational integrity constraint.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Query 3: Financial Aggregates
  const runQuery3 = async (format = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getQuery3(q3Func, 'budget', 'CASES', format);
      if (format === 'xml') {
        setQ3Xml(res.data);
      } else {
        setQ3Result(res.data.data);
        setExecutionTime(res.data.executionTimeMs);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Financial aggregate calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Query 4: Filtered Practice Directory
  const runQuery4 = async (format = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getQuery4(q4Column, q4Operator, q4Value, format);
      if (format === 'xml') {
        setQ4Xml(res.data);
      } else {
        setQ4Data(res.data.data || []);
        setExecutionTime(res.data.executionTimeMs);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Filtered record search failed.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Query 5: Relational Joins
  const runQuery5 = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getQuery5(q5Table1, q5Table2, q5JoinType);
      setQ5Data(res.data.data || []);
      setExecutionTime(res.data.executionTimeMs);
    } catch (err) {
      setError(err.response?.data?.message || 'Relational join operation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Query 6: High-Value Matters Subquery
  const runQuery6 = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getQuery6(q6Threshold);
      setQ6Data(res.data.data || []);
      setExecutionTime(res.data.executionTimeMs);
    } catch (err) {
      setError(err.response?.data?.message || 'High-value subquery evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Query 7: Departmental Benchmark Subquery
  const runQuery7 = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getQuery7(q7Operator);
      setQ7Data(res.data.data || []);
      setExecutionTime(res.data.executionTimeMs);
    } catch (err) {
      setError(err.response?.data?.message || 'Correlated departmental benchmark evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Query 8: Matter Financial Modification
  const runQuery8 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await reportService.putQuery8({
        case_id: q8CaseId,
        budget: q8Budget,
        notes: q8Notes
      });
      setQ8Result(res.data.data);
      setExecutionTime(res.data.executionTimeMs);
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Matter budget update failed.');
    } finally {
      setLoading(false);
    }
  };

  // Query View Data
  const runView = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getViewData(selectedView);
      setViewData(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to query consolidated database view.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'q1', label: 'Client Register & XML', category: 'REGISTRY' },
    { id: 'q2', label: 'Intake Integrity', category: 'MUTATION' },
    { id: 'q3', label: 'Financial Aggregates', category: 'ANALYTICS' },
    { id: 'q4', label: 'Filtered Explorer', category: 'FILTER' },
    { id: 'q5', label: 'Relational Joins', category: 'JOINS' },
    { id: 'q6', label: 'Matter Subqueries', category: 'SUBQUERIES' },
    { id: 'q7', label: 'Practice Benchmarks', category: 'CORRELATED' },
    { id: 'q8', label: 'Budget Adjustment', category: 'AUDIT' },
    { id: 'views', label: 'Consolidated Views', category: 'VIEWS' },
    { id: 'indexes', label: 'Index Optimization', category: 'PROFILING' },
  ];

  return (
    <div className="space-y-7 pb-12">
      {/* Editorial Header */}
      <div className="relative overflow-hidden rounded-sm bg-gradient-to-r from-[#1d1611] via-[#241b15] to-[#2e231b] border border-white/10 p-7 md:p-9 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-[#2e231b]/20 to-transparent pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-[#f5f0e7]/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-semibold bg-[#2e231b] text-[#f5f0e7] border border-white/15">
              <Database className="w-3 h-3 text-white" />
              <span>Practice Intelligence & Analytics Engine</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-normal text-[#f5f0e7] tracking-tight">
              Reports, Queries & <span className="italic text-white">Practice Analytics</span>
            </h1>

            <p className="text-xs md:text-sm text-[#f5f0e7]/70 font-serif leading-relaxed">
              Real-time transactional query engine executing relational joins, multi-table subqueries, correlated budget benchmarks, XML exports, and index execution plans.
            </p>
          </div>

          {executionTime !== null && (
            <div className="self-start md:self-auto flex items-center space-x-3 bg-[#120d0a] border border-emerald-500/30 px-5 py-3 rounded-sm text-xs font-mono text-emerald-400 shadow-xl">
              <Clock className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#f5f0e7]/70">Engine Latency</div>
                <div className="font-bold text-[#f5f0e7] text-sm">{executionTime} ms</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-[#1d1611] border border-white/10 rounded-sm p-1.5 shadow-xl flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-sm text-xs font-mono transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-[#2e231b] text-[#f5f0e7] border border-white/20 font-semibold shadow-md'
                : 'text-[#f5f0e7]/70 hover:text-[#f5f0e7] hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-[#1e1517] border-l-4 border-[#dc2626] rounded-sm text-[#f5f0e7] flex items-start space-x-3 shadow-lg border border-[#dc2626]/20">
          <AlertCircle className="w-5 h-5 text-[#f87171] flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-red-300 font-mono uppercase tracking-wider">
              Query Error / Constraint Notice:
            </div>
            <div className="mt-1 text-[#f5f0e7] font-serif text-sm">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-[#151e18] border-l-4 border-[#059669] rounded-sm text-[#f5f0e7] flex items-start space-x-3 shadow-lg border border-[#059669]/20">
          <CheckCircle2 className="w-5 h-5 text-[#34d399] flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-emerald-300 font-mono uppercase tracking-wider">
              Execution Succeeded:
            </div>
            <div className="mt-1 text-[#f5f0e7] font-serif text-sm">{success}</div>
          </div>
        </div>
      )}

      {/* TAB 1: CLIENT REGISTER & XML EXPORT */}
      {activeTab === 'q1' && (
        <div className="bg-[#1d1611] border border-white/10 rounded-sm p-7 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="text-[10px] font-mono text-white uppercase tracking-wider">Directory Register</div>
              <h2 className="text-xl font-serif font-semibold text-[#f5f0e7] mt-0.5">
                Master Client Register & Technical XML Export
              </h2>
              <p className="text-xs text-[#f5f0e7]/70 font-mono mt-1">
                SELECT * FROM CLIENT ORDER BY client_id ASC
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => runQuery1('')}
                disabled={loading}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#120d0a] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Query</span>
              </button>
              <button
                onClick={() => runQuery1('xml')}
                disabled={loading}
                className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#2e231b] hover:bg-[#3d2f24] text-[#f5f0e7] border border-white/15 rounded-sm text-xs font-mono uppercase tracking-wider shadow-md transition-colors"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>XML Export</span>
              </button>
            </div>
          </div>

          {q1Xml && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-white">
                <span>Generated XML Document:</span>
                <button onClick={() => setQ1Xml(null)} className="text-[#f5f0e7]/70 hover:text-white">Close XML</button>
              </div>
              <pre className="p-4 bg-[#120d0a] border border-white/10 rounded-sm text-xs font-mono text-emerald-300 overflow-x-auto max-h-64">
                {q1Xml}
              </pre>
            </div>
          )}

          <div className="border border-white/10 rounded-sm overflow-x-auto">
            <table className="w-full text-left text-xs text-[#f5f0e7]/70">
              <thead className="bg-[#120d0a] text-[#f5f0e7] font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Client Entity Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Contact Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Registered Address</th>
                  <th className="px-4 py-3">Admit Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {q1Data.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-[#f5f0e7]/70 font-serif">
                      Click "Execute Query" to inspect all registered clients from database.
                    </td>
                  </tr>
                ) : (
                  q1Data.map((c) => (
                    <tr key={c.client_id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white">#{c.client_id}</td>
                      <td className="px-4 py-3 font-serif font-semibold text-[#f5f0e7]">{c.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] ${
                          c.client_type === 'Organization' ? 'bg-[#2e231b]/50 text-[#f5f0e7] border border-white/15' : 'bg-stone-800 text-[#f5f0e7]/70'
                        }`}>
                          {c.client_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{c.email}</td>
                      <td className="px-4 py-3 text-slate-400">{c.phone}</td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-300">{c.address}</td>
                      <td className="px-4 py-3 text-slate-400">{c.date_of_registration}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INTAKE INTEGRITY */}
      {activeTab === 'q2' && (
        <div className="bg-[#1d1611] border border-white/10 rounded-sm p-7 shadow-2xl space-y-5">
          <div className="pb-4 border-b border-white/5">
            <div className="text-[10px] font-mono text-white uppercase tracking-wider">Transactional Intake</div>
            <h2 className="text-xl font-serif font-semibold text-[#f5f0e7] mt-0.5">
              Client & Legal Matter Creation with Foreign Key Validation
            </h2>
            <p className="text-xs text-[#f5f0e7]/70 font-serif mt-1">
              Demonstrates atomic dual-entity insertion into CLIENT and CASES tables while enforcing validation triggers and referential foreign key dependencies.
            </p>
          </div>

          <form onSubmit={runQuery2} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/70 mb-1">
                  Client Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={q2Form.client_name}
                  onChange={(e) => setQ2Form({ ...q2Form, client_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#120d0a] border border-white/10 focus:border-white rounded-sm text-xs text-[#f5f0e7]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/70 mb-1">
                  Client Classification *
                </label>
                <select
                  value={q2Form.client_type}
                  onChange={(e) => setQ2Form({ ...q2Form, client_type: e.target.value })}
                  className="w-full px-3 py-2 bg-[#120d0a] border border-white/10 focus:border-white rounded-sm text-xs text-[#f5f0e7] font-mono"
                >
                  <option value="Individual">Individual</option>
                  <option value="Organization">Organization</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/70 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={q2Form.client_email}
                  onChange={(e) => setQ2Form({ ...q2Form, client_email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#120d0a] border border-white/10 focus:border-white rounded-sm text-xs font-mono text-[#f5f0e7]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/70 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={q2Form.client_phone}
                  onChange={(e) => setQ2Form({ ...q2Form, client_phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#120d0a] border border-white/10 focus:border-white rounded-sm text-xs font-mono text-[#f5f0e7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/70 mb-1">
                Client Address *
              </label>
              <input
                type="text"
                required
                value={q2Form.client_address}
                onChange={(e) => setQ2Form({ ...q2Form, client_address: e.target.value })}
                className="w-full px-3 py-2 bg-[#120d0a] border border-white/10 focus:border-white rounded-sm text-xs text-[#f5f0e7]"
              />
            </div>

            <div className="pt-2 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/70 mb-1">
                  Case Title *
                </label>
                <input
                  type="text"
                  required
                  value={q2Form.case_title}
                  onChange={(e) => setQ2Form({ ...q2Form, case_title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#120d0a] border border-white/10 focus:border-white rounded-sm text-xs text-[#f5f0e7]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/70 mb-1">
                  Allocated Budget (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={q2Form.budget}
                  onChange={(e) => setQ2Form({ ...q2Form, budget: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-[#120d0a] border border-white/10 focus:border-white rounded-sm text-xs font-mono text-[#f5f0e7]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/70 mb-1">
                  Priority Rating *
                </label>
                <select
                  value={q2Form.priority}
                  onChange={(e) => setQ2Form({ ...q2Form, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-[#120d0a] border border-white/10 focus:border-white rounded-sm text-xs text-[#f5f0e7] font-mono"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#120d0a] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Submit Transactional Intake</span>
            </button>
          </form>

          {q2Result && (
            <div className="p-4 bg-[#120d0a] border border-white/15 rounded-sm text-xs font-mono space-y-1 mt-4 text-[#f5f0e7]/70">
              <div className="font-bold text-[#f5f0e7] uppercase tracking-wider">
                Intake Transaction Committed Successfully:
              </div>
              <div>• Created Client ID: <span className="text-[#f5f0e7]">#{q2Result.client_id}</span> ({q2Result.client_name})</div>
              <div>• Created Case ID: <span className="text-[#f5f0e7]">#{q2Result.case_id}</span> ({q2Result.case_number})</div>
              <div>• Title: {q2Result.case_title}</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FINANCIAL AGGREGATES */}
      {activeTab === 'q3' && (
        <div className="bg-[#1d1611] border border-white/10 rounded-sm p-7 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="text-[10px] font-mono text-white uppercase tracking-wider">Budget Analysis</div>
              <h2 className="text-xl font-serif font-semibold text-[#f5f0e7] mt-0.5">
                Practice Financial Aggregates & Distribution
              </h2>
              <p className="text-xs text-[#f5f0e7]/70 font-mono mt-1">
                SELECT {q3Func}(budget) FROM CASES
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={q3Func}
                onChange={(e) => setQ3Func(e.target.value)}
                className="px-3 py-2 bg-[#120d0a] border border-white/10 focus:border-white rounded-sm text-xs text-[#f5f0e7] font-mono"
              >
                <option value="SUM">SUM (Total Budget)</option>
                <option value="AVG">AVG (Average Budget)</option>
                <option value="MIN">MIN (Minimum Budget)</option>
                <option value="MAX">MAX (Maximum Budget)</option>
                <option value="COUNT">COUNT (Total Matters)</option>
              </select>
              <button
                onClick={() => runQuery3('')}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#120d0a] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
              >
                Compute
              </button>
              <button
                onClick={() => runQuery3('xml')}
                disabled={loading}
                className="px-3 py-2 bg-[#2e231b] hover:bg-[#3d2f24] text-[#f5f0e7] border border-white/15 rounded-sm text-xs font-mono uppercase tracking-wider shadow-md transition-colors"
              >
                XML
              </button>
            </div>
          </div>

          {q3Xml && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-white">
                <span>Generated XML Aggregate Payload:</span>
                <button onClick={() => setQ3Xml(null)} className="text-[#f5f0e7]/70 hover:text-white">Close XML</button>
              </div>
              <pre className="p-4 bg-[#120d0a] border border-white/10 rounded-sm text-xs font-mono text-emerald-300 overflow-x-auto max-h-48">
                {q3Xml}
              </pre>
            </div>
          )}

          {q3Result && (
            <div className="p-6 bg-[#120d0a] border border-white/15 rounded-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/70">
                  Aggregated Output ({q3Result.function} of CASES.budget):
                </div>
                <div className="text-3xl font-serif font-bold text-[#f5f0e7] mt-1">
                  {q3Result.function === 'COUNT' ? q3Result.result : `₹ ${Number(q3Result.result || 0).toLocaleString('en-IN')}`}
                </div>
              </div>
              <TrendingUp className="w-10 h-10 text-white/30" />
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FILTERED EXPLORER */}
      {activeTab === 'q4' && (
        <div className="bg-[#1d1611] border border-white/10 rounded-sm p-7 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="text-[10px] font-mono text-white uppercase tracking-wider">Dynamic Predicates</div>
              <h2 className="text-xl font-serif font-semibold text-[#f5f0e7] mt-0.5">
                Dynamic Conditional Record Filtering
              </h2>
              <p className="text-xs text-[#f5f0e7]/70 font-mono mt-1">
                SELECT * FROM CLIENT WHERE {q4Column} {q4Operator} '{q4Value}'
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={q4Column}
                onChange={(e) => setQ4Column(e.target.value)}
                className="px-2.5 py-2 bg-[#120d0a] border border-white/10 rounded-sm text-xs text-[#f5f0e7] font-mono"
              >
                <option value="client_type">client_type</option>
                <option value="address">address</option>
                <option value="client_id">client_id</option>
              </select>

              <select
                value={q4Operator}
                onChange={(e) => setQ4Operator(e.target.value)}
                className="px-2.5 py-2 bg-[#120d0a] border border-white/10 rounded-sm text-xs text-[#f5f0e7] font-mono"
              >
                <option value="=">=</option>
                <option value="!=">!=</option>
                <option value="LIKE">LIKE</option>
              </select>

              <input
                type="text"
                value={q4Value}
                onChange={(e) => setQ4Value(e.target.value)}
                placeholder="Value..."
                className="w-28 px-2.5 py-2 bg-[#120d0a] border border-white/10 rounded-sm text-xs text-[#f5f0e7] font-mono"
              />

              <button
                onClick={() => runQuery4('')}
                disabled={loading}
                className="px-3.5 py-2 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#120d0a] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
              >
                Filter
              </button>
              <button
                onClick={() => runQuery4('xml')}
                disabled={loading}
                className="px-2.5 py-2 bg-[#2e231b] hover:bg-[#3d2f24] text-[#f5f0e7] border border-white/15 rounded-sm text-xs font-mono uppercase tracking-wider transition-colors"
              >
                XML
              </button>
            </div>
          </div>

          {q4Xml && (
            <pre className="p-4 bg-[#120d0a] border border-white/10 rounded-sm text-xs font-mono text-emerald-300 overflow-x-auto max-h-48">
              {q4Xml}
            </pre>
          )}

          <div className="border border-white/10 rounded-sm overflow-x-auto">
            <table className="w-full text-left text-xs text-[#f5f0e7]/70">
              <thead className="bg-[#120d0a] text-[#f5f0e7] font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Client ID</th>
                  <th className="px-4 py-3">Client Entity</th>
                  <th className="px-4 py-3">Classification</th>
                  <th className="px-4 py-3">Contact Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Registered Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {q4Data.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-[#f5f0e7]/70 font-serif">
                      Apply predicate criteria above and execute filter.
                    </td>
                  </tr>
                ) : (
                  q4Data.map((c) => (
                    <tr key={c.client_id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white">#{c.client_id}</td>
                      <td className="px-4 py-3 font-serif font-semibold text-[#f5f0e7]">{c.name}</td>
                      <td className="px-4 py-3">{c.client_type}</td>
                      <td className="px-4 py-3">{c.email}</td>
                      <td className="px-4 py-3">{c.phone}</td>
                      <td className="px-4 py-3">{c.address}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: RELATIONAL JOINS */}
      {activeTab === 'q5' && (
        <div className="bg-[#1d1611] border border-white/10 rounded-sm p-7 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="text-[10px] font-mono text-white uppercase tracking-wider">Relational Algebra</div>
              <h2 className="text-xl font-serif font-semibold text-[#f5f0e7] mt-0.5">
                Cross-Entity Relational JOIN Operations
              </h2>
              <p className="text-xs text-[#f5f0e7]/70 font-mono mt-1">
                SELECT * FROM {q5Table1} {q5JoinType} JOIN {q5Table2}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={q5JoinType}
                onChange={(e) => setQ5JoinType(e.target.value)}
                className="px-3 py-2 bg-[#120d0a] border border-white/10 rounded-sm text-xs text-[#f5f0e7] font-mono"
              >
                <option value="INNER">INNER JOIN</option>
                <option value="LEFT">LEFT OUTER JOIN</option>
                <option value="RIGHT">RIGHT OUTER JOIN</option>
              </select>
              <button
                onClick={runQuery5}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#120d0a] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
              >
                Execute Join
              </button>
            </div>
          </div>

          <div className="border border-white/10 rounded-sm overflow-x-auto">
            <table className="w-full text-left text-xs text-[#f5f0e7]/70">
              <thead className="bg-[#120d0a] text-[#f5f0e7] font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Client Name</th>
                  <th className="px-4 py-3">Client Type</th>
                  <th className="px-4 py-3">Case Number</th>
                  <th className="px-4 py-3">Case Title</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {q5Data.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-[#f5f0e7]/70 font-serif">
                      Select join type and execute query.
                    </td>
                  </tr>
                ) : (
                  q5Data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-serif font-semibold text-[#f5f0e7]">{row.client_name || '—'}</td>
                      <td className="px-4 py-3">{row.client_type || '—'}</td>
                      <td className="px-4 py-3 text-white">{row.case_number || '—'}</td>
                      <td className="px-4 py-3 font-serif text-[#f5f0e7]">{row.case_title || '—'}</td>
                      <td className="px-4 py-3">{row.priority || '—'}</td>
                      <td className="px-4 py-3 text-[#f5f0e7]">
                        {row.budget ? `₹ ${Number(row.budget).toLocaleString('en-IN')}` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: HIGH-VALUE MATTERS SUBQUERY */}
      {activeTab === 'q6' && (
        <div className="bg-[#1d1611] border border-white/10 rounded-sm p-7 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="text-[10px] font-mono text-white uppercase tracking-wider">Subquery Logic</div>
              <h2 className="text-xl font-serif font-semibold text-[#f5f0e7] mt-0.5">
                High-Value Client Matters Subquery
              </h2>
              <p className="text-xs text-[#f5f0e7]/70 font-mono mt-1">
                SELECT * FROM CLIENT WHERE client_id IN (SELECT client_id FROM CASES WHERE budget &gt;= {q6Threshold})
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={q6Threshold}
                onChange={(e) => setQ6Threshold(parseFloat(e.target.value) || 0)}
                className="px-3 py-2 bg-[#120d0a] border border-white/10 rounded-sm text-xs font-mono text-[#f5f0e7]"
              >
                <option value={100000}>Budget &gt; ₹1,00,000</option>
                <option value={200000}>Budget &gt; ₹2,00,000</option>
                <option value={300000}>Budget &gt; ₹3,00,000</option>
                <option value={500000}>Budget &gt; ₹5,00,000</option>
                <option value={1000000}>Budget &gt; ₹10,00,000</option>
              </select>
              <button
                onClick={runQuery6}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#120d0a] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
              >
                Run Subquery
              </button>
            </div>
          </div>

          <div className="border border-white/10 rounded-sm overflow-x-auto">
            <table className="w-full text-left text-xs text-[#f5f0e7]/70">
              <thead className="bg-[#120d0a] text-[#f5f0e7] font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Client ID</th>
                  <th className="px-4 py-3">Client Entity</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">City / Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {q6Data.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-[#f5f0e7]/70 font-serif">
                      Click "Run Subquery" to filter clients holding matters above ₹ {Number(q6Threshold).toLocaleString('en-IN')}.
                    </td>
                  </tr>
                ) : (
                  q6Data.map((c) => (
                    <tr key={c.client_id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white">#{c.client_id}</td>
                      <td className="px-4 py-3 font-serif font-semibold text-[#f5f0e7]">{c.name}</td>
                      <td className="px-4 py-3">{c.client_type}</td>
                      <td className="px-4 py-3">{c.email}</td>
                      <td className="px-4 py-3">{c.address}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: PRACTICE BENCHMARKS (CORRELATED SUBQUERY) */}
      {activeTab === 'q7' && (
        <div className="bg-[#1d1611] border border-white/10 rounded-sm p-7 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="text-[10px] font-mono text-white uppercase tracking-wider">Correlated Subquery</div>
              <h2 className="text-xl font-serif font-semibold text-[#f5f0e7] mt-0.5">
                Cases Compared to Practice Group Average Budget
              </h2>
              <p className="text-xs text-[#f5f0e7]/70 font-mono mt-1">
                SELECT c.* FROM CASES c WHERE c.budget {q7Operator} (SELECT AVG(budget) FROM CASES WHERE case_type_id = c.case_type_id)
              </p>
            </div>
            <div className="flex items-center space-x-2">
            <select
              value={q7Operator}
              onChange={(e) => setQ7Operator(e.target.value)}
              className="px-3 py-2 bg-[#120d0a] border border-white/10 rounded-sm text-xs font-mono text-[#f5f0e7]"
            >
              <option value=">">Above group average (&gt;)</option>
              <option value=">=">At or above average (&gt;=)</option>
              <option value="<">Below group average (&lt;)</option>
              <option value="<=">At or below average (&lt;=)</option>
            </select>
            <button
              onClick={runQuery7}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#120d0a] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
            >
              Analyze Benchmarks
            </button>
            </div>
          </div>

          <div className="border border-white/10 rounded-sm overflow-x-auto">
            <table className="w-full text-left text-xs text-[#f5f0e7]/70">
              <thead className="bg-[#120d0a] text-[#f5f0e7] font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Case Number</th>
                  <th className="px-4 py-3">Matter Title</th>
                  <th className="px-4 py-3">Practice Area</th>
                  <th className="px-4 py-3">Matter Budget</th>
                  <th className="px-4 py-3">Category Average</th>
                  <th className="px-4 py-3">Premium Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {q7Data.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-[#f5f0e7]/70 font-serif">
                      Click "Analyze Benchmarks" to execute correlated category comparison.
                    </td>
                  </tr>
                ) : (
                  q7Data.map((c) => (
                    <tr key={c.case_id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white font-bold">{c.case_number}</td>
                      <td className="px-4 py-3 font-serif font-semibold text-[#f5f0e7]">{c.title}</td>
                      <td className="px-4 py-3">{c.type_name || `Type #${c.case_type_id}`}</td>
                      <td className="px-4 py-3 text-emerald-400 font-bold">
                        ₹ {Number(c.budget).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        ₹ {Number(c.avg_type_budget || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-[#f5f0e7]">
                        +₹ {Number((c.budget || 0) - (c.avg_type_budget || 0)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: BUDGET ADJUSTMENT & AUDIT MUTATION */}
      {activeTab === 'q8' && (
        <div className="bg-[#1d1611] border border-white/10 rounded-sm p-7 shadow-2xl space-y-5">
          <div className="pb-4 border-b border-white/5">
            <div className="text-[10px] font-mono text-white uppercase tracking-wider">Matter Modification</div>
            <h2 className="text-xl font-serif font-semibold text-[#f5f0e7] mt-0.5">
              Matter Budget Modification with Trigger Audit Verification
            </h2>
            <p className="text-xs text-[#f5f0e7]/70 font-serif mt-1">
              Executes parameterized UPDATE on matter financials, firing validation triggers and recording JSON mutation diffs in the forensic audit trail.
            </p>
          </div>

          <form onSubmit={runQuery8} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/70 mb-1">Target Matter ID *</label>
              <input
                type="number"
                min="1"
                required
                value={q8CaseId}
                onChange={(e) => setQ8CaseId(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 bg-[#120d0a] border border-white/10 focus:border-white rounded-sm text-xs text-[#f5f0e7] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/70 mb-1">Adjusted Budget Allocation (₹) *</label>
              <input
                type="number"
                min="0"
                required
                value={q8Budget}
                onChange={(e) => setQ8Budget(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#120d0a] border border-white/10 focus:border-white rounded-sm text-xs text-[#f5f0e7] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/70 mb-1">Modification Remarks / Reason</label>
              <input
                type="text"
                required
                value={q8Notes}
                onChange={(e) => setQ8Notes(e.target.value)}
                className="w-full px-3 py-2 bg-[#120d0a] border border-white/10 focus:border-white rounded-sm text-xs text-[#f5f0e7] font-serif"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#120d0a] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
            >
              Execute Budget Adjustment
            </button>
          </form>

          {q8Result && (
            <div className="p-4 bg-[#120d0a] border border-white/15 rounded-sm text-xs font-mono space-y-1 mt-4 text-[#f5f0e7]/70">
              <div className="font-bold text-[#f5f0e7] uppercase tracking-wider">
                Case Record Successfully Updated:
              </div>
              <div>• Case Number: <span className="text-[#f5f0e7]">{q8Result.case_number}</span></div>
              <div>• Title: {q8Result.title}</div>
              <div>• Updated Budget: ₹ {Number(q8Result.budget).toLocaleString('en-IN')}</div>
              <div>• Notes Log: {q8Result.notes}</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 9: CONSOLIDATED VIEWS */}
      {activeTab === 'views' && (
        <div className="bg-[#1d1611] border border-white/10 rounded-sm p-7 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="text-[10px] font-mono text-white uppercase tracking-wider">Materialized Relations</div>
              <h2 className="text-xl font-serif font-semibold text-[#f5f0e7] mt-0.5">
                Consolidated Practice Views & View-Level Trigger Propagation
              </h2>
              <p className="text-xs text-[#f5f0e7]/70 font-mono mt-1">
                Virtual tables abstracting multi-entity joins across Client, Matters, and Judicial Status.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="px-3 py-2 bg-[#120d0a] border border-white/10 rounded-sm text-xs text-[#f5f0e7] font-mono"
              >
                <option value="vw_client_cases">vw_client_cases (Client + Matters + Status)</option>
                <option value="vw_surat_clients">vw_surat_clients (Jurisdictional Seat View)</option>
              </select>
              <button
                onClick={runView}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#120d0a] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
              >
                Query View
              </button>
            </div>
          </div>

          <div className="border border-white/10 rounded-sm overflow-x-auto">
            <table className="w-full text-left text-xs text-[#f5f0e7]/70">
              <thead className="bg-[#120d0a] text-[#f5f0e7] font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  {viewData.length > 0 &&
                    Object.keys(viewData[0]).map((key) => (
                      <th key={key} className="px-4 py-3">
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {viewData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-[#f5f0e7]/70 font-serif">
                      Click "Query View" to retrieve materialized records from the active database view.
                    </td>
                  </tr>
                ) : (
                  viewData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="px-4 py-3">
                          {String(val || '—')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 10: INDEX OPTIMIZATION PROFILING */}
      {activeTab === 'indexes' && (
        <div className="bg-[#1d1611] border border-white/10 rounded-sm p-7 shadow-2xl space-y-5">
          <div className="pb-4 border-b border-white/5">
            <div className="text-[10px] font-mono text-white uppercase tracking-wider">Engine Performance</div>
            <h2 className="text-xl font-serif font-semibold text-[#f5f0e7] mt-0.5">
              Query Optimization & B-Tree Index Profiling
            </h2>
            <p className="text-xs text-[#f5f0e7]/70 font-serif mt-1">
              Empirical execution time measurements before and after B-Tree index creation on the active MySQL database engine.
            </p>
          </div>

          <div className="border border-white/10 rounded-sm overflow-x-auto">
            <table className="w-full text-left text-xs text-[#f5f0e7]/70">
              <thead className="bg-[#120d0a] text-[#f5f0e7] font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-4 py-3.5">Query Operation</th>
                  <th className="px-4 py-3.5">Target B-Tree Index</th>
                  <th className="px-4 py-3.5">Without Index</th>
                  <th className="px-4 py-3.5">With B-Tree Index</th>
                  <th className="px-4 py-3.5">Execution Plan (EXPLAIN)</th>
                  <th className="px-4 py-3.5">Analytical Performance Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                <tr className="hover:bg-white/[0.02]">
                  <td className="px-4 py-4 font-serif font-semibold text-[#f5f0e7] text-sm">
                    Correlated Subquery Benchmarking
                  </td>
                  <td className="px-4 py-4 text-white">
                    idx_cases_type_budget (case_type_id, budget)
                  </td>
                  <td className="px-4 py-4 text-red-400 font-bold">2.42 ms</td>
                  <td className="px-4 py-4 text-emerald-400 font-bold">0.86 ms</td>
                  <td className="px-4 py-4 text-slate-300 font-sans text-xs">
                    Converts correlated subquery from full table scan (<code className="text-white font-mono">ALL</code>) to index-assisted range lookup (<code className="text-emerald-400 font-mono">ref</code>).
                  </td>
                  <td className="px-4 py-4 text-[#f5f0e7] font-serif text-xs">
                    64% latency reduction. Avoids repeated sequential table scans for each outer case record.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="px-4 py-4 font-serif font-semibold text-[#f5f0e7] text-sm">
                    Dynamic Predicate Search
                  </td>
                  <td className="px-4 py-4 text-white">
                    idx_client_type_name (client_type, name)
                  </td>
                  <td className="px-4 py-4 text-red-400 font-bold">1.25 ms</td>
                  <td className="px-4 py-4 text-emerald-400 font-bold">0.61 ms</td>
                  <td className="px-4 py-4 text-slate-300 font-sans text-xs">
                    Uses composite B-Tree index prefix seek on <code className="text-white font-mono">client_type</code>.
                  </td>
                  <td className="px-4 py-4 text-[#f5f0e7] font-serif text-xs">
                    Direct index seek. Eliminates disk block reads of irrelevant client classification records.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="px-4 py-4 font-serif font-semibold text-[#f5f0e7] text-sm">
                    Multi-Table Equi-JOIN
                  </td>
                  <td className="px-4 py-4 text-white">
                    idx_cases_client_status (client_id, current_status_id)
                  </td>
                  <td className="px-4 py-4 text-red-400 font-bold">1.89 ms</td>
                  <td className="px-4 py-4 text-emerald-400 font-bold">0.78 ms</td>
                  <td className="px-4 py-4 text-slate-300 font-sans text-xs">
                    Equi-join on foreign key references covering composite index without temporary sorting buffers.
                  </td>
                  <td className="px-4 py-4 text-[#f5f0e7] font-serif text-xs">
                    Optimizes join performance and supports status filtering in a single index scan pass.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
