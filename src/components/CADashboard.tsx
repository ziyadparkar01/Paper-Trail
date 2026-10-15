import React, { useState } from 'react';
import { ReceiptDocument } from '../types/receipt';
import { exportToCACSV, exportJSONVault, generatePrintableCASummary } from '../utils/exportUtils';
import { AnimatedCounter } from './AnimatedCounter';
import { motion } from 'motion/react';
import {
  Download,
  Printer,
  FileSpreadsheet,
  ShieldCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface CADashboardProps {
  receipts: ReceiptDocument[];
  onOpenReceipt: (receipt: ReceiptDocument) => void;
  onLaunchRepair: (receipt: ReceiptDocument) => void;
}

export const CADashboard: React.FC<CADashboardProps> = ({
  receipts,
  onOpenReceipt,
  onLaunchRepair,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'needs_repair'>('all');

  // Metrics
  const totalSpend = receipts.reduce((acc, r) => acc + r.grandTotal, 0);
  const totalTaxClaimable = receipts
    .filter((r) => r.taxId && r.taxAmount > 0)
    .reduce((acc, r) => acc + r.taxAmount, 0);
  const verifiedCount = receipts.filter((r) => r.status === 'verified').length;
  const flaggedCount = receipts.filter((r) => r.status === 'needs_repair').length;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  receipts.forEach((r) => {
    categoryMap[r.vendorCategory] = (categoryMap[r.vendorCategory] || 0) + r.grandTotal;
  });

  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch =
      r.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.taxId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || r.vendorCategory === selectedCategory;
    const matchesStatus =
      statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handlePrintSummary = () => {
    const html = generatePrintableCASummary(receipts, 'Private Syndicate / Freelance Firm');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Editorial Headline & Value Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#5E6D64] font-semibold">
              Institutional General Ledger
            </span>
            <span className="text-[#141D17]/20">·</span>
            <span className="font-cursive text-base text-emerald-800 font-bold">
              Tax Season Portfolio
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#141D17] tracking-tight mt-1 flex items-center gap-2">
            <span>General Financial Ledger</span>
            <span className="font-signature text-2xl text-[#5E6D64] font-normal hidden lg:inline">
              Private Syndicate
            </span>
          </h1>
        </div>

        {/* Action Controls with Reshaped Luxury Buttons */}
        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => exportToCACSV(receipts)}
            className="px-4 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-[#141D17] to-[#1f2d24] text-[#82E6B3] hover:text-[#9df2c7] transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md border border-[#82E6B3]/30"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="font-mono tracking-tight uppercase">Export CA CSV</span>
          </motion.button>

          <motion.button
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handlePrintSummary}
            className="px-4 py-2 text-xs font-bold rounded-full border border-[#141D17]/15 bg-white/90 hover:bg-white text-[#141D17] transition-all flex items-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#5E6D64]" />
            <span className="font-mono tracking-tight uppercase">Print Schedule</span>
          </motion.button>
        </div>
      </div>

      {/* Luxury Neo-Fintech KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Processed Volume */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-[#DEE6DC]/90 border border-[#141D17]/8 rounded-2xl p-5 shadow-xs transition-shadow"
        >
          <div className="text-[10px] font-mono tracking-wider text-[#5E6D64] uppercase font-semibold">
            Audited Ledger Capital
          </div>
          <div className="text-3xl font-serif font-bold text-[#141D17] mt-1.5">
            <AnimatedCounter value={totalSpend} prefix="₹" />
          </div>
          <div className="text-xs text-[#5E6D64] mt-1 flex items-center gap-1 font-mono">
            <span>{receipts.length} transactions processed</span>
          </div>
        </motion.div>

        {/* Input Tax Credit (ITC) */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-white/70 border border-[#141D17]/8 rounded-2xl p-5 shadow-xs relative overflow-hidden"
        >
          <div className="text-[10px] font-mono tracking-wider text-[#141D17] uppercase font-semibold flex items-center justify-between">
            <span>Input Tax Credit (ITC)</span>
            <span className="text-[9px] bg-[#82E6B3] text-[#0E1713] px-2 py-0.5 rounded-full font-bold">
              GSTR-2B
            </span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#141D17] mt-1.5 text-emerald-800">
            <AnimatedCounter value={totalTaxClaimable} prefix="₹" />
          </div>
          <div className="text-xs text-[#5E6D64] mt-1 font-mono">
            Direct output tax offset yield
          </div>
        </motion.div>

        {/* Arithmetic Reconciliation Rate */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-[#DEE6DC]/90 border border-[#141D17]/8 rounded-2xl p-5 shadow-xs"
        >
          <div className="text-[10px] font-mono tracking-wider text-[#5E6D64] uppercase font-semibold">
            Arithmetic Invariance
          </div>
          <div className="text-3xl font-serif font-bold text-[#141D17] mt-1.5">
            {((verifiedCount / (receipts.length || 1)) * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-[#5E6D64] mt-1 font-mono">
            {flaggedCount === 0 ? 'Zero math discrepancies' : `${flaggedCount} variance flagged`}
          </div>
        </motion.div>

        {/* Vault Status */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-white/70 border border-[#141D17]/8 rounded-2xl p-5 shadow-xs"
        >
          <div className="text-[10px] font-mono tracking-wider text-[#5E6D64] uppercase font-semibold">
            Security Enclave
          </div>
          <div className="text-3xl font-serif font-bold text-[#141D17] mt-1.5 flex items-center gap-2">
            <span>Air-Gapped</span>
          </div>
          <div className="text-xs text-emerald-700 font-mono mt-1 font-medium">
            AES-256 · 0 bytes cloud egress
          </div>
        </motion.div>
      </div>

      {/* Asset Class Allocation Strip */}
      <div className="bg-[#DEE6DC]/60 border border-[#141D17]/8 rounded-2xl p-5 shadow-xs">
        <div className="text-[10px] font-mono tracking-wider text-[#5E6D64] uppercase font-semibold mb-3">
          Capital Allocation by Expense Category
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(categoryMap).map(([category, amount]) => {
            const percentage = ((amount / (totalSpend || 1)) * 100).toFixed(1);
            return (
              <div
                key={category}
                className="bg-white/80 border border-[#141D17]/6 rounded-xl p-3 shadow-2xs"
              >
                <div className="text-xs font-medium text-[#5E6D64] truncate">{category}</div>
                <div className="text-sm font-bold font-mono text-[#141D17] mt-1 tabular-nums">
                  ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-[#5E6D64] font-mono mt-0.5">
                  {percentage}% allocation
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* High-Density Ledger Table */}
      <div className="bg-white/85 border border-[#141D17]/8 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#5E6D64] absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search vendor, invoice reference, or GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-[#EBF0E8]/70 border border-[#141D17]/10 text-[#141D17] rounded-full focus:ring-1 focus:ring-[#141D17] focus:outline-hidden placeholder:text-[#5E6D64] font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#DEE6DC] p-1 rounded-full border border-[#141D17]/6 text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-[#141D17] font-semibold shadow-2xs'
                  : 'text-[#5E6D64] hover:text-[#141D17]'
              }`}
            >
              All ({receipts.length})
            </button>
            <button
              onClick={() => setStatusFilter('verified')}
              className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                statusFilter === 'verified'
                  ? 'bg-white text-emerald-800 font-semibold shadow-2xs'
                  : 'text-[#5E6D64] hover:text-[#141D17]'
              }`}
            >
              Verified ({verifiedCount})
            </button>
            <button
              onClick={() => setStatusFilter('needs_repair')}
              className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                statusFilter === 'needs_repair'
                  ? 'bg-white text-rose-800 font-semibold shadow-2xs'
                  : 'text-[#5E6D64] hover:text-[#141D17]'
              }`}
            >
              Variance ({flaggedCount})
            </button>
          </div>
        </div>

        {/* Ledger Grid */}
        <div className="overflow-x-auto border border-[#141D17]/8 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EBF0E8] text-[#5E6D64] font-mono uppercase tracking-wider text-[10px] border-b border-[#141D17]/8">
              <tr>
                <th className="py-2.5 px-3.5">Date</th>
                <th className="py-2.5 px-3.5">Vendor / Merchant</th>
                <th className="py-2.5 px-3.5">Category</th>
                <th className="py-2.5 px-3.5">GSTIN / Tax ID</th>
                <th className="py-2.5 px-3.5 text-right">Tax (ITC)</th>
                <th className="py-2.5 px-3.5 text-right">Gross Total</th>
                <th className="py-2.5 px-3.5 text-center">Status</th>
                <th className="py-2.5 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141D17]/6">
              {filteredReceipts.map((r) => {
                const hasIssues = r.status === 'needs_repair';
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-[#DEE6DC]/40 transition-colors group cursor-pointer"
                    onClick={() => onOpenReceipt(r)}
                  >
                    <td className="py-2.5 px-3.5 font-mono text-[#5E6D64] whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-[#141D17]">
                      <div>{r.vendorName}</div>
                      <div className="text-[10px] text-[#5E6D64] font-mono">
                        #{r.invoiceNumber}
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 text-[#5E6D64] whitespace-nowrap">
                      {r.vendorCategory}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-[#5E6D64] whitespace-nowrap">
                      {r.taxId || <span className="text-[#88998D] italic">Unregistered</span>}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-emerald-800 font-semibold whitespace-nowrap">
                      {r.currencySymbol}{r.taxAmount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#141D17] tabular-nums whitespace-nowrap">
                      {r.currencySymbol}{r.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3.5 text-center whitespace-nowrap font-mono text-[10px]">
                      {hasIssues ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Variance
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenReceipt(r);
                          }}
                          className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-full bg-[#DEE6DC] hover:bg-[#d0dbce] text-[#141D17] border border-[#141D17]/10 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                        >
                          Inspect
                        </button>
                        {hasIssues && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onLaunchRepair(r);
                            }}
                            className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-full bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredReceipts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#5E6D64] font-mono italic">
                    No transactions match the active query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
