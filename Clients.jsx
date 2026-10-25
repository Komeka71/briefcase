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
  FileCode,
  AlertCircle,
  CheckCircle2,
  X,
  Play,
  Building2,
  User
} from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Pagination state (PaginateClients Stored Procedure)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Cursor modal state
  const [cursorModalOpen, setCursorModalOpen] = useState(false);
  const [cursorData, setCursorData] = useState([]);
  const [cursorType, setCursorType] = useState('');
  const [cursorLoading, setCursorLoading] = useState(false);

  // XML Modal state
  const [xmlModalOpen, setXmlModalOpen] = useState(false);
  const [xmlContent, setXmlContent] = useState('');

  // Form modal state
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

  const fetchXml = async () => {
    try {
      const res = await clientService.getAll('xml');
      setXmlContent(res.data);
      setXmlModalOpen(true);
    } catch (err) {
      setError('XML serialization failed.');
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    try {
      if (isEditing) {
        await clientService.update(editId, formData);
        setSuccessMsg(`Client #${editId} record updated.`);
      } else {
        await clientService.create(formData);
        setSuccessMsg(`Client "${formData.name}" enrolled.`);
      }
      setFormModalOpen(false);
      resetForm();
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.message || 'Database rejected client mutation.');
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
    if (!window.confirm(`Delete client record #${id}? Dependent case assignments may prevent deletion.`)) {
      return;
    }
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await clientService.delete(id);
      setSuccessMsg(res.data.message || 'Client record deleted.');
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot delete client. Dependent litigation matters exist.');
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header - Compact & Responsive */}
      <div className="bg-[#1c1510] border border-white/10 rounded-sm p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider uppercase font-semibold bg-[#2e231b] text-white border border-white/15">
              Client Registry
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-serif text-white tracking-tight">
            Institutional & Individual <span className="italic text-[#d9b98f]">Client Registry</span>
          </h1>

          <p className="text-xs text-[#f5f0e7]/70 font-sans max-w-xl">
            Principal legal relationships managed via MySQL stored procedures and validation triggers.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => runCursor(null)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#150f0b] hover:bg-[#2e231b] text-[#f5f0e7]/80 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider border border-white/10 transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Cursor Batch</span>
          </button>

          <button
            onClick={fetchXml}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#150f0b] hover:bg-[#2e231b] text-[#f5f0e7]/80 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider border border-white/10 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export XML</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#150f0b] rounded-sm text-xs font-mono font-medium uppercase tracking-wider transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Client</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-3 bg-[#1e1517] border-l-4 border-red-500 rounded-sm text-red-200 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-[#151e18] border-l-4 border-emerald-500 rounded-sm text-emerald-200 text-xs flex items-start space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="bg-[#1c1510] p-3 rounded-sm border border-white/10 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, email, or classification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#150f0b] border border-white/10 rounded-sm text-xs text-white placeholder-[#f5f0e7]/30 focus:border-white focus:outline-none transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-[#f5f0e7]/40 absolute left-2.5 top-2" />
        </form>

        <div className="flex items-center space-x-3 text-xs font-mono text-[#f5f0e7]/70">
          <div className="flex items-center space-x-1.5">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="border border-white/10 rounded-sm px-2 py-1 bg-[#150f0b] text-white font-mono text-xs focus:outline-none"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
          <span className="text-white border-l border-white/10 pl-3">
            Total: {totalRecords}
          </span>
        </div>
      </div>

      {/* Clients Data Table */}
      <div className="bg-[#1c1510] rounded-sm border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#f5f0e7]/75">
            <thead className="bg-[#150f0b] text-[#f5f0e7]/60 text-[10px] uppercase tracking-wider font-mono border-b border-white/10">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Client Legal Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Registration</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-[#f5f0e7]/60">
                    Loading client records...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-[#f5f0e7]/60 font-serif">
                    No matching client records found.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.client_id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-white">
                      #{c.client_id}
                    </td>
                    <td className="px-4 py-3 font-serif font-semibold text-white text-xs">
                      {c.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-sm text-[10px] font-mono ${
                        c.client_type === 'Organization'
                          ? 'bg-[#2e231b] text-white border border-white/20'
                          : 'bg-[#150f0b] text-[#f5f0e7]/70 border border-white/10'
                      }`}>
                        {c.client_type === 'Organization' ? <Building2 className="w-3 h-3 text-white" /> : <User className="w-3 h-3" />}
                        <span>{c.client_type}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px]">
                      <div className="text-white">{c.phone || '—'}</div>
                      <div className="text-[#f5f0e7]/50">{c.email || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-xs font-serif text-[#f5f0e7]/70 max-w-xs truncate">
                      {c.address || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[#f5f0e7]/70">
                      {c.date_of_registration}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(c)}
                        title="Update Client"
                        className="p-1 text-[#f5f0e7]/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.client_id)}
                        title="Delete Client"
                        className="p-1 text-[#f5f0e7]/60 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors"
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

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#f5f0e7]/60 bg-[#150f0b]">
          <div>
            Page <span className="text-white font-medium">{page}</span> of{' '}
            <span className="text-white font-medium">{totalPages}</span>
            <span className="text-white/20 mx-2">|</span>
            <span>{clients.length} of {totalRecords} records</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded-sm border border-white/10 hover:border-white/30 disabled:opacity-30 disabled:pointer-events-none text-white"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded-sm border border-white/10 hover:border-white/30 disabled:opacity-30 disabled:pointer-events-none text-white"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#1c1510] rounded-sm shadow-2xl border border-white/20 max-w-lg w-full overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#150f0b]">
              <h3 className="font-serif font-semibold text-white text-base">
                {isEditing ? 'Update Client Record' : 'Enroll New Client'}
              </h3>
              <button
                onClick={() => setFormModalOpen(false)}
                className="text-[#f5f0e7]/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75 mb-1">
                  Client Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Patel or Reliance Industries Ltd"
                  className="w-full px-3 py-2 bg-[#150f0b] border border-white/10 focus:border-white rounded-sm text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75 mb-1">
                  Classification *
                </label>
                <select
                  value={formData.client_type}
                  onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                  className="w-full px-3 py-2 bg-[#150f0b] border border-white/10 focus:border-white rounded-sm text-xs text-white focus:outline-none font-mono"
                >
                  <option value="Individual">Individual</option>
                  <option value="Organization">Organization</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98980 12345"
                    className="w-full px-3 py-2 bg-[#150f0b] border border-white/10 focus:border-white rounded-sm text-xs font-mono text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@domain.com"
                    className="w-full px-3 py-2 bg-[#150f0b] border border-white/10 focus:border-white rounded-sm text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75 mb-1">Address / Jurisdiction</label>
                <textarea
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, State"
                  className="w-full px-3 py-2 bg-[#150f0b] border border-white/10 focus:border-white rounded-sm text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2.5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-3.5 py-1.5 border border-white/10 text-[#f5f0e7]/70 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#150f0b] rounded-sm text-xs font-mono font-medium uppercase tracking-wider shadow-md"
                >
                  {isEditing ? 'Save Changes' : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Explicit Cursor Results Modal */}
      {cursorModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#1c1510] rounded-sm shadow-2xl border border-white/20 max-w-xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#150f0b]">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-white" />
                <h3 className="font-serif font-semibold text-white text-sm">{cursorType} Batch Stream</h3>
              </div>
              <button onClick={() => setCursorModalOpen(false)} className="text-[#f5f0e7]/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              <div className="border border-white/10 rounded-sm overflow-hidden">
                <table className="w-full text-left text-xs text-[#f5f0e7]/75 font-mono">
                  <thead className="bg-[#150f0b] text-[#f5f0e7]/60 text-[10px] uppercase border-b border-white/10">
                    <tr>
                      <th className="px-3 py-2">Seq</th>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Client Name</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {cursorData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="px-3 py-2 text-white font-bold">{row.cursor_seq_no}</td>
                        <td className="px-3 py-2 text-[#f5f0e7]/60">#{row.client_id}</td>
                        <td className="px-3 py-2 text-white">{row.client_name}</td>
                        <td className="px-3 py-2 text-[#f5f0e7]/60">{row.client_type}</td>
                        <td className="px-3 py-2">
                          <span className="px-1.5 py-0.5 rounded-sm bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[9px]">
                            FETCHED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-5 py-2.5 border-t border-white/10 bg-[#150f0b] flex justify-end">
              <button
                onClick={() => setCursorModalOpen(false)}
                className="px-3.5 py-1.5 bg-[#2e231b] hover:bg-[#3a2d24] text-white border border-white/10 rounded-sm text-xs font-mono uppercase tracking-wider"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* XML Viewer Modal */}
      {xmlModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#1c1510] rounded-sm shadow-2xl border border-white/20 max-w-xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#150f0b]">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-white" />
                <h3 className="font-serif font-semibold text-white text-sm">XML Serialized Payload</h3>
              </div>
              <button onClick={() => setXmlModalOpen(false)} className="text-[#f5f0e7]/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              <pre className="bg-[#150f0b] text-emerald-300 p-3 rounded-sm font-mono text-xs overflow-x-auto border border-white/10">
                {xmlContent}
              </pre>
            </div>

            <div className="px-5 py-2.5 border-t border-white/10 bg-[#150f0b] flex justify-end">
              <button
                onClick={() => setXmlModalOpen(false)}
                className="px-3.5 py-1.5 bg-[#2e231b] hover:bg-[#3a2d24] text-white border border-white/10 rounded-sm text-xs font-mono uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
