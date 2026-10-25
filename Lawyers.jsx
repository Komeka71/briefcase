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
  Briefcase,
  Search,
  Filter,
  Shield,
  BadgeCheck
} from 'lucide-react';

export default function Lawyers() {
  const [lawyers, setLawyers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

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
      setError(err.response?.data?.message || 'Failed to retrieve chambers counsel records.');
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
        setSuccess('Counsel credentials and departmental assignment updated successfully.');
      } else {
        await lawyerService.create(formData);
        setSuccess('New advocate admitted to firm chambers roster successfully.');
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
      bar_registration_no: `G/${Math.floor(1000 + Math.random() * 9000)}/${new Date().getFullYear()}`,
      email: '',
      phone: '',
      specialization: 'Civil Litigation',
      experience_years: 5,
      department_id: departments[0]?.department_id || 1,
      status: 'Active'
    });
    setEditId(null);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Revoke chambers credentials for ${name || 'Advocate'} (#${id})?\nActive case representations may require reassignment.`)) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await lawyerService.delete(id);
      setSuccess('Counsel removed from chambers directory.');
      fetchLawyers();
    } catch (err) {
      setError(err.response?.data?.message || 'Referential integrity check rejected deletion. Counsel is actively assigned to ongoing legal cases.');
    }
  };

  // Filtered lawyers
  const filteredLawyers = lawyers.filter(l => {
    const matchesSearch = searchTerm === '' ||
      l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.bar_registration_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.specialization?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === '' ||
      l.department_name === selectedDept ||
      String(l.department_id) === String(selectedDept);

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Editorial Header */}
      <div className="relative overflow-hidden rounded-xl bg-[#241b15] border border-white/10 p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase font-semibold bg-[#2e231b] text-[#f5f0e7] border border-white/15">
            <Scale className="w-3 h-3 text-white" />
            <span>Advocates & Counsel</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-serif text-[#f5f0e7] tracking-tight">
            Counsel Directory & <span className="italic text-white font-medium">Practice Groups</span>
          </h1>

          <p className="text-xs text-white/60 font-sans leading-relaxed">
            Verified Bar Council credentials, departmental practice groups, and counsel caseloads.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="self-start md:self-auto inline-flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#1c1510] rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow font-mono cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Onboard Counsel</span>
        </button>
      </div>

      {/* Alert Banners */}
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

      {/* Filter and Search Bar */}
      <div className="bg-[#241b15] p-3 rounded-lg border border-white/10 shadow-sm flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by advocate name, Bar registration, or specialization..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#1c1510] border border-white/10 rounded-md text-xs text-[#f5f0e7] placeholder-white/40 focus:border-white/30 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-white/50" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-2.5 py-1.5 bg-[#1c1510] border border-white/10 rounded-md text-xs text-[#f5f0e7] font-mono focus:border-white/30 focus:outline-none"
            >
              <option value="">All Groups</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_name}>{d.department_name}</option>
              ))}
            </select>
          </div>

          <div className="text-xs font-mono text-white/60 px-2.5 py-1.5 bg-[#1c1510] border border-white/10 rounded-md">
            {filteredLawyers.length} Advocates
          </div>
        </div>
      </div>

      {/* Lawyers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {loading ? (
          <div className="col-span-3 text-center py-12 bg-[#241b15] border border-white/10 rounded-xl text-white/50 font-serif">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Querying chambers counsel records...
          </div>
        ) : filteredLawyers.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-[#241b15] border border-white/10 rounded-xl text-white/50 font-serif">
            <UserCheck className="w-8 h-8 text-white/30 mx-auto mb-2" />
            <p className="text-sm text-[#f5f0e7]">No advocates match current search criteria.</p>
            <p className="text-xs text-white/40 mt-1">Adjust your filters or onboard a new counsel.</p>
          </div>
        ) : (
          filteredLawyers.map((l) => (
            <div
              key={l.lawyer_id}
              className="bg-[#241b15] p-4 rounded-xl border border-white/10 shadow-md flex flex-col justify-between hover:border-white/25 transition-all group relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#2e231b] border border-white/15 flex items-center justify-center text-white font-serif text-xs font-bold">
                      {l.name.replace('Adv. ', '').charAt(0)}
                    </span>
                    <div>
                      <h3 className="font-serif font-medium text-[#f5f0e7] text-sm group-hover:text-white transition-colors">
                        {l.name}
                      </h3>
                      <div className="text-[10px] text-white/50 font-mono">
                        Bar: {l.bar_registration_no}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    l.status === 'Active'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      : 'bg-stone-900 text-white/60 border border-white/10'
                  }`}>
                    {l.status}
                  </span>
                </div>

                <div className="mt-3.5 space-y-1.5 text-xs text-white/70 pt-2.5 border-t border-white/5">
                  <div className="flex items-center space-x-2 text-[#f5f0e7]">
                    <Building className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
                    <span className="font-medium truncate">{l.department_name || 'General Litigation'}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Award className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    <span className="truncate">
                      Focus: <strong className="text-[#f5f0e7] font-medium">{l.specialization || 'General'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] font-mono text-white/60">
                    <BadgeCheck className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    <span>Exp: <strong className="text-white">{l.experience_years || 0} yrs</strong></span>
                  </div>

                  <div className="pt-2 border-t border-white/5 space-y-1 font-mono text-[10px]">
                    {l.email && (
                      <div className="flex items-center space-x-2 text-white/50 truncate">
                        <Mail className="w-3 h-3 text-white/40" />
                        <span className="truncate">{l.email}</span>
                      </div>
                    )}
                    {l.phone && (
                      <div className="flex items-center space-x-2 text-white/50">
                        <Phone className="w-3 h-3 text-white/40" />
                        <span>{l.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/40">
                  #{l.lawyer_id}
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEdit(l)}
                    className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                    title="Edit Credentials"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(l.lawyer_id, l.name)}
                    className="p-1.5 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                    title="Remove Counsel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Onboard / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#241b15] rounded-xl shadow-2xl border border-white/15 max-w-md w-full overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#1c1510]">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#f5f0e7]" />
                <h3 className="font-serif font-semibold text-[#f5f0e7] text-sm">
                  {isEditing ? 'Update Counsel Credentials' : 'Onboard Practice Counsel'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                  Advocate Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adv. Vikramaditya Desai"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#1c1510] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                  Bar Council Reg. No. *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. G/1245/2012"
                  value={formData.bar_registration_no}
                  onChange={(e) => setFormData({ ...formData, bar_registration_no: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#1c1510] border border-white/10 focus:border-white/30 rounded-md text-xs font-mono text-[#f5f0e7] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                    Group *
                  </label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: parseInt(e.target.value, 10) })}
                    className="w-full px-2 py-1.5 bg-[#1c1510] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                    Exp (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-2 py-1.5 bg-[#1c1510] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                  Specialization Focus
                </label>
                <input
                  type="text"
                  placeholder="e.g. White Collar Defense"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#1c1510] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="counsel@briefcase.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#1c1510] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98250 12345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#1c1510] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#1c1510] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2.5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 border border-white/15 text-white/70 hover:text-white rounded-md text-xs font-mono uppercase tracking-wider hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#1c1510] rounded-md text-xs font-semibold uppercase tracking-wider shadow font-mono transition-colors cursor-pointer"
                >
                  {isEditing ? 'Save' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
