import React, { useState, useRef } from 'react';
import { ReceiptDocument } from '../types/receipt';
import { CheckCircle2, AlertTriangle, ShieldCheck, FileText, Sparkles } from 'lucide-react';

interface ReceiptViewerProps {
  receipt: ReceiptDocument;
  onEditField?: (fieldName: string) => void;
  onLaunchRepair?: (receipt: ReceiptDocument) => void;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  receipt,
  onEditField,
  onLaunchRepair,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // gentle tilt: max +/- 7 degrees
    const rotateY = ((x - centerX) / centerX) * 7;
    const rotateX = -((y - centerY) / centerY) * 7;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const hasMathMismatch = receipt.auditIssues.some(
    (i) => i.type === 'MATH_MISMATCH' && !i.fixed
  );
  const hasTaxMissing = receipt.auditIssues.some(
    (i) => i.type === 'MISSING_TAX_ID' && !i.fixed
  );

  return (
    <div className="perspective-1000 w-full flex justify-center py-2">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(1.015)`
            : 'rotateX(0deg) rotateY(0deg) scale(1)',
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
        }}
        className="w-full max-w-md bg-white border border-slate-300 rounded-sm shadow-xl relative preserve-3d transition-shadow overflow-hidden text-slate-800"
      >
        {/* Paper fold crease texture line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.03)]" />

        {/* Verification / Needs-Repair Stamp */}
        {receipt.status === 'verified' && (
          <div className="absolute right-6 top-16 pointer-events-none select-none z-20">
            <div className="animate-stamp border-2 border-emerald-600 text-emerald-700 font-mono font-extrabold text-xs tracking-widest px-3 py-1 rounded rotate-[-12deg] bg-emerald-50/70 backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              CA VERIFIED
            </div>
          </div>
        )}

        {receipt.status === 'needs_repair' && (
          <div className="absolute right-6 top-16 pointer-events-none select-none z-20">
            <div className="animate-stamp border-2 border-rose-600 text-rose-700 font-mono font-extrabold text-xs tracking-widest px-3 py-1 rounded rotate-[-10deg] bg-rose-50/70 backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              FLAGGED AUDIT
            </div>
          </div>
        )}

        {/* Receipt Header */}
        <div className="p-6 pb-4 border-b border-dashed border-slate-300 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              Tax Invoice Document
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {receipt.vendorName}
          </h3>
          <div className="text-xs text-slate-500 mt-0.5">
            {receipt.visualData?.storeLocation || 'Commercial Establishment'}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 font-mono">
            <span>#{receipt.invoiceNumber}</span>
            <span>{receipt.date}</span>
          </div>

          {/* Tax / GSTIN display */}
          <div
            onClick={() => onEditField && onEditField('taxId')}
            className={`mt-2 py-1 px-2 text-xs font-mono rounded flex items-center justify-between cursor-pointer transition-colors ${
              hasTaxMissing
                ? 'bg-amber-50 text-amber-900 border border-amber-300'
                : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
            }`}
          >
            <span className="text-[11px] text-slate-400 uppercase">GSTIN / TAX ID:</span>
            <span className="font-semibold">
              {receipt.taxId || 'NOT ON FILE (CLICK TO ADD)'}
            </span>
          </div>
        </div>

        {/* Line Items List */}
        <div className="p-6 py-4 space-y-2.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex justify-between pb-1 border-b border-slate-200">
            <span>Description</span>
            <span>Total</span>
          </div>

          {receipt.lineItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-start text-xs font-mono text-slate-700"
            >
              <div className="pr-4 flex-1">
                <div className="font-medium text-slate-800">{item.description}</div>
                {item.quantity > 1 && (
                  <div className="text-[10px] text-slate-400">
                    {item.quantity} × {receipt.currencySymbol}{item.unitPrice.toFixed(2)}
                  </div>
                )}
              </div>
              <div className="font-semibold text-slate-900 tabular-nums">
                {receipt.currencySymbol}{item.total.toFixed(2)}
              </div>
            </div>
          ))}

          {receipt.lineItems.length === 0 && (
            <div className="text-xs text-slate-400 text-center py-2 italic font-mono">
              Line items extracted from receipt breakdown
            </div>
          )}
        </div>

        {/* Totals & Tax Calculation Breakdown */}
        <div className="p-6 pt-3 pb-4 bg-slate-50/70 border-t border-dashed border-slate-300 font-mono text-xs space-y-1.5">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal:</span>
            <span className="tabular-nums">
              {receipt.currencySymbol}{receipt.subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-slate-500">
            <span>Tax ({receipt.taxRate}% GST/VAT):</span>
            <span className="tabular-nums">
              {receipt.currencySymbol}{receipt.taxAmount.toFixed(2)}
            </span>
          </div>

          {/* Grand Total Row with Mismatch Alert */}
          <div
            onClick={() => onEditField && onEditField('grandTotal')}
            className={`flex justify-between items-center text-sm font-bold pt-2 mt-1 border-t border-slate-200 cursor-pointer ${
              hasMathMismatch
                ? 'text-rose-600 bg-rose-50 -mx-2 px-2 py-1 rounded border border-rose-300'
                : 'text-slate-900'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span>Grand Total:</span>
              {hasMathMismatch && (
                <span className="text-[10px] bg-rose-100 text-rose-700 px-1 rounded uppercase font-semibold">
                  Mismatch
                </span>
              )}
            </div>
            <span className="text-base tabular-nums">
              {receipt.currencySymbol}{receipt.grandTotal.toFixed(2)}
            </span>
          </div>

          {hasMathMismatch && (
            <div className="text-[11px] text-rose-600 pt-1 flex items-center justify-between">
              <span>Expected arithmetic: {receipt.currencySymbol}{receipt.calculatedTotal.toFixed(2)}</span>
              {onLaunchRepair && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLaunchRepair(receipt);
                  }}
                  className="underline font-semibold hover:text-rose-800"
                >
                  Quick Repair
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Barcode & Security Hash */}
        <div className="p-6 pt-3 pb-5 text-center border-t border-slate-200 bg-white">
          <div className="flex justify-center mb-1">
            {/* Visual Barcode bars */}
            <div className="flex items-center gap-[2px] h-9">
              {[4, 2, 5, 2, 1, 4, 3, 2, 5, 1, 3, 4, 2, 5, 2, 4, 1, 3, 2, 4, 5, 2, 3, 1, 4, 2, 5].map((w, i) => (
                <div
                  key={i}
                  style={{ width: `${w}px` }}
                  className={`h-full ${i % 3 === 0 ? 'bg-slate-800' : 'bg-slate-900'}`}
                />
              ))}
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 tracking-wider">
            {receipt.visualData?.barcodeDigits || '8901234567891'}
          </div>

          <div className="text-[9px] font-mono text-slate-400 mt-2 truncate max-w-xs mx-auto">
            SHA256: {receipt.fileHash.substring(0, 24)}...
          </div>
        </div>

        {/* Serrated Bottom Edge */}
        <div className="receipt-serrated-bottom h-2 w-full" />
      </div>
    </div>
  );
};
