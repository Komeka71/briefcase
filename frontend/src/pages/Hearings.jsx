import React, { useState, useEffect } from 'react';
import { hearingService, caseService } from '../services/api';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Building,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Gavel,
  Scale,
  Search,
  Filter
} from 'lucide-react';

export default function Hearings() {
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

  const [formData, setFormData] = useState({
    case_id: 1,
    court_id: 1,
    hearing_date: new Date().toISOString().split('T')[0],
    start_time: '10:30:00',
    end_time: '12:00:00',
    purpose: 'Arguments on Interim Injunction Application',
    outcome: '',
    next_hearing_date: '',
    notes: ''
  });

  const fetchHearings = async () => {
    setLoading(true);
    try {
      const res = await hearingService.getAll();
      setHearings(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve hearing cause lists.');
    } finally {
      setLoading(false);
    }
  };

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
  }, []);

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
    <div className="space-y-6 pb-6 animate-fadeIn">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2D32]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B8975A] flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5" />
            <span>Judicial Cause Lists & Benches</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight mt-1 font-semibold">
            Court Hearings Cause List
          </h2>
          <p className="text-xs text-[#B4B7BC] font-sans mt-0.5">
            Oral arguments schedule, court bench dockets, judicial orders, and adjourned proceedings.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="court-btn-brass px-4 py-2 rounded-[3px] text-xs font-mono uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4 text-[#0A0A0B]" />
          <span>Schedule Bench Hearing</span>
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

      {/* Filter and Search Bar */}
      <div className="court-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#6B6F76] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cause list by case #, title, purpose, or court..."
            className="w-full pl-9 pr-3 py-1.5 court-input text-xs text-white placeholder-[#6B6F76] font-sans"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-[#6B6F76]" />
          <select
            value={selectedCourt}
            onChange={(e) => setSelectedCourt(e.target.value)}
            className="court-input px-3 py-1.5 text-xs text-white"
          >
            <option value="" className="bg-[#141416]">All Court Benches</option>
            {refData.courts.map((c) => (
              <option key={c.court_id} value={c.court_name} className="bg-[#141416]">
                {c.court_name} ({c.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hearings Table */}
      <div className="court-card overflow-hidden">
        <div className="overflow-x-auto">
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
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-xs font-mono text-[#B4B7BC]">
                    Accessing judicial cause list dockets...
                  </td>
                </tr>
              ) : filteredHearings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-xs font-serif text-[#6B6F76]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Gavel className="w-8 h-8 text-[#B8975A]/40" />
                      <p>No hearing dates listed on the active cause list.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHearings.map((h) => (
                  <tr key={h.hearing_id}>
                    <td className="font-mono text-xs font-semibold text-[#D4B97E]">
                      {h.hearing_date}
                    </td>
                    <td>
                      <div className="font-mono text-xs text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#B8975A]" />
                        <span>{h.start_time || '10:30 AM'}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-serif font-medium text-white text-xs max-w-xs truncate">
                          {h.case_title || 'Legal Matter'}
                        </div>
                        <div className="font-mono text-[10px] text-[#B8975A] mt-0.5">
                          {h.case_number}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs text-[#F6F4EF] font-sans">
                        {h.court_name}
                      </div>
                      <div className="text-[10px] text-[#6B6F76] font-mono">
                        {h.court_type || 'Civil Bench'} • {h.city || 'Chambers'}
                      </div>
                    </td>
                    <td className="text-xs text-[#B4B7BC] max-w-xs truncate font-sans">
                      {h.purpose || 'Arguments'}
                    </td>
                    <td>
                      {h.outcome ? (
                        <span className="px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase badge-info">
                          {h.outcome}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase badge-warning">
                          Pending Order
                        </span>
                      )}
                    </td>
                    <td className="font-mono text-xs text-[#6B6F76]">
                      {h.next_hearing_date ? String(h.next_hearing_date).slice(0, 10) : '—'}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => openEdit(h)}
                          className="p-1.5 rounded-[3px] text-[#B4B7BC] hover:text-white hover:bg-[#1E1F23] transition-colors cursor-pointer"
                          title="Edit Hearing"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(h.hearing_id)}
                          className="p-1.5 rounded-[3px] text-[#6B6F76] hover:text-[#E67272] hover:bg-[#9B2C2C]/10 transition-colors cursor-pointer"
                          title="Delete Docket"
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

      {/* Schedule / Edit Hearing Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="court-card-elevated max-w-lg w-full">
            <div className="px-5 py-3.5 border-b border-[#2B2D32] flex items-center justify-between bg-[#141416]">
              <div className="flex items-center space-x-2">
                <Gavel className="w-4 h-4 text-[#B8975A]" />
                <h3 className="font-serif font-semibold text-white text-sm">
                  {isEditing ? 'Update Judicial Cause List Docket' : 'Schedule Bench Hearing'}
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
                  Legal Matter Docket *
                </label>
                <select
                  value={formData.case_id}
                  onChange={(e) => setFormData({ ...formData, case_id: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                >
                  {refData.cases.map((c) => (
                    <option key={c.case_id} value={c.case_id} className="bg-[#141416]">
                      {c.case_number} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Court Jurisdiction & Bench *
                </label>
                <select
                  value={formData.court_id}
                  onChange={(e) => setFormData({ ...formData, court_id: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                >
                  {refData.courts.map((ct) => (
                    <option key={ct.court_id} value={ct.court_id} className="bg-[#141416]">
                      {ct.court_name} ({ct.city} - {ct.court_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Hearing Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.hearing_date}
                    onChange={(e) => setFormData({ ...formData, hearing_date: e.target.value })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Bench Purpose / Stage of Suit *
                </label>
                <input
                  type="text"
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g. Final Arguments / Framing of Issues"
                  className="w-full px-3 py-1.5 court-input text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Bench Order / Interim Outcome
                  </label>
                  <input
                    type="text"
                    value={formData.outcome}
                    onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                    placeholder="e.g. Adjourned / Interim Stay Granted"
                    className="w-full px-3 py-1.5 court-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Adjourned Next Hearing Date
                  </label>
                  <input
                    type="date"
                    value={formData.next_hearing_date}
                    onChange={(e) => setFormData({ ...formData, next_hearing_date: e.target.value })}
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
                  {isEditing ? 'Update Docket' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
