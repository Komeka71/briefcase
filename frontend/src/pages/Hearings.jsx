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
  Landmark,
  Scale
} from 'lucide-react';

export default function Hearings() {
  const [hearings, setHearings] = useState([]);
  const [refData, setRefData] = useState({ courts: [], cases: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
      setError(err.response?.data?.message || 'Failed to load hearings.');
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
        setSuccess('Hearing record updated.');
      } else {
        await hearingService.create(formData);
        setSuccess('Hearing scheduled successfully.');
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
      purpose: 'Trial Hearing',
      outcome: '',
      next_hearing_date: '',
      notes: ''
    });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete hearing #${id}?`)) return;
    try {
      await hearingService.delete(id);
      setSuccess('Hearing deleted.');
      fetchHearings();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
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
              Judicial Proceedings
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              HEARING JOIN COURT JOIN CASES
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-normal text-white tracking-tight">
            Court Hearings & <span className="italic text-[#c9a96e]">Judicial Cause List</span>
          </h1>

          <p className="text-xs md:text-sm text-slate-300 font-serif leading-relaxed max-w-2xl">
            Tracks trial schedules, court venues, judicial benches, legal arguments, and subsequent cause list adjournments.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="relative z-10 inline-flex items-center space-x-2 px-4 py-2.5 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-black/30 font-mono"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Schedule Hearing</span>
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

      {/* Cause List Editorial Table */}
      <div className="bg-[#141f32] rounded-sm border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0e1624] text-slate-400 text-[11px] uppercase tracking-wider font-mono border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Hearing Date</th>
                <th className="px-5 py-3.5">Case Matter</th>
                <th className="px-5 py-3.5">Court & Jurisdiction</th>
                <th className="px-5 py-3.5">Time Window</th>
                <th className="px-5 py-3.5">Purpose & Stage</th>
                <th className="px-5 py-3.5">Outcome / Order</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 font-serif">
                    Querying cause list from database...
                  </td>
                </tr>
              ) : hearings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 font-serif">
                    No scheduled hearings found on the judicial docket.
                  </td>
                </tr>
              ) : (
                hearings.map((h) => (
                  <tr key={h.hearing_id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-[#dfbe85] whitespace-nowrap">
                      {h.hearing_date}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-serif font-semibold text-white text-sm">{h.case_title}</div>
                      <div className="text-[10px] text-[#c9a96e] font-mono mt-0.5">{h.case_number}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-serif font-medium text-slate-200">{h.court_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{h.court_city}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                      {h.start_time || '10:30'} — {h.end_time || '12:00'}
                    </td>
                    <td className="px-5 py-4 font-serif text-xs text-slate-300 max-w-xs">{h.purpose}</td>
                    <td className="px-5 py-4 font-serif text-xs text-slate-400">{h.outcome || 'Pending Hearing'}</td>
                    <td className="px-5 py-4 text-right space-x-1">
                      <button
                        onClick={() => openEdit(h)}
                        className="p-1.5 text-slate-400 hover:text-[#dfbe85] hover:bg-white/5 rounded-sm transition-colors"
                        title="Edit Hearing"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(h.hearing_id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-sm transition-colors"
                        title="Delete Hearing"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141f32] rounded-sm shadow-2xl border border-[#c9a96e]/30 max-w-lg w-full">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#18263d]">
              <h3 className="font-serif font-semibold text-white text-base">
                {isEditing ? 'Update Hearing Docket' : 'Schedule Court Hearing'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                    Case Matter *
                  </label>
                  <select
                    value={formData.case_id}
                    onChange={(e) => setFormData({ ...formData, case_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                  >
                    {refData.cases.map((c) => (
                      <option key={c.case_id} value={c.case_id}>{c.case_number} - {c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                    Court Venue *
                  </label>
                  <select
                    value={formData.court_id}
                    onChange={(e) => setFormData({ ...formData, court_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                  >
                    {refData.courts.map((co) => (
                      <option key={co.court_id} value={co.court_id}>{co.court_name} ({co.city})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                    Hearing Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.hearing_date}
                    onChange={(e) => setFormData({ ...formData, hearing_date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Purpose / Stage of Hearing *
                </label>
                <input
                  type="text"
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Outcome / Order
                </label>
                <input
                  type="text"
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                  placeholder="e.g. Adjourned to produce rejoinder affidavit"
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-serif"
                />
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
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
