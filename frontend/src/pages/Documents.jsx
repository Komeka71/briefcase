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
  FileCode,
  FolderOpen,
  Eye,
  FileCheck2,
  ShieldAlert
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
    <div className="space-y-4 pb-6">
      {/* Editorial Header */}
      <div className="relative overflow-hidden rounded-xl bg-[#664631] border border-white/10 p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase font-semibold bg-[#73513a] text-[#f5f0e7] border border-white/15">
            <FolderOpen className="w-3 h-3 text-white" />
            <span>Chambers Repository</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-serif text-[#f5f0e7] tracking-tight">
            Document Vault & <span className="italic text-white font-medium">Trial Exhibits</span>
          </h1>

          <p className="text-xs text-white/60 font-sans leading-relaxed">
            Pleadings, affidavits, evidence exhibits, court orders, and privileged work product.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="self-start md:self-auto inline-flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-b from-[#fbf5ec] to-[#e9d6b8] hover:from-[#ffffff] hover:to-[#f0e2c9] shadow-[0_8px_22px_-8px_rgba(20,12,6,0.6)] text-[#3b2a1f] rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow font-mono cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>File Document</span>
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
      <div className="bg-[#664631] p-3 rounded-lg border border-white/10 shadow-sm flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, case number, or type..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#5e412d] border border-white/10 rounded-md text-xs text-[#f5f0e7] placeholder-white/40 focus:border-white/30 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-white/50" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 bg-[#5e412d] border border-white/10 rounded-md text-xs text-[#f5f0e7] font-mono focus:border-white/30 focus:outline-none"
            >
              <option value="">All Classes</option>
              <option value="Petition">Petition / Plaint</option>
              <option value="Evidence">Evidence Exhibit</option>
              <option value="Contract">Contract / Deed</option>
              <option value="Order/Decree">Court Order / Decree</option>
              <option value="Notice">Legal Notice</option>
            </select>
          </div>

          <div className="text-xs font-mono text-white/60 px-2.5 py-1.5 bg-[#5e412d] border border-white/10 rounded-md">
            {filteredDocs.length} Documents
          </div>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {loading ? (
          <div className="col-span-3 text-center py-12 bg-[#664631] border border-white/10 rounded-xl text-white/50 font-serif">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Opening confidential repository...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-[#664631] border border-white/10 rounded-xl text-white/50 font-serif">
            <FolderOpen className="w-8 h-8 text-white/30 mx-auto mb-2" />
            <p className="text-sm text-[#f5f0e7]">No documents match current filters.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.document_id}
              className="bg-[#664631] p-4 rounded-xl border border-white/10 shadow-md flex flex-col justify-between hover:border-white/25 transition-all group relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between gap-2.5">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#73513a] text-white/80 border border-white/15">
                      {doc.document_type || 'General'}
                    </span>
                    <h3 className="font-serif font-medium text-[#f5f0e7] text-sm group-hover:text-white transition-colors line-clamp-2 mt-1.5">
                      {doc.title}
                    </h3>
                  </div>

                  {doc.is_confidential ? (
                    <span className="p-1 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300" title="Privileged">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1 rounded bg-[#5e412d] border border-white/10 text-white/40" title="Public Filing">
                      <Unlock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-white/70 pt-2 border-t border-white/5">
                  <div className="text-[#f5f0e7] truncate text-xs">
                    Matter: <strong className="font-medium text-white">{doc.case_number}</strong> — {doc.case_title}
                  </div>

                  {doc.description && (
                    <p className="text-white/60 text-xs line-clamp-2 leading-relaxed">
                      {doc.description}
                    </p>
                  )}

                  <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/50">
                    <span>Size: {formatFileSize(doc.file_size)}</span>
                    <span>Filed: {doc.upload_date ? String(doc.upload_date).slice(0, 10) : '—'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/50 truncate max-w-[170px]">
                  {doc.file_path ? doc.file_path.split('/').pop() : 'document.pdf'}
                </span>

                <button
                  onClick={() => handleDelete(doc.document_id, doc.title)}
                  className="p-1.5 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                  title="Remove Document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* File Document Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#664631] rounded-xl shadow-2xl border border-white/15 max-w-md w-full overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#5e412d]">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#f5f0e7]" />
                <h3 className="font-serif font-semibold text-[#f5f0e7] text-sm">
                  File Document / Exhibit
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
                  className="w-full px-2.5 py-1.5 bg-[#5e412d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono focus:outline-none"
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
                  Classification *
                </label>
                <select
                  value={formData.document_type_id}
                  onChange={(e) => setFormData({ ...formData, document_type_id: parseInt(e.target.value, 10) })}
                  className="w-full px-2.5 py-1.5 bg-[#5e412d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] font-mono focus:outline-none"
                >
                  <option value={1}>Petition / Plaint / Memo</option>
                  <option value={2}>Evidence / Exhibit / Affidavit</option>
                  <option value={3}>Contract / Agreement / MoU</option>
                  <option value={4}>Order / Injunction / Decree</option>
                  <option value={5}>Legal Notice / Show Cause</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Certified Stay Order Copy"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#5e412d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                  Description / Relevance
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Certified by court registrar; submitted Exh 12."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#5e412d] border border-white/10 focus:border-white/30 rounded-md text-xs text-[#f5f0e7] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="confidentialCheck"
                  checked={formData.is_confidential}
                  onChange={(e) => setFormData({ ...formData, is_confidential: e.target.checked })}
                  className="w-3.5 h-3.5 rounded bg-[#5e412d] border-white/20 text-white"
                />
                <label htmlFor="confidentialCheck" className="text-xs text-white/80 cursor-pointer">
                  Mark as Privileged / Confidential Document
                </label>
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
                  className="px-4 py-1.5 bg-gradient-to-b from-[#fbf5ec] to-[#e9d6b8] hover:from-[#ffffff] hover:to-[#f0e2c9] shadow-[0_8px_22px_-8px_rgba(20,12,6,0.6)] text-[#3b2a1f] rounded-md text-xs font-semibold uppercase tracking-wider shadow font-mono transition-colors cursor-pointer"
                >
                  File into Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
