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
  Layers,
  Scale,
  Landmark,
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Hearing':
        return 'bg-blue-500/15 text-blue-200 border border-blue-500/30';
      case 'Settled':
      case 'Closed':
        return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
      case 'Filed':
        return 'bg-[#121c33] text-[#f5f0e7] border border-white/20';
      default:
        return 'bg-[#0d1527] text-white/70 border border-white/10';
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Editorial Header */}
      <div className="bg-[#0d1527] border border-white/10 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold bg-[#121c33] text-[#f5f0e7] border border-white/15">
              Litigation Dockets
            </span>
            <span className="text-[11px] text-white/50 font-mono hidden sm:inline">
              BriefCase Active Cases
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-serif text-[#f5f0e7] tracking-tight">
            Case Matters & <span className="italic text-white font-medium">Dossiers</span>
          </h1>

          <p className="text-xs text-white/60 font-sans max-w-xl">
            Track active chambers litigation, counsel appointments, court dates, and statutory budgets.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="relative z-10 inline-flex items-center space-x-2 px-3.5 py-2 bg-[#f5f0e7] hover:bg-white text-[#0a0f1d] rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-md font-mono cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Matter</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-lg text-[#f5f0e7] flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">{error}</div>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-[#f5f0e7] flex items-start space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">{success}</div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[#0d1527] p-3 rounded-lg border border-white/10 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search case # or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#0a0f1d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] placeholder-white/40 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-2" />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#0a0f1d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono focus:outline-none"
          >
            <option value="">All Statuses</option>
            {refData.caseStatuses.map((s) => (
              <option key={s.status_id} value={s.status_name}>{s.status_name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#0a0f1d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono focus:outline-none"
          >
            <option value="">All Practice Areas</option>
            {refData.caseTypes.map((t) => (
              <option key={t.case_type_id} value={t.type_name}>{t.type_name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#0a0f1d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Cases Data Table */}
      <div className="bg-[#0d1527] rounded-xl border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-[#0a0f1d] text-white/50 text-[11px] uppercase tracking-wider font-mono border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Docket #</th>
                <th className="px-4 py-3">Matter Title</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-white/50 font-serif">
                    Querying legal matters from MySQL database...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-white/50 font-serif">
                    No cases found matching the specified criteria.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.case_id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#f5f0e7]">
                      {c.case_number}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-serif font-medium text-[#f5f0e7] text-sm">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-white/40 truncate mt-0.5">
                        {c.description || 'No description recorded'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/90">
                      {c.client_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#121c33] text-white/70 border border-white/10">
                        {c.case_type || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${getStatusBadge(c.case_status)}`}>
                        {c.case_status || 'New'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#f5f0e7]">
                      ₹{Number(c.budget || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => viewDetails(c.case_id)}
                        title="View Dossier"
                        className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        title="Edit Case"
                        className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.case_id)}
                        title="Delete Case"
                        className="p-1.5 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#0d1527] rounded-xl shadow-2xl border border-white/15 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#0a0f1d] sticky top-0">
              <h3 className="font-serif font-semibold text-[#f5f0e7] text-sm">
                {isEditing ? 'Update Legal Matter' : 'Register New Legal Matter'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-white/60 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">Case Number *</label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    value={formData.case_number}
                    onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#0a0f1d] border border-white/10 focus:border-white/30 rounded-md text-xs font-mono text-[#f5f0e7] disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">Client Entity *</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: parseInt(e.target.value, 10) })}
                    className="w-full px-2.5 py-1.5 bg-[#0a0f1d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono"
                  >
                    {refData.clients.map((cl) => (
                      <option key={cl.client_id} value={cl.client_id}>{cl.name} ({cl.client_type})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">Case Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Surat Metro Rail Land Challenge"
                  className="w-full px-2.5 py-1.5 bg-[#0a0f1d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#0a0f1d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7]"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">Type</label>
                  <select
                    value={formData.case_type_id}
                    onChange={(e) => setFormData({ ...formData, case_type_id: parseInt(e.target.value, 10) })}
                    className="w-full px-2 py-1.5 bg-[#0a0f1d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono"
                  >
                    {refData.caseTypes.map((t) => (
                      <option key={t.case_type_id} value={t.case_type_id}>{t.type_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">Status</label>
                  <select
                    value={formData.current_status_id}
                    onChange={(e) => setFormData({ ...formData, current_status_id: parseInt(e.target.value, 10) })}
                    className="w-full px-2 py-1.5 bg-[#0a0f1d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono"
                  >
                    {refData.caseStatuses.map((s) => (
                      <option key={s.status_id} value={s.status_id}>{s.status_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#0a0f1d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">Budget (INR) *</label>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-[#0a0f1d] border border-white/10 focus:border-white/30 rounded-md text-xs font-mono text-[#f5f0e7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">Filing Date</label>
                  <input
                    type="date"
                    value={formData.filed_date}
                    onChange={(e) => setFormData({ ...formData, filed_date: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#0a0f1d] border border-white/10 focus:border-white/30 rounded-md text-xs font-mono text-[#f5f0e7]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2.5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 border border-white/15 text-white/70 hover:text-white rounded-md text-xs font-mono uppercase tracking-wider hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#f5f0e7] hover:bg-white text-[#0a0f1d] rounded-md text-xs font-semibold uppercase tracking-wider shadow font-mono transition-all cursor-pointer"
                >
                  {isEditing ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Details Dossier Modal */}
      {detailsModalOpen && selectedCase && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#0d1527] rounded-xl shadow-2xl border border-white/15 max-w-xl w-full max-h-[85vh] overflow-y-auto">
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#0a0f1d] sticky top-0">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-[#f5f0e7]" />
                <h3 className="font-serif font-semibold text-[#f5f0e7] text-sm">{selectedCase.case_number}</h3>
              </div>
              <button onClick={() => setDetailsModalOpen(false)} className="text-white/60 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-lg font-serif text-[#f5f0e7]">{selectedCase.title}</h2>
                <p className="text-xs text-white/60 font-sans mt-1 leading-relaxed">
                  {selectedCase.description || 'No detailed brief available.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-[#0a0f1d] rounded-lg border border-white/10 text-xs">
                <div>
                  <span className="text-white/50 block font-mono text-[10px] uppercase">Client</span>
                  <span className="font-serif font-medium text-[#f5f0e7]">{selectedCase.client_name}</span>
                </div>
                <div>
                  <span className="text-white/50 block font-mono text-[10px] uppercase">Budget</span>
                  <span className="font-mono text-[#f5f0e7]">₹{Number(selectedCase.budget).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-white/50 block font-mono text-[10px] uppercase">Area</span>
                  <span className="font-mono text-white/80">{selectedCase.case_type}</span>
                </div>
              </div>

              {/* Assigned Lawyers */}
              <div>
                <h4 className="text-[11px] font-mono text-white/80 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assigned Counsel</span>
                </h4>
                <div className="border border-white/10 rounded-lg divide-y divide-white/5 overflow-hidden text-xs">
                  {(!selectedCase.lawyers || selectedCase.lawyers.length === 0) ? (
                    <p className="p-3 text-white/50 font-serif text-center">No counsel currently assigned.</p>
                  ) : (
                    selectedCase.lawyers.map((l) => (
                      <div key={l.lawyer_id} className="p-2.5 bg-[#0a0f1d] flex items-center justify-between">
                        <div>
                          <div className="font-serif font-medium text-[#f5f0e7] text-xs">{l.name}</div>
                          <div className="text-[10px] text-white/50 font-mono">Bar: {l.bar_registration_no}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-[#121c33] text-white/80 border border-white/15 text-[10px] font-mono">
                          {l.role} {l.is_primary ? '• Lead' : ''}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Hearings Schedule */}
              <div>
                <h4 className="text-[11px] font-mono text-white/80 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Hearings Schedule</span>
                </h4>
                <div className="border border-white/10 rounded-lg divide-y divide-white/5 overflow-hidden text-xs">
                  {(!selectedCase.hearings || selectedCase.hearings.length === 0) ? (
                    <p className="p-3 text-white/50 font-serif text-center">No hearings scheduled.</p>
                  ) : (
                    selectedCase.hearings.map((h) => (
                      <div key={h.hearing_id} className="p-2.5 bg-[#0a0f1d] flex items-center justify-between">
                        <div>
                          <div className="font-serif font-medium text-[#f5f0e7] text-xs">{h.purpose || 'Trial Hearing'}</div>
                          <div className="text-[10px] text-white/60">{h.court_name} ({h.city})</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[#f5f0e7] font-semibold text-xs">{h.hearing_date}</span>
                          <div className="text-[10px] text-white/50 font-mono">{h.start_time || '10:30 AM'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 py-2.5 border-t border-white/10 bg-[#0a0f1d] flex justify-end">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-3.5 py-1.5 bg-[#121c33] hover:bg-[#1a2744] text-[#f5f0e7] border border-white/15 rounded-md text-xs font-mono uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
