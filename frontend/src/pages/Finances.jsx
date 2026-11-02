import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { practiceService, caseService } from '../services/api';
import { getRole } from '../lib/auth';
import {
  PageHeader,
  GlassCard,
  MagneticButton,
  StatusPill,
  EmptyState,
  Skeleton,
  CountUp
} from '../components/ui';
import { EASE_EXPO } from '../lib/motion';
import {
  CreditCard,
  FileSpreadsheet,
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Plus,
  X
} from 'lucide-react';

export default function Finances() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('invoices');

  const isAdmin = getRole() === 'Admin';

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const [invoiceForm, setInvoiceForm] = useState({
    case_id: 2,
    amount: '',
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    description: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    case_id: 2,
    invoice_id: '',
    payment_method_id: 1,
    amount: '',
    payment_date: new Date().toISOString().slice(0, 10),
    payment_status: 'Completed',
    description: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchFinancials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [invRes, payRes] = await Promise.all([
        practiceService.getInvoices(),
        practiceService.getPayments()
      ]);
      setInvoices(invRes.data.data || []);
      setPayments(payRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve financial registers.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCases = async () => {
    try {
      const res = await caseService.getAll();
      const list = res.data.data || [];
      setCases(list);
      if (list.length > 0) {
        setInvoiceForm((prev) => ({ ...prev, case_id: list[0].case_id || 2 }));
        setPaymentForm((prev) => ({ ...prev, case_id: list[0].case_id || 2 }));
      }
    } catch (err) {
      console.warn('Could not load cases:', err.message);
    }
  };

  useEffect(() => {
    fetchFinancials();
    fetchCases();
  }, [fetchFinancials]);

  const handleExportLedger = async () => {
    try {
      const res = await practiceService.exportLedger();
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'briefcase_audit_ledger.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export audit ledger.');
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await practiceService.createInvoice(invoiceForm);
      setSuccess('Invoice created successfully.');
      setInvoiceModalOpen(false);
      setInvoiceForm({
        case_id: cases[0]?.case_id || 2,
        amount: '',
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        description: ''
      });
      fetchFinancials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice.');
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await practiceService.createPayment({
        ...paymentForm,
        invoice_id: paymentForm.invoice_id ? parseInt(paymentForm.invoice_id, 10) : null
      });
      setSuccess('Payment recorded and reconciled successfully.');
      setPaymentModalOpen(false);
      setPaymentForm({
        case_id: cases[0]?.case_id || 2,
        invoice_id: '',
        payment_method_id: 1,
        amount: '',
        payment_date: new Date().toISOString().slice(0, 10),
        payment_status: 'Completed',
        description: ''
      });
      fetchFinancials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment.');
    }
  };

  const handleMarkCleared = async (paymentId) => {
    setError(null);
    setSuccess(null);
    try {
      await practiceService.updatePaymentStatus(paymentId, 'Completed');
      setSuccess(`Payment #${paymentId} marked as Completed.`);
      fetchFinancials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment status.');
    }
  };

  // Compute metrics
  const totalInvoiced = invoices.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const totalPaid = payments.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const totalOutstanding = Math.max(0, totalInvoiced - totalPaid);

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      searchTerm === '' ||
      i.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.case_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      searchTerm === '' ||
      p.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.payment_method?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <PageHeader
        title="Billing & Financial Registers"
        subtitle="Manage legal counsel fee invoices, retainer accounting, client disbursements, and transaction receipts."
        category="Financial Ledgers"
        badge="Audited Accounting"
        actions={
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <>
                <MagneticButton
                  variant="brass"
                  size="md"
                  onClick={() => setInvoiceModalOpen(true)}
                  icon={Plus}
                  iconPosition="left"
                  className="text-xs font-mono uppercase tracking-wider"
                >
                  New Invoice
                </MagneticButton>
                <MagneticButton
                  variant="brass"
                  size="md"
                  onClick={() => setPaymentModalOpen(true)}
                  icon={Plus}
                  iconPosition="left"
                  className="text-xs font-mono uppercase tracking-wider"
                >
                  Record Payment
                </MagneticButton>
              </>
            )}
            <MagneticButton
              variant="outline"
              size="md"
              onClick={handleExportLedger}
              icon={Download}
              iconPosition="left"
              className="text-xs font-mono uppercase tracking-wider"
            >
              Export Audit Ledger
            </MagneticButton>
          </div>
        }
      />

      {/* Financial Stat Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <div className="text-[10px] font-mono uppercase text-silver/60 tracking-wider flex items-center justify-between">
            <span>Total Invoiced Fees</span>
            <FileSpreadsheet className="w-4 h-4 text-brass" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-ivory mt-2">
            ₹ <CountUp value={totalInvoiced} decimals={2} />
          </div>
          <div className="text-[11px] font-mono text-silver/60 mt-1">
            {invoices.length} Chambers Invoices Issued
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="text-[10px] font-mono uppercase text-silver/60 tracking-wider flex items-center justify-between">
            <span>Cleared Collections</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400 mt-2">
            ₹ <CountUp value={totalPaid} decimals={2} />
          </div>
          <div className="text-[11px] font-mono text-emerald-400/80 mt-1">
            {payments.length} Cleared Payment Receipts
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="text-[10px] font-mono uppercase text-silver/60 tracking-wider flex items-center justify-between">
            <span>Outstanding Retainer Balance</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-brass mt-2">
            ₹ <CountUp value={totalOutstanding} decimals={2} />
          </div>
          <div className="text-[11px] font-mono text-amber-400/80 mt-1">
            Pending Resolution
          </div>
        </GlassCard>
      </div>

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

      {/* Tabs and Filter Toolbar */}
      <div className="court-card p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 p-1 rounded-xs bg-ink border border-brass/20">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xs text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'invoices'
                ? 'court-btn-brass shadow-md'
                : 'text-silver hover:text-ivory'
            }`}
          >
            Invoices Register ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xs text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'payments'
                ? 'court-btn-brass shadow-md'
                : 'text-silver hover:text-ivory'
            }`}
          >
            Payment Receipts ({payments.length})
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2.5 flex-1 max-w-md justify-end">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by invoice, client, or matter..."
              className="court-input w-full pl-9 pr-3 py-1.5 text-xs"
            />
          </div>

          {activeTab === 'invoices' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="court-input px-3 py-1.5 text-xs font-mono bg-charcoal cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'invoices' ? (
        <div className="court-table-container">
          <table className="court-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Legal Matter Docket</th>
                <th>Client Representation</th>
                <th>Total Fee (INR)</th>
                <th>Payment Status</th>
                <th>Issue Date</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8">
                    <Skeleton rows={4} height="h-6" />
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Receipt}
                      title="No invoices found"
                      description="No invoice records matched the current criteria."
                    />
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.invoice_id}>
                    <td className="font-mono text-xs font-medium text-brass">
                      {inv.invoice_number}
                    </td>
                    <td>
                      <div className="font-serif font-medium text-ivory text-sm max-w-xs truncate">
                        {inv.case_title}
                      </div>
                      <div className="font-mono text-[10px] text-silver/60 mt-0.5">
                        {inv.case_number}
                      </div>
                    </td>
                    <td className="text-xs text-silver/90">
                      {inv.client_name}
                    </td>
                    <td className="font-mono text-xs text-ivory font-medium">
                      ₹ {Number(inv.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <StatusPill status={inv.status} />
                    </td>
                    <td className="font-mono text-xs text-silver/60">
                      {inv.issue_date ? String(inv.issue_date).slice(0, 10) : '—'}
                    </td>
                    <td className="font-mono text-xs text-silver/80">
                      {inv.due_date ? String(inv.due_date).slice(0, 10) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="court-table-container">
          <table className="court-table">
            <thead>
              <tr>
                <th>Receipt Reference</th>
                <th>Invoice Link</th>
                <th>Client</th>
                <th>Cleared Amount (INR)</th>
                <th>Payment Method</th>
                <th>Transaction Date</th>
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
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6}>
                    <EmptyState
                      icon={CreditCard}
                      title="No payment receipts found"
                      description="No cleared payment records matched the current search."
                    />
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                  <tr key={pay.payment_id}>
                    <td className="font-mono text-xs font-medium text-brass">
                      {pay.payment_reference || `REC-${pay.payment_id}`}
                    </td>
                    <td className="font-mono text-xs text-silver/70">
                      {pay.invoice_number || '—'}
                    </td>
                    <td className="text-xs text-silver/90">
                      {pay.client_name}
                    </td>
                    <td className="font-mono text-xs text-emerald-400 font-semibold">
                      ₹ {Number(pay.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <StatusPill status={pay.method_name || pay.payment_method || 'NEFT / RTGS'} showDot={false} />
                    </td>
                    <td className="font-mono text-xs text-silver/60">
                      {pay.payment_date ? String(pay.payment_date).slice(0, 10) : '—'}
                    </td>
                    {isAdmin && (
                      <td className="text-right">
                        {pay.payment_status !== 'Completed' ? (
                          <button
                            onClick={() => handleMarkCleared(pay.payment_id)}
                            className="px-2 py-1 rounded-xs font-mono text-[11px] uppercase badge-success hover:bg-emerald-500/20 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Mark Payment Cleared"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mark Cleared</span>
                          </button>
                        ) : (
                          <span className="font-mono text-[11px] text-silver/50">Cleared</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New Invoice Modal */}
      <AnimatePresence>
        {invoiceModalOpen && (
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
                  <Receipt className="w-4 h-4 text-brass" />
                  <h3 className="font-serif font-medium text-ivory text-base">
                    Generate Chamber Fee Invoice
                  </h3>
                </div>
                <button
                  onClick={() => setInvoiceModalOpen(false)}
                  className="text-silver/60 hover:text-ivory p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Associate Legal Matter *
                  </label>
                  <select
                    value={invoiceForm.case_id}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, case_id: Number(e.target.value) })}
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
                    Fee Amount (INR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={invoiceForm.amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                    placeholder="e.g. 50000.00"
                    className="court-input w-full px-3.5 py-2 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={invoiceForm.issue_date}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, issue_date: e.target.value })}
                      className="court-input w-full px-3.5 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={invoiceForm.due_date}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                      className="court-input w-full px-3.5 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Billing Description & Retainer Scope
                  </label>
                  <textarea
                    rows={2}
                    value={invoiceForm.description}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                    placeholder="Counsel fee, trial court appearances, legal research disbursement..."
                    className="court-input w-full px-3.5 py-2 text-xs"
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-brass/15">
                  <MagneticButton
                    variant="outline"
                    size="sm"
                    onClick={() => setInvoiceModalOpen(false)}
                  >
                    Cancel
                  </MagneticButton>
                  <MagneticButton
                    type="submit"
                    variant="brass"
                    size="sm"
                  >
                    Generate Invoice
                  </MagneticButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Record Payment Modal */}
      <AnimatePresence>
        {paymentModalOpen && (
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
                  <CreditCard className="w-4 h-4 text-brass" />
                  <h3 className="font-serif font-medium text-ivory text-base">
                    Record Retainer / Fee Payment
                  </h3>
                </div>
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="text-silver/60 hover:text-ivory p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePayment} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Associate Legal Matter *
                  </label>
                  <select
                    value={paymentForm.case_id}
                    onChange={(e) => setPaymentForm({ ...paymentForm, case_id: Number(e.target.value) })}
                    className="court-input w-full px-3.5 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                  >
                    {cases.map((c) => (
                      <option key={c.case_id} value={c.case_id}>
                        {c.case_number} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Link Invoice (Optional)
                    </label>
                    <select
                      value={paymentForm.invoice_id}
                      onChange={(e) => setPaymentForm({ ...paymentForm, invoice_id: e.target.value })}
                      className="court-input w-full px-3.5 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                    >
                      <option value="">No Linked Invoice</option>
                      {invoices.map((inv) => (
                        <option key={inv.invoice_id} value={inv.invoice_id}>
                          {inv.invoice_number} (₹{inv.amount})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Payment Method
                    </label>
                    <select
                      value={paymentForm.payment_method_id}
                      onChange={(e) => setPaymentForm({ ...paymentForm, payment_method_id: Number(e.target.value) })}
                      className="court-input w-full px-3.5 py-2 text-xs font-mono bg-charcoal cursor-pointer"
                    >
                      <option value={1}>Bank Wire / RTGS / NEFT</option>
                      <option value={2}>Corporate Credit Card</option>
                      <option value={3}>Banker's Cheque</option>
                      <option value={4}>Cash Disbursement</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Amount Received (INR) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      placeholder="e.g. 25000.00"
                      className="court-input w-full px-3.5 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      value={paymentForm.payment_date}
                      onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                      className="court-input w-full px-3.5 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                    Receipt Remarks & Reference
                  </label>
                  <textarea
                    rows={2}
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                    placeholder="UTR transaction reference, bank clearing notes..."
                    className="court-input w-full px-3.5 py-2 text-xs"
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-brass/15">
                  <MagneticButton
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentModalOpen(false)}
                  >
                    Cancel
                  </MagneticButton>
                  <MagneticButton
                    type="submit"
                    variant="brass"
                    size="sm"
                  >
                    Record Payment
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
