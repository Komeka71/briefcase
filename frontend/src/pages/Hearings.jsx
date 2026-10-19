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
  X
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
        courts: res.data.data.courts || [],
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
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
              Judicial Proceedings
            </span>
            <span className="text-xs text-slate-500 font-mono">HEARING JOIN COURT JOIN CASES</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Court Hearings & Cause List</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tracks trial dates, court venues, judge benches, arguments, and subsequent cause list adjournments.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Hearing</span>
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

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Hearing Date</th>
                <th className="px-4 py-3">Case Matter</th>
                <th className="px-4 py-3">Court & Jurisdiction</th>
                <th className="px-4 py-3">Time Window</th>
                <th className="px-4 py-3">Purpose & Stage</th>
                <th className="px-4 py-3">Outcome / Order</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">Loading cause list...</td>
                </tr>
              ) : hearings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">No scheduled hearings found.</td>
                </tr>
              ) : (
                hearings.map((h) => (
                  <tr key={h.hearing_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-purple-700 whitespace-nowrap">
                      {h.hearing_date}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 text-xs">{h.case_title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{h.case_number}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-semibold text-slate-800">{h.court_name}</div>
                      <div className="text-[11px] text-slate-400">{h.court_city}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono text-slate-600 whitespace-nowrap">
                      {h.start_time || '10:30'} - {h.end_time || '12:00'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-700 max-w-xs">{h.purpose}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{h.outcome || 'Pending Hearing'}</td>
                    <td className="px-4 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => openEdit(h)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(h.hearing_id)}
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

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">{isEditing ? 'Update Hearing' : 'Schedule Hearing'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Case Matter *</label>
                  <select
                    value={formData.case_id}
                    onChange={(e) => setFormData({ ...formData, case_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {refData.cases.map((c) => (
                      <option key={c.case_id} value={c.case_id}>{c.case_number} - {c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Court Venue *</label>
                  <select
                    value={formData.court_id}
                    onChange={(e) => setFormData({ ...formData, court_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {refData.courts.map((co) => (
                      <option key={co.court_id} value={co.court_id}>{co.court_name} ({co.city})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hearing Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.hearing_date}
                    onChange={(e) => setFormData({ ...formData, hearing_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose / Stage of Hearing *</label>
                <input
                  type="text"
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Outcome / Order</label>
                <input
                  type="text"
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                  placeholder="e.g. Adjourned to produce rejoinder affidavit"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
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
