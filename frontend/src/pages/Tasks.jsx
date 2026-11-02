import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { practiceService, caseService } from '../services/api';
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
  CheckSquare,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Filter
} from 'lucide-react';

export default function Tasks() {
  const isAdmin = getRole() === 'Admin';
  const [tasks, setTasks] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(() => ({
    case_id: 1,
    assigned_to: 1,
    title: '',
    description: '',
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    priority: 'High',
    status: 'Pending'
  }));

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await practiceService.getTasks();
      setTasks(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve practice tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, [fetchTasks]);

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
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <PageHeader
        title="Action Items & Filing Deadlines"
        subtitle="Manage trial preparation checklists, statutory limitation dates, evidence deposition deadlines, and vakalatnama execution."
        category="Practice Workflows"
        badge="Limitation Tracker"
        actions={
          <MagneticButton
            variant="brass"
            size="md"
            onClick={() => setModalOpen(true)}
            icon={Plus}
            iconPosition="left"
            className="text-xs font-mono uppercase tracking-wider"
          >
            Create Action Item
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

      {/* Filter Toolbar */}
      <div className="court-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-steel absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action items by title, docket #, or matter..."
            className="court-input w-full pl-10 pr-4 py-2 text-xs"
          />
        </div>

        <div className="flex items-center space-x-2.5">
          <Filter className="w-4 h-4 text-steel" />
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="court-input px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="court-input px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="court-table-container">
        <table className="court-table">
          <thead>
            <tr>
              <th>Action Item Title</th>
              <th>Case Docket</th>
              <th>Priority Level</th>
              <th>Limitation Due Date</th>
              <th>Workflow Status</th>
              <th>Quick Status Update</th>
              {isAdmin && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="py-8">
                  <Skeleton rows={4} height="h-6" />
                </td>
              </tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6}>
                  <EmptyState
                    icon={CheckSquare}
                    title="No action items found"
                    description="All items are resolved or no entries matched the active filter criteria."
                    actionLabel="Create Action Item"
                    onAction={() => setModalOpen(true)}
                  />
                </td>
              </tr>
            ) : (
              filteredTasks.map((t) => (
                <tr key={t.task_id}>
                  <td>
                    <div>
                      <div className="font-serif font-medium text-ivory text-sm">{t.title}</div>
                      <div className="text-[11px] text-silver/60 font-sans truncate max-w-xs mt-0.5">
                        {t.description || 'Pre-trial filing checklist item'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-mono text-xs text-brass font-medium">{t.case_number}</div>
                    <div className="font-serif text-[11px] text-silver/80 truncate max-w-xs">
                      {t.case_title}
                    </div>
                  </td>
                  <td>
                    <StatusPill status={t.priority} showDot={false} />
                  </td>
                  <td>
                    <div className="font-mono text-xs text-ivory flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brass" />
                      <span>{t.due_date ? String(t.due_date).slice(0, 10) : '—'}</span>
                    </div>
                  </td>
                  <td>
                    <StatusPill status={t.status} />
                  </td>
                  <td>
                    <div className="flex items-center space-x-1.5">
                      {t.status !== 'Pending' && (
                        <button
                          onClick={() => handleStatusChange(t.task_id, 'Pending')}
                          className="px-2 py-0.5 rounded-xs bg-graphite text-[10px] font-mono text-silver hover:text-ivory border border-slate/40 cursor-pointer"
                        >
                          Pending
                        </button>
                      )}
                      {t.status !== 'In Progress' && (
                        <button
                          onClick={() => handleStatusChange(t.task_id, 'In Progress')}
                          className="px-2 py-0.5 rounded-xs bg-graphite text-[10px] font-mono text-amber-300 hover:text-amber-200 border border-amber-500/30 cursor-pointer"
                        >
                          In Progress
                        </button>
                      )}
                      {t.status !== 'Completed' && (
                        <button
                          onClick={() => handleStatusChange(t.task_id, 'Completed')}
                          className="px-2 py-0.5 rounded-xs bg-graphite text-[10px] font-mono text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="text-right">
                      <button
                        onClick={() => handleDelete(t.task_id)}
                        className="p-1.5 rounded-xs text-steel hover:text-red-400 hover:bg-court-danger/20 transition-colors cursor-pointer"
                        title="Delete Action Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Task Modal */}
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
                  <CheckSquare className="w-4 h-4 text-brass" />
                  <h3 className="font-serif font-medium text-ivory text-base">
                    Schedule Chambers Action Item
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
                    Associate Legal Matter *
                  </label>
                  <select
                    value={formData.case_id}
                    onChange={(e) => setFormData({ ...formData, case_id: Number(e.target.value) })}
                    className="court-input w-full px-3.5 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                  >
                    {cases.map((c) => (
                      <option key={c.case_id} value={c.case_id}>
                        {c.case_number} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Action Item Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. File Supplementary Counter Affidavit before Registrar"
                    className="court-input w-full px-3.5 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="court-input w-full px-3.5 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Statutory Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="court-input w-full px-3.5 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Description & Preparation Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Evidentiary exhibits required, counsel instructions, and verification steps..."
                    className="court-input w-full px-3.5 py-2 text-xs"
                  />
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
                    Create Action Item
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
