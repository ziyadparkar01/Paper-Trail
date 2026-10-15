import React from 'react';
import { ReceiptDocument, AuditIssue } from '../types/receipt';
import { NibMascot } from './NibMascot';
import { AlertTriangle, CheckCircle, Wrench, ArrowRight, ShieldAlert, Sparkles, Hash } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface RepairMissionsProps {
  receipts: ReceiptDocument[];
  onApplyFix: (receiptId: string, issueId: string, fixAction: string, newValue?: any) => void;
  onOpenReceipt: (receipt: ReceiptDocument) => void;
  onUnlockStamp?: (stampId: string) => void;
}

export const RepairMissions: React.FC<RepairMissionsProps> = ({
  receipts,
  onApplyFix,
  onOpenReceipt,
  onUnlockStamp,
}) => {
  const allActiveIssues: { receipt: ReceiptDocument; issue: AuditIssue }[] = [];
  receipts.forEach((r) => {
    r.auditIssues.forEach((issue) => {
      if (!issue.fixed) {
        allActiveIssues.push({ receipt: r, issue });
      }
    });
  });

  const handleResolveIssue = (receiptId: string, issueId: string, action: string, val?: any) => {
    onApplyFix(receiptId, issueId, action, val);

    if (allActiveIssues.length <= 1) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      if (onUnlockStamp) {
        onUnlockStamp('stamp-audit-ace');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Top Briefing with Nib */}
      <NibMascot
        mood={allActiveIssues.length > 0 ? 'alert' : 'celebrating'}
        message={
          allActiveIssues.length > 0
            ? `${allActiveIssues.length} ledger variance item${allActiveIssues.length > 1 ? 's' : ''} require reconciliation before final CA signoff.`
            : "Zero variances detected. All ledger records satisfy mathematical invariance standards."
        }
        subMessage={
          allActiveIssues.length > 0
            ? "Reconciling these ensures zero audit queries from tax authorities and confirms complete Input Tax Credit (ITC) eligibility."
            : "The General Ledger is ready for institutional export and Chartered Accountant submission."
        }
      />

      {/* Zero Variance State */}
      {allActiveIssues.length === 0 && (
        <div className="bg-white/80 border border-emerald-200/80 rounded-3xl p-10 text-center shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#141D17] tracking-tight">
            Ledger Invariance Verified
          </h3>
          <p className="text-xs text-[#5E6D64] max-w-md mx-auto mt-1 font-mono">
            Every transaction sum matches line items, tax IDs conform to 15-character GST rules, and no duplicate hashes exist.
          </p>
        </div>
      )}

      {/* Variance Resolution Cards */}
      {allActiveIssues.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#5E6D64]">
            <span>Pending Variance Tickets ({allActiveIssues.length})</span>
            <span>Deterministic Smart Audit</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {allActiveIssues.map(({ receipt, issue }) => {
              const isMath = issue.type === 'MATH_MISMATCH';
              const isDuplicate = issue.type === 'DUPLICATE_RECEIPT';
              const isTax = issue.type === 'MISSING_TAX_ID';

              return (
                <motion.div
                  key={`${receipt.id}-${issue.id}`}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/85 border border-[#141D17]/8 rounded-2xl p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            issue.severity === 'critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {issue.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[#141D17]/20">·</span>
                        <span className="text-xs font-bold text-[#141D17]">
                          {receipt.vendorName}
                        </span>
                        <span className="text-[#141D17]/20">·</span>
                        <span className="text-xs text-[#5E6D64] font-mono">
                          {receipt.date}
                        </span>
                      </div>

                      <h4 className="text-lg font-serif font-bold text-[#141D17] flex items-center gap-2">
                        {isMath && <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />}
                        {isDuplicate && <Hash className="w-4 h-4 text-rose-700 shrink-0" />}
                        {isTax && <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />}
                        {issue.title}
                      </h4>

                      <p className="text-xs text-[#5E6D64] leading-relaxed font-sans">
                        {issue.description}
                      </p>

                      {/* Monospace Arithmetic Breakdown */}
                      {isMath && (
                        <div className="bg-[#EBF0E8] border border-[#141D17]/8 rounded-xl p-3.5 font-mono text-xs flex flex-wrap gap-5 text-[#141D17]">
                          <div>
                            <span className="text-[#5E6D64] text-[10px] uppercase block">Sum of Line Items:</span>
                            <span className="font-semibold">{receipt.currencySymbol}{receipt.subtotal.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[#5E6D64] text-[10px] uppercase block">Tax ({receipt.taxRate}%):</span>
                            <span className="font-semibold">{receipt.currencySymbol}{receipt.taxAmount.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[#5E6D64] text-[10px] uppercase block">Calculated Invariance:</span>
                            <span className="font-semibold text-emerald-800">
                              {receipt.currencySymbol}{receipt.calculatedTotal.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#5E6D64] text-[10px] uppercase block">Reported on Bill:</span>
                            <span className="font-semibold text-rose-700 line-through">
                              {receipt.currencySymbol}{receipt.grandTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Resolution Actions */}
                    <div className="flex sm:flex-col items-stretch justify-end gap-2.5 shrink-0 font-mono text-xs">
                      {isMath && (
                        <motion.button
                          whileHover={{ y: -1, scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() =>
                            handleResolveIssue(
                              receipt.id,
                              issue.id,
                              'FIX_MATH_TOTAL',
                              receipt.calculatedTotal
                            )
                          }
                          className="px-4 py-2 font-bold rounded-full bg-gradient-to-r from-[#82E6B3] to-[#6ce0a4] hover:from-[#72dca5] hover:to-[#5fd497] text-[#0E1713] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:shadow-sm border border-[#141D17]/12"
                        >
                          <Wrench className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Rebalance to {receipt.currencySymbol}{receipt.calculatedTotal.toFixed(2)}</span>
                        </motion.button>
                      )}

                      {isTax && (
                        <motion.button
                          whileHover={{ y: -1, scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() =>
                            handleResolveIssue(
                              receipt.id,
                              issue.id,
                              'SET_TAX_ID',
                              '29AAAAA0000A1Z5'
                            )
                          }
                          className="px-4 py-2 font-bold rounded-full bg-gradient-to-r from-[#82E6B3] to-[#6ce0a4] hover:from-[#72dca5] hover:to-[#5fd497] text-[#0E1713] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:shadow-sm border border-[#141D17]/12"
                        >
                          <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Assign Valid GSTIN</span>
                        </motion.button>
                      )}

                      {isDuplicate && (
                        <motion.button
                          whileHover={{ y: -1, scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() =>
                            handleResolveIssue(receipt.id, issue.id, 'DISMISS_DUPLICATE')
                          }
                          className="px-4 py-2 font-bold rounded-full bg-rose-700 hover:bg-rose-800 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-rose-800"
                        >
                          Confirm Duplicate
                        </motion.button>
                      )}

                      <motion.button
                        whileHover={{ y: -1, scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onOpenReceipt(receipt)}
                        className="px-4 py-2 font-semibold rounded-full border border-[#141D17]/15 bg-white hover:bg-[#FAFBF9] text-[#141D17] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
                      >
                        <span>Inspect Document</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#5E6D64]" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};
