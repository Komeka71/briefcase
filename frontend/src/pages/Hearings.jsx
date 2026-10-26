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
  Scale,
  Search,
  Filter,
  FileText
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

  // Filtered hearings
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
    <div className="space-y-4 pb-6">
      {/* Editorial Header */}
      <div className="relative overflow-hidden rounded-xl bg-[#664631] border border-white/10 p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase font-semibold bg-[#73513a] text-[#f5f0e7] border border-white/15">
            <Gavel className="w-3 h-3 text-white" />
            <span>Judicial Bench Cause List</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-serif text-[#f5f0e7] tracking-tight">
            Hearings & <span className="italic text-white font-medium">Court Dates</span>
          </h1>

          <p className="text-xs text-white/60 font-sans leading-relaxed">
            Monitor courtroom dockets, bench schedules, witness examination, and interim orders.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="self-start md:self-auto inline-flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-b from-[#fbf5ec] to-[#e9d6b8] hover:from-[#ffffff] hover:to-[#f0e2c9] shadow-[0_8px_22px_-8px_rgba(20,12,6,0.6)] text-[#3b2a1f] rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow font-mono cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Schedule Hearing</span>
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
      <div className="bg-[#664631] p-3 rounded-lg border border-white/10 shadow-sm flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by case title, case number, court, or legal purpose..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#5e412d] border border-white/10 rounded-md text-xs text-[#f5f0e7] placeholder-white/40 focus:border-white/30 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-white/50" />
            <select
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
              className="px-2.5 py-1.5 bg-[#5e412d] border border-white/10 rounded-md text-xs text-[#f5f0e7] font-mono focus:border-white/30 focus:outline-none"
            >
              <option value="">All Courts</option>
              {refData.courts.map((c) => (
                <option key={c.court_id} value={c.court_name}>{c.court_name}</option>
              ))}
            </select>
          </div>

          <div className="text-xs font-mono text-white/60 px-2.5 py-1.5 bg-[#5e412d] border border-white/10 rounded-md">
            {filteredHearings.length} Hearings
          </div>
        </div>
      </div>

      {/* Cause List Table */}
      <div className="bg-[#664631] rounded-xl border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-[#5e412d] text-white/50 text-[10px] uppercase tracking-wider font-mono border-b border-white/10">
              <tr>
                <th className="px-4 py-3 font-semibold">Date & Time</th>
                <th className="px-4 py-3 font-semibold">Matter & Docket #</th>
                <th className="px-4 py-3 font-semibold">Court & Bench</th>
                <th className="px-4 py-3 font-semibold">Purpose</th>
                <th className="px-4 py-3 font-semibold">Outcome</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-white/50 font-serif">
                    Querying judicial cause list from database...
                  </td>
                </tr>
              ) : filteredHearings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-white/50 font-serif">
                    <Calendar className="w-8 h-8 text-white/30 mx-auto mb-2" />
                    <p className="text-sm text-[#f5f0e7]">No scheduled hearings match current filters.</p>
                  </td>
                </tr>
              ) : (
                filteredHearings.map((h) => {
                  const isFuture = new Date(h.hearing_date) >= new Date(new Date().setHours(0,0,0,0));
                  return (
                    <tr key={h.hearing_id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isFuture ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                          <span className="font-mono text-xs font-semibold text-[#f5f0e7]">
                            {h.hearing_date}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-white/50 mt-0.5 flex items-center gap-1 pl-3.5">
                          <Clock className="w-3 h-3 text-white/40" />
                          <span>{h.start_time?.slice(0,5) || '10:30'} — {h.end_time?.slice(0,5) || '12:00'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-serif font-medium text-[#f5f0e7] text-xs group-hover:text-white transition-colors">
                          {h.case_title}
                        </div>
                        <div className="text-[10px] text-white/50 font-mono mt-0.5">
                          {h.case_number}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-[#f5f0e7] flex items-center gap-1 text-xs">
                          <Landmark className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                          <span>{h.court_name}</span>
                        </div>
                        <div className="text-[10px] text-white/50 font-mono pl-4.5">
                          {h.court_city || 'Judicial Seat'}
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <div className="text-xs text-white/80 line-clamp-2">
                          {h.purpose}
                        </div>
                        {h.notes && (
                          <div className="text-[10px] font-mono text-white/40 mt-0.5 truncate">
                            Note: {h.notes}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                          h.outcome && h.outcome !== 'Pending Hearing'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-950/40 text-blue-300 border border-blue-500/30'
                        }`}>
                          {h.outcome || 'Pending'}
                        </span>
                        {h.next_hearing_date && (
                          <div className="text-[10px] font-mono text-white/60 mt-0.5">
                            Next: {h.next_hearing_date}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => openEdit(h)}
                          className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                          title="Edit Hearing"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(h.hearing_id)}
                          className="p-1.5 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                          title="Delete Hearing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#664631] rounded-xl shadow-2xl border border-white/15 max-w-md w-full overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#5e412d]">
              <div className="flex items-center gap-2">
                <Gavel className="w-4 h-4 text-[#f5f0e7]" />
                <h3 className="font-serif font-semibold text-[#f5f0e7] text-sm">
                  {isEditing ? 'Update Hearing Docket' : 'Schedule Court Hearing'}
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
                  Matter / Case *
                </label>
                <select
                  value={formData.case_id}
                  onChange={(e) => setFormData({ ...formData, case_id: parseInt(e.target.value, 10) })}
                  className="w-full px-2.5 py-1.5 bg-[#5e412d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono focus:outline-none"
                >
                  {refData.cases.map((c) => (
                    <option key={c.case_id} value={c.case_id}>
                      {c.case_number} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                  Court Bench *
                </label>
                <select
                  value={formData.court_id}
                  onChange={(e) => setFormData({ ...formData, court_id: parseInt(e.target.value, 10) })}
                  className="w-full px-2.5 py-1.5 bg-[#5e412d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono focus:outline-none"
                >
                  {refData.courts.map((court) => (
                    <option key={court.court_id} value={court.court_id}>
                      {court.court_name} ({court.court_type} - {court.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.hearing_date}
                    onChange={(e) => setFormData({ ...formData, hearing_date: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#5e412d] border border-white/10 focus:border-white/30 rounded-md text-xs font-mono text-[#f5f0e7] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                    Start
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#5e412d] border border-white/10 focus:border-white/30 rounded-md text-xs font-mono text-[#f5f0e7] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                    End
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#5e412d] border border-white/10 focus:border-white/30 rounded-md text-xs font-mono text-[#f5f0e7] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                  Purpose / Stage *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cross-examination / Framing issues"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#5e412d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                    Outcome / Order
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Interim stay granted"
                    value={formData.outcome}
                    onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#5e412d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                    Adjourned Date
                  </label>
                  <input
                    type="date"
                    value={formData.next_hearing_date}
                    onChange={(e) => setFormData({ ...formData, next_hearing_date: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#5e412d] border border-white/10 focus:border-white/30 rounded-md text-xs font-mono text-[#f5f0e7] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                  Chamber Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Certified copy of plaint required."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#5e412d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] focus:outline-none"
                />
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
                  className="px-4 py-1.5 bg-gradient-to-b from-[#fbf5ec] to-[#e9d6b8] hover:from-[#ffffff] hover:to-[#f0e2c9] shadow-[0_8px_22px_-8px_rgba(20,12,6,0.6)] text-[#3b2a1f] rounded-md text-xs font-semibold uppercase tracking-wider shadow font-mono transition-colors cursor-pointer"
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
