import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { practiceService, caseService } from '../services/api';
import { getRole } from '../lib/auth';
import {
  PageHeader,
  MagneticButton,
  StatusPill,
  EmptyState,
  Skeleton
} from '../components/ui';
import { EASE_EXPO } from '../lib/motion';
import {
  Plus,
  Trash2,
  Lock,
  Unlock,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  FolderOpen
} from 'lucide-react';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const isAdmin = getRole() === 'Admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    case_id: 2,
    document_type_id: 1,
    title: '',
    description: '',
    file_path: '/uploads/cases/document.pdf',
    file_size: 2450000,
    is_confidential: false
  });

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await practiceService.getDocuments();
      setDocuments(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve document repository.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCases = async () => {
    try {
      const res = await caseService.getAll();
      const loadedCases = res.data.data || [];
      setCases(loadedCases);
      if (loadedCases.length > 0) {
        setFormData((prev) => ({ ...prev, case_id: loadedCases[0].case_id || 2 }));
      }
    } catch (err) {
      console.warn('Could not load cases:', err.message);
    }
  };

  useEffect(() => {
    fetchDocs();
    fetchCases();
  }, [fetchDocs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const payload = new FormData();
      payload.append('case_id', formData.case_id);
      payload.append('document_type_id', formData.document_type_id);
      payload.append('title', formData.title);
      payload.append('description', formData.description || '');
      payload.append('is_confidential', formData.is_confidential ? 'true' : 'false');
      if (file) {
        payload.append('file', file);
      } else {
        payload.append('file_path', formData.file_path || '/uploads/cases/document.pdf');
        payload.append('file_size', formData.file_size || 2450000);
      }
      await practiceService.createDocument(payload);
      setSuccess('Document successfully filed into matter repository.');
      setModalOpen(false);
      setFile(null);
      setFormData({
        case_id: cases[0]?.case_id || 2,
        document_type_id: 1,
        title: '',
        description: '',
        file_path: '/uploads/cases/document.pdf',
        file_size: 2450000,
        is_confidential: false
      });
      fetchDocs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to file document.');
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await practiceService.downloadDocument(doc.document_id);
      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `${doc.title || 'document'}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Download failed.');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Permanently remove document record "${title}" (#${id})?`)) return;
    try {
      await practiceService.deleteDocument(id);
      setSuccess('Document record successfully expunged.');
      fetchDocs();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete operation failed.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      searchTerm === '' ||
      d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.case_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.document_type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === '' || d.document_type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <PageHeader
        title="Document Vault & Trial Exhibits"
        subtitle="Cryptographically sealed legal pleadings, affidavits, evidence exhibits, court bench orders, and privileged work product."
        category="Evidence Vault"
        badge="Encrypted Store"
        actions={
          <MagneticButton
            variant="brass"
            size="md"
            onClick={() => setModalOpen(true)}
            icon={Plus}
            iconPosition="left"
            className="text-xs font-mono uppercase tracking-wider"
          >
            File Exhibit Document
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

      {/* Filter and Search Bar */}
      <div className="court-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-steel absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vault by title, docket #, matter, or classification..."
            className="court-input w-full pl-10 pr-4 py-2 text-xs"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-steel" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="court-input px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
          >
            <option value="">All Document Types</option>
            <option value="Pleading">Pleadings</option>
            <option value="Affidavit">Affidavits</option>
            <option value="Evidence">Evidence Exhibits</option>
            <option value="Order">Court Orders</option>
            <option value="Notice">Legal Notices</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="court-table-container">
        <table className="court-table">
          <thead>
            <tr>
              <th>Exhibit Title</th>
              <th>Case Docket</th>
              <th>Classification</th>
              <th>File Size</th>
              <th>Privilege Status</th>
              <th>Filing Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8">
                  <Skeleton rows={4} height="h-6" />
                </td>
              </tr>
            ) : filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    icon={FolderOpen}
                    title="No documents found"
                    description="No document exhibits matched the active search parameters."
                    actionLabel="File Exhibit Document"
                    onAction={() => setModalOpen(true)}
                  />
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.document_id}>
                  <td>
                    <div>
                      <div className="font-serif font-medium text-ivory text-sm">{doc.title}</div>
                      <div className="text-[11px] text-silver/60 font-sans truncate max-w-xs mt-0.5">
                        {doc.description || 'Pleading exhibit brief'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-mono text-xs text-brass font-medium">{doc.case_number}</div>
                    <div className="font-serif text-[11px] text-silver/80 truncate max-w-xs">
                      {doc.case_title}
                    </div>
                  </td>
                  <td>
                    <StatusPill status={doc.document_type || 'General Brief'} />
                  </td>
                  <td className="font-mono text-xs text-silver/80">
                    {formatFileSize(doc.file_size)}
                  </td>
                  <td>
                    {doc.is_confidential ? (
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase badge-danger inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Privileged</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase badge-success inline-flex items-center gap-1">
                        <Unlock className="w-3 h-3" />
                        <span>Standard</span>
                      </span>
                    )}
                  </td>
                  <td className="font-mono text-xs text-silver/60">
                    {doc.uploaded_at ? String(doc.uploaded_at).slice(0, 10) : '—'}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-1.5 rounded-xs text-silver hover:text-brass hover:bg-graphite transition-colors cursor-pointer"
                        title="Download Exhibit"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(doc.document_id, doc.title)}
                          className="p-1.5 rounded-xs text-steel hover:text-red-400 hover:bg-court-danger/20 transition-colors cursor-pointer"
                          title="Expunge Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* File Document Modal */}
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
                  <FolderOpen className="w-4 h-4 text-brass" />
                  <h3 className="font-serif font-medium text-ivory text-base">
                    File Exhibit Document into Vault
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
                    Exhibit File Document (PDF, DOCX, TXT, PNG, JPG)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const f = e.target.files[0];
                      setFile(f || null);
                      if (f) {
                        setFormData((prev) => ({
                          ...prev,
                          title: prev.title || f.name.replace(/\.[^/.]+$/, ''),
                          file_size: f.size
                        }));
                      }
                    }}
                    className="court-input w-full px-3.5 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Exhibit Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Affidavit of Service / Plaint Exhibit A"
                    className="court-input w-full px-3.5 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Document Classification
                    </label>
                    <select
                      value={formData.document_type_id}
                      onChange={(e) => setFormData({ ...formData, document_type_id: Number(e.target.value) })}
                      className="court-input w-full px-3.5 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                    >
                      <option value={1}>Pleading</option>
                      <option value={2}>Affidavit</option>
                      <option value={3}>Evidence</option>
                      <option value={4}>Court Order</option>
                      <option value={5}>Notice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      File Size (Bytes)
                    </label>
                    <input
                      type="number"
                      value={formData.file_size}
                      onChange={(e) => setFormData({ ...formData, file_size: parseInt(e.target.value) || 0 })}
                      className="court-input w-full px-3.5 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Description & Context
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Bench context, exhibit index, and filing remarks..."
                    className="court-input w-full px-3.5 py-2 text-xs"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-center space-x-2 text-xs text-silver/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_confidential}
                      onChange={(e) => setFormData({ ...formData, is_confidential: e.target.checked })}
                      className="rounded-xs bg-charcoal border-slate text-brass focus:ring-brass"
                    />
                    <span>Privileged work product / Confidential sealing</span>
                  </label>
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
                    Commit Document
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
