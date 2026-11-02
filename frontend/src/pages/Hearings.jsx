import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hearingService, caseService } from '../services/api';
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
  Plus,
  Edit2,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Gavel,
  Search,
  Filter
} from 'lucide-react';

export default function Hearings() {
  const role = getRole();
  const isAdmin = role === 'Admin';
  const canSchedule = isAdmin || role === 'Lawyer';
  const hasActions = role !== 'Assistant';
  const [hearings, setHearings] = useState([]);
  const [refData, setRefData] = useState({ courts: [], cases: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState(() => ({
    case_id: 1,
    court_id: 1,
    hearing_date: new Date().toISOString().split('T')[0],
    start_time: '10:30:00',
    end_time: '12:00:00',
    purpose: 'Arguments on Interim Injunction Application',
    outcome: '',
    next_hearing_date: '',
    notes: ''
  }));

  const fetchHearings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hearingService.getAll();
      setHearings(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve hearing cause lists.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReferenceData = async () => {
    try {
      const res = await caseService.getReferenceData();
      const casesRes = await caseService.getAll();
      setRefData({
        courts: res.data.data?.courts || [],
        cases: casesRes.data.data || []
      });
    } catch (err) {
      console.warn('Could not load reference data:', err.message);
    }
  };

  useEffect(() => {
    fetchHearings();
    fetchReferenceData();
  }, [fetchHearings]);

  const resetForm = () => {
    setFormData({
      case_id: refData.cases[0]?.case_id || 1,
      court_id: refData.courts[0]?.court_id || 1,
      hearing_date: new Date().toISOString().split('T')[0],
      start_time: '10:30:00',
      end_time: '12:00:00',
      purpose: 'Trial Hearing & Oral Arguments',
      outcome: '',
      next_hearing_date: '',
      notes: ''
    });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (isEditing) {
        await hearingService.update(editId, formData);
        setSuccess('Judicial cause list entry updated successfully.');
      } else {
        await hearingService.create(formData);
        setSuccess('Court hearing scheduled and docketed successfully.');
      }
      setModalOpen(false);
      resetForm();
      fetchHearings();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed.');
    }
  };

  const openAdd = () => {
    resetForm();
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEdit = (h) => {
    setFormData({
      case_id: h.case_id,
      court_id: h.court_id,
      hearing_date: h.hearing_date,
      start_time: h.start_time || '',
      end_time: h.end_time || '',
      purpose: h.purpose || '',
      outcome: h.outcome || '',
      next_hearing_date: h.next_hearing_date || '',
      notes: h.notes || ''
    });
    setEditId(h.hearing_id);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete docket entry for hearing #${id}?`)) return;
    try {
      await hearingService.delete(id);
      setSuccess('Hearing docket record removed.');
      fetchHearings();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete operation failed.');
    }
  };

  const filteredHearings = hearings.filter(h => {
    const matchesSearch = searchTerm === '' ||
      h.case_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.court_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourt = selectedCourt === '' ||
      h.court_name === selectedCourt ||
      String(h.court_id) === String(selectedCourt);

    return matchesSearch && matchesCourt;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <PageHeader
        title="Court Hearings Cause List & Bench Dockets"
        subtitle="Track oral argument schedules, High Court division bench cause lists, interim decrees, and adjourned proceedings."
        category="Bench Docket"
        badge="Daily Roster"
        actions={
          canSchedule ? (
            <MagneticButton
              variant="brass"
              size="md"
              onClick={openAdd}
              icon={Plus}
              iconPosition="left"
              className="text-xs font-mono uppercase tracking-wider"
            >
              Schedule Bench Hearing
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

      {/* Search and Court Filter Bar */}
      <div className="court-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-steel absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cause list by case number, title, purpose, or court..."
            className="court-input w-full pl-10 pr-4 py-2 text-xs"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-steel" />
          <select
            value={selectedCourt}
            onChange={(e) => setSelectedCourt(e.target.value)}
            className="court-input px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
          >
            <option value="">All Court Benches</option>
            {refData.courts.map((c) => (
              <option key={c.court_id} value={c.court_name}>
                {c.court_name} ({c.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hearings Table Container */}
      <div className="court-table-container">
        <table className="court-table">
          <thead>
            <tr>
              <th>Cause List Date</th>
              <th>Time & Bench</th>
              <th>Case Docket</th>
              <th>Courtroom Jurisdiction</th>
              <th>Hearing Purpose</th>
              <th>Bench Order / Outcome</th>
              <th>Adjourned Next Date</th>
              {hasActions && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={hasActions ? 8 : 7} className="py-8">
                  <Skeleton rows={4} height="h-6" />
                </td>
              </tr>
            ) : filteredHearings.length === 0 ? (
              <tr>
                <td colSpan={hasActions ? 8 : 7}>
                  <EmptyState
                    icon={Gavel}
                    title="No hearings found"
                    description="No hearing entries match the active filter criteria."
                    actionLabel={canSchedule ? "Schedule Bench Hearing" : undefined}
                    onAction={canSchedule ? openAdd : undefined}
                  />
                </td>
              </tr>
            ) : (
              filteredHearings.map((h) => (
                <tr key={h.hearing_id}>
                  <td className="font-mono text-xs font-medium text-brass">
                    {h.hearing_date}
                  </td>
                  <td>
                    <div className="font-mono text-xs text-ivory flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brass" />
                      <span>{h.start_time || '10:30 AM'}</span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="font-serif font-medium text-ivory text-sm max-w-xs truncate">
                        {h.case_title || 'Legal Matter'}
                      </div>
                      <div className="font-mono text-[11px] text-brass mt-0.5">
                        {h.case_number}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-xs text-silver/90 font-sans">
                      {h.court_name}
                    </div>
                    <div className="text-[10px] text-silver/50 font-mono">
                      {h.court_type || 'Civil Bench'} • {h.city || 'Chambers'}
                    </div>
                  </td>
                  <td className="text-xs text-silver/80 max-w-xs truncate font-sans">
                    {h.purpose || 'Arguments'}
                  </td>
                  <td>
                    <StatusPill status={h.outcome || 'Pending'} />
                  </td>
                  <td className="font-mono text-xs text-silver/60">
                    {h.next_hearing_date ? String(h.next_hearing_date).slice(0, 10) : '—'}
                  </td>
                  {hasActions && (
                    <td className="text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => openEdit(h)}
                          className="p-1.5 rounded-xs text-silver hover:text-ivory hover:bg-graphite transition-colors cursor-pointer"
                          title="Edit Hearing"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(h.hearing_id)}
                            className="p-1.5 rounded-xs text-steel hover:text-red-400 hover:bg-court-danger/20 transition-colors cursor-pointer"
                            title="Delete Docket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Schedule / Edit Hearing Modal */}
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
                  <Gavel className="w-4 h-4 text-brass" />
                  <h3 className="font-serif font-medium text-ivory text-base">
                    {isEditing ? 'Update Judicial Cause List Docket' : 'Schedule Bench Hearing'}
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
                    Legal Matter Docket *
                  </label>
                  <select
                    value={formData.case_id}
                    onChange={(e) => setFormData({ ...formData, case_id: Number(e.target.value) })}
                    className="court-input w-full px-3.5 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                  >
                    {refData.cases.map((c) => (
                      <option key={c.case_id} value={c.case_id}>
                        {c.case_number} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Court Jurisdiction & Bench *
                  </label>
                  <select
                    value={formData.court_id}
                    onChange={(e) => setFormData({ ...formData, court_id: Number(e.target.value) })}
                    className="court-input w-full px-3.5 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                  >
                    {refData.courts.map((ct) => (
                      <option key={ct.court_id} value={ct.court_id}>
                        {ct.court_name} ({ct.city} - {ct.court_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Hearing Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.hearing_date}
                      onChange={(e) => setFormData({ ...formData, hearing_date: e.target.value })}
                      className="court-input w-full px-3 py-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="court-input w-full px-3 py-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="court-input w-full px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Bench Purpose / Stage of Suit *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="e.g. Final Arguments / Framing of Issues"
                    className="court-input w-full px-3.5 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Bench Order / Interim Outcome
                    </label>
                    <input
                      type="text"
                      value={formData.outcome}
                      onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                      placeholder="e.g. Adjourned / Interim Injunction Granted"
                      className="court-input w-full px-3.5 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Adjourned Next Hearing Date
                    </label>
                    <input
                      type="date"
                      value={formData.next_hearing_date}
                      onChange={(e) => setFormData({ ...formData, next_hearing_date: e.target.value })}
                      className="court-input w-full px-3.5 py-2 text-xs font-mono"
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
                    {isEditing ? 'Update Docket' : 'Confirm Schedule'}
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
