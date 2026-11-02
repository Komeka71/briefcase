import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { caseService, reportService, lawyerService } from '../services/api';
import {
  PageHeader,
  MagneticButton,
  StatusPill,
  EmptyState,
  Skeleton
} from '../components/ui';
import { getRole } from '../lib/auth';
import { EASE_EXPO } from '../lib/motion';
import {
  Briefcase,
  Search,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
  Scale,
  FileCode,
  Copy,
  Check
} from 'lucide-react';

export default function Cases() {
  const role = getRole();
  const isAdmin = role === 'Admin';
  const isLawyer = role === 'Lawyer';
  const canEdit = isAdmin || isLawyer;

  const [cases, setCases] = useState([]);
  const [refData, setRefData] = useState({ caseTypes: [], caseStatuses: [], clients: [], lawyers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Counsel allocation in dossier modal
  const [newCounselId, setNewCounselId] = useState('');
  const [newCounselRole, setNewCounselRole] = useState('Associate Counsel');
  const [isPrimaryCounsel, setIsPrimaryCounsel] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [subqueryFilter, setSubqueryFilter] = useState('');

  // Financial Aggregate state (SUM, AVG, COUNT, MIN, MAX on budget)
  const [aggregateFunc, setAggregateFunc] = useState('SUM');
  const [aggregateValue, setAggregateValue] = useState(null);
  const [aggregateLoading, setAggregateLoading] = useState(false);

  // XML Modal state
  const [xmlModalOpen, setXmlModalOpen] = useState(false);
  const [xmlContent, setXmlContent] = useState('');
  const [copiedXml, setCopiedXml] = useState(false);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState(() => ({
    case_number: '',
    title: '',
    description: '',
    case_type_id: 1,
    client_id: 1,
    current_status_id: 1,
    priority: 'Medium',
    budget: 150000.00,
    filed_date: new Date().toISOString().split('T')[0],
    expected_closure_date: '',
    notes: ''
  }));

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await caseService.getAll({
        status: statusFilter,
        type: typeFilter,
        priority: priorityFilter,
        search
      });
      setCases(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cases.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, priorityFilter, search]);

  const fetchAggregate = useCallback(async (func = aggregateFunc) => {
    setAggregateLoading(true);
    try {
      const res = await reportService.getQuery3(func, 'budget', 'CASES');
      const d = res.data.data;
      if (!d || d.result_value === null || d.result_value === undefined) {
        setAggregateValue(d?.message || '—');
      } else if (d.case_number) {
        setAggregateValue(`₹${Number(d.result_value).toLocaleString('en-IN', { maximumFractionDigits: 2 })} (${d.case_number})`);
      } else {
        setAggregateValue(d.result_value);
      }
    } catch (err) {
      console.warn('Failed to calculate aggregate:', err.message);
    } finally {
      setAggregateLoading(false);
    }
  }, [aggregateFunc]);

  useEffect(() => {
    fetchAggregate('SUM');
  }, [fetchAggregate]);

  const handleSubqueryChange = async (val) => {
    setSubqueryFilter(val);
    if (!val) {
      fetchCases();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (val === 'high_value') {
        const res = await reportService.getQuery6(300000, 'cases');
        setCases(res.data.data || []);
      } else if (val === 'above_average') {
        const res = await reportService.getQuery7();
        setCases(res.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Filter query failed.');
    } finally {
      setLoading(false);
    }
  };

  const exportAggregateXml = async () => {
    try {
      const res = await reportService.getQuery3(aggregateFunc, 'budget', 'CASES', 'xml');
      setXmlContent(res.data);
      setXmlModalOpen(true);
      setCopiedXml(false);
    } catch {
      setError('XML serialization failed.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedXml(true);
    setTimeout(() => setCopiedXml(false), 2000);
  };

  const fetchReferenceData = async () => {
    try {
      const [res, lwRes] = await Promise.all([
        caseService.getReferenceData(),
        lawyerService.getAll()
      ]);
      setRefData({
        caseTypes: res.data.data?.caseTypes || [],
        caseStatuses: res.data.data?.caseStatuses || [],
        clients: res.data.data?.clients || [],
        lawyers: lwRes.data.data || res.data.data?.lawyers || []
      });
    } catch (err) {
      console.warn('Could not load reference data:', err.message);
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const viewDetails = async (id) => {
    try {
      const res = await caseService.getById(id);
      setSelectedCase(res.data.data);
      setDetailsModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch case details.');
    }
  };

  const handleAssignCounsel = async (e) => {
    e.preventDefault();
    if (!newCounselId || !selectedCase) return;
    try {
      await caseService.assignCounsel(selectedCase.case_id, {
        lawyer_id: newCounselId,
        role: newCounselRole,
        is_primary: isPrimaryCounsel
      });
      setSuccess('Counsel assigned to matter successfully.');
      setNewCounselId('');
      setIsPrimaryCounsel(false);
      viewDetails(selectedCase.case_id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign counsel.');
    }
  };

  const handleRemoveCounsel = async (caseId, lawyerId) => {
    if (!window.confirm('Remove counsel representation from this matter?')) return;
    try {
      await caseService.removeCounsel(caseId, lawyerId);
      setSuccess('Counsel representation revoked.');
      viewDetails(caseId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove counsel.');
    }
  };

  const resetForm = () => {
    setFormData({
      case_number: '',
      title: '',
      description: '',
      case_type_id: 1,
      client_id: refData.clients[0]?.client_id || 1,
      current_status_id: 1,
      priority: 'Medium',
      budget: 150000.00,
      filed_date: new Date().toISOString().split('T')[0],
      expected_closure_date: '',
      notes: ''
    });
    setEditId(null);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (isEditing) {
        await caseService.update(editId, formData);
        setSuccess('Legal matter updated successfully.');
      } else {
        await caseService.create(formData);
        setSuccess('New legal matter registered successfully.');
      }
      setModalOpen(false);
      resetForm();
      fetchCases();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed.');
    }
  };

  const openAdd = () => {
    resetForm();
    setIsEditing(false);
    setFormData((prev) => ({
      ...prev,
      case_number: `CASE/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`
    }));
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setFormData({
      case_number: c.case_number,
      title: c.title,
      description: c.description || '',
      case_type_id: c.case_type_id || 1,
      client_id: c.client_id,
      current_status_id: c.current_status_id || 1,
      priority: c.priority || 'Medium',
      budget: parseFloat(c.budget || 0),
      filed_date: c.filed_date || '',
      expected_closure_date: c.expected_closure_date || '',
      notes: c.notes || ''
    });
    setEditId(c.case_id);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete case #${id}?\nDependent documents, billing invoices, or hearings may restrict deletion.`)) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await caseService.delete(id);
      setSuccess('Case deleted successfully.');
      fetchCases();
    } catch (err) {
      setError(err.response?.data?.message || 'Referential integrity check blocked deletion.');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <PageHeader
        title="Legal Cases & Litigation Dockets"
        subtitle="Manage matter lifecycles, allocated retainer budgets, assigned chambers counsel rosters, and cause list schedules."
        category="Litigation Hub"
        badge="Dockets Active"
        actions={
          isAdmin ? (
            <MagneticButton
              variant="brass"
              size="md"
              onClick={openAdd}
              icon={Plus}
              iconPosition="left"
              className="text-xs font-mono uppercase tracking-wider"
            >
              Register New Matter
            </MagneticButton>
          ) : undefined
        }
      />

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

      {/* Filter Toolbar */}
      <div className="court-card p-4 flex flex-wrap items-center gap-3.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-steel absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by case number, title, or client..."
            className="court-input w-full pl-10 pr-4 py-2 text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="court-input px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
        >
          <option value="">All Statuses</option>
          {refData.caseStatuses.map((s) => (
            <option key={s.status_id} value={s.status_name}>{s.status_name}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="court-input px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
        >
          <option value="">All Practice Areas</option>
          {refData.caseTypes.map((t) => (
            <option key={t.type_id} value={t.type_name}>{t.type_name}</option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="court-input px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
        >
          <option value="">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        <select
          value={subqueryFilter}
          onChange={(e) => handleSubqueryChange(e.target.value)}
          className="court-input px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer text-brass"
        >
          <option value="">Standard View</option>
          <option value="high_value">High-Value Matters (&gt; ₹3,00,000)</option>
          <option value="above_average">Above Average for Practice Area</option>
        </select>
      </div>

      {/* Financial Aggregate Summary & XML Export Bar */}
      <div className="court-card p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Scale className="w-4 h-4 text-brass" />
          <span className="font-serif font-medium text-ivory">Budget Analytics:</span>
          <select
            value={aggregateFunc}
            onChange={(e) => {
              const fn = e.target.value;
              setAggregateFunc(fn);
              fetchAggregate(fn);
            }}
            className="court-input px-2.5 py-1 text-xs font-mono bg-charcoal cursor-pointer"
          >
            <option value="SUM">Total Budget (SUM)</option>
            <option value="AVG">Average Budget (AVG)</option>
            <option value="COUNT">Matter Count (COUNT)</option>
            <option value="MIN">Minimum Budget (MIN)</option>
            <option value="MAX">Maximum Budget (MAX)</option>
          </select>
          <span className="font-mono font-bold text-brass px-2.5 py-1 bg-graphite rounded border border-brass/20">
            {aggregateLoading ? 'Computing...' : (
              typeof aggregateValue === 'number'
                ? (aggregateFunc === 'COUNT' ? aggregateValue : `₹${Number(aggregateValue).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`)
                : (aggregateValue ? String(aggregateValue) : '—')
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={exportAggregateXml}
          className="court-btn-outline px-3 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 rounded text-brass cursor-pointer"
          title="Export aggregate metric as XML"
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Export XML</span>
        </button>
      </div>

      {/* Cases Table */}
      <div className="court-table-container">
        <table className="court-table">
          <thead>
            <tr>
              <th>Case Number</th>
              <th>Matter Title</th>
              <th>Client Representation</th>
              <th>Practice Domain</th>
              <th>Docket Status</th>
              <th>Priority</th>
              <th>Budget (INR)</th>
              <th>Filed Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="py-8">
                  <Skeleton rows={4} height="h-6" />
                </td>
              </tr>
            ) : cases.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState
                    icon={Scale}
                    title="No legal matters found"
                    description="No case dockets matched your current search parameters."
                    actionLabel="Register New Matter"
                    onAction={openAdd}
                  />
                </td>
              </tr>
            ) : (
              cases.map((c) => (
                <tr key={c.case_id}>
                  <td className="font-mono text-xs font-medium text-brass">
                    {c.case_number}
                  </td>
                  <td className="font-serif font-medium text-ivory text-sm max-w-xs truncate">
                    {c.title}
                  </td>
                  <td className="text-xs text-silver/90">
                    {c.client_name || '—'}
                  </td>
                  <td className="text-xs text-silver/70 font-sans">
                    {c.case_type || '—'}
                  </td>
                  <td>
                    <StatusPill status={c.status_name || 'Pending'} />
                  </td>
                  <td>
                    <StatusPill status={c.priority} showDot={false} />
                  </td>
                  <td className="font-mono text-xs text-ivory">
                    ₹{Number(c.budget || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="font-mono text-xs text-silver/60">
                    {c.filed_date ? String(c.filed_date).slice(0, 10) : '—'}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => viewDetails(c.case_id)}
                        className="p-1.5 rounded-xs text-silver hover:text-brass hover:bg-graphite transition-colors cursor-pointer"
                        title="View Case File Dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-xs text-silver hover:text-ivory hover:bg-graphite transition-colors cursor-pointer"
                          title="Edit Matter"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(c.case_id)}
                          className="p-1.5 rounded-xs text-steel hover:text-red-400 hover:bg-court-danger/20 transition-colors cursor-pointer"
                          title="Delete Matter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Case Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.3, ease: EASE_EXPO }}
              className="court-card-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-brass/20 flex items-center justify-between bg-charcoal sticky top-0 z-10">
                <div className="flex items-center space-x-2.5">
                  <Briefcase className="w-4 h-4 text-brass" />
                  <h3 className="font-serif font-medium text-ivory text-base">
                    {isEditing ? `Edit Matter: ${formData.case_number}` : 'Register New Legal Matter'}
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-silver/60 hover:text-ivory p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Case Docket Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.case_number}
                      onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                      className="court-input w-full px-3.5 py-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Client Representation *
                    </label>
                    <select
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: Number(e.target.value) })}
                      className="court-input w-full px-3.5 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                    >
                      {refData.clients.map((cl) => (
                        <option key={cl.client_id} value={cl.client_id}>
                          {cl.name} ({cl.client_type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Matter Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Sterling Infrastructure vs Maritime Port Authority"
                    className="court-input w-full px-3.5 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Brief Description & Pleadings
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Summary of controversy, bench notes, and relief sought..."
                    className="court-input w-full px-3.5 py-2 text-xs"
                  />
                </div>

                <div className="court-hairline my-2" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Practice Domain
                    </label>
                    <select
                      value={formData.case_type_id}
                      onChange={(e) => setFormData({ ...formData, case_type_id: Number(e.target.value) })}
                      className="court-input w-full px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                    >
                      {refData.caseTypes.map((t) => (
                        <option key={t.type_id} value={t.type_id}>
                          {t.type_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Current Status
                    </label>
                    <select
                      value={formData.current_status_id}
                      onChange={(e) => setFormData({ ...formData, current_status_id: Number(e.target.value) })}
                      className="court-input w-full px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                    >
                      {refData.caseStatuses.map((s) => (
                        <option key={s.status_id} value={s.status_id}>
                          {s.status_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="court-input w-full px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Retainer Budget (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                      className="court-input w-full px-3 py-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Filing Date
                    </label>
                    <input
                      type="date"
                      value={formData.filed_date}
                      onChange={(e) => setFormData({ ...formData, filed_date: e.target.value })}
                      className="court-input w-full px-3 py-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Expected Closure
                    </label>
                    <input
                      type="date"
                      value={formData.expected_closure_date}
                      onChange={(e) => setFormData({ ...formData, expected_closure_date: e.target.value })}
                      className="court-input w-full px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-brass/15">
                  <MagneticButton
                    variant="outline"
                    size="sm"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </MagneticButton>
                  <MagneticButton
                    type="submit"
                    variant="brass"
                    size="sm"
                  >
                    {isEditing ? 'Update Docket' : 'Register Matter'}
                  </MagneticButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Case Details Dossier Modal */}
      <AnimatePresence>
        {detailsModalOpen && selectedCase && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: EASE_EXPO }}
              className="court-card-elevated max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-brass/20 flex items-center justify-between bg-charcoal sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                  <Scale className="w-5 h-5 text-brass" />
                  <span className="font-mono text-xs font-bold text-brass tracking-wider">
                    {selectedCase.case_number}
                  </span>
                  <StatusPill status={selectedCase.current_status || selectedCase.status_name} />
                  <StatusPill status={selectedCase.priority} showDot={false} />
                </div>
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  className="text-silver/60 hover:text-ivory p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <h2 className="text-xl font-serif text-ivory font-medium">{selectedCase.title}</h2>
                  <p className="text-xs sm:text-sm text-silver/80 font-sans mt-2 leading-relaxed">
                    {selectedCase.description || 'No detailed brief available for this matter.'}
                  </p>
                </div>

                {/* Case Attributes Grid */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-charcoal rounded-xs border border-brass/15 text-xs">
                  <div>
                    <span className="text-silver/50 block font-mono text-[10px] uppercase">Client</span>
                    <span className="font-serif font-medium text-ivory mt-0.5 block">{selectedCase.client_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-silver/50 block font-mono text-[10px] uppercase">Retainer Budget</span>
                    <span className="font-mono text-brass mt-0.5 block">₹{Number(selectedCase.budget || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-silver/50 block font-mono text-[10px] uppercase">Practice Domain</span>
                    <span className="font-sans text-silver/90 mt-0.5 block">{selectedCase.case_type || '—'}</span>
                  </div>
                </div>

                {/* Assigned Counsel */}
                <div>
                  <h4 className="text-xs font-mono text-brass uppercase tracking-wider mb-2.5 flex items-center space-x-2">
                    <UserCheck className="w-4 h-4" />
                    <span>Assigned Chambers Counsel</span>
                  </h4>
                  <div className="border border-brass/15 rounded-xs divide-y divide-slate/40 overflow-hidden text-xs">
                    {(!selectedCase.lawyers || selectedCase.lawyers.length === 0) ? (
                      <p className="p-4 text-silver/60 font-serif text-center">No counsel currently assigned to this matter.</p>
                    ) : (
                      selectedCase.lawyers.map((l) => (
                        <div key={l.lawyer_id} className="p-3.5 bg-charcoal flex items-center justify-between">
                          <div>
                            <div className="font-serif font-medium text-ivory text-xs">{l.name}</div>
                            <div className="text-[10px] text-silver/60 font-mono">Bar Reg: {l.bar_registration_no}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-xs bg-graphite text-brass border border-brass/30 text-[10px] font-mono">
                              {l.role} {l.is_primary ? '• Lead Counsel' : ''}
                            </span>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleRemoveCounsel(selectedCase.case_id, l.lawyer_id)}
                                className="p-1 rounded-xs text-steel hover:text-red-400 hover:bg-court-danger/20 transition-colors cursor-pointer"
                                title="Remove Counsel"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {isAdmin && (
                    <form onSubmit={handleAssignCounsel} className="mt-2.5 p-3 bg-graphite/40 border border-brass/15 rounded-xs flex flex-wrap items-center gap-2">
                      <select
                        value={newCounselId}
                        onChange={(e) => setNewCounselId(e.target.value)}
                        className="court-input px-2.5 py-1 text-xs font-mono bg-charcoal cursor-pointer flex-1 min-w-[140px]"
                      >
                        <option value="">Select Advocate...</option>
                        {(refData.lawyers || []).map((lw) => (
                          <option key={lw.lawyer_id} value={lw.lawyer_id}>
                            {lw.name} ({lw.specialization || 'Advocate'})
                          </option>
                        ))}
                      </select>
                      <select
                        value={newCounselRole}
                        onChange={(e) => setNewCounselRole(e.target.value)}
                        className="court-input px-2.5 py-1 text-xs font-mono bg-charcoal cursor-pointer"
                      >
                        <option value="Associate Counsel">Associate Counsel</option>
                        <option value="Lead Counsel">Lead Counsel</option>
                        <option value="Senior Advocate">Senior Advocate</option>
                      </select>
                      <label className="flex items-center gap-1.5 text-[11px] font-mono text-silver/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPrimaryCounsel}
                          onChange={(e) => setIsPrimaryCounsel(e.target.checked)}
                          className="rounded-xs bg-charcoal border-slate text-brass"
                        />
                        <span>Lead</span>
                      </label>
                      <button
                        type="submit"
                        disabled={!newCounselId}
                        className="court-btn-brass px-3 py-1 text-xs font-mono uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                      >
                        Assign
                      </button>
                    </form>
                  )}
                </div>

                {/* Hearings Cause List */}
                <div>
                  <h4 className="text-xs font-mono text-brass uppercase tracking-wider mb-2.5 flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Cause List Hearings Timeline</span>
                  </h4>
                  <div className="border border-brass/15 rounded-xs divide-y divide-slate/40 overflow-hidden text-xs">
                    {(!selectedCase.hearings || selectedCase.hearings.length === 0) ? (
                      <p className="p-4 text-silver/60 font-serif text-center">No bench hearings scheduled.</p>
                    ) : (
                      selectedCase.hearings.map((h) => (
                        <div key={h.hearing_id} className="p-3.5 bg-charcoal flex items-center justify-between">
                          <div>
                            <div className="font-serif font-medium text-ivory text-xs">{h.purpose || 'Trial Hearing'}</div>
                            <div className="text-[11px] text-silver/70">{h.court_name} ({h.city})</div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-brass font-medium text-xs">{h.hearing_date}</span>
                            <div className="text-[10px] text-silver/50 font-mono">{h.start_time || '10:30 AM'}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-brass/15 bg-charcoal flex justify-end">
                <MagneticButton
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailsModalOpen(false)}
                >
                  Close Dossier
                </MagneticButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* XML Serialization Output Modal */}
      <AnimatePresence>
        {xmlModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: EASE_EXPO }}
              className="court-card-elevated max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-brass/20 flex items-center justify-between bg-charcoal">
                <div className="flex items-center space-x-2.5">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-serif font-medium text-ivory text-base">
                    XML Financial Aggregate Serialization
                  </h3>
                </div>
                <button
                  onClick={() => setXmlModalOpen(false)}
                  className="text-silver/60 hover:text-ivory p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-silver/70 font-mono">
                  <span>Structured XML Aggregate Document</span>
                  <button
                    onClick={() => copyToClipboard(xmlContent)}
                    className="flex items-center gap-1.5 text-brass hover:text-brass-light cursor-pointer"
                  >
                    {copiedXml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedXml ? 'Copied' : 'Copy XML'}</span>
                  </button>
                </div>

                <pre className="p-4 bg-ink border border-brass/15 rounded-xs text-[11px] font-mono text-brass overflow-x-auto max-h-96 leading-relaxed">
                  {xmlContent}
                </pre>
              </div>

              <div className="px-6 py-3.5 border-t border-brass/15 bg-charcoal flex justify-end">
                <MagneticButton
                  variant="outline"
                  size="sm"
                  onClick={() => setXmlModalOpen(false)}
                >
                  Close Stream
                </MagneticButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
