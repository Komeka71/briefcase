import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clientService, reportService } from '../services/api';
import {
  PageHeader,
  MagneticButton,
  EmptyState,
  Skeleton
} from '../components/ui';
import { EASE_EXPO } from '../lib/motion';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileCode,
  AlertCircle,
  CheckCircle2,
  X,
  Building2,
  User,
  Copy,
  Check,
  Filter
} from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Condition filter state (=, !=, LIKE)
  const [filterColumn, setFilterColumn] = useState('name');
  const [filterOperator, setFilterOperator] = useState('LIKE');

  // XML Modal state
  const [xmlModalOpen, setXmlModalOpen] = useState(false);
  const [xmlContent, setXmlContent] = useState('');
  const [copiedXml, setCopiedXml] = useState(false);

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

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (search.trim() && (filterOperator !== 'LIKE' || filterColumn !== 'name')) {
        const res = await reportService.getQuery4(filterColumn, filterOperator, search.trim());
        const data = res.data.data || [];
        setClients(data);
        setTotalRecords(data.length);
        setTotalPages(1);
      } else {
        const res = await clientService.getPaginated(page, pageSize, search.trim());
        setClients(res.data.data || []);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.total_pages);
          setTotalRecords(res.data.pagination.total_records);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load clients.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filterColumn, filterOperator]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchClients();
  };

  const fetchXml = async () => {
    try {
      if (search.trim() && (filterOperator !== 'LIKE' || filterColumn !== 'name')) {
        const res = await reportService.getQuery4(filterColumn, filterOperator, search.trim(), 'xml');
        setXmlContent(res.data);
      } else {
        const res = await clientService.getAll('xml');
        setXmlContent(res.data);
      }
      setXmlModalOpen(true);
      setCopiedXml(false);
    } catch {
      setError('XML serialization failed.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedXml(true);
    setTimeout(() => setCopiedXml(false), 2000);
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
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <PageHeader
        title="Clients Registry & Fiduciary Records"
        subtitle="Directory of enterprise and individual client accounts, representation dockets, and fiduciary records."
        category="Clients Registry"
        actions={
          <div className="flex items-center gap-2.5">
            <MagneticButton
              variant="outline"
              size="md"
              onClick={fetchXml}
              icon={FileCode}
              iconPosition="left"
              className="text-xs font-mono uppercase tracking-wider text-brass"
              title="Serialize clients to XML stream"
            >
              Export XML
            </MagneticButton>
            <MagneticButton
              variant="brass"
              size="md"
              onClick={openAddModal}
              icon={Plus}
              iconPosition="left"
              className="text-xs font-mono uppercase tracking-wider"
            >
              Enrol New Client
            </MagneticButton>
          </div>
        }
      />

      {/* Alerts */}
      {error && (
        <div className="p-3.5 bg-court-danger/20 border border-court-danger/50 rounded-xs text-red-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-court-success/20 border border-court-success/50 rounded-xs text-emerald-300 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search and Condition Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="court-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-steel" />
            <select
              value={filterColumn}
              onChange={(e) => setFilterColumn(e.target.value)}
              className="court-input px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
            >
              <option value="name">Client Name</option>
              <option value="client_type">Classification</option>
              <option value="email">Email Address</option>
              <option value="address">City / Address</option>
            </select>
          </div>

          <select
            value={filterOperator}
            onChange={(e) => setFilterOperator(e.target.value)}
            className="court-input px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
          >
            <option value="LIKE">LIKE (Contains)</option>
            <option value="=">= (Equals)</option>
            <option value="!=">!= (Not Equals)</option>
          </select>

          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-steel absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or filter value..."
              className="court-input w-full pl-10 pr-4 py-2 text-xs"
            />
          </div>

          <button
            type="submit"
            className="court-btn-outline px-3.5 py-2 text-xs font-mono uppercase tracking-wider rounded"
          >
            Apply Filter
          </button>

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setFilterOperator('LIKE');
                setFilterColumn('name');
              }}
              className="text-xs font-mono text-silver/60 hover:text-ivory px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-silver/60 font-mono text-[11px]">Rows Per Page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="court-input px-3 py-1.5 text-xs font-mono bg-charcoal cursor-pointer"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
          </select>
        </div>
      </form>

      {/* Clients Table Container */}
      <div className="court-table-container">
        <table className="court-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client Name</th>
              <th>Classification</th>
              <th>Telephone</th>
              <th>Official Email</th>
              <th>Chambers Address</th>
              <th>Enrolled Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8">
                  <Skeleton rows={4} height="h-6" />
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    icon={Users}
                    title="No clients found"
                    description="No client records matched your search parameters. Use the button above to enrol new clients."
                    actionLabel="Enrol New Client"
                    onAction={openAddModal}
                  />
                </td>
              </tr>
            ) : (
              clients.map((c) => (
                <tr key={c.client_id}>
                  <td className="font-mono text-xs text-brass font-medium">
                    #{c.client_id}
                  </td>
                  <td className="font-serif font-medium text-ivory text-sm">
                    {c.name}
                  </td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider ${
                      c.client_type === 'Organization' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {c.client_type === 'Organization' ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      <span>{c.client_type}</span>
                    </span>
                  </td>
                  <td className="font-mono text-xs text-silver/80">
                    {c.phone || '—'}
                  </td>
                  <td className="font-mono text-xs text-ivory">
                    {c.email || '—'}
                  </td>
                  <td className="text-xs text-silver/80 max-w-xs truncate">
                    {c.address || '—'}
                  </td>
                  <td className="font-mono text-xs text-silver/60">
                    {c.created_at ? String(c.created_at).slice(0, 10) : '—'}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-xs text-silver hover:text-brass hover:bg-graphite transition-colors cursor-pointer"
                        title="Edit Client"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.client_id)}
                        className="p-1.5 rounded-xs text-steel hover:text-red-400 hover:bg-court-danger/20 transition-colors cursor-pointer"
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

        {/* Pagination Bar */}
        <div className="px-5 py-3.5 bg-charcoal border-t border-brass/15 flex items-center justify-between text-xs">
          <div className="text-silver/60 font-mono text-[11px]">
            Page <span className="text-ivory font-medium">{page}</span> of{' '}
            <span className="text-ivory font-medium">{totalPages}</span> ({totalRecords} records total)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-xs border border-brass/20 text-silver hover:text-ivory disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-brass text-xs font-semibold">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-xs border border-brass/20 text-silver hover:text-ivory disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      <AnimatePresence>
        {formModalOpen && (
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
                  <Users className="w-4 h-4 text-brass" />
                  <h3 className="font-serif font-medium text-ivory text-base">
                    {isEditing ? `Edit Client Record #${editId}` : 'Enrol New Client'}
                  </h3>
                </div>
                <button
                  onClick={() => setFormModalOpen(false)}
                  className="text-silver/60 hover:text-ivory p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Full Name / Corporate Entity Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Adv. Ramesh Swaminathan or Reliance Infrastructure Ltd"
                    className="court-input w-full px-3.5 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Client Classification
                  </label>
                  <select
                    value={formData.client_type}
                    onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                    className="court-input w-full px-3.5 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Organization">Organization / Corporate Entity</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Telephone (10 Digits) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="9876543210"
                      className="court-input w-full px-3.5 py-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="client@briefcase.in"
                      className="court-input w-full px-3.5 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Registered Address / Chambers
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, Chamber Suite, City, Postal Code"
                    className="court-input w-full px-3.5 py-2 text-xs"
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-brass/15">
                  <MagneticButton
                    variant="outline"
                    size="sm"
                    onClick={() => setFormModalOpen(false)}
                  >
                    Cancel
                  </MagneticButton>
                  <MagneticButton
                    type="submit"
                    variant="brass"
                    size="sm"
                  >
                    {isEditing ? 'Save Changes' : 'Enrol Client'}
                  </MagneticButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* XML Stream Output Modal */}
      <AnimatePresence>
        {xmlModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: EASE_EXPO }}
              className="court-card-elevated max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-brass/20 flex items-center justify-between bg-charcoal">
                <div className="flex items-center space-x-2.5">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-serif font-medium text-ivory text-base">
                    XML Document Serialization Stream
                  </h3>
                </div>
                <button
                  onClick={() => setXmlModalOpen(false)}
                  className="text-silver/60 hover:text-ivory p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-silver/70 font-mono">
                  <span>Structured XML Export Stream</span>
                  <button
                    onClick={() => copyToClipboard(xmlContent)}
                    className="flex items-center gap-1.5 text-brass hover:text-brass-light cursor-pointer"
                  >
                    {copiedXml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedXml ? 'Copied' : 'Copy XML'}</span>
                  </button>
                </div>

                <pre className="p-4 bg-ink border border-brass/15 rounded-xs text-[11px] font-mono text-brass overflow-x-auto max-h-96 leading-relaxed">
                  {xmlContent}
                </pre>
              </div>

              <div className="px-6 py-3.5 border-t border-brass/15 bg-charcoal flex justify-end">
                <MagneticButton
                  variant="outline"
                  size="sm"
                  onClick={() => setXmlModalOpen(false)}
                >
                  Close Stream
                </MagneticButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
