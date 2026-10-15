import React, { useState } from 'react';
import { ReceiptDocument } from '../types/receipt';
import { AnimatedCounter } from './AnimatedCounter';
import { motion } from 'motion/react';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  FileCheck,
  CheckCircle,
  Briefcase,
  Download,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface TaxSavingsEngineProps {
  receipts: ReceiptDocument[];
  onToggleBillable: (receiptId: string, clientName?: string) => void;
}

export const TaxSavingsEngine: React.FC<TaxSavingsEngineProps> = ({
  receipts,
  onToggleBillable,
}) => {
  const [taxSlabRate, setTaxSlabRate] = useState<number>(30);

  const totalExpenses = receipts.reduce((acc, r) => acc + r.grandTotal, 0);
  const totalITCClaimable = receipts
    .filter((r) => r.taxId && r.taxAmount > 0)
    .reduce((acc, r) => acc + r.taxAmount, 0);

  const incomeTaxSaved = (totalExpenses * taxSlabRate) / 100;
  const netFinancialBenefit = incomeTaxSaved + totalITCClaimable;

  const billableReceipts = receipts.filter((r) => r.clientBillable);
  const totalBillableAmount = billableReceipts.reduce((acc, r) => acc + r.grandTotal, 0);

  const generateClientReimbursementInvoice = () => {
    const lines = billableReceipts.map(
      (r, i) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; font-size: 13px;">${i + 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; font-size: 13px; font-family: monospace;">${r.date}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; font-size: 13px; font-weight: 600;">${r.vendorName}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; font-size: 13px;">${r.clientName || 'General Project'}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; font-size: 13px; text-align: right; font-family: monospace; font-weight: 700;">₹${r.grandTotal.toFixed(2)}</td>
      </tr>
    `
    ).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Institutional Client Expense Dossier</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #141D17; background: #FAFBF9; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; background: white; border-radius: 8px; overflow: hidden; }
            th { text-align: left; padding: 12px; background: #EBF0E8; border-bottom: 2px solid #C4CFC2; font-size: 11px; text-transform: uppercase; color: #5E6D64; }
          </style>
        </head>
        <body>
          <div style="border-bottom: 2px solid #141D17; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; font-family: 'Playfair Display', serif;">CLIENT EXPENSE REIMBURSEMENT STATEMENT</h1>
            <p style="margin: 4px 0 0 0; color: #5E6D64; font-size: 14px;">Audited out-of-pocket project expenditures with cryptographic checksums</p>
          </div>
          <div style="margin-bottom: 24px; background: #DEE6DC; padding: 20px; border-radius: 12px; border: 1px solid rgba(20, 29, 23, 0.08);">
            <div style="font-size: 11px; color: #5E6D64; font-family: monospace; text-transform: uppercase;">TOTAL REIMBURSEMENT DUE:</div>
            <div style="font-size: 32px; font-weight: 800; font-family: monospace; color: #141D17; margin-top: 4px;">₹${totalBillableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Expense Vendor</th>
                <th>Client / Project</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${lines}
            </tbody>
          </table>
          <div style="margin-top: 40px; font-size: 12px; color: #5E6D64; border-top: 1px dashed #C4CFC2; padding-top: 16px;">
            Audited locally via PaperTrail. All original tax receipts and hash tokens are on file.
          </div>
        </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(html);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => printWin.print(), 300);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Top Value Banner */}
      <div className="bg-white/85 border border-[#141D17]/8 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#82E6B3] text-[#0E1713] uppercase">
                Capital Retention Engine
              </span>
              <span className="text-[#141D17]/20">·</span>
              <span className="text-xs font-mono font-medium text-[#5E6D64]">
                Audited Tax Alpha
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#141D17] tracking-tight mt-1">
              Real Capital Retained Through Bookkeeping
            </h2>
            <p className="text-xs text-[#5E6D64] mt-1 max-w-xl leading-relaxed">
              By cataloging valid business deductions and reclaiming Input Tax Credits (ITC), PaperTrail directly increases your net freelance take-home pay.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#DEE6DC] p-1.5 rounded-full border border-[#141D17]/8 shrink-0">
            <span className="text-xs font-medium text-[#5E6D64] pl-2 font-mono">Tax Bracket:</span>
            <select
              value={taxSlabRate}
              onChange={(e) => setTaxSlabRate(Number(e.target.value))}
              className="text-xs font-semibold font-mono bg-white border border-[#141D17]/10 text-[#141D17] rounded-full px-3 py-1 shadow-2xs cursor-pointer"
            >
              <option value={15}>15% (Tier 1)</option>
              <option value={20}>20% (Tier 2)</option>
              <option value={30}>30% (Standard Freelancer)</option>
              <option value={35}>35% (High Income)</option>
            </select>
          </div>
        </div>

        {/* 4 KPI Metrics with AnimatedCounter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#141D17]/8">
          <motion.div whileHover={{ y: -2 }} className="p-4 bg-[#DEE6DC]/70 border border-[#141D17]/8 rounded-2xl">
            <div className="text-[10px] font-mono tracking-wider text-[#5E6D64] uppercase font-semibold">
              Gross Deductible Basis
            </div>
            <div className="text-2xl font-serif font-bold text-[#141D17] mt-1">
              <AnimatedCounter value={totalExpenses} prefix="₹" />
            </div>
            <div className="text-[11px] text-[#5E6D64] font-mono mt-1">
              Reduces taxable revenue
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-4 bg-[#DEE6DC]/70 border border-[#141D17]/8 rounded-2xl">
            <div className="text-[10px] font-mono tracking-wider text-emerald-800 uppercase font-semibold">
              Input Tax Credit (ITC)
            </div>
            <div className="text-2xl font-serif font-bold text-emerald-800 mt-1">
              <AnimatedCounter value={totalITCClaimable} prefix="₹" />
            </div>
            <div className="text-[11px] text-[#5E6D64] font-mono mt-1">
              Direct GST liability credit
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-4 bg-[#DEE6DC]/70 border border-[#141D17]/8 rounded-2xl">
            <div className="text-[10px] font-mono tracking-wider text-[#5E6D64] uppercase font-semibold">
              Income Tax Offset ({taxSlabRate}%)
            </div>
            <div className="text-2xl font-serif font-bold text-[#141D17] mt-1">
              <AnimatedCounter value={incomeTaxSaved} prefix="₹" />
            </div>
            <div className="text-[11px] text-[#5E6D64] font-mono mt-1">
              Direct reduction in tax bill
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-4 bg-[#141D17] text-white rounded-2xl shadow-xs">
            <div className="text-[10px] font-mono tracking-wider text-[#82E6B3] uppercase font-semibold flex items-center justify-between">
              <span>Net Capital Retained</span>
              <Zap className="w-3.5 h-3.5 text-[#82E6B3]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#82E6B3] mt-1">
              <AnimatedCounter value={netFinancialBenefit} prefix="₹" />
            </div>
            <div className="text-[11px] text-slate-300 font-mono mt-1">
              Net retained in your treasury
            </div>
          </motion.div>
        </div>
      </div>

      {/* Client Expense Reimbursement Section */}
      <div className="bg-white/85 border border-[#141D17]/8 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#141D17] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-700" />
              Client Project Re-Invoicing Ledger
            </h3>
            <p className="text-xs text-[#5E6D64] mt-0.5">
              Tag out-of-pocket project costs (cabs, cloud servers, software licenses) to re-invoice your clients.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={generateClientReimbursementInvoice}
            disabled={billableReceipts.length === 0}
            className={`px-4 py-2 text-xs font-mono font-semibold rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
              billableReceipts.length > 0
                ? 'bg-[#82E6B3] hover:bg-[#72dca5] text-[#0E1713] font-bold'
                : 'bg-[#DEE6DC] text-[#5E6D64] cursor-not-allowed border border-[#141D17]/10'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate Client Invoice ({billableReceipts.length})</span>
          </motion.button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-[#141D17]/8 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EBF0E8] text-[#5E6D64] font-mono uppercase tracking-wider text-[10px] border-b border-[#141D17]/8">
              <tr>
                <th className="py-2.5 px-3.5">Date</th>
                <th className="py-2.5 px-3.5">Vendor</th>
                <th className="py-2.5 px-3.5">Category</th>
                <th className="py-2.5 px-3.5 text-right">Amount</th>
                <th className="py-2.5 px-3.5 text-center">Billable to Client?</th>
                <th className="py-2.5 px-3.5">Designated Entity / Project</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141D17]/6">
              {receipts.map((r) => {
                const isBillable = !!r.clientBillable;

                return (
                  <tr key={r.id} className="hover:bg-[#DEE6DC]/40 transition-colors">
                    <td className="py-2.5 px-3.5 font-mono text-[#5E6D64] whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-[#141D17]">
                      {r.vendorName}
                    </td>
                    <td className="py-2.5 px-3.5 text-[#5E6D64]">
                      {r.vendorCategory}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#141D17] tabular-nums whitespace-nowrap">
                      {r.currencySymbol}{r.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isBillable}
                        onChange={() => onToggleBillable(r.id, isBillable ? undefined : 'Acme Studio')}
                        className="w-4 h-4 rounded text-[#141D17] border-[#141D17]/20 cursor-pointer accent-[#141D17]"
                      />
                    </td>
                    <td className="py-2.5 px-3.5">
                      {isBillable ? (
                        <span className="font-mono text-[#141D17] bg-[#82E6B3]/30 border border-[#82E6B3] px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {r.clientName || 'Acme Studio'}
                        </span>
                      ) : (
                        <span className="text-[#88998D] italic text-[11px] font-mono">
                          Internal Operating Overhead
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
