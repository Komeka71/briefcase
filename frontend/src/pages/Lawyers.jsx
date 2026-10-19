import React, { useState, useEffect } from 'react';
import { lawyerService } from '../services/api';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Building,
  Award,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';

export default function Lawyers() {
  const [lawyers, setLawyers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    bar_registration_no: '',
    email: '',
    phone: '',
    specialization: 'Civil Litigation',
    experience_years: 5,
    department_id: 1,
    status: 'Active'
  });

  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const res = await lawyerService.getAll();
      setLawyers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load lawyers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await lawyerService.getDepartments();
      setDepartments(res.data.data || []);
    } catch (err) {
      console.warn('Could not load departments:', err.message);
    }
  };

  useEffect(() => {
    fetchLawyers();
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (isEditing) {
        await lawyerService.update(editId, formData);
        setSuccess('Lawyer details updated.');
      } else {
        await lawyerService.create(formData);
        setSuccess('New lawyer onboarded successfully.');
      }
      setModalOpen(false);
      resetForm();
      fetchLawyers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed.');
    }
  };

  const openAdd = () => {
    resetForm();
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEdit = (l) => {
    setFormData({
      name: l.name,
      bar_registration_no: l.bar_registration_no,
      email: l.email || '',
      phone: l.phone || '',
      specialization: l.specialization || '',
      experience_years: l.experience_years || 0,
      department_id: l.department_id || 1,
      status: l.status || 'Active'
    });
    setEditId(l.lawyer_id);
    setIsEditing(true);
    setModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      bar_registration_no: `GJ/${Math.floor(1000 + Math.random() * 9000)}/${new Date().getFullYear()}`,
      email: '',
      phone: '',
      specialization: 'Civil Litigation',
      experience_years: 5,
      department_id: departments[0]?.department_id || 1,
      status: 'Active'
    });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete lawyer #${id}?\nDependent case assignments may prevent deletion.`)) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await lawyerService.delete(id);
      setSuccess('Lawyer removed successfully.');
      fetchLawyers();
    } catch (err) {
      setError(err.response?.data?.message || 'Referential check rejected lawyer deletion.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Firm Attorneys
            </span>
            <span className="text-xs text-slate-500 font-mono">LAWYER JOIN DEPARTMENT</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Lawyer Directory & Practice Groups</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manages legal staff credentials, Bar Council registration numbers, and practice departments.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Attorney</span>
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

      {/* Lawyers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-10 text-slate-400">Loading attorneys from database...</div>
        ) : (
          lawyers.map((l) => (
            <div key={l.lawyer_id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{l.name}</h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">Bar Reg: {l.bar_registration_no}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    l.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {l.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-800">{l.department_name || 'General Litigation'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>Specialization: <strong>{l.specialization || 'General'}</strong> ({l.experience_years || 0} yrs exp)</span>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px] pt-1">
                    {l.email} • {l.phone}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => openEdit(l)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(l.lawyer_id)}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">{isEditing ? 'Update Attorney' : 'Onboard Attorney'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Attorney Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bar Registration No. *</label>
                <input
                  type="text"
                  required
                  value={formData.bar_registration_no}
                  onChange={(e) => setFormData({ ...formData, bar_registration_no: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {departments.map((d) => (
                      <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
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
                  Save Attorney
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
