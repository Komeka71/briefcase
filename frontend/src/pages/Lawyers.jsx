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
  X,
  Mail,
  Phone,
  Scale,
  Briefcase
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
    <div className="space-y-6 pb-8">
      {/* Editorial Header */}
      <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#c9a96e]/5 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold bg-[#18263d] text-[#c9a96e] border border-[#c9a96e]/30">
              Firm Attorneys
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              LAWYER JOIN DEPARTMENT
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-normal text-white tracking-tight">
            Lawyer Directory & <span className="italic text-[#c9a96e]">Practice Groups</span>
          </h1>

          <p className="text-xs md:text-sm text-slate-300 font-serif leading-relaxed max-w-2xl">
            Manages legal staff credentials, Bar Council registration numbers, jurisdictional specializations, and departmental hierarchy.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="relative z-10 inline-flex items-center space-x-2 px-4 py-2.5 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-black/30 font-mono"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Onboard Counsel</span>
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

      {/* Lawyers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400 font-serif">
            Loading attorneys from chambers database...
          </div>
        ) : lawyers.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400 font-serif">
            No registered lawyers found.
          </div>
        ) : (
          lawyers.map((l) => (
            <div
              key={l.lawyer_id}
              className="bg-[#141f32] p-5 rounded-sm border border-white/10 shadow-lg flex flex-col justify-between hover:border-[#c9a96e]/40 transition-all duration-200 group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif font-semibold text-white text-base group-hover:text-[#dfbe85] transition-colors">
                      {l.name}
                    </h3>
                    <div className="text-[10px] text-[#c9a96e] font-mono mt-0.5">
                      Bar Reg: {l.bar_registration_no}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono ${
                    l.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-400 border border-white/10'
                  }`}>
                    {l.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-serif text-slate-200">{l.department_name || 'General Litigation'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-3.5 h-3.5 text-[#c9a96e]" />
                    <span className="font-serif">
                      Specialization: <strong className="text-white font-medium">{l.specialization || 'General'}</strong> ({l.experience_years || 0} yrs exp)
                    </span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px] pt-1">
                    {l.email} • {l.phone}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end space-x-2">
                <button
                  onClick={() => openEdit(l)}
                  className="p-1.5 text-slate-400 hover:text-[#dfbe85] hover:bg-white/5 rounded-sm transition-colors"
                  title="Update Lawyer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(l.lawyer_id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-sm transition-colors"
                  title="Delete Lawyer"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141f32] rounded-sm shadow-2xl border border-[#c9a96e]/30 max-w-md w-full">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#18263d]">
              <h3 className="font-serif font-semibold text-white text-base">
                {isEditing ? 'Update Attorney Credentials' : 'Onboard Firm Attorney'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Attorney Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Bar Council Registration No. *
                </label>
                <input
                  type="text"
                  required
                  value={formData.bar_registration_no}
                  onChange={(e) => setFormData({ ...formData, bar_registration_no: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs font-mono text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Practice Group</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                  >
                    {departments.map((d) => (
                      <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
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
