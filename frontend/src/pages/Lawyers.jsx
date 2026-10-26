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
    <div className="space-y-6 pb-6 animate-fadeIn">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2D32]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B8975A] flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Advocates & Counsel Roster</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight mt-1 font-semibold">
            Chambers Counsel Directory
          </h2>
          <p className="text-xs text-[#B4B7BC] font-sans mt-0.5">
            Verified Bar Council credentials, departmental practice groups, and counsel caseloads.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="court-btn-brass px-4 py-2 rounded-[3px] text-xs font-mono uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4 text-[#0A0A0B]" />
          <span>Admit New Counsel</span>
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

      {/* Search and Department Filter Toolbar */}
      <div className="court-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#6B6F76] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search counsel by name, Bar Council registration, or specialty..."
            className="w-full pl-9 pr-3 py-1.5 court-input text-xs text-white placeholder-[#6B6F76] font-sans"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-[#6B6F76]" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="court-input px-3 py-1.5 text-xs text-white"
          >
            <option value="" className="bg-[#141416]">All Practice Groups</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_name} className="bg-[#141416]">
                {d.department_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lawyers Table */}
      <div className="court-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="court-table">
            <thead>
              <tr>
                <th>Counsel Name</th>
                <th>Bar Registration</th>
                <th>Practice Specialty</th>
                <th>Department</th>
                <th>Standing</th>
                <th>Caseload</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-xs font-mono text-[#B4B7BC]">
                    Accessing chambers counsel directory...
                  </td>
                </tr>
              ) : filteredLawyers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-xs font-serif text-[#6B6F76]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <UserCheck className="w-8 h-8 text-[#B8975A]/40" />
                      <p>No counsel records found matching the active criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLawyers.map((l) => (
                  <tr key={l.lawyer_id}>
                    <td>
                      <div>
                        <div className="font-serif font-medium text-white text-xs">{l.name}</div>
                        <div className="font-mono text-[10px] text-[#6B6F76] flex items-center gap-1.5 mt-0.5">
                          <span>{l.email || '—'}</span>
                          {l.phone && <span>• {l.phone}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-[#D4B97E] font-semibold">
                      {l.bar_registration_no}
                    </td>
                    <td className="text-xs text-[#F6F4EF] font-sans">
                      {l.specialization || 'General Practice'}
                    </td>
                    <td className="text-xs text-[#B4B7BC] font-sans">
                      {l.department_name || 'General Litigation'}
                    </td>
                    <td className="font-mono text-xs text-[#D4B97E]">
                      {l.experience_years} yrs
                    </td>
                    <td className="font-mono text-xs text-white">
                      {l.assigned_cases_count || 0} Matters
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase ${
                        l.status === 'Active' ? 'badge-success' : 'badge-danger'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => openEdit(l)}
                          className="p-1.5 rounded-[3px] text-[#B4B7BC] hover:text-white hover:bg-[#1E1F23] transition-colors cursor-pointer"
                          title="Edit Counsel"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(l.lawyer_id, l.name)}
                          className="p-1.5 rounded-[3px] text-[#6B6F76] hover:text-[#E67272] hover:bg-[#9B2C2C]/10 transition-colors cursor-pointer"
                          title="Revoke Credentials"
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

      {/* Add / Edit Counsel Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="court-card-elevated max-w-lg w-full">
            <div className="px-5 py-3.5 border-b border-[#2B2D32] flex items-center justify-between bg-[#141416]">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-[#B8975A]" />
                <h3 className="font-serif font-semibold text-white text-sm">
                  {isEditing ? `Edit Credentials: ${formData.name}` : 'Admit Counsel to Chambers'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#6B6F76] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Counsel Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Adv. Vikram Singh"
                  className="w-full px-3 py-1.5 court-input text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Bar Council Registration # *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bar_registration_no}
                    onChange={(e) => setFormData({ ...formData, bar_registration_no: e.target.value })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Years of Standing / Experience
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Direct Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Practice Specialty
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g. Constitutional Law"
                    className="w-full px-3 py-1.5 court-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Department Practice Group
                  </label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  >
                    {departments.map((d) => (
                      <option key={d.department_id} value={d.department_id} className="bg-[#141416]">
                        {d.department_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Chambers Standing Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                >
                  <option value="Active" className="bg-[#141416]">Active / Admitted</option>
                  <option value="Inactive" className="bg-[#141416]">Inactive / Suspended</option>
                </select>
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
                  {isEditing ? 'Save Credentials' : 'Admit Counsel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
