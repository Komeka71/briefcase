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
  Eye
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Central Entity
            </span>
            <span className="text-xs text-slate-500 font-mono">CASES (references CLIENT, CASE_TYPE, CASE_STATUS)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Legal Cases Matter Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manages active lawsuits, assigned legal counsel, and hearings across judicial forums.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Case</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-start space-x-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>{success}</div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by case no. or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
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
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
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
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Case Number</th>
                <th className="px-4 py-3">Title & Matter</th>
                <th className="px-4 py-3">Client (FK)</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">Loading case records...</td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">No cases found matching filters.</td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.case_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-800">{c.case_number}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 text-xs">{c.title}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{c.description || 'No description'}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-800">{c.client_name}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {c.case_type || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        c.case_status === 'Hearing' ? 'bg-purple-100 text-purple-800' :
                        c.case_status === 'Settled' || c.case_status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {c.case_status || 'New'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-800">
                      ₹ {Number(c.budget || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => viewDetails(c.case_id)}
                        title="View Full Case Dossier"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        title="Edit Case"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.case_id)}
                        title="Delete Case"
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0">
              <h3 className="font-bold text-slate-900 text-base">
                {isEditing ? 'Update Legal Case' : 'Register New Legal Matter'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Case Number *</label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    value={formData.case_number}
                    onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Client (Foreign Key) *</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {refData.clients.map((cl) => (
                      <option key={cl.client_id} value={cl.client_id}>{cl.name} ({cl.client_type})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Case Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Surat Metro Rail Land Acquisition Challenge"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Case Type</label>
                  <select
                    value={formData.case_type_id}
                    onChange={(e) => setFormData({ ...formData, case_type_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {refData.caseTypes.map((t) => (
                      <option key={t.case_type_id} value={t.case_type_id}>{t.type_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.current_status_id}
                    onChange={(e) => setFormData({ ...formData, current_status_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {refData.caseStatuses.map((s) => (
                      <option key={s.status_id} value={s.status_id}>{s.status_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Budget (INR) *</label>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Filing Date</label>
                  <input
                    type="date"
                    value={formData.filed_date}
                    onChange={(e) => setFormData({ ...formData, filed_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  {isEditing ? 'Save Changes' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Details Dossier Modal */}
      {detailsModalOpen && selectedCase && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">{selectedCase.case_number}</h3>
              </div>
              <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedCase.title}</h2>
                <p className="text-xs text-slate-600 mt-1">{selectedCase.description || 'No detailed brief available.'}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Client:</span>
                  <span className="font-bold text-slate-800">{selectedCase.client_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Budget:</span>
                  <span className="font-mono font-bold text-emerald-700">₹ {Number(selectedCase.budget).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Practice Area:</span>
                  <span className="font-medium text-slate-800">{selectedCase.case_type}</span>
                </div>
              </div>

              {/* Assigned Lawyers */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Assigned Counsel (CASE_LAWYER Associative Table)</span>
                </h4>
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden text-xs">
                  {(!selectedCase.lawyers || selectedCase.lawyers.length === 0) ? (
                    <p className="p-3 text-slate-400">No lawyers currently mapped to this case.</p>
                  ) : (
                    selectedCase.lawyers.map((l) => (
                      <div key={l.lawyer_id} className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">{l.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">Bar Reg: {l.bar_registration_no}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-semibold">
                          {l.role} {l.is_primary ? '• Lead' : ''}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Hearings Schedule */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Hearings History & Schedule (HEARING Table)</span>
                </h4>
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden text-xs">
                  {(!selectedCase.hearings || selectedCase.hearings.length === 0) ? (
                    <p className="p-3 text-slate-400">No hearings registered for this case.</p>
                  ) : (
                    selectedCase.hearings.map((h) => (
                      <div key={h.hearing_id} className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">{h.purpose || 'Trial Hearing'}</div>
                          <div className="text-[11px] text-slate-500">{h.court_name} ({h.city})</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-purple-700 font-bold">{h.hearing_date}</span>
                          <div className="text-[10px] text-slate-400">{h.start_time || '10:30 AM'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
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
