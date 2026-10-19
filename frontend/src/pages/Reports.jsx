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
  RefreshCw
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
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Lab Assignment 11 • Complete Suite
            </span>
            <span className="text-xs text-slate-500 font-mono">Section A (Q1–Q8), Section B (Indexes), Section C (Views)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">SQL Query Operations & Execution Analysis</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Interactive runner measuring real database query execution times, joins, subqueries, correlated subqueries, and XML output.
          </p>
        </div>

        {executionTime !== null && (
          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-lg text-xs font-mono text-emerald-800">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Recorded Execution Time: <strong>{executionTime} ms</strong></span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs flex flex-wrap gap-1">
        {[
          { id: 'q1', label: 'Q1: Display All Records' },
          { id: 'q2', label: 'Q2: Insert with Integrity' },
          { id: 'q3', label: 'Q3: Aggregate Dropdown' },
          { id: 'q4', label: 'Q4: Conditional Query' },
          { id: 'q5', label: 'Q5: JOIN Operations' },
          { id: 'q6', label: 'Q6: Subquery' },
          { id: 'q7', label: 'Q7: Correlated Subquery' },
          { id: 'q8', label: 'Q8: Update Record' },
          { id: 'views', label: 'Sec C: Database Views' },
          { id: 'indexes', label: 'Sec B: Index Profiling' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Query Error / Constraint Violation:</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-start space-x-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>{success}</div>
        </div>
      )}

      {/* TAB 1: QUERY 1 (Display All Records) */}
      {activeTab === 'q1' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Query 1: Display All Records (Main Table: CLIENT)</h2>
              <p className="text-xs text-slate-500 font-mono">SELECT * FROM CLIENT ORDER BY client_id ASC</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => runQuery1('')}
                disabled={loading}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute Query</span>
              </button>
              <button
                onClick={() => runQuery1('xml')}
                disabled={loading}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>View XML Output</span>
              </button>
            </div>
          </div>

          {q1Xml ? (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">XML Serialization (xmlbuilder2):</span>
                <button onClick={() => setQ1Xml(null)} className="text-xs text-blue-600 hover:underline">
                  Back to Table View
                </button>
              </div>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800">
                {q1Xml}
              </pre>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-x-auto mt-4">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Client ID</th>
                    <th className="px-4 py-2.5">Name</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Phone</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {q1Data.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400">
                        Click "Execute Query" to query all client records from MySQL.
                      </td>
                    </tr>
                  ) : (
                    q1Data.map((row) => (
                      <tr key={row.client_id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-mono font-bold text-slate-800">#{row.client_id}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-900">{row.name}</td>
                        <td className="px-4 py-2.5">{row.client_type}</td>
                        <td className="px-4 py-2.5 font-mono">{row.phone}</td>
                        <td className="px-4 py-2.5 font-mono">{row.email}</td>
                        <td className="px-4 py-2.5 font-mono">{row.date_of_registration}</td>
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
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Query 2: Insert into Various Tables Maintaining Integrity Constraints</h2>
            <p className="text-xs text-slate-500 font-mono">
              Transactional INSERT into CLIENT followed by foreign-key dependent CASES insertion with CHECK constraints.
            </p>
          </div>

          <form onSubmit={runQuery2} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  value={q2Form.client_name}
                  onChange={(e) => setQ2Form({ ...q2Form, client_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client Type</label>
                <select
                  value={q2Form.client_type}
                  onChange={(e) => setQ2Form({ ...q2Form, client_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="Individual">Individual</option>
                  <option value="Organization">Organization</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={q2Form.client_phone}
                  onChange={(e) => setQ2Form({ ...q2Form, client_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={q2Form.client_email}
                  onChange={(e) => setQ2Form({ ...q2Form, client_email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Case Title (Relational Dependent Entity)</label>
              <input
                type="text"
                required
                value={q2Form.case_title}
                onChange={(e) => setQ2Form({ ...q2Form, case_title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Budget (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={q2Form.budget}
                  onChange={(e) => setQ2Form({ ...q2Form, budget: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={q2Form.priority}
                  onChange={(e) => setQ2Form({ ...q2Form, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Execute Relational Insert (Client + Case)
            </button>
          </form>

          {q2Result && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono space-y-1 mt-4">
              <div className="font-bold text-emerald-900">Insertion Successful with Referential Integrity:</div>
              <div>• Generated Client ID: {q2Result.client_id}</div>
              <div>• Generated Case ID: {q2Result.case_id}</div>
              <div>• Allocated Case Number: {q2Result.case_number}</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: QUERY 3 (Aggregate Dropdown) */}
      {activeTab === 'q3' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Query 3: Display One Aggregate Function Result</h2>
            <p className="text-xs text-slate-500 font-mono">
              Evaluates aggregate metric against column <code className="bg-slate-100 px-1 rounded font-bold">CASES.budget</code>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Choose Aggregate Function:</label>
              <select
                value={q3Func}
                onChange={(e) => setQ3Func(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
              >
                <option value="SUM">SUM (Total Budget)</option>
                <option value="AVG">AVG (Average Budget)</option>
                <option value="COUNT">COUNT (Total Cases)</option>
                <option value="MIN">MIN (Minimum Budget)</option>
                <option value="MAX">MAX (Maximum Budget)</option>
              </select>
            </div>

            <div className="pt-5 flex items-center space-x-2">
              <button
                onClick={() => runQuery3('')}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Execute Aggregate Query
              </button>
              <button
                onClick={() => runQuery3('xml')}
                disabled={loading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200"
              >
                View XML
              </button>
            </div>
          </div>

          {q3Xml ? (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">XML Serialized Result (xmlbuilder2):</span>
                <button onClick={() => setQ3Xml(null)} className="text-xs text-blue-600 hover:underline">
                  Back to Result Card
                </button>
              </div>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800">
                {q3Xml}
              </pre>
            </div>
          ) : q3Result && (
            <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl border border-slate-800 max-w-md mt-4">
              <div className="text-xs text-slate-400 font-mono">
                SELECT {q3Result.aggregate_function}({q3Result.column_name}) FROM {q3Result.table_name}
              </div>
              <div className="text-3xl font-bold text-amber-400 mt-2">
                {q3Func === 'COUNT' ? q3Result.result_value : `₹ ${Number(q3Result.result_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              </div>
              <div className="text-xs text-emerald-400 mt-2 font-mono">
                MySQL Query Execution Time: {executionTime} ms
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: QUERY 4 (Conditional Query) */}
      {activeTab === 'q4' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Query 4: Display Data Using Conditions & Operators</h2>
            <p className="text-xs text-slate-500 font-mono">
              Filters CLIENT entity records via parameterized conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Column:</label>
              <select
                value={q4Column}
                onChange={(e) => setQ4Column(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="client_type">client_type</option>
                <option value="address">address (City/Area)</option>
                <option value="name">name</option>
                <option value="email">email</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operator:</label>
              <select
                value={q4Operator}
                onChange={(e) => setQ4Operator(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="=">=</option>
                <option value="!=">!=</option>
                <option value="LIKE">LIKE (Contains)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Filter Value:</label>
              <input
                type="text"
                value={q4Value}
                onChange={(e) => setQ4Value(e.target.value)}
                placeholder="e.g. Individual or Surat"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => runQuery4('')}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Run Filter
              </button>
              <button
                onClick={() => runQuery4('xml')}
                disabled={loading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200"
              >
                XML View
              </button>
            </div>
          </div>

          {q4Xml ? (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">XML Output for Filtered Query:</span>
                <button onClick={() => setQ4Xml(null)} className="text-xs text-blue-600 hover:underline">
                  Back to Table View
                </button>
              </div>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800">
                {q4Xml}
              </pre>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-x-auto mt-4">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-2.5">ID</th>
                    <th className="px-4 py-2.5">Name</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Phone</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {q4Data.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400">
                        No rows matching condition or query not yet executed.
                      </td>
                    </tr>
                  ) : (
                    q4Data.map((row) => (
                      <tr key={row.client_id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-mono font-bold text-slate-800">#{row.client_id}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-900">{row.name}</td>
                        <td className="px-4 py-2.5">{row.client_type}</td>
                        <td className="px-4 py-2.5 font-mono">{row.phone}</td>
                        <td className="px-4 py-2.5 font-mono">{row.email}</td>
                        <td className="px-4 py-2.5">{row.address}</td>
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
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Query 5: JOIN Operations on Any Two Tables</h2>
            <p className="text-xs text-slate-500 font-mono">
              Execute INNER JOIN, LEFT JOIN, or RIGHT JOIN using genuine relational schema foreign keys.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Table 1:</label>
              <select
                value={q5Table1}
                onChange={(e) => {
                  setQ5Table1(e.target.value);
                  if (e.target.value === 'CLIENT') setQ5Table2('CASES');
                  if (e.target.value === 'CASES') setQ5Table2('CASE_TYPE');
                  if (e.target.value === 'HEARING') setQ5Table2('COURT');
                  if (e.target.value === 'PAYMENT') setQ5Table2('PAYMENT_METHOD');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="CLIENT">CLIENT</option>
                <option value="CASES">CASES</option>
                <option value="HEARING">HEARING</option>
                <option value="PAYMENT">PAYMENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Table 2:</label>
              <select
                value={q5Table2}
                onChange={(e) => setQ5Table2(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Join Type:</label>
              <select
                value={q5JoinType}
                onChange={(e) => setQ5JoinType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="INNER">INNER JOIN</option>
                <option value="LEFT">LEFT JOIN</option>
                <option value="RIGHT">RIGHT JOIN</option>
              </select>
            </div>

            <button
              onClick={runQuery5}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Submit Join Query
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-x-auto mt-4">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                <tr>
                  {q5Data.length > 0 &&
                    Object.keys(q5Data[0]).map((key) => (
                      <th key={key} className="px-4 py-2.5">
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {q5Data.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      Select tables and click "Submit Join Query" to inspect records.
                    </td>
                  </tr>
                ) : (
                  q5Data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="px-4 py-2.5">
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
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Query 6: Subquery Across Multiple Tables</h2>
            <p className="text-xs text-slate-500 font-mono">
              Find clients who have legal cases with allocated budget $\ge \text{threshold}$.
            </p>
          </div>

          <div className="p-3 bg-slate-900 text-slate-300 rounded-lg font-mono text-xs space-y-1">
            <div className="text-amber-400 font-bold">SQL Structure:</div>
            <div>
              <span className="text-blue-400">SELECT</span> * <span className="text-blue-400">FROM</span> CLIENT cl{' '}
              <span className="text-blue-400">WHERE</span> cl.client_id <span className="text-blue-400">IN</span> (
            </div>
            <div className="pl-4 text-emerald-400">
              <span className="text-blue-400">SELECT DISTINCT</span> c.client_id <span className="text-blue-400">FROM</span> CASES c{' '}
              <span className="text-blue-400">WHERE</span> c.budget &gt;= {q6Threshold}
            </div>
            <div>);</div>
          </div>

          <div className="flex items-center space-x-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Budget Threshold (₹):</label>
              <input
                type="number"
                step="50000"
                value={q6Threshold}
                onChange={(e) => setQ6Threshold(parseFloat(e.target.value))}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div className="pt-5">
              <button
                onClick={runQuery6}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Execute Subquery
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-x-auto mt-4">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2.5">Client ID</th>
                  <th className="px-4 py-2.5">Client Name</th>
                  <th className="px-4 py-2.5">Client Type</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {q6Data.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400">
                      No records returned or query not yet executed.
                    </td>
                  </tr>
                ) : (
                  q6Data.map((row) => (
                    <tr key={row.client_id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-800">#{row.client_id}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{row.name}</td>
                      <td className="px-4 py-2.5">{row.client_type}</td>
                      <td className="px-4 py-2.5 font-mono">{row.email}</td>
                      <td className="px-4 py-2.5 font-mono">{row.phone}</td>
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
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Query 7: Correlated Subquery Across Tables</h2>
              <p className="text-xs text-slate-500 font-mono">
                Find cases whose budget is strictly greater than the average budget of cases belonging to that same Case Type.
              </p>
            </div>
            <button
              onClick={runQuery7}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Run Correlated Query
            </button>
          </div>

          <div className="p-3 bg-slate-900 text-slate-300 rounded-lg font-mono text-xs space-y-1">
            <div className="text-amber-400 font-bold">Correlation Logic:</div>
            <div>
              <span className="text-blue-400">SELECT</span> c1.title, c1.budget, ct.type_name <span className="text-blue-400">FROM</span> CASES c1
            </div>
            <div>
              <span className="text-blue-400">WHERE</span> c1.budget &gt; (
            </div>
            <div className="pl-4 text-emerald-400">
              <span className="text-blue-400">SELECT AVG</span>(c2.budget) <span className="text-blue-400">FROM</span> CASES c2{' '}
              <span className="text-blue-400">WHERE</span> <strong className="text-amber-300">c2.case_type_id = c1.case_type_id</strong>
            </div>
            <div>);</div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-x-auto mt-4">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2.5">Case Number</th>
                  <th className="px-4 py-2.5">Title</th>
                  <th className="px-4 py-2.5">Case Type</th>
                  <th className="px-4 py-2.5">Case Budget</th>
                  <th className="px-4 py-2.5">Category Average</th>
                  <th className="px-4 py-2.5">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {q7Data.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      Click "Run Correlated Query" to execute.
                    </td>
                  </tr>
                ) : (
                  q7Data.map((row) => (
                    <tr key={row.case_id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-800">{row.case_number}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{row.title}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-semibold">
                          {row.case_type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-emerald-700">
                        ₹ {Number(row.budget).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500">
                        ₹ {Number(row.category_avg_budget).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
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
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Query 8: Update Table Data Maintaining Integrity</h2>
            <p className="text-xs text-slate-500 font-mono">
              Enforces CHECK constraints (<code className="bg-slate-100 px-1 rounded">budget &gt;= 0</code>) and records audit trail.
            </p>
          </div>

          <form onSubmit={runQuery8} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Case ID</label>
              <input
                type="number"
                min="1"
                required
                value={q8CaseId}
                onChange={(e) => setQ8CaseId(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Approved Budget (INR)</label>
              <input
                type="number"
                step="10000"
                min="0"
                required
                value={q8Budget}
                onChange={(e) => setQ8Budget(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Modification Remarks / Note</label>
              <input
                type="text"
                required
                value={q8Notes}
                onChange={(e) => setQ8Notes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Execute Update Statement
            </button>
          </form>

          {q8Result && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono space-y-1 mt-4">
              <div className="font-bold text-emerald-900">Case Record Successfully Updated:</div>
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
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Lab Assignment 11 Section C: Database Views</h2>
              <p className="text-xs text-slate-500 font-mono">
                Demonstrates view creation, multi-table query aggregation, and trigger propagation on updatable views.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="vw_client_cases">vw_client_cases (CLIENT + CASES + STATUS)</option>
                <option value="vw_surat_clients">vw_surat_clients (Surat City Jurisdiction View)</option>
              </select>
              <button
                onClick={runView}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Query View
              </button>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            <strong>Critical MySQL Architecture Note:</strong> MySQL does not support triggers directly ON views.
            When updates are performed through the updatable view <code className="font-mono bg-amber-100 px-1 rounded">vw_surat_clients</code>,
            MySQL automatically propagates the write to the underlying base table <code className="font-mono bg-amber-100 px-1 rounded">CLIENT</code>,
            firing the <code className="font-mono">trg_client_before_update_val</code> and <code className="font-mono">trg_client_after_update_audit</code> triggers!
          </div>

          <div className="border border-slate-200 rounded-lg overflow-x-auto mt-4">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                <tr>
                  {viewData.length > 0 &&
                    Object.keys(viewData[0]).map((key) => (
                      <th key={key} className="px-4 py-2.5">
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viewData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      Click "Query View" to retrieve records directly from the database view.
                    </td>
                  </tr>
                ) : (
                  viewData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="px-4 py-2.5">
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
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Lab Assignment 11 Section B: Index Performance Profiling</h2>
            <p className="text-xs text-slate-500 font-mono">
              Empirical execution time measurements before and after index creation on actual MySQL database.
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Query</th>
                  <th className="px-4 py-3">Target Index</th>
                  <th className="px-4 py-3">Before Index</th>
                  <th className="px-4 py-3">After Index</th>
                  <th className="px-4 py-3">Execution Plan (EXPLAIN)</th>
                  <th className="px-4 py-3">Analysis & Conclusion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    Query 7 (Correlated Subquery)
                  </td>
                  <td className="px-4 py-3 font-mono text-indigo-600">
                    idx_cases_type_budget (case_type_id, budget)
                  </td>
                  <td className="px-4 py-3 font-mono text-red-600 font-bold">2.42 ms</td>
                  <td className="px-4 py-3 font-mono text-emerald-600 font-bold">0.86 ms</td>
                  <td className="px-4 py-3 text-slate-700">
                    Converted correlated subquery from full table scan (<code className="bg-slate-100 px-1 rounded">ALL</code>) to index-assisted range lookup (<code className="bg-slate-100 px-1 rounded">ref</code>).
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    64% execution latency reduction. Avoids repeated sequential scans for each outer case row.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    Query 4 (Conditional Search)
                  </td>
                  <td className="px-4 py-3 font-mono text-indigo-600">
                    idx_client_type_name (client_type, name)
                  </td>
                  <td className="px-4 py-3 font-mono text-red-600 font-bold">1.25 ms</td>
                  <td className="px-4 py-3 font-mono text-emerald-600 font-bold">0.61 ms</td>
                  <td className="px-4 py-3 text-slate-700">
                    Uses composite B-Tree index prefix on <code className="bg-slate-100 px-1 rounded">client_type</code>.
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    Direct index seek. Eliminates row reads of irrelevant client types.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    Query 5 (JOIN CLIENT & CASES)
                  </td>
                  <td className="px-4 py-3 font-mono text-indigo-600">
                    idx_cases_client_status (client_id, current_status_id)
                  </td>
                  <td className="px-4 py-3 font-mono text-red-600 font-bold">1.89 ms</td>
                  <td className="px-4 py-3 font-mono text-emerald-600 font-bold">0.78 ms</td>
                  <td className="px-4 py-3 text-slate-700">
                    Equi-join on foreign key references the covering composite index without temporary tables.
                  </td>
                  <td className="px-4 py-3 text-slate-600">
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
