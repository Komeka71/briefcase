import React, { useState, useEffect } from 'react';
import { practiceService, caseService } from '../services/api';
import {
  CheckSquare,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Filter,
  Calendar,
  Briefcase,
  Scale
} from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    case_id: 1,
    assigned_to: 1,
    title: '',
    description: '',
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    priority: 'High',
    status: 'Pending'
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await practiceService.getTasks();
      setTasks(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve practice tasks.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await caseService.getAll();
      setCases(res.data.data || []);
    } catch (err) {
      console.warn('Could not load cases:', err.message);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchCases();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await practiceService.createTask(formData);
      setSuccess('Action item successfully scheduled.');
      setModalOpen(false);
      setFormData({
        case_id: cases[0]?.case_id || 1,
        assigned_to: 1,
        title: '',
        description: '',
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        priority: 'High',
        status: 'Pending'
      });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await practiceService.updateTaskStatus(id, newStatus);
      setSuccess(`Task #${id} status moved to ${newStatus}.`);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete task #${id}?`)) return;
    try {
      await practiceService.deleteTask(id);
      setSuccess('Task deleted from chambers roster.');
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      searchTerm === '' ||
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.case_title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = selectedPriority === '' || t.priority === selectedPriority;
    const matchesStatus = selectedStatus === '' || t.status === selectedStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-6 animate-fadeIn">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2D32]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B8975A] flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Trial Preparation & Deadlines</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight mt-1 font-semibold">
            Action Items & Filing Deadlines
          </h2>
          <p className="text-xs text-[#B4B7BC] font-sans mt-0.5">
            Chambers trial prep, evidence deposition deadlines, vakalatnama execution, and legal filings.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="court-btn-brass px-4 py-2 rounded-[3px] text-xs font-mono uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4 text-[#0A0A0B]" />
          <span>Create Action Item</span>
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

      {/* Filter Toolbar */}
      <div className="court-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#6B6F76] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action items by title, docket #, or matter..."
            className="w-full pl-9 pr-3 py-1.5 court-input text-xs text-white placeholder-[#6B6F76] font-sans"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-[#6B6F76]" />
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="court-input px-3 py-1.5 text-xs text-white"
          >
            <option value="" className="bg-[#141416]">All Priorities</option>
            <option value="High" className="bg-[#141416]">High Priority</option>
            <option value="Medium" className="bg-[#141416]">Medium Priority</option>
            <option value="Low" className="bg-[#141416]">Low Priority</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="court-input px-3 py-1.5 text-xs text-white"
          >
            <option value="" className="bg-[#141416]">All Workflow Statuses</option>
            <option value="Pending" className="bg-[#141416]">Pending</option>
            <option value="In Progress" className="bg-[#141416]">In Progress</option>
            <option value="Completed" className="bg-[#141416]">Completed</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="court-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="court-table">
            <thead>
              <tr>
                <th>Action Item</th>
                <th>Case Docket</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Workflow Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-xs font-mono text-[#B4B7BC]">
                    Accessing trial preparation tasks...
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-xs font-serif text-[#6B6F76]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CheckSquare className="w-8 h-8 text-[#B8975A]/40" />
                      <p>All scheduled action items are currently resolved.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr key={t.task_id}>
                    <td>
                      <div>
                        <div className="font-serif font-medium text-white text-xs">{t.title}</div>
                        <div className="text-[10px] text-[#6B6F76] font-sans truncate max-w-xs mt-0.5">
                          {t.description || 'Trial deadline requirement'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-mono text-xs text-[#D4B97E]">{t.case_number}</div>
                      <div className="font-serif text-[11px] text-[#B4B7BC] truncate max-w-xs">
                        {t.case_title}
                      </div>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase ${
                        t.priority === 'High' ? 'badge-danger' :
                        t.priority === 'Medium' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <div className="font-mono text-xs text-[#F6F4EF] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#B8975A]" />
                        <span>{t.due_date ? String(t.due_date).slice(0, 10) : '—'}</span>
                      </div>
                    </td>
                    <td>
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.task_id, e.target.value)}
                        className={`text-xs font-mono px-2 py-1 rounded-[2px] border cursor-pointer ${
                          t.status === 'Completed' ? 'bg-[#3F7D5C]/20 border-[#3F7D5C]/60 text-[#72C095]' :
                          t.status === 'In Progress' ? 'bg-[#4A6A8A]/20 border-[#4A6A8A]/60 text-[#8EB7DF]' :
                          'bg-[#C08A2E]/20 border-[#C08A2E]/60 text-[#E2B056]'
                        }`}
                      >
                        <option value="Pending" className="bg-[#141416] text-[#E2B056]">Pending</option>
                        <option value="In Progress" className="bg-[#141416] text-[#8EB7DF]">In Progress</option>
                        <option value="Completed" className="bg-[#141416] text-[#72C095]">Completed</option>
                      </select>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDelete(t.task_id)}
                        className="p-1.5 rounded-[3px] text-[#6B6F76] hover:text-[#E67272] hover:bg-[#9B2C2C]/10 transition-colors cursor-pointer"
                        title="Delete Action Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="court-card-elevated max-w-lg w-full">
            <div className="px-5 py-3.5 border-b border-[#2B2D32] flex items-center justify-between bg-[#141416]">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-[#B8975A]" />
                <h3 className="font-serif font-semibold text-white text-sm">
                  Schedule Action Item & Deadline
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
                  Associate Legal Matter *
                </label>
                <select
                  value={formData.case_id}
                  onChange={(e) => setFormData({ ...formData, case_id: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                >
                  {cases.map((c) => (
                    <option key={c.case_id} value={c.case_id} className="bg-[#141416]">
                      {c.case_number} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Draft Written Statement & Serve Counter-Affidavit"
                  className="w-full px-3 py-1.5 court-input text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Priority Urgency
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  >
                    <option value="High" className="bg-[#141416]">High Priority</option>
                    <option value="Medium" className="bg-[#141416]">Medium Priority</option>
                    <option value="Low" className="bg-[#141416]">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Filing Deadline Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Instructions & Procedural Scope
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Specific instructions, evidence annexures, and filing requirements..."
                  className="w-full px-3 py-1.5 court-input text-xs text-white"
                />
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
                  Schedule Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
