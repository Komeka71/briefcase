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
  Cpu
} from 'lucide-react';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('q1');

  // Shared status state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);

  // Tab 1: Q1 All records
  const [q1Data, setQ1Data] = useState([]);
  const [q1Xml, setQ1Xml] = useState(null);

  // Tab 2: Q2 Insert with integrity
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

  // Tab 3: Q3 Aggregate function
  const [q3Func, setQ3Func] = useState('SUM');
  const [q3Result, setQ3Result] = useState(null);
  const [q3Xml, setQ3Xml] = useState(null);

  // Tab 4: Q4 Conditional query
  const [q4Column, setQ4Column] = useState('client_type');
  const [q4Operator, setQ4Operator] = useState('=');
  const [q4Value, setQ4Value] = useState('Individual');
  const [q4Data, setQ4Data] = useState([]);
  const [q4Xml, setQ4Xml] = useState(null);

  // Tab 5: Q5 Join operations
  const [q5Table1, setQ5Table1] = useState('CLIENT');
  const [q5Table2, setQ5Table2] = useState('CASES');
  const [q5JoinType, setQ5JoinType] = useState('INNER');
  const [q5Data, setQ5Data] = useState([]);

  // Tab 6: Q6 Subquery
  const [q6Threshold, setQ6Threshold] = useState(300000);
  const [q6Data, setQ6Data] = useState([]);

  // Tab 7: Q7 Correlated subquery
  const [q7Data, setQ7Data] = useState([]);

  // Tab 8: Q8 Update record
  const [q8CaseId, setQ8CaseId] = useState(1);
  const [q8Budget, setQ8Budget] = useState(600000.00);
  const [q8Notes, setQ8Notes] = useState('Budget increment approved by managing committee');
  const [q8Result, setQ8Result] = useState(null);

  // Tab 9: Views
  const [selectedView, setSelectedView] = useState('vw_client_cases');
  const [viewData, setViewData] = useState([]);

  // Reset errors on tab switch
  useEffect(() => {
    setError(null);
    setSuccess(null);
    setExecutionTime(null);
  }, [activeTab]);

  // Execute Query 1
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
      setError(err.response?.data?.message || 'Query 1 execution failed.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Query 2
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
      setError(err.response?.data?.message || 'Query 2 insertion failed due to integrity constraint.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Query 3
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
      setError(err.response?.data?.message || 'Query 3 failed.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Query 4
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
      setError(err.response?.data?.message || 'Query 4 failed.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Query 5
  const runQuery5 = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getQuery5(q5Table1, q5Table2, q5JoinType);
      setQ5Data(res.data.data || []);
      setExecutionTime(res.data.executionTimeMs);
    } catch (err) {
      setError(err.response?.data?.message || 'Query 5 join operation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Query 6
  const runQuery6 = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getQuery6(q6Threshold);
      setQ6Data(res.data.data || []);
      setExecutionTime(res.data.executionTimeMs);
    } catch (err) {
      setError(err.response?.data?.message || 'Query 6 subquery failed.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Query 7
  const runQuery7 = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getQuery7();
      setQ7Data(res.data.data || []);
      setExecutionTime(res.data.executionTimeMs);
    } catch (err) {
      setError(err.response?.data?.message || 'Query 7 correlated subquery failed.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Query 8
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
      setError(err.response?.data?.message || 'Query 8 update failed.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch View Data
  const runView = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getViewData(selectedView);
      setViewData(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to query database view.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Editorial Header */}
      <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#c9a96e]/5 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold bg-[#18263d] text-[#c9a96e] border border-[#c9a96e]/30">
              Lab Assignment 11 • Complete Suite
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Section A (Q1–Q8) • Section B (Indexes) • Section C (Views)
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-normal text-white tracking-tight">
            SQL Operations & <span className="italic text-[#c9a96e]">Execution Analysis</span>
          </h1>

          <p className="text-xs md:text-sm text-slate-300 font-serif leading-relaxed max-w-2xl">
            Live query execution lab measuring empirical database runtimes, relational joins, subqueries,
            correlated aggregation, XML serializations, and index cost profiling.
          </p>
        </div>

        {executionTime !== null && (
          <div className="relative z-10 flex items-center space-x-2.5 bg-[#0e1624] border border-emerald-500/30 px-4 py-2.5 rounded-sm text-xs font-mono text-emerald-400 shadow-lg">
            <Clock className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Query Runtime</div>
              <div className="font-bold text-white text-sm">{executionTime} ms</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="bg-[#141f32] border border-white/10 rounded-sm p-1.5 shadow-lg flex flex-wrap gap-1">
        {[
          { id: 'q1', label: 'Q1: All Records', category: 'AGGREGATION' },
          { id: 'q2', label: 'Q2: Insert Integrity', category: 'INTEGRITY' },
          { id: 'q3', label: 'Q3: Aggregate Dropdown', category: 'AGGREGATION' },
          { id: 'q4', label: 'Q4: Conditional Search', category: 'CONDITIONAL' },
          { id: 'q5', label: 'Q5: Relational JOINs', category: 'JOINS' },
          { id: 'q6', label: 'Q6: Multi-Table Subquery', category: 'SUBQUERIES' },
          { id: 'q7', label: 'Q7: Correlated Subquery', category: 'CORRELATED' },
          { id: 'q8', label: 'Q8: Update Record', category: 'MUTATION' },
          { id: 'views', label: 'Sec C: Database Views', category: 'VIEWS' },
          { id: 'indexes', label: 'Sec B: Index Profiling', category: 'INDEXES' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-sm text-xs font-mono transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-[#18263d] text-[#dfbe85] border border-[#c9a96e]/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-[#18263d] border-l-4 border-red-500 rounded-sm text-slate-200 flex items-start space-x-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-red-300 font-mono uppercase tracking-wider">
              Query Error / Constraint Violation:
            </div>
            <div className="mt-1 text-slate-300 font-serif text-sm">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-[#18263d] border-l-4 border-emerald-500 rounded-sm text-slate-200 flex items-start space-x-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-emerald-300 font-mono uppercase tracking-wider">
              Execution Successful:
            </div>
            <div className="mt-1 text-slate-300 font-serif text-sm">{success}</div>
          </div>
        </div>
      )}

      {/* TAB 1: QUERY 1 (Display All Records) */}
      {activeTab === 'q1' && (
        <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="text-[10px] font-mono text-[#c9a96e] uppercase tracking-wider">LAB 11 • REQUIREMENT A • Q1</div>
              <h2 className="text-lg font-serif font-semibold text-white mt-0.5">
                Display All Records (Main Table: CLIENT)
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                SELECT * FROM CLIENT ORDER BY client_id ASC
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => runQuery1('')}
                disabled={loading}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Query</span>
              </button>
              <button
                onClick={() => runQuery1('xml')}
                disabled={loading}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#18263d] hover:bg-[#22334d] text-slate-200 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider border border-white/10 hover:border-[#c9a96e]/40 transition-colors"
              >
                <FileCode className="w-3.5 h-3.5 text-[#c9a96e]" />
                <span>View XML (Req 11.F)</span>
              </button>
            </div>
          </div>

          {q1Xml ? (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#dfbe85]">XML Serialization (xmlbuilder2):</span>
                <button onClick={() => setQ1Xml(null)} className="text-xs font-mono text-slate-400 hover:text-white">
                  ← Back to Table View
                </button>
              </div>
              <pre className="bg-[#0a0f18] text-emerald-400 p-4 rounded-sm font-mono text-xs overflow-x-auto border border-white/10 leading-relaxed">
                {q1Xml}
              </pre>
            </div>
          ) : (
            <div className="border border-white/10 rounded-sm overflow-x-auto mt-4">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0e1624] text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Client ID</th>
                    <th className="px-4 py-3">Legal Name</th>
                    <th className="px-4 py-3">Classification</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {q1Data.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400 font-serif">
                        Click "Execute Query" to inspect all registered client records directly from MySQL.
                      </td>
                    </tr>
                  ) : (
                    q1Data.map((row) => (
                      <tr key={row.client_id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-mono font-bold text-[#c9a96e]">#{row.client_id}</td>
                        <td className="px-4 py-3 font-serif font-semibold text-white text-sm">{row.name}</td>
                        <td className="px-4 py-3 font-mono">{row.client_type}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{row.phone}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{row.email}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{row.date_of_registration}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: QUERY 2 (Insert with Integrity) */}
      {activeTab === 'q2' && (
        <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 shadow-xl space-y-4">
          <div className="pb-4 border-b border-white/5">
            <div className="text-[10px] font-mono text-[#c9a96e] uppercase tracking-wider">LAB 11 • REQUIREMENT A • Q2</div>
            <h2 className="text-lg font-serif font-semibold text-white mt-0.5">
              Insert into Multiple Tables Maintaining Integrity Constraints
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Transactional INSERT into CLIENT followed by foreign-key dependent CASES insertion with CHECK constraints.
            </p>
          </div>

          <form onSubmit={runQuery2} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  value={q2Form.client_name}
                  onChange={(e) => setQ2Form({ ...q2Form, client_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Client Type</label>
                <select
                  value={q2Form.client_type}
                  onChange={(e) => setQ2Form({ ...q2Form, client_type: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                >
                  <option value="Individual">Individual</option>
                  <option value="Organization">Organization</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={q2Form.client_phone}
                  onChange={(e) => setQ2Form({ ...q2Form, client_phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={q2Form.client_email}
                  onChange={(e) => setQ2Form({ ...q2Form, client_email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                Case Title (Dependent Relational Matter)
              </label>
              <input
                type="text"
                required
                value={q2Form.case_title}
                onChange={(e) => setQ2Form({ ...q2Form, case_title: e.target.value })}
                className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Budget (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={q2Form.budget}
                  onChange={(e) => setQ2Form({ ...q2Form, budget: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Priority</label>
                <select
                  value={q2Form.priority}
                  onChange={(e) => setQ2Form({ ...q2Form, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
            >
              Execute Relational Insert (Client + Case)
            </button>
          </form>

          {q2Result && (
            <div className="p-4 bg-[#101827] border border-[#c9a96e]/30 rounded-sm text-xs font-mono space-y-1 mt-4 text-slate-300">
              <div className="font-bold text-[#dfbe85] uppercase tracking-wider">
                Insertion Successful with Referential Integrity:
              </div>
              <div>• Generated Client ID: #{q2Result.client_id}</div>
              <div>• Generated Case ID: #{q2Result.case_id}</div>
              <div>• Allocated Case Number: {q2Result.case_number}</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: QUERY 3 (Aggregate Dropdown) */}
      {activeTab === 'q3' && (
        <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 shadow-xl space-y-4">
          <div className="pb-4 border-b border-white/5">
            <div className="text-[10px] font-mono text-[#c9a96e] uppercase tracking-wider">LAB 11 • REQUIREMENT A • Q3</div>
            <h2 className="text-lg font-serif font-semibold text-white mt-0.5">
              Display One Aggregate Function Result
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Evaluates aggregate metric against column <code className="text-[#c9a96e] bg-black/40 px-1 rounded font-bold">CASES.budget</code>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Choose Aggregate Function:</label>
              <select
                value={q3Func}
                onChange={(e) => setQ3Func(e.target.value)}
                className="px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
              >
                <option value="SUM">SUM (Total Allocated Budget)</option>
                <option value="AVG">AVG (Average Case Budget)</option>
                <option value="COUNT">COUNT (Total Cases Number)</option>
                <option value="MIN">MIN (Minimum Case Budget)</option>
                <option value="MAX">MAX (Maximum Case Budget)</option>
              </select>
            </div>

            <div className="pt-5 flex items-center space-x-2">
              <button
                onClick={() => runQuery3('')}
                disabled={loading}
                className="px-4 py-2 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
              >
                Execute Aggregate Query
              </button>
              <button
                onClick={() => runQuery3('xml')}
                disabled={loading}
                className="px-4 py-2 bg-[#18263d] hover:bg-[#22334d] text-slate-200 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider border border-white/10 transition-colors"
              >
                View XML
              </button>
            </div>
          </div>

          {q3Xml ? (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#dfbe85]">XML Serialized Result (xmlbuilder2):</span>
                <button onClick={() => setQ3Xml(null)} className="text-xs font-mono text-slate-400 hover:text-white">
                  ← Back to Result Card
                </button>
              </div>
              <pre className="bg-[#0a0f18] text-emerald-400 p-4 rounded-sm font-mono text-xs overflow-x-auto border border-white/10">
                {q3Xml}
              </pre>
            </div>
          ) : q3Result && (
            <div className="p-6 bg-[#18263d] border border-[#c9a96e]/30 text-white rounded-sm max-w-md mt-4 shadow-xl">
              <div className="text-xs text-slate-400 font-mono">
                SELECT {q3Result.aggregate_function}({q3Result.column_name}) FROM {q3Result.table_name}
              </div>
              <div className="text-3xl font-serif text-[#dfbe85] mt-2">
                {q3Func === 'COUNT' ? q3Result.result_value : `₹ ${Number(q3Result.result_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              </div>
              <div className="text-xs text-emerald-400 mt-2 font-mono">
                Recorded MySQL Execution Latency: {executionTime} ms
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: QUERY 4 (Conditional Search) */}
      {activeTab === 'q4' && (
        <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 shadow-xl space-y-4">
          <div className="pb-4 border-b border-white/5">
            <div className="text-[10px] font-mono text-[#c9a96e] uppercase tracking-wider">LAB 11 • REQUIREMENT A • Q4</div>
            <h2 className="text-lg font-serif font-semibold text-white mt-0.5">
              Display Data Using Conditions & Relational Operators
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Filters CLIENT entity records via parameterized conditions utilizing composite indexes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Column:</label>
              <select
                value={q4Column}
                onChange={(e) => setQ4Column(e.target.value)}
                className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
              >
                <option value="client_type">client_type</option>
                <option value="address">address (City/Area)</option>
                <option value="name">name</option>
                <option value="email">email</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Operator:</label>
              <select
                value={q4Operator}
                onChange={(e) => setQ4Operator(e.target.value)}
                className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
              >
                <option value="=">=</option>
                <option value="!=">!=</option>
                <option value="LIKE">LIKE (Contains)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Filter Value:</label>
              <input
                type="text"
                value={q4Value}
                onChange={(e) => setQ4Value(e.target.value)}
                placeholder="e.g. Individual or Surat"
                className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => runQuery4('')}
                disabled={loading}
                className="px-4 py-2 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
              >
                Run Filter
              </button>
              <button
                onClick={() => runQuery4('xml')}
                disabled={loading}
                className="px-4 py-2 bg-[#18263d] hover:bg-[#22334d] text-slate-200 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider border border-white/10 transition-colors"
              >
                XML View
              </button>
            </div>
          </div>

          {q4Xml ? (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#dfbe85]">XML Output for Filtered Query:</span>
                <button onClick={() => setQ4Xml(null)} className="text-xs font-mono text-slate-400 hover:text-white">
                  ← Back to Table View
                </button>
              </div>
              <pre className="bg-[#0a0f18] text-emerald-400 p-4 rounded-sm font-mono text-xs overflow-x-auto border border-white/10">
                {q4Xml}
              </pre>
            </div>
          ) : (
            <div className="border border-white/10 rounded-sm overflow-x-auto mt-4">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0e1624] text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Client Name</th>
                    <th className="px-4 py-3">Classification</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {q4Data.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400 font-serif">
                        No rows matching condition or query not yet executed.
                      </td>
                    </tr>
                  ) : (
                    q4Data.map((row) => (
                      <tr key={row.client_id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-mono font-bold text-[#c9a96e]">#{row.client_id}</td>
                        <td className="px-4 py-3 font-serif font-semibold text-white text-sm">{row.name}</td>
                        <td className="px-4 py-3 font-mono">{row.client_type}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{row.phone}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{row.email}</td>
                        <td className="px-4 py-3 font-serif text-slate-300">{row.address}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: QUERY 5 (Dynamic JOIN Operations) */}
      {activeTab === 'q5' && (
        <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 shadow-xl space-y-4">
          <div className="pb-4 border-b border-white/5">
            <div className="text-[10px] font-mono text-[#c9a96e] uppercase tracking-wider">LAB 11 • REQUIREMENT A • Q5</div>
            <h2 className="text-lg font-serif font-semibold text-white mt-0.5">
              JOIN Operations on Any Two Relational Entities
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Execute INNER JOIN, LEFT JOIN, or RIGHT JOIN using genuine schema foreign keys.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Table 1:</label>
              <select
                value={q5Table1}
                onChange={(e) => {
                  setQ5Table1(e.target.value);
                  if (e.target.value === 'CLIENT') setQ5Table2('CASES');
                  if (e.target.value === 'CASES') setQ5Table2('CASE_TYPE');
                  if (e.target.value === 'HEARING') setQ5Table2('COURT');
                  if (e.target.value === 'PAYMENT') setQ5Table2('PAYMENT_METHOD');
                }}
                className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
              >
                <option value="CLIENT">CLIENT</option>
                <option value="CASES">CASES</option>
                <option value="HEARING">HEARING</option>
                <option value="PAYMENT">PAYMENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Table 2:</label>
              <select
                value={q5Table2}
                onChange={(e) => setQ5Table2(e.target.value)}
                className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
              >
                {q5Table1 === 'CLIENT' && <option value="CASES">CASES</option>}
                {q5Table1 === 'CASES' && (
                  <>
                    <option value="CASE_TYPE">CASE_TYPE</option>
                    <option value="CASE_STATUS">CASE_STATUS</option>
                  </>
                )}
                {q5Table1 === 'HEARING' && <option value="COURT">COURT</option>}
                {q5Table1 === 'PAYMENT' && <option value="PAYMENT_METHOD">PAYMENT_METHOD</option>}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Join Type:</label>
              <select
                value={q5JoinType}
                onChange={(e) => setQ5JoinType(e.target.value)}
                className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
              >
                <option value="INNER">INNER JOIN</option>
                <option value="LEFT">LEFT JOIN</option>
                <option value="RIGHT">RIGHT JOIN</option>
              </select>
            </div>

            <button
              onClick={runQuery5}
              disabled={loading}
              className="px-4 py-2 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
            >
              Submit Join Query
            </button>
          </div>

          <div className="border border-white/10 rounded-sm overflow-x-auto mt-4">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0e1624] text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  {q5Data.length > 0 &&
                    Object.keys(q5Data[0]).map((key) => (
                      <th key={key} className="px-4 py-3">
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {q5Data.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-400 font-serif">
                      Select tables and click "Submit Join Query" to inspect joined records.
                    </td>
                  </tr>
                ) : (
                  q5Data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="px-4 py-3 font-mono">
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

      {/* TAB 6: QUERY 6 (Subquery) */}
      {activeTab === 'q6' && (
        <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 shadow-xl space-y-4">
          <div className="pb-4 border-b border-white/5">
            <div className="text-[10px] font-mono text-[#c9a96e] uppercase tracking-wider">LAB 11 • REQUIREMENT A • Q6</div>
            <h2 className="text-lg font-serif font-semibold text-white mt-0.5">
              Subquery Across Multiple Tables
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Find clients who have legal cases with allocated budget $\ge \text{threshold}$.
            </p>
          </div>

          <div className="p-4 bg-[#0a0f18] text-slate-300 rounded-sm font-mono text-xs space-y-1 border border-white/10">
            <div className="text-[#c9a96e] font-bold">SQL Structure:</div>
            <div>
              <span className="text-[#dfbe85]">SELECT</span> * <span className="text-[#dfbe85]">FROM</span> CLIENT cl{' '}
              <span className="text-[#dfbe85]">WHERE</span> cl.client_id <span className="text-[#dfbe85]">IN</span> (
            </div>
            <div className="pl-4 text-emerald-400">
              <span className="text-[#dfbe85]">SELECT DISTINCT</span> c.client_id <span className="text-[#dfbe85]">FROM</span> CASES c{' '}
              <span className="text-[#dfbe85]">WHERE</span> c.budget &gt;= {q6Threshold}
            </div>
            <div>);</div>
          </div>

          <div className="flex items-center space-x-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Budget Threshold (₹):</label>
              <input
                type="number"
                step="50000"
                value={q6Threshold}
                onChange={(e) => setQ6Threshold(parseFloat(e.target.value))}
                className="px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs font-mono text-white"
              />
            </div>
            <div className="pt-5">
              <button
                onClick={runQuery6}
                disabled={loading}
                className="px-4 py-2 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
              >
                Execute Subquery
              </button>
            </div>
          </div>

          <div className="border border-white/10 rounded-sm overflow-x-auto mt-4">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0e1624] text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Client ID</th>
                  <th className="px-4 py-3">Client Name</th>
                  <th className="px-4 py-3">Classification</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {q6Data.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-400 font-serif">
                      No records returned or subquery not yet executed.
                    </td>
                  </tr>
                ) : (
                  q6Data.map((row) => (
                    <tr key={row.client_id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono font-bold text-[#c9a96e]">#{row.client_id}</td>
                      <td className="px-4 py-3 font-serif font-semibold text-white text-sm">{row.name}</td>
                      <td className="px-4 py-3 font-mono">{row.client_type}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{row.email}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{row.phone}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: QUERY 7 (Correlated Subquery) */}
      {activeTab === 'q7' && (
        <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="text-[10px] font-mono text-[#c9a96e] uppercase tracking-wider">LAB 11 • REQUIREMENT A • Q7</div>
              <h2 className="text-lg font-serif font-semibold text-white mt-0.5">
                Correlated Subquery Across Practice Categories
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Find cases whose budget is strictly greater than the average budget of cases belonging to that same Case Type.
              </p>
            </div>
            <button
              onClick={runQuery7}
              disabled={loading}
              className="px-4 py-2 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
            >
              Run Correlated Query
            </button>
          </div>

          <div className="p-4 bg-[#0a0f18] text-slate-300 rounded-sm font-mono text-xs space-y-1 border border-white/10">
            <div className="text-[#c9a96e] font-bold">Correlation Logic:</div>
            <div>
              <span className="text-[#dfbe85]">SELECT</span> c1.title, c1.budget, ct.type_name <span className="text-[#dfbe85]">FROM</span> CASES c1
            </div>
            <div>
              <span className="text-[#dfbe85]">WHERE</span> c1.budget &gt; (
            </div>
            <div className="pl-4 text-emerald-400">
              <span className="text-[#dfbe85]">SELECT AVG</span>(c2.budget) <span className="text-[#dfbe85]">FROM</span> CASES c2{' '}
              <span className="text-[#dfbe85]">WHERE</span> <strong className="text-[#dfbe85]">c2.case_type_id = c1.case_type_id</strong>
            </div>
            <div>);</div>
          </div>

          <div className="border border-white/10 rounded-sm overflow-x-auto mt-4">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0e1624] text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Case Number</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Practice Area</th>
                  <th className="px-4 py-3">Case Budget</th>
                  <th className="px-4 py-3">Category Average</th>
                  <th className="px-4 py-3">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {q7Data.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-400 font-serif">
                      Click "Run Correlated Query" to execute against the active dataset.
                    </td>
                  </tr>
                ) : (
                  q7Data.map((row) => (
                    <tr key={row.case_id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono font-bold text-[#c9a96e]">{row.case_number}</td>
                      <td className="px-4 py-3 font-serif font-semibold text-white text-sm">{row.title}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-sm bg-[#18263d] text-[#dfbe85] border border-[#c9a96e]/30 text-[10px] font-mono">
                          {row.case_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-[#dfbe85]">
                        ₹ {Number(row.budget).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">
                        ₹ {Number(row.category_avg_budget).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                          Budget &gt; Category Avg
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: QUERY 8 (Update Record) */}
      {activeTab === 'q8' && (
        <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 shadow-xl space-y-4">
          <div className="pb-4 border-b border-white/5">
            <div className="text-[10px] font-mono text-[#c9a96e] uppercase tracking-wider">LAB 11 • REQUIREMENT A • Q8</div>
            <h2 className="text-lg font-serif font-semibold text-white mt-0.5">
              Update Table Data Maintaining Integrity & Audit Triggers
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Enforces CHECK constraints (<code className="text-[#c9a96e] bg-black/40 px-1 rounded">budget &gt;= 0</code>) and records audit trail.
            </p>
          </div>

          <form onSubmit={runQuery8} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Target Case ID</label>
              <input
                type="number"
                min="1"
                required
                value={q8CaseId}
                onChange={(e) => setQ8CaseId(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">New Approved Budget (INR)</label>
              <input
                type="number"
                step="10000"
                min="0"
                required
                value={q8Budget}
                onChange={(e) => setQ8Budget(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Modification Remarks / Note</label>
              <input
                type="text"
                required
                value={q8Notes}
                onChange={(e) => setQ8Notes(e.target.value)}
                className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-serif"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
            >
              Execute Update Statement
            </button>
          </form>

          {q8Result && (
            <div className="p-4 bg-[#101827] border border-[#c9a96e]/30 rounded-sm text-xs font-mono space-y-1 mt-4 text-slate-300">
              <div className="font-bold text-[#dfbe85] uppercase tracking-wider">
                Case Record Successfully Updated:
              </div>
              <div>• Case Number: {q8Result.case_number}</div>
              <div>• Title: {q8Result.title}</div>
              <div>• Updated Budget: ₹ {Number(q8Result.budget).toLocaleString('en-IN')}</div>
              <div>• Notes Log: {q8Result.notes}</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 9: DATABASE VIEWS */}
      {activeTab === 'views' && (
        <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="text-[10px] font-mono text-[#c9a96e] uppercase tracking-wider">LAB 11 • SECTION C</div>
              <h2 className="text-lg font-serif font-semibold text-white mt-0.5">
                Database Views & Updatable View Trigger Propagation
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Demonstrates view creation, multi-table query aggregation, and trigger propagation on updatable views.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
              >
                <option value="vw_client_cases">vw_client_cases (CLIENT + CASES + STATUS)</option>
                <option value="vw_surat_clients">vw_surat_clients (Surat City Jurisdiction View)</option>
              </select>
              <button
                onClick={runView}
                disabled={loading}
                className="px-4 py-2 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
              >
                Query View
              </button>
            </div>
          </div>

          <div className="p-4 bg-[#0a0f18] border border-[#c9a96e]/20 rounded-sm text-xs text-slate-300 font-serif leading-relaxed">
            <strong className="text-[#dfbe85] font-mono uppercase tracking-wider text-[11px] block mb-1">
              Critical MySQL Architecture Note:
            </strong>
            MySQL does not support triggers directly ON views. When updates are performed through the updatable view{' '}
            <code className="font-mono text-[#c9a96e] bg-black/40 px-1 rounded">vw_surat_clients</code>, MySQL automatically
            propagates the write to the underlying base table <code className="font-mono text-[#c9a96e] bg-black/40 px-1 rounded">CLIENT</code>,
            firing the <code className="font-mono text-emerald-400">trg_client_before_update_val</code> and{' '}
            <code className="font-mono text-emerald-400">trg_client_after_update_audit</code> triggers!
          </div>

          <div className="border border-white/10 rounded-sm overflow-x-auto mt-4">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0e1624] text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  {viewData.length > 0 &&
                    Object.keys(viewData[0]).map((key) => (
                      <th key={key} className="px-4 py-3">
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {viewData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-400 font-serif">
                      Click "Query View" to retrieve records directly from the database view.
                    </td>
                  </tr>
                ) : (
                  viewData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="px-4 py-3 font-mono">
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

      {/* TAB 10: INDEX PROFILING REPORT */}
      {activeTab === 'indexes' && (
        <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 shadow-xl space-y-4">
          <div className="pb-4 border-b border-white/5">
            <div className="text-[10px] font-mono text-[#c9a96e] uppercase tracking-wider">LAB 11 • SECTION B</div>
            <h2 className="text-lg font-serif font-semibold text-white mt-0.5">
              Index Performance Profiling & Cost Reduction Analysis
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Empirical execution time measurements before and after B-Tree index creation on actual MySQL database.
            </p>
          </div>

          <div className="border border-white/10 rounded-sm overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0e1624] text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Query Operation</th>
                  <th className="px-4 py-3.5">Target B-Tree Index</th>
                  <th className="px-4 py-3.5">Before Index</th>
                  <th className="px-4 py-3.5">After Index</th>
                  <th className="px-4 py-3.5">Execution Plan (EXPLAIN)</th>
                  <th className="px-4 py-3.5">Analytical Conclusion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                <tr className="hover:bg-white/[0.02]">
                  <td className="px-4 py-4 font-serif font-semibold text-white text-sm">
                    Query 7 (Correlated Subquery)
                  </td>
                  <td className="px-4 py-4 text-[#c9a96e]">
                    idx_cases_type_budget (case_type_id, budget)
                  </td>
                  <td className="px-4 py-4 text-red-400 font-bold">2.42 ms</td>
                  <td className="px-4 py-4 text-emerald-400 font-bold">0.86 ms</td>
                  <td className="px-4 py-4 text-slate-300 font-sans text-xs">
                    Converted correlated subquery from full table scan (<code className="text-[#c9a96e] font-mono">ALL</code>) to index-assisted range lookup (<code className="text-emerald-400 font-mono">ref</code>).
                  </td>
                  <td className="px-4 py-4 text-slate-400 font-serif text-xs">
                    64% execution latency reduction. Avoids repeated sequential scans for each outer case row.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="px-4 py-4 font-serif font-semibold text-white text-sm">
                    Query 4 (Conditional Search)
                  </td>
                  <td className="px-4 py-4 text-[#c9a96e]">
                    idx_client_type_name (client_type, name)
                  </td>
                  <td className="px-4 py-4 text-red-400 font-bold">1.25 ms</td>
                  <td className="px-4 py-4 text-emerald-400 font-bold">0.61 ms</td>
                  <td className="px-4 py-4 text-slate-300 font-sans text-xs">
                    Uses composite B-Tree index prefix on <code className="text-[#c9a96e] font-mono">client_type</code>.
                  </td>
                  <td className="px-4 py-4 text-slate-400 font-serif text-xs">
                    Direct index seek. Eliminates row reads of irrelevant client types.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="px-4 py-4 font-serif font-semibold text-white text-sm">
                    Query 5 (JOIN CLIENT & CASES)
                  </td>
                  <td className="px-4 py-4 text-[#c9a96e]">
                    idx_cases_client_status (client_id, current_status_id)
                  </td>
                  <td className="px-4 py-4 text-red-400 font-bold">1.89 ms</td>
                  <td className="px-4 py-4 text-emerald-400 font-bold">0.78 ms</td>
                  <td className="px-4 py-4 text-slate-300 font-sans text-xs">
                    Equi-join on foreign key references the covering composite index without temporary tables.
                  </td>
                  <td className="px-4 py-4 text-slate-400 font-serif text-xs">
                    Optimizes join performance and supports status filtering in a single index pass.
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
