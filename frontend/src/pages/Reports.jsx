import React, { useState } from 'react';
import { reportService } from '../services/api';
import {
  PageHeader,
  MagneticButton
} from '../components/ui';
import {
  Play,
  AlertCircle,
  CheckCircle2,
  Table2
} from 'lucide-react';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('joins');

  // Shared status state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Tab 1: Cross-Entity Joins
  const [q5Table1, setQ5Table1] = useState('CLIENT');
  const [q5Table2, setQ5Table2] = useState('CASES');
  const [q5JoinType, setQ5JoinType] = useState('INNER');
  const [q5Data, setQ5Data] = useState([]);

  // Tab 2: Consolidated Views
  const [selectedView, setSelectedView] = useState('vw_client_cases');
  const [viewData, setViewData] = useState([]);

  // Tab 3: Relational Insertion (Q2)
  const [q2Form, setQ2Form] = useState({
    client_name: '',
    client_type: 'Individual',
    client_phone: '',
    client_email: '',
    client_address: '',
    case_title: '',
    case_type_id: 1,
    budget: 150000,
    priority: 'Medium'
  });
  const [q2Result, setQ2Result] = useState(null);

  // Tab 4: Relational Update (Q8)
  const [q8Form, setQ8Form] = useState({
    case_id: 2,
    budget: 650000,
    notes: 'Budget revised and approved per chambers conference.'
  });
  const [q8Result, setQ8Result] = useState(null);

  const TABLE2_OPTIONS = {
    CLIENT: ['CASES'],
    CASES: ['CASE_TYPE', 'CASE_STATUS'],
    HEARING: ['COURT'],
    PAYMENT: ['PAYMENT_METHOD']
  };

  const handleTable1Change = (t1) => {
    setQ5Table1(t1);
    const available = TABLE2_OPTIONS[t1] || ['CASES'];
    setQ5Table2(available[0]);
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setError(null);
    setSuccess(null);
  };

  // Execute Relational Joins
  const runQuery5 = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getQuery5(q5Table1, q5Table2, q5JoinType);
      setQ5Data(res.data.data || []);
      setSuccess(`Report generated successfully with ${res.data.data?.length || 0} matching records.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Relational join operation failed.');
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
      setSuccess(`Practice view loaded successfully with ${res.data.data?.length || 0} records.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to query consolidated database view.');
    } finally {
      setLoading(false);
    }
  };

  const handleQ2Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setQ2Result(null);
    try {
      const res = await reportService.postQuery2(q2Form);
      setQ2Result(res.data.data);
      setSuccess(res.data.message || 'Records successfully inserted maintaining integrity constraints.');
    } catch (err) {
      setError(err.response?.data?.message || 'Relational insertion failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQ8Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setQ8Result(null);
    try {
      const res = await reportService.putQuery8(q8Form);
      setQ8Result(res.data.data);
      setSuccess(res.data.message || 'Case record successfully updated maintaining relational integrity.');
    } catch (err) {
      setError(err.response?.data?.message || 'Relational update failed.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'joins', label: 'Cross-Entity Reports (Joins)' },
    { id: 'views', label: 'Consolidated Practice Views' },
    { id: 'q2', label: 'Relational Insertion (Q2)' },
    { id: 'q8', label: 'Relational Update (Q8)' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Cross-Entity Reports & Practice Intelligence"
        subtitle="Generate cross-entity relational reports across legal matters, clients, cause lists, and consolidated views."
        category="Reports"
      />

      {/* Tabs Navigation */}
      <div className="court-card p-1.5 flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 rounded-xs text-xs font-mono transition-all duration-150 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-brass text-ink font-semibold shadow-xs'
                : 'text-silver hover:text-ivory hover:bg-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 bg-court-danger/20 border border-court-danger/50 rounded-xs text-red-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-court-success/20 border border-court-success/50 rounded-xs text-emerald-300 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* TAB 1: RELATIONAL JOINS */}
      {activeTab === 'joins' && (
        <div className="court-card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brass/15">
            <div>
              <div className="text-[10px] font-mono text-brass uppercase tracking-wider">Multi-Entity Analytics</div>
              <h2 className="text-lg font-serif font-medium text-ivory mt-0.5">
                Cross-Entity Relational JOIN Report
              </h2>
              <p className="text-xs text-silver/60 font-sans mt-1">
                Correlate records between primary and secondary Chambers entities with relational join operations.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-silver/60">Entity 1:</span>
                <select
                  value={q5Table1}
                  onChange={(e) => handleTable1Change(e.target.value)}
                  className="court-input px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                >
                  <option value="CLIENT">CLIENT</option>
                  <option value="CASES">CASES</option>
                  <option value="HEARING">HEARING</option>
                  <option value="PAYMENT">PAYMENT</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-silver/60">Join:</span>
                <select
                  value={q5JoinType}
                  onChange={(e) => setQ5JoinType(e.target.value)}
                  className="court-input px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                >
                  <option value="INNER">INNER JOIN</option>
                  <option value="LEFT">LEFT OUTER JOIN</option>
                  <option value="RIGHT">RIGHT OUTER JOIN</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-silver/60">Entity 2:</span>
                <select
                  value={q5Table2}
                  onChange={(e) => setQ5Table2(e.target.value)}
                  className="court-input px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                >
                  {(TABLE2_OPTIONS[q5Table1] || ['CASES']).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <MagneticButton
                variant="brass"
                size="sm"
                onClick={runQuery5}
                disabled={loading}
                icon={Play}
                iconPosition="left"
                className="text-xs font-mono uppercase tracking-wider"
              >
                Generate Report
              </MagneticButton>
            </div>
          </div>

          <div className="court-table-container">
            <table className="court-table">
              <thead>
                <tr>
                  {q5Data.length > 0 ? (
                    Object.keys(q5Data[0]).map((col) => (
                      <th key={col} className="uppercase font-mono text-[11px] whitespace-nowrap">
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))
                  ) : (
                    <>
                      <th>Primary Identifier</th>
                      <th>Primary Title / Name</th>
                      <th>Linked Entity Number</th>
                      <th>Linked Title</th>
                      <th>Classification</th>
                      <th>Financial Metric</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {q5Data.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-silver/60 font-serif">
                      Select entity parameters above and click "Generate Report" to correlate data across Chambers records.
                    </td>
                  </tr>
                ) : (
                  q5Data.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="text-xs font-mono text-ivory whitespace-nowrap">
                          {val === null || val === undefined ? '—' : String(val)}
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

      {/* TAB 2: CONSOLIDATED VIEWS */}
      {activeTab === 'views' && (
        <div className="court-card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brass/15">
            <div>
              <div className="text-[10px] font-mono text-brass uppercase tracking-wider">Database Intelligence</div>
              <h2 className="text-lg font-serif font-medium text-ivory mt-0.5">
                Consolidated Practice Views
              </h2>
              <p className="text-xs text-silver/60 font-sans mt-1">
                Standardized relational views aggregating client dockets, practice areas, and judicial status.
              </p>
            </div>
            <div className="flex items-center space-x-2.5">
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="court-input px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
              >
                <option value="vw_client_cases">Client Matter Directory (vw_client_cases)</option>
                <option value="vw_surat_clients">Jurisdictional Seat Register (vw_surat_clients)</option>
              </select>
              <MagneticButton
                variant="brass"
                size="sm"
                onClick={runView}
                disabled={loading}
                icon={Table2}
                iconPosition="left"
                className="text-xs font-mono uppercase tracking-wider"
              >
                Load Practice View
              </MagneticButton>
            </div>
          </div>

          <div className="court-table-container">
            <table className="court-table">
              <thead>
                <tr>
                  {viewData.length > 0 &&
                    Object.keys(viewData[0]).map((key) => (
                      <th key={key} className="uppercase font-mono text-[11px] whitespace-nowrap">
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {viewData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-silver/60 font-serif">
                      Click "Load Practice View" to retrieve consolidated records from the active view.
                    </td>
                  </tr>
                ) : (
                  viewData.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="text-xs font-mono text-ivory whitespace-nowrap">
                          {val === null || val === undefined ? '—' : String(val)}
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

      {/* TAB 3: RELATIONAL INSERTION (Q2) */}
      {activeTab === 'q2' && (
        <div className="court-card p-6 space-y-5">
          <div className="pb-4 border-b border-brass/15">
            <div className="text-[10px] font-mono text-brass uppercase tracking-wider">Assignment 11.2 & Query 2</div>
            <h2 className="text-lg font-serif font-medium text-ivory mt-0.5">
              Atomic Relational Insertion Maintaining Referential Integrity
            </h2>
            <p className="text-xs text-silver/60 font-sans mt-1">
              Atomically creates a primary client record and links a dependent legal matter within a transaction boundary.
            </p>
          </div>

          <form onSubmit={handleQ2Submit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                  Client Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={q2Form.client_name}
                  onChange={(e) => setQ2Form({ ...q2Form, client_name: e.target.value })}
                  placeholder="e.g. Ramesh Patel"
                  className="court-input w-full px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                  Client Classification
                </label>
                <select
                  value={q2Form.client_type}
                  onChange={(e) => setQ2Form({ ...q2Form, client_type: e.target.value })}
                  className="court-input w-full px-3.5 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                >
                  <option value="Individual">Individual</option>
                  <option value="Corporate">Corporate Entity</option>
                  <option value="Government">Government / Public Body</option>
                  <option value="NGO">Non-Profit / Society</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={q2Form.client_phone}
                  onChange={(e) => setQ2Form({ ...q2Form, client_phone: e.target.value })}
                  placeholder="+91 98250 12345"
                  className="court-input w-full px-3.5 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={q2Form.client_email}
                  onChange={(e) => setQ2Form({ ...q2Form, client_email: e.target.value })}
                  placeholder="rpatel@example.com"
                  className="court-input w-full px-3.5 py-2 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                Client Chamber Address
              </label>
              <input
                type="text"
                value={q2Form.client_address}
                onChange={(e) => setQ2Form({ ...q2Form, client_address: e.target.value })}
                placeholder="402 Court Chambers, Nanpura, Surat"
                className="court-input w-full px-3.5 py-2 text-xs"
              />
            </div>

            <div className="pt-2 border-t border-brass/10">
              <div className="text-[10px] font-mono text-brass uppercase tracking-wider mb-3">
                Dependent Linked Matter Information (FK Integrity)
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                  Matter Title *
                </label>
                <input
                  type="text"
                  required
                  value={q2Form.case_title}
                  onChange={(e) => setQ2Form({ ...q2Form, case_title: e.target.value })}
                  placeholder="e.g. Special Civil Suit for Specific Performance"
                  className="court-input w-full px-3.5 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                  Practice Area
                </label>
                <select
                  value={q2Form.case_type_id}
                  onChange={(e) => setQ2Form({ ...q2Form, case_type_id: Number(e.target.value) })}
                  className="court-input w-full px-3.5 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                >
                  <option value={1}>Civil Litigation</option>
                  <option value={2}>Criminal Defense</option>
                  <option value={3}>Constitutional / Writ</option>
                  <option value={4}>Corporate & Commercial</option>
                  <option value={5}>Family & Succession</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                  Matter Budget (INR)
                </label>
                <input
                  type="number"
                  value={q2Form.budget}
                  onChange={(e) => setQ2Form({ ...q2Form, budget: parseFloat(e.target.value) || 0 })}
                  className="court-input w-full px-3.5 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                  Docket Priority
                </label>
                <select
                  value={q2Form.priority}
                  onChange={(e) => setQ2Form({ ...q2Form, priority: e.target.value })}
                  className="court-input w-full px-3.5 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <MagneticButton
                type="submit"
                variant="brass"
                size="md"
                disabled={loading}
                icon={Play}
                iconPosition="left"
                className="text-xs font-mono uppercase tracking-wider"
              >
                Execute Relational Insert (Q2)
              </MagneticButton>
            </div>
          </form>

          {q2Result && (
            <div className="p-4 bg-charcoal border border-brass/30 rounded-xs space-y-2 mt-4 max-w-2xl">
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                Transaction Committed Successfully
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div>
                  <span className="text-silver/60">Client ID:</span> <span className="text-ivory font-bold">{q2Result.client_id}</span>
                </div>
                <div>
                  <span className="text-silver/60">Case ID:</span> <span className="text-ivory font-bold">{q2Result.case_id}</span>
                </div>
                <div>
                  <span className="text-silver/60">Docket:</span> <span className="text-brass font-bold">{q2Result.case_number}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RELATIONAL UPDATE (Q8) */}
      {activeTab === 'q8' && (
        <div className="court-card p-6 space-y-5">
          <div className="pb-4 border-b border-brass/15">
            <div className="text-[10px] font-mono text-brass uppercase tracking-wider">Assignment 11.8 & Query 8</div>
            <h2 className="text-lg font-serif font-medium text-ivory mt-0.5">
              Relational Update Maintaining Domain & State Constraints
            </h2>
            <p className="text-xs text-silver/60 font-sans mt-1">
              Executes a targeted UPDATE statement modifying financial estimates and appending audit notes.
            </p>
          </div>

          <form onSubmit={handleQ8Submit} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                Target Legal Matter ID *
              </label>
              <input
                type="number"
                required
                value={q8Form.case_id}
                onChange={(e) => setQ8Form({ ...q8Form, case_id: parseInt(e.target.value) || 2 })}
                placeholder="2"
                className="court-input w-full px-3.5 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                Revised Budget Estimate (INR) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={q8Form.budget}
                onChange={(e) => setQ8Form({ ...q8Form, budget: parseFloat(e.target.value) || 0 })}
                placeholder="650000.00"
                className="court-input w-full px-3.5 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                Audit Remarks & Reason for Revision
              </label>
              <textarea
                rows={3}
                value={q8Form.notes}
                onChange={(e) => setQ8Form({ ...q8Form, notes: e.target.value })}
                placeholder="Senior counsel fee adjustment agreed upon in Chambers conference..."
                className="court-input w-full px-3.5 py-2 text-xs"
              />
            </div>

            <div className="pt-2">
              <MagneticButton
                type="submit"
                variant="brass"
                size="md"
                disabled={loading}
                icon={Play}
                iconPosition="left"
                className="text-xs font-mono uppercase tracking-wider"
              >
                Execute Relational Update (Q8)
              </MagneticButton>
            </div>
          </form>

          {q8Result && (
            <div className="p-4 bg-charcoal border border-brass/30 rounded-xs space-y-2 mt-4 max-w-xl">
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                Case Record Updated
              </div>
              <div className="text-xs font-mono text-ivory">
                <div><span className="text-silver/60">Matter:</span> {q8Result.case_number} — {q8Result.title}</div>
                <div><span className="text-silver/60">New Budget:</span> ₹{Number(q8Result.budget).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                <div className="truncate"><span className="text-silver/60">Notes:</span> {q8Result.notes}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
