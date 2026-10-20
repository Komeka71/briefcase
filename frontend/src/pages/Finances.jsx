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
  TrendingUp,
  Download,
  IndianRupee,
  Building,
  ArrowUpRight
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
      p.method_name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Editorial Header */}
      <div className="relative overflow-hidden rounded-xl bg-[#0d1527] border border-white/10 p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase font-semibold bg-[#121c33] text-[#f5f0e7] border border-white/15">
            <Receipt className="w-3 h-3 text-white" />
            <span>Accounts & Billing Ledger</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-serif text-[#f5f0e7] tracking-tight">
            Invoices, Retainers & <span className="italic text-white font-medium">Fee Receipts</span>
          </h1>

          <p className="text-xs text-white/60 font-sans leading-relaxed">
            Retainer billings, commercial invoices, statutory tax receipts, and payment settlements.
          </p>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#0d1527] p-4 rounded-xl border border-white/10 shadow-sm relative overflow-hidden">
          <div className="text-[10px] font-mono uppercase tracking-wider text-white/50">Total Invoiced Fees</div>
          <div className="text-xl font-serif font-bold text-[#f5f0e7] mt-1">
            ₹{Number(totalInvoiced).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-mono text-white/60 mt-0.5">{invoices.length} Invoices Issued</div>
        </div>

        <div className="bg-[#0d1527] p-4 rounded-xl border border-white/10 shadow-sm relative overflow-hidden">
          <div className="text-[10px] font-mono uppercase tracking-wider text-white/50">Cleared Receipts</div>
          <div className="text-xl font-serif font-bold text-emerald-400 mt-1">
            ₹{Number(totalPaid).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-mono text-emerald-400/80 mt-0.5">{payments.length} Payments Realized</div>
        </div>

        <div className="bg-[#0d1527] p-4 rounded-xl border border-white/10 shadow-sm relative overflow-hidden">
          <div className="text-[10px] font-mono uppercase tracking-wider text-white/50">Pending Receivables</div>
          <div className="text-xl font-serif font-bold text-blue-300 mt-1">
            ₹{Number(totalOutstanding).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-mono text-blue-300/80 mt-0.5">Pending Clearance</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-1">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
            activeTab === 'invoices'
              ? 'bg-[#f5f0e7] text-[#0a0f1d] font-semibold shadow'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-[#f5f0e7] text-[#0a0f1d] font-semibold shadow'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Receipts ({payments.length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d1527] p-3 rounded-lg border border-white/10 shadow-sm flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab === 'invoices' ? 'invoices by #, client, matter...' : 'payments by client, method...'}`}
            className="w-full pl-9 pr-3 py-1.5 bg-[#0a0f1d] border border-white/10 rounded-md text-xs text-[#f5f0e7] placeholder-white/40 focus:border-white/30 focus:outline-none"
          />
        </div>

        {activeTab === 'invoices' && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-white/50" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#0a0f1d] border border-white/10 rounded-md text-xs text-[#f5f0e7] font-mono focus:border-white/30 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        )}
      </div>

      {/* Invoices Table */}
      {activeTab === 'invoices' && (
        <div className="bg-[#0d1527] rounded-xl border border-white/10 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-[#0a0f1d] text-white/50 text-[10px] uppercase tracking-wider font-mono border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 font-semibold">Invoice #</th>
                  <th className="px-4 py-3 font-semibold">Client Name</th>
                  <th className="px-4 py-3 font-semibold">Matter Docket</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Due</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-white/50 font-serif">
                      Querying invoices from accounts ledger...
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-white/50 font-serif">
                      No invoices match search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.invoice_id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-4 py-3 text-[#f5f0e7] font-bold">
                        {inv.invoice_number}
                      </td>

                      <td className="px-4 py-3 font-serif font-medium text-[#f5f0e7]">
                        {inv.client_name}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-serif text-[#f5f0e7] truncate max-w-xs">{inv.case_title}</div>
                        <div className="text-[10px] text-white/50 mt-0.5">{inv.case_number}</div>
                      </td>

                      <td className="px-4 py-3 text-white/70">
                        {inv.invoice_date ? String(inv.invoice_date).slice(0, 10) : '—'}
                      </td>

                      <td className="px-4 py-3 text-white/50">
                        {inv.due_date ? String(inv.due_date).slice(0, 10) : '—'}
                      </td>

                      <td className="px-4 py-3 font-bold text-[#f5f0e7]">
                        ₹{Number(inv.amount).toLocaleString('en-IN')}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Table */}
      {activeTab === 'payments' && (
        <div className="bg-[#0d1527] rounded-xl border border-white/10 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-[#0a0f1d] text-white/50 text-[10px] uppercase tracking-wider font-mono border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 font-semibold">Payment ID</th>
                  <th className="px-4 py-3 font-semibold">Client Name</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Invoice Ref</th>
                  <th className="px-4 py-3 font-semibold">Channel</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-white/50 font-serif">
                      Querying payment receipts from ledger...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-white/50 font-serif">
                      No cleared payments found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((pay) => (
                    <tr key={pay.payment_id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3 text-[#f5f0e7] font-bold">
                        #{pay.payment_id}
                      </td>

                      <td className="px-4 py-3 font-serif font-medium text-[#f5f0e7]">
                        {pay.client_name}
                      </td>

                      <td className="px-4 py-3 text-white/70">
                        {pay.payment_date ? String(pay.payment_date).slice(0, 10) : '—'}
                      </td>

                      <td className="px-4 py-3 text-white/80">
                        {pay.invoice_number || 'Direct Retainer'}
                      </td>

                      <td className="px-4 py-3 text-white/60">
                        {pay.method_name || 'Bank Transfer'}
                      </td>

                      <td className="px-4 py-3 font-bold text-emerald-400">
                        ₹{Number(pay.amount).toLocaleString('en-IN')}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                          {pay.payment_status || 'Completed'}
                        </span>
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
