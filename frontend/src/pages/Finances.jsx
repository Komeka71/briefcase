import React, { useState, useEffect, useCallback } from 'react';
import { practiceService } from '../services/api';
import {
  PageHeader,
  GlassCard,
  MagneticButton,
  StatusPill,
  EmptyState,
  Skeleton,
  CountUp
} from '../components/ui';
import {
  CreditCard,
  FileSpreadsheet,
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download
} from 'lucide-react';

export default function Finances() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('invoices');

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

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

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
          <MagneticButton
            variant="outline"
            size="md"
            onClick={() => alert('Exporting Chambers Ledger as formal audit receipt...')}
            icon={Download}
            iconPosition="left"
            className="text-xs font-mono uppercase tracking-wider"
          >
            Export Audit Ledger
          </MagneticButton>
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8">
                    <Skeleton rows={4} height="h-6" />
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6}>
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
                      {pay.invoice_number}
                    </td>
                    <td className="text-xs text-silver/90">
                      {pay.client_name}
                    </td>
                    <td className="font-mono text-xs text-emerald-400 font-semibold">
                      ₹ {Number(pay.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <StatusPill status={pay.payment_method || 'NEFT / RTGS'} showDot={false} />
                    </td>
                    <td className="font-mono text-xs text-silver/60">
                      {pay.payment_date ? String(pay.payment_date).slice(0, 10) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
