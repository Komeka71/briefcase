import React, { useState, useEffect } from 'react';
import { clientService } from '../services/api';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Database,
  Code2,
  FileCode,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  Play,
  Building2,
  User,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Pagination state (Req 10.5)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Cursor modal state (Req 10.4)
  const [cursorModalOpen, setCursorModalOpen] = useState(false);
  const [cursorData, setCursorData] = useState([]);
  const [cursorType, setCursorType] = useState('');
  const [cursorLimit, setCursorLimit] = useState(5);
  const [cursorLoading, setCursorLoading] = useState(false);

  // XML Modal state (Req 11.F)
  const [xmlModalOpen, setXmlModalOpen] = useState(false);
  const [xmlContent, setXmlContent] = useState('');

  // Form modal state (Req 10.1)
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    client_type: 'Individual',
    phone: '',
    email: '',
    address: ''
  });

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await clientService.getPaginated(page, pageSize, search);
      setClients(res.data.data || []);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.total_pages);
        setTotalRecords(res.data.pagination.total_records);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load clients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [page, pageSize, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchClients();
  };

  // Cursor procedure execution
  const runCursor = async (limit = null) => {
    setCursorLoading(true);
    try {
      const res = await clientService.getCursor(limit);
      setCursorData(res.data.data || []);
      setCursorType(res.data.cursorType || 'Explicit Cursor');
      setCursorModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Cursor procedure failed.');
    } finally {
      setCursorLoading(false);
    }
  };

  // XML Export
  const fetchXml = async () => {
    try {
      const res = await clientService.getAll('xml');
      setXmlContent(res.data);
      setXmlModalOpen(true);
    } catch (err) {
      setError('Failed to generate XML output.');
    }
  };

  // Form submit (InsertClient / UpdateClient Stored Procedures)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      if (isEditing) {
        const res = await clientService.update(editId, formData);
        setSuccessMsg(res.data.message || 'Client updated via UpdateClient procedure.');
      } else {
        const res = await clientService.create(formData);
        setSuccessMsg(`Client created via InsertClient procedure (Client ID: ${res.data.client_id}).`);
      }
      setFormModalOpen(false);
      resetForm();
      fetchClients();
    } catch (err) {
      // Highlight Trigger or Procedure validation errors
      setError(err.response?.data?.message || err.message || 'Operation failed.');
    }
  };

  const openAddModal = () => {
    resetForm();
    setIsEditing(false);
    setFormModalOpen(true);
  };

  const openEditModal = (client) => {
    setFormData({
      name: client.name || '',
      client_type: client.client_type || 'Individual',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || ''
    });
    setEditId(client.client_id);
    setIsEditing(true);
    setFormModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      client_type: 'Individual',
      phone: '',
      email: '',
      address: ''
    });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete client record #${id}?\nThis will invoke Stored Procedure DeleteClient and enforce referential integrity.`)) {
      return;
    }
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await clientService.delete(id);
      setSuccessMsg(res.data.message || 'Client deleted successfully.');
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot delete client. Dependent cases or records exist.');
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
              Lab Assignment 10 • Req 10.1, 10.4, 10.5
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              CALL InsertClient / UpdateClient / DeleteClient
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-normal text-white tracking-tight">
            Clients Registry & <span className="italic text-[#c9a96e]">Stored Procedures</span>
          </h1>

          <p className="text-xs md:text-sm text-slate-300 font-serif leading-relaxed max-w-2xl">
            Manage principal legal relationships. Powered by MySQL explicit cursors, server-side pagination,
            and declarative BEFORE INSERT/UPDATE data sanitization triggers.
          </p>
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => runCursor(null)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#18263d] hover:bg-[#22334d] text-slate-200 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider border border-white/10 hover:border-[#c9a96e]/40 transition-all duration-200"
          >
            <Database className="w-3.5 h-3.5 text-[#c9a96e]" />
            <span>Unbounded Cursor</span>
          </button>

          <button
            onClick={() => runCursor(5)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#18263d] hover:bg-[#22334d] text-slate-200 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider border border-white/10 hover:border-[#c9a96e]/40 transition-all duration-200"
          >
            <Play className="w-3.5 h-3.5 text-[#dfbe85]" />
            <span>Cursor (Limit 5)</span>
          </button>

          <button
            onClick={fetchXml}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#18263d] hover:bg-[#22334d] text-slate-200 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider border border-white/10 hover:border-[#c9a96e]/40 transition-all duration-200"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-300" />
            <span>Export XML (11.F)</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-black/30 font-mono"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Client</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 bg-[#18263d] border-l-4 border-red-500 rounded-sm text-slate-200 flex items-start space-x-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-red-300 font-mono uppercase tracking-wider">
              MySQL Error / Trigger Integrity Constraint:
            </div>
            <div className="mt-1 text-slate-300 font-serif text-sm">{error}</div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-[#18263d] border-l-4 border-emerald-500 rounded-sm text-slate-200 flex items-start space-x-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-emerald-300 font-mono uppercase tracking-wider">
              Operation Completed:
            </div>
            <div className="mt-1 text-slate-300 font-serif text-sm">{successMsg}</div>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-[#141f32] p-4 rounded-sm border border-white/10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by legal name, email, or client type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="border border-white/10 rounded-sm px-2.5 py-1 bg-[#101827] text-white font-mono text-xs focus:outline-none focus:border-[#c9a96e]"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
          <span className="text-[#c9a96e] border-l border-white/10 pl-3">
            Total Entities: {totalRecords}
          </span>
        </div>
      </div>

      {/* Clients Editorial Data Table (Req 11.1) */}
      <div className="bg-[#141f32] rounded-sm border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0e1624] text-slate-400 text-[11px] uppercase tracking-wider font-mono border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Client Legal Name</th>
                <th className="px-5 py-3.5">Classification</th>
                <th className="px-5 py-3.5">Contact Telemetry</th>
                <th className="px-5 py-3.5">Jurisdiction / Address</th>
                <th className="px-5 py-3.5">Registration Date</th>
                <th className="px-5 py-3.5 text-right">Procedure Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-[#c9a96e]/30 border-t-[#c9a96e] rounded-full animate-spin" />
                      <span className="font-serif text-slate-300">Executing PaginateClients Stored Procedure...</span>
                    </div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 font-serif">
                    No matching client records found in database.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.client_id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-[#c9a96e]">
                      #{c.client_id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-serif font-semibold text-white text-sm">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Upper-normalized via Trigger 10.8
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-sm text-[11px] font-mono ${
                        c.client_type === 'Organization'
                          ? 'bg-[#18263d] text-[#dfbe85] border border-[#c9a96e]/30'
                          : 'bg-white/5 text-slate-300 border border-white/10'
                      }`}>
                        {c.client_type === 'Organization' ? <Building2 className="w-3 h-3 text-[#c9a96e]" /> : <User className="w-3 h-3 text-slate-400" />}
                        <span>{c.client_type}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px]">
                      <div className="text-slate-200">{c.phone || '—'}</div>
                      <div className="text-slate-500">{c.email || '—'}</div>
                    </td>
                    <td className="px-5 py-4 text-xs font-serif text-slate-300 max-w-xs truncate">
                      {c.address || '—'}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-400">
                      {c.date_of_registration}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(c)}
                        title="Update via Stored Procedure"
                        className="p-1.5 text-slate-400 hover:text-[#dfbe85] hover:bg-white/5 rounded-sm transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.client_id)}
                        title="Delete via Stored Procedure (Integrity Checked)"
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-sm transition-colors"
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

        {/* Pagination Bar (Req 10.5) */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400 bg-[#0e1624]">
          <div>
            Page <span className="font-semibold text-white">{page}</span> of{' '}
            <span className="font-semibold text-white">{totalPages}</span>
            <span className="text-slate-600 mx-2">|</span>
            <span>Displaying {clients.length} of {totalRecords} records</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-sm border border-white/10 hover:border-[#c9a96e]/40 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-sm border border-white/10 hover:border-[#c9a96e]/40 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Client Modal (Invokes InsertClient or UpdateClient) */}
      {formModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141f32] rounded-sm shadow-2xl border border-[#c9a96e]/30 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#18263d]">
              <div>
                <h3 className="font-serif font-semibold text-white text-base">
                  {isEditing ? 'Update Client Record (UpdateClient)' : 'Add New Client (InsertClient)'}
                </h3>
                <p className="text-[10px] font-mono text-[#c9a96e] mt-0.5">
                  Stored Procedure Execution Environment
                </p>
              </div>
              <button
                onClick={() => setFormModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div className="p-3 bg-[#101827] border border-[#c9a96e]/20 rounded-sm text-xs text-slate-300 space-y-1">
                <div className="font-mono text-[#dfbe85] uppercase tracking-wider text-[10px] font-semibold">
                  Trigger & Procedure Rules Enforced:
                </div>
                <div className="text-[11px] font-serif leading-relaxed text-slate-400">
                  • Name must be $\ge 2$ characters (Empty name triggers SQLSTATE 45000).<br />
                  • Client Type must be strictly <code className="text-[#c9a96e] font-mono">Individual</code> or <code className="text-[#c9a96e] font-mono">Organization</code>.<br />
                  • Name will automatically normalize to UPPERCASE before saving via Trigger 10.8.
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Client Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Patel or Reliance Industries"
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Client Classification <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.client_type}
                  onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white focus:outline-none font-mono"
                >
                  <option value="Individual">Individual</option>
                  <option value="Organization">Organization</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98980 12345"
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@domain.com"
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Address / Jurisdiction</label>
                <textarea
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, State"
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white focus:outline-none font-serif"
                ></textarea>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 border border-white/10 text-slate-400 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
                >
                  {isEditing ? 'Execute UpdateClient' : 'Execute InsertClient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Explicit Cursor Results Modal (Req 10.4) */}
      {cursorModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141f32] rounded-sm shadow-2xl border border-[#c9a96e]/40 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#18263d]">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-[#c9a96e]" />
                <h3 className="font-serif font-semibold text-white text-base">{cursorType}</h3>
              </div>
              <button onClick={() => setCursorModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-3 bg-[#101827] border border-[#c9a96e]/20 rounded-sm text-xs text-slate-300 space-y-1 font-serif">
                <div className="font-mono text-[#dfbe85] uppercase tracking-wider text-[10px] font-semibold">
                  Requirement 10.4 Architecture:
                </div>
                <div>
                  This procedure executed an <strong>explicit cursor</strong> with row-by-row iteration in MySQL:
                  <code className="text-[#c9a96e] bg-black/40 px-1 py-0.5 rounded font-mono ml-1">
                    DECLARE ... CURSOR FOR SELECT ... OPEN ... FETCH ... CLOSE
                  </code>
                </div>
              </div>

              <div className="border border-white/10 rounded-sm overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300 font-mono">
                  <thead className="bg-[#0e1624] text-slate-400 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-3.5 py-2.5">Cursor Seq</th>
                      <th className="px-3.5 py-2.5">Client ID</th>
                      <th className="px-3.5 py-2.5">Client Name</th>
                      <th className="px-3.5 py-2.5">Type</th>
                      <th className="px-3.5 py-2.5">Processed Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {cursorData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="px-3.5 py-2.5 text-[#c9a96e] font-bold">{row.cursor_seq_no}</td>
                        <td className="px-3.5 py-2.5 text-slate-400">#{row.client_id}</td>
                        <td className="px-3.5 py-2.5 font-semibold text-white">{row.client_name}</td>
                        <td className="px-3.5 py-2.5 text-slate-300">{row.client_type}</td>
                        <td className="px-3.5 py-2.5">
                          <span className="px-2 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                            FETCHED VIA CURSOR
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-white/10 bg-[#0e1624] flex justify-end">
              <button
                onClick={() => setCursorModalOpen(false)}
                className="px-4 py-2 bg-[#18263d] hover:bg-[#22334d] text-[#dfbe85] border border-[#c9a96e]/30 rounded-sm text-xs font-mono uppercase tracking-wider"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* XML Viewer Modal (Req 11.F) */}
      {xmlModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141f32] rounded-sm shadow-2xl border border-[#c9a96e]/40 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#18263d]">
              <div className="flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-[#c9a96e]" />
                <h3 className="font-serif font-semibold text-white text-base">Raw XML Serialized Output (Query 1)</h3>
              </div>
              <button onClick={() => setXmlModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="p-2.5 bg-[#101827] border border-[#c9a96e]/20 rounded text-xs text-[#dfbe85] mb-3 font-mono">
                Content-Type: application/xml; charset=utf-8 (Lab Assignment 11 Requirement F)
              </div>
              <pre className="bg-[#0a0f18] text-emerald-400 p-4 rounded-sm font-mono text-xs overflow-x-auto leading-relaxed border border-white/10">
                {xmlContent}
              </pre>
            </div>

            <div className="px-6 py-3 border-t border-white/10 bg-[#0e1624] flex justify-end">
              <button
                onClick={() => setXmlModalOpen(false)}
                className="px-4 py-2 bg-[#18263d] hover:bg-[#22334d] text-[#dfbe85] border border-[#c9a96e]/30 rounded-sm text-xs font-mono uppercase tracking-wider"
              >
                Close XML Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
