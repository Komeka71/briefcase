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
  User,
  Scale
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
    <div className="space-y-6 pb-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2D32]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B8975A] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Retained Representation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight mt-1 font-semibold">
            Clients Registry
          </h2>
          <p className="text-xs text-[#B4B7BC] font-sans mt-0.5">
            Enterprise and individual client records powered by MySQL 8.0 Stored Procedures, cursors & pagination.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="court-btn-brass px-4 py-2 rounded-[3px] text-xs font-mono uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4 text-[#0A0A0B]" />
          <span>Enrol New Client</span>
        </button>
      </div>

      {/* Stored Procedure & Cursor Operations Strip */}
      <div className="court-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Database className="w-4 h-4 text-[#B8975A]" />
          <span className="font-serif font-medium text-white">Stored Procedure Engine:</span>
          <span className="text-[11px] font-mono text-[#B4B7BC]">PaginateClients & DisplayAllClients</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => runCursor(null)}
            disabled={cursorLoading}
            className="court-btn-outline px-3 py-1.5 rounded-[3px] text-xs font-mono flex items-center gap-1.5 transition-all"
            title="Execute CALL DisplayAllClients() procedure"
          >
            <Play className="w-3 h-3 text-[#D4B97E]" />
            <span>Cursor (Full)</span>
          </button>

          <button
            onClick={() => runCursor(5)}
            disabled={cursorLoading}
            className="court-btn-outline px-3 py-1.5 rounded-[3px] text-xs font-mono flex items-center gap-1.5 transition-all"
            title="Execute CALL DisplayClientsWithLimit(5)"
          >
            <Play className="w-3 h-3 text-[#D4B97E]" />
            <span>Cursor (Limit 5)</span>
          </button>

          <button
            onClick={fetchXml}
            className="court-btn-outline px-3 py-1.5 rounded-[3px] text-xs font-mono flex items-center gap-1.5 transition-all"
            title="Serialize clients to XML stream"
          >
            <FileCode className="w-3 h-3 text-[#72C095]" />
            <span>XML Stream</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 bg-[#9B2C2C]/20 border border-[#9B2C2C]/60 rounded-[3px] text-[#E67272] text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-[#3F7D5C]/20 border border-[#3F7D5C]/60 rounded-[3px] text-[#72C095] text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="court-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#6B6F76] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, email, phone, or address..."
            className="w-full pl-9 pr-3 py-1.5 court-input text-xs text-white placeholder-[#6B6F76] font-sans"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[#6B6F76] font-mono text-[11px]">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="court-input px-2.5 py-1 text-xs text-white"
          >
            <option value={5} className="bg-[#141416]">5 / page</option>
            <option value={10} className="bg-[#141416]">10 / page</option>
            <option value={25} className="bg-[#141416]">25 / page</option>
          </select>
        </div>
      </form>

      {/* Clients Table */}
      <div className="court-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="court-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Client Name</th>
                <th>Classification</th>
                <th>Telephone</th>
                <th>Official Email</th>
                <th>Address</th>
                <th>Enrolled Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-xs font-mono text-[#B4B7BC]">
                    Invoking PaginateClients procedure...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-xs font-serif text-[#6B6F76]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-[#B8975A]/40" />
                      <p>No client records match the current filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.client_id}>
                    <td className="font-mono text-xs text-[#D4B97E] font-semibold">
                      #{c.client_id}
                    </td>
                    <td className="font-serif font-medium text-white text-xs">
                      {c.name}
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase inline-flex items-center gap-1 ${
                        c.client_type === 'Organization' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {c.client_type === 'Organization' ? <Building2 className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                        <span>{c.client_type}</span>
                      </span>
                    </td>
                    <td className="font-mono text-xs text-[#B4B7BC]">
                      {c.phone || '—'}
                    </td>
                    <td className="font-mono text-xs text-[#F6F4EF]">
                      {c.email || '—'}
                    </td>
                    <td className="text-xs text-[#B4B7BC] max-w-xs truncate">
                      {c.address || '—'}
                    </td>
                    <td className="font-mono text-xs text-[#6B6F76]">
                      {c.created_at ? String(c.created_at).slice(0, 10) : '—'}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-[3px] text-[#B4B7BC] hover:text-white hover:bg-[#1E1F23] transition-colors cursor-pointer"
                          title="Edit Client"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.client_id)}
                          className="p-1.5 rounded-[3px] text-[#6B6F76] hover:text-[#E67272] hover:bg-[#9B2C2C]/10 transition-colors cursor-pointer"
                          title="Delete Client"
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

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-[#141416] border-t border-[#2B2D32] flex items-center justify-between text-xs">
          <div className="text-[#6B6F76] font-mono text-[11px]">
            Showing Page <span className="text-white font-medium">{page}</span> of{' '}
            <span className="text-white font-medium">{totalPages}</span> ({totalRecords} records)
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-[3px] border border-[#2B2D32] text-[#B4B7BC] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[#D4B97E] text-xs font-semibold">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-[3px] border border-[#2B2D32] text-[#B4B7BC] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="court-card-elevated max-w-lg w-full">
            <div className="px-5 py-3.5 border-b border-[#2B2D32] flex items-center justify-between bg-[#141416]">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#B8975A]" />
                <h3 className="font-serif font-semibold text-white text-sm">
                  {isEditing ? `Edit Client Record #${editId}` : 'Enrol New Client'}
                </h3>
              </div>
              <button
                onClick={() => setFormModalOpen(false)}
                className="text-[#6B6F76] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Full Name / Entity Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Patel or Reliance Industries Ltd"
                  className="w-full px-3 py-1.5 court-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Client Classification
                </label>
                <select
                  value={formData.client_type}
                  onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                  className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                >
                  <option value="Individual" className="bg-[#141416]">Individual</option>
                  <option value="Organization" className="bg-[#141416]">Organization / Corporate Entity</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Telephone (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@domain.in"
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Chambers / Residential Address
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, Pin Code"
                  className="w-full px-3 py-1.5 court-input text-xs text-white"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2.5 border-t border-[#2B2D32]">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="court-btn-outline px-4 py-1.5 rounded-[3px] text-xs font-mono uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="court-btn-brass px-5 py-1.5 rounded-[3px] text-xs font-mono font-semibold uppercase tracking-wider shadow"
                >
                  {isEditing ? 'Save Changes' : 'Enrol Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Explicit Cursor Procedure Output Modal */}
      {cursorModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="court-card-elevated max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="px-5 py-3.5 border-b border-[#2B2D32] flex items-center justify-between bg-[#141416]">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-[#B8975A]" />
                <h3 className="font-serif font-semibold text-white text-sm">
                  MySQL Explicit Cursor Telemetry: {cursorType}
                </h3>
              </div>
              <button
                onClick={() => setCursorModalOpen(false)}
                className="text-[#6B6F76] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-[#B4B7BC] font-sans">
                Iterated row-by-row via server-side MySQL stored procedure cursor cursor_client:
              </p>

              <div className="border border-[#2B2D32] rounded-[3px] overflow-hidden">
                <table className="court-table text-xs">
                  <thead>
                    <tr>
                      <th>Cursor Row</th>
                      <th>Client Name</th>
                      <th>Classification</th>
                      <th>Phone</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cursorData.map((c, i) => (
                      <tr key={c.client_id || i}>
                        <td className="font-mono text-[10px] text-[#B8975A]">#{i + 1}</td>
                        <td className="font-serif font-medium text-white">{c.name}</td>
                        <td className="font-mono text-[10px]">{c.client_type}</td>
                        <td className="font-mono text-[11px]">{c.phone}</td>
                        <td className="font-mono text-[11px]">{c.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#2B2D32] bg-[#141416] flex justify-end">
              <button
                onClick={() => setCursorModalOpen(false)}
                className="court-btn-outline px-4 py-1.5 rounded-[3px] text-xs font-mono uppercase tracking-wider"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* XML Stream Output Modal */}
      {xmlModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="court-card-elevated max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="px-5 py-3.5 border-b border-[#2B2D32] flex items-center justify-between bg-[#141416]">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-[#72C095]" />
                <h3 className="font-serif font-semibold text-white text-sm">
                  XML Document Serialization Stream
                </h3>
              </div>
              <button
                onClick={() => setXmlModalOpen(false)}
                className="text-[#6B6F76] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <pre className="p-4 bg-[#0A0A0B] border border-[#2B2D32] rounded-[3px] text-[11px] font-mono text-[#D4B97E] overflow-x-auto max-h-96 leading-relaxed">
                {xmlContent}
              </pre>
            </div>

            <div className="px-5 py-3 border-t border-[#2B2D32] bg-[#141416] flex justify-end">
              <button
                onClick={() => setXmlModalOpen(false)}
                className="court-btn-outline px-4 py-1.5 rounded-[3px] text-xs font-mono uppercase tracking-wider"
              >
                Close Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
