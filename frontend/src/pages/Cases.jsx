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
        return 'bg-[#18263d] text-[#dfbe85] border border-[#c9a96e]/40';
      case 'Settled':
      case 'Closed':
        return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20';
      case 'Filed':
        return 'bg-blue-500/10 text-blue-300 border border-blue-500/20';
      default:
        return 'bg-white/5 text-slate-300 border border-white/10';
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
              Core Relational Entity
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              CASES (references CLIENT, CASE_TYPE, CASE_STATUS)
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-normal text-white tracking-tight">
            Legal Matters & <span className="italic text-[#c9a96e]">Lawsuit Dossiers</span>
          </h1>

          <p className="text-xs md:text-sm text-slate-300 font-serif leading-relaxed max-w-2xl">
            Administer chambers matters, associate appointed counsel, maintain litigation calendars,
            and monitor statutory budgets across forums.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="relative z-10 inline-flex items-center space-x-2 px-4 py-2.5 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-black/30 font-mono"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Register New Matter</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[#18263d] border-l-4 border-red-500 rounded-sm text-slate-200 flex items-start space-x-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs font-serif">{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-[#18263d] border-l-4 border-emerald-500 rounded-sm text-slate-200 flex items-start space-x-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs font-serif">{success}</div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[#141f32] p-4 rounded-sm border border-white/10 shadow-lg grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by case no. or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="">All Case Statuses</option>
            {refData.caseStatuses.map((s) => (
              <option key={s.status_id} value={s.status_name}>{s.status_name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="">All Practice Types</option>
            {refData.caseTypes.map((t) => (
              <option key={t.case_type_id} value={t.type_name}>{t.type_name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Cases Editorial Data Table */}
      <div className="bg-[#141f32] rounded-sm border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0e1624] text-slate-400 text-[11px] uppercase tracking-wider font-mono border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Docket / Case No</th>
                <th className="px-5 py-3.5">Matter Title</th>
                <th className="px-5 py-3.5">Client Party</th>
                <th className="px-5 py-3.5">Practice Type</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Allocated Budget</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 font-serif">
                    Querying legal matters from MySQL database...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 font-serif">
                    No cases found matching the specified criteria.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.case_id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-[#c9a96e]">
                      {c.case_number}
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-serif font-semibold text-white text-sm">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-serif truncate mt-0.5">
                        {c.description || 'No description recorded'}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-serif text-slate-200">
                      {c.client_name}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 rounded-sm text-[11px] font-mono bg-white/5 text-slate-300 border border-white/10">
                        {c.case_type || 'General'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-sm text-[11px] font-mono font-medium ${getStatusBadge(c.case_status)}`}>
                        {c.case_status || 'New'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-light text-[#dfbe85]">
                      ₹ {Number(c.budget || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1">
                      <button
                        onClick={() => viewDetails(c.case_id)}
                        title="View Full Case Dossier"
                        className="p-1.5 text-slate-400 hover:text-[#dfbe85] hover:bg-white/5 rounded-sm transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        title="Edit Case"
                        className="p-1.5 text-slate-400 hover:text-[#c9a96e] hover:bg-white/5 rounded-sm transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.case_id)}
                        title="Delete Case"
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141f32] rounded-sm shadow-2xl border border-[#c9a96e]/30 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#18263d] sticky top-0">
              <h3 className="font-serif font-semibold text-white text-base">
                {isEditing ? 'Update Legal Matter' : 'Register New Legal Matter'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Case Number *</label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    value={formData.case_number}
                    onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs font-mono text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Client (Foreign Key) *</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                  >
                    {refData.clients.map((cl) => (
                      <option key={cl.client_id} value={cl.client_id}>{cl.name} ({cl.client_type})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Case Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Surat Metro Rail Land Acquisition Challenge"
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-serif"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Practice Type</label>
                  <select
                    value={formData.case_type_id}
                    onChange={(e) => setFormData({ ...formData, case_type_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                  >
                    {refData.caseTypes.map((t) => (
                      <option key={t.case_type_id} value={t.case_type_id}>{t.type_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.current_status_id}
                    onChange={(e) => setFormData({ ...formData, current_status_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                  >
                    {refData.caseStatuses.map((s) => (
                      <option key={s.status_id} value={s.status_id}>{s.status_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Budget (INR) *</label>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Filing Date</label>
                  <input
                    type="date"
                    value={formData.filed_date}
                    onChange={(e) => setFormData({ ...formData, filed_date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-white/10 text-slate-400 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
                >
                  {isEditing ? 'Save Changes' : 'Create Matter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Details Dossier Modal */}
      {detailsModalOpen && selectedCase && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141f32] rounded-sm shadow-2xl border border-[#c9a96e]/30 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#18263d] sticky top-0">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-[#c9a96e]" />
                <h3 className="font-serif font-semibold text-white text-base">{selectedCase.case_number}</h3>
              </div>
              <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-serif text-white">{selectedCase.title}</h2>
                <p className="text-xs text-slate-300 font-serif mt-1 leading-relaxed">
                  {selectedCase.description || 'No detailed brief available.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-[#101827] rounded-sm border border-white/10 text-xs">
                <div>
                  <span className="text-slate-500 block font-mono text-[10px] uppercase">Client:</span>
                  <span className="font-serif font-semibold text-white text-sm">{selectedCase.client_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-mono text-[10px] uppercase">Allocated Budget:</span>
                  <span className="font-mono text-[#dfbe85] text-sm">₹ {Number(selectedCase.budget).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-mono text-[10px] uppercase">Practice Area:</span>
                  <span className="font-mono text-slate-200">{selectedCase.case_type}</span>
                </div>
              </div>

              {/* Assigned Lawyers */}
              <div>
                <h4 className="text-xs font-mono text-[#c9a96e] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Assigned Counsel (CASE_LAWYER Associative Table)</span>
                </h4>
                <div className="border border-white/10 rounded-sm divide-y divide-white/5 overflow-hidden text-xs">
                  {(!selectedCase.lawyers || selectedCase.lawyers.length === 0) ? (
                    <p className="p-4 text-slate-400 font-serif text-center">No counsel currently assigned to this matter.</p>
                  ) : (
                    selectedCase.lawyers.map((l) => (
                      <div key={l.lawyer_id} className="p-3 bg-[#101827] flex items-center justify-between">
                        <div>
                          <div className="font-serif font-semibold text-white text-sm">{l.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Bar Reg: {l.bar_registration_no}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-sm bg-[#18263d] text-[#dfbe85] border border-[#c9a96e]/30 text-[10px] font-mono">
                          {l.role} {l.is_primary ? '• Lead Counsel' : ''}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Hearings Schedule */}
              <div>
                <h4 className="text-xs font-mono text-[#c9a96e] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Hearings History & Schedule (HEARING Table)</span>
                </h4>
                <div className="border border-white/10 rounded-sm divide-y divide-white/5 overflow-hidden text-xs">
                  {(!selectedCase.hearings || selectedCase.hearings.length === 0) ? (
                    <p className="p-4 text-slate-400 font-serif text-center">No hearings currently scheduled for this matter.</p>
                  ) : (
                    selectedCase.hearings.map((h) => (
                      <div key={h.hearing_id} className="p-3 bg-[#101827] flex items-center justify-between">
                        <div>
                          <div className="font-serif font-semibold text-white text-sm">{h.purpose || 'Trial Hearing'}</div>
                          <div className="text-[11px] text-slate-400">{h.court_name} ({h.city})</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[#dfbe85] font-semibold">{h.hearing_date}</span>
                          <div className="text-[10px] text-slate-500 font-mono">{h.start_time || '10:30 AM'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-white/10 bg-[#0e1624] flex justify-end">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 bg-[#18263d] hover:bg-[#22334d] text-[#dfbe85] border border-[#c9a96e]/30 rounded-sm text-xs font-mono uppercase tracking-wider"
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
