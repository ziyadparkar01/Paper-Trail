import React, { useState, useRef } from 'react';
import { FileUp, Sparkles, Shield, Lock, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  onLoadSamples: () => void;
  isProcessing?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesDropped,
  onLoadSamples,
  isProcessing = false,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesDropped(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesDropped(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-10 transition-all cursor-pointer text-center ${
          isDragActive
            ? 'border-[#141D17] bg-[#DEE6DC] scale-[1.005]'
            : 'border-[#141D17]/15 hover:border-[#141D17]/30 bg-[#DEE6DC]/40 hover:bg-[#DEE6DC]/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.csv,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-white border border-[#141D17]/10 flex items-center justify-center text-[#141D17] mb-3 shadow-xs">
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-[#141D17] border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileUp className="w-5 h-5 stroke-[2]" />
            )}
          </div>

          <h3 className="text-xl font-serif font-bold text-[#141D17] tracking-tight">
            {isProcessing ? 'Auditing documents in local memory...' : 'Ingest Financial Invoices & Receipts'}
          </h3>

          <p className="text-xs text-[#5E6D64] mt-1 max-w-sm leading-relaxed">
            Local vision model extracts vendor names, GST numbers, line items, and totals directly on your hardware.
          </p>

          <div className="flex items-center gap-3 mt-4 text-xs font-medium">
            <motion.span
              whileTap={{ scale: 0.96 }}
              className="px-4 py-2 rounded-full bg-[#82E6B3] hover:bg-[#72dca5] text-[#0E1713] font-semibold transition-colors shadow-xs"
            >
              Browse Local Files
            </motion.span>
            <span className="text-[#5E6D64]">or</span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                e.stopPropagation();
                onLoadSamples();
              }}
              className="px-4 py-2 rounded-full border border-[#141D17]/10 bg-white hover:bg-[#FAFBF9] text-[#141D17] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Load Freelancer Test Batch
            </motion.button>
          </div>
        </div>

        {/* Local Security Guarantees */}
        <div className="mt-6 pt-5 border-t border-[#141D17]/8 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-[#5E6D64]">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#141D17]" />
            <span className="text-[#141D17] font-semibold">Air-Gapped Vault</span>
          </div>
          <span className="text-[#141D17]/20">·</span>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#5E6D64]" />
            <span>Zero Third-Party Cloud Egress</span>
          </div>
          <span className="text-[#141D17]/20">·</span>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#5E6D64]" />
            <span>SHA-256 Duplication Barrier</span>
          </div>
        </div>
      </div>
    </div>
  );
};
