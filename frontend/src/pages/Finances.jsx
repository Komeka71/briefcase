import React, { useState, useEffect } from 'react';
import { practiceService } from '../services/api';
import {
  CreditCard,
  FileSpreadsheet,
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  IndianRupee,
  Building,
  Scale
} from 'lucide-react';

export default function Finances() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('invoices');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchFinancials = async () => {
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
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

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
    <div className="space-y-6 pb-6 animate-fadeIn">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2D32]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B8975A] flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5" />
            <span>Chambers Ledgers & Retainers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight mt-1 font-semibold">
            Billing & Financial Registers
          </h2>
          <p className="text-xs text-[#B4B7BC] font-sans mt-0.5">
            Legal counsel fee invoices, retainer accounting, client disbursements, and transaction logs.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting Chambers Ledger as formal PDF receipt...')}
          className="court-btn-outline px-4 py-2 rounded-[3px] text-xs font-mono uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#B8975A]" />
          <span>Export Audit Ledger</span>
        </button>
      </div>

      {/* Financial Stat Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="court-card p-4">
          <div className="text-[10px] font-mono uppercase text-[#6B6F76] tracking-wider flex items-center justify-between">
            <span>Total Invoiced Fees</span>
            <FileSpreadsheet className="w-4 h-4 text-[#B8975A]" />
          </div>
          <div className="text-2xl font-serif font-bold text-white mt-1.5">
            ₹ {totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] font-mono text-[#B4B7BC] mt-0.5">
            {invoices.length} Chambers Invoices
          </div>
        </div>

        <div className="court-card p-4">
          <div className="text-[10px] font-mono uppercase text-[#6B6F76] tracking-wider flex items-center justify-between">
            <span>Cleared Collections</span>
            <CheckCircle2 className="w-4 h-4 text-[#3F7D5C]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#72C095] mt-1.5">
            ₹ {totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] font-mono text-[#72C095]/80 mt-0.5">
            {payments.length} Cleared Receipts
          </div>
        </div>

        <div className="court-card p-4">
          <div className="text-[10px] font-mono uppercase text-[#6B6F76] tracking-wider flex items-center justify-between">
            <span>Outstanding Retainer Balance</span>
            <Clock className="w-4 h-4 text-[#C08A2E]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#D4B97E] mt-1.5">
            ₹ {totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] font-mono text-[#E2B056] mt-0.5">
            Pending Resolution
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 bg-[#9B2C2C]/20 border border-[#9B2C2C]/60 rounded-[3px] text-[#E67272] text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs and Filter Toolbar */}
      <div className="court-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 p-0.5 rounded-[3px] bg-[#0A0A0B] border border-[#2B2D32]">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3.5 py-1.5 rounded-[2px] text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'invoices'
                ? 'court-btn-brass'
                : 'text-[#B4B7BC] hover:text-white'
            }`}
          >
            Invoices Register ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3.5 py-1.5 rounded-[2px] text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'payments'
                ? 'court-btn-brass'
                : 'text-[#B4B7BC] hover:text-white'
            }`}
          >
            Payment Receipts ({payments.length})
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2 flex-1 max-w-md justify-end">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-[#6B6F76] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by invoice, client, or matter..."
              className="w-full pl-9 pr-3 py-1.5 court-input text-xs text-white placeholder-[#6B6F76] font-sans"
            />
          </div>

          {activeTab === 'invoices' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="court-input px-3 py-1.5 text-xs text-white"
            >
              <option value="" className="bg-[#141416]">All Statuses</option>
              <option value="Paid" className="bg-[#141416]">Paid</option>
              <option value="Partially Paid" className="bg-[#141416]">Partially Paid</option>
              <option value="Unpaid" className="bg-[#141416]">Unpaid</option>
              <option value="Overdue" className="bg-[#141416]">Overdue</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'invoices' ? (
        <div className="court-card overflow-hidden">
          <div className="overflow-x-auto">
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
                    <td colSpan={7} className="text-center py-10 text-xs font-mono text-[#B4B7BC]">
                      Accessing chambers billing ledger...
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-xs font-serif text-[#6B6F76]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Receipt className="w-8 h-8 text-[#B8975A]/40" />
                        <p>No billing invoices found matching the current criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.invoice_id}>
                      <td className="font-mono text-xs font-semibold text-[#D4B97E]">
                        {inv.invoice_number}
                      </td>
                      <td>
                        <div className="font-serif font-medium text-white text-xs max-w-xs truncate">
                          {inv.case_title}
                        </div>
                        <div className="font-mono text-[10px] text-[#6B6F76] mt-0.5">
                          {inv.case_number}
                        </div>
                      </td>
                      <td className="text-xs text-[#F6F4EF]">
                        {inv.client_name}
                      </td>
                      <td className="font-mono text-xs text-white font-semibold">
                        ₹ {Number(inv.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase ${
                          inv.status === 'Paid' ? 'badge-success' :
                          inv.status === 'Overdue' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[#6B6F76]">
                        {inv.issue_date ? String(inv.issue_date).slice(0, 10) : '—'}
                      </td>
                      <td className="font-mono text-xs text-[#B4B7BC]">
                        {inv.due_date ? String(inv.due_date).slice(0, 10) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="court-card overflow-hidden">
          <div className="overflow-x-auto">
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
                    <td colSpan={6} className="text-center py-10 text-xs font-mono text-[#B4B7BC]">
                      Accessing payment transaction receipts...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-xs font-serif text-[#6B6F76]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <CreditCard className="w-8 h-8 text-[#B8975A]/40" />
                        <p>No cleared payments found matching the current search.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((pay) => (
                    <tr key={pay.payment_id}>
                      <td className="font-mono text-xs text-[#D4B97E] font-semibold">
                        {pay.payment_reference || `REC-${pay.payment_id}`}
                      </td>
                      <td className="font-mono text-xs text-[#B4B7BC]">
                        {pay.invoice_number}
                      </td>
                      <td className="text-xs text-[#F6F4EF]">
                        {pay.client_name}
                      </td>
                      <td className="font-mono text-xs text-[#72C095] font-semibold">
                        ₹ {Number(pay.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className="px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase badge-info">
                          {pay.payment_method || 'NEFT / RTGS'}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[#6B6F76]">
                        {pay.payment_date ? String(pay.payment_date).slice(0, 10) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
