import React, { useState } from 'react';
import { ReceiptDocument, ExpenseCategory, LineItem } from '../types/receipt';
import { ReceiptViewer } from './ReceiptViewer';
import { NibMascot } from './NibMascot';
import { motion } from 'motion/react';
import { X, Save, Plus, Trash2, AlertCircle } from 'lucide-react';

interface ReviewModalProps {
  receipt: ReceiptDocument;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedReceipt: ReceiptDocument) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Software & Cloud',
  'Office & Co-working',
  'Client Meals',
  'Travel & Transit',
  'Hardware & Tech',
  'Professional Services',
  'Utilities',
  'Other',
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  receipt,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<ReceiptDocument>({ ...receipt });

  const recalculateFromLines = (lines: LineItem[], rate: number) => {
    const subtotal = lines.reduce((acc, item) => acc + item.total, 0);
    const taxAmount = Number(((subtotal * rate) / 100).toFixed(2));
    const grandTotal = Number((subtotal + taxAmount).toFixed(2));
    return { subtotal, taxAmount, grandTotal };
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updatedLines = [...form.lineItems];
    const item = { ...updatedLines[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      item.total = Number((item.quantity * item.unitPrice).toFixed(2));
    }
    updatedLines[index] = item;

    const { subtotal, taxAmount, grandTotal } = recalculateFromLines(updatedLines, form.taxRate);

    setForm({
      ...form,
      lineItems: updatedLines,
      subtotal,
      taxAmount,
      grandTotal,
      calculatedTotal: grandTotal,
    });
  };

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: `li-${Date.now()}`,
      description: 'New Expense Line',
      quantity: 1,
      unitPrice: 100,
      total: 100,
    };
    const updatedLines = [...form.lineItems, newItem];
    const { subtotal, taxAmount, grandTotal } = recalculateFromLines(updatedLines, form.taxRate);
    setForm({
      ...form,
      lineItems: updatedLines,
      subtotal,
      taxAmount,
      grandTotal,
      calculatedTotal: grandTotal,
    });
  };

  const handleRemoveLineItem = (index: number) => {
    const updatedLines = form.lineItems.filter((_, i) => i !== index);
    const { subtotal, taxAmount, grandTotal } = recalculateFromLines(updatedLines, form.taxRate);
    setForm({
      ...form,
      lineItems: updatedLines,
      subtotal,
      taxAmount,
      grandTotal,
      calculatedTotal: grandTotal,
    });
  };

  const handleTaxRateChange = (rate: number) => {
    const taxAmount = Number(((form.subtotal * rate) / 100).toFixed(2));
    const grandTotal = Number((form.subtotal + taxAmount).toFixed(2));
    setForm({
      ...form,
      taxRate: rate,
      taxAmount,
      grandTotal,
      calculatedTotal: grandTotal,
    });
  };

  const handleFixMathDiscrepancy = () => {
    const expected = Number((form.subtotal + form.taxAmount).toFixed(2));
    setForm({
      ...form,
      grandTotal: expected,
      calculatedTotal: expected,
      auditIssues: form.auditIssues.map((i) =>
        i.type === 'MATH_MISMATCH' ? { ...i, fixed: true } : i
      ),
      status: 'verified',
    });
  };

  const handleSave = () => {
    const remainingIssues = form.auditIssues.filter((i) => !i.fixed);
    const updated = {
      ...form,
      status: remainingIssues.length === 0 ? ('verified' as const) : ('needs_repair' as const),
    };
    onSave(updated);
    onClose();
  };

  const mathGap = Math.abs(form.subtotal + form.taxAmount - form.grandTotal);
  const isMathValid = mathGap <= 0.05;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0D1912]/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#EBF0E8] border border-[#141D17]/10 rounded-[28px] shadow-2xl w-full max-w-5xl my-auto max-h-[92vh] flex flex-col overflow-hidden text-[#141D17]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#141D17]/8 flex items-center justify-between bg-white/60">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#141D17] tracking-tight">
              Audit Document Inspector
            </h2>
            <div className="text-xs text-[#5E6D64] font-mono mt-0.5">
              {form.fileName} · SHA-256: {form.fileHash.substring(0, 20)}...
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#5E6D64] hover:text-[#141D17] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: 3D Receipt View */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full mb-3">
              <NibMascot
                compact
                mood={isMathValid ? 'celebrating' : 'alert'}
                message={
                  isMathValid
                    ? 'Invariance verified: Line items balance with gross total.'
                    : `Discrepancy: Mathematical gap of ${form.currencySymbol}${mathGap.toFixed(2)}.`
                }
              />
            </div>
            <ReceiptViewer receipt={form} />
          </div>

          {/* Right Column: Editable Fields */}
          <div className="lg:col-span-7 space-y-5">
            {/* Anomaly Notice banner if any */}
            {!isMathValid && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs text-rose-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Arithmetic Variance:</span> Subtotal (
                    {form.currencySymbol}{form.subtotal.toFixed(2)}) + Tax ({form.currencySymbol}
                    {form.taxAmount.toFixed(2)}) ≠ Reported Total ({form.currencySymbol}
                    {form.grandTotal.toFixed(2)}).
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleFixMathDiscrepancy}
                  className="px-3 py-1 bg-[#82E6B3] hover:bg-[#72dca5] text-[#0E1713] rounded-full font-mono font-bold text-[11px] shrink-0 cursor-pointer shadow-2xs"
                >
                  Auto-Rebalance
                </motion.button>
              </div>
            )}

            {/* General Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-mono font-medium text-[#5E6D64] mb-1">
                  Vendor / Counterparty
                </label>
                <input
                  type="text"
                  value={form.vendorName}
                  onChange={(e) => setForm({ ...form, vendorName: e.target.value })}
                  className="w-full text-xs font-mono px-3.5 py-2 bg-white border border-[#141D17]/12 text-[#141D17] rounded-xl focus:ring-1 focus:ring-[#141D17] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#5E6D64] mb-1">
                  Asset Category
                </label>
                <select
                  value={form.vendorCategory}
                  onChange={(e) =>
                    setForm({ ...form, vendorCategory: e.target.value as ExpenseCategory })
                  }
                  className="w-full text-xs font-mono px-3.5 py-2 bg-white border border-[#141D17]/12 text-[#141D17] rounded-xl focus:ring-1 focus:ring-[#141D17] focus:outline-hidden"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#5E6D64] mb-1">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full text-xs font-mono px-3.5 py-2 bg-white border border-[#141D17]/12 text-[#141D17] rounded-xl focus:ring-1 focus:ring-[#141D17] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#5E6D64] mb-1">
                  Invoice Reference Number
                </label>
                <input
                  type="text"
                  value={form.invoiceNumber}
                  onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                  className="w-full text-xs font-mono px-3.5 py-2 bg-white border border-[#141D17]/12 text-[#141D17] rounded-xl focus:ring-1 focus:ring-[#141D17] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono font-medium text-[#5E6D64] mb-1">
                  GSTIN / Tax ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 29AABCS1429B1Z5"
                  value={form.taxId}
                  onChange={(e) => setForm({ ...form, taxId: e.target.value.toUpperCase() })}
                  className="w-full text-xs font-mono uppercase px-3.5 py-2 bg-white border border-[#141D17]/12 text-[#141D17] rounded-xl focus:ring-1 focus:ring-[#141D17] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Line Items Editor */}
            <div className="space-y-2 pt-2 border-t border-[#141D17]/8">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#5E6D64]">
                  Itemized Line Breakdown
                </span>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="text-xs font-mono font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  Add Line Item
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {form.lineItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#141D17]/8 text-xs"
                  >
                    <input
                      type="text"
                      value={item.description}
                      placeholder="Item description"
                      onChange={(e) =>
                        handleLineItemChange(idx, 'description', e.target.value)
                      }
                      className="flex-1 px-3 py-1 bg-[#EBF0E8]/50 border border-[#141D17]/8 rounded-lg text-xs text-[#141D17]"
                    />
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleLineItemChange(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-14 px-2 py-1 bg-[#EBF0E8]/50 border border-[#141D17]/8 rounded-lg text-xs font-mono text-center text-[#141D17]"
                      title="Qty"
                    />
                    <span className="text-[#5E6D64]">×</span>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleLineItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1 bg-[#EBF0E8]/50 border border-[#141D17]/8 rounded-lg text-xs font-mono text-right text-[#141D17]"
                      title="Unit Price"
                    />
                    <span className="text-[#141D17] font-mono font-bold w-20 text-right">
                      {form.currencySymbol}{item.total.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(idx)}
                      className="text-[#5E6D64] hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Box */}
            <div className="bg-white border border-[#141D17]/8 rounded-2xl p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-[#5E6D64]">
                <span>Subtotal (Line Items Sum):</span>
                <span className="font-bold text-[#141D17]">
                  {form.currencySymbol}{form.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#5E6D64]">
                <div className="flex items-center gap-2">
                  <span>Applicable Tax Rate:</span>
                  <select
                    value={form.taxRate}
                    onChange={(e) => handleTaxRateChange(parseFloat(e.target.value) || 0)}
                    className="bg-[#EBF0E8] border border-[#141D17]/10 text-[#141D17] rounded-lg px-2.5 py-0.5 text-xs font-mono"
                  >
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST (Standard)</option>
                    <option value="28">28% GST</option>
                  </select>
                </div>
                <span className="font-bold text-[#141D17]">
                  {form.currencySymbol}{form.taxAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#141D17]/8 text-sm font-bold">
                <span className="text-[#141D17]">Gross Total:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#5E6D64] font-normal">
                    {form.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.grandTotal}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        grandTotal: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={`w-28 px-2 py-1 text-right rounded-lg font-bold font-mono text-sm border ${
                      isMathValid
                        ? 'border-[#141D17]/15 bg-[#EBF0E8] text-[#141D17]'
                        : 'border-rose-400 bg-rose-50 text-rose-800'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#141D17]/8 bg-white/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono font-medium text-[#5E6D64] hover:text-[#141D17] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            className="px-6 py-2.5 text-xs font-mono font-bold rounded-full bg-[#82E6B3] hover:bg-[#72dca5] text-[#0E1713] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save & Reconcile Ledger</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
