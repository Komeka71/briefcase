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
  Play
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Lab Assignment 10 • Req 10.1, 10.4, 10.5
            </span>
            <span className="text-xs text-slate-500 font-mono">CALL InsertClient / UpdateClient / DeleteClient</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Client Management & Stored Procedures</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Interacts with MySQL Stored Procedures, Explicit Cursors, Pagination Functions, and Data Validation Triggers.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => runCursor(null)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Unbounded Cursor</span>
          </button>

          <button
            onClick={() => runCursor(5)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold border border-purple-200 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Cursor (Limit 5)</span>
          </button>

          <button
            onClick={fetchXml}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export XML (Req 11.F)</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Client (Insert Procedure)</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-semibold">MySQL Error / Trigger Integrity Signal:</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-semibold">Operation Completed:</div>
            <div>{successMsg}</div>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by name, email, or client type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </form>

        <div className="flex items-center space-x-3 text-xs text-slate-500">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border border-slate-200 rounded px-2 py-1 bg-white font-medium focus:outline-none"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
          <span className="font-mono">Total Records: {totalRecords}</span>
        </div>
      </div>

      {/* Clients HTML Table (Req 11.1) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Client Name (Normalized)</th>
                <th className="px-5 py-3.5">Client Type</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Address</th>
                <th className="px-5 py-3.5">Registered Date</th>
                <th className="px-5 py-3.5 text-right">Procedure Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    Executing PaginateClients Stored Procedure...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    No matching client records found.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.client_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-slate-800">#{c.client_id}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {c.name}
                      <div className="text-[10px] text-slate-400 font-normal">Upper-normalized via Trigger 10.8</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        c.client_type === 'Organization'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {c.client_type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-slate-900 font-mono">{c.phone || '—'}</div>
                      <div className="text-xs text-slate-500 font-mono">{c.email || '—'}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 max-w-xs truncate">{c.address || '—'}</td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-500">{c.date_of_registration}</td>
                    <td className="px-5 py-4 text-right space-x-1.5">
                      <button
                        onClick={() => openEditModal(c)}
                        title="Update via Stored Procedure"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.client_id)}
                        title="Delete via Stored Procedure (Integrity Checked)"
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Page <span className="font-semibold text-slate-800">{page}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Client Modal (Invokes InsertClient or UpdateClient) */}
      {formModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {isEditing ? 'Update Client Record (UpdateClient)' : 'Add New Client (InsertClient)'}
              </h3>
              <button onClick={() => setFormModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
                <div className="font-semibold">Trigger & Procedure Rules Enforced:</div>
                <div>• Name must be $\ge 2$ characters (Empty name triggers SQLSTATE 45000).</div>
                <div>• Client Type must be strictly <code className="bg-amber-100 px-1 rounded">Individual</code> or <code className="bg-amber-100 px-1 rounded">Organization</code>.</div>
                <div>• Name will automatically normalize to UPPERCASE before saving.</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Patel or Reliance Industries"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.client_type}
                  onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Individual">Individual</option>
                  <option value="Organization">Organization</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98980 12345"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@domain.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address / Jurisdiction</label>
                <textarea
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, State"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">{cursorType}</h3>
              </div>
              <button onClick={() => setCursorModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900 space-y-1">
                <div className="font-semibold">Requirement 10.4 Architecture:</div>
                <div>
                  This procedure executed an <strong>explicit cursor</strong> with row-by-row iteration in MySQL:
                  <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono ml-1">
                    DECLARE ... CURSOR FOR SELECT ... OPEN ... FETCH ... CLOSE
                  </code>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase">
                    <tr>
                      <th className="px-3.5 py-2">Cursor Seq</th>
                      <th className="px-3.5 py-2">Client ID</th>
                      <th className="px-3.5 py-2">Client Name</th>
                      <th className="px-3.5 py-2">Type</th>
                      <th className="px-3.5 py-2">Processed By Cursor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cursorData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3.5 py-2.5 font-mono text-indigo-600 font-bold">{row.cursor_seq_no}</td>
                        <td className="px-3.5 py-2.5 font-mono">#{row.client_id}</td>
                        <td className="px-3.5 py-2.5 font-semibold text-slate-900">{row.client_name}</td>
                        <td className="px-3.5 py-2.5">{row.client_type}</td>
                        <td className="px-3.5 py-2.5">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                            YES (FETCHED)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setCursorModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* XML Viewer Modal (Req 11.F) */}
      {xmlModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Raw XML Serialized Output (Query 1)</h3>
              </div>
              <button onClick={() => setXmlModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 mb-3 font-semibold">
                Content-Type: application/xml; charset=utf-8 (Lab Assignment 11 Requirement F)
              </div>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {xmlContent}
              </pre>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setXmlModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
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
