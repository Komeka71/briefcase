import React, { useState, useEffect } from 'react';
import { practiceService, caseService } from '../services/api';
import {
  CheckSquare,
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Filter,
  Calendar,
  User,
  Briefcase
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
    <div className="space-y-4 pb-6">
      {/* Editorial Header */}
      <div className="relative overflow-hidden rounded-xl bg-[#241b15] border border-white/10 p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase font-semibold bg-[#2e231b] text-[#f5f0e7] border border-white/15">
            <CheckSquare className="w-3 h-3 text-white" />
            <span>Workflow & Deadlines</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-serif text-[#f5f0e7] tracking-tight">
            Action Items & <span className="italic text-white font-medium">Filing Deadlines</span>
          </h1>

          <p className="text-xs text-white/60 font-sans leading-relaxed">
            Trial preparation, evidence collation, cross-examination briefs, and statutory limitation dates.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="self-start md:self-auto inline-flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#1c1510] rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow font-mono cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Task</span>
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

      {/* Filters and Controls */}
      <div className="bg-[#241b15] p-3 rounded-lg border border-white/10 shadow-sm flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks or case #..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#1c1510] border border-white/10 rounded-md text-xs text-[#f5f0e7] placeholder-white/40 focus:border-white/30 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-white/50" />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 bg-[#1c1510] border border-white/10 rounded-md text-xs text-[#f5f0e7] font-mono focus:border-white/30 focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-[#1c1510] border border-white/10 rounded-md text-xs text-[#f5f0e7] font-mono focus:border-white/30 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <div className="text-xs font-mono text-white/60 px-2.5 py-1.5 bg-[#1c1510] border border-white/10 rounded-md">
            {filteredTasks.length} Tasks
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-[#241b15] rounded-xl border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-[#1c1510] text-white/50 text-[10px] uppercase tracking-wider font-mono border-b border-white/10">
              <tr>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Action Item</th>
                <th className="px-4 py-3 font-semibold">Matter Docket</th>
                <th className="px-4 py-3 font-semibold">Due Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-white/50 font-serif">
                    Querying chambers task roster...
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-white/50 font-serif">
                    <CheckSquare className="w-8 h-8 text-white/30 mx-auto mb-2" />
                    <p className="text-sm text-[#f5f0e7]">No action items match current filters.</p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.task_id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        task.priority === 'High' ? 'bg-red-950/60 text-red-300 border border-red-500/30' :
                        task.priority === 'Medium' ? 'bg-blue-950/60 text-blue-300 border border-blue-500/30' :
                        'bg-stone-800 text-white/60 border border-white/10'
                      }`}>
                        {task.priority}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-serif font-medium text-[#f5f0e7] text-xs group-hover:text-white transition-colors">
                        {task.title}
                      </div>
                      {task.description && (
                        <p className="text-white/50 text-[11px] line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-[#f5f0e7] text-xs truncate max-w-xs font-serif">
                        {task.case_title}
                      </div>
                      <div className="text-[10px] text-white/50 font-mono mt-0.5">
                        {task.case_number}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-white/80">
                        <Calendar className="w-3.5 h-3.5 text-white/40" />
                        <span>{task.due_date ? String(task.due_date).slice(0, 10) : '—'}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.task_id, e.target.value)}
                        className={`px-2 py-0.5 rounded text-xs font-mono border focus:outline-none ${
                          task.status === 'Completed' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' :
                          task.status === 'In Progress' ? 'bg-blue-950/60 text-blue-200 border-blue-500/30' :
                          'bg-[#1c1510] text-white/70 border-white/10'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(task.task_id)}
                        className="p-1.5 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                        title="Remove Task"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#241b15] rounded-xl shadow-2xl border border-white/15 max-w-md w-full overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#1c1510]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#f5f0e7]" />
                <h3 className="font-serif font-semibold text-[#f5f0e7] text-sm">
                  Assign Action Item
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                  Legal Matter *
                </label>
                <select
                  value={formData.case_id}
                  onChange={(e) => setFormData({ ...formData, case_id: parseInt(e.target.value, 10) })}
                  className="w-full px-2.5 py-1.5 bg-[#1c1510] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono focus:outline-none"
                >
                  {cases.map((c) => (
                    <option key={c.case_id} value={c.case_id}>
                      {c.case_number} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Draft interrogatories for cross-examination"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#1c1510] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#1c1510] border border-white/10 focus:border-white/30 rounded-md text-xs font-mono text-[#f5f0e7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#1c1510] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                  Briefing Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Consult senior counsel before submission."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#1c1510] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] focus:outline-none"
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
                  className="px-4 py-1.5 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#1c1510] rounded-md text-xs font-semibold uppercase tracking-wider shadow font-mono transition-colors cursor-pointer"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
