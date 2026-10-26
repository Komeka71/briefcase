import React, { useState, useEffect } from 'react';
import { caseService } from '../services/api';
import {
  Briefcase,
  Search,
  Plus,
  Edit2,
  Trash2,
  FileText,
  UserCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
  Filter,
  Scale,
  Building,
  Clock,
  DollarSign
} from 'lucide-react';

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [refData, setRefData] = useState({ caseTypes: [], caseStatuses: [], clients: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
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
  });

  const fetchCases = async () => {
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
  };

  const fetchReferenceData = async () => {
    try {
      const res = await caseService.getReferenceData();
      setRefData(res.data.data);
    } catch (err) {
      console.warn('Could not load reference data:', err.message);
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    fetchCases();
  }, [statusFilter, typeFilter, priorityFilter, search]);

  const viewDetails = async (id) => {
    try {
      const res = await caseService.getById(id);
      setSelectedCase(res.data.data);
      setDetailsModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch case details.');
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (isEditing) {
        await caseService.update(editId, formData);
        setSuccess('Legal case updated successfully.');
      } else {
        await caseService.create(formData);
        setSuccess('New legal case registered successfully.');
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

  const getStatusBadgeClass = (statusName = '') => {
    const s = statusName.toLowerCase();
    if (s.includes('settled') || s.includes('closed') || s.includes('disposed')) return 'badge-success';
    if (s.includes('hearing') || s.includes('pending') || s.includes('trial')) return 'badge-warning';
    if (s.includes('dismissed') || s.includes('rejected')) return 'badge-danger';
    return 'badge-info';
  };

  const getPriorityBadgeClass = (p = '') => {
    if (p === 'High') return 'badge-danger';
    if (p === 'Medium') return 'badge-warning';
    return 'badge-info';
  };

  return (
    <div className="space-y-6 pb-6 animate-fadeIn">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2D32]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B8975A] flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            <span>Litigation & Matter Dockets</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight mt-1 font-semibold">
            Legal Cases Registry
          </h2>
          <p className="text-xs text-[#B4B7BC] font-sans mt-0.5">
            Track matter lifecycles, allocated budgets, counsel rosters, and cause list schedules.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="court-btn-brass px-4 py-2 rounded-[3px] text-xs font-mono uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4 text-[#0A0A0B]" />
          <span>Register New Case</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 bg-[#9B2C2C]/20 border border-[#9B2C2C]/60 rounded-[3px] text-[#E67272] text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-[#3F7D5C]/20 border border-[#3F7D5C]/60 rounded-[3px] text-[#72C095] text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="court-card p-3.5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#6B6F76] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by case #, title, or client..."
            className="w-full pl-9 pr-3 py-1.5 court-input text-xs text-white placeholder-[#6B6F76] font-sans"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="court-input px-3 py-1.5 text-xs text-white"
        >
          <option value="" className="bg-[#141416]">All Statuses</option>
          {refData.caseStatuses.map((s) => (
            <option key={s.status_id} value={s.status_name} className="bg-[#141416]">{s.status_name}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="court-input px-3 py-1.5 text-xs text-white"
        >
          <option value="" className="bg-[#141416]">All Practice Areas</option>
          {refData.caseTypes.map((t) => (
            <option key={t.type_id} value={t.type_name} className="bg-[#141416]">{t.type_name}</option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="court-input px-3 py-1.5 text-xs text-white"
        >
          <option value="" className="bg-[#141416]">All Priorities</option>
          <option value="High" className="bg-[#141416]">High Priority</option>
          <option value="Medium" className="bg-[#141416]">Medium Priority</option>
          <option value="Low" className="bg-[#141416]">Low Priority</option>
        </select>
      </div>

      {/* Cases Table */}
      <div className="court-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="court-table">
            <thead>
              <tr>
                <th>Case Number</th>
                <th>Matter Title</th>
                <th>Client Name</th>
                <th>Practice Area</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Budget (INR)</th>
                <th>Filed Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-xs font-mono text-[#B4B7BC]">
                    Retrieving matter dockets from database...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-xs font-serif text-[#6B6F76]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Scale className="w-8 h-8 text-[#B8975A]/40" />
                      <p>No legal matters found matching the current search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.case_id}>
                    <td className="font-mono text-xs font-semibold text-[#D4B97E]">
                      {c.case_number}
                    </td>
                    <td className="font-serif font-medium text-white max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="text-xs text-[#F6F4EF]">
                      {c.client_name || '—'}
                    </td>
                    <td className="text-xs text-[#B4B7BC] font-sans">
                      {c.case_type || '—'}
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-[2px] font-mono text-[9.5px] uppercase ${getStatusBadgeClass(c.status_name)}`}>
                        {c.status_name || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase ${getPriorityBadgeClass(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-[#F6F4EF]">
                      ₹{Number(c.budget || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="font-mono text-xs text-[#6B6F76]">
                      {c.filed_date ? String(c.filed_date).slice(0, 10) : '—'}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => viewDetails(c.case_id)}
                          className="p-1.5 rounded-[3px] text-[#B4B7BC] hover:text-[#D4B97E] hover:bg-[#1E1F23] transition-colors cursor-pointer"
                          title="View Case File Dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-[3px] text-[#B4B7BC] hover:text-white hover:bg-[#1E1F23] transition-colors cursor-pointer"
                          title="Edit Matter"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.case_id)}
                          className="p-1.5 rounded-[3px] text-[#6B6F76] hover:text-[#E67272] hover:bg-[#9B2C2C]/10 transition-colors cursor-pointer"
                          title="Delete Matter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Case Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="court-card-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-3.5 border-b border-[#2B2D32] flex items-center justify-between bg-[#141416] sticky top-0 z-10">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-[#B8975A]" />
                <h3 className="font-serif font-semibold text-white text-sm">
                  {isEditing ? `Edit Matter: ${formData.case_number}` : 'Register New Legal Matter'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#6B6F76] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Case Docket Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.case_number}
                    onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Client Representation *
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  >
                    {refData.clients.map((cl) => (
                      <option key={cl.client_id} value={cl.client_id} className="bg-[#141416]">
                        {cl.name} ({cl.client_type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Matter Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Reliance vs Union of India"
                  className="w-full px-3 py-1.5 court-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Brief Description & Pleadings
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of controversy, bench notes, and cause of action..."
                  className="w-full px-3 py-1.5 court-input text-xs text-white"
                />
              </div>

              <div className="court-hairline my-2" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Practice Area
                  </label>
                  <select
                    value={formData.case_type_id}
                    onChange={(e) => setFormData({ ...formData, case_type_id: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  >
                    {refData.caseTypes.map((t) => (
                      <option key={t.type_id} value={t.type_id} className="bg-[#141416]">
                        {t.type_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Current Status
                  </label>
                  <select
                    value={formData.current_status_id}
                    onChange={(e) => setFormData({ ...formData, current_status_id: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  >
                    {refData.caseStatuses.map((s) => (
                      <option key={s.status_id} value={s.status_id} className="bg-[#141416]">
                        {s.status_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  >
                    <option value="High" className="bg-[#141416]">High Priority</option>
                    <option value="Medium" className="bg-[#141416]">Medium Priority</option>
                    <option value="Low" className="bg-[#141416]">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Retainer Budget (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Filing Date
                  </label>
                  <input
                    type="date"
                    value={formData.filed_date}
                    onChange={(e) => setFormData({ ...formData, filed_date: e.target.value })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Expected Closure
                  </label>
                  <input
                    type="date"
                    value={formData.expected_closure_date}
                    onChange={(e) => setFormData({ ...formData, expected_closure_date: e.target.value })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2.5 border-t border-[#2B2D32]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="court-btn-outline px-4 py-1.5 rounded-[3px] text-xs font-mono uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="court-btn-brass px-5 py-1.5 rounded-[3px] text-xs font-mono font-semibold uppercase tracking-wider shadow"
                >
                  {isEditing ? 'Update Docket' : 'Register Matter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Details Dossier Modal - "Case File" Feel */}
      {detailsModalOpen && selectedCase && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="court-card-elevated max-w-xl w-full max-h-[85vh] overflow-y-auto">
            <div className="px-5 py-3.5 border-b border-[#2B2D32] flex items-center justify-between bg-[#141416] sticky top-0 z-10">
              <div className="flex items-center space-x-2.5">
                <Scale className="w-4 h-4 text-[#B8975A]" />
                <span className="font-mono text-xs font-bold text-[#D4B97E] tracking-wider">
                  {selectedCase.case_number}
                </span>
                <span className={`px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase ${getStatusBadgeClass(selectedCase.current_status || selectedCase.status_name)}`}>
                  {selectedCase.current_status || selectedCase.status_name || 'Active'}
                </span>
                <span className={`px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase ${getPriorityBadgeClass(selectedCase.priority)}`}>
                  {selectedCase.priority}
                </span>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-[#6B6F76] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-xl font-serif text-white font-medium">{selectedCase.title}</h2>
                <p className="text-xs text-[#B4B7BC] font-sans mt-1.5 leading-relaxed">
                  {selectedCase.description || 'No detailed brief available for this matter.'}
                </p>
              </div>

              {/* Case Attributes Card */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-[#141416] rounded-[3px] border border-[#2B2D32] text-xs">
                <div>
                  <span className="text-[#6B6F76] block font-mono text-[9.5px] uppercase">Client</span>
                  <span className="font-serif font-medium text-white">{selectedCase.client_name || '—'}</span>
                </div>
                <div>
                  <span className="text-[#6B6F76] block font-mono text-[9.5px] uppercase">Retainer Budget</span>
                  <span className="font-mono text-[#D4B97E]">₹{Number(selectedCase.budget || 0).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[#6B6F76] block font-mono text-[9.5px] uppercase">Practice Area</span>
                  <span className="font-sans text-[#F6F4EF]">{selectedCase.case_type || '—'}</span>
                </div>
              </div>

              {/* Assigned Counsel */}
              <div>
                <h4 className="text-[11px] font-mono text-[#B8975A] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assigned Chambers Counsel</span>
                </h4>
                <div className="border border-[#2B2D32] rounded-[3px] divide-y divide-[#2B2D32] overflow-hidden text-xs">
                  {(!selectedCase.lawyers || selectedCase.lawyers.length === 0) ? (
                    <p className="p-3 text-[#6B6F76] font-serif text-center">No counsel currently assigned to this matter.</p>
                  ) : (
                    selectedCase.lawyers.map((l) => (
                      <div key={l.lawyer_id} className="p-3 bg-[#141416] flex items-center justify-between">
                        <div>
                          <div className="font-serif font-medium text-white text-xs">{l.name}</div>
                          <div className="text-[10px] text-[#6B6F76] font-mono">Bar Reg: {l.bar_registration_no}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-[2px] bg-[#1E1F23] text-[#D4B97E] border border-[#B8975A]/30 text-[9.5px] font-mono">
                          {l.role} {l.is_primary ? '• Lead Counsel' : ''}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Hearings Cause List Schedule */}
              <div>
                <h4 className="text-[11px] font-mono text-[#B8975A] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Cause List Hearings Timeline</span>
                </h4>
                <div className="border border-[#2B2D32] rounded-[3px] divide-y divide-[#2B2D32] overflow-hidden text-xs">
                  {(!selectedCase.hearings || selectedCase.hearings.length === 0) ? (
                    <p className="p-3 text-[#6B6F76] font-serif text-center">No bench hearings scheduled.</p>
                  ) : (
                    selectedCase.hearings.map((h) => (
                      <div key={h.hearing_id} className="p-3 bg-[#141416] flex items-center justify-between">
                        <div>
                          <div className="font-serif font-medium text-white text-xs">{h.purpose || 'Trial Hearing'}</div>
                          <div className="text-[10px] text-[#B4B7BC]">{h.court_name} ({h.city})</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[#D4B97E] font-semibold text-xs">{h.hearing_date}</span>
                          <div className="text-[10px] text-[#6B6F76] font-mono">{h.start_time || '10:30 AM'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#2B2D32] bg-[#141416] flex justify-end">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="court-btn-outline px-4 py-1.5 rounded-[3px] text-xs font-mono uppercase tracking-wider"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
