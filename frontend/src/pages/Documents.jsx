import React, { useState, useEffect } from 'react';
import { practiceService, caseService } from '../services/api';
import {
  FileText,
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
  FolderOpen,
  FileCheck2,
  Scale
} from 'lucide-react';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    case_id: 1,
    document_type_id: 1,
    title: '',
    description: '',
    file_path: '/uploads/cases/document.pdf',
    file_size: 2450000,
    is_confidential: false
  });

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await practiceService.getDocuments();
      setDocuments(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve document repository.');
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
    fetchDocs();
    fetchCases();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await practiceService.createDocument(formData);
      setSuccess('Document successfully filed into matter repository.');
      setModalOpen(false);
      setFormData({
        case_id: cases[0]?.case_id || 1,
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
    <div className="space-y-6 pb-6 animate-fadeIn">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2D32]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B8975A] flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Chambers Repository & Exhibits</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight mt-1 font-semibold">
            Document Vault & Trial Exhibits
          </h2>
          <p className="text-xs text-[#B4B7BC] font-sans mt-0.5">
            Pleadings, affidavits, evidence exhibits, court bench orders, and privileged work product.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="court-btn-brass px-4 py-2 rounded-[3px] text-xs font-mono uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4 text-[#0A0A0B]" />
          <span>File Exhibit Document</span>
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
            placeholder="Search vault by title, docket #, matter, or classification..."
            className="w-full pl-9 pr-3 py-1.5 court-input text-xs text-white placeholder-[#6B6F76] font-sans"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-[#6B6F76]" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="court-input px-3 py-1.5 text-xs text-white"
          >
            <option value="" className="bg-[#141416]">All Document Types</option>
            <option value="Pleading" className="bg-[#141416]">Pleadings</option>
            <option value="Affidavit" className="bg-[#141416]">Affidavits</option>
            <option value="Evidence" className="bg-[#141416]">Evidence Exhibits</option>
            <option value="Order" className="bg-[#141416]">Court Orders</option>
            <option value="Notice" className="bg-[#141416]">Legal Notices</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="court-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="court-table">
            <thead>
              <tr>
                <th>Exhibit Title</th>
                <th>Case Docket</th>
                <th>Document Classification</th>
                <th>File Size</th>
                <th>Confidentiality</th>
                <th>Filing Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs font-mono text-[#B4B7BC]">
                    Accessing encrypted document repository...
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs font-serif text-[#6B6F76]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FolderOpen className="w-8 h-8 text-[#B8975A]/40" />
                      <p>No documents found matching the filter criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.document_id}>
                    <td>
                      <div>
                        <div className="font-serif font-medium text-white text-xs">{doc.title}</div>
                        <div className="text-[10px] text-[#6B6F76] font-sans truncate max-w-xs mt-0.5">
                          {doc.description || 'Pleading exhibit brief'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-mono text-xs text-[#D4B97E]">{doc.case_number}</div>
                      <div className="font-serif text-[11px] text-[#B4B7BC] truncate max-w-xs">
                        {doc.case_title}
                      </div>
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase badge-info">
                        {doc.document_type || 'General Brief'}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-[#B4B7BC]">
                      {formatFileSize(doc.file_size)}
                    </td>
                    <td>
                      {doc.is_confidential ? (
                        <span className="px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase badge-danger inline-flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Privileged</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase badge-success inline-flex items-center gap-1">
                          <Unlock className="w-2.5 h-2.5" />
                          <span>Standard</span>
                        </span>
                      )}
                    </td>
                    <td className="font-mono text-xs text-[#6B6F76]">
                      {doc.uploaded_at ? String(doc.uploaded_at).slice(0, 10) : '—'}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => alert(`Downloading verified exhibit: ${doc.title}`)}
                          className="p-1.5 rounded-[3px] text-[#B4B7BC] hover:text-[#D4B97E] hover:bg-[#1E1F23] transition-colors cursor-pointer"
                          title="Download Exhibit"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.document_id, doc.title)}
                          className="p-1.5 rounded-[3px] text-[#6B6F76] hover:text-[#E67272] hover:bg-[#9B2C2C]/10 transition-colors cursor-pointer"
                          title="Expunge Record"
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
      </div>

      {/* File Document Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="court-card-elevated max-w-lg w-full">
            <div className="px-5 py-3.5 border-b border-[#2B2D32] flex items-center justify-between bg-[#141416]">
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-4 h-4 text-[#B8975A]" />
                <h3 className="font-serif font-semibold text-white text-sm">
                  File Exhibit Document into Vault
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
                  Exhibit Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Affidavit of Service / Plaint Exhibit A"
                  className="w-full px-3 py-1.5 court-input text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Document Classification
                  </label>
                  <select
                    value={formData.document_type_id}
                    onChange={(e) => setFormData({ ...formData, document_type_id: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  >
                    <option value={1} className="bg-[#141416]">Pleading</option>
                    <option value={2} className="bg-[#141416]">Affidavit</option>
                    <option value={3} className="bg-[#141416]">Evidence</option>
                    <option value={4} className="bg-[#141416]">Court Order</option>
                    <option value={5} className="bg-[#141416]">Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    File Size (Bytes)
                  </label>
                  <input
                    type="number"
                    value={formData.file_size}
                    onChange={(e) => setFormData({ ...formData, file_size: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Description & Context
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Bench context, exhibit index, and filing remarks..."
                  className="w-full px-3 py-1.5 court-input text-xs text-white"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center space-x-2 text-xs text-[#B4B7BC] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_confidential}
                    onChange={(e) => setFormData({ ...formData, is_confidential: e.target.checked })}
                    className="rounded-[2px] bg-[#141416] border-[#2B2D32] text-[#B8975A] focus:ring-[#B8975A]"
                  />
                  <span>Privileged work product / Confidential sealing</span>
                </label>
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
                  Commit Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
