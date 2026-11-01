import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { lawyerService } from '../services/api';
import {
  PageHeader,
  MagneticButton,
  StatusPill,
  EmptyState,
  Skeleton
} from '../components/ui';
import { EASE_EXPO } from '../lib/motion';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Filter
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

  const fetchLawyers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await lawyerService.getAll();
      setLawyers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve chambers counsel records.');
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, [fetchLawyers]);

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
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <PageHeader
        title="Chambers Counsel & Advocates Roster"
        subtitle="Verified Bar Council credentials, departmental practice groups, standing years, and matter caseload allocations."
        category="Counsel Directory"
        badge="Bar Enrolled"
        actions={
          <MagneticButton
            variant="brass"
            size="md"
            onClick={openAdd}
            icon={Plus}
            iconPosition="left"
            className="text-xs font-mono uppercase tracking-wider"
          >
            Admit New Counsel
          </MagneticButton>
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

      {/* Search and Department Filter Toolbar */}
      <div className="court-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-steel absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search counsel by name, Bar registration, or specialty..."
            className="court-input w-full pl-10 pr-4 py-2 text-xs"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-steel" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="court-input px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
          >
            <option value="">All Practice Groups</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_name}>
                {d.department_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lawyers Table Container */}
      <div className="court-table-container">
        <table className="court-table">
          <thead>
            <tr>
              <th>Counsel Name</th>
              <th>Bar Registration</th>
              <th>Practice Specialty</th>
              <th>Department Group</th>
              <th>Standing</th>
              <th>Caseload</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8">
                  <Skeleton rows={4} height="h-6" />
                </td>
              </tr>
            ) : filteredLawyers.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    icon={UserCheck}
                    title="No counsel records found"
                    description="No advocate records matched the current filter criteria."
                    actionLabel="Admit New Counsel"
                    onAction={openAdd}
                  />
                </td>
              </tr>
            ) : (
              filteredLawyers.map((l) => (
                <tr key={l.lawyer_id}>
                  <td>
                    <div>
                      <div className="font-serif font-medium text-ivory text-sm">{l.name}</div>
                      <div className="font-mono text-[11px] text-silver/60 flex items-center gap-2 mt-0.5">
                        <span>{l.email || '—'}</span>
                        {l.phone && <span>• {l.phone}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-brass font-medium">
                    {l.bar_registration_no}
                  </td>
                  <td className="text-xs text-silver/90 font-sans">
                    {l.specialization || 'General Practice'}
                  </td>
                  <td className="text-xs text-silver/70 font-sans">
                    {l.department_name || 'General Litigation'}
                  </td>
                  <td className="font-mono text-xs text-brass">
                    {l.experience_years} yrs
                  </td>
                  <td className="font-mono text-xs text-ivory">
                    {l.assigned_cases_count || 0} Matters
                  </td>
                  <td>
                    <StatusPill status={l.status} />
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => openEdit(l)}
                        className="p-1.5 rounded-xs text-silver hover:text-ivory hover:bg-graphite transition-colors cursor-pointer"
                        title="Edit Counsel"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(l.lawyer_id, l.name)}
                        className="p-1.5 rounded-xs text-steel hover:text-red-400 hover:bg-court-danger/20 transition-colors cursor-pointer"
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

      {/* Add / Edit Counsel Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.3, ease: EASE_EXPO }}
              className="court-card-elevated max-w-lg w-full overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-brass/20 flex items-center justify-between bg-charcoal">
                <div className="flex items-center space-x-2.5">
                  <UserCheck className="w-4 h-4 text-brass" />
                  <h3 className="font-serif font-medium text-ivory text-base">
                    {isEditing ? `Edit Credentials: ${formData.name}` : 'Admit Counsel to Chambers'}
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-silver/60 hover:text-ivory p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Counsel Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Adv. Vikramaditya Desai"
                    className="court-input w-full px-3.5 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Bar Council Registration # *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.bar_registration_no}
                      onChange={(e) => setFormData({ ...formData, bar_registration_no: e.target.value })}
                      className="court-input w-full px-3.5 py-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Years of Standing
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                      className="court-input w-full px-3.5 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="counsel@briefcase.in"
                      className="court-input w-full px-3.5 py-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Direct Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98250 00000"
                      className="court-input w-full px-3.5 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Practice Specialty
                    </label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="e.g. Constitutional Law"
                      className="court-input w-full px-3.5 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Department Group
                    </label>
                    <select
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) })}
                      className="court-input w-full px-3.5 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                    >
                      {departments.map((d) => (
                        <option key={d.department_id} value={d.department_id}>
                          {d.department_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Chambers Standing Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="court-input w-full px-3.5 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                  >
                    <option value="Active">Active / Admitted</option>
                    <option value="Inactive">Inactive / Suspended</option>
                  </select>
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
                    {isEditing ? 'Save Credentials' : 'Admit Counsel'}
                  </MagneticButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
